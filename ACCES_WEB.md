# 🌐 Accès à l'Interface Web

## 🚀 Démarrage Ultra-Rapide

### Windows

Double-cliquez sur :
```
start_web.bat
```

### Linux / Mac

```bash
./start_web.sh
```

Ou :
```bash
python web_app.py
```

---

## 📱 Accès à l'Interface

Une fois lancé, ouvrez votre navigateur à :

### Sur votre machine
```
http://localhost:5000
```

### Depuis un autre appareil sur le même réseau

Trouvez votre adresse IP :

**Windows** :
```cmd
ipconfig
```
Cherchez "Adresse IPv4"

**Linux/Mac** :
```bash
ifconfig
# ou
hostname -I
```

Puis accédez depuis l'autre appareil :
```
http://VOTRE_IP:5000
```

Exemple : `http://192.168.1.45:5000`

---

## 🎯 Fonctionnalités Disponibles

### 1. 🔍 Découverte de Fournisseurs
- Recherche intelligente dans 13+ fournisseurs européens
- Scoring automatique multi-critères
- Filtrage par zone géographique, certifications, rayon
- Résultats en temps réel

**Comment utiliser** :
1. Cliquez sur l'onglet "Découverte Fournisseurs"
2. Choisissez le type (Matières premières, Ingrédients, Emballages)
3. Ajustez le rayon de recherche
4. Cliquez "Lancer la recherche"
5. **8 fournisseurs trouvés en <1 seconde !**

### 2. 📊 Prévisions de Consommation
- Calcul automatique des prévisions sur 30-90 jours
- Tendances (hausse, baisse, stable)
- Stock de sécurité automatique
- Plan d'approvisionnement
- Alertes de rupture

**Comment utiliser** :
1. Cliquez sur l'onglet "Prévisions"
2. Choisissez la matière première
3. Indiquez l'horizon et le stock actuel
4. Cliquez "Générer les prévisions"
5. **Décision automatique : Commander / Surveiller / OK**

### 3. ✅ Contrôle Qualité
- Validation automatique des analyses
- Vérification vs spécifications techniques
- Décision conforme/non-conforme
- Actions recommandées

**Comment utiliser** :
1. Cliquez sur l'onglet "Contrôle Qualité"
2. Entrez le numéro de lot et la quantité
3. Saisissez les résultats d'analyse
4. Cliquez "Vérifier la conformité"
5. **Décision automatique : Accepter / Refuser / Quarantaine**

---

## 🎨 Captures d'Écran

### Page d'Accueil
```
┌────────────────────────────────────────────────────┐
│  Système de Sourcing Permanent                     │
│  RT-Technologie - Usine Agroalimentaire           │
│                                                     │
│  [🔍 Découverte] [📊 Prévisions] [✅ Qualité]    │
└────────────────────────────────────────────────────┘
```

### Recherche de Fournisseurs
```
Type: [Matières Premières ▼]
Rayon: [500] km
☑ Privilégier fournisseurs locaux

        [🔍 Lancer la recherche]

────────────────────────────────────────
✓ 8 fournisseurs trouvés

1. Moulins Bourgeois (FR)    [52.8/100]
   📍 Verdelot, Seine-et-Marne
   🚚 359 km
   📜 Bio EU, Nature & Progrès
   🏭 50000 tonnes/an
```

---

## ⚙️ Configuration

### Modifier Votre Localisation

Éditez `web_app.py` ligne 94 :

```python
# Lyon (par défaut)
notre_localisation=(45.7640, 4.8357)

# Votre ville :
# Paris
notre_localisation=(48.8566, 2.3522)

# Marseille
notre_localisation=(43.2965, 5.3698)

# Toulouse
notre_localisation=(43.6047, 1.4442)

# Nantes
notre_localisation=(47.2184, -1.5536)
```

Puis relancez l'application.

---

## 🆘 Dépannage

### L'interface ne s'ouvre pas

**Vérifiez que Flask est installé** :
```bash
pip install flask
```

**Vérifiez que le port 5000 est libre** :
```bash
# Windows
netstat -ano | findstr :5000

# Linux/Mac
lsof -i :5000
```

Si le port est occupé, arrêtez l'autre application ou changez le port dans `web_app.py` :
```python
app.run(debug=True, host='0.0.0.0', port=8080)  # Au lieu de 5000
```

### Erreur "Module not found"

```bash
# Installer toutes les dépendances
pip install -r requirements.txt
```

### Impossible d'accéder depuis un autre appareil

**Vérifiez votre pare-feu** :
- Windows : Autoriser Python dans le pare-feu Windows
- Mac : Préférences Système → Sécurité → Pare-feu
- Linux : `sudo ufw allow 5000`

---

## 🔒 Sécurité

⚠️ **IMPORTANT** : L'interface web est en mode développement.

Pour une utilisation en production :
1. Désactivez le mode debug
2. Utilisez un serveur WSGI (gunicorn, uwsgi)
3. Ajoutez une authentification
4. Utilisez HTTPS

---

## 📞 Aide Supplémentaire

- **Documentation complète** : `docs/GUIDE_UTILISATION.md`
- **Guide démarrage** : `COMMENT_UTILISER.md`
- **Exemples Python** : Dossier `examples/`

---

## 🎉 C'est Tout !

Vous pouvez maintenant utiliser le système via l'interface web !

**Recommandation** : Ajoutez cette page à vos favoris :
```
http://localhost:5000
```

**Bon sourcing ! 🚀**
