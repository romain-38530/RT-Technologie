# 🏗️ Infrastructure Complète RT-Technologie

**Date de déploiement :** 2025-11-20
**Status :** Production

---

## 📊 Vue d'Ensemble

| Composant | Nombre | Status | Plateforme |
|-----------|--------|--------|------------|
| **Services Backend** | 11 | ✅ Déployés | AWS ECS Fargate |
| **Applications Frontend** | 8 | 🔄 5 déployées, 3 en cours | Vercel |
| **Base de Données** | 1 | ✅ Opérationnelle | MongoDB |

---

## 🔧 Services Backend (AWS ECS - eu-central-1)

**Cluster :** `rt-production`
**Configuration :** Fargate 256 CPU / 512 MB RAM par service
**Région :** eu-central-1 (Francfort)

| Service | URL | Port | Rôle |
|---------|-----|------|------|
| **admin-gateway** | http://3.76.34.154:3000 | 3000 | Gateway API admin |
| **authz** | http://18.156.174.103:3000 | 3000 | Authentification & autorisation |
| **tms-sync** | http://3.68.186.150:3000 | 3000 | Synchronisation TMS |
| **erp-sync** | http://3.70.46.170:3000 | 3000 | Synchronisation ERP |
| **palette** | http://63.178.219.102:3000 | 3000 | Gestion des palettes |
| **tracking-ia** | http://3.121.234.119:3000 | 3000 | Tracking IA |
| **planning** | http://3.64.192.189:3000 | 3000 | Planification |
| **notifications** | http://3.122.54.174:3000 | 3000 | Service de notifications |
| **training** | http://18.194.53.124:3000 | 3000 | Formation |
| **geo-tracking** | http://18.199.90.38:3000 | 3000 | Géolocalisation |
| **storage-market** | http://35.158.200.161:3000 | 3000 | Marketplace stockage |

### Commandes AWS ECS

```bash
# Lister les services
aws ecs list-services --cluster rt-production --region eu-central-1

# Voir les tâches en cours
aws ecs list-tasks --cluster rt-production --region eu-central-1

# Logs d'un service
aws logs tail /ecs/rt-admin-gateway --follow --region eu-central-1

# Arrêter un service
aws ecs update-service --cluster rt-production --service rt-SERVICE_NAME \
  --desired-count 0 --region eu-central-1

# Redémarrer un service
aws ecs update-service --cluster rt-production --service rt-SERVICE_NAME \
  --desired-count 1 --force-new-deployment --region eu-central-1
```

---

## 🎨 Applications Frontend (Vercel)

**Team :** RT-Technologie
**Région :** Automatique (Edge Network)

### ✅ Déployées (5/8)

| Application | URL Production | Utilisateurs |
|-------------|----------------|--------------|
| **web-industry** | https://web-industry-rt-technologie.vercel.app | Industriels |
| **web-transporter** | https://web-transporter-rt-technologie.vercel.app | Transporteurs |
| **web-logistician** | https://web-logistician-rt-technologie.vercel.app | Logisticiens |
| **backoffice-admin** | https://backoffice-admin-rt-technologie.vercel.app | Administrateurs |
| **marketing-site** | https://marketing-site-rt-technologie.vercel.app | Public |

### 🔄 En cours de déploiement (3/8)

| Application | Status | Problème |
|-------------|--------|----------|
| **web-recipient** | 🔄 Build en cours | - |
| **web-supplier** | 🔄 Build en cours | - |
| **web-forwarder** | ❌ Erreur build | Problème TypeScript avec chatbot-widget |

### Commandes Vercel

```bash
# Lister les projets
vercel list --token=X4FPPDxnCO1mJb73fa6h8Ecc

# Déployer manuellement
cd apps/APP_NAME
vercel --prod --token=X4FPPDxnCO1mJb73fa6h8Ecc --yes

# Voir les logs
vercel logs APP_NAME --token=X4FPPDxnCO1mJb73fa6h8Ecc

# Rollback
vercel rollback APP_NAME --token=X4FPPDxnCO1mJb73fa6h8Ecc
```

---

## 🗄️ Base de Données

### MongoDB

**Status :** ✅ Opérationnelle
**Hébergement :** MongoDB Atlas (présumé)
**Région :** À confirmer

**Variables d'environnement requises :**
```env
MONGODB_URI=mongodb+srv://...
DATABASE_NAME=rt-technologie
```

### Services utilisant MongoDB

- admin-gateway
- authz
- tms-sync
- erp-sync
- palette
- planning
- notifications
- training
- geo-tracking
- storage-market

---

## 🔗 Configuration des Variables d'Environnement

### Backend → MongoDB

Chaque service backend doit avoir :
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/
DATABASE_NAME=rt-technologie
NODE_ENV=production
PORT=3000
```

### Frontend → Backend

Chaque application frontend Vercel doit avoir :

```env
# Authentification
NEXT_PUBLIC_AUTHZ_URL=http://18.156.174.103:3000
NEXT_PUBLIC_ADMIN_GATEWAY_URL=http://3.76.34.154:3000

# Services métier
NEXT_PUBLIC_TMS_SYNC_URL=http://3.68.186.150:3000
NEXT_PUBLIC_ERP_SYNC_URL=http://3.70.46.170:3000
NEXT_PUBLIC_PALETTE_URL=http://63.178.219.102:3000
NEXT_PUBLIC_TRACKING_IA_URL=http://3.121.234.119:3000
NEXT_PUBLIC_PLANNING_URL=http://3.64.192.189:3000
NEXT_PUBLIC_NOTIFICATIONS_URL=http://3.122.54.174:3000
NEXT_PUBLIC_TRAINING_URL=http://18.194.53.124:3000
NEXT_PUBLIC_GEO_TRACKING_URL=http://18.199.90.38:3000
NEXT_PUBLIC_STORAGE_MARKET_URL=http://35.158.200.161:3000
```

**Configuration via Vercel CLI :**
```bash
vercel env add NEXT_PUBLIC_AUTHZ_URL production
# Entrer: http://18.156.174.103:3000
```

**Ou via dashboard :** https://vercel.com/dashboard → Projet → Settings → Environment Variables

---

## 🔒 Sécurité & CORS

### ⚠️ Actions Requises

1. **Configurer CORS sur AWS ECS**
   - Autoriser les domaines Vercel (*.vercel.app)
   - Autoriser les domaines custom si configurés

2. **HTTPS pour Production**
   - Backend : Ajouter un Load Balancer avec certificat SSL
   - Frontend : ✅ Géré automatiquement par Vercel

3. **Secrets Management**
   - Backend : Utiliser AWS Secrets Manager
   - Frontend : Utiliser Vercel Environment Variables

---

## 📊 Monitoring & Logs

### AWS CloudWatch

Logs disponibles pour chaque service :
```
/ecs/rt-admin-gateway
/ecs/rt-authz
/ecs/rt-tms-sync
... (11 services)
```

**Commande pour voir les logs :**
```bash
aws logs tail /ecs/rt-SERVICE_NAME --follow --region eu-central-1
```

### Vercel Analytics

Dashboard : https://vercel.com/dashboard → Projet → Analytics

### MongoDB Monitoring

Dashboard : https://cloud.mongodb.com/

---

## 🚀 Déploiements Automatiques

### GitHub Actions

**Workflows configurés :**

1. **deploy-vercel.yml** - Déploiement frontend automatique
   - Trigger : Push sur `main` ou `dockerfile` avec changements dans `apps/` ou `packages/`
   - Déploie les apps modifiées sur Vercel

2. **auto-diagnostic.yml** - Diagnostic automatique des déploiements
   - Trigger : Après chaque déploiement
   - Crée un rapport JSON/MD avec diagnostics

3. **deploy-auto.yml** - Déploiement backend AWS (⚠️ En cours de correction)
   - Trigger : Push sur `main` ou `dockerfile`
   - Build et push images Docker vers ECR
   - Déploie sur ECS

**Consulter les workflows :** https://github.com/romain-38530/RT-Technologie/actions

---

## 🔧 Prochaines Étapes

### Priorité 1 - Compléter les Déploiements

- [ ] Résoudre erreur build web-forwarder (chatbot-widget)
- [ ] Terminer déploiement web-recipient
- [ ] Terminer déploiement web-supplier
- [ ] Configurer variables d'environnement Vercel pour les 8 apps

### Priorité 2 - Sécurité & Performance

- [ ] Configurer CORS sur tous les services AWS
- [ ] Ajouter Load Balancer AWS avec SSL/TLS
- [ ] Configurer domaines custom (optionnel)
- [ ] Tester authentification bout-en-bout

### Priorité 3 - Monitoring & Alertes

- [ ] Configurer alertes CloudWatch
- [ ] Configurer alertes Vercel
- [ ] Configurer monitoring MongoDB
- [ ] Mettre en place dashboards de monitoring

### Priorité 4 - Documentation

- [ ] Documenter l'architecture technique
- [ ] Créer guides utilisateurs
- [ ] Documenter procédures de rollback
- [ ] Créer runbooks pour incidents courants

---

## 📞 Contacts & Support

**GitHub Repository :** https://github.com/romain-38530/RT-Technologie
**AWS Console :** https://eu-central-1.console.aws.amazon.com/ecs/v2/clusters/rt-production
**Vercel Dashboard :** https://vercel.com/dashboard
**MongoDB Atlas :** https://cloud.mongodb.com/

---

**Dernière mise à jour :** 2025-11-20 09:10 UTC
