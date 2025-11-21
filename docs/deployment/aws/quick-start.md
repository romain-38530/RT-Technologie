# Déploiement AWS Frontend - Quick Start

Guide rapide pour déployer les applications frontend (backoffice-admin et marketing-site) sur AWS au lieu de Vercel.

## 🚀 Démarrage rapide (5 minutes)

### 1. Prérequis

```bash
# Installer AWS CLI (si pas déjà fait)
# Windows
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi

# macOS
brew install awscli

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configurer AWS CLI
aws configure
# Entrez vos credentials AWS
# Région recommandée: eu-central-1
```

### 2. Valider la configuration

```bash
cd infra
./validate-aws-setup.sh
```

Si tout est vert ✅, vous pouvez continuer. Sinon, corrigez les erreurs affichées.

### 3. Choisir la méthode de déploiement

#### Option A: S3 + CloudFront (Recommandé - Simple et économique)

**Avantages:**
- ✅ Coût très faible (~5-10€/mois)
- ✅ Performance excellente (CDN global)
- ✅ Setup simple

**Limitations:**
- ❌ Pas de SSR (Server-Side Rendering)

**Commande:**
```bash
./deploy-frontends-aws.sh
```

#### Option B: AWS Amplify (Pour applications dynamiques)

**Avantages:**
- ✅ Support SSR, ISR, API routes
- ✅ CI/CD intégré
- ✅ Déploiement automatique depuis Git

**Coût:**
- ~10-20€/mois

**Commande:**
```bash
./deploy-frontends-aws-amplify.sh
```

### 4. Récupérer les URLs déployées

Après le déploiement, les URLs seront affichées. Vous pouvez aussi les récupérer avec:

```bash
./update-frontend-urls.sh
```

### 5. Configurer les domaines personnalisés (Optionnel)

Voir la [documentation complète](docs/DEPLOYMENT_AWS_FRONTEND.md#gestion-des-domaines-personnalisés) pour:
- Configurer un certificat SSL
- Ajouter un nom de domaine personnalisé
- Configurer le DNS

## 📁 Fichiers créés

### Scripts de déploiement
- [`infra/deploy-frontends-aws.sh`](infra/deploy-frontends-aws.sh) - Déploiement S3 + CloudFront
- [`infra/deploy-frontends-aws-amplify.sh`](infra/deploy-frontends-aws-amplify.sh) - Déploiement AWS Amplify
- [`infra/validate-aws-setup.sh`](infra/validate-aws-setup.sh) - Validation de la config AWS
- [`infra/update-frontend-urls.sh`](infra/update-frontend-urls.sh) - Gestion des URLs

### Configuration
- [`apps/backoffice-admin/amplify.yml`](apps/backoffice-admin/amplify.yml) - Config Amplify
- [`apps/marketing-site/amplify.yml`](apps/marketing-site/amplify.yml) - Config Amplify
- [`apps/*/next.config.js`](apps/) - Config Next.js
- [`apps/*/.env.production`](apps/) - Variables d'environnement

### Documentation
- [`docs/DEPLOYMENT_AWS_FRONTEND.md`](docs/DEPLOYMENT_AWS_FRONTEND.md) - Guide complet
- [`infra/README-AWS-FRONTEND.md`](infra/README-AWS-FRONTEND.md) - Guide rapide

## 🔄 Workflow de déploiement

```
┌─────────────────────────────────────────────┐
│ 1. Valider la configuration                │
│    ./validate-aws-setup.sh                  │
└─────────────┬───────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│ 2. Déployer les frontends                  │
│    ./deploy-frontends-aws.sh                │
│    OU                                        │
│    ./deploy-frontends-aws-amplify.sh        │
└─────────────┬───────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│ 3. Récupérer et configurer les URLs        │
│    ./update-frontend-urls.sh                │
└─────────────┬───────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│ 4. (Optionnel) Configurer domaines custom  │
│    Voir documentation complète              │
└─────────────────────────────────────────────┘
```

## 🆚 Comparaison Vercel vs AWS

| Critère | Vercel | AWS S3+CF | AWS Amplify |
|---------|--------|-----------|-------------|
| **Coût/mois** | ~20-50€ | ~5-10€ | ~10-20€ |
| **Setup** | ⚡ Très simple | 🔧 Moyen | 🔧 Simple |
| **SSR** | ✅ | ❌ | ✅ |
| **Performance** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **CI/CD** | ✅ Auto | 🔧 Manuel | ✅ Auto |
| **Scalabilité** | ✅ Auto | ✅ Auto | ✅ Auto |

## 🎯 Recommandation

**Pour backoffice-admin et marketing-site:**
1. **Démarrage:** Utilisez S3 + CloudFront (simple, rapide, économique)
2. **Si besoin de SSR:** Migrez vers AWS Amplify
3. **Pour CI/CD auto:** Configurez Amplify avec Git

## 🆘 Besoin d'aide ?

### Dépannage rapide

**Erreur: "Unable to locate credentials"**
```bash
aws configure
```

**Erreur: "Access Denied"**
- Vérifiez vos permissions IAM
- Voir [docs/DEPLOYMENT_AWS_FRONTEND.md](docs/DEPLOYMENT_AWS_FRONTEND.md#dépannage)

**Build échoue**
```bash
cd apps/backoffice-admin  # ou marketing-site
npm run build
# Corrigez les erreurs affichées
```

### Documentation complète

Consultez [docs/DEPLOYMENT_AWS_FRONTEND.md](docs/DEPLOYMENT_AWS_FRONTEND.md) pour:
- Architecture détaillée
- Configuration avancée
- Gestion des domaines
- Dépannage complet
- Migration depuis Vercel

### Support

- **AWS CLI:** https://docs.aws.amazon.com/cli/
- **CloudFront:** https://docs.aws.amazon.com/cloudfront/
- **Amplify:** https://docs.aws.amazon.com/amplify/
- **Next.js:** https://nextjs.org/docs/deployment

## ✅ Checklist de déploiement

- [ ] AWS CLI installé et configuré (`aws configure`)
- [ ] Permissions IAM vérifiées
- [ ] Services backend déployés sur ECS
- [ ] Configuration validée (`./validate-aws-setup.sh`)
- [ ] Script de déploiement lancé
- [ ] URLs récupérées et testées
- [ ] Variables d'environnement mises à jour
- [ ] (Optionnel) Domaines personnalisés configurés
- [ ] (Optionnel) Certificats SSL configurés
- [ ] Applications testées en production

## 🎉 C'est fait !

Une fois le déploiement terminé:

1. Testez vos applications via les URLs CloudFront/Amplify
2. Configurez vos domaines personnalisés si nécessaire
3. Mettez à jour votre documentation interne
4. (Optionnel) Supprimez les déploiements Vercel

---

**Temps de déploiement estimé:** 10-15 minutes (première fois)
**Temps de déploiement estimé:** 5-10 minutes (mises à jour)

**Date de création:** 2025-01-21
**Version:** 1.0.0
