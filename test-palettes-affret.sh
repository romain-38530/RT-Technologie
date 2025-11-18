#!/bin/bash

# Script de test pour le module Palettes + Affret.IA
# Usage: bash test-palettes-affret.sh

echo "========================================"
echo "Tests Module Palettes + Affret.IA"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
PALETTE_URL="http://localhost:3011"
AFFRET_URL="http://localhost:3005"

# Test 1: Health checks
echo -e "${YELLOW}[TEST 1]${NC} Vérification des services..."
echo ""

echo "Service Palette (port 3011):"
curl -s ${PALETTE_URL}/health | jq . || echo -e "${RED}ERREUR: Service Palette non disponible${NC}"
echo ""

echo "Service Affret.IA (port 3005):"
curl -s ${AFFRET_URL}/health | jq . || echo -e "${RED}ERREUR: Service Affret.IA non disponible${NC}"
echo ""
echo "---"
echo ""

# Test 2: Optimisation de route
echo -e "${YELLOW}[TEST 2]${NC} Optimisation de route avec palettes..."
echo ""

curl -s -X POST ${AFFRET_URL}/affret/optimize-pallet-routes \
  -H "Content-Type: application/json" \
  -d '{
    "deliveries": [
      {
        "orderId": "ORD-001",
        "location": { "lat": 48.8566, "lng": 2.3522 },
        "pallets": 33,
        "address": "15 Rue de Rivoli, Paris",
        "companyId": "IND-1"
      },
      {
        "orderId": "ORD-002",
        "location": { "lat": 48.9023, "lng": 2.3789 },
        "pallets": 20,
        "address": "Zone Industrielle Nord, Paris",
        "companyId": "IND-1"
      }
    ]
  }' | jq .

echo ""
echo "---"
echo ""

# Test 3: Alertes palettes
echo -e "${YELLOW}[TEST 3]${NC} Récupération des alertes palettes..."
echo ""

curl -s ${AFFRET_URL}/affret/pallet-alerts | jq .

echo ""
echo "---"
echo ""

# Test 4: Liste des sites
echo -e "${YELLOW}[TEST 4]${NC} Liste des sites de retour..."
echo ""

curl -s ${PALETTE_URL}/palette/sites | jq .

echo ""
echo "---"
echo ""

# Test 5: Ledger d'une entreprise
echo -e "${YELLOW}[TEST 5]${NC} Ledger de l'entreprise IND-1..."
echo ""

curl -s ${PALETTE_URL}/palette/ledger/IND-1 | jq .

echo ""
echo "---"
echo ""

# Test 6: Modification quota d'un site
echo -e "${YELLOW}[TEST 6]${NC} Modification du quota du site SITE-PARIS-1..."
echo ""

curl -s -X POST ${PALETTE_URL}/palette/sites/SITE-PARIS-1/quota \
  -H "Content-Type: application/json" \
  -d '{"dailyMax": 180}' | jq .

echo ""
echo "---"
echo ""

# Résumé
echo ""
echo "========================================"
echo -e "${GREEN}Tests terminés !${NC}"
echo "========================================"
echo ""
echo "Prochaines étapes :"
echo "1. Ouvrir le backoffice admin: http://localhost:3000/palettes"
echo "2. Consulter la documentation: docs/MODULE_PALETTES_ADMIN_AFFRET.md"
echo "3. Tester les scénarios complets: docs/TESTS_PALETTES_AFFRET.md"
echo ""
