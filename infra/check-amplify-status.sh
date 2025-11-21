#!/bin/bash
# =============================================================================
# Script de vérification du statut AWS Amplify
# RT-Technologie
# =============================================================================

set -e

echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                           ║"
echo "║          🔍 VÉRIFICATION STATUT AWS AMPLIFY                              ║"
echo "║                                                                           ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Configuration AWS
AWS_REGION="${AWS_REGION:-eu-central-1}"

# Vérifier AWS CLI
echo "1️⃣  Vérification AWS CLI..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if ! command -v aws &> /dev/null; then
  echo "❌ AWS CLI non installé"
  exit 1
fi

AWS_VERSION=$(aws --version 2>&1)
echo "✅ AWS CLI installé: $AWS_VERSION"
echo ""

# Vérifier les credentials
echo "2️⃣  Vérification des credentials..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if ! aws sts get-caller-identity &> /dev/null; then
  echo "❌ Credentials AWS invalides"
  echo "Configurez avec: aws configure"
  exit 1
fi

AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text 2>/dev/null)
AWS_USER=$(aws sts get-caller-identity --query Arn --output text 2>/dev/null)
echo "✅ Credentials valides"
echo "   Compte: $AWS_ACCOUNT"
echo "   Utilisateur: $AWS_USER"
echo ""

# Lister les applications Amplify
echo "3️⃣  Recherche des applications Amplify..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

APPS=$(aws amplify list-apps \
  --region $AWS_REGION \
  --query 'apps[*].[name,appId,defaultDomain,createTime]' \
  --output text 2>&1)

if [[ "$APPS" == *"error"* ]] || [[ "$APPS" == *"Error"* ]]; then
  echo "❌ Erreur lors de la récupération des apps Amplify"
  echo ""
  echo "Erreur détaillée:"
  echo "$APPS"
  echo ""
  echo "Causes possibles:"
  echo "  1. Permissions IAM insuffisantes (amplify:ListApps)"
  echo "  2. Service Amplify non disponible dans cette région"
  echo "  3. Première utilisation du service"
  echo ""
  exit 1
fi

if [ -z "$APPS" ]; then
  echo "⚠️  Aucune application Amplify trouvée dans la région $AWS_REGION"
  echo ""
  echo "Applications recherchées:"
  echo "  • rt-backoffice-admin"
  echo "  • rt-marketing-site"
  echo ""
  echo "Vérifiez:"
  echo "  1. Le script setup-amplify-with-git.sh s'est bien exécuté sans erreur"
  echo "  2. Vous êtes dans la bonne région AWS: $AWS_REGION"
  echo "  3. Les permissions IAM incluent: amplify:CreateApp"
  echo ""
else
  echo "✅ Applications Amplify trouvées:"
  echo ""

  while IFS=$'\t' read -r name app_id domain create_time; do
    echo "  📱 $name"
    echo "     • App ID: $app_id"
    echo "     • Domaine: $domain"
    echo "     • Créée le: $create_time"
    echo ""

    # Vérifier les branches
    BRANCHES=$(aws amplify list-branches \
      --app-id "$app_id" \
      --region $AWS_REGION \
      --query 'branches[*].branchName' \
      --output text 2>/dev/null || echo "")

    if [ -n "$BRANCHES" ]; then
      echo "     Branches:"
      for branch in $BRANCHES; do
        BRANCH_URL="https://${branch}.${domain}"
        echo "       • $branch → $BRANCH_URL"

        # Vérifier le dernier build
        LAST_JOB=$(aws amplify list-jobs \
          --app-id "$app_id" \
          --branch-name "$branch" \
          --region $AWS_REGION \
          --max-results 1 \
          --query 'jobSummaries[0].[jobId,status,commitTime]' \
          --output text 2>/dev/null || echo "")

        if [ -n "$LAST_JOB" ]; then
          read -r job_id status commit_time <<< "$LAST_JOB"
          echo "         Dernier build: $status (Job: $job_id)"
        else
          echo "         Aucun build"
        fi
      done
      echo ""
    fi

    # URL de la console
    CONSOLE_URL="https://${AWS_REGION}.console.aws.amazon.com/amplify/home?region=${AWS_REGION}#/${app_id}"
    echo "     🔗 Console: $CONSOLE_URL"
    echo ""
  done <<< "$APPS"
fi

# Vérifier les fichiers de déploiement sauvegardés
echo "4️⃣  Recherche des fichiers de déploiement..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

DEPLOYMENT_FILES=$(ls -t ../amplify-deployments-*.txt 2>/dev/null || echo "")

if [ -n "$DEPLOYMENT_FILES" ]; then
  echo "✅ Fichiers de déploiement trouvés:"
  echo ""
  for file in $DEPLOYMENT_FILES; do
    echo "  📄 $(basename $file)"
    cat "$file"
    echo ""
  done
else
  echo "⚠️  Aucun fichier de déploiement trouvé"
  echo ""
fi

# Résumé
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RÉSUMÉ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -z "$APPS" ]; then
  echo "⚠️  Aucune application Amplify trouvée"
  echo ""
  echo "Pour créer les applications, lancez:"
  echo "  ./setup-amplify-with-git.sh"
  echo ""
else
  APP_COUNT=$(echo "$APPS" | wc -l)
  echo "✅ $APP_COUNT application(s) Amplify trouvée(s)"
  echo ""

  # Vérifier si on a les 2 apps attendues
  HAS_BACKOFFICE=$(echo "$APPS" | grep -c "rt-backoffice-admin" || true)
  HAS_MARKETING=$(echo "$APPS" | grep -c "rt-marketing-site" || true)

  if [ "$HAS_BACKOFFICE" -gt 0 ] && [ "$HAS_MARKETING" -gt 0 ]; then
    echo "✅ Les 2 applications attendues sont présentes"
  else
    echo "⚠️  Applications manquantes:"
    [ "$HAS_BACKOFFICE" -eq 0 ] && echo "  ❌ rt-backoffice-admin"
    [ "$HAS_MARKETING" -eq 0 ] && echo "  ❌ rt-marketing-site"
  fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
