# Простейший Dockerfile без сборки
FROM node:18-alpine

WORKDIR /app

# Копируем только package.json
COPY package*.json ./

# Копируем ультра-простой сервер
COPY server/ultra-simple-server.js ./

# Устанавливаем переменные окружения
ENV NODE_ENV=production
ENV PORT=8080

# Запускаем ультра-простой сервер
CMD ["node", "ultra-simple-server.js"]
