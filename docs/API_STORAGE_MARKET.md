# API Bourse de Stockage - Référence Complète

## Informations Générales

**URL de base** : `http://localhost:3013`
**Format** : JSON
**Authentification** : Bearer Token (optionnel via `SECURITY_ENFORCE=true`)

## Endpoints

### Health Check

#### GET /health

Vérification de l'état du service.

**Réponse** :
```json
{
  "status": "ok",
  "service": "storage-market",
  "mongo": true
}
```

---

## Publication de Besoins (Industriel)

### POST /storage-market/needs/create

Créer un nouveau besoin de stockage.

**Body** :
```json
{
  "ownerOrgId": "IND-1",
  "storageType": "long_term",
  "volume": {
    "type": "palettes",
    "quantity": 200
  },
  "duration": {
    "startDate": "2025-02-01",
    "endDate": "2025-08-31",
    "flexible": true,
    "renewable": true
  },
  "location": {
    "country": "France",
    "region": "Île-de-France",
    "department": "77",
    "maxRadius": 50,
    "lat": 48.8566,
    "lon": 2.3522
  },
  "constraints": {
    "temperature": "ambient",
    "adrAuthorized": false,
    "securityLevel": "standard",
    "certifications": ["ISO 9001"]
  },
  "infrastructure": {
    "dockCount": 2,
    "liftingEquipment": true,
    "handlingEquipment": ["forklift", "pallet_jack"]
  },
  "activity": {
    "schedule": "Mon-Fri 8h-18h",
    "dailyMovements": 10
  },
  "budget": {
    "indicative": 5000,
    "currency": "EUR",
    "period": "monthly"
  },
  "publicationType": "GLOBAL",
  "deadline": "2025-01-25T23:59:59Z"
}
```

**Réponse 201** :
```json
{
  "need": {
    "id": "NEED-1732000001-abc123",
    "createdAt": "2025-01-15T10:30:00Z",
    "status": "PUBLISHED",
    ...
  }
}
```

**Exemple cURL** :
```bash
curl -X POST http://localhost:3013/storage-market/needs/create \
  -H "Content-Type: application/json" \
  -d '{
    "storageType": "long_term",
    "volume": {"type": "palettes", "quantity": 200},
    "location": {"region": "Île-de-France", "department": "77"},
    "publicationType": "GLOBAL"
  }'
```

---

### GET /storage-market/needs

Lister les besoins de stockage.

**Query Params** :
- `ownerOrgId` (optionnel) - Filtrer par organisation
- `status` (optionnel) - `PUBLISHED`, `CONTRACTED`, `EXPIRED`
- `publicationType` (optionnel) - `GLOBAL`, `REFERRED_ONLY`, `MIXED`

**Réponse 200** :
```json
{
  "items": [
    {
      "id": "NEED-1732000001-abc123",
      "status": "PUBLISHED",
      "storageType": "long_term",
      "volume": {"type": "palettes", "quantity": 200},
      ...
    }
  ]
}
```

**Exemple cURL** :
```bash
curl http://localhost:3013/storage-market/needs?status=PUBLISHED
```

---

### GET /storage-market/needs/:id

Obtenir les détails d'un besoin spécifique.

**Réponse 200** :
```json
{
  "need": {
    "id": "NEED-1732000001-abc123",
    "status": "PUBLISHED",
    ...
  }
}
```

**Exemple cURL** :
```bash
curl http://localhost:3013/storage-market/needs/NEED-1732000001-abc123
```

---

### PUT /storage-market/needs/:id

Modifier un besoin existant.

**Body** : Champs partiels à modifier

**Réponse 200** :
```json
{
  "need": {
    "id": "NEED-1732000001-abc123",
    "updatedAt": "2025-01-16T10:00:00Z",
    ...
  }
}
```

---

### DELETE /storage-market/needs/:id

Supprimer un besoin.

**Réponse 200** :
```json
{
  "deleted": true,
  "id": "NEED-1732000001-abc123"
}
```

---

## Offres des Logisticiens

### POST /storage-market/offers/send

Soumettre une offre pour un besoin.

**Body** :
```json
{
  "needId": "NEED-1732000001-abc123",
  "logisticianId": "LOG-1",
  "siteId": "SITE-1732000001-aaa111",
  "siteLocation": {
    "lat": 48.9333,
    "lon": 2.2833
  },
  "pricing": {
    "monthlyPerPallet": 12,
    "estimatedMonthlyTotal": 2400,
    "inboundMovement": 3.5,
    "outboundMovement": 3.5,
    "setupFee": 500,
    "currency": "EUR"
  },
  "totalPrice": 17300,
  "services": {
    "included": ["Reception marchandises", "Stockage sécurisé"],
    "optional": [
      {"name": "Conditionnement", "price": 2, "unit": "per_unit"}
    ]
  },
  "certifications": ["ISO 9001", "IFS"],
  "availability": {
    "readyDate": "2025-01-28",
    "flexibleStart": true
  },
  "validUntil": "2025-02-15T23:59:59Z",
  "reliabilityScore": 92,
  "responseTimeHours": 3
}
```

**Réponse 201** :
```json
{
  "offer": {
    "id": "OFFER-1732000001-xxx111",
    "createdAt": "2025-01-15T14:30:00Z",
    "status": "SUBMITTED",
    ...
  }
}
```

**Exemple cURL** :
```bash
curl -X POST http://localhost:3013/storage-market/offers/send \
  -H "Content-Type: application/json" \
  -d '{
    "needId": "NEED-001",
    "logisticianId": "LOG-1",
    "pricing": {"monthlyPerPallet": 12, "totalPrice": 17300},
    "reliabilityScore": 92
  }'
```

---

### GET /storage-market/offers/:needId

Lister toutes les offres pour un besoin.

**Réponse 200** :
```json
{
  "items": [
    {
      "id": "OFFER-1732000001-xxx111",
      "logisticianId": "LOG-1",
      "pricing": {...},
      ...
    }
  ]
}
```

---

### POST /storage-market/offers/ranking

Obtenir le classement IA des offres pour un besoin.

**Body** :
```json
{
  "needId": "NEED-1732000001-abc123"
}
```

**Réponse 200** :
```json
{
  "items": [
    {
      "id": "OFFER-001",
      "aiScore": 94.5,
      "aiRank": 1,
      "aiRecommended": true,
      "aiReasons": [
        "Prix très compétitif (-15% vs moyenne)",
        "Très proche (12km)",
        "Excellent historique de fiabilité",
        "Réponse ultra-rapide"
      ],
      ...
    }
  ],
  "top3": [...]
}
```

**Exemple cURL** :
```bash
curl -X POST http://localhost:3013/storage-market/offers/ranking \
  -H "Content-Type: application/json" \
  -d '{"needId": "NEED-001"}'
```

---

## Capacités Logistiques

### POST /storage-market/logistician-capacity

Déclarer un nouveau site logistique.

**Body** :
```json
{
  "logisticianId": "LOG-1",
  "name": "Entrepôt Paris Nord",
  "address": {
    "street": "15 Rue de la Logistique",
    "city": "Gennevilliers",
    "postalCode": "92230",
    "department": "92",
    "region": "Île-de-France",
    "country": "France",
    "lat": 48.9333,
    "lon": 2.2833
  },
  "capacity": {
    "totalM2": 5000,
    "availableM2": 2000,
    "totalPalettes": 2000,
    "availablePalettes": 800
  },
  "storageTypes": ["long_term", "temporary", "picking"],
  "temperatures": ["ambient", "cold_2_8"],
  "certifications": {
    "adr": true,
    "customs": true,
    "iso9001": true,
    "ifs": true
  },
  "infrastructure": {
    "ceilingHeight": 10,
    "dockCount": 8,
    "wmsAvailable": true,
    "apiAvailable": true
  },
  "pricing": {
    "monthlyPerM2": 8.5,
    "monthlyPerPallet": 12,
    "inboundMovement": 3.5,
    "outboundMovement": 3.5,
    "setupFee": 500,
    "currency": "EUR"
  }
}
```

**Réponse 201** :
```json
{
  "site": {
    "id": "SITE-1732000001-aaa111",
    "createdAt": "2025-01-10T08:00:00Z",
    ...
  }
}
```

---

### PUT /storage-market/logistician-capacity/:siteId

Mettre à jour les capacités d'un site.

**Body** : Champs à modifier (ex: `availableM2`, `availablePalettes`)

**Réponse 200** :
```json
{
  "site": {
    "id": "SITE-001",
    "updatedAt": "2025-01-18T14:00:00Z",
    ...
  }
}
```

---

### GET /storage-market/logistician-capacity/:logisticianId

Lister tous les sites d'un logisticien.

**Réponse 200** :
```json
{
  "items": [
    {
      "id": "SITE-001",
      "name": "Entrepôt Paris Nord",
      ...
    }
  ]
}
```

---

## Contractualisation

### POST /storage-market/contracts/create

Créer un contrat après acceptation d'une offre.

**Body** :
```json
{
  "needId": "NEED-001",
  "offerId": "OFFER-005",
  "industrialId": "IND-3",
  "logisticianId": "LOG-1",
  "siteId": "SITE-004",
  "startDate": "2025-01-22",
  "endDate": "2025-07-22",
  "storageType": "picking",
  "volume": {"type": "m3", "quantity": 1000},
  "pricing": {...}
}
```

**Réponse 201** :
```json
{
  "contract": {
    "id": "CONTRACT-1732100001-xyz123",
    "createdAt": "2025-01-18T16:00:00Z",
    "status": "ACTIVE",
    ...
  }
}
```

---

### GET /storage-market/contracts/:id

Obtenir les détails d'un contrat.

**Réponse 200** :
```json
{
  "contract": {
    "id": "CONTRACT-001",
    "status": "ACTIVE",
    "wmsConnected": true,
    ...
  }
}
```

---

### PUT /storage-market/contracts/:id/status

Modifier le statut d'un contrat.

**Body** :
```json
{
  "status": "COMPLETED"
}
```

**Réponse 200** :
```json
{
  "contract": {
    "id": "CONTRACT-001",
    "status": "COMPLETED",
    "updatedAt": "2025-07-22T18:00:00Z"
  }
}
```

---

### GET /storage-market/contracts

Lister les contrats avec filtres.

**Query Params** :
- `industrialId` (optionnel)
- `logisticianId` (optionnel)
- `status` (optionnel) - `ACTIVE`, `PENDING_START`, `COMPLETED`

**Réponse 200** :
```json
{
  "items": [...]
}
```

---

## Intégration WMS

### POST /storage-market/wms/connect

Connecter un WMS à un contrat.

**Body** :
```json
{
  "contractId": "CONTRACT-001",
  "wmsUrl": "https://wms.logisticien.fr/api",
  "apiKey": "secret_key_12345",
  "syncFrequency": "realtime"
}
```

**Réponse 201** :
```json
{
  "connection": {
    "id": "WMS-001",
    "status": "ACTIVE",
    ...
  }
}
```

---

### GET /storage-market/wms/inventory/:contractId

Obtenir l'inventaire temps réel via WMS.

**Réponse 200** :
```json
{
  "inventory": {
    "contractId": "CONTRACT-001",
    "lastUpdate": "2025-01-18T14:30:00Z",
    "totalPallets": 150,
    "availableSpace": 50,
    "items": [
      {
        "sku": "PROD-001",
        "quantity": 500,
        "location": "A-01-01"
      }
    ]
  }
}
```

---

### GET /storage-market/wms/movements/:contractId

Obtenir les mouvements récents.

**Query Params** :
- `from` (optionnel) - Date de début
- `to` (optionnel) - Date de fin

**Réponse 200** :
```json
{
  "movements": {
    "contractId": "CONTRACT-001",
    "period": {
      "from": "2025-01-01T00:00:00Z",
      "to": "2025-01-18T23:59:59Z"
    },
    "items": [
      {
        "date": "2025-01-18T10:00:00Z",
        "type": "IN",
        "sku": "PROD-001",
        "quantity": 100,
        "ref": "BL-001"
      }
    ]
  }
}
```

---

## Administration

### GET /storage-market/admin/stats

Statistiques globales du marché.

**Réponse 200** :
```json
{
  "stats": {
    "totalNeeds": 15,
    "totalOffers": 42,
    "totalContracts": 8,
    "activeContracts": 5,
    "totalSites": 25,
    "needsByStatus": {
      "PUBLISHED": 8,
      "CONTRACTED": 5,
      "EXPIRED": 2
    },
    "contractsByStatus": {
      "ACTIVE": 5,
      "PENDING_START": 2,
      "COMPLETED": 1
    },
    "averageOffersPerNeed": 2.8
  }
}
```

---

### GET /storage-market/admin/logisticians

Lister tous les logisticiens.

**Réponse 200** :
```json
{
  "items": [
    {
      "id": "LOG-1",
      "status": "APPROVED",
      "createdAt": "2024-10-15T00:00:00Z",
      ...
    }
  ]
}
```

---

### POST /storage-market/admin/logisticians/:id/approve

Approuver l'abonnement d'un logisticien.

**Réponse 200** :
```json
{
  "subscription": {
    "id": "LOG-5",
    "status": "APPROVED",
    "approvedAt": "2025-01-18T12:00:00Z"
  }
}
```

**Exemple cURL** :
```bash
curl -X POST http://localhost:3013/storage-market/admin/logisticians/LOG-5/approve
```

---

## Codes d'Erreur

| Code | Description |
|------|-------------|
| 200 | Succès |
| 201 | Ressource créée |
| 400 | Requête invalide |
| 401 | Non authentifié |
| 403 | Non autorisé |
| 404 | Ressource non trouvée |
| 429 | Trop de requêtes |
| 500 | Erreur serveur |

## Variables d'Environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `PORT` | Port du service | 3013 |
| `MONGODB_URI` | URI MongoDB | - |
| `SECURITY_ENFORCE` | Activer auth | false |
| `INTERNAL_SERVICE_TOKEN` | Token inter-services | - |
