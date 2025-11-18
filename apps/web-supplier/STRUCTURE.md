# Structure du Projet RT Supplier

## Arborescence Complète

```
apps/web-supplier/
│
├── 📁 public/                          # Assets statiques
│   ├── 📁 icons/                       # Icônes PWA
│   │   └── README.md                   # Guide icônes
│   ├── manifest.json                   # Manifest PWA
│   └── sw.js                          # Service Worker
│
├── 📁 src/
│   │
│   ├── 📁 app/                        # Next.js App Router
│   │   ├── 📁 history/
│   │   │   └── page.tsx               # 📊 Page Historique & KPIs
│   │   │
│   │   ├── 📁 pickups/
│   │   │   ├── 📁 [id]/
│   │   │   │   └── page.tsx           # 📦 Détail Enlèvement
│   │   │   └── page.tsx               # 📦 Liste Enlèvements
│   │   │
│   │   ├── 📁 preparation/
│   │   │   └── page.tsx               # ✅ Préparation & Checklist
│   │   │
│   │   ├── 📁 slots/
│   │   │   └── page.tsx               # 📅 Gestion Créneaux
│   │   │
│   │   ├── globals.css                # Styles globaux
│   │   ├── layout.tsx                 # Layout principal
│   │   ├── manifest.ts                # Manifest TypeScript
│   │   ├── page.tsx                   # 🏠 Page d'accueil
│   │   └── providers.tsx              # React Query Provider
│   │
│   ├── 📁 components/
│   │   ├── 📁 layout/
│   │   │   └── navigation.tsx         # 🧭 Navigation responsive
│   │   │
│   │   ├── 📁 notifications/
│   │   │   └── notification-manager.tsx # 🔔 Gestionnaire notifications
│   │   │
│   │   └── 📁 ui/                     # Composants UI réutilisables
│   │       ├── badge.tsx              # Badge coloré
│   │       ├── button.tsx             # Bouton
│   │       ├── card.tsx               # Carte
│   │       └── toaster.tsx            # Toast notifications
│   │
│   ├── 📁 hooks/
│   │   └── useMediaQuery.ts           # Hook responsive
│   │
│   ├── 📁 lib/
│   │   ├── 📁 api/                    # Services API
│   │   │   ├── client.ts              # Clients Axios
│   │   │   ├── notifications.ts       # API Notifications
│   │   │   └── pickups.ts             # API Pickups
│   │   │
│   │   ├── 📁 notifications/
│   │   │   └── push.ts                # Push Notifications
│   │   │
│   │   └── utils.ts                   # Utilitaires
│   │
│   └── 📁 types/
│       └── index.ts                   # Types TypeScript
│
├── 📄 Configuration Files
│   ├── .env.example                   # Exemple variables d'env
│   ├── .env.local                     # Variables de dev
│   ├── .eslintrc.json                 # Configuration ESLint
│   ├── .gitignore                     # Git ignore
│   ├── next.config.js                 # Configuration Next.js
│   ├── next-env.d.ts                  # Types Next.js
│   ├── package.json                   # Dépendances
│   ├── postcss.config.js              # Configuration PostCSS
│   ├── tailwind.config.js             # Configuration Tailwind
│   └── tsconfig.json                  # Configuration TypeScript
│
└── 📚 Documentation
    ├── ARCHITECTURE.md                # Architecture détaillée
    ├── PROJECT_SUMMARY.md             # Résumé du projet
    ├── QUICKSTART.md                  # Guide démarrage rapide
    ├── README.md                      # Documentation principale
    └── STRUCTURE.md                   # Ce fichier

```

## Description des Dossiers Principaux

### `/public` - Assets Statiques
Contient tous les fichiers statiques accessibles publiquement :
- **icons/** : Icônes PWA (192x192, 512x512)
- **manifest.json** : Configuration PWA
- **sw.js** : Service Worker pour offline et push

### `/src/app` - Pages Next.js
Structure basée sur le système de routing de Next.js 14 :
- Chaque dossier = une route
- `page.tsx` = composant de page
- `[id]` = route dynamique
- `layout.tsx` = layout partagé

### `/src/components` - Composants React
Composants réutilisables organisés par catégorie :
- **layout/** : Composants de structure (navigation, header)
- **notifications/** : Système de notifications
- **ui/** : Composants UI atomiques (button, card, badge)

### `/src/lib` - Logique Métier
Contient toute la logique non-UI :
- **api/** : Services d'appel API
- **notifications/** : Gestion des push notifications
- **utils.ts** : Fonctions utilitaires

### `/src/hooks` - Custom Hooks
Hooks React personnalisés :
- **useMediaQuery** : Détection responsive

### `/src/types` - Types TypeScript
Définitions de types pour l'application :
- Pickup, TimeSlot, Document, KPI, Notification

## Flux de Données

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│  ┌──────────────────────────────────────────────┐  │
│  │          React Components (pages/)           │  │
│  └────────────────┬─────────────────────────────┘  │
│                   │                                  │
│  ┌────────────────▼─────────────────────────────┐  │
│  │        React Query (providers.tsx)           │  │
│  └────────────────┬─────────────────────────────┘  │
│                   │                                  │
│  ┌────────────────▼─────────────────────────────┐  │
│  │         API Services (lib/api/)              │  │
│  └────────────────┬─────────────────────────────┘  │
└───────────────────┼──────────────────────────────────┘
                    │
          ┌─────────┴─────────┐
          │                   │
┌─────────▼─────────┐  ┌─────▼──────────┐  ┌───────────┐
│  Core Orders      │  │   Planning     │  │Notifications│
│   (port 3001)     │  │  (port 3004)   │  │ (port 3002) │
└───────────────────┘  └────────────────┘  └───────────┘
```

## Conventions de Nommage

### Fichiers
- **Pages** : `page.tsx` (Next.js convention)
- **Composants** : `kebab-case.tsx` (ex: `notification-manager.tsx`)
- **Hooks** : `use*.ts` (ex: `useMediaQuery.ts`)
- **Types** : `index.ts` dans `/types`
- **Utils** : `utils.ts`, `helpers.ts`

### Code
- **Composants** : `PascalCase` (ex: `NotificationManager`)
- **Fonctions** : `camelCase` (ex: `formatDateTime`)
- **Types/Interfaces** : `PascalCase` (ex: `Pickup`, `TimeSlot`)
- **Constants** : `SCREAMING_SNAKE_CASE` (ex: `API_BASE_URL`)

## Imports Standards

```typescript
// Librairies externes
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

// Composants locaux
import { Button } from '@/components/ui/button'
import { Navigation } from '@/components/layout/navigation'

// Services et utils
import { pickupsApi } from '@/lib/api/pickups'
import { formatDate } from '@/lib/utils'

// Types
import type { Pickup, TimeSlot } from '@/types'
```

## Routes de l'Application

```
/ (home)                    Page d'accueil
├── /pickups               Liste des enlèvements
│   └── /pickups/[id]     Détail d'un enlèvement
├── /slots                 Gestion des créneaux
├── /preparation           Préparation & documents
└── /history              Historique & KPIs
```

## Composants UI Disponibles

### Base Components
- `<Button />` : Bouton avec variants (default, destructive, outline, etc.)
- `<Card />` : Conteneur avec header, content, footer
- `<Badge />` : Badge coloré (success, warning, danger, etc.)

### Layout Components
- `<Navigation />` : Navigation principale responsive

### Notification Components
- `<NotificationManager />` : Panneau de notifications avec push

### Usage Example
```typescript
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

<Card>
  <CardHeader>
    <CardTitle>Titre</CardTitle>
  </CardHeader>
  <CardContent>
    <Badge variant="success">Confirmé</Badge>
    <Button onClick={handleClick}>Action</Button>
  </CardContent>
</Card>
```

## Services API Disponibles

### pickupsApi
```typescript
import { pickupsApi } from '@/lib/api/pickups'

// Méthodes disponibles
pickupsApi.getAll(status?)
pickupsApi.getById(id)
pickupsApi.proposeSlot(pickupId, slot)
pickupsApi.confirmSlot(pickupId, slotId)
pickupsApi.uploadDocument(pickupId, file, type)
pickupsApi.markAsReady(pickupId)
pickupsApi.getKPIs(startDate?, endDate?)
```

### notificationApi
```typescript
import { notificationApi } from '@/lib/api/notifications'

// Méthodes disponibles
notificationApi.getAll(unreadOnly?)
notificationApi.markAsRead(id)
notificationApi.markAllAsRead()
notificationApi.subscribe(subscription)
```

## Environnements

### Development
- Port: 3103
- Hot reload: ✅
- Source maps: ✅
- React DevTools: ✅

### Production
- Build optimisé
- Minification
- Tree shaking
- Code splitting

## Métriques du Projet

- **Total fichiers**: 40
- **Pages**: 5 (Home, Pickups, Slots, Preparation, History)
- **Composants UI**: 4
- **Services API**: 2
- **Hooks personnalisés**: 1
- **Lignes de code**: ~2500+ lignes

## Technologies Clés

| Technologie | Version | Usage |
|------------|---------|-------|
| Next.js | 14.2.5 | Framework React SSR |
| React | 18.2.0 | UI Library |
| TypeScript | 5.4.0 | Type safety |
| Tailwind | 3.4.1 | Styling |
| React Query | 5.28.0 | State management |
| Axios | 1.6.8 | HTTP client |
| Radix UI | Latest | UI components |
| Lucide | 0.344.0 | Icons |

---

**Note** : Cette structure est optimisée pour la scalabilité et la maintenabilité. Chaque dossier a une responsabilité claire et suit les conventions Next.js 14.
