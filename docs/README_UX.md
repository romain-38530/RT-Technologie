# Design System & Formation RT-Technologie

Système de design unifié et plateforme de formation intégrée pour l'ensemble de l'écosystème RT-Technologie.

## Vue d'ensemble

Ce projet contient :

- **Design System** (@rt/design-system) : Composants UI réutilisables, tokens de design, illustrations
- **Onboarding System** (@rt/onboarding) : Tours guidés interactifs, centre d'aide
- **Training Service** : API REST complète pour la gestion de la formation (port 3012)
- **6 modules de formation** : Contenu complet pour toutes les applications

## Démarrage rapide

```bash
# 1. Démarrer MongoDB
docker run -d -p 27017:27017 --name rt-mongo mongo:latest

# 2. Démarrer le service Training
cd services/training
pnpm install
pnpm dev

# 3. Démarrer une application
cd apps/web-industry
pnpm dev
```

Voir [QUICK_START_UX.md](./QUICK_START_UX.md) pour plus de détails.

## Documentation

- [Guide du Design System](./docs/DESIGN_SYSTEM.md) - Palette, composants, accessibilité
- [Guide du Training System](./docs/TRAINING_SYSTEM.md) - Architecture, API, création de modules
- [Rapport complet](./RAPPORT_UX_FORMATION.md) - Livrables, métriques, recommandations
- [Quick Start](./QUICK_START_UX.md) - Démarrage en 5 minutes
- [Fichiers créés](./FICHIERS_CREES.md) - Liste complète des fichiers

## Structure du projet

```
RT-Technologie/
├── packages/
│   ├── design-system/       # Composants UI, tokens, illustrations
│   └── onboarding/           # Tours guidés, HelpButton
├── services/
│   └── training/             # API de formation (port 3012)
├── infra/seeds/
│   └── training-modules.json # 6 modules de formation
├── apps/
│   └── web-industry/
│       └── src/components/
│           └── TrainingIntegration.tsx
└── docs/
    ├── DESIGN_SYSTEM.md
    └── TRAINING_SYSTEM.md
```

## Utilisation

### Design System

```tsx
import { Button, Card, Badge } from '@rt/design-system';

<Card variant="default" padding="md">
  <Button variant="primary">Créer une commande</Button>
  <Badge variant="success">Complété</Badge>
</Card>
```

### Onboarding

```tsx
import { HelpButton, TourGuide } from '@rt/onboarding';

<HelpButton
  modules={modules}
  onStartModule={(id) => navigate(`/training/${id}`)}
/>

<TourGuide
  tourId="welcome-tour"
  steps={tourSteps}
  autoStart={true}
/>
```

## Fonctionnalités

### Design System
- 10 composants UI réutilisables
- Palette de 100+ couleurs
- Système typographique complet
- Responsive (5 breakpoints)
- Accessible WCAG AA

### Formation
- 6 modules complets (185 min)
- 22 leçons avec quiz
- Système de certification
- Suivi de progression
- API REST complète

### Onboarding
- Tours guidés interactifs
- Centre d'aide flottant
- Modal 4 onglets
- Badge de notification

## Livrables

- **34 fichiers créés**
- **~6,500 lignes de code**
- **~13,500 mots de documentation**
- **6 modules de formation**
- **10 composants UI**

Voir [FICHIERS_CREES.md](./FICHIERS_CREES.md) pour la liste complète.

## Technologies

- **Frontend** : React 18, TypeScript, Tailwind CSS
- **Backend** : Node.js, Express
- **Base de données** : MongoDB
- **UI** : Radix UI, Framer Motion
- **Build** : Turbo, pnpm

## Support

Consultez la documentation :
- [Design System](./docs/DESIGN_SYSTEM.md)
- [Training System](./docs/TRAINING_SYSTEM.md)
- [Quick Start](./QUICK_START_UX.md)

---

**Version** : 1.0.0
**Date** : Novembre 2025
**Maintenu par** : Équipe RT-Technologie
