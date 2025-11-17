# Quick Start Guide - Web Logistician

## 🚀 Démarrage rapide (5 minutes)

### 1. Installation

```bash
# Aller dans le dossier de l'application
cd apps/web-logistician

# Installer les dépendances
pnpm install
```

### 2. Configuration

```bash
# Copier le fichier d'environnement
cp .env.example .env.local

# Éditer avec vos URLs d'API (optionnel pour le dev)
# Les valeurs par défaut pointent vers localhost
```

### 3. Lancer l'application

```bash
# Mode développement
pnpm dev

# L'application est accessible sur :
# http://localhost:3106
```

### 4. Se connecter

```
Email : n'importe quel email valide
Mot de passe : n'importe quel mot de passe

(L'authentification utilise des données mock en développement)
```

### 5. Explorer les fonctionnalités

Après connexion, vous accédez au **Dashboard** avec accès à :

- 🏢 **Quais** : Planning et gestion des 8 quais
- 📋 **E-CMR** : CMR électroniques avec signature
- 📦 **Réceptions** : Contrôle qualité des arrivées
- 🚚 **Expéditions** : Préparation et départ
- ⚠️ **Anomalies** : Déclaration d'incidents
- 📷 **Scanner** : Codes-barres (simulation)

## 📱 Tester sur mobile/tablette

### Option 1 : Avec tunnel (ngrok/localtunnel)

```bash
# Installer ngrok
npm install -g ngrok

# Créer un tunnel
ngrok http 3106

# Utiliser l'URL HTTPS générée sur votre mobile
```

### Option 2 : Avec réseau local

```bash
# Trouver votre IP locale
# Windows : ipconfig
# Mac/Linux : ifconfig

# Accéder depuis mobile/tablette :
# http://[VOTRE_IP]:3106
# Exemple : http://192.168.1.100:3106
```

## 🧪 Données de test

L'application utilise des données mock pour faciliter le développement :

### Commandes mock
- ORD-001, ORD-002, ORD-003, etc.

### Quais
- D1 à D8 (8 quais)
- États : Disponible, Occupé, Maintenance

### E-CMR
- ECMR-001, ECMR-002, ECMR-003

### Réceptions
- RCP-001, RCP-002, RCP-003, RCP-004

### Expéditions
- EXP-001, EXP-002, EXP-003, EXP-004

### Anomalies
- ANO-001, ANO-002, ANO-003, ANO-004

## 🎯 Fonctionnalités à tester

### 1. Planning des quais (`/docks`)
- ✅ Voir l'état des 8 quais
- ✅ Confirmer l'arrivée d'un transporteur
- ✅ Libérer un quai occupé
- ✅ Filtrer par date

### 2. E-CMR (`/ecmr`)
- ✅ Créer un nouveau CMR
- ✅ Signer avec le doigt (Canvas)
- ✅ Effacer et refaire la signature
- ✅ Filtrer par statut

### 3. Réceptions (`/receptions`)
- ✅ Démarrer une réception
- ✅ Compter les palettes
- ✅ Prendre des photos (caméra)
- ✅ Ajouter des notes
- ✅ Détecter automatiquement les anomalies

### 4. Expéditions (`/expeditions`)
- ✅ Préparer une expédition
- ✅ Contrôler le chargement
- ✅ Prendre des photos avant départ
- ✅ Confirmer le départ
- ✅ Détecter les anomalies

### 5. Anomalies (`/anomalies`)
- ✅ Déclarer un incident
- ✅ Choisir le type et la gravité
- ✅ Ajouter photos et description
- ✅ Sélectionner parties impactées
- ✅ Filtrer par statut

### 6. Scanner (`/scanner`)
- ✅ Activer la caméra
- ✅ Saisir un code manuellement
- ✅ Simuler un scan (bouton dev)
- ✅ Redirection automatique

## 🔧 Commandes utiles

```bash
# Développement
pnpm dev              # Lancer en mode dev (port 3106)
pnpm build            # Build pour production
pnpm start            # Lancer la version de production

# Qualité du code
pnpm lint             # Vérifier le code (si configuré)
tsc --noEmit          # Vérifier les types TypeScript

# Nettoyage
rm -rf .next          # Nettoyer le build
rm -rf node_modules   # Nettoyer les dépendances
pnpm install          # Réinstaller
```

## 🐛 Problèmes courants

### Port 3106 déjà utilisé

```bash
# Windows
netstat -ano | findstr :3106
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3106 | xargs kill -9

# Ou changer le port dans package.json
"dev": "next dev -p 3107"
```

### Module non trouvé

```bash
# Réinstaller les dépendances
rm -rf node_modules
pnpm install
```

### Caméra ne fonctionne pas

- ⚠️ HTTPS obligatoire (sauf localhost)
- ✅ Utiliser ngrok pour tunnel HTTPS
- ✅ Ou utiliser la saisie manuelle alternative

### Signature ne s'affiche pas

- Vérifier la console (F12)
- Le Canvas doit être correctement initialisé
- Rafraîchir la page

## 📊 Performance

L'application est optimisée pour :
- **First Load** : < 2s
- **Time to Interactive** : < 3s
- **Bundle Size** : ~200KB (gzipped)

## 🎨 Personnalisation

### Changer les couleurs

Éditer les couleurs dans `pages/_app.tsx` :
```typescript
// Couleur principale
background: '#2563eb'  // Bleu par défaut

// Autres couleurs
'#10b981'  // Vert (succès)
'#f59e0b'  // Orange (warning)
'#ef4444'  // Rouge (erreur)
```

### Changer le logo

Remplacer l'emoji dans `pages/login.tsx` :
```typescript
<div style={{ fontSize: '48px' }}>📦</div>
```

### Ajouter une page

1. Créer `pages/ma-page.tsx`
2. Ajouter le lien dans `pages/_app.tsx`
3. Implémenter la logique

## 📚 Documentation complète

- **README.md** : Documentation utilisateur
- **ARCHITECTURE.md** : Architecture technique
- **DEPLOYMENT.md** : Guide de déploiement
- **SUMMARY.md** : Résumé du projet

## 💡 Tips & Astuces

### DevTools mobile

Pour débugger sur mobile :
1. Chrome DevTools > More tools > Remote devices
2. Connecter device en USB
3. Activer USB debugging
4. Inspecter l'app

### Hot Reload

Next.js supporte le Hot Module Replacement :
- Sauvegardez un fichier
- L'app se recharge automatiquement
- L'état est préservé (Fast Refresh)

### PWA en développement

Par défaut, le PWA est désactivé en dev.
Pour tester :
```bash
pnpm build
pnpm start
```

### Mock API calls

Les calls API sont simulés avec `console.log()`.
Pour intégrer vraies APIs :
1. Démarrer les services backend
2. Vérifier les URLs dans `.env.local`
3. Remplacer les `console.log()` par vrais appels

## 🎓 Formation

### Pour les développeurs

1. Lire ARCHITECTURE.md
2. Explorer le code des pages
3. Tester chaque fonctionnalité
4. Modifier et voir les changements

### Pour les utilisateurs finaux

1. Tester sur tablette/mobile
2. Essayer le mode hors-ligne (couper le wifi)
3. Tester la caméra et la signature
4. Donner du feedback

## 🚀 Passer en production

Voir le guide complet dans **DEPLOYMENT.md**

Quick version :
```bash
# Build
pnpm build

# Deploy sur Vercel
vercel --prod

# Ou Docker
docker build -t web-logistician .
docker run -p 3106:3106 web-logistician
```

## 📞 Besoin d'aide ?

- 📧 Email : support@rt-technologie.com
- 📖 Docs : https://docs.rt-technologie.com
- 💬 Slack : #web-logistician

---

**Bon développement ! 🎉**
