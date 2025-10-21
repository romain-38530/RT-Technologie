"""
Service de gestion des fournisseurs
"""
from datetime import datetime, timedelta
from typing import List, Optional, Dict
import json
from pathlib import Path

from ..models.supplier import (
    Fournisseur, SupplierStatus, SupplierType,
    EvaluationFournisseur, Certification
)


class SupplierManager:
    """Gestionnaire de fournisseurs"""

    def __init__(self, data_dir: str = "data/suppliers"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.suppliers: Dict[str, Fournisseur] = {}
        self.load_suppliers()

    def load_suppliers(self):
        """Charge les fournisseurs depuis les fichiers JSON"""
        for file in self.data_dir.glob("*.json"):
            try:
                with open(file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    supplier = Fournisseur(**data)
                    self.suppliers[supplier.id] = supplier
            except Exception as e:
                print(f"Erreur chargement fournisseur {file}: {e}")

    def save_supplier(self, supplier: Fournisseur):
        """Sauvegarde un fournisseur"""
        supplier.date_modification = datetime.now()
        file_path = self.data_dir / f"{supplier.id}.json"
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(supplier.dict(), f, indent=2, ensure_ascii=False, default=str)
        self.suppliers[supplier.id] = supplier

    def create_supplier(self, supplier: Fournisseur) -> Fournisseur:
        """Crée un nouveau fournisseur"""
        if supplier.id in self.suppliers:
            raise ValueError(f"Fournisseur {supplier.id} existe déjà")
        self.save_supplier(supplier)
        return supplier

    def update_supplier(self, supplier_id: str, **kwargs) -> Fournisseur:
        """Met à jour un fournisseur"""
        if supplier_id not in self.suppliers:
            raise ValueError(f"Fournisseur {supplier_id} non trouvé")

        supplier = self.suppliers[supplier_id]
        for key, value in kwargs.items():
            if hasattr(supplier, key):
                setattr(supplier, key, value)

        self.save_supplier(supplier)
        return supplier

    def get_supplier(self, supplier_id: str) -> Optional[Fournisseur]:
        """Récupère un fournisseur"""
        return self.suppliers.get(supplier_id)

    def list_suppliers(
        self,
        type_filter: Optional[SupplierType] = None,
        status_filter: Optional[SupplierStatus] = None,
        min_rating: Optional[float] = None
    ) -> List[Fournisseur]:
        """Liste les fournisseurs avec filtres"""
        result = list(self.suppliers.values())

        if type_filter:
            result = [s for s in result if s.type == type_filter]

        if status_filter:
            result = [s for s in result if s.statut == status_filter]

        if min_rating is not None:
            result = [
                s for s in result
                if s.note_globale_moyenne and s.note_globale_moyenne >= min_rating
            ]

        return result

    def add_evaluation(
        self,
        supplier_id: str,
        evaluation: EvaluationFournisseur
    ) -> Fournisseur:
        """Ajoute une évaluation à un fournisseur"""
        supplier = self.get_supplier(supplier_id)
        if not supplier:
            raise ValueError(f"Fournisseur {supplier_id} non trouvé")

        supplier.evaluations.append(evaluation)
        supplier.note_globale_moyenne = supplier.calculer_note_moyenne()
        self.save_supplier(supplier)
        return supplier

    def check_certifications_expiring(
        self,
        days_ahead: int = 90
    ) -> Dict[str, List[Certification]]:
        """Vérifie les certifications qui expirent bientôt"""
        result = {}
        for supplier in self.suppliers.values():
            expiring = supplier.alertes_certifications(days_ahead)
            if expiring:
                result[supplier.id] = expiring
        return result

    def get_best_suppliers(
        self,
        type_filter: Optional[SupplierType] = None,
        limit: int = 5
    ) -> List[Fournisseur]:
        """Retourne les meilleurs fournisseurs par note"""
        suppliers = self.list_suppliers(
            type_filter=type_filter,
            status_filter=SupplierStatus.ACTIVE
        )

        # Trier par note moyenne décroissante
        suppliers_with_rating = [
            s for s in suppliers if s.note_globale_moyenne is not None
        ]
        suppliers_with_rating.sort(
            key=lambda s: s.note_globale_moyenne,
            reverse=True
        )

        return suppliers_with_rating[:limit]

    def get_suppliers_for_audit(self, months_since_last: int = 12) -> List[Fournisseur]:
        """Retourne les fournisseurs nécessitant un audit"""
        threshold = datetime.now() - timedelta(days=months_since_last * 30)
        result = []

        for supplier in self.suppliers.values():
            if supplier.statut != SupplierStatus.ACTIVE:
                continue

            # Jamais audité ou audit ancien
            if (supplier.date_dernier_audit is None or
                supplier.date_dernier_audit < threshold):
                result.append(supplier)

            # Date d'audit programmée dépassée
            elif (supplier.prochaine_date_audit and
                  supplier.prochaine_date_audit <= datetime.now()):
                result.append(supplier)

        return result

    def suspend_supplier(
        self,
        supplier_id: str,
        reason: str
    ) -> Fournisseur:
        """Suspend un fournisseur"""
        supplier = self.get_supplier(supplier_id)
        if not supplier:
            raise ValueError(f"Fournisseur {supplier_id} non trouvé")

        supplier.statut = SupplierStatus.SUSPENDED
        self.save_supplier(supplier)
        return supplier

    def reactivate_supplier(self, supplier_id: str) -> Fournisseur:
        """Réactive un fournisseur"""
        supplier = self.get_supplier(supplier_id)
        if not supplier:
            raise ValueError(f"Fournisseur {supplier_id} non trouvé")

        supplier.statut = SupplierStatus.ACTIVE
        self.save_supplier(supplier)
        return supplier

    def get_statistics(self) -> Dict:
        """Retourne des statistiques sur les fournisseurs"""
        total = len(self.suppliers)
        by_type = {}
        by_status = {}
        avg_rating = 0
        count_with_rating = 0

        for supplier in self.suppliers.values():
            # Par type
            type_key = supplier.type.value
            by_type[type_key] = by_type.get(type_key, 0) + 1

            # Par statut
            status_key = supplier.statut.value
            by_status[status_key] = by_status.get(status_key, 0) + 1

            # Note moyenne
            if supplier.note_globale_moyenne:
                avg_rating += supplier.note_globale_moyenne
                count_with_rating += 1

        return {
            "total": total,
            "par_type": by_type,
            "par_statut": by_status,
            "note_moyenne_globale": avg_rating / count_with_rating if count_with_rating > 0 else 0,
            "fournisseurs_evalues": count_with_rating
        }
