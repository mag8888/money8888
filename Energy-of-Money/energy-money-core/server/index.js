const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

// Определяем порт
const PORT = process.env.PORT || 5000;

// Создаем Express приложение
const app = express();
const server = http.createServer(app);

// Настройка CORS
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Создаем Socket.IO сервер
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST"]
  }
});

// Глобальное хранилище пользователей (в памяти)
const users = new Map(); // userId -> userData
const usernameToUserId = new Map(); // username -> userId
const rooms = new Map(); // roomId -> roomData

// Функция для генерации уникального User ID
const generateUserId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `user_${timestamp}_${randomStr}`;
};

// Функция для проверки уникальности username
const isUsernameUnique = (username) => {
  return !usernameToUserId.has(username.toLowerCase());
};

// Функция для регистрации пользователя
const registerUser = (username, email, password, socketId) => {
  const userId = generateUserId();
  const userData = {
    id: userId,
    username: username,
    email: email,
    password: password,
    socketId: socketId,
    createdAt: Date.now(),
    lastSeen: Date.now()
  };
  
  users.set(userId, userData);
  usernameToUserId.set(username.toLowerCase(), userId);
  
  console.log(`👤 [SERVER] User registered: ${username} (${email}) (ID: ${userId})`);
  return userData;
};

// Функция для поиска пользователя по email
const getUserByEmail = (email) => {
  console.log(`🔍 [SERVER] Searching for user with email: ${email}`);
  
  for (const [userId, userData] of users.entries()) {
    if (userData.email.toLowerCase() === email.toLowerCase()) {
      console.log(`✅ [SERVER] User found:`, { id: userData.id, username: userData.username, email: userData.email });
      return userData;
    }
  }
  
  console.log(`❌ [SERVER] User not found with email: ${email}`);
  return null;
};

// Функция для поиска пользователя по username
const getUserByUsername = (username) => {
  if (!username || typeof username !== 'string') {
    console.log(`❌ [SERVER] Invalid username provided:`, username);
    return null;
  }
  
  const userId = usernameToUserId.get(username.toLowerCase());
  if (userId) {
    return users.get(userId);
  }
  
  return null;
};

// Функция для обновления socketId пользователя
const updateUserSocketId = (userId, socketId) => {
  console.log(`🔄 [SERVER] updateUserSocketId called: userId=${userId}, socketId=${socketId}`);
  const user = users.get(userId);
  if (user) {
    user.socketId = socketId;
    user.lastSeen = Date.now();
    users.set(userId, user);
    console.log(`✅ [SERVER] Updated socketId for user ${user.username}: ${socketId}`);
  } else {
    console.log(`❌ [SERVER] User not found for userId: ${userId}`);
  }
};

// Создаем дефолтную комнату
const createDefaultRoom = () => {
  const roomId = 'lobby';
  rooms.set(roomId, {
    roomId: roomId,
    displayName: 'Лобби',
    maxPlayers: 1,
    currentPlayers: [],
    status: 'waiting',
    password: '',
    hostId: null,
    createdAt: Date.now()
  });
  console.log(`🏠 [SERVER] Default room created: ${roomId}`);
};

// Функция для получения списка комнат
const getRoomsList = () => {
  const roomsList = Array.from(rooms.values()).map(room => ({
    id: room.roomId,
    roomId: room.roomId,
    displayName: room.displayName,
    maxPlayers: room.maxPlayers,
    currentPlayers: room.currentPlayers,
    status: room.status,
    hostId: room.hostId,
    password: room.password,
    createdAt: room.createdAt // Добавляем время создания для сортировки
  }))
  .sort((a, b) => b.createdAt - a.createdAt); // Сортируем по времени создания (новые в начало)
  
  console.log(`📊 [SERVER] getRoomsList: ${roomsList.length} rooms`);
  return roomsList;
};

// Создаем дефолтную комнату при запуске
createDefaultRoom();

// Socket.IO обработчики
io.on('connection', (socket) => {
  console.log(`🔌 [SERVER] New client connected: ${socket.id}`);
  
  // Отправляем начальный список комнат
  socket.emit('roomsList', getRoomsList());
  
  // Аутентификация пользователя
  socket.on('authenticateUser', (username, email, password, callback) => {
    console.log(`🔐 [SERVER] authenticateUser event received from socket ${socket.id}`);
    
    try {
      if (!email || !email.trim()) {
        callback({ success: false, error: 'Email обязателен' });
        return;
      }
      
      const trimmedEmail = email.trim();
      const trimmedPassword = password ? password.trim() : '';
      
      // Ищем пользователя по email
      const existingUser = getUserByEmail(trimmedEmail);
      
      if (existingUser) {
        // Пользователь найден - выполняем вход
        console.log(`🔄 [SERVER] Updating socketId for existing user: ${existingUser.username}`);
        updateUserSocketId(existingUser.id, socket.id);
        
        callback({ 
          success: true, 
          isLogin: true,
          userData: {
            id: existingUser.id,
            username: existingUser.username,
            email: existingUser.email
          }
        });
        
        console.log(`✅ [SERVER] User logged in: ${existingUser.username}`);
      } else {
        // Пользователь не найден - регистрируем нового
        if (!username || !username.trim()) {
          callback({ success: false, error: 'Имя обязательно для регистрации' });
          return;
        }
        
        const trimmedUsername = username.trim();
        
        // Проверяем уникальность username
        if (!isUsernameUnique(trimmedUsername)) {
          callback({ success: false, error: 'Пользователь с таким именем уже существует' });
          return;
        }
        
        // Регистрируем пользователя
        const userData = registerUser(trimmedUsername, trimmedEmail, trimmedPassword, socket.id);
        
        callback({ 
          success: true, 
          isLogin: false,
          userData: {
            id: userData.id,
            username: userData.username,
            email: userData.email
          }
        });
        
        console.log(`✅ [SERVER] User registered successfully: ${trimmedUsername}`);
      }
    } catch (error) {
      console.error(`❌ [SERVER] Error in authenticateUser:`, error);
      callback({ success: false, error: 'Внутренняя ошибка сервера' });
    }
  });
  
  // Проверка уникальности username
  socket.on('checkUsernameUnique', (username, callback) => {
    try {
      const isUnique = isUsernameUnique(username);
      callback({ unique: isUnique });
      console.log(`🔍 [SERVER] Username uniqueness check for "${username}": ${isUnique ? 'unique' : 'already exists'}`);
    } catch (error) {
      console.error(`❌ [SERVER] Error checking username uniqueness:`, error);
      callback({ unique: false, error: 'Ошибка проверки уникальности' });
    }
  });
  
  // Проверка существования пользователя по email
  socket.on('checkUserExists', (email, callback) => {
    try {
      console.log(`🔍 [SERVER] Checking if user exists with email: ${email}`);
      const existingUser = getUserByEmail(email);
      const exists = existingUser !== null;
      console.log(`🔍 [SERVER] User exists: ${exists}`);
      callback({ exists });
    } catch (error) {
      console.error(`❌ [SERVER] Error checking user existence:`, error);
      callback({ exists: false, error: 'Ошибка проверки пользователя' });
    }
  });
  
  // Получение списка комнат
  socket.on('getRoomsList', () => {
    console.log('🏠 [SERVER] getRoomsList requested by socket:', socket.id);
    const roomsList = getRoomsList();
    socket.emit('roomsList', roomsList);
    console.log('🏠 [SERVER] Sent rooms list:', roomsList.length, 'rooms');
  });
  
  // Получение списка комнат (альтернативное название)
  socket.on('getRooms', () => {
    console.log('🏠 [SERVER] getRooms requested by socket:', socket.id);
    const roomsList = getRoomsList();
    socket.emit('roomsList', roomsList);
    console.log('🏠 [SERVER] Sent rooms list:', roomsList.length, 'rooms');
  });
  
  // Создание комнаты
  socket.on('createRoom', (roomData) => {
    console.log('🏠 [SERVER] createRoom requested:', roomData);
    
    try {
      const { roomId, name, password, professionType, profession, maxPlayers } = roomData;
      
      // Генерируем уникальный ID комнаты
      const uniqueRoomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Проверяем, что имя комнаты указано
      if (!name || !name.trim()) {
        socket.emit('roomCreationError', { 
          success: false, 
          error: 'Название комнаты обязательно!' 
        });
        return;
      }

      // Проверяем количество игроков (1-10)
      if (maxPlayers < 1 || maxPlayers > 10) {
        socket.emit('roomCreationError', { 
          success: false, 
          error: 'Количество игроков должно быть от 1 до 10!' 
        });
        return;
      }

      // Создаем новую комнату
      const newRoom = {
        roomId: uniqueRoomId,
        displayName: name.trim(),
        maxPlayers: maxPlayers || 1, // Используем переданное значение или по умолчанию 1 (диапазон 1-10)
        currentPlayers: [],
        status: 'waiting',
        password: password || '',
        hostId: socket.id,
        createdAt: Date.now(),
        professionType: professionType || 'individual',
        hostProfession: profession || null
      };
      
      // Добавляем комнату в список
      rooms.set(uniqueRoomId, newRoom);
      
      console.log('🏠 [SERVER] Room created:', {
        roomId: uniqueRoomId,
        name: name,
        hostId: socket.id
      });
      
      // Отправляем подтверждение клиенту через emit
      socket.emit('roomCreated', { 
        success: true, 
        roomId: uniqueRoomId,
        room: newRoom
      });
      
      // Отправляем обновленный список комнат всем
      const roomsList = getRoomsList();
      io.emit('roomsList', roomsList);
      
      console.log('🏠 [SERVER] Updated rooms list sent to all clients');
      
    } catch (error) {
      console.error('❌ [SERVER] Error creating room:', error);
      
      // Отправляем ошибку клиенту через emit
      socket.emit('roomCreationError', { 
        success: false, 
        error: 'Ошибка создания комнаты' 
      });
    }
  });
  
  // Присоединение к комнате
  socket.on('joinRoom', (roomId, playerData) => {
    console.log('🔗 [SERVER] joinRoom requested:', { roomId, playerData });
    
    try {
      const room = rooms.get(roomId);
      if (!room) {
        socket.emit('joinRoomError', { success: false, error: 'Комната не найдена' });
        return;
      }
      
      // Проверяем, не находится ли игрок уже в комнате
      const existingPlayer = room.currentPlayers.find(p => p.socketId === socket.id);
      if (existingPlayer) {
        console.log('🔗 [SERVER] Player already in room:', { roomId, username: existingPlayer.username });
        socket.emit('roomJoined', { success: true, roomId });
        return;
      }
      
      // Проверяем, не превышено ли максимальное количество игроков
      if (room.currentPlayers.length >= room.maxPlayers) {
        socket.emit('joinRoomError', { success: false, error: 'Комната заполнена' });
        return;
      }
      
      // Подключаем сокет к комнате
      socket.join(roomId);
      
      // Добавляем игрока в комнату
      const player = {
        id: socket.id,
        username: playerData?.username || 'Игрок', // Извлекаем username из объекта
        socketId: socket.id,
        ready: false,
        joinedAt: Date.now()
      };
      
      room.currentPlayers.push(player);
      
      console.log('🔗 [SERVER] Player joined room:', {
        roomId,
        username: player.username,
        totalPlayers: room.currentPlayers.length
      });
      
      // Отправляем подтверждение клиенту через emit
      socket.emit('roomJoined', { success: true, roomId });
      
      // Отправляем обновленный список игроков в комнату
      io.to(roomId).emit('playersUpdate', room.currentPlayers);
      
      // Отправляем обновленный список комнат всем
      const roomsList = getRoomsList();
      io.emit('roomsList', roomsList);
      
    } catch (error) {
      console.error('❌ [SERVER] Error joining room:', error);
      socket.emit('joinRoomError', { success: false, error: 'Ошибка присоединения к комнате' });
    }
  });
  
  // Установка готовности игрока
  socket.on('playerReady', (roomId, playerId) => {
    console.log('🎯 [SERVER] Player ready requested:', { roomId, playerId });
    
    try {
      const room = rooms.get(roomId);
      if (!room) {
        socket.emit('error', { message: 'Комната не найдена' });
        return;
      }
      
      // Находим игрока в комнате
      const player = room.currentPlayers.find(p => p.socketId === socket.id);
      if (player) {
        player.ready = true;
        console.log('🎯 [SERVER] Player marked as ready:', { roomId, username: player.username });
        
        // Отправляем обновленный список игроков в комнату
        io.to(roomId).emit('playersUpdate', room.currentPlayers);
        
        // Отправляем обновленный список комнат всем
        const roomsList = getRoomsList();
        io.emit('roomsList', roomsList);
      }
    } catch (error) {
      console.error('❌ [SERVER] Error setting player ready:', error);
      socket.emit('error', { message: 'Ошибка установки готовности' });
    }
  });

  // Обработчик отключения клиента
  socket.on('disconnect', () => {
    console.log(`🔌 [SERVER] Client disconnected: ${socket.id}`);
    
    // Удаляем игрока из всех комнат
    rooms.forEach((room, roomId) => {
      const playerIndex = room.currentPlayers.findIndex(p => p.socketId === socket.id);
      if (playerIndex !== -1) {
        const removedPlayer = room.currentPlayers[playerIndex];
        room.currentPlayers.splice(playerIndex, 1);
        console.log('🔌 [SERVER] Player removed from room:', { 
          roomId, 
          username: removedPlayer.username,
          socketId: socket.id 
        });
        
        // Отправляем обновленный список игроков
        io.to(roomId).emit('playersUpdate', room.currentPlayers);
        
        // Отправляем обновленный список комнат
        const roomsList = getRoomsList();
        io.emit('roomsList', roomsList);
      }
    });
  });
});

// API маршруты
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/rooms', (req, res) => {
  const roomsList = getRoomsList();
  res.json(roomsList);
});

// Запускаем сервер
server.listen(PORT, () => {
  console.log(`🚀 Energy of Money Server запущен!`);
  console.log(`🌐 HTTP: http://localhost:${PORT}`);
  console.log(`📡 WebSocket: ws://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🏠 API комнат: http://localhost:${PORT}/api/rooms`);
});

// Обработка завершения работы сервера
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  process.exit(0);
});