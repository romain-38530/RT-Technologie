#!/bin/bash
# ============================================================================
# RT-Technologie - Main Deployment Script
# ============================================================================
# Description: Script principal de déploiement complet
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

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}RT-Technologie - Déploiement Complet${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to print step
print_step() {
    echo -e "\n${BLUE}[STEP]${NC} $1"
}

# Function to print success
print_success() {
    echo -e "${GREEN}  ✓${NC} $1"
}

# Function to print error
print_error() {
    echo -e "${RED}  ✗${NC} $1"
}

# Function to print info
print_info() {
    echo -e "${YELLOW}  ℹ${NC} $1"
}

# Start time
START_TIME=$(date +%s)

# ============================================================================
# 1. Pre-deployment checks
# ============================================================================
print_step "1. Exécution des vérifications pré-déploiement..."

if ./scripts/pre-deploy-check.sh; then
    print_success "Vérifications réussies"
else
    print_error "Échec des vérifications pré-déploiement"
    exit 1
fi

# ============================================================================
# 2. Run tests
# ============================================================================
print_step "2. Exécution des tests..."

if ./scripts/test-all.sh; then
    print_success "Tests réussis"
else
    print_error "Échec des tests"
    read -p "$(echo -e ${YELLOW}Continuer malgré l\'échec des tests? [y/N]: ${NC})" -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# ============================================================================
# 3. Build
# ============================================================================
print_step "3. Build de tous les composants..."

if ./scripts/build-all.sh; then
    print_success "Build réussi"
else
    print_error "Échec du build"
    exit 1
fi

# ============================================================================
# 4. Create backup
# ============================================================================
print_step "4. Création d'un backup..."

BACKUP_DIR="/opt/rt-technologie/backups"
if [ ! -d "$BACKUP_DIR" ]; then
    mkdir -p "$BACKUP_DIR"
    print_info "Répertoire de backup créé: $BACKUP_DIR"
fi

BACKUP_FILE="$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).tar.gz"
tar -czf "$BACKUP_FILE" \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='backups' \
    --exclude='logs' \
    . 2>/dev/null || echo "Warning: Some files were not backed up"

print_success "Backup créé: $BACKUP_FILE"

# ============================================================================
# 5. Database migration
# ============================================================================
print_step "5. Migration de la base de données..."

if node infra/scripts/migrate-db.js; then
    print_success "Migration réussie"
else
    print_error "Échec de la migration"
    exit 1
fi

# ============================================================================
# 6. Deploy backend services
# ============================================================================
print_step "6. Déploiement des services backend..."

if command -v pm2 &> /dev/null; then
    # Stop all services
    pm2 stop all 2>/dev/null || echo "No PM2 processes running"

    # Start with ecosystem file
    pm2 start infra/scripts/pm2-ecosystem.config.js

    # Save PM2 configuration
    pm2 save

    print_success "Services backend déployés"
else
    print_error "PM2 n'est pas installé"
    exit 1
fi

# ============================================================================
# 7. Wait for services to be ready
# ============================================================================
print_step "7. Vérification de la santé des services..."

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
    print_success "Tous les services sont opérationnels ($SERVICES_OK/19)"
else
    print_error "$SERVICES_FAILED services ne répondent pas"
    print_info "Utilisez './scripts/monitor-services.sh --once' pour plus de détails"
fi

# ============================================================================
# 8. Deploy frontend (optional - Vercel)
# ============================================================================
print_step "8. Déploiement frontend (Vercel)..."

if command -v vercel &> /dev/null; then
    read -p "$(echo -e ${YELLOW}Déployer les apps frontend sur Vercel? [y/N]: ${NC})" -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        vercel --prod
        print_success "Frontend déployé sur Vercel"
    else
        print_info "Déploiement frontend ignoré"
    fi
else
    print_info "Vercel CLI non installé - déploiement frontend ignoré"
fi

# ============================================================================
# Summary
# ============================================================================
END_TIME=$(date +%s)
DEPLOY_TIME=$((END_TIME - START_TIME))
MINUTES=$((DEPLOY_TIME / 60))
SECONDS=$((DEPLOY_TIME % 60))

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Déploiement terminé avec succès!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Temps total: ${MINUTES}m ${SECONDS}s"
echo -e "Services opérationnels: ${GREEN}$SERVICES_OK${NC}/${GREEN}19${NC}"
if [ $SERVICES_FAILED -gt 0 ]; then
    echo -e "Services en échec: ${RED}$SERVICES_FAILED${NC}"
fi
echo -e "Backup: $BACKUP_FILE"
echo ""
echo "Prochaines étapes:"
echo "  1. Vérifier les logs: pm2 logs"
echo "  2. Monitoring: ./scripts/monitor-services.sh"
echo "  3. Consulter la checklist: docs/DEPLOYMENT_CHECKLIST.md"
echo ""
