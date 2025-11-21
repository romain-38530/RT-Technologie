#!/bin/bash
# =============================================================================
# Script pour mettre à jour les URLs des frontends après déploiement AWS
# RT-Technologie
# =============================================================================

set -e

echo "========================================="
echo "🔧 Mise à jour des URLs Frontend"
echo "========================================="
echo ""

# Configuration AWS
AWS_REGION="${AWS_REGION:-eu-central-1}"

# Function pour récupérer l'URL CloudFront d'un bucket
get_cloudfront_url() {
  local bucket_name=$1
  local distribution_id=$(aws cloudfront list-distributions \
    --query "DistributionList.Items[?Origins.Items[?DomainName=='${bucket_name}.s3.${AWS_REGION}.amazonaws.com']].Id" \
    --output text 2>/dev/null || echo "")

  if [ -n "$distribution_id" ]; then
    aws cloudfront get-distribution \
      --id "$distribution_id" \
      --query 'Distribution.DomainName' \
      --output text
  fi
}

# Function pour récupérer l'URL Amplify d'une app
get_amplify_url() {
  local app_name=$1
  local app_id=$(aws amplify list-apps \
    --region $AWS_REGION \
    --query "apps[?name=='rt-${app_name}'].appId" \
    --output text 2>/dev/null || echo "")

  if [ -n "$app_id" ]; then
    local domain=$(aws amplify get-app \
      --app-id "$app_id" \
      --region $AWS_REGION \
      --query 'app.defaultDomain' \
      --output text)
    echo "https://production.${domain}"
  fi
}

echo "📡 Recherche des URLs déployées..."
echo ""

# Vérifier les déploiements CloudFront
BACKOFFICE_CF_URL=$(get_cloudfront_url "rt-technologie-backoffice-admin")
MARKETING_CF_URL=$(get_cloudfront_url "rt-technologie-marketing-site")

# Vérifier les déploiements Amplify
BACKOFFICE_AMP_URL=$(get_amplify_url "backoffice-admin")
MARKETING_AMP_URL=$(get_amplify_url "marketing-site")

echo "🔍 URLs trouvées:"
echo ""

if [ -n "$BACKOFFICE_CF_URL" ]; then
  echo "  CloudFront - backoffice-admin: https://${BACKOFFICE_CF_URL}"
fi

if [ -n "$MARKETING_CF_URL" ]; then
  echo "  CloudFront - marketing-site: https://${MARKETING_CF_URL}"
fi

if [ -n "$BACKOFFICE_AMP_URL" ]; then
  echo "  Amplify - backoffice-admin: ${BACKOFFICE_AMP_URL}"
fi

if [ -n "$MARKETING_AMP_URL" ]; then
  echo "  Amplify - marketing-site: ${MARKETING_AMP_URL}"
fi

echo ""

# Demander à l'utilisateur quel déploiement utiliser
if [ -n "$BACKOFFICE_CF_URL" ] || [ -n "$BACKOFFICE_AMP_URL" ]; then
  echo "📝 Sélectionnez les URLs à utiliser dans vos configurations:"
  echo ""

  # Backoffice
  if [ -n "$BACKOFFICE_CF_URL" ] && [ -n "$BACKOFFICE_AMP_URL" ]; then
    echo "Backoffice Admin:"
    echo "  1) CloudFront: https://${BACKOFFICE_CF_URL}"
    echo "  2) Amplify: ${BACKOFFICE_AMP_URL}"
    read -p "Choisir (1 ou 2): " choice
    if [ "$choice" == "1" ]; then
      BACKOFFICE_URL="https://${BACKOFFICE_CF_URL}"
    else
      BACKOFFICE_URL="${BACKOFFICE_AMP_URL}"
    fi
  elif [ -n "$BACKOFFICE_CF_URL" ]; then
    BACKOFFICE_URL="https://${BACKOFFICE_CF_URL}"
  else
    BACKOFFICE_URL="${BACKOFFICE_AMP_URL}"
  fi

  # Marketing Site
  if [ -n "$MARKETING_CF_URL" ] && [ -n "$MARKETING_AMP_URL" ]; then
    echo ""
    echo "Marketing Site:"
    echo "  1) CloudFront: https://${MARKETING_CF_URL}"
    echo "  2) Amplify: ${MARKETING_AMP_URL}"
    read -p "Choisir (1 ou 2): " choice
    if [ "$choice" == "1" ]; then
      MARKETING_URL="https://${MARKETING_CF_URL}"
    else
      MARKETING_URL="${MARKETING_AMP_URL}"
    fi
  elif [ -n "$MARKETING_CF_URL" ]; then
    MARKETING_URL="https://${MARKETING_CF_URL}"
  else
    MARKETING_URL="${MARKETING_AMP_URL}"
  fi

  echo ""
  echo "========================================="
  echo "✅ URLs sélectionnées:"
  echo "========================================="
  echo "  Backoffice Admin: ${BACKOFFICE_URL}"
  echo "  Marketing Site: ${MARKETING_URL}"
  echo ""
  echo "📋 Copiez ces URLs pour votre configuration DNS ou documentation"
  echo ""

  # Proposer de créer un fichier de configuration
  read -p "Voulez-vous créer un fichier de configuration? (y/n): " create_config
  if [ "$create_config" == "y" ] || [ "$create_config" == "Y" ]; then
    CONFIG_FILE="../frontend-urls.txt"
    cat > "$CONFIG_FILE" <<EOF
# URLs des frontends déployés sur AWS
# Généré le: $(date)

Backoffice Admin: ${BACKOFFICE_URL}
Marketing Site: ${MARKETING_URL}

# Configuration DNS suggérée:
#
# Pour CloudFront, créez des enregistrements CNAME:
# backoffice.rt-technologie.com -> ${BACKOFFICE_CF_URL:-N/A}
# marketing.rt-technologie.com -> ${MARKETING_CF_URL:-N/A}
#
# Pour Amplify, suivez les instructions dans la console AWS Amplify

# CORS Configuration pour les backends:
# Ajoutez ces URLs dans les headers Access-Control-Allow-Origin:
# - ${BACKOFFICE_URL}
# - ${MARKETING_URL}
EOF
    echo "✅ Configuration sauvegardée dans: $CONFIG_FILE"
    echo ""
  fi

  # Proposer de mettre à jour les .env.production
  read -p "Voulez-vous mettre à jour les fichiers .env.production? (y/n): " update_env
  if [ "$update_env" == "y" ] || [ "$update_env" == "Y" ]; then
    echo ""
    echo "📝 Mise à jour des fichiers .env.production..."

    # Mise à jour backoffice-admin
    if [ -f "../apps/backoffice-admin/.env.production" ]; then
      if grep -q "NEXT_PUBLIC_FRONTEND_URL=" "../apps/backoffice-admin/.env.production"; then
        sed -i.bak "s|NEXT_PUBLIC_FRONTEND_URL=.*|NEXT_PUBLIC_FRONTEND_URL=${BACKOFFICE_URL}|g" "../apps/backoffice-admin/.env.production"
        echo "  ✓ Mis à jour: apps/backoffice-admin/.env.production"
      else
        echo "NEXT_PUBLIC_FRONTEND_URL=${BACKOFFICE_URL}" >> "../apps/backoffice-admin/.env.production"
        echo "  ✓ Ajouté à: apps/backoffice-admin/.env.production"
      fi
    fi

    # Mise à jour marketing-site
    if [ -f "../apps/marketing-site/.env.production" ]; then
      if grep -q "NEXT_PUBLIC_FRONTEND_URL=" "../apps/marketing-site/.env.production"; then
        sed -i.bak "s|NEXT_PUBLIC_FRONTEND_URL=.*|NEXT_PUBLIC_FRONTEND_URL=${MARKETING_URL}|g" "../apps/marketing-site/.env.production"
        echo "  ✓ Mis à jour: apps/marketing-site/.env.production"
      else
        echo "NEXT_PUBLIC_FRONTEND_URL=${MARKETING_URL}" >> "../apps/marketing-site/.env.production"
        echo "  ✓ Ajouté à: apps/marketing-site/.env.production"
      fi
    fi

    echo ""
    echo "✅ Fichiers .env.production mis à jour!"
    echo ""
    echo "⚠️  Important: Pour que les changements prennent effet,"
    echo "    vous devez redéployer les applications:"
    echo ""
    echo "    cd infra"
    echo "    ./deploy-frontends-aws.sh"
    echo ""
  fi

else
  echo "❌ Aucun déploiement trouvé sur AWS"
  echo ""
  echo "Déployez d'abord les frontends avec:"
  echo "  ./deploy-frontends-aws.sh"
  echo "  OU"
  echo "  ./deploy-frontends-aws-amplify.sh"
fi

echo "========================================="
echo "✅ Terminé"
echo "========================================="
