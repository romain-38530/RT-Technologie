# 📊 Suivi du Build et Déploiement Automatique

Le cluster ECS est créé ✅ et le build des images Docker est en cours sur l'instance EC2.

---

## 🔍 Commande de Suivi en Temps Réel

**Copiez-collez dans CloudShell pour suivre la progression toutes les 30 secondes :**

```bash
while true; do
  clear
  echo "🔄 Rafraîchissement automatique toutes les 30 secondes..."
  echo "════════════════════════════════════════════════════════════════"
  echo ""

  # Statut du build
  aws ssm send-command \
    --instance-ids i-0ece63fb077366323 \
    --document-name "AWS-RunShellScript" \
    --parameters 'commands=[
      "echo \"📊 STATUT DU BUILD\"",
      "echo \"════════════════════════════════════════\"",
      "tail -20 /home/ec2-user/deploy.log",
      "echo \"\"",
      "echo \"🖼️ IMAGES DANS ECR:\"",
      "echo \"════════════════════════════════════════\"",
      "REGION=eu-central-1",
      "COUNT=0",
      "for SERVICE in tms-sync erp-sync palette tracking-ia planning notifications admin-gateway authz training geo-tracking storage-market; do",
      "  STATUS=$(aws ecr describe-images --repository-name rt-$SERVICE --region $REGION --query images[0].imageTags[0] --output text 2>&1)",
      "  if [ \"$STATUS\" = \"latest\" ]; then",
      "    echo \"  ✅ $SERVICE\"",
      "    COUNT=$((COUNT + 1))",
      "  else",
      "    echo \"  ⏳ $SERVICE\"",
      "  fi",
      "done",
      "echo \"\"",
      "echo \"📊 Total: $COUNT/11 images prêtes\""
    ]' \
    --region eu-central-1 \
    --output text \
    --query 'Command.CommandId' > /tmp/status.txt

  sleep 8

  aws ssm get-command-invocation \
    --command-id $(cat /tmp/status.txt) \
    --instance-id i-0ece63fb077366323 \
    --region eu-central-1 \
    --query 'StandardOutputContent' \
    --output text

  echo ""
  echo "════════════════════════════════════════════════════════════════"
  echo "Prochain rafraîchissement dans 30 secondes... (Ctrl+C pour arrêter)"
  sleep 30
done
```

---

## 📋 Commande de Vérification Unique (sans boucle)

Si vous préférez vérifier manuellement :

```bash
aws ssm send-command \
  --instance-ids i-0ece63fb077366323 \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "echo \"📊 STATUT DU BUILD\"",
    "echo \"════════════════════════════════════════\"",
    "tail -30 /home/ec2-user/deploy.log",
    "echo \"\"",
    "echo \"🖼️ IMAGES DANS ECR:\"",
    "echo \"════════════════════════════════════════\"",
    "REGION=eu-central-1",
    "COUNT=0",
    "for SERVICE in tms-sync erp-sync palette tracking-ia planning notifications admin-gateway authz training geo-tracking storage-market; do",
    "  STATUS=$(aws ecr describe-images --repository-name rt-$SERVICE --region $REGION --query images[0].imageTags[0] --output text 2>&1)",
    "  if [ \"$STATUS\" = \"latest\" ]; then",
    "    echo \"  ✅ $SERVICE\"",
    "    COUNT=$((COUNT + 1))",
    "  else",
    "    echo \"  ⏳ $SERVICE (en cours...)\"",
    "  fi",
    "done",
    "echo \"\"",
    "echo \"📊 Total: $COUNT/11 images prêtes\""
  ]' \
  --region eu-central-1 \
  --output text \
  --query 'Command.CommandId' > /tmp/status.txt && sleep 10 && aws ssm get-command-invocation --command-id $(cat /tmp/status.txt) --instance-id i-0ece63fb077366323 --region eu-central-1 --query 'StandardOutputContent' --output text
```

---

## 🚀 Déploiement Automatique (une fois les 11 images prêtes)

Une fois que toutes les images sont dans ECR, lancez ce script de déploiement :

```bash
aws ssm send-command \
  --instance-ids i-0ece63fb077366323 \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "cat > /tmp/deploy-to-ecs.sh << '\''EOFSCRIPT'\''",
    "#!/bin/bash",
    "REGION=eu-central-1",
    "CLUSTER=rt-technologie-cluster",
    "ACCOUNT_ID=004843574253",
    "echo \"🚀 DÉPLOIEMENT SUR ECS FARGATE\"",
    "echo \"════════════════════════════════════════\"",
    "deploy_service() {",
    "  SVC=\\$1",
    "  PRT=\\$2",
    "  echo \"[\\$SVC] Déploiement port \\$PRT...\"",
    "  cat > /tmp/task-\\$SVC.json << EOF",
    "{",
    "  \"family\": \"rt-\\$SVC\",",
    "  \"networkMode\": \"awsvpc\",",
    "  \"requiresCompatibilities\": [\"FARGATE\"],",
    "  \"cpu\": \"256\",",
    "  \"memory\": \"512\",",
    "  \"executionRoleArn\": \"arn:aws:iam::\\${ACCOUNT_ID}:role/ecsTaskExecutionRole\",",
    "  \"containerDefinitions\": [{",
    "    \"name\": \"\\$SVC\",",
    "    \"image\": \"\\${ACCOUNT_ID}.dkr.ecr.\\${REGION}.amazonaws.com/rt-\\${SVC}:latest\",",
    "    \"portMappings\": [{\"containerPort\": \\$PRT, \"protocol\": \"tcp\"}],",
    "    \"logConfiguration\": {",
    "      \"logDriver\": \"awslogs\",",
    "      \"options\": {",
    "        \"awslogs-group\": \"/ecs/rt-\\$SVC\",",
    "        \"awslogs-region\": \"\\$REGION\",",
    "        \"awslogs-stream-prefix\": \"ecs\",",
    "        \"awslogs-create-group\": \"true\"",
    "      }",
    "    },",
    "    \"environment\": [",
    "      {\"name\": \"NODE_ENV\", \"value\": \"production\"},",
    "      {\"name\": \"PORT\", \"value\": \"\\$PRT\"}",
    "    ]",
    "  }]",
    "}",
    "EOF",
    "  cat > /tmp/network-\\$SVC.json << EOF",
    "{",
    "  \"awsvpcConfiguration\": {",
    "    \"subnets\": [\"subnet-0cce60a3fe31c0d9e\", \"subnet-0a6a2f8fd776906ee\"],",
    "    \"securityGroups\": [\"sg-0add3ac473775825a\"],",
    "    \"assignPublicIp\": \"ENABLED\"",
    "  }",
    "}",
    "EOF",
    "  aws ecs register-task-definition --cli-input-json file:///tmp/task-\\$SVC.json --region \\$REGION >/dev/null 2>&1",
    "  aws ecs create-service --cluster \\$CLUSTER --service-name rt-\\$SVC --task-definition rt-\\$SVC --desired-count 1 --launch-type FARGATE --network-configuration file:///tmp/network-\\$SVC.json --region \\$REGION >/dev/null 2>&1",
    "  if [ \\$? -eq 0 ]; then",
    "    echo \"  ✅ \\$SVC déployé\"",
    "  else",
    "    echo \"  ⚠️ \\$SVC (peut-être déjà existant)\"",
    "  fi",
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
    "echo \"════════════════════════════════════════\"",
    "echo \"✅ Déploiement terminé\"",
    "EOFSCRIPT",
    "chmod +x /tmp/deploy-to-ecs.sh",
    "/tmp/deploy-to-ecs.sh"
  ]' \
  --region eu-central-1 \
  --timeout-seconds 300 \
  --output text \
  --query 'Command.CommandId' > /tmp/final_deploy.txt && sleep 30 && aws ssm get-command-invocation --command-id $(cat /tmp/final_deploy.txt) --instance-id i-0ece63fb077366323 --region eu-central-1 --query 'StandardOutputContent' --output text
```

---

## ⏱️ Temps Estimé

- **Build des 11 images** : 30-40 minutes
- **Déploiement sur ECS** : 3-5 minutes
- **Total** : ~45 minutes

---

**Lancez la commande de suivi pour voir la progression en temps réel !**
