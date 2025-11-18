# Design System - Bourse de Stockage

> Documentation UX/UI pour le module Marketplace de stockage RT-Technologie

## Vue d'ensemble

La Bourse de Stockage est un module desktop permettant aux industriels de publier leurs besoins de stockage et aux logisticiens d'y répondre. L'IA classe automatiquement les offres pour faciliter la décision.

### Principes de Design

#### 1. Lisibilité et Clarté
- Tableaux structurés pour listes
- Cartes visuelles pour les offres
- Badges de statut cohérents
- Hiérarchie visuelle claire

#### 2. Filtres et Recherche
- Sidebar de filtres toujours visible
- Chips de filtres actifs (supprimables)
- Recherche instantanée
- Tri par colonnes

#### 3. Comparaison et Décision
- Vue comparative des offres
- Recommandations IA visuellement distinctes
- Actions rapides (accepter, négocier, refuser)

## Composants

### 1. StorageNeedCard

Carte affichant un besoin de stockage.

#### Props
```typescript
interface StorageNeedCardProps {
  status: 'open' | 'closed' | 'assigned' | 'expired';
  title?: string;
  type?: string;
  volume?: string | number;
  location?: string;
  duration?: string;
  startDate?: Date;
  endDate?: Date;
  offersCount?: number;
  temperature?: string;
  adr?: boolean;
  onViewDetails?: () => void;
  onViewOffers?: () => void;
}
```

#### Exemple d'utilisation
```tsx
<StorageNeedCard
  status="open"
  title="Stockage produits frais Q1 2024"
  type="Rack à palettes"
  volume={500}
  location="Rungis (94)"
  duration="3 mois"
  startDate={new Date('2024-01-01')}
  endDate={new Date('2024-03-31')}
  offersCount={12}
  temperature="Frigo (+2/+8°C)"
  adr={false}
  onViewDetails={() => console.log('Details')}
  onViewOffers={() => console.log('Offers')}
/>
```

#### États visuels
- **open** : Bordure bleue, fond bleu léger
- **closed** : Bordure grise, fond gris
- **assigned** : Bordure verte, fond vert léger
- **expired** : Bordure rouge, fond rouge léger

### 2. OfferCard

Carte d'offre de logisticien.

#### Props
```typescript
interface OfferCardProps {
  highlighted?: boolean;
  selected?: boolean;
  providerName?: string;
  providerLogo?: string;
  price?: number;
  currency?: string;
  aiScore?: number;
  aiRank?: number;
  distance?: string;
  services?: string[];
  siteName?: string;
  onAccept?: () => void;
  onNegotiate?: () => void;
  onReject?: () => void;
  onViewDetails?: () => void;
}
```

#### Exemple d'utilisation
```tsx
<OfferCard
  highlighted={true}
  providerName="Logistique Express"
  price={15000}
  currency="€"
  aiScore={95}
  aiRank={1}
  distance="5 km"
  services={['WMS', 'Cross-docking', 'Transport']}
  siteName="Entrepôt Paris Nord"
  onAccept={handleAccept}
  onNegotiate={handleNegotiate}
  onReject={handleReject}
/>
```

#### Badge IA Ranking
- **Top 1** : Or (gradient jaune)
- **Top 2** : Argent (gradient gris)
- **Top 3** : Bronze (gradient orange)

### 3. AIRankingBadge

Badge de recommandation IA.

#### Props
```typescript
interface AIRankingBadgeProps {
  rank: number;
  score?: number;
  showTooltip?: boolean;
  reason?: string;
}
```

#### Exemple d'utilisation
```tsx
<AIRankingBadge
  rank={1}
  score={95}
  showTooltip={true}
  reason="Meilleur rapport qualité/prix et distance optimale"
/>
```

#### Affichage
- Icône étoile
- Texte "Top X IA"
- Pourcentage de confiance
- Tooltip explicatif au survol

### 4. CapacityGauge

Jauge de capacité d'entrepôt.

#### Props
```typescript
interface CapacityGaugeProps {
  current: number;
  total: number;
  unit?: string;
  label?: string;
  showPercentage?: boolean;
  warningThreshold?: number;
  criticalThreshold?: number;
}
```

#### Exemple d'utilisation
```tsx
<CapacityGauge
  current={850}
  total={1000}
  unit="palettes"
  label="Capacité Entrepôt A"
  showPercentage={true}
  warningThreshold={80}
  criticalThreshold={95}
/>
```

#### Code couleur
- < 80% : Vert (disponible)
- 80-94% : Orange (attention)
- ≥ 95% : Rouge (critique)

### 5. SiteMap

Carte interactive des sites logistiques.

#### Props
```typescript
interface SiteMapProps {
  markers?: MapMarker[];
  center?: { latitude: number; longitude: number };
  zoom?: number;
  height?: number;
  searchRadius?: number;
  onMarkerClick?: (marker: MapMarker) => void;
}

interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  label?: string;
  type?: 'current' | 'destination' | 'warehouse' | 'need';
  onClick?: () => void;
}
```

#### Exemple d'utilisation
```tsx
<SiteMap
  markers={warehouses.map(w => ({
    id: w.id,
    latitude: w.lat,
    longitude: w.lng,
    label: w.name,
    type: 'warehouse',
  }))}
  center={{ latitude: 48.8566, longitude: 2.3522 }}
  zoom={10}
  height={400}
  searchRadius={50}
  onMarkerClick={(marker) => console.log(marker)}
/>
```

#### Intégration recommandée
- Google Maps API ou Mapbox GL JS
- Clustering pour nombreux marqueurs
- InfoWindow au clic
- Rayon de recherche visuel

### 6. OfferComparator

Tableau comparatif d'offres.

#### Props
```typescript
interface OfferComparatorProps {
  offers: ComparableOffer[];
  onSelect?: (offerId: string) => void;
  selectedOfferId?: string;
  maxOffers?: number;
}

interface ComparableOffer {
  id: string;
  providerName: string;
  price: number;
  distance: string;
  aiScore?: number;
  aiRank?: number;
  services: string[];
  deliveryTime?: string;
}
```

#### Exemple d'utilisation
```tsx
<OfferComparator
  offers={receivedOffers}
  maxOffers={4}
  onSelect={(id) => setSelected(id)}
  selectedOfferId={selectedOffer}
/>
```

#### Fonctionnalités
- Comparaison côte à côte (max 4 offres)
- Highlighting des meilleures valeurs (vert)
- Highlighting des pires valeurs (rouge)
- Top 3 IA en surbrillance (fond doré/argenté/bronze)
- Sélection d'une offre

### 7. WMSIntegrationPanel

Panel d'intégration WMS.

#### Props
```typescript
interface WMSIntegrationPanelProps {
  isConnected?: boolean;
  systemName?: string;
  lastSync?: Date;
  currentStock?: number;
  recentMovements?: WMSMovement[];
  alerts?: string[];
  onConnect?: () => void;
  onDisconnect?: () => void;
  onSync?: () => void;
}

interface WMSMovement {
  id: string;
  type: 'in' | 'out';
  quantity: number;
  product: string;
  timestamp: Date;
}
```

#### Exemple d'utilisation
```tsx
<WMSIntegrationPanel
  isConnected={true}
  systemName="SAP WMS"
  lastSync={new Date()}
  currentStock={850}
  recentMovements={movements}
  alerts={['Stock faible sur produit A']}
  onSync={handleSync}
  onDisconnect={handleDisconnect}
/>
```

#### États
- **Connecté** : Bordure verte, indicateur vert pulsant
- **Déconnecté** : Bordure grise, message d'incitation
- **Synchronisation** : Icône rotate, loader

### 8. ContractTimeline

Timeline d'un contrat de stockage.

#### Props
```typescript
interface ContractTimelineProps {
  startDate?: Date;
  endDate?: Date;
  phases: ContractPhase[];
  currentPhase?: string;
  progress?: number;
  compact?: boolean;
}

interface ContractPhase {
  id: string;
  label: string;
  status: 'completed' | 'current' | 'pending';
  date?: Date;
  description?: string;
}
```

#### Exemple d'utilisation
```tsx
<ContractTimeline
  startDate={new Date('2024-01-01')}
  endDate={new Date('2024-12-31')}
  phases={[
    { id: '1', label: 'Sélection offre', status: 'completed', date: new Date('2024-01-05') },
    { id: '2', label: 'Contrat signé', status: 'completed', date: new Date('2024-01-10') },
    { id: '3', label: 'Activation WMS', status: 'current', date: new Date('2024-01-15') },
    { id: '4', label: 'En cours', status: 'pending' },
    { id: '5', label: 'Terminé', status: 'pending' },
  ]}
  progress={60}
/>
```

#### Affichage
- Dates début/fin en haut
- Barre de progression globale
- Timeline verticale avec icônes
- Phase actuelle animée (pulse)

## Thème Bourse

### Couleurs spécifiques
```typescript
colors: {
  need: {
    open: '#3b82f6',
    closed: '#6b7280',
    assigned: '#10b981',
    expired: '#ef4444',
  },
  offer: {
    pending: '#f59e0b',
    accepted: '#10b981',
    rejected: '#ef4444',
    negotiating: '#8b5cf6',
  },
  aiRanking: {
    top1: 'linear-gradient(...)', // Or
    top2: 'linear-gradient(...)', // Argent
    top3: 'linear-gradient(...)', // Bronze
  },
}
```

### Layouts
```typescript
layouts: {
  cardGrid: {
    mobile: 'grid-cols-1',
    tablet: 'md:grid-cols-2',
    desktop: 'lg:grid-cols-3',
  },
  sidebar: {
    width: '280px',
  },
  comparator: {
    maxColumns: 4,
    minColumnWidth: '200px',
  },
}
```

### Classes utilitaires
```typescript
storageClasses: {
  pageContainer: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8',
  cardGrid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  filterSidebar: 'w-72 bg-white border-r border-gray-200 p-6',
  dashboardKPI: 'bg-gradient-to-br from-blue-500 to-blue-600...',
}
```

## Écrans Desktop

### 1. Dashboard Bourse (Industriel)
```
┌────────────────────────────────────────────────────┐
│ RT Bourse de Stockage                              │
├────────────────────────────────────────────────────┤
│                                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ Besoins  │ │ Offres   │ │ Contrats │          │
│  │ actifs: 3│ │ reçues:12│ │ en cours:5│          │
│  └──────────┘ └──────────┘ └──────────┘          │
│                                                    │
│  Besoins récents:                                 │
│  ┌──────────────────────────────────────────┐    │
│  │ Stockage Q1 2024  [Ouvert]  12 offres   │    │
│  │ 500 palettes | Rungis      [Voir offres]│    │
│  └──────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────┐    │
│  │ Stockage ADR      [Attribué]  1 offre   │    │
│  │ 200 palettes | Lyon        [Gérer]      │    │
│  └──────────────────────────────────────────┘    │
│                                                    │
│  [ + Publier un nouveau besoin ]                  │
└────────────────────────────────────────────────────┘
```

### 2. Liste des Besoins
```
┌────────────────────────────────────────────────────┐
│ Mes Besoins de Stockage                            │
├────────────────────────────────────────────────────┤
│ [Filtres]  [Recherche_______________]  [+ Nouveau]│
│                                                    │
│ Statut: [Tous▾] Type: [Tous▾] Zone: [Tous▾]      │
│                                                    │
│ ┌Tableau───────────────────────────────────────┐  │
│ │ Titre        │Type│Volume│Zone │Offres│Statut│  │
│ ├──────────────┼────┼──────┼─────┼──────┼──────┤  │
│ │ Stockage Q1  │Rack│500 p │94   │  12  │Ouvert│  │
│ │ ADR Classe 3 │Flat│200 p │69   │   1  │Attrib│  │
│ │ Frigo +2/+8  │Rack│800 p │92   │   0  │Fermé │  │
│ └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

### 3. Détails Besoin + Offres Reçues
```
┌────────────────────────────────────────────────────┐
│ Stockage Produits Frais Q1 2024                    │
│ [Ouvert] 500 palettes | Rungis (94) | 3 mois      │
├────────────────────────────────────────────────────┤
│ Détails:                         Offres reçues: 12 │
│ • Type: Rack à palettes                            │
│ • Température: +2/+8°C          ┌────────────────┐ │
│ • Volume: 500 palettes          │ Comparateur    │ │
│ • Début: 01/01/2024             │ (Top 4)        │ │
│ • Fin: 31/03/2024               └────────────────┘ │
│                                                    │
│ Offres classées par IA:                            │
│ ┌────────────────────────────────────────────┐    │
│ │ [⭐ Top 1 IA]  Logistique Express         │    │
│ │ 15 000€ | 5km | Score: 95% | 3 services   │    │
│ │ [Accepter] [Négocier] [Détails]           │    │
│ └────────────────────────────────────────────┘    │
│ ┌────────────────────────────────────────────┐    │
│ │ [🥈 Top 2 IA]  Stockage Plus              │    │
│ │ 16 500€ | 12km | Score: 88% | 5 services  │    │
│ │ [Accepter] [Négocier] [Détails]           │    │
│ └────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────┘
```

### 4. Comparateur d'offres
```
┌─────────────────────────────────────────────────┐
│ Comparaison des 4 meilleures offres            │
├─────────────────────────────────────────────────┤
│         │ [⭐Top 1] │ [🥈Top 2] │ Offre C │ Offre D│
│         │ Log Expr │ Stock+   │ Entrepôt│ Distrib│
├─────────┼──────────┼──────────┼─────────┼────────┤
│ Prix    │ 15 000€  │ 16 500€  │ 17 200€ │ 18 000€│
│ Distance│ 5 km     │ 12 km    │ 8 km    │ 15 km  │
│ Score IA│ ⭐⭐⭐⭐⭐ │ ⭐⭐⭐⭐☆  │ ⭐⭐⭐☆☆  │ ⭐⭐⭐☆☆  │
│ Services│ ✓ WMS    │ ✓ WMS    │ ✓ WMS   │ × WMS  │
│         │ ✓ Cross  │ ✓ Cross  │ × Cross │ × Cross│
│         │ ✓ Transp │ ✓ Transp │ ✓ Transp│ ✓ Transp│
├─────────┼──────────┼──────────┼─────────┼────────┤
│ Action  │[Sélect.] │[Sélect.] │[Sélect.]│[Sélect.]│
└─────────────────────────────────────────────────┘
```

### 5. Bourse - Liste Annonces (Logisticien)
```
┌──────┬──────────────────────────────────────────┐
│Filter│ Annonces disponibles                     │
│      │                                          │
│Dista-│ [Recherche__________] [Carte/Liste]     │
│nce:  │                                          │
│[50km]│ ┌───────────────────────────────────┐   │
│      │ │ Stockage Produits Frais Q1        │   │
│Type: │ │ 500 palettes | Rungis (94) | 3 mois│  │
│[x]Rac│ │ Frigo +2/+8°C | 12 offres         │   │
│[x]Fla│ │ [Soumettre une offre]             │   │
│[ ]Vra│ └───────────────────────────────────┘   │
│      │                                          │
│Temp: │ ┌───────────────────────────────────┐   │
│[x]Amb│ │ Stockage ADR Classe 3             │   │
│[x]Fri│ │ 200 palettes | Lyon (69) | 6 mois │   │
│[ ]Cng│ │ ADR | 5 offres                    │   │
│      │ │ [Soumettre une offre]             │   │
│ADR:  │ └───────────────────────────────────┘   │
│[ ]Oui│                                          │
└──────┴──────────────────────────────────────────┘
```

## Bonnes Pratiques

### Accessibilité
- ✅ Tableaux avec headers ARIA
- ✅ Labels explicites sur filtres
- ✅ Tooltips informatifs
- ✅ Contraste suffisant
- ✅ Navigation clavier

### UX Desktop
- ✅ Sidebar fixe (scroll indépendant)
- ✅ Tri par colonnes
- ✅ Pagination (50 items/page)
- ✅ Filtres persistants
- ✅ Breadcrumbs

### Performance
- ✅ Virtualisation tableaux (react-window)
- ✅ Lazy loading cartes
- ✅ Debounce recherche (300ms)
- ✅ Cache API calls
- ✅ Optimistic UI updates

## Do's and Don'ts

### ✅ DO
- Afficher clairement le Top 3 IA
- Permettre la comparaison facile
- Rendre les filtres visibles
- Montrer le nombre d'offres
- Donner un feedback immédiat

### ❌ DON'T
- Ne pas cacher les critères IA
- Ne pas surcharger les cartes
- Ne pas comparer > 4 offres
- Ne pas oublier les unités (€, km, palettes)
- Ne pas négliger le responsive (tablet)

## Intégration Développeur

### Installation
```bash
npm install @rt/design-system
```

### Import
```typescript
import {
  StorageNeedCard,
  OfferCard,
  AIRankingBadge,
  CapacityGauge,
  SiteMap,
  OfferComparator,
  WMSIntegrationPanel,
  ContractTimeline,
  storageTheme,
  storageClasses,
} from '@rt/design-system';
```

### Exemple de page
```tsx
import { storageClasses } from '@rt/design-system';

function BourseListePage() {
  return (
    <div className={storageClasses.pageContainer}>
      <h1 className={storageClasses.sectionTitle}>
        Mes Besoins de Stockage
      </h1>

      <div className={storageClasses.cardGrid}>
        {needs.map(need => (
          <StorageNeedCard key={need.id} {...need} />
        ))}
      </div>
    </div>
  );
}
```

## Support et Contact

- Documentation complète : `/packages/design-system/docs`
- Issues : GitHub Issues
- Contact : design-system@rt-technologie.com
