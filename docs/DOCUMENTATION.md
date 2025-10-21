# Système de Sourcing Permanent - Usine Agroalimentaire

## Vue d'ensemble

Système complet de gestion des approvisionnements pour une usine de production de pâtes alimentaires en Europe. Ce système couvre l'ensemble de la chaîne d'approvisionnement, de l'identification des fournisseurs à la gestion commerciale, en passant par les appels d'offres automatisés et la traçabilité qualité.

## Architecture du Système

### Modules Principaux

1. **Gestion des Fournisseurs** (`supplier_manager.py`)
   - Référencement et qualification des fournisseurs
   - Évaluation périodique des performances
   - Gestion des certifications (IFS, BRC, ISO 22000, Bio, etc.)
   - Suivi des audits

2. **Appels d'Offres (RFQ)** (`rfq_analyzer.py`)
   - Création et publication d'appels d'offres
   - Analyse automatique des offres reçues
   - Scoring multi-critères (prix, qualité, délais, RSE, etc.)
   - Génération de rapports d'attribution

3. **Gestion Commerciale** (`contract.py`)
   - Contrats cadres pluriannuels
   - Négociations et avenants
   - Prix indexés et paliers de volume
   - Suivi des performances contractuelles

4. **Prévisions et Approvisionnement** (`forecast_engine.py`)
   - Prévisions de consommation (moyennes mobiles, tendances, saisonnalité)
   - Calcul des stocks de sécurité
   - Point de commande automatique
   - Quantité économique de commande (EOQ)

5. **Qualité et Traçabilité** (`quality_manager.py`)
   - Contrôle qualité à réception
   - Traçabilité complète des lots
   - Gestion des non-conformités
   - Conformité réglementaire européenne

## Matières Premières pour Pâtes Alimentaires

### Matières Premières Principales

1. **Semoule de blé dur**
   - Origine : France, Italie, Canada
   - Critères qualité : Taux de protéines (min 12%), granulométrie, taux de cendres
   - Certifications : IGP, Bio

2. **Œufs** (pour pâtes aux œufs)
   - Origine : Europe
   - Critifications : Bio, Label Rouge, Plein air

3. **Légumes** (épinards, tomates, betterave)
   - Pour pâtes colorées
   - Frais, surgelés ou en poudre

4. **Eau de process**
   - Qualité alimentaire
   - Analyses régulières

5. **Emballages**
   - Cartons
   - Films plastiques
   - Étiquettes

## Flux de Travail

### 1. Identification et Qualification des Fournisseurs

```python
from src.services.supplier_manager import SupplierManager
from src.models.supplier import Fournisseur, SupplierType

# Créer un nouveau fournisseur
manager = SupplierManager()
fournisseur = Fournisseur(
    id="FRSEM001",
    nom_entreprise="Moulins du Sud",
    type=SupplierType.RAW_MATERIAL,
    # ... autres données
)
manager.create_supplier(fournisseur)
```

### 2. Lancement d'un Appel d'Offres

```python
from src.models.rfq import AppelOffres, RFQType

rfq = AppelOffres(
    id="RFQ_2024_001",
    numero_rfq="AO-2024-001",
    titre="Fourniture de semoule de blé dur - Année 2024",
    type=RFQType.FRAMEWORK,
    # ... critères d'évaluation
)
```

### 3. Analyse Automatique des Offres

```python
from src.services.rfq_analyzer import RFQAnalyzer

analyzer = RFQAnalyzer()
comparison = analyzer.compare_offers(rfq, offers, suppliers)
report = analyzer.generate_award_report(rfq, comparison)
```

### 4. Gestion des Contrats

```python
from src.models.contract import ContratFournisseur, ContractType

contrat = ContratFournisseur(
    id="CTR_2024_001",
    type=ContractType.FRAMEWORK,
    fournisseur_id="FRSEM001",
    # ... conditions commerciales
)
```

### 5. Prévisions et Commandes Automatiques

```python
from src.services.forecast_engine import ForecastEngine

engine = ForecastEngine()
forecast = engine.forecast_demand("SEM_BLE_DUR_001", horizon_days=30)
plan = engine.generate_procurement_plan(
    matiere_id="SEM_BLE_DUR_001",
    current_stock=5000,
    lead_time_days=7
)
```

### 6. Contrôle Qualité à Réception

```python
from src.services.quality_manager import QualityManager

quality_mgr = QualityManager()
result = quality_mgr.enregistrer_reception(lot, analyse_reception)

if result['statut'] == 'conforme':
    # Libérer pour production
    pass
else:
    # Quarantaine ou retour fournisseur
    pass
```

## Critères d'Évaluation des Fournisseurs

### Scoring Multi-Critères

Le système évalue automatiquement les offres selon plusieurs critères pondérés :

1. **Prix (30-40%)**
   - Compétitivité vs budget
   - Conditions de paiement
   - Remises volume

2. **Qualité (30-35%)**
   - Historique fournisseur
   - Certifications
   - Taux de conformité

3. **Délais (15-20%)**
   - Respect des dates
   - Flexibilité

4. **RSE et Durabilité (10-15%)**
   - Certifications bio/environnementales
   - Approvisionnement local européen

5. **Fiabilité (10%)**
   - Expérience
   - Stabilité financière

## Conformité Réglementaire Européenne

### Normes et Certifications

- **IFS Food** : International Featured Standards
- **BRC** : British Retail Consortium
- **ISO 22000** : Management de la sécurité des denrées alimentaires
- **HACCP** : Hazard Analysis Critical Control Point
- **FSSC 22000** : Food Safety System Certification
- **Agriculture Biologique** : Règlement EU 2018/848

### Traçabilité

Le système assure une traçabilité complète conforme au règlement EU 178/2002 :
- Traçabilité amont (origine fournisseur, lot, date de fabrication)
- Traçabilité interne (stockage, transformations)
- Traçabilité aval (lots de production utilisant chaque lot de matière première)

### Limites Réglementaires

Contrôles automatiques des contaminants selon règlement EU :
- Aflatoxines : max 5 ppb (semoule)
- Ochratoxine A : max 3 ppb
- Métaux lourds (plomb, cadmium)
- Résidus de pesticides
- Contrôles microbiologiques (Salmonelle, Listeria)

## Indicateurs de Performance (KPIs)

### Approvisionnements

- Taux de service : % de commandes livrées à temps
- Taux de rupture de stock
- Rotation des stocks
- Délai moyen d'approvisionnement
- Économies réalisées vs budget

### Qualité

- Taux de conformité à réception
- Nombre de non-conformités fournisseur
- Taux de retour fournisseur
- Coût de la non-qualité

### Fournisseurs

- Note globale moyenne
- Taux de respect des délais
- Taux de respect des engagements contractuels
- Nombre de fournisseurs actifs/qualifiés

## Automatisation

### Commandes Automatiques

Le système peut déclencher automatiquement des commandes lorsque :
- Le stock atteint le point de commande
- Une rupture est prévue dans les N jours
- Un contrat cadre nécessite un appel

### Alertes Automatiques

- Stock faible / rupture imminente
- Certifications fournisseur expirantes
- Fin de contrat proche
- Non-conformités critiques
- Lots proches de la péremption

## Installation et Configuration

### Prérequis

```bash
Python 3.9+
pandas, numpy, pydantic, sqlalchemy
```

### Installation

```bash
pip install -r requirements.txt
```

### Configuration

Éditer les fichiers de configuration dans `src/config/` :
- Paramètres de stock (seuils, sécurité)
- Critères d'évaluation fournisseurs
- Seuils d'alerte
- Connexion base de données

## Exemples d'Utilisation

Voir le dossier `examples/` pour des cas d'usage complets :
- `example_rfq_process.py` : Processus complet d'appel d'offres
- `example_procurement.py` : Gestion des approvisionnements
- `example_quality.py` : Contrôle qualité et traçabilité

## Support et Contact

Pour toute question ou support :
- Documentation technique : `/docs`
- Issues : Contacter l'équipe RT-Technologie

## Licence

Propriété de RT-Technologie
Tous droits réservés
