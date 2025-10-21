"""
Modèle de données pour les approvisionnements et commandes
"""
from datetime import datetime, date
from typing import Optional, List, Dict
from enum import Enum
from pydantic import BaseModel, Field, validator


class OrderStatus(str, Enum):
    """Statut de commande"""
    DRAFT = "brouillon"
    PENDING_APPROVAL = "en_attente_validation"
    APPROVED = "validee"
    SENT = "envoyee"
    CONFIRMED = "confirmee"
    IN_PRODUCTION = "en_production"
    SHIPPED = "expediee"
    DELIVERED = "livree"
    PARTIALLY_DELIVERED = "partiellement_livree"
    CANCELLED = "annulee"
    DISPUTED = "litige"


class OrderPriority(str, Enum):
    """Priorité de commande"""
    LOW = "basse"
    NORMAL = "normale"
    HIGH = "haute"
    URGENT = "urgente"


class OrderType(str, Enum):
    """Type de commande"""
    STANDARD = "standard"
    URGENT = "urgente"
    CALL_OFF = "appel_contrat_cadre"  # Commande sur contrat cadre
    SPOT = "spot"  # Achat ponctuel
    CONSIGNMENT = "consignation"  # Stock consigné


class LigneCommande(BaseModel):
    """Ligne de commande"""
    numero_ligne: int
    matiere_premiere_id: str
    designation: str

    # Quantité
    quantite: float
    unite: str
    quantite_livree: float = 0
    quantite_restante: float = 0

    # Prix
    prix_unitaire: float
    devise: str = "EUR"
    remise_percent: float = Field(ge=0, le=100, default=0)
    montant_ht: float = 0
    taux_tva_percent: float = Field(ge=0, le=100, default=20)
    montant_ttc: float = 0

    # Délai
    date_livraison_souhaitee: date
    date_livraison_confirmee: Optional[date] = None

    # Spécifications
    specifications_particulieres: Optional[str] = None
    numero_lot_requis: Optional[str] = None  # Si on veut un lot spécifique

    @validator('quantite_restante', always=True)
    def calculer_quantite_restante(cls, v, values):
        if 'quantite' in values and 'quantite_livree' in values:
            return values['quantite'] - values['quantite_livree']
        return v

    @validator('montant_ht', always=True)
    def calculer_montant_ht(cls, v, values):
        if all(k in values for k in ['quantite', 'prix_unitaire', 'remise_percent']):
            montant_brut = values['quantite'] * values['prix_unitaire']
            return montant_brut * (1 - values['remise_percent'] / 100)
        return v

    @validator('montant_ttc', always=True)
    def calculer_montant_ttc(cls, v, values):
        if 'montant_ht' in values and 'taux_tva_percent' in values:
            return values['montant_ht'] * (1 + values['taux_tva_percent'] / 100)
        return v


class Commande(BaseModel):
    """Commande fournisseur"""
    id: str
    numero_commande: str
    type_commande: OrderType
    statut: OrderStatus = OrderStatus.DRAFT
    priorite: OrderPriority = OrderPriority.NORMAL

    # Fournisseur
    fournisseur_id: str
    nom_fournisseur: str

    # Dates
    date_commande: datetime = Field(default_factory=datetime.now)
    date_livraison_souhaitee: date
    date_livraison_confirmee: Optional[date] = None
    date_livraison_reelle: Optional[datetime] = None

    # Lignes de commande
    lignes: List[LigneCommande]

    # Montants
    montant_total_ht: float = 0
    montant_total_ttc: float = 0
    frais_port_ht: float = 0
    autres_frais_ht: float = 0

    # Adresse de livraison
    adresse_livraison: str
    site_livraison: str = "Site principal"

    # Conditions
    conditions_paiement: str
    mode_transport: Optional[str] = None  # Routier, ferroviaire, etc.
    incoterm: str = "DAP"  # Delivered At Place

    # Validation
    demandeur: str
    valideur: Optional[str] = None
    date_validation: Optional[datetime] = None

    # Suivi
    numero_confirmation_fournisseur: Optional[str] = None
    numero_expedition: Optional[str] = None
    transporteur: Optional[str] = None
    numero_tracking: Optional[str] = None

    # Documents
    bon_commande_url: Optional[str] = None
    confirmation_url: Optional[str] = None
    facture_url: Optional[str] = None

    # Notes et commentaires
    commentaires: Optional[str] = None
    notes_internes: Optional[str] = None

    # Métadonnées
    date_creation: datetime = Field(default_factory=datetime.now)
    date_modification: datetime = Field(default_factory=datetime.now)

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            date: lambda v: v.isoformat()
        }

    def calculer_totaux(self):
        """Calcule les montants totaux"""
        self.montant_total_ht = sum(ligne.montant_ht for ligne in self.lignes)
        self.montant_total_ht += self.frais_port_ht + self.autres_frais_ht

        # Moyenne pondérée de TVA (simplifié)
        if self.lignes:
            tva_moyenne = sum(ligne.montant_ht * ligne.taux_tva_percent
                            for ligne in self.lignes) / self.montant_total_ht
            self.montant_total_ttc = self.montant_total_ht * (1 + tva_moyenne / 100)

    def est_complete(self) -> bool:
        """Vérifie si la commande est complètement livrée"""
        return all(ligne.quantite_restante == 0 for ligne in self.lignes)

    def taux_completion_percent(self) -> float:
        """Calcule le taux de complétion de la commande"""
        if not self.lignes:
            return 0
        total_quantite = sum(ligne.quantite for ligne in self.lignes)
        total_livre = sum(ligne.quantite_livree for ligne in self.lignes)
        return (total_livre / total_quantite * 100) if total_quantite > 0 else 0

    def delai_livraison_jours(self) -> Optional[int]:
        """Calcule le délai de livraison réel"""
        if self.date_livraison_reelle:
            return (self.date_livraison_reelle.date() - self.date_commande.date()).days
        return None

    def est_en_retard(self) -> bool:
        """Vérifie si la livraison est en retard"""
        if self.statut in [OrderStatus.DELIVERED, OrderStatus.CANCELLED]:
            return False
        date_ref = self.date_livraison_confirmee or self.date_livraison_souhaitee
        return date.today() > date_ref


class PlanApprovisionnement(BaseModel):
    """Plan d'approvisionnement automatique"""
    id: str
    matiere_premiere_id: str
    fournisseur_principal_id: str
    fournisseurs_alternatifs: List[str] = []

    # Paramètres de stock
    stock_minimum: float
    stock_maximum: float
    stock_securite: float
    point_commande: float

    # Paramètres de commande
    quantite_economique: float  # Economic Order Quantity
    quantite_commande_standard: float
    frequence_revision_jours: int = 7  # Révision hebdomadaire

    # Règles
    autoriser_commande_automatique: bool = False
    seuil_declenchement_auto: float  # Seuil de stock déclenchant auto
    delai_approvisionnement_jours: int

    # Prévisions
    consommation_moyenne_jour: float
    tendance: Optional[str] = None  # hausse, baisse, stable
    coefficient_saisonnalite: float = 1.0

    # Dernière action
    derniere_verification: Optional[datetime] = None
    derniere_commande: Optional[datetime] = None
    prochaine_verification: Optional[datetime] = None

    # Alertes
    alerte_stock_bas: bool = False
    alerte_rupture_imminente: bool = False
    date_alerte: Optional[datetime] = None

    actif: bool = True

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

    def calculer_besoin(self, stock_actuel: float, commandes_en_cours: float = 0) -> float:
        """Calcule le besoin en approvisionnement"""
        stock_disponible = stock_actuel + commandes_en_cours

        if stock_disponible <= self.point_commande:
            # Besoin = atteindre le stock max - stock disponible
            return max(0, self.stock_maximum - stock_disponible)
        return 0

    def suggerer_quantite_commande(self, besoin: float) -> float:
        """Suggère une quantité de commande optimale"""
        if besoin <= 0:
            return 0

        # Arrondir au multiple de la quantité standard
        nb_lots = max(1, round(besoin / self.quantite_commande_standard))
        return nb_lots * self.quantite_commande_standard


class ConsumeHistory(BaseModel):
    """Historique de consommation pour les prévisions"""
    date: date
    matiere_premiere_id: str
    quantite_consommee_kg: float
    lots_production_utilisant: List[str]
    type_production: str  # standard, urgente, etc.

    class Config:
        json_encoders = {
            date: lambda v: v.isoformat()
        }
