#!/bin/bash
# ============================================================================
# RT-Technologie - Pre-Deployment Check Script
# ============================================================================
# Description: Vérifications avant déploiement
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
echo -e "${BLUE}RT-Technologie - Pre-Deployment Checks${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Initialize counters
CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_WARNING=0

# Function to print step
print_step() {
    echo -e "\n${BLUE}[CHECK]${NC} $1"
}

# Function to print success
print_success() {
    echo -e "${GREEN}  ✓${NC} $1"
    ((CHECKS_PASSED++))
}

# Function to print error
print_error() {
    echo -e "${RED}  ✗${NC} $1"
    ((CHECKS_FAILED++))
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}  ⚠${NC} $1"
    ((CHECKS_WARNING++))
}

# ============================================================================
# 1. Vérifier les fichiers .env.example
# ============================================================================
print_step "Vérification des fichiers .env.example..."

SERVICES_WITHOUT_ENV=()
for service in services/*; do
    if [ -d "$service" ]; then
        if [ ! -f "$service/.env.example" ]; then
            SERVICES_WITHOUT_ENV+=("$(basename $service)")
        fi
    fi
done

if [ ${#SERVICES_WITHOUT_ENV[@]} -eq 0 ]; then
    print_success "Tous les services ont un fichier .env.example"
else
    print_warning "Services sans .env.example: ${SERVICES_WITHOUT_ENV[*]}"
fi

# ============================================================================
# 2. Vérifier les Dockerfiles
# ============================================================================
print_step "Vérification des Dockerfiles..."

SERVICES_WITHOUT_DOCKERFILE=()
for service in services/*; do
    if [ -d "$service" ]; then
        if [ ! -f "$service/Dockerfile" ]; then
            SERVICES_WITHOUT_DOCKERFILE+=("$(basename $service)")
        fi
    fi
done

if [ ${#SERVICES_WITHOUT_DOCKERFILE[@]} -eq 0 ]; then
    print_success "Tous les services ont un Dockerfile"
else
    print_warning "Services sans Dockerfile: ${SERVICES_WITHOUT_DOCKERFILE[*]}"
fi

# ============================================================================
# 3. Vérifier les conflits de ports
# ============================================================================
print_step "Vérification des conflits de ports..."

PORTS=(3001 3002 3003 3004 3005 3006 3007 3008 3009 3011 3012 3013 3014 3015 3016 3017 3018 3019 3020)
PORTS_IN_USE=()

for port in "${PORTS[@]}"; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 || netstat -an | grep ":$port " | grep LISTEN >/dev/null 2>&1; then
        PORTS_IN_USE+=($port)
    fi
done

if [ ${#PORTS_IN_USE[@]} -eq 0 ]; then
    print_success "Aucun conflit de port détecté"
else
    print_warning "Ports déjà utilisés: ${PORTS_IN_USE[*]}"
fi

# ============================================================================
# 4. Vérifier les dépendances package.json
# ============================================================================
print_step "Vérification des dépendances package.json..."

if [ -f "pnpm-lock.yaml" ]; then
    if pnpm install --frozen-lockfile --dry-run > /dev/null 2>&1; then
        print_success "Dépendances cohérentes"
    else
        print_error "Problème avec les dépendances - exécuter 'pnpm install'"
    fi
else
    print_error "Fichier pnpm-lock.yaml manquant"
fi

# ============================================================================
# 5. Linting du code
# ============================================================================
print_step "Vérification du linting..."

if pnpm lint > /dev/null 2>&1; then
    print_success "Code lint réussi"
else
    print_error "Problèmes de linting détectés - exécuter 'pnpm lint --fix'"
fi

# ============================================================================
# 6. Vérification des types TypeScript
# ============================================================================
print_step "Vérification des types TypeScript..."

TYPE_ERRORS=$(pnpm --filter "./packages/*" --filter "./services/*" --filter "./apps/*" exec tsc --noEmit 2>&1 | grep "error TS" | wc -l || echo "0")

if [ "$TYPE_ERRORS" -eq "0" ]; then
    print_success "Aucune erreur de type détectée"
else
    print_error "$TYPE_ERRORS erreurs de type détectées"
fi

# ============================================================================
# 7. Audit de sécurité
# ============================================================================
print_step "Audit de sécurité (npm audit)..."

AUDIT_OUTPUT=$(pnpm audit --audit-level=high 2>&1 || echo "vulnerabilities")

if echo "$AUDIT_OUTPUT" | grep -q "0 vulnerabilities"; then
    print_success "Aucune vulnérabilité critique détectée"
elif echo "$AUDIT_OUTPUT" | grep -q "vulnerabilities"; then
    print_warning "Vulnérabilités détectées - exécuter 'pnpm audit' pour plus de détails"
else
    print_success "Audit de sécurité OK"
fi

# ============================================================================
# 8. Vérifier les variables d'environnement critiques
# ============================================================================
print_step "Vérification des variables d'environnement..."

REQUIRED_ENV_VARS=(
    "MONGODB_URI"
    "JWT_SECRET"
    "AWS_REGION"
)

MISSING_ENV_VARS=()
for var in "${REQUIRED_ENV_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_ENV_VARS+=($var)
    fi
done

if [ ${#MISSING_ENV_VARS[@]} -eq 0 ]; then
    print_success "Toutes les variables d'environnement critiques sont définies"
else
    print_warning "Variables manquantes: ${MISSING_ENV_VARS[*]}"
fi

# ============================================================================
# 9. Vérifier la version Git
# ============================================================================
print_step "Vérification Git..."

if git diff --quiet && git diff --cached --quiet; then
    print_success "Aucun changement non commité"
else
    print_warning "Changements non commités détectés"
fi

CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" == "main" ] || [ "$CURRENT_BRANCH" == "master" ]; then
    print_success "Branche de déploiement: $CURRENT_BRANCH"
else
    print_warning "Branche actuelle: $CURRENT_BRANCH (pas main/master)"
fi

# ============================================================================
# 10. Vérifier MongoDB
# ============================================================================
print_step "Vérification de la connexion MongoDB..."

if [ ! -z "$MONGODB_URI" ]; then
    print_success "URI MongoDB configurée"
else
    print_warning "URI MongoDB non configurée"
fi

# ============================================================================
# Summary
# ============================================================================
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Résumé des Vérifications${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Checks réussis:  ${GREEN}${CHECKS_PASSED}${NC}"
echo -e "Checks avertis:  ${YELLOW}${CHECKS_WARNING}${NC}"
echo -e "Checks échoués:  ${RED}${CHECKS_FAILED}${NC}"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    if [ $CHECKS_WARNING -eq 0 ]; then
        echo -e "${GREEN}✓ Tous les checks sont passés! Prêt pour le déploiement.${NC}"
        exit 0
    else
        echo -e "${YELLOW}⚠ Checks passés avec avertissements. Vérifiez avant de déployer.${NC}"
        exit 0
    fi
else
    echo -e "${RED}✗ Certains checks ont échoué. Corrigez les erreurs avant de déployer.${NC}"
    exit 1
fi
