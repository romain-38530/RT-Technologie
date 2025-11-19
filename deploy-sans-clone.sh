#!/bin/bash
# Script de déploiement SANS clonage (utilise le code déjà présent)
set -e

echo "========================================="
echo "🚀 Déploiement RT-Technologie"
echo "========================================="
echo ""

# Configuration
REGION="eu-central-1"
ACCOUNT_ID="004843574253"
VPC_ID="vpc-0d84de1ac867982db"
SECURITY_GROUP_ID="sg-0add3ac473775825a"
SUBNET_1="subnet-0cce60a3fe31c0d9e"
SUBNET_2="subnet-0a6a2f8fd776906ee"

# Aller dans le dossier existant
cd ~/RT-Technologie
git pull origin dockerfile 2>/dev/null || echo "⚠️  Impossible de pull, utilisation du code local"

echo "✓ Utilisation du code local"
echo ""

# Étape 1 : Créer les ECR repositories
echo "📦 Création des repositories ECR..."
for service in core-orders affret-ia vigilance; do
  echo "  → rt-$service"
  aws ecr create-repository \
    --repository-name "rt-$service" \
    --region $REGION \
    --image-scanning-configuration scanOnPush=true \
    --encryption-configuration encryptionType=AES256 2>/dev/null || echo "    ✓ Existe déjà"
done

echo ""

# Étape 2 : Login ECR
echo "🔐 Login ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

echo ""

# Étape 3 : Build et push des images
echo "🏗️  Build des images Docker..."

# core-orders
echo ""
echo "  [1/3] rt-core-orders..."
docker build -t rt-core-orders:latest -f services/core-orders/Dockerfile . 2>&1 | grep -E "(Step|Successfully|FINISHED)" | tail -5
docker tag rt-core-orders:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/rt-core-orders:latest
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/rt-core-orders:latest 2>&1 | grep -E "(Pushed|digest)" | tail -2
echo "  ✓ core-orders OK"

# affret-ia
echo ""
echo "  [2/3] rt-affret-ia..."
docker build -t rt-affret-ia:latest -f services/affret-ia/Dockerfile . 2>&1 | grep -E "(Step|Successfully|FINISHED)" | tail -5
docker tag rt-affret-ia:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/rt-affret-ia:latest
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/rt-affret-ia:latest 2>&1 | grep -E "(Pushed|digest)" | tail -2
echo "  ✓ affret-ia OK"

# vigilance
echo ""
echo "  [3/3] rt-vigilance..."
docker build -t rt-vigilance:latest -f services/vigilance/Dockerfile . 2>&1 | grep -E "(Step|Successfully|FINISHED)" | tail -5
docker tag rt-vigilance:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/rt-vigilance:latest
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/rt-vigilance:latest 2>&1 | grep -E "(Pushed|digest)" | tail -2
echo "  ✓ vigilance OK"

echo ""
echo "✓ Toutes les images sont dans ECR"
echo ""

# Étape 4 : Récupérer les secrets et le rôle
echo "🔑 Récupération des secrets..."
ROLE_ARN=$(aws iam get-role --role-name ecsTaskExecutionRoleRT --query 'Role.Arn' --output text)
MONGODB_SECRET=$(aws secretsmanager describe-secret --secret-id rt/mongodb/uri --region $REGION --query 'ARN' --output text)
JWT_SECRET=$(aws secretsmanager describe-secret --secret-id rt/jwt/secret --region $REGION --query 'ARN' --output text)
SMTP_USER_SECRET=$(aws secretsmanager describe-secret --secret-id rt/smtp/user --region $REGION --query 'ARN' --output text)
SMTP_PASS_SECRET=$(aws secretsmanager describe-secret --secret-id rt/smtp/password --region $REGION --query 'ARN' --output text)
OPENAI_SECRET=$(aws secretsmanager describe-secret --secret-id rt/openai/key --region $REGION --query 'ARN' --output text)

echo "✓ Secrets récupérés"
echo ""

# Fonction pour déployer un service
deploy_service() {
  local SERVICE_NAME=$1
  local PORT=$2

  echo "  → Déploiement: $SERVICE_NAME (port $PORT)"

  # Créer la task definition
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
      {"name": "SMTP_USER", "valueFrom": "$SMTP_USER_SECRET"},
      {"name": "SMTP_PASS", "valueFrom": "$SMTP_PASS_SECRET"},
      {"name": "OPENAI_API_KEY", "valueFrom": "$OPENAI_SECRET"}
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

  # Créer ou mettre à jour le service
  SERVICE_EXISTS=$(aws ecs describe-services --cluster rt-technologie-cluster --services rt-$SERVICE_NAME-service --region $REGION --query 'services[0].status' --output text 2>/dev/null || echo "")

  if [ "$SERVICE_EXISTS" = "ACTIVE" ]; then
    aws ecs update-service --cluster rt-technologie-cluster --service rt-$SERVICE_NAME-service --task-definition rt-$SERVICE_NAME --force-new-deployment --region $REGION > /dev/null
  else
    aws ecs create-service --cluster rt-technologie-cluster --service-name rt-$SERVICE_NAME-service --task-definition rt-$SERVICE_NAME --desired-count 1 --launch-type FARGATE --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_1,$SUBNET_2],securityGroups=[$SECURITY_GROUP_ID],assignPublicIp=ENABLED}" --region $REGION > /dev/null
  fi

  echo "    ✓ $SERVICE_NAME déployé"
}

# Étape 5 : Déployer les services
echo "🚢 Déploiement des services ECS..."
echo ""
deploy_service "core-orders" "3030"
deploy_service "affret-ia" "3010"
deploy_service "vigilance" "3040"

echo ""
echo "========================================="
echo "✅ DÉPLOIEMENT TERMINÉ"
echo "========================================="
echo ""
echo "⏳ Attente du démarrage (30s)..."
sleep 30

echo ""
echo "🌐 Adresses IP des services:"
echo ""

# Fonction pour récupérer l'IP
get_ip() {
  local service=$1
  local port=$2
  TASK_ARN=$(aws ecs list-tasks --cluster rt-technologie-cluster --service-name rt-$service-service --region $REGION --query 'taskArns[0]' --output text 2>/dev/null)
  if [ -n "$TASK_ARN" ] && [ "$TASK_ARN" != "None" ]; then
    ENI_ID=$(aws ecs describe-tasks --cluster rt-technologie-cluster --tasks $TASK_ARN --region $REGION --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' --output text 2>/dev/null)
    if [ -n "$ENI_ID" ]; then
      PUBLIC_IP=$(aws ec2 describe-network-interfaces --network-interface-ids $ENI_ID --region $REGION --query 'NetworkInterfaces[0].Association.PublicIp' --output text 2>/dev/null)
      if [ -n "$PUBLIC_IP" ] && [ "$PUBLIC_IP" != "None" ]; then
        echo "✓ $service: http://$PUBLIC_IP:$port"
      else
        echo "⏳ $service: IP en attribution..."
      fi
    fi
  else
    echo "⏳ $service: Démarrage..."
  fi
}

get_ip "client-onboarding" "3020"
get_ip "core-orders" "3030"
get_ip "affret-ia" "3010"
get_ip "vigilance" "3040"

echo ""
echo "========================================="
echo ""
echo "📝 Pour voir les IPs plus tard:"
echo "   cd ~/RT-Technologie && bash deploy-sans-clone.sh"
echo ""
echo "📋 Pour voir les logs:"
echo "   aws logs tail /ecs/rt-core-orders --follow --region eu-central-1"
echo "========================================="
