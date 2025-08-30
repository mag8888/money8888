# API Документация - Energy Money Core

## Общая информация

- **Базовый URL**: `http://localhost:5000`
- **WebSocket**: `ws://localhost:5000`
- **Протокол**: HTTP/HTTPS + WebSocket

## HTTP API Endpoints

### Аутентификация

#### POST `/api/auth/register`
Регистрация нового пользователя

**Тело запроса:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Ответ:**
```json
{
  "success": true,
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "createdAt": "timestamp"
  }
}
```

#### POST `/api/auth/login`
Вход в систему

**Тело запроса:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Ответ:**
```json
{
  "success": true,
  "user": {
    "id": "string",
    "username": "string",
    "email": "string"
  }
}
```

### Комнаты

#### GET `/api/rooms`
Получить список всех комнат

**Ответ:**
```json
{
  "rooms": [
    {
      "id": "string",
      "name": "string",
      "maxPlayers": "number",
      "currentPlayers": "number",
      "status": "waiting|playing|finished",
      "createdBy": "string"
    }
  ]
}
```

#### POST `/api/rooms`
Создать новую комнату

**Тело запроса:**
```json
{
  "name": "string",
  "maxPlayers": "number",
  "password": "string (optional)"
}
```

#### GET `/api/rooms/:roomId`
Получить информацию о комнате

#### PUT `/api/rooms/:roomId`
Обновить настройки комнаты

#### DELETE `/api/rooms/:roomId`
Удалить комнату

## WebSocket Events

### Подключение
```javascript
// Подключение к серверу
const socket = io('http://localhost:5000');

// Слушатель подключения
socket.on('connect', () => {
  console.log('Connected:', socket.id);
});
```

### События аутентификации

#### `register`
```javascript
socket.emit('register', {
  username: 'string',
  email: 'string',
  password: 'string'
});

socket.on('register_response', (data) => {
  // data.success, data.user, data.error
});
```

#### `login`
```javascript
socket.emit('login', {
  email: 'string',
  password: 'string'
});

socket.on('login_response', (data) => {
  // data.success, data.user, data.error
});
```

### События комнат

#### `join_room`
```javascript
socket.emit('join_room', {
  roomId: 'string',
  password: 'string (optional)'
});

socket.on('room_joined', (data) => {
  // data.room, data.players
});
```

#### `leave_room`
```javascript
socket.emit('leave_room', {
  roomId: 'string'
});

socket.on('room_left', (data) => {
  // data.roomId
});
```

#### `create_room`
```javascript
socket.emit('create_room', {
  name: 'string',
  maxPlayers: 'number',
  password: 'string (optional)'
});

socket.on('room_created', (data) => {
  // data.room
});
```

### События игры

#### `game_action`
```javascript
socket.emit('game_action', {
  roomId: 'string',
  action: 'string',
  data: 'object'
});

socket.on('game_update', (data) => {
  // data.roomId, data.gameState, data.players
});
```

## Обработка ошибок

Все API endpoints возвращают ошибки в следующем формате:

```json
{
  "success": false,
  "error": {
    "code": "string",
    "message": "string",
    "details": "object (optional)"
  }
}
```

## Коды ошибок

- `AUTH_REQUIRED` - Требуется аутентификация
- `INVALID_CREDENTIALS` - Неверные учетные данные
- `USER_NOT_FOUND` - Пользователь не найден
- `ROOM_NOT_FOUND` - Комната не найдена
- `ROOM_FULL` - Комната заполнена
- `INVALID_ACTION` - Недопустимое действие
- `SERVER_ERROR` - Внутренняя ошибка сервера

## Примеры использования

### Полный цикл регистрации и входа

```javascript
// 1. Регистрация
socket.emit('register', {
  username: 'player1',
  email: 'player1@example.com',
  password: 'password123'
});

socket.on('register_response', (data) => {
  if (data.success) {
    console.log('Registered:', data.user);
    
    // 2. Вход
    socket.emit('login', {
      email: 'player1@example.com',
      password: 'password123'
    });
  }
});

socket.on('login_response', (data) => {
  if (data.success) {
    console.log('Logged in:', data.user);
    
    // 3. Создание комнаты
    socket.emit('create_room', {
      name: 'My Game Room',
      maxPlayers: 4
    });
  }
});
```

### Управление игровой сессией

```javascript
// Присоединение к комнате
socket.emit('join_room', { roomId: 'room123' });

socket.on('room_joined', (data) => {
  console.log('Joined room:', data.room);
  
  // Отправка игрового действия
  socket.emit('game_action', {
    roomId: 'room123',
    action: 'move',
    data: { x: 10, y: 20 }
  });
});

// Получение обновлений игры
socket.on('game_update', (data) => {
  console.log('Game update:', data.gameState);
});
```
