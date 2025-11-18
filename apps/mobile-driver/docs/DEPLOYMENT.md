# Guide de Déploiement - RT Driver

## Vue d'ensemble

Ce guide couvre le déploiement des trois variantes de l'application RT Driver :
1. PWA (Progressive Web App)
2. Android (APK/AAB)
3. iOS (IPA)

## PWA - Progressive Web App

### Prérequis

- Node.js 18.0+
- pnpm 8.15.4
- Compte Vercel (ou autre plateforme de déploiement)

### 1. Configuration des variables d'environnement

Créer un fichier `.env.production` :

```bash
# API Backend (Production)
NEXT_PUBLIC_CORE_ORDERS_API=https://api.rt.com/orders
NEXT_PUBLIC_PLANNING_API=https://api.rt.com/planning
NEXT_PUBLIC_ECMR_API=https://api.rt.com/ecmr
NEXT_PUBLIC_NOTIFICATIONS_API=https://api.rt.com/notifications

# TomTom Maps API
NEXT_PUBLIC_TOMTOM_API_KEY=your_production_tomtom_key

# GPS Configuration
NEXT_PUBLIC_GPS_INTERVAL=15000
NEXT_PUBLIC_GEOFENCE_RADIUS=200

# App Info
NEXT_PUBLIC_APP_NAME=RT Driver
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_ENV=production
```

### 2. Build de production

```bash
cd apps/mobile-driver/pwa

# Installer les dépendances
pnpm install

# Build production
pnpm build

# Tester le build localement
pnpm start
```

Le build génère un dossier `.next` optimisé.

### 3. Déploiement sur Vercel

#### Option A : CLI Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel --prod
```

#### Option B : GitHub Integration

1. Connecter votre repository GitHub à Vercel
2. Configurer les variables d'environnement dans le dashboard
3. Chaque push sur `main` déclenche un déploiement automatique

**Configuration Vercel :**

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["cdg1"]
}
```

### 4. Configuration DNS

Pointer votre domaine vers Vercel :

```
Type: CNAME
Name: driver
Value: cname.vercel-dns.com
```

URL finale : `https://driver.rt.com`

### 5. Vérification PWA

Après déploiement, vérifier :

1. **Lighthouse Audit** :
   - Ouvrir Chrome DevTools
   - Onglet Lighthouse
   - Catégorie PWA
   - Score cible : 100/100

2. **Manifest** :
   - Vérifier `/manifest.json` accessible
   - Icônes présentes
   - Couleurs de thème correctes

3. **Service Worker** :
   - Vérifier dans Application > Service Workers
   - Statut : Activated and running

4. **Installation** :
   - Tester "Ajouter à l'écran d'accueil" (mobile)
   - Tester "Installer" (desktop)

### 6. Analytics et monitoring

```bash
# Installer Vercel Analytics
pnpm add @vercel/analytics

# Dans app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

## Android - Application Native

### Prérequis

- Android Studio Hedgehog+
- JDK 17
- Android SDK 24+
- Compte Google Play Developer

### 1. Configuration du projet

**gradle.properties**
```properties
android.useAndroidX=true
android.enableJetifier=true
org.gradle.jvmargs=-Xmx2048m
```

**local.properties**
```properties
sdk.dir=/path/to/Android/sdk
```

**secrets.properties**
```properties
TOMTOM_API_KEY=your_tomtom_key
GOOGLE_MAPS_API_KEY=your_google_maps_key
CORE_ORDERS_URL=https://api.rt.com/orders
PLANNING_URL=https://api.rt.com/planning
ECMR_URL=https://api.rt.com/ecmr
```

### 2. Configuration de signature

#### Créer un keystore

```bash
keytool -genkey -v -keystore rt-driver.keystore \
  -alias rt-driver-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**Réponses suggérées :**
- Nom et prénom : RT Technologie
- Nom d'organisation : RT Technologie
- Ville : Paris
- Département : Île-de-France
- Code pays : FR
- Mot de passe : [SÉCURISÉ - À sauvegarder]

#### Configurer build.gradle

```gradle
android {
    signingConfigs {
        release {
            storeFile file("../rt-driver.keystore")
            storePassword System.getenv("KEYSTORE_PASSWORD")
            keyAlias "rt-driver-key"
            keyPassword System.getenv("KEY_PASSWORD")
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 3. Build APK/AAB

#### Debug APK (pour tests)

```bash
cd apps/mobile-driver/android
./gradlew assembleDebug

# APK généré dans :
# app/build/outputs/apk/debug/app-debug.apk
```

#### Release AAB (pour Play Store)

```bash
# Configurer les variables d'environnement
export KEYSTORE_PASSWORD=your_keystore_password
export KEY_PASSWORD=your_key_password

# Build AAB
./gradlew bundleRelease

# AAB généré dans :
# app/build/outputs/bundle/release/app-release.aab
```

#### Release APK (pour distribution directe)

```bash
./gradlew assembleRelease

# APK généré dans :
# app/build/outputs/apk/release/app-release.apk
```

### 4. Publication sur Google Play Store

#### Préparer les assets

**Icône de l'app :**
- 512x512 px
- PNG avec transparence
- Pas de texte

**Captures d'écran :**
- Téléphone : 1080x1920 px minimum
- Tablette 7" : 1200x1920 px minimum
- Tablette 10" : 2560x1600 px minimum
- Minimum 2, maximum 8 par type

**Bannière feature :**
- 1024x500 px
- JPG ou PNG

#### Créer une release

1. **Play Console** : https://play.google.com/console
2. **Créer l'application**
   - Nom : RT Driver
   - Langue par défaut : Français
   - Type : Application
   - Gratuit/Payant : Gratuit

3. **Remplir la fiche Store**
   - Description courte (80 caractères max)
   - Description complète (4000 caractères max)
   - Catégorie : Business
   - Coordonnées du développeur

4. **Uploader l'AAB**
   - Production > Créer une release
   - Uploader `app-release.aab`
   - Nom de la release : 1.0.0 (Build 1)
   - Notes de version

5. **Classification du contenu**
   - Répondre au questionnaire
   - Obtenir la classification

6. **Pays et régions**
   - Sélectionner les pays cibles

7. **Soumettre pour review**
   - Review peut prendre 24-72h

### 5. Tests avant publication

#### Tests internes (Alpha)

```bash
# Uploader dans Internal Testing
# Ajouter des testeurs (max 100)
# Partager le lien de test
```

#### Tests fermés (Beta)

```bash
# Créer un groupe de bêta-testeurs
# Uploader la version
# Partager le lien
```

#### Tests ouverts

```bash
# Ouvrir aux bêta-testeurs publics
# Limiter le nombre si besoin
```

### 6. Update OTA (Over-The-Air)

Pour les mises à jour :

1. Incrémenter `versionCode` dans `build.gradle`
2. Mettre à jour `versionName` si nécessaire
3. Build et upload nouvelle AAB
4. Déploiement progressif (10% → 50% → 100%)

## iOS - Application Native

### Prérequis

- macOS 13.0+ (Ventura)
- Xcode 15.0+
- Compte Apple Developer (99$/an)
- Certificats et provisioning profiles

### 1. Configuration du projet

**Config.xcconfig**
```
API_CORE_ORDERS = https://api.rt.com/orders
API_PLANNING = https://api.rt.com/planning
API_ECMR = https://api.rt.com/ecmr
TOMTOM_API_KEY = your_tomtom_key
```

**Info.plist**
```xml
<key>CFBundleDisplayName</key>
<string>RT Driver</string>
<key>CFBundleShortVersionString</key>
<string>1.0.0</string>
<key>CFBundleVersion</key>
<string>1</string>
```

### 2. Certificats et Provisioning

#### Créer un App ID

1. Apple Developer Portal
2. Identifiers > App IDs
3. Register New Identifier
   - Description : RT Driver
   - Bundle ID : com.rt.driver
   - Capabilities : Location, Push Notifications, Background Modes

#### Créer des certificats

**Development Certificate :**
```bash
# Dans Keychain Access > Certificate Assistant > Request Certificate
# Envoyer à Apple Developer Portal
# Télécharger et installer
```

**Distribution Certificate :**
```bash
# Même processus mais pour production
```

#### Provisioning Profiles

**Development Profile :**
- Type : iOS App Development
- App ID : com.rt.driver
- Devices : Ajouter vos devices de test
- Download et double-clic pour installer

**Distribution Profile :**
- Type : App Store
- App ID : com.rt.driver
- Download et double-clic

### 3. Configuration Xcode

1. Ouvrir `MobileDriver.xcworkspace`
2. Project Settings > Signing & Capabilities
   - Team : Votre équipe
   - Provisioning Profile : Automatic
   - Signing Certificate : Automatic

3. Build Settings
   - Product Name : RT Driver
   - Product Bundle Identifier : com.rt.driver

### 4. Build

#### Debug (pour tests)

```bash
# Sélectionner scheme : MobileDriver
# Sélectionner device : Votre iPhone
# Product > Run (Cmd+R)
```

#### Archive (pour distribution)

```bash
# Sélectionner : Any iOS Device (arm64)
# Product > Archive
# Attendre la compilation
```

### 5. Publication App Store

#### Préparer App Store Connect

1. **App Store Connect** : https://appstoreconnect.apple.com
2. **Mes Apps** > + > Nouvelle app
   - Plateformes : iOS
   - Nom : RT Driver
   - Langue principale : Français
   - Bundle ID : com.rt.driver
   - SKU : RT-DRIVER-001

3. **Informations générales**
   - Sous-titre (30 caractères)
   - Description (4000 caractères max)
   - Mots-clés (100 caractères, séparés par virgules)
   - URL marketing : https://rt.com/driver
   - URL d'assistance : https://rt.com/support

4. **Captures d'écran**
   - iPhone 6.7" : 1290x2796 px (iPhone 15 Pro Max)
   - iPhone 6.5" : 1284x2778 px (iPhone 14 Pro Max)
   - iPhone 5.5" : 1242x2208 px (iPhone 8 Plus)
   - Minimum 3, recommandé 5-6

5. **Icône App Store**
   - 1024x1024 px
   - PNG sans transparence
   - Pas de coins arrondis

#### Upload du build

Dans Xcode :

1. Window > Organizer
2. Sélectionner l'archive
3. Distribute App
4. App Store Connect
5. Upload
6. Attendre la validation (10-30 min)

#### Soumettre pour review

1. App Store Connect > Version
2. Sélectionner le build uploadé
3. Remplir :
   - Coordonnées
   - Notes de version
   - Classification (questionnaire)
   - Export Compliance (généralement : Non)

4. Soumettre
   - Review : 24-48h généralement
   - Statut visible dans App Store Connect

### 6. TestFlight (Beta Testing)

Avant production, tester avec TestFlight :

1. **Testeurs internes** (max 100)
   - Ajouter dans App Store Connect
   - Inviter par email
   - Accès immédiat

2. **Testeurs externes** (max 10 000)
   - Créer un groupe
   - Soumettre pour review (24-48h)
   - Partager lien public ou inviter

3. **Feedback**
   - Les testeurs peuvent envoyer screenshots
   - Crash reports automatiques
   - Feedback dans App Store Connect

### 7. Mises à jour

Pour publier une mise à jour :

1. Incrémenter `CFBundleShortVersionString` (ex: 1.0.0 → 1.1.0)
2. Incrémenter `CFBundleVersion` (ex: 1 → 2)
3. Archive et upload
4. Nouvelle version dans App Store Connect
5. Remplir "Nouveautés de cette version"
6. Soumettre

**Stratégie de déploiement :**
- Déploiement échelonné (7 jours)
- Permet de détecter les problèmes
- Possibilité de stopper ou accélérer

## Configuration SSL/HTTPS

### Certificat SSL

Pour la PWA, utiliser un certificat gratuit Let's Encrypt via Vercel (automatique).

Pour un serveur custom :

```bash
# Installer Certbot
sudo apt install certbot

# Générer certificat
sudo certbot certonly --standalone -d driver.rt.com

# Renouvellement automatique
sudo certbot renew --dry-run
```

### Force HTTPS

**Next.js (next.config.js) :**
```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          }
        ]
      }
    ];
  }
};
```

## Monitoring et Logs

### Sentry (Error Tracking)

```bash
# Installer Sentry
pnpm add @sentry/nextjs

# Configurer
npx @sentry/wizard -i nextjs
```

**sentry.client.config.js :**
```javascript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'your_sentry_dsn',
  environment: process.env.NEXT_PUBLIC_APP_ENV,
  tracesSampleRate: 1.0,
});
```

### Google Analytics

```bash
# Installer
pnpm add @next/third-parties
```

**app/layout.tsx :**
```typescript
import { GoogleAnalytics } from '@next/third-parties/google';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <GoogleAnalytics gaId="G-XXXXXXXXXX" />
      </body>
    </html>
  );
}
```

### Crashlytics (Mobile)

**Android (build.gradle) :**
```gradle
dependencies {
    implementation platform('com.google.firebase:firebase-bom:32.7.0')
    implementation 'com.google.firebase:firebase-crashlytics'
    implementation 'com.google.firebase:firebase-analytics'
}
```

**iOS (Podfile) :**
```ruby
pod 'Firebase/Crashlytics'
pod 'Firebase/Analytics'
```

## CI/CD avec GitHub Actions

### PWA Deploy

**.github/workflows/deploy-pwa.yml :**
```yaml
name: Deploy PWA

on:
  push:
    branches: [main]
    paths:
      - 'apps/mobile-driver/pwa/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install

      - name: Build
        run: pnpm build
        env:
          NEXT_PUBLIC_CORE_ORDERS_API: ${{ secrets.CORE_ORDERS_API }}
          NEXT_PUBLIC_PLANNING_API: ${{ secrets.PLANNING_API }}
          NEXT_PUBLIC_ECMR_API: ${{ secrets.ECMR_API }}
          NEXT_PUBLIC_TOMTOM_API_KEY: ${{ secrets.TOMTOM_API_KEY }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Android Build

**.github/workflows/build-android.yml :**
```yaml
name: Build Android

on:
  push:
    branches: [main]
    paths:
      - 'apps/mobile-driver/android/**'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup JDK
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Build APK
        run: |
          cd apps/mobile-driver/android
          ./gradlew assembleRelease
        env:
          KEYSTORE_PASSWORD: ${{ secrets.KEYSTORE_PASSWORD }}
          KEY_PASSWORD: ${{ secrets.KEY_PASSWORD }}

      - name: Upload APK
        uses: actions/upload-artifact@v4
        with:
          name: app-release
          path: apps/mobile-driver/android/app/build/outputs/apk/release/app-release.apk
```

## Checklist de déploiement

### Avant déploiement

- [ ] Tests end-to-end passés
- [ ] Variables d'environnement configurées
- [ ] Certificats SSL valides
- [ ] Analytics configurées
- [ ] Error tracking activé
- [ ] Service Worker testé offline
- [ ] Performance Lighthouse > 90
- [ ] Accessibilité vérifiée
- [ ] SEO optimisé
- [ ] Manifest PWA valide

### Après déploiement

- [ ] Tester sur devices réels (iOS/Android)
- [ ] Vérifier les endpoints API
- [ ] Tester mode offline
- [ ] Vérifier notifications push
- [ ] Tester géolocalisation
- [ ] Vérifier signatures électroniques
- [ ] Tester upload documents
- [ ] Monitoring actif
- [ ] Backup mis en place
- [ ] Documentation à jour

## Rollback

### PWA (Vercel)

```bash
# Lister les déploiements
vercel ls

# Promouvoir un ancien déploiement
vercel promote [deployment-url] --scope=rt-technologie
```

### Android

1. Play Console > Production
2. Sélectionner version précédente
3. Déployer

### iOS

1. App Store Connect
2. Supprimer la version problématique
3. Soumettre version précédente

## Support et Maintenance

### Logs de production

**PWA :** Vercel Logs ou Sentry
**Android :** Play Console > Crashlytics
**iOS :** App Store Connect > Crashlytics

### Hotfix rapide

1. Créer branche `hotfix/issue-name`
2. Fix + tests
3. Merge vers `main`
4. Déploiement automatique (CI/CD)
5. Vérifier en production

### Calendrier de releases

- **Minor updates** : Toutes les 2 semaines
- **Major updates** : Tous les 3 mois
- **Hotfixes** : Dès que nécessaire

---

**Besoin d'aide ?**
- Email : devops@rt-technologie.fr
- Docs : https://docs.rt.com/deployment
- On-call : +33 1 23 45 67 89
