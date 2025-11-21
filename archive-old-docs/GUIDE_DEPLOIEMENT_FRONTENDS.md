# 🚀 Guide de Déploiement des Frontends sur Vercel

**Prérequis:** Les 20 services backend doivent être déployés sur AWS ECS

---

## 📋 Vue d'Ensemble

**8 Frontends à déployer:**

1. ✅ marketing-site (déjà déployé - SSO à désactiver)
2. ⏳ web-industry
3. ⏳ backoffice-admin
4. ⏳ web-logistician
5. ⏳ web-transporter
6. ⏳ web-recipient
7. ⏳ web-supplier
8. ⏳ web-forwarder

---

## 🎯 Étape 1: Récupérer les IPs Backend

### Dans AWS CloudShell

Une fois que le script `~/deploy-fixed.sh` est terminé:

```bash
~/get-all-ips.sh
```

**Résultat attendu:**

```
🌐 TOUS les services RT-Technologie:

✓ client-onboarding: http://3.79.182.74:3020
✓ core-orders: http://18.197.45.123:3030
✓ affret-ia: http://3.120.56.89:3010
✓ vigilance: http://3.127.34.78:3040
✓ notifications: http://18.185.23.145:3050
✓ authz: http://3.126.89.234:3007
✓ admin-gateway: http://18.156.67.190:3008
... (20 services au total)
```

**Notez les IPs suivantes (elles sont nécessaires pour les frontends):**

- `core-orders`: __________________:3030
- `affret-ia`: __________________:3010
- `vigilance`: __________________:3040
- `authz`: __________________:3007
- `notifications`: __________________:3050

---

## 🎯 Étape 2: Désactiver la Protection SSO du Marketing Site

### Via le Dashboard Vercel

1. Allez sur https://vercel.com/rt-technologie/marketing-site/settings/deployment-protection
2. Connectez-vous avec votre compte (rtardy-4938)
3. Changez de "SSO" ou "Enabled" à **"Off"**
4. Testez: https://marketing-site-rt-technologie.vercel.app

---

## 🎯 Étape 3: Configurer les IPs pour les Frontends

### Sur votre machine locale

```bash
# Rendre le script exécutable
chmod +x infra/update-frontend-ips.sh

# Lancer le script interactif
bash infra/update-frontend-ips.sh
```

**Le script vous demandera:**

```
Entrez les IPs publiques obtenues depuis AWS CloudShell:

IP de core-orders (port 3030): 18.197.45.123
IP de affret-ia (port 3010): 3.120.56.89
IP de vigilance (port 3040): 3.127.34.78
IP de authz (port 3007): 3.126.89.234
IP de notifications (port 3050): 18.185.23.145

📝 IPs saisies:
  core-orders: 18.197.45.123:3030
  affret-ia: 3.120.56.89:3010
  vigilance: 3.127.34.78:3040
  authz: 3.126.89.234:3007
  notifications: 18.185.23.145:3050

Confirmer (y/n)? y

✓ Fichier mis à jour
```

---

## 🎯 Étape 4: Déployer TOUS les Frontends

### Option A: Script Automatique (Recommandé)

```bash
# Déployer les 8 frontends en une seule commande
chmod +x infra/deploy-all-frontends.sh
bash infra/deploy-all-frontends.sh
```

**Durée estimée:** 10-15 minutes

**Le script va:**
1. ✅ Vérifier que Vercel CLI est installé
2. ✅ Déployer chaque frontend avec les bonnes variables d'environnement
3. ✅ Afficher les URLs de chaque déploiement
4. ✅ Créer un résumé final

---

### Option B: Déploiement Manuel (Un par Un)

Si vous préférez déployer manuellement:

#### 1. Marketing Site (déjà fait)

```bash
cd apps/marketing-site
vercel --token=79eVweIfP4CXv9dGDuDRS5hz --prod --yes \
  -e NEXT_PUBLIC_API_URL=http://3.79.182.74:3020 \
  --name=marketing-site
```

#### 2. Web Industry

```bash
cd apps/web-industry
vercel --token=79eVweIfP4CXv9dGDuDRS5hz --prod --yes \
  -e NEXT_PUBLIC_API_URL=http://3.79.182.74:3020 \
  -e NEXT_PUBLIC_ORDERS_API_URL=http://[IP_CORE_ORDERS]:3030 \
  -e NEXT_PUBLIC_AFFRET_API_URL=http://[IP_AFFRET_IA]:3010 \
  -e NEXT_PUBLIC_VIGILANCE_API_URL=http://[IP_VIGILANCE]:3040 \
  -e NEXT_PUBLIC_AUTHZ_URL=http://[IP_AUTHZ]:3007 \
  --name=web-industry
```

#### 3. Backoffice Admin

```bash
cd apps/backoffice-admin
vercel --token=79eVweIfP4CXv9dGDuDRS5hz --prod --yes \
  -e NEXT_PUBLIC_API_URL=http://3.79.182.74:3020 \
  -e NEXT_PUBLIC_ORDERS_API_URL=http://[IP_CORE_ORDERS]:3030 \
  -e NEXT_PUBLIC_AFFRET_API_URL=http://[IP_AFFRET_IA]:3010 \
  -e NEXT_PUBLIC_VIGILANCE_API_URL=http://[IP_VIGILANCE]:3040 \
  -e NEXT_PUBLIC_AUTHZ_URL=http://[IP_AUTHZ]:3007 \
  -e NEXT_PUBLIC_NOTIFICATIONS_URL=http://[IP_NOTIFICATIONS]:3050 \
  --name=backoffice-admin
```

#### 4. Web Logistician

```bash
cd apps/web-logistician
vercel --token=79eVweIfP4CXv9dGDuDRS5hz --prod --yes \
  -e NEXT_PUBLIC_API_URL=http://3.79.182.74:3020 \
  -e NEXT_PUBLIC_ORDERS_API_URL=http://[IP_CORE_ORDERS]:3030 \
  --name=web-logistician
```

#### 5. Web Transporter

```bash
cd apps/web-transporter
vercel --token=79eVweIfP4CXv9dGDuDRS5hz --prod --yes \
  -e NEXT_PUBLIC_API_URL=http://3.79.182.74:3020 \
  -e NEXT_PUBLIC_ORDERS_API_URL=http://[IP_CORE_ORDERS]:3030 \
  --name=web-transporter
```

#### 6. Web Recipient

```bash
cd apps/web-recipient
vercel --token=79eVweIfP4CXv9dGDuDRS5hz --prod --yes \
  -e NEXT_PUBLIC_API_URL=http://3.79.182.74:3020 \
  -e NEXT_PUBLIC_ORDERS_API_URL=http://[IP_CORE_ORDERS]:3030 \
  --name=web-recipient
```

#### 7. Web Supplier

```bash
cd apps/web-supplier
vercel --token=79eVweIfP4CXv9dGDuDRS5hz --prod --yes \
  -e NEXT_PUBLIC_API_URL=http://3.79.182.74:3020 \
  -e NEXT_PUBLIC_ORDERS_API_URL=http://[IP_CORE_ORDERS]:3030 \
  --name=web-supplier
```

#### 8. Web Forwarder

```bash
cd apps/web-forwarder
vercel --token=79eVweIfP4CXv9dGDuDRS5hz --prod --yes \
  -e NEXT_PUBLIC_API_URL=http://3.79.182.74:3020 \
  -e NEXT_PUBLIC_ORDERS_API_URL=http://[IP_CORE_ORDERS]:3030 \
  -e NEXT_PUBLIC_AFFRET_API_URL=http://[IP_AFFRET_IA]:3010 \
  --name=web-forwarder
```

---

## 🧪 Étape 5: Tester les Déploiements

### Vérifier que les frontends sont accessibles

```bash
# Marketing Site
curl -I https://marketing-site-rt-technologie.vercel.app
# Devrait retourner 200 OK

# Web Industry
curl -I https://web-industry-rt-technologie.vercel.app

# Backoffice Admin
curl -I https://backoffice-admin-rt-technologie.vercel.app

# Et ainsi de suite...
```

### Tester la connexion aux APIs

1. Ouvrez chaque frontend dans le navigateur
2. Vérifiez que les appels API fonctionnent
3. Testez les fonctionnalités principales

---

## 📊 Résumé Final

Une fois tous les déploiements terminés, vous aurez:

### ✅ 20 Services Backend (AWS ECS)

| Service | Port | URL |
|---------|------|-----|
| client-onboarding | 3020 | http://3.79.182.74:3020 |
| core-orders | 3030 | http://[IP]:3030 |
| affret-ia | 3010 | http://[IP]:3010 |
| vigilance | 3040 | http://[IP]:3040 |
| authz | 3007 | http://[IP]:3007 |
| notifications | 3050 | http://[IP]:3050 |
| ... | ... | ... |

### ✅ 8 Frontends (Vercel)

| Application | URL |
|-------------|-----|
| marketing-site | https://marketing-site-rt-technologie.vercel.app |
| web-industry | https://web-industry-rt-technologie.vercel.app |
| backoffice-admin | https://backoffice-admin-rt-technologie.vercel.app |
| web-logistician | https://web-logistician-rt-technologie.vercel.app |
| web-transporter | https://web-transporter-rt-technologie.vercel.app |
| web-recipient | https://web-recipient-rt-technologie.vercel.app |
| web-supplier | https://web-supplier-rt-technologie.vercel.app |
| web-forwarder | https://web-forwarder-rt-technologie.vercel.app |

---

## 💰 Coût Mensuel Estimé

- **AWS ECS (20 services):** 300-400€/mois
- **Vercel (8 frontends):** 20€/mois
- **TOTAL:** ~320-420€/mois

---

## 🆘 Dépannage

### Erreur: "Can't deploy more than one path"

Solution: Assurez-vous d'être dans le bon dossier:
```bash
cd apps/FRONTEND_NAME
vercel --prod ...
```

### Erreur: "Environment Variable references Secret"

Solution: Créer le secret manquant dans Vercel dashboard:
https://vercel.com/rt-technologie/settings/secrets

### Frontend ne se connecte pas au backend

1. Vérifiez que les IPs backend sont correctes
2. Vérifiez que les services backend sont bien démarrés (health checks)
3. Vérifiez les CORS sur les services backend

---

## ✅ Checklist Finale

- [ ] IPs backend récupérées depuis AWS CloudShell
- [ ] Protection SSO désactivée sur marketing-site
- [ ] IPs configurées dans deploy-all-frontends.sh
- [ ] Script deploy-all-frontends.sh exécuté
- [ ] 8 frontends déployés avec succès
- [ ] URLs de production documentées
- [ ] Tests fonctionnels effectués
- [ ] Système complet opérationnel

---

**🎉 Une fois cette checklist complétée, votre système RT-Technologie sera entièrement déployé en production !**
