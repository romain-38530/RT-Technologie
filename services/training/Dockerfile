FROM node:20-alpine

WORKDIR /app

# Installer nodemon globalement pour le hot-reload
RUN npm install -g nodemon

# Copier package.json et installer TOUTES les dépendances (dev incluses)
COPY package*.json ./
RUN npm install

# Copier le code source
COPY . .

# Exposer le port
EXPOSE 3012

# Démarrer avec nodemon pour le hot-reload
CMD ["nodemon", "--watch", "src", "src/server.js"]
