# Agent Geo-Tracking

Service de géolocalisation temps réel avec géofencing automatique et calcul d'ETA pour l'application mobile conducteur.

## Responsabilités

- Enregistrer les positions GPS des conducteurs
- Détecter automatiquement les arrivées/départs (géofencing)
- Calculer l'ETA avec TomTom Traffic API
- Mettre à jour les statuts des missions
- Fournir l'historique de tracking

## Port

3016

## Technologies

- Express.js
- MongoDB
- TomTom Routing API
- Winston (logs)
- Joi (validation)
