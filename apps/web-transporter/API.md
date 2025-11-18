# Documentation API - Web Transporter

Cette documentation décrit les endpoints API utilisés par l'application web-transporter.

## Base URLs

- Core Orders: `http://localhost:3001` (via `/api/orders`)
- Planning: `http://localhost:3004` (via `/api/planning`)
- eCMR: `http://localhost:3009` (via `/api/ecpmr`)

## Authentification

Toutes les requêtes nécessitent un token JWT dans le header :

```
Authorization: Bearer <token>
```

## Endpoints

### Core Orders Service

#### GET /carrier/orders

Récupérer les missions du transporteur.

**Query Parameters:**
- `carrierId` (required) - ID du transporteur
- `status` (required) - `pending` ou `accepted`

**Request:**
```http
GET /carrier/orders?carrierId=CARRIER-B&status=pending
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "items": [
    {
      "id": "ORD-001",
      "ref": "REF-001",
      "expiresAt": 1700000000000,
      "ship_from": "Paris",
      "ship_to": "Lyon",
      "pallets": 33,
      "weight": 5000
    }
  ]
}
```

**Error 400:**
```json
{
  "error": "carrierId requis"
}
```

---

#### POST /carrier/orders/:id/accept

Accepter une mission.

**Path Parameters:**
- `id` - ID de la commande

**Request Body:**
```json
{
  "carrierId": "CARRIER-B"
}
```

**Request:**
```http
POST /carrier/orders/ORD-001/accept
Authorization: Bearer <token>
Content-Type: application/json

{
  "carrierId": "CARRIER-B"
}
```

**Response 200:**
```json
{
  "acceptedBy": "CARRIER-B",
  "status": "ACCEPTED",
  "traceId": "trace-123"
}
```

**Error 400:**
```json
{
  "error": "carrierId invalide ou non courant",
  "current": "CARRIER-A"
}
```

**Error 404:**
```json
{
  "error": "Not Found"
}
```

---

### Planning Service

#### GET /planning/slots

Récupérer les créneaux RDV disponibles.

**Query Parameters:**
- `date` (required) - Date au format YYYY-MM-DD

**Request:**
```http
GET /planning/slots?date=2025-11-20
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "slots": [
    {
      "date": "2025-11-20",
      "time": "08:00",
      "available": true
    },
    {
      "date": "2025-11-20",
      "time": "10:00",
      "available": false
    }
  ]
}
```

---

#### POST /planning/rdv/propose

Proposer un créneau RDV pour une mission.

**Request Body:**
```json
{
  "orderId": "ORD-001",
  "date": "2025-11-20",
  "time": "08:00"
}
```

**Request:**
```http
POST /planning/rdv/propose
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "ORD-001",
  "date": "2025-11-20",
  "time": "08:00"
}
```

**Response 200:**
```json
{
  "ok": true,
  "rdvId": "RDV-123",
  "orderId": "ORD-001",
  "date": "2025-11-20",
  "time": "08:00"
}
```

**Error 400:**
```json
{
  "error": "Créneau non disponible"
}
```

---

### eCMR Service

#### POST /ecpmr/upload

Uploader un document (CMR, photo, POD).

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file` (required) - Fichier à uploader
- `orderId` (required) - ID de la commande
- `type` (required) - Type de document (`CMR`, `PHOTO`, `POD`)

**Request:**
```http
POST /ecpmr/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file=<binary>
orderId=ORD-001
type=CMR
```

**Response 200:**
```json
{
  "ok": true,
  "documentId": "DOC-123",
  "url": "https://s3.amazonaws.com/bucket/cmr-123.pdf"
}
```

**Error 400:**
```json
{
  "error": "File too large"
}
```

**Error 413:**
```json
{
  "error": "Payload too large"
}
```

---

#### GET /ecpmr/documents

Récupérer les documents d'une commande.

**Query Parameters:**
- `orderId` (required) - ID de la commande

**Request:**
```http
GET /ecpmr/documents?orderId=ORD-001
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "documents": [
    {
      "id": "DOC-123",
      "orderId": "ORD-001",
      "type": "CMR",
      "name": "cmr-ORD-001.pdf",
      "url": "https://s3.amazonaws.com/bucket/cmr-123.pdf",
      "uploadedAt": "2025-11-17T10:30:00Z"
    }
  ]
}
```

---

## Codes d'erreur

| Code | Description |
|------|-------------|
| 200 | Succès |
| 202 | Accepté (processing) |
| 400 | Requête invalide |
| 401 | Non authentifié |
| 403 | Accès refusé |
| 404 | Ressource non trouvée |
| 413 | Payload trop large |
| 429 | Trop de requêtes (rate limit) |
| 500 | Erreur serveur |

## Rate Limiting

Les requêtes sont limitées à :
- 240 requêtes par minute par IP
- 1000 requêtes par heure par utilisateur authentifié

Headers de réponse :
```
X-RateLimit-Limit: 240
X-RateLimit-Remaining: 235
X-RateLimit-Reset: 1700000000
```

## Webhooks (Future)

Les événements suivants pourront déclencher des webhooks :

- `mission.dispatched` - Nouvelle mission assignée
- `mission.accepted` - Mission acceptée
- `mission.sla_warning` - SLA bientôt expiré (T-30min)
- `mission.sla_expired` - SLA expiré
- `rdv.confirmed` - RDV confirmé
- `document.uploaded` - Document uploadé

## Types TypeScript

```typescript
// Mission
interface Mission {
  id: string;
  ref: string;
  expiresAt?: number;
  ship_from?: string;
  ship_to?: string;
  pallets?: number;
  weight?: number;
}

// RDV Slot
interface RDVSlot {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  available: boolean;
}

// Document Upload
interface DocumentUpload {
  file: File;
  orderId: string;
  type: 'CMR' | 'PHOTO' | 'POD';
}

// Document
interface Document {
  id: string;
  orderId: string;
  type: 'CMR' | 'PHOTO' | 'POD';
  name: string;
  url: string;
  uploadedAt: string; // ISO 8601
}

// JWT Payload
interface JWTPayload {
  carrierId: string;
  name?: string;
  email?: string;
  exp?: number; // Unix timestamp
}
```

## Exemples cURL

### Récupérer les missions en attente
```bash
curl -X GET \
  'http://localhost:3001/carrier/orders?carrierId=CARRIER-B&status=pending' \
  -H 'Authorization: Bearer eyJ...'
```

### Accepter une mission
```bash
curl -X POST \
  'http://localhost:3001/carrier/orders/ORD-001/accept' \
  -H 'Authorization: Bearer eyJ...' \
  -H 'Content-Type: application/json' \
  -d '{"carrierId":"CARRIER-B"}'
```

### Uploader un CMR
```bash
curl -X POST \
  'http://localhost:3009/ecpmr/upload' \
  -H 'Authorization: Bearer eyJ...' \
  -F 'file=@cmr.pdf' \
  -F 'orderId=ORD-001' \
  -F 'type=CMR'
```

## Notes de développement

### Gestion des erreurs
- Toujours vérifier le status code HTTP
- Parser le JSON de la réponse pour les détails d'erreur
- Afficher des messages utilisateur conviviaux

### Performance
- Utiliser le cache HTTP (headers `Cache-Control`)
- Implémenter le debouncing pour les recherches
- Pagination pour les grandes listes

### Sécurité
- Toujours envoyer le token JWT
- Ne jamais logger les tokens
- Valider les données côté client ET serveur
- Limiter la taille des uploads
