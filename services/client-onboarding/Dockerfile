# =============================================================================
# Dockerfile - Service Client Onboarding
# RT-Technologie
# =============================================================================

# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Stage 2: Production
FROM node:20-alpine

# Métadonnées
LABEL maintainer="RT Technologie <contact@rt-technologie.com>"
LABEL description="Service d'onboarding client avec vérification TVA automatique"
LABEL version="1.0.0"

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3020

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copier node_modules depuis le builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copier le code source
COPY --chown=nodejs:nodejs src ./src
COPY --chown=nodejs:nodejs package*.json ./

# Créer les dossiers nécessaires
RUN mkdir -p logs tests/output && \
    chown -R nodejs:nodejs logs tests

# Passer à l'utilisateur non-root
USER nodejs

# Exposer le port
EXPOSE 3020

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3020/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Démarrer l'application
CMD ["node", "src/server.js"]
