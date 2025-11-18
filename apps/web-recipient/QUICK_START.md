# Quick Start - RT Recipient

Guide de démarrage rapide pour l'application web-recipient.

## Installation

### Prérequis
- Node.js 18+
- pnpm 8+
- Services backend en cours d'exécution (ou mock data)

### Installation des dépendances

```bash
# À la racine du monorepo
pnpm install

# Ou spécifiquement pour web-recipient
cd apps/web-recipient
pnpm install
```

## Configuration

### 1. Variables d'environnement

Créer un fichier `.env.local` :

```bash
cp .env.example .env.local
```

Contenu de `.env.local` :

```env
# API Endpoints - Ajuster selon votre environnement
NEXT_PUBLIC_API_CORE_ORDERS=http://localhost:3001
NEXT_PUBLIC_API_PLANNING=http://localhost:3004
NEXT_PUBLIC_API_ECMR=http://localhost:3009
NEXT_PUBLIC_API_TRACKING=http://localhost:3008

# Application
NEXT_PUBLIC_APP_NAME=RT Recipient
NEXT_PUBLIC_APP_VERSION=1.0.0

# Features
NEXT_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=false
NEXT_PUBLIC_ENABLE_GEOLOCATION=true
NEXT_PUBLIC_MAX_PHOTO_SIZE_MB=5
```

### 2. Services backend (optionnel)

Si les services ne sont pas disponibles, l'application utilisera les données mockées automatiquement.

Pour lancer les services :

```bash
# À la racine du monorepo
pnpm agents

# Ou individuellement
cd services/core-orders && pnpm dev    # Port 3001
cd services/planning && pnpm dev       # Port 3004
cd services/ecmr && pnpm dev          # Port 3009
cd services/tracking-ia && pnpm dev   # Port 3008
```

## Lancement

### Mode développement

```bash
# À la racine du monorepo
pnpm dev --filter=@rt/web-recipient

# Ou depuis le dossier de l'app
cd apps/web-recipient
pnpm dev
```

L'application sera accessible sur : **http://localhost:3102**

### Mode production

```bash
# Build
pnpm build

# Start
pnpm start
```

## Structure de navigation

Après le lancement, vous accéderez à ces pages :

### 1. `/deliveries` - Livraisons attendues (page d'accueil)
**Fonctionnalités** :
- Liste des livraisons à venir
- Filtres : Toutes / Aujourd'hui / Arrivée imminente
- ETA temps réel
- Détails complets par livraison

**Actions** :
- "Gérer le créneau" → Redirige vers `/slots`
- "Commencer la réception" → Redirige vers `/receive`

### 2. `/slots` - Gestion des créneaux
**Fonctionnalités** :
- Sélection d'une livraison
- Choix de la date (7 jours à venir)
- Visualisation des créneaux disponibles
- Proposition de créneau au transporteur

**Workflow** :
1. Sélectionner une livraison
2. Choisir une date
3. Cliquer sur un créneau disponible
4. "Proposer ce créneau"

### 3. `/receive` - Réception
**Fonctionnalités** :
- Workflow en 4 étapes
- Contrôle quantité et qualité
- Upload de photos (anomalies)
- Signature tactile du CMR

**Workflow complet** :
1. **Sélection** : Choisir la livraison à réceptionner
2. **Contrôle** :
   - Vérifier quantités reçues vs attendues
   - Vérifier état (Bon / Endommagé / Manquant)
   - Ajouter notes si anomalie
3. **Photos** :
   - Prendre photos si anomalies détectées
   - Ou skip si tout est conforme
4. **Signature** :
   - Saisir nom du signataire
   - Signer sur le canvas tactile
   - Valider

### 4. `/anomalies` - Déclaration anomalies
**Fonctionnalités** :
- Liste des anomalies existantes
- Déclaration de nouvelles anomalies
- Upload de photos
- Suivi statut de résolution

**Créer une anomalie** :
1. Cliquer "Déclarer une anomalie"
2. Sélectionner la livraison concernée
3. Remplir le formulaire :
   - Type (dégâts, manquants, etc.)
   - Gravité (mineure, majeure, critique)
   - Description détaillée
   - Photos (jusqu'à 5)
4. Soumettre

**Filtres disponibles** :
- Par statut : Toutes / Signalée / En révision / Résolue
- Par gravité : Toutes / Mineure / Majeure / Critique

### 5. `/history` - Historique
**Fonctionnalités** :
- Livraisons passées
- Statistiques de performance
- Analyse des transporteurs

**Filtres de période** :
- 7 derniers jours
- 30 derniers jours
- 90 derniers jours
- Tout l'historique

**Statistiques affichées** :
- Total livraisons
- Livraisons à l'heure
- Livraisons en retard
- Livraisons avec anomalies
- Taux de conformité
- Retard moyen
- Performance par transporteur

## Fonctionnalités spéciales

### Signature tactile
**Utilisation** :
- Fonctionne avec souris, doigt ou stylet
- Bouton "Recommencer" pour effacer
- Validation avant soumission
- Export en PNG base64

**Sur mobile** :
- Tourner l'appareil en paysage pour plus d'espace
- Utiliser le doigt ou un stylet
- La signature est en haute résolution

### Upload de photos
**Depuis smartphone** :
- Bouton "Prendre une photo" → Ouvre la caméra
- Bouton "Importer" → Choisir depuis galerie
- Limite : 5 photos par anomalie/réception

**Depuis ordinateur** :
- Bouton "Importer" → Sélectionner fichiers
- Formats supportés : JPG, PNG, WEBP
- Compression automatique

## Mock Data

En développement, si les services backend ne sont pas disponibles, l'application utilise des données mockées :

**Livraisons** : 3 livraisons fictives avec différents statuts
**Créneaux** : 5 créneaux par jour
**Anomalies** : 2 anomalies d'exemple
**Historique** : Génération automatique selon la période

## Dépannage

### Port déjà utilisé
```bash
# Changer le port dans package.json
"dev": "next dev -p 3103"  # Au lieu de 3102
```

### Erreurs de build
```bash
# Nettoyer et réinstaller
rm -rf node_modules .next
pnpm install
pnpm dev
```

### CORS errors
Vérifier que les services backend autorisent :
```javascript
cors({
  origin: 'http://localhost:3102',
  credentials: true
})
```

### Images ne s'affichent pas
Ajouter le domaine dans `next.config.js` :
```javascript
images: {
  domains: ['localhost', 'votre-domaine.com'],
}
```

## Développement

### Ajouter une nouvelle page

1. Créer le fichier dans `src/app/(main)/ma-page/page.tsx`
2. Ajouter la route dans `src/components/navigation.tsx`
3. Créer l'API dans `src/lib/api/` si nécessaire

### Ajouter un composant

1. Créer dans `src/components/mon-composant.tsx`
2. Exporter et utiliser dans les pages

### Modifier les types

1. Éditer `src/lib/api/types.ts`
2. TypeScript vérifiera automatiquement

## Tests

```bash
# Lancer les tests (à implémenter)
pnpm test

# Coverage
pnpm test:coverage

# E2E
pnpm test:e2e
```

## Build et déploiement

### Build local
```bash
pnpm build

# Tester le build
pnpm start
```

### Déploiement Vercel
```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel
```

### Docker
```bash
# Build image
docker build -t rt-recipient .

# Run
docker run -p 3102:3102 rt-recipient
```

## Support

- **Documentation** : Voir README.md et ARCHITECTURE.md
- **Issues** : Créer un ticket dans le repo
- **Contact** : équipe RT Technologie

## Prochaines étapes

1. Tester toutes les pages
2. Vérifier la connexion aux services backend
3. Personnaliser les données (recipient ID)
4. Configurer l'authentification
5. Déployer en production
