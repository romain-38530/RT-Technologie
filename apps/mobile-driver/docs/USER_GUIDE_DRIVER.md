# Guide Utilisateur - RT Driver

## Bienvenue

RT Driver est votre compagnon quotidien pour gérer vos missions de transport de manière simple et efficace. Cette application vous permet de suivre vos missions, signer électroniquement, scanner des documents et bien plus encore.

## Deux modes d'utilisation

### Mode Conducteur Salarié

Vous avez un compte personnel avec identifiant et mot de passe.

**Avantages :**
- Accès à l'historique complet de vos missions
- Statistiques de performance
- Paramètres personnalisés
- Documents archivés

### Mode Conducteur Sous-Traitant

Vous accédez directement avec le QR code ou le code mission fourni.

**Avantages :**
- Pas de compte à créer
- Accès instantané
- Toutes les fonctionnalités essentielles disponibles

## Démarrage

### Pour les salariés

1. Ouvrez l'application RT Driver
2. Entrez votre email et mot de passe
3. Appuyez sur "Se connecter"
4. Vous arrivez sur votre tableau de bord

### Pour les sous-traitants

1. Ouvrez l'application RT Driver
2. Appuyez sur "Scanner un code QR mission"
3. Scannez le QR code fourni par le transporteur
   - OU entrez le code manuellement
4. Confirmez vos informations (nom, téléphone, immatriculation)
5. Appuyez sur "Démarrer la mission"

## Fonctionnalités principales

### 1. Tableau de bord

**Ce que vous voyez :**
- Votre mission en cours (si vous en avez une)
- Vos 5 dernières missions (salariés uniquement)
- Bouton pour scanner une nouvelle mission

**Actions disponibles :**
- Cliquer sur une mission pour voir les détails
- Scanner une nouvelle mission (QR code)
- Se déconnecter

### 2. Suivi de mission (Tracking GPS)

C'est l'écran principal pendant votre mission.

**Informations affichées :**

```
┌─────────────────────────────┐
│ Mission ABC-123            │
│ 🟢 En route vers chargement│
├─────────────────────────────┤
│ 📍 GPS ACTIF               │
├─────────────────────────────┤
│ Destination                │
│ 🅰 Entrepôt Central        │
│ 123 Rue de la Logistique  │
│ 75001 Paris                │
├─────────────────────────────┤
│ Distance: 12.5 km          │
│ Durée: 18 min              │
│ Arrivée: 14:35             │
├─────────────────────────────┤
│ [Ouvrir navigation]        │
│ [Étape suivante]           │
│ [Signature]                │
│ [Documents]                │
└─────────────────────────────┘
```

**Fonctionnalités :**

1. **GPS automatique** : Votre position est envoyée toutes les 15 secondes
2. **ETA dynamique** : L'heure d'arrivée se met à jour en temps réel
3. **Détection automatique** : L'application détecte quand vous arrivez (rayon 200m)
4. **Navigation** : Choisissez Google Maps ou Waze en un clic

**Statuts de la mission :**

| Statut | Couleur | Signification |
|--------|---------|---------------|
| En route vers chargement | 🔵 Bleu | Vous allez chercher la marchandise |
| Arrivé au chargement | 🟠 Orange | Vous êtes sur place pour charger |
| Chargé | 🟢 Vert | Marchandise chargée, prêt à partir |
| En route vers livraison | 🔵 Bleu | Vous transportez la marchandise |
| Arrivé à la livraison | 🟠 Orange | Vous êtes chez le destinataire |
| Livré | 🟢 Vert | Mission terminée |

### 3. Signatures électroniques

#### Signature au point de chargement

**Quand ?** Après avoir chargé la marchandise

**Comment ?**

1. Sur l'écran de suivi, appuyez sur "Signature chargement"
2. Entrez le nom du signataire (responsable quai)
3. Ajoutez des remarques si nécessaire
4. Demandez au responsable de signer dans la zone
5. Appuyez sur "Valider"

La signature est automatiquement :
- Horodatée
- Géolocalisée
- Envoyée au serveur
- Intégrée au CMR

#### Signature à la livraison

Deux méthodes disponibles :

**Méthode 1 : Signature directe**
1. Appuyez sur "Signature livraison"
2. Entrez le nom du destinataire
3. Ajoutez des remarques ou réserves
4. Faites signer le destinataire
5. Validez

**Méthode 2 : QR Code (sans contact)**
1. Appuyez sur "Signature livraison"
2. Appuyez sur "Signature par QR Code"
3. Présentez le QR code au destinataire
4. Le destinataire scanne avec son smartphone
5. Il signe sur son propre appareil
6. La signature remonte automatiquement

### 4. Gestion des documents

**Types de documents supportés :**
- 📄 Bon de livraison (BL)
- 📄 CMR (lettre de transport)
- 🛂 Documents douaniers
- 📸 Photos diverses

**Comment ajouter un document :**

1. Sur l'écran de suivi, appuyez sur "Documents"
2. Choisissez le type de document
3. L'appareil photo s'ouvre automatiquement
4. Prenez la photo
5. Vérifiez que c'est lisible
6. Appuyez sur "Valider"

**Conseils pour de bonnes photos :**
- Bon éclairage
- Document à plat
- Cadre bien le document
- Évitez les reflets

**Déclarer des réserves :**

Si vous constatez un problème (palette abîmée, colis manquant, etc.) :

1. Allez dans "Documents"
2. Sélectionnez "Photo"
3. Photographiez le problème
4. Dans "Signature livraison", indiquez les réserves dans la zone remarques
5. Le destinataire signera avec les réserves

### 5. Mode hors ligne

**Pas de réseau ? Pas de problème !**

L'application continue de fonctionner même sans connexion internet :

**Ce qui fonctionne hors ligne :**
- Tracking GPS (positions stockées localement)
- Signatures électroniques
- Photos de documents
- Changements de statut

**Synchronisation automatique :**

Dès que vous retrouvez du réseau, l'application :
1. Détecte la connexion
2. Envoie toutes les données en attente
3. Vous notifie du succès de la synchronisation

**Indicateur :**
- 🟢 En ligne
- 🟠 Hors ligne (un badge orange s'affiche en haut)

### 6. Navigation vers un point

**Ouvrir le GPS :**

1. Sur l'écran de suivi, appuyez sur "Ouvrir navigation"
2. Choisissez votre application préférée :
   - Google Maps (par défaut)
   - Waze (pour éviter les bouchons)
3. L'itinéraire se lance automatiquement

**Informations utiles :**

Dans les détails de destination, vous trouvez :
- 📞 Numéros de téléphone des quais
- 📝 Instructions spéciales (code d'accès, horaires, etc.)
- 🚪 Numéro de quai pré-réservé (si applicable)
- 📸 Photos des accès (si disponibles)

## Scénario complet : Une mission de A à Z

### Étape 1 : Démarrage (8h00)

```
1. Scanner le QR code
2. Confirmer vos infos :
   - Nom : Jean Dupont
   - Téléphone : 06 12 34 56 78
   - Véhicule : AB-123-CD
3. Appuyer sur "Démarrer la mission"
```

### Étape 2 : Route vers chargement (8h05 - 9h30)

```
- L'app passe en statut "En route vers chargement" 🔵
- GPS actif, position envoyée toutes les 15s
- ETA affiché : "Arrivée prévue 9h30"
- Vous suivez la navigation
```

### Étape 3 : Arrivée au chargement (9h30)

```
- Détection automatique : "Arrivé au chargement" 🟠
- Vous présentez votre smartphone au quai
- On vous indique le numéro de quai
```

### Étape 4 : Chargement (9h30 - 10h15)

```
- Marchandise chargée
- Signature du responsable quai :
  * Nom : Marie Martin
  * Signature tactile
  * Validation
- Vous appuyez sur "Marquer comme chargé"
- Statut : "Chargé" 🟢
```

### Étape 5 : Route vers livraison (10h15 - 13h00)

```
- Statut "En route vers livraison" 🔵
- Pause déjeuner 12h-12h30 (GPS continue)
- ETA ajusté en temps réel
```

### Étape 6 : Arrivée livraison (13h00)

```
- Détection automatique : "Arrivé livraison" 🟠
- Vous présentez le QR code au destinataire
- Il scanne et signe sur son smartphone
- OU vous faites signer directement
```

### Étape 7 : Livraison terminée (13h15)

```
- Marchandise déchargée
- Photos des documents BL
- Appui sur "Marquer comme livré"
- Statut : "Livré" 🟢
- Mission terminée !
```

## Problèmes courants et solutions

### Le GPS ne fonctionne pas

**Solutions :**
1. Vérifiez que la localisation est activée sur votre téléphone
2. Autorisez l'accès à la localisation pour RT Driver
3. Sortez à l'extérieur si vous êtes dans un bâtiment
4. Redémarrez l'application

### Je n'ai pas de réseau

**Pas de panique :**
- L'app fonctionne hors ligne
- Continuez normalement vos opérations
- Les données se synchroniseront automatiquement au retour du réseau
- Un badge orange vous indique que vous êtes hors ligne

### La photo est floue

**Conseils :**
1. Nettoyez l'objectif de votre caméra
2. Assurez-vous d'avoir assez de lumière
3. Posez le document à plat
4. Attendez que l'appareil fasse le focus
5. Retakez la photo si besoin

### J'ai scanné le mauvais QR code

**Solution :**
- Contactez immédiatement le transporteur
- Ne démarrez pas la mission
- Scannez le bon QR code

### La signature ne marche pas

**Vérifications :**
1. Assurez-vous que l'écran est propre
2. Utilisez votre doigt (pas de gants épais)
3. Signez lentement et clairement
4. Utilisez le bouton "Effacer" pour recommencer

### Je ne reçois pas de notifications

**Solutions :**
1. Vérifiez les paramètres de notifications de votre téléphone
2. Autorisez les notifications pour RT Driver
3. Désactivez le mode "Ne pas déranger"

## Astuces et bonnes pratiques

### Pour économiser la batterie

1. **Réduisez la luminosité** de l'écran
2. **Utilisez un chargeur voiture** pendant les longs trajets
3. **Fermez les autres apps** gourmandes en batterie
4. **Activez le mode économie d'énergie** si besoin

### Pour des photos de qualité

1. **Lumière naturelle** si possible
2. **Document à plat** sur une surface sombre
3. **Cadrez serré** pour capturer tout le document
4. **Évitez les ombres** de votre main ou téléphone
5. **Vérifiez la lisibilité** avant de valider

### Pour des signatures valides

1. **Écran propre** = signature claire
2. **Demandez une signature lisible** au signataire
3. **Ajoutez le nom** du signataire
4. **Notez les réserves** immédiatement si problème
5. **Photographiez les dommages** avant signature

### Pour une meilleure expérience

1. **Gardez l'app à jour** (dernière version)
2. **Videz le cache** si l'app ralentit
3. **Synchronisez régulièrement** quand vous avez du réseau
4. **Consultez l'historique** pour vos stats

## Support et aide

### Besoin d'aide ?

**Pendant une mission :**
- Contactez le transporteur (numéro dans les détails mission)
- Utilisez le chat intégré (si disponible)

**Problème technique :**
- Email : support@rt-technologie.fr
- Téléphone : +33 1 23 45 67 89
- Horaires : 7h - 20h, 7j/7

### Signaler un bug

Si vous rencontrez un problème :
1. Faites une capture d'écran
2. Notez ce que vous faisiez
3. Envoyez à support@rt-technologie.fr

## Mises à jour

L'application se met à jour automatiquement.

**Nouvelles fonctionnalités à venir :**
- Chat temps réel avec le logisticien
- Historique détaillé avec statistiques
- Support multilingue
- Mode sombre

## Sécurité et confidentialité

**Vos données sont protégées :**
- Connexion sécurisée (HTTPS)
- Données chiffrées
- Conforme RGPD
- Localisation utilisée uniquement pendant les missions

**Bonnes pratiques :**
- Ne partagez jamais vos identifiants
- Déconnectez-vous sur appareil partagé
- Signalez tout comportement suspect

## Glossaire

| Terme | Définition |
|-------|------------|
| **BL** | Bon de Livraison |
| **CMR** | Convention Marchandise Routière (document international) |
| **ETA** | Estimated Time of Arrival (heure d'arrivée prévue) |
| **GPS** | Global Positioning System (système de localisation) |
| **QR Code** | Quick Response Code (code barre 2D) |
| **PWA** | Progressive Web App (application web avancée) |
| **Géofencing** | Détection automatique d'entrée/sortie d'une zone |
| **Offline** | Mode hors ligne, sans connexion internet |

---

**Merci d'utiliser RT Driver !** 🚛

Pour toute question, n'hésitez pas à contacter le support.
