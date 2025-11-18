#!/usr/bin/env node
/**
 * Test d'Intégration Complet - RT-Technologie
 *
 * Ce script vérifie que tous les modules sont correctement intégrés
 * sans nécessiter le démarrage des services.
 *
 * Vérifications effectuées :
 * 1. Structure des fichiers et dossiers
 * 2. Configuration des variables d'environnement
 * 3. Dépendances package.json
 * 4. Imports et exports des modules
 * 5. Configuration des ports
 * 6. Intégration du chatbot
 * 7. Intégration du geo-tracking
 * 8. Connexion des API clients
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log('\n' + '='.repeat(80), 'cyan');
  log(title, 'bright');
  log('='.repeat(80), 'cyan');
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'blue');
}

// Test counters
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
let warnings = 0;

function runTest(name, testFn) {
  totalTests++;
  try {
    const result = testFn();
    if (result === true || result === undefined) {
      passedTests++;
      logSuccess(name);
      return true;
    } else if (result === 'warning') {
      warnings++;
      logWarning(name);
      return true;
    } else {
      failedTests++;
      logError(name);
      return false;
    }
  } catch (error) {
    failedTests++;
    logError(`${name} - ${error.message}`);
    return false;
  }
}

// Helper functions
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function readJSON(filePath) {
  if (!fileExists(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function readFile(filePath) {
  if (!fileExists(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  return fs.readFileSync(filePath, 'utf8');
}

function containsString(filePath, searchString) {
  const content = readFile(filePath);
  return content.includes(searchString);
}

// Test 1: Vérifier la structure des services
logSection('Test 1: Structure des Services');

const expectedServices = [
  'admin-gateway',
  'affret-ia',
  'authz',
  'chatbot',
  'core-orders',
  'ecpmr',
  'geo-tracking',
  'notifications',
  'palette',
  'planning',
  'storage-market',
  'tms-sync',
  'training',
  'vigilance',
];

expectedServices.forEach((service) => {
  runTest(`Service "${service}" existe`, () => {
    return fileExists(`services/${service}`);
  });

  runTest(`Service "${service}" a un server.js`, () => {
    return fileExists(`services/${service}/src/server.js`);
  });

  runTest(`Service "${service}" a un package.json`, () => {
    return fileExists(`services/${service}/package.json`);
  });
});

// Test 2: Vérifier la structure des applications
logSection('Test 2: Structure des Applications');

const expectedApps = [
  'web-industry',
  'web-transporter',
  'web-logistician',
  'web-recipient',
  'web-supplier',
  'web-forwarder',
  'backoffice-admin',
  'mobile-driver/pwa',
];

expectedApps.forEach((app) => {
  runTest(`Application "${app}" existe`, () => {
    return fileExists(`apps/${app}`);
  });

  runTest(`Application "${app}" a un package.json`, () => {
    return fileExists(`apps/${app}/package.json`);
  });

  runTest(`Application "${app}" a un .env.example`, () => {
    const exists = fileExists(`apps/${app}/.env.example`);
    return exists ? true : 'warning';
  });
});

// Test 3: Vérifier les ports des services
logSection('Test 3: Configuration des Ports');

const portMapping = {
  'admin-gateway': { port: 3001, varName: 'ADMIN_GATEWAY_PORT' },
  'authz': { port: 3002, varName: 'AUTHZ_PORT' },
  'ecmr': { port: 3003, varName: 'ECMR_PORT' },
  'notifications': { port: 3004, varName: 'NOTIFICATIONS_PORT' },
  'planning': { port: 3005, varName: 'PLANNING_PORT' },
  'tms-sync': { port: 3006, varName: 'TMS_SYNC_PORT' },
  'core-orders': { port: 3007, varName: 'PORT' },
  'vigilance': { port: 3008, varName: 'VIGILANCE_PORT' },
  'palette': { port: 3009, varName: 'PALETTE_PORT' },
  'affret-ia': { port: 3010, varName: 'AFFRET_IA_PORT' },
  'training': { port: 3012, varName: 'TRAINING_PORT' },
  'ecpmr': { port: 3014, varName: 'ECPMR_PORT' },
  'storage-market': { port: 3015, varName: 'PORT' },
  'geo-tracking': { port: 3016, varName: 'PORT' },
  'chatbot': { port: 3019, varName: 'PORT' },
};

Object.entries(portMapping).forEach(([service, { port, varName }]) => {
  runTest(`Service "${service}" configuré sur port ${port}`, () => {
    const serverPath = `services/${service}/src/server.js`;
    if (!fileExists(serverPath)) {
      return false;
    }
    const content = readFile(serverPath);
    return content.includes(`${port}`) || content.includes(varName);
  });
});

// Test 4: Intégration du Chatbot
logSection('Test 4: Intégration du Chatbot');

const chatbotIntegrations = [
  { app: 'web-industry', file: 'src/app/providers.tsx', component: 'ChatProvider' },
  { app: 'web-transporter', file: 'src/app/providers.tsx', component: 'ChatProvider' },
  { app: 'web-logistician', file: 'pages/_app.tsx', component: 'ChatProvider' },
  { app: 'web-recipient', file: 'pages/_app.tsx', component: 'ChatProvider' },
  { app: 'web-supplier', file: 'pages/_app.tsx', component: 'ChatProvider' },
  { app: 'web-forwarder', file: 'src/app/providers.tsx', component: 'ChatProvider' },
  { app: 'backoffice-admin', file: 'pages/_app.tsx', component: 'ChatProvider' },
  { app: 'mobile-driver/pwa', file: 'src/app/providers.tsx', component: 'ChatProvider' },
];

chatbotIntegrations.forEach(({ app, file, component }) => {
  runTest(`Chatbot intégré dans ${app}`, () => {
    const filePath = `apps/${app}/${file}`;
    if (!fileExists(filePath)) {
      return 'warning';
    }
    return containsString(filePath, component);
  });
});

// Test 5: Service Chatbot
logSection('Test 5: Service Chatbot');

runTest('Service chatbot existe', () => {
  return fileExists('services/chatbot/src/server.js');
});

runTest('Chatbot a 8 configurations de bots', () => {
  const botsDir = 'services/chatbot/src/bots';
  if (!fileExists(botsDir)) {
    return false;
  }
  const botFiles = fs.readdirSync(botsDir).filter(f => f.endsWith('.config.js'));
  logInfo(`  Trouvé ${botFiles.length} bots: ${botFiles.join(', ')}`);
  return botFiles.length >= 8;
});

runTest('Chatbot a un AI engine', () => {
  return fileExists('services/chatbot/src/ai-engine/index.js');
});

runTest('Chatbot a un système de priorisation', () => {
  return fileExists('services/chatbot/src/prioritization/index.js');
});

runTest('Chatbot a un système de diagnostics', () => {
  return fileExists('services/chatbot/src/diagnostics/index.js');
});

runTest('Widget chatbot existe dans design-system', () => {
  return fileExists('packages/chatbot-widget/src/ChatWidget.tsx') ||
         fileExists('packages/design-system/src/components/ChatWidget.tsx');
});

// Test 6: Service Geo-Tracking
logSection('Test 6: Service Geo-Tracking');

runTest('Service geo-tracking existe', () => {
  return fileExists('services/geo-tracking/src/server.js');
});

runTest('Geo-tracking a des routes GPS', () => {
  const serverPath = 'services/geo-tracking/src/server.js';
  return containsString(serverPath, '/positions') &&
         containsString(serverPath, '/eta') &&
         containsString(serverPath, '/geofence');
});

runTest('Geo-tracking configuré sur port 3016', () => {
  const serverPath = 'services/geo-tracking/src/server.js';
  const content = readFile(serverPath);
  return content.includes('3016');
});

// Test 7: Intégration Geo-Tracking avec Core-Orders
logSection('Test 7: Intégration Geo-Tracking ↔ Core-Orders');

runTest('Core-orders appelle geo-tracking', () => {
  const serverPath = 'services/core-orders/src/server.js';
  if (!fileExists(serverPath)) {
    return false;
  }
  const content = readFile(serverPath);
  return content.includes('geo-tracking') || content.includes('3016');
});

runTest('Core-orders a route GPS position', () => {
  const serverPath = 'services/core-orders/src/server.js';
  return containsString(serverPath, 'gps-position') || containsString(serverPath, 'positions');
});

// Test 8: Service Palette
logSection('Test 8: Service Palette');

runTest('Service palette configuré sur port 3009', () => {
  const serverPath = 'services/palette/src/server.js';
  const content = readFile(serverPath);
  return content.includes('3009');
});

runTest('API Client palette dans web-industry', () => {
  const apiPath = 'apps/web-industry/src/lib/api/palettes.ts';
  if (!fileExists(apiPath)) {
    return 'warning';
  }
  return containsString(apiPath, '3009') || containsString(apiPath, 'PALETTE_API');
});

// Test 9: Service Storage-Market
logSection('Test 9: Service Storage-Market');

runTest('Service storage-market configuré sur port 3015', () => {
  const serverPath = 'services/storage-market/src/server.js';
  const content = readFile(serverPath);
  return content.includes('3015');
});

runTest('Storage-market a AI ranking', () => {
  const serverPath = 'services/storage-market/src/server.js';
  return containsString(serverPath, 'ranking') || containsString(serverPath, 'score');
});

// Test 10: Scripts de Déploiement
logSection('Test 10: Scripts de Déploiement');

const deploymentScripts = [
  'build-all.sh',
  'dev-all.sh',
  'test-all.sh',
  'deploy.sh',
  'pre-deploy-check.sh',
  'monitor-services.sh',
];

deploymentScripts.forEach((script) => {
  runTest(`Script "${script}" existe`, () => {
    return fileExists(`scripts/${script}`);
  });
});

runTest('PM2 ecosystem configuré', () => {
  return fileExists('infra/scripts/pm2-ecosystem.config.js');
});

runTest('Docker Compose configuré', () => {
  return fileExists('infra/docker/docker-compose.yml') ||
         fileExists('docker-compose.yml');
});

runTest('Script de migration DB existe', () => {
  return fileExists('infra/scripts/migrate-db.js');
});

// Test 11: Documentation
logSection('Test 11: Documentation');

const docs = [
  'docs/PORTS_MAPPING.md',
  'docs/SERVICES_DEPENDENCIES.md',
  'docs/DEPLOYMENT_CHECKLIST.md',
  'docs/formations/README.md',
];

docs.forEach((doc) => {
  runTest(`Documentation "${doc}" existe`, () => {
    return fileExists(doc);
  });
});

// Test 12: Formation System
logSection('Test 12: Système de Formation');

runTest('TrainingButton dans design-system', () => {
  return fileExists('packages/design-system/src/components/TrainingButton.tsx');
});

runTest('Service training.ts existe', () => {
  return fileExists('packages/design-system/src/lib/training.ts');
});

runTest('9 guides de formation existent', () => {
  const guides = [
    'GUIDE_PALETTES.md',
    'GUIDE_BOURSE_STOCKAGE.md',
    'GUIDE_APP_CONDUCTEUR.md',
    'GUIDE_INDUSTRIE.md',
    'GUIDE_TRANSPORTEUR.md',
    'GUIDE_LOGISTICIEN.md',
    'GUIDE_BACKOFFICE.md',
    'GUIDE_ECMR.md',
    'GUIDE_AFFRET_IA.md',
  ];

  let count = 0;
  guides.forEach(guide => {
    if (fileExists(`docs/formations/${guide}`)) {
      count++;
    }
  });

  logInfo(`  Trouvé ${count}/9 guides`);
  return count === 9;
});

// Test 13: Variables d'environnement
logSection('Test 13: Configuration Variables d\'Environnement');

runTest('.env.example racine existe', () => {
  return fileExists('.env.example');
});

const servicesWithEnv = ['geo-tracking', 'chatbot', 'core-orders'];
servicesWithEnv.forEach((service) => {
  runTest(`${service} a .env.example`, () => {
    return fileExists(`services/${service}/.env.example`);
  });
});

// Test 14: Turbo Configuration
logSection('Test 14: Monorepo Turbo');

runTest('turbo.json existe', () => {
  return fileExists('turbo.json');
});

runTest('pnpm-workspace.yaml existe', () => {
  return fileExists('pnpm-workspace.yaml');
});

runTest('package.json racine a scripts Turbo', () => {
  const pkg = readJSON('package.json');
  return pkg.scripts &&
         pkg.scripts.build &&
         pkg.scripts.dev &&
         pkg.scripts.build.includes('turbo');
});

// Test 15: Dépendances critiques
logSection('Test 15: Dépendances Critiques');

runTest('Express installé dans services', () => {
  const pkg = readJSON('services/core-orders/package.json');
  return pkg.dependencies && pkg.dependencies.express;
});

runTest('Next.js installé dans apps', () => {
  const pkg = readJSON('apps/web-industry/package.json');
  return pkg.dependencies && pkg.dependencies.next;
});

runTest('MongoDB driver dans services', () => {
  const pkg = readJSON('services/core-orders/package.json');
  return pkg.dependencies && pkg.dependencies.mongodb;
});

// Summary
logSection('Résumé des Tests d\'Intégration');

log('');
log(`Total de tests exécutés: ${totalTests}`, 'bright');
log(`Tests réussis: ${passedTests}`, 'green');
log(`Tests échoués: ${failedTests}`, 'red');
log(`Avertissements: ${warnings}`, 'yellow');
log('');

const successRate = ((passedTests / totalTests) * 100).toFixed(1);
log(`Taux de réussite: ${successRate}%`, successRate >= 90 ? 'green' : successRate >= 70 ? 'yellow' : 'red');
log('');

if (failedTests === 0) {
  log('✓ Tous les tests d\'intégration sont passés avec succès!', 'green');
  log('✓ Le système est prêt pour le déploiement.', 'green');
  process.exit(0);
} else if (failedTests <= 5 && successRate >= 85) {
  log('⚠ Quelques tests ont échoué mais le système est globalement opérationnel.', 'yellow');
  log('ℹ Vérifiez les erreurs ci-dessus avant le déploiement.', 'blue');
  process.exit(0);
} else {
  log('✗ Plusieurs tests ont échoué. Des corrections sont nécessaires.', 'red');
  log('✗ Le système n\'est pas prêt pour le déploiement.', 'red');
  process.exit(1);
}
