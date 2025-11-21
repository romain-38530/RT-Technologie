# 🚀 Commandes de Déploiement Complet - RT-Technologie

## 📊 Vue d'Ensemble

**Total Services Backend:** 20
**Total Frontends:** 8
**Infrastructure:** AWS ECS Fargate + Vercel

---

## ✅ Étape 1 : Services Backend Initiaux (EN COURS dans CloudShell)

Le script `~/deploy-complete.sh` est EN COURS d'exécution et déploie :

- ✅ core-orders (3030)
- ✅ affret-ia (3010)
- ✅ vigilance (3040)

**Durée:** ~20 minutes

---

## 🔄 Étape 2 : Déployer TOUS les Services Restants (après Étape 1)

### Dans AWS CloudShell

Une fois que `~/deploy-complete.sh` a terminé, téléchargez et lancez le script pour déployer les 16 services restants :

```bash
# Télécharger le script depuis GitHub
curl -o ~/deploy-remaining.sh https://raw.githubusercontent.com/romain-38530/RT-Technologie/dockerfile/infra/deploy-all-remaining-services.sh

# Rendre exécutable
chmod +x ~/deploy-remaining.sh

# Lancer le déploiement de TOUS les services restants
~/deploy-remaining.sh
```

**Services qui seront déployés (16) :**

**Critiques (3) :**
- notifications (3050)
- authz (3007)
- admin-gateway (3008)

**Métier (4) :**
- pricing-grids (3060)
- planning (3070)
- bourse (3080)
- palette (3090)

**Sync (3) :**
- wms-sync (3100)
- erp-sync (3110)
- tms-sync (3120)

**IA & Spécialisés (6) :**
- tracking-ia (3130)
- chatbot (3140)
- geo-tracking (3150)
- ecpmr (3160)
- storage-market (3170)
- training (3180)

**Durée estimée:** 40-60 minutes

---

## 🌐 Étape 3 : Récupérer Toutes les IPs

Une fois le déploiement terminé :

```bash
# Dans CloudShell
~/get-all-ips.sh
```

**Résultat attendu :**
```
🌐 TOUS les services RT-Technologie:

✓ client-onboarding: http://3.79.182.74:3020
✓ core-orders: http://X.X.X.X:3030
✓ affret-ia: http://X.X.X.X:3010
✓ vigilance: http://X.X.X.X:3040
✓ notifications: http://X.X.X.X:3050
✓ authz: http://X.X.X.X:3007
... (20 services au total)
```

---

## 💻 Étape 4 : Déployer les Frontends sur Vercel

### Sur votre machine locale (pas CloudShell)

```bash
# Cloner le repository si pas déjà fait
git clone https://github.com/romain-38530/RT-Technologie.git
cd RT-Technologie
git checkout dockerfile

# Installer Vercel CLI
npm install -g vercel

# Configurer le token
export VERCEL_TOKEN=79eVweIfP4CXv9dGDuDRS5hz

# Récupérer les IPs depuis CloudShell
# (Copiez les IPs obtenues à l'étape 3)

# Déployer web-industry
cd apps/web-industry
vercel --token=$VERCEL_TOKEN --prod \
  -e NEXT_PUBLIC_API_URL=http://3.79.182.74:3020 \
  -e NEXT_PUBLIC_ORDERS_API_URL=http://X.X.X.X:3030 \
  -e NEXT_PUBLIC_AFFRET_API_URL=http://X.X.X.X:3010 \
  -e NEXT_PUBLIC_VIGILANCE_API_URL=http://X.X.X.X:3040 \
  -e NEXT_PUBLIC_AUTHZ_URL=http://X.X.X.X:3007 \
  --name=web-industry

# Déployer backoffice-admin
cd ../backoffice-admin
vercel --token=$VERCEL_TOKEN --prod \
  -e NEXT_PUBLIC_API_URL=http://3.79.182.74:3020 \
  -e NEXT_PUBLIC_ORDERS_API_URL=http://X.X.X.X:3030 \
  -e NEXT_PUBLIC_AFFRET_API_URL=http://X.X.X.X:3010 \
  -e NEXT_PUBLIC_VIGILANCE_API_URL=http://X.X.X.X:3040 \
  -e NEXT_PUBLIC_AUTHZ_URL=http://X.X.X.X:3007 \
  --name=backoffice-admin

# Déployer web-logistician
cd ../web-logistician
vercel --token=$VERCEL_TOKEN --prod \
  -e NEXT_PUBLIC_API_URL=http://3.79.182.74:3020 \
  -e NEXT_PUBLIC_ORDERS_API_URL=http://X.X.X.X:3030 \
  --name=web-logistician

# Déployer web-transporter
cd ../web-transporter
vercel --token=$VERCEL_TOKEN --prod \
  -e NEXT_PUBLIC_API_URL=http://3.79.182.74:3020 \
  -e NEXT_PUBLIC_ORDERS_API_URL=http://X.X.X.X:3030 \
  --name=web-transporter
```

**Remplacez `X.X.X.X` par les vraies IPs obtenues à l'étape 3**

---

## 🧪 Étape 5 : Tester le Système Complet

### Tester les Services Backend

```bash
# Health checks
curl http://3.79.182.74:3020/health  # client-onboarding
curl http://X.X.X.X:3030/health       # core-orders
curl http://X.X.X.X:3010/health       # affret-ia
curl http://X.X.X.X:3040/health       # vigilance
curl http://X.X.X.X:3007/health       # authz
curl http://X.X.X.X:3050/health       # notifications
```

### Tester la Vérification TVA

```bash
curl -X POST http://3.79.182.74:3020/api/onboarding/verify-vat \
  -H "Content-Type: application/json" \
  -d '{"vatNumber":"FR21350675567"}'
```

### Accéder aux Frontends

- **Marketing Site:** https://marketing-site-h613b2d6c-rt-technologie.vercel.app
- **Web Industry:** URL fournie par Vercel après déploiement
- **Backoffice Admin:** URL fournie par Vercel après déploiement

---

## 📋 Récapitulatif des URLs

### Backend (AWS ECS)

| Service | Port | URL | Status |
|---------|------|-----|--------|
| client-onboarding | 3020 | http://3.79.182.74:3020 | ✅ |
| core-orders | 3030 | http://X.X.X.X:3030 | ⏳ |
| affret-ia | 3010 | http://X.X.X.X:3010 | ⏳ |
| vigilance | 3040 | http://X.X.X.X:3040 | ⏳ |
| notifications | 3050 | À déployer | ⏳ |
| authz | 3007 | À déployer | ⏳ |
| admin-gateway | 3008 | À déployer | ⏳ |
| pricing-grids | 3060 | À déployer | ⏳ |
| planning | 3070 | À déployer | ⏳ |
| bourse | 3080 | À déployer | ⏳ |
| palette | 3090 | À déployer | ⏳ |
| wms-sync | 3100 | À déployer | ⏳ |
| erp-sync | 3110 | À déployer | ⏳ |
| tms-sync | 3120 | À déployer | ⏳ |
| tracking-ia | 3130 | À déployer | ⏳ |
| chatbot | 3140 | À déployer | ⏳ |
| geo-tracking | 3150 | À déployer | ⏳ |
| ecpmr | 3160 | À déployer | ⏳ |
| storage-market | 3170 | À déployer | ⏳ |
| training | 3180 | À déployer | ⏳ |

### Frontend (Vercel)

| Application | Status |
|-------------|--------|
| marketing-site | ✅ Déployé |
| web-industry | À déployer |
| backoffice-admin | À déployer |
| web-logistician | À déployer |
| web-transporter | À déployer |
| web-recipient | À déployer |
| web-supplier | À déployer |
| web-forwarder | À déployer |

---

## ⏱️ Calendrier de Déploiement

**Aujourd'hui (en cours) :**
- ✅ Étape 1 : 3 services backend (20 min) - EN COURS
- ⏳ Étape 2 : 16 services backend (60 min) - PRÊT À LANCER
- ⏳ Étape 3 : IPs (1 min)
- ⏳ Étape 4 : 4 frontends (15 min)

**Total estimé : ~90 minutes**

---

## 💰 Estimation des Coûts

### AWS ECS (20 services)

**Configuration par service :**
- CPU: 256 (0.25 vCPU)
- Memory: 512 MB
- Type: Fargate

**Coût mensuel :**
- Par service : ~15-20€/mois
- 20 services : **~300-400€/mois**

**Optimisations possibles :**
- Arrêter les services non-critiques
- Utiliser Fargate Spot (économie 70%)
- Réduire desired-count à 0 pour dev/test

### Vercel

- Plan Pro : 20$/mois
- Bande passante : 1TB inclus
- **Total : ~20€/mois**

**TOTAL MENSUEL : ~320-420€**

---

## 📝 Scripts Disponibles

Dans CloudShell :

```bash
~/deploy-complete.sh        # Déploie 3 services (EN COURS)
~/deploy-remaining.sh        # Déploie 16 services restants
~/get-all-ips.sh            # Récupère toutes les IPs
```

Localement :

```bash
infra/deploy-frontends-vercel.sh  # Déploie tous les frontends
infra/create-all-dockerfiles.sh   # Crée tous les Dockerfiles
```

---

## 🆘 En Cas de Problème

### Service ne démarre pas

```bash
# Voir les logs
aws logs tail /ecs/rt-SERVICE-NAME --follow --region eu-central-1
```

### Rebuild et redéployer un service

```bash
# Dans CloudShell
cd ~/RT-Technologie
docker build -t rt-SERVICE-NAME -f services/SERVICE-NAME/Dockerfile .
docker tag rt-SERVICE-NAME 004843574253.dkr.ecr.eu-central-1.amazonaws.com/rt-SERVICE-NAME:latest
docker push 004843574253.dkr.ecr.eu-central-1.amazonaws.com/rt-SERVICE-NAME:latest

# Forcer redéploiement
aws ecs update-service \
  --cluster rt-technologie-cluster \
  --service rt-SERVICE-NAME-service \
  --force-new-deployment \
  --region eu-central-1
```

---

## ✅ Checklist Finale

- [ ] Étape 1 terminée (3 services backend)
- [ ] Étape 2 terminée (16 services backend)
- [ ] Toutes les IPs récupérées
- [ ] Frontends prioritaires déployés (web-industry, backoffice-admin)
- [ ] Tests fonctionnels effectués
- [ ] Documentation des URLs complétée

---

**Bon déploiement ! 🚀**

*Dernière mise à jour : 2025-11-19*
