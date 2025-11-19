FROM node:20-alpine

WORKDIR /app

# Installer nodemon globalement pour le hot-reload
RUN npm install -g nodemon

# Créer la structure de dossiers
RUN mkdir -p packages/notify-client packages/security services/authz

# Copier les packages workspace nécessaires
COPY packages/notify-client ./packages/notify-client
COPY packages/security ./packages/security

# Copier le service authz
COPY services/authz/package*.json ./services/authz/
WORKDIR /app/services/authz
RUN npm install

# Copier le code source du service
COPY services/authz/src ./src

# Exposer le port
EXPOSE 3002

# Démarrer avec nodemon pour le hot-reload
CMD ["nodemon", "--watch", "src", "src/server.js"]
