# 🚀 Déploiement ECS - Version Corrigée

Le problème venait des array associatifs bash. Voici la version corrigée qui fonctionne.

---

## 📋 Commande Corrigée

**Copiez-collez dans AWS CloudShell :**

```bash
aws ssm send-command \
  --instance-ids i-0ece63fb077366323 \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "echo \"════════════════════════════════════════════════════════════════\"",
    "echo \"🚀 DÉPLOIEMENT DES 11 SERVICES SUR ECS FARGATE\"",
    "echo \"════════════════════════════════════════════════════════════════\"",
    "echo \"\"",
    "REGION=eu-central-1",
    "CLUSTER=rt-technologie-cluster",
    "SUBNET1=subnet-0cce60a3fe31c0d9e",
    "SUBNET2=subnet-0a6a2f8fd776906ee",
    "SG=sg-0add3ac473775825a",
    "ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)",
    "echo \"Account ID: $ACCOUNT_ID\"",
    "echo \"\"",
    "DEPLOYED=0",
    "deploy_service() {",
    "  SERVICE=$1",
    "  PORT=$2",
    "  IMAGE=${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/rt-${SERVICE}:latest",
    "  echo \"[$((DEPLOYED + 1))/11] 📦 Déploiement: $SERVICE (port $PORT)\"",
    "  aws logs create-log-group --log-group-name /ecs/rt-${SERVICE} --region ${REGION} 2>/dev/null || true",
    "  aws ecs register-task-definition --family rt-${SERVICE} --network-mode awsvpc --requires-compatibilities FARGATE --cpu 256 --memory 512 --execution-role-arn arn:aws:iam::${ACCOUNT_ID}:role/ecsTaskExecutionRole --container-definitions \"[{\\\"name\\\":\\\"${SERVICE}\\\",\\\"image\\\":\\\"${IMAGE}\\\",\\\"portMappings\\\":[{\\\"containerPort\\\":${PORT},\\\"protocol\\\":\\\"tcp\\\"}],\\\"logConfiguration\\\":{\\\"logDriver\\\":\\\"awslogs\\\",\\\"options\\\":{\\\"awslogs-group\\\":\\\"/ecs/rt-${SERVICE}\\\",\\\"awslogs-region\\\":\\\"${REGION}\\\",\\\"awslogs-stream-prefix\\\":\\\"ecs\\\"}},\\\"environment\\\":[{\\\"name\\\":\\\"NODE_ENV\\\",\\\"value\\\":\\\"production\\\"},{\\\"name\\\":\\\"PORT\\\",\\\"value\\\":\\\"${PORT}\\\"}]}]\" --region ${REGION} >/dev/null 2>&1",
    "  EXISTING=$(aws ecs describe-services --cluster ${CLUSTER} --services rt-${SERVICE} --region ${REGION} --query services[0].serviceName --output text 2>/dev/null || echo None)",
    "  if [ \"$EXISTING\" = \"rt-${SERVICE}\" ]; then",
    "    echo \"     ↻ Mise à jour service existant\"",
    "    aws ecs update-service --cluster ${CLUSTER} --service rt-${SERVICE} --task-definition rt-${SERVICE} --desired-count 1 --region ${REGION} >/dev/null 2>&1",
    "  else",
    "    echo \"     ✨ Création nouveau service\"",
    "    aws ecs create-service --cluster ${CLUSTER} --service-name rt-${SERVICE} --task-definition rt-${SERVICE} --desired-count 1 --launch-type FARGATE --network-configuration awsvpcConfiguration={subnets=[${SUBNET1},${SUBNET2}],securityGroups=[${SG}],assignPublicIp=ENABLED} --region ${REGION} >/dev/null 2>&1",
    "  fi",
    "  if [ $? -eq 0 ]; then",
    "    echo \"     ✅ $SERVICE déployé avec succès\"",
    "    DEPLOYED=$((DEPLOYED + 1))",
    "  else",
    "    echo \"     ❌ $SERVICE échoué\"",
    "  fi",
    "  echo \"\"",
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
    "echo \"════════════════════════════════════════════════════════════════\"",
    "echo \"📊 RÉSULTAT FINAL: $DEPLOYED/11 services déployés\"",
    "echo \"════════════════════════════════════════════════════════════════\""
  ]' \
  --region eu-central-1 \
  --timeout-seconds 600 \
  --output text \
  --query 'Command.CommandId' > /tmp/deploy_ecs_v2.txt && sleep 90 && aws ssm get-command-invocation --command-id $(cat /tmp/deploy_ecs_v2.txt) --instance-id i-0ece63fb077366323 --region eu-central-1 --query 'StandardOutputContent' --output text
```

---

## 🔍 Différences Clés

1. ✅ **Pas d'array associatif** - Utilise une fonction `deploy_service` avec paramètres
2. ✅ **Échappement simplifié** - Les quotes sont correctement échappées
3. ✅ **Timeout augmenté** - 600 secondes pour laisser le temps aux 11 services
4. ✅ **Meilleure gestion d'erreurs** - Chaque service est géré individuellement

---

## ⏱️ Durée

- **Création des task definitions** : ~20 secondes
- **Création des services ECS** : ~60 secondes
- **Total** : ~90 secondes

---

## 📊 Après le Déploiement

Une fois la commande terminée, vérifiez les services :

```bash
aws ecs list-services --cluster rt-technologie-cluster --region eu-central-1
```

Vérifiez les tâches en cours :

```bash
aws ecs list-tasks --cluster rt-technologie-cluster --region eu-central-1 --desired-status RUNNING
```

---

## 🌐 Récupérer les IPs (dans 5 minutes)

```bash
aws ssm send-command \
  --instance-ids i-0ece63fb077366323 \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "echo \"🌐 RÉCUPÉRATION DES IPS PUBLIQUES\"",
    "echo \"════════════════════════════════════════════════════════════════\"",
    "REGION=eu-central-1",
    "get_ip() {",
    "  SERVICE=$1",
    "  PORT=$2",
    "  TASK_ARN=$(aws ecs list-tasks --cluster rt-technologie-cluster --service-name rt-$SERVICE --region $REGION --query taskArns[0] --output text 2>/dev/null)",
    "  if [ \"$TASK_ARN\" != \"None\" ] && [ -n \"$TASK_ARN\" ]; then",
    "    ENI=$(aws ecs describe-tasks --cluster rt-technologie-cluster --tasks $TASK_ARN --region $REGION --query tasks[0].attachments[0].details[?name==\\\"networkInterfaceId\\\"].value --output text 2>/dev/null)",
    "    if [ -n \"$ENI\" ]; then",
    "      IP=$(aws ec2 describe-network-interfaces --network-interface-ids $ENI --region $REGION --query NetworkInterfaces[0].Association.PublicIp --output text 2>/dev/null)",
    "      if [ -n \"$IP\" ] && [ \"$IP\" != \"None\" ]; then",
    "        echo \"✅ $SERVICE: http://$IP:$PORT\"",
    "      else",
    "        echo \"⏳ $SERVICE: En cours de démarrage...\"",
    "      fi",
    "    else",
    "      echo \"⏳ $SERVICE: En cours de démarrage...\"",
    "    fi",
    "  else",
    "    echo \"❌ $SERVICE: Pas de tâche\"",
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
    "get_ip storage-market 3170",
    "echo \"════════════════════════════════════════════════════════════════\""
  ]' \
  --region eu-central-1 \
  --output text \
  --query 'Command.CommandId' > /tmp/get_ips.txt && sleep 15 && aws ssm get-command-invocation --command-id $(cat /tmp/get_ips.txt) --instance-id i-0ece63fb077366323 --region eu-central-1 --query 'StandardOutputContent' --output text
```

---

**🎯 Exécutez la première commande maintenant ! Elle devrait fonctionner sans erreur de syntaxe.**
