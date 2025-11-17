# Guide de demarrage rapide - RT Forwarder

## Demarrage en 3 etapes

### 1. Installer les dependances

Depuis la racine du monorepo :

```bash
pnpm install
```

### 2. Demarrer le service Affret.IA (backend)

```bash
# Terminal 1 - Demarrer le service Affret.IA
cd services/affret-ia
node src/server.js
# Le service demarre sur http://localhost:3005
```

### 3. Demarrer l'application web-forwarder

```bash
# Terminal 2 - Demarrer l'application Next.js
cd apps/web-forwarder
pnpm dev
# L'application demarre sur http://localhost:4002
```

## Acces a l'application

Ouvrez votre navigateur sur **http://localhost:4002**

### Pages disponibles

- **Accueil** : http://localhost:4002/
- **Dashboard** : http://localhost:4002/dashboard
- **Cotations** : http://localhost:4002/quotes
- **Appels d'offres** : http://localhost:4002/tenders
- **Marketplace** : http://localhost:4002/marketplace
- **Analytics** : http://localhost:4002/analytics
- **Login** : http://localhost:4002/login

## Donnees de demonstration

L'application utilise les seeds suivantes :

- **Commandes** : `public/seeds/orders.json` (2 commandes de demo)
  - ORD-Paris-Munich (12 palettes, 7800 kg)
  - ORD-Lyon-Milan (10 palettes, 6500 kg, escaladee)

- **Transporteurs** : `public/seeds/carriers.json` (3 transporteurs)
  - Carrier A (bloque, scoring: 82)
  - Carrier B (premium, scoring: 88)
  - Carrier C (premium, scoring: 75)

## Test du workflow complet

### Scenario 1 : Cotation AI

1. Aller sur `/quotes`
2. Selectionner une commande (ex: ORD-Paris-Munich)
3. Cliquer sur "Obtenir cotation AI"
4. Observer :
   - Prix AI genere
   - Prix de reference (grille)
   - Transporteurs suggeres
   - Economies potentielles

### Scenario 2 : Appel d'offres

1. Aller sur `/tenders`
2. Selectionner une commande
3. Soumettre une offre :
   - Choisir un transporteur premium
   - Entrer un prix
   - Cliquer sur "Soumettre"
4. Observer le tableau des offres recues avec :
   - Rang (meilleure offre en vert)
   - Scoring du transporteur
   - Prix et comparatif

### Scenario 3 : Marketplace

1. Aller sur `/marketplace`
2. Filtrer les transporteurs :
   - Par scoring minimum
   - Par recherche (nom/email)
   - Afficher/masquer bloques
3. Cliquer sur un transporteur pour voir ses details

### Scenario 4 : Analytics

1. Aller sur `/analytics`
2. Observer :
   - KPIs (affretements IA, economies, prix moyen)
   - Graphiques (sources, AI vs manuel)
   - Top 5 economies par route
   - Performance des transporteurs

## Fonctionnalites avancees

### Dispatch automatique

Sur la page `/quotes`, apres avoir obtenu une cotation :

1. Cliquer sur "Dispatcher automatiquement"
2. L'IA selectionne automatiquement le meilleur transporteur
3. Le resultat affiche :
   - Transporteur assigne
   - Prix
   - Source (ai/fallback)

### Integration avec grilles tarifaires

Les grilles tarifaires sont chargees depuis `infra/seeds/grids.json` :

- Origine Paris → Munich : 950 EUR (FTL)
- Origine Lyon → Milan : 820 EUR (FTL)

L'IA compare automatiquement ses prix avec les grilles.

## Variables d'environnement

Creer un fichier `.env.local` dans `apps/web-forwarder/` :

```env
NEXT_PUBLIC_AFFRET_IA_URL=http://localhost:3005
```

## Troubleshooting

### Erreur "Failed to fetch"

- Verifier que le service Affret.IA est demarre sur le port 3005
- Verifier l'URL dans `next.config.js`

### Aucune donnee affichee

- Verifier que les seeds sont presents dans `public/seeds/`
- Ouvrir la console navigateur pour voir les erreurs

### Erreur TypeScript

```bash
# Regenerer les types
pnpm build
```

## Commandes utiles

```bash
# Lancer en mode developpement
pnpm dev

# Builder pour production
pnpm build

# Lancer en production
pnpm start

# Verifier le code (linting)
pnpm lint
```

## Prochaines etapes

1. Integrer l'authentification reelle avec le service Auth
2. Ajouter la persistence MongoDB pour les bids/assignments
3. Implementer les webhooks pour notifications temps-reel
4. Ajouter des tests unitaires et d'integration
5. Deployer sur Vercel ou autre plateforme

## Support

Pour toute question, consulter :
- Le README principal : `README.md`
- La documentation du service Affret.IA : `services/affret-ia/README.md`
- Les schemas de l'API : `packages/contracts/`
