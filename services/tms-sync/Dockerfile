FROM node:20-alpine

WORKDIR /app

# Installer nodemon globalement pour le hot-reload
RUN npm install -g nodemon

# Créer la structure de dossiers
RUN mkdir -p packages/security services/tms-sync

# Copier les packages workspace nécessaires
COPY packages/security ./packages/security

# Copier le service tms-sync
COPY services/tms-sync/package*.json ./services/tms-sync/
WORKDIR /app/services/tms-sync
RUN npm install

# Copier le code source du service
COPY services/tms-sync/src ./src

# Exposer le port
EXPOSE 3006

# Démarrer avec nodemon pour le hot-reload
CMD ["nodemon", "--watch", "src", "src/server.js"]
