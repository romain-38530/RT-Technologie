# 🚀 Guide de Déploiement AWS - Service Client Onboarding

**Date** : 18 Novembre 2025
**Service** : Client Onboarding RT-Technologie
**Cible** : Amazon Web Services (AWS)

---

## 📋 Prérequis

### Compte AWS
- ✅ Compte AWS actif
- ✅ Carte de crédit configurée
- ✅ Accès à la console AWS

### Outils Locaux
- ✅ AWS CLI installé
- ✅ Node.js installé
- ✅ Git installé
- ✅ PM2 installé

---

## 🏗️ Architecture AWS Proposée

```
┌─────────────────────────────────────────────────────────────┐
│                      UTILISATEURS                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Route 53 (DNS)                                  │
│          onboarding.rt-technologie.com                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         CloudFront (CDN) + SSL Certificate                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│    Application Load Balancer (ALB)                          │
│              Port 443 (HTTPS)                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              EC2 Instance (t3.micro)                         │
│         Ubuntu 22.04 LTS + Node.js + PM2                    │
│         Service: client-onboarding (Port 3020)               │
└──────────────────────┬──────────────────────────────────────┘
                       │
           ┌───────────┴───────────┐
           │                       │
           ▼                       ▼
┌─────────────────────┐  ┌─────────────────────┐
│   MongoDB Atlas     │  │     Mailgun         │
│   (Déjà configuré)  │  │  (Déjà configuré)   │
└─────────────────────┘  └─────────────────────┘
```

---

## 📦 Option 1 : Déploiement sur EC2 (Recommandé)

### Étape 1 : Créer une Instance EC2

#### 1.1 Connexion AWS Console

1. Allez sur https://console.aws.amazon.com/
2. Région : Sélectionnez **eu-west-1** (Irlande) ou **eu-west-3** (Paris)
3. Service : **EC2**

#### 1.2 Lancer une Instance

```
Nom : rt-technologie-onboarding
AMI : Ubuntu Server 22.04 LTS
Type : t3.micro (1 vCPU, 1 GB RAM) - Éligible free tier
Paire de clés : Créer nouvelle paire "rt-onboarding-key.pem"
Groupe de sécurité : Créer nouveau
  - SSH (22) : Votre IP seulement
  - HTTP (80) : 0.0.0.0/0
  - HTTPS (443) : 0.0.0.0/0
  - Custom (3020) : 0.0.0.0/0 (temporaire pour tests)
Stockage : 20 GB gp3
```

#### 1.3 Configurer Elastic IP (Optionnel mais Recommandé)

```
EC2 > Elastic IPs > Allocate Elastic IP address
Associer à l'instance rt-technologie-onboarding
```

### Étape 2 : Connexion SSH et Configuration Serveur

#### 2.1 Connexion SSH

```bash
# Depuis Windows (PowerShell)
ssh -i "rt-onboarding-key.pem" ubuntu@<ELASTIC_IP>

# Depuis Windows (WSL ou Git Bash)
chmod 400 rt-onboarding-key.pem
ssh -i rt-onboarding-key.pem ubuntu@<ELASTIC_IP>
```

#### 2.2 Installation des Dépendances

```bash
# Mise à jour système
sudo apt update && sudo apt upgrade -y

# Installation Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Vérification
node --version  # v20.x.x
npm --version   # 10.x.x

# Installation PM2
sudo npm install -g pm2

# Installation Git
sudo apt install -y git

# Installation pnpm (optionnel)
sudo npm install -g pnpm
```

### Étape 3 : Déployer le Code

#### 3.1 Cloner le Repository

```bash
# Si repository privé, configurer SSH key ou HTTPS token
git clone https://github.com/rt-technologie/RT-Technologie.git
cd RT-Technologie

# Ou transférer les fichiers via SCP
# Depuis votre machine locale :
scp -i rt-onboarding-key.pem -r services/client-onboarding ubuntu@<ELASTIC_IP>:~/
```

#### 3.2 Configuration du Service

```bash
cd services/client-onboarding

# Installer les dépendances
npm install

# Créer le fichier .env avec vos credentials
cat > .env << 'EOF'
NODE_ENV=production
PORT=3020

# MongoDB Atlas
MONGODB_URI=mongodb+srv://Admin:SETT.38530@stagingrt.v2jnoh2.mongodb.net/rt_technologie?retryWrites=true&w=majority&appName=StagingRT

# Secrets
JWT_SECRET=ab2325974ab77ea4c3892803b09bea2650c9cb5284e2df983ce8ac34c97efeec
INTERNAL_SERVICE_TOKEN=32fdb38dab497f9ad934008bcea6d14327a598bbe8b944742fa49adb4612e2aa
SESSION_SECRET=66ba4605e2901e4e0113065178ee6ce08ff6828f96a000529f7a1134a7f268fa

# SMTP Mailgun
SMTP_HOST=smtp.eu.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@mg.rt-technologie.com
SMTP_PASSWORD=f30e11eb5824d2194c1851bd1c142fbb-e80d8b76-ff2acfa2

# URLs
APP_URL=https://app.rt-technologie.com
EMAIL_FROM=RT Technologie <noreply@rt-technologie.com>
EOF

# Tester le service
npm start
# Ctrl+C pour arrêter
```

#### 3.3 Démarrer avec PM2

```bash
# Démarrer avec PM2
pm2 start ecosystem.config.js

# Sauvegarder la configuration
pm2 save

# Configurer le démarrage automatique
pm2 startup systemd
# Copier et exécuter la commande affichée
```

### Étape 4 : Configurer MongoDB Atlas pour EC2

#### 4.1 Whitelist IP de l'Instance EC2

```
MongoDB Atlas > Network Access > Add IP Address
IP Address : <ELASTIC_IP de EC2>
Description : RT Onboarding EC2 Production
```

#### 4.2 Tester la Connexion

```bash
cd ~/services/client-onboarding
node tests/test-mongodb.js
```

### Étape 5 : Configurer Nginx (Reverse Proxy)

#### 5.1 Installation Nginx

```bash
sudo apt install -y nginx

# Démarrer Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### 5.2 Configuration Nginx

```bash
sudo nano /etc/nginx/sites-available/onboarding
```

**Contenu** :

```nginx
server {
    listen 80;
    server_name onboarding.rt-technologie.com;

    # Redirection HTTPS (après installation SSL)
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://localhost:3020;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Logs
    access_log /var/log/nginx/onboarding.access.log;
    error_log /var/log/nginx/onboarding.error.log;
}
```

#### 5.3 Activer le Site

```bash
# Créer le lien symbolique
sudo ln -s /etc/nginx/sites-available/onboarding /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
```

### Étape 6 : Configurer SSL avec Let's Encrypt

#### 6.1 Installation Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

#### 6.2 Obtenir le Certificat SSL

```bash
# Important : Le DNS doit pointer vers l'IP publique EC2 d'abord !
sudo certbot --nginx -d onboarding.rt-technologie.com

# Suivre les instructions
# Email : votre@email.com
# Accepter les termes
# Redirection HTTPS : Oui (recommandé)
```

#### 6.3 Renouvellement Automatique

```bash
# Test renouvellement
sudo certbot renew --dry-run

# Le renouvellement automatique est configuré via cron
```

### Étape 7 : Configuration DNS (Route 53 ou Autre)

#### Option A : Route 53 (AWS)

```
Services > Route 53 > Hosted Zones
Créer un enregistrement :
  Nom : onboarding.rt-technologie.com
  Type : A
  Valeur : <ELASTIC_IP de EC2>
  TTL : 300
```

#### Option B : Cloudflare / OVH / Autre

```
Type : A
Nom : onboarding
Valeur : <ELASTIC_IP de EC2>
TTL : Auto ou 300
Proxy : Désactivé (si Cloudflare)
```

### Étape 8 : Tests Finaux

```bash
# Test local sur EC2
curl http://localhost:3020/health

# Test via Nginx
curl http://localhost/health

# Test depuis internet
curl http://onboarding.rt-technologie.com/health

# Test HTTPS (après SSL)
curl https://onboarding.rt-technologie.com/health
```

---

## 📦 Option 2 : Déploiement avec Docker (Alternative)

### Étape 1 : Créer un Dockerfile

**Créer** : `services/client-onboarding/Dockerfile`

```dockerfile
FROM node:20-alpine

# Créer le répertoire de l'app
WORKDIR /app

# Copier package.json et installer dépendances
COPY package*.json ./
RUN npm ci --production

# Copier le code source
COPY . .

# Exposer le port
EXPOSE 3020

# Variables d'environnement (overridées au runtime)
ENV NODE_ENV=production
ENV PORT=3020

# Démarrer l'application
CMD ["node", "src/server.js"]
```

### Étape 2 : Build et Push vers ECR

```bash
# Créer un repository ECR
aws ecr create-repository --repository-name rt-onboarding

# Login ECR
aws ecr get-login-password --region eu-west-1 | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.eu-west-1.amazonaws.com

# Build image
docker build -t rt-onboarding .

# Tag image
docker tag rt-onboarding:latest <ACCOUNT_ID>.dkr.ecr.eu-west-1.amazonaws.com/rt-onboarding:latest

# Push image
docker push <ACCOUNT_ID>.dkr.ecr.eu-west-1.amazonaws.com/rt-onboarding:latest
```

### Étape 3 : Déployer sur ECS Fargate

```
ECS > Clusters > Create Cluster
  Type : Networking only (Fargate)
  Nom : rt-onboarding-cluster

ECS > Task Definitions > Create
  Type : Fargate
  Nom : rt-onboarding-task
  CPU : 0.25 vCPU
  Memory : 0.5 GB
  Container :
    Image : <ECR_URI>
    Port : 3020
    Environment Variables : Ajouter depuis .env

ECS > Services > Create
  Cluster : rt-onboarding-cluster
  Launch type : Fargate
  Task Definition : rt-onboarding-task
  Service name : rt-onboarding-service
  Number of tasks : 1
  Load Balancer : Create Application Load Balancer
```

---

## 📦 Option 3 : Déploiement AWS Elastic Beanstalk (Plus Simple)

### Étape 1 : Préparer l'Application

```bash
cd services/client-onboarding

# Créer .ebextensions/environment.config
mkdir .ebextensions
cat > .ebextensions/environment.config << 'EOF'
option_settings:
  aws:elasticbeanstalk:application:environment:
    NODE_ENV: production
    PORT: 8080
EOF

# Modifier server.js pour utiliser process.env.PORT || 8080
```

### Étape 2 : Déployer

```bash
# Installer EB CLI
pip install awsebcli

# Initialiser
eb init -p node.js -r eu-west-1 rt-onboarding

# Créer environnement
eb create rt-onboarding-prod

# Configurer variables d'environnement
eb setenv MONGODB_URI="mongodb+srv://..." \
          JWT_SECRET="..." \
          SMTP_HOST="smtp.eu.mailgun.org"

# Déployer
eb deploy

# Ouvrir dans navigateur
eb open
```

---

## 🔒 Sécurité AWS

### 1. Groupe de Sécurité EC2

```
Inbound Rules :
  SSH (22) : Votre IP uniquement
  HTTP (80) : 0.0.0.0/0
  HTTPS (443) : 0.0.0.0/0
  Custom (3020) : 127.0.0.1/32 uniquement (via Nginx)

Outbound Rules :
  All traffic : 0.0.0.0/0
```

### 2. IAM Roles

```
Créer un rôle IAM pour EC2 :
  Nom : rt-onboarding-ec2-role
  Permissions :
    - AmazonSSMManagedInstanceCore (pour Session Manager)
    - CloudWatchAgentServerPolicy (pour logs)
```

### 3. Secrets Manager (Recommandé)

```bash
# Stocker les secrets dans AWS Secrets Manager
aws secretsmanager create-secret \
  --name rt-onboarding/production \
  --secret-string file://secrets.json

# Récupérer dans l'application
aws secretsmanager get-secret-value \
  --secret-id rt-onboarding/production
```

---

## 📊 Monitoring & Logs

### CloudWatch Logs

```bash
# Installer CloudWatch Agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -s \
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/config.json
```

### PM2 Monitoring

```bash
# Lier PM2 Plus pour monitoring cloud
pm2 link <secret_key> <public_key>
```

---

## 💰 Coûts Estimés

### Option 1 : EC2 t3.micro

| Ressource | Prix/mois | Notes |
|-----------|-----------|-------|
| EC2 t3.micro | ~$8 | 730h/mois |
| Elastic IP | $0 | Gratuit si attaché |
| EBS 20GB | ~$2 | gp3 |
| Data Transfer | ~$1 | 1GB/mois sortant |
| **TOTAL** | **~$11/mois** | |

### Option 2 : Fargate

| Ressource | Prix/mois |
|-----------|-----------|
| Fargate 0.25vCPU | ~$9 |
| Fargate 0.5GB | ~$2 |
| ALB | ~$16 |
| **TOTAL** | **~$27/mois** |

### Services Externes (Déjà Configurés)

| Service | Prix |
|---------|------|
| MongoDB Atlas M0 | Gratuit |
| Mailgun | Gratuit (100 emails/jour) |

---

## ✅ Checklist de Déploiement AWS

### Préparation

- [ ] Compte AWS créé et vérifié
- [ ] Domaine DNS configuré
- [ ] Credentials MongoDB Atlas prêts
- [ ] Credentials Mailgun prêts
- [ ] Secrets générés et sauvegardés

### Infrastructure

- [ ] Instance EC2 lancée
- [ ] Elastic IP allouée et associée
- [ ] Groupe de sécurité configuré
- [ ] Paire de clés SSH sauvegardée

### Installation

- [ ] SSH vers EC2 réussi
- [ ] Node.js installé
- [ ] PM2 installé
- [ ] Git installé
- [ ] Code déployé

### Configuration

- [ ] Fichier .env créé
- [ ] MongoDB IP whitelistée
- [ ] Service PM2 démarré
- [ ] PM2 startup configuré
- [ ] Nginx installé et configuré

### SSL & DNS

- [ ] DNS pointant vers EC2
- [ ] Certificat SSL obtenu
- [ ] HTTPS fonctionnel
- [ ] Redirection HTTP→HTTPS active

### Tests

- [ ] Health check OK
- [ ] API TVA fonctionnelle
- [ ] Génération PDF testée
- [ ] Emails envoyés correctement
- [ ] Service stable (uptime > 1h)

---

## 🆘 Dépannage AWS

### EC2 : Impossible de se connecter en SSH

```bash
# Vérifier le groupe de sécurité
# Port 22 doit être ouvert pour votre IP

# Vérifier les permissions de la clé
chmod 400 rt-onboarding-key.pem

# Vérifier l'utilisateur
ssh ubuntu@<IP>  # Pour Ubuntu
ssh ec2-user@<IP>  # Pour Amazon Linux
```

### Nginx : 502 Bad Gateway

```bash
# Vérifier que le service Node tourne
pm2 status

# Vérifier les logs Nginx
sudo tail -f /var/log/nginx/error.log

# Vérifier la config Nginx
sudo nginx -t
```

### SSL : Échec de Certbot

```bash
# Vérifier que le DNS pointe vers l'IP
nslookup onboarding.rt-technologie.com

# Vérifier que le port 80 est ouvert
sudo netstat -tulpn | grep :80

# Vérifier les logs
sudo cat /var/log/letsencrypt/letsencrypt.log
```

---

## 📞 Ressources

- **AWS Documentation** : https://docs.aws.amazon.com/
- **EC2 User Guide** : https://docs.aws.amazon.com/ec2/
- **Nginx Documentation** : https://nginx.org/en/docs/
- **Certbot** : https://certbot.eff.org/
- **PM2 Documentation** : https://pm2.keymetrics.io/

---

**Prêt pour le déploiement AWS ! 🚀**

