#!/usr/bin/env node

/**
 * Script de refactorisation automatique pour éviter les erreurs de redéclaration
 * lors du hot reload des services Node.js
 *
 * Ce script transforme :
 * - const → var
 * - function declarations → function expressions
 * - Utilise global.__ pour stocker les modules et états
 */

const fs = require('fs');
const path = require('path');

function refactorServerFile(filePath, serviceName) {
  console.log(`\n🔄 Refactorisation de ${serviceName}...`);

  let content = fs.readFileSync(filePath, 'utf-8');

  // Créer un namespace unique pour ce service
  const namespace = `__${serviceName.replace(/-/g, '_')}`;

  // 1. Remplacer les imports const par des variables globales conditionnelles
  const requireRegex = /^const\s+(\{[^}]+\}|\w+)\s+=\s+require\(([^)]+)\);?$/gm;
  const requires = [];

  content = content.replace(requireRegex, (match, varName, modulePath) => {
    const cleanVarName = varName.trim();
    const cleanModulePath = modulePath.trim();
    requires.push({ varName: cleanVarName, modulePath: cleanModulePath });

    // Si c'est une déstructuration
    if (cleanVarName.startsWith('{')) {
      const globalVarName = `${namespace}_${cleanModulePath.replace(/['"\/\.@-]/g, '_')}`;
      return `if (!global.${globalVarName}) global.${globalVarName} = require(${cleanModulePath});\nvar ${cleanVarName} = global.${globalVarName};`;
    } else {
      const globalVarName = `${namespace}_${cleanVarName}`;
      return `if (!global.${globalVarName}) global.${globalVarName} = require(${cleanModulePath});\nvar ${cleanVarName} = global.${globalVarName};`;
    }
  });

  // 2. Remplacer const par var (sauf dans les blocs for, boucles, etc.)
  content = content.replace(/^const\s+/gm, 'var ');
  content = content.replace(/(\s+)const\s+/g, '$1var ');

  // 3. Transformer les déclarations de fonctions en expressions
  const functionRegex = /^(async\s+)?function\s+(\w+)\s*\(/gm;
  content = content.replace(functionRegex, 'var $2 = $1function(');

  // 4. Protéger le serveur HTTP contre les redéclarations
  if (content.includes('http.createServer') || content.includes('https.createServer')) {
    const serverVarName = `${namespace}_server`;

    // Trouver la création du serveur
    content = content.replace(
      /(const|var)\s+server\s*=\s*(http|https)\.createServer/g,
      `if (global.${serverVarName}) {
  try {
    global.${serverVarName}.close();
  } catch (e) {
    // Ignore errors on close
  }
}

global.${serverVarName} = $2.createServer`
    );

    // Ajouter une référence
    if (!content.includes(`var server = global.${serverVarName}`)) {
      content = content.replace(
        /^(global\.__\w+_server = .*createServer.*\);)/m,
        '$1\n\nvar server = global.' + serverVarName + ';'
      );
    }
  }

  // 5. Protéger contre l'initialisation multiple
  const initGuard = `
// Éviter de redémarrer si déjà en cours d'exécution
if (!global.${namespace}_initialized) {
  global.${namespace}_initialized = true;
`;

  const initGuardEnd = `
} else {
  console.log('[${serviceName}] Server already initialized, skipping restart');
}`;

  // Trouver le bloc d'initialisation (IIFE async ou .listen)
  if (content.includes('server.listen')) {
    content = content.replace(
      /(server\.listen\(PORT.*\{[\s\S]*?\}\);?[\s\S]*?\}\);?)/,
      (match) => {
        if (match.includes('async ()')) {
          // C'est déjà dans une IIFE
          return initGuard + '\n\n' + match + '\n' + initGuardEnd;
        }
        return match;
      }
    );
  }

  // Sauvegarder le fichier
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ ${serviceName} refactorisé avec succès`);
}

// Trouver tous les fichiers server.js dans services/
const servicesDir = path.join(__dirname, '..', 'services');
const services = fs.readdirSync(servicesDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

console.log(`📦 ${services.length} services trouvés`);

services.forEach(serviceName => {
  const serverPath = path.join(servicesDir, serviceName, 'src', 'server.js');

  if (fs.existsSync(serverPath)) {
    try {
      refactorServerFile(serverPath, serviceName);
    } catch (err) {
      console.error(`❌ Erreur lors de la refactorisation de ${serviceName}:`, err.message);
    }
  } else {
    console.log(`⚠️  ${serviceName}: server.js non trouvé`);
  }
});

console.log('\n✨ Refactorisation terminée !');
