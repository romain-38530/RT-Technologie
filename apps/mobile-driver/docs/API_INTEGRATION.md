# Documentation API - RT Driver

## Vue d'ensemble

L'application RT Driver communique avec plusieurs microservices backend pour gérer les missions, le tracking GPS, les signatures électroniques et les documents.

## Services Backend

| Service | Port | Description |
|---------|------|-------------|
| Core Orders | 3001 | Gestion des missions et commandes |
| Planning | 3004 | Planning et tournées |
| Geo-Tracking | 3016 | Tracking GPS temps réel, géofencing et calcul d'ETA |
| eCMR | 3009 | Signatures électroniques et documents |
| Notifications | 3002 | Notifications push |

## Authentification

### Headers requis

Toutes les requêtes API (sauf login) doivent inclure :

```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Login (Conducteur Salarié)

**Endpoint**
```http
POST /auth/login
```

**Request Body**
```json
{
  "email": "jean.dupont@example.com",
  "password": "SecurePassword123"
}
```

**Response 200**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": "usr_123",
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "jean.dupont@example.com",
    "type": "EMPLOYEE",
    "phone": "+33612345678"
  },
  "expiresIn": 3600
}
```

### Accès par QR Code (Sous-traitant)

**Endpoint**
```http
POST /driver/missions/start
```

**Request Body**
```json
{
  "code": "ABC-123-XYZ",
  "driverInfo": {
    "name": "Pierre Martin",
    "phone": "+33687654321",
    "vehicleRegistration": "AB-123-CD",
    "trailerRegistration": "EF-456-GH"
  }
}
```

**Response 200**
```json
{
  "token": "temp_token_for_mission_duration",
  "mission": { /* Mission object */ },
  "expiresAt": "2024-01-15T18:00:00Z"
}
```

## API Core Orders (Port 3001)

### Récupérer une mission par code

**Endpoint**
```http
GET /driver/missions/code/:code
```

**Paramètres**
- `code` : Code mission (ex: ABC-123-XYZ)

**Response 200**
```json
{
  "id": "msn_789",
  "code": "ABC-123-XYZ",
  "status": "PENDING",
  "driver": {
    "id": "drv_456",
    "firstName": "Jean",
    "lastName": "Dupont",
    "phone": "+33612345678",
    "type": "EMPLOYEE"
  },
  "vehicle": {
    "registration": "AB-123-CD",
    "trailerRegistration": "EF-456-GH",
    "type": "SEMI_TRAILER"
  },
  "loadingPoint": {
    "id": "loc_001",
    "name": "Entrepôt Central Paris",
    "address": "123 Rue de la Logistique",
    "city": "Paris",
    "postalCode": "75001",
    "country": "FR",
    "coordinates": {
      "latitude": 48.8566,
      "longitude": 2.3522
    },
    "contacts": [
      {
        "name": "Marie Martin",
        "role": "Responsable Quai",
        "phone": "+33145678901",
        "email": "marie.martin@warehouse.com"
      }
    ],
    "instructions": "Présenter le bon de commande au quai 3. Code d'accès: 1234",
    "dockNumber": "3",
    "geofenceRadius": 200
  },
  "deliveryPoint": {
    "id": "loc_002",
    "name": "Usine Lyon",
    "address": "456 Avenue de l'Industrie",
    "city": "Lyon",
    "postalCode": "69000",
    "country": "FR",
    "coordinates": {
      "latitude": 45.7640,
      "longitude": 4.8357
    },
    "contacts": [
      {
        "name": "Luc Durand",
        "role": "Réception",
        "phone": "+33478901234"
      }
    ],
    "instructions": "Livraison entre 14h et 16h uniquement",
    "geofenceRadius": 200
  },
  "cargo": {
    "description": "Palettes de marchandise sèche",
    "weight": 15000,
    "volume": 33,
    "pallets": 22,
    "dangerousGoods": false,
    "temperature": null
  },
  "timestamps": {
    "created": "2024-01-15T08:00:00Z",
    "scheduledLoadingStart": "2024-01-15T09:00:00Z",
    "scheduledLoadingEnd": "2024-01-15T11:00:00Z",
    "scheduledDeliveryStart": "2024-01-15T14:00:00Z",
    "scheduledDeliveryEnd": "2024-01-15T16:00:00Z"
  },
  "tracking": {
    "currentPosition": null,
    "eta": null,
    "distance": null,
    "lastUpdate": null
  }
}
```

### Récupérer la mission en cours

**Endpoint**
```http
GET /driver/missions/current
```

**Response 200**
```json
{
  // Mission object ou null si aucune mission en cours
}
```

### Mettre à jour le statut de la mission

**Endpoint**
```http
POST /driver/missions/:id/status
```

**Request Body**
```json
{
  "status": "ARRIVED_LOADING",
  "latitude": 48.8566,
  "longitude": 2.3522,
  "timestamp": "2024-01-15T09:30:00Z",
  "remarks": "Arrivé avec 15 min d'avance"
}
```

**Statuts possibles**
- `PENDING`
- `EN_ROUTE_TO_LOADING`
- `ARRIVED_LOADING`
- `LOADED`
- `EN_ROUTE_TO_DELIVERY`
- `ARRIVED_DELIVERY`
- `DELIVERED`
- `CANCELLED`

**Response 200**
```json
{
  "success": true,
  "mission": { /* Mission mise à jour */ }
}
```

### Ajouter des remarques/réserves

**Endpoint**
```http
POST /driver/missions/:id/remarks
```

**Request Body**
```json
{
  "remarks": "3 palettes endommagées",
  "photos": ["photo_url_1", "photo_url_2"],
  "timestamp": "2024-01-15T14:30:00Z"
}
```

**Response 200**
```json
{
  "success": true,
  "remarkId": "rmk_123"
}
```

### Historique des missions

**Endpoint**
```http
GET /driver/missions/history/:driverId
```

**Query Parameters**
- `limit` : Nombre de missions (défaut: 20)
- `offset` : Pagination (défaut: 0)
- `status` : Filtrer par statut (optionnel)

**Response 200**
```json
{
  "missions": [
    { /* Mission 1 */ },
    { /* Mission 2 */ }
  ],
  "total": 145,
  "limit": 20,
  "offset": 0
}
```

## API Geo-Tracking (Port 3016)

### Envoyer une position GPS

**Endpoint**
```http
POST /geo-tracking/positions
```

**Request Body**
```json
{
  "orderId": "ORD-2024-001",
  "latitude": 48.8566,
  "longitude": 2.3522,
  "timestamp": "2024-11-18T10:30:00Z",
  "accuracy": 10,
  "speed": 60,
  "heading": 180
}
```

**Response 200**
```json
{
  "success": true,
  "positionId": "673ab456...",
  "geofenceEvent": {
    "type": "ARRIVAL_PICKUP",
    "detectedAt": "2024-11-18T10:30:00Z",
    "location": {
      "latitude": 48.8566,
      "longitude": 2.3522,
      "name": "Entrepôt Paris Nord",
      "address": "123 Rue de..."
    },
    "automatic": true
  },
  "eta": {
    "arrivalTime": "2024-11-18T11:00:00Z",
    "durationMinutes": 30,
    "distanceKm": 25.5,
    "trafficDelay": 5,
    "confidence": "HIGH"
  }
}
```

### Récupérer l'historique des positions

**Endpoint**
```http
GET /geo-tracking/positions/:orderId
```

**Query Parameters**
- `from` : Date de début (ISO 8601)
- `to` : Date de fin (ISO 8601)
- `limit` : Nombre maximum de positions (défaut: 100)

**Response 200**
```json
{
  "orderId": "ORD-2024-001",
  "positions": [
    {
      "id": "673ab...",
      "latitude": 48.8566,
      "longitude": 2.3522,
      "timestamp": "2024-11-18T10:30:00Z",
      "accuracy": 10,
      "speed": 60,
      "heading": 180
    }
  ],
  "totalCount": 245
}
```

### Calculer l'ETA

**Endpoint**
```http
GET /geo-tracking/eta/:orderId
```

**Query Parameters**
- `currentLat` : Latitude actuelle (obligatoire)
- `currentLon` : Longitude actuelle (obligatoire)

**Response 200**
```json
{
  "orderId": "ORD-2024-001",
  "destination": {
    "latitude": 48.8738,
    "longitude": 2.2950,
    "name": "Client ABC"
  },
  "eta": {
    "arrivalTime": "2024-11-18T11:00:00Z",
    "durationMinutes": 30,
    "distanceKm": 25.5,
    "trafficDelay": 5,
    "confidence": "HIGH"
  }
}
```

**Note:** Le calcul d'ETA utilise l'API TomTom Traffic pour tenir compte du trafic temps réel. Si TomTom n'est pas disponible, un calcul simple est effectué (vitesse moyenne 60 km/h).

### Récupérer les événements de géofencing

**Endpoint**
```http
GET /geo-tracking/geofence/events/:orderId
```

**Response 200**
```json
{
  "orderId": "ORD-2024-001",
  "events": [
    {
      "type": "ARRIVAL_PICKUP",
      "detectedAt": "2024-11-18T10:30:00Z",
      "location": {
        "latitude": 48.8566,
        "longitude": 2.3522,
        "name": "Entrepôt Paris Nord"
      },
      "automatic": true
    },
    {
      "type": "DEPARTURE_PICKUP",
      "detectedAt": "2024-11-18T11:00:00Z",
      "location": {
        "latitude": 48.8566,
        "longitude": 2.3522,
        "name": "Entrepôt Paris Nord"
      },
      "automatic": true
    }
  ]
}
```

**Types d'événements:**
- `ARRIVAL_PICKUP` : Arrivée au point de chargement (rayon 200m)
- `DEPARTURE_PICKUP` : Départ du point de chargement
- `ARRIVAL_DELIVERY` : Arrivée au point de livraison (rayon 200m)
- `DEPARTURE_DELIVERY` : Départ du point de livraison

**Détection automatique:**
Le service détecte automatiquement l'entrée/sortie des zones de géofencing (200m de rayon). Lorsqu'un événement est détecté, le statut de la commande est mis à jour automatiquement.

### Configuration tracking GPS

**Paramètres recommandés:**
```typescript
{
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 5000,
  trackingInterval: 15000  // 15 secondes
}
```

**Utilisation avec tracking.ts:**
```typescript
import { trackingApi } from '@/lib/api/tracking';

// Envoyer position GPS toutes les 15s
const position = await trackingApi.sendPosition({
  orderId: mission.id,
  latitude: currentPosition.latitude,
  longitude: currentPosition.longitude,
  accuracy: currentPosition.accuracy,
  timestamp: new Date().toISOString(),
  speed: currentPosition.speed,
  heading: currentPosition.heading,
});

// Vérifier si événement géofencing détecté
if (position.geofenceEvent) {
  console.log('Événement détecté:', position.geofenceEvent.type);
  // Mettre à jour l'UI
}

// Afficher l'ETA
if (position.eta) {
  console.log(`ETA: ${position.eta.durationMinutes} minutes`);
}
```

**Sync offline:**
```typescript
import { trackingApi } from '@/lib/api/tracking';

// Récupérer positions en attente depuis IndexedDB
const pendingPositions = await getOfflinePositions();

// Envoyer en batch
await trackingApi.sendGPSBatch(pendingPositions);
```

## API Planning (Port 3004)

### Envoyer une position GPS

**Endpoint**
```http
POST /driver/tracking/gps
```

**Request Body**
```json
{
  "missionId": "msn_789",
  "latitude": 48.8566,
  "longitude": 2.3522,
  "accuracy": 5.2,
  "timestamp": "2024-01-15T10:15:30Z",
  "speed": 45.5,
  "heading": 180
}
```

**Response 200**
```json
{
  "success": true,
  "received": "2024-01-15T10:15:31Z"
}
```

### Envoyer un batch de positions GPS (sync offline)

**Endpoint**
```http
POST /driver/tracking/gps/batch
```

**Request Body**
```json
{
  "positions": [
    {
      "missionId": "msn_789",
      "latitude": 48.8566,
      "longitude": 2.3522,
      "accuracy": 5.2,
      "timestamp": "2024-01-15T10:15:30Z",
      "speed": 45.5,
      "heading": 180
    },
    {
      "missionId": "msn_789",
      "latitude": 48.8577,
      "longitude": 2.3533,
      "accuracy": 4.8,
      "timestamp": "2024-01-15T10:15:45Z",
      "speed": 48.2,
      "heading": 175
    }
  ]
}
```

**Response 200**
```json
{
  "success": true,
  "received": 2,
  "failed": 0
}
```

### Calculer l'ETA

**Endpoint**
```http
POST /driver/eta/:missionId
```

**Request Body**
```json
{
  "currentPosition": {
    "latitude": 48.8566,
    "longitude": 2.3522
  },
  "destination": {
    "latitude": 45.7640,
    "longitude": 4.8357
  }
}
```

**Response 200**
```json
{
  "eta": "2024-01-15T14:25:00Z",
  "distance": 465000,
  "duration": 14700,
  "trafficDelay": 300,
  "route": {
    "summary": "A6 puis A7",
    "tolls": true,
    "estimatedCost": 35.50
  }
}
```

### Vérifier le géofencing

**Endpoint**
```http
POST /driver/geofence/:missionId
```

**Request Body**
```json
{
  "position": {
    "latitude": 48.8566,
    "longitude": 2.3522
  }
}
```

**Response 200**
```json
{
  "inLoadingZone": true,
  "inDeliveryZone": false,
  "nearestZone": "loading",
  "distance": 45.2,
  "statusSuggestion": "ARRIVED_LOADING"
}
```

## API eCMR (Port 3009)

### Sauvegarder signature chargement

**Endpoint**
```http
POST /ecmr/signature/logistics
```

**Request Body**
```json
{
  "missionId": "msn_789",
  "signatureData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA...",
  "signerName": "Marie Martin",
  "type": "LOADING",
  "latitude": 48.8566,
  "longitude": 2.3522,
  "timestamp": "2024-01-15T10:30:00Z",
  "remarks": "Chargement conforme"
}
```

**Response 200**
```json
{
  "id": "sig_456",
  "missionId": "msn_789",
  "type": "LOADING",
  "signatureUrl": "https://storage.rt.com/signatures/sig_456.png",
  "signerName": "Marie Martin",
  "timestamp": "2024-01-15T10:30:00Z",
  "location": {
    "latitude": 48.8566,
    "longitude": 2.3522
  },
  "verified": true
}
```

### Sauvegarder signature livraison

**Endpoint**
```http
POST /ecmr/signature/recipient
```

**Request Body**
```json
{
  "missionId": "msn_789",
  "signatureData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA...",
  "signerName": "Luc Durand",
  "type": "DELIVERY",
  "latitude": 45.7640,
  "longitude": 4.8357,
  "timestamp": "2024-01-15T14:45:00Z",
  "remarks": "Livraison conforme",
  "photos": ["photo_url_1"]
}
```

**Response 200**
```json
{
  "id": "sig_789",
  "missionId": "msn_789",
  "type": "DELIVERY",
  "signatureUrl": "https://storage.rt.com/signatures/sig_789.png",
  "signerName": "Luc Durand",
  "timestamp": "2024-01-15T14:45:00Z",
  "verified": true
}
```

### Générer le QR code signature destinataire

**Endpoint**
```http
GET /ecmr/recipient-qr/:missionId
```

**Response 200**
```json
{
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA...",
  "url": "https://sign.rt.com/missions/msn_789/sign",
  "expiresAt": "2024-01-15T18:00:00Z"
}
```

### Upload document

**Endpoint**
```http
POST /driver/missions/:missionId/documents
```

**Request** (multipart/form-data)
```
file: [binary file data]
type: BL
metadata: {"latitude":45.7640,"longitude":4.8357,"timestamp":"2024-01-15T14:50:00Z"}
```

**Response 200**
```json
{
  "id": "doc_321",
  "type": "BL",
  "url": "https://storage.rt.com/documents/doc_321.pdf",
  "uploadedAt": "2024-01-15T14:50:05Z",
  "uploadedBy": "drv_456",
  "metadata": {
    "latitude": 45.7640,
    "longitude": 4.8357,
    "timestamp": "2024-01-15T14:50:00Z"
  },
  "size": 245678,
  "mimeType": "image/jpeg"
}
```

### Récupérer documents d'une mission

**Endpoint**
```http
GET /driver/missions/:missionId/documents
```

**Response 200**
```json
{
  "documents": [
    {
      "id": "doc_321",
      "type": "BL",
      "url": "https://storage.rt.com/documents/doc_321.pdf",
      "uploadedAt": "2024-01-15T14:50:05Z",
      "uploadedBy": "drv_456"
    },
    {
      "id": "doc_322",
      "type": "CMR",
      "url": "https://storage.rt.com/documents/doc_322.pdf",
      "uploadedAt": "2024-01-15T15:00:12Z",
      "uploadedBy": "drv_456"
    }
  ]
}
```

### Générer le CMR PDF

**Endpoint**
```http
POST /ecmr/generate/:missionId
```

**Response 200**
```json
{
  "url": "https://storage.rt.com/cmr/msn_789_cmr.pdf",
  "generatedAt": "2024-01-15T15:05:00Z",
  "pages": 2,
  "size": 345678
}
```

## API Notifications (Port 3002)

### Envoyer une notification push

**Endpoint**
```http
POST /notifications/push
```

**Request Body**
```json
{
  "userId": "drv_456",
  "title": "Nouveau message",
  "body": "Le logisticien a envoyé un message",
  "data": {
    "type": "CHAT_MESSAGE",
    "missionId": "msn_789"
  },
  "priority": "high"
}
```

**Response 200**
```json
{
  "success": true,
  "notificationId": "ntf_999",
  "sentAt": "2024-01-15T15:10:00Z"
}
```

## Gestion des erreurs

### Codes de statut HTTP

| Code | Signification | Action |
|------|---------------|--------|
| 200 | OK | Requête réussie |
| 201 | Created | Ressource créée |
| 400 | Bad Request | Vérifier les paramètres |
| 401 | Unauthorized | Token invalide ou expiré |
| 403 | Forbidden | Accès refusé |
| 404 | Not Found | Ressource introuvable |
| 422 | Unprocessable Entity | Données invalides |
| 429 | Too Many Requests | Rate limit dépassé |
| 500 | Internal Server Error | Erreur serveur |
| 503 | Service Unavailable | Service temporairement indisponible |

### Format d'erreur standard

```json
{
  "error": {
    "code": "MISSION_NOT_FOUND",
    "message": "La mission ABC-123-XYZ n'existe pas",
    "details": {
      "code": "ABC-123-XYZ"
    },
    "timestamp": "2024-01-15T15:15:00Z"
  }
}
```

### Codes d'erreur métier

| Code | Description |
|------|-------------|
| `MISSION_NOT_FOUND` | Mission introuvable |
| `MISSION_ALREADY_STARTED` | Mission déjà démarrée |
| `INVALID_STATUS_TRANSITION` | Transition de statut invalide |
| `GEOFENCE_VIOLATION` | Position hors de la zone autorisée |
| `SIGNATURE_REQUIRED` | Signature manquante |
| `DOCUMENT_TOO_LARGE` | Document trop volumineux (> 10MB) |
| `INVALID_COORDINATES` | Coordonnées GPS invalides |

## Rate Limiting

### Limites par endpoint

| Endpoint | Limite | Fenêtre |
|----------|--------|---------|
| GPS Tracking | 1000 req/min | Par conducteur |
| Autres endpoints | 100 req/min | Par conducteur |
| Upload documents | 20 req/min | Par conducteur |

### Header de réponse

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1642255200
```

## Webhooks (Optionnel)

L'application peut s'abonner à des webhooks pour recevoir des notifications en temps réel.

### Événements disponibles

- `mission.status_changed`
- `mission.assigned`
- `signature.received`
- `document.uploaded`
- `geofence.entered`
- `geofence.exited`

### Format d'événement

```json
{
  "event": "mission.status_changed",
  "timestamp": "2024-01-15T15:20:00Z",
  "data": {
    "missionId": "msn_789",
    "oldStatus": "EN_ROUTE_TO_LOADING",
    "newStatus": "ARRIVED_LOADING",
    "changedBy": "drv_456"
  }
}
```

## Environnements

### Développement
```
NEXT_PUBLIC_CORE_ORDERS_API=http://localhost:3001
NEXT_PUBLIC_PLANNING_API=http://localhost:3004
NEXT_PUBLIC_GEO_TRACKING_URL=http://localhost:3016
NEXT_PUBLIC_ECMR_API=http://localhost:3009
NEXT_PUBLIC_NOTIFICATIONS_API=http://localhost:3002
```

### Staging
```
NEXT_PUBLIC_CORE_ORDERS_API=https://api-staging.rt.com/orders
NEXT_PUBLIC_PLANNING_API=https://api-staging.rt.com/planning
NEXT_PUBLIC_GEO_TRACKING_URL=https://api-staging.rt.com/tracking
NEXT_PUBLIC_ECMR_API=https://api-staging.rt.com/ecmr
NEXT_PUBLIC_NOTIFICATIONS_API=https://api-staging.rt.com/notifications
```

### Production
```
NEXT_PUBLIC_CORE_ORDERS_API=https://api.rt.com/orders
NEXT_PUBLIC_PLANNING_API=https://api.rt.com/planning
NEXT_PUBLIC_GEO_TRACKING_URL=https://api.rt.com/tracking
NEXT_PUBLIC_ECMR_API=https://api.rt.com/ecmr
NEXT_PUBLIC_NOTIFICATIONS_API=https://api.rt.com/notifications
```

## Sécurité

### CORS

Les endpoints API acceptent les requêtes depuis :
- `https://driver.rt.com` (PWA production)
- `http://localhost:3110` (PWA développement)
- Applications mobiles natives (Android/iOS)

### Tokens JWT

**Structure :**
```
Header.Payload.Signature
```

**Payload exemple :**
```json
{
  "sub": "drv_456",
  "type": "EMPLOYEE",
  "iat": 1642241234,
  "exp": 1642244834
}
```

**Durée de vie :**
- Salariés : 1 heure (renouvelable avec refresh token)
- Sous-traitants : Durée de la mission

## Tests et Développement

### Postman Collection

Une collection Postman est disponible avec tous les endpoints :
`/docs/postman/RT-Driver-API.postman_collection.json`

### Mock Server

Pour les tests locaux sans backend :
```bash
npm run mock-server
```

Cela démarre un serveur mock sur le port 3000.

## Support

Pour toute question sur l'API :
- Email : api-support@rt-technologie.fr
- Documentation complète : https://docs.rt.com/api
- Status page : https://status.rt.com
