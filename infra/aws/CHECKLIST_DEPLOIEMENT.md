# Checklist de Déploiement AWS EC2 - RT-Technologie

Utilisez cette checklist pour vous assurer que tous les éléments sont en place avant et après le déploiement.

---

## ✅ Pré-déploiement

### 1. Compte AWS
- [ ] Compte AWS créé et vérifié
- [ ] Carte de crédit enregistrée
- [ ] Limites de service vérifiées (quotas EC2)

### 2. Clés et API Keys
- [ ] Clé SSH générée (.pem téléchargée)
- [ ] OpenRouter API Key obtenue
- [ ] Mailgun configuré (ou SMTP)
- [ ] TomTom API Key obtenue (pour geo-tracking)
- [ ] VAT Check API Key obtenue (optionnel)
- [ ] OpenAI API Key (optionnel)
- [ ] Anthropic API Key (optionnel)

### 3. Configuration locale
- [ ] AWS CLI installé
- [ ] Git configuré
- [ ] Code poussé sur un repository Git

---

## 🚀 Création de l'instance EC2

### 1. Lancement de l'instance
- [ ] Instance EC2 lancée (t3.2xlarge recommandé)
- [ ] Ubuntu 22.04 LTS sélectionné
- [ ] 100 GB de stockage configuré
- [ ] Groupe de sécurité créé avec les bons ports
- [ ] Clé SSH associée à l'instance
- [ ] IP publique assignée
- [ ] Nom de l'instance défini (rt-technologie-production)

### 2. Configuration réseau
- [ ] Groupe de sécurité configuré:
  - [ ] SSH (22) depuis votre IP
  - [ ] HTTP (80) depuis 0.0.0.0/0
  - [ ] HTTPS (443) depuis 0.0.0.0/0
  - [ ] Ports API temporaires (3001-3019)

### 3. Connexion initiale
- [ ] Connexion SSH réussie
- [ ] Permissions du fichier .pem correctes (400)

---

## 🛠️ Configuration du serveur

### 1. Installation des outils
- [ ] Script setup-ec2.sh transféré sur le serveur
- [ ] Script setup-ec2.sh exécuté avec succès
- [ ] Docker installé et fonctionnel
- [ ] Docker Compose installé
- [ ] Nginx installé
- [ ] UFW (firewall) configuré

### 2. Transfert du code
- [ ] Code cloné depuis Git OU transféré via SCP
- [ ] Tous les fichiers présents dans ~/rt-technologie

### 3. Configuration de l'environnement
- [ ] Fichier .env.production copié en .env
- [ ] Toutes les variables d'environnement remplies:
  - [ ] MONGODB_ROOT_PASSWORD
  - [ ] JWT_SECRET
  - [ ] INTERNAL_SERVICE_TOKEN
  - [ ] MAILGUN_API_KEY / SMTP
  - [ ] OPENROUTER_API_KEY
  - [ ] TOMTOM_API_KEY
  - [ ] IP publique (PUBLIC_IP)
- [ ] Aucune valeur "CHANGEZ_MOI" restante
- [ ] Tokens de sécurité générés avec des valeurs fortes

---

## 🐳 Déploiement Docker

### 1. Build et lancement
- [ ] docker-compose.production.yml vérifié
- [ ] Build des images réussi
- [ ] Tous les conteneurs démarrés
- [ ] Pas d'erreur dans les logs

### 2. Vérification des conteneurs
- [ ] MongoDB en cours d'exécution
- [ ] Redis en cours d'exécution
- [ ] 14 services backend démarrés
- [ ] Tous les health checks passent (green)

### 3. Tests des services
- [ ] Admin Gateway répond (http://IP:3001/health)
- [ ] AuthZ répond (http://IP:3002/health)
- [ ] Core Orders répond (http://IP:3007/health)
- [ ] Palette répond (http://IP:3009/health)
- [ ] Storage Market répond (http://IP:3015/health)
- [ ] Geo Tracking répond (http://IP:3016/health)
- [ ] Chatbot répond (http://IP:3019/health)

---

## 🔐 Sécurisation

### 1. Pare-feu
- [ ] UFW activé
- [ ] Seuls les ports nécessaires ouverts
- [ ] Accès SSH restreint à votre IP (recommandé)

### 2. Nginx (Reverse Proxy)
- [ ] Configuration nginx.conf copiée
- [ ] Nginx redémarré avec la nouvelle config
- [ ] Routes /api/* fonctionnelles
- [ ] Rate limiting actif

### 3. SSL/HTTPS (si domaine disponible)
- [ ] Nom de domaine pointé vers l'IP EC2
- [ ] Certbot installé
- [ ] Certificat SSL obtenu
- [ ] Redirection HTTP->HTTPS active
- [ ] HTTPS fonctionnel

---

## 🧪 Tests de validation

### 1. Tests fonctionnels
- [ ] Création d'un utilisateur test
- [ ] Login fonctionnel
- [ ] API Core Orders accessible
- [ ] Chatbot répond correctement
- [ ] Geo-tracking retourne des données
- [ ] Notifications envoyées

### 2. Tests de charge (optionnel)
- [ ] CPU < 70% en utilisation normale
- [ ] RAM < 80% en utilisation normale
- [ ] Temps de réponse < 500ms
- [ ] Pas de timeout

### 3. Monitoring
- [ ] Logs accessibles et propres
- [ ] Script monitor.sh fonctionnel
- [ ] Aucune erreur critique dans les logs

---

## 📊 Monitoring et Backups

### 1. Monitoring
- [ ] Script monitor.sh testé
- [ ] CloudWatch configuré (optionnel)
- [ ] Alertes configurées (optionnel)

### 2. Backups
- [ ] Script backup-mongodb.sh testé
- [ ] Cron job de backup configuré (2h du matin)
- [ ] Premier backup créé manuellement
- [ ] Restauration testée (recommandé)

### 3. Maintenance
- [ ] Script deploy.sh testé
- [ ] Procédure de mise à jour documentée
- [ ] Contact support défini

---

## 📝 Documentation

### 1. Documentation interne
- [ ] IP publique documentée
- [ ] Credentials sauvegardés (coffre-fort)
- [ ] Architecture réseau documentée
- [ ] Procédures de rollback définies

### 2. Accès
- [ ] Fichier .pem sauvegardé en lieu sûr
- [ ] Accès partagé avec l'équipe si nécessaire
- [ ] Documentation des ports et services

---

## 🎯 Post-déploiement

### 1. Communication
- [ ] Équipe informée du nouveau déploiement
- [ ] URLs de production partagées
- [ ] Documentation accessible

### 2. Optimisation des coûts
- [ ] Instance dimensionnée correctement
- [ ] Volumes optimisés
- [ ] CloudWatch logs configurés avec rétention
- [ ] Reserved Instance considérée (pour économiser)

### 3. Prochaines étapes
- [ ] Planifier migration vers MongoDB Atlas (recommandé)
- [ ] Configurer CI/CD (GitHub Actions)
- [ ] Mettre en place un environnement de staging
- [ ] Configurer Route 53 pour DNS (si domaine)
- [ ] Considérer Load Balancer + Auto-scaling
- [ ] Implémenter monitoring avancé (Prometheus/Grafana)

---

## 🚨 Troubleshooting rapide

### Problème: Conteneurs ne démarrent pas
```bash
docker-compose -f docker-compose.production.yml logs <service>
docker ps -a
df -h  # Vérifier l'espace disque
```

### Problème: Port déjà utilisé
```bash
sudo netstat -tlnp | grep <PORT>
sudo kill <PID>
```

### Problème: Manque de mémoire
```bash
free -h
docker stats
# Considérer une instance plus grande
```

### Problème: MongoDB refuse connexions
```bash
docker logs rt-mongodb-prod
# Vérifier le mot de passe dans .env
```

---

## 📞 Contacts utiles

- **Support AWS**: https://console.aws.amazon.com/support/
- **Documentation EC2**: https://docs.aws.amazon.com/ec2/
- **Docker Compose**: https://docs.docker.com/compose/

---

**Version**: 1.0
**Date**: 18 Novembre 2025
