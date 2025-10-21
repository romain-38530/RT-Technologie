"""
Modèle de données pour les Appels d'Offres (RFQ - Request for Quotation)
"""
from datetime import datetime, date
from typing import List, Optional, Dict
from enum import Enum
from pydantic import BaseModel, Field, validator


class RFQStatus(str, Enum):
    """Statut de l'appel d'offres"""
    DRAFT = "brouillon"
    PUBLISHED = "publie"
    IN_PROGRESS = "en_cours"
    CLOSED = "cloture"
    EVALUATED = "evalue"
    AWARDED = "attribue"
    CANCELLED = "annule"


class RFQType(str, Enum):
    """Type d'appel d'offres"""
    OPEN = "ouvert"  # Ouvert à tous
    RESTRICTED = "restreint"  # Liste de fournisseurs invités
    NEGOTIATED = "negocie"  # Procédure négociée
    FRAMEWORK = "contrat_cadre"  # Accord cadre pluriannuel


class EvaluationCriteria(str, Enum):
    """Critères d'évaluation"""
    PRICE = "prix"
    QUALITY = "qualite"
    DELIVERY_TIME = "delai_livraison"
    PAYMENT_TERMS = "conditions_paiement"
    CERTIFICATIONS = "certifications"
    EXPERIENCE = "experience"
    SUSTAINABILITY = "durabilite"
    LOCAL_SOURCING = "approvisionnement_local"


class CritereEvaluation(BaseModel):
    """Critère d'évaluation avec pondération"""
    critere: EvaluationCriteria
    poids_percent: float = Field(ge=0, le=100)
    description: str
    bareme_notation: Dict[str, float]  # Description -> Note

    # Seuils minimaux
    seuil_eliminatoire: Optional[float] = None


class LigneRFQ(BaseModel):
    """Ligne d'un appel d'offres"""
    numero_ligne: int
    matiere_premiere_id: str
    designation: str
    description_detaillee: str

    # Quantités
    quantite_estimee: float
    unite: str
    quantite_minimale: Optional[float] = None
    quantite_maximale: Optional[float] = None

    # Spécifications techniques
    specifications_techniques: str
    certifications_requises: List[str] = []
    normes_applicables: List[str] = []

    # Échéancier
    date_livraison_souhaitee: date
    frequence_livraison: Optional[str] = None  # hebdomadaire, mensuelle, etc.
    duree_contrat_mois: Optional[int] = None

    # Conditions particulières
    conditions_emballage: Optional[str] = None
    conditions_transport: Optional[str] = None
    echantillons_requis: bool = False


class AppelOffres(BaseModel):
    """Appel d'offres (RFQ)"""
    id: str
    numero_rfq: str
    titre: str
    type: RFQType
    statut: RFQStatus = RFQStatus.DRAFT

    # Description
    description: str
    contexte: Optional[str] = None
    objectifs: List[str] = []

    # Lignes de l'appel d'offres
    lignes: List[LigneRFQ]

    # Calendrier
    date_publication: Optional[datetime] = None
    date_limite_questions: Optional[datetime] = None
    date_limite_soumission: datetime
    date_ouverture_plis: Optional[datetime] = None
    date_attribution_prevue: Optional[date] = None

    # Fournisseurs
    fournisseurs_invites: List[str] = []  # IDs fournisseurs
    fournisseurs_ayant_repondu: List[str] = []

    # Critères d'évaluation
    criteres_evaluation: List[CritereEvaluation]
    criteres_qualification: List[str] = []  # Critères de préqualification

    # Documents
    cahier_charges_url: Optional[str] = None
    documents_techniques: List[str] = []
    documents_administratifs: List[str] = []

    # Conditions commerciales
    conditions_paiement_souhaitees: str
    incoterm_souhaite: str = "DAP"
    garantie_bancaire_requise: bool = False
    montant_garantie_percent: Optional[float] = None

    # Budget
    budget_estimatif: Optional[float] = None
    devise: str = "EUR"

    # Responsables
    responsable_achat: str
    responsable_technique: Optional[str] = None
    commission_evaluation: List[str] = []

    # Métadonnées
    date_creation: datetime = Field(default_factory=datetime.now)
    date_modification: datetime = Field(default_factory=datetime.now)

    # Résultat
    offre_retenue_id: Optional[str] = None
    rapport_evaluation_url: Optional[str] = None

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            date: lambda v: v.isoformat()
        }

    def est_ouvert(self) -> bool:
        """Vérifie si l'appel d'offres est encore ouvert"""
        return (
            self.statut in [RFQStatus.PUBLISHED, RFQStatus.IN_PROGRESS] and
            datetime.now() < self.date_limite_soumission
        )

    def jours_restants(self) -> int:
        """Nombre de jours avant la date limite"""
        delta = self.date_limite_soumission - datetime.now()
        return max(0, delta.days)


class LigneOffre(BaseModel):
    """Ligne de réponse à un appel d'offres"""
    numero_ligne_rfq: int
    matiere_premiere_id: str

    # Prix
    prix_unitaire: float
    devise: str = "EUR"
    remise_volume_percent: float = Field(ge=0, le=100, default=0)
    prix_net_unitaire: float = 0

    # Quantité
    quantite_proposee: float
    unite: str
    quantite_minimale_commande: Optional[float] = None

    # Délais
    delai_livraison_jours: int
    date_livraison_proposee: date

    # Qualité
    certifications: List[str] = []
    origine: str
    references_clients: Optional[str] = None

    # Conditions
    duree_validite_offre_jours: int = 90
    conditions_particulieres: Optional[str] = None

    @validator('prix_net_unitaire', always=True)
    def calculer_prix_net(cls, v, values):
        if 'prix_unitaire' in values and 'remise_volume_percent' in values:
            return values['prix_unitaire'] * (1 - values['remise_volume_percent'] / 100)
        return v


class OffreFournisseur(BaseModel):
    """Offre d'un fournisseur en réponse à un RFQ"""
    id: str
    numero_offre: str
    rfq_id: str
    fournisseur_id: str
    nom_fournisseur: str

    # Statut
    statut: str = "soumise"  # soumise, en_evaluation, retenue, rejetee

    # Date de soumission
    date_soumission: datetime
    date_validite_offre: date

    # Lignes de l'offre
    lignes: List[LigneOffre]

    # Montants
    montant_total_ht: float = 0
    montant_total_ttc: float = 0

    # Conditions commerciales
    conditions_paiement: str
    delai_paiement_jours: int
    garantie_bancaire_proposee: bool = False
    montant_garantie: Optional[float] = None

    # Documents joints
    documents_techniques: List[str] = []
    documents_administratifs: List[str] = []
    certificats: List[str] = []
    echantillons_fournis: bool = False

    # Commentaires
    commentaires_fournisseur: Optional[str] = None
    notes_internes: Optional[str] = None

    # Évaluation
    evaluations: Dict[str, float] = {}  # critère -> note
    note_globale: Optional[float] = None
    classement: Optional[int] = None

    # Métadonnées
    date_creation: datetime = Field(default_factory=datetime.now)
    date_modification: datetime = Field(default_factory=datetime.now)

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            date: lambda v: v.isoformat()
        }

    def calculer_totaux(self):
        """Calcule les montants totaux de l'offre"""
        self.montant_total_ht = sum(
            ligne.prix_net_unitaire * ligne.quantite_proposee
            for ligne in self.lignes
        )
        # TVA simplifiée à 20%
        self.montant_total_ttc = self.montant_total_ht * 1.20


class EvaluationOffre(BaseModel):
    """Évaluation détaillée d'une offre"""
    offre_id: str
    evaluateur: str
    date_evaluation: datetime = Field(default_factory=datetime.now)

    # Évaluations par critère
    evaluations_criteres: Dict[str, Dict] = {}
    # Format: {critere: {"note": float, "commentaire": str, "poids": float}}

    # Évaluation technique
    conformite_technique: bool
    non_conformites: List[str] = []
    points_forts: List[str] = []
    points_faibles: List[str] = []

    # Évaluation commerciale
    competitivite_prix: int = Field(ge=1, le=5)
    conditions_paiement_score: int = Field(ge=1, le=5)
    flexibilite_fournisseur: int = Field(ge=1, le=5)

    # Score global
    note_technique: Optional[float] = None
    note_commerciale: Optional[float] = None
    note_finale: Optional[float] = None

    # Recommandation
    recommandation: str  # "retenir", "ecarter", "negocier"
    justification: str

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

    def calculer_note_finale(self, poids_technique: float = 0.6, poids_commercial: float = 0.4):
        """Calcule la note finale pondérée"""
        if self.note_technique is not None and self.note_commerciale is not None:
            self.note_finale = (
                self.note_technique * poids_technique +
                self.note_commerciale * poids_commercial
            )
        return self.note_finale
