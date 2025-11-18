# Script de deploiement complet
# Ouvrir un NOUVEAU PowerShell et executer ce script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploiement RT-Technologie sur AWS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration AWS
$AWS_ACCESS_KEY = "AKIAQCIFTCPW7JIPYWDG"
$AWS_SECRET_KEY = "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"
$AWS_REGION = "eu-west-1"
$AWS_ACCOUNT = "004843574253"

Write-Host "Configuration des credentials AWS..." -ForegroundColor Yellow

# Creer le dossier .aws
$awsDir = "$env:USERPROFILE\.aws"
if (-not (Test-Path $awsDir)) {
    New-Item -ItemType Directory -Path $awsDir -Force | Out-Null
}

# Creer credentials
@"
[default]
aws_access_key_id = $AWS_ACCESS_KEY
aws_secret_access_key = $AWS_SECRET_KEY
"@ | Out-File -FilePath "$awsDir\credentials" -Encoding ASCII -Force

# Creer config
@"
[default]
region = $AWS_REGION
output = json
"@ | Out-File -FilePath "$awsDir\config" -Encoding ASCII -Force

Write-Host "Credentials configures!" -ForegroundColor Green
Write-Host ""

# Tester AWS CLI
Write-Host "Test de AWS CLI..." -ForegroundColor Yellow
try {
    $identity = aws sts get-caller-identity --output json 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "AWS CLI fonctionne!" -ForegroundColor Green
        $identity | ConvertFrom-Json | Format-List
    } else {
        Write-Host "ERREUR: AWS CLI ne fonctionne pas" -ForegroundColor Red
        Write-Host "Veuillez ouvrir un NOUVEAU PowerShell" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Dans le nouveau PowerShell, executez:" -ForegroundColor Yellow
        Write-Host "  cd '$PWD'" -ForegroundColor Cyan
        Write-Host "  .\deployer-maintenant.ps1" -ForegroundColor Cyan
        exit 1
    }
} catch {
    Write-Host "ERREUR: AWS CLI non disponible" -ForegroundColor Red
    Write-Host "Ouvrez un NOUVEAU PowerShell et reessayez" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SOLUTION ALTERNATIVE RECOMMANDEE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "AWS ECS necessite Docker Desktop et est complexe." -ForegroundColor Yellow
Write-Host ""
Write-Host "Je recommande d'utiliser Railway.app a la place:" -ForegroundColor Green
Write-Host ""
Write-Host "1. Aller sur: https://railway.app/" -ForegroundColor Cyan
Write-Host "2. Sign up with GitHub" -ForegroundColor Cyan
Write-Host "3. New Project > Deploy from GitHub repo" -ForegroundColor Cyan
Write-Host "4. Selectionner: RT-Technologie" -ForegroundColor Cyan
Write-Host "5. Root Directory: services/client-onboarding" -ForegroundColor Cyan
Write-Host "6. Ajouter variables d'environnement (voir ci-dessous)" -ForegroundColor Cyan
Write-Host "7. Deploy" -ForegroundColor Cyan
Write-Host ""
Write-Host "Variables d'environnement pour Railway:" -ForegroundColor Yellow
Write-Host "  MONGODB_URI=mongodb+srv://Admin:SETT.38530@stagingrt.v2jnoh2.mongodb.net/rt_technologie" -ForegroundColor White
Write-Host "  JWT_SECRET=ab2325974ab77ea4c3892803b09bea2650c9cb5284e2df983ce8ac34c97efeec" -ForegroundColor White
Write-Host "  SMTP_HOST=smtp.eu.mailgun.org" -ForegroundColor White
Write-Host "  SMTP_PORT=587" -ForegroundColor White
Write-Host "  SMTP_USER=postmaster@mg.rt-technologie.com" -ForegroundColor White
Write-Host "  SMTP_PASSWORD=f30e11eb5824d2194c1851bd1c142fbb-e80d8b76-ff2acfa2" -ForegroundColor White
Write-Host "  SMTP_FROM=postmaster@mg.rt-technologie.com" -ForegroundColor White
Write-Host ""
Write-Host "Temps: 5 minutes" -ForegroundColor Green
Write-Host "Cout: Gratuit pour commencer (500h/mois)" -ForegroundColor Green
Write-Host ""
Write-Host "Voulez-vous continuer avec AWS ECS (complexe) ?" -ForegroundColor Yellow
Write-Host "Tapez 'oui' pour continuer avec AWS, ou 'non' pour utiliser Railway" -ForegroundColor Yellow

$choix = Read-Host "Votre choix"

if ($choix -ne "oui") {
    Write-Host ""
    Write-Host "Parfait! Utilisez Railway.app pour un deploiement simple:" -ForegroundColor Green
    Write-Host "  https://railway.app/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Guide complet: DEPLOIEMENT_INTERFACE_AWS.md" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploiement AWS ECS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "PREREQUIS:" -ForegroundColor Red
Write-Host "  - Docker Desktop doit etre installe et demarre" -ForegroundColor Yellow
Write-Host "  - Cela va prendre 20-30 minutes" -ForegroundColor Yellow
Write-Host ""
Write-Host "Continuez ? (oui/non)" -ForegroundColor Yellow
$continuer = Read-Host

if ($continuer -ne "oui") {
    Write-Host "Deploiement annule" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Pour deployer sur AWS ECS, executez les commandes du fichier:" -ForegroundColor Yellow
Write-Host "  COMMANDES_CLOUDSHELL_AWS.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "Dans AWS CloudShell (console.aws.amazon.com)" -ForegroundColor Yellow
Write-Host ""
