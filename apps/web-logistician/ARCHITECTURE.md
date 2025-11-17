# Architecture - Web Logistician

## Vue d'ensemble

L'application **web-logistician** est construite avec Next.js 14 en mode Pages Router, optimisée pour les tablettes et appareils mobiles utilisés dans les entrepôts.

## Stack technique

```
┌─────────────────────────────────────┐
│         Next.js 14 (React 18)       │
│         TypeScript 5.4              │
└─────────────────────────────────────┘
                  │
                  ├── PWA (next-pwa)
                  ├── Canvas API (signatures)
                  ├── Media API (caméra)
                  └── LocalStorage (cache)

┌─────────────────────────────────────┐
│           Backend Services          │
├─────────────────────────────────────┤
│  Planning API    │ port 3004        │
│  E-CMR API       │ port 3009        │
│  Core Orders API │ port 3001        │
└─────────────────────────────────────┘
```

## Structure de fichiers

```
apps/web-logistician/
├── pages/
│   ├── _app.tsx              # Layout principal + navigation
│   ├── index.tsx             # Dashboard
│   ├── login.tsx             # Authentification
│   ├── docks.tsx             # Planning des quais
│   ├── receptions.tsx        # Liste réceptions
│   ├── expeditions.tsx       # Liste expéditions
│   ├── scanner.tsx           # Scanner codes-barres
│   ├── ecmr/
│   │   ├── index.tsx         # Liste E-CMR
│   │   ├── new.tsx           # Nouveau E-CMR
│   │   └── sign.tsx          # Signature électronique
│   └── anomalies/
│       ├── index.tsx         # Liste anomalies
│       └── new.tsx           # Déclaration anomalie
├── public/
│   ├── manifest.json         # PWA manifest
│   └── icons/                # Icônes PWA
├── package.json
├── next.config.js            # Config Next.js + PWA
├── tsconfig.json             # Config TypeScript
└── .env.example              # Variables d'environnement
```

## Principes d'architecture

### 1. Server-Side Rendering (SSR) désactivé

L'application utilise le mode **Client-Side Only** car :
- Pas de SEO nécessaire (app interne)
- Besoin d'accès aux APIs navigateur (caméra, canvas)
- Meilleure réactivité pour l'UX tactile
- Simplicité du déploiement

### 2. State Management

**Pas de Redux/Zustand** - L'état est géré avec :
- `useState` pour l'état local des composants
- `useEffect` pour les appels API
- `localStorage` pour la persistance
- `Context API` si besoin futur de partage d'état

**Rationale** :
- Application simple avec peu d'état partagé
- Pas de flux de données complexe
- Meilleure lisibilité du code

### 3. Styling

**Inline styles avec objets TypeScript** :
```typescript
style={{
  padding: '12px',
  background: '#2563eb',
  borderRadius: '8px'
}}
```

**Rationale** :
- Pas de fichiers CSS séparés à maintenir
- Type-safe avec TypeScript
- Pas de classes CSS à mémoriser
- Meilleure colocation code/style

### 4. Data Fetching

**Fetch native avec async/await** :
```typescript
const response = await fetch(`${API_URL}/endpoint`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(data)
});
```

**Rationale** :
- Pas besoin de librairie externe (axios, swr)
- API native du navigateur
- Support complet de TypeScript
- Gestion d'erreur simple avec try/catch

## Patterns et conventions

### 1. Composants fonctionnels

Tous les composants utilisent la syntaxe fonction :
```typescript
export default function ComponentName() {
  return <div>...</div>;
}
```

### 2. Types TypeScript

Interfaces pour les données métier :
```typescript
interface Reception {
  id: string;
  orderId: string;
  status: 'pending' | 'in_progress' | 'completed';
  // ...
}
```

### 3. Gestion des erreurs

```typescript
try {
  await apiCall();
} catch (error) {
  console.error('Error:', error);
  alert('Message utilisateur friendly');
}
```

### 4. Loading states

```typescript
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  setLoading(true);
  try {
    // Action...
  } finally {
    setLoading(false);
  }
};
```

## PWA et mode hors-ligne

### Service Worker

Généré automatiquement par `next-pwa` :
- Cache les assets statiques (JS, CSS, images)
- Stratégie : Cache First, fallback Network
- Mise à jour : Skip Waiting activé

### LocalStorage

Structure des données en cache :
```typescript
localStorage.setItem('logistician_jwt', token);
localStorage.setItem('logistician_user', JSON.stringify(user));
localStorage.setItem('offline_queue', JSON.stringify(actions));
```

### Synchronisation

À la reconnexion, replay des actions en file d'attente :
```typescript
window.addEventListener('online', () => {
  const queue = JSON.parse(localStorage.getItem('offline_queue') || '[]');
  queue.forEach(action => replayAction(action));
});
```

## Optimisations performances

### 1. Images

- Pas d'images lourdes
- Icônes emoji natifs (pas de SVG)
- Photos redimensionnées côté client avant upload

### 2. Bundle size

- Pas de librairies lourdes (moment.js, lodash)
- Tree-shaking automatique avec Next.js
- Code-splitting par page automatique

### 3. Touch responsiveness

- Pas de hover states (sauf desktop)
- Touch events natifs
- Feedback visuel immédiat
- Pas de double-tap zoom

## Sécurité

### 1. Authentication

```typescript
// Check token sur chaque page
useEffect(() => {
  const token = localStorage.getItem('logistician_jwt');
  if (!token) {
    router.push('/login');
  }
}, [router]);
```

### 2. API calls

```typescript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### 3. Input validation

- Validation côté client avant envoi
- Types TypeScript pour la sécurité de type
- Confirmation utilisateur pour actions critiques

## Accessibilité

### 1. Touch targets

Minimum 44x44px selon Apple Human Interface Guidelines :
```typescript
minHeight: '44px',
minWidth: '44px'
```

### 2. Font size

Minimum 16px pour éviter le zoom automatique iOS :
```typescript
fontSize: '16px'
```

### 3. Contraste

Ratios WCAG AA minimum :
- Texte normal : 4.5:1
- Texte large : 3:1
- Éléments interactifs : 3:1

## Tests

### Structure recommandée

```
pages/
├── __tests__/
│   ├── index.test.tsx
│   ├── docks.test.tsx
│   └── ...
└── [pages files]
```

### Tests unitaires

```typescript
import { render, screen } from '@testing-library/react';
import Dashboard from '../index';

test('renders dashboard', () => {
  render(<Dashboard />);
  expect(screen.getByText('Dashboard')).toBeInTheDocument();
});
```

### Tests E2E (Playwright)

```typescript
test('complete reception workflow', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.click('button[type="submit"]');
  await page.goto('/receptions');
  // ...
});
```

## Monitoring et logging

### Console logs

En développement, logs détaillés :
```typescript
console.log('Action:', data);
console.error('Error:', error);
```

En production, logs minimaux (erreurs uniquement).

### Error tracking

Intégration recommandée :
- Sentry pour tracking d'erreurs
- Google Analytics pour usage
- Custom events pour métriques métier

## Déploiement

### Environnements

1. **Development** : localhost:3106
2. **Staging** : staging.logistician.rt-technologie.com
3. **Production** : logistician.rt-technologie.com

### Variables d'environnement

Différentes par environnement :
- Development : APIs en localhost
- Staging : APIs de staging
- Production : APIs de production

### CI/CD

Pipeline recommandé :
```yaml
1. Lint (ESLint + Prettier)
2. Type check (tsc --noEmit)
3. Tests unitaires (Jest)
4. Build (next build)
5. Tests E2E (Playwright)
6. Deploy (Vercel/AWS)
```

## Bonnes pratiques

### DOs

- ✅ Utiliser TypeScript partout
- ✅ Valider les inputs utilisateur
- ✅ Gérer tous les états de loading
- ✅ Afficher des messages d'erreur clairs
- ✅ Tester sur vrais devices (tablettes)
- ✅ Optimiser pour le tactile
- ✅ Prévoir le mode hors-ligne

### DON'Ts

- ❌ Ne pas oublier les try/catch
- ❌ Ne pas utiliser de librairies lourdes
- ❌ Ne pas ignorer les erreurs API
- ❌ Ne pas oublier les states de chargement
- ❌ Ne pas dépendre du hover
- ❌ Ne pas utiliser de polices < 16px
- ❌ Ne pas oublier les confirmations

## Évolutions futures

### Court terme
- [ ] Intégration vraie librairie scanner (html5-qrcode)
- [ ] Export PDF des E-CMR
- [ ] Notifications push
- [ ] Statistiques avancées

### Moyen terme
- [ ] Mode multi-langue (FR/EN)
- [ ] Dark mode
- [ ] Synchronisation temps réel (WebSocket)
- [ ] Gestion des équipes

### Long terme
- [ ] Intelligence artificielle (détection anomalies)
- [ ] Prédiction des temps de traitement
- [ ] Optimisation automatique du planning
- [ ] Intégration IoT (capteurs quais)

## Support

Pour questions sur l'architecture :
- Tech Lead : tech@rt-technologie.com
- Documentation : https://docs.rt-technologie.com/architecture
- Slack : #web-logistician
