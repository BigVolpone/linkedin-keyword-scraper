# Étape 1 : base image
FROM node:18

# Étape 2 : create app directory
WORKDIR /app

# Étape 3 : copy all files
COPY . .

# Étape 4 : install dependencies
RUN npm install

# Étape 5 : lancer le serveur
CMD ["node", "server.js"]
