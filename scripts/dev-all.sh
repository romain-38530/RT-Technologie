#!/bin/bash
# ============================================================================
# RT-Technologie - Dev All Script
# ============================================================================
# Description: Démarrer tous les services et apps en mode développement
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
echo -e "${BLUE}RT-Technologie - Mode Développement${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to print info
print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}Erreur: pnpm n'est pas installé${NC}"
    echo "Installez pnpm: npm install -g pnpm"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_info "Installation des dépendances..."
    pnpm install
fi

echo -e "${GREEN}Démarrage de tous les services et applications...${NC}"
echo ""
echo "Services backend disponibles sur:"
echo "  - core-orders:     http://localhost:3001"
echo "  - notifications:   http://localhost:3002"
echo "  - tms-sync:        http://localhost:3003"
echo "  - planning:        http://localhost:3004"
echo "  - affret-ia:       http://localhost:3005"
echo "  - vigilance:       http://localhost:3006"
echo "  - authz:           http://localhost:3007"
echo "  - admin-gateway:   http://localhost:3008"
echo "  - ecpmr:           http://localhost:3009"
echo "  - palette:         http://localhost:3011"
echo "  - training:        http://localhost:3012"
echo "  - storage-market:  http://localhost:3013"
echo "  - pricing-grids:   http://localhost:3014"
echo "  - tracking-ia:     http://localhost:3015"
echo "  - bourse:          http://localhost:3016"
echo "  - wms-sync:        http://localhost:3017"
echo "  - erp-sync:        http://localhost:3018"
echo "  - chatbot:         http://localhost:3019"
echo "  - geo-tracking:    http://localhost:3020"
echo ""
echo "Applications frontend disponibles sur:"
echo "  - web-industry:     http://localhost:4001"
echo "  - web-transporter:  http://localhost:4002"
echo "  - web-forwarder:    http://localhost:4003"
echo "  - web-recipient:    http://localhost:4004"
echo "  - web-supplier:     http://localhost:4005"
echo "  - web-logistician:  http://localhost:4006"
echo "  - backoffice-admin: http://localhost:4007"
echo "  - mobile-driver:    http://localhost:4008"
echo "  - kiosk:            http://localhost:4009"
echo ""
print_info "Utiliser Ctrl+C pour arrêter tous les services"
echo ""

# Start all services and apps in parallel using Turbo
pnpm turbo run dev --parallel

# If turbo is not available, fallback to regular pnpm
# pnpm run dev
