# Système de Sourcing Permanent - Usine Agroalimentaire

## Description

Système complet de gestion des approvisionnements pour une usine de production de pâtes alimentaires en Europe.

Ce système couvre l'ensemble de la chaîne d'approvisionnement :
- 🔍 **Découverte automatique de fournisseurs** (NOUVEAU !)
- 🏭 Identification et qualification des fournisseurs
- 📋 Appels d'offres avec analyse automatique
- 🤝 Attribution des lots et gestion commerciale
- 📊 Prévisions et planification automatique
- ✅ Contrôle qualité et traçabilité complète

## Fonctionnalités Principales

### 1. Découverte Automatique de Fournisseurs 🆕
- **Recherche intelligente** dans bases de données européennes
- **Scoring automatique** multi-critères (géographie, certifications, capacité, RSE)
- Filtrage avancé par zones géographiques, rayon, certifications
- Base de données de 13+ fournisseurs européens (semoule, œufs, emballages)
- **Recommandations automatiques** et rapports détaillés
- Calcul de distance depuis votre usine
- Priorisation urgente/normale

### 2. Gestion des Fournisseurs
- Référencement et qualification
- Évaluation périodique des performances
- Gestion des certifications (IFS, BRC, ISO 22000, Bio)
- Suivi des audits

### 3. Appels d'Offres Automatisés
- Création et publication d'appels d'offres
- Analyse automatique multi-critères (prix, qualité, délais, RSE)
- Scoring et classement des offres
- Génération de rapports d'attribution

### 4. Gestion Commerciale
- Contrats cadres pluriannuels
- Prix indexés et paliers de volume
- Négociations et avenants
- Suivi des performances contractuelles

### 5. Prévisions et Approvisionnement
- Prévisions de consommation (tendances, saisonnalité)
- Calcul automatique des stocks de sécurité
- Point de commande automatique
- Quantité économique de commande (EOQ)

### 6. Qualité et Traçabilité
- Contrôle qualité à réception
- Traçabilité complète des lots (origine → utilisation)
- Gestion des non-conformités
- Conformité réglementaire européenne

## Installation

```bash
# Cloner le repository
git clone https://github.com/votre-org/RT-Technologie.git
cd RT-Technologie

# Installer les dépendances
pip install -r requirements.txt
```

## Démarrage Rapide

### 🌐 Interface Web (NOUVEAU!)

```bash
# Lancer l'interface web
python web_app.py

# Puis ouvrir dans votre navigateur:
# http://localhost:5000
```

### 💻 Ligne de Commande

```bash
# Menu interactif
python quick_start.py

# Workflow complet de sourcing
python examples/example_complete_workflow.py

# Découverte automatique de fournisseurs
python examples/example_supplier_discovery.py
```

## Structure du Projet

```
RT-Technologie/
├── src/
│   ├── models/           # Modèles de données
│   │   ├── supplier.py              # Fournisseurs
│   │   ├── supplier_discovery.py    # Découverte fournisseurs 🆕
│   │   ├── raw_material.py          # Matières premières
│   │   ├── rfq.py                   # Appels d'offres
│   │   ├── contract.py              # Contrats
│   │   └── procurement.py           # Approvisionnements
│   ├── services/         # Services métier
│   │   ├── supplier_discovery.py      # Découverte automatique 🆕
│   │   ├── supplier_manager.py        # Gestion fournisseurs
│   │   ├── rfq_analyzer.py            # Analyse offres
│   │   ├── forecast_engine.py         # Prévisions
│   │   └── quality_manager.py         # Qualité/traçabilité
│   ├── config/           # Configuration
│   └── utils/            # Utilitaires
├── data/                 # Données
│   ├── suppliers/
│   ├── raw_materials/
│   ├── orders/
│   └── quality/
├── docs/                 # Documentation
│   └── DOCUMENTATION.md
├── examples/             # Exemples d'utilisation
│   ├── example_complete_workflow.py
│   └── example_supplier_discovery.py    # Découverte auto 🆕
├── tests/                # Tests
└── requirements.txt      # Dépendances

```

## Matières Premières pour Pâtes

Le système est configuré pour gérer les matières premières spécifiques à la production de pâtes :

- **Semoule de blé dur** (principale) - Critères : taux de protéines, granulométrie
- **Œufs** (pâtes aux œufs)
- **Légumes** (épinards, tomates - pâtes colorées)
- **Eau de process**
- **Emballages** (cartons, films, étiquettes)

## Conformité Réglementaire

Le système assure la conformité avec les réglementations européennes :

- ✅ Traçabilité (Règlement UE 178/2002)
- ✅ Sécurité alimentaire (ISO 22000, HACCP)
- ✅ Contrôle des contaminants (aflatoxines, ochratoxine, métaux lourds)
- ✅ Certifications (IFS Food, BRC, FSSC 22000)

## Documentation

Documentation complète disponible dans `/docs/DOCUMENTATION.md`

Voir également :
- [Exemple complet de workflow](examples/example_complete_workflow.py)
- [Découverte automatique de fournisseurs](examples/example_supplier_discovery.py) 🆕
- [Modèles de données](src/models/)
- [Services métier](src/services/)

## Auteurs

RT-Technologie

## Licence

Propriétaire - Tous droits réservés
