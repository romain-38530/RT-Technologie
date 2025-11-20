#!/bin/bash
#═══════════════════════════════════════════════════════════════════════════════
# DÉPLOIEMENT DES 10 SERVICES AWS MANQUANTS
#═══════════════════════════════════════════════════════════════════════════════

set -e

REGION="eu-central-1"
ACCOUNT_ID="004843574253"
CLUSTER="rt-production"
INSTANCE_ID="i-006ba88ded9fb0f20"

# Services manquants à déployer
SERVICES=(
  "affret-ia"
  "bourse"
  "chatbot"
  "client-onboarding"
  "core-orders"
  "ecpmr"
  "pricing-grids"
  "vigilance"
  "wms-sync"
)

echo "════════════════════════════════════════════════════════════════"
echo "🚀 DÉPLOIEMENT DES 10 SERVICES MANQUANTS SUR AWS ECS"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Services à déployer: ${SERVICES[@]}"
echo ""

# ÉTAPE 1 : Build et Push des Images Docker
echo "════════════════════════════════════════════════════════════════"
echo "📦 ÉTAPE 1/3 : Build et Push des Images Docker"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Créer la commande pour SSM
SERVICES_LIST=$(IFS=' ' ; echo "${SERVICES[*]}")

CMD_ID=$(aws ssm send-command \
  --instance-ids $INSTANCE_ID \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "set -e",
    "REGION=eu-central-1",
    "ACCOUNT_ID=004843574253",
    "echo Login ECR...",
    "aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com",
    "cd /home/ec2-user/RT-Technologie",
    "git pull",
    "echo Build et Push des services manquants...",
    "for SERVICE in affret-ia bourse chatbot client-onboarding core-orders ecpmr pricing-grids vigilance wms-sync; do",
    "  echo === Building $SERVICE ===",
    "  aws ecr describe-repositories --repository-names rt-$SERVICE --region $REGION 2>/dev/null || aws ecr create-repository --repository-name rt-$SERVICE --region $REGION",
    "  docker build -t rt-$SERVICE:latest -f services/$SERVICE/Dockerfile . || { echo ERROR: Build failed for $SERVICE; continue; }",
    "  docker tag rt-$SERVICE:latest ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/rt-${SERVICE}:latest",
    "  docker push ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/rt-${SERVICE}:latest",
    "  echo OK: $SERVICE pushed",
    "done",
    "echo Build complet"
  ]' \
  --region $REGION \
  --timeout-seconds 3600 \
  --output text \
  --query 'Command.CommandId')

echo "✅ Commande SSM lancée: $CMD_ID"
echo ""
echo "⏳ Attente du build (15-20 minutes pour 10 services)..."
echo ""

# Attendre que la commande se termine
while true; do
  STATUS=$(aws ssm get-command-invocation \
    --command-id $CMD_ID \
    --instance-id $INSTANCE_ID \
    --region $REGION \
    --output text \
    --query 'Status')

  if [ "$STATUS" = "Success" ]; then
    echo "✅ Build terminé avec succès"
    break
  elif [ "$STATUS" = "Failed" ]; then
    echo "❌ Build échoué"
    aws ssm get-command-invocation \
      --command-id $CMD_ID \
      --instance-id $INSTANCE_ID \
      --region $REGION \
      --output text \
      --query 'StandardErrorContent'
    exit 1
  elif [ "$STATUS" = "InProgress" ] || [ "$STATUS" = "Pending" ]; then
    echo "⏳ Build en cours... ($STATUS)"
    sleep 30
  else
    echo "⚠️  Status inconnu: $STATUS"
    sleep 30
  fi
done

echo ""

# ÉTAPE 2 : Créer les Task Definitions
echo "════════════════════════════════════════════════════════════════"
echo "📋 ÉTAPE 2/3 : Création des Task Definitions"
echo "════════════════════════════════════════════════════════════════"
echo ""

for SERVICE in "${SERVICES[@]}"; do
  echo "📝 Création de la task definition pour rt-$SERVICE..."

  cat > /tmp/task-def-$SERVICE.json << TASKDEF
{
  "family": "rt-$SERVICE",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::$ACCOUNT_ID:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "rt-$SERVICE",
      "image": "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/rt-$SERVICE:latest",
      "essential": true,
      "portMappings": [{"containerPort": 3000, "protocol": "tcp"}],
      "environment": [
        {"name": "NODE_ENV", "value": "production"},
        {"name": "PORT", "value": "3000"}
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/rt-$SERVICE",
          "awslogs-region": "$REGION",
          "awslogs-stream-prefix": "ecs",
          "awslogs-create-group": "true"
        }
      }
    }
  ]
}
TASKDEF

  aws ecs register-task-definition \
    --cli-input-json file:///tmp/task-def-$SERVICE.json \
    --region $REGION > /dev/null

  echo "  ✅ Task definition créée"
done

echo ""

# ÉTAPE 3 : Déployer les Services ECS
echo "════════════════════════════════════════════════════════════════"
echo "🚀 ÉTAPE 3/3 : Déploiement des Services ECS"
echo "════════════════════════════════════════════════════════════════"
echo ""

SUBNET="subnet-0cce60a3fe31c0d9e"
SECURITY_GROUP="sg-069ac5d7a0ae591b7"

for SERVICE in "${SERVICES[@]}"; do
  echo "🚀 Déploiement de rt-$SERVICE..."

  # Vérifier si le service existe déjà
  if aws ecs describe-services \
    --cluster $CLUSTER \
    --services rt-$SERVICE \
    --region $REGION \
    --query 'services[0].status' \
    --output text 2>/dev/null | grep -q ACTIVE; then

    echo "  ⚠️  Service existe déjà, mise à jour..."
    aws ecs update-service \
      --cluster $CLUSTER \
      --service rt-$SERVICE \
      --force-new-deployment \
      --region $REGION > /dev/null
  else
    echo "  📦 Création du service..."
    aws ecs create-service \
      --cluster $CLUSTER \
      --service-name rt-$SERVICE \
      --task-definition rt-$SERVICE \
      --desired-count 1 \
      --launch-type FARGATE \
      --network-configuration "awsvpcConfiguration={subnets=[$SUBNET],securityGroups=[$SECURITY_GROUP],assignPublicIp=ENABLED}" \
      --region $REGION > /dev/null
  fi

  echo "  ✅ Service déployé"
  sleep 2
done

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "⏳ Attente du démarrage des services (2-3 minutes)..."
echo "════════════════════════════════════════════════════════════════"
echo ""
sleep 120

# ÉTAPE 4 : Récupérer les IPs Publiques
echo "════════════════════════════════════════════════════════════════"
echo "🌐 RÉCUPÉRATION DES IPS PUBLIQUES"
echo "════════════════════════════════════════════════════════════════"
echo ""

for SERVICE in "${SERVICES[@]}"; do
  echo "🔍 rt-$SERVICE..."

  # Récupérer l'ARN de la tâche
  TASK_ARN=$(aws ecs list-tasks \
    --cluster $CLUSTER \
    --service-name rt-$SERVICE \
    --region $REGION \
    --output text \
    --query 'taskArns[0]')

  if [ -z "$TASK_ARN" ] || [ "$TASK_ARN" = "None" ]; then
    echo "  ❌ Aucune tâche trouvée"
    continue
  fi

  # Récupérer l'ENI
  ENI=$(aws ecs describe-tasks \
    --cluster $CLUSTER \
    --tasks $TASK_ARN \
    --region $REGION \
    --output text \
    --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value')

  if [ -z "$ENI" ]; then
    echo "  ❌ ENI non trouvée"
    continue
  fi

  # Récupérer l'IP publique
  PUBLIC_IP=$(aws ec2 describe-network-interfaces \
    --network-interface-ids $ENI \
    --region $REGION \
    --output text \
    --query 'NetworkInterfaces[0].Association.PublicIp')

  if [ -z "$PUBLIC_IP" ]; then
    echo "  ❌ IP publique non trouvée"
  else
    echo "  ✅ http://$PUBLIC_IP:3000"
  fi
done

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✅ DÉPLOIEMENT TERMINÉ"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Total: 21 services déployés sur AWS ECS"
echo ""
echo "Vérifier le statut complet:"
echo "  aws ecs list-services --cluster rt-production --region eu-central-1"
echo ""
