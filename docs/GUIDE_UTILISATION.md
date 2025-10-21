# Guide d'Utilisation - Système de Sourcing Permanent

## 📖 Table des matières

1. [Installation et Démarrage](#installation)
2. [Découverte de Fournisseurs](#découverte)
3. [Gestion des Fournisseurs](#gestion-fournisseurs)
4. [Lancement d'Appels d'Offres](#appels-offres)
5. [Création de Contrats](#contrats)
6. [Gestion des Stocks et Prévisions](#prévisions)
7. [Contrôle Qualité](#qualité)
8. [Cas d'Usage Complets](#cas-usage)

---

## 🚀 Installation et Démarrage {#installation}

### Prérequis
- Python 3.9 ou supérieur
- pip (gestionnaire de packages Python)

### Installation

```bash
# 1. Cloner le projet
git clone https://github.com/romain-38530/RT-Technologie.git
cd RT-Technologie

# 2. Installer les dépendances
pip install -r requirements.txt

# 3. Tester l'installation
python examples/example_complete_workflow.py
```

Si tout fonctionne, vous verrez :
```
================================================================================
SYSTÈME DE SOURCING PERMANENT - USINE DE PÂTES ALIMENTAIRES
================================================================================
✓ Fournisseur italien créé : Molino Grassi S.p.A
...
```

---

## 🔍 1. Découverte Automatique de Fournisseurs {#découverte}

### Quand l'utiliser ?
- Vous cherchez de **nouveaux fournisseurs** pour une matière première
- Vous voulez **diversifier** vos sources d'approvisionnement
- Vous avez besoin d'un **fournisseur de secours**
- Situation **urgente** (rupture, problème qualité)

### Exemple Simple

```python
from src.services.supplier_discovery import SupplierDiscoveryEngine
from src.models.supplier_discovery import CritereRecherche, GeographicZone
from src.models.supplier import SupplierType, CertificationType

# 1. Initialiser le moteur
discovery = SupplierDiscoveryEngine()

# 2. Définir ce que vous cherchez
criteres = CritereRecherche(
    type_fournisseur=SupplierType.RAW_MATERIAL,
    matieres_premieres=["Semoule de blé dur"],
    zones_geographiques=[GeographicZone.EU],
    certifications_requises=[
        CertificationType.IFS,
        CertificationType.ISO_22000
    ],
    bio_requis=False,
    local_prefere=True,  # Privilégier les fournisseurs proches
    rayon_km=500,        # Maximum 500 km
    nombre_max_resultats=10
)

# 3. Lancer la recherche
# Votre localisation (exemple: Lyon = 45.7640, 4.8357)
resultat = discovery.search_suppliers(
    criteres,
    notre_localisation=(45.7640, 4.8357)
)

# 4. Voir les résultats
print(f"✓ {resultat.nombre_total} fournisseurs trouvés")

for idx, fournisseur in enumerate(resultat.fournisseurs_trouves[:3], 1):
    print(f"\n{idx}. {fournisseur.nom_entreprise} ({fournisseur.pays})")
    print(f"   Score: {fournisseur.score_pertinence:.1f}/100")
    print(f"   Distance: {fournisseur.distance_km:.0f} km")
    print(f"   Certifications: {', '.join(fournisseur.certifications_identifiees)}")
    print(f"   Site: {fournisseur.site_web}")

# 5. Générer un rapport
rapport = discovery.generate_discovery_report(resultat)
print(rapport)
```

### Exemple Recherche URGENTE (œufs BIO)

```python
criteres_urgents = CritereRecherche(
    type_fournisseur=SupplierType.INGREDIENT,
    matieres_premieres=["Œufs", "Ovoproduits"],
    certifications_requises=[CertificationType.BIO_EU],
    bio_requis=True,
    priorite=SearchPriority.URGENT,  # ⚠️ URGENT
    nombre_max_resultats=5
)

resultat = discovery.search_suppliers(criteres_urgents, notre_localisation)
```

### Tester la découverte

```bash
# Lancer l'exemple complet (3 scénarios)
python examples/example_supplier_discovery.py
```

---

## 🏭 2. Gestion des Fournisseurs {#gestion-fournisseurs}

### Créer un nouveau fournisseur

```python
from src.services.supplier_manager import SupplierManager
from src.models.supplier import (
    Fournisseur, SupplierType, SupplierStatus,
    AdresseFournisseur, ContactFournisseur,
    ConditionsCommerciales, Certification, CertificationType
)
from datetime import datetime

# 1. Initialiser le gestionnaire
manager = SupplierManager()

# 2. Créer le fournisseur
fournisseur = Fournisseur(
    id="FR_SEM_001",
    nom_entreprise="Moulins du Sud",
    type=SupplierType.RAW_MATERIAL,
    statut=SupplierStatus.ACTIVE,

    # Coordonnées
    adresse=AdresseFournisseur(
        rue="10 Rue de la Minoterie",
        code_postal="13000",
        ville="Marseille",
        pays="FR",
        region="PACA"
    ),

    # Contact
    contacts=[
        ContactFournisseur(
            nom="Dupont",
            prenom="Marie",
            fonction="Directrice Commerciale",
            email="m.dupont@moulinsdusud.fr",
            telephone="+33 4 91 12 34 56"
        )
    ],

    # Certifications
    certifications=[
        Certification(
            type=CertificationType.IFS,
            numero="IFS-2024-FR-123",
            organisme="Bureau Veritas",
            date_obtention=datetime(2024, 1, 15),
            date_expiration=datetime(2025, 1, 14)
        )
    ],

    # Conditions commerciales
    conditions=ConditionsCommerciales(
        delai_paiement_jours=60,
        remise_volume_percent=5,
        quantite_minimum_commande=10000,
        unite_commande="kg",
        delai_livraison_jours=7
    )
)

# 3. Sauvegarder
manager.create_supplier(fournisseur)
print(f"✓ Fournisseur {fournisseur.nom_entreprise} créé")
```

### Évaluer un fournisseur

```python
from src.models.supplier import EvaluationFournisseur

evaluation = EvaluationFournisseur(
    date_evaluation=datetime.now(),
    qualite_produits=5,      # Note sur 5
    respect_delais=4,
    service_client=5,
    competitivite_prix=3,
    conformite_reglementaire=5,
    evaluateur="Jean Dupont - Responsable Achats",
    commentaires="Excellente qualité, prix premium justifié"
)

manager.add_evaluation("FR_SEM_001", evaluation)
print(f"Note globale: {evaluation.note_globale:.2f}/5")
```

### Lister les meilleurs fournisseurs

```python
# Top 5 fournisseurs de matières premières
top_5 = manager.get_best_suppliers(
    type_filter=SupplierType.RAW_MATERIAL,
    limit=5
)

for fournisseur in top_5:
    print(f"{fournisseur.nom_entreprise}: {fournisseur.note_globale_moyenne:.2f}/5")
```

---

## 📋 3. Lancement d'Appels d'Offres {#appels-offres}

### Créer un appel d'offres

```python
from src.models.rfq import (
    AppelOffres, RFQType, LigneRFQ,
    CritereEvaluation, EvaluationCriteria
)
from datetime import date, timedelta

rfq = AppelOffres(
    id="RFQ_2025_001",
    numero_rfq="AO-2025-SEM-001",
    titre="Fourniture semoule blé dur - Année 2025",
    type=RFQType.FRAMEWORK,  # Contrat cadre

    description="Appel d'offres pour fourniture annuelle de semoule",

    # Ce que vous voulez acheter
    lignes=[
        LigneRFQ(
            numero_ligne=1,
            matiere_premiere_id="MAT_SEM_001",
            designation="Semoule de blé dur premium",
            description_detaillee="Min 12.5% protéines, granulo 200-500µm",
            quantite_estimee=600000,  # 600 tonnes/an
            unite="kg",
            quantite_minimale=500000,
            certifications_requises=["IFS Food", "ISO 22000"],
            date_livraison_souhaitee=date.today() + timedelta(days=90)
        )
    ],

    # Calendrier
    date_limite_soumission=datetime.now() + timedelta(days=30),
    date_attribution_prevue=date.today() + timedelta(days=45),

    # Fournisseurs invités
    fournisseurs_invites=["FR_SEM_001", "IT_SEM_001"],

    # Critères d'évaluation (total = 100%)
    criteres_evaluation=[
        CritereEvaluation(
            critere=EvaluationCriteria.PRICE,
            poids_percent=35,
            description="Compétitivité tarifaire"
        ),
        CritereEvaluation(
            critere=EvaluationCriteria.QUALITY,
            poids_percent=30,
            description="Qualité produit"
        ),
        CritereEvaluation(
            critere=EvaluationCriteria.DELIVERY_TIME,
            poids_percent=20,
            description="Délais de livraison"
        ),
        CritereEvaluation(
            critere=EvaluationCriteria.SUSTAINABILITY,
            poids_percent=15,
            description="Durabilité et RSE"
        )
    ],

    budget_estimatif=450000,  # 450k€
    responsable_achat="Votre Nom"
)
```

### Analyser les offres reçues

```python
from src.services.rfq_analyzer import RFQAnalyzer

# 1. Initialiser l'analyseur
analyzer = RFQAnalyzer()

# 2. Comparer toutes les offres
comparison = analyzer.compare_offers(
    rfq,
    offres_recues,  # Liste des offres
    suppliers_dict   # Dict {id: fournisseur}
)

# 3. Voir les résultats
for result in comparison:
    print(f"{result['nom_fournisseur']}")
    print(f"  Note finale: {result['note_finale']:.1f}/100")
    print(f"  Montant HT: {result['montant_ht']:,.2f} €")
    print(f"  Recommandation: {result['recommandation']}")

# 4. Générer le rapport d'attribution
rapport = analyzer.generate_award_report(rfq, comparison)
print(f"Fournisseur retenu: {rapport['offre_retenue']['fournisseur']}")
```

---

## 📄 4. Création de Contrats {#contrats}

### Créer un contrat cadre

```python
from src.models.contract import (
    ContratFournisseur, ContractType,
    PrixContractuel, PriceReviewMethod, VolumeTier
)

contrat = ContratFournisseur(
    id="CTR_2025_001",
    numero_contrat="CTR-2025-SEM-001",
    type=ContractType.FRAMEWORK,  # Contrat cadre

    fournisseur_id="FR_SEM_001",
    nom_fournisseur="Moulins du Sud",

    objet="Fourniture semoule de blé dur 2025",

    # Dates
    date_debut=date(2025, 1, 1),
    date_fin=date(2025, 12, 31),
    duree_mois=12,

    # Prix avec paliers de volume
    prix_contractuels=[
        PrixContractuel(
            matiere_premiere_id="MAT_SEM_001",
            designation="Semoule blé dur",
            prix_unitaire_base=0.70,  # 0.70€/kg

            # Paliers de remise
            paliers_volume=[
                VolumeTier(
                    volume_minimum=0,
                    volume_maximum=500000,
                    remise_percent=0
                ),
                VolumeTier(
                    volume_minimum=500000,
                    volume_maximum=700000,
                    remise_percent=3  # -3% si > 500 tonnes
                ),
                VolumeTier(
                    volume_minimum=700000,
                    remise_percent=5  # -5% si > 700 tonnes
                )
            ],

            # Prix indexé sur le blé
            methode_revision=PriceReviewMethod.INDEXED,
            indice_reference="Prix du blé dur Euronext",

            quantite_minimale_commande=10000,
            unite="kg",
            delai_livraison_jours=7,
            date_debut_validite=date(2025, 1, 1),
            date_fin_validite=date(2025, 12, 31)
        )
    ],

    # Volumes
    volume_minimum_annuel=500000,  # 500 tonnes minimum
    volume_maximum_annuel=800000,  # 800 tonnes maximum

    # Paiement
    delai_paiement_jours=60,

    responsable_achat="Votre Nom"
)
```

### Calculer un prix selon volume

```python
# Prix pour 600 tonnes
prix = contrat.obtenir_prix("MAT_SEM_001", 600000)
print(f"Prix pour 600 tonnes: {prix:.3f} €/kg")
```

---

## 📊 5. Gestion des Stocks et Prévisions {#prévisions}

### Prévisions de consommation

```python
from src.services.forecast_engine import ForecastEngine
from datetime import date, timedelta

# 1. Initialiser le moteur
forecast = ForecastEngine()

# 2. Charger l'historique (90 jours)
for i in range(90):
    date_conso = date.today() - timedelta(days=90-i)
    quantite = 2000 + random.randint(-200, 200)  # 2000kg ± variation

    forecast.add_historical_consumption(
        "MAT_SEM_001",
        date_conso,
        quantite
    )

# 3. Prévoir les 30 prochains jours
prevision = forecast.forecast_demand(
    "MAT_SEM_001",
    horizon_days=30
)

print(f"Prévision 30 jours: {prevision['adjusted_forecast']:,.0f} kg")
print(f"Consommation moyenne: {prevision['daily_average']:.0f} kg/jour")
print(f"Tendance: {prevision['trend']}")
```

### Calculer le stock de sécurité

```python
stock_secu = forecast.calculate_safety_stock(
    "MAT_SEM_001",
    service_level=0.95,  # 95% de taux de service
    lead_time_days=7      # Délai appro 7 jours
)

print(f"Stock de sécurité: {stock_secu['safety_stock']:,.0f} kg")
```

### Plan d'approvisionnement automatique

```python
# Stock actuel: 25 tonnes
plan = forecast.generate_procurement_plan(
    matiere_id="MAT_SEM_001",
    current_stock=25000,
    lead_time_days=7,
    planning_horizon_days=30
)

print(f"Stock actuel: {plan['current_stock']:,} kg")
print(f"Point de commande: {plan['reorder_point']:,} kg")
print(f"Besoin: {plan['net_requirement']:,} kg")
print(f"Urgence: {plan['urgency']}")
print(f"Action: {plan['recommendation']}")

if plan['need_to_order']:
    print("⚠️ COMMANDER MAINTENANT !")
```

---

## ✅ 6. Contrôle Qualité {#qualité}

### Enregistrer la réception d'un lot

```python
from src.services.quality_manager import QualityManager
from src.models.raw_material import (
    LotMatierePremiere, AnalyseQualite
)

quality_mgr = QualityManager()

# 1. Créer le lot reçu
lot = LotMatierePremiere(
    id="LOT_2025_001",
    numero_lot="FR-SUD-250115-001",  # N° fournisseur
    numero_lot_interne="L2025-001",
    matiere_premiere_id="MAT_SEM_001",
    fournisseur_id="FR_SEM_001",

    date_reception=datetime.now(),
    numero_bon_livraison="BL-123456",
    numero_commande="PO-2025-001",

    quantite_kg=25000,  # 25 tonnes
    nombre_unites=1000,  # 1000 sacs de 25kg
    conditionnement="Sac papier 25 kg",

    date_fabrication=date.today() - timedelta(days=5),
    date_peremption=date.today() + timedelta(days=365),
    quantite_restante_kg=25000,

    emplacement_stockage="Zone A - Allée 3",
    zone_stockage="Matières premières sèches"
)

# 2. Analyse qualité
analyse = AnalyseQualite(
    date_analyse=datetime.now(),
    laboratoire="Labo interne",
    numero_rapport="LAB-2025-001",

    # Résultats
    humidite_percent=13.2,
    taux_proteines_percent=13.5,
    taux_cendres_percent=0.85,
    aflatoxines_ppb=2.1,
    ochratoxine_ppb=1.5,

    # Microbiologie
    bacteries_totales_ufc_g=45000,
    salmonelle_detectee=False,
    listeria_detectee=False,

    conforme=True,
    observations="Lot conforme - Excellente qualité"
)

# 3. Enregistrer
result = quality_mgr.enregistrer_reception(lot, analyse)

print(f"Statut: {result['statut']}")
print(f"Décision: {result['decision']}")

if result['statut'] == 'conforme':
    print("✓ Lot libéré pour production")
else:
    print("⚠️ Lot en quarantaine ou refusé")
```

### Traçabilité complète

```python
# Obtenir la traçabilité d'un lot
trace = quality_mgr.tracer_lot("LOT_2025_001")

print(f"Fournisseur: {trace['origine']['fournisseur_id']}")
print(f"Date fabrication: {trace['origine']['date_fabrication']}")
print(f"Stockage: {trace['stockage']['zone']}")
print(f"Quantité restante: {trace['quantites']['restante_kg']} kg")
print(f"Utilisé dans {trace['utilisations']['nombre_lots']} lots de production")
```

---

## 🎯 Cas d'Usage Complets {#cas-usage}

### Cas 1 : Sourcing d'urgence

**Situation** : Rupture imprévue, besoin d'un nouveau fournisseur rapidement

```python
# 1. Découverte URGENTE
discovery = SupplierDiscoveryEngine()
criteres = CritereRecherche(
    type_fournisseur=SupplierType.RAW_MATERIAL,
    matieres_premieres=["Semoule"],
    priorite=SearchPriority.URGENT,
    rayon_km=300,  # Proche uniquement
    nombre_max_resultats=5
)

resultat = discovery.search_suppliers(criteres, notre_localisation)
print(f"✓ {resultat.nombre_total} fournisseurs trouvés")

# 2. Contacter le TOP 1 immédiatement
top1 = resultat.fournisseurs_trouves[0]
print(f"Contacter: {top1.nom_entreprise}")
print(f"Tel: {top1.telephone}")
print(f"Email: {top1.email_contact}")
```

### Cas 2 : Optimisation des coûts

**Situation** : Comparer les prix et trouver le meilleur rapport qualité/prix

```python
# 1. Lancer appel d'offres
rfq = AppelOffres(...)  # Définir l'AO

# 2. Analyser automatiquement
analyzer = RFQAnalyzer()
comparison = analyzer.compare_offers(rfq, offres, suppliers)

# 3. Rapport avec économies
rapport = analyzer.generate_award_report(rfq, comparison)
if rapport['economie_vs_budget']:
    eco = rapport['economie_vs_budget']
    print(f"Économie: {eco['montant']:,.2f} € ({eco['pourcentage']:.1f}%)")
```

### Cas 3 : Gestion proactive des stocks

**Situation** : Anticiper les besoins et éviter les ruptures

```python
# Vérifier quotidiennement
forecast = ForecastEngine()

for matiere_id in ["MAT_SEM_001", "MAT_OEUFS_001"]:
    plan = forecast.generate_procurement_plan(
        matiere_id,
        current_stock=get_stock_actuel(matiere_id),
        lead_time_days=7
    )

    if plan['urgency'] == 'high':
        print(f"⚠️ URGENT - {matiere_id}")
        print(f"   Action: {plan['recommendation']}")
        print(f"   Commander: {plan['net_requirement']:,.0f} kg")

        # Créer commande automatiquement
        create_purchase_order(matiere_id, plan['net_requirement'])
```

---

## 🔧 Configuration

### Personnaliser votre localisation

Modifiez la localisation dans les exemples :

```python
# Paris
notre_localisation = (48.8566, 2.3522)

# Lyon
notre_localisation = (45.7640, 4.8357)

# Marseille
notre_localisation = (43.2965, 5.3698)
```

### Ajuster les seuils

```python
# Stock de sécurité plus élevé
stock_secu = forecast.calculate_safety_stock(
    matiere_id,
    service_level=0.98,  # 98% au lieu de 95%
    lead_time_days=10     # 10 jours au lieu de 7
)
```

---

## 📞 Support

### Problèmes courants

**Erreur : "Module not found"**
```bash
# Vérifier PYTHONPATH
export PYTHONPATH=/chemin/vers/RT-Technologie
python examples/example_supplier_discovery.py
```

**Aucun fournisseur trouvé**
```python
# Élargir les critères
criteres.rayon_km = None  # Pas de limite de distance
criteres.zones_geographiques = [GeographicZone.INTERNATIONAL]
```

### Exemples complets

```bash
# Tous les exemples
python examples/example_complete_workflow.py
python examples/example_supplier_discovery.py
```

---

## 🚀 Prochaines Étapes

1. **Adapter à vos besoins** : Modifier les exemples avec vos vraies données
2. **Intégrer avec votre ERP** : Connecter à votre système existant
3. **Ajouter vos fournisseurs** : Compléter la base de données
4. **Automatiser** : Planifier les vérifications de stock quotidiennes
5. **Former les utilisateurs** : Partager ce guide avec l'équipe achats

---

**Le système est prêt à l'emploi ! 🎉**

Pour toute question : Consultez la documentation complète dans `/docs/DOCUMENTATION.md`
