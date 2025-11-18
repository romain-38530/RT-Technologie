# 🚀 Checklist de Configuration Production - Service Client Onboarding

**Date** : 18 Janvier 2025
**Service** : Client Onboarding
**Port** : 3020

---

## ✅ Configuration Complétée

### 1. MongoDB Atlas

**Statut** : ✅ Cluster créé et configuré

**Informations** :
- **Cluster** : stagingrt.v2jnoh2.mongodb.net
- **App Name** : StagingRT
- **IP Whitelistée** : 77.205.88.170
- **Base de données** : rt_technologie

**URI de connexion** :
```
mongodb+srv://<db_username>:<db_password>@stagingrt.v2jnoh2.mongodb.net/rt_technologie?retryWrites=true&w=majority&appName=StagingRT
```

**Service Account créé** :
- Client ID : `mdb_sa_id_69162397e0eb4e727d820df7`
- Client Secret : `mdb_sa_sk_tCC0rwyToItuF50DC501806lQqFrrK7m8PXFPRLS`

⚠️ **Note** : Le Service Account est pour l'administration. Pour le service Node.js, vous devez créer un utilisateur de base de données classique (voir étape 3).

### 2. Secrets Générés

**Statut** : ✅ Secrets forts générés automatiquement

Les secrets suivants ont été générés et sont déjà configurés dans `.env.production` :

- ✅ JWT_SECRET : `ab2325974ab77ea4c3892803b09bea2650c9cb5284e2df983ce8ac34c97efeec`
- ✅ INTERNAL_SERVICE_TOKEN : `32fdb38dab497f9ad934008bcea6d14327a598bbe8b944742fa49adb4612e2aa`
- ✅ SESSION_SECRET : `66ba4605e2901e4e0113065178ee6ce08ff6828f96a000529f7a1134a7f268fa`

---

## 📋 Étapes Restantes à Compléter

### 3. Créer l'Utilisateur MongoDB (REQUIS)

**Statut** : ⏳ À faire

**Actions** :
1. Connectez-vous à https://cloud.mongodb.com/
2. Allez dans **Database Access**
3. Cliquez sur **Add New Database User**
4. Configurez :
   - **Authentication Method** : Password
   - **Username** : `rt_admin` (recommandé)
   - **Password** : Générez un mot de passe fort (min 16 caractères)
   - **Database User Privileges** : Built-in Role → **Read and write to any database**
5. Cliquez sur **Add User**
6. **Copiez le mot de passe** dans un endroit sûr

**Ensuite, éditez le fichier** [services/client-onboarding/.env.production](../services/client-onboarding/.env.production) :

```bash
# Remplacez <db_username> et <db_password> par vos credentials
MONGODB_URI=mongodb+srv://rt_admin:VOTRE_MOT_DE_PASSE_ICI@stagingrt.v2jnoh2.mongodb.net/rt_technologie?retryWrites=true&w=majority&appName=StagingRT
```

### 4. Configurer SMTP (REQUIS pour les emails)

**Statut** : ⏳ À faire

**Option recommandée : SendGrid** (gratuit jusqu'à 100 emails/jour)

**Actions** :
1. Créez un compte sur https://sendgrid.com/
2. Vérifiez votre email
3. Allez dans **Settings** → **API Keys**
4. Cliquez sur **Create API Key**
5. Nom : `RT-Technologie-Onboarding`
6. Permissions : **Full Access**
7. Cliquez sur **Create & View**
8. **Copiez l'API Key** (elle ne sera affichée qu'une fois !)

**Ensuite, éditez** [services/client-onboarding/.env.production](../services/client-onboarding/.env.production) :

```bash
# Remplacez <SENDGRID_API_KEY>
SMTP_PASSWORD=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Guide complet** : [docs/SMTP_CONFIGURATION.md](SMTP_CONFIGURATION.md)

**Autres options SMTP** :
- Gmail (si GSuite/Workspace)
- Amazon SES (scalable)
- Mailgun (flexible)

### 5. Tester la Configuration

**Statut** : ⏳ À faire après étapes 3 & 4

**Test 1 : Connexion MongoDB**

```bash
cd services/client-onboarding
node tests/test-mongodb.js
```

**Résultat attendu** :
```
✅ Connexion réussie !
📊 Base de données: rt_technologie
✅ Document inséré
✅ Document lu
✅ TOUS LES TESTS RÉUSSIS !
```

**Test 2 : Démarrage du Service**

```bash
cd services/client-onboarding
cp .env.production .env
npm start
```

**Résultat attendu** :
```
✅ Connected to MongoDB
🚀 RT-Technologie Client Onboarding Service running on port 3020
```

**Test 3 : Health Check**

```bash
curl http://localhost:3020/health
```

**Résultat attendu** :
```json
{"status":"ok","service":"client-onboarding","version":"1.0.0"}
```

**Test 4 : Vérification TVA**

```bash
curl -X POST http://localhost:3020/api/onboarding/verify-vat \
  -H "Content-Type: application/json" \
  -d '{"vatNumber": "BE0477472701"}'
```

**Résultat attendu** :
```json
{
  "success": true,
  "data": {
    "valid": true,
    "companyName": "SA ODOO",
    "companyAddress": "Chaussée de Namur 40\n1367 Ramillies",
    "source": "VIES"
  }
}
```

---

## 🚀 Déploiement en Production

### Option 1 : Déploiement Automatique avec PM2

**Pré-requis** :
- Node.js installé
- PM2 installé (`npm install -g pm2`)
- MongoDB configuré (étape 3)
- SMTP configuré (étape 4)

**Commande** :

```bash
# Depuis la racine du projet
bash scripts/deploy-onboarding.sh production
```

Le script va automatiquement :
1. ✅ Vérifier les pré-requis (Node.js, PM2)
2. ✅ Vérifier les variables d'environnement
3. ✅ Installer les dépendances
4. ✅ Démarrer/redémarrer le service avec PM2
5. ✅ Effectuer des health checks
6. ✅ Sauvegarder la configuration PM2

### Option 2 : Déploiement Manuel

```bash
cd services/client-onboarding

# Copier le fichier de production
cp .env.production .env

# Installer les dépendances
pnpm install

# Démarrer avec PM2
pm2 start src/server.js --name client-onboarding --env production

# Sauvegarder la configuration
pm2 save

# Configurer le démarrage automatique
pm2 startup
```

---

## 📊 Post-Déploiement

### Vérifications

- [ ] Service démarré : `pm2 status client-onboarding`
- [ ] Logs propres : `pm2 logs client-onboarding --lines 50`
- [ ] Health check OK : `curl http://localhost:3020/health`
- [ ] MongoDB connecté (voir logs)
- [ ] API TVA fonctionnelle (tester avec curl)

### Commandes Utiles

```bash
# Voir le statut
pm2 status client-onboarding

# Voir les logs en temps réel
pm2 logs client-onboarding

# Redémarrer
pm2 restart client-onboarding

# Arrêter
pm2 stop client-onboarding

# Monitoring interactif
pm2 monit

# Sauvegarder après modifications
pm2 save
```

### Configuration Reverse Proxy (Nginx)

Si vous souhaitez exposer le service sur Internet :

```nginx
# /etc/nginx/sites-available/onboarding.rt-technologie.com

server {
    listen 80;
    server_name onboarding.rt-technologie.com;

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
    }
}
```

**Activer HTTPS avec Let's Encrypt** :

```bash
sudo certbot --nginx -d onboarding.rt-technologie.com
```

---

## 📈 Monitoring

### PM2 Monitoring

```bash
# Monitoring en temps réel
pm2 monit

# Dashboard web
pm2 web
# Ouvrez http://localhost:9615
```

### Logs Centralisés

```bash
# Tous les logs
pm2 logs

# Seulement les erreurs
pm2 logs --err

# Dernières 100 lignes
pm2 logs --lines 100
```

### Alertes

Configurez des alertes pour :
- Service down
- Utilisation CPU > 80%
- Utilisation mémoire > 80%
- Erreurs fréquentes dans les logs

---

## 🔐 Sécurité

### Fichiers à NE JAMAIS Committer

- ❌ `.env`
- ❌ `.env.production`
- ❌ Tout fichier contenant des mots de passe/secrets

### .gitignore

Vérifiez que `.gitignore` contient :

```
.env
.env.*
*.log
node_modules/
tests/output/
```

### Sauvegarde des Secrets

Stockez les secrets dans un gestionnaire de mots de passe sécurisé :
- 1Password
- LastPass
- Bitwarden
- Azure Key Vault
- AWS Secrets Manager

---

## 📚 Documentation Complète

- **Système complet** : [docs/CLIENT_ONBOARDING_SYSTEM.md](CLIENT_ONBOARDING_SYSTEM.md)
- **Configuration MongoDB** : [docs/MONGODB_SETUP_GUIDE.md](MONGODB_SETUP_GUIDE.md)
- **Configuration SMTP** : [docs/SMTP_CONFIGURATION.md](SMTP_CONFIGURATION.md)
- **Script de déploiement** : [scripts/deploy-onboarding.sh](../scripts/deploy-onboarding.sh)
- **Résumé du déploiement** : [docs/ONBOARDING_DEPLOYMENT_SUMMARY.md](ONBOARDING_DEPLOYMENT_SUMMARY.md)

---

## 🆘 Support & Troubleshooting

### MongoDB : "Authentication failed"

➡️ Solution :
1. Vérifiez username et password dans `.env.production`
2. Vérifiez que l'utilisateur existe dans MongoDB Atlas > Database Access
3. Vérifiez les privilèges (Read and write to any database)

### MongoDB : "Connection timed out"

➡️ Solution :
1. Vérifiez que l'IP 77.205.88.170 est whitelistée
2. Allez dans MongoDB Atlas > Network Access
3. Ajoutez l'IP ou utilisez 0.0.0.0/0 (tests uniquement)

### SMTP : "Authentication failed"

➡️ Solution :
1. Vérifiez l'API key SendGrid
2. Vérifiez que l'API key a les permissions Full Access
3. Testez avec un email simple

### Service ne démarre pas

➡️ Solution :
1. Vérifiez les logs : `pm2 logs client-onboarding --lines 100`
2. Vérifiez que le port 3020 n'est pas déjà utilisé : `netstat -ano | findstr :3020`
3. Vérifiez que toutes les dépendances sont installées : `pnpm install`

---

## ✅ Checklist Finale

Avant de considérer le déploiement comme terminé :

- [ ] MongoDB Atlas cluster créé
- [ ] IP 77.205.88.170 whitelistée dans Network Access
- [ ] Utilisateur MongoDB `rt_admin` créé avec mot de passe fort
- [ ] MONGODB_URI configuré dans `.env.production`
- [ ] Compte SendGrid créé et API key générée
- [ ] SMTP_PASSWORD configuré dans `.env.production`
- [ ] Test MongoDB réussi (`node tests/test-mongodb.js`)
- [ ] Service démarré avec PM2
- [ ] Health check OK
- [ ] API TVA testée et fonctionnelle
- [ ] Génération PDF testée
- [ ] Email de test envoyé
- [ ] PM2 configuré pour démarrage automatique
- [ ] Reverse proxy configuré (si nécessaire)
- [ ] SSL configuré (si exposé publiquement)
- [ ] Monitoring activé
- [ ] Secrets sauvegardés dans gestionnaire sécurisé
- [ ] Documentation lue par l'équipe

---

**Temps estimé total** : 2-3 heures

**Prêt pour la production !** 🎉

---

**Contact Support** :
- Documentation : Ce dossier `docs/`
- MongoDB Support : https://support.mongodb.com/
- SendGrid Support : https://support.sendgrid.com/
