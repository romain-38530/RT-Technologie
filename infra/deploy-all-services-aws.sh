#!/bin/bash
# =============================================================================
# Script de déploiement complet - Tous les services RT-Technologie sur AWS ECS
# À exécuter dans AWS CloudShell
# =============================================================================

set -e

# Configuration
REGION="eu-central-1"
ACCOUNT_ID="004843574253"
VPC_ID="vpc-0d84de1ac867982db"
SECURITY_GROUP_ID="sg-0add3ac473775825a"
SUBNET_1="subnet-0cce60a3fe31c0d9e"
SUBNET_2="subnet-0a6a2f8fd776906ee"

# Services à déployer
declare -A SERVICES=(
  ["client-onboarding"]="3020"
  ["core-orders"]="3030"
  ["affret-ia"]="3010"
  ["vigilance"]="3040"
)

echo "========================================="
echo "🚀 Déploiement RT-Technologie sur AWS ECS"
echo "========================================="
echo "Région: $REGION"
echo "Account: $ACCOUNT_ID"
echo ""

# Étape 1: Cloner le repository
echo "📦 Étape 1: Clonage du repository..."
if [ ! -d "RT-Technologie" ]; then
  git clone https://github.com/votre-repo/RT-Technologie.git || {
    echo "⚠️  Repository non disponible. Assurez-vous d'uploader les fichiers manuellement."
    echo "Pour uploader: utilisez 'Actions > Upload file' dans CloudShell"
    exit 1
  }
fi
cd RT-Technologie

# Étape 2: Créer les ECR repositories
echo ""
echo "📦 Étape 2: Création des repositories ECR..."
for service in "${!SERVICES[@]}"; do
  echo "  → Création repository: rt-$service"
  aws ecr create-repository \
    --repository-name "rt-$service" \
    --region $REGION \
    --image-scanning-configuration scanOnPush=true \
    --encryption-configuration encryptionType=AES256 2>/dev/null || echo "    ℹ️  Repository existe déjà"
done

# Étape 3: Login ECR
echo ""
echo "🔐 Étape 3: Authentification ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

# Étape 4: Build et push des images
echo ""
echo "🏗️  Étape 4: Build et push des images Docker..."
for service in "${!SERVICES[@]}"; do
  echo ""
  echo "  → Build image: rt-$service"
  docker build -t rt-$service:latest -f services/$service/Dockerfile .

  echo "  → Tag image pour ECR"
  docker tag rt-$service:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/rt-$service:latest

  echo "  → Push vers ECR"
  docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/rt-$service:latest
done

# Étape 5: Créer le cluster ECS si nécessaire
echo ""
echo "☁️  Étape 5: Configuration du cluster ECS..."
aws ecs create-cluster \
  --cluster-name rt-technologie-cluster \
  --region $REGION \
  --capacity-providers FARGATE FARGATE_SPOT \
  --default-capacity-provider-strategy capacityProvider=FARGATE,weight=1 2>/dev/null || echo "  ℹ️  Cluster existe déjà"

# Étape 6: Créer le rôle d'exécution ECS si nécessaire
echo ""
echo "🔑 Étape 6: Configuration des rôles IAM..."
ROLE_NAME="ecsTaskExecutionRoleRT"
ROLE_ARN=$(aws iam get-role --role-name $ROLE_NAME --query 'Role.Arn' --output text 2>/dev/null || echo "")

if [ -z "$ROLE_ARN" ]; then
  echo "  → Création du rôle d'exécution ECS"
  cat > /tmp/trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "ecs-tasks.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}
EOF

  aws iam create-role \
    --role-name $ROLE_NAME \
    --assume-role-policy-document file:///tmp/trust-policy.json \
    --region $REGION

  aws iam attach-role-policy \
    --role-name $ROLE_NAME \
    --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy \
    --region $REGION

  aws iam attach-role-policy \
    --role-name $ROLE_NAME \
    --policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite \
    --region $REGION

  ROLE_ARN=$(aws iam get-role --role-name $ROLE_NAME --query 'Role.Arn' --output text)
  echo "  ✓ Rôle créé: $ROLE_ARN"
else
  echo "  ℹ️  Rôle existe déjà: $ROLE_ARN"
fi

# Étape 7: Récupérer les ARNs des secrets
echo ""
echo "🔐 Étape 7: Récupération des secrets..."
MONGODB_SECRET=$(aws secretsmanager describe-secret --secret-id rt/mongodb/uri --region $REGION --query 'ARN' --output text 2>/dev/null || echo "")
JWT_SECRET=$(aws secretsmanager describe-secret --secret-id rt/jwt/secret --region $REGION --query 'ARN' --output text 2>/dev/null || echo "")
SMTP_USER_SECRET=$(aws secretsmanager describe-secret --secret-id rt/smtp/user --region $REGION --query 'ARN' --output text 2>/dev/null || echo "")
SMTP_PASS_SECRET=$(aws secretsmanager describe-secret --secret-id rt/smtp/password --region $REGION --query 'ARN' --output text 2>/dev/null || echo "")
OPENAI_SECRET=$(aws secretsmanager describe-secret --secret-id rt/openai/key --region $REGION --query 'ARN' --output text 2>/dev/null || echo "")

echo "  ✓ MongoDB URI: ${MONGODB_SECRET:0:50}..."
echo "  ✓ JWT Secret: ${JWT_SECRET:0:50}..."

# Étape 8: Créer les task definitions et déployer les services
echo ""
echo "🚢 Étape 8: Déploiement des services ECS..."

for service in "${!SERVICES[@]}"; do
  PORT="${SERVICES[$service]}"
  echo ""
  echo "  → Déploiement: $service (port $PORT)"

  # Créer la task definition
  cat > /tmp/task-def-$service.json <<EOF
{
  "family": "rt-$service",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "$ROLE_ARN",
  "containerDefinitions": [{
    "name": "rt-$service",
    "image": "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/rt-$service:latest",
    "essential": true,
    "portMappings": [{
      "containerPort": $PORT,
      "protocol": "tcp"
    }],
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
        "awslogs-group": "/ecs/rt-$service",
        "awslogs-region": "$REGION",
        "awslogs-stream-prefix": "ecs",
        "awslogs-create-group": "true"
      }
    }
  }]
}
EOF

  # Enregistrer la task definition
  aws ecs register-task-definition \
    --cli-input-json file:///tmp/task-def-$service.json \
    --region $REGION > /dev/null

  # Créer ou mettre à jour le service
  SERVICE_EXISTS=$(aws ecs describe-services \
    --cluster rt-technologie-cluster \
    --services rt-$service-service \
    --region $REGION \
    --query 'services[0].status' \
    --output text 2>/dev/null || echo "")

  if [ "$SERVICE_EXISTS" = "ACTIVE" ]; then
    echo "    ℹ️  Mise à jour du service existant..."
    aws ecs update-service \
      --cluster rt-technologie-cluster \
      --service rt-$service-service \
      --task-definition rt-$service \
      --force-new-deployment \
      --region $REGION > /dev/null
  else
    echo "    → Création du nouveau service..."
    aws ecs create-service \
      --cluster rt-technologie-cluster \
      --service-name rt-$service-service \
      --task-definition rt-$service \
      --desired-count 1 \
      --launch-type FARGATE \
      --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_1,$SUBNET_2],securityGroups=[$SECURITY_GROUP_ID],assignPublicIp=ENABLED}" \
      --region $REGION > /dev/null
  fi

  echo "    ✓ Service $service déployé"
done

# Étape 9: Récupérer les IPs publiques
echo ""
echo "========================================="
echo "✅ DÉPLOIEMENT TERMINÉ"
echo "========================================="
echo ""
echo "🌐 Récupération des adresses IP publiques..."
sleep 10  # Attendre que les tâches démarrent

for service in "${!SERVICES[@]}"; do
  PORT="${SERVICES[$service]}"

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
        echo "  ✓ $service: http://$PUBLIC_IP:$PORT"
      else
        echo "  ⏳ $service: En attente d'IP publique..."
      fi
    fi
  else
    echo "  ⏳ $service: Tâche en cours de démarrage..."
  fi
done

echo ""
echo "📝 Pour récupérer les IPs plus tard, utilisez:"
echo "   ./infra/get-service-ips.sh"
echo ""
echo "========================================="
