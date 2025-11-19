FROM node:20-alpine

WORKDIR /app

# Installer nodemon globalement pour le hot-reload
RUN npm install -g nodemon

# Créer la structure de dossiers
RUN mkdir -p packages/notify-client packages/security packages/data-mongo services/planning

# Copier les packages workspace nécessaires
COPY packages/notify-client ./packages/notify-client
COPY packages/security ./packages/security
COPY packages/data-mongo ./packages/data-mongo

# Copier le service planning
COPY services/planning/package*.json ./services/planning/
WORKDIR /app/services/planning
RUN npm install

# Copier le code source du service
COPY services/planning/src ./src

# Exposer le port
EXPOSE 3005

# Démarrer avec nodemon pour le hot-reload
CMD ["nodemon", "--watch", "src", "src/server.js"]
