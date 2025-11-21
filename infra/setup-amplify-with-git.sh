#!/bin/bash
# =============================================================================
# Script de configuration AWS Amplify avec déploiement Git
# RT-Technologie - Configuration automatisée + Guide interactif
# =============================================================================

set -e

echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                           ║"
echo "║          🚀 CONFIGURATION AWS AMPLIFY - RT-TECHNOLOGIE                   ║"
echo "║                                                                           ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Configuration AWS
AWS_REGION="${AWS_REGION:-eu-central-1}"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text 2>/dev/null || echo "")

if [ -z "$AWS_ACCOUNT_ID" ]; then
  echo "❌ Erreur: Impossible de récupérer l'ID du compte AWS"
  echo "Assurez-vous que AWS CLI est configuré avec 'aws configure'"
  exit 1
fi

echo "📋 Configuration AWS:"
echo "  • Région: $AWS_REGION"
echo "  • Compte: $AWS_ACCOUNT_ID"
echo ""

# Applications à déployer
declare -A APPS=(
  ["backoffice-admin"]="Administration RT-Technologie"
  ["marketing-site"]="Site marketing et onboarding"
)

echo "📦 Applications à configurer:"
for app in "${!APPS[@]}"; do
  echo "  • $app - ${APPS[$app]}"
done
echo ""

# Demander les informations Git
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔗 Configuration Git"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Détecter le repository Git actuel
if git rev-parse --git-dir > /dev/null 2>&1; then
  GIT_REMOTE=$(git config --get remote.origin.url 2>/dev/null || echo "")
  GIT_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")

  if [ -n "$GIT_REMOTE" ]; then
    echo "📍 Repository Git détecté:"
    echo "  • URL: $GIT_REMOTE"
    echo "  • Branche: $GIT_BRANCH"
    echo ""
    read -p "Utiliser ce repository ? (y/n): " use_detected

    if [ "$use_detected" == "y" ] || [ "$use_detected" == "Y" ]; then
      REPO_URL="$GIT_REMOTE"
      BRANCH_NAME="$GIT_BRANCH"
    fi
  fi
fi

# Si pas de repo détecté ou utilisateur a refusé
if [ -z "$REPO_URL" ]; then
  echo ""
  echo "Entrez l'URL de votre repository Git:"
  echo "  Exemples:"
  echo "    • https://github.com/username/rt-technologie"
  echo "    • https://gitlab.com/username/rt-technologie"
  echo "    • https://bitbucket.org/username/rt-technologie"
  echo ""
  read -p "URL du repository: " REPO_URL

  echo ""
  read -p "Nom de la branche (par défaut: main): " BRANCH_NAME
  BRANCH_NAME=${BRANCH_NAME:-main}
fi

echo ""
echo "✅ Configuration Git:"
echo "  • Repository: $REPO_URL"
echo "  • Branche: $BRANCH_NAME"
echo ""

# Token Git (pour connexion)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔑 Token d'accès Git"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "AWS Amplify a besoin d'un token pour accéder à votre repository."
echo ""
echo "Comment créer un token:"
echo ""
echo "GitHub:"
echo "  1. Allez sur https://github.com/settings/tokens"
echo "  2. Generate new token (classic)"
echo "  3. Cochez: repo (full control)"
echo "  4. Generate token et copiez-le"
echo ""
echo "GitLab:"
echo "  1. Allez sur https://gitlab.com/-/profile/personal_access_tokens"
echo "  2. Créez un token avec scope: api, read_repository, write_repository"
echo ""
echo "Bitbucket:"
echo "  1. Allez sur https://bitbucket.org/account/settings/app-passwords/"
echo "  2. Créez un App password avec: Repositories (Read, Write)"
echo ""
read -p "Avez-vous un token d'accès Git ? (y/n): " has_token

if [ "$has_token" != "y" ] && [ "$has_token" != "Y" ]; then
  echo ""
  echo "⚠️  Vous devez créer un token avant de continuer."
  echo ""
  echo "Options:"
  echo "  1. Créez le token maintenant et relancez ce script"
  echo "  2. Continuez sans token (vous devrez le configurer manuellement dans la console AWS)"
  echo ""
  read -p "Continuer sans token ? (y/n): " continue_without_token

  if [ "$continue_without_token" != "y" ] && [ "$continue_without_token" != "Y" ]; then
    echo ""
    echo "👋 Script interrompu. Créez votre token et relancez:"
    echo "   ./setup-amplify-with-git.sh"
    exit 0
  fi

  GIT_TOKEN=""
else
  echo ""
  echo "Entrez votre token Git (caché):"
  read -s GIT_TOKEN
  echo ""
fi

# Récupérer les IPs des services backend
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Récupération des services backend"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

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

echo "Récupération des IPs des services ECS..."

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

echo ""
echo "Services backend trouvés:"
[ -n "$ADMIN_GATEWAY_IP" ] && echo "  ✓ admin-gateway: $ADMIN_GATEWAY_IP:3000"
[ -n "$AUTHZ_IP" ] && echo "  ✓ authz: $AUTHZ_IP:3000"
[ -n "$PLANNING_IP" ] && echo "  ✓ planning: $PLANNING_IP:3000"
[ -n "$NOTIFICATIONS_IP" ] && echo "  ✓ notifications: $NOTIFICATIONS_IP:3000"
[ -n "$GEO_TRACKING_IP" ] && echo "  ✓ geo-tracking: $GEO_TRACKING_IP:3000"
[ -n "$STORAGE_MARKET_IP" ] && echo "  ✓ storage-market: $STORAGE_MARKET_IP:3000"
[ -n "$CLIENT_ONBOARDING_IP" ] && echo "  ✓ client-onboarding: $CLIENT_ONBOARDING_IP:3020"
[ -n "$CORE_ORDERS_IP" ] && echo "  ✓ core-orders: $CORE_ORDERS_IP:3030"
[ -n "$AFFRET_IA_IP" ] && echo "  ✓ affret-ia: $AFFRET_IA_IP:3010"
[ -n "$VIGILANCE_IP" ] && echo "  ✓ vigilance: $VIGILANCE_IP:3040"

echo ""

# Fonction pour créer une application Amplify
create_amplify_app() {
  local app_name=$1
  local app_description=$2
  local env_vars=$3

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📱 Configuration de: $app_name"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""

  # Vérifier si l'app existe déjà
  APP_ID=$(aws amplify list-apps \
    --region $AWS_REGION \
    --query "apps[?name=='rt-${app_name}'].appId" \
    --output text 2>/dev/null || echo "")

  if [ -n "$APP_ID" ]; then
    echo "⚠️  Application 'rt-${app_name}' existe déjà (ID: $APP_ID)"
    echo ""
    read -p "Voulez-vous la reconfigurer ? (y/n): " reconfigure

    if [ "$reconfigure" != "y" ] && [ "$reconfigure" != "Y" ]; then
      echo "  → Application conservée telle quelle"
      return 0
    fi

    echo "  → Mise à jour de la configuration..."
  else
    echo "🔨 Création de l'application Amplify..."

    # Créer l'application
    if [ -n "$GIT_TOKEN" ]; then
      # Avec token Git (connexion automatique)
      APP_ID=$(aws amplify create-app \
        --name "rt-${app_name}" \
        --description "$app_description" \
        --repository "$REPO_URL" \
        --oauth-token "$GIT_TOKEN" \
        --platform WEB_COMPUTE \
        --build-spec file://../apps/${app_name}/amplify.yml \
        --region $AWS_REGION \
        --query 'app.appId' \
        --output text 2>&1)

      if [[ "$APP_ID" == *"error"* ]] || [[ "$APP_ID" == *"Error"* ]]; then
        echo "  ⚠️  Erreur lors de la connexion Git automatique"
        echo "  → Création sans Git, vous devrez connecter manuellement"

        APP_ID=$(aws amplify create-app \
          --name "rt-${app_name}" \
          --description "$app_description" \
          --platform WEB_COMPUTE \
          --region $AWS_REGION \
          --query 'app.appId' \
          --output text)
      else
        echo "  ✓ Application créée avec connexion Git: $APP_ID"
      fi
    else
      # Sans token (connexion manuelle requise)
      APP_ID=$(aws amplify create-app \
        --name "rt-${app_name}" \
        --description "$app_description" \
        --platform WEB_COMPUTE \
        --region $AWS_REGION \
        --query 'app.appId' \
        --output text)

      echo "  ✓ Application créée: $APP_ID"
      echo "  ⚠️  Connexion Git requise (voir instructions ci-dessous)"
    fi
  fi

  # Créer la branche
  echo ""
  echo "🌿 Configuration de la branche '$BRANCH_NAME'..."

  BRANCH_EXISTS=$(aws amplify list-branches \
    --app-id "$APP_ID" \
    --region $AWS_REGION \
    --query "branches[?branchName=='$BRANCH_NAME'].branchName" \
    --output text 2>/dev/null || echo "")

  if [ -z "$BRANCH_EXISTS" ]; then
    aws amplify create-branch \
      --app-id "$APP_ID" \
      --branch-name "$BRANCH_NAME" \
      --enable-auto-build true \
      --region $AWS_REGION > /dev/null
    echo "  ✓ Branche '$BRANCH_NAME' créée"
  else
    echo "  ✓ Branche '$BRANCH_NAME' existe déjà"
  fi

  # Configurer les variables d'environnement
  echo ""
  echo "⚙️  Configuration des variables d'environnement..."

  # Convertir les variables en format JSON pour AWS Amplify
  ENV_JSON="{"
  first=true
  while IFS='=' read -r key value; do
    if [ -n "$key" ] && [ -n "$value" ]; then
      if [ "$first" = false ]; then
        ENV_JSON+=","
      fi
      ENV_JSON+="\"$key\":\"$value\""
      first=false
    fi
  done <<< "$env_vars"
  ENV_JSON+="}"

  # Mettre à jour l'app avec les variables
  aws amplify update-app \
    --app-id "$APP_ID" \
    --environment-variables "$ENV_JSON" \
    --region $AWS_REGION > /dev/null 2>&1 || true

  echo "  ✓ Variables d'environnement configurées"

  # Récupérer l'URL de l'application
  APP_DOMAIN=$(aws amplify get-app \
    --app-id "$APP_ID" \
    --region $AWS_REGION \
    --query 'app.defaultDomain' \
    --output text)

  echo ""
  echo "✅ Application '$app_name' configurée avec succès !"
  echo ""
  echo "📋 Informations:"
  echo "  • App ID: $APP_ID"
  echo "  • URL: https://${BRANCH_NAME}.${APP_DOMAIN}"
  echo "  • Console: https://${AWS_REGION}.console.aws.amazon.com/amplify/home?region=${AWS_REGION}#/${APP_ID}"
  echo ""

  # Sauvegarder les infos
  echo "rt-${app_name}|$APP_ID|https://${BRANCH_NAME}.${APP_DOMAIN}" >> /tmp/amplify-apps.txt
}

# Créer le fichier temporaire pour stocker les infos
rm -f /tmp/amplify-apps.txt

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Création des applications Amplify"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

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

# Créer les applications
create_amplify_app "backoffice-admin" "Administration RT-Technologie" "$BACKOFFICE_ENV"
create_amplify_app "marketing-site" "Site marketing et onboarding client" "$MARKETING_ENV"

# Résumé final
echo ""
echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                           ║"
echo "║          ✅ CONFIGURATION TERMINÉE AVEC SUCCÈS                           ║"
echo "║                                                                           ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo ""

echo "📱 Applications Amplify créées:"
echo ""

if [ -f /tmp/amplify-apps.txt ]; then
  while IFS='|' read -r name app_id url; do
    echo "  🎯 $name"
    echo "     • App ID: $app_id"
    echo "     • URL: $url"
    echo "     • Console: https://${AWS_REGION}.console.aws.amazon.com/amplify/home?region=${AWS_REGION}#/${app_id}"
    echo ""
  done < /tmp/amplify-apps.txt
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 PROCHAINES ÉTAPES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -z "$GIT_TOKEN" ]; then
  echo "⚠️  Connexion Git manuelle requise:"
  echo ""
  echo "Pour chaque application, dans la console AWS Amplify:"
  echo ""
  echo "1. Ouvrez l'application dans la console (liens ci-dessus)"
  echo "2. Cliquez sur 'Connect repository'"
  echo "3. Sélectionnez votre fournisseur Git (GitHub/GitLab/Bitbucket)"
  echo "4. Autorisez AWS Amplify à accéder à votre compte"
  echo "5. Sélectionnez le repository: $REPO_URL"
  echo "6. Sélectionnez la branche: $BRANCH_NAME"
  echo "7. Les variables d'environnement sont déjà configurées ✓"
  echo "8. Lancez le build"
  echo ""
else
  echo "✅ Git connecté automatiquement !"
  echo ""
  echo "Pour lancer le premier déploiement:"
  echo ""
  echo "1. Commitez et poussez vos changements:"
  echo "   git add ."
  echo "   git commit -m 'Configure AWS Amplify deployment'"
  echo "   git push origin $BRANCH_NAME"
  echo ""
  echo "2. Amplify détectera le push et lancera le build automatiquement"
  echo ""
  echo "3. Suivez le build dans la console AWS Amplify (liens ci-dessus)"
  echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📚 Documentation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "• Guide complet: docs/DEPLOYMENT_AWS_FRONTEND.md"
echo "• Quick Start: DEPLOIEMENT_AWS_QUICK_START.md"
echo "• Dépannage: infra/TROUBLESHOOTING_AWS.md"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💡 Conseils"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "• Le premier build peut prendre 10-15 minutes"
echo "• Les builds suivants seront plus rapides grâce au cache"
echo "• Activez les déploiements automatiques sur chaque push"
echo "• Configurez des domaines personnalisés dans la console Amplify"
echo ""

# Sauvegarder les infos dans un fichier permanent
if [ -f /tmp/amplify-apps.txt ]; then
  mv /tmp/amplify-apps.txt ../amplify-deployments-$(date +%Y%m%d-%H%M%S).txt
  echo "📄 Informations sauvegardées dans: amplify-deployments-*.txt"
  echo ""
fi

echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║                   🎉 Prêt à déployer sur AWS Amplify !                   ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
