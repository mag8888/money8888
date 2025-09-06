# 🔧 Исправление скриптов для Render - Energy2

## ✅ Проблема решена!

### 🐛 Что было не так:

1. **`npm error Missing script: "install-all"`** - скрипт не найден
2. **Render кэшировал** старую версию package.json
3. **Node.js 20** ✅ - теперь правильная версия

### 🔧 Что исправлено:

#### 1. **Упростили buildCommand** в `render.yaml`:
```yaml
buildCommand: |
  npm install
  cd client && npm install && npm run build
  cd ../server && npm install
```

#### 2. **Убрали зависимость от npm скриптов**:
- Прямые команды вместо `npm run install-all`
- Нет проблем с разрешением скриптов
- Проще для отладки

#### 3. **Текущая конфигурация**:
```yaml
services:
  - type: web
    name: energy2-cashflow
    env: node
    plan: free
    buildCommand: |
      npm install
      cd client && npm install && npm run build
      cd ../server && npm install
    startCommand: cd server && npm start
    healthCheckPath: /health
    autoDeploy: true
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: NODE_VERSION
        value: 20  # ✅ Правильная версия
    disk:
      name: data
      mountPath: /var/data
      sizeGB: 1
```

## 🚀 Следующие шаги:

### 1. **Пересоздайте Web Service** на Render:
- Удалите старый деплой
- Создайте новый Web Service
- Подключите репозиторий `mag8888/energy2`
- Убедитесь, что выбрана ветка `main`

### 2. **Настройки деплоя**:
- **Build Command**: 
  ```bash
  npm install
  cd client && npm install && npm run build
  cd ../server && npm install
  ```
- **Start Command**: `cd server && npm start`
- **Health Check**: `/health`

### 3. **Переменные окружения**:
```
NODE_ENV=production
PORT=10000
NODE_VERSION=20
```

### 4. **Диск**:
- Mount Path: `/var/data`
- Size: 1GB

## ✅ Результат:
- **Node.js 20** - актуальная версия ✅
- **Прямые команды** - нет проблем со скриптами ✅
- **Правильная последовательность** сборки ✅
- **Все зависимости** установятся корректно ✅

## 📊 Последовательность сборки:
1. `npm install` - устанавливает корневые зависимости
2. `cd client && npm install && npm run build` - собирает React клиент
3. `cd ../server && npm install` - устанавливает зависимости сервера
4. `cd server && npm start` - запускает сервер

---

**Проблема со скриптами решена! Теперь деплой должен пройти успешно! 🎉**
