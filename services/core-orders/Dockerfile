FROM node:20-alpine

WORKDIR /app

# Installer nodemon globalement pour le hot-reload
RUN npm install -g nodemon

# Créer la structure de dossiers
RUN mkdir -p packages/notify-client packages/security packages/entitlements packages/data-mongo services/core-orders

# Copier les packages workspace nécessaires
COPY packages/notify-client ./packages/notify-client
COPY packages/security ./packages/security
COPY packages/entitlements ./packages/entitlements
COPY packages/data-mongo ./packages/data-mongo

# Copier le service core-orders
COPY services/core-orders/package*.json ./services/core-orders/
WORKDIR /app/services/core-orders
RUN npm install

# Copier le code source du service
COPY services/core-orders/src ./src

# Exposer le port
EXPOSE 3007

# Démarrer avec nodemon pour le hot-reload
CMD ["nodemon", "--watch", "src", "src/server.js"]
