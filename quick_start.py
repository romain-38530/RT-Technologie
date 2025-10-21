#!/usr/bin/env python3
"""
Script de Démarrage Rapide
Système de Sourcing Permanent - RT-Technologie

Utilisation:
    python quick_start.py
"""

import sys
from datetime import datetime


def print_menu():
    """Affiche le menu principal"""
    print()
    print("=" * 80)
    print("SYSTÈME DE SOURCING PERMANENT - DÉMARRAGE RAPIDE")
    print("=" * 80)
    print()
    print("Que voulez-vous faire ?")
    print()
    print("  1. 🔍 Découvrir des fournisseurs (recherche automatique)")
    print("  2. 📋 Simuler un appel d'offres complet")
    print("  3. 📊 Générer des prévisions de consommation")
    print("  4. ✅ Tester le contrôle qualité")
    print("  5. 🎯 Workflow complet (tout en un)")
    print()
    print("  0. ❌ Quitter")
    print()


def decouverte_fournisseurs():
    """Découverte automatique de fournisseurs"""
    print("\n" + "=" * 80)
    print("🔍 DÉCOUVERTE AUTOMATIQUE DE FOURNISSEURS")
    print("=" * 80 + "\n")

    from src.services.supplier_discovery import SupplierDiscoveryEngine
    from src.models.supplier_discovery import CritereRecherche, GeographicZone
    from src.models.supplier import SupplierType, CertificationType

    print("Que cherchez-vous ?")
    print("  1. Semoule de blé dur")
    print("  2. Œufs / Ovoproduits")
    print("  3. Emballages")
    print()
    choix = input("Votre choix (1-3): ").strip()

    if choix == "1":
        type_mat = SupplierType.RAW_MATERIAL
        matieres = ["Semoule de blé dur"]
        print("\n🌾 Recherche de fournisseurs de SEMOULE...")
    elif choix == "2":
        type_mat = SupplierType.INGREDIENT
        matieres = ["Œufs", "Ovoproduits"]
        print("\n🥚 Recherche de fournisseurs d'ŒUFS...")
    elif choix == "3":
        type_mat = SupplierType.PACKAGING
        matieres = ["Cartons", "Emballages"]
        print("\n📦 Recherche de fournisseurs d'EMBALLAGES...")
    else:
        print("❌ Choix invalide")
        return

    # Recherche
    discovery = SupplierDiscoveryEngine()

    criteres = CritereRecherche(
        type_fournisseur=type_mat,
        matieres_premieres=matieres,
        zones_geographiques=[GeographicZone.EU],
        certifications_requises=[CertificationType.IFS],
        local_prefere=True,
        nombre_max_resultats=5
    )

    print("\n🔄 Recherche en cours...")
    resultat = discovery.search_suppliers(
        criteres,
        notre_localisation=(45.7640, 4.8357)  # Lyon
    )

    print(f"\n✅ {resultat.nombre_total} fournisseur(s) trouvé(s)\n")

    if resultat.nombre_total == 0:
        print("Aucun fournisseur trouvé avec ces critères.")
        print("Essayez d'élargir votre recherche.")
        return

    print("TOP FOURNISSEURS IDENTIFIÉS")
    print("-" * 80)

    for idx, f in enumerate(resultat.fournisseurs_trouves[:5], 1):
        print(f"\n{idx}. {f.nom_entreprise} ({f.pays})")
        print(f"   📍 {f.ville}, {f.region or ''}")
        print(f"   📊 Score: {f.score_pertinence:.1f}/100")
        print(f"   🚚 Distance: {f.distance_km:.0f} km")
        if f.certifications_identifiees:
            print(f"   📜 Certif: {', '.join(f.certifications_identifiees[:3])}")
        if f.site_web:
            print(f"   🌐 {f.site_web}")

    print("\n" + "=" * 80)
    print("💡 Actions recommandées:")
    for action in resultat.actions_suivantes[:3]:
        print(f"  • {action}")
    print()


def appel_offres():
    """Simulation d'appel d'offres"""
    print("\n" + "=" * 80)
    print("📋 SIMULATION D'APPEL D'OFFRES")
    print("=" * 80 + "\n")

    print("Cette démo lance un appel d'offres complet avec:")
    print("  • Création de 2 fournisseurs")
    print("  • Lancement d'un appel d'offres pour semoule")
    print("  • Réception de 2 offres")
    print("  • Analyse automatique et attribution")
    print()
    input("Appuyez sur Entrée pour continuer...")

    print("\n🔄 Exécution du workflow d'appel d'offres...\n")

    try:
        import subprocess
        result = subprocess.run(
            ["python", "examples/example_complete_workflow.py"],
            cwd="/home/user/RT-Technologie",
            env={"PYTHONPATH": "/home/user/RT-Technologie"},
            capture_output=True,
            text=True,
            timeout=30
        )
        print(result.stdout)
        if result.returncode != 0:
            print("❌ Erreur:", result.stderr)
    except Exception as e:
        print(f"❌ Erreur lors de l'exécution: {e}")


def previsions():
    """Génération de prévisions"""
    print("\n" + "=" * 80)
    print("📊 PRÉVISIONS DE CONSOMMATION")
    print("=" * 80 + "\n")

    from src.services.forecast_engine import ForecastEngine
    from datetime import date, timedelta
    import random

    print("Génération de prévisions pour semoule de blé dur...\n")

    forecast = ForecastEngine()

    # Simuler 90 jours d'historique
    print("📈 Chargement de l'historique (90 jours)...")
    for i in range(90):
        date_conso = date.today() - timedelta(days=90-i)
        quantite = 2000 + random.randint(-300, 300)
        forecast.add_historical_consumption("SEM_001", date_conso, quantite)

    # Prévisions
    print("\n🔮 Calcul des prévisions...\n")

    prev_30j = forecast.forecast_demand("SEM_001", horizon_days=30)

    print("PRÉVISIONS 30 JOURS")
    print("-" * 80)
    print(f"Consommation moyenne: {prev_30j['daily_average']:.0f} kg/jour")
    print(f"Prévision totale:     {prev_30j['adjusted_forecast']:,.0f} kg")
    print(f"Tendance:             {prev_30j['trend'].upper()}")
    print(f"Fourchette:           {prev_30j['lower_bound']:,.0f} - {prev_30j['upper_bound']:,.0f} kg")

    # Stock de sécurité
    stock_secu = forecast.calculate_safety_stock(
        "SEM_001",
        service_level=0.95,
        lead_time_days=7
    )

    print(f"\n📦 STOCK DE SÉCURITÉ")
    print("-" * 80)
    print(f"Niveau de service:    95%")
    print(f"Délai appro:          7 jours")
    print(f"Stock de sécurité:    {stock_secu['safety_stock']:,.0f} kg")

    # Plan d'approvisionnement
    stock_actuel = 25000
    plan = forecast.generate_procurement_plan(
        "SEM_001",
        current_stock=stock_actuel,
        lead_time_days=7
    )

    print(f"\n🎯 PLAN D'APPROVISIONNEMENT")
    print("-" * 80)
    print(f"Stock actuel:         {plan['current_stock']:,} kg")
    print(f"Stock de sécurité:    {plan['safety_stock']:,.0f} kg")
    print(f"Point de commande:    {plan['reorder_point']:,.0f} kg")
    print(f"Besoin estimé:        {plan['net_requirement']:,.0f} kg")
    print(f"Urgence:              {plan['urgency'].upper()}")
    print(f"\n💡 Recommandation:    {plan['recommendation']}")

    if plan['estimated_stockout_date']:
        print(f"⚠️  Rupture prévue:    {plan['estimated_stockout_date']}")

    print()


def qualite():
    """Test contrôle qualité"""
    print("\n" + "=" * 80)
    print("✅ CONTRÔLE QUALITÉ")
    print("=" * 80 + "\n")

    from src.services.quality_manager import QualityManager
    from src.models.raw_material import LotMatierePremiere, AnalyseQualite
    from datetime import date, timedelta

    print("Simulation de réception d'un lot de semoule...\n")

    quality_mgr = QualityManager()

    # Lot reçu
    lot = LotMatierePremiere(
        id="LOT_TEST_001",
        numero_lot="IT-TEST-001",
        numero_lot_interne="L2025-TEST",
        matiere_premiere_id="SEM_001",
        fournisseur_id="IT_SEM_001",
        date_reception=datetime.now(),
        numero_bon_livraison="BL-TEST-001",
        numero_commande="PO-TEST-001",
        quantite_kg=25000,
        nombre_unites=1000,
        conditionnement="Sac 25kg",
        date_fabrication=date.today() - timedelta(days=3),
        date_peremption=date.today() + timedelta(days=365),
        quantite_restante_kg=25000,
        emplacement_stockage="Zone A - Test",
        zone_stockage="Matières premières"
    )

    # Analyse qualité
    analyse = AnalyseQualite(
        date_analyse=datetime.now(),
        laboratoire="Labo Interne",
        numero_rapport="LAB-TEST-001",
        humidite_percent=13.1,
        taux_proteines_percent=13.8,
        taux_cendres_percent=0.82,
        aflatoxines_ppb=1.8,
        ochratoxine_ppb=1.2,
        bacteries_totales_ufc_g=38000,
        salmonelle_detectee=False,
        listeria_detectee=False,
        conforme=True,
        observations="Lot conforme - Bonne qualité"
    )

    print("📦 LOT REÇU")
    print("-" * 80)
    print(f"Numéro lot:          {lot.numero_lot_interne}")
    print(f"Quantité:            {lot.quantite_kg:,} kg ({lot.nombre_unites} sacs)")
    print(f"Fournisseur:         {lot.fournisseur_id}")
    print(f"Date fabrication:    {lot.date_fabrication}")

    print(f"\n🔬 RÉSULTATS D'ANALYSE")
    print("-" * 80)
    print(f"Humidité:            {analyse.humidite_percent}% (spec: <14.5%)")
    print(f"Protéines:           {analyse.taux_proteines_percent}% (spec: >12.5%)")
    print(f"Cendres:             {analyse.taux_cendres_percent}% (spec: <0.90%)")
    print(f"Aflatoxines:         {analyse.aflatoxines_ppb} ppb (spec: <5 ppb)")
    print(f"Ochratoxine:         {analyse.ochratoxine_ppb} ppb (spec: <3 ppb)")
    print(f"Salmonelle:          {'DÉTECTÉE ❌' if analyse.salmonelle_detectee else 'NON DÉTECTÉE ✓'}")
    print(f"Listeria:            {'DÉTECTÉE ❌' if analyse.listeria_detectee else 'NON DÉTECTÉE ✓'}")

    # Enregistrement
    result = quality_mgr.enregistrer_reception(lot, analyse)

    print(f"\n🎯 DÉCISION")
    print("-" * 80)
    print(f"Statut:              {result['statut'].upper()}")
    print(f"Décision:            {result['decision']}")

    if result['statut'] == 'conforme':
        print(f"\n✅ LOT ACCEPTÉ - Libéré pour production")
        print(f"\nActions:")
        for action in result['actions']:
            print(f"  • {action}")
    else:
        print(f"\n⚠️ LOT NON CONFORME - Mise en quarantaine")

    # Traçabilité
    trace = quality_mgr.tracer_lot(lot.id)
    print(f"\n📋 TRAÇABILITÉ")
    print("-" * 80)
    print(f"Origine:             {trace['origine']['fournisseur_id']}")
    print(f"Stockage:            {trace['stockage']['zone']}")
    print(f"Quantité restante:   {trace['quantites']['restante_kg']:,} kg")

    print()


def workflow_complet():
    """Workflow complet"""
    print("\n" + "=" * 80)
    print("🎯 WORKFLOW COMPLET DE SOURCING")
    print("=" * 80 + "\n")

    print("Ce workflow démontre toute la chaîne:")
    print("  1. Gestion des fournisseurs")
    print("  2. Définition matières premières")
    print("  3. Appel d'offres")
    print("  4. Analyse automatique des offres")
    print("  5. Attribution intelligente")
    print("  6. Contrat cadre")
    print("  7. Prévisions de consommation")
    print("  8. Plan d'approvisionnement")
    print("  9. Réception et contrôle qualité")
    print()
    input("Appuyez sur Entrée pour lancer le workflow complet...")

    print("\n🚀 Exécution...\n")

    try:
        import subprocess
        result = subprocess.run(
            ["python", "examples/example_complete_workflow.py"],
            cwd="/home/user/RT-Technologie",
            env={"PYTHONPATH": "/home/user/RT-Technologie"},
            text=True,
            timeout=60
        )
        if result.returncode != 0:
            print("❌ Erreur lors de l'exécution")
    except Exception as e:
        print(f"❌ Erreur: {e}")


def main():
    """Fonction principale"""
    while True:
        print_menu()
        choix = input("Votre choix: ").strip()

        if choix == "0":
            print("\n👋 Au revoir !\n")
            sys.exit(0)
        elif choix == "1":
            decouverte_fournisseurs()
        elif choix == "2":
            appel_offres()
        elif choix == "3":
            previsions()
        elif choix == "4":
            qualite()
        elif choix == "5":
            workflow_complet()
        else:
            print("\n❌ Choix invalide. Veuillez choisir entre 0 et 5.\n")

        input("\nAppuyez sur Entrée pour revenir au menu...")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Interruption utilisateur. Au revoir !\n")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Erreur inattendue: {e}\n")
        sys.exit(1)
