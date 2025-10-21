"""
Moteur de découverte automatique de fournisseurs
"""
from datetime import datetime
from typing import List, Dict, Optional
import json
from pathlib import Path
import random

from ..models.supplier_discovery import (
    CritereRecherche, FournisseurPotentiel, RechercheResultat,
    SourceDonnees, MatchScore, GeographicZone, SupplierSize
)
from ..models.supplier import SupplierType, CertificationType


class SupplierDiscoveryEngine:
    """
    Moteur de découverte automatique de fournisseurs
    Simule la recherche dans différentes sources de données
    """

    def __init__(self, data_dir: str = "data/supplier_discovery"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)

        # Base de données simulée de fournisseurs européens
        self.supplier_database = self._initialize_database()

    def _initialize_database(self) -> List[Dict]:
        """
        Initialise une base de données simulée de fournisseurs européens
        pour les matières premières de pâtes alimentaires
        """
        return [
            # Fournisseurs de semoule italiens
            {
                "nom": "Molino Casillo S.r.l",
                "pays": "IT",
                "ville": "Corato",
                "region": "Puglia",
                "type": SupplierType.RAW_MATERIAL,
                "produits": ["Semoule de blé dur", "Farine de blé"],
                "certifications": ["IFS Food", "BRC", "Bio EU"],
                "taille": SupplierSize.LARGE,
                "capacite_production": "250000 tonnes/an",
                "clients_ref": ["Barilla", "De Cecco"],
                "site_web": "www.molinocasillo.it",
                "lat": 41.1369,
                "lon": 16.3109
            },
            {
                "nom": "Molino Quaglia S.p.A",
                "pays": "IT",
                "ville": "Vighizzolo d'Este",
                "region": "Veneto",
                "type": SupplierType.RAW_MATERIAL,
                "produits": ["Semoule bio", "Farines spéciales"],
                "certifications": ["Bio EU", "Demeter", "ISO 22000"],
                "taille": SupplierSize.MEDIUM,
                "capacite_production": "80000 tonnes/an",
                "clients_ref": ["Eataly", "Whole Foods"],
                "site_web": "www.molinoquaglia.it",
                "lat": 45.2189,
                "lon": 11.6581
            },
            {
                "nom": "Agugiaro & Figna S.p.A",
                "pays": "IT",
                "ville": "Curtarolo",
                "region": "Veneto",
                "type": SupplierType.RAW_MATERIAL,
                "produits": ["Semoule premium", "Farines"],
                "certifications": ["IFS Food Higher Level", "BRC AA", "ISO 9001"],
                "taille": SupplierSize.LARGE,
                "capacite_production": "500000 tonnes/an",
                "clients_ref": ["Barilla", "Panzani", "Buitoni"],
                "site_web": "www.agugiarofigna.it",
                "lat": 45.5398,
                "lon": 11.7845
            },

            # Fournisseurs français
            {
                "nom": "Grands Moulins de Paris",
                "pays": "FR",
                "ville": "Paris",
                "region": "Île-de-France",
                "type": SupplierType.RAW_MATERIAL,
                "produits": ["Semoule de blé dur", "Farines panifiables"],
                "certifications": ["IFS Food", "ISO 22000", "Label Rouge"],
                "taille": SupplierSize.LARGE,
                "capacite_production": "400000 tonnes/an",
                "clients_ref": ["Lustucru", "Panzani France"],
                "site_web": "www.gdmoulins.com",
                "lat": 48.8566,
                "lon": 2.3522
            },
            {
                "nom": "Moulins Bourgeois",
                "pays": "FR",
                "ville": "Verdelot",
                "region": "Seine-et-Marne",
                "type": SupplierType.RAW_MATERIAL,
                "produits": ["Semoule bio", "Farines anciennes"],
                "certifications": ["Bio EU", "Nature & Progrès", "ISO 14001"],
                "taille": SupplierSize.MEDIUM,
                "capacite_production": "50000 tonnes/an",
                "clients_ref": ["Biocoop", "La Vie Claire"],
                "site_web": "www.moulins-bourgeois.com",
                "lat": 48.8405,
                "lon": 3.3567
            },
            {
                "nom": "Moulins Familiaux",
                "pays": "FR",
                "ville": "Narbonne",
                "region": "Occitanie",
                "type": SupplierType.RAW_MATERIAL,
                "produits": ["Semoule de blé dur local"],
                "certifications": ["ISO 22000", "HACCP"],
                "taille": SupplierSize.SMALL,
                "capacite_production": "30000 tonnes/an",
                "clients_ref": ["Producteurs locaux"],
                "site_web": "www.moulinsfamiliaux.fr",
                "lat": 43.1839,
                "lon": 3.0044
            },

            # Fournisseurs espagnols
            {
                "nom": "Harineras Villamayor",
                "pays": "ES",
                "ville": "Córdoba",
                "region": "Andalucía",
                "type": SupplierType.RAW_MATERIAL,
                "produits": ["Semoule de blé dur", "Semoule complète"],
                "certifications": ["IFS Food", "BRC", "ISO 9001"],
                "taille": SupplierSize.MEDIUM,
                "capacite_production": "120000 tonnes/an",
                "clients_ref": ["Gallo", "Pastas Romero"],
                "site_web": "www.harineras-villamayor.es",
                "lat": 37.8882,
                "lon": -4.7794
            },

            # Fournisseurs allemands
            {
                "nom": "Meyermühle GmbH",
                "pays": "DE",
                "ville": "Landshut",
                "region": "Bayern",
                "type": SupplierType.RAW_MATERIAL,
                "produits": ["Semoule bio certifiée", "Farines"],
                "certifications": ["Bio EU", "Bioland", "IFS Food"],
                "taille": SupplierSize.MEDIUM,
                "capacite_production": "70000 tonnes/an",
                "clients_ref": ["Alnatura", "Dennree"],
                "site_web": "www.meyermuehle.de",
                "lat": 48.5379,
                "lon": 12.1516
            },

            # Fournisseurs d'œufs
            {
                "nom": "Ovoteam International",
                "pays": "FR",
                "ville": "Liffré",
                "region": "Bretagne",
                "type": SupplierType.INGREDIENT,
                "produits": ["Œufs liquides pasteurisés", "Poudre d'œuf"],
                "certifications": ["IFS Food", "BRC AA", "Bio EU"],
                "taille": SupplierSize.LARGE,
                "capacite_production": "100000 tonnes/an",
                "clients_ref": ["Panzani", "Barilla", "Nestlé"],
                "site_web": "www.ovoteam.fr",
                "lat": 48.2167,
                "lon": -1.5067
            },
            {
                "nom": "Igreca S.p.A",
                "pays": "IT",
                "ville": "San Pietro in Casale",
                "region": "Emilia-Romagna",
                "type": SupplierType.INGREDIENT,
                "produits": ["Œufs bio", "Ovoproduits"],
                "certifications": ["Bio EU", "IFS Food", "ISO 22000"],
                "taille": SupplierSize.MEDIUM,
                "capacite_production": "50000 tonnes/an",
                "clients_ref": ["Rana", "Barilla"],
                "site_web": "www.igreca.it",
                "lat": 44.6992,
                "lon": 11.4158
            },

            # Fournisseurs d'emballages
            {
                "nom": "Smurfit Kappa",
                "pays": "FR",
                "ville": "Lyon",
                "region": "Auvergne-Rhône-Alpes",
                "type": SupplierType.PACKAGING,
                "produits": ["Cartons ondulés", "Emballages alimentaires"],
                "certifications": ["ISO 9001", "FSC", "PEFC"],
                "taille": SupplierSize.LARGE,
                "capacite_production": "500000 tonnes/an",
                "clients_ref": ["Nestlé", "Danone", "Barilla"],
                "site_web": "www.smurfitkappa.com",
                "lat": 45.764,
                "lon": 4.8357
            },
            {
                "nom": "Goglio S.p.A",
                "pays": "IT",
                "ville": "Rho",
                "region": "Lombardia",
                "type": SupplierType.PACKAGING,
                "produits": ["Films plastiques", "Sachets alimentaires"],
                "certifications": ["BRC Packaging", "ISO 9001"],
                "taille": SupplierSize.MEDIUM,
                "capacite_production": "80000 tonnes/an",
                "clients_ref": ["Barilla", "De Cecco", "Rummo"],
                "site_web": "www.goglio.it",
                "lat": 45.5333,
                "lon": 9.0333
            },

            # Fournisseurs de légumes déshydratés
            {
                "nom": "Lyofood",
                "pays": "PL",
                "ville": "Warsaw",
                "region": "Mazovia",
                "type": SupplierType.INGREDIENT,
                "produits": ["Épinards lyophilisés", "Tomates déshydratées"],
                "certifications": ["Bio EU", "IFS Food", "HACCP"],
                "taille": SupplierSize.SMALL,
                "capacite_production": "5000 tonnes/an",
                "clients_ref": ["Knorr", "Maggi"],
                "site_web": "www.lyofood.pl",
                "lat": 52.2297,
                "lon": 21.0122
            }
        ]

    def search_suppliers(
        self,
        criteres: CritereRecherche,
        notre_localisation: tuple = (45.7640, 4.8357)  # Lyon par défaut
    ) -> RechercheResultat:
        """
        Recherche de fournisseurs potentiels
        """
        resultat = RechercheResultat(
            id=f"SEARCH_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            criteres=criteres,
            sources_consultees=[]
        )

        fournisseurs_potentiels = []

        # 1. Recherche dans la base interne simulée
        resultat.sources_consultees.append(SourceDonnees.INTERNAL_DB)

        for supplier_data in self.supplier_database:
            # Filtrer par type
            if supplier_data["type"] != criteres.type_fournisseur:
                continue

            # Filtrer par pays exclus
            if supplier_data["pays"] in criteres.pays_exclus:
                continue

            # Filtrer par zone géographique
            if not self._check_geographic_match(
                supplier_data["pays"],
                criteres.zones_geographiques
            ):
                continue

            # Calculer la distance
            distance = self._calculate_distance(
                notre_localisation,
                (supplier_data.get("lat", 0), supplier_data.get("lon", 0))
            )

            # Filtrer par rayon si spécifié
            if criteres.rayon_km and distance > criteres.rayon_km:
                continue

            # Créer le fournisseur potentiel
            fournisseur = FournisseurPotentiel(
                nom_entreprise=supplier_data["nom"],
                pays=supplier_data["pays"],
                ville=supplier_data["ville"],
                region=supplier_data.get("region"),
                source=SourceDonnees.INTERNAL_DB,
                type_fournisseur=supplier_data["type"],
                produits=supplier_data["produits"],
                certifications_identifiees=supplier_data.get("certifications", []),
                taille_entreprise=supplier_data.get("taille"),
                site_web=supplier_data.get("site_web"),
                capacite_production=supplier_data.get("capacite_production"),
                clients_references=supplier_data.get("clients_ref", []),
                distance_km=distance
            )

            # Calculer le score de match
            match_score = self._calculate_match_score(fournisseur, criteres)
            fournisseur.score_pertinence = match_score.score_global
            fournisseur.score_qualite_info = self._calculate_info_quality(fournisseur)
            fournisseur.raisons_selection = match_score.criteres_matches

            fournisseurs_potentiels.append(fournisseur)

        # 2. Simuler la recherche dans d'autres sources (Kompass, Europages, etc.)
        # Pour cette version, on simule quelques résultats supplémentaires
        fournisseurs_potentiels.extend(
            self._simulate_external_sources(criteres, notre_localisation)
        )

        # Trier par score de pertinence
        fournisseurs_potentiels.sort(
            key=lambda f: f.score_pertinence,
            reverse=True
        )

        # Limiter au nombre max de résultats
        fournisseurs_potentiels = fournisseurs_potentiels[:criteres.nombre_max_resultats]

        # Remplir le résultat
        resultat.fournisseurs_trouves = fournisseurs_potentiels
        resultat.nombre_total = len(fournisseurs_potentiels)

        # Top 3
        if len(fournisseurs_potentiels) >= 3:
            resultat.top_3_recommandes = [
                f.nom_entreprise for f in fournisseurs_potentiels[:3]
            ]

        # Statistiques
        resultat.statistiques = self._calculate_statistics(fournisseurs_potentiels)

        # Actions suivantes
        resultat.actions_suivantes = self._generate_next_actions(
            fournisseurs_potentiels,
            criteres
        )

        # Sauvegarder
        self._save_search_result(resultat)

        return resultat

    def _check_geographic_match(
        self,
        pays: str,
        zones: List[GeographicZone]
    ) -> bool:
        """Vérifie si le pays correspond aux zones géographiques"""
        eu_countries = [
            "FR", "DE", "IT", "ES", "NL", "BE", "AT", "PT", "PL",
            "SE", "DK", "FI", "IE", "GR", "CZ", "HU", "RO", "BG"
        ]

        for zone in zones:
            if zone == GeographicZone.EU and pays in eu_countries:
                return True
            if zone == GeographicZone.EUROPE:
                return True
            if zone == GeographicZone.INTERNATIONAL:
                return True

        return False

    def _calculate_distance(
        self,
        point1: tuple,
        point2: tuple
    ) -> float:
        """Calcule la distance approximative entre deux points (formule de Haversine simplifiée)"""
        lat1, lon1 = point1
        lat2, lon2 = point2

        # Formule simplifiée pour l'Europe
        # 1 degré ≈ 111 km à 45° de latitude
        dlat = abs(lat2 - lat1) * 111
        dlon = abs(lon2 - lon1) * 75  # Ajusté pour latitude moyenne Europe

        return (dlat**2 + dlon**2) ** 0.5

    def _calculate_match_score(
        self,
        fournisseur: FournisseurPotentiel,
        criteres: CritereRecherche
    ) -> MatchScore:
        """Calcule le score de correspondance"""
        score = MatchScore(score_global=0)

        # Score géographique (0-100)
        if fournisseur.distance_km is not None:
            if fournisseur.distance_km < 100:
                score.score_geographique = 100
            elif fournisseur.distance_km < 300:
                score.score_geographique = 90
            elif fournisseur.distance_km < 500:
                score.score_geographique = 75
            elif fournisseur.distance_km < 1000:
                score.score_geographique = 60
            else:
                score.score_geographique = 40

            if criteres.local_prefere and fournisseur.distance_km < 200:
                score.bonus.append("Fournisseur local (<200km)")
                score.score_geographique = min(100, score.score_geographique + 10)

        # Score certifications (0-100)
        cert_requises = [c.value for c in criteres.certifications_requises]
        cert_souhaitees = [c.value for c in criteres.certifications_souhaitees]
        cert_fournisseur = fournisseur.certifications_identifiees

        # Certifications requises
        cert_matches = sum(
            1 for c in cert_requises
            if any(c in cert_f for cert_f in cert_fournisseur)
        )
        if cert_requises:
            score.score_certifications = (cert_matches / len(cert_requises)) * 100
        else:
            score.score_certifications = 70  # Score par défaut

        # Bonus pour certifications souhaitées
        cert_bonus = sum(
            1 for c in cert_souhaitees
            if any(c in cert_f for cert_f in cert_fournisseur)
        )
        if cert_bonus:
            score.score_certifications = min(100, score.score_certifications + cert_bonus * 10)
            score.bonus.append(f"{cert_bonus} certification(s) souhaitée(s) présente(s)")

        # Bio requis
        if criteres.bio_requis:
            if any("Bio" in c or "bio" in c for c in cert_fournisseur):
                score.bonus.append("Certification Bio présente")
                score.score_certifications = min(100, score.score_certifications + 15)
            else:
                score.malus.append("Bio requis mais non certifié")
                score.score_certifications = max(0, score.score_certifications - 30)

        # Score capacité (0-100)
        score.score_capacite = 70  # Score par défaut si pas d'info

        # Score qualité des données (0-100)
        score.score_qualite_donnees = self._calculate_info_quality(fournisseur)

        # Score durabilité (0-100)
        score.score_durabilite = 50  # Score de base
        if fournisseur.distance_km and fournisseur.distance_km < 300:
            score.score_durabilite += 20
            score.bonus.append("Circuit court (<300km)")
        if any("Bio" in c for c in cert_fournisseur):
            score.score_durabilite += 20
        if any("ISO 14001" in c for c in cert_fournisseur):
            score.score_durabilite += 10

        # Score global (moyenne pondérée)
        score.score_global = (
            score.score_geographique * 0.25 +
            score.score_certifications * 0.30 +
            score.score_capacite * 0.20 +
            score.score_qualite_donnees * 0.15 +
            score.score_durabilite * 0.10
        )

        # Critères matchés
        if score.score_geographique >= 75:
            score.criteres_matches.append("Proximité géographique")
        if score.score_certifications >= 80:
            score.criteres_matches.append("Certifications conformes")
        if fournisseur.clients_references:
            score.criteres_matches.append(f"Références clients : {len(fournisseur.clients_references)}")
        if fournisseur.capacite_production:
            score.criteres_matches.append("Capacité de production connue")

        # Recommandation
        if score.score_global >= 80:
            score.recommandation = "Excellent candidat"
            score.niveau_confiance = "Élevé"
        elif score.score_global >= 65:
            score.recommandation = "Bon candidat"
            score.niveau_confiance = "Moyen"
        elif score.score_global >= 50:
            score.recommandation = "Candidat acceptable"
            score.niveau_confiance = "Moyen"
        else:
            score.recommandation = "Candidat faible"
            score.niveau_confiance = "Faible"

        return score

    def _calculate_info_quality(self, fournisseur: FournisseurPotentiel) -> float:
        """Calcule la qualité des informations disponibles"""
        score = 0
        max_score = 10

        if fournisseur.site_web:
            score += 1
        if fournisseur.email_contact:
            score += 1
        if fournisseur.telephone:
            score += 1
        if fournisseur.certifications_identifiees:
            score += 2
        if fournisseur.capacite_production:
            score += 2
        if fournisseur.clients_references:
            score += 2
        if fournisseur.produits:
            score += 1

        return (score / max_score) * 100

    def _simulate_external_sources(
        self,
        criteres: CritereRecherche,
        localisation: tuple
    ) -> List[FournisseurPotentiel]:
        """Simule la recherche dans des sources externes"""
        # Pour cette démo, on retourne une liste vide
        # Dans une vraie implémentation, on ferait des appels API
        return []

    def _calculate_statistics(
        self,
        fournisseurs: List[FournisseurPotentiel]
    ) -> Dict:
        """Calcule des statistiques sur les résultats"""
        if not fournisseurs:
            return {}

        pays = {}
        for f in fournisseurs:
            pays[f.pays] = pays.get(f.pays, 0) + 1

        return {
            "nombre_total": len(fournisseurs),
            "score_moyen": sum(f.score_pertinence for f in fournisseurs) / len(fournisseurs),
            "score_min": min(f.score_pertinence for f in fournisseurs),
            "score_max": max(f.score_pertinence for f in fournisseurs),
            "par_pays": pays,
            "avec_certifications": len([f for f in fournisseurs if f.certifications_identifiees]),
            "distance_moyenne_km": sum(f.distance_km or 0 for f in fournisseurs) / len(fournisseurs)
        }

    def _generate_next_actions(
        self,
        fournisseurs: List[FournisseurPotentiel],
        criteres: CritereRecherche
    ) -> List[str]:
        """Génère les actions suivantes recommandées"""
        actions = []

        if not fournisseurs:
            actions.append("Élargir les critères de recherche")
            actions.append("Consulter des sources supplémentaires")
            return actions

        top_3 = fournisseurs[:3]

        actions.append(f"Contacter les {min(3, len(fournisseurs))} meilleurs candidats")

        for f in top_3:
            if not f.email_contact and not f.telephone:
                actions.append(f"Rechercher contacts pour {f.nom_entreprise}")

        if any(f.score_pertinence >= 80 for f in top_3):
            actions.append("Lancer processus de qualification pour les candidats excellents")

        if criteres.priorite.value in ["haute", "urgente"]:
            actions.append("URGENT : Envoyer demandes de devis dans les 24h")

        actions.append("Planifier audits fournisseurs pour les 2-3 meilleurs")

        return actions

    def _save_search_result(self, resultat: RechercheResultat):
        """Sauvegarde le résultat de recherche"""
        file_path = self.data_dir / f"{resultat.id}.json"
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(resultat.dict(), f, indent=2, ensure_ascii=False, default=str)

    def generate_discovery_report(self, resultat: RechercheResultat) -> str:
        """Génère un rapport de découverte formaté"""
        report = []
        report.append("=" * 80)
        report.append("RAPPORT DE DÉCOUVERTE DE FOURNISSEURS")
        report.append("=" * 80)
        report.append(f"Date : {resultat.date_recherche.strftime('%Y-%m-%d %H:%M')}")
        report.append(f"ID Recherche : {resultat.id}")
        report.append("")

        report.append("CRITÈRES DE RECHERCHE")
        report.append("-" * 80)
        report.append(f"Type : {resultat.criteres.type_fournisseur.value}")
        report.append(f"Zones géographiques : {', '.join([z.value for z in resultat.criteres.zones_geographiques])}")
        if resultat.criteres.certifications_requises:
            report.append(f"Certifications requises : {', '.join([c.value for c in resultat.criteres.certifications_requises])}")
        report.append("")

        report.append("RÉSULTATS")
        report.append("-" * 80)
        report.append(f"Nombre de fournisseurs trouvés : {resultat.nombre_total}")
        report.append(f"Sources consultées : {', '.join([s.value for s in resultat.sources_consultees])}")
        report.append("")

        if resultat.statistiques:
            report.append("STATISTIQUES")
            report.append("-" * 80)
            stats = resultat.statistiques
            report.append(f"Score moyen : {stats.get('score_moyen', 0):.1f}/100")
            report.append(f"Distance moyenne : {stats.get('distance_moyenne_km', 0):.0f} km")
            if 'par_pays' in stats:
                report.append(f"Répartition par pays : {stats['par_pays']}")
            report.append("")

        if resultat.top_3_recommandes:
            report.append("TOP 3 RECOMMANDÉS")
            report.append("-" * 80)
            for idx, nom in enumerate(resultat.top_3_recommandes, 1):
                fournisseur = next(f for f in resultat.fournisseurs_trouves if f.nom_entreprise == nom)
                report.append(f"{idx}. {nom} ({fournisseur.pays})")
                report.append(f"   Score : {fournisseur.score_pertinence:.1f}/100")
                report.append(f"   Distance : {fournisseur.distance_km:.0f} km")
                report.append(f"   Certifications : {', '.join(fournisseur.certifications_identifiees[:3])}")
                if fournisseur.clients_references:
                    report.append(f"   Références : {', '.join(fournisseur.clients_references[:3])}")
                report.append("")

        if resultat.actions_suivantes:
            report.append("ACTIONS SUIVANTES")
            report.append("-" * 80)
            for action in resultat.actions_suivantes:
                report.append(f"• {action}")
            report.append("")

        report.append("=" * 80)

        return "\n".join(report)
