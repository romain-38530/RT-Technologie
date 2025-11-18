# RT Driver - Android Application

Application mobile native Android pour les conducteurs RT Technologie.

## Structure du projet

```
android/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/rt/driver/
│   │   │   │   ├── MainActivity.kt              # Point d'entrée
│   │   │   │   ├── auth/                        # Authentification
│   │   │   │   │   ├── LoginScreen.kt
│   │   │   │   │   └── QRScanScreen.kt
│   │   │   │   ├── mission/                     # Gestion des missions
│   │   │   │   │   ├── MissionDashboard.kt
│   │   │   │   │   ├── MissionTracking.kt
│   │   │   │   │   └── MissionViewModel.kt
│   │   │   │   ├── tracking/                    # GPS & Tracking
│   │   │   │   │   ├── LocationService.kt
│   │   │   │   │   ├── GeofenceManager.kt
│   │   │   │   │   └── TrackingViewModel.kt
│   │   │   │   ├── signature/                   # Signatures
│   │   │   │   │   ├── SignatureScreen.kt
│   │   │   │   │   └── SignaturePad.kt
│   │   │   │   ├── documents/                   # Documents
│   │   │   │   │   ├── DocumentsScreen.kt
│   │   │   │   │   └── DocumentScanner.kt
│   │   │   │   ├── data/                        # Data layer
│   │   │   │   │   ├── api/
│   │   │   │   │   ├── database/
│   │   │   │   │   └── repository/
│   │   │   │   └── ui/                          # UI components
│   │   │   │       ├── theme/
│   │   │   │       ├── components/
│   │   │   │       └── navigation/
│   │   │   ├── res/
│   │   │   └── AndroidManifest.xml
│   │   └── test/
│   └── build.gradle
└── gradle.properties
```

## Technologies

- **Kotlin** : Langage principal
- **Jetpack Compose** : UI moderne et déclarative
- **Retrofit** : Client HTTP pour API REST
- **Room** : Base de données locale SQLite
- **Google Maps SDK** : Cartographie
- **TomTom SDK** : Navigation et calcul d'itinéraire
- **CameraX** : Caméra et scan de documents
- **MLKit** : Reconnaissance QR codes
- **WorkManager** : Tâches en arrière-plan
- **Coroutines** : Programmation asynchrone

## Prérequis

- Android Studio Hedgehog ou supérieur
- JDK 17
- Android SDK 24+ (Android 7.0+)
- Gradle 8.0+

## Configuration

1. Créer un fichier `local.properties` :
```properties
sdk.dir=/path/to/Android/sdk
```

2. Créer un fichier `secrets.properties` :
```properties
TOMTOM_API_KEY=your_tomtom_api_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

3. Configurer les URLs d'API dans `app/src/main/res/values/strings.xml` :
```xml
<resources>
    <string name="api_core_orders">http://10.0.2.2:3001</string>
    <string name="api_planning">http://10.0.2.2:3004</string>
    <string name="api_ecmr">http://10.0.2.2:3009</string>
</resources>
```

## Build

### Debug
```bash
./gradlew assembleDebug
```

### Release
```bash
./gradlew assembleRelease
```

### Installer sur un appareil
```bash
./gradlew installDebug
```

## Fonctionnalités à implémenter

### Phase 1 - Fondations
- [x] Structure du projet
- [ ] Authentification (Login + QR Scan)
- [ ] Écran dashboard missions
- [ ] Tracking GPS en temps réel
- [ ] Mise à jour des statuts

### Phase 2 - Fonctionnalités avancées
- [ ] Signature électronique
- [ ] Scan de documents
- [ ] Mode hors ligne avec synchronisation
- [ ] Géofencing automatique
- [ ] Calcul d'ETA avec TomTom

### Phase 3 - Polish
- [ ] Notifications push
- [ ] Optimisation batterie
- [ ] Tests unitaires et UI
- [ ] Internationalisation

## Architecture

L'application suit l'architecture MVVM (Model-View-ViewModel) recommandée par Google :

- **View** : Composables Jetpack Compose
- **ViewModel** : Gestion de l'état et logique métier
- **Repository** : Abstraction des sources de données
- **Data Sources** : API réseau + Base de données locale

## Permissions requises

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION" />
```

## Notes de développement

- Utiliser Kotlin Coroutines pour toutes les opérations asynchrones
- Implémenter le tracking GPS comme Foreground Service
- Stocker les données sensibles avec EncryptedSharedPreferences
- Utiliser WorkManager pour la synchronisation en arrière-plan
- Respecter les Material Design 3 guidelines

## Ressources

- [Jetpack Compose Documentation](https://developer.android.com/jetpack/compose)
- [Android Architecture Components](https://developer.android.com/topic/architecture)
- [TomTom Android SDK](https://developer.tomtom.com/android/maps/documentation)
