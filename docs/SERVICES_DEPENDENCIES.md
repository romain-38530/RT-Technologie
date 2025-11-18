# Dépendances entre Services - RT-Technologie

Date de dernière mise à jour : 2025-11-18

## Vue d'ensemble

Ce document cartographie toutes les dépendances entre les 17 services backend de RT-Technologie.

## Matrice de dépendances

| Service | Port | Appelle (Dépendances sortantes) | Est appelé par (Dépendances entrantes) |
|---------|------|----------------------------------|----------------------------------------|
| **admin-gateway** | 3001 | authz (3002), core-orders (3007), planning (3005), vigilance (3008), notifications (3004), ecpmr (3014) | web-admin, CLI admin |
| **authz** | 3002 | - | admin-gateway (3001), core-orders (3007), palette (3009), storage-market (3015), affret-ia (3010), vigilance (3008), toutes les apps web |
| **ecmr** | 3003 | authz (3002) | web-transporter, web-logistician, mobile-driver |
| **notifications** | 3004 | AWS SES, Mailgun API | core-orders (3007), affret-ia (3010), planning (3005), palette (3009), storage-market (3015), chatbot (3019) |
| **planning** | 3005 | notifications (3004) | core-orders (3007), web-industry, web-logistician |
| **tms-sync** | 3006 | core-orders (3007) | TMS externes (webhooks) |
| **core-orders** | 3007 | authz (3002), vigilance (3008), affret-ia (3010), planning (3005), geo-tracking (3016), notifications (3004) | admin-gateway (3001), tms-sync (3006), webhooks (3011), web-industry, web-transporter |
| **vigilance** | 3008 | VAT API externe, authz (3002) | core-orders (3007), affret-ia (3010) |
| **palette** | 3009 | authz (3002), notifications (3004) | affret-ia (3010), web-industry, web-transporter, web-logistician |
| **affret-ia** | 3010 | core-orders (3007), palette (3009), pricing-engine (3017), authz (3002), OpenRouter API | core-orders (3007), vigilance (3008), web-forwarder |
| **webhooks** | 3011 | TMS externes, WMS externes | core-orders (3007), storage-market (3015) |
| **training** | 3012 | authz (3002) | Toutes les apps web |
| **analytics** | 3013 | MongoDB, ClickHouse | admin-gateway (3001), web-admin |
| **ecpmr** | 3014 | authz (3002), notifications (3004) | web-transporter, web-logistician, admin-gateway (3001) |
| **storage-market** | 3015 | authz (3002), notifications (3004) | web-industry, web-logistician, webhooks (3011) |
| **geo-tracking** | 3016 | TomTom API, core-orders (3007) | mobile-driver, web-industry, core-orders (3007) |
| **pricing-engine** | 3017 | - | affret-ia (3010), web-industry |
| **chatbot** | 3019 | Tous les services (diagnostics), authz (3002) | Toutes les apps web, Teams |

## Graphe de dépendances par couche

### Couche 1 : Infrastructure de base
Services sans dépendances internes :
- **authz** (3002) : Authentification centralisée
- **pricing-engine** (3017) : Moteur de tarification
- **analytics** (3013) : Stockage analytique

### Couche 2 : Services métier fondamentaux
Dépendent uniquement de la couche 1 :
- **vigilance** (3008) : authz, VAT API
- **notifications** (3004) : AWS SES, Mailgun
- **ecmr** (3003) : authz
- **training** (3012) : authz
- **geo-tracking** (3016) : TomTom API

### Couche 3 : Services métier avancés
Dépendent des couches 1 et 2 :
- **palette** (3009) : authz, notifications
- **planning** (3005) : notifications
- **storage-market** (3015) : authz, notifications
- **ecpmr** (3014) : authz, notifications

### Couche 4 : Orchestration
Dépendent de toutes les couches précédentes :
- **core-orders** (3007) : authz, vigilance, affret-ia, planning, geo-tracking, notifications
- **affret-ia** (3010) : core-orders, palette, pricing-engine, authz

### Couche 5 : Gateway et intégration
- **admin-gateway** (3001) : authz, core-orders, planning, vigilance, notifications, ecpmr
- **tms-sync** (3006) : core-orders
- **webhooks** (3011) : core-orders, storage-market
- **chatbot** (3019) : tous les services

## Détail des dépendances par service

### admin-gateway (3001)
**Appels sortants** :
- `AUTHZ_URL=http://localhost:3002`
  - `/auth/orgs` : Liste des organisations
  - `/auth/orgs/:id` : Détail organisation
  - `/auth/orgs/:id/plan` : Gestion des plans

- `CORE_ORDERS_URL=http://localhost:3007`
  - `/health` : Health check
  - `/industry/orders` : Liste commandes

- `PLANNING_URL=http://localhost:3005`
  - `/health` : Health check

- `VIGILANCE_URL=http://localhost:3008`
  - `/health` : Health check

- `NOTIFICATIONS_URL=http://localhost:3004`
  - `/health` : Health check

- `ECPMR_URL=http://localhost:3014`
  - `/health` : Health check

**Appelé par** : web-admin, CLI admin

---

### authz (3002)
**Appels sortants** : Aucun (service de base)

**Appelé par** : Tous les services (authentification)
- Endpoints :
  - `POST /auth/register` : Inscription
  - `POST /auth/login` : Connexion
  - `POST /auth/verify` : Vérification email
  - `GET /auth/orgs/:id` : Info organisation
  - `GET /auth/plans` : Plans tarifaires

---

### core-orders (3007)
**Appels sortants** :
- `AUTHZ_URL=http://localhost:3002`
  - `/auth/orgs/:id` : Récupération entitlements

- `VIGILANCE_URL=http://localhost:3008`
  - `/vigilance/status/:carrierId?refresh=1` : Statut vigilance

- `AFFRET_IA_URL=http://localhost:3010`
  - `POST /affret-ia/dispatch` : Escalade affret

- `PLANNING_URL=http://localhost:3005` (implicite)

- `GEO_TRACKING_URL=http://localhost:3016` (implicite)

**Appelé par** :
- admin-gateway (3001)
- tms-sync (3006)
- affret-ia (3010)
- webhooks (3011)
- Applications web

---

### affret-ia (3010)
**Appels sortants** :
- `PALETTE_API_URL=http://localhost:3009`
  - `POST /palette/match/site` : Matching site de retour palettes
  - `GET /palette/sites` : Liste sites
  - `GET /palette/sites/:id` : Détail site avec quota
  - `GET /palette/ledger/:companyId` : Solde palettes

- `PRICING_ENGINE_URL=http://localhost:3017` (futur)
  - `POST /pricing/calculate` : Calcul prix dynamique

- `CORE_ORDERS_URL=http://localhost:3007` (lecture)
  - Accès aux données de commandes via seeds/mongo

- OpenRouter API (externe)
  - Completion IA pour cotations

**Appelé par** :
- core-orders (3007) : Escalade automatique
- web-forwarder : Demandes de cotation

---

### palette (3009)
**Appels sortants** :
- `AUTHZ_URL=http://localhost:3002` (implicite)

- `NOTIFICATIONS_URL=http://localhost:3004` (implicite)

**Appelé par** :
- affret-ia (3010) : Matching sites, gestion quotas
- web-industry : Génération chèques palettes
- web-transporter : Dépôt/signature chèques
- web-logistician : Réception chèques

---

### storage-market (3015)
**Appels sortants** :
- `AUTHZ_URL=http://localhost:3002` (implicite)

- `NOTIFICATIONS_URL=http://localhost:3004` (implicite)

**Appelé par** :
- web-industry : Publication besoins stockage
- web-logistician : Envoi d'offres
- webhooks (3011) : Intégration WMS

---

### vigilance (3008)
**Appels sortants** :
- VAT Check API (externe)
  - Validation numéros TVA

**Appelé par** :
- core-orders (3007) : Vérification avant dispatch
- affret-ia (3010) : Filtrage transporteurs

---

### geo-tracking (3016)
**Appels sortants** :
- `TOMTOM_API_KEY` : TomTom Routing API
  - Calcul ETA avec trafic temps réel

- `CORE_ORDERS_URL=http://localhost:3007` (lecture)
  - Récupération détails commandes

**Appelé par** :
- mobile-driver : Envoi positions GPS
- web-industry : Suivi temps réel
- core-orders (3007) : Événements géofencing

---

### chatbot (3019)
**Appels sortants** :
- Tous les services pour diagnostics :
  - `/health` : Vérification santé
  - Endpoints spécifiques selon le bot

- `AUTHZ_URL=http://localhost:3002`

- OpenAI / Anthropic API (externe)

- MS Teams Webhook (externe)

**Appelé par** :
- Toutes les applications web
- Microsoft Teams

---

### notifications (3004)
**Appels sortants** :
- AWS SES (externe)
- Mailgun API (externe)

**Appelé par** :
- core-orders (3007)
- affret-ia (3010)
- planning (3005)
- palette (3009)
- storage-market (3015)
- chatbot (3019)

---

### planning (3005)
**Appels sortants** :
- `NOTIFICATIONS_URL=http://localhost:3004`
  - `POST /notifications/email` : Notifications RDV

**Appelé par** :
- core-orders (3007) : Proposition/confirmation créneaux
- web-industry : Gestion planning
- web-logistician : Gestion quais

---

### tms-sync (3006)
**Appels sortants** :
- `CORE_ORDERS_URL=http://localhost:3007`
  - `POST /industry/orders/import` : Import commandes

**Appelé par** :
- TMS externes via webhooks

---

### webhooks (3011)
**Appels sortants** :
- Endpoints externes configurés dynamiquement
- `CORE_ORDERS_URL=http://localhost:3007` (lecture)
- `STORAGE_MARKET_URL=http://localhost:3015` (lecture)

**Appelé par** :
- core-orders (3007) : Événements commandes
- storage-market (3015) : Événements stockage

---

## Dépendances externes (APIs tierces)

### Services cloud
- **AWS SES** : notifications (3004)
- **AWS S3** : Stockage documents (plusieurs services)
- **Mailgun** : notifications (3004)

### APIs métier
- **TomTom Traffic API** : geo-tracking (3016)
- **VAT Check API** : vigilance (3008)
- **OpenRouter / OpenAI** : affret-ia (3010), chatbot (3019)

### Intégrations
- **Microsoft Teams** : chatbot (3019)
- **TMS externes** : tms-sync (3006), webhooks (3011)
- **WMS externes** : webhooks (3011), storage-market (3015)

## Configuration des dépendances

### Variables d'environnement par service

Chaque service doit définir dans son `.env.example` :

**core-orders** :
```bash
AUTHZ_URL=http://localhost:3002
VIGILANCE_URL=http://localhost:3008
AFFRET_IA_URL=http://localhost:3010
PLANNING_URL=http://localhost:3005
GEO_TRACKING_URL=http://localhost:3016
INTERNAL_SERVICE_TOKEN=xxx
```

**affret-ia** :
```bash
CORE_ORDERS_URL=http://localhost:3007
PALETTE_API_URL=http://localhost:3009
PRICING_ENGINE_URL=http://localhost:3017
OPENROUTER_API_KEY=xxx
INTERNAL_SERVICE_TOKEN=xxx
```

**palette** :
```bash
AUTHZ_URL=http://localhost:3002
NOTIFICATIONS_URL=http://localhost:3004
INTERNAL_SERVICE_TOKEN=xxx
```

**admin-gateway** :
```bash
AUTHZ_URL=http://localhost:3002
CORE_ORDERS_URL=http://localhost:3007
PLANNING_URL=http://localhost:3005
VIGILANCE_URL=http://localhost:3008
NOTIFICATIONS_URL=http://localhost:3004
ECPMR_URL=http://localhost:3014
INTERNAL_SERVICE_TOKEN=xxx
```

**geo-tracking** :
```bash
CORE_ORDERS_URL=http://localhost:3007
TOMTOM_API_KEY=xxx
JWT_SECRET=xxx
```

## Authentification inter-services

### Token interne
Tous les appels entre services doivent utiliser :
```bash
INTERNAL_SERVICE_TOKEN=shared-secret-token-change-in-production
```

Header HTTP :
```
Authorization: Bearer ${INTERNAL_SERVICE_TOKEN}
```

Ou :
```
X-Internal-Service-Token: ${INTERNAL_SERVICE_TOKEN}
```

### Validation
Chaque service doit vérifier :
```javascript
const requireAuth = (req, res, options) => {
  const token = req.headers['authorization']?.replace('Bearer ', '') ||
                req.headers['x-internal-service-token'];

  if (process.env.SECURITY_ENFORCE === 'true' && !token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (token && token !== process.env.INTERNAL_SERVICE_TOKEN) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  return { authenticated: true };
};
```

## Timeout et retry

### Configuration recommandée

```javascript
const SERVICE_TIMEOUT_MS = 30000; // 30 secondes
const SERVICE_RETRY_COUNT = 3;
const SERVICE_RETRY_DELAY_MS = 1000; // 1 seconde

async function callService(url, options) {
  let lastError;

  for (let attempt = 0; attempt < SERVICE_RETRY_COUNT; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), SERVICE_TIMEOUT_MS);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeout);
      return response;

    } catch (error) {
      lastError = error;

      if (attempt < SERVICE_RETRY_COUNT - 1) {
        await new Promise(resolve =>
          setTimeout(resolve, SERVICE_RETRY_DELAY_MS * Math.pow(2, attempt))
        );
      }
    }
  }

  throw lastError;
}
```

## Circuit breaker

Pour éviter les cascades de pannes :

```javascript
const circuitBreakers = new Map();

function getCircuitBreaker(serviceUrl) {
  if (!circuitBreakers.has(serviceUrl)) {
    circuitBreakers.set(serviceUrl, {
      failures: 0,
      lastFailure: null,
      state: 'CLOSED' // CLOSED, OPEN, HALF_OPEN
    });
  }
  return circuitBreakers.get(serviceUrl);
}

async function callWithCircuitBreaker(serviceUrl, fn) {
  const breaker = getCircuitBreaker(serviceUrl);

  // Circuit OPEN : rejeter immédiatement
  if (breaker.state === 'OPEN') {
    const elapsed = Date.now() - breaker.lastFailure;
    if (elapsed < 60000) { // 1 minute
      throw new Error('Circuit breaker OPEN');
    }
    breaker.state = 'HALF_OPEN';
  }

  try {
    const result = await fn();

    // Succès : reset
    breaker.failures = 0;
    breaker.state = 'CLOSED';

    return result;

  } catch (error) {
    breaker.failures++;
    breaker.lastFailure = Date.now();

    // 5 échecs consécutifs : ouvrir le circuit
    if (breaker.failures >= 5) {
      breaker.state = 'OPEN';
      console.error(`Circuit breaker OPEN for ${serviceUrl}`);
    }

    throw error;
  }
}
```

## Tests de connectivité

Utiliser le script `scripts/check-services-health.js` :

```bash
node scripts/check-services-health.js
```

Génère un rapport HTML avec :
- Statut de chaque service
- Temps de réponse
- Dépendances validées
- Circuit breakers actifs

## Changelog

- **2025-11-18** : Création matrice complète des 17 services
- **2025-11-18** : Documentation authentification inter-services
- **2025-11-18** : Ajout timeout/retry/circuit breaker
