#!/bin/bash

# Energy of Money Landing Page Launcher
# Скрипт для запуска лендинга

echo "🚀 Запуск лендинга Energy of Money..."

# Проверяем наличие Python
if command -v python3 &> /dev/null; then
    echo "📦 Используем Python 3 для запуска локального сервера..."
    cd "$(dirname "$0")"
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "📦 Используем Python 2 для запуска локального сервера..."
    cd "$(dirname "$0")"
    python -m SimpleHTTPServer 8000
elif command -v node &> /dev/null; then
    echo "📦 Используем Node.js для запуска локального сервера..."
    cd "$(dirname "$0")"
    npx http-server -p 8000
elif command -v php &> /dev/null; then
    echo "📦 Используем PHP для запуска локального сервера..."
    cd "$(dirname "$0")"
    php -S localhost:8000
else
    echo "❌ Не найдено подходящего сервера. Откройте index.html в браузере."
    echo "🌐 Или установите Python, Node.js или PHP для запуска локального сервера."
    exit 1
fi
