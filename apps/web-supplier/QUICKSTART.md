# Quick Start - RT Supplier

Guide de démarrage rapide pour l'application RT Supplier.

## Prérequis

- Node.js 18+ installé
- pnpm 8+ installé
- Services backend en cours d'exécution :
  - Core Orders (port 3001)
  - Planning (port 3004)
  - Notifications (port 3002)

## Installation

### 1. Installer les dépendances

Depuis la racine du monorepo :

```bash
pnpm install
```

### 2. Configurer les variables d'environnement

Le fichier `.env.local` est déjà créé avec les valeurs par défaut. Si nécessaire, modifiez-le :

```bash
# apps/web-supplier/.env.local
NEXT_PUBLIC_API_CORE_ORDERS=http://localhost:3001
NEXT_PUBLIC_API_PLANNING=http://localhost:3004
NEXT_PUBLIC_API_NOTIFICATIONS=http://localhost:3002
```

### 3. Lancer l'application en développement

```bash
# Depuis la racine du monorepo
pnpm --filter @rt/web-supplier dev

# OU depuis le dossier de l'app
cd apps/web-supplier
pnpm dev
```

L'application sera disponible sur **http://localhost:3103**

## Première Utilisation

### Page d'Accueil
Accédez à http://localhost:3103 pour voir :
- 4 cartes principales : Enlèvements, Créneaux, Préparation, Historique
- Navigation responsive mobile/desktop

### Test du Workflow

#### 1. Consulter les Enlèvements
- Allez sur `/pickups`
- Vous verrez la liste des pickups (si le backend retourne des données)
- Cliquez sur "Voir détails" pour voir un pickup spécifique

#### 2. Proposer un Créneau
- Allez sur `/slots`
- Sélectionnez un pickup
- Cliquez sur "Proposer un nouveau créneau"
- Remplissez le formulaire (date, heure début, heure fin)
- Cliquez sur "Proposer"

#### 3. Préparer un Enlèvement
- Allez sur `/preparation`
- Cochez les items de la checklist
- Uploadez les documents requis (BL, packing list)
- Quand tout est complété, cliquez sur "Marquer comme Prêt"

#### 4. Consulter l'Historique
- Allez sur `/history`
- Visualisez les KPIs (total, ponctualité, conformité)
- Changez la période (7j, 30j, 12m)
- Consultez l'historique des enlèvements

### Test des Notifications

Pour tester les notifications push :

1. Ouvrez l'app dans Chrome/Edge/Firefox
2. Cliquez sur l'icône cloche dans la navigation
3. Activez les notifications push
4. Acceptez la permission du navigateur
5. Les notifications apparaîtront dans le panneau

## Développement

### Structure des Pages

Toutes les pages suivent le pattern Next.js App Router :

```
src/app/
├── page.tsx              # Home
├── pickups/
│   ├── page.tsx         # Liste
│   └── [id]/page.tsx    # Détail
├── slots/page.tsx
├── preparation/page.tsx
└── history/page.tsx
```

### Ajouter une Nouvelle Page

1. Créer le fichier dans `src/app/nouvelle-page/page.tsx`
2. Ajouter la route dans `src/components/layout/navigation.tsx`
3. Créer l'API service si nécessaire dans `src/lib/api/`

### Ajouter un Nouveau Composant UI

```typescript
// src/components/ui/mon-composant.tsx
import { cn } from '@/lib/utils'

export function MonComposant({ className, ...props }) {
  return (
    <div className={cn('base-classes', className)} {...props}>
      {/* contenu */}
    </div>
  )
}
```

### Ajouter un Nouvel Endpoint API

```typescript
// src/lib/api/mon-service.ts
import { coreOrdersApi } from './client'

export const monServiceApi = {
  getAll: async () => {
    const { data } = await coreOrdersApi.get('/mon-endpoint')
    return data
  },
}
```

## Build Production

```bash
# Build
pnpm --filter @rt/web-supplier build

# Start production server
pnpm --filter @rt/web-supplier start
```

Le build créera :
- Version optimisée dans `.next/`
- Assets statiques dans `.next/static/`
- Server functions

## Debugging

### DevTools React Query

Ajoutez le devtools dans `src/app/providers.tsx` :

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

<QueryClientProvider client={queryClient}>
  {children}
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

### Logs API

Les erreurs API sont loggées dans la console. Vérifiez :
- Network tab dans DevTools
- Console pour les erreurs Axios
- Status codes des réponses

### Problèmes Courants

#### Les APIs ne répondent pas
- Vérifiez que les services backend sont démarrés
- Vérifiez les URLs dans `.env.local`
- Vérifiez la console pour les erreurs CORS

#### Les notifications ne fonctionnent pas
- Vérifiez que vous êtes en HTTPS ou localhost
- Vérifiez les permissions du navigateur
- Vérifiez que le service worker est enregistré

#### Le hot reload ne fonctionne pas
- Redémarrez le serveur de dev
- Supprimez `.next/` et relancez
- Vérifiez qu'aucun autre processus n'utilise le port 3103

## Tests

### Tests Manuels

Checklist de tests :
- [ ] Navigation entre toutes les pages
- [ ] Upload de fichiers
- [ ] Formulaires (créneaux)
- [ ] Checklist préparation
- [ ] Notifications
- [ ] Responsive mobile/desktop
- [ ] Dark mode (si implémenté)

### Tests E2E (à venir)

```bash
# Playwright (à configurer)
pnpm test:e2e
```

## Ressources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Query Guide](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/)

## Support

Pour toute question ou problème :
1. Vérifiez la documentation dans `README.md` et `ARCHITECTURE.md`
2. Consultez les logs de la console
3. Contactez l'équipe de développement

## Next Steps

1. Configurer l'authentification
2. Ajouter les tests unitaires
3. Configurer le CI/CD
4. Ajouter les analytics
5. Optimiser les performances
