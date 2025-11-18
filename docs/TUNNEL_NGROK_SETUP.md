# 🌐 Configuration Tunnel Ngrok - Accès Backend depuis Vercel

**Pourquoi ?** Permettre au frontend Vercel d'accéder au backend local (PM2)

**Alternative temporaire** avant déploiement AWS ECS

**Temps** : 5 minutes

---

## 🎯 Vue d'Ensemble

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Vercel CDN    │────────▶│  Ngrok Tunnel    │────────▶│  Backend Local  │
│  (Frontend)     │         │  (HTTPS Public)  │         │  PM2:3020       │
│  Global Edge    │         │  https://xxx.io  │         │  localhost      │
└─────────────────┘         └──────────────────┘         └─────────────────┘
```

**Avantages** :
- ✅ Pas besoin de déployer le backend
- ✅ Tester le système complet rapidement
- ✅ HTTPS automatique
- ✅ Gratuit (plan de base)

**Inconvénients** :
- ⚠️ URL change à chaque redémarrage (plan gratuit)
- ⚠️ Dépend de votre machine locale
- ⚠️ Non adapté pour production finale

---

## 📥 Installation Ngrok

### Windows

**Option 1 : Chocolatey** (Recommandé)

```powershell
# Si Chocolatey pas installé, l'installer d'abord :
Set-ExecutionPolicy Bypass -Scope Process -Force
iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))

# Installer Ngrok
choco install ngrok
```

**Option 2 : Téléchargement Manuel**

1. Aller sur https://ngrok.com/download
2. Télécharger `ngrok-v3-stable-windows-amd64.zip`
3. Extraire dans `C:\ngrok\`
4. Ajouter au PATH :
   ```powershell
   $env:Path += ";C:\ngrok"
   ```

**Vérifier** :
```powershell
ngrok version
# Résultat : ngrok version 3.x.x
```

---

## 🔑 Configuration (Optionnel - Plan Gratuit)

### 1. Créer un Compte Ngrok (Gratuit)

1. Aller sur https://dashboard.ngrok.com/signup
2. S'inscrire (email + password)
3. Confirmer l'email

### 2. Récupérer le Token

1. Aller sur https://dashboard.ngrok.com/get-started/your-authtoken
2. Copier le token (exemple : `2abc...xyz`)

### 3. Configurer le Token

```powershell
ngrok config add-authtoken <VOTRE_TOKEN>
```

**Exemple** :
```powershell
ngrok config add-authtoken 2abc123xyz456def789
```

✅ Configuration sauvegardée dans `~/.ngrok2/ngrok.yml`

---

## 🚀 Lancer le Tunnel

### Commande de Base

```powershell
ngrok http 3020
```

**Résultat** :

```
ngrok                                                           (Ctrl+C to quit)

Session Status                online
Account                       your-email@example.com (Plan: Free)
Version                       3.5.0
Region                        Europe (eu)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok.io -> http://localhost:3020

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**🎯 URL à utiliser** : `https://abc123.ngrok.io`

### Options Avancées

**Avec sous-domaine personnalisé** (Plan payant) :
```powershell
ngrok http 3020 --subdomain=rt-backend
# URL : https://rt-backend.ngrok.io
```

**Avec région spécifique** :
```powershell
ngrok http 3020 --region=eu
# Serveurs européens (latence réduite)
```

**En arrière-plan** (Windows) :
```powershell
Start-Process ngrok -ArgumentList "http 3020" -WindowStyle Hidden
```

---

## 🔧 Configuration Vercel

### 1. Récupérer l'URL Ngrok

Copier l'URL HTTPS fournie :
```
https://abc123.ngrok.io
```

### 2. Configurer Vercel

**Via Interface Web** :
1. Aller sur https://vercel.com/dashboard
2. Sélectionner le projet `rt-onboarding`
3. Settings > Environment Variables
4. Modifier `NEXT_PUBLIC_API_URL` :
   - Value : `https://abc123.ngrok.io`
5. Save
6. Redéployer : Deployments > Redeploy

**Via CLI** :
```bash
vercel env rm NEXT_PUBLIC_API_URL production
vercel env add NEXT_PUBLIC_API_URL production
# Entrer : https://abc123.ngrok.io
vercel --prod
```

### 3. Configurer CORS Backend

Ajouter l'URL Ngrok dans les origines autorisées :

**Éditer** : `services/client-onboarding/src/server.js`

```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'https://rt-technologie.vercel.app',
  'https://rt-technologie-*.vercel.app',
  'https://*.ngrok.io',  // 👈 Ajouter ceci
];
```

**Redémarrer** :
```bash
pm2 restart client-onboarding
```

---

## 🧪 Tester

### 1. Vérifier le Tunnel

```bash
curl https://abc123.ngrok.io/health
```

**Résultat attendu** :
```json
{"status":"ok","service":"client-onboarding","port":"3020"}
```

### 2. Tester depuis Vercel

1. Ouvrir l'URL Vercel : `https://rt-technologie-xxxxx.vercel.app`
2. Aller sur `/onboarding`
3. Entrer un numéro de TVA : `BE0477472701`
4. Cliquer "Vérifier et continuer"
5. **Résultat** : Données entreprise remplies automatiquement ✅

### 3. Vérifier les Logs

**Ngrok Dashboard** : http://127.0.0.1:4040

- Voir toutes les requêtes HTTP
- Inspecter les headers
- Replay des requêtes
- Très utile pour débugger

---

## 📊 Monitoring Ngrok

### Dashboard Web (Local)

Ouvrir : http://127.0.0.1:4040

**Fonctionnalités** :
- ✅ Toutes les requêtes HTTP en temps réel
- ✅ Headers complets
- ✅ Body des requêtes/réponses
- ✅ Latence
- ✅ Replay de requêtes

### Logs Backend

```bash
pm2 logs client-onboarding --lines 50
```

---

## 🔄 URL Dynamique (Plan Gratuit)

**Problème** : L'URL change à chaque redémarrage

**Solutions** :

### Solution 1 : Script Automatique

Créer `update-vercel-url.ps1` :

```powershell
# Lancer Ngrok
$process = Start-Process ngrok -ArgumentList "http 3020" -PassThru -WindowStyle Hidden

# Attendre 3 secondes
Start-Sleep -Seconds 3

# Récupérer l'URL publique
$tunnels = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels"
$publicUrl = $tunnels.tunnels[0].public_url

Write-Host "URL Ngrok : $publicUrl"

# Mettre à jour Vercel (nécessite Vercel CLI)
vercel env rm NEXT_PUBLIC_API_URL production --yes
Write-Host $publicUrl | vercel env add NEXT_PUBLIC_API_URL production
vercel --prod

Write-Host "✅ Vercel mis à jour avec : $publicUrl"
```

**Utilisation** :
```powershell
.\update-vercel-url.ps1
```

### Solution 2 : URL Fixe (Plan Payant)

**Ngrok Pro** : $10/mois
- URL fixe : `https://rt-backend.ngrok.io`
- Plus besoin de mettre à jour Vercel

---

## 🛑 Arrêter le Tunnel

### Méthode 1 : Ctrl+C

Dans le terminal Ngrok :
```
Ctrl + C
```

### Méthode 2 : Tuer le Processus

```powershell
# Windows
Get-Process ngrok | Stop-Process -Force
```

---

## 🆚 Alternatives à Ngrok

### Cloudflare Tunnel

**Avantages** :
- ✅ Gratuit illimité
- ✅ URL fixe
- ✅ Plus de features

**Installation** :
```powershell
# Télécharger
# https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/

# Lancer
cloudflared tunnel --url http://localhost:3020
```

### LocalTunnel

**Installation** :
```bash
npm install -g localtunnel

# Lancer
lt --port 3020 --subdomain rt-backend
```

---

## 💰 Coûts Ngrok

### Plan Gratuit

- ✅ 1 tunnel actif
- ✅ HTTPS automatique
- ✅ 40 connexions/minute
- ⚠️ URL aléatoire à chaque redémarrage
- **Prix** : 0€

### Plan Personal ($10/mois)

- ✅ 3 tunnels actifs
- ✅ URL fixe (subdomain custom)
- ✅ 120 connexions/minute
- ✅ Support prioritaire
- **Prix** : $10/mois (~9€)

**Recommandation** : Plan gratuit suffit pour les tests

---

## 📋 Checklist

### Configuration

- [ ] Ngrok installé
- [ ] Token configuré (optionnel)
- [ ] Tunnel lancé : `ngrok http 3020`
- [ ] URL HTTPS récupérée

### Vercel

- [ ] Variable `NEXT_PUBLIC_API_URL` mise à jour
- [ ] Application redéployée
- [ ] Site Vercel accessible

### Backend

- [ ] PM2 service online
- [ ] CORS configuré avec `*.ngrok.io`
- [ ] Service redémarré

### Tests

- [ ] `curl https://<URL>.ngrok.io/health` fonctionne
- [ ] Vérification TVA fonctionne depuis Vercel
- [ ] Pas d'erreur CORS
- [ ] Ngrok dashboard affiche les requêtes

---

## 🐛 Dépannage

### Erreur "Tunnel not found"

**Cause** : Token non configuré (plan gratuit limité)

**Solution** : S'inscrire et configurer le token

### Erreur "Too many connections"

**Cause** : Limite du plan gratuit (40/min)

**Solution** :
1. Réduire la fréquence des requêtes
2. Passer au plan payant
3. Utiliser Cloudflare Tunnel (gratuit illimité)

### URL change tout le temps

**Cause** : Plan gratuit

**Solution** :
1. Utiliser le script PowerShell de mise à jour automatique
2. Passer au plan Personal ($10/mois)
3. Utiliser Cloudflare Tunnel (URL fixe gratuite)

---

## 🎯 Prochaines Étapes

Une fois les tests terminés avec Ngrok :

1. **Déployer le backend sur AWS ECS** (production finale)
   - Guide : [README_AWS_DEPLOY.md](../README_AWS_DEPLOY.md)

2. **Mettre à jour Vercel** avec l'URL AWS

3. **Supprimer le tunnel Ngrok** (plus nécessaire)

---

## ✅ Résumé

**Ngrok permet** :
- ✅ Accès HTTPS public au backend local
- ✅ Tester le système complet rapidement
- ✅ Pas besoin de déployer sur AWS immédiatement

**Limitations** :
- ⚠️ URL dynamique (plan gratuit)
- ⚠️ Dépend de la machine locale
- ⚠️ Non adapté pour production finale

**Alternative production** : Déployer sur AWS ECS (voir README_AWS_DEPLOY.md)

---

**Prêt à tester ! 🚀**

**Commande** : `ngrok http 3020`

---

**Dernière mise à jour** : 18 Novembre 2025
