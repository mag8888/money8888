# Простейший Dockerfile без сборки
FROM node:18-alpine

WORKDIR /app

# Копируем только package.json
COPY package*.json ./

# Устанавливаем только необходимые зависимости
RUN npm install express

# Копируем сервер
COPY server/minimal-server.js ./

# Устанавливаем переменные окружения
ENV NODE_ENV=production
ENV PORT=8080

# Запускаем сервер
CMD ["node", "minimal-server.js"]
