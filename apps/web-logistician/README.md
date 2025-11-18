# Web Logistician App

Application web Next.js 14 pour la gestion d'entrepôt RT Technologie.

## Vue d'ensemble

L'application **web-logistician** permet aux gestionnaires d'entrepôts de gérer l'ensemble des opérations logistiques :

- **Planning des quais** : Vue en temps réel et gestion des créneaux RDV
- **E-CMR** : Génération et signature électronique de CMR
- **Réceptions** : Contrôle qualité et enregistrement des arrivées
- **Expéditions** : Préparation et contrôle des chargements
- **Anomalies** : Déclaration et suivi des incidents
- **Scanner** : Lecture de codes-barres pour accès rapide

## Caractéristiques techniques

- **Framework** : Next.js 14 (React 18)
- **TypeScript** : Typage complet
- **PWA** : Mode hors-ligne avec Service Worker
- **Responsive** : Optimisé pour tablettes et mobiles
- **Touch-friendly** : Interface tactile avec boutons > 44px
- **Signature électronique** : Canvas HTML5
- **Capture photo** : Intégration caméra native
- **Scanner codes-barres** : Support caméra et saisie manuelle

## Installation

```bash
# Installer les dépendances
pnpm install

# Copier le fichier d'environnement
cp .env.example .env.local

# Lancer en développement (port 3106)
pnpm dev

# Build pour production
pnpm build

# Lancer en production
pnpm start
```

## Configuration

Créer un fichier `.env.local` avec les variables suivantes :

```env
NEXT_PUBLIC_PLANNING_API=http://localhost:3004
NEXT_PUBLIC_ECMR_API=http://localhost:3009
NEXT_PUBLIC_ORDERS_API=http://localhost:3001
NEXT_PUBLIC_SUPPORT_URL=https://www.rt-technologie.com/support
```

## Structure des pages

### Pages principales

- `/` - Dashboard avec statistiques
- `/login` - Authentification
- `/docks` - Planning des quais
- `/ecmr` - Liste des E-CMR
- `/ecmr/new` - Nouveau E-CMR
- `/ecmr/sign` - Signature électronique
- `/receptions` - Liste des réceptions
- `/expeditions` - Liste des expéditions
- `/anomalies` - Liste des anomalies
- `/anomalies/new` - Déclaration d'anomalie
- `/scanner` - Scanner de codes-barres

### Fonctionnalités par page

#### Planning des quais (`/docks`)
- Vue en temps réel des 8 quais
- États : Disponible, Occupé, Maintenance
- Liste des rendez-vous programmés
- Confirmation d'arrivée transporteur
- Libération de quai

#### E-CMR (`/ecmr`)
- Liste des CMR électroniques
- Filtres : Tous, Brouillons, En attente, Terminés
- Création de nouveaux CMR
- Signature électronique (logisticien + transporteur)
- Export PDF (à venir)

#### Réceptions (`/receptions`)
- Liste des réceptions planifiées
- Contrôle qualité avec :
  - Comptage des palettes
  - Capture de photos
  - Notes sur l'état
- Détection automatique d'anomalies
- Redirection vers déclaration d'anomalie si nécessaire

#### Expéditions (`/expeditions`)
- Liste des expéditions à préparer
- Contrôle de chargement :
  - Vérification du nombre de palettes
  - Photos avant départ
  - Notes de chargement
- Confirmation de départ
- Détection d'anomalies

#### Anomalies (`/anomalies`)
- Déclaration d'incidents :
  - Palettes manquantes
  - Marchandise endommagée
  - Mauvaise livraison
  - Problème qualité
- Niveaux de gravité : Faible, Moyenne, Élevée, Critique
- Photos de l'incident
- Notification automatique des parties impactées

#### Scanner (`/scanner`)
- Activation de la caméra
- Détection de codes-barres
- Saisie manuelle alternative
- Redirection automatique selon le type de code

## APIs utilisées

### Planning Service (port 3004)
- `POST /planning/rdv/propose` - Proposer un RDV
- `POST /planning/rdv/confirm` - Confirmer un RDV

### E-CMR Service (port 3009)
- `POST /ecmr/sign-at-dock` - Signature au quai
- `POST /ecmr/sign-at-delivery` - Signature à la livraison

### Core Orders Service (port 3001)
- `GET /industry/orders/{id}` - Détail d'une commande
- `POST /industry/orders/{id}/dispatch` - Lancer le dispatch

## Mode hors-ligne (PWA)

L'application fonctionne en Progressive Web App avec :

- **Service Worker** : Cache des assets statiques
- **Cache API** : Stockage local des données
- **Synchronisation** : Replay automatique à la reconnexion
- **Indicateur** : Bandeau orange en mode hors-ligne

### Installation sur appareil mobile

1. Ouvrir l'application dans le navigateur
2. Cliquer sur "Ajouter à l'écran d'accueil"
3. L'icône apparaît avec les autres apps
4. Fonctionne en mode standalone

## Optimisations tablette

- **Boutons** : Minimum 44x44px (Apple HIG)
- **Police** : Minimum 16px (évite le zoom iOS)
- **Touch targets** : Espacement suffisant
- **Viewport** : `user-scalable=no` pour éviter le zoom involontaire
- **Orientation** : Portrait par défaut
- **Clavier** : Adaptation automatique iOS/Android

## Sécurité

- **JWT** : Token stocké dans localStorage
- **Expiration** : Redirection auto vers /login si token invalide
- **HTTPS** : Obligatoire en production
- **CORS** : Configuration des APIs backend

## Déploiement

### Vercel (recommandé)

```bash
# Installation Vercel CLI
npm i -g vercel

# Premier déploiement
vercel

# Production
vercel --prod
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build
EXPOSE 3106
CMD ["npm", "start"]
```

## Support navigateurs

- Chrome/Edge 90+
- Safari 14+
- Firefox 88+
- Chrome Mobile 90+
- Safari iOS 14+

## Développement

### Ajouter une nouvelle page

1. Créer le fichier dans `pages/`
2. Ajouter le lien dans `_app.tsx`
3. Implémenter la logique métier
4. Tester en responsive (mobile + tablette)

### Conventions de code

- **Composants** : PascalCase
- **Fichiers** : kebab-case ou camelCase
- **Props** : Interface TypeScript
- **Styles** : Inline avec objets TypeScript
- **Async** : async/await (pas de .then())

### Tests

```bash
# Lancer les tests unitaires
pnpm test

# Tests E2E
pnpm test:e2e

# Coverage
pnpm test:coverage
```

## Troubleshooting

### La caméra ne fonctionne pas
- Vérifier les permissions du navigateur
- HTTPS obligatoire (sauf localhost)
- Utiliser la saisie manuelle alternative

### Mode hors-ligne ne se déclenche pas
- Vérifier que le Service Worker est enregistré
- Ouvrir DevTools > Application > Service Workers
- En dev, le PWA est désactivé par défaut

### Erreurs d'API
- Vérifier que les services backend sont lancés
- Contrôler les variables d'environnement
- Regarder la console réseau (DevTools)

## Support

Pour toute question ou problème :
- Email : support@rt-technologie.com
- Documentation : https://docs.rt-technologie.com
- Issues GitHub : https://github.com/rt-technologie/issues

## Licence

© 2024 RT Technologie - Tous droits réservés
