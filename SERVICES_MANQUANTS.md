# 🔴 Services AWS Manquants - À Déployer

**Date :** 2025-11-20
**Status :** 11/21 services déployés

---

## 📊 Situation Actuelle

**Total de services dans le repo :** 21
**Services déployés sur AWS ECS :** 11 (52%)
**Services manquants :** 10 (48%)

---

## ✅ Services Déjà Déployés (11/21)

| Service | URL | Port | Status |
|---------|-----|------|--------|
| admin-gateway | http://3.76.34.154:3000 | 3000 | ✅ Actif |
| authz | http://18.156.174.103:3000 | 3000 | ✅ Actif |
| erp-sync | http://3.70.46.170:3000 | 3000 | ✅ Actif |
| geo-tracking | http://18.199.90.38:3000 | 3000 | ✅ Actif |
| notifications | http://3.122.54.174:3000 | 3000 | ✅ Actif |
| palette | http://63.178.219.102:3000 | 3000 | ✅ Actif |
| planning | http://3.64.192.189:3000 | 3000 | ✅ Actif |
| storage-market | http://35.158.200.161:3000 | 3000 | ✅ Actif |
| tms-sync | http://3.68.186.150:3000 | 3000 | ✅ Actif |
| tracking-ia | http://3.121.234.119:3000 | 3000 | ✅ Actif |
| training | http://18.194.53.124:3000 | 3000 | ✅ Actif |

---

## ❌ Services NON Déployés (10/21)

| Service | Description | Priorité |
|---------|-------------|----------|
| **affret-ia** | IA pour l'affrètement | 🔴 Haute |
| **bourse** | Bourse de fret | 🔴 Haute |
| **chatbot** | Service de chatbot | 🟡 Moyenne |
| **client-onboarding** | Onboarding clients | 🔴 Haute |
| **core-orders** | Gestion des commandes core | 🔴 Haute |
| **ecpmr** | ECPMR (European Certified Professional in Market Research) | 🟢 Basse |
| **pricing-grids** | Grilles tarifaires | 🔴 Haute |
| **vigilance** | Système de vigilance | 🟡 Moyenne |
| **wms-sync** | Synchronisation WMS | 🔴 Haute |

---

## 🚀 Déploiement des Services Manquants

### Option 1 : Script Automatique (AWS CloudShell)

**Durée estimée :** 25-30 minutes

1. **Ouvrir AWS CloudShell :**
   - Allez sur : https://console.aws.amazon.com/cloudshell
   - Région : eu-central-1

2. **Copier le script :**
   ```bash
   cat > deploy-remaining-services.sh << 'SCRIPT'
   # Coller le contenu de deploy-remaining-services.sh
   SCRIPT
   ```

3. **Rendre exécutable et lancer :**
   ```bash
   chmod +x deploy-remaining-services.sh
   ./deploy-remaining-services.sh
   ```

### Option 2 : Déploiement Manuel Service par Service

#### Étape 1 : Build et Push des Images (EC2)

```bash
# Se connecter à l'instance EC2 via SSM
aws ssm start-session --target i-006ba88ded9fb0f20 --region eu-central-1

# Sur l'instance EC2:
cd /home/ec2-user/RT-Technologie
git pull

# Login ECR
aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin 004843574253.dkr.ecr.eu-central-1.amazonaws.com

# Build et push chaque service
for SERVICE in affret-ia bourse chatbot client-onboarding core-orders ecpmr pricing-grids vigilance wms-sync; do
  echo "=== Building $SERVICE ==="

  # Créer le repository ECR si nécessaire
  aws ecr describe-repositories --repository-names rt-$SERVICE --region eu-central-1 2>/dev/null || \
  aws ecr create-repository --repository-name rt-$SERVICE --region eu-central-1

  # Build
  docker build -t rt-$SERVICE:latest -f services/$SERVICE/Dockerfile .

  # Tag
  docker tag rt-$SERVICE:latest 004843574253.dkr.ecr.eu-central-1.amazonaws.com/rt-$SERVICE:latest

  # Push
  docker push 004843574253.dkr.ecr.eu-central-1.amazonaws.com/rt-$SERVICE:latest

  echo "✅ $SERVICE pushed"
done
```

#### Étape 2 : Créer les Task Definitions (CloudShell ou local)

```bash
REGION="eu-central-1"
ACCOUNT_ID="004843574253"

for SERVICE in affret-ia bourse chatbot client-onboarding core-orders ecpmr pricing-grids vigilance wms-sync; do
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
    --region $REGION

  echo "✅ Task definition pour $SERVICE créée"
done
```

#### Étape 3 : Déployer les Services ECS

```bash
CLUSTER="rt-production"
SUBNET="subnet-0cce60a3fe31c0d9e"
SECURITY_GROUP="sg-069ac5d7a0ae591b7"

for SERVICE in affret-ia bourse chatbot client-onboarding core-orders ecpmr pricing-grids vigilance wms-sync; do
  echo "🚀 Déploiement de rt-$SERVICE..."

  aws ecs create-service \
    --cluster $CLUSTER \
    --service-name rt-$SERVICE \
    --task-definition rt-$SERVICE \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[$SUBNET],securityGroups=[$SECURITY_GROUP],assignPublicIp=ENABLED}" \
    --region $REGION

  echo "✅ Service rt-$SERVICE déployé"
  sleep 2
done
```

#### Étape 4 : Récupérer les IPs Publiques

Attendre 2-3 minutes que les services démarrent, puis :

```bash
for SERVICE in affret-ia bourse chatbot client-onboarding core-orders ecpmr pricing-grids vigilance wms-sync; do
  echo "🔍 rt-$SERVICE..."

  # Récupérer l'ARN de la tâche
  TASK_ARN=$(aws ecs list-tasks \
    --cluster rt-production \
    --service-name rt-$SERVICE \
    --region eu-central-1 \
    --output text \
    --query 'taskArns[0]')

  # Récupérer l'ENI
  ENI=$(aws ecs describe-tasks \
    --cluster rt-production \
    --tasks $TASK_ARN \
    --region eu-central-1 \
    --output text \
    --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value')

  # Récupérer l'IP publique
  PUBLIC_IP=$(aws ec2 describe-network-interfaces \
    --network-interface-ids $ENI \
    --region eu-central-1 \
    --output text \
    --query 'NetworkInterfaces[0].Association.PublicIp')

  echo "  ✅ http://$PUBLIC_IP:3000"
done
```

---

## 📋 Vérification Post-Déploiement

### Vérifier tous les services

```bash
aws ecs list-services --cluster rt-production --region eu-central-1
```

### Voir le statut détaillé

```bash
aws ecs describe-services \
  --cluster rt-production \
  --services $(aws ecs list-services --cluster rt-production --region eu-central-1 --query 'serviceArns' --output text) \
  --region eu-central-1 \
  --query 'services[].[serviceName,status,runningCount,desiredCount]' \
  --output table
```

### Voir les logs d'un service

```bash
aws logs tail /ecs/rt-SERVICE_NAME --follow --region eu-central-1
```

---

## 🔗 Impact sur les Frontends

Une fois les 10 services déployés, il faudra ajouter leurs URLs dans les variables d'environnement Vercel :

```env
# Nouveaux services
NEXT_PUBLIC_AFFRET_IA_URL=http://[IP]:3000
NEXT_PUBLIC_BOURSE_URL=http://[IP]:3000
NEXT_PUBLIC_CHATBOT_URL=http://[IP]:3000
NEXT_PUBLIC_CLIENT_ONBOARDING_URL=http://[IP]:3000
NEXT_PUBLIC_CORE_ORDERS_URL=http://[IP]:3000
NEXT_PUBLIC_ECPMR_URL=http://[IP]:3000
NEXT_PUBLIC_PRICING_GRIDS_URL=http://[IP]:3000
NEXT_PUBLIC_VIGILANCE_URL=http://[IP]:3000
NEXT_PUBLIC_WMS_SYNC_URL=http://[IP]:3000
```

---

## 💰 Coûts AWS Estimés

**Configuration actuelle (11 services) :**
- 11 services × $0.04/heure (Fargate 256 CPU / 512 MB)
- ~$0.44/heure
- ~$320/mois

**Avec 21 services :**
- 21 services × $0.04/heure
- ~$0.84/heure
- ~$600/mois

**Recommandation :** Envisager un Load Balancer ($16/mois) pour mutualiser les IPs et activer HTTPS.

---

## ✅ Checklist de Déploiement

- [ ] Build et push des 10 images Docker vers ECR
- [ ] Création des 10 task definitions ECS
- [ ] Déploiement des 10 services sur le cluster rt-production
- [ ] Récupération des 10 IPs publiques
- [ ] Mise à jour du fichier RECAPITULATIF_DEPLOIEMENT.md
- [ ] Configuration des variables d'environnement Vercel
- [ ] Test de connectivité pour chaque nouveau service
- [ ] Configuration CORS sur les nouveaux services
- [ ] Monitoring CloudWatch activé

---

**Priorité :** 🔴 HAUTE - Ces services sont essentiels pour le fonctionnement complet de la plateforme

**Temps estimé total :** 30-40 minutes

---

**Dernière mise à jour :** 2025-11-20 09:20 UTC
