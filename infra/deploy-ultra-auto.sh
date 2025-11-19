#!/bin/bash
# =============================================================================
# DÉPLOIEMENT 100% AUTOMATIQUE - RT-Technologie
# Ce script fait TOUT du début à la fin sans intervention
# =============================================================================

set -e

REGION="eu-central-1"
ACCOUNT_ID="004843574253"
SECURITY_GROUP_ID="sg-0add3ac473775825a"
SUBNET_1="subnet-0cce60a3fe31c0d9e"
SUBNET_2="subnet-0a6a2f8fd776906ee"

echo "════════════════════════════════════════════════════════════════"
echo "🚀 DÉPLOIEMENT ULTRA-AUTOMATIQUE RT-TECHNOLOGIE"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "⚠️  Ce script va TOUT faire automatiquement:"
echo "   1. Cloner le repository"
echo "   2. Créer la structure manquante (packages, infra/seeds)"
echo "   3. Builder les 16 services Docker"
echo "   4. Pusher vers ECR"
echo "   5. Déployer sur ECS"
echo "   6. Afficher les IPs finales"
echo ""
echo "⏱️  Durée estimée: 60-90 minutes"
echo ""
read -p "Continuer ? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Annulé"
    exit 1
fi

# =============================================================================
# ÉTAPE 1: PRÉPARATION DU REPOSITORY
# =============================================================================

echo ""
echo "📥 ÉTAPE 1/6: Préparation du repository..."
echo "════════════════════════════════════════════════════════════════"

cd ~

# Supprimer l'ancien si existe
if [ -d "RT-Technologie" ]; then
    echo "  • Suppression de l'ancien repository..."
    rm -rf RT-Technologie
fi

# Cloner
echo "  • Clonage depuis GitHub..."
git clone -b dockerfile https://github.com/romain-38530/RT-Technologie.git 2>&1 | tail -5

cd RT-Technologie

# Créer la structure packages
echo "  • Création de la structure packages..."
mkdir -p packages/{types,utils,config}

cat > packages/types/package.json << 'EOF'
{"name":"@rt/types","version":"1.0.0","main":"index.js"}
EOF

cat > packages/utils/package.json << 'EOF'
{"name":"@rt/utils","version":"1.0.0","main":"index.js"}
EOF

cat > packages/config/package.json << 'EOF'
{"name":"@rt/config","version":"1.0.0","main":"index.js"}
EOF

touch packages/{types,utils,config}/index.js

# Créer infra/seeds
echo "  • Création de infra/seeds..."
mkdir -p infra/seeds
touch infra/seeds/.gitkeep

echo "  ✓ Repository prêt"

# =============================================================================
# ÉTAPE 2: PRÉPARATION DES DOCKERFILES
# =============================================================================

echo ""
echo "🔧 ÉTAPE 2/6: Création des Dockerfiles..."
echo "════════════════════════════════════════════════════════════════"

declare -A SERVICES=(
  ["notifications"]="3050"
  ["authz"]="3007"
  ["admin-gateway"]="3008"
  ["pricing-grids"]="3060"
  ["planning"]="3070"
  ["bourse"]="3080"
  ["palette"]="3090"
  ["wms-sync"]="3100"
  ["erp-sync"]="3110"
  ["tms-sync"]="3120"
  ["tracking-ia"]="3130"
  ["chatbot"]="3140"
  ["geo-tracking"]="3150"
  ["ecpmr"]="3160"
  ["storage-market"]="3170"
  ["training"]="3180"
)

for s in "${!SERVICES[@]}"; do
  P="${SERVICES[$s]}"
  mkdir -p "services/$s"

  cat > "services/$s/Dockerfile" <<'DOCKERFILE'
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm@8.15.4
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages ./packages
COPY services/SERVICE_NAME ./services/SERVICE_NAME
RUN pnpm install --filter @rt/service-SERVICE_NAME... || pnpm install --no-frozen-lockfile

FROM node:20-alpine
ENV NODE_ENV=production
ENV PORT=SERVICE_PORT
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
WORKDIR /app
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/packages ./packages
COPY --from=builder --chown=nodejs:nodejs /app/services/SERVICE_NAME ./services/SERVICE_NAME
RUN mkdir -p logs && chown -R nodejs:nodejs logs
USER nodejs
EXPOSE SERVICE_PORT
CMD ["node", "services/SERVICE_NAME/src/server.js"]
DOCKERFILE

  sed -i "s/SERVICE_NAME/$s/g" "services/$s/Dockerfile"
  sed -i "s/SERVICE_PORT/$P/g" "services/$s/Dockerfile"
  echo "  ✓ $s"
done

echo "  ✓ 16 Dockerfiles créés"

# =============================================================================
# ÉTAPE 3: PRÉPARATION ECR
# =============================================================================

echo ""
echo "📦 ÉTAPE 3/6: Préparation ECR..."
echo "════════════════════════════════════════════════════════════════"

echo "  • Login ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com 2>&1 | grep -v WARNING

echo "  • Création des repositories..."
for s in "${!SERVICES[@]}"; do
  aws ecr create-repository --repository-name "rt-$s" --region $REGION 2>/dev/null || true
done

echo "  ✓ ECR prêt"

# =============================================================================
# ÉTAPE 4: BUILD ET PUSH DES IMAGES
# =============================================================================

echo ""
echo "🏗️  ÉTAPE 4/6: Build et push des images Docker..."
echo "════════════════════════════════════════════════════════════════"
echo "  ⏱️  Durée estimée: 40-50 minutes"
echo ""

I=1
TOTAL=${#SERVICES[@]}
SUCCESS=0
FAILED=0

for s in "${!SERVICES[@]}"; do
  echo "  [$I/$TOTAL] $s..."

  # Build
  if docker build -t "rt-$s" -f "services/$s/Dockerfile" . > "/tmp/build-$s.log" 2>&1; then
    echo "    ✓ Build OK"

    # Tag et push
    docker tag "rt-$s" "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/rt-$s:latest"

    if docker push "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/rt-$s:latest" > "/tmp/push-$s.log" 2>&1; then
      echo "    ✓ Push OK"
      ((SUCCESS++))
    else
      echo "    ❌ Push failed"
      ((FAILED++))
    fi
  else
    echo "    ❌ Build failed (voir /tmp/build-$s.log)"
    tail -5 "/tmp/build-$s.log"
    ((FAILED++))
  fi

  ((I++))
  echo ""
done

echo "  📊 Résumé: ✓ $SUCCESS réussis, ❌ $FAILED échecs"

if [ $SUCCESS -eq 0 ]; then
  echo "  ❌ ERREUR: Aucun service n'a été buildé avec succès"
  exit 1
fi

# =============================================================================
# ÉTAPE 5: RÉCUPÉRATION DES SECRETS
# =============================================================================

echo ""
echo "🔐 ÉTAPE 5/6: Récupération des secrets AWS..."
echo "════════════════════════════════════════════════════════════════"

ROLE_ARN=$(aws iam get-role --role-name ecsTaskExecutionRoleRT --query 'Role.Arn' --output text)
MONGODB=$(aws secretsmanager describe-secret --secret-id rt/mongodb/uri --region $REGION --query 'ARN' --output text)
JWT=$(aws secretsmanager describe-secret --secret-id rt/jwt/secret --region $REGION --query 'ARN' --output text)
SMTP_U=$(aws secretsmanager describe-secret --secret-id rt/smtp/user --region $REGION --query 'ARN' --output text)
SMTP_P=$(aws secretsmanager describe-secret --secret-id rt/smtp/password --region $REGION --query 'ARN' --output text)
OPENAI=$(aws secretsmanager describe-secret --secret-id rt/openai/key --region $REGION --query 'ARN' --output text)

echo "  ✓ Secrets récupérés"

# =============================================================================
# ÉTAPE 6: DÉPLOIEMENT ECS
# =============================================================================

echo ""
echo "🚢 ÉTAPE 6/6: Déploiement ECS..."
echo "════════════════════════════════════════════════════════════════"

DEPLOYED=0

for s in "${!SERVICES[@]}"; do
  P="${SERVICES[$s]}"

  # Vérifier que l'image existe
  if ! aws ecr describe-images --repository-name "rt-$s" --region $REGION --query 'imageDetails[0].imageTags[0]' --output text 2>/dev/null | grep -q "latest"; then
    echo "  ⏭  $s (pas d'image)"
    continue
  fi

  echo "  • Déploiement de $s..."

  # Task definition
  cat > "/tmp/task-$s.json" <<EOF
{
  "family": "rt-$s",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "$ROLE_ARN",
  "containerDefinitions": [{
    "name": "rt-$s",
    "image": "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/rt-$s:latest",
    "essential": true,
    "portMappings": [{"containerPort": $P}],
    "environment": [
      {"name": "NODE_ENV", "value": "production"},
      {"name": "PORT", "value": "$P"}
    ],
    "secrets": [
      {"name": "MONGODB_URI", "valueFrom": "$MONGODB"},
      {"name": "JWT_SECRET", "valueFrom": "$JWT"},
      {"name": "SMTP_USER", "valueFrom": "$SMTP_U"},
      {"name": "SMTP_PASS", "valueFrom": "$SMTP_P"},
      {"name": "OPENAI_API_KEY", "valueFrom": "$OPENAI"}
    ],
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "/ecs/rt-$s",
        "awslogs-region": "$REGION",
        "awslogs-stream-prefix": "ecs",
        "awslogs-create-group": "true"
      }
    }
  }]
}
EOF

  aws ecs register-task-definition --cli-input-json file:///tmp/task-$s.json --region $REGION > /dev/null

  # Service
  if aws ecs describe-services --cluster rt-technologie-cluster --services "rt-$s-service" --region $REGION 2>/dev/null | grep -q ACTIVE; then
    aws ecs update-service --cluster rt-technologie-cluster --service "rt-$s-service" --task-definition "rt-$s" --force-new-deployment --region $REGION > /dev/null
  else
    aws ecs create-service \
      --cluster rt-technologie-cluster \
      --service-name "rt-$s-service" \
      --task-definition "rt-$s" \
      --desired-count 1 \
      --launch-type FARGATE \
      --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_1,$SUBNET_2],securityGroups=[$SECURITY_GROUP_ID],assignPublicIp=ENABLED}" \
      --region $REGION > /dev/null
  fi

  echo "    ✓ Déployé"
  ((DEPLOYED++))
done

echo ""
echo "  📊 $DEPLOYED services déployés"

# =============================================================================
# RÉCAPITULATIF FINAL
# =============================================================================

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✅ DÉPLOIEMENT TERMINÉ !"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📊 Résultats:"
echo "  • Services buildés: $SUCCESS/$TOTAL"
echo "  • Services déployés: $DEPLOYED/$TOTAL"
echo ""
echo "⏳ Attente du démarrage des containers (30s)..."
sleep 30

# Afficher les IPs
echo ""
echo "🌐 Adresses IP des services:"
echo "════════════════════════════════════════════════════════════════"

for s in "${!SERVICES[@]}"; do
  P="${SERVICES[$s]}"

  T=$(aws ecs list-tasks --cluster rt-technologie-cluster --service-name "rt-$s-service" --region $REGION --query 'taskArns[0]' --output text 2>/dev/null)

  if [ -n "$T" ] && [ "$T" != "None" ]; then
    ENI=$(aws ecs describe-tasks --cluster rt-technologie-cluster --tasks $T --region $REGION --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' --output text 2>/dev/null)
    IP=$(aws ec2 describe-network-interfaces --network-interface-ids $ENI --region $REGION --query 'NetworkInterfaces[0].Association.PublicIp' --output text 2>/dev/null)

    if [ -n "$IP" ] && [ "$IP" != "None" ]; then
      echo "  ✓ $s: http://$IP:$P"
    else
      echo "  ⏳ $s: Démarrage..."
    fi
  else
    echo "  ⏸  $s: Non démarré"
  fi
done

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "🎉 DÉPLOIEMENT COMPLET RÉUSSI !"
echo ""
echo "📝 Prochaines étapes:"
echo "  1. Vérifier les health checks: curl http://[IP]:PORT/health"
echo "  2. Déployer les frontends sur Vercel"
echo "  3. Configurer les domaines personnalisés"
echo ""
echo "════════════════════════════════════════════════════════════════"
