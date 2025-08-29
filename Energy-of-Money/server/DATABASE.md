# 🗄️ База данных Energy of Money Game

## 📋 Обзор

Игра использует **SQLite** как встраиваемую базу данных для хранения:
- 👥 Пользователей
- 🏠 Комнат
- 🎮 Игр
- 📊 Ходов и статистики

## 🏗️ Структура БД

### Таблица `users`
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,           -- Уникальный ID пользователя
  username TEXT UNIQUE NOT NULL, -- Имя пользователя
  email TEXT UNIQUE NOT NULL,    -- Email пользователя
  createdAt DATETIME,            -- Дата создания
  lastLogin DATETIME             -- Последний вход
);
```

### Таблица `rooms`
```sql
CREATE TABLE rooms (
  id TEXT PRIMARY KEY,           -- ID комнаты
  name TEXT NOT NULL,            -- Внутреннее имя
  displayName TEXT NOT NULL,     -- Отображаемое имя
  isPublic BOOLEAN,              -- Публичная ли комната
  password TEXT,                 -- Пароль (если приватная)
  professionType TEXT,           -- Тип профессий (individual/shared)
  hostId TEXT NOT NULL,          -- ID хоста
  hostUsername TEXT NOT NULL,    -- Имя хоста
  status TEXT,                   -- Статус (waiting/determining_order/playing)
  maxPlayers INTEGER,            -- Максимум игроков
  createdAt DATETIME,            -- Дата создания
  updatedAt DATETIME             -- Дата обновления
);
```

### Таблица `room_players`
```sql
CREATE TABLE room_players (
  id INTEGER PRIMARY KEY,        -- Автоинкремент ID
  roomId TEXT NOT NULL,          -- ID комнаты
  playerId TEXT NOT NULL,        -- ID игрока
  username TEXT NOT NULL,        -- Имя игрока
  socketId TEXT,                 -- Socket ID
  seat INTEGER,                  -- Место за столом
  ready BOOLEAN,                 -- Готов ли игрок
  profession TEXT,               -- JSON профессии
  dream TEXT,                    -- JSON мечты
  balance INTEGER,               -- Баланс
  salary INTEGER,                -- Зарплата
  expenses INTEGER,              -- Расходы
  passiveIncome INTEGER,         -- Пассивный доход
  position INTEGER,              -- Позиция на поле
  offline BOOLEAN,               -- Оффлайн ли игрок
  joinedAt DATETIME              -- Время присоединения
);
```

### Таблица `games`
```sql
CREATE TABLE games (
  id INTEGER PRIMARY KEY,        -- ID игры
  roomId TEXT NOT NULL,          -- ID комнаты
  status TEXT,                   -- Статус игры
  currentTurn TEXT,              -- Текущий ход
  currentPhase TEXT,             -- Текущая фаза
  orderDetermination TEXT,       -- JSON определения порядка
  startedAt DATETIME,            -- Время начала
  endedAt DATETIME               -- Время окончания
);
```

### Таблица `game_moves`
```sql
CREATE TABLE game_moves (
  id INTEGER PRIMARY KEY,        -- ID хода
  gameId INTEGER NOT NULL,       -- ID игры
  playerId TEXT NOT NULL,        -- ID игрока
  moveType TEXT NOT NULL,        -- Тип хода
  moveData TEXT,                 -- JSON данных хода
  timestamp DATETIME             -- Время хода
);
```

## 🚀 Использование

### Инициализация
```javascript
const GameDatabase = require('./database');
const db = new GameDatabase();
```

### Основные операции

#### Пользователи
```javascript
// Создать пользователя
db.createUser({ id: 'user1', username: 'John', email: 'john@example.com' });

// Найти по ID
const user = db.getUserById('user1');

// Найти по username
const user = db.getUserByUsername('John');

// Получить всех пользователей
const allUsers = db.getAllUsers();
```

#### Комнаты
```javascript
// Создать комнату
db.createRoom({
  id: 'room1',
  name: 'room1',
  displayName: 'Игровая комната',
  hostId: 'user1',
  hostUsername: 'John'
});

// Получить комнату
const room = db.getRoomById('room1');

// Обновить статус
db.updateRoomStatus('room1', 'playing');
```

#### Игроки в комнатах
```javascript
// Добавить игрока
db.addPlayerToRoom('room1', {
  id: 'user2',
  username: 'Alice',
  profession: { name: 'Водитель', salary: 3000 }
});

// Обновить игрока
db.updatePlayerInRoom('room1', 'user2', { ready: true });

// Получить всех игроков комнаты
const players = db.getRoomPlayers('room1');
```

## 🛠️ Управление БД

### Скрипт менеджера
```bash
# Показать статистику
node db-manager.js stats

# Экспортировать данные
node db-manager.js export

# Очистить все данные (ОПАСНО!)
node db-manager.js clear

# Показать помощь
node db-manager.js help
```

### Миграция данных
При запуске сервера автоматически происходит миграция существующих данных из памяти в БД.

## 🔒 Безопасность

- Все SQL запросы используют подготовленные выражения (prepared statements)
- Пароли хранятся в открытом виде (в продакшене нужно хешировать)
- Внешние ключи обеспечивают целостность данных

## 📁 Файлы

- `database.js` - Основной модуль БД
- `db-manager.js` - Скрипт управления БД
- `game.db` - Файл SQLite БД (создается автоматически)

## 🚨 Важные замечания

1. **БД создается автоматически** при первом запуске
2. **Данные сохраняются между перезапусками** сервера
3. **Миграция происходит автоматически** при запуске
4. **При завершении работы** БД корректно закрывается
5. **Резервные копии** можно создавать через `db-manager.js export`

## 🔧 Разработка

### Добавление новых таблиц
1. Добавить SQL в `initTables()`
2. Создать методы CRUD
3. Обновить миграцию

### Отладка
```javascript
// Включить детальное логирование SQL
const db = new Database(dbPath, { verbose: console.log });
```

