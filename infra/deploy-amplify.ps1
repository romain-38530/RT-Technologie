# =============================================================================
# Déploiement sur AWS Amplify via CLI
# Exécuter depuis PowerShell en local
# =============================================================================

$ErrorActionPreference = "Stop"

$REGION = "eu-central-1"
$REPO = "https://github.com/romain-38530/RT-Technologie"
$BRANCH = "dockerfile"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "🚀 Déploiement AWS Amplify" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier AWS CLI
try {
    aws --version | Out-Null
} catch {
    Write-Host "❌ AWS CLI n'est pas installé" -ForegroundColor Red
    Write-Host "   Installez-le: https://aws.amazon.com/cli/" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ AWS CLI détecté" -ForegroundColor Green
Write-Host ""

# 1. Créer l'app marketing-site
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📦 Création de l'app marketing-site" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

$marketingSiteJson = @"
{
  "name": "marketing-site",
  "repository": "$REPO",
  "platform": "WEB",
  "environmentVariables": {
    "NEXT_PUBLIC_API_URL": "http://3.72.37.6:3020"
  },
  "buildSpec": "version: 1
applications:
  - appRoot: apps/marketing-site
    env:
      variables:
        NEXT_PUBLIC_API_URL: 'http://3.72.37.6:3020'
    frontend:
      phases:
        preBuild:
          commands:
            - npm install -g pnpm@8.15.4
            - cd ../..
            - pnpm install --frozen-lockfile
        build:
          commands:
            - cd apps/marketing-site
            - pnpm build
      artifacts:
        baseDirectory: .next
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*"
}
"@

Write-Host "⏳ Création de l'application Amplify..." -ForegroundColor Yellow

try {
    $app = aws amplify create-app `
        --name "rt-marketing-site" `
        --repository $REPO `
        --platform WEB `
        --environment-variables "NEXT_PUBLIC_API_URL=http://3.72.37.6:3020" `
        --region $REGION `
        --output json | ConvertFrom-Json

    $appId = $app.app.appId
    Write-Host "✅ App créée: $appId" -ForegroundColor Green

    # Créer la branche
    Write-Host "⏳ Connexion de la branche $BRANCH..." -ForegroundColor Yellow
    aws amplify create-branch `
        --app-id $appId `
        --branch-name $BRANCH `
        --region $REGION | Out-Null

    Write-Host "✅ Branche connectée" -ForegroundColor Green

    # Démarrer le build
    Write-Host "⏳ Démarrage du build..." -ForegroundColor Yellow
    aws amplify start-job `
        --app-id $appId `
        --branch-name $BRANCH `
        --job-type RELEASE `
        --region $REGION | Out-Null

    Write-Host "✅ Build démarré!" -ForegroundColor Green
    Write-Host "   📊 Voir le status: https://eu-central-1.console.aws.amazon.com/amplify/home?region=eu-central-1#/$appId" -ForegroundColor Cyan

} catch {
    Write-Host "❌ Erreur: $_" -ForegroundColor Red
}

Write-Host ""

# 2. Créer l'app web-forwarder
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📦 Création de l'app web-forwarder" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

try {
    $app2 = aws amplify create-app `
        --name "rt-web-forwarder" `
        --repository $REPO `
        --platform WEB `
        --environment-variables "NEXT_PUBLIC_AFFRET_IA_URL=http://3.75.218.131:3010" `
        --region $REGION `
        --output json | ConvertFrom-Json

    $appId2 = $app2.app.appId
    Write-Host "✅ App créée: $appId2" -ForegroundColor Green

    # Créer la branche
    Write-Host "⏳ Connexion de la branche $BRANCH..." -ForegroundColor Yellow
    aws amplify create-branch `
        --app-id $appId2 `
        --branch-name $BRANCH `
        --region $REGION | Out-Null

    Write-Host "✅ Branche connectée" -ForegroundColor Green

    # Démarrer le build
    Write-Host "⏳ Démarrage du build..." -ForegroundColor Yellow
    aws amplify start-job `
        --app-id $appId2 `
        --branch-name $BRANCH `
        --job-type RELEASE `
        --region $REGION | Out-Null

    Write-Host "✅ Build démarré!" -ForegroundColor Green
    Write-Host "   📊 Voir le status: https://eu-central-1.console.aws.amazon.com/amplify/home?region=eu-central-1#/$appId2" -ForegroundColor Cyan

} catch {
    Write-Host "❌ Erreur: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "✅ DÉPLOIEMENT LANCÉ" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Console Amplify: https://eu-central-1.console.aws.amazon.com/amplify/apps" -ForegroundColor Cyan
Write-Host ""
Write-Host "⏱️  Les builds prennent ~5-10 minutes" -ForegroundColor Yellow
Write-Host ""
