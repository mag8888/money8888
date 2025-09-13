# Energy of Money - Railway Optimized

🚀 **Полностью оптимизированная версия для Railway.com**

## 🏗️ Структура проекта

```
railway-clean/
├── package.json          # Единый package.json с всеми зависимостями
├── Railway.toml          # Конфигурация Railway
├── server/               # Серверная часть
│   ├── index.js         # Главный сервер
│   ├── database.js      # База данных SQLite
│   └── telegram-bot.js  # Telegram бот
├── src/                 # React приложение
├── public/              # Статические файлы
└── build/               # Собранное приложение (создается автоматически)
```

## 🔧 Особенности оптимизации

### ✅ **Упрощенная структура:**
- Все зависимости в одном `package.json`
- Нет дублирования файлов
- Чистая структура без лишних папок

### ✅ **Оптимизированная база данных:**
- SQLite в памяти (быстрее для Railway)
- Автоматическое создание таблиц
- Обработка ошибок

### ✅ **Стабильный Telegram бот:**
- Интегрирован с базой данных
- Обработка рефералов
- Изображения из Google Drive

### ✅ **Railway совместимость:**
- Правильные скрипты сборки
- Health check endpoint
- Переменные окружения

## 🚀 Деплой на Railway

### 1. **Подготовка:**
```bash
cd railway-clean
npm install
```

### 2. **Переменные окружения:**
```bash
railway variables set BOT_TOKEN=ваш_токен_бота
railway variables set NODE_ENV=production
railway variables set GAME_URL=https://ваш-проект.up.railway.app/
```

### 3. **Деплой:**
```bash
railway up
```

## 📊 API Endpoints

- `GET /health` - Health check
- `GET /api/telegram/info` - Информация о боте
- `GET /api/telegram/images` - URL изображений бота

## 🤖 Telegram бот

- **Ссылка**: https://t.me/anreal_money_bot
- **Команды**: /start, /about, /income, /clients, /play, /balance
- **Реферальная система**: Автоматические начисления

## 🎮 Игра

- **React приложение** с Socket.IO
- **Мультиплеер** через WebSocket
- **База данных** для пользователей и комнат

## 🔍 Мониторинг

- **Health check**: `/health`
- **Логи**: Railway Dashboard
- **Метрики**: Встроенные в Railway

## 🛠️ Разработка

```bash
# Установка зависимостей
npm install

# Локальная разработка
npm run dev

# Сборка для продакшена
npm run build

# Запуск сервера
npm start
```

## 📝 Примечания

- База данных SQLite в памяти (данные сбрасываются при перезапуске)
- Для продакшена рекомендуется PostgreSQL
- Все изображения загружаются из Google Drive
- Автоматический health check для Railway
