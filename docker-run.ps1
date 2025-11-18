# ============================================================================
# RT-Technologie - Docker Build & Run Script (Windows PowerShell)
# ============================================================================
# Ce script build l'image Docker et lance le conteneur avec tous les services
# ============================================================================

# Configuration
$IMAGE_NAME = "rt-technologie"
$IMAGE_TAG = "latest"
$CONTAINER_NAME = "rt-technologie-container"
$ENV_FILE = ".env"

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "RT-Technologie - Docker Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si le fichier .env existe
if (-Not (Test-Path $ENV_FILE)) {
    Write-Host "ERREUR: Fichier $ENV_FILE introuvable!" -ForegroundColor Red
    Write-Host "Veuillez créer le fichier .env à partir de .env.example" -ForegroundColor Yellow
    exit 1
}

Write-Host "[1/4] Arrêt et suppression du conteneur existant (si présent)..." -ForegroundColor Yellow
docker stop $CONTAINER_NAME 2>$null
docker rm $CONTAINER_NAME 2>$null

Write-Host "[2/4] Construction de l'image Docker..." -ForegroundColor Yellow
docker build -t "${IMAGE_NAME}:${IMAGE_TAG}" .

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR: Échec de la construction de l'image!" -ForegroundColor Red
    exit 1
}

Write-Host "[3/4] Lancement du conteneur..." -ForegroundColor Yellow
docker run -d `
    --name $CONTAINER_NAME `
    --env-file $ENV_FILE `
    -p 3000:3000 `
    -p 3001:3001 `
    -p 3002:3002 `
    -p 3003:3003 `
    -p 3004:3004 `
    -p 3005:3005 `
    -p 3006:3006 `
    -p 3007:3007 `
    -p 3008:3008 `
    -p 3009:3009 `
    -p 3011:3011 `
    -p 3012:3012 `
    -p 3013:3013 `
    -p 3014:3014 `
    -p 3015:3015 `
    -p 3016:3016 `
    -p 3017:3017 `
    -p 3018:3018 `
    -p 3019:3019 `
    -p 3020:3020 `
    -v "${PWD}:/app" `
    -v /app/node_modules `
    "${IMAGE_NAME}:${IMAGE_TAG}"

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR: Échec du lancement du conteneur!" -ForegroundColor Red
    exit 1
}

Write-Host "[4/4] Affichage des logs..." -ForegroundColor Yellow
Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "Conteneur lancé avec succès!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Informations du conteneur:" -ForegroundColor Cyan
Write-Host "  - Nom: $CONTAINER_NAME" -ForegroundColor White
Write-Host "  - Image: ${IMAGE_NAME}:${IMAGE_TAG}" -ForegroundColor White
Write-Host ""
Write-Host "Ports exposés:" -ForegroundColor Cyan
Write-Host "  - 3000-3009, 3011-3020" -ForegroundColor White
Write-Host ""
Write-Host "Commandes utiles:" -ForegroundColor Cyan
Write-Host "  - Voir les logs:       docker logs -f $CONTAINER_NAME" -ForegroundColor White
Write-Host "  - Arrêter:             docker stop $CONTAINER_NAME" -ForegroundColor White
Write-Host "  - Redémarrer:          docker restart $CONTAINER_NAME" -ForegroundColor White
Write-Host "  - Supprimer:           docker rm -f $CONTAINER_NAME" -ForegroundColor White
Write-Host "  - Entrer dans le bash: docker exec -it $CONTAINER_NAME bash" -ForegroundColor White
Write-Host ""
Write-Host "Affichage des logs en temps réel (Ctrl+C pour quitter):" -ForegroundColor Yellow
Write-Host ""

# Suivre les logs
docker logs -f $CONTAINER_NAME
