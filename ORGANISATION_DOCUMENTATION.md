# 📚 Organisation de la Documentation - RT Technologie

## ✅ Documentation Déplacée

Tous les fichiers de documentation ont été déplacés dans le dossier **`docs/`** pour une meilleure organisation.

### 📁 Structure actuelle

```
RT-Technologie/
│
├── README.md                    ← README principal mis à jour
├── start-dev.bat               ← Script de démarrage rapide (Windows)
├── kill-ports.ps1              ← Script pour libérer les ports
├── docker-run.sh               ← Script Docker
├── .env.local                  ← Variables d'environnement dev local
│
├── docs/                       ← 📚 TOUTE LA DOCUMENTATION
│   ├── INDEX.md                ← Index complet de la documentation
│   │
│   ├── 🚀 Démarrage
│   ├── INSTRUCTIONS_DEMARRAGE.txt
│   ├── DEMARRAGE_RAPIDE.md
│   ├── SETUP_DEV_LOCAL.md
│   ├── COMPARAISON_DEV_DOCKER.md
│   ├── RESOLUTION_PORTS_DOCKER.md
│   ├── CORRECTIONS_EFFECTUEES.md
│   │
│   ├── 🏗️ Architecture
│   ├── ARCHITECTURE_CONNEXIONS.md
│   ├── DEPLOYMENT_ARCHITECTURE.md
│   ├── DEPLOYMENT_CHECKLIST.md
│   ├── SERVICES_DEPENDENCIES.md
│   ├── PORTS_MAPPING.md
│   │
│   ├── 🎨 Design & Frontend
│   ├── DESIGN_SYSTEM.md
│   ├── TRAINING_SYSTEM.md
│   ├── TRAINING_BUTTON.md
│   │
│   ├── 📦 Modules
│   ├── MODULE_PALETTES.md
│   ├── STORAGE_MARKET_MODULE.md
│   ├── API_STORAGE_MARKET.md
│   │
│   ├── 📝 Rapports & Status
│   ├── STATUS_FINAL.md
│   ├── PROJET_COMPLET_2025.md
│   ├── INTEGRATION_TEST_REPORT.md
│   │
│   └── 📂 Dossiers
│       ├── chatbot/
│       ├── deploy/
│       └── formations/
│
├── apps/
│   ├── backoffice-admin/
│   │   ├── README.md           ← README spécifique à l'app
│   │   └── .env.local          ← Config locale
│   └── ...
│
├── services/
├── packages/
└── infra/
```

## 🎯 Fichiers Principaux par Objectif

### Pour DÉMARRER rapidement

1. **À la racine :**
   - `README.md` - Vue d'ensemble et liens vers la doc
   - `start-dev.bat` - Script de démarrage rapide

2. **Dans `docs/` :**
   - `INSTRUCTIONS_DEMARRAGE.txt` - Guide pas à pas
   - `DEMARRAGE_RAPIDE.md` - Démarrage en 5 minutes
   - `INDEX.md` - Index de toute la documentation

### Pour COMPRENDRE l'architecture

1. **Dans `docs/` :**
   - `ARCHITECTURE_CONNEXIONS.md`
   - `SERVICES_DEPENDENCIES.md`
   - `PORTS_MAPPING.md`

### Pour RÉSOUDRE des problèmes

1. **Dans `docs/` :**
   - `RESOLUTION_PORTS_DOCKER.md`
   - `CORRECTIONS_EFFECTUEES.md`
   - `INTEGRATION_TEST_REPORT.md`

### Pour DÉPLOYER

1. **Dans `docs/` :**
   - `DEPLOYMENT_CHECKLIST.md`
   - `DEPLOYMENT_ARCHITECTURE.md`
   - `QUICKSTART_DEPLOYMENT.md`

## 🔍 Accès Rapide

### Depuis la racine du projet

```bash
# Voir la doc principale
cat README.md

# Accéder à l'index de la doc
cat docs/INDEX.md

# Lire le guide de démarrage
cat docs/INSTRUCTIONS_DEMARRAGE.txt
```

### Depuis votre IDE (VSCode)

Tous les fichiers markdown sont cliquables et les liens internes fonctionnent !

- Ouvrez `README.md` à la racine
- Cliquez sur les liens vers `docs/`
- Naviguez dans la documentation

## 📖 Guides de Lecture Recommandés

### 🎯 Nouveau développeur

1. `README.md` (racine)
2. `docs/INSTRUCTIONS_DEMARRAGE.txt`
3. `docs/DEMARRAGE_RAPIDE.md`
4. `apps/backoffice-admin/README.md`

### 🏗️ Architecte / Lead Dev

1. `docs/INDEX.md`
2. `docs/ARCHITECTURE_CONNEXIONS.md`
3. `docs/SERVICES_DEPENDENCIES.md`
4. `docs/STATUS_FINAL.md`

### 🚀 DevOps / Déploiement

1. `docs/DEPLOYMENT_CHECKLIST.md`
2. `docs/DEPLOYMENT_ARCHITECTURE.md`
3. `docs/QUICKSTART_DEPLOYMENT.md`

### 🎨 Frontend Developer

1. `docs/DESIGN_SYSTEM.md`
2. `docs/TRAINING_SYSTEM.md`
3. `apps/backoffice-admin/README.md`

### 🔧 Dépannage

1. `docs/RESOLUTION_PORTS_DOCKER.md`
2. `docs/CORRECTIONS_EFFECTUEES.md`
3. `docs/COMPARAISON_DEV_DOCKER.md`

## 🗂️ Fichiers de Configuration

### À la racine

```
.env.local                  → Variables d'env dev local (créé)
start-dev.bat              → Script démarrage Windows (créé)
kill-ports.ps1             → Script libération ports (créé)
docker-run.sh              → Script Docker (existant)
```

### Dans apps/backoffice-admin/

```
.env.local                 → Variables d'env spécifiques (créé)
README.md                  → Doc de l'application (créé)
next.config.js            → Config Next.js (modifié)
package.json              → Dépendances (modifié)
```

## ✅ Modifications Effectuées

### Fichiers corrigés

- ✓ `apps/backoffice-admin/pages/_app.tsx`
- ✓ `apps/backoffice-admin/pages/index.tsx`
- ✓ `apps/backoffice-admin/package.json`
- ✓ `apps/backoffice-admin/next.config.js`

### Fichiers créés

- ✓ Toute la documentation dans `docs/`
- ✓ Scripts de démarrage et utilitaires
- ✓ Fichiers de configuration `.env.local`
- ✓ README mis à jour

### Fichiers déplacés vers `docs/`

- ✓ INSTRUCTIONS_DEMARRAGE.txt
- ✓ DEMARRAGE_RAPIDE.md
- ✓ SETUP_DEV_LOCAL.md
- ✓ COMPARAISON_DEV_DOCKER.md
- ✓ RESOLUTION_PORTS_DOCKER.md
- ✓ CORRECTIONS_EFFECTUEES.md

## 🎓 Prochaines Étapes

1. **Lire le README** à la racine
2. **Consulter** `docs/INDEX.md` pour l'index complet
3. **Suivre** `docs/INSTRUCTIONS_DEMARRAGE.txt` pour démarrer
4. **Utiliser** `start-dev.bat` pour lancer une app

## 📞 Support

- **Documentation :** `docs/INDEX.md`
- **Démarrage :** `docs/INSTRUCTIONS_DEMARRAGE.txt`
- **Problèmes :** `docs/RESOLUTION_PORTS_DOCKER.md`

---

**Organisation effectuée le :** 18 Novembre 2025
**Statut :** ✅ Terminé
