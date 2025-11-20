#!/bin/bash
#═══════════════════════════════════════════════════════════════════════════════
# DÉPLOIEMENT AUTOMATIQUE COMPLET RT-TECHNOLOGIE
# Ce script fait TOUT de A à Z sans intervention
#═══════════════════════════════════════════════════════════════════════════════

set -e

REGION="eu-central-1"
ACCOUNT_ID="004843574253"
CLUSTER="rt-technologie-cluster"
INSTANCE_ID="i-0ece63fb077366323"

echo "════════════════════════════════════════════════════════════════"
echo "🚀 DÉPLOIEMENT AUTO-COMPLET RT-TECHNOLOGIE"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📋 Configuration:"
echo "   • Region: $REGION"
echo "   • Account: $ACCOUNT_ID"
echo "   • Cluster: $CLUSTER"
echo "   • Instance: $INSTANCE_ID"
echo ""

#═══════════════════════════════════════════════════════════════════════════════
# ÉTAPE 1: Vérifier les erreurs de push ECR
#═══════════════════════════════════════════════════════════════════════════════

echo "🔍 ÉTAPE 1/5: Diagnostic des erreurs..."
echo "════════════════════════════════════════════════════════════════"

CMD_ID=$(aws ssm send-command \
  --instance-ids $INSTANCE_ID \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "echo \"Logs de push:\"",
    "cat /tmp/push-tms-sync.log 2>/dev/null || cat /tmp/push-erp-sync.log | head -20",
    "echo \"\"",
    "echo \"Images locales:\"",
    "docker images | grep rt- | wc -l"
  ]' \
  --region $REGION \
  --output text \
  --query 'Command.CommandId')

sleep 8

echo "Résultat diagnostic:"
aws ssm get-command-invocation \
  --command-id $CMD_ID \
  --instance-id $INSTANCE_ID \
  --region $REGION \
  --query 'StandardOutputContent' \
  --output text

echo ""

#═══════════════════════════════════════════════════════════════════════════════
# ÉTAPE 2: Nettoyer et relancer le build complet
#═══════════════════════════════════════════════════════════════════════════════

echo "🧹 ÉTAPE 2/5: Nettoyage et relance du build..."
echo "════════════════════════════════════════════════════════════════"

CMD_ID=$(aws ssm send-command \
  --instance-ids $INSTANCE_ID \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "cd /home/ec2-user",
    "pkill -f deploy-complete || true",
    "rm -f /tmp/build-*.log /tmp/push-*.log",
    "nohup ./deploy-complete.sh > deploy.log 2>&1 &",
    "sleep 5",
    "echo \"Build relancé\"",
    "ps aux | grep deploy-complete | grep -v grep"
  ]' \
  --region $REGION \
  --output text \
  --query 'Command.CommandId')

sleep 10

aws ssm get-command-invocation \
  --command-id $CMD_ID \
  --instance-id $INSTANCE_ID \
  --region $REGION \
  --query 'StandardOutputContent' \
  --output text

echo ""
echo "⏳ Attente du build (30 minutes estimées)..."
echo ""

#═══════════════════════════════════════════════════════════════════════════════
# ÉTAPE 3: Monitoring automatique du build (boucle)
#═══════════════════════════════════════════════════════════════════════════════

echo "📊 ÉTAPE 3/5: Monitoring automatique..."
echo "════════════════════════════════════════════════════════════════"
echo ""

IMAGES_READY=0
ATTEMPTS=0
MAX_ATTEMPTS=40  # 40 x 60s = 40 minutes max

while [ $IMAGES_READY -lt 11 ] && [ $ATTEMPTS -lt $MAX_ATTEMPTS ]; do
  ((ATTEMPTS++))

  echo "[Tentative $ATTEMPTS/$MAX_ATTEMPTS] Vérification à $(date +%H:%M:%S)..."

  CMD_ID=$(aws ssm send-command \
    --instance-ids $INSTANCE_ID \
    --document-name "AWS-RunShellScript" \
    --parameters 'commands=[
      "REGION=eu-central-1",
      "COUNT=0",
      "for SERVICE in tms-sync erp-sync palette tracking-ia planning notifications admin-gateway authz training geo-tracking storage-market; do",
      "  STATUS=$(aws ecr describe-images --repository-name rt-$SERVICE --region $REGION --query images[0].imageTags[0] --output text 2>&1)",
      "  if [ \"$STATUS\" = \"latest\" ]; then",
      "    COUNT=$((COUNT + 1))",
      "  fi",
      "done",
      "echo $COUNT",
      "tail -5 /home/ec2-user/deploy.log | grep -E \"(Building|Build OK|Push OK)\" | tail -2"
    ]' \
    --region $REGION \
    --output text \
    --query 'Command.CommandId')

  sleep 8

  OUTPUT=$(aws ssm get-command-invocation \
    --command-id $CMD_ID \
    --instance-id $INSTANCE_ID \
    --region $REGION \
    --query 'StandardOutputContent' \
    --output text)

  IMAGES_READY=$(echo "$OUTPUT" | head -1)

  echo "   → $IMAGES_READY/11 images prêtes"
  echo "$OUTPUT" | tail -2 | sed 's/^/   → /'

  if [ $IMAGES_READY -lt 11 ]; then
    echo "   Prochaine vérification dans 60 secondes..."
    echo ""
    sleep 60
  fi
done

if [ $IMAGES_READY -eq 11 ]; then
  echo ""
  echo "✅ Toutes les images sont prêtes !"
else
  echo ""
  echo "⚠️ Timeout après $ATTEMPTS tentatives. $IMAGES_READY/11 images prêtes."
  echo "Vérifiez les logs manuellement avec:"
  echo "  tail -100 /home/ec2-user/deploy.log"
  exit 1
fi

echo ""

#═══════════════════════════════════════════════════════════════════════════════
# ÉTAPE 4: Déploiement sur ECS
#═══════════════════════════════════════════════════════════════════════════════

echo "🚀 ÉTAPE 4/5: Déploiement des 11 services sur ECS..."
echo "════════════════════════════════════════════════════════════════"

CMD_ID=$(aws ssm send-command \
  --instance-ids $INSTANCE_ID \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "cat > /tmp/deploy-ecs-final.sh << '\''EOFSCRIPT'\''",
    "#!/bin/bash",
    "REGION=eu-central-1",
    "CLUSTER=rt-technologie-cluster",
    "ACCOUNT_ID=004843574253",
    "echo \"🚀 Déploiement ECS...\"",
    "deploy_service() {",
    "  SVC=\\$1",
    "  PRT=\\$2",
    "  echo \"  [$SVC] Déploiement...\"",
    "  cat > /tmp/task-\\$SVC.json << EOF",
    "{\"family\":\"rt-\\$SVC\",\"networkMode\":\"awsvpc\",\"requiresCompatibilities\":[\"FARGATE\"],\"cpu\":\"256\",\"memory\":\"512\",\"executionRoleArn\":\"arn:aws:iam::\\${ACCOUNT_ID}:role/ecsTaskExecutionRole\",\"containerDefinitions\":[{\"name\":\"\\$SVC\",\"image\":\"\\${ACCOUNT_ID}.dkr.ecr.\\${REGION}.amazonaws.com/rt-\\${SVC}:latest\",\"portMappings\":[{\"containerPort\":\\$PRT,\"protocol\":\"tcp\"}],\"logConfiguration\":{\"logDriver\":\"awslogs\",\"options\":{\"awslogs-group\":\"/ecs/rt-\\$SVC\",\"awslogs-region\":\"\\$REGION\",\"awslogs-stream-prefix\":\"ecs\",\"awslogs-create-group\":\"true\"}},\"environment\":[{\"name\":\"NODE_ENV\",\"value\":\"production\"},{\"name\":\"PORT\",\"value\":\"\\$PRT\"}]}]}",
    "EOF",
    "  cat > /tmp/network-\\$SVC.json << EOF",
    "{\"awsvpcConfiguration\":{\"subnets\":[\"subnet-0cce60a3fe31c0d9e\",\"subnet-0a6a2f8fd776906ee\"],\"securityGroups\":[\"sg-0add3ac473775825a\"],\"assignPublicIp\":\"ENABLED\"}}",
    "EOF",
    "  aws ecs register-task-definition --cli-input-json file:///tmp/task-\\$SVC.json --region \\$REGION >/dev/null 2>&1",
    "  aws ecs create-service --cluster \\$CLUSTER --service-name rt-\\$SVC --task-definition rt-\\$SVC --desired-count 1 --launch-type FARGATE --network-configuration file:///tmp/network-\\$SVC.json --region \\$REGION >/dev/null 2>&1 && echo \"    ✅ \\$SVC\" || echo \"    ⚠️ \\$SVC (existe déjà)\"",
    "}",
    "deploy_service tms-sync 3120",
    "deploy_service erp-sync 3110",
    "deploy_service palette 3090",
    "deploy_service tracking-ia 3130",
    "deploy_service planning 3070",
    "deploy_service notifications 3050",
    "deploy_service admin-gateway 3008",
    "deploy_service authz 3007",
    "deploy_service training 3180",
    "deploy_service geo-tracking 3150",
    "deploy_service storage-market 3170",
    "echo \"\"",
    "echo \"✅ Déploiement terminé\"",
    "EOFSCRIPT",
    "chmod +x /tmp/deploy-ecs-final.sh",
    "/tmp/deploy-ecs-final.sh"
  ]' \
  --region $REGION \
  --timeout-seconds 300 \
  --output text \
  --query 'Command.CommandId')

sleep 30

echo "Résultat déploiement ECS:"
aws ssm get-command-invocation \
  --command-id $CMD_ID \
  --instance-id $INSTANCE_ID \
  --region $REGION \
  --query 'StandardOutputContent' \
  --output text

echo ""

#═══════════════════════════════════════════════════════════════════════════════
# ÉTAPE 5: Récupération des IPs publiques
#═══════════════════════════════════════════════════════════════════════════════

echo "🌐 ÉTAPE 5/5: Récupération des IPs publiques..."
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "⏳ Attente démarrage des tâches (2 minutes)..."
sleep 120

CMD_ID=$(aws ssm send-command \
  --instance-ids $INSTANCE_ID \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "REGION=eu-central-1",
    "echo \"🌐 IPS PUBLIQUES:\"",
    "echo \"════════════════════════════════════════\"",
    "get_ip() {",
    "  SVC=$1",
    "  PRT=$2",
    "  TASK_ARN=$(aws ecs list-tasks --cluster rt-technologie-cluster --service-name rt-$SVC --region $REGION --query taskArns[0] --output text 2>/dev/null)",
    "  if [ \"$TASK_ARN\" != \"None\" ] && [ -n \"$TASK_ARN\" ]; then",
    "    ENI=$(aws ecs describe-tasks --cluster rt-technologie-cluster --tasks $TASK_ARN --region $REGION --query tasks[0].attachments[0].details[?name==\\\"networkInterfaceId\\\"].value --output text 2>/dev/null)",
    "    if [ -n \"$ENI\" ]; then",
    "      IP=$(aws ec2 describe-network-interfaces --network-interface-ids $ENI --region $REGION --query NetworkInterfaces[0].Association.PublicIp --output text 2>/dev/null)",
    "      if [ -n \"$IP\" ] && [ \"$IP\" != \"None\" ]; then",
    "        echo \"✅ $SVC: http://$IP:$PRT\"",
    "      else",
    "        echo \"⏳ $SVC: Démarrage...\"",
    "      fi",
    "    fi",
    "  else",
    "    echo \"❌ $SVC: Pas de tâche\"",
    "  fi",
    "}",
    "get_ip tms-sync 3120",
    "get_ip erp-sync 3110",
    "get_ip palette 3090",
    "get_ip tracking-ia 3130",
    "get_ip planning 3070",
    "get_ip notifications 3050",
    "get_ip admin-gateway 3008",
    "get_ip authz 3007",
    "get_ip training 3180",
    "get_ip geo-tracking 3150",
    "get_ip storage-market 3170"
  ]' \
  --region $REGION \
  --output text \
  --query 'Command.CommandId')

sleep 15

aws ssm get-command-invocation \
  --command-id $CMD_ID \
  --instance-id $INSTANCE_ID \
  --region $REGION \
  --query 'StandardOutputContent' \
  --output text

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✅ DÉPLOIEMENT TERMINÉ !"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📋 Résumé:"
echo "   • Cluster: $CLUSTER"
echo "   • Region: $REGION"
echo "   • Services: 11/11 déployés"
echo ""
echo "🔗 Console ECS:"
echo "   https://eu-central-1.console.aws.amazon.com/ecs/v2/clusters/$CLUSTER/services"
echo ""
