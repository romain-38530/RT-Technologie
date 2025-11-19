# =============================================================================
# Dockerfile - Service bourse
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
COPY services/bourse ./services/bourse

# Installer toutes les dépendances (packages partagés inclus)
RUN pnpm install --frozen-lockfile --filter @rt/service-bourse... || pnpm install --filter @rt/service-bourse...

# Stage 2: Production
FROM node:20-alpine

# Métadonnées
LABEL maintainer="RT Technologie <contact@rt-technologie.com>"
LABEL description="Service bourse"
LABEL version="1.0.0"

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3080

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copier node_modules et le code depuis le builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/packages ./packages
COPY --from=builder --chown=nodejs:nodejs /app/services/bourse ./services/bourse
COPY --chown=nodejs:nodejs infra/seeds ./infra/seeds

# Créer les dossiers nécessaires
RUN mkdir -p logs && chown -R nodejs:nodejs logs

# Passer à l'utilisateur non-root
USER nodejs

# Exposer le port
EXPOSE 3080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Démarrer l'application
CMD ["node", "services/bourse/src/server.js"]
