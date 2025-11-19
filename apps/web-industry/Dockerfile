FROM node:20-alpine

WORKDIR /app

# Installer les dépendances pnpm
RUN npm install -g pnpm

# Copier les fichiers de configuration workspace
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./

# Copier le code du package chatbot-widget (dépendance workspace)
COPY packages/chatbot-widget ./packages/chatbot-widget

# Copier les fichiers de l'app
COPY apps/web-industry ./apps/web-industry

# Installer toutes les dépendances
RUN pnpm install

# Se positionner dans le répertoire de l'app
WORKDIR /app/apps/web-industry

# Exposer le port Next.js par défaut
EXPOSE 3000

# Démarrer en mode développement
CMD ["pnpm", "dev"]
