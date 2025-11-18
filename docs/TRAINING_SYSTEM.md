# RT-Technologie Training System

> Système de formation intégré pour former les utilisateurs sur toutes les applications de la plateforme

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Modules de formation](#modules-de-formation)
4. [API du service Training](#api-du-service-training)
5. [Composants UI](#composants-ui)
6. [Intégration dans les applications](#intégration-dans-les-applications)
7. [Création de nouveaux modules](#création-de-nouveaux-modules)
8. [Analytics et suivi](#analytics-et-suivi)

---

## Vue d'ensemble

Le **Training System** est un système complet de formation utilisateur qui permet de :

- Former les utilisateurs sur chaque application
- Suivre leur progression
- Délivrer des certificats
- Proposer des quiz de validation
- Offrir des tours guidés interactifs
- Fournir une aide contextuelle

### Caractéristiques principales

- **6 modules de formation** (un par application)
- **API REST complète** (port 3012)
- **Interface unifiée** (HelpButton présent partout)
- **Tours guidés** au premier accès
- **Certificats** après complétion des modules
- **Progression sauvegardée** en temps réel
- **Vidéos tutoriels** intégrées

---

## Architecture

### Composants du système

```
┌─────────────────────────────────────────────────────────┐
│                    Applications Web                      │
│  (Industry, Transporter, Logistician, etc.)             │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ HelpButton   │  │  TourGuide   │  │ Training     │  │
│  │ (@rt/        │  │  (@rt/       │  │ Pages        │  │
│  │  onboarding) │  │   onboarding)│  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓ API Calls
┌─────────────────────────────────────────────────────────┐
│              Service Training (Port 3012)                │
│                                                          │
│  GET /training/modules                                   │
│  GET /training/modules/:id                               │
│  POST /training/progress                                 │
│  GET /training/progress/:userId                          │
│  POST /training/quiz/:lessonId/submit                    │
│  GET /training/certificates/:userId                      │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   MongoDB Database                       │
│                                                          │
│  Collections:                                            │
│  - modules (contenu de formation)                        │
│  - progress (progression utilisateurs)                   │
│  - quiz-results (résultats des quiz)                     │
└─────────────────────────────────────────────────────────┘
```

### Technologies

- **Backend** : Node.js + Express (service training)
- **Base de données** : MongoDB
- **Frontend** : React + TypeScript
- **UI** : @rt/design-system
- **Animations** : Framer Motion

---

## Modules de formation

### Liste des modules

Nous avons créé **6 modules complets**, un pour chaque application :

| Module | Application | Durée | Leçons | Description |
|--------|-------------|-------|--------|-------------|
| MODULE-INDUSTRY-001 | web-industry | 45 min | 4 | Gestion de commandes, grilles, palettes, tracking |
| MODULE-TRANSPORTER-001 | web-transporter | 40 min | 4 | Missions, scan palettes, documents, planning |
| MODULE-LOGISTICIAN-001 | web-logistician | 38 min | 4 | Quais, réception, E-CMR, anomalies |
| MODULE-FORWARDER-001 | web-forwarder | 30 min | 3 | Cotation IA, comparaison, marketplace |
| MODULE-SUPPLIER-001 | web-supplier | 25 min | 3 | Préparation, créneaux, documents |
| MODULE-RECIPIENT-001 | web-recipient | 32 min | 4 | Créneaux, contrôle, signature, anomalies |

### Structure d'un module

Chaque module contient :

```json
{
  "id": "MODULE-INDUSTRY-001",
  "title": "Formation Industriel",
  "description": "Maîtrisez l'espace industriel RT-Technologie",
  "targetApp": "web-industry",
  "duration": 45,
  "level": "Débutant",
  "icon": "🏭",
  "color": "#3b82f6",
  "lessons": [
    {
      "id": "LESSON-IND-001",
      "title": "Créer une commande",
      "type": "video",
      "duration": 10,
      "description": "Apprenez à créer votre première commande",
      "videoUrl": "/videos/industry/create-order.mp4",
      "keyPoints": [
        "Accéder au formulaire",
        "Remplir les infos",
        "Import CSV/Excel",
        "Validation"
      ],
      "quiz": [
        {
          "question": "Comment importer plusieurs commandes ?",
          "options": ["CSV", "Excel", "CSV et Excel", "Impossible"],
          "correctAnswer": 2,
          "explanation": "RT-Technologie supporte CSV et Excel"
        }
      ]
    }
  ]
}
```

### Types de leçons

- **video** : Vidéo tutoriel avec transcript
- **interactive** : Exercice interactif (à venir)
- **text** : Contenu texte + images

---

## API du service Training

Le service Training expose une API REST complète sur le **port 3012**.

### Endpoints

#### 1. Récupérer les modules

```http
GET /training/modules?targetApp=web-industry
```

**Réponse** :
```json
{
  "success": true,
  "data": [
    {
      "id": "MODULE-INDUSTRY-001",
      "title": "Formation Industriel",
      "duration": 45,
      "lessons": [...]
    }
  ],
  "count": 1
}
```

#### 2. Récupérer un module spécifique

```http
GET /training/modules/:id
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "id": "MODULE-INDUSTRY-001",
    "title": "Formation Industriel",
    "lessons": [...]
  }
}
```

#### 3. Enregistrer la progression

```http
POST /training/progress
Content-Type: application/json

{
  "userId": "USER-123",
  "moduleId": "MODULE-INDUSTRY-001",
  "lessonId": "LESSON-IND-001",
  "progress": 50,
  "completed": false
}
```

**Réponse** :
```json
{
  "success": true,
  "message": "Progression enregistrée avec succès",
  "data": {
    "userId": "USER-123",
    "moduleId": "MODULE-INDUSTRY-001",
    "progress": 50
  }
}
```

#### 4. Récupérer la progression d'un utilisateur

```http
GET /training/progress/:userId?moduleId=MODULE-INDUSTRY-001
```

**Réponse** :
```json
{
  "success": true,
  "data": [
    {
      "userId": "USER-123",
      "moduleId": "MODULE-INDUSTRY-001",
      "lessonId": "LESSON-IND-001",
      "progress": 100,
      "completed": true,
      "updatedAt": "2025-11-17T12:00:00Z"
    }
  ]
}
```

#### 5. Soumettre un quiz

```http
POST /training/quiz/:lessonId/submit
Content-Type: application/json

{
  "userId": "USER-123",
  "answers": [2, 0, 1, 3]
}
```

**Réponse** :
```json
{
  "success": true,
  "message": "Quiz réussi !",
  "data": {
    "score": 85,
    "passed": true,
    "correctAnswers": 3,
    "totalQuestions": 4,
    "results": [
      {
        "questionIndex": 0,
        "userAnswer": 2,
        "correctAnswer": 2,
        "isCorrect": true
      }
    ]
  }
}
```

#### 6. Récupérer les certificats

```http
GET /training/certificates/:userId
```

**Réponse** :
```json
{
  "success": true,
  "data": [
    {
      "certificateId": "CERT-USER-123-MODULE-INDUSTRY-001-1731849600",
      "userId": "USER-123",
      "moduleId": "MODULE-INDUSTRY-001",
      "moduleTitle": "Formation Industriel",
      "completedAt": "2025-11-17T12:00:00Z",
      "averageScore": 87
    }
  ]
}
```

---

## Composants UI

### HelpButton

Bouton d'aide flottant présent sur toutes les pages.

**Caractéristiques** :
- Position configurable (top-right, bottom-right, etc.)
- Badge avec nombre de modules non complétés
- Animation pulse pour attirer l'attention
- Modal avec 4 onglets :
  - **Modules** : Liste des modules disponibles
  - **Ma progression** : Barres de progression par module
  - **Certificats** : Badges des certificats obtenus
  - **Vidéos** : Bibliothèque de tutoriels

**Utilisation** :

```tsx
import { HelpButton } from '@rt/onboarding';

<HelpButton
  modules={modules}
  userProgress={{ 'MODULE-INDUSTRY-001': 75 }}
  certificates={certificates}
  onStartModule={(moduleId) => {
    window.location.href = `/training/modules/${moduleId}`;
  }}
  position="top-right"
/>
```

### TourGuide

Tour guidé interactif qui met en évidence les éléments de la page.

**Caractéristiques** :
- Spotlight sur l'élément ciblé
- Overlay avec fond sombre
- Tooltip avec titre, description, navigation
- Barre de progression
- Sauvegarde dans localStorage
- Auto-scroll vers l'élément

**Utilisation** :

```tsx
import { TourGuide, industryTour } from '@rt/onboarding';

<TourGuide
  tourId="industry-welcome-tour"
  steps={industryTour}
  onComplete={() => console.log('Tour complété')}
  onSkip={() => console.log('Tour skippé')}
  autoStart={true}
/>
```

**Définir des étapes de tour** :

```tsx
const myTour: TourStep[] = [
  {
    id: 'step-1',
    title: 'Bienvenue !',
    content: 'Ceci est votre dashboard',
    target: '[data-tour="dashboard"]',
    placement: 'bottom',
  },
  {
    id: 'step-2',
    title: 'Créer une commande',
    content: 'Cliquez ici pour créer une commande',
    target: '[data-tour="create-button"]',
    placement: 'right',
    action: () => console.log('Action exécutée'),
  },
];
```

**Marquer les éléments dans le HTML** :

```tsx
<div data-tour="dashboard">
  Mon dashboard
</div>

<button data-tour="create-button">
  Créer
</button>
```

---

## Intégration dans les applications

### Étape 1 : Installer les dépendances

```bash
pnpm add @rt/onboarding @rt/design-system framer-motion
```

### Étape 2 : Créer le composant d'intégration

Créez `src/components/TrainingIntegration.tsx` :

```tsx
'use client';

import React, { useEffect, useState } from 'react';
import { HelpButton, TourGuide, industryTour } from '@rt/onboarding';

export const TrainingIntegration = ({ userId }: { userId: string }) => {
  const [modules, setModules] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    // Charger les données de formation
    fetch(`http://localhost:3012/training/modules?targetApp=web-industry`)
      .then(res => res.json())
      .then(data => setModules(data.data));

    fetch(`http://localhost:3012/training/progress/${userId}`)
      .then(res => res.json())
      .then(data => {
        const progressMap = {};
        data.data.forEach(p => {
          progressMap[p.moduleId] = p.progress;
        });
        setUserProgress(progressMap);
      });

    fetch(`http://localhost:3012/training/certificates/${userId}`)
      .then(res => res.json())
      .then(data => setCertificates(data.data));
  }, [userId]);

  return (
    <>
      <HelpButton
        modules={modules}
        userProgress={userProgress}
        certificates={certificates}
        onStartModule={(moduleId) => {
          window.location.href = `/training/modules/${moduleId}`;
        }}
      />

      <TourGuide
        tourId="industry-welcome-tour"
        steps={industryTour}
        autoStart={true}
      />
    </>
  );
};
```

### Étape 3 : Ajouter dans le layout

```tsx
// app/layout.tsx
import { TrainingIntegration } from '@/components/TrainingIntegration';

export default function RootLayout({ children }) {
  const userId = 'USER-123'; // Récupérer depuis la session

  return (
    <html>
      <body>
        {children}
        <TrainingIntegration userId={userId} />
      </body>
    </html>
  );
}
```

### Étape 4 : Marquer les éléments pour le tour

```tsx
// Ajouter data-tour aux éléments importants
<div data-tour="dashboard">
  <h1>Dashboard</h1>
</div>

<button data-tour="create-order-button">
  Créer une commande
</button>

<nav>
  <a data-tour="palettes-menu" href="/palettes">
    Palettes
  </a>
</nav>
```

---

## Création de nouveaux modules

### 1. Définir la structure du module

Créez un fichier JSON dans `infra/seeds/` :

```json
{
  "id": "MODULE-CUSTOM-001",
  "title": "Nouveau Module",
  "description": "Description du module",
  "targetApp": "web-custom",
  "duration": 30,
  "level": "Débutant",
  "icon": "🎯",
  "color": "#3b82f6",
  "lessons": [
    {
      "id": "LESSON-001",
      "title": "Première leçon",
      "type": "video",
      "duration": 10,
      "description": "Description de la leçon",
      "videoUrl": "/videos/custom/lesson-1.mp4",
      "keyPoints": ["Point 1", "Point 2"],
      "quiz": [
        {
          "question": "Question ?",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": 0,
          "explanation": "Explication de la réponse"
        }
      ]
    }
  ]
}
```

### 2. Insérer dans MongoDB

```bash
# Se connecter à MongoDB
mongosh

# Utiliser la base de données
use rt-training

# Insérer le module
db.modules.insertOne(<votre-json>)
```

### 3. Créer le tour guidé

Créez `packages/onboarding/src/tours/customTour.ts` :

```tsx
import { TourStep } from '../components/TourGuide';

export const customTour: TourStep[] = [
  {
    id: 'step-1',
    title: 'Bienvenue',
    content: 'Description...',
    target: '[data-tour="element"]',
    placement: 'bottom',
  },
];
```

### 4. Exporter le tour

```tsx
// packages/onboarding/src/index.tsx
export { customTour } from './tours/customTour';
```

---

## Analytics et suivi

### Métriques disponibles

Le système de formation permet de suivre :

1. **Taux de complétion** :
   - Nombre d'utilisateurs ayant complété chaque module
   - Taux de complétion global par application

2. **Temps passé** :
   - Durée moyenne par leçon
   - Durée totale par module

3. **Scores aux quiz** :
   - Score moyen par leçon
   - Taux de réussite au premier essai

4. **Engagement** :
   - Nombre de fois qu'un module est démarré
   - Taux d'abandon par leçon
   - Modules les plus populaires

### Récupérer les analytics

```javascript
// Exemple : Taux de complétion global
const stats = await db.collection('progress').aggregate([
  {
    $group: {
      _id: '$moduleId',
      totalUsers: { $addToSet: '$userId' },
      completedUsers: {
        $sum: { $cond: [{ $eq: ['$completed', true] }, 1, 0] }
      }
    }
  },
  {
    $project: {
      moduleId: '$_id',
      completionRate: {
        $multiply: [
          { $divide: ['$completedUsers', { $size: '$totalUsers' }] },
          100
        ]
      }
    }
  }
]);
```

---

## Best Practices

### Pour les formateurs

1. **Vidéos courtes** : Max 15 minutes par leçon
2. **Quiz pertinents** : 2-5 questions par leçon
3. **Exemples concrets** : Utiliser des cas réels
4. **Progressivité** : Du plus simple au plus complexe

### Pour les développeurs

1. **Marquer les éléments** : Toujours ajouter `data-tour`
2. **Tester le tour** : Vérifier que le spotlight fonctionne
3. **Sauvegarder la progression** : Après chaque action importante
4. **Feedback utilisateur** : Toasts pour confirmer les actions

### Pour les utilisateurs

1. **Suivre dans l'ordre** : Compléter les leçons séquentiellement
2. **Refaire si besoin** : Les modules sont rejouables
3. **Utiliser l'aide** : Bouton "?" toujours disponible
4. **Obtenir les certificats** : Motiver à terminer les modules

---

## Feuille de route

### À venir (Q1 2026)

- [ ] Mode hors ligne pour les modules
- [ ] Leçons interactives (exercices pratiques)
- [ ] Système de gamification (points, badges)
- [ ] Partage social des certificats
- [ ] Éditeur WYSIWYG pour créer des modules
- [ ] Traduction multilingue
- [ ] Mode sombre

---

## Support

Pour toute question sur le système de formation :

- **Documentation** : `/docs/TRAINING_SYSTEM.md`
- **API Reference** : http://localhost:3012/api-docs (à venir)
- **Exemples** : `/apps/web-industry/src/components/TrainingIntegration.tsx`

---

**Version** : 1.0.0
**Dernière mise à jour** : Novembre 2025
**Maintenu par** : Équipe RT-Technologie
