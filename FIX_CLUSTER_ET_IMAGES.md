# 🔧 Fix Cluster ECS et Vérification Images

Trois problèmes identifiés :
1. Le cluster ECS n'existe pas
2. Les images ECR semblent absentes
3. Syntaxe de la commande create-service incorrecte

---

## 1️⃣ Créer le Cluster ECS

```bash
aws ecs create-cluster --cluster-name rt-technologie-cluster --region eu-central-1
```

---

## 2️⃣ Vérifier les Images ECR

```bash
aws ssm send-command \
  --instance-ids i-0ece63fb077366323 \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "echo \"🔍 Vérification des images dans ECR...\"",
    "echo \"════════════════════════════════════════\"",
    "REGION=eu-central-1",
    "ACCOUNT_ID=004843574253",
    "echo \"\"",
    "for SERVICE in tms-sync erp-sync palette tracking-ia planning notifications admin-gateway authz training geo-tracking storage-market; do",
    "  echo -n \"$SERVICE: \"",
    "  aws ecr describe-images --repository-name rt-$SERVICE --region $REGION --query images[0].imageTags[0] --output text 2>&1 | head -1",
    "done",
    "echo \"\"",
    "echo \"════════════════════════════════════════\""
  ]' \
  --region eu-central-1 \
  --output text \
  --query 'Command.CommandId' > /tmp/check_images.txt && sleep 8 && aws ssm get-command-invocation --command-id $(cat /tmp/check_images.txt) --instance-id i-0ece63fb077366323 --region eu-central-1 --query 'StandardOutputContent' --output text
```

---

## 3️⃣ Déploiement Corrigé (avec syntaxe JSON correcte)

Après avoir créé le cluster, utilisez cette commande corrigée :

```bash
aws ssm send-command \
  --instance-ids i-0ece63fb077366323 \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "echo \"🚀 DÉPLOIEMENT ECS - Version Corrigée\"",
    "echo \"════════════════════════════════════════\"",
    "REGION=eu-central-1",
    "CLUSTER=rt-technologie-cluster",
    "ACCOUNT_ID=004843574253",
    "echo \"\"",
    "deploy_service() {",
    "  SVC=$1",
    "  PRT=$2",
    "  echo \"[$SVC] Déploiement...\"",
    "  aws ecs register-task-definition --region $REGION --family rt-$SVC --network-mode awsvpc --requires-compatibilities FARGATE --cpu 256 --memory 512 --execution-role-arn arn:aws:iam::${ACCOUNT_ID}:role/ecsTaskExecutionRole --container-definitions file:///dev/stdin <<EOF",
[
  {
    \"name\": \"$SVC\",
    \"image\": \"${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/rt-${SVC}:latest\",
    \"portMappings\": [{\"containerPort\": $PRT, \"protocol\": \"tcp\"}],
    \"logConfiguration\": {
      \"logDriver\": \"awslogs\",
      \"options\": {
        \"awslogs-group\": \"/ecs/rt-${SVC}\",
        \"awslogs-region\": \"${REGION}\",
        \"awslogs-stream-prefix\": \"ecs\",
        \"awslogs-create-group\": \"true\"
      }
    },
    \"environment\": [
      {\"name\": \"NODE_ENV\", \"value\": \"production\"},
      {\"name\": \"PORT\", \"value\": \"$PRT\"}
    ]
  }
]",
EOF",
    "  aws ecs create-service --region $REGION --cluster $CLUSTER --service-name rt-$SVC --task-definition rt-$SVC --desired-count 1 --launch-type FARGATE --network-configuration file:///dev/stdin <<EOF",
{
  \"awsvpcConfiguration\": {
    \"subnets\": [\"subnet-0cce60a3fe31c0d9e\", \"subnet-0a6a2f8fd776906ee\"],
    \"securityGroups\": [\"sg-0add3ac473775825a\"],
    \"assignPublicIp\": \"ENABLED\"
  }
}",
EOF",
    "  if [ $? -eq 0 ]; then",
    "    echo \"  ✅ $SVC déployé\"",
    "  else",
    "    echo \"  ❌ $SVC échoué\"",
    "  fi",
    "}",
    "deploy_service notifications 3050",
    "echo \"════════════════════════════════════════\""
  ]' \
  --region eu-central-1 \
  --timeout-seconds 300 \
  --output text \
  --query 'Command.CommandId' > /tmp/deploy_fixed.txt && sleep 20 && aws ssm get-command-invocation --command-id $(cat /tmp/deploy_fixed.txt) --instance-id i-0ece63fb077366323 --region eu-central-1 --query 'StandardOutputContent' --output text
```

---

## 📋 Actions à Faire dans l'Ordre

### Étape 1: Créer le cluster
```bash
aws ecs create-cluster --cluster-name rt-technologie-cluster --region eu-central-1
```

### Étape 2: Vérifier les images (commande ci-dessus)

### Étape 3: Si les images manquent, relancer le build
```bash
aws ssm send-command \
  --instance-ids i-0ece63fb077366323 \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "cd /home/ec2-user",
    "nohup ./deploy-complete.sh > deploy.log 2>&1 &",
    "sleep 5",
    "tail -50 deploy.log"
  ]' \
  --region eu-central-1 \
  --output text \
  --query 'Command.CommandId' > /tmp/rebuild.txt && sleep 10 && aws ssm get-command-invocation --command-id $(cat /tmp/rebuild.txt) --instance-id i-0ece63fb077366323 --region eu-central-1 --query 'StandardOutputContent' --output text
```

---

**Commencez par créer le cluster, puis vérifiez les images !**
