# Architecture - RT Recipient

## Vue d'ensemble

Application Next.js 14 (App Router) pour la gestion des livraisons côté destinataire.

## Structure des fichiers

```
web-recipient/
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── (main)/                   # Route group avec layout
│   │   │   ├── layout.tsx            # Layout avec Header + Navigation
│   │   │   ├── deliveries/           # Page livraisons attendues
│   │   │   │   └── page.tsx
│   │   │   ├── slots/                # Page gestion créneaux
│   │   │   │   └── page.tsx
│   │   │   ├── receive/              # Page réception + signature
│   │   │   │   └── page.tsx
│   │   │   ├── anomalies/            # Page déclaration anomalies
│   │   │   │   └── page.tsx
│   │   │   └── history/              # Page historique + stats
│   │   │       └── page.tsx
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Redirect vers /deliveries
│   │   ├── providers.tsx             # React Query Provider
│   │   └── globals.css               # Styles globaux Tailwind
│   │
│   ├── components/                    # Composants réutilisables
│   │   ├── header.tsx                # Header avec notifications
│   │   ├── navigation.tsx            # Menu latéral
│   │   ├── notification-panel.tsx    # Panel notifications
│   │   ├── delivery-card.tsx         # Card livraison
│   │   ├── anomaly-card.tsx          # Card anomalie
│   │   ├── create-anomaly-modal.tsx  # Modal création anomalie
│   │   ├── signature-canvas.tsx      # Canvas signature tactile
│   │   └── photo-upload.tsx          # Upload photos + caméra
│   │
│   └── lib/                           # Utilitaires et services
│       ├── api/                       # Client API
│       │   ├── client.ts             # Axios client + intercepteurs
│       │   ├── types.ts              # Types TypeScript
│       │   ├── deliveries.ts         # API livraisons
│       │   ├── slots.ts              # API créneaux
│       │   ├── receptions.ts         # API réceptions
│       │   └── anomalies.ts          # API anomalies
│       └── utils.ts                   # Fonctions utilitaires
│
├── package.json                       # Dépendances
├── tsconfig.json                      # Config TypeScript
├── next.config.js                     # Config Next.js
├── tailwind.config.js                 # Config Tailwind
├── postcss.config.js                  # Config PostCSS
├── .env.example                       # Variables d'environnement
├── .gitignore                         # Git ignore
└── README.md                          # Documentation

Total: 29 fichiers créés
```

## Flux de données

### 1. Livraisons attendues (`/deliveries`)
```
User → Page → useQuery → API Client → Core Orders (3001)
                ↓
         DeliveryCard × N
```

### 2. Gestion créneaux (`/slots`)
```
User sélectionne livraison + date
    ↓
useQuery → Planning API (3004) → Créneaux disponibles
    ↓
User propose créneau
    ↓
useMutation → Planning API → Confirmation
```

### 3. Réception (`/receive`)
```
Étape 1: Sélection livraison
    ↓
Étape 2: Contrôle items (quantité, état)
    ↓
createReception → Core Orders API
    ↓
Étape 3: Photos (si anomalies)
    ↓
PhotoUpload → compression → upload
    ↓
Étape 4: Signature CMR
    ↓
SignatureCanvas → base64 → E-CMR API (3009)
```

### 4. Anomalies (`/anomalies`)
```
User clique "Déclarer anomalie"
    ↓
Modal sélection livraison
    ↓
Formulaire (type, gravité, description)
    ↓
PhotoUpload × 5 max
    ↓
createAnomaly → Core Orders API
```

### 5. Historique (`/history`)
```
User sélectionne période (7j/30j/90j/all)
    ↓
useQuery → Core Orders API
    ↓
Affichage stats + liste
```

## Composants spéciaux

### SignatureCanvas
**Fichier**: `src/components/signature-canvas.tsx`

**Technologies**:
- Canvas HTML5 2D context
- Support tactile (touch events)
- Support souris (mouse events)
- Export base64 PNG

**Props**:
```typescript
interface SignatureCanvasProps {
  onSave: (signatureData: string) => void
  onCancel: () => void
  signerName?: string
}
```

**Fonctionnalités**:
- Dessin libre (ligne continue)
- Bouton "Recommencer" (clear)
- Validation avant envoi
- Modal fullscreen
- Résolution haute (x2 pour HiDPI)

### PhotoUpload
**Fichier**: `src/components/photo-upload.tsx`

**Technologies**:
- FileReader API
- Canvas pour compression
- Input file natif
- Input camera (capture="environment")

**Props**:
```typescript
interface PhotoUploadProps {
  onPhotosChange: (photos: File[]) => void
  maxPhotos?: number
  existingPhotos?: string[]
  label?: string
  description?: string
}
```

**Fonctionnalités**:
- Capture caméra smartphone
- Import fichiers existants
- Prévisualisation miniatures
- Suppression individuelle
- Limite configurable (défaut: 5)
- Compression automatique (utils.ts)

## API Integration

### Client Axios
**Fichier**: `src/lib/api/client.ts`

**Configuration**:
```typescript
{
  baseURL: process.env.NEXT_PUBLIC_API_XXX,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
}
```

**Intercepteurs**:
- Request: Ajout token JWT (localStorage)
- Response: Gestion erreurs 401

### Endpoints utilisés

| Service | Port | Routes |
|---------|------|--------|
| Core Orders | 3001 | /deliveries, /receptions, /anomalies |
| Planning | 3004 | /slots/available, /slots/propose, /slots/:id/confirm |
| E-CMR | 3009 | /cmr/sign |
| Tracking IA | 3008 | /tracking/:id/eta |

### Types TypeScript
**Fichier**: `src/lib/api/types.ts`

**Principaux types**:
- `Delivery`: Livraison complète
- `TimeSlot`: Créneau horaire
- `Reception`: Réception + items
- `ReceptionItem`: Item contrôlé
- `Anomaly`: Anomalie déclarée
- `CMRSignature`: Signature CMR
- `Statistics`: Statistiques période

## État global

### React Query (TanStack Query)
**Configuration**: `src/app/providers.tsx`

```typescript
{
  defaultOptions: {
    queries: {
      staleTime: 60000,        // 1 minute
      refetchOnWindowFocus: false
    }
  }
}
```

**Query Keys**:
- `['deliveries', recipientId]` → Livraisons attendues (refresh 30s)
- `['deliveries-history', recipientId, period]` → Historique
- `['slots', recipientId, date]` → Créneaux disponibles
- `['anomalies', recipientId]` → Anomalies (refresh 60s)
- `['statistics', recipientId, period]` → Statistiques

### Mutations
- `proposeSlot` → Proposition créneau
- `confirmSlot` → Confirmation créneau
- `createReception` → Création réception
- `completeReception` → Finalisation réception
- `signCMR` → Signature CMR
- `createAnomaly` → Déclaration anomalie

## Styling

### Tailwind CSS
**Config**: `tailwind.config.js`

**Thème personnalisé**:
- `primary`: Bleu (sky)
- `success`: Vert
- `warning`: Orange
- `danger`: Rouge

**Classes utilitaires** (`globals.css`):
- `.btn`, `.btn-primary`, `.btn-secondary`, etc.
- `.card`
- `.input`, `.label`
- `.badge`, `.badge-success`, etc.

## Développement

### Mock Data
Chaque fichier API (`deliveries.ts`, `anomalies.ts`, etc.) contient des fonctions mock pour le développement sans backend :
- `getMockDeliveries()`
- `getMockSlots()`
- `getMockAnomalies()`
- `getMockPastDeliveries()`
- `getMockStatistics()`

### Mode développement
```bash
pnpm dev  # Port 3102
```

### Build production
```bash
pnpm build
pnpm start
```

## Performance

### Optimisations
1. **Server Components** par défaut (RSC)
2. **Client Components** uniquement si nécessaire (`'use client'`)
3. **React Query cache** (1 minute)
4. **Lazy loading** composants lourds
5. **Image optimization** (Next.js Image)
6. **Code splitting** automatique (Next.js)

### Métriques cibles
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lighthouse Score: > 90

## Sécurité

### Authentification
- Token JWT stocké dans `localStorage`
- Ajout automatique dans headers (intercepteur)
- Redirection si 401

### Validation
- Validation formulaires côté client
- Vérification backend (API)
- Sanitization des inputs

### CORS
Configuration backend requise pour :
- `http://localhost:3102` (dev)
- URL production

## Mobile-First

### Design responsive
- Grid Tailwind (md:, lg:)
- Navigation latérale → drawer mobile
- Cards empilables
- Boutons tactiles (min 44x44px)

### Features mobiles
- Signature tactile
- Capture caméra native
- Géolocalisation (signature CMR)
- Notifications push (à venir)
- PWA (à venir)

## Tests (à implémenter)

### Tests unitaires
- Composants React (Jest + RTL)
- Fonctions utilitaires
- API client

### Tests E2E
- Playwright ou Cypress
- Scénarios complets :
  1. Réception complète
  2. Déclaration anomalie
  3. Gestion créneaux

## Déploiement

### Variables d'environnement
```env
NEXT_PUBLIC_API_CORE_ORDERS=https://api.rt-tech.com/orders
NEXT_PUBLIC_API_PLANNING=https://api.rt-tech.com/planning
NEXT_PUBLIC_API_ECMR=https://api.rt-tech.com/ecmr
NEXT_PUBLIC_API_TRACKING=https://api.rt-tech.com/tracking
```

### Plateformes supportées
- Vercel (recommandé)
- Docker
- Node.js standalone

## Évolutions futures

1. **PWA** : Offline mode + notifications push
2. **WebSocket** : Updates temps réel (ETA)
3. **I18n** : Multi-langues
4. **Analytics** : Suivi usage
5. **Tests E2E** : Couverture complète
6. **Accessibility** : WCAG 2.1 AA
7. **Dark mode** : Thème sombre
