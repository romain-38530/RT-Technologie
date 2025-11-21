# Deploiement via AWS CloudShell

Vous avez trouve le terminal AWS CloudShell ! Parfait, voici les commandes a executer.

## Etape 1 : Cloner le Repository

Dans CloudShell, executez :

```bash
git clone https://github.com/romain-38530/RT-Technologie.git
cd RT-Technologie
```

## Etape 2 : Configuration

```bash
# Definir les variables
export AWS_REGION=eu-west-1
export AWS_ACCOUNT_ID=004843574253
export ECR_REPO=rt-client-onboarding
export ECS_CLUSTER=rt-production
```

## Etape 3 : Creer l'Infrastructure

### 3.1 Creer ECR Repository

```bash
aws ecr create-repository \
  --repository-name $ECR_REPO \
  --region $AWS_REGION \
  --image-scanning-configuration scanOnPush=true
```

### 3.2 Creer ECS Cluster

```bash
aws ecs create-cluster \
  --cluster-name $ECS_CLUSTER \
  --region $AWS_REGION
```

### 3.3 Creer CloudWatch Log Group

```bash
aws logs create-log-group \
  --log-group-name /ecs/$ECR_REPO \
  --region $AWS_REGION
```

## Etape 4 : Migrer les Secrets

```bash
# MongoDB URI
aws secretsmanager create-secret \
  --name rt/client-onboarding/mongodb-uri \
  --secret-string "mongodb+srv://Admin:SETT.38530@stagingrt.v2jnoh2.mongodb.net/rt_technologie" \
  --region $AWS_REGION

# JWT Secret
aws secretsmanager create-secret \
  --name rt/client-onboarding/jwt-secret \
  --secret-string "ab2325974ab77ea4c3892803b09bea2650c9cb5284e2df983ce8ac34c97efeec" \
  --region $AWS_REGION

# SMTP Host
aws secretsmanager create-secret \
  --name rt/client-onboarding/smtp-host \
  --secret-string "smtp.eu.mailgun.org" \
  --region $AWS_REGION

# SMTP Port
aws secretsmanager create-secret \
  --name rt/client-onboarding/smtp-port \
  --secret-string "587" \
  --region $AWS_REGION

# SMTP User
aws secretsmanager create-secret \
  --name rt/client-onboarding/smtp-user \
  --secret-string "postmaster@mg.rt-technologie.com" \
  --region $AWS_REGION

# SMTP Password
aws secretsmanager create-secret \
  --name rt/client-onboarding/smtp-password \
  --secret-string "f30e11eb5824d2194c1851bd1c142fbb-e80d8b76-ff2acfa2" \
  --region $AWS_REGION

# SMTP From
aws secretsmanager create-secret \
  --name rt/client-onboarding/smtp-from \
  --secret-string "postmaster@mg.rt-technologie.com" \
  --region $AWS_REGION
```

## Etape 5 : Builder et Pousser Docker

```bash
cd services/client-onboarding

# Login vers ECR
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin \
  $004843574253.dkr.ecr.$AWS_REGION.amazonaws.com

# Build
docker build -t $ECR_REPO:latest .

# Tag
docker tag $ECR_REPO:latest \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:latest

# Push
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:latest

cd ../..
```

## Etape 6 : Creer IAM Role

```bash
# Creer le role d'execution
cat > task-execution-role-trust-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

aws iam create-role \
  --role-name ecsTaskExecutionRole \
  --assume-role-policy-document file://task-execution-role-trust-policy.json

aws iam attach-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

aws iam attach-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite
```

## Etape 7 : Enregistrer Task Definition

```bash
aws ecs register-task-definition \
  --cli-input-json file://infra/aws/ecs-task-definition.json \
  --region $AWS_REGION
```

## Etape 8 : Creer Security Group

```bash
# Obtenir le VPC par defaut
VPC_ID=$(aws ec2 describe-vpcs \
  --filters "Name=is-default,Values=true" \
  --query 'Vpcs[0].VpcId' \
  --output text \
  --region $AWS_REGION)

# Creer le security group
SG_ID=$(aws ec2 create-security-group \
  --group-name rt-client-onboarding-sg \
  --description "RT Client Onboarding" \
  --vpc-id $VPC_ID \
  --region $AWS_REGION \
  --query 'GroupId' \
  --output text)

# Autoriser le port 3020
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 3020 \
  --cidr 0.0.0.0/0 \
  --region $AWS_REGION

echo "Security Group ID: $SG_ID"
```

## Etape 9 : Obtenir les Subnets

```bash
SUBNET_IDS=$(aws ec2 describe-subnets \
  --filters "Name=vpc-id,Values=$VPC_ID" \
  --query 'Subnets[0:2].SubnetId' \
  --output text \
  --region $AWS_REGION | tr '\t' ',')

echo "Subnets: $SUBNET_IDS"
```

## Etape 10 : Creer le Service ECS

```bash
aws ecs create-service \
  --cluster $ECS_CLUSTER \
  --service-name client-onboarding \
  --task-definition rt-client-onboarding \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_IDS],securityGroups=[$SG_ID],assignPublicIp=ENABLED}" \
  --region $AWS_REGION
```

## Etape 11 : Attendre la Stabilisation

```bash
aws ecs wait services-stable \
  --cluster $ECS_CLUSTER \
  --services client-onboarding \
  --region $AWS_REGION

echo "Service deploye!"
```

## Etape 12 : Obtenir l'IP Publique

```bash
# Obtenir le task ARN
TASK_ARN=$(aws ecs list-tasks \
  --cluster $ECS_CLUSTER \
  --service-name client-onboarding \
  --region $AWS_REGION \
  --query 'taskArns[0]' \
  --output text)

# Obtenir l'ENI ID
ENI_ID=$(aws ecs describe-tasks \
  --cluster $ECS_CLUSTER \
  --tasks $TASK_ARN \
  --region $AWS_REGION \
  --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' \
  --output text)

# Obtenir l'IP publique
PUBLIC_IP=$(aws ec2 describe-network-interfaces \
  --network-interface-ids $ENI_ID \
  --region $AWS_REGION \
  --query 'NetworkInterfaces[0].Association.PublicIp' \
  --output text)

echo ""
echo "=========================================="
echo "DEPLOIEMENT TERMINE!"
echo "=========================================="
echo ""
echo "Backend URL: http://$PUBLIC_IP:3020"
echo "Health Check: http://$PUBLIC_IP:3020/health"
echo ""
echo "Testez:"
echo "  curl http://$PUBLIC_IP:3020/health"
echo ""
```

## Etape 13 : Tester

```bash
curl http://$PUBLIC_IP:3020/health
```

Vous devriez voir :
```json
{"status":"ok","service":"client-onboarding","port":"3020"}
```

## RESULTAT

Vous avez maintenant :
- Backend deploye sur AWS ECS Fargate
- URL publique : http://[IP]:3020

## Prochaine Etape : Vercel

1. Aller sur : https://vercel.com/new
2. Importer : RT-Technologie
3. Root Directory : apps/marketing-site
4. Variable : NEXT_PUBLIC_API_URL = http://[IP_PUBLIQUE]:3020
5. Deploy

---

**Copiez-collez ces commandes une par une dans CloudShell AWS !**
