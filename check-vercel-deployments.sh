#!/bin/bash
#═══════════════════════════════════════════════════════════════════════════════
# VÉRIFICATION DES DÉPLOIEMENTS VERCEL
#═══════════════════════════════════════════════════════════════════════════════

set -e

VERCEL_TOKEN="X4FPPDxnCO1mJb73fa6h8Ecc"
TEAM_ID="team_W7z1VDHVL0mRrl1PJWQxdbF4"

echo "════════════════════════════════════════════════════════════════"
echo "🔍 VÉRIFICATION DES DÉPLOIEMENTS VERCEL"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Installer Vercel CLI si nécessaire
if ! command -v vercel &> /dev/null; then
  echo "📦 Installation de Vercel CLI..."
  npm install -g vercel@latest
  echo ""
fi

echo "📋 Liste des projets Vercel pour l'équipe:"
echo ""

# Lister les projets via l'API
curl -s "https://api.vercel.com/v9/projects?teamId=$TEAM_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" | jq -r '.projects[] | "- \(.name): \(.latestDeployments[0].url // "Pas de déploiement")"' || echo "Erreur d'accès à l'API"

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "📊 DÉTAILS DES APPLICATIONS"
echo "════════════════════════════════════════════════════════════════"
echo ""

APPS=(
  "web-industry"
  "web-transporter"
  "web-logistician"
  "web-recipient"
  "web-supplier"
  "web-forwarder"
  "backoffice-admin"
  "marketing-site"
)

for APP in "${APPS[@]}"; do
  echo "🔍 Vérification de $APP..."

  # Récupérer les infos du projet
  PROJECT_INFO=$(curl -s "https://api.vercel.com/v9/projects/$APP?teamId=$TEAM_ID" \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/json")

  if echo "$PROJECT_INFO" | jq -e '.error' > /dev/null 2>&1; then
    echo "  ❌ Projet non trouvé ou erreur d'accès"
  else
    # Extraire l'URL de production
    PROD_URL=$(echo "$PROJECT_INFO" | jq -r '.link // .targets.production.url // "Non disponible"')
    LAST_DEPLOY=$(echo "$PROJECT_INFO" | jq -r '.latestDeployments[0].url // "Aucun déploiement"')

    echo "  ✅ URL de production: https://$PROD_URL"
    echo "  📅 Dernier déploiement: $LAST_DEPLOY"
  fi
  echo ""
done

echo "════════════════════════════════════════════════════════════════"
echo "✅ Vérification terminée"
echo "════════════════════════════════════════════════════════════════"
