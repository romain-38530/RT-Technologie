#!/bin/bash
# =============================================================================
# Script de déploiement de TOUS les frontends sur Vercel
# RT-Technologie
# =============================================================================

set -e

VERCEL_TOKEN="79eVweIfP4CXv9dGDuDRS5hz"

# Couleurs pour l'affichage
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "════════════════════════════════════════════════════════"
echo "🚀 Déploiement de TOUS les Frontends sur Vercel"
echo "════════════════════════════════════════════════════════"
echo ""

# Vérifier que Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLI n'est pas installé"
    echo "Installation en cours..."
    npm install -g vercel
fi

# URLs des APIs backend (À REMPLACER avec les vraies IPs)
API_URL="http://3.79.182.74:3020"
ORDERS_API_URL="http://REPLACE_WITH_CORE_ORDERS_IP:3030"
AFFRET_API_URL="http://REPLACE_WITH_AFFRET_IA_IP:3010"
VIGILANCE_API_URL="http://REPLACE_WITH_VIGILANCE_IP:3040"
AUTHZ_URL="http://REPLACE_WITH_AUTHZ_IP:3007"
NOTIFICATIONS_URL="http://REPLACE_WITH_NOTIFICATIONS_IP:3050"

echo "📋 Configuration des APIs Backend:"
echo "  API_URL: $API_URL"
echo "  ORDERS_API_URL: $ORDERS_API_URL"
echo "  AFFRET_API_URL: $AFFRET_API_URL"
echo "  VIGILANCE_API_URL: $VIGILANCE_API_URL"
echo "  AUTHZ_URL: $AUTHZ_URL"
echo ""

# Liste des frontends à déployer
declare -A FRONTENDS=(
    ["marketing-site"]="NEXT_PUBLIC_API_URL=$API_URL"
    ["web-industry"]="NEXT_PUBLIC_API_URL=$API_URL NEXT_PUBLIC_ORDERS_API_URL=$ORDERS_API_URL NEXT_PUBLIC_AFFRET_API_URL=$AFFRET_API_URL NEXT_PUBLIC_VIGILANCE_API_URL=$VIGILANCE_API_URL NEXT_PUBLIC_AUTHZ_URL=$AUTHZ_URL"
    ["backoffice-admin"]="NEXT_PUBLIC_API_URL=$API_URL NEXT_PUBLIC_ORDERS_API_URL=$ORDERS_API_URL NEXT_PUBLIC_AFFRET_API_URL=$AFFRET_API_URL NEXT_PUBLIC_VIGILANCE_API_URL=$VIGILANCE_API_URL NEXT_PUBLIC_AUTHZ_URL=$AUTHZ_URL NEXT_PUBLIC_NOTIFICATIONS_URL=$NOTIFICATIONS_URL"
    ["web-logistician"]="NEXT_PUBLIC_API_URL=$API_URL NEXT_PUBLIC_ORDERS_API_URL=$ORDERS_API_URL"
    ["web-transporter"]="NEXT_PUBLIC_API_URL=$API_URL NEXT_PUBLIC_ORDERS_API_URL=$ORDERS_API_URL"
    ["web-recipient"]="NEXT_PUBLIC_API_URL=$API_URL NEXT_PUBLIC_ORDERS_API_URL=$ORDERS_API_URL"
    ["web-supplier"]="NEXT_PUBLIC_API_URL=$API_URL NEXT_PUBLIC_ORDERS_API_URL=$ORDERS_API_URL"
    ["web-forwarder"]="NEXT_PUBLIC_API_URL=$API_URL NEXT_PUBLIC_ORDERS_API_URL=$ORDERS_API_URL NEXT_PUBLIC_AFFRET_API_URL=$AFFRET_API_URL"
)

TOTAL=${#FRONTENDS[@]}
COUNTER=1
DEPLOYED=0
FAILED=0

# Fonction de déploiement
deploy_frontend() {
    local APP_NAME=$1
    local ENV_VARS=$2

    echo ""
    echo -e "${BLUE}[$COUNTER/$TOTAL]${NC} Déploiement de ${GREEN}$APP_NAME${NC}..."
    echo "────────────────────────────────────────────────────────"

    if [ ! -d "apps/$APP_NAME" ]; then
        echo -e "${YELLOW}⚠️  Dossier apps/$APP_NAME introuvable${NC}"
        ((FAILED++))
        ((COUNTER++))
        return
    fi

    cd "apps/$APP_NAME"

    # Construire la commande avec les variables d'environnement
    CMD="vercel --token=$VERCEL_TOKEN --prod --yes"

    # Ajouter les variables d'environnement
    for var in $ENV_VARS; do
        CMD="$CMD -e $var"
    done

    # Ajouter le nom du projet
    CMD="$CMD --name=$APP_NAME"

    # Exécuter le déploiement
    if eval $CMD > /tmp/deploy-$APP_NAME.log 2>&1; then
        URL=$(grep -o 'https://[^[:space:]]*vercel.app' /tmp/deploy-$APP_NAME.log | tail -1)
        echo -e "  ${GREEN}✓${NC} Déployé avec succès"
        echo -e "  ${BLUE}→${NC} URL: $URL"
        ((DEPLOYED++))
    else
        echo -e "  ${YELLOW}❌${NC} Échec du déploiement"
        echo "  Voir les logs: /tmp/deploy-$APP_NAME.log"
        tail -5 /tmp/deploy-$APP_NAME.log
        ((FAILED++))
    fi

    cd ../..
    ((COUNTER++))
}

# Déployer tous les frontends
echo "🚀 Démarrage des déploiements..."

for app in "${!FRONTENDS[@]}"; do
    deploy_frontend "$app" "${FRONTENDS[$app]}"
done

echo ""
echo "════════════════════════════════════════════════════════"
echo "📊 RÉSUMÉ DES DÉPLOIEMENTS"
echo "════════════════════════════════════════════════════════"
echo ""
echo -e "${GREEN}✓ Réussis:${NC} $DEPLOYED/$TOTAL"
if [ $FAILED -gt 0 ]; then
    echo -e "${YELLOW}❌ Échecs:${NC} $FAILED/$TOTAL"
fi
echo ""

# Liste des URLs déployées
echo "🌐 URLs des frontends déployés:"
echo ""

for app in "${!FRONTENDS[@]}"; do
    if [ -f "/tmp/deploy-$app.log" ]; then
        URL=$(grep -o 'https://[^[:space:]]*vercel.app' /tmp/deploy-$app.log | tail -1)
        if [ -n "$URL" ]; then
            echo "  ✓ $app: $URL"
        fi
    fi
done

echo ""
echo "════════════════════════════════════════════════════════"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ TOUS LES FRONTENDS ONT ÉTÉ DÉPLOYÉS${NC}"
else
    echo -e "${YELLOW}⚠️  Certains déploiements ont échoué${NC}"
    echo "Vérifiez les logs dans /tmp/deploy-*.log"
fi

echo "════════════════════════════════════════════════════════"
echo ""
