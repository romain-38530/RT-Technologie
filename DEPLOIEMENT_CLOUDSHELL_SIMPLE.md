# Deploiement AWS via CloudShell - Version Simplifiee

Copiez-collez ces commandes UNE PAR UNE dans AWS CloudShell.

## ETAPE 1 : Configuration Initiale

```bash
export AWS_REGION=eu-west-1
export AWS_ACCOUNT_ID=004843574253
export ECR_REPO=rt-client-onboarding
export ECS_CLUSTER=rt-production

echo "Configuration:"
echo "  Region: $AWS_REGION"
echo "  Account: $AWS_ACCOUNT_ID"
echo "  ECR Repo: $ECR_REPO"
```

## ETAPE 2 : Cloner le Code

```bash
git clone https://github.com/romain-38530/RT-Technologie.git
cd RT-Technologie
```

## ETAPE 3 : Creer ECR Repository

```bash
aws ecr create-repository \
  --repository-name $ECR_REPO \
  --region $AWS_REGION \
  --image-scanning-configuration scanOnPush=true \
  --encryption-configuration encryptionType=AES256
```

Si erreur "RepositoryAlreadyExistsException" : C'est normal, continuez.

## ETAPE 4 : Creer ECS Cluster

```bash
aws ecs create-cluster \
  --cluster-name $ECS_CLUSTER \
  --region $AWS_REGION
```

## ETAPE 5 : Creer CloudWatch Log Group

```bash
aws logs create-log-group \
  --log-group-name /ecs/$ECR_REPO \
  --region $AWS_REGION
```

Si erreur "ResourceAlreadyExistsException" : C'est normal, continuez.

## ETAPE 6 : Creer les Secrets

Executez chaque commande separement :

```bash
# MongoDB URI
aws secretsmanager create-secret \
  --name rt/client-onboarding/mongodb-uri \
  --secret-string "mongodb+srv://Admin:SETT.38530@stagingrt.v2jnoh2.mongodb.net/rt_technologie" \
  --region $AWS_REGION
```

```bash
# JWT Secret
aws secretsmanager create-secret \
  --name rt/client-onboarding/jwt-secret \
  --secret-string "ab2325974ab77ea4c3892803b09bea2650c9cb5284e2df983ce8ac34c97efeec" \
  --region $AWS_REGION
```

```bash
# SMTP Host
aws secretsmanager create-secret \
  --name rt/client-onboarding/smtp-host \
  --secret-string "smtp.eu.mailgun.org" \
  --region $AWS_REGION
```

```bash
# SMTP Port
aws secretsmanager create-secret \
  --name rt/client-onboarding/smtp-port \
  --secret-string "587" \
  --region $AWS_REGION
```

```bash
# SMTP User
aws secretsmanager create-secret \
  --name rt/client-onboarding/smtp-user \
  --secret-string "postmaster@mg.rt-technologie.com" \
  --region $AWS_REGION
```

```bash
# SMTP Password
aws secretsmanager create-secret \
  --name rt/client-onboarding/smtp-password \
  --secret-string "f30e11eb5824d2194c1851bd1c142fbb-e80d8b76-ff2acfa2" \
  --region $AWS_REGION
```

```bash
# SMTP From
aws secretsmanager create-secret \
  --name rt/client-onboarding/smtp-from \
  --secret-string "postmaster@mg.rt-technologie.com" \
  --region $AWS_REGION
```

Si erreur "ResourceExistsException" : Les secrets existent deja, c'est OK.

## ETAPE 7 : Builder et Pousser l'Image Docker

```bash
cd services/client-onboarding

# Login vers ECR (CORRECTION : sans $ devant le numero de compte)
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin \
  004843574253.dkr.ecr.eu-west-1.amazonaws.com

# Build l'image
docker build -t $ECR_REPO:latest .

# Tag l'image
docker tag $ECR_REPO:latest \
  004843574253.dkr.ecr.eu-west-1.amazonaws.com/$ECR_REPO:latest

# Push vers ECR
docker push 004843574253.dkr.ecr.eu-west-1.amazonaws.com/$ECR_REPO:latest

cd ../..
```

## ETAPE 8 : Creer IAM Role

```bash
# Fichier de trust policy
cat > /tmp/task-execution-role-trust-policy.json << 'EOF'
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

# Creer le role
aws iam create-role \
  --role-name ecsTaskExecutionRole \
  --assume-role-policy-document file:///tmp/task-execution-role-trust-policy.json \
  --region $AWS_REGION

# Attacher les policies
aws iam attach-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy \
  --region $AWS_REGION

aws iam attach-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite \
  --region $AWS_REGION
```

Si erreur "EntityAlreadyExists" : Le role existe deja, c'est OK.

## ETAPE 9 : Enregistrer Task Definition

```bash
aws ecs register-task-definition \
  --cli-input-json file://infra/aws/ecs-task-definition.json \
  --region $AWS_REGION
```

## ETAPE 10 : Creer Security Group et Obtenir Subnets

```bash
# Obtenir le VPC par defaut
VPC_ID=$(aws ec2 describe-vpcs \
  --filters "Name=is-default,Values=true" \
  --query 'Vpcs[0].VpcId' \
  --output text \
  --region $AWS_REGION)

echo "VPC ID: $VPC_ID"

# Obtenir les subnets
SUBNET_1=$(aws ec2 describe-subnets \
  --filters "Name=vpc-id,Values=$VPC_ID" \
  --query 'Subnets[0].SubnetId' \
  --output text \
  --region $AWS_REGION)

SUBNET_2=$(aws ec2 describe-subnets \
  --filters "Name=vpc-id,Values=$VPC_ID" \
  --query 'Subnets[1].SubnetId' \
  --output text \
  --region $AWS_REGION)

echo "Subnet 1: $SUBNET_1"
echo "Subnet 2: $SUBNET_2"

# Creer le security group
SG_ID=$(aws ec2 create-security-group \
  --group-name rt-client-onboarding-sg \
  --description "RT Client Onboarding Security Group" \
  --vpc-id $VPC_ID \
  --region $AWS_REGION \
  --query 'GroupId' \
  --output text)

echo "Security Group ID: $SG_ID"

# Autoriser le port 3020
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 3020 \
  --cidr 0.0.0.0/0 \
  --region $AWS_REGION
```

Si erreur sur security group : Il existe peut-etre deja. Recuperez son ID avec :

```bash
SG_ID=$(aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=rt-client-onboarding-sg" "Name=vpc-id,Values=$VPC_ID" \
  --query 'SecurityGroups[0].GroupId' \
  --output text \
  --region $AWS_REGION)

echo "Security Group ID (existant): $SG_ID"
```

## ETAPE 11 : Creer le Service ECS

```bash
aws ecs create-service \
  --cluster $ECS_CLUSTER \
  --service-name client-onboarding \
  --task-definition rt-client-onboarding \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_1,$SUBNET_2],securityGroups=[$SG_ID],assignPublicIp=ENABLED}" \
  --region $AWS_REGION
```

## ETAPE 12 : Attendre la Stabilisation

```bash
echo "Attente de la stabilisation du service (peut prendre 3-5 minutes)..."

aws ecs wait services-stable \
  --cluster $ECS_CLUSTER \
  --services client-onboarding \
  --region $AWS_REGION

echo "Service stable!"
```

## ETAPE 13 : Obtenir l'IP Publique

```bash
# Obtenir le task ARN
TASK_ARN=$(aws ecs list-tasks \
  --cluster $ECS_CLUSTER \
  --service-name client-onboarding \
  --region $AWS_REGION \
  --query 'taskArns[0]' \
  --output text)

echo "Task ARN: $TASK_ARN"

# Obtenir l'ENI ID
ENI_ID=$(aws ecs describe-tasks \
  --cluster $ECS_CLUSTER \
  --tasks $TASK_ARN \
  --region $AWS_REGION \
  --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' \
  --output text)

echo "ENI ID: $ENI_ID"

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
```

## ETAPE 14 : Tester

```bash
curl http://$PUBLIC_IP:3020/health
```

Vous devriez voir :
```json
{"status":"ok","service":"client-onboarding","port":"3020"}
```

## RESULTAT

Notez votre IP publique : `http://[IP]:3020`

## Prochaine Etape : Vercel

1. Aller sur : https://vercel.com/new
2. Se connecter avec GitHub
3. Importer : RT-Technologie
4. Root Directory : `apps/marketing-site`
5. Variable d'environnement :
   - Name : `NEXT_PUBLIC_API_URL`
   - Value : `http://[VOTRE_IP_PUBLIQUE]:3020`
6. Deploy

---

## En Cas d'Erreur

### Si le build Docker echoue

CloudShell peut manquer de ressources. Solution :

1. Buildez sur votre machine locale avec Docker Desktop
2. Poussez vers ECR depuis votre machine

### Si le service ne demarre pas

Verifiez les logs :

```bash
aws logs tail /ecs/$ECR_REPO --follow --region $AWS_REGION
```

---

**Commencez par l'ETAPE 1 et suivez dans l'ordre !**
