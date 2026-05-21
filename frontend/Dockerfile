FROM node:20-alpine

WORKDIR /app

# Copia o package.json raiz (necessário para o link "file:..")
COPY package.json ./

# Copia e instala dependências do frontend
COPY frontend/package.json ./frontend/
RUN npm install --prefix frontend

# Copia o código
COPY frontend ./frontend

EXPOSE 5173

CMD ["npm", "run", "dev", "--prefix", "frontend", "--", "--host", "0.0.0.0"]
