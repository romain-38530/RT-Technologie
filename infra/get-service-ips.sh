#!/bin/bash
# =============================================================================
# Script pour récupérer les IPs publiques des services ECS
# =============================================================================

REGION="eu-central-1"
CLUSTER="rt-technologie-cluster"

declare -A SERVICES=(
  ["client-onboarding"]="3020"
  ["core-orders"]="3030"
  ["affret-ia"]="3010"
  ["vigilance"]="3040"
)

echo "========================================="
echo "🌐 Adresses IP des services RT-Technologie"
echo "========================================="
echo ""

for service in "${!SERVICES[@]}"; do
  PORT="${SERVICES[$service]}"

  TASK_ARN=$(aws ecs list-tasks \
    --cluster $CLUSTER \
    --service-name rt-$service-service \
    --region $REGION \
    --query 'taskArns[0]' \
    --output text 2>/dev/null || echo "")

  if [ -n "$TASK_ARN" ] && [ "$TASK_ARN" != "None" ]; then
    ENI_ID=$(aws ecs describe-tasks \
      --cluster $CLUSTER \
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
        echo "✓ $service: http://$PUBLIC_IP:$PORT"
      else
        echo "⏳ $service: Pas d'IP publique (service en démarrage)"
      fi
    fi
  else
    echo "❌ $service: Service non déployé ou arrêté"
  fi
done

echo ""
echo "========================================="
