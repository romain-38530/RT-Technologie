# 🔍 Vérification du Déploiement ECS

Le script s'est lancé mais le résultat est incomplet. Voici les commandes de vérification.

---

## 1️⃣ Vérifier l'exécution complète du script

```bash
aws ssm get-command-invocation \
  --command-id $(cat /tmp/deploy_cmd.txt) \
  --instance-id i-0ece63fb077366323 \
  --region eu-central-1 \
  --output json | jq -r '.StandardOutputContent, .StandardErrorContent'
```

---

## 2️⃣ Vérifier si le script s'exécute toujours

```bash
aws ssm send-command \
  --instance-ids i-0ece63fb077366323 \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "echo \"🔍 Vérification processus deploy-ecs.sh...\"",
    "ps aux | grep deploy-ecs || echo \"Pas de processus en cours\"",
    "echo \"\"",
    "echo \"📋 Contenu du script:\"",
    "if [ -f /tmp/deploy-ecs.sh ]; then",
    "  wc -l /tmp/deploy-ecs.sh",
    "  echo \"✓ Script créé\"",
    "else",
    "  echo \"❌ Script non trouvé\"",
    "fi"
  ]' \
  --region eu-central-1 \
  --output text \
  --query 'Command.CommandId' > /tmp/check_cmd.txt && sleep 5 && aws ssm get-command-invocation --command-id $(cat /tmp/check_cmd.txt) --instance-id i-0ece63fb077366323 --region eu-central-1 --query 'StandardOutputContent' --output text
```

---

## 3️⃣ Vérifier l'état des services ECS directement

```bash
aws ecs list-services \
  --cluster rt-technologie-cluster \
  --region eu-central-1 \
  --output table
```

---

## 4️⃣ Vérifier les task definitions créées

```bash
aws ecs list-task-definitions \
  --family-prefix rt- \
  --region eu-central-1 \
  --sort DESC \
  --max-items 20 \
  --output table
```

---

## 5️⃣ Relancer le déploiement manuellement sur EC2

Si le script n'a pas fonctionné, relancez-le directement:

```bash
aws ssm send-command \
  --instance-ids i-0ece63fb077366323 \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "if [ -f /tmp/deploy-ecs.sh ]; then",
    "  echo \"🚀 Exécution du script de déploiement...\"",
    "  bash -x /tmp/deploy-ecs.sh 2>&1",
    "else",
    "  echo \"❌ Script non trouvé, création...\"",
    "  echo \"Veuillez d'\''abord créer le script\"",
    "fi"
  ]' \
  --region eu-central-1 \
  --timeout-seconds 600 \
  --output text \
  --query 'Command.CommandId' > /tmp/manual_deploy.txt && sleep 120 && aws ssm get-command-invocation --command-id $(cat /tmp/manual_deploy.txt) --instance-id i-0ece63fb077366323 --region eu-central-1 --query 'StandardOutputContent' --output text
```

---

## 6️⃣ Vérifier les logs CloudWatch des services

```bash
for SERVICE in tms-sync erp-sync palette tracking-ia planning notifications admin-gateway authz training geo-tracking storage-market; do
  echo "=== $SERVICE ==="
  aws logs describe-log-groups --log-group-name-prefix "/ecs/rt-$SERVICE" --region eu-central-1 --query 'logGroups[].logGroupName' --output text
done
```

---

## 🎯 Commande Simplifiée Alternative

Si tout échoue, voici une version plus simple qui crée les services un par un:

```bash
aws ssm send-command \
  --instance-ids i-0ece63fb077366323 \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "REGION=eu-central-1",
    "ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)",
    "echo \"Account: $ACCOUNT_ID\"",
    "echo \"\"",
    "echo \"Déploiement notifications...\"",
    "aws logs create-log-group --log-group-name /ecs/rt-notifications --region $REGION 2>/dev/null || true",
    "aws ecs register-task-definition --family rt-notifications --network-mode awsvpc --requires-compatibilities FARGATE --cpu 256 --memory 512 --execution-role-arn arn:aws:iam::${ACCOUNT_ID}:role/ecsTaskExecutionRole --container-definitions \"[{\\\"name\\\":\\\"notifications\\\",\\\"image\\\":\\\"${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/rt-notifications:latest\\\",\\\"portMappings\\\":[{\\\"containerPort\\\":3050}],\\\"logConfiguration\\\":{\\\"logDriver\\\":\\\"awslogs\\\",\\\"options\\\":{\\\"awslogs-group\\\":\\\"/ecs/rt-notifications\\\",\\\"awslogs-region\\\":\\\"${REGION}\\\",\\\"awslogs-stream-prefix\\\":\\\"ecs\\\"}},\\\"environment\\\":[{\\\"name\\\":\\\"NODE_ENV\\\",\\\"value\\\":\\\"production\\\"}]}]\" --region $REGION",
    "aws ecs create-service --cluster rt-technologie-cluster --service-name rt-notifications --task-definition rt-notifications --desired-count 1 --launch-type FARGATE --network-configuration awsvpcConfiguration={subnets=[subnet-0cce60a3fe31c0d9e,subnet-0a6a2f8fd776906ee],securityGroups=[sg-0add3ac473775825a],assignPublicIp=ENABLED} --region $REGION || aws ecs update-service --cluster rt-technologie-cluster --service rt-notifications --task-definition rt-notifications --force-new-deployment --region $REGION",
    "echo \"✅ notifications déployé\""
  ]' \
  --region eu-central-1 \
  --output text \
  --query 'Command.CommandId' > /tmp/simple_deploy.txt && sleep 15 && aws ssm get-command-invocation --command-id $(cat /tmp/simple_deploy.txt) --instance-id i-0ece63fb077366323 --region eu-central-1 --query 'StandardOutputContent' --output text
```

---

**Commencez par la commande 1 pour voir ce qui s'est réellement passé !**
