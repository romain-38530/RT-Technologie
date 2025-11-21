# 🚀 QuickStart - Service Client Onboarding

**Dernière mise à jour** : 18 Novembre 2025
**Version** : 1.0.0

---

## ⚡ Démarrage Rapide

### Service Local (Actuel)

```bash
# Vérifier le statut
pm2 status

# Redémarrer si nécessaire
pm2 restart client-onboarding

# Voir les logs
pm2 logs client-onboarding

# Tester
curl http://localhost:3020/health
```

**Résultat attendu** : `{"status":"ok","service":"client-onboarding","port":"3020"}`

---

## 📋 Commandes Essentielles

### PM2 (Production Locale)

```bash
# Status
pm2 status

# Redémarrer
pm2 restart client-onboarding

# Logs en temps réel
pm2 logs client-onboarding --lines 50

# Monitoring
pm2 monit

# Sauvegarder la config
pm2 save
```

### Docker (Tests Locaux)

```bash
# Démarrer
cd services/client-onboarding
docker-compose up -d

# Logs
docker-compose logs -f

# Arrêter
docker-compose down

# Rebuild
docker-compose up -d --build
```

### Git

```bash
# Statut
git status

# Voir les commits
git log --oneline -5

# Pousser vers GitHub
git push origin dockerfile
```

---

## 🧪 Tests Rapides

### Health Check

```bash
curl http://localhost:3020/health
```

### Vérification TVA

```bash
curl -X POST http://localhost:3020/api/onboarding/verify-vat \
  -H "Content-Type: application/json" \
  -d '{"vatNumber":"BE0477472701"}'
```

### MongoDB

```bash
cd services/client-onboarding
node tests/test-mongodb.js
```

---

## 🌐 Déploiement AWS (3 Étapes)

### Prérequis

1. **Installer AWS CLI** : https://awscli.amazonaws.com/AWSCLIV2.msi

2. **Configurer AWS**:
```bash
aws configure
# Access Key ID: AKIAQCIFTCPW7JIPVWDG
# Secret Access Key: [voir README_AWS_DEPLOY.md]
# Region: eu-west-1
# Output: json
```

3. **Vérifier**:
```bash
aws sts get-caller-identity
# Doit afficher Account: 004843574253
```

### Déploiement

```bash
# Étape 1 : Infrastructure (une fois)
bash scripts/setup-aws-infrastructure.sh

# Étape 2 : Secrets (une fois)
bash scripts/setup-aws-secrets.sh

# Étape 3 : Déploiement
bash scripts/deploy-aws-ecs.sh
```

### Vérification AWS

```bash
# Status du service
aws ecs describe-services \
  --cluster rt-production \
  --services client-onboarding \
  --region eu-west-1

# Logs
aws logs tail /ecs/rt-client-onboarding --follow --region eu-west-1
```

---

## 📂 Fichiers Importants

### Configuration

- **Local** : `services/client-onboarding/.env.production`
- **PM2** : `services/client-onboarding/ecosystem.config.js`
- **Docker** : `services/client-onboarding/Dockerfile`
- **AWS** : `infra/aws/ecs-task-definition.json`

### Documentation

- **Accès rapide** : [README_ONBOARDING.md](README_ONBOARDING.md)
- **Production** : [services/client-onboarding/README_PRODUCTION.md](services/client-onboarding/README_PRODUCTION.md)
- **AWS** : [docs/AWS_INSTALLATION_WINDOWS.md](docs/AWS_INSTALLATION_WINDOWS.md)
- **Système** : [docs/CLIENT_ONBOARDING_SYSTEM.md](docs/CLIENT_ONBOARDING_SYSTEM.md)

### Scripts

- **AWS Infrastructure** : `scripts/setup-aws-infrastructure.sh`
- **AWS Secrets** : `scripts/setup-aws-secrets.sh`
- **AWS Deploy** : `scripts/deploy-aws-ecs.sh`
- **Local Deploy** : `scripts/deploy-onboarding.sh`

---

## 🛠️ Dépannage Rapide

### Service ne répond pas

```bash
# 1. Vérifier PM2
pm2 status

# 2. Voir les erreurs
pm2 logs client-onboarding --err --lines 50

# 3. Redémarrer
pm2 restart client-onboarding

# 4. Tester MongoDB
cd services/client-onboarding
node tests/test-mongodb.js
```

### Port 3020 déjà utilisé

```bash
# Windows : Trouver le processus
netstat -ano | findstr :3020

# Tuer le processus
taskkill /PID <PID> /F

# Redémarrer PM2
pm2 restart client-onboarding
```

### Erreur MongoDB

```bash
# Tester la connexion
cd services/client-onboarding
node tests/test-mongodb.js

# Vérifier l'URI
cat .env.production | grep MONGODB_URI
```

---

## 📊 Monitoring

### Métriques PM2

```bash
# Dashboard temps réel
pm2 monit

# Informations détaillées
pm2 describe client-onboarding

# Utilisation ressources
pm2 list
```

### Logs

```bash
# Logs PM2 (local)
pm2 logs client-onboarding

# Logs fichiers
tail -f services/client-onboarding/logs/out.log
tail -f services/client-onboarding/logs/error.log

# Logs AWS (si déployé)
aws logs tail /ecs/rt-client-onboarding --follow --region eu-west-1
```

---

## 🔄 Mise à Jour du Service

### Local

```bash
# 1. Pull les changements
git pull origin dockerfile

# 2. Installer les dépendances
cd services/client-onboarding
npm install

# 3. Redémarrer PM2
pm2 restart client-onboarding
```

### AWS

```bash
# Redéploiement automatique
bash scripts/deploy-aws-ecs.sh
# Rolling update sans interruption
```

---

## 🔒 Sécurité

### Rotation des Secrets

```bash
# 1. Générer nouveaux secrets
openssl rand -hex 32  # Pour chaque secret

# 2. Mettre à jour .env.production
nano services/client-onboarding/.env.production

# 3. Redémarrer
pm2 restart client-onboarding

# 4. Pour AWS : mettre à jour Secrets Manager
aws secretsmanager update-secret \
  --secret-id rt/client-onboarding/jwt-secret \
  --secret-string "NOUVEAU_SECRET" \
  --region eu-west-1
```

### Vérifier les Permissions

```bash
# Vérifier que .env n'est pas dans Git
git status
# Ne devrait PAS afficher .env ou .env.production

# Vérifier .gitignore
cat .gitignore | grep .env
```

---

## 📞 Ressources

### Documentation Complète

| Guide | Usage |
|-------|-------|
| [README_ONBOARDING.md](README_ONBOARDING.md) | Accès rapide |
| [README_PRODUCTION.md](services/client-onboarding/README_PRODUCTION.md) | Guide production backend |
| [AWS_INSTALLATION_WINDOWS.md](docs/AWS_INSTALLATION_WINDOWS.md) | Installation AWS |
| [VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md) | Déploiement frontend |
| [CLIENT_ONBOARDING_SYSTEM.md](docs/CLIENT_ONBOARDING_SYSTEM.md) | Documentation technique complète |

### Liens Externes

- **MongoDB Atlas** : https://cloud.mongodb.com/
- **Mailgun** : https://app.mailgun.com/
- **AWS Console** : https://console.aws.amazon.com/
- **PM2 Docs** : https://pm2.keymetrics.io/docs/

---

## ✅ Checklist Quotidienne

### Matin

- [ ] Vérifier `pm2 status` → doit être "online"
- [ ] Tester `curl http://localhost:3020/health` → doit retourner OK
- [ ] Vérifier les logs : `pm2 logs client-onboarding --lines 10`
- [ ] Pas d'erreurs dans les logs

### Soir

- [ ] Sauvegarder la config PM2 : `pm2 save`
- [ ] Vérifier l'uptime : `pm2 status`
- [ ] Backup MongoDB (optionnel)

### Hebdomadaire

- [ ] Vérifier les mises à jour : `npm outdated`
- [ ] Nettoyer les logs : `pm2 flush`
- [ ] Vérifier l'espace disque
- [ ] Tester la vérification TVA

---

## 💡 Astuces

### Commandes Alias (Optionnel)

Ajoutez à votre `~/.bashrc` ou `~/.zshrc` :

```bash
# Client Onboarding
alias co-status='pm2 status client-onboarding'
alias co-logs='pm2 logs client-onboarding'
alias co-restart='pm2 restart client-onboarding'
alias co-health='curl http://localhost:3020/health'
alias co-test='cd ~/RT-Technologie/services/client-onboarding && npm test'
```

### Variables d'Environnement

```bash
# Ajouter au .bashrc / .zshrc
export RT_SERVICE_PATH="~/RT-Technologie/services/client-onboarding"
export RT_HEALTH_URL="http://localhost:3020/health"

# Utiliser
cd $RT_SERVICE_PATH
curl $RT_HEALTH_URL
```

---

## 🎯 Prochaines Étapes

### Immédiat

- [x] Service déployé localement
- [x] Tests validés
- [x] Documentation complète
- [x] Frontend marketing-site créé
- [ ] Push vers GitHub : `git push origin dockerfile`
- [ ] Déployer frontend sur Vercel

### Court Terme (Cette Semaine)

- [ ] Installer AWS CLI
- [ ] Configurer AWS credentials
- [ ] Déployer backend sur AWS ECS
- [ ] Déployer frontend sur Vercel
- [ ] Configurer CORS backend pour Vercel

### Moyen Terme (Ce Mois)

- [ ] Ajouter Load Balancer AWS (optionnel)
- [ ] Configurer SSL/TLS
- [ ] Mettre en place monitoring CloudWatch
- [ ] Créer des alertes

### Long Terme (3 Mois)

- [ ] CI/CD avec GitHub Actions
- [ ] Tests automatisés
- [ ] Monitoring avancé
- [ ] Backups automatiques

---

**Le service est opérationnel ! 🚀**

**Pour toute question** : Consultez la documentation dans `docs/`
