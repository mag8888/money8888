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

// Система перерывов
const breakTimers = new Map(); // roomId -> breakTimer
const BREAK_INTERVAL = 50 * 60 * 1000; // 50 минут в миллисекундах
const BREAK_DURATION = 10 * 60 * 1000; // 10 минут в миллисекундах

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
  }
};

// Функция для запуска системы перерывов в комнате
const startBreakSystem = (roomId) => {
  console.log(`⏰ [SERVER] Starting break system for room: ${roomId}`);
  
  const room = rooms.get(roomId);
  if (!room) {
    console.log(`❌ [SERVER] Room not found for break system: ${roomId}`);
    return;
  }
  
  // Устанавливаем время начала игры
  room.gameStartTime = Date.now();
  room.gameEndTime = room.gameStartTime + (room.gameDuration * 60 * 1000); // Конвертируем минуты в миллисекунды
  room.nextBreakTime = room.gameStartTime + BREAK_INTERVAL;
  
  // Проверяем, есть ли время для перерыва
  if (room.nextBreakTime >= room.gameEndTime) {
    console.log(`⏰ [SERVER] Game duration too short for breaks, skipping break system for room: ${roomId}`);
    return;
  }
  
  // Запускаем таймер для первого перерыва
  const breakTimer = setTimeout(() => {
    startBreak(roomId);
  }, BREAK_INTERVAL);
  
  breakTimers.set(roomId, breakTimer);
  
  console.log(`⏰ [SERVER] Break system started for room ${roomId}. Next break at: ${new Date(room.nextBreakTime).toLocaleString()}`);
};

// Функция для начала перерыва
const startBreak = (roomId) => {
  console.log(`☕ [SERVER] Starting break for room: ${roomId}`);
  
  const room = rooms.get(roomId);
  if (!room) {
    console.log(`❌ [SERVER] Room not found for break: ${roomId}`);
    return;
  }
  
  // Устанавливаем статус перерыва
  room.isOnBreak = true;
  room.breakStartTime = Date.now();
  room.breakEndTime = room.breakStartTime + BREAK_DURATION;
  
  // Уведомляем всех игроков о начале перерыва
  io.to(roomId).emit('breakStarted', {
    breakEndTime: room.breakEndTime,
    duration: BREAK_DURATION
  });
  
  console.log(`☕ [SERVER] Break started for room ${roomId}. End time: ${new Date(room.breakEndTime).toLocaleString()}`);
  
  // Запускаем таймер для окончания перерыва
  const breakEndTimer = setTimeout(() => {
    endBreak(roomId);
  }, BREAK_DURATION);
  
  // Проверяем, не превышает ли время окончания перерыва время окончания игры
  if (room.breakEndTime > room.gameEndTime) {
    console.log(`⏰ [SERVER] Break would exceed game end time, adjusting break duration for room: ${roomId}`);
    const adjustedDuration = room.gameEndTime - room.breakStartTime;
    clearTimeout(breakEndTimer);
    setTimeout(() => {
      endBreak(roomId);
    }, adjustedDuration);
  }
  
  // Сохраняем таймер окончания перерыва
  breakTimers.set(`${roomId}_breakEnd`, breakEndTimer);
};

// Функция для окончания перерыва
const endBreak = (roomId) => {
  console.log(`🎮 [SERVER] Ending break for room: ${roomId}`);
  
  const room = rooms.get(roomId);
  if (!room) {
    console.log(`❌ [SERVER] Room not found for break end: ${roomId}`);
    return;
  }
  
  // Убираем статус перерыва
  room.isOnBreak = false;
  room.breakStartTime = null;
  room.breakEndTime = null;
  
  // Устанавливаем время следующего перерыва
  const now = Date.now();
  room.nextBreakTime = now + BREAK_INTERVAL;
  
  // Проверяем, не превышает ли следующий перерыв время окончания игры
  if (room.nextBreakTime > room.gameEndTime) {
    console.log(`⏰ [SERVER] Next break would exceed game end time, stopping break system for room: ${roomId}`);
    stopBreakSystem(roomId);
    return;
  }
  
  // Уведомляем всех игроков об окончании перерыва
  io.to(roomId).emit('breakEnded', {
    nextBreakTime: room.nextBreakTime
  });
  
  console.log(`🎮 [SERVER] Break ended for room ${roomId}. Next break at: ${new Date(room.nextBreakTime).toLocaleString()}`);
  
  // Запускаем таймер для следующего перерыва
  const nextBreakTimer = setTimeout(() => {
    startBreak(roomId);
  }, BREAK_INTERVAL);
  
  breakTimers.set(roomId, nextBreakTimer);
};

// Функция для остановки системы перерывов
const stopBreakSystem = (roomId) => {
  console.log(`⏹️ [SERVER] Stopping break system for room: ${roomId}`);
  
  // Очищаем таймеры
  const breakTimer = breakTimers.get(roomId);
  if (breakTimer) {
    clearTimeout(breakTimer);
    breakTimers.delete(roomId);
  }
  
  const breakEndTimer = breakTimers.get(`${roomId}_breakEnd`);
  if (breakEndTimer) {
    clearTimeout(breakEndTimer);
    breakTimers.delete(`${roomId}_breakEnd`);
  }
  
  // Сбрасываем статус перерыва в комнате
  const room = rooms.get(roomId);
  if (room) {
    room.isOnBreak = false;
    room.breakStartTime = null;
    room.breakEndTime = null;
    room.nextBreakTime = null;
  }
  
  console.log(`⏹️ [SERVER] Break system stopped for room: ${roomId}`);
};

// Создаем дефолтную комнату
const createDefaultRoom = () => {
  const roomId = 'lobby';
  rooms.set(roomId, {
    roomId: roomId,
    displayName: 'Лобби',
    maxPlayers: 1,
    gameDuration: 180, // 3 часа по умолчанию
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
  const roomsList = Array.from(rooms.values()).map(room => {
    // Находим имя хоста по hostId
    let hostUsername = 'Неизвестно';
    if (room.hostId) {
      console.log(`🔍 [SERVER] Looking for host username for room ${room.roomId}, hostId: ${room.hostId}`);
      console.log(`🔍 [SERVER] Available users:`, Array.from(users.values()).map(u => ({ username: u.username, socketId: u.socketId })));
      console.log(`🔍 [SERVER] Room currentPlayers:`, room.currentPlayers.map(p => ({ username: p.username, socketId: p.socketId })));
      
      // Ищем пользователя по socketId в глобальном хранилище
      for (const [userId, userData] of users.entries()) {
        if (userData.socketId === room.hostId) {
          hostUsername = userData.username;
          console.log(`✅ [SERVER] Found host username in users: ${hostUsername}`);
          break;
        }
      }
      
      // Если не нашли в users, ищем в currentPlayers комнаты
      if (hostUsername === 'Неизвестно') {
        const hostPlayer = room.currentPlayers.find(p => p.socketId === room.hostId);
        if (hostPlayer) {
          hostUsername = hostPlayer.username;
          console.log(`✅ [SERVER] Found host username in currentPlayers: ${hostUsername}`);
        } else {
          console.log(`❌ [SERVER] Host player not found in currentPlayers for room ${room.roomId}`);
          // Попробуем найти по id (если hostId это userId, а не socketId)
          for (const [userId, userData] of users.entries()) {
            if (userId === room.hostId) {
              hostUsername = userData.username;
              console.log(`✅ [SERVER] Found host username by userId: ${hostUsername}`);
              break;
            }
          }
        }
      }
    }
    
    return {
      id: room.roomId,
      roomId: room.roomId,
      displayName: room.displayName,
      maxPlayers: room.maxPlayers,
      gameDuration: room.gameDuration || 180, // Время игры в минутах
      currentPlayers: room.currentPlayers,
      status: room.status,
      hostId: room.hostId,
      hostUsername: hostUsername, // Добавляем имя хоста
      password: room.password,
      createdAt: room.createdAt // Добавляем время создания для сортировки
    };
  })
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
      const { name, password, professionType, profession, maxPlayers, gameDuration, sharedProfession } = roomData;
      
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

      // Проверяем время игры (60-360 минут)
      const validGameDuration = gameDuration && gameDuration >= 60 && gameDuration <= 360 ? gameDuration : 180;
      if (gameDuration && (gameDuration < 60 || gameDuration > 360)) {
        socket.emit('roomCreationError', { 
          success: false, 
          error: 'Время игры должно быть от 1 до 6 часов!' 
        });
        return;
      }

      // Создаем новую комнату
      const newRoom = {
        roomId: uniqueRoomId,
        displayName: name.trim(),
        maxPlayers: maxPlayers || 2, // Используем переданное значение или по умолчанию 2 (диапазон 1-10)
        gameDuration: validGameDuration, // Время игры в минутах
        currentPlayers: [],
        status: 'waiting',
        password: password || '',
        hostId: socket.id,
        createdAt: Date.now(),
        professionType: professionType || 'individual',
        hostProfession: profession || null,
        sharedProfession: sharedProfession || null // Общая профессия для всех игроков
      };
      
      // Добавляем комнату в список
      rooms.set(uniqueRoomId, newRoom);
      
      console.log('🏠 [SERVER] Room created:', {
        roomId: uniqueRoomId,
        name: name,
        hostId: socket.id
      });
      
      // Проверяем, есть ли пользователь с таким socketId
      let hostUser = null;
      for (const [userId, userData] of users.entries()) {
        if (userData.socketId === socket.id) {
          hostUser = userData;
          break;
        }
      }
      
      if (hostUser) {
        console.log('✅ [SERVER] Host user found:', { username: hostUser.username, email: hostUser.email });
      } else {
        console.log('❌ [SERVER] Host user not found for socketId:', socket.id);
        console.log('📊 [SERVER] Available users:', Array.from(users.values()).map(u => ({ username: u.username, socketId: u.socketId })));
      }
      
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
      
      // Проверяем, есть ли отключенный игрок с таким же именем (переподключение)
      const disconnectedPlayer = room.currentPlayers.find(p => 
        p.username === playerData?.username && p.isConnected === false
      );
      
      if (disconnectedPlayer) {
        // Переподключаем отключенного игрока
        const playerIndex = room.currentPlayers.findIndex(p => p.socketId === disconnectedPlayer.socketId);
        room.currentPlayers[playerIndex] = {
          ...disconnectedPlayer,
          socketId: socket.id,
          isConnected: true,
          reconnectedAt: Date.now()
        };
        console.log('🔗 [SERVER] Player reconnected:', { roomId, username: disconnectedPlayer.username });
        socket.join(roomId);
        socket.emit('roomJoined', { success: true, roomId });
        
        // Отправляем обновленный список игроков
        io.to(roomId).emit('playersUpdate', room.currentPlayers);
        return;
      }
      
      // Проверяем, не превышено ли максимальное количество игроков (только подключенных)
      const connectedPlayers = room.currentPlayers.filter(p => p.isConnected !== false);
      if (connectedPlayers.length >= room.maxPlayers) {
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
        isConnected: true,
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
      
      // Логируем состояние комнаты после присоединения игрока
      console.log('🏠 [SERVER] Room state after player join:', {
        roomId: room.roomId,
        displayName: room.displayName,
        hostId: room.hostId,
        currentPlayers: room.currentPlayers.map(p => ({ username: p.username, socketId: p.socketId }))
      });
      
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

  // Запуск игры
  socket.on('startGame', (roomId) => {
    console.log('🚀 [SERVER] Start game requested:', { roomId });
    
    try {
      const room = rooms.get(roomId);
      if (!room) {
        socket.emit('error', { message: 'Комната не найдена' });
        return;
      }
      
      // Проверяем, что игрок является хостом комнаты
      if (room.hostId !== socket.id) {
        socket.emit('error', { message: 'Только хост может запустить игру' });
        return;
      }
      
      // Проверяем, что все игроки готовы
      const readyPlayers = room.currentPlayers.filter(p => p.ready);
      if (readyPlayers.length < 2) {
        socket.emit('error', { message: 'Для запуска игры нужно минимум 2 готовых игрока' });
        return;
      }
      
      // Меняем статус комнаты на "playing"
      room.status = 'playing';
      console.log('🚀 [SERVER] Game started in room:', { roomId, status: room.status });
      
      // Определяем случайную очередность хода
      const shuffledPlayers = [...room.currentPlayers].sort(() => Math.random() - 0.5);
      room.turnOrder = shuffledPlayers.map((player, index) => ({
        ...player,
        turnIndex: index,
        isCurrentTurn: index === 0
      }));
      
      // Устанавливаем первого игрока как текущий ход
      room.currentTurnIndex = 0;
      room.currentTurn = room.turnOrder[0].socketId;
      
      console.log('🎲 [SERVER] Turn order determined:', room.turnOrder.map(p => ({ username: p.username, turnIndex: p.turnIndex })));
      
      // Подготавливаем полные данные игроков для игры
      const gamePlayersData = room.turnOrder.map((player, index) => {
        // Получаем данные профессии
        let professionData = null;
        if (room.professionType === 'shared' && room.sharedProfession) {
          professionData = room.sharedProfession;
        } else if (room.hostProfession && player.socketId === room.hostId) {
          professionData = room.hostProfession;
        }
        
        // Создаем начальные активы на основе профессии
        const initialAssets = [];
        const initialLiabilities = [];
        
        if (professionData) {
          // Добавляем кредиты как обязательства (можно гасить)
          if (professionData.creditAuto > 0) {
            initialLiabilities.push({
              id: `credit_auto_${player.socketId}`,
              type: 'credit',
              name: 'Автокредит',
              amount: professionData.creditAuto,
              monthlyPayment: professionData.creditAuto / 12,
              description: 'Ежемесячный платеж по автокредиту'
            });
          }
          
          if (professionData.creditEducation > 0) {
            initialLiabilities.push({
              id: `credit_education_${player.socketId}`,
              type: 'credit',
              name: 'Кредит на образование',
              amount: professionData.creditEducation,
              monthlyPayment: professionData.creditEducation / 12,
              description: 'Ежемесячный платеж по кредиту на образование'
            });
          }
          
          if (professionData.creditHousing > 0) {
            initialLiabilities.push({
              id: `credit_housing_${player.socketId}`,
              type: 'credit',
              name: 'Ипотека',
              amount: professionData.creditHousing,
              monthlyPayment: professionData.creditHousing / 12,
              description: 'Ежемесячный платеж по ипотеке'
            });
          }
          
          if (professionData.creditCards > 0) {
            initialLiabilities.push({
              id: `credit_cards_${player.socketId}`,
              type: 'credit',
              name: 'Кредитные карты',
              amount: professionData.creditCards,
              monthlyPayment: professionData.creditCards / 12,
              description: 'Ежемесячный платеж по кредитным картам'
            });
          }
          
          // Добавляем базовые активы (квартира, машина) если есть соответствующие кредиты
          if (professionData.creditHousing > 0) {
            initialAssets.push({
              id: `house_${player.socketId}`,
              type: 'real_estate',
              name: 'Квартира',
              value: professionData.creditHousing * 1.2, // Стоимость немного выше кредита
              monthlyExpense: professionData.creditHousing / 12,
              description: 'Квартира в ипотеке',
              isMortgaged: true
            });
          }
          
          if (professionData.creditAuto > 0) {
            initialAssets.push({
              id: `car_${player.socketId}`,
              type: 'vehicle',
              name: 'Автомобиль',
              value: professionData.creditAuto * 1.1, // Стоимость немного выше кредита
              monthlyExpense: professionData.creditAuto / 12,
              description: 'Автомобиль в кредите',
              isFinanced: true
            });
          }
        }
        
        return {
          id: player.socketId,
          username: player.username,
          socketId: player.socketId,
          turnIndex: index,
          isCurrentTurn: index === 0,
          ready: player.ready,
          joinedAt: player.joinedAt,
          
          // Данные профессии
          profession: professionData,
          professionId: professionData?.id || null,
          
          // Игровые данные
          balance: professionData?.balance || 2000,
          position: 0,
          cashFlow: professionData?.cashFlow || 0,
          monthlyIncome: professionData?.salary || 0,
          
          // Начальные активы и обязательства
          assets: initialAssets,
          liabilities: initialLiabilities,
          
          // Статус игры
          isFinancialFree: false,
          hasReachedBigCircle: false
        };
      });
      
      // Сохраняем данные игроков в комнате
      room.gamePlayersData = gamePlayersData;
      
      // Запускаем систему перерывов
      startBreakSystem(roomId);
      
      // Отправляем событие запуска игры всем игрокам в комнате
      io.to(roomId).emit('gameStarted', {
        success: true,
        roomId: roomId,
        status: room.status,
        turnOrder: room.turnOrder.map(p => ({ username: p.username, turnIndex: p.turnIndex })),
        currentTurn: room.currentTurn,
        players: gamePlayersData
      });
      
      // Отправляем обновленный список комнат всем
      const roomsList = getRoomsList();
      io.emit('roomsList', roomsList);
      
      console.log('🎮 [SERVER] Game started successfully with players data:', {
        roomId,
        playersCount: gamePlayersData.length,
        turnOrder: room.turnOrder.map(p => p.username)
      });
      
    } catch (error) {
      console.error('❌ [SERVER] Error starting game:', error);
      socket.emit('error', { message: 'Ошибка запуска игры' });
    }
  });

  // Получение состояния игры
  socket.on('getGameState', (roomId) => {
    console.log('🎮 [SERVER] getGameState requested:', { roomId });
    
    try {
      const room = rooms.get(roomId);
      if (!room) {
        socket.emit('error', { message: 'Комната не найдена' });
        return;
      }
      
      // Отправляем текущее состояние игры
      socket.emit('gameState', {
        roomId: roomId,
        status: room.status,
        players: room.currentPlayers,
        gamePhase: room.status === 'playing' ? 'playing' : 'waiting'
      });
      
      console.log('🎮 [SERVER] Game state sent:', { roomId, status: room.status });
      
    } catch (error) {
      console.error('❌ [SERVER] Error getting game state:', error);
      socket.emit('error', { message: 'Ошибка получения состояния игры' });
    }
  });

  // Получение данных игроков в игре
  socket.on('getGamePlayers', (roomId) => {
    console.log('👥 [SERVER] getGamePlayers requested:', { roomId });
    
    try {
      const room = rooms.get(roomId);
      if (!room) {
        socket.emit('error', { message: 'Комната не найдена' });
        return;
      }
      
      if (room.status !== 'playing') {
        socket.emit('error', { message: 'Игра еще не началась' });
        return;
      }
      
      if (!room.gamePlayersData) {
        socket.emit('error', { message: 'Данные игроков не найдены' });
        return;
      }
      
      // Отправляем данные игроков в игре
      socket.emit('gamePlayersData', {
        roomId: roomId,
        turnOrder: room.turnOrder.map(p => ({ username: p.username, turnIndex: p.turnIndex })),
        currentTurn: room.currentTurn,
        currentTurnIndex: room.currentTurnIndex,
        players: room.gamePlayersData
      });
      
      console.log('👥 [SERVER] Game players data sent:', { 
        roomId, 
        playersCount: room.gamePlayersData.length,
        currentTurn: room.currentTurn 
      });
      
    } catch (error) {
      console.error('❌ [SERVER] Error getting game players:', error);
      socket.emit('error', { message: 'Ошибка получения данных игроков' });
    }
  });

  // Завершение игры
  socket.on('endGame', (roomId) => {
    console.log('🏁 [SERVER] End game requested:', { roomId });
    
    try {
      const room = rooms.get(roomId);
      if (!room) {
        socket.emit('error', { message: 'Комната не найдена' });
        return;
      }
      
      // Проверяем, что игрок является хостом комнаты
      if (room.hostId !== socket.id) {
        socket.emit('error', { message: 'Только хост может завершить игру' });
        return;
      }
      
      // Останавливаем систему перерывов
      stopBreakSystem(roomId);
      
      // Меняем статус комнаты на "finished"
      room.status = 'finished';
      console.log('🏁 [SERVER] Game ended in room:', { roomId, status: room.status });
      
      // Отправляем событие завершения игры всем игрокам в комнате
      io.to(roomId).emit('gameEnded', {
        success: true,
        roomId: roomId,
        status: room.status
      });
      
      // Отправляем обновленный список комнат всем
      const roomsList = getRoomsList();
      io.emit('roomsList', roomsList);
      
    } catch (error) {
      console.error('❌ [SERVER] Error ending game:', error);
      socket.emit('error', { message: 'Ошибка завершения игры' });
    }
  });

  // Получение данных комнаты
  socket.on('getRoomData', (roomId) => {
    console.log('🏠 [SERVER] getRoomData requested:', { roomId });
    console.log('🏠 [SERVER] Всего комнат:', rooms.size);
    console.log('🏠 [SERVER] Ключи комнат:', Array.from(rooms.keys()));
    
    try {
      const room = rooms.get(roomId);
      console.log('🏠 [SERVER] Найдена комната:', room);
      
      if (!room) {
        console.log('❌ [SERVER] Комната не найдена в Map');
        socket.emit('error', { message: 'Комната не найдена' });
        return;
      }
      
      // Находим имя хоста
      let hostUsername = 'Неизвестно';
      if (room.hostId) {
        console.log(`🔍 [SERVER] getRoomData: Looking for host username, hostId: ${room.hostId}`);
        
        // Ищем пользователя по socketId в глобальном хранилище
        for (const [userId, userData] of users.entries()) {
          if (userData.socketId === room.hostId) {
            hostUsername = userData.username;
            console.log(`✅ [SERVER] getRoomData: Found host username in users: ${hostUsername}`);
            break;
          }
        }
        
        // Если не нашли в users, ищем в currentPlayers комнаты
        if (hostUsername === 'Неизвестно') {
          const hostPlayer = room.currentPlayers.find(p => p.socketId === room.hostId);
          if (hostPlayer) {
            hostUsername = hostPlayer.username;
            console.log(`✅ [SERVER] getRoomData: Found host username in currentPlayers: ${hostUsername}`);
          } else {
            console.log(`❌ [SERVER] getRoomData: Host player not found in currentPlayers`);
            // Попробуем найти по id (если hostId это userId, а не socketId)
            for (const [userId, userData] of users.entries()) {
              if (userId === room.hostId) {
                hostUsername = userData.username;
                console.log(`✅ [SERVER] getRoomData: Found host username by userId: ${hostUsername}`);
                break;
              }
            }
          }
        }
      }
      
      // Отправляем данные комнаты клиенту
      socket.emit('roomData', {
        roomId: room.roomId,
        displayName: room.displayName,
        maxPlayers: room.maxPlayers,
        currentPlayers: room.currentPlayers,
        status: room.status,
        hostId: room.hostId,
        hostUsername: hostUsername,
        password: room.password,
        isPublic: room.password === '', // Комната считается открытой, если нет пароля
        professionType: room.professionType || 'individual',
        hostProfession: room.hostProfession || null,
        createdAt: room.createdAt
      });
      
      console.log('🏠 [SERVER] Room data sent:', { roomId, displayName: room.displayName });
      
      // Также отправляем обновленный список игроков
      socket.emit('playersUpdate', room.currentPlayers);
      console.log('👥 [SERVER] Players update sent after roomData:', room.currentPlayers.length, 'players');
      
    } catch (error) {
      console.error('❌ [SERVER] Error getting room data:', error);
      socket.emit('error', { message: 'Ошибка получения данных комнаты' });
    }
  });

  // Восстановление состояния комнаты после переподключения
  socket.on('restoreRoomState', (roomId) => {
    console.log('🔄 [SERVER] restoreRoomState requested:', { roomId, socketId: socket.id });
    
    try {
      const room = rooms.get(roomId);
      if (!room) {
        console.log('❌ [SERVER] Room not found for restore:', roomId);
        return;
      }
      
      // Проверяем, был ли игрок в этой комнате
      const existingPlayer = room.currentPlayers.find(p => p.socketId === socket.id);
      if (existingPlayer) {
        console.log('✅ [SERVER] Player found in room, restoring state:', { 
          roomId, 
          username: existingPlayer.username,
          socketId: socket.id 
        });
        
        // Подключаем сокет к комнате
        socket.join(roomId);
        
        // Отправляем данные комнаты
        socket.emit('roomData', {
          roomId: room.roomId,
          displayName: room.displayName,
          maxPlayers: room.maxPlayers,
          currentPlayers: room.currentPlayers,
          status: room.status,
          hostId: room.hostId,
          hostUsername: existingPlayer.username, // Используем имя текущего игрока
          password: room.password,
          isPublic: room.password === '',
          professionType: room.professionType || 'individual',
          hostProfession: room.hostProfession || null,
          createdAt: room.createdAt
        });
        
        // Отправляем обновленный список игроков
        io.to(roomId).emit('playersUpdate', room.currentPlayers);
        
        console.log('✅ [SERVER] Room state restored for player:', existingPlayer.username);
      } else {
        console.log('⚠️ [SERVER] Player not found in room, cannot restore state:', { roomId, socketId: socket.id });
      }
    } catch (error) {
      console.error('❌ [SERVER] Error restoring room state:', error);
    }
  });

  // 🏦 Банковские операции
  socket.on('bankTransfer', (data) => {
    try {
      const { roomId, playerId, recipient, amount } = data;
      console.log('🏦 [SERVER] Bank transfer request:', { roomId, playerId, recipient, amount });
      
      const room = rooms.get(roomId);
      if (!room) {
        console.log('❌ [SERVER] Room not found for bank transfer:', roomId);
        return;
      }
      
      const player = room.currentPlayers.find(p => p.id === playerId);
      if (!player) {
        console.log('❌ [SERVER] Player not found for bank transfer:', playerId);
        return;
      }
      
      // Проверяем баланс игрока
      if (player.balance < amount) {
        socket.emit('bankTransferError', { message: 'Недостаточно средств' });
        return;
      }
      
      // Выполняем перевод
      player.balance -= amount;
      
      // Ищем получателя в той же комнате
      const recipientPlayer = room.currentPlayers.find(p => p.username === recipient);
      if (recipientPlayer) {
        recipientPlayer.balance += amount;
        console.log('✅ [SERVER] Transfer completed between players:', { 
          from: player.username, 
          to: recipient, 
          amount 
        });
      }
      
      // Отправляем обновление всем игрокам в комнате
      io.to(roomId).emit('playersUpdate', room.currentPlayers);
      socket.emit('bankTransferSuccess', { 
        message: `Перевод $${amount} выполнен успешно`,
        newBalance: player.balance 
      });
      
    } catch (error) {
      console.error('❌ [SERVER] Error in bank transfer:', error);
      socket.emit('bankTransferError', { message: 'Ошибка при выполнении перевода' });
    }
  });

  socket.on('creditPayment', (data) => {
    try {
      const { roomId, playerId, creditType, amount } = data;
      console.log('🏦 [SERVER] Credit payment request:', { roomId, playerId, creditType, amount });
      
      const room = rooms.get(roomId);
      if (!room) {
        console.log('❌ [SERVER] Room not found for credit payment:', roomId);
        return;
      }
      
      const player = room.currentPlayers.find(p => p.id === playerId);
      if (!player) {
        console.log('❌ [SERVER] Player not found for credit payment:', playerId);
        return;
      }
      
      // Проверяем баланс игрока
      if (player.balance < amount) {
        socket.emit('creditPaymentError', { message: 'Недостаточно средств' });
        return;
      }
      
      // Проверяем наличие кредита
      if (!player.credits || !player.credits[creditType] || player.credits[creditType] < amount) {
        socket.emit('creditPaymentError', { message: 'Сумма превышает размер кредита' });
        return;
      }
      
      // Выполняем погашение кредита
      player.balance -= amount;
      player.credits[creditType] -= amount;
      
      // Если кредит полностью погашен, удаляем его
      if (player.credits[creditType] <= 0) {
        delete player.credits[creditType];
      }
      
      console.log('✅ [SERVER] Credit payment completed:', { 
        player: player.username, 
        creditType, 
        amount,
        remainingCredit: player.credits[creditType] || 0
      });
      
      // Отправляем обновление всем игрокам в комнате
      io.to(roomId).emit('playersUpdate', room.currentPlayers);
      socket.emit('creditPaymentSuccess', { 
        message: `Погашение кредита $${amount} выполнено`,
        newBalance: player.balance,
        remainingCredits: player.credits
      });
      
    } catch (error) {
      console.error('❌ [SERVER] Error in credit payment:', error);
      socket.emit('creditPaymentError', { message: 'Ошибка при погашении кредита' });
    }
  });

  socket.on('getTransactionHistory', (data) => {
    try {
      const { roomId, playerId } = data;
      console.log('🏦 [SERVER] Transaction history request:', { roomId, playerId });
      
      const room = rooms.get(roomId);
      if (!room) {
        console.log('❌ [SERVER] Room not found for transaction history:', roomId);
        return;
      }
      
      // В реальном приложении здесь была бы база данных
      // Пока возвращаем тестовые данные
      const transactions = [
        {
          id: 1,
          from: 'MAG',
          to: 'Алексей',
          amount: 100,
          type: 'transfer',
          timestamp: '2024-01-15 14:30',
          status: 'completed'
        },
        {
          id: 2,
          from: 'Мария',
          to: 'MAG',
          amount: 50,
          type: 'transfer',
          timestamp: '2024-01-15 13:45',
          status: 'completed'
        }
      ];
      
      socket.emit('transactionHistory', transactions);
      
    } catch (error) {
      console.error('❌ [SERVER] Error getting transaction history:', error);
      socket.emit('transactionHistoryError', { message: 'Ошибка при получении истории транзакций' });
    }
  });

  // Обработчик движения игрока
  socket.on('playerMove', (roomId, playerId, newPosition) => {
    console.log('🎯 [SERVER] Player move requested:', { roomId, playerId, newPosition });
    
    try {
      const room = rooms.get(roomId);
      if (!room) {
        socket.emit('playerMoveError', { success: false, error: 'Комната не найдена' });
        return;
      }
      
      // Находим игрока в комнате
      const player = room.currentPlayers.find(p => p.socketId === playerId);
      if (!player) {
        socket.emit('playerMoveError', { success: false, error: 'Игрок не найден' });
        return;
      }
      
      // Обновляем позицию игрока
      player.position = newPosition;
      
      console.log('🎯 [SERVER] Player position updated:', {
        roomId,
        username: player.username,
        newPosition
      });
      
      // Отправляем обновленную позицию всем игрокам в комнате
      io.to(roomId).emit('playerPositionUpdate', {
        playerId: playerId,
        position: newPosition,
        username: player.username
      });
      
      // Отправляем обновленный список игроков
      io.to(roomId).emit('playersUpdate', room.currentPlayers);
      
    } catch (error) {
      console.error('❌ [SERVER] Error updating player position:', error);
      socket.emit('playerMoveError', { success: false, error: 'Ошибка обновления позиции игрока' });
    }
  });

  // Обработчик обновления данных игрока (баланс, активы, профессия)
  socket.on('playerDataUpdate', (roomId, playerId, playerData) => {
    console.log('👤 [SERVER] Player data update requested:', { roomId, playerId, playerData });
    
    try {
      const room = rooms.get(roomId);
      if (!room) {
        socket.emit('playerDataUpdateError', { success: false, error: 'Комната не найдена' });
        return;
      }
      
      // Находим игрока в комнате
      const player = room.currentPlayers.find(p => p.socketId === playerId);
      if (!player) {
        socket.emit('playerDataUpdateError', { success: false, error: 'Игрок не найден' });
        return;
      }
      
      // Обновляем данные игрока
      Object.assign(player, playerData);
      
      console.log('👤 [SERVER] Player data updated:', {
        roomId,
        username: player.username,
        updatedFields: Object.keys(playerData)
      });
      
      // Отправляем обновленный список игроков всем в комнате
      io.to(roomId).emit('playersUpdate', room.currentPlayers);
      
    } catch (error) {
      console.error('❌ [SERVER] Error updating player data:', error);
      socket.emit('playerDataUpdateError', { success: false, error: 'Ошибка обновления данных игрока' });
    }
  });

  // Обработчик смены хода игрока
  socket.on('changePlayerTurn', (roomId, newCurrentPlayerIndex) => {
    console.log('🎯 [SERVER] Change player turn requested:', { roomId, newCurrentPlayerIndex });
    
    try {
      const room = rooms.get(roomId);
      if (!room) {
        socket.emit('changePlayerTurnError', { success: false, error: 'Комната не найдена' });
        return;
      }
      
      // Проверяем, что индекс валидный
      if (newCurrentPlayerIndex < 0 || newCurrentPlayerIndex >= room.currentPlayers.length) {
        socket.emit('changePlayerTurnError', { success: false, error: 'Неверный индекс игрока' });
        return;
      }
      
      // Обновляем текущего игрока
      room.currentPlayerIndex = newCurrentPlayerIndex;
      
      console.log('🎯 [SERVER] Player turn changed:', {
        roomId,
        newCurrentPlayerIndex,
        currentPlayer: room.currentPlayers[newCurrentPlayerIndex]?.username
      });
      
      // Отправляем обновление всем игрокам в комнате
      io.to(roomId).emit('playerTurnChanged', {
        currentPlayerIndex: newCurrentPlayerIndex,
        currentPlayer: room.currentPlayers[newCurrentPlayerIndex]
      });
      
    } catch (error) {
      console.error('❌ [SERVER] Error changing player turn:', error);
      socket.emit('changePlayerTurnError', { success: false, error: 'Ошибка смены хода' });
    }
  });

  // Обработчик синхронизации времени хода
  socket.on('syncTurnTimer', (roomId, timeLeft, isTurnEnding) => {
    console.log('⏰ [SERVER] Turn timer sync requested:', { roomId, timeLeft, isTurnEnding });
    
    try {
      const room = rooms.get(roomId);
      if (!room) {
        socket.emit('syncTurnTimerError', { success: false, error: 'Комната не найдена' });
        return;
      }
      
      // Обновляем таймер в комнате
      room.turnTimeLeft = timeLeft;
      room.isTurnEnding = isTurnEnding;
      
      // Отправляем синхронизацию всем игрокам в комнате
      io.to(roomId).emit('turnTimerSynced', {
        timeLeft: timeLeft,
        isTurnEnding: isTurnEnding
      });
      
    } catch (error) {
      console.error('❌ [SERVER] Error syncing turn timer:', error);
      socket.emit('syncTurnTimerError', { success: false, error: 'Ошибка синхронизации таймера' });
    }
  });

  // Обработчик отключения клиента
  socket.on('disconnect', () => {
    console.log(`🔌 [SERVER] Client disconnected: ${socket.id}`);
    
    // Помечаем игрока как отключенного, но не удаляем из комнат
    rooms.forEach((room, roomId) => {
      const playerIndex = room.currentPlayers.findIndex(p => p.socketId === socket.id);
      if (playerIndex !== -1) {
        const disconnectedPlayer = room.currentPlayers[playerIndex];
        // Помечаем игрока как отключенного
        room.currentPlayers[playerIndex] = {
          ...disconnectedPlayer,
          isConnected: false,
          disconnectedAt: Date.now()
        };
        console.log('🔌 [SERVER] Player marked as disconnected:', { 
          roomId, 
          username: disconnectedPlayer.username,
          socketId: socket.id 
        });
        
        // Если отключившийся игрок был хостом, останавливаем систему перерывов
        if (room.hostId === socket.id) {
          console.log(`🔌 [SERVER] Host disconnected, stopping break system for room: ${roomId}`);
          stopBreakSystem(roomId);
        }
        
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