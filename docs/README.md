# Documentation RT-Technologie

Bienvenue dans la documentation centralisée de la plateforme RT-Technologie.

## 📚 Table des Matières

### 🚀 Démarrage Rapide
- [Guide de Démarrage](./getting-started/README.md) - Commencez ici !
- [Quick Start](./getting-started/quickstart.md) - Installation et premier lancement
- [Configuration Environnement](./getting-started/environment-setup.md)

### 🏗️ Architecture
- [Vue d'Ensemble Architecture](./architecture-diagram.md) - Diagrammes UML complets
- [Schéma Base de Données](./database-schema.md) - ERD MongoDB (40+ collections)
- [Diagrammes de Flux](./flow-diagrams.md) - Séquences et activités UML
- [Standards Frontend](./architecture/frontend-standards.md)
- [Architecture Microservices](./architecture/microservices.md)

### 🚢 Déploiement
- [Guide Complet Déploiement](./deployment/README.md) - Vue d'ensemble
- [Déploiement AWS](./deployment/aws-deployment.md) - ECS Fargate
- [Déploiement Vercel](./deploy/vercel-setup.md) - Frontends
- [Configuration MongoDB Atlas](./deployment/mongodb-atlas.md)
- [Secrets et Variables d'Environnement](./deploy/secrets.md)
- [CI/CD avec GitHub Actions](./deployment/github-actions.md)

### 📦 Services Backend
- [Index des Services](./services/README.md)
- [authz - Authentication & Authorization](./services/authz.md)
- [core-orders - Gestion Commandes](./services/core-orders.md)
- [palette - Économie Circulaire Palettes](./services/palette.md)
- [storage-market - Marketplace Stockage](./services/storage-market.md)
- [chatbot - Support IA Multi-Bot](./services/chatbot.md)
- [geo-tracking - GPS & ETA](./services/geo-tracking.md)

### 🎨 Applications Frontend
- [web-industry - Industriels](./apps/web-industry.md)
- [web-transporter - Transporteurs](./apps/web-transporter.md)
- [web-logistician - Logisticiens](./apps/web-logistician.md)
- [backoffice-admin - Administration](./apps/backoffice-admin.md)
- [marketing-site - Site Public](./apps/marketing-site.md)
- [mobile-driver - Application Chauffeurs](./apps/mobile-driver.md)

### 🔧 Packages Partagés
- [contracts - Contrats TypeScript](./packages/contracts.md)
- [security - JWT, CORS, Rate Limit](./packages/security.md)
- [data-mongo - Client MongoDB](./packages/data-mongo.md)
- [entitlements - Feature Flags](./packages/entitlements.md)

### 🎯 Fonctionnalités Métier
- [Dispatch de Commandes](./features/order-dispatch.md)
- [Économie Circulaire des Palettes](./features/palette-circular-economy.md)
- [Marketplace de Stockage](./features/storage-marketplace.md)
- [Géolocalisation et ETA](./features/geo-tracking-eta.md)
- [Support Client IA](./features/chatbot-support.md)
- [Onboarding Client](./features/client-onboarding.md)

### 📊 Business & Pricing
- [Plans et Tarification](./pricing.md)
- [Feature Flags par Plan](./business/entitlements.md)
- [Modèle Économique](./business/business-model.md)

### 🔬 Développement
- [Guide de Contribution](./development/contributing.md)
- [Standards de Code](./development/code-standards.md)
- [Testing](./development/testing.md)
- [Debugging](./development/debugging.md)

### 📈 Rapports et Statuts
- [Statut Déploiement Actuel](./reports/deployment-status.md)
- [Rapport Final Projet](./reports/rapport-final.md)
- [Démo End-to-End](./E2E-demo.md)

### 🎓 Tutoriels
- [Configuration AWS Pas à Pas](./tutorials/aws-setup-guide.md)
- [Configuration Vercel Pas à Pas](./tutorials/vercel-setup-guide.md)

### 🛠️ Outils & Scripts
- [Scripts de Déploiement](./tools/deployment-scripts.md)
- [Scripts de Monitoring](./tools/monitoring-scripts.md)

### 🐛 Troubleshooting
- [Problèmes Courants](./troubleshooting/common-issues.md)
- [Erreurs AWS ECS](./troubleshooting/aws-ecs-errors.md)
- [Erreurs Vercel](./troubleshooting/vercel-errors.md)

---

## 🗂️ Organisation des Fichiers

```
docs/
├── README.md (ce fichier)
├── architecture-diagram.md      # Diagrammes UML architecture
├── database-schema.md           # ERD MongoDB
├── flow-diagrams.md            # Diagrammes de flux UML
├── pricing.md                  # Plans et tarification
├── E2E-demo.md                # Démonstration complète
├── deploy/                     # Guides déploiement
│   ├── vercel-setup.md
│   ├── secrets.md
│   └── render-setup.md
├── deployment/                 # Documentation déploiement détaillée
├── services/                   # Documentation services backend
├── apps/                       # Documentation apps frontend
├── packages/                   # Documentation packages partagés
├── features/                   # Fonctionnalités métier
├── business/                   # Documentation business
├── development/                # Guide développeurs
├── reports/                    # Rapports et statuts
├── tutorials/                  # Tutoriels pas à pas
├── tools/                      # Scripts et outils
└── troubleshooting/            # Résolution de problèmes
```

---

## 🎯 Par Où Commencer ?

### Nouveau sur le projet ?
1. Consultez l'[Architecture](./architecture-diagram.md)
2. Explorez le [Schéma de Base de Données](./database-schema.md)
3. Lisez les [Diagrammes de Flux](./flow-diagrams.md)

### Vous voulez déployer ?
1. Lisez le [Guide Déploiement AWS](./deployment/aws-deployment.md)
2. Configurez [MongoDB Atlas](./deployment/mongodb-atlas.md)
3. Déployez les frontends sur [Vercel](./deploy/vercel-setup.md)

### Vous développez une fonctionnalité ?
1. Consultez les [Standards de Code](./development/code-standards.md)
2. Lisez la doc du service concerné dans [services/](./services/)
3. Référez-vous aux [Diagrammes de Flux](./flow-diagrams.md)

### Vous avez un problème ?
1. Consultez le [Troubleshooting](./troubleshooting/common-issues.md)
2. Vérifiez le [Statut Déploiement](./reports/deployment-status.md)

---

## 🏗️ Architecture en Bref

**RT-Technologie** est une plateforme B2B de logistique et transport comprenant :

- **10 applications frontend** (Next.js 14 + React 18)
- **20 microservices backend** (Node.js 20 + TypeScript)
- **17 packages partagés** (libraries communes)
- **MongoDB Atlas** (40+ collections, 103+ indexes)
- **Déploiement**: AWS ECS Fargate (backend) + Vercel Edge (frontend)

### Technologies Clés
- **Frontend**: Next.js 14, React 18, TailwindCSS, Radix UI
- **Backend**: Node.js 20, TypeScript 5.4, Express (optionnel)
- **Base de données**: MongoDB Atlas, Redis
- **AI/ML**: OpenRouter (GPT-4o-mini), TomTom Traffic API
- **Messaging**: NATS Pub/Sub
- **Container**: Docker, AWS ECS Fargate
- **CDN**: Vercel Edge Network

---

## 🚀 Déploiement Actuel

### Backend (AWS ECS - eu-central-1)
**Déployés (11/20):**
- authz, admin-gateway, palette, storage-market, geo-tracking
- notifications, training, tms-sync, erp-sync, tracking-ia, planning

### Frontend (Vercel)
**Déployés (5/10):**
- marketing-site, web-industry, web-transporter
- web-logistician, backoffice-admin

---

## 📞 Support

Pour toute question ou problème :
1. Consultez la section [Troubleshooting](./troubleshooting/)
2. Vérifiez les rapports de statut dans [reports/](./reports/)
3. Contactez l'équipe de développement

---

## 📄 Licence

Propriétaire - RT-Technologie © 2024

---

**Dernière mise à jour:** 2025-11-21
**Version documentation:** 2.0
