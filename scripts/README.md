# Scripts de Déploiement RT-Technologie

Ce dossier contient tous les scripts nécessaires pour le déploiement, le développement et la maintenance de la plateforme RT-Technologie.

## Vue d'ensemble

- **19 services backend** (ports 3001-3020)
- **9 applications frontend** (ports 4001-4009)
- **Infrastructure:** MongoDB, Redis, AWS, Vercel

## Scripts Disponibles

### 1. build-all.sh
**Build complet de tous les composants**

```bash
./scripts/build-all.sh
```

**Fonctionnalités:**
- Build des packages partagés
- Build des 19 services backend
- Build des 9 applications frontend
- Nettoyage des builds précédents
- Temps de build affiché

**Utilisation:**
- Exécuter avant chaque déploiement
- Vérifier qu'il n'y a pas d'erreurs de build

---

### 2. dev-all.sh
**Démarrer tous les services en mode développement**

```bash
./scripts/dev-all.sh
```

**Fonctionnalités:**
- Démarre tous les services backend en parallèle
- Démarre toutes les apps frontend en parallèle
- Utilise Turbo pour la parallélisation
- Hot reload activé

**Services démarrés:**
- Backend: http://localhost:3001-3020
- Frontend: http://localhost:4001-4009

**Arrêt:**
- `Ctrl+C` pour arrêter tous les services

---

### 3. test-all.sh
**Exécuter tous les tests**

```bash
./scripts/test-all.sh
```

**Tests exécutés:**
- Tests unitaires
- Tests d'intégration
- Tests E2E
- Linting (ESLint)
- Type checking (TypeScript)

**Résumé:**
- Nombre de tests passés/échoués
- Temps d'exécution
- Code d'erreur si échec

---

### 4. pre-deploy-check.sh
**Vérifications pré-déploiement**

```bash
./scripts/pre-deploy-check.sh
```

**Vérifications effectuées:**
1. Fichiers .env.example présents
2. Dockerfiles présents
3. Conflits de ports
4. Cohérence des dépendances
5. Linting du code
6. Types TypeScript
7. Audit de sécurité
8. Variables d'environnement critiques
9. État Git
10. Connexion MongoDB

**Résultat:**
- ✓ Check réussi
- ⚠ Avertissement
- ✗ Échec

---

### 5. monitor-services.sh
**Monitoring des services en temps réel**

```bash
# Monitoring continu (refresh toutes les 5s)
./scripts/monitor-services.sh

# Check ponctuel
./scripts/monitor-services.sh --once

# Check d'un service spécifique
./scripts/monitor-services.sh --port 3001

# Aide
./scripts/monitor-services.sh --help
```

**Informations affichées:**
- Port du service
- Nom du service
- Status (UP/DOWN/DEGRADED)
- Utilisation mémoire
- Résumé (services UP/DOWN)

---

### 6. deploy.sh
**Déploiement complet automatisé**

```bash
./scripts/deploy.sh
```

**Étapes:**
1. Vérifications pré-déploiement
2. Exécution des tests
3. Build de tous les composants
4. Création d'un backup
5. Migration base de données
6. Déploiement services backend (PM2)
7. Vérification santé services
8. Déploiement frontend (Vercel) - optionnel

**Durée:** ~5-10 minutes

**Prérequis:**
- PM2 installé
- MongoDB accessible
- Variables d'environnement configurées

---

### 7. rollback.sh
**Rollback vers version précédente**

```bash
./scripts/rollback.sh
```

**Processus:**
1. Liste les backups disponibles
2. Sélection du backup à restaurer
3. Confirmation utilisateur
4. Arrêt des services PM2
5. Backup de l'état actuel
6. Restauration du backup
7. Installation des dépendances
8. Rebuild
9. Redémarrage des services

**Attention:**
- Nécessite sudo
- Crée un backup avant rollback
- Vérifie la santé après rollback

---

## Scripts Infrastructure

### migrate-db.js
**Migration de la base de données MongoDB**

```bash
node infra/scripts/migrate-db.js
```

**Fonctionnalités:**
- Création de 30+ collections
- Création de 100+ indexes
- Support géospatial (2dsphere)
- Indexes uniques et composés

**Collections créées pour:**
- Orders & Planning
- Notifications
- Synchronisations (TMS, WMS, ERP)
- IA Services (Affret, Tracking, Chatbot)
- Marketplace (Bourse, Storage)
- Formation & Support

---

### pm2-ecosystem.config.js
**Configuration PM2 pour tous les services**

```bash
# Démarrer tous les services
pm2 start infra/scripts/pm2-ecosystem.config.js

# Voir le statut
pm2 status

# Logs
pm2 logs

# Monitoring
pm2 monit

# Redémarrer
pm2 restart all

# Arrêter
pm2 stop all
```

**Configuration par service:**
- Instances (1 ou 2)
- Mode (cluster/fork)
- Port
- Variables d'environnement
- Logs (error/out)
- Memory limits
- Auto-restart

---

## Fichiers de Configuration

### docker-compose.dev.yml
**Environnement de développement Docker**

```bash
# Démarrer MongoDB et Redis
docker-compose -f docker-compose.dev.yml up -d

# Voir les logs
docker-compose -f docker-compose.dev.yml logs -f

# Arrêter
docker-compose -f docker-compose.dev.yml down
```

**Services:**
- MongoDB 7 (port 27017)
- Redis 7 (port 6379)

**Volumes persistants:**
- mongo-data
- redis-data

---

### vercel.json
**Configuration Vercel pour les apps frontend**

**Builds:**
- 8 applications Next.js
- Région: Paris (cdg1)
- Functions: 3GB RAM, 10s timeout

**Features:**
- Headers de sécurité
- Rewrites vers API
- Redirections
- Cron jobs

**Déploiement:**
```bash
vercel --prod
```

---

## Workflows Recommandés

### Développement Local

```bash
# 1. Démarrer infrastructure
docker-compose -f docker-compose.dev.yml up -d

# 2. Initialiser la DB
node infra/scripts/migrate-db.js

# 3. Démarrer tous les services
./scripts/dev-all.sh
```

### Déploiement en Production

```bash
# 1. Vérifications
./scripts/pre-deploy-check.sh

# 2. Tests
./scripts/test-all.sh

# 3. Déploiement complet
./scripts/deploy.sh
```

### Monitoring en Production

```bash
# Monitoring continu
./scripts/monitor-services.sh

# PM2 monitoring
pm2 monit

# Logs
pm2 logs
```

### Rollback d'Urgence

```bash
# Rollback complet
./scripts/rollback.sh

# Vérifier la santé
./scripts/monitor-services.sh --once

# Voir les logs
pm2 logs
```

---

## Variables d'Environnement Requises

### Backend Services

```bash
# MongoDB
MONGODB_URI=mongodb://user:pass@host:27017/db?authSource=admin

# Redis
REDIS_URL=redis://host:6379

# Security
JWT_SECRET=your-secret-key

# AWS
AWS_REGION=eu-west-3
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret

# IA Services (pour affret-ia, tracking-ia, chatbot)
OPENAI_API_KEY=sk-...
```

### Frontend Apps

```bash
# API
NEXT_PUBLIC_API_URL=https://api.rt-technologie.com
NEXT_PUBLIC_WS_URL=wss://ws.rt-technologie.com

# Environment
NEXT_PUBLIC_ENV=production
```

---

## Troubleshooting

### Services ne démarrent pas

```bash
# Vérifier les logs
pm2 logs [service-name]

# Redémarrer un service
pm2 restart [service-name]

# Vérifier les ports
./scripts/monitor-services.sh --once
```

### Build échoue

```bash
# Nettoyer les caches
find . -name "node_modules" -type d -prune -exec rm -rf {} \;
find . -name ".turbo" -type d -prune -exec rm -rf {} \;

# Réinstaller
pnpm install --frozen-lockfile

# Rebuild
./scripts/build-all.sh
```

### MongoDB inaccessible

```bash
# Tester la connexion
mongosh "$MONGODB_URI"

# Relancer via Docker
docker-compose -f docker-compose.dev.yml restart mongodb
```

### Tests échouent

```bash
# Exécuter les tests avec verbose
pnpm test -- --verbose

# Exécuter un test spécifique
pnpm test -- path/to/test.spec.ts

# Mettre à jour les snapshots
pnpm test -- -u
```

---

## Permissions

Tous les scripts `.sh` doivent avoir les permissions d'exécution:

```bash
chmod +x scripts/*.sh
```

---

## Support

### Documentation
- [Checklist de Déploiement](../docs/DEPLOYMENT_CHECKLIST.md)
- [Guide de Démarrage Rapide](../docs/QUICKSTART_DEPLOYMENT.md)

### Contact
- **DevOps:** devops@rt-technologie.com
- **Slack:** #devops-alerts

---

## Changelog

### Version 1.0.0 (2025-11-18)
- Scripts de déploiement initiaux
- Support pour 19 services backend
- Support pour 9 applications frontend
- Monitoring et rollback automatisés
- Migration base de données
- Configuration PM2 et Vercel

---

**Auteur:** RT-Technologie DevOps Team
**Date:** 2025-11-18
**Version:** 1.0.0
