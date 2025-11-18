# 🚀 Guide Rapide de Déploiement AWS - Client Onboarding

**Service** : Client Onboarding RT-Technologie
**Date** : 18 Novembre 2025
**Méthode** : AWS ECS Fargate (Docker)

---

## 📋 Prérequis

### Outils Nécessaires

```bash
# Installer AWS CLI
# Windows (via Chocolatey)
choco install awscli

# Vérifier l'installation
aws --version

# Installer Docker Desktop
# Télécharger depuis: https://www.docker.com/products/docker-desktop
docker --version
```

### Configuration AWS

```bash
# Configurer vos credentials AWS
aws configure

# Entrées requises:
# AWS Access Key ID: [Votre clé]
# AWS Secret Access Key: [Votre secret]
# Default region name: eu-west-1
# Default output format: json
```

---

## 🎯 Déploiement en 3 Étapes

### Étape 1 : Configuration Infrastructure AWS (1 fois)

```bash
# Se placer à la racine du projet
cd "c:\Users\rtard\OneDrive - RT LOGISTIQUE\RT Technologie\RT-Technologie"

# Rendre le script exécutable (Git Bash ou WSL)
chmod +x scripts/setup-aws-infrastructure.sh

# Exécuter le script
bash scripts/setup-aws-infrastructure.sh
```

**Ce script crée automatiquement :**
- ✅ Repository ECR pour les images Docker
- ✅ Cluster ECS Fargate
- ✅ Groupes de logs CloudWatch
- ✅ Rôles IAM nécessaires
- ✅ Groupes de sécurité

**⚠️ Important** : Notez votre `AWS_ACCOUNT_ID` affiché à la fin du script.

---

### Étape 2 : Configuration des Secrets (1 fois)

```bash
# Configurer les secrets dans AWS Secrets Manager
bash scripts/setup-aws-secrets.sh
```

**Ce script copie automatiquement :**
- MongoDB URI
- JWT Secret
- Session Secret
- SMTP credentials (Mailgun)

**Vérification** :
```bash
# Lister les secrets créés
aws secretsmanager list-secrets --region eu-west-1 | grep rt/client-onboarding
```

---

### Étape 3 : Déploiement du Service

#### A. Mise à jour des IDs

**Éditer** `scripts/deploy-aws-ecs.sh` :
```bash
AWS_ACCOUNT_ID="VOTRE_ACCOUNT_ID"  # Ligne 12
```

**Éditer** `infra/aws/ecs-task-definition.json` :
```json
"executionRoleArn": "arn:aws:iam::VOTRE_ACCOUNT_ID:role/ecsTaskExecutionRole",
"taskRoleArn": "arn:aws:iam::VOTRE_ACCOUNT_ID:role/ecsTaskRole",
"image": "VOTRE_ACCOUNT_ID.dkr.ecr.eu-west-1.amazonaws.com/rt-client-onboarding:latest"
```

#### B. Déploiement

```bash
# Lancer le déploiement
bash scripts/deploy-aws-ecs.sh
```

**Le script effectue automatiquement :**
1. Build de l'image Docker
2. Push vers ECR
3. Enregistrement de la task definition
4. Déploiement sur ECS Fargate
5. Attente de la stabilisation du service

**Durée estimée** : 5-10 minutes

---

## 🔍 Vérification du Déploiement

### Health Check

```bash
# Récupérer l'IP publique du service
aws ecs describe-tasks \
  --cluster rt-production \
  --tasks $(aws ecs list-tasks --cluster rt-production --service-name client-onboarding --query 'taskArns[0]' --output text) \
  --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' \
  --output text

# Tester le health check
curl http://<IP_PUBLIQUE>:3020/health
```

### Logs en Temps Réel

```bash
# Voir les logs du service
aws logs tail /ecs/rt-client-onboarding --follow --region eu-west-1
```

### Statut du Service

```bash
# Vérifier le statut ECS
aws ecs describe-services \
  --cluster rt-production \
  --services client-onboarding \
  --region eu-west-1 \
  --query 'services[0].[serviceName,status,runningCount,desiredCount]' \
  --output table
```

---

## 🔄 Redéploiement (Mises à jour)

Pour déployer une nouvelle version :

```bash
# Simplement relancer le script
bash scripts/deploy-aws-ecs.sh
```

Le script :
- Reconstruit l'image Docker
- Crée un nouveau tag avec date/heure
- Force un nouveau déploiement
- Zero-downtime deployment (rolling update)

---

## 📊 Monitoring

### CloudWatch Dashboard

```bash
# Accéder aux métriques
# Console AWS > CloudWatch > Dashboards
```

**Métriques clés à surveiller :**
- CPU Utilization
- Memory Utilization
- Request Count
- Response Time

### Alarmes CloudWatch

```bash
# Créer une alarme pour CPU élevé
aws cloudwatch put-metric-alarm \
  --alarm-name rt-client-onboarding-high-cpu \
  --alarm-description "CPU utilization > 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --region eu-west-1
```

---

## 🌐 Configuration Load Balancer (Optionnel)

Pour exposer le service sur un domaine public :

### 1. Créer un Application Load Balancer

```bash
# Via la console AWS ou CLI
aws elbv2 create-load-balancer \
  --name rt-client-onboarding-alb \
  --subnets subnet-xxx subnet-yyy \
  --security-groups sg-xxx \
  --region eu-west-1
```

### 2. Créer un Target Group

```bash
aws elbv2 create-target-group \
  --name rt-client-onboarding-tg \
  --protocol HTTP \
  --port 3020 \
  --vpc-id vpc-xxx \
  --target-type ip \
  --health-check-path /health \
  --region eu-west-1
```

### 3. Mettre à jour le Service ECS

Ajouter la configuration Load Balancer dans `ecs-task-definition.json` :

```json
{
  "loadBalancers": [
    {
      "targetGroupArn": "arn:aws:elasticloadbalancing:...",
      "containerName": "client-onboarding",
      "containerPort": 3020
    }
  ]
}
```

### 4. Configurer le DNS

```bash
# Route 53 - Créer un enregistrement A
aws route53 change-resource-record-sets \
  --hosted-zone-id Z123456 \
  --change-batch file://dns-record.json
```

**dns-record.json** :
```json
{
  "Changes": [{
    "Action": "CREATE",
    "ResourceRecordSet": {
      "Name": "onboarding.rt-technologie.com",
      "Type": "A",
      "AliasTarget": {
        "HostedZoneId": "Z123456",
        "DNSName": "rt-client-onboarding-alb-xxx.eu-west-1.elb.amazonaws.com",
        "EvaluateTargetHealth": false
      }
    }
  }]
}
```

### 5. SSL/TLS avec ACM

```bash
# Demander un certificat
aws acm request-certificate \
  --domain-name onboarding.rt-technologie.com \
  --validation-method DNS \
  --region eu-west-1

# Ajouter le certificat au Load Balancer
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:... \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=arn:aws:acm:... \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:...
```

---

## 💰 Estimation des Coûts

### Configuration Initiale

| Service | Configuration | Coût Mensuel |
|---------|--------------|--------------|
| **ECS Fargate** | 0.5 vCPU, 1 GB RAM | ~$15 |
| **ECR** | 1 GB stockage | ~$0.10 |
| **CloudWatch Logs** | 5 GB/mois | ~$2.50 |
| **Secrets Manager** | 8 secrets | ~$3.20 |
| **ALB** (optionnel) | Standard | ~$16 |
| **Route 53** (optionnel) | 1 hosted zone | ~$0.50 |

**Total estimé (sans ALB)** : ~$21/mois
**Total estimé (avec ALB)** : ~$38/mois

### Optimisation des Coûts

```bash
# Utiliser Fargate Spot (économie 70%)
# Modifier ecs-task-definition.json
{
  "capacityProviderStrategy": [{
    "capacityProvider": "FARGATE_SPOT",
    "weight": 100
  }]
}
```

---

## 🛠️ Dépannage

### Service ne démarre pas

```bash
# Voir les logs d'erreur
aws logs tail /ecs/rt-client-onboarding --since 10m --region eu-west-1

# Vérifier les tasks arrêtées
aws ecs list-tasks \
  --cluster rt-production \
  --desired-status STOPPED \
  --region eu-west-1
```

### Problème de connexion MongoDB

```bash
# Vérifier le secret MongoDB
aws secretsmanager get-secret-value \
  --secret-id rt/client-onboarding/mongodb-uri \
  --region eu-west-1

# Tester depuis le conteneur
aws ecs execute-command \
  --cluster rt-production \
  --task <TASK_ID> \
  --container client-onboarding \
  --interactive \
  --command "/bin/sh"
```

### Image Docker ne se push pas

```bash
# Reconnecter à ECR
aws ecr get-login-password --region eu-west-1 | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.eu-west-1.amazonaws.com

# Vérifier les permissions
aws ecr get-repository-policy --repository-name rt-client-onboarding --region eu-west-1
```

---

## 📚 Commandes Utiles

### Gestion du Service

```bash
# Scaler le service (augmenter les instances)
aws ecs update-service \
  --cluster rt-production \
  --service client-onboarding \
  --desired-count 2 \
  --region eu-west-1

# Arrêter le service
aws ecs update-service \
  --cluster rt-production \
  --service client-onboarding \
  --desired-count 0 \
  --region eu-west-1

# Supprimer le service
aws ecs delete-service \
  --cluster rt-production \
  --service client-onboarding \
  --force \
  --region eu-west-1
```

### Nettoyage Complet

```bash
# Supprimer tout l'infrastructure
aws ecs delete-service --cluster rt-production --service client-onboarding --force --region eu-west-1
aws ecs delete-cluster --cluster rt-production --region eu-west-1
aws ecr delete-repository --repository-name rt-client-onboarding --force --region eu-west-1
aws logs delete-log-group --log-group-name /ecs/rt-client-onboarding --region eu-west-1

# Supprimer les secrets
aws secretsmanager delete-secret --secret-id rt/client-onboarding/mongodb-uri --force-delete-without-recovery --region eu-west-1
```

---

## ✅ Checklist de Déploiement

### Avant le déploiement

- [ ] AWS CLI installé et configuré
- [ ] Docker Desktop installé
- [ ] Compte AWS avec permissions IAM appropriées
- [ ] MongoDB Atlas accessible depuis AWS
- [ ] Credentials Mailgun valides
- [ ] AWS_ACCOUNT_ID récupéré

### Pendant le déploiement

- [ ] Infrastructure AWS créée (`setup-aws-infrastructure.sh`)
- [ ] Secrets configurés (`setup-aws-secrets.sh`)
- [ ] IDs mis à jour dans les scripts
- [ ] Déploiement réussi (`deploy-aws-ecs.sh`)
- [ ] Service ECS en statut RUNNING

### Après le déploiement

- [ ] Health check accessible
- [ ] Logs CloudWatch fonctionnels
- [ ] Test vérification TVA OK
- [ ] Test génération PDF OK
- [ ] Monitoring configuré
- [ ] Alarmes CloudWatch créées

---

## 📞 Support

**Documentation complète** : [AWS_DEPLOYMENT_GUIDE.md](AWS_DEPLOYMENT_GUIDE.md)
**Scripts** : `scripts/deploy-aws-ecs.sh`, `scripts/setup-aws-infrastructure.sh`
**Configuration** : `infra/aws/ecs-task-definition.json`

---

**Déployé avec succès** ✅
**Prêt pour la production** 🚀
