# Deploiement Railway.app - LA SOLUTION SIMPLE

**Temps** : 5 minutes
**Interface** : 100% web, zero ligne de commande
**Cout** : Gratuit pour commencer (500h/mois)

---

## Etape 1 : Creer un Compte Railway (1 minute)

1. Aller sur : **https://railway.app/**
2. Cliquer sur **"Login"** en haut a droite
3. Choisir **"Login with GitHub"**
4. Autoriser Railway a acceder a votre compte GitHub
5. Vous etes connecte !

---

## Etape 2 : Creer un Nouveau Projet (30 secondes)

1. Sur le dashboard Railway, cliquer **"New Project"**
2. Choisir **"Deploy from GitHub repo"**
3. Railway affiche vos repositories
4. Chercher et selectionner : **"RT-Technologie"**
5. Railway commence a analyser le repo

---

## Etape 3 : Configurer le Service (2 minutes)

Railway va detecter automatiquement votre Dockerfile !

1. Railway cree automatiquement un service
2. Cliquer sur le service cree
3. Aller dans l'onglet **"Settings"**
4. Dans **"Root Directory"**, entrer : `services/client-onboarding`
5. Cliquer **"Save Changes"**

---

## Etape 4 : Ajouter les Variables d'Environnement (1 minute)

1. Dans le service, cliquer sur l'onglet **"Variables"**
2. Cliquer **"+ New Variable"**
3. Ajouter ces variables UNE PAR UNE :

```
MONGODB_URI
mongodb+srv://Admin:SETT.38530@stagingrt.v2jnoh2.mongodb.net/rt_technologie

JWT_SECRET
ab2325974ab77ea4c3892803b09bea2650c9cb5284e2df983ce8ac34c97efeec

SMTP_HOST
smtp.eu.mailgun.org

SMTP_PORT
587

SMTP_USER
postmaster@mg.rt-technologie.com

SMTP_PASSWORD
f30e11eb5824d2194c1851bd1c142fbb-e80d8b76-ff2acfa2

SMTP_FROM
postmaster@mg.rt-technologie.com

NODE_ENV
production

PORT
3020
```

4. Cliquer **"Add"** pour chaque variable

---

## Etape 5 : Deployer (30 secondes)

1. Railway commence automatiquement a deployer
2. Vous verrez les logs de build en temps reel
3. Attendre que le statut passe a **"Active"** (2-3 minutes)

---

## Etape 6 : Obtenir l'URL Publique (30 secondes)

1. Dans le service, aller dans l'onglet **"Settings"**
2. Section **"Networking"**
3. Cliquer **"Generate Domain"**
4. Railway genere une URL comme : `rt-client-onboarding-production.up.railway.app`
5. **COPIER CETTE URL** !

---

## Etape 7 : Tester (30 secondes)

Dans votre navigateur, aller sur :

```
https://VOTRE-URL-RAILWAY.up.railway.app/health
```

Vous devriez voir :
```json
{"status":"ok","service":"client-onboarding","port":"3020"}
```

---

## RESULTAT

Vous avez maintenant :
- Backend deploye sur Railway
- URL HTTPS automatique : `https://VOTRE-URL.up.railway.app`
- Gratuit pour commencer

---

## Etape 8 : Deployer le Frontend sur Vercel (5 minutes)

Maintenant que vous avez l'URL Railway, deployons le frontend :

### 8.1 Aller sur Vercel

1. Ouvrir : **https://vercel.com/new**
2. Se connecter avec GitHub
3. Autoriser Vercel

### 8.2 Importer le Projet

1. Chercher : **RT-Technologie**
2. Cliquer **"Import"**

### 8.3 Configuration

```
Project Name: rt-technologie-onboarding
Framework Preset: Next.js (auto-detecte)
Root Directory: apps/marketing-site
```

### 8.4 Variable d'Environnement

1. Cliquer **"Environment Variables"**
2. Ajouter :
   ```
   Name: NEXT_PUBLIC_API_URL
   Value: https://VOTRE-URL-RAILWAY.up.railway.app
   ```
3. Cliquer **"Add"**

### 8.5 Deployer

1. Cliquer **"Deploy"**
2. Attendre 2-3 minutes
3. Vercel vous donne une URL : `https://rt-technologie-xxxxx.vercel.app`

---

## Etape 9 : TESTER LE SYSTEME COMPLET (1 minute)

1. Ouvrir l'URL Vercel dans votre navigateur
2. Vous etes redirige vers `/onboarding`
3. Tester la verification TVA :
   - Entrer : `BE0477472701`
   - Cliquer "Verifier et continuer"
   - Les donnees doivent se remplir automatiquement !

---

## ARCHITECTURE FINALE

```
Internet
    |
    v
Frontend Vercel (Global CDN)
    |
    v
Backend Railway (HTTPS)
    |
    v
MongoDB Atlas (Database)
```

---

## URLs Finales

| Service | URL |
|---------|-----|
| **Frontend** | https://rt-technologie-xxxxx.vercel.app |
| **Backend** | https://VOTRE-URL.up.railway.app |
| **Health Check** | https://VOTRE-URL.up.railway.app/health |

---

## Avantages Railway vs AWS

- ✅ **Plus simple** : Interface web uniquement
- ✅ **Plus rapide** : 5 minutes vs 30+ minutes
- ✅ **HTTPS automatique** : Pas de configuration
- ✅ **Logs en temps reel** : Dans l'interface
- ✅ **Gratuit pour commencer** : 500h/mois
- ✅ **Pas de ligne de commande** : Tout en clics

---

## Monitoring

### Logs Railway

1. Aller dans votre service Railway
2. Onglet **"Deployments"**
3. Cliquer sur le deploiement actif
4. Voir les logs en temps reel

### Metrics

1. Onglet **"Metrics"**
2. Voir CPU, RAM, Requetes

---

## Cout

**Plan Hobby (Gratuit)** :
- 500 heures d'execution/mois
- $5 de credit gratuit
- Suffisant pour tester

**Plan Developer ($5/mois)** :
- Execution illimitee
- Plus de resources

---

## Support

Si probleme :
- Dashboard Railway : https://railway.app/dashboard
- Docs Railway : https://docs.railway.app/

---

## C'EST PARTI !

**Action immediate** :
1. Aller sur https://railway.app/
2. Login with GitHub
3. New Project > Deploy from GitHub repo
4. Selectionner RT-Technologie
5. Suivre les etapes ci-dessus

**Temps total** : 10 minutes (Railway + Vercel)
**Resultat** : Systeme complet en production ! 🚀

---

**BEAUCOUP PLUS SIMPLE QU'AWS !**
