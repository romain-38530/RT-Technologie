# RT Industry - Web Application

Application web moderne pour les industriels de la plateforme RT-Technologie.

## Fonctionnalites

### Dashboard
- Vue d'ensemble des commandes actives, en attente et acceptees
- Statistiques en temps reel (taux d'acceptation, delai moyen)
- Actions rapides vers les fonctionnalites principales

### Gestion des commandes
- Liste complete des commandes avec filtres
- Import CSV/Excel de commandes en masse
- Detail de chaque commande avec timeline
- Fonction de dispatch vers les transporteurs
- Suivi du statut en temps reel

### Grilles tarifaires
- Gestion des origins (points de depart)
- Import CSV de grilles FTL (Full Truck Load)
- Import CSV de grilles LTL (Less Than Load)
- Visualisation des tarifs par origin et mode
- Preview des grilles actives

### Transporteurs
- Liste des transporteurs invites
- Systeme d'invitation par email
- Scoring et evaluation
- Integration avec le service Vigilance
- Statut de vigilance (OK, WARNING, BLOCKED)

### Parametres
- Profil de l'organisation
- Gestion des utilisateurs
- Plan d'abonnement (FREE, PRO, ENTERPRISE)
- Addons (AFFRET_IA pour escalade automatique)

## Stack technique

- **Framework**: Next.js 14 (App Router)
- **Langage**: TypeScript (strict mode)
- **Styling**: TailwindCSS + Shadcn/ui
- **Formulaires**: React Hook Form + Zod
- **API Client**: TanStack Query (React Query)
- **UI Components**: Radix UI + Shadcn/ui
- **Icons**: Lucide React

## Installation

```bash
# Depuis la racine du monorepo
pnpm install

# Ou specifiquement pour web-industry
pnpm --filter @rt/web-industry install
```

## Configuration

Creer un fichier `.env.local` a partir de `.env.example` :

```bash
cp .env.example .env.local
```

Variables d'environnement :

```env
# API Backend (core-orders service)
NEXT_PUBLIC_API_URL=http://localhost:3001

# Service d'authentification
NEXT_PUBLIC_AUTHZ_URL=http://localhost:3007

# JWT Secret
NEXT_PUBLIC_JWT_SECRET=your-jwt-secret

# Organization ID par defaut
NEXT_PUBLIC_DEFAULT_ORG_ID=IND-1

# Feature flags
NEXT_PUBLIC_ENABLE_AFFRET_IA=true
```

## Demarrage

### Mode developpement

```bash
# Depuis la racine du monorepo
pnpm --filter @rt/web-industry dev

# Ou avec turbo
turbo run dev --filter=@rt/web-industry
```

L'application sera disponible sur `http://localhost:3010`

### Build production

```bash
pnpm --filter @rt/web-industry build
pnpm --filter @rt/web-industry start
```

## API Backend

L'application consomme les endpoints suivants du service `core-orders` (port 3001) :

### Commandes
- `GET /industry/orders/:id` - Detail d'une commande
- `POST /industry/orders/import` - Import de commandes
- `POST /industry/orders/:id/dispatch` - Dispatcher une commande

### Origins
- `GET /industry/origins?ownerOrgId=XXX` - Liste des origins
- `POST /industry/origins` - Creer un origin

### Grilles tarifaires
- `GET /industry/grids?ownerOrgId=XXX&origin=PARIS&mode=FTL` - Liste des grilles
- `POST /industry/grids/upload?mode=FTL&origin=PARIS&ownerOrgId=XXX` - Upload CSV

Headers requis :
- `Authorization: Bearer <token>` (JWT)
- `x-trace-id: <trace-id>` (optionnel, pour le tracking)

## Structure des fichiers

```
apps/web-industry/
├── src/
│   ├── app/                    # Pages Next.js (App Router)
│   │   ├── dashboard/          # Page d'accueil
│   │   ├── orders/             # Gestion commandes
│   │   │   ├── [id]/           # Detail commande
│   │   │   └── import/         # Import CSV
│   │   ├── grids/              # Grilles tarifaires
│   │   │   └── upload/         # Upload grille
│   │   ├── carriers/           # Transporteurs
│   │   ├── settings/           # Parametres
│   │   ├── layout.tsx          # Layout principal
│   │   ├── page.tsx            # Redirect vers dashboard
│   │   ├── providers.tsx       # React Query provider
│   │   └── globals.css         # Styles globaux
│   ├── components/
│   │   ├── ui/                 # Composants Shadcn/ui
│   │   ├── layout/             # Header, Sidebar
│   │   └── features/           # Composants metier
│   ├── lib/
│   │   ├── api/                # API clients
│   │   │   ├── client.ts       # Fetch wrapper
│   │   │   ├── orders.ts       # Orders API
│   │   │   └── grids.ts        # Grids API
│   │   ├── hooks/              # React Query hooks
│   │   │   ├── useOrders.ts
│   │   │   └── useGrids.ts
│   │   └── utils.ts            # Utilitaires
│   └── types/
│       └── index.ts            # Types TypeScript
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
└── README.md
```

## Format des imports CSV

### Commandes

```csv
id,ref,ship_from_city,ship_from_postal,ship_from_country,ship_to_city,ship_to_postal,ship_to_country,pallets,weight
ORD-001,REF-001,Paris,75001,FR,Lyon,69001,FR,20,5000
```

### Grille FTL

```csv
origin,to,price,currency
PARIS,LYON,850,EUR
PARIS,MARSEILLE,950,EUR
```

### Grille LTL

```csv
origin,to,minpallets,maxpallets,priceperpallet,currency
PARIS,LYON,1,10,45,EUR
PARIS,LYON,11,20,42,EUR
```

## Authentification

L'application utilise JWT pour l'authentification. Le token est stocke dans `localStorage` et envoye dans le header `Authorization: Bearer <token>`.

Integration avec le service `authz` (port 3007) :
- `POST /auth/login` - Connexion
- `GET /auth/orgs/:id` - Info organisation
- `GET /auth/me` - Info utilisateur

## Accessibilite

L'application respecte les standards WCAG 2.1 niveau AA :
- Navigation au clavier
- ARIA labels
- Contrast ratios
- Screen reader compatible

## Internationalisation

Structure prete pour i18n (FR/EN/DE/ES/IT) via le package `@rt/i18n` (a implementer).

## Tests

```bash
# Tests unitaires (a implementer)
pnpm --filter @rt/web-industry test

# Tests e2e (a implementer)
pnpm --filter @rt/web-industry test:e2e
```

## Deployment

L'application peut etre deployee sur :
- Vercel (recommande)
- Docker
- Node.js standalone

```bash
# Build Docker (a partir de la racine)
docker build -f apps/web-industry/Dockerfile -t rt-web-industry .

# Run
docker run -p 3010:3010 rt-web-industry
```

## Contribuer

1. Creer une branche feature
2. Implementer les changements
3. Tester localement
4. Creer une PR vers `main`

## Licence

Proprietary - RT-Technologie
