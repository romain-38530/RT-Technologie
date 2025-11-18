# RT-Technologie Design System

> Système de design unifié pour toutes les applications de la plateforme RT-Technologie

## Table des matières

1. [Principes de design](#principes-de-design)
2. [Palette de couleurs](#palette-de-couleurs)
3. [Typographie](#typographie)
4. [Espacements](#espacements)
5. [Composants](#composants)
6. [Responsive Design](#responsive-design)
7. [Accessibilité](#accessibilité)
8. [Installation](#installation)

---

## Principes de design

Le design system RT-Technologie repose sur trois piliers :

### 1. Simplicité
- Interface épurée et intuitive
- Réduction du bruit visuel
- Focus sur les actions essentielles
- Navigation claire et prévisible

### 2. Clarté
- Hiérarchie visuelle évidente
- Messages clairs et concis
- États interactifs bien définis
- Feedback immédiat sur les actions

### 3. Efficacité
- Workflows optimisés
- Raccourcis pour les tâches fréquentes
- Import en masse pour gagner du temps
- Automatisation intelligente

---

## Palette de couleurs

Notre palette de couleurs est conçue pour être **cohérente, accessible et professionnelle**.

### Couleurs principales

#### Bleu RT (Primary)
```
#3b82f6 - Bleu principal
```
**Usage** : Boutons primaires, liens, éléments interactifs principaux

#### Variations
- `primary-50`: #eff6ff (Très clair)
- `primary-100`: #dbeafe
- `primary-500`: #3b82f6 (Principal)
- `primary-600`: #2563eb (Hover)
- `primary-900`: #1e3a8a (Très foncé)

### Couleurs sémantiques

#### Success (Succès)
```
#10b981
```
**Usage** : Confirmations, validations, états complétés

#### Warning (Avertissement)
```
#f59e0b
```
**Usage** : Alertes, statuts en attente, actions nécessitant attention

#### Error (Erreur)
```
#ef4444
```
**Usage** : Erreurs, validations échouées, actions destructives

#### Neutral (Neutre)
```
#6b7280
```
**Usage** : Textes secondaires, bordures, backgrounds

### Statuts de commandes

Notre système utilise des couleurs spécifiques pour chaque statut de commande :

| Statut | Couleur | Code |
|--------|---------|------|
| Brouillon | Gris | `#9ca3af` |
| En attente | Orange | `#f59e0b` |
| Confirmée | Bleu | `#3b82f6` |
| En cours | Violet | `#8b5cf6` |
| Livrée | Vert | `#10b981` |
| Annulée | Rouge | `#ef4444` |

### Exemples d'utilisation

```tsx
import { colors } from '@rt/design-system';

// Utiliser une couleur
const primaryColor = colors.primary[500]; // #3b82f6

// Utiliser une couleur sémantique
const successColor = colors.semantic.success; // #10b981
```

---

## Typographie

### Familles de polices

**Sans-serif** (par défaut)
```
-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
```

**Monospace** (code)
```
ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace
```

### Échelle typographique

Nous utilisons une échelle harmonieuse basée sur des multiples de 4px :

| Nom | Taille | Usage |
|-----|--------|-------|
| `xs` | 12px | Métadonnées, labels très petits |
| `sm` | 14px | Labels, textes secondaires |
| `base` | 16px | Corps de texte |
| `lg` | 18px | Corps de texte large |
| `xl` | 20px | Sous-titres |
| `2xl` | 24px | Titres H4 |
| `3xl` | 30px | Titres H3 |
| `4xl` | 36px | Titres H2 |
| `5xl` | 48px | Titres H1 |

### Poids de police

- **Light (300)** : Rarement utilisé
- **Normal (400)** : Corps de texte
- **Medium (500)** : Léger accent
- **Semibold (600)** : Titres secondaires
- **Bold (700)** : Titres principaux
- **Extrabold (800)** : Titres très importants

### Hiérarchie des titres

```tsx
import { typographyClasses } from '@rt/design-system';

<h1 className={typographyClasses.h1}>Titre principal</h1>
<h2 className={typographyClasses.h2}>Titre secondaire</h2>
<h3 className={typographyClasses.h3}>Titre tertiaire</h3>
<p className={typographyClasses.body}>Corps de texte</p>
```

---

## Espacements

Notre système d'espacement suit une **échelle de 4pt** pour garantir la cohérence.

### Échelle de base

| Token | Valeur | Pixels |
|-------|--------|--------|
| `0` | 0 | 0px |
| `1` | 0.25rem | 4px |
| `2` | 0.5rem | 8px |
| `3` | 0.75rem | 12px |
| `4` | 1rem | 16px |
| `6` | 1.5rem | 24px |
| `8` | 2rem | 32px |
| `12` | 3rem | 48px |
| `16` | 4rem | 64px |

### Espacements sémantiques

#### Padding de composants
- **xs** : 8px (petits boutons, badges)
- **sm** : 12px (boutons standards)
- **md** : 16px (cartes, modals)
- **lg** : 24px (grandes cartes)
- **xl** : 32px (sections)

#### Gap entre sections
- **xs** : 16px
- **sm** : 24px
- **md** : 32px (recommandé)
- **lg** : 48px
- **xl** : 64px

### Exemples

```tsx
import { spacingClasses } from '@rt/design-system';

<div className={spacingClasses.padding.md}>
  Contenu avec padding medium (16px)
</div>

<div className={spacingClasses.gap.md}>
  Éléments avec gap de 16px
</div>
```

---

## Composants

### Button (Bouton)

Composant de bouton avec plusieurs variantes et tailles.

#### Variantes
- `primary` : Action principale (bleu)
- `secondary` : Action secondaire (gris)
- `success` : Action de validation (vert)
- `warning` : Action d'avertissement (orange)
- `error` : Action destructive (rouge)
- `outline` : Bouton avec bordure
- `ghost` : Bouton transparent
- `link` : Style de lien

#### Tailles
- `sm` : Petit (32px)
- `md` : Moyen (40px) - par défaut
- `lg` : Grand (48px)
- `icon` : Carré (40x40px)

#### Exemples

```tsx
import { Button } from '@rt/design-system';
import { Plus } from 'lucide-react';

// Bouton simple
<Button variant="primary" size="md">
  Créer une commande
</Button>

// Bouton avec icône
<Button
  variant="primary"
  leftIcon={<Plus className="h-4 w-4" />}
>
  Nouvelle commande
</Button>

// Bouton en chargement
<Button variant="primary" loading>
  Chargement...
</Button>

// Bouton pleine largeur
<Button variant="primary" fullWidth>
  Soumettre
</Button>
```

### Card (Carte)

Conteneur pour regrouper du contenu.

#### Variantes
- `default` : Carte standard (blanc)
- `primary` : Carte bleue
- `success` : Carte verte
- `warning` : Carte orange
- `error` : Carte rouge

#### Exemples

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@rt/design-system';

<Card variant="default" padding="md">
  <CardHeader>
    <CardTitle>Titre de la carte</CardTitle>
    <CardDescription>Description de la carte</CardDescription>
  </CardHeader>
  <CardContent>
    Contenu principal de la carte
  </CardContent>
  <CardFooter>
    <Button variant="primary">Action</Button>
  </CardFooter>
</Card>

// Carte cliquable
<Card hoverable onClick={() => {}}>
  Carte interactive
</Card>
```

### Badge (Badge)

Petit élément pour afficher un statut ou une information.

#### Variantes
- Sémantiques : `primary`, `secondary`, `success`, `warning`, `error`, `info`
- Statuts : `draft`, `pending`, `confirmed`, `inProgress`, `delivered`, `cancelled`

#### Exemples

```tsx
import { Badge } from '@rt/design-system';

// Badge simple
<Badge variant="success">Complété</Badge>

// Badge avec point
<Badge variant="pending" dot>En attente</Badge>

// Badge de statut de commande
<Badge variant="delivered">Livrée</Badge>
```

### Input (Champ de saisie)

Champ de formulaire avec label, erreur et helper text.

#### Exemples

```tsx
import { Input } from '@rt/design-system';
import { Mail } from 'lucide-react';

// Input simple
<Input
  label="Email"
  placeholder="votre@email.com"
  required
/>

// Input avec icône
<Input
  label="Email"
  leftIcon={<Mail className="h-4 w-4" />}
  placeholder="votre@email.com"
/>

// Input avec erreur
<Input
  label="Email"
  error="Email invalide"
  variant="error"
/>

// Input avec texte d'aide
<Input
  label="Mot de passe"
  type="password"
  helperText="Minimum 8 caractères"
/>
```

### Modal (Fenêtre modale)

Fenêtre modale pour afficher du contenu par-dessus la page.

#### Tailles
- `sm` : Petite (384px)
- `md` : Moyenne (448px) - par défaut
- `lg` : Grande (512px)
- `xl` : Extra-large (576px)
- `full` : Pleine largeur

#### Exemples

```tsx
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter, Button } from '@rt/design-system';

const [isOpen, setIsOpen] = useState(false);

<Modal open={isOpen} onOpenChange={setIsOpen}>
  <ModalContent size="md">
    <ModalHeader>
      <ModalTitle>Titre de la modal</ModalTitle>
      <ModalDescription>
        Description optionnelle
      </ModalDescription>
    </ModalHeader>

    <div>
      Contenu de la modal
    </div>

    <ModalFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Annuler
      </Button>
      <Button variant="primary">
        Confirmer
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>
```

### Toast (Notification)

Notification temporaire en haut à droite de l'écran.

#### Exemples

```tsx
import { Toast, ToastTitle, ToastDescription, ToastIcon } from '@rt/design-system';

<Toast variant="success">
  <ToastIcon variant="success" />
  <div>
    <ToastTitle>Succès !</ToastTitle>
    <ToastDescription>
      La commande a été créée avec succès
    </ToastDescription>
  </div>
</Toast>
```

### EmptyState (État vide)

Affiche un message quand il n'y a pas de données.

```tsx
import { EmptyState } from '@rt/design-system';
import { Package } from 'lucide-react';

<EmptyState
  icon={<Package className="h-16 w-16" />}
  title="Aucune commande"
  description="Commencez par créer votre première commande de transport"
  action={{
    label: "Créer une commande",
    onClick: () => {}
  }}
/>
```

### LoadingSpinner (Spinner de chargement)

```tsx
import { LoadingSpinner } from '@rt/design-system';

// Spinner simple
<LoadingSpinner size="md" variant="primary" />

// Spinner plein écran
<LoadingSpinner fullScreen text="Chargement..." />
```

---

## Responsive Design

### Breakpoints

| Nom | Valeur | Usage |
|-----|--------|-------|
| `mobile` | 640px | Smartphones |
| `tablet` | 768px | Tablettes |
| `desktop` | 1024px | Ordinateurs |
| `wide` | 1280px | Grands écrans |
| `ultrawide` | 1536px | Très grands écrans |

### Approche Mobile-First

Nous utilisons une approche **mobile-first** : le design de base est pour mobile, puis on ajoute des règles pour les écrans plus grands.

```tsx
// Mobile d'abord, puis tablet, puis desktop
<div className="p-4 md:p-6 lg:p-8">
  Contenu avec padding adaptatif
</div>

// Grille responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id}>{item.name}</Card>)}
</div>
```

### Navigation responsive

- **Desktop** : Sidebar gauche avec icônes + labels
- **Mobile** : Bottom navigation avec icônes

---

## Accessibilité

Notre design system respecte les normes **WCAG 2.1 niveau AA**.

### Contraste

Tous nos textes respectent un ratio de contraste minimum :
- **Texte normal** : 4.5:1
- **Texte large** : 3:1
- **Éléments UI** : 3:1

### Navigation au clavier

Tous les composants interactifs sont accessibles au clavier :
- `Tab` / `Shift+Tab` : Navigation
- `Enter` / `Space` : Activation
- `Esc` : Fermeture des modals
- Flèches : Navigation dans les listes

### ARIA

Tous nos composants incluent les attributs ARIA appropriés :
```tsx
<button
  aria-label="Créer une nouvelle commande"
  aria-expanded={isOpen}
>
  +
</button>
```

### Focus visible

Les états de focus sont clairement visibles avec un anneau bleu :
```css
focus:ring-2 focus:ring-blue-600 focus:ring-offset-2
```

---

## Installation

### 1. Installer le package

```bash
pnpm add @rt/design-system
```

### 2. Configurer Tailwind CSS

Ajoutez le package dans votre config Tailwind :

```js
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@rt/design-system/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          // ... autres nuances
        }
      }
    }
  }
}
```

### 3. Importer les composants

```tsx
import { Button, Card, Badge, Input } from '@rt/design-system';

function MyComponent() {
  return (
    <Card>
      <Input label="Nom" />
      <Button variant="primary">Envoyer</Button>
    </Card>
  );
}
```

---

## Support

Pour toute question sur le design system :
- **Documentation** : `/docs/DESIGN_SYSTEM.md`
- **Exemples** : Storybook (à venir)
- **Support** : Ouvrir une issue sur GitHub

---

**Version** : 1.0.0
**Dernière mise à jour** : Novembre 2025
**Maintenu par** : Équipe RT-Technologie
