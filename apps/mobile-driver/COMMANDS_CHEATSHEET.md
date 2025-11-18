# Commands Cheatsheet - RT Driver

Guide de référence rapide pour toutes les commandes du projet.

## PWA - Progressive Web App

### Développement

```bash
# Installer les dépendances
pnpm install

# Lancer le serveur de développement
pnpm dev

# Build production
pnpm build

# Tester le build production localement
pnpm start

# Linter
pnpm lint

# Fixer automatiquement les erreurs de lint
pnpm lint:fix

# Analyser le bundle
pnpm analyze
```

### Tests

```bash
# Tests unitaires
pnpm test

# Tests unitaires en mode watch
pnpm test:watch

# Coverage des tests
pnpm test:coverage

# Tests E2E
pnpm test:e2e

# Tests E2E avec UI
pnpm test:e2e:ui
```

### Déploiement

```bash
# Déployer sur Vercel (production)
vercel --prod

# Déployer sur Vercel (preview)
vercel

# Vérifier les variables d'environnement
vercel env ls

# Ajouter une variable d'environnement
vercel env add NEXT_PUBLIC_API_KEY

# Pull les variables d'environnement
vercel env pull
```

### Maintenance

```bash
# Mettre à jour les dépendances
pnpm update

# Vérifier les dépendances obsolètes
pnpm outdated

# Nettoyer node_modules et .next
rm -rf node_modules .next
pnpm install

# Vérifier la sécurité des dépendances
pnpm audit

# Fixer les vulnérabilités
pnpm audit fix
```

## Android - Application Native

### Développement

```bash
# Naviguer vers le projet Android
cd apps/mobile-driver/android

# Sync Gradle
./gradlew sync

# Clean build
./gradlew clean

# Build debug APK
./gradlew assembleDebug

# Build release APK
./gradlew assembleRelease

# Build release AAB (pour Play Store)
./gradlew bundleRelease

# Installer sur appareil connecté
./gradlew installDebug
```

### Tests

```bash
# Tests unitaires
./gradlew test

# Tests instrumentés (sur device/émulateur)
./gradlew connectedAndroidTest

# Tous les tests
./gradlew connectedCheck

# Lint
./gradlew lint

# Format code
./gradlew ktlintFormat
```

### Analyse

```bash
# Générer rapport de dépendances
./gradlew dependencies

# Analyser la taille de l'APK
./gradlew assembleRelease
# Puis : Build > Analyze APK dans Android Studio

# Vérifier les fuites mémoire
./gradlew leakCanary
```

### Déploiement

```bash
# Signer l'APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 \
  -keystore rt-driver.keystore \
  app-release-unsigned.apk rt-driver-key

# Zipalign
zipalign -v 4 app-release-unsigned.apk app-release.apk

# Upload sur Play Console (manuel)
# OU via Gradle Play Publisher plugin:
./gradlew publishReleaseBundle
```

## iOS - Application Native

### Développement

```bash
# Naviguer vers le projet iOS
cd apps/mobile-driver/ios

# Installer les dépendances CocoaPods
pod install

# Mettre à jour les pods
pod update

# Ouvrir dans Xcode
open MobileDriver.xcworkspace

# Build depuis la ligne de commande
xcodebuild -workspace MobileDriver.xcworkspace \
  -scheme MobileDriver \
  -configuration Debug

# Run sur simulateur
xcodebuild -workspace MobileDriver.xcworkspace \
  -scheme MobileDriver \
  -destination 'platform=iOS Simulator,name=iPhone 15 Pro' \
  build
```

### Tests

```bash
# Tests unitaires
xcodebuild test -workspace MobileDriver.xcworkspace \
  -scheme MobileDriver \
  -destination 'platform=iOS Simulator,name=iPhone 15 Pro'

# Tests UI
xcodebuild test -workspace MobileDriver.xcworkspace \
  -scheme MobileDriverUITests \
  -destination 'platform=iOS Simulator,name=iPhone 15 Pro'

# Coverage
xcodebuild test -workspace MobileDriver.xcworkspace \
  -scheme MobileDriver \
  -enableCodeCoverage YES
```

### Analyse

```bash
# SwiftLint
swiftlint

# SwiftLint auto-fix
swiftlint autocorrect

# Analyser les dépendances
pod dependencies
```

### Déploiement

```bash
# Archive (depuis Xcode)
# Product > Archive

# Upload vers App Store Connect (depuis Xcode)
# Window > Organizer > Distribute App

# OU via Fastlane:
fastlane beta    # TestFlight
fastlane release # App Store
```

## Git - Gestion de Version

### Branches

```bash
# Créer une branche feature
git checkout -b feature/nom-feature

# Créer une branche fix
git checkout -b fix/nom-bug

# Basculer sur une branche
git checkout main

# Lister les branches
git branch -a

# Supprimer une branche locale
git branch -d feature/nom-feature

# Supprimer une branche distante
git push origin --delete feature/nom-feature
```

### Commits

```bash
# Ajouter tous les fichiers modifiés
git add .

# Ajouter un fichier spécifique
git add apps/mobile-driver/pwa/src/app/page.tsx

# Commiter avec message
git commit -m "feat: ajouter page de tracking GPS"

# Amender le dernier commit
git commit --amend

# Voir l'historique
git log --oneline --graph --all
```

### Synchronisation

```bash
# Récupérer les changements
git fetch origin

# Pull les changements
git pull origin main

# Push les changements
git push origin feature/nom-feature

# Force push (ATTENTION)
git push origin feature/nom-feature --force
```

### Tags

```bash
# Créer un tag
git tag v1.0.0

# Créer un tag annoté
git tag -a v1.0.0 -m "Release version 1.0.0"

# Push un tag
git push origin v1.0.0

# Push tous les tags
git push origin --tags

# Lister les tags
git tag -l
```

## Docker (si applicable)

### Build

```bash
# Build l'image PWA
docker build -t rt-driver-pwa:latest -f apps/mobile-driver/pwa/Dockerfile .

# Build avec cache
docker build --cache-from rt-driver-pwa:latest -t rt-driver-pwa:latest .
```

### Run

```bash
# Run en mode dev
docker run -p 3110:3110 rt-driver-pwa:latest

# Run en mode prod
docker run -p 3000:3000 -e NODE_ENV=production rt-driver-pwa:latest

# Run en background
docker run -d -p 3110:3110 --name rt-driver rt-driver-pwa:latest
```

### Gestion

```bash
# Lister les conteneurs
docker ps -a

# Arrêter un conteneur
docker stop rt-driver

# Supprimer un conteneur
docker rm rt-driver

# Voir les logs
docker logs rt-driver

# Suivre les logs en temps réel
docker logs -f rt-driver
```

## Database (si applicable)

### Migrations

```bash
# Créer une migration
npx prisma migrate dev --name add_drivers_table

# Appliquer les migrations
npx prisma migrate deploy

# Reset la database
npx prisma migrate reset

# Générer le client Prisma
npx prisma generate
```

### Seeds

```bash
# Seed la database
npx prisma db seed

# Reset et seed
npx prisma migrate reset --skip-seed
npx prisma db seed
```

## Monitoring et Debugging

### Lighthouse

```bash
# Analyser la performance
npx lighthouse http://localhost:3110 --view

# Générer un rapport JSON
npx lighthouse http://localhost:3110 --output=json --output-path=./report.json

# PWA audit
npx lighthouse http://localhost:3110 --only-categories=pwa --view
```

### Bundle Analyzer

```bash
# Analyser le bundle Next.js
ANALYZE=true pnpm build

# Analyser avec webpack-bundle-analyzer
npx webpack-bundle-analyzer .next/analyze/client.json
```

### Performance

```bash
# Profiler React (production)
NODE_ENV=production pnpm build
pnpm start

# Puis dans Chrome DevTools: Profiler tab

# Analyser les Core Web Vitals
npx web-vitals-report http://localhost:3110
```

## CI/CD - GitHub Actions

### Workflows

```bash
# Déclencher un workflow manuellement
gh workflow run deploy-pwa.yml

# Lister les workflows
gh workflow list

# Voir les runs
gh run list

# Voir les détails d'un run
gh run view 123456789

# Télécharger les artifacts
gh run download 123456789
```

## Utilitaires

### Formatage de code

```bash
# Prettier (PWA)
pnpm prettier --write "**/*.{ts,tsx,js,jsx,json,md}"

# Vérifier le formatage
pnpm prettier --check "**/*.{ts,tsx,js,jsx,json,md}"
```

### Type checking

```bash
# TypeScript
pnpm tsc --noEmit

# TypeScript en mode watch
pnpm tsc --noEmit --watch
```

### Génération

```bash
# Générer un nouveau composant
npx generate-react-cli component Button

# Générer une nouvelle page
npx generate-react-cli page Dashboard

# Générer des icônes PWA
npx pwa-asset-generator logo.svg ./public/icons
```

## Nettoyage

### PWA

```bash
# Supprimer node_modules et lock
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Supprimer .next et rebuilder
rm -rf .next
pnpm build

# Nettoyer le cache Vercel
vercel --force

# Nettoyer complètement
rm -rf node_modules .next pnpm-lock.yaml
pnpm install
pnpm build
```

### Android

```bash
# Clean Gradle
./gradlew clean

# Supprimer le cache Gradle
rm -rf ~/.gradle/caches/

# Clean et rebuild
./gradlew clean build
```

### iOS

```bash
# Clean build
xcodebuild clean

# Supprimer DerivedData
rm -rf ~/Library/Developer/Xcode/DerivedData

# Deintegrate et reinstall pods
pod deintegrate
pod install
```

## Astuces

### Recherche rapide

```bash
# Chercher dans tous les fichiers TypeScript
grep -r "useGeolocation" apps/mobile-driver/pwa/src --include="*.ts" --include="*.tsx"

# Chercher et remplacer
find apps/mobile-driver/pwa/src -name "*.tsx" -exec sed -i 's/oldText/newText/g' {} +

# Compter les lignes de code
find apps/mobile-driver/pwa/src -name "*.ts" -o -name "*.tsx" | xargs wc -l
```

### Benchmarking

```bash
# Temps de build
time pnpm build

# Taille du bundle
du -sh .next

# Nombre de fichiers
find apps/mobile-driver -type f | wc -l
```

### Debugging

```bash
# Node avec debugger
node --inspect-brk node_modules/.bin/next dev

# Ensuite dans Chrome: chrome://inspect

# Verbose logging
DEBUG=* pnpm dev

# Next.js verbose
NEXT_DEBUG=1 pnpm dev
```

## Raccourcis VS Code

| Raccourci | Action |
|-----------|--------|
| `Ctrl+Shift+P` | Command Palette |
| `Ctrl+P` | Quick Open File |
| `Ctrl+Shift+F` | Search in Files |
| `F5` | Start Debugging |
| `Ctrl+K Ctrl+S` | Keyboard Shortcuts |

## Raccourcis Chrome DevTools

| Raccourci | Action |
|-----------|--------|
| `F12` | Toggle DevTools |
| `Ctrl+Shift+C` | Inspect Element |
| `Ctrl+Shift+I` | DevTools |
| `Ctrl+Shift+J` | Console |
| `Ctrl+R` | Reload |
| `Ctrl+Shift+R` | Hard Reload |

---

**Tip**: Bookmarkez cette page pour un accès rapide aux commandes !

Pour plus de détails, consultez :
- [QUICK_START.md](./QUICK_START.md)
- [DEPLOYMENT.md](./docs/DEPLOYMENT.md)
- [README.md](./README.md)
