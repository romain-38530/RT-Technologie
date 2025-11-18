# RT Technologie — Dockerfile de base (dev / démo)
# Utilise pnpm/turbo pour lancer les services via `pnpm dev` (ou `pnpm --filter ... run dev`).

FROM node:20-bullseye

ENV PNPM_HOME=/usr/local/share/pnpm
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /app

# Copie des manifestes pour l'installation des dépendances
COPY package.json pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY packages ./packages
COPY services ./services
COPY apps ./apps
COPY infra ./infra
COPY docs ./docs
COPY .env.example .env

# Installation des dépendances (utilise pnpm via corepack)
RUN corepack enable \
 && pnpm install --frozen-lockfile --prefer-offline || pnpm install

# Ports standards de l'écosystème (tous les services backend)
EXPOSE 3000 3001 3002 3003 3004 3005 3006 3007 3008 3009 3011 3012 3013 3014 3015 3016 3017 3018 3019 3020

# Par défaut, lance le mode dev (toutes les apps/services définis dans turbo)
CMD ["pnpm", "dev"]
