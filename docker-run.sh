#!/bin/bash
# ============================================================================
# RT-Technologie - Docker Build & Run Script (Linux/Mac)
# ============================================================================
# Ce script build l'image Docker et lance le conteneur avec tous les services
# ============================================================================

# Configuration
IMAGE_NAME="rt-technologie"
IMAGE_TAG="latest"
CONTAINER_NAME="rt-technologie-container"
ENV_FILE=".env"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

echo -e "${CYAN}=====================================${NC}"
echo -e "${CYAN}RT-Technologie - Docker Setup${NC}"
echo -e "${CYAN}=====================================${NC}"
echo ""

# Vérifier si le fichier .env existe
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}ERREUR: Fichier $ENV_FILE introuvable!${NC}"
    echo -e "${YELLOW}Veuillez créer le fichier .env à partir de .env.example${NC}"
    exit 1
fi

echo -e "${YELLOW}[1/4] Arrêt et suppression du conteneur existant (si présent)...${NC}"
docker stop $CONTAINER_NAME 2>/dev/null
docker rm $CONTAINER_NAME 2>/dev/null

echo -e "${YELLOW}[2/4] Construction de l'image Docker...${NC}"
docker build -t "${IMAGE_NAME}:${IMAGE_TAG}" .

if [ $? -ne 0 ]; then
    echo -e "${RED}ERREUR: Échec de la construction de l'image!${NC}"
    exit 1
fi

echo -e "${YELLOW}[3/4] Lancement du conteneur...${NC}"
docker run -d \
    --name $CONTAINER_NAME \
    --env-file $ENV_FILE \
    -p 3000:3000 \
    -p 3001:3001 \
    -p 3002:3002 \
    -p 3003:3003 \
    -p 3004:3004 \
    -p 3005:3005 \
    -p 3006:3006 \
    -p 3007:3007 \
    -p 3008:3008 \
    -p 3009:3009 \
    -p 3011:3011 \
    -p 3012:3012 \
    -p 3013:3013 \
    -p 3014:3014 \
    -p 3015:3015 \
    -p 3016:3016 \
    -p 3017:3017 \
    -p 3018:3018 \
    -p 3019:3019 \
    -p 3020:3020 \
    -v "$(pwd):/app" \
    -v /app/node_modules \
    "${IMAGE_NAME}:${IMAGE_TAG}"

if [ $? -ne 0 ]; then
    echo -e "${RED}ERREUR: Échec du lancement du conteneur!${NC}"
    exit 1
fi

echo -e "${YELLOW}[4/4] Affichage des logs...${NC}"
echo ""
echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}Conteneur lancé avec succès!${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""
echo -e "${CYAN}Informations du conteneur:${NC}"
echo -e "${WHITE}  - Nom: $CONTAINER_NAME${NC}"
echo -e "${WHITE}  - Image: ${IMAGE_NAME}:${IMAGE_TAG}${NC}"
echo ""
echo -e "${CYAN}Ports exposés:${NC}"
echo -e "${WHITE}  - 3000-3009, 3011-3020${NC}"
echo ""
echo -e "${CYAN}Commandes utiles:${NC}"
echo -e "${WHITE}  - Voir les logs:       docker logs -f $CONTAINER_NAME${NC}"
echo -e "${WHITE}  - Arrêter:             docker stop $CONTAINER_NAME${NC}"
echo -e "${WHITE}  - Redémarrer:          docker restart $CONTAINER_NAME${NC}"
echo -e "${WHITE}  - Supprimer:           docker rm -f $CONTAINER_NAME${NC}"
echo -e "${WHITE}  - Entrer dans le bash: docker exec -it $CONTAINER_NAME bash${NC}"
echo ""
echo -e "${YELLOW}Affichage des logs en temps réel (Ctrl+C pour quitter):${NC}"
echo ""

# Suivre les logs
docker logs -f $CONTAINER_NAME
