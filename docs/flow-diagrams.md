# RT-Technologie - Diagrammes de Flux UML

## Table des Matières
1. [Flux d'Authentification et Onboarding](#flux-dauthentification-et-onboarding)
2. [Flux de Dispatch de Commandes](#flux-de-dispatch-de-commandes)
3. [Flux de Gestion des Palettes (Économie Circulaire)](#flux-de-gestion-des-palettes-économie-circulaire)
4. [Flux du Marketplace de Stockage](#flux-du-marketplace-de-stockage)
5. [Flux de Support Client (Chatbot)](#flux-de-support-client-chatbot)
6. [Flux de Géolocalisation et ETA](#flux-de-géolocalisation-et-eta)

---

## Flux d'Authentification et Onboarding

### Diagramme de Séquence - Inscription Client

```plantuml
@startuml RT-Onboarding-Sequence
actor "Prospect" as prospect
participant "marketing-site" as web
participant "client-onboarding\nService" as onboard
participant "authz\nService" as auth
participant "VIES/INSEE\nAPI" as vat
participant "AWS S3" as s3
participant "MongoDB" as db
participant "Mailgun" as email

== Étape 1: Vérification VAT ==
prospect -> web: Visite page d'inscription
web -> prospect: Affiche formulaire
prospect -> web: Saisit numéro TVA
web -> onboard: POST /verify-vat
onboard -> vat: Vérifie TVA
vat --> onboard: Données entreprise
onboard -> db: Cache verification
onboard --> web: Données auto-complétées
web -> prospect: Pré-remplit formulaire

== Étape 2: Formulaire Multi-étapes ==
prospect -> web: Complète 5 étapes:\n1. Vérification entreprise\n2. Informations représentant\n3. Choix d'abonnement\n4. Méthode de paiement\n5. Révision
web -> onboard: POST /register
onboard -> auth: POST /auth/register
auth -> db: Crée organization (PENDING_VERIFICATION)
auth -> db: Crée user account
auth --> onboard: orgId, userId

== Étape 3: Génération de Contrat ==
onboard -> onboard: Génère PDF contrat\navec variables
onboard -> s3: Upload PDF
s3 --> onboard: PDF URL
onboard -> db: Sauvegarde contract (PENDING_SIGNATURE)
onboard --> web: contractId, signatureUrl

== Étape 4: Signature Électronique ==
web -> prospect: Affiche contrat + zone signature
prospect -> web: Signe électroniquement (eIDAS)
web -> onboard: POST /sign-contract\n+ signature + IP
onboard -> db: Met à jour contract (SIGNED)
onboard -> db: Met à jour org (VERIFIED)
onboard -> email: Envoie email de bienvenue
email --> prospect: Email confirmation + login link

== Étape 5: Premier Login ==
prospect -> web: Clique lien email
web -> auth: POST /auth/login
auth -> db: Vérifie credentials
auth --> web: JWT token
web -> prospect: Redirige vers app métier\n(web-industry, web-transporter, etc.)

@enduml
```

### Diagramme d'Activité - Processus d'Inscription

```plantuml
@startuml RT-Onboarding-Activity
start
:Prospect visite marketing-site;
:Clique "S'inscrire";
:Saisit numéro de TVA;

:Appel API VIES/INSEE;
if (TVA valide ?) then (oui)
  :Auto-complétion données entreprise;
else (non)
  :Message d'erreur;
  stop
endif

:Étape 1: Vérification entreprise;
note right
  - Nom société
  - Adresse
  - SIRET
  - Forme juridique
end note

:Étape 2: Représentant légal;
note right
  - Nom/Prénom
  - Email
  - Téléphone
  - Fonction
end note

:Étape 3: Choix d'abonnement;
note right
  Plans disponibles:
  - FREE (limité)
  - PRO (€99/mois)
  - ENTERPRISE (sur mesure)
end note

:Étape 4: Méthode de paiement;
if (Plan payant ?) then (oui)
  :Saisie CB / IBAN;
else (non)
  :Skip;
endif

:Étape 5: Révision et acceptation;
:Accepte CGU/CGV;

:Création compte (status: PENDING_VERIFICATION);
:Génération contrat PDF;
:Upload S3;
:Envoi email avec lien signature;

:Prospect ouvre email;
:Affiche contrat PDF;
:Zone de signature électronique (eIDAS);
:Signe avec souris/tactile;

:Enregistrement signature + timestamp + IP;
:Validation contrat (SIGNED);
:Activation compte (VERIFIED);
:Envoi email de bienvenue;

:Premier login;
:Génération JWT token;
:Redirection vers application métier;

stop

@enduml
```

---

## Flux de Dispatch de Commandes

### Diagramme de Séquence - Dispatch avec SLA et Escalade

```plantuml
@startuml RT-Order-Dispatch-Sequence
actor "Industriel" as industry
participant "web-industry" as web
participant "core-orders\nService" as orders
participant "vigilance\nService" as vigilance
participant "affret-ia\nService" as affret
participant "notifications\nService" as notif
participant "MongoDB" as db
participant "NATS" as nats
participant "Mailgun" as email
actor "Transporteur" as carrier

== Création de Commande ==
industry -> web: Crée nouvelle commande
web -> orders: POST /industry/orders/import
orders -> db: Insère order (status: NEW)
orders --> web: orderId
web -> industry: Confirmation création

== Dispatch Initial ==
industry -> web: Clique "Dispatcher"
web -> orders: POST /industry/orders/:id/dispatch
orders -> db: Récupère dispatch_policy
orders -> db: Récupère carrierChain[0]
orders -> vigilance: GET /vigilance/:carrierId
vigilance -> db: Vérifie statut carrier
vigilance --> orders: status (OK/WARNING/BLOCKED)

alt Carrier BLOCKED
  orders -> db: Passe au carrier suivant
  orders -> orders: Retry avec carrierChain[1]
else Carrier OK
  orders -> db: Met à jour order\n(status: DISPATCHED)
  orders -> db: Définit SLA timer (2h par défaut)
  orders -> nats: Publie event ORDER_DISPATCHED
  orders -> notif: POST /notify
  notif -> email: Envoie email au carrier
  email --> carrier: "Nouvelle mission disponible"
  orders --> web: Dispatch réussi
end

== Rappels SLA ==
loop Timers programmés
  orders -> orders: Wait T-30min
  orders -> notif: POST /notify (rappel)
  notif -> email: "Plus que 30 min pour accepter"

  orders -> orders: Wait T-10min
  orders -> notif: POST /notify (rappel urgent)
  notif -> email: "URGENT: Plus que 10 min!"
end

== Acceptation Carrier ==
carrier -> email: Reçoit notification
carrier -> web: Login web-transporter
carrier -> web: Consulte missions en attente
carrier -> web: Clique "Accepter"
web -> orders: POST /carrier/orders/:id/accept
orders -> db: Met à jour order\n(status: ACCEPTED, carrierId)
orders -> orders: Annule timers SLA
orders -> nats: Publie event ORDER_ACCEPTED
orders -> notif: Notifie industriel
notif -> email: "Votre commande a été acceptée"
orders --> web: Acceptation confirmée

== Escalade Affret.IA (si timeout) ==
alt SLA expiré sans acceptation
  orders -> orders: Timer SLA expire
  orders -> db: Met à jour order\n(status: ESCALATED_AFFRETIA)
  orders -> nats: Publie event ORDER_ESCALATED
  orders -> affret: POST /affret-ia/match
  affret -> affret: IA recherche carriers\nexternes
  affret -> db: Recherche dans bourse
  affret -> affret: Scoring et ranking
  affret --> orders: Liste carriers recommandés
  orders -> notif: Notifie industriel
  notif -> email: "Escalade Affret.IA en cours"

  loop Pour chaque carrier recommandé
    orders -> notif: POST /notify
    notif -> email: Envoie proposition
  end
end

@enduml
```

### Diagramme d'Activité - Cycle de Vie Commande

```plantuml
@startuml RT-Order-Lifecycle-Activity
start

:Industriel crée commande;
:Status: NEW;

partition "Phase de Dispatch" {
  :Industriel clique "Dispatcher";
  :Récupération dispatch_policy;
  :Sélection premier carrier\ndans la chaîne;

  repeat
    :Vérification Vigilance;
    if (Carrier BLOCKED ?) then (oui)
      :Passer au carrier suivant;
    else (non)
      :Carrier sélectionné;
      break
    endif
  repeat while (Carriers disponibles ?)

  :Status: DISPATCHED;
  :Démarrage timer SLA (2h);
  :Envoi email au carrier;
}

partition "Phase d'Acceptation" {
  fork
    :Timer SLA en cours;
    :T-30min: Rappel email;
    :T-10min: Rappel urgent;
  fork again
    :Carrier consulte mission;
    if (Carrier accepte ?) then (oui)
      :Status: ACCEPTED;
      :Annulation timers;
      :Notification industriel;
      detach
    endif
  end fork

  if (SLA expiré ?) then (oui)
    :Status: ESCALATED_AFFRETIA;
    :Affret.IA recherche carriers;
    :Scoring IA;
    :Dispatch vers carrier externe;
  endif
}

partition "Phase d'Exécution" {
  :Driver assigné;
  :Status: IN_TRANSIT;
  :Tracking GPS activé;
  :Collecte marchandise;
  :Génération chèque palette;
  :Transport vers destination;
  :Livraison;
}

partition "Phase de Finalisation" {
  :Proof of Delivery (POD);
  :Photo + signature;
  :Dépôt palettes;
  :Scan QR code;
  :Status: DELIVERED;
  :Mise à jour ledger palettes;
  :Facturation;
}

stop

@enduml
```

---

## Flux de Gestion des Palettes (Économie Circulaire)

### Diagramme de Séquence - Cycle Complet Palette

```plantuml
@startuml RT-Palette-Sequence
actor "Industriel" as industry
participant "web-industry" as web_ind
participant "palette\nService" as palette
participant "ai-client\n(Matching)" as ai
participant "MongoDB" as db
actor "Transporteur" as carrier
participant "mobile-driver" as mobile
participant "web-logistician" as web_log
actor "Logisticien" as logistician
participant "notifications" as notif

== 1. Génération du Chèque Palette ==
industry -> web_ind: Finalise commande
web_ind -> palette: POST /palette/cheques/generate
note right
  Body:
  - orderId
  - quantity (ex: 10 palettes EPAL)
  - deliveryLocation
end note

palette -> ai: POST /match/site
note right
  Critères de matching:
  - Rayon 30km
  - Quotas disponibles
  - Horaires d'ouverture
  - Proximité livraison
end note

ai -> db: Recherche sites (2dsphere)
ai -> ai: Score par distance,\nquota, horaires
ai --> palette: Site optimal recommandé

palette -> palette: Génère QR code\n(RT-PALETTE://cheque-{id})
palette -> palette: Signature Ed25519
palette -> db: Insère palette_cheque\n(status: EMIS)
palette --> web_ind: chequeId, qrCodeUrl, depositSite

web_ind -> industry: Affiche site de retour\nsur carte

== 2. Information Driver ==
industry -> carrier: Assigne mission
carrier -> mobile: Driver reçoit mission
mobile -> mobile: Affiche détails:\n- Livraison\n- Site de retour palettes\n- QR code

== 3. Dépôt Palettes (après livraison) ==
mobile -> mobile: Driver navigue vers\nsite de retour
mobile -> mobile: GPS détecte arrivée\n(geofencing)
mobile -> mobile: Active caméra QR
mobile -> mobile: Scan QR code chèque

mobile -> palette: POST /palette/cheques/:id/deposit
note right
  Body:
  - geolocation (lat/long)
  - transporterSignature (tactile)
  - photo (optionnel)
  - timestamp
end note

palette -> palette: Valide géolocalisation\n(dans rayon site)
palette -> db: Met à jour cheque\n(status: DEPOSE)
palette -> db: Stocke signature + photo
palette -> notif: Notifie logisticien
palette --> mobile: Dépôt confirmé

mobile -> mobile: Affiche confirmation

== 4. Réception par Logisticien ==
logistician -> web_log: Login application
web_log -> web_log: Affiche notifications\n"Dépôt en attente"
logistician -> web_log: Ouvre détails dépôt
web_log -> web_log: Affiche:\n- Quantité\n- Transporteur\n- Photo dépôt\n- Timestamp

logistician -> web_log: Va au site
logistician -> web_log: Active scan QR
web_log -> palette: POST /palette/cheques/:id/receive
note right
  Body:
  - geolocation
  - receiverSignature
  - photo (optionnel)
  - actualQuantity
  - qualityCheck (OK/DAMAGED)
end note

palette -> palette: Valide géolocalisation
palette -> db: Met à jour cheque\n(status: RECU)

== 5. Mise à Jour Ledger ==
palette -> db: Crée transaction ledger:\n- DEBIT transporteur (-10)\n- CREDIT logisticien (+10)
palette -> db: Met à jour site quotas
palette -> db: Calcule nouveaux balances

palette -> notif: Notifie transporteur\n"Réception confirmée"
palette -> notif: Notifie industriel\n"Cycle complet"
palette --> web_log: Réception validée

web_log -> logistician: Affiche nouveau balance

== 6. Gestion des Litiges (optionnel) ==
alt Quantité ou qualité incorrecte
  logistician -> web_log: Signale problème
  web_log -> palette: POST /palette/disputes
  note right
    - Raison (QUANTITY_MISMATCH, DAMAGED)
    - Photos
    - Description
  end note

  palette -> db: Crée dispute (status: OPEN)
  palette -> notif: Notifie admin + transporteur
  palette --> web_log: Dispute enregistrée

  ... Investigation backoffice ...

  palette -> palette: Admin résout
  palette -> db: Ajuste ledger si nécessaire
  palette -> db: Met à jour dispute (RESOLVED)
  palette -> notif: Notifie parties
end

@enduml
```

### Diagramme d'Activité - Workflow Palette

```plantuml
@startuml RT-Palette-Activity
|Industriel|
start
:Crée commande avec palettes;
:Demande génération chèque palette;

|Service Palette|
:Reçoit requête génération;
:Appel IA pour matching site;

|IA Matching|
:Recherche sites dans 30km;
:Calcule scores (distance, quota, horaires);
:Retourne site optimal;

|Service Palette|
:Génère QR code unique;
:Signature cryptographique Ed25519;
:Enregistre chèque (EMIS);
:Retourne infos à industriel;

|Driver|
:Reçoit mission de livraison;
:Note: site de retour palettes inclus;
:Effectue livraison marchandise;
:Navigue vers site de retour;

if (Arrivé au site ?) then (oui)
  :Scan QR code du chèque;
  :Signe électroniquement;
  :Photo palettes (optionnel);
  :Soumet dépôt;
else (non)
  :GPS indique mauvaise position;
  :Erreur: hors zone autorisée;
  stop
endif

|Service Palette|
:Valide géolocalisation;
:Enregistre signature + photo;
:Change status: DEPOSE;
:Notifie logisticien;

|Logisticien|
:Reçoit notification;
:Consulte détails dépôt;
:Se rend au site;
:Compte palettes physiquement;

if (Quantité conforme ?) then (oui)
  if (Qualité OK ?) then (oui)
    :Scan QR code;
    :Signe réception;
  else (non)
    :Signale palettes endommagées;
    :Crée dispute;
    detach
  endif
else (non)
  :Signale écart quantité;
  :Crée dispute;
  detach
endif

|Service Palette|
:Valide réception;
:Change status: RECU;
:Met à jour ledger;
fork
  :DEBIT transporteur;
fork again
  :CREDIT logisticien;
end fork
:Incrémente quota site;
:Calcule nouveaux balances;

|Notifications|
fork
  :Notifie transporteur;
fork again
  :Notifie industriel;
fork again
  :Notifie logisticien;
end fork

|Tous|
:Cycle palette terminé;
stop

@enduml
```

---

## Flux du Marketplace de Stockage

### Diagramme de Séquence - Publication et Acceptation

```plantuml
@startuml RT-Storage-Marketplace-Sequence
actor "Industriel" as industry
participant "web-industry" as web_ind
participant "storage-market\nService" as market
participant "ai-client" as ai
participant "MongoDB" as db
participant "notifications" as notif
participant "Mailgun" as email
actor "Logisticien" as logistician
participant "web-logistician" as web_log

== 1. Publication Besoin de Stockage ==
industry -> web_ind: Accède Marketplace
industry -> web_ind: Clique "Publier besoin"
web_ind -> web_ind: Formulaire:\n- Localisation\n- Capacité (palettes/m²)\n- Durée\n- Température\n- Budget\n- Visibilité (Global/Direct)

industry -> web_ind: Soumet formulaire
web_ind -> market: POST /storage-market/needs/create
market -> db: Insère storage_need\n(status: PUBLISHED)
market -> db: Récupère logisticians actifs

alt Visibilité GLOBAL
  market -> db: Tous logisticians
else Visibilité DIRECT
  market -> db: Logisticians invités uniquement
end

market -> notif: POST /notify (bulk)
notif -> email: Envoie emails aux logisticians
email --> logistician: "Nouveau besoin de stockage"
market --> web_ind: needId créé
web_ind -> industry: "Besoin publié, en attente d'offres"

== 2. Consultation et Soumission Offre ==
logistician -> email: Reçoit notification
logistician -> web_log: Login application
web_log -> market: GET /storage-market/needs/published
market -> db: Récupère needs actifs
market --> web_log: Liste besoins

web_log -> logistician: Affiche marketplace
logistician -> web_log: Sélectionne besoin intéressant
web_log -> market: GET /storage-market/needs/:id
market -> db: Détails complets
market --> web_log: Détails besoin

logistician -> web_log: "Soumettre une offre"
web_log -> web_log: Formulaire offre:\n- Site disponible\n- Prix (€/palette/jour)\n- Capacité disponible\n- Date de début\n- Services inclus\n- Certifications

logistician -> web_log: Soumet offre
web_log -> market: POST /storage-market/offers/send
market -> db: Insère storage_offer\n(status: SUBMITTED)
market -> notif: Notifie industriel
notif -> email: "Nouvelle offre reçue"
market --> web_log: offerId créé
web_log -> logistician: "Offre soumise avec succès"

== 3. Ranking IA des Offres ==
industry -> web_ind: Consulte offres reçues
web_ind -> market: GET /storage-market/offers?needId=X
market -> db: Récupère toutes les offres
market -> ai: POST /offers/ranking
note right
  Critères de scoring:
  - Prix: 40 points
  - Proximité: 25 points
  - Fiabilité: 20 points
  - Réactivité: 15 points
end note

ai -> ai: Calcule score pour chaque offre
ai -> ai: Normalise et pondère
ai -> ai: Tri par score décroissant
ai --> market: Offres classées avec scores

market --> web_ind: Liste offres ranked
web_ind -> industry: Affiche top 3 recommandées\n+ toutes les offres

== 4. Acceptation et Création Contrat ==
industry -> web_ind: Sélectionne meilleure offre
web_ind -> web_ind: Affiche récapitulatif
industry -> web_ind: Confirme acceptation

web_ind -> market: POST /storage-market/contracts/create
market -> db: Insère storage_contract\n(status: ACTIVE)
market -> db: Met à jour need (CONTRACTED)
market -> db: Met à jour offer acceptée (ACCEPTED)
market -> db: Met à jour autres offers (REJECTED)

market -> notif: Notifie logisticien gagnant
notif -> email: "Félicitations! Offre acceptée"

market -> notif: Notifie autres logisticians
notif -> email: "Besoin déjà contracté"

market --> web_ind: contractId créé
web_ind -> industry: "Contrat créé, stockage confirmé"

== 5. Activation WMS ==
market -> market: Configure WMS sync
market -> db: Crée wms_config pour contractId
market -> notif: Notifie logisticien
notif -> email: "Activez intégration WMS"

logistician -> web_log: Configure WMS
web_log -> market: POST /wms-sync/configure
market -> db: Stocke credentials WMS
market --> web_log: Sync activée

== 6. Suivi Inventory en Temps Réel ==
loop Sync périodique (toutes les 30 min)
  market -> market: WMS sync job
  market -> db: Récupère wms_config
  market -> market: Appel API WMS externe
  market -> market: Parse données inventory
  market -> db: Met à jour wms_inventory
  market -> db: Insère wms_movements
end

industry -> web_ind: Consulte inventaire
web_ind -> market: GET /wms/inventory/:contractId
market -> db: Récupère dernières données
market --> web_ind: Inventory actuel
web_ind -> industry: Dashboard inventory temps réel

@enduml
```

### Diagramme d'Activité - Cycle Marketplace

```plantuml
@startuml RT-Storage-Marketplace-Activity
|Industriel|
start
:Besoin de stockage identifié;
:Accède Marketplace;

partition "Publication" {
  :Remplit formulaire besoin;
  note right
    - Lieu
    - Capacité
    - Durée
    - Température
    - Budget
  end note

  if (Visibilité ?) then (GLOBAL)
    :Tous logisticians notifiés;
  else (DIRECT)
    :Logisticians invités uniquement;
  endif

  :Publication (status: PUBLISHED);
}

|Logisticiens|
partition "Réception et Analyse" {
  :Reçoivent notification email;
  :Consultent besoin;

  fork
    :Logisticien A analyse;
    if (Capacité dispo ?) then (oui)
      :Prépare offre;
    else (non)
      detach
    endif
  fork again
    :Logisticien B analyse;
    if (Capacité dispo ?) then (oui)
      :Prépare offre;
    else (non)
      detach
    endif
  fork again
    :Logisticien C analyse;
    if (Capacité dispo ?) then (oui)
      :Prépare offre;
    else (non)
      detach
    endif
  end fork
}

partition "Soumission Offres" {
  :Logisticiens soumettent offres;
  :Status: SUBMITTED;
  :Notification industriel;
}

|Service IA|
partition "Ranking Intelligence" {
  :Collecte toutes les offres;
  :Calcul score Prix (40%);
  :Calcul score Proximité (25%);
  note right
    Utilise 2dsphere index
    Haversine distance
  end note
  :Calcul score Fiabilité (20%);
  note right
    Basé sur historique
    Taux de satisfaction
  end note
  :Calcul score Réactivité (15%);
  note right
    Temps de réponse
    Disponibilité
  end note

  :Score total = somme pondérée;
  :Tri décroissant par score;
}

|Industriel|
partition "Sélection" {
  :Consulte offres classées;
  :Top 3 mises en avant;
  :Affichage carte + détails;

  :Compare offres;
  :Sélectionne meilleure offre;
  :Confirme acceptation;
}

|Service Storage Market|
partition "Contractualisation" {
  :Crée contrat (ACTIVE);
  :Marque need: CONTRACTED;
  :Marque offre sélectionnée: ACCEPTED;
  :Rejette autres offres;

  fork
    :Notifie gagnant;
  fork again
    :Notifie perdants;
  end fork
}

|Logisticien Gagnant|
partition "Intégration WMS" {
  :Reçoit demande config WMS;
  :Entre credentials API WMS;
  :Test connexion;

  if (Connexion OK ?) then (oui)
    :Active sync automatique;
  else (non)
    :Erreur configuration;
    :Support contacté;
    detach
  endif
}

|Service Storage Market|
partition "Synchronisation Continue" {
  repeat
    :Sync WMS (toutes les 30 min);
    :Récupère inventory;
    :Récupère movements;
    :Met à jour DB;
    :Calcule métriques;
  repeat while (Contrat ACTIVE ?)
}

|Industriel & Logisticien|
:Consultent dashboards;
:Inventory temps réel;
:Mouvements tracés;
:Alertes stocks bas;

:Fin de contrat;
:Status: COMPLETED;

stop

@enduml
```

---

## Flux de Support Client (Chatbot)

### Diagramme de Séquence - Session Chatbot avec Escalade

```plantuml
@startuml RT-Chatbot-Sequence
actor "Utilisateur" as user
participant "App Frontend\n(widget)" as widget
participant "chatbot\nService" as chatbot
participant "ai-client\n(OpenRouter)" as ai
participant "MongoDB" as db
participant "Microsoft Teams" as teams
actor "Support Humain" as support

== 1. Ouverture Session ==
user -> widget: Clique icône chatbot
widget -> chatbot: POST /chatbot/session
note right
  Body:
  - userId
  - orgId
  - botType (ex: HELPBOT)
  - language
end note

chatbot -> db: Crée conversation
chatbot -> db: Charge knowledge base
chatbot --> widget: conversationId, welcomeMessage
widget -> user: Affiche chat + message d'accueil

== 2. Conversation IA ==
user -> widget: Tape question\n"Comment modifier une commande?"
widget -> chatbot: POST /chatbot/message
note right
  Body:
  - conversationId
  - content
  - timestamp
end note

chatbot -> db: Enregistre message (role: USER)
chatbot -> db: Récupère historique conversation
chatbot -> db: Recherche dans knowledge_base
chatbot -> ai: POST to OpenRouter API
note right
  Model: GPT-4o-mini
  Context: historique + knowledge base
  Max tokens: 500
end note

ai -> ai: Traite question
ai -> ai: Génère réponse
ai --> chatbot: Response + confidence score

chatbot -> db: Enregistre réponse (role: ASSISTANT)

alt Confidence haute (>0.8)
  chatbot -> chatbot: Extrait actions suggérées
  chatbot --> widget: Response + suggestedActions
  widget -> user: Affiche réponse + boutons action
else Confidence moyenne (0.5-0.8)
  chatbot --> widget: Response + disclaimer
  widget -> user: "Voici ce que j'ai trouvé...\nSouhaitez-vous parler à un humain?"
else Confidence basse (<0.5)
  chatbot -> chatbot: Déclenche escalade auto
  chatbot -> chatbot: Jump to "Escalade Humaine"
end

== 3. Diagnostics Automatiques ==
user -> widget: "J'ai un problème de connexion"
widget -> chatbot: POST /chatbot/message

chatbot -> chatbot: Détecte intent: TECHNICAL_ISSUE
chatbot -> chatbot: Lance diagnostics
note right
  Checks:
  - API service status
  - User session validity
  - Recent error logs
  - Network connectivity
end note

chatbot -> db: Récupère logs user récents
chatbot -> chatbot: Analyse logs
chatbot -> chatbot: Évalue sévérité

alt Problème identifié
  chatbot -> db: Crée diagnostic record
  chatbot -> chatbot: Génère recommended_actions
  chatbot --> widget: "Problème détecté:\n[description]\n\nActions:\n1. ...\n2. ..."
  widget -> user: Affiche diagnostic + actions
else Problème non identifiable
  chatbot -> chatbot: Escalade nécessaire
end

== 4. Escalade vers Humain ==
user -> widget: "Je veux parler à quelqu'un"
widget -> chatbot: POST /chatbot/transfer-to-human

chatbot -> db: Met à jour conversation\n(transferredToHuman: true)
chatbot -> db: Évalue priorité
note right
  Priority factors:
  - Severity (CRITICAL = 1, LOW = 4)
  - Customer plan (ENTERPRISE prioritaire)
  - Issue type
  - Waiting time
end note

chatbot -> teams: POST Webhook
note right
  Adaptive Card:
  - User info
  - Conversation history
  - Issue summary
  - Priority level
  - Quick actions
end note

teams --> support: Notification carte Teams
chatbot --> widget: "Transfert en cours...\nUn agent va vous répondre"

== 5. Prise en Charge Humaine ==
support -> teams: Consulte carte
support -> teams: Clique "Prendre en charge"
teams -> chatbot: POST /chatbot/assign-agent
chatbot -> db: Met à jour conversation\n(humanAgent: supportId)
chatbot --> widget: "Agent [Nom] a rejoint"

support -> teams: Tape réponse
teams -> chatbot: POST /chatbot/message (agent)
chatbot -> db: Enregistre (role: ASSISTANT, human: true)
chatbot --> widget: Push message via WebSocket
widget -> user: Affiche message agent

user -> widget: Répond à l'agent
widget -> chatbot: POST /chatbot/message
chatbot -> db: Enregistre message
chatbot -> teams: Push to Teams
teams -> support: Notification + message

== 6. Résolution et Clôture ==
support -> teams: "Problème résolu"
support -> teams: Demande évaluation satisfaction
teams -> chatbot: POST /chatbot/request-feedback

chatbot --> widget: "Votre problème est-il résolu?"
widget -> user: Boutons: "Oui" / "Non"

user -> widget: Clique "Oui"
widget -> chatbot: POST /chatbot/feedback

chatbot -> db: Met à jour conversation:\n- satisfaction: 5/5\n- status: CLOSED

chatbot -> db: Enregistre métriques
note right
  Metrics:
  - Resolution time
  - Message count
  - Transfer needed
  - Satisfaction score
end note

chatbot --> widget: "Merci! À bientôt."
widget -> user: Ferme chat

@enduml
```

---

## Flux de Géolocalisation et ETA

### Diagramme de Séquence - Tracking GPS et Calcul ETA

```plantuml
@startuml RT-Geo-Tracking-Sequence
actor "Driver" as driver
participant "mobile-driver\nApp" as mobile
participant "geo-tracking\nService" as geo
participant "TomTom Traffic\nAPI" as tomtom
participant "tracking-ia\nService" as tracking_ia
participant "MongoDB" as db
participant "NATS" as nats
participant "notifications" as notif
actor "Industriel" as industry
participant "web-industry" as web

== 1. Activation Tracking ==
driver -> mobile: Accepte mission
mobile -> mobile: Demande permissions GPS
mobile -> mobile: Active geolocation

mobile -> geo: POST /geo-tracking/start
note right
  Body:
  - orderId
  - driverId
  - deviceId
end note

geo -> db: Crée tracking session
geo -> db: Active geofencing zones
note right
  Zones:
  - Pickup (rayon 200m)
  - Delivery (rayon 200m)
end note

geo --> mobile: Tracking activé
mobile -> mobile: Démarre envoi positions

== 2. Envoi Positions Temps Réel ==
loop Toutes les 30 secondes
  mobile -> mobile: Lit GPS
  mobile -> geo: POST /geo-tracking/position
  note right
    Body:
    - deviceId
    - orderId
    - latitude
    - longitude
    - accuracy
    - speed
    - heading
    - timestamp
  end note

  geo -> db: Insère geo_location
  geo -> geo: Vérifie geofences

  alt Entrée zone pickup
    geo -> db: Crée geofence_event (ENTERED)
    geo -> nats: Publie GEOFENCE_PICKUP_ENTERED
    geo -> notif: Notifie industriel
  else Sortie zone pickup
    geo -> db: Crée geofence_event (EXITED)
    geo -> db: Crée tracking_event (PICKUP_COMPLETED)
    geo -> nats: Publie PICKUP_COMPLETED
  else Entrée zone delivery
    geo -> db: Crée geofence_event (ENTERED)
    geo -> nats: Publie GEOFENCE_DELIVERY_ENTERED
    geo -> notif: Notifie destinataire
  end

  geo --> mobile: ACK
end

== 3. Calcul ETA avec Trafic ==
web -> geo: GET /geo-tracking/eta/:orderId
geo -> db: Récupère dernière position
geo -> db: Récupère adresse destination

geo -> tomtom: GET Traffic Flow API
note right
  Params:
  - Origin: position actuelle
  - Destination: delivery address
  - Traffic: true
  - Departure: now
end note

tomtom -> tomtom: Calcule route optimale
tomtom -> tomtom: Intègre données trafic temps réel
tomtom --> geo: Route + duration + traffic delay

geo -> geo: ETA = now + duration + buffer(10%)

geo -> tracking_ia: POST /predict/eta
note right
  Body:
  - orderId
  - currentPosition
  - destination
  - currentSpeed
  - trafficDelay
  - historicalData
end note

tracking_ia -> db: Récupère historique driver
tracking_ia -> db: Récupère patterns similaires
tracking_ia -> tracking_ia: Modèle ML prédiction
tracking_ia -> tracking_ia: Calcule confidence

tracking_ia --> geo: predictedETA, confidence
geo -> db: Enregistre tracking_prediction

geo --> web: ETA + confidence + traffic info
web -> industry: Affiche ETA sur carte:\n"Arrivée prévue: 14h23 (+15min trafic)"

== 4. Mise à Jour Dynamique ETA ==
loop Toutes les 5 minutes
  geo -> geo: Re-calcule ETA
  geo -> tomtom: GET Traffic Flow (updated)
  tomtom --> geo: Nouvelle durée

  geo -> geo: Compare ancien/nouveau ETA

  alt Delta > 10 minutes
    geo -> db: Met à jour prediction
    geo -> nats: Publie ETA_CHANGED
    geo -> notif: Notifie industriel
    notif -> web: Push notification
    web -> industry: "ETA modifiée: +20min (trafic)"
  end
end

== 5. Événements Tracking Clés ==
driver -> mobile: "Arrivé chez client"
mobile -> geo: POST /geo-tracking/event
note right
  Body:
  - orderId
  - type: DELIVERY_STARTED
  - location
  - photo
  - timestamp
end note

geo -> db: Insère tracking_event
geo -> nats: Publie DELIVERY_STARTED
geo -> notif: Notifie industriel

driver -> mobile: "Livraison effectuée"
driver -> mobile: Scan signature + photo
mobile -> geo: POST /geo-tracking/event
note right
  type: DELIVERED
  signature: base64
  photo: base64
end note

geo -> db: Insère tracking_event
geo -> db: Met à jour order (status: DELIVERED)
geo -> db: Compare actualArrival vs predictedETA
geo -> db: Met à jour accuracy metric

geo -> tracking_ia: POST /feedback
note right
  Training data:
  - Predicted ETA
  - Actual arrival
  - Factors (traffic, weather, etc.)
end note

tracking_ia -> tracking_ia: Améliore modèle ML

geo -> nats: Publie ORDER_DELIVERED
geo -> notif: Notifie toutes les parties
geo --> mobile: Livraison confirmée

mobile -> mobile: Arrête tracking GPS
mobile -> driver: "Mission terminée"

@enduml
```

---

## Diagrammes Complémentaires

### Diagramme d'États - Cycle de Vie Commande

```plantuml
@startuml RT-Order-State-Diagram
[*] --> NEW : Création

NEW --> DISPATCHED : dispatch()
NEW --> CANCELLED : cancel()

DISPATCHED --> ACCEPTED : carrier accepts
DISPATCHED --> ESCALATED_AFFRETIA : SLA timeout
DISPATCHED --> CANCELLED : cancel()

ACCEPTED --> IN_TRANSIT : pickup started
ACCEPTED --> CANCELLED : carrier cancels

IN_TRANSIT --> DELIVERED : delivery completed
IN_TRANSIT --> EXCEPTION : issue reported

EXCEPTION --> IN_TRANSIT : issue resolved
EXCEPTION --> CANCELLED : unresolvable

ESCALATED_AFFRETIA --> ACCEPTED : external carrier accepts
ESCALATED_AFFRETIA --> CANCELLED : no solution found

DELIVERED --> [*]
CANCELLED --> [*]

note right of NEW
  Commande créée par industriel
  En attente de dispatch
end note

note right of DISPATCHED
  Carrier notifié
  Timer SLA démarré (2h)
  Rappels T-30min et T-10min
end note

note right of ACCEPTED
  Carrier a accepté
  Driver peut être assigné
  Planning en cours
end note

note right of IN_TRANSIT
  GPS tracking actif
  Geofencing activé
  ETA calculé en temps réel
end note

note right of ESCALATED_AFFRETIA
  Aucun carrier n'a accepté
  IA recherche solution externe
  Bourse de transport consultée
end note

@enduml
```

### Diagramme de Composants - Architecture Microservices

```plantuml
@startuml RT-Microservices-Components
package "Frontend Layer" {
  [web-industry]
  [web-transporter]
  [web-logistician]
  [backoffice-admin]
  [mobile-driver]
}

package "API Gateway" {
  [admin-gateway] as gateway
  [Security Middleware] as security
}

package "Core Business Services" {
  [authz]
  [core-orders]
  [palette]
  [storage-market]
}

package "AI Services" {
  [affret-ia]
  [tracking-ia]
  [chatbot]
}

package "Integration Services" {
  [geo-tracking]
  [notifications]
  [vigilance]
  [tms-sync]
  [erp-sync]
}

package "Data Layer" {
  database "MongoDB" as mongo
  database "Redis" as redis
  queue "NATS" as nats
}

package "External Services" {
  [TomTom API]
  [OpenRouter API]
  [VIES/INSEE API]
  [Mailgun]
  [Microsoft Teams]
}

' Connexions
[web-industry] --> gateway
[web-transporter] --> gateway
[web-logistician] --> gateway
[backoffice-admin] --> gateway
[mobile-driver] --> [geo-tracking]

gateway --> security
security --> [authz]
security --> [core-orders]
security --> [palette]
security --> [storage-market]

[core-orders] --> [affret-ia]
[core-orders] --> [vigilance]
[core-orders] --> [geo-tracking]
[core-orders] --> [notifications]

[geo-tracking] --> [TomTom API]
[geo-tracking] --> [tracking-ia]
[chatbot] --> [OpenRouter API]
[chatbot] --> [Microsoft Teams]
[vigilance] --> [VIES/INSEE API]
[notifications] --> [Mailgun]

[authz] --> mongo
[core-orders] --> mongo
[palette] --> mongo
[storage-market] --> mongo
[geo-tracking] --> mongo
[chatbot] --> mongo

[authz] --> redis
[core-orders] --> redis

[core-orders] --> nats
[geo-tracking] --> nats
[notifications] --> nats
[palette] --> nats

@enduml
```

---

## Conclusion

Ces diagrammes UML couvrent les principaux flux métier de la plateforme RT-Technologie:

1. **Authentication & Onboarding** - Inscription sécurisée avec vérification VAT et signature électronique
2. **Order Dispatch** - Dispatch intelligent avec SLA, rappels automatiques et escalade IA
3. **Palette Management** - Économie circulaire avec QR codes, signatures cryptographiques et ledger
4. **Storage Marketplace** - Marketplace avec ranking IA et intégration WMS temps réel
5. **Chatbot Support** - Support client multi-bot avec diagnostics auto et escalade humaine
6. **Geo-tracking & ETA** - Tracking GPS temps réel avec calcul ETA intégrant le trafic

Tous ces flux sont interconnectés via:
- **NATS** pour la messagerie asynchrone
- **MongoDB** pour le stockage persistant
- **Redis** pour le cache et sessions
- **APIs externes** pour l'enrichissement de données

La plateforme démontre une architecture microservices moderne avec intelligence artificielle intégrée.
