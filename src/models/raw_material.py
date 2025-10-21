"""
Modèle de données pour les matières premières pour la production de pâtes
"""
from datetime import datetime, date
from typing import Optional, List, Dict
from enum import Enum
from pydantic import BaseModel, Field, validator


class RawMaterialCategory(str, Enum):
    """Catégories de matières premières pour pâtes"""
    SEMOLINA = "semoule"  # Semoule de blé dur
    FLOUR = "farine"  # Farine de blé tendre
    EGGS = "oeufs"  # Œufs pour pâtes aux œufs
    WATER = "eau"  # Eau de process
    VEGETABLES = "legumes"  # Épinards, tomates, etc.
    ADDITIVES = "additifs"  # Colorants naturels, etc.
    PACKAGING = "emballage"  # Cartons, sachets


class QualityGrade(str, Enum):
    """Grades de qualité"""
    PREMIUM = "premium"
    STANDARD = "standard"
    ECONOMY = "economique"
    ORGANIC = "biologique"


class StorageCondition(str, Enum):
    """Conditions de stockage"""
    AMBIENT = "ambiant"  # 15-25°C
    COLD = "froid"  # 0-4°C
    FROZEN = "congele"  # -18°C
    DRY = "sec"  # < 60% humidité


class AnalyseQualite(BaseModel):
    """Analyse qualité d'un lot"""
    date_analyse: datetime
    laboratoire: str
    numero_rapport: str

    # Paramètres généraux
    humidite_percent: Optional[float] = None
    temperature_celsius: Optional[float] = None
    ph: Optional[float] = None

    # Paramètres spécifiques semoule/farine
    taux_proteines_percent: Optional[float] = None  # Important pour la qualité
    taux_cendres_percent: Optional[float] = None
    gluten_humide_percent: Optional[float] = None
    indice_chute_hagberg: Optional[int] = None  # Activité enzymatique
    granulometrie_microns: Optional[float] = None

    # Contamination
    aflatoxines_ppb: Optional[float] = None
    ochratoxine_ppb: Optional[float] = None
    metaux_lourds: Optional[Dict[str, float]] = None

    # Microbiologie
    bacteries_totales_ufc_g: Optional[float] = None
    coliformes_ufc_g: Optional[float] = None
    salmonelle_detectee: bool = False
    listeria_detectee: bool = False

    # Résultat
    conforme: bool
    non_conformites: List[str] = []
    observations: Optional[str] = None


class SpecificationTechnique(BaseModel):
    """Spécifications techniques d'une matière première"""
    # Caractéristiques physiques
    humidite_max_percent: float
    humidite_min_percent: Optional[float] = None
    granulometrie_min_microns: Optional[float] = None
    granulometrie_max_microns: Optional[float] = None

    # Caractéristiques chimiques
    proteines_min_percent: Optional[float] = None
    proteines_max_percent: Optional[float] = None
    cendres_max_percent: Optional[float] = None
    acidite_max: Optional[float] = None

    # Limites de contamination
    aflatoxines_max_ppb: float = 5.0  # Norme EU
    ochratoxine_max_ppb: float = 3.0
    plomb_max_ppm: float = 0.2
    cadmium_max_ppm: float = 0.1

    # Microbiologie
    bacteries_totales_max_ufc_g: float = 100000
    coliformes_max_ufc_g: float = 100
    salmonelle_tolerance: bool = False
    listeria_tolerance: bool = False

    # Organoleptique
    couleur_reference: Optional[str] = None
    odeur_reference: str = "caractéristique, sans odeur étrangère"
    aspect_reference: Optional[str] = None


class MatierePremiere(BaseModel):
    """Matière première"""
    id: str
    code_interne: str  # Code ERP
    nom: str
    categorie: RawMaterialCategory
    grade: QualityGrade

    # Fournisseur
    fournisseur_id: str
    fournisseurs_alternatifs: List[str] = []

    # Spécifications
    specifications: SpecificationTechnique

    # Origine
    pays_origine: str
    region_origine: Optional[str] = None
    certification_origine: Optional[str] = None  # AOP, IGP, etc.

    # Conditionnement
    conditionnement_standard: str  # Ex: "Sac 25kg"
    poids_net_kg: float
    unite_commande: str = "kg"

    # Prix
    prix_unitaire_eur: float
    devise: str = "EUR"
    prix_derniere_maj: datetime

    # Stockage
    condition_stockage: StorageCondition
    duree_vie_jours: int
    stock_securite_kg: float
    stock_minimum_kg: float
    stock_maximum_kg: float

    # Consommation
    consommation_moyenne_kg_jour: Optional[float] = None
    saisonnalite: Optional[str] = None  # "haute"/"basse" selon période

    # Métadonnées
    date_creation: datetime = Field(default_factory=datetime.now)
    date_modification: datetime = Field(default_factory=datetime.now)
    actif: bool = True

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

    def calculer_point_commande(self) -> float:
        """Calcule le point de recommande basé sur consommation et délai"""
        if not self.consommation_moyenne_kg_jour:
            return self.stock_minimum_kg
        # Point de commande = consommation pendant délai + stock sécurité
        return self.stock_securite_kg


class LotMatierePremiere(BaseModel):
    """Lot de matière première reçu"""
    id: str
    numero_lot: str  # Numéro du fournisseur
    numero_lot_interne: str  # Notre numéro de traçabilité
    matiere_premiere_id: str
    fournisseur_id: str

    # Réception
    date_reception: datetime
    numero_bon_livraison: str
    numero_commande: str

    # Quantité
    quantite_kg: float
    nombre_unites: int  # Nombre de sacs, palettes, etc.
    conditionnement: str

    # Dates
    date_fabrication: Optional[date] = None
    date_peremption: date
    date_limite_utilisation: Optional[date] = None

    # Qualité
    analyse_reception: Optional[AnalyseQualite] = None
    analyses_complementaires: List[AnalyseQualite] = []
    statut_qualite: str = "en_attente"  # en_attente, conforme, non_conforme, quarantaine

    # Stockage
    emplacement_stockage: str
    zone_stockage: str

    # Traçabilité
    utilisations: List[str] = []  # IDs des lots de production utilisant ce lot
    quantite_restante_kg: float

    # Statut
    actif: bool = True
    bloque: bool = False
    motif_blocage: Optional[str] = None

    date_creation: datetime = Field(default_factory=datetime.now)

    @validator('quantite_restante_kg')
    def validate_quantite_restante(cls, v, values):
        if 'quantite_kg' in values and v > values['quantite_kg']:
            raise ValueError("La quantité restante ne peut pas dépasser la quantité initiale")
        return v

    def est_perime(self) -> bool:
        """Vérifie si le lot est périmé"""
        return date.today() > self.date_peremption

    def jours_avant_peremption(self) -> int:
        """Nombre de jours avant péremption"""
        return (self.date_peremption - date.today()).days

    def taux_utilisation_percent(self) -> float:
        """Taux d'utilisation du lot"""
        if self.quantite_kg == 0:
            return 0
        return ((self.quantite_kg - self.quantite_restante_kg) / self.quantite_kg) * 100
