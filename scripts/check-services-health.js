#!/usr/bin/env node

/**
 * RT-Technologie - Service Health Check Script
 *
 * Ce script vérifie la santé et la connectivité de tous les services backend.
 * Il génère un rapport HTML et JSON avec :
 * - Statut de chaque service
 * - Temps de réponse
 * - Dépendances validées
 * - Alertes et recommandations
 *
 * Usage:
 *   node scripts/check-services-health.js
 *   node scripts/check-services-health.js --json
 *   node scripts/check-services-health.js --html report.html
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration des services
const SERVICES = [
  { name: 'admin-gateway', port: 3001, url: process.env.ADMIN_GATEWAY_URL || 'http://localhost:3001', endpoint: '/admin/health' },
  { name: 'authz', port: 3002, url: process.env.AUTHZ_URL || 'http://localhost:3002', endpoint: '/health' },
  { name: 'ecmr', port: 3003, url: process.env.ECMR_URL || 'http://localhost:3003', endpoint: '/health' },
  { name: 'notifications', port: 3004, url: process.env.NOTIFICATIONS_URL || 'http://localhost:3004', endpoint: '/health' },
  { name: 'planning', port: 3005, url: process.env.PLANNING_URL || 'http://localhost:3005', endpoint: '/health' },
  { name: 'tms-sync', port: 3006, url: process.env.TMS_SYNC_URL || 'http://localhost:3006', endpoint: '/health' },
  { name: 'core-orders', port: 3007, url: process.env.CORE_ORDERS_URL || 'http://localhost:3007', endpoint: '/health' },
  { name: 'vigilance', port: 3008, url: process.env.VIGILANCE_URL || 'http://localhost:3008', endpoint: '/health' },
  { name: 'palette', port: 3009, url: process.env.PALETTE_URL || 'http://localhost:3009', endpoint: '/health' },
  { name: 'affret-ia', port: 3010, url: process.env.AFFRET_IA_URL || 'http://localhost:3010', endpoint: '/health' },
  { name: 'training', port: 3012, url: process.env.TRAINING_URL || 'http://localhost:3012', endpoint: '/health' },
  { name: 'ecpmr', port: 3014, url: process.env.ECPMR_URL || 'http://localhost:3014', endpoint: '/health' },
  { name: 'storage-market', port: 3015, url: process.env.STORAGE_MARKET_URL || 'http://localhost:3015', endpoint: '/health' },
  { name: 'geo-tracking', port: 3016, url: process.env.GEO_TRACKING_URL || 'http://localhost:3016', endpoint: '/geo-tracking/health' },
  { name: 'chatbot', port: 3019, url: process.env.CHATBOT_URL || 'http://localhost:3019', endpoint: '/health' },
];

// Dépendances entre services
const DEPENDENCIES = {
  'admin-gateway': ['authz', 'core-orders', 'planning', 'vigilance', 'notifications', 'ecpmr'],
  'core-orders': ['authz', 'vigilance', 'affret-ia', 'planning', 'geo-tracking'],
  'affret-ia': ['palette', 'core-orders'],
  'palette': ['authz', 'notifications'],
  'storage-market': ['authz', 'notifications'],
  'planning': ['notifications'],
  'chatbot': ['authz'],
};

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

/**
 * Effectue une requête HTTP avec timeout
 */
function httpRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';

    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: options.timeout || 5000,
    };

    const client = isHttps ? https : http;
    const startTime = Date.now();

    const req = client.request(requestOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        const duration = Date.now() - startTime;

        try {
          const data = body ? JSON.parse(body) : null;
          resolve({
            statusCode: res.statusCode,
            data,
            duration,
            success: res.statusCode >= 200 && res.statusCode < 300,
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            data: body,
            duration,
            success: res.statusCode >= 200 && res.statusCode < 300,
            parseError: e.message,
          });
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

/**
 * Vérifie la santé d'un service
 */
async function checkService(service) {
  const result = {
    name: service.name,
    port: service.port,
    url: service.url,
    endpoint: service.endpoint,
    status: 'unknown',
    duration: 0,
    error: null,
    data: null,
  };

  try {
    const response = await httpRequest(`${service.url}${service.endpoint}`);

    result.status = response.success ? 'healthy' : 'unhealthy';
    result.duration = response.duration;
    result.data = response.data;

    if (!response.success) {
      result.error = `HTTP ${response.statusCode}`;
    }
  } catch (error) {
    result.status = 'down';
    result.error = error.message;
  }

  return result;
}

/**
 * Vérifie les dépendances d'un service
 */
async function checkDependencies(serviceName, results) {
  const deps = DEPENDENCIES[serviceName] || [];
  const depResults = [];

  for (const depName of deps) {
    const depResult = results.find(r => r.name === depName);

    if (!depResult) {
      depResults.push({
        name: depName,
        status: 'unknown',
        available: false,
      });
      continue;
    }

    depResults.push({
      name: depName,
      status: depResult.status,
      available: depResult.status === 'healthy',
      duration: depResult.duration,
    });
  }

  return depResults;
}

/**
 * Génère des recommandations basées sur les résultats
 */
function generateRecommendations(results) {
  const recommendations = [];

  // Services down
  const downServices = results.filter(r => r.status === 'down');
  if (downServices.length > 0) {
    recommendations.push({
      level: 'critical',
      message: `${downServices.length} service(s) inaccessible(s): ${downServices.map(s => s.name).join(', ')}`,
      action: 'Vérifier que les services sont démarrés et que les ports sont corrects',
    });
  }

  // Services lents
  const slowServices = results.filter(r => r.status === 'healthy' && r.duration > 1000);
  if (slowServices.length > 0) {
    recommendations.push({
      level: 'warning',
      message: `${slowServices.length} service(s) lent(s) (>1s): ${slowServices.map(s => `${s.name} (${s.duration}ms)`).join(', ')}`,
      action: 'Analyser les performances et optimiser si nécessaire',
    });
  }

  // Dépendances manquantes
  for (const service of results.filter(r => r.status === 'healthy')) {
    if (!DEPENDENCIES[service.name]) continue;

    const missingDeps = DEPENDENCIES[service.name].filter(dep => {
      const depResult = results.find(r => r.name === dep);
      return !depResult || depResult.status !== 'healthy';
    });

    if (missingDeps.length > 0) {
      recommendations.push({
        level: 'warning',
        message: `${service.name} a des dépendances indisponibles: ${missingDeps.join(', ')}`,
        action: 'Démarrer les services dépendants',
      });
    }
  }

  // Tout va bien
  if (recommendations.length === 0) {
    recommendations.push({
      level: 'success',
      message: 'Tous les services sont opérationnels',
      action: 'Aucune action requise',
    });
  }

  return recommendations;
}

/**
 * Affiche les résultats dans la console
 */
function displayResults(results, recommendations) {
  console.log(`\n${colors.bright}${colors.cyan}=== RT-Technologie - Health Check Report ===${colors.reset}\n`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  // Statistiques globales
  const healthy = results.filter(r => r.status === 'healthy').length;
  const unhealthy = results.filter(r => r.status === 'unhealthy').length;
  const down = results.filter(r => r.status === 'down').length;
  const avgDuration = results.filter(r => r.status === 'healthy').reduce((sum, r) => sum + r.duration, 0) / healthy;

  console.log(`${colors.bright}Statistiques globales:${colors.reset}`);
  console.log(`  Total: ${results.length} services`);
  console.log(`  ${colors.green}Healthy: ${healthy}${colors.reset}`);
  console.log(`  ${colors.yellow}Unhealthy: ${unhealthy}${colors.reset}`);
  console.log(`  ${colors.red}Down: ${down}${colors.reset}`);
  console.log(`  Temps de réponse moyen: ${Math.round(avgDuration)}ms\n`);

  // Détails par service
  console.log(`${colors.bright}Détails des services:${colors.reset}\n`);

  for (const result of results) {
    let statusColor = colors.reset;
    let statusIcon = '?';

    if (result.status === 'healthy') {
      statusColor = colors.green;
      statusIcon = '✓';
    } else if (result.status === 'unhealthy') {
      statusColor = colors.yellow;
      statusIcon = '⚠';
    } else if (result.status === 'down') {
      statusColor = colors.red;
      statusIcon = '✗';
    }

    console.log(`${statusColor}${statusIcon} ${result.name}${colors.reset} (port ${result.port})`);
    console.log(`  URL: ${result.url}${result.endpoint}`);
    console.log(`  Status: ${statusColor}${result.status}${colors.reset}`);

    if (result.duration) {
      console.log(`  Response time: ${result.duration}ms`);
    }

    if (result.error) {
      console.log(`  Error: ${colors.red}${result.error}${colors.reset}`);
    }

    if (result.data) {
      if (result.data.mongo !== undefined) {
        console.log(`  MongoDB: ${result.data.mongo ? colors.green + 'Connected' : colors.yellow + 'Not connected'}${colors.reset}`);
      }
    }

    // Dépendances
    const deps = DEPENDENCIES[result.name];
    if (deps && deps.length > 0) {
      console.log(`  Dependencies: ${deps.join(', ')}`);

      const depResults = results.filter(r => deps.includes(r.name));
      const availableDeps = depResults.filter(r => r.status === 'healthy').length;

      if (availableDeps < deps.length) {
        console.log(`  ${colors.yellow}⚠ ${availableDeps}/${deps.length} dependencies available${colors.reset}`);
      }
    }

    console.log('');
  }

  // Recommandations
  console.log(`${colors.bright}Recommandations:${colors.reset}\n`);

  for (const rec of recommendations) {
    let icon = 'ℹ';
    let levelColor = colors.blue;

    if (rec.level === 'critical') {
      icon = '✗';
      levelColor = colors.red;
    } else if (rec.level === 'warning') {
      icon = '⚠';
      levelColor = colors.yellow;
    } else if (rec.level === 'success') {
      icon = '✓';
      levelColor = colors.green;
    }

    console.log(`${levelColor}${icon} ${rec.message}${colors.reset}`);
    console.log(`  Action: ${rec.action}\n`);
  }
}

/**
 * Génère un rapport HTML
 */
function generateHTMLReport(results, recommendations, outputPath) {
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RT-Technologie - Health Check Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
    .header h1 { font-size: 28px; margin-bottom: 10px; }
    .header p { opacity: 0.9; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 30px; background: #f9fafb; border-bottom: 1px solid #e5e7eb; }
    .stat { text-align: center; }
    .stat-value { font-size: 36px; font-weight: bold; margin-bottom: 5px; }
    .stat-label { color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; }
    .stat.healthy .stat-value { color: #10b981; }
    .stat.unhealthy .stat-value { color: #f59e0b; }
    .stat.down .stat-value { color: #ef4444; }
    .content { padding: 30px; }
    .section { margin-bottom: 40px; }
    .section h2 { font-size: 20px; margin-bottom: 20px; color: #1f2937; }
    .service { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; margin-bottom: 15px; }
    .service-header { display: flex; align-items: center; margin-bottom: 15px; }
    .service-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-right: 15px; }
    .service-icon.healthy { background: #d1fae5; color: #10b981; }
    .service-icon.unhealthy { background: #fef3c7; color: #f59e0b; }
    .service-icon.down { background: #fee2e2; color: #ef4444; }
    .service-name { font-size: 18px; font-weight: 600; color: #1f2937; }
    .service-port { color: #6b7280; margin-left: 10px; }
    .service-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; font-size: 14px; }
    .service-info-item { }
    .service-info-label { color: #6b7280; margin-bottom: 5px; }
    .service-info-value { font-weight: 500; color: #1f2937; }
    .dependencies { margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb; }
    .dependencies-title { font-size: 14px; color: #6b7280; margin-bottom: 10px; }
    .dependencies-list { display: flex; flex-wrap: wrap; gap: 8px; }
    .dependency { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 13px; }
    .dependency.available { background: #d1fae5; color: #047857; }
    .dependency.unavailable { background: #fee2e2; color: #991b1b; }
    .recommendations { }
    .recommendation { background: white; border-left: 4px solid; padding: 15px; margin-bottom: 15px; border-radius: 4px; }
    .recommendation.critical { border-color: #ef4444; background: #fef2f2; }
    .recommendation.warning { border-color: #f59e0b; background: #fffbeb; }
    .recommendation.success { border-color: #10b981; background: #f0fdf4; }
    .recommendation-message { font-weight: 500; margin-bottom: 8px; }
    .recommendation.critical .recommendation-message { color: #991b1b; }
    .recommendation.warning .recommendation-message { color: #92400e; }
    .recommendation.success .recommendation-message { color: #065f46; }
    .recommendation-action { color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>RT-Technologie - Health Check Report</h1>
      <p>Generated: ${new Date().toISOString()}</p>
    </div>

    <div class="stats">
      <div class="stat">
        <div class="stat-value">${results.length}</div>
        <div class="stat-label">Total Services</div>
      </div>
      <div class="stat healthy">
        <div class="stat-value">${results.filter(r => r.status === 'healthy').length}</div>
        <div class="stat-label">Healthy</div>
      </div>
      <div class="stat unhealthy">
        <div class="stat-value">${results.filter(r => r.status === 'unhealthy').length}</div>
        <div class="stat-label">Unhealthy</div>
      </div>
      <div class="stat down">
        <div class="stat-value">${results.filter(r => r.status === 'down').length}</div>
        <div class="stat-label">Down</div>
      </div>
      <div class="stat">
        <div class="stat-value">${Math.round(results.filter(r => r.status === 'healthy').reduce((sum, r) => sum + r.duration, 0) / results.filter(r => r.status === 'healthy').length)}ms</div>
        <div class="stat-label">Avg Response</div>
      </div>
    </div>

    <div class="content">
      <div class="section">
        <h2>Services Status</h2>
        ${results.map(result => `
          <div class="service">
            <div class="service-header">
              <div class="service-icon ${result.status}">
                ${result.status === 'healthy' ? '✓' : result.status === 'unhealthy' ? '⚠' : '✗'}
              </div>
              <div>
                <div class="service-name">${result.name}<span class="service-port">:${result.port}</span></div>
              </div>
            </div>
            <div class="service-info">
              <div class="service-info-item">
                <div class="service-info-label">URL</div>
                <div class="service-info-value">${result.url}${result.endpoint}</div>
              </div>
              <div class="service-info-item">
                <div class="service-info-label">Status</div>
                <div class="service-info-value">${result.status}</div>
              </div>
              ${result.duration ? `
                <div class="service-info-item">
                  <div class="service-info-label">Response Time</div>
                  <div class="service-info-value">${result.duration}ms</div>
                </div>
              ` : ''}
              ${result.error ? `
                <div class="service-info-item">
                  <div class="service-info-label">Error</div>
                  <div class="service-info-value" style="color: #ef4444;">${result.error}</div>
                </div>
              ` : ''}
              ${result.data && result.data.mongo !== undefined ? `
                <div class="service-info-item">
                  <div class="service-info-label">MongoDB</div>
                  <div class="service-info-value">${result.data.mongo ? 'Connected' : 'Not connected'}</div>
                </div>
              ` : ''}
            </div>
            ${DEPENDENCIES[result.name] ? `
              <div class="dependencies">
                <div class="dependencies-title">Dependencies (${DEPENDENCIES[result.name].length})</div>
                <div class="dependencies-list">
                  ${DEPENDENCIES[result.name].map(dep => {
                    const depResult = results.find(r => r.name === dep);
                    const available = depResult && depResult.status === 'healthy';
                    return `<span class="dependency ${available ? 'available' : 'unavailable'}">${dep}</span>`;
                  }).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>

      <div class="section">
        <h2>Recommendations</h2>
        <div class="recommendations">
          ${recommendations.map(rec => `
            <div class="recommendation ${rec.level}">
              <div class="recommendation-message">${rec.message}</div>
              <div class="recommendation-action">${rec.action}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  fs.writeFileSync(outputPath, html, 'utf-8');
  console.log(`\n${colors.green}✓ HTML report generated: ${outputPath}${colors.reset}\n`);
}

/**
 * Génère un rapport JSON
 */
function generateJSONReport(results, recommendations, outputPath) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: results.length,
      healthy: results.filter(r => r.status === 'healthy').length,
      unhealthy: results.filter(r => r.status === 'unhealthy').length,
      down: results.filter(r => r.status === 'down').length,
      avgResponseTime: Math.round(
        results.filter(r => r.status === 'healthy').reduce((sum, r) => sum + r.duration, 0) /
        results.filter(r => r.status === 'healthy').length
      ),
    },
    services: results.map(r => ({
      ...r,
      dependencies: DEPENDENCIES[r.name] || [],
    })),
    recommendations,
  };

  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\n${colors.green}✓ JSON report generated: ${outputPath}${colors.reset}\n`);
}

/**
 * Main
 */
async function main() {
  const args = process.argv.slice(2);
  const jsonOnly = args.includes('--json');
  const htmlPath = args.find(arg => arg.endsWith('.html')) || 'health-report.html';
  const jsonPath = args.find(arg => arg.endsWith('.json')) || 'health-report.json';

  console.log(`${colors.bright}${colors.cyan}Checking ${SERVICES.length} services...${colors.reset}\n`);

  // Vérifier tous les services
  const results = [];
  for (const service of SERVICES) {
    process.stdout.write(`Checking ${service.name}...`);
    const result = await checkService(service);
    results.push(result);

    if (result.status === 'healthy') {
      console.log(` ${colors.green}✓${colors.reset} (${result.duration}ms)`);
    } else if (result.status === 'unhealthy') {
      console.log(` ${colors.yellow}⚠${colors.reset}`);
    } else {
      console.log(` ${colors.red}✗${colors.reset}`);
    }
  }

  // Générer recommandations
  const recommendations = generateRecommendations(results);

  // Afficher résultats console
  if (!jsonOnly) {
    displayResults(results, recommendations);
  }

  // Générer rapports
  if (args.includes('--html')) {
    generateHTMLReport(results, recommendations, htmlPath);
  }

  if (jsonOnly || args.includes('--json')) {
    generateJSONReport(results, recommendations, jsonPath);
  }

  // Exit code basé sur les résultats
  const downCount = results.filter(r => r.status === 'down').length;
  process.exit(downCount > 0 ? 1 : 0);
}

// Run
if (require.main === module) {
  main().catch(err => {
    console.error(`${colors.red}Error: ${err.message}${colors.reset}`);
    process.exit(1);
  });
}

module.exports = { checkService, generateRecommendations };
