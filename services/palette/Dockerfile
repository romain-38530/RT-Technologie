FROM node:20-alpine

WORKDIR /app

# Installer nodemon globalement pour le hot-reload
RUN npm install -g nodemon

# Créer la structure de dossiers
RUN mkdir -p packages/security services/palette

# Copier les packages workspace nécessaires
COPY packages/security ./packages/security

# Copier le service palette
COPY services/palette/package*.json ./services/palette/
WORKDIR /app/services/palette
RUN npm install

# Copier le code source du service
COPY services/palette/src ./src

# Exposer le port
EXPOSE 3009

# Démarrer avec nodemon pour le hot-reload
CMD ["nodemon", "--watch", "src", "src/server.js"]
