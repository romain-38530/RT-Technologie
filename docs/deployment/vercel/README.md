# 🎨 Déploiement Frontend Vercel - RT Technologie

**Date** : 18 Novembre 2025
**Application** : Marketing Site & Onboarding Client
**Status** : ✅ **PRÊT POUR DÉPLOIEMENT**

---

## 🚀 Démarrage Ultra-Rapide

### 3 Étapes pour Déployer

```bash
# 1️⃣ Aller sur Vercel
https://vercel.com/new

# 2️⃣ Importer le repository GitHub
Sélectionner : RT-Technologie

# 3️⃣ Configurer
Root Directory: apps/marketing-site
Environment Variable: NEXT_PUBLIC_API_URL = http://<VOTRE_BACKEND>:3020

# ✅ DÉPLOYER !
```

**Durée** : 2-3 minutes

**Résultat** : Frontend accessible sur `https://rt-technologie-xxxxx.vercel.app`

---

## 📋 Qu'est-ce qui a été créé ?

### Application Next.js Complète

```
apps/marketing-site/
├── src/
│   └── app/
│       ├── layout.tsx                    # Layout principal
│       ├── globals.css                   # Styles Tailwind
│       ├── page.tsx                      # Redirection vers /onboarding
│       ├── onboarding/
│       │   └── page.tsx                  # ✅ Formulaire 5 étapes
│       └── sign-contract/
│           └── [contractId]/
│               └── page.tsx              # ✅ Signature électronique
├── public/
│   └── favicon.ico
├── package.json                          # Dépendances
├── next.config.js                        # Config Next.js
├── tailwind.config.js                    # Config Tailwind
├── tsconfig.json                         # Config TypeScript
├── vercel.json                           # ✅ Config Vercel
├── .gitignore                            # Fichiers exclus
├── .vercelignore                         # Fichiers exclus Vercel
├── .env.example                          # Template variables
└── README.md                             # Documentation app
```

### Fonctionnalités Implémentées

#### Page `/onboarding` (Inscription)

**5 Étapes** :
1. ✅ Numéro de TVA intracommunautaire
2. ✅ Données entreprise (auto-remplies via API VIES/INSEE)
3. ✅ Représentant légal
4. ✅ Choix d'abonnement (Industriel, Transporteur, etc.)
5. ✅ Validation et génération contrat

**APIs Backend utilisées** :
- `POST /api/onboarding/verify-vat` - Vérification TVA
- `POST /api/onboarding/submit` - Soumission et génération contrat

#### Page `/sign-contract/[contractId]` (Signature)

**Fonctionnalités** :
- ✅ Visualisation du contrat PDF (iframe)
- ✅ Canvas de signature tactile (mouse + touch)
- ✅ Horodatage certifié
- ✅ Conformité eIDAS
- ✅ Validation et envoi email

**APIs Backend utilisées** :
- `GET /api/onboarding/contract/:contractId` - Récupération PDF
- `POST /api/onboarding/sign/:contractId` - Signature

---

## 🔧 Configuration

### Variables d'Environnement

#### Development (Local)

Créer `apps/marketing-site/.env.local` :

```env
NEXT_PUBLIC_API_URL=http://localhost:3020
```

#### Production (Vercel)

**Option A : Via Interface Web**
1. Aller dans **Settings > Environment Variables**
2. Ajouter :
   - Name : `NEXT_PUBLIC_API_URL`
   - Value : `http://<IP_BACKEND>:3020` ou `https://api.rt-technologie.com`
   - Environment : Production

**Option B : Via CLI**
```bash
vercel env add NEXT_PUBLIC_API_URL production
# Entrer : https://api.rt-technologie.com
```

### Backend URL - Options

| Environnement | URL | Quand utiliser |
|---------------|-----|----------------|
| **Local PM2** | `http://localhost:3020` | Développement local uniquement |
| **Tunnel Ngrok** | `https://rt-backend.ngrok.io` | Tests rapides production |
| **AWS ECS IP** | `http://54.xxx.xxx.xxx:3020` | Déploiement AWS sans Load Balancer |
| **AWS ALB** | `https://api.rt-technologie.com` | Production finale (recommandé) |

**⚠️ Important** : `http://localhost:3020` ne fonctionnera PAS en production Vercel !

---

## 🌐 CORS Backend

Le backend doit autoriser le domaine Vercel.

### Configuration Recommandée

Ajouter dans `services/client-onboarding/src/server.js` :

```javascript
const cors = require('cors');

const allowedOrigins = [
  'http://localhost:3000',                     // Dev local
  'https://rt-technologie.vercel.app',         // Production Vercel
  'https://rt-technologie-*.vercel.app',       // Preview Vercel
  'https://onboarding.rt-technologie.com',     // Custom domain (optionnel)
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        const pattern = allowed.replace('*', '.*');
        return new RegExp(pattern).test(origin);
      }
      return allowed === origin;
    })) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
```

Redémarrer le backend :

```bash
pm2 restart client-onboarding
```

**Guide complet** : [docs/CORS_CONFIGURATION.md](docs/CORS_CONFIGURATION.md)

---

## 🧪 Tests

### 1. Test Local (Avant déploiement)

```bash
cd apps/marketing-site

# Installer
npm install

# Build
npm run build

# Tester
npm start
```

Ouvrir http://localhost:3000

### 2. Test Vérification TVA

1. Aller sur `/onboarding`
2. Entrer `BE0477472701`
3. Vérifier que les données se remplissent automatiquement

### 3. Test Génération Contrat

1. Compléter toutes les étapes
2. Valider
3. Vérifier qu'un contrat PDF est généré
4. Vérifier l'email de confirmation

### 4. Test Signature

1. Ouvrir `/sign-contract/[contractId]`
2. Signer dans le canvas
3. Valider
4. Vérifier l'email de confirmation

---

## 📊 Déploiement Vercel

### Via Interface Web

**Étape par étape** :

1. **Connexion**
   - Aller sur https://vercel.com
   - Se connecter avec GitHub

2. **Import**
   - Cliquer "New Project"
   - Sélectionner le repository `RT-Technologie`
   - Cliquer "Import"

3. **Configuration**
   - **Root Directory** : `apps/marketing-site`
   - **Framework** : Next.js (détecté automatiquement)
   - **Build Command** : `npm run build`
   - **Output Directory** : `.next`

4. **Environment Variables**
   - Ajouter `NEXT_PUBLIC_API_URL`
   - Valeur : URL de votre backend

5. **Deploy**
   - Cliquer "Deploy"
   - Attendre 2-3 minutes

6. **Résultat**
   - URL fournie : `https://rt-technologie-xxxxx.vercel.app`

### Via CLI

```bash
# 1. Installer Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Aller dans l'app
cd apps/marketing-site

# 4. Premier déploiement
vercel

# 5. Configurer la variable
vercel env add NEXT_PUBLIC_API_URL production

# 6. Déployer en production
vercel --prod
```

---

## 💰 Coûts

### Plan Gratuit (Hobby)

**Inclus** :
- ✅ Déploiements illimités
- ✅ 100 GB bande passante/mois
- ✅ SSL automatique
- ✅ CDN global
- ✅ Preview deployments
- ✅ Analytics

**Prix** : **0€/mois**

**Suffisant pour** : RT Technologie (plusieurs centaines d'inscriptions/mois)

---

## 🔗 Domaine Custom (Optionnel)

### Configurer `onboarding.rt-technologie.com`

1. **Ajouter dans Vercel**
   - Settings > Domains
   - Ajouter `onboarding.rt-technologie.com`

2. **Configurer DNS**

   Chez votre registrar (OVH, Gandi, etc.) :

   ```
   Type: CNAME
   Name: onboarding
   Value: cname.vercel-dns.com
   TTL: 3600
   ```

3. **Vérifier**
   - Attendre 5-60 minutes (propagation DNS)
   - SSL activé automatiquement

4. **Mettre à jour CORS Backend**
   ```javascript
   allowedOrigins: [
     'https://onboarding.rt-technologie.com'
   ]
   ```

---

## 📚 Documentation

### Guides Créés

| Guide | Description | Lignes |
|-------|-------------|--------|
| [VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md) | Guide complet déploiement | 500+ |
| [CORS_CONFIGURATION.md](docs/CORS_CONFIGURATION.md) | Configuration CORS backend | 200+ |
| [apps/marketing-site/README.md](apps/marketing-site/README.md) | Documentation application | 200+ |

### Documentation Backend

| Guide | Description |
|-------|-------------|
| [README_PRODUCTION.md](services/client-onboarding/README_PRODUCTION.md) | Production backend |
| [README_AWS_DEPLOY.md](README_AWS_DEPLOY.md) | Déploiement AWS |
| [QUICKSTART.md](QUICKSTART.md) | Commandes quotidiennes |

---

## ✅ Checklist de Déploiement

### Avant Déploiement

- [x] Application Next.js créée
- [x] Pages onboarding et signature implémentées
- [x] Variables d'environnement configurées
- [x] Configuration Vercel créée (vercel.json)
- [x] Documentation complète
- [ ] Backend accessible depuis Internet
- [ ] CORS configuré sur backend
- [ ] Tests locaux réussis

### Pendant Déploiement

- [ ] Compte Vercel créé
- [ ] Repository GitHub connecté
- [ ] Root Directory configuré
- [ ] Variable `NEXT_PUBLIC_API_URL` ajoutée
- [ ] Build réussi

### Après Déploiement

- [ ] Site accessible
- [ ] Page `/onboarding` fonctionne
- [ ] Vérification TVA fonctionne
- [ ] Génération contrat fonctionne
- [ ] Page `/sign-contract` fonctionne
- [ ] Signature fonctionne
- [ ] Emails envoyés
- [ ] Responsive (mobile + desktop)

---

## 🎯 Prochaines Étapes

### Immédiat

1. **Déployer sur Vercel**
   - Via interface web (le plus simple)
   - Durée : 3 minutes

2. **Configurer CORS backend**
   - Ajouter domaine Vercel
   - Redémarrer backend

3. **Tester inscription complète**
   - Vérification TVA
   - Génération contrat
   - Signature électronique

### Court Terme

- [ ] Déployer backend sur AWS ECS (voir README_AWS_DEPLOY.md)
- [ ] Configurer domaine custom
- [ ] Ajouter Google Analytics (optionnel)

### Moyen Terme

- [ ] Load Balancer AWS
- [ ] SSL/TLS sur backend
- [ ] Monitoring avancé
- [ ] Tests automatisés

---

## 🎉 Résumé

**Le frontend est maintenant 100% prêt pour Vercel ! 🚀**

**✅ Application Next.js complète**
- 2 pages (onboarding + signature)
- TypeScript + Tailwind CSS
- Responsive design
- Configuration Vercel

**✅ Intégration backend**
- 4 endpoints API
- Variables d'environnement
- Gestion CORS

**✅ Documentation complète**
- 3 guides détaillés
- Checklist de déploiement
- Dépannage

**Temps de déploiement estimé** : **3 minutes** ⏱️

**Coût** : **0€/mois** (plan gratuit suffisant) 💰

---

**Il ne reste plus qu'à déployer ! 🎊**

👉 **Prochain step** : https://vercel.com/new

---

**Pour toute question** : Consultez [docs/VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md)
