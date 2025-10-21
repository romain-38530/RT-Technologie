"""
Service de gestion de la qualité et traçabilité
"""
from datetime import datetime, date
from typing import List, Dict, Optional
import json
from pathlib import Path

from ..models.raw_material import (
    LotMatierePremiere, AnalyseQualite, MatierePremiere
)


class QualityManager:
    """
    Gestionnaire de la qualité et de la traçabilité
    Conforme aux exigences agroalimentaires européennes
    """

    def __init__(self, data_dir: str = "data/quality"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.lots: Dict[str, LotMatierePremiere] = {}
        self.non_conformites: List[Dict] = []

    def save_lot(self, lot: LotMatierePremiere):
        """Sauvegarde un lot"""
        file_path = self.data_dir / f"lot_{lot.id}.json"
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(lot.dict(), f, indent=2, ensure_ascii=False, default=str)
        self.lots[lot.id] = lot

    def enregistrer_reception(
        self,
        lot: LotMatierePremiere,
        analyse_reception: Optional[AnalyseQualite] = None
    ) -> Dict:
        """
        Enregistre la réception d'un lot et effectue le contrôle qualité
        """
        result = {
            'lot_id': lot.id,
            'date_reception': lot.date_reception,
            'statut': 'en_attente_controle',
            'decision': None,
            'actions': []
        }

        if analyse_reception:
            lot.analyse_reception = analyse_reception

            # Évaluation de la conformité
            if analyse_reception.conforme:
                lot.statut_qualite = "conforme"
                result['statut'] = 'conforme'
                result['decision'] = 'ACCEPTER - Libérer pour production'
                result['actions'] = ['Transférer en zone de stockage production']
            else:
                lot.statut_qualite = "non_conforme"
                lot.bloque = True
                lot.motif_blocage = f"Non-conformités: {', '.join(analyse_reception.non_conformites)}"
                result['statut'] = 'non_conforme'
                result['decision'] = 'REFUSER ou METTRE EN QUARANTAINE'
                result['actions'] = [
                    'Isoler le lot en zone de quarantaine',
                    'Informer le fournisseur',
                    'Initier une action corrective',
                    'Décider: retour fournisseur ou déclassement'
                ]

                # Enregistrer la non-conformité
                self.enregistrer_non_conformite(
                    lot_id=lot.id,
                    type_nc="reception",
                    description=lot.motif_blocage,
                    fournisseur_id=lot.fournisseur_id
                )

        else:
            # Pas d'analyse -> mise en quarantaine par défaut
            lot.statut_qualite = "quarantaine"
            result['statut'] = 'quarantaine'
            result['decision'] = 'QUARANTAINE - En attente analyse'
            result['actions'] = [
                'Placer en quarantaine',
                'Planifier analyse qualité',
                'Prélever échantillons'
            ]

        self.save_lot(lot)
        return result

    def verifier_conformite_specifications(
        self,
        analyse: AnalyseQualite,
        matiere: MatierePremiere
    ) -> Dict:
        """
        Vérifie la conformité d'une analyse par rapport aux spécifications
        """
        spec = matiere.specifications
        non_conformites = []
        conformite_details = {}

        # Vérification humidité
        if analyse.humidite_percent is not None:
            if (spec.humidite_min_percent and analyse.humidite_percent < spec.humidite_min_percent):
                non_conformites.append(
                    f"Humidité trop faible: {analyse.humidite_percent}% < {spec.humidite_min_percent}%"
                )
            if analyse.humidite_percent > spec.humidite_max_percent:
                non_conformites.append(
                    f"Humidité trop élevée: {analyse.humidite_percent}% > {spec.humidite_max_percent}%"
                )
            conformite_details['humidite'] = {
                'valeur': analyse.humidite_percent,
                'min': spec.humidite_min_percent,
                'max': spec.humidite_max_percent,
                'conforme': len([nc for nc in non_conformites if 'Humidité' in nc]) == 0
            }

        # Vérification protéines
        if analyse.taux_proteines_percent is not None:
            if (spec.proteines_min_percent and
                analyse.taux_proteines_percent < spec.proteines_min_percent):
                non_conformites.append(
                    f"Taux de protéines insuffisant: {analyse.taux_proteines_percent}% "
                    f"< {spec.proteines_min_percent}%"
                )
            if (spec.proteines_max_percent and
                analyse.taux_proteines_percent > spec.proteines_max_percent):
                non_conformites.append(
                    f"Taux de protéines trop élevé: {analyse.taux_proteines_percent}% "
                    f"> {spec.proteines_max_percent}%"
                )
            conformite_details['proteines'] = {
                'valeur': analyse.taux_proteines_percent,
                'min': spec.proteines_min_percent,
                'max': spec.proteines_max_percent,
                'conforme': len([nc for nc in non_conformites if 'protéines' in nc]) == 0
            }

        # Vérification contaminants
        if analyse.aflatoxines_ppb is not None:
            if analyse.aflatoxines_ppb > spec.aflatoxines_max_ppb:
                non_conformites.append(
                    f"CRITIQUE - Aflatoxines: {analyse.aflatoxines_ppb} ppb > {spec.aflatoxines_max_ppb} ppb"
                )
            conformite_details['aflatoxines'] = {
                'valeur': analyse.aflatoxines_ppb,
                'max': spec.aflatoxines_max_ppb,
                'conforme': analyse.aflatoxines_ppb <= spec.aflatoxines_max_ppb,
                'critique': True
            }

        if analyse.ochratoxine_ppb is not None:
            if analyse.ochratoxine_ppb > spec.ochratoxine_max_ppb:
                non_conformites.append(
                    f"CRITIQUE - Ochratoxine: {analyse.ochratoxine_ppb} ppb > {spec.ochratoxine_max_ppb} ppb"
                )
            conformite_details['ochratoxine'] = {
                'valeur': analyse.ochratoxine_ppb,
                'max': spec.ochratoxine_max_ppb,
                'conforme': analyse.ochratoxine_ppb <= spec.ochratoxine_max_ppb,
                'critique': True
            }

        # Vérification microbiologie
        if analyse.salmonelle_detectee and not spec.salmonelle_tolerance:
            non_conformites.append("CRITIQUE - Salmonelle détectée")
            conformite_details['salmonelle'] = {
                'detectee': True,
                'conforme': False,
                'critique': True
            }

        if analyse.listeria_detectee and not spec.listeria_tolerance:
            non_conformites.append("CRITIQUE - Listeria détectée")
            conformite_details['listeria'] = {
                'detectee': True,
                'conforme': False,
                'critique': True
            }

        if analyse.bacteries_totales_ufc_g is not None:
            if analyse.bacteries_totales_ufc_g > spec.bacteries_totales_max_ufc_g:
                non_conformites.append(
                    f"Bactéries totales: {analyse.bacteries_totales_ufc_g} UFC/g "
                    f"> {spec.bacteries_totales_max_ufc_g} UFC/g"
                )
            conformite_details['bacteries_totales'] = {
                'valeur': analyse.bacteries_totales_ufc_g,
                'max': spec.bacteries_totales_max_ufc_g,
                'conforme': analyse.bacteries_totales_ufc_g <= spec.bacteries_totales_max_ufc_g
            }

        return {
            'conforme': len(non_conformites) == 0,
            'non_conformites': non_conformites,
            'details': conformite_details,
            'severite': 'CRITIQUE' if any('CRITIQUE' in nc for nc in non_conformites) else 'MINEURE'
        }

    def tracer_lot(self, lot_id: str) -> Dict:
        """
        Traçabilité complète d'un lot
        De l'origine à l'utilisation
        """
        lot = self.lots.get(lot_id)
        if not lot:
            return {'error': 'Lot non trouvé'}

        trace = {
            'lot_id': lot.id,
            'numero_lot_fournisseur': lot.numero_lot,
            'numero_lot_interne': lot.numero_lot_interne,
            'matiere_premiere_id': lot.matiere_premiere_id,

            # Origine
            'origine': {
                'fournisseur_id': lot.fournisseur_id,
                'date_fabrication': lot.date_fabrication.isoformat() if lot.date_fabrication else None,
                'date_reception': lot.date_reception.isoformat(),
                'numero_bon_livraison': lot.numero_bon_livraison,
                'numero_commande': lot.numero_commande
            },

            # Qualité
            'controles_qualite': {
                'analyse_reception': lot.analyse_reception.dict() if lot.analyse_reception else None,
                'analyses_complementaires': [a.dict() for a in lot.analyses_complementaires],
                'statut_qualite': lot.statut_qualite
            },

            # Stockage
            'stockage': {
                'emplacement': lot.emplacement_stockage,
                'zone': lot.zone_stockage,
                'bloque': lot.bloque,
                'motif_blocage': lot.motif_blocage
            },

            # Quantités
            'quantites': {
                'initiale_kg': lot.quantite_kg,
                'restante_kg': lot.quantite_restante_kg,
                'utilisee_kg': lot.quantite_kg - lot.quantite_restante_kg,
                'taux_utilisation_percent': lot.taux_utilisation_percent()
            },

            # Utilisation
            'utilisations': {
                'lots_production': lot.utilisations,
                'nombre_lots': len(lot.utilisations)
            },

            # Dates limites
            'dates': {
                'peremption': lot.date_peremption.isoformat(),
                'limite_utilisation': lot.date_limite_utilisation.isoformat() if lot.date_limite_utilisation else None,
                'jours_avant_peremption': lot.jours_avant_peremption(),
                'perime': lot.est_perime()
            }
        }

        return trace

    def enregistrer_non_conformite(
        self,
        lot_id: str,
        type_nc: str,
        description: str,
        fournisseur_id: Optional[str] = None,
        severite: str = "moyenne"
    ):
        """Enregistre une non-conformité"""
        nc = {
            'id': f"NC_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            'date': datetime.now().isoformat(),
            'lot_id': lot_id,
            'type': type_nc,
            'description': description,
            'fournisseur_id': fournisseur_id,
            'severite': severite,
            'statut': 'ouverte',
            'actions_correctives': [],
            'cloturee': False
        }

        self.non_conformites.append(nc)

        # Sauvegarder
        nc_file = self.data_dir / "non_conformites.json"
        with open(nc_file, 'w', encoding='utf-8') as f:
            json.dump(self.non_conformites, f, indent=2, ensure_ascii=False, default=str)

    def generer_rapport_qualite(
        self,
        date_debut: date,
        date_fin: date
    ) -> Dict:
        """Génère un rapport qualité sur une période"""

        lots_periode = [
            lot for lot in self.lots.values()
            if date_debut <= lot.date_reception.date() <= date_fin
        ]

        # Statistiques
        total_lots = len(lots_periode)
        lots_conformes = len([l for l in lots_periode if l.statut_qualite == "conforme"])
        lots_non_conformes = len([l for l in lots_periode if l.statut_qualite == "non_conforme"])
        lots_quarantaine = len([l for l in lots_periode if l.statut_qualite == "quarantaine"])

        # Taux de conformité
        taux_conformite = (lots_conformes / total_lots * 100) if total_lots > 0 else 0

        # Non-conformités de la période
        nc_periode = [
            nc for nc in self.non_conformites
            if date_debut <= datetime.fromisoformat(nc['date']).date() <= date_fin
        ]

        # Par fournisseur
        nc_par_fournisseur = {}
        for nc in nc_periode:
            fid = nc.get('fournisseur_id', 'inconnu')
            nc_par_fournisseur[fid] = nc_par_fournisseur.get(fid, 0) + 1

        return {
            'periode': {
                'debut': date_debut.isoformat(),
                'fin': date_fin.isoformat()
            },
            'statistiques_lots': {
                'total': total_lots,
                'conformes': lots_conformes,
                'non_conformes': lots_non_conformes,
                'en_quarantaine': lots_quarantaine,
                'taux_conformite_percent': taux_conformite
            },
            'non_conformites': {
                'total': len(nc_periode),
                'par_severite': {
                    'critique': len([nc for nc in nc_periode if nc.get('severite') == 'critique']),
                    'moyenne': len([nc for nc in nc_periode if nc.get('severite') == 'moyenne']),
                    'mineure': len([nc for nc in nc_periode if nc.get('severite') == 'mineure'])
                },
                'par_fournisseur': nc_par_fournisseur
            },
            'alertes': self._generer_alertes(lots_periode)
        }

    def _generer_alertes(self, lots: List[LotMatierePremiere]) -> List[Dict]:
        """Génère des alertes qualité"""
        alertes = []

        # Lots proches de la péremption
        for lot in lots:
            if not lot.est_perime() and lot.jours_avant_peremption() <= 7:
                alertes.append({
                    'type': 'peremption_proche',
                    'severite': 'haute',
                    'lot_id': lot.id,
                    'message': f"Lot {lot.numero_lot_interne} expire dans {lot.jours_avant_peremption()} jours",
                    'action': 'Utiliser en priorité ou retirer'
                })

        # Lots bloqués depuis longtemps
        for lot in lots:
            if lot.bloque:
                jours_blocage = (datetime.now() - lot.date_creation).days
                if jours_blocage > 30:
                    alertes.append({
                        'type': 'lot_bloque_longue_duree',
                        'severite': 'moyenne',
                        'lot_id': lot.id,
                        'message': f"Lot {lot.numero_lot_interne} bloqué depuis {jours_blocage} jours",
                        'action': 'Décider du sort du lot (retour, déclassement, destruction)'
                    })

        return alertes
