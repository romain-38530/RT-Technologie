# Storage Market - Intégration Frontend

Ce document décrit l'intégration du service Storage Market (port 3013) avec les applications frontend.

## Applications Connectées

### 1. web-industry (Industriels)
**Objectif**: Publication de besoins de stockage et sélection d'offres

**Pages intégrées**:
- `/storage` - Dashboard besoins de stockage
- `/storage/needs` - Liste des besoins
- `/storage/needs/new` - Création besoin
- `/storage/needs/[id]` - Détail besoin
- `/storage/needs/[id]/offers` - Offres reçues avec ranking IA
- `/storage/contracts` - Mes contrats
- `/storage/contracts/[id]` - Détail contrat
- `/storage/analytics` - Analytics stockage

**API Client**: `apps/web-industry/src/lib/api/storage.ts`

**Fonctionnalités principales**:
- Création et gestion de besoins de stockage
- Visualisation des offres avec classement IA
- Acceptation d'offres et création de contrats
- Suivi des contrats actifs
- Intégration WMS pour visualisation stock temps réel

**Ranking IA**:
L'algorithme de classement des offres prend en compte:
- Prix (40 points) - Comparaison vs moyenne du marché
- Proximité (25 points) - Distance via formule Haversine
- Fiabilité (20 points) - Score basé sur historique
- Réactivité (15 points) - Rapidité de réponse

### 2. web-logistician (Logisticiens)
**Objectif**: Consultation de besoins et soumission d'offres

**Pages intégrées**:
- `/storage-market` - Marketplace des besoins disponibles
- `/storage-market/need/[id]` - Détail d'un besoin
- `/storage-market/offer-form/[id]` - Formulaire soumission offre
- `/my-sites` - Gestion des sites logistiques
- `/my-contracts` - Mes contrats actifs

**API Client**: `apps/web-logistician/lib/api/storage.ts`

**Fonctionnalités principales**:
- Consultation des besoins publiés (marketplace)
- Filtrage par région, type, distance, budget
- Soumission d'offres avec tarification et capacités
- Gestion des sites et capacités disponibles
- Suivi des contrats obtenus
- Intégration WMS pour synchronisation stock

### 3. backoffice-admin (Administration)
**Objectif**: Modération et supervision du marché

**Pages intégrées**:
- `/storage-market` - Dashboard admin
- `/storage-market/logisticians` - Gestion des logisticiens
- `/storage-market/needs` - Modération des besoins
- `/storage-market/analytics` - Rapports et analytics

**API Client**: `apps/backoffice-admin/lib/api/storage.ts`

**Fonctionnalités principales**:
- Statistiques globales du marché
- Validation des abonnements logisticiens
- Modération des besoins publiés
- Supervision des contrats
- Génération de rapports
- Export CSV des données

## Variables d'Environnement

Ajoutez dans chaque `.env.local`:

```bash
NEXT_PUBLIC_STORAGE_MARKET_API_URL=http://localhost:3013
```

Pour la production:
```bash
NEXT_PUBLIC_STORAGE_MARKET_API_URL=https://api.rt-technologie.com/storage-market
```

## Endpoints API Utilisés

### Besoins (Needs)
- `POST /storage-market/needs/create` - Créer un besoin
- `GET /storage-market/needs` - Liste des besoins (avec filtres)
- `GET /storage-market/needs/:id` - Détail d'un besoin
- `PUT /storage-market/needs/:id` - Modifier un besoin
- `DELETE /storage-market/needs/:id` - Supprimer un besoin

### Offres (Offers)
- `POST /storage-market/offers/send` - Soumettre une offre
- `GET /storage-market/offers/:needId` - Offres pour un besoin
- `POST /storage-market/offers/ranking` - Obtenir offres classées par IA

### Contrats (Contracts)
- `POST /storage-market/contracts/create` - Créer un contrat
- `GET /storage-market/contracts` - Liste des contrats (avec filtres)
- `GET /storage-market/contracts/:id` - Détail d'un contrat
- `PUT /storage-market/contracts/:id/status` - Modifier statut contrat

### Capacités Logistiques
- `POST /storage-market/logistician-capacity` - Créer un site
- `GET /storage-market/logistician-capacity/:logisticianId` - Sites d'un logisticien
- `PUT /storage-market/logistician-capacity/:siteId` - Modifier capacités

### WMS (Intégration)
- `POST /storage-market/wms/connect` - Connecter un WMS
- `GET /storage-market/wms/inventory/:contractId` - Inventaire temps réel
- `GET /storage-market/wms/movements/:contractId` - Mouvements de stock

### Administration
- `GET /storage-market/admin/stats` - Statistiques globales
- `GET /storage-market/admin/logisticians` - Liste logisticiens
- `POST /storage-market/admin/logisticians/:id/approve` - Approuver logisticien

## Types TypeScript

Tous les types sont définis dans les API clients respectifs:
- `StorageNeed` - Structure d'un besoin
- `StorageOffer` - Structure d'une offre
- `StorageContract` - Structure d'un contrat
- `LogisticianSite` - Structure d'un site logistique

## Tests d'Intégration

Pour tester l'intégration frontend-backend:

```bash
# Démarrer le service storage-market
cd services/storage-market
node src/server.js

# Dans un autre terminal, lancer les tests
node services/storage-market/tests/integration-frontend.test.js
```

Les tests couvrent:
1. Health check du service
2. Création d'un besoin (industriel)
3. Consultation des besoins (logisticien)
4. Soumission d'une offre (logisticien)
5. Ranking IA des offres (industriel)
6. Création de contrat (industriel)
7. Statistiques admin (backoffice)
8. Intégration WMS (industriel)

## Workflow Complet

### Scénario: Publication et Contractualisation

1. **Industriel** (web-industry):
   - Crée un besoin de stockage via `/storage/needs/new`
   - Le besoin est publié sur la marketplace

2. **Logisticien** (web-logistician):
   - Consulte les besoins disponibles sur `/storage-market`
   - Filtre par proximité/capacités
   - Soumet une offre avec tarification

3. **IA Ranking** (automatique):
   - Le système classe les offres selon 4 critères
   - Score global attribué à chaque offre
   - Top 3 marquées comme recommandées

4. **Industriel** (web-industry):
   - Consulte les offres sur `/storage/needs/[id]/offers`
   - Voit le classement IA et les raisons
   - Accepte l'offre choisie

5. **Création Contrat** (automatique):
   - Statut du besoin → CONTRACTED
   - Offre choisie → ACCEPTED
   - Autres offres → REJECTED
   - Nouveau contrat → ACTIVE

6. **Suivi** (both):
   - Industriel: `/storage/contracts/[id]`
   - Logisticien: `/my-contracts`
   - Intégration WMS pour suivi stock temps réel

7. **Admin** (backoffice-admin):
   - Supervise via `/storage-market`
   - Peut intervenir en cas de litige
   - Génère rapports et analytics

## Composants Design System

Les composants suivants du design-system peuvent être utilisés:
- `StorageNeedCard` - Affichage d'un besoin
- `OfferCard` - Affichage d'une offre
- `OfferComparator` - Comparaison d'offres
- `AIRankingBadge` - Badge avec score IA
- `ContractTimeline` - Timeline d'un contrat
- `CapacityGauge` - Jauge de capacité
- `SiteMap` - Carte des sites (Leaflet)
- `WMSIntegrationPanel` - Panneau intégration WMS

## Gestion des Erreurs

Tous les API clients gèrent les erreurs de manière uniforme:

```typescript
try {
  const needs = await getNeeds()
} catch (error) {
  if (error instanceof ApiError) {
    // Erreur API avec status et détails
    console.error(`API Error ${error.status}:`, error.data)
  } else {
    // Erreur réseau ou autre
    console.error('Network error:', error.message)
  }
}
```

## Authentification

Les API clients utilisent automatiquement le token JWT stocké dans localStorage:
- `getAuthToken()` - Récupère le token
- `setAuthToken(token)` - Définit le token
- `clearAuthToken()` - Supprime le token

Le token est automatiquement ajouté à l'header `Authorization: Bearer <token>`.

## Performance

- Les listes sont paginées côté client (pas encore côté serveur)
- Les images et documents sont chargés en lazy loading
- Le ranking IA est calculé à la demande (pas en temps réel)
- Les stats admin sont mises en cache côté client (refresh manuel)

## Prochaines Étapes

1. Ajouter pagination côté serveur
2. WebSocket pour notifications temps réel
3. Upload de documents (photos, PDFs)
4. Signature électronique des contrats
5. Module de facturation automatique
6. Analytics avancés avec graphiques
7. Export Excel en plus de CSV
8. API publique pour intégrations tierces

## Support

Pour toute question sur l'intégration:
- Documentation API: `/storage-market/README.md`
- Tests: `/storage-market/tests/integration-frontend.test.js`
- Slack: #storage-market-support
