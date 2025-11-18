#!/bin/bash

# =============================================================================
# Script de Déploiement AWS ECS Fargate
# Service Client Onboarding - RT-Technologie
# =============================================================================

set -e

# Configuration
AWS_REGION="eu-west-1"
AWS_ACCOUNT_ID="004843574253"
ECR_REPOSITORY="rt-client-onboarding"
ECS_CLUSTER="rt-production"
ECS_SERVICE="client-onboarding"
TASK_FAMILY="rt-client-onboarding"

# Couleurs pour les logs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Déploiement AWS ECS Fargate${NC}"
echo -e "${BLUE}Service: Client Onboarding${NC}"
echo -e "${BLUE}========================================${NC}"

# Vérifier les prérequis
echo -e "\n${YELLOW}1. Vérification des prérequis...${NC}"
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI n'est pas installé${NC}"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé${NC}"
    exit 1
fi

echo -e "${GREEN}✅ AWS CLI et Docker sont installés${NC}"

# Se déplacer dans le dossier du service
cd "$(dirname "$0")/../services/client-onboarding"

# Build de l'image Docker
echo -e "\n${YELLOW}2. Construction de l'image Docker...${NC}"
docker build -t $ECR_REPOSITORY:latest .
echo -e "${GREEN}✅ Image Docker construite${NC}"

# Connexion à ECR
echo -e "\n${YELLOW}3. Connexion à Amazon ECR...${NC}"
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
echo -e "${GREEN}✅ Connecté à ECR${NC}"

# Tag de l'image
echo -e "\n${YELLOW}4. Tag de l'image...${NC}"
docker tag $ECR_REPOSITORY:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest
docker tag $ECR_REPOSITORY:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:$(date +%Y%m%d-%H%M%S)
echo -e "${GREEN}✅ Image taggée${NC}"

# Push vers ECR
echo -e "\n${YELLOW}5. Push vers ECR...${NC}"
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:$(date +%Y%m%d-%H%M%S)
echo -e "${GREEN}✅ Image poussée vers ECR${NC}"

# Enregistrer la nouvelle task definition
echo -e "\n${YELLOW}6. Enregistrement de la task definition...${NC}"
cd ../../infra/aws
TASK_DEFINITION=$(aws ecs register-task-definition \
    --cli-input-json file://ecs-task-definition.json \
    --region $AWS_REGION \
    --query 'taskDefinition.taskDefinitionArn' \
    --output text)
echo -e "${GREEN}✅ Task definition enregistrée: $TASK_DEFINITION${NC}"

# Mise à jour du service ECS
echo -e "\n${YELLOW}7. Mise à jour du service ECS...${NC}"
aws ecs update-service \
    --cluster $ECS_CLUSTER \
    --service $ECS_SERVICE \
    --task-definition $TASK_FAMILY \
    --force-new-deployment \
    --region $AWS_REGION \
    --output table

echo -e "${GREEN}✅ Service ECS mis à jour${NC}"

# Attendre que le déploiement se termine
echo -e "\n${YELLOW}8. Attente de la fin du déploiement...${NC}"
aws ecs wait services-stable \
    --cluster $ECS_CLUSTER \
    --services $ECS_SERVICE \
    --region $AWS_REGION

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Déploiement terminé avec succès !${NC}"
echo -e "${GREEN}========================================${NC}"

# Afficher les informations du service
echo -e "\n${BLUE}Informations du service :${NC}"
aws ecs describe-services \
    --cluster $ECS_CLUSTER \
    --services $ECS_SERVICE \
    --region $AWS_REGION \
    --query 'services[0].[serviceName,status,runningCount,desiredCount]' \
    --output table

echo -e "\n${BLUE}Pour voir les logs :${NC}"
echo -e "aws logs tail /ecs/rt-client-onboarding --follow --region $AWS_REGION"
