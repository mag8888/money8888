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
