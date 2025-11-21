# ⏳ Build en Cours - Suivi Automatique

Le build progresse ! `tms-sync` est déjà terminé (1/16). Les images mettent ~3 minutes chacune.

---

## 🔄 Commande de Suivi (à relancer toutes les 2-3 minutes)

```bash
aws ssm send-command \
  --instance-ids i-0ece63fb077366323 \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "echo \"⏱️ $(date +%H:%M:%S) - STATUT DU BUILD\"",
    "echo \"════════════════════════════════════════\"",
    "tail -15 /home/ec2-user/deploy.log | grep -E \"(Building|Build OK|Push OK|✓|DEPLOYED)\" || tail -15 /home/ec2-user/deploy.log",
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
    "echo \"📊 Progression: $COUNT/11 images prêtes\"",
    "echo \"════════════════════════════════════════\""
  ]' \
  --region eu-central-1 \
  --output text \
  --query 'Command.CommandId' > /tmp/status.txt && sleep 10 && aws ssm get-command-invocation --command-id $(cat /tmp/status.txt) --instance-id i-0ece63fb077366323 --region eu-central-1 --query 'StandardOutputContent' --output text
```

---

## 📊 Temps Estimé

- **1 service** : ~3 minutes (build + push)
- **11 services** : ~33 minutes au total
- **Progression actuelle** : 1/16 terminé (tms-sync)

---

## 🎯 Que Faire Maintenant ?

### Option 1: Attendre la fin (recommandé)
Relancez la commande de suivi ci-dessus toutes les 5 minutes jusqu'à voir "11/11 images prêtes"

### Option 2: Déployer au fur et à mesure
Dès qu'une image apparaît dans ECR, on peut la déployer immédiatement

---

## 🚀 Déploiement d'un Service Individuel (test)

Une fois qu'on voit au moins 1 image prête, on peut tester le déploiement :

```bash
aws ssm send-command \
  --instance-ids i-0ece63fb077366323 \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "echo \"🧪 TEST DÉPLOIEMENT tms-sync\"",
    "REGION=eu-central-1",
    "CLUSTER=rt-technologie-cluster",
    "ACCOUNT_ID=004843574253",
    "cat > /tmp/task-tms-sync.json << EOF",
    "{",
    "  \"family\": \"rt-tms-sync\",",
    "  \"networkMode\": \"awsvpc\",",
    "  \"requiresCompatibilities\": [\"FARGATE\"],",
    "  \"cpu\": \"256\",",
    "  \"memory\": \"512\",",
    "  \"executionRoleArn\": \"arn:aws:iam::004843574253:role/ecsTaskExecutionRole\",",
    "  \"containerDefinitions\": [{",
    "    \"name\": \"tms-sync\",",
    "    \"image\": \"004843574253.dkr.ecr.eu-central-1.amazonaws.com/rt-tms-sync:latest\",",
    "    \"portMappings\": [{\"containerPort\": 3120, \"protocol\": \"tcp\"}],",
    "    \"logConfiguration\": {",
    "      \"logDriver\": \"awslogs\",",
    "      \"options\": {",
    "        \"awslogs-group\": \"/ecs/rt-tms-sync\",",
    "        \"awslogs-region\": \"eu-central-1\",",
    "        \"awslogs-stream-prefix\": \"ecs\",",
    "        \"awslogs-create-group\": \"true\"",
    "      }",
    "    },",
    "    \"environment\": [",
    "      {\"name\": \"NODE_ENV\", \"value\": \"production\"},",
    "      {\"name\": \"PORT\", \"value\": \"3120\"}",
    "    ]",
    "  }]",
    "}",
    "EOF",
    "cat > /tmp/network.json << EOF",
    "{",
    "  \"awsvpcConfiguration\": {",
    "    \"subnets\": [\"subnet-0cce60a3fe31c0d9e\", \"subnet-0a6a2f8fd776906ee\"],",
    "    \"securityGroups\": [\"sg-0add3ac473775825a\"],",
    "    \"assignPublicIp\": \"ENABLED\"",
    "  }",
    "}",
    "EOF",
    "echo \"📝 Création task definition...\"",
    "aws ecs register-task-definition --cli-input-json file:///tmp/task-tms-sync.json --region $REGION --query taskDefinition.taskDefinitionArn --output text",
    "echo \"\"",
    "echo \"🚀 Création service ECS...\"",
    "aws ecs create-service --cluster $CLUSTER --service-name rt-tms-sync --task-definition rt-tms-sync --desired-count 1 --launch-type FARGATE --network-configuration file:///tmp/network.json --region $REGION --query service.serviceName --output text",
    "echo \"\"",
    "echo \"✅ Déploiement lancé !\""
  ]' \
  --region eu-central-1 \
  --timeout-seconds 60 \
  --output text \
  --query 'Command.CommandId' > /tmp/test_deploy.txt && sleep 10 && aws ssm get-command-invocation --command-id $(cat /tmp/test_deploy.txt) --instance-id i-0ece63fb077366323 --region eu-central-1 --query 'StandardOutputContent' --output text
```

---

## 📋 Résumé

- ✅ Build en cours (1/16 terminé)
- ⏳ Attendre ~30 minutes pour les 11 images
- 🔄 Relancer la commande de suivi toutes les 5 minutes
- 🚀 Déployer quand "11/11 images prêtes"

---

**Relancez la commande de suivi dans 5 minutes pour voir la progression !**
