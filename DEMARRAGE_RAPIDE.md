# Demarrage Rapide - Mise en Ligne en 15 Minutes

## Statut Actuel

**Backend PM2** : ONLINE (port 3020)
**Frontend** : Pret pour deploiement Vercel
**MongoDB** : Configure et connecte
**Mailgun** : Configure

## Etape 1 : Installer Ngrok (3 minutes)

### Option A : Installation Manuelle (RECOMMANDE)

1. **Telecharger** : https://ngrok.com/download
2. **Extraire** dans `C:\ngrok\`
3. **Configurer** la cle API :

```powershell
C:\ngrok\ngrok.exe config add-authtoken 35eYhKmc82AHkWgHWFakEPH0hq0_6rTmgMyebQioiDrt4ERGj
```

### Option B : Via Script

```powershell
# Si probleme reseau, suivre Option A
.\setup-ngrok.ps1
```

**Guide detaille** : [INSTALLATION_NGROK_MANUELLE.md](INSTALLATION_NGROK_MANUELLE.md)

## Etape 2 : Lancer le Tunnel Ngrok (30 secondes)

```powershell
C:\ngrok\ngrok.exe http 3020
```

**IMPORTANT** :
1. COPIER l'URL HTTPS affichee (exemple : `https://abc-123-xyz.ngrok.io`)
2. LAISSER cette fenetre PowerShell ouverte

**Verification** (dans un nouveau PowerShell) :

```powershell
curl https://VOTRE-URL-NGROK.ngrok.io/health
```

Resultat attendu :
```json
{"status":"ok","service":"client-onboarding","port":"3020"}
```

## Etape 3 : Deployer sur Vercel (5 minutes)

### 3.1 Aller sur Vercel

**URL** : https://vercel.com/new

### 3.2 Se Connecter

- Cliquer : "Continue with GitHub"
- Autoriser l'acces

### 3.3 Importer le Projet

1. Chercher : **RT-Technologie**
2. Cliquer : **Import**

### 3.4 Configuration

```
Project Name: rt-technologie-onboarding
Framework: Next.js (auto-detecte)
Root Directory: apps/marketing-site
```

### 3.5 Variable d'Environnement

**Cliquer sur "Environment Variables"**

Ajouter :
```
Name  : NEXT_PUBLIC_API_URL
Value : https://VOTRE-URL-NGROK.ngrok.io
```

Remplacer `VOTRE-URL-NGROK` par l'URL copiee a l'etape 2.

**Cliquer "Add"**

### 3.6 Deployer

1. **Cliquer** : "Deploy"
2. **Attendre** : 2-3 minutes
3. **Copier l'URL Vercel** affichee

## Etape 4 : Tester (2 minutes)

### 4.1 Ouvrir le Site

Ouvrir l'URL Vercel dans votre navigateur :
```
https://rt-technologie-xxxxx.vercel.app
```

### 4.2 Tester la Verification TVA

1. Sur la page, dans le champ "Numero de TVA"
2. Entrer : `BE0477472701`
3. Cliquer : "Verifier et continuer"

**Resultat attendu** :
- Raison sociale : SA ODOO
- Adresse : Chaussee de Namur 40, 1367 Ramillies

## Resultat Final

Vous avez maintenant :

| Service | URL |
|---------|-----|
| **Frontend (Vercel)** | https://rt-technologie-xxxxx.vercel.app |
| **Backend (Ngrok)** | https://abc-123-xyz.ngrok.io |
| **Backend (Local)** | http://localhost:3020 |
| **Ngrok Dashboard** | http://127.0.0.1:4040 |

## Fonctionnalites Disponibles

- Verification TVA automatique (VIES + INSEE)
- Auto-remplissage donnees entreprise
- Formulaire d'inscription 5 etapes
- Generation contrats PDF
- Signature electronique
- Emails automatiques

## Monitoring

### Backend PM2

```powershell
pm2 status
pm2 logs client-onboarding
```

### Ngrok Dashboard

Ouvrir : http://127.0.0.1:4040

Voir toutes les requetes HTTP en temps reel.

### Vercel Logs

1. Aller sur https://vercel.com/dashboard
2. Selectionner le projet
3. Onglet "Deployments"
4. Cliquer sur le deploiement → "View Function Logs"

## Commandes Utiles

### Verifier le Backend

```powershell
curl http://localhost:3020/health
```

### Verifier le Tunnel

```powershell
curl https://VOTRE-URL-NGROK.ngrok.io/health
```

### Redemarrer PM2

```powershell
pm2 restart client-onboarding
```

## Domaine Custom (Optionnel)

Pour avoir `onboarding.rt-technologie.com` :

1. **Dans Vercel** : Settings → Domains → Ajouter `onboarding.rt-technologie.com`
2. **Chez votre registrar** (OVH, etc.) :
   ```
   Type: CNAME
   Nom: onboarding
   Valeur: cname.vercel-dns.com
   TTL: 3600
   ```
3. **Attendre** : 5-60 minutes (propagation DNS)
4. **SSL** : Active automatiquement

## Limitations Ngrok Gratuit

- URL change si vous redemarrez Ngrok
- 40 connexions/minute max
- Terminal doit rester ouvert

**Solution long terme** : Deployer le backend sur AWS ECS (voir README_AWS_DEPLOY.md)

## Support

**Guides disponibles** :
- [INSTALLATION_NGROK_MANUELLE.md](INSTALLATION_NGROK_MANUELLE.md) - Installation Ngrok detaillee
- [ETAPES_FINALES.md](ETAPES_FINALES.md) - Guide complet en 3 commandes
- [INSTRUCTIONS_IMMEDIATES.md](INSTRUCTIONS_IMMEDIATES.md) - Instructions detaillees
- [INDEX_DOCUMENTATION.md](INDEX_DOCUMENTATION.md) - Index de toute la documentation

## Depannage

### "Network Error" sur le frontend

```powershell
# 1. Verifier Ngrok est lance
# La fenetre Ngrok doit etre ouverte

# 2. Verifier PM2
pm2 status

# 3. Tester le tunnel
curl https://VOTRE-URL-NGROK.ngrok.io/health

# 4. Redemarrer PM2 si necessaire
pm2 restart client-onboarding
```

### Build Vercel echoue

1. Verifier Root Directory = `apps/marketing-site`
2. Voir les logs dans Vercel
3. Tester localement :
   ```powershell
   cd apps/marketing-site
   npm install
   npm run build
   ```

## C'est Parti !

**Temps total** : 15 minutes
**Resultat** : Systeme d'onboarding accessible sur Internet

**Commencez par** : [INSTALLATION_NGROK_MANUELLE.md](INSTALLATION_NGROK_MANUELLE.md)

---

**Derniere mise a jour** : 18 Novembre 2025
