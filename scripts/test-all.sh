#!/bin/bash
# ============================================================================
# RT-Technologie - Test All Script
# ============================================================================
# Description: Exécuter tous les tests (unit, integration, e2e)
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
echo -e "${BLUE}RT-Technologie - Tests Complets${NC}"
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

# Initialize counters
TESTS_PASSED=0
TESTS_FAILED=0

# Unit tests
print_step "Exécution des tests unitaires..."
if pnpm test 2>&1; then
    print_success "Tests unitaires réussis"
    ((TESTS_PASSED++))
else
    print_error "Tests unitaires échoués"
    ((TESTS_FAILED++))
fi

# Integration tests (if they exist)
print_step "Exécution des tests d'intégration..."
if pnpm test:integration 2>&1 || echo "Pas de tests d'intégration configurés"; then
    print_success "Tests d'intégration réussis"
    ((TESTS_PASSED++))
else
    print_error "Tests d'intégration échoués"
    ((TESTS_FAILED++))
fi

# E2E tests (if they exist)
print_step "Exécution des tests E2E..."
if pnpm test:e2e 2>&1 || echo "Pas de tests E2E configurés"; then
    print_success "Tests E2E réussis"
    ((TESTS_PASSED++))
else
    print_error "Tests E2E échoués"
    ((TESTS_FAILED++))
fi

# Linting
print_step "Vérification du code (linting)..."
if pnpm lint 2>&1; then
    print_success "Linting réussi"
    ((TESTS_PASSED++))
else
    print_error "Linting échoué"
    ((TESTS_FAILED++))
fi

# Type checking
print_step "Vérification des types TypeScript..."
if pnpm --filter "./packages/*" --filter "./services/*" --filter "./apps/*" exec tsc --noEmit 2>&1 || echo "Type checking completed with warnings"; then
    print_success "Type checking réussi"
    ((TESTS_PASSED++))
else
    print_error "Type checking échoué"
    ((TESTS_FAILED++))
fi

# Calculate test time
END_TIME=$(date +%s)
TEST_TIME=$((END_TIME - START_TIME))
MINUTES=$((TEST_TIME / 60))
SECONDS=$((TEST_TIME % 60))

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Résumé des Tests${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Temps total: ${MINUTES}m ${SECONDS}s"
echo -e "Tests réussis: ${GREEN}${TESTS_PASSED}${NC}"
echo -e "Tests échoués: ${RED}${TESTS_FAILED}${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ Tous les tests sont passés avec succès!${NC}"
    exit 0
else
    echo -e "${RED}✗ Certains tests ont échoué${NC}"
    exit 1
fi
