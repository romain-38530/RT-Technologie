# Script PowerShell pour Organiser la Documentation RT-Technologie
# Usage: .\organize-documentation.ps1

$ErrorActionPreference = "Continue"

# Détection automatique du chemin racine
$rootPath = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$docsPath = Join-Path $rootPath "docs"

Write-Host ""
Write-Host "🚀 Organisation de la documentation RT-Technologie" -ForegroundColor Cyan
Write-Host "=" * 70
Write-Host "Chemin racine: $rootPath" -ForegroundColor Gray
Write-Host "Chemin docs:   $docsPath" -ForegroundColor Gray
Write-Host ""

# Phase 1: Créer la Structure de Dossiers
Write-Host "📁 Phase 1: Création de la structure de dossiers..." -ForegroundColor Yellow
Write-Host ""

$folders = @(
    "deployment",
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

$foldersCreated = 0
foreach ($folder in $folders) {
    $fullPath = Join-Path $docsPath $folder
    if (-not (Test-Path $fullPath)) {
        try {
            New-Item -ItemType Directory -Path $fullPath -Force -ErrorAction Stop | Out-Null
            Write-Host "  ✅ Créé: $folder" -ForegroundColor Green
            $foldersCreated++
        }
        catch {
            Write-Host "  ❌ Erreur création: $folder - $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "  ⏭️  Existe: $folder" -ForegroundColor DarkGray
    }
}

Write-Host ""
Write-Host "Dossiers créés: $foldersCreated" -ForegroundColor Cyan
Write-Host ""

# Phase 2: Déplacer les Fichiers
Write-Host "📦 Phase 2: Déplacement des fichiers..." -ForegroundColor Yellow
Write-Host ""

# Mapping simplifié: Source -> Destination
$fileMappings = @{
    # Getting Started
    "COMMENCER_ICI.md" = "getting-started\README.md"
    "DEMARRAGE_RAPIDE.md" = "getting-started\quickstart.md"
    "QUICKSTART.md" = "getting-started\quickstart-alt.md"
    "GETTING_STARTED.md" = "getting-started\getting-started.md"

    # Deployment - AWS
    "GUIDE_DEPLOIEMENT_AWS_PRODUCTION.md" = "deployment\aws\aws-production.md"
    "DEPLOIEMENT_AWS_FINAL.md" = "deployment\aws\aws-final.md"
    "GUIDE_DEPLOIEMENT_COMPLET.md" = "deployment\guide-complet.md"
    "COMMANDES_CLOUDSHELL_AWS.md" = "deployment\aws\cloudshell-commands.md"
    "DEPLOIEMENT_CLOUDSHELL.md" = "deployment\aws\cloudshell-deploy.md"
    "DEPLOIEMENT_CLOUDSHELL_SIMPLE.md" = "deployment\aws\cloudshell-simple.md"
    "DEPLOIEMENT_ECS_CORRIGE.md" = "deployment\aws\ecs-corrected.md"
    "DEPLOIEMENT_ECS_DIRECT.md" = "deployment\aws\ecs-direct.md"
    "DEPLOIEMENT_INTERFACE_AWS.md" = "deployment\aws\ui-guide.md"
    "CONFIGURER_AWS_MAINTENANT.md" = "deployment\aws\quick-setup.md"
    "ALTERNATIVE_DEPLOIEMENT_AWS.md" = "deployment\aws\alternatives.md"
    "DEPLOIEMENT_AWS_QUICK_START.md" = "deployment\aws\quick-start.md"

    # Deployment - Vercel
    "GUIDE_DEPLOIEMENT_FRONTENDS.md" = "deployment\vercel\frontends.md"
    "DEPLOIEMENT_VERCEL_3_MINUTES.md" = "deployment\vercel\quick-start.md"
    "README_VERCEL.md" = "deployment\vercel\README.md"

    # Deployment - MongoDB
    "GUIDE_MONGODB_ATLAS.md" = "deployment\mongodb-atlas.md"
    "DATABASE_SETUP_COMPLETE.md" = "deployment\mongodb-complete.md"

    # Deployment - CI/CD
    "SETUP_GITHUB_ACTIONS_AWS.md" = "deployment\github-actions-aws.md"
    "SETUP_GITHUB_ACTIONS_VERCEL.md" = "deployment\github-actions-vercel.md"

    # Deployment - Workflows
    "DEPLOIEMENT_SUITE.md" = "deployment\workflows.md"
    "PRET_A_DEPLOYER.md" = "deployment\checklist.md"
    "INSTRUCTIONS_DEPLOIEMENT_IMMEDIAT.md" = "deployment\immediate.md"
    "INSTRUCTIONS_IMMEDIATES.md" = "deployment\immediate-alt.md"
    "ACTION_IMMEDIATE.md" = "deployment\actions.md"
    "GUIDE_DEPLOIEMENT_IMMEDIAT.md" = "deployment\guide-immediate.md"

    # Infrastructure
    "INFRASTRUCTURE_COMPLETE.md" = "deployment\infrastructure\overview.md"
    "FIX_CLUSTER_ET_IMAGES.md" = "deployment\infrastructure\fixes.md"

    # Reports
    "RAPPORT_FINAL.md" = "reports\final.md"
    "RAPPORT_FINAL_STORAGE_MARKET.md" = "reports\storage-market.md"
    "RAPPORT_PALETTES_FINAL.md" = "reports\palettes.md"
    "RAPPORT_UX_FORMATION.md" = "reports\ux-formation.md"
    "SYNTHESE_FINALE.md" = "reports\synthese.md"
    "DEPLOYMENT_SUMMARY.md" = "reports\deployment-summary.md"
    "STATUS_DEPLOIEMENT.md" = "reports\status.md"
    "STATUT_DEPLOIEMENT.md" = "reports\status-alt.md"
    "RECAPITULATIF_DEPLOIEMENT.md" = "reports\recap.md"
    "RESUME_DEPLOIEMENT_COMPLET.md" = "reports\resume.md"
    "DEPLOIEMENT_VERCEL_STATUS.md" = "reports\vercel-status.md"
    "VERCEL_DEPLOYMENT_STATUS.md" = "reports\vercel-deployment.md"
    "STORAGE_MARKET_FRONTEND_INTEGRATION_REPORT.md" = "reports\storage-integration.md"

    # Troubleshooting
    "DEBUG_BUILD_ECR.md" = "troubleshooting\ecr-build.md"
    "DEBUG_ECS.md" = "troubleshooting\ecs-debug.md"
    "VERIF_ERREURS_PUSH.md" = "troubleshooting\push-errors.md"
    "CORRECTION_DEPLOY_SCRIPT.md" = "troubleshooting\script-fixes.md"
    "CORRECTION_DOCKERFILE_FINALE.md" = "troubleshooting\dockerfile-fixes.md"
    "SERVICES_MANQUANTS.md" = "troubleshooting\missing-services.md"
    "RESOLUTION_MARKETING_SITE.md" = "troubleshooting\marketing-fixes.md"
    "SOLUTIONS_ACCES_DIAGNOSTICS.md" = "troubleshooting\diagnostics.md"
    "ERREURS_DEPLOIEMENT_VERCEL.md" = "troubleshooting\vercel-errors.md"

    # Tools
    "MONITORING_CLOUDSHELL.md" = "tools\monitoring-cloudshell.md"
    "SCRIPT_MONITORING_DIRECT.md" = "tools\monitoring-scripts.md"
    "SETUP_GIST_MONITORING.md" = "tools\gist-monitoring.md"
    "SCRIPT_ULTRA_AUTO_DIRECT.md" = "tools\auto-deploy.md"
    "COMMANDES_DEPLOIEMENT_AUTO.md" = "tools\auto-commands.md"
    "COMMANDES_DEPLOIEMENT_COMPLET.md" = "tools\deploy-commands.md"
    "COMMANDE_CORRECTION_DIRECTE.md" = "tools\fix-commands.md"
    "CONNEXION_CLOUDSHELL_PERMANENTE.md" = "tools\cloudshell-persistent.md"
    "SUIVI_BUILD_ECS.md" = "tools\ecs-tracking.md"
    "VERIF_DEPLOIEMENT.md" = "tools\verification.md"
    "ATTENTE_BUILD.md" = "tools\build-wait.md"

    # Development
    "STANDARDS-FRONTEND.md" = "development\frontend-standards.md"
    "CLAUDE_MANAGER_GUIDE.md" = "development\claude-manager.md"
    "FICHIERS_CREES.md" = "development\files-log.md"

    # Business
    "EXECUTIVE_SUMMARY_MARKETING.md" = "business\executive-summary.md"
    "AMELIORATIONS_SITE_MARKETING.md" = "business\marketing-improvements.md"

    # Tutorials
    "GUIDE_RAILWAY_SIMPLE.md" = "tutorials\railway.md"
    "INSTALLATION_NGROK_MANUELLE.md" = "tutorials\ngrok.md"
    "QUICK_START_UX.md" = "tutorials\ux-quickstart.md"
    "README_UX.md" = "tutorials\ux-guide.md"
    "README_ONBOARDING.md" = "tutorials\onboarding.md"

    # Misc
    "AGENTS.md" = "misc\agents.md"
    "INDEX_DOCUMENTATION.md" = "misc\old-index.md"
    "README_DEPLOIEMENT.md" = "misc\old-deployment-readme.md"
    "ETAPES_FINALES.md" = "deployment\final-steps.md"

    # Changelog
    "CHANGELOG_AWS_MIGRATION.md" = "changelog\aws-migration.md"
}

$movedCount = 0
$skippedCount = 0
$errorCount = 0
$notFoundCount = 0

foreach ($entry in $fileMappings.GetEnumerator()) {
    $sourceName = $entry.Key
    $destRelative = $entry.Value

    $sourcePath = Join-Path $rootPath $sourceName
    $destPath = Join-Path $docsPath $destRelative

    if (Test-Path $sourcePath) {
        if (Test-Path $destPath) {
            Write-Host "  ⚠️  Existe: $destRelative" -ForegroundColor DarkYellow
            $skippedCount++
        } else {
            try {
                $destDir = Split-Path -Parent $destPath
                if (-not (Test-Path $destDir)) {
                    New-Item -ItemType Directory -Path $destDir -Force -ErrorAction Stop | Out-Null
                }

                Copy-Item -Path $sourcePath -Destination $destPath -Force -ErrorAction Stop
                Write-Host "  ✅ Copié: $sourceName → $destRelative" -ForegroundColor Green
                $movedCount++
            }
            catch {
                Write-Host "  ❌ Erreur: $sourceName - $($_.Exception.Message)" -ForegroundColor Red
                $errorCount++
            }
        }
    } else {
        Write-Host "  ⏭️  Absent: $sourceName" -ForegroundColor DarkGray
        $notFoundCount++
    }
}

Write-Host ""
Write-Host "=" * 70
Write-Host "📊 Résumé:" -ForegroundColor Cyan
Write-Host "  ✅ Fichiers copiés:   $movedCount" -ForegroundColor Green
Write-Host "  ⚠️  Fichiers ignorés:  $skippedCount" -ForegroundColor Yellow
Write-Host "  ⏭️  Fichiers absents:  $notFoundCount" -ForegroundColor Gray
Write-Host "  ❌ Erreurs:           $errorCount" -ForegroundColor Red
Write-Host ""

# Phase 3: Créer les README.md
Write-Host "📝 Phase 3: Création des README.md..." -ForegroundColor Yellow
Write-Host ""

$readmeCreated = 0

# deployment/README.md
$deploymentReadme = @"
# Guides de Déploiement

Documentation pour déployer RT-Technologie sur AWS et Vercel.

## AWS ECS Fargate
- [Guide Production](./aws/aws-production.md)
- [CloudShell](./aws/cloudshell-deploy.md)
- [ECS Direct](./aws/ecs-direct.md)

## Vercel Edge
- [Frontends](./vercel/frontends.md)
- [Quick Start](./vercel/quick-start.md)

## Base de données
- [MongoDB Atlas](./mongodb-atlas.md)

## CI/CD
- [GitHub Actions AWS](./github-actions-aws.md)
- [GitHub Actions Vercel](./github-actions-vercel.md)
"@

$deploymentReadmePath = Join-Path $docsPath "deployment\README.md"
if (-not (Test-Path $deploymentReadmePath)) {
    $deploymentReadme | Out-File -FilePath $deploymentReadmePath -Encoding UTF8
    Write-Host "  ✅ Créé: deployment\README.md" -ForegroundColor Green
    $readmeCreated++
}

# reports/README.md
$reportsReadme = @"
# Rapports et Statuts

Rapports de projet et statuts de déploiement.

## Rapports Principaux
- [Rapport Final](./final.md)
- [Synthèse](./synthese.md)
- [Statut Déploiement](./status.md)

## Rapports Techniques
- [Storage Market](./storage-market.md)
- [Palettes](./palettes.md)
- [UX Formation](./ux-formation.md)
"@

$reportsReadmePath = Join-Path $docsPath "reports\README.md"
if (-not (Test-Path $reportsReadmePath)) {
    $reportsReadme | Out-File -FilePath $reportsReadmePath -Encoding UTF8
    Write-Host "  ✅ Créé: reports\README.md" -ForegroundColor Green
    $readmeCreated++
}

# troubleshooting/README.md
$troubleshootingReadme = @"
# Troubleshooting

Guide de résolution des problèmes.

## Par Plateforme
- [AWS ECS](./ecs-debug.md)
- [Vercel](./vercel-errors.md)
- [ECR Build](./ecr-build.md)

## Par Type
- [Dockerfile](./dockerfile-fixes.md)
- [Push Errors](./push-errors.md)
- [Services Manquants](./missing-services.md)
"@

$troubleshootingReadmePath = Join-Path $docsPath "troubleshooting\README.md"
if (-not (Test-Path $troubleshootingReadmePath)) {
    $troubleshootingReadme | Out-File -FilePath $troubleshootingReadmePath -Encoding UTF8
    Write-Host "  ✅ Créé: troubleshooting\README.md" -ForegroundColor Green
    $readmeCreated++
}

# tools/README.md
$toolsReadme = @"
# Outils et Scripts

Scripts de déploiement et monitoring.

## Scripts
- [Auto Deploy](./auto-deploy.md)
- [Monitoring](./monitoring-scripts.md)
- [Verification](./verification.md)

## Outils
- [CloudShell](./monitoring-cloudshell.md)
- [ECS Tracking](./ecs-tracking.md)
"@

$toolsReadmePath = Join-Path $docsPath "tools\README.md"
if (-not (Test-Path $toolsReadmePath)) {
    $toolsReadme | Out-File -FilePath $toolsReadmePath -Encoding UTF8
    Write-Host "  ✅ Créé: tools\README.md" -ForegroundColor Green
    $readmeCreated++
}

Write-Host ""
Write-Host "README créés: $readmeCreated" -ForegroundColor Cyan
Write-Host ""
Write-Host "=" * 70
Write-Host "✨ Organisation terminée!" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaines etapes:" -ForegroundColor Cyan
Write-Host "  1. Verifiez docs/ avec: ls docs -Recurse -Directory" -ForegroundColor White
Write-Host "  2. Verifiez les fichiers: ls docs/deployment" -ForegroundColor White
Write-Host "  3. Lisez docs/README.md et docs/INDEX.md" -ForegroundColor White
Write-Host ""
