#!/bin/bash
# =============================================================================
# Script pour déployer TOUS les services restants sur AWS ECS
# À lancer dans CloudShell APRÈS deploy-complete.sh
# =============================================================================

set -e

GITHUB_RAW="https://raw.githubusercontent.com/romain-38530/RT-Technologie/dockerfile"
REGION="eu-central-1"
ACCOUNT_ID="004843574253"
SECURITY_GROUP_ID="sg-0add3ac473775825a"
SUBNET_1="subnet-0cce60a3fe31c0d9e"
SUBNET_2="subnet-0a6a2f8fd776906ee"

# Liste de TOUS les services avec leurs ports
declare -A ALL_SERVICES=(
  ["notifications"]="3050"
  ["authz"]="3007"
  ["admin-gateway"]="3008"
  ["pricing-grids"]="3060"
  ["planning"]="3070"
  ["bourse"]="3080"
  ["palette"]="3090"
  ["wms-sync"]="3100"
  ["erp-sync"]="3110"
  ["tms-sync"]="3120"
  ["tracking-ia"]="3130"
  ["chatbot"]="3140"
  ["geo-tracking"]="3150"
  ["ecpmr"]="3160"
  ["storage-market"]="3170"
  ["training"]="3180"
)

echo "========================================="
echo "🚀 Déploiement Services Restants"
echo "========================================="
echo ""
echo "📊 Services à déployer: ${#ALL_SERVICES[@]}"
echo ""

# Étape 1 : Télécharger les Dockerfiles manquants
echo "📥 Téléchargement des Dockerfiles depuis GitHub..."
cd ~/RT-Technologie

for service in "${!ALL_SERVICES[@]}"; do
  mkdir -p "services/$service"
  echo "  → $service"
  curl -s -o "services/$service/Dockerfile" "$GITHUB_RAW/services/$service/Dockerfile" || echo "    ⚠️  Erreur téléchargement"
done

echo "✓ Dockerfiles téléchargés"
echo ""

# Étape 2 : ECR Repositories
echo "📦 Création des repositories ECR..."
for service in "${!ALL_SERVICES[@]}"; do
  aws ecr create-repository \
    --repository-name "rt-$service" \
    --region $REGION \
    --image-scanning-configuration scanOnPush=true 2>/dev/null || true
done
echo "✓ Repositories créés"
echo ""

# Étape 3 : Login ECR
echo "🔐 Login ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com 2>&1 | grep -v "WARNING"
echo "✓ Authentifié"
echo ""

# Étape 4 : Build et push
echo "🏗️  Build et push des images..."
echo "    (Durée estimée: 40-60 minutes pour ${#ALL_SERVICES[@]} services)"
echo ""

COUNTER=1
TOTAL=${#ALL_SERVICES[@]}

for service in "${!ALL_SERVICES[@]}"; do
  echo "  [$COUNTER/$TOTAL] rt-$service"

  docker build -t rt-$service -f services/$service/Dockerfile . > /tmp/build-$service.log 2>&1

  if [ $? -eq 0 ]; then
    echo "    ✓ Build OK"
    docker tag rt-$service $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/rt-$service:latest
    docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/rt-$service:latest > /tmp/push-$service.log 2>&1

    if [ $? -eq 0 ]; then
      echo "    ✓ Push OK"
    else
      echo "    ❌ Erreur push (voir /tmp/push-$service.log)"
    fi
  else
    echo "    ❌ Erreur build (voir /tmp/build-$service.log)"
  fi

  ((COUNTER++))
  echo ""
done

echo "✓ Images dans ECR"
echo ""

# Étape 5 : Secrets
echo "🔑 Récupération des secrets..."
ROLE_ARN=$(aws iam get-role --role-name ecsTaskExecutionRoleRT --query 'Role.Arn' --output text)
MONGODB_SECRET=$(aws secretsmanager describe-secret --secret-id rt/mongodb/uri --region $REGION --query 'ARN' --output text)
JWT_SECRET=$(aws secretsmanager describe-secret --secret-id rt/jwt/secret --region $REGION --query 'ARN' --output text)
SMTP_USER=$(aws secretsmanager describe-secret --secret-id rt/smtp/user --region $REGION --query 'ARN' --output text)
SMTP_PASS=$(aws secretsmanager describe-secret --secret-id rt/smtp/password --region $REGION --query 'ARN' --output text)
OPENAI=$(aws secretsmanager describe-secret --secret-id rt/openai/key --region $REGION --query 'ARN' --output text)

echo "✓ Secrets récupérés"
echo ""

# Fonction de déploiement
deploy_service() {
  local SERVICE_NAME=$1
  local PORT=$2

  echo "  → $SERVICE_NAME:$PORT"

  cat > /tmp/task-$SERVICE_NAME.json <<EOF
{
  "family": "rt-$SERVICE_NAME",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "$ROLE_ARN",
  "containerDefinitions": [{
    "name": "rt-$SERVICE_NAME",
    "image": "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/rt-$SERVICE_NAME:latest",
    "essential": true,
    "portMappings": [{"containerPort": $PORT, "protocol": "tcp"}],
    "environment": [
      {"name": "NODE_ENV", "value": "production"},
      {"name": "PORT", "value": "$PORT"}
    ],
    "secrets": [
      {"name": "MONGODB_URI", "valueFrom": "$MONGODB_SECRET"},
      {"name": "JWT_SECRET", "valueFrom": "$JWT_SECRET"},
      {"name": "SMTP_USER", "valueFrom": "$SMTP_USER"},
      {"name": "SMTP_PASS", "valueFrom": "$SMTP_PASS"},
      {"name": "OPENAI_API_KEY", "valueFrom": "$OPENAI"}
    ],
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "/ecs/rt-$SERVICE_NAME",
        "awslogs-region": "$REGION",
        "awslogs-stream-prefix": "ecs",
        "awslogs-create-group": "true"
      }
    }
  }]
}
EOF

  aws ecs register-task-definition --cli-input-json file:///tmp/task-$SERVICE_NAME.json --region $REGION > /dev/null

  SERVICE_EXISTS=$(aws ecs describe-services --cluster rt-technologie-cluster --services rt-$SERVICE_NAME-service --region $REGION --query 'services[0].status' --output text 2>/dev/null || echo "")

  if [ "$SERVICE_EXISTS" = "ACTIVE" ]; then
    aws ecs update-service --cluster rt-technologie-cluster --service rt-$SERVICE_NAME-service --task-definition rt-$SERVICE_NAME --force-new-deployment --region $REGION > /dev/null
  else
    aws ecs create-service --cluster rt-technologie-cluster --service-name rt-$SERVICE_NAME-service --task-definition rt-$SERVICE_NAME --desired-count 1 --launch-type FARGATE --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_1,$SUBNET_2],securityGroups=[$SECURITY_GROUP_ID],assignPublicIp=ENABLED}" --region $REGION > /dev/null
  fi

  echo "    ✓ Déployé"
}

# Étape 6 : Déployer tous les services
echo "🚢 Déploiement ECS..."
echo ""

for service in "${!ALL_SERVICES[@]}"; do
  deploy_service "$service" "${ALL_SERVICES[$service]}"
done

echo ""
echo "========================================="
echo "✅ TOUS LES SERVICES DÉPLOYÉS"
echo "========================================="
echo ""
echo "⏳ Attente du démarrage (30s)..."
sleep 30

echo ""
echo "🌐 Adresses IP de TOUS les services:"
echo ""

# Fonction pour récupérer l'IP
get_ip() {
  local service=$1
  local port=$2
  T=$(aws ecs list-tasks --cluster rt-technologie-cluster --service-name rt-$service-service --region $REGION --query 'taskArns[0]' --output text 2>/dev/null)
  if [ -n "$T" ] && [ "$T" != "None" ]; then
    ENI=$(aws ecs describe-tasks --cluster rt-technologie-cluster --tasks $T --region $REGION --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' --output text 2>/dev/null)
    IP=$(aws ec2 describe-network-interfaces --network-interface-ids $ENI --region $REGION --query 'NetworkInterfaces[0].Association.PublicIp' --output text 2>/dev/null)
    [ -n "$IP" ] && [ "$IP" != "None" ] && echo "✓ $service: http://$IP:$port" || echo "⏳ $service: Démarrage..."
  else
    echo "⏳ $service: Démarrage..."
  fi
}

# Afficher tous les services (y compris ceux déjà déployés)
get_ip "client-onboarding" "3020"
get_ip "core-orders" "3030"
get_ip "affret-ia" "3010"
get_ip "vigilance" "3040"

for service in "${!ALL_SERVICES[@]}"; do
  get_ip "$service" "${ALL_SERVICES[$service]}"
done

echo ""
echo "========================================="
echo "📝 Total: 20 services backend déployés"
echo ""
echo "Pour récupérer les IPs plus tard:"
echo "  ~/get-all-ips.sh"
echo "========================================="
echo ""

# Créer script pour récupérer toutes les IPs
cat > ~/get-all-ips.sh << 'GETALL'
#!/bin/bash
REGION="eu-central-1"
echo "🌐 TOUS les services RT-Technologie:"
echo ""

ALL_SERVICES="client-onboarding:3020 core-orders:3030 affret-ia:3010 vigilance:3040 notifications:3050 authz:3007 admin-gateway:3008 pricing-grids:3060 planning:3070 bourse:3080 palette:3090 wms-sync:3100 erp-sync:3110 tms-sync:3120 tracking-ia:3130 chatbot:3140 geo-tracking:3150 ecpmr:3160 storage-market:3170 training:3180"

for s in $ALL_SERVICES; do
  SVC=${s%:*}; PORT=${s#*:}
  T=$(aws ecs list-tasks --cluster rt-technologie-cluster --service-name rt-$SVC-service --region $REGION --query 'taskArns[0]' --output text 2>/dev/null)
  if [ -n "$T" ] && [ "$T" != "None" ]; then
    ENI=$(aws ecs describe-tasks --cluster rt-technologie-cluster --tasks $T --region $REGION --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' --output text 2>/dev/null)
    IP=$(aws ec2 describe-network-interfaces --network-interface-ids $ENI --region $REGION --query 'NetworkInterfaces[0].Association.PublicIp' --output text 2>/dev/null)
    [ -n "$IP" ] && [ "$IP" != "None" ] && echo "✓ $SVC: http://$IP:$PORT" || echo "⏳ $SVC"
  else
    echo "⏳ $SVC"
  fi
done
echo ""
GETALL

chmod +x ~/get-all-ips.sh
echo "✓ Script ~/get-all-ips.sh créé"
echo ""
