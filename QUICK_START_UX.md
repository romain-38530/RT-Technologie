# Quick Start - Design System & Formation

Guide de démarrage rapide pour utiliser le nouveau système de design et de formation RT-Technologie.

## 🚀 Démarrage en 5 minutes

### 1. Démarrer le service Training

```bash
# Terminal 1 - Démarrer MongoDB
docker run -d -p 27017:27017 --name rt-mongo mongo:latest

# Terminal 2 - Démarrer le service Training
cd services/training
pnpm install
pnpm dev

# ✅ Service disponible sur http://localhost:3012
```

### 2. Insérer les données de formation

```bash
# Se connecter à MongoDB
mongosh

# Utiliser la base de données
use rt-training

# Copier le contenu de infra/seeds/training-modules.json
# et le coller dans cette commande:
db.modules.insertMany([
  // Coller le contenu JSON ici
])
```

### 3. Démarrer une application

```bash
# Terminal 3 - Démarrer web-industry
cd apps/web-industry
pnpm install
pnpm dev

# ✅ App disponible sur http://localhost:3010
```

### 4. Tester

1. Ouvrir http://localhost:3010
2. Le bouton **?** devrait apparaître en haut à droite
3. Cliquer dessus pour voir le centre de formation
4. Un tour guidé devrait se lancer au premier accès

---

## 📦 Utiliser le Design System

### Installation

```bash
# Dans une application
pnpm add @rt/design-system
```

### Exemples d'utilisation

```tsx
import { Button, Card, Badge, Input, Modal } from '@rt/design-system';

// Bouton
<Button variant="primary" size="md">
  Créer une commande
</Button>

// Carte
<Card variant="default" padding="md">
  <h2>Titre</h2>
  <p>Contenu</p>
</Card>

// Badge de statut
<Badge variant="delivered">Livrée</Badge>

// Input avec validation
<Input
  label="Email"
  type="email"
  error={errors.email}
  required
/>

// Modal
<Modal open={isOpen} onOpenChange={setIsOpen}>
  <ModalContent>
    <ModalHeader>
      <ModalTitle>Mon titre</ModalTitle>
    </ModalHeader>
    <div>Contenu</div>
  </ModalContent>
</Modal>
```

---

## 🎓 Intégrer la formation

### Dans votre application

Créez `src/components/TrainingIntegration.tsx` :

```tsx
'use client';

import React, { useEffect, useState } from 'react';
import { HelpButton, TourGuide } from '@rt/onboarding';

export const TrainingIntegration = ({ userId }: { userId: string }) => {
  const [modules, setModules] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:3012/training/modules?targetApp=web-industry`)
      .then(res => res.json())
      .then(data => setModules(data.data));
  }, []);

  return (
    <HelpButton
      modules={modules}
      onStartModule={(id) => {
        window.location.href = `/training/modules/${id}`;
      }}
    />
  );
};
```

### Dans votre layout

```tsx
// app/layout.tsx
import { TrainingIntegration } from '@/components/TrainingIntegration';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <TrainingIntegration userId="USER-123" />
      </body>
    </html>
  );
}
```

### Marquer les éléments pour le tour

```tsx
<div data-tour="dashboard">
  Mon Dashboard
</div>

<button data-tour="create-button">
  Créer
</button>
```

---

## 🎨 Palette de couleurs

```tsx
import { colors } from '@rt/design-system';

// Couleurs principales
colors.primary[500]  // #3b82f6 (Bleu RT)
colors.success[500]  // #10b981 (Vert)
colors.warning[500]  // #f59e0b (Orange)
colors.error[500]    // #ef4444 (Rouge)

// Statuts de commandes
colors.orderStatus.pending    // Orange
colors.orderStatus.confirmed  // Bleu
colors.orderStatus.delivered  // Vert
```

---

## 📝 API Training - Endpoints principaux

### Récupérer les modules

```bash
GET http://localhost:3012/training/modules?targetApp=web-industry
```

### Enregistrer la progression

```bash
POST http://localhost:3012/training/progress
Content-Type: application/json

{
  "userId": "USER-123",
  "moduleId": "MODULE-INDUSTRY-001",
  "lessonId": "LESSON-IND-001",
  "progress": 50,
  "completed": false
}
```

### Soumettre un quiz

```bash
POST http://localhost:3012/training/quiz/LESSON-IND-001/submit
Content-Type: application/json

{
  "userId": "USER-123",
  "answers": [2, 0, 1]
}
```

### Récupérer les certificats

```bash
GET http://localhost:3012/training/certificates/USER-123
```

---

## 🔧 Variables d'environnement

Créez `.env.local` dans chaque app :

```env
NEXT_PUBLIC_TRAINING_API=http://localhost:3012
MONGO_URI=mongodb://localhost:27017/rt-training
```

---

## 📚 Documentation complète

- **Design System** : `/docs/DESIGN_SYSTEM.md`
- **Système de formation** : `/docs/TRAINING_SYSTEM.md`
- **Rapport complet** : `/RAPPORT_UX_FORMATION.md`

---

## 🐛 Dépannage

### Le bouton "?" n'apparaît pas

1. Vérifier que `@rt/onboarding` est installé
2. Vérifier que `TrainingIntegration` est dans le layout
3. Vérifier la console pour des erreurs

### Erreur "Cannot connect to MongoDB"

```bash
# Vérifier que MongoDB est démarré
docker ps | grep mongo

# Redémarrer si nécessaire
docker restart rt-mongo
```

### Le service Training ne démarre pas

```bash
# Vérifier les logs
cd services/training
pnpm dev

# Vérifier que le port 3012 est libre
lsof -i :3012  # Mac/Linux
netstat -ano | findstr :3012  # Windows
```

### Aucun module ne s'affiche

```bash
# Vérifier que les seeds sont insérés
mongosh
use rt-training
db.modules.find().count()

# Devrait retourner 6
```

---

## ✅ Checklist d'intégration

Pour intégrer le système dans une nouvelle app :

- [ ] Installer `@rt/design-system` et `@rt/onboarding`
- [ ] Créer `TrainingIntegration.tsx`
- [ ] Ajouter dans le layout principal
- [ ] Marquer les éléments avec `data-tour`
- [ ] Créer un fichier de tour guidé (ex: `industryTour.ts`)
- [ ] Configurer les variables d'environnement
- [ ] Tester le bouton d'aide
- [ ] Tester le tour guidé
- [ ] Vérifier l'accessibilité (navigation clavier)

---

## 🎯 Prochaines étapes recommandées

1. **Filmer les vidéos** de formation (22 leçons)
2. **Personnaliser les tours** pour chaque application
3. **Ajouter des analytics** (Google Analytics, Mixpanel)
4. **Traduire** en anglais (i18n)
5. **Optimiser les images** (illustrations, logos)
6. **Tester l'accessibilité** (screen readers)

---

## 💡 Conseils

### Pour un tour guidé efficace

- Commencer par une vue d'ensemble
- Pointer les fonctionnalités principales (3-5 étapes max)
- Utiliser un langage simple et direct
- Permettre de passer le tour facilement
- Sauvegarder pour ne pas revoir à chaque fois

### Pour créer un bon module

- Vidéos courtes (max 15 min)
- Quiz pertinents (2-5 questions)
- Exemples concrets et pratiques
- Progression logique (simple → complexe)
- Interactivité (encourager la pratique)

### Pour un design cohérent

- Toujours utiliser les composants du design system
- Respecter la palette de couleurs
- Utiliser le système d'espacement (4pt)
- Tester sur mobile ET desktop
- Vérifier l'accessibilité (contraste, clavier)

---

## 📞 Support

Pour toute question :

1. Consulter la documentation (`/docs/`)
2. Vérifier le rapport complet (`/RAPPORT_UX_FORMATION.md`)
3. Ouvrir une issue sur GitHub
4. Contacter l'équipe RT-Technologie

---

**Bon développement !** 🚀
