"""
Exemple complet de workflow du système de sourcing
Usine de pâtes alimentaires
"""
from datetime import datetime, date, timedelta
import sys
sys.path.append('..')

from src.models.supplier import (
    Fournisseur, SupplierType, SupplierStatus,
    AdresseFournisseur, ContactFournisseur, ConditionsCommerciales,
    Certification, CertificationType, EvaluationFournisseur
)
from src.models.raw_material import (
    MatierePremiere, RawMaterialCategory, QualityGrade,
    StorageCondition, SpecificationTechnique, LotMatierePremiere,
    AnalyseQualite
)
from src.models.rfq import (
    AppelOffres, RFQType, RFQStatus, LigneRFQ,
    CritereEvaluation, EvaluationCriteria,
    OffreFournisseur, LigneOffre
)
from src.models.contract import (
    ContratFournisseur, ContractType, ContractStatus,
    PrixContractuel, PriceReviewMethod, VolumeTier
)
from src.models.procurement import (
    Commande, OrderType, OrderStatus, LigneCommande,
    PlanApprovisionnement
)
from src.services.supplier_manager import SupplierManager
from src.services.rfq_analyzer import RFQAnalyzer
from src.services.forecast_engine import ForecastEngine
from src.services.quality_manager import QualityManager


def main():
    print("=" * 80)
    print("SYSTÈME DE SOURCING PERMANENT - USINE DE PÂTES ALIMENTAIRES")
    print("=" * 80)
    print()

    # =========================================================================
    # ÉTAPE 1 : CRÉATION ET GESTION DES FOURNISSEURS
    # =========================================================================
    print("ÉTAPE 1 : Gestion des Fournisseurs")
    print("-" * 80)

    supplier_manager = SupplierManager()

    # Fournisseur 1 : Semoule italienne (premium)
    fournisseur_it = Fournisseur(
        id="IT_SEM_001",
        nom_entreprise="Molino Grassi S.p.A",
        type=SupplierType.RAW_MATERIAL,
        statut=SupplierStatus.ACTIVE,
        numero_siret="IT12345678901",
        numero_tva="IT12345678901",
        forme_juridique="SPA",
        adresse=AdresseFournisseur(
            rue="Via delle Industrie 42",
            code_postal="43122",
            ville="Parma",
            pays="IT",
            region="Emilia-Romagna"
        ),
        contacts=[
            ContactFournisseur(
                nom="Rossi",
                prenom="Marco",
                fonction="Responsable Export",
                email="m.rossi@molinograssi.it",
                telephone="+39 0521 123456",
                langue_principale="it"
            )
        ],
        certifications=[
            Certification(
                type=CertificationType.IFS,
                numero="IFS-2024-IT-001",
                organisme="Bureau Veritas",
                date_obtention=datetime(2024, 1, 15),
                date_expiration=datetime(2025, 1, 14)
            ),
            Certification(
                type=CertificationType.BIO_EU,
                numero="BIO-IT-2024-789",
                organisme="ICEA",
                date_obtention=datetime(2023, 6, 1),
                date_expiration=datetime(2025, 5, 31)
            )
        ],
        conditions=ConditionsCommerciales(
            delai_paiement_jours=60,
            remise_volume_percent=5,
            quantite_minimum_commande=10000,
            unite_commande="kg",
            delai_livraison_jours=10,
            franco_de_port=50000
        ),
        fournisseur_principal=True
    )

    # Fournisseur 2 : Semoule française (local)
    fournisseur_fr = Fournisseur(
        id="FR_SEM_001",
        nom_entreprise="Moulins Soufflet",
        type=SupplierType.RAW_MATERIAL,
        statut=SupplierStatus.ACTIVE,
        numero_siret="12345678901234",
        numero_tva="FR12345678901",
        forme_juridique="SAS",
        adresse=AdresseFournisseur(
            rue="10 Rue de la Minoterie",
            code_postal="51100",
            ville="Reims",
            pays="FR",
            region="Grand Est"
        ),
        contacts=[
            ContactFournisseur(
                nom="Dubois",
                prenom="Philippe",
                fonction="Directeur Commercial",
                email="p.dubois@soufflet.com",
                telephone="+33 3 26 12 34 56",
                langue_principale="fr"
            )
        ],
        certifications=[
            Certification(
                type=CertificationType.ISO_22000,
                numero="ISO22000-FR-2024-123",
                organisme="SGS",
                date_obtention=datetime(2023, 3, 10),
                date_expiration=datetime(2026, 3, 9)
            )
        ],
        conditions=ConditionsCommerciales(
            delai_paiement_jours=45,
            remise_volume_percent=3,
            quantite_minimum_commande=5000,
            unite_commande="kg",
            delai_livraison_jours=5,
            franco_de_port=30000
        ),
        fournisseur_secours=True
    )

    # Enregistrer les fournisseurs
    supplier_manager.create_supplier(fournisseur_it)
    supplier_manager.create_supplier(fournisseur_fr)

    # Ajouter des évaluations
    eval_it = EvaluationFournisseur(
        date_evaluation=datetime(2024, 9, 1),
        qualite_produits=5,
        respect_delais=4,
        service_client=5,
        competitivite_prix=3,
        conformite_reglementaire=5,
        evaluateur="Jean Dupont - Responsable Achats",
        commentaires="Excellente qualité constante, prix premium justifié"
    )
    supplier_manager.add_evaluation("IT_SEM_001", eval_it)

    print(f"✓ Fournisseur italien créé : {fournisseur_it.nom_entreprise}")
    print(f"  Note globale : {eval_it.note_globale:.2f}/5")
    print(f"✓ Fournisseur français créé : {fournisseur_fr.nom_entreprise}")
    print()

    # =========================================================================
    # ÉTAPE 2 : CRÉATION D'UNE MATIÈRE PREMIÈRE
    # =========================================================================
    print("ÉTAPE 2 : Définition de la Matière Première")
    print("-" * 80)

    semoule_ble_dur = MatierePremiere(
        id="MAT_SEM_001",
        code_interne="SEM-BLE-DUR-001",
        nom="Semoule de blé dur - Qualité supérieure",
        categorie=RawMaterialCategory.SEMOLINA,
        grade=QualityGrade.PREMIUM,
        fournisseur_id="IT_SEM_001",
        fournisseurs_alternatifs=["FR_SEM_001"],
        specifications=SpecificationTechnique(
            humidite_max_percent=14.5,
            humidite_min_percent=12.0,
            granulometrie_min_microns=200,
            granulometrie_max_microns=500,
            proteines_min_percent=12.5,
            proteines_max_percent=15.0,
            cendres_max_percent=0.90,
            aflatoxines_max_ppb=5.0,
            ochratoxine_max_ppb=3.0,
            plomb_max_ppm=0.2,
            cadmium_max_ppm=0.1,
            bacteries_totales_max_ufc_g=100000,
            coliformes_max_ufc_g=100,
            salmonelle_tolerance=False,
            listeria_tolerance=False,
            couleur_reference="Jaune ambrée caractéristique",
            odeur_reference="Odeur de blé caractéristique, sans odeur étrangère"
        ),
        pays_origine="IT",
        region_origine="Basilicata",
        conditionnement_standard="Sac papier 25 kg",
        poids_net_kg=25.0,
        unite_commande="kg",
        prix_unitaire_eur=0.75,
        condition_stockage=StorageCondition.DRY,
        duree_vie_jours=365,
        stock_securite_kg=15000,
        stock_minimum_kg=20000,
        stock_maximum_kg=80000,
        consommation_moyenne_kg_jour=2000
    )

    print(f"✓ Matière première créée : {semoule_ble_dur.nom}")
    print(f"  Fournisseur principal : {fournisseur_it.nom_entreprise}")
    print(f"  Taux de protéines requis : {semoule_ble_dur.specifications.proteines_min_percent}% min")
    print(f"  Stock de sécurité : {semoule_ble_dur.stock_securite_kg:,} kg")
    print()

    # =========================================================================
    # ÉTAPE 3 : APPEL D'OFFRES
    # =========================================================================
    print("ÉTAPE 3 : Lancement d'un Appel d'Offres")
    print("-" * 80)

    rfq = AppelOffres(
        id="RFQ_2024_001",
        numero_rfq="AO-2024-SEM-001",
        titre="Fourniture semoule de blé dur - Contrat annuel 2025",
        type=RFQType.FRAMEWORK,
        statut=RFQStatus.PUBLISHED,
        description="Appel d'offres pour la fourniture de semoule de blé dur premium",
        objectifs=[
            "Sécuriser l'approvisionnement pour 2025",
            "Obtenir les meilleures conditions tarifaires",
            "Garantir la qualité premium"
        ],
        lignes=[
            LigneRFQ(
                numero_ligne=1,
                matiere_premiere_id="MAT_SEM_001",
                designation="Semoule de blé dur - Qualité supérieure",
                description_detaillee="Semoule de blé dur, granulométrie 200-500µm, min 12.5% protéines",
                quantite_estimee=600000,  # 600 tonnes/an
                unite="kg",
                quantite_minimale=500000,
                quantite_maximale=800000,
                specifications_techniques="Conforme spécifications MAT_SEM_001",
                certifications_requises=["IFS Food", "ISO 22000"],
                normes_applicables=["Règlement UE 1169/2011", "ISO 22000"],
                date_livraison_souhaitee=date(2025, 1, 15),
                frequence_livraison="hebdomadaire",
                duree_contrat_mois=12,
                echantillons_requis=True
            )
        ],
        date_publication=datetime(2024, 10, 1),
        date_limite_questions=datetime(2024, 10, 15),
        date_limite_soumission=datetime(2024, 10, 31),
        date_attribution_prevue=date(2024, 11, 15),
        fournisseurs_invites=["IT_SEM_001", "FR_SEM_001"],
        criteres_evaluation=[
            CritereEvaluation(
                critere=EvaluationCriteria.PRICE,
                poids_percent=35,
                description="Compétitivité tarifaire",
                bareme_notation={"Excellent": 100, "Bon": 75, "Moyen": 50}
            ),
            CritereEvaluation(
                critere=EvaluationCriteria.QUALITY,
                poids_percent=30,
                description="Qualité produit et historique fournisseur",
                bareme_notation={"Excellent": 100, "Bon": 75, "Moyen": 50}
            ),
            CritereEvaluation(
                critere=EvaluationCriteria.DELIVERY_TIME,
                poids_percent=20,
                description="Délais et fiabilité de livraison",
                bareme_notation={"Excellent": 100, "Bon": 75, "Moyen": 50}
            ),
            CritereEvaluation(
                critere=EvaluationCriteria.SUSTAINABILITY,
                poids_percent=15,
                description="Approche RSE et durabilité",
                bareme_notation={"Excellent": 100, "Bon": 75, "Moyen": 50}
            )
        ],
        conditions_paiement_souhaitees="60 jours fin de mois",
        budget_estimatif=450000,  # 0.75€/kg × 600,000kg
        responsable_achat="Jean Dupont"
    )

    print(f"✓ Appel d'offres créé : {rfq.numero_rfq}")
    print(f"  Volume annuel estimé : {rfq.lignes[0].quantite_estimee:,} kg")
    print(f"  Budget estimatif : {rfq.budget_estimatif:,} €")
    print(f"  Date limite soumission : {rfq.date_limite_soumission.date()}")
    print()

    # =========================================================================
    # ÉTAPE 4 : RÉCEPTION DES OFFRES
    # =========================================================================
    print("ÉTAPE 4 : Réception et Analyse des Offres")
    print("-" * 80)

    # Offre fournisseur italien
    offre_it = OffreFournisseur(
        id="OFF_2024_001_IT",
        numero_offre="OFF-IT-2024-001",
        rfq_id="RFQ_2024_001",
        fournisseur_id="IT_SEM_001",
        nom_fournisseur="Molino Grassi S.p.A",
        date_soumission=datetime(2024, 10, 25),
        date_validite_offre=date(2025, 1, 31),
        lignes=[
            LigneOffre(
                numero_ligne_rfq=1,
                matiere_premiere_id="MAT_SEM_001",
                prix_unitaire=0.72,
                remise_volume_percent=5,  # Si > 700 tonnes
                quantite_proposee=650000,
                unite="kg",
                delai_livraison_jours=10,
                date_livraison_proposee=date(2025, 1, 15),
                certifications=["IFS Food Higher Level", "Bio EU", "ISO 9001"],
                origine="Italie - Basilicata",
                references_clients="Barilla, De Cecco, Panzani"
            )
        ],
        conditions_paiement="60 jours fin de mois",
        delai_paiement_jours=60,
        echantillons_fournis=True,
        commentaires_fournisseur="Semoule premium de blé dur italien IGP Basilicata"
    )
    offre_it.calculer_totaux()

    # Offre fournisseur français
    offre_fr = OffreFournisseur(
        id="OFF_2024_001_FR",
        numero_offre="OFF-FR-2024-001",
        rfq_id="RFQ_2024_001",
        fournisseur_id="FR_SEM_001",
        nom_fournisseur="Moulins Soufflet",
        date_soumission=datetime(2024, 10, 28),
        date_validite_offre=date(2025, 1, 31),
        lignes=[
            LigneOffre(
                numero_ligne_rfq=1,
                matiere_premiere_id="MAT_SEM_001",
                prix_unitaire=0.68,
                remise_volume_percent=3,
                quantite_proposee=600000,
                unite="kg",
                delai_livraison_jours=5,  # Plus rapide car France
                date_livraison_proposee=date(2025, 1, 10),
                certifications=["ISO 22000", "HACCP"],
                origine="France - Beauce",
                references_clients="Lustucru, Panzani France"
            )
        ],
        conditions_paiement="45 jours fin de mois",
        delai_paiement_jours=45,
        echantillons_fournis=True,
        commentaires_fournisseur="Blé dur français, circuit court, empreinte carbone réduite"
    )
    offre_fr.calculer_totaux()

    print(f"✓ Offre reçue de {offre_it.nom_fournisseur}")
    print(f"  Prix : {offre_it.lignes[0].prix_net_unitaire:.2f} €/kg")
    print(f"  Montant total : {offre_it.montant_total_ht:,.2f} €")
    print()
    print(f"✓ Offre reçue de {offre_fr.nom_fournisseur}")
    print(f"  Prix : {offre_fr.lignes[0].prix_net_unitaire:.2f} €/kg")
    print(f"  Montant total : {offre_fr.montant_total_ht:,.2f} €")
    print()

    # =========================================================================
    # ÉTAPE 5 : ANALYSE AUTOMATIQUE DES OFFRES
    # =========================================================================
    print("ÉTAPE 5 : Analyse Automatique et Attribution")
    print("-" * 80)

    analyzer = RFQAnalyzer()
    suppliers_dict = {
        "IT_SEM_001": fournisseur_it,
        "FR_SEM_001": fournisseur_fr
    }

    comparison = analyzer.compare_offers(
        rfq,
        [offre_it, offre_fr],
        suppliers_dict
    )

    print("\nRésultats de l'analyse automatique :")
    print()
    for idx, result in enumerate(comparison, 1):
        print(f"{idx}. {result['nom_fournisseur']}")
        print(f"   Note finale : {result['note_finale']:.1f}/100")
        print(f"   Note technique : {result['note_technique']:.1f}/100")
        print(f"   Note commerciale : {result['note_commerciale']:.1f}/100")
        print(f"   Montant HT : {result['montant_ht']:,.2f} €")
        print(f"   Recommandation : {result['recommandation'].upper()}")
        if result['points_forts']:
            print(f"   Points forts : {', '.join(result['points_forts'][:3])}")
        print()

    # Rapport d'attribution
    report = analyzer.generate_award_report(rfq, comparison)

    print("RAPPORT D'ATTRIBUTION")
    print("=" * 80)
    print(f"Fournisseur retenu : {report['offre_retenue']['fournisseur']}")
    print(f"Montant : {report['offre_retenue']['montant_ht']:,.2f} €")
    print(f"Note finale : {report['offre_retenue']['note_finale']:.1f}/100")
    print(f"Justification : {report['offre_retenue']['justification']}")
    print()
    if report.get('economie_vs_budget'):
        economie = report['economie_vs_budget']
        print(f"Économie vs budget : {economie['montant']:,.2f} € ({economie['pourcentage']:.1f}%)")
    print()

    # =========================================================================
    # ÉTAPE 6 : CRÉATION DU CONTRAT
    # =========================================================================
    print("ÉTAPE 6 : Établissement du Contrat Cadre")
    print("-" * 80)

    contrat = ContratFournisseur(
        id="CTR_2025_001",
        numero_contrat="CTR-2025-SEM-001",
        type=ContractType.FRAMEWORK,
        statut=ContractStatus.ACTIVE,
        fournisseur_id=comparison[0]['fournisseur_id'],
        nom_fournisseur=comparison[0]['nom_fournisseur'],
        objet="Fourniture de semoule de blé dur pour l'année 2025",
        description="Contrat cadre annuel de fourniture de semoule",
        matieres_premieres=["MAT_SEM_001"],
        date_signature=date(2024, 11, 20),
        date_debut=date(2025, 1, 1),
        date_fin=date(2025, 12, 31),
        duree_mois=12,
        renouvellement_automatique=False,
        prix_contractuels=[
            PrixContractuel(
                matiere_premiere_id="MAT_SEM_001",
                designation="Semoule de blé dur",
                prix_unitaire_base=comparison[0]['montant_ht'] / 650000,
                paliers_volume=[
                    VolumeTier(volume_minimum=0, volume_maximum=500000, remise_percent=0),
                    VolumeTier(volume_minimum=500000, volume_maximum=700000, remise_percent=3),
                    VolumeTier(volume_minimum=700000, remise_percent=5)
                ],
                methode_revision=PriceReviewMethod.INDEXED,
                indice_reference="Prix du blé dur Euronext",
                quantite_minimale_commande=10000,
                unite="kg",
                delai_livraison_jours=10,
                date_debut_validite=date(2025, 1, 1),
                date_fin_validite=date(2025, 12, 31)
            )
        ],
        volume_minimum_annuel=500000,
        volume_maximum_annuel=800000,
        delai_paiement_jours=60,
        mode_paiement="Virement bancaire",
        delai_livraison_standard_jours=10,
        lieux_livraison=["Site principal - Zone de réception"],
        specifications_qualite="Conforme spécifications techniques MAT_SEM_001",
        taux_conformite_minimum_percent=98,
        responsable_achat="Jean Dupont"
    )

    print(f"✓ Contrat établi : {contrat.numero_contrat}")
    print(f"  Fournisseur : {contrat.nom_fournisseur}")
    print(f"  Durée : {contrat.duree_mois} mois")
    print(f"  Volume annuel : {contrat.volume_minimum_annuel:,} - {contrat.volume_maximum_annuel:,} kg")
    print(f"  Prix de base : {contrat.prix_contractuels[0].prix_unitaire_base:.3f} €/kg")
    print()

    # =========================================================================
    # ÉTAPE 7 : PRÉVISIONS ET PLANIFICATION
    # =========================================================================
    print("ÉTAPE 7 : Prévisions et Planification des Approvisionnements")
    print("-" * 80)

    forecast_engine = ForecastEngine()

    # Simuler des données historiques de consommation
    for i in range(90):
        consumption_date = date.today() - timedelta(days=90-i)
        # Consommation moyenne 2000 kg/jour avec variation
        base_consumption = 2000
        variation = np.random.normal(0, 200)  # Variation ±200kg
        quantity = max(0, base_consumption + variation)

        forecast_engine.add_historical_consumption(
            "MAT_SEM_001",
            consumption_date,
            quantity
        )

    # Prévisions
    forecast_30j = forecast_engine.forecast_demand("MAT_SEM_001", horizon_days=30)
    print(f"✓ Prévision de consommation (30 jours) : {forecast_30j['adjusted_forecast']:,.0f} kg")
    print(f"  Consommation moyenne journalière : {forecast_30j['daily_average']:.0f} kg/jour")
    print(f"  Tendance : {forecast_30j['trend']}")
    print()

    # Plan d'approvisionnement
    stock_actuel = 25000  # 25 tonnes en stock
    plan = forecast_engine.generate_procurement_plan(
        matiere_id="MAT_SEM_001",
        current_stock=stock_actuel,
        lead_time_days=10,
        planning_horizon_days=30
    )

    print(f"✓ Plan d'approvisionnement")
    print(f"  Stock actuel : {plan['current_stock']:,.0f} kg")
    print(f"  Stock de sécurité : {plan['safety_stock']:,.0f} kg")
    print(f"  Point de commande : {plan['reorder_point']:,.0f} kg")
    print(f"  Besoin net : {plan['net_requirement']:,.0f} kg")
    print(f"  Urgence : {plan['urgency'].upper()}")
    print(f"  Recommandation : {plan['recommendation']}")
    if plan['estimated_stockout_date']:
        print(f"  Date rupture estimée : {plan['estimated_stockout_date']}")
    print()

    # =========================================================================
    # ÉTAPE 8 : COMMANDE
    # =========================================================================
    print("ÉTAPE 8 : Passation de Commande")
    print("-" * 80)

    if plan['need_to_order']:
        commande = Commande(
            id="CMD_2024_001",
            numero_commande="PO-2024-001",
            type_commande=OrderType.CALL_OFF,
            fournisseur_id=contrat.fournisseur_id,
            nom_fournisseur=contrat.nom_fournisseur,
            date_livraison_souhaitee=date.today() + timedelta(days=10),
            lignes=[
                LigneCommande(
                    numero_ligne=1,
                    matiere_premiere_id="MAT_SEM_001",
                    designation="Semoule de blé dur",
                    quantite=plan['net_requirement'],
                    unite="kg",
                    prix_unitaire=contrat.prix_contractuels[0].prix_unitaire_base,
                    date_livraison_souhaitee=date.today() + timedelta(days=10)
                )
            ],
            adresse_livraison="Site principal - Zone de réception",
            conditions_paiement="60 jours fin de mois",
            demandeur="Système automatique",
            commentaires=f"Commande automatique - Stock actuel : {stock_actuel} kg"
        )
        commande.calculer_totaux()

        print(f"✓ Commande générée : {commande.numero_commande}")
        print(f"  Quantité : {commande.lignes[0].quantite:,.0f} kg")
        print(f"  Montant HT : {commande.montant_total_ht:,.2f} €")
        print(f"  Date livraison souhaitée : {commande.date_livraison_souhaitee}")
        print()

    # =========================================================================
    # ÉTAPE 9 : RÉCEPTION ET CONTRÔLE QUALITÉ
    # =========================================================================
    print("ÉTAPE 9 : Réception et Contrôle Qualité")
    print("-" * 80)

    quality_manager = QualityManager()

    # Lot reçu
    lot = LotMatierePremiere(
        id="LOT_2024_001",
        numero_lot="IT-GR-241115-001",  # Numéro fournisseur
        numero_lot_interne="L2024-001",
        matiere_premiere_id="MAT_SEM_001",
        fournisseur_id=contrat.fournisseur_id,
        date_reception=datetime.now(),
        numero_bon_livraison="BL-IT-123456",
        numero_commande="PO-2024-001",
        quantite_kg=50000,
        nombre_unites=2000,  # 2000 sacs de 25kg
        conditionnement="Sac papier 25 kg",
        date_fabrication=date.today() - timedelta(days=5),
        date_peremption=date.today() + timedelta(days=365),
        quantite_restante_kg=50000,
        emplacement_stockage="Zone A - Allée 3",
        zone_stockage="Matières premières sèches"
    )

    # Analyse qualité à réception
    analyse = AnalyseQualite(
        date_analyse=datetime.now(),
        laboratoire="Laboratoire interne",
        numero_rapport="LAB-2024-001",
        humidite_percent=13.2,
        taux_proteines_percent=13.5,
        taux_cendres_percent=0.85,
        granulometrie_microns=350,
        aflatoxines_ppb=2.1,
        ochratoxine_ppb=1.5,
        bacteries_totales_ufc_g=45000,
        coliformes_ufc_g=50,
        salmonelle_detectee=False,
        listeria_detectee=False,
        conforme=True,
        non_conformites=[],
        observations="Lot conforme - Excellente qualité"
    )

    # Enregistrement de la réception
    result = quality_manager.enregistrer_reception(lot, analyse)

    print(f"✓ Lot reçu : {lot.numero_lot_interne}")
    print(f"  Quantité : {lot.quantite_kg:,.0f} kg")
    print(f"  Statut qualité : {result['statut'].upper()}")
    print(f"  Décision : {result['decision']}")
    print()
    print("Résultats d'analyse :")
    print(f"  - Humidité : {analyse.humidite_percent}%")
    print(f"  - Protéines : {analyse.taux_proteines_percent}%")
    print(f"  - Aflatoxines : {analyse.aflatoxines_ppb} ppb")
    print(f"  - Microbiologie : Conforme")
    print()

    # Traçabilité
    trace = quality_manager.tracer_lot(lot.id)
    print("✓ Traçabilité complète disponible")
    print(f"  Origine : {trace['origine']['fournisseur_id']}")
    print(f"  Date fabrication : {trace['origine']['date_fabrication']}")
    print(f"  Stockage : {trace['stockage']['zone']} - {trace['stockage']['emplacement']}")
    print()

    # =========================================================================
    # CONCLUSION
    # =========================================================================
    print("=" * 80)
    print("WORKFLOW COMPLET EXÉCUTÉ AVEC SUCCÈS")
    print("=" * 80)
    print()
    print("Résumé du processus :")
    print("1. ✓ Fournisseurs qualifiés et évalués")
    print("2. ✓ Matière première spécifiée avec normes qualité")
    print("3. ✓ Appel d'offres publié et diffusé")
    print("4. ✓ Offres reçues et analysées automatiquement")
    print("5. ✓ Attribution basée sur scoring multi-critères")
    print("6. ✓ Contrat cadre établi avec conditions commerciales")
    print("7. ✓ Prévisions de consommation calculées")
    print("8. ✓ Commande générée automatiquement")
    print("9. ✓ Réception avec contrôle qualité et traçabilité")
    print()
    print("Le système est opérationnel et autonome !")
    print()


if __name__ == "__main__":
    import numpy as np
    main()
