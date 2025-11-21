# 🔗 Connexion Permanente à CloudShell

Pour permettre une connexion permanente et un pilotage automatique de CloudShell, voici les solutions possibles :

---

## 🎯 Solution 1 : AWS Systems Manager Session Manager (RECOMMANDÉE)

### Principe
- Créer une instance EC2 avec Session Manager
- Y installer Docker et AWS CLI
- Je peux exécuter des commandes via AWS SSM
- Logs en temps réel via CloudWatch

### Mise en place (5 minutes)

```bash
# Dans CloudShell, exécutez ce script :
cat > ~/setup-permanent-connection.sh << 'EOF'
#!/bin/bash

REGION="eu-central-1"
ACCOUNT_ID="004843574253"
SECURITY_GROUP_ID="sg-0add3ac473775825a"
SUBNET_ID="subnet-0cce60a3fe31c0d9e"

echo "🔧 Création d'une instance EC2 pour déploiement permanent..."

# Créer un rôle IAM pour l'instance
cat > /tmp/trust-policy.json << 'TRUST'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "ec2.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}
TRUST

# Créer le rôle
aws iam create-role \
  --role-name RT-DeploymentInstance \
  --assume-role-policy-document file:///tmp/trust-policy.json \
  --region $REGION 2>/dev/null || echo "Rôle existe déjà"

# Attacher les policies nécessaires
aws iam attach-role-policy \
  --role-name RT-DeploymentInstance \
  --policy-arn arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore

aws iam attach-role-policy \
  --role-name RT-DeploymentInstance \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser

aws iam attach-role-policy \
  --role-name RT-DeploymentInstance \
  --policy-arn arn:aws:iam::aws:policy/AmazonECS_FullAccess

# Créer le profil d'instance
aws iam create-instance-profile \
  --instance-profile-name RT-DeploymentInstance 2>/dev/null || echo "Profil existe déjà"

aws iam add-role-to-instance-profile \
  --instance-profile-name RT-DeploymentInstance \
  --role-name RT-DeploymentInstance 2>/dev/null || true

echo "⏳ Attente de la propagation IAM (10s)..."
sleep 10

# User data pour installer Docker
cat > /tmp/userdata.sh << 'USERDATA'
#!/bin/bash
yum update -y
yum install -y docker git
systemctl start docker
systemctl enable docker
usermod -aG docker ec2-user

# Installer AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
./aws/install

# Créer un script de déploiement
cat > /home/ec2-user/deploy.sh << 'DEPLOY'
#!/bin/bash
cd /home/ec2-user
git clone -b dockerfile https://github.com/romain-38530/RT-Technologie.git
cd RT-Technologie
# Exécuter le déploiement
DEPLOY

chmod +x /home/ec2-user/deploy.sh
chown ec2-user:ec2-user /home/ec2-user/deploy.sh
USERDATA

# Créer l'instance EC2
INSTANCE_ID=$(aws ec2 run-instances \
  --region $REGION \
  --image-id $(aws ec2 describe-images \
    --owners amazon \
    --filters "Name=name,Values=amzn2-ami-hvm-*-x86_64-gp2" \
    --query 'Images | sort_by(@, &CreationDate) | [-1].ImageId' \
    --output text) \
  --instance-type t3.medium \
  --iam-instance-profile Name=RT-DeploymentInstance \
  --security-group-ids $SECURITY_GROUP_ID \
  --subnet-id $SUBNET_ID \
  --user-data file:///tmp/userdata.sh \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=RT-DeploymentInstance}]' \
  --query 'Instances[0].InstanceId' \
  --output text)

echo ""
echo "✅ Instance créée: $INSTANCE_ID"
echo ""
echo "⏳ Attente du démarrage (60s)..."
sleep 60

echo ""
echo "🎉 INSTANCE PRÊTE !"
echo ""
echo "📝 Pour vous connecter via Session Manager:"
echo "   aws ssm start-session --target $INSTANCE_ID --region $REGION"
echo ""
echo "📝 Pour exécuter une commande à distance:"
echo "   aws ssm send-command \\"
echo "     --instance-ids $INSTANCE_ID \\"
echo "     --document-name \"AWS-RunShellScript\" \\"
echo "     --parameters 'commands=[\"echo Hello\"]' \\"
echo "     --region $REGION"
echo ""
echo "💰 Coût: ~0.04$/heure (t3.medium)"
EOF

chmod +x ~/setup-permanent-connection.sh
~/setup-permanent-connection.sh
```

---

## 🎯 Solution 2 : WebSocket API Gateway (Temps réel)

### Principe
- Créer une API Gateway WebSocket
- Lambda qui exécute des commandes dans CloudShell
- Communication bidirectionnelle en temps réel

### Mise en place

```bash
cat > ~/setup-websocket-api.sh << 'EOF'
#!/bin/bash

REGION="eu-central-1"

echo "🔧 Création API WebSocket..."

# Créer la fonction Lambda
cat > /tmp/lambda-function.py << 'LAMBDA'
import json
import boto3
import subprocess

ssm = boto3.client('ssm')

def lambda_handler(event, context):
    # Recevoir la commande via WebSocket
    command = event['body']

    # Exécuter dans l'instance EC2
    response = ssm.send_command(
        InstanceIds=['i-xxxxx'],  # ID de l'instance
        DocumentName='AWS-RunShellScript',
        Parameters={'commands': [command]}
    )

    return {
        'statusCode': 200,
        'body': json.dumps(response)
    }
LAMBDA

# Package et déploiement Lambda
cd /tmp
zip lambda.zip lambda-function.py

aws lambda create-function \
  --function-name RT-CommandExecutor \
  --runtime python3.9 \
  --role arn:aws:iam::${ACCOUNT_ID}:role/RT-LambdaRole \
  --handler lambda-function.lambda_handler \
  --zip-file fileb://lambda.zip \
  --region $REGION

# Créer l'API Gateway WebSocket
API_ID=$(aws apigatewayv2 create-api \
  --name RT-WebSocket \
  --protocol-type WEBSOCKET \
  --route-selection-expression '$request.body.action' \
  --region $REGION \
  --query 'ApiId' \
  --output text)

echo "✅ API WebSocket créée: $API_ID"
echo "📝 URL: wss://$API_ID.execute-api.$REGION.amazonaws.com"
EOF

chmod +x ~/setup-websocket-api.sh
```

---

## 🎯 Solution 3 : GitHub Actions avec Self-Hosted Runner (SIMPLE)

### Principe
- Installer un GitHub Actions runner dans CloudShell
- Je push des commandes dans un repo GitHub
- Le runner les exécute automatiquement

### Mise en place (2 minutes)

```bash
# Dans CloudShell
mkdir -p ~/actions-runner && cd ~/actions-runner

# Télécharger le runner
curl -o actions-runner-linux-x64-2.311.0.tar.gz -L \
  https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz

tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz

# Configuration (nécessite un token GitHub)
./config.sh --url https://github.com/romain-38530/RT-Technologie \
  --token VOTRE_TOKEN_GITHUB \
  --name cloudshell-runner \
  --work _work

# Lancer en arrière-plan
nohup ./run.sh &

echo "✅ Runner GitHub Actions démarré"
```

### Créer un workflow

```yaml
# .github/workflows/deploy-command.yml
name: Deploy Command
on:
  workflow_dispatch:
    inputs:
      command:
        description: 'Command to execute'
        required: true

jobs:
  execute:
    runs-on: self-hosted
    steps:
      - name: Execute command
        run: |
          cd ~/RT-Technologie
          ${{ github.event.inputs.command }}
```

---

## 🎯 Solution 4 : AWS CodeBuild avec Webhook (Automatique)

### Principe
- CodeBuild surveille un fichier `commands.txt` dans le repo
- Dès qu'il change, CodeBuild exécute les commandes

```bash
cat > ~/setup-codebuild.sh << 'EOF'
#!/bin/bash

REGION="eu-central-1"
ACCOUNT_ID="004843574253"

# Créer le buildspec
cat > /tmp/buildspec.yml << 'BUILD'
version: 0.2
phases:
  pre_build:
    commands:
      - echo "Lecture des commandes..."
      - cat commands.txt
  build:
    commands:
      - bash commands.txt
  post_build:
    commands:
      - echo "Commandes exécutées"
BUILD

# Créer le projet CodeBuild
aws codebuild create-project \
  --name RT-CommandExecutor \
  --source type=GITHUB,location=https://github.com/romain-38530/RT-Technologie \
  --artifacts type=NO_ARTIFACTS \
  --environment type=LINUX_CONTAINER,image=aws/codebuild/standard:5.0,computeType=BUILD_GENERAL1_MEDIUM \
  --service-role arn:aws:iam::$ACCOUNT_ID:role/CodeBuildServiceRole \
  --region $REGION

# Créer le webhook
aws codebuild create-webhook \
  --project-name RT-CommandExecutor \
  --region $REGION

echo "✅ CodeBuild configuré avec webhook GitHub"
EOF
```

---

## 📊 Comparaison des Solutions

| Solution | Temps réel | Coût/mois | Complexité | Recommandée |
|----------|-----------|-----------|------------|-------------|
| **SSM Session Manager** | ✅ Oui | ~30$ | Moyenne | ⭐⭐⭐⭐⭐ |
| WebSocket API | ✅ Oui | ~5$ | Haute | ⭐⭐⭐ |
| GitHub Actions | ⚠️ 30s delay | Gratuit | Faible | ⭐⭐⭐⭐ |
| CodeBuild Webhook | ⚠️ 1min delay | ~10$ | Moyenne | ⭐⭐⭐⭐ |

---

## 🚀 Recommandation Finale

### Pour une connexion permanente : **Solution 1 (SSM)**

**Avantages:**
- ✅ Connexion temps réel
- ✅ Logs automatiques dans CloudWatch
- ✅ Sécurisé (pas de port SSH ouvert)
- ✅ Je peux exécuter n'importe quelle commande
- ✅ Instance dédiée au déploiement

**Mise en place:**
```bash
# Dans CloudShell
curl -o ~/setup.sh https://raw.githubusercontent.com/romain-38530/RT-Technologie/dockerfile/infra/setup-permanent-connection.sh
bash ~/setup.sh
```

### Pour de l'automatisation simple : **Solution 3 (GitHub Actions)**

**Avantages:**
- ✅ Gratuit
- ✅ Simple à mettre en place
- ✅ Interface GitHub pour déclencher
- ✅ Historique des exécutions

**Mise en place:**
```bash
cd ~/RT-Technologie
mkdir -p .github/workflows
# Copier le workflow ci-dessus
git add . && git commit -m "Add deployment workflow"
git push
```

---

## 🎯 Action Immédiate

**Je vous recommande la Solution 1 (SSM)** car :
1. Instance EC2 t3.medium (~30$/mois)
2. Je peux me connecter en temps réel
3. Tous les outils nécessaires (Docker, AWS CLI, git)
4. Logs automatiques
5. Sécurisé

**Voulez-vous que je vous prépare le script complet pour lancer la Solution 1 ?**

Il créera automatiquement :
- ✅ Instance EC2
- ✅ Rôles IAM
- ✅ Session Manager
- ✅ Environnement de déploiement complet

Coût: **~30$/mois** pour l'instance qui tourne en permanence.
