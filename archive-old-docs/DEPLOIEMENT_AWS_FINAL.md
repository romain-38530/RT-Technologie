# 🚀 Déploiement Final AWS - RT-Technologie

**Date:** 2025-11-19
**Statut:** Tous les Dockerfiles prêts ✅

---

## 📊 Récapitulatif des Services

### ✅ Services Backend (20 services)

Tous les Dockerfiles sont créés et pushés sur GitHub (branche `dockerfile`).

| Service | Port | Dockerfile | Package.json | Statut |
|---------|------|-----------|--------------|---------|
| client-onboarding | 3020 | ✅ | ✅ | Déployé |
| affret-ia | 3010 | ✅ | ✅ | À déployer |
| authz | 3007 | ✅ | ✅ | À déployer |
| admin-gateway | 3008 | ✅ | ✅ | À déployer |
| core-orders | 3030 | ✅ | ✅ | À déployer |
| vigilance | 3040 | ✅ | ✅ | À déployer |
| notifications | 3050 | ✅ | ✅ | À déployer |
| pricing-grids | 3060 | ✅ | ✅ | À déployer |
| planning | 3070 | ✅ | ✅ | À déployer |
| bourse | 3080 | ✅ | ✅ | À déployer |
| palette | 3090 | ✅ | ✅ | À déployer |
| wms-sync | 3100 | ✅ | ✅ | À déployer |
| erp-sync | 3110 | ✅ | ✅ | À déployer |
| tms-sync | 3120 | ✅ | ✅ | À déployer |
| tracking-ia | 3130 | ✅ | ✅ | À déployer |
| chatbot | 3140 | ✅ | ✅ | À déployer |
| geo-tracking | 3150 | ✅ | ✅ | À déployer |
| ecpmr | 3160 | ✅ | ✅ | À déployer |
| storage-market | 3170 | ✅ | ✅ | À déployer |
| training | 3180 | ✅ | ✅ | À déployer |

---

## 🔧 Script de Déploiement AWS CloudShell

### Étape 1: Lancer dans CloudShell

```bash
# Télécharger le script complet
curl -o ~/deploy-all-services.sh https://raw.githubusercontent.com/romain-38530/RT-Technologie/dockerfile/infra/deploy-all-remaining-services.sh

# Rendre exécutable
chmod +x ~/deploy-all-services.sh

# Lancer le déploiement
~/deploy-all-services.sh
```

**Durée estimée:** 60-90 minutes

---

## 📋 Ce que fait le script automatiquement

1. ✅ Clone le repository GitHub (branche dockerfile)
2. ✅ Crée les 20 repositories ECR si nécessaire
3. ✅ Login sur ECR
4. ✅ Build les 20 images Docker (en parallèle)
5. ✅ Push vers ECR
6. ✅ Crée les Task Definitions ECS
7. ✅ Crée ou met à jour les Services ECS
8. ✅ Affiche toutes les IPs publiques

---

## 🌐 Récupérer les IPs après déploiement

```bash
# Dans CloudShell
~/get-all-ips.sh
```

**Exemple de sortie:**

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

## 🧪 Tests Post-Déploiement

### 1. Health Checks

```bash
# Remplacer X.X.X.X par les vraies IPs
curl http://3.79.182.74:3020/health
curl http://X.X.X.X:3030/health
curl http://X.X.X.X:3010/health
curl http://X.X.X.X:3040/health
curl http://X.X.X.X:3007/health
# ... tous les services
```

### 2. Test VAT (client-onboarding)

```bash
curl -X POST http://3.79.182.74:3020/api/onboarding/verify-vat \
  -H "Content-Type: application/json" \
  -d '{"vatNumber":"FR21350675567"}'
```

**Réponse attendue:**

```json
{
  "success": true,
  "isValid": true,
  "data": {
    "siren": "350675567",
    "denomination": "RT LOGISTIQUE",
    "vatNumber": "FR21350675567"
  }
}
```

---

## 💻 Déploiement des Frontends sur Vercel

### Prérequis

```bash
# Sur votre machine locale (pas CloudShell)
npm install -g vercel
export VERCEL_TOKEN=79eVweIfP4CXv9dGDuDRS5hz
```

### Déployer web-industry

```bash
cd apps/web-industry

vercel --token=$VERCEL_TOKEN --prod \
  -e NEXT_PUBLIC_API_URL=http://3.79.182.74:3020 \
  -e NEXT_PUBLIC_ORDERS_API_URL=http://X.X.X.X:3030 \
  -e NEXT_PUBLIC_AFFRET_API_URL=http://X.X.X.X:3010 \
  -e NEXT_PUBLIC_VIGILANCE_API_URL=http://X.X.X.X:3040 \
  -e NEXT_PUBLIC_AUTHZ_URL=http://X.X.X.X:3007 \
  --name=web-industry
```

### Déployer backoffice-admin

```bash
cd ../backoffice-admin

vercel --token=$VERCEL_TOKEN --prod \
  -e NEXT_PUBLIC_API_URL=http://3.79.182.74:3020 \
  -e NEXT_PUBLIC_ORDERS_API_URL=http://X.X.X.X:3030 \
  -e NEXT_PUBLIC_AFFRET_API_URL=http://X.X.X.X:3010 \
  -e NEXT_PUBLIC_VIGILANCE_API_URL=http://X.X.X.X:3040 \
  -e NEXT_PUBLIC_AUTHZ_URL=http://X.X.X.X:3007 \
  --name=backoffice-admin
```

### Déployer web-logistician

```bash
cd ../web-logistician

vercel --token=$VERCEL_TOKEN --prod \
  -e NEXT_PUBLIC_API_URL=http://3.79.182.74:3020 \
  -e NEXT_PUBLIC_ORDERS_API_URL=http://X.X.X.X:3030 \
  --name=web-logistician
```

### Déployer web-transporter

```bash
cd ../web-transporter

vercel --token=$VERCEL_TOKEN --prod \
  -e NEXT_PUBLIC_API_URL=http://3.79.182.74:3020 \
  -e NEXT_PUBLIC_ORDERS_API_URL=http://X.X.X.X:3030 \
  --name=web-transporter
```

---

## 🔐 Secrets AWS (déjà configurés)

Les secrets suivants sont déjà configurés dans AWS Secrets Manager:

- `rt/mongodb/uri` - MongoDB Atlas URI
- `rt/jwt/secret` - JWT secret key
- `rt/smtp/user` - SMTP username
- `rt/smtp/password` - SMTP password
- `rt/openai/key` - OpenAI API key

---

## 🏗️ Infrastructure AWS

### ECS Cluster

- **Nom:** rt-technologie-cluster
- **Type:** Fargate
- **Région:** eu-central-1

### Configuration par service

- **CPU:** 256 (0.25 vCPU)
- **Memory:** 512 MB
- **Desired Count:** 1
- **Network Mode:** awsvpc
- **Assign Public IP:** Enabled

### VPC & Réseau

- **VPC ID:** vpc-0d84de1ac867982db
- **Security Group:** sg-0add3ac473775825a
- **Subnets:**
  - subnet-0cce60a3fe31c0d9e
  - subnet-0a6a2f8fd776906ee

---

## 💰 Estimation des Coûts Mensuels

### AWS ECS Fargate (20 services)

| Ressource | Configuration | Coût unitaire | Coût total |
|-----------|--------------|---------------|------------|
| CPU | 0.25 vCPU × 20 | ~10€/service/mois | ~200€ |
| Memory | 512 MB × 20 | ~5€/service/mois | ~100€ |
| **Total AWS** | - | - | **~300-400€/mois** |

### Vercel (8 frontends)

- Plan Pro: 20$/mois (~20€)
- Bande passante: 1TB inclus

### **TOTAL MENSUEL: ~320-420€**

---

## 🆘 Dépannage

### Service ne démarre pas

```bash
# Voir les logs d'un service
aws logs tail /ecs/rt-SERVICE-NAME --follow --region eu-central-1
```

### Rebuild un service spécifique

```bash
# Dans CloudShell
cd ~/RT-Technologie

# Rebuild l'image
docker build -t rt-SERVICE-NAME -f services/SERVICE-NAME/Dockerfile .

# Tag et push
docker tag rt-SERVICE-NAME 004843574253.dkr.ecr.eu-central-1.amazonaws.com/rt-SERVICE-NAME:latest
docker push 004843574253.dkr.ecr.eu-central-1.amazonaws.com/rt-SERVICE-NAME:latest

# Forcer redéploiement
aws ecs update-service \
  --cluster rt-technologie-cluster \
  --service rt-SERVICE-NAME-service \
  --force-new-deployment \
  --region eu-central-1
```

### Vérifier l'état d'un service

```bash
aws ecs describe-services \
  --cluster rt-technologie-cluster \
  --services rt-SERVICE-NAME-service \
  --region eu-central-1 \
  --query 'services[0].{status:status,running:runningCount,desired:desiredCount}'
```

---

## ✅ Checklist de Déploiement

- [x] Tous les Dockerfiles créés (20/20)
- [x] Dockerfiles pushés sur GitHub
- [ ] Script de déploiement lancé dans CloudShell
- [ ] Attendre fin du build (60-90 min)
- [ ] Récupérer toutes les IPs
- [ ] Tester health checks
- [ ] Déployer frontends sur Vercel
- [ ] Tester l'application complète
- [ ] Documenter les URLs finales

---

## 📝 Informations Importantes

### URLs existantes

- **Marketing Site:** https://marketing-site-h613b2d6c-rt-technologie.vercel.app
- **Client Onboarding API:** http://3.79.182.74:3020

### Credentials GitHub

- **Repository:** https://github.com/romain-38530/RT-Technologie
- **Branche:** dockerfile

### Credentials AWS

- **Account ID:** 004843574253
- **Region:** eu-central-1
- **Role:** ecsTaskExecutionRoleRT

---

**Prochaines étapes:**

1. Lancer le script `~/deploy-all-services.sh` dans AWS CloudShell
2. Attendre la fin du déploiement
3. Récupérer les IPs avec `~/get-all-ips.sh`
4. Déployer les frontends sur Vercel avec les bonnes IPs

🎯 **Objectif:** Système complet en production (20 backends + 8 frontends)
