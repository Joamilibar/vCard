FROM node:20-alpine

WORKDIR /app

# Instala dependencias primero (mejor cacheo de capas).
COPY package*.json ./
RUN npm install --omit=dev

# Copia el resto del código.
COPY . .

EXPOSE 3000

CMD ["node", "server/server.js"]
