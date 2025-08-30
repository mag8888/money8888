# Архитектура проекта - Energy Money Core

## Общий обзор

Проект построен по архитектуре клиент-сервер с использованием WebSocket для real-time коммуникации. Клиентская часть написана на React, серверная - на Node.js с Express и Socket.IO.

## Архитектурные слои

### 1. Клиентский слой (Frontend)

```
client/src/
├── components/          # React компоненты
│   ├── Registration.js  # Регистрация и авторизация
│   ├── RoomSelection.js # Выбор комнат
│   ├── RoomSetup.js     # Настройка комнаты
│   ├── GameBoard.js     # Игровое поле
│   ├── ProfessionModal.js # Модальное окно профессий
│   └── ErrorBoundary.js # Обработка ошибок
├── hooks/               # React хуки
├── styles/              # Стили и темы
├── data/                # Статические данные
├── App.js               # Главный компонент
├── index.js             # Точка входа
└── socket.js            # WebSocket клиент
```

#### Основные компоненты:

- **Registration**: Управляет процессом регистрации и входа пользователей
- **RoomSelection**: Отображает список доступных комнат и позволяет создавать новые
- **RoomSetup**: Настройка параметров комнаты перед игрой
- **GameBoard**: Основное игровое поле с игровой логикой
- **ProfessionModal**: Выбор профессии игрока

### 2. Серверный слой (Backend)

```
server/
├── index.js             # Основной сервер
├── database.js          # Работа с базой данных
├── db-manager.js        # Менеджер БД
├── email-service.js     # Email сервис
├── email-config.js      # Конфигурация email
├── models/              # Модели данных
│   ├── User.js          # Модель пользователя
│   └── Rating.js        # Модель рейтинга
└── shared/              # Общая логика
    ├── constants.js      # Константы
    └── gameLogic.js      # Игровая логика
```

#### Основные модули:

- **index.js**: Express сервер + Socket.IO + маршрутизация
- **database.js**: SQLite база данных с ORM
- **email-service.js**: Отправка email уведомлений
- **models/**: Mongoose-подобные модели для работы с данными

### 3. Слой коммуникации

#### HTTP API
- RESTful endpoints для CRUD операций
- JSON формат данных
- Стандартные HTTP коды ответов

#### WebSocket (Socket.IO)
- Real-time коммуникация
- События для игровых действий
- Автоматическое переподключение

## Поток данных

### 1. Регистрация пользователя
```
Client → POST /api/auth/register → Server → Database → Response
```

### 2. Вход в систему
```
Client → POST /api/auth/login → Server → Validation → Response
```

### 3. Создание комнаты
```
Client → Socket.IO 'create_room' → Server → Room Creation → Broadcast
```

### 4. Игровой процесс
```
Client → Socket.IO 'game_action' → Server → Game Logic → Broadcast to all players
```

## Модели данных

### User
```javascript
{
  id: String,
  username: String,
  email: String,
  password: String (hashed),
  socketId: String,
  createdAt: Date,
  lastSeen: Date
}
```

### Room
```javascript
{
  id: String,
  name: String,
  maxPlayers: Number,
  currentPlayers: Array<User>,
  status: String, // 'waiting', 'playing', 'finished'
  createdBy: String,
  password: String (optional),
  gameState: Object
}
```

### GameState
```javascript
{
  players: Array<Player>,
  currentTurn: String,
  gamePhase: String,
  board: Array<Array<Cell>>,
  history: Array<Action>
}
```

## Безопасность

### 1. Аутентификация
- JWT токены (планируется)
- Хеширование паролей
- Валидация входных данных

### 2. Авторизация
- Проверка прав доступа к комнатам
- Валидация игровых действий
- Защита от подмены данных

### 3. Валидация
- Проверка типов данных
- Санитизация входных данных
- Rate limiting для API

## Масштабируемость

### 1. Горизонтальное масштабирование
- Redis для сессий (планируется)
- Load balancer для WebSocket
- Микросервисная архитектура (планируется)

### 2. Вертикальное масштабирование
- Оптимизация запросов к БД
- Кэширование часто используемых данных
- Асинхронная обработка задач

## Мониторинг и логирование

### 1. Логирование
- Структурированные логи
- Уровни логирования (debug, info, warn, error)
- Ротация логов

### 2. Метрики
- Количество активных пользователей
- Время отклика API
- Использование памяти и CPU

### 3. Алерты
- Критические ошибки
- Высокая нагрузка
- Проблемы с подключением к БД

## Тестирование

### 1. Unit тесты
- Тестирование отдельных функций
- Моки для внешних зависимостей
- Покрытие кода > 80%

### 2. Integration тесты
- Тестирование API endpoints
- Тестирование WebSocket событий
- Тестирование взаимодействия компонентов

### 3. E2E тесты
- Тестирование полного пользовательского сценария
- Автоматизация браузера
- Тестирование в разных окружениях

## Развертывание

### 1. Development
- Hot reload для клиента
- Nodemon для сервера
- Локальная SQLite БД

### 2. Production
- Docker контейнеры
- Nginx reverse proxy
- PostgreSQL/MySQL
- SSL/TLS сертификаты

### 3. CI/CD
- Автоматические тесты
- Сборка и деплой
- Мониторинг развертывания
