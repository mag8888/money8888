# Простейший Dockerfile без сборки
FROM node:18-alpine

WORKDIR /app

# Копируем только package.json
COPY package*.json ./

# Копируем корневой index.js
COPY index.js ./

# Устанавливаем переменные окружения
ENV NODE_ENV=production
ENV PORT=8080

# Запускаем корневой сервер
CMD ["node", "index.js"]
