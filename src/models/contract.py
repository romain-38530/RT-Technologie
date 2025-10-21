"""
Modèle de données pour la gestion commerciale et les contrats
"""
from datetime import datetime, date
from typing import List, Optional, Dict
from enum import Enum
from pydantic import BaseModel, Field, validator


class ContractType(str, Enum):
    """Type de contrat"""
    FRAMEWORK = "contrat_cadre"  # Accord cadre pluriannuel
    SPOT = "ponctuel"  # Contrat unique
    SUPPLY_AGREEMENT = "accord_approvisionnement"  # Accord d'approvisionnement
    CONSIGNMENT = "consignation"  # Stock en consignation


class ContractStatus(str, Enum):
    """Statut du contrat"""
    DRAFT = "brouillon"
    PENDING_APPROVAL = "en_attente_validation"
    NEGOTIATION = "negociation"
    APPROVED = "valide"
    ACTIVE = "actif"
    SUSPENDED = "suspendu"
    EXPIRED = "expire"
    TERMINATED = "resilie"


class PriceReviewMethod(str, Enum):
    """Méthode de révision des prix"""
    FIXED = "fixe"  # Prix fixe
    INDEXED = "indexe"  # Indexé sur un indice (blé, etc.)
    NEGOTIATED = "negocie"  # Renégociation périodique
    MARKET_PRICE = "prix_marche"  # Prix du marché


class VolumeTier(BaseModel):
    """Palier de volume avec remise"""
    volume_minimum: float
    volume_maximum: Optional[float] = None
    remise_percent: float = Field(ge=0, le=100)
    prix_unitaire: Optional[float] = None


class PrixContractuel(BaseModel):
    """Prix contractuel avec conditions"""
    matiere_premiere_id: str
    designation: str

    # Prix de base
    prix_unitaire_base: float
    devise: str = "EUR"

    # Paliers de volume
    paliers_volume: List[VolumeTier] = []

    # Révision des prix
    methode_revision: PriceReviewMethod = PriceReviewMethod.FIXED
    indice_reference: Optional[str] = None  # Ex: "Prix du blé dur Euronext"
    valeur_indice_base: Optional[float] = None
    frequence_revision_mois: Optional[int] = None

    # Conditions
    quantite_minimale_commande: float
    unite: str
    delai_livraison_jours: int

    # Validité
    date_debut_validite: date
    date_fin_validite: date

    def calculer_prix(self, quantite: float, valeur_indice: Optional[float] = None) -> float:
        """Calcule le prix selon la quantité et l'indice"""
        prix = self.prix_unitaire_base

        # Application des paliers de volume
        for palier in sorted(self.paliers_volume, key=lambda x: x.volume_minimum, reverse=True):
            if quantite >= palier.volume_minimum:
                if palier.prix_unitaire:
                    prix = palier.prix_unitaire
                else:
                    prix = self.prix_unitaire_base * (1 - palier.remise_percent / 100)
                break

        # Application de l'indexation
        if (self.methode_revision == PriceReviewMethod.INDEXED and
            valeur_indice and self.valeur_indice_base):
            variation = (valeur_indice - self.valeur_indice_base) / self.valeur_indice_base
            prix = prix * (1 + variation)

        return prix


class ClauseContractuelle(BaseModel):
    """Clause contractuelle"""
    numero: str
    titre: str
    description: str
    categorie: str  # qualite, livraison, paiement, responsabilite, etc.
    obligatoire: bool = True


class ContrepartieFinanciere(BaseModel):
    """Contrepartie financière (pénalités, bonus)"""
    type: str  # penalite, bonus, indemnite
    condition: str
    montant_fixe: Optional[float] = None
    montant_percent: Optional[float] = None
    plafond: Optional[float] = None


class Negociation(BaseModel):
    """Session de négociation"""
    id: str
    date: datetime
    participants_acheteur: List[str]
    participants_fournisseur: List[str]

    # Éléments négociés
    elements_negocies: List[str]  # Prix, délais, volumes, etc.

    # Propositions
    proposition_initiale: Dict  # État initial
    contre_proposition: Optional[Dict] = None
    proposition_finale: Optional[Dict] = None

    # Résultat
    accord_obtenu: bool = False
    points_accord: List[str] = []
    points_desaccord: List[str] = []

    # Documentation
    compte_rendu: Optional[str] = None
    documents: List[str] = []

    # Prochaines étapes
    prochaine_reunion: Optional[datetime] = None
    actions_requises: List[str] = []


class Avenant(BaseModel):
    """Avenant au contrat"""
    id: str
    numero_avenant: str
    date: date
    motif: str

    # Modifications
    modifications: Dict  # Détail des modifications
    clauses_modifiees: List[str] = []
    clauses_ajoutees: List[ClauseContractuelle] = []
    clauses_supprimees: List[str] = []

    # Approbation
    approuve: bool = False
    date_approbation: Optional[date] = None
    approuve_par: Optional[str] = None

    # Documents
    document_url: Optional[str] = None


class ContratFournisseur(BaseModel):
    """Contrat avec un fournisseur"""
    id: str
    numero_contrat: str
    type: ContractType
    statut: ContractStatus = ContractStatus.DRAFT

    # Parties
    fournisseur_id: str
    nom_fournisseur: str
    entite_acheteuse: str = "RT-Technologie"

    # Objet du contrat
    objet: str
    description: str
    matieres_premieres: List[str] = []  # IDs des matières

    # Dates
    date_signature: Optional[date] = None
    date_debut: date
    date_fin: date
    duree_mois: int
    renouvellement_automatique: bool = False
    preavis_resiliation_jours: int = 90

    # Conditions commerciales
    prix_contractuels: List[PrixContractuel]

    # Volumes
    volume_minimum_annuel: Optional[float] = None
    volume_maximum_annuel: Optional[float] = None
    engagement_volume_ferme: Optional[float] = None

    # Conditions de paiement
    delai_paiement_jours: int
    mode_paiement: str
    garantie_bancaire_requise: bool = False
    montant_garantie: Optional[float] = None

    # Conditions de livraison
    delai_livraison_standard_jours: int
    incoterm: str = "DAP"
    lieux_livraison: List[str]
    penalite_retard_percent: float = Field(ge=0, le=100, default=0)

    # Qualité
    specifications_qualite: str
    controles_requis: List[str] = []
    taux_conformite_minimum_percent: float = Field(ge=0, le=100, default=98)
    penalite_non_conformite: Optional[ContrepartieFinanciere] = None

    # Clauses
    clauses: List[ClauseContractuelle] = []

    # Contreparties financières
    penalites: List[ContrepartieFinanciere] = []
    bonus: List[ContrepartieFinanciere] = []

    # Négociations
    historique_negociations: List[Negociation] = []

    # Avenants
    avenants: List[Avenant] = []

    # Performance
    volume_consomme_cumul: float = 0
    montant_consomme_cumul: float = 0
    taux_conformite_reel_percent: Optional[float] = None
    nb_livraisons_retard: int = 0
    nb_livraisons_total: int = 0

    # Responsables
    responsable_achat: str
    responsable_juridique: Optional[str] = None

    # Documents
    document_contrat_url: Optional[str] = None
    annexes: List[str] = []

    # Alertes
    alerte_fin_contrat_jours: int = 90
    alerte_volume_minimum: bool = False

    # Métadonnées
    date_creation: datetime = Field(default_factory=datetime.now)
    date_modification: datetime = Field(default_factory=datetime.now)

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            date: lambda v: v.isoformat()
        }

    def est_actif(self) -> bool:
        """Vérifie si le contrat est actif"""
        if self.statut != ContractStatus.ACTIVE:
            return False

        today = date.today()
        return self.date_debut <= today <= self.date_fin

    def jours_avant_expiration(self) -> int:
        """Nombre de jours avant expiration"""
        return (self.date_fin - date.today()).days

    def necessite_alerte_fin(self) -> bool:
        """Vérifie si une alerte de fin de contrat est nécessaire"""
        return 0 < self.jours_avant_expiration() <= self.alerte_fin_contrat_jours

    def taux_consommation_volume_percent(self) -> float:
        """Taux de consommation du volume minimum"""
        if not self.volume_minimum_annuel:
            return 0

        return (self.volume_consomme_cumul / self.volume_minimum_annuel) * 100

    def est_volume_minimum_atteint(self) -> bool:
        """Vérifie si le volume minimum est atteint"""
        if not self.volume_minimum_annuel:
            return True

        return self.volume_consomme_cumul >= self.volume_minimum_annuel

    def taux_respect_delais_percent(self) -> float:
        """Taux de respect des délais de livraison"""
        if self.nb_livraisons_total == 0:
            return 100

        nb_livraisons_temps = self.nb_livraisons_total - self.nb_livraisons_retard
        return (nb_livraisons_temps / self.nb_livraisons_total) * 100

    def calculer_penalites_retard(self) -> float:
        """Calcule les pénalités de retard accumulées"""
        if self.penalite_retard_percent == 0:
            return 0

        # Simplification: pénalité sur montant consommé
        return self.montant_consomme_cumul * (self.penalite_retard_percent / 100) * (
            self.nb_livraisons_retard / max(1, self.nb_livraisons_total)
        )

    def obtenir_prix(self, matiere_id: str, quantite: float) -> Optional[float]:
        """Obtient le prix contractuel pour une matière"""
        prix_contractuel = next(
            (p for p in self.prix_contractuels if p.matiere_premiere_id == matiere_id),
            None
        )

        if prix_contractuel:
            return prix_contractuel.calculer_prix(quantite)

        return None


class TableauBordContrats(BaseModel):
    """Tableau de bord de gestion des contrats"""
    date_generation: datetime = Field(default_factory=datetime.now)

    # Statistiques générales
    nb_contrats_actifs: int = 0
    nb_contrats_en_negociation: int = 0
    nb_contrats_expirant_30j: int = 0
    nb_contrats_expirant_90j: int = 0

    # Volumes et montants
    volume_total_engage: float = 0
    volume_total_consomme: float = 0
    montant_total_engage: float = 0
    montant_total_consomme: float = 0

    # Performance
    taux_respect_delais_moyen_percent: float = 0
    taux_conformite_moyen_percent: float = 0
    nb_penalites_appliquees: int = 0
    montant_penalites_total: float = 0

    # Alertes
    contrats_volume_minimum_risque: List[str] = []
    contrats_performance_degradee: List[str] = []
    certifications_expirant: List[str] = []

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
