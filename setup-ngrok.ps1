# Script d'installation et configuration Ngrok
# RT-Technologie - Mise en ligne système d'onboarding

Write-Host "🚀 Installation et configuration de Ngrok..." -ForegroundColor Cyan
Write-Host ""

# Configuration
$ngrokApiKey = "35eYhKmc82AHkWgHWFakEPH0hq0_6rTmgMyebQioiDrt4ERGj"
$installPath = "C:\ngrok"
$downloadUrl = "https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip"
$zipFile = "$env:TEMP\ngrok.zip"

# Créer le dossier d'installation
Write-Host "📁 Création du dossier d'installation..." -ForegroundColor Yellow
if (-not (Test-Path $installPath)) {
    New-Item -ItemType Directory -Path $installPath -Force | Out-Null
}

# Télécharger Ngrok
Write-Host "⬇️  Téléchargement de Ngrok..." -ForegroundColor Yellow
try {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri $downloadUrl -OutFile $zipFile -UseBasicParsing
    Write-Host "✅ Téléchargement terminé" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors du téléchargement: $_" -ForegroundColor Red
    exit 1
}

# Extraire
Write-Host "📦 Extraction..." -ForegroundColor Yellow
try {
    Expand-Archive -Path $zipFile -DestinationPath $installPath -Force
    Write-Host "✅ Extraction terminée" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors de l'extraction: $_" -ForegroundColor Red
    exit 1
}

# Nettoyer
Remove-Item $zipFile -Force -ErrorAction SilentlyContinue

# Configurer avec la clé API
Write-Host "🔑 Configuration de la clé API..." -ForegroundColor Yellow
$ngrokExe = "$installPath\ngrok.exe"

if (Test-Path $ngrokExe) {
    try {
        & $ngrokExe config add-authtoken $ngrokApiKey
        Write-Host "✅ Clé API configurée" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Avertissement: Impossible de configurer la clé automatiquement" -ForegroundColor Yellow
        Write-Host "   Vous pouvez la configurer manuellement avec:" -ForegroundColor Yellow
        Write-Host "   $ngrokExe config add-authtoken $ngrokApiKey" -ForegroundColor White
    }
} else {
    Write-Host "❌ ngrok.exe non trouvé dans $installPath" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Installation terminée!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Ngrok installé dans: $installPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎯 Prochaine étape: Lancer le tunnel" -ForegroundColor Yellow
Write-Host ""
Write-Host "Commande à exécuter:" -ForegroundColor White
Write-Host "  cd $installPath" -ForegroundColor Cyan
Write-Host "  .\ngrok.exe http 3020" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ou exécuter:" -ForegroundColor White
Write-Host "  .\launch-ngrok.ps1" -ForegroundColor Cyan
Write-Host ""

# Créer un script de lancement
$launchScript = @"
# Lancement du tunnel Ngrok
Write-Host "🚀 Lancement du tunnel Ngrok vers le backend..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend local: http://localhost:3020" -ForegroundColor Yellow
Write-Host ""
Write-Host "⏱️  Le tunnel va démarrer..." -ForegroundColor Yellow
Write-Host ""
Write-Host "📝 IMPORTANT:" -ForegroundColor Red
Write-Host "   1. Copiez l'URL HTTPS qui sera affichée" -ForegroundColor Yellow
Write-Host "   2. Laissez cette fenêtre ouverte" -ForegroundColor Yellow
Write-Host ""

Start-Sleep -Seconds 2

& "$installPath\ngrok.exe" http 3020
"@

$launchScript | Out-File -FilePath ".\launch-ngrok.ps1" -Encoding UTF8 -Force

Write-Host "✅ Script de lancement créé: launch-ngrok.ps1" -ForegroundColor Green
Write-Host ""
