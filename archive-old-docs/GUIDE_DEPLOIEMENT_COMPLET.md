# 🚀 Guide de Déploiement Complet - RT-Technologie

## Vue d'ensemble

Ce guide décrit le déploiement complet de la plateforme RT-Technologie :
- **Backend** : Services Node.js sur AWS ECS Fargate (eu-central-1)
- **Frontend** : Applications Next.js sur Vercel
- **Base de données** : MongoDB Atlas

---

## 📋 Prérequis

### 1. Comptes et accès
- [x] Compte AWS (ID: 004843574253)
- [x] Token Vercel : `79eVweIfP4CXv9dGDuDRS5hz`
- [x] MongoDB Atlas URI configuré dans AWS Secrets Manager
- [x] Clés API OpenAI pour les services IA

### 2. Configuration AWS
- **Région** : eu-central-1 (Frankfurt)
- **VPC** : vpc-0d84de1ac867982db
- **Security Group** : sg-0add3ac473775825a
- **Subnets** :
  - subnet-0cce60a3fe31c0d9e
  - subnet-0a6a2f8fd776906ee

### 3. Secrets AWS Secrets Manager
Les secrets suivants doivent être créés dans AWS Secrets Manager :
- `rt/mongodb/uri` - URI de connexion MongoDB
- `rt/jwt/secret` - Secret pour les JWT
- `rt/smtp/user` - Utilisateur SMTP
- `rt/smtp/password` - Mot de passe SMTP
- `rt/openai/key` - Clé API OpenAI

---

## 🏗️ Architecture des Services

### Services Backend (AWS ECS)

| Service | Port | Description | Dockerfile |
|---------|------|-------------|-----------|
| `client-onboarding` | 3020 | Onboarding client avec vérification TVA | ✅ |
| `core-orders` | 3030 | Gestion des commandes et dispatch | ✅ |
| `affret-ia` | 3010 | IA pour optimisation affretement | ✅ |
| `vigilance` | 3040 | Scoring et vigilance transporteurs | ✅ |

### Applications Frontend (Vercel)

| Application | Description | Port local |
|-------------|-------------|-----------|
| `marketing-site` | Site vitrine et onboarding | 3000 |
| `web-industry` | Interface industriels | 3010 |
| `backoffice-admin` | Backoffice administrateur | 3000 |
| `web-logistician` | Interface logisticiens | 3011 |
| `web-transporter` | Interface transporteurs | 3012 |

---

## 🚢 Déploiement Backend sur AWS

### Option 1 : Script automatique (Recommandé)

#### Étape 1 : Ouvrir AWS CloudShell
1. Connectez-vous à la console AWS
2. Ouvrez CloudShell (icône >_ en haut à droite)
3. Assurez-vous d'être dans la région **eu-central-1**

#### Étape 2 : Uploader le projet
```bash
# Dans CloudShell, créer un dossier pour le projet
mkdir -p ~/rt-deployment
cd ~/rt-deployment

# Option A : Cloner depuis GitHub (si disponible)
git clone <votre-repo-github> RT-Technologie

# Option B : Upload manuel
# Utilisez Actions > Upload file dans CloudShell pour uploader:
# - Le dossier complet ou une archive .zip
```

#### Étape 3 : Lancer le déploiement
```bash
cd RT-Technologie

# Rendre le script exécutable
chmod +x infra/deploy-all-services-aws.sh

# Lancer le déploiement
./infra/deploy-all-services-aws.sh
```

Le script va automatiquement :
1. ✅ Créer les repositories ECR
2. ✅ Builder les images Docker
3. ✅ Pusher vers ECR
4. ✅ Créer le cluster ECS
5. ✅ Créer les rôles IAM
6. ✅ Déployer les services Fargate
7. ✅ Afficher les IPs publiques

#### Étape 4 : Récupérer les IPs
```bash
# Si besoin de récupérer les IPs plus tard
./infra/get-service-ips.sh
```

Exemple de sortie :
```
========================================
🌐 Adresses IP des services RT-Technologie
========================================

✓ client-onboarding: http://3.79.182.74:3020
✓ core-orders: http://3.75.123.45:3030
✓ affret-ia: http://3.75.234.56:3010
✓ vigilance: http://3.75.345.67:3040
```

### Option 2 : Déploiement manuel service par service

Si vous préférez déployer service par service :

```bash
# 1. Login ECR
aws ecr get-login-password --region eu-central-1 | \
  docker login --username AWS --password-stdin \
  004843574253.dkr.ecr.eu-central-1.amazonaws.com

# 2. Build et push d'un service
SERVICE_NAME="client-onboarding"
docker build -t rt-$SERVICE_NAME:latest -f services/$SERVICE_NAME/Dockerfile .
docker tag rt-$SERVICE_NAME:latest \
  004843574253.dkr.ecr.eu-central-1.amazonaws.com/rt-$SERVICE_NAME:latest
docker push 004843574253.dkr.ecr.eu-central-1.amazonaws.com/rt-$SERVICE_NAME:latest

# 3. Créer la task definition
# Voir les exemples dans infra/deploy-all-services-aws.sh

# 4. Créer le service ECS
aws ecs create-service \
  --cluster rt-technologie-cluster \
  --service-name rt-$SERVICE_NAME-service \
  --task-definition rt-$SERVICE_NAME \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-0cce60a3fe31c0d9e,subnet-0a6a2f8fd776906ee],securityGroups=[sg-0add3ac473775825a],assignPublicIp=ENABLED}" \
  --region eu-central-1
```

---

## 🌐 Déploiement Frontend sur Vercel

### Prérequis
```bash
# Installer Vercel CLI
npm install -g vercel

# Configurer le token
export VERCEL_TOKEN=79eVweIfP4CXv9dGDuDRS5hz
```

### Option 1 : Script automatique

Le script va automatiquement :
1. Récupérer les IPs des services backend
2. Configurer les variables d'environnement
3. Déployer toutes les applications

```bash
chmod +x infra/deploy-frontends-vercel.sh
./infra/deploy-frontends-vercel.sh
```

### Option 2 : Déploiement manuel

Pour déployer une application spécifique :

```bash
# Récupérer les IPs backend
CLIENT_ONBOARDING_IP="3.79.182.74"
CORE_ORDERS_IP="3.75.123.45"
AFFRET_IA_IP="3.75.234.56"
VIGILANCE_IP="3.75.345.67"

# Déployer marketing-site
cd apps/marketing-site
vercel --token=$VERCEL_TOKEN --prod \
  -e NEXT_PUBLIC_API_URL=http://${CLIENT_ONBOARDING_IP}:3020 \
  --name=marketing-site

# Déployer web-industry
cd ../web-industry
vercel --token=$VERCEL_TOKEN --prod \
  -e NEXT_PUBLIC_API_URL=http://${CLIENT_ONBOARDING_IP}:3020 \
  -e NEXT_PUBLIC_ORDERS_API_URL=http://${CORE_ORDERS_IP}:3030 \
  -e NEXT_PUBLIC_AFFRET_API_URL=http://${AFFRET_IA_IP}:3010 \
  -e NEXT_PUBLIC_VIGILANCE_API_URL=http://${VIGILANCE_IP}:3040 \
  --name=web-industry

# Répéter pour les autres applications...
```

---

## ✅ Vérification du Déploiement

### 1. Tester les services backend

```bash
# Client Onboarding
curl http://3.79.182.74:3020/health
# Réponse attendue: {"status":"ok","service":"client-onboarding","port":"3020"}

# Core Orders
curl http://3.75.123.45:3030/health

# Affret IA
curl http://3.75.234.56:3010/health

# Vigilance
curl http://3.75.345.67:3040/health
```

### 2. Tester la vérification TVA

```bash
curl -X POST http://3.79.182.74:3020/api/onboarding/verify-vat \
  -H "Content-Type: application/json" \
  -d '{"vatNumber":"FR21350675567"}'
```

Réponse attendue :
```json
{
  "success": true,
  "data": {
    "valid": true,
    "companyName": "SOC ENTREPRISE TRANSPORT TARDY (SETT)",
    "siren": "350675567",
    "siret": "35067556700050",
    "companyAddress": "1088 AV JEAN FRANCOIS CHAMPOLLION, 38530 38314",
    "source": "API Entreprise (recherche-entreprises)"
  }
}
```

### 3. Vérifier les frontends Vercel

Accédez aux URLs Vercel affichées après le déploiement :
- https://marketing-site-[hash].vercel.app
- https://web-industry-[hash].vercel.app
- etc.

---

## 🔧 Maintenance et Mises à Jour

### Mettre à jour un service backend

```bash
# 1. Modifier le code
# 2. Rebuild et push l'image
cd RT-Technologie
docker build -t rt-client-onboarding:latest -f services/client-onboarding/Dockerfile .
docker tag rt-client-onboarding:latest \
  004843574253.dkr.ecr.eu-central-1.amazonaws.com/rt-client-onboarding:latest
docker push 004843574253.dkr.ecr.eu-central-1.amazonaws.com/rt-client-onboarding:latest

# 3. Forcer le redéploiement
aws ecs update-service \
  --cluster rt-technologie-cluster \
  --service rt-client-onboarding-service \
  --force-new-deployment \
  --region eu-central-1

# 4. Récupérer la nouvelle IP (si elle change)
./infra/get-service-ips.sh
```

### Mettre à jour un frontend

```bash
cd apps/web-industry
vercel --token=$VERCEL_TOKEN --prod
```

---

## 📊 Monitoring et Logs

### Logs CloudWatch

```bash
# Voir les logs d'un service
aws logs tail /ecs/rt-client-onboarding \
  --follow \
  --region eu-central-1
```

### Status des services

```bash
# Lister tous les services
aws ecs list-services \
  --cluster rt-technologie-cluster \
  --region eu-central-1

# Détails d'un service
aws ecs describe-services \
  --cluster rt-technologie-cluster \
  --services rt-client-onboarding-service \
  --region eu-central-1
```

---

## 🆘 Dépannage

### Problème : Service ne démarre pas

```bash
# 1. Vérifier les logs
aws logs tail /ecs/rt-client-onboarding --region eu-central-1

# 2. Vérifier la task definition
aws ecs describe-task-definition \
  --task-definition rt-client-onboarding \
  --region eu-central-1

# 3. Vérifier les secrets
aws secretsmanager get-secret-value \
  --secret-id rt/mongodb/uri \
  --region eu-central-1
```

### Problème : Image Docker trop grosse

Les Dockerfiles utilisent déjà une approche multi-stage avec Alpine Linux.
Si nécessaire, vous pouvez :
- Utiliser `.dockerignore` pour exclure des fichiers
- Réduire les dépendances dans `package.json`

### Problème : Frontend ne se connecte pas au backend

1. Vérifier que les IPs backend sont correctes dans les variables d'environnement Vercel
2. Vérifier le Security Group AWS autorise le port du service
3. Tester le health endpoint du backend directement

---

## 📝 État Actuel du Déploiement

### Services Backend Déployés

| Service | IP | Port | Status |
|---------|-----|------|--------|
| client-onboarding | 3.79.182.74 | 3020 | ✅ Opérationnel |
| core-orders | - | 3030 | ⏳ À déployer |
| affret-ia | - | 3010 | ⏳ À déployer |
| vigilance | - | 3040 | ⏳ À déployer |

### Applications Frontend Déployées

| Application | URL | Status |
|-------------|-----|--------|
| marketing-site | https://marketing-site-h613b2d6c-rt-technologie.vercel.app | ✅ Opérationnel |
| web-industry | - | ⏳ À déployer |
| backoffice-admin | - | ⏳ À déployer |

---

## 🎯 Prochaines Étapes

1. [ ] Déployer les services backend restants (core-orders, affret-ia, vigilance)
2. [ ] Déployer les frontends (web-industry, backoffice-admin)
3. [ ] Configurer un nom de domaine personnalisé (rt-technologie.com)
4. [ ] Mettre en place un Load Balancer pour les services backend
5. [ ] Configurer HTTPS pour les services backend
6. [ ] Mettre en place CI/CD avec GitHub Actions
7. [ ] Ajouter monitoring avec CloudWatch Dashboards
8. [ ] Configurer des alarmes CloudWatch

---

## 📞 Support

Pour toute question ou problème :
- Documentation AWS ECS : https://docs.aws.amazon.com/ecs/
- Documentation Vercel : https://vercel.com/docs
- RT Technologie : contact@rt-technologie.com
