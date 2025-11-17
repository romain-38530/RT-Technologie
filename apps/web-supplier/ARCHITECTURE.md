# Architecture RT Supplier

## Vue d'Ensemble

RT Supplier est une Progressive Web App (PWA) construite avec Next.js 14, optimisée pour une utilisation mobile-first. Elle permet aux fournisseurs de gérer efficacement leurs enlèvements.

## Stack Technique

### Frontend
- **Next.js 14**: App Router, Server Components, API Routes
- **React 18**: Hooks, Suspense, Concurrent Features
- **TypeScript 5**: Type safety strict
- **Tailwind CSS 3**: Utility-first styling
- **Radix UI**: Composants accessibles headless

### State Management
- **React Query (TanStack)**: Server state, caching, mutations
- **Zustand**: Client state (si nécessaire)
- **React Hook Form**: Gestion des formulaires
- **Zod**: Validation de schémas

### API & Data
- **Axios**: HTTP client avec intercepteurs
- **REST API**: Communication avec les microservices backend

## Architecture des Dossiers

```
apps/web-supplier/
├── public/                    # Assets statiques
│   ├── manifest.json         # PWA manifest
│   ├── sw.js                 # Service worker
│   └── icons/                # Icons PWA
│
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (pages)/         # Routes groupées
│   │   │   ├── pickups/     # Enlèvements
│   │   │   ├── slots/       # Créneaux
│   │   │   ├── preparation/ # Préparation
│   │   │   └── history/     # Historique
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home page
│   │   ├── providers.tsx    # Context providers
│   │   └── globals.css      # Global styles
│   │
│   ├── components/
│   │   ├── layout/          # Layout components
│   │   │   └── navigation.tsx
│   │   ├── notifications/   # Notification system
│   │   │   └── notification-manager.tsx
│   │   └── ui/             # Reusable UI components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── badge.tsx
│   │       └── toaster.tsx
│   │
│   ├── lib/
│   │   ├── api/            # API clients
│   │   │   ├── client.ts   # Axios instances
│   │   │   ├── pickups.ts  # Pickups API
│   │   │   └── notifications.ts
│   │   ├── notifications/  # Push notifications
│   │   │   └── push.ts
│   │   └── utils.ts        # Utilities
│   │
│   ├── hooks/              # Custom hooks
│   │   └── useMediaQuery.ts
│   │
│   └── types/              # TypeScript types
│       └── index.ts
│
└── config files
    ├── next.config.js
    ├── tailwind.config.js
    ├── tsconfig.json
    └── package.json
```

## Flux de Données

### 1. Server State (React Query)
```typescript
// Exemple: Récupération des pickups
const { data, isLoading, error } = useQuery({
  queryKey: ['pickups'],
  queryFn: () => pickupsApi.getAll(),
  staleTime: 60000, // 1 minute
})
```

### 2. Mutations
```typescript
// Exemple: Proposer un créneau
const mutation = useMutation({
  mutationFn: (slot) => pickupsApi.proposeSlot(pickupId, slot),
  onSuccess: () => {
    queryClient.invalidateQueries(['slots'])
  }
})
```

### 3. Client State
Le state client local est géré par React useState/useReducer pour les interactions UI temporaires.

## Communication API

### Architecture Backend
```
┌─────────────────┐
│  Web Supplier   │
└────────┬────────┘
         │
         ├─────────► Core Orders (3001)
         │           - Pickups CRUD
         │           - Documents
         │           - KPIs
         │
         ├─────────► Planning (3004)
         │           - Time slots
         │           - Scheduling
         │
         └─────────► Notifications (3002)
                     - Push subscriptions
                     - Real-time alerts
```

### API Client Pattern
```typescript
// Centralized Axios instances
export const coreOrdersApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_CORE_ORDERS,
  timeout: 10000,
})

// Domain-specific API services
export const pickupsApi = {
  getAll: () => coreOrdersApi.get('/pickups'),
  getById: (id) => coreOrdersApi.get(`/pickups/${id}`),
  // ...
}
```

## Patterns et Conventions

### 1. Component Pattern
```typescript
// Server Component (par défaut)
export default function Page() {
  return <ClientComponent />
}

// Client Component (avec 'use client')
'use client'
export function ClientComponent() {
  const [state, setState] = useState()
  return <div>...</div>
}
```

### 2. Error Handling
```typescript
// API errors
try {
  const data = await pickupsApi.getAll()
} catch (error) {
  if (error.response?.status === 404) {
    // Handle not found
  }
}

// React Query errors
const { error } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  onError: (error) => {
    toast.error(error.message)
  }
})
```

### 3. Type Safety
```typescript
// Strict typing pour les API responses
interface Pickup {
  id: string
  status: PickupStatus
  // ...
}

type PickupStatus = 'scheduled' | 'confirmed' | 'in_preparation' | 'ready' | 'picked_up'

// Type guards
function isPickup(obj: unknown): obj is Pickup {
  return typeof obj === 'object' && 'id' in obj
}
```

## Performance

### 1. Code Splitting
- Automatic route-based splitting par Next.js
- Dynamic imports pour les gros composants
```typescript
const HeavyComponent = dynamic(() => import('./Heavy'), {
  loading: () => <Spinner />,
})
```

### 2. Caching Strategy
```typescript
// React Query cache configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000,        // 1 minute
      cacheTime: 300000,       // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})
```

### 3. Image Optimization
```typescript
import Image from 'next/image'

<Image
  src="/image.jpg"
  width={500}
  height={300}
  alt="Description"
  priority // Pour les images above-the-fold
/>
```

## Progressive Web App

### Service Worker
```javascript
// public/sw.js
self.addEventListener('push', (event) => {
  const data = event.data.json()
  self.registration.showNotification(data.title, {
    body: data.message,
    icon: '/icon-192x192.png',
  })
})
```

### Offline Support
- Service Worker cache les assets statiques
- React Query persist cache (optionnel)
- Offline fallback UI

### Installation
```json
// manifest.json
{
  "name": "RT Supplier",
  "short_name": "Supplier",
  "display": "standalone",
  "start_url": "/",
  "theme_color": "#0ea5e9"
}
```

## Sécurité

### 1. Environment Variables
```typescript
// Uniquement NEXT_PUBLIC_* est exposé au client
const API_URL = process.env.NEXT_PUBLIC_API_CORE_ORDERS
```

### 2. Input Validation
```typescript
// Zod schemas
const slotSchema = z.object({
  date: z.string().datetime(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
})
```

### 3. XSS Prevention
- React échappe automatiquement les valeurs
- Sanitize user input avant render
- CSP headers via next.config.js

## Testing Strategy

### Unit Tests
- Composants: Jest + React Testing Library
- Hooks: @testing-library/react-hooks
- Utils: Jest

### Integration Tests
- API calls: MSW (Mock Service Worker)
- User flows: Playwright/Cypress

### E2E Tests
- Critical paths: Playwright
- Mobile: Browser DevTools + real devices

## Deployment

### Build
```bash
pnpm build
```

### Output
- Static assets dans `.next/static/`
- Server functions dans `.next/server/`
- Optimized images dans `.next/cache/`

### Environment
- Development: localhost:3103
- Staging: staging.supplier.rt-tech.com
- Production: supplier.rt-tech.com

## Monitoring

### Performance
- Next.js Analytics
- Web Vitals tracking
- Lighthouse CI

### Errors
- Sentry integration (optionnel)
- Console logs en dev
- Error boundaries en production

### Analytics
- Google Analytics (optionnel)
- Custom events tracking
- User behavior analysis

## Maintenance

### Dependencies
```bash
# Update dependencies
pnpm update

# Check for outdated
pnpm outdated

# Security audit
pnpm audit
```

### Code Quality
- ESLint pour le linting
- TypeScript strict mode
- Prettier pour le formatting (optionnel)

## Évolution Future

### Roadmap
1. Authentification JWT
2. Mode hors-ligne complet
3. Chat avec transporteur
4. Signature électronique
5. Analytics avancés

### Scalabilité
- Lazy loading des routes
- Virtual scrolling pour grandes listes
- Optimistic updates
- Background sync
