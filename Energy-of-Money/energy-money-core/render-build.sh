#!/bin/bash

echo "🚀 Starting build process..."

# Устанавливаем зависимости корневого проекта
echo "📦 Installing root dependencies..."
npm install

# Собираем клиент
echo "🎨 Building client..."
cd client
npm install
npm run build
cd ..

# Устанавливаем зависимости сервера
echo "🖥️ Installing server dependencies..."
cd server
npm install
cd ..

echo "✅ Build completed successfully!"
