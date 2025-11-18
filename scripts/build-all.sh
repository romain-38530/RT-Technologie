#!/bin/bash
# ============================================================================
# RT-Technologie - Build All Script
# ============================================================================
# Description: Build tous les services backend, apps frontend et packages
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
echo -e "${BLUE}RT-Technologie - Build Global${NC}"
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

# Start time
START_TIME=$(date +%s)

# Clean previous builds
print_step "Nettoyage des builds précédents..."
find . -name "dist" -type d -prune -exec rm -rf {} \; 2>/dev/null || true
find . -name ".next" -type d -prune -exec rm -rf {} \; 2>/dev/null || true
find . -name ".turbo" -type d -prune -exec rm -rf {} \; 2>/dev/null || true
print_success "Nettoyage terminé"

# Install dependencies
print_step "Installation des dépendances..."
pnpm install --frozen-lockfile
print_success "Dépendances installées"

# Build packages first (dependencies for services and apps)
print_step "Build des packages partagés..."
pnpm --filter "./packages/*" build
print_success "Packages buildés"

# Build backend services
print_step "Build des services backend (17 services)..."
pnpm --filter "./services/*" build
print_success "Services backend buildés"

# Build frontend apps
print_step "Build des applications frontend (9 apps)..."
pnpm --filter "./apps/web-*" build
pnpm --filter "./apps/backoffice-admin" build
pnpm --filter "./apps/mobile-driver" build
print_success "Applications frontend buildées"

# Calculate build time
END_TIME=$(date +%s)
BUILD_TIME=$((END_TIME - START_TIME))
MINUTES=$((BUILD_TIME / 60))
SECONDS=$((BUILD_TIME % 60))

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Build complet terminé avec succès!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Temps total: ${MINUTES}m ${SECONDS}s"
echo ""
echo "Résumé:"
echo "  - Packages: buildés"
echo "  - Services backend (17): buildés"
echo "  - Apps frontend (9): buildées"
echo ""
