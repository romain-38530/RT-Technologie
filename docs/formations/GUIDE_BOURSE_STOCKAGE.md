# Guide de Formation - Module Bourse de Stockage

## 🎯 Objectif du module

La Bourse de Stockage est une marketplace qui connecte les industriels ayant des besoins de stockage temporaire avec des logisticiens disposant d'espaces disponibles. L'IA optimise automatiquement le matching selon le prix, la proximité, la fiabilité et la réactivité.

---

## 👥 Pour qui ?

### Industriels
- Publier des besoins de stockage (surface, durée, contraintes)
- Recevoir et comparer des offres de logisticiens
- Négocier et accepter les meilleures propositions
- Suivre les contrats actifs

### Logisticiens Abonnés
- Voir tous les besoins publiés sur la marketplace
- Soumettre des offres compétitives
- Gérer leur catalogue de sites et capacités
- Suivre leurs contrats et KPIs

### Logisticiens Invités
- Recevoir des invitations ciblées
- Répondre à des appels d'offres privés
- Accès limité aux opportunités

### Administrateurs RT
- Modération de la marketplace
- Validation des entreprises
- Gestion des litiges
- Analytics globaux

---

## 🏭 Guide Industriel

### 1. Accéder au module
1. Connectez-vous à l'application web-industry
2. Cliquez sur **"Bourse de Stockage"** dans le menu
3. Tableau de bord avec vos statistiques

### 2. Comprendre le tableau de bord

#### KPIs affichés
- **Besoins actifs** : Nombre de demandes en cours
- **Offres reçues** : Total d'offres en attente de traitement
- **Contrats en cours** : Espaces loués actuellement
- **Économies réalisées** : Montant économisé grâce à la bourse vs tarifs standards

### 3. Publier un besoin de stockage

#### Étape 1 : Informations de base
1. Cliquez sur **"+ Publier un besoin"**
2. Remplissez :
   - **Titre** : Description courte (ex: "Stockage 500m² température contrôlée")
   - **Type de besoin** :
     - `SPOT` : Besoin ponctuel (< 3 mois)
     - `CONTRACT` : Engagement moyen terme (3-12 mois)
     - `LONG_TERM` : Besoin récurrent (> 12 mois)
   - **Date de début** : Quand voulez-vous commencer ?
   - **Date de fin** : Fin prévue (peut être ajustée)

#### Étape 2 : Spécifications techniques
- **Surface requise** : En m² (ex: 500)
- **Hauteur sous plafond** : Minimum requis en mètres (ex: 8m)
- **Type de stockage** :
  - `AMBIENT` : Température ambiante
  - `TEMP_CONTROLLED` : Température contrôlée (15-25°C)
  - `REFRIGERATED` : Réfrigéré (0-8°C)
  - `FROZEN` : Congelé (-18°C ou moins)
  - `ADR` : Matières dangereuses (certification ADR requise)
- **Services requis** : (multi-sélection)
  - [ ] Quais de chargement
  - [ ] Chariots élévateurs
  - [ ] Système WMS
  - [ ] Sécurité 24/7
  - [ ] Cross-docking
  - [ ] Préparation de commandes
  - [ ] Emballage
  - [ ] Logistique inverse

#### Étape 3 : Localisation
- **Adresse de référence** : Votre site de production ou de livraison
- **Rayon acceptable** : Distance maximale (ex: 50km)
- Le système calcule automatiquement le GPS

#### Étape 4 : Budget et publication
- **Budget maximum** : Prix mensuel max (€/m²/mois)
- **Mode de publication** :
  - **Marché Global** : Visible par tous les logisticiens abonnés
  - **Partenaires Invités** : Seulement vos partenaires de confiance
  - **Mixte** : Les deux (recommandé pour plus d'offres)
- Cliquez sur **"Publier le besoin"**

### 4. Recevoir et comparer les offres

#### Notification
Vous recevez une notification à chaque nouvelle offre (email + in-app).

#### Consulter les offres
1. Allez sur **"Besoins"** > Cliquez sur votre besoin
2. Onglet **"Offres reçues"** : Liste avec tri par score IA

#### Classement IA
Les offres sont classées selon un score sur 100 points :

| Critère | Poids | Détails |
|---------|-------|---------|
| **Prix** | 40 pts | Plus bas que la moyenne = meilleur score |
| **Proximité** | 25 pts | Distance au site de référence (formule Haversine) |
| **Fiabilité** | 20 pts | Basé sur l'historique de contrats réussis |
| **Réactivité** | 15 pts | Rapidité de réponse (< 24h = max points) |

#### Top 3 Badges
- 🥇 **Recommandation IA #1** : Badge or
- 🥈 **Recommandation IA #2** : Badge argent
- 🥉 **Recommandation IA #3** : Badge bronze

#### Comparer les offres
Utilisez le **Comparateur d'offres** :
1. Sélectionnez 2-3 offres via les checkboxes
2. Cliquez sur **"Comparer"**
3. Vue côte à côte :
   - Prix unitaire (€/m²/mois)
   - Prix total mensuel
   - Distance (km)
   - Services inclus
   - Score IA
   - Avis clients (futur)

### 5. Négocier une offre
1. Cliquez sur **"Négocier"** sur l'offre choisie
2. Proposez un contre-prix ou ajustements
3. Le logisticien reçoit votre proposition
4. Il peut accepter, refuser ou contre-proposer
5. Échanges jusqu'à accord (max 3 tours)

### 6. Accepter une offre
1. Cliquez sur **"Accepter l'offre"**
2. Revue finale des termes :
   - Surface : 500 m²
   - Durée : 6 mois
   - Prix : 8.50 €/m²/mois
   - **Total mensuel** : 4 250 €
3. Signez électroniquement
4. **Contrat créé automatiquement**

### 7. Suivre vos contrats
Onglet **"Contrats"** :
- **Statut** : PENDING (en attente), ACTIVE (en cours), COMPLETED (terminé)
- **Dates clés** : Début, fin, durée restante
- **Facturation** : Montants, échéances, statut de paiement
- **Documents** : Contrat PDF, factures, bons de livraison
- **Contact** : Coordonnées du responsable logisticien

---

## 📦 Guide Logisticien Abonné

### 1. Accéder au module
1. Connectez-vous à web-logistician
2. Cliquez sur **"Bourse de Stockage"**

### 2. Configurer vos sites

#### Ajouter un site
1. Allez sur **"Mes Sites"** > **"+ Ajouter un site"**
2. Remplissez :
   - Nom du site (ex: "Entrepôt Lyon Sud")
   - Adresse complète
   - Surface totale disponible
   - Hauteur sous plafond
   - Types de stockage supportés
   - Services disponibles
   - Horaires d'ouverture
   - Photos (min 3 recommandées)

#### Définir les tarifs
Pour chaque type de stockage :
- **Tarif de base** : €/m²/mois
- **Remise volume** : % si > 1000 m²
- **Tarif longue durée** : % de réduction si > 6 mois
- **Services optionnels** : Prix à l'unité

### 3. Consulter les besoins disponibles

#### Vue liste
- **Filtres** :
  - Type de besoin (SPOT, CONTRACT, LONG_TERM)
  - Type de stockage requis
  - Surface min/max
  - Rayon géographique
  - Budget (fourchette)
- **Tri** :
  - Plus récents
  - Deadline proche
  - Budget le plus élevé
  - Proximité

#### Vue carte
- Pins géolocalisés
- Code couleur par type
- Cliquez sur un pin pour voir les détails

### 4. Soumettre une offre

#### Vérifier l'adéquation
Avant de soumettre, vérifiez :
- ✓ Avez-vous la surface disponible ?
- ✓ Votre site supporte-t-il le type de stockage ?
- ✓ Pouvez-vous fournir les services requis ?
- ✓ Êtes-vous dans le rayon géographique ?

#### Formulaire d'offre
1. Cliquez sur **"Soumettre une offre"** sur le besoin
2. Sélectionnez le site à proposer (dropdown)
3. Tarification :
   - Prix unitaire : €/m²/mois
   - **Calcul automatique du total** basé sur la surface demandée
   - Affichez les réductions applicables (volume, durée)
4. Services inclus : Cochez ceux compris dans le prix
5. Services optionnels : Ajoutez avec tarifs
6. Commentaire : Atouts de votre offre (ex: "Certification ISO 9001", "Disponibilité immédiate")
7. Cliquez sur **"Envoyer l'offre"**

#### Optimiser votre score IA
- **Prix compétitif** : Étudiez le budget max indiqué
- **Réactivité** : Répondez dans les 24h (+15 pts)
- **Proximité** : Proposez le site le plus proche
- **Fiabilité** : Maintenez un bon historique (honorez vos engagements)

### 5. Gérer vos offres envoyées
Tableau **"Mes Offres"** :
- **En attente** : L'industriel n'a pas encore répondu
- **Négociation** : Contre-proposition reçue
- **Acceptée** : Votre offre a été retenue ! 🎉
- **Refusée** : Offre non retenue (voir le feedback)

### 6. Négociation
Si l'industriel contre-propose :
1. Vous recevez une notification
2. Consultez la proposition :
   - Nouveau prix proposé
   - Ajustements demandés (services, durée...)
3. Vous pouvez :
   - **Accepter** : Le contrat est créé
   - **Refuser** : Fin des négociations
   - **Contre-proposer** : Nouvelle proposition (max 3 tours)

### 7. Contrats actifs
Onglet **"Contrats"** :
- **Occupation en temps réel** : % de surface louée
- **Revenus mensuels** : Facturation automatique
- **Calendrier** : Dates d'entrée/sortie marchandises
- **Contact client** : Coordonnées de l'industriel
- **Documents** : Contrat signé, factures, BLs

### 8. Intégration WMS
Si vous avez un WMS (Warehouse Management System) :
1. Allez sur **"Paramètres"** > **"Intégrations"**
2. Sélectionnez votre WMS :
   - SAP EWM
   - Manhattan Associates
   - Blue Yonder
   - Hardis Group Reflex
   - Custom (API REST)
3. Configurez la connexion (API key, endpoint)
4. Synchronisation automatique :
   - Disponibilité en temps réel
   - Mouvements de stock
   - Alertes de capacité

---

## 🎖️ Guide Logisticien Invité

### Différence avec Abonné
- ❌ Pas d'accès à la marketplace globale
- ✅ Recevoir des invitations ciblées d'industriels
- ✅ Soumettre des offres sur demande
- ✅ Tarifs préférentiels (pas de commission sur les premiers contrats)

### Workflow
1. **Invitation reçue** : Email avec lien unique
2. **Voir le besoin** : Détails complets du besoin
3. **Soumettre une offre** : Même processus qu'un abonné
4. **Upgrade possible** : Devenez abonné pour accéder à tous les besoins

---

## 🛡️ Guide Administrateur RT

### Rôle
Vous modérez la marketplace pour garantir qualité et confiance.

### 1. Dashboard admin
Accessible via **backoffice-admin** > **"Bourse de Stockage"**

#### Métriques globales
- Total besoins publiés (ce mois)
- Total offres soumises
- Taux de conversion (besoin → contrat)
- Valeur totale des contrats (€)
- Satisfaction moyenne (étoiles)

### 2. Modération des besoins
**Besoins en attente de validation** :
1. Vérifiez la qualité :
   - Informations complètes et claires
   - Budget réaliste
   - Pas de contenu inapproprié
2. Actions :
   - **Approuver** : Le besoin devient visible
   - **Rejeter** : Demandez des corrections
   - **Signaler** : Comportement suspect

### 3. Validation des entreprises
Avant qu'une entreprise puisse utiliser la bourse :
1. Vérification d'identité :
   - SIRET/SIREN
   - Kbis récent (< 3 mois)
   - Assurance RC (Responsabilité Civile)
2. Vérification financière :
   - Solvabilité (score Banque de France)
   - Pas de procédure collective en cours
3. Approuver ou refuser avec motif

### 4. Gestion des litiges
Si un industriel ou logisticien signale un problème :
1. **Litige ouvert** : Notification admin
2. **Investigation** :
   - Consulter l'historique du contrat
   - Lire les messages échangés
   - Examiner les preuves (photos, documents)
3. **Médiation** :
   - Contacter les deux parties
   - Proposer une solution (remboursement partiel, extension gratuite...)
4. **Décision finale** : Avec justification écrite

### 5. Analytics avancés
Tableaux de bord avec :
- **Top logisticiens** : Plus de contrats gagnés
- **Top industriels** : Plus gros volumes
- **Régions actives** : Heatmap géographique
- **Types de stockage** : Demandes par catégorie
- **Tendances prix** : Évolution des tarifs moyens
- **Performance IA** : Taux d'acceptation des recommandations

---

## 🤖 Comprendre l'IA de Ranking

### Algorithme détaillé

#### 1. Critère Prix (40 points)
```
Prix moyen de toutes les offres = 10 €/m²
Offre A : 8 €/m² → Score = 40 × (1 + (10-8)/10) = 48 pts (bonus!)
Offre B : 10 €/m² → Score = 40 pts
Offre C : 12 €/m² → Score = 40 × (1 - (12-10)/10) = 32 pts
```

#### 2. Critère Proximité (25 points)
Formule Haversine pour calculer la distance réelle.
```
Distance max acceptable = 50 km
Offre à 10 km → Score = 25 × (1 - 10/50) = 20 pts
Offre à 25 km → Score = 25 × (1 - 25/50) = 12.5 pts
Offre à 50 km → Score = 0 pt
```

#### 3. Critère Fiabilité (20 points)
Basé sur l'historique :
```
Taux de succès = Contrats honorés / Total contrats
Logisticien avec 95% de succès → 0.95 × 20 = 19 pts
Nouveau logisticien (pas d'historique) → 0.80 × 20 = 16 pts (défaut)
```

#### 4. Critère Réactivité (15 points)
Temps de réponse depuis la publication :
```
Réponse en 6h → 15 × (1 - 6/48) = 13.125 pts
Réponse en 24h → 15 × (1 - 24/48) = 7.5 pts
Réponse en 48h → 0 pt
```

### Exemple de calcul complet
**Offre Logistique Plus** :
- Prix : 8 €/m² (moyenne = 10 €) → 48 pts
- Distance : 15 km (max = 50 km) → 17.5 pts
- Fiabilité : 92% de succès → 18.4 pts
- Réactivité : 8h de réponse → 12.5 pts
- **Score total** : 96.4 / 100 → 🥇 **Recommandation IA #1**

---

## 📊 KPIs et Métriques

### Pour Industriels
- **Taux d'acceptation offres** : % d'offres acceptées parmi celles reçues
- **Économies moyennes** : % en dessous du budget max
- **Délai moyen acceptation** : Temps entre publication et signature
- **Satisfaction fournisseurs** : Note /5 donnée aux logisticiens

### Pour Logisticiens
- **Taux de conversion** : % d'offres soumises qui deviennent des contrats
- **Revenus mensuels** : Total généré via la bourse
- **Taux d'occupation** : % de capacité louée
- **Score IA moyen** : Performance moyenne de vos offres
- **Satisfaction clients** : Note /5 donnée par les industriels

---

## 🔐 Sécurité et Conformité

### Protection des données
- **RGPD** : Consentement explicite pour utilisation des données
- **Anonymisation** : Les coordonnées complètes ne sont révélées qu'après acceptation
- **Chiffrement** : TLS 1.3 pour toutes les communications

### Contrats légaux
- Génération automatique de PDF avec termes standardisés
- Signature électronique certifiée (eIDAS)
- Archivage sécurisé pendant 10 ans
- Export possible en cas d'audit

### Paiements sécurisés
- Transactions via Stripe (futur)
- Garantie de paiement pour les logisticiens
- Facturation automatique mensuelle
- Retenue de garantie (5%) jusqu'à fin de contrat

---

## 📞 Besoin d'aide ?

### Ressources
- 📖 Documentation technique : `docs/STORAGE_MARKET_MODULE.md`
- 🤖 Guide algorithme IA : `docs/IA_RANKING_ALGORITHM.md`
- 💻 Code source backend : `services/storage-market/src/server.js`

### Support
- Email : storage@rt-technologie.com
- Téléphone : +33 1 XX XX XX XX (9h-18h)
- Chat en ligne : Widget en bas à droite
- FAQ : https://docs.rt-technologie.com/storage/faq

### Formation en présentiel
Sessions gratuites tous les mardis à 14h (2h) :
- Démo live de la plateforme
- Cas d'usage concrets
- Q&A avec experts
- Inscription : formations@rt-technologie.com

---

**Version du guide** : 1.0.0
**Dernière mise à jour** : Janvier 2025
**Durée de lecture** : 25 minutes
**Niveau** : Intermédiaire
