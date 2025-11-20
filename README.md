# RT Technologie Monorepo

Ce dépôt contient la plateforme modulable multi-agents (Industry, Carrier, Logi, Supplier, Recipient, Forwarder, Shared).

## 📊 Status de Déploiement

**Dernière mise à jour :** 2025-11-20 | [Voir le status complet](STATUS_DEPLOIEMENT_2025-11-20.md)

| Composant | Déployé | Total | Status |
|-----------|---------|-------|--------|
| Services Backend (AWS ECS) | 11 | 21 | 🟡 52% |
| Applications Frontend (Vercel) | 5 | 8 | 🟡 62% |
| Base de Données (MongoDB) | 1 | 1 | ✅ 100% |

**Progress global :** 60% | [Guide de complétion](SERVICES_MANQUANTS.md)

---

## 🏗️ Structure

- **docs/** - Spécifications et schémas
- **packages/** - Contrats, authz, i18n, utils partagés
- **services/** - 21 microservices backend (APIs par domaine)
- **apps/** - 8 applications frontend (web + PWA)
- **infra/** - Seeds, IaC, pipelines CI/CD

---

## 🚀 Applications Frontend Déployées

| Application | URL | Utilisateurs |
|-------------|-----|--------------|
| web-industry | https://web-industry-rt-technologie.vercel.app | Industriels |
| web-transporter | https://web-transporter-rt-technologie.vercel.app | Transporteurs |
| web-logistician | https://web-logistician-rt-technologie.vercel.app | Logisticiens |
| backoffice-admin | https://backoffice-admin-rt-technologie.vercel.app | Administrateurs |
| marketing-site | https://marketing-site-rt-technologie.vercel.app | Public |

---

## 🛠️ Stack Technique

- **Backend:** Node 20 + TypeScript + Express
- **Frontend:** Next.js 14 + React 18 + TailwindCSS
- **Monorepo:** pnpm workspaces + Turborepo
- **Infrastructure:** AWS ECS Fargate + Vercel Edge
- **Database:** MongoDB Atlas
- **Messaging:** NATS (Pub/Sub)
- **Cache:** Redis
- **APIs:** OpenAPI + JSON Schema

---

## 📚 Documentation

- [STATUS_DEPLOIEMENT_2025-11-20.md](STATUS_DEPLOIEMENT_2025-11-20.md) - Status complet et détaillé
- [INFRASTRUCTURE_COMPLETE.md](INFRASTRUCTURE_COMPLETE.md) - Vue d'ensemble de l'infrastructure
- [SERVICES_MANQUANTS.md](SERVICES_MANQUANTS.md) - Services AWS à déployer
- [ERREURS_DEPLOIEMENT_VERCEL.md](ERREURS_DEPLOIEMENT_VERCEL.md) - Corrections Vercel nécessaires
- [RECAPITULATIF_DEPLOIEMENT.md](RECAPITULATIF_DEPLOIEMENT.md) - Récapitulatif général

---

## 🔗 Liens Utiles

- **GitHub Actions:** https://github.com/romain-38530/RT-Technologie/actions
- **AWS ECS Console:** https://eu-central-1.console.aws.amazon.com/ecs/v2/clusters/rt-production
- **Vercel Dashboard:** https://vercel.com/dashboard
- **MongoDB Atlas:** https://cloud.mongodb.com/
