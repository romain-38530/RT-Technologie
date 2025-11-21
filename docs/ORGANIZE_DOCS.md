# Plan d'Organisation de la Documentation

## Objectif
Centraliser toute la documentation dans le dossier `docs/` avec une structure claire et logique.

## Structure Proposée

```
docs/
├── README.md                      ✅ Créé - Index principal
├── architecture-diagram.md        ✅ Créé - Diagrammes UML
├── database-schema.md            ✅ Créé - ERD MongoDB
├── flow-diagrams.md              ✅ Créé - Flux métier
├── pricing.md                    ✅ Existe déjà
├── E2E-demo.md                   ✅ Existe déjà
│
├── deploy/                       ✅ Existe déjà
│   ├── vercel-setup.md
│   ├── vercel.md
│   ├── secrets.md
│   └── render-setup.md
│
├── deployment/                   📁 À créer
│   ├── README.md
│   ├── aws-deployment.md
│   ├── vercel-deployment.md
│   ├── mongodb-atlas.md
│   └── github-actions.md
│
├── getting-started/              📁 À créer
│   ├── README.md
│   ├── quickstart.md
│   └── environment-setup.md
│
├── services/                     📁 À créer
│   ├── README.md
│   ├── authz.md
│   ├── core-orders.md
│   ├── palette.md
│   ├── storage-market.md
│   ├── chatbot.md
│   └── [autres services]
│
├── apps/                         📁 À créer
│   ├── README.md
│   ├── web-industry.md
│   ├── web-transporter.md
│   ├── marketing-site.md
│   └── [autres apps]
│
├── packages/                     📁 À créer
│   ├── README.md
│   ├── contracts.md
│   ├── security.md
│   └── [autres packages]
│
├── features/                     📁 À créer
│   ├── order-dispatch.md
│   ├── palette-circular-economy.md
│   ├── storage-marketplace.md
│   └── [autres features]
│
├── business/                     📁 À créer
│   ├── entitlements.md
│   └── business-model.md
│
├── development/                  📁 À créer
│   ├── contributing.md
│   ├── code-standards.md
│   ├── testing.md
│   └── debugging.md
│
├── reports/                      📁 À créer
│   ├── deployment-status.md
│   ├── rapport-final.md
│   ├── rapport-ux-formation.md
│   └── synthese-finale.md
│
├── tutorials/                    📁 À créer
│   ├── aws-setup-guide.md
│   └── vercel-setup-guide.md
│
├── tools/                        📁 À créer
│   ├── deployment-scripts.md
│   └── monitoring-scripts.md
│
└── troubleshooting/              📁 À créer
    ├── common-issues.md
    ├── aws-ecs-errors.md
    └── vercel-errors.md
```

## Fichiers à Déplacer depuis la Racine

### 📝 Démarrage Rapide → `docs/getting-started/`
- COMMENCER_ICI.md → README.md
- DEMARRAGE_RAPIDE.md → quickstart.md
- QUICKSTART.md → quickstart.md (fusionner)
- GETTING_STARTED.md → README.md (fusionner)

### 🚢 Déploiement → `docs/deployment/`

#### AWS
- GUIDE_DEPLOIEMENT_AWS_PRODUCTION.md → aws-deployment.md
- DEPLOIEMENT_AWS_FINAL.md → aws-deployment.md (fusionner)
- GUIDE_DEPLOIEMENT_COMPLET.md → README.md
- COMMANDES_CLOUDSHELL_AWS.md → aws-cloudshell-guide.md
- DEPLOIEMENT_CLOUDSHELL.md → aws-cloudshell-guide.md (fusionner)
- DEPLOIEMENT_CLOUDSHELL_SIMPLE.md → aws-cloudshell-guide.md (fusionner)
- DEPLOIEMENT_ECS_CORRIGE.md → aws-ecs-troubleshooting.md
- DEPLOIEMENT_ECS_DIRECT.md → aws-ecs-direct.md
- DEPLOIEMENT_INTERFACE_AWS.md → aws-ui-guide.md
- CONFIGURER_AWS_MAINTENANT.md → aws-quick-setup.md
- ALTERNATIVE_DEPLOIEMENT_AWS.md → aws-alternatives.md

#### Vercel
- GUIDE_DEPLOIEMENT_FRONTENDS.md → vercel-deployment.md
- DEPLOIEMENT_VERCEL_3_MINUTES.md → vercel-quick-start.md
- README_VERCEL.md → vercel-deployment.md (fusionner)
- DEPLOIEMENT_VERCEL_STATUS.md → ../reports/vercel-status.md
- ERREURS_DEPLOIEMENT_VERCEL.md → ../troubleshooting/vercel-errors.md

#### MongoDB
- GUIDE_MONGODB_ATLAS.md → mongodb-atlas.md
- DATABASE_SETUP_COMPLETE.md → mongodb-setup-complete.md

#### CI/CD
- SETUP_GITHUB_ACTIONS_AWS.md → github-actions.md
- SETUP_GITHUB_ACTIONS_VERCEL.md → github-actions.md (fusionner)

#### Scripts
- DEPLOIEMENT_SUITE.md → deployment-workflows.md
- PRET_A_DEPLOYER.md → pre-deployment-checklist.md
- INSTRUCTIONS_DEPLOIEMENT_IMMEDIAT.md → quick-deploy.md
- INSTRUCTIONS_IMMEDIATES.md → quick-deploy.md (fusionner)
- ACTION_IMMEDIATE.md → quick-actions.md

### 📊 Rapports → `docs/reports/`
- RAPPORT_FINAL.md
- RAPPORT_FINAL_STORAGE_MARKET.md → storage-market-report.md
- RAPPORT_PALETTES_FINAL.md → palette-report.md
- RAPPORT_UX_FORMATION.md → ux-training-report.md
- SYNTHESE_FINALE.md
- DEPLOYMENT_SUMMARY.md → deployment-summary.md
- STATUS_DEPLOIEMENT.md → deployment-status.md
- STATUT_DEPLOIEMENT.md → deployment-status.md (fusionner)
- STATUS_DEPLOIEMENT_2025-11-20.md → deployment-status-20251120.md
- RECAPITULATIF_DEPLOIEMENT.md → deployment-recap.md
- RESUME_DEPLOIEMENT_COMPLET.md → deployment-complete-summary.md
- VERCEL_DEPLOYMENT_STATUS.md → vercel-status.md
- STORAGE_MARKET_FRONTEND_INTEGRATION_REPORT.md → storage-market-integration.md

### 🏗️ Infrastructure → `docs/deployment/infrastructure/`
- INFRASTRUCTURE_COMPLETE.md → infrastructure-overview.md
- FIX_CLUSTER_ET_IMAGES.md → cluster-images-fix.md

### 🐛 Troubleshooting → `docs/troubleshooting/`
- DEBUG_BUILD_ECR.md → ecr-build-issues.md
- DEBUG_ECS.md → ecs-debugging.md
- VERIF_ERREURS_PUSH.md → push-errors.md
- CORRECTION_DEPLOY_SCRIPT.md → deploy-script-fixes.md
- CORRECTION_DOCKERFILE_FINALE.md → dockerfile-fixes.md
- SERVICES_MANQUANTS.md → missing-services.md
- RESOLUTION_MARKETING_SITE.md → marketing-site-fixes.md
- SOLUTIONS_ACCES_DIAGNOSTICS.md → access-diagnostics.md
- ERREURS_DEPLOIEMENT_VERCEL.md → vercel-errors.md

### 🛠️ Tools & Scripts → `docs/tools/`
- MONITORING_CLOUDSHELL.md → cloudshell-monitoring.md
- SCRIPT_MONITORING_DIRECT.md → monitoring-scripts.md
- SETUP_GIST_MONITORING.md → gist-monitoring-setup.md
- SCRIPT_ULTRA_AUTO_DIRECT.md → auto-deploy-script.md
- COMMANDES_DEPLOIEMENT_AUTO.md → auto-deploy-commands.md
- COMMANDES_DEPLOIEMENT_COMPLET.md → complete-deploy-commands.md
- COMMANDE_CORRECTION_DIRECTE.md → direct-fix-commands.md
- CONNEXION_CLOUDSHELL_PERMANENTE.md → cloudshell-persistent.md
- SUIVI_BUILD_ECS.md → ecs-build-tracking.md
- VERIF_DEPLOIEMENT.md → deployment-verification.md
- ATTENTE_BUILD.md → build-waiting.md

### 📋 Standards & Guidelines → `docs/development/`
- STANDARDS-FRONTEND.md → frontend-standards.md
- CLAUDE_MANAGER_GUIDE.md → claude-manager.md
- FICHIERS_CREES.md → files-created-log.md

### 📚 Business → `docs/business/`
- EXECUTIVE_SUMMARY_MARKETING.md → marketing-executive-summary.md
- AMELIORATIONS_SITE_MARKETING.md → marketing-improvements.md

### 📖 Tutoriels → `docs/tutorials/`
- GUIDE_RAILWAY_SIMPLE.md → railway-deployment.md
- INSTALLATION_NGROK_MANUELLE.md → ngrok-setup.md
- QUICK_START_UX.md → ux-quick-start.md
- README_UX.md → ux-guide.md
- README_ONBOARDING.md → onboarding-guide.md

### 📦 Autres → `docs/misc/`
- AGENTS.md → ai-agents-overview.md
- INDEX_DOCUMENTATION.md → (remplacé par docs/README.md)
- README_DEPLOIEMENT.md → (fusionner dans deployment/README.md)
- ETAPES_FINALES.md → deployment/final-steps.md
- CHANGELOG_AWS_MIGRATION.md → changelog/aws-migration.md

## Actions à Effectuer

### Phase 1: Créer les Dossiers
```bash
mkdir -p docs/deployment/infrastructure
mkdir -p docs/getting-started
mkdir -p docs/services
mkdir -p docs/apps
mkdir -p docs/packages
mkdir -p docs/features
mkdir -p docs/business
mkdir -p docs/development
mkdir -p docs/reports
mkdir -p docs/tutorials
mkdir -p docs/tools
mkdir -p docs/troubleshooting
mkdir -p docs/misc
mkdir -p docs/changelog
```

### Phase 2: Déplacer et Renommer
Utiliser le script PowerShell fourni ci-dessous.

### Phase 3: Nettoyer
- Supprimer les doublons
- Fusionner les documents similaires
- Créer des README.md dans chaque dossier

### Phase 4: Créer les Liens
- Mettre à jour tous les liens internes
- Créer un index de navigation
- Ajouter des liens croisés entre documents

## Script PowerShell pour Déplacer les Fichiers

Voir le fichier `infra/scripts/organize-documentation.ps1`

## Vérification Post-Organisation

1. ✅ Tous les liens fonctionnent
2. ✅ Pas de doublons
3. ✅ Chaque dossier a un README.md
4. ✅ docs/README.md liste tous les documents
5. ✅ Navigation claire et intuitive
6. ✅ Fichiers racine minimaux (README.md, LICENSE, etc.)

## Notes

- **Ne pas supprimer** les fichiers originaux tant que la migration n'est pas validée
- Créer une branche Git pour cette réorganisation
- Tester tous les liens après migration
- Mettre à jour les liens dans le README.md principal du projet
