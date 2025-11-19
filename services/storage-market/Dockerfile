FROM node:20-alpine

WORKDIR /app

# Installer nodemon globalement pour le hot-reload
RUN npm install -g nodemon

# Créer la structure de dossiers
RUN mkdir -p packages/notify-client packages/security packages/entitlements packages/data-mongo services/storage-market

# Copier les packages workspace nécessaires
COPY packages/notify-client ./packages/notify-client
COPY packages/security ./packages/security
COPY packages/entitlements ./packages/entitlements
COPY packages/data-mongo ./packages/data-mongo

# Copier le service storage-market
COPY services/storage-market/package*.json ./services/storage-market/
WORKDIR /app/services/storage-market
RUN npm install

# Copier le code source du service
COPY services/storage-market/src ./src

# Exposer le port
EXPOSE 3015

# Démarrer avec nodemon pour le hot-reload
CMD ["nodemon", "--watch", "src", "src/server.js"]
