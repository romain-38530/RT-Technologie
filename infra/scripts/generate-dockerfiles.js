#!/usr/bin/env node

/**
 * Script de génération automatique des Dockerfiles pour les services backend
 * Analyse les dépendances packages de chaque service et génère le Dockerfile approprié
 */

const fs = require('fs');
const path = require('path');

// Configuration des dépendances par service
const SERVICE_DEPENDENCIES = {
  'admin-gateway': {
    port: 3001,
    packages: ['security', 'cloud-aws', 'entitlements', 'data-mongo']
  },
  'authz': {
    port: 3002,
    packages: ['notify-client', 'security']
  },
  'notifications': {
    port: 3004,
    packages: ['comm-templates', 'ai-client', 'security', 'cloud-aws']
  },
  'planning': {
    port: 3005,
    packages: ['notify-client', 'security', 'data-mongo']
  },
  'tms-sync': {
    port: 3006,
    packages: ['security']
  },
  'core-orders': {
    port: 3007,
    packages: ['notify-client', 'security', 'entitlements', 'data-mongo']
  },
  'vigilance': {
    port: 3008,
    packages: ['vat-client', 'security', 'data-mongo']
  },
  'palette': {
    port: 3009,
    packages: ['security']
  },
  'affret-ia': {
    port: 3010,
    packages: ['ai-client', 'security', 'data-mongo']
  },
  'training': {
    port: 3012,
    packages: []
  },
  'ecpmr': {
    port: 3014,
    packages: ['security', 'cloud-aws', 'data-mongo']
  },
  'storage-market': {
    port: 3015,
    packages: ['notify-client', 'security', 'entitlements', 'data-mongo']
  },
  'geo-tracking': {
    port: 3016,
    packages: []
  },
  'chatbot': {
    port: 3019,
    packages: ['security', 'data-mongo']
  }
};

/**
 * Génère le contenu du Dockerfile pour un service
 */
function generateDockerfile(serviceName, config) {
  const { port, packages } = config;

  if (packages.length === 0) {
    // Template simple sans dépendances packages
    return `FROM node:20-alpine

WORKDIR /app

# Installer nodemon globalement pour le hot-reload
RUN npm install -g nodemon

# Copier package.json et installer TOUTES les dépendances (dev incluses)
COPY package*.json ./
RUN npm install

# Copier le code source
COPY . .

# Exposer le port
EXPOSE ${port}

# Démarrer avec nodemon pour le hot-reload
CMD ["nodemon", "--watch", "src", "src/server.js"]
`;
  }

  // Template avec packages workspace
  const packageDirs = packages.map(pkg => `packages/${pkg}`).join(' ');
  const copyCommands = packages.map(pkg =>
    `COPY packages/${pkg} ./packages/${pkg}`
  ).join('\n');

  const volumesList = packages.map(pkg => `packages/${pkg}`).join(' ');

  return `FROM node:20-alpine

WORKDIR /app

# Installer nodemon globalement pour le hot-reload
RUN npm install -g nodemon

# Créer la structure de dossiers
RUN mkdir -p ${packageDirs} services/${serviceName}

# Copier les packages workspace nécessaires
${copyCommands}

# Copier le service ${serviceName}
COPY services/${serviceName}/package*.json ./services/${serviceName}/
WORKDIR /app/services/${serviceName}
RUN npm install

# Copier le code source du service
COPY services/${serviceName}/src ./src

# Exposer le port
EXPOSE ${port}

# Démarrer avec nodemon pour le hot-reload
CMD ["nodemon", "--watch", "src", "src/server.js"]
`;
}

/**
 * Génère la configuration docker-compose pour un service
 */
function generateDockerComposeVolumes(serviceName, config) {
  const { packages } = config;

  if (packages.length === 0) {
    return [
      `./services/${serviceName}:/app`,
      '/app/node_modules'
    ];
  }

  const volumes = [
    `./services/${serviceName}/src:/app/services/${serviceName}/src`,
    ...packages.map(pkg => `./packages/${pkg}:/app/packages/${pkg}`),
    `/app/services/${serviceName}/node_modules`
  ];

  return volumes;
}

/**
 * Script principal
 */
function main() {
  console.log('🚀 Génération des Dockerfiles pour les services backend...\n');

  const servicesDir = path.join(__dirname, '..', '..', 'services');
  let successCount = 0;
  let skipCount = 0;

  for (const [serviceName, config] of Object.entries(SERVICE_DEPENDENCIES)) {
    const serviceDir = path.join(servicesDir, serviceName);
    const dockerfilePath = path.join(serviceDir, 'Dockerfile');

    // Vérifier si le service existe
    if (!fs.existsSync(serviceDir)) {
      console.log(`⚠️  ${serviceName}: Dossier non trouvé, ignoré`);
      skipCount++;
      continue;
    }

    // Générer le Dockerfile
    const dockerfileContent = generateDockerfile(serviceName, config);
    fs.writeFileSync(dockerfilePath, dockerfileContent);

    const pkgInfo = config.packages.length > 0
      ? `(${config.packages.length} packages: ${config.packages.join(', ')})`
      : '(aucune dépendance)';

    console.log(`✅ ${serviceName}: Dockerfile généré ${pkgInfo}`);
    successCount++;
  }

  console.log(`\n📊 Résumé:`);
  console.log(`   ✅ ${successCount} Dockerfiles générés`);
  if (skipCount > 0) {
    console.log(`   ⚠️  ${skipCount} services ignorés`);
  }

  console.log('\n💡 Prochaines étapes:');
  console.log('   1. Vérifier les Dockerfiles générés');
  console.log('   2. Mettre à jour docker-compose.yml avec les bons contextes et volumes');
  console.log('   3. Lancer: docker-compose build');
}

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = { SERVICE_DEPENDENCIES, generateDockerfile, generateDockerComposeVolumes };
