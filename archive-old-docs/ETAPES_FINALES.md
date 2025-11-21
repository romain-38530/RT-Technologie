# 🎯 ÉTAPES FINALES - Mise en Ligne en 3 Commandes

**Votre clé API Ngrok est déjà configurée !**

---

## 🚀 COMMANDE 1 : Installer Ngrok (2 minutes)

### Ouvrir PowerShell

```powershell
# Dans le dossier RT-Technologie
cd "c:\Users\rtard\OneDrive - RT LOGISTIQUE\RT Technologie\RT-Technologie"

# Exécuter le script d'installation
.\setup-ngrok.ps1
```

**Ce script va** :
- ✅ Télécharger Ngrok
- ✅ L'installer dans `C:\ngrok\`
- ✅ Configurer votre clé API automatiquement
- ✅ Créer un script de lancement `launch-ngrok.ps1`

---

## 🌐 COMMANDE 2 : Lancer le Tunnel (30 secondes)

```powershell
# Lancer le tunnel
.\launch-ngrok.ps1
```

**Résultat attendu** :

```
ngrok

Session Status                online
Forwarding                    https://abc-123-xyz.ngrok.io -> http://localhost:3020

Web Interface                 http://127.0.0.1:4040
```

### ⚠️ TRÈS IMPORTANT

**📝 COPIER L'URL HTTPS affichée**

Exemple : `https://abc-123-xyz.ngrok.io`

**⏱️ LAISSER CETTE FENÊTRE OUVERTE** (ne pas fermer !)

---

## ✅ COMMANDE 3 : Vérifier (10 secondes)

### Ouvrir un nouveau PowerShell

```powershell
# Remplacer par VOTRE URL Ngrok
curl https://abc-123-xyz.ngrok.io/health
```

**Résultat attendu** :

```json
{"status":"ok","service":"client-onboarding","port":"3020"}
```

✅ **Si vous voyez ceci, le tunnel fonctionne parfaitement !**

---

## 🎯 ÉTAPE SUIVANTE : Déployer sur Vercel

### 1. Aller sur Vercel

**URL** : https://vercel.com/new

### 2. Importer le Projet

- Se connecter avec GitHub
- Chercher : **"RT-Technologie"**
- Cliquer : **"Import"**

### 3. Configuration

```
Project Name: rt-technologie-onboarding
Framework: Next.js ✅ (auto-détecté)
Root Directory: apps/marketing-site  👈 IMPORTANT !
```

### 4. Variable d'Environnement

**Cliquer "Environment Variables"**

```
Name: NEXT_PUBLIC_API_URL
Value: https://abc-123-xyz.ngrok.io  👈 VOTRE URL Ngrok
Environment: Production ✅
```

**Cliquer "Add"**

### 5. Déployer

**Cliquer "Deploy"**

Attendre 2-3 minutes...

### 6. Récupérer l'URL

Vercel affiche : `https://rt-technologie-onboarding-xxxxx.vercel.app`

**📝 COPIER CETTE URL**

---

## 🎊 TESTER LE SITE

### Ouvrir dans votre navigateur

```
https://rt-technologie-onboarding-xxxxx.vercel.app
```

### Test 1 : Accès

Vous devriez voir : **"Inscription RT Technologie"**

### Test 2 : Vérification TVA

1. Dans le champ "Numéro de TVA", entrer : **`BE0477472701`**
2. Cliquer : **"Vérifier et continuer"**

**Résultat attendu** :

✅ Les champs se remplissent automatiquement :
- Raison sociale : **SA ODOO**
- Adresse : **Chaussée de Namur 40, 1367 Ramillies**

### Test 3 : Formulaire Complet (Optionnel)

1. Compléter toutes les étapes
2. Sélectionner un type d'abonnement
3. Valider → Un contrat PDF est généré
4. Signer électroniquement

---

## 📊 RÉCAPITULATIF - VOS URLS

| Service | URL |
|---------|-----|
| **Frontend (Vercel)** | https://rt-technologie-onboarding-xxxxx.vercel.app |
| **Backend (Ngrok)** | https://abc-123-xyz.ngrok.io |
| **Backend (Local)** | http://localhost:3020 |
| **Ngrok Dashboard** | http://127.0.0.1:4040 |
| **Vercel Dashboard** | https://vercel.com/dashboard |

---

## 🌐 DOMAINE CUSTOM (Optionnel)

### Pour avoir onboarding.rt-technologie.com

#### Dans Vercel

1. Settings → Domains
2. Ajouter : `onboarding.rt-technologie.com`

#### Chez Votre Registrar (OVH, etc.)

```
Type: CNAME
Nom: onboarding
Valeur: cname.vercel-dns.com
TTL: 3600
```

#### Attendre

- Propagation DNS : 5-60 minutes
- SSL : Activé automatiquement

#### Résultat

```
https://onboarding.rt-technologie.com
```

---

## 🔧 COMMANDES UTILES

### Vérifier le Backend PM2

```powershell
pm2 status
pm2 logs client-onboarding
```

### Redémarrer PM2 si Besoin

```powershell
pm2 restart client-onboarding
```

### Tester le Backend Direct

```powershell
curl http://localhost:3020/health
```

### Voir les Requêtes Ngrok

Ouvrir dans le navigateur : http://127.0.0.1:4040

---

## 🐛 DÉPANNAGE

### ❌ Erreur lors de setup-ngrok.ps1

**Solution** : Exécuter PowerShell en Administrateur

```powershell
# Clic droit sur PowerShell → Exécuter en tant qu'administrateur
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\setup-ngrok.ps1
```

### ❌ "Network Error" sur le site

**Vérifier** :

```powershell
# 1. Ngrok est lancé ?
# La fenêtre Ngrok doit être ouverte

# 2. PM2 actif ?
pm2 status

# 3. Tunnel fonctionne ?
curl https://abc-123-xyz.ngrok.io/health
```

### ❌ Build Vercel échoue

**Solution** :

1. Vérifier Root Directory = `apps/marketing-site`
2. Voir les logs dans Vercel
3. Tester localement :
   ```powershell
   cd apps/marketing-site
   npm install
   npm run build
   ```

---

## 📞 BESOIN D'AIDE ?

### Documentation Complète

- [INSTRUCTIONS_IMMEDIATES.md](INSTRUCTIONS_IMMEDIATES.md) - Guide détaillé
- [GUIDE_DEPLOIEMENT_IMMEDIAT.md](GUIDE_DEPLOIEMENT_IMMEDIAT.md) - Guide complet
- [INDEX_DOCUMENTATION.md](INDEX_DOCUMENTATION.md) - Index de toute la doc

### Support

Tous les guides sont dans le dossier du projet et sur GitHub.

---

## 🎊 RÉSUMÉ - 3 COMMANDES

```powershell
# 1. Installer Ngrok (2 min)
.\setup-ngrok.ps1

# 2. Lancer le tunnel (30 sec)
.\launch-ngrok.ps1

# 3. Vérifier (10 sec)
curl https://abc-123-xyz.ngrok.io/health
```

**Puis déployer sur Vercel** → https://vercel.com/new

**Temps total** : 15 minutes

**Résultat** : Système d'onboarding en ligne ! 🚀

---

**C'est parti ! Exécutez maintenant :**

```powershell
.\setup-ngrok.ps1
```

---

**Dernière mise à jour** : 18 Novembre 2025, 15h15
