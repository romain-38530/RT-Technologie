# Storage Market Service

Service de gestion de la bourse de stockage pour RT-Technologie.

## Description

Ce service gère l'ensemble du marché de stockage : publication des besoins, gestion des offres, contractualisation et suivi opérationnel via intégration WMS.

## Port

3013

## Endpoints

### Publication de besoins
- `POST /storage-market/needs/create` - Créer un besoin de stockage
- `GET /storage-market/needs` - Lister les besoins
- `GET /storage-market/needs/:id` - Détails d'un besoin
- `PUT /storage-market/needs/:id` - Modifier un besoin
- `DELETE /storage-market/needs/:id` - Supprimer un besoin

### Offres des logisticiens
- `POST /storage-market/offers/send` - Soumettre une offre
- `GET /storage-market/offers/:needId` - Lister les offres pour un besoin
- `POST /storage-market/offers/ranking` - Classement IA des offres

### Capacités logistiques
- `POST /storage-market/logistician-capacity` - Déclarer un site
- `PUT /storage-market/logistician-capacity/:siteId` - Modifier un site
- `GET /storage-market/logistician-capacity/:logisticianId` - Sites d'un logisticien

### Contractualisation
- `POST /storage-market/contracts/create` - Créer un contrat
- `GET /storage-market/contracts/:id` - Détails d'un contrat
- `PUT /storage-market/contracts/:id/status` - Modifier statut
- `GET /storage-market/contracts` - Lister les contrats

### Intégration WMS
- `POST /storage-market/wms/connect` - Connecter un WMS
- `GET /storage-market/wms/inventory/:contractId` - Inventaire temps réel
- `GET /storage-market/wms/movements/:contractId` - Mouvements

### Administration
- `GET /storage-market/admin/stats` - Statistiques globales
- `GET /storage-market/admin/logisticians` - Liste logisticiens
- `POST /storage-market/admin/logisticians/:id/approve` - Approuver abonnement

## Variables d'environnement

- `PORT` - Port du service (défaut: 3013)
- `MONGODB_URI` - URI MongoDB (optionnel)
- `SECURITY_ENFORCE` - Activer l'authentification (true/false)

## Démarrage

```bash
npm run dev
```

## Docker

```bash
docker build -t storage-market .
docker run -p 3013:3013 storage-market
```
