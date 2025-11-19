FROM node:20-alpine

WORKDIR /app

# Installer nodemon globalement pour le hot-reload
RUN npm install -g nodemon

# Créer la structure de dossiers
RUN mkdir -p packages/security packages/cloud-aws packages/data-mongo services/ecpmr

# Copier les packages workspace nécessaires
COPY packages/security ./packages/security
COPY packages/cloud-aws ./packages/cloud-aws
COPY packages/data-mongo ./packages/data-mongo

# Copier le service ecpmr
COPY services/ecpmr/package*.json ./services/ecpmr/
WORKDIR /app/services/ecpmr
RUN npm install

# Copier le code source du service
COPY services/ecpmr/src ./src

# Exposer le port
EXPOSE 3014

# Démarrer avec nodemon pour le hot-reload
CMD ["nodemon", "--watch", "src", "src/server.js"]
