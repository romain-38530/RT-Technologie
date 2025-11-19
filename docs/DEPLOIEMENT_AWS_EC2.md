# Guide de Déploiement AWS EC2 - RT-Technologie

## 🎯 Vue d'ensemble

Ce guide vous permet de déployer l'ensemble de la plateforme RT-Technologie sur une instance AWS EC2 en utilisant Docker Compose.

### Architecture déployée
- **Instance EC2** : t3.xlarge ou t3.2xlarge (selon charge)
- **14 services backend** en conteneurs Docker
- **MongoDB** : conteneur local (ou MongoDB Atlas recommandé)
- **Redis** : conteneur local
- **Nginx** : reverse proxy pour exposer les services

### Coûts estimés
- **EC2 t3.xlarge** : ~$150/mois (4 vCPU, 16 GB RAM)
- **EC2 t3.2xlarge** : ~$300/mois (8 vCPU, 32 GB RAM) - Recommandé
- **Storage (100 GB)** : ~$10/mois
- **Bande passante** : Variable selon trafic

---

## 📋 Prérequis

### 1. Compte AWS
- Accès à la console AWS
- Clé d'accès IAM (Access Key + Secret Key)
- Ou accès SSH à la console

### 2. Sur votre machine locale
- AWS CLI installé : https://aws.amazon.com/cli/
- Clé SSH générée

---

## 🚀 Étape 1 : Créer l'instance EC2

### Via la console AWS

1. **Connectez-vous à AWS Console** : https://console.aws.amazon.com/

2. **Lancez une instance EC2** :
   - Allez dans **EC2 → Instances → Launch Instance**

3. **Configuration** :
   ```
   Nom : rt-technologie-production

   OS : Ubuntu Server 22.04 LTS (64-bit x86)

   Type d'instance : t3.2xlarge
   - 8 vCPU
   - 32 GB RAM

   Paire de clés : Créer nouvelle ou utiliser existante
   - Téléchargez le fichier .pem

   Stockage : 100 GB (gp3)

   Groupe de sécurité : Créer nouveau (voir étape suivante)
   ```

4. **Configuration du groupe de sécurité** :

   Nom : `rt-technologie-sg`

   **Règles entrantes** :
   ```
   Type              Port    Source          Description
   ----------------------------------------------------------------
   SSH               22      Votre IP        Administration
   HTTP              80      0.0.0.0/0      Web public
   HTTPS             443     0.0.0.0/0      Web public (SSL)
   Custom TCP        3001    0.0.0.0/0      Admin Gateway (temporaire)
   Custom TCP        3007    0.0.0.0/0      Core Orders API (temporaire)
   Custom TCP        3009    0.0.0.0/0      Palette API (temporaire)
   Custom TCP        3015    0.0.0.0/0      Storage Market (temporaire)
   Custom TCP        3016    0.0.0.0/0      Geo Tracking (temporaire)
   Custom TCP        3019    0.0.0.0/0      Chatbot (temporaire)
   ```

   **Note** : Les ports temporaires seront fermés après configuration du reverse proxy

5. **Lancez l'instance** et notez :
   - **Instance ID**
   - **Adresse IP publique**
   - **DNS public**

---

## 🔐 Étape 2 : Se connecter à l'instance

### Depuis Windows (PowerShell)

```powershell
# Définir les permissions du fichier .pem
icacls "C:\path\to\your-key.pem" /inheritance:r
icacls "C:\path\to\your-key.pem" /grant:r "$($env:USERNAME):(R)"

# Se connecter
ssh -i "C:\path\to\your-key.pem" ubuntu@<IP-PUBLIQUE>
```

### Depuis Linux/Mac

```bash
chmod 400 ~/path/to/your-key.pem
ssh -i ~/path/to/your-key.pem ubuntu@<IP-PUBLIQUE>
```

---

## 🛠️ Étape 3 : Installer Docker sur l'instance EC2

Une fois connecté en SSH, exécutez :

```bash
# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Installation des prérequis
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Ajout du repository Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Installation Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Installation Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Ajouter l'utilisateur au groupe docker
sudo usermod -aG docker ubuntu

# Vérification
docker --version
docker-compose --version

# Redémarrer la session pour appliquer les groupes
exit
# Reconnectez-vous en SSH
```

---

## 📦 Étape 4 : Transférer le code sur EC2

### Option A : Via Git (Recommandé)

```bash
# Sur l'instance EC2
cd ~
git clone <VOTRE_REPO_GIT> rt-technologie
cd rt-technologie
```

### Option B : Via SCP (Depuis votre machine locale)

```bash
# Depuis votre machine Windows (PowerShell)
scp -i "C:\path\to\your-key.pem" -r "C:\Users\jspitaleri\OneDrive - Cesi\Bureau\RT-Technologie" ubuntu@<IP-PUBLIQUE>:~/rt-technologie

# Ou depuis Linux/Mac
scp -i ~/path/to/your-key.pem -r ./RT-Technologie ubuntu@<IP-PUBLIQUE>:~/rt-technologie
```

---

## ⚙️ Étape 5 : Configuration de l'environnement

```bash
# Sur l'instance EC2
cd ~/rt-technologie

# Copier le fichier d'environnement de production
cp .env.production .env

# Éditer avec vos vraies valeurs
nano .env
```

Remplissez les variables (voir le fichier `.env.production` créé)

---

## 🐳 Étape 6 : Lancer l'application

```bash
# Build et démarrage de tous les services
docker-compose -f docker-compose.production.yml up -d --build

# Suivre les logs
docker-compose -f docker-compose.production.yml logs -f

# Vérifier que tous les conteneurs tournent
docker ps
```

---

## 🧪 Étape 7 : Tester l'application

### Tests de santé des services

```bash
# Admin Gateway
curl http://localhost:3001/health

# Core Orders
curl http://localhost:3007/health

# Chatbot
curl http://localhost:3019/health

# Storage Market
curl http://localhost:3015/health
```

### Accès depuis votre navigateur

Remplacez `<IP-PUBLIQUE>` par l'IP de votre instance :

```
Admin Gateway    : http://<IP-PUBLIQUE>:3001
Core Orders API  : http://<IP-PUBLIQUE>:3007
Palette API      : http://<IP-PUBLIQUE>:3009
Storage Market   : http://<IP-PUBLIQUE>:3015
Geo Tracking     : http://<IP-PUBLIQUE>:3016
Chatbot          : http://<IP-PUBLIQUE>:3019
```

---

## 🔧 Commandes utiles

### Gestion des conteneurs

```bash
# Voir les logs d'un service spécifique
docker-compose -f docker-compose.production.yml logs -f admin-gateway

# Redémarrer un service
docker-compose -f docker-compose.production.yml restart admin-gateway

# Arrêter tous les services
docker-compose -f docker-compose.production.yml down

# Redémarrer avec rebuild
docker-compose -f docker-compose.production.yml up -d --build

# Voir l'utilisation des ressources
docker stats
```

### Nettoyage

```bash
# Nettoyer les images inutilisées
docker system prune -a

# Voir l'espace disque
df -h
du -sh /var/lib/docker
```

---

## 📊 Monitoring

### Logs applicatifs

```bash
# Tous les logs
docker-compose -f docker-compose.production.yml logs -f

# Logs d'un service
docker-compose -f docker-compose.production.yml logs -f core-orders

# Logs MongoDB
docker logs rt-mongodb-prod

# Logs Redis
docker logs rt-redis-prod
```

### Ressources système

```bash
# CPU, RAM, Disk
htop  # Installer avec: sudo apt install htop

# Réseau
sudo netstat -tlnp

# Docker stats
docker stats
```

---

## 🔐 Sécurisation (Important)

### 1. Configurer le pare-feu

```bash
# Installer UFW
sudo apt install ufw

# Autoriser SSH
sudo ufw allow 22

# Autoriser HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Activer le pare-feu
sudo ufw enable
```

### 2. Installer et configurer Nginx (Reverse Proxy)

```bash
sudo apt install nginx

# Le fichier de configuration sera créé à l'étape suivante
```

### 3. Installer un certificat SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx

# Obtenir le certificat (remplacez par votre domaine)
sudo certbot --nginx -d votre-domaine.com
```

---

## 🚨 Dépannage

### Les conteneurs ne démarrent pas

```bash
# Vérifier les logs d'erreur
docker-compose -f docker-compose.production.yml logs

# Vérifier l'espace disque
df -h

# Vérifier la RAM
free -h
```

### MongoDB refuse les connexions

```bash
# Vérifier que MongoDB est bien démarré
docker logs rt-mongodb-prod

# Tester la connexion
docker exec -it rt-mongodb-prod mongosh -u rt_admin -p <password>
```

### Port déjà utilisé

```bash
# Voir les ports utilisés
sudo netstat -tlnp | grep <PORT>

# Tuer le processus
sudo kill <PID>
```

---

## 📈 Prochaines étapes (Amélioration)

1. **Configurer Nginx** comme reverse proxy (voir `nginx.conf` créé)
2. **Ajouter SSL/HTTPS** avec Let's Encrypt
3. **Configurer un nom de domaine** pour l'instance
4. **Mettre en place des backups** MongoDB automatiques
5. **Configurer CloudWatch** pour le monitoring
6. **Créer une AMI** pour backup complet
7. **Mettre en place CI/CD** pour déploiement automatique

---

## 💰 Optimisation des coûts

### Pour réduire les coûts en test :

1. **Utiliser une instance plus petite** : t3.large (2 vCPU, 8GB RAM) ~$75/mois
2. **Arrêter l'instance la nuit** (si environnement de test)
3. **Utiliser MongoDB Atlas** (gratuit jusqu'à 512MB)
4. **Reserved Instances** (engagement 1-3 ans) : -40% à -60%

### Commandes pour gérer l'instance

```bash
# Depuis AWS CLI local
aws ec2 stop-instances --instance-ids <INSTANCE-ID>
aws ec2 start-instances --instance-ids <INSTANCE-ID>
```

---

## 📞 Support

En cas de problème :
1. Vérifiez les logs : `docker-compose logs -f`
2. Vérifiez les ressources : `docker stats` et `htop`
3. Consultez la documentation AWS EC2
4. Contactez le support RT-Technologie

---

**Version** : 1.0
**Date** : 18 Novembre 2025
**Auteur** : RT-Technologie
