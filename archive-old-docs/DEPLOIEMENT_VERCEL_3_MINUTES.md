# ⚡ Déploiement Vercel - Guide 3 Minutes

**Temps estimé** : 3 minutes
**Prérequis** : Compte Vercel (gratuit)
**Résultat** : Frontend accessible sur Internet

---

## 🎯 Étapes Rapides

### 1️⃣ Connexion Vercel (30 secondes)

**URL** : https://vercel.com/signup

- Cliquer "Continue with GitHub"
- Autoriser l'accès
- ✅ Connecté !

---

### 2️⃣ Import du Projet (1 minute)

**URL** : https://vercel.com/new

1. **Sélectionner le repository**
   ```
   Chercher : RT-Technologie
   Cliquer : Import
   ```

2. **Configurer le projet**
   ```
   Project Name : rt-onboarding (ou laisser par défaut)
   Framework Preset : Next.js (détecté automatiquement ✅)
   Root Directory : apps/marketing-site 👈 IMPORTANT !
   ```

3. **Build Settings** (laissez par défaut)
   ```
   Build Command : npm run build ✅
   Output Directory : .next ✅
   Install Command : npm install ✅
   ```

---

### 3️⃣ Variables d'Environnement (30 secondes)

**Cliquer sur "Environment Variables"**

Ajouter :
```
Name  : NEXT_PUBLIC_API_URL
Value : http://localhost:3020
```

⚠️ **Important** : Pour l'instant mettre `http://localhost:3020`
On changera après le déploiement AWS du backend.

**Ou utiliser un tunnel temporaire** :

Option A - Ngrok :
```bash
ngrok http 3020
# Utiliser l'URL fournie (ex: https://abc123.ngrok.io)
```

Option B - Cloudflare Tunnel :
```bash
cloudflared tunnel --url http://localhost:3020
# Utiliser l'URL fournie
```

---

### 4️⃣ Déploiement (1-2 minutes)

**Cliquer sur "Deploy"**

Vercel va :
- ✅ Cloner le repository
- ✅ Installer les dépendances
- ✅ Builder l'application
- ✅ Déployer sur le CDN global

**Attendre** : ~2 minutes

---

## 🎉 Résultat

**URL fournie** : `https://rt-technologie-xxxxx.vercel.app`

**Exemple** : `https://rt-technologie-abc123.vercel.app`

### Tester

1. **Ouvrir l'URL Vercel**
2. Vous serez redirigé vers `/onboarding`
3. **Tester la vérification TVA** :
   - Entrer : `BE0477472701`
   - Vérifier que les données se chargent

---

## ⚠️ Problèmes Courants

### Erreur "Network Error" ou "Failed to fetch"

**Cause** : Le backend n'est pas accessible depuis Vercel

**Solution 1** : Utiliser un tunnel (Ngrok ou Cloudflare)

```bash
# Windows PowerShell
ngrok http 3020

# Copier l'URL HTTPS fournie
# Exemple : https://abc123.ngrok.io

# Aller sur Vercel > Settings > Environment Variables
# Modifier NEXT_PUBLIC_API_URL
```

**Solution 2** : Déployer le backend sur AWS (voir README_AWS_DEPLOY.md)

### Erreur CORS

**Cause** : Le backend bloque les requêtes depuis Vercel

**Solution** : Configurer CORS sur le backend

```javascript
// services/client-onboarding/src/server.js
const allowedOrigins = [
  'http://localhost:3000',
  'https://rt-technologie-xxxxx.vercel.app', // Votre URL Vercel
];
```

Redémarrer :
```bash
pm2 restart client-onboarding
```

**Guide complet** : [docs/CORS_CONFIGURATION.md](docs/CORS_CONFIGURATION.md)

### Build Failed

**Causes possibles** :
1. Root Directory incorrect
2. Dépendances manquantes
3. Erreur TypeScript

**Solution** :
1. Vérifier que Root Directory = `apps/marketing-site`
2. Voir les logs de build dans Vercel
3. Tester le build localement :
   ```bash
   cd apps/marketing-site
   npm install
   npm run build
   ```

---

## 🔧 Configuration Post-Déploiement

### Mettre à Jour l'URL Backend

Une fois le backend déployé sur AWS :

**Via Interface Web** :
1. Aller sur https://vercel.com/dashboard
2. Sélectionner le projet
3. Settings > Environment Variables
4. Modifier `NEXT_PUBLIC_API_URL`
5. Valeur : `http://<IP_AWS>:3020` ou `https://api.rt-technologie.com`
6. **Redéployer** : Deployments > [Latest] > Redeploy

**Via CLI** :
```bash
vercel env rm NEXT_PUBLIC_API_URL production
vercel env add NEXT_PUBLIC_API_URL production
# Entrer la nouvelle URL
vercel --prod
```

---

## 🌐 Domaine Custom (Optionnel)

### Ajouter `onboarding.rt-technologie.com`

1. **Dans Vercel**
   - Settings > Domains
   - Ajouter `onboarding.rt-technologie.com`

2. **Chez votre registrar** (OVH, Gandi, etc.)
   ```
   Type: CNAME
   Name: onboarding
   Value: cname.vercel-dns.com
   TTL: 3600
   ```

3. **Attendre** : 5-60 minutes (propagation DNS)

4. **SSL** : Activé automatiquement par Vercel ✅

---

## 📊 Vérifications

### ✅ Checklist Post-Déploiement

- [ ] Site accessible sur URL Vercel
- [ ] Redirection `/` vers `/onboarding` fonctionne
- [ ] Page `/onboarding` s'affiche correctement
- [ ] Formulaire responsive (tester sur mobile)
- [ ] Si tunnel activé : Vérification TVA fonctionne
- [ ] Pas d'erreur dans la console navigateur (F12)

### 🧪 Tests à Faire

**Test 1 : Accès**
```
Ouvrir : https://rt-technologie-xxxxx.vercel.app
Résultat attendu : Page d'inscription s'affiche
```

**Test 2 : Vérification TVA (si backend accessible)**
```
1. Entrer : BE0477472701
2. Cliquer : Vérifier et continuer
3. Résultat attendu : Données entreprise remplies automatiquement
```

**Test 3 : Responsive**
```
1. Ouvrir les DevTools (F12)
2. Activer le mode responsive
3. Tester différentes tailles d'écran
4. Vérifier que tout s'affiche bien
```

---

## 💰 Coût Vercel

**Plan Hobby (Gratuit)** :
- ✅ Déploiements illimités
- ✅ 100 GB bande passante/mois
- ✅ SSL automatique
- ✅ CDN global
- ✅ Preview deployments
- ✅ Analytics de base

**Suffisant pour** : Des centaines d'inscriptions/mois

**Prix** : **0€/mois**

---

## 🔄 Déploiements Automatiques

**À chaque push sur GitHub** :
- Branche `main` → Déploiement Production
- Pull Request → Déploiement Preview
- Autre branche → Déploiement Preview

**Désactiver** (optionnel) :
- Settings > Git
- Décocher "Production Branch"

---

## 📞 Support

**Problème ?**
- [docs/VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md) - Guide détaillé
- [docs/CORS_CONFIGURATION.md](docs/CORS_CONFIGURATION.md) - Configuration CORS
- [README_VERCEL.md](README_VERCEL.md) - Vue d'ensemble

**Documentation Vercel** :
- https://vercel.com/docs

---

## 🎯 Prochaines Étapes

Une fois le frontend déployé :

1. **Tester l'inscription complète** (avec tunnel)
2. **Déployer le backend sur AWS** (voir README_AWS_DEPLOY.md)
3. **Mettre à jour NEXT_PUBLIC_API_URL** avec l'URL AWS
4. **Configurer CORS** sur le backend
5. **Tester end-to-end** : inscription → contrat → signature

---

## ✨ Récapitulatif

**Temps total** : 3 minutes
**Complexité** : Facile
**Résultat** : Frontend accessible mondialement via CDN
**Coût** : 0€/mois

**🎊 C'est parti ! → https://vercel.com/new**

---

**Dernière mise à jour** : 18 Novembre 2025
