#!/bin/bash
# =============================================================================
# Script pour créer tous les Dockerfiles manquants
# RT-Technologie
# =============================================================================

set -e

echo "🔧 Création des Dockerfiles manquants..."
echo ""

# Liste des services qui n'ont pas encore de Dockerfile
SERVICES=(
  "notifications:3050"
  "authz:3007"
  "admin-gateway:3008"
  "pricing-grids:3060"
  "planning:3070"
  "bourse:3080"
  "palette:3090"
  "wms-sync:3100"
  "erp-sync:3110"
  "tms-sync:3120"
  "tracking-ia:3130"
  "chatbot:3140"
  "geo-tracking:3150"
  "ecpmr:3160"
)

# Fonction pour créer un Dockerfile
create_dockerfile() {
  local SERVICE_NAME=$1
  local PORT=$2
  local SERVICE_DIR="services/$SERVICE_NAME"

  if [ -f "$SERVICE_DIR/Dockerfile" ]; then
    echo "  ⏭  $SERVICE_NAME - Dockerfile existe déjà"
    return
  fi

  echo "  → Création Dockerfile pour $SERVICE_NAME (port $PORT)"

  cat > "$SERVICE_DIR/Dockerfile" <<EOF
# =============================================================================
# Dockerfile - Service $SERVICE_NAME
# RT-Technologie
# =============================================================================

# Stage 1: Builder - Construit le monorepo complet
FROM node:20-alpine AS builder

WORKDIR /app

# Installer pnpm
RUN npm install -g pnpm@8.15.4

# Copier les fichiers de configuration du monorepo
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages ./packages
COPY services/$SERVICE_NAME ./services/$SERVICE_NAME

# Installer toutes les dépendances (packages partagés inclus)
RUN pnpm install --frozen-lockfile --filter @rt/service-$SERVICE_NAME... || pnpm install --filter @rt/service-$SERVICE_NAME...

# Stage 2: Production
FROM node:20-alpine

# Métadonnées
LABEL maintainer="RT Technologie <contact@rt-technologie.com>"
LABEL description="Service $SERVICE_NAME"
LABEL version="1.0.0"

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=$PORT

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && \\
    adduser -S nodejs -u 1001

WORKDIR /app

# Copier node_modules et le code depuis le builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/packages ./packages
COPY --from=builder --chown=nodejs:nodejs /app/services/$SERVICE_NAME ./services/$SERVICE_NAME
COPY --chown=nodejs:nodejs infra/seeds ./infra/seeds

# Créer les dossiers nécessaires
RUN mkdir -p logs && chown -R nodejs:nodejs logs

# Passer à l'utilisateur non-root
USER nodejs

# Exposer le port
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \\
  CMD node -e "require('http').get('http://localhost:$PORT/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Démarrer l'application
CMD ["node", "services/$SERVICE_NAME/src/server.js"]
EOF

  echo "    ✓ Dockerfile créé"
}

# Créer tous les Dockerfiles
for service_info in "${SERVICES[@]}"; do
  SERVICE_NAME="${service_info%:*}"
  PORT="${service_info#*:}"
  create_dockerfile "$SERVICE_NAME" "$PORT"
done

echo ""
echo "✅ Tous les Dockerfiles ont été créés"
echo ""
echo "📝 Services avec Dockerfile:"
ls -1 services/*/Dockerfile | wc -l
echo ""
