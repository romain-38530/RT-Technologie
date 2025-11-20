#!/bin/bash
#═══════════════════════════════════════════════════════════════════════════════
# DÉPLOIEMENT DES 3 APPLICATIONS MANQUANTES SUR VERCEL
#═══════════════════════════════════════════════════════════════════════════════

set -e

export VERCEL_TOKEN="X4FPPDxnCO1mJb73fa6h8Ecc"
export VERCEL_ORG_ID="team_W7z1VDHVL0mRrl1PJWQxdbF4"

echo "════════════════════════════════════════════════════════════════"
echo "🚀 DÉPLOIEMENT DES APPLICATIONS MANQUANTES SUR VERCEL"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Applications à déployer
APPS=(
  "web-recipient"
  "web-supplier"
  "web-forwarder"
)

for APP in "${APPS[@]}"; do
  echo "════════════════════════════════════════"
  echo "📦 Déploiement de $APP"
  echo "════════════════════════════════════════"
  echo ""

  cd "apps/$APP"

  echo "📦 Installation des dépendances..."
  pnpm install

  echo ""
  echo "🏗️  Build de l'application..."
  pnpm build

  echo ""
  echo "🚀 Déploiement sur Vercel (production)..."
  vercel --prod --token="$VERCEL_TOKEN" --yes

  echo ""
  echo "✅ $APP déployé avec succès !"
  echo ""

  cd ../..
done

echo "════════════════════════════════════════════════════════════════"
echo "✅ TOUS LES DÉPLOIEMENTS TERMINÉS"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Vérifiez vos déploiements sur:"
echo "https://vercel.com/dashboard"
