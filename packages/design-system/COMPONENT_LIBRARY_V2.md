# RT Design System - Catalogue des Composants v2.0

> Bibliothèque complète de tous les composants UI RT-Technologie

## Vue d'ensemble

Le Design System RT v2.0 comprend maintenant **24 composants** répartis en 3 catégories :
- **Composants de base** (9) : Utilisables partout
- **Composants mobile** (8) : Spécifiques à l'app conducteur
- **Composants bourse** (8) : Spécifiques au module stockage

---

## Composants de Base

### 1. Button
**Fichier** : `src/components/Button.tsx`

Bouton avec variantes et états.

#### Variantes
- `primary` : Bleu, action principale
- `secondary` : Gris, action secondaire
- `success` : Vert, confirmation
- `warning` : Orange, attention
- `error` : Rouge, danger
- `outline` : Bordure, fond transparent
- `ghost` : Texte seul
- `link` : Style lien

#### Tailles
- `sm` : 32px (h-8)
- `md` : 40px (h-10) - défaut
- `lg` : 48px (h-12)

#### Props spéciales
- `loading` : Affiche spinner
- `leftIcon` / `rightIcon` : Icônes
- `fullWidth` : Largeur 100%

```tsx
<Button variant="primary" size="lg" loading={isSubmitting}>
  Enregistrer
</Button>
```

### 2. Card
**Fichier** : `src/components/Card.tsx`

Conteneur avec bordure et ombre.

#### Variantes
- `default` : Blanc standard
- `primary` : Fond bleu léger
- `success` : Fond vert léger
- `warning` : Fond orange léger
- `error` : Fond rouge léger

#### Sous-composants
- `CardHeader` : En-tête
- `CardTitle` : Titre
- `CardDescription` : Sous-titre
- `CardContent` : Contenu
- `CardFooter` : Pied de page

```tsx
<Card variant="primary" hoverable>
  <CardHeader>
    <CardTitle>Titre</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Contenu</CardContent>
  <CardFooter>Actions</CardFooter>
</Card>
```

### 3. Badge
**Fichier** : `src/components/Badge.tsx`

Petit label coloré pour statuts.

#### Variantes
- `primary`, `secondary`, `success`, `warning`, `error`, `info`, `outline`
- Statuts de commande : `draft`, `pending`, `confirmed`, `inProgress`, `delivered`, `cancelled`

#### Props
- `dot` : Affiche un point coloré
- `icon` : Icône personnalisée

```tsx
<Badge variant="success" dot>
  Livré
</Badge>
```

### 4-9. Autres composants de base
- **Input** : Champ de saisie
- **Modal** : Dialogue modale
- **Tooltip** : Info-bulle
- **Toast** : Notification temporaire
- **EmptyState** : État vide
- **LoadingSpinner** : Indicateur de chargement

---

## Composants Mobile

### 1. MissionCard
**Fichier** : `src/mobile/MissionCard.tsx`

Carte de mission avec statut coloré.

#### Statuts
| Statut | Couleur | Usage |
|--------|---------|-------|
| `pending` | Orange | Mission assignée, en attente |
| `inProgress` | Bleu | Mission en cours |
| `completed` | Vert | Mission terminée |
| `cancelled` | Gris | Mission annulée |
| `delayed` | Rouge | Mission en retard |

#### Features
- Badge urgent (rouge pulsant)
- ETA et distance
- Bouton d'action adapté au statut
- Responsive mobile-first

```tsx
<MissionCard
  status="inProgress"
  missionNumber="M-2024-001"
  destination="Entrepôt Paris Nord"
  eta="14:30"
  distance="12 km"
  urgent={false}
  actionLabel="Arrivé sur site"
  onAction={handleArrival}
/>
```

### 2. SignaturePad
**Fichier** : `src/mobile/SignaturePad.tsx`

Zone de signature tactile avec Canvas HTML5.

#### Features
- Support tactile et souris
- Boutons Effacer / Valider (48px)
- Export en base64 (PNG)
- Responsive (aspect ratio préservé)
- Placeholder personnalisable

```tsx
<SignaturePad
  width={600}
  height={300}
  onSave={(signature) => saveSignature(signature)}
  placeholder="Signature du destinataire"
/>
```

### 3. QRCodeDisplay
**Fichier** : `src/mobile/QRCodeDisplay.tsx`

Affichage QR code scannable.

#### Features
- Génération QR code (placeholder - intégrer lib)
- Affichage valeur en texte
- Bouton partage
- Taille ajustable

**Note** : Intégrer `qrcode.react` ou `qrcode-generator` pour vraie génération.

```tsx
<QRCodeDisplay
  value="MISSION-2024-001"
  size={256}
  title="Code de livraison"
  displayValue={true}
  onShare={handleShare}
/>
```

### 4. DocumentScanner
**Fichier** : `src/mobile/DocumentScanner.tsx`

Scan et capture de documents.

#### Features
- Accès caméra (permission)
- Upload fichiers
- Aperçu documents
- Suppression individuelle
- Limite de documents
- Overlay de guidage

```tsx
<DocumentScanner
  maxDocuments={10}
  acceptedTypes={['image/*', 'application/pdf']}
  onScan={(doc) => handleScan(doc)}
  documents={scannedDocs}
  onRemove={(id) => removeDoc(id)}
/>
```

### 5. StatusTimeline
**Fichier** : `src/mobile/StatusTimeline.tsx`

Timeline des étapes de mission.

#### Orientations
- `vertical` : Par défaut, mobile
- `horizontal` : Alternative, desktop

#### Statuts d'étapes
- `completed` : Vert, cochée
- `current` : Bleu, pulsant
- `pending` : Gris, inactive

```tsx
<StatusTimeline
  orientation="vertical"
  steps={[
    { id: '1', label: 'Assignée', status: 'completed', timestamp: new Date() },
    { id: '2', label: 'En route', status: 'current' },
    { id: '3', label: 'Livrée', status: 'pending' },
  ]}
/>
```

### 6. GPSTracker
**Fichier** : `src/mobile/GPSTracker.tsx`

Affichage GPS et navigation.

#### Features
- Carte (placeholder - intégrer Maps API)
- Position actuelle (bleu pulsant)
- Destination (rouge)
- ETA et distance
- Alerte déviation (rouge animé)
- Bouton refresh

**Note** : Intégrer Google Maps API ou Mapbox GL JS.

```tsx
<GPSTracker
  currentPosition={{ latitude: 48.8566, longitude: 2.3522 }}
  destinationPosition={{ latitude: 48.8738, longitude: 2.2950 }}
  eta="15 min"
  distance="8 km"
  isDeviated={false}
  onRefreshPosition={refreshGPS}
/>
```

### 7. OfflineIndicator
**Fichier** : `src/mobile/OfflineIndicator.tsx`

Indicateur de statut connexion.

#### Modes
- **Hors-ligne** : Banner orange
- **Sync en attente** : Banner bleu
- **En ligne** : Masqué

#### Features
- Compteur données en attente
- Bouton synchroniser
- Détails dépliables
- Position top/bottom

```tsx
<OfflineIndicator
  isOnline={false}
  pendingCount={3}
  position="top"
  showDetails={true}
  onRetry={syncData}
/>
```

### 8. QuickReplyButtons
**Fichier** : `src/mobile/QuickReplyButtons.tsx`

Réponses rapides pré-formatées.

#### Layouts
- `grid` : Grille 2 colonnes (défaut)
- `horizontal` : Scroll horizontal
- `vertical` : Liste verticale

#### Réponses pré-configurées
Disponibles via `commonQuickReplies` :
- Arrivé sur site
- Retard 15min / 30min
- Problème
- Chargement / Déchargement
- Mission terminée
- Besoin d'aide

```tsx
import { QuickReplyButtons, commonQuickReplies } from '@rt/design-system';

<QuickReplyButtons
  replies={commonQuickReplies}
  layout="grid"
  onSelect={(reply) => sendMessage(reply.message)}
/>
```

---

## Composants Bourse de Stockage

### 1. StorageNeedCard
**Fichier** : `src/components/StorageNeedCard.tsx`

Carte besoin de stockage.

#### Statuts
- `open` : Bleu - Besoin ouvert
- `closed` : Gris - Besoin fermé
- `assigned` : Vert - Besoin attribué
- `expired` : Rouge - Besoin expiré

#### Features
- Volume, localisation, durée
- Badges température et ADR
- Compteur d'offres
- Actions : Voir détails / offres

```tsx
<StorageNeedCard
  status="open"
  title="Stockage produits frais Q1 2024"
  type="Rack à palettes"
  volume={500}
  location="Rungis (94)"
  duration="3 mois"
  temperature="Frigo (+2/+8°C)"
  adr={false}
  offersCount={12}
  onViewOffers={handleViewOffers}
/>
```

### 2. OfferCard
**Fichier** : `src/components/OfferCard.tsx`

Carte offre de logisticien.

#### Features
- Logo/nom logisticien
- Prix mis en avant (gradient bleu)
- Score IA (étoiles sur 5)
- Badge ranking IA (Top 1/2/3)
- Distance
- Services inclus (liste à coches)
- Actions : Accepter / Négocier / Refuser

#### États
- `highlighted` : Bordure or (Top IA)
- `selected` : Ring bleu

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
  onAccept={handleAccept}
  onNegotiate={handleNegotiate}
/>
```

### 3. AIRankingBadge
**Fichier** : `src/components/AIRankingBadge.tsx`

Badge recommandation IA.

#### Ranks
- **Top 1** : Gradient or (#fbbf24)
- **Top 2** : Gradient argent (#d1d5db)
- **Top 3** : Gradient bronze (#fdba74)

#### Features
- Icône étoile
- Score en %
- Tooltip explicatif (au survol)
- Raison du classement

```tsx
<AIRankingBadge
  rank={1}
  score={95}
  showTooltip={true}
  reason="Meilleur rapport qualité/prix et distance optimale"
/>
```

### 4. CapacityGauge
**Fichier** : `src/components/CapacityGauge.tsx`

Jauge de capacité entrepôt.

#### Code couleur
| Taux | Couleur | État |
|------|---------|------|
| < 80% | Vert | Disponible |
| 80-94% | Orange | Attention |
| ≥ 95% | Rouge | Critique |

#### Features
- Barre de progression
- Pourcentage
- Indicateur disponible
- Seuils configurables
- Alerte visuelle

```tsx
<CapacityGauge
  current={850}
  total={1000}
  unit="palettes"
  label="Capacité Entrepôt A"
  warningThreshold={80}
  criticalThreshold={95}
/>
```

### 5. SiteMap
**Fichier** : `src/components/SiteMap.tsx`

Carte interactive des sites.

#### Types de marqueurs
- `warehouse` : Entrepôts (bleu)
- `need` : Besoins (orange)
- `current` : Position actuelle (vert)
- `destination` : Destination (rouge)

#### Features
- Marqueurs cliquables
- Rayon de recherche
- Contrôles zoom
- Légende

**Note** : Intégrer Google Maps API ou Mapbox GL JS.

```tsx
<SiteMap
  markers={sites.map(s => ({
    id: s.id,
    latitude: s.lat,
    longitude: s.lng,
    type: 'warehouse',
    label: s.name,
  }))}
  searchRadius={50}
  onMarkerClick={(marker) => viewSite(marker.id)}
/>
```

### 6. OfferComparator
**Fichier** : `src/components/OfferComparator.tsx`

Tableau comparatif d'offres.

#### Features
- Comparaison côte à côte (max 4)
- Highlighting meilleures/pires valeurs
- Top 3 IA en surbrillance
- Sélection d'offre
- Critères : Prix, Distance, Score, Services

```tsx
<OfferComparator
  offers={receivedOffers}
  maxOffers={4}
  onSelect={(id) => setSelected(id)}
  selectedOfferId={selectedOffer}
/>
```

### 7. WMSIntegrationPanel
**Fichier** : `src/components/WMSIntegrationPanel.tsx`

Panel intégration WMS.

#### États
- **Connecté** : Bordure verte, indicateur pulsant
- **Déconnecté** : Bordure grise
- **Synchronisation** : Icône rotation

#### Features
- Statut connexion
- Dernière sync
- Stock actuel
- Mouvements récents (in/out)
- Alertes
- Boutons : Connecter / Synchroniser / Déconnecter

```tsx
<WMSIntegrationPanel
  isConnected={true}
  systemName="SAP WMS"
  lastSync={new Date()}
  currentStock={850}
  recentMovements={movements}
  alerts={['Stock faible sur produit A']}
  onSync={handleSync}
/>
```

### 8. ContractTimeline
**Fichier** : `src/components/ContractTimeline.tsx`

Timeline contrat de stockage.

#### Features
- Dates début/fin
- Barre de progression globale
- Phases avec icônes
- Phase actuelle animée (pulse)
- Horodatage

```tsx
<ContractTimeline
  startDate={new Date('2024-01-01')}
  endDate={new Date('2024-12-31')}
  phases={[
    { id: '1', label: 'Sélection', status: 'completed', date: new Date() },
    { id: '2', label: 'Contrat', status: 'current' },
    { id: '3', label: 'En cours', status: 'pending' },
  ]}
  progress={40}
/>
```

---

## Thèmes

### Mobile Theme (`theme-mobile.ts`)
```typescript
import { mobileTheme, mobileClasses } from '@rt/design-system';

// Touch targets
mobileTheme.touchTargets.recommended // '48px'

// Classes utilitaires
mobileClasses.buttonPrimary
mobileClasses.touchTarget
```

### Storage Theme (`theme-storage.ts`)
```typescript
import { storageTheme, storageClasses } from '@rt/design-system';

// Couleurs
storageTheme.colors.need.open // '#3b82f6'
storageTheme.colors.aiRanking.top1 // gradient or

// Classes utilitaires
storageClasses.pageContainer
storageClasses.cardGrid
```

---

## Checklist de Cohérence

### Couleurs
- ✅ Palette principale respectée (bleu #3b82f6, vert #10b981, orange #f59e0b, rouge #ef4444)
- ✅ Code couleur intuitif mobile (bleu=mouvement, orange=attente, vert=terminé, rouge=erreur)
- ✅ Gradients IA cohérents (or/argent/bronze)

### Typographie
- ✅ Font: Sans-serif système (Apple/Segoe/Roboto)
- ✅ Échelle: 12/14/16/18/20/24/32/48px
- ✅ Poids: 400/500/600/700
- ✅ Mobile: Tailles augmentées (h1: 32px vs 48px desktop)

### Espacements
- ✅ Grille 4pt (4/8/12/16/24/32/48/64px)
- ✅ Touch targets mobiles: minimum 48px
- ✅ Padding cartes: 16/24/32px selon contexte

### Accessibilité
- ✅ Contraste WCAG AA (4.5:1 minimum)
- ✅ Navigation clavier
- ✅ ARIA labels
- ✅ Focus visible
- ✅ Cibles tactiles 44px minimum (WCAG 2.1)

---

## Exemples d'Intégration

### Page Mobile
```tsx
import {
  MissionCard,
  StatusTimeline,
  QuickReplyButtons,
  mobileClasses,
} from '@rt/design-system';

function MissionPage() {
  return (
    <div className={mobileClasses.screenPadding}>
      <MissionCard
        status="inProgress"
        destination="Paris Nord"
        eta="15 min"
        actionLabel="Arrivé"
        onAction={handleArrival}
      />

      <div className="mt-6">
        <StatusTimeline steps={timelineSteps} />
      </div>

      <div className="mt-6">
        <QuickReplyButtons
          replies={commonQuickReplies}
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
  storageClasses,
} from '@rt/design-system';

function BourseOffersPage() {
  return (
    <div className={storageClasses.pageContainer}>
      <h1 className={storageClasses.sectionTitle}>
        Offres reçues
      </h1>

      <OfferComparator
        offers={topOffers}
        onSelect={selectOffer}
      />

      <div className={storageClasses.cardGrid}>
        {allOffers.map(offer => (
          <OfferCard key={offer.id} {...offer} />
        ))}
      </div>
    </div>
  );
}
```

---

## Support

- **Documentation** : `packages/design-system/`
- **Storybook** : À venir
- **Issues** : GitHub Issues
- **Contact** : design-system@rt-technologie.com

---

**Version** : 2.0.0
**Date** : 2024
**Auteur** : RT-Technologie Design Team
