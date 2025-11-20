#!/bin/bash
#═══════════════════════════════════════════════════════════════════════════════
# CRÉATION DU GIST DE MONITORING - Une seule fois
#═══════════════════════════════════════════════════════════════════════════════

set -e

echo "════════════════════════════════════════════════════════════════"
echo "🤖 CRÉATION DU GIST DE MONITORING AUTOMATIQUE"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Vérifier que le token est défini
if [ -z "$GIST_TOKEN" ]; then
  echo "❌ Erreur: La variable d'environnement GIST_TOKEN n'est pas définie"
  echo ""
  echo "Pour définir le token:"
  echo "  export GIST_TOKEN='ghp_votre_token_ici'"
  echo ""
  exit 1
fi

echo "✅ Token Gist détecté"
echo ""

# Créer un diagnostic de test
echo "📝 Création d'un diagnostic de test..."

cat > diagnostic-test.json << 'EOF'
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "workflow": {
    "name": "Test - Configuration initiale",
    "status": "setup",
    "branch": "dockerfile",
    "message": "Configuration du système de monitoring automatique"
  },
  "info": "Ce Gist sera mis à jour automatiquement par GitHub Actions à chaque déploiement"
}
EOF

cat > diagnostic-test.md << 'EOF'
# 🤖 Diagnostic Automatique RT-Technologie

**Statut:** Configuration initiale

Ce Gist sera mis à jour automatiquement par GitHub Actions à chaque déploiement AWS ou Vercel.

## 📊 Informations

- **Système:** Monitoring automatique activé
- **Mise à jour:** Automatique après chaque déploiement
- **Format:** JSON + Markdown

## 🔧 Prochaines étapes

1. Ajoutez l'ID de ce Gist dans les secrets GitHub
2. Lancez un déploiement pour tester
3. Le Gist sera mis à jour automatiquement

---

**Dernière mise à jour:** $(date -u +%Y-%m-%dT%H:%M:%SZ)
EOF

# Créer le Gist via l'API GitHub
echo "🚀 Création du Gist public..."
echo ""

RESPONSE=$(curl -s -X POST https://api.github.com/gists \
  -H "Authorization: token $GIST_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  -d '{
    "description": "RT-Technologie - Diagnostics de Déploiement Automatiques",
    "public": true,
    "files": {
      "latest-diagnostic.json": {
        "content": '"$(cat diagnostic-test.json | jq -Rs .)"'
      },
      "latest-diagnostic.md": {
        "content": '"$(cat diagnostic-test.md | jq -Rs .)"'
      },
      "README.md": {
        "content": "# 🤖 Diagnostics Automatiques RT-Technologie\n\nCe Gist contient les diagnostics automatiques des déploiements.\n\n- **latest-diagnostic.json** - Dernier diagnostic au format JSON\n- **latest-diagnostic.md** - Dernier diagnostic au format Markdown\n\n**Mise à jour automatique** après chaque déploiement AWS/Vercel.\n"
      }
    }
  }')

# Extraire l'ID du Gist
GIST_ID=$(echo $RESPONSE | jq -r '.id')
GIST_URL=$(echo $RESPONSE | jq -r '.html_url')

if [ "$GIST_ID" = "null" ] || [ -z "$GIST_ID" ]; then
  echo "❌ Erreur lors de la création du Gist"
  echo ""
  echo "Réponse de l'API:"
  echo "$RESPONSE" | jq .
  exit 1
fi

echo "✅ Gist créé avec succès !"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "📋 INFORMATIONS DU GIST"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "🔗 URL du Gist:"
echo "   $GIST_URL"
echo ""
echo "🆔 Gist ID:"
echo "   $GIST_ID"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "🎯 PROCHAINE ÉTAPE"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Ajoutez ce Gist ID dans les secrets GitHub:"
echo ""
echo "1. Allez sur:"
echo "   https://github.com/romain-38530/RT-Technologie/settings/secrets/actions"
echo ""
echo "2. Cliquez sur 'New repository secret'"
echo ""
echo "3. Ajoutez:"
echo "   Name:  DIAGNOSTIC_GIST_ID"
echo "   Value: $GIST_ID"
echo ""
echo "4. Cliquez sur 'Add secret'"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "✅ Configuration terminée !"
echo ""

# Sauvegarder l'ID pour référence
echo "$GIST_ID" > .gist-id
echo "📁 Gist ID sauvegardé dans .gist-id"
echo ""
