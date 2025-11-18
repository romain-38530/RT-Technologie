#!/bin/bash

# =============================================================================
# Script de Configuration des Secrets AWS Secrets Manager
# Service Client Onboarding - RT-Technologie
# =============================================================================

set -e

AWS_REGION="eu-west-1"

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Configuration AWS Secrets Manager${NC}"
echo -e "${BLUE}========================================${NC}"

# Charger les variables depuis .env.production
if [ ! -f "services/client-onboarding/.env.production" ]; then
    echo -e "${RED}❌ Fichier .env.production introuvable${NC}"
    exit 1
fi

source services/client-onboarding/.env.production

# Fonction pour créer un secret
create_secret() {
    local secret_name=$1
    local secret_value=$2

    echo -e "\n${YELLOW}Création du secret: $secret_name${NC}"

    # Vérifier si le secret existe déjà
    if aws secretsmanager describe-secret --secret-id "$secret_name" --region $AWS_REGION 2>/dev/null; then
        echo -e "${YELLOW}Secret existe déjà, mise à jour...${NC}"
        aws secretsmanager update-secret \
            --secret-id "$secret_name" \
            --secret-string "$secret_value" \
            --region $AWS_REGION
    else
        echo -e "${YELLOW}Création du nouveau secret...${NC}"
        aws secretsmanager create-secret \
            --name "$secret_name" \
            --secret-string "$secret_value" \
            --region $AWS_REGION
    fi

    echo -e "${GREEN}✅ Secret $secret_name configuré${NC}"
}

# Créer tous les secrets
echo -e "\n${YELLOW}Création des secrets...${NC}"

create_secret "rt/client-onboarding/mongodb-uri" "$MONGODB_URI"
create_secret "rt/client-onboarding/jwt-secret" "$JWT_SECRET"
create_secret "rt/client-onboarding/internal-token" "$INTERNAL_SERVICE_TOKEN"
create_secret "rt/client-onboarding/session-secret" "$SESSION_SECRET"
create_secret "rt/client-onboarding/smtp-host" "$SMTP_HOST"
create_secret "rt/client-onboarding/smtp-port" "$SMTP_PORT"
create_secret "rt/client-onboarding/smtp-user" "$SMTP_USER"
create_secret "rt/client-onboarding/smtp-password" "$SMTP_PASSWORD"

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Tous les secrets ont été créés${NC}"
echo -e "${GREEN}========================================${NC}"

# Afficher les ARNs
echo -e "\n${BLUE}ARNs des secrets créés :${NC}"
aws secretsmanager list-secrets \
    --filter Key=name,Values=rt/client-onboarding/ \
    --region $AWS_REGION \
    --query 'SecretList[*].[Name,ARN]' \
    --output table

echo -e "\n${YELLOW}Note: Mettez à jour les ARNs dans infra/aws/ecs-task-definition.json${NC}"
