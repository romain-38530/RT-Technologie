# Guide de Formation - Plateforme Transporteur RT-Technologie

## Objectif de l'application

La plateforme web-transporter est ton outil central pour gérer efficacement toutes tes opérations de transport : accepte des missions en temps réel, optimise ton planning véhicules et conducteurs, gère les documents obligatoires (CMR, BL), dépose les palettes Europe via notre module économie circulaire, et communique instantanément avec les industriels et logisticiens.

---

## Pour qui ?

### Profils utilisateurs
- **Responsables d'exploitation** : Supervision globale des missions et ressources
- **Planificateurs** : Optimisation des tournées et assignation des conducteurs
- **Gestionnaires de flotte** : Suivi des véhicules et documents
- **Dispatchers** : Gestion opérationnelle quotidienne

---

## Premiers pas

### Connexion
1. Accède à https://transporter.rt-technologie.com
2. Entre ton **ID transporteur** et **mot de passe**
3. Tu arrives sur le **Dashboard**

### Navigation
Le menu principal contient :
- **Dashboard** : Vue d'ensemble et KPIs
- **Missions en attente** : Propositions à accepter/refuser
- **Missions acceptées** : Missions confirmées
- **Planning** : Calendrier véhicules et conducteurs
- **Documents** : CMR, BL, POD
- **Palettes** : Dépôt des palettes Europe
- **Profil** : Paramètres et statistiques

---

## Dashboard Transporteur

### Vue d'ensemble

Ton tableau de bord affiche 4 indicateurs clés :

#### 1. Missions en attente (Orange)
- Nombre de missions proposées nécessitant une réponse
- **SLA critique** : Indique le temps restant avant expiration
- Clique pour accéder à la liste complète

#### 2. Missions acceptées (Vert)
- Missions confirmées en cours d'exécution
- Statuts : PENDING, IN_PROGRESS, LOADING, LOADED, DELIVERING
- Suivi temps réel de l'avancement

#### 3. RDV planifiés (Bleu)
- Créneaux de chargement/livraison confirmés
- Vue calendrier avec disponibilité
- Modification possible selon contraintes

#### 4. Documents à signer (Violet)
- CMR en attente de signature
- Documents manquants par mission
- Upload en attente de validation

### Missions urgentes

Une alerte orange apparaît quand :
- Le SLA expire dans moins de 2 heures
- Une mission nécessite une acceptation immédiate
- Un document obligatoire manque avant chargement

**Action requise** : Clique sur "Voir les missions urgentes" pour traiter en priorité

### Activité récente

Les 5 dernières actions sont affichées :
- Missions acceptées/refusées
- Documents uploadés
- RDV confirmés
- Palettes déposées

---

## Gestion des missions

### Workflow complet d'une mission

```
PROPOSED → ACCEPTED → IN_PROGRESS → LOADING → LOADED → DELIVERING → DELIVERED → COMPLETED
```

### 1. Recevoir une proposition (PROPOSED)

#### Notification
Tu reçois une alerte dans l'app :
- **Référence mission** : ORD-123456
- **Origine** : Adresse de chargement
- **Destination** : Adresse de livraison
- **Marchandise** : Type, poids, volume, palettes
- **Date souhaitée** : Créneau de chargement
- **SLA** : Temps restant pour accepter (généralement 2h)

#### Informations détaillées
Clique sur la mission pour voir :
- **Grille tarifaire** : Prix proposé (€/km, €/palette, forfait)
- **Distance** : Kilométrage estimé
- **Instructions** : Notes spéciales (rendez-vous, équipement requis)
- **Contact industriel** : Nom, téléphone, email

### 2. Accepter une mission

#### Vérifications préalables
Avant d'accepter, vérifie :
- Disponibilité d'un véhicule adapté (tonnage, volume)
- Disponibilité d'un conducteur qualifié
- Compatibilité avec le planning existant
- Conformité tarifaire

#### Processus d'acceptation
1. Clique sur **"Accepter la mission"**
2. **Assigne un véhicule** :
   - Liste déroulante des véhicules disponibles
   - Filtre par type (frigorifique, bâché, plateau)
   - Indication charge utile restante
3. **Assigne un conducteur** :
   - Liste des conducteurs disponibles
   - Vérification permis et habilitations
   - Respect temps de conduite réglementaire
4. **Propose un créneau RDV** (si flexible) :
   - Calendrier interactif
   - Créneaux disponibles en vert
   - Validation avec l'industriel requise
5. Confirme en cliquant **"✓ Valider l'acceptation"**

#### Résultat
- Statut passe à **ACCEPTED**
- Le conducteur reçoit une notification sur son app mobile
- L'industriel est informé de l'acceptation
- La mission apparaît dans "Missions acceptées"

### 3. Refuser une mission

#### Motifs de refus
- Pas de véhicule disponible
- Conducteur indisponible
- Tarif non conforme
- Distance trop importante
- Incompatibilité planning

#### Processus
1. Clique sur **"Refuser"**
2. Sélectionne un motif dans la liste déroulante
3. Ajoute un commentaire explicatif (optionnel)
4. Confirme le refus

**Important** : Le refus est définitif. La mission sera proposée à un autre transporteur.

### 4. Suivi de la mission (Conducteur)

Une fois acceptée, le conducteur gère les étapes via son app mobile :

#### IN_PROGRESS (En route vers chargement)
- GPS tracking activé automatiquement
- ETA calculé en temps réel
- Tu vois la position du véhicule sur ta carte dashboard

#### LOADING (Au chargement)
- Détection automatique par géofencing (200m)
- Scan du bon de chargement (BL)
- Photos de la marchandise
- Signature de l'expéditeur
- Durée : enregistrée pour facturation éventuelle

#### LOADED (Marchandise chargée)
- Validation du chargement complet
- En route vers livraison
- Tracking GPS continu

#### DELIVERING (À la livraison)
- Arrivée détectée automatiquement
- Scan du bon de livraison
- Photos après déchargement
- Signature du destinataire (e-CMR)

#### DELIVERED (Livraison terminée)
- Confirmation de fin de mission
- Tous documents collectés
- KPIs enregistrés (ponctualité, durée)

#### COMPLETED (Mission terminée)
- Prêt pour facturation
- Archivage automatique
- Mise à jour statistiques transporteur

### Tableau des statuts

| Statut | Signification | Acteur responsable | Actions disponibles |
|--------|---------------|-------------------|---------------------|
| PROPOSED | Proposition reçue | Transporteur | Accepter, Refuser |
| ACCEPTED | Mission confirmée | Transporteur | Assigner véhicule/conducteur |
| IN_PROGRESS | En route chargement | Conducteur | Tracking GPS, Appel contact |
| LOADING | Au point de chargement | Conducteur | Scanner BL, Signer, Photos |
| LOADED | Marchandise à bord | Conducteur | Tracking GPS |
| DELIVERING | Au point de livraison | Conducteur | Scanner POD, Signer, Photos |
| DELIVERED | Livraison effectuée | Conducteur | Signaler anomalie si besoin |
| COMPLETED | Archivée | Système | Consulter historique |

---

## Planning véhicules et conducteurs

### Vue calendrier

Le planning affiche une grille hebdomadaire :
- **Axe horizontal** : Jours de la semaine (Lun - Dim)
- **Axe vertical** : Créneaux horaires (08:00 - 18:00)
- **Cellules vertes** : Créneaux disponibles
- **Cellules grises** : Créneaux occupés
- **Cellules rouges** : Conflits détectés

### Gestion des véhicules

#### Ajouter un véhicule
1. Menu **Planning** > **Véhicules**
2. Clique sur **"+ Ajouter véhicule"**
3. Remplis les informations :
   - **Immatriculation** : AB-123-CD
   - **Type** : Frigorifique, Bâché, Plateau, Citerne
   - **Charge utile** : Tonnage max (en kg)
   - **Volume** : m³ disponibles
   - **Palettes max** : Nombre de palettes Europe (33 ou 26)
   - **Équipements** : Hayon, GPS, Frigo, Porte latérale
4. Upload **Carte grise** et **Assurance**
5. Sauvegarde

#### Suivi flotte
- **Disponibilité** : Véhicules libres/occupés
- **Maintenance** : Alertes contrôles techniques
- **Documents** : Validité assurance, visite technique
- **Géolocalisation** : Position temps réel si en mission

### Gestion des conducteurs

#### Ajouter un conducteur
1. Menu **Planning** > **Conducteurs**
2. Clique sur **"+ Ajouter conducteur"**
3. Informations obligatoires :
   - **Nom, Prénom**
   - **N° téléphone** : Pour l'app mobile
   - **Email** : Identifiant de connexion
   - **N° permis** : Vérification validité
   - **Catégorie permis** : C, CE, etc.
   - **Carte conducteur** : N° chronotachygraphe
   - **Habilitations** : ADR, CACES, Frigo
4. Upload **Permis de conduire** et **FIMO/FCO**
5. Crée un compte app mobile automatiquement

#### Respect réglementation
L'app calcule automatiquement :
- **Temps de conduite** : Max 9h/jour (10h 2x/semaine)
- **Temps de repos** : Min 11h entre deux journées
- **Pause obligatoire** : 45 min après 4h30 de conduite
- **Hebdomadaire** : Max 56h de conduite

**Alerte** : Si un conducteur approche des limites, un indicateur rouge apparaît.

### Assignation intelligente

#### Suggestions automatiques
Quand tu acceptes une mission, l'IA propose :
1. **Véhicule optimal** :
   - Capacité suffisante mais pas surdimensionnée
   - Type adapté (frigo si produits frais)
   - Localisation proche du point de chargement
2. **Conducteur compatible** :
   - Disponible selon planning
   - Habilitations requises (ADR si matières dangereuses)
   - Respect temps de conduite

#### Optimisation multi-trajets
Si plusieurs missions dans la même zone :
- L'IA suggère un regroupement
- Calcul du trajet optimisé (algorithme TSP)
- Économie de km et temps affichée
- Validation manuelle requise

---

## Documents obligatoires et e-CMR

### Types de documents

#### 1. CMR (Convention de Marchandises par Route)
**Rôle** : Contrat de transport international
**Parties** :
- Expéditeur (industriel)
- Transporteur (toi)
- Destinataire (client final)

**Signature électronique** : Valeur légale équivalente au papier

#### 2. Bon de Livraison (BL)
**Rôle** : Liste des marchandises chargées
**Contenu** :
- Références produits
- Quantités
- Poids total
- N° de lots

**Scanné par le conducteur** au chargement

#### 3. Proof of Delivery (POD)
**Rôle** : Preuve de réception
**Signature** : Destinataire confirme la réception conforme
**Photos** : État de la marchandise à l'arrivée

### Workflow e-CMR

#### Étape 1 : Génération (Industriel)
L'industriel génère le CMR électronique avec :
- Informations expéditeur/destinataire
- Détails marchandise
- Instructions spéciales
- Valeur déclarée (assurance)

#### Étape 2 : Signature transporteur (Toi)
1. Accède à **Documents** > **CMR en attente**
2. Consulte le CMR
3. Vérifie les informations :
   - Adresses correctes
   - Marchandise conforme à la mission
   - Instructions réalisables
4. Si OK : **"✓ Signer le CMR"**
5. Si problème : **"✗ Signaler une erreur"** (avec commentaire)

**Signature** : Horodatée, géolocalisée, cryptographiquement sécurisée (Ed25519)

#### Étape 3 : Chargement (Conducteur)
Le conducteur sur site :
1. Scanne le BL papier avec l'app mobile
2. Compte physiquement les colis/palettes
3. Vérifie l'état (emballage intact)
4. Prend des photos de preuve
5. Fait signer l'expéditeur sur l'app (tactile ou QR code)

#### Étape 4 : Transport
- Le CMR est accessible hors ligne sur l'app conducteur
- En cas de contrôle routier : affichage QR code
- Les autorités scannent et vérifient l'authenticité

#### Étape 5 : Livraison (Conducteur)
1. Scanne le POD
2. Fait signer le destinataire
3. Photos de la marchandise déchargée
4. Si anomalie : photos + commentaire détaillé

#### Étape 6 : Validation finale (Système)
- Tous les documents sont automatiquement archivés
- Le CMR complet (4 signatures) est disponible en PDF
- Conservation légale : 10 ans
- Export possible pour comptabilité

### Documents manquants

#### Alerte système
Si un document obligatoire manque :
- Badge rouge sur le dashboard
- Notification email quotidienne
- Blocage de la facturation (si critique)

#### Actions correctives
1. Identifie le document manquant
2. **Upload manuel** :
   - Clique sur **"+ Upload document"**
   - Sélectionne le type (CMR, BL, POD, Assurance, etc.)
   - Glisse-dépose le fichier (PDF, JPG, PNG)
   - Associe à la mission concernée
3. Demande de re-signature si nécessaire

---

## Module Palettes (Économie Circulaire)

### Principe

Le module Palettes gère le cycle complet des palettes Europe :
1. L'industriel génère un **chèque palette dématérialisé** avec QR code
2. Ton conducteur **dépose les palettes** sur un site de retour
3. Le logisticien du site **réceptionne et valide**
4. Les soldes de palettes sont mis à jour automatiquement

### Avantages pour toi
- **Optimisation des trajets** : L'IA trouve le site de retour le plus proche
- **Traçabilité complète** : Preuve GPS + signature cryptographique
- **Zéro paperasse** : Tout est dématérialisé
- **Economie** : Moins de détours, moins de diesel

### Workflow transporteur

#### 1. Réception du chèque palette

Lors de l'acceptation de la mission, l'industriel te transmet :
- Un **QR code unique** : `RT-PALETTE://CHQ-xxxxx`
- **Quantité de palettes** : Ex. 33 palettes Europe
- **Site de retour recommandé** par l'IA :
  - Nom et adresse
  - Distance depuis ton point de livraison
  - Horaires d'ouverture
  - Places disponibles

#### 2. Accès au module Palettes

Dans l'app transporteur :
1. Menu **Palettes** > **Déposer des palettes**
2. Clique sur **"Scanner QR code"**
3. Utilise la caméra pour scanner le QR code
   - Ou **saisie manuelle** du code CHQ-xxxxx

#### 3. Informations affichées

L'app affiche :
- **Commande associée** : ORD-123456
- **Quantité** : 33 palettes Europe
- **Site de retour recommandé** :
  - Nom : "Entrepôt Paris Nord"
  - Adresse : 12 rue de la Logistique, 93000 Bobigny
  - Distance : 5.2 km depuis ta position actuelle
  - GPS : 48.9023, 2.3789
  - Quota disponible : 150 places
  - Horaires : 08:00 - 18:00 (Lun-Ven)
- **Sites alternatifs** : 2 autres options si besoin

#### 4. Navigation vers le site

1. Clique sur **"🗺️ Itinéraire"**
2. L'app ouvre :
   - Google Maps (Android)
   - Apple Maps (iOS)
   - Waze (si installé)
3. Suis la navigation GPS

#### 5. Dépôt des palettes

Une fois sur site (détection automatique à 200m) :
1. L'app affiche **"Vous êtes arrivé au site de retour"**
2. Vérifie que tu es bien au bon endroit (nom du site affiché)
3. Décharge les 33 palettes
4. Clique sur **"✓ Confirmer le dépôt"**
5. **Optionnel** : Prends une photo des palettes déposées
6. L'app enregistre :
   - GPS précis du dépôt
   - Timestamp exact
   - Signature cryptographique

#### 6. Validation

- Statut du chèque passe à **DEPOSITED**
- Le logisticien du site est notifié
- Tu reçois une confirmation immédiate
- Le chèque reste consultable dans **Historique**

### Consultation de l'historique

Menu **Palettes** > **Historique des dépôts** :
- Liste de tous tes dépôts
- Filtre par date, site, statut
- Export PDF pour preuve
- Détails de chaque opération (GPS, photos, signatures)

### Cas particuliers

#### Site fermé ou complet
Si tu arrives et que :
- Le site est fermé (hors horaires)
- Le quota est atteint (site plein)
- Problème d'accès

**Action** :
1. Ne confirme PAS le dépôt dans l'app
2. Clique sur **"⚠️ Signaler un problème"**
3. Sélectionne le motif :
   - Site fermé
   - Site complet
   - Accès refusé
   - Autre (préciser)
4. Prends des photos de preuve
5. L'IA te propose automatiquement un **site alternatif**
6. Valide et navigue vers le nouveau site

#### Palettes non conformes
Si le logisticien refuse les palettes (cassées, sales) :
- Il signale dans son interface
- Tu reçois une notification
- Le statut reste **DEPOSITED** (non validé)
- Un **litige** est créé automatiquement
- Le support intervient pour résolution

---

## Grilles tarifaires et facturation

### Consultation des grilles

#### Accès
Menu **Tarifs** > **Mes grilles tarifaires**

#### Structure
Les grilles sont organisées par :
- **Client** (industriel)
- **Type de prestation** :
  - Transport standard
  - Transport frigorifique
  - Transport ADR (matières dangereuses)
  - Express (livraison < 24h)
- **Zone géographique** :
  - Locale (< 100 km)
  - Régionale (100-300 km)
  - Nationale (> 300 km)

#### Tarification
Plusieurs modèles possibles :
- **€/km** : Ex. 1.50€/km
- **€/palette** : Ex. 8€/palette + 1€/km
- **Forfait** : Prix fixe par mission
- **Mixte** : Forfait + supplément km

### Calcul automatique

Quand tu reçois une proposition de mission :
1. L'app affiche le **prix calculé** automatiquement
2. Détail du calcul :
   ```
   Distance : 150 km
   Tarif : 1.50€/km
   Base : 150 × 1.50 = 225€
   Palettes : 33 × 8€ = 264€
   Total HT : 489€
   ```
3. Tu peux accepter ou négocier si hors grille

### Facturation

#### Génération automatique
À la fin du mois :
1. Accède à **Facturation** > **Générer facture**
2. Sélectionne la période (ex. Novembre 2025)
3. Filtre par client si besoin
4. Clique sur **"Générer"**
5. L'app crée un PDF :
   - Récapitulatif des missions
   - Détail kilométrique
   - Total HT/TTC
   - RIB pour paiement

#### Export comptable
- Format CSV pour import dans ton logiciel
- Export Excel pour analyse
- Connexion API possible (pour ERP)

### Suivi des paiements

Tableau de bord **Facturation** :
- **Factures émises** : Total du mois
- **Factures payées** : En vert
- **Factures en attente** : En orange
- **Factures en retard** : En rouge (> 30 jours)
- **Relances automatiques** : Email après 30/45/60 jours

---

## Communication et notifications

### Types de notifications

#### Push (temps réel)
- **Nouvelle mission proposée** : Accepte dans les 2h
- **Mission acceptée par conducteur** : Confirmation
- **Conducteur arrivé à destination** : Géofencing
- **Document signé** : CMR validé
- **Problème signalé** : Anomalie livraison
- **Palettes déposées** : Confirmation dépôt

#### Email (quotidien)
- Récapitulatif des missions du jour
- Documents manquants
- RDV à confirmer
- KPIs de performance hebdomadaires

#### SMS (urgent)
- SLA expirant (< 30 min)
- Conducteur en retard (> 1h)
- Annulation de mission

### Messagerie intégrée (futur)

Fonctionnalité à venir :
- Chat direct avec l'industriel
- Chat avec le conducteur
- Pièces jointes (photos, documents)
- Historique conservé par mission

### Paramétrage des notifications

Menu **Profil** > **Notifications** :
- Active/désactive par type
- Choisis les canaux (Push, Email, SMS)
- Horaires de réception (ex. 08:00-20:00)
- Sons personnalisés

---

## Erreurs courantes et solutions

### "Impossible d'accepter la mission"

#### Causes
- SLA expiré (temps écoulé)
- Mission déjà acceptée par un autre transporteur
- Erreur réseau

#### Solutions
1. Vérifie ta connexion internet
2. Rafraîchis la page (F5)
3. Si SLA expiré : contacte l'industriel pour négocier
4. Consulte **Missions en attente** pour voir si elle apparaît encore

### "Véhicule indisponible pour assignation"

#### Causes
- Véhicule déjà assigné à une autre mission
- Documents véhicule expirés (assurance, CT)
- Maintenance en cours

#### Solutions
1. Accède à **Planning** > **Véhicules**
2. Vérifie l'état du véhicule :
   - Calendrier : Recherche de conflit
   - Documents : Vérifier les dates d'expiration
3. Si conflit : Choisis un autre véhicule ou modifie le planning
4. Si documents expirés : Upload les nouveaux documents

### "Conducteur dépassement temps de conduite"

#### Causes
- Le conducteur approche ou dépasse les 9h réglementaires
- Repos insuffisant entre deux journées

#### Solutions
1. **Planning** > **Conducteurs** > Consulte le chronotachygraphe
2. Vérifie les heures de conduite cumulées
3. Options :
   - Assigne un autre conducteur disponible
   - Planifie la mission pour le lendemain après repos
   - Organise un relais (2 conducteurs)

### "Document CMR non signé"

#### Causes
- L'industriel n'a pas encore généré le CMR
- Erreur dans les informations du CMR
- Oubli de signature

#### Solutions
1. Accède à **Documents** > **CMR en attente**
2. Si absent : Contacte l'industriel
3. Si présent mais erreur : Clique sur **"✗ Signaler une erreur"** et précise
4. Si présent et correct : **"✓ Signer le CMR"**

### "GPS du conducteur inactif"

#### Causes
- Conducteur n'a pas lancé la mission dans son app
- GPS désactivé sur le smartphone
- Perte de signal (tunnel, zone blanche)

#### Solutions
1. Appelle le conducteur :
   - Vérifie qu'il a bien cliqué sur **"Démarrer la mission"**
   - Demande-lui d'activer le GPS dans Paramètres système
   - S'il est dans un bâtiment, demande-lui de sortir
2. Si problème persiste : Suivi manuel via appels réguliers

### "Upload de document échoué"

#### Causes
- Fichier trop volumineux (> 10 MB)
- Format non supporté
- Connexion interrompue

#### Solutions
1. **Compression** : Réduis la taille du PDF/image
2. **Format** : Utilise PDF, JPG ou PNG uniquement
3. **Connexion** : Vérifie ta connexion internet et réessaye
4. Si échec répété : Envoie par email à support@rt-technologie.com

### "Palette : Site de retour introuvable"

#### Causes
- GPS imprécis (signal faible)
- Adresse incorrecte dans la base
- Site déménagé

#### Solutions
1. Vérifie l'adresse affichée dans l'app
2. Compare avec Google Maps
3. Appelle le logisticien du site (numéro affiché)
4. Si site introuvable : **"⚠️ Signaler un problème"** > L'IA propose un site alternatif

---

## KPIs de performance

### Tableau de bord KPIs

Accède à **Profil** > **Statistiques** pour consulter :

#### Taux d'acceptation
- **Formule** : (Missions acceptées / Missions proposées) × 100
- **Objectif** : > 80%
- **Interprétation** :
  - < 50% : Risque de perdre des clients (peu réactif)
  - 50-80% : Correct mais améliorable
  - > 80% : Excellent partenaire fiable

#### Taux de ponctualité
- **Formule** : (Livraisons à l'heure / Total livraisons) × 100
- **Critère** : Livraison dans la fenêtre horaire ± 15 min
- **Objectif** : > 95%
- **Impact** : Indicateur de qualité N°1 pour les clients

#### Temps de réponse moyen
- **Définition** : Délai entre réception de la proposition et acceptation
- **Objectif** : < 30 minutes
- **Optimisation** :
  - Active les notifications push
  - Consulte l'app plusieurs fois par jour
  - Forme plusieurs personnes à l'acceptation (évite goulot)

#### Complétude documentaire
- **Formule** : (Documents à jour / Documents obligatoires) × 100
- **Documents** : CMR, BL, POD, Assurance véhicules, Permis conducteurs
- **Objectif** : 100%
- **Conséquence si < 100%** : Blocage facturation

#### Taux d'incidents
- **Définition** : Nombre d'anomalies signalées par mission
- **Types** : Retards, marchandise endommagée, refus de livraison
- **Objectif** : < 2%
- **Benchmark** : Moyenne du secteur = 5%

#### Satisfaction client
- **Notation** : Étoiles de 1 à 5
- **Évalué par** : Industriels après chaque mission
- **Critères** :
  - Ponctualité
  - État de la marchandise
  - Professionnalisme du conducteur
  - Qualité des documents
- **Objectif** : > 4.5/5

### Évolution dans le temps

#### Graphiques disponibles
- **Courbe d'acceptation** : 30 derniers jours
- **Histogramme ponctualité** : Par semaine
- **Comparaison mois/mois** : Evolution des KPIs
- **Benchmark** : Ta position vs autres transporteurs (anonymisé)

#### Export des données
- **CSV** : Pour analyse dans Excel
- **PDF** : Rapport mensuel pour direction
- **API** : Connexion à ton BI/ERP

### Actions d'amélioration

Selon tes KPIs, l'app te suggère :

#### Si taux d'acceptation < 70%
- "Active les notifications pour réagir plus vite"
- "Forme un dispatcher backup pour les absences"
- "Révise tes grilles tarifaires avec les clients"

#### Si ponctualité < 90%
- "Utilise l'IA d'optimisation de tournées"
- "Prévois 20% de marge sur les ETAs"
- "Analyse les causes de retard (liste fournie)"

#### Si complétude documentaire < 100%
- "Liste des 3 documents manquants à uploader"
- "Tutoriel : Comment scanner un CMR"
- "Rappel : Sanctions en cas de contrôle routier"

---

## Support et ressources

### Centre d'aide

#### Documentation en ligne
- **Guide utilisateur** : https://docs.rt-technologie.com/transporter
- **FAQ** : https://faq.rt-technologie.com
- **Tutoriels vidéo** : https://www.youtube.com/rt-technologie
- **Release notes** : Nouveautés de chaque version

#### Langues disponibles
- Français (actuel)
- English (à venir Q1 2025)

### Support technique

#### Contact
- **Email** : support@rt-technologie.com
- **Téléphone** : +33 1 XX XX XX XX
  - Lun-Ven : 09:00-18:00
  - Urgences : 24/7 (astreinte)
- **Chat** : Bouton en bas à droite de l'app (heures ouvrées)

#### Délais de réponse
- **Chat** : < 5 minutes
- **Email** : < 4 heures (jours ouvrés)
- **Téléphone urgence** : Immédiat

### Signaler un bug

#### Processus
1. Menu **Aide** > **Signaler un problème**
2. Remplis le formulaire :
   - **Page concernée** : Ex. "Acceptation de mission"
   - **Action effectuée** : Ex. "J'ai cliqué sur Accepter"
   - **Résultat attendu** : Ex. "La mission devrait passer en Acceptée"
   - **Résultat obtenu** : Ex. "Message d'erreur 500"
   - **Navigateur** : Chrome, Firefox, Safari, Edge
3. **Capture d'écran** : Très utile (Ctrl+V pour coller)
4. **Informations système** : Automatiquement collectées
5. Envoie

#### Suivi
- Tu reçois un **n° de ticket** (ex. #TRS-12345)
- Email de confirmation immédiat
- Mises à jour par email à chaque avancement
- Résolution sous 48h (bugs critiques : 4h)

### Formation personnalisée

#### Webinaires
- **Démo complète** : Tous les mercredis 14h-15h
- **Spécial Palettes** : 1er mardi du mois 10h-11h
- **Optimisation planning** : Sur demande (min. 5 participants)
- **Inscription** : https://training.rt-technologie.com

#### Formation sur site
Pour les flottes > 20 véhicules :
- Déplacement d'un formateur chez toi
- Durée : 1/2 journée
- Support personnalisé selon tes processus
- Tarif : Nous consulter

#### Documentation téléchargeable
- **Guide PDF complet** : À imprimer pour tes équipes
- **Aide-mémoire** : 1 page recto-verso avec l'essentiel
- **Posters** : Workflow mission à afficher au mur

---

## Annexes

### Glossaire

- **SLA** : Service Level Agreement (délai maximum d'acceptation)
- **CMR** : Convention de Marchandises par Route (contrat de transport)
- **BL** : Bon de Livraison
- **POD** : Proof of Delivery (preuve de livraison)
- **e-CMR** : CMR électronique avec signature numérique
- **Géofencing** : Détection automatique d'arrivée sur site (GPS)
- **ETA** : Estimated Time of Arrival (heure d'arrivée estimée)
- **Palette Europe** : Palette standard 80×120 cm
- **Chèque palette** : Document dématérialisé pour gestion des palettes
- **KPI** : Key Performance Indicator (indicateur de performance)

### Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| Alt+D | Accéder au Dashboard |
| Alt+M | Missions en attente |
| Alt+P | Planning |
| Alt+C | Documents (CMR) |
| Alt+L | Palettes |
| Ctrl+S | Sauvegarder (formulaires) |
| Esc | Fermer popup |
| F5 | Rafraîchir la page |

### Exemples concrets

#### Exemple 1 : Acceptation rapide d'une mission
**Contexte** : Mission urgente Paris → Lyon, 33 palettes, SLA 1h

1. **10:00** : Notification push reçue
2. **10:02** : Consulte la mission :
   - Distance : 465 km
   - Tarif : 750€ HT
   - Chargement : Demain 08:00
3. **10:05** : Vérifie planning :
   - Véhicule AB-123-CD disponible
   - Conducteur Jean DUPONT disponible (8h repos OK)
4. **10:08** : Clique sur **"Accepter"**
5. **10:09** : Assigne véhicule et conducteur
6. **10:10** : Confirme → Mission acceptée !
7. **10:11** : Jean reçoit notification sur son app mobile

**Temps total** : 11 minutes (excellent !)

#### Exemple 2 : Gestion d'un retard
**Contexte** : Conducteur bloqué dans les embouteillages, risque de retard 1h

1. **14:00** : L'ETA passe de 15:00 à 16:00 (calcul automatique)
2. **14:02** : Notification **"Retard détecté sur ORD-12345"**
3. **14:05** : Tu appelles le conducteur pour confirmation
4. **14:10** : Tu contactes le destinataire :
   - Option 1 : Il accepte le retard → OK
   - Option 2 : Il refuse → Replanification nécessaire
5. **14:15** : Si accepté : Note dans l'app **"Retard 1h accepté par client"**
6. **16:05** : Livraison effectuée avec retard documenté

**Impact KPI** : Retard justifié = pas de pénalité dans les stats

#### Exemple 3 : Dépôt de palettes optimisé
**Contexte** : Livraison à Bobigny, 33 palettes à rendre

1. **16:00** : Livraison terminée à Bobigny
2. **16:05** : Conducteur ouvre module Palettes
3. **16:06** : Scanne QR code CHQ-xxxxx
4. **16:07** : L'IA propose :
   - **Site A** : 2.5 km, 150 places libres, ouvert jusqu'à 18:00
   - Site B : 8 km, 50 places libres
   - Site C : 15 km, 200 places libres
5. **16:08** : Conducteur choisit Site A (plus proche)
6. **16:09** : Lance la navigation GPS
7. **16:20** : Arrivée au site (détection auto)
8. **16:35** : Palettes déchargées
9. **16:36** : Confirme le dépôt dans l'app
10. **16:37** : Logisticien validera demain matin

**Economie** : 12.5 km de détour évités vs Site C !

---

**Version du guide** : 1.0.0
**Dernière mise à jour** : Janvier 2025
**Durée de lecture** : 18 minutes
**Niveau** : Débutant
**Langues** : FR (EN à venir Q1 2025)
**Application** : web-transporter (RT-Technologie)
