# 🔍 Debug Déploiement ECS - Voir les Erreurs

Tous les services échouent. Vérifions les vraies erreurs en activant les messages d'erreur.

---

## 🔎 Commande de Debug

**Copiez-collez dans CloudShell pour voir les vraies erreurs :**

```bash
aws ssm send-command \
  --instance-ids i-0ece63fb077366323 \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "echo \"🔍 DEBUG - Test déploiement notifications avec erreurs visibles\"",
    "echo \"════════════════════════════════════════════════════════════════\"",
    "REGION=eu-central-1",
    "CLUSTER=rt-technologie-cluster",
    "SUBNET1=subnet-0cce60a3fe31c0d9e",
    "SUBNET2=subnet-0a6a2f8fd776906ee",
    "SG=sg-0add3ac473775825a",
    "ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)",
    "echo \"Account: $ACCOUNT_ID\"",
    "echo \"\"",
    "echo \"1️⃣ Vérification cluster...\"",
    "aws ecs describe-clusters --clusters ${CLUSTER} --region ${REGION} --query clusters[0].status --output text",
    "echo \"\"",
    "echo \"2️⃣ Vérification rôle IAM...\"",
    "aws iam get-role --role-name ecsTaskExecutionRole --query Role.Arn --output text 2>&1",
    "echo \"\"",
    "echo \"3️⃣ Vérification image ECR...\"",
    "aws ecr describe-images --repository-name rt-notifications --region ${REGION} --query images[0].imageTags[0] --output text 2>&1",
    "echo \"\"",
    "echo \"4️⃣ Test création service notifications (AVEC erreurs)...\"",
    "IMAGE=${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/rt-notifications:latest",
    "echo \"Image: $IMAGE\"",
    "echo \"\"",
    "aws logs create-log-group --log-group-name /ecs/rt-notifications --region ${REGION} 2>&1 || echo \"Log group existe déjà\"",
    "echo \"\"",
    "echo \"📝 Création task definition...\"",
    "aws ecs register-task-definition --family rt-notifications --network-mode awsvpc --requires-compatibilities FARGATE --cpu 256 --memory 512 --execution-role-arn arn:aws:iam::${ACCOUNT_ID}:role/ecsTaskExecutionRole --container-definitions \"[{\\\"name\\\":\\\"notifications\\\",\\\"image\\\":\\\"${IMAGE}\\\",\\\"portMappings\\\":[{\\\"containerPort\\\":3050,\\\"protocol\\\":\\\"tcp\\\"}],\\\"logConfiguration\\\":{\\\"logDriver\\\":\\\"awslogs\\\",\\\"options\\\":{\\\"awslogs-group\\\":\\\"/ecs/rt-notifications\\\",\\\"awslogs-region\\\":\\\"${REGION}\\\",\\\"awslogs-stream-prefix\\\":\\\"ecs\\\"}},\\\"environment\\\":[{\\\"name\\\":\\\"NODE_ENV\\\",\\\"value\\\":\\\"production\\\"}]}]\" --region ${REGION} --query taskDefinition.taskDefinitionArn --output text",
    "echo \"\"",
    "echo \"🚀 Création service (SANS redirection erreurs)...\"",
    "aws ecs create-service --cluster ${CLUSTER} --service-name rt-notifications --task-definition rt-notifications --desired-count 1 --launch-type FARGATE --network-configuration awsvpcConfiguration={subnets=[${SUBNET1},${SUBNET2}],securityGroups=[${SG}],assignPublicIp=ENABLED} --region ${REGION} 2>&1",
    "echo \"\"",
    "echo \"════════════════════════════════════════════════════════════════\""
  ]' \
  --region eu-central-1 \
  --timeout-seconds 120 \
  --output text \
  --query 'Command.CommandId' > /tmp/debug_ecs.txt && sleep 20 && aws ssm get-command-invocation --command-id $(cat /tmp/debug_ecs.txt) --instance-id i-0ece63fb077366323 --region eu-central-1 --query 'StandardOutputContent' --output text
```

---

## 📊 Ce que cette commande fait

1. ✅ Vérifie que le cluster existe
2. ✅ Vérifie que le rôle IAM `ecsTaskExecutionRole` existe
3. ✅ Vérifie que l'image Docker `rt-notifications:latest` existe dans ECR
4. ✅ Tente de créer le service **SANS masquer les erreurs**

---

## 🎯 Erreurs Possibles

### Erreur 1: Rôle IAM manquant
```
An error occurred (NoSuchEntity) when calling the GetRole operation: The role with name ecsTaskExecutionRole cannot be found
```

**Solution**: Créer le rôle
```bash
aws iam create-role --role-name ecsTaskExecutionRole --assume-role-policy-document '{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "ecs-tasks.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}' --region eu-central-1

aws iam attach-role-policy --role-name ecsTaskExecutionRole --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy --region eu-central-1
```

### Erreur 2: Security Group invalide
```
The security group 'sg-xxx' does not exist
```

**Solution**: Utiliser le security group par défaut du VPC

### Erreur 3: Subnet invalide
```
The subnet ID 'subnet-xxx' does not exist
```

**Solution**: Vérifier les subnets du VPC

### Erreur 4: Image ECR introuvable
```
CannotPullContainerError
```

**Solution**: Vérifier que l'image existe bien dans ECR

---

**Exécutez la commande de debug pour voir la vraie erreur !**
