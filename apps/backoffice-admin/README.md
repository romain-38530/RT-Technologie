# Backoffice Admin - RT Technologie

Application d'administration pour la plateforme RT Technologie.

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+
- pnpm (ou npm)

### Installation

1. **À la racine du monorepo** :
   ```bash
   pnpm install
   ```

2. **Démarrer l'application** :
   ```bash
   cd apps/backoffice-admin
   pnpm dev
   ```

3. **Ouvrir dans le navigateur** :
   ```
   http://localhost:3000
   ```

## 📁 Structure du projet

```
backoffice-admin/
├── pages/               # Pages Next.js
│   ├── _app.tsx        # Application wrapper
│   ├── index.tsx       # Page d'accueil
│   ├── login.tsx       # Authentification
│   ├── health.tsx      # État des services
│   ├── pricing.tsx     # Gestion des tarifs
│   ├── palettes.tsx    # Gestion des palettes
│   ├── orgs/           # Gestion des organisations
│   └── storage-market/ # Bourse de stockage
├── components/         # Composants React
│   ├── Layout.tsx      # Layout principal
│   ├── SEO.tsx         # Composant SEO
│   └── ui/             # Composants UI réutilisables
├── lib/                # Utilitaires et API clients
│   └── api/            # Clients API
├── styles/             # Styles CSS
└── public/             # Assets statiques
```

## 🔧 Configuration

### Variables d'environnement

Le fichier `.env.local` contient la configuration pour le développement local :

```env
NEXT_PUBLIC_AUTHZ_URL=http://localhost:3007
NEXT_PUBLIC_ADMIN_GATEWAY_URL=http://localhost:3008
NEXT_PUBLIC_PALETTE_API_URL=http://localhost:3011
NEXT_PUBLIC_STORAGE_MARKET_API_URL=http://localhost:3013
```

### Dépendances

- **Next.js 14** - Framework React
- **React 18** - Bibliothèque UI
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS
- **@rt/design-system** - Design system interne
- **@rt/chatbot-widget** - Widget de chat

## 📄 Pages disponibles

| Route | Description |
|-------|-------------|
| `/` | Page d'accueil avec présentation |
| `/login` | Authentification administrateur |
| `/health` | État de santé des services |
| `/pricing` | Gestion des plans tarifaires |
| `/palettes` | Administration des palettes Europe |
| `/orgs` | Liste des organisations |
| `/orgs/[id]` | Détails d'une organisation |
| `/orgs/[id]/invitations` | Gestion des invitations transporteurs |
| `/storage-market` | Dashboard bourse de stockage |
| `/storage-market/logisticians` | Gestion des logisticiens |

## 🧪 Développement

### Commandes disponibles

```bash
# Démarrer en mode dev
pnpm dev

# Build pour production
pnpm build

# Démarrer en production
pnpm start

# Linter TypeScript
pnpm tsc --noEmit
```

### Mode développement sans backend

L'application peut démarrer sans les services backend. Dans ce cas :
- ✅ L'interface sera visible
- ❌ Les appels API échoueront
- ⚠️ Certaines pages afficheront des erreurs de chargement

C'est utile pour :
- Développer l'UI
- Tester les composants
- Vérifier le design
- Corriger les bugs d'affichage

## 🔐 Authentification

Pour tester l'authentification en local :

1. Démarrer le service `authz` :
   ```bash
   cd services/authz
   pnpm dev
   ```

2. Utiliser les credentials de démo :
   - Email : `admin@example.com`
   - Clé admin : valeur de `AUTHZ_ADMIN_API_KEY` dans `.env` (par défaut : `change-me-admin-key`)

## 🐛 Débogage

### Problèmes courants

**Port 3000 déjà utilisé**
```powershell
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Erreur "Module not found"**
```bash
rm -rf node_modules
pnpm install
```

**Erreur TypeScript**
```bash
pnpm tsc --noEmit
```

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🤝 Contribution

1. Créer une branche feature
2. Faire vos modifications
3. Tester localement
4. Créer une Pull Request

---

**RT Technologie** - Plateforme logistique intelligente
