# 🚀 INSTRUCTIONS IMMÉDIATES - Mise en Ligne

**Tout est prêt ! Suivez ces étapes exactes :**

---

## 📋 ÉTAPE 1 : Installer Ngrok (2 minutes)

### Option A : Téléchargement Manuel (Recommandé)

1. **Télécharger Ngrok**
   - URL : https://ngrok.com/download
   - Cliquer sur "Download for Windows"
   - Sauvegarder `ngrok-v3-stable-windows-amd64.zip`

2. **Extraire**
   - Décompresser le ZIP
   - Placer `ngrok.exe` dans : `C:\ngrok\`

3. **Vérifier**
   ```powershell
   C:\ngrok\ngrok.exe version
   ```

### Option B : Via PowerShell Administrateur

```powershell
# Ouvrir PowerShell en tant qu'Administrateur
# Clic droit sur PowerShell → Exécuter en tant qu'administrateur

choco install ngrok -y
```

---

## 📋 ÉTAPE 2 : Lancer le Tunnel (30 secondes)

### Ouvrir un nouveau terminal PowerShell

```powershell
# Si installé dans C:\ngrok\
C:\ngrok\ngrok.exe http 3020

# OU si installé via Chocolatey
ngrok http 3020
```

### Résultat Attendu

```
ngrok

Session Status                online
Forwarding                    https://abc-123-xyz.ngrok.io -> http://localhost:3020

Web Interface                 http://127.0.0.1:4040
```

### ⚠️ IMPORTANT

**📝 COPIER L'URL HTTPS** (exemple : `https://abc-123-xyz.ngrok.io`)

**⏱️ LAISSER CE TERMINAL OUVERT** pendant toute la durée d'utilisation !

---

## 📋 ÉTAPE 3 : Vérifier le Tunnel (10 secondes)

### Dans un autre terminal PowerShell

```powershell
# Remplacer par VOTRE URL Ngrok
curl https://abc-123-xyz.ngrok.io/health
```

### Résultat Attendu

```json
{"status":"ok","service":"client-onboarding","port":"3020"}
```

✅ **Si vous voyez ceci, le tunnel fonctionne !**

---

## 📋 ÉTAPE 4 : Déployer sur Vercel (10 minutes)

### 4.1 Se Connecter à Vercel

1. **Ouvrir** : https://vercel.com/login
2. **Se connecter** avec GitHub
3. **Autoriser** l'accès au repository

### 4.2 Créer un Nouveau Projet

1. **Ouvrir** : https://vercel.com/new
2. **Chercher** : "RT-Technologie"
3. **Cliquer** : "Import"

### 4.3 Configurer le Projet

**Configuration Exacte** :

```
Project Name: rt-technologie-onboarding
Framework Preset: Next.js ✅ (auto-détecté)
Root Directory: apps/marketing-site  👈 TRÈS IMPORTANT !

Build Settings (laisser par défaut):
- Build Command: npm run build
- Output Directory: .next
- Install Command: npm install
```

### 4.4 Ajouter la Variable d'Environnement

**Cliquer sur "Environment Variables"**

```
Name: NEXT_PUBLIC_API_URL
Value: https://abc-123-xyz.ngrok.io  👈 VOTRE URL Ngrok (celle que vous avez copiée)
Environment: Production ✅
```

**Cliquer "Add"**

### 4.5 Déployer

1. **Cliquer** : "Deploy"
2. **Attendre** : 2-3 minutes
3. **Voir** le build en temps réel

### 4.6 Récupérer l'URL

**Une fois le déploiement terminé** :

Vercel affiche : `https://rt-technologie-onboarding-xxxxx.vercel.app`

**📝 COPIER CETTE URL**

---

## 📋 ÉTAPE 5 : Tester (1 minute)

### 5.1 Ouvrir le Site

**Dans votre navigateur** :
```
https://rt-technologie-onboarding-xxxxx.vercel.app
```

Vous devriez voir : **Page d'inscription RT Technologie**

### 5.2 Tester la Vérification TVA

1. **Sur la page**, dans le champ "Numéro de TVA"
2. **Entrer** : `BE0477472701`
3. **Cliquer** : "Vérifier et continuer"

### Résultat Attendu

✅ Les champs se remplissent automatiquement :
- Raison sociale : SA ODOO
- Adresse : Chaussée de Namur 40, 1367 Ramillies

### 5.3 Test Complet (Optionnel)

1. **Remplir** toutes les étapes du formulaire
2. **Sélectionner** un type d'abonnement
3. **Valider** → Un contrat PDF est généré
4. **Signer** sur la page de signature

---

## ✅ RÉSULTAT FINAL

**Votre système est maintenant en ligne !**

| Service | URL |
|---------|-----|
| **Frontend** | https://rt-technologie-onboarding-xxxxx.vercel.app |
| **Backend (via Ngrok)** | https://abc-123-xyz.ngrok.io |
| **Backend Local** | http://localhost:3020 |
| **Ngrok Dashboard** | http://127.0.0.1:4040 |

---

## 🎯 CE QUI FONCTIONNE

### Pages Disponibles

- **`/onboarding`** - Formulaire d'inscription (5 étapes)
- **`/sign-contract/[id]`** - Signature électronique

### Fonctionnalités Actives

- ✅ Vérification TVA automatique (VIES + INSEE)
- ✅ Auto-remplissage données entreprise
- ✅ Génération de contrats PDF personnalisés
- ✅ Signature électronique conforme eIDAS
- ✅ Emails automatiques (Mailgun)
- ✅ Responsive mobile + desktop
- ✅ HTTPS sécurisé

---

## 🌐 DOMAINE CUSTOM (Optionnel)

### Pour avoir onboarding.rt-technologie.com

#### 1. Dans Vercel

1. **Aller dans** : Settings → Domains
2. **Ajouter** : `onboarding.rt-technologie.com`

#### 2. Chez Votre Registrar (OVH, etc.)

**Ajouter un enregistrement CNAME** :

```
Type: CNAME
Nom: onboarding
Valeur: cname.vercel-dns.com
TTL: 3600
```

#### 3. Attendre

- **Propagation DNS** : 5-60 minutes
- **SSL** : Activé automatiquement par Vercel

#### 4. Tester

```
https://onboarding.rt-technologie.com
```

---

## 📊 MONITORING

### Ngrok Dashboard

**Ouvrir** : http://127.0.0.1:4040

**Voir** :
- Toutes les requêtes HTTP en temps réel
- Headers complets
- Temps de réponse
- Erreurs

### Backend Logs

```powershell
pm2 logs client-onboarding --lines 50
```

### Vercel Logs

1. Aller sur https://vercel.com/dashboard
2. Sélectionner le projet
3. Onglet "Deployments"
4. Cliquer sur le déploiement → "View Function Logs"

---

## ⚠️ IMPORTANT : Limitations Ngrok Gratuit

### Ce qui peut arriver

1. **URL change** si vous redémarrez Ngrok
   - **Solution** : Mettre à jour la variable Vercel et redéployer

2. **40 connexions/minute max**
   - **Solution** : Passer au plan Pro ($10/mois) ou déployer sur AWS

3. **Terminal doit rester ouvert**
   - **Solution** : Laisser l'ordinateur allumé

### Solutions Long Terme

**Déployer le backend sur AWS ECS** (recommandé) :
- URL fixe et stable
- Pas de limite de connexions
- Pas besoin de Ngrok
- **Guide** : [README_AWS_DEPLOY.md](README_AWS_DEPLOY.md)

---

## 🔧 DÉPANNAGE

### ❌ "Network Error" sur le frontend

**Causes** :
1. Ngrok n'est pas lancé
2. Variable `NEXT_PUBLIC_API_URL` incorrecte
3. Backend PM2 arrêté

**Solutions** :
```powershell
# 1. Vérifier Ngrok
# Le terminal Ngrok doit être ouvert

# 2. Vérifier PM2
pm2 status

# 3. Tester le tunnel
curl https://abc-123-xyz.ngrok.io/health

# 4. Redémarrer PM2 si nécessaire
pm2 restart client-onboarding
```

### ❌ Erreur CORS

**Symptôme** : "Access-Control-Allow-Origin" error dans la console

**Solution** :
```powershell
# Le CORS est déjà configuré pour accepter toutes les origines
# Si problème persiste, redémarrer PM2
pm2 restart client-onboarding
```

### ❌ Build Vercel échoue

**Cause** : Root Directory incorrect

**Solution** :
1. Aller dans Settings → General
2. Vérifier : Root Directory = `apps/marketing-site`
3. Redéployer

---

## 📞 BESOIN D'AIDE ?

### Documentation Complète

- [GUIDE_DEPLOIEMENT_IMMEDIAT.md](GUIDE_DEPLOIEMENT_IMMEDIAT.md) - Guide détaillé
- [INDEX_DOCUMENTATION.md](INDEX_DOCUMENTATION.md) - Index complet
- [DEPLOIEMENT_VERCEL_3_MINUTES.md](DEPLOIEMENT_VERCEL_3_MINUTES.md) - Guide rapide

### Vérifications

```powershell
# Backend PM2
pm2 status
pm2 logs client-onboarding

# Backend direct
curl http://localhost:3020/health

# Backend via Ngrok
curl https://abc-123-xyz.ngrok.io/health
```

---

## 🎊 C'EST PARTI !

**Récapitulatif des 5 étapes** :

1. ✅ Télécharger et installer Ngrok
2. ✅ Lancer `ngrok http 3020`
3. ✅ Copier l'URL HTTPS
4. ✅ Déployer sur Vercel avec cette URL
5. ✅ Tester le site

**Temps total** : 15 minutes

**Résultat** : Système d'onboarding accessible sur Internet ! 🚀

---

**Prêt ? Commencez par télécharger Ngrok :** https://ngrok.com/download

---

**Dernière mise à jour** : 18 Novembre 2025, 15h00
