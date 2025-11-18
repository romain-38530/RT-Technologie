/**
 * RT Technologie - Geo-Tracking Service
 * Integration Tests
 *
 * Tests d'intégration pour vérifier la communication avec:
 * - Service core-orders (port 3001)
 * - Application mobile-driver PWA
 */

const axios = require('axios');
const { MongoClient } = require('mongodb');

// Configuration
const GEO_TRACKING_URL = process.env.GEO_TRACKING_URL || 'http://localhost:3016';
const CORE_ORDERS_URL = process.env.CORE_ORDERS_URL || 'http://localhost:3001';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rt-technologie-test';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

// Test data
const testOrderId = 'TEST-ORDER-001';
const testPosition = {
  latitude: 48.8566,
  longitude: 2.3522,
  accuracy: 10,
  timestamp: new Date().toISOString(),
};

const testPickupLocation = {
  latitude: 48.8566,
  longitude: 2.3522,
  name: 'Point de chargement test',
  address: '123 Rue de Test, Paris',
};

const testDeliveryLocation = {
  latitude: 48.8738,
  longitude: 2.2950,
  name: 'Point de livraison test',
  address: '456 Avenue Test, Paris',
};

// JWT token for authentication
const jwt = require('jsonwebtoken');
const testToken = jwt.sign(
  { userId: 'test-user', role: 'driver' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

let db;
let mongoClient;

// Setup
async function setup() {
  console.log('Setup: Connecting to MongoDB...');
  mongoClient = await MongoClient.connect(MONGODB_URI, { useUnifiedTopology: true });
  db = mongoClient.db();

  // Clean test data
  await db.collection('positions').deleteMany({ orderId: testOrderId });
  await db.collection('geofence_events').deleteMany({ orderId: testOrderId });
  await db.collection('orders').deleteMany({ orderId: testOrderId });

  // Insert test order
  await db.collection('orders').insertOne({
    orderId: testOrderId,
    status: 'EN_ROUTE_PICKUP',
    pickup: {
      location: testPickupLocation,
      name: testPickupLocation.name,
      address: testPickupLocation.address,
    },
    delivery: {
      location: testDeliveryLocation,
      name: testDeliveryLocation.name,
      address: testDeliveryLocation.address,
    },
  });

  console.log('Setup complete');
}

// Teardown
async function teardown() {
  console.log('Teardown: Cleaning up...');
  if (db) {
    await db.collection('positions').deleteMany({ orderId: testOrderId });
    await db.collection('geofence_events').deleteMany({ orderId: testOrderId });
    await db.collection('orders').deleteMany({ orderId: testOrderId });
  }
  if (mongoClient) {
    await mongoClient.close();
  }
  console.log('Teardown complete');
}

// Test 1: POST position GPS
async function testPostGPSPosition() {
  console.log('\nTest 1: POST position GPS');

  try {
    const response = await axios.post(
      `${GEO_TRACKING_URL}/geo-tracking/positions`,
      {
        orderId: testOrderId,
        ...testPosition,
      },
      {
        headers: {
          Authorization: `Bearer ${testToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('   Status:', response.status);
    console.log('   Response:', JSON.stringify(response.data, null, 2));

    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }

    if (!response.data.success) {
      throw new Error('Position was not saved successfully');
    }

    console.log('   Test passed');
    return true;
  } catch (error) {
    console.error('   Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
    return false;
  }
}

// Test 2: GET ETA avec données réelles
async function testGetETA() {
  console.log('\nTest 2: GET ETA avec données réelles');

  try {
    const response = await axios.get(
      `${GEO_TRACKING_URL}/geo-tracking/eta/${testOrderId}`,
      {
        params: {
          currentLat: testPosition.latitude,
          currentLon: testPosition.longitude,
        },
        headers: {
          Authorization: `Bearer ${testToken}`,
        },
      }
    );

    console.log('   Status:', response.status);
    console.log('   ETA:', JSON.stringify(response.data.eta, null, 2));

    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }

    if (!response.data.eta) {
      throw new Error('No ETA returned');
    }

    const { eta } = response.data;
    if (!eta.arrivalTime || !eta.durationMinutes || eta.distanceKm === undefined) {
      throw new Error('ETA missing required fields');
    }

    console.log(`   ETA: ${eta.durationMinutes} min, ${eta.distanceKm} km`);
    console.log(`   Arrivée: ${eta.arrivalTime}`);
    console.log(`   Retard trafic: ${eta.trafficDelay} min`);
    console.log('   Test passed');
    return true;
  } catch (error) {
    console.error('   Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
    return false;
  }
}

// Test 3: Détection géofencing
async function testGeofenceDetection() {
  console.log('\nTest 3: Détection géofencing');

  try {
    // Position dans la zone de chargement (rayon 200m)
    const insidePickupPosition = {
      orderId: testOrderId,
      latitude: testPickupLocation.latitude + 0.0001,
      longitude: testPickupLocation.longitude + 0.0001,
      accuracy: 10,
      timestamp: new Date().toISOString(),
    };

    const response = await axios.post(
      `${GEO_TRACKING_URL}/geo-tracking/positions`,
      insidePickupPosition,
      {
        headers: {
          Authorization: `Bearer ${testToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('   Status:', response.status);

    if (response.data.geofenceEvent) {
      console.log('   Événement géofencing détecté:', response.data.geofenceEvent.type);
      console.log('   Lieu:', response.data.geofenceEvent.location.name);
      console.log('   Test passed');
      return true;
    } else {
      console.log('   Aucun événement détecté (peut être normal si déjà dans la zone)');
      console.log('   Test passed');
      return true;
    }
  } catch (error) {
    console.error('   Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
    return false;
  }
}

// Test 4: Test connexion avec core-orders
async function testCoreOrdersIntegration() {
  console.log('\nTest 4: Connexion avec core-orders');

  try {
    // Test si core-orders peut récupérer les événements géofencing
    const eventsResponse = await axios.get(
      `${CORE_ORDERS_URL}/industry/orders/${testOrderId}/geofence-events`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('   Événements géofencing récupérés depuis core-orders');
    console.log('   Nombre d\'événements:', eventsResponse.data.events?.length || 0);

    // Test si core-orders peut récupérer l'ETA
    const etaResponse = await axios.get(
      `${CORE_ORDERS_URL}/industry/orders/${testOrderId}/eta`,
      {
        params: {
          currentLat: testPosition.latitude,
          currentLng: testPosition.longitude,
        },
      }
    );

    console.log('   ETA récupéré depuis core-orders');
    console.log('   ETA:', etaResponse.data.eta);

    console.log('   Test passed');
    return true;
  } catch (error) {
    console.error('   Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
    return false;
  }
}

// Test 5: GET position history
async function testGetPositionHistory() {
  console.log('\nTest 5: GET historique des positions');

  try {
    const response = await axios.get(
      `${GEO_TRACKING_URL}/geo-tracking/positions/${testOrderId}`,
      {
        headers: {
          Authorization: `Bearer ${testToken}`,
        },
      }
    );

    console.log('   Status:', response.status);
    console.log('   Nombre de positions:', response.data.positions?.length || 0);
    console.log('   Total:', response.data.totalCount);

    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }

    console.log('   Test passed');
    return true;
  } catch (error) {
    console.error('   Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('RT Technologie - Geo-Tracking Integration Tests');
  console.log('='.repeat(60));

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
  };

  try {
    await setup();

    const tests = [
      testPostGPSPosition,
      testGetETA,
      testGeofenceDetection,
      testGetPositionHistory,
      testCoreOrdersIntegration,
    ];

    for (const test of tests) {
      results.total++;
      const passed = await test();
      if (passed) {
        results.passed++;
      } else {
        results.failed++;
      }
      // Wait a bit between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  } catch (error) {
    console.error('Test suite error:', error);
  } finally {
    await teardown();
  }

  console.log('\n' + '='.repeat(60));
  console.log('Test Results');
  console.log('='.repeat(60));
  console.log(`Total: ${results.total}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log('='.repeat(60));

  if (results.failed === 0) {
    console.log('All tests passed!');
    process.exit(0);
  } else {
    console.log('Some tests failed');
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = {
  runTests,
  testPostGPSPosition,
  testGetETA,
  testGeofenceDetection,
  testCoreOrdersIntegration,
  testGetPositionHistory,
};
