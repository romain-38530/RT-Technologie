#!/bin/bash

# =============================================================================
# Script de Configuration Infrastructure AWS
# Service Client Onboarding - RT-Technologie
# =============================================================================

set -e

AWS_REGION="eu-west-1"
AWS_ACCOUNT_ID="YOUR_ACCOUNT_ID"  # À remplacer
CLUSTER_NAME="rt-production"
SERVICE_NAME="client-onboarding"
ECR_REPOSITORY="rt-client-onboarding"

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Configuration Infrastructure AWS${NC}"
echo -e "${BLUE}========================================${NC}"

# 1. Créer le repository ECR
echo -e "\n${YELLOW}1. Création du repository ECR...${NC}"
if aws ecr describe-repositories --repository-names $ECR_REPOSITORY --region $AWS_REGION 2>/dev/null; then
    echo -e "${GREEN}✅ Repository ECR existe déjà${NC}"
else
    aws ecr create-repository \
        --repository-name $ECR_REPOSITORY \
        --region $AWS_REGION \
        --image-scanning-configuration scanOnPush=true \
        --encryption-configuration encryptionType=AES256
    echo -e "${GREEN}✅ Repository ECR créé${NC}"
fi

# 2. Créer le cluster ECS
echo -e "\n${YELLOW}2. Création du cluster ECS...${NC}"
if aws ecs describe-clusters --clusters $CLUSTER_NAME --region $AWS_REGION --query 'clusters[0].status' --output text 2>/dev/null | grep -q ACTIVE; then
    echo -e "${GREEN}✅ Cluster ECS existe déjà${NC}"
else
    aws ecs create-cluster \
        --cluster-name $CLUSTER_NAME \
        --region $AWS_REGION \
        --capacity-providers FARGATE FARGATE_SPOT \
        --default-capacity-provider-strategy capacityProvider=FARGATE,weight=1
    echo -e "${GREEN}✅ Cluster ECS créé${NC}"
fi

# 3. Créer le groupe de logs CloudWatch
echo -e "\n${YELLOW}3. Création du groupe de logs CloudWatch...${NC}"
if aws logs describe-log-groups --log-group-name-prefix /ecs/rt-client-onboarding --region $AWS_REGION --query 'logGroups[0].logGroupName' --output text 2>/dev/null | grep -q rt-client-onboarding; then
    echo -e "${GREEN}✅ Groupe de logs existe déjà${NC}"
else
    aws logs create-log-group \
        --log-group-name /ecs/rt-client-onboarding \
        --region $AWS_REGION

    aws logs put-retention-policy \
        --log-group-name /ecs/rt-client-onboarding \
        --retention-in-days 7 \
        --region $AWS_REGION
    echo -e "${GREEN}✅ Groupe de logs créé${NC}"
fi

# 4. Créer les rôles IAM
echo -e "\n${YELLOW}4. Création des rôles IAM...${NC}"

# Rôle d'exécution ECS
cat > /tmp/ecs-task-execution-role-trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

if aws iam get-role --role-name ecsTaskExecutionRole 2>/dev/null; then
    echo -e "${GREEN}✅ Rôle ecsTaskExecutionRole existe déjà${NC}"
else
    aws iam create-role \
        --role-name ecsTaskExecutionRole \
        --assume-role-policy-document file:///tmp/ecs-task-execution-role-trust-policy.json

    aws iam attach-role-policy \
        --role-name ecsTaskExecutionRole \
        --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

    aws iam attach-role-policy \
        --role-name ecsTaskExecutionRole \
        --policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite

    echo -e "${GREEN}✅ Rôle ecsTaskExecutionRole créé${NC}"
fi

# Rôle de tâche ECS
if aws iam get-role --role-name ecsTaskRole 2>/dev/null; then
    echo -e "${GREEN}✅ Rôle ecsTaskRole existe déjà${NC}"
else
    aws iam create-role \
        --role-name ecsTaskRole \
        --assume-role-policy-document file:///tmp/ecs-task-execution-role-trust-policy.json

    echo -e "${GREEN}✅ Rôle ecsTaskRole créé${NC}"
fi

# 5. Créer le VPC et les sous-réseaux (si nécessaire)
echo -e "\n${YELLOW}5. Configuration réseau...${NC}"
echo -e "${BLUE}Note: Utilisez le VPC par défaut ou créez-en un nouveau${NC}"
echo -e "${BLUE}Assurez-vous d'avoir :${NC}"
echo -e "${BLUE}- Au moins 2 sous-réseaux publics dans différentes AZ${NC}"
echo -e "${BLUE}- Un groupe de sécurité autorisant le port 3020${NC}"

# 6. Créer le groupe de sécurité
echo -e "\n${YELLOW}6. Création du groupe de sécurité...${NC}"

# Récupérer le VPC par défaut
DEFAULT_VPC=$(aws ec2 describe-vpcs --filters "Name=isDefault,Values=true" --query 'Vpcs[0].VpcId' --output text --region $AWS_REGION)

if [ "$DEFAULT_VPC" == "None" ] || [ -z "$DEFAULT_VPC" ]; then
    echo -e "${RED}❌ Aucun VPC par défaut trouvé${NC}"
    echo -e "${YELLOW}Créez un VPC ou utilisez un VPC existant${NC}"
else
    echo -e "${GREEN}✅ VPC par défaut: $DEFAULT_VPC${NC}"

    # Créer le groupe de sécurité
    SG_NAME="rt-client-onboarding-sg"
    if aws ec2 describe-security-groups --filters "Name=group-name,Values=$SG_NAME" --region $AWS_REGION --query 'SecurityGroups[0].GroupId' --output text 2>/dev/null | grep -q sg-; then
        echo -e "${GREEN}✅ Groupe de sécurité existe déjà${NC}"
    else
        SG_ID=$(aws ec2 create-security-group \
            --group-name $SG_NAME \
            --description "Security group for RT Client Onboarding service" \
            --vpc-id $DEFAULT_VPC \
            --region $AWS_REGION \
            --query 'GroupId' \
            --output text)

        # Autoriser le port 3020
        aws ec2 authorize-security-group-ingress \
            --group-id $SG_ID \
            --protocol tcp \
            --port 3020 \
            --cidr 0.0.0.0/0 \
            --region $AWS_REGION

        # Autoriser tout le trafic sortant (déjà autorisé par défaut)

        echo -e "${GREEN}✅ Groupe de sécurité créé: $SG_ID${NC}"
    fi
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Infrastructure AWS configurée${NC}"
echo -e "${GREEN}========================================${NC}"

echo -e "\n${BLUE}Prochaines étapes :${NC}"
echo -e "1. Configurez les secrets avec: ${YELLOW}./scripts/setup-aws-secrets.sh${NC}"
echo -e "2. Mettez à jour YOUR_ACCOUNT_ID dans les scripts"
echo -e "3. Déployez avec: ${YELLOW}./scripts/deploy-aws-ecs.sh${NC}"

echo -e "\n${BLUE}Informations importantes :${NC}"
echo -e "AWS Region: ${YELLOW}$AWS_REGION${NC}"
echo -e "ECR Repository: ${YELLOW}$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY${NC}"
echo -e "ECS Cluster: ${YELLOW}$CLUSTER_NAME${NC}"
echo -e "CloudWatch Logs: ${YELLOW}/ecs/rt-client-onboarding${NC}"
