#!/bin/bash
# =============================================================================
# Script de Déploiement Complet RT-Technologie
# À COPIER-COLLER dans AWS CloudShell
# =============================================================================

set -e

echo "========================================="
echo "🚀 Déploiement RT-Technologie"
echo "========================================="
echo ""

# Étape 1 : Cloner le repository
echo "📦 Étape 1: Clonage du repository..."
cd ~
rm -rf RT-Technologie 2>/dev/null || true
git clone https://github.com/romain-38530/RT-Technologie.git
cd RT-Technologie
git checkout dockerfile

echo "✓ Repository cloné avec succès"
echo ""

# Étape 2 : Configuration
echo "🔧 Étape 2: Configuration..."
REGION="eu-central-1"
ACCOUNT_ID="004843574253"
VPC_ID="vpc-0d84de1ac867982db"
SECURITY_GROUP_ID="sg-0add3ac473775825a"
SUBNET_1="subnet-0cce60a3fe31c0d9e"
SUBNET_2="subnet-0a6a2f8fd776906ee"

echo "  Région: $REGION"
echo "  Account: $ACCOUNT_ID"
echo ""

# Étape 3 : Créer les ECR repositories pour les nouveaux services
echo "📦 Étape 3: Création des repositories ECR..."
for service in core-orders affret-ia vigilance; do
  echo "  → Création repository: rt-$service"
  aws ecr create-repository \
    --repository-name "rt-$service" \
    --region $REGION \
    --image-scanning-configuration scanOnPush=true \
    --encryption-configuration encryptionType=AES256 2>/dev/null || echo "    ℹ️  Repository existe déjà"
done

echo "✓ Repositories ECR créés"
echo ""

# Étape 4 : Login ECR
echo "🔐 Étape 4: Authentification ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com
echo "✓ Authentification réussie"
echo ""

# Étape 5 : Build et push des images
echo "🏗️  Étape 5: Build et push des images Docker..."

# Service 1 : core-orders
echo ""
echo "  → Build rt-core-orders..."
docker build -t rt-core-orders:latest -f services/core-orders/Dockerfile . 2>&1 | tail -20
docker tag rt-core-orders:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/rt-core-orders:latest
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/rt-core-orders:latest 2>&1 | tail -10
echo "  ✓ rt-core-orders déployé"

# Service 2 : affret-ia
echo ""
echo "  → Build rt-affret-ia..."
docker build -t rt-affret-ia:latest -f services/affret-ia/Dockerfile . 2>&1 | tail -20
docker tag rt-affret-ia:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/rt-affret-ia:latest
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/rt-affret-ia:latest 2>&1 | tail -10
echo "  ✓ rt-affret-ia déployé"

# Service 3 : vigilance
echo ""
echo "  → Build rt-vigilance..."
docker build -t rt-vigilance:latest -f services/vigilance/Dockerfile . 2>&1 | tail -20
docker tag rt-vigilance:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/rt-vigilance:latest
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/rt-vigilance:latest 2>&1 | tail -10
echo "  ✓ rt-vigilance déployé"

echo ""
echo "✓ Toutes les images sont dans ECR"
echo ""

# Étape 6 : Créer le cluster ECS si nécessaire
echo "☁️  Étape 6: Vérification du cluster ECS..."
aws ecs create-cluster \
  --cluster-name rt-technologie-cluster \
  --region $REGION \
  --capacity-providers FARGATE FARGATE_SPOT \
  --default-capacity-provider-strategy capacityProvider=FARGATE,weight=1 2>/dev/null || echo "  ℹ️  Cluster existe déjà"
echo ""

# Étape 7 : Récupérer le rôle d'exécution
echo "🔑 Étape 7: Récupération du rôle IAM..."
ROLE_NAME="ecsTaskExecutionRoleRT"
ROLE_ARN=$(aws iam get-role --role-name $ROLE_NAME --query 'Role.Arn' --output text 2>/dev/null || echo "")

if [ -z "$ROLE_ARN" ]; then
  echo "❌ Rôle $ROLE_NAME n'existe pas. Créez-le d'abord."
  exit 1
fi

echo "  ✓ Rôle: $ROLE_ARN"
echo ""

# Étape 8 : Récupérer les ARNs des secrets
echo "🔐 Étape 8: Récupération des secrets..."
MONGODB_SECRET=$(aws secretsmanager describe-secret --secret-id rt/mongodb/uri --region $REGION --query 'ARN' --output text 2>/dev/null || echo "")
JWT_SECRET=$(aws secretsmanager describe-secret --secret-id rt/jwt/secret --region $REGION --query 'ARN' --output text 2>/dev/null || echo "")
SMTP_USER_SECRET=$(aws secretsmanager describe-secret --secret-id rt/smtp/user --region $REGION --query 'ARN' --output text 2>/dev/null || echo "")
SMTP_PASS_SECRET=$(aws secretsmanager describe-secret --secret-id rt/smtp/password --region $REGION --query 'ARN' --output text 2>/dev/null || echo "")
OPENAI_SECRET=$(aws secretsmanager describe-secret --secret-id rt/openai/key --region $REGION --query 'ARN' --output text 2>/dev/null || echo "")

if [ -z "$MONGODB_SECRET" ]; then
  echo "❌ Secret rt/mongodb/uri n'existe pas"
  exit 1
fi

echo "  ✓ Secrets récupérés"
echo ""

# Étape 9 : Déployer core-orders
echo "🚢 Étape 9: Déploiement des services ECS..."
echo ""
echo "  → Déploiement: core-orders (port 3030)"

cat > /tmp/task-def-core-orders.json <<EOF
{
  "family": "rt-core-orders",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "$ROLE_ARN",
  "containerDefinitions": [{
    "name": "rt-core-orders",
    "image": "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/rt-core-orders:latest",
    "essential": true,
    "portMappings": [{
      "containerPort": 3030,
      "protocol": "tcp"
    }],
    "environment": [
      {"name": "NODE_ENV", "value": "production"},
      {"name": "PORT", "value": "3030"}
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
        "awslogs-group": "/ecs/rt-core-orders",
        "awslogs-region": "$REGION",
        "awslogs-stream-prefix": "ecs",
        "awslogs-create-group": "true"
      }
    }
  }]
}
EOF

aws ecs register-task-definition --cli-input-json file:///tmp/task-def-core-orders.json --region $REGION > /dev/null

# Créer ou mettre à jour le service
SERVICE_EXISTS=$(aws ecs describe-services \
  --cluster rt-technologie-cluster \
  --services rt-core-orders-service \
  --region $REGION \
  --query 'services[0].status' \
  --output text 2>/dev/null || echo "")

if [ "$SERVICE_EXISTS" = "ACTIVE" ]; then
  echo "    ℹ️  Mise à jour du service existant..."
  aws ecs update-service \
    --cluster rt-technologie-cluster \
    --service rt-core-orders-service \
    --task-definition rt-core-orders \
    --force-new-deployment \
    --region $REGION > /dev/null
else
  echo "    → Création du nouveau service..."
  aws ecs create-service \
    --cluster rt-technologie-cluster \
    --service-name rt-core-orders-service \
    --task-definition rt-core-orders \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_1,$SUBNET_2],securityGroups=[$SECURITY_GROUP_ID],assignPublicIp=ENABLED}" \
    --region $REGION > /dev/null
fi

echo "  ✓ core-orders déployé"

# Étape 10 : Déployer affret-ia
echo ""
echo "  → Déploiement: affret-ia (port 3010)"

cat > /tmp/task-def-affret-ia.json <<EOF
{
  "family": "rt-affret-ia",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "$ROLE_ARN",
  "containerDefinitions": [{
    "name": "rt-affret-ia",
    "image": "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/rt-affret-ia:latest",
    "essential": true,
    "portMappings": [{
      "containerPort": 3010,
      "protocol": "tcp"
    }],
    "environment": [
      {"name": "NODE_ENV", "value": "production"},
      {"name": "PORT", "value": "3010"},
      {"name": "AFFRET_IA_PORT", "value": "3010"}
    ],
    "secrets": [
      {"name": "MONGODB_URI", "valueFrom": "$MONGODB_SECRET"},
      {"name": "JWT_SECRET", "valueFrom": "$JWT_SECRET"},
      {"name": "OPENAI_API_KEY", "valueFrom": "$OPENAI_SECRET"}
    ],
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "/ecs/rt-affret-ia",
        "awslogs-region": "$REGION",
        "awslogs-stream-prefix": "ecs",
        "awslogs-create-group": "true"
      }
    }
  }]
}
EOF

aws ecs register-task-definition --cli-input-json file:///tmp/task-def-affret-ia.json --region $REGION > /dev/null

SERVICE_EXISTS=$(aws ecs describe-services \
  --cluster rt-technologie-cluster \
  --services rt-affret-ia-service \
  --region $REGION \
  --query 'services[0].status' \
  --output text 2>/dev/null || echo "")

if [ "$SERVICE_EXISTS" = "ACTIVE" ]; then
  echo "    ℹ️  Mise à jour du service existant..."
  aws ecs update-service \
    --cluster rt-technologie-cluster \
    --service rt-affret-ia-service \
    --task-definition rt-affret-ia \
    --force-new-deployment \
    --region $REGION > /dev/null
else
  echo "    → Création du nouveau service..."
  aws ecs create-service \
    --cluster rt-technologie-cluster \
    --service-name rt-affret-ia-service \
    --task-definition rt-affret-ia \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_1,$SUBNET_2],securityGroups=[$SECURITY_GROUP_ID],assignPublicIp=ENABLED}" \
    --region $REGION > /dev/null
fi

echo "  ✓ affret-ia déployé"

# Étape 11 : Déployer vigilance
echo ""
echo "  → Déploiement: vigilance (port 3040)"

cat > /tmp/task-def-vigilance.json <<EOF
{
  "family": "rt-vigilance",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "$ROLE_ARN",
  "containerDefinitions": [{
    "name": "rt-vigilance",
    "image": "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/rt-vigilance:latest",
    "essential": true,
    "portMappings": [{
      "containerPort": 3040,
      "protocol": "tcp"
    }],
    "environment": [
      {"name": "NODE_ENV", "value": "production"},
      {"name": "PORT", "value": "3040"}
    ],
    "secrets": [
      {"name": "MONGODB_URI", "valueFrom": "$MONGODB_SECRET"},
      {"name": "JWT_SECRET", "valueFrom": "$JWT_SECRET"}
    ],
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "/ecs/rt-vigilance",
        "awslogs-region": "$REGION",
        "awslogs-stream-prefix": "ecs",
        "awslogs-create-group": "true"
      }
    }
  }]
}
EOF

aws ecs register-task-definition --cli-input-json file:///tmp/task-def-vigilance.json --region $REGION > /dev/null

SERVICE_EXISTS=$(aws ecs describe-services \
  --cluster rt-technologie-cluster \
  --services rt-vigilance-service \
  --region $REGION \
  --query 'services[0].status' \
  --output text 2>/dev/null || echo "")

if [ "$SERVICE_EXISTS" = "ACTIVE" ]; then
  echo "    ℹ️  Mise à jour du service existant..."
  aws ecs update-service \
    --cluster rt-technologie-cluster \
    --service rt-vigilance-service \
    --task-definition rt-vigilance \
    --force-new-deployment \
    --region $REGION > /dev/null
else
  echo "    → Création du nouveau service..."
  aws ecs create-service \
    --cluster rt-technologie-cluster \
    --service-name rt-vigilance-service \
    --task-definition rt-vigilance \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_1,$SUBNET_2],securityGroups=[$SECURITY_GROUP_ID],assignPublicIp=ENABLED}" \
    --region $REGION > /dev/null
fi

echo "  ✓ vigilance déployé"
echo ""

# Étape 12 : Attendre et récupérer les IPs
echo "========================================="
echo "✅ DÉPLOIEMENT TERMINÉ"
echo "========================================="
echo ""
echo "⏳ Attente du démarrage des services (30 secondes)..."
sleep 30

echo ""
echo "🌐 Récupération des adresses IP..."
echo ""

# Fonction pour récupérer l'IP
get_service_ip() {
  local service=$1
  local port=$2

  TASK_ARN=$(aws ecs list-tasks \
    --cluster rt-technologie-cluster \
    --service-name rt-$service-service \
    --region $REGION \
    --query 'taskArns[0]' \
    --output text 2>/dev/null || echo "")

  if [ -n "$TASK_ARN" ] && [ "$TASK_ARN" != "None" ]; then
    ENI_ID=$(aws ecs describe-tasks \
      --cluster rt-technologie-cluster \
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

      if [ -n "$PUBLIC_IP" ] && [ "$PUBLIC_IP" != "None" ]; then
        echo "✓ $service: http://$PUBLIC_IP:$port"
      else
        echo "⏳ $service: IP en cours d'attribution..."
      fi
    fi
  else
    echo "⏳ $service: Service en démarrage..."
  fi
}

get_service_ip "client-onboarding" "3020"
get_service_ip "core-orders" "3030"
get_service_ip "affret-ia" "3010"
get_service_ip "vigilance" "3040"

echo ""
echo "========================================="
echo "📝 Notes:"
echo "  - Si une IP n'est pas encore affichée, attendez 1-2 minutes"
echo "  - Utilisez './infra/get-service-ips.sh' pour réobtenir les IPs"
echo "  - Testez les health checks: curl http://IP:PORT/health"
echo "========================================="
