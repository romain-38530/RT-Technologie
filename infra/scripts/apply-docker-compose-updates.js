#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { SERVICE_DEPENDENCIES } = require('./generate-dockerfiles.js');

// Mapping des services avec leurs volumes
const getVolumes = (serviceName, packages) => {
  if (packages.length === 0) {
    return [
      `      - ./services/${serviceName}:/app`,
      `      - /app/node_modules`
    ];
  }

  const volumes = [
    `      - ./services/${serviceName}/src:/app/services/${serviceName}/src`,
    ...packages.map(pkg => `      - ./packages/${pkg}:/app/packages/${pkg}`),
    `      - /app/services/${serviceName}/node_modules`
  ];

  return volumes;
};

const dockerComposePath = path.join(__dirname, '..', '..', 'docker-compose.yml');
let content = fs.readFileSync(dockerComposePath, 'utf8');

console.log('🔧 Mise à jour du docker-compose.yml...\n');

for (const [serviceName, config] of Object.entries(SERVICE_DEPENDENCIES)) {
  const { packages } = config;

  // Remplacer context
  const contextRegex = new RegExp(
    `(  ${serviceName}:[\\s\\S]*?build:[\\s\\S]*?context: )\\./services/${serviceName}`,
    ''
  );
  content = content.replace(contextRegex, '$1.');

  // Remplacer dockerfile
  const dockerfileRegex = new RegExp(
    `(  ${serviceName}:[\\s\\S]*?dockerfile: )Dockerfile`,
    ''
  );
  content = content.replace(dockerfileRegex, `$1services/${serviceName}/Dockerfile`);

  // Remplacer volumes
  const volumesLines = getVolumes(serviceName, packages);
  const volumesStr = volumesLines.join('\n');

  const volumesRegex = new RegExp(
    `(  ${serviceName}:[\\s\\S]*?volumes:\\n)(?:      -[^\\n]*\\n)+`,
    ''
  );

  content = content.replace(volumesRegex, `$1${volumesStr}\n`);

  console.log(`✅ ${serviceName} mis à jour`);
}

fs.writeFileSync(dockerComposePath, content);
console.log('\n✅ docker-compose.yml mis à jour avec succès !');
