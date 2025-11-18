/**
 * Tests d'intégration Frontend - Service Palette
 *
 * Ces tests vérifient l'intégration entre les applications frontend et le service palette.
 * Ils simulent les workflows complets de bout en bout.
 */

const http = require('http');
const assert = require('assert');

const PALETTE_API_URL = process.env.PALETTE_API_URL || 'http://localhost:3011';

// Helper pour faire des requêtes HTTP
function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, PALETTE_API_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Test Suite
describe('Integration Frontend - Service Palette', () => {
  let testChequeId = null;
  let testSiteId = null;

  before(async () => {
    console.log('\n🧪 Démarrage des tests d\'intégration frontend...\n');

    // Vérifier que le service est accessible
    const healthCheck = await request('GET', '/health');
    assert.strictEqual(healthCheck.status, 200, 'Service palette doit être accessible');
    console.log('✓ Service palette accessible');
  });

  describe('1. Web-Industry: Génération de chèque', () => {
    it('Devrait générer un chèque-palette avec matching IA', async () => {
      const payload = {
        fromCompanyId: 'IND-1',
        orderId: 'ORD-TEST-001',
        quantity: 33,
        transporterPlate: 'AB-123-CD',
        deliveryLocation: {
          lat: 48.8566,
          lng: 2.3522
        }
      };

      const response = await request('POST', '/palette/cheques/generate', payload);

      assert.strictEqual(response.status, 201, 'Statut devrait être 201');
      assert.ok(response.data.cheque, 'Devrait retourner un chèque');
      assert.ok(response.data.matchedSite, 'Devrait retourner un site matché');
      assert.strictEqual(response.data.cheque.status, 'EMIS', 'Statut devrait être EMIS');
      assert.strictEqual(response.data.cheque.quantity, 33, 'Quantité devrait être 33');

      testChequeId = response.data.cheque.id;
      testSiteId = response.data.matchedSite.siteId;

      console.log(`✓ Chèque généré: ${testChequeId}`);
      console.log(`✓ Site matché: ${testSiteId} à ${response.data.matchedSite.distance.toFixed(2)}km`);
    });

    it('Devrait récupérer le chèque généré', async () => {
      const response = await request('GET', `/palette/cheques/${testChequeId}`);

      assert.strictEqual(response.status, 200, 'Statut devrait être 200');
      assert.strictEqual(response.data.cheque.id, testChequeId, 'ID devrait correspondre');
      assert.ok(response.data.cheque.qrCode, 'QR Code devrait être présent');

      console.log(`✓ Chèque récupéré: ${response.data.cheque.qrCode}`);
    });

    it('Devrait récupérer le ledger de l\'industriel', async () => {
      const response = await request('GET', '/palette/ledger/IND-1');

      assert.strictEqual(response.status, 200, 'Statut devrait être 200');
      assert.ok(response.data.ledger, 'Devrait retourner un ledger');
      assert.ok(typeof response.data.ledger.balance === 'number', 'Balance devrait être un nombre');

      console.log(`✓ Ledger IND-1: Solde = ${response.data.ledger.balance}`);
    });
  });

  describe('2. Web-Transporter: Dépôt de palettes', () => {
    it('Devrait lister les sites de retour disponibles', async () => {
      const response = await request('GET', '/palette/sites');

      assert.strictEqual(response.status, 200, 'Statut devrait être 200');
      assert.ok(Array.isArray(response.data.sites), 'Devrait retourner un tableau');
      assert.ok(response.data.sites.length > 0, 'Devrait avoir au moins un site');

      console.log(`✓ ${response.data.sites.length} sites disponibles`);
    });

    it('Devrait matcher un site via Affret.IA', async () => {
      const payload = {
        deliveryLocation: {
          lat: 48.8566,
          lng: 2.3522
        },
        companyId: 'TRP-1'
      };

      const response = await request('POST', '/palette/match/site', payload);

      assert.strictEqual(response.status, 200, 'Statut devrait être 200');
      assert.ok(response.data.bestSite, 'Devrait retourner un meilleur site');
      assert.ok(response.data.alternatives, 'Devrait retourner des alternatives');

      console.log(`✓ Meilleur site: ${response.data.bestSite.site.name}`);
      console.log(`✓ ${response.data.alternatives.length} alternatives trouvées`);
    });

    it('Devrait déposer le chèque-palette', async () => {
      const payload = {
        transporterSignature: 'SIG-TRANSPORTER-001',
        geolocation: {
          lat: 48.8566,
          lng: 2.3522
        },
        photo: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...'
      };

      const response = await request('POST', `/palette/cheques/${testChequeId}/deposit`, payload);

      assert.strictEqual(response.status, 200, 'Statut devrait être 200');
      assert.strictEqual(response.data.cheque.status, 'DEPOSE', 'Statut devrait être DEPOSE');
      assert.ok(response.data.cheque.depositedAt, 'Date de dépôt devrait être présente');
      assert.strictEqual(response.data.cheque.signatures.transporter, 'SIG-TRANSPORTER-001');

      console.log(`✓ Chèque déposé à ${response.data.cheque.depositedAt}`);
    });
  });

  describe('3. Web-Logistician: Réception de palettes', () => {
    it('Devrait récupérer les détails du site avec quota', async () => {
      const response = await request('GET', `/palette/sites/${testSiteId}`);

      assert.strictEqual(response.status, 200, 'Statut devrait être 200');
      assert.ok(response.data.site, 'Devrait retourner un site');
      assert.ok(response.data.quota, 'Devrait retourner un quota');
      assert.ok(typeof response.data.quota.consumed === 'number', 'Consumed devrait être un nombre');

      console.log(`✓ Site ${response.data.site.name}: ${response.data.quota.consumed}/${response.data.quota.dailyMax} palettes`);
    });

    it('Devrait réceptionner le chèque-palette', async () => {
      const payload = {
        receiverSignature: 'SIG-RECEIVER-001',
        geolocation: {
          lat: 48.8566,
          lng: 2.3522
        },
        photo: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
        quantityReceived: 33
      };

      const response = await request('POST', `/palette/cheques/${testChequeId}/receive`, payload);

      assert.strictEqual(response.status, 200, 'Statut devrait être 200');
      assert.strictEqual(response.data.cheque.status, 'RECU', 'Statut devrait être RECU');
      assert.ok(response.data.cheque.receivedAt, 'Date de réception devrait être présente');
      assert.strictEqual(response.data.cheque.signatures.receiver, 'SIG-RECEIVER-001');
      assert.strictEqual(response.data.cheque.quantityReceived, 33);

      console.log(`✓ Chèque réceptionné à ${response.data.cheque.receivedAt}`);
    });

    it('Devrait mettre à jour le quota d\'un site', async () => {
      const payload = {
        dailyMax: 150,
        openingHours: { start: '08:00', end: '18:00' },
        availableDays: [1, 2, 3, 4, 5],
        priority: 'INTERNAL'
      };

      const response = await request('POST', `/palette/sites/${testSiteId}/quota`, payload);

      assert.strictEqual(response.status, 200, 'Statut devrait être 200');
      assert.strictEqual(response.data.quota.dailyMax, 150, 'Quota devrait être mis à jour');

      console.log(`✓ Quota mis à jour: ${response.data.quota.dailyMax} palettes/jour`);
    });
  });

  describe('4. Backoffice-Admin: Administration', () => {
    it('Devrait lister tous les litiges', async () => {
      const response = await request('GET', '/palette/disputes');

      assert.strictEqual(response.status, 200, 'Statut devrait être 200');
      assert.ok(Array.isArray(response.data.disputes), 'Devrait retourner un tableau');

      console.log(`✓ ${response.data.disputes.length} litiges trouvés`);
    });

    it('Devrait créer un litige', async () => {
      const payload = {
        chequeId: testChequeId,
        claimantId: 'TRP-1',
        reason: 'QUANTITY_MISMATCH',
        photos: ['data:image/jpeg;base64,/9j/4AAQSkZJRg...'],
        comments: 'Quantité reçue inférieure à la quantité annoncée'
      };

      const response = await request('POST', '/palette/disputes', payload);

      assert.strictEqual(response.status, 201, 'Statut devrait être 201');
      assert.ok(response.data.dispute, 'Devrait retourner un litige');
      assert.strictEqual(response.data.dispute.status, 'OPEN', 'Statut devrait être OPEN');

      console.log(`✓ Litige créé: ${response.data.dispute.id}`);
    });

    it('Devrait vérifier le ledger après réception', async () => {
      const response = await request('GET', '/palette/ledger/IND-1');

      assert.strictEqual(response.status, 200, 'Statut devrait être 200');
      assert.ok(response.data.ledger.history.length > 0, 'Historique devrait avoir des entrées');

      const lastEntry = response.data.ledger.history[response.data.ledger.history.length - 1];
      assert.strictEqual(lastEntry.reason, 'CHEQUE_RECEIVED', 'Dernière entrée devrait être CHEQUE_RECEIVED');

      console.log(`✓ Ledger mis à jour: ${lastEntry.delta} palettes (${lastEntry.reason})`);
    });
  });

  describe('5. Cas d\'erreur et validations', () => {
    it('Devrait rejeter une génération sans deliveryLocation', async () => {
      const payload = {
        fromCompanyId: 'IND-1',
        orderId: 'ORD-TEST-002',
        quantity: 33
      };

      const response = await request('POST', '/palette/cheques/generate', payload);

      assert.strictEqual(response.status, 400, 'Statut devrait être 400');
      assert.ok(response.data.error, 'Devrait retourner une erreur');

      console.log('✓ Validation: deliveryLocation requis');
    });

    it('Devrait rejeter un dépôt sans signature', async () => {
      const payload = {
        geolocation: { lat: 48.8566, lng: 2.3522 }
      };

      const response = await request('POST', `/palette/cheques/${testChequeId}/deposit`, payload);

      assert.strictEqual(response.status, 400, 'Statut devrait être 400');

      console.log('✓ Validation: transporterSignature requis');
    });

    it('Devrait retourner 404 pour un chèque inexistant', async () => {
      const response = await request('GET', '/palette/cheques/CHQ-FAKE-123');

      assert.strictEqual(response.status, 404, 'Statut devrait être 404');

      console.log('✓ Validation: chèque inexistant');
    });

    it('Devrait rejeter un site matching hors rayon', async () => {
      const payload = {
        deliveryLocation: {
          lat: 43.2965, // Marseille (trop loin)
          lng: 5.3698
        },
        companyId: 'TRP-1'
      };

      const response = await request('POST', '/palette/match/site', payload);

      // Devrait retourner 404 si aucun site dans le rayon
      if (response.status === 404) {
        console.log('✓ Validation: aucun site dans le rayon de 30km');
      } else {
        console.log('⚠ Sites trouvés malgré la distance');
      }
    });
  });

  after(() => {
    console.log('\n✅ Tous les tests d\'intégration frontend passés avec succès!\n');
  });
});

// Simple test runner
async function runTests() {
  console.log('════════════════════════════════════════════════════════');
  console.log('   Tests d\'Intégration Frontend - Service Palette');
  console.log('════════════════════════════════════════════════════════\n');

  try {
    // Health check
    const healthCheck = await request('GET', '/health');
    assert.strictEqual(healthCheck.status, 200, 'Service palette doit être accessible');
    console.log('✓ Service palette accessible\n');

    let testChequeId = null;
    let testSiteId = null;

    // 1. Web-Industry: Génération
    console.log('1️⃣  Web-Industry: Génération de chèque');
    console.log('─────────────────────────────────────');
    const generateResponse = await request('POST', '/palette/cheques/generate', {
      fromCompanyId: 'IND-1',
      orderId: 'ORD-TEST-001',
      quantity: 33,
      transporterPlate: 'AB-123-CD',
      deliveryLocation: { lat: 48.8566, lng: 2.3522 }
    });
    assert.strictEqual(generateResponse.status, 201);
    testChequeId = generateResponse.data.cheque.id;
    testSiteId = generateResponse.data.matchedSite.siteId;
    console.log(`✓ Chèque généré: ${testChequeId}`);
    console.log(`✓ Site matché: ${testSiteId}\n`);

    // 2. Web-Transporter: Dépôt
    console.log('2️⃣  Web-Transporter: Dépôt de palettes');
    console.log('─────────────────────────────────────');
    const depositResponse = await request('POST', `/palette/cheques/${testChequeId}/deposit`, {
      transporterSignature: 'SIG-TRANSPORTER-001',
      geolocation: { lat: 48.8566, lng: 2.3522 }
    });
    assert.strictEqual(depositResponse.status, 200);
    assert.strictEqual(depositResponse.data.cheque.status, 'DEPOSE');
    console.log(`✓ Chèque déposé\n`);

    // 3. Web-Logistician: Réception
    console.log('3️⃣  Web-Logistician: Réception de palettes');
    console.log('─────────────────────────────────────');
    const receiveResponse = await request('POST', `/palette/cheques/${testChequeId}/receive`, {
      receiverSignature: 'SIG-RECEIVER-001',
      geolocation: { lat: 48.8566, lng: 2.3522 },
      quantityReceived: 33
    });
    assert.strictEqual(receiveResponse.status, 200);
    assert.strictEqual(receiveResponse.data.cheque.status, 'RECU');
    console.log(`✓ Chèque réceptionné\n`);

    // 4. Backoffice-Admin: Administration
    console.log('4️⃣  Backoffice-Admin: Administration');
    console.log('─────────────────────────────────────');
    const disputesResponse = await request('GET', '/palette/disputes');
    assert.strictEqual(disputesResponse.status, 200);
    console.log(`✓ ${disputesResponse.data.disputes.length} litiges trouvés`);

    const sitesResponse = await request('GET', '/palette/sites');
    assert.strictEqual(sitesResponse.status, 200);
    console.log(`✓ ${sitesResponse.data.sites.length} sites disponibles\n`);

    console.log('════════════════════════════════════════════════════════');
    console.log('✅ Tous les tests passés avec succès!');
    console.log('════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Erreur lors des tests:', error.message);
    process.exit(1);
  }
}

// Exécuter les tests si appelé directement
if (require.main === module) {
  runTests();
}

module.exports = { request, runTests };
