# RT-Technologie

Plateforme SaaS complète pour la gestion logistique et le transport multimodal.

## 🚀 Démarrage Rapide

### Pour visualiser les applications frontend (Développement Local)

**Option 1 - Script automatique (Windows) :**
```bash
# Double-cliquer sur :
start-dev.bat
```

**Option 2 - Ligne de commande :**
```bash
# 1. Installer les dépendances (une seule fois)
pnpm install

# 2. Démarrer une application
cd apps/backoffice-admin
pnpm dev

# 3. Ouvrir dans le navigateur
# http://localhost:3000
```

### 📚 Documentation Complète

Toute la documentation est dans le dossier **[`docs/`](./docs/)**

**Fichiers importants :**
- 📋 **[docs/INSTRUCTIONS_DEMARRAGE.txt](./docs/INSTRUCTIONS_DEMARRAGE.txt)** - Guide pas à pas
- ⚡ **[docs/DEMARRAGE_RAPIDE.md](./docs/DEMARRAGE_RAPIDE.md)** - Démarrage en 5 minutes
- 📖 **[docs/INDEX.md](./docs/INDEX.md)** - Index complet de la documentation
- 🔧 **[docs/SETUP_DEV_LOCAL.md](./docs/SETUP_DEV_LOCAL.md)** - Configuration complète

## 📦 Structure du Projet

```
rt-technologie/
├── apps/                    # Applications frontend (Next.js)
│   ├── backoffice-admin/   # Administration
│   ├── web-industry/       # Portail industrie
│   ├── web-transporter/    # Portail transporteur
│   ├── web-logistician/    # Portail logisticien
│   ├── web-forwarder/      # Portail transitaire
│   ├── web-recipient/      # Portail destinataire
│   ├── web-supplier/       # Portail fournisseur
│   ├── mobile-driver/      # Application mobile conducteur
│   └── kiosk/              # Borne d'accueil
│
├── services/               # Services backend (Node.js)
│   ├── authz/             # Authentification & autorisation
│   ├── admin-gateway/     # Gateway admin
│   ├── notifications/     # Service notifications
│   ├── planning/          # Service planning
│   ├── palette/           # Gestion palettes Europe
│   ├── storage-market/    # Bourse de stockage
│   └── ...
│
├── packages/              # Packages partagés
│   ├── design-system/    # Design system unifié
│   ├── chatbot-widget/   # Widget chatbot IA
│   └── ...
│
├── docs/                  # 📚 Documentation complète
├── infra/                # Infrastructure & déploiement
└── start-dev.bat         # Script de démarrage rapide
```

## 🎯 Applications Disponibles

| Application | Port | Description |
|-------------|------|-------------|
| **Backoffice Admin** | 3000 | Administration de la plateforme |
| **Web Industry** | 3001 | Portail pour les industriels |
| **Web Transporter** | 3010 | Portail pour les transporteurs |
| **Web Logistician** | 3020 | Portail pour les logisticiens |
| **Web Forwarder** | 3030 | Portail pour les transitaires |
| **Web Recipient** | 3040 | Portail pour les destinataires |
| **Web Supplier** | 3050 | Portail pour les fournisseurs |

## 🔧 Technologies

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, MongoDB
- **Monorepo:** pnpm workspaces, Turborepo
- **Design System:** Custom design system avec Radix UI
- **IA:** OpenRouter (GPT-4, Claude) pour chatbot et cotations

## 🌟 Fonctionnalités Principales

### 📋 Gestion des Flux
- Planification automatisée des rendez-vous
- Affectation intelligente avec SLA
- Vigilance documentaire et blocage automatique

### 🤖 Intelligence Artificielle
- **Affret.IA** - Cotations automatiques par IA
- **Chatbot** - Assistant intelligent (HelpBot, SalesBot, TrainBot)
- Suggestions de transporteurs optimales

### 📦 Modules Spécialisés
- **Palettes Europe** - Gestion des chèques palettes
- **Bourse de Stockage** - Marketplace de capacités
- **e-CMR** - Signature électronique des documents
- **Tracking & ETA** - Suivi temps réel

### 🔐 Sécurité
- Authentification JWT multi-rôles
- Vigilance transporteurs automatique
- Validation VAT/SIRET
- Contrôle d'accès granulaire (RBAC)

## 🛠️ Développement

### Prérequis
- Node.js 18+
- pnpm 8+
- MongoDB (optionnel pour frontend uniquement)

### Commandes

```bash
# Installation
pnpm install

# Développement
pnpm dev                              # Toutes les apps
cd apps/backoffice-admin && pnpm dev  # Une app spécifique

# Build
pnpm build

# Linting
pnpm lint

# Tests
pnpm test

# Services backend uniquement
pnpm agents
```

## 🐳 Docker

Pour démarrer avec Docker :

```bash
# Linux/Mac
./docker-run.sh

# Windows Git Bash
bash docker-run.sh
```

**Note:** Voir [docs/COMPARAISON_DEV_DOCKER.md](./docs/COMPARAISON_DEV_DOCKER.md) pour choisir entre dev local et Docker.

## 📄 Scripts Utiles

- **`start-dev.bat`** - Démarrage automatique (Windows)
- **`kill-ports.ps1`** - Libérer les ports occupés (PowerShell)
- **`docker-run.sh`** - Démarrage Docker complet

## 🆘 Besoin d'aide ?

1. **Consultez la documentation :** [docs/INDEX.md](./docs/INDEX.md)
2. **Guide de démarrage :** [docs/INSTRUCTIONS_DEMARRAGE.txt](./docs/INSTRUCTIONS_DEMARRAGE.txt)
3. **Résolution de problèmes :** [docs/RESOLUTION_PORTS_DOCKER.md](./docs/RESOLUTION_PORTS_DOCKER.md)

## 📞 Support

- **Email :** support@rt-technologie.com
- **Documentation :** `/docs`
- **API Status :** http://localhost:3000/health (en dev)

## 📋 Licence

Propriétaire - RT Technologie © 2025

---

**Version :** 2.0
**Dernière mise à jour :** 18 Novembre 2025
