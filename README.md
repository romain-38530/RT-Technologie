# RT Technologie Monorepo

Ce dépôt contient la plateforme modulable multi-agents (Industry, Carrier, Logi, Supplier, Recipient, Forwarder, Shared).

## 📊 Status de Déploiement

**Dernière mise à jour :** 2025-11-20 | [Voir le status complet](STATUS_DEPLOIEMENT_2025-11-20.md)

| Composant | Déployé | Total | Status |
|-----------|---------|-------|--------|
| Services Backend (AWS ECS) | 11 | 21 | 🟡 52% |
| Applications Frontend (AWS/Vercel) | 5 | 8 | 🟡 62% |
| Base de Données (MongoDB) | 1 | 1 | ✅ 100% |

**Progress global :** 60% | [Guide de complétion](SERVICES_MANQUANTS.md)

---

## 🏗️ Structure

- **docs/** - Spécifications et schémas
- **packages/** - Contrats, authz, i18n, utils partagés
- **services/** - 21 microservices backend (APIs par domaine)
- **apps/** - 8 applications frontend (web + PWA)
- **infra/** - Seeds, IaC, pipelines CI/CD

---

## 🚀 Applications Frontend

| Application | Hébergement | Utilisateurs |
|-------------|-------------|--------------|
| web-industry | Vercel | Industriels |
| web-transporter | Vercel | Transporteurs |
| web-logistician | Vercel | Logisticiens |
| backoffice-admin | AWS (CloudFront/Amplify) | Administrateurs |
| marketing-site | AWS (CloudFront/Amplify) | Public |

**Note:** Les applications backoffice-admin et marketing-site peuvent être déployées sur AWS. Voir [infra/README-AWS-FRONTEND.md](infra/README-AWS-FRONTEND.md) pour les instructions de déploiement AWS.

---

## 🛠️ Stack Technique

- **Backend:** Node 20 + TypeScript + Express
- **Frontend:** Next.js 14 + React 18 + TailwindCSS
- **Monorepo:** pnpm workspaces + Turborepo
- **Infrastructure:** AWS ECS Fargate + CloudFront/Amplify + Vercel Edge
- **Database:** MongoDB Atlas
- **Messaging:** NATS (Pub/Sub)
- **Cache:** Redis
- **APIs:** OpenAPI + JSON Schema

---

## 📚 Documentation

**📖 [Documentation Complète →](docs/README.md)** | **🗂️ [Index Navigation →](docs/INDEX.md)**

### Démarrage Rapide
- 🚀 [Guide de Démarrage](docs/getting-started/README.md) - Commencez ici !
- ⚡ [Quick Start](docs/getting-started/quickstart.md) - Installation et premier lancement

### Architecture
- 🏗️ [Diagrammes d'Architecture UML](docs/architecture-diagram.md) - Vue complète du système
- 🗄️ [Schéma Base de Données (ERD)](docs/database-schema.md) - 40+ collections MongoDB
- 📊 [Diagrammes de Flux UML](docs/flow-diagrams.md) - Séquences et activités métier

### Déploiement
- 🚢 [Guide Complet Déploiement](docs/deployment/README.md) - Vue d'ensemble
- ☁️ [Déploiement AWS ECS](docs/deployment/aws/aws-deployment.md) - Backend sur Fargate
- 🌐 [Déploiement Vercel](docs/deploy/vercel-setup.md) - Frontend Next.js
- 💾 [Configuration MongoDB Atlas](docs/deployment/mongodb-atlas.md) - Base de données

### Services & Apps
- 📦 [Services Backend (20 microservices)](docs/services/README.md)
- 🎨 [Applications Frontend (10 apps)](docs/apps/README.md)
- 🔧 [Packages Partagés (17 libs)](docs/packages/README.md)

### Rapports
- 📈 [Statut Déploiement Actuel](docs/reports/deployment-status.md)
- 📄 [Rapport Final Projet](docs/reports/rapport-final.md)
- 🎯 [Démo End-to-End](docs/E2E-demo.md)

### Support
- 🐛 [Troubleshooting](docs/troubleshooting/common-issues.md) - Résolution de problèmes
- 🛠️ [Outils & Scripts](docs/tools/README.md) - Utilitaires de déploiement

> **Note:** L'ancienne documentation à la racine sera déplacée progressivement vers `docs/`.
> Consultez [docs/ORGANIZE_DOCS.md](docs/ORGANIZE_DOCS.md) pour le plan de migration.

---

## 🔗 Liens Utiles

- **GitHub Actions:** https://github.com/romain-38530/RT-Technologie/actions
- **AWS ECS Console:** https://eu-central-1.console.aws.amazon.com/ecs/v2/clusters/rt-production
- **Vercel Dashboard:** https://vercel.com/dashboard
- **MongoDB Atlas:** https://cloud.mongodb.com/
