# Module Palettes Europe - Documentation Complète

## Vue d'ensemble

Le module Palettes Europe est un système de gestion circulaire des palettes EPAL basé sur le concept de "chèques-palettes" dématérialisés. Il permet aux industriels, transporteurs et logisticiens de gérer efficacement le flux de palettes Europe à travers un système de signatures cryptographiques et d'intelligence artificielle.

**Architecture:** Microservice indépendant (port 3011)
**Technologies:** Node.js HTTP natif, Algorithme Ed25519, Affret.IA
**Base de données:** In-memory store avec option MongoDB

---

## Architecture Globale

```
┌─────────────────┐
│  Web-Industry   │──┐
│  (Génération)   │  │
└─────────────────┘  │
                     │
┌─────────────────┐  │    ┌──────────────────┐
│ Web-Transporter │──┼───▶│ Service Palette  │
│    (Dépôt)      │  │    │   Port: 3011     │
└─────────────────┘  │    └──────────────────┘
                     │              │
┌─────────────────┐  │              │
│ Web-Logistician │──┤              ▼
│  (Réception)    │  │    ┌──────────────────┐
└─────────────────┘  │    │   Affret.IA      │
                     │    │  (Site Matching) │
┌─────────────────┐  │    └──────────────────┘
│ Backoffice-Admin│──┘
│  (Supervision)  │
└─────────────────┘
```

---

## Intégration Frontend

### 1. Web-Industry (Génération de chèques)

**Fichiers:**
- `apps/web-industry/src/app/palettes/page.tsx` - Dashboard
- `apps/web-industry/src/app/palettes/generate/page.tsx` - Génération
- `apps/web-industry/src/lib/api/palettes.ts` - API client

**Exemple d'utilisation:**

```typescript
import { palettesApi } from '@/lib/api/palettes'

// Générer un chèque
const response = await palettesApi.generateCheque({
  fromCompanyId: 'IND-1',
  orderId: 'ORD-123456',
  quantity: 33,
  transporterPlate: 'AB-123-CD',
  deliveryLocation: {
    lat: 48.8566,
    lng: 2.3522
  }
})

console.log('Chèque généré:', response.cheque.id)
console.log('Site matché:', response.matchedSite.site.name)

// Récupérer le ledger
const ledger = await palettesApi.getLedger('IND-1')
console.log('Solde:', ledger.balance, 'palettes')
```

**Méthodes disponibles:**
- `generateCheque(data)` → Génère un chèque avec matching IA
- `getCheque(chequeId)` → Récupère un chèque
- `getLedger(companyId)` → Récupère le solde
- `getSites()` → Liste les sites
- `matchSite(data)` → Matching manuel d'un site
- `createDispute(data)` → Crée un litige

---

### 2. Web-Transporter (Dépôt de palettes)

**Fichiers:**
- `apps/web-transporter/src/app/palettes/page.tsx` - Scanner & Dépôt
- `apps/web-transporter/src/app/palettes/sites/page.tsx` - Liste des sites
- `apps/web-transporter/src/lib/api/palettes.ts` - API client

**Exemple d'utilisation:**

```typescript
import { palettesApi } from '@/lib/api/palettes'

// Scanner un chèque
const qrCode = 'RT-PALETTE://CHQ-1234567890-ABCD'
const chequeId = qrCode.replace('RT-PALETTE://', '')
const cheque = await palettesApi.getCheque(chequeId)

// Déposer les palettes
const result = await palettesApi.depositCheque({
  chequeId: cheque.id,
  transporterSignature: 'SIG-TRANSPORTER-001',
  geolocation: {
    lat: 48.8566,
    lng: 2.3522
  },
  photo: photoBase64 // Optionnel
})
```

**Méthodes disponibles:**
- `getCheque(chequeId)` → Récupère un chèque
- `depositCheque(data)` → Dépose les palettes
- `getSites()` → Liste les sites
- `matchSite(data)` → Trouve le meilleur site

---

### 3. Web-Logistician (Réception de palettes)

**Fichiers:**
- `apps/web-logistician/pages/palettes.tsx` - Réception
- `apps/web-logistician/lib/api/palettes.ts` - API client

**Exemple d'utilisation:**

```typescript
import { palettesApi } from '../lib/api/palettes'

// Scanner le chèque déposé
const cheque = await palettesApi.getCheque(chequeId)

// Réceptionner les palettes
const result = await palettesApi.receiveCheque({
  chequeId: cheque.id,
  receiverSignature: 'SIG-RECEIVER-001',
  geolocation: {
    lat: 48.8566,
    lng: 2.3522
  },
  quantityReceived: 33
})

// Mettre à jour le quota d'un site
await palettesApi.updateSiteQuota('SITE-001', 150)
```

**Méthodes disponibles:**
- `getCheque(chequeId)` → Récupère un chèque
- `receiveCheque(data)` → Réceptionne les palettes
- `getSites()` → Liste tous les sites
- `getMySites(companyId)` → Liste mes sites
- `updateSiteQuota(siteId, quota)` → Met à jour un quota

---

### 4. Backoffice-Admin (Administration)

**Fichiers:**
- `apps/backoffice-admin/pages/palettes.tsx` - Dashboard admin
- `apps/backoffice-admin/lib/api/palettes.ts` - API client

**Exemple d'utilisation:**

```typescript
import { palettesAdminApi } from '../lib/api/palettes'

// Vue globale
const [sites, disputes, ledgers] = await Promise.all([
  palettesAdminApi.getSites(),
  palettesAdminApi.getDisputes(),
  palettesAdminApi.getAllLedgers(['IND-1', 'TRP-1', 'LOG-1'])
])

// Détails d'un site avec quota
const { site, quota } = await palettesAdminApi.getSite('SITE-001')

// Export CSV
palettesAdminApi.exportToCSV(ledgers, 'ledgers-palettes.csv')
```

**Méthodes disponibles:**
- `getSites()` → Liste tous les sites
- `getSite(siteId)` → Détails d'un site avec quota
- `updateSiteQuota(siteId, quota)` → Met à jour un quota
- `getDisputes()` → Liste tous les litiges
- `getCheque(chequeId)` → Récupère un chèque
- `getLedger(companyId)` → Récupère un ledger
- `getAllLedgers(companyIds)` → Récupère plusieurs ledgers
- `exportToCSV(data, filename)` → Exporte en CSV

---

## API Reference

### POST /palette/cheques/generate
Génère un nouveau chèque-palette avec matching IA.

**Request:**
```json
{
  "fromCompanyId": "IND-1",
  "orderId": "ORD-123456",
  "quantity": 33,
  "transporterPlate": "AB-123-CD",
  "deliveryLocation": {
    "lat": 48.8566,
    "lng": 2.3522
  }
}
```

**Response (201):**
```json
{
  "cheque": {
    "id": "CHQ-1234567890-ABCD",
    "orderId": "ORD-123456",
    "fromCompanyId": "IND-1",
    "toSiteId": "SITE-001",
    "quantity": 33,
    "palletType": "EURO_EPAL",
    "transporterPlate": "AB-123-CD",
    "qrCode": "RT-PALETTE://CHQ-1234567890-ABCD",
    "status": "EMIS",
    "createdAt": "2025-01-15T10:30:00Z",
    "cryptoSignature": "ed25519:abc123..."
  },
  "matchedSite": {
    "siteId": "SITE-001",
    "site": { /* PalletSite */ },
    "distance": 12.5,
    "quotaRemaining": 67
  },
  "alternatives": [ /* autres sites */ ]
}
```

---

### GET /palette/cheques/:id
Récupère les détails d'un chèque.

**Response (200):**
```json
{
  "cheque": {
    "id": "CHQ-1234567890-ABCD",
    "status": "EMIS | DEPOSE | RECU | LITIGE",
    /* ... */
  }
}
```

---

### POST /palette/cheques/:id/deposit
Dépose un chèque-palette (transporteur).

**Request:**
```json
{
  "transporterSignature": "SIG-TRANSPORTER-001",
  "geolocation": {
    "lat": 48.8566,
    "lng": 2.3522
  },
  "photo": "data:image/jpeg;base64,..."
}
```

**Response (200):**
```json
{
  "cheque": {
    "status": "DEPOSE",
    "depositedAt": "2025-01-15T11:00:00Z",
    "signatures": {
      "transporter": "SIG-TRANSPORTER-001"
    }
  }
}
```

---

### POST /palette/cheques/:id/receive
Réceptionne un chèque-palette (logisticien).

**Request:**
```json
{
  "receiverSignature": "SIG-RECEIVER-001",
  "geolocation": {
    "lat": 48.8566,
    "lng": 2.3522
  },
  "quantityReceived": 33
}
```

**Response (200):**
```json
{
  "cheque": {
    "status": "RECU",
    "receivedAt": "2025-01-15T12:00:00Z",
    "quantityReceived": 33
  }
}
```

**Effets secondaires:**
- Mise à jour du ledger de `fromCompanyId`
- Incrémentation du quota du site

---

### GET /palette/ledger/:companyId
Récupère le solde et l'historique d'une entreprise.

**Response (200):**
```json
{
  "ledger": {
    "companyId": "IND-1",
    "balance": -45,
    "history": [
      {
        "date": "2025-01-15T10:30:00Z",
        "delta": -33,
        "reason": "CHEQUE_RECEIVED",
        "chequeId": "CHQ-1234567890-ABCD",
        "newBalance": -45
      }
    ]
  }
}
```

---

### GET /palette/sites
Liste tous les sites de restitution.

**Response (200):**
```json
{
  "sites": [
    {
      "id": "SITE-001",
      "companyId": "LOG-1",
      "name": "Entrepôt Gonesse",
      "address": "Zone Industrielle, 95500 Gonesse",
      "gps": { "lat": 48.9023, "lng": 2.4512 },
      "quotaDailyMax": 100,
      "openingHours": { "start": "08:00", "end": "18:00" },
      "availableDays": [1, 2, 3, 4, 5],
      "priority": "NETWORK"
    }
  ]
}
```

---

### GET /palette/sites/:id
Détail d'un site avec son quota.

**Response (200):**
```json
{
  "site": { /* PalletSite */ },
  "quota": {
    "siteId": "SITE-001",
    "dailyMax": 100,
    "consumed": 33,
    "lastReset": "2025-01-15"
  }
}
```

---

### POST /palette/sites/:id/quota
Met à jour le quota d'un site.

**Request:**
```json
{
  "dailyMax": 150,
  "openingHours": { "start": "08:00", "end": "18:00" },
  "availableDays": [1, 2, 3, 4, 5],
  "priority": "INTERNAL"
}
```

---

### POST /palette/disputes
Crée un nouveau litige.

**Request:**
```json
{
  "chequeId": "CHQ-1234567890-ABCD",
  "claimantId": "TRP-1",
  "reason": "QUANTITY_MISMATCH",
  "photos": ["data:image/jpeg;base64,..."],
  "comments": "Quantité inférieure"
}
```

**Response (201):**
```json
{
  "dispute": {
    "id": "DISP-1234567890-AB",
    "status": "OPEN"
  }
}
```

---

### POST /palette/match/site
Trouve le meilleur site de restitution via Affret.IA.

**Request:**
```json
{
  "deliveryLocation": {
    "lat": 48.8566,
    "lng": 2.3522
  },
  "companyId": "TRP-1"
}
```

**Response (200):**
```json
{
  "bestSite": {
    "siteId": "SITE-001",
    "distance": 12.5,
    "quotaRemaining": 67,
    "score": 1987.5
  },
  "alternatives": [ /* top 3 autres sites */ ]
}
```

---

## Configuration

### Variables d'environnement

Ajoutez dans chaque application frontend :

**`.env.example`:**
```bash
NEXT_PUBLIC_PALETTE_API_URL=http://localhost:3011
```

**Fichiers créés/modifiés:**
- `apps/web-industry/.env.example`
- `apps/web-transporter/.env.example` (créé)
- `apps/web-logistician/.env.example`
- `apps/backoffice-admin/.env.example` (créé)

### Démarrage du service

```bash
cd services/palette
PORT=3011 node src/server.js
```

### Health Check

```bash
curl http://localhost:3011/health
```

---

## Tests

### Tests d'Intégration Frontend

**Fichier:** `services/palette/tests/integration-frontend.test.js`

**Exécution:**
```bash
# Démarrer le service
cd services/palette
PORT=3011 node src/server.js

# Exécuter les tests
node tests/integration-frontend.test.js
```

**Tests couverts:**
1. Web-Industry : Génération de chèque
2. Web-Transporter : Dépôt de palettes
3. Web-Logistician : Réception
4. Backoffice-Admin : Administration
5. Cas d'erreur et validations

---

## Types TypeScript

### PalletCheque

```typescript
interface PalletCheque {
  id: string
  orderId: string
  fromCompanyId: string
  toSiteId: string
  quantity: number
  palletType: string
  transporterPlate: string
  qrCode: string
  status: 'EMIS' | 'DEPOSE' | 'RECU' | 'LITIGE'
  createdAt: string
  depositedAt: string | null
  receivedAt: string | null
  signatures: {
    transporter: string | null
    receiver: string | null
  }
  photos: Array<{ type: string; url: string; at: string }>
  geolocations: {
    deposit: { lat: number; lng: number } | null
    receipt: { lat: number; lng: number } | null
  }
  cryptoSignature: string
  quantityReceived?: number
}
```

### PalletSite

```typescript
interface PalletSite {
  id: string
  companyId: string
  name: string
  address: string
  gps: { lat: number; lng: number }
  quotaDailyMax: number
  openingHours: { start: string; end: string }
  availableDays: number[]
  priority: 'INTERNAL' | 'NETWORK' | 'EXTERNAL'
}
```

### PalletLedger

```typescript
interface PalletLedger {
  companyId: string
  balance: number
  history: Array<{
    date: string
    delta: number
    reason: string
    chequeId: string | null
    newBalance: number
  }>
}
```

---

## Sécurité

### Authentication
Le service utilise le package `@rt/security` pour :
- Validation JWT
- Rate limiting (240 req/min)
- Headers de sécurité
- CORS

### Signatures Cryptographiques
Chaque chèque est signé avec Ed25519

### Géolocalisation
Les signatures incluent position GPS et timestamp

---

## Support

**Email:** support@rt-technologie.com
**Documentation:** https://docs.rt-technologie.com/palettes

---

**Version:** 1.0.0
**Dernière mise à jour:** 2025-01-15
