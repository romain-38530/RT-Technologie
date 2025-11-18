# Guide de Formation - Plateforme RT-Technologie Industrie

## 🎯 Objectif de la plateforme

La plateforme RT-Technologie Industrie est ton **centre de commande logistique tout-en-un** qui digitalise et automatise l'ensemble de ta chaîne de transport. Elle te permet de gérer tes commandes, d'affecter automatiquement les meilleurs transporteurs via l'IA, de surveiller la conformité documentaire, de gérer l'économie circulaire des palettes et d'accéder à une marketplace de stockage temporaire.

**Résultat** : Gain de temps de 60%, réduction des coûts logistiques de 20%, et traçabilité complète de bout en bout.

---

## 👥 Pour qui ?

### Responsables logistiques
- Pilotage quotidien des expéditions
- Suivi des commandes en temps réel
- Gestion des transporteurs et grilles tarifaires

### Supply Chain Managers
- Optimisation des coûts de transport
- Analyse des performances (KPIs)
- Négociation avec transporteurs premium

### Directeurs industriels
- Vision stratégique des flux logistiques
- Tableaux de bord décisionnels
- Planification des capacités

---

## 📊 Dashboard et vue d'ensemble

### Accéder au dashboard
1. Connecte-toi sur `https://industry.rt-technologie.com`
2. Tu arrives directement sur le **Dashboard**
3. Vue synthétique de ton activité en un coup d'œil

### KPIs principaux affichés

| Indicateur | Description | Utilité |
|------------|-------------|---------|
| **Total commandes** 📦 | Nombre total de commandes créées | Volume global d'activité |
| **Commandes actives** 📈 | Commandes en cours de traitement | Charge de travail actuelle |
| **En attente** ⏱️ | Commandes sans transporteur affecté | Besoin d'action immédiate |
| **Acceptées** ✅ | Commandes confirmées par transporteurs | Flux sécurisés |
| **Solde palettes** 🪵 | Crédit/Débit de palettes Europe | Gestion économie circulaire |

### Métriques de performance
- **Taux d'acceptation** : % de commandes acceptées par les transporteurs (objectif > 85%)
- **Délai moyen de réponse** : Temps avant acceptation (objectif < 2h)
- **Économies réalisées** : Montant économisé grâce à l'IA et la Bourse de Stockage

### Actions rapides
Le dashboard propose des raccourcis vers les actions fréquentes :
- 📥 **Importer des commandes** (CSV/Excel)
- 🎫 **Générer un chèque palette**
- 📊 **Uploader une grille tarifaire**
- 🚚 **Inviter un transporteur**

---

## 🛡️ Module Vigilance - Documents et blocages transporteurs

### Objectif
Garantir que tu ne travailles qu'avec des transporteurs en règle (assurance, licences, documents légaux à jour). Le système bloque automatiquement les transporteurs non conformes.

### Vue liste des transporteurs

#### Accéder au module
1. Clique sur **"Transporteurs"** dans le menu latéral
2. Liste de tous les transporteurs de ton réseau

#### Informations par transporteur
- **Nom et coordonnées** : Entreprise, email, téléphone
- **Score de performance** : Note sur 100 basée sur :
  - Taux d'acceptation des commandes
  - Respect des délais de livraison
  - Qualité du service (avis clients)
  - Réactivité (temps de réponse)

- **Statut de vigilance** :
  - 🟢 **OK** : Tous documents valides, peut recevoir des commandes
  - 🟠 **WARNING** : Document expire bientôt (< 30 jours), alerte envoyée
  - 🔴 **BLOCKED** : Document expiré ou manquant, **ne peut PAS recevoir de commandes**

### Documents surveillés

Le système vérifie automatiquement :

| Document | Fréquence vérif | Action si expiré |
|----------|-----------------|------------------|
| **Assurance RC** | Quotidienne | Blocage immédiat |
| **Licence de transport** | Hebdomadaire | Blocage sous 7j |
| **Kbis** | Mensuelle | Warning puis blocage |
| **Attestation sociale URSSAF** | Mensuelle | Blocage sous 15j |
| **Certificat ADR** (si transport matières dangereuses) | Hebdomadaire | Blocage immédiat |

### Alertes automatiques

Tu reçois des notifications :
- **30 jours avant expiration** : Email au transporteur + copie à toi
- **15 jours avant expiration** : Alerte rouge dans l'interface
- **Expiration** : Blocage automatique + notification urgente

### Gérer un transporteur bloqué

Si un transporteur passe en **BLOCKED** :
1. Il ne recevra PLUS AUCUNE nouvelle commande via Affret.IA
2. Ses commandes en cours ne sont PAS annulées (continuent normalement)
3. Tu peux :
   - **Contacter le transporteur** : Bouton "Voir profil" > "Envoyer un rappel"
   - **Voir les documents manquants** : Onglet "Documents" sur son profil
   - **Réactiver manuellement** : Si tu reçois les documents par email (admin only)

### Inviter un nouveau transporteur

1. Clique sur **"Inviter un transporteur"**
2. Remplis :
   - Nom de l'entreprise
   - Email de contact
3. **Envoie l'invitation**
4. Le transporteur reçoit un email avec lien d'inscription
5. Il doit uploader ses documents **avant** de pouvoir recevoir des commandes
6. Tu reçois une notification quand le profil est complet

---

## 📦 Gestion des commandes

### Créer des commandes

#### Option 1 : Import CSV/Excel (recommandé)
1. Va sur **"Commandes"** > **"Importer"**
2. Télécharge le **modèle CSV** fourni
3. Remplis les colonnes :
   - `ref` : Référence interne (ex: CMD-2024-001)
   - `ship_from_address`, `ship_from_city`, `ship_from_postalCode`, `ship_from_country`
   - `ship_to_address`, `ship_to_city`, `ship_to_postalCode`, `ship_to_country`
   - `pallets` : Nombre de palettes (1-33)
   - `weight` : Poids total en kg
   - `pickup_start`, `pickup_end` : Fenêtre de chargement (format ISO 8601)
   - `delivery_start`, `delivery_end` : Fenêtre de livraison
4. Upload le fichier
5. Vérification automatique :
   - ✅ Adresses valides
   - ✅ Fenêres temporelles cohérentes
   - ✅ Poids/palettes dans les limites
6. Confirme l'import
7. Les commandes passent en statut **NEW**

#### Option 2 : Création manuelle (cas isolés)
1. **"Commandes"** > **"+ Nouvelle commande"**
2. Remplis le formulaire étape par étape
3. Sauvegarde

### Statuts des commandes

| Statut | Signification | Action requise |
|--------|---------------|----------------|
| **NEW** | Commande créée, pas encore affectée | Lancer dispatch |
| **DISPATCHED** | Envoyée à un transporteur premium | Attendre acceptation |
| **ACCEPTED** | Transporteur a accepté | Suivre pickup |
| **IN_TRANSIT** | En cours de livraison | Suivre tracking |
| **DELIVERED** | Livrée avec succès | Clôture automatique |
| **CANCELLED** | Annulée (par toi ou transporteur) | Ré-affecter si besoin |
| **ESCALATED_AFFRETIA** | Escalade vers Affret.IA (SLA dépassé) | Aucune, IA prend le relais |

### Filtrer et rechercher
- **Barre de recherche** : Recherche par référence ou ID
- **Filtres** :
  - Par statut (NEW, DISPATCHED, etc.)
  - Par date de création
  - Par transporteur affecté
  - Par destination

### Détails d'une commande
Clique sur **"Voir détails"** pour accéder à :
- **Informations générales** : Référence, statut, dates
- **Expédition** : Adresse départ, fenêtre pickup
- **Destination** : Adresse arrivée, fenêtre delivery
- **Marchandise** : Palettes, poids, type
- **Transporteur** : Nom, contact, score
- **Tarification** : Prix négocié, devise, breakdown (si palettes)
- **Documents** : CMR, BL, facture, POD (Proof of Delivery)
- **Timeline** : Historique complet des événements

---

## 🤖 Affret.IA - Affectation automatisée avec SLA et escalade

### Qu'est-ce qu'Affret.IA ?

Affret.IA est l'**intelligence artificielle de dispatching** qui sélectionne automatiquement le meilleur transporteur pour chaque commande en optimisant prix, fiabilité, et délais. Si un transporteur ne répond pas dans les SLA définis, le système **escalade automatiquement** vers d'autres transporteurs.

### Workflow complet

#### 1. Configuration de la chaîne d'affectation (Dispatch Policy)

Avant de lancer Affret.IA, définis une **chaîne de transporteurs prioritaires** :

**Exemple de chaîne** :
```
Ordre 1 : CAR-PREMIUM-001 (transporteur premium, SLA 2h)
Ordre 2 : CAR-PREMIUM-002 (transporteur premium alternatif, SLA 2h)
Ordre 3 : Affret.IA (IA sélectionne parmi tous les transporteurs premium)
```

Configuration :
1. Va sur **"Commandes"** > Sélectionne une commande **NEW**
2. Clique sur **"Configurer dispatch"**
3. Drag & drop les transporteurs dans l'ordre de priorité
4. Définis le **SLA d'acceptation** (temps max pour répondre) :
   - Standard : **2 heures**
   - Urgent : **30 minutes**
   - Flexible : **4 heures**
5. Sauvegarde la politique

#### 2. Lancement du dispatch

1. Clique sur **"Lancer dispatch"** sur la commande
2. Le système :
   - Envoie la commande au **premier transporteur de la chaîne**
   - Démarre le timer SLA
   - Change le statut en **DISPATCHED**

#### 3. Suivi du SLA

L'interface affiche :
- ⏱️ **Temps restant** : Compte à rebours avant escalade
- 🟢 **Dans les temps** : < 50% du SLA écoulé
- 🟠 **Attention** : 50-90% du SLA écoulé
- 🔴 **Critique** : > 90% du SLA écoulé

#### 4. Scénarios possibles

**Scénario A : Acceptation rapide** ✅
- Le transporteur accepte dans le SLA
- Statut passe à **ACCEPTED**
- Les autres transporteurs de la chaîne ne sont PAS sollicités
- Tu reçois une notification de confirmation

**Scénario B : Refus** ❌
- Le transporteur refuse (capacité insuffisante, tarif trop bas, etc.)
- Le système passe **immédiatement** au transporteur suivant de la chaîne
- Nouveau SLA démarre
- Tu es notifié du refus avec raison

**Scénario C : Timeout (pas de réponse)** ⏰
- Le SLA expire sans réponse
- **Escalade automatique** vers le transporteur suivant
- Statut devient **ESCALATED_AFFRETIA** si on atteint la fin de la chaîne
- Email d'alerte envoyé

**Scénario D : Affret.IA prend le relais** 🤖
- Si tous les transporteurs de la chaîne ont échoué/refusé
- Affret.IA calcule un **devis automatique** basé sur :
  - Grilles tarifaires (si disponibles)
  - Distance et type de transport (FTL/LTL)
  - Coût de retour des palettes (via service Palette)
  - Marge de 5% pour garantir acceptation
- Affret.IA envoie des **enchères inversées** à TOUS les transporteurs premium autorisés
- Le premier à accepter dans le budget remporte la commande

### Comment l'IA calcule le devis ?

#### Étape 1 : Recherche dans les grilles tarifaires
Si tu as uploadé des grilles FTL/LTL pour l'origine de la commande :
- **FTL (Full Truck Load)** : Si commande ≥ 33 palettes ou ≥ 12 tonnes
  - L'IA cherche une ligne `origin → destination` dans ta grille FTL
  - Exemple : PARIS → LYON = 450 EUR

- **LTL (Less Than Truck Load)** : Si commande < 33 palettes
  - L'IA cherche une ligne avec `minPallets ≤ palettes ≤ maxPallets`
  - Exemple : PARIS → LYON, 10-20 palettes = 25 EUR/palette
  - Calcul : 15 palettes × 25 EUR = 375 EUR

#### Étape 2 : Intégration du coût palettes
Si la commande contient des palettes :
1. Appel au **service Palette** pour trouver le meilleur site de retour dans un rayon de 30km
2. Calcul du coût de retour :
   ```
   Coût retour = (Distance au site × 0.50 EUR/km) + (Nombre palettes × 5 EUR)
   Exemple : (12 km × 0.50) + (15 × 5) = 6 + 75 = 81 EUR
   ```
3. **Prix total** = Prix transport + Coût retour
   ```
   375 EUR (transport) + 81 EUR (retour palettes) = 456 EUR
   ```

#### Étape 3 : Utilisation de l'IA générative (si OpenRouter configuré)
Si pas de grille tarifaire disponible :
- L'IA analyse la commande (origine, destination, poids, palettes)
- Consulte sa base de connaissances de tarifs logistiques
- Propose un prix de marché compétitif
- Suggère 2 transporteurs premium adaptés

#### Étape 4 : Marge de sécurité
L'IA ajoute **+5% au prix de référence** pour augmenter les chances d'acceptation rapide.

**Prix final affiché** :
```json
{
  "price": 456,
  "currency": "EUR",
  "priceBreakdown": {
    "baseTransport": 375,
    "palletReturn": 81,
    "total": 456
  },
  "palletInfo": {
    "returnSite": {
      "name": "Entrepôt Lyon Sud",
      "distance": 12.3,
      "address": "..."
    },
    "recommendation": "Retour palettes suggéré: Entrepôt Lyon Sud à 12.3km. Coût: 81 EUR."
  }
}
```

### Critères de sélection IA

Quand Affret.IA doit choisir parmi plusieurs transporteurs :

| Critère | Poids | Calcul |
|---------|-------|--------|
| **Prix** | 40% | Plus bas que moyenne = meilleur score |
| **Score transporteur** | 30% | Basé sur historique (taux succès > 80%) |
| **Réactivité** | 20% | Temps de réponse moyen < 2h |
| **Distance base-pickup** | 10% | Proximité du dépôt transporteur |

**Exemple de scoring** :
```
Transporteur A :
- Prix : 450 EUR (moyenne = 480) → Score prix = 44/40 (bonus!)
- Scoring historique : 92% → 27.6/30
- Réactivité : 1.5h → 18/20
- Distance base : 25 km → 8/10
→ TOTAL : 97.6/100 🥇
```

### Optimisation des tournées palettes

Affret.IA propose une fonctionnalité avancée : **optimisation des retours palettes sur tournée multi-livraisons**.

#### Cas d'usage
Tu as un camion qui doit faire 5 livraisons dans la journée. Au lieu de faire des retours palettes aléatoires, l'IA optimise le trajet pour minimiser la distance totale.

#### Utilisation
1. Va sur **"Commandes"** > **"Optimiser tournée"**
2. Sélectionne les commandes à regrouper (même transporteur)
3. Clique sur **"Lancer optimisation IA"**
4. L'IA calcule :
   - L'ordre optimal des livraisons (algorithme du voyageur de commerce - TSP)
   - Pour chaque livraison, le meilleur site de retour palettes
   - La route complète : Livraison 1 → Site retour 1 → Livraison 2 → Site retour 2 → etc.
5. Résultat affiché :
   ```
   Route optimisée :
   1. Livraison CMD-001 à Lyon (12 palettes)
   2. Retour palettes → Entrepôt Lyon Sud (12 km)
   3. Livraison CMD-003 à Villeurbanne (8 palettes)
   4. Retour palettes → Entrepôt Lyon Nord (5 km)
   5. Livraison CMD-002 à Saint-Priest (15 palettes)
   6. Retour palettes → Entrepôt Lyon Sud (8 km)

   Distance totale : 127.5 km (vs 185 km non optimisé)
   Économie : 57.5 km × 0.50 EUR = 28.75 EUR
   ```

6. Tu peux exporter la feuille de route en PDF pour le chauffeur

---

## 📅 Planification RDV quais (Time Windows)

### Objectif
Éviter les attentes aux quais de chargement et de livraison en définissant des **créneaux horaires précis**.

### Définir un créneau de pickup
Lors de la création/import de commande :
- **Pickup Start** : 2024-01-20T08:00:00Z (début fenêtre chargement)
- **Pickup End** : 2024-01-20T10:00:00Z (fin fenêtre)

**Exemple** : Le transporteur doit charger entre 8h et 10h le 20 janvier.

### Définir un créneau de delivery
- **Delivery Start** : 2024-01-21T14:00:00Z
- **Delivery End** : 2024-01-21T16:00:00Z

**Exemple** : Livraison entre 14h et 16h le 21 janvier.

### Validation automatique
Le système vérifie :
- ✅ Delivery Start > Pickup End (temps de transit minimum respecté)
- ✅ Créneaux ne se chevauchent pas avec d'autres commandes sur le même quai (futur)
- ✅ Respect des horaires d'ouverture des sites

### Alertes de retard
Si le transporteur n'a pas confirmé le pickup à Pickup End + 1h :
- 🔴 Alerte rouge dans l'interface
- 📧 Email au transporteur + copie à toi
- Option de **re-dispatcher** la commande

---

## 💰 Grilles tarifaires transporteurs

### Objectif
Centraliser tous les tarifs négociés avec tes transporteurs pour que l'IA puisse calculer automatiquement les devis.

### Créer des Origins (points de départ)

Avant d'uploader des grilles, définis tes **origines logistiques** :

1. Va sur **"Grilles tarifaires"**
2. Section **"Origins"** > **"+ Ajouter"**
3. Remplis :
   - **ID** : Code court (ex: PARIS, LYON, MARSEILLE)
   - **Label** : Nom complet (ex: "Hub Paris Nord")
   - **Ville** : Paris
   - **Pays** : FR
4. Sauvegarde

**Pourquoi ?** Les grilles sont organisées par origine. Une grille PARIS → * contient toutes les destinations depuis Paris.

### Uploader une grille FTL (Full Truck Load)

#### Étape 1 : Prépare ton fichier CSV
Colonnes requises :
```csv
origin,to,price,currency
PARIS,LYON,450,EUR
PARIS,MARSEILLE,620,EUR
PARIS,BORDEAUX,580,EUR
LYON,MARSEILLE,320,EUR
```

#### Étape 2 : Upload
1. **"Grilles tarifaires"** > **"Uploader une grille"**
2. Sélectionne :
   - **Mode** : FTL
   - **Origin** : PARIS (dropdown)
3. Upload le fichier CSV
4. Vérification :
   - ✅ Toutes les lignes ont bien origin = PARIS
   - ✅ Prix sont des nombres > 0
   - ✅ Destinations valides
5. Confirme

#### Résultat
La grille est stockée et utilisable immédiatement par Affret.IA.

### Uploader une grille LTL (Less Than Truck Load)

#### Différence avec FTL
En LTL, le prix dépend du **nombre de palettes** transportées.

#### Étape 1 : Prépare ton fichier CSV
Colonnes requises :
```csv
origin,to,minPallets,maxPallets,pricePerPallet,currency
PARIS,LYON,1,5,35,EUR
PARIS,LYON,6,15,28,EUR
PARIS,LYON,16,32,22,EUR
PARIS,MARSEILLE,1,10,42,EUR
PARIS,MARSEILLE,11,25,35,EUR
```

**Interprétation** :
- Ligne 1 : PARIS → LYON, 1-5 palettes = 35 EUR/palette
- Ligne 2 : PARIS → LYON, 6-15 palettes = 28 EUR/palette (dégressif)
- Ligne 3 : PARIS → LYON, 16-32 palettes = 22 EUR/palette (encore moins cher)

#### Étape 2 : Upload
Même processus que FTL, mais sélectionne **Mode : LTL**.

### Mettre à jour une grille
1. Va sur **"Grilles tarifaires"**
2. Trouve la grille à modifier (ex: PARIS - FTL, 15 lignes)
3. **Option 1** : Uploader un nouveau fichier complet (écrase l'ancien)
4. **Option 2** : Éditer ligne par ligne (futur)

### Visualiser les tarifs
Tableau de synthèse :
- **Origin** : PARIS
- **Mode** : FTL
- **Lignes** : 15 destinations

Clique sur une grille pour voir le détail ligne par ligne.

---

## 🪵 Intégration avec le module Palettes

### Vue d'ensemble
Le module Palettes est **intégré nativement** dans la plateforme Industrie. Tu n'as pas besoin de changer d'interface.

### Accès rapide
- Menu latéral > **"Palettes"**
- Ou depuis le Dashboard > Widget **"Solde palettes"**

### Fonctionnalités disponibles
Toutes les fonctionnalités du module Palettes sont accessibles :
- ✅ Génération de chèques palettes avec QR code
- ✅ Suivi du solde (crédit/débit)
- ✅ Historique des mouvements (ledger)
- ✅ Matching IA du meilleur site de retour

👉 **Pour tout savoir** : Consulte le **[GUIDE_PALETTES.md](./GUIDE_PALETTES.md)** dédié.

### Workflow intégré commande + palettes

**Scénario** : Tu crées une commande avec 20 palettes.

1. **Création commande** :
   - Référence : CMD-2024-042
   - Palettes : 20
   - Destination : Lyon

2. **Affret.IA calcule le devis** :
   - Prix transport : 375 EUR
   - **Recherche automatique du site de retour** dans un rayon de 30km autour de Lyon
   - Site trouvé : "Entrepôt Lyon Sud" à 12 km
   - Coût retour : (12 × 0.50) + (20 × 5) = 106 EUR
   - **Prix total** : 375 + 106 = 481 EUR

3. **Génération automatique du chèque palette** (optionnel) :
   - Une fois la commande ACCEPTED, tu peux générer le chèque
   - Bouton **"Générer chèque pour cette commande"** dans les détails
   - Pré-rempli avec :
     - Quantité : 20 palettes
     - Immatriculation : Récupérée du profil transporteur
     - Destination : Lyon (GPS auto-calculé)
     - Site de retour : Entrepôt Lyon Sud (déjà trouvé par l'IA)
   - Clique sur **"Générer"**
   - QR code créé instantanément
   - Ton solde est débité de -20 palettes

4. **Suivi du retour** :
   - Le transporteur scanne le QR code (app mobile)
   - Il dépose les palettes à l'Entrepôt Lyon Sud
   - Le logisticien réceptionne et valide
   - Ton solde remonte de +20 palettes

**Avantage** : Tout est fluide, pas besoin de jongler entre plusieurs interfaces.

---

## 🏢 Intégration avec la Bourse de Stockage

### Vue d'ensemble
La Bourse de Stockage te permet de **trouver des espaces de stockage temporaires** quand tu manques de capacité.

### Accès
- Menu latéral > **"Bourse de Stockage"**
- Sous-menu :
  - **Besoins** : Tes demandes de stockage
  - **Offres** : Propositions reçues
  - **Contrats** : Espaces loués actuellement
  - **Analytics** : Stats et économies

### Fonctionnalités disponibles
- ✅ Publier un besoin de stockage (surface, durée, contraintes)
- ✅ Recevoir des offres classées par IA
- ✅ Comparer et négocier
- ✅ Signer des contrats électroniquement
- ✅ Suivre les facturations

👉 **Pour tout savoir** : Consulte le **[GUIDE_BOURSE_STOCKAGE.md](./GUIDE_BOURSE_STOCKAGE.md)** dédié.

### Cas d'usage concret

**Problème** : Pic de production prévu en mars, tes entrepôts seront pleins.

**Solution via la Bourse** :
1. Publie un besoin :
   - Surface : 500 m²
   - Type : Température contrôlée (15-25°C)
   - Durée : 3 mois (spot)
   - Budget max : 10 EUR/m²/mois
   - Rayon : 50 km autour de ton usine

2. L'IA analyse et envoie le besoin aux logisticiens pertinents

3. Tu reçois 7 offres en 24h :
   - Offre A : 8.50 EUR/m² (score IA : 95/100) 🥇
   - Offre B : 9.00 EUR/m² (score IA : 88/100) 🥈
   - Offre C : 7.80 EUR/m² (score IA : 82/100) 🥉 (plus loin, moins fiable)
   - ...

4. Tu compares les 3 meilleures avec le **comparateur** :
   - Prix total sur 3 mois
   - Services inclus (WMS, chariots, sécurité)
   - Distance
   - Avis clients

5. Tu négocies avec l'Offre A pour descendre à 8 EUR/m²

6. Acceptation → **Contrat auto-généré**

7. Facturation mensuelle automatique : 500 m² × 8 EUR = 4 000 EUR/mois

**Économie** : 2 000 EUR/mois vs tarif standard, soit 6 000 EUR sur 3 mois.

---

## ⚠️ Erreurs courantes et solutions

### Problème : "Aucun transporteur disponible pour cette commande"

**Causes possibles** :
1. Tous les transporteurs premium sont en statut **BLOCKED** (documents expirés)
2. La chaîne de dispatch est vide
3. Aucun transporteur n'a de capacité sur la date demandée

**Solutions** :
- ✅ Va sur **"Transporteurs"** et vérifie les statuts de vigilance
- ✅ Contacte les transporteurs BLOCKED pour renouveler leurs documents
- ✅ Invite de nouveaux transporteurs premium
- ✅ Modifie les fenêtres de pickup/delivery pour plus de flexibilité

---

### Problème : "Affret.IA ne trouve pas de grille tarifaire"

**Causes** :
1. Tu n'as pas uploadé de grille pour cette origine
2. L'origine dans la commande ne correspond pas à un ID d'origin configuré
3. La destination n'est pas dans la grille

**Solutions** :
- ✅ Vérifie que le champ `origin` de la commande = un ID d'origin (ex: "PARIS")
- ✅ Upload une grille pour cette origine si manquante
- ✅ Ajoute la destination dans ta grille existante
- ✅ En dernier recours : L'IA calcule un devis estimatif (moins précis)

---

### Problème : "Escalade vers Affret.IA, mais aucune réponse"

**Causes** :
1. Budget calculé par l'IA trop bas, aucun transporteur n'accepte
2. Transporteurs premium saturés
3. Route non desservie par ton réseau

**Solutions** :
- ✅ Augmente le budget max acceptable (paramètres Affret.IA)
- ✅ Contacte manuellement des transporteurs externes (hors plateforme)
- ✅ Négocie un tarif exceptionnel avec un transporteur de confiance
- ✅ Reporte la livraison si possible

---

### Problème : "Le solde palettes est très négatif"

**Causes** :
1. Tu génères beaucoup de chèques mais peu de retours
2. Les transporteurs ne déposent pas les palettes aux bons sites
3. Les logisticiens tardent à réceptionner

**Solutions** :
- ✅ Va sur **"Palettes"** > Onglet **"Alertes"**
- ✅ Consulte l'onglet **"Historique"** pour voir où sont bloquées les palettes
- ✅ Contacte les transporteurs/logisticiens en retard
- ✅ Vérifie que les sites de retour ont des quotas suffisants
- ✅ Planifie un **ramassage massif** pour régulariser

---

### Problème : "Impossible d'uploader une grille CSV"

**Causes** :
1. Mauvais format de fichier (Excel au lieu de CSV)
2. Colonnes manquantes ou mal nommées
3. Caractères spéciaux dans les noms de villes

**Solutions** :
- ✅ Télécharge le **modèle CSV officiel** depuis l'interface
- ✅ Enregistre ton fichier en **CSV UTF-8** (pas Excel .xlsx)
- ✅ Vérifie que les noms de colonnes sont EXACTEMENT : `origin`, `to`, `price`, `currency` (FTL) ou `minPallets`, `maxPallets`, `pricePerPallet` (LTL)
- ✅ Remplace les accents et caractères spéciaux (ex: "Saint-Étienne" → "Saint-Etienne")

---

### Problème : "Le transporteur a accepté mais ne se présente pas"

**Causes** :
1. Problème de communication (email non reçu)
2. Transporteur a oublié ou surbooké
3. Problème technique (app mobile)

**Solutions** :
- ✅ Clique sur **"Rappeler au transporteur"** dans les détails de la commande
- ✅ Appelle directement le transporteur (numéro affiché dans son profil)
- ✅ Si pas de réponse sous 1h, clique sur **"Annuler et re-dispatcher"**
- ✅ L'IA relance automatiquement la chaîne de dispatch
- ✅ Signale le transporteur (impacte son score de fiabilité)

---

## 📊 KPIs et métriques à suivre

### KPIs Opérationnels (quotidiens)

| KPI | Objectif | Où le trouver |
|-----|----------|---------------|
| **Taux d'acceptation** | > 85% | Dashboard principal |
| **Délai moyen de réponse** | < 2h | Dashboard > Vue d'ensemble |
| **Commandes en attente** | < 10 | Dashboard > Carte "En attente" |
| **Taux d'escalade** | < 15% | Commandes > Filtre "ESCALATED" |
| **Solde palettes** | Entre -50 et +50 | Dashboard > Widget Palettes |

### KPIs Financiers (mensuels)

| KPI | Objectif | Où le trouver |
|-----|----------|---------------|
| **Coût moyen par commande** | Réduction 5%/an | Analytics > Coûts |
| **Économies Affret.IA** | Track vs tarifs standards | Analytics > Affret.IA |
| **Économies Bourse Stockage** | Montant total économisé | Bourse > Analytics |
| **Coût total palettes** | Optimiser retours | Palettes > Analytics |

### KPIs Qualité (mensuels)

| KPI | Objectif | Où le trouver |
|-----|----------|---------------|
| **Taux de livraison à l'heure** | > 95% | Analytics > Délais |
| **Taux de litiges** | < 2% | Analytics > Qualité |
| **Score moyen transporteurs** | > 80/100 | Transporteurs > Vue liste |
| **Taux de documents OK** | 100% | Transporteurs > Vigilance |

### Tableau de bord décisionnel (hebdomadaire)

Va sur **"Analytics"** > **"Tableau de bord exécutif"** pour voir :

1. **Graphiques de tendances** :
   - Volume de commandes (7 derniers jours, 30 jours, 12 mois)
   - Évolution des coûts moyens
   - Performance des transporteurs

2. **Top transporteurs** :
   - Top 5 par volume
   - Top 5 par score qualité
   - Pires 3 (alertes)

3. **Alertes stratégiques** :
   - Transporteurs saturés (> 90% capacité)
   - Routes coûteuses (> moyenne +20%)
   - Sites palettes saturés

4. **Prévisions IA** :
   - Volume attendu semaine prochaine
   - Budget prévisionnel mois prochain
   - Besoins de stockage anticipés

---

## 📞 Support et ressources

### Documentation technique

| Document | Description | Lien |
|----------|-------------|------|
| **GUIDE_PALETTES.md** | Guide complet module Palettes | [Voir fichier](./GUIDE_PALETTES.md) |
| **GUIDE_BOURSE_STOCKAGE.md** | Guide complet Bourse de Stockage | [Voir fichier](./GUIDE_BOURSE_STOCKAGE.md) |
| **API_AFFRET_IA.md** | Documentation API Affret.IA | `/docs/api/` |
| **ARCHITECTURE_CONNEXIONS.md** | Architecture système complète | `/docs/` |

### Code source (développeurs)

| Service | Chemin | Langage |
|---------|--------|---------|
| **Web Industry** | `/apps/web-industry/` | Next.js (React/TypeScript) |
| **Affret-IA** | `/services/affret-ia/src/server.js` | Node.js |
| **Core Orders** | `/services/core-orders/` | Node.js |
| **Vigilance** | `/services/vigilance/` | Node.js |

### Contacter le support

#### Support technique (bugs, incidents)
- 📧 **Email** : support@rt-technologie.com
- 📞 **Téléphone** : +33 1 XX XX XX XX
- 💬 **Chat en ligne** : Widget en bas à droite (9h-18h, jours ouvrés)
- ⏱️ **SLA de réponse** :
  - Critique (production arrêtée) : 1h
  - Important : 4h
  - Normal : 24h

#### Support fonctionnel (questions d'utilisation)
- 📖 **Centre d'aide** : https://help.rt-technologie.com
- 🎥 **Vidéos tutoriels** : https://help.rt-technologie.com/videos
- 💡 **FAQ** : https://help.rt-technologie.com/faq

#### Formations gratuites

**Webinaires en ligne** (tous les mardis, 14h-15h30) :
- Semaine 1 : Prise en main de la plateforme
- Semaine 2 : Affret.IA et dispatch automatisé
- Semaine 3 : Module Palettes et économie circulaire
- Semaine 4 : Bourse de Stockage et optimisation capacité
- Inscription : formations@rt-technologie.com

**Sessions individuelles** (sur demande) :
- Onboarding personnalisé (2h)
- Optimisation de vos processus (1h)
- Support à la migration depuis ancien système (4h)
- Gratuit pour clients PRO/ENTERPRISE, 150 EUR/h pour clients FREE

### Signaler un bug

Utilise le bouton **"Signaler un bug"** (icône 🐛 en haut à droite) :
1. Décris le problème
2. Ajoute des captures d'écran
3. Indique les étapes pour reproduire
4. Tu reçois un numéro de ticket
5. Suivi par email

### Proposer une amélioration

Va sur **"Paramètres"** > **"Feedback"** :
- Vote pour les fonctionnalités demandées par d'autres
- Propose tes idées (roadmap communautaire)
- Participe au programme bêta-testeurs

---

## 🚀 Bonnes pratiques et conseils d'expert

### 1. Configure ta chaîne de dispatch dès le départ
Ne laisse PAS Affret.IA gérer seul toutes les commandes dès le début. Définis une **chaîne hybride** :
- 1er niveau : Tes 2-3 transporteurs premium les plus fiables
- 2e niveau : Affret.IA en backup

**Pourquoi ?** Tu gardes le contrôle sur les commandes stratégiques tout en profitant de l'automatisation.

---

### 2. Upload tes grilles tarifaires AVANT d'importer des commandes
Si l'IA n'a pas de grilles, elle fera des estimations moins précises.

**Workflow recommandé** :
1. Jour 1 : Configure tes Origins
2. Jour 2 : Upload toutes tes grilles FTL/LTL
3. Jour 3 : Teste avec 5-10 commandes fictives
4. Jour 4 : Lance en production

---

### 3. Surveille le solde palettes chaque semaine
Un solde très négatif peut bloquer la génération de nouveaux chèques.

**Routine hebdomadaire** :
- Lundi matin : Check solde palettes
- Si < -100 : Lancer l'alerte IA (bouton dans le module)
- Contacter les logisticiens pour ramassages urgents

---

### 4. Invite des transporteurs en avance
Ne te retrouve pas bloqué avec un seul transporteur disponible.

**Règle des 3** : Pour chaque route fréquente, avoir au minimum 3 transporteurs premium.

**Exemple** :
- PARIS → LYON : CAR-001, CAR-005, CAR-012
- PARIS → MARSEILLE : CAR-002, CAR-007, CAR-008
- etc.

---

### 5. Utilise les Time Windows intelligemment
Ne mets PAS des fenêtres trop étroites (ex: 8h-9h = 1h).

**Best practice** :
- Pickup : Fenêtre de **2-3h** (ex: 8h-11h)
- Delivery : Fenêtre de **4h** (ex: 14h-18h)

**Pourquoi ?** Plus de flexibilité = plus de transporteurs peuvent accepter.

---

### 6. Analyse tes coûts mensuellement
Va sur **Analytics** > **"Coûts par route"** :
- Identifie les routes les plus chères
- Négocie de meilleures grilles avec les transporteurs sur ces routes
- Économies potentielles : 10-20%/an

---

### 7. Participe à la Bourse de Stockage même si tu n'as pas de besoin immédiat
Tu peux **devenir offreur** si tu as des espaces vides :
- Menu **"Bourse de Stockage"** > **"Devenir logisticien"**
- Loue tes espaces inutilisés
- Génère des revenus passifs (1 000-5 000 EUR/mois selon surface)

---

### 8. Active les alertes Affret.IA
**"Paramètres"** > **"Notifications"** > Active :
- ✅ Alerte si SLA > 90% écoulé
- ✅ Alerte si escalade vers IA
- ✅ Alerte quotas palettes
- ✅ Alerte documents transporteurs (30j avant expiration)

---

## 🔐 Sécurité et conformité

### Protection des données (RGPD)
- Toutes tes données sont hébergées en **France** (OVH/Azure)
- Chiffrement TLS 1.3 pour toutes les communications
- Backup quotidien avec rétention 90 jours
- Export de tes données possible à tout moment (RGPD Article 20)

### Authentification
- **SSO disponible** (Single Sign-On) pour clients ENTERPRISE
- Authentification à 2 facteurs (2FA) recommandée
- Gestion des rôles (Admin, User, Viewer)

### Audit trail
Toutes les actions sont tracées :
- Qui a créé/modifié une commande
- Qui a lancé un dispatch
- Qui a uploadé une grille
- Logs accessibles 12 mois

### Conformité légale
- **Facturation conforme** (directive européenne 2014/55/UE)
- **CMR électronique** : Valeur légale identique au papier (règlement UE 2020/1055)
- **Signature électronique certifiée** (eIDAS) pour les contrats de stockage

---

## 🌍 Roadmap et fonctionnalités à venir

### T1 2025 (janvier-mars)
- ✅ Module Palettes (LANCÉ)
- ✅ Bourse de Stockage (LANCÉ)
- 🚧 Intégration tracking temps réel (GPS camions)
- 🚧 Application mobile transporteur (iOS/Android)

### T2 2025 (avril-juin)
- 🔜 Module CO2 : Calcul empreinte carbone par commande
- 🔜 Optimisation IA multi-objectifs (prix + CO2 + délai)
- 🔜 Chatbot assistant (questions en langage naturel)

### T3 2025 (juillet-septembre)
- 🔜 Marketplace transporteurs (au-delà de ton réseau)
- 🔜 Facturation automatisée (intégration ERP)
- 🔜 Module Assurance transport (couverture marchandises)

### T4 2025 (octobre-décembre)
- 🔜 Prévisions IA (anticipe tes besoins 3 mois à l'avance)
- 🔜 Intégration blockchain (preuve d'authenticité CMR)
- 🔜 Version EN/DE/ES (multilingue)

**Note** : La roadmap est indicative et peut évoluer selon les retours clients.

---

## ❓ FAQ - Questions fréquentes

### Puis-je utiliser la plateforme sans avoir de transporteurs premium ?
**Réponse** : Oui, mais avec limitations. Affret.IA a besoin d'au moins 1 transporteur premium pour fonctionner. Tu peux inviter gratuitement des transporteurs via l'interface. Si tu n'en as aucun, contacte le support pour qu'on te connecte avec notre réseau partenaire.

---

### Les grilles tarifaires sont-elles visibles par les transporteurs ?
**Réponse** : Non, tes grilles sont **strictement confidentielles**. Les transporteurs ne voient que les devis finaux calculés par l'IA, pas la structure de tes grilles.

---

### Que se passe-t-il si un transporteur perd le chèque palette (QR code) ?
**Réponse** : Aucun problème. Tu peux ré-envoyer le QR code depuis **"Palettes"** > **"Historique"** > Clique sur le chèque > **"Renvoyer par email"**. Le QR code reste valide tant que le statut n'est pas REÇU.

---

### Puis-je annuler une commande déjà ACCEPTED ?
**Réponse** : Oui, mais avec pénalités potentielles. Clique sur **"Annuler la commande"** dans les détails. Le transporteur sera notifié. Selon ton contrat avec lui, des frais d'annulation peuvent s'appliquer (généralement 20-30% du prix).

---

### L'IA peut-elle se tromper dans le calcul du devis ?
**Réponse** : Rarement, mais possible. L'IA se base sur tes grilles + historique de prix. Si un devis te semble aberrant :
1. Vérifie tes grilles (erreur de saisie ?)
2. Contacte le support avec la référence commande
3. Tu peux **forcer un prix manuel** en mode admin

---

### Combien coûte la plateforme ?
**Réponse** :
- **FREE** : 0 EUR/mois, limité à 50 commandes/mois
- **PRO** : 199 EUR/mois, commandes illimitées + support prioritaire
- **ENTERPRISE** : Sur devis, includes SSO, SLA garanti, account manager dédié

---

### Est-ce compatible avec mon ERP (SAP, Oracle, etc.) ?
**Réponse** : Oui, via API REST. Documentation complète sur https://api.rt-technologie.com. Si tu as besoin d'aide pour l'intégration, notre équipe tech peut t'accompagner (prestation facturée selon complexité).

---

### Les transporteurs doivent-ils payer pour utiliser la plateforme ?
**Réponse** : Non, l'utilisation est **gratuite pour les transporteurs** que tu invites. Tu paies l'abonnement, ils bénéficient de l'outil sans frais. C'est un argument pour les convaincre de rejoindre ton réseau !

---

## 🎓 Parcours de formation recommandé

### Semaine 1 : Prise en main
- [ ] Jour 1 : Explore le Dashboard, familiarise-toi avec la navigation
- [ ] Jour 2 : Crée tes Origins et upload 1 grille tarifaire test
- [ ] Jour 3 : Invite 2-3 transporteurs de ton réseau actuel
- [ ] Jour 4 : Importe 10 commandes fictives (CSV test)
- [ ] Jour 5 : Lance ton premier dispatch avec Affret.IA

### Semaine 2 : Maîtrise des commandes
- [ ] Configure une chaîne de dispatch complète
- [ ] Teste les différents scénarios (acceptation, refus, timeout)
- [ ] Analyse les KPIs dans Analytics
- [ ] Upload toutes tes grilles tarifaires réelles

### Semaine 3 : Module Palettes
- [ ] Lis le GUIDE_PALETTES.md
- [ ] Génère ton premier chèque palette
- [ ] Coordonne avec un transporteur pour tester le scan QR
- [ ] Surveille ton solde et comprends le ledger

### Semaine 4 : Bourse de Stockage
- [ ] Lis le GUIDE_BOURSE_STOCKAGE.md
- [ ] Publie un besoin test (spot)
- [ ] Compare les offres avec le comparateur IA
- [ ] Négocie avec un logisticien (mode simulation)

### Semaine 5 : Optimisation avancée
- [ ] Active toutes les alertes
- [ ] Configure les Time Windows sur tes commandes
- [ ] Teste l'optimisation de tournée multi-livraisons
- [ ] Analyse tes coûts par route et identifie les optimisations

### Semaine 6 : Passage en production
- [ ] Importe toutes tes commandes réelles
- [ ] Configure les notifications pour ton équipe
- [ ] Forme tes collègues (sessions internes)
- [ ] Planifie une revue mensuelle des KPIs

---

**Félicitations !** Tu es maintenant prêt à maîtriser la plateforme RT-Technologie Industrie. N'hésite pas à solliciter le support pour toute question.

---

**Version du guide** : 1.0.0
**Dernière mise à jour** : Novembre 2024
**Durée de lecture** : 22 minutes
**Niveau** : Intermédiaire
**Langue** : Français (EN à venir en 2025)

**Contact** : support@rt-technologie.com | +33 1 XX XX XX XX
**Site web** : https://rt-technologie.com
**Documentation** : https://docs.rt-technologie.com

---

© 2024 RT-Technologie. Tous droits réservés. Ce document est confidentiel et destiné exclusivement aux clients de RT-Technologie.
