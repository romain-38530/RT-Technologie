# 🚀 Guide de Déploiement Immédiat - RT-Technologie.com

**Objectif** : Mettre en ligne le système d'onboarding sur rt-technologie.com
**Durée totale** : 15-20 minutes
**Date** : 18 Novembre 2025

---

## 📋 Plan d'Action

### Phase 1 : Déploiement Frontend (10 min)
1. ✅ Créer projet Vercel
2. ✅ Connecter GitHub
3. ✅ Configurer build
4. ✅ Déployer sur Vercel

### Phase 2 : Tunnel Backend (5 min)
1. ✅ Installer Ngrok
2. ✅ Lancer tunnel vers port 3020
3. ✅ Récupérer URL publique

### Phase 3 : Configuration (5 min)
1. ✅ Configurer variables Vercel
2. ✅ Configurer CORS backend
3. ✅ Tester le système

### Phase 4 : Domaine Custom (optionnel, +10 min)
1. Configurer onboarding.rt-technologie.com
2. Pointer vers Vercel

---

## 🎯 ÉTAPE 1 : Déployer sur Vercel (10 minutes)

### 1.1 Accéder à Vercel

**URL** : https://vercel.com/login

1. Se connecter avec GitHub
2. Autoriser l'accès au repository

### 1.2 Créer un Nouveau Projet

**URL** : https://vercel.com/new

1. Cliquer "Add New..." → "Project"
2. Chercher et sélectionner **"RT-Technologie"**
3. Cliquer "Import"

### 1.3 Configurer le Projet

**Configuration Build** :

```
Project Name: rt-technologie-onboarding
Framework Preset: Next.js (détecté automatiquement)
Root Directory: apps/marketing-site  👈 IMPORTANT !
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### 1.4 Variables d'Environnement

**Pour l'instant, utiliser une valeur temporaire** :

```
Name: NEXT_PUBLIC_API_URL
Value: http://localhost:3020
Environment: Production
```

⚠️ On changera cette valeur après avoir configuré Ngrok (Étape 2)

### 1.5 Déployer

1. Cliquer **"Deploy"**
2. Attendre 2-3 minutes
3. Noter l'URL fournie : `https://rt-technologie-onboarding-xxxxx.vercel.app`

✅ **Frontend déployé !**

---

## 🎯 ÉTAPE 2 : Tunnel Ngrok (5 minutes)

### 2.1 Installer Ngrok

**Télécharger** : https://ngrok.com/download

Ou via Chocolatey :
```powershell
choco install ngrok
```

### 2.2 Lancer le Tunnel

```powershell
# Dans un nouveau terminal PowerShell
ngrok http 3020
```

**Résultat** :
```
Forwarding    https://abc123.ngrok.io -> http://localhost:3020
```

**📝 NOTER L'URL HTTPS fournie** : `https://abc123.ngrok.io`

⚠️ **Laisser ce terminal ouvert !** Le tunnel doit rester actif.

### 2.3 Tester le Tunnel

```powershell
# Dans un autre terminal
curl https://abc123.ngrok.io/health
```

**Résultat attendu** :
```json
{"status":"ok","service":"client-onboarding","port":"3020"}
```

✅ **Tunnel opérationnel !**

---

## 🎯 ÉTAPE 3 : Configuration (5 minutes)

### 3.1 Mettre à Jour Vercel

**Via l'interface Web** :

1. Aller sur https://vercel.com/dashboard
2. Sélectionner le projet **rt-technologie-onboarding**
3. Aller dans **Settings** → **Environment Variables**
4. Modifier `NEXT_PUBLIC_API_URL` :
   - Nouvelle valeur : `https://abc123.ngrok.io` (votre URL Ngrok)
5. **Save**
6. Aller dans **Deployments** → Cliquer sur le dernier déploiement → **Redeploy**

**Via CLI** (alternative) :
```bash
vercel env rm NEXT_PUBLIC_API_URL production
echo "https://abc123.ngrok.io" | vercel env add NEXT_PUBLIC_API_URL production
vercel --prod
```

### 3.2 Configurer CORS Backend

**Éditer** : `services/client-onboarding/src/server.js`

Vérifier que CORS autorise tous les domaines (déjà configuré) :

```javascript
app.use(cors());  // ✅ Déjà présent, autorise tout
```

Si vous voulez restreindre :
```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'https://rt-technologie-onboarding-xxxxx.vercel.app',  // Votre URL Vercel
  'https://*.ngrok.io',
  'https://onboarding.rt-technologie.com'
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
  }
}));
```

**Redémarrer PM2** :
```bash
pm2 restart client-onboarding
```

✅ **Configuration terminée !**

---

## 🎯 ÉTAPE 4 : Tests (2 minutes)

### 4.1 Accéder au Site

**Ouvrir** : `https://rt-technologie-onboarding-xxxxx.vercel.app`

Vous devriez voir la page d'inscription.

### 4.2 Tester la Vérification TVA

1. Sur la page `/onboarding`
2. Entrer un numéro de TVA : **BE0477472701**
3. Cliquer "Vérifier et continuer"
4. **Résultat attendu** : Les données de l'entreprise se remplissent automatiquement

✅ **Si ça fonctionne, le système est opérationnel !**

### 4.3 Tester l'Inscription Complète

1. Compléter tous les champs du formulaire
2. Sélectionner un type d'abonnement
3. Valider
4. **Vérifier** :
   - Un contrat PDF est généré
   - Vous êtes redirigé vers la page de signature
   - Le canvas de signature fonctionne

---

## 🌐 ÉTAPE 5 : Domaine Custom (Optionnel, +10 min)

### 5.1 Ajouter le Domaine sur Vercel

1. Dans le projet Vercel → **Settings** → **Domains**
2. Ajouter : `onboarding.rt-technologie.com`
3. Vercel vous donnera des instructions DNS

### 5.2 Configurer le DNS

**Chez votre registrar (OVH, Gandi, etc.)** :

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

### 5.3 Vérifier

1. Attendre 5-60 minutes (propagation DNS)
2. Aller sur https://onboarding.rt-technologie.com
3. **SSL** : Activé automatiquement par Vercel

✅ **Domaine custom configuré !**

---

## 📊 Tableau de Bord - URLs

| Service | URL | Status |
|---------|-----|--------|
| **Frontend Vercel** | https://rt-technologie-onboarding-xxxxx.vercel.app | ✅ À déployer |
| **Domaine Custom** | https://onboarding.rt-technologie.com | ⏳ Optionnel |
| **Backend Ngrok** | https://abc123.ngrok.io | ✅ À configurer |
| **Backend Local** | http://localhost:3020 | 🟢 Online |
| **Ngrok Dashboard** | http://127.0.0.1:4040 | 📊 Monitoring |

---

## 🐛 Dépannage

### ❌ Erreur "Network Error" sur le frontend

**Cause** : Variable `NEXT_PUBLIC_API_URL` incorrecte ou backend non accessible

**Solution** :
1. Vérifier que Ngrok est lancé : `ngrok http 3020`
2. Vérifier l'URL dans les variables Vercel
3. Redéployer : Vercel → Deployments → Redeploy

### ❌ Erreur CORS

**Cause** : Backend refuse les requêtes depuis Vercel

**Solution** :
```bash
# Vérifier les logs backend
pm2 logs client-onboarding --lines 50

# Vérifier CORS dans server.js
# Redémarrer
pm2 restart client-onboarding
```

### ❌ Build Vercel échoue

**Cause** : Root Directory incorrect ou dépendances manquantes

**Solution** :
1. Vérifier Root Directory = `apps/marketing-site`
2. Voir les logs de build dans Vercel
3. Tester localement :
   ```bash
   cd apps/marketing-site
   npm install
   npm run build
   ```

---

## 📋 Checklist Finale

### Déploiement

- [ ] Compte Vercel créé
- [ ] Projet importé depuis GitHub
- [ ] Root Directory configuré : `apps/marketing-site`
- [ ] Premier déploiement réussi
- [ ] URL Vercel accessible

### Tunnel

- [ ] Ngrok installé
- [ ] Tunnel lancé : `ngrok http 3020`
- [ ] URL HTTPS récupérée
- [ ] Health check tunnel OK

### Configuration

- [ ] Variable `NEXT_PUBLIC_API_URL` mise à jour sur Vercel
- [ ] Application redéployée
- [ ] CORS configuré sur backend
- [ ] PM2 redémarré

### Tests

- [ ] Page `/onboarding` accessible
- [ ] Vérification TVA fonctionne (BE0477472701)
- [ ] Données se remplissent automatiquement
- [ ] Génération de contrat fonctionne
- [ ] Page de signature fonctionne

### Domaine Custom (Optionnel)

- [ ] Domaine ajouté sur Vercel
- [ ] DNS configuré (CNAME)
- [ ] Propagation DNS (5-60 min)
- [ ] SSL activé
- [ ] Site accessible sur onboarding.rt-technologie.com

---

## 🎯 Résumé des Commandes

```powershell
# 1. Lancer Ngrok (terminal 1)
ngrok http 3020

# 2. Vérifier le backend (terminal 2)
pm2 status
curl http://localhost:3020/health

# 3. Tester le tunnel
curl https://abc123.ngrok.io/health

# 4. Redémarrer PM2 si besoin
pm2 restart client-onboarding

# 5. Voir les logs
pm2 logs client-onboarding --lines 50

# 6. Monitoring Ngrok
# Ouvrir : http://127.0.0.1:4040
```

---

## ⏭️ Après le Déploiement

### Court Terme (Cette Semaine)

1. **Déployer sur AWS ECS** (backend production)
   - Installer AWS CLI
   - Exécuter les scripts de déploiement
   - Mettre à jour `NEXT_PUBLIC_API_URL` avec l'URL AWS

2. **Supprimer Ngrok** (plus nécessaire après AWS)

### Moyen Terme (Ce Mois)

1. Configurer un Load Balancer AWS
2. Mettre en place SSL/TLS sur le backend
3. Configurer monitoring CloudWatch
4. Ajouter des alertes

---

## 💡 Conseils

### Pour Garder Ngrok Actif

**Problème** : Le terminal Ngrok doit rester ouvert

**Solution 1** : Lancer en arrière-plan (Windows)
```powershell
Start-Process ngrok -ArgumentList "http 3020" -WindowStyle Minimized
```

**Solution 2** : Utiliser Ngrok en tant que service Windows
- Voir : [docs/TUNNEL_NGROK_SETUP.md](docs/TUNNEL_NGROK_SETUP.md)

**Solution 3** : Passer au plan Ngrok Pro ($10/mois)
- URL fixe qui ne change jamais
- Plus besoin de mettre à jour Vercel

### URL Ngrok Change ?

**Plan gratuit** : L'URL change à chaque redémarrage de Ngrok

**Solutions** :
1. Garder Ngrok ouvert en permanence
2. Passer au plan Pro (URL fixe)
3. Déployer sur AWS ECS (solution finale)

---

## 🎊 Félicitations !

Une fois ces étapes terminées, votre système d'onboarding sera :

✅ **Accessible sur Internet** via Vercel
✅ **Fonctionnel** avec vérification TVA
✅ **Professionnel** avec génération de contrat et signature
✅ **Sécurisé** avec HTTPS (Vercel + Ngrok)

**URL finale** : https://rt-technologie-onboarding-xxxxx.vercel.app
**Ou** : https://onboarding.rt-technologie.com (avec domaine custom)

---

## 📞 Support

**Problème ?**
- [DEPLOIEMENT_VERCEL_3_MINUTES.md](DEPLOIEMENT_VERCEL_3_MINUTES.md) - Guide détaillé
- [docs/TUNNEL_NGROK_SETUP.md](docs/TUNNEL_NGROK_SETUP.md) - Configuration Ngrok
- [docs/CORS_CONFIGURATION.md](docs/CORS_CONFIGURATION.md) - Configuration CORS

**Prêt ? Allons-y ! 🚀**

---

**Dernière mise à jour** : 18 Novembre 2025, 14h45
