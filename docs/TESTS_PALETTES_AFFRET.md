# Tests du Module Palettes - Admin & Affret.IA

Ce document contient des exemples de requêtes cURL pour tester les nouvelles fonctionnalités.

## Démarrage des services

```bash
# Terminal 1 - Service Palette (port 3011)
cd "C:/Users/rtard/OneDrive - RT LOGISTIQUE/RT Technologie/RT-Technologie/services/palette"
node src/server.js

# Terminal 2 - Service Affret.IA (port 3005)
cd "C:/Users/rtard/OneDrive - RT LOGISTIQUE/RT Technologie/RT-Technologie/services/affret-ia"
node src/server.js

# Terminal 3 - Backoffice Admin (port 3000)
cd "C:/Users/rtard/OneDrive - RT LOGISTIQUE/RT Technologie/RT-Technologie/apps/backoffice-admin"
pnpm dev
```

---

## Tests Affret.IA

### 1. Optimisation de route avec palettes

```bash
# Exemple avec 3 livraisons à Paris et Lyon
curl -X POST http://localhost:3005/affret/optimize-pallet-routes \
  -H "Content-Type: application/json" \
  -d '{
    "deliveries": [
      {
        "orderId": "ORD-001",
        "location": { "lat": 48.8566, "lng": 2.3522 },
        "pallets": 33,
        "address": "15 Rue de Rivoli, 75001 Paris",
        "companyId": "IND-1"
      },
      {
        "orderId": "ORD-002",
        "location": { "lat": 48.9023, "lng": 2.3789 },
        "pallets": 28,
        "address": "Zone Industrielle Nord, 93000 Paris",
        "companyId": "IND-1"
      },
      {
        "orderId": "ORD-003",
        "location": { "lat": 45.7640, "lng": 4.8357 },
        "pallets": 15,
        "address": "123 Avenue Jean Jaurès, 69007 Lyon",
        "companyId": "IND-1"
      }
    ]
  }'
```

**Résultat attendu** :
- Route optimisée avec ordre de livraisons
- Pour chaque livraison : site de retour suggéré + distance
- Distance totale calculée (livraisons + retours palettes)

---

### 2. Alertes palettes

```bash
# Récupérer toutes les alertes en temps réel
curl http://localhost:3005/affret/pallet-alerts
```

**Résultat attendu** :
- Liste des sites proches de saturation (> 90%)
- Sites complets (100%)
- Entreprises avec soldes très négatifs (< -100 palettes)
- Actions suggérées pour chaque alerte

---

### 3. Devis avec coût palettes

```bash
# Créer une commande de test d'abord (si nécessaire)
# Ensuite récupérer le devis avec coût palettes inclus

# Exemple avec un orderId existant
curl http://localhost:3005/affret-ia/quote/ORD-123

# Si l'ordre n'existe pas, utiliser les seeds dans infra/seeds/orders.json
```

**Résultat attendu** :
- Prix total incluant le retour palettes
- `priceBreakdown` avec détail (transport + palettes)
- `palletInfo` avec site suggéré et recommandation

---

## Tests Service Palette (prérequis)

### Vérifier les sites disponibles

```bash
curl http://localhost:3011/palette/sites
```

### Vérifier le ledger d'une entreprise

```bash
curl http://localhost:3011/palette/ledger/IND-1
```

### Créer un chèque palette (pour simuler des données)

```bash
curl -X POST http://localhost:3011/palette/cheques/generate \
  -H "Content-Type: application/json" \
  -d '{
    "fromCompanyId": "IND-1",
    "orderId": "ORD-TEST-001",
    "quantity": 33,
    "transporterPlate": "AB-123-CD",
    "deliveryLocation": {
      "lat": 48.8566,
      "lng": 2.3522
    }
  }'
```

### Mettre à jour le quota d'un site

```bash
curl -X POST http://localhost:3011/palette/sites/SITE-PARIS-1/quota \
  -H "Content-Type: application/json" \
  -d '{
    "dailyMax": 200
  }'
```

---

## Tests Backoffice Admin (Interface Web)

### 1. Dashboard
```
URL: http://localhost:3000/palettes
```

**Actions à tester** :
1. Vérifier l'affichage des KPIs
2. Consulter les tops balances (positives et négatives)
3. Cliquer sur "Rafraîchir les données"

**Validation** :
- Les chiffres correspondent aux données des seeds
- Les entreprises avec les plus gros soldes apparaissent

---

### 2. Onglet Ledgers
**Actions à tester** :
1. Naviguer vers l'onglet "Ledgers"
2. Vérifier le tableau des soldes
3. Cliquer sur "Exporter CSV"

**Validation** :
- Toutes les entreprises sont listées avec leur solde
- Le nombre de transactions est correct
- Le CSV se télécharge avec les bonnes données

---

### 3. Onglet Sites
**Actions à tester** :
1. Naviguer vers l'onglet "Sites"
2. Cliquer sur "Gérer quota" pour un site
3. Modifier le quota journalier (ex: passer de 150 à 200)
4. Cliquer sur "Mettre à jour"
5. Cliquer sur "Exporter CSV"

**Validation** :
- Le quota est bien mis à jour (vérifier via API)
- Le message de succès apparaît
- Le CSV contient tous les sites

---

### 4. Onglet Disputes
**Actions à tester** :
1. Naviguer vers l'onglet "Disputes"
2. Vérifier l'affichage des litiges (s'il y en a)

**Note** : Pour créer un litige de test, utiliser :
```bash
curl -X POST http://localhost:3011/palette/disputes \
  -H "Content-Type: application/json" \
  -d '{
    "chequeId": "CHQ-XXX",
    "claimantId": "CARRIER-A",
    "reason": "Palettes endommagées",
    "comments": "5 palettes cassées sur 33"
  }'
```

---

### 5. Onglet Analytics
**Actions à tester** :
1. Naviguer vers l'onglet "Analytics"
2. Consulter les graphiques de répartition

**Validation** :
- Le nombre de crédits vs dettes est correct
- La répartition des sites par priorité est visible

---

## Scénarios de test complets

### Scénario 1 : Optimisation d'une tournée multi-livraisons

**Objectif** : Optimiser une tournée de 3 livraisons avec retours palettes

**Étapes** :
1. Lancer le service Palette et Affret.IA
2. Exécuter la requête d'optimisation avec 3 livraisons
3. Analyser la réponse :
   - Vérifier l'ordre des étapes (livraison → retour palette)
   - Vérifier que chaque livraison a un site de retour dans un rayon de 30km
   - Vérifier le calcul de distance totale

**Commande** :
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
        "location": { "lat": 48.9023, "lng": 2.3789 },
        "pallets": 20,
        "address": "Paris Nord",
        "companyId": "IND-1"
      },
      {
        "orderId": "ORD-003",
        "location": { "lat": 45.7640, "lng": 4.8357 },
        "pallets": 15,
        "address": "Lyon",
        "companyId": "IND-1"
      }
    ]
  }'
```

**Résultat attendu** :
```json
{
  "optimizedRoute": [
    { "step": 1, "type": "delivery", "orderId": "ORD-001", ... },
    { "step": 2, "type": "pallet_return", "siteId": "SITE-PARIS-1", ... },
    { "step": 3, "type": "delivery", "orderId": "ORD-002", ... },
    { "step": 4, "type": "pallet_return", "siteId": "SITE-PARIS-1", ... },
    { "step": 5, "type": "delivery", "orderId": "ORD-003", ... },
    { "step": 6, "type": "pallet_return", "siteId": "SITE-LYON-1", ... }
  ],
  "totalDistance": 415.2,
  "totalSteps": 6,
  "deliveries": 3
}
```

---

### Scénario 2 : Détection d'alertes critiques

**Objectif** : Simuler une saturation de site et détecter l'alerte

**Étapes** :
1. Mettre à jour le quota d'un site pour simuler une saturation :
```bash
curl -X POST http://localhost:3011/palette/sites/SITE-PARIS-1/quota \
  -H "Content-Type: application/json" \
  -d '{
    "dailyMax": 10,
    "consumed": 9
  }'
```

2. Récupérer les alertes :
```bash
curl http://localhost:3005/affret/pallet-alerts
```

3. Vérifier qu'une alerte "SITE_NEAR_SATURATION" est présente pour SITE-PARIS-1

**Résultat attendu** :
```json
{
  "alerts": [
    {
      "type": "SITE_NEAR_SATURATION",
      "severity": "WARNING",
      "siteId": "SITE-PARIS-1",
      "siteName": "Entrepôt Paris Nord",
      "message": "Site proche de saturation: 90% (9/10)",
      ...
    }
  ],
  "totalAlerts": 1,
  "critical": 0,
  "warnings": 1
}
```

---

### Scénario 3 : Gestion admin complète

**Objectif** : Tester toutes les fonctionnalités du backoffice admin

**Étapes** :
1. Ouvrir http://localhost:3000/palettes
2. **Dashboard** :
   - Vérifier les 4 KPIs (sites, entreprises, palettes, litiges)
   - Consulter les tops balances
3. **Ledgers** :
   - Aller sur l'onglet Ledgers
   - Vérifier que toutes les entreprises sont listées
   - Exporter en CSV
   - Ouvrir le CSV et vérifier les données
4. **Sites** :
   - Aller sur l'onglet Sites
   - Sélectionner "SITE-PARIS-1"
   - Cliquer sur "Gérer quota"
   - Modifier le quota de 150 à 180
   - Cliquer sur "Mettre à jour"
   - Vérifier le message de succès
   - Exporter les sites en CSV
5. **Analytics** :
   - Aller sur l'onglet Analytics
   - Consulter les graphiques

---

### Scénario 4 : Devis avec palettes

**Objectif** : Obtenir un devis incluant le coût de retour des palettes

**Prérequis** : Avoir une commande avec des palettes dans les seeds

**Commande** :
```bash
# Utiliser un orderId existant dans infra/seeds/orders.json
curl http://localhost:3005/affret-ia/quote/ORD-123
```

**Résultat attendu** :
```json
{
  "orderId": "ORD-123",
  "price": 650,
  "currency": "EUR",
  "suggestedCarriers": ["CARRIER-A"],
  "priceBreakdown": {
    "baseTransport": 500,
    "palletReturn": 150,
    "total": 650
  },
  "palletInfo": {
    "pallets": 33,
    "returnSite": {
      "id": "SITE-PARIS-1",
      "name": "Entrepôt Paris Nord",
      "distance": 5.2,
      "address": "Zone Industrielle Nord, 93000 Paris"
    },
    "returnCost": 150,
    "recommendation": "Retour palettes suggéré: Entrepôt Paris Nord à 5.2km. Coût estimé: 150 EUR."
  }
}
```

---

## Validation finale

### Checklist de test

- [ ] Service Palette démarre sans erreur (port 3011)
- [ ] Service Affret.IA démarre sans erreur (port 3005)
- [ ] Backoffice Admin démarre sans erreur (port 3000)
- [ ] Endpoint `/affret/optimize-pallet-routes` retourne une route optimisée
- [ ] Endpoint `/affret/pallet-alerts` détecte les saturations et soldes négatifs
- [ ] Endpoint `/affret-ia/quote` inclut le coût palettes
- [ ] Dashboard backoffice affiche les KPIs correctement
- [ ] Onglet Ledgers affiche tous les soldes
- [ ] Export CSV des ledgers fonctionne
- [ ] Onglet Sites affiche tous les sites
- [ ] Modification de quota fonctionne
- [ ] Export CSV des sites fonctionne
- [ ] Onglet Disputes affiche les litiges (si présents)
- [ ] Onglet Analytics affiche les graphiques

---

## Dépannage

### Le service Palette ne démarre pas
**Solution** : Vérifier que les seeds sont présents dans `infra/seeds/`

### Le service Affret.IA ne peut pas contacter le service Palette
**Solution** : Vérifier la variable d'environnement `PALETTE_API_URL=http://localhost:3011`

### Le backoffice ne charge pas les données
**Solution** : Vérifier `NEXT_PUBLIC_PALETTE_API_URL` dans les variables d'environnement

### Erreur CORS
**Solution** : Les headers CORS sont déjà configurés dans les services, vérifier que les services sont bien sur localhost

---

## Métriques de performance

### Optimisation de route
- **Temps de réponse attendu** : < 500ms pour 5 livraisons
- **Temps de réponse attendu** : < 2s pour 20 livraisons

### Alertes palettes
- **Temps de réponse attendu** : < 1s pour 10 sites
- **Temps de réponse attendu** : < 3s pour 50 sites

### Devis avec palettes
- **Temps de réponse attendu** : < 300ms (incluant l'appel au service Palette)

---

**Version** : 1.0.0
**Date** : Janvier 2025
