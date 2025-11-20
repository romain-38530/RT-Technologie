#!/usr/bin/env node
// ============================================================================
// RT-Technologie - Database Verification Script
// ============================================================================
// Description: Vérifier que la base de données est correctement configurée
// ============================================================================

require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || 'rt-technologie';

async function verify() {
  console.log('🔍 RT-Technologie - Database Verification');
  console.log('==========================================\n');

  const client = new MongoClient(MONGODB_URI);

  try {
    // Connexion
    console.log('📡 Connexion à MongoDB Atlas...');
    await client.connect();
    console.log('✓ Connexion réussie\n');

    const db = client.db(DB_NAME);

    // Lister toutes les collections
    console.log('📦 Collections disponibles:');
    const collections = await db.listCollections().toArray();
    console.log(`   Total: ${collections.length} collections\n`);

    // Compter les documents dans chaque collection avec des données
    const stats = [];
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      if (count > 0) {
        stats.push({ name: col.name, count });
      }
    }

    console.log('📊 Collections avec données:');
    if (stats.length === 0) {
      console.log('   Aucune donnée trouvée (base de données vide)');
    } else {
      for (const stat of stats) {
        console.log(`   ✓ ${stat.name}: ${stat.count} documents`);
      }
    }

    console.log('\n==========================================');
    console.log('✓ Vérification terminée avec succès!');
    console.log('==========================================\n');

    // Afficher quelques exemples de données
    if (stats.length > 0) {
      console.log('📄 Exemples de données:\n');

      // Orders
      const ordersCount = await db.collection('orders').countDocuments();
      if (ordersCount > 0) {
        const sampleOrder = await db.collection('orders').findOne();
        console.log('📦 Exemple de commande:');
        console.log(JSON.stringify(sampleOrder, null, 2));
        console.log('');
      }

      // Carriers
      const carriersCount = await db.collection('carriers').countDocuments();
      if (carriersCount > 0) {
        const sampleCarrier = await db.collection('carriers').findOne();
        console.log('🚛 Exemple de transporteur:');
        console.log(JSON.stringify(sampleCarrier, null, 2));
        console.log('');
      }
    }

  } catch (error) {
    console.error('✗ Erreur lors de la vérification:', error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Exécution
if (require.main === module) {
  verify();
}

module.exports = { verify };
