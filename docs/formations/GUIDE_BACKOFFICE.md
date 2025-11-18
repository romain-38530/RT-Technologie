# Guide de Formation - Backoffice Administrateur RT-Technologie

**Version** : 1.0
**Dernière mise à jour** : Novembre 2025
**Durée estimée** : 35 minutes
**Niveau** : Avancé
**Langue** : Français (version anglaise à venir)

---

## Table des matières

1. [Objectif du Backoffice](#1-objectif-du-backoffice)
2. [Public cible](#2-public-cible)
3. [Dashboard Administrateur](#3-dashboard-administrateur)
4. [Gestion des Utilisateurs et Permissions](#4-gestion-des-utilisateurs-et-permissions)
5. [Supervision des Services](#5-supervision-des-services)
6. [Modération Bourse de Stockage](#6-modération-bourse-de-stockage)
7. [Administration Palettes](#7-administration-palettes)
8. [Configuration Affret.IA](#8-configuration-affretia)
9. [Gestion Globale des Tarifs](#9-gestion-globale-des-tarifs)
10. [Analytics et Rapports](#10-analytics-et-rapports)
11. [Gestion des Litiges](#11-gestion-des-litiges)
12. [Sauvegarde et Restauration](#12-sauvegarde-et-restauration)
13. [Erreurs Courantes et Solutions](#13-erreurs-courantes-et-solutions)
14. [Sécurité et Audit](#14-sécurité-et-audit)
15. [Support et Escalade](#15-support-et-escalade)

---

## 1. Objectif du Backoffice

Le backoffice-admin RT-Technologie est la console d'administration centrale qui vous permet de :

- **Superviser l'infrastructure** : Monitorer tous les microservices (health checks, logs, métriques)
- **Gérer les utilisateurs** : Créer, modifier, supprimer des comptes et attribuer des permissions granulaires
- **Modérer la plateforme** : Valider les besoins de stockage, les entreprises, gérer les litiges
- **Configurer les services** : Paramétrer Affret.IA, ajuster les grilles tarifaires, définir les origins
- **Analyser les données** : Accéder aux analytics avancés multi-modules avec export SQL
- **Assurer la conformité** : Gérer les audits RGPD, sauvegardes, traçabilité
- **Support niveau 2** : Résoudre les incidents complexes, débloquer les utilisateurs

### Architecture technique

Le backoffice repose sur une architecture microservices :
- **Frontend** : Next.js 14 (App Router) avec React Server Components
- **Backend** : API Gateway Node.js routant vers les services métier
- **Services** : core-orders, vigilance, affret-ia, pricing, palettes
- **Base de données** : PostgreSQL (production) avec réplication
- **Cache** : Redis pour sessions et données temps réel
- **Monitoring** : Prometheus + Grafana pour métriques

---

## 2. Public cible

### Qui utilise le backoffice ?

**Administrateurs système**
- Configuration infrastructure et services
- Gestion des déploiements et mises à jour
- Monitoring performances et disponibilité

**Super-utilisateurs métier**
- Modération quotidienne (besoins, entreprises)
- Validation des transactions sensibles
- Gestion des litiges niveau 2

**Équipe Support**
- Déblocage comptes utilisateurs
- Investigation incidents
- Export de données pour analyses

### Prérequis

- Connaissance architecture microservices
- Maîtrise SQL (PostgreSQL)
- Compréhension REST APIs
- Bases de monitoring (logs, métriques)
- Sensibilité RGPD et sécurité

---

## 3. Dashboard Administrateur

### Vue globale

Le dashboard affiche en temps réel :

**Indicateurs clés (KPIs)**
- Nombre d'utilisateurs actifs (dernières 24h)
- Transactions en cours / traitées aujourd'hui
- Besoins de stockage en attente de validation
- Litiges ouverts nécessitant intervention
- Alertes critiques système

**Health Checks Services**
```
Service             Status    Latency    Uptime    Actions
─────────────────────────────────────────────────────────────
core-orders         🟢 UP     45ms       99.98%    [Logs] [Restart]
vigilance           🟢 UP     32ms       99.95%    [Logs] [Restart]
affret-ia           🟢 UP     120ms      99.89%    [Logs] [Restart]
pricing             🟢 UP     28ms       99.99%    [Logs] [Restart]
palettes            🟡 SLOW   450ms      99.92%    [Logs] [Restart]
database-primary    🟢 UP     15ms       100.00%   [Metrics]
redis-cache         🟢 UP     5ms        99.99%    [Flush]
```

**Codes couleur**
- 🟢 Vert : Service opérationnel (< 200ms)
- 🟡 Orange : Dégradé (200-500ms) ou warnings
- 🔴 Rouge : Indisponible ou erreurs critiques

### Actions rapides

- Redémarrer un service (avec confirmation)
- Consulter logs en temps réel (tail -f)
- Accéder aux métriques Grafana
- Exporter rapport santé système (PDF)

### Alertes automatiques

Configurez des notifications (email, Slack, SMS) pour :
- Service down > 2 minutes
- Latence > seuil critique (500ms)
- Taux d'erreur > 5%
- Espace disque < 15%
- Tentatives connexion suspectes

---

## 4. Gestion des Utilisateurs et Permissions

### Modèle de permissions

RT-Technologie utilise un système RBAC (Role-Based Access Control) avec 4 niveaux :

**1. ADMIN (Super-administrateur)**
- Accès total backoffice
- Gestion utilisateurs et rôles
- Configuration services
- Export données sensibles

**2. MODERATOR (Modérateur)**
- Validation besoins/entreprises
- Gestion litiges
- Consultation analytics
- Pas d'accès configuration système

**3. SUPPORT (Support client)**
- Déblocage comptes
- Consultation logs utilisateurs
- Export rapports
- Pas de modification données sensibles

**4. USER (Utilisateur standard)**
- Pas d'accès backoffice
- Interfaces métier uniquement

### Créer un utilisateur

**Navigation** : Backoffice > Utilisateurs > Créer

**Champs obligatoires**
```
Email               : admin@rt-technologie.fr
Nom complet         : Jean Dupont
Rôle                : ADMIN | MODERATOR | SUPPORT | USER
Entreprise          : [Sélection si applicable]
Permissions spéciales : [Cocher modules autorisés]
  ☑ Gestion utilisateurs
  ☑ Modération stockage
  ☑ Administration palettes
  ☑ Configuration Affret.IA
  ☑ Analytics avancés
  ☑ Export données
```

**Sécurité**
- Mot de passe initial envoyé par email sécurisé
- Obligation changement au premier login
- 2FA activable (recommandé pour ADMIN)

### Modifier permissions

**Procédure**
1. Rechercher utilisateur (email, nom, ID)
2. Cliquer "Éditer permissions"
3. Ajuster rôle et modules
4. Justifier modification (champ obligatoire pour audit)
5. Enregistrer

**Traçabilité**
Toute modification de permission génère :
- Log audit horodaté
- Email notification à l'utilisateur
- Notification admin principal

### Suspendre un compte

**Cas d'usage**
- Activité suspecte détectée
- Demande employeur (départ salarié)
- Non-conformité RGPD
- Impayés (entreprises)

**Procédure**
1. Backoffice > Utilisateurs > [Rechercher]
2. Bouton "Suspendre compte"
3. Motif obligatoire (RGPD, Sécurité, Commercial)
4. Confirmer

**Effets**
- Déconnexion immédiate (invalidation session)
- Blocage tentatives reconnexion
- Conservation données (pas de suppression)
- Email notification automatique

### Supprimer un compte (RGPD)

**Attention** : Opération irréversible (droit à l'oubli RGPD)

**Procédure**
1. Vérifier demande écrite utilisateur (ticket support)
2. Backoffice > Utilisateurs > [Rechercher] > Supprimer
3. Sélectionner mode suppression :
   - **Anonymisation** : Conservation données anonymisées (stats)
   - **Suppression totale** : Effacement définitif

**Données conservées (anonymisation)**
- Transactions historiques (montants, dates) sans identité
- Statistiques agrégées
- Logs techniques (IP anonymisées)

**Données supprimées**
- Informations personnelles (nom, email, téléphone)
- Documents uploadés
- Historique complet si suppression totale

---

## 5. Supervision des Services

### Architecture microservices

RT-Technologie déploie 6 services critiques :

**core-orders**
- Gestion commandes transport
- Matching offres/demandes
- Workflow validation

**vigilance**
- Surveillance risques transport
- Alertes météo, trafic, géopolitique
- Scoring fiabilité entreprises

**affret-ia**
- IA prédictive tarification
- Optimisation routage
- Détection fraudes

**pricing**
- Calcul tarifs dynamiques
- Gestion grilles tarifaires
- Intégration origins

**palettes**
- Gestion quotas palettes
- Tracking sites dépôt
- Litiges palettes

**api-gateway**
- Routage requêtes
- Authentification JWT
- Rate limiting

### Consulter les logs

**Accès temps réel**
```bash
Backoffice > Services > [Sélectionner service] > Logs

# Filtres disponibles
Niveau      : ERROR | WARN | INFO | DEBUG
Période     : Dernière heure | 6h | 24h | 7j | Custom
Recherche   : [mot-clé, ID transaction, user]
```

**Exemple log critique (affret-ia)**
```
[2025-11-18 14:32:18] ERROR - PricingService
Message: Failed to fetch origin data from pricing service
Stack: TypeError: Cannot read property 'tarif' of undefined
  at calculateRoute (affret-ia/src/services/pricing.js:145)
Request ID: req_8x9k2m4p
User ID: usr_admin_001
Impact: 12 requêtes échouées (dernières 5min)
```

**Actions correctives**
- Vérifier connectivité service pricing (health check)
- Consulter logs pricing en parallèle
- Redémarrer service si nécessaire
- Escalader si persistant > 10min

### Métriques Grafana

**Dashboards prédéfinis**
- **System Overview** : CPU, RAM, disk, network tous services
- **API Performance** : Latence endpoints, taux erreur, throughput
- **Business Metrics** : Transactions/h, taux conversion, CA
- **User Activity** : Connexions, actions, géolocalisation

**Créer une alerte custom**
```
Métrique   : api_latency_p95
Condition  : > 500ms
Période    : 5 minutes consécutives
Action     : Envoyer email + Slack #ops
```

### Redémarrer un service

**Procédure sécurisée**
1. Vérifier impact (utilisateurs actifs sur service)
2. Activer mode maintenance si besoin (affiche message user)
3. Backoffice > Services > [Service] > Redémarrer
4. Confirmer (justification obligatoire)
5. Attendre health check vert (max 30s)
6. Vérifier logs démarrage (pas d'erreurs)
7. Désactiver mode maintenance

**Rolling restart** : Pour déploiements sans downtime, utiliser CLI :
```bash
npm run deploy:rolling -- --service=affret-ia
```

---

## 6. Modération Bourse de Stockage

### Workflow validation besoins

**États possibles**
- DRAFT : Créé par entreprise, incomplet
- PENDING : Soumis, en attente validation admin
- APPROVED : Validé, publié sur bourse
- REJECTED : Refusé (motif obligatoire)
- EXPIRED : Périmé (date limite dépassée)

### Valider un besoin

**Navigation** : Backoffice > Modération > Besoins en attente

**Critères de validation**
- Entreprise vérifiée (SIRET valide, pas en redressement)
- Informations complètes (surface, dates, localisation)
- Photos conformes (pas de montage, qualité suffisante)
- Tarif cohérent (comparaison marché)
- Conditions contractuelles légales (pas de clauses abusives)

**Procédure**
1. Cliquer sur besoin (liste triée par date soumission)
2. Examiner fiche complète :
   ```
   Entreprise      : SARL Transport Dupont (SIRET: 123456789)
   Surface         : 1200 m² (palettisé)
   Dates           : 01/12/2025 - 31/03/2026
   Localisation    : Zone industrielle Lyon Nord (69)
   Tarif demandé   : 4.50 €/m²/mois
   Photos          : 8 images (cliquer pour agrandir)
   Conditions      : Accès 24/7, sécurité gardiennage
   ```
3. Vérifier entreprise (onglet "Historique")
   - Litiges antérieurs ? Taux résolution ?
   - Avis autres entreprises
   - Score fiabilité Vigilance
4. Décision :
   - **Approuver** : Besoin publié immédiatement
   - **Demander modifications** : Email automatique entreprise
   - **Rejeter** : Motif obligatoire (notif entreprise)

**Temps de traitement cible** : < 2h ouvrées

### Rejeter un besoin

**Motifs fréquents**
- Informations incomplètes/incohérentes
- Photos non conformes (floues, pas du site)
- Tarif hors marché (suspicion dumping/surfacturation)
- Entreprise non vérifiée (SIRET invalide)
- Conditions illégales (clause abusive)

**Procédure**
1. Bouton "Rejeter"
2. Sélectionner motif principal
3. Ajouter commentaire explicatif (min 50 caractères)
4. Confirmer

**Email automatique envoyé** :
```
Objet : Votre besoin de stockage n°12345 a été rejeté

Bonjour,

Votre besoin de stockage soumis le 15/11/2025 n'a pas été validé
pour le motif suivant :

MOTIF : Photos non conformes
DÉTAILS : Les photos fournies ne montrent pas clairement l'espace
proposé. Merci de télécharger des images haute résolution de
l'intérieur de l'entrepôt.

Vous pouvez modifier votre annonce et la soumettre à nouveau.

Cordialement,
L'équipe RT-Technologie
```

### Modération entreprises

**Validation inscription entreprise**

Navigation : Backoffice > Modération > Entreprises en attente

**Documents obligatoires**
- Kbis de moins de 3 mois
- RIB au nom de l'entreprise
- Attestation assurance responsabilité civile
- Justificatif identité dirigeant

**Vérifications automatiques**
- SIRET via API INSEE (statut actif)
- IBAN via API SEPA (format valide)
- Email domaine entreprise (pas Gmail/Hotmail pour pro)

**Vérifications manuelles**
- Cohérence documents (noms, adresses)
- Activité en lien avec transport/logistique
- Pas de mentions redressement judiciaire
- Recherche antécédents (si doute)

**Approuver entreprise**
1. Tous documents validés → Bouton "Approuver"
2. Email bienvenue envoyé (accès complet plateforme)
3. Scoring Vigilance initialisé (neutre, évoluera)

**Rejeter entreprise**
- Motifs : Documents invalides, activité non conforme, SIRET inactif
- Possibilité resoumission après correction

---

## 7. Administration Palettes

### Vue d'ensemble

Le module palettes gère :
- Quotas palettes par entreprise
- Sites de dépôt/retrait
- Tracking mouvements (entrées/sorties)
- Litiges palettes (manquantes, endommagées)

### Gérer les quotas

**Navigation** : Backoffice > Palettes > Quotas entreprises

**Affichage**
```
Entreprise              Quota    Utilisé   Dispo   Actions
─────────────────────────────────────────────────────────────
Transport Martin        500      320       180     [Ajuster]
Log Express SARL        1000     998       2       [Ajuster]
Fret Rapide             200      45        155     [Ajuster]
```

**Ajuster quota**
1. Cliquer "Ajuster" sur ligne entreprise
2. Nouveau quota : [Saisir nombre]
3. Motif : Augmentation contrat | Incident | Correction
4. Valider

**Alertes automatiques**
- Email entreprise si utilisation > 90%
- Blocage nouvelles commandes si quota atteint
- Notification admin si demande augmentation

### Gérer les sites de dépôt

**Navigation** : Backoffice > Palettes > Sites

**Créer un site**
```
Nom site        : Plateforme Lyon Confluence
Adresse         : 12 Quai Rambaud, 69002 Lyon
Type            : Dépôt | Retrait | Mixte
Capacité max    : 2000 palettes
Horaires        : Lun-Ven 7h-19h, Sam 8h-12h
Contact         : Jean Martin - 06 12 34 56 78
Coordonnées GPS : 45.7423, 4.8150
```

**Activer/Désactiver site**
- Désactivation : Site plein, travaux, fermeture temporaire
- Palettes existantes restent trackées
- Nouvelles attributions bloquées

### Consulter mouvements

**Navigation** : Backoffice > Palettes > Mouvements

**Filtres**
- Entreprise
- Site
- Type mouvement (Entrée/Sortie/Transfert)
- Période

**Exemple export CSV**
```csv
Date,Entreprise,Site,Type,Quantité,Référence
2025-11-15 09:32,Transport Martin,Lyon Confluence,Entrée,50,PAL-001234
2025-11-15 14:20,Log Express,Marseille Port,Sortie,120,PAL-001235
2025-11-16 11:05,Fret Rapide,Lyon Confluence,Transfert,30,PAL-001236
```

---

## 8. Configuration Affret.IA

### Présentation

Affret.IA est le moteur d'intelligence artificielle pour :
- Prédiction tarifs transport (Machine Learning)
- Optimisation routage (algorithmes génétiques)
- Détection anomalies/fraudes (règles + ML)
- Scoring entreprises (multifactoriel)

### Paramètres globaux

**Navigation** : Backoffice > Services > Affret.IA > Configuration

**Seuils d'alerte**
```json
{
  "pricingDeviation": {
    "warningThreshold": 15,      // Alerte si tarif +/-15% marché
    "criticalThreshold": 30,     // Blocage si +/-30%
    "autoReject": false          // Rejet automatique désactivé
  },
  "fraudDetection": {
    "enabled": true,
    "suspiciousPatterns": [
      "same_ip_multiple_accounts",
      "rapid_quote_requests",
      "price_manipulation"
    ],
    "autoSuspend": true          // Suspension compte auto si fraude
  },
  "routeOptimization": {
    "algorithm": "genetic",      // genetic | dijkstra | astar
    "maxIterations": 1000,
    "convergenceThreshold": 0.95
  }
}
```

**Modifier paramètre**
1. Cliquer "Éditer configuration"
2. Ajuster valeur (JSON format strict)
3. Tester en environnement staging (bouton "Test config")
4. Si OK : Déployer production (redémarrage service auto)

### Règles de pricing

**Navigation** : Backoffice > Affret.IA > Règles tarifaires

**Types de règles**
- **Multiplicateur saisonnier** : Haute saison +20%, basse saison -10%
- **Ajustement géographique** : Zone tendue (Paris) +15%
- **Volume discount** : > 10 commandes/mois → -5%
- **Pénalités délai** : Livraison express +25%

**Créer règle custom**
```javascript
// Exemple : Majoration zone urbaine dense
{
  "name": "urban_surcharge",
  "condition": "delivery.zipCode IN ['75001', '75002', ..., '75020']",
  "action": "price.multiply(1.12)",
  "priority": 10,
  "active": true
}
```

**Ordre application** : Les règles s'appliquent par priorité croissante (1-100)

### Modèles ML

**Navigation** : Backoffice > Affret.IA > Machine Learning

**Modèles actifs**
- **price-predictor-v3** : Prédiction tarifs (Random Forest, accuracy 94%)
- **fraud-detector-v2** : Détection fraudes (Neural Network, F1-score 0.89)
- **demand-forecaster-v1** : Prévision demande (LSTM, MAE 8.3%)

**Réentraîner un modèle**
1. Sélectionner modèle
2. Définir dataset (6 derniers mois recommandé)
3. Lancer training (durée : 20-45min selon taille)
4. Comparer métriques nouveau vs actuel
5. Déployer si amélioration significative (> 2%)

**Métriques à surveiller**
- Accuracy : Précision globale
- Precision/Recall : Équilibre détection vraies alertes vs faux positifs
- MAE (Mean Absolute Error) : Écart moyen prédictions
- Drift : Dégradation performances dans le temps (réentraîner si > 5%)

---

## 9. Gestion Globale des Tarifs

### Grilles tarifaires

**Navigation** : Backoffice > Tarification > Grilles

Les grilles définissent les tarifs de base par :
- Type véhicule (VL, PL, Semi-remorque)
- Distance (tranches kilométriques)
- Zone géographique
- Type marchandise (standard, fragile, dangereux)

**Structure grille standard**
```json
{
  "id": "grid_2025_national",
  "name": "Grille nationale 2025",
  "validFrom": "2025-01-01",
  "validTo": "2025-12-31",
  "zones": [
    {
      "name": "Zone 1 - Île-de-France",
      "departments": ["75", "77", "78", "91", "92", "93", "94", "95"],
      "rates": {
        "VL": {"base": 0.45, "perKm": 0.75},
        "PL": {"base": 1.20, "perKm": 1.85},
        "SEMI": {"base": 2.50, "perKm": 2.40}
      }
    }
  ]
}
```

**Créer nouvelle grille**
1. Backoffice > Tarification > Nouvelle grille
2. Dupliquer grille existante (recommandé) ou partir de zéro
3. Modifier tarifs par zone/véhicule
4. Définir période validité
5. Tester calculs (simulateur intégré)
6. Publier (activation immédiate ou programmée)

**Activer/Désactiver grille**
- Une seule grille active par période
- Changement grille = recalcul tous devis en cours (async)
- Historique conservé (auditabilité)

### Origins (points de départ tarifaires)

**Navigation** : Backoffice > Tarification > Origins

Les origins définissent les points de référence géographiques pour calculer les distances.

**Fichier de configuration** : `infra/seeds/origins.json`

**Structure**
```json
{
  "origins": [
    {
      "id": "paris_hub",
      "name": "Hub Paris Centre",
      "address": "Place de la République, 75011 Paris",
      "coordinates": {"lat": 48.8676, "lng": 2.3632},
      "active": true,
      "priority": 1
    },
    {
      "id": "lyon_platform",
      "name": "Plateforme Lyon Est",
      "address": "Rue Maryse Bastié, 69008 Lyon",
      "coordinates": {"lat": 45.7275, "lng": 4.8752},
      "active": true,
      "priority": 2
    }
  ]
}
```

**Ajouter un origin**
1. Éditer fichier origins.json (ou via interface backoffice)
2. Ajouter entrée avec coordonnées GPS précises
3. Définir priorité (utilisé si multiple origins possibles)
4. Activer origin
5. Redéployer service pricing (lecture au démarrage)

**Cas d'usage**
- Nouvelle plateforme logistique ouverte
- Optimisation couverture géographique
- Tarification différenciée par région

### Simulateur tarifaire

**Navigation** : Backoffice > Tarification > Simulateur

**Tester un calcul**
```
Origin          : [Sélectionner hub]
Destination     : Lyon 69008
Type véhicule   : PL (Poids Lourd)
Distance        : 450 km (calculée auto)
Type marchandise: Standard
Options         : ☑ Assurance tous risques
                  ☐ Livraison express
                  ☐ Manutention

RÉSULTAT
────────────────────────────────
Tarif base          : 1.20 €
Distance (450 km)   : 832.50 € (1.85 €/km)
Assurance           : 25.00 €
Multiplicateurs     :
  - Zone tendue     : +12% (99.89 €)
  - Haute saison    : +8% (76.12 €)
────────────────────────────────
TOTAL HT            : 1034.71 €
TVA (20%)           : 206.94 €
TOTAL TTC           : 1241.65 €
```

**Export devis PDF** : Bouton "Générer PDF" pour présentation client

---

## 10. Analytics et Rapports

### Dashboards prédéfinis

**Navigation** : Backoffice > Analytics

**Vue d'ensemble activité**
- Utilisateurs actifs (jour, semaine, mois)
- Transactions complétées vs abandonnées
- Chiffre d'affaires (par jour, cumulé)
- Taux de conversion (visiteur → commande)
- Temps moyen traitement commande

**Bourse de stockage**
- Besoins publiés vs satisfaits
- Taux d'occupation moyen (%)
- Tarif moyen au m²/mois par région
- Délai moyen validation besoins

**Palettes**
- Mouvements quotidiens (entrées/sorties)
- Taux utilisation quotas par entreprise
- Sites les plus actifs
- Litiges ouverts vs résolus

**Affret.IA**
- Requêtes tarifaires (volume, latence)
- Taux alertes pricing
- Détections fraudes (vrais/faux positifs)
- Précision modèles ML (drift tracking)

### Requêtes SQL personnalisées

**Navigation** : Backoffice > Analytics > SQL Query Editor

**Sécurité** : Accès restreint rôle ADMIN, requêtes en lecture seule

**Exemples de requêtes**

**Top 10 entreprises par CA**
```sql
SELECT
  e.name AS entreprise,
  COUNT(o.id) AS nb_commandes,
  SUM(o.total_amount) AS ca_total,
  AVG(o.total_amount) AS panier_moyen
FROM orders o
JOIN companies e ON o.company_id = e.id
WHERE o.status = 'COMPLETED'
  AND o.created_at >= NOW() - INTERVAL '30 days'
GROUP BY e.id, e.name
ORDER BY ca_total DESC
LIMIT 10;
```

**Besoins stockage par région (6 derniers mois)**
```sql
SELECT
  s.region,
  COUNT(*) AS nb_besoins,
  AVG(s.surface_m2) AS surface_moyenne,
  AVG(s.price_per_m2) AS tarif_moyen
FROM storage_needs s
WHERE s.status = 'APPROVED'
  AND s.created_at >= NOW() - INTERVAL '6 months'
GROUP BY s.region
ORDER BY nb_besoins DESC;
```

**Détection utilisateurs inactifs (> 90 jours)**
```sql
SELECT
  u.email,
  u.full_name,
  u.role,
  MAX(l.login_at) AS derniere_connexion,
  NOW() - MAX(l.login_at) AS jours_inactivite
FROM users u
LEFT JOIN login_history l ON u.id = l.user_id
GROUP BY u.id, u.email, u.full_name, u.role
HAVING MAX(l.login_at) < NOW() - INTERVAL '90 days'
   OR MAX(l.login_at) IS NULL
ORDER BY derniere_connexion DESC;
```

**Export résultats** : CSV, JSON, Excel

### Rapports automatiques

**Configuration** : Backoffice > Analytics > Rapports programmés

**Créer un rapport récurrent**
```
Nom             : Rapport hebdomadaire direction
Fréquence       : Chaque lundi 8h00
Destinataires   : direction@rt-technologie.fr, ops@rt-technologie.fr
Contenu         :
  ☑ KPIs globaux (CA, transactions, users actifs)
  ☑ Top 10 entreprises
  ☑ Alertes incidents semaine
  ☑ Métriques Affret.IA
Format          : PDF + Excel (données brutes)
```

**Rapports disponibles**
- Hebdomadaire direction (synthèse stratégique)
- Mensuel comptabilité (CA détaillé, facturation)
- Quotidien ops (incidents, alertes, performance)
- Trimestriel RGPD (accès données, suppressions, audits)

---

## 11. Gestion des Litiges

### Types de litiges

**Stockage**
- Surface réelle ≠ annoncée
- État entrepôt non conforme
- Résiliation anticipée
- Impayés

**Transport**
- Retard livraison
- Marchandise endommagée
- Perte colis
- Tarif contesté

**Palettes**
- Palettes manquantes
- Palettes endommagées
- Retour non effectué

### Traiter un litige

**Navigation** : Backoffice > Litiges > Liste

**États litige**
- OPEN : Créé, en attente traitement
- IN_PROGRESS : Pris en charge par admin
- WAITING_RESPONSE : En attente info partie (timeout 7j)
- RESOLVED : Résolu (accord trouvé)
- CLOSED : Clôturé (escalade juridique ou abandon)

**Procédure traitement**
1. Consulter fiche litige :
   ```
   ID              : LIT-2025-001234
   Type            : Stockage - Surface non conforme
   Plaignant       : Transport Martin SARL
   Défendeur       : Entrepôts Lyon SAS
   Montant litige  : 2400 € (3 mois x 800 €)
   Date ouverture  : 10/11/2025
   Pièces jointes  : 12 (photos, contrat, emails)
   ```

2. Examiner pièces justificatives des deux parties
3. Contacter parties si info manquante (bouton "Demander précisions")
4. Proposer solution :
   - Remboursement partiel/total
   - Geste commercial
   - Résiliation sans frais
   - Rejet si demande non fondée

5. Statuer :
   - **Accord amiable** : Enregistrer termes accord, clore litige
   - **Désaccord** : Proposer médiation externe
   - **Escalade juridique** : Fournir dossier complet parties

**Délai traitement cible** : < 10 jours ouvrés

### Médiation

Si désaccord persistant :
1. Proposer médiateur certifié (liste partenaires)
2. Planifier session médiation (visio ou présentiel)
3. Assister parties (optionnel)
4. Enregistrer décision médiateur (contraignante selon CGU)

### Sanctions

En cas de fraude avérée ou mauvaise foi :
- Avertissement (trace dans scoring Vigilance)
- Suspension temporaire (7-30 jours)
- Résiliation compte (cas extrêmes, après validation juridique)

---

## 12. Sauvegarde et Restauration

### Politique de sauvegarde

**Sauvegarde automatique**
- **Base de données** : Backup complet quotidien 3h00 (retention 30j)
- **Incrémentale** : Toutes les 6h (retention 7j)
- **Documents uploadés** : Sync temps réel vers S3 (réplication multi-zones)
- **Configuration services** : Versioning Git + backup hebdo

**Localisation**
- Production : AWS S3 (région eu-west-3 Paris)
- Backup offsite : OVH Gravelines (disaster recovery)

### Restaurer une sauvegarde

**Navigation** : Backoffice > Système > Sauvegardes

**Cas d'usage**
- Corruption base de données
- Suppression accidentelle données
- Rollback après déploiement problématique
- Test restauration (drill trimestriel obligatoire)

**Procédure (DATABASE)**
1. Identifier backup à restaurer (liste avec timestamp)
2. **ATTENTION** : Arrêt complet plateforme requis (mode maintenance)
3. Télécharger backup (vérifier intégrité checksum)
4. Cliquer "Restaurer" :
   ```
   Backup sélectionné  : db_backup_2025-11-15_03-00-00.sql.gz
   Taille              : 2.4 GB
   Tables              : 87
   Durée estimée       : 12-18 minutes

   ⚠ TOUTES LES DONNÉES DEPUIS LE 15/11 03h00 SERONT PERDUES
   ```
5. Confirmer (double validation + mot de passe admin)
6. Attendre fin restauration (logs en temps réel)
7. Vérifier intégrité (checksum tables, comptages)
8. Redémarrer services
9. Désactiver mode maintenance

**RTO (Recovery Time Objective)** : < 1h
**RPO (Recovery Point Objective)** : < 6h (perte données max)

### Export données client (RGPD)

**Navigation** : Backoffice > RGPD > Export données utilisateur

**Procédure**
1. Saisir email utilisateur
2. Sélectionner périmètre :
   - Informations personnelles
   - Historique transactions
   - Documents uploadés
   - Logs activité
3. Format : ZIP (JSON + PDF lisible)
4. Générer (durée : 2-10min selon volume)
5. Lien téléchargement envoyé email utilisateur (expire 48h)

**Délai légal** : < 30 jours (RGPD)

---

## 13. Erreurs Courantes et Solutions

### Service indisponible (status 503)

**Symptôme** : Dashboard affiche service rouge, utilisateurs reçoivent erreur 503

**Diagnostic**
1. Vérifier logs service (Backoffice > Services > [Service] > Logs)
2. Rechercher erreurs récurrentes :
   - OOM (Out of Memory) : Fuite mémoire
   - Connection timeout : DB ou API externe injoignable
   - Port already in use : Conflit ports

**Solutions**
- **Redémarrer service** (résout 80% des cas)
- **Augmenter ressources** (RAM, CPU) si charge inhabituelle
- **Rollback déploiement** si incident post-mise à jour
- **Contacter DevOps** si persistant > 15min

### Lenteurs généralisées

**Symptôme** : Latence élevée (> 2s), timeout utilisateurs

**Diagnostic**
1. Consulter métriques Grafana > System Overview
2. Identifier goulot :
   - CPU > 80% : Traitement intensif en cours
   - RAM > 90% : Risque OOM
   - Disk I/O saturé : Requêtes DB lourdes
   - Network latency : Problème réseau/API externe

**Solutions**
- **Optimiser requêtes DB** : Analyser slow query log, ajouter index
- **Activer cache Redis** : Réduire hits DB
- **Scaler horizontalement** : Ajouter instances service
- **Rate limiting** : Limiter requêtes abusives (DDoS ?)

### Emails non reçus

**Symptôme** : Utilisateurs ne reçoivent pas notifications (validation, reset password)

**Diagnostic**
1. Backoffice > Système > Email logs
2. Vérifier statut envoi :
   - Queued : En attente traitement
   - Sent : Envoyé provider (SendGrid/Mailgun)
   - Delivered : Reçu boîte destinataire
   - Bounced : Adresse invalide
   - Spam : Classé spam destinataire

**Solutions**
- **Bounced** : Demander utilisateur vérifier email
- **Spam** : Vérifier SPF/DKIM/DMARC configurés, ajouter à whitelist
- **Queued bloqué** : Redémarrer service email, vérifier quota provider
- **Rate limit** : Augmenter quota ou étaler envois

### Calcul tarif incorrect

**Symptôme** : Devis incohérent, montant aberrant

**Diagnostic**
1. Backoffice > Tarification > Simulateur
2. Reproduire calcul avec mêmes paramètres
3. Vérifier :
   - Grille active correcte
   - Origins bien configurés
   - Règles Affret.IA (multiplicateurs)
   - Coordonnées GPS destination valides

**Solutions**
- **Grille erronée** : Corriger tarifs ou activer bonne grille
- **Origin manquant** : Ajouter origin dans infra/seeds/origins.json
- **Règle défaillante** : Désactiver règle problématique, analyser logs
- **Coordonnées invalides** : Recalculer avec adresse corrigée

### Session expirée fréquemment

**Symptôme** : Utilisateurs déconnectés toutes les 5-10min

**Diagnostic**
1. Vérifier configuration JWT :
   ```javascript
   // services/api-gateway/config/jwt.js
   {
     expiresIn: '8h',  // Devrait être >= 1h
     refreshTokenExpiry: '7d'
   }
   ```
2. Vérifier Redis (stockage sessions) :
   - Status UP ?
   - Mémoire suffisante ? (risque eviction)

**Solutions**
- **Augmenter durée token** : Passer à 8-12h
- **Activer refresh token** : Renouvellement auto transparent
- **Augmenter RAM Redis** : Éviter eviction sessions actives

---

## 14. Sécurité et Audit

### Conformité RGPD

**Obligations**
- Déclaration CNIL (effectuée, n° dossier dans docs juridiques)
- DPO désigné : dpo@rt-technologie.fr
- Registre traitements à jour (audit annuel)
- Durée conservation données : 3 ans après dernière activité
- Droit accès/rectification/suppression (délai 30j)

**Traçabilité**
Tous les accès données sensibles sont loggés :
```
[2025-11-18 10:45:32] AUDIT
User      : admin@rt-technologie.fr (ADMIN)
Action    : READ user personal data
Target    : user_id=12345 (jean.dupont@example.com)
IP        : 192.168.1.50
Justif    : Support ticket #9876
```

**Rapport audit RGPD**
Navigation : Backoffice > RGPD > Rapport conformité

Génère document PDF avec :
- Nombre demandes accès/suppression (délai moyen)
- Incidents sécurité (data breach → notification CNIL 72h)
- Consentements collectés (cookies, marketing)
- Sous-traitants et DPA (Data Processing Agreements)

### Contrôle d'accès

**Principe moindre privilège**
- Accorder strictement permissions nécessaires
- Réviser trimestriellement (audit droits)
- Révoquer immédiatement droits départ collaborateur

**2FA (Two-Factor Authentication)**
- **Obligatoire** : Rôles ADMIN, MODERATOR
- **Recommandé** : SUPPORT
- Méthodes : Authenticator app (Google, Authy), SMS backup

**Connexions suspectes**
Détecter et bloquer :
- Multiple échecs login (> 5 en 10min)
- Connexions depuis pays inhabituels
- Changement soudain user-agent/IP
- Horaires anormaux (3h du matin pour user bureau)

**Actions automatiques**
- Verrouillage compte temporaire (30min)
- Email alerte utilisateur + admin
- Captcha renforcé
- Obligation reset password si compromission

### Logs d'audit

**Navigation** : Backoffice > Sécurité > Logs audit

**Événements tracés**
- Connexions/déconnexions (IP, user-agent, géoloc)
- Modifications utilisateurs (création, suspension, suppression)
- Changements permissions/rôles
- Accès données sensibles (RGPD)
- Modifications configuration système
- Exports données massifs
- Tentatives accès non autorisées

**Rétention** : 1 an (obligation légale)

**Export** : JSON, CSV (pour analyse SIEM externe si applicable)

### Incident de sécurité

**Procédure d'urgence**

**1. Détection**
- Alerte automatique (IDS/IPS)
- Signalement utilisateur
- Découverte audit

**2. Containment**
- Isoler système compromis (réseau)
- Suspendre comptes suspects
- Changer credentials exposés

**3. Investigation**
- Analyser logs (timeline)
- Identifier vecteur attaque
- Évaluer périmètre (données exfiltrées ?)

**4. Éradication**
- Corriger vulnérabilité
- Supprimer backdoors
- Patcher systèmes

**5. Récupération**
- Restaurer depuis backup sain
- Redémarrer services
- Monitoring renforcé 48h

**6. Post-mortem**
- Rapport incident (causes, impact, actions)
- Notification CNIL si data breach (< 72h)
- Information utilisateurs affectés
- Plan d'amélioration

**Contacts urgence**
- RSSI : rssi@rt-technologie.fr | +33 6 XX XX XX XX
- DPO : dpo@rt-technologie.fr
- CNIL : 01 53 73 22 22

---

## 15. Support et Escalade

### Niveaux de support

**Niveau 1 - Support client standard**
- Gestion tickets utilisateurs (interface, bugs mineurs)
- Reset passwords, déblocage comptes
- Questions facturation simples
- SLA : Réponse < 4h, résolution < 24h

**Niveau 2 - Support admin (vous)**
- Incidents techniques complexes
- Modération contentieux
- Configuration avancée
- Export données sur demande
- SLA : Réponse < 1h, résolution < 8h

**Niveau 3 - DevOps/Ingénierie**
- Bugs critiques code
- Pannes infrastructure
- Optimisations performances
- Déploiements urgents
- SLA : Réponse immédiate (on-call), résolution selon criticité

### Escalader un incident

**Critères escalade N2 → N3**
- Service down > 15min (perte CA)
- Data breach suspecté
- Bug bloquant utilisateurs (> 50 impactés)
- Corruption données
- Impossibilité résolution avec ressources N2

**Procédure**
1. Documenter incident :
   ```
   Titre     : [CRITIQUE] Service affret-ia indisponible
   Début     : 2025-11-18 14:32
   Impact    : 100% utilisateurs, 0 devis possible
   Actions   : Redémarrage tenté (échec), logs analysés (OOM)
   Besoin    : Expertise DevOps, augmentation RAM urgent
   ```
2. Créer ticket escalade (Backoffice > Support > Nouvelle escalade)
3. Notifier on-call DevOps :
   - Slack #incidents-critiques
   - PagerDuty (alerte SMS/appel)
   - Email devops-oncall@rt-technologie.fr
4. Activer mode maintenance si nécessaire
5. Communiquer utilisateurs (status page)

### Status Page

**Public** : https://status.rt-technologie.fr

**Mettre à jour status**
1. Backoffice > Système > Status Page
2. Sélectionner service affecté
3. Statut :
   - 🟢 Operational : Tout fonctionne
   - 🟡 Degraded : Lenteurs, fonctionnalités partielles
   - 🔴 Major Outage : Service indisponible
   - 🔵 Maintenance : Arrêt programmé
4. Message utilisateurs (FR + EN) :
   ```
   Nous rencontrons actuellement des lenteurs sur le service de
   tarification Affret.IA. Nos équipes travaillent activement à la
   résolution. Temps estimé : 30 minutes.

   We are currently experiencing slowness on the Affret.IA pricing
   service. Our teams are actively working on a resolution.
   Estimated time: 30 minutes.
   ```
5. Publier (notification auto abonnés)

**Historique incidents** : Publié pour transparence (post-mortem anonymisés)

### Base de connaissance

**Navigation** : Backoffice > Support > Knowledge Base

**Articles admin**
- Procédures configuration détaillées
- Troubleshooting guides (par service)
- Scripts utiles (maintenance DB, batch operations)
- FAQ techniques

**Contribuer**
1. Créer article (Markdown)
2. Catégoriser (Service, Urgence, Domaine)
3. Ajouter tags (recherche)
4. Publier (accès rôles configurables)

**Objectif** : Autonomiser équipe, réduire tickets récurrents

---

## Conclusion

Vous maîtrisez maintenant l'ensemble des fonctionnalités du backoffice administrateur RT-Technologie.

**Points clés à retenir** :
- Prioriser disponibilité services (monitoring actif)
- Respecter procédures modération (qualité plateforme)
- Tracer toutes actions sensibles (RGPD, audit)
- Documenter incidents (amélioration continue)
- Communiquer proactivement (transparence)

**Prochaines étapes** :
1. Accès backoffice production (credentials via RSSI)
2. Formation hands-on (2h avec senior admin)
3. Période observation/tutorat (2 semaines)
4. Autonomie complète avec support N3 disponible

**Ressources** :
- Documentation technique : `docs/architecture/`
- Runbooks : `docs/runbooks/`
- Contact DevOps : devops@rt-technologie.fr
- Slack : #admin-backoffice

**Version anglaise** : Ce guide sera traduit en anglais d'ici fin décembre 2025.

---

**Bienvenue dans l'équipe d'administration RT-Technologie !**
