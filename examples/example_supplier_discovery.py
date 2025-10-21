"""
Exemple de découverte automatique de fournisseurs
"""
import sys
sys.path.append('..')

from src.services.supplier_discovery import SupplierDiscoveryEngine
from src.models.supplier_discovery import (
    CritereRecherche, GeographicZone, SearchPriority
)
from src.models.supplier import SupplierType, CertificationType


def main():
    print("=" * 80)
    print("DÉCOUVERTE AUTOMATIQUE DE FOURNISSEURS")
    print("Système intelligent de sourcing")
    print("=" * 80)
    print()

    # Initialiser le moteur de découverte
    discovery_engine = SupplierDiscoveryEngine()

    # =========================================================================
    # SCÉNARIO 1 : Recherche de fournisseur de semoule
    # =========================================================================
    print("SCÉNARIO 1 : Recherche de fournisseur de semoule de blé dur")
    print("-" * 80)
    print()

    # Définir les critères
    criteres_semoule = CritereRecherche(
        type_fournisseur=SupplierType.RAW_MATERIAL,
        matieres_premieres=["Semoule de blé dur", "Farine"],
        zones_geographiques=[GeographicZone.EU],
        pays_prioritaires=["IT", "FR"],
        certifications_requises=[CertificationType.IFS, CertificationType.ISO_22000],
        certifications_souhaitees=[CertificationType.BIO_EU],
        volume_annuel_estime=500000,  # 500 tonnes
        delai_livraison_max_jours=10,
        bio_requis=False,
        local_prefere=True,
        priorite=SearchPriority.HIGH,
        nombre_max_resultats=10
    )

    print("Critères de recherche définis :")
    print(f"  • Type : {criteres_semoule.type_fournisseur.value}")
    print(f"  • Zones : {', '.join([z.value for z in criteres_semoule.zones_geographiques])}")
    print(f"  • Certifications requises : {', '.join([c.value for c in criteres_semoule.certifications_requises])}")
    print(f"  • Volume annuel : {criteres_semoule.volume_annuel_estime:,} kg")
    print(f"  • Local préféré : {'Oui' if criteres_semoule.local_prefere else 'Non'}")
    print()

    print("🔍 Recherche en cours...")
    print()

    # Lancer la recherche
    # Localisation : Lyon, France (45.7640, 4.8357)
    resultat = discovery_engine.search_suppliers(
        criteres_semoule,
        notre_localisation=(45.7640, 4.8357)  # Lyon
    )

    print(f"✓ Recherche terminée : {resultat.nombre_total} fournisseurs trouvés")
    print()

    # Afficher les résultats
    print("TOP FOURNISSEURS IDENTIFIÉS")
    print("-" * 80)
    print()

    for idx, fournisseur in enumerate(resultat.fournisseurs_trouves[:5], 1):
        print(f"{idx}. {fournisseur.nom_entreprise}")
        print(f"   📍 Localisation : {fournisseur.ville}, {fournisseur.region or ''} ({fournisseur.pays})")
        print(f"   📊 Score de pertinence : {fournisseur.score_pertinence:.1f}/100")
        print(f"   🚚 Distance : {fournisseur.distance_km:.0f} km")
        print(f"   📜 Certifications : {', '.join(fournisseur.certifications_identifiees[:4])}")
        if fournisseur.capacite_production:
            print(f"   🏭 Capacité : {fournisseur.capacite_production}")
        if fournisseur.clients_references:
            print(f"   👥 Références : {', '.join(fournisseur.clients_references[:3])}")
        if fournisseur.site_web:
            print(f"   🌐 Web : {fournisseur.site_web}")
        if fournisseur.raisons_selection:
            print(f"   ✓ Points forts : {', '.join(fournisseur.raisons_selection[:3])}")
        print()

    # Statistiques
    print("STATISTIQUES DE LA RECHERCHE")
    print("-" * 80)
    stats = resultat.statistiques
    print(f"Nombre de résultats : {stats.get('nombre_total', 0)}")
    print(f"Score moyen : {stats.get('score_moyen', 0):.1f}/100")
    print(f"Distance moyenne : {stats.get('distance_moyenne_km', 0):.0f} km")
    print(f"Répartition par pays : {stats.get('par_pays', {})}")
    print(f"Avec certifications : {stats.get('avec_certifications', 0)}")
    print()

    # Actions recommandées
    print("ACTIONS RECOMMANDÉES")
    print("-" * 80)
    for action in resultat.actions_suivantes:
        print(f"• {action}")
    print()

    # =========================================================================
    # SCÉNARIO 2 : Recherche urgente de fournisseur d'œufs BIO
    # =========================================================================
    print()
    print("=" * 80)
    print("SCÉNARIO 2 : Recherche urgente de fournisseur d'œufs BIO")
    print("-" * 80)
    print()

    criteres_oeufs = CritereRecherche(
        type_fournisseur=SupplierType.INGREDIENT,
        matieres_premieres=["Œufs", "Ovoproduits"],
        zones_geographiques=[GeographicZone.EU],
        certifications_requises=[CertificationType.BIO_EU, CertificationType.IFS],
        bio_requis=True,
        local_prefere=True,
        priorite=SearchPriority.URGENT,
        nombre_max_resultats=5
    )

    print("Recherche URGENTE pour :")
    print(f"  • {criteres_oeufs.matieres_premieres}")
    print(f"  • Certification BIO obligatoire")
    print(f"  • Priorité : {criteres_oeufs.priorite.value.upper()}")
    print()

    resultat_oeufs = discovery_engine.search_suppliers(
        criteres_oeufs,
        notre_localisation=(45.7640, 4.8357)
    )

    print(f"✓ {resultat_oeufs.nombre_total} fournisseur(s) BIO trouvé(s)")
    print()

    for idx, f in enumerate(resultat_oeufs.fournisseurs_trouves[:3], 1):
        print(f"{idx}. {f.nom_entreprise} ({f.pays}) - Score: {f.score_pertinence:.1f}/100")
        print(f"   Distance: {f.distance_km:.0f} km - Certifications: {', '.join(f.certifications_identifiees)}")
        print()

    # =========================================================================
    # SCÉNARIO 3 : Recherche d'emballages durables
    # =========================================================================
    print()
    print("=" * 80)
    print("SCÉNARIO 3 : Recherche d'emballages durables")
    print("-" * 80)
    print()

    criteres_emballage = CritereRecherche(
        type_fournisseur=SupplierType.PACKAGING,
        matieres_premieres=["Cartons", "Emballages alimentaires"],
        zones_geographiques=[GeographicZone.REGIONAL, GeographicZone.NATIONAL],
        pays_prioritaires=["FR"],
        rayon_km=300,  # Maximum 300 km
        local_prefere=True,
        priorite=SearchPriority.MEDIUM,
        nombre_max_resultats=5
    )

    print("Critères RSE pour emballages :")
    print(f"  • Zone : Maximum {criteres_emballage.rayon_km} km")
    print(f"  • Préférence locale (circuit court)")
    print()

    resultat_emballage = discovery_engine.search_suppliers(
        criteres_emballage,
        notre_localisation=(45.7640, 4.8357)
    )

    print(f"✓ {resultat_emballage.nombre_total} fournisseur(s) d'emballage trouvé(s)")
    print()

    for idx, f in enumerate(resultat_emballage.fournisseurs_trouves, 1):
        print(f"{idx}. {f.nom_entreprise}")
        print(f"   📍 {f.ville} ({f.pays}) - {f.distance_km:.0f} km")
        print(f"   📊 Score : {f.score_pertinence:.1f}/100")
        print()

    # =========================================================================
    # RAPPORT COMPLET
    # =========================================================================
    print()
    print("=" * 80)
    print("GÉNÉRATION DU RAPPORT COMPLET")
    print("=" * 80)
    print()

    # Générer le rapport formaté pour le premier scénario
    rapport = discovery_engine.generate_discovery_report(resultat)
    print(rapport)

    # =========================================================================
    # RÉSUMÉ GLOBAL
    # =========================================================================
    print()
    print("=" * 80)
    print("RÉSUMÉ DES DÉCOUVERTES")
    print("=" * 80)
    print()
    print(f"Total de recherches effectuées : 3")
    print(f"Total de fournisseurs identifiés : {resultat.nombre_total + resultat_oeufs.nombre_total + resultat_emballage.nombre_total}")
    print()
    print("Prochaines étapes recommandées :")
    print("  1. Contacter les 3 meilleurs candidats pour semoule")
    print("  2. Demander devis URGENT aux fournisseurs d'œufs BIO")
    print("  3. Planifier audits fournisseurs pour qualification")
    print("  4. Intégrer les fournisseurs qualifiés dans le système")
    print()
    print("✓ Système de découverte automatique opérationnel !")
    print()


if __name__ == "__main__":
    main()
