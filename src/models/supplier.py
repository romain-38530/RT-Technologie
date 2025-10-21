"""
Modèle de données pour les fournisseurs
"""
from datetime import datetime
from typing import List, Optional
from enum import Enum
from pydantic import BaseModel, Field, validator


class SupplierType(str, Enum):
    """Types de fournisseurs"""
    RAW_MATERIAL = "matiere_premiere"  # Blé dur, semoule, etc.
    PACKAGING = "emballage"  # Cartons, sachets
    INGREDIENT = "ingredient"  # Œufs, épinards, tomates
    EQUIPMENT = "equipement"  # Pièces machines
    SERVICE = "service"  # Transport, maintenance


class SupplierStatus(str, Enum):
    """Statut du fournisseur"""
    ACTIVE = "actif"
    PENDING = "en_attente"
    SUSPENDED = "suspendu"
    BLOCKED = "bloque"


class CertificationType(str, Enum):
    """Types de certifications"""
    BIO_EU = "bio_europeen"
    IFS = "ifs_food"
    BRC = "brc"
    ISO_22000 = "iso_22000"
    HACCP = "haccp"
    FSSC_22000 = "fssc_22000"
    ORGANIC = "agriculture_biologique"
    IGP = "igp"  # Indication Géographique Protégée


class Certification(BaseModel):
    """Certification d'un fournisseur"""
    type: CertificationType
    numero: str
    organisme: str
    date_obtention: datetime
    date_expiration: datetime
    document_url: Optional[str] = None

    @validator('date_expiration')
    def validate_expiration(cls, v, values):
        if 'date_obtention' in values and v <= values['date_obtention']:
            raise ValueError("La date d'expiration doit être après la date d'obtention")
        return v


class ContactFournisseur(BaseModel):
    """Contact chez un fournisseur"""
    nom: str
    prenom: str
    fonction: str
    email: str
    telephone: str
    mobile: Optional[str] = None
    langue_principale: str = "fr"


class AdresseFournisseur(BaseModel):
    """Adresse d'un fournisseur"""
    rue: str
    code_postal: str
    ville: str
    pays: str
    region: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class ConditionsCommerciales(BaseModel):
    """Conditions commerciales avec un fournisseur"""
    delai_paiement_jours: int = Field(ge=0, le=120)
    remise_volume_percent: float = Field(ge=0, le=100, default=0)
    quantite_minimum_commande: float = Field(ge=0)
    unite_commande: str  # kg, tonnes, unités
    delai_livraison_jours: int = Field(ge=0)
    frais_port_minimum: Optional[float] = None
    franco_de_port: Optional[float] = None  # Montant pour livraison gratuite
    penalite_retard_percent: float = Field(ge=0, le=100, default=0)


class EvaluationFournisseur(BaseModel):
    """Évaluation périodique d'un fournisseur"""
    date_evaluation: datetime
    qualite_produits: int = Field(ge=1, le=5)  # Note sur 5
    respect_delais: int = Field(ge=1, le=5)
    service_client: int = Field(ge=1, le=5)
    competitivite_prix: int = Field(ge=1, le=5)
    conformite_reglementaire: int = Field(ge=1, le=5)
    commentaires: Optional[str] = None
    evaluateur: str

    @property
    def note_globale(self) -> float:
        """Calcul de la note globale"""
        return (
            self.qualite_produits * 0.35 +
            self.respect_delais * 0.25 +
            self.service_client * 0.15 +
            self.competitivite_prix * 0.15 +
            self.conformite_reglementaire * 0.10
        )


class Fournisseur(BaseModel):
    """Fournisseur principal"""
    id: str
    nom_entreprise: str
    type: SupplierType
    statut: SupplierStatus = SupplierStatus.ACTIVE

    # Informations légales
    numero_siret: Optional[str] = None
    numero_tva: Optional[str] = None
    forme_juridique: Optional[str] = None

    # Coordonnées
    adresse: AdresseFournisseur
    contacts: List[ContactFournisseur] = []
    site_web: Optional[str] = None

    # Certifications et qualité
    certifications: List[Certification] = []

    # Conditions commerciales
    conditions: ConditionsCommerciales

    # Évaluations
    evaluations: List[EvaluationFournisseur] = []

    # Métadonnées
    date_creation: datetime = Field(default_factory=datetime.now)
    date_modification: datetime = Field(default_factory=datetime.now)
    date_dernier_audit: Optional[datetime] = None
    prochaine_date_audit: Optional[datetime] = None

    # Scoring
    note_globale_moyenne: Optional[float] = None

    # Flags
    fournisseur_principal: bool = False
    fournisseur_secours: bool = False

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

    def calculer_note_moyenne(self) -> float:
        """Calcule la note moyenne des évaluations"""
        if not self.evaluations:
            return 0.0
        return sum(e.note_globale for e in self.evaluations) / len(self.evaluations)

    def certifications_valides(self) -> List[Certification]:
        """Retourne les certifications encore valides"""
        now = datetime.now()
        return [c for c in self.certifications if c.date_expiration > now]

    def certifications_expirees(self) -> List[Certification]:
        """Retourne les certifications expirées"""
        now = datetime.now()
        return [c for c in self.certifications if c.date_expiration <= now]

    def alertes_certifications(self, jours_avant: int = 90) -> List[Certification]:
        """Retourne les certifications qui expirent bientôt"""
        from datetime import timedelta
        limite = datetime.now() + timedelta(days=jours_avant)
        return [
            c for c in self.certifications
            if datetime.now() < c.date_expiration <= limite
        ]
