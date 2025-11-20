# 🚀 Déploiement Direct des 11 Services sur ECS

Cette commande unique déploie les 11 services prêts sur AWS ECS Fargate.

---

## 📋 Commande à Copier/Coller dans AWS CloudShell

**Copiez-collez cette commande complète** :

```bash
aws ssm send-command \
  --instance-ids i-0ece63fb077366323 \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "cat > /tmp/deploy-ecs.sh << '\''EOFSCRIPT'\''",
    "#!/bin/bash",
    "set -e",
    "echo \"════════════════════════════════════════════════════════════════\"",
    "echo \"🚀 DÉPLOIEMENT DES SERVICES SUR ECS FARGATE\"",
    "echo \"════════════════════════════════════════════════════════════════\"",
    "echo \"\"",
    "REGION=eu-central-1",
    "CLUSTER=rt-technologie-cluster",
    "SUBNET1=subnet-0cce60a3fe31c0d9e",
    "SUBNET2=subnet-0a6a2f8fd776906ee",
    "SG=sg-0add3ac473775825a",
    "ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)",
    "DEPLOYED=0",
    "FAILED=0",
    "for SERVICE in tms-sync erp-sync palette tracking-ia planning notifications admin-gateway authz training geo-tracking storage-market; do",
    "  case $SERVICE in",
    "    tms-sync) PORT=3120 ;;",
    "    erp-sync) PORT=3110 ;;",
    "    palette) PORT=3090 ;;",
    "    tracking-ia) PORT=3130 ;;",
    "    planning) PORT=3070 ;;",
    "    notifications) PORT=3050 ;;",
    "    admin-gateway) PORT=3008 ;;",
    "    authz) PORT=3007 ;;",
    "    training) PORT=3180 ;;",
    "    geo-tracking) PORT=3150 ;;",
    "    storage-market) PORT=3170 ;;",
    "  esac",
    "  IMAGE=\${ACCOUNT_ID}.dkr.ecr.\${REGION}.amazonaws.com/rt-\${SERVICE}:latest",
    "  echo \"📦 Déploiement: \$SERVICE (port \$PORT)\"",
    "  aws logs create-log-group --log-group-name /ecs/rt-\${SERVICE} --region \${REGION} 2>/dev/null || true",
    "  aws ecs register-task-definition --family rt-\${SERVICE} --network-mode awsvpc --requires-compatibilities FARGATE --cpu 256 --memory 512 --execution-role-arn arn:aws:iam::\${ACCOUNT_ID}:role/ecsTaskExecutionRole --container-definitions \"[{\\\\\\\"name\\\\\\\":\\\\\\\"\${SERVICE}\\\\\\\",\\\\\\\"image\\\\\\\":\\\\\\\"\${IMAGE}\\\\\\\",\\\\\\\"portMappings\\\\\\\":[{\\\\\\\"containerPort\\\\\\\":\${PORT},\\\\\\\"protocol\\\\\\\":\\\\\\\"tcp\\\\\\\"}],\\\\\\\"logConfiguration\\\\\\\":{\\\\\\\"logDriver\\\\\\\":\\\\\\\"awslogs\\\\\\\",\\\\\\\"options\\\\\\\":{\\\\\\\"awslogs-group\\\\\\\":\\\\\\\"/ecs/rt-\${SERVICE}\\\\\\\",\\\\\\\"awslogs-region\\\\\\\":\\\\\\\"\${REGION}\\\\\\\",\\\\\\\"awslogs-stream-prefix\\\\\\\":\\\\\\\"ecs\\\\\\\"}},\\\\\\\"environment\\\\\\\":[{\\\\\\\"name\\\\\\\":\\\\\\\"NODE_ENV\\\\\\\",\\\\\\\"value\\\\\\\":\\\\\\\"production\\\\\\\"},{\\\\\\\"name\\\\\\\":\\\\\\\"PORT\\\\\\\",\\\\\\\"value\\\\\\\":\\\\\\\"\${PORT}\\\\\\\"}]}]\" --region \${REGION} > /dev/null",
    "  EXISTING=\$(aws ecs describe-services --cluster \${CLUSTER} --services rt-\${SERVICE} --region \${REGION} --query services[0].serviceName --output text 2>/dev/null || echo None)",
    "  if [ \"\$EXISTING\" = \"rt-\${SERVICE}\" ]; then",
    "    echo \"  ↻ Mise à jour service\"",
    "    aws ecs update-service --cluster \${CLUSTER} --service rt-\${SERVICE} --task-definition rt-\${SERVICE} --desired-count 1 --region \${REGION} > /dev/null",
    "  else",
    "    echo \"  ✨ Création service\"",
    "    aws ecs create-service --cluster \${CLUSTER} --service-name rt-\${SERVICE} --task-definition rt-\${SERVICE} --desired-count 1 --launch-type FARGATE --network-configuration awsvpcConfiguration={subnets=[\${SUBNET1},\${SUBNET2}],securityGroups=[\${SG}],assignPublicIp=ENABLED} --region \${REGION} > /dev/null",
    "  fi",
    "  if [ \$? -eq 0 ]; then",
    "    echo \"  ✅ \$SERVICE déployé\"",
    "    ((DEPLOYED++))",
    "  else",
    "    echo \"  ❌ \$SERVICE échoué\"",
    "    ((FAILED++))",
    "  fi",
    "  echo \"\"",
    "done",
    "echo \"════════════════════════════════════════════════════════════════\"",
    "echo \"📊 RÉSULTAT: ✅ \$DEPLOYED déployés, ❌ \$FAILED échoués\"",
    "echo \"════════════════════════════════════════════════════════════════\"",
    "EOFSCRIPT",
    "chmod +x /tmp/deploy-ecs.sh",
    "/tmp/deploy-ecs.sh"
  ]' \
  --region eu-central-1 \
  --output text \
  --query 'Command.CommandId' > /tmp/deploy_cmd.txt && sleep 60 && aws ssm get-command-invocation --command-id $(cat /tmp/deploy_cmd.txt) --instance-id i-0ece63fb077366323 --region eu-central-1 --query 'StandardOutputContent' --output text
```

---

## 📊 Ce que fait cette commande

1. ✅ Crée un script de déploiement sur l'instance EC2
2. ✅ Déploie les **11 services** prêts:
   - tms-sync (port 3120)
   - erp-sync (port 3110)
   - palette (port 3090)
   - tracking-ia (port 3130)
   - planning (port 3070)
   - notifications (port 3050)
   - admin-gateway (port 3008)
   - authz (port 3007)
   - training (port 3180)
   - geo-tracking (port 3150)
   - storage-market (port 3170)
3. ✅ Crée les log groups CloudWatch
4. ✅ Enregistre les task definitions
5. ✅ Crée/met à jour les services ECS

---

## ⏱️ Durée

- **Exécution** : ~3-5 minutes (11 services)
- **Démarrage des tâches** : +2-3 minutes

---

## 🔍 Vérification Après Déploiement

Pour vérifier que les services sont en cours d'exécution:

```bash
aws ssm send-command \
  --instance-ids i-0ece63fb077366323 \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "echo \"🔍 STATUT DES SERVICES ECS\"",
    "echo \"════════════════════════════════════════════════════════════════\"",
    "for SERVICE in tms-sync erp-sync palette tracking-ia planning notifications admin-gateway authz training geo-tracking storage-market; do",
    "  STATUS=$(aws ecs describe-services --cluster rt-technologie-cluster --services rt-$SERVICE --region eu-central-1 --query services[0].runningCount --output text 2>/dev/null || echo 0)",
    "  if [ \"$STATUS\" = \"1\" ]; then",
    "    echo \"  ✅ $SERVICE: RUNNING\"",
    "  else",
    "    echo \"  ⏳ $SERVICE: STARTING/STOPPED\"",
    "  fi",
    "done",
    "echo \"════════════════════════════════════════════════════════════════\""
  ]' \
  --region eu-central-1 \
  --output text \
  --query 'Command.CommandId' > /tmp/status_cmd.txt && sleep 8 && aws ssm get-command-invocation --command-id $(cat /tmp/status_cmd.txt) --instance-id i-0ece63fb077366323 --region eu-central-1 --query 'StandardOutputContent' --output text
```

---

## 🌐 Obtenir les IPs Publiques (après 5 minutes)

```bash
aws ssm send-command \
  --instance-ids i-0ece63fb077366323 \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "echo \"🌐 IPS PUBLIQUES DES SERVICES\"",
    "echo \"════════════════════════════════════════════════════════════════\"",
    "for SERVICE in tms-sync erp-sync palette tracking-ia planning notifications admin-gateway authz training geo-tracking storage-market; do",
    "  case $SERVICE in",
    "    tms-sync) PORT=3120 ;;",
    "    erp-sync) PORT=3110 ;;",
    "    palette) PORT=3090 ;;",
    "    tracking-ia) PORT=3130 ;;",
    "    planning) PORT=3070 ;;",
    "    notifications) PORT=3050 ;;",
    "    admin-gateway) PORT=3008 ;;",
    "    authz) PORT=3007 ;;",
    "    training) PORT=3180 ;;",
    "    geo-tracking) PORT=3150 ;;",
    "    storage-market) PORT=3170 ;;",
    "  esac",
    "  TASK_ARN=$(aws ecs list-tasks --cluster rt-technologie-cluster --service-name rt-$SERVICE --region eu-central-1 --query taskArns[0] --output text 2>/dev/null)",
    "  if [ \"$TASK_ARN\" != \"None\" ] && [ -n \"$TASK_ARN\" ]; then",
    "    ENI=$(aws ecs describe-tasks --cluster rt-technologie-cluster --tasks $TASK_ARN --region eu-central-1 --query tasks[0].attachments[0].details[?name==\047networkInterfaceId\047].value --output text)",
    "    IP=$(aws ec2 describe-network-interfaces --network-interface-ids $ENI --region eu-central-1 --query NetworkInterfaces[0].Association.PublicIp --output text 2>/dev/null)",
    "    if [ -n \"$IP\" ] && [ \"$IP\" != \"None\" ]; then",
    "      echo \"  ✅ $SERVICE: http://$IP:$PORT\"",
    "    else",
    "      echo \"  ⏳ $SERVICE: IP non attribuée\"",
    "    fi",
    "  else",
    "    echo \"  ❌ $SERVICE: Pas de tâche en cours\"",
    "  fi",
    "done",
    "echo \"════════════════════════════════════════════════════════════════\""
  ]' \
  --region eu-central-1 \
  --output text \
  --query 'Command.CommandId' > /tmp/ips_cmd.txt && sleep 15 && aws ssm get-command-invocation --command-id $(cat /tmp/ips_cmd.txt) --instance-id i-0ece63fb077366323 --region eu-central-1 --query 'StandardOutputContent' --output text
```

---

## 📝 Notes

- Les 5 services manquants (pricing-grids, ecpmr, bourse, chatbot, wms-sync) seront déployés dans une seconde phase
- Chaque service utilise 256 CPU et 512 MB de mémoire
- Les logs sont disponibles dans CloudWatch Logs sous `/ecs/rt-{service}`

---

**🎯 Exécutez la première commande dans CloudShell pour démarrer le déploiement !**
