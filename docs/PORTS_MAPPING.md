# Mapping des Ports - RT-Technologie Services

Date de dernière mise à jour : 2025-11-18

## Vue d'ensemble

Ce document définit le mapping des ports pour tous les services backend de RT-Technologie.

## Conflits détectés et résolus

### Conflits identifiés

1. **Port 3011** : Conflit entre `training` et `palette`
   - **Situation** : `palette/src/server.js` utilise PORT 3011 par défaut
   - **Situation** : `training/src/server.js` utilise PORT 3012 par défaut
   - **Résolution** : palette → 3009, training → 3012 (garder existant)

2. **Port 3013** : Conflit entre `analytics` (non encore créé) et `storage-market`
   - **Situation** : `storage-market/src/server.js` utilise PORT 3013 par défaut
   - **Résolution** : storage-market → 3015, analytics → 3013 (futur)

3. **Port incohérent authz** :
   - **Situation** : `authz/src/server.js` définit PORT 3007 mais la spec indique 3002
   - **Résolution** : authz → 3002 (spec originale)

4. **Port incohérent vigilance** :
   - **Situation** : `vigilance/src/server.js` définit PORT 3006 mais devrait être 3008
   - **Résolution** : vigilance → 3008 (spec originale)

5. **Port incohérent admin-gateway** :
   - **Situation** : `admin-gateway/src/server.js` définit PORT 3008 mais devrait être 3001
   - **Résolution** : admin-gateway → 3001 (spec originale)

6. **Port incohérent planning** :
   - **Situation** : `planning/src/server.js` définit PORT 3004 mais devrait être 3005
   - **Résolution** : planning → 3005 (spec originale)

7. **Port incohérent notifications** :
   - **Situation** : `notifications/src/server.js` définit PORT 3002 mais devrait être 3004
   - **Résolution** : notifications → 3004 (spec originale)

8. **Port incohérent affret-ia** :
   - **Situation** : `affret-ia/src/server.js` définit PORT 3005 mais devrait être 3010
   - **Résolution** : affret-ia → 3010 (spec originale)

## Mapping Final des Ports

| Port | Service | Statut | Variables d'environnement |
|------|---------|--------|---------------------------|
| **3001** | admin-gateway | ✅ Actif | `ADMIN_GATEWAY_PORT=3001` |
| **3002** | authz | ✅ Actif | `AUTHZ_PORT=3002` |
| **3003** | ecmr | ✅ Actif | `ECMR_PORT=3003` |
| **3004** | notifications | ✅ Actif | `NOTIFICATIONS_PORT=3004` |
| **3005** | planning | ✅ Actif | `PLANNING_PORT=3005` |
| **3006** | tms-sync | ✅ Actif | `TMS_SYNC_PORT=3006` |
| **3007** | core-orders | ✅ Actif | `PORT=3007` |
| **3008** | vigilance | ✅ Actif | `VIGILANCE_PORT=3008` |
| **3009** | palette | ✅ Actif | `PALETTE_PORT=3009` |
| **3010** | affret-ia | ✅ Actif | `AFFRET_IA_PORT=3010` |
| **3011** | webhooks | 🔄 À créer | `WEBHOOKS_PORT=3011` |
| **3012** | training | ✅ Actif | `TRAINING_PORT=3012` |
| **3013** | analytics | 🔄 À créer | `ANALYTICS_PORT=3013` |
| **3014** | ecpmr | ✅ Actif | `ECPMR_PORT=3014` |
| **3015** | storage-market | ✅ Actif | `PORT=3015` |
| **3016** | geo-tracking | ✅ Actif | `PORT=3016` |
| **3017** | pricing-engine | 🔄 À créer | `PRICING_ENGINE_PORT=3017` |
| **3018** | - | 🆓 Libre | - |
| **3019** | chatbot | ✅ Actif | `PORT=3019` |

## Services par catégorie

### Core Infrastructure
- **admin-gateway** (3001) : Gateway administration et monitoring
- **authz** (3002) : Authentification et autorisation
- **notifications** (3004) : Notifications email/SMS

### Transport & Logistics
- **core-orders** (3007) : Gestion des commandes principales
- **planning** (3005) : Gestion des créneaux et RDV
- **geo-tracking** (3016) : Géolocalisation temps réel
- **vigilance** (3008) : Contrôles de vigilance des transporteurs
- **tms-sync** (3006) : Synchronisation TMS externes

### Marketplace & IA
- **affret-ia** (3010) : Affrètement intelligent avec IA
- **storage-market** (3015) : Place de marché stockage
- **pricing-engine** (3017) : Moteur de tarification dynamique

### Document Management
- **ecmr** (3003) : CMR électronique
- **ecpmr** (3014) : CMR électronique étendu

### Support & Training
- **training** (3012) : Modules de formation
- **chatbot** (3019) : Assistants virtuels
- **analytics** (3013) : Analytique et reporting

### Specialized
- **palette** (3009) : Gestion des palettes (chèques, ledger)
- **webhooks** (3011) : Gestion des webhooks sortants

## Actions de correction requises

### Fichiers à modifier

1. **services/authz/src/server.js**
   ```javascript
   // Ligne 6
   - const PORT = Number(process.env.AUTHZ_PORT || '3007');
   + const PORT = Number(process.env.AUTHZ_PORT || '3002');
   ```

2. **services/vigilance/src/server.js**
   ```javascript
   // Ligne 143
   - server.listen(Number(process.env.VIGILANCE_PORT || '3006'), ...
   + server.listen(Number(process.env.VIGILANCE_PORT || '3008'), ...
   ```

3. **services/admin-gateway/src/server.js**
   ```javascript
   // Ligne 9
   - const PORT = Number(process.env.ADMIN_GATEWAY_PORT || '3008');
   + const PORT = Number(process.env.ADMIN_GATEWAY_PORT || '3001');
   ```

4. **services/planning/src/server.js**
   ```javascript
   // Ligne 12
   - const PORT = Number(env('PLANNING_PORT', '3004'));
   + const PORT = Number(env('PLANNING_PORT', '3005'));
   ```

5. **services/notifications/src/server.js**
   ```javascript
   // Ligne 15
   - const PORT = Number(env('NOTIFICATIONS_PORT', '3002'));
   + const PORT = Number(env('NOTIFICATIONS_PORT', '3004'));
   ```

6. **services/affret-ia/src/server.js**
   ```javascript
   // Ligne 8
   - const PORT = Number(process.env.AFFRET_IA_PORT || '3005');
   + const PORT = Number(process.env.AFFRET_IA_PORT || '3010');
   ```

7. **services/palette/src/server.js**
   ```javascript
   // Ligne 8
   - const PORT = Number(process.env.PALETTE_PORT || '3011');
   + const PORT = Number(process.env.PALETTE_PORT || '3009');
   ```

8. **services/storage-market/src/server.js**
   ```javascript
   // Ligne 745
   - const PORT = process.env.PORT ? Number(process.env.PORT) : 3013;
   + const PORT = process.env.PORT ? Number(process.env.PORT) : 3015;
   ```

### Variables d'environnement à mettre à jour

Chaque service doit avoir son `.env.example` avec :
```bash
# Port du service
SERVICE_PORT=30XX

# Autres variables...
```

## Configuration Docker Compose

```yaml
services:
  admin-gateway:
    ports:
      - "3001:3001"

  authz:
    ports:
      - "3002:3002"

  ecmr:
    ports:
      - "3003:3003"

  # ... etc pour tous les services
```

## Health Check URLs

Tous les services doivent exposer un endpoint `/health` :

```
http://localhost:3001/health  # admin-gateway
http://localhost:3002/health  # authz
http://localhost:3003/health  # ecmr
...
```

## Notes importantes

1. **Priorité de configuration** : Variable d'environnement > Valeur par défaut
2. **Environnements** :
   - **Développement** : Ports par défaut (30XX)
   - **Docker** : Mapping ports spécifiques
   - **Production** : Configuration via variables d'env AWS/Azure

3. **Tests de connectivité** : Utiliser `scripts/check-services-health.js` pour valider tous les services

4. **Proxy Nginx** (production) :
   ```nginx
   location /api/admin/ {
       proxy_pass http://admin-gateway:3001/admin/;
   }
   location /api/auth/ {
       proxy_pass http://authz:3002/auth/;
   }
   # etc...
   ```

## Changelog

- **2025-11-18** : Détection et résolution de 8 conflits de ports
- **2025-11-18** : Création mapping initial avec 17 services
