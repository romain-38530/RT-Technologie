# 🚀 Comment Utiliser le Système de Sourcing Permanent

## 📋 Vue d'Ensemble

Vous avez maintenant **3 façons** d'utiliser le système selon vos préférences :

```
┌─────────────────────────────────────────────────────────────┐
│  1. 🌐 INTERFACE WEB        → Pour utilisateurs business     │
│  2. 💻 MENU INTERACTIF       → Pour utilisateurs techniques   │
│  3. 🔧 CODE PYTHON           → Pour développeurs/intégration  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🌐 Option 1 : Interface Web (Recommandée)

### ✨ La plus simple - Aucune connaissance technique requise !

### Lancement

```bash
cd RT-Technologie
python web_app.py
```

Vous verrez :
```
================================================================================
🌐 INTERFACE WEB - SYSTÈME DE SOURCING PERMANENT
================================================================================

✓ Serveur démarré

📱 Ouvrez votre navigateur à l'adresse:

   👉  http://localhost:5000

================================================================================
```

### Ouvrir l'interface

1. **Ouvrez votre navigateur** (Chrome, Firefox, Safari, Edge...)
2. **Tapez** : `http://localhost:5000`
3. **Vous voyez l'interface !** 🎉

### Fonctionnalités Disponibles

#### 🔍 Découverte de Fournisseurs

1. Cliquez sur l'onglet **"Découverte Fournisseurs"**
2. Choisissez le type :
   - Matières Premières (Semoule, Farine)
   - Ingrédients (Œufs, Légumes)
   - Emballages
3. Ajustez le rayon de recherche (ex: 500 km)
4. Cochez "BIO" si obligatoire
5. Cliquez **"Lancer la recherche"**

**Résultat** : Liste de fournisseurs avec score, distance, certifications !

#### 📊 Prévisions

1. Cliquez sur l'onglet **"Prévisions"**
2. Choisissez la matière première
3. Indiquez :
   - Horizon de prévision (ex: 30 jours)
   - Stock actuel (ex: 25000 kg)
4. Cliquez **"Générer les prévisions"**

**Résultat** : Prévisions, stock de sécurité, plan d'approvisionnement !

#### ✅ Contrôle Qualité

1. Cliquez sur l'onglet **"Contrôle Qualité"**
2. Entrez :
   - Numéro de lot
   - Quantité reçue
   - Résultats d'analyses (humidité, protéines, aflatoxines...)
3. Cliquez **"Vérifier la conformité"**

**Résultat** : Décision automatique (Accepter / Refuser / Quarantaine) !

### Captures d'écran

```
┌──────────────────────────────────────────────────┐
│  Système de Sourcing Permanent                   │
│  ─────────────────────────────────────────────   │
│                                                   │
│  [🔍 Découverte] [📊 Prévisions] [✅ Qualité]   │
│                                                   │
│  Type de fournisseur: [Matières Premières ▼]     │
│  Rayon: [500] km                                  │
│  ☑ Privilégier fournisseurs locaux               │
│                                                   │
│         [🔍 Lancer la recherche]                  │
│                                                   │
│  ──────────────────────────────────────────      │
│  ✓ 8 fournisseurs trouvés                        │
│                                                   │
│  1. Moulins Bourgeois (FR)        [52.8/100]     │
│     📍 Verdelot, Seine-et-Marne                   │
│     🚚 359 km                                     │
│     📜 Bio EU, Nature & Progrès                   │
└──────────────────────────────────────────────────┘
```

---

## 💻 Option 2 : Menu Interactif

### Pour qui ?
Utilisateurs qui préfèrent la ligne de commande mais veulent un menu guidé.

### Lancement

```bash
cd RT-Technologie
python quick_start.py
```

### Menu

```
================================================================================
SYSTÈME DE SOURCING PERMANENT - DÉMARRAGE RAPIDE
================================================================================

Que voulez-vous faire ?

  1. 🔍 Découvrir des fournisseurs (recherche automatique)
  2. 📋 Simuler un appel d'offres complet
  3. 📊 Générer des prévisions de consommation
  4. ✅ Tester le contrôle qualité
  5. 🎯 Workflow complet (tout en un)

  0. ❌ Quitter

Votre choix:
```

### Exemple d'utilisation

```
Votre choix: 1

🔍 DÉCOUVERTE AUTOMATIQUE DE FOURNISSEURS

Que cherchez-vous ?
  1. Semoule de blé dur
  2. Œufs / Ovoproduits
  3. Emballages

Votre choix (1-3): 1

🌾 Recherche de fournisseurs de SEMOULE...
🔄 Recherche en cours...

✅ 8 fournisseur(s) trouvé(s)

TOP FOURNISSEURS IDENTIFIÉS
────────────────────────────────────────────────────────────

1. Moulins Bourgeois (FR)
   📍 Verdelot, Seine-et-Marne
   📊 Score: 52.8/100
   🚚 Distance: 359 km
   📜 Certif: Bio EU, Nature & Progrès, ISO 14001
   🌐 www.moulins-bourgeois.com
```

---

## 🔧 Option 3 : Code Python

### Pour qui ?
Développeurs, intégration dans vos systèmes, automatisation.

### Exemples Prêts à l'Emploi

```bash
# Voir tous les exemples
cd RT-Technologie/examples/

# 1. Workflow complet de bout en bout
python example_complete_workflow.py

# 2. Découverte de fournisseurs
python example_supplier_discovery.py
```

### Utilisation dans Votre Code

#### Découverte de Fournisseurs

```python
from src.services.supplier_discovery import SupplierDiscoveryEngine
from src.models.supplier_discovery import CritereRecherche, GeographicZone
from src.models.supplier import SupplierType, CertificationType

# Initialiser
discovery = SupplierDiscoveryEngine()

# Définir critères
criteres = CritereRecherche(
    type_fournisseur=SupplierType.RAW_MATERIAL,
    matieres_premieres=["Semoule de blé dur"],
    zones_geographiques=[GeographicZone.EU],
    certifications_requises=[CertificationType.IFS],
    local_prefere=True,
    rayon_km=500
)

# Rechercher (votre localisation: Lyon)
resultat = discovery.search_suppliers(
    criteres,
    notre_localisation=(45.7640, 4.8357)
)

# Afficher les résultats
print(f"✓ {resultat.nombre_total} fournisseurs trouvés")
for f in resultat.fournisseurs_trouves[:3]:
    print(f"{f.nom_entreprise}: {f.score_pertinence:.1f}/100")
```

#### Prévisions

```python
from src.services.forecast_engine import ForecastEngine
from datetime import date, timedelta

forecast = ForecastEngine()

# Charger historique (simulé pour la démo)
for i in range(90):
    forecast.add_historical_consumption(
        "SEM_001",
        date.today() - timedelta(days=90-i),
        2000 + random.randint(-300, 300)
    )

# Prévoir 30 jours
prev = forecast.forecast_demand("SEM_001", horizon_days=30)
print(f"Prévision: {prev['adjusted_forecast']:,.0f} kg")

# Plan d'approvisionnement
plan = forecast.generate_procurement_plan(
    "SEM_001",
    current_stock=25000,
    lead_time_days=7
)

if plan['need_to_order']:
    print(f"⚠️ COMMANDER {plan['net_requirement']:,.0f} kg")
```

#### Contrôle Qualité

```python
from src.services.quality_manager import QualityManager
from src.models.raw_material import LotMatierePremiere, AnalyseQualite

quality_mgr = QualityManager()

# Créer lot et analyse
lot = LotMatierePremiere(...)
analyse = AnalyseQualite(...)

# Vérifier
result = quality_mgr.enregistrer_reception(lot, analyse)

if result['statut'] == 'conforme':
    print("✅ LOT ACCEPTÉ")
else:
    print("❌ LOT REFUSÉ")
```

---

## 📖 Documentation Complète

### Guides

1. **Guide Utilisateur Complet** : `docs/GUIDE_UTILISATION.md`
   - 50+ exemples de code
   - Tous les cas d'usage
   - FAQ et résolution de problèmes

2. **Documentation Technique** : `docs/DOCUMENTATION.md`
   - Architecture complète
   - Modèles de données
   - Services métier

3. **README** : `README.md`
   - Vue d'ensemble
   - Installation
   - Démarrage rapide

---

## 🎯 Cas d'Usage Courants

### 1. Sourcing Urgent

**Situation** : Rupture de stock, besoin d'un nouveau fournisseur rapidement.

**Solution Web** :
1. Ouvrir http://localhost:5000
2. Onglet "Découverte Fournisseurs"
3. Type: Matières Premières
4. Rayon: 300 km (proche)
5. Lancer
6. Contacter le TOP 1 immédiatement

**Résultat** : 30 secondes !

### 2. Vérification Quotidienne des Stocks

**Solution Menu** :
```bash
python quick_start.py
# Choix: 3 (Prévisions)
# Stock actuel: 25000
# Résultat: SURVEILLER - Proche du point de commande
```

### 3. Contrôle Qualité à Réception

**Solution Web** :
1. Onglet "Contrôle Qualité"
2. Entrer les résultats d'analyse
3. Clic → Décision automatique !

---

## ⚙️ Configuration

### Personnaliser Votre Localisation

Dans tous les scripts, remplacez les coordonnées :

```python
# Paris
notre_localisation = (48.8566, 2.3522)

# Lyon (par défaut)
notre_localisation = (45.7640, 4.8357)

# Marseille
notre_localisation = (43.2965, 5.3698)

# Toulouse
notre_localisation = (43.6047, 1.4442)
```

### Modifier les Seuils

```python
# Stock de sécurité plus élevé
stock_secu = forecast.calculate_safety_stock(
    matiere_id,
    service_level=0.98,  # 98% au lieu de 95%
    lead_time_days=10    # 10 jours au lieu de 7
)
```

---

## 🆘 Aide et Support

### Problèmes Courants

**L'interface web ne s'ouvre pas**
```bash
# Vérifier que Flask est installé
pip install flask

# Relancer
python web_app.py
```

**"Module not found"**
```bash
# Installer les dépendances
pip install -r requirements.txt

# Vérifier le PYTHONPATH
export PYTHONPATH=/chemin/vers/RT-Technologie
```

**Aucun fournisseur trouvé**
- Élargir le rayon de recherche
- Retirer les filtres (BIO, certifications)
- Choisir zone INTERNATIONAL au lieu de EU

### Obtenir de l'Aide

1. **Documentation** : `docs/GUIDE_UTILISATION.md`
2. **Exemples** : Dossier `examples/`
3. **Code source** : Tout est dans `src/`

---

## 🚀 Démarrage Recommandé

### Première Utilisation

1. **Installer** :
   ```bash
   pip install -r requirements.txt
   ```

2. **Tester** :
   ```bash
   python quick_start.py
   # Choix: 5 (Workflow complet)
   ```

3. **Découvrir l'interface web** :
   ```bash
   python web_app.py
   # Ouvrir http://localhost:5000
   ```

4. **Personnaliser** :
   - Modifier votre localisation
   - Ajouter vos fournisseurs
   - Adapter à vos besoins

---

## ✅ Checklist de Mise en Production

- [ ] Installer Python 3.9+
- [ ] Installer les dépendances (`pip install -r requirements.txt`)
- [ ] Tester les exemples
- [ ] Configurer votre localisation
- [ ] Ajouter vos fournisseurs existants
- [ ] Tester l'interface web
- [ ] Former les utilisateurs
- [ ] Intégrer avec votre ERP (optionnel)

---

## 🎉 C'est Parti !

Vous êtes prêt à utiliser le système !

**Recommandation** : Commencez par l'interface web, c'est la plus intuitive.

```bash
python web_app.py
```

Puis ouvrez : **http://localhost:5000**

**Bon sourcing ! 🚀**
