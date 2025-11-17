# RT Recipient - Espace Destinataire

Application Next.js 14 pour la gestion des livraisons côté destinataire.

## Fonctionnalités

### 1. Livraisons Attendues (`/deliveries`)
- Visualisation des livraisons prévues
- Suivi ETA en temps réel
- Filtres par statut (toutes, aujourd'hui, arrivée imminente)
- Détails complets de chaque livraison

### 2. Gestion des Créneaux (`/slots`)
- Proposition de créneaux de réception
- Confirmation de RDV avec transporteurs
- Vue calendrier des disponibilités
- Gestion multi-livraisons

### 3. Réception (`/receive`)
- Workflow de réception en 4 étapes :
  1. Sélection de la livraison
  2. Contrôle qualité et quantité
  3. Documentation photographique
  4. Signature électronique du CMR
- Détection automatique d'anomalies
- Signature tactile HTML5 Canvas

### 4. Anomalies (`/anomalies`)
- Déclaration de dégâts/manquants
- Upload de photos avec caméra smartphone
- Suivi du statut de résolution
- Filtres par gravité et statut

### 5. Historique (`/history`)
- Livraisons passées
- Statistiques de performance :
  - Taux de conformité
  - Retards moyens
  - Performance des transporteurs
- Filtres par période (7j, 30j, 90j, tout)

## Technologies

- **Framework**: Next.js 14 (App Router)
- **UI**: React 18 + Tailwind CSS
- **État**: Zustand + TanStack Query
- **API**: Axios avec intercepteurs
- **Dates**: date-fns
- **Icônes**: Lucide React

## Installation

```bash
# Installer les dépendances
pnpm install

# Copier les variables d'environnement
cp .env.example .env.local

# Lancer en développement
pnpm dev

# Build pour production
pnpm build

# Lancer en production
pnpm start
```

## Configuration

L'application se connecte aux services backend suivants :

- **Core Orders** (port 3001) : Gestion des commandes et livraisons
- **Planning** (port 3004) : Gestion des créneaux horaires
- **E-CMR** (port 3009) : Signature électronique des CMR
- **Tracking IA** (port 3008) : Calcul des ETA en temps réel

Configurer les URLs dans `.env.local` :

```env
NEXT_PUBLIC_API_CORE_ORDERS=http://localhost:3001
NEXT_PUBLIC_API_PLANNING=http://localhost:3004
NEXT_PUBLIC_API_ECMR=http://localhost:3009
NEXT_PUBLIC_API_TRACKING=http://localhost:3008
```

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── (main)/            # Layout principal avec navigation
│   │   ├── deliveries/    # Page des livraisons
│   │   ├── slots/         # Page des créneaux
│   │   ├── receive/       # Page de réception
│   │   ├── anomalies/     # Page des anomalies
│   │   └── history/       # Page historique
│   ├── layout.tsx         # Layout racine
│   ├── page.tsx          # Page d'accueil (redirect)
│   ├── providers.tsx      # Providers React Query
│   └── globals.css       # Styles globaux
├── components/            # Composants réutilisables
│   ├── header.tsx
│   ├── navigation.tsx
│   ├── signature-canvas.tsx
│   ├── photo-upload.tsx
│   └── ...
└── lib/                   # Utilitaires et API
    ├── api/              # Client API et types
    │   ├── client.ts
    │   ├── types.ts
    │   ├── deliveries.ts
    │   ├── slots.ts
    │   ├── receptions.ts
    │   └── anomalies.ts
    └── utils.ts          # Fonctions utilitaires
```

## Composants Spéciaux

### SignatureCanvas
Composant de signature tactile pour la validation des CMR :
- Support souris, tactile et stylet
- Export en base64 (PNG)
- Validation du signataire

### PhotoUpload
Composant d'upload de photos optimisé :
- Capture depuis caméra smartphone
- Import de fichiers existants
- Prévisualisation
- Compression automatique
- Limite configurable (par défaut 5 photos)

## Développement

### Mock Data
En mode développement, l'application utilise des données mockées si les services backend ne sont pas disponibles. Les fonctions mock sont dans chaque fichier `lib/api/*.ts`.

### Hooks personnalisés
- `useQuery` pour le fetching de données
- `useMutation` pour les modifications
- Refresh automatique pour les livraisons (30s)
- Refresh automatique pour les anomalies (60s)

## UX Mobile-First

L'application est optimisée pour une utilisation mobile :
- Design responsive (Tailwind)
- Composants tactiles (boutons, canvas)
- Upload photo natif
- Notifications push (à venir)
- Accès hors-ligne (à venir avec PWA)

## Sécurité

- Authentification par token JWT (localStorage)
- Intercepteurs axios pour auth automatique
- Gestion des erreurs 401
- Validation côté client et serveur
- Signature CMR avec géolocalisation (optionnel)

## Performance

- Server Components par défaut
- Client Components uniquement si nécessaire
- Images optimisées (Next.js Image)
- Lazy loading des composants lourds
- Cache TanStack Query (1 minute)

## Support Navigateurs

- Chrome/Edge (dernières versions)
- Firefox (dernières versions)
- Safari iOS 14+
- Chrome Android

## Licence

Propriétaire - RT Technologie
