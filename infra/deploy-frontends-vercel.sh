#!/bin/bash
# =============================================================================
# Script de déploiement des applications frontend sur Vercel
# RT-Technologie - Compatible Monorepo Turbo/pnpm
# =============================================================================

set -e

VERCEL_TOKEN="79eVweIfP4CXv9dGDuDRS5hz"

# Applications frontend à déployer
declare -A APPS=(
  ["marketing-site"]="marketing-site"
  ["backoffice-admin"]="backoffice-admin"
)

echo "========================================="
echo "🚀 Déploiement Frontends sur Vercel"
echo "========================================="
echo ""

# Installer Vercel CLI si nécessaire
if ! command -v vercel &> /dev/null; then
  echo "📦 Installation de Vercel CLI..."
  npm install -g vercel
fi

echo "🔐 Configuration du token Vercel..."
export VERCEL_TOKEN=$VERCEL_TOKEN

# Récupérer les IPs des services backend
echo ""
echo "🌐 Récupération des IPs des services backend..."
REGION="eu-central-1"
CLUSTER="rt-technologie-cluster"

# Fonction pour récupérer l'IP d'un service
get_service_ip() {
  local service=$1
  TASK_ARN=$(aws ecs list-tasks \
    --cluster $CLUSTER \
    --service-name rt-$service-service \
    --region $REGION \
    --query 'taskArns[0]' \
    --output text 2>/dev/null || echo "")

  if [ -n "$TASK_ARN" ] && [ "$TASK_ARN" != "None" ]; then
    ENI_ID=$(aws ecs describe-tasks \
      --cluster $CLUSTER \
      --tasks $TASK_ARN \
      --region $REGION \
      --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' \
      --output text 2>/dev/null || echo "")

    if [ -n "$ENI_ID" ]; then
      PUBLIC_IP=$(aws ec2 describe-network-interfaces \
        --network-interface-ids $ENI_ID \
        --region $REGION \
        --query 'NetworkInterfaces[0].Association.PublicIp' \
        --output text 2>/dev/null || echo "")
      echo $PUBLIC_IP
    fi
  fi
}

CLIENT_ONBOARDING_IP=$(get_service_ip "client-onboarding")
CORE_ORDERS_IP=$(get_service_ip "core-orders")
AFFRET_IA_IP=$(get_service_ip "affret-ia")
VIGILANCE_IP=$(get_service_ip "vigilance")

echo "  ✓ client-onboarding: $CLIENT_ONBOARDING_IP:3020"
echo "  ✓ core-orders: $CORE_ORDERS_IP:3030"
echo "  ✓ affret-ia: $AFFRET_IA_IP:3010"
echo "  ✓ vigilance: $VIGILANCE_IP:3040"

# Déployer chaque application
echo ""
echo "🚢 Déploiement des applications frontend..."

for app in "${!APPS[@]}"; do
  APP_NAME="${APPS[$app]}"
  echo ""
  echo "  → Déploiement: $APP_NAME"

  # Déployer sur Vercel depuis le répertoire de l'app
  # Les configurations sont dans apps/$APP_NAME/vercel.json
  vercel --token=$VERCEL_TOKEN --prod --yes \
    --cwd="apps/$APP_NAME" \
    -e NEXT_PUBLIC_API_URL=http://${CLIENT_ONBOARDING_IP}:3020 \
    -e NEXT_PUBLIC_ORDERS_API_URL=http://${CORE_ORDERS_IP}:3030 \
    -e NEXT_PUBLIC_AFFRET_API_URL=http://${AFFRET_IA_IP}:3010 \
    -e NEXT_PUBLIC_VIGILANCE_API_URL=http://${VIGILANCE_IP}:3040 \
    --scope=rt-technologie || echo "    ⚠️  Erreur de déploiement, vérifier manuellement"

  echo "  ✓ $APP_NAME déployé"
done

echo ""
echo "========================================="
echo "✅ DÉPLOIEMENT TERMINÉ"
echo "========================================="
echo ""
echo "🌐 URLs Vercel:"
echo "  - marketing-site: https://marketing-site.vercel.app"
echo "  - web-industry: https://web-industry.vercel.app"
echo "  - backoffice-admin: https://backoffice-admin.vercel.app"
echo "  - web-logistician: https://web-logistician.vercel.app"
echo "  - web-transporter: https://web-transporter.vercel.app"
echo ""
echo "Note: Les URLs exactes dépendent de votre configuration Vercel"
echo "========================================="
