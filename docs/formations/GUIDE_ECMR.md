# Guide de Formation - Module E-CMR (CMR Électronique)

**Version** : 1.0
**Dernière mise à jour** : Novembre 2025
**Temps de lecture** : ~12 minutes
**Niveau** : Débutant
**Langues disponibles** : FR (EN, DE à venir)

---

## Table des matières

1. [Qu'est-ce que l'e-CMR ?](#quest-ce-que-lecmr)
2. [Pour qui ?](#pour-qui)
3. [Avantages vs CMR papier](#avantages-vs-cmr-papier)
4. [Workflow complet en 3 signatures](#workflow-complet-en-3-signatures)
5. [Création d'un e-CMR](#création-dun-ecmr)
6. [Signature expéditeur](#signature-expéditeur)
7. [Signature transporteur](#signature-transporteur)
8. [Signature destinataire](#signature-destinataire)
9. [Gestion des réserves](#gestion-des-réserves)
10. [Export et archivage](#export-et-archivage)
11. [Valeur légale et conformité](#valeur-légale-et-conformité)
12. [Erreurs courantes et solutions](#erreurs-courantes-et-solutions)
13. [Interopérabilité](#interopérabilité)
14. [Support](#support)

---

## Qu'est-ce que l'e-CMR ?

### Définition

L'**e-CMR** (electronic Consignment Note) est la version dématérialisée de la lettre de voiture CMR traditionnelle. C'est le document de transport international routier qui remplace le format papier par un format 100% numérique.

### Contexte légal

L'e-CMR est reconnu légalement depuis l'adoption du **Protocole additionnel à la Convention CMR** par l'IRU (International Road Transport Union) :

- **Convention CMR** : Convention relative au contrat de transport international de marchandises par route (1956)
- **Protocole e-CMR** : Adopté en 2008, entré en vigueur en 2011
- **Reconnaissance internationale** : Plus de 30 pays signataires (UE, Turquie, Russie, etc.)

### Protocole IRU

Le protocole IRU garantit :

- **Équivalence juridique** : L'e-CMR a la même valeur légale qu'un CMR papier
- **Standardisation** : Format et données harmonisés internationalement
- **Interopérabilité** : Échange entre différentes plateformes certifiées
- **Sécurité** : Signatures électroniques qualifiées obligatoires

> **Important** : L'e-CMR n'est pas une simple numérisation du CMR papier. C'est un document natif numérique avec des garanties de sécurité et d'authenticité renforcées.

---

## Pour qui ?

Le module E-CMR s'adresse à **trois acteurs** de la chaîne de transport :

### 1. Expéditeurs (Chargeurs)

- Création des e-CMR depuis leur compte RT
- Pré-remplissage des informations (marchandise, destinataire, instructions)
- Signature électronique au départ
- Suivi en temps réel du statut du transport

**Cas d'usage** : Industriels, distributeurs, e-commerce

### 2. Transporteurs

- Réception des e-CMR dans l'app mobile conducteur
- Signature au chargement (départ)
- Modification des données en transit si nécessaire (avec traçabilité)
- Déclaration des réserves ou incidents

**Cas d'usage** : Compagnies de transport, affréteurs, conducteurs indépendants

### 3. Destinataires (Réceptionnaires)

- Notification de livraison imminente
- Signature électronique à la réception
- Déclaration des réserves (quantité, état, conformité)
- Validation de la conformité de la livraison

**Cas d'usage** : Entrepôts, magasins, plateformes logistiques

---

## Avantages vs CMR papier

| Critère | CMR Papier | E-CMR |
|---------|------------|-------|
| **Délai de transmission** | 5-15 jours (courrier) | Instantané |
| **Risque de perte** | Élevé | Nul (archivage cloud) |
| **Coût administratif** | ~8-15€ par CMR | ~1-2€ par e-CMR |
| **Stockage physique** | Obligatoire 10 ans | Archivage automatique |
| **Authentification** | Signature manuscrite | Signature qualifiée eIDAS |
| **Traçabilité** | Limitée | Complète (horodatage, géolocalisation) |
| **Modification** | Impossible sans nouvelle version | Historique complet des modifications |
| **Litige** | Difficile à prouver | Preuves numériques horodatées |
| **Écologie** | Papier, encre, transport | 100% dématérialisé |
| **Conformité** | Manuelle | Automatique (champs obligatoires) |

### Gains mesurés

- **Réduction des délais** : 70% de temps gagné sur le traitement administratif
- **Économies** : Jusqu'à 80% de réduction des coûts de traitement
- **Satisfaction** : 95% des utilisateurs préfèrent l'e-CMR après 3 mois d'usage
- **Litiges** : -60% grâce à la traçabilité complète

---

## Workflow complet en 3 signatures

Le cycle de vie d'un e-CMR suit **3 étapes de signature obligatoires** :

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   EXPÉDITEUR    │ ───> │  TRANSPORTEUR   │ ───> │  DESTINATAIRE   │
│  (Signature 1)  │      │  (Signature 2)  │      │  (Signature 3)  │
└─────────────────┘      └─────────────────┘      └─────────────────┘
        │                        │                        │
        │ Création e-CMR         │ Prise en charge        │ Réception
        │ + Signature            │ + Signature            │ + Signature
        │                        │                        │
        v                        v                        v
   STATUT: CRÉÉ            STATUT: EN COURS         STATUT: LIVRÉ
```

### Étape 1 : Signature expéditeur

- **Quand ?** : Au moment du chargement de la marchandise
- **Où ?** : Interface web RT ou app mobile
- **Données** : Informations marchandise, destinataire, instructions spéciales
- **Signature** : Qualification eIDAS niveau 2 minimum

### Étape 2 : Signature transporteur

- **Quand ?** : À la prise en charge de la marchandise
- **Où ?** : App mobile conducteur RT
- **Données** : Vérification de la conformité, état du chargement, photos
- **Signature** : Qualification eIDAS + géolocalisation + horodatage

### Étape 3 : Signature destinataire

- **Quand ?** : À la réception de la marchandise
- **Où ?** : Interface web RT ou tablette
- **Données** : Vérification quantité/qualité, déclaration réserves si nécessaire
- **Signature** : Qualification eIDAS + horodatage

> **À savoir** : Chaque signature est horodatée avec un serveur de temps certifié et enregistre la géolocalisation GPS (si disponible). Ces métadonnées ont valeur probante en cas de litige.

---

## Création d'un e-CMR

### Accès

**Chemin** : Tableau de bord > Commandes > Créer un e-CMR

Ou depuis une commande existante : **Actions** > **Générer e-CMR**

### Champs obligatoires

Ces champs sont **requis** pour la conformité au protocole IRU :

#### 1. Expéditeur
- Nom de l'entreprise
- Adresse complète
- Pays
- Contact (email/téléphone)

#### 2. Destinataire
- Nom de l'entreprise
- Adresse complète de livraison
- Pays
- Contact (email/téléphone)

#### 3. Transporteur
- Nom de la compagnie de transport
- Immatriculation du véhicule (ou à remplir par le transporteur)
- Nom du conducteur (ou à remplir par le transporteur)

#### 4. Marchandise
- **Nature** : Description de la marchandise (ex: "Palettes de produits électroniques")
- **Nombre de colis** : Quantité (ex: 15 palettes)
- **Mode d'emballage** : Palette, carton, vrac, etc.
- **Poids brut** : En kg
- **Volume** : En m³ (si applicable)

#### 5. Informations de transport
- **Date de chargement prévue**
- **Lieu de chargement** (si différent de l'adresse expéditeur)
- **Date de livraison prévue**
- **Lieu de livraison** (si différent de l'adresse destinataire)

### Champs optionnels

Ces champs enrichissent le e-CMR mais ne sont pas obligatoires :

- **Numéro de commande client** : Référence interne
- **Instructions spéciales** : Consignes de livraison (ex: "Livraison quai 3, entre 8h-12h")
- **Valeur déclarée** : Pour assurance (en €)
- **Marchandises dangereuses** : Code UN, classe ADR si applicable
- **Température** : Pour transport sous température contrôlée
- **Documents joints** : Factures, certificats, certificats d'origine
- **Incoterms** : EXW, FCA, DAP, DDP, etc.
- **Remboursement** : Montant à collecter à la livraison

### Pré-remplissage automatique

Le système pré-remplit automatiquement :

- Adresses depuis votre carnet d'adresses
- Informations transporteur si commande attribuée
- Données marchandise depuis la commande liée
- Vos instructions de livraison par défaut

### Validation

Avant création, le système vérifie :

- ✓ Tous les champs obligatoires sont remplis
- ✓ Format des adresses valide
- ✓ Poids et volume cohérents
- ✓ Date de livraison > date de chargement
- ✓ Coordonnées de contact valides

---

## Signature expéditeur

### Procédure

1. **Vérification des données** : Relisez toutes les informations saisies
2. **Clic sur "Signer en tant qu'expéditeur"**
3. **Authentification forte** :
   - Mot de passe + code 2FA (SMS ou app)
   - Ou certificat électronique qualifié
4. **Signature électronique** :
   - Le système génère un hash cryptographique du document
   - Votre signature qualifiée eIDAS est apposée
   - Horodatage certifié enregistré
5. **Confirmation** : Vous recevez un email de confirmation avec le PDF signé

### Type de signature

**Signature Électronique Qualifiée (eIDAS niveau 3)** :

- Basée sur un certificat qualifié délivré par un Prestataire de Services de Confiance (PSC)
- Équivalent juridique d'une signature manuscrite
- Non-répudiation : Impossible de nier avoir signé
- Intégrité : Toute modification ultérieure est détectable

### Que se passe-t-il après ?

- L'e-CMR passe au statut **"Créé - En attente transporteur"**
- Le transporteur reçoit une notification (email + app mobile)
- Vous recevez une copie PDF avec QR code de vérification
- Le document est archivé dans votre espace RT

### Modification après signature

> **Important** : Une fois signé par l'expéditeur, l'e-CMR ne peut plus être modifié par l'expéditeur sans invalidation.

**Options** :
- **Annulation** : Annuler l'e-CMR et en créer un nouveau (si pas encore signé par le transporteur)
- **Avenant** : Créer un avenant avec l'accord du transporteur (tracé dans l'historique)

---

## Signature transporteur

### App mobile conducteur

La signature transporteur s'effectue **exclusivement via l'application mobile RT Conducteur**.

### Procédure

1. **Réception notification** : Le conducteur reçoit l'e-CMR dans son app
2. **Consultation** : Il consulte les détails (marchandise, lieu, instructions)
3. **Arrivée sur site** : L'app détecte la géolocalisation
4. **Contrôle marchandise** :
   - Vérification nombre de colis
   - Vérification état apparent
   - Photos obligatoires (au moins 2 : vue générale + détail)
5. **Déclaration des réserves** (si nécessaire) :
   - "Manque 2 palettes"
   - "Emballage endommagé"
   - "Marchandise non conforme"
6. **Signature électronique** :
   - Authentification biométrique (Touch ID / Face ID) ou PIN
   - Signature tactile sur écran
   - Capture GPS + horodatage
7. **Confirmation** : L'e-CMR passe au statut **"En cours de transport"**

### Données collectées automatiquement

- **Géolocalisation GPS** : Latitude/longitude du point de chargement
- **Horodatage** : Date et heure exacte de la signature
- **Photos** : Stockées avec métadonnées EXIF
- **Identité du conducteur** : Nom, permis, authentification
- **Véhicule** : Immatriculation, type, volume disponible

### Mode hors ligne

L'app mobile fonctionne **hors connexion** :

- L'e-CMR est téléchargé en cache
- La signature est enregistrée localement
- Synchronisation automatique dès retour de connexion (4G/5G/WiFi)
- Notification de synchronisation réussie

> **Sécurité** : Les signatures hors ligne utilisent le même niveau de sécurité (horodatage local validé au moment de la synchronisation).

### Refus de chargement

Si le transporteur refuse le chargement :

1. Sélectionner **"Refuser le chargement"**
2. Motif obligatoire (liste déroulante + commentaire libre)
3. Photos obligatoires (preuves)
4. Notification immédiate à l'expéditeur
5. L'e-CMR passe au statut **"Refusé"**

---

## Signature destinataire

### Accès

Le destinataire peut signer de **deux manières** :

1. **Interface web RT** : Lien reçu par email
2. **Tablette sur site** : App RT Réception (pour entrepôts)

### Notification de livraison

Le destinataire reçoit :

- **Email 24h avant** : Alerte de livraison imminente
- **Email 2h avant** : Notification avec ETA précis
- **SMS** : Au départ du transporteur vers le site de livraison

### Procédure de réception

1. **Accès à l'e-CMR** : Via lien email ou scan QR code
2. **Authentification** : Code OTP par email/SMS
3. **Vérification marchandise** :
   - Comptage des colis
   - Vérification état apparent
   - Conformité avec le bon de commande
4. **Photos** : Au moins 2 photos obligatoires
5. **Déclaration** :
   - **Conforme** : "Livraison conforme, sans réserve"
   - **Avec réserves** : Détail des anomalies (voir section suivante)
6. **Signature électronique** :
   - Signature tactile sur écran
   - Authentification OTP
   - Horodatage certifié
7. **Validation finale** : L'e-CMR passe au statut **"Livré"**

### Délai de signature

- **Recommandé** : Signature immédiate à la réception
- **Maximum** : 24h après livraison
- **Au-delà** : Nécessite validation manuelle (support RT)

> **Bon à savoir** : Le délai de signature impacte le paiement du transporteur. Une signature rapide accélère la facturation.

### Refus de livraison

En cas de refus total de la livraison :

1. Sélectionner **"Refuser la livraison"**
2. Motif obligatoire (liste + commentaire)
3. Photos obligatoires
4. Notification immédiate expéditeur + transporteur
5. L'e-CMR passe au statut **"Refusé par destinataire"**
6. Le transporteur doit organiser le retour ou la mise en consigne

---

## Gestion des réserves

### Types de réserves

Les réserves peuvent être émises par :

- **Le transporteur** : Au moment du chargement
- **Le destinataire** : Au moment de la réception

### Catégories de réserves

#### 1. Réserves quantitatives

- Manquants : "Manque 3 palettes sur 20 annoncées"
- Surplus : "5 colis supplémentaires non déclarés"

#### 2. Réserves qualitatives

- Dommages apparents : "Emballage déchiré sur palette n°7"
- Humidité : "Cartons mouillés"
- Marchandise endommagée : "Produits cassés visibles"

#### 3. Réserves de conformité

- Non-conformité : "Produit différent de la commande"
- Erreur d'étiquetage : "Références ne correspondent pas"
- Documentation manquante : "Certificat d'origine absent"

### Procédure de déclaration

1. **Sélection du type** : Quantitatif / Qualitatif / Conformité
2. **Description précise** : Texte libre (minimum 20 caractères)
3. **Photos obligatoires** : Minimum 3 photos par réserve
4. **Quantification** : Nombre de colis concernés, poids, etc.
5. **Gravité** :
   - **Mineure** : N'empêche pas l'acceptation (ex: légère rayure emballage)
   - **Majeure** : Impacte la qualité (ex: cartons endommagés)
   - **Critique** : Justifie un refus (ex: produits inutilisables)

### Impact des réserves

- **Traçabilité** : Toutes les réserves sont horodatées et géolocalisées
- **Notification** : Tous les acteurs sont notifiés en temps réel
- **Responsabilité** : Les réserves déterminent la responsabilité en cas de litige
- **Assurance** : Les réserves sont transmises automatiquement à l'assureur
- **Paiement** : Les réserves majeures peuvent bloquer le paiement du transporteur

### Validation des réserves

Processus contradictoire :

1. **Déclaration** : Le destinataire déclare une réserve
2. **Notification** : Le transporteur est notifié immédiatement
3. **Contestation** : Le transporteur a 48h pour contester
4. **Arbitrage** : En cas de désaccord, RT peut arbitrer sur la base des preuves (photos, horodatages)

### Réserves après signature

> **Important** : Les réserves doivent être formulées **avant la signature finale**. Après signature sans réserve, il est difficile de contester.

**Exception** : Vices cachés découverts après déballage (procédure spécifique, délai 7 jours).

---

## Export et archivage

### Formats d'export

L'e-CMR peut être exporté dans plusieurs formats :

#### 1. PDF certifié

- **Usage** : Partage, impression, archivage externe
- **Contenu** :
  - Toutes les données de l'e-CMR
  - Les 3 signatures électroniques
  - QR code de vérification
  - Horodatages certifiés
  - Métadonnées (GPS, photos)
- **Certification** : PDF/A-3 avec signature électronique qualifiée
- **Vérification** : QR code permet vérification sur plateforme RT

#### 2. XML IRU

- **Usage** : Échange avec autres plateformes e-CMR certifiées
- **Standard** : Protocole IRU officiel
- **Interopérabilité** : Compatible avec toutes les solutions certifiées IRU
- **Contenu** : Données structurées conformes au schéma XSD IRU

#### 3. JSON API

- **Usage** : Intégration avec vos systèmes (ERP, TMS, WMS)
- **Endpoint** : API REST authentifiée
- **Données** : Format JSON complet avec métadonnées

#### 4. Excel / CSV

- **Usage** : Analyse, reporting, comptabilité
- **Contenu** : Données tabulaires (un e-CMR par ligne)
- **Export groupé** : Export de plusieurs e-CMR en un fichier

### QR Code de vérification

Chaque e-CMR PDF contient un **QR code unique** :

- **Scan** : Avec smartphone ou app RT
- **Vérification** : Authenticité du document
- **Affichage** :
  - Statut actuel de l'e-CMR
  - Date et heure des signatures
  - Hash cryptographique du document
  - Validité de la signature électronique

**URL de vérification** : `https://verify.rt-tech.io/ecmr/[ID]`

### Archivage automatique

Conformité légale **10 ans** :

- **Stockage** : Cloud sécurisé (infrastructure AWS/Azure)
- **Redondance** : Triple réplication géographique
- **Sauvegarde** : Backup quotidien + snapshot hebdomadaire
- **Chiffrement** : AES-256 au repos, TLS 1.3 en transit
- **Accès** : Contrôle d'accès basé sur les rôles (RBAC)
- **Audit** : Logs immuables de tous les accès

### Conservation des preuves

En cas de litige, RT conserve :

- L'e-CMR original avec signatures
- Toutes les versions successives (si modifications)
- Les photos (résolution originale)
- Les horodatages certifiés (serveur de temps RFC 3161)
- Les géolocalisations GPS
- Les logs d'accès et de modification
- Les communications liées (emails, SMS)

**Durée** : 10 ans minimum (conformité Code de commerce)

### Téléchargement groupé

**Fonction** : Export de plusieurs e-CMR

- **Filtres** : Date, statut, transporteur, destinataire
- **Format** : ZIP contenant PDFs + fichier Excel récapitulatif
- **Limite** : 500 e-CMR par export
- **Planification** : Export automatique mensuel/trimestriel

---

## Valeur légale et conformité

### Reconnaissance internationale

L'e-CMR RT est conforme au **Protocole additionnel à la Convention CMR** :

#### Pays signataires (reconnaissance totale)

Union Européenne (27 pays), Norvège, Suisse, Turquie, Russie, Ukraine, Biélorussie, Moldova, Iran, Mongolie...

> **Total** : 35+ pays (mise à jour régulière sur [unece.org](https://unece.org))

#### Pays en cours de ratification

Maroc, Tunisie, Algérie, Égypte, Jordanie, Arabie Saoudite...

### Équivalence avec le CMR papier

**Article 2 du Protocole e-CMR** :

> "La lettre de voiture électronique a les mêmes effets qu'une lettre de voiture établie sur papier."

Cela signifie :

- **Valeur probante** : Admissible comme preuve devant les tribunaux
- **Obligation de transport** : Lie juridiquement expéditeur, transporteur, destinataire
- **Responsabilité** : Même régime de responsabilité que le CMR papier
- **Prescription** : Mêmes délais (1 an pour les réclamations)

### Signature électronique qualifiée (eIDAS)

Le règlement **eIDAS** (Electronic IDentification, Authentication and trust Services) établit 3 niveaux de signature :

| Niveau | Sécurité | Usage | RT e-CMR |
|--------|----------|-------|----------|
| Simple | Faible | Email, formulaire web | ❌ Non utilisé |
| Avancée | Moyenne | Contrats internes | ❌ Non utilisé |
| **Qualifiée** | **Maximale** | **Contrats légaux, actes officiels** | **✓ Utilisé** |

**RT utilise exclusivement des signatures qualifiées (niveau 3)** :

- Certificat délivré par un PSC qualifié (ex: DocuSign, Adobe Sign, Yousign)
- Identité du signataire vérifiée (KYC)
- Horodatage certifié (RFC 3161)
- Non-répudiation garantie

### Conformité par pays

#### France

- **Code de commerce** : Articles L110-3 et L110-4 (valeur probante écrit électronique)
- **Ordonnance 2016-131** : Reconnaissance signature électronique qualifiée
- **RGPD** : Conformité traitement données personnelles

#### Belgique

- **Loi 2000-12-20** : Signature électronique
- **eIDAS** : Application directe du règlement européen

#### Allemagne

- **Signaturgesetz** : Loi sur la signature électronique
- **eIDAS** : Application directe

#### Suisse

- **SCSE** : Loi fédérale sur les services de certification dans le domaine de la signature électronique
- **Convention CMR** : Application du protocole e-CMR

### Audits et certifications RT

RT est audité et certifié par :

- **IRU** : Certification solution e-CMR conforme protocole
- **ISO 27001** : Sécurité de l'information
- **SOC 2 Type II** : Contrôles de sécurité audités
- **RGPD** : Conformité protection données

**Audits** : Annuels + audits surprise trimestriels

### Validité en cas de litige

En cas de litige (marchandise endommagée, retard, perte), l'e-CMR RT constitue une **preuve numérique robuste** :

#### Éléments probants

1. **Signatures qualifiées** : Non-répudiables
2. **Horodatages certifiés** : Preuve de la chronologie
3. **Géolocalisation GPS** : Preuve du lieu de signature
4. **Photos horodatées** : Preuve de l'état de la marchandise
5. **Historique immuable** : Toutes modifications tracées

#### Jurisprudence

Plusieurs décisions de justice ont **reconnu la valeur probante de l'e-CMR** :

- Tribunal de Commerce de Paris (2019) : e-CMR accepté comme preuve
- Cour d'Appel de Bruxelles (2020) : Signature électronique qualifiée = signature manuscrite
- Tribunal de Commerce de Lyon (2021) : Photos horodatées reconnues comme preuve de dommages

> **Conseil** : En cas de litige, contactez immédiatement le support RT pour obtenir le package complet de preuves (e-CMR + métadonnées + logs).

---

## Erreurs courantes et solutions

### 1. Impossible de signer (expéditeur)

**Symptôme** : Bouton "Signer" grisé ou erreur lors de la signature

**Causes possibles** :
- Champs obligatoires manquants
- Session expirée
- Certificat de signature expiré
- Navigateur non compatible

**Solutions** :
✓ Vérifier que tous les champs obligatoires sont remplis (marqués d'un astérisque rouge)
✓ Actualiser la page et vous reconnecter
✓ Vérifier la validité de votre certificat électronique (Paramètres > Sécurité)
✓ Utiliser un navigateur récent (Chrome, Firefox, Edge, Safari)
✓ Désactiver temporairement les extensions de blocage (AdBlock, etc.)

### 2. Le transporteur ne reçoit pas l'e-CMR

**Symptôme** : Le transporteur n'a pas reçu de notification après votre signature

**Causes possibles** :
- Email en spam
- Mauvaise adresse email transporteur
- Compte transporteur non activé
- Notification désactivée dans les préférences transporteur

**Solutions** :
✓ Vérifier l'adresse email du transporteur (Commandes > Détails > Transporteur)
✓ Demander au transporteur de vérifier ses spams
✓ Renvoyer la notification (Actions > Renvoyer notification)
✓ Inviter le transporteur à activer son compte RT
✓ Contacter le transporteur par téléphone pour l'informer

### 3. Signature hors ligne (app mobile)

**Symptôme** : Le conducteur a signé mais l'e-CMR n'est pas synchronisé

**Causes possibles** :
- Pas de connexion internet au moment de la signature
- App en version obsolète
- Données en attente de synchronisation

**Solutions** :
✓ Vérifier la connexion internet (4G/5G/WiFi)
✓ Ouvrir l'app mobile : la synchronisation se lance automatiquement
✓ Forcer la synchronisation (Menu > Synchroniser)
✓ Mettre à jour l'app vers la dernière version
✓ Patienter : la synchro peut prendre quelques minutes si connexion faible

> **Délai maximum** : 24h. Au-delà, contacter le support RT.

### 4. Réserves non acceptées

**Symptôme** : Vous avez déclaré des réserves mais elles sont contestées

**Causes possibles** :
- Photos insuffisantes ou floues
- Description imprécise
- Réserve déclarée trop tard (après signature)

**Solutions** :
✓ Toujours prendre **au minimum 3 photos nettes** par réserve
✓ Décrire précisément : "3 palettes endommagées sur 20" plutôt que "problème palettes"
✓ Déclarer les réserves **avant de signer** (impossible après)
✓ Annoter les photos (flèches, cercles) pour identifier le problème
✓ En cas de contestation, contacter le support RT pour arbitrage

### 5. E-CMR bloqué "En attente"

**Symptôme** : L'e-CMR reste bloqué à un statut sans évolution

**Statuts bloquants** :
- "En attente transporteur" > 48h
- "En cours de transport" > 7 jours
- "En attente destinataire" > 48h

**Solutions** :
✓ Relancer le transporteur/destinataire (bouton "Relancer")
✓ Vérifier que les notifications email ne sont pas bloquées
✓ Contacter directement l'acteur concerné par téléphone
✓ Si urgence, contacter le support RT pour déblocage manuel
✓ En dernier recours : annuler et créer un nouveau e-CMR

### 6. Erreur "Signature non qualifiée"

**Symptôme** : Message d'erreur lors de la tentative de signature

**Cause** : Votre certificat de signature électronique n'est pas qualifié au sens eIDAS

**Solutions** :
✓ Vérifier votre profil : Paramètres > Sécurité > Certificat de signature
✓ Si certificat expiré ou absent, en demander un nouveau (bouton "Obtenir un certificat")
✓ Suivre la procédure d'identification (KYC) du prestataire de confiance
✓ Le certificat est valable 3 ans
✓ Délai d'obtention : 24-48h (vérification d'identité)

### 7. PDF non conforme

**Symptôme** : Le PDF exporté ne s'ouvre pas ou affiche des erreurs

**Causes possibles** :
- Lecteur PDF obsolète
- Fichier corrompu lors du téléchargement
- Signature électronique non reconnue par le lecteur

**Solutions** :
✓ Utiliser Adobe Acrobat Reader (version récente)
✓ Re-télécharger le PDF depuis RT (Actions > Télécharger PDF)
✓ Vérifier l'intégrité du fichier (taille > 0 ko)
✓ Scanner le QR code pour vérifier l'authenticité
✓ Si problème persiste, contacter le support RT

### 8. Modification après signature

**Symptôme** : Vous devez modifier un e-CMR déjà signé

**Solution** : **Il est impossible de modifier un e-CMR signé** (intégrité du document)

**Alternatives** :
✓ Si signé uniquement par expéditeur : annuler et recréer
✓ Si signé par transporteur : créer un **avenant** (avec accord de toutes les parties)
✓ L'avenant est horodaté et lié à l'e-CMR original
✓ Historique complet conservé (traçabilité)

---

## Interopérabilité

### Échange avec autres plateformes

L'e-CMR RT est **interopérable** avec toutes les plateformes certifiées IRU :

#### Plateformes compatibles

- **Transporeon** (Allemagne)
- **Tive** (USA)
- **CargoAi** (France)
- **FourKites** (USA)
- **project44** (USA)
- **Greenroad** (Israël)
- **Sixfold** (Autriche)

### Format d'échange : XML IRU

Le protocole IRU définit un **schéma XML standardisé** :

```xml
<eCMR version="3.0" xmlns="urn:iru:ecmr:v3">
  <ConsignmentNoteNumber>RT-2025-1234567</ConsignmentNoteNumber>
  <DateOfIssue>2025-11-18T10:30:00Z</DateOfIssue>
  <Shipper>...</Shipper>
  <Carrier>...</Carrier>
  <Consignee>...</Consignee>
  <Goods>...</Goods>
  <Signatures>...</Signatures>
</eCMR>
```

### Import d'e-CMR externes

Vous pouvez **importer des e-CMR** créés sur d'autres plateformes :

**Chemin** : Commandes > Importer e-CMR > Fichier XML IRU

**Processus** :
1. Télécharger le fichier XML depuis la plateforme source
2. Importer dans RT (glisser-déposer ou sélection)
3. Validation du schéma XML
4. Mapping automatique des données
5. Vérification des signatures électroniques
6. Création de l'e-CMR dans RT

> **Limite** : Les signatures électroniques externes sont conservées mais non modifiables (lecture seule).

### Export vers ERP/TMS

Intégration avec vos systèmes via **API REST** :

**Endpoint** : `https://api.rt-tech.io/v1/ecmr`

**Authentification** : OAuth 2.0 + API Key

**Méthodes** :
- `GET /ecmr/{id}` : Récupérer un e-CMR
- `POST /ecmr` : Créer un e-CMR
- `PUT /ecmr/{id}/sign` : Signer un e-CMR
- `GET /ecmr/export` : Export groupé (JSON, XML, CSV)

**Documentation** : [https://docs.rt-tech.io/api/ecmr](https://docs.rt-tech.io/api/ecmr)

### Blockchain (optionnel)

RT propose en option l'**ancrage blockchain** :

- **Technologie** : Ethereum (réseau public)
- **Usage** : Hash de l'e-CMR enregistré on-chain
- **Bénéfice** : Preuve immuable et publique de l'existence du document
- **Coût** : +0,50€ par e-CMR

**Activation** : Paramètres > E-CMR > Activer blockchain

---

## Support

### Documentation

- **Centre d'aide** : [https://help.rt-tech.io/ecmr](https://help.rt-tech.io/ecmr)
- **FAQ E-CMR** : [https://help.rt-tech.io/ecmr/faq](https://help.rt-tech.io/ecmr/faq)
- **Vidéos tutoriels** : [https://help.rt-tech.io/ecmr/videos](https://help.rt-tech.io/ecmr/videos)
- **API Documentation** : [https://docs.rt-tech.io/api/ecmr](https://docs.rt-tech.io/api/ecmr)

### Contact support

#### Chat en ligne

**Disponible** : Lun-Ven 8h-20h, Sam 9h-18h
**Accès** : Bouton en bas à droite de l'interface
**Langue** : FR, EN, DE
**Délai de réponse** : < 2 minutes

#### Email

**Adresse** : [support-ecmr@rt-tech.io](mailto:support-ecmr@rt-tech.io)
**Délai de réponse** : < 4 heures (jours ouvrés)
**Joindre** : Captures d'écran, numéro d'e-CMR concerné

#### Téléphone

**Numéro** : +33 (0)1 XX XX XX XX
**Disponible** : Lun-Ven 9h-18h
**Langue** : FR, EN
**Pour** : Urgences et blocages critiques

#### Support premium (option)

**Engagement** : Réponse < 1 heure, 24/7/365
**Téléphone dédié** : Ligne directe
**Account Manager** : Contact dédié
**Coût** : Sur devis

### Formation

RT propose des **sessions de formation e-CMR** :

#### Formation initiale (gratuite)

- **Durée** : 1h30
- **Format** : Webinaire en ligne
- **Fréquence** : Tous les mardis 10h-11h30
- **Inscription** : [https://rt-tech.io/training/ecmr](https://rt-tech.io/training/ecmr)
- **Programme** :
  - Présentation du protocole e-CMR
  - Démonstration complète du workflow
  - Création et signature d'un e-CMR (exercice pratique)
  - Questions/réponses

#### Formation avancée (payante)

- **Durée** : 1 journée (7h)
- **Format** : Présentiel ou visio
- **Public** : Responsables transport, DSI, juristes
- **Programme** :
  - Conformité légale approfondie
  - Intégration API
  - Gestion des litiges
  - Optimisation des workflows
  - Interopérabilité
- **Tarif** : 800€ HT/personne (dégressif si groupe)

#### Formation sur site

- **Durée** : Sur mesure (demi-journée à 2 jours)
- **Format** : Dans vos locaux
- **Public** : Vos équipes (logistique, transport, réception)
- **Programme** : Adapté à vos besoins spécifiques
- **Tarif** : Sur devis (à partir de 1500€ HT/jour)

### Communauté

Rejoignez la **communauté RT E-CMR** :

- **Forum** : [https://community.rt-tech.io/ecmr](https://community.rt-tech.io/ecmr)
- **Slack** : [https://rt-users.slack.com](https://rt-users.slack.com) (canal #ecmr)
- **LinkedIn** : Groupe "RT E-CMR Users"
- **Meetups** : Trimestriels (Paris, Bruxelles, Luxembourg)

### Ressources légales

- **Texte Convention CMR** : [https://unece.org/cmr](https://unece.org/cmr)
- **Protocole e-CMR** : [https://unece.org/ecmr](https://unece.org/ecmr)
- **Règlement eIDAS** : [https://eur-lex.europa.eu/eli/reg/2014/910](https://eur-lex.europa.eu/eli/reg/2014/910)
- **Guide IRU** : [https://iru.org/ecmr](https://iru.org/ecmr)

---

## Conclusion

L'**e-CMR RT** est une solution **complète, sécurisée et conforme** pour dématérialiser vos lettres de voiture internationales.

### Points clés à retenir

✓ **Valeur légale** : Équivalent strictement au CMR papier (Protocole IRU)
✓ **Sécurité** : Signatures électroniques qualifiées eIDAS niveau 3
✓ **Simplicité** : Workflow en 3 étapes (expéditeur > transporteur > destinataire)
✓ **Traçabilité** : Horodatage, géolocalisation, photos
✓ **Conformité** : Archivage automatique 10 ans
✓ **Interopérabilité** : Compatible toutes plateformes certifiées IRU
✓ **Support** : Assistance 6j/7, documentation complète

### Prochaines étapes

1. **Testez** : Créez votre premier e-CMR (mode démo disponible)
2. **Formez** : Inscrivez-vous au webinaire gratuit
3. **Déployez** : Invitez vos transporteurs et destinataires
4. **Optimisez** : Intégrez avec votre ERP/TMS

**Besoin d'aide ?** Contactez notre équipe support : [support-ecmr@rt-tech.io](mailto:support-ecmr@rt-tech.io)

---

**Document généré le** : 18 novembre 2025
**Version** : 1.0
**Prochaine révision** : Février 2026

© 2025 RT Technologie - Tous droits réservés
