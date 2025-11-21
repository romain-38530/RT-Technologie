# Index Complet de la Documentation RT-Technologie

Navigation complète de toute la documentation du projet.

---

## 🎯 Navigation Rapide

| Catégorie | Description | Lien Principal |
|-----------|-------------|----------------|
| 🚀 Démarrage | Installation et premiers pas | [Getting Started](./getting-started/README.md) |
| 🏗️ Architecture | Diagrammes et conception | [Architecture](./architecture-diagram.md) |
| 🗄️ Base de Données | Schémas et modèles | [Database Schema](./database-schema.md) |
| 📊 Flux Métier | Diagrammes de séquence | [Flow Diagrams](./flow-diagrams.md) |
| 🚢 Déploiement | Guides AWS/Vercel | [Deployment](./deployment/README.md) |
| 📦 Services | Documentation backend | [Services](./services/README.md) |
| 🎨 Applications | Documentation frontend | [Apps](./apps/README.md) |
| 📈 Rapports | Statuts et synthèses | [Reports](./reports/README.md) |
| 🐛 Dépannage | Résolution de problèmes | [Troubleshooting](./troubleshooting/README.md) |

---

## 📚 Documentation par Catégorie

### 🏗️ Architecture Système

<details>
<summary><b>Cliquez pour voir les documents d'architecture</b></summary>

| Document | Description | Lien |
|----------|-------------|------|
| Vue d'ensemble architecture | Diagrammes UML complets (Mermaid + PlantUML) | [architecture-diagram.md](./architecture-diagram.md) |
| Schéma base de données | ERD MongoDB (40+ collections, 103+ indexes) | [database-schema.md](./database-schema.md) |
| Diagrammes de flux | Séquences et activités UML pour tous les flux métier | [flow-diagrams.md](./flow-diagrams.md) |
| Standards frontend | Conventions et bonnes pratiques React/Next.js | [development/frontend-standards.md](./development/frontend-standards.md) |

</details>

---

### 🚀 Démarrage et Installation

<details>
<summary><b>Guides de démarrage rapide</b></summary>

| Document | Description | Lien |
|----------|-------------|------|
| Guide principal | Point d'entrée pour débuter | [getting-started/README.md](./getting-started/README.md) |
| Quick Start | Installation et premier lancement | [getting-started/quickstart.md](./getting-started/quickstart.md) |
| Configuration environnement | Variables d'env et secrets | [getting-started/environment-setup.md](./getting-started/environment-setup.md) |

</details>

---

### 🚢 Déploiement

<details>
<summary><b>Guides de déploiement complets</b></summary>

#### Vue d'ensemble
| Document | Description | Lien |
|----------|-------------|------|
| Guide principal déploiement | Vue d'ensemble complète | [deployment/README.md](./deployment/README.md) |
| Checklist pré-déploiement | Vérifications avant déploiement | [deployment/pre-deployment-checklist.md](./deployment/pre-deployment-checklist.md) |
| Déploiement rapide | Guide 3 minutes | [deployment/quick-deploy.md](./deployment/quick-deploy.md) |

#### AWS ECS Fargate
| Document | Description | Lien |
|----------|-------------|------|
| Guide AWS complet | Déploiement backend sur ECS | [deployment/aws/aws-deployment.md](./deployment/aws/aws-deployment.md) |
| CloudShell Guide | Déploiement via AWS CloudShell | [deployment/aws/cloudshell-guide.md](./deployment/aws/cloudshell-guide.md) |
| ECS Direct | Déploiement ECS pas à pas | [deployment/aws/ecs-direct.md](./deployment/aws/ecs-direct.md) |
| AWS UI Guide | Déploiement via interface AWS | [deployment/aws/aws-ui-guide.md](./deployment/aws/aws-ui-guide.md) |
| Quick Setup | Configuration rapide AWS | [deployment/aws/quick-setup.md](./deployment/aws/quick-setup.md) |

#### Vercel Edge
| Document | Description | Lien |
|----------|-------------|------|
| Guide Vercel principal | Déploiement frontend | [deployment/vercel/README.md](./deployment/vercel/README.md) |
| Déploiement frontends | 10 applications Next.js | [deployment/vercel/frontends-deployment.md](./deployment/vercel/frontends-deployment.md) |
| Quick Start Vercel | Déploiement en 3 minutes | [deployment/vercel/quick-start.md](./deployment/vercel/quick-start.md) |
| Secrets Vercel | Configuration des variables | [deploy/secrets.md](./deploy/secrets.md) |

#### MongoDB Atlas
| Document | Description | Lien |
|----------|-------------|------|
| Guide MongoDB Atlas | Configuration complète | [deployment/mongodb-atlas.md](./deployment/mongodb-atlas.md) |
| Setup MongoDB complet | Création cluster et seed data | [deployment/mongodb-setup-complete.md](./deployment/mongodb-setup-complete.md) |

#### CI/CD
| Document | Description | Lien |
|----------|-------------|------|
| GitHub Actions AWS | CI/CD pour backend | [deployment/github-actions-aws.md](./deployment/github-actions-aws.md) |
| GitHub Actions Vercel | CI/CD pour frontend | [deployment/github-actions-vercel.md](./deployment/github-actions-vercel.md) |

#### Infrastructure
| Document | Description | Lien |
|----------|-------------|------|
| Vue d'ensemble infrastructure | Architecture complète | [deployment/infrastructure/overview.md](./deployment/infrastructure/overview.md) |
| Cluster & Images Fix | Correction cluster ECS | [deployment/infrastructure/cluster-images-fix.md](./deployment/infrastructure/cluster-images-fix.md) |

</details>

---

### 📦 Services Backend

<details>
<summary><b>Documentation des 20 microservices</b></summary>

| Service | Description | Port | Lien |
|---------|-------------|------|------|
| authz | Authentication & Authorization | 3002/3007 | [services/authz.md](./services/authz.md) |
| core-orders | Gestion commandes & dispatch | 3001 | [services/core-orders.md](./services/core-orders.md) |
| palette | Économie circulaire palettes | 3009/3011 | [services/palette.md](./services/palette.md) |
| storage-market | Marketplace stockage + WMS | 3013/3015 | [services/storage-market.md](./services/storage-market.md) |
| chatbot | Support IA multi-bot | 3019 | [services/chatbot.md](./services/chatbot.md) |
| geo-tracking | GPS tracking & ETA | 3016 | [services/geo-tracking.md](./services/geo-tracking.md) |
| affret-ia | Matching IA transporteurs | 3005 | [services/affret-ia.md](./services/affret-ia.md) |
| notifications | Communications multi-canal | 3002 | [services/notifications.md](./services/notifications.md) |
| planning | Optimisation routes | 3004 | [services/planning.md](./services/planning.md) |
| vigilance | Compliance transporteurs | 3006 | [services/vigilance.md](./services/vigilance.md) |
| tms-sync | Intégration TMS | 3003 | [services/tms-sync.md](./services/tms-sync.md) |
| erp-sync | Intégration ERP | 3018 | [services/erp-sync.md](./services/erp-sync.md) |
| wms-sync | Intégration WMS | 3017 | [services/wms-sync.md](./services/wms-sync.md) |
| bourse | Bourse de transport | 3016 | [services/bourse.md](./services/bourse.md) |
| pricing-grids | Grilles tarifaires | 3014 | [services/pricing-grids.md](./services/pricing-grids.md) |
| ecpmr | CMR électronique | 3009 | [services/ecpmr.md](./services/ecpmr.md) |
| training | E-learning | 3012 | [services/training.md](./services/training.md) |
| tracking-ia | Prédiction livraison IA | 3015 | [services/tracking-ia.md](./services/tracking-ia.md) |
| client-onboarding | Inscription client | 3020 | [services/client-onboarding.md](./services/client-onboarding.md) |
| admin-gateway | API Gateway | 3000/3008 | [services/admin-gateway.md](./services/admin-gateway.md) |

**Index complet:** [services/README.md](./services/README.md)

</details>

---

### 🎨 Applications Frontend

<details>
<summary><b>Documentation des 10 applications Next.js</b></summary>

| Application | Utilisateurs | Port | Statut | Lien |
|-------------|--------------|------|--------|------|
| marketing-site | Public/Prospects | 3000 | ✅ Déployé | [apps/marketing-site.md](./apps/marketing-site.md) |
| web-industry | Industriels | 3010 | ✅ Déployé | [apps/web-industry.md](./apps/web-industry.md) |
| web-transporter | Transporteurs | 3100 | ✅ Déployé | [apps/web-transporter.md](./apps/web-transporter.md) |
| web-logistician | Logisticiens | 3106 | ✅ Déployé | [apps/web-logistician.md](./apps/web-logistician.md) |
| backoffice-admin | Administrateurs | 3000 | ✅ Déployé | [apps/backoffice-admin.md](./apps/backoffice-admin.md) |
| web-recipient | Destinataires | 3102 | 🟡 En cours | [apps/web-recipient.md](./apps/web-recipient.md) |
| web-supplier | Fournisseurs | 3103 | 🟡 En cours | [apps/web-supplier.md](./apps/web-supplier.md) |
| web-forwarder | Affréteurs | 4002 | 🟡 En cours | [apps/web-forwarder.md](./apps/web-forwarder.md) |
| mobile-driver | Chauffeurs | PWA | 🔴 À démarrer | [apps/mobile-driver.md](./apps/mobile-driver.md) |
| kiosk | Interface sur site | N/A | 🔴 À démarrer | [apps/kiosk.md](./apps/kiosk.md) |

**Index complet:** [apps/README.md](./apps/README.md)

</details>

---

### 🔧 Packages Partagés

<details>
<summary><b>Documentation des 17 packages</b></summary>

| Package | Description | Lien |
|---------|-------------|------|
| contracts | Contrats TypeScript & DTOs | [packages/contracts.md](./packages/contracts.md) |
| security | JWT, CORS, Rate Limiting | [packages/security.md](./packages/security.md) |
| data-mongo | Client MongoDB singleton | [packages/data-mongo.md](./packages/data-mongo.md) |
| entitlements | Feature flags par plan | [packages/entitlements.md](./packages/entitlements.md) |
| authz | Utilitaires autorisation | [packages/authz.md](./packages/authz.md) |
| notify-client | Client Mailgun | [packages/notify-client.md](./packages/notify-client.md) |
| ai-client | Client OpenRouter | [packages/ai-client.md](./packages/ai-client.md) |
| vat-client | Vérification TVA VIES/INSEE | [packages/vat-client.md](./packages/vat-client.md) |
| cloud-aws | AWS SDK utilities | [packages/cloud-aws.md](./packages/cloud-aws.md) |

**Index complet:** [packages/README.md](./packages/README.md)

</details>

---

### 🎯 Fonctionnalités Métier

<details>
<summary><b>Documentation des flux métier principaux</b></summary>

| Fonctionnalité | Description | Lien |
|----------------|-------------|------|
| Dispatch de commandes | SLA, rappels, escalade Affret.IA | [features/order-dispatch.md](./features/order-dispatch.md) |
| Économie circulaire palettes | QR codes, signatures crypto, ledger | [features/palette-circular-economy.md](./features/palette-circular-economy.md) |
| Marketplace de stockage | Ranking IA, WMS sync | [features/storage-marketplace.md](./features/storage-marketplace.md) |
| Géolocalisation & ETA | GPS temps réel, TomTom Traffic | [features/geo-tracking-eta.md](./features/geo-tracking-eta.md) |
| Support client IA | 8 bots, escalade Teams | [features/chatbot-support.md](./features/chatbot-support.md) |
| Onboarding client | Vérification TVA, signature eIDAS | [features/client-onboarding.md](./features/client-onboarding.md) |

</details>

---

### 📊 Business & Pricing

<details>
<summary><b>Documentation business et tarifaire</b></summary>

| Document | Description | Lien |
|----------|-------------|------|
| Plans et tarification | FREE, PRO, ENTERPRISE | [pricing.md](./pricing.md) |
| Feature flags | Fonctionnalités par plan | [business/entitlements.md](./business/entitlements.md) |
| Modèle économique | Stratégie commerciale | [business/business-model.md](./business/business-model.md) |
| Executive Summary Marketing | Résumé exécutif | [business/marketing-executive-summary.md](./business/marketing-executive-summary.md) |
| Améliorations marketing | Optimisations site | [business/marketing-improvements.md](./business/marketing-improvements.md) |

</details>

---

### 🔬 Développement

<details>
<summary><b>Guides pour développeurs</b></summary>

| Document | Description | Lien |
|----------|-------------|------|
| Guide de contribution | Comment contribuer | [development/contributing.md](./development/contributing.md) |
| Standards de code | Conventions et bonnes pratiques | [development/code-standards.md](./development/code-standards.md) |
| Standards frontend | React/Next.js guidelines | [development/frontend-standards.md](./development/frontend-standards.md) |
| Testing | Guide des tests | [development/testing.md](./development/testing.md) |
| Debugging | Techniques de débogage | [development/debugging.md](./development/debugging.md) |
| Claude Manager | Utilisation de Claude | [development/claude-manager.md](./development/claude-manager.md) |
| Fichiers créés | Log des fichiers générés | [development/files-created-log.md](./development/files-created-log.md) |

</details>

---

### 📈 Rapports et Statuts

<details>
<summary><b>Rapports de projet et statuts</b></summary>

| Document | Description | Date | Lien |
|----------|-------------|------|------|
| Statut déploiement actuel | État des déploiements | 2025-11-21 | [reports/deployment-status.md](./reports/deployment-status.md) |
| Rapport final projet | Synthèse complète du projet | - | [reports/rapport-final.md](./reports/rapport-final.md) |
| Synthèse finale | Résumé exécutif | - | [reports/synthese-finale.md](./reports/synthese-finale.md) |
| Rapport Storage Market | Fonctionnalité marketplace | - | [reports/storage-market-report.md](./reports/storage-market-report.md) |
| Rapport Palettes | Économie circulaire | - | [reports/palette-report.md](./reports/palette-report.md) |
| Rapport UX/Formation | Expérience utilisateur | - | [reports/ux-training-report.md](./reports/ux-training-report.md) |
| Résumé déploiement | Vue d'ensemble déploiements | - | [reports/deployment-summary.md](./reports/deployment-summary.md) |
| Statut Vercel | État frontends Vercel | - | [reports/vercel-status.md](./reports/vercel-status.md) |

**Index complet:** [reports/README.md](./reports/README.md)

</details>

---

### 🎓 Tutoriels

<details>
<summary><b>Tutoriels pas à pas</b></summary>

| Tutoriel | Description | Lien |
|----------|-------------|------|
| Démo End-to-End | Démonstration complète | [E2E-demo.md](./E2E-demo.md) |
| Setup AWS pas à pas | Configuration AWS complète | [tutorials/aws-setup-guide.md](./tutorials/aws-setup-guide.md) |
| Setup Vercel pas à pas | Configuration Vercel complète | [tutorials/vercel-setup-guide.md](./tutorials/vercel-setup-guide.md) |
| Déploiement Railway | Alternative Railway | [tutorials/railway-deployment.md](./tutorials/railway-deployment.md) |
| Configuration Ngrok | Exposition locale | [tutorials/ngrok-setup.md](./tutorials/ngrok-setup.md) |
| UX Quick Start | Démarrage UX rapide | [tutorials/ux-quick-start.md](./tutorials/ux-quick-start.md) |
| Guide UX | Guide expérience utilisateur | [tutorials/ux-guide.md](./tutorials/ux-guide.md) |
| Guide Onboarding | Processus d'inscription | [tutorials/onboarding-guide.md](./tutorials/onboarding-guide.md) |

</details>

---

### 🛠️ Outils & Scripts

<details>
<summary><b>Scripts et utilitaires</b></summary>

| Outil | Description | Lien |
|-------|-------------|------|
| Scripts de déploiement | Scripts automatisés | [tools/deployment-scripts.md](./tools/deployment-scripts.md) |
| Scripts de monitoring | Surveillance systèmes | [tools/monitoring-scripts.md](./tools/monitoring-scripts.md) |
| Auto-deploy | Déploiement automatique | [tools/auto-deploy-script.md](./tools/auto-deploy-script.md) |
| CloudShell monitoring | Surveillance CloudShell | [tools/cloudshell-monitoring.md](./tools/cloudshell-monitoring.md) |
| ECS build tracking | Suivi builds ECS | [tools/ecs-build-tracking.md](./tools/ecs-build-tracking.md) |
| Vérification déploiement | Tests post-déploiement | [tools/deployment-verification.md](./tools/deployment-verification.md) |

</details>

---

### 🐛 Troubleshooting

<details>
<summary><b>Résolution de problèmes</b></summary>

| Problème | Description | Lien |
|----------|-------------|------|
| Problèmes courants | FAQ et solutions | [troubleshooting/common-issues.md](./troubleshooting/common-issues.md) |
| Erreurs AWS ECS | Debugging ECS | [troubleshooting/ecs-debugging.md](./troubleshooting/ecs-debugging.md) |
| Erreurs Vercel | Problèmes Vercel | [troubleshooting/vercel-errors.md](./troubleshooting/vercel-errors.md) |
| Erreurs Build ECR | Build Docker | [troubleshooting/ecr-build-issues.md](./troubleshooting/ecr-build-issues.md) |
| Erreurs Push | Git push problems | [troubleshooting/push-errors.md](./troubleshooting/push-errors.md) |
| Fix Dockerfile | Corrections Docker | [troubleshooting/dockerfile-fixes.md](./troubleshooting/dockerfile-fixes.md) |
| Services manquants | Services non déployés | [troubleshooting/missing-services.md](./troubleshooting/missing-services.md) |
| Fix Marketing Site | Corrections site marketing | [troubleshooting/marketing-site-fixes.md](./troubleshooting/marketing-site-fixes.md) |

**Index complet:** [troubleshooting/README.md](./troubleshooting/README.md)

</details>

---

### 📝 Changelog & Historique

<details>
<summary><b>Historique des changements</b></summary>

| Document | Description | Lien |
|----------|-------------|------|
| Changelog principal | Historique complet | [changelog/CHANGELOG.md](./changelog/CHANGELOG.md) |
| Migration AWS | Changements migration AWS | [changelog/aws-migration.md](./changelog/aws-migration.md) |

</details>

---

## 🗂️ Structure Complète

```
docs/
├── README.md                          # Index principal
├── INDEX.md                           # Ce fichier - Navigation complète
├── ORGANIZE_DOCS.md                   # Plan d'organisation
│
├── architecture-diagram.md            # Diagrammes UML architecture
├── database-schema.md                 # ERD MongoDB
├── flow-diagrams.md                   # Diagrammes de flux
├── pricing.md                         # Plans et tarification
├── E2E-demo.md                       # Démo end-to-end
│
├── deploy/                            # Guides déploiement existants
├── deployment/                        # Documentation déploiement
│   ├── aws/                          # Spécifique AWS ECS
│   ├── vercel/                       # Spécifique Vercel
│   └── infrastructure/               # Infrastructure
│
├── getting-started/                   # Guides démarrage
├── services/                          # Documentation services backend
├── apps/                             # Documentation apps frontend
├── packages/                         # Documentation packages
├── features/                         # Fonctionnalités métier
├── business/                         # Documentation business
├── development/                      # Guide développeurs
├── reports/                          # Rapports et statuts
├── tutorials/                        # Tutoriels pas à pas
├── tools/                            # Scripts et outils
├── troubleshooting/                  # Résolution problèmes
├── changelog/                        # Historique changements
└── misc/                             # Documents divers
```

---

## 🔍 Recherche Rapide

### Par Technologie
- **Next.js/React** → [Apps](./apps/), [Frontend Standards](./development/frontend-standards.md)
- **Node.js/TypeScript** → [Services](./services/), [Packages](./packages/)
- **MongoDB** → [Database Schema](./database-schema.md), [MongoDB Atlas](./deployment/mongodb-atlas.md)
- **AWS ECS** → [AWS Deployment](./deployment/aws/aws-deployment.md)
- **Vercel** → [Vercel Deployment](./deployment/vercel/README.md)
- **Docker** → [Troubleshooting Dockerfile](./troubleshooting/dockerfile-fixes.md)

### Par Rôle
- **Développeur Frontend** → [Apps](./apps/), [Frontend Standards](./development/frontend-standards.md)
- **Développeur Backend** → [Services](./services/), [Database Schema](./database-schema.md)
- **DevOps** → [Deployment](./deployment/), [Tools](./tools/), [Troubleshooting](./troubleshooting/)
- **Product Manager** → [Features](./features/), [Business](./business/), [Reports](./reports/)
- **Architecte** → [Architecture](./architecture-diagram.md), [Flow Diagrams](./flow-diagrams.md)

### Par Tâche
- **Déployer** → [Deployment Guide](./deployment/README.md)
- **Débugger** → [Troubleshooting](./troubleshooting/common-issues.md)
- **Développer** → [Development Guide](./development/code-standards.md)
- **Comprendre l'archi** → [Architecture Diagram](./architecture-diagram.md)
- **Configurer DB** → [Database Schema](./database-schema.md)

---

## 📞 Support

Pour naviguer dans cette documentation :
1. Utilisez la **Table des Matières** ci-dessus
2. Consultez le [README principal](./README.md)
3. Recherchez par **technologie**, **rôle** ou **tâche**
4. Vérifiez les liens croisés entre documents

---

**Dernière mise à jour:** 2025-11-21
**Version:** 2.0
**Nombre total de documents:** 100+
