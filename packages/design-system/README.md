# RT Design System v2.0

> Système de design unifié pour toutes les applications RT-Technologie

## Installation

```bash
npm install @rt/design-system
```

## Vue d'ensemble

Le Design System RT v2.0 comprend **24 composants** répartis en 3 catégories :

- **Composants de base** (9) : Button, Card, Badge, Input, Modal, Tooltip, Toast, EmptyState, LoadingSpinner
- **Composants mobile** (8) : MissionCard, SignaturePad, QRCodeDisplay, DocumentScanner, StatusTimeline, GPSTracker, OfflineIndicator, QuickReplyButtons
- **Composants bourse** (8) : StorageNeedCard, OfferCard, AIRankingBadge, CapacityGauge, SiteMap, OfferComparator, WMSIntegrationPanel, ContractTimeline

## Utilisation Rapide

### Composants Mobile

```tsx
import {
  MissionCard,
  SignaturePad,
  QRCodeDisplay,
  QuickReplyButtons,
  commonQuickReplies,
  mobileTheme,
  mobileClasses,
} from '@rt/design-system';

function DriverApp() {
  return (
    <div className={mobileClasses.screenPadding}>
      <MissionCard
        status="inProgress"
        destination="Entrepôt Paris Nord"
        eta="14:30"
        distance="12 km"
        actionLabel="Arrivé sur site"
        onAction={handleArrival}
      />

      <QuickReplyButtons
        replies={commonQuickReplies}
        layout="grid"
        onSelect={(reply) => sendMessage(reply.message)}
      />
    </div>
  );
}
```

### Composants Bourse

```tsx
import {
  StorageNeedCard,
  OfferCard,
  OfferComparator,
  AIRankingBadge,
  storageTheme,
  storageClasses,
} from '@rt/design-system';

function MarketplacePage() {
  return (
    <div className={storageClasses.pageContainer}>
      <h1 className={storageClasses.sectionTitle}>
        Offres reçues
      </h1>

      <OfferComparator
        offers={topOffers}
        maxOffers={4}
        onSelect={selectOffer}
      />

      <div className={storageClasses.cardGrid}>
        {allOffers.map(offer => (
          <OfferCard
            key={offer.id}
            highlighted={offer.aiRank <= 3}
            providerName={offer.provider}
            price={offer.price}
            aiScore={offer.aiScore}
            aiRank={offer.aiRank}
            services={offer.services}
            onAccept={() => handleAccept(offer.id)}
          />
        ))}
      </div>
    </div>
  );
}
```

## Documentation

### Guides Complets

- **Application Mobile** : [DESIGN_MOBILE_DRIVER.md](./DESIGN_MOBILE_DRIVER.md)
  - Principes de design mobile
  - 8 composants détaillés
  - Écrans PWA
  - Bonnes pratiques

- **Bourse de Stockage** : [DESIGN_STORAGE_MARKET.md](./DESIGN_STORAGE_MARKET.md)
  - Principes de design desktop
  - 8 composants détaillés
  - Écrans web
  - Flows utilisateur

- **Catalogue Complet** : [COMPONENT_LIBRARY_V2.md](./COMPONENT_LIBRARY_V2.md)
  - 24 composants avec props
  - Exemples de code
  - Do's and Don'ts
  - Checklist de cohérence

- **Rapport Final** : [DESIGN_SYSTEM_V2_REPORT.md](./DESIGN_SYSTEM_V2_REPORT.md)
  - Résumé exécutif
  - Métriques du projet
  - Recommandations futures
  - Changelog

## Palette de Couleurs

```typescript
import { colors } from '@rt/design-system';

// Couleurs principales
colors.primary[500]  // #3b82f6 - Bleu RT
colors.success[500]  // #10b981 - Vert
colors.warning[500]  // #f59e0b - Orange
colors.error[500]    // #ef4444 - Rouge
colors.neutral[500]  // #6b7280 - Gris

// Code couleur mobile
colors.semantic.info      // Bleu - En route
colors.semantic.pending   // Orange - Attente
colors.semantic.completed // Vert - Terminé
```

## Thèmes

### Mobile Theme

```typescript
import { mobileTheme, mobileClasses } from '@rt/design-system';

// Touch targets (WCAG 2.1)
mobileTheme.touchTargets.minimum     // '44px'
mobileTheme.touchTargets.recommended // '48px'
mobileTheme.touchTargets.comfortable // '56px'

// Classes utilitaires
mobileClasses.buttonPrimary  // Bouton bleu 48px
mobileClasses.touchTarget    // Min 48x48px
mobileClasses.screenPadding  // px-4
```

### Storage Theme

```typescript
import { storageTheme, storageClasses } from '@rt/design-system';

// Couleurs spécifiques
storageTheme.colors.need.open      // #3b82f6 - Ouvert
storageTheme.colors.aiRanking.top1 // gradient or

// Classes utilitaires
storageClasses.pageContainer // Container principal
storageClasses.cardGrid      // Grille responsive
storageClasses.filterSidebar // Sidebar filtres
```

## Composants par Catégorie

### Mobile

| Composant | Description | Touch Size |
|-----------|-------------|------------|
| MissionCard | Carte mission avec statut | - |
| SignaturePad | Zone signature tactile | 48px buttons |
| QRCodeDisplay | Affichage QR code | - |
| DocumentScanner | Scan/upload documents | 56px buttons |
| StatusTimeline | Timeline étapes | - |
| GPSTracker | Carte GPS + navigation | - |
| OfflineIndicator | Indicateur connexion | - |
| QuickReplyButtons | Réponses rapides | 56px |

### Bourse

| Composant | Description | Usage |
|-----------|-------------|-------|
| StorageNeedCard | Carte besoin stockage | Liste besoins |
| OfferCard | Carte offre logisticien | Liste offres |
| AIRankingBadge | Badge Top IA | Offres classées |
| CapacityGauge | Jauge capacité | Sites logistiques |
| SiteMap | Carte sites | Géolocalisation |
| OfferComparator | Tableau comparatif | Comparaison Top 4 |
| WMSIntegrationPanel | Panel WMS | Intégration système |
| ContractTimeline | Timeline contrat | Suivi contrat |

## Accessibilité

Tous les composants respectent **WCAG 2.1 AA** :

- Contraste minimum 4.5:1
- Touch targets 44px minimum (mobile)
- Navigation clavier complète
- ARIA labels appropriés
- Focus visible

## Principes de Design

### Mobile
- **Ultra simplicité** : 1 écran = 1 action
- **Gros boutons** : 48-56px (utilisable avec gants)
- **Code couleur** : Bleu/Orange/Vert/Rouge
- **Navigation minimale** : Max 3 clics

### Desktop
- **Lisibilité** : Tableaux structurés, cartes visuelles
- **Filtres visibles** : Sidebar toujours accessible
- **Comparaison** : Top 3 IA mis en avant
- **Actions rapides** : Accepter/Négocier/Refuser

## Intégrations Tierces Recommandées

### Mobile
- **qrcode.react** : Génération QR codes (QRCodeDisplay)
- **Google Maps API** ou **Mapbox** : Cartes GPS (GPSTracker)
- **Service Worker** : Offline-first PWA

### Bourse
- **Google Maps API** ou **Mapbox** : Carte sites (SiteMap)
- **react-window** : Virtualisation listes
- **recharts** : Graphiques analytics

## Développement

### Structure

```
packages/design-system/
├── src/
│   ├── components/        # Composants de base + bourse
│   ├── mobile/            # Composants mobile
│   ├── icons/             # Icônes custom
│   ├── illustrations/     # Illustrations
│   ├── lib/               # Utilitaires
│   ├── colors.ts          # Palette couleurs
│   ├── typography.ts      # Typographie
│   ├── spacing.ts         # Espacements
│   ├── theme-mobile.ts    # Thème mobile
│   ├── theme-storage.ts   # Thème bourse
│   └── index.ts           # Exports
├── DESIGN_MOBILE_DRIVER.md
├── DESIGN_STORAGE_MARKET.md
├── COMPONENT_LIBRARY_V2.md
├── DESIGN_SYSTEM_V2_REPORT.md
└── README.md (ce fichier)
```

### Scripts

```bash
# Lint TypeScript
npm run lint

# Build (si configuré)
npm run build
```

## Exemples Complets

### Page Mobile

```tsx
import {
  MissionCard,
  StatusTimeline,
  QuickReplyButtons,
  GPSTracker,
  commonQuickReplies,
  mobileClasses,
} from '@rt/design-system';

function MissionPage({ mission }) {
  return (
    <div className={mobileClasses.screenPadding}>
      {/* Carte mission */}
      <MissionCard
        status={mission.status}
        missionNumber={mission.number}
        destination={mission.destination}
        eta={mission.eta}
        distance={mission.distance}
        urgent={mission.isUrgent}
        actionLabel="Arrivé sur site"
        onAction={handleArrival}
      />

      {/* GPS */}
      <div className="mt-6">
        <GPSTracker
          currentPosition={currentPos}
          destinationPosition={mission.destination}
          eta={mission.eta}
          distance={mission.distance}
          onRefreshPosition={refreshGPS}
        />
      </div>

      {/* Timeline */}
      <div className="mt-6">
        <StatusTimeline
          steps={mission.timeline}
          orientation="vertical"
        />
      </div>

      {/* Réponses rapides */}
      <div className="mt-6">
        <QuickReplyButtons
          replies={commonQuickReplies}
          layout="grid"
          onSelect={sendReply}
        />
      </div>
    </div>
  );
}
```

### Page Bourse

```tsx
import {
  StorageNeedCard,
  OfferCard,
  OfferComparator,
  AIRankingBadge,
  storageClasses,
} from '@rt/design-system';

function StorageNeedDetailsPage({ need, offers }) {
  const topOffers = offers.filter(o => o.aiRank <= 4);

  return (
    <div className={storageClasses.pageContainer}>
      {/* En-tête */}
      <h1 className={storageClasses.sectionTitle}>
        {need.title}
      </h1>

      {/* Comparateur Top 4 */}
      <OfferComparator
        offers={topOffers}
        maxOffers={4}
        onSelect={selectOffer}
        selectedOfferId={selectedOffer}
      />

      {/* Liste toutes les offres */}
      <div className={storageClasses.cardGrid}>
        {offers.map(offer => (
          <OfferCard
            key={offer.id}
            highlighted={offer.aiRank <= 3}
            providerName={offer.provider.name}
            providerLogo={offer.provider.logo}
            price={offer.price}
            aiScore={offer.aiScore}
            aiRank={offer.aiRank}
            distance={offer.distance}
            services={offer.services}
            onAccept={() => handleAccept(offer.id)}
            onNegotiate={() => handleNegotiate(offer.id)}
            onReject={() => handleReject(offer.id)}
          />
        ))}
      </div>
    </div>
  );
}
```

## Support

- **Documentation** : Voir fichiers .md dans ce dossier
- **Issues** : GitHub Issues
- **Contact** : design-system@rt-technologie.com

## Changelog

### v2.0.0 (2024-11-18)
- ➕ Ajout 8 composants mobile
- ➕ Ajout 8 composants bourse
- ➕ Thème mobile (touch targets WCAG 2.1)
- ➕ Thème bourse (layouts desktop)
- ➕ Documentation complète (55 pages)
- ✏️ Mise à jour index principal

### v1.0.0
- Composants de base (9)
- Palette couleurs RT
- Typographie et espacements
- Accessibilité WCAG AA

## License

Propriétaire - RT-Technologie

---

**Version actuelle** : 2.0.0
**Date** : 2024-11-18
**Auteur** : RT-Technologie Design Team
