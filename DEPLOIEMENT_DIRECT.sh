#!/bin/bash
#═══════════════════════════════════════════════════════════════════════════════
# DÉPLOIEMENT DIRECT AWS ECS - Script simplifié
#═══════════════════════════════════════════════════════════════════════════════

set -e

REGION="eu-central-1"
ACCOUNT_ID="004843574253"
INSTANCE_ID="i-0ece63fb077366323"
CLUSTER="rt-production"

echo "════════════════════════════════════════════════════════════════"
echo "🚀 DÉPLOIEMENT DIRECT RT-TECHNOLOGIE"
echo "════════════════════════════════════════════════════════════════"
echo ""

# ÉTAPE 1 : Build et Push des Images
echo "📦 ÉTAPE 1/3 : Build et Push des Images Docker"
echo "────────────────────────────────────────────────────────────────"
echo ""

# Envoyer et exécuter
echo "Envoi du script sur l'instance EC2..."
CMD_ID=$(aws ssm send-command \
  --instance-ids $INSTANCE_ID \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "set -e",
    "REGION=eu-central-1",
    "ACCOUNT_ID=004843574253",
    "echo Login ECR...",
    "aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com",
    "cd /home/ec2-user/RT-Technologie",
    "echo Build et Push des 11 services...",
    "for SERVICE in tms-sync erp-sync palette tracking-ia planning notifications admin-gateway authz training geo-tracking storage-market; do",
    "  echo Service: $SERVICE",
    "  docker build -t rt-$SERVICE:latest -f services/$SERVICE/Dockerfile .",
    "  docker tag rt-$SERVICE:latest ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/rt-${SERVICE}:latest",
    "  docker push ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/rt-${SERVICE}:latest",
    "  echo OK: $SERVICE",
    "done",
    "echo Build termine"
  ]' \
  --region $REGION \
  --timeout-seconds 1800 \
  --output text \
  --query 'Command.CommandId')

echo "Command ID: $CMD_ID"
echo "⏳ Attente du build (10-15 minutes)..."
echo ""

# Attendre
while true; do
  STATUS=$(aws ssm get-command-invocation \
    --command-id $CMD_ID \
    --instance-id $INSTANCE_ID \
    --region $REGION \
    --query 'Status' \
    --output text 2>/dev/null || echo "Pending")

  if [ "$STATUS" = "Success" ]; then
    echo "✅ Build terminé avec succès"
    break
  elif [ "$STATUS" = "Failed" ]; then
    echo "❌ Build échoué"
    aws ssm get-command-invocation \
      --command-id $CMD_ID \
      --instance-id $INSTANCE_ID \
      --region $REGION \
      --query 'StandardErrorContent' \
      --output text
    exit 1
  fi

  echo "Status: $STATUS"
  sleep 30
done

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "🚀 ÉTAPE 2/3 : Déploiement sur ECS"
echo "════════════════════════════════════════════════════════════════"
echo ""

SERVICES=(tms-sync erp-sync palette tracking-ia planning notifications admin-gateway authz training geo-tracking storage-market)

for SERVICE in "${SERVICES[@]}"; do
  echo "▶️  rt-$SERVICE"

  # Vérifier si existe
  SERVICE_EXISTS=$(aws ecs describe-services \
    --cluster $CLUSTER \
    --services rt-$SERVICE \
    --region $REGION \
    --query 'services[0].serviceName' \
    --output text 2>/dev/null || echo "None")

  if [ "$SERVICE_EXISTS" = "rt-$SERVICE" ]; then
    aws ecs update-service \
      --cluster $CLUSTER \
      --service rt-$SERVICE \
      --force-new-deployment \
      --region $REGION \
      --no-cli-pager > /dev/null
  else
    aws ecs create-service \
      --cluster $CLUSTER \
      --service-name rt-$SERVICE \
      --task-definition rt-$SERVICE \
      --desired-count 1 \
      --launch-type FARGATE \
      --region $REGION \
      --no-cli-pager > /dev/null
  fi

  echo "✅ rt-$SERVICE déployé"
done

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "🌐 ÉTAPE 3/3 : IPs Publiques"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "⏳ Attente 60s..."
sleep 60

for SERVICE in "${SERVICES[@]}"; do
  TASK_ARN=$(aws ecs list-tasks \
    --cluster $CLUSTER \
    --service-name rt-$SERVICE \
    --region $REGION \
    --query 'taskArns[0]' \
    --output text 2>/dev/null || echo "None")

  if [ "$TASK_ARN" != "None" ]; then
    ENI_ID=$(aws ecs describe-tasks \
      --cluster $CLUSTER \
      --tasks $TASK_ARN \
      --region $REGION \
      --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' \
      --output text 2>/dev/null)

    if [ ! -z "$ENI_ID" ]; then
      PUBLIC_IP=$(aws ec2 describe-network-interfaces \
        --network-interface-ids $ENI_ID \
        --region $REGION \
        --query 'NetworkInterfaces[0].Association.PublicIp' \
        --output text 2>/dev/null || echo "Pending")

      echo "• rt-$SERVICE: http://$PUBLIC_IP:3000"
    fi
  fi
done

echo ""
echo "✅ DÉPLOIEMENT TERMINÉ"
