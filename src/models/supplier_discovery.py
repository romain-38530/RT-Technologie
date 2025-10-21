"""
Modèle de données pour la recherche et découverte de fournisseurs
"""
from datetime import datetime
from typing import List, Optional, Dict
from enum import Enum
from pydantic import BaseModel, Field

from .supplier import SupplierType, CertificationType


class SearchPriority(str, Enum):
    """Priorité de recherche"""
    LOW = "basse"
    MEDIUM = "moyenne"
    HIGH = "haute"
    URGENT = "urgente"


class GeographicZone(str, Enum):
    """Zones géographiques de recherche"""
    LOCAL = "local"  # <100km
    REGIONAL = "regional"  # Même région
    NATIONAL = "national"  # Même pays
    EU = "union_europeenne"
    EUROPE = "europe"
    INTERNATIONAL = "international"


class SupplierSize(str, Enum):
    """Taille du fournisseur"""
    MICRO = "micro"  # < 10 employés
    SMALL = "petite"  # 10-50 employés
    MEDIUM = "moyenne"  # 50-250 employés
    LARGE = "grande"  # > 250 employés


class CritereRecherche(BaseModel):
    """Critères de recherche de fournisseurs"""
    # Type et matières
    type_fournisseur: SupplierType
    matieres_premieres: List[str]  # Noms ou catégories

    # Géographique
    zones_geographiques: List[GeographicZone] = [GeographicZone.EU]
    pays_prioritaires: List[str] = []  # Codes pays ISO
    pays_exclus: List[str] = []
    rayon_km: Optional[int] = None  # Rayon autour d'un point

    # Qualité et certifications
    certifications_requises: List[CertificationType] = []
    certifications_souhaitees: List[CertificationType] = []
    note_minimale: Optional[float] = None  # Note minimale si existante

    # Capacité
    capacite_production_minimale: Optional[float] = None  # kg/an
    volume_annuel_estime: Optional[float] = None
    taille_entreprise: List[SupplierSize] = []

    # Conditions commerciales
    delai_livraison_max_jours: Optional[int] = None
    delai_paiement_min_jours: Optional[int] = None

    # Durabilité et RSE
    bio_requis: bool = False
    local_prefere: bool = False
    score_rse_minimum: Optional[float] = None

    # Exclusions
    exclure_fournisseurs: List[str] = []  # IDs à exclure

    # Métadonnées
    priorite: SearchPriority = SearchPriority.MEDIUM
    nombre_max_resultats: int = 10


class SourceDonnees(str, Enum):
    """Source de données fournisseur"""
    INTERNAL_DB = "base_interne"
    KOMPASS = "kompass"  # Annuaire européen
    EUROPAGES = "europages"
    WLTP = "wltp"  # World List of Trade Professionals
    CHAMBER_COMMERCE = "chambre_commerce"
    ORGANIC_DIRECTORY = "annuaire_bio"
    CERTIFICATION_BODY = "organisme_certification"
    WEB_SCRAPING = "web_scraping"
    RECOMMENDATION = "recommandation"


class FournisseurPotentiel(BaseModel):
    """Fournisseur potentiel découvert"""
    # Identité
    nom_entreprise: str
    pays: str
    ville: str
    region: Optional[str] = None

    # Source
    source: SourceDonnees
    date_decouverte: datetime = Field(default_factory=datetime.now)
    url_source: Optional[str] = None

    # Informations disponibles
    type_fournisseur: Optional[SupplierType] = None
    produits: List[str] = []
    certifications_identifiees: List[str] = []
    taille_entreprise: Optional[SupplierSize] = None

    # Contact (si disponible)
    site_web: Optional[str] = None
    email_contact: Optional[str] = None
    telephone: Optional[str] = None

    # Capacités
    capacite_production: Optional[str] = None
    marches_desservis: List[str] = []
    clients_references: List[str] = []

    # Distance
    distance_km: Optional[float] = None

    # Métadonnées
    informations_supplementaires: Dict = {}

    # Scoring
    score_pertinence: float = 0  # 0-100
    score_qualite_info: float = 0  # 0-100 (complétude des infos)
    raisons_selection: List[str] = []
    points_attention: List[str] = []


class RechercheResultat(BaseModel):
    """Résultat d'une recherche de fournisseurs"""
    id: str
    criteres: CritereRecherche
    date_recherche: datetime = Field(default_factory=datetime.now)

    # Résultats
    fournisseurs_trouves: List[FournisseurPotentiel] = []
    nombre_total: int = 0

    # Sources consultées
    sources_consultees: List[SourceDonnees] = []

    # Statistiques
    statistiques: Dict = {}

    # Recommandations
    top_3_recommandes: List[str] = []  # Noms des 3 meilleurs
    actions_suivantes: List[str] = []

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class DemandeQualification(BaseModel):
    """Demande de qualification d'un fournisseur potentiel"""
    fournisseur_potentiel: FournisseurPotentiel
    date_demande: datetime = Field(default_factory=datetime.now)

    # Documents à demander
    documents_requis: List[str] = [
        "K-bis ou équivalent",
        "Certificats de certification",
        "Références clients",
        "Capacités de production",
        "Assurance RC Produit"
    ]

    # Questionnaire
    questionnaire_envoye: bool = False
    questionnaire_recu: bool = False

    # Visite
    visite_site_requise: bool = True
    visite_planifiee: Optional[datetime] = None

    # Statut
    statut: str = "en_attente"  # en_attente, en_cours, qualifie, refuse
    responsable: Optional[str] = None

    # Résultat
    decision: Optional[str] = None
    motif_refus: Optional[str] = None
    date_qualification: Optional[datetime] = None


class MatchScore(BaseModel):
    """Score de correspondance détaillé"""
    score_global: float = Field(ge=0, le=100)

    # Scores par catégorie
    score_geographique: float = Field(ge=0, le=100, default=0)
    score_certifications: float = Field(ge=0, le=100, default=0)
    score_capacite: float = Field(ge=0, le=100, default=0)
    score_qualite_donnees: float = Field(ge=0, le=100, default=0)
    score_durabilite: float = Field(ge=0, le=100, default=0)

    # Détails
    criteres_matches: List[str] = []
    criteres_manquants: List[str] = []
    bonus: List[str] = []
    malus: List[str] = []

    # Recommandation
    recommandation: str = ""  # "Excellent", "Bon", "Moyen", "Faible"
    niveau_confiance: str = ""  # "Élevé", "Moyen", "Faible"
