# Script PowerShell pour Organiser la Documentation RT-Technologie
# Usage: .\organize-documentation.ps1

$ErrorActionPreference = "Stop"
$rootPath = "C:\Users\jspitaleri\OneDrive - Cesi\Bureau\RT-Technologie"
$docsPath = "$rootPath\docs"

Write-Host "🚀 Organisation de la documentation RT-Technologie" -ForegroundColor Cyan
Write-Host "=" * 60
Write-Host ""

# Phase 1: Créer la Structure de Dossiers
Write-Host "📁 Phase 1: Création de la structure de dossiers..." -ForegroundColor Yellow

$folders = @(
    "deployment\infrastructure",
    "deployment\aws",
    "deployment\vercel",
    "getting-started",
    "services",
    "apps",
    "packages",
    "features",
    "business",
    "development",
    "reports",
    "tutorials",
    "tools",
    "troubleshooting",
    "misc",
    "changelog"
)

foreach ($folder in $folders) {
    $fullPath = "$docsPath\$folder"
    if (-not (Test-Path $fullPath)) {
        New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
        Write-Host "  ✅ Créé: $folder" -ForegroundColor Green
    } else {
        Write-Host "  ⏭️  Existe déjà: $folder" -ForegroundColor Gray
    }
}

Write-Host ""

# Phase 2: Déplacer les Fichiers
Write-Host "📦 Phase 2: Déplacement des fichiers..." -ForegroundColor Yellow

# Mapping: [Source] = [Destination]
$fileMappings = @{
    # Getting Started
    "COMMENCER_ICI.md" = "getting-started\README.md"
    "DEMARRAGE_RAPIDE.md" = "getting-started\quickstart.md"
    "QUICKSTART.md" = "getting-started\quickstart-alt.md"
    "GETTING_STARTED.md" = "getting-started\getting-started-alt.md"

    # Deployment - AWS
    "GUIDE_DEPLOIEMENT_AWS_PRODUCTION.md" = "deployment\aws\aws-deployment.md"
    "DEPLOIEMENT_AWS_FINAL.md" = "deployment\aws\aws-final.md"
    "GUIDE_DEPLOIEMENT_COMPLET.md" = "deployment\README.md"
    "COMMANDES_CLOUDSHELL_AWS.md" = "deployment\aws\cloudshell-guide.md"
    "DEPLOIEMENT_CLOUDSHELL.md" = "deployment\aws\cloudshell-deployment.md"
    "DEPLOIEMENT_CLOUDSHELL_SIMPLE.md" = "deployment\aws\cloudshell-simple.md"
    "DEPLOIEMENT_ECS_CORRIGE.md" = "deployment\aws\ecs-corrected.md"
    "DEPLOIEMENT_ECS_DIRECT.md" = "deployment\aws\ecs-direct.md"
    "DEPLOIEMENT_INTERFACE_AWS.md" = "deployment\aws\aws-ui-guide.md"
    "CONFIGURER_AWS_MAINTENANT.md" = "deployment\aws\quick-setup.md"
    "ALTERNATIVE_DEPLOIEMENT_AWS.md" = "deployment\aws\alternatives.md"
    "DEPLOIEMENT_AWS_QUICK_START.md" = "deployment\aws\quick-start.md"

    # Deployment - Vercel
    "GUIDE_DEPLOIEMENT_FRONTENDS.md" = "deployment\vercel\frontends-deployment.md"
    "DEPLOIEMENT_VERCEL_3_MINUTES.md" = "deployment\vercel\quick-start.md"
    "README_VERCEL.md" = "deployment\vercel\README.md"

    # Deployment - MongoDB
    "GUIDE_MONGODB_ATLAS.md" = "deployment\mongodb-atlas.md"
    "DATABASE_SETUP_COMPLETE.md" = "deployment\mongodb-setup-complete.md"

    # Deployment - CI/CD
    "SETUP_GITHUB_ACTIONS_AWS.md" = "deployment\github-actions-aws.md"
    "SETUP_GITHUB_ACTIONS_VERCEL.md" = "deployment\github-actions-vercel.md"

    # Deployment - Workflows
    "DEPLOIEMENT_SUITE.md" = "deployment\deployment-workflows.md"
    "PRET_A_DEPLOYER.md" = "deployment\pre-deployment-checklist.md"
    "INSTRUCTIONS_DEPLOIEMENT_IMMEDIAT.md" = "deployment\quick-deploy.md"
    "INSTRUCTIONS_IMMEDIATES.md" = "deployment\immediate-instructions.md"
    "ACTION_IMMEDIATE.md" = "deployment\immediate-actions.md"
    "GUIDE_DEPLOIEMENT_IMMEDIAT.md" = "deployment\immediate-deployment-guide.md"

    # Infrastructure
    "INFRASTRUCTURE_COMPLETE.md" = "deployment\infrastructure\overview.md"
    "FIX_CLUSTER_ET_IMAGES.md" = "deployment\infrastructure\cluster-images-fix.md"

    # Reports
    "RAPPORT_FINAL.md" = "reports\rapport-final.md"
    "RAPPORT_FINAL_STORAGE_MARKET.md" = "reports\storage-market-report.md"
    "RAPPORT_PALETTES_FINAL.md" = "reports\palette-report.md"
    "RAPPORT_UX_FORMATION.md" = "reports\ux-training-report.md"
    "SYNTHESE_FINALE.md" = "reports\synthese-finale.md"
    "DEPLOYMENT_SUMMARY.md" = "reports\deployment-summary.md"
    "STATUS_DEPLOIEMENT.md" = "reports\deployment-status.md"
    "STATUT_DEPLOIEMENT.md" = "reports\deployment-status-alt.md"
    "STATUS_DEPLOIEMENT_2025-11-20.md" = "reports\deployment-status-20251120.md"
    "RECAPITULATIF_DEPLOIEMENT.md" = "reports\deployment-recap.md"
    "RESUME_DEPLOIEMENT_COMPLET.md" = "reports\deployment-complete-summary.md"
    "DEPLOIEMENT_VERCEL_STATUS.md" = "reports\vercel-status.md"
    "VERCEL_DEPLOYMENT_STATUS.md" = "reports\vercel-deployment-status.md"
    "STORAGE_MARKET_FRONTEND_INTEGRATION_REPORT.md" = "reports\storage-market-integration.md"

    # Troubleshooting
    "DEBUG_BUILD_ECR.md" = "troubleshooting\ecr-build-issues.md"
    "DEBUG_ECS.md" = "troubleshooting\ecs-debugging.md"
    "VERIF_ERREURS_PUSH.md" = "troubleshooting\push-errors.md"
    "CORRECTION_DEPLOY_SCRIPT.md" = "troubleshooting\deploy-script-fixes.md"
    "CORRECTION_DOCKERFILE_FINALE.md" = "troubleshooting\dockerfile-fixes.md"
    "SERVICES_MANQUANTS.md" = "troubleshooting\missing-services.md"
    "RESOLUTION_MARKETING_SITE.md" = "troubleshooting\marketing-site-fixes.md"
    "SOLUTIONS_ACCES_DIAGNOSTICS.md" = "troubleshooting\access-diagnostics.md"
    "ERREURS_DEPLOIEMENT_VERCEL.md" = "troubleshooting\vercel-errors.md"

    # Tools
    "MONITORING_CLOUDSHELL.md" = "tools\cloudshell-monitoring.md"
    "SCRIPT_MONITORING_DIRECT.md" = "tools\monitoring-scripts.md"
    "SETUP_GIST_MONITORING.md" = "tools\gist-monitoring-setup.md"
    "SCRIPT_ULTRA_AUTO_DIRECT.md" = "tools\auto-deploy-script.md"
    "COMMANDES_DEPLOIEMENT_AUTO.md" = "tools\auto-deploy-commands.md"
    "COMMANDES_DEPLOIEMENT_COMPLET.md" = "tools\complete-deploy-commands.md"
    "COMMANDE_CORRECTION_DIRECTE.md" = "tools\direct-fix-commands.md"
    "CONNEXION_CLOUDSHELL_PERMANENTE.md" = "tools\cloudshell-persistent.md"
    "SUIVI_BUILD_ECS.md" = "tools\ecs-build-tracking.md"
    "VERIF_DEPLOIEMENT.md" = "tools\deployment-verification.md"
    "ATTENTE_BUILD.md" = "tools\build-waiting.md"

    # Development
    "STANDARDS-FRONTEND.md" = "development\frontend-standards.md"
    "CLAUDE_MANAGER_GUIDE.md" = "development\claude-manager.md"
    "FICHIERS_CREES.md" = "development\files-created-log.md"

    # Business
    "EXECUTIVE_SUMMARY_MARKETING.md" = "business\marketing-executive-summary.md"
    "AMELIORATIONS_SITE_MARKETING.md" = "business\marketing-improvements.md"

    # Tutorials
    "GUIDE_RAILWAY_SIMPLE.md" = "tutorials\railway-deployment.md"
    "INSTALLATION_NGROK_MANUELLE.md" = "tutorials\ngrok-setup.md"
    "QUICK_START_UX.md" = "tutorials\ux-quick-start.md"
    "README_UX.md" = "tutorials\ux-guide.md"
    "README_ONBOARDING.md" = "tutorials\onboarding-guide.md"

    # Misc
    "AGENTS.md" = "misc\ai-agents-overview.md"
    "INDEX_DOCUMENTATION.md" = "misc\old-index.md"
    "README_DEPLOIEMENT.md" = "misc\old-deployment-readme.md"
    "ETAPES_FINALES.md" = "deployment\final-steps.md"

    # Changelog
    "CHANGELOG_AWS_MIGRATION.md" = "changelog\aws-migration.md"
}

$movedCount = 0
$skippedCount = 0
$errorCount = 0

foreach ($mapping in $fileMappings.GetEnumerator()) {
    $source = "$rootPath\$($mapping.Key)"
    $destination = "$docsPath\$($mapping.Value)"

    if (Test-Path $source) {
        try {
            $destDir = Split-Path -Parent $destination
            if (-not (Test-Path $destDir)) {
                New-Item -ItemType Directory -Path $destDir -Force | Out-Null
            }

            if (Test-Path $destination) {
                Write-Host "  ⚠️  Destination existe: $($mapping.Value)" -ForegroundColor DarkYellow
                $skippedCount++
            } else {
                Move-Item -Path $source -Destination $destination -Force
                Write-Host "  ✅ Déplacé: $($mapping.Key) → $($mapping.Value)" -ForegroundColor Green
                $movedCount++
            }
        }
        catch {
            Write-Host "  ❌ Erreur: $($mapping.Key) - $($_.Exception.Message)" -ForegroundColor Red
            $errorCount++
        }
    } else {
        Write-Host "  ⏭️  Source introuvable: $($mapping.Key)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "=" * 60
Write-Host "📊 Résumé de l'organisation:" -ForegroundColor Cyan
Write-Host "  ✅ Fichiers déplacés: $movedCount" -ForegroundColor Green
Write-Host "  ⚠️  Fichiers ignorés: $skippedCount" -ForegroundColor Yellow
Write-Host "  ❌ Erreurs: $errorCount" -ForegroundColor Red
Write-Host ""

# Phase 3: Créer les README.md dans chaque dossier
Write-Host "📝 Phase 3: Création des README.md..." -ForegroundColor Yellow

$readmeTemplates = @{
    "deployment" = @"
# Guides de Déploiement

Documentation complète pour le déploiement de la plateforme RT-Technologie.

## Contenu

- [AWS ECS Fargate](./aws/) - Déploiement backend
- [Vercel Edge](./vercel/) - Déploiement frontend
- [MongoDB Atlas](./mongodb-atlas.md) - Configuration base de données
- [GitHub Actions](./github-actions-aws.md) - CI/CD automation

## Quick Links

- [Pré-requis](./pre-deployment-checklist.md)
- [Déploiement Rapide](./quick-deploy.md)
- [Troubleshooting](../troubleshooting/)
"@

    "services" = @"
# Services Backend

Documentation des 20 microservices backend de RT-Technologie.

## Services Core

- authz - Authentication & Authorization
- core-orders - Gestion des commandes
- palette - Économie circulaire des palettes
- storage-market - Marketplace de stockage

## Voir aussi

- [Architecture](../architecture-diagram.md)
- [Diagrammes de Flux](../flow-diagrams.md)
"@

    "apps" = @"
# Applications Frontend

Documentation des 10 applications frontend Next.js.

## Applications Déployées

- web-industry - Interface industriels
- web-transporter - Interface transporteurs
- web-logistician - Interface logisticiens
- backoffice-admin - Interface administration
- marketing-site - Site public

## Voir aussi

- [Standards Frontend](../development/frontend-standards.md)
"@

    "reports" = @"
# Rapports et Statuts

Rapports de projet, statuts de déploiement et synthèses.

## Rapports Principaux

- [Rapport Final](./rapport-final.md)
- [Synthèse Finale](./synthese-finale.md)
- [Statut Déploiement](./deployment-status.md)

## Rapports Techniques

- [Storage Market](./storage-market-report.md)
- [Palettes](./palette-report.md)
- [UX/Formation](./ux-training-report.md)
"@

    "troubleshooting" = @"
# Troubleshooting

Guide de résolution des problèmes courants.

## Par Plateforme

- [AWS ECS](./ecs-debugging.md)
- [Vercel](./vercel-errors.md)
- [ECR Build](./ecr-build-issues.md)

## Par Type

- [Erreurs de Build](./dockerfile-fixes.md)
- [Erreurs de Push](./push-errors.md)
- [Services Manquants](./missing-services.md)
"@

    "tools" = @"
# Outils et Scripts

Scripts et utilitaires pour le déploiement et le monitoring.

## Scripts de Déploiement

- [Auto-Deploy](./auto-deploy-script.md)
- [Monitoring](./monitoring-scripts.md)
- [Verification](./deployment-verification.md)

## Outils

- [CloudShell Monitoring](./cloudshell-monitoring.md)
- [ECS Build Tracking](./ecs-build-tracking.md)
"@

    "tutorials" = @"
# Tutoriels

Guides pas à pas pour configurer et utiliser la plateforme.

## Tutoriels Disponibles

- [Railway Deployment](./railway-deployment.md)
- [Ngrok Setup](./ngrok-setup.md)
- [UX Quick Start](./ux-quick-start.md)
- [Onboarding Guide](./onboarding-guide.md)
"@
}

foreach ($folder in $readmeTemplates.Keys) {
    $readmePath = "$docsPath\$folder\README.md"
    if (-not (Test-Path $readmePath)) {
        $readmeTemplates[$folder] | Out-File -FilePath $readmePath -Encoding UTF8
        Write-Host "  ✅ Créé: $folder\README.md" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "✨ Organisation terminée avec succès!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "  1. Vérifiez la nouvelle structure dans docs/"
Write-Host "  2. Fusionnez les documents similaires"
Write-Host "  3. Mettez à jour les liens internes"
Write-Host "  4. Testez la navigation"
Write-Host "  5. Committez les changements"
Write-Host ""
