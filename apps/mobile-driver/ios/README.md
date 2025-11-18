# RT Driver - iOS Application

Application mobile native iOS pour les conducteurs RT Technologie.

## Structure du projet

```
ios/
├── MobileDriver/
│   ├── AppDelegate.swift                # Point d'entrée
│   ├── SceneDelegate.swift              # Gestion des scènes
│   ├── Auth/                            # Authentification
│   │   ├── LoginView.swift
│   │   └── QRScanView.swift
│   ├── Mission/                         # Gestion des missions
│   │   ├── MissionDashboardView.swift
│   │   ├── MissionTrackingView.swift
│   │   └── MissionViewModel.swift
│   ├── Tracking/                        # GPS & Tracking
│   │   ├── LocationManager.swift
│   │   ├── GeofenceManager.swift
│   │   └── TrackingViewModel.swift
│   ├── Signature/                       # Signatures
│   │   ├── SignatureView.swift
│   │   └── SignaturePadView.swift
│   ├── Documents/                       # Documents
│   │   ├── DocumentsView.swift
│   │   └── DocumentScannerView.swift
│   ├── Services/                        # Services
│   │   ├── APIService.swift
│   │   ├── StorageService.swift
│   │   └── SyncService.swift
│   ├── Models/                          # Modèles de données
│   │   ├── Mission.swift
│   │   ├── Driver.swift
│   │   └── Document.swift
│   ├── Views/                           # Vues réutilisables
│   │   ├── Components/
│   │   └── Styles/
│   ├── Assets.xcassets/                 # Images et couleurs
│   └── Info.plist
├── Podfile
└── MobileDriver.xcworkspace
```

## Technologies

- **Swift 5.9+** : Langage principal
- **SwiftUI** : Framework UI déclaratif
- **Alamofire** : Client HTTP
- **CoreData** : Persistance locale
- **MapKit** : Cartographie Apple
- **TomTom SDK** : Navigation et routage
- **AVFoundation** : Caméra et scan
- **CoreLocation** : Géolocalisation
- **BackgroundTasks** : Tâches en arrière-plan
- **Combine** : Programmation réactive

## Prérequis

- Xcode 15.0 ou supérieur
- macOS 13.0+ (Ventura)
- iOS 15.0+ pour le déploiement
- CocoaPods ou Swift Package Manager

## Installation

1. Cloner le repository
2. Installer les dépendances :
```bash
cd ios
pod install
```

3. Ouvrir le workspace :
```bash
open MobileDriver.xcworkspace
```

4. Configurer les variables d'environnement dans `Config.xcconfig` :
```
API_CORE_ORDERS = http://localhost:3001
API_PLANNING = http://localhost:3004
API_ECMR = http://localhost:3009
TOMTOM_API_KEY = your_tomtom_api_key
```

## Build

### Debug
1. Sélectionner le scheme `MobileDriver`
2. Choisir un simulateur ou appareil
3. Appuyer sur `Cmd + R`

### Release
1. Sélectionner le scheme `MobileDriver`
2. Product > Archive
3. Distribute App

## Fonctionnalités à implémenter

### Phase 1 - Fondations
- [x] Structure du projet
- [ ] Authentification (Login + QR Scan)
- [ ] Dashboard missions
- [ ] Tracking GPS temps réel
- [ ] Mise à jour statuts

### Phase 2 - Fonctionnalités avancées
- [ ] Signature électronique
- [ ] Scan documents
- [ ] Mode hors ligne
- [ ] Géofencing
- [ ] ETA avec TomTom

### Phase 3 - Polish
- [ ] Notifications push
- [ ] Optimisation batterie
- [ ] Tests unitaires
- [ ] Localisation

## Architecture

Application suivant l'architecture MVVM avec Combine :

- **Views** : SwiftUI views
- **ViewModels** : ObservableObject avec @Published
- **Models** : Structs Codable
- **Services** : Singleton services
- **Repositories** : Abstraction des sources de données

## Permissions requises (Info.plist)

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>Nous avons besoin de votre localisation pour suivre votre mission</string>

<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>Nous suivons votre position même en arrière-plan pour calculer l'ETA</string>

<key>NSCameraUsageDescription</key>
<string>Nous avons besoin d'accéder à la caméra pour scanner les QR codes et documents</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>Nous avons besoin d'accéder à vos photos pour joindre des documents</string>

<key>UIBackgroundModes</key>
<array>
    <string>location</string>
    <string>fetch</string>
</array>
```

## Configuration de signature

1. Ouvrir Xcode
2. Sélectionner le projet MobileDriver
3. Aller dans Signing & Capabilities
4. Sélectionner votre équipe de développement
5. Xcode générera automatiquement un provisioning profile

## Distribution

### TestFlight
1. Archive l'application
2. Upload vers App Store Connect
3. Configurer les testeurs internes/externes
4. Soumettre pour review

### App Store
1. Configurer App Store Connect
2. Ajouter captures d'écran (6.5" et 5.5")
3. Remplir les métadonnées
4. Soumettre pour review Apple

## Optimisation batterie

- Utiliser `CLLocationManager.allowsBackgroundLocationUpdates` avec précaution
- Ajuster `desiredAccuracy` selon le besoin
- Utiliser `CLLocationManager.pausesLocationUpdatesAutomatically`
- Implémenter la déférence des mises à jour GPS

## Tests

### Tests unitaires
```bash
xcodebuild test -workspace MobileDriver.xcworkspace -scheme MobileDriver -destination 'platform=iOS Simulator,name=iPhone 15 Pro'
```

### Tests UI
Utiliser XCTest pour les tests d'interface utilisateur.

## Notes de développement

- Utiliser async/await pour les appels réseau
- Implémenter le tracking GPS avec Background Mode
- Stocker les données sensibles dans Keychain
- Utiliser BackgroundTasks pour la synchronisation
- Respecter les Human Interface Guidelines

## Ressources

- [SwiftUI Documentation](https://developer.apple.com/documentation/swiftui)
- [CoreLocation](https://developer.apple.com/documentation/corelocation)
- [TomTom iOS SDK](https://developer.tomtom.com/ios/maps/documentation)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
