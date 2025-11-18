# Design System - Application Mobile Conducteur

> Documentation UX/UI pour la PWA conducteur RT-Technologie

## Vue d'ensemble

L'application mobile conducteur est une Progressive Web App (PWA) optimisée pour une utilisation sur le terrain, avec des conditions parfois difficiles (gants, luminosité variable, connexion intermittente).

### Principes de Design

#### 1. Ultra Simplicité
- **Gros boutons** : minimum 48x48px (tactile avec gants)
- **Texte minimal** : uniquement l'essentiel
- **1 écran = 1 action** : pas de surcharge cognitive
- **Lisibilité maximale** : contraste élevé, grandes polices

#### 2. Code Couleur Intuitif
| Couleur | Signification | Hex |
|---------|---------------|-----|
| Bleu | En route, en mouvement | #3b82f6 |
| Orange | Attente, action requise | #f59e0b |
| Vert | Terminé, validé | #10b981 |
| Rouge | Erreur, retard, urgence | #ef4444 |
| Gris | Inactif, disabled | #6b7280 |

#### 3. Navigation Minimale
- Maximum 3 clics pour n'importe quelle fonction
- Menu principal : 5 icônes max
- Bottom navigation sur mobile
- Pas de sous-menus cachés

## Composants

### 1. MissionCard

Carte affichant une mission avec statut visuel.

#### Props
```typescript
interface MissionCardProps {
  status: 'pending' | 'inProgress' | 'completed' | 'cancelled' | 'delayed';
  missionNumber?: string;
  destination?: string;
  eta?: string;
  distance?: string;
  urgent?: boolean;
  onAction?: () => void;
  actionLabel?: string;
  statusLabel?: string;
}
```

#### Exemple d'utilisation
```tsx
<MissionCard
  status="inProgress"
  missionNumber="M-2024-001"
  destination="Entrepôt Logistique Paris Nord"
  eta="14:30"
  distance="12 km"
  urgent={false}
  actionLabel="Arrivé sur site"
  statusLabel="En cours"
  onAction={() => console.log('Action clicked')}
/>
```

#### États visuels
- **pending** : Bordure orange, fond blanc
- **inProgress** : Bordure bleue, fond blanc
- **completed** : Bordure verte, fond blanc
- **delayed** : Bordure rouge, badge "Urgent" animé

### 2. SignaturePad

Zone de signature tactile avec canvas HTML5.

#### Props
```typescript
interface SignaturePadProps {
  width?: number;
  height?: number;
  penColor?: string;
  penWidth?: number;
  backgroundColor?: string;
  onSave?: (signature: string) => void;
  onClear?: () => void;
  onChange?: (isEmpty: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
}
```

#### Exemple d'utilisation
```tsx
<SignaturePad
  width={600}
  height={300}
  onSave={(signature) => console.log('Signature:', signature)}
  placeholder="Signez ici"
/>
```

#### Fonctionnalités
- Support tactile et souris
- Export en base64 (PNG)
- Boutons Effacer / Valider (48px minimum)
- Responsive (s'adapte à la largeur)

### 3. QRCodeDisplay

Affichage d'un QR code pour scan par le destinataire.

#### Props
```typescript
interface QRCodeDisplayProps {
  value: string;
  size?: number;
  displayValue?: boolean;
  title?: string;
  subtitle?: string;
  onShare?: () => void;
  level?: 'L' | 'M' | 'Q' | 'H';
}
```

#### Exemple d'utilisation
```tsx
<QRCodeDisplay
  value="MISSION-2024-001"
  size={256}
  title="Code de livraison"
  subtitle="Faites scanner ce code au destinataire"
  displayValue={true}
  onShare={() => console.log('Share')}
/>
```

#### Intégration recommandée
- Utiliser `qrcode.react` ou `qrcode-generator`
- Taille minimum : 200x200px
- Niveau de correction d'erreur : M (Medium)

### 4. DocumentScanner

Scan et capture de documents via caméra.

#### Props
```typescript
interface DocumentScannerProps {
  onScan?: (document: ScannedDocument) => void;
  onRemove?: (documentId: string) => void;
  documents?: ScannedDocument[];
  maxDocuments?: number;
  acceptedTypes?: string[];
}
```

#### Exemple d'utilisation
```tsx
<DocumentScanner
  maxDocuments={10}
  acceptedTypes={['image/*', 'application/pdf']}
  onScan={(doc) => console.log('Document scanné:', doc)}
  documents={scannedDocs}
/>
```

#### Fonctionnalités
- Accès caméra (permission requise)
- Upload de fichiers
- Aperçu des documents
- Suppression individuelle
- Guidage visuel (overlay cadre)

### 5. StatusTimeline

Timeline des étapes de la mission.

#### Props
```typescript
interface StatusTimelineProps {
  steps: TimelineStep[];
  orientation?: 'vertical' | 'horizontal';
  compact?: boolean;
}

interface TimelineStep {
  id: string;
  label: string;
  status: 'completed' | 'current' | 'pending';
  timestamp?: Date;
  description?: string;
}
```

#### Exemple d'utilisation
```tsx
<StatusTimeline
  orientation="vertical"
  steps={[
    { id: '1', label: 'Assignée', status: 'completed', timestamp: new Date() },
    { id: '2', label: 'En route', status: 'completed', timestamp: new Date() },
    { id: '3', label: 'Sur site', status: 'current' },
    { id: '4', label: 'Chargement', status: 'pending' },
    { id: '5', label: 'En livraison', status: 'pending' },
    { id: '6', label: 'Livrée', status: 'pending' },
  ]}
/>
```

### 6. GPSTracker

Affichage position GPS et navigation.

#### Props
```typescript
interface GPSTrackerProps {
  currentPosition?: GPSPosition;
  destinationPosition?: GPSPosition;
  eta?: string;
  distance?: string;
  isDeviated?: boolean;
  onRefreshPosition?: () => void;
  mapHeight?: number;
}
```

#### Exemple d'utilisation
```tsx
<GPSTracker
  currentPosition={{ latitude: 48.8566, longitude: 2.3522 }}
  destinationPosition={{ latitude: 48.8738, longitude: 2.2950 }}
  eta="15 min"
  distance="8 km"
  isDeviated={false}
  onRefreshPosition={refreshGPS}
  mapHeight={300}
/>
```

#### Intégration carte
- Google Maps API ou Mapbox
- Marqueur position actuelle (bleu pulsant)
- Marqueur destination (rouge)
- Alerte déviation (rouge, animée)

### 7. OfflineIndicator

Indicateur de statut connexion.

#### Props
```typescript
interface OfflineIndicatorProps {
  isOnline?: boolean;
  pendingCount?: number;
  onRetry?: () => void;
  position?: 'top' | 'bottom';
  showDetails?: boolean;
}
```

#### Exemple d'utilisation
```tsx
<OfflineIndicator
  isOnline={false}
  pendingCount={3}
  position="top"
  showDetails={true}
  onRetry={syncData}
/>
```

#### Comportement
- Masqué si en ligne et aucune donnée en attente
- Orange si hors-ligne
- Bleu si données en attente de sync
- Compteur de données non synchronisées

### 8. QuickReplyButtons

Boutons de réponses rapides pré-formatées.

#### Props
```typescript
interface QuickReplyButtonsProps {
  replies: QuickReply[];
  onSelect?: (reply: QuickReply) => void;
  layout?: 'grid' | 'horizontal' | 'vertical';
  disabled?: boolean;
}

interface QuickReply {
  id: string;
  label: string;
  message: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
}
```

#### Exemple d'utilisation
```tsx
import { commonQuickReplies } from '@rt/design-system';

<QuickReplyButtons
  replies={commonQuickReplies}
  layout="grid"
  onSelect={(reply) => sendMessage(reply.message)}
/>
```

#### Réponses pré-configurées
- Arrivé sur site
- Retard 15min
- Retard 30min
- Problème
- Chargement en cours
- Déchargement en cours
- Mission terminée
- Besoin d'aide

## Thème Mobile

### Tailles tactiles (WCAG 2.1 AA)
```typescript
touchTargets: {
  minimum: '44px',      // iOS/WCAG minimum
  recommended: '48px',  // Android minimum
  comfortable: '56px',  // Avec gants
}
```

### Typographie mobile
```typescript
typography: {
  heading: {
    h1: '2rem',      // 32px (réduit vs desktop)
    h2: '1.75rem',   // 28px
    h3: '1.5rem',    // 24px
    h4: '1.25rem',   // 20px
  },
  body: {
    large: '1.125rem',  // 18px
    regular: '1rem',    // 16px
    small: '0.875rem',  // 14px
  },
  button: {
    large: '1.125rem',
    regular: '1rem',
    small: '0.875rem',
  },
}
```

### Classes utilitaires
```typescript
mobileClasses: {
  touchTarget: 'min-h-[48px] min-w-[48px]',
  screenPadding: 'px-4',
  buttonPrimary: 'min-h-[48px] px-6 rounded-lg bg-blue-600 text-white...',
  card: 'rounded-lg border border-gray-200 bg-white shadow-sm p-6',
  input: 'min-h-[48px] px-4 rounded-lg border-2...',
}
```

## Écrans PWA

### 1. Écran d'accueil
```
┌─────────────────────┐
│   Logo RT           │
│                     │
│ ┌─────────────────┐ │
│ │ Scanner QR Code │ │ <- Bouton 56px
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │  Code Mission   │ │
│ └─────────────────┘ │
│                     │
│ Dernières missions  │
│ • Mission #001      │
│ • Mission #002      │
└─────────────────────┘
```

### 2. Dashboard Mission
```
┌─────────────────────┐
│ Mission #M-2024-001 │
│ ┌─────────────────┐ │
│ │  Carte GPS      │ │
│ │  [Position]     │ │
│ └─────────────────┘ │
│ ETA: 15 min  8 km   │
│                     │
│ Timeline:           │
│ ✓ Assignée          │
│ ✓ En route          │
│ ● Sur site  <─ NOW  │
│ ○ Chargement        │
│                     │
│ ┌─────────────────┐ │
│ │ ARRIVÉ SUR SITE │ │ <- Action 56px
│ └─────────────────┘ │
└─────────────────────┘
```

### 3. Signature
```
┌─────────────────────┐
│ Signature quai      │
│                     │
│ ┌─────────────────┐ │
│ │                 │ │
│ │  [Canvas]       │ │ 300px
│ │  "Signez ici"   │ │
│ │                 │ │
│ └─────────────────┘ │
│                     │
│ Nom: ____________   │
│                     │
│ ┌────┐ ┌─────────┐ │
│ │Effac││ Valider │ │ 48px
│ └────┘ └─────────┘ │
└─────────────────────┘
```

## Bonnes Pratiques

### Accessibilité
- ✅ Contraste minimum 4.5:1
- ✅ Cibles tactiles 48x48px minimum
- ✅ Navigation clavier complète
- ✅ ARIA labels sur tous les boutons
- ✅ Focus visible

### Performance
- ✅ Animations < 300ms
- ✅ Lazy loading des images
- ✅ Service Worker (offline)
- ✅ Cache API
- ✅ IndexedDB pour stockage local

### UX Mobile
- ✅ Bottom navigation (pouces)
- ✅ Pull-to-refresh
- ✅ Swipe gestures
- ✅ Haptic feedback
- ✅ Safe areas (notch iPhone)

## Do's and Don'ts

### ✅ DO
- Utiliser les composants du design system
- Respecter le code couleur (bleu/orange/vert/rouge)
- Tester avec des gants
- Prévoir le mode hors-ligne
- Afficher le statut de sync
- Garder les écrans simples (1 action = 1 écran)

### ❌ DON'T
- Ne pas mettre de boutons < 48px
- Ne pas utiliser de hover states (pas de souris)
- Ne pas cacher des fonctions importantes dans des menus
- Ne pas utiliser de texte < 14px
- Ne pas oublier les feedbacks tactiles
- Ne pas négliger la batterie

## Intégration Développeur

### Installation
```bash
npm install @rt/design-system
```

### Import
```typescript
import {
  MissionCard,
  SignaturePad,
  QRCodeDisplay,
  DocumentScanner,
  StatusTimeline,
  GPSTracker,
  OfflineIndicator,
  QuickReplyButtons,
  mobileTheme,
  mobileClasses,
} from '@rt/design-system';
```

### Configuration Tailwind (si utilisé)
```javascript
// tailwind.config.js
const { mobileTheme } = require('@rt/design-system');

module.exports = {
  theme: {
    extend: {
      minHeight: mobileTheme.touchTargets,
      spacing: mobileTheme.spacing,
      // ...
    },
  },
};
```

## Support et Contact

- Documentation complète : `/packages/design-system/docs`
- Issues : GitHub Issues
- Contact : design-system@rt-technologie.com
