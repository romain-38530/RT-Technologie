#!/bin/bash
# =============================================================================
# Script de déploiement simple - Tous les services un par un
# À exécuter dans AWS CloudShell
# =============================================================================

set -e

REGION="eu-central-1"
ACCOUNT_ID="004843574253"
CLUSTER="rt-technologie-cluster"
EXECUTION_ROLE="arn:aws:iam::004843574253:role/ecsTaskExecutionRole"
SUBNET_1="subnet-0cce60a3fe31c0d9e"
SUBNET_2="subnet-0a6a2f8fd776906ee"
SG="sg-0add3ac473775825a"

# Liste des services à déployer (avec images disponibles)
SERVICES=(
    "client-onboarding:3020"
    "tms-sync:3050"
    "authz:3060"
    "tracking-ia:3070"
    "notifications:3080"
    "training:3090"
    "palette:3100"
    "planning:3110"
    "geo-tracking:3120"
    "storage-market:3130"
    "erp-sync:3140"
    "admin-gateway:3150"
)

echo "========================================="
echo "🚀 Déploiement de ${#SERVICES[@]} services ECS"
echo "========================================="
echo ""

DEPLOYED=0
FAILED=0

for SERVICE_PORT in "${SERVICES[@]}"; do
    SERVICE="${SERVICE_PORT%:*}"
    PORT="${SERVICE_PORT#*:}"

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📦 Déploiement: rt-${SERVICE} (port ${PORT})"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Vérifier si le service existe déjà
    SERVICE_EXISTS=$(aws ecs describe-services \
        --cluster ${CLUSTER} \
        --services "rt-${SERVICE}-service" \
        --region ${REGION} \
        --query 'services[0].status' \
        --output text 2>/dev/null || echo "NONE")

    if [ "$SERVICE_EXISTS" == "ACTIVE" ]; then
        echo "  ℹ️  Service existe déjà - ignoré"
        ((DEPLOYED++))
        echo ""
        continue
    fi

    # Créer la task definition
    echo "  ⏳ Création de la task definition..."
    TASK_ARN=$(aws ecs register-task-definition \
        --family "rt-${SERVICE}" \
        --network-mode awsvpc \
        --requires-compatibilities FARGATE \
        --cpu 256 \
        --memory 512 \
        --execution-role-arn "${EXECUTION_ROLE}" \
        --container-definitions "[{\"name\":\"rt-${SERVICE}\",\"image\":\"${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/rt-${SERVICE}:latest\",\"portMappings\":[{\"containerPort\":${PORT},\"protocol\":\"tcp\"}],\"essential\":true,\"environment\":[{\"name\":\"NODE_ENV\",\"value\":\"production\"},{\"name\":\"PORT\",\"value\":\"${PORT}\"}],\"logConfiguration\":{\"logDriver\":\"awslogs\",\"options\":{\"awslogs-group\":\"/ecs/rt-${SERVICE}\",\"awslogs-region\":\"${REGION}\",\"awslogs-stream-prefix\":\"ecs\",\"awslogs-create-group\":\"true\"}}}]" \
        --region ${REGION} \
        --query 'taskDefinition.taskDefinitionArn' \
        --output text 2>&1)

    if [ $? -ne 0 ]; then
        echo "  ❌ Erreur lors de la création de la task definition"
        echo "  $TASK_ARN"
        ((FAILED++))
        echo ""
        continue
    fi

    echo "  ✅ Task definition créée"

    # Créer le service
    echo "  ⏳ Création du service ECS..."
    CREATE_OUTPUT=$(aws ecs create-service \
        --cluster ${CLUSTER} \
        --service-name "rt-${SERVICE}-service" \
        --task-definition "rt-${SERVICE}" \
        --desired-count 1 \
        --launch-type FARGATE \
        --network-configuration "awsvpcConfiguration={subnets=[${SUBNET_1},${SUBNET_2}],securityGroups=[${SG}],assignPublicIp=ENABLED}" \
        --region ${REGION} 2>&1)

    if [ $? -eq 0 ]; then
        echo "  ✅ Service créé avec succès"
        ((DEPLOYED++))
    else
        echo "  ❌ Erreur lors de la création du service"
        echo "  $CREATE_OUTPUT"
        ((FAILED++))
    fi

    echo ""
    sleep 2
done

echo "========================================="
echo "📊 RÉSUMÉ DU DÉPLOIEMENT"
echo "========================================="
echo "✅ Services déployés: $DEPLOYED"
echo "❌ Échecs: $FAILED"
echo ""

if [ $DEPLOYED -gt 0 ]; then
    echo "⏳ Attente de la stabilisation des services (30s)..."
    sleep 30

    echo ""
    echo "🔍 Liste des services actifs:"
    aws ecs list-services --cluster ${CLUSTER} --region ${REGION} \
        --query 'serviceArns[*]' --output text | tr '\t' '\n' | sed 's|.*/||'
fi

echo ""
echo "========================================="
echo "✅ DÉPLOIEMENT TERMINÉ"
echo "========================================="
echo ""
echo "📌 PROCHAINES ÉTAPES:"
echo ""
echo "1. Vérifier les services:"
echo "   aws ecs list-services --cluster ${CLUSTER} --region ${REGION}"
echo ""
echo "2. Récupérer les IPs:"
echo "   ./infra/get-ecs-ips-cloudshell.sh"
echo ""
