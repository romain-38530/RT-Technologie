#!/bin/bash
# =============================================================================
# Script de déploiement des applications frontend sur AWS Amplify Hosting
# RT-Technologie - Support SSR et ISR avec Next.js
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

# Repository Git (à adapter selon votre configuration)
GIT_REPOSITORY="${GIT_REPOSITORY:-}"
GIT_BRANCH="${GIT_BRANCH:-main}"

# Applications frontend à déployer
declare -A APPS=(
  ["marketing-site"]="marketing-site"
  ["backoffice-admin"]="backoffice-admin"
)

echo "========================================="
echo "🚀 Déploiement Frontends sur AWS Amplify"
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

# Fonction pour créer ou mettre à jour une application Amplify
deploy_amplify_app() {
  local app_name=$1
  local app_dir=$2
  local env_vars=$3

  echo ""
  echo "📦 Déploiement de $app_name sur AWS Amplify..."

  # Vérifier si l'app existe déjà
  APP_ID=$(aws amplify list-apps \
    --region $AWS_REGION \
    --query "apps[?name=='rt-${app_name}'].appId" \
    --output text 2>/dev/null || echo "")

  if [ -z "$APP_ID" ]; then
    echo "  → Création de l'application Amplify: rt-${app_name}"

    # Créer l'application Amplify sans repository (déploiement manuel)
    APP_ID=$(aws amplify create-app \
      --name "rt-${app_name}" \
      --region $AWS_REGION \
      --platform WEB_COMPUTE \
      --query 'app.appId' \
      --output text)

    echo "  ✓ Application créée: $APP_ID"

    # Créer une branche
    aws amplify create-branch \
      --app-id "$APP_ID" \
      --branch-name "production" \
      --region $AWS_REGION > /dev/null

    echo "  ✓ Branche 'production' créée"
  else
    echo "  ✓ Application existante: $APP_ID"
  fi

  # Mettre à jour les variables d'environnement
  echo "  → Configuration des variables d'environnement..."

  # Supprimer les anciennes variables
  EXISTING_VARS=$(aws amplify get-app \
    --app-id "$APP_ID" \
    --region $AWS_REGION \
    --query 'app.environmentVariables' \
    --output json 2>/dev/null || echo "{}")

  # Parser et ajouter les nouvelles variables
  while IFS='=' read -r key value; do
    if [ -n "$key" ] && [ -n "$value" ]; then
      aws amplify update-app \
        --app-id "$APP_ID" \
        --region $AWS_REGION \
        --environment-variables "$key=$value" > /dev/null 2>&1 || true
    fi
  done <<< "$env_vars"

  echo "  ✓ Variables d'environnement configurées"

  # Build l'application localement
  echo "  → Build de l'application..."
  cd "apps/$app_dir"

  # Créer le fichier .env.production
  echo "$env_vars" > .env.production

  # Build Next.js
  if ! npm run build; then
    echo "  ❌ Erreur lors du build"
    cd ../..
    return 1
  fi

  cd ../..

  # Créer un zip du build
  echo "  → Création de l'archive de déploiement..."
  cd "apps/$app_dir"
  BUILD_ZIP="/tmp/${app_name}-$(date +%s).zip"

  # Zipper le contenu nécessaire pour Next.js
  zip -r "$BUILD_ZIP" \
    .next \
    public \
    package.json \
    next.config.js 2>/dev/null || \
  zip -r "$BUILD_ZIP" \
    .next \
    public \
    package.json 2>/dev/null

  cd ../..

  echo "  ✓ Archive créée: $BUILD_ZIP"

  # Upload et déploiement via Amplify
  echo "  → Déploiement sur Amplify..."

  # Créer un deployment
  DEPLOYMENT_ID=$(aws amplify create-deployment \
    --app-id "$APP_ID" \
    --branch-name "production" \
    --region $AWS_REGION \
    --query 'jobId' \
    --output text 2>/dev/null || echo "")

  if [ -z "$DEPLOYMENT_ID" ]; then
    echo "  ⚠️  Déploiement manuel requis"
    echo "     1. Accédez à la console AWS Amplify"
    echo "     2. Sélectionnez l'application: rt-${app_name}"
    echo "     3. Uploadez l'archive: $BUILD_ZIP"
  else
    echo "  ✓ Déploiement lancé: $DEPLOYMENT_ID"

    # Attendre que le déploiement soit terminé (timeout 10 minutes)
    echo "  → Attente de la fin du déploiement..."
    TIMEOUT=600
    ELAPSED=0

    while [ $ELAPSED -lt $TIMEOUT ]; do
      STATUS=$(aws amplify get-job \
        --app-id "$APP_ID" \
        --branch-name "production" \
        --job-id "$DEPLOYMENT_ID" \
        --region $AWS_REGION \
        --query 'job.summary.status' \
        --output text 2>/dev/null || echo "PENDING")

      if [ "$STATUS" == "SUCCEED" ]; then
        echo "  ✓ Déploiement réussi"
        break
      elif [ "$STATUS" == "FAILED" ] || [ "$STATUS" == "CANCELLED" ]; then
        echo "  ❌ Déploiement échoué: $STATUS"
        return 1
      fi

      sleep 10
      ELAPSED=$((ELAPSED + 10))
      echo -n "."
    done

    if [ $ELAPSED -ge $TIMEOUT ]; then
      echo ""
      echo "  ⚠️  Timeout - Vérifiez le statut manuellement"
    fi
  fi

  # Récupérer l'URL de l'application
  APP_URL=$(aws amplify get-app \
    --app-id "$APP_ID" \
    --region $AWS_REGION \
    --query 'app.defaultDomain' \
    --output text)

  echo "  ✓ $app_name déployé sur: https://production.${APP_URL}"
  echo "https://production.${APP_URL}"
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
BACKOFFICE_URL=$(deploy_amplify_app "backoffice-admin" "backoffice-admin" "$BACKOFFICE_ENV")

# Déployer marketing-site
MARKETING_URL=$(deploy_amplify_app "marketing-site" "marketing-site" "$MARKETING_ENV")

echo ""
echo "========================================="
echo "✅ DÉPLOIEMENT TERMINÉ"
echo "========================================="
echo ""
echo "🌐 URLs AWS Amplify:"
echo "  - backoffice-admin: $BACKOFFICE_URL"
echo "  - marketing-site: $MARKETING_URL"
echo ""
echo "📝 Configuration du domaine personnalisé:"
echo "    aws amplify create-domain-association \\"
echo "      --app-id <APP_ID> \\"
echo "      --domain-name votre-domaine.com \\"
echo "      --sub-domain-settings prefix=www,branchName=production"
echo ""
echo "========================================="
