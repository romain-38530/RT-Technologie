/**
 * Test de Génération de Contrat PDF
 *
 * Ce script teste la génération du contrat PDF avec des données de test
 * et sauvegarde le résultat pour validation manuelle
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = process.env.API_URL || 'http://localhost:3020';

// Couleurs console
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

// Données de test complètes
const testData = {
  companyData: {
    companyName: 'RT TECHNOLOGIE',
    legalForm: 'SAS',
    capital: '10 000€',
    companyAddress: '1088 avenue de Champollion, 38530 Pontcharra',
    siret: '94881698800012',
    siren: '948816988',
    vatNumber: 'FR41948816988',
    registrationCity: 'Grenoble',
    email: 'contact@rt-technologie.com'
  },
  subscriptionType: 'industriel',
  duration: '36',
  options: {
    afretIA: true,
    sms: false,
    telematics: true,
    thirdPartyConnection: false
  },
  representative: 'Romain Tardy - CEO',
  paymentMethod: 'card'
};

// Scénarios de test
const testScenarios = [
  {
    name: 'Industriel - 3 ans - Avec Affret IA Premium',
    data: testData
  },
  {
    name: 'Transporteur Premium - 1 an',
    data: {
      ...testData,
      companyData: {
        ...testData.companyData,
        companyName: 'TRANSPORT DUPONT',
        siret: '12345678901234',
        siren: '123456789',
        vatNumber: 'FR12123456789'
      },
      subscriptionType: 'transporteur_premium',
      duration: '12',
      options: {
        afretIA: false,
        sms: true,
        telematics: false,
        thirdPartyConnection: false
      },
      representative: 'Jean Dupont - Gérant'
    }
  },
  {
    name: 'Logisticien Premium - 5 ans',
    data: {
      ...testData,
      companyData: {
        ...testData.companyData,
        companyName: 'LOGISTIQUE MARTIN',
        siret: '98765432109876',
        siren: '987654321',
        vatNumber: 'FR98987654321'
      },
      subscriptionType: 'logisticien_premium',
      duration: '60',
      options: {
        afretIA: false,
        sms: true,
        telematics: false,
        thirdPartyConnection: true
      },
      representative: 'Marie Martin - Directrice'
    }
  }
];

/**
 * Teste la génération d'un contrat
 */
async function testContractGeneration(scenario) {
  try {
    log(`\n📄 Test: ${scenario.name}`, 'cyan');
    log('  Génération du contrat...', 'reset');

    const response = await axios.post(
      `${API_URL}/api/onboarding/create-contract`,
      scenario.data,
      { responseType: 'arraybuffer' }
    );

    if (response.status === 200) {
      // Créer le dossier de sortie s'il n'existe pas
      const outputDir = path.join(__dirname, 'output');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Sauvegarder le PDF
      const filename = `contrat_${scenario.name.replace(/\s+/g, '_').toLowerCase()}.pdf`;
      const filepath = path.join(outputDir, filename);

      fs.writeFileSync(filepath, response.data);

      log(`  ✅ Contrat généré avec succès`, 'green');
      log(`  📁 Fichier: ${filepath}`, 'green');
      log(`  📏 Taille: ${(response.data.length / 1024).toFixed(2)} KB`, 'reset');

      return { success: true, filepath };
    }
  } catch (error) {
    log(`  ❌ Erreur: ${error.message}`, 'red');
    if (error.response) {
      log(`  Status: ${error.response.status}`, 'red');
    }
    return { success: false, error: error.message };
  }
}

/**
 * Vérifie les éléments du contrat
 */
function checkContractContent(scenario) {
  log(`\n🔍 Vérification du contenu...`, 'cyan');

  const checks = [
    { name: 'Raison sociale', value: scenario.data.companyData.companyName },
    { name: 'Forme juridique', value: scenario.data.companyData.legalForm },
    { name: 'Capital', value: scenario.data.companyData.capital },
    { name: 'SIRET', value: scenario.data.companyData.siret },
    { name: 'TVA', value: scenario.data.companyData.vatNumber },
    { name: 'Type abonnement', value: scenario.data.subscriptionType },
    { name: 'Durée', value: `${scenario.data.duration} mois` },
    { name: 'Représentant', value: scenario.data.representative }
  ];

  log('  Éléments à vérifier dans le PDF:', 'yellow');
  checks.forEach(check => {
    log(`    - ${check.name}: ${check.value}`, 'reset');
  });

  return checks;
}

/**
 * Lance tous les tests
 */
async function runAllTests() {
  log('='.repeat(80), 'blue');
  log('📄 Tests de Génération de Contrat PDF - RT Technologie', 'blue');
  log('='.repeat(80), 'blue');
  log(`\nAPI URL: ${API_URL}\n`, 'cyan');

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    files: []
  };

  for (const scenario of testScenarios) {
    results.total++;

    const result = await testContractGeneration(scenario);

    if (result.success) {
      results.passed++;
      results.files.push(result.filepath);

      // Vérifier le contenu attendu
      checkContractContent(scenario);
    } else {
      results.failed++;
    }

    // Pause entre les générations
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Résumé
  log('\n' + '='.repeat(80), 'blue');
  log('📊 Résumé des Tests', 'blue');
  log('='.repeat(80), 'blue');
  log(`\nTotal: ${results.total}`, 'reset');
  log(`Réussis: ${results.passed}`, 'green');
  log(`Échoués: ${results.failed}`, results.failed > 0 ? 'red' : 'reset');

  if (results.files.length > 0) {
    log('\n📁 Fichiers générés:', 'cyan');
    results.files.forEach(file => {
      log(`  - ${file}`, 'green');
    });

    log('\n📋 Checklist de Validation Manuelle:', 'yellow');
    log('  [ ] Ouvrir chaque PDF et vérifier:', 'yellow');
    log('      [ ] En-tête "CONTRAT D\'ABONNEMENT" présent', 'yellow');
    log('      [ ] Données RT Technologie correctes', 'yellow');
    log('      [ ] Données client pré-remplies correctement', 'yellow');
    log('      [ ] 19 articles présents', 'yellow');
    log('      [ ] Type d\'abonnement et tarif corrects', 'yellow');
    log('      [ ] Options sélectionnées mentionnées', 'yellow');
    log('      [ ] Section signatures en dernière page', 'yellow');
    log('      [ ] Mise en page professionnelle', 'yellow');
    log('      [ ] Aucune donnée manquante ([...])', 'yellow');
  }

  if (results.failed === 0) {
    log('\n✅ Tous les contrats ont été générés avec succès !', 'green');
    log('⚠️  Validation manuelle requise - Ouvrez les PDFs', 'yellow');
  } else {
    log('\n⚠️  Certains tests ont échoué', 'yellow');
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
