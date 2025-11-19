# 🚀 Instructions de Déploiement Immédiat
## RT-Technologie - Système Complet

---

## ✅ État Actuel

### Services Déployés

| Service | Status | URL/IP | Port |
|---------|--------|---------|------|
| **client-onboarding** | ✅ Opérationnel | http://3.79.182.74 | 3020 |
| **marketing-site** | ✅ Opérationnel | https://marketing-site-h613b2d6c-rt-technologie.vercel.app | - |

### Fonctionnalités Testées
- ✅ Vérification TVA française (FR21350675567)
- ✅ Auto-remplissage des données entreprise
- ✅ Connexion MongoDB Atlas
- ✅ API entreprise.gouv.fr avec fallbacks

---

## 📦 Fichiers Prêts pour Déploiement

Tous les fichiers ont été créés et poussés sur GitHub (branche `dockerfile`):

### Dockerfiles Backend
- ✅ [services/client-onboarding/Dockerfile](services/client-onboarding/Dockerfile)
- ✅ [services/core-orders/Dockerfile](services/core-orders/Dockerfile)
- ✅ [services/affret-ia/Dockerfile](services/affret-ia/Dockerfile)
- ✅ [services/vigilance/Dockerfile](services/vigilance/Dockerfile)

### Scripts de Déploiement
- ✅ [infra/deploy-all-services-aws.sh](infra/deploy-all-services-aws.sh) - Déploiement complet AWS
- ✅ [infra/get-service-ips.sh](infra/get-service-ips.sh) - Récupération des IPs
- ✅ [infra/deploy-frontends-vercel.sh](infra/deploy-frontends-vercel.sh) - Déploiement Vercel

### Configuration Frontend
- ✅ [apps/web-industry/next.config.js](apps/web-industry/next.config.js) - Configuré
- ✅ [apps/backoffice-admin/next.config.js](apps/backoffice-admin/next.config.js) - Configuré
- ✅ [apps/marketing-site/next.config.js](apps/marketing-site/next.config.js) - Configuré

---

## 🎯 Déploiement des Services Restants

### Étape 1 : Déployer les Services Backend sur AWS

Ouvrez **AWS CloudShell** (région eu-central-1) :

```bash
# 1. Cloner le repository
git clone https://github.com/romain-38530/RT-Technologie.git
cd RT-Technologie
git checkout dockerfile

# 2. Rendre les scripts exécutables
chmod +x infra/*.sh

# 3. Lancer le déploiement complet
./infra/deploy-all-services-aws.sh
```

Le script va déployer automatiquement :
- ✅ core-orders (port 3030)
- ✅ affret-ia (port 3010)
- ✅ vigilance (port 3040)
- ✅ client-onboarding (mise à jour si nécessaire)

**Durée estimée** : 15-20 minutes

### Étape 2 : Récupérer les IPs Backend

```bash
# Récupérer les IPs publiques de tous les services
./infra/get-service-ips.sh
```

Notez les IPs obtenues :
```
✓ client-onboarding: http://X.X.X.X:3020
✓ core-orders: http://X.X.X.X:3030
✓ affret-ia: http://X.X.X.X:3010
✓ vigilance: http://X.X.X.X:3040
```

### Étape 3 : Déployer les Frontends sur Vercel

**Option A : Script automatique (Recommandé)**

Dans CloudShell ou sur votre machine locale :

```bash
# Le script récupère automatiquement les IPs et déploie
./infra/deploy-frontends-vercel.sh
```

**Option B : Déploiement manuel**

```bash
# Installer Vercel CLI
npm install -g vercel

# Configurer le token
export VERCEL_TOKEN=79eVweIfP4CXv9dGDuDRS5hz

# Déployer web-industry
cd apps/web-industry
vercel --token=$VERCEL_TOKEN --prod \
  -e NEXT_PUBLIC_API_URL=http://3.79.182.74:3020 \
  -e NEXT_PUBLIC_ORDERS_API_URL=http://X.X.X.X:3030 \
  -e NEXT_PUBLIC_AFFRET_API_URL=http://X.X.X.X:3010 \
  -e NEXT_PUBLIC_VIGILANCE_API_URL=http://X.X.X.X:3040 \
  --name=web-industry

# Déployer backoffice-admin
cd ../backoffice-admin
vercel --token=$VERCEL_TOKEN --prod \
  -e NEXT_PUBLIC_API_URL=http://3.79.182.74:3020 \
  -e NEXT_PUBLIC_ORDERS_API_URL=http://X.X.X.X:3030 \
  -e NEXT_PUBLIC_AFFRET_API_URL=http://X.X.X.X:3010 \
  -e NEXT_PUBLIC_VIGILANCE_API_URL=http://X.X.X.X:3040 \
  --name=backoffice-admin
```

Remplacez `X.X.X.X` par les IPs réelles obtenues à l'étape 2.

---

## 🧪 Tests Après Déploiement

### 1. Tester les Services Backend

```bash
# Health checks
curl http://3.79.182.74:3020/health  # client-onboarding
curl http://X.X.X.X:3030/health       # core-orders
curl http://X.X.X.X:3010/health       # affret-ia
curl http://X.X.X.X:3040/health       # vigilance
```

### 2. Tester la Vérification TVA

```bash
curl -X POST http://3.79.182.74:3020/api/onboarding/verify-vat \
  -H "Content-Type: application/json" \
  -d '{"vatNumber":"FR21350675567"}'
```

Réponse attendue :
```json
{
  "success": true,
  "data": {
    "valid": true,
    "companyName": "SOC ENTREPRISE TRANSPORT TARDY (SETT)",
    "siren": "350675567",
    "siret": "35067556700050"
  }
}
```

### 3. Tester les Frontends

Accédez aux URLs Vercel dans votre navigateur :
- https://marketing-site-h613b2d6c-rt-technologie.vercel.app
- https://web-industry-[hash].vercel.app (URL fournie par Vercel)
- https://backoffice-admin-[hash].vercel.app (URL fournie par Vercel)

---

## 📊 Architecture Déployée

```
┌─────────────────────────────────────────────────────────────┐
│                     UTILISATEURS                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL (Frontends)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Marketing    │  │ Web Industry │  │ Backoffice   │      │
│  │ Site         │  │              │  │ Admin        │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              AWS ECS FARGATE (Backend Services)             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Client       │  │ Core Orders  │  │ Affret IA    │      │
│  │ Onboarding   │  │              │  │              │      │
│  │ :3020        │  │ :3030        │  │ :3010        │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐                                           │
│  │ Vigilance    │                                           │
│  │              │                                           │
│  │ :3040        │                                           │
│  └──────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  MONGODB ATLAS                               │
│  mongodb+srv://Admin:***@stagingrt.v2jnoh2.mongodb.net/     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              APIS EXTERNES                                   │
│  • recherche-entreprises.api.gouv.fr (TVA FR)               │
│  • annuaire-entreprises.data.gouv.fr (Fallback)             │
│  • OpenAI API (IA)                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 Monitoring et Logs

### CloudWatch Logs

```bash
# Voir les logs d'un service
aws logs tail /ecs/rt-core-orders --follow --region eu-central-1
aws logs tail /ecs/rt-affret-ia --follow --region eu-central-1
aws logs tail /ecs/rt-vigilance --follow --region eu-central-1
```

### Status des Services

```bash
# Lister tous les services
aws ecs list-services \
  --cluster rt-technologie-cluster \
  --region eu-central-1

# Détails d'un service spécifique
aws ecs describe-services \
  --cluster rt-technologie-cluster \
  --services rt-core-orders-service \
  --region eu-central-1
```

---

## 🆘 Dépannage Rapide

### Service ne démarre pas

```bash
# 1. Vérifier les logs CloudWatch
aws logs tail /ecs/rt-[service-name] --region eu-central-1

# 2. Vérifier les tâches
aws ecs list-tasks \
  --cluster rt-technologie-cluster \
  --service-name rt-[service-name]-service \
  --region eu-central-1

# 3. Forcer le redéploiement
aws ecs update-service \
  --cluster rt-technologie-cluster \
  --service rt-[service-name]-service \
  --force-new-deployment \
  --region eu-central-1
```

### Frontend ne se connecte pas au backend

1. Vérifier que l'IP backend est correcte dans Vercel
2. Tester le endpoint backend directement : `curl http://IP:PORT/health`
3. Vérifier que le Security Group AWS autorise le port

---

## 📋 Checklist de Déploiement Complet

### Backend AWS
- [ ] client-onboarding déployé
- [ ] core-orders déployé
- [ ] affret-ia déployé
- [ ] vigilance déployé
- [ ] Tous les health checks répondent OK
- [ ] Logs CloudWatch accessibles

### Frontend Vercel
- [ ] marketing-site déployé
- [ ] web-industry déployé
- [ ] backoffice-admin déployé
- [ ] Variables d'environnement configurées
- [ ] Toutes les applications accessibles

### Tests Fonctionnels
- [ ] Vérification TVA fonctionne
- [ ] Auto-remplissage formulaire fonctionne
- [ ] Authentification fonctionne
- [ ] Gestion des commandes fonctionne
- [ ] IA affretement fonctionne

---

## 📞 URLs de Production

### Frontends (Vercel)
- **Marketing** : https://marketing-site-h613b2d6c-rt-technologie.vercel.app
- **Web Industry** : _À obtenir après déploiement_
- **Backoffice** : _À obtenir après déploiement_

### Backends (AWS ECS)
- **Client Onboarding** : http://3.79.182.74:3020
- **Core Orders** : _À obtenir après déploiement_
- **Affret IA** : _À obtenir après déploiement_
- **Vigilance** : _À obtenir après déploiement_

### Base de Données
- **MongoDB Atlas** : mongodb+srv://stagingrt.v2jnoh2.mongodb.net/rt_technologie

---

## 🎯 Prochaines Étapes Recommandées

1. **Load Balancer AWS** : Remplacer les IPs publiques par un ALB
2. **HTTPS Backend** : Configurer des certificats SSL
3. **Domaine personnalisé** : Configurer rt-technologie.com
4. **CI/CD** : GitHub Actions pour déploiement automatique
5. **Monitoring avancé** : CloudWatch Dashboards et alertes
6. **Backup automatique** : Configuration des snapshots MongoDB

---

## 📚 Documentation Complète

Consultez [GUIDE_DEPLOIEMENT_COMPLET.md](GUIDE_DEPLOIEMENT_COMPLET.md) pour :
- Instructions détaillées étape par étape
- Options de déploiement manuel
- Configuration avancée
- Résolution de problèmes
- Meilleures pratiques

---

**Bon déploiement ! 🚀**

*Dernière mise à jour : 2025-11-19*
