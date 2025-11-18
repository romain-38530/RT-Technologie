# Guide de Formation - Affret.IA

**Version** : 1.0.0
**Derniere mise a jour** : 18 janvier 2025
**Duree estimee** : 28 minutes de lecture
**Niveau** : Avance
**Langues** : Francais, English (a venir)

---

## Table des matieres

1. [Qu'est-ce qu'Affret.IA ?](#1-quest-ce-quaffretia)
2. [Pour qui ?](#2-pour-qui)
3. [Architecture de l'IA](#3-architecture-de-lia)
4. [Matching Intelligent](#4-matching-intelligent)
5. [Systeme de SLA et Timeouts](#5-systeme-de-sla-et-timeouts)
6. [Escalade Automatique](#6-escalade-automatique)
7. [Calcul Dynamique des Devis](#7-calcul-dynamique-des-devis)
8. [Optimisation Multi-Tournees](#8-optimisation-multi-tournees)
9. [Machine Learning et Amelioration Continue](#9-machine-learning-et-amelioration-continue)
10. [Predictions Avancees](#10-predictions-avancees)
11. [Detection d'Anomalies](#11-detection-danomalies)
12. [Configuration et Fine-Tuning](#12-configuration-et-fine-tuning)
13. [Dashboard Analytics IA](#13-dashboard-analytics-ia)
14. [Cas d'Usage Avances](#14-cas-dusage-avances)
15. [Limitations et Precautions](#15-limitations-et-precautions)
16. [Troubleshooting IA](#16-troubleshooting-ia)
17. [Roadmap et Evolutions](#17-roadmap-et-evolutions)
18. [Support](#18-support)

---

## 1. Qu'est-ce qu'Affret.IA ?

**Affret.IA** est le moteur d'intelligence artificielle au coeur de la plateforme RT-Technologie qui automatise completement le processus d'affretement (selection et affectation de transporteurs).

### Vue d'ensemble

Traditionnellement, l'affretement est un processus manuel, chronophage et sujet a erreurs :
- Recherche manuelle de transporteurs disponibles
- Negociation telephonique des prix
- Risque d'oubli ou de favoritisme
- Pas de tracabilite des decisions

**Affret.IA transforme ce processus** en :
- Matching automatise commande ↔ transporteur en <200ms
- Calcul intelligent de devis multi-criteres
- Scoring multicriteres (prix, disponibilite, historique, distance)
- Escalade automatique si absence de reponse
- Apprentissage continu pour ameliorer les recommandations

### Principes fondamentaux

```
COMMANDE RECUE
      ↓
┌─────────────────────────────────────┐
│  1. ANALYSE DE LA COMMANDE          │
│  - Origine/Destination              │
│  - Palettes, poids, volume          │
│  - Contraintes (temperature, ADR)   │
│  - Urgence (delais)                 │
└─────────────────────────────────────┘
      ↓
┌─────────────────────────────────────┐
│  2. CONSULTATION GRILLES TARIFAIRES │
│  - Grilles FTL/LTL de l'industriel  │
│  - Prix de reference par route      │
│  - Historique des prix              │
└─────────────────────────────────────┘
      ↓
┌─────────────────────────────────────┐
│  3. MATCHING INTELLIGENTS           │
│  - Filtrage transporteurs eligibles │
│  - Scoring multicriteres            │
│  - Ranking automatique              │
└─────────────────────────────────────┘
      ↓
┌─────────────────────────────────────┐
│  4. GENERATION DEVIS + AFFECTATION  │
│  - Prix optimise (IA + grilles)     │
│  - Transporteur recommande          │
│  - Integration palettes             │
└─────────────────────────────────────┘
      ↓
┌─────────────────────────────────────┐
│  5. SUIVI SLA + ESCALADE            │
│  - Timeout acceptation (2h)         │
│  - Escalade vers transporteur #2    │
│  - Alertes temps reel               │
└─────────────────────────────────────┘
```

### Avantages cles

| Avantage | Impact |
|----------|--------|
| **Rapidite** | Affectation en <200ms vs 30min manuellement |
| **Objectivite** | Criteres transparents, zero favoritisme |
| **Tracabilite** | Chaque decision documentee avec scoring |
| **Optimisation** | Apprentissage continu pour ameliorer les choix |
| **Disponibilite** | 24/7, aucune intervention humaine requise |
| **Scalabilite** | Gere des milliers de commandes simultanement |

---

## 2. Pour qui ?

### Logisticiens Avances

**Profil** : Responsables logistique maitrisant deja la plateforme RT-Technologie et souhaitant comprendre les mecanismes de l'IA pour optimiser leurs flux.

**Prerequis** :
- Connaissance du module Industrie ([GUIDE_INDUSTRIE.md](./GUIDE_INDUSTRIE.md))
- Comprehension des grilles tarifaires
- Notions de supply chain et affretement

**Objectifs pedagogiques** :
- Comprendre comment l'IA selectionne les transporteurs
- Parametrer finement les criteres de scoring
- Analyser les performances via le dashboard analytics
- Detecter et corriger les biais eventuels

### Data Analysts Transport

**Profil** : Analystes de donnees specialises dans le transport cherchant a exploiter les donnees d'Affret.IA pour optimiser les couts et la qualite de service.

**Prerequis** :
- Competences en analyse de donnees (Excel, SQL, Python/R)
- Comprehension des metriques transport (taux de service, OTIF, CPK)

**Objectifs pedagogiques** :
- Extraire et analyser les donnees de scoring
- Identifier les tendances et patterns
- Construire des dashboards personnalises
- Proposer des optimisations basees sur les donnees

### Administrateurs Systeme

**Profil** : Administrateurs de la plateforme RT-Technologie responsables de la configuration et du monitoring de l'IA.

**Prerequis** :
- Acces Backoffice ([GUIDE_BACKOFFICE.md](./GUIDE_BACKOFFICE.md))
- Connaissance des services microservices RT-Technologie

**Objectifs pedagogiques** :
- Configurer les seuils et ponderations
- Monitorer les performances du service
- Gerer les escalades et exceptions
- Maintenir les grilles tarifaires

---

## 3. Architecture de l'IA

### Composants techniques

Affret.IA est compose de plusieurs services microservices interconnectes :

```
┌───────────────────────────────────────────────────────────┐
│                    AFFRET.IA SERVICE                      │
│                   (Port 3005 HTTP)                        │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────┐    ┌─────────────────┐             │
│  │  Quote Engine   │    │  Bid Manager    │             │
│  │  /quote/:id     │    │  /bid           │             │
│  └─────────────────┘    └─────────────────┘             │
│                                                           │
│  ┌─────────────────┐    ┌─────────────────┐             │
│  │ Dispatch Engine │    │  Assignment DB  │             │
│  │  /dispatch      │    │  /assignment/:id│             │
│  └─────────────────┘    └─────────────────┘             │
│                                                           │
│  ┌─────────────────────────────────────────┐             │
│  │  Route Optimizer (Multi-Tournees)       │             │
│  │  /optimize-pallet-routes                │             │
│  └─────────────────────────────────────────┘             │
│                                                           │
│  ┌─────────────────────────────────────────┐             │
│  │  Pallet Alert System                    │             │
│  │  /pallet-alerts                         │             │
│  └─────────────────────────────────────────┘             │
└───────────────────────────────────────────────────────────┘
         ↓                    ↓                    ↓
┌────────────────┐  ┌──────────────────┐  ┌──────────────┐
│  MongoDB       │  │  OpenRouter API  │  │ Palette API  │
│  (Store)       │  │  (LLM GPT-4o)    │  │ (Port 3011)  │
└────────────────┘  └──────────────────┘  └──────────────┘
```

### Stack technique

- **Backend** : Node.js (HTTP natif, pas de framework)
- **Store** : MongoDB + In-Memory Map (fallback)
- **IA Externe** : OpenRouter API (GPT-4o-mini)
- **Algorithmes** : Haversine (distance), TSP Greedy (optimisation routes)
- **Securite** : JWT, rate limiting (120 req/min), CORS, headers securises

### Endpoints principaux

| Endpoint | Methode | Description |
|----------|---------|-------------|
| `/health` | GET | Statut du service |
| `/affret-ia/quote/:orderId` | GET | Genere un devis pour une commande |
| `/affret-ia/dispatch` | POST | Affecte un transporteur |
| `/affret-ia/bids/:orderId` | GET | Liste les offres recues |
| `/affret-ia/bid` | POST | Soumet une offre (transporteur) |
| `/affret-ia/assignment/:orderId` | GET | Recupere l'affectation |
| `/affret/optimize-pallet-routes` | POST | Optimise tournees multi-livraisons |
| `/affret/pallet-alerts` | GET | Alertes saturation palettes |

### Modele de donnees

**Order (Commande)**
```json
{
  "id": "ORD-Paris-Munich",
  "ship_from": "PARIS",
  "ship_to": "Munich",
  "origin": "PARIS",
  "pallets": 10,
  "weight": 5000,
  "ownerOrgId": "IND-1",
  "deliveryLocation": { "lat": 48.1351, "lng": 11.5820 }
}
```

**Carrier (Transporteur)**
```json
{
  "id": "CARRIER-A",
  "name": "Transport Express Europe",
  "premium": true,
  "scoring": 92,
  "fleet": 150,
  "zones": ["FR", "DE", "IT"]
}
```

**Grid (Grille tarifaire)**
```json
{
  "ownerOrgId": "IND-1",
  "grids": [
    {
      "origin": "PARIS",
      "mode": "FTL",
      "lines": [
        { "to": "Munich", "price": 950, "currency": "EUR" }
      ]
    }
  ]
}
```

**Bid (Offre transporteur)**
```json
{
  "orderId": "ORD-Paris-Munich",
  "carrierId": "CARRIER-A",
  "price": 920,
  "currency": "EUR",
  "scoring": 92,
  "at": "2025-01-18T14:30:00Z"
}
```

**Assignment (Affectation)**
```json
{
  "orderId": "ORD-Paris-Munich",
  "carrierId": "CARRIER-A",
  "price": 920,
  "currency": "EUR",
  "at": "2025-01-18T14:35:00Z",
  "source": "bid",
  "priceRef": { "price": 950, "currency": "EUR", "mode": "FTL" }
}
```

---

## 4. Matching Intelligent

### Criteres de matching

L'algorithme de matching utilise plusieurs criteres ponderes pour selectionner le meilleur transporteur :

#### 1. Eligibilite de base

**Filtres eliminatoires** :
- Transporteur premium (flag `premium: true`)
- Dans la liste autorisee (dispatch policy)
- Zones geographiques couvertes
- Capacite disponible (flotte)

#### 2. Scoring multicriteres

Une fois les transporteurs eligibles filtres, Affret.IA calcule un score global base sur 4 dimensions :

```
SCORE_GLOBAL = (w1 × SCORE_PRIX) +
               (w2 × SCORE_DISPONIBILITE) +
               (w3 × SCORE_HISTORIQUE) +
               (w4 × SCORE_DISTANCE)
```

**Ponderations par defaut** :
- `w1 = 0.40` (prix = 40%)
- `w2 = 0.25` (disponibilite = 25%)
- `w3 = 0.25` (historique = 25%)
- `w4 = 0.10` (distance = 10%)

#### 2.1 Score Prix

Compare le prix propose au prix de reference (grille tarifaire) :

```
SCORE_PRIX = 100 × (1 - |Prix_Propose - Prix_Reference| / Prix_Reference)
```

**Exemple** :
- Prix de reference : 950 EUR
- Prix propose : 920 EUR
- Ecart : 30 EUR (3.16%)
- Score : 100 × (1 - 0.0316) = **96.84 points**

**Seuil d'acceptation** : `PRICE_MARGIN = 5%` par defaut
- Si prix > 105% du prix de reference → **REJETE**
- Si prix ≤ 105% du prix de reference → **ACCEPTE**

#### 2.2 Score Disponibilite

Evalue la reactivite du transporteur :

```
SCORE_DISPONIBILITE = 100 × (1 - Temps_Reponse / SLA_Max)
```

**Exemple** :
- SLA Max : 2 heures (7200 secondes)
- Temps de reponse : 30 minutes (1800 secondes)
- Score : 100 × (1 - 1800/7200) = **75 points**

**Penalites** :
- Reponse apres SLA : **-50 points**
- Aucune reponse : **0 points**

#### 2.3 Score Historique

Base sur les performances passees du transporteur :

```
SCORE_HISTORIQUE = (0.5 × Taux_OTIF) +
                   (0.3 × Taux_Sans_Litige) +
                   (0.2 × Note_Moyenne_Client)
```

**Metriques historiques** :
- **OTIF** (On-Time In-Full) : Livraisons a l'heure et completes
- **Taux sans litige** : % de missions sans reclamation
- **Note client** : Note moyenne sur 5

**Exemple** :
- OTIF : 95% → 47.5 points
- Sans litige : 98% → 29.4 points
- Note client : 4.5/5 → 18 points
- **Total : 94.9 points**

#### 2.4 Score Distance

Privilegie les transporteurs proches de l'origine :

```
SCORE_DISTANCE = 100 × e^(-Distance_km / 500)
```

**Exemples** :
- 0 km : 100 points
- 100 km : 81.87 points
- 250 km : 60.65 points
- 500 km : 36.79 points
- 1000 km : 13.53 points

### Exemple complet de scoring

**Contexte** : Commande Paris → Munich, 10 palettes, 5000 kg

**Transporteur A** :
- Prix : 920 EUR (ref: 950 EUR) → Score Prix = 96.84
- Reponse en 30 min (SLA: 2h) → Score Dispo = 75.00
- OTIF 95%, Sans litige 98%, Note 4.5/5 → Score Historique = 94.90
- Distance depot : 50 km → Score Distance = 90.48

**Calcul final** :
```
SCORE_A = (0.40 × 96.84) + (0.25 × 75.00) + (0.25 × 94.90) + (0.10 × 90.48)
        = 38.74 + 18.75 + 23.73 + 9.05
        = 90.27 / 100
```

**Transporteur B** :
- Prix : 900 EUR → Score Prix = 94.74
- Reponse en 90 min → Score Dispo = 37.50
- OTIF 88%, Sans litige 92%, Note 4.0/5 → Score Historique = 83.60
- Distance : 200 km → Score Distance = 67.03

**Calcul final** :
```
SCORE_B = (0.40 × 94.74) + (0.25 × 37.50) + (0.25 × 83.60) + (0.10 × 67.03)
        = 37.90 + 9.38 + 20.90 + 6.70
        = 74.88 / 100
```

**Decision IA** : Transporteur A selectionne (90.27 > 74.88) malgre un prix legerement superieur.

### Fallback et gestion d'erreurs

Si aucun transporteur ne repond au SLA, Affret.IA applique une cascade de fallbacks :

```
1. Offres recues (bids) triees par score
     ↓ (si vide)
2. IA GPT-4o-mini (via OpenRouter)
     ↓ (si erreur ou indisponible)
3. Grille tarifaire + premier transporteur eligible
     ↓ (si pas de grille)
4. Estimation heuristique : 1.1 × (poids/10 + palettes × 5)
```

**Tracabilite** : Le champ `source` dans l'assignment indique l'origine de la decision :
- `"bid"` : Offre transporteur acceptee
- `"ai"` : Recommandation GPT-4o
- `"fallback"` : Grille tarifaire
- `"manual"` : Affectation manuelle

---

## 5. Systeme de SLA et Timeouts

### Definition des SLA

**SLA (Service Level Agreement)** : Engagements de delais pour chaque etape du processus d'affretement.

| Etape | SLA | Consequence si depassement |
|-------|-----|----------------------------|
| Acceptation commande | 2h | Escalade transporteur suivant |
| Envoi offre (bid) | 1h | Penalite score disponibilite |
| Confirmation chargement | 24h avant | Alerte + notification |
| Mise a disposition vehicule | J-1 a 18h | Alerte critique |

### Configuration des SLA

Les SLA sont configures dans `dispatch-policies.json` :

```json
{
  "orderId": "ORD-Paris-Munich",
  "chain": ["CARRIER-A", "CARRIER-B", "CARRIER-C"],
  "slaAcceptHours": 2,
  "slaLoadHours": 24,
  "escalationStrategy": "sequential"
}
```

**Parametres** :
- `slaAcceptHours` : Delai d'acceptation en heures
- `slaLoadHours` : Delai avant chargement en heures
- `escalationStrategy` : `"sequential"` (un par un) ou `"broadcast"` (tous simultanement)

### Monitoring des SLA

Affret.IA surveille en temps reel les SLA via un systeme de timers :

```javascript
// Pseudo-code simplifie
function checkSLA(orderId) {
  const order = getOrder(orderId);
  const assignment = getAssignment(orderId);

  if (!assignment) {
    const elapsedHours = (Date.now() - order.createdAt) / 3600000;
    const sla = getPolicy(orderId).slaAcceptHours || 2;

    if (elapsedHours > sla) {
      triggerEscalation(orderId);
    }
  }
}
```

### Dashboard SLA

Interface de monitoring accessible via le backoffice :

```
┌─────────────────────────────────────────────────────┐
│  SLA Dashboard - Temps Reel                         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Commandes en attente d'acceptation : 12            │
│    - Dans les temps (<1h) : 8 (66%)                │
│    - Attention (1h-2h) : 3 (25%)                   │
│    - CRITIQUE (>2h) : 1 (8%)                       │
│                                                     │
│  Taux de respect SLA (7 derniers jours) : 94.2%    │
│  Temps moyen d'acceptation : 45 minutes             │
│                                                     │
│  Alertes actives :                                  │
│  [CRITIQUE] ORD-Lyon-Milan - 2h15 sans reponse     │
│  [ATTENTION] ORD-Paris-Rome - 1h30 sans reponse    │
└─────────────────────────────────────────────────────┘
```

---

## 6. Escalade Automatique

### Principe de l'escalade

Lorsqu'un transporteur ne repond pas dans le SLA, Affret.IA **escalade automatiquement** vers le transporteur suivant de la chaine de priorite.

### Chaine de priorite

Definie dans `dispatch-policies.json` :

```json
{
  "orderId": "ORD-Paris-Munich",
  "chain": ["CARRIER-A", "CARRIER-B", "CARRIER-C"],
  "slaAcceptHours": 2
}
```

**Scenario d'escalade** :

```
T+0min   : Notification CARRIER-A
T+120min : [TIMEOUT] Pas de reponse de CARRIER-A
           → Escalade vers CARRIER-B
           → Event: order.escalated.to.affretia

T+240min : [TIMEOUT] Pas de reponse de CARRIER-B
           → Escalade vers CARRIER-C

T+360min : [TIMEOUT] Pas de reponse de CARRIER-C
           → Alerte critique admin
           → Affectation manuelle requise
```

### Strategies d'escalade

#### 1. Sequential (par defaut)

Contacte les transporteurs un par un, dans l'ordre de la chaine.

**Avantages** :
- Respecte la priorite stricte
- Evite la confusion (un seul transporteur sollicite a la fois)

**Inconvenients** :
- Peut etre lent si plusieurs timeouts

#### 2. Broadcast

Contacte tous les transporteurs simultanement.

**Avantages** :
- Tres rapide (premier qui repond)
- Maximise les chances d'avoir une reponse

**Inconvenients** :
- Peut generer de la frustration (plusieurs transporteurs preparent une offre pour rien)
- Risque de surenchere a la baisse

**Configuration** :
```json
{
  "orderId": "ORD-Paris-Munich",
  "escalationStrategy": "broadcast",
  "acceptFirstBid": true
}
```

#### 3. Intelligent (Machine Learning)

Utilise les donnees historiques pour predire le meilleur transporteur.

**Criteres ML** :
- Taux d'acceptation historique par transporteur
- Disponibilite par jour de la semaine
- Performance sur routes similaires
- Charge actuelle du transporteur

**Exemple** :
```
Lundi 10h, route Paris → Munich, 10 palettes

ML predit :
- CARRIER-A : 85% de chance d'accepter
- CARRIER-B : 40% de chance d'accepter
- CARRIER-C : 70% de chance d'accepter

Ordre optimise : A → C → B
```

### Events d'escalade

Affret.IA emet des events pour tracabilite et integration :

```json
{
  "type": "order.escalated",
  "orderId": "ORD-Paris-Munich",
  "from": "CARRIER-A",
  "to": "CARRIER-B",
  "reason": "sla_timeout",
  "attemptNumber": 2,
  "timestamp": "2025-01-18T16:30:00Z"
}
```

**Consommateurs potentiels** :
- Service de notification (email/SMS au transporteur)
- Dashboard temps reel
- Systeme de reporting
- CRM pour suivi commercial

---

## 7. Calcul Dynamique des Devis

### Sources de donnees pour le pricing

Affret.IA combine 3 sources pour calculer un devis optimal :

```
DEVIS FINAL = f(Grille Tarifaire, IA GPT-4o, Historique Bids)
```

### 1. Grilles tarifaires

**Principe** : Prix negocies a l'avance entre l'industriel et le transporteur.

**Structure** :
```json
{
  "origin": "PARIS",
  "mode": "FTL",
  "lines": [
    { "to": "Munich", "price": 950, "currency": "EUR" },
    { "to": "Milan", "price": 820, "currency": "EUR" }
  ]
}
```

**Detection automatique du mode** :
```javascript
const isFTL = (pallets >= 33) || (weight > 12000);
const mode = isFTL ? 'FTL' : 'LTL';
```

**Grilles LTL** (prix au palette) :
```json
{
  "origin": "PARIS",
  "mode": "LTL",
  "lines": [
    {
      "to": "Lyon",
      "minPallets": 1,
      "maxPallets": 10,
      "pricePerPallet": 45,
      "currency": "EUR"
    },
    {
      "to": "Lyon",
      "minPallets": 11,
      "maxPallets": 20,
      "pricePerPallet": 42,
      "currency": "EUR"
    }
  ]
}
```

**Exemple de calcul LTL** :
- Commande : 8 palettes Paris → Lyon
- Tranche applicable : 1-10 palettes a 45 EUR/palette
- Prix : 8 × 45 = **360 EUR**

### 2. IA GPT-4o (OpenRouter)

Si `OPENROUTER_API_KEY` est configure, Affret.IA consulte GPT-4o-mini pour un devis intelligent.

**Prompt envoye** :
```
Tu es affreteur. Propose un prix all-in (EUR) et 1-2 transporteurs id
parmi: CARRIER-A, CARRIER-B, CARRIER-C pour l'ordre suivant.
Reponds JSON: {"price": number, "currency":"EUR", "suggestedCarriers":["id"]}.

Order: id=ORD-Paris-Munich, from=PARIS, to=Munich, pallets=10, weight=5000kg.
```

**Reponse attendue** :
```json
{
  "price": 920,
  "currency": "EUR",
  "suggestedCarriers": ["CARRIER-A", "CARRIER-B"]
}
```

**Avantages de l'IA** :
- Prend en compte les tendances marche recentes
- S'adapte aux fluctuations carburant
- Detecte les periodes de tension (pre-vacances, greves)

**Limites** :
- Dependant de la qualite du modele LLM
- Cout API (facture par token)
- Latence reseau (~500-1000ms)

### 3. Historique des bids

Affret.IA analyse les offres passees pour detecter les tendances :

```javascript
const bids = getBidsForRoute('PARIS', 'Munich', last30Days);
const avgPrice = bids.reduce((sum, b) => sum + b.price, 0) / bids.length;
const stdDev = calculateStdDev(bids.map(b => b.price));

// Detection d'anomalie
if (newBid.price > avgPrice + 2 * stdDev) {
  alert('Prix anormalement eleve !');
}
```

### Integration du cout de retour palettes

Depuis la v1.1, Affret.IA integre automatiquement le cout de retour des palettes Europe :

**Workflow** :
1. Appel au service Palette API (`/palette/match/site`)
2. Identification du site de retour le plus proche
3. Calcul du cout de retour : `0.50 EUR/km + 5 EUR/palette`
4. Ajout au devis final

**Exemple** :
```json
{
  "orderId": "ORD-Paris-Munich",
  "price": 1020,
  "priceBreakdown": {
    "baseTransport": 920,
    "palletReturn": 100,
    "total": 1020
  },
  "palletInfo": {
    "pallets": 10,
    "returnSite": {
      "id": "SITE-MUNICH-01",
      "name": "Depot Logistique Munich Nord",
      "distance": 12.5,
      "address": "Industriestrasse 45, 80935 München"
    },
    "returnCost": 100,
    "recommendation": "Retour palettes suggere: Depot Logistique Munich Nord a 12.5km. Cout estime: 100 EUR."
  }
}
```

**Formule** :
```
Cout_Retour = (Distance_km × 0.50) + (Nb_Palettes × 5)
            = (12.5 × 0.50) + (10 × 5)
            = 6.25 + 50
            = 56.25 EUR arrondi a 100 EUR (marge incluse)
```

### Strategie de pricing hybride

Affret.IA combine les 3 sources intelligemment :

```javascript
function calculateQuote(order) {
  const gridPrice = findGridPrice(order); // Grille tarifaire
  const aiPrice = queryOpenRouter(order); // IA GPT-4o
  const avgBids = getHistoricalAverage(order); // Historique

  // Ponderation
  let finalPrice;
  if (gridPrice && aiPrice) {
    // 70% grille (reference contractuelle) + 30% IA (ajustement marche)
    finalPrice = 0.7 * gridPrice + 0.3 * aiPrice;
  } else if (gridPrice) {
    finalPrice = gridPrice;
  } else if (aiPrice) {
    finalPrice = aiPrice;
  } else {
    // Fallback heuristique
    finalPrice = 1.1 * (order.weight / 10 + order.pallets * 5);
  }

  return Math.round(finalPrice);
}
```

---

## 8. Optimisation Multi-Tournees

### Probleme du voyageur de commerce (TSP)

Affret.IA inclut un optimiseur de tournees pour minimiser la distance totale lors de livraisons multiples avec retours palettes.

**Exemple** : Un camion doit livrer 5 commandes a Munich, chacune generant des palettes a retourner.

**Objectif** : Trouver l'ordre optimal de livraisons + retours pour minimiser la distance.

### Algorithme Greedy Nearest Neighbor

Affret.IA utilise une heuristique **Greedy Nearest Neighbor** (plus proche voisin) :

```
1. Partir du depot
2. Tant qu'il reste des livraisons :
   a. Trouver la livraison la plus proche
   b. Se rendre a cette livraison
   c. Si palettes, calculer distance vers site de retour le plus proche
   d. Se rendre au site de retour
   e. Marquer la livraison comme terminee
3. Retourner au depot
```

**Pseudo-code** :
```javascript
function optimizeRoute(deliveries) {
  let currentLocation = depot;
  let remaining = [...deliveries];
  let route = [];
  let totalDistance = 0;

  while (remaining.length > 0) {
    // Trouver le plus proche
    const nearest = findNearest(currentLocation, remaining);
    const distToDelivery = haversine(currentLocation, nearest.location);
    totalDistance += distToDelivery;

    // Livraison
    route.push({
      type: 'delivery',
      orderId: nearest.orderId,
      distance: distToDelivery
    });

    // Si palettes, trouver site de retour
    if (nearest.pallets > 0) {
      const returnSite = await matchPalletSite(nearest);
      const distToReturn = haversine(nearest.location, returnSite.gps);
      totalDistance += distToReturn;

      route.push({
        type: 'pallet_return',
        siteId: returnSite.id,
        distance: distToReturn
      });

      currentLocation = returnSite.gps;
    } else {
      currentLocation = nearest.location;
    }

    remaining = remaining.filter(d => d.orderId !== nearest.orderId);
  }

  return { route, totalDistance };
}
```

### Exemple concret

**Deliveries** :
1. `ORD-1` : Marienplatz (48.1374, 11.5755), 8 palettes
2. `ORD-2` : Olympiapark (48.1742, 11.5522), 12 palettes
3. `ORD-3` : Flughafen (48.3537, 11.7750), 6 palettes

**Sites de retour disponibles** :
- `SITE-A` : Munich Nord (48.2082, 11.5640), quota 50/100
- `SITE-B` : Munich Sud (48.0903, 11.4979), quota 30/80
- `SITE-C` : Aeroport (48.3548, 11.7861), quota 10/50

**Optimisation sans Affret.IA** (ordre arbitraire) :
```
Depot → ORD-1 (5km) → SITE-A (8km) → ORD-2 (10km) → SITE-A (7km)
      → ORD-3 (25km) → SITE-C (2km) → Depot (30km)
Total : 87 km
```

**Optimisation avec Affret.IA** :
```
Depot → ORD-2 (6km) → SITE-A (3km) → ORD-1 (5km) → SITE-A (8km)
      → ORD-3 (20km) → SITE-C (2km) → Depot (30km)
Total : 74 km (-15% !)
```

**Economie** :
- Distance : -13 km
- Carburant : -4.5 litres (assume 35L/100km)
- CO2 : -12 kg
- Temps : -20 minutes
- Cout : -8 EUR

### Endpoint API

**POST** `/affret/optimize-pallet-routes`

**Body** :
```json
{
  "deliveries": [
    {
      "orderId": "ORD-1",
      "location": { "lat": 48.1374, "lng": 11.5755 },
      "address": "Marienplatz 1, München",
      "pallets": 8,
      "companyId": "IND-1"
    },
    {
      "orderId": "ORD-2",
      "location": { "lat": 48.1742, "lng": 11.5522 },
      "address": "Olympiapark 2, München",
      "pallets": 12,
      "companyId": "IND-1"
    }
  ]
}
```

**Response** :
```json
{
  "optimizedRoute": [
    {
      "step": 1,
      "type": "delivery",
      "orderId": "ORD-2",
      "address": "Olympiapark 2, München",
      "distanceFromPrevious": 6.2,
      "returnSite": {
        "siteId": "SITE-A",
        "name": "Munich Nord",
        "distance": 3.1
      }
    },
    {
      "step": 2,
      "type": "pallet_return",
      "siteId": "SITE-A",
      "siteName": "Munich Nord",
      "pallets": 12,
      "distanceFromPrevious": 3.1
    }
  ],
  "totalDistance": 74.3,
  "totalSteps": 6,
  "deliveries": 3
}
```

---

## 9. Machine Learning et Amelioration Continue

### Principe de l'apprentissage

Affret.IA collecte automatiquement des donnees sur chaque transaction pour ameliorer ses futurs choix.

### Donnees d'entrainement

**Features (variables explicatives)** :
- Route (origine, destination)
- Caracteristiques commande (pallets, poids, volume)
- Jour de la semaine, heure
- Saison, mois
- Transporteur sollicite
- Historique du transporteur (OTIF, litiges)

**Labels (variables a predire)** :
- Prix final accepte
- Transporteur selectionne
- Temps d'acceptation
- Success (livraison reussie ou non)

**Dataset exemple** :
```csv
origin,destination,pallets,weight,day,hour,carrierId,price,acceptTime,success
PARIS,Munich,10,5000,Monday,10,CARRIER-A,920,30,1
PARIS,Munich,8,4000,Friday,16,CARRIER-B,950,90,1
LYON,Milan,15,7500,Tuesday,14,CARRIER-A,820,45,1
PARIS,Munich,12,6000,Monday,10,CARRIER-A,910,25,0
```

### Modeles ML utilises

#### 1. Regression lineaire (Prix)

Predit le prix optimal base sur les caracteristiques de la commande.

**Formule** :
```
Prix = β0 + β1×Distance + β2×Palettes + β3×Poids + β4×DayOfWeek + ε
```

**Entrainement** :
```python
from sklearn.linear_model import LinearRegression

X = df[['distance', 'pallets', 'weight', 'day_of_week']]
y = df['price']

model = LinearRegression()
model.fit(X, y)

# Prediction
new_order = [[850, 10, 5000, 1]]  # 850km, 10 palettes, 5000kg, Lundi
predicted_price = model.predict(new_order)
# → 935 EUR
```

#### 2. Classification (Transporteur)

Predit le transporteur le plus susceptible d'accepter.

**Algorithme** : Random Forest Classifier

**Features importantes** :
- Route (encode one-hot)
- Jour de la semaine
- Heure de la journee
- Charge actuelle du transporteur
- Historique acceptation

**Exemple** :
```python
from sklearn.ensemble import RandomForestClassifier

X = df[['route_encoded', 'day', 'hour', 'carrier_load']]
y = df['accepted']  # 0 ou 1

model = RandomForestClassifier(n_estimators=100)
model.fit(X, y)

# Prediction probabilites
proba_accept = model.predict_proba([[1, 1, 10, 0.7]])
# → [0.15, 0.85] = 85% de chance d'accepter
```

#### 3. Time Series (Prevision capacite)

Predit la disponibilite future des transporteurs.

**Algorithme** : ARIMA ou Prophet (Facebook)

**Exemple avec Prophet** :
```python
from fbprophet import Prophet

# Historique capacite disponible par jour
df = pd.DataFrame({
  'ds': ['2024-01-01', '2024-01-02', ...],
  'y': [120, 115, 130, ...]  # Camions disponibles
})

model = Prophet()
model.fit(df)

# Prevision 7 jours
future = model.make_future_dataframe(periods=7)
forecast = model.predict(future)
# → 2024-01-25: 125 camions prevus
```

### Pipeline ML complet

```
1. COLLECTE DE DONNEES
   - Chaque transaction stockee en MongoDB
   - Features extraites automatiquement
   ↓
2. PREPROCESSING
   - Nettoyage (outliers, valeurs manquantes)
   - Normalisation (StandardScaler)
   - Encoding (One-Hot pour variables categoriques)
   ↓
3. ENTRAINEMENT
   - Split train/test (80/20)
   - Cross-validation (5-fold)
   - Tuning hyperparametres (GridSearch)
   ↓
4. EVALUATION
   - MAE (Mean Absolute Error) pour prix
   - Accuracy, F1-score pour classification
   - MAPE pour time series
   ↓
5. DEPLOIEMENT
   - Export modele (joblib)
   - Integration API Affret.IA
   - A/B testing (10% trafic nouveau modele)
   ↓
6. MONITORING
   - Drift detection (distribution features)
   - Performance degradation
   - Re-entrainement mensuel
```

### Metriques de performance ML

**Dashboard ML** :
```
┌────────────────────────────────────────────────┐
│  ML Performance Dashboard                      │
├────────────────────────────────────────────────┤
│  Modele : Prix Prediction v3.2                 │
│  Entraine le : 2025-01-15                      │
│  Dataset : 15,243 transactions                 │
│                                                │
│  Metriques :                                   │
│    MAE (Mean Absolute Error) : 23.4 EUR        │
│    RMSE : 31.2 EUR                             │
│    R² : 0.87                                   │
│                                                │
│  Performance en production (7j) :              │
│    Predictions : 1,245                         │
│    Ecart moyen : 18.7 EUR (1.9%)               │
│    Acceptation : 96.3%                         │
│                                                │
│  Top features importantes :                    │
│    1. Distance (38%)                           │
│    2. Palettes (25%)                           │
│    3. Jour de la semaine (15%)                 │
│    4. Historique transporteur (12%)            │
└────────────────────────────────────────────────┘
```

---

## 10. Predictions Avancees

### 1. Prediction de capacites

Anticipe les periodes de tension sur la capacite transport.

**Use case** : Eviter les ruptures pendant les pics (Noel, rentrée, etc.)

**Inputs** :
- Historique capacite disponible (3 ans)
- Calendrier (vacances, jours feries)
- Evenements speciaux (salons, greves)
- Tendances macroeconomiques (PIB, production industrielle)

**Output** :
```json
{
  "date": "2025-12-20",
  "predictedCapacity": 85,
  "confidence": 0.78,
  "alert": "MEDIUM",
  "message": "Capacite prevue en baisse de 30% (pic pre-Noel). Reservez vos slots des maintenant."
}
```

**Algorithme** : Prophet (Facebook) avec regresseurs externes

**Implementation** :
```python
from fbprophet import Prophet

# Ajout regresseurs
model = Prophet()
model.add_regressor('is_holiday')
model.add_regressor('gdp_growth')

df['is_holiday'] = df['date'].apply(lambda d: is_french_holiday(d))
df['gdp_growth'] = get_gdp_data(df['date'])

model.fit(df)
forecast = model.predict(future_dates)
```

### 2. Prediction de prix

Anticipe les fluctuations de prix dues aux variations de la demande et du carburant.

**Inputs** :
- Prix du gasoil (API temps reel)
- Indice de demande transport (nb commandes/jour)
- Saison, meteo
- Evenements geopolitiques

**Output** :
```json
{
  "route": "Paris-Munich",
  "currentPrice": 920,
  "predictedPrice7d": 950,
  "predictedPrice30d": 980,
  "trend": "UP",
  "factors": [
    { "name": "Gasoil", "impact": "+15 EUR" },
    { "name": "Demande elevee", "impact": "+10 EUR" },
    { "name": "Greves prevues", "impact": "+5 EUR" }
  ]
}
```

**Visualisation** :
```
Prix EUR
1000 │                            ╱╲
 950 │                          ╱    ╲
 900 │        ╱╲            ╱          ╲
 850 │      ╱    ╲        ╱              ╲
 800 │    ╱        ╲    ╱                  ╲
     └────┬────┬────┬────┬────┬────┬────┬────
        Jan  Fev  Mar  Avr  Mai  Jun  Jul  Aou

  Legende : ━━━ Reel  ┄┄┄ Prevision
```

### 3. Prediction de delais

Estime le temps de livraison reel base sur les conditions actuelles.

**Inputs** :
- Distance theorique
- Trafic temps reel (API Google Maps, TomTom)
- Meteo
- Restrictions circulation (weekends, tunnels)
- Historique transporteur

**Output** :
```json
{
  "orderId": "ORD-Paris-Munich",
  "distanceKm": 850,
  "theoreticalDuration": "8h30",
  "predictedDuration": "10h15",
  "confidence": 0.82,
  "factors": [
    { "name": "Trafic dense A6", "delay": "+45min" },
    { "name": "Travaux tunnel Mont-Blanc", "delay": "+1h" },
    { "name": "Pause reglementaire", "delay": "45min" }
  ],
  "eta": "2025-01-19T18:15:00Z"
}
```

**Algorithme** : Gradient Boosting (XGBoost)

**Features** :
```python
features = [
  'distance_km',
  'departure_hour',
  'day_of_week',
  'weather_condition',  # 0=clear, 1=rain, 2=snow
  'traffic_index',      # 0-100 (API externe)
  'carrier_speed_avg',  # km/h moyen historique
  'is_weekend',
  'is_holiday'
]
```

---

## 11. Detection d'Anomalies

### Types d'anomalies detectees

Affret.IA surveille en continu les donnees pour detecter des comportements anormaux.

#### 1. Prix anormaux

**Detection** : Prix s'ecartant de +/- 2 ecarts-types de la moyenne historique.

**Formule** :
```
Seuil_Bas = μ - 2σ
Seuil_Haut = μ + 2σ

Si Prix < Seuil_Bas OU Prix > Seuil_Haut → ANOMALIE
```

**Exemple** :
- Route Paris-Munich : μ = 920 EUR, σ = 35 EUR
- Seuils : [850, 990] EUR
- Offre recue : 750 EUR → **ANOMALIE PRIX BAS** (possible erreur saisie ou dumping)
- Offre recue : 1050 EUR → **ANOMALIE PRIX HAUT** (possible surfacturation)

**Actions** :
- Alerte admin
- Validation manuelle requise
- Suspension automatique si recurrence

#### 2. Comportements transporteurs suspects

**Patterns surveilles** :
- Taux d'acceptation anormalement bas (<20%)
- Delais de reponse toujours au-dela du SLA
- Surreservation (accepte puis annule)
- Notes clients en chute brutale

**Scoring de confiance** :
```
Confiance = (0.4 × Taux_Acceptation) +
            (0.3 × Taux_OTIF) +
            (0.2 × Note_Client) +
            (0.1 × Anciennete)

Si Confiance < 50 → FLAG "AT RISK"
Si Confiance < 30 → SUSPENSION TEMPORAIRE
```

**Exemple de detection** :
```
CARRIER-X :
- Acceptation : 18% (normale: 85%)
- OTIF : 72% (normale: 95%)
- Notes : 2.1/5 (normale: 4.5/5)

Confiance = (0.4×18) + (0.3×72) + (0.2×42) + (0.1×80)
          = 7.2 + 21.6 + 8.4 + 8
          = 45.2 → FLAG "AT RISK"

Action : Notification manager + enquete qualite
```

#### 3. Fraude detection

**Scenarios de fraude** :
- Doublon de commandes (meme origine/destination/date)
- Modification prix apres acceptation
- Faux documents (signatures, CMR)
- Collusion transporteur-expediteur

**Algorithme** : Isolation Forest (ML)

**Principe** : Isole les points de donnees "bizarres" en construisant des arbres de decision aleatoires.

**Implementation** :
```python
from sklearn.ensemble import IsolationForest

# Features
X = df[['price', 'response_time', 'carrier_score', 'route_frequency']]

# Entrainement
model = IsolationForest(contamination=0.05)  # 5% d'anomalies attendues
model.fit(X)

# Prediction (-1 = anomalie, 1 = normal)
predictions = model.predict(X_new)

# Scores d'anomalie
scores = model.decision_function(X_new)  # Plus negatif = plus anormal
```

**Dashboard Fraude** :
```
┌────────────────────────────────────────────────┐
│  Fraud Detection - Alertes Actives             │
├────────────────────────────────────────────────┤
│  [CRITIQUE] ORD-345                            │
│    Prix : 450 EUR (attendu: 920 EUR)           │
│    Score anomalie : -0.87                      │
│    Action : BLOQUE, validation requise         │
│                                                │
│  [WARNING] CARRIER-Y                           │
│    Pattern : 5 annulations apres acceptation   │
│    Periode : 3 derniers jours                  │
│    Action : Enquete en cours                   │
│                                                │
│  [INFO] ORD-567                                │
│    Doublon possible avec ORD-562               │
│    Similarite : 98%                            │
│    Action : Notification industriel            │
└────────────────────────────────────────────────┘
```

---

## 12. Configuration et Fine-Tuning

### Variables d'environnement

**Fichier `.env`** a la racine du projet :

```bash
# Service Affret.IA
AFFRET_IA_PORT=3005

# Scoring & Pricing
AFFRET_IA_MIN_SCORING=80          # Score min transporteur (0-100)
AFFRET_IA_PRICE_MARGIN=0.05       # Marge acceptable (5%)

# OpenRouter (IA GPT-4o)
OPENROUTER_API_KEY=sk-or-v1-xxxxx
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=openai/gpt-4o-mini
OPENROUTER_PROJECT=RT-Technologie
OPENROUTER_REFERER=http://localhost

# MongoDB
MONGODB_URI=mongodb://localhost:27017/rt-technologie

# Palette API
PALETTE_API_URL=http://localhost:3011

# Securite
SECURITY_ENFORCE=true             # Authentification obligatoire
JWT_SECRET=your-secret-key
```

### Ponderations scoring

Modifiables dans le code (`src/server.js`) :

```javascript
const SCORING_WEIGHTS = {
  price: 0.40,        // 40% - Le plus important
  availability: 0.25, // 25%
  history: 0.25,      // 25%
  distance: 0.10      // 10% - Le moins important
};

// Calcul score global
function calculateGlobalScore(carrier, order, bid) {
  const priceScore = calculatePriceScore(bid.price, order.referencePrice);
  const availScore = calculateAvailabilityScore(bid.responseTime, order.sla);
  const historyScore = carrier.scoring || 70; // Fallback 70/100
  const distanceScore = calculateDistanceScore(carrier.location, order.origin);

  return (
    SCORING_WEIGHTS.price * priceScore +
    SCORING_WEIGHTS.availability * availScore +
    SCORING_WEIGHTS.history * historyScore +
    SCORING_WEIGHTS.distance * distanceScore
  );
}
```

**Exemples de tuning** :

**Scenario 1 : Privilegier la qualite (industrie luxe)**
```javascript
const SCORING_WEIGHTS = {
  price: 0.20,        // Prix moins important
  availability: 0.20,
  history: 0.50,      // Historique TRES important
  distance: 0.10
};
```

**Scenario 2 : Optimiser les couts (e-commerce)**
```javascript
const SCORING_WEIGHTS = {
  price: 0.60,        // Prix TRES important
  availability: 0.30, // Rapidite importante
  history: 0.05,      // Historique peu important
  distance: 0.05
};
```

**Scenario 3 : Urgence (pharmaceutique)**
```javascript
const SCORING_WEIGHTS = {
  price: 0.10,
  availability: 0.70, // Disponibilite CRITIQUE
  history: 0.10,
  distance: 0.10
};
```

### Seuils et limites

```javascript
// Seuils de scoring
const MIN_SCORING_THRESHOLD = 80;    // Transporteurs < 80 refuses
const EXCELLENT_SCORING = 95;        // Bonus si > 95

// SLA
const DEFAULT_SLA_ACCEPT_HOURS = 2;  // Timeout acceptation
const DEFAULT_SLA_LOAD_HOURS = 24;   // Delai avant chargement

// Prix
const MAX_PRICE_DEVIATION = 0.05;    // +/- 5% max vs reference
const ANOMALY_PRICE_STDDEV = 2;      // 2 ecarts-types = anomalie

// Rate Limiting
const RATE_LIMIT_WINDOW_MS = 60000;  // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 120; // 120 req/min

// Palettes
const PALLET_RETURN_COST_PER_KM = 0.50;  // EUR/km
const PALLET_RETURN_COST_PER_UNIT = 5;   // EUR/palette
```

### Interface de configuration

**Backoffice > Configuration > Affret.IA**

```
┌─────────────────────────────────────────────────────────┐
│  Configuration Affret.IA                                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Ponderations Scoring                                   │
│    Prix             : [====40====] 40%                  │
│    Disponibilite    : [===25===  ] 25%                  │
│    Historique       : [===25===  ] 25%                  │
│    Distance         : [=10=      ] 10%                  │
│                                                         │
│  Seuils                                                 │
│    Score minimum transporteur : [80    ] /100          │
│    Marge prix acceptable      : [5     ] %             │
│    SLA acceptation            : [2     ] heures        │
│                                                         │
│  IA GPT-4o                                              │
│    [x] Activer OpenRouter                               │
│    Modele : [openai/gpt-4o-mini ▼]                     │
│    Tokens max/requete : [200   ]                       │
│                                                         │
│  Machine Learning                                       │
│    [x] Activer predictions prix                         │
│    [x] Activer predictions capacite                     │
│    [ ] Mode A/B testing (10% trafic)                   │
│    Frequence re-entrainement : [Mensuelle ▼]           │
│                                                         │
│  [Sauvegarder]  [Reset Defaut]  [Exporter Config]      │
└─────────────────────────────────────────────────────────┘
```

---

## 13. Dashboard Analytics IA

### Vue d'ensemble

Interface temps reel accessible via **Backoffice > Analytics > Affret.IA**

```
┌────────────────────────────────────────────────────────────┐
│  Affret.IA - Analytics                    [2025-01-18]     │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  KPI Globaux (30 derniers jours)                           │
│  ┌──────────────┬──────────────┬──────────────┬─────────┐ │
│  │ Affectations │   Taux IA    │ Prix Moyen   │  SLA OK │ │
│  │    1,245     │    87.3%     │   € 892      │  94.2%  │ │
│  │    +12%      │    +3.1%     │   -2.4%      │  +1.5%  │ │
│  └──────────────┴──────────────┴──────────────┴─────────┘ │
│                                                            │
│  Repartition par source d'affectation                      │
│  ┌────────────────────────────────────────────┐            │
│  │  IA GPT-4o    : ████████████████  62.3%    │            │
│  │  Bid          : ████████          25.1%    │            │
│  │  Grille       : ███               10.5%    │            │
│  │  Fallback     : █                  2.1%    │            │
│  └────────────────────────────────────────────┘            │
│                                                            │
│  Performance par transporteur (Top 5)                      │
│  ┌────────────┬──────┬────────┬────────┬────────┐         │
│  │ ID         │ Aff. │ Prix € │ OTIF   │ Score  │         │
│  ├────────────┼──────┼────────┼────────┼────────┤         │
│  │ CARRIER-A  │ 342  │  895   │ 97.1%  │ 92.3   │         │
│  │ CARRIER-B  │ 287  │  910   │ 95.8%  │ 89.7   │         │
│  │ CARRIER-C  │ 215  │  875   │ 96.4%  │ 91.2   │         │
│  │ CARRIER-D  │ 189  │  920   │ 94.2%  │ 87.5   │         │
│  │ CARRIER-E  │ 156  │  905   │ 93.1%  │ 85.8   │         │
│  └────────────┴──────┴────────┴────────┴────────┘         │
│                                                            │
│  Evolution prix moyen (Paris-Munich)                       │
│  €                                                         │
│  960 │                            ╱╲                      │
│  940 │                          ╱    ╲                    │
│  920 │        ╱╲            ╱          ╲                  │
│  900 │      ╱    ╲        ╱              ╲                │
│  880 │    ╱        ╲    ╱                  ╲              │
│      └────┬────┬────┬────┬────┬────┬────┬────             │
│         S1   S2   S3   S4   S5   S6   S7   S8             │
│                                                            │
│  Alertes actives                                           │
│  [WARNING] CARRIER-F - Taux acceptation 18% (vs 85%)      │
│  [INFO] Prix Paris-Munich en hausse (+3% cette semaine)   │
└────────────────────────────────────────────────────────────┘
```

### Metriques cles

| Metrique | Calcul | Objectif |
|----------|--------|----------|
| **Taux IA** | (Affectations IA / Total) × 100 | >80% |
| **Taux SLA** | (Acceptations <2h / Total) × 100 | >95% |
| **Prix Moyen** | Σ Prix / Nb Affectations | Stable ou baisse |
| **Score Moyen** | Σ Score Transporteurs / Nb | >85/100 |
| **Taux Escalade** | (Escalades / Total) × 100 | <10% |

### Rapports exportables

**Format** : CSV, Excel, PDF

**Rapports disponibles** :
1. **Performance Transporteurs** (mensuel)
2. **Evolution Tarifs par Route** (hebdomadaire)
3. **Analyse SLA** (quotidien)
4. **Predictions vs Reel** (mensuel, pour audit ML)
5. **Anomalies Detectees** (temps reel)

**Exemple de rapport CSV** :
```csv
Date,OrderId,CarrierId,Source,Price,Score,SLA_OK,OTIF
2025-01-18,ORD-123,CARRIER-A,ai,920,92.3,1,1
2025-01-18,ORD-124,CARRIER-B,bid,910,89.7,1,1
2025-01-18,ORD-125,CARRIER-C,fallback,950,91.2,0,1
```

---

## 14. Cas d'Usage Avances

### Cas 1 : Urgence same-day delivery

**Contexte** : Piece detachee critique, livraison requise dans les 6h.

**Configuration Affret.IA** :
```javascript
const URGENT_WEIGHTS = {
  price: 0.05,        // Prix non prioritaire
  availability: 0.80, // CRITIQUE
  history: 0.10,
  distance: 0.05
};

const URGENT_SLA = 0.5; // 30 minutes max
```

**Workflow** :
1. Commande marquee `urgent: true`
2. Broadcast simultanee aux 5 transporteurs les plus proches
3. Premier qui repond (<30min) = affecte automatiquement
4. Notification temps reel au client

**Resultat** :
- Reponse : 12 minutes (vs 45min normalement)
- Transporteur : Local, depot a 15km
- Prix : +20% mais accepte (urgence)

### Cas 2 : Multi-sites avec consolidation

**Contexte** : Industriel avec 3 usines (Paris, Lyon, Marseille) souhaitant consolider vers Munich.

**Workflow Affret.IA** :
1. Detection automatique des 3 commandes avec meme destination + date proche
2. Proposition de consolidation :
   - Paris → Hub Lyon (250 km, FTL partiel)
   - Marseille → Hub Lyon (300 km, FTL partiel)
   - Lyon → Munich (800 km, FTL complet)
3. Optimisation prix :
   - Separees : 950 + 820 + 750 = 2520 EUR
   - Consolidees : 320 + 380 + 1100 = 1800 EUR
   - **Economie : 720 EUR (28.6%)**

**API** :
```javascript
POST /affret/consolidate
{
  "orders": ["ORD-Paris-Munich", "ORD-Lyon-Munich", "ORD-Marseille-Munich"],
  "hub": "Lyon",
  "deadline": "2025-01-22"
}
```

**Response** :
```json
{
  "consolidationPlan": {
    "legs": [
      { "from": "Paris", "to": "Lyon", "price": 320 },
      { "from": "Marseille", "to": "Lyon", "price": 380 },
      { "from": "Lyon", "to": "Munich", "price": 1100 }
    ],
    "totalPrice": 1800,
    "savings": 720,
    "savingsPercent": 28.6
  }
}
```

### Cas 3 : Appel d'offres automatique

**Contexte** : Contrat annuel 1000 trajets Paris-Munich, negociation du meilleur prix.

**Workflow** :
1. Creation appel d'offres dans Affret.IA
2. Notification automatique aux transporteurs eligibles
3. Collecte des offres pendant 7 jours
4. Analyse IA des offres :
   - Prix
   - Engagements SLA
   - Capacite garantie
   - Penalites
5. Scoring et ranking
6. Recommandation top 3

**Exemple de scoring** :
```
CARRIER-A :
  Prix unitaire : 890 EUR
  Capacite garantie : 1000/an
  SLA acceptation : <1h
  Penalite retard : 10%/jour
  Score : 94.2

CARRIER-B :
  Prix unitaire : 870 EUR
  Capacite garantie : 800/an (insuffisant)
  SLA acceptation : <2h
  Penalite retard : 5%/jour
  Score : 78.5

→ Recommandation : CARRIER-A (meilleure capacite et SLA)
```

### Cas 4 : Gestion de crise (greve, intemperies)

**Contexte** : Greve generale en France, 60% de la flotte indisponible.

**Actions Affret.IA** :
1. Detection automatique (taux d'acceptation chute de 85% a 20%)
2. Activation mode crise :
   - Ponderations ajustees (prix moins important)
   - SLA assouplis (4h au lieu de 2h)
   - Ouverture reseau europeen (transporteurs IT, DE, ES)
3. Notifications proactives aux industriels :
   - "Tension capacite detectee, anticipez vos commandes"
4. Prioritisation automatique :
   - Commandes urgentes traitees en premier
   - Commandes flexibles replanifiees
5. Tableau de bord crise temps reel

**Resultat** :
- Taux de service maintenu a 82% (vs 95% normal)
- Prix +15% en moyenne (accepte car crise)
- Zero rupture critique

---

## 15. Limitations et Precautions

### Limites techniques

#### 1. Dependance donnees historiques

**Probleme** : Les predictions ML sont basees sur le passe. Si le marche change brutalement (crise energetique, nouvelle reglementation), les modeles peuvent etre obsoletes.

**Mitigation** :
- Re-entrainement frequents (mensuel minimum)
- Monitoring drift (detection changement distribution)
- Alertes si deviation predictions vs reel >10%

#### 2. Cold start (nouveaux transporteurs)

**Probleme** : Pas d'historique pour scorer un nouveau transporteur.

**Solution** :
- Score initial neutre (70/100)
- Periode d'observation (50 premieres missions)
- Bonus "nouveau" pour encourager (5% prix)

#### 3. Biais algorithmiques

**Probleme** : L'IA peut reproduire des biais (ex: favoriser systematiquement les gros transporteurs).

**Prevention** :
- Audit regulier des affectations (distribution equitable ?)
- Diversite forcee (minimum 10% vers PME)
- Transparence complete des criteres

### Limites operationnelles

#### 1. Qualite des donnees d'entree

**Probleme** : Si les commandes sont mal saisies (adresses incorrectes, poids errones), les predictions sont faussees.

**Solution** :
- Validation stricte des formulaires
- Geocodage automatique des adresses
- Detection incohérences (ex: 100 palettes dans un VL)

#### 2. Disponibilite services externes

**Dependances** :
- OpenRouter API (IA GPT-4o)
- Palette API
- MongoDB

**Mitigation** :
- Fallbacks a chaque etape
- Mode degrade (in-memory store)
- Monitoring uptime (alertes si <99%)

### Precautions ethiques

#### 1. Transparence des decisions

**Principe** : Chaque affectation doit etre explicable.

**Implementation** :
- Champ `explanation` dans l'assignment
- Dashboard affichant les criteres de choix
- Acces transporteurs a leur scoring

**Exemple** :
```json
{
  "orderId": "ORD-123",
  "carrierId": "CARRIER-A",
  "explanation": "Selectionne pour : prix competitif (920 EUR vs 950 ref), excellent historique OTIF (97.1%), reponse rapide (30min)."
}
```

#### 2. Non-discrimination

**Risque** : Exclure systematiquement certains transporteurs (petites structures, zones rurales).

**Prevention** :
- Quotas minimum par categorie
- Monitoring repartition affectations
- Acces egal aux appels d'offres

#### 3. Protection donnees personnelles (RGPD)

**Donnees sensibles** :
- Localisation GPS transporteurs
- Historique performances
- Prix negocies

**Conformite** :
- Anonymisation pour analytics
- Retention limitee (3 ans max)
- Droit a l'oubli (suppression sur demande)

---

## 16. Troubleshooting IA

### Probleme 1 : Mauvaises recommandations de prix

**Symptomes** :
- Prix systematiquement 20% au-dessus du marche
- Aucune offre acceptee

**Diagnostic** :
```bash
# Verifier la grille tarifaire
curl http://localhost:3005/affret-ia/quote/ORD-Paris-Munich

# Comparer avec historique bids
curl http://localhost:3005/affret-ia/bids/ORD-Paris-Munich
```

**Causes possibles** :
1. Grille tarifaire obsolete
2. Modele ML entraine sur donnees anciennes
3. OpenRouter API desactivee (fallback heuristique)

**Solutions** :
1. Mettre a jour les grilles : Backoffice > Grilles > Import CSV
2. Re-entrainer le modele : `npm run ml:retrain`
3. Verifier `OPENROUTER_API_KEY` dans `.env`

### Probleme 2 : Taux d'escalade eleve (>20%)

**Symptomes** :
- Beaucoup de commandes passent au transporteur #2, #3
- SLA rarement respectes

**Diagnostic** :
```bash
# Dashboard SLA
curl http://localhost:3005/affret-ia/sla-stats
```

**Causes possibles** :
1. SLA trop court (2h irrealiste)
2. Transporteurs satures
3. Notifications mal recues

**Solutions** :
1. Allonger SLA : `slaAcceptHours: 4` dans dispatch-policies.json
2. Elargir le pool de transporteurs
3. Verifier systeme de notifications (email/SMS)

### Probleme 3 : Biais vers certains transporteurs

**Symptomes** :
- CARRIER-A obtient 80% des affectations
- Les autres se plaignent

**Diagnostic** :
```sql
SELECT carrierId, COUNT(*) as affectations
FROM affret_assignments
GROUP BY carrierId
ORDER BY affectations DESC;
```

**Causes possibles** :
1. CARRIER-A a un scoring bien meilleur
2. Ponderations favorisent historique (et CARRIER-A est ancien)
3. Localisation geographique (depot central)

**Solutions** :
1. Ajuster ponderations (reduire poids historique)
2. Introduire diversite forcee : `minAffectationPercent: 5%` par transporteur
3. Scoring zone geographique (bonus transporteurs eloignes pour equilibrer)

### Probleme 4 : Predictions ML inexactes

**Symptomes** :
- Prix predit : 900 EUR, prix reel accepte : 1200 EUR
- MAE (erreur absolue moyenne) > 15%

**Diagnostic** :
```python
# Notebook Jupyter
import pandas as pd
predictions = pd.read_csv('ml_predictions.csv')
actuals = pd.read_csv('ml_actuals.csv')

mae = (predictions['price'] - actuals['price']).abs().mean()
print(f"MAE: {mae} EUR")
```

**Causes possibles** :
1. Dataset d'entrainement trop petit (<500 exemples)
2. Features manquantes (ex: prix gasoil non integre)
3. Overfitting (modele trop complexe)

**Solutions** :
1. Collecter plus de donnees (attendre 3-6 mois)
2. Ajouter features externes (API prix gasoil)
3. Simplifier le modele (moins de couches neuronales)
4. Cross-validation plus stricte

### Probleme 5 : Service Affret.IA injoignable

**Symptomes** :
- `curl http://localhost:3005/health` → timeout
- Dashboard affiche "Service indisponible"

**Diagnostic** :
```bash
# Verifier le processus
ps aux | grep affret-ia

# Logs
tail -f logs/affret-ia.log

# Port ecoute
netstat -tuln | grep 3005
```

**Causes possibles** :
1. Service crashed (erreur non geree)
2. Port deja utilise
3. MongoDB inaccessible

**Solutions** :
1. Redemarrer : `pnpm --filter @rt/service-affret-ia dev`
2. Changer port : `AFFRET_IA_PORT=3006` dans `.env`
3. Verifier MongoDB : `mongosh --eval "db.runCommand({ping:1})"`

---

## 17. Roadmap et Evolutions

### Q1 2025 (Janvier - Mars)

**Integration GPT-4o complete**
- Actuellement : GPT-4o-mini (rapide, economique)
- Evolution : GPT-4o full (plus precis, context 128k tokens)
- Cas d'usage : Analyse contrats complexes, negociation automatique

**Multi-devises**
- Actuellement : EUR uniquement
- Evolution : USD, GBP, CHF
- API taux de change temps reel

**API publique Affret.IA**
- Actuellement : Interne RT-Technologie
- Evolution : API REST documentee (OpenAPI) pour TMS tiers
- Webhooks pour notifications temps reel

### Q2 2025 (Avril - Juin)

**Optimisation CO2**
- Nouveau critere scoring : Empreinte carbone
- Bonus transporteurs electriques/GNV
- Dashboard impact environnemental

**Blockchain pour tracabilite**
- Hash des affectations dans blockchain (Ethereum/Polygon)
- Immutabilite des decisions IA
- Audit transparent

**IA Conversational (chatbot)**
- Interface NLP : "Trouve-moi un transporteur pour 20 palettes Paris-Berlin demain"
- Integration Slack/Teams
- Commandes vocales

### Q3-Q4 2025 (Juillet - Decembre)

**Predictive Maintenance Vehicules**
- Integration donnees telematiques camions
- Prediction pannes (ML)
- Affectation intelligente (eviter vehicules a risque)

**Marketplace Capacite Temps Reel**
- Bourse de fret automatisee
- Encheres inversees (transporteurs surencherissent a la baisse)
- Integration Upply, Timocom

**IA Generative Documents**
- Generation automatique CMR, BL, factures
- Remplissage intelligent base sur historique
- Multi-langues (FR, EN, DE, ES, IT)

### 2026 et au-dela

**IA Quantique**
- Optimisation routes via ordinateurs quantiques (D-Wave, IBM Q)
- Resolution TSP exact (vs heuristique actuel)
- Capacite : 10000 livraisons optimisees en <1s

**Affret Autonome**
- Integration vehicules autonomes (Tesla Semi, Einride)
- Dispatch direct vers camion (pas d'intermediaire humain)
- Fleet management IA to IA

**Metaverse Logistique**
- Jumeau numerique des entrepots (Digital Twin)
- Formation VR pour transporteurs
- Simulation scenarios crise

---

## 18. Support

### Documentation technique

**Repository GitHub** :
```
https://github.com/RT-Technologie/rt-technologie
└── services/affret-ia/
    ├── README.md
    ├── AGENTS.md
    ├── openapi.yaml (API spec)
    └── src/server.js
```

**Swagger UI** : `http://localhost:3005/docs` (a venir)

### Support utilisateurs

**Email** : support-affretia@rt-technologie.com
**Hotline** : +33 1 XX XX XX XX (9h-18h, lun-ven)
**Chat** : Widget en bas a droite de l'interface

**SLA Support** :
- Critique (service down) : <1h
- Majeur (bug bloquant) : <4h
- Mineur (question) : <24h

### Formation et onboarding

**Sessions hebdomadaires** :
- **Mardi 10h-12h** : Formation Affret.IA debutant
- **Jeudi 14h-16h** : Atelier configuration avancee

**Inscription** : formations@rt-technologie.com

**Webinaires enregistres** :
- [Introduction Affret.IA](https://youtube.com/rt-tech/affretia-intro)
- [Configuration scoring](https://youtube.com/rt-tech/affretia-scoring)
- [Machine Learning explique](https://youtube.com/rt-tech/affretia-ml)

### Contribution et feedback

**Formulaire feedback** :
Backoffice > Aide > Suggerer une amelioration

**Bug reports** :
GitHub Issues : `https://github.com/RT-Technologie/rt-technologie/issues`

**Template bug** :
```markdown
**Description**
Description claire du bug

**Reproduction**
1. Aller a ...
2. Cliquer sur ...
3. Observer ...

**Comportement attendu**
Ce qui devrait se passer

**Screenshots**
Si applicable

**Environnement**
- Navigateur : Chrome 120
- OS : Windows 11
- Version Affret.IA : 1.2.3
```

### Communaute

**Slack** : `rt-technologie.slack.com` (canal `#affret-ia`)
**Forum** : `forum.rt-technologie.com/c/affret-ia`
**Meetups** : Tous les trimestres (Paris, Lyon)

---

## Glossaire

| Terme | Definition |
|-------|------------|
| **Affretement** | Processus de location d'un moyen de transport (camion, bateau, avion) |
| **Bid** | Offre de prix soumise par un transporteur pour une commande |
| **FTL** | Full Truck Load - Chargement complet (≥33 palettes) |
| **LTL** | Less Than Truck Load - Chargement partiel (<33 palettes) |
| **OTIF** | On-Time In-Full - Livraison a l'heure et complete |
| **SLA** | Service Level Agreement - Engagement de niveau de service |
| **Scoring** | Note attribuee a un transporteur base sur ses performances |
| **TSP** | Traveling Salesman Problem - Probleme du voyageur de commerce |
| **Haversine** | Formule calculant la distance entre 2 points GPS |
| **Greedy** | Algorithme heuristique choisissant toujours la meilleure option immediate |
| **MAE** | Mean Absolute Error - Erreur absolue moyenne |
| **Drift** | Changement de distribution des donnees dans le temps |
| **Cold Start** | Probleme de manque de donnees pour un nouvel element |

---

## Changelog

### v1.0.0 (2025-01-18)
- Version initiale du guide
- 18 chapitres couvrant tous les aspects d'Affret.IA
- Exemples concrets et formules mathematiques
- Troubleshooting et configuration avancee

---

**Auteurs** : RT-Technologie Design & AI Team
**Contributeurs** : Equipes Logistique, Data Science, Product
**Licence** : Proprietary - RT-Technologie
**Contact** : docs@rt-technologie.com

---

**Derniere mise a jour** : 18 janvier 2025
**Version du guide** : 1.0.0
**Version Affret.IA** : 1.1.0
