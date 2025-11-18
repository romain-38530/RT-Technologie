# Architecture Mobile - RT Driver

## Vue d'ensemble

L'application RT Driver est une solution multiplateforme conçue pour optimiser la gestion des missions de transport. Elle est disponible sur trois plateformes :

1. **PWA (Progressive Web App)** - Solution prioritaire, déployable rapidement
2. **Android Native** - Application native Kotlin pour une performance optimale
3. **iOS Native** - Application native Swift pour l'écosystème Apple

## Architecture Générale

### Diagramme d'architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Applications Clientes                     │
├──────────────┬─────────────────┬──────────────────────────────┤
│              │                 │                              │
│     PWA      │    Android      │           iOS                │
│  (Next.js)   │   (Kotlin)      │         (Swift)              │
│              │                 │                              │
└──────┬───────┴────────┬────────┴────────┬─────────────────────┘
       │                │                 │
       │                │                 │
       └────────────────┼─────────────────┘
                        │
            ┌───────────▼──────────┐
            │   Load Balancer      │
            │   (API Gateway)      │
            └───────────┬──────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────▼────┐  ┌──────▼─────┐  ┌─────▼──────┐
│Core Orders │  │  Planning  │  │   eCMR     │
│   :3001    │  │   :3004    │  │   :3009    │
└────────────┘  └────────────┘  └────────────┘
        │               │               │
        └───────────────┼───────────────┘
                        │
            ┌───────────▼──────────┐
            │   PostgreSQL         │
            │   (Base de données)  │
            └──────────────────────┘
```

## PWA - Progressive Web App

### Stack Technologique

- **Framework** : Next.js 14 (App Router)
- **UI** : React 18 + TypeScript
- **Styling** : TailwindCSS
- **State Management** : Zustand (optionnel, contexte React suffit)
- **Offline** : Service Worker (next-pwa)
- **Storage** : LocalStorage + IndexedDB
- **Maps** : Google Maps API / Waze deeplinks
- **QR Code** : html5-qrcode
- **Signature** : react-signature-canvas

### Architecture PWA

```
pwa/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Groupe auth
│   │   │   ├── login/
│   │   │   └── qr-scan/
│   │   ├── (mission)/         # Groupe mission
│   │   │   ├── dashboard/
│   │   │   ├── tracking/
│   │   │   ├── signature/
│   │   │   └── documents/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── lib/
│   │   ├── api/               # Clients API
│   │   │   ├── client.ts
│   │   │   ├── missions.ts
│   │   │   ├── tracking.ts
│   │   │   └── documents.ts
│   │   ├── hooks/             # Custom hooks
│   │   │   ├── useGeolocation.ts
│   │   │   ├── useOfflineSync.ts
│   │   │   └── useQRScanner.ts
│   │   └── utils/             # Utilitaires
│   │       ├── geofencing.ts
│   │       └── storage.ts
│   └── components/            # Composants réutilisables
│       ├── MissionCard.tsx
│       ├── SignaturePad.tsx
│       ├── QRCodeDisplay.tsx
│       └── DocumentScanner.tsx
└── public/
    ├── manifest.json          # PWA manifest
    └── sw.js                  # Service Worker
```

### Flux de données PWA

```
┌──────────────┐
│  Component   │
└──────┬───────┘
       │
       │ 1. Action utilisateur
       │
┌──────▼───────┐
│  API Client  │
└──────┬───────┘
       │
       │ 2. HTTP Request (avec token)
       │
┌──────▼───────┐
│   Backend    │
│   Services   │
└──────┬───────┘
       │
       │ 3. Response JSON
       │
┌──────▼───────┐
│  Component   │ 4. Update UI
└──────────────┘
```

### Mode Offline

Le mode offline utilise plusieurs stratégies :

1. **Cache-First** pour les assets statiques
2. **Network-First** pour les données API
3. **Queue de synchronisation** pour les updates

```typescript
// Exemple de gestion offline
const { isOnline, addPendingUpdate, syncPendingUpdates } = useOfflineSync();

// Envoi position GPS
if (isOnline) {
  await trackingApi.sendGPSPosition(position);
} else {
  addPendingUpdate('GPS', position);
}

// Auto-sync au retour du réseau
useEffect(() => {
  if (isOnline) {
    syncPendingUpdates();
  }
}, [isOnline]);
```

## Android Native

### Architecture MVVM

```
┌──────────────┐
│     View     │  (Composables)
│  (UI Layer)  │
└──────┬───────┘
       │
       │ observe State
       │ emit Events
       │
┌──────▼───────┐
│  ViewModel   │  (Business Logic)
└──────┬───────┘
       │
       │ call methods
       │ observe Flow/LiveData
       │
┌──────▼───────┐
│  Repository  │  (Data Abstraction)
└──────┬───────┘
       │
   ┌───┴────┐
   │        │
┌──▼──┐  ┌─▼───┐
│ API │  │ Room│
│     │  │ DB  │
└─────┘  └─────┘
```

### Couches de l'application

#### 1. UI Layer (Jetpack Compose)

```kotlin
@Composable
fun MissionTrackingScreen(
    viewModel: MissionViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsState()

    when (state) {
        is MissionState.Loading -> LoadingIndicator()
        is MissionState.Success -> MissionContent(state.mission)
        is MissionState.Error -> ErrorMessage(state.error)
    }
}
```

#### 2. ViewModel Layer

```kotlin
class MissionViewModel @Inject constructor(
    private val repository: MissionRepository,
    private val locationManager: LocationManager
) : ViewModel() {

    private val _state = MutableStateFlow<MissionState>(MissionState.Loading)
    val state: StateFlow<MissionState> = _state

    fun loadMission(id: String) {
        viewModelScope.launch {
            repository.getMission(id)
                .collect { result ->
                    _state.value = when (result) {
                        is Result.Success -> MissionState.Success(result.data)
                        is Result.Error -> MissionState.Error(result.exception)
                    }
                }
        }
    }
}
```

#### 3. Repository Layer

```kotlin
class MissionRepository @Inject constructor(
    private val apiService: ApiService,
    private val missionDao: MissionDao
) {
    fun getMission(id: String): Flow<Result<Mission>> = flow {
        try {
            // Essayer d'abord l'API
            val mission = apiService.getMission(id)
            missionDao.insert(mission) // Cache local
            emit(Result.Success(mission))
        } catch (e: Exception) {
            // Fallback sur cache local
            val cachedMission = missionDao.getMission(id)
            if (cachedMission != null) {
                emit(Result.Success(cachedMission))
            } else {
                emit(Result.Error(e))
            }
        }
    }
}
```

### Services Android

#### LocationService (Foreground Service)

```kotlin
class LocationService : Service() {
    private val locationManager by lazy { LocationManager() }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        startForeground(NOTIFICATION_ID, createNotification())

        locationManager.startTracking { location ->
            // Envoyer position au serveur
            sendLocationToServer(location)
        }

        return START_STICKY
    }
}
```

## iOS Native

### Architecture MVVM avec Combine

```
┌──────────────┐
│     View     │  (SwiftUI)
│              │
└──────┬───────┘
       │
       │ @Published bindings
       │
┌──────▼───────┐
│  ViewModel   │  (ObservableObject)
└──────┬───────┘
       │
       │ Combine Publishers
       │
┌──────▼───────┐
│  Service     │
└──────┬───────┘
       │
   ┌───┴────┐
   │        │
┌──▼──┐  ┌─▼────────┐
│ API │  │CoreData  │
└─────┘  └──────────┘
```

### Exemple ViewModel iOS

```swift
class MissionViewModel: ObservableObject {
    @Published var mission: Mission?
    @Published var isLoading = false
    @Published var error: Error?

    private let apiService: APIService
    private var cancellables = Set<AnyCancellable>()

    func loadMission(id: String) {
        isLoading = true

        apiService.getMission(id: id)
            .receive(on: DispatchQueue.main)
            .sink { [weak self] completion in
                self?.isLoading = false
                if case .failure(let error) = completion {
                    self?.error = error
                }
            } receiveValue: { [weak self] mission in
                self?.mission = mission
            }
            .store(in: &cancellables)
    }
}
```

### Location Manager iOS

```swift
class LocationManager: NSObject, ObservableObject, CLLocationManagerDelegate {
    private let manager = CLLocationManager()
    @Published var location: CLLocation?

    override init() {
        super.init()
        manager.delegate = self
        manager.desiredAccuracy = kCLLocationAccuracyBest
        manager.requestAlwaysAuthorization()
    }

    func startTracking() {
        manager.allowsBackgroundLocationUpdates = true
        manager.pausesLocationUpdatesAutomatically = false
        manager.startUpdatingLocation()
    }

    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }
        self.location = location
        sendLocationToServer(location)
    }
}
```

## Géolocalisation et Tracking

### Stratégie de tracking GPS

- **Intervalle** : 15 secondes
- **Précision** : Haute (< 10m)
- **Mode** : Foreground + Background
- **Optimisation batterie** :
  - Pause automatique si stationnaire
  - Ajustement précision selon vitesse
  - Déférence des updates si < 5m de mouvement

### Géofencing

```typescript
// Calcul de distance (formule Haversine)
export const calculateDistance = (
  point1: Coordinates,
  point2: Coordinates
): number => {
  const R = 6371e3; // Rayon Terre en mètres
  const φ1 = point1.latitude * Math.PI / 180;
  const φ2 = point2.latitude * Math.PI / 180;
  const Δφ = (point2.latitude - point1.latitude) * Math.PI / 180;
  const Δλ = (point2.longitude - point1.longitude) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
};

// Vérification géofence
const isInGeofence = (
  currentPosition: Coordinates,
  center: Coordinates,
  radius: number = 200
): boolean => {
  return calculateDistance(currentPosition, center) <= radius;
};
```

### Transitions de statut automatiques

```
Position GPS reçue
       │
       ▼
Calcul distance aux points
       │
       ├─ Distance < 200m du point chargement
       │  ET statut = EN_ROUTE_TO_LOADING
       │  → Statut = ARRIVED_LOADING
       │
       └─ Distance < 200m du point livraison
          ET statut = EN_ROUTE_TO_DELIVERY
          → Statut = ARRIVED_DELIVERY
```

## Sécurité

### Authentification

- **Salariés** : JWT standard avec refresh token
- **Sous-traitants** : JWT temporaire lié au code mission (durée de vie : durée de la mission)

### Chiffrement

- **Transport** : TLS 1.3
- **Stockage local** :
  - PWA : LocalStorage non chiffré (données non sensibles), IndexedDB pour images
  - Android : EncryptedSharedPreferences pour tokens
  - iOS : Keychain pour tokens

### Permissions

- **Localisation** : Always (pour tracking background)
- **Caméra** : Pour QR scan et photos documents
- **Stockage** : Pour cache documents offline

## Performance

### Optimisations PWA

- **Code splitting** : Routes chargées à la demande
- **Image optimization** : Compression automatique
- **Service Worker** : Cache intelligent
- **Lazy loading** : Composants chargés au besoin

### Optimisations Mobile

- **Android** :
  - WorkManager pour sync background
  - Glide pour images
  - Room avec indices optimisés

- **iOS** :
  - BackgroundTasks pour sync
  - SDWebImage pour images
  - CoreData avec fetch batching

## Monitoring et Logs

### Logs côté client

```typescript
// PWA
console.log('[GPS]', position);
console.error('[API]', error);

// Production : intégration Sentry
Sentry.captureException(error);
```

### Métriques

- Temps de réponse API
- Taux de succès GPS
- Taux de synchronisation offline
- Temps de chargement pages

## Roadmap Technique

### Phase 1 (Actuel) - PWA Fonctionnelle
- [x] Architecture complète
- [x] Authentification
- [x] Tracking GPS
- [x] Signatures
- [x] Documents
- [x] Mode offline

### Phase 2 - Mobile Natif
- [ ] Développement complet Android
- [ ] Développement complet iOS
- [ ] Tests end-to-end
- [ ] Publication stores

### Phase 3 - Améliorations
- [ ] Notifications push
- [ ] Chat temps réel
- [ ] Analytics avancées
- [ ] Internationalisation complète
