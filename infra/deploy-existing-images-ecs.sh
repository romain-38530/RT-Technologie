#!/bin/bash
# =============================================================================
# Script de déploiement rapide - Services ECS depuis images ECR existantes
# À exécuter dans AWS CloudShell
# =============================================================================

set -e

# Configuration
REGION="eu-central-1"
ACCOUNT_ID="004843574253"
CLUSTER_NAME="rt-technologie-cluster"
EXECUTION_ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/ecsTaskExecutionRole"

# VPC Configuration (récupérée de vos ressources existantes)
VPC_ID="vpc-0d84de1ac867982db"
SECURITY_GROUP_ID="sg-0add3ac473775825a"
SUBNET_1="subnet-0cce60a3fe31c0d9e"
SUBNET_2="subnet-0a6a2f8fd776906ee"

# Services avec images disponibles (13 services)
declare -A SERVICES=(
    ["client-onboarding"]="3020"
    ["tms-sync"]="3050"
    ["authz"]="3060"
    ["tracking-ia"]="3070"
    ["notifications"]="3080"
    ["training"]="3090"
    ["palette"]="3100"
    ["planning"]="3110"
    ["geo-tracking"]="3120"
    ["storage-market"]="3130"
    ["erp-sync"]="3140"
    ["admin-gateway"]="3150"
)

echo "========================================="
echo "🚀 Déploiement ECS - Images existantes"
echo "========================================="
echo "Région: $REGION"
echo "Cluster: $CLUSTER_NAME"
echo "Services: ${#SERVICES[@]}"
echo ""

# Fonction pour créer un service ECS
deploy_service() {
    local service_name=$1
    local port=$2
    local full_name="rt-${service_name}"

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📦 Déploiement: $full_name (port $port)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # 1. Créer la task definition
    echo "  ⏳ Création de la task definition..."

    cat > /tmp/${full_name}-task.json <<EOF
{
  "family": "${full_name}",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "${EXECUTION_ROLE_ARN}",
  "containerDefinitions": [
    {
      "name": "${full_name}",
      "image": "${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${full_name}:latest",
      "portMappings": [
        {
          "containerPort": ${port},
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "${port}"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/${full_name}",
          "awslogs-region": "${REGION}",
          "awslogs-stream-prefix": "ecs",
          "awslogs-create-group": "true"
        }
      }
    }
  ]
}
EOF

    # Enregistrer la task definition
    TASK_DEF_ARN=$(aws ecs register-task-definition \
        --cli-input-json file:///tmp/${full_name}-task.json \
        --region ${REGION} \
        --query 'taskDefinition.taskDefinitionArn' \
        --output text 2>&1)

    if [ $? -ne 0 ]; then
        echo "  ❌ Erreur lors de la création de la task definition"
        echo "  $TASK_DEF_ARN"
        return 1
    fi

    echo "  ✅ Task definition créée: ${TASK_DEF_ARN}"

    # 2. Vérifier si le service existe déjà
    echo "  ⏳ Vérification du service existant..."
    SERVICE_EXISTS=$(aws ecs describe-services \
        --cluster ${CLUSTER_NAME} \
        --services ${full_name}-service \
        --region ${REGION} \
        --query 'services[0].status' \
        --output text 2>/dev/null)

    if [ "$SERVICE_EXISTS" == "ACTIVE" ]; then
        echo "  ℹ️  Service existe - mise à jour..."
        aws ecs update-service \
            --cluster ${CLUSTER_NAME} \
            --service ${full_name}-service \
            --task-definition ${full_name} \
            --force-new-deployment \
            --region ${REGION} \
            --output text > /dev/null
        echo "  ✅ Service mis à jour"
    else
        # 3. Créer le service
        echo "  ⏳ Création du service ECS..."
        aws ecs create-service \
            --cluster ${CLUSTER_NAME} \
            --service-name ${full_name}-service \
            --task-definition ${full_name} \
            --desired-count 1 \
            --launch-type FARGATE \
            --network-configuration "awsvpcConfiguration={
                subnets=[${SUBNET_1},${SUBNET_2}],
                securityGroups=[${SECURITY_GROUP_ID}],
                assignPublicIp=ENABLED
            }" \
            --region ${REGION} \
            --output text > /dev/null

        if [ $? -eq 0 ]; then
            echo "  ✅ Service créé avec succès"
        else
            echo "  ❌ Erreur lors de la création du service"
            return 1
        fi
    fi

    # Attendre quelques secondes pour stabilisation
    sleep 3

    echo "  ✅ $full_name déployé!"
    echo ""
}

# Déployer tous les services
echo "🚀 Démarrage du déploiement des services..."
echo ""

DEPLOYED=0
FAILED=0

for service in "${!SERVICES[@]}"; do
    port="${SERVICES[$service]}"

    if deploy_service "$service" "$port"; then
        ((DEPLOYED++))
    else
        ((FAILED++))
        echo "  ⚠️  Échec du déploiement de $service - continuation..."
    fi
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
    echo "🔍 Vérification de l'état des services..."
    echo ""

    for service in "${!SERVICES[@]}"; do
        full_name="rt-${service}"
        port="${SERVICES[$service]}"

        # Récupérer l'IP publique
        TASK_ARN=$(aws ecs list-tasks \
            --cluster ${CLUSTER_NAME} \
            --service-name ${full_name}-service \
            --region ${REGION} \
            --query 'taskArns[0]' \
            --output text 2>/dev/null)

        if [ -n "$TASK_ARN" ] && [ "$TASK_ARN" != "None" ]; then
            ENI_ID=$(aws ecs describe-tasks \
                --cluster ${CLUSTER_NAME} \
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
                    echo "  ✅ $full_name → http://${PUBLIC_IP}:${port}"
                else
                    echo "  ⏳ $full_name → En attente d'IP..."
                fi
            fi
        else
            echo "  ⏳ $full_name → Tâche en cours de démarrage..."
        fi
    done
fi

echo ""
echo "========================================="
echo "✅ DÉPLOIEMENT TERMINÉ"
echo "========================================="
echo ""
echo "📌 PROCHAINES ÉTAPES:"
echo ""
echo "1. Attendre 2-3 minutes que tous les services démarrent"
echo "2. Récupérer les IPs avec: ./infra/get-ecs-ips-cloudshell.sh"
echo "3. Configurer les variables Vercel avec les IPs"
echo ""
echo "Pour surveiller les services:"
echo "  aws ecs list-services --cluster ${CLUSTER_NAME} --region ${REGION}"
echo ""
