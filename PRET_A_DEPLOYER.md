# SYSTEME PRET A DEPLOYER

## Statut du Systeme

**Date** : 18 Novembre 2025

### Backend (PM2)
- Statut : ONLINE
- PID : 42476
- Port : 3020
- Uptime : 25+ minutes
- Health Check : OK

### Frontend (Next.js)
- Statut : PRET POUR VERCEL
- Code : Push sur GitHub
- Configuration : Complete

### Base de Donnees
- MongoDB Atlas : CONFIGURE
- URI : stagingrt.v2jnoh2.mongodb.net
- Database : rt_technologie
- Connexion : OK

### Email
- Mailgun SMTP : CONFIGURE
- Host : smtp.eu.mailgun.org
- From : postmaster@mg.rt-technologie.com

### Tunnel
- Ngrok API Key : FOURNIE
- Scripts : PRETS
- Installation : A FAIRE

## Prochaines Actions

### MAINTENANT : Installer Ngrok (3 minutes)

**Voir le guide** : [INSTALLATION_NGROK_MANUELLE.md](INSTALLATION_NGROK_MANUELLE.md)

**Etapes rapides** :

1. Telecharger : https://ngrok.com/download
2. Extraire dans `C:\ngrok\`
3. Configurer :
   ```powershell
   C:\ngrok\ngrok.exe config add-authtoken 35eYhKmc82AHkWgHWFakEPH0hq0_6rTmgMyebQioiDrt4ERGj
   ```
4. Lancer :
   ```powershell
   C:\ngrok\ngrok.exe http 3020
   ```
5. COPIER l'URL HTTPS affichee

### ENSUITE : Deployer sur Vercel (5 minutes)

**Voir le guide** : [DEMARRAGE_RAPIDE.md](DEMARRAGE_RAPIDE.md)

**Etapes rapides** :

1. Aller sur : https://vercel.com/new
2. Se connecter avec GitHub
3. Importer : RT-Technologie
4. Configuration :
   - Root Directory : `apps/marketing-site`
   - Variable : `NEXT_PUBLIC_API_URL` = URL Ngrok
5. Deploy

### ENFIN : Tester (2 minutes)

1. Ouvrir l'URL Vercel
2. Tester avec TVA : `BE0477472701`
3. Verifier que les donnees se remplissent

## Documentation Disponible

### Guides de Demarrage

1. **[DEMARRAGE_RAPIDE.md](DEMARRAGE_RAPIDE.md)** - Guide complet 15 minutes
2. **[INSTALLATION_NGROK_MANUELLE.md](INSTALLATION_NGROK_MANUELLE.md)** - Installation Ngrok detaillee
3. **[ETAPES_FINALES.md](ETAPES_FINALES.md)** - Guide en 3 commandes

### Documentation Technique

4. **[RESUME_DEPLOIEMENT_COMPLET.md](RESUME_DEPLOIEMENT_COMPLET.md)** - Vue d'ensemble complete
5. **[INSTRUCTIONS_IMMEDIATES.md](INSTRUCTIONS_IMMEDIATES.md)** - Instructions detaillees
6. **[INDEX_DOCUMENTATION.md](INDEX_DOCUMENTATION.md)** - Index de tous les guides

### Documentation Vercel

7. **[README_VERCEL.md](README_VERCEL.md)** - Guide Vercel complet
8. **[DEPLOIEMENT_VERCEL_3_MINUTES.md](DEPLOIEMENT_VERCEL_3_MINUTES.md)** - Guide rapide Vercel

### Documentation Backend

9. **[docs/TUNNEL_NGROK_SETUP.md](docs/TUNNEL_NGROK_SETUP.md)** - Configuration Ngrok detaillee
10. **[QUICKSTART.md](QUICKSTART.md)** - Commandes quotidiennes

## Architecture Deployed

```
Internet
    |
    |--- https://rt-technologie-xxxxx.vercel.app (Frontend Vercel)
    |                 |
    |                 v
    |--- https://abc-123-xyz.ngrok.io (Tunnel Ngrok)
                      |
                      v
            http://localhost:3020 (Backend PM2)
                      |
                      v
            MongoDB Atlas (stagingrt.v2jnoh2.mongodb.net)
```

## Fonctionnalites Pretes

### Page d'Inscription (/onboarding)

- Etape 1 : Verification TVA (VIES + INSEE)
- Etape 2 : Informations entreprise (auto-remplissage)
- Etape 3 : Representant legal
- Etape 4 : Choix abonnement
- Etape 5 : Paiement

### Page de Signature (/sign-contract/[id])

- Visualisation du contrat PDF
- Signature electronique (canvas)
- Conformite eIDAS
- Email de confirmation

### API Backend

- POST /api/onboarding/verify-vat - Verification TVA
- POST /api/onboarding/submit - Soumission formulaire
- GET  /api/onboarding/contract/:id - Recuperation PDF
- POST /api/onboarding/sign/:id - Signature electronique
- GET  /health - Health check

## Technologies Deployees

### Frontend
- Next.js 14.2.5
- React 18.2
- TypeScript
- Tailwind CSS
- React Hook Form
- Signature Canvas

### Backend
- Node.js 20
- Express.js
- MongoDB avec Mongoose
- PDFKit pour generation PDF
- Nodemailer + Mailgun
- JWT pour authentification

### Infrastructure
- PM2 (process manager local)
- MongoDB Atlas (database cloud)
- Mailgun SMTP (emails)
- Ngrok (tunnel temporaire)
- Vercel (frontend hosting)

## Prochaines Etapes Long Terme

### Deploiement Production AWS (Optionnel)

**Guides disponibles** :
- README_AWS_DEPLOY.md (exclu du Git pour securite)
- docs/AWS_CREDENTIALS_SETUP.md (exclu du Git)

**Avantages** :
- URL fixe et stable
- Pas de limite de connexions
- Pas besoin de Ngrok
- Infrastructure professionnelle

**Scripts prets** :
- scripts/setup-aws-infrastructure.sh
- scripts/setup-aws-secrets.sh
- scripts/deploy-aws-ecs.sh
- infra/aws/ecs-task-definition.json

### Domaine Custom

Configurer `onboarding.rt-technologie.com` :
1. Ajouter le domaine dans Vercel
2. Configurer le CNAME chez le registrar
3. SSL active automatiquement

## Verification Finale

### Checklist Pre-Deploiement

- [x] Backend PM2 online
- [x] MongoDB connecte
- [x] Mailgun configure
- [x] Frontend code pousse sur GitHub
- [x] Configuration Vercel prete
- [x] Documentation complete
- [ ] Ngrok installe
- [ ] Tunnel Ngrok lance
- [ ] Frontend deploye sur Vercel
- [ ] Tests end-to-end OK

### Commandes de Verification

```powershell
# Backend PM2
pm2 status

# Backend health
curl http://localhost:3020/health

# Tunnel (apres installation Ngrok)
curl https://VOTRE-URL-NGROK.ngrok.io/health
```

## Support et Assistance

**Tous les guides sont disponibles dans le dossier du projet.**

**Commencez par** : [DEMARRAGE_RAPIDE.md](DEMARRAGE_RAPIDE.md)

**En cas de probleme** : Voir la section "Depannage" dans chaque guide

---

## RESUME : 3 ETAPES POUR MISE EN LIGNE

### 1. Installer Ngrok
```powershell
# Telecharger de https://ngrok.com/download
# Extraire dans C:\ngrok\
C:\ngrok\ngrok.exe config add-authtoken 35eYhKmc82AHkWgHWFakEPH0hq0_6rTmgMyebQioiDrt4ERGj
```

### 2. Lancer le Tunnel
```powershell
C:\ngrok\ngrok.exe http 3020
# COPIER l'URL HTTPS affichee
```

### 3. Deployer sur Vercel
```
https://vercel.com/new
- Importer : RT-Technologie
- Root Directory : apps/marketing-site
- Variable : NEXT_PUBLIC_API_URL = URL Ngrok
- Deploy
```

**Temps total** : 15 minutes
**Resultat** : Systeme d'onboarding en ligne !

---

**Derniere mise a jour** : 18 Novembre 2025, 16h00
