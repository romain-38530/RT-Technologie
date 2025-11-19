#!/bin/bash
# =============================================================================
# CORRECTION JSON ET RELANCE - RT-Technologie
# Ce script corrige les fichiers package.json invalides et relance le déploiement
# =============================================================================

set -e

cd /home/ec2-user/workspace/RT-Technologie

echo "════════════════════════════════════════════════════════════════"
echo "🔧 CORRECTION DES FICHIERS JSON INVALIDES"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Correction des fichiers package.json
echo "📝 Correction de packages/types/package.json..."
cat > packages/types/package.json << 'EOF'
{
  "name": "@rt/types",
  "version": "1.0.0",
  "main": "index.js"
}
EOF

echo "📝 Correction de packages/utils/package.json..."
cat > packages/utils/package.json << 'EOF'
{
  "name": "@rt/utils",
  "version": "1.0.0",
  "main": "index.js"
}
EOF

echo "📝 Correction de packages/config/package.json..."
cat > packages/config/package.json << 'EOF'
{
  "name": "@rt/config",
  "version": "1.0.0",
  "main": "index.js"
}
EOF

echo ""
echo "✅ Fichiers JSON corrigés !"
echo ""
echo "📋 Vérification des fichiers:"
echo "─────────────────────────────────────────────────────────────────"
echo "packages/types/package.json:"
cat packages/types/package.json
echo ""
echo "packages/utils/package.json:"
cat packages/utils/package.json
echo ""
echo "packages/config/package.json:"
cat packages/config/package.json
echo "─────────────────────────────────────────────────────────────────"
echo ""

# Arrêter l'ancien déploiement
echo "🛑 Arrêt du déploiement en cours..."
pkill -f deploy-complete.sh || true
sleep 3

# Nettoyer les anciens logs
echo "🧹 Nettoyage des anciens logs..."
rm -f /tmp/build-*.log
rm -f /tmp/push-*.log

echo ""
echo "🚀 RELANCE DU DÉPLOIEMENT CORRIGÉ"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Relancer le déploiement
nohup /home/ec2-user/deploy-complete.sh > /home/ec2-user/deploy.log 2>&1 &

sleep 10

echo ""
echo "📊 Vérification du démarrage:"
ps aux | grep deploy-complete | grep -v grep

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "📝 PREMIÈRES LIGNES DU NOUVEAU LOG:"
echo "════════════════════════════════════════════════════════════════"
head -50 /home/ec2-user/deploy.log

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✅ CORRECTION ET RELANCE TERMINÉES !"
echo ""
echo "📊 Pour suivre la progression:"
echo "   tail -f /home/ec2-user/deploy.log"
echo ""
echo "⏱️  Durée estimée du déploiement: 40-60 minutes"
echo "════════════════════════════════════════════════════════════════"
