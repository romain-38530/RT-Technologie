#!/bin/bash
# =============================================================================
# Script de vérification des permissions AWS Amplify
# RT-Technologie
# =============================================================================

set -e

echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                           ║"
echo "║          🔐 VÉRIFICATION PERMISSIONS AWS AMPLIFY                         ║"
echo "║                                                                           ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo ""

AWS_REGION="${AWS_REGION:-eu-central-1}"

# Obtenir les informations de l'utilisateur
echo "1️⃣  Informations utilisateur..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

CALLER_INFO=$(aws sts get-caller-identity --output json)
USER_ARN=$(echo "$CALLER_INFO" | grep -o '"Arn": "[^"]*' | cut -d'"' -f4)
ACCOUNT_ID=$(echo "$CALLER_INFO" | grep -o '"Account": "[^"]*' | cut -d'"' -f4)

echo "✅ Compte AWS: $ACCOUNT_ID"
echo "✅ Utilisateur: $USER_ARN"
echo ""

# Extraire le nom d'utilisateur de l'ARN
if [[ "$USER_ARN" == *"assumed-role"* ]]; then
  echo "ℹ️  Vous utilisez un rôle IAM (assumed-role)"
  ENTITY_TYPE="role"
  ENTITY_NAME=$(echo "$USER_ARN" | cut -d'/' -f2)
elif [[ "$USER_ARN" == *":user/"* ]]; then
  echo "ℹ️  Vous utilisez un utilisateur IAM"
  ENTITY_TYPE="user"
  ENTITY_NAME=$(echo "$USER_ARN" | cut -d'/' -f2)
else
  echo "⚠️  Type d'identité non reconnu"
  ENTITY_TYPE="unknown"
fi
echo ""

# Test des permissions Amplify
echo "2️⃣  Test des permissions Amplify..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

PERMISSIONS_OK=true

# Test 1: amplify:ListApps
echo -n "Test amplify:ListApps... "
if aws amplify list-apps --region "$AWS_REGION" &> /dev/null; then
  echo "✅"
else
  echo "❌"
  PERMISSIONS_OK=false
fi

# Test 2: amplify:CreateApp (simulation via IAM)
if [ "$ENTITY_TYPE" == "user" ]; then
  echo -n "Test amplify:CreateApp... "

  SIMULATE_RESULT=$(aws iam simulate-principal-policy \
    --policy-source-arn "$USER_ARN" \
    --action-names amplify:CreateApp \
    --query 'EvaluationResults[0].EvalDecision' \
    --output text 2>/dev/null || echo "error")

  if [ "$SIMULATE_RESULT" == "allowed" ]; then
    echo "✅"
  else
    echo "❌ ($SIMULATE_RESULT)"
    PERMISSIONS_OK=false
  fi
fi

# Test 3: ECS permissions (pour récupérer les IPs backend)
echo -n "Test ecs:ListTasks... "
if aws ecs list-tasks --cluster rt-technologie-cluster --region "$AWS_REGION" &> /dev/null; then
  echo "✅"
else
  echo "❌"
  PERMISSIONS_OK=false
fi

echo -n "Test ec2:DescribeNetworkInterfaces... "
if aws ec2 describe-network-interfaces --region "$AWS_REGION" --max-items 1 &> /dev/null; then
  echo "✅"
else
  echo "❌"
  PERMISSIONS_OK=false
fi

echo ""

# Lister les politiques attachées
if [ "$ENTITY_TYPE" == "user" ]; then
  echo "3️⃣  Politiques IAM attachées..."
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  # Politiques gérées attachées
  ATTACHED_POLICIES=$(aws iam list-attached-user-policies \
    --user-name "$ENTITY_NAME" \
    --query 'AttachedPolicies[*].PolicyName' \
    --output text 2>/dev/null || echo "")

  if [ -n "$ATTACHED_POLICIES" ]; then
    echo "Politiques gérées AWS:"
    for policy in $ATTACHED_POLICIES; do
      echo "  • $policy"
    done
  else
    echo "⚠️  Aucune politique gérée attachée"
  fi

  # Politiques inline
  INLINE_POLICIES=$(aws iam list-user-policies \
    --user-name "$ENTITY_NAME" \
    --query 'PolicyNames' \
    --output text 2>/dev/null || echo "")

  if [ -n "$INLINE_POLICIES" ]; then
    echo ""
    echo "Politiques inline:"
    for policy in $INLINE_POLICIES; do
      echo "  • $policy"
    done
  fi

  # Groupes
  GROUPS=$(aws iam list-groups-for-user \
    --user-name "$ENTITY_NAME" \
    --query 'Groups[*].GroupName' \
    --output text 2>/dev/null || echo "")

  if [ -n "$GROUPS" ]; then
    echo ""
    echo "Groupes:"
    for group in $GROUPS; do
      echo "  • $group"
    done
  fi

  echo ""
fi

# Résumé et recommandations
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RÉSUMÉ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$PERMISSIONS_OK" = true ]; then
  echo "✅ Toutes les permissions nécessaires sont présentes !"
  echo ""
  echo "Vous pouvez lancer le déploiement:"
  echo "  ./setup-amplify-with-git.sh"
else
  echo "❌ Certaines permissions sont manquantes"
  echo ""
  echo "🔧 SOLUTION:"
  echo ""
  echo "Option 1 - Attacher la politique AWS gérée (Recommandé):"
  echo ""
  if [ "$ENTITY_TYPE" == "user" ]; then
    echo "  aws iam attach-user-policy \\"
    echo "    --user-name \"$ENTITY_NAME\" \\"
    echo "    --policy-arn arn:aws:iam::aws:policy/AdministratorAccess-Amplify"
  fi
  echo ""
  echo "Option 2 - Créer une politique personnalisée:"
  echo "  Voir: infra/GUIDE_AMPLIFY_SETUP.md (section Permissions)"
  echo ""
  echo "Option 3 - Demander à votre administrateur AWS d'ajouter les permissions:"
  echo "  • amplify:* (toutes les actions Amplify)"
  echo "  • ecs:ListTasks, ecs:DescribeTasks"
  echo "  • ec2:DescribeNetworkInterfaces"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
