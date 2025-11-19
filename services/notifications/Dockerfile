FROM node:20-alpine

WORKDIR /app

# Installer nodemon globalement pour le hot-reload
RUN npm install -g nodemon

# Créer la structure de dossiers
RUN mkdir -p packages/comm-templates packages/ai-client packages/security packages/cloud-aws services/notifications

# Copier les packages workspace nécessaires
COPY packages/comm-templates ./packages/comm-templates
COPY packages/ai-client ./packages/ai-client
COPY packages/security ./packages/security
COPY packages/cloud-aws ./packages/cloud-aws

# Copier le service notifications
COPY services/notifications/package*.json ./services/notifications/
WORKDIR /app/services/notifications
RUN npm install

# Copier le code source du service
COPY services/notifications/src ./src

# Exposer le port
EXPOSE 3004

# Démarrer avec nodemon pour le hot-reload
CMD ["nodemon", "--watch", "src", "src/server.js"]
