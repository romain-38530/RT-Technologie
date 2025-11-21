# Guide de Dépannage AWS Frontend

Guide rapide pour résoudre les problèmes courants lors du déploiement AWS.

## 🔍 Diagnostic rapide

### Script de diagnostic

```bash
cd infra
./validate-aws-setup.sh
```

Ce script vérifie automatiquement:
- AWS CLI installé et configuré
- Credentials valides
- Permissions IAM
- Services backend disponibles
- Structure du projet

---

## ❌ Erreurs fréquentes

### 1. "Unable to locate credentials"

**Symptôme:**
```
Unable to locate credentials. You can configure credentials by running "aws configure"
```

**Solution:**
```bash
# Configurer AWS CLI
aws configure

# Entrer vos informations:
AWS Access Key ID: [VOTRE_CLE]
AWS Secret Access Key: [VOTRE_SECRET]
Default region name: eu-central-1
Default output format: json

# Vérifier la configuration
aws sts get-caller-identity
```

**Vérification:**
```bash
# Doit afficher votre Account ID, UserId, et Arn
aws sts get-caller-identity
```

---

### 2. "AccessDenied" ou "Forbidden"

**Symptôme:**
```
An error occurred (AccessDenied) when calling the CreateBucket operation
```

**Causes possibles:**
- Permissions IAM insuffisantes
- Région non autorisée
- Bucket name déjà pris

**Solutions:**

**a) Vérifier les permissions:**
```bash
# Lister vos permissions (approximativement)
aws iam list-attached-user-policies --user-name VOTRE_USERNAME

# Test S3
aws s3 ls

# Test CloudFront
aws cloudfront list-distributions

# Test Amplify
aws amplify list-apps --region eu-central-1
```

**b) Permissions minimales requises:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:*",
        "cloudfront:*",
        "amplify:*",
        "ecs:DescribeTasks",
        "ecs:ListTasks",
        "ec2:DescribeNetworkInterfaces"
      ],
      "Resource": "*"
    }
  ]
}
```

---

### 3. Script ne s'exécute pas

**Symptôme:**
```
bash: ./deploy-frontends-aws.sh: Permission denied
```

**Solution:**
```bash
# Rendre les scripts exécutables
cd infra
chmod +x deploy-frontends-aws.sh
chmod +x deploy-frontends-aws-amplify.sh
chmod +x validate-aws-setup.sh
chmod +x update-frontend-urls.sh

# Ou tous à la fois
chmod +x *.sh
```

---

### 4. Build échoue

**Symptôme:**
```
Error: Build failed with exit code 1
npm ERR! code ELIFECYCLE
```

**Solution:**

**a) Tester localement:**
```bash
cd apps/backoffice-admin  # ou marketing-site
npm run build
```

**b) Vérifier les dépendances:**
```bash
# Réinstaller les dépendances
rm -rf node_modules
npm install

# Ou avec pnpm (à la racine)
cd ../..
pnpm install
```

**c) Vérifier les variables d'environnement:**
```bash
# Vérifier le fichier .env.production
cat apps/backoffice-admin/.env.production

# Les variables doivent commencer par NEXT_PUBLIC_
```

---

### 5. "Distribution not found" ou CloudFront errors

**Symptôme:**
```
An error occurred (NoSuchDistribution) when calling the GetDistribution operation
```

**Solution:**

**a) Lister les distributions:**
```bash
aws cloudfront list-distributions --query 'DistributionList.Items[*].[Id,Comment,Status]' --output table
```

**b) Créer une nouvelle distribution:**
Le script `deploy-frontends-aws.sh` devrait créer automatiquement la distribution. Si ce n'est pas le cas:

```bash
# Relancer le déploiement
./deploy-frontends-aws.sh
```

**c) Vérifier le statut:**
```bash
# Remplacer DISTRIBUTION_ID par votre ID
aws cloudfront get-distribution --id DISTRIBUTION_ID --query 'Distribution.Status'

# Status doit être "Deployed" (peut prendre 15-20 minutes)
```

---

### 6. Cache CloudFront non invalidé

**Symptôme:**
- Anciennes versions de l'application affichées
- Changements non visibles après déploiement

**Solution:**

**a) Invalider le cache manuellement:**
```bash
# Remplacer DISTRIBUTION_ID par votre ID
aws cloudfront create-invalidation \
  --distribution-id DISTRIBUTION_ID \
  --paths "/*"
```

**b) Vérifier l'invalidation:**
```bash
aws cloudfront list-invalidations \
  --distribution-id DISTRIBUTION_ID
```

**c) Forcer le rafraîchissement du navigateur:**
- Chrome/Firefox: Ctrl + Shift + R (Windows) ou Cmd + Shift + R (Mac)
- Ou ouvrir en navigation privée

---

### 7. Services backend non trouvés

**Symptôme:**
```
⚠️  WARNING: Cluster ECS 'rt-technologie-cluster' non trouvé
```

**Solution:**

**a) Vérifier le cluster:**
```bash
aws ecs list-clusters --region eu-central-1
```

**b) Vérifier les services:**
```bash
aws ecs list-services \
  --cluster rt-technologie-cluster \
  --region eu-central-1
```

**c) Si les services n'existent pas:**
Les services backend doivent être déployés en premier. Voir:
- `SERVICES_MANQUANTS.md`
- `infra/deploy-all-services-aws.sh`

**d) Configurer les IPs manuellement:**
Si les services existent mais les IPs ne sont pas récupérées automatiquement, éditez:
```bash
# Éditer les .env.production
nano apps/backoffice-admin/.env.production
nano apps/marketing-site/.env.production

# Ajouter les IPs manuellement
NEXT_PUBLIC_ADMIN_GATEWAY_URL=http://IP:PORT
# etc.
```

---

### 8. CORS errors dans le navigateur

**Symptôme:**
```
Access to fetch at 'http://...' from origin 'https://...' has been blocked by CORS policy
```

**Solution:**

**a) Configurer CORS sur le backend:**
```javascript
// Dans vos services backend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://YOUR-CLOUDFRONT-URL.com');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});
```

**b) Variables d'environnement multiples:**
```javascript
const allowedOrigins = [
  'https://d1234567890.cloudfront.net',
  'https://backoffice.rt-technologie.com',
  'http://localhost:3000'
];

res.header('Access-Control-Allow-Origin',
  allowedOrigins.includes(req.headers.origin) ? req.headers.origin : allowedOrigins[0]
);
```

---

### 9. Amplify build timeout

**Symptôme:**
```
Build timed out after 30 minutes
```

**Solution:**

**a) Optimiser le build:**
```yaml
# apps/*/amplify.yml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci --prefer-offline --no-audit
    build:
      commands:
        - npm run build
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

**b) Augmenter le timeout:**
```bash
aws amplify update-app \
  --app-id APP_ID \
  --custom-rules 'build_timeout=60' \
  --region eu-central-1
```

---

### 10. Variables d'environnement non prises en compte

**Symptôme:**
- Variables undefined dans l'application
- API calls échouent

**Solution:**

**a) Vérifier le préfixe `NEXT_PUBLIC_`:**
```bash
# ✅ Correct - accessible côté client
NEXT_PUBLIC_API_URL=http://api.example.com

# ❌ Incorrect - pas accessible côté client
API_URL=http://api.example.com
```

**b) Rebuild après modification:**
```bash
# Reconstruire l'application
cd apps/backoffice-admin
rm -rf .next
npm run build
```

**c) Vérifier dans le navigateur:**
```javascript
// Dans la console du navigateur
console.log(process.env.NEXT_PUBLIC_API_URL)
```

---

## 🔧 Outils de diagnostic

### 1. Vérifier les logs CloudFront

```bash
# Dans la console AWS
# CloudFront > Distributions > Select Distribution > Monitoring > Logs
```

### 2. Vérifier les logs Amplify

```bash
# Récupérer les logs de build
aws amplify get-job \
  --app-id APP_ID \
  --branch-name production \
  --job-id JOB_ID \
  --region eu-central-1
```

### 3. Tester les endpoints

```bash
# Test de l'URL CloudFront
curl -I https://d1234567890.cloudfront.net

# Test de l'API backend
curl http://IP:PORT/health

# Test avec headers CORS
curl -H "Origin: https://d1234567890.cloudfront.net" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS \
  http://IP:PORT/api/endpoint
```

### 4. Vérifier la configuration DNS

```bash
# Vérifier les enregistrements DNS
nslookup backoffice.rt-technologie.com
dig backoffice.rt-technologie.com

# Vérifier le certificat SSL
openssl s_client -connect backoffice.rt-technologie.com:443 -servername backoffice.rt-technologie.com
```

---

## 📊 Commandes utiles

### AWS CLI

```bash
# Lister les buckets S3
aws s3 ls

# Lister les distributions CloudFront
aws cloudfront list-distributions --query 'DistributionList.Items[*].[Id,Comment]' --output table

# Lister les apps Amplify
aws amplify list-apps --region eu-central-1

# Récupérer les logs ECS
aws ecs describe-tasks --cluster rt-technologie-cluster --tasks TASK_ARN --region eu-central-1

# Obtenir l'IP publique d'une instance
aws ec2 describe-network-interfaces --network-interface-ids ENI_ID --query 'NetworkInterfaces[0].Association.PublicIp' --output text
```

### Next.js

```bash
# Build avec debug
DEBUG=* npm run build

# Analyser le bundle
npm install -g @next/bundle-analyzer
ANALYZE=true npm run build

# Test de production local
npm run build && npm run start
```

---

## 🆘 Derniers recours

### 1. Supprimer et recréer

```bash
# Supprimer la distribution CloudFront
aws cloudfront delete-distribution --id DISTRIBUTION_ID --if-match ETAG

# Supprimer le bucket S3
aws s3 rb s3://bucket-name --force

# Supprimer l'app Amplify
aws amplify delete-app --app-id APP_ID

# Relancer le déploiement
./deploy-frontends-aws.sh
```

### 2. Rollback sur Vercel

```bash
# Les configurations Vercel sont conservées
cd infra
./deploy-frontends-vercel.sh
```

### 3. Contact support AWS

- Console AWS > Support > Create Case
- Ou: https://console.aws.amazon.com/support/

---

## 📚 Ressources

### Documentation
- [Guide complet](../docs/DEPLOYMENT_AWS_FRONTEND.md)
- [Quick Start](../DEPLOIEMENT_AWS_QUICK_START.md)
- [AWS CLI Reference](https://docs.aws.amazon.com/cli/)

### Support
- [AWS CloudFront Troubleshooting](https://docs.aws.amazon.com/cloudfront/latest/DeveloperGuide/troubleshooting-distributions.html)
- [AWS Amplify Troubleshooting](https://docs.aws.amazon.com/amplify/latest/userguide/troubleshooting.html)
- [Next.js Deployment Issues](https://nextjs.org/docs/deployment#troubleshooting)

---

## ✅ Checklist de vérification

Avant de contacter le support:

- [ ] AWS CLI installé et version récente
- [ ] Credentials AWS valides et testés
- [ ] Permissions IAM vérifiées
- [ ] Services backend accessibles
- [ ] Build local réussi
- [ ] Variables d'environnement correctes
- [ ] Logs consultés (CloudFront/Amplify)
- [ ] Documentation lue
- [ ] Scripts à jour (git pull)

---

**Date de création:** 2025-01-21
**Dernière mise à jour:** 2025-01-21
**Version:** 1.0.0
