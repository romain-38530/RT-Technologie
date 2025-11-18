# RT Forwarder - Application Affret.IA

Application web Next.js 14 pour les affreteurs (forwarders) permettant de gerer les cotations AI, appels d'offres, marketplace premium et analytics.

## Caracteristiques

### Pages principales

1. **Dashboard** (`/dashboard`)
   - Vue d'ensemble des commandes escaladees
   - Metriques ROI Affret.IA
   - Taux d'acceptance automatique
   - Liste des affretements recents

2. **Cotations** (`/quotes`)
   - Demander une cotation AI pour une commande
   - Comparaison prix AI vs prix de reference (grilles)
   - Transporteurs premium suggeres
   - Dispatch automatique

3. **Appels d'offres** (`/tenders`)
   - Liste des commandes avec tenders actifs
   - Soumettre des offres (bids)
   - Comparatif des offres recues
   - Analyse du meilleur prix

4. **Marketplace Premium** (`/marketplace`)
   - Catalogue des transporteurs premium
   - Filtres par scoring, recherche
   - Details des transporteurs
   - Invitation a soumissionner

5. **Analytics** (`/analytics`)
   - Graphiques comparatifs AI vs manuel
   - Economies par origine/destination
   - Performance des transporteurs
   - KPIs et insights

## Technologies

- **Next.js 14** - Framework React avec Pages Router
- **TypeScript** - Typage statique
- **Recharts** - Bibliotheque de graphiques
- **CSS-in-JS** - Styling inline pour simplicite

## API Backend

L'application communique avec le service **Affret.IA** (port 3005) :

- `GET /affret-ia/quote/:orderId` - Obtenir cotation AI
- `GET /affret-ia/bids/:orderId` - Liste des offres recues
- `POST /affret-ia/bid` - Soumettre une offre
- `GET /affret-ia/assignment/:orderId` - Transporteur assigne
- `POST /affret-ia/dispatch` - Dispatch automatique

## Installation

```bash
# Installer les dependances
pnpm install

# Lancer en mode developpement
pnpm dev

# Builder pour production
pnpm build

# Lancer en production
pnpm start
```

L'application demarre sur **http://localhost:4002**

## Variables d'environnement

```env
AFFRET_IA_URL=http://localhost:3005
NEXT_PUBLIC_AFFRET_IA_URL=http://localhost:3005
```

## Composants reutilisables

- **AIBadge** - Badge visuel pour indiquer prix AI
- **CarrierCard** - Carte transporteur avec scoring
- **PriceComparator** - Comparateur de prix interactif
- **Card** - Conteneur avec titre et actions

## Authentification

En mode demo, l'authentification est simulee. Le token JWT est stocke dans `localStorage` sous la cle `forwarder_jwt`.

En production, integrer avec le service Auth de RT-Technologie.

## Entitlements

L'addon **AFFRET_IA** doit etre active dans les entitlements de l'organisation pour acceder aux fonctionnalites IA.

## Structure des fichiers

```
apps/web-forwarder/
├── pages/
│   ├── _app.tsx          # Layout principal
│   ├── index.tsx         # Page d'accueil
│   ├── dashboard.tsx     # Dashboard
│   ├── quotes.tsx        # Cotations
│   ├── tenders.tsx       # Appels d'offres
│   ├── marketplace.tsx   # Marketplace
│   ├── analytics.tsx     # Analytics
│   └── login.tsx         # Connexion
├── components/
│   ├── AIBadge.tsx
│   ├── CarrierCard.tsx
│   ├── PriceComparator.tsx
│   └── Card.tsx
├── lib/
│   └── api.ts           # Utilitaires API
├── styles/
│   └── globals.css
├── public/
│   └── seeds/           # Donnees de demonstration
└── package.json
```

## Developpement

Pour ajouter de nouvelles fonctionnalites :

1. Creer les composants dans `components/`
2. Ajouter les routes API dans `lib/api.ts`
3. Creer les pages dans `pages/`
4. Utiliser les composants reutilisables pour la coherence UI

## Support

Pour toute question ou assistance, contacter l'equipe RT-Technologie.
