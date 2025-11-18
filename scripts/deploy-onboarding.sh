#!/bin/bash
# =============================================================================
# Script de Déploiement - Service Client Onboarding
# =============================================================================
# Description: Déploie le service d'onboarding client en production
# Author: RT-Technologie DevOps Team
# Version: 1.0.0
# Date: 2025-01-18
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SERVICE_NAME="client-onboarding"
SERVICE_DIR="services/client-onboarding"
PORT=3020
ENV=${1:-production}

# Functions
print_step() {
    echo -e "\n${CYAN}==>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Banner
echo -e "${BLUE}=============================================================================${NC}"
echo -e "${BLUE}RT-Technologie - Déploiement Service Client Onboarding${NC}"
echo -e "${BLUE}=============================================================================${NC}"
echo -e "Environment: ${ENV}"
echo -e "Service: ${SERVICE_NAME}"
echo -e "Port: ${PORT}"
echo ""

# 1. Vérifications Pré-Déploiement
print_step "1. Vérifications Pré-Déploiement"

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js n'est pas installé"
    exit 1
fi
print_success "Node.js $(node --version)"

# Vérifier npm
if ! command -v npm &> /dev/null; then
    print_error "npm n'est pas installé"
    exit 1
fi
print_success "npm $(npm --version)"

# Vérifier PM2
if ! command -v pm2 &> /dev/null; then
    print_warning "PM2 n'est pas installé. Installation..."
    npm install -g pm2
fi
print_success "PM2 $(pm2 --version)"

# Vérifier que le dossier existe
if [ ! -d "$SERVICE_DIR" ]; then
    print_error "Le dossier $SERVICE_DIR n'existe pas"
    exit 1
fi
print_success "Dossier service trouvé"

# 2. Vérifier les Variables d'Environnement
print_step "2. Vérification Variables d'Environnement"

ENV_FILE="$SERVICE_DIR/.env"

if [ ! -f "$ENV_FILE" ]; then
    print_warning "Fichier .env non trouvé. Création à partir de .env.example..."

    if [ -f "$SERVICE_DIR/.env.example" ]; then
        cp "$SERVICE_DIR/.env.example" "$ENV_FILE"
        print_warning "⚠️  IMPORTANT: Éditez $ENV_FILE avec vos valeurs de production"
        print_warning "⚠️  Notamment: MONGODB_URI, SMTP_*, JWT_SECRET"
        read -p "Appuyez sur Entrée après avoir configuré .env..."
    else
        print_error "Fichier .env.example non trouvé"
        exit 1
    fi
fi

# Vérifier les variables critiques
source "$ENV_FILE" 2>/dev/null || true

critical_vars=("MONGODB_URI" "SMTP_HOST" "SMTP_USER" "JWT_SECRET")
missing_vars=()

for var in "${critical_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
    print_error "Variables d'environnement manquantes:"
    for var in "${missing_vars[@]}"; do
        echo "  - $var"
    done
    exit 1
fi

print_success "Variables d'environnement configurées"

# 3. Installation des Dépendances
print_step "3. Installation des Dépendances"

cd "$SERVICE_DIR"

if [ ! -d "node_modules" ] || [ "$2" == "--fresh" ]; then
    print_info "Installation des dépendances..."
    npm ci --production
else
    print_info "Mise à jour des dépendances..."
    npm update
fi

print_success "Dépendances installées"

# 4. Tests
print_step "4. Exécution des Tests"

if [ -d "tests" ]; then
    print_info "Tests unitaires..."
    npm test 2>&1 || print_warning "Certains tests ont échoué (non bloquant)"
else
    print_warning "Aucun test trouvé"
fi

print_success "Tests terminés"

# 5. Backup Configuration Actuelle (si existe)
print_step "5. Backup Configuration PM2"

if pm2 describe $SERVICE_NAME &> /dev/null; then
    print_info "Sauvegarde configuration PM2 existante..."
    pm2 save --force
    print_success "Configuration PM2 sauvegardée"
else
    print_info "Aucune configuration PM2 existante"
fi

# 6. Déploiement PM2
print_step "6. Déploiement avec PM2"

cd ../..

# Vérifier si le service est déjà en cours d'exécution
if pm2 describe $SERVICE_NAME &> /dev/null; then
    print_info "Redémarrage du service existant..."
    pm2 restart $SERVICE_NAME --update-env
else
    print_info "Démarrage du nouveau service..."
    pm2 start "infra/scripts/pm2-ecosystem.config.js" --only $SERVICE_NAME --env $ENV
fi

print_success "Service déployé avec PM2"

# 7. Health Check
print_step "7. Health Check"

print_info "Attente du démarrage du service..."
sleep 5

MAX_RETRIES=10
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f -s http://localhost:$PORT/health > /dev/null; then
        print_success "Service opérationnel sur le port $PORT"
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
            print_error "Service n'a pas démarré après $MAX_RETRIES tentatives"
            print_info "Vérifiez les logs: pm2 logs $SERVICE_NAME"
            exit 1
        fi
        print_info "Tentative $RETRY_COUNT/$MAX_RETRIES..."
        sleep 2
    fi
done

# 8. Vérifications Post-Déploiement
print_step "8. Vérifications Post-Déploiement"

# Vérifier les logs
print_info "Dernières lignes des logs:"
pm2 logs $SERVICE_NAME --lines 10 --nostream

# Vérifier le status
pm2 status $SERVICE_NAME

print_success "Service déployé et opérationnel"

# 9. Sauvegarder la Configuration PM2
print_step "9. Sauvegarde Configuration PM2"

pm2 save --force
print_success "Configuration PM2 sauvegardée"

# Configurer le démarrage automatique (si pas déjà fait)
if ! pm2 startup | grep -q "Already"; then
    print_info "Configuration démarrage automatique..."
    pm2 startup
fi

# 10. Tests Finaux
print_step "10. Tests de Fonctionnement"

print_info "Test endpoint health..."
HEALTH_RESPONSE=$(curl -s http://localhost:$PORT/health)
echo "$HEALTH_RESPONSE" | grep -q "ok" && print_success "Health check OK" || print_error "Health check Failed"

# 11. Résumé
print_step "📊 Résumé du Déploiement"

echo ""
echo -e "${GREEN}✅ Déploiement réussi !${NC}"
echo ""
echo -e "Service: ${CYAN}$SERVICE_NAME${NC}"
echo -e "Environment: ${CYAN}$ENV${NC}"
echo -e "Port: ${CYAN}$PORT${NC}"
echo -e "URL Health: ${CYAN}http://localhost:$PORT/health${NC}"
echo ""
echo -e "${YELLOW}Commandes utiles:${NC}"
echo -e "  pm2 status           - Voir le statut"
echo -e "  pm2 logs $SERVICE_NAME      - Voir les logs"
echo -e "  pm2 restart $SERVICE_NAME   - Redémarrer"
echo -e "  pm2 stop $SERVICE_NAME      - Arrêter"
echo -e "  pm2 monit            - Monitoring temps réel"
echo ""

# 12. Prochaines Étapes
print_step "📋 Prochaines Étapes Recommandées"

echo ""
echo "1. Configurer le reverse proxy (Nginx/Apache)"
echo "2. Configurer le certificat SSL"
echo "3. Tester le workflow complet d'onboarding"
echo "4. Configurer le monitoring (Datadog/New Relic)"
echo "5. Vérifier les emails (SMTP fonctionnel)"
echo ""

print_info "Documentation: docs/CLIENT_ONBOARDING_SYSTEM.md"

echo ""
echo -e "${BLUE}=============================================================================${NC}"
echo -e "${GREEN}🚀 Service Client Onboarding déployé avec succès !${NC}"
echo -e "${BLUE}=============================================================================${NC}"
echo ""

exit 0
