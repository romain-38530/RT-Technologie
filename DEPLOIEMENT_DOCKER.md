# Déploiement Rapide avec Docker

## La Méthode la Plus Simple pour Déployer sur un Serveur

---

## Pourquoi Docker ?

- **Installation en 5 minutes**
- **Fonctionne sur n'importe quel serveur** (Linux, Windows Server, Mac)
- **Isolation complète** (pas de conflits avec d'autres applications)
- **Mise à jour facile**
- **Reproductible** (fonctionne partout de la même façon)

---

## Prérequis

**Un serveur avec** :
- Ubuntu 20.04+ / Debian 11+ / CentOS 8+ (ou Windows Server)
- 2 Go RAM minimum
- Accès SSH (pour Linux) ou RDP (pour Windows)

---

## Installation en 3 Étapes

### Étape 1 : Installer Docker

#### Sur Ubuntu/Debian

```bash
# Se connecter au serveur
ssh utilisateur@VOTRE_IP

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Ajouter votre utilisateur au groupe docker
sudo usermod -aG docker $USER

# Installer Docker Compose
sudo apt install docker-compose -y

# Redémarrer la session ou exécuter
newgrp docker
```

#### Sur CentOS/RHEL

```bash
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo systemctl start docker
sudo systemctl enable docker
```

#### Sur Windows Server

1. Installer **Docker Desktop for Windows Server**
2. Ou utiliser PowerShell :
   ```powershell
   Install-Module -Name DockerMsftProvider -Force
   Install-Package -Name docker -ProviderName DockerMsftProvider -Force
   ```

---

### Étape 2 : Récupérer le Projet

```bash
# Créer répertoire pour l'application
cd /opt
sudo git clone https://github.com/VOTRE_COMPTE/RT-Technologie.git

# Ou télécharger et extraire le ZIP si pas de Git
# wget https://github.com/VOTRE_COMPTE/RT-Technologie/archive/refs/heads/main.zip
# unzip main.zip

cd RT-Technologie
```

---

### Étape 3 : Lancer l'Application

```bash
# Configurer la clé secrète (IMPORTANT pour la sécurité)
export SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_hex(32))')

# Créer le fichier .env
cat > .env << EOF
SECRET_KEY=$SECRET_KEY
FLASK_ENV=production
FLASK_DEBUG=False
EOF

# Lancer avec Docker Compose
sudo docker-compose up -d
```

**C'est tout !** L'application est maintenant accessible.

---

## Accès à l'Application

### Depuis votre serveur

```
http://localhost:8000
```

### Depuis n'importe où

```
http://VOTRE_IP_SERVEUR:8000
```

Exemple : `http://192.168.1.100:8000`

### Avec nom de domaine

Si vous avez un nom de domaine pointant vers votre serveur :

```
http://votre-domaine.com
```

---

## Configuration Complète (avec Nginx et HTTPS)

Pour un déploiement professionnel avec reverse proxy :

### 1. Modifier docker-compose.yml

Décommenter la section `nginx` :

```yaml
# Déjà présent dans le fichier
nginx:
  image: nginx:alpine
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro
```

### 2. Lancer avec Nginx

```bash
sudo docker-compose up -d
```

Maintenant accessible sur le port 80 :
```
http://VOTRE_IP_SERVEUR
```

### 3. Ajouter HTTPS (Let's Encrypt)

```bash
# Installer certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtenir certificat (remplacer VOTRE_DOMAINE)
sudo certbot certonly --standalone -d VOTRE_DOMAINE.com

# Copier les certificats dans le projet
sudo mkdir -p ssl
sudo cp /etc/letsencrypt/live/VOTRE_DOMAINE.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/VOTRE_DOMAINE.com/privkey.pem ssl/key.pem

# Éditer nginx/nginx.conf et décommenter la section HTTPS

# Redémarrer
sudo docker-compose restart nginx
```

Maintenant accessible en HTTPS :
```
https://VOTRE_DOMAINE.com
```

---

## Commandes Utiles

### Gérer les Conteneurs

```bash
# Voir les conteneurs en cours
sudo docker-compose ps

# Voir les logs
sudo docker-compose logs -f

# Voir les logs d'un service spécifique
sudo docker-compose logs -f web

# Redémarrer l'application
sudo docker-compose restart

# Arrêter l'application
sudo docker-compose stop

# Démarrer l'application
sudo docker-compose start

# Arrêter et supprimer les conteneurs
sudo docker-compose down
```

### Mettre à Jour l'Application

```bash
# Naviguer vers le projet
cd /opt/RT-Technologie

# Récupérer les mises à jour
sudo git pull

# Reconstruire l'image Docker
sudo docker-compose build

# Redémarrer avec la nouvelle version
sudo docker-compose up -d
```

### Sauvegardes

```bash
# Sauvegarder les données
sudo docker-compose exec web tar czf /tmp/backup.tar.gz /app/data
sudo docker cp sourcing-web:/tmp/backup.tar.gz ./backup-$(date +%Y%m%d).tar.gz

# Restaurer
sudo docker cp backup-20231215.tar.gz sourcing-web:/tmp/
sudo docker-compose exec web tar xzf /tmp/backup-20231215.tar.gz -C /app/
sudo docker-compose restart
```

---

## Monitoring

### Vérifier l'État

```bash
# État des services
sudo docker-compose ps

# Santé de l'application (healthcheck)
sudo docker inspect sourcing-web | grep -A 10 Health

# Utilisation ressources
sudo docker stats
```

### Logs en Temps Réel

```bash
# Tous les logs
sudo docker-compose logs -f

# Seulement les erreurs
sudo docker-compose logs -f | grep ERROR

# Dernières 100 lignes
sudo docker-compose logs --tail=100
```

---

## Dépannage

### Le conteneur ne démarre pas

```bash
# Voir les logs d'erreur
sudo docker-compose logs web

# Vérifier la configuration
sudo docker-compose config

# Reconstruire depuis zéro
sudo docker-compose down
sudo docker-compose build --no-cache
sudo docker-compose up -d
```

### Impossible d'accéder à l'application

```bash
# Vérifier que le conteneur tourne
sudo docker-compose ps

# Vérifier les ports
sudo netstat -tlnp | grep 8000

# Vérifier le pare-feu
sudo ufw status
sudo ufw allow 8000/tcp

# Tester depuis le serveur
curl http://localhost:8000
```

### Erreur "Port already in use"

```bash
# Trouver ce qui utilise le port 8000
sudo lsof -i :8000

# Arrêter le processus
sudo kill -9 PID_DU_PROCESSUS

# Ou changer le port dans docker-compose.yml
# ports:
#   - "8080:8000"  # Utiliser 8080 au lieu de 8000
```

---

## Configuration Avancée

### Variables d'Environnement

Créer un fichier `.env` :

```bash
SECRET_KEY=votre-cle-secrete-tres-longue
FLASK_ENV=production
FLASK_DEBUG=False
DEFAULT_LOCATION_LAT=45.7640
DEFAULT_LOCATION_LON=4.8357
```

Le fichier sera automatiquement chargé par Docker Compose.

### Limiter les Ressources

Modifier `docker-compose.yml` :

```yaml
services:
  web:
    # ... config existante ...
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### Redémarrage Automatique

Déjà configuré avec `restart: always` dans docker-compose.yml.

Les conteneurs redémarreront automatiquement :
- Après un crash
- Après un redémarrage du serveur

---

## Déploiement Multi-Serveurs

### Avec Docker Swarm

```bash
# Initialiser Swarm
sudo docker swarm init

# Déployer la stack
sudo docker stack deploy -c docker-compose.yml sourcing

# Scaler
sudo docker service scale sourcing_web=3
```

### Avec Kubernetes

Fichiers de déploiement Kubernetes disponibles sur demande.

---

## Performance

### Recommandations

Pour un serveur de **production** :

```yaml
# docker-compose.yml
services:
  web:
    deploy:
      replicas: 3  # 3 instances
      resources:
        limits:
          memory: 1G
```

### Cache

Ajouter Redis pour le cache (optionnel) :

```yaml
services:
  redis:
    image: redis:alpine
    restart: always

  web:
    environment:
      - CACHE_TYPE=redis
      - CACHE_REDIS_URL=redis://redis:6379
```

---

## Checklist de Déploiement

- [ ] Docker installé
- [ ] Projet cloné ou téléchargé
- [ ] Fichier `.env` créé avec SECRET_KEY unique
- [ ] `docker-compose up -d` exécuté
- [ ] Application accessible sur http://IP:8000
- [ ] Pare-feu configuré (port 8000 ou 80)
- [ ] (Optionnel) Nginx configuré
- [ ] (Optionnel) HTTPS avec Let's Encrypt
- [ ] (Optionnel) Nom de domaine configuré
- [ ] Sauvegardes automatiques configurées

---

## Sécurité

### Bonnes Pratiques

1. **Changer SECRET_KEY** :
   ```bash
   python3 -c 'import secrets; print(secrets.token_hex(32))'
   ```

2. **Mettre à jour régulièrement** :
   ```bash
   sudo docker-compose pull
   sudo docker-compose up -d
   ```

3. **Limiter l'accès** :
   ```bash
   # N'ouvrir que ports nécessaires
   sudo ufw default deny incoming
   sudo ufw default allow outgoing
   sudo ufw allow ssh
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

4. **Activer les logs** :
   Les logs sont automatiquement collectés par Docker.

---

## Support Cloud

### DigitalOcean

```bash
# Créer Droplet Ubuntu
# Connexion SSH
ssh root@VOTRE_IP

# Installation Docker
curl -fsSL https://get.docker.com | sh

# Déploiement
cd /opt
git clone VOTRE_REPO
cd RT-Technologie
docker-compose up -d
```

**Coût** : 6$/mois (Droplet Basic)

### AWS EC2

```bash
# Lancer instance Ubuntu
# Groupe sécurité : Ouvrir ports 22, 80, 443, 8000

# Connexion
ssh -i votre-cle.pem ubuntu@IP_PUBLIQUE

# Installation et déploiement (idem DigitalOcean)
```

### Google Cloud

```bash
# Créer VM Compute Engine
gcloud compute instances create sourcing-vm \
    --image-family=ubuntu-2204-lts \
    --image-project=ubuntu-os-cloud \
    --machine-type=e2-small

# Connexion et installation (idem)
```

---

## FAQ

### Combien de temps pour déployer ?

**5-10 minutes** si Docker est déjà installé.
**20-30 minutes** pour installation complète avec HTTPS.

### Quel est le coût ?

- **VPS basique** : 3-10€/mois
- **Cloud (AWS/GCP/Azure)** : 5-15$/mois
- **Gratuit** : Possible avec offres gratuites (GCP free tier, AWS free tier 1 an)

### Puis-je utiliser mon ordinateur comme serveur ?

Oui, mais **non recommandé** pour production :
- Doit rester allumé 24/7
- Besoin d'IP fixe
- Configuration du routeur (port forwarding)
- Risques de sécurité

### Docker est-il obligatoire ?

Non, voir `DEPLOIEMENT_SERVEUR.md` pour déploiement manuel.
Mais Docker est **beaucoup plus simple**.

---

## Conclusion

Docker permet un déploiement **ultra-rapide** et **fiable**.

**Pour démarrer tout de suite** :

```bash
# Sur votre serveur
curl -fsSL https://get.docker.com | sudo sh
cd /opt
sudo git clone VOTRE_REPO
cd RT-Technologie
sudo docker-compose up -d
```

**Accès** : `http://VOTRE_IP:8000`

**Bon déploiement ! 🚀**
