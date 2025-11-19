#!/bin/bash
#═══════════════════════════════════════════════════════════════════════════════
# DIAGNOSTIC DU BUILD AWS - Pourquoi le workflow GitHub Actions a échoué
#═══════════════════════════════════════════════════════════════════════════════

set -e

REGION="eu-central-1"
INSTANCE_ID="i-0ece63fb077366323"

echo "════════════════════════════════════════════════════════════════"
echo "🔍 DIAGNOSTIC DU BUILD AWS"
echo "════════════════════════════════════════════════════════════════"
echo ""

#═══════════════════════════════════════════════════════════════════════════════
# ÉTAPE 1: Vérifier les logs du build
#═══════════════════════════════════════════════════════════════════════════════

echo "📋 ÉTAPE 1/4: Vérification des logs de build..."
echo "════════════════════════════════════════════════════════════════"

CMD_ID=$(aws ssm send-command \
  --instance-ids $INSTANCE_ID \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "echo \"═══ LOGS DU DERNIER BUILD ═══\"",
    "tail -100 /home/ec2-user/deploy.log",
    "echo \"\"",
    "echo \"═══ PROCESSUS EN COURS ═══\"",
    "ps aux | grep -E \"(deploy-complete|docker)\" | grep -v grep || echo \"Aucun processus actif\"",
    "echo \"\"",
    "echo \"═══ FICHIERS DE LOG DISPONIBLES ═══\"",
    "ls -lh /tmp/build-*.log /tmp/push-*.log 2>/dev/null | head -20 || echo \"Aucun fichier de log détaillé\""
  ]' \
  --region $REGION \
  --output text \
  --query 'Command.CommandId')

sleep 10

echo "Résultat des logs :"
aws ssm get-command-invocation \
  --command-id $CMD_ID \
  --instance-id $INSTANCE_ID \
  --region $REGION \
  --query 'StandardOutputContent' \
  --output text

echo ""

#═══════════════════════════════════════════════════════════════════════════════
# ÉTAPE 2: Vérifier l'état des images dans ECR
#═══════════════════════════════════════════════════════════════════════════════

echo "🐳 ÉTAPE 2/4: Vérification des images dans ECR..."
echo "════════════════════════════════════════════════════════════════"

IMAGES_COUNT=0

for SERVICE in tms-sync erp-sync palette tracking-ia planning notifications admin-gateway authz training geo-tracking storage-market; do
  HAS_IMAGE=$(aws ecr describe-images \
    --repository-name rt-$SERVICE \
    --region $REGION \
    --query 'images[0].imageTags[0]' \
    --output text 2>/dev/null || echo "None")

  if [ "$HAS_IMAGE" = "latest" ]; then
    echo "  ✅ rt-$SERVICE"
    ((IMAGES_COUNT++))
  else
    echo "  ❌ rt-$SERVICE - MANQUANT"
  fi
done

echo ""
echo "📊 Résultat: $IMAGES_COUNT/11 images présentes dans ECR"
echo ""

#═══════════════════════════════════════════════════════════════════════════════
# ÉTAPE 3: Vérifier les erreurs de push spécifiques
#═══════════════════════════════════════════════════════════════════════════════

echo "🔍 ÉTAPE 3/4: Analyse des erreurs de push..."
echo "════════════════════════════════════════════════════════════════"

CMD_ID=$(aws ssm send-command \
  --instance-ids $INSTANCE_ID \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "echo \"═══ LOGS DE PUSH (premiers services) ═══\"",
    "for SERVICE in tms-sync erp-sync palette; do",
    "  if [ -f /tmp/push-$SERVICE.log ]; then",
    "    echo \"\"",
    "    echo \"--- $SERVICE ---\"",
    "    tail -20 /tmp/push-$SERVICE.log",
    "  fi",
    "done",
    "echo \"\"",
    "echo \"═══ IMAGES DOCKER LOCALES ═══\"",
    "docker images | grep rt- | wc -l",
    "docker images | grep rt- | head -15"
  ]' \
  --region $REGION \
  --output text \
  --query 'Command.CommandId')

sleep 10

echo "Résultat de l'analyse :"
aws ssm get-command-invocation \
  --command-id $CMD_ID \
  --instance-id $INSTANCE_ID \
  --region $REGION \
  --query 'StandardOutputContent' \
  --output text

echo ""

#═══════════════════════════════════════════════════════════════════════════════
# ÉTAPE 4: Recommandations
#═══════════════════════════════════════════════════════════════════════════════

echo "💡 ÉTAPE 4/4: Recommandations..."
echo "════════════════════════════════════════════════════════════════"
echo ""

if [ $IMAGES_COUNT -eq 0 ]; then
  echo "❌ PROBLÈME CRITIQUE : Aucune image dans ECR"
  echo ""
  echo "Causes possibles :"
  echo "  1. Le script deploy-complete.sh ne s'est pas lancé"
  echo "  2. Problème de permissions ECR"
  echo "  3. Problème de connexion Docker à ECR"
  echo ""
  echo "Actions à faire :"
  echo "  → Relancer le build avec le script RELANCE_BUILD_COMPLET.sh"

elif [ $IMAGES_COUNT -lt 11 ]; then
  echo "⚠️ PROBLÈME PARTIEL : $IMAGES_COUNT/11 images dans ECR"
  echo ""
  echo "Le build s'est arrêté en cours de route."
  echo ""
  echo "Actions à faire :"
  echo "  → Identifier quelle image a échoué dans les logs ci-dessus"
  echo "  → Corriger le problème spécifique"
  echo "  → Relancer le build"

else
  echo "✅ SUCCÈS : Toutes les images sont dans ECR"
  echo ""
  echo "Le problème vient probablement du timing du workflow GitHub."
  echo ""
  echo "Actions à faire :"
  echo "  → Relancer le workflow GitHub Actions manuellement"
  echo "  → Ou augmenter MAX_ATTEMPTS dans deploy-auto.yml"
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✅ DIAGNOSTIC TERMINÉ"
echo "════════════════════════════════════════════════════════════════"
