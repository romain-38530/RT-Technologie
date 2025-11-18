/**
 * Integration tests for Storage Market Service
 * Tests the full flow from frontend to backend
 *
 * Run with: node services/storage-market/tests/integration-frontend.test.js
 */

const http = require('http');

const BASE_URL = process.env.STORAGE_MARKET_URL || 'http://localhost:3013';

// Helper function to make HTTP requests
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

// Test suite
async function runTests() {
  console.log('==========================================');
  console.log('Storage Market Integration Tests');
  console.log('==========================================\n');

  let testsPassed = 0;
  let testsFailed = 0;

  // Test 1: Health check
  console.log('Test 1: Health check');
  try {
    const response = await makeRequest('GET', '/health');
    if (response.status === 200 && response.data.status === 'ok') {
      console.log('✅ PASS - Service is healthy\n');
      testsPassed++;
    } else {
      console.log('❌ FAIL - Health check failed\n');
      testsFailed++;
    }
  } catch (error) {
    console.log(`❌ FAIL - ${error.message}\n`);
    testsFailed++;
  }

  // Test 2: Create storage need (web-industry)
  console.log('Test 2: Create storage need (web-industry)');
  let needId;
  try {
    const needData = {
      ownerOrgId: 'IND-TEST',
      storageType: 'long_term',
      volume: { type: 'palettes', quantity: 200 },
      duration: {
        startDate: '2025-02-01',
        endDate: '2025-08-31',
        flexible: true,
      },
      location: {
        region: 'Île-de-France',
        department: '77',
        maxRadius: 50,
        lat: 48.8566,
        lon: 2.3522,
      },
      constraints: {
        temperature: 'ambient',
        adrAuthorized: false,
        securityLevel: 'standard',
        certifications: ['ISO 9001'],
      },
      budget: { indicative: 5000, currency: 'EUR', period: 'monthly' },
      publicationType: 'GLOBAL',
      deadline: '2025-01-25T23:59:59Z',
    };

    const response = await makeRequest('POST', '/storage-market/needs/create', needData);
    if (response.status === 201 && response.data.need) {
      needId = response.data.need.id;
      console.log(`✅ PASS - Need created: ${needId}\n`);
      testsPassed++;
    } else {
      console.log('❌ FAIL - Failed to create need\n');
      testsFailed++;
    }
  } catch (error) {
    console.log(`❌ FAIL - ${error.message}\n`);
    testsFailed++;
  }

  // Test 3: Get available needs (web-logistician)
  console.log('Test 3: Get available needs (web-logistician)');
  try {
    const response = await makeRequest('GET', '/storage-market/needs?status=PUBLISHED');
    if (response.status === 200 && Array.isArray(response.data.items)) {
      console.log(`✅ PASS - Retrieved ${response.data.items.length} needs\n`);
      testsPassed++;
    } else {
      console.log('❌ FAIL - Failed to get needs\n');
      testsFailed++;
    }
  } catch (error) {
    console.log(`❌ FAIL - ${error.message}\n`);
    testsFailed++;
  }

  // Test 4: Submit offer (web-logistician)
  console.log('Test 4: Submit offer (web-logistician)');
  let offerId;
  if (needId) {
    try {
      const offerData = {
        needId,
        logisticianId: 'LOG-TEST',
        logisticianName: 'Test Logistique',
        siteId: 'SITE-001',
        siteName: 'Entrepôt Test',
        siteLocation: {
          address: '123 Rue Test',
          city: 'Paris',
          lat: 48.8566,
          lon: 2.3522,
        },
        pricing: {
          monthlyRate: 11,
          setupFee: 400,
          totalPrice: 7700,
          currency: 'EUR',
        },
        capacity: {
          available: 200,
          total: 500,
          unit: 'palettes',
        },
        services: ['Manutention', 'Gestion WMS'],
        certifications: ['ISO 9001', 'ISO 14001'],
        wmsIntegration: true,
        reliabilityScore: 95,
        responseTimeHours: 1.5,
        message: 'Offre test pour intégration',
      };

      const response = await makeRequest('POST', '/storage-market/offers/send', offerData);
      if (response.status === 201 && response.data.offer) {
        offerId = response.data.offer.id;
        console.log(`✅ PASS - Offer submitted: ${offerId}\n`);
        testsPassed++;
      } else {
        console.log('❌ FAIL - Failed to submit offer\n');
        testsFailed++;
      }
    } catch (error) {
      console.log(`❌ FAIL - ${error.message}\n`);
      testsFailed++;
    }
  } else {
    console.log('⏭️  SKIP - No need ID available\n');
  }

  // Test 5: Get AI-ranked offers (web-industry)
  console.log('Test 5: Get AI-ranked offers (web-industry)');
  if (needId) {
    try {
      const response = await makeRequest('POST', '/storage-market/offers/ranking', { needId });
      if (
        response.status === 200 &&
        Array.isArray(response.data.items) &&
        response.data.items[0]?.aiScore !== undefined
      ) {
        console.log(`✅ PASS - Got ranked offers with AI scores\n`);
        console.log(`   Top offer: Score ${response.data.items[0].aiScore}, Rank ${response.data.items[0].aiRank}\n`);
        testsPassed++;
      } else {
        console.log('❌ FAIL - Failed to get ranked offers\n');
        testsFailed++;
      }
    } catch (error) {
      console.log(`❌ FAIL - ${error.message}\n`);
      testsFailed++;
    }
  } else {
    console.log('⏭️  SKIP - No need ID available\n');
  }

  // Test 6: Create contract (web-industry)
  console.log('Test 6: Create contract (web-industry)');
  let contractId;
  if (needId && offerId) {
    try {
      const contractData = {
        needId,
        offerId,
        industrialId: 'IND-TEST',
        logisticianId: 'LOG-TEST',
        startDate: '2025-02-01',
        endDate: '2025-08-31',
      };

      const response = await makeRequest('POST', '/storage-market/contracts/create', contractData);
      if (response.status === 201 && response.data.contract) {
        contractId = response.data.contract.id;
        console.log(`✅ PASS - Contract created: ${contractId}\n`);
        testsPassed++;
      } else {
        console.log('❌ FAIL - Failed to create contract\n');
        testsFailed++;
      }
    } catch (error) {
      console.log(`❌ FAIL - ${error.message}\n`);
      testsFailed++;
    }
  } else {
    console.log('⏭️  SKIP - No need/offer ID available\n');
  }

  // Test 7: Get admin stats (backoffice-admin)
  console.log('Test 7: Get admin stats (backoffice-admin)');
  try {
    const response = await makeRequest('GET', '/storage-market/admin/stats');
    if (
      response.status === 200 &&
      response.data.stats &&
      typeof response.data.stats.totalNeeds === 'number'
    ) {
      console.log(`✅ PASS - Admin stats retrieved\n`);
      console.log(`   Total needs: ${response.data.stats.totalNeeds}`);
      console.log(`   Total offers: ${response.data.stats.totalOffers}`);
      console.log(`   Total contracts: ${response.data.stats.totalContracts}\n`);
      testsPassed++;
    } else {
      console.log('❌ FAIL - Failed to get admin stats\n');
      testsFailed++;
    }
  } catch (error) {
    console.log(`❌ FAIL - ${error.message}\n`);
    testsFailed++;
  }

  // Test 8: Get WMS inventory (web-industry with contract)
  console.log('Test 8: Get WMS inventory (web-industry)');
  if (contractId) {
    try {
      const response = await makeRequest('GET', `/storage-market/wms/inventory/${contractId}`);
      if (response.status === 200 && response.data.inventory) {
        console.log(`✅ PASS - WMS inventory retrieved\n`);
        console.log(`   Total pallets: ${response.data.inventory.totalPallets}\n`);
        testsPassed++;
      } else {
        console.log('❌ FAIL - Failed to get WMS inventory\n');
        testsFailed++;
      }
    } catch (error) {
      console.log(`❌ FAIL - ${error.message}\n`);
      testsFailed++;
    }
  } else {
    console.log('⏭️  SKIP - No contract ID available\n');
  }

  // Summary
  console.log('==========================================');
  console.log('Test Summary');
  console.log('==========================================');
  console.log(`✅ Passed: ${testsPassed}`);
  console.log(`❌ Failed: ${testsFailed}`);
  console.log(`Total: ${testsPassed + testsFailed}\n`);

  if (testsFailed > 0) {
    console.log('❌ Some tests failed. Please check the service.');
    process.exit(1);
  } else {
    console.log('✅ All tests passed!');
    process.exit(0);
  }
}

// Run tests
console.log('Starting integration tests...\n');
console.log(`Target URL: ${BASE_URL}\n`);

// Wait a bit to ensure service is ready
setTimeout(() => {
  runTests().catch((error) => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}, 1000);
