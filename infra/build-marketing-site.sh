#!/bin/bash
# =============================================================================
# Build et déploiement du frontend marketing-site sur AWS ECS
# À exécuter dans AWS CloudShell
# =============================================================================

set -e

SERVICE="marketing-site"
PORT="3000"
REGION="eu-central-1"
ACCOUNT_ID="004843574253"
CLUSTER="rt-technologie-cluster"
EXECUTION_ROLE="arn:aws:iam::004843574253:role/ecsTaskExecutionRole"
SUBNET_1="subnet-0cce60a3fe31c0d9e"
SUBNET_2="subnet-0a6a2f8fd776906ee"
SG="sg-0add3ac473775825a"

# URL du backend pour les variables d'environnement
CLIENT_ONBOARDING_URL="http://3.72.37.6:3020"

echo "========================================="
echo "🏗️  Build et déploiement: rt-${SERVICE}"
echo "========================================="
echo ""

# Étape 1: Login ECR
echo "⏳ Authentification ECR..."
aws ecr get-login-password --region ${REGION} | docker login --username AWS --password-stdin ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com
echo "✅ Authentifié"
echo ""

# Étape 2: Build de l'image Docker
echo "⏳ Build de l'image Docker..."
echo "   Cela peut prendre 5-10 minutes..."
docker build -t rt-${SERVICE}:latest -f apps/${SERVICE}/Dockerfile .

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du build"
    exit 1
fi
echo "✅ Image buildée"
echo ""

# Étape 3: Tag de l'image
echo "⏳ Tag de l'image pour ECR..."
docker tag rt-${SERVICE}:latest ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/rt-${SERVICE}:latest
echo "✅ Image taguée"
echo ""

# Étape 4: Push vers ECR
echo "⏳ Push vers ECR..."
docker push ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/rt-${SERVICE}:latest

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du push"
    exit 1
fi
echo "✅ Image pushée vers ECR"
echo ""

# Étape 5: Créer la task definition
echo "⏳ Création de la task definition ECS..."
aws ecs register-task-definition \
    --family "rt-${SERVICE}" \
    --network-mode awsvpc \
    --requires-compatibilities FARGATE \
    --cpu 256 \
    --memory 512 \
    --execution-role-arn "${EXECUTION_ROLE}" \
    --container-definitions "[{\"name\":\"rt-${SERVICE}\",\"image\":\"${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/rt-${SERVICE}:latest\",\"portMappings\":[{\"containerPort\":${PORT},\"protocol\":\"tcp\"}],\"essential\":true,\"environment\":[{\"name\":\"NODE_ENV\",\"value\":\"production\"},{\"name\":\"PORT\",\"value\":\"${PORT}\"},{\"name\":\"NEXT_PUBLIC_API_URL\",\"value\":\"${CLIENT_ONBOARDING_URL}\"}],\"logConfiguration\":{\"logDriver\":\"awslogs\",\"options\":{\"awslogs-group\":\"/ecs/rt-${SERVICE}\",\"awslogs-region\":\"${REGION}\",\"awslogs-stream-prefix\":\"ecs\",\"awslogs-create-group\":\"true\"}}}]" \
    --region ${REGION} > /dev/null

echo "✅ Task definition créée"
echo ""

# Étape 6: Vérifier si le service existe
echo "⏳ Vérification du service existant..."
SERVICE_EXISTS=$(aws ecs describe-services \
    --cluster ${CLUSTER} \
    --services "rt-${SERVICE}-service" \
    --region ${REGION} \
    --query 'services[0].status' \
    --output text 2>/dev/null || echo "NONE")

if [ "$SERVICE_EXISTS" == "ACTIVE" ]; then
    echo "ℹ️  Service existe - mise à jour..."
    aws ecs update-service \
        --cluster ${CLUSTER} \
        --service "rt-${SERVICE}-service" \
        --task-definition "rt-${SERVICE}" \
        --force-new-deployment \
        --region ${REGION} > /dev/null
    echo "✅ Service mis à jour"
else
    # Étape 7: Créer le service
    echo "⏳ Création du service ECS..."
    aws ecs create-service \
        --cluster ${CLUSTER} \
        --service-name "rt-${SERVICE}-service" \
        --task-definition "rt-${SERVICE}" \
        --desired-count 1 \
        --launch-type FARGATE \
        --network-configuration "awsvpcConfiguration={subnets=[${SUBNET_1},${SUBNET_2}],securityGroups=[${SG}],assignPublicIp=ENABLED}" \
        --region ${REGION} > /dev/null

    echo "✅ Service créé"
fi

echo ""
echo "========================================="
echo "✅ DÉPLOIEMENT TERMINÉ"
echo "========================================="
echo ""
echo "⏳ Attente du démarrage (60s)..."
sleep 60

# Récupérer l'IP
echo ""
echo "🔍 Récupération de l'IP publique..."
TASK_ARN=$(aws ecs list-tasks --cluster ${CLUSTER} --service-name rt-${SERVICE}-service --region ${REGION} --query 'taskArns[0]' --output text)

if [ -n "$TASK_ARN" ] && [ "$TASK_ARN" != "None" ]; then
    ENI_ID=$(aws ecs describe-tasks --cluster ${CLUSTER} --tasks $TASK_ARN --region ${REGION} --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' --output text)

    if [ -n "$ENI_ID" ]; then
        PUBLIC_IP=$(aws ec2 describe-network-interfaces --network-interface-ids $ENI_ID --region ${REGION} --query 'NetworkInterfaces[0].Association.PublicIp' --output text)

        if [ -n "$PUBLIC_IP" ] && [ "$PUBLIC_IP" != "None" ]; then
            echo ""
            echo "✅ Service rt-${SERVICE} déployé!"
            echo "   🌐 URL: http://${PUBLIC_IP}:${PORT}"
            echo ""
        else
            echo "⏳ IP en cours d'attribution - réessayez dans 1-2 minutes"
        fi
    fi
else
    echo "⏳ Tâche en cours de démarrage - réessayez dans 1-2 minutes"
fi

echo ""
