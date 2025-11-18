#!/usr/bin/env node
// ============================================================================
// RT-Technologie - Database Migration Script
// ============================================================================
// Description: Créer collections MongoDB et indexes pour tous les services
// Author: RT-Technologie DevOps Team
// Version: 1.0.0
// Date: 2025-11-18
// ============================================================================

const { MongoClient } = require('mongodb');

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:admin123@localhost:27017/rt-technologie?authSource=admin';
const DB_NAME = 'rt-technologie';

// Collections et indexes par service
const COLLECTIONS_CONFIG = {
  // Core Orders Service
  'orders': {
    indexes: [
      { key: { orderId: 1 }, unique: true },
      { key: { customerId: 1 } },
      { key: { status: 1 } },
      { key: { createdAt: -1 } },
      { key: { pickupDate: 1 } },
      { key: { deliveryDate: 1 } },
    ],
  },
  'order-items': {
    indexes: [
      { key: { orderId: 1 } },
      { key: { productId: 1 } },
    ],
  },

  // Notifications Service
  'notifications': {
    indexes: [
      { key: { userId: 1 } },
      { key: { type: 1 } },
      { key: { status: 1 } },
      { key: { createdAt: -1 } },
      { key: { read: 1 } },
    ],
  },

  // TMS Sync Service
  'tms-sync-logs': {
    indexes: [
      { key: { syncId: 1 }, unique: true },
      { key: { status: 1 } },
      { key: { createdAt: -1 } },
    ],
  },

  // Planning Service
  'plannings': {
    indexes: [
      { key: { planningId: 1 }, unique: true },
      { key: { driverId: 1 } },
      { key: { vehicleId: 1 } },
      { key: { date: 1 } },
      { key: { status: 1 } },
    ],
  },
  'routes': {
    indexes: [
      { key: { routeId: 1 }, unique: true },
      { key: { planningId: 1 } },
      { key: { optimizationScore: -1 } },
    ],
  },

  // Affret IA Service
  'affret-requests': {
    indexes: [
      { key: { requestId: 1 }, unique: true },
      { key: { customerId: 1 } },
      { key: { status: 1 } },
      { key: { createdAt: -1 } },
    ],
  },
  'affret-predictions': {
    indexes: [
      { key: { requestId: 1 } },
      { key: { confidence: -1 } },
    ],
  },

  // Vigilance Service
  'vigilance-alerts': {
    indexes: [
      { key: { alertId: 1 }, unique: true },
      { key: { orderId: 1 } },
      { key: { severity: 1 } },
      { key: { status: 1 } },
      { key: { createdAt: -1 } },
    ],
  },

  // Authz Service
  'users': {
    indexes: [
      { key: { userId: 1 }, unique: true },
      { key: { email: 1 }, unique: true },
      { key: { role: 1 } },
    ],
  },
  'roles': {
    indexes: [
      { key: { roleId: 1 }, unique: true },
      { key: { name: 1 }, unique: true },
    ],
  },
  'permissions': {
    indexes: [
      { key: { permissionId: 1 }, unique: true },
      { key: { resource: 1, action: 1 }, unique: true },
    ],
  },

  // ECPMR Service
  'ecpmr-documents': {
    indexes: [
      { key: { ecpmrId: 1 }, unique: true },
      { key: { orderId: 1 } },
      { key: { status: 1 } },
      { key: { createdAt: -1 } },
    ],
  },

  // Palette Service
  'palettes': {
    indexes: [
      { key: { paletteId: 1 }, unique: true },
      { key: { customerId: 1 } },
      { key: { type: 1 } },
      { key: { status: 1 } },
    ],
  },

  // Training Service
  'training-courses': {
    indexes: [
      { key: { courseId: 1 }, unique: true },
      { key: { category: 1 } },
      { key: { status: 1 } },
    ],
  },
  'training-enrollments': {
    indexes: [
      { key: { userId: 1 } },
      { key: { courseId: 1 } },
      { key: { status: 1 } },
      { key: { createdAt: -1 } },
    ],
  },

  // Storage Market Service
  'storage-listings': {
    indexes: [
      { key: { listingId: 1 }, unique: true },
      { key: { providerId: 1 } },
      { key: { status: 1 } },
      { key: { location: '2dsphere' } }, // Geospatial index
      { key: { createdAt: -1 } },
    ],
  },
  'storage-bookings': {
    indexes: [
      { key: { bookingId: 1 }, unique: true },
      { key: { listingId: 1 } },
      { key: { customerId: 1 } },
      { key: { status: 1 } },
    ],
  },

  // Pricing Grids Service
  'pricing-grids': {
    indexes: [
      { key: { gridId: 1 }, unique: true },
      { key: { customerId: 1 } },
      { key: { effectiveDate: 1 } },
      { key: { status: 1 } },
    ],
  },

  // Tracking IA Service
  'tracking-events': {
    indexes: [
      { key: { eventId: 1 }, unique: true },
      { key: { orderId: 1 } },
      { key: { timestamp: -1 } },
      { key: { type: 1 } },
    ],
  },
  'tracking-predictions': {
    indexes: [
      { key: { orderId: 1 } },
      { key: { predictedEta: 1 } },
      { key: { confidence: -1 } },
    ],
  },

  // Bourse Service
  'transport-offers': {
    indexes: [
      { key: { offerId: 1 }, unique: true },
      { key: { providerId: 1 } },
      { key: { status: 1 } },
      { key: { pickupLocation: '2dsphere' } },
      { key: { deliveryLocation: '2dsphere' } },
      { key: { createdAt: -1 } },
    ],
  },
  'transport-bids': {
    indexes: [
      { key: { bidId: 1 }, unique: true },
      { key: { offerId: 1 } },
      { key: { transporterId: 1 } },
      { key: { status: 1 } },
    ],
  },

  // WMS Sync Service
  'wms-sync-logs': {
    indexes: [
      { key: { syncId: 1 }, unique: true },
      { key: { status: 1 } },
      { key: { createdAt: -1 } },
    ],
  },

  // ERP Sync Service
  'erp-sync-logs': {
    indexes: [
      { key: { syncId: 1 }, unique: true },
      { key: { status: 1 } },
      { key: { createdAt: -1 } },
    ],
  },

  // Chatbot Service
  'chatbot-conversations': {
    indexes: [
      { key: { conversationId: 1 }, unique: true },
      { key: { userId: 1 } },
      { key: { createdAt: -1 } },
    ],
  },
  'chatbot-messages': {
    indexes: [
      { key: { messageId: 1 }, unique: true },
      { key: { conversationId: 1 } },
      { key: { timestamp: -1 } },
    ],
  },

  // Geo Tracking Service
  'geo-locations': {
    indexes: [
      { key: { deviceId: 1 } },
      { key: { orderId: 1 } },
      { key: { location: '2dsphere' } }, // Geospatial index
      { key: { timestamp: -1 } },
    ],
  },
};

// Fonction principale
async function migrate() {
  console.log('🔄 RT-Technologie - Database Migration');
  console.log('=====================================\n');

  const client = new MongoClient(MONGODB_URI);

  try {
    // Connexion à MongoDB
    console.log('📡 Connexion à MongoDB...');
    await client.connect();
    console.log('✓ Connecté à MongoDB\n');

    const db = client.db(DB_NAME);

    // Créer les collections et indexes
    let collectionsCreated = 0;
    let indexesCreated = 0;

    for (const [collectionName, config] of Object.entries(COLLECTIONS_CONFIG)) {
      console.log(`📦 Collection: ${collectionName}`);

      // Créer la collection si elle n'existe pas
      const collections = await db.listCollections({ name: collectionName }).toArray();
      if (collections.length === 0) {
        await db.createCollection(collectionName);
        console.log(`  ✓ Collection créée`);
        collectionsCreated++;
      } else {
        console.log(`  - Collection déjà existante`);
      }

      // Créer les indexes
      const collection = db.collection(collectionName);
      for (const index of config.indexes) {
        try {
          const indexName = await collection.createIndex(index.key, {
            unique: index.unique || false,
            background: true,
          });
          console.log(`  ✓ Index créé: ${indexName}`);
          indexesCreated++;
        } catch (error) {
          if (error.code === 85 || error.code === 86) {
            // Index already exists
            console.log(`  - Index déjà existant: ${Object.keys(index.key).join('_')}`);
          } else {
            throw error;
          }
        }
      }
      console.log('');
    }

    // Résumé
    console.log('=====================================');
    console.log('✓ Migration terminée avec succès!');
    console.log(`  - Collections créées: ${collectionsCreated}`);
    console.log(`  - Indexes créés: ${indexesCreated}`);
    console.log('=====================================\n');

  } catch (error) {
    console.error('✗ Erreur lors de la migration:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Exécution
if (require.main === module) {
  migrate();
}

module.exports = { migrate };
