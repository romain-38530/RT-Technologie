/**
 * Tests de Vérification TVA
 *
 * Ce script teste la vérification de numéros de TVA réels
 * via les APIs VIES et INSEE
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3020';

// Couleurs pour console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Numéros de TVA de test
const testVATNumbers = [
  // France
  {
    vat: 'FR41948816988',
    country: 'France',
    expected: {
      companyName: 'RT TECHNOLOGIE',
      valid: true
    }
  },
  {
    vat: 'FR55542065479',
    country: 'France',
    expected: {
      companyName: 'GOOGLE FRANCE',
      valid: true
    }
  },
  {
    vat: 'FR76542107747',
    country: 'France',
    expected: {
      companyName: 'MICROSOFT FRANCE',
      valid: true
    }
  },
  // Belgique
  {
    vat: 'BE0477472701',
    country: 'Belgique',
    expected: {
      companyName: 'PROXIMUS',
      valid: true
    }
  },
  // Allemagne
  {
    vat: 'DE811334625',
    country: 'Allemagne',
    expected: {
      companyName: 'SIEMENS AG',
      valid: true
    }
  },
  // Pays-Bas
  {
    vat: 'NL820646660B01',
    country: 'Pays-Bas',
    expected: {
      companyName: 'PHILIPS',
      valid: true
    }
  },
  // Invalide
  {
    vat: 'FR00000000000',
    country: 'France',
    expected: {
      valid: false
    }
  }
];

/**
 * Teste la vérification d'un numéro de TVA
 */
async function testVATVerification(vatData) {
  try {
    log(`\n📋 Test: ${vatData.vat} (${vatData.country})`, 'cyan');

    const response = await axios.post(`${API_URL}/api/onboarding/verify-vat`, {
      vatNumber: vatData.vat
    });

    if (response.data.success) {
      log(`  ✅ Valide`, 'green');
      log(`  Entreprise: ${response.data.data.companyName}`, 'reset');
      log(`  Adresse: ${response.data.data.companyAddress}`, 'reset');

      if (response.data.data.siret) {
        log(`  SIRET: ${response.data.data.siret}`, 'reset');
      }

      log(`  Source: ${response.data.data.source}`, 'reset');

      // Vérifier si correspond aux attentes
      if (vatData.expected.valid && vatData.expected.companyName) {
        const nameMatches = response.data.data.companyName
          .toLowerCase()
          .includes(vatData.expected.companyName.toLowerCase().split(' ')[0]);

        if (nameMatches) {
          log(`  ✅ Nom entreprise correspond`, 'green');
        } else {
          log(`  ⚠️  Nom attendu: ${vatData.expected.companyName}`, 'yellow');
          log(`  ⚠️  Nom reçu: ${response.data.data.companyName}`, 'yellow');
        }
      }

      return { success: true, data: response.data.data };
    } else {
      log(`  ❌ Invalide`, 'red');
      return { success: false };
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      log(`  ❌ Numéro de TVA invalide (404)`, 'red');

      if (!vatData.expected.valid) {
        log(`  ✅ Comportement attendu (numéro invalide)`, 'green');
        return { success: true };
      }
      return { success: false };
    }

    log(`  ❌ Erreur: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

/**
 * Lance tous les tests
 */
async function runAllTests() {
  log('='.repeat(80), 'blue');
  log('🧪 Tests de Vérification TVA - RT Technologie', 'blue');
  log('='.repeat(80), 'blue');
  log(`\nAPI URL: ${API_URL}\n`, 'cyan');

  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };

  for (const vatData of testVATNumbers) {
    results.total++;
    const result = await testVATVerification(vatData);

    if (result.success) {
      results.passed++;
    } else {
      results.failed++;
    }

    // Pause entre les appels pour ne pas surcharger l'API
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Résumé
  log('\n' + '='.repeat(80), 'blue');
  log('📊 Résumé des Tests', 'blue');
  log('='.repeat(80), 'blue');
  log(`\nTotal: ${results.total}`, 'reset');
  log(`Réussis: ${results.passed}`, 'green');
  log(`Échoués: ${results.failed}`, results.failed > 0 ? 'red' : 'reset');
  log(`\nTaux de réussite: ${((results.passed / results.total) * 100).toFixed(1)}%\n`,
    results.failed === 0 ? 'green' : 'yellow');

  if (results.failed === 0) {
    log('✅ Tous les tests sont passés avec succès !', 'green');
  } else {
    log('⚠️  Certains tests ont échoué', 'yellow');
  }

  process.exit(results.failed === 0 ? 0 : 1);
}

// Vérifier si le service est accessible
async function checkService() {
  try {
    const response = await axios.get(`${API_URL}/health`);
    if (response.data.status === 'ok') {
      log('✅ Service client-onboarding accessible\n', 'green');
      return true;
    }
  } catch (error) {
    log('❌ Service client-onboarding non accessible', 'red');
    log(`   Assurez-vous que le service tourne sur ${API_URL}`, 'yellow');
    log('   Lancez: npm run dev\n', 'yellow');
    return false;
  }
}

// Point d'entrée
(async () => {
  const serviceOk = await checkService();
  if (!serviceOk) {
    process.exit(1);
  }

  await runAllTests();
})();
