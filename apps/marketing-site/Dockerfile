# =============================================================================
# Dockerfile - Marketing Site (Next.js)
# RT-Technologie
# =============================================================================

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Installer pnpm
RUN npm install -g pnpm@8.15.4

# Copier les fichiers de configuration du monorepo
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages ./packages
COPY apps/marketing-site/package.json ./apps/marketing-site/

# Installer les dépendances
RUN pnpm install --frozen-lockfile --filter @rt/marketing-site...

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Installer pnpm
RUN npm install -g pnpm@8.15.4

# Copier node_modules depuis deps
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/apps/marketing-site/node_modules ./apps/marketing-site/node_modules

# Copier le code source
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages ./packages
COPY apps/marketing-site ./apps/marketing-site

# Build l'application
WORKDIR /app/apps/marketing-site
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN pnpm build

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Créer un utilisateur non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copier les fichiers nécessaires
COPY --from=builder /app/apps/marketing-site/public ./apps/marketing-site/public
COPY --from=builder /app/apps/marketing-site/.next/standalone ./
COPY --from=builder /app/apps/marketing-site/.next/static ./apps/marketing-site/.next/static

# Changer ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Démarrer l'application
CMD ["node", "apps/marketing-site/server.js"]
