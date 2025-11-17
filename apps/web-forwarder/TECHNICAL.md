# Documentation Technique - RT Forwarder

## Architecture

### Stack Technique

- **Framework** : Next.js 14.2.5 (Pages Router)
- **Runtime** : Node.js 20+
- **Language** : TypeScript 5.4+
- **UI** : React 18.2 avec CSS-in-JS
- **Charts** : Recharts 2.12+
- **Package Manager** : pnpm 8.15.4

### Structure du projet

```
apps/web-forwarder/
├── pages/              # Routes Next.js
├── components/         # Composants React reutilisables
├── lib/               # Utilitaires et API client
├── styles/            # Styles globaux CSS
├── public/            # Assets statiques et seeds
└── [config files]     # Configuration Next.js, TS, etc.
```

## Pages et Routes

### Pages Router (Next.js)

| Route | Fichier | Description |
|-------|---------|-------------|
| `/` | `pages/index.tsx` | Page d'accueil |
| `/dashboard` | `pages/dashboard.tsx` | Dashboard Affret.IA |
| `/quotes` | `pages/quotes.tsx` | Cotations AI |
| `/tenders` | `pages/tenders.tsx` | Appels d'offres |
| `/marketplace` | `pages/marketplace.tsx` | Marketplace Premium |
| `/analytics` | `pages/analytics.tsx` | Analytics et KPIs |
| `/login` | `pages/login.tsx` | Authentification |

### Layout Global

Le fichier `pages/_app.tsx` definit :
- Le layout commun (header, navigation, footer)
- Les styles globaux
- La gestion de l'authentification (localStorage)

## Composants

### AIBadge

Badge visuel pour identifier les prix generes par l'IA.

```tsx
<AIBadge size="sm" | "md" | "lg" />
```

**Props** :
- `size` : Taille du badge (defaut: 'sm')

### CarrierCard

Carte d'affichage d'un transporteur avec scoring.

```tsx
<CarrierCard
  carrier={carrier}
  onClick={() => {}}
  selected={false}
/>
```

**Props** :
- `carrier` : Objet Carrier (id, name, email, scoring, premium, blocked)
- `onClick` : Callback de clic (optionnel)
- `selected` : Etat de selection (optionnel)

### PriceComparator

Composant de comparaison de prix interactif.

```tsx
<PriceComparator
  prices={[
    { label: 'AI', value: 950, currency: 'EUR', isAI: true },
    { label: 'Grid', value: 1000, currency: 'EUR' }
  ]}
  onSelect={(idx) => {}}
  selectedIndex={0}
/>
```

**Props** :
- `prices` : Array de prix a comparer
- `onSelect` : Callback de selection (optionnel)
- `selectedIndex` : Index selectionne (optionnel)

### Card

Conteneur avec titre et actions.

```tsx
<Card
  title="Titre"
  action={<button>Action</button>}
>
  {children}
</Card>
```

**Props** :
- `title` : Titre de la carte (optionnel)
- `action` : Element React pour actions (optionnel)
- `children` : Contenu de la carte

## API Client

Le fichier `lib/api.ts` expose les fonctions suivantes :

### getQuote(orderId: string)

Obtenir une cotation AI pour une commande.

```ts
const quote = await getQuote('ORD-Paris-Munich');
// { price: 950, currency: 'EUR', suggestedCarriers: ['B', 'C'], priceRef: {...} }
```

### getBids(orderId: string)

Recuperer les offres (bids) pour une commande.

```ts
const { bids } = await getBids('ORD-Paris-Munich');
// bids: [{ carrierId: 'B', price: 920, currency: 'EUR', scoring: 88, at: '...' }]
```

### submitBid(orderId, carrierId, price, currency)

Soumettre une offre pour une commande.

```ts
await submitBid('ORD-Paris-Munich', 'B', 920, 'EUR');
// { ok: true, bid: {...}, assigned: null | {...} }
```

### getAssignment(orderId: string)

Recuperer le transporteur assigne a une commande.

```ts
const { assignment } = await getAssignment('ORD-Paris-Munich');
// assignment: { carrierId: 'B', price: 920, source: 'ai', ... }
```

### dispatchOrder(orderId: string)

Dispatcher automatiquement une commande via l'IA.

```ts
const result = await dispatchOrder('ORD-Paris-Munich');
// { assignedCarrierId: 'B', quote: {...}, priceRef: {...} }
```

### loadOrders() / loadCarriers()

Charger les seeds (demo uniquement).

```ts
const orders = await loadOrders();
const carriers = await loadCarriers();
```

## Types TypeScript

### Quote

```ts
interface Quote {
  orderId: string;
  price: number;
  currency: string;
  suggestedCarriers: string[];
  priceRef?: {
    price: number;
    currency: string;
    mode: string;
  };
}
```

### Bid

```ts
interface Bid {
  carrierId: string;
  price: number;
  currency: string;
  scoring: number | null;
  at: string;
}
```

### Assignment

```ts
interface Assignment {
  orderId: string;
  carrierId: string;
  price: number;
  currency: string;
  at: string;
  source: string; // 'ai' | 'manual' | 'bid'
  priceRef?: {
    price: number;
    currency: string;
    mode: string;
  };
}
```

### Carrier

```ts
interface Carrier {
  id: string;
  name: string;
  email: string;
  vat: string;
  blocked: boolean;
  scoring: number;
  premium: boolean;
}
```

### Order

```ts
interface Order {
  id: string;
  ref: string;
  ownerOrgId: string;
  ship_from: string;
  ship_to: string;
  origin?: string;
  windows: {
    start: string;
    end: string;
  };
  pallets: number;
  weight: number;
  status: string;
  forceEscalation?: boolean;
}
```

## Gestion de l'etat

### React Hooks utilises

- `useState` : Gestion de l'etat local
- `useEffect` : Chargement des donnees au montage
- `useRouter` : Navigation Next.js (query params)

### Exemple de pattern

```tsx
const [data, setData] = useState<Type[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function load() {
    try {
      const result = await apiCall();
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }
  load();
}, []);
```

## Authentification

### Mode Demo

L'authentification est simulee. Un faux JWT est stocke dans localStorage.

```ts
const token = localStorage.getItem('forwarder_jwt');
```

### Integration Production

Pour la production, remplacer par :
1. Appel au service Auth RT-Technologie
2. Stockage securise du token (httpOnly cookies)
3. Verification des entitlements (AFFRET_IA)

## Styling

### Approche CSS-in-JS

Tous les styles sont inline pour simplicite et portabilite.

```tsx
<div style={{
  background: '#fff',
  padding: 24,
  borderRadius: 12,
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
}}>
  Content
</div>
```

### Palette de couleurs

- **Primary** : `#667eea` → `#764ba2` (gradient)
- **Success** : `#10b981`
- **Warning** : `#f59e0b`
- **Error** : `#ef4444`
- **Gray** : `#9ca3af`
- **Background** : `#f5f7fa`

## Performance

### Optimisations

1. **Lazy Loading** : Pages chargees a la demande (Next.js)
2. **Memoization** : Utiliser `useMemo` pour calculs lourds
3. **Code Splitting** : Automatic avec Next.js
4. **Image Optimization** : Utiliser `next/image` si images

### Metriques cibles

- **FCP** (First Contentful Paint) : < 1.5s
- **LCP** (Largest Contentful Paint) : < 2.5s
- **TTI** (Time to Interactive) : < 3.5s

## Tests

### Strategie de test (a implementer)

```bash
# Tests unitaires
pnpm test

# Tests E2E
pnpm test:e2e

# Coverage
pnpm test:coverage
```

### Outils suggeres

- **Jest** : Tests unitaires
- **React Testing Library** : Tests composants
- **Playwright** : Tests E2E
- **MSW** : Mock des API

## Build & Deploy

### Build local

```bash
pnpm build
# Genere .next/ avec assets optimises
```

### Deploiement Vercel

Le fichier `vercel.json` configure le deploiement :

```json
{
  "buildCommand": "pnpm build",
  "framework": "nextjs"
}
```

### Variables d'environnement production

```env
NEXT_PUBLIC_AFFRET_IA_URL=https://api.rt-technologie.com
```

## Monitoring & Logs

### Logs client

Tous les logs utilisent `console.error()` pour les erreurs :

```ts
try {
  await apiCall();
} catch (error) {
  console.error('Error:', error);
}
```

### Monitoring suggere

- **Sentry** : Tracking des erreurs
- **Vercel Analytics** : Performance et usage
- **LogRocket** : Session replay

## Securite

### Headers de securite

Geres par le package `@rt/security` :

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

### CORS

Configure dans `next.config.js` pour les appels API.

### Validation

Toutes les entrees utilisateur doivent etre validees :

```ts
if (!orderId || !carrierId || !price) {
  alert('Champs requis');
  return;
}
```

## Maintenance

### Mise a jour des dependances

```bash
# Verifier les updates
pnpm outdated

# Mettre a jour
pnpm update

# Update majeure
pnpm update --latest
```

### Code Quality

```bash
# Linting
pnpm lint

# Formatting (si Prettier configure)
pnpm format
```

## Support et Contact

Pour toute question technique :
- **Email** : dev@rt-technologie.com
- **Slack** : #rt-forwarder
- **Issues** : GitHub repository

## Ressources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Recharts Documentation](https://recharts.org)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
