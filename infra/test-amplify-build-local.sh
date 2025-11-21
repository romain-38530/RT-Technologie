#!/bin/bash
# =============================================================================
# Script de test local du build Amplify
# RT-Technologie - Simule ce que fait AWS Amplify
# =============================================================================

set -e

APP_NAME=${1:-backoffice-admin}

echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                           ║"
echo "║          🧪 TEST LOCAL BUILD AMPLIFY - $APP_NAME                         ║"
echo "║                                                                           ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo ""

cd "apps/$APP_NAME"

echo "1️⃣  Installation des dépendances..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd ../..
pnpm install
cd "apps/$APP_NAME"
echo ""

echo "2️⃣  Build de l'application..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pnpm run build
echo ""

echo "3️⃣  Simulation de la copie Amplify..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Nettoyer l'ancien deploy-output
rm -rf ./deploy-output

# Copier comme dans amplify.yml
mkdir -p ./deploy-output
cp -r .next/standalone/apps/$APP_NAME/. ./deploy-output/
cp -r .next/standalone/node_modules ./deploy-output/ || true
cp -r .next/standalone/package.json ./deploy-output/ || true
mkdir -p ./deploy-output/.next/static
cp -r .next/static ./deploy-output/.next/static
cp .next/required-server-files.json ./deploy-output/.next/
cp .next/required-server-files.json ./deploy-output/
cp -r public ./deploy-output/public || true

echo ""
echo "4️⃣  Vérification de la structure..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "📁 Contenu de deploy-output/ :"
ls -lah ./deploy-output/

echo ""
echo "📁 Contenu de deploy-output/.next/ :"
ls -lah ./deploy-output/.next/

echo ""
echo "🔍 Vérifications critiques :"
echo ""

# Vérifier required-server-files.json
if [ -f "./deploy-output/required-server-files.json" ]; then
  echo "✅ required-server-files.json trouvé à la racine"
else
  echo "❌ required-server-files.json MANQUANT à la racine"
fi

if [ -f "./deploy-output/.next/required-server-files.json" ]; then
  echo "✅ required-server-files.json trouvé dans .next/"
else
  echo "❌ required-server-files.json MANQUANT dans .next/"
fi

# Vérifier server.js
if [ -f "./deploy-output/server.js" ]; then
  echo "✅ server.js trouvé"
else
  echo "❌ server.js MANQUANT"
fi

# Vérifier .next/server
if [ -d "./deploy-output/.next/server" ]; then
  echo "✅ .next/server/ trouvé"
  echo "   Contenu:"
  ls -lah ./deploy-output/.next/server/ | head -10
else
  echo "❌ .next/server/ MANQUANT"
fi

# Vérifier node_modules
if [ -d "./deploy-output/node_modules" ]; then
  echo "✅ node_modules/ trouvé"
  MODULE_COUNT=$(find ./deploy-output/node_modules -maxdepth 1 -type d | wc -l)
  echo "   Modules: $MODULE_COUNT"
else
  echo "❌ node_modules/ MANQUANT"
fi

# Vérifier static
if [ -d "./deploy-output/.next/static" ]; then
  echo "✅ .next/static/ trouvé"
else
  echo "❌ .next/static/ MANQUANT"
fi

echo ""
echo "5️⃣  Test de démarrage du serveur..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Pour tester le serveur localement:"
echo "  cd apps/$APP_NAME/deploy-output"
echo "  node server.js"
echo ""
echo "Puis ouvrez: http://localhost:3000"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RÉSUMÉ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

ERRORS=0

[ ! -f "./deploy-output/required-server-files.json" ] && ERRORS=$((ERRORS + 1))
[ ! -f "./deploy-output/.next/required-server-files.json" ] && ERRORS=$((ERRORS + 1))
[ ! -f "./deploy-output/server.js" ] && ERRORS=$((ERRORS + 1))
[ ! -d "./deploy-output/.next/server" ] && ERRORS=$((ERRORS + 1))
[ ! -d "./deploy-output/node_modules" ] && ERRORS=$((ERRORS + 1))
[ ! -d "./deploy-output/.next/static" ] && ERRORS=$((ERRORS + 1))

if [ $ERRORS -eq 0 ]; then
  echo "✅ Tous les fichiers requis sont présents !"
  echo ""
  echo "Le build devrait fonctionner sur AWS Amplify."
  echo ""
  echo "Prochaines étapes:"
  echo "  1. git add apps/$APP_NAME/amplify.yml"
  echo "  2. git commit -m 'fix: amplify build configuration'"
  echo "  3. git push origin aws-amplify"
  echo ""
else
  echo "❌ $ERRORS erreur(s) détectée(s)"
  echo ""
  echo "Corrigez les problèmes avant de déployer sur AWS Amplify."
  echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
