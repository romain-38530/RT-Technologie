#!/usr/bin/env node

/**
 * Script pour mettre à jour le docker-compose.yml avec les bons contextes et volumes
 */

const fs = require('fs');
const path = require('path');
const { SERVICE_DEPENDENCIES, generateDockerComposeVolumes } = require('./generate-dockerfiles.js');

function main() {
  console.log('🔧 Mise à jour du docker-compose.yml...\n');

  const dockerComposePath = path.join(__dirname, '..', '..', 'docker-compose.yml');
  let content = fs.readFileSync(dockerComposePath, 'utf8');

  for (const [serviceName, config] of Object.entries(SERVICE_DEPENDENCIES)) {
    console.log(`📝 Traitement de ${serviceName}...`);

    // Remplacer le context pour pointer vers la racine
    const oldContextPattern = new RegExp(`(${serviceName}:[\\s\\S]*?context: )\\./services/${serviceName}`, 'g');
    content = content.replace(oldContextPattern, `$1.`);

    // Remplacer le dockerfile path
    const oldDockerfilePattern = new RegExp(`(${serviceName}:[\\s\\S]*?dockerfile: )Dockerfile`, 'g');
    content = content.replace(oldDockerfilePattern, `$1services/${serviceName}/Dockerfile`);

    // Générer les volumes
    const volumes = generateDockerComposeVolumes(serviceName, config);
    const volumesYaml = volumes.map(v => `      - ${v}`).join('\n');

    // Remplacer les volumes (pattern plus complexe)
    const volumesPattern = new RegExp(
      `(${serviceName}:[\\s\\S]*?volumes:\\s*\\n)(\\s*-\\s+[^\\n]+\\n)*`,
      'g'
    );

    content = content.replace(volumesPattern, `$1${volumesYaml}\n`);
  }

  // Écrire le fichier mis à jour
  fs.writeFileSync(dockerComposePath, content);
  console.log('\n✅ docker-compose.yml mis à jour avec succès !');
}

if (require.main === module) {
  main();
}
