# Spécifications Complètes - Application Mobile Conducteur RT Technologie

> Documentation basée sur les spécifications PDF du projet

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Objectifs](#objectifs)
3. [Plateformes](#plateformes)
4. [Fonctionnalités détaillées](#fonctionnalités-détaillées)
5. [Architecture technique](#architecture-technique)
6. [Roadmap de développement](#roadmap-de-développement)
7. [Sécurité](#sécurité)
8. [Performance](#performance)

---

## Vue d'ensemble

L'Application Mobile Conducteur RT Technologie est une solution multiplateforme conçue pour digitaliser et optimiser le travail des conducteurs (salariés et sous-traitants) dans le transport routier.

### Problématiques résolues

- **Traçabilité temps réel** : Position GPS toutes les 15 secondes
- **Dématérialisation** : Plus de documents papier
- **Automatisation** : Détection automatique des événements (arrivée, départ)
- **Visibilité client** : ETA dynamique avec trafic temps réel
- **Conformité légale** : Signatures électroniques horodatées et géolocalisées
- **Efficacité opérationnelle** : Réduction des temps d'attente et des erreurs

### Utilisateurs

1. **Conducteurs salariés**
   - Authentification email/password
   - Accès à toutes les fonctionnalités
   - Historique complet
   - Compte permanent

2. **Conducteurs sous-traitants**
   - Authentification par QR code ou code mission
   - Accès limité à la mission en cours
   - JWT temporaire
   - Pas d'historique

---

## Objectifs

### Objectifs métier

1. **Réduire les temps de traitement** : -30% sur la gestion documentaire
2. **Améliorer la satisfaction client** : Visibilité temps réel, ETA précis
3. **Conformité réglementaire** : eCMR conforme EU, signatures légales
4. **Réduction des litiges** : Traçabilité complète, photos horodatées
5. **Optimisation opérationnelle** : Détection automatique des événements

### Objectifs techniques

1. **Disponibilité** : 99.9% uptime
2. **Performance** : GPS < 2s, signatures < 3s
3. **Offline-first** : Fonctionnement complet sans réseau
4. **Sécurité** : TLS 1.3, AES-256, audit trail
5. **Scalabilité** : Support 500+ conducteurs simultanés

### KPIs mesurés

- Temps moyen par mission
- Taux d'adoption conducteurs
- Nombre d'erreurs documentaires
- Satisfaction conducteurs (NPS)
- Économies papier/temps

---

## Plateformes

### 1. PWA (Progressive Web App) - Prioritaire

**Avantages :**
- ✅ Déploiement immédiat sans validation store
- ✅ Une seule codebase pour tous les OS
- ✅ Mises à jour instantanées
- ✅ Pas d'installation obligatoire
- ✅ Coût de développement minimal

**Limitations :**
- ⚠️ Notifications push limitées sur iOS
- ⚠️ GPS background limité sur iOS (nécessite app ouverte)
- ⚠️ Performance légèrement inférieure aux apps natives

**Technologies :**
- Next.js 14 (App Router)
- React 18 + TypeScript
- TailwindCSS
- Service Worker (next-pwa)
- IndexedDB (stockage local)
- Geolocation API
- html5-qrcode
- react-signature-canvas

### 2. Application Android Native - Phase 2

**Avantages :**
- ✅ Tracking GPS background illimité
- ✅ Notifications push natives
- ✅ Performance maximale
- ✅ Intégration profonde avec l'OS

**Technologies :**
- Kotlin
- Jetpack Compose
- Room (SQLite)
- WorkManager (background tasks)
- Google Maps SDK
- TomTom SDK
- CameraX + MLKit

### 3. Application iOS Native - Phase 2

**Avantages :**
- ✅ Tracking GPS background avec optimisation batterie
- ✅ Notifications push natives
- ✅ Respect des Human Interface Guidelines
- ✅ Performance maximale

**Technologies :**
- Swift
- SwiftUI
- CoreData
- CoreLocation
- MapKit
- TomTom SDK
- Vision Framework

---

## Fonctionnalités détaillées

### 1. Authentification double

#### Pour conducteurs salariés

**Flux :**
1. Ouverture de l'app
2. Écran login email/password
3. Validation backend (service authz)
4. JWT longue durée (7 jours)
5. Accès dashboard missions

**Spécifications :**
- Email validé (regex)
- Password minimum 8 caractères
- Remember me (refresh token 30 jours)
- Biométrie optionnelle (Phase 2)
- 2FA optionnel (Phase 3)

#### Pour sous-traitants

**Flux A - QR Code :**
1. Logisticien génère QR code mission
2. Conducteur scanne le QR
3. Décodage : `MISSION:{orderId}:{token}`
4. Auto-login avec JWT temporaire (24h)
5. Accès direct à la mission

**Flux B - Code manuel :**
1. Conducteur saisit code à 8 chiffres
2. Validation backend
3. JWT temporaire (24h)
4. Accès mission

**Spécifications :**
- QR code format : Base64 encodé
- Code mission : 8 digits numériques
- JWT expire à la fin de la mission ou 24h max
- Pas d'accès aux autres missions
- Données anonymisées

### 2. Démarrage de mission

**Flux :**
1. Scan QR code ou saisie code
2. Récupération automatique des infos mission (API core-orders)
3. Écran de confirmation :
   - Nom conducteur (pré-rempli ou à saisir)
   - Immatriculation véhicule
   - Téléphone contact
   - Checkbox CGU
4. Bouton "Démarrer la mission"
5. Tracking GPS activé immédiatement
6. Statut mission : `EN_ROUTE_PICKUP`

**Spécifications :**
- Validation immatriculation (regex FR)
- Validation téléphone international
- Géolocalisation activée obligatoire
- Photo véhicule optionnelle (Phase 2)
- Checklist pré-départ (Phase 2)

### 3. Géolocalisation intelligente

#### Tracking GPS continu

**Fréquence :**
- Toutes les 15 secondes en mission active
- Toutes les 60 secondes en pause (économie batterie)
- Adaptatif selon vitesse (Phase 2)

**Données collectées :**
```javascript
{
  orderId: "ORD-2024-001",
  latitude: 48.8566,
  longitude: 2.3522,
  accuracy: 10,        // mètres
  speed: 80,           // km/h
  heading: 180,        // degrés (0-360)
  timestamp: "2024-11-18T10:30:00Z"
}
```

**Optimisations batterie :**
- GPS haute précision uniquement en approche (< 5km)
- GPS standard en transit
- Pause tracking si arrêt > 10min
- Mode avion détecté → stockage local

#### Géofencing automatique

**Rayon de détection :** 200 mètres

**Événements détectés :**

1. **ARRIVAL_PICKUP** : Arrivée au point de chargement
   - Trigger : Position entre dans rayon 200m
   - Action auto : Statut → `ARRIVED_PICKUP`
   - Notification conducteur : "Vous êtes arrivé au chargement"
   - Notification logisticien : "Conducteur arrivé au chargement"

2. **DEPARTURE_PICKUP** : Départ du point de chargement
   - Trigger : Position sort du rayon 200m + statut = `LOADING`
   - Action auto : Statut → `IN_TRANSIT`
   - Notification : "Chargement terminé, en route livraison"

3. **ARRIVAL_DELIVERY** : Arrivée au point de livraison
   - Trigger : Position entre dans rayon 200m
   - Action auto : Statut → `ARRIVED_DELIVERY`
   - Notification : "Vous êtes arrivé à la livraison"

4. **DEPARTURE_DELIVERY** : Départ après livraison
   - Trigger : Position sort du rayon 200m + statut = `DELIVERED`
   - Action auto : Statut → `COMPLETED`
   - Notification : "Mission terminée avec succès"

**Alertes déviation :**
- Calcul du corridor de route (TomTom)
- Alerte si > 2km du corridor
- Notification conducteur et logisticien
- Demande de raison (Phase 2)

#### Calcul d'ETA dynamique

**Fréquence :** Toutes les 60 secondes

**Sources de données :**
- Position GPS actuelle
- Destination (pickup ou delivery selon statut)
- Trafic temps réel (TomTom Traffic API)
- Historique de conduite (Phase 2)

**Données ETA :**
```javascript
{
  arrivalTime: "2024-11-18T14:30:00Z",
  durationMinutes: 45,
  distanceKm: 38.5,
  trafficDelay: 8,      // minutes de retard dû au trafic
  confidence: "HIGH"    // HIGH, MEDIUM, LOW
}
```

**Affichage conducteur :**
- ETA : "14:30" (en gros)
- Distance : "38 km"
- Retard trafic : "+8 min" (en rouge si > 5min)
- Icône confiance (vert/orange/rouge)

**Partage client :**
- ETA envoyé au destinataire toutes les 5 minutes
- SMS/Email si retard > 15 min
- Lien de tracking temps réel (Phase 2)

### 4. Les 6 statuts de mission

**1. EN_ROUTE_PICKUP** (Bleu)
- Conducteur en route vers le point de chargement
- ETA vers pickup
- Bouton manuel : "Arrivé au chargement"

**2. ARRIVED_PICKUP** (Orange)
- Conducteur sur site de chargement
- Chronomètre temps d'attente
- Bouton : "Commencer le chargement"

**3. LOADING** (Orange)
- Chargement en cours
- Chronomètre temps de chargement
- Bouton : "Chargement terminé"
- Signature au quai (optionnel)

**4. IN_TRANSIT** (Bleu)
- En route vers livraison
- ETA vers delivery
- Bouton manuel : "Arrivé à la livraison"

**5. ARRIVED_DELIVERY** (Orange)
- Sur site de livraison
- Chronomètre temps d'attente
- Bouton : "Commencer le déchargement"

**6. DELIVERED** (Vert)
- Livraison terminée
- Signature destinataire obligatoire
- Photos/documents obligatoires
- Déclaration de réserves
- Mission complétée

### 5. Navigation intégrée

**Intégrations :**
- Google Maps (défaut)
- Waze (optionnel)
- Apple Plans (iOS uniquement)

**Fonctionnalités :**
- Bouton "Naviguer" sur chaque étape
- Deep link vers l'app de navigation
- Retour automatique à l'app RT
- Partage d'itinéraire (Phase 2)

**Informations site :**
- Nom du site
- Adresse complète
- Téléphone contact (click-to-call)
- Instructions spéciales
- Photos d'accès (Phase 2)
- Horaires (Phase 2)

**Réservation de quai (Phase 2) :**
- Sélection créneau disponible
- Confirmation automatique
- Rappel 30min avant
- QR code d'accès quai

### 6. Signatures électroniques

#### Signature au quai (chargement)

**Quand :** Optionnel après chargement

**Flux :**
1. Bouton "Signer au quai"
2. Canvas signature tactile
3. Saisie nom du magasinier
4. Capture de la signature
5. Génération PDF avec horodatage + GPS
6. Stockage S3 + métadonnées MongoDB

**Spécifications :**
- Canvas 600x300px minimum
- Pen color : #000000
- Pen width : 2px
- Export PNG base64
- PDF A3 compliant
- Métadonnées : timestamp, GPS, nom, orderId

#### Signature destinataire (livraison)

**Mode A - Signature tactile classique :**
1. Bouton "Signature destinataire"
2. Canvas sur smartphone conducteur
3. Nom destinataire + fonction
4. Réserves éventuelles
5. PDF eCMR généré
6. Email automatique au destinataire

**Mode B - Signature QR code (sans contact) :**
1. Conducteur génère QR code unique
2. Destinataire scanne avec son smartphone
3. Page web signature s'ouvre
4. Signature sur le smartphone du destinataire
5. Nom + fonction
6. Réserves éventuelles
7. Validation
8. PDF eCMR généré et envoyé

**Avantages QR code :**
- Pas de contact physique (COVID, hygiène)
- Destinataire garde son smartphone
- Signature plus naturelle
- Email instantané
- Preuve d'acceptation forte

**Spécifications PDF eCMR :**
- Conforme EU 2020/1056
- Horodatage qualifié
- Géolocalisation précise
- Signatures multiples (conducteur + destinataire)
- Hash SHA-256 pour intégrité
- Stockage 10 ans (conformité)

### 7. Gestion documentaire

#### Types de documents

1. **BL (Bon de Livraison)**
   - Scan ou photo
   - Amélioration auto (contraste, perspective)
   - OCR optionnel (Phase 2)

2. **CMR**
   - Scan papier ou PDF électronique
   - Validation des champs obligatoires

3. **Documents douaniers**
   - EUR1, T1, factures export
   - Multiple documents possibles
   - Photos recto/verso

4. **Photos mission**
   - Marchandise chargée
   - État du colis
   - Problèmes constatés
   - Maximum 20 photos/mission

5. **Constat de réserves**
   - Formulaire structuré
   - Photos obligatoires
   - Signature conducteur + destinataire
   - Envoi immédiat au service litiges

#### Scan intelligent

**Fonctionnalités :**
- Auto-détection des bords
- Correction de perspective
- Amélioration du contraste
- Suppression des ombres
- Conversion noir & blanc (pour texte)
- Compression optimale (JPEG 85%)

**Interface :**
- Overlay cadre de guidage
- Flash auto/on/off
- Rotation 90° gauche/droite
- Crop manuel si besoin
- Aperçu avant validation

**Stockage :**
- Upload S3 en arrière-plan
- Métadonnées MongoDB :
  - orderId
  - documentType
  - timestamp
  - GPS coordinates
  - fileSize
  - mimeType
  - uploadedBy (userId)
  - verified (boolean)

#### Déclaration de réserves

**Déclenchement :**
- Bouton "Déclarer une réserve" toujours visible
- Obligatoire si problème constaté

**Formulaire :**
1. Type de réserve :
   - Colis manquant
   - Colis endommagé
   - Retard
   - Refus de livraison
   - Autre

2. Description libre (textarea)

3. Photos obligatoires (min 2)

4. Signature destinataire (accord sur réserve)

5. Bouton "Envoyer"

**Actions automatiques :**
- Email immédiat au service litiges
- SMS au client
- Notification logisticien
- Création ticket support
- Blocage signature si réserve non documentée

### 8. Communication (Phase 2)

#### Chat conducteur ↔ logisticien

**Interface :**
- Bulle de chat flottante
- Badge nombre de messages non lus
- Notifications push
- Envoi photo depuis le chat

**Fonctionnalités :**
- Messages texte
- Photos
- Position GPS partagée
- Quick replies pré-formatées
- Historique conservé 30 jours

#### Quick Replies

**Messages pré-configurés :**
- "Arrivé sur site" 📍
- "Retard 15min" ⏰
- "Retard 30min" ⏰⏰
- "Problème, besoin d'aide" 🆘
- "Chargement en cours" 📦
- "Déchargement en cours" 📦
- "Mission terminée" ✅
- "Pause déjeuner" 🍴

**Avantages :**
- Envoi en 1 clic
- Pas de saisie nécessaire
- Gros boutons tactiles
- Utilisable avec gants
- Internationalisé

### 9. Mode hors-ligne

**Principe :** Offline-first architecture

#### Fonctionnalités offline

**✅ Disponibles sans réseau :**
- Consultation mission en cours
- Tracking GPS (stockage local)
- Changement de statut
- Signatures électroniques
- Photos de documents
- Déclaration de réserves
- Lecture des instructions

**❌ Non disponibles :**
- Démarrage nouvelle mission
- Navigation Maps (nécessite réseau)
- ETA temps réel
- Chat
- Email/SMS

#### Stockage local

**Technologies :**
- **LocalStorage** : Données légères (< 5MB)
  - Token auth
  - Mission actuelle
  - Profil utilisateur

- **IndexedDB** : Données volumineuses
  - Positions GPS (max 10 000)
  - Documents/photos en base64
  - File de sync

**Structure IndexedDB :**
```javascript
// Store: gps_positions
{
  id: 1,
  orderId: "ORD-2024-001",
  latitude: 48.8566,
  longitude: 2.3522,
  timestamp: "2024-11-18T10:30:00Z",
  synced: false
}

// Store: pending_documents
{
  id: 1,
  orderId: "ORD-2024-001",
  type: "PHOTO",
  base64: "data:image/jpeg;base64,...",
  timestamp: "2024-11-18T10:30:00Z",
  synced: false
}

// Store: pending_updates
{
  id: 1,
  type: "STATUS_UPDATE",
  orderId: "ORD-2024-001",
  data: { status: "ARRIVED_DELIVERY" },
  timestamp: "2024-11-18T10:30:00Z",
  synced: false
}
```

#### Synchronisation automatique

**Détection retour réseau :**
- Event listener `online`
- Ping API health toutes les 30s
- Icône statut connexion

**Processus de sync :**
1. Détection connexion revenue
2. Récupération file de sync (IndexedDB)
3. Tri par timestamp (FIFO)
4. Envoi séquentiel (pas parallèle)
5. Retry 3 fois si échec
6. Marquage `synced: true` si succès
7. Suppression des données sync (> 7 jours)
8. Notification utilisateur : "X éléments synchronisés"

**Gestion des conflits :**
- Horodatage serveur fait foi
- Client ne peut jamais écraser serveur
- En cas de conflit : merge intelligent ou demande utilisateur

**Indicateur visuel :**
- Badge orange : "X en attente de sync"
- Badge vert : "Tout est synchronisé"
- Badge rouge : "Erreur de sync, réessayer"

### 10. Design UX optimisé terrain

#### Principes de base

**1. Gros boutons**
- Minimum : 48x48px (norme WCAG)
- Recommandé : 56x56px (utilisable avec gants)
- Espacement : 8px minimum entre boutons

**2. Code couleur intuitif**
- 🔵 Bleu : En mouvement, en route
- 🟠 Orange : Attente, action requise
- 🟢 Vert : Terminé, validé, OK
- 🔴 Rouge : Erreur, retard, urgence
- ⚪ Gris : Inactif, désactivé

**3. Navigation minimale**
- Maximum 3 clics pour toute fonction
- Bottom navigation : 5 icônes max
- Pas de menu hamburger caché
- Fil d'Ariane visible

**4. Typographie**
- Taille minimum : 14px (corps de texte)
- Boutons : 16-18px
- Titres : 24-32px
- Police sans-serif (Roboto, Inter)
- Contraste minimum : 4.5:1

**5. Feedback tactile**
- Vibration courte sur tap (50ms)
- Animation de clic (scale 0.95)
- Changement de couleur immédiat
- Loader visible si > 1s

#### Menu principal (Bottom Nav)

**5 icônes maximum :**
1. 🏠 **Dashboard** : Vue d'ensemble mission
2. 📍 **Tracking** : Carte GPS et ETA
3. ✍️ **Signature** : Signatures électroniques
4. 📄 **Documents** : Scan et upload
5. 👤 **Profil** : Paramètres et aide

**Responsive :**
- Sur tablette : Side navigation
- Sur smartphone : Bottom navigation
- Badge notifications sur icônes

#### Écrans critiques

**Dashboard mission :**
```
┌─────────────────────────┐
│ Mission #M-2024-001     │
│ ┌───────────────────┐   │
│ │   [Carte GPS]     │   │  300px
│ │   Position + ETA  │   │
│ └───────────────────┘   │
│                         │
│ Timeline:               │
│ ✓ En route chargement   │
│ ✓ Arrivé chargement     │
│ ● Chargement en cours ← │  Status actuel
│ ○ En route livraison    │
│ ○ Arrivé livraison      │
│ ○ Livré                 │
│                         │
│ ┌─────────────────────┐ │
│ │ CHARGEMENT TERMINÉ  │ │  56px
│ └─────────────────────┘ │
│                         │
│ [5 icônes bottom nav]   │
└─────────────────────────┘
```

**Signature pad :**
```
┌─────────────────────────┐
│ Signature destinataire  │
│                         │
│ ┌─────────────────────┐ │
│ │                     │ │
│ │   [Canvas tactile]  │ │  300px
│ │   "Signez ici"      │ │
│ │                     │ │
│ └─────────────────────┘ │
│                         │
│ Nom: _________________  │
│                         │
│ Fonction: ____________  │
│                         │
│ ┌────────┐ ┌─────────┐ │
│ │Effacer │ │ Valider │ │  48px
│ └────────┘ └─────────┘ │
└─────────────────────────┘
```

**Scan document :**
```
┌─────────────────────────┐
│ Scan BL de livraison    │
│                         │
│ ┌─────────────────────┐ │
│ │                     │ │
│ │   [Caméra preview]  │ │  400px
│ │   [Overlay cadre]   │ │
│ │                     │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │  📸 CAPTURER PHOTO  │ │  56px
│ └─────────────────────┘ │
│                         │
│ Documents (2):          │
│ • BL_001.jpg [X]        │
│ • Photo_002.jpg [X]     │
└─────────────────────────┘
```

#### Accessibilité

**Conformité WCAG 2.1 AA :**
- ✅ Contraste minimum 4.5:1
- ✅ Cibles tactiles 44x44px minimum
- ✅ Navigation clavier complète
- ✅ ARIA labels sur tous les boutons
- ✅ Focus visible (outline 2px)
- ✅ Pas d'animations > 5s
- ✅ Texte redimensionnable 200%

**Support :**
- VoiceOver (iOS)
- TalkBack (Android)
- Lecteurs d'écran web
- Zoom système
- Mode contraste élevé

---

## Architecture technique

### Stack PWA

**Frontend :**
- Next.js 14 (App Router)
- React 18 + TypeScript 5.4
- TailwindCSS 3.4
- Zustand (state management)
- React Query (data fetching)

**API & Data :**
- Axios (HTTP client)
- IndexedDB (offline storage)
- Service Worker (caching)
- WebSocket (chat Phase 2)

**Maps & GPS :**
- Geolocation API
- Google Maps JavaScript API
- TomTom Routing API
- Leaflet (alternative open-source)

**Documents & Signature :**
- html5-qrcode (scanner)
- react-signature-canvas (signatures)
- qrcode (générateur QR)
- jsPDF (génération PDF)

**Deployment :**
- Vercel (hosting PWA)
- GitHub Actions (CI/CD)
- Sentry (error tracking)
- Google Analytics (analytics)

### Backend Services

**Architecture microservices :**

```
┌─────────────────────────────────────────┐
│          Mobile Driver PWA              │
│    (Next.js 14 - Port 3110)            │
└──────────────┬──────────────────────────┘
               │
               │ HTTPS + JWT
               │
    ┌──────────┴──────────────────────┐
    │                                  │
    ▼                                  ▼
┌─────────────────┐          ┌──────────────────┐
│  Core Orders    │          │  Geo-Tracking    │
│  (Port 3001)    │◄────────►│  (Port 3016)     │
│  - Missions     │          │  - GPS tracking  │
│  - Statuts      │          │  - Géofencing    │
└─────────────────┘          │  - ETA TomTom    │
    │                        └──────────────────┘
    │                                  │
    ▼                                  ▼
┌─────────────────┐          ┌──────────────────┐
│     eCMR        │          │  Notifications   │
│  (Port 3009)    │          │  (Port 3002)     │
│  - Signatures   │          │  - Push          │
│  - Documents    │          │  - Email/SMS     │
│  - PDF eCMR     │          └──────────────────┘
└─────────────────┘
    │
    ▼
┌─────────────────┐
│      Authz      │
│  (Port 3005)    │
│  - JWT          │
│  - Permissions  │
└─────────────────┘
```

**Service Geo-Tracking (nouveau) :**
- Port : 3016
- Rôle : Tracking GPS, géofencing, ETA
- Technologies : Express.js, MongoDB, TomTom API
- Base de données :
  - Collection `positions` : Historique GPS
  - Collection `geofence_events` : Événements détectés
  - Collection `orders` : Mises à jour statuts

**APIs utilisées :**
- **TomTom Routing API** :
  - Calcul d'ETA avec trafic
  - 2 500 requêtes/jour (gratuit)
  - Latence moyenne : 200-500ms
  - Fallback sur calcul simple si quota dépassé

- **Google Maps API** :
  - Affichage cartes
  - Navigation
  - $200 de crédit gratuit/mois

### Base de données

**MongoDB Collections :**

```javascript
// orders
{
  orderId: "ORD-2024-001",
  status: "IN_TRANSIT",
  driver: {
    userId: "DRV-123",
    name: "Jean Dupont",
    phone: "+33612345678",
    vehicle: "AB-123-CD"
  },
  pickup: {
    location: { latitude: 48.8566, longitude: 2.3522 },
    name: "Entrepôt Paris Nord",
    address: "123 Rue de...",
    phone: "+33123456789"
  },
  delivery: {
    location: { latitude: 48.8738, longitude: 2.2950 },
    name: "Client ABC",
    address: "456 Avenue de...",
    phone: "+33987654321"
  },
  currentETA: {
    arrivalTime: "2024-11-18T14:30:00Z",
    durationMinutes: 45,
    distanceKm: 38.5,
    trafficDelay: 8
  },
  createdAt: ISODate("2024-11-18T08:00:00Z"),
  updatedAt: ISODate("2024-11-18T10:30:00Z")
}

// positions
{
  orderId: "ORD-2024-001",
  latitude: 48.8566,
  longitude: 2.3522,
  accuracy: 10,
  speed: 80,
  heading: 180,
  timestamp: ISODate("2024-11-18T10:30:00Z"),
  createdAt: ISODate("2024-11-18T10:30:05Z")
}

// geofence_events
{
  orderId: "ORD-2024-001",
  type: "ARRIVAL_DELIVERY",
  detectedAt: ISODate("2024-11-18T14:25:00Z"),
  location: {
    latitude: 48.8738,
    longitude: 2.2950,
    name: "Client ABC"
  },
  automatic: true,
  createdAt: ISODate("2024-11-18T14:25:02Z")
}

// documents
{
  orderId: "ORD-2024-001",
  type: "BL",
  url: "https://s3.../bl_001.jpg",
  fileSize: 1024000,
  mimeType: "image/jpeg",
  metadata: {
    latitude: 48.8738,
    longitude: 2.2950,
    timestamp: ISODate("2024-11-18T14:30:00Z"),
    uploadedBy: "DRV-123"
  },
  verified: false,
  createdAt: ISODate("2024-11-18T14:30:10Z")
}

// signatures
{
  orderId: "ORD-2024-001",
  type: "DELIVERY",
  signatureUrl: "https://s3.../sig_001.png",
  signerName: "Marie Martin",
  signerFunction: "Responsable réception",
  location: {
    latitude: 48.8738,
    longitude: 2.2950
  },
  timestamp: ISODate("2024-11-18T14:35:00Z"),
  pdfUrl: "https://s3.../ecmr_001.pdf",
  createdAt: ISODate("2024-11-18T14:35:05Z")
}
```

### Sécurité

**Transport :**
- TLS 1.3 obligatoire
- Certificate pinning (apps natives)
- HSTS headers

**Authentification :**
- JWT avec expiration
- Refresh tokens
- Revocation list
- Rate limiting : 100 req/min/user

**Stockage :**
- Chiffrement AES-256 (données sensibles)
- Pas de tokens en localStorage (httpOnly cookies recommandé)
- Clés API dans variables d'environnement

**Audit trail :**
- Log de toutes les actions
- IP + User-Agent
- Horodatage précis
- Stockage 1 an minimum

**Conformité :**
- RGPD compliant
- Droit à l'oubli
- Portabilité des données
- Consentement explicite

### Performance

**Métriques cibles PWA :**
- FCP (First Contentful Paint) : < 1.5s
- LCP (Largest Contentful Paint) : < 2.5s
- TTI (Time to Interactive) : < 3.5s
- CLS (Cumulative Layout Shift) : < 0.1
- FID (First Input Delay) : < 100ms
- Lighthouse score : > 90

**Optimisations :**
- Code splitting par route
- Lazy loading images
- Service Worker caching
- Compression gzip/brotli
- CDN pour assets statiques
- Image optimization (WebP)

**Budget performance :**
- Bundle JS : < 200KB (gzipped)
- Bundle CSS : < 50KB (gzipped)
- Images : WebP, lazy load
- Fonts : subset, swap

---

## Roadmap de développement

### Phase 1 : Fondations (4-6 semaines) - PRIORITAIRE

**Semaine 1-2 : Setup & Auth**
- [x] Setup monorepo structure
- [x] Service geo-tracking (port 3016)
- [x] PWA Next.js 14 boilerplate
- [x] Authentification double (login + QR)
- [ ] Tests d'intégration auth

**Semaine 3-4 : Tracking GPS & Géofencing**
- [x] Hook useGeolocation
- [x] API client geo-tracking
- [x] Géofencing automatique
- [x] Calcul ETA TomTom
- [ ] Tests géofencing
- [ ] Dashboard mission

**Semaine 5 : Signatures & Documents**
- [x] Composant SignaturePad
- [x] Génération QR code signature
- [x] Upload documents
- [ ] Génération PDF eCMR
- [ ] Tests signatures

**Semaine 6 : Mode offline & Polish**
- [x] Service Worker setup
- [x] IndexedDB storage
- [x] File de synchronisation
- [ ] Tests offline complet
- [ ] Déploiement staging
- [ ] Beta testing (5 conducteurs)

**Livrables Phase 1 :**
- ✅ PWA fonctionnelle déployée sur Vercel
- ✅ Tracking GPS temps réel avec TomTom
- ✅ Géofencing automatique (rayon 200m)
- ✅ 6 statuts automatiques
- ✅ Signatures électroniques
- ✅ Gestion documentaire
- ✅ Mode offline avec sync
- ⏳ Tests end-to-end
- ⏳ Documentation utilisateur

### Phase 2 : Enrichissement (4 semaines)

**Semaine 7-8 : Chat temps réel**
- [ ] WebSocket server
- [ ] Interface chat
- [ ] Quick replies
- [ ] Notifications push
- [ ] Partage position dans chat

**Semaine 9 : Historique & Analytics**
- [ ] Écran historique missions
- [ ] Statistiques conducteur
- [ ] Rapport de performance
- [ ] Export PDF rapports

**Semaine 10 : Instructions enrichies**
- [ ] Photos accès site
- [ ] Réservation quai
- [ ] Checklist pré-départ
- [ ] Instructions vocales

**Livrables Phase 2 :**
- Chat conducteur ↔ logisticien
- Historique missions complet
- Instructions enrichies avec photos
- Réservation de quai
- Analytics de performance
- Notifications push avancées

### Phase 3 : Excellence (3 semaines)

**Semaine 11 : Internationalisation**
- [ ] Extraction i18n
- [ ] Traduction EN, ES, DE
- [ ] Format dates/distances
- [ ] Support multi-devise

**Semaine 12 : Apps natives**
- [ ] Android Kotlin/Compose
- [ ] iOS Swift/SwiftUI
- [ ] Publication stores
- [ ] Beta TestFlight/Play Internal

**Semaine 13 : Optimisations**
- [ ] Mode sombre
- [ ] Analytics avancées
- [ ] Optimisations batterie
- [ ] A/B testing

**Livrables Phase 3 :**
- Support 4 langues (FR, EN, ES, DE)
- Applications natives Android & iOS
- Mode sombre
- Analytics avec dashboards
- Optimisations batterie avancées
- Publication App Store & Google Play

### Planning global

```
Mois 1 │████████████████████│ Phase 1 (PWA Core)
       │                     │
Mois 2 │██████████          │ Phase 1 (Tests + Beta)
       │          ██████████│ Phase 2 (Chat + Features)
       │                     │
Mois 3 │██████████          │ Phase 2 (Finalisation)
       │          ██████████│ Phase 3 (i18n + Native)
```

**Total : 13 semaines (3 mois)**

---

## Sécurité

### Authentification & Autorisation

**JWT Structure :**
```javascript
{
  "sub": "DRV-123",              // User ID
  "role": "DRIVER_EMPLOYEE",     // or DRIVER_SUBCONTRACTOR
  "iat": 1700308800,             // Issued at
  "exp": 1700395200,             // Expiration (24h pour subcontractor, 7j pour employee)
  "orderId": "ORD-2024-001",     // Pour subcontractor uniquement
  "permissions": [
    "mission.read",
    "mission.update_status",
    "gps.send",
    "signature.create",
    "document.upload"
  ]
}
```

**Token Management :**
- Stockage : httpOnly cookies (recommandé) ou localStorage chiffré
- Refresh : Token refresh automatique 1h avant expiration
- Revocation : Revocation list côté serveur
- Rotation : Rotation des secrets JWT tous les 30 jours

### Transport Security

**HTTPS obligatoire :**
- TLS 1.3 minimum
- Certificate pinning (apps natives)
- HSTS avec preload
- Pas de mixed content

**Headers sécurité :**
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; img-src 'self' data: https:
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(self), camera=(self)
```

### Data Protection

**Chiffrement au repos :**
- Documents : Chiffrement S3 avec KMS
- Base de données : MongoDB encryption at rest
- Backup : Chiffré AES-256

**Chiffrement en transit :**
- API : TLS 1.3
- WebSocket : WSS (WebSocket Secure)
- Uploads : Multipart encrypted

**Données sensibles :**
- Pas de passwords en clair
- Hash bcrypt rounds=12
- Pas de numéros de carte bancaire
- Anonymisation des données de test

### Audit & Compliance

**Logs d'audit :**
```javascript
{
  action: "SIGNATURE_CREATED",
  userId: "DRV-123",
  orderId: "ORD-2024-001",
  ip: "192.168.1.100",
  userAgent: "Mozilla/5.0...",
  timestamp: "2024-11-18T14:35:00Z",
  metadata: {
    signatureType: "DELIVERY",
    signerName: "Marie Martin"
  }
}
```

**Rétention :**
- Logs d'audit : 1 an minimum
- Documents : 10 ans (conformité transport)
- Signatures : 10 ans (valeur légale)
- Positions GPS : 6 mois

**RGPD :**
- Consentement explicite
- Droit d'accès
- Droit de rectification
- Droit à l'oubli
- Portabilité des données
- Privacy by design

---

## Performance

### Frontend Performance

**Lighthouse Targets :**
- Performance : > 90
- Accessibility : > 95
- Best Practices : > 95
- SEO : > 90
- PWA : > 90

**Core Web Vitals :**
- LCP : < 2.5s
- FID : < 100ms
- CLS : < 0.1

**Bundle Optimization :**
```
Total JS (gzipped):
- Main bundle: 120 KB
- Pages chunks: 80 KB
- Vendors: 150 KB
Total: ~350 KB (acceptable)

Total CSS (gzipped):
- Global: 20 KB
- Pages: 15 KB
Total: ~35 KB (excellent)
```

### Backend Performance

**API Response Times :**
- GET endpoints : < 200ms (p95)
- POST endpoints : < 500ms (p95)
- GPS tracking : < 100ms (p95)
- ETA calculation : < 2s (avec TomTom)

**Database Performance :**
- Indexes sur orderId, userId, timestamp
- Aggregation pipelines optimisés
- Connection pooling : 10-50 connections
- Read preference : primaryPreferred

**Caching Strategy :**
- Mission data : 1 minute
- ETA : 30 secondes
- Static assets : 1 an (immutable)
- API responses : Conditional GET (ETag)

### Monitoring

**Métriques surveillées :**
- Uptime (target : 99.9%)
- Response times (p50, p95, p99)
- Error rate (target : < 0.1%)
- GPS positions/second
- Active missions count
- Offline sync queue depth

**Alertes :**
- Error rate > 1% : Alert
- Response time p95 > 1s : Warning
- Uptime < 99% : Critical
- Failed syncs > 100 : Warning

**Tools :**
- Sentry : Error tracking
- Google Analytics : User analytics
- Vercel Analytics : Performance monitoring
- MongoDB Atlas : Database monitoring
- TomTom Dashboard : API usage

---

## Conclusion

Cette application mobile conducteur représente une digitalisation complète du workflow de transport routier, avec un focus sur :

✅ **Simplicité** : Interface intuitive, utilisable avec des gants
✅ **Fiabilité** : Mode offline, synchronisation automatique
✅ **Automatisation** : Géofencing, détection d'événements
✅ **Traçabilité** : GPS temps réel, signatures géolocalisées
✅ **Conformité** : eCMR EU, RGPD, audit trail
✅ **Performance** : < 2s partout, PWA optimisée

**ROI attendu :**
- ⏱️ -30% temps de traitement par mission
- 📄 100% dématérialisation
- 📍 Traçabilité complète
- 😊 +40% satisfaction conducteurs
- 💰 30 000€/an d'économies

**Prochaines étapes :**
1. Finaliser les tests PWA
2. Beta testing avec 5-10 conducteurs pilotes
3. Déploiement production
4. Phase 2 : Chat et features avancées
5. Phase 3 : Apps natives et internationalisation
