# Script d'installation et configuration Ngrok
# RT-Technologie - Mise en ligne systeme d'onboarding

Write-Host "Installation et configuration de Ngrok..." -ForegroundColor Cyan
Write-Host ""

# Configuration
$ngrokApiKey = "35eYhKmc82AHkWgHWFakEPH0hq0_6rTmgMyebQioiDrt4ERGj"
$installPath = "C:\ngrok"
$downloadUrl = "https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip"
$zipFile = "$env:TEMP\ngrok.zip"

# Creer le dossier d'installation
Write-Host "Creation du dossier d'installation..." -ForegroundColor Yellow
if (-not (Test-Path $installPath)) {
    New-Item -ItemType Directory -Path $installPath -Force | Out-Null
}

# Telecharger Ngrok
Write-Host "Telechargement de Ngrok..." -ForegroundColor Yellow
try {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri $downloadUrl -OutFile $zipFile -UseBasicParsing
    Write-Host "Telechargement termine" -ForegroundColor Green
} catch {
    Write-Host "Erreur lors du telechargement: $_" -ForegroundColor Red
    exit 1
}

# Extraire
Write-Host "Extraction..." -ForegroundColor Yellow
try {
    Expand-Archive -Path $zipFile -DestinationPath $installPath -Force
    Write-Host "Extraction terminee" -ForegroundColor Green
} catch {
    Write-Host "Erreur lors de l'extraction: $_" -ForegroundColor Red
    exit 1
}

# Nettoyer
Remove-Item $zipFile -Force -ErrorAction SilentlyContinue

# Configurer avec la cle API
Write-Host "Configuration de la cle API..." -ForegroundColor Yellow
$ngrokExe = "$installPath\ngrok.exe"

if (Test-Path $ngrokExe) {
    try {
        & $ngrokExe config add-authtoken $ngrokApiKey
        Write-Host "Cle API configuree" -ForegroundColor Green
    } catch {
        Write-Host "Avertissement: Impossible de configurer la cle automatiquement" -ForegroundColor Yellow
        Write-Host "   Vous pouvez la configurer manuellement avec:" -ForegroundColor Yellow
        Write-Host "   $ngrokExe config add-authtoken $ngrokApiKey" -ForegroundColor White
    }
} else {
    Write-Host "ngrok.exe non trouve dans $installPath" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Installation terminee!" -ForegroundColor Green
Write-Host ""
Write-Host "Ngrok installe dans: $installPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "Prochaine etape: Lancer le tunnel" -ForegroundColor Yellow
Write-Host ""
Write-Host "Commande a executer:" -ForegroundColor White
Write-Host "  cd $installPath" -ForegroundColor Cyan
Write-Host "  .\ngrok.exe http 3020" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ou executer:" -ForegroundColor White
Write-Host "  .\launch-ngrok.ps1" -ForegroundColor Cyan
Write-Host ""

# Creer un script de lancement
$launchScriptContent = @'
# Lancement du tunnel Ngrok
Write-Host "Lancement du tunnel Ngrok vers le backend..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend local: http://localhost:3020" -ForegroundColor Yellow
Write-Host ""
Write-Host "Le tunnel va demarrer..." -ForegroundColor Yellow
Write-Host ""
Write-Host "IMPORTANT:" -ForegroundColor Red
Write-Host "   1. Copiez l URL HTTPS qui sera affichee" -ForegroundColor Yellow
Write-Host "   2. Laissez cette fenetre ouverte" -ForegroundColor Yellow
Write-Host ""

Start-Sleep -Seconds 2

& "C:\ngrok\ngrok.exe" http 3020
'@

$launchScriptContent | Out-File -FilePath ".\launch-ngrok.ps1" -Encoding UTF8 -Force

Write-Host "Script de lancement cree: launch-ngrok.ps1" -ForegroundColor Green
Write-Host ""
