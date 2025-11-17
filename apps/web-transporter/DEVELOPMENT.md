# Guide de Développement - Web Transporter

## Démarrage rapide

### 1. Installation

Depuis la racine du monorepo :
```bash
pnpm install
```

### 2. Configuration

Créer un fichier `.env.local` :
```bash
cd apps/web-transporter
cp .env.local.example .env.local
```

### 3. Lancer les services backend

Depuis la racine du monorepo, lancer tous les services :
```bash
pnpm agents
```

Cela démarre :
- core-orders (port 3001)
- planning (port 3004)
- ecpmr (port 3009)
- vigilance (port 3002)

### 4. Lancer l'application

```bash
cd apps/web-transporter
pnpm dev
```

L'application est accessible sur http://localhost:3100

### 5. Se connecter

- Naviguer vers http://localhost:3100/login
- Sélectionner CARRIER-B
- Cliquer sur "Se connecter"

## Structure du code

### Pages (App Router)

Toutes les pages utilisent le nouveau App Router de Next.js 14 :

- `src/app/page.tsx` - Dashboard principal
- `src/app/login/page.tsx` - Authentification
- `src/app/missions/pending/page.tsx` - Missions en attente
- `src/app/missions/accepted/page.tsx` - Missions acceptées
- `src/app/planning/page.tsx` - Planning RDV
- `src/app/documents/page.tsx` - Gestion documents
- `src/app/profile/page.tsx` - Profil transporteur

Toutes les pages utilisent la directive `'use client'` car elles nécessitent l'authentification côté client.

### Composants

#### Layout (`src/components/Layout.tsx`)
Composant wrapper principal qui contient :
- Header avec logo et déconnexion
- Navigation mobile (bottom nav)
- Navigation desktop (sidebar)
- Zone de contenu principale

#### MissionCard (`src/components/MissionCard.tsx`)
Carte réutilisable pour afficher une mission avec :
- Timer SLA en temps réel
- Badge de statut (critique/warning/normal)
- Informations de la mission
- Boutons d'action optionnels

#### Composants UI (`src/components/ui/`)
- `Button.tsx` - Bouton avec variantes (default, destructive, outline, ghost)
- `Card.tsx` - Carte avec header, content, footer
- `Badge.tsx` - Badge avec variantes de couleur

### Services

#### API Client (`src/services/api.ts`)
Client HTTP pour communiquer avec le backend :
- Gestion automatique de l'authentification JWT
- Fonctions typées pour chaque endpoint
- Gestion des erreurs

Fonctions disponibles :
```typescript
getPendingMissions(carrierId: string)
getAcceptedMissions(carrierId: string)
acceptMission(orderId: string, carrierId: string)
refuseMission(orderId: string, carrierId: string)
getSlots(date: string)
proposeRDV(orderId: string, date: string, time: string)
uploadDocument(upload: DocumentUpload)
getDocuments(orderId: string)
```

### Utilitaires

#### Auth (`src/lib/auth.ts`)
Gestion de l'authentification JWT :
- `getToken()` - Récupérer le token du localStorage
- `setToken(token)` - Stocker le token
- `removeToken()` - Supprimer le token
- `decodeToken(token)` - Décoder le payload JWT
- `isTokenValid(token)` - Vérifier la validité
- `getCurrentCarrier()` - Récupérer le transporteur connecté

#### Utils (`src/lib/utils.ts`)
Fonctions utilitaires :
- `cn()` - Merge de classes CSS
- `formatDate()` - Formatage de date (fr-FR)
- `formatTime()` - Formatage d'heure (fr-FR)
- `formatDateTime()` - Formatage date + heure
- `getTimeRemaining()` - Calcul du temps restant
- `getSLAStatus()` - Détermination du statut SLA

## Conventions de code

### TypeScript
- Toujours typer les props des composants
- Utiliser des interfaces pour les données
- Éviter `any`, utiliser `unknown` si nécessaire

### React
- Composants fonctionnels avec hooks
- Utiliser `'use client'` pour les composants client
- Déstructurer les props
- Nommer les handlers `handle*` (ex: `handleAccept`)

### Styling
- Utiliser TailwindCSS pour le styling
- Classes utilitaires first
- Composants UI réutilisables pour la cohérence
- Mobile-first approach

### Naming
- Fichiers : PascalCase pour composants, camelCase pour utils
- Composants : PascalCase
- Fonctions : camelCase
- Constants : UPPER_SNAKE_CASE

## Gestion d'état

L'application utilise l'état local React avec `useState` et `useEffect`.

Pour les futures évolutions, considérer :
- Zustand pour l'état global
- React Query pour la gestion du cache API
- SWR pour le data fetching

## API Backend

### Rewrites Next.js

Les URLs `/api/*` sont rewritées vers les services backend :

```javascript
// next.config.js
{
  source: '/api/orders/:path*',
  destination: 'http://localhost:3001/carrier/:path*'
}
```

Cela permet d'éviter les problèmes CORS et de centraliser la configuration.

### Format des réponses

Toutes les réponses API suivent ce format :

**Succès** :
```json
{
  "items": [...],
  "ok": true
}
```

**Erreur** :
```json
{
  "error": "Message d'erreur"
}
```

## Tests

### Tests unitaires (à venir)
```bash
pnpm test
```

### Tests E2E (à venir)
```bash
pnpm test:e2e
```

## Débogage

### Logs API
Les requêtes API sont loggées dans la console du navigateur.

### React DevTools
Installer l'extension React DevTools pour inspecter les composants.

### Network Tab
Utiliser l'onglet Network pour inspecter les requêtes HTTP.

## Build & Déploiement

### Build local
```bash
pnpm build
```

### Variables d'environnement production

Créer un fichier `.env.production.local` :
```env
CORE_ORDERS_URL=https://api.rt-technologie.com/orders
PLANNING_URL=https://api.rt-technologie.com/planning
ECPMR_URL=https://api.rt-technologie.com/ecpmr
VIGILANCE_URL=https://api.rt-technologie.com/vigilance
JWT_SECRET=prod-secret-key
```

### Docker

Un Dockerfile sera créé pour containeriser l'application.

## Performance

### Optimisations actuelles
- Code splitting automatique (Next.js)
- Tree shaking
- Image optimization (next/image)
- CSS purging (Tailwind)

### Recommandations futures
- Implémenter le caching API
- Lazy loading des composants lourds
- Optimiser les re-renders
- Service Worker pour le mode offline

## Accessibilité

### Standards
- Suivre les guidelines WCAG 2.1 AA
- Tester avec un lecteur d'écran
- Support clavier complet
- Contraste de couleurs conforme

### Outils
- Lighthouse pour auditer
- axe DevTools pour les tests
- WAVE pour l'analyse

## Internationalisation

L'application est actuellement en français (fr-FR).

Pour ajouter d'autres langues :
1. Installer next-intl
2. Créer les fichiers de traduction
3. Wrapper l'app avec IntlProvider

## FAQ Développeurs

**Q: Comment ajouter une nouvelle page ?**
R: Créer un dossier dans `src/app/` avec un fichier `page.tsx`

**Q: Comment ajouter un nouveau composant UI ?**
R: Créer le composant dans `src/components/ui/` et l'exporter

**Q: Comment tester l'authentification ?**
R: Utiliser la page `/login` en mode démo

**Q: Comment simuler une erreur API ?**
R: Arrêter le service backend correspondant

**Q: Comment ajouter un nouvel endpoint ?**
R: Ajouter la fonction dans `src/services/api.ts` et le rewrite dans `next.config.js`

## Ressources

- [Next.js Docs](https://nextjs.org/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [React Docs](https://react.dev)
