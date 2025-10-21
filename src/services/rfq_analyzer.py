"""
Service d'analyse automatique des offres et attribution des lots
"""
from datetime import datetime
from typing import List, Dict, Optional, Tuple
import json
from pathlib import Path
import numpy as np

from ..models.rfq import (
    AppelOffres, OffreFournisseur, EvaluationOffre,
    CritereEvaluation, EvaluationCriteria, RFQStatus
)
from ..models.supplier import Fournisseur


class RFQAnalyzer:
    """Analyseur automatique d'appels d'offres"""

    def __init__(self, data_dir: str = "data/rfq"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)

    def analyze_offer(
        self,
        rfq: AppelOffres,
        offer: OffreFournisseur,
        supplier: Fournisseur
    ) -> EvaluationOffre:
        """
        Analyse automatique d'une offre
        Retourne une évaluation complète
        """
        evaluation = EvaluationOffre(
            offre_id=offer.id,
            evaluateur="Système automatique",
            date_evaluation=datetime.now(),
            conformite_technique=True,
            non_conformites=[],
            points_forts=[],
            points_faibles=[],
            recommandation="",
            justification=""
        )

        # 1. Vérification de conformité technique
        conformite = self._check_technical_compliance(rfq, offer)
        evaluation.conformite_technique = conformite["conforme"]
        evaluation.non_conformites = conformite["non_conformites"]

        if not evaluation.conformite_technique:
            evaluation.recommandation = "ecarter"
            evaluation.justification = "Non-conformité technique"
            evaluation.note_finale = 0
            return evaluation

        # 2. Évaluation par critère
        evaluations_criteres = {}
        for critere in rfq.criteres_evaluation:
            score = self._evaluate_criterion(
                critere, offer, supplier, rfq
            )
            evaluations_criteres[critere.critere.value] = {
                "note": score,
                "poids": critere.poids_percent,
                "commentaire": self._generate_criterion_comment(critere.critere, score)
            }

        evaluation.evaluations_criteres = evaluations_criteres

        # 3. Calcul des notes
        evaluation.note_technique = self._calculate_technical_score(evaluations_criteres)
        evaluation.note_commerciale = self._calculate_commercial_score(
            offer, supplier, evaluations_criteres
        )
        evaluation.note_finale = evaluation.calculer_note_finale()

        # 4. Analyse des points forts/faibles
        evaluation.points_forts = self._identify_strengths(offer, supplier, evaluations_criteres)
        evaluation.points_faibles = self._identify_weaknesses(offer, supplier, evaluations_criteres)

        # 5. Recommandation finale
        evaluation.recommandation, evaluation.justification = self._generate_recommendation(
            evaluation.note_finale,
            evaluation.points_forts,
            evaluation.points_faibles
        )

        return evaluation

    def _check_technical_compliance(
        self,
        rfq: AppelOffres,
        offer: OffreFournisseur
    ) -> Dict:
        """Vérifie la conformité technique de l'offre"""
        non_conformites = []

        # Vérifier que toutes les lignes sont présentes
        rfq_lines = {ligne.numero_ligne for ligne in rfq.lignes}
        offer_lines = {ligne.numero_ligne_rfq for ligne in offer.lignes}

        missing_lines = rfq_lines - offer_lines
        if missing_lines:
            non_conformites.append(
                f"Lignes manquantes: {missing_lines}"
            )

        # Vérifier les quantités
        for rfq_ligne in rfq.lignes:
            offer_ligne = next(
                (l for l in offer.lignes if l.numero_ligne_rfq == rfq_ligne.numero_ligne),
                None
            )
            if offer_ligne:
                if rfq_ligne.quantite_minimale and offer_ligne.quantite_proposee < rfq_ligne.quantite_minimale:
                    non_conformites.append(
                        f"Ligne {rfq_ligne.numero_ligne}: quantité insuffisante"
                    )

                # Vérifier certifications requises
                certs_manquantes = set(rfq_ligne.certifications_requises) - set(offer_ligne.certifications)
                if certs_manquantes:
                    non_conformites.append(
                        f"Ligne {rfq_ligne.numero_ligne}: certifications manquantes {certs_manquantes}"
                    )

        # Vérifier date de validité
        if offer.date_validite_offre < rfq.date_attribution_prevue:
            non_conformites.append(
                "Date de validité de l'offre insuffisante"
            )

        return {
            "conforme": len(non_conformites) == 0,
            "non_conformites": non_conformites
        }

    def _evaluate_criterion(
        self,
        critere: CritereEvaluation,
        offer: OffreFournisseur,
        supplier: Fournisseur,
        rfq: AppelOffres
    ) -> float:
        """Évalue un critère spécifique"""

        if critere.critere == EvaluationCriteria.PRICE:
            return self._evaluate_price(offer, rfq)

        elif critere.critere == EvaluationCriteria.QUALITY:
            return self._evaluate_quality(offer, supplier)

        elif critere.critere == EvaluationCriteria.DELIVERY_TIME:
            return self._evaluate_delivery_time(offer, rfq)

        elif critere.critere == EvaluationCriteria.PAYMENT_TERMS:
            return self._evaluate_payment_terms(offer)

        elif critere.critere == EvaluationCriteria.CERTIFICATIONS:
            return self._evaluate_certifications(offer, supplier)

        elif critere.critere == EvaluationCriteria.EXPERIENCE:
            return self._evaluate_experience(supplier)

        elif critere.critere == EvaluationCriteria.SUSTAINABILITY:
            return self._evaluate_sustainability(supplier)

        elif critere.critere == EvaluationCriteria.LOCAL_SOURCING:
            return self._evaluate_local_sourcing(offer, supplier)

        return 50.0  # Note par défaut

    def _evaluate_price(self, offer: OffreFournisseur, rfq: AppelOffres) -> float:
        """
        Évalue le critère prix
        Note sur 100
        """
        offer.calculer_totaux()

        # Si budget estimatif disponible, comparer
        if rfq.budget_estimatif:
            ratio = offer.montant_total_ht / rfq.budget_estimatif
            if ratio <= 0.85:
                return 100  # Excellent - économie >15%
            elif ratio <= 0.95:
                return 85  # Très bon
            elif ratio <= 1.0:
                return 70  # Bon
            elif ratio <= 1.10:
                return 50  # Acceptable
            else:
                return 25  # Cher

        # Sinon noter la compétitivité relative (nécessite comparaison)
        return 70  # Note par défaut si pas de référence

    def _evaluate_quality(self, offer: OffreFournisseur, supplier: Fournisseur) -> float:
        """Évalue la qualité basée sur l'historique fournisseur"""
        if supplier.note_globale_moyenne:
            # Convertir note 1-5 en score 0-100
            return (supplier.note_globale_moyenne / 5.0) * 100

        # Si pas d'historique, score moyen
        return 50.0

    def _evaluate_delivery_time(self, offer: OffreFournisseur, rfq: AppelOffres) -> float:
        """Évalue les délais de livraison"""
        scores = []

        for rfq_ligne in rfq.lignes:
            offer_ligne = next(
                (l for l in offer.lignes if l.numero_ligne_rfq == rfq_ligne.numero_ligne),
                None
            )
            if offer_ligne:
                date_souhaitee = rfq_ligne.date_livraison_souhaitee
                date_proposee = offer_ligne.date_livraison_proposee

                delta_jours = (date_proposee - date_souhaitee).days

                if delta_jours <= 0:
                    scores.append(100)  # Avant ou à la date
                elif delta_jours <= 7:
                    scores.append(80)  # Légère retard acceptable
                elif delta_jours <= 14:
                    scores.append(60)  # Retard modéré
                else:
                    scores.append(30)  # Retard important

        return np.mean(scores) if scores else 50.0

    def _evaluate_payment_terms(self, offer: OffreFournisseur) -> float:
        """Évalue les conditions de paiement"""
        delai = offer.delai_paiement_jours

        if delai >= 60:
            return 100  # Excellent
        elif delai >= 45:
            return 80
        elif delai >= 30:
            return 60
        else:
            return 40  # Délai court

    def _evaluate_certifications(self, offer: OffreFournisseur, supplier: Fournisseur) -> float:
        """Évalue les certifications"""
        certifications_valides = len(supplier.certifications_valides())

        if certifications_valides >= 5:
            return 100
        elif certifications_valides >= 3:
            return 80
        elif certifications_valides >= 1:
            return 60
        else:
            return 30

    def _evaluate_experience(self, supplier: Fournisseur) -> float:
        """Évalue l'expérience du fournisseur"""
        # Basé sur le nombre d'évaluations (proxy de l'expérience)
        nb_evaluations = len(supplier.evaluations)

        if nb_evaluations >= 20:
            return 100
        elif nb_evaluations >= 10:
            return 80
        elif nb_evaluations >= 5:
            return 60
        else:
            return 40

    def _evaluate_sustainability(self, supplier: Fournisseur) -> float:
        """Évalue la durabilité/RSE"""
        score = 50  # Score de base

        # Bonus pour certifications bio/environnementales
        certs = [c.type.value for c in supplier.certifications_valides()]
        if any('bio' in c.lower() for c in certs):
            score += 30
        if any('iso' in c.lower() for c in certs):
            score += 20

        return min(100, score)

    def _evaluate_local_sourcing(self, offer: OffreFournisseur, supplier: Fournisseur) -> float:
        """Évalue l'approvisionnement local"""
        # Pays européens prioritaires
        eu_countries = ["FR", "DE", "IT", "ES", "NL", "BE", "AT", "PT", "PL"]

        score = 50

        # Bonus si fournisseur européen
        if supplier.adresse.pays in eu_countries:
            score += 30

        # Bonus si origine matières premières européenne
        for ligne in offer.lignes:
            if any(pays in ligne.origine for pays in eu_countries):
                score += 10
                break

        return min(100, score)

    def _calculate_technical_score(self, evaluations: Dict) -> float:
        """Calcule le score technique"""
        technical_criteria = [
            EvaluationCriteria.QUALITY.value,
            EvaluationCriteria.CERTIFICATIONS.value,
            EvaluationCriteria.DELIVERY_TIME.value
        ]

        scores = [
            eval_data["note"]
            for crit, eval_data in evaluations.items()
            if crit in technical_criteria
        ]

        return np.mean(scores) if scores else 50.0

    def _calculate_commercial_score(
        self,
        offer: OffreFournisseur,
        supplier: Fournisseur,
        evaluations: Dict
    ) -> float:
        """Calcule le score commercial"""
        commercial_criteria = [
            EvaluationCriteria.PRICE.value,
            EvaluationCriteria.PAYMENT_TERMS.value
        ]

        scores = [
            eval_data["note"]
            for crit, eval_data in evaluations.items()
            if crit in commercial_criteria
        ]

        return np.mean(scores) if scores else 50.0

    def _identify_strengths(
        self,
        offer: OffreFournisseur,
        supplier: Fournisseur,
        evaluations: Dict
    ) -> List[str]:
        """Identifie les points forts"""
        strengths = []

        for critere, eval_data in evaluations.items():
            if eval_data["note"] >= 80:
                strengths.append(f"{critere}: {eval_data['note']:.0f}/100")

        if supplier.note_globale_moyenne and supplier.note_globale_moyenne >= 4.0:
            strengths.append(f"Fournisseur bien noté: {supplier.note_globale_moyenne:.1f}/5")

        if supplier.fournisseur_principal:
            strengths.append("Fournisseur principal établi")

        return strengths

    def _identify_weaknesses(
        self,
        offer: OffreFournisseur,
        supplier: Fournisseur,
        evaluations: Dict
    ) -> List[str]:
        """Identifie les points faibles"""
        weaknesses = []

        for critere, eval_data in evaluations.items():
            if eval_data["note"] < 50:
                weaknesses.append(f"{critere}: {eval_data['note']:.0f}/100 - insuffisant")

        if supplier.note_globale_moyenne and supplier.note_globale_moyenne < 3.0:
            weaknesses.append(f"Historique fournisseur moyen: {supplier.note_globale_moyenne:.1f}/5")

        certif_expirees = supplier.certifications_expirees()
        if certif_expirees:
            weaknesses.append(f"{len(certif_expirees)} certification(s) expirée(s)")

        return weaknesses

    def _generate_criterion_comment(self, criterion: EvaluationCriteria, score: float) -> str:
        """Génère un commentaire pour un critère"""
        if score >= 80:
            level = "Excellent"
        elif score >= 60:
            level = "Bon"
        elif score >= 50:
            level = "Acceptable"
        else:
            level = "Insuffisant"

        return f"{level} ({score:.0f}/100)"

    def _generate_recommendation(
        self,
        note_finale: float,
        points_forts: List[str],
        points_faibles: List[str]
    ) -> Tuple[str, str]:
        """Génère une recommandation finale"""

        if note_finale >= 75:
            return (
                "retenir",
                f"Offre excellente (note: {note_finale:.1f}/100). Recommandé pour attribution."
            )
        elif note_finale >= 60:
            return (
                "negocier",
                f"Offre acceptable (note: {note_finale:.1f}/100). "
                f"Négociation recommandée sur: {', '.join(points_faibles[:2]) if points_faibles else 'conditions générales'}."
            )
        else:
            return (
                "ecarter",
                f"Offre insuffisante (note: {note_finale:.1f}/100). "
                f"Principales faiblesses: {', '.join(points_faibles[:3]) if points_faibles else 'score global trop faible'}."
            )

    def compare_offers(
        self,
        rfq: AppelOffres,
        offers: List[OffreFournisseur],
        suppliers: Dict[str, Fournisseur]
    ) -> List[Dict]:
        """
        Compare toutes les offres et établit un classement
        """
        results = []

        for offer in offers:
            supplier = suppliers.get(offer.fournisseur_id)
            if not supplier:
                continue

            evaluation = self.analyze_offer(rfq, offer, supplier)

            results.append({
                "offre_id": offer.id,
                "fournisseur_id": offer.fournisseur_id,
                "nom_fournisseur": offer.nom_fournisseur,
                "montant_ht": offer.montant_total_ht,
                "note_finale": evaluation.note_finale,
                "note_technique": evaluation.note_technique,
                "note_commerciale": evaluation.note_commerciale,
                "recommandation": evaluation.recommandation,
                "points_forts": evaluation.points_forts,
                "points_faibles": evaluation.points_faibles,
                "evaluation": evaluation
            })

        # Trier par note finale décroissante
        results.sort(key=lambda x: x["note_finale"], reverse=True)

        # Ajouter le classement
        for idx, result in enumerate(results, 1):
            result["classement"] = idx

        return results

    def generate_award_report(
        self,
        rfq: AppelOffres,
        comparison_results: List[Dict]
    ) -> Dict:
        """
        Génère un rapport d'attribution
        """
        if not comparison_results:
            return {
                "rfq_id": rfq.id,
                "status": "aucune_offre",
                "message": "Aucune offre conforme reçue"
            }

        best_offer = comparison_results[0]

        report = {
            "rfq_id": rfq.id,
            "numero_rfq": rfq.numero_rfq,
            "titre": rfq.titre,
            "date_rapport": datetime.now().isoformat(),

            # Statistiques générales
            "nombre_offres_recues": len(comparison_results),
            "nombre_offres_conformes": len([r for r in comparison_results if r["evaluation"].conformite_technique]),

            # Offre retenue
            "offre_retenue": {
                "fournisseur": best_offer["nom_fournisseur"],
                "montant_ht": best_offer["montant_ht"],
                "note_finale": best_offer["note_finale"],
                "classement": 1,
                "justification": best_offer["evaluation"].justification
            },

            # Tableau comparatif
            "tableau_comparatif": [
                {
                    "classement": r["classement"],
                    "fournisseur": r["nom_fournisseur"],
                    "montant_ht": r["montant_ht"],
                    "note_technique": r["note_technique"],
                    "note_commerciale": r["note_commerciale"],
                    "note_finale": r["note_finale"],
                    "recommandation": r["recommandation"]
                }
                for r in comparison_results[:5]  # Top 5
            ],

            # Analyse de l'offre retenue
            "analyse_detaillee": {
                "points_forts": best_offer["points_forts"],
                "points_faibles": best_offer["points_faibles"],
                "evaluations_criteres": best_offer["evaluation"].evaluations_criteres
            },

            # Recommandations
            "recommandations": self._generate_award_recommendations(comparison_results),

            # Économies réalisées
            "economie_vs_budget": None
        }

        if rfq.budget_estimatif:
            economie = rfq.budget_estimatif - best_offer["montant_ht"]
            economie_percent = (economie / rfq.budget_estimatif) * 100
            report["economie_vs_budget"] = {
                "montant": economie,
                "pourcentage": economie_percent
            }

        return report

    def _generate_award_recommendations(self, comparison_results: List[Dict]) -> List[str]:
        """Génère des recommandations pour l'attribution"""
        recommendations = []

        best = comparison_results[0]

        if best["recommandation"] == "retenir":
            recommendations.append(
                f"Attribuer le marché à {best['nom_fournisseur']} "
                f"(note: {best['note_finale']:.1f}/100)"
            )

        if best["recommandation"] == "negocier":
            recommendations.append(
                f"Négocier avec {best['nom_fournisseur']} avant attribution finale"
            )
            if best["points_faibles"]:
                recommendations.append(
                    f"Points de négociation: {', '.join(best['points_faibles'][:2])}"
                )

        # Fournisseur de secours
        if len(comparison_results) > 1:
            second = comparison_results[1]
            if second["note_finale"] >= 60:
                recommendations.append(
                    f"Conserver {second['nom_fournisseur']} comme fournisseur de secours "
                    f"(note: {second['note_finale']:.1f}/100)"
                )

        # Diversification
        if len(comparison_results) >= 3:
            top_3_avg = np.mean([r["note_finale"] for r in comparison_results[:3]])
            if top_3_avg >= 65:
                recommendations.append(
                    "Envisager une répartition du volume entre les 2-3 meilleurs fournisseurs "
                    "pour réduire le risque de dépendance"
                )

        return recommendations
