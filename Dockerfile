# Utilise l’image officielle Playwright avec tout déjà installé
FROM mcr.microsoft.com/playwright:v1.52.0-jammy

# Crée le dossier de l’app
WORKDIR /app

# Copie tous les fichiers du repo
COPY . .

# Installe les dépendances (package.json)
RUN npm install

# Démarre ton app
CMD ["npm", "start"]
