# Guide de Formation - Module Palettes Europe

## 🎯 Objectif du module

Le module Palettes permet de gérer l'économie circulaire des palettes Europe via un système de chèques dématérialisés avec QR codes, garantissant une traçabilité complète et optimisant les flux de retour grâce à l'intelligence artificielle.

---

## 👥 Pour qui ?

### Industriels
- Génération de chèques palettes lors des livraisons
- Suivi du solde de palettes (crédit/débit)
- Visualisation de l'historique des mouvements

### Transporteurs
- Scan des QR codes sur les chèques palettes
- Dépôt des palettes sur les sites de retour
- Guidage GPS vers le bon site

### Logisticiens
- Réception et validation des palettes déposées
- Gestion des quotas journaliers par site
- Surveillance de la capacité des entrepôts

---

## 📱 Guide Industriel

### 1. Accéder au module
1. Connectez-vous à l'application web-industry
2. Cliquez sur **"Palettes"** dans le menu latéral
3. Vous arrivez sur le tableau de bord avec votre solde actuel

### 2. Consulter votre solde
- **Solde positif** (vert avec ↑) : Vous avez un crédit de palettes
- **Solde négatif** (rouge avec ↓) : Vous avez une dette de palettes
- L'historique des 5 derniers mouvements est affiché en dessous

### 3. Générer un chèque palette

#### Étape par étape
1. Cliquez sur **"+ Générer un chèque"**
2. Remplissez le formulaire :
   - **ID Commande** : Référence de votre commande (ex: ORD-123456)
   - **Quantité de palettes** : Entre 1 et 33 (capacité d'un camion)
   - **Immatriculation transporteur** : Plaque du camion (ex: AB-123-CD)
   - **Adresse de livraison** : Sélectionnez dans la liste ou saisissez
   - **Coordonnées GPS** : Remplies automatiquement si adresse connue

3. Cliquez sur **"Générer avec matching IA"**

#### Ce qui se passe
- L'IA analyse les sites de retour dans un rayon de 30km
- Elle sélectionne le meilleur site selon :
  - **Priorité** : Sites internes > Réseau > Externes
  - **Distance** : Plus proche = mieux
  - **Quotas** : Disponibilité suffisante
- Un QR code unique est généré : `RT-PALETTE://CHQ-xxxxx`
- Votre solde est immédiatement débité

### 4. Transmettre le chèque
- **Option 1** : Imprimez le QR code et collez-le sur les palettes
- **Option 2** : Envoyez le code par email au transporteur
- **Option 3** : Affichez le code à scanner depuis l'app transporteur

### 5. Suivre le statut
Retournez sur la page Palettes pour voir :
- **GÉNÉRÉ** (orange) : Chèque créé, en attente de dépôt
- **DÉPOSÉ** (bleu) : Transporteur a déposé les palettes
- **REÇU** (vert) : Logisticien a validé la réception
- **LITIGE** (rouge) : Problème signalé (quantité, état, etc.)

---

## 🚚 Guide Transporteur

### 1. Accéder au module
1. Connectez-vous à l'application web-transporter
2. Cliquez sur **"Palettes"** dans le menu

### 2. Scanner un chèque palette

#### Option A : Scanner avec caméra (recommandé)
1. Cliquez sur **"📷 Scanner avec caméra"**
2. Autorisez l'accès à la caméra si demandé
3. Pointez vers le QR code sur les palettes
4. Les détails s'affichent automatiquement

#### Option B : Saisie manuelle
1. Cliquez sur **"Saisie manuelle"**
2. Tapez le code complet : `CHQ-xxxxx-xxxxx`
3. Validez

### 3. Vérifier les informations
Avant de partir, vérifiez :
- ✓ **Quantité** : Correspond au nombre de palettes chargées
- ✓ **Site de retour** : Notez l'adresse et les horaires
- ✓ **Immatriculation** : Correspond à votre véhicule

### 4. Se rendre au site de retour
1. Cliquez sur **"Voir les sites"**
2. Trouvez le site assigné dans la liste
3. Cliquez sur **"Ouvrir dans Google Maps"**
4. Suivez l'itinéraire

### 5. Déposer les palettes
Une fois sur place :
1. Déchargez les palettes dans la zone indiquée
2. Revenez dans l'app et cliquez sur **"Déposer les palettes"**
3. L'app enregistre automatiquement :
   - Vos coordonnées GPS actuelles
   - L'heure exacte de dépôt
   - Optionnel : Prenez une photo de preuve

4. Confirmez

### 6. Statut confirmé
Un message vert **"✓ Dépôt effectué"** s'affiche.
Le logisticien est notifié et procédera à la réception.

---

## 📦 Guide Logisticien

### 1. Accéder au module
1. Connectez-vous à l'application web-logistician
2. Cliquez sur **"Palettes"** dans le tableau de bord

### 2. Gérer vos sites
Consultez la section **"📍 Mes sites de retour"** :
- **Capacité journalière** : Quota max vs consommé
- **Barre de progression** :
  - Verte : < 80% (capacité OK)
  - Orange : > 80% (bientôt saturé)
- **Horaires d'ouverture** : Visible pour les transporteurs

### 3. Réceptionner des palettes

#### Quand un transporteur dépose
1. Vous recevez une notification (futur)
2. Allez sur la page Palettes
3. Cliquez sur **"📷 Scanner avec caméra"** ou **"Saisie manuelle"**

#### Scan du QR code
- Si statut = **DÉPOSÉ** (bleu), vous pouvez réceptionner
- Vérifiez les informations :
  - Quantité de palettes
  - État physique des palettes
  - Site de retour correspond à votre entrepôt

#### Validation
1. Si tout est conforme, cliquez sur **"✓ Confirmer la réception"**
2. L'app enregistre :
   - GPS de réception
   - Timestamp exact
   - Optionnel : Photo de conformité

#### Après validation
- Statut passe à **REÇU** (vert)
- Le crédit de palettes est ajouté au compte du propriétaire du site
- Le quota consommé du site diminue

### 4. Gérer un litige
Si problème (quantité incorrecte, palettes abîmées) :
1. Ne validez PAS la réception
2. Cliquez sur **"Signaler un litige"** (futur)
3. Décrivez le problème et joignez des photos
4. Le backoffice admin sera notifié

### 5. Mettre à jour les quotas
Si besoin d'ajuster la capacité journalière :
1. Allez dans les paramètres du site
2. Modifiez **"Quota journalier max"**
3. Sauvegardez

---

## ⚠️ Erreurs courantes et solutions

### "QR code invalide"
- **Cause** : Code incomplet ou mal saisi
- **Solution** : Rescannez ou ressaisissez le code en entier

### "Chèque déjà déposé"
- **Cause** : Tentative de dépôt multiple
- **Solution** : Vérifiez le statut actuel. Si erreur, contactez le support

### "Site à capacité maximale"
- **Cause** : Quota journalier atteint
- **Solution** : Contactez le logisticien ou attendez le lendemain (reset à minuit)

### "GPS non disponible"
- **Cause** : Permissions ou signal GPS faible
- **Solution** :
  1. Activez la localisation dans les paramètres du téléphone
  2. Allez à l'extérieur pour un meilleur signal
  3. En dernier recours : saisie manuelle des coordonnées

---

## 📊 Comprendre le système de Ledger

### Qu'est-ce qu'un ledger ?
C'est un grand livre comptable qui enregistre tous les mouvements de palettes.

### Mouvements types

| Action | Impact Industriel | Impact Logisticien |
|--------|-------------------|---------------------|
| Génération chèque | **-33** palettes | 0 |
| Dépôt transporteur | 0 | 0 |
| Réception logisticien | 0 | **+33** palettes |

### Interpréter votre solde
- **Solde -50** : Vous devez 50 palettes au réseau
- **Solde 0** : Équilibre parfait
- **Solde +50** : Le réseau vous doit 50 palettes

### Historique détaillé
Chaque ligne montre :
- 📅 **Date** : Quand l'opération a eu lieu
- ➕➖ **Delta** : Variation (+/- palettes)
- 📝 **Raison** : GENERATED, DEPOSITED, RECEIVED
- 🆔 **Chèque ID** : Référence pour audit
- 💰 **Nouveau solde** : Solde après cette opération

---

## 🤖 Comment fonctionne le matching IA ?

### Étapes de l'algorithme
1. **Filtre géographique** : Rayon de 30km autour du lieu de livraison
2. **Filtre quotas** : Sites avec capacité suffisante
3. **Tri par priorité** :
   - Score 3 : Sites INTERNAL (vos propres entrepôts)
   - Score 2 : Sites NETWORK (partenaires)
   - Score 1 : Sites EXTERNAL (publics)
4. **Tri secondaire** : Distance croissante
5. **Recommandation** : Meilleur site + 2 alternatives

### Exemple de recommandation
```
"Site interne recommandé à 12.5km avec 120 places disponibles.
Priorité haute pour optimiser vos coûts logistiques."
```

---

## 🔒 Sécurité et traçabilité

### Signature cryptographique Ed25519
- Chaque chèque contient une signature numérique infalsifiable
- Garantit l'authenticité et l'intégrité des données
- Constitue une preuve légale en cas de litige

### Enregistrements GPS
- **Précision** : Latitude/Longitude avec 4 décimales (~11 mètres)
- **Timestamp** : Date et heure exactes (ISO 8601)
- **Géofencing** : Vérification automatique que l'opération a lieu au bon endroit

### Photos optionnelles
- Preuve visuelle de l'état des palettes
- Stockage sécurisé (futur : S3)
- Accessibles en cas d'audit

---

## 📞 Besoin d'aide ?

### Ressources
- 📖 Documentation technique : `docs/MODULE_PALETTES.md`
- 🏗️ Architecture : `docs/ARCHITECTURE_CONNEXIONS.md`
- 💻 Code source : `services/palette/src/server.js`

### Support
- Email : support@rt-technologie.com
- Téléphone : +33 1 XX XX XX XX
- Chat en ligne : Disponible 9h-18h (jours ouvrés)

### Bugs ou suggestions
Signalez via le bouton "🐛 Signaler un bug" dans l'application.

---

**Version du guide** : 1.0.0
**Dernière mise à jour** : Janvier 2025
**Durée de lecture** : 15 minutes
**Niveau** : Débutant à Intermédiaire
