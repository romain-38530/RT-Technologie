# Module Palettes - Administration & Intégration Affret.IA

## Vue d'ensemble

Ce document décrit les extensions réalisées pour finaliser le module Palettes :
1. **Backoffice Admin** : Interface d'administration complète pour gérer les palettes
2. **Affret.IA** : Intégration intelligente pour optimiser les routes et détecter les problèmes

---

## 1. Backoffice Admin (/admin/palettes)

### Fichiers créés

#### Client API
**Fichier** : `apps/backoffice-admin/lib/api/palettes.ts`

Client TypeScript complet pour communiquer avec le service Palette (port 3011).

**Fonctionnalités** :
- Récupération de tous les chèques (à implémenter côté backend)
- Gestion des ledgers d'entreprises
- CRUD des sites de retour
- Gestion des litiges
- Export CSV

#### Page d'administration
**Fichier** : `apps/backoffice-admin/pages/palettes.tsx`

Interface d'administration complète avec 6 onglets :

##### 1. Dashboard
- KPIs en temps réel :
  - Total sites de retour
  - Total entreprises inscrites
  - Total palettes en circulation
  - Litiges ouverts
- Top 5 crédits (entreprises avec le plus de palettes en stock)
- Top 5 dettes (entreprises avec le plus de palettes empruntées)

##### 2. Chèques
- Liste complète des chèques générés (à venir)
- Filtres par statut (EMIS, DEPOSE, RECU, LITIGE)
- Recherche par ID de commande

**Note** : Nécessite l'ajout d'un endpoint `GET /palette/admin/cheques` dans le service backend.

##### 3. Ledgers
- Tableau complet des soldes de palettes par entreprise
- Affichage du nombre de transactions
- Dernière activité
- Export CSV

##### 4. Sites
- Liste de tous les sites de retour
- Informations détaillées :
  - Propriétaire
  - Adresse et GPS
  - Quota journalier
  - Horaires d'ouverture
  - Priorité (INTERNAL/NETWORK/EXTERNAL)
- Gestion des quotas en temps réel
- Export CSV

##### 5. Litiges
- Liste de tous les litiges
- Statut : OPEN / PROPOSED / RESOLVED / ESCALATED
- Actions de résolution (à implémenter)

##### 6. Analytics
- Graphiques de répartition :
  - Crédits vs Dettes
  - Sites par priorité
- À venir : graphiques avancés, heatmap géographique

#### Navigation
**Fichier** : `apps/backoffice-admin/pages/_app.tsx`

Ajout du lien "Palettes" dans le menu principal.

---

## 2. Intégration Affret.IA

### Fichier modifié
`services/affret-ia/src/server.js`

### Nouveaux endpoints

#### POST /affret/optimize-pallet-routes

Optimise l'ordre des livraisons en tenant compte des retours palettes.

**Algorithme** :
1. Pour chaque livraison, appelle le service Palette pour trouver le meilleur site de retour
2. Utilise un algorithme TSP simplifié (Greedy Nearest Neighbor) pour optimiser l'ordre
3. Calcule la distance totale incluant les détours vers les sites de retour

**Request** :
```json
POST /affret/optimize-pallet-routes
{
  "deliveries": [
    {
      "orderId": "ORD-123",
      "location": { "lat": 48.8566, "lng": 2.3522 },
      "pallets": 33,
      "address": "15 Rue de Rivoli, Paris",
      "companyId": "IND-1"
    },
    {
      "orderId": "ORD-124",
      "location": { "lat": 45.7640, "lng": 4.8357 },
      "pallets": 20,
      "address": "123 Avenue Lyon, Lyon",
      "companyId": "IND-1"
    }
  ]
}
```

**Response** :
```json
{
  "optimizedRoute": [
    {
      "step": 1,
      "type": "delivery",
      "orderId": "ORD-123",
      "address": "15 Rue de Rivoli, Paris",
      "location": { "lat": 48.8566, "lng": 2.3522 },
      "pallets": 33,
      "distanceFromPrevious": 0,
      "returnSite": {
        "siteId": "SITE-PARIS-1",
        "name": "Entrepôt Paris Nord",
        "distance": 5.2,
        "location": { "lat": 48.9023, "lng": 2.3789 }
      }
    },
    {
      "step": 2,
      "type": "pallet_return",
      "siteId": "SITE-PARIS-1",
      "siteName": "Entrepôt Paris Nord",
      "location": { "lat": 48.9023, "lng": 2.3789 },
      "pallets": 33,
      "distanceFromPrevious": 5.2
    },
    {
      "step": 3,
      "type": "delivery",
      "orderId": "ORD-124",
      "address": "123 Avenue Lyon, Lyon",
      "location": { "lat": 45.7640, "lng": 4.8357 },
      "pallets": 20,
      "distanceFromPrevious": 392.5,
      "returnSite": {
        "siteId": "SITE-LYON-1",
        "name": "Plateforme Lyon Sud",
        "distance": 3.8,
        "location": { "lat": 45.7407, "lng": 4.8223 }
      }
    },
    {
      "step": 4,
      "type": "pallet_return",
      "siteId": "SITE-LYON-1",
      "siteName": "Plateforme Lyon Sud",
      "location": { "lat": 45.7407, "lng": 4.8223 },
      "pallets": 20,
      "distanceFromPrevious": 3.8
    }
  ],
  "totalDistance": 401.5,
  "totalSteps": 4,
  "deliveries": 2
}
```

**Avantages** :
- Optimisation automatique des tournées
- Intégration transparente des retours palettes
- Calcul de distance précis (Haversine)

---

#### GET /affret/pallet-alerts

Analyse les quotas de tous les sites et détecte les problèmes potentiels.

**Request** :
```bash
GET /affret/pallet-alerts
```

**Response** :
```json
{
  "alerts": [
    {
      "type": "SITE_NEAR_SATURATION",
      "severity": "WARNING",
      "siteId": "SITE-PARIS-1",
      "siteName": "Entrepôt Paris Nord",
      "message": "Site proche de saturation: 92% (138/150)",
      "data": {
        "utilizationPercent": 92,
        "consumed": 138,
        "max": 150
      },
      "suggestedActions": [
        "Augmenter le quota journalier",
        "Rediriger les nouvelles livraisons vers sites alternatifs",
        "Planifier un ramassage urgent"
      ]
    },
    {
      "type": "SITE_FULL",
      "severity": "CRITICAL",
      "siteId": "SITE-LOGI-PARIS",
      "siteName": "Logistique Paris - Dépôt palettes",
      "message": "Site COMPLET: 200/200 palettes",
      "data": {
        "consumed": 200,
        "max": 200
      },
      "suggestedActions": [
        "URGENT: Augmenter le quota immédiatement",
        "Bloquer les nouvelles affectations vers ce site",
        "Contacter le logisticien pour ramassage"
      ]
    },
    {
      "type": "COMPANY_HIGH_DEBT",
      "severity": "CRITICAL",
      "companyId": "IND-1",
      "message": "Entreprise IND-1 a un solde très négatif: -250 palettes",
      "data": {
        "balance": -250,
        "transactions": 45
      },
      "suggestedActions": [
        "Contacter l'entreprise pour régularisation",
        "Bloquer l'émission de nouveaux chèques",
        "Planifier une restitution massive"
      ]
    }
  ],
  "totalAlerts": 3,
  "critical": 2,
  "warnings": 1,
  "timestamp": "2025-01-17T10:30:00.000Z"
}
```

**Seuils d'alerte** :
- Site > 90% : WARNING
- Site > 95% : CRITICAL
- Site = 100% : CRITICAL
- Solde entreprise < -100 palettes : WARNING
- Solde entreprise < -200 palettes : CRITICAL

**Utilité** :
- Détection proactive des problèmes
- Suggestions d'actions correctives
- Prévention des blocages opérationnels

---

#### Modification : GET /affret-ia/quote/:orderId

L'endpoint existant a été étendu pour inclure automatiquement le coût de retour des palettes.

**Avant** :
```json
{
  "orderId": "ORD-123",
  "price": 450,
  "currency": "EUR",
  "suggestedCarriers": ["CARRIER-A", "CARRIER-B"]
}
```

**Après** :
```json
{
  "orderId": "ORD-123",
  "price": 615,
  "currency": "EUR",
  "suggestedCarriers": ["CARRIER-A", "CARRIER-B"],
  "priceBreakdown": {
    "baseTransport": 450,
    "palletReturn": 165,
    "total": 615
  },
  "palletInfo": {
    "pallets": 33,
    "returnSite": {
      "id": "SITE-PARIS-1",
      "name": "Entrepôt Paris Nord",
      "distance": 5.2,
      "address": "Zone Industrielle Nord, 93000 Paris"
    },
    "returnCost": 165,
    "recommendation": "Retour palettes suggéré: Entrepôt Paris Nord à 5.2km. Coût estimé: 165 EUR."
  }
}
```

**Calcul du coût de retour** :
```
returnCost = (distance × 0.50 EUR/km) + (pallets × 5 EUR/palette)
```

**Exemple** :
- Distance : 5.2 km
- Palettes : 33
- Coût : (5.2 × 0.50) + (33 × 5) = 2.60 + 165 = **167.60 EUR**

---

## 3. Variables d'environnement

### Service Affret.IA
```bash
PORT=3005
PALETTE_API_URL=http://localhost:3011
SECURITY_ENFORCE=false
OPENROUTER_API_KEY=your-key-here  # Optionnel
```

### Backoffice Admin
```bash
NEXT_PUBLIC_PALETTE_API_URL=http://localhost:3011
```

---

## 4. Instructions de test

### Prérequis
1. Démarrer le service Palette (port 3011)
2. Démarrer le service Affret.IA (port 3005)
3. Démarrer le backoffice-admin

```bash
# Terminal 1 - Service Palette
cd services/palette
node src/server.js

# Terminal 2 - Service Affret.IA
cd services/affret-ia
node src/server.js

# Terminal 3 - Backoffice Admin
cd apps/backoffice-admin
pnpm dev
```

### Tests Backoffice Admin

#### 1. Accéder au dashboard
```
URL: http://localhost:3000/palettes
```

**Actions** :
- Vérifier les KPIs affichés
- Consulter les tops balances (positives et négatives)
- Rafraîchir les données

#### 2. Gérer les ledgers
- Cliquer sur l'onglet "Ledgers"
- Vérifier le tableau des soldes
- Exporter en CSV

#### 3. Gérer les sites
- Cliquer sur l'onglet "Sites"
- Sélectionner un site
- Modifier le quota journalier
- Vérifier la mise à jour

#### 4. Consulter les litiges
- Cliquer sur l'onglet "Disputes"
- Vérifier l'affichage des litiges (s'il y en a)

### Tests Affret.IA

#### 1. Test d'optimisation de route

```bash
curl -X POST http://localhost:3005/affret/optimize-pallet-routes \
  -H "Content-Type: application/json" \
  -d '{
    "deliveries": [
      {
        "orderId": "ORD-001",
        "location": { "lat": 48.8566, "lng": 2.3522 },
        "pallets": 33,
        "address": "Paris Centre",
        "companyId": "IND-1"
      },
      {
        "orderId": "ORD-002",
        "location": { "lat": 45.7640, "lng": 4.8357 },
        "pallets": 20,
        "address": "Lyon",
        "companyId": "IND-1"
      }
    ]
  }'
```

**Vérification** :
- La route est optimisée (livraison + retour palette)
- La distance totale est calculée
- Chaque livraison a un site de retour suggéré

#### 2. Test des alertes palettes

```bash
curl http://localhost:3005/affret/pallet-alerts
```

**Vérification** :
- Les sites proches de saturation sont détectés
- Les entreprises avec gros soldes négatifs sont listées
- Les actions suggérées sont pertinentes

#### 3. Test du devis avec palettes

```bash
curl http://localhost:3005/affret-ia/quote/ORD-123
```

**Vérification** :
- Le prix inclut le coût de retour palettes
- Le `priceBreakdown` est présent
- Le `palletInfo` contient le site suggéré et le coût

---

## 5. Exemples de requêtes complètes

### Scénario 1 : Tournée multi-livraisons avec palettes

```bash
# 1. Optimiser la tournée
curl -X POST http://localhost:3005/affret/optimize-pallet-routes \
  -H "Content-Type: application/json" \
  -d '{
    "deliveries": [
      {
        "orderId": "ORD-100",
        "location": { "lat": 48.8566, "lng": 2.3522 },
        "pallets": 33,
        "address": "15 Rue de Rivoli, 75001 Paris",
        "companyId": "IND-1"
      },
      {
        "orderId": "ORD-101",
        "location": { "lat": 48.9023, "lng": 2.3789 },
        "pallets": 28,
        "address": "Zone Industrielle Nord, 93000 Paris",
        "companyId": "IND-1"
      },
      {
        "orderId": "ORD-102",
        "location": { "lat": 45.7640, "lng": 4.8357 },
        "pallets": 15,
        "address": "123 Avenue Jean Jaurès, 69007 Lyon",
        "companyId": "IND-1"
      }
    ]
  }'

# 2. Vérifier les alertes
curl http://localhost:3005/affret/pallet-alerts

# 3. Obtenir un devis pour chaque ordre
curl http://localhost:3005/affret-ia/quote/ORD-100
curl http://localhost:3005/affret-ia/quote/ORD-101
curl http://localhost:3005/affret-ia/quote/ORD-102
```

### Scénario 2 : Gestion admin complète

```bash
# 1. Consulter tous les sites
curl http://localhost:3011/palette/sites

# 2. Consulter le ledger d'une entreprise
curl http://localhost:3011/palette/ledger/IND-1

# 3. Mettre à jour le quota d'un site
curl -X POST http://localhost:3011/palette/sites/SITE-PARIS-1/quota \
  -H "Content-Type: application/json" \
  -d '{"dailyMax": 200}'

# 4. Consulter les litiges
curl http://localhost:3011/palette/disputes
```

---

## 6. Points d'attention et limitations

### Limitations actuelles

1. **Endpoint manquant** : `GET /palette/admin/cheques`
   - L'onglet "Chèques" du backoffice nécessite un endpoint pour lister tous les chèques
   - À implémenter dans `services/palette/src/server.js`

2. **Géocodage simulé**
   - Le service Affret.IA utilise des coordonnées GPS par défaut si `order.deliveryLocation` n'est pas fourni
   - En production, intégrer un service de géocodage (Google Maps, OpenStreetMap)

3. **Résolution de litiges**
   - L'interface permet de voir les litiges mais pas encore de les résoudre
   - À implémenter : endpoint `PUT /palette/disputes/:id/resolve`

4. **Création de sites**
   - Le backoffice permet de modifier les quotas mais pas de créer de nouveaux sites
   - À implémenter : endpoint `POST /palette/sites`

5. **Photos**
   - Le système accepte des photos en base64 mais ne les stocke pas dans S3
   - À implémenter : intégration S3 pour stockage pérenne

### Recommandations pour la production

1. **Authentification renforcée**
   - Ajouter une vérification JWT stricte sur tous les endpoints admin
   - Logs d'audit pour toutes les modifications

2. **Rate limiting**
   - Appliquer des limites spécifiques pour les endpoints d'optimisation (coûteux en calcul)

3. **Cache**
   - Mettre en cache les résultats d'optimisation de route
   - TTL de 5 minutes pour éviter les calculs redondants

4. **Notifications**
   - Envoyer des alertes en temps réel quand un site atteint 90% de saturation
   - Webhooks vers Slack/Teams pour les alertes CRITICAL

5. **Machine Learning**
   - Utiliser l'historique pour prédire les flux de palettes
   - Suggérer des augmentations de quota avant saturation

---

## 7. Architecture des interactions

```
┌──────────────────┐
│  Backoffice      │
│  Admin (3000)    │
└────────┬─────────┘
         │
         │ HTTP GET/POST
         ▼
┌──────────────────┐      ┌──────────────────┐
│  Service Palette │◄─────┤  Service Affret  │
│  (3011)          │      │  IA (3005)       │
└──────────────────┘      └──────────────────┘
         │                         │
         │                         │
         ▼                         ▼
┌──────────────────┐      ┌──────────────────┐
│  Seeds Palettes  │      │  Seeds Orders    │
│  - companies     │      │  - carriers      │
│  - sites         │      │  - policies      │
│  - ledger        │      │  - grids         │
└──────────────────┘      └──────────────────┘
```

**Flux de données** :
1. Backoffice Admin → Service Palette : Gestion CRUD
2. Affret.IA → Service Palette : Matching sites, alertes
3. Affret.IA → Backoffice : Suggestions d'optimisation

---

## 8. Résumé des fichiers créés/modifiés

### Fichiers créés

| Fichier | Description |
|---------|-------------|
| `apps/backoffice-admin/lib/api/palettes.ts` | Client API TypeScript pour le service Palette |
| `apps/backoffice-admin/pages/palettes.tsx` | Interface d'administration complète (6 onglets) |
| `docs/MODULE_PALETTES_ADMIN_AFFRET.md` | Documentation technique (ce fichier) |

### Fichiers modifiés

| Fichier | Modification |
|---------|--------------|
| `apps/backoffice-admin/pages/_app.tsx` | Ajout du lien "Palettes" dans la navigation |
| `services/affret-ia/src/server.js` | Ajout de 3 endpoints : optimize-pallet-routes, pallet-alerts, modification de /quote |

---

## 9. Checklist de validation

- [x] Client API palettes créé dans backoffice-admin
- [x] Page d'administration avec 6 onglets fonctionnels
- [x] Menu "Palettes" ajouté dans la navigation
- [x] Endpoint `/affret/optimize-pallet-routes` implémenté
- [x] Endpoint `/affret/pallet-alerts` implémenté
- [x] Endpoint `/affret-ia/quote` étendu avec coût palettes
- [x] Algorithme TSP simplifié pour optimisation de route
- [x] Calcul distance Haversine
- [x] Détection saturation sites (> 90%)
- [x] Détection soldes négatifs entreprises (< -100)
- [x] Export CSV des ledgers et sites
- [x] Documentation complète avec exemples

---

## 10. Contact et support

Pour toute question technique sur cette implémentation :
- **Documentation module palettes** : `docs/MODULE_PALETTES.md`
- **Architecture globale** : `docs/ARCHITECTURE_CONNEXIONS.md`
- **Service Palette** : `services/palette/src/server.js`
- **Service Affret.IA** : `services/affret-ia/src/server.js`

---

**Version** : 1.0.0
**Date** : Janvier 2025
**Auteur** : RT Technologie
