# ✅ Base de Données RT-Technologie - Configuration Terminée

**Date:** 2025-11-20
**Status:** ✅ **OPÉRATIONNELLE**

---

## 📊 Résumé de la Configuration

### 🗄️ Type de Base de Données
- **MongoDB Atlas** (Cloud)
- **Cluster:** StagingRT
- **Nom de la base:** `rt-technologie`
- **URI:** `mongodb+srv://vercel:***@stagingrt.v2jnoh2.mongodb.net/`

### 📦 Collections Créées
**Total:** 33 collections

#### Collections avec données initiales (6):
- ✅ **orders** - 2 commandes
- ✅ **carriers** - 3 transporteurs
- ✅ **dispatch_policies** - 2 politiques de dispatch
- ✅ **vigilance** - 3 statuts de conformité
- ✅ **invitations** - 1 invitation
- ✅ **planning_slots** - 3 créneaux horaires

#### Collections vides (prêtes pour les données):
- notifications
- tms-sync-logs
- plannings
- routes
- affret-requests
- affret-predictions
- vigilance-alerts
- users
- roles
- permissions
- ecpmr-documents
- palettes
- training-courses
- training-enrollments
- storage-listings
- storage-bookings
- pricing-grids
- tracking-events
- tracking-predictions
- transport-offers
- transport-bids
- wms-sync-logs
- erp-sync-logs
- chatbot-conversations
- chatbot-messages
- geo-locations

### 🔑 Index Créés
**Total:** 103+ index

Dont :
- **Index uniques** : 15+ (orderId, userId, email, etc.)
- **Index géospatiaux** : 3 (2dsphere pour géolocalisation)
- **Index de performance** : 85+ (dates, statuts, relations)

---

## 📁 Fichiers de Configuration

### Variables d'Environnement
**Fichier:** [.env](.env)
```bash
MONGODB_URI=mongodb+srv://vercel:vercel@stagingrt.v2jnoh2.mongodb.net/rt-technologie?retryWrites=true&w=majority&appName=StagingRT
MONGODB_DB=rt-technologie
```

---

## 🛠️ Scripts Disponibles

### 1. Migration (Créer les collections et index)
```bash
node infra/scripts/migrate-db.js
```
- Crée 33 collections
- Crée 103+ index
- Résultat : ✅ 28 collections créées, 103 index créés

### 2. Seeding (Charger les données initiales)
```bash
node infra/scripts/seed-mongo.js
```
- Charge les données de `infra/seeds/*.json`
- Nettoie et recrée les collections de données
- Résultat : ✅ 6 collections peuplées

### 3. Vérification (Tester la connexion et les données)
```bash
node infra/scripts/verify-db.js
```
- Teste la connexion MongoDB Atlas
- Liste toutes les collections
- Affiche les statistiques et exemples
- Résultat : ✅ Connexion réussie, 33 collections, 6 avec données

---

## 📄 Données de Seed Chargées

### Transporteurs (carriers)
```json
{
  "id": "A",
  "name": "Carrier A",
  "email": "carrierA@example.com",
  "vat": "FR12345678901",
  "blocked": true,
  "scoring": 82,
  "grid_ref": "grid-A",
  "premium": false
}
```

### Commandes (orders)
```json
{
  "id": "ORD-Paris-Munich",
  "ref": "PO-1001",
  "ownerOrgId": "IND-1",
  "ship_from": "Paris",
  "ship_to": "Munich",
  "windows": {
    "start": "2025-01-10T08:00:00Z",
    "end": "2025-01-10T16:00:00Z"
  },
  "pallets": 12,
  "weight": 7800,
  "status": "NEW"
}
```

### Vigilance (vigilance)
```json
[
  { "carrierId": "A", "status": "BLOCKED" },
  { "carrierId": "B", "status": "OK" },
  { "carrierId": "C", "status": "OK" }
]
```

---

## 🚀 Prochaines Étapes

### 1. Ajouter plus de données de seed
Créez des fichiers JSON dans `infra/seeds/` pour :
- `users.json` - Comptes utilisateurs
- `training-modules.json` - Modules de formation
- `storage-needs.json` - Besoins en stockage
- `storage-offers.json` - Offres de stockage
- etc.

### 2. Tester avec vos services
Démarrez vos services backend :
```bash
pnpm run agents
```

Les services utiliseront automatiquement MongoDB Atlas grâce au fichier `.env`.

### 3. Accéder à MongoDB Atlas
- URL : https://cloud.mongodb.com
- Cluster : StagingRT
- Database : rt-technologie

Vous pouvez :
- Visualiser les collections dans l'interface web
- Exécuter des requêtes
- Surveiller les performances
- Créer des backups

### 4. Sécurité (Production)
Pour la production :
- [ ] Créer un utilisateur dédié avec mot de passe fort
- [ ] Configurer l'accès réseau (whitelisting IP)
- [ ] Activer les backups automatiques
- [ ] Configurer les alertes de monitoring
- [ ] Stocker les secrets dans AWS Secrets Manager

---

## 📊 Monitoring et Maintenance

### Commandes utiles

**Vérifier l'état de la base :**
```bash
node infra/scripts/verify-db.js
```

**Réinitialiser les données de seed :**
```bash
node infra/scripts/seed-mongo.js
```

**Recréer toutes les collections :**
```bash
node infra/scripts/migrate-db.js
node infra/scripts/seed-mongo.js
```

---

## ✅ Vérification Finale

- [x] MongoDB Atlas configuré
- [x] URI de connexion ajoutée dans `.env`
- [x] 33 collections créées
- [x] 103+ index créés
- [x] 6 collections peuplées avec données initiales
- [x] Connexion testée et fonctionnelle
- [x] Scripts de migration et seeding opérationnels
- [x] Script de vérification créé

---

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez que l'accès réseau est configuré dans MongoDB Atlas
2. Vérifiez que l'utilisateur a les bonnes permissions
3. Testez la connexion avec : `node infra/scripts/verify-db.js`
4. Consultez les logs d'erreur

---

**🎉 Votre base de données est prête à être utilisée !**
