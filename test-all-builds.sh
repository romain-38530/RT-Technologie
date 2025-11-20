#!/bin/bash
# Script de test des builds pour toutes les applications frontend

set -e

APPS=(
  "marketing-site"
  "backoffice-admin"
  "web-industry"
  "web-transporter"
  "web-logistician"
)

echo "========================================="
echo "🔨 Test des builds - RT-Technologie"
echo "========================================="
echo ""

SUCCESS_COUNT=0
FAILED_APPS=()

for APP in "${APPS[@]}"; do
  echo "→ Test build: $APP"
  cd "apps/$APP"

  if npm run build 2>&1 | tee "/tmp/build-$APP.log"; then
    echo "  ✓ $APP build réussi"
    ((SUCCESS_COUNT++))
  else
    echo "  ✗ $APP build échoué"
    FAILED_APPS+=("$APP")
    echo "  Voir les logs: /tmp/build-$APP.log"
  fi

  cd ../..
  echo ""
done

echo "========================================="
echo "📊 RÉSULTATS"
echo "========================================="
echo "Succès: $SUCCESS_COUNT/${#APPS[@]}"

if [ ${#FAILED_APPS[@]} -gt 0 ]; then
  echo "Échecs: ${FAILED_APPS[*]}"
  exit 1
else
  echo "✅ Tous les builds ont réussi!"
  exit 0
fi
