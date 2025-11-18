# Guide de Configuration MongoDB Atlas

**Date** : 18 Janvier 2025

---

## 📋 Informations Récupérées

Vous avez créé un Service Account MongoDB Atlas avec les credentials suivants :

```
Client ID: mdb_sa_id_69162397e0eb4e727d820df7
Client Secret: mdb_sa_sk_tCC0rwyToItuF50DC501806lQqFrrK7m8PXFPRLS
```

⚠️ **IMPORTANT** : Ces credentials doivent être stockés de manière sécurisée et ne jamais être committés dans Git.

---

## 🔗 Obtenir l'URI de Connexion MongoDB

### Étape 1 : Se connecter à MongoDB Atlas

1. Allez sur https://cloud.mongodb.com/
2. Connectez-vous avec votre compte

### Étape 2 : Trouver votre Cluster

1. Dans le dashboard, cliquez sur votre cluster (probablement nommé "Cluster0" ou similaire)
2. Cliquez sur le bouton **"Connect"**

### Étape 3 : Choisir la méthode de connexion

1. Sélectionnez **"Connect your application"**
2. Sélectionnez le driver : **Node.js**
3. Sélectionnez la version : **6.8 or later**

### Étape 4 : Copier l'URI de connexion

Vous devriez voir une URI similaire à :

```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

**Format pour RT Technologie** :

```
mongodb+srv://rt_admin:<PASSWORD>@<CLUSTER_NAME>.mongodb.net/rt_technologie?retryWrites=true&w=majority
```

Où :
- `<PASSWORD>` : Le mot de passe de votre utilisateur MongoDB (PAS le Client Secret)
- `<CLUSTER_NAME>` : Le nom de votre cluster (ex: cluster0.ab1cd)
- `rt_technologie` : Le nom de la base de données

---

## 🔐 Configuration des Variables d'Environnement

### 1. Générer les Secrets

Ouvrez un terminal bash et générez des secrets forts :

```bash
# Générer JWT_SECRET
openssl rand -hex 32

# Générer INTERNAL_SERVICE_TOKEN
openssl rand -hex 32

# Générer SESSION_SECRET
openssl rand -hex 32
```

### 2. Créer le fichier .env de production

Copiez le template et remplissez avec vos vraies valeurs :

```bash
cd services/client-onboarding
cp ../../infra/config/production.env .env.production
```

Éditez `.env.production` avec vos valeurs :

```bash
# =============================================================================
# RT-Technologie - Configuration Production
# Service: Client Onboarding
# =============================================================================

NODE_ENV=production
PORT=3020

# MongoDB Atlas
MONGODB_URI=mongodb+srv://rt_admin:<VOTRE_MOT_DE_PASSE>@cluster0.xxxxx.mongodb.net/rt_technologie?retryWrites=true&w=majority

# JWT & Security (générer avec: openssl rand -hex 32)
JWT_SECRET=<RESULTAT_OPENSSL_1>
INTERNAL_SERVICE_TOKEN=<RESULTAT_OPENSSL_2>
SESSION_SECRET=<RESULTAT_OPENSSL_3>

# SMTP - À configurer selon votre choix
# Voir: docs/SMTP_CONFIGURATION.md
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=<VOTRE_SENDGRID_API_KEY>

# Application URLs
APP_URL=https://app.rt-technologie.com
MARKETING_URL=https://www.rt-technologie.com

# Email
EMAIL_FROM=RT Technologie <noreply@rt-technologie.com>
EMAIL_REPLY_TO=contact@rt-technologie.com
EMAIL_SUPPORT=support@rt-technologie.com
```

---

## 🛡️ Sécurité MongoDB Atlas

### 1. Whitelist IP du serveur

Dans MongoDB Atlas :
1. Allez dans **"Network Access"**
2. Cliquez sur **"Add IP Address"**
3. Ajoutez l'IP de votre serveur de production
4. Pour les tests, vous pouvez temporairement ajouter `0.0.0.0/0` (permet toutes les IPs - **à éviter en production**)

### 2. Créer un utilisateur dédié

1. Allez dans **"Database Access"**
2. Cliquez sur **"Add New Database User"**
3. Créez un utilisateur : `rt_admin`
4. Choisissez **"Password"** comme méthode d'authentification
5. Définissez un mot de passe fort
6. Privilèges : **"Read and write to any database"** (ou restreindre à `rt_technologie`)
7. Sauvegardez le mot de passe en lieu sûr

---

## 🧪 Tester la Connexion

### Test 1 : Connexion basique

```bash
cd services/client-onboarding

# Créer un fichier de test
cat > test-mongodb.js << 'EOF'
require('dotenv').config({ path: '.env.production' });
const { MongoClient } = require('mongodb');

async function test() {
  console.log('🔗 Connexion à MongoDB Atlas...');
  console.log('URI:', process.env.MONGODB_URI.replace(/:[^:]*@/, ':****@'));

  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    console.log('✅ Connexion réussie !');

    const db = client.db();
    console.log('📊 Base de données:', db.databaseName);

    // Lister les collections
    const collections = await db.listCollections().toArray();
    console.log('📁 Collections:', collections.map(c => c.name));

    await client.close();
    console.log('👋 Déconnexion réussie');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

test();
EOF

# Exécuter le test
node test-mongodb.js
```

### Test 2 : Insérer un document de test

```bash
cat > test-insert.js << 'EOF'
require('dotenv').config({ path: '.env.production' });
const { MongoClient } = require('mongodb');

async function test() {
  const client = await MongoClient.connect(process.env.MONGODB_URI);
  const db = client.db();

  // Insérer un document de test
  const result = await db.collection('test').insertOne({
    message: 'Hello from RT Technologie',
    timestamp: new Date()
  });

  console.log('✅ Document inséré:', result.insertedId);

  // Lire le document
  const doc = await db.collection('test').findOne({ _id: result.insertedId });
  console.log('📄 Document lu:', doc);

  // Supprimer le document de test
  await db.collection('test').deleteOne({ _id: result.insertedId });
  console.log('🗑️  Document supprimé');

  await client.close();
}

test();
EOF

node test-insert.js
```

---

## 📊 Créer les Collections Nécessaires

Les collections seront créées automatiquement lors de la première insertion, mais vous pouvez les créer manuellement :

```javascript
// Collections requises pour le service client-onboarding
- company_verifications : Vérifications de numéros de TVA
- clients : Comptes clients
- contracts : Contrats signés
```

### Via MongoDB Atlas UI

1. Allez sur votre cluster
2. Cliquez sur **"Browse Collections"**
3. Cliquez sur **"Create Database"**
   - Database name: `rt_technologie`
   - Collection name: `company_verifications`
4. Répétez pour `clients` et `contracts`

---

## 🔄 Migration des Données (si nécessaire)

Si vous avez des données de test local à migrer :

```bash
# Export depuis MongoDB local
mongodump --uri="mongodb://localhost:27017/rt_technologie" --out=./backup

# Import vers MongoDB Atlas
mongorestore --uri="mongodb+srv://rt_admin:<PASSWORD>@cluster0.xxxxx.mongodb.net" ./backup
```

---

## 📈 Monitoring MongoDB Atlas

### Dashboard MongoDB Atlas

1. **Metrics** : Voir les performances (CPU, Memory, Connections)
2. **Real-Time** : Voir les opérations en temps réel
3. **Alerts** : Configurer des alertes (disque plein, connexions élevées, etc.)

### Configurer des alertes

1. Allez dans **"Alerts"**
2. Créez des alertes pour :
   - Connexions > 80% de la limite
   - Utilisation disque > 80%
   - Opérations lentes (> 100ms)

---

## 💰 Plan Gratuit vs Payant

### Plan Gratuit (M0)
- ✅ 512 MB de stockage
- ✅ Partagé CPU/RAM
- ✅ Suffisant pour démarrer
- ⚠️ Pas de backup automatique
- ⚠️ Pas de réplication multi-région

### Quand upgrader ?
- Quand vous dépassez 500 MB de données
- Quand vous avez besoin de backups automatiques
- Quand vous avez besoin de meilleures performances

---

## 🆘 Dépannage

### Erreur : "MongoNetworkError: connection timed out"
- ✅ Vérifier que l'IP du serveur est whitelistée
- ✅ Vérifier le firewall du serveur

### Erreur : "Authentication failed"
- ✅ Vérifier le mot de passe dans l'URI
- ✅ Vérifier que l'utilisateur existe dans "Database Access"

### Erreur : "Database not found"
- ✅ La base sera créée automatiquement à la première insertion
- ✅ Vérifier l'orthographe du nom de la base dans l'URI

---

## ✅ Checklist Finale

Avant de déployer en production :

- [ ] Cluster MongoDB Atlas créé
- [ ] Utilisateur `rt_admin` créé avec mot de passe fort
- [ ] IP du serveur whitelistée
- [ ] URI de connexion récupérée
- [ ] `.env.production` créé avec URI correcte
- [ ] Secrets générés (JWT_SECRET, etc.)
- [ ] Test de connexion réussi
- [ ] Collections créées (optionnel, sera fait automatiquement)
- [ ] Alertes configurées
- [ ] Backup planifié (si plan payant)

---

## 📞 Support

- **Documentation MongoDB Atlas** : https://docs.atlas.mongodb.com/
- **Support MongoDB** : https://support.mongodb.com/
- **Documentation interne** : [docs/CLIENT_ONBOARDING_SYSTEM.md](CLIENT_ONBOARDING_SYSTEM.md)

---

**Prochaine étape** : Configurer SMTP (voir [docs/SMTP_CONFIGURATION.md](SMTP_CONFIGURATION.md))
