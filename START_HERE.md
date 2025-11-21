# 🚀 RT-Technologie - COMMENCEZ ICI

Bienvenue dans la plateforme RT-Technologie ! Ce fichier vous guide vers la bonne documentation.

---

## 🎯 Que voulez-vous faire ?

### 📖 Découvrir le Projet
**→ [Lisez le README Principal](./README.md)**
- Vue d'ensemble de la plateforme
- Architecture et technologies
- Statut de déploiement
- Liens rapides

### 🏗️ Comprendre l'Architecture
**→ [Consultez les Diagrammes UML](./docs/architecture-diagram.md)**
- 4 diagrammes d'architecture
- Vue d'ensemble système
- Déploiement AWS/Vercel
- Architecture en couches

**→ [Explorez la Base de Données](./docs/database-schema.md)**
- 5 diagrammes ERD (PlantUML)
- 40+ collections MongoDB
- 103+ indexes documentés
- Relations et contraintes

**→ [Étudiez les Flux Métier](./docs/flow-diagrams.md)**
- 6 diagrammes de séquence
- 4 diagrammes d'activité
- Workflows complets
- Interactions services

### ⚡ Démarrer Rapidement
**→ [Guide Quick Start](./docs/getting-started/quickstart.md)**
- Installation des dépendances
- Configuration environnement
- Premier lancement local
- Tests de base

### 🚢 Déployer la Plateforme
**→ [Guide Complet Déploiement](./docs/deployment/README.md)**

#### Backend (AWS ECS Fargate)
- [Déploiement AWS ECS](./docs/deployment/aws/aws-deployment.md)
- [CloudShell Guide](./docs/deployment/aws/cloudshell-guide.md)
- [Configuration MongoDB Atlas](./docs/deployment/mongodb-atlas.md)

#### Frontend (Vercel Edge)
- [Déploiement Vercel](./docs/deploy/vercel-setup.md)
- [Configuration Secrets](./docs/deploy/secrets.md)

### 💻 Développer une Fonctionnalité

#### Services Backend
**→ [Documentation Services](./docs/services/README.md)**
- 20 microservices Node.js
- API endpoints
- Intégrations

#### Applications Frontend
**→ [Documentation Apps](./docs/apps/README.md)**
- 10 applications Next.js
- Interfaces utilisateurs
- Composants

#### Packages Partagés
**→ [Documentation Packages](./docs/packages/README.md)**
- 17 libraries communes
- Utilitaires
- Clients API

### 🐛 Résoudre un Problème
**→ [Troubleshooting](./docs/troubleshooting/common-issues.md)**
- Problèmes courants
- Erreurs AWS ECS
- Erreurs Vercel
- Fixes et solutions

### 📊 Consulter les Rapports
**→ [Rapports Projet](./docs/reports/README.md)**
- Statut déploiement actuel
- Rapport final projet
- Synthèse technique
- Démo end-to-end

### 🗂️ Naviguer dans la Documentation
**→ [Index Complet](./docs/INDEX.md)**
- Navigation par catégorie
- Navigation par technologie
- Navigation par rôle
- Recherche rapide

---

## 📚 Documentation Complète

### Structure Documentation

```
docs/
├── README.md                    📖 Index principal
├── INDEX.md                     🗂️ Navigation complète
├── SUMMARY.md                   📊 Résumé centralisation
│
├── architecture-diagram.md      🏗️ Diagrammes architecture
├── database-schema.md          🗄️ ERD MongoDB
├── flow-diagrams.md            📊 Flux métier
│
├── getting-started/            🚀 Guides démarrage
├── deployment/                 🚢 Guides déploiement
├── services/                   📦 Services backend
├── apps/                       🎨 Apps frontend
├── packages/                   🔧 Packages partagés
├── features/                   🎯 Fonctionnalités métier
├── business/                   💼 Documentation business
├── development/                🔬 Guide développeurs
├── reports/                    📈 Rapports et statuts
├── tutorials/                  🎓 Tutoriels pas à pas
├── tools/                      🛠️ Scripts et outils
└── troubleshooting/            🐛 Résolution problèmes
```

---

## 🎯 Parcours par Rôle

### Développeur Frontend
1. [Architecture Frontend](./docs/development/frontend-standards.md)
2. [Applications Next.js](./docs/apps/README.md)
3. [Composants UI](./docs/packages/README.md)
4. [Déploiement Vercel](./docs/deploy/vercel-setup.md)

### Développeur Backend
1. [Architecture Microservices](./docs/architecture-diagram.md)
2. [Services Node.js](./docs/services/README.md)
3. [Schéma Base de Données](./docs/database-schema.md)
4. [Déploiement AWS ECS](./docs/deployment/aws/aws-deployment.md)

### DevOps / Infrastructure
1. [Guide Déploiement Complet](./docs/deployment/README.md)
2. [Configuration AWS](./docs/deployment/aws/aws-deployment.md)
3. [Configuration Vercel](./docs/deploy/vercel-setup.md)
4. [Scripts Automatisation](./docs/tools/README.md)
5. [Troubleshooting](./docs/troubleshooting/common-issues.md)

### Product Manager
1. [Vue d'Ensemble Plateforme](./README.md)
2. [Fonctionnalités Métier](./docs/features/README.md)
3. [Flux Utilisateurs](./docs/flow-diagrams.md)
4. [Plans et Tarification](./docs/pricing.md)
5. [Rapports Projet](./docs/reports/README.md)

### Architecte Technique
1. [Diagrammes Architecture](./docs/architecture-diagram.md)
2. [Schéma Base de Données](./docs/database-schema.md)
3. [Flux et Séquences](./docs/flow-diagrams.md)
4. [Infrastructure](./docs/deployment/infrastructure/overview.md)

---

## 🏗️ Architecture en Bref

**RT-Technologie** est une plateforme B2B de logistique et transport :

### Composants Principaux
- **10 applications frontend** - Next.js 14 + React 18
- **20 microservices backend** - Node.js 20 + TypeScript
- **17 packages partagés** - Libraries communes
- **MongoDB Atlas** - 40+ collections, 103+ indexes

### Technologies
- **Frontend**: Next.js, React, TailwindCSS, Radix UI
- **Backend**: Node.js, TypeScript, Express (optionnel)
- **DB**: MongoDB Atlas, Redis
- **AI**: OpenRouter (GPT-4o-mini), TomTom Traffic
- **Infra**: AWS ECS Fargate, Vercel Edge
- **Messaging**: NATS Pub/Sub

### Déploiement Actuel
- ✅ **11/20** services backend (AWS ECS)
- ✅ **5/10** apps frontend (Vercel)
- ✅ **MongoDB Atlas** configuré

---

## 🆕 Nouveautés Documentation

### 📐 Diagrammes UML Complets (Nouveau !)
- [Architecture Système](./docs/architecture-diagram.md) - 4 diagrammes
- [Base de Données ERD](./docs/database-schema.md) - 5 diagrammes, 40+ collections
- [Flux Métier](./docs/flow-diagrams.md) - 11 diagrammes (séquence + activité)

### 🗂️ Documentation Centralisée (Nouveau !)
- Structure organisée en 14 dossiers thématiques
- Navigation par catégorie, technologie et rôle
- Index complet avec recherche rapide
- Scripts d'organisation automatisés

---

## 🔍 Recherche Rapide

### Par Technologie
- **Next.js** → [Apps](./docs/apps/) | [Standards](./docs/development/frontend-standards.md)
- **Node.js** → [Services](./docs/services/) | [Packages](./docs/packages/)
- **MongoDB** → [Schema](./docs/database-schema.md) | [Atlas Setup](./docs/deployment/mongodb-atlas.md)
- **AWS** → [ECS Deployment](./docs/deployment/aws/aws-deployment.md) | [Troubleshooting](./docs/troubleshooting/ecs-debugging.md)
- **Vercel** → [Deployment](./docs/deploy/vercel-setup.md) | [Errors](./docs/troubleshooting/vercel-errors.md)

### Par Tâche
- **Installer** → [Quick Start](./docs/getting-started/quickstart.md)
- **Déployer** → [Deployment Guide](./docs/deployment/README.md)
- **Développer** → [Dev Standards](./docs/development/code-standards.md)
- **Débugger** → [Troubleshooting](./docs/troubleshooting/common-issues.md)
- **Comprendre** → [Architecture](./docs/architecture-diagram.md)

---

## 📞 Besoin d'Aide ?

### Documentation
1. 📖 [README Principal](./README.md) - Vue d'ensemble
2. 🗂️ [Index Complet](./docs/INDEX.md) - Navigation détaillée
3. 📊 [Résumé](./docs/SUMMARY.md) - Récapitulatif centralisation

### Support Technique
1. 🐛 [Troubleshooting](./docs/troubleshooting/common-issues.md) - FAQ
2. 📈 [Rapports Statut](./docs/reports/deployment-status.md) - État système
3. 💬 GitHub Issues - Signaler un problème

---

## 🎉 Prêt à Commencer ?

### Option 1: Découverte Rapide (5 min)
```
1. README.md
2. docs/architecture-diagram.md
3. docs/database-schema.md
```

### Option 2: Installation Locale (30 min)
```
1. docs/getting-started/quickstart.md
2. Configuration environnement
3. Premier lancement
```

### Option 3: Déploiement Production (2-3h)
```
1. docs/deployment/README.md
2. docs/deployment/aws/aws-deployment.md
3. docs/deploy/vercel-setup.md
4. docs/deployment/mongodb-atlas.md
```

---

## 🌟 Fonctionnalités Principales

### 🚚 Dispatch de Commandes
- SLA 2h avec rappels automatiques
- Escalade IA (Affret.IA)
- Compliance transporteurs (Vigilance)

### 🎯 Économie Circulaire Palettes
- QR codes + signatures cryptographiques Ed25519
- Matching IA site de retour (30km)
- Ledger digital avec dispute management

### 🏪 Marketplace de Stockage
- Ranking IA (4 critères pondérés)
- Intégration WMS temps réel
- Contrats digitaux

### 📍 Géolocalisation & ETA
- GPS tracking temps réel
- TomTom Traffic API
- Prédictions IA
- Geofencing automatique

### 🤖 Support Client IA
- 8 bots spécialisés (GPT-4o-mini)
- Diagnostics automatiques
- Escalade Teams

### 🔐 Onboarding Client
- Vérification TVA (VIES/INSEE)
- Signature électronique eIDAS
- Contrats PDF générés

---

## 📍 Liens Utiles

- **GitHub Repo**: [RT-Technologie](https://github.com/romain-38530/RT-Technologie)
- **AWS Console**: [ECS Cluster](https://eu-central-1.console.aws.amazon.com/ecs/v2/clusters/rt-production)
- **Vercel Dashboard**: [Projects](https://vercel.com/dashboard)
- **MongoDB Atlas**: [Clusters](https://cloud.mongodb.com/)

---

## 📄 Prochaines Étapes

1. ✅ Lisez ce fichier
2. → Consultez [README.md](./README.md)
3. → Explorez [docs/INDEX.md](./docs/INDEX.md)
4. → Suivez le guide adapté à votre rôle
5. → Commencez à développer !

---

**🚀 Bonne découverte de RT-Technologie !**

**Documentation Version:** 2.0
**Dernière mise à jour:** 2025-11-21
**Créé par:** Claude Code Agent

---

*[↑ Retour en haut](#-rt-technologie---commencez-ici)*
