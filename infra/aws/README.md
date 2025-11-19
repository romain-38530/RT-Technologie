# AWS EC2 Déploiement - RT-Technologie

Ce dossier contient tous les fichiers nécessaires pour déployer RT-Technologie sur AWS EC2.

## 📁 Contenu

### Fichiers principaux

- **[setup-ec2.sh](./setup-ec2.sh)** - Script d'installation automatique sur EC2
- **[deploy.sh](./deploy.sh)** - Script de déploiement et gestion de l'application
- **[nginx.conf](./nginx.conf)** - Configuration Nginx (reverse proxy)
- **[CHECKLIST_DEPLOIEMENT.md](./CHECKLIST_DEPLOIEMENT.md)** - Checklist complète pour le déploiement

### Documentation

- **[DEPLOIEMENT_AWS_EC2.md](../../docs/DEPLOIEMENT_AWS_EC2.md)** - Guide complet de déploiement

## 🚀 Démarrage rapide

### 1. Sur votre machine locale

Préparez vos fichiers de configuration :

```bash
# Copiez le template d'environnement
cp .env.production .env

# Éditez avec vos vraies valeurs
# Remplacez tous les "CHANGEZ_MOI" et "VOTRE_CLE"
```

### 2. Création de l'instance EC2

1. Connectez-vous à [AWS Console](https://console.aws.amazon.com/)
2. Lancez une instance EC2 :
   - **OS** : Ubuntu 22.04 LTS
   - **Type** : t3.2xlarge (8 vCPU, 32GB RAM)
   - **Stockage** : 100 GB
   - **Groupe de sécurité** : Ports 22, 80, 443, 3001-3019

3. Téléchargez la clé SSH (.pem)
4. Notez l'**IP publique** de l'instance

### 3. Installation sur l'instance

```bash
# Depuis votre machine locale
# Transférer le script d'installation
scp -i "votre-cle.pem" infra/aws/setup-ec2.sh ubuntu@<IP-PUBLIQUE>:~/

# Se connecter à l'instance
ssh -i "votre-cle.pem" ubuntu@<IP-PUBLIQUE>

# Sur l'instance EC2
chmod +x ~/setup-ec2.sh
./setup-ec2.sh

# Déconnexion/reconnexion pour appliquer les groupes Docker
exit
```

### 4. Déploiement de l'application

```bash
# Reconnexion SSH
ssh -i "votre-cle.pem" ubuntu@<IP-PUBLIQUE>

# Cloner le code
cd ~
git clone <VOTRE_REPO> rt-technologie
cd rt-technologie

# Configurer l'environnement
cp .env.production .env
nano .env  # Remplir les variables

# Lancer l'application
docker-compose -f docker-compose.production.yml up -d --build

# Vérifier le déploiement
docker-compose -f docker-compose.production.yml ps
```

### 5. Tests

Accédez aux services depuis votre navigateur :

```
http://<IP-PUBLIQUE>:3001/health  # Admin Gateway
http://<IP-PUBLIQUE>:3007/health  # Core Orders
http://<IP-PUBLIQUE>:3019/health  # Chatbot
```

## 🛠️ Gestion quotidienne

### Utiliser le script de déploiement

```bash
cd ~/rt-technologie

# Menu interactif
./infra/aws/deploy.sh

# Options :
# 1 - Déploiement complet (rebuild)
# 2 - Mise à jour rapide
# 3 - Redémarrage
# 4 - Arrêt
# 5 - Voir les logs
# 6 - Backup MongoDB
# 7 - Status des services
# 8 - Cleanup
```

### Commandes utiles

```bash
# Voir les logs
docker-compose -f docker-compose.production.yml logs -f

# Status des services
./infra/aws/deploy.sh  # Option 7

# Monitoring
~/rt-technologie/monitor.sh

# Backup MongoDB
~/rt-technologie/backup-mongodb.sh

# Redémarrer un service
docker-compose -f docker-compose.production.yml restart <service>
```

## 🔐 Sécurité

### Configuration Nginx

```bash
# Copier la configuration
sudo cp infra/aws/nginx.conf /etc/nginx/nginx.conf

# Tester la configuration
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
```

### SSL avec Let's Encrypt

```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx

# Obtenir un certificat (remplacez par votre domaine)
sudo certbot --nginx -d votre-domaine.com

# Le renouvellement est automatique
```

## 📊 Monitoring

### Vérifier l'état du système

```bash
# Ressources Docker
docker stats

# Espace disque
df -h

# RAM
free -h

# Processus
htop
```

### Logs applicatifs

```bash
# Tous les services
docker-compose -f docker-compose.production.yml logs -f

# Service spécifique
docker-compose -f docker-compose.production.yml logs -f core-orders

# Logs MongoDB
docker logs rt-mongodb-prod

# Logs Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🔄 Mises à jour

### Mise à jour du code

```bash
cd ~/rt-technologie

# Pull du nouveau code
git pull

# Rebuild et redémarrage
docker-compose -f docker-compose.production.yml up -d --build

# Vérifier les logs
docker-compose -f docker-compose.production.yml logs -f
```

### Mise à jour d'un service spécifique

```bash
# Rebuild un service
docker-compose -f docker-compose.production.yml build <service>

# Redémarrer le service
docker-compose -f docker-compose.production.yml up -d <service>
```

## 💾 Backups

### Backup automatique

Les backups MongoDB sont automatiques (tous les jours à 2h du matin).

```bash
# Vérifier les backups
ls -lh ~/rt-technologie/backups/

# Voir le log des backups
tail -f ~/rt-technologie/logs/backup.log
```

### Backup manuel

```bash
# Utiliser le script
~/rt-technologie/backup-mongodb.sh

# Ou via le menu de déploiement
./infra/aws/deploy.sh  # Option 6
```

### Restauration

```bash
# Restaurer un backup
BACKUP_FILE="mongodb_backup_20251118_020000.gz"

docker exec -i rt-mongodb-prod mongorestore \
  --username=rt_admin \
  --password=$MONGODB_PASSWORD \
  --authenticationDatabase=admin \
  --gzip \
  --archive < ~/rt-technologie/backups/$BACKUP_FILE
```

## 🚨 Dépannage

### Les conteneurs ne démarrent pas

```bash
# Vérifier les logs
docker-compose -f docker-compose.production.yml logs

# Vérifier l'espace disque
df -h

# Nettoyer si nécessaire
docker system prune -a
```

### Problèmes de mémoire

```bash
# Vérifier l'utilisation
free -h
docker stats

# Solution : Augmenter la taille de l'instance
# EC2 Console → Stop Instance → Change Instance Type → Start
```

### MongoDB ne démarre pas

```bash
# Vérifier les logs
docker logs rt-mongodb-prod

# Vérifier le mot de passe dans .env
cat .env | grep MONGODB_ROOT_PASSWORD

# Recréer le conteneur
docker-compose -f docker-compose.production.yml up -d --force-recreate mongodb
```

## 💰 Optimisation des coûts

### Pour environnement de test

```bash
# Arrêter l'instance la nuit (AWS CLI)
aws ec2 stop-instances --instance-ids <INSTANCE-ID>

# Démarrer le matin
aws ec2 start-instances --instance-ids <INSTANCE-ID>
```

### Utiliser une instance plus petite

Pour des tests, vous pouvez utiliser **t3.large** (2 vCPU, 8GB RAM) :
- ~$75/mois au lieu de ~$300/mois
- Suffisant pour 5-10 utilisateurs simultanés

## 📚 Ressources

- **Documentation complète** : [docs/DEPLOIEMENT_AWS_EC2.md](../../docs/DEPLOIEMENT_AWS_EC2.md)
- **Checklist** : [CHECKLIST_DEPLOIEMENT.md](./CHECKLIST_DEPLOIEMENT.md)
- **AWS EC2 Docs** : https://docs.aws.amazon.com/ec2/
- **Docker Compose** : https://docs.docker.com/compose/

## 📞 Support

En cas de problème :

1. Vérifiez les logs : `docker-compose logs -f`
2. Consultez la [checklist](./CHECKLIST_DEPLOIEMENT.md)
3. Consultez le [guide complet](../../docs/DEPLOIEMENT_AWS_EC2.md)
4. Contactez le support RT-Technologie

---

**Version** : 1.0
**Dernière mise à jour** : 18 Novembre 2025
