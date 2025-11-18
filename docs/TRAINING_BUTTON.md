# Training Button Component - Documentation

## Vue d'ensemble

Le composant `TrainingButton` est un bouton de formation unifié disponible dans toutes les applications RT-Technologie. Il offre un accès rapide et cohérent aux ressources de formation, guides utilisateurs, et tutoriels pour chaque module et outil de la plateforme.

## Objectifs

- **Accessibilité** : Rendre la formation facilement accessible depuis chaque module
- **Cohérence** : Design uniforme à travers toutes les applications
- **Flexibilité** : Deux variantes (flottant ou inline) pour s'adapter à différents contextes
- **UX optimale** : Position fixe non-intrusive avec animations subtiles

## Localisation

**Composant** : `packages/design-system/src/components/TrainingButton.tsx`

## Props

```typescript
interface TrainingButtonProps {
  /**
   * Nom de l'outil/module pour lequel la formation est disponible
   * @example "Palettes", "Bourse de Stockage", "Application Conducteur"
   */
  toolName: string;

  /**
   * URL vers la documentation ou vidéo de formation
   * @default undefined (affiche une alerte placeholder)
   */
  trainingUrl?: string;

  /**
   * Taille du bouton
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Variante de position
   * @default 'floating'
   */
  variant?: 'floating' | 'inline';

  /**
   * Classe CSS personnalisée
   */
  className?: string;

  /**
   * Handler onClick personnalisé (remplace le comportement par défaut)
   */
  onClick?: () => void;
}
```

## Variantes

### 1. Floating (Flottant)

Position fixe en bas à droite de l'écran, toujours visible lors du scroll.

**Caractéristiques** :
- Position : `fixed bottom-6 right-6`
- Z-index : `50` (au-dessus du contenu)
- Dégradé violet : `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- Ombre portée : `0 4px 12px rgba(102, 126, 234, 0.4)`
- Animation hover : translation verticale de -2px

**Utilisation recommandée** : Pages principales (dashboards, pages d'accueil modules)

```tsx
<TrainingButton toolName="Palettes" />
<TrainingButton toolName="Bourse de Stockage" trainingUrl="/docs/storage-guide.pdf" />
```

### 2. Inline

Bouton intégré dans le flux du contenu.

**Caractéristiques** :
- Display : `inline-flex`
- Bordure arrondie : `8px`
- Pas de position fixe
- Même dégradé violet que la variante floating

**Utilisation recommandée** : Sections spécifiques, formulaires, zones d'aide contextuelles

```tsx
<TrainingButton toolName="Palettes" variant="inline" size="small" />
```

## Tailles

### Small
- Padding : `px-3 py-2`
- Texte : `text-sm`
- Icône : `16px`

### Medium (default)
- Padding : `px-4 py-3`
- Texte : `text-base`
- Icône : `20px`

### Large
- Padding : `px-6 py-4`
- Texte : `text-lg`
- Icône : `24px`

## Intégrations

Le `TrainingButton` a été intégré dans les applications suivantes :

### 1. web-industry
- [dashboard/page.tsx](../apps/web-industry/src/app/dashboard/page.tsx:31) - Dashboard principal
- [palettes/page.tsx](../apps/web-industry/src/app/palettes/page.tsx:63) - Module Palettes
- [storage/page.tsx](../apps/web-industry/src/app/storage/page.tsx:13) - Module Bourse de Stockage

### 2. web-transporter
- [page.tsx](../apps/web-transporter/src/app/page.tsx:62) - Dashboard principal
- [palettes/page.tsx](../apps/web-transporter/src/app/palettes/page.tsx:90) - Module Palettes

### 3. web-logistician
- [pages/index.tsx](../apps/web-logistician/pages/index.tsx:58) - Dashboard principal
- [pages/palettes.tsx](../apps/web-logistician/pages/palettes.tsx:104) - Module Palettes

### 4. mobile-driver (PWA)
- [(mission)/dashboard/page.tsx](../apps/mobile-driver/pwa/src/app/(mission)/dashboard/page.tsx:70) - Dashboard missions

### 5. backoffice-admin
- [pages/index.tsx](../apps/backoffice-admin/pages/index.tsx:6) - Page d'accueil

## Comportement

### Par défaut (sans trainingUrl)
Affiche une alerte avec le message :
```
Formation pour {toolName} : Documentation à venir
```

### Avec trainingUrl
Ouvre l'URL dans un nouvel onglet :
```typescript
window.open(trainingUrl, '_blank', 'noopener,noreferrer');
```

### Avec onClick personnalisé
Exécute la fonction fournie (permet d'ouvrir un modal, naviguer vers une page interne, etc.)

## Design System

### Couleurs
- **Gradient principal** :
  - Début : `#667eea` (bleu-violet)
  - Fin : `#764ba2` (violet foncé)
- **Texte** : Blanc (`#ffffff`)
- **Ombre** : Violet semi-transparent `rgba(102, 126, 234, 0.4)`

### Icône
- Emoji : 🎓 (mortarboard - chapeau de diplômé)
- Position : Avant le texte
- Gap : `8px`

### Animations
- **Hover (floating)** :
  - Transform : `translateY(-2px)`
  - Box-shadow : `0 6px 16px rgba(102, 126, 234, 0.5)` (plus prononcée)
- **Hover (inline)** :
  - Opacity : `0.9`
- **Transition** : `all 0.3s ease` (floating) ou `all 0.2s ease` (inline)

## Accessibilité

- **Attribut title** : Affiche "Formation : {toolName}" au survol
- **Contraste** : Ratio blanc sur violet > 4.5:1 (WCAG AA)
- **Touch target** :
  - Small : 40px (limite inférieure acceptable)
  - Medium : 52px
  - Large : 68px
- **Keyboard navigation** : Focusable par tabulation (élément `<button>`)

## Exemples d'utilisation

### Exemple 1 : Bouton flottant avec URL de formation

```tsx
import { TrainingButton } from '@rt/design-system';

export default function PalettesPage() {
  return (
    <div>
      <TrainingButton
        toolName="Palettes"
        trainingUrl="https://docs.rt-technologie.com/palettes/guide"
      />
      {/* Contenu de la page */}
    </div>
  );
}
```

### Exemple 2 : Bouton inline petit dans un formulaire

```tsx
import { TrainingButton } from '@rt/design-system';

export default function FormSection() {
  return (
    <div className="form-section">
      <h3>Créer un besoin de stockage</h3>
      <TrainingButton
        toolName="Bourse de Stockage"
        variant="inline"
        size="small"
      />
      <form>{/* ... */}</form>
    </div>
  );
}
```

### Exemple 3 : Bouton avec action personnalisée (modal)

```tsx
import { TrainingButton } from '@rt/design-system';
import { useState } from 'react';

export default function CustomExample() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <TrainingButton
        toolName="E-CMR"
        onClick={() => setShowModal(true)}
      />
      {showModal && <TrainingModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
```

## Roadmap

### Court terme
- [ ] Créer des URLs de formation réelles pour chaque module
- [ ] Intégrer un système de tracking des clics (analytics)
- [ ] Ajouter des tooltips avec un aperçu du contenu de formation

### Moyen terme
- [ ] Modale de formation intégrée avec vidéos et guides interactifs
- [ ] Système de progression (badges, checkpoints)
- [ ] Support multilingue (FR, EN, ES, DE)

### Long terme
- [ ] IA conversationnelle pour répondre aux questions
- [ ] Parcours de formation personnalisés par rôle
- [ ] Certification utilisateur avec tests

## Support

Pour toute question concernant le composant `TrainingButton` :
- Code source : `packages/design-system/src/components/TrainingButton.tsx`
- Export : `packages/design-system/src/index.ts`
- Documentation : `docs/TRAINING_BUTTON.md`

---

**Version** : 1.0.0
**Date** : Janvier 2025
**Auteur** : RT-Technologie Design System Team
