# Guide de déploiement des Frontends sur AWS

Ce guide explique comment déployer les applications frontend (backoffice-admin et marketing-site) sur AWS au lieu de Vercel.

## Table des matières

1. [Prérequis](#prérequis)
2. [Architecture AWS](#architecture-aws)
3. [Méthodes de déploiement](#méthodes-de-déploiement)
4. [Déploiement rapide](#déploiement-rapide)
5. [Configuration avancée](#configuration-avancée)
6. [Gestion des domaines personnalisés](#gestion-des-domaines-personnalisés)
7. [Dépannage](#dépannage)

---

## Prérequis

### 1. AWS CLI installé et configuré

```bash
# Installer AWS CLI (si pas déjà fait)
# Windows (via PowerShell)
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi

# macOS
brew install awscli

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configurer AWS CLI
aws configure
# Entrez vos credentials:
#   AWS Access Key ID: [votre-clé]
#   AWS Secret Access Key: [votre-secret]
#   Default region name: eu-central-1
#   Default output format: json
```

### 2. Permissions IAM requises

Votre utilisateur AWS doit avoir les permissions suivantes :
- `amplify:*` (pour AWS Amplify)
- `s3:*` (pour les buckets S3)
- `cloudfront:*` (pour CloudFront)
- `ecs:DescribeTasks`, `ecs:ListTasks` (pour récupérer les IPs des services)
- `ec2:DescribeNetworkInterfaces` (pour récupérer les IPs publiques)

### 3. Services backend déployés

Les services backend doivent être déployés sur AWS ECS avant de déployer les frontends :
- admin-gateway
- authz
- planning
- notifications
- geo-tracking
- storage-market
- client-onboarding
- core-orders
- affret-ia
- vigilance

---

## Architecture AWS

### Option 1: S3 + CloudFront (Recommandé pour sites statiques)

```
┌─────────────────┐
│   Utilisateur   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   CloudFront    │ ← Distribution CDN globale
│   (CDN)         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   S3 Bucket     │ ← Hébergement des fichiers statiques
│   (Static)      │
└─────────────────┘
```

**Avantages :**
- Coût très faible
- Performance excellente (CDN global)
- Scalabilité automatique
- Idéal pour Next.js avec `output: 'export'`

**Limitations :**
- Pas de SSR (Server-Side Rendering)
- Pas d'API routes Next.js
- Pas d'ISR (Incremental Static Regeneration)

### Option 2: AWS Amplify Hosting (Recommandé pour applications dynamiques)

```
┌─────────────────┐
│   Utilisateur   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  AWS Amplify    │ ← Service géré complet
│  Hosting        │ ← Support SSR, ISR, API routes
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   CloudFront    │ ← CDN intégré
└─────────────────┘
```

**Avantages :**
- Support complet de Next.js (SSR, ISR, API routes)
- Déploiement automatique depuis Git
- Certificats SSL automatiques
- CI/CD intégré
- Preview deployments
- Environnements multiples

**Coût :**
- ~5-15€/mois pour un petit projet
- Facturation au build time et trafic

---

## Méthodes de déploiement

### Méthode 1: S3 + CloudFront (Site statique)

**Script :** `infra/deploy-frontends-aws.sh`

Ce script :
1. Récupère les IPs des services backend depuis ECS
2. Build chaque application Next.js localement
3. Crée/met à jour les buckets S3
4. Upload les fichiers buildés sur S3
5. Crée/met à jour les distributions CloudFront
6. Configure le cache et les redirections

**Utilisation :**

```bash
cd infra
chmod +x deploy-frontends-aws.sh
./deploy-frontends-aws.sh
```

**Configuration :**

Les applications utilisent déjà `output: 'standalone'` dans `next.config.js`. Pour un déploiement statique pur, vous pouvez modifier temporairement :

```javascript
// apps/backoffice-admin/next.config.js ou apps/marketing-site/next.config.js
const nextConfig = {
  output: 'export', // Pour export statique S3
  // ... reste de la config
};
```

### Méthode 2: AWS Amplify Hosting (Application dynamique)

**Script :** `infra/deploy-frontends-aws-amplify.sh`

Ce script :
1. Récupère les IPs des services backend depuis ECS
2. Crée/met à jour les applications Amplify
3. Configure les variables d'environnement
4. Build et déploie les applications
5. Retourne les URLs de déploiement

**Utilisation :**

```bash
cd infra
chmod +x deploy-frontends-aws-amplify.sh
./deploy-frontends-aws-amplify.sh
```

### Méthode 3: Déploiement depuis Git (AWS Amplify - Recommandé pour production)

Cette méthode connecte directement votre repository Git à AWS Amplify pour des déploiements automatiques.

**Étapes :**

1. **Connecter le repository Git :**

```bash
# Pour backoffice-admin
aws amplify create-app \
  --name rt-backoffice-admin \
  --repository "https://github.com/votre-org/rt-technologie" \
  --oauth-token "YOUR_GITHUB_TOKEN" \
  --build-spec file://apps/backoffice-admin/amplify.yml \
  --region eu-central-1

# Pour marketing-site
aws amplify create-app \
  --name rt-marketing-site \
  --repository "https://github.com/votre-org/rt-technologie" \
  --oauth-token "YOUR_GITHUB_TOKEN" \
  --build-spec file://apps/marketing-site/amplify.yml \
  --region eu-central-1
```

2. **Créer une branche de déploiement :**

```bash
aws amplify create-branch \
  --app-id <APP_ID> \
  --branch-name main \
  --enable-auto-build true \
  --region eu-central-1
```

3. **Configurer les variables d'environnement :**

```bash
# Via la console AWS Amplify ou via CLI
aws amplify update-app \
  --app-id <APP_ID> \
  --environment-variables \
    NEXT_PUBLIC_ADMIN_GATEWAY_URL=http://3.76.34.154:3000 \
    NEXT_PUBLIC_AUTHZ_URL=http://18.156.174.103:3000 \
  --region eu-central-1
```

4. **Lancer le déploiement :**

```bash
aws amplify start-job \
  --app-id <APP_ID> \
  --branch-name main \
  --job-type RELEASE \
  --region eu-central-1
```

---

## Déploiement rapide

### Première fois

```bash
# 1. Vérifier que AWS CLI est configuré
aws sts get-caller-identity

# 2. Vérifier que les services backend sont déployés
aws ecs list-services --cluster rt-technologie-cluster --region eu-central-1

# 3. Lancer le déploiement (choisir une méthode)
cd infra

# Option A: S3 + CloudFront (sites statiques)
./deploy-frontends-aws.sh

# Option B: AWS Amplify (applications dynamiques)
./deploy-frontends-aws-amplify.sh
```

### Mises à jour ultérieures

Pour les mises à jour, il suffit de relancer le même script :

```bash
cd infra
./deploy-frontends-aws.sh  # ou ./deploy-frontends-aws-amplify.sh
```

---

## Configuration avancée

### Optimisation du build

Pour réduire le temps de build et la taille des bundles :

```javascript
// next.config.js
const nextConfig = {
  // ... config existante

  // Optimisations
  compress: true,
  poweredByHeader: false,
  generateEtags: true,

  // Tree shaking agressif
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.usedExports = true;
    }
    return config;
  },

  // Compression des images
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 an
  },
};
```

### Configuration CloudFront personnalisée

Pour modifier la configuration CloudFront :

```bash
# Récupérer l'ID de la distribution
aws cloudfront list-distributions --query "DistributionList.Items[?Comment=='Distribution for backoffice-admin'].Id" --output text

# Télécharger la config actuelle
aws cloudfront get-distribution-config --id <DISTRIBUTION_ID> > distribution-config.json

# Modifier le fichier JSON
# Puis mettre à jour
aws cloudfront update-distribution --id <DISTRIBUTION_ID> --if-match <ETAG> --distribution-config file://distribution-config.json
```

### Variables d'environnement par environnement

Créer plusieurs fichiers `.env` :
- `.env.development` - pour le développement local
- `.env.staging` - pour l'environnement de staging
- `.env.production` - pour la production

Modifier le script de déploiement pour utiliser le bon fichier :

```bash
# Dans le script de déploiement
ENVIRONMENT=${ENVIRONMENT:-production}
cp ".env.${ENVIRONMENT}" .env.production
```

---

## Gestion des domaines personnalisés

### Avec CloudFront

1. **Créer un certificat SSL dans ACM (us-east-1 requis pour CloudFront) :**

```bash
aws acm request-certificate \
  --domain-name "backoffice.rt-technologie.com" \
  --validation-method DNS \
  --region us-east-1
```

2. **Valider le certificat via DNS :**

Ajoutez les enregistrements CNAME fournis par ACM dans votre DNS.

3. **Configurer l'alias CloudFront :**

```bash
aws cloudfront update-distribution \
  --id <DISTRIBUTION_ID> \
  --aliases backoffice.rt-technologie.com \
  --viewer-certificate \
    ACMCertificateArn=arn:aws:acm:us-east-1:ACCOUNT:certificate/CERT_ID,\
    SSLSupportMethod=sni-only,\
    MinimumProtocolVersion=TLSv1.2_2021
```

4. **Configurer le DNS :**

```
Type: CNAME
Name: backoffice
Value: d1234567890abc.cloudfront.net
```

### Avec AWS Amplify

```bash
# Ajouter un domaine personnalisé
aws amplify create-domain-association \
  --app-id <APP_ID> \
  --domain-name rt-technologie.com \
  --sub-domain-settings prefix=backoffice,branchName=main \
  --region eu-central-1
```

Amplify gère automatiquement :
- Le certificat SSL
- La configuration DNS (si domaine géré par Route 53)
- Le renouvellement du certificat

---

## Dépannage

### Erreur: "Unable to locate credentials"

```bash
# Reconfigurer AWS CLI
aws configure

# Ou définir les variables d'environnement
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_DEFAULT_REGION=eu-central-1
```

### Erreur: "Access Denied" lors de la création du bucket S3

Vérifiez que votre utilisateur IAM a les permissions `s3:CreateBucket` et `s3:PutBucketPolicy`.

### Le site ne se charge pas après le déploiement

1. Vérifiez que la distribution CloudFront est déployée :
```bash
aws cloudfront get-distribution --id <DISTRIBUTION_ID> --query 'Distribution.Status'
```

2. Attendez que le status soit "Deployed" (peut prendre 15-20 minutes)

3. Invalidez le cache si nécessaire :
```bash
aws cloudfront create-invalidation --distribution-id <DISTRIBUTION_ID> --paths "/*"
```

### Variables d'environnement non prises en compte

Les variables d'environnement Next.js doivent commencer par `NEXT_PUBLIC_` pour être accessibles côté client.

```javascript
// ✅ Correct
NEXT_PUBLIC_API_URL=http://api.example.com

// ❌ Incorrect (pas accessible côté client)
API_URL=http://api.example.com
```

### Erreur de CORS depuis le frontend

Configurez les headers CORS sur vos services backend :

```javascript
// Dans votre API backend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://your-cloudfront-url.com');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
```

### Build échoue sur Amplify

Vérifiez les logs dans la console AWS Amplify :

```bash
aws amplify get-job \
  --app-id <APP_ID> \
  --branch-name main \
  --job-id <JOB_ID> \
  --region eu-central-1
```

---

## Migration depuis Vercel

Si vous migrez depuis Vercel :

1. **Exporter les variables d'environnement Vercel :**
```bash
vercel env pull .env.vercel
```

2. **Adapter les variables pour AWS** (déjà fait dans `.env.production`)

3. **Mettre à jour les URLs dans votre code** si nécessaire

4. **Tester localement :**
```bash
cd apps/backoffice-admin
npm run build
npm run start
```

5. **Déployer sur AWS** avec les scripts fournis

6. **Supprimer les projets Vercel** une fois la migration validée

---

## Coûts estimés

### S3 + CloudFront
- **Stockage S3 :** ~0.02€ par GB/mois
- **Transfert CloudFront :** ~0.085€ par GB pour l'Europe
- **Requêtes :** négligeable
- **Total estimé :** 5-10€/mois pour un site moyen

### AWS Amplify
- **Build minutes :** 0.01€ par minute
- **Hosting :** 0.15€ par GB de transfert
- **Storage :** 0.023€ par GB/mois
- **Total estimé :** 10-20€/mois pour un site moyen avec CI/CD

---

## Support et ressources

- [Documentation AWS Amplify](https://docs.aws.amazon.com/amplify/)
- [Documentation CloudFront](https://docs.aws.amazon.com/cloudfront/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [AWS CLI Reference](https://docs.aws.amazon.com/cli/)

---

**Date de création :** 2025-01-21
**Dernière mise à jour :** 2025-01-21
**Version :** 1.0.0
