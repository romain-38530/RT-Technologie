"""
Moteur de prévisions pour les approvisionnements
"""
from datetime import datetime, timedelta, date
from typing import List, Dict, Optional, Tuple
import numpy as np
import pandas as pd
from collections import defaultdict


class ForecastEngine:
    """
    Moteur de prévisions de consommation et d'approvisionnement
    Utilise des méthodes statistiques simples et efficaces
    """

    def __init__(self):
        self.historical_data = defaultdict(list)

    def add_historical_consumption(
        self,
        matiere_id: str,
        date_consommation: date,
        quantite: float
    ):
        """Ajoute une donnée historique de consommation"""
        self.historical_data[matiere_id].append({
            'date': date_consommation,
            'quantite': quantite
        })

    def load_historical_data(self, data: Dict[str, List[Dict]]):
        """Charge les données historiques"""
        for matiere_id, records in data.items():
            self.historical_data[matiere_id] = records

    def calculate_moving_average(
        self,
        matiere_id: str,
        days: int = 30
    ) -> float:
        """Calcule la moyenne mobile sur N jours"""
        if matiere_id not in self.historical_data:
            return 0.0

        cutoff_date = date.today() - timedelta(days=days)
        recent_data = [
            r['quantite'] for r in self.historical_data[matiere_id]
            if r['date'] >= cutoff_date
        ]

        if not recent_data:
            return 0.0

        return np.mean(recent_data)

    def calculate_weighted_moving_average(
        self,
        matiere_id: str,
        days: int = 30
    ) -> float:
        """
        Calcule une moyenne mobile pondérée
        Plus de poids sur les données récentes
        """
        if matiere_id not in self.historical_data:
            return 0.0

        cutoff_date = date.today() - timedelta(days=days)
        recent_data = [
            r for r in self.historical_data[matiere_id]
            if r['date'] >= cutoff_date
        ]

        if not recent_data:
            return 0.0

        # Trier par date
        recent_data.sort(key=lambda x: x['date'])

        # Poids linéaires croissants
        n = len(recent_data)
        weights = np.arange(1, n + 1)
        weights = weights / weights.sum()

        quantities = np.array([r['quantite'] for r in recent_data])
        return np.average(quantities, weights=weights)

    def detect_trend(
        self,
        matiere_id: str,
        days: int = 90
    ) -> Dict:
        """
        Détecte une tendance (hausse, baisse, stable)
        Utilise une régression linéaire simple
        """
        if matiere_id not in self.historical_data:
            return {'trend': 'stable', 'slope': 0, 'confidence': 0}

        cutoff_date = date.today() - timedelta(days=days)
        recent_data = [
            r for r in self.historical_data[matiere_id]
            if r['date'] >= cutoff_date
        ]

        if len(recent_data) < 10:
            return {'trend': 'stable', 'slope': 0, 'confidence': 0}

        # Convertir en séries temporelles
        dates = [r['date'] for r in recent_data]
        quantities = [r['quantite'] for r in recent_data]

        # Convertir dates en jours depuis la première date
        first_date = min(dates)
        x = np.array([(d - first_date).days for d in dates])
        y = np.array(quantities)

        # Régression linéaire simple
        slope, intercept = np.polyfit(x, y, 1)

        # Déterminer la tendance
        mean_qty = np.mean(y)
        relative_slope = (slope / mean_qty) if mean_qty > 0 else 0

        if relative_slope > 0.01:  # Hausse > 1% par jour
            trend = 'hausse'
        elif relative_slope < -0.01:  # Baisse > 1% par jour
            trend = 'baisse'
        else:
            trend = 'stable'

        # Coefficient de détermination (R²) comme mesure de confiance
        y_pred = slope * x + intercept
        ss_res = np.sum((y - y_pred) ** 2)
        ss_tot = np.sum((y - np.mean(y)) ** 2)
        r_squared = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0

        return {
            'trend': trend,
            'slope': slope,
            'relative_slope_percent': relative_slope * 100,
            'confidence': r_squared
        }

    def detect_seasonality(
        self,
        matiere_id: str,
        min_history_days: int = 365
    ) -> Dict:
        """
        Détecte les patterns saisonniers
        Analyse par mois
        """
        if matiere_id not in self.historical_data:
            return {'has_seasonality': False, 'pattern': {}}

        cutoff_date = date.today() - timedelta(days=min_history_days)
        data = [
            r for r in self.historical_data[matiere_id]
            if r['date'] >= cutoff_date
        ]

        if len(data) < 30:
            return {'has_seasonality': False, 'pattern': {}}

        # Grouper par mois
        monthly_avg = defaultdict(list)
        for record in data:
            month = record['date'].month
            monthly_avg[month].append(record['quantite'])

        # Calculer moyenne par mois
        monthly_pattern = {
            month: np.mean(quantities)
            for month, quantities in monthly_avg.items()
            if len(quantities) >= 2
        }

        if len(monthly_pattern) < 6:
            return {'has_seasonality': False, 'pattern': {}}

        # Calculer l'écart-type entre les mois
        monthly_means = list(monthly_pattern.values())
        overall_mean = np.mean(monthly_means)
        std_dev = np.std(monthly_means)
        coefficient_variation = (std_dev / overall_mean) if overall_mean > 0 else 0

        # Saisonnalité significative si CV > 15%
        has_seasonality = coefficient_variation > 0.15

        # Normaliser le pattern (ratio par rapport à la moyenne)
        normalized_pattern = {
            month: avg / overall_mean
            for month, avg in monthly_pattern.items()
        }

        return {
            'has_seasonality': has_seasonality,
            'pattern': normalized_pattern,
            'coefficient_variation': coefficient_variation,
            'peak_month': max(monthly_pattern, key=monthly_pattern.get),
            'low_month': min(monthly_pattern, key=monthly_pattern.get)
        }

    def forecast_demand(
        self,
        matiere_id: str,
        horizon_days: int = 30,
        method: str = 'weighted_average'
    ) -> Dict:
        """
        Prévoit la demande future
        """
        # Calcul de la consommation moyenne
        if method == 'weighted_average':
            daily_avg = self.calculate_weighted_moving_average(matiere_id, days=30)
        else:
            daily_avg = self.calculate_moving_average(matiere_id, days=30)

        # Détection de tendance
        trend_info = self.detect_trend(matiere_id)

        # Détection de saisonnalité
        seasonality_info = self.detect_seasonality(matiere_id)

        # Prévision de base
        base_forecast = daily_avg * horizon_days

        # Ajustement pour tendance
        if trend_info['trend'] == 'hausse':
            trend_adjustment = 1 + (abs(trend_info['relative_slope_percent']) / 100 * horizon_days)
        elif trend_info['trend'] == 'baisse':
            trend_adjustment = 1 - (abs(trend_info['relative_slope_percent']) / 100 * horizon_days)
        else:
            trend_adjustment = 1.0

        # Ajustement pour saisonnalité
        target_month = (date.today() + timedelta(days=horizon_days // 2)).month
        if seasonality_info['has_seasonality'] and target_month in seasonality_info['pattern']:
            seasonal_adjustment = seasonality_info['pattern'][target_month]
        else:
            seasonal_adjustment = 1.0

        # Prévision ajustée
        adjusted_forecast = base_forecast * trend_adjustment * seasonal_adjustment

        # Calcul de l'intervalle de confiance (± 20% par défaut)
        confidence_interval = 0.20
        lower_bound = adjusted_forecast * (1 - confidence_interval)
        upper_bound = adjusted_forecast * (1 + confidence_interval)

        return {
            'matiere_id': matiere_id,
            'horizon_days': horizon_days,
            'forecast_date': (date.today() + timedelta(days=horizon_days)).isoformat(),
            'daily_average': daily_avg,
            'base_forecast': base_forecast,
            'adjusted_forecast': adjusted_forecast,
            'lower_bound': lower_bound,
            'upper_bound': upper_bound,
            'trend': trend_info['trend'],
            'seasonal_factor': seasonal_adjustment,
            'confidence': 1 - confidence_interval
        }

    def calculate_safety_stock(
        self,
        matiere_id: str,
        service_level: float = 0.95,
        lead_time_days: int = 7
    ) -> Dict:
        """
        Calcule le stock de sécurité
        Stock de sécurité = Z × σ × √L
        Z = score Z pour le niveau de service
        σ = écart-type de la demande quotidienne
        L = délai d'approvisionnement
        """
        if matiere_id not in self.historical_data:
            return {'safety_stock': 0, 'method': 'no_data'}

        # Calculer l'écart-type de la demande quotidienne sur 90 jours
        cutoff_date = date.today() - timedelta(days=90)
        recent_data = [
            r['quantite'] for r in self.historical_data[matiere_id]
            if r['date'] >= cutoff_date
        ]

        if len(recent_data) < 10:
            # Pas assez de données, utiliser une règle empirique
            daily_avg = self.calculate_moving_average(matiere_id, days=30)
            safety_stock = daily_avg * lead_time_days * 0.5  # 50% du lead time
            return {
                'safety_stock': safety_stock,
                'method': 'empirical',
                'service_level': service_level
            }

        # Écart-type de la demande
        std_dev = np.std(recent_data)

        # Score Z pour le niveau de service
        # 95% ≈ 1.65, 98% ≈ 2.05, 99% ≈ 2.33
        z_scores = {0.90: 1.28, 0.95: 1.65, 0.98: 2.05, 0.99: 2.33}
        z_score = z_scores.get(service_level, 1.65)

        # Stock de sécurité
        safety_stock = z_score * std_dev * np.sqrt(lead_time_days)

        return {
            'safety_stock': safety_stock,
            'method': 'statistical',
            'service_level': service_level,
            'z_score': z_score,
            'demand_std_dev': std_dev,
            'lead_time_days': lead_time_days
        }

    def calculate_reorder_point(
        self,
        matiere_id: str,
        lead_time_days: int = 7,
        service_level: float = 0.95
    ) -> Dict:
        """
        Calcule le point de commande
        Point de commande = Demande pendant le délai + Stock de sécurité
        """
        # Prévision de la demande pendant le lead time
        forecast = self.forecast_demand(matiere_id, horizon_days=lead_time_days)
        demand_during_lead_time = forecast['adjusted_forecast']

        # Stock de sécurité
        safety_info = self.calculate_safety_stock(
            matiere_id,
            service_level,
            lead_time_days
        )

        # Point de commande
        reorder_point = demand_during_lead_time + safety_info['safety_stock']

        return {
            'reorder_point': reorder_point,
            'demand_during_lead_time': demand_during_lead_time,
            'safety_stock': safety_info['safety_stock'],
            'lead_time_days': lead_time_days,
            'service_level': service_level
        }

    def calculate_economic_order_quantity(
        self,
        matiere_id: str,
        annual_demand: float,
        order_cost: float = 100,  # Coût de passation de commande
        holding_cost_percent: float = 0.20,  # Coût de possession 20% par an
        unit_cost: float = 1.0
    ) -> Dict:
        """
        Calcule la quantité économique de commande (EOQ)
        EOQ = √((2 × D × S) / H)
        D = demande annuelle
        S = coût de passation de commande
        H = coût de possession unitaire annuel
        """
        if annual_demand <= 0:
            return {'eoq': 0, 'method': 'insufficient_demand'}

        # Coût de possession unitaire
        holding_cost_per_unit = unit_cost * holding_cost_percent

        # EOQ
        eoq = np.sqrt((2 * annual_demand * order_cost) / holding_cost_per_unit)

        # Nombre optimal de commandes par an
        optimal_orders_per_year = annual_demand / eoq

        # Coût total annuel
        total_annual_cost = (
            (annual_demand / eoq) * order_cost +  # Coût de commande
            (eoq / 2) * holding_cost_per_unit +  # Coût de possession
            annual_demand * unit_cost  # Coût d'achat
        )

        return {
            'eoq': eoq,
            'optimal_orders_per_year': optimal_orders_per_year,
            'days_between_orders': 365 / optimal_orders_per_year,
            'total_annual_cost': total_annual_cost,
            'order_cost': order_cost,
            'holding_cost_percent': holding_cost_percent
        }

    def generate_procurement_plan(
        self,
        matiere_id: str,
        current_stock: float,
        lead_time_days: int,
        planning_horizon_days: int = 90,
        service_level: float = 0.95
    ) -> Dict:
        """
        Génère un plan d'approvisionnement complet
        """
        # Prévision de la demande
        forecast = self.forecast_demand(matiere_id, horizon_days=planning_horizon_days)

        # Point de commande
        reorder_info = self.calculate_reorder_point(
            matiere_id,
            lead_time_days,
            service_level
        )

        # Stock de sécurité
        safety_stock = reorder_info['safety_stock']

        # Calcul du besoin
        total_demand = forecast['adjusted_forecast']
        available_stock = current_stock
        net_requirement = max(0, total_demand - available_stock + safety_stock)

        # Déterminer si une commande est nécessaire
        need_to_order = current_stock <= reorder_info['reorder_point']

        # Recommandation
        if need_to_order:
            recommendation = "COMMANDER IMMÉDIATEMENT"
            urgency = "high"
        elif current_stock <= reorder_info['reorder_point'] * 1.2:
            recommendation = "SURVEILLER - Proche du point de commande"
            urgency = "medium"
        else:
            recommendation = "Stock suffisant"
            urgency = "low"

        # Calcul de la date de rupture estimée si pas de commande
        daily_consumption = forecast['daily_average']
        if daily_consumption > 0:
            days_until_stockout = current_stock / daily_consumption
            stockout_date = (date.today() + timedelta(days=int(days_until_stockout))).isoformat()
        else:
            days_until_stockout = float('inf')
            stockout_date = None

        return {
            'matiere_id': matiere_id,
            'current_stock': current_stock,
            'safety_stock': safety_stock,
            'reorder_point': reorder_info['reorder_point'],
            'forecast_demand': total_demand,
            'net_requirement': net_requirement,
            'need_to_order': need_to_order,
            'recommendation': recommendation,
            'urgency': urgency,
            'days_until_stockout': days_until_stockout,
            'estimated_stockout_date': stockout_date,
            'planning_horizon_days': planning_horizon_days,
            'service_level': service_level
        }
