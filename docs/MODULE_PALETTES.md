# Module Économie Circulaire des Palettes Europe

## 📋 Vue d'ensemble

Le module Palettes implémente un système d'économie circulaire pour les palettes Europe, basé sur un système de chèques dématérialisés avec QR codes, signatures cryptographiques et matching IA intelligent pour optimiser les flux de retour.

## 🎯 Objectifs

- **Traçabilité complète** : Chaque mouvement de palette est enregistré avec timestamp, GPS et signature cryptographique
- **Optimisation des flux** : L'IA sélectionne automatiquement le meilleur site de retour (distance, quota, priorité)
- **Économie circulaire** : Système de ledger pour suivre les dettes/crédits de palettes entre entreprises
- **Preuve légale** : Signatures Ed25519 pour garantir l'authenticité des chèques
- **Gestion des quotas** : Capacités journalières par site avec contrôle en temps réel

## 🏗️ Architecture

### Service Backend

**Port**: 3011
**Localisation**: `services/palette/src/server.js`

#### Endpoints principaux

```
POST   /palette/cheques/generate        # Générer un chèque avec matching IA
GET    /palette/cheques/:id             # Détails d'un chèque
POST   /palette/cheques/:id/deposit     # Déposer (transporteur)
POST   /palette/cheques/:id/receive     # Réceptionner (logisticien)
GET    /palette/ledger/:companyId       # Solde de palettes
GET    /palette/sites                   # Liste des sites de retour
POST   /palette/sites/:id/quota         # Mettre à jour les quotas
POST   /palette/disputes                # Créer un litige
POST   /palette/match/site              # Matching IA manuel
```

### Seeds de données

**Localisation**: `infra/seeds/`

- `palette-companies.json` : Liste des entreprises (industriels, transporteurs, logisticiens)
- `palette-sites.json` : Sites de retour avec GPS, quotas, horaires
- `palette-ledger.json` : Soldes initiaux de palettes par entreprise

### Applications Web

#### 1. Web Industry (port 3010)

**Fonctionnalités** :
- Dashboard avec KPI du solde de palettes
- Génération de chèques palettes avec matching IA automatique
- Vue de l'historique des mouvements (ledger)
- Configuration des sites de retour
- Gestion des quotas

**Pages créées** :
- `/palettes` : Vue d'ensemble et historique
- `/palettes/generate` : Formulaire de génération de chèque

**Fichiers** :
- `apps/web-industry/src/lib/api/palettes.ts` : Client API
- `apps/web-industry/src/app/palettes/page.tsx` : Page principale
- `apps/web-industry/src/app/palettes/generate/page.tsx` : Génération

#### 2. Web Transporter (port 3100)

**Fonctionnalités** :
- Scanner QR code des chèques palettes
- Dépôt de palettes sur les sites
- Vue GPS temps réel pour vérification de localisation
- Liste des sites de retour disponibles avec itinéraires

**Pages créées** :
- `/palettes` : Scanner et déposer
- `/palettes/sites` : Liste des sites avec capacités

**Fichiers** :
- `apps/web-transporter/src/lib/api/palettes.ts` : Client API
- `apps/web-transporter/src/app/palettes/page.tsx` : Page scan/dépôt
- `apps/web-transporter/src/app/palettes/sites/page.tsx` : Liste sites

#### 3. Web Logistician (port 3106)

**Fonctionnalités** :
- Réception des palettes déposées
- Scanner QR code pour validation
- Gestion des quotas journaliers par site
- Vue des sites avec occupation en temps réel

**Pages créées** :
- `/palettes` : Réception et gestion des sites

**Fichiers** :
- `apps/web-logistician/lib/api/palettes.ts` : Client API
- `apps/web-logistician/pages/palettes.tsx` : Page principale

## 📊 Flux de données

### 1. Génération de chèque (Industriel)

```
1. L'industriel crée une commande avec livraison
2. Il génère un chèque palette via l'interface :
   - ID commande
   - Quantité de palettes (max 33)
   - Immatriculation transporteur
   - Coordonnées GPS de livraison
3. Le backend appelle l'IA pour matching du meilleur site :
   - Calcul distance Haversine (rayon 30km)
   - Vérification quotas disponibles
   - Priorité : INTERNAL > NETWORK > EXTERNAL
4. Génération du chèque :
   - ID unique : CHQ-{timestamp}-{random}
   - QR code : RT-PALETTE://{chequeId}
   - Signature Ed25519 cryptographique
   - Timestamp + GPS
5. Mise à jour du ledger : -quantity pour l'industriel
```

### 2. Dépôt de palettes (Transporteur)

```
1. Le transporteur scanne le QR code du chèque
2. L'app affiche :
   - Détails du chèque (quantité, commande, site)
   - GPS actuel du transporteur
   - Distance au site de retour
3. Arrivé sur site, il confirme le dépôt :
   - POST /palette/cheques/:id/deposit
   - Enregistrement GPS + photo (optionnel)
   - Timestamp de dépôt
4. Statut passe de GENERATED → DEPOSITED
5. Le logisticien est notifié (futur)
```

### 3. Réception de palettes (Logisticien)

```
1. Le logisticien scanne le QR code du chèque déposé
2. Vérification :
   - Statut = DEPOSITED
   - Site correspond bien à son entrepôt
   - Quantité conforme
3. Confirmation de réception :
   - POST /palette/cheques/:id/receive
   - Enregistrement GPS + photo (optionnel)
   - Timestamp de réception
4. Statut passe de DEPOSITED → RECEIVED
5. Mise à jour du ledger : +quantity pour le propriétaire du site
6. Décrémentation du quota consommé du site
```

## 🧮 Système de Ledger

### Principe

Chaque entreprise a un **solde de palettes** :
- **Positif** : l'entreprise a un crédit de palettes (elle en a rendu plus qu'emprunté)
- **Négatif** : l'entreprise a une dette de palettes (elle en a emprunté plus que rendu)

### Mouvements

| Événement | Impact Industriel | Impact Logisticien/Site |
|-----------|-------------------|-------------------------|
| Génération chèque | -quantity | 0 |
| Dépôt | 0 | 0 |
| Réception | 0 | +quantity |

### Historique

Chaque mouvement est enregistré avec :
- `date` : Timestamp ISO 8601
- `delta` : Variation (+/-)
- `reason` : Type de mouvement (GENERATED, DEPOSITED, RECEIVED, etc.)
- `chequeId` : Référence du chèque
- `newBalance` : Nouveau solde après opération

### Exemple

```json
{
  "companyId": "IND-1",
  "balance": -15,
  "history": [
    {
      "date": "2025-01-15T14:30:00Z",
      "delta": -33,
      "reason": "CHEQUE_GENERATED",
      "chequeId": "CHQ-1736954400000-A1B2",
      "newBalance": -15
    }
  ]
}
```

## 🔒 Sécurité

### Signature cryptographique Ed25519

Chaque chèque contient une signature pour garantir :
- **Authenticité** : Le chèque a bien été émis par le système
- **Intégrité** : Les données n'ont pas été modifiées
- **Non-répudiation** : Preuve légale de l'opération

**Note** : Actuellement simulée. En production, utiliser une vraie paire de clés Ed25519.

### GPS Geofencing

Chaque opération (dépôt, réception) enregistre :
- Coordonnées GPS précises
- Timestamp exact
- Photo optionnelle

Permet de vérifier que les opérations ont bien eu lieu sur le bon site.

## 🤖 Intelligence Artificielle

### Matching de site

**Algorithme** :

1. **Filtre géographique** : Sites dans un rayon de 30km (Haversine)
2. **Filtre quotas** : Quota disponible ≥ quantité demandée
3. **Tri par priorité** :
   - INTERNAL (sites propres à l'industriel) : score 3
   - NETWORK (réseau partenaire) : score 2
   - EXTERNAL (sites publics) : score 1
4. **Tri secondaire** : Distance croissante
5. **Sélection** : Meilleur site + 2 alternatives

**Recommandation IA** :
Texte généré expliquant le choix :
```
"Site interne recommandé à 12.5km avec 120 places disponibles.
Priorité haute pour optimiser vos coûts logistiques."
```

### Futur : Prédiction des flux

**Idées d'amélioration** :
- Prédire les besoins futurs par analyse historique
- Suggérer des regroupements de livraisons
- Alertes si risque de saturation d'un site
- Optimisation multi-trajets pour les transporteurs

## 📈 Métriques et KPIs

### Dashboard Industriel

- **Solde de palettes** : Crédit/Débit actuel
- **Sites disponibles** : Nombre de sites dans le réseau
- **Mouvements récents** : 5 dernières opérations
- **Graphiques** (futur) : Évolution du solde sur 30 jours

### Dashboard Logisticien

- **Occupation des sites** : % de quota utilisé
- **Palettes reçues aujourd'hui** : Count
- **Réceptions en attente** : Chèques déposés non validés
- **Alertes capacité** : Sites > 80% de quota

## 🔧 Configuration

### Variables d'environnement

#### Service Palette (port 3011)

```bash
PORT=3011
SECURITY_ENFORCE=false                    # true en production
JWT_SECRET=your-secret-key
OPENROUTER_API_KEY=your-openrouter-key   # Pour l'IA (optionnel)
```

#### Applications Web

```bash
NEXT_PUBLIC_PALETTE_API_URL=http://localhost:3011
```

### Seeds personnalisés

Pour ajouter un nouveau site :

```json
{
  "id": "SITE-XXX",
  "companyId": "LOGI-XXX",
  "name": "Nom du site",
  "address": "Adresse complète",
  "gps": { "lat": 48.xxxx, "lng": 2.xxxx },
  "quotaDailyMax": 150,
  "quotaConsumed": 0,
  "openingHours": { "start": "08:00", "end": "18:00" },
  "availableDays": [1, 2, 3, 4, 5],  // 0=Dim, 1=Lun, etc.
  "priority": "NETWORK"
}
```

## 🚀 Démarrage

### 1. Installer les dépendances

```bash
cd "c:/Users/rtard/OneDrive - RT LOGISTIQUE/RT Technologie/RT-Technologie"
pnpm install
```

### 2. Lancer le service backend

```bash
# Option 1 : Service seul
cd services/palette
node src/server.js

# Option 2 : Avec tous les services
pnpm agents
```

### 3. Lancer les applications web

```bash
# Terminal 1 - Industry
pnpm --filter @rt/web-industry dev

# Terminal 2 - Transporter
pnpm --filter @rt/web-transporter dev

# Terminal 3 - Logistician
pnpm --filter @rt/web-logistician dev
```

### 4. Tester le workflow complet

1. Ouvrir http://localhost:3010/palettes/generate (Industry)
2. Générer un chèque avec :
   - ID commande : ORD-123
   - Quantité : 33
   - Immatriculation : AB-123-CD
   - GPS : 48.8566, 2.3522 (Paris)
3. Noter le QR code généré (ex: RT-PALETTE://CHQ-xxxxx)
4. Ouvrir http://localhost:3100/palettes (Transporter)
5. Scanner le QR code (ou saisie manuelle)
6. Déposer les palettes
7. Ouvrir http://localhost:3106/palettes (Logistician)
8. Scanner le même QR code
9. Confirmer la réception
10. Vérifier le ledger sur http://localhost:3010/palettes (Industry)

## 📝 API Reference

### POST /palette/cheques/generate

Générer un nouveau chèque palette avec matching IA.

**Request Body** :
```json
{
  "fromCompanyId": "IND-1",
  "orderId": "ORD-123456",
  "quantity": 33,
  "transporterPlate": "AB-123-CD",
  "deliveryLocation": {
    "lat": 48.8566,
    "lng": 2.3522
  }
}
```

**Response** :
```json
{
  "cheque": {
    "chequeId": "CHQ-1736954400000-A1B2C3D4",
    "fromCompanyId": "IND-1",
    "toSiteId": "SITE-PARIS-1",
    "orderId": "ORD-123456",
    "quantity": 33,
    "transporterPlate": "AB-123-CD",
    "qrCode": "RT-PALETTE://CHQ-1736954400000-A1B2C3D4",
    "signature": "ed25519:...",
    "createdAt": "2025-01-15T14:00:00.000Z",
    "status": "GENERATED"
  },
  "matchedSite": {
    "id": "SITE-PARIS-1",
    "name": "Entrepôt Paris Nord",
    "distance": 5.2,
    "quotaAvailable": 150,
    ...
  },
  "aiRecommendation": "Site interne recommandé..."
}
```

### POST /palette/cheques/:id/deposit

Déposer des palettes (transporteur).

**Request Body** :
```json
{
  "gps": { "lat": 48.9023, "lng": 2.3789 },
  "photo": "base64..." // Optionnel
}
```

### POST /palette/cheques/:id/receive

Réceptionner des palettes (logisticien).

**Request Body** :
```json
{
  "gps": { "lat": 48.9023, "lng": 2.3789 },
  "photo": "base64..." // Optionnel
}
```

### GET /palette/ledger/:companyId

Obtenir le solde et l'historique.

**Response** :
```json
{
  "companyId": "IND-1",
  "balance": -33,
  "history": [...]
}
```

## 🎯 Prochaines étapes

### Court terme

- [ ] Ajout de fonctions admin dans backoffice-admin
- [ ] Intégration complète avec Affret.IA pour suggestions proactives
- [ ] Upload de photos réel (S3)
- [ ] Notifications push temps réel

### Moyen terme

- [ ] Scanner QR natif avec caméra
- [ ] Vrais clés Ed25519 avec HSM
- [ ] Geofencing strict (vérification rayon 100m)
- [ ] Dashboard analytics avancés
- [ ] Export CSV/Excel des rapports

### Long terme

- [ ] Machine Learning pour prédiction de flux
- [ ] Blockchain pour audit trail immuable
- [ ] API publique pour intégration tierce
- [ ] App mobile native (React Native)

## 📞 Support

Pour toute question sur le module Palettes :
- Documentation technique : `docs/MODULE_PALETTES.md`
- Architecture globale : `docs/ARCHITECTURE_CONNEXIONS.md`
- Code source backend : `services/palette/src/server.js`

---

**Module développé dans le cadre du projet RT-Technologie**
**Version** : 1.0.0
**Date** : Janvier 2025
