# RT-Technologie - Checklist de Déploiement

## Vue d'ensemble

Ce document fournit une checklist complète pour le déploiement de la plateforme RT-Technologie.

**Date:** 2025-11-18
**Version:** 1.0.0
**Auteur:** RT-Technologie DevOps Team

---

## Architecture

### Services Backend (19)

| Port | Service | Description |
|------|---------|-------------|
| 3001 | core-orders | Gestion des commandes |
| 3002 | notifications | Service de notifications |
| 3003 | tms-sync | Synchronisation TMS |
| 3004 | planning | Planification des routes |
| 3005 | affret-ia | IA pour affret |
| 3006 | vigilance | Alertes et surveillance |
| 3007 | authz | Authentification et autorisations |
| 3008 | admin-gateway | Gateway administrateur |
| 3009 | ecpmr | Gestion des eCMR |
| 3011 | palette | Gestion des palettes |
| 3012 | training | Formation |
| 3013 | storage-market | Marketplace de stockage |
| 3014 | pricing-grids | Grilles tarifaires |
| 3015 | tracking-ia | IA de tracking |
| 3016 | bourse | Bourse de fret |
| 3017 | wms-sync | Synchronisation WMS |
| 3018 | erp-sync | Synchronisation ERP |
| 3019 | chatbot | Chatbot IA |
| 3020 | geo-tracking | Géolocalisation temps réel |

### Applications Frontend (9)

| Port | App | Description |
|------|-----|-------------|
| 4001 | web-industry | Interface industriel |
| 4002 | web-transporter | Interface transporteur |
| 4003 | web-forwarder | Interface affréteur |
| 4004 | web-recipient | Interface destinataire |
| 4005 | web-supplier | Interface fournisseur |
| 4006 | web-logistician | Interface logisticien |
| 4007 | backoffice-admin | Backoffice admin |
| 4008 | mobile-driver | PWA chauffeur |
| 4009 | kiosk | Kiosque |

---

## Pré-requis

### Infrastructure

- [ ] MongoDB 7.0+ installé et configuré
- [ ] Redis 7.0+ installé et configuré
- [ ] Node.js 20+ installé
- [ ] pnpm 8.15.4+ installé
- [ ] PM2 installé globalement
- [ ] Git configuré avec accès au repository

### AWS

- [ ] Compte AWS configuré
- [ ] IAM credentials configurés
- [ ] VPC et Subnets créés
- [ ] Security Groups configurés
- [ ] Load Balancer configuré
- [ ] RDS (si nécessaire) configuré
- [ ] S3 buckets créés

### Vercel

- [ ] Compte Vercel configuré
- [ ] Organisation créée
- [ ] Domaines configurés
- [ ] Variables d'environnement définies

### Variables d'Environnement

- [ ] `MONGODB_URI` définie
- [ ] `REDIS_URL` définie
- [ ] `JWT_SECRET` définie
- [ ] `AWS_REGION` définie
- [ ] `AWS_ACCESS_KEY_ID` définie
- [ ] `AWS_SECRET_ACCESS_KEY` définie
- [ ] `OPENAI_API_KEY` définie (pour services IA)
- [ ] `NEXT_PUBLIC_API_URL` définie

---

## Étapes de Déploiement

### 1. Préparation

#### 1.1 Cloner le repository
```bash
git clone git@github.com:rt-technologie/rt-technologie.git
cd rt-technologie
```

- [ ] Repository cloné
- [ ] Branche main/master vérifiée

#### 1.2 Installer les dépendances
```bash
pnpm install --frozen-lockfile
```

- [ ] Dépendances installées
- [ ] Pas d'erreurs d'installation

#### 1.3 Configurer les variables d'environnement
```bash
cp .env.example .env
# Éditer .env avec les valeurs de production
```

- [ ] Fichiers .env créés pour chaque service
- [ ] Valeurs de production configurées
- [ ] Secrets sécurisés

### 2. Vérifications Pré-Déploiement

#### 2.1 Exécuter les vérifications
```bash
./scripts/pre-deploy-check.sh
```

- [ ] Tous les checks passés
- [ ] Pas d'erreurs critiques
- [ ] Warnings résolus

#### 2.2 Exécuter les tests
```bash
./scripts/test-all.sh
```

- [ ] Tests unitaires passés
- [ ] Tests d'intégration passés
- [ ] Tests E2E passés
- [ ] Linting réussi
- [ ] Type checking réussi

#### 2.3 Audit de sécurité
```bash
pnpm audit --audit-level=high
```

- [ ] Pas de vulnérabilités critiques
- [ ] Vulnérabilités moyennes documentées

### 3. Build

#### 3.1 Build complet
```bash
./scripts/build-all.sh
```

- [ ] Packages buildés
- [ ] Services backend buildés
- [ ] Apps frontend buildées
- [ ] Pas d'erreurs de build

### 4. Migration Base de Données

#### 4.1 Exécuter les migrations
```bash
node infra/scripts/migrate-db.js
```

- [ ] Collections créées
- [ ] Indexes créés
- [ ] Données de seed chargées (optionnel)

### 5. Déploiement Backend

#### 5.1 Déployer avec PM2
```bash
pm2 start infra/scripts/pm2-ecosystem.config.js
pm2 save
pm2 startup
```

- [ ] Tous les services démarrés
- [ ] PM2 configuré pour auto-restart
- [ ] Logs configurés

#### 5.2 Vérifier la santé des services
```bash
./scripts/monitor-services.sh --once
```

- [ ] Tous les services UP
- [ ] Endpoints /health répondent
- [ ] Pas de services DOWN

### 6. Déploiement Frontend

#### 6.1 Déployer sur Vercel
```bash
vercel --prod
```

Ou via GitHub integration:
- [ ] Push sur main/master
- [ ] CI/CD déclenché
- [ ] Build Vercel réussi
- [ ] Déploiement en production

#### 6.2 Vérifier les applications
- [ ] web-industry accessible
- [ ] web-transporter accessible
- [ ] web-forwarder accessible
- [ ] web-recipient accessible
- [ ] web-supplier accessible
- [ ] web-logistician accessible
- [ ] backoffice-admin accessible
- [ ] mobile-driver accessible
- [ ] kiosk accessible

### 7. Configuration Infrastructure

#### 7.1 Terraform
```bash
cd infra/terraform
terraform init
terraform plan
terraform apply
```

- [ ] Infrastructure créée
- [ ] Load balancer configuré
- [ ] Domaines configurés
- [ ] SSL/TLS configuré

#### 7.2 DNS
- [ ] Enregistrements A/CNAME configurés
- [ ] SSL certificates valides
- [ ] Redirections HTTPS configurées

### 8. Monitoring et Logs

#### 8.1 Configurer le monitoring
- [ ] PM2 monitoring activé
- [ ] CloudWatch (AWS) configuré
- [ ] Logs centralisés
- [ ] Alertes configurées

#### 8.2 Vérifier les logs
```bash
pm2 logs
```

- [ ] Pas d'erreurs critiques dans les logs
- [ ] Services loggent correctement

### 9. Tests Post-Déploiement

#### 9.1 Tests fonctionnels
- [ ] Création de commande
- [ ] Notifications envoyées
- [ ] Planning généré
- [ ] Authentification fonctionnelle
- [ ] API Gateway répondant

#### 9.2 Tests de charge (optionnel)
- [ ] Load testing effectué
- [ ] Performances acceptables
- [ ] Auto-scaling testé

### 10. Backup et Rollback

#### 10.1 Créer un backup
```bash
mkdir -p /opt/rt-technologie/backups
cd /opt/rt-technologie
tar -czf backups/backup-$(date +%Y%m%d-%H%M%S).tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='backups' \
  .
```

- [ ] Backup créé
- [ ] Backup testé (extraction)

#### 10.2 Tester le rollback
```bash
./scripts/rollback.sh
```

- [ ] Procédure de rollback testée
- [ ] Rollback documenté

---

## Monitoring Post-Déploiement

### Surveillance Continue

```bash
# Monitoring en temps réel
./scripts/monitor-services.sh

# Check ponctuel
./scripts/monitor-services.sh --once

# Check service spécifique
./scripts/monitor-services.sh --port 3001
```

### Métriques à Surveiller

- [ ] CPU usage < 80%
- [ ] Memory usage < 80%
- [ ] Disk usage < 80%
- [ ] Response time < 500ms
- [ ] Error rate < 1%
- [ ] Uptime > 99.9%

### Logs à Surveiller

```bash
# Logs PM2
pm2 logs

# Logs par service
pm2 logs core-orders
pm2 logs notifications
# etc.

# Logs système
tail -f /var/log/rt-technologie/*.log
```

---

## Troubleshooting

### Services ne démarrent pas

```bash
# Vérifier les logs
pm2 logs [service-name]

# Vérifier les dépendances
pnpm install

# Vérifier les variables d'environnement
env | grep MONGODB_URI
env | grep REDIS_URL
```

### Base de données inaccessible

```bash
# Tester la connexion MongoDB
mongosh "$MONGODB_URI"

# Tester Redis
redis-cli ping
```

### Applications frontend inaccessibles

```bash
# Vérifier le déploiement Vercel
vercel ls

# Vérifier les logs Vercel
vercel logs

# Rebuilder
vercel --prod --force
```

### Performances dégradées

```bash
# Vérifier les ressources
pm2 monit

# Redémarrer les services
pm2 restart all

# Vider le cache Redis
redis-cli FLUSHALL
```

---

## Rollback d'Urgence

En cas de problème critique:

```bash
# 1. Arrêter tous les services
pm2 stop all

# 2. Rollback vers version précédente
./scripts/rollback.sh

# 3. Vérifier la santé
./scripts/monitor-services.sh --once

# 4. Notifier l'équipe
```

---

## Contact et Support

### Équipe DevOps
- Email: devops@rt-technologie.com
- Slack: #devops-alerts

### Escalation
1. DevOps Lead
2. CTO
3. Emergency On-Call

---

## Changelog

### Version 1.0.0 (2025-11-18)
- Checklist initiale de déploiement
- Support pour 19 services backend
- Support pour 9 applications frontend
- Scripts de déploiement automatisés
- Procédures de rollback
- Monitoring et alerting

---

## Annexes

### A. Scripts Disponibles

| Script | Description |
|--------|-------------|
| `build-all.sh` | Build tous les services et apps |
| `dev-all.sh` | Démarrer en mode développement |
| `test-all.sh` | Exécuter tous les tests |
| `pre-deploy-check.sh` | Vérifications pré-déploiement |
| `monitor-services.sh` | Monitoring des services |
| `rollback.sh` | Rollback vers version précédente |
| `migrate-db.js` | Migrations base de données |

### B. Fichiers de Configuration

| Fichier | Description |
|---------|-------------|
| `vercel.json` | Configuration Vercel |
| `docker-compose.dev.yml` | Environnement dev Docker |
| `infra/scripts/pm2-ecosystem.config.js` | Configuration PM2 |
| `infra/terraform/main.tf` | Infrastructure Terraform |

### C. Commandes Utiles

```bash
# PM2
pm2 status              # Statut des services
pm2 restart all         # Redémarrer tous
pm2 reload all          # Reload sans downtime
pm2 logs                # Voir les logs
pm2 monit               # Monitoring

# pnpm
pnpm install            # Installer dépendances
pnpm build              # Build tous
pnpm test               # Tests
pnpm lint               # Linting

# Git
git status              # Statut
git log --oneline -10   # Derniers commits
git diff                # Changements

# MongoDB
mongosh                 # Shell MongoDB
db.stats()              # Statistiques DB

# Redis
redis-cli               # CLI Redis
PING                    # Test connexion
```

---

**Note:** Cette checklist doit être suivie scrupuleusement pour chaque déploiement en production.
