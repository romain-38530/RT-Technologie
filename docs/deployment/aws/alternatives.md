# 🔧 Alternative de Déploiement AWS - Sans EC2

**Problème :** L'instance EC2 `i-006ba88ded9fb0f20` n'est plus accessible ou dans un état invalide.

**Solution :** Déployer directement depuis AWS CloudShell en utilisant Docker buildx avec émulation.

---

## 📋 Méthode Alternative : Build Direct dans CloudShell

### Option 1 : Utiliser AWS CodeBuild (Recommandé)

AWS CodeBuild peut builder les images Docker directement depuis le repository GitHub.

**Étape 1 : Créer un buildspec.yml**

Dans CloudShell, créez ce fichier :

```bash
cat > buildspec.yml << 'EOF'
version: 0.2

phases:
  pre_build:
    commands:
      - echo Logging in to Amazon ECR...
      - aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin 004843574253.dkr.ecr.eu-central-1.amazonaws.com
      - SERVICES="affret-ia bourse chatbot client-onboarding core-orders ecpmr pricing-grids vigilance wms-sync"

  build:
    commands:
      - echo Build started on `date`
      - |
        for SERVICE in $SERVICES; do
          echo "Building $SERVICE..."

          # Create ECR repo if not exists
          aws ecr describe-repositories --repository-names rt-$SERVICE --region eu-central-1 2>/dev/null || \
          aws ecr create-repository --repository-name rt-$SERVICE --region eu-central-1

          # Build
          docker build -t rt-$SERVICE:latest -f services/$SERVICE/Dockerfile .

          # Tag
          docker tag rt-$SERVICE:latest 004843574253.dkr.ecr.eu-central-1.amazonaws.com/rt-$SERVICE:latest

          # Push
          docker push 004843574253.dkr.ecr.eu-central-1.amazonaws.com/rt-$SERVICE:latest

          echo "✓ $SERVICE completed"
        done

  post_build:
    commands:
      - echo Build completed on `date`
EOF
```

**Étape 2 : Créer le projet CodeBuild**

```bash
aws codebuild create-project \
  --name rt-services-builder \
  --source type=GITHUB,location=https://github.com/romain-38530/RT-Technologie.git,buildspec=buildspec.yml \
  --artifacts type=NO_ARTIFACTS \
  --environment type=LINUX_CONTAINER,image=aws/codebuild/standard:7.0,computeType=BUILD_GENERAL1_LARGE,privilegedMode=true \
  --service-role arn:aws:iam::004843574253:role/codebuild-service-role \
  --region eu-central-1
```

**Étape 3 : Lancer le build**

```bash
aws codebuild start-build \
  --project-name rt-services-builder \
  --source-version dockerfile \
  --region eu-central-1
```

---

### Option 2 : Déployer depuis les Images Existantes (Plus Rapide)

Si certaines images ont déjà été buildées, on peut juste créer les services ECS directement.

**Vérifier les images disponibles dans ECR :**

```bash
echo "Images disponibles dans ECR:"
for SERVICE in affret-ia bourse chatbot client-onboarding core-orders ecpmr pricing-grids vigilance wms-sync; do
  aws ecr describe-images \
    --repository-name rt-$SERVICE \
    --region eu-central-1 \
    --query 'imageDetails[0].imageTags[0]' \
    --output text 2>/dev/null && echo "✓ rt-$SERVICE: OK" || echo "✗ rt-$SERVICE: MANQUANT"
done
```

**Pour les images qui existent, créer directement les services :**

```bash
#!/bin/bash

REGION="eu-central-1"
ACCOUNT_ID="004843574253"
CLUSTER="rt-production"
SUBNET="subnet-0cce60a3fe31c0d9e"
SECURITY_GROUP="sg-069ac5d7a0ae591b7"

SERVICES=(
  "affret-ia"
  "bourse"
  "chatbot"
  "client-onboarding"
  "core-orders"
  "ecpmr"
  "pricing-grids"
  "vigilance"
  "wms-sync"
)

echo "========================================================================"
echo "CREATION DES SERVICES ECS (sans rebuild)"
echo "========================================================================"

for SERVICE in "${SERVICES[@]}"; do
  echo ""
  echo "Service: rt-$SERVICE"

  # Vérifier si l'image existe
  IMAGE_EXISTS=$(aws ecr describe-images \
    --repository-name rt-$SERVICE \
    --region $REGION \
    --query 'imageDetails[0].imageTags[0]' \
    --output text 2>/dev/null)

  if [ -z "$IMAGE_EXISTS" ] || [ "$IMAGE_EXISTS" = "None" ]; then
    echo "  ✗ Image manquante, skip"
    continue
  fi

  echo "  ✓ Image existe"

  # Créer task definition
  cat > /tmp/task-def-$SERVICE.json << EOF
{
  "family": "rt-$SERVICE",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::$ACCOUNT_ID:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "rt-$SERVICE",
      "image": "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/rt-$SERVICE:latest",
      "essential": true,
      "portMappings": [{"containerPort": 3000, "protocol": "tcp"}],
      "environment": [
        {"name": "NODE_ENV", "value": "production"},
        {"name": "PORT", "value": "3000"}
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/rt-$SERVICE",
          "awslogs-region": "$REGION",
          "awslogs-stream-prefix": "ecs",
          "awslogs-create-group": "true"
        }
      }
    }
  ]
}
EOF

  aws ecs register-task-definition \
    --cli-input-json file:///tmp/task-def-$SERVICE.json \
    --region $REGION > /dev/null

  echo "  ✓ Task definition créée"

  # Créer le service
  aws ecs create-service \
    --cluster $CLUSTER \
    --service-name rt-$SERVICE \
    --task-definition rt-$SERVICE \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[$SUBNET],securityGroups=[$SECURITY_GROUP],assignPublicIp=ENABLED}" \
    --region $REGION > /dev/null 2>&1

  if [ $? -eq 0 ]; then
    echo "  ✓ Service créé"
  else
    echo "  ⚠ Service existe déjà ou erreur"
  fi

  sleep 2
done

echo ""
echo "Attente du démarrage des services (2 minutes)..."
sleep 120

# Récupérer les IPs
echo ""
echo "========================================================================"
echo "IPS PUBLIQUES"
echo "========================================================================"

for SERVICE in "${SERVICES[@]}"; do
  TASK_ARN=$(aws ecs list-tasks \
    --cluster $CLUSTER \
    --service-name rt-$SERVICE \
    --region $REGION \
    --output text \
    --query 'taskArns[0]' 2>/dev/null)

  if [ ! -z "$TASK_ARN" ] && [ "$TASK_ARN" != "None" ]; then
    ENI=$(aws ecs describe-tasks \
      --cluster $CLUSTER \
      --tasks $TASK_ARN \
      --region $REGION \
      --output text \
      --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' 2>/dev/null)

    if [ ! -z "$ENI" ]; then
      PUBLIC_IP=$(aws ec2 describe-network-interfaces \
        --network-interface-ids $ENI \
        --region $REGION \
        --output text \
        --query 'NetworkInterfaces[0].Association.PublicIp' 2>/dev/null)

      if [ ! -z "$PUBLIC_IP" ]; then
        echo "rt-$SERVICE: http://$PUBLIC_IP:3000"
      fi
    fi
  fi
done

echo ""
echo "========================================================================"
echo "TERMINE"
echo "========================================================================"
```

---

### Option 3 : Nouvelle Instance EC2 avec Docker (Si nécessaire)

Si vous devez absolument utiliser EC2 pour le build :

```bash
# Créer une nouvelle instance temporaire
INSTANCE_ID=$(aws ec2 run-instances \
  --image-id ami-0084a47cc718c111a \
  --instance-type t3.medium \
  --key-name YOUR_KEY \
  --security-group-ids sg-069ac5d7a0ae591b7 \
  --subnet-id subnet-0cce60a3fe31c0d9e \
  --iam-instance-profile Name=ecsInstanceRole \
  --user-data '#!/bin/bash
yum update -y
yum install -y docker git
systemctl start docker
systemctl enable docker
amazon-linux-extras install -y amazon-ssm-agent
' \
  --region eu-central-1 \
  --query 'Instances[0].InstanceId' \
  --output text)

echo "Nouvelle instance: $INSTANCE_ID"
echo "Attente de 3 minutes pour que l'instance soit prête..."
sleep 180

# Utiliser cette nouvelle instance pour les builds
```

---

## 🎯 Recommandation

**Utilisez l'Option 2** en premier :

1. Vérifiez quelles images existent déjà dans ECR
2. Créez les services ECS pour les images existantes
3. Pour les images manquantes, utilisez CodeBuild (Option 1)

---

## ⚡ Script Rapide à Exécuter Maintenant

Copiez-collez ceci dans CloudShell :

```bash
# Vérifier les images existantes
echo "=== Vérification des images ECR ==="
for SERVICE in affret-ia bourse chatbot client-onboarding core-orders ecpmr pricing-grids vigilance wms-sync; do
  aws ecr describe-images --repository-name rt-$SERVICE --region eu-central-1 --query 'imageDetails[0].imageTags[0]' --output text 2>/dev/null && echo "✓ rt-$SERVICE" || echo "✗ rt-$SERVICE"
done
```

Envoyez-moi le résultat pour que je sache quelles images existent et je vous donnerai la suite des commandes adaptées.

---

**Dernière mise à jour :** 2025-11-20 10:00 UTC
