#!/bin/bash
# ============================================================================
# RT-Technologie - Rollback Script
# ============================================================================
# Description: Rollback vers une version précédente
# Author: RT-Technologie DevOps Team
# Version: 1.0.0
# Date: 2025-11-18
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="/opt/rt-technologie/backups"
DEPLOY_DIR="/opt/rt-technologie"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}RT-Technologie - Rollback${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to print step
print_step() {
    echo -e "\n${YELLOW}==>${NC} $1"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Function to print error
print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Function to print info
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ] && [ -z "$SUDO_USER" ]; then
    print_error "Ce script doit être exécuté avec sudo"
    exit 1
fi

# Create backup directory if it doesn't exist
if [ ! -d "$BACKUP_DIR" ]; then
    print_error "Répertoire de backup $BACKUP_DIR n'existe pas"
    exit 1
fi

# List available backups
print_step "Backups disponibles:"
echo ""

BACKUPS=($(ls -1t "$BACKUP_DIR" | grep "^backup-" 2>/dev/null || echo ""))

if [ ${#BACKUPS[@]} -eq 0 ]; then
    print_error "Aucun backup disponible"
    exit 1
fi

# Display backups with index
for i in "${!BACKUPS[@]}"; do
    backup="${BACKUPS[$i]}"
    backup_date=$(echo "$backup" | sed 's/backup-//')
    echo -e "  ${GREEN}[$i]${NC} $backup ($(date -d "$backup_date" '+%Y-%m-%d %H:%M:%S' 2>/dev/null || echo "$backup_date"))"
done

echo ""

# Ask user to select backup
read -p "Sélectionnez le numéro du backup à restaurer [0-$((${#BACKUPS[@]} - 1))]: " BACKUP_INDEX

# Validate input
if ! [[ "$BACKUP_INDEX" =~ ^[0-9]+$ ]] || [ "$BACKUP_INDEX" -ge "${#BACKUPS[@]}" ]; then
    print_error "Sélection invalide"
    exit 1
fi

SELECTED_BACKUP="${BACKUPS[$BACKUP_INDEX]}"
BACKUP_PATH="$BACKUP_DIR/$SELECTED_BACKUP"

print_info "Backup sélectionné: $SELECTED_BACKUP"
echo ""

# Confirmation
read -p "$(echo -e ${YELLOW}Êtes-vous sûr de vouloir rollback vers cette version? [y/N]: ${NC})" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_info "Rollback annulé"
    exit 0
fi

# Start rollback
START_TIME=$(date +%s)

print_step "Arrêt des services PM2..."
pm2 stop all || echo "Aucun service PM2 en cours d'exécution"
print_success "Services arrêtés"

print_step "Sauvegarde de l'état actuel..."
CURRENT_BACKUP="$BACKUP_DIR/backup-before-rollback-$(date +%Y%m%d-%H%M%S).tar.gz"
cd "$DEPLOY_DIR"
tar -czf "$CURRENT_BACKUP" \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='backups' \
    --exclude='logs' \
    . 2>/dev/null || echo "Warning: Some files were not backed up"
print_success "État actuel sauvegardé dans $CURRENT_BACKUP"

print_step "Restauration du backup..."

# Extract backup
cd "$DEPLOY_DIR"
tar -xzf "$BACKUP_PATH" --overwrite

print_success "Backup restauré"

print_step "Installation des dépendances..."
pnpm install --frozen-lockfile
print_success "Dépendances installées"

print_step "Build du projet..."
pnpm build
print_success "Build terminé"

print_step "Redémarrage des services PM2..."
pm2 restart all || pm2 start infra/scripts/pm2-ecosystem.config.js
print_success "Services redémarrés"

# Wait for services to be ready
print_step "Vérification de la santé des services..."
sleep 10

SERVICES_OK=0
SERVICES_FAILED=0

for port in 3001 3002 3003 3004 3005 3006 3007 3008 3009 3011 3012 3013 3014 3015 3016 3017 3018 3019 3020; do
    if curl -s --max-time 2 "http://localhost:$port/health" > /dev/null 2>&1; then
        ((SERVICES_OK++))
    else
        ((SERVICES_FAILED++))
    fi
done

if [ $SERVICES_FAILED -eq 0 ]; then
    print_success "Tous les services sont opérationnels ($SERVICES_OK/$((SERVICES_OK + SERVICES_FAILED)))"
else
    print_error "$SERVICES_FAILED services ne répondent pas"
fi

# Calculate rollback time
END_TIME=$(date +%s)
ROLLBACK_TIME=$((END_TIME - START_TIME))
MINUTES=$((ROLLBACK_TIME / 60))
SECONDS=$((ROLLBACK_TIME % 60))

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Rollback terminé avec succès!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Temps total: ${MINUTES}m ${SECONDS}s"
echo -e "Version restaurée: $SELECTED_BACKUP"
echo -e "Backup de l'ancienne version: $CURRENT_BACKUP"
echo ""
echo "Vérifiez l'état des services avec:"
echo "  pm2 status"
echo "  ./scripts/monitor-services.sh --once"
echo ""
