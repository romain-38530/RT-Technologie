# RT Driver - Application Mobile Conducteur

Application mobile multiplateforme pour les conducteurs de transport routier RT Technologie.

## Aperçu

RT Driver est une solution complète de gestion de missions pour conducteurs, disponible sur trois plateformes :

- **PWA (Progressive Web App)** - Solution web progressive fonctionnant sur tous les navigateurs
- **Android** - Application native pour smartphones et tablettes Android
- **iOS** - Application native pour iPhone et iPad

## Fonctionnalités principales

### Phase 1 - Fondations (Implémentée)

- **Authentification double**
  - Login classique pour conducteurs salariés
  - Scan QR code pour sous-traitants (accès instantané)

- **Tracking GPS temps réel**
  - Position envoyée toutes les 15 secondes
  - Calcul d'ETA dynamique avec TomTom
  - Mode background pour suivi continu

- **Géofencing automatique**
  - Détection d'arrivée aux points (rayon 200m)
  - Transitions de statut automatiques
  - Alertes de déviation

- **Signatures électroniques**
  - Signature tactile au chargement
  - Signature tactile à la livraison
  - Signature par QR code (sans contact)
  - Horodatage et géolocalisation

- **Gestion documentaire**
  - Scan de documents (BL, CMR, douanes)
  - Photos avec amélioration automatique
  - Déclaration de réserves avec photos
  - Stockage cloud sécurisé

- **Mode hors ligne**
  - Fonctionnement complet sans réseau
  - File de synchronisation intelligente
  - Reprise automatique au retour du réseau

### Phase 2 - Enrichissement (À venir)

- Chat temps réel conducteur ↔ logisticien
- Historique détaillé avec statistiques
- Instructions enrichies (photos accès, réservation quai)
- Notifications push avancées

### Phase 3 - Excellence (À venir)

- Internationalisation (EN, ES, DE)
- Mode sombre
- Analytics de performance
- Optimisations batterie avancées

## Structure du projet

```
apps/mobile-driver/
├── pwa/                          # Progressive Web App (Next.js)
│   ├── src/
│   │   ├── app/                  # Pages Next.js
│   │   ├── lib/                  # Logique métier
│   │   └── components/           # Composants React
│   ├── public/                   # Assets statiques
│   └── package.json
│
├── android/                      # Application Android native
│   ├── app/
│   │   └── src/main/java/com/rt/driver/
│   └── build.gradle
│
├── ios/                          # Application iOS native
│   ├── MobileDriver/
│   └── Podfile
│
├── shared/                       # Code partagé
│   ├── models/                   # Modèles TypeScript
│   └── constants/                # Constantes
│
└── docs/                         # Documentation
    ├── ARCHITECTURE_MOBILE.md
    ├── USER_GUIDE_DRIVER.md
    ├── API_INTEGRATION.md
    └── DEPLOYMENT.md
```

## Installation et développement

### PWA

```bash
# Naviguer vers le projet PWA
cd apps/mobile-driver/pwa

# Installer les dépendances
pnpm install

# Copier et configurer les variables d'environnement
cp .env.example .env.local

# Lancer le serveur de développement
pnpm dev

# Ouvrir http://localhost:3110
```

### Android

1. Ouvrir Android Studio
2. Ouvrir `apps/mobile-driver/android`
3. Sync Gradle
4. Run sur émulateur ou device

### iOS

1. Installer les dépendances CocoaPods
   ```bash
   cd apps/mobile-driver/ios
   pod install
   ```
2. Ouvrir `MobileDriver.xcworkspace` avec Xcode
3. Sélectionner un simulateur ou device
4. Build et Run

## Technologies

### PWA
- **Framework** : Next.js 14 (App Router)
- **UI** : React 18 + TypeScript + TailwindCSS
- **Offline** : Service Worker (next-pwa)
- **Storage** : LocalStorage + IndexedDB
- **GPS** : Geolocation API
- **Maps** : Google Maps / Waze
- **QR** : html5-qrcode
- **Signature** : react-signature-canvas

### Android
- **Langage** : Kotlin
- **UI** : Jetpack Compose
- **Network** : Retrofit
- **DB** : Room (SQLite)
- **Maps** : Google Maps + TomTom SDK
- **Camera** : CameraX + MLKit

### iOS
- **Langage** : Swift
- **UI** : SwiftUI
- **Network** : Alamofire
- **DB** : CoreData
- **Maps** : MapKit + TomTom SDK
- **Location** : CoreLocation

## API Backend

L'application communique avec plusieurs microservices :

| Service | Port | Description |
|---------|------|-------------|
| Core Orders | 3001 | Missions et commandes |
| Planning | 3004 | Tracking GPS et ETA |
| eCMR | 3009 | Signatures et documents |
| Notifications | 3002 | Notifications push |

Voir [API_INTEGRATION.md](docs/API_INTEGRATION.md) pour la documentation complète.

## Configuration

### Variables d'environnement PWA

```env
# API Backend
NEXT_PUBLIC_CORE_ORDERS_API=http://localhost:3001
NEXT_PUBLIC_PLANNING_API=http://localhost:3004
NEXT_PUBLIC_ECMR_API=http://localhost:3009
NEXT_PUBLIC_NOTIFICATIONS_API=http://localhost:3002

# TomTom
NEXT_PUBLIC_TOMTOM_API_KEY=your_key_here

# GPS
NEXT_PUBLIC_GPS_INTERVAL=15000
NEXT_PUBLIC_GEOFENCE_RADIUS=200
```

## Déploiement

### PWA (Vercel)

```bash
cd apps/mobile-driver/pwa
vercel --prod
```

### Android (Google Play)

```bash
cd apps/mobile-driver/android
./gradlew bundleRelease
# Upload AAB sur Play Console
```

### iOS (App Store)

1. Xcode > Product > Archive
2. Distribute App > App Store Connect
3. Soumettre pour review

Voir [DEPLOYMENT.md](docs/DEPLOYMENT.md) pour les détails complets.

## Documentation

- [ARCHITECTURE_MOBILE.md](docs/ARCHITECTURE_MOBILE.md) - Architecture technique
- [USER_GUIDE_DRIVER.md](docs/USER_GUIDE_DRIVER.md) - Guide utilisateur conducteur
- [API_INTEGRATION.md](docs/API_INTEGRATION.md) - Documentation API
- [DEPLOYMENT.md](docs/DEPLOYMENT.md) - Guide de déploiement

## Tests

### PWA

```bash
# Tests unitaires
pnpm test

# Tests E2E
pnpm test:e2e

# Lighthouse audit
pnpm build
npx lighthouse http://localhost:3110 --view
```

### Android

```bash
./gradlew test              # Tests unitaires
./gradlew connectedCheck    # Tests instrumentés
```

### iOS

```bash
xcodebuild test -workspace MobileDriver.xcworkspace \
  -scheme MobileDriver \
  -destination 'platform=iOS Simulator,name=iPhone 15 Pro'
```

## Roadmap

### Q1 2024 - PWA Production Ready
- [x] Authentification complète
- [x] Tracking GPS temps réel
- [x] Signatures électroniques
- [x] Gestion documents
- [x] Mode offline
- [ ] Tests end-to-end
- [ ] Déploiement production

### Q2 2024 - Applications natives
- [ ] Android complet
- [ ] iOS complet
- [ ] Publication stores
- [ ] Chat temps réel

### Q3 2024 - Améliorations
- [ ] Analytics avancées
- [ ] Internationalisation
- [ ] Optimisations performance
- [ ] Features premium

## Contribution

### Workflow Git

```bash
# Créer une branche feature
git checkout -b feature/nom-feature

# Développer et commiter
git add .
git commit -m "feat: description"

# Pousser et créer PR
git push origin feature/nom-feature
```

### Convention de commits

- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `docs:` Documentation
- `style:` Formatage
- `refactor:` Refactoring
- `test:` Tests
- `chore:` Maintenance

## Sécurité

- **Transport** : TLS 1.3 obligatoire
- **Stockage** : Chiffrement AES-256 (natif)
- **Auth** : JWT avec expiration courte
- **Permissions** : Principe du moindre privilège
- **Audit** : Logs complets de toutes les actions

## Performance

### Métriques cibles PWA

- **FCP** : < 1.5s
- **LCP** : < 2.5s
- **TTI** : < 3.5s
- **CLS** : < 0.1
- **Lighthouse** : > 90

### Optimisations

- Code splitting par route
- Lazy loading composants
- Image optimization
- Service Worker intelligent
- Compression gzip/brotli

## Support

- **Email** : support@rt-technologie.fr
- **Téléphone** : +33 1 23 45 67 89
- **Documentation** : https://docs.rt.com
- **Status** : https://status.rt.com

## Licence

Propriétaire - RT Technologie © 2024

## Remerciements

Développé avec :
- Next.js par Vercel
- React par Meta
- TailwindCSS par Tailwind Labs
- TomTom Maps API

---

**Version** : 1.0.0
**Dernière mise à jour** : Novembre 2024
**Statut** : En développement actif
