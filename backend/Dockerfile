FROM node:20-alpine

WORKDIR /app

# Copia o package.json raiz (necessário para o link "file:..")
COPY package.json ./

# Copia e instala dependências do backend
COPY backend/package.json ./backend/
RUN npm install --prefix backend --omit=dev

# Copia o código
COPY backend ./backend

EXPOSE 3001

# Roda migrate (idempotente) e depois inicia o servidor
CMD sh -c "node backend/src/database/migrate.js && node backend/src/server.js"
