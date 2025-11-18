# Web Transporter - RT Technologie

Application Next.js 14 pour l'espace transporteur permettant la gestion des missions, planning, documents et profil.

## Fonctionnalités

### 1. Missions en attente (`/missions/pending`)
- Liste des missions DISPATCHED pour le transporteur connecté
- Countdown SLA avec indicateur visuel (critique/warning/normal)
- Boutons "Accepter" / "Refuser" pour chaque mission
- Rafraîchissement automatique toutes les 30 secondes
- Affichage des détails: origine, destination, palettes, poids

### 2. Missions acceptées (`/missions/accepted`)
- Liste des missions ACCEPTED par le transporteur
- Proposition de créneaux RDV
- Accès rapide aux documents de la mission
- Lien vers le planning

### 3. Planning (`/planning`)
- Vue calendrier hebdomadaire
- Créneaux RDV disponibles/occupés
- Navigation semaine précédente/suivante
- Retour à aujourd'hui
- Indicateurs visuels de disponibilité

### 4. Documents (`/documents`)
- Upload de CMR (Lettre de voiture)
- Upload de photos de livraison
- Upload de preuve de livraison (POD)
- Liste des documents uploadés par mission
- Stockage S3 via service ecpmr

### 5. Profil (`/profile`)
- Informations transporteur (ID, nom, email)
- Statut vigilance (OK/WARNING/BLOCKED)
- Statistiques de performance:
  - Nombre total de missions
  - Taux d'acceptation
  - Scoring moyen
  - Délai moyen
- Historique récent des missions

## Architecture Technique

### Stack
- **Framework**: Next.js 14 (App Router)
- **Langage**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: Custom components (inspirés de Shadcn/ui)
- **Icons**: Lucide React
- **Date**: date-fns

### Structure des dossiers
```
apps/web-transporter/
├── src/
│   ├── app/                    # Pages Next.js (App Router)
│   │   ├── layout.tsx          # Layout racine
│   │   ├── globals.css         # Styles globaux
│   │   ├── page.tsx            # Page d'accueil
│   │   ├── login/              # Authentification
│   │   ├── missions/
│   │   │   ├── pending/        # Missions en attente
│   │   │   └── accepted/       # Missions acceptées
│   │   ├── planning/           # Planning RDV
│   │   ├── documents/          # Gestion documents
│   │   └── profile/            # Profil transporteur
│   ├── components/             # Composants React
│   │   ├── ui/                 # Composants UI réutilisables
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Badge.tsx
│   │   ├── Layout.tsx          # Layout principal avec navigation
│   │   └── MissionCard.tsx     # Carte mission
│   ├── lib/                    # Utilitaires
│   │   ├── auth.ts             # Gestion JWT
│   │   └── utils.ts            # Fonctions utilitaires
│   └── services/               # Services API
│       └── api.ts              # Client API backend
├── public/                     # Assets statiques
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── .env.local                  # Variables d'environnement

```

### API Backend

L'application communique avec les services backend via des rewrites Next.js :

#### Core Orders (port 3001)
- `GET /api/orders?carrierId=XXX&status=pending` - Missions en attente
- `GET /api/orders?carrierId=XXX&status=accepted` - Missions acceptées
- `POST /api/orders/:id/accept` - Accepter une mission

#### Planning (port 3004)
- `GET /api/planning/slots?date=YYYY-MM-DD` - Créneaux RDV
- `POST /api/planning/rdv/propose` - Proposer un créneau RDV

#### eCMR (port 3009)
- `POST /api/ecpmr/upload` - Upload de documents
- `GET /api/ecpmr/documents?orderId=XXX` - Liste des documents

## Installation

### Prérequis
- Node.js 18+
- pnpm 8+

### Installation des dépendances

Depuis la racine du monorepo :
```bash
pnpm install
```

Ou depuis le dossier de l'application :
```bash
cd apps/web-transporter
pnpm install
```

### Configuration

1. Copier le fichier d'exemple :
```bash
cp .env.local.example .env.local
```

2. Modifier `.env.local` selon votre environnement :
```env
CORE_ORDERS_URL=http://localhost:3001
PLANNING_URL=http://localhost:3004
ECPMR_URL=http://localhost:3009
VIGILANCE_URL=http://localhost:3002
JWT_SECRET=your-secret-key-here
NEXT_PUBLIC_DEFAULT_CARRIER_ID=CARRIER-B
```

## Utilisation

### Développement

Lancer l'application en mode développement (port 3100) :
```bash
pnpm dev
```

L'application sera accessible sur http://localhost:3100

### Build

Construire l'application pour la production :
```bash
pnpm build
```

### Production

Lancer l'application en mode production :
```bash
pnpm start
```

## Authentification

### Mode Démo
En mode démo, l'application utilise un système d'authentification simplifié :

1. Accéder à `/login`
2. Sélectionner un transporteur dans la liste :
   - CARRIER-B (Transport Express)
   - CARRIER-C (Logistique Pro)
   - CARRIER-A (Demo Transport)
3. Cliquer sur "Se connecter"

Un JWT factice est généré côté client et stocké dans localStorage.

### Mode Production
En production, remplacer la logique d'authentification dans `src/app/login/page.tsx` par un appel à l'API d'authentification backend.

## Fonctionnalités Mobile

L'application est **mobile-first** et optimisée pour les transporteurs sur le terrain :

- Navigation responsive (sidebar desktop / bottom nav mobile)
- Touch-friendly (boutons et zones cliquables adaptés)
- Optimisation de la taille des polices
- Grille adaptative pour les cartes missions
- Planning scrollable horizontalement sur mobile

## Intégration Backend

### Endpoints requis

Le backend doit exposer les endpoints suivants :

```typescript
// Core Orders Service
GET /carrier/orders?carrierId=XXX&status=pending
GET /carrier/orders?carrierId=XXX&status=accepted
POST /carrier/orders/:id/accept { carrierId: string }

// Planning Service
GET /planning/slots?date=YYYY-MM-DD
POST /planning/rdv/propose { orderId: string, date: string, time: string }

// eCMR Service
POST /ecpmr/upload (multipart/form-data)
GET /ecpmr/documents?orderId=XXX
```

### Format des données

**Mission** :
```typescript
{
  id: string;
  ref: string;
  expiresAt?: number; // timestamp Unix
  ship_from?: string;
  ship_to?: string;
  pallets?: number;
  weight?: number;
}
```

**RDV Slot** :
```typescript
{
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  available: boolean;
}
```

## Sécurité

- Authentification JWT avec vérification d'expiration
- Headers sécurisés (via package `@rt/security`)
- Rate limiting côté backend
- Validation des uploads de fichiers
- CORS configuré

## Performance

- Rafraîchissement intelligent des données
- Cache côté client pour les informations transporteur
- Lazy loading des images
- Optimisation des bundles Next.js
- SSR désactivé pour les pages nécessitant l'authentification

## Évolutions futures

- [ ] Notifications push pour nouvelles missions
- [ ] Signature électronique des CMR
- [ ] Chat avec l'industriel
- [ ] Géolocalisation en temps réel
- [ ] Mode hors-ligne
- [ ] Application mobile native (React Native)
- [ ] Intégration avec systèmes TMS tiers
- [ ] Analytics et rapports avancés

## Support

Pour toute question ou problème :
- Documentation technique : `/docs`
- Support : support@rt-technologie.com
- Issues : GitHub Issues

## Licence

Propriétaire - RT Technologie © 2025
