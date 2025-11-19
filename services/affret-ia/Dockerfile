FROM node:20-alpine

WORKDIR /app

# Installer nodemon globalement pour le hot-reload
RUN npm install -g nodemon

# Créer la structure de dossiers
RUN mkdir -p packages/ai-client packages/security packages/data-mongo services/affret-ia

# Copier les packages workspace nécessaires
COPY packages/ai-client ./packages/ai-client
COPY packages/security ./packages/security
COPY packages/data-mongo ./packages/data-mongo

# Copier le service affret-ia
COPY services/affret-ia/package*.json ./services/affret-ia/
WORKDIR /app/services/affret-ia
RUN npm install

# Copier le code source du service
COPY services/affret-ia/src ./src

# Exposer le port
EXPOSE 3010

# Démarrer avec nodemon pour le hot-reload
CMD ["nodemon", "--watch", "src", "src/server.js"]
