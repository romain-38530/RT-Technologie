# Script de deploiement complet AWS ECS
# RT-Technologie - Client Onboarding

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploiement AWS ECS - RT-Technologie" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$AWS_REGION = "eu-west-1"
$AWS_ACCOUNT_ID = "004843574253"
$ECR_REPO_NAME = "rt-client-onboarding"
$ECS_CLUSTER = "rt-production"
$ECS_SERVICE = "client-onboarding"
$TASK_FAMILY = "rt-client-onboarding"

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Region: $AWS_REGION" -ForegroundColor White
Write-Host "  Account ID: $AWS_ACCOUNT_ID" -ForegroundColor White
Write-Host "  ECR Repo: $ECR_REPO_NAME" -ForegroundColor White
Write-Host ""

# Verifier AWS CLI
Write-Host "Verification AWS CLI..." -ForegroundColor Yellow
try {
    $awsVersion = aws --version 2>&1
    Write-Host "  AWS CLI: $awsVersion" -ForegroundColor Green
} catch {
    Write-Host "  ERREUR: AWS CLI non trouve!" -ForegroundColor Red
    Write-Host "  Veuillez ouvrir un NOUVEAU PowerShell pour que AWS CLI soit disponible" -ForegroundColor Yellow
    exit 1
}

# Verifier credentials
Write-Host "Verification credentials AWS..." -ForegroundColor Yellow
try {
    $identity = aws sts get-caller-identity --output json | ConvertFrom-Json
    Write-Host "  Account: $($identity.Account)" -ForegroundColor Green
    Write-Host "  User: $($identity.Arn)" -ForegroundColor Green

    if ($identity.Account -ne $AWS_ACCOUNT_ID) {
        Write-Host "  ERREUR: Mauvais compte AWS!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "  ERREUR: Credentials AWS invalides!" -ForegroundColor Red
    Write-Host "  Executez: aws configure" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ETAPE 1: Creation Infrastructure AWS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Creer ECR Repository
Write-Host "Creation ECR Repository..." -ForegroundColor Yellow
try {
    aws ecr describe-repositories --repository-names $ECR_REPO_NAME --region $AWS_REGION 2>&1 | Out-Null
    Write-Host "  ECR Repository existe deja" -ForegroundColor Green
} catch {
    Write-Host "  Creation du repository..." -ForegroundColor Yellow
    aws ecr create-repository `
        --repository-name $ECR_REPO_NAME `
        --region $AWS_REGION `
        --image-scanning-configuration scanOnPush=true `
        --encryption-configuration encryptionType=AES256
    Write-Host "  ECR Repository cree!" -ForegroundColor Green
}

# Creer ECS Cluster
Write-Host "Creation ECS Cluster..." -ForegroundColor Yellow
try {
    $cluster = aws ecs describe-clusters --clusters $ECS_CLUSTER --region $AWS_REGION --output json | ConvertFrom-Json
    if ($cluster.clusters.Count -gt 0 -and $cluster.clusters[0].status -eq "ACTIVE") {
        Write-Host "  ECS Cluster existe deja" -ForegroundColor Green
    } else {
        throw "Cluster not found"
    }
} catch {
    Write-Host "  Creation du cluster..." -ForegroundColor Yellow
    aws ecs create-cluster --cluster-name $ECS_CLUSTER --region $AWS_REGION
    Write-Host "  ECS Cluster cree!" -ForegroundColor Green
}

# Creer CloudWatch Log Group
Write-Host "Creation CloudWatch Log Group..." -ForegroundColor Yellow
try {
    aws logs describe-log-groups --log-group-name-prefix "/ecs/$TASK_FAMILY" --region $AWS_REGION 2>&1 | Out-Null
    Write-Host "  Log Group existe deja" -ForegroundColor Green
} catch {
    Write-Host "  Creation du log group..." -ForegroundColor Yellow
    aws logs create-log-group --log-group-name "/ecs/$TASK_FAMILY" --region $AWS_REGION
    Write-Host "  Log Group cree!" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ETAPE 2: Migration des Secrets" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Lire .env.production
$envFile = "services\client-onboarding\.env.production"
if (-not (Test-Path $envFile)) {
    Write-Host "ERREUR: $envFile non trouve!" -ForegroundColor Red
    exit 1
}

$secrets = @{
    "mongodb-uri" = ""
    "jwt-secret" = ""
    "smtp-host" = ""
    "smtp-port" = ""
    "smtp-user" = ""
    "smtp-password" = ""
    "smtp-from" = ""
    "vat-api-key" = ""
}

Write-Host "Lecture de .env.production..." -ForegroundColor Yellow
Get-Content $envFile | ForEach-Object {
    if ($_ -match "^MONGODB_URI=(.+)$") { $secrets["mongodb-uri"] = $matches[1] }
    if ($_ -match "^JWT_SECRET=(.+)$") { $secrets["jwt-secret"] = $matches[1] }
    if ($_ -match "^SMTP_HOST=(.+)$") { $secrets["smtp-host"] = $matches[1] }
    if ($_ -match "^SMTP_PORT=(.+)$") { $secrets["smtp-port"] = $matches[1] }
    if ($_ -match "^SMTP_USER=(.+)$") { $secrets["smtp-user"] = $matches[1] }
    if ($_ -match "^SMTP_PASSWORD=(.+)$") { $secrets["smtp-password"] = $matches[1] }
    if ($_ -match "^SMTP_FROM=(.+)$") { $secrets["smtp-from"] = $matches[1] }
}

Write-Host "Creation des secrets dans AWS Secrets Manager..." -ForegroundColor Yellow
foreach ($key in $secrets.Keys) {
    $secretName = "rt/client-onboarding/$key"
    $secretValue = $secrets[$key]

    if ([string]::IsNullOrEmpty($secretValue)) {
        Write-Host "  Skip: $secretName (vide)" -ForegroundColor Yellow
        continue
    }

    try {
        aws secretsmanager describe-secret --secret-id $secretName --region $AWS_REGION 2>&1 | Out-Null
        Write-Host "  Update: $secretName" -ForegroundColor Yellow
        aws secretsmanager update-secret --secret-id $secretName --secret-string $secretValue --region $AWS_REGION | Out-Null
    } catch {
        Write-Host "  Create: $secretName" -ForegroundColor Yellow
        aws secretsmanager create-secret --name $secretName --secret-string $secretValue --region $AWS_REGION | Out-Null
    }
}

Write-Host "Secrets migres!" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ETAPE 3: Build et Push Docker" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verifier Docker
Write-Host "Verification Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "  Docker: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "  ERREUR: Docker non trouve!" -ForegroundColor Red
    Write-Host "  Veuillez installer Docker Desktop" -ForegroundColor Yellow
    exit 1
}

# Build l'image
Write-Host "Build de l'image Docker..." -ForegroundColor Yellow
cd services\client-onboarding
docker build -t $ECR_REPO_NAME:latest .
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR: Build Docker echoue!" -ForegroundColor Red
    exit 1
}
Write-Host "Image buildee!" -ForegroundColor Green
cd ..\..

# Login ECR
Write-Host "Login vers ECR..." -ForegroundColor Yellow
$loginCmd = aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
Write-Host "Connecte a ECR!" -ForegroundColor Green

# Tag l'image
Write-Host "Tag de l'image..." -ForegroundColor Yellow
docker tag "$ECR_REPO_NAME:latest" "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME:latest"

# Push vers ECR
Write-Host "Push vers ECR..." -ForegroundColor Yellow
docker push "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME:latest"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR: Push Docker echoue!" -ForegroundColor Red
    exit 1
}
Write-Host "Image poussee vers ECR!" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ETAPE 4: Deploiement ECS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Enregistrer task definition
Write-Host "Enregistrement de la task definition..." -ForegroundColor Yellow
aws ecs register-task-definition --cli-input-json file://infra/aws/ecs-task-definition.json --region $AWS_REGION
Write-Host "Task definition enregistree!" -ForegroundColor Green

# Verifier si le service existe
Write-Host "Verification du service ECS..." -ForegroundColor Yellow
try {
    $service = aws ecs describe-services --cluster $ECS_CLUSTER --services $ECS_SERVICE --region $AWS_REGION --output json | ConvertFrom-Json

    if ($service.services.Count -gt 0 -and $service.services[0].status -ne "INACTIVE") {
        Write-Host "  Service existe - mise a jour..." -ForegroundColor Yellow
        aws ecs update-service `
            --cluster $ECS_CLUSTER `
            --service $ECS_SERVICE `
            --force-new-deployment `
            --region $AWS_REGION
        Write-Host "  Service mis a jour!" -ForegroundColor Green
    } else {
        throw "Service not found"
    }
} catch {
    Write-Host "  Creation du service..." -ForegroundColor Yellow

    # Obtenir le default VPC et subnets
    $vpc = aws ec2 describe-vpcs --filters "Name=is-default,Values=true" --region $AWS_REGION --output json | ConvertFrom-Json
    $vpcId = $vpc.Vpcs[0].VpcId

    $subnets = aws ec2 describe-subnets --filters "Name=vpc-id,Values=$vpcId" --region $AWS_REGION --output json | ConvertFrom-Json
    $subnetIds = ($subnets.Subnets | Select-Object -First 2 | ForEach-Object { $_.SubnetId }) -join ","

    # Creer security group
    $sgName = "rt-client-onboarding-sg"
    try {
        $sg = aws ec2 describe-security-groups --filters "Name=group-name,Values=$sgName" "Name=vpc-id,Values=$vpcId" --region $AWS_REGION --output json | ConvertFrom-Json
        $sgId = $sg.SecurityGroups[0].GroupId
        Write-Host "  Security Group existe: $sgId" -ForegroundColor Green
    } catch {
        $sg = aws ec2 create-security-group --group-name $sgName --description "RT Client Onboarding" --vpc-id $vpcId --region $AWS_REGION --output json | ConvertFrom-Json
        $sgId = $sg.GroupId

        # Autoriser port 3020
        aws ec2 authorize-security-group-ingress --group-id $sgId --protocol tcp --port 3020 --cidr 0.0.0.0/0 --region $AWS_REGION
        Write-Host "  Security Group cree: $sgId" -ForegroundColor Green
    }

    # Creer le service
    aws ecs create-service `
        --cluster $ECS_CLUSTER `
        --service-name $ECS_SERVICE `
        --task-definition $TASK_FAMILY `
        --desired-count 1 `
        --launch-type FARGATE `
        --network-configuration "awsvpcConfiguration={subnets=[$subnetIds],securityGroups=[$sgId],assignPublicIp=ENABLED}" `
        --region $AWS_REGION

    Write-Host "  Service cree!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Attente de la stabilisation du service..." -ForegroundColor Yellow
aws ecs wait services-stable --cluster $ECS_CLUSTER --services $ECS_SERVICE --region $AWS_REGION

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "DEPLOIEMENT TERMINE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Obtenir l'IP publique
Write-Host "Recuperation de l'IP publique..." -ForegroundColor Yellow
$tasks = aws ecs list-tasks --cluster $ECS_CLUSTER --service-name $ECS_SERVICE --region $AWS_REGION --output json | ConvertFrom-Json
if ($tasks.taskArns.Count -gt 0) {
    $taskArn = $tasks.taskArns[0]
    $task = aws ecs describe-tasks --cluster $ECS_CLUSTER --tasks $taskArn --region $AWS_REGION --output json | ConvertFrom-Json

    $eniId = ($task.tasks[0].attachments[0].details | Where-Object { $_.name -eq "networkInterfaceId" }).value
    $eni = aws ec2 describe-network-interfaces --network-interface-ids $eniId --region $AWS_REGION --output json | ConvertFrom-Json
    $publicIp = $eni.NetworkInterfaces[0].Association.PublicIp

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "INFORMATIONS DU SERVICE" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Backend URL: http://$publicIp:3020" -ForegroundColor Green
    Write-Host "Health Check: http://$publicIp:3020/health" -ForegroundColor Green
    Write-Host ""
    Write-Host "Testez maintenant:" -ForegroundColor Yellow
    Write-Host "  curl http://$publicIp:3020/health" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Prochaine etape: Deployer sur Vercel avec cette URL:" -ForegroundColor Yellow
    Write-Host "  NEXT_PUBLIC_API_URL=http://$publicIp:3020" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "Aucune task en cours d'execution" -ForegroundColor Yellow
}

Write-Host "Logs disponibles:" -ForegroundColor Yellow
Write-Host "  aws logs tail /ecs/$TASK_FAMILY --follow --region $AWS_REGION" -ForegroundColor Cyan
Write-Host ""
