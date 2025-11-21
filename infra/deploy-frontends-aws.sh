#!/bin/bash
# =============================================================================
# Script de déploiement des applications frontend sur AWS Amplify
# RT-Technologie - Compatible Monorepo Turbo/pnpm
# =============================================================================

set -e

# Configuration AWS
AWS_REGION="${AWS_REGION:-eu-central-1}"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text 2>/dev/null || echo "")

if [ -z "$AWS_ACCOUNT_ID" ]; then
  echo "❌ Erreur: Impossible de récupérer l'ID du compte AWS"
  echo "Assurez-vous que AWS CLI est configuré avec 'aws configure'"
  exit 1
fi

# Applications frontend à déployer
declare -A APPS=(
  ["marketing-site"]="marketing-site"
  ["backoffice-admin"]="backoffice-admin"
)

echo "========================================="
echo "🚀 Déploiement Frontends sur AWS"
echo "========================================="
echo "  Région AWS: $AWS_REGION"
echo "  Compte AWS: $AWS_ACCOUNT_ID"
echo ""

# Récupérer les IPs des services backend
echo "🌐 Récupération des IPs des services backend..."
CLUSTER="rt-technologie-cluster"

# Fonction pour récupérer l'IP d'un service
get_service_ip() {
  local service=$1
  TASK_ARN=$(aws ecs list-tasks \
    --cluster $CLUSTER \
    --service-name rt-$service-service \
    --region $AWS_REGION \
    --query 'taskArns[0]' \
    --output text 2>/dev/null || echo "")

  if [ -n "$TASK_ARN" ] && [ "$TASK_ARN" != "None" ]; then
    ENI_ID=$(aws ecs describe-tasks \
      --cluster $CLUSTER \
      --tasks $TASK_ARN \
      --region $AWS_REGION \
      --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' \
      --output text 2>/dev/null || echo "")

    if [ -n "$ENI_ID" ]; then
      PUBLIC_IP=$(aws ec2 describe-network-interfaces \
        --network-interface-ids $ENI_ID \
        --region $AWS_REGION \
        --query 'NetworkInterfaces[0].Association.PublicIp' \
        --output text 2>/dev/null || echo "")
      echo $PUBLIC_IP
    fi
  fi
}

# Récupérer les IPs des services
ADMIN_GATEWAY_IP=$(get_service_ip "admin-gateway")
AUTHZ_IP=$(get_service_ip "authz")
PLANNING_IP=$(get_service_ip "planning")
NOTIFICATIONS_IP=$(get_service_ip "notifications")
GEO_TRACKING_IP=$(get_service_ip "geo-tracking")
STORAGE_MARKET_IP=$(get_service_ip "storage-market")
CLIENT_ONBOARDING_IP=$(get_service_ip "client-onboarding")
CORE_ORDERS_IP=$(get_service_ip "core-orders")
AFFRET_IA_IP=$(get_service_ip "affret-ia")
VIGILANCE_IP=$(get_service_ip "vigilance")

echo "  ✓ Services backend trouvés"
echo ""

# Fonction pour créer une application Amplify si elle n'existe pas
create_amplify_app() {
  local app_name=$1
  local app_dir=$2

  echo "  → Vérification de l'application Amplify: $app_name"

  # Vérifier si l'app existe déjà
  APP_ID=$(aws amplify list-apps \
    --region $AWS_REGION \
    --query "apps[?name=='$app_name'].appId" \
    --output text 2>/dev/null || echo "")

  if [ -z "$APP_ID" ]; then
    echo "  → Création de l'application Amplify: $app_name"

    # Créer l'application Amplify
    APP_ID=$(aws amplify create-app \
      --name "$app_name" \
      --region $AWS_REGION \
      --platform WEB \
      --query 'app.appId' \
      --output text)

    echo "  ✓ Application créée: $APP_ID"
  else
    echo "  ✓ Application existante: $APP_ID"
  fi

  echo $APP_ID
}

# Fonction pour build et déployer une application via S3 + CloudFront
deploy_to_s3_cloudfront() {
  local app_name=$1
  local app_dir=$2
  local env_vars=$3

  echo ""
  echo "📦 Déploiement de $app_name sur S3 + CloudFront..."

  # Créer le bucket S3 s'il n'existe pas
  BUCKET_NAME="rt-technologie-${app_name}"

  if ! aws s3api head-bucket --bucket "$BUCKET_NAME" --region $AWS_REGION 2>/dev/null; then
    echo "  → Création du bucket S3: $BUCKET_NAME"
    aws s3api create-bucket \
      --bucket "$BUCKET_NAME" \
      --region $AWS_REGION \
      --create-bucket-configuration LocationConstraint=$AWS_REGION

    # Configurer le bucket pour l'hébergement web
    aws s3api put-bucket-website \
      --bucket "$BUCKET_NAME" \
      --website-configuration '{
        "IndexDocument": {"Suffix": "index.html"},
        "ErrorDocument": {"Key": "404.html"}
      }'

    # Configurer la politique du bucket pour l'accès public
    aws s3api put-bucket-policy \
      --bucket "$BUCKET_NAME" \
      --policy "{
        \"Version\": \"2012-10-17\",
        \"Statement\": [{
          \"Sid\": \"PublicReadGetObject\",
          \"Effect\": \"Allow\",
          \"Principal\": \"*\",
          \"Action\": \"s3:GetObject\",
          \"Resource\": \"arn:aws:s3:::${BUCKET_NAME}/*\"
        }]
      }"

    echo "  ✓ Bucket S3 créé et configuré"
  else
    echo "  ✓ Bucket S3 existant: $BUCKET_NAME"
  fi

  # Build l'application avec les variables d'environnement
  echo "  → Build de l'application..."
  cd "apps/$app_dir"

  # Créer le fichier .env.production avec les variables
  echo "$env_vars" > .env.production

  # Build Next.js
  if ! npm run build; then
    echo "  ❌ Erreur lors du build"
    cd ../..
    return 1
  fi

  # Export static si nécessaire (Next.js static export)
  # Pour Next.js 13+, le build génère déjà le dossier out
  if [ -d "out" ]; then
    DIST_DIR="out"
  else
    DIST_DIR=".next"
  fi

  echo "  → Upload vers S3..."
  aws s3 sync "$DIST_DIR" "s3://${BUCKET_NAME}/" \
    --delete \
    --cache-control "public, max-age=31536000, immutable" \
    --exclude "*.html" \
    --region $AWS_REGION

  # Upload HTML sans cache
  aws s3 sync "$DIST_DIR" "s3://${BUCKET_NAME}/" \
    --exclude "*" \
    --include "*.html" \
    --cache-control "public, max-age=0, must-revalidate" \
    --region $AWS_REGION

  cd ../..

  # Créer ou mettre à jour CloudFront distribution
  DISTRIBUTION_ID=$(aws cloudfront list-distributions \
    --query "DistributionList.Items[?Origins.Items[?DomainName=='${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com']].Id" \
    --output text 2>/dev/null || echo "")

  if [ -z "$DISTRIBUTION_ID" ]; then
    echo "  → Création de la distribution CloudFront..."

    # Créer la distribution
    DISTRIBUTION_CONFIG=$(cat <<EOF
{
  "CallerReference": "$(date +%s)",
  "Comment": "Distribution for $app_name",
  "Enabled": true,
  "Origins": {
    "Quantity": 1,
    "Items": [{
      "Id": "S3-$BUCKET_NAME",
      "DomainName": "${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com",
      "S3OriginConfig": {
        "OriginAccessIdentity": ""
      }
    }]
  },
  "DefaultRootObject": "index.html",
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-$BUCKET_NAME",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"],
      "CachedMethods": {
        "Quantity": 2,
        "Items": ["GET", "HEAD"]
      }
    },
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {"Forward": "none"}
    },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000,
    "Compress": true
  },
  "CustomErrorResponses": {
    "Quantity": 1,
    "Items": [{
      "ErrorCode": 404,
      "ResponsePagePath": "/index.html",
      "ResponseCode": "200",
      "ErrorCachingMinTTL": 300
    }]
  },
  "PriceClass": "PriceClass_100"
}
EOF
)

    DISTRIBUTION_ID=$(aws cloudfront create-distribution \
      --distribution-config "$DISTRIBUTION_CONFIG" \
      --region $AWS_REGION \
      --query 'Distribution.Id' \
      --output text)

    echo "  ✓ Distribution CloudFront créée: $DISTRIBUTION_ID"
  else
    echo "  ✓ Distribution CloudFront existante: $DISTRIBUTION_ID"

    # Invalider le cache CloudFront
    echo "  → Invalidation du cache CloudFront..."
    aws cloudfront create-invalidation \
      --distribution-id "$DISTRIBUTION_ID" \
      --paths "/*" \
      --region $AWS_REGION > /dev/null

    echo "  ✓ Cache invalidé"
  fi

  # Récupérer l'URL CloudFront
  CLOUDFRONT_URL=$(aws cloudfront get-distribution \
    --id "$DISTRIBUTION_ID" \
    --query 'Distribution.DomainName' \
    --output text)

  echo "  ✓ $app_name déployé sur: https://${CLOUDFRONT_URL}"

  # Sauvegarder l'URL pour la retourner
  echo "https://${CLOUDFRONT_URL}"
}

# Déployer chaque application
echo "🚢 Déploiement des applications frontend..."

# Variables d'environnement pour backoffice-admin
BACKOFFICE_ENV="NODE_ENV=production
NEXT_PUBLIC_ADMIN_GATEWAY_URL=http://${ADMIN_GATEWAY_IP}:3000
NEXT_PUBLIC_AUTHZ_URL=http://${AUTHZ_IP}:3000
NEXT_PUBLIC_PLANNING_URL=http://${PLANNING_IP}:3000
NEXT_PUBLIC_NOTIFICATIONS_URL=http://${NOTIFICATIONS_IP}:3000
NEXT_PUBLIC_GEO_TRACKING_URL=http://${GEO_TRACKING_IP}:3000
NEXT_PUBLIC_STORAGE_MARKET_URL=http://${STORAGE_MARKET_IP}:3000"

# Variables d'environnement pour marketing-site
MARKETING_ENV="NODE_ENV=production
NEXT_PUBLIC_API_URL=http://${CLIENT_ONBOARDING_IP}:3020
NEXT_PUBLIC_ORDERS_API_URL=http://${CORE_ORDERS_IP}:3030
NEXT_PUBLIC_AFFRET_API_URL=http://${AFFRET_IA_IP}:3010
NEXT_PUBLIC_VIGILANCE_API_URL=http://${VIGILANCE_IP}:3040"

# Déployer backoffice-admin
BACKOFFICE_URL=$(deploy_to_s3_cloudfront "backoffice-admin" "backoffice-admin" "$BACKOFFICE_ENV")

# Déployer marketing-site
MARKETING_URL=$(deploy_to_s3_cloudfront "marketing-site" "marketing-site" "$MARKETING_ENV")

echo ""
echo "========================================="
echo "✅ DÉPLOIEMENT TERMINÉ"
echo "========================================="
echo ""
echo "🌐 URLs AWS CloudFront:"
echo "  - backoffice-admin: $BACKOFFICE_URL"
echo "  - marketing-site: $MARKETING_URL"
echo ""
echo "📝 Note: Les distributions CloudFront peuvent prendre 15-20 minutes"
echo "    pour être complètement déployées à l'échelle mondiale."
echo ""
echo "🔧 Pour configurer un nom de domaine personnalisé:"
echo "    1. Créez un certificat SSL dans AWS Certificate Manager"
echo "    2. Ajoutez un CNAME dans votre distribution CloudFront"
echo "    3. Configurez votre DNS pour pointer vers CloudFront"
echo ""
echo "========================================="
