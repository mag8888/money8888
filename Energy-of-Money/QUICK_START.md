# Быстрый запуск Energy Money Core

## 1. Установка зависимостей

```bash
# Установить все зависимости (клиент + сервер)
npm run install:all

# Или по отдельности:
npm install
cd client && npm install
cd ../server && npm install
```

## 2. Настройка переменных окружения

```bash
# Скопировать пример файла
cp env.example .env

# Отредактировать .env файл под ваши настройки
nano .env
```

## 3. Запуск проекта

### Вариант 1: Запуск в режиме разработки (рекомендуется)
```bash
# Запустить клиент и сервер одновременно
npm run dev
```

### Вариант 2: Запуск по отдельности
```bash
# Терминал 1 - Сервер
npm run dev:server

# Терминал 2 - Клиент  
npm run start:client
```

### Вариант 3: Продакшн режим
```bash
# Собрать клиент
npm run build:client

# Запустить сервер
npm run start:server
```

## 4. Доступ к приложению

- **Клиент**: http://localhost:3000
- **Сервер**: http://localhost:5000
- **API**: http://localhost:5000/api

## 5. Основные команды

```bash
npm run start          # Запуск клиента и сервера
npm run dev            # Режим разработки
npm run build:client   # Сборка клиента
npm run test:client    # Тесты клиента
```

## 6. Структура проекта

```
energy-money-core/
├── client/           # React приложение
├── server/           # Node.js сервер
├── shared/           # Общие файлы
├── package.json      # Корневой package.json
└── README.md         # Документация
```

## 7. Устранение проблем

### Если порт 3000 занят:
```bash
# Остановить процесс на порту 3000
lsof -ti:3000 | xargs kill -9
```

### Если порт 5000 занят:
```bash
# Остановить процесс на порту 5000
lsof -ti:5000 | xargs kill -9
```

### Очистка node_modules:
```bash
rm -rf node_modules client/node_modules server/node_modules
npm run install:all
```
