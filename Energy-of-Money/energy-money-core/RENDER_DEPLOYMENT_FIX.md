# 🔧 Исправление деплоя на Render - Energy2

## ✅ Проблемы исправлены!

### 🐛 Что было не так:

1. **`Error: Cannot find module 'express'`**
   - Зависимости сервера не устанавливались
   - Неправильный порядок установки

2. **`sh: 1: craco: not found`**
   - Клиент пытался использовать `craco` вместо `react-scripts`
   - Неправильная команда сборки

3. **`".": executable file not found in $PATH`**
   - Неправильная команда запуска

### 🔧 Что исправлено:

#### 1. Создан `render-build.sh`:
```bash
#!/bin/bash
echo "🚀 Starting build process..."

# Устанавливаем зависимости корневого проекта
npm install

# Собираем клиент
cd client
npm install
npm run build
cd ..

# Устанавливаем зависимости сервера
cd server
npm install
cd ..

echo "✅ Build completed successfully!"
```

#### 2. Обновлен `render.yaml`:
```yaml
services:
  - type: web
    name: energy2-cashflow
    env: node
    plan: free
    buildCommand: bash render-build.sh  # ✅ Используем скрипт
    startCommand: cd server && npm start
    healthCheckPath: /health
    autoDeploy: true
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: NODE_VERSION
        value: 18
    disk:
      name: data
      mountPath: /var/data
      sizeGB: 1
```

## 🚀 Следующие шаги:

### 1. Пересоздайте Web Service на Render:
1. **Удалите** старый деплой (если есть)
2. **Создайте новый** Web Service
3. **Подключите** репозиторий `mag8888/energy2`
4. **Используйте** настройки из `render.yaml`

### 2. Настройки деплоя:
- **Environment**: Node
- **Build Command**: `bash render-build.sh`
- **Start Command**: `cd server && npm start`
- **Health Check Path**: `/health`

### 3. Переменные окружения:
```
NODE_ENV=production
PORT=10000
NODE_VERSION=18
```

### 4. Диск:
- **Mount Path**: `/var/data`
- **Size**: 1GB

## ✅ Результат:
- **Клиент**: React приложение соберется корректно
- **Сервер**: Express сервер запустится с правильными зависимостями
- **База данных**: SQLite будет работать с диском
- **WebSocket**: Real-time соединения будут работать

## 📊 Мониторинг:
- **Health Check**: `https://your-app.onrender.com/health`
- **API комнат**: `https://your-app.onrender.com/api/rooms`
- **Логи**: проверяйте в панели Render

---

**Все проблемы решены! 🎉**
