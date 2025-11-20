#!/bin/bash
# =============================================================================
# Déploiement des frontends marketing-site et web-forwarder sur AWS ECS
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

# URLs des backends
CLIENT_ONBOARDING_URL="http://3.72.37.6:3020"
AFFRET_IA_URL="http://3.75.218.131:3010"

echo "========================================="
echo "🚀 Déploiement des frontends sur AWS ECS"
echo "========================================="
echo ""
echo "📦 Applications:"
echo "   - marketing-site (Next.js)"
echo "   - web-forwarder (Next.js)"
echo ""

# Fonction pour déployer un frontend
deploy_frontend() {
    local SERVICE=$1
    local PORT=$2
    local ENV_VAR_NAME=$3
    local ENV_VAR_VALUE=$4

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🌐 Déploiement: rt-${SERVICE}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # 1. Créer le repository ECR s'il n'existe pas
    echo "  ⏳ Vérification du repository ECR..."
    aws ecr describe-repositories --repository-names "rt-${SERVICE}" --region ${REGION} >/dev/null 2>&1 || \
        aws ecr create-repository --repository-name "rt-${SERVICE}" --region ${REGION} >/dev/null
    echo "  ✅ Repository ECR prêt"

    # 2. Login ECR
    echo "  ⏳ Authentification ECR..."
    aws ecr get-login-password --region ${REGION} | docker login --username AWS --password-stdin ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com >/dev/null 2>&1
    echo "  ✅ Authentifié"

    # 3. Build Docker
    echo "  ⏳ Build de l'image Docker (5-10 min)..."
    docker build -t rt-${SERVICE}:latest -f apps/${SERVICE}/Dockerfile . 2>&1 | grep -E "(Step|Successfully)" || true

    if [ ${PIPESTATUS[0]} -ne 0 ]; then
        echo "  ❌ Erreur lors du build"
        return 1
    fi
    echo "  ✅ Image buildée"

    # 4. Tag et Push
    echo "  ⏳ Push vers ECR..."
    docker tag rt-${SERVICE}:latest ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/rt-${SERVICE}:latest
    docker push ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/rt-${SERVICE}:latest >/dev/null 2>&1
    echo "  ✅ Image pushée"

    # 5. Task definition
    echo "  ⏳ Création de la task definition..."
    aws ecs register-task-definition \
        --family "rt-${SERVICE}" \
        --network-mode awsvpc \
        --requires-compatibilities FARGATE \
        --cpu 256 \
        --memory 512 \
        --execution-role-arn "${EXECUTION_ROLE}" \
        --container-definitions "[{\"name\":\"rt-${SERVICE}\",\"image\":\"${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/rt-${SERVICE}:latest\",\"portMappings\":[{\"containerPort\":${PORT},\"protocol\":\"tcp\"}],\"essential\":true,\"environment\":[{\"name\":\"NODE_ENV\",\"value\":\"production\"},{\"name\":\"PORT\",\"value\":\"${PORT}\"},{\"name\":\"${ENV_VAR_NAME}\",\"value\":\"${ENV_VAR_VALUE}\"}],\"logConfiguration\":{\"logDriver\":\"awslogs\",\"options\":{\"awslogs-group\":\"/ecs/rt-${SERVICE}\",\"awslogs-region\":\"${REGION}\",\"awslogs-stream-prefix\":\"ecs\",\"awslogs-create-group\":\"true\"}}}]" \
        --region ${REGION} >/dev/null
    echo "  ✅ Task definition créée"

    # 6. Créer ou mettre à jour le service
    echo "  ⏳ Vérification du service..."
    SERVICE_EXISTS=$(aws ecs describe-services \
        --cluster ${CLUSTER} \
        --services "rt-${SERVICE}-service" \
        --region ${REGION} \
        --query 'services[0].status' \
        --output text 2>/dev/null || echo "NONE")

    if [ "$SERVICE_EXISTS" == "ACTIVE" ]; then
        echo "  ℹ️  Service existe - mise à jour..."
        aws ecs update-service \
            --cluster ${CLUSTER} \
            --service "rt-${SERVICE}-service" \
            --task-definition "rt-${SERVICE}" \
            --force-new-deployment \
            --region ${REGION} >/dev/null
        echo "  ✅ Service mis à jour"
    else
        echo "  ⏳ Création du service..."
        aws ecs create-service \
            --cluster ${CLUSTER} \
            --service-name "rt-${SERVICE}-service" \
            --task-definition "rt-${SERVICE}" \
            --desired-count 1 \
            --launch-type FARGATE \
            --network-configuration "awsvpcConfiguration={subnets=[${SUBNET_1},${SUBNET_2}],securityGroups=[${SG}],assignPublicIp=ENABLED}" \
            --region ${REGION} >/dev/null
        echo "  ✅ Service créé"
    fi

    echo "  ✅ rt-${SERVICE} déployé!"
    echo ""
}

# Déployer les deux frontends
deploy_frontend "marketing-site" "3000" "NEXT_PUBLIC_API_URL" "${CLIENT_ONBOARDING_URL}"
deploy_frontend "web-forwarder" "3000" "NEXT_PUBLIC_AFFRET_IA_URL" "${AFFRET_IA_URL}"

echo "========================================="
echo "✅ DÉPLOIEMENT TERMINÉ"
echo "========================================="
echo ""
echo "⏳ Attente de la stabilisation (60s)..."
sleep 60

# Récupérer les IPs
echo ""
echo "🔍 Récupération des IPs publiques..."
echo ""

for SERVICE in "marketing-site" "web-forwarder"; do
    echo "📡 Service: rt-${SERVICE}"

    TASK_ARN=$(aws ecs list-tasks \
        --cluster ${CLUSTER} \
        --service-name "rt-${SERVICE}-service" \
        --region ${REGION} \
        --query 'taskArns[0]' \
        --output text 2>/dev/null)

    if [ -n "$TASK_ARN" ] && [ "$TASK_ARN" != "None" ]; then
        ENI_ID=$(aws ecs describe-tasks \
            --cluster ${CLUSTER} \
            --tasks $TASK_ARN \
            --region ${REGION} \
            --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' \
            --output text 2>/dev/null)

        if [ -n "$ENI_ID" ]; then
            PUBLIC_IP=$(aws ec2 describe-network-interfaces \
                --network-interface-ids $ENI_ID \
                --region ${REGION} \
                --query 'NetworkInterfaces[0].Association.PublicIp' \
                --output text 2>/dev/null)

            if [ -n "$PUBLIC_IP" ] && [ "$PUBLIC_IP" != "None" ]; then
                echo "   ✅ IP: $PUBLIC_IP"
                echo "   🌐 URL: http://$PUBLIC_IP:3000"
            else
                echo "   ⏳ IP en cours d'attribution"
            fi
        fi
    else
        echo "   ⏳ Tâche en cours de démarrage"
    fi
    echo ""
done

echo "========================================="
echo "📋 PROCHAINES ÉTAPES"
echo "========================================="
echo ""
echo "✅ Les deux frontends sont déployés sur AWS ECS"
echo "✅ Plus besoin de Vercel pour ces applications"
echo ""
echo "🔧 Pour vérifier l'état:"
echo "   aws ecs list-services --cluster ${CLUSTER} --region ${REGION}"
echo ""
echo "📊 Pour voir les logs:"
echo "   aws logs tail /ecs/rt-marketing-site --follow --region ${REGION}"
echo "   aws logs tail /ecs/rt-web-forwarder --follow --region ${REGION}"
echo ""
