# RT-Technologie - Guide de Démarrage

## Démarrage Rapide

### Option 1 : Développement Local (Recommandé pour commencer)

```bash
# 1. Installer les dépendances
pnpm install

# 2. Démarrer l'infrastructure (MongoDB + Redis)
docker-compose -f docker-compose.dev.yml up -d

# 3. Initialiser la base de données
node infra/scripts/migrate-db.js

# 4. Démarrer tous les services en mode développement
./scripts/dev-all.sh
```

**Accès:**
- Services backend: http://localhost:3001-3020
- Apps frontend: http://localhost:4001-4009

**Arrêt:** Ctrl+C dans le terminal

---

### Option 2 : Déploiement Production

```bash
# 1. Vérifications pré-déploiement
./scripts/pre-deploy-check.sh

# 2. Tests complets
./scripts/test-all.sh

# 3. Déploiement automatisé
./scripts/deploy.sh
```

---

## Scripts Disponibles

### Développement
```bash
./scripts/dev-all.sh              # Démarrer en mode dev
./scripts/build-all.sh            # Build complet
./scripts/test-all.sh             # Tests complets
```

### Déploiement
```bash
./scripts/pre-deploy-check.sh    # Vérifications avant déploiement
./scripts/deploy.sh               # Déploiement complet
./scripts/rollback.sh             # Rollback si problème
```

### Monitoring
```bash
./scripts/monitor-services.sh                 # Monitoring continu
./scripts/monitor-services.sh --once          # Check ponctuel
./scripts/monitor-services.sh --port 3001     # Service spécifique
```

---

## Configuration Requise

### Variables d'Environnement

Créez un fichier `.env` à la racine avec:

```bash
# MongoDB
MONGODB_URI=mongodb://admin:admin123@localhost:27017/rt-technologie?authSource=admin

# Redis
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your-secret-key-change-in-production

# AWS (optionnel pour dev)
AWS_REGION=eu-west-3
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret

# OpenAI (pour services IA)
OPENAI_API_KEY=sk-your-key

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_ENV=development
```

---

## Architecture

### Services Backend (19)

| Port | Service | URL |
|------|---------|-----|
| 3001 | core-orders | http://localhost:3001 |
| 3002 | notifications | http://localhost:3002 |
| 3003 | tms-sync | http://localhost:3003 |
| 3004 | planning | http://localhost:3004 |
| 3005 | affret-ia | http://localhost:3005 |
| 3006 | vigilance | http://localhost:3006 |
| 3007 | authz | http://localhost:3007 |
| 3008 | admin-gateway | http://localhost:3008 |
| 3009 | ecpmr | http://localhost:3009 |
| 3011 | palette | http://localhost:3011 |
| 3012 | training | http://localhost:3012 |
| 3013 | storage-market | http://localhost:3013 |
| 3014 | pricing-grids | http://localhost:3014 |
| 3015 | tracking-ia | http://localhost:3015 |
| 3016 | bourse | http://localhost:3016 |
| 3017 | wms-sync | http://localhost:3017 |
| 3018 | erp-sync | http://localhost:3018 |
| 3019 | chatbot | http://localhost:3019 |
| 3020 | geo-tracking | http://localhost:3020 |

### Applications Frontend (9)

| Port | App | URL |
|------|-----|-----|
| 4001 | web-industry | http://localhost:4001 |
| 4002 | web-transporter | http://localhost:4002 |
| 4003 | web-forwarder | http://localhost:4003 |
| 4004 | web-recipient | http://localhost:4004 |
| 4005 | web-supplier | http://localhost:4005 |
| 4006 | web-logistician | http://localhost:4006 |
| 4007 | backoffice-admin | http://localhost:4007 |
| 4008 | mobile-driver | http://localhost:4008 |
| 4009 | kiosk | http://localhost:4009 |

---

## Commandes Utiles

### PM2 (Production)
```bash
pm2 status              # Voir le statut des services
pm2 logs                # Voir les logs
pm2 restart all         # Redémarrer tous les services
pm2 stop all            # Arrêter tous les services
pm2 monit               # Monitoring en temps réel
```

### Docker
```bash
docker-compose -f docker-compose.dev.yml up -d      # Démarrer
docker-compose -f docker-compose.dev.yml logs -f    # Voir les logs
docker-compose -f docker-compose.dev.yml down       # Arrêter
```

### Base de Données
```bash
# MongoDB
mongosh mongodb://admin:admin123@localhost:27017/rt-technologie?authSource=admin

# Redis
redis-cli
```

---

## Troubleshooting

### Les services ne démarrent pas

```bash
# Vérifier les logs
pm2 logs [service-name]

# Vérifier MongoDB
mongosh mongodb://admin:admin123@localhost:27017

# Vérifier Redis
redis-cli ping
```

### Ports déjà utilisés

```bash
# Vérifier les ports
./scripts/monitor-services.sh --once

# Tuer un processus sur un port (exemple port 3001)
lsof -ti:3001 | xargs kill -9
```

### Build échoue

```bash
# Nettoyer et réinstaller
rm -rf node_modules
pnpm install

# Rebuild
./scripts/build-all.sh
```

---

## Documentation Complète

- **[DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)** - Vue d'ensemble complète
- **[docs/DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md)** - Checklist détaillée
- **[scripts/README.md](scripts/README.md)** - Documentation des scripts
- **[docs/QUICKSTART_DEPLOYMENT.md](docs/QUICKSTART_DEPLOYMENT.md)** - Guide de démarrage rapide

---

## Support

**Email:** devops@rt-technologie.com
**Slack:** #devops-alerts

---

**Bon déploiement ! 🚀**
