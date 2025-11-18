# Démarrage Rapide - Web Transporter

Guide pour lancer l'application web-transporter en 5 minutes.

## Prérequis

- Node.js 18+
- pnpm 8+
- Les services backend RT-Technologie

## Installation

### 1. Cloner et installer les dépendances

Depuis la racine du monorepo RT-Technologie :

```bash
pnpm install
```

### 2. Lancer les services backend

Depuis la racine du monorepo :

```bash
pnpm agents
```

Cette commande démarre tous les services :
- core-orders (port 3001)
- planning (port 3004)
- ecpmr (port 3009)
- vigilance (port 3002)
- Et tous les autres services...

Vérifier que les services sont lancés :
```bash
# Dans un autre terminal
curl http://localhost:3001/health
curl http://localhost:3004/health
curl http://localhost:3009/health
```

### 3. Lancer l'application web-transporter

```bash
cd apps/web-transporter
pnpm dev
```

L'application démarre sur http://localhost:3100

## Premier test

### 1. Ouvrir l'application

Naviguer vers http://localhost:3100

Vous serez redirigé vers la page de login.

### 2. Se connecter

Sur la page de login :
- Sélectionner **CARRIER-B** dans la liste
- Cliquer sur **Se connecter**

Le mot de passe n'est pas vérifié en mode démo.

### 3. Tester les fonctionnalités

#### Missions en attente
1. Cliquer sur **Missions en attente** dans la navigation
2. Vous verrez les missions assignées à CARRIER-B
3. Observer le countdown SLA (temps restant)
4. Cliquer sur **Accepter** pour une mission

#### Missions acceptées
1. Aller dans **Missions acceptées**
2. Voir les missions que vous avez acceptées
3. Cliquer sur **Proposer RDV**
4. Entrer une date et heure (format YYYY-MM-DD et HH:MM)

#### Planning
1. Aller dans **Planning**
2. Voir le calendrier de la semaine
3. Naviguer entre les semaines avec les boutons

#### Documents
1. Depuis **Missions acceptées**, cliquer sur **Voir documents**
2. Sélectionner un fichier pour chaque type (CMR, Photo, POD)
3. Observer l'upload et la liste des documents

#### Profil
1. Aller dans **Profil**
2. Voir vos informations transporteur
3. Consulter votre statut vigilance
4. Observer vos statistiques

## Tester avec différents transporteurs

### CARRIER-B (Transport Express)
```bash
# Login avec CARRIER-B
# Missions en attente : Voir les missions assignées
```

### CARRIER-C (Logistique Pro)
```bash
# Login avec CARRIER-C
# Différentes missions selon la chaîne de dispatch
```

### CARRIER-A (Demo Transport)
```bash
# Login avec CARRIER-A
# Peut être bloqué par la vigilance selon la config
```

## Créer une mission de test

Depuis un autre terminal, créer une nouvelle mission pour tester le workflow complet :

```bash
# Créer une mission
curl -X POST http://localhost:3001/industry/orders/import \
  -H "Content-Type: application/json" \
  -d '{
    "id": "TEST-001",
    "ref": "TEST-REF-001",
    "ownerOrgId": "IND-1",
    "ship_from": "Paris",
    "ship_to": "Lyon",
    "pallets": 33,
    "weight": 5000
  }'

# Dispatcher la mission
curl -X POST http://localhost:3001/industry/orders/TEST-001/dispatch

# Rafraîchir la page "Missions en attente" dans le navigateur
# La nouvelle mission devrait apparaître
```

## Déboguer

### Les missions n'apparaissent pas

1. Vérifier que core-orders est lancé :
   ```bash
   curl http://localhost:3001/health
   ```

2. Vérifier les logs du service core-orders

3. Vérifier le carrierId dans le localStorage :
   ```javascript
   // Console navigateur
   localStorage.getItem('transporter_jwt')
   ```

### Erreur CORS

Les rewrites Next.js devraient gérer CORS automatiquement.

Si problème persiste :
1. Vérifier que les URLs dans `.env.local` sont correctes
2. Redémarrer l'application Next.js

### Upload de documents échoue

1. Vérifier que le service ecpmr est lancé :
   ```bash
   curl http://localhost:3009/health
   ```

2. Vérifier la taille du fichier (limite 10MB par défaut)

3. Vérifier le format du fichier (PDF ou images pour CMR/POD, images pour PHOTO)

## Commandes utiles

```bash
# Installer les dépendances
pnpm install

# Lancer en dev
pnpm dev

# Build pour production
pnpm build

# Lancer en production
pnpm start

# Linter le code
pnpm lint

# Nettoyer
rm -rf .next node_modules

# Voir les logs Next.js
# Les logs apparaissent dans le terminal où vous avez lancé pnpm dev
```

## Variables d'environnement

Par défaut, l'application utilise les URLs localhost. Si vos services sont sur d'autres ports :

```bash
# Créer .env.local
cp .env.local.example .env.local

# Éditer .env.local
CORE_ORDERS_URL=http://localhost:3001
PLANNING_URL=http://localhost:3004
ECPMR_URL=http://localhost:3009
VIGILANCE_URL=http://localhost:3002
```

## Raccourcis clavier (à implémenter)

Future feature :
- `Ctrl+K` : Recherche globale
- `Ctrl+1` : Missions en attente
- `Ctrl+2` : Missions acceptées
- `Ctrl+3` : Planning
- `Ctrl+4` : Documents
- `Ctrl+5` : Profil

## Données de démo

### Transporteurs disponibles

| ID | Nom | Email | Statut Vigilance |
|----|-----|-------|------------------|
| CARRIER-A | Demo Transport | carrier-a@example.com | OK |
| CARRIER-B | Transport Express | carrier-b@example.com | OK |
| CARRIER-C | Logistique Pro | carrier-c@example.com | OK |

### Missions types

Les missions sont créées via le service core-orders et dispatchées selon :
- La politique de dispatch (chain)
- Le statut vigilance du transporteur
- Le SLA (2h par défaut)

### Créneaux RDV

Le service planning génère des créneaux :
- 08:00, 10:00, 12:00, 14:00, 16:00
- 7 jours à l'avance
- Disponibilité aléatoire en mode démo

## Problèmes courants

### Port 3100 déjà utilisé

```bash
# Changer le port dans package.json
"dev": "next dev -p 3200"
```

### Services backend non lancés

```bash
# Vérifier les processus
ps aux | grep node

# Tuer les processus si besoin
pkill -f "node.*services"

# Relancer
pnpm agents
```

### Cache Next.js corrompu

```bash
rm -rf .next
pnpm dev
```

## Mode production

### Build

```bash
pnpm build
```

### Lancer

```bash
pnpm start
```

### Variables d'environnement production

Créer `.env.production.local` :

```env
CORE_ORDERS_URL=https://api.rt-technologie.com/orders
PLANNING_URL=https://api.rt-technologie.com/planning
ECPMR_URL=https://api.rt-technologie.com/ecpmr
VIGILANCE_URL=https://api.rt-technologie.com/vigilance
JWT_SECRET=production-secret-key-very-secure
```

## Support

**Documentation complète** : Voir `README.md`
**API** : Voir `API.md`
**Développement** : Voir `DEVELOPMENT.md`

**Problèmes** : Créer une issue sur GitHub

---

**Bon développement ! 🚚**
