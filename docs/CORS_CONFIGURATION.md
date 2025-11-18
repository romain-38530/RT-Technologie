# Configuration CORS Backend

**Date** : 18 Novembre 2025
**Service** : client-onboarding
**Nécessaire pour** : Frontend Vercel

---

## 🎯 Pourquoi CORS ?

CORS (Cross-Origin Resource Sharing) permet au frontend déployé sur Vercel (domaine différent) d'accéder à l'API backend.

**Sans CORS** : Le navigateur bloque les requêtes entre domaines différents
**Avec CORS** : Le backend autorise explicitement certains domaines

---

## ⚡ Configuration Rapide

### 1. Installer le package CORS

```bash
cd services/client-onboarding
npm install cors
```

### 2. Mettre à jour `src/server.js`

Ajouter après les imports :

```javascript
const cors = require('cors');

// Configuration CORS
const allowedOrigins = [
  'http://localhost:3000',                          // Dev local
  'https://rt-technologie.vercel.app',              // Vercel production
  'https://rt-technologie-*.vercel.app',            // Vercel preview
  'https://onboarding.rt-technologie.com',          // Domaine custom (si configuré)
];

app.use(cors({
  origin: function (origin, callback) {
    // Autoriser les requêtes sans origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    // Vérifier si l'origin est dans la liste ou matche le pattern Vercel
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
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 3. Redémarrer le service

```bash
# Local PM2
pm2 restart client-onboarding

# Docker
docker-compose restart

# AWS ECS
bash scripts/deploy-aws-ecs.sh
```

---

## 🧪 Tester CORS

### Depuis la console navigateur (sur site Vercel)

```javascript
// Test basique
fetch('http://localhost:3020/health')
  .then(r => r.json())
  .then(d => console.log('✅ CORS OK:', d))
  .catch(e => console.error('❌ CORS Error:', e));

// Test avec TVA
fetch('http://localhost:3020/api/onboarding/verify-vat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ vatNumber: 'BE0477472701' })
})
  .then(r => r.json())
  .then(d => console.log('✅ API OK:', d))
  .catch(e => console.error('❌ API Error:', e));
```

### Depuis curl (terminal)

```bash
# Test OPTIONS (preflight)
curl -X OPTIONS http://localhost:3020/health \
  -H "Origin: https://rt-technologie.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -v

# Doit retourner :
# Access-Control-Allow-Origin: https://rt-technologie.vercel.app
# Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

---

## 🔒 Sécurité

### Ne PAS utiliser `origin: '*'`

```javascript
// ❌ DANGEREUX - N'importe quel site peut accéder à votre API
app.use(cors({ origin: '*' }));
```

### Utiliser une liste blanche

```javascript
// ✅ SÉCURISÉ - Seuls les domaines autorisés
const allowedOrigins = [
  'http://localhost:3000',
  'https://rt-technologie.vercel.app'
];
```

### Variables d'environnement (Recommandé)

**`.env.production`** :

```env
CORS_ORIGINS=http://localhost:3000,https://rt-technologie.vercel.app,https://onboarding.rt-technologie.com
```

**`src/server.js`** :

```javascript
const allowedOrigins = (process.env.CORS_ORIGINS || '').split(',');

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

---

## 🐛 Dépannage

### Erreur : "CORS policy: No 'Access-Control-Allow-Origin' header"

**Cause** : Le domaine frontend n'est pas autorisé

**Solution** :
1. Vérifier que le domaine Vercel est dans `allowedOrigins`
2. Vérifier les logs backend pour voir l'origin rejetée
3. Ajouter le domaine et redémarrer

```bash
pm2 logs client-onboarding --lines 50 | grep CORS
```

### Erreur : "CORS policy: Method not allowed"

**Cause** : La méthode HTTP (POST, PUT, etc.) n'est pas autorisée

**Solution** : Ajouter dans la config CORS :

```javascript
methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
```

### Erreur : "Preflight request failed"

**Cause** : Le backend ne répond pas correctement aux requêtes OPTIONS

**Solution** : Ajouter un handler explicit :

```javascript
app.options('*', cors());
```

### CORS fonctionne en local mais pas en production

**Causes possibles** :
1. URL backend incorrecte dans `NEXT_PUBLIC_API_URL`
2. Backend non accessible depuis Internet
3. Domaine Vercel pas dans `allowedOrigins`

**Solutions** :
```bash
# 1. Vérifier la variable Vercel
vercel env ls

# 2. Tester l'accès backend depuis Internet
curl https://api.rt-technologie.com/health

# 3. Vérifier les logs backend
pm2 logs client-onboarding --err
```

---

## 📋 Checklist

### Configuration CORS

- [ ] Package `cors` installé
- [ ] Configuration CORS ajoutée dans `server.js`
- [ ] Domaines autorisés listés
- [ ] Service redémarré
- [ ] Test local OK (depuis localhost:3000)

### Déploiement Vercel

- [ ] URL Vercel ajoutée dans `allowedOrigins`
- [ ] Variables d'environnement configurées
- [ ] Test depuis Vercel Preview OK
- [ ] Test depuis Vercel Production OK
- [ ] Pas d'erreurs CORS dans la console

### Production

- [ ] Domaine custom ajouté (si utilisé)
- [ ] SSL activé (HTTPS uniquement)
- [ ] Logs backend sans erreur CORS
- [ ] Monitoring actif

---

## 🔗 Ressources

- **MDN CORS** : https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
- **npm cors** : https://www.npmjs.com/package/cors
- **Vercel Domains** : https://vercel.com/docs/concepts/projects/domains

---

**CORS configuré avec succès ! ✅**
