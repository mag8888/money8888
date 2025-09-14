FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY index.js ./
COPY public/ ./public/

EXPOSE 8080

ENV NODE_ENV=production
ENV PORT=8080

CMD ["npm", "start"]