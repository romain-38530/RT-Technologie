# 🚀 Guide de Démarrage Rapide - Déploiement Production

## Vue d'ensemble

Ce guide vous accompagne pas à pas pour déployer l'intégralité de la plateforme RT-Technologie en production sur **AWS**, **MongoDB Atlas** et **Vercel**.

**Durée estimée** : 2-3 heures
**Niveau** : Avancé (DevOps)
**Prérequis** : Compte AWS, MongoDB Atlas, Vercel, GitHub

---

## 📋 Checklist avant de commencer

### Comptes requis
- [ ] Compte AWS avec accès admin
- [ ] Compte MongoDB Atlas (gratuit pour commencer)
- [ ] Compte Vercel (Team ou Enterprise recommandé)
- [ ] Compte GitHub avec accès au repo
- [ ] Compte Slack (optionnel, pour notifications)
- [ ] Compte DataDog (optionnel, pour monitoring avancé)

### Outils locaux
- [ ] Node.js 20+ installé
- [ ] pnpm 8.15+ installé
- [ ] Terraform 1.5+ installé
- [ ] AWS CLI v2 installé et configuré
- [ ] Vercel CLI installé (`npm i -g vercel`)
- [ ] Git configuré

### Connaissances requises
- [ ] Bases d'AWS (EC2, VPC, ALB, S3)
- [ ] Terraform
- [ ] MongoDB
- [ ] Next.js et déploiement Vercel
- [ ] CI/CD avec GitHub Actions

---

## 🎯 Étape 1 : Préparation Initiale (15 min)

### 1.1 Cloner le repository

```bash
git clone https://github.com/rt-technologie/RT-Technologie.git
cd RT-Technologie
```

### 1.2 Installer les dépendances

```bash
# Installer pnpm si nécessaire
npm install -g pnpm@8.15.4

# Installer toutes les dépendances du monorepo
pnpm install
```

### 1.3 Générer les secrets

```bash
# JWT Secret (512 bits)
openssl rand -base64 64

# Service Token (256 bits)
openssl rand -hex 32

# Admin API Key (256 bits)
openssl rand -hex 32

# Sauvegarder ces valeurs dans un gestionnaire de mots de passe
```

### 1.4 Configurer les variables d'environnement

```bash
# Copier le template
cp .env.example .env

# Éditer avec vos valeurs
nano .env  # ou code .env
```

**Variables critiques à remplir immédiatement** :
```env
# MongoDB
MONGODB_URI=mongodb+srv://app_user:<password>@cluster0.xxxxx.mongodb.net/rt-technologie?retryWrites=true&w=majority

# AWS
AWS_ACCESS_KEY_ID=AKIAxxxxxxxxxxxxx
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_REGION=eu-west-3
S3_BUCKET_DOCUMENTS=rt-technologie-documents-prod
S3_BUCKET_IMAGES=rt-technologie-images-prod

# Security
JWT_SECRET=<celui généré avec openssl>
SERVICE_TOKEN=<celui généré avec openssl>
ADMIN_API_KEY=<celui généré avec openssl>

# Mailgun
MAILGUN_DOMAIN=mg.rt-technologie.com
MAILGUN_API_KEY=key-xxxxxxxxxxxxxxxxxxxxxxxx

# OpenRouter (pour Affret.IA)
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxx
```

---

## ☁️ Étape 2 : Déployer l'Infrastructure AWS (45 min)

### 2.1 Configurer AWS CLI

```bash
# Configurer les credentials
aws configure

# Vérifier l'accès
aws sts get-caller-identity
```

### 2.2 Initialiser Terraform

```bash
cd infra/terraform

# Initialiser
terraform init

# Formatter les fichiers
terraform fmt

# Valider la configuration
terraform validate
```

### 2.3 Créer un fichier de variables

Créer `infra/terraform/terraform.tfvars` :

```hcl
# Projet
project_name = "rt-technologie"
environment  = "production"

# Réseau
vpc_cidr            = "10.0.0.0/16"
availability_zones  = ["eu-west-3a", "eu-west-3b", "eu-west-3c"]

# Compute
ec2_instance_type   = "t3.medium"
asg_min_size        = 2
asg_max_size        = 10
asg_desired_size    = 2

# Domaine
domain_name         = "rt-technologie.com"

# Tags
tags = {
  Project     = "RT-Technologie"
  Environment = "Production"
  ManagedBy   = "Terraform"
  Team        = "DevOps"
}
```

### 2.4 Planifier et appliquer

```bash
# Voir ce qui sera créé (IMPORTANT)
terraform plan

# Sauvegarder le plan
terraform plan -out=tfplan

# Appliquer (cela va créer ~30 ressources AWS)
terraform apply tfplan
```

**⏱️ Durée** : 10-15 minutes

### 2.5 Noter les outputs

Terraform affichera des outputs importants :

```bash
# Sauvegarder ces valeurs
terraform output -json > outputs.json

# Valeurs importantes :
# - alb_dns_name : pointe vos domaines vers cette adresse
# - nat_gateway_ips : à ajouter dans MongoDB Atlas whitelist
# - s3_bucket_documents : bucket pour documents
# - s3_bucket_images : bucket pour images
```

---

## 🍃 Étape 3 : Configurer MongoDB Atlas (30 min)

### 3.1 Créer un projet

1. Aller sur https://cloud.mongodb.com
2. Cliquer sur "New Project"
3. Nom : **RT-Technologie**
4. Ajouter les membres de l'équipe

### 3.2 Créer le cluster Production

1. Cliquer sur "Build a Database"
2. Choisir **Dedicated** (M10)
3. **Provider** : AWS
4. **Region** : Europe West (Paris) - eu-west-3
5. **Cluster Tier** : M10 (2GB RAM, 10GB Storage)
6. **Cluster Name** : rt-technologie-prod
7. **Additional Settings** :
   - MongoDB Version : 7.0
   - Backup : Enabled (Continuous Backup)
8. Cliquer sur "Create Cluster" (⏱️ 7-10 min)

### 3.3 Créer le cluster Staging (optionnel)

1. Même process mais :
   - **Cluster Tier** : M2 (Shared)
   - **Cluster Name** : rt-technologie-staging

### 3.4 Configurer la sécurité réseau

1. Aller dans "Network Access"
2. Cliquer sur "Add IP Address"
3. Ajouter les **NAT Gateway IPs** (depuis Terraform outputs) :
   ```
   Type: IP Address
   IP: <NAT_GATEWAY_IP_1>
   Comment: AWS NAT Gateway AZ-A

   Type: IP Address
   IP: <NAT_GATEWAY_IP_2>
   Comment: AWS NAT Gateway AZ-B
   ```
4. Ajouter votre IP actuelle pour debug :
   ```
   Type: Current IP Address
   Comment: Mon IP debug (à supprimer après)
   ```

### 3.5 Créer les utilisateurs de base de données

1. Aller dans "Database Access"
2. Cliquer sur "Add New Database User"

**Utilisateur 1 : Application**
```
Username: app_user
Password: <générer un mot de passe fort>
Database User Privileges: Read and write to any database
```

**Utilisateur 2 : Admin**
```
Username: admin_user
Password: <générer un mot de passe fort>
Database User Privileges: Atlas admin
```

**Utilisateur 3 : Backup**
```
Username: backup_user
Password: <générer un mot de passe fort>
Database User Privileges: Read any database
```

### 3.6 Récupérer la connection string

1. Cliquer sur "Connect" sur votre cluster
2. Choisir "Connect your application"
3. Driver : **Node.js**
4. Version : **6.7 or later**
5. Copier la connection string :
   ```
   mongodb+srv://app_user:<password>@rt-technologie-prod.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Remplacer `<password>` et ajouter le nom de la DB :
   ```
   mongodb+srv://app_user:VOTRE_MOT_DE_PASSE@rt-technologie-prod.xxxxx.mongodb.net/rt-technologie?retryWrites=true&w=majority
   ```

### 3.7 Mettre à jour .env

```bash
# Mettre à jour dans .env
MONGODB_URI=mongodb+srv://app_user:VOTRE_MOT_DE_PASSE@rt-technologie-prod.xxxxx.mongodb.net/rt-technologie?retryWrites=true&w=majority
```

### 3.8 Initialiser les données (seeds)

```bash
# Depuis votre machine locale (pour tester la connexion)
cd RT-Technologie
node infra/scripts/seed-database.js

# Ou créer un script de seed
```

---

## 🚀 Étape 4 : Déployer les Applications sur Vercel (30 min)

### 4.1 Installer Vercel CLI

```bash
npm install -g vercel

# Login
vercel login
```

### 4.2 Créer une Team Vercel (recommandé)

1. Aller sur https://vercel.com
2. Créer une Team : **RT-Technologie**
3. Inviter les membres de l'équipe

### 4.3 Déployer chaque application

**Pour chaque app** (9 au total) :

```bash
# App 1 : web-industry
cd apps/web-industry
vercel link
# Choisir la Team RT-Technologie
# Project name: web-industry
vercel
# Tester le déploiement

# Configurer les env vars
vercel env add NEXT_PUBLIC_ADMIN_GATEWAY_URL production
# Valeur: https://api.rt-technologie.com

vercel env add NEXT_PUBLIC_PALETTE_API_URL production
# Valeur: https://api.rt-technologie.com/palette

# ... répéter pour toutes les vars

# Déploiement production
vercel --prod

# Répéter pour les 8 autres apps :
# - web-transporter
# - web-logistician
# - web-forwarder
# - web-supplier
# - web-recipient
# - backoffice-admin
# - mobile-driver/pwa
# - kiosk (si existant)
```

### 4.4 Configurer les domaines personnalisés

Pour chaque app sur Vercel :

1. Aller dans **Settings** > **Domains**
2. Ajouter le domaine :
   - `industry.rt-technologie.com` → web-industry
   - `transporter.rt-technologie.com` → web-transporter
   - `logistician.rt-technologie.com` → web-logistician
   - `forwarder.rt-technologie.com` → web-forwarder
   - `supplier.rt-technologie.com` → web-supplier
   - `recipient.rt-technologie.com` → web-recipient
   - `admin.rt-technologie.com` → backoffice-admin
   - `driver.rt-technologie.com` → mobile-driver/pwa
   - `kiosk.rt-technologie.com` → kiosk

3. Vercel donnera les enregistrements DNS à créer

---

## 🌐 Étape 5 : Configurer le DNS (15 min)

### 5.1 Configurer Route53 (si domaine sur AWS)

```bash
# Les records sont déjà créés par Terraform
# Vérifier dans la console AWS Route53
```

### 5.2 Si domaine externe (GoDaddy, OVH, etc.)

Créer ces enregistrements DNS :

```
Type    Nom                     Valeur                              TTL
────────────────────────────────────────────────────────────────────────
A       api                     <ALB_DNS_NAME (via ALIAS)>          300
CNAME   industry                cname.vercel-dns.com                300
CNAME   transporter             cname.vercel-dns.com                300
CNAME   logistician             cname.vercel-dns.com                300
CNAME   forwarder               cname.vercel-dns.com                300
CNAME   supplier                cname.vercel-dns.com                300
CNAME   recipient               cname.vercel-dns.com                300
CNAME   admin                   cname.vercel-dns.com                300
CNAME   driver                  cname.vercel-dns.com                300
CNAME   cdn-docs                <CLOUDFRONT_DISTRIBUTION_DOCS>      300
CNAME   cdn-img                 <CLOUDFRONT_DISTRIBUTION_IMAGES>    300
```

### 5.3 Vérifier la propagation DNS

```bash
# Attendre 5-10 minutes puis tester
dig api.rt-technologie.com
dig industry.rt-technologie.com
```

---

## 🔧 Étape 6 : Déployer les Services Backend (20 min)

### 6.1 Se connecter à l'instance EC2

```bash
# Récupérer l'IP publique depuis AWS Console ou Terraform
ssh -i ~/.ssh/rt-technologie-key.pem ec2-user@<EC2_PUBLIC_IP>
```

### 6.2 Cloner le repo sur le serveur

```bash
# Sur l'EC2
cd /home/ec2-user
git clone https://github.com/rt-technologie/RT-Technologie.git
cd RT-Technologie
```

### 6.3 Configurer .env sur le serveur

```bash
# Copier le .env local vers le serveur (depuis votre machine)
scp -i ~/.ssh/rt-technologie-key.pem .env ec2-user@<EC2_PUBLIC_IP>:/home/ec2-user/RT-Technologie/.env
```

### 6.4 Installer les dépendances et builder

```bash
# Sur l'EC2
pnpm install
pnpm build
```

### 6.5 Démarrer les services avec PM2

```bash
# Utiliser la config PM2
pm2 start infra/scripts/pm2-ecosystem.config.js

# Sauvegarder la configuration PM2
pm2 save

# Configurer PM2 au démarrage
pm2 startup
# Exécuter la commande affichée

# Vérifier que tout tourne
pm2 status
pm2 logs
```

### 6.6 Tester les health checks

```bash
# Depuis votre machine locale
curl https://api.rt-technologie.com/health
curl https://api.rt-technologie.com/core-orders/health
curl https://api.rt-technologie.com/palette/health
```

---

## 🔄 Étape 7 : Configurer CI/CD GitHub Actions (15 min)

### 7.1 Ajouter les secrets GitHub

1. Aller sur GitHub : **Settings** > **Secrets and variables** > **Actions**
2. Cliquer sur **New repository secret**
3. Ajouter ces secrets :

```
AWS_ACCESS_KEY_ID               = <votre access key>
AWS_SECRET_ACCESS_KEY           = <votre secret key>
AWS_REGION                      = eu-west-3
EC2_INSTANCE_ID                 = <instance ID depuis AWS Console>
MONGODB_ATLAS_PUBLIC_KEY        = <depuis MongoDB Atlas>
MONGODB_ATLAS_PRIVATE_KEY       = <depuis MongoDB Atlas>
VERCEL_TOKEN                    = <depuis Vercel Settings > Tokens>
VERCEL_ORG_ID                   = <depuis vercel.json>
SLACK_WEBHOOK_URL               = <webhook Slack pour notifications>
```

### 7.2 Tester le workflow

```bash
# Faire un petit changement
echo "# Test deploy" >> README.md

# Commit et push vers main
git add .
git commit -m "Test CI/CD deployment"
git push origin main

# Aller sur GitHub > Actions pour voir le workflow s'exécuter
```

### 7.3 Vérifier le déploiement automatique

Le workflow va :
1. ✅ Lint et test le code
2. ✅ Build les services backend
3. ✅ Déployer sur AWS EC2
4. ✅ Déployer les apps sur Vercel
5. ✅ Exécuter les tests E2E
6. ✅ Envoyer une notification Slack

---

## 📊 Étape 8 : Configurer le Monitoring (20 min)

### 8.1 CloudWatch (inclus avec AWS)

Les alarmes sont déjà créées par Terraform :
- CPU > 70%
- Unhealthy targets sur ALB
- S3 bucket errors

Vérifier dans **AWS Console** > **CloudWatch** > **Alarms**

### 8.2 DataDog (optionnel mais recommandé)

```bash
# Sur chaque EC2
DD_API_KEY=<votre_clé_datadog> DD_SITE="datadoghq.eu" bash -c "$(curl -L https://s3.amazonaws.com/dd-agent/scripts/install_script_agent7.sh)"

# Configurer les intégrations
sudo nano /etc/datadog-agent/conf.d/pm2.d/conf.yaml
```

### 8.3 MongoDB Atlas Monitoring

1. Aller dans **Monitoring** sur MongoDB Atlas
2. Configurer les alertes :
   - CPU > 75% → Email + PagerDuty
   - Connections > 80% → Email
   - Disk usage > 80% → Email + Slack
   - Query performance degradation → Email

### 8.4 Vercel Analytics

Activé automatiquement pour chaque app. Voir les métriques dans :
**Vercel Dashboard** > **Project** > **Analytics**

---

## ✅ Étape 9 : Vérification Finale (10 min)

### 9.1 Checklist de vérification

**Infrastructure AWS** :
- [ ] VPC créé avec subnets publics et privés
- [ ] ALB opérationnel avec certificat SSL
- [ ] EC2 instances running (min 2)
- [ ] Auto Scaling Group configuré
- [ ] S3 buckets créés et accessibles
- [ ] CloudFront distributions actives
- [ ] Route53 records configurés

**MongoDB Atlas** :
- [ ] Cluster Production (M10) opérationnel
- [ ] Users créés avec bonnes permissions
- [ ] IP whitelist configurée (NAT Gateways)
- [ ] Connection string testée
- [ ] Données de seed chargées
- [ ] Backups configurés (continuous)

**Vercel** :
- [ ] 9 applications déployées
- [ ] Domaines personnalisés configurés
- [ ] Variables d'environnement setées
- [ ] SSL/HTTPS actif
- [ ] Builds réussis

**Services Backend** :
- [ ] 17 services PM2 running
- [ ] Health checks OK
- [ ] Logs accessibles via PM2
- [ ] Auto-restart configuré

**CI/CD** :
- [ ] GitHub Actions configuré
- [ ] Secrets ajoutés
- [ ] Premier workflow réussi
- [ ] Notifications Slack opérationnelles

### 9.2 Tests end-to-end

```bash
# Test 1 : API Backend
curl https://api.rt-technologie.com/health
# Attendu: { "status": "ok", "services": [...] }

# Test 2 : Applications Frontend
curl -I https://industry.rt-technologie.com
# Attendu: HTTP/2 200

# Test 3 : Upload fichier S3
aws s3 cp test.txt s3://rt-technologie-documents-prod/test/
aws s3 ls s3://rt-technologie-documents-prod/test/

# Test 4 : MongoDB
mongosh "mongodb+srv://rt-technologie-prod.xxxxx.mongodb.net/rt-technologie" --username app_user
# Lancer quelques requêtes

# Test 5 : E2E avec Playwright (depuis local)
cd apps/web-industry
pnpm test:e2e
```

### 9.3 Métriques de succès

Vérifier dans les dashboards :
- **CloudWatch** : Toutes les alarmes au vert
- **MongoDB Atlas** : Cluster healthy, connections < 50
- **Vercel** : Toutes les apps deployed, 0 erreurs
- **PM2** : 17/17 services online, 0 restarts

---

## 🎉 Étape 10 : Go Live ! (5 min)

### 10.1 Annonce interne

Envoyer un message à l'équipe :

```
🚀 RT-Technologie est maintenant en PRODUCTION !

URLs :
- Industrie : https://industry.rt-technologie.com
- Transporteur : https://transporter.rt-technologie.com
- Logisticien : https://logistician.rt-technologie.com
- Admin : https://admin.rt-technologie.com
- Driver App : https://driver.rt-technologie.com
- API : https://api.rt-technologie.com

Status : https://status.rt-technologie.com (à configurer)

Bon tests ! 🎊
```

### 10.2 Activer le monitoring

- Vérifier que toutes les alertes sont configurées
- Assigner les astreintes (PagerDuty)
- Créer le canal Slack #prod-incidents

### 10.3 Documentation utilisateur

- Publier les guides de formation créés
- Envoyer les liens de formation par email
- Organiser des sessions de formation live

---

## 📈 Après le Déploiement

### Tâches à 24h
- [ ] Vérifier les logs pour erreurs
- [ ] Vérifier les métriques (CPU, RAM, DB)
- [ ] Tester tous les workflows critiques
- [ ] Backup de la DB (manuel)

### Tâches à 1 semaine
- [ ] Analyser les performances
- [ ] Optimiser les requêtes lentes (MongoDB)
- [ ] Ajuster l'auto-scaling si besoin
- [ ] Review des coûts AWS

### Tâches à 1 mois
- [ ] Review sécurité complète
- [ ] Audit des logs d'accès
- [ ] Optimisation des coûts (Reserved Instances)
- [ ] Plan de disaster recovery test

---

## 🆘 Troubleshooting

### Problème : Les services backend ne démarrent pas

```bash
# Vérifier les logs PM2
pm2 logs

# Vérifier les variables d'environnement
cat .env | grep MONGODB_URI

# Redémarrer un service spécifique
pm2 restart core-orders

# Restart complet
pm2 restart all
```

### Problème : MongoDB connection timeout

```bash
# Vérifier la whitelist IP
# Aller sur MongoDB Atlas > Network Access
# Vérifier que les NAT Gateway IPs sont bien présentes

# Tester la connexion depuis EC2
mongosh "mongodb+srv://..." --username app_user
```

### Problème : Apps Vercel ne se déploient pas

```bash
# Vérifier les logs de build
vercel logs <deployment-url>

# Rebuild
vercel --prod --force

# Vérifier les env vars
vercel env ls
```

### Problème : ALB Health checks failing

```bash
# SSH dans EC2
ssh -i ~/.ssh/rt-technologie-key.pem ec2-user@<IP>

# Vérifier que les services écoutent
ss -tulpn | grep 300

# Tester le health endpoint localement
curl localhost:3001/health

# Vérifier les security groups
# AWS Console > EC2 > Security Groups
# S'assurer que le port 3001-3018 sont ouverts depuis ALB
```

---

## 📞 Support

### Contacts d'urgence
- **DevOps Lead** : devops@rt-technologie.com
- **CTO** : cto@rt-technologie.com
- **Slack** : #prod-incidents

### Ressources
- Documentation complète : `docs/DEPLOYMENT_ARCHITECTURE.md`
- Runbook MongoDB : `infra/mongodb/atlas-config.md`
- Scripts de déploiement : `infra/scripts/deploy-services.sh`

---

**🎊 Félicitations ! Votre plateforme RT-Technologie est maintenant en production !**

---

**Dernière mise à jour** : 18 janvier 2025
**Version** : 1.0.0
**Auteur** : RT-Technologie DevOps Team
