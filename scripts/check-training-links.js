#!/usr/bin/env node

/**
 * Script de vérification des liens de formation
 * Vérifie que toutes les formations référencées dans training.ts ont bien leurs fichiers correspondants
 */

const fs = require('fs');
const path = require('path');

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, ...args) {
  console.log(color, ...args, colors.reset);
}

// Chemins des fichiers
const rootDir = path.join(__dirname, '..');
const trainingServicePath = path.join(rootDir, 'packages/design-system/src/lib/training.ts');
const formationsDir = path.join(rootDir, 'docs/formations');

log(colors.blue, '\n🔍 Vérification des liens de formation...\n');

// Vérifier que le service de formation existe
if (!fs.existsSync(trainingServicePath)) {
  log(colors.red, '❌ Fichier training.ts introuvable!');
  log(colors.yellow, `   Attendu : ${trainingServicePath}`);
  process.exit(1);
}

// Lire le contenu du service de formation
const trainingContent = fs.readFileSync(trainingServicePath, 'utf-8');

// Extraire les URLs des guides
const guideUrlRegex = /guideUrl:\s*['"]([^'"]+)['"]/g;
const guideUrls = [];
let match;

while ((match = guideUrlRegex.exec(trainingContent)) !== null) {
  guideUrls.push(match[1]);
}

log(colors.cyan, `📚 ${guideUrls.length} formations trouvées dans training.ts\n`);

// Vérifier chaque URL
let errors = 0;
let warnings = 0;
let success = 0;

guideUrls.forEach((url, index) => {
  // Convertir l'URL en chemin de fichier
  // /docs/formations/GUIDE_PALETTES.md → docs/formations/GUIDE_PALETTES.md
  const relativePath = url.replace(/^\//, '');
  const filePath = path.join(rootDir, relativePath);

  const fileName = path.basename(url);
  const toolName = Object.entries(extractToolNames(trainingContent))[index]?.[0] || 'Unknown';

  if (fs.existsSync(filePath)) {
    // Fichier existe, vérifier la taille
    const stats = fs.statSync(filePath);
    const sizeKb = (stats.size / 1024).toFixed(2);

    if (stats.size < 1000) {
      log(colors.yellow, `⚠️  ${toolName.padEnd(25)} → ${fileName.padEnd(35)} (${sizeKb} KB - Fichier très petit)`);
      warnings++;
    } else {
      log(colors.green, `✅ ${toolName.padEnd(25)} → ${fileName.padEnd(35)} (${sizeKb} KB)`);
      success++;
    }
  } else {
    log(colors.red, `❌ ${toolName.padEnd(25)} → ${fileName.padEnd(35)} (INTROUVABLE)`);
    log(colors.yellow, `   Attendu : ${filePath}`);
    errors++;
  }
});

// Vérifier les fichiers orphelins (fichiers dans docs/formations/ non référencés)
if (fs.existsSync(formationsDir)) {
  const formationFiles = fs.readdirSync(formationsDir)
    .filter(f => f.endsWith('.md'))
    .filter(f => f !== 'README.md');

  const referencedFiles = guideUrls.map(url => path.basename(url));
  const orphanFiles = formationFiles.filter(f => !referencedFiles.includes(f));

  if (orphanFiles.length > 0) {
    log(colors.yellow, `\n⚠️  ${orphanFiles.length} fichier(s) non référencé(s) dans training.ts :`);
    orphanFiles.forEach(f => {
      log(colors.yellow, `   - ${f}`);
    });
    warnings += orphanFiles.length;
  }
}

// Résumé
log(colors.blue, '\n' + '='.repeat(80));
log(colors.cyan, '📊 Résumé de la vérification :');
log(colors.green, `   ✅ Liens valides : ${success}`);
if (warnings > 0) log(colors.yellow, `   ⚠️  Avertissements : ${warnings}`);
if (errors > 0) log(colors.red, `   ❌ Erreurs : ${errors}`);
log(colors.blue, '='.repeat(80) + '\n');

// Exit code
if (errors > 0) {
  log(colors.red, '❌ Des erreurs ont été détectées. Veuillez les corriger.');
  process.exit(1);
} else if (warnings > 0) {
  log(colors.yellow, '⚠️  Des avertissements ont été émis. Vérifiez les fichiers concernés.');
  process.exit(0);
} else {
  log(colors.green, '✅ Tous les liens de formation sont valides !');
  process.exit(0);
}

/**
 * Extrait les noms d'outils du TRAINING_CATALOG
 */
function extractToolNames(content) {
  const catalogRegex = /['"]([^'"]+)['"]\s*:\s*\{[^}]*toolName:\s*['"]([^'"]+)['"]/g;
  const names = {};
  let match;

  while ((match = catalogRegex.exec(content)) !== null) {
    names[match[2]] = match[1]; // toolName → key
  }

  return names;
}
