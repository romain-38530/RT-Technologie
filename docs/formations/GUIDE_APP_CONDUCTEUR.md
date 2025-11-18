# Guide de Formation - Application Mobile Conducteur

## 🎯 Objectif de l'application

L'Application Mobile Conducteur simplifie radicalement le quotidien des chauffeurs routiers en centralisant toutes les fonctionnalités essentielles : GPS tracking automatique, signatures électroniques, scan de documents, et communication en temps réel avec le dispatcher.

---

## 📱 Plateformes supportées

- **PWA** (Progressive Web App) : Fonctionne sur tous les navigateurs (Chrome, Safari, Firefox)
- **Android** : Application native (Google Play Store)
- **iOS** : Application native (App Store)

---

## 👤 Deux modes d'authentification

### Mode 1 : Employé (Login classique)
Pour les chauffeurs salariés :
1. Ouvrez l'app
2. Entrez votre **email** et **mot de passe**
3. Cliquez sur **"Se connecter"**

### Mode 2 : Sous-traitant (QR Code)
Pour les chauffeurs externes sans compte :
1. Ouvrez l'app
2. Cliquez sur **"Je suis sous-traitant"**
3. **Scannez le QR code** reçu par email ou SMS
4. Accès immédiat à votre mission

---

## 🚀 Démarrage rapide - Premier lancement

### Étape 1 : Installation

#### PWA (Web)
1. Ouvrez https://driver.rt-technologie.com dans votre navigateur
2. Cliquez sur le menu (⋮) > **"Installer l'application"**
3. L'icône apparaît sur votre écran d'accueil

#### Android
1. Ouvrez le Google Play Store
2. Cherchez **"RT Conducteur"**
3. Installez l'application
4. Autorisez les permissions demandées :
   - 📍 **Localisation** : OBLIGATOIRE (tracking GPS)
   - 📷 **Appareil photo** : Pour scan documents et signatures
   - 🔔 **Notifications** : Alertes missions

#### iOS
1. Ouvrez l'App Store
2. Cherchez **"RT Conducteur"**
3. Installez
4. Autorisez les permissions (mêmes que Android)

### Étape 2 : Première connexion
1. Entrez vos identifiants reçus par email
2. L'app vous demande d'autoriser la localisation :
   - **"Toujours autoriser"** (recommandé) : Tracking même app fermée
   - **"Pendant l'utilisation"** : Tracking uniquement app ouverte
3. Vous arrivez sur le **Dashboard**

---

## 📊 Interface : Dashboard

### Vue d'ensemble
Le dashboard affiche :
- **Mission en cours** : Carte avec votre destination actuelle
- **Statut** : Code couleur (voir ci-dessous)
- **ETA** : Heure d'arrivée estimée
- **Distance restante** : En kilomètres
- **Missions passées** : Historique des 10 dernières

### Code couleur des statuts
- 🟡 **PENDING** (Jaune) : Mission assignée, pas encore démarrée
- 🔵 **IN_PROGRESS** (Bleu) : En route vers le chargement
- 🟢 **LOADING** (Vert) : Au point de chargement
- 🟠 **LOADED** (Orange) : Marchandise chargée, en route vers livraison
- 🟣 **DELIVERING** (Violet) : Au point de livraison
- ✅ **COMPLETED** (Vert foncé) : Mission terminée

---

## 🎬 Workflow complet d'une mission

### 1. Démarrer la mission

#### Recevoir l'assignation
- Notification push : **"Nouvelle mission assignée !"**
- Ouvrez l'app > **"Mission en attente"**
- Consultez les détails :
  - Point de chargement : Adresse, contact, horaires
  - Point de livraison : Adresse, contact, horaires
  - Marchandise : Type, poids, volume
  - Instructions spéciales : Notes du dispatcher

#### Lancer le tracking
1. Cliquez sur **"Démarrer la mission"**
2. Le GPS s'active automatiquement (point orange toutes les 15 secondes)
3. Statut passe à **IN_PROGRESS** (bleu)
4. Navigation vers le point de chargement

### 2. Arrivée au chargement (Géofencing automatique)

#### Détection automatique
Lorsque vous entrez dans un rayon de **200 mètres** du point de chargement :
- 🔔 Notification : **"Vous êtes arrivé au point de chargement"**
- Statut passe automatiquement à **LOADING** (vert)
- Le dispatcher est notifié en temps réel

#### Si la détection ne fonctionne pas
Vérifiez :
- ✓ GPS activé et signal disponible (sortez du bâtiment si besoin)
- ✓ App ouverte en arrière-plan
- ✓ Autorisation de localisation accordée

Sinon, **changement manuel** :
1. Menu (☰) > **"Changer statut"**
2. Sélectionnez **"LOADING"**
3. Confirmez

### 3. Opérations au chargement

#### Scanner le bon de chargement
1. Cliquez sur **"📷 Scanner document"**
2. Positionnez le document dans le cadre
3. L'app détecte automatiquement les bordures
4. Appuyez sur le bouton capture
5. **Validation** : Vérifiez que le texte est lisible
6. Sauvegardez

#### Prendre des photos de la marchandise
1. Cliquez sur **"📸 Ajouter photo"**
2. Prenez plusieurs angles :
   - Vue d'ensemble de la palette/colis
   - Gros plan sur l'étiquette
   - Emballage (pour preuve d'état)
3. Max 10 photos par étape
4. Sauvegarde automatique

#### Signature de chargement
1. Cliquez sur **"✍️ Faire signer"**
2. **Mode tactile** (par défaut) :
   - Tendez le téléphone au responsable d'entrepôt
   - Il signe avec le doigt
   - Bouton **"Effacer"** si erreur
   - Bouton **"Valider"** quand OK
3. **Mode contactless** (COVID) :
   - Basculez sur l'onglet **"QR Code"**
   - Le responsable scanne le QR avec son téléphone
   - Il signe sur son propre écran
   - Signature transmise automatiquement à votre app

#### Finaliser le chargement
1. Vérifiez que tout est enregistré :
   - ✓ Bon de chargement scanné
   - ✓ Photos de la marchandise
   - ✓ Signature obtenue
2. Cliquez sur **"✅ Chargement terminé"**
3. Statut passe à **LOADED** (orange)
4. Navigation vers le point de livraison

### 4. Trajet vers la livraison

#### Tracking continu
- GPS enregistre votre position toutes les 15 secondes
- Le dispatcher voit votre position en temps réel sur sa carte
- ETA recalculé automatiquement (prise en compte du trafic)

#### Mode offline
Si vous perdez la connexion internet :
- 📡 Icône "hors ligne" apparaît
- Les positions GPS sont **enregistrées localement** (SQLite)
- Dès que la connexion revient, synchronisation automatique
- Rien n'est perdu !

#### Pause ou détour
Si vous devez faire une pause (essence, repos...) :
1. Cliquez sur **"⏸️ Pause"**
2. Sélectionnez la raison :
   - Ravitaillement
   - Repos réglementaire
   - Problème technique
   - Autre (précisez)
3. Le tracking continue (sécurité)
4. Cliquez sur **"▶️ Reprendre"** quand vous repartez

### 5. Arrivée à la livraison

#### Détection automatique (géofencing)
Rayon de 200 mètres → Statut passe à **DELIVERING** (violet)

#### Scanner le bon de livraison
Même processus que le chargement :
1. **"📷 Scanner document"**
2. Capture automatique ou manuelle
3. Vérification lisibilité
4. Sauvegarde

#### Photos après livraison
- Vue de la zone de dépose
- Marchandise déchargée
- Si problème : photos des dommages

#### Signature de livraison
1. **"✍️ Faire signer"**
2. Mode tactile ou QR code contactless
3. Le destinataire signe
4. **Très important** : Cette signature confirme la bonne réception

#### Signaler une anomalie (si besoin)
Si problème à la livraison :
1. Cliquez sur **"⚠️ Signaler un problème"**
2. Sélectionnez le type :
   - Refus de réception
   - Marchandise endommagée
   - Quantité incorrecte
   - Destinataire absent
   - Adresse incorrecte
3. Ajoutez des photos de preuve
4. Commentaire détaillé
5. Le dispatcher est notifié immédiatement

#### Finaliser la mission
1. Vérifiez :
   - ✓ Bon de livraison scanné
   - ✓ Photos prises
   - ✓ Signature obtenue
   - ✓ Aucune anomalie (ou signalée)
2. Cliquez sur **"✅ Mission terminée"**
3. Statut passe à **COMPLETED**
4. 🎉 Félicitations ! Vous passez à la suivante

---

## 🗺️ Fonctionnalités GPS

### Tracking automatique

#### Fréquence
- **Toutes les 15 secondes** quand vous êtes en mission
- **Pause automatique** si vitesse = 0 pendant > 5 minutes (économie batterie)
- **Reprise automatique** dès que vous bougez

#### Géofencing intelligent
- **Rayon de détection** : 200 mètres autour des points clés
- **Actions automatiques** :
  - Changement de statut
  - Notification conducteur
  - Notification dispatcher
  - Enregistrement timestamp exact

### Économie de batterie

#### Optimisations automatiques
- Utilisation du GPS «Low Power» quand précision < 50m suffisante
- Réduction fréquence de tracking si aucun changement de position
- Arrêt du tracking si mission terminée

#### Conseils
- Branchez le téléphone sur le chargeur du camion
- Activez le mode «Économie d'énergie» système si < 20% batterie
- L'app vous alertera si batterie < 15%

---

## ✍️ Signatures électroniques

### Mode tactile (par défaut)

#### Avantages
- ✅ Rapide et simple
- ✅ Pas besoin de connexion internet
- ✅ Familier pour la plupart des gens

#### Best practices
1. **Nettoyez l'écran** avant (traces de doigts = signature illisible)
2. **Orientation paysage** : Plus de surface pour signer
3. **Zoom** : Agrandissez la zone si nécessaire (pinch)
4. **Relecture** : Demandez au signataire de vérifier avant de valider
5. **Conservation** : La signature est convertie en image PNG haute résolution

### Mode contactless (QR Code)

#### Quand l'utiliser ?
- Règles sanitaires strictes
- Signataire refuse de toucher votre téléphone
- Distance de sécurité à respecter

#### Fonctionnement
1. Vous générez un QR code unique
2. Le signataire scanne avec son smartphone
3. Une page web s'ouvre sur SON téléphone
4. Il signe avec SON doigt sur SON écran
5. La signature est transmise instantanément à votre app via API
6. **Timeout** : 5 minutes (sécurité)

#### Prérequis
- Le signataire doit avoir un smartphone
- Il doit avoir une connexion internet (3G/4G/WiFi)
- Vous devez avoir internet aussi (pour recevoir la signature)

---

## 📄 Scan de documents

### Types de documents
- 📋 **Bons de chargement** (BL)
- 📦 **Bons de livraison** (BDL)
- 📝 **CMR** (Convention de Marchandises par Route)
- 🚛 **Lettres de voiture**
- 📄 **Factures**
- 🆔 **Pièces d'identité** (contrôles)
- ⚠️ **Constats d'anomalie**

### Processus de scan

#### 1. Positionnement
- Posez le document sur une surface plane et bien éclairée
- Évitez les ombres portées
- Tenez le téléphone parallèle au document (pas en diagonale)

#### 2. Cadrage
- L'app détecte automatiquement les bordures du document
- Cadre vert = détection OK
- Cadre rouge = trop de biais ou mauvais éclairage
- Ajustez jusqu'à obtenir le vert

#### 3. Capture
- **Mode auto** : Capture automatique dès que cadre vert stable pendant 2 secondes
- **Mode manuel** : Appuyez sur le bouton rond

#### 4. Amélioration automatique
L'app applique :
- **Recadrage** : Suppression des bords inutiles
- **Perspective** : Correction de l'angle
- **Contraste** : Augmentation pour meilleure lisibilité
- **Netteté** : Filtre anti-flou
- **Noir & blanc** : Conversion pour réduire le poids

#### 5. Validation
- Vérifiez que le texte est lisible
- Si flou : bouton **"Refaire"**
- Si OK : bouton **"✓ Valider"**

### OCR (Reconnaissance de texte) - Futur
Prochainement, l'app extraira automatiquement :
- N° de bon de commande
- Date de chargement/livraison
- Nom du destinataire
- Quantités
- Références produits

---

## 🔔 Notifications

### Types de notifications

#### Missions
- 🆕 **Nouvelle mission assignée**
- ⏰ **Mission à démarrer dans 30 minutes** (rappel)
- 🎯 **Approche du point de chargement** (5 km)
- 🎯 **Approche du point de livraison** (5 km)
- ⚠️ **Retard détecté** (ETA dépassé)

#### Système
- 🔋 **Batterie faible** (< 15%)
- 📡 **Connexion perdue** (mode offline activé)
- ✅ **Synchronisation réussie** (après offline)
- 🔄 **Mise à jour disponible**

### Paramètres de notification
Menu > **Paramètres** > **Notifications**
- Activer/désactiver par type
- Son personnalisé
- Vibration
- Badge sur l'icône

---

## 📱 Mode offline

### Comment ça marche ?

#### Synchronisation intelligente
1. **En ligne** : Toutes les données sont envoyées immédiatement au serveur
2. **Hors ligne** : Les données sont stockées localement (SQLite)
3. **Retour en ligne** : Synchronisation automatique en arrière-plan

#### Données synchronisées
- ✅ Positions GPS (toutes les 15s)
- ✅ Changements de statut
- ✅ Documents scannés (compressés)
- ✅ Photos (qualité réduite si > 2 MB)
- ✅ Signatures
- ✅ Anomalies signalées

#### Limitations en mode offline
- ❌ Impossible de recevoir de nouvelles missions
- ❌ Pas de mise à jour de l'ETA (calcul trafic)
- ❌ Pas de notifications push
- ⚠️ Signatures QR code indisponibles (nécessitent internet)

#### Gestion du stockage
- L'app conserve max **500 MB** de données offline
- Au-delà, les plus anciennes sont supprimées après sync
- Vérifiez l'espace disponible : Menu > **Paramètres** > **Stockage**

---

## ⚙️ Paramètres et préférences

### Profil conducteur
- Photo de profil
- Nom, prénom
- N° de téléphone
- Email
- N° permis de conduire
- Type de véhicule habituel

### Préférences GPS
- **Fréquence de tracking** : 10s / 15s / 30s (défaut: 15s)
- **Rayon de géofencing** : 100m / 200m / 500m (défaut: 200m)
- **Mode d'économie batterie** : Auto / Toujours / Jamais

### Préférences documents
- **Qualité de scan** : Haute / Moyenne / Faible (défaut: Moyenne)
- **Format de sortie** : PDF / JPEG (défaut: PDF)
- **Compression photos** : Oui / Non (défaut: Oui si > 2MB)

### Langue
- 🇫🇷 Français
- 🇬🇧 English
- 🇪🇸 Español
- 🇩🇪 Deutsch
- 🇮🇹 Italiano

---

## 🆘 Problèmes courants et solutions

### "GPS ne fonctionne pas"

#### Symptômes
- Position reste fixe alors que vous bougez
- Message "Localisation indisponible"

#### Solutions
1. **Vérifiez les autorisations** :
   - Android : Paramètres > Apps > RT Conducteur > Autorisations > Localisation > **"Toujours"**
   - iOS : Réglages > Confidentialité > Localisation > RT Conducteur > **"Toujours"**
2. **Activez le GPS** dans les paramètres système
3. **Sortez à l'extérieur** (bâtiments métalliques bloquent le signal)
4. **Redémarrez l'app**
5. **Redémarrez le téléphone** (dernier recours)

### "Scan de document flou"

#### Causes
- Mouvement pendant la capture
- Éclairage insuffisant
- Document froissé ou sale

#### Solutions
1. **Posez le document à plat** sur une table
2. **Ajoutez de la lumière** (lampe, fenêtre)
3. **Stabilisez votre main** ou utilisez un support
4. **Nettoyez l'objectif** de l'appareil photo
5. Utilisez le **mode manuel** au lieu de l'auto

### "Signature ne s'enregistre pas"

#### Causes
- Ligne trop fine (écran sale ou stylet inapproprié)
- Bug tactile de l'écran

#### Solutions
1. **Nettoyez l'écran**
2. **Réessayez avec le doigt** (pas de stylet)
3. **Appuyez fermement** lors de la signature
4. Si problème persiste : Utilisez le **mode QR code** à la place

### "Mode offline ne se désactive pas"

#### Causes
- Connexion instable (bascule entre online/offline)
- Mode avion resté actif

#### Solutions
1. **Vérifiez le mode avion** : Désactivez-le
2. **Basculez WiFi/4G** : Testez les deux
3. **Ouvrez le navigateur** : Vérifiez que vous pouvez charger un site web
4. **Force close** : Fermez complètement l'app et relancez

### "Batterie se vide trop vite"

#### Optimisations
1. **Branchez sur le chargeur** du camion (obligatoire pour missions longues)
2. **Réduisez la luminosité** de l'écran
3. **Fermez les apps en arrière-plan** inutilisées
4. **Activez le mode économie** : Paramètres > Préférences GPS > Économie batterie = Auto
5. **Changez la fréquence** : 30s au lieu de 15s (impact minimal sur le tracking)

---

## 📊 Statistiques et performances

### Tableau de bord personnel
Accessible via **Menu** > **"Mes Statistiques"**

#### Cette semaine
- 🚚 Missions complétées
- ⏱️ Temps de conduite total
- 🛣️ Kilomètres parcourus
- ⭐ Note moyenne (satisfaction destinataires)
- 🎯 Taux de ponctualité (livraisons à l'heure)

#### Ce mois
Mêmes métriques + comparaison avec le mois précédent (↑↓%)

#### Objectifs
- Badges débloqués (50 missions, 1000 km, 100% ponctuel...)
- Classement dans l'équipe (gamification)

---

## 🎓 Conseils de pro

### Productivité
1. **Préparez à l'avance** : Consultez les missions de demain le soir
2. **Scannez immédiatement** : Ne reportez pas les scans (risque de perte du document)
3. **Vérifiez la marchandise** : Comptez les palettes/colis avant de partir
4. **Communiquez** : Utilisez la messagerie intégrée si problème (futur)

### Sécurité
1. **Ne manipulez pas l'app en conduisant** : Utilisez un support mains-libres
2. **Arrêtez-vous** pour scanner ou signer
3. **Gardez une copie** : Prenez une photo perso du BL si doute

### Efficacité
1. **Gérez les pics de batterie** : Rechargez pendant les pauses déjeuner
2. **Utilisez le WiFi** quand possible (synchronisation plus rapide)
3. **Nettoyez le cache** : 1 fois/semaine (Paramètres > Stockage > Vider le cache)

---

## 📞 Support et assistance

### Ressources
- 📖 **Documentation** : https://docs.rt-technologie.com/driver
- 🎥 **Vidéos tutorielles** : https://www.youtube.com/rt-technologie
- ❓ **FAQ** : https://faq.rt-technologie.com/driver

### Contact
- 📧 **Email** : driver-support@rt-technologie.com
- ☎️ **Téléphone** : +33 1 XX XX XX XX (24/7 pour urgences)
- 💬 **Chat** : Bouton en bas à droite de l'app (9h-18h en semaine)

### Signaler un bug
1. Menu > **"Signaler un problème"**
2. Décrivez le bug précisément :
   - Que faisiez-vous ?
   - Qu'est-ce qui s'est passé ?
   - Qu'attendiez-vous ?
3. Joignez une capture d'écran si possible
4. L'équipe tech vous répondra sous 24h

---

**Version du guide** : 1.0.0
**Dernière mise à jour** : Janvier 2025
**Durée de lecture** : 30 minutes
**Niveau** : Débutant
**Plateformes** : PWA, Android, iOS
