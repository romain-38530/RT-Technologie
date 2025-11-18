/**
 * Script de Test MongoDB Atlas
 *
 * Usage: node tests/test-mongodb.js
 */

require('dotenv').config({ path: '.env.production' });
const { MongoClient } = require('mongodb');

async function testMongoDBConnection() {
  console.log('\n🔗 Test de Connexion MongoDB Atlas\n');
  console.log('=====================================\n');

  // Masquer le mot de passe dans les logs
  const maskedURI = process.env.MONGODB_URI
    ? process.env.MONGODB_URI.replace(/:[^:]*@/, ':****@')
    : 'URI non définie';

  console.log('📍 URI:', maskedURI);
  console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
  console.log('');

  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI non définie dans .env.production');
    console.error('   Éditez .env.production et définissez MONGODB_URI');
    process.exit(1);
  }

  if (process.env.MONGODB_URI.includes('<db_username>') ||
      process.env.MONGODB_URI.includes('<db_password>')) {
    console.error('❌ Credentials MongoDB non configurés');
    console.error('   Remplacez <db_username> et <db_password> dans .env.production');
    process.exit(1);
  }

  try {
    console.log('⏳ Connexion en cours...');
    const client = await MongoClient.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });

    console.log('✅ Connexion réussie !');
    console.log('');

    const db = client.db();
    console.log('📊 Base de données:', db.databaseName);
    console.log('');

    // Lister les collections existantes
    console.log('📁 Collections existantes:');
    const collections = await db.listCollections().toArray();

    if (collections.length === 0) {
      console.log('   (Aucune collection - elles seront créées automatiquement)');
    } else {
      collections.forEach(col => {
        console.log(`   - ${col.name}`);
      });
    }
    console.log('');

    // Test d'écriture
    console.log('✍️  Test d\'écriture...');
    const testCollection = db.collection('connection_tests');
    const testDoc = {
      service: 'client-onboarding',
      timestamp: new Date(),
      test: 'Connection test from Node.js',
      server_ip: process.env.SERVER_IP || 'localhost'
    };

    const insertResult = await testCollection.insertOne(testDoc);
    console.log('✅ Document inséré:', insertResult.insertedId);
    console.log('');

    // Test de lecture
    console.log('📖 Test de lecture...');
    const readDoc = await testCollection.findOne({ _id: insertResult.insertedId });
    console.log('✅ Document lu:', {
      id: readDoc._id,
      service: readDoc.service,
      timestamp: readDoc.timestamp
    });
    console.log('');

    // Nettoyer le document de test
    console.log('🗑️  Nettoyage...');
    await testCollection.deleteOne({ _id: insertResult.insertedId });
    console.log('✅ Document de test supprimé');
    console.log('');

    // Vérifier les collections requises
    console.log('🔍 Vérification des collections requises:');
    const requiredCollections = ['company_verifications', 'clients', 'contracts'];
    const existingCollectionNames = collections.map(c => c.name);

    for (const colName of requiredCollections) {
      if (existingCollectionNames.includes(colName)) {
        console.log(`   ✅ ${colName} - existe`);
      } else {
        console.log(`   ⚠️  ${colName} - sera créée automatiquement`);
      }
    }
    console.log('');

    await client.close();
    console.log('👋 Déconnexion réussie');
    console.log('');
    console.log('=====================================');
    console.log('✅ TOUS LES TESTS RÉUSSIS !');
    console.log('=====================================');
    console.log('');
    console.log('🚀 MongoDB Atlas est prêt pour la production !');
    console.log('');
    console.log('📋 Prochaines étapes:');
    console.log('   1. Configurer SMTP dans .env.production');
    console.log('   2. Tester le service: npm start');
    console.log('   3. Déployer: bash ../../scripts/deploy-onboarding.sh production');
    console.log('');

  } catch (error) {
    console.error('❌ ERREUR DE CONNEXION\n');
    console.error('Type:', error.name);
    console.error('Message:', error.message);
    console.error('');

    if (error.message.includes('Authentication failed')) {
      console.error('🔐 Problème d\'authentification:');
      console.error('   - Vérifiez que le username et password sont corrects');
      console.error('   - Vérifiez que l\'utilisateur existe dans MongoDB Atlas > Database Access');
      console.error('   - Vérifiez les privilèges de l\'utilisateur');
    } else if (error.message.includes('ECONNREFUSED') || error.message.includes('connect timed out')) {
      console.error('🌐 Problème de connexion réseau:');
      console.error('   - Vérifiez que l\'IP', process.env.SERVER_IP || '77.205.88.170', 'est whitelistée');
      console.error('   - Allez dans MongoDB Atlas > Network Access');
      console.error('   - Ajoutez l\'IP ou utilisez 0.0.0.0/0 pour tous (tests uniquement)');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('🔗 Problème avec l\'URI:');
      console.error('   - Vérifiez l\'URI de connexion dans .env.production');
      console.error('   - Vérifiez le nom du cluster');
    }

    console.error('');
    console.error('📚 Documentation:');
    console.error('   - docs/MONGODB_SETUP_GUIDE.md');
    console.error('   - https://docs.atlas.mongodb.com/');
    console.error('');

    process.exit(1);
  }
}

// Exécuter le test
testMongoDBConnection().catch(err => {
  console.error('❌ Erreur inattendue:', err);
  process.exit(1);
});
