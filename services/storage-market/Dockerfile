FROM node:20-alpine

WORKDIR /app

# Copier package.json et installer les dépendances
COPY package*.json ./
RUN npm install --production

# Copier le code source
COPY src ./src

EXPOSE 3013

CMD ["npm", "start"]
