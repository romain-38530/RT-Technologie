# Architecture de Connexion RT-Technologie

## Vue d'ensemble

RT-Technologie est une plateforme logistique modulaire composée de **briques indépendantes** qui communiquent via des **APIs HTTP/REST standardisées**.

```
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATIONS WEB (Frontend)                   │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│  Industry    │ Transporter  │ Logistician  │ Forwarder          │
│  (port 3010) │ (port 3100)  │ (port 3106)  │ (port 4002)        │
├──────────────┼──────────────┼──────────────┼────────────────────┤
│  Supplier    │  Recipient   │              │                    │
│  (port 3103) │ (port 3102)  │              │                    │
└──────────────┴──────────────┴──────────────┴────────────────────┘
                              │
                              │ HTTP/REST
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  SERVICES BACKEND (Microservices)                │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│ core-orders  │  planning    │  affret-ia   │  vigilance         │
│ (port 3001)  │ (port 3004)  │ (port 3005)  │ (port 3006)        │
├──────────────┼──────────────┼──────────────┼────────────────────┤
│    authz     │ notifications│    ecpmr     │  admin-gateway     │
│ (port 3007)  │ (port 3002)  │ (port 3009)  │ (port 3008)        │
└──────────────┴──────────────┴──────────────┴────────────────────┘
                              │
                              ▼
                      ┌───────────────┐
                      │   MongoDB     │
                      │  (Atlas)      │
                      └───────────────┘
```

---

## Principes de conception

### 1. Indépendance des briques
- Chaque application web est **autonome** (peut être développée/déployée séparément)
- Chaque service backend est **stateless** (horizontal scaling possible)
- Pas de dépendances directes entre applications frontend

### 2. Communication via API
- **Protocol** : HTTP/1.1 (JSON)
- **Pattern** : REST avec verbes standard (GET, POST, PUT, DELETE)
- **Auth** : JWT Bearer Token (service authz)
- **Tracing** : Header `x-trace-id` pour tracer les requêtes

### 3. Contrats API
- Schémas OpenAPI documentés dans `packages/contracts/`
- Types TypeScript partagés
- Versioning des APIs (future : `/v1/`, `/v2/`)

---

## Matrice de connexion

### Applications Frontend → Services Backend

| Application | core-orders | planning | affret-ia | authz | notifications | ecpmr | vigilance |
|-------------|-------------|----------|-----------|-------|---------------|-------|-----------|
| **web-industry** | ✅ Principale | ✅ RDV | ✅ Cotations | ✅ Auth | ✅ Emails | ❌ | ✅ Check transporteurs |
| **web-transporter** | ✅ Missions | ✅ RDV | ❌ | ✅ Auth | ❌ | ✅ Upload docs | ❌ |
| **web-logistician** | ✅ Statuts | ✅ Quais | ❌ | ✅ Auth | ❌ | ✅ E-CMR | ❌ |
| **web-forwarder** | ❌ | ❌ | ✅ Principale | ✅ Auth | ❌ | ❌ | ❌ |
| **web-supplier** | ✅ Pickups | ✅ Créneaux | ❌ | ✅ Auth | ✅ Push | ❌ | ❌ |
| **web-recipient** | ✅ Livraisons | ✅ Créneaux | ❌ | ✅ Auth | ❌ | ✅ Signature | ❌ |

---

## Flux de données par use case

### Use Case 1 : Import et Dispatch d'une commande

```
┌─────────────┐
│  Industry   │
│  (Web)      │
└──────┬──────┘
       │ 1. POST /industry/orders/import
       ▼
┌─────────────┐
│core-orders  │───────┐
│ (Service)   │       │ 2. Check vigilance
└──────┬──────┘       ▼
       │         ┌──────────┐
       │         │vigilance │
       │         └──────────┘
       │ 3. POST /industry/orders/:id/dispatch
       ▼
┌─────────────┐
│core-orders  │───────┐
│             │       │ 4. Si aucun transporteur → Escalade
└─────────────┘       ▼
              ┌──────────────┐
              │  affret-ia   │
              │              │
              └──────────────┘
```

**Headers requis** :
- `Authorization: Bearer <JWT>`
- `x-trace-id: <uuid>` (optionnel)

**Exemple requête** :
```bash
curl -X POST http://localhost:3001/industry/orders/import \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '[{
    "id": "ORD-001",
    "ownerOrgId": "IND-1",
    "ship_from": "Paris",
    "ship_to": "Lyon",
    "pallets": 20,
    "weight": 5000
  }]'
```

---

### Use Case 2 : Acceptation d'une mission par le transporteur

```
┌─────────────┐
│Transporter  │
│  (Web)      │
└──────┬──────┘
       │ 1. GET /carrier/orders?carrierId=B&status=pending
       ▼
┌─────────────┐
│core-orders  │
└──────┬──────┘
       │ 2. POST /carrier/orders/:id/accept
       ▼
┌─────────────┐
│core-orders  │───────┐
│             │       │ 3. Notification email
└─────────────┘       ▼
              ┌──────────────┐
              │notifications │
              └──────────────┘
```

**Exemple requête** :
```bash
curl -X POST http://localhost:3001/carrier/orders/ORD-001/accept \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{"carrierId": "B"}'
```

---

### Use Case 3 : Cotation AI par Affret.IA

```
┌─────────────┐
│ Forwarder   │
│  (Web)      │
└──────┬──────┘
       │ 1. GET /affret-ia/quote/:orderId
       ▼
┌─────────────┐
│ affret-ia   │───────┐
│             │       │ 2. Lookup prix grille
└──────┬──────┘       │
       │              │
       │ 3. Appel OpenRouter (gpt-4o-mini)
       ▼              │
┌─────────────┐       │
│ OpenRouter  │       │
│   (API)     │       │
└──────┬──────┘       │
       │              │
       │ 4. Retour cotation AI + prix grille
       ▼              ▼
┌─────────────────────┐
│   Forwarder (Web)   │
│  Compare AI vs Ref  │
└─────────────────────┘
```

**Exemple requête** :
```bash
curl -X GET http://localhost:3005/affret-ia/quote/ORD-001 \
  -H "Authorization: Bearer eyJhbGc..."
```

**Réponse** :
```json
{
  "orderId": "ORD-001",
  "price": 950,
  "currency": "EUR",
  "suggestedCarriers": ["A", "B"],
  "priceRef": {
    "price": 900,
    "currency": "EUR",
    "mode": "FTL"
  }
}
```

---

### Use Case 4 : Signature E-CMR par le destinataire

```
┌─────────────┐
│ Recipient   │
│  (Web)      │
└──────┬──────┘
       │ 1. Contrôle réception (palettes, état)
       │ 2. Capture photos si anomalies
       │ 3. Signature Canvas HTML5
       ▼
┌─────────────┐
│    ecpmr    │───────┐
│ (Service)   │       │ 4. Upload vers S3
└──────┬──────┘       ▼
       │         ┌──────────┐
       │         │   AWS    │
       │         │    S3    │
       │         └──────────┘
       │ 5. Notification Industry
       ▼
┌──────────────┐
│notifications │
└──────────────┘
```

**Exemple requête** :
```bash
curl -X POST http://localhost:3009/ecpmr/sign \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORD-001",
    "recipientName": "Jean Dupont",
    "signature": "data:image/png;base64,iVBORw0KGgo...",
    "anomalies": ["DAMAGED_PALLET"],
    "photos": ["data:image/jpeg;base64,/9j/4AAQ..."]
  }'
```

---

## Variables d'environnement de connexion

### Applications Frontend

Toutes les applications web utilisent ces variables :

```env
# URLs des services backend
NEXT_PUBLIC_API_URL=http://localhost:3001        # core-orders
NEXT_PUBLIC_PLANNING_URL=http://localhost:3004   # planning
NEXT_PUBLIC_AFFRET_IA_URL=http://localhost:3005  # affret-ia
NEXT_PUBLIC_AUTHZ_URL=http://localhost:3007      # authz
NEXT_PUBLIC_ECPMR_URL=http://localhost:3009      # ecpmr

# Authentification
NEXT_PUBLIC_JWT_SECRET=your-jwt-secret

# Organisation par défaut (optionnel)
NEXT_PUBLIC_DEFAULT_ORG_ID=IND-1
```

### Services Backend

Chaque service peut communiquer avec d'autres services :

```env
# Inter-service authentication
INTERNAL_SERVICE_TOKEN=your-service-token

# URLs d'autres services
CORE_ORDERS_URL=http://localhost:3001
PLANNING_URL=http://localhost:3004
AFFRET_IA_URL=http://localhost:3005
VIGILANCE_URL=http://localhost:3006
AUTHZ_URL=http://localhost:3007
NOTIFICATIONS_URL=http://localhost:3002
ECPMR_URL=http://localhost:3009

# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/rt-technologie

# External APIs
OPENROUTER_API_KEY=sk-or-...
MAILGUN_API_KEY=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

---

## Sécurité et authentification

### Flux d'authentification

```
┌─────────────┐
│  User       │
│  (Browser)  │
└──────┬──────┘
       │ 1. POST /auth/login (email, password)
       ▼
┌─────────────┐
│   authz     │
│ (Service)   │
└──────┬──────┘
       │ 2. Retour JWT
       ▼
┌─────────────┐
│  Browser    │
│  localStorage│
└──────┬──────┘
       │ 3. Requêtes suivantes avec
       │    Authorization: Bearer <JWT>
       ▼
┌─────────────┐
│  Services   │
│  Backend    │
└─────────────┘
```

### Format JWT

```json
{
  "sub": "user-123",
  "email": "jean@rt-technologie.com",
  "orgId": "IND-1",
  "role": "industry.manager",
  "exp": 1735689600
}
```

### Middleware de sécurité (tous les services)

Fichier : `packages/security/src/index.js`

```javascript
const { requireAuth } = require('@rt/security');

// Dans chaque service :
const authResult = requireAuth(req, res, { optionalEnv: 'SECURITY_ENFORCE' });
if (authResult === null) return; // 401 déjà envoyé

// authResult.claims contient le payload JWT
const userId = authResult.claims.sub;
const orgId = authResult.claims.orgId;
```

---

## Gestion des erreurs

### Format de réponse d'erreur standardisé

```json
{
  "error": "order_not_found",
  "detail": "La commande ORD-999 n'existe pas",
  "traceId": "abc123-def456-ghi789"
}
```

### Codes HTTP utilisés

| Code | Signification | Usage |
|------|---------------|-------|
| 200 | OK | Requête réussie |
| 201 | Created | Ressource créée |
| 202 | Accepted | Requête acceptée (traitement async) |
| 400 | Bad Request | Données invalides |
| 401 | Unauthorized | JWT manquant/invalide |
| 402 | Payment Required | Feature nécessite upgrade plan |
| 403 | Forbidden | Accès refusé (entitlements) |
| 404 | Not Found | Ressource inexistante |
| 429 | Too Many Requests | Rate limit dépassé |
| 500 | Internal Server Error | Erreur serveur |
| 502 | Bad Gateway | Service externe indisponible |

---

## Rate Limiting

Tous les services implémentent un rate limiter (package `@rt/security`) :

- **Fenêtre** : 60 secondes (configurable)
- **Limite** : 240 requêtes/minute par IP (configurable)

Configuration :
```javascript
const limiter = rateLimiter({
  windowMs: 60000,  // 1 minute
  max: 240          // 240 requêtes max
});
```

---

## Monitoring et Tracing

### Header x-trace-id

Toutes les requêtes peuvent inclure un header `x-trace-id` pour tracer les appels à travers les services :

```bash
curl -X POST http://localhost:3001/industry/orders/import \
  -H "x-trace-id: req-abc123-def456" \
  -d '...'
```

Le service retourne le même traceId dans la réponse :

```json
{
  "imported": ["ORD-001"],
  "traceId": "req-abc123-def456"
}
```

### Logs structurés

Format recommandé (à implémenter) :

```json
{
  "timestamp": "2025-01-17T10:30:00Z",
  "level": "info",
  "service": "core-orders",
  "traceId": "req-abc123",
  "event": "order.dispatched",
  "orderId": "ORD-001",
  "carrierId": "B"
}
```

---

## Déploiement

### Développement local

```bash
# Terminal 1 - Tous les services backend
pnpm agents

# Terminal 2 - Application web-industry
pnpm --filter @rt/web-industry dev

# Terminal 3 - Application web-transporter
pnpm --filter @rt/web-transporter dev

# ... etc pour chaque application
```

### Production (Render.com)

Configuration dans `render.yaml` :

- Chaque service backend est un **Web Service** indépendant
- Chaque application frontend est un **Static Site** (ou Web Service avec SSR)
- Variables d'environnement configurées dans le dashboard Render
- Auto-deploy sur push vers `main`

### Docker Compose (local)

```yaml
version: '3.8'
services:
  core-orders:
    build: ./services/core-orders
    ports: ["3001:3001"]
    environment:
      - MONGODB_URI=mongodb://mongo:27017/rt-technologie

  planning:
    build: ./services/planning
    ports: ["3004:3004"]

  web-industry:
    build: ./apps/web-industry
    ports: ["3010:3010"]
    environment:
      - NEXT_PUBLIC_API_URL=http://core-orders:3001
```

---

## Évolutions futures

### v2 : Event-Driven Architecture

Remplacer les appels HTTP synchrones par un bus d'événements (RabbitMQ, Kafka) :

```
┌─────────────┐
│core-orders  │─────► order.created ─────► ┌──────────────┐
└─────────────┘                             │  Event Bus   │
                                            └──────┬───────┘
┌─────────────┐                                    │
│notifications│◄──── order.created ────────────────┘
└─────────────┘
```

### v3 : API Gateway

Centraliser toutes les routes derrière un API Gateway (Kong, Tyk) :

```
┌─────────────┐
│  Frontend   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│API Gateway  │──► Routing, Auth, Rate Limiting
│ (Kong/Tyk)  │
└──────┬──────┘
       │
       ├──► core-orders
       ├──► planning
       ├──► affret-ia
       └──► ...
```

### v4 : GraphQL

Offrir une API GraphQL fédérée pour les frontends :

```graphql
query GetOrderWithCarrier {
  order(id: "ORD-001") {
    id
    status
    assignedCarrier {
      name
      scoring
      vigilanceStatus
    }
    planning {
      rdvDate
      dockId
    }
  }
}
```

---

## Résumé des ports

| Service/App | Port | URL locale |
|-------------|------|------------|
| **core-orders** | 3001 | http://localhost:3001 |
| **notifications** | 3002 | http://localhost:3002 |
| **planning** | 3004 | http://localhost:3004 |
| **affret-ia** | 3005 | http://localhost:3005 |
| **vigilance** | 3006 | http://localhost:3006 |
| **authz** | 3007 | http://localhost:3007 |
| **admin-gateway** | 3008 | http://localhost:3008 |
| **ecpmr** | 3009 | http://localhost:3009 |
| **web-industry** | 3010 | http://localhost:3010 |
| **web-transporter** | 3100 | http://localhost:3100 |
| **web-recipient** | 3102 | http://localhost:3102 |
| **web-supplier** | 3103 | http://localhost:3103 |
| **web-logistician** | 3106 | http://localhost:3106 |
| **web-forwarder** | 4002 | http://localhost:4002 |

---

## Support

Pour toute question sur l'architecture de connexion, consulter :
- Ce document (`docs/ARCHITECTURE_CONNEXIONS.md`)
- Documentation OpenAPI : `packages/contracts/`
- README de chaque application/service

**L'architecture est conçue pour être modulaire, scalable et maintenable ! 🚀**
