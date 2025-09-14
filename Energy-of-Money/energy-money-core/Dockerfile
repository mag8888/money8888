# Простейший Dockerfile без сборки
FROM node:18-alpine

WORKDIR /app

# Копируем только package.json
COPY package*.json ./

# Копируем hello-world сервер
COPY server/hello-world.js ./

# Устанавливаем переменные окружения
ENV NODE_ENV=production
ENV PORT=8080

# Запускаем hello-world сервер
CMD ["node", "hello-world.js"]
