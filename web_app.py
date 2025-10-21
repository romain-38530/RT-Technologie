"""
Interface Web pour le Système de Sourcing Permanent
Lancer avec: python web_app.py
Puis ouvrir: http://localhost:5000
"""

from flask import Flask, render_template, request, jsonify
from datetime import datetime, date, timedelta
import json
import random

# Import des services
from src.services.supplier_discovery import SupplierDiscoveryEngine
from src.services.forecast_engine import ForecastEngine
from src.services.quality_manager import QualityManager
from src.models.supplier_discovery import CritereRecherche, GeographicZone, SearchPriority
from src.models.supplier import SupplierType, CertificationType
from src.models.raw_material import LotMatierePremiere, AnalyseQualite

app = Flask(__name__)
app.secret_key = 'rt-technologie-sourcing-2025'


@app.route('/')
def index():
    """Page d'accueil"""
    return render_template('index.html')


@app.route('/api/discover', methods=['POST'])
def discover_suppliers():
    """API: Découverte de fournisseurs"""
    try:
        data = request.json

        # Critères
        criteres = CritereRecherche(
            type_fournisseur=SupplierType(data.get('type', 'matiere_premiere')),
            matieres_premieres=data.get('matieres', ['Semoule']),
            zones_geographiques=[GeographicZone.EU],
            certifications_requises=[
                CertificationType(c) for c in data.get('certifications', [])
            ] if data.get('certifications') else [],
            bio_requis=data.get('bio', False),
            local_prefere=data.get('local', True),
            rayon_km=data.get('rayon'),
            priorite=SearchPriority(data.get('priorite', 'moyenne')),
            nombre_max_resultats=int(data.get('max_resultats', 10))
        )

        # Recherche
        discovery = SupplierDiscoveryEngine()
        resultat = discovery.search_suppliers(
            criteres,
            notre_localisation=(45.7640, 4.8357)  # Lyon par défaut
        )

        # Formater les résultats
        fournisseurs = []
        for f in resultat.fournisseurs_trouves:
            fournisseurs.append({
                'nom': f.nom_entreprise,
                'pays': f.pays,
                'ville': f.ville,
                'score': round(f.score_pertinence, 1),
                'distance': round(f.distance_km, 0) if f.distance_km else None,
                'certifications': f.certifications_identifiees,
                'capacite': f.capacite_production,
                'references': f.clients_references,
                'site_web': f.site_web,
                'raisons': f.raisons_selection
            })

        return jsonify({
            'success': True,
            'total': resultat.nombre_total,
            'fournisseurs': fournisseurs,
            'statistiques': resultat.statistiques,
            'actions': resultat.actions_suivantes
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400


@app.route('/api/forecast', methods=['POST'])
def forecast_demand():
    """API: Prévisions de consommation"""
    try:
        data = request.json
        matiere_id = data.get('matiere_id', 'SEM_001')
        horizon = int(data.get('horizon_days', 30))
        stock_actuel = float(data.get('stock_actuel', 25000))

        # Générer historique simulé
        forecast = ForecastEngine()
        for i in range(90):
            date_conso = date.today() - timedelta(days=90-i)
            quantite = 2000 + random.randint(-300, 300)
            forecast.add_historical_consumption(matiere_id, date_conso, quantite)

        # Prévisions
        prev = forecast.forecast_demand(matiere_id, horizon_days=horizon)

        # Stock de sécurité
        stock_secu = forecast.calculate_safety_stock(
            matiere_id,
            service_level=0.95,
            lead_time_days=7
        )

        # Plan d'approvisionnement
        plan = forecast.generate_procurement_plan(
            matiere_id,
            current_stock=stock_actuel,
            lead_time_days=7,
            planning_horizon_days=horizon
        )

        return jsonify({
            'success': True,
            'prevision': {
                'total': round(prev['adjusted_forecast'], 0),
                'moyenne_jour': round(prev['daily_average'], 0),
                'tendance': prev['trend'],
                'min': round(prev['lower_bound'], 0),
                'max': round(prev['upper_bound'], 0)
            },
            'stock_securite': round(stock_secu['safety_stock'], 0),
            'plan': {
                'stock_actuel': plan['current_stock'],
                'point_commande': round(plan['reorder_point'], 0),
                'besoin': round(plan['net_requirement'], 0),
                'urgence': plan['urgency'],
                'recommandation': plan['recommendation'],
                'commander': plan['need_to_order'],
                'rupture_prevue': plan['estimated_stockout_date']
            }
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400


@app.route('/api/quality', methods=['POST'])
def quality_check():
    """API: Contrôle qualité"""
    try:
        data = request.json

        # Créer lot
        lot = LotMatierePremiere(
            id=f"LOT_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            numero_lot=data.get('numero_lot', 'TEST-001'),
            numero_lot_interne=data.get('numero_interne', 'L2025-001'),
            matiere_premiere_id=data.get('matiere_id', 'SEM_001'),
            fournisseur_id=data.get('fournisseur_id', 'FR_001'),
            date_reception=datetime.now(),
            numero_bon_livraison=data.get('bl', 'BL-001'),
            numero_commande=data.get('commande', 'PO-001'),
            quantite_kg=float(data.get('quantite', 25000)),
            nombre_unites=int(data.get('unites', 1000)),
            conditionnement=data.get('conditionnement', 'Sac 25kg'),
            date_fabrication=date.today() - timedelta(days=5),
            date_peremption=date.today() + timedelta(days=365),
            quantite_restante_kg=float(data.get('quantite', 25000)),
            emplacement_stockage=data.get('emplacement', 'Zone A'),
            zone_stockage=data.get('zone', 'MP Sèches')
        )

        # Créer analyse
        analyse = AnalyseQualite(
            date_analyse=datetime.now(),
            laboratoire=data.get('labo', 'Labo Interne'),
            numero_rapport=data.get('rapport', 'LAB-001'),
            humidite_percent=float(data.get('humidite', 13.2)),
            taux_proteines_percent=float(data.get('proteines', 13.5)),
            taux_cendres_percent=float(data.get('cendres', 0.85)),
            aflatoxines_ppb=float(data.get('aflatoxines', 2.1)),
            ochratoxine_ppb=float(data.get('ochratoxine', 1.5)),
            bacteries_totales_ufc_g=float(data.get('bacteries', 45000)),
            salmonelle_detectee=data.get('salmonelle', False),
            listeria_detectee=data.get('listeria', False),
            conforme=True,
            observations=data.get('observations', 'Conforme')
        )

        # Vérifier conformité
        conforme = (
            analyse.humidite_percent <= 14.5 and
            analyse.taux_proteines_percent >= 12.5 and
            analyse.aflatoxines_ppb <= 5.0 and
            not analyse.salmonelle_detectee and
            not analyse.listeria_detectee
        )
        analyse.conforme = conforme

        # Enregistrer
        quality_mgr = QualityManager()
        result = quality_mgr.enregistrer_reception(lot, analyse)

        return jsonify({
            'success': True,
            'conforme': conforme,
            'statut': result['statut'],
            'decision': result['decision'],
            'actions': result['actions'],
            'analyses': {
                'humidite': analyse.humidite_percent,
                'proteines': analyse.taux_proteines_percent,
                'cendres': analyse.taux_cendres_percent,
                'aflatoxines': analyse.aflatoxines_ppb,
                'ochratoxine': analyse.ochratoxine_ppb
            }
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400


if __name__ == '__main__':
    print("=" * 80)
    print("🌐 INTERFACE WEB - SYSTÈME DE SOURCING PERMANENT")
    print("=" * 80)
    print()
    print("✓ Serveur démarré")
    print()
    print("📱 Ouvrez votre navigateur à l'adresse:")
    print()
    print("   👉  http://localhost:5000")
    print()
    print("=" * 80)
    print()

    app.run(debug=True, host='0.0.0.0', port=5000)
