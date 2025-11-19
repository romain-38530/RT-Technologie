# Guide de Configuration - Développement Local (sans Docker)

Ce guide vous permet de démarrer les applications frontend en mode développement sans utiliser Docker.

## Prérequis

1. **Node.js** (version 18 ou supérieure)
   - Téléchargez sur : https://nodejs.org/
   - Vérifiez l'installation : `node --version`

2. **pnpm** (gestionnaire de paquets)
   - Installation : `npm install -g pnpm`
   - Vérifiez : `pnpm --version`

## Installation

### 1. Installer toutes les dépendances

À la racine du projet, exécutez :

```bash
pnpm install
```

Cette commande installera toutes les dépendances pour :
- Les packages (`packages/*`)
- Les services (`services/*`)
- Les applications (`apps/*`)

### 2. Configuration des variables d'environnement

Le fichier `.env.local` a été créé avec les URLs locales. Vérifiez qu'il contient :

```env
NEXT_PUBLIC_AUTHZ_URL=http://localhost:3007
NEXT_PUBLIC_ADMIN_GATEWAY_URL=http://localhost:3008
# ... etc
```

## Démarrage des Applications Frontend

### Option 1 : Démarrer uniquement le backoffice-admin

```bash
cd apps/backoffice-admin
pnpm dev
```

L'application sera accessible sur : **http://localhost:3000**

### Option 2 : Démarrer une autre application

```bash
# Web Industry
cd apps/web-industry
pnpm dev

# Web Transporter
cd apps/web-transporter
pnpm dev

# Web Logistician
cd apps/web-logistician
pnpm dev
```

### Option 3 : Démarrer toutes les applications en parallèle

À la racine du projet :

```bash
pnpm dev
```

Cela démarrera toutes les apps et services configurés dans `turbo.json`.

## Applications disponibles

| Application | Port | URL | Description |
|-------------|------|-----|-------------|
| backoffice-admin | 3000 | http://localhost:3000 | Administration backoffice |
| web-industry | 3001 | http://localhost:3001 | Portail industrie |
| web-transporter | 3010 | http://localhost:3010 | Portail transporteur |
| web-logistician | 3020 | http://localhost:3020 | Portail logisticien |
| web-forwarder | 3030 | http://localhost:3030 | Portail transitaire |
| web-recipient | 3040 | http://localhost:3040 | Portail destinataire |
| web-supplier | 3050 | http://localhost:3050 | Portail fournisseur |

## Services Backend (Optionnel)

Si vous voulez également tester les appels API localement, vous devrez démarrer les services backend :

```bash
# Démarrer tous les services
pnpm agents

# Ou démarrer un service spécifique
cd services/admin-gateway
pnpm dev
```

**Note** : Les services backend nécessitent MongoDB. Si vous n'avez pas MongoDB local, les applications frontend fonctionneront mais les appels API échoueront.

## Résolution des problèmes courants

### Erreur "Module not found"

```bash
# Réinstaller les dépendances
rm -rf node_modules
pnpm install
```

### Erreur "Port déjà utilisé"

Si un port est déjà occupé, vous pouvez :

1. Trouver et arrêter le processus :
   ```powershell
   # Windows PowerShell
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

2. Ou changer le port dans le fichier `.env.local`

### Erreur de compilation TypeScript

```bash
# Vérifier les erreurs
cd apps/backoffice-admin
pnpm tsc --noEmit
```

## Mode Développement Rapide (Frontend uniquement)

Si vous voulez juste voir l'interface sans backend :

```bash
# 1. Aller dans l'application
cd apps/backoffice-admin

# 2. Démarrer en mode dev
pnpm dev
```

Les appels API échoueront, mais vous verrez l'interface et pourrez :
- Tester les composants UI
- Vérifier le design
- Naviguer entre les pages
- Tester les formulaires (côté client)

## Commandes utiles

```bash
# Installer les dépendances
pnpm install

# Démarrer en mode dev
pnpm dev

# Build pour production
pnpm build

# Linter
pnpm lint

# Tests
pnpm test

# Démarrer seulement les services backend
pnpm agents
```

## Next Steps

Une fois le frontend fonctionnel, vous pourrez :
1. Développer de nouvelles fonctionnalités
2. Corriger les bugs UI
3. Tester les intégrations
4. Préparer pour la production
