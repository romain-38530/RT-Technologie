FROM node:20-alpine

WORKDIR /app

# Installer nodemon globalement pour le hot-reload
RUN npm install -g nodemon

# Créer la structure de dossiers
RUN mkdir -p packages/security packages/data-mongo services/chatbot

# Copier les packages workspace nécessaires
COPY packages/security ./packages/security
COPY packages/data-mongo ./packages/data-mongo

# Copier le service chatbot
COPY services/chatbot/package*.json ./services/chatbot/
WORKDIR /app/services/chatbot
RUN npm install

# Copier le code source du service
COPY services/chatbot/src ./src

# Exposer le port
EXPOSE 3019

# Démarrer avec nodemon pour le hot-reload
CMD ["nodemon", "--watch", "src", "src/server.js"]
