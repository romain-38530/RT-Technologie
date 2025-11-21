#!/bin/bash
# =============================================================================
# Script de validation de la configuration AWS pour le déploiement frontend
# RT-Technologie
# =============================================================================

set -e

echo "========================================="
echo "🔍 Validation de la configuration AWS"
echo "========================================="
echo ""

ERRORS=0
WARNINGS=0

# Fonction pour afficher les erreurs
error() {
  echo "❌ ERREUR: $1"
  ERRORS=$((ERRORS + 1))
}

# Fonction pour afficher les warnings
warning() {
  echo "⚠️  WARNING: $1"
  WARNINGS=$((WARNINGS + 1))
}

# Fonction pour afficher les succès
success() {
  echo "✅ $1"
}

echo "1️⃣  Vérification AWS CLI..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if command -v aws &> /dev/null; then
  AWS_VERSION=$(aws --version 2>&1)
  success "AWS CLI installé: $AWS_VERSION"
else
  error "AWS CLI n'est pas installé. Installez-le avec:"
  echo "   Windows: msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi"
  echo "   macOS: brew install awscli"
  echo "   Linux: curl 'https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip' -o 'awscliv2.zip' && unzip awscliv2.zip && sudo ./aws/install"
fi
echo ""

echo "2️⃣  Vérification des credentials AWS..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if aws sts get-caller-identity &> /dev/null; then
  AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text 2>/dev/null)
  AWS_USER=$(aws sts get-caller-identity --query Arn --output text 2>/dev/null)
  AWS_REGION=$(aws configure get region 2>/dev/null || echo "non configurée")

  success "Credentials AWS valides"
  echo "   Compte: $AWS_ACCOUNT"
  echo "   Utilisateur/Rôle: $AWS_USER"
  echo "   Région: $AWS_REGION"

  if [ "$AWS_REGION" != "eu-central-1" ]; then
    warning "Région non optimale. Région recommandée: eu-central-1"
  fi
else
  error "Credentials AWS non configurés ou invalides"
  echo "   Configurez avec: aws configure"
fi
echo ""

echo "3️⃣  Vérification des permissions IAM..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test S3
if aws s3 ls &> /dev/null; then
  success "Permissions S3: OK"
else
  error "Permissions S3 manquantes (s3:ListAllMyBuckets)"
fi

# Test CloudFront
if aws cloudfront list-distributions &> /dev/null; then
  success "Permissions CloudFront: OK"
else
  warning "Permissions CloudFront limitées (cloudfront:ListDistributions)"
fi

# Test Amplify
if aws amplify list-apps --region ${AWS_REGION:-eu-central-1} &> /dev/null; then
  success "Permissions Amplify: OK"
else
  warning "Permissions Amplify limitées (amplify:ListApps)"
fi

# Test ECS
if aws ecs list-clusters --region ${AWS_REGION:-eu-central-1} &> /dev/null; then
  success "Permissions ECS: OK"
else
  warning "Permissions ECS limitées (ecs:ListClusters) - Récupération des IPs backend impossible"
fi

# Test EC2
if aws ec2 describe-network-interfaces --region ${AWS_REGION:-eu-central-1} --max-items 1 &> /dev/null; then
  success "Permissions EC2: OK"
else
  warning "Permissions EC2 limitées (ec2:DescribeNetworkInterfaces) - Récupération des IPs backend impossible"
fi

echo ""

echo "4️⃣  Vérification du cluster ECS..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
CLUSTER="rt-technologie-cluster"
CLUSTER_EXISTS=$(aws ecs describe-clusters \
  --clusters "$CLUSTER" \
  --region ${AWS_REGION:-eu-central-1} \
  --query 'clusters[0].status' \
  --output text 2>/dev/null || echo "")

if [ "$CLUSTER_EXISTS" == "ACTIVE" ]; then
  success "Cluster ECS trouvé: $CLUSTER"

  # Compter les services
  SERVICE_COUNT=$(aws ecs list-services \
    --cluster "$CLUSTER" \
    --region ${AWS_REGION:-eu-central-1} \
    --query 'length(serviceArns)' \
    --output text 2>/dev/null || echo "0")

  echo "   Services déployés: $SERVICE_COUNT"

  if [ "$SERVICE_COUNT" -lt "10" ]; then
    warning "Moins de 10 services backend déployés. Certains services peuvent être manquants."
  fi
else
  warning "Cluster ECS '$CLUSTER' non trouvé ou inactif"
  echo "   Les IPs des services backend ne pourront pas être récupérées automatiquement"
fi
echo ""

echo "5️⃣  Vérification de la structure du projet..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Vérifier les applications frontend
if [ -d "../apps/backoffice-admin" ]; then
  success "Application backoffice-admin trouvée"

  # Vérifier les fichiers nécessaires
  if [ -f "../apps/backoffice-admin/package.json" ]; then
    success "  ✓ package.json présent"
  else
    error "  ✗ package.json manquant"
  fi

  if [ -f "../apps/backoffice-admin/next.config.js" ]; then
    success "  ✓ next.config.js présent"
  else
    warning "  ✗ next.config.js manquant"
  fi

  if [ -f "../apps/backoffice-admin/amplify.yml" ]; then
    success "  ✓ amplify.yml présent"
  else
    warning "  ✗ amplify.yml manquant (requis pour Amplify Hosting)"
  fi
else
  error "Application backoffice-admin non trouvée dans apps/"
fi

if [ -d "../apps/marketing-site" ]; then
  success "Application marketing-site trouvée"

  # Vérifier les fichiers nécessaires
  if [ -f "../apps/marketing-site/package.json" ]; then
    success "  ✓ package.json présent"
  else
    error "  ✗ package.json manquant"
  fi

  if [ -f "../apps/marketing-site/next.config.js" ]; then
    success "  ✓ next.config.js présent"
  else
    warning "  ✗ next.config.js manquant"
  fi

  if [ -f "../apps/marketing-site/amplify.yml" ]; then
    success "  ✓ amplify.yml présent"
  else
    warning "  ✗ amplify.yml manquant (requis pour Amplify Hosting)"
  fi
else
  error "Application marketing-site non trouvée dans apps/"
fi

echo ""

echo "6️⃣  Vérification de Node.js et pnpm..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v node &> /dev/null; then
  NODE_VERSION=$(node --version)
  success "Node.js installé: $NODE_VERSION"

  # Vérifier la version
  NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1 | sed 's/v//')
  if [ "$NODE_MAJOR" -lt 18 ]; then
    warning "Version Node.js < 18. Version recommandée: 20+"
  fi
else
  error "Node.js n'est pas installé"
fi

if command -v pnpm &> /dev/null; then
  PNPM_VERSION=$(pnpm --version)
  success "pnpm installé: v$PNPM_VERSION"
else
  error "pnpm n'est pas installé. Installez-le avec: npm install -g pnpm"
fi

if command -v npm &> /dev/null; then
  NPM_VERSION=$(npm --version)
  success "npm installé: v$NPM_VERSION"
else
  warning "npm n'est pas installé"
fi

echo ""

echo "7️⃣  Vérification des scripts de déploiement..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "deploy-frontends-aws.sh" ]; then
  success "Script S3 + CloudFront trouvé"
  if [ -x "deploy-frontends-aws.sh" ]; then
    success "  ✓ Exécutable"
  else
    warning "  ✗ Non exécutable. Exécutez: chmod +x deploy-frontends-aws.sh"
  fi
else
  error "Script deploy-frontends-aws.sh manquant"
fi

if [ -f "deploy-frontends-aws-amplify.sh" ]; then
  success "Script AWS Amplify trouvé"
  if [ -x "deploy-frontends-aws-amplify.sh" ]; then
    success "  ✓ Exécutable"
  else
    warning "  ✗ Non exécutable. Exécutez: chmod +x deploy-frontends-aws-amplify.sh"
  fi
else
  error "Script deploy-frontends-aws-amplify.sh manquant"
fi

echo ""

echo "========================================="
echo "📊 RÉSUMÉ"
echo "========================================="
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo "✅ Tout est prêt pour le déploiement !"
  echo ""
  echo "Prochaines étapes:"
  echo "  1. Lancez le déploiement:"
  echo "     ./deploy-frontends-aws.sh"
  echo "     OU"
  echo "     ./deploy-frontends-aws-amplify.sh"
  echo ""
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo "⚠️  Configuration OK avec $WARNINGS warning(s)"
  echo ""
  echo "Vous pouvez procéder au déploiement, mais certaines fonctionnalités"
  echo "peuvent être limitées. Corrigez les warnings si possible."
  echo ""
  exit 0
else
  echo "❌ Configuration incomplète: $ERRORS erreur(s), $WARNINGS warning(s)"
  echo ""
  echo "Corrigez les erreurs avant de procéder au déploiement."
  echo ""
  echo "Ressources utiles:"
  echo "  - Configuration AWS CLI: aws configure"
  echo "  - Documentation: ../docs/DEPLOYMENT_AWS_FRONTEND.md"
  echo "  - Support: https://docs.aws.amazon.com/cli/"
  echo ""
  exit 1
fi
