FROM node:20-alpine

WORKDIR /app

# Installer nodemon globalement pour le hot-reload
RUN npm install -g nodemon

# Créer la structure de dossiers
RUN mkdir -p packages/vat-client packages/security packages/data-mongo services/vigilance

# Copier les packages workspace nécessaires
COPY packages/vat-client ./packages/vat-client
COPY packages/security ./packages/security
COPY packages/data-mongo ./packages/data-mongo

# Copier le service vigilance
COPY services/vigilance/package*.json ./services/vigilance/
WORKDIR /app/services/vigilance
RUN npm install

# Copier le code source du service
COPY services/vigilance/src ./src

# Exposer le port
EXPOSE 3008

# Démarrer avec nodemon pour le hot-reload
CMD ["nodemon", "--watch", "src", "src/server.js"]
