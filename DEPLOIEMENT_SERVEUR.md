# Guide de Déploiement sur Serveur Distant

## Guide Complet de Déploiement en Production

Ce guide vous permet de déployer le Système de Sourcing Permanent sur un serveur distant accessible depuis n'importe où.

---

## Table des Matières

1. [Prérequis](#prérequis)
2. [Déploiement Rapide avec Docker](#déploiement-rapide-avec-docker)
3. [Déploiement Manuel (Ubuntu/Debian)](#déploiement-manuel-ubuntudebian)
4. [Configuration Nginx](#configuration-nginx)
5. [Sécurisation HTTPS](#sécurisation-https)
6. [Service Systemd](#service-systemd)
7. [Déploiement Cloud](#déploiement-cloud)
8. [Maintenance](#maintenance)

---

## Prérequis

### Serveur Minimum

- **OS**: Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- **RAM**: 2 Go minimum (4 Go recommandé)
- **CPU**: 2 cœurs
- **Disque**: 10 Go
- **Accès**: SSH avec sudo

### Logiciels Requis

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer les dépendances
sudo apt install -y python3 python3-pip python3-venv nginx git
```

---

## Déploiement Rapide avec Docker

### Méthode la Plus Simple

#### 1. Installer Docker

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

#### 2. Cloner le Projet

```bash
cd /opt
sudo git clone https://github.com/VOTRE_COMPTE/RT-Technologie.git
cd RT-Technologie
```

#### 3. Lancer avec Docker

```bash
sudo docker-compose up -d
```

#### 4. Accéder à l'Application

```
http://VOTRE_IP_SERVEUR:8000
```

**C'est tout ! L'application est en ligne.**

---

## Déploiement Manuel (Ubuntu/Debian)

### Méthode Traditionnelle pour Contrôle Maximal

#### Étape 1 : Créer un Utilisateur Dédié

```bash
# Créer utilisateur pour l'application
sudo useradd -m -s /bin/bash sourcing
sudo usermod -aG sudo sourcing
```

#### Étape 2 : Installer l'Application

```bash
# Se connecter en tant qu'utilisateur sourcing
sudo su - sourcing

# Cloner le projet
cd ~
git clone https://github.com/VOTRE_COMPTE/RT-Technologie.git
cd RT-Technologie

# Créer environnement virtuel
python3 -m venv venv
source venv/bin/activate

# Installer les dépendances
pip install --upgrade pip
pip install -r requirements.txt
```

#### Étape 3 : Configurer l'Environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer la configuration
nano .env
```

Modifier au minimum :

```bash
FLASK_ENV=production
FLASK_DEBUG=False
SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_hex(32))')
```

#### Étape 4 : Créer les Répertoires de Logs

```bash
# Créer répertoires
sudo mkdir -p /var/log/gunicorn
sudo mkdir -p /var/log/sourcing-system
sudo mkdir -p /var/run/gunicorn

# Donner permissions
sudo chown -R sourcing:sourcing /var/log/gunicorn
sudo chown -R sourcing:sourcing /var/log/sourcing-system
sudo chown -R sourcing:sourcing /var/run/gunicorn
```

#### Étape 5 : Tester Gunicorn

```bash
# Dans le répertoire du projet, avec venv activé
cd ~/RT-Technologie
source venv/bin/activate

# Lancer gunicorn
gunicorn --config gunicorn_config.py wsgi:application
```

Vérifier : `http://VOTRE_IP:8000`

Si ça fonctionne, passer à l'étape suivante.

---

## Configuration Nginx

### Reverse Proxy pour Performance et Sécurité

#### 1. Installer Nginx

```bash
sudo apt install nginx -y
```

#### 2. Créer Configuration Nginx

```bash
sudo nano /etc/nginx/sites-available/sourcing
```

Contenu :

```nginx
server {
    listen 80;
    server_name VOTRE_DOMAINE.com;  # ou votre IP

    # Logs
    access_log /var/log/nginx/sourcing-access.log;
    error_log /var/log/nginx/sourcing-error.log;

    # Fichiers statiques
    location /static {
        alias /home/sourcing/RT-Technologie/static;
        expires 30d;
    }

    # Proxy vers Gunicorn
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Sécurité
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

#### 3. Activer le Site

```bash
# Créer lien symbolique
sudo ln -s /etc/nginx/sites-available/sourcing /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
```

#### 4. Configurer le Pare-feu

```bash
# Autoriser HTTP et HTTPS
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

**Accès** : `http://VOTRE_DOMAINE.com` ou `http://VOTRE_IP`

---

## Sécurisation HTTPS

### Certificat SSL avec Let's Encrypt (GRATUIT)

#### 1. Installer Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

#### 2. Obtenir Certificat

```bash
# Remplacer par votre domaine
sudo certbot --nginx -d VOTRE_DOMAINE.com -d www.VOTRE_DOMAINE.com
```

Suivre les instructions interactives.

#### 3. Renouvellement Automatique

```bash
# Tester le renouvellement
sudo certbot renew --dry-run

# Le renouvellement automatique est déjà configuré
```

**Accès sécurisé** : `https://VOTRE_DOMAINE.com`

---

## Service Systemd

### Lancement Automatique au Démarrage

#### 1. Créer le Service

```bash
sudo nano /etc/systemd/system/sourcing.service
```

Contenu :

```ini
[Unit]
Description=Système de Sourcing Permanent - Gunicorn
After=network.target

[Service]
Type=notify
User=sourcing
Group=sourcing
WorkingDirectory=/home/sourcing/RT-Technologie
Environment="PATH=/home/sourcing/RT-Technologie/venv/bin"
ExecStart=/home/sourcing/RT-Technologie/venv/bin/gunicorn \
          --config gunicorn_config.py \
          wsgi:application
ExecReload=/bin/kill -s HUP $MAINPID
KillMode=mixed
TimeoutStopSec=5
PrivateTmp=true
Restart=always

[Install]
WantedBy=multi-user.target
```

#### 2. Activer et Démarrer

```bash
# Recharger systemd
sudo systemctl daemon-reload

# Activer au démarrage
sudo systemctl enable sourcing

# Démarrer le service
sudo systemctl start sourcing

# Vérifier le statut
sudo systemctl status sourcing
```

#### 3. Commandes Utiles

```bash
# Voir les logs
sudo journalctl -u sourcing -f

# Redémarrer
sudo systemctl restart sourcing

# Arrêter
sudo systemctl stop sourcing

# État
sudo systemctl status sourcing
```

---

## Déploiement Cloud

### AWS (Amazon Web Services)

#### EC2 Instance

1. **Créer une instance EC2** :
   - Ubuntu Server 22.04 LTS
   - Type : t2.small minimum (t2.medium recommandé)
   - Groupe de sécurité : Ouvrir ports 80, 443, 22

2. **Se connecter** :
   ```bash
   ssh -i votre-cle.pem ubuntu@IP_PUBLIQUE
   ```

3. **Suivre le guide de déploiement manuel** ci-dessus

4. **IP Élastique** (optionnel) :
   - Allouer une IP élastique pour IP fixe

#### Utiliser AWS Lightsail (Plus Simple)

```bash
# Créer instance Lightsail Ubuntu
# Ouvrir ports 80, 443 dans le pare-feu
# SSH et suivre le guide manuel
```

**Coût estimé** : 5-10$/mois

---

### Google Cloud Platform (GCP)

#### Compute Engine

```bash
# Créer VM
gcloud compute instances create sourcing-vm \
    --image-family=ubuntu-2204-lts \
    --image-project=ubuntu-os-cloud \
    --machine-type=e2-small \
    --zone=europe-west1-b

# Règles firewall
gcloud compute firewall-rules create allow-http \
    --allow tcp:80 \
    --source-ranges 0.0.0.0/0

gcloud compute firewall-rules create allow-https \
    --allow tcp:443 \
    --source-ranges 0.0.0.0/0

# Se connecter
gcloud compute ssh sourcing-vm
```

---

### Azure

#### Créer VM Ubuntu

```bash
# Via Azure CLI
az vm create \
  --resource-group MonGroupe \
  --name sourcing-vm \
  --image UbuntuLTS \
  --size Standard_B1s \
  --admin-username azureuser \
  --generate-ssh-keys

# Ouvrir ports
az vm open-port --port 80 --resource-group MonGroupe --name sourcing-vm
az vm open-port --port 443 --resource-group MonGroupe --name sourcing-vm
```

---

### Hébergeurs Mutualisés

#### OVH, Ionos, Hostinger, etc.

Si vous avez un hébergement mutualisé avec accès Python :

1. Vérifier que Python 3.9+ est disponible
2. Installer via SSH si disponible
3. Utiliser leur interface de gestion de fichiers
4. Configurer via `.htaccess` si Apache

**Note** : Beaucoup d'hébergeurs mutualisés ne permettent pas Flask/Gunicorn. Privilégier un VPS.

---

## Maintenance

### Mises à Jour

```bash
# Se connecter au serveur
ssh utilisateur@VOTRE_SERVEUR

# Naviguer vers le projet
cd ~/RT-Technologie
source venv/bin/activate

# Mettre à jour le code
git pull origin main

# Mettre à jour les dépendances
pip install -r requirements.txt --upgrade

# Redémarrer
sudo systemctl restart sourcing
```

### Monitoring

#### Vérifier que l'Application Fonctionne

```bash
# Vérifier le service
sudo systemctl status sourcing

# Voir les logs en temps réel
sudo journalctl -u sourcing -f

# Logs Gunicorn
tail -f /var/log/gunicorn/sourcing-error.log
tail -f /var/log/gunicorn/sourcing-access.log

# Logs Nginx
tail -f /var/log/nginx/sourcing-error.log
tail -f /var/log/nginx/sourcing-access.log
```

#### Surveiller les Ressources

```bash
# Utilisation CPU/RAM
htop

# Espace disque
df -h

# Processus
ps aux | grep gunicorn
```

### Sauvegardes

```bash
# Créer script de sauvegarde
sudo nano /usr/local/bin/backup-sourcing.sh
```

Contenu :

```bash
#!/bin/bash
BACKUP_DIR="/backup/sourcing"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Sauvegarder le code
tar -czf $BACKUP_DIR/code_$DATE.tar.gz /home/sourcing/RT-Technologie

# Garder seulement les 7 dernières sauvegardes
find $BACKUP_DIR -name "code_*.tar.gz" -mtime +7 -delete
```

```bash
# Rendre exécutable
sudo chmod +x /usr/local/bin/backup-sourcing.sh

# Ajouter au cron (sauvegarde quotidienne à 2h)
sudo crontab -e
# Ajouter : 0 2 * * * /usr/local/bin/backup-sourcing.sh
```

---

## Dépannage

### L'application ne démarre pas

```bash
# Vérifier les logs
sudo journalctl -u sourcing -n 50

# Vérifier les permissions
ls -la /home/sourcing/RT-Technologie

# Tester manuellement
cd ~/RT-Technologie
source venv/bin/activate
gunicorn --config gunicorn_config.py wsgi:application
```

### Nginx erreur 502 Bad Gateway

```bash
# Vérifier que Gunicorn tourne
sudo systemctl status sourcing

# Vérifier la configuration Nginx
sudo nginx -t

# Voir les logs
tail -f /var/log/nginx/sourcing-error.log
```

### Erreur "Module not found"

```bash
# Réinstaller les dépendances
cd ~/RT-Technologie
source venv/bin/activate
pip install -r requirements.txt --force-reinstall
```

---

## Checklist de Déploiement

- [ ] Serveur provisionné (VPS/Cloud)
- [ ] Python 3.9+ installé
- [ ] Projet cloné depuis Git
- [ ] Environment virtuel créé
- [ ] Dépendances installées
- [ ] `.env` configuré avec SECRET_KEY unique
- [ ] Gunicorn fonctionne manuellement
- [ ] Nginx installé et configuré
- [ ] Service systemd créé et activé
- [ ] Pare-feu configuré (ports 80, 443)
- [ ] HTTPS configuré (Let's Encrypt)
- [ ] Sauvegardes automatiques configurées
- [ ] Monitoring en place

---

## URLs de Référence

- **Gunicorn** : https://docs.gunicorn.org/
- **Nginx** : https://nginx.org/en/docs/
- **Let's Encrypt** : https://letsencrypt.org/
- **Systemd** : https://systemd.io/
- **Docker** : https://docs.docker.com/

---

## Support

Pour toute question sur le déploiement :

1. Consulter les logs (voir section Monitoring)
2. Vérifier la documentation officielle
3. Tester en local d'abord avec `python web_app.py`

---

## Estimation des Coûts

| Hébergeur | Type | Coût Mensuel | Note |
|-----------|------|--------------|------|
| OVH VPS | VPS SSD 1 | 3.50€ | Basique, suffisant pour démo |
| Scaleway | DEV1-S | 7.99€ | Bon rapport qualité/prix |
| DigitalOcean | Droplet Basic | 6$ | Simple, bien documenté |
| AWS Lightsail | 512 MB | 3.50$ | Facile pour débutants AWS |
| Azure | B1S | 10€ | Bien pour écosystème Microsoft |
| GCP | e2-micro | Gratuit* | Offre gratuite 1 an |

*Sous conditions d'éligibilité

---

## Conclusion

Vous avez maintenant tous les outils pour déployer le système sur un serveur distant !

**Recommandation pour débutants** : Commencer avec **DigitalOcean** ou **AWS Lightsail**.

**Pour plus de simplicité** : Utiliser **Docker** (voir début du guide).

Une fois déployé, l'application sera accessible depuis n'importe où via :

```
https://votre-domaine.com
```

ou

```
http://VOTRE_IP_SERVEUR:8000
```

Bon déploiement !
