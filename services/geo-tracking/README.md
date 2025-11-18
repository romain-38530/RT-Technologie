# Service Geo-Tracking

Service de géolocalisation temps réel pour l'application mobile conducteur RT Technologie.

## Fonctionnalités

### 1. Tracking GPS Temps Réel
- Enregistrement des positions GPS toutes les 15 secondes
- Stockage dans MongoDB avec horodatage
- Précision, vitesse et direction
- Historique complet par mission

### 2. Géofencing Automatique
- Détection d'arrivée aux points (rayon 200m)
- Détection de départ des points
- 4 types d'événements :
  - `ARRIVAL_PICKUP` : Arrivée au point de chargement
  - `DEPARTURE_PICKUP` : Départ du point de chargement
  - `ARRIVAL_DELIVERY` : Arrivée au point de livraison
  - `DEPARTURE_DELIVERY` : Départ du point de livraison
- Mise à jour automatique des statuts de mission

### 3. Calcul d'ETA avec TomTom
- ETA dynamique avec trafic temps réel
- Distance précise
- Retard dû au trafic
- Fallback sur calcul simple si TomTom indisponible

### 4. API RESTful
- Authentification JWT
- Documentation OpenAPI 3.0
- Validation des données (Joi)
- Logging structuré (Winston)

## Installation

```bash
# Depuis la racine du monorepo
cd services/geo-tracking

# Installer les dépendances
pnpm install

# Copier la configuration
cp .env.example .env

# Éditer .env et ajouter votre clé TomTom API
nano .env
```

## Configuration

### Clé API TomTom (OBLIGATOIRE pour ETA précis)

1. Créer un compte gratuit sur https://developer.tomtom.com/
2. Créer une application
3. Copier la clé API
4. Ajouter dans `.env` :

```env
TOMTOM_API_KEY=your_actual_key_here
```

Le tier gratuit TomTom offre :
- 2 500 requêtes/jour
- Suffisant pour ~80 conducteurs (15s tracking)

### MongoDB

Le service se connecte automatiquement à MongoDB.
Collections utilisées :
- `positions` : Historique GPS
- `geofence_events` : Événements de géofencing
- `orders` : Lectures pour géofencing et mise à jour ETA

## Démarrage

### Développement

```bash
pnpm dev
```

Le service démarre sur http://localhost:3016 avec hot-reload.

### Production

```bash
pnpm start
```

## API Endpoints

### POST /geo-tracking/positions
Enregistre une position GPS.

**Request:**
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

**Response:**
```json
{
  "success": true,
  "positionId": "673ab...",
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

### GET /geo-tracking/positions/:orderId
Récupère l'historique des positions.

**Query params:**
- `from` (ISO date) : Date de début
- `to` (ISO date) : Date de fin
- `limit` (number) : Max 100, défaut 100

**Response:**
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

### GET /geo-tracking/eta/:orderId
Calcule l'ETA pour la prochaine destination.

**Query params:**
- `currentLat` (required)
- `currentLon` (required)

**Response:**
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

### GET /geo-tracking/geofence/events/:orderId
Liste les événements de géofencing.

**Response:**
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
    }
  ]
}
```

### GET /geo-tracking/health
Health check.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-11-18T10:30:00Z",
  "uptime": 12345
}
```

## Algorithme de Géofencing

### Détection d'arrivée
1. Position actuelle DANS la zone (< 200m)
2. Position précédente HORS de la zone (> 200m)
3. → Événement `ARRIVAL_*` déclenché

### Détection de départ
1. Position actuelle HORS de la zone (> 200m)
2. Position précédente DANS la zone (< 200m)
3. Statut mission = `LOADING` ou `UNLOADING`
4. → Événement `DEPARTURE_*` déclenché

### Mise à jour des statuts
| Événement | Nouveau statut mission |
|-----------|------------------------|
| `ARRIVAL_PICKUP` | `ARRIVED_PICKUP` |
| `DEPARTURE_PICKUP` | `IN_TRANSIT` |
| `ARRIVAL_DELIVERY` | `ARRIVED_DELIVERY` |

## Calcul de Distance (Haversine)

Formule mathématique pour calculer la distance entre deux points GPS :

```javascript
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Rayon de la Terre en mètres
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance en mètres
}
```

Précision : ±0.5% sur distances < 500km

## Performance

### Avec TomTom API
- Latence : ~200-500ms
- Trafic temps réel : Oui
- Précision ETA : ±10%
- Limite : 2 500 req/jour (gratuit)

### Sans TomTom (fallback)
- Latence : <10ms
- Trafic temps réel : Non
- Précision ETA : ±30%
- Limite : Aucune

## Monitoring

Logs dans `logs/geo-tracking.log` :

```
2024-11-18T10:30:00Z [info] 📍 Position saved for order ORD-2024-001
2024-11-18T10:30:05Z [info] 🎯 Geofence event detected: ARRIVAL_PICKUP
2024-11-18T10:30:10Z [warn] ⚠️  TomTom API timeout, using fallback
```

## Intégration avec core-orders

Le service geo-tracking est intégré avec le service core-orders (port 3001) pour la gestion des commandes et événements.

### Configuration

Ajouter dans `.env` de core-orders :

```env
GEO_TRACKING_URL=http://localhost:3016
INTERNAL_SERVICE_TOKEN=your-service-token
```

### Fonctions disponibles dans core-orders

#### 1. Notifier une position GPS

```javascript
// Depuis core-orders/src/server.js
const result = await notifyGPSPosition(orderId, lat, lng, timestamp);

// Réponse
{
  success: true,
  statusCode: 200,
  data: {
    positionId: "673ab...",
    geofenceEvent: { ... },
    eta: { ... }
  }
}
```

#### 2. Récupérer l'ETA

```javascript
const eta = await getETA(orderId, currentLat, currentLng, destLat, destLng);

// Réponse
{
  orderId: "ORD-2024-001",
  destination: { latitude, longitude, name },
  eta: {
    arrivalTime: "2024-11-18T11:00:00Z",
    durationMinutes: 30,
    distanceKm: 25.5,
    trafficDelay: 5,
    confidence: "HIGH"
  }
}
```

#### 3. Récupérer les événements géofencing

```javascript
const events = await getGeofenceEvents(orderId);

// Réponse
[
  {
    type: "ARRIVAL_PICKUP",
    detectedAt: "2024-11-18T10:30:00Z",
    location: { ... },
    automatic: true
  }
]
```

### Routes API core-orders

Le service core-orders expose 3 routes proxy vers geo-tracking :

#### POST /industry/orders/:id/gps-position

Enregistre une position GPS et met à jour le statut de commande automatiquement.

```bash
curl -X POST http://localhost:3001/industry/orders/ORD-001/gps-position \
  -H "Content-Type: application/json" \
  -d '{ "lat": 48.8566, "lng": 2.3522, "timestamp": "2024-11-18T10:30:00Z" }'
```

**Mise à jour automatique des statuts :**
- Événement `ARRIVAL_PICKUP` → Statut `ARRIVED_PICKUP`
- Événement `DEPARTURE_PICKUP` → Statut `IN_TRANSIT`
- Événement `ARRIVAL_DELIVERY` → Statut `ARRIVED_DELIVERY`

#### GET /industry/orders/:id/eta

Calcule l'ETA depuis la position actuelle vers la destination.

```bash
curl "http://localhost:3001/industry/orders/ORD-001/eta?currentLat=48.8566&currentLng=2.3522"
```

#### GET /industry/orders/:id/geofence-events

Liste tous les événements de géofencing pour une commande.

```bash
curl http://localhost:3001/industry/orders/ORD-001/geofence-events
```

### Intégration mobile-driver PWA

L'application mobile-driver utilise directement l'API geo-tracking via `tracking.ts` :

```typescript
import { trackingApi } from '@/lib/api/tracking';

// Envoyer position GPS
await trackingApi.sendPosition({
  orderId: 'ORD-001',
  latitude: 48.8566,
  longitude: 2.3522,
  accuracy: 10,
  timestamp: new Date().toISOString(),
});

// Calculer ETA
const eta = await trackingApi.calculateETA('ORD-001', 48.8566, 2.3522);

// Récupérer événements géofencing
const events = await trackingApi.getGeofenceEvents('ORD-001');
```

Configuration dans `.env` de mobile-driver :

```env
NEXT_PUBLIC_GEO_TRACKING_URL=http://localhost:3016
```

### Architecture de communication

```
┌─────────────────────┐
│  Mobile Driver PWA  │
│    (port: 3000)     │
└──────────┬──────────┘
           │
           │ JWT Auth
           │ tracking.ts
           ▼
┌─────────────────────┐
│   Geo-Tracking      │◄──────────┐
│    (port: 3016)     │           │
└──────────┬──────────┘           │
           │                      │
           │ MongoDB              │ Service-to-service
           │ positions            │ INTERNAL_SERVICE_TOKEN
           │ geofence_events      │
           │                      │
┌──────────▼──────────┐           │
│     MongoDB         │           │
│  rt-technologie     │           │
└─────────────────────┘           │
                                  │
┌─────────────────────┐           │
│   Core Orders       │───────────┘
│    (port: 3001)     │
└─────────────────────┘
  - notifyGPSPosition()
  - getETA()
  - getGeofenceEvents()
```

### Flow de tracking GPS

1. **Mobile Driver** envoie position GPS toutes les 15s → **Geo-Tracking**
2. **Geo-Tracking** détecte événement géofencing
3. **Geo-Tracking** calcule ETA avec TomTom
4. **Geo-Tracking** retourne événement + ETA
5. **Mobile Driver** peut appeler **Core Orders** pour mise à jour statut
6. **Core Orders** appelle **Geo-Tracking** pour récupérer événements

### Tests d'intégration

Lancer les tests d'intégration :

```bash
cd services/geo-tracking
node tests/integration.test.js
```

Tests couverts :
- ✅ POST position GPS
- ✅ GET ETA avec données réelles
- ✅ Détection géofencing automatique
- ✅ GET historique positions
- ✅ Connexion core-orders → geo-tracking

## Tests

```bash
# Santé du service
curl http://localhost:3016/geo-tracking/health

# Enregistrer une position (nécessite JWT)
curl -X POST http://localhost:3016/geo-tracking/positions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORD-2024-001",
    "latitude": 48.8566,
    "longitude": 2.3522,
    "timestamp": "2024-11-18T10:30:00Z"
  }'
```

## Sécurité

- ✅ Authentification JWT obligatoire
- ✅ Validation stricte des données (Joi)
- ✅ Helmet.js (protection headers)
- ✅ CORS configuré
- ✅ Rate limiting (TODO)
- ✅ Logs structurés sans données sensibles

## Roadmap

### Phase 1 (Actuel)
- [x] Tracking GPS basique
- [x] Géofencing automatique
- [x] ETA avec TomTom
- [x] API RESTful

### Phase 2
- [ ] WebSocket temps réel
- [ ] Alertes déviation de route
- [ ] Optimisation batterie (adaptive tracking)
- [ ] Cache Redis pour ETA

### Phase 3
- [ ] Analytics temps réel
- [ ] Prédiction retards (ML)
- [ ] Clustering positions
- [ ] Export KML/GPX

## Support

- Documentation API : [openapi.yaml](./openapi.yaml)
- Issues : GitHub Issues
- Contact : geo-tracking@rt-technologie.com

## Licence

Propriétaire - RT Technologie © 2024
