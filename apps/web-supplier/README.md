# RT Supplier - Application Fournisseur

Application web Next.js 14 pour la gestion des enlèvements fournisseur dans l'écosystème RT-Technologie.

## Vue d'ensemble

L'application RT Supplier permet aux fournisseurs de :
- Consulter les enlèvements planifiés
- Proposer et confirmer des créneaux de pickup
- Préparer la marchandise avec une checklist
- Uploader les documents nécessaires (BL, packing list, photos)
- Consulter l'historique et les KPIs de performance

## Architecture

### Technologies
- **Framework**: Next.js 14 (App Router)
- **UI**: React 18 + Tailwind CSS
- **State Management**: Zustand + React Query
- **Forms**: React Hook Form + Zod
- **API Client**: Axios
- **Icons**: Lucide React
- **Composants UI**: Radix UI

### Structure du Projet
```
apps/web-supplier/
├── src/
│   ├── app/                    # Pages Next.js (App Router)
│   │   ├── page.tsx           # Page d'accueil
│   │   ├── layout.tsx         # Layout principal
│   │   ├── providers.tsx      # Providers (React Query, etc.)
│   │   ├── pickups/           # Page enlèvements
│   │   ├── slots/             # Page créneaux
│   │   ├── preparation/       # Page préparation
│   │   └── history/           # Page historique
│   ├── components/
│   │   ├── layout/            # Composants de layout
│   │   ├── notifications/     # Système de notifications
│   │   └── ui/               # Composants UI réutilisables
│   ├── lib/
│   │   ├── api/              # Services API
│   │   ├── notifications/    # Gestion notifications push
│   │   └── utils.ts          # Utilitaires
│   ├── hooks/                # Custom hooks
│   └── types/                # Types TypeScript
├── public/
│   ├── manifest.json         # PWA manifest
│   └── sw.js                 # Service Worker
└── package.json

## Pages Principales

### 1. Enlèvements Prévus (`/pickups`)
- Liste des pickups planifiés
- Statut de chaque enlèvement
- Informations transporteur et articles
- Actions rapides (proposer créneau, préparer)

### 2. Créneaux (`/slots`)
- Proposer des créneaux de disponibilité
- Accepter/refuser les créneaux proposés par le transporteur
- Vue des créneaux confirmés

### 3. Préparation (`/preparation`)
- Checklist de préparation interactive
- Upload de documents (BL, packing list, CMR)
- Capture de photos des palettes
- Validation "Prêt pour l'enlèvement"

### 4. Historique (`/history`)
- KPIs de performance :
  - Total enlèvements
  - Taux de ponctualité
  - Taux de conformité
  - Temps moyen de préparation
- Liste des enlèvements passés
- Filtrage par période

## API Backend

L'application communique avec plusieurs services :

### Core Orders (port 3001)
- `GET /pickups` - Liste des enlèvements
- `GET /pickups/:id` - Détail d'un enlèvement
- `PUT /pickups/:id/ready` - Marquer comme prêt
- `PUT /pickups/:id/picked-up` - Marquer comme enlevé
- `GET /pickups/:id/documents` - Documents
- `POST /pickups/:id/documents` - Upload document
- `GET /pickups/kpis` - KPIs

### Planning (port 3004)
- `GET /pickups/:id/slots` - Créneaux d'un pickup
- `POST /pickups/:id/slots` - Proposer un créneau
- `PUT /pickups/:id/slots/:id/confirm` - Confirmer un créneau

### Notifications (port 3002)
- `GET /notifications` - Liste des notifications
- `PUT /notifications/:id/read` - Marquer comme lue
- `POST /notifications/subscribe` - S'abonner aux push

## Fonctionnalités

### Notifications Push
- Support des Web Push Notifications
- Alertes en temps réel pour :
  - Enlèvement imminent
  - Créneau confirmé/refusé
  - Documents requis
- Service Worker pour les notifications en arrière-plan

### Mobile-First
- Design responsive optimisé mobile
- Navigation adaptée tactile
- Upload photos depuis la caméra
- PWA installable
- Fonctionne hors-ligne (service worker)

### UX Simplifiée
- Interface épurée et claire
- Workflow guidé étape par étape
- Validation en temps réel
- Retours visuels immédiats

## Installation

```bash
# Depuis la racine du monorepo
pnpm install

# Développement (port 3103)
pnpm --filter @rt/web-supplier dev

# Build production
pnpm --filter @rt/web-supplier build

# Lancer en production
pnpm --filter @rt/web-supplier start
```

## Variables d'Environnement

```env
NEXT_PUBLIC_API_CORE_ORDERS=http://localhost:3001
NEXT_PUBLIC_API_PLANNING=http://localhost:3004
NEXT_PUBLIC_API_NOTIFICATIONS=http://localhost:3002
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<votre-clé-vapid>
```

## Types de Données

### Pickup
```typescript
interface Pickup {
  id: string
  orderId: string
  status: 'scheduled' | 'confirmed' | 'in_preparation' | 'ready' | 'picked_up' | 'cancelled'
  scheduledDate: string
  carrier: { id: string; name: string; contact?: string }
  origin: { name: string; address: string; city: string; zipCode: string }
  items: PickupItem[]
}
```

### TimeSlot
```typescript
interface TimeSlot {
  id: string
  pickupId: string
  date: string
  startTime: string
  endTime: string
  status: 'proposed' | 'confirmed' | 'rejected'
  proposedBy: 'supplier' | 'carrier'
}
```

### Document
```typescript
interface Document {
  id: string
  pickupId: string
  type: 'bl' | 'packing_list' | 'cmr' | 'photo' | 'other'
  name: string
  url: string
}
```

## Workflow Utilisateur

1. **Notification** : Le fournisseur reçoit une notification d'enlèvement planifié
2. **Créneau** : Il propose un créneau de disponibilité
3. **Confirmation** : Le transporteur confirme le créneau
4. **Préparation** : Le fournisseur prépare la marchandise
5. **Documents** : Upload des documents requis
6. **Validation** : Marquer comme "Prêt"
7. **Pickup** : Le transporteur effectue l'enlèvement
8. **Historique** : Consultation des statistiques

## Performance

- Server-side rendering (SSR)
- Optimisation des images Next.js
- Code splitting automatique
- Lazy loading des composants
- Cache React Query (60s staleTime)
- PWA avec cache service worker

## Sécurité

- Validation des formulaires (Zod)
- Sanitization des uploads
- HTTPS requis en production
- Headers de sécurité Next.js
- Timeouts API (10s)

## Support Navigateurs

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari iOS 14+
- Chrome Android 90+

## Contribution

Ce projet fait partie du monorepo RT-Technologie. Suivez les conventions de code établies et testez localement avant de commiter.

## License

Propriétaire - RT-Technologie © 2024
