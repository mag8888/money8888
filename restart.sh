#!/bin/bash

echo "🔄 Перезапуск Cashflow..."

echo "📱 Останавливаем сервер..."
cd server
pkill -f "node .*server/index.js" 2>/dev/null
pkill -f nodemon 2>/dev/null

echo "🚀 Запускаем сервер..."
npm run dev &
SERVER_PID=$!

echo "⏳ Ждем запуска сервера..."
sleep 3

echo "🔨 Собираем клиент..."
cd ../client
npm run build

echo "✅ Готово! Сервер запущен на порту 3000"
echo "🌐 Откройте http://localhost:3000 в браузере"
echo "🔄 Для остановки сервера: kill $SERVER_PID"

# Ждем Ctrl+C для остановки
trap "echo '🛑 Останавливаем сервер...'; kill $SERVER_PID; exit" INT
wait
