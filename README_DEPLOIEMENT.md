# Guide de Déploiement - Système de Sourcing Permanent

## Accès Distant à Votre Application

Vous voulez accéder au système depuis n'importe où ? Vous êtes au bon endroit !

---

## Quelle Méthode Choisir ?

### 1. Docker (Recommandé - Le Plus Simple)

**Avantages** :
- Installation en 5 minutes
- Fonctionne partout
- Mise à jour facile
- Isolation complète

**Documentation** : [`DEPLOIEMENT_DOCKER.md`](DEPLOIEMENT_DOCKER.md)

**Commandes** :
```bash
sudo docker-compose up -d
# Accès: http://VOTRE_IP:8000
```

---

### 2. Déploiement Manuel (Contrôle Maximal)

**Avantages** :
- Contrôle total
- Performance optimale
- Configuration avancée

**Documentation** : [`DEPLOIEMENT_SERVEUR.md`](DEPLOIEMENT_SERVEUR.md)

**Commandes** :
```bash
./start_production.sh
# Accès: http://VOTRE_IP:8000
```

---

### 3. Utilisation Locale (Développement/Test)

**Avantages** :
- Très rapide
- Pas besoin de serveur
- Accès immédiat

**Documentation** : [`ACCES_WEB.md`](ACCES_WEB.md)

**Commandes** :
```bash
python web_app.py
# Accès: http://localhost:5000
```

---

## Comparaison Rapide

| Méthode | Difficulté | Temps | Accès Internet | Recommandé pour |
|---------|------------|-------|----------------|-----------------|
| **Docker** | Facile | 5 min | Oui | Production |
| **Manuel** | Moyenne | 20 min | Oui | Serveurs dédiés |
| **Local** | Très facile | 1 min | Non | Développement |

---

## Déploiement Rapide en 3 Étapes

### Étape 1 : Obtenir un Serveur

**Options gratuites** :
- Google Cloud Platform (300$ de crédits gratuits)
- AWS (1 an gratuit)
- Oracle Cloud (toujours gratuit pour certaines VMs)

**Options payantes** (3-10€/mois) :
- OVH
- Scaleway
- DigitalOcean
- Hetzner

### Étape 2 : Installer Docker

```bash
ssh utilisateur@VOTRE_IP
curl -fsSL https://get.docker.com | sudo sh
```

### Étape 3 : Déployer l'Application

```bash
cd /opt
sudo git clone https://github.com/VOTRE_COMPTE/RT-Technologie.git
cd RT-Technologie
sudo docker-compose up -d
```

**C'est tout !** Accédez à : `http://VOTRE_IP:8000`

---

## Ajout d'un Nom de Domaine

### 1. Acheter un Domaine (8-15€/an)

- OVH
- Gandi
- Namecheap
- Google Domains

### 2. Configurer le DNS

Ajouter un enregistrement A :
```
Type: A
Nom: @
Valeur: VOTRE_IP_SERVEUR
TTL: 3600
```

### 3. Configurer HTTPS (Gratuit avec Let's Encrypt)

```bash
sudo apt install certbot -y
sudo certbot certonly --standalone -d votre-domaine.com
```

Suivre les instructions dans [`DEPLOIEMENT_SERVEUR.md`](DEPLOIEMENT_SERVEUR.md)

---

## Fichiers Importants

### Configuration

- `.env` - Variables d'environnement (SECRET_KEY, etc.)
- `gunicorn_config.py` - Configuration serveur production
- `docker-compose.yml` - Configuration Docker

### Déploiement

- `wsgi.py` - Point d'entrée WSGI
- `Dockerfile` - Image Docker
- `nginx/nginx.conf` - Configuration reverse proxy
- `systemd/sourcing.service` - Service systemd

### Scripts

- `start_web.sh` - Démarrage local (développement)
- `start_production.sh` - Démarrage production (manuel)
- `start_web.bat` - Démarrage Windows

### Documentation

- [`DEPLOIEMENT_DOCKER.md`](DEPLOIEMENT_DOCKER.md) - Guide Docker complet
- [`DEPLOIEMENT_SERVEUR.md`](DEPLOIEMENT_SERVEUR.md) - Guide déploiement manuel
- [`ACCES_WEB.md`](ACCES_WEB.md) - Guide accès local
- [`COMMENT_UTILISER.md`](COMMENT_UTILISER.md) - Guide utilisation

---

## Checklist Avant Déploiement

- [ ] Python 3.9+ installé (ou Docker)
- [ ] Serveur accessible (VPS, Cloud, etc.)
- [ ] Port 8000 (ou 80/443) ouvert dans le pare-feu
- [ ] Nom de domaine configuré (optionnel mais recommandé)
- [ ] Fichier `.env` avec SECRET_KEY unique
- [ ] Sauvegardes configurées

---

## Sécurité

### OBLIGATOIRE

1. **Changer SECRET_KEY** dans `.env` :
   ```bash
   python3 -c 'import secrets; print(secrets.token_hex(32))'
   ```

2. **Mettre FLASK_DEBUG=False** dans `.env`

3. **Configurer pare-feu** :
   ```bash
   sudo ufw allow 22/tcp   # SSH
   sudo ufw allow 80/tcp   # HTTP
   sudo ufw allow 443/tcp  # HTTPS
   sudo ufw enable
   ```

### RECOMMANDÉ

1. **Activer HTTPS** (Let's Encrypt gratuit)
2. **Ajouter authentification** (à implémenter)
3. **Configurer sauvegardes automatiques**
4. **Monitoring** (logs, alertes)

---

## Support Cloud

### DigitalOcean (Recommandé pour débutants)

```bash
# Créer Droplet Ubuntu 22.04 (6$/mois)
# Connexion SSH
ssh root@VOTRE_IP

# Installation et déploiement
curl -fsSL https://get.docker.com | sh
cd /opt && git clone VOTRE_REPO && cd RT-Technologie
docker-compose up -d
```

### AWS (Offre gratuite 1 an)

```bash
# Créer EC2 t2.micro Ubuntu
# Groupe sécurité: ouvrir 22, 80, 443, 8000
ssh -i cle.pem ubuntu@IP

# Installation (idem DigitalOcean)
```

### Google Cloud Platform (300$ crédits)

```bash
# Créer VM e2-micro
gcloud compute instances create sourcing \
    --image-family=ubuntu-2204-lts \
    --machine-type=e2-small

# Connexion et installation
```

---

## Maintenance

### Mise à Jour

```bash
cd /opt/RT-Technologie
sudo git pull
sudo docker-compose build
sudo docker-compose up -d
```

### Logs

```bash
# Docker
sudo docker-compose logs -f

# Manuel
sudo journalctl -u sourcing -f
```

### Redémarrage

```bash
# Docker
sudo docker-compose restart

# Manuel
sudo systemctl restart sourcing
```

---

## Dépannage

### L'application ne démarre pas

```bash
# Voir les logs
sudo docker-compose logs web
# ou
sudo journalctl -u sourcing -n 50
```

### Impossible d'accéder depuis Internet

```bash
# Vérifier pare-feu
sudo ufw status

# Vérifier que l'app écoute
sudo netstat -tlnp | grep 8000

# Tester localement
curl http://localhost:8000
```

### Erreur 502 Bad Gateway (Nginx)

```bash
# Vérifier que Gunicorn tourne
sudo docker-compose ps
# ou
sudo systemctl status sourcing
```

---

## FAQ

### Combien ça coûte ?

- **Gratuit** : Cloud avec offres gratuites (AWS, GCP, Oracle)
- **Bas coût** : 3-10€/mois (VPS OVH, Scaleway, Hetzner)
- **Standard** : 5-15$/mois (DigitalOcean, AWS sans offre gratuite)

### Puis-je utiliser mon ordinateur personnel ?

Oui pour **tests**, non pour **production** :
- Doit rester allumé 24/7
- IP fixe nécessaire
- Configuration routeur complexe
- Risques sécurité

Utilisez plutôt un VPS à 3€/mois.

### Ai-je besoin d'un nom de domaine ?

**Non** - Vous pouvez utiliser l'IP directement : `http://123.45.67.89:8000`

**Mais recommandé** pour :
- URL facile à retenir
- HTTPS (certificat SSL)
- Apparence professionnelle

### Docker est-il obligatoire ?

Non. Vous pouvez déployer manuellement (voir `DEPLOIEMENT_SERVEUR.md`).

Mais Docker est **beaucoup plus simple** et **recommandé**.

### Combien d'utilisateurs simultanés ?

Avec configuration par défaut :
- **VPS 2 Go RAM** : 50-100 utilisateurs
- **VPS 4 Go RAM** : 200-300 utilisateurs

Ajustable en modifiant le nombre de workers Gunicorn.

---

## Ressources Utiles

### Documentation

- [Guide Docker complet](DEPLOIEMENT_DOCKER.md)
- [Guide déploiement manuel](DEPLOIEMENT_SERVEUR.md)
- [Guide utilisation](COMMENT_UTILISER.md)

### Liens Externes

- Docker : https://docs.docker.com/
- Gunicorn : https://docs.gunicorn.org/
- Nginx : https://nginx.org/
- Let's Encrypt : https://letsencrypt.org/

### Hébergeurs Recommandés

- DigitalOcean : https://www.digitalocean.com/
- Scaleway : https://www.scaleway.com/
- OVH : https://www.ovhcloud.com/
- Hetzner : https://www.hetzner.com/

---

## Aide Supplémentaire

1. **Lire la documentation appropriée** :
   - Docker → `DEPLOIEMENT_DOCKER.md`
   - Manuel → `DEPLOIEMENT_SERVEUR.md`
   - Local → `ACCES_WEB.md`

2. **Vérifier les logs** (voir section Maintenance)

3. **Tester localement d'abord** :
   ```bash
   python web_app.py
   ```

---

## Conclusion

Pour déployer rapidement, nous recommandons :

1. **Créer un Droplet DigitalOcean** (6$/mois)
2. **Installer Docker** : `curl -fsSL https://get.docker.com | sudo sh`
3. **Cloner le projet** : `git clone ...`
4. **Lancer** : `docker-compose up -d`

**Résultat** : Application accessible mondialement en 10 minutes !

Pour plus de détails, consultez [`DEPLOIEMENT_DOCKER.md`](DEPLOIEMENT_DOCKER.md).

**Bon déploiement ! 🚀**
