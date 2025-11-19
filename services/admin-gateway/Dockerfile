FROM node:20-alpine

WORKDIR /app

# Installer nodemon globalement pour le hot-reload
RUN npm install -g nodemon

# Créer la structure de dossiers
RUN mkdir -p packages/security packages/cloud-aws packages/entitlements packages/data-mongo services/admin-gateway

# Copier les packages workspace nécessaires
COPY packages/security ./packages/security
COPY packages/cloud-aws ./packages/cloud-aws
COPY packages/entitlements ./packages/entitlements
COPY packages/data-mongo ./packages/data-mongo

# Copier le service admin-gateway
COPY services/admin-gateway/package*.json ./services/admin-gateway/
WORKDIR /app/services/admin-gateway
RUN npm install

# Copier le code source du service
COPY services/admin-gateway/src ./src

# Exposer le port
EXPOSE 3001

# Démarrer avec nodemon pour le hot-reload
CMD ["nodemon", "--watch", "src", "src/server.js"]
