# Installation AWS CLI pour Windows
# RT-Technologie - Deploiement AWS ECS

Write-Host "Installation AWS CLI..." -ForegroundColor Cyan
Write-Host ""

# URL de telechargement
$awsCliUrl = "https://awscli.amazonaws.com/AWSCLIV2.msi"
$installerPath = "$env:TEMP\AWSCLIV2.msi"

# Telecharger AWS CLI
Write-Host "Telechargement AWS CLI..." -ForegroundColor Yellow
try {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri $awsCliUrl -OutFile $installerPath -UseBasicParsing
    Write-Host "Telechargement termine" -ForegroundColor Green
} catch {
    Write-Host "Erreur lors du telechargement: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Vous pouvez telecharger manuellement depuis:" -ForegroundColor Yellow
    Write-Host "https://awscli.amazonaws.com/AWSCLIV2.msi" -ForegroundColor Cyan
    exit 1
}

# Installer
Write-Host ""
Write-Host "Installation en cours..." -ForegroundColor Yellow
Write-Host "Une fenetre d'installation va s'ouvrir..." -ForegroundColor Yellow
Write-Host ""

try {
    Start-Process msiexec.exe -Wait -ArgumentList "/i $installerPath /quiet"
    Write-Host "Installation terminee" -ForegroundColor Green
} catch {
    Write-Host "Erreur lors de l'installation: $_" -ForegroundColor Red
    exit 1
}

# Nettoyer
Remove-Item $installerPath -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "AWS CLI installe!" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT: Fermez et rouvrez PowerShell pour que les changements prennent effet" -ForegroundColor Yellow
Write-Host ""
Write-Host "Ensuite, configurez vos credentials AWS avec:" -ForegroundColor Yellow
Write-Host "  aws configure" -ForegroundColor Cyan
Write-Host ""
Write-Host "Vous aurez besoin de:" -ForegroundColor Yellow
Write-Host "  - AWS Access Key ID" -ForegroundColor White
Write-Host "  - AWS Secret Access Key" -ForegroundColor White
Write-Host "  - Region: eu-west-1" -ForegroundColor White
Write-Host ""
