# 🚀 Déploiement Vercel - Frontend Marketing Site

**Date** : 18 Novembre 2025
**Application** : RT Technologie - Site Marketing & Onboarding
**Status** : ✅ Prêt pour déploiement

---

## 📊 Vue d'Ensemble

Ce guide vous permet de déployer le frontend `apps/marketing-site` sur Vercel en quelques minutes.

### Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Vercel CDN    │────────▶│  Next.js App     │────────▶│  Backend API    │
│  (Frontend)     │         │  (marketing-site)│         │  (Port 3020)    │
│  Global Edge    │         │  Pages + Assets  │         │  PM2 / AWS ECS  │
└─────────────────┘         └──────────────────┘         └─────────────────┘
```

### Fonctionnalités Déployées

- ✅ Page d'inscription `/onboarding` (5 étapes)
- ✅ Vérification TVA automatique
- ✅ Génération de contrat PDF
- ✅ Page de signature électronique `/sign-contract/[id]`
- ✅ Canvas de signature tactile
- ✅ Responsive design (Mobile + Desktop)

---

## ⚡ Déploiement Rapide (3 Minutes)

### Prérequis

- ✅ Compte Vercel (gratuit) : https://vercel.com/signup
- ✅ Repository GitHub avec le code
- ✅ Backend API accessible sur Internet

### Option 1 : Via Interface Web (Recommandé)

#### 1️⃣ Créer un Nouveau Projet

1. Aller sur https://vercel.com/new
2. Se connecter avec GitHub
3. Importer le repository `RT-Technologie`

#### 2️⃣ Configurer le Projet

**Root Directory** :
```
apps/marketing-site
```

**Framework Preset** : Next.js (détecté automatiquement)

**Build Settings** :
- Build Command : `npm run build`
- Output Directory : `.next`
- Install Command : `npm install`

#### 3️⃣ Configurer les Variables d'Environnement

Ajouter dans "Environment Variables" :

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3020` (temporaire) | Development |
| `NEXT_PUBLIC_API_URL` | `https://api.rt-technologie.com` | Production |

**⚠️ Important** :
- Remplacer `https://api.rt-technologie.com` par l'URL réelle de votre backend
- Si backend sur AWS ECS : utiliser l'IP publique de la task ECS
- Si backend sur serveur local : utiliser un tunnel Ngrok ou Cloudflare Tunnel

#### 4️⃣ Déployer

Cliquer sur **"Deploy"**

Durée : ~2-3 minutes

**Résultat** : Vercel vous donne une URL de type :
```
https://rt-technologie-xxxxx.vercel.app
```

---

### Option 2 : Via Vercel CLI

```powershell
# 1. Installer Vercel CLI
npm install -g vercel

# 2. Se connecter
vercel login

# 3. Aller dans le dossier marketing-site
cd "apps/marketing-site"

# 4. Créer .env.local pour le développement
echo "NEXT_PUBLIC_API_URL=http://localhost:3020" > .env.local

# 5. Premier déploiement (preview)
vercel

# 6. Configurer la variable de production
vercel env add NEXT_PUBLIC_API_URL production
# Entrer : https://api.rt-technologie.com

# 7. Déployer en production
vercel --prod
```

---

## 🔧 Configuration Complète

### Variables d'Environnement

#### Development (Local)

Créer `.env.local` :

```env
NEXT_PUBLIC_API_URL=http://localhost:3020
```

#### Production (Vercel)

Configurer via l'interface Vercel ou CLI :

```bash
# Via CLI
vercel env add NEXT_PUBLIC_API_URL production

# Via Web
# Settings > Environment Variables > Add New
```

**Valeurs possibles pour Production** :

1. **Backend sur AWS ECS** :
   ```
   http://<IP_PUBLIQUE_ECS>:3020
   ```

2. **Backend sur serveur local avec tunnel** :
   ```
   https://rt-backend.ngrok.io
   ```

3. **Backend derrière un Load Balancer AWS** :
   ```
   https://api.rt-technologie.com
   ```

### CORS Backend

Le backend doit autoriser le domaine Vercel. Éditer `services/client-onboarding/src/server.js` :

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://rt-technologie.vercel.app',
    'https://rt-technologie-xxxxx.vercel.app', // Remplacer par votre URL
    'https://onboarding.rt-technologie.com'    // Si domaine custom
  ],
  credentials: true
}));
```

Redémarrer le backend :

```bash
pm2 restart client-onboarding
```

---

## 🌐 Domaine Custom (Optionnel)

### Ajouter un Domaine

1. Aller dans **Settings > Domains** sur Vercel
2. Ajouter `onboarding.rt-technologie.com`
3. Configurer le DNS chez votre registrar :

**Option A : CNAME (Recommandé)**
```
Type: CNAME
Name: onboarding
Value: cname.vercel-dns.com
TTL: 3600
```

**Option B : A Record**
```
Type: A
Name: onboarding
Value: 76.76.21.21
TTL: 3600
```

4. Vérifier le domaine sur Vercel
5. SSL activé automatiquement

Durée de propagation : 5-60 minutes

---

## 📊 Monitoring

### Vercel Analytics

Activé automatiquement sur tous les projets.

Voir les métriques dans **Analytics** :
- Visites
- Temps de chargement
- Core Web Vitals
- Erreurs

### Logs en Temps Réel

```bash
# Via CLI
vercel logs --follow

# Via Web
# Project > Deployments > [Latest] > View Function Logs
```

### Alertes

Configurer dans **Settings > Monitoring** :
- Erreurs 5xx
- Timeouts
- Pics de trafic

---

## 🔄 CI/CD Automatique

### Configuration GitHub

Vercel se connecte automatiquement à GitHub.

**Workflow automatique** :

1. Push sur branche `main` → Déploiement Production
2. Pull Request → Déploiement Preview (URL temporaire)
3. Commit sur autre branche → Déploiement Preview

### Désactiver Auto-Deploy (Optionnel)

**Settings > Git** :
- Décocher "Production Branch"
- Déploiements manuels uniquement

### Déploiement Manuel

```bash
# Preview
vercel

# Production
vercel --prod

# Depuis une branche spécifique
git checkout feature/new-design
vercel --prod
```

---

## 🧪 Tests Avant Déploiement

### 1. Build Local

```bash
cd apps/marketing-site

# Installer les dépendances
npm install

# Build de production
npm run build

# Tester le build
npm start
```

Ouvrir http://localhost:3000

### 2. Vérifier les Endpoints API

```bash
# Health check backend
curl http://localhost:3020/health

# Vérification TVA (test)
curl -X POST http://localhost:3020/api/onboarding/verify-vat \
  -H "Content-Type: application/json" \
  -d '{"vatNumber":"BE0477472701"}'
```

### 3. Vérifier CORS

Depuis la console navigateur sur le site Vercel Preview :

```javascript
fetch('http://localhost:3020/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

Si erreur CORS : configurer le backend (voir section CORS)

---

## 🐛 Dépannage

### Erreur : "Network Error" dans le frontend

**Causes possibles** :
1. Backend non accessible depuis Internet
2. CORS non configuré
3. URL backend incorrecte

**Solutions** :

```bash
# 1. Vérifier l'URL backend depuis Internet
curl https://api.rt-technologie.com/health

# 2. Vérifier la variable d'environnement Vercel
vercel env ls

# 3. Vérifier les logs Vercel
vercel logs --follow
```

### Build Vercel échoue

**Erreurs courantes** :

1. **Module not found**
   ```bash
   # Solution : Vérifier package.json
   npm install
   npm run build
   ```

2. **TypeScript errors**
   ```bash
   # Solution : Corriger les erreurs
   npm run lint
   ```

3. **Out of memory**
   ```json
   // next.config.js
   module.exports = {
     experimental: {
       workerThreads: false,
       cpus: 1
     }
   }
   ```

### Page blanche après déploiement

1. Ouvrir la console navigateur (F12)
2. Vérifier les erreurs
3. Vérifier que `NEXT_PUBLIC_API_URL` est défini
4. Vérifier les logs Vercel

### Backend inaccessible depuis Vercel

Si le backend est sur un serveur local (PM2), utiliser un tunnel :

**Option A : Ngrok**
```bash
# Installer ngrok
choco install ngrok

# Créer un tunnel
ngrok http 3020

# Utiliser l'URL fournie dans NEXT_PUBLIC_API_URL
```

**Option B : Cloudflare Tunnel**
```bash
# Installer cloudflared
choco install cloudflare-warp

# Créer un tunnel
cloudflared tunnel --url http://localhost:3020
```

**Option C : Déployer le backend sur AWS ECS** (Recommandé)
- Voir [README_AWS_DEPLOY.md](../README_AWS_DEPLOY.md)

---

## 💰 Coûts

### Plan Gratuit Vercel (Hobby)

**Inclus** :
- ✅ Déploiements illimités
- ✅ 100 GB bande passante/mois
- ✅ SSL automatique
- ✅ CDN global
- ✅ Analytics de base
- ✅ 1 concurrent build

**Limites** :
- 1 utilisateur
- Pas de collaboration d'équipe
- Pas de protection par mot de passe

**Prix** : **0€/mois**

### Plan Pro (Si besoin)

- **Prix** : $20/mois (~18€)
- Builds plus rapides
- Protection par mot de passe
- Collaboration équipe
- Support prioritaire

Pour RT Technologie, le plan gratuit est suffisant.

---

## 📋 Checklist de Déploiement

### Avant Déploiement

- [ ] Backend accessible depuis Internet
- [ ] CORS configuré sur le backend
- [ ] Variables d'environnement préparées
- [ ] Build local réussi (`npm run build`)
- [ ] Tests manuels OK

### Déploiement

- [ ] Compte Vercel créé
- [ ] Repository GitHub connecté
- [ ] Root Directory configuré : `apps/marketing-site`
- [ ] Variable `NEXT_PUBLIC_API_URL` ajoutée
- [ ] Premier déploiement réussi

### Après Déploiement

- [ ] Site accessible (vérifier l'URL Vercel)
- [ ] Page `/onboarding` fonctionne
- [ ] Vérification TVA fonctionne (test avec `BE0477472701`)
- [ ] Génération de contrat fonctionne
- [ ] Page `/sign-contract/[id]` fonctionne
- [ ] Signature électronique fonctionne
- [ ] Responsive (tester sur mobile)
- [ ] Logs Vercel sans erreur

### Post-Déploiement

- [ ] Domaine custom configuré (optionnel)
- [ ] Analytics activé
- [ ] Alertes configurées
- [ ] Documentation mise à jour

---

## 🔗 URLs et Ressources

### Vercel

- **Dashboard** : https://vercel.com/dashboard
- **Documentation** : https://vercel.com/docs
- **Support** : https://vercel.com/support

### RT Technologie

| Environnement | URL | Description |
|---------------|-----|-------------|
| **Local** | http://localhost:3000 | Développement local |
| **Preview** | https://rt-xxx.vercel.app | Preview automatique (PR) |
| **Production** | https://rt-technologie.vercel.app | Production Vercel |
| **Custom** | https://onboarding.rt-technologie.com | Domaine custom (optionnel) |

### Backend

| Environnement | URL | Port |
|---------------|-----|------|
| **Local PM2** | http://localhost:3020 | 3020 |
| **Tunnel** | https://rt-backend.ngrok.io | - |
| **AWS ECS** | http://<IP_ECS>:3020 | 3020 |
| **Load Balancer** | https://api.rt-technologie.com | 443 |

---

## 🎯 Prochaines Étapes

### Immédiat

- [ ] Déployer sur Vercel (plan gratuit)
- [ ] Tester l'inscription complète
- [ ] Vérifier les emails (Mailgun)

### Court Terme

- [ ] Configurer un domaine custom
- [ ] Ajouter Google Analytics (optionnel)
- [ ] Configurer les alertes Vercel

### Moyen Terme

- [ ] Déployer le backend sur AWS ECS (voir README_AWS_DEPLOY.md)
- [ ] Configurer un Load Balancer AWS
- [ ] SSL/TLS sur le backend

### Long Terme

- [ ] Tests automatisés (Playwright)
- [ ] Monitoring avancé (Sentry)
- [ ] A/B Testing
- [ ] Progressive Web App (PWA)

---

## ✅ Résumé

**Le frontend est maintenant prêt pour Vercel ! 🚀**

**Configuration** : ✅ Next.js 14 + TypeScript + Tailwind CSS
**Déploiement** : ✅ 3 minutes via interface web
**Coût** : ✅ 0€/mois (plan gratuit suffisant)
**Performance** : ✅ CDN global + SSL automatique

**Il ne reste plus qu'à déployer ! 🎉**

---

**Pour toute question** : Consultez la documentation complète dans `docs/`
