#!/bin/bash

# Script de démarrage production
# Système de Sourcing Permanent - RT-Technologie

set -e

echo "================================================================================"
echo "DÉMARRAGE EN MODE PRODUCTION"
echo "================================================================================"
echo ""

# Couleurs pour affichage
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "wsgi.py" ]; then
    echo -e "${RED}Erreur: Script doit être exécuté depuis le répertoire RT-Technologie${NC}"
    exit 1
fi

# Vérifier Python
echo -e "${YELLOW}Vérification de Python...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Python 3 n'est pas installé${NC}"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
echo -e "${GREEN}✓ Python $PYTHON_VERSION détecté${NC}"

# Vérifier/créer environnement virtuel
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Création de l'environnement virtuel...${NC}"
    python3 -m venv venv
    echo -e "${GREEN}✓ Environnement virtuel créé${NC}"
fi

# Activer environnement virtuel
echo -e "${YELLOW}Activation de l'environnement virtuel...${NC}"
source venv/bin/activate

# Installer/mettre à jour les dépendances
echo -e "${YELLOW}Installation des dépendances...${NC}"
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt
echo -e "${GREEN}✓ Dépendances installées${NC}"

# Vérifier fichier .env
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Fichier .env non trouvé${NC}"
    echo -e "${YELLOW}Création depuis .env.example...${NC}"

    if [ -f ".env.example" ]; then
        cp .env.example .env

        # Générer SECRET_KEY aléatoire
        SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_hex(32))')

        # Remplacer dans .env (compatible Linux et macOS)
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s/CHANGEZ_CETTE_CLE_EN_PRODUCTION_UTILISEZ_SECRETS_TOKEN_HEX/$SECRET_KEY/" .env
        else
            sed -i "s/CHANGEZ_CETTE_CLE_EN_PRODUCTION_UTILISEZ_SECRETS_TOKEN_HEX/$SECRET_KEY/" .env
        fi

        echo -e "${GREEN}✓ Fichier .env créé avec SECRET_KEY aléatoire${NC}"
        echo -e "${YELLOW}⚠️  Vérifiez et modifiez .env selon vos besoins avant de continuer${NC}"
        echo ""
        read -p "Appuyez sur ENTRÉE pour continuer..."
    else
        echo -e "${RED}Erreur: .env.example non trouvé${NC}"
        exit 1
    fi
fi

# Créer répertoires nécessaires
echo -e "${YELLOW}Création des répertoires...${NC}"
mkdir -p logs run data
echo -e "${GREEN}✓ Répertoires créés${NC}"

# Vérifier le port
PORT=${PORT:-8000}
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${RED}⚠️  Le port $PORT est déjà utilisé${NC}"
    echo -e "${YELLOW}Arrêtez le processus ou changez le port dans .env${NC}"
    exit 1
fi

# Afficher configuration
echo ""
echo "================================================================================"
echo "CONFIGURATION"
echo "================================================================================"
echo -e "Mode: ${GREEN}PRODUCTION${NC}"
echo -e "Port: ${GREEN}$PORT${NC}"
echo -e "Workers: ${GREEN}$(python3 -c 'import multiprocessing; print(multiprocessing.cpu_count() * 2 + 1)')${NC}"
echo -e "Logs: ${GREEN}./logs/${NC}"
echo ""

# Demander confirmation
read -p "Démarrer le serveur ? (o/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[OoYy]$ ]]; then
    echo "Annulé"
    exit 0
fi

echo ""
echo "================================================================================"
echo "DÉMARRAGE DU SERVEUR"
echo "================================================================================"
echo ""

# Déterminer l'IP locale
LOCAL_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "localhost")

echo -e "${GREEN}Le serveur sera accessible à:${NC}"
echo ""
echo -e "  Local:    ${GREEN}http://localhost:$PORT${NC}"
echo -e "  Réseau:   ${GREEN}http://$LOCAL_IP:$PORT${NC}"
echo ""
echo "================================================================================"
echo ""
echo -e "${YELLOW}Appuyez sur CTRL+C pour arrêter le serveur${NC}"
echo ""

# Lancer Gunicorn
exec gunicorn --config gunicorn_config.py wsgi:application
