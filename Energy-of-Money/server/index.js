const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const User = require('./models/User');
const fs = require('fs');
const path = require('path');
const GameDatabase = require('./database');

// Определяем порт
const PORT = process.env.PORT || 5000;

// Add pg for PostgreSQL
const { Pool } = require('pg');
const pool = new Pool({ /* config */ });

const Rating = require('./models/Rating');

// Глобальное хранилище пользователей (в памяти)
const users = new Map(); // userId -> userData
const usernameToUserId = new Map(); // username -> userId

// Функция для генерации уникального User ID
const generateUserId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `user_${timestamp}_${randomStr}`;
};

// Функция для проверки уникальности username
const isUsernameUnique = (username) => {
  // Проверяем в БД
  const existingUser = db.getUserByUsername(username);
  // Также проверяем в памяти для обратной совместимости
  const inMemory = !usernameToUserId.has(username.toLowerCase());
  
  return !existingUser && inMemory;
};

// Функция для регистрации пользователя
const registerUser = (username, email, password, socketId) => {
  // Используем username как userId для уникальности
  const userId = username.toLowerCase(); // username становится userId
  const userData = {
    id: userId,
    username: username,
    email: email,
    password: password, // В реальном приложении пароль нужно хешировать
    socketId: socketId,
    createdAt: Date.now(),
    lastSeen: Date.now()
  };
  
  // Сохраняем в БД
  const dbSuccess = db.createUser({
    id: userId,
    username: username,
    email: email
  });
  
  if (dbSuccess) {
    // Также сохраняем в памяти для обратной совместимости
    users.set(userId, userData);
    usernameToUserId.set(username.toLowerCase(), userId);
    
    console.log(`👤 [SERVER] User registered in DB: ${username} (${email}) (ID: ${userId})`);
    return userData;
  } else {
    console.error(`❌ [SERVER] Failed to register user in DB: ${username}`);
    return null;
  }
};

// Функция для поиска пользователя по email
const getUserByEmail = (email) => {
  console.log(`🔍 [SERVER] Searching for user with email: ${email}`);
  
  // Сначала ищем в БД
  const dbUsers = db.getAllUsers();
  const dbUser = dbUsers.find(user => user.email.toLowerCase() === email.toLowerCase());
  
  if (dbUser) {
    console.log(`✅ [SERVER] User found in DB:`, { id: dbUser.id, username: dbUser.username, email: dbUser.email });
    // Обновляем время последнего входа
    db.updateUserLastLogin(dbUser.id);
    return dbUser;
  }
  
  // Также проверяем в памяти для обратной совместимости
  console.log(`🔍 [SERVER] Checking in-memory users:`, Array.from(users.entries()).map(([id, user]) => ({ id, username: user.username, email: user.email })));
  
  for (const [userId, userData] of users.entries()) {
    if (userData.email.toLowerCase() === email.toLowerCase()) {
      console.log(`✅ [SERVER] User found in memory:`, { id: userData.id, username: userData.username, email: userData.email });
      return userData;
    }
  }
  
  console.log(`❌ [SERVER] User not found with email: ${email}`);
  return null;
};

// Функция для проверки пароля пользователя
const checkUserPassword = (userData, password) => {
  return userData.password === password; // В реальном приложении сравнивать хеши
};

// Функция для получения пользователя по ID
const getUserById = (userId) => {
  return users.get(userId);
};

// Функция для получения пользователя по username
const getUserByUsername = (username) => {
  const userId = usernameToUserId.get(username.toLowerCase());
  return userId ? users.get(userId) : null;
};

// Функция для получения username по socketId
const getUsernameBySocketId = (socketId) => {
  console.log(`🔍 [SERVER] getUsernameBySocketId called for socketId: ${socketId}`);
  console.log(`🔍 [SERVER] Current users:`, Array.from(users.entries()).map(([id, data]) => ({ id, username: data.username, socketId: data.socketId })));
  
  for (const [userId, userData] of users.entries()) {
    if (userData.socketId === socketId) {
      console.log(`✅ [SERVER] Found username: ${userData.username} for socketId: ${socketId}`);
      return userData.username;
    }
  }
  
  console.log(`❌ [SERVER] No username found for socketId: ${socketId}`);
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

// Функция для исправления hostId в существующих комнатах
const fixHostIdInRooms = () => {
  console.log('🔧 [SERVER] Fixing hostId in existing rooms...');
  
  Object.keys(rooms).forEach(roomId => {
    const room = rooms[roomId];
    
    // Если у комнаты нет hostId или hostId не соответствует ни одному игроку
    if (!room.hostId || !room.currentPlayers.find(p => p.id === room.hostId || p.socketId === room.hostId)) {
      // Находим первого активного игрока
      const activePlayer = room.currentPlayers.find(p => !p.offline);
      
      if (activePlayer) {
        room.hostId = activePlayer.id; // Используем player.id для стабильности
        room.hostUsername = activePlayer.username;
        console.log(`👑 [SERVER] Fixed hostId for room ${roomId}: ${activePlayer.username}`);
      } else if (room.currentPlayers.length > 0) {
        // Если нет активных игроков, берем первого
        room.hostId = room.currentPlayers[0].id; // Используем player.id для стабильности
        room.hostUsername = room.currentPlayers[0].username;
        console.log(`👑 [SERVER] Fixed hostId for room ${roomId} (no active players): ${room.currentPlayers[0].username}`);
      }
      
      // Отправляем обновленные данные комнаты
      io.to(roomId).emit('roomData', { 
        roomId: room.roomId, 
        maxPlayers: room.maxPlayers, 
        status: room.status, 
        hostId: room.hostId, 
        timer: room.timer, 
        currentTurn: room.currentTurn 
      });
    }
    
    // Если у комнаты есть hostId, но нет hostUsername, пытаемся его восстановить
    if (room.hostId && !room.hostUsername) {
      // Сначала пытаемся найти username среди текущих игроков по id
      const hostPlayer = room.currentPlayers.find(p => p.id === room.hostId);
      if (hostPlayer && hostPlayer.username) {
        room.hostUsername = hostPlayer.username;
        console.log(`🔧 [SERVER] Restored hostUsername from current players for room ${roomId}: ${hostPlayer.username}`);
      } else {
        // Если не нашли по id, пытаемся найти по socketId (для обратной совместимости)
        const hostPlayerBySocket = room.currentPlayers.find(p => p.socketId === room.hostId);
        if (hostPlayerBySocket && hostPlayerBySocket.username) {
          room.hostUsername = hostPlayerBySocket.username;
          room.hostId = hostPlayerBySocket.id; // Обновляем hostId на стабильный player.id
          console.log(`🔧 [SERVER] Restored hostUsername via socketId and updated hostId for room ${roomId}: ${hostPlayerBySocket.username}`);
        } else {
          console.log(`⚠️ [SERVER] Could not restore hostUsername for room ${roomId}, hostId: ${room.hostId}`);
        }
      }
    }
  });
  
  console.log('✅ [SERVER] hostId fixing completed');
};

// Импортируем профессии
const PROFESSIONS = [
  {
    id: 1,
    name: 'Дворник',
    salary: 2000,
    expenses: 200,
    balance: 2000,
    passiveIncome: 0,
    description: 'Уборка улиц и дворов',
    charity: false
  },
  {
    id: 2,
    name: 'Курьер',
    salary: 2500,
    expenses: 300,
    balance: 2500,
    passiveIncome: 0,
    description: 'Доставка товаров и документов',
    charity: false
  },
  {
    id: 3,
    name: 'Водитель',
    salary: 3000,
    expenses: 400,
    balance: 3000,
    passiveIncome: 0,
    description: 'Управление транспортными средствами',
    charity: false
  },
  {
    id: 4,
    name: 'Продавец',
    salary: 3500,
    expenses: 500,
    balance: 3500,
    passiveIncome: 0,
    description: 'Продажа товаров и услуг',
    charity: false
  },
  {
    id: 5,
    name: 'Официант',
    salary: 4000,
    expenses: 600,
    balance: 4000,
    passiveIncome: 0,
    description: 'Обслуживание в ресторанах',
    charity: false
  },
  {
    id: 6,
    name: 'Учитель',
    salary: 5000,
    expenses: 800,
    balance: 5000,
    passiveIncome: 0,
    description: 'Обучение детей и взрослых',
    charity: false
  },
  {
    id: 7,
    name: 'Медсестра',
    salary: 6000,
    expenses: 1000,
    balance: 6000,
    passiveIncome: 0,
    description: 'Медицинская помощь',
    charity: false
  },
  {
    id: 8,
    name: 'Врач',
    salary: 8000,
    expenses: 2000,
    balance: 4000,
    passiveIncome: 0,
    description: 'Медицинская практика',
    charity: false
  },
  {
    id: 9,
    name: 'Инженер',
    salary: 7000,
    expenses: 1500,
    balance: 7000,
    passiveIncome: 0,
    description: 'Техническое проектирование',
    charity: false
  },
  {
    id: 10,
    name: 'Юрист',
    salary: 9000,
    expenses: 2500,
    balance: 9000,
    passiveIncome: 0,
    description: 'Правовая консультация',
    charity: false
  }
];



// Функция генерации уникального порядкового ID для комнат
let lastRoomId = 0;
const generateSequentialRoomId = () => {
  lastRoomId++;
  const roomId = `room${lastRoomId}`;
  console.log(`🔢 [SERVER] Generated room ID: ${roomId} (lastRoomId: ${lastRoomId})`);
  return roomId;
};



const app = express();
const server = http.createServer(app);

// Инициализируем базу данных
const db = new GameDatabase();

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Allow JSON bodies
app.use(express.json());
const io = socketIo(server, { 
  cors: { 
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 45000,
  maxHttpBufferSize: 1e8,
  allowRequest: (req, callback) => {
    console.log('🔌 [SERVER] Socket.IO connection request from:', req.headers.origin || 'unknown');
    callback(null, true);
  }
});



// Serve client files (moved to end after API routes)

// Admin: reset all rooms (dangerous)
app.post('/admin/reset', (req, res) => {
  try {
    Object.keys(rooms).forEach((id) => delete rooms[id]);
    createDefaultRoom();
    const roomsList = getSortedRoomsList();
    io.emit('roomsList', roomsList);
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
});

// Команда для просмотра всех комнат (отладка)
app.get('/api/admin/rooms', (req, res) => {
  try {
    const roomsInfo = Object.keys(rooms).map(roomId => {
      const room = rooms[roomId];
      return {
        roomId,
        status: room.status,
        maxPlayers: room.maxPlayers,
        currentPlayers: room.currentPlayers.length,
        players: room.currentPlayers.map(p => ({
          id: p.id,
          username: p.username,
          socketId: p.socketId,
          ready: p.ready
        }))
      };
    });
    
    res.json({
      success: true,
      totalRooms: roomsInfo.length,
      rooms: roomsInfo
    });
    
    console.log('📊 [ADMIN] Rooms info requested, total rooms:', roomsInfo.length);
  } catch (error) {
    console.error('❌ [ADMIN] Error getting rooms info:', error);
    res.status(500).json({ error: 'Failed to get rooms info' });
  }
});

// Команда для просмотра конкретной комнаты
app.get('/api/admin/rooms/:roomId', (req, res) => {
  try {
    const { roomId } = req.params;
    
    if (!rooms[roomId]) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    const room = rooms[roomId];
    res.json({
      roomId,
      status: room.status,
      maxPlayers: room.maxPlayers,
      currentPlayers: room.currentPlayers.length,
      players: room.currentPlayers.map(p => ({
        id: p.id,
        username: p.username,
        socketId: p.socketId,
        ready: p.ready,
        profession: p.profession?.name || 'Не назначена'
      }))
    });
  } catch (error) {
    console.error('❌ [ADMIN] Error getting room info:', error);
    res.status(500).json({ error: 'Failed to get room info' });
  }
});

// Команда для очистки дублей во всех комнатах (админ)
app.post('/api/admin/cleanup-duplicates', async (req, res) => {
  try {
    let totalCleaned = 0;
    
    for (const roomId in rooms) {
      const room = rooms[roomId];
      const cleaned = cleanupDuplicatePlayers(room);
      totalCleaned += cleaned;
      
      if (cleaned > 0) {
        // Обновляем клиентов
        io.to(roomId).emit('playersUpdate', room.currentPlayers);
      }
    }
    
    persistRooms();
    
    res.json({ 
      success: true, 
      message: `Cleaned up ${totalCleaned} duplicate players`,
      totalCleaned 
    });
    
    console.log('🧹 [ADMIN] Cleaned up duplicates in all rooms:', totalCleaned);
  } catch (error) {
    console.error('❌ [ADMIN] Error cleaning up duplicates:', error);
    res.status(500).json({ error: 'Failed to cleanup duplicates' });
  }
});

// Serve static files from client build (moved to end after API routes)

// Connect to MongoDB (optional)
mongoose.connect('mongodb://localhost:27017/potok-deneg')
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => {
    console.warn('⚠️ MongoDB connection failed, continuing without database:', err.message);
    console.log('ℹ️ Server will run with in-memory storage only');
  });

// Load configurations
const configPath = path.join(__dirname, '../shared/seed_v1.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Добавляем логирование загрузки конфигурации
console.log('📋 [SERVER] Config loaded:', {
  rules: config.rules,
  defaultTimer: config.rules.defaultTimer,
  professionsCount: config.professions?.length || 0,
  boardCellsCount: config.board?.cells?.length || 0
});

// Simple persistence for rooms (to avoid rooms disappearing on restart)
const ROOMS_FILE = path.join(__dirname, '../shared/rooms.json');

// Функция для создания безопасной копии данных игроков без циклических ссылок
function createSafePlayerData(player) {
  return {
    id: player.id,
    username: player.username,
    socketId: player.socketId,
    offline: player.offline,
    ready: player.ready,
    profession: player.profession ? {
      id: player.profession.id,
      name: player.profession.name,
      salary: player.profession.salary,
      expenses: player.profession.expenses,
      description: player.profession.description
    } : null,
    dream: player.dream ? {
      id: player.dream.id,
      name: player.dream.name,
      cost: player.dream.cost,
      description: player.dream.description
    } : null,
    balance: player.balance,
    salary: player.salary,
    expenses: player.expenses,
    passiveIncome: player.passiveIncome,
    totalExpenses: player.totalExpenses,
    monthlyCashflow: player.monthlyCashflow,
    assets: player.assets,
    charity: player.charity
  };
}
function persistRooms() {
  try {
    // Создаем копию комнат для сохранения, убирая циклические ссылки
    const roomsToSave = {};
    
    Object.keys(rooms).forEach(roomId => {
      const room = rooms[roomId];
      if (room) {
        // Создаем чистую копию комнаты без циклических ссылок
        const cleanRoom = {
          roomId: room.roomId,
          displayName: room.displayName,
          originalRequestedId: room.originalRequestedId,
          maxPlayers: room.maxPlayers,
          currentPlayers: room.currentPlayers ? room.currentPlayers.map(player => ({
            id: player.id,
            username: player.username,
            socketId: player.socketId,
            offline: player.offline,
            ready: player.ready,
            profession: player.profession,
            balance: player.balance,
            salary: player.salary,
            expenses: player.expenses,
            passiveIncome: player.passiveIncome,
            totalExpenses: player.totalExpenses,
            monthlyCashflow: player.monthlyCashflow,
            assets: player.assets,
            charity: player.charity
          })) : [],
          status: room.status,
          password: room.password,
          hostId: room.hostId,
          timer: room.timer,
          currentTurn: room.currentTurn,
          board: room.board,
          createdAt: room.createdAt,
          orderDetermination: room.orderDetermination ? {
            phase: room.orderDetermination.phase,
            players: room.orderDetermination.players.map(p => ({
              id: p.id,
              username: p.username,
              diceRoll: p.diceRoll,
              tieBreakRoll: p.tieBreakRoll
            })),
            timer: room.orderDetermination.timer
          } : null
        };
        
        roomsToSave[roomId] = cleanRoom;
      }
    });
    
    // ПОЛНАЯ ОЧИСТКА ГОСТЕВЫХ И ТЕСТОВЫХ ИГРОКОВ ПЕРЕД СОХРАНЕНИЕМ
    Object.values(roomsToSave).forEach(room => {
      if (room && room.currentPlayers) {
        cleanupGuestPlayers(room);
      }
    });
    
    fs.writeFileSync(ROOMS_FILE, JSON.stringify(roomsToSave, null, 2));
  } catch (e) {
    console.error('Persist rooms error:', e);
  }
}
function loadRooms() {
  try {
    if (fs.existsSync(ROOMS_FILE)) {
      const data = fs.readFileSync(ROOMS_FILE, 'utf8');
      const obj = JSON.parse(data);
      Object.keys(obj).forEach(k => (rooms[k] = obj[k]));
      
      // ПОЛНАЯ ОЧИСТКА ГОСТЕВЫХ И ТЕСТОВЫХ ИГРОКОВ ПРИ ЗАГРУЗКЕ
      Object.values(rooms).forEach(room => {
        if (room && room.currentPlayers) {
          cleanupGuestPlayers(room);
        }
      });
      
      // Исправляем hostId в загруженных комнатах
      fixHostIdInRooms();
    }
  } catch (e) {
    console.error('Load rooms error:', e);
  }
}

// Убираем старый register route, теперь используем /api/auth/register

// Update rooms structure to include timer, players with full data, board state
const rooms = {}; // { roomId: { maxPlayers, currentPlayers: [...], status, password, timer, currentTurn, board, createdAt } }

// Функция для получения отсортированного списка комнат
function getSortedRoomsList() {
  const roomsList = Object.keys(rooms).map(roomId => ({
    id: roomId,
    roomId,
    displayName: rooms[roomId].displayName,
    originalRequestedId: rooms[roomId].originalRequestedId,
    maxPlayers: rooms[roomId].maxPlayers,
    currentPlayers: rooms[roomId].currentPlayers,
    status: rooms[roomId].status,
    hostId: rooms[roomId].hostId,
    hostUsername: rooms[roomId].hostUsername,
    password: rooms[roomId].password

  })).sort((a, b) => {
    // Сначала новые комнаты (по времени создания), затем старые
    return rooms[b.roomId].createdAt - rooms[a.roomId].createdAt;
  });
  
  console.log(`📊 [SERVER] getSortedRoomsList: ${roomsList.length} rooms`, roomsList.map(r => ({ 
    id: r.id, 
    name: r.displayName, 
    players: r.currentPlayers.length,
    createdAt: rooms[r.roomId].createdAt,
    hostUsername: r.hostUsername,
    hostId: r.hostId
  })));
  
  return roomsList;
}

// Timer management for rooms
const roomTimers = new Map(); // { roomId: { gameTimer, cleanupTimer } }
const turnTimers = new Map(); // { roomId: { timer: intervalId, remaining: seconds, playerId: currentPlayer } }

// Helper to create a default room when none exist
function createDefaultRoom() {
  const id = 'lobby';
  rooms[id] = {
    roomId: id,
    displayName: 'Лобби',
    originalRequestedId: 'lobby',
    maxPlayers: 6,
    currentPlayers: [],
    status: 'waiting',
    password: '',
    hostId: null,
    timer: { hours: 3, remaining: 3 * 3600 },
    currentTurn: null, // Now playerId
    board: config.board,
    createdAt: Date.now(),

  };
  persistRooms();
}
function ensureDefaultRoom() {
  if (!Object.keys(rooms).length) {
    createDefaultRoom();
  }
  
  // Мигрируем существующие данные в БД
  db.migrateExistingData(users, rooms);
  
  // ПОЛНАЯ ОЧИСТКА ГОСТЕВЫХ И ТЕСТОВЫХ ИГРОКОВ ВО ВСЕХ КОМНАТАХ
  Object.values(rooms).forEach(room => {
    if (room && room.currentPlayers) {
      cleanupGuestPlayers(room);
    }
  });
  
  // Принудительно очищаем все комнаты с сгенерированными именами
  forceCleanupAllRooms();
  
  // Исправляем hostId во всех комнатах
  fixHostIdInRooms();
  
  // Очищаем старые комнаты (старше 4 часов)
  cleanupOldRooms();
}
// Функция принудительной очистки всех старых комнат
const forceCleanupAllRooms = () => {
  console.log(`🧹 [SERVER] Force cleaning up ALL old rooms...`);
  
  const roomsToDelete = [];
  
  Object.entries(rooms).forEach(([roomId, room]) => {
    // Пропускаем лобби
    if (roomId === 'lobby') return;
    
    // Удаляем все комнаты с сгенерированными именами
    if (room.hostUsername && room.hostUsername.startsWith('Игрок_')) {
      roomsToDelete.push(roomId);
      console.log(`🗑️ [SERVER] Marking room for deletion (generated name): ${roomId} (${room.hostUsername})`);
    }
  });
  
  // Удаляем комнаты
  if (roomsToDelete.length > 0) {
    console.log(`🗑️ [SERVER] Starting force cleanup of ${roomsToDelete.length} rooms...`);
    
    roomsToDelete.forEach(roomId => {
      const room = rooms[roomId];
      console.log(`🗑️ [SERVER] Deleting room: ${roomId} (${room?.displayName || room?.name || 'Unknown'})`);
      
      // Очищаем таймеры комнаты
      if (roomTimers.has(roomId)) {
        const timers = roomTimers.get(roomId);
        if (timers.cleanupTimer) clearTimeout(timers.cleanupTimer);
        if (timers.gameTimer) clearInterval(timers.gameTimer);
        roomTimers.delete(roomId);
        console.log(`🗑️ [SERVER] Cleared timers for room: ${roomId}`);
      }
      
      // Очищаем таймеры ходов
      if (turnTimers.has(roomId)) {
        const turnTimer = turnTimers.get(roomId);
        if (turnTimer.timer) clearInterval(turnTimer.timer);
        turnTimers.delete(roomId);
        console.log(`🗑️ [SERVER] Cleared turn timers for room: ${roomId}`);
      }
      
      delete rooms[roomId];
    });
    
    // Сохраняем изменения и обновляем список комнат
    persistRooms();
    const roomsList = getSortedRoomsList();
    io.emit('roomsList', roomsList);
    
    console.log(`🗑️ [SERVER] Successfully force cleaned up ${roomsToDelete.length} rooms`);
  } else {
    console.log(`✅ [SERVER] No rooms with generated names found for cleanup`);
  }
};

// Функция очистки старых комнат (старше 4 часов)
const cleanupOldRooms = () => {
  const now = Date.now();
  const fourHoursInMs = 4 * 60 * 60 * 1000; // 4 часа в миллисекундах
  const roomsToDelete = [];
  
  console.log(`🔍 [SERVER] Checking for old rooms (older than 4 hours)...`);
  console.log(`🔍 [SERVER] Current time: ${new Date(now).toISOString()}`);
  
  Object.entries(rooms).forEach(([roomId, room]) => {
    // Пропускаем лобби
    if (roomId === 'lobby') return;
    
    if (room.createdAt) {
      const ageInHours = (now - room.createdAt) / (60 * 60 * 1000);
      console.log(`🔍 [SERVER] Room ${roomId}: age = ${ageInHours.toFixed(2)} hours, createdAt = ${new Date(room.createdAt).toISOString()}`);
      
      // Проверяем возраст комнаты
      if (ageInHours > 4) {
        roomsToDelete.push(roomId);
        console.log(`🗑️ [SERVER] Marking old room for deletion: ${roomId} (age: ${ageInHours.toFixed(2)} hours)`);
      }
    } else {
      console.log(`⚠️ [SERVER] Room ${roomId} has no createdAt timestamp`);
    }
  });
  
  // Удаляем старые комнаты
  if (roomsToDelete.length > 0) {
    console.log(`🗑️ [SERVER] Starting cleanup of ${roomsToDelete.length} old rooms...`);
    
    roomsToDelete.forEach(roomId => {
      const room = rooms[roomId];
      console.log(`🗑️ [SERVER] Deleting old room: ${roomId} (${room?.displayName || room?.name || 'Unknown'})`);
      
      // Очищаем таймеры комнаты
      if (roomTimers.has(roomId)) {
        const timers = roomTimers.get(roomId);
        if (timers.cleanupTimer) clearTimeout(timers.cleanupTimer);
        if (timers.gameTimer) clearInterval(timers.gameTimer);
        roomTimers.delete(roomId);
        console.log(`🗑️ [SERVER] Cleared timers for room: ${roomId}`);
      }
      
      // Очищаем таймеры ходов
      if (turnTimers.has(roomId)) {
        const turnTimer = turnTimers.get(roomId);
        if (turnTimer.timer) clearInterval(turnTimer.timer);
        turnTimers.delete(roomId);
        console.log(`🗑️ [SERVER] Cleared turn timers for room: ${roomId}`);
      }
      
      delete rooms[roomId];
    });
    
    // Сохраняем изменения и обновляем список комнат
    persistRooms();
    const roomsList = getSortedRoomsList();
    io.emit('roomsList', roomsList);
    
    console.log(`🗑️ [SERVER] Successfully cleaned up ${roomsToDelete.length} old rooms`);
  } else {
    console.log(`✅ [SERVER] No old rooms found for cleanup`);
  }
};

// Функция ПОЛНОЙ очистки гостевых и тестовых игроков
const cleanupGuestPlayers = (room) => {
  const beforeCleanup = room.currentPlayers.length;
  
  // Убираем ВСЕХ игроков с гостевые и тестовые именами
  room.currentPlayers = room.currentPlayers.filter(player => {
    if (player.username && (
      player.username.startsWith('Гость') || 
      player.username.startsWith('Guest') || 
      player.username.startsWith('Гость-') ||
      player.username.startsWith('test') ||
      player.username.startsWith('Test') ||
      player.username.length < 2 ||
      player.username === 'test' ||
      player.username === 'test1' ||
      player.username === 'test2' ||
      player.username === 'TestPlayer1' ||
      player.username === 'TestPlayer2' ||
      player.username === 'TestPlayer3' ||
      player.username === 'TestPlayer4' ||
      player.username === 'TestPlayer5' ||
      player.username === 'TestPlayer6' ||
      player.username === 'TestPlayer7' ||
      player.username === 'TestPlayer8' ||
      player.username === 'TestPlayer9' ||
      player.username === 'TestPlayer10' ||
      player.username === 'TestPlayer11' ||
      player.username === 'TestPlayer12' ||
      player.username === 'TestPlayer13' ||
      player.username === 'TestPlayer14' ||
      player.username === 'TestPlayer15' ||
      player.username === 'TestPlayer16' ||
      player.username === 'TestPlayer17' ||
      player.username === 'TestPlayer18' ||
      player.username === 'TestPlayer19' ||
      player.username === 'TestPlayer20' ||
      player.username === 'TestPlayer21' ||
      player.username === 'TestPlayer22' ||
      player.username === 'TestPlayer23' ||
      player.username === 'TestPlayer24' ||
      player.username === 'TestPlayer25' ||
      player.username === 'TestPlayer26' ||
      player.username === 'TestPlayer27' ||
      player.username === 'TestPlayer28' ||
      player.username === 'TestPlayer29' ||
      player.username === 'TestPlayer30' ||
      player.username === 'TestPlayer31' ||
      player.username === 'TestPlayer32' ||
      player.username === 'TestPlayer33' ||
      player.username === 'TestPlayer34' ||
      player.username === 'TestPlayer35' ||
      player.username === 'TestPlayer36' ||
      player.username === 'TestPlayer37' ||
      player.username === 'TestPlayer38' ||
      player.username === 'TestPlayer39' ||
      player.username === 'TestPlayer40' ||
      player.username === 'TestPlayer41' ||
      player.username === 'TestPlayer42' ||
      player.username === 'TestPlayer43' ||
      player.username === 'TestPlayer44' ||
      player.username === 'TestPlayer45' ||
      player.username === 'TestPlayer46' ||
      player.username === 'TestPlayer47' ||
      player.username === 'TestPlayer48' ||
      player.username === 'TestPlayer49' ||
      player.username === 'TestPlayer50' ||
      player.username === 'TestPlayer51' ||
      player.username === 'TestPlayer52' ||
      player.username === 'TestPlayer53' ||
      player.username === 'TestPlayer54' ||
      player.username === 'TestPlayer55' ||
      player.username === 'TestPlayer56' ||
      player.username === 'TestPlayer57' ||
      player.username === 'TestPlayer58' ||
      player.username === 'TestPlayer59' ||
      player.username === 'TestPlayer60' ||
      player.username === 'TestPlayer61' ||
      player.username === 'TestPlayer62' ||
      player.username === 'TestPlayer63' ||
      player.username === 'TestPlayer64' ||
      player.username === 'TestPlayer65' ||
      player.username === 'TestPlayer66' ||
      player.username === 'TestPlayer67' ||
      player.username === 'TestPlayer68' ||
      player.username === 'TestPlayer69' ||
      player.username === 'TestPlayer70' ||
      player.username === 'TestPlayer71' ||
      player.username === 'TestPlayer72' ||
      player.username === 'TestPlayer73' ||
      player.username === 'TestPlayer74' ||
      player.username === 'TestPlayer75' ||
      player.username === 'TestPlayer76' ||
      player.username === 'TestPlayer77' ||
      player.username === 'TestPlayer78' ||
      player.username === 'TestPlayer79' ||
      player.username === 'TestPlayer80' ||
      player.username === 'TestPlayer81' ||
      player.username === 'TestPlayer82' ||
      player.username === 'TestPlayer83' ||
      player.username === 'TestPlayer84' ||
      player.username === 'TestPlayer85' ||
      player.username === 'TestPlayer86' ||
      player.username === 'TestPlayer87' ||
      player.username === 'TestPlayer88' ||
      player.username === 'TestPlayer89' ||
      player.username === 'TestPlayer90' ||
      player.username === 'TestPlayer91' ||
      player.username === 'TestPlayer92' ||
      player.username === 'TestPlayer93' ||
      player.username === 'TestPlayer94' ||
      player.username === 'TestPlayer95' ||
      player.username === 'TestPlayer96' ||
      player.username === 'TestPlayer97' ||
      player.username === 'TestPlayer98' ||
      player.username === 'TestPlayer99' ||
      player.username === 'TestPlayer100'
    )) {
      console.log('🧹 [SERVER] Removing guest/test player:', player.username);
      return false;
    }
    return true;
  });
  
  const afterCleanup = room.currentPlayers.length;
  if (beforeCleanup !== afterCleanup) {
    console.log('🧹 [SERVER] Cleaned up guest/test players:', beforeCleanup - afterCleanup);
    console.log('🧹 [SERVER] Players after guest cleanup:', room.currentPlayers.map(p => ({ 
      id: p.id, 
      username: p.username, 
      socketId: p.socketId 
    })));
  }
  
  return beforeCleanup - afterCleanup;
};

// Initial default room load or create
loadRooms();
ensureDefaultRoom();

io.on('connection', (socket) => {
  console.log('New client connected', socket.id);
  console.log('🔌 [SERVER] Socket.IO connection details:', {
    id: socket.id,
    transport: socket.conn.transport.name,
    headers: socket.handshake.headers
  });
  ensureDefaultRoom();
  
  // Добавляем логирование для проверки событий
  console.log(`🔍 [SERVER] Socket ${socket.id} connected, waiting for events...`);
  
  // Логируем все события для отладки
  socket.onAny((eventName, ...args) => {
    console.log(`📡 [SERVER] Event received: ${eventName} from socket ${socket.id}`, args);
  });
  
  // ПОЛНАЯ ОЧИСТКА ГОСТЕВЫХ И ТЕСТОВЫХ ИГРОКОВ ПРИ ПОДКЛЮЧЕНИИ НОВОГО КЛИЕНТА
  Object.values(rooms).forEach(room => {
    if (room && room.currentPlayers) {
      cleanupGuestPlayers(room);
    }
  });
  
  // Send initial rooms list to client
  socket.emit('roomsList', getSortedRoomsList());

  // Рефакторинг: исправляю функцию joinRoom для правильной работы с игроками
  socket.on('joinRoom', (roomId, playerData) => {
    console.log(`🔗 [SERVER] joinRoom requested: ${roomId} by socket: ${socket.id}`, playerData);
    
    if (!rooms[roomId]) {
      console.log(`❌ [SERVER] Room ${roomId} not found for socket: ${socket.id}`);
      socket.emit('error', { message: 'Комната не найдена' });
      return;
    }
    
    socket.join(roomId);
    console.log(`✅ [SERVER] Socket ${socket.id} joined room: ${roomId}`);
    
    // Нормализуем playerData - поддерживаем как строку, так и объект
    let normalizedPlayerData;
    if (typeof playerData === 'string') {
      // Если передана строка, создаем объект
      normalizedPlayerData = {
        username: playerData.trim(),
        id: playerData.trim(),
        email: '',
        displayId: playerData.trim()
      };
    } else if (playerData && typeof playerData === 'object') {
      // Если передан объект, используем его
      normalizedPlayerData = {
        username: playerData.username || playerData.id || '',
        id: playerData.id || playerData.username || '',
        email: playerData.email || '',
        displayId: playerData.displayId || playerData.username || playerData.id || ''
      };
    } else {
      normalizedPlayerData = null;
    }
    
    // ПОЛНОСТЬЮ ОТКЛЮЧАЕМ СОЗДАНИЕ ГОСТЕВЫХ ИГРОКОВ
    // Проверяем, есть ли данные игрока для присоединения
    if (!normalizedPlayerData || !normalizedPlayerData.username || normalizedPlayerData.username.trim() === '') {
      console.log(`❌ [SERVER] Player data missing or invalid for socket ${socket.id}`);
      socket.emit('error', { message: 'Необходимо указать корректное имя игрока для присоединения к комнате' });
      return;
    }
    
    // Проверяем только базовую валидность имени (не пустое и не слишком короткое)
    if (normalizedPlayerData.username.length < 2) {
      console.log(`❌ [SERVER] Username too short: ${normalizedPlayerData.username}`);
      socket.emit('error', { message: 'Имя игрока должно содержать минимум 2 символа' });
      return;
    }
    
    // Определяем фиксированный ID игрока (только из переданных данных)
    const fixedPlayerId = normalizedPlayerData.id || normalizedPlayerData.username;
    
    // Проверяем, есть ли уже игрок с таким фиксированным ID
    const existingPlayerIndex = rooms[roomId].currentPlayers.findIndex(p => 
      p.id === fixedPlayerId || p.username === fixedPlayerId
    );
    
    if (existingPlayerIndex === -1) {
      // Проверяем лимит игроков перед добавлением
      if (rooms[roomId].currentPlayers.length >= rooms[roomId].maxPlayers) {
        console.log(`❌ [SERVER] Room ${roomId} is full (${rooms[roomId].currentPlayers.length}/${rooms[roomId].maxPlayers})`);
        socket.emit('error', { message: 'Комната заполнена' });
        return;
      }
      
      // Создаем нового игрока только с переданными данными
      const player = {
        id: fixedPlayerId,
        username: normalizedPlayerData.username,
        email: normalizedPlayerData.email || '',
        displayId: normalizedPlayerData.displayId || '',
        ready: false, // Новый игрок не готов по умолчанию
        socketId: socket.id,
        joinedAt: Date.now(),
        seat: null // Место будет назначено при готовности
      };
      
      rooms[roomId].currentPlayers.push(player);
      console.log(`👤 [SERVER] New player ${player.username} (ID: ${player.id}) added to room ${roomId}`);
      
      // Если у комнаты нет hostUsername, назначаем первого игрока создателем
      if (!rooms[roomId].hostUsername && rooms[roomId].currentPlayers.length === 1) {
        rooms[roomId].hostUsername = player.username;
        rooms[roomId].hostId = player.id; // Используем player.id вместо socketId для стабильности
        console.log(`👑 [SERVER] Appointed ${player.username} as host for room ${roomId}`);
      }
    } else {
      // Переподключаем существующего игрока - обновляем только socketId
      const existingPlayer = rooms[roomId].currentPlayers[existingPlayerIndex];
      existingPlayer.socketId = socket.id;
      existingPlayer.offline = false;
      existingPlayer.joinedAt = Date.now();
      
      console.log(`🔄 [SERVER] Player ${existingPlayer.username} (ID: ${existingPlayer.id}) reconnected with new socket: ${socket.id}`);
      
      // Если у комнаты нет hostUsername, но этот игрок был первым, назначаем его создателем
      if (!rooms[roomId].hostUsername && existingPlayerIndex === 0) {
        rooms[roomId].hostUsername = existingPlayer.username;
        rooms[roomId].hostId = existingPlayer.id; // Используем player.id вместо socketId для стабильности
        console.log(`👑 [SERVER] Appointed reconnected player ${existingPlayer.username} as host for room ${roomId}`);
      }
    }
    
    // ПОЛНАЯ ОЧИСТКА ГОСТЕВЫХ ИГРОКОВ
    cleanupGuestPlayers(rooms[roomId]);
    
    // Сохраняем изменения
    persistRooms();
    
    // Отправляем обновленный список игроков всем в комнате
    io.to(roomId).emit('playersUpdate', rooms[roomId].currentPlayers);
    
    // Отправляем данные комнаты
    socket.emit('roomUpdated', rooms[roomId]);
    
    // Обновляем список комнат для всех
    const roomsList = getSortedRoomsList();
    io.emit('roomsList', roomsList);
    
    console.log(`✅ [SERVER] Room ${roomId} now has ${rooms[roomId].currentPlayers.length} players`);
  });

  socket.on('createRoom', (roomId, maxPlayers, password, timerHours = config.rules.defaultTimer, roomName, professionType = 'individual', hostDream = null, playerName = null, selectedProfession = null) => {
    console.log(`🏠 [SERVER] createRoom event received:`, {
      roomId,
      maxPlayers,
      password,
      timerHours,
      roomName,
      playerName,
      socketId: socket.id,
      configRules: config.rules,
      defaultTimer: config.rules.defaultTimer
    });
    
    try {
      // Генерируем уникальный порядковый ID для комнаты
      const sequentialId = generateSequentialRoomId();
      
      // Создаем комнату с автоматически сгенерированным ID
      const actualRoomId = sequentialId;
    
    if (!rooms[actualRoomId]) {
      console.log(`Creating room ${actualRoomId} (requested: ${roomId}) by ${socket.id} with name: ${roomName || 'Unnamed'}`);
      // Создаем создателя комнаты как готового игрока
      // Используем только переданное имя игрока (username из регистрации)
      if (!playerName || playerName.trim() === '') {
        console.log(`❌ [SERVER] createRoom: playerName is required but not provided`);
        socket.emit('roomCreationError', { message: 'Имя игрока обязательно для создания комнаты' });
        return;
      }
      
      const hostUsername = playerName.trim();
      console.log(`👑 [SERVER] Creating host player with username: ${hostUsername}`);
      
      // Получаем user ID из зарегистрированного пользователя
      const userData = getUserByUsername(hostUsername);
      if (!userData) {
        console.log(`❌ [SERVER] createRoom: User not found for username: ${hostUsername}`);
        socket.emit('roomCreationError', { message: 'Пользователь не найден. Пожалуйста, зарегистрируйтесь сначала.' });
        return;
      }
      
      const hostPlayer = {
        id: userData.id, // Используем user ID из регистрации
        username: hostUsername,
        email: userData.email,
        displayId: hostUsername,
        ready: true, // Создатель готов по умолчанию
        socketId: socket.id,
        joinedAt: Date.now(),
        seat: 0, // Первое место
        profession: selectedProfession, // Устанавливаем выбранную профессию
        dream: null // Мечта пока не выбрана
      };

      rooms[actualRoomId] = {
        roomId: actualRoomId,
        displayName: roomName || 'Без названия',
        originalRequestedId: roomId, // Сохраняем запрошенный ID для отображения
        maxPlayers,
        currentPlayers: [hostPlayer], // Добавляем создателя как готового игрока
        status: 'waiting',
        password,
        hostId: hostPlayer.id, // Используем ID игрока, а не socket ID
        hostUsername: hostUsername, // Добавляем username создателя
        timer: { hours: timerHours, remaining: timerHours * 3600 },
        currentTurn: null, // Now playerId
        board: config.board,
        createdAt: Date.now(), // Add creation timestamp
        // Новая логика
        professionType: professionType, // 'individual' или 'shared'
        sharedProfession: null, // Профессия для всех (если professionType === 'shared')
        hostProfession: selectedProfession, // Профессия хоста (передаем выбранную профессию)
        hostDream: null, // Мечта хоста (убираем, так как мечта выбирается в комнате)
        playersReady: [hostPlayer.id], // Массив готовых игроков
        gameStarted: false
      };
      
      console.log(`🏠 [SERVER] Room created with hostUsername: ${rooms[actualRoomId].hostUsername}`);
      
      // Start timers for the room
      startRoomTimers(actualRoomId);
      
      persistRooms();
      const roomsList = getSortedRoomsList();
      io.emit('roomsList', roomsList);
      
      // Отправляем событие о создании комнаты создателю
      socket.emit('roomCreated', rooms[actualRoomId]);
      
      console.log(`✅ Room ${actualRoomId} created with name: ${rooms[actualRoomId].displayName}`);
    } else {
      // Если комната с таким ID уже существует, генерируем новый
      console.log(`⚠️ Room ${actualRoomId} already exists, generating new ID`);
      const newId = generateSequentialRoomId();
      // Создаем создателя комнаты как готового игрока
      // Используем только переданное имя игрока (username из регистрации)
      if (!playerName || playerName.trim() === '') {
        console.log(`❌ [SERVER] createRoom: playerName is required but not provided`);
        socket.emit('roomCreationError', { message: 'Имя игрока обязательно для создания комнаты' });
        return;
      }
      
      const hostUsername = playerName.trim();
      console.log(`👑 [SERVER] Creating host player with username: ${hostUsername}`);
      
      // Получаем user ID из зарегистрированного пользователя
      const userData = getUserByUsername(hostUsername);
      if (!userData) {
        console.log(`❌ [SERVER] createRoom: User not found for username: ${hostUsername}`);
        socket.emit('roomCreationError', { message: 'Пользователь не найден. Пожалуйста, зарегистрируйтесь сначала.' });
        return;
      }
      
      const hostPlayer = {
        id: userData.id, // Используем user ID из регистрации
        username: hostUsername,
        email: userData.email,
        displayId: hostUsername,
        ready: true, // Создатель готов по умолчанию
        socketId: socket.id,
        joinedAt: Date.now(),
        seat: 0, // Первое место
        profession: selectedProfession, // Устанавливаем выбранную профессию
        dream: null // Мечта пока не выбрана
      };

      rooms[newId] = {
        roomId: newId,
        displayName: roomName || 'Без названия',
        originalRequestedId: roomId,
        maxPlayers,
        currentPlayers: [hostPlayer], // Добавляем создателя как готового игрока
        status: 'waiting',
        password,
        hostId: hostPlayer.id, // Используем ID игрока, а не socket ID
        hostUsername: hostUsername, // Добавляем username создателя
        timer: { hours: timerHours, remaining: timerHours * 3600 },
        currentTurn: null,
        board: config.board,
        createdAt: Date.now(),
        // Новая логика
        professionType: professionType, // 'individual' или 'shared'
        sharedProfession: null, // Профессия для всех (если professionType === 'shared')
        hostProfession: selectedProfession, // Профессия хоста (передаем выбранную профессию)
        hostDream: null, // Мечта хоста (убираем, так как мечта выбирается в комнате)
        playersReady: [hostPlayer.id], // Массив готовых игроков
        gameStarted: false
      };
      
      console.log(`🏠 [SERVER] Room created with hostUsername: ${rooms[newId].hostUsername}`);
      
      startRoomTimers(newId);
      persistRooms();
      const roomsList = getSortedRoomsList();
      io.emit('roomsList', roomsList);
      
      socket.emit('roomCreated', rooms[newId]);
      console.log(`✅ Room ${newId} created with name: ${rooms[newId].displayName}`);
    }
    
    console.log(`🏠 [SERVER] createRoom completed successfully`);
    
  } catch (error) {
    console.error(`❌ [SERVER] Error in createRoom:`, error);
    socket.emit('roomCreationError', { 
      message: 'Ошибка создания комнаты', 
      details: error.message 
    });
  }
  });

  // Новые обработчики для логики игры
  socket.on('setProfessionType', (roomId, professionType) => {
    if (rooms[roomId] && rooms[roomId].hostId === socket.id) {
      rooms[roomId].professionType = professionType;
      console.log(`🎯 [SERVER] Room ${roomId}: profession type set to ${professionType}`);
      io.to(roomId).emit('professionTypeUpdated', professionType);
      persistRooms();
    }
  });

  socket.on('setHostProfession', (roomId, profession) => {
    if (rooms[roomId] && rooms[roomId].hostId === socket.id) {
      rooms[roomId].hostProfession = profession;
      if (rooms[roomId].professionType === 'shared') {
        rooms[roomId].sharedProfession = profession;
      }
      console.log(`🎯 [SERVER] Room ${roomId}: host profession set to ${profession.name}`);
      io.to(roomId).emit('hostProfessionUpdated', profession);
      persistRooms();
    }
  });

  socket.on('setHostDream', (roomId, dream) => {
    if (rooms[roomId] && rooms[roomId].hostId === socket.id) {
      rooms[roomId].hostDream = dream;
      console.log(`⭐ [SERVER] Room ${roomId}: host dream set to ${dream.name}`);
      io.to(roomId).emit('hostDreamUpdated', dream);
      persistRooms();
    }
  });

  socket.on('playerReady', (roomId, playerId) => {
    if (rooms[roomId]) {
      const room = rooms[roomId];
      if (!room.playersReady.includes(playerId)) {
        room.playersReady.push(playerId);
        console.log(`✅ [SERVER] Room ${roomId}: player ${playerId} is ready`);
        io.to(roomId).emit('playerReady', playerId);
        
        // Проверяем, можно ли начать игру
        if (room.playersReady.length >= 2 && room.playersReady.length === room.currentPlayers.length) {
          console.log(`🚀 [SERVER] Room ${roomId}: all players ready, can start game`);
          io.to(room.playersReady).emit('canStartGame', true);
        }
        
        persistRooms();
      }
    }
  });

  // Удален дублирующий обработчик startGame - используется основной в строке 1834

  // Allow host to change max players from RoomSetup
  socket.on('setMaxPlayers', (roomId, maxPlayers) => {
    if (rooms[roomId] && rooms[roomId].status === 'waiting') {
      rooms[roomId].maxPlayers = Math.max(2, Math.min(10, Number(maxPlayers) || 2));
      persistRooms();
      const roomsList = getSortedRoomsList();
      io.emit('roomsList', roomsList);
      io.to(roomId).emit('roomUpdated', rooms[roomId]);
    }
  });



  // Функция очистки дублей в комнате
  const cleanupDuplicatePlayers = (room) => {
    const beforeCleanup = room.currentPlayers.length;
    
    // Убираем дубли по socketId
    const uniqueBySocketId = [];
    const seenSocketIds = new Set();
    
    for (const player of room.currentPlayers) {
      if (!seenSocketIds.has(player.socketId) || player.socketId === null) {
        uniqueBySocketId.push(player);
        if (player.socketId) {
          seenSocketIds.add(player.socketId);
        }
      }
    }
    
    // Убираем дубли по fixedId
    const uniqueByFixedId = [];
    const seenFixedIds = new Set();
    
    for (const player of uniqueBySocketId) {
      if (!seenFixedIds.has(player.fixedId)) {
        uniqueByFixedId.push(player);
        seenFixedIds.add(player.fixedId);
      } else {
        console.log('🧹 [SERVER] Removed duplicate player by fixedId:', player.fixedId);
      }
    }
    
    room.currentPlayers = uniqueByFixedId;
    
    const afterCleanup = room.currentPlayers.length;
    if (beforeCleanup !== afterCleanup) {
      console.log('🧹 [SERVER] Cleaned up duplicate players:', beforeCleanup - afterCleanup);
      console.log('🧹 [SERVER] Players after cleanup:', room.currentPlayers.map(p => ({ 
        id: p.id, 
        username: p.username, 
        socketId: p.socketId 
      })));
    }
    
    return beforeCleanup - afterCleanup;
  };



  // Обработка запроса списка комнат
  socket.on('getRoomsList', () => {
    console.log('🏠 [SERVER] getRoomsList requested by socket:', socket.id);
    
    try {
      // ПОЛНАЯ ОЧИСТКА ГОСТЕВЫХ И ТЕСТОВЫХ ИГРОКОВ ВО ВСЕХ КОМНАТАХ
      Object.values(rooms).forEach(room => {
        cleanupGuestPlayers(room);
      });
      
      const roomsList = getSortedRoomsList();
      socket.emit('roomsList', roomsList);
      console.log('🏠 [SERVER] Sent rooms list:', roomsList.length, 'rooms');
      
    } catch (error) {
      console.error('❌ [SERVER] Error in getRoomsList:', error);
      socket.emit('error', { message: 'Ошибка получения списка комнат' });
    }
  });

  // Обработка запроса данных конкретной комнаты
  socket.on('getRoomData', (roomId) => {
    console.log('🏠 [SERVER] getRoomData requested for room:', roomId, 'by socket:', socket.id);
    
    try {
      const room = rooms[roomId];
      if (!room) {
        console.log('❌ [SERVER] getRoomData: Room not found:', roomId);
        socket.emit('roomNotFound');
        return;
      }
      
      // Отправляем данные комнаты
      const roomData = {
        displayName: room.displayName,
        isPublic: room.isPublic !== false,
        password: room.password || '',
        professionType: room.professionType || 'individual',
        hostProfession: room.hostProfession || null,
        hostDream: room.hostDream || null
      };
      
      socket.emit('roomData', roomData);
      console.log('🏠 [SERVER] Sent room data:', roomData);
      
    } catch (error) {
      console.error('❌ [SERVER] Error in getRoomData:', error);
      socket.emit('error', { message: 'Ошибка получения данных комнаты' });
    }
  });

  // Обработка обновления профессии игрока
  socket.on('updateProfession', (roomId, profession) => {
    console.log('💼 [SERVER] updateProfession received:', { roomId, profession, socketId: socket.id });
    
    try {
      const room = rooms[roomId];
      if (!room) {
        console.log('❌ [SERVER] updateProfession: Room not found:', roomId);
        return;
      }
      
      // Находим игрока по socketId
      const player = room.currentPlayers.find(p => p.socketId === socket.id);
      if (!player) {
        console.log('❌ [SERVER] updateProfession: Player not found for socket:', socket.id);
        return;
      }
      
      // Обновляем профессию игрока
      player.profession = profession;
      console.log('✅ [SERVER] Player profession updated:', { 
        username: player.username, 
        profession: profession.name,
        socketId: socket.id 
      });
      
      // Отправляем обновленный список игроков всем в комнате
      // Создаем безопасную копию без циклических ссылок
      const safePlayers = room.currentPlayers.map(createSafePlayerData);
      io.to(roomId).emit('playersUpdate', safePlayers);
      
      // Сохраняем состояние комнаты
      persistRooms();
      
    } catch (error) {
      console.error('❌ [SERVER] Error in updateProfession:', error);
    }
  });

  // Обработка обновления мечты игрока
  socket.on('updateDream', (roomId, dream) => {
    console.log('⭐ [SERVER] updateDream received:', { roomId, dream, socketId: socket.id });
    
    try {
      const room = rooms[roomId];
      if (!room) {
        console.log('❌ [SERVER] updateDream: Room not found:', roomId);
        return;
      }
      
      // Находим игрока по socketId
      const player = room.currentPlayers.find(p => p.socketId === socket.id);
      if (!player) {
        console.log('❌ [SERVER] updateDream: Player not found for socket:', socket.id);
        return;
      }
      
      // Обновляем мечту игрока
      player.dream = dream;
      console.log('✅ [SERVER] Player dream updated:', { 
        username: player.username, 
        dream: dream.name,
        socketId: socket.id 
      });
      
      // Отправляем обновленный список игроков всем в комнате
      // Создаем безопасную копию без циклических ссылок
      const safePlayers = room.currentPlayers.map(createSafePlayerData);
      io.to(roomId).emit('playersUpdate', safePlayers);
      
      // Сохраняем состояние комнаты
      persistRooms();
      
    } catch (error) {
      console.error('❌ [SERVER] Error in updateDream:', error);
    }
  });

  // On join, assign profession and initial finances (in a new 'setupPlayer' event or here)
  socket.on('setupPlayer', (roomId, playerData) => {
    console.log('🎮 [SERVER] setupPlayer called:', { roomId, socketId: socket.id, playerData });
    console.log('🎮 [SERVER] Available rooms:', Object.keys(rooms));
    
    // Сначала исправляем существующие проблемы с hostId
    fixHostIdInRooms();
    
    // ПОЛНОСТЬЮ ОТКЛЮЧАЕМ СОЗДАНИЕ ГОСТЕВЫХ ИГРОКОВ
    // Проверяем, есть ли данные игрока для настройки
    if (!playerData || !playerData.username || playerData.username.trim() === '') {
      console.log('❌ [SERVER] setupPlayer: Player data missing or invalid for socket', socket.id);
      socket.emit('error', { message: 'Необходимо указать корректное имя игрока для настройки' });
      return;
    }
    
    // Дополнительная проверка - запрещаем гостевые и тестовые имена
    if (playerData.username.startsWith('Гость') || 
        playerData.username.startsWith('Guest') || 
        playerData.username.startsWith('test') ||
        playerData.username.startsWith('Test') ||
        playerData.username.length < 2 ||
        playerData.username === 'test' ||
        playerData.username === 'test1' ||
        playerData.username === 'test2' ||
        playerData.username.includes('TestPlayer') ||
        playerData.username.includes('testplayer')) {
      console.log('❌ [SERVER] setupPlayer: Guest/test usernames are not allowed:', playerData.username);
      socket.emit('error', { message: 'Гостевые и тестовые имена не разрешены. Укажите реальное имя игрока.' });
      return;
    }
    
    const room = rooms[roomId];
    if (!room) {
      console.log('❌ [SERVER] setupPlayer: Room not found:', roomId);
      console.log('🎮 [SERVER] Available rooms:', Object.keys(rooms));
      return;
    }
    
    console.log('✅ [SERVER] setupPlayer: Room found:', { 
      roomId, 
      status: room.status, 
      currentPlayers: room.currentPlayers.length,
      players: room.currentPlayers.map(p => ({ 
        id: p.id, 
        username: p.username, 
        socketId: p.socketId,
        offline: p.offline 
      }))
    });
    
    // Очищаем старые игроки с тем же socketId (защита от дублей)
    const beforeCleanup = room.currentPlayers.length;
    room.currentPlayers = room.currentPlayers.filter(p => p.socketId !== socket.id);
    const afterCleanup = room.currentPlayers.length;
    
    if (beforeCleanup !== afterCleanup) {
      console.log('🧹 [SERVER] Cleaned up duplicate socketId players:', beforeCleanup - afterCleanup);
    }
    
    // Дополнительная очистка дублей
    cleanupDuplicatePlayers(room);
    
    // ПОЛНАЯ ОЧИСТКА ГОСТЕВЫХ ИГРОКОВ
    cleanupGuestPlayers(room);
    
    // Проверяем, есть ли уже игрок с таким фиксированным ID
    const existingById = room.currentPlayers.find(p => p.fixedId === playerData.id);
    if (existingById) {
      console.log('🔄 [SERVER] Player with ID already exists:', playerData.id);
      console.log('🔄 [SERVER] Updating existing player socketId from', existingById.socketId, 'to', socket.id);
      
      // Если игрок с таким ID уже есть, подключаем к нему
      existingById.socketId = socket.id;
      existingById.offline = false;
      existingById.roomId = roomId;
      
      // Обновляем профессию и другие данные, если они есть в playerData
      if (playerData.profession && !existingById.profession) {
        existingById.profession = playerData.profession;
        existingById.salary = playerData.profession.salary || 0;
        existingById.expenses = playerData.profession.expenses || 0;
        existingById.totalExpenses = playerData.profession.expenses || 0;
        existingById.monthlyCashflow = (playerData.profession.salary || 0) - (playerData.profession.expenses || 0);
        console.log('💼 [SERVER] Updated existing player profession:', existingById.profession);
      }
      
      socket.join(roomId);
      console.log('✅ [SERVER] Existing player reconnected:', {
        id: existingById.id,
        username: existingById.username,
        socketId: existingById.socketId,
        profession: existingById.profession
      });
      
      io.to(roomId).emit('playersUpdate', room.currentPlayers);
      
      // Исправляем hostId после переподключения игрока
      fixHostIdInRooms();
      
      return;
    }
    
    // Проверяем, есть ли уже игрок с тем же username (защита от дублей)
    const existingByUsername = room.currentPlayers.find(p => p.username === playerData.username);
    if (existingByUsername) {
      console.log('🔄 [SERVER] Player with username already exists:', playerData.username);
      console.log('🔄 [SERVER] Updating existing player socketId from', existingByUsername.socketId, 'to', socket.id);
      
      // Обновляем существующего игрока
      existingByUsername.socketId = socket.id;
      existingByUsername.offline = false;
      existingByUsername.roomId = roomId;
      
      socket.join(roomId);
      console.log('✅ [SERVER] Existing player reconnected by username:', {
        id: existingByUsername.id,
        username: existingByUsername.username,
        socketId: existingByUsername.socketId
      });
      
      io.to(roomId).emit('playersUpdate', room.currentPlayers);
      
      // Исправляем hostId после переподключения игрока
      fixHostIdInRooms();
      
      return;
    }
    
    // Если статус не waiting, разрешаем переподключение игрока, который уже числится в этой комнате
    if (room.status !== 'waiting') {
      const allowedRejoin = (
        // Во время определения очередности: если игрок есть в списке orderDetermination.players
        (room.status === 'determining_order' && room.orderDetermination &&
          room.orderDetermination.players &&
          room.orderDetermination.players.some(p => p.username === playerData.username || p.id === playerData.id))
        ||
        // Во время игры: если игрок ранее был среди currentPlayers (мог быть очищен при дисконнекте)
        room.currentPlayers.some(p => p.username === playerData.username || p.fixedId === playerData.id)
      );

      if (!allowedRejoin) {
        console.log('❌ [SERVER] Room not in waiting status, cannot add new player');
        return;
      }

      // Если переподключение разрешено: либо обновляем существующего, либо добавляем заново как возвращающегося
      let player = room.currentPlayers.find(p => p.username === playerData.username || p.fixedId === playerData.id);
      if (player) {
        player.socketId = socket.id;
        player.offline = false;
        player.roomId = roomId;
      } else {
        player = {
          id: playerData.id,
          fixedId: playerData.id,
          socketId: socket.id,
          username: playerData.username,
          color: playerData.color,
          ready: true,
          position: 0,
          profession: playerData.profession || null,
          balance: playerData.balance || 2000,
          passiveIncome: playerData.passiveIncome || 0,
          salary: playerData.profession?.salary || 0,
          expenses: playerData.profession?.expenses || 0,
          childCost: 500,
          totalExpenses: playerData.profession?.expenses || 0,
          monthlyCashflow: (playerData.profession?.salary || 0) - (playerData.profession?.expenses || 0),
          assets: playerData.assets || [],
          liabilities: playerData.liabilities || {},
          children: 0,
          charityTurns: 0,
          _lastRollOptions: null,
          seat: null,
          offline: false,
          roomId: roomId
        };
        room.currentPlayers.push(player);
      }

      socket.join(roomId);
      io.to(roomId).emit('playersUpdate', room.currentPlayers);
      fixHostIdInRooms();
      persistRooms();
      console.log('🔁 [SERVER] Player rejoined during status', room.status, ':', player.username);
      return;
    }
    
    // Проверяем лимит игроков
    if (room.currentPlayers.length >= room.maxPlayers) {
      console.log(`❌ [SERVER] Room ${roomId} is full (${room.currentPlayers.length}/${room.maxPlayers})`);
      socket.emit('error', { message: 'Комната заполнена' });
      return;
    }
    
    // Создаем игрока с профессией из playerData, если она есть
    const player = {
      id: playerData.id,
      fixedId: playerData.id,
      socketId: socket.id,
      username: playerData.username,
      color: playerData.color,
      ready: false,
      position: 0,
      // Используем профессию из playerData, если она есть
      profession: playerData.profession || null,
      balance: playerData.balance || 2000, // Используем баланс из playerData или базовый
      passiveIncome: playerData.passiveIncome || 0,
      salary: playerData.profession?.salary || 0, // Устанавливаем из профессии
      expenses: playerData.profession?.expenses || 0, // Устанавливаем из профессии
      childCost: 500,
      totalExpenses: playerData.profession?.expenses || 0,
      monthlyCashflow: (playerData.profession?.salary || 0) - (playerData.profession?.expenses || 0),
      assets: playerData.assets || [],
      liabilities: playerData.liabilities || {},
      children: 0,
      charityTurns: 0,
      _lastRollOptions: null,
      seat: null,
      offline: false,
      roomId: roomId
    };
    
    // Если это первый игрок в комнате, делаем его хостом
    if (room.currentPlayers.length === 0) {
      room.hostId = player.socketId;
      console.log('👑 [SERVER] First player in room, setting as host:', {
        username: player.username,
        socketId: player.socketId,
        roomId: roomId
      });
    }
    
    // Если у комнаты нет хоста, назначаем первого активного игрока
    if (!room.hostId) {
      room.hostId = player.socketId;
      console.log('👑 [SERVER] Room has no host, setting first active player as host:', {
        username: player.username,
        socketId: player.socketId,
        roomId: roomId
      });
    }
    
    // Проверяем, что хост все еще активен
    if (room.hostId && !room.currentPlayers.find(p => p.socketId === room.hostId)) {
      room.hostId = player.socketId;
      console.log('👑 [SERVER] Previous host is offline, setting new host:', {
        username: player.username,
        socketId: player.socketId,
        roomId: roomId
      });
    }
    
    room.currentPlayers.push(player);
    socket.join(roomId);
    
    console.log('✅ [SERVER] New player added:', {
      id: player.id,
      username: player.username,
      socketId: player.socketId,
      totalPlayers: room.currentPlayers.length
    });
    
    console.log('📊 [SERVER] Final room state:', {
      roomId,
      totalPlayers: room.currentPlayers.length,
      players: room.currentPlayers.map(p => ({ 
        id: p.id, 
        username: p.username, 
        socketId: p.socketId,
        offline: p.offline 
      }))
    });
    
    // Финальная очистка дублей перед отправкой
    cleanupDuplicatePlayers(room);
    
    io.to(roomId).emit('playersUpdate', room.currentPlayers);
    
    // Отправляем обновленные данные комнаты (включая hostId)
    io.to(roomId).emit('roomData', { 
      roomId: room.roomId, 
      maxPlayers: room.maxPlayers, 
      status: room.status, 
      hostId: room.hostId, 
      timer: room.timer, 
      currentTurn: room.currentTurn 
    });
    
    persistRooms();
    
    // Исправляем hostId после добавления игрока
    fixHostIdInRooms();
    
    const roomsList = getSortedRoomsList();
    io.emit('roomsList', roomsList);
  });

  // New event: toggle ready
  socket.on('toggleReady', (roomId) => {
    console.log('🎯 [SERVER] toggleReady received for room', roomId, 'from socket', socket.id);
    console.log('🎯 [SERVER] Available rooms:', Object.keys(rooms));
    console.log('🎯 [SERVER] Room details:', Object.keys(rooms).map(id => ({
      id,
      status: rooms[id]?.status,
      players: rooms[id]?.currentPlayers?.length || 0
    })));
    
    const room = rooms[roomId];
    if (!room) {
      console.log('❌ [SERVER] toggleReady: Room not found:', roomId);
      console.log('❌ [SERVER] Available room IDs:', Object.keys(rooms));
      socket.emit('toggleReadyError', 'Room not found');
      return;
    }
    
    console.log('🎯 [SERVER] Room found:', { 
      roomId, 
      status: room.status, 
      currentPlayers: room.currentPlayers.length,
      players: room.currentPlayers.map(p => ({ 
        id: p.id, 
        username: p.username, 
        socketId: p.socketId,
        ready: p.ready 
      }))
    });
    
    // Ищем игрока по socketId
    let player = room.currentPlayers.find(p => p.socketId === socket.id);
    
    if (!player) {
      console.log('🎯 [SERVER] Player not found by socketId, trying to find by fixedId...');
      // Если не нашли по socketId, ищем по фиксированному ID
      // Но только если у нас есть playerData в socket
      const playerData = socket.playerData;
      if (playerData && playerData.id) {
        player = room.currentPlayers.find(p => p.fixedId === playerData.id);
        console.log('🎯 [SERVER] Looking for player with fixedId:', playerData.id);
      }
    }
    
    if (player) {
      console.log('✅ [SERVER] Found player:', { 
        username: player.username, 
        id: player.id, 
        socketId: player.socketId,
        currentReady: player.ready 
      });
      
      // Flip ready and manage seat assignment
      const nextReady = !player.ready;
      if (nextReady) {
        // Assign lowest free seat
        const usedSeats = new Set(
          room.currentPlayers.filter(p => p.ready && p.seat !== null).map(p => p.seat)
        );
        let seat = null;
        for (let i = 0; i < room.maxPlayers; i += 1) {
          if (!usedSeats.has(i)) { seat = i; break; }
        }
        if (seat === null) {
          console.log('❌ [SERVER] No free seats available');
          socket.emit('noSeat');
          return;
        }
        player.seat = seat;
        player.ready = true;
        
        // Добавляем игрока в массив готовых
        if (!room.playersReady) room.playersReady = [];
        if (!room.playersReady.includes(player.id)) {
          room.playersReady.push(player.id);
        }
        
        console.log('✅ [SERVER] Player marked as ready, assigned seat:', seat);
      } else {
        player.ready = false;
        player.seat = null;
        
        // Убираем игрока из массива готовых
        if (room.playersReady) {
          room.playersReady = room.playersReady.filter(id => id !== player.id);
        }
        
        console.log('✅ [SERVER] Player marked as not ready, seat cleared');
      }
      
      console.log('✅ [SERVER] Player ready status updated:', player.ready);
      console.log('📊 [SERVER] Players ready:', room.playersReady || []);
      
      // Отправляем подтверждение клиенту
      socket.emit('toggleReadySuccess', { 
        player: { 
          id: player.id, 
          username: player.username, 
          ready: player.ready,
          seat: player.seat 
        } 
      });
      
      io.to(roomId).emit('playersUpdate', room.currentPlayers);
      persistRooms();
      // Note: game will start only when host presses Start
    } else {
      console.log('❌ [SERVER] Player not found in room:', roomId, 'socketId:', socket.id);
      console.log('❌ [SERVER] Available players:', room.currentPlayers.map(p => ({ 
        id: p.id, 
        socketId: p.socketId, 
        username: p.username 
      })));
      socket.emit('toggleReadyError', 'Player not found in room');
    }
  });

  // Roll dice event
  socket.on('rollDice', (roomId, callback) => {
    console.log('🎲 [SERVER] rollDice requested for room:', roomId, 'by socket:', socket.id);
    
    const room = rooms[roomId];
    if (!room) {
      console.log('❌ [SERVER] rollDice: Room not found:', roomId);
      if (typeof callback === 'function') callback({ success: false, error: 'Room not found' });
      return;
    }

    // Генерируем случайное число 1-6
    const diceResult = Math.floor(Math.random() * 6) + 1;
    console.log('🎲 [SERVER] Dice roll result:', diceResult, 'for room:', roomId);

    // Отправляем результат обратно клиенту
    if (typeof callback === 'function') {
      callback({ success: true, result: diceResult });
    }

    // Также отправляем результат всем игрокам в комнате (опционально)
    io.to(roomId).emit('diceRolled', {
      playerId: socket.id,
      result: diceResult,
      timestamp: Date.now()
    });
  });

  // Start game: start timer
  socket.on('startGame', (roomId, ack) => {
    const room = rooms[roomId];
    if (!room) {
      console.log('startGame: no room', roomId);
      if (typeof ack === 'function') ack(false, 'NO_ROOM');
      return;
    }
    
    // Проверяем, что только хост может запустить игру
    const hostPlayer = room.currentPlayers.find(p => p.id === room.hostId);
    if (!hostPlayer || hostPlayer.socketId !== socket.id) {
      console.log('startGame: only host can start game', roomId, 'hostId:', room.hostId, 'hostSocketId:', hostPlayer?.socketId, 'currentSocketId:', socket.id);
      if (typeof ack === 'function') ack(false, 'NOT_HOST');
      return;
    }
    
    console.log('startGame requested', roomId, 'by', socket.id, 'players', room.currentPlayers.length, 'status', room.status);
    
    // Проверяем, что все игроки выбрали профессию
    const playersWithProfession = room.currentPlayers.filter(p => p.profession);
    const allPlayersHaveProfession = playersWithProfession.length === room.currentPlayers.length;
    
    console.log('startGame: profession check:', {
      totalPlayers: room.currentPlayers.length,
      playersWithProfession: playersWithProfession.length,
      allPlayersHaveProfession,
      players: room.currentPlayers.map(p => ({ username: p.username, profession: p.profession?.name || 'none' }))
    });
    
    // If already started, just re-emit events so clients can sync state
    if (room.status === 'started') {
      console.log('startGame: game already started, re-emitting events');
        io.to(roomId).emit('gameStarted');
      io.to(roomId).emit('roomData', { roomId: room.roomId, maxPlayers: room.maxPlayers, status: room.status, hostId: room.hostId, timer: room.timer, currentTurn: room.currentTurn });
      io.to(roomId).emit('playersList', room.currentPlayers);
      if (typeof ack === 'function') ack(true);
      return;
    }
    
    if (room.status === 'waiting' && room.currentPlayers.length >= 2 && allPlayersHaveProfession) {
      try {
        console.log('startGame: starting game for room', roomId);
        console.log('startGame: current players:', room.currentPlayers.map(p => ({ 
          id: p.id, 
          username: p.username, 
          ready: p.ready, 
          seat: p.seat,
          socketId: p.socketId 
        })));
        
        // Acknowledge first so UI can transition immediately
        if (typeof ack === 'function') ack(true);
        
        // Change status to determining order
        room.status = 'determining_order';
        console.log('startGame: room status changed to determining_order');
        
        // Инициализируем состояние для определения очередности
        room.orderDetermination = {
          phase: 'initial_roll',
          players: room.currentPlayers.map(p => ({
            id: p.id, // Используем id игрока для консистентности
            username: p.username,
            diceRoll: null,
            finalPosition: null
          })),
          timer: 180, // 3 минуты на бросок кубиков
          autoRolls: [] // Список игроков для автоброска
        };
        
        console.log('startGame: orderDetermination initialized:', room.orderDetermination);
        
        // Emit all necessary events
        console.log('startGame: emitting gameStarted event');
        io.to(roomId).emit('gameStarted');
        
        console.log('startGame: emitting roomData event with status determining_order');
        io.to(roomId).emit('roomData', { 
          roomId: room.roomId, 
          maxPlayers: room.maxPlayers, 
          status: room.status, 
          hostId: room.hostId, 
          currentTurn: null // Пока нет текущего хода
        });
        
        // Отправляем событие для определения очередности
        console.log('startGame: emitting orderDeterminationStarted event');
        io.to(roomId).emit('orderDeterminationStarted', {
          players: room.orderDetermination.players,
          timer: room.orderDetermination.timer,
          phase: room.orderDetermination.phase
        });
        
        // Send full players list so client can initialize board state
        console.log('startGame: emitting playersList event');
        io.to(roomId).emit('playersList', room.currentPlayers);
        
        console.log('startGame: events emitted for', roomId, 'status:', room.status);
        
        // Persist room state
        persistRooms();
        
        // Запускаем таймер определения очередности
        startOrderDeterminationTimer(roomId);
        
        // Start game timer
        // Перезапускаем общий игровой таймер безопасно и эмитим только когда игра действительно началась
        if (room.timerInterval) {
          clearInterval(room.timerInterval);
        }
        const timerInterval = setInterval(() => {
          const r = rooms[roomId];
          if (!r) return clearInterval(timerInterval);
          // Не шлём общий timerUpdate во время определения очередности
          if (r.status !== 'started') {
            console.log('⏰ [SERVER][SKIP_GAME_TIMER]', { roomId, status: r.status, remaining: r.timer?.remaining });
            return;
          }
          r.timer.remaining -= 1;
          console.log('⏰ [SERVER][GAME_TIMER_TICK]', { roomId, remaining: r.timer.remaining });
          if (r.timer.remaining <= 0) {
            clearInterval(timerInterval);
            io.to(roomId).emit('gameEnded', 'Timer expired');
          } else {
            // Общий timerUpdate отключён — используем только turnTimerUpdate
            // io.to(roomId).emit('timerUpdate', r.timer.remaining);
          }
        }, 1000);
        room.timerInterval = timerInterval;
        
        console.log('startGame: game successfully started for room', roomId);
        
      } catch (e) {
        console.error('startGame error', e);
        if (typeof ack === 'function') ack(false, 'ERROR: ' + e.message);
      }
    } else if (room.status === 'waiting' && room.currentPlayers.length >= 2 && !allPlayersHaveProfession) {
      console.log('startGame blocked: not all players have profession. Current:', { 
        status: room.status, 
        players: room.currentPlayers.length,
        playersWithProfession: playersWithProfession.length,
        allPlayersHaveProfession
      });
      if (typeof ack === 'function') ack(false, 'NEED_PROFESSIONS');
    } else {
      console.log('startGame blocked: need status=waiting and >=2 players. Current:', { status: room.status, players: room.currentPlayers.length });
      if (typeof ack === 'function') ack(false, 'INVALID_STATE');
    }
  });

  // Start game after order determination
  socket.on('startGameAfterOrder', (roomId) => {
    console.log('🎮 [SERVER] startGameAfterOrder received for room:', roomId);
    
    const room = rooms[roomId];
    if (!room) {
      console.log('❌ [SERVER] startGameAfterOrder: Room not found:', roomId);
      return;
    }
    
    if (room.status !== 'determining_order') {
      console.log('❌ [SERVER] startGameAfterOrder: Room not in determining_order status:', room.status);
      return;
    }
    
    if (!room.orderDetermination) {
      console.log('❌ [SERVER] startGameAfterOrder: No orderDetermination found');
      return;
    }
    
    // Проверяем, что все игроки бросили кубики
    const allRolled = room.orderDetermination.players.every(p => p.diceRoll !== null);
    if (!allRolled) {
      console.log('❌ [SERVER] startGameAfterOrder: Not all players rolled dice yet');
      return;
    }
    
    console.log('✅ [SERVER] startGameAfterOrder: All players rolled, starting game');
    
    // Определяем финальный порядок
    determineFinalOrder(roomId);
  });

  // Loan/Repay
  socket.on('game.choose', (roomId, playerId, choice) => {
    const room = rooms[roomId];
    const player = room.currentPlayers.find(p => p.id === playerId);
    if (choice.type === 'loan') {
      const amount = choice.amount - (choice.amount % config.rules.loanStep);
      player.liabilities.loans += amount;
      player.balance += amount;
      player.expenses += (amount / 1000) * config.rules.loanInterestPer1000;
    } else if (choice.type === 'repay') {
      const amount = Math.min(choice.amount, player.liabilities.loans) - (choice.amount % config.rules.loanStep);
      if (player.balance >= amount) {
        player.balance -= amount;
        player.liabilities.loans -= amount;
        player.expenses -= (amount / 1000) * config.rules.loanInterestPer1000;
      }
    } else if (choice.type === 'transfer_asset') {
      const targetPlayer = room.currentPlayers.find(p => p.id === choice.targetPlayerId);
      // Ensure player.assets is an array
      if (!Array.isArray(player.assets)) {
        player.assets = [];
      }
      
      // Ensure player.assets is an array before using find
      if (!Array.isArray(player.assets)) {
        player.assets = [];
      }
      
      const asset = player.assets.find(a => a.id === choice.assetId); // Assume assets have id
      if (asset && targetPlayer) {
        player.assets = player.assets.filter(a => a.id !== asset.id);
        player.passiveIncome -= asset.cashflow || 0;
        
        // Ensure targetPlayer.assets is an array
        if (!Array.isArray(targetPlayer.assets)) {
          targetPlayer.assets = [];
        }
        
        targetPlayer.assets.push(asset);
        targetPlayer.passiveIncome += asset.cashflow || 0;
        // Transfer mortgage if any
        if (asset.mortgage) {
          player.liabilities.loans -= asset.mortgage; // Simplify, or handle separately
          targetPlayer.liabilities.loans += asset.mortgage;
          player.expenses -= (asset.mortgage / 1000) * config.rules.loanInterestPer1000;
          targetPlayer.expenses += (asset.mortgage / 1000) * config.rules.loanInterestPer1000;
        }
        io.to(roomId).emit('assetTransferred', { from: playerId, to: choice.targetPlayerId, asset });
        io.to(roomId).emit('playerUpdated', player);
        io.to(roomId).emit('playerUpdated', targetPlayer);
      }
    } // Add other choices: transfer_cash, transfer_asset, etc.
    io.to(roomId).emit('playerUpdated', player);
  });

  // End turn: check fast track transition, next player
  socket.on('game.endTurn', (roomId, playerId) => {
    const room = rooms[roomId];
    const player = room.currentPlayers.find(p => p.id === playerId);
    if (player.passiveIncome >= player.expenses && !player.isFastTrack) {
      player.isFastTrack = true;
      player.position = 0; // Start of fast track
      io.to(roomId).emit('playerFastTrack', playerId);
    }
    // Find next player: cycle through currentPlayers starting after current
    const currIdx = room.currentPlayers.findIndex(p => p.id === room.currentTurn);
    const nextIdx = (currIdx + 1) % room.currentPlayers.length;
    room.currentTurn = room.currentPlayers[nextIdx].id;
    io.to(roomId).emit('turnChanged', room.currentTurn);

    // Add bankruptcy check
    if (player.balance < config.rules.bankruptcyThreshold && player.liabilities.loans > 0 /* or can't pay expenses */) {
      // Remove player or mark bankrupt
      room.currentPlayers = room.currentPlayers.filter(p => p.id !== playerId);
      io.to(roomId).emit('playerBankrupt', playerId);
      if (room.currentPlayers.length < 2) {
        io.to(roomId).emit('gameEnded', 'Not enough players');
      }
    }
  });

  // Update existing rollDice and movePlayer to use board layout and trigger events
  socket.on('rollDice', (roomId, playerId) => {
    console.log('rollDice received:', { roomId, playerId, socketId: socket.id });
    const room = rooms[roomId];
    if (!room) {
      console.warn('rollDice: room not found', roomId);
      return;
    }
    if (!room.currentTurn) {
      console.warn('rollDice: no current turn', { roomId, room });
      return;
    }
    if (room.currentTurn !== playerId) {
      console.warn('rollDice rejected: not current turn', { roomId, currentTurn: room.currentTurn, playerId });
      return;
    }
    const player = room.currentPlayers.find(p => p.id === playerId);
    if (!player) {
      console.warn('rollDice: player not found', { roomId, playerId, players: room.currentPlayers });
      return;
    }
    console.log('rollDice: rolling for player', { playerId, username: player.username, charityTurns: player.charityTurns });
    
    if (player.charityTurns > 0) {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      const options = [d1, d2, d1 + d2];
      player._lastRollOptions = { d1, d2, options };
      console.log('rollDice: charity roll', { playerId, d1, d2, options });
      
      // Отправляем событие для нового модуля DiceRoller
      io.to(roomId).emit('gameDiceRoll', {
        playerId: playerId,
        username: player.username,
        diceRoll: d1 + d2,
        d1: d1,
        d2: d2,
        options: options
      });
      
      // Отправляем также старое событие для совместимости
      io.to(roomId).emit('diceRolled', { playerId, dice: d1 + d2, d1, d2, options });
    } else {
      const dice = Math.floor(Math.random() * 6) + 1;
      if (player) player._lastRollOptions = { d1: dice, d2: 0, options: [dice] };
      console.log('rollDice: normal roll', { playerId, dice });
      
      // Отправляем событие для нового модуля DiceRoller
      io.to(roomId).emit('gameDiceRoll', {
        playerId: playerId,
        username: player.username,
        diceRoll: dice,
        d1: dice,
        d2: 0,
        options: [dice]
      });
      
      // Отправляем также старое событие для совместимости
      io.to(roomId).emit('diceRolled', { playerId, dice, d1: dice, d2: 0, options: [dice] });
    }
  });

  // Бросок кубиков для определения очередности
  socket.on('rollDiceForOrder', (roomId, playerId) => {
    console.log('🎲 [SERVER] rollDiceForOrder received:', { roomId, playerId, socketId: socket.id });
    
    const room = rooms[roomId];
    if (!room || room.status !== 'determining_order') {
      console.warn('🎲 [SERVER] rollDiceForOrder rejected: wrong room status or room not found');
      return;
    }
    
    if (!room.orderDetermination) {
      console.warn('🎲 [SERVER] rollDiceForOrder rejected: no orderDetermination');
      return;
    }
    
    // Находим игрока в списке определения очередности
    const orderPlayer = room.orderDetermination.players.find(p => p.id === playerId);
    if (!orderPlayer) {
      console.warn('🎲 [SERVER] rollDiceForOrder rejected: player not found in orderDetermination');
      return;
    }
    
    // Проверяем, не бросал ли уже игрок
    if (orderPlayer.diceRoll !== null) {
      console.warn('🎲 [SERVER] rollDiceForOrder rejected: player already rolled');
      return;
    }
    
    // Бросаем кубик
    const diceRoll = Math.floor(Math.random() * 6) + 1;
    orderPlayer.diceRoll = diceRoll;
    
    console.log('🎲 [SERVER] Player', orderPlayer.username, 'rolled:', diceRoll);
    
    // Уведомляем всех о результате броска
    io.to(roomId).emit('orderDeterminationRoll', {
      playerId: orderPlayer.id, // Используем id из orderDetermination
      username: orderPlayer.username,
      diceRoll,
      isAutoRoll: false
    });
    
    // Проверяем, все ли игроки бросили кубики
    const allRolled = room.orderDetermination.players.every(p => p.diceRoll !== null);
    
    if (allRolled) {
      console.log('🎲 [SERVER] All players rolled. Waiting for manual start...');
      // Останавливаем таймер определения очередности, чтобы не сработал автозапуск
      if (room.orderDetermination.timerInterval) {
        clearInterval(room.orderDetermination.timerInterval);
      }
      // Уведомляем клиентов, что можно нажать кнопку "Начать игру"
      io.to(roomId).emit('orderDeterminationAllRolled', {
        roomId,
        players: room.orderDetermination.players
      });
    }
  });

  // Установка профессии игрока
  socket.on('setPlayerProfession', (roomId, professionName) => {
    console.log('💼 [SERVER] setPlayerProfession received:', { roomId, professionName, socketId: socket.id });
    
    const room = rooms[roomId];
    if (!room) {
      console.warn('💼 [SERVER] setPlayerProfession rejected: room not found');
      return;
    }
    
    const player = room.currentPlayers.find(p => p.socketId === socket.id);
    if (!player) {
      console.warn('💼 [SERVER] setPlayerProfession rejected: player not found');
      return;
    }
    
    // Устанавливаем профессию игрока как объект
    const professionObject = PROFESSIONS.find(p => p.name === professionName);
    if (professionObject) {
      player.profession = professionObject;
      // Обновляем характеристики игрока согласно профессии
      player.salary = professionObject.salary;
      player.expenses = professionObject.expenses;
      player.balance = professionObject.balance;
      player.passiveIncome = professionObject.passiveIncome;
      player.totalExpenses = professionObject.expenses;
      player.monthlyCashflow = professionObject.salary - professionObject.expenses;
    } else {
      player.profession = professionName; // fallback к строке
    }
    
    console.log('💼 [SERVER] Profession set for player:', player.username, professionName);
    console.log('💼 [SERVER] Current room state:', {
      roomId,
      totalPlayers: room.currentPlayers.length,
      playersWithProfession: room.currentPlayers.filter(p => p.profession && p.profession !== 'none').length,
      allPlayers: room.currentPlayers.map(p => ({ username: p.username, profession: p.profession || 'none' }))
    });
    
    // Уведомляем всех об обновлении профессии
    io.to(roomId).emit('playerProfessionUpdated', { roomId, playerId: player.id, profession: professionObject || professionName });
    
    // Обновляем список игроков
    io.to(roomId).emit('playersUpdate', room.currentPlayers);
    
    persistRooms();
  });

  // Установка мечты игрока
  socket.on('setPlayerDream', ({ roomId, dream }) => {
    console.log('💤 [SERVER] setPlayerDream received:', { roomId, socketId: socket.id, dream });
    const room = rooms[roomId];
    if (!room) {
      console.warn('💤 [SERVER] setPlayerDream rejected: room not found', roomId);
      return;
    }
    const player = room.currentPlayers.find(p => p.socketId === socket.id);
    if (!player) {
      console.warn('💤 [SERVER] setPlayerDream rejected: player not found for socket', socket.id);
      return;
    }
    player.dream = dream;
    io.to(roomId).emit('playerUpdated', player);
    io.to(roomId).emit('playersUpdate', room.currentPlayers);
    persistRooms();
  });

  // Бросок кубиков для переигровки ничьей
  socket.on('rollDiceForTieBreak', (roomId, playerId) => {
    console.log('🎲 [SERVER] rollDiceForTieBreak received:', { roomId, playerId, socketId: socket.id });
    
    const room = rooms[roomId];
    if (!room || room.status !== 'determining_order') {
      console.warn('🎲 [SERVER] rollDiceForTieBreak rejected: wrong room status or room not found');
      return;
    }
    
    if (!room.orderDetermination || room.orderDetermination.phase !== 'tie_break') {
      console.warn('🎲 [SERVER] rollDiceForTieBreak rejected: not in tie break phase');
      return;
    }
    
    // Находим игрока в списке определения очередности
    const orderPlayer = room.orderDetermination.players.find(p => p.id === playerId);
    if (!orderPlayer) {
      console.warn('🎲 [SERVER] rollDiceForTieBreak rejected: player not found in orderDetermination');
      return;
    }
    
    // Проверяем, не бросал ли уже игрок для переигровки
    if (orderPlayer.tieBreakRoll !== null) {
      console.warn('🎲 [SERVER] rollDiceForTieBreak rejected: player already rolled for tie break');
      return;
    }
    
    // Бросаем кубик для переигровки
    const tieBreakRoll = Math.floor(Math.random() * 6) + 1;
    orderPlayer.tieBreakRoll = tieBreakRoll;
    
    console.log('🎲 [SERVER] Player', orderPlayer.username, 'tie break rolled:', tieBreakRoll);
    
    // Уведомляем всех о результате броска для переигровки
    io.to(roomId).emit('orderDeterminationTieBreakRoll', {
      playerId: orderPlayer.id, // Используем id из orderDetermination
      username: orderPlayer.username,
      diceRoll: tieBreakRoll,
      isAutoRoll: false
    });
    
    // Проверяем, все ли игроки с ничьей бросили кубики для переигровки
    const tieBreakPlayers = room.orderDetermination.tieBreakPlayers || [];
    const allTieBreakRolled = tieBreakPlayers.every(p => p.tieBreakRoll !== null);
    
    if (allTieBreakRolled) {
      console.log('🎲 [SERVER] All tie break players rolled, determining final order');
      
      // Останавливаем таймер переигровки
      if (room.orderDetermination.tieBreakTimerInterval) {
        clearInterval(room.orderDetermination.tieBreakTimerInterval);
      }
      
      // Определяем финальный порядок с переигровкой
      determineFinalOrderWithTieBreak(roomId);
    }
  });

  socket.on('movePlayer', (roomId, playerId, steps) => {
    const room = rooms[roomId];
    if (!room || !room.currentTurn) return;
    const player = room.currentPlayers.find(p => p.id === playerId);
    if (!player) return;
    if (room.currentTurn !== playerId) {
      console.warn('movePlayer rejected: not current turn', { roomId, currentTurn: room.currentTurn, playerId, steps });
      return;
    }
    console.log('movePlayer', { roomId, playerId, steps, isFastTrack: player.isFastTrack });
      const track = player.isFastTrack ? room.board.fastTrack : room.board.ratRace;
      
      // Different movement logic for different tracks
      if (player.isFastTrack) {
        // Fast Track: move counter-clockwise (against clock)
        player.position = (player.position - Math.abs(steps) + track.cells) % track.cells;
      } else {
        // Rat Race: move clockwise (with clock) - start from top, go down
        player.position = (player.position + Math.abs(steps)) % track.cells;
      }
      
      const cellType = track.layout[player.position % track.layout.length]; // Cycle layout if shorter
      if (cellType === 'market') {
        // Draw card
        const deck = config.decks.market;
        const card = deck[Math.floor(Math.random() * deck.length)];
        
        // Ensure player.assets is an array
        if (!Array.isArray(player.assets)) {
          player.assets = [];
        }
        
        const matchingAssets = player.assets.filter(a => a.symbol === card.symbol);
        let proceeds = 0;
        matchingAssets.forEach(asset => {
          proceeds += (card.price * asset.units) - (asset.mortgage || 0);
          player.passiveIncome -= asset.cashflow || 0; // Assume assets have cashflow
        });
        player.balance += proceeds;
        player.assets = player.assets.filter(a => a.symbol !== card.symbol);
        io.to(roomId).emit('marketEvent', { playerId, card, proceeds });
      } else if (cellType === 'payday') {
        player.balance += player.monthlyCashflow || player.salary - player.totalExpenses;
        io.to(roomId).emit('paydayEvent', { playerId, amount: player.monthlyCashflow });
      } else if (cellType === 'child') {
        player.children += 1;
        player.expenses += player.childCost;
        io.to(roomId).emit('childEvent', { playerId });
      } else if (cellType === 'smallDeal' || cellType === 'bigDeal') {
        // Показываем выбор: малые или большие сделки только текущему игроку
        socket.emit('dealChoice', { 
          playerId, 
          cellType, 
          position: player.position,
          balance: player.balance,
          monthlyCashflow: player.monthlyCashflow || 0
        });
      } else if (cellType === 'doodad') {
        const deck = config.decks.doodad;
        if (deck.length === 0) {
          console.log('No doodad cards available');
          io.to(roomId).emit('doodadEvent', { playerId, card: null });
          return;
        }
        const card = deck[Math.floor(Math.random() * deck.length)];
        if (card && typeof card.cost === 'number') {
          player.balance -= card.cost;
        } else {
          console.warn('Invalid doodad card:', card);
        }
        io.to(roomId).emit('doodadEvent', { playerId, card });
      } else if (cellType === 'charity') {
        // Предложение благотворительности: 10% от дохода, 1 ход с 2 кубиками
        const totalIncome = (player.salary || 0) + (player.passiveIncome || 0);
        const cost = Math.max(0, Math.floor(totalIncome * 0.10));
        io.to(roomId).emit('charityOffer', { playerId, cost });
      } else if (cellType === 'downsized') {
        player.balance -= player.expenses; // Pay expenses
        // Skip next turn: set flag
        io.to(roomId).emit('downsizedEvent', { playerId });
      }
      io.to(roomId).emit('playerMoved', { playerId, position: player.position, cellType });
      // Trigger modal/event based on cellType (e.g., draw card from deck)
  });

  // End turn and move to next player
  socket.on('endTurn', (roomId, playerId) => {
    console.log('endTurn received:', { roomId, playerId, socketId: socket.id });
    const room = rooms[roomId];
    if (!room || room.status !== 'started') return;
    
    if (room.currentTurn !== playerId) {
      console.warn('endTurn rejected: not current turn', { roomId, currentTurn: room.currentTurn, playerId });
      return;
    }
    
    // Stop current turn timer
    stopTurnTimer(roomId);
    
    // Find current player index and move to next
    const currentPlayerIndex = room.currentPlayers.findIndex(p => p.id === playerId);
    if (currentPlayerIndex === -1) return;
    
    // Move to next player (cycle through players)
    const nextPlayerIndex = (currentPlayerIndex + 1) % room.currentPlayers.length;
    const nextPlayer = room.currentPlayers[nextPlayerIndex];
    
    room.currentTurn = nextPlayer.id;
    console.log('endTurn: next player', { 
      currentPlayer: playerId, 
      nextPlayer: nextPlayer.id, 
      username: nextPlayer.username 
    });
    
    // Emit turn change to all players
    io.to(roomId).emit('turnChanged', nextPlayer.id);
    io.to(roomId).emit('roomData', { 
      roomId: room.roomId, 
      maxPlayers: room.maxPlayers, 
      status: room.status, 
      hostId: room.hostId, 
      timer: room.timer, 
      currentTurn: room.currentTurn 
    });
    
    // Start timer for next player
    startTurnTimer(roomId, nextPlayer.id);
    
    persistRooms();
  });

  // Host can pause turn timer
  socket.on('pauseTurnTimer', (roomId) => {
    console.log('pauseTurnTimer received:', { roomId, socketId: socket.id });
    const success = pauseTurnTimer(roomId, socket.id);
    socket.emit('pauseTurnTimerResult', { success, roomId });
  });

  // Host can resume turn timer
  socket.on('resumeTurnTimer', (roomId) => {
    console.log('resumeTurnTimer received:', { roomId, socketId: socket.id });
    const success = resumeTurnTimer(roomId, socket.id);
    socket.emit('resumeTurnTimerResult', { success, roomId });
  });

  // Выбор типа сделки
  socket.on('selectDealType', (roomId, dealType) => {
    const room = rooms[roomId];
    if (!room) return;
    const player = room.currentPlayers.find(p => p.id === socket.id);
    if (!player) return;
    
    console.log('selectDealType:', { roomId, dealType, playerId: player.id });
    
    // Получаем карту из выбранной колоды
    const deck = config.decks[dealType];
    if (!deck || deck.length === 0) {
      socket.emit('dealError', { message: 'Колода пуста' });
      return;
    }
    
    const card = deck[Math.floor(Math.random() * deck.length)];
    const maxLoan = (player.monthlyCashflow || 0) * 10;
    
    socket.emit('dealCard', { 
      card, 
      type: dealType, 
      playerId: player.id,
      balance: player.balance,
      maxLoan,
      canAfford: player.balance >= card.cost,
      needsLoan: player.balance < card.cost && card.cost <= player.balance + maxLoan
    });
  });

  // Покупка сделки
  socket.on('buyDeal', (roomId, card, useLoan = false, loanAmount = 0) => {
    const room = rooms[roomId];
    if (!room) return;
    const player = room.currentPlayers.find(p => p.id === socket.id);
    if (!player) return;
    
    console.log('buyDeal:', { roomId, card, useLoan, loanAmount, playerId: player.id });
    
    if (useLoan) {
      const maxLoan = (player.monthlyCashflow || 0) * 10;
      if (loanAmount > maxLoan) {
        socket.emit('dealError', { message: 'Слишком большой кредит' });
        return;
      }
      
      // Добавляем кредит
      if (!player.liabilities) player.liabilities = {};
      if (!player.liabilities.loans) player.liabilities.loans = [];
      
      player.liabilities.loans.push({
        amount: loanAmount,
        monthlyPayment: Math.floor(loanAmount * 0.1), // 10% в месяц
        remaining: loanAmount
      });
      
      player.balance += loanAmount;
      player.expenses += Math.floor(loanAmount * 0.1);
    }
    
    // Покупаем актив
    if (player.balance >= card.cost) {
      player.balance -= card.cost;
      
      // Добавляем актив
      if (!Array.isArray(player.assets)) player.assets = [];
      player.assets.push({
        name: card.name,
        type: card.type,
        cost: card.cost,
        cashflow: card.cashflow || 0,
        downPayment: card.downPayment || card.cost,
        mortgage: card.mortgage || 0
      });
      
      // Обновляем пассивный доход
      player.passiveIncome = (player.passiveIncome || 0) + (card.cashflow || 0);
      
      io.to(roomId).emit('dealBought', { 
        playerId: player.id, 
        card, 
        newBalance: player.balance,
        newPassiveIncome: player.passiveIncome
      });
      
      // Обновляем данные игрока
      io.to(roomId).emit('playerUpdated', player);
    } else {
      socket.emit('dealError', { message: 'Недостаточно средств' });
    }
  });

  // Подтверждение благотворительности
  socket.on('charityDonate', (roomId) => {
    const room = rooms[roomId];
    if (!room) return;
    const player = room.currentPlayers.find(p => p.id === socket.id);
    if (!player) return;
    const totalIncome = (player.salary || 0) + (player.passiveIncome || 0);
    const cost = Math.max(0, Math.floor(totalIncome * 0.10));
    if (player.balance >= cost) {
      player.balance -= cost;
      player.charityTurns = (player.charityTurns || 0) + 1;
      io.to(roomId).emit('charityAccepted', { playerId: player.id, cost });
      io.to(roomId).emit('playerUpdated', player);
    } else {
      io.to(roomId).emit('charityDeclined', { playerId: player.id, reason: 'INSUFFICIENT_FUNDS' });
    }
  });

  socket.on('getRooms', () => {
    ensureDefaultRoom();
    
    // ПОЛНАЯ ОЧИСТКА ГОСТЕВЫХ И ТЕСТОВЫХ ИГРОКОВ ПЕРЕД ОТПРАВКОЙ СПИСКА
    Object.values(rooms).forEach(room => {
      if (room && room.currentPlayers) {
        cleanupGuestPlayers(room);
      }
    });
    
    const roomsList = getSortedRoomsList();
    socket.emit('roomsList', roomsList);
    console.log('roomsList sent to', socket.id, roomsList);
  });

  // Return full room data for setup screen (hostId, maxPlayers, etc.)
  socket.on('getRoom', (roomId) => {
    console.log(`🏠 [SERVER] getRoom requested: ${roomId} by socket: ${socket.id}`);
    const room = rooms[roomId];
    if (room) {
      console.log(`✅ [SERVER] getRoom response for room ${roomId}:`, {
        roomId: room.roomId,
        status: room.status,
        currentTurn: room.currentTurn,
        playersCount: room.currentPlayers.length,
        hostId: room.hostId,
        maxPlayers: room.maxPlayers
      });
      
      // Проверяем и устанавливаем hostId если его нет
      if (!room.hostId && room.currentPlayers.length > 0) {
        room.hostId = room.currentPlayers[0].id;
        console.log(`👑 [SERVER] Auto-setting hostId for room ${roomId}: ${room.hostId}`);
      }
      
      socket.emit('roomData', {
        roomId: room.roomId,
        maxPlayers: room.maxPlayers,
        status: room.status,
        hostId: room.hostId,
        timer: room.timer,
        currentTurn: room.currentTurn
      });
    } else {
      console.log(`❌ [SERVER] getRoom: room ${roomId} not found for socket: ${socket.id}`);
      console.log(`🔍 [SERVER] Available rooms:`, Object.keys(rooms));
    }
  });

  // Host can kick a player during setup
  socket.on('kickPlayer', (roomId, targetPlayerId) => {
    const room = rooms[roomId];
    if (!room || room.status !== 'waiting') return;
    if (socket.id !== room.hostId) return; // Only host can kick
    const targetIdx = room.currentPlayers.findIndex(p => p.id === targetPlayerId);
    if (targetIdx === -1) return;
    const [removed] = room.currentPlayers.splice(targetIdx, 1);
    const targetSocket = io.sockets.sockets.get(targetPlayerId);
    if (targetSocket) {
      try { targetSocket.leave(roomId); } catch {}
      targetSocket.emit('kicked', { roomId });
    }
    // Reassign host if needed
    if (room.hostId === targetPlayerId) {
      room.hostId = room.currentPlayers[0]?.id || null;
    }
    io.to(roomId).emit('playersUpdate', room.currentPlayers);
    io.to(roomId).emit('roomData', { roomId: room.roomId, maxPlayers: room.maxPlayers, status: room.status, hostId: room.hostId, timer: room.timer });
    const roomsList = getSortedRoomsList();
    io.emit('roomsList', roomsList);
  });

  socket.on('offerDeal', (roomId, fromUser, toUser, dealDetails, price) => {
    io.to(roomId).emit('dealOffered', { from: fromUser, to: toUser, deal: dealDetails, price });
  });

  socket.on('acceptDeal', (roomId, dealId) => {
    // Логика принятия сделки, обновление балансов
    io.to(roomId).emit('dealAccepted', dealId);
  });

  socket.on('transferMoney', (roomId, fromUser, toUser, amount) => {
    // Логика перевода, проверка баланса
    io.to(roomId).emit('moneyTransferred', { from: fromUser, to: toUser, amount });
  });

  socket.on('getPlayers', (roomId) => {
    console.log(`👥 [SERVER] getPlayers requested for room: ${roomId} by socket: ${socket.id}`);
    if (rooms[roomId]) {
      console.log(`✅ [SERVER] getPlayers: Room ${roomId} found, Socket ID: ${socket.id}`);
      console.log(`👥 [SERVER] getPlayers: Current players:`, rooms[roomId].currentPlayers.map(p => ({ id: p.id, username: p.username })));
      
      // Исправляем проблемы с hostId перед отправкой списка игроков
      fixHostIdInRooms();
      
      // Безопасно обновляем ID только для игрока текущего сокета
      const currentPlayer = rooms[roomId].currentPlayers.find(p => p.id === socket.id || p.socketId === socket.id);
      if (currentPlayer && currentPlayer.id !== socket.id) {
        console.log(`🔄 [SERVER] getPlayers: Updating player ID to current socket for`, { username: currentPlayer.username });
        currentPlayer.id = socket.id;
        currentPlayer.offline = false;
      }
      
      // ПОЛНАЯ ОЧИСТКА ГОСТЕВЫХ И ТЕСТОВЫХ ИГРОКОВ ПЕРЕД ОТПРАВКОЙ СПИСКА ИГРОКОВ
      cleanupGuestPlayers(rooms[roomId]);
      
      socket.emit('playersList', rooms[roomId].currentPlayers);
    } else {
      console.log(`❌ [SERVER] getPlayers: Room ${roomId} not found for socket: ${socket.id}`);
      console.log(`🔍 [SERVER] Available rooms:`, Object.keys(rooms));
    }
  });

  // Update username for the current socket's player
  socket.on('updateUsername', (roomId, username) => {
    const room = rooms[roomId];
    if (!room || room.status !== 'waiting') return;
    const player = room.currentPlayers.find(p => p.id === socket.id);
    if (!player) return;
    player.username = String(username).slice(0, 30);
    io.to(roomId).emit('playersUpdate', room.currentPlayers);
  });

  socket.on('buyDeal', (roomId, card) => {
    const room = rooms[roomId];
    const player = room?.currentPlayers?.find(p => p.id === socket.id);
    if (!player) {
      console.warn('buyDeal: player not found', { roomId, socketId: socket.id });
      return;
    }
    if (player.balance >= card.cost) {
      player.balance -= card.cost;
      
      // Ensure player.assets is an array
      if (!Array.isArray(player.assets)) {
        player.assets = [];
      }
      
      player.assets.push({ ...card, units: 1 });
      player.passiveIncome += card.cashflow;
      io.to(roomId).emit('playerUpdated', player);
      checkFastTrackTransition(player);
    }
  });

  // Обработчик готовности игрока
  socket.on('setReady', (roomId, readyState) => {
    console.log(`🎯 [SERVER] setReady: ${readyState} for room: ${roomId} by socket: ${socket.id}`);
    
    const room = rooms[roomId];
    if (!room) {
      console.log(`❌ [SERVER] setReady: Room ${roomId} not found`);
      return;
    }
    
    const player = room.currentPlayers.find(p => p.socketId === socket.id);
    if (!player) {
      console.log(`❌ [SERVER] setReady: Player not found in room ${roomId}`);
      return;
    }
    
    // Обновляем статус готовности
    player.ready = readyState;
    player.readyAt = readyState ? Date.now() : null;
    
    console.log(`✅ [SERVER] Player ${player.username} ready state: ${readyState}`);
    
    // Сохраняем изменения
    persistRooms();
    
    // Уведомляем всех об обновлении готовности
    io.to(roomId).emit('playerReadyUpdated', { roomId, playerId: player.id, ready: readyState });
    
    // Отправляем обновленный список игроков всем в комнате
    io.to(roomId).emit('playersUpdate', room.currentPlayers);
    
    // Проверяем, можно ли начинать игру
    const readyPlayers = room.currentPlayers.filter(p => p.ready);
    if (readyPlayers.length >= 2) {
      io.to(roomId).emit('canStartGame', { readyPlayers: readyPlayers.length, totalPlayers: room.currentPlayers.length });
    }
    
    // Обновляем список комнат для всех
    const roomsList = getSortedRoomsList();
    io.emit('roomsList', roomsList);
  });

  // Обработчик выхода из комнаты
  socket.on('leaveRoom', (roomId) => {
    console.log(`🚪 [SERVER] leaveRoom requested: ${roomId} by socket: ${socket.id}`);
    
    const room = rooms[roomId];
    if (!room) {
      console.log(`❌ [SERVER] leaveRoom: Room ${roomId} not found`);
      return;
    }
    
    // Удаляем игрока из комнаты
    const playerIndex = room.currentPlayers.findIndex(p => p.socketId === socket.id);
    if (playerIndex !== -1) {
      const player = room.currentPlayers[playerIndex];
      console.log(`🚪 [SERVER] Player ${player.username} leaving room ${roomId}`);
      room.currentPlayers.splice(playerIndex, 1);
      
      // Если это был хост, назначаем нового хостом первого игрока
      if (room.hostId === socket.id && room.currentPlayers.length > 0) {
        room.hostId = room.currentPlayers[0].socketId;
        console.log(`👑 [SERVER] New host assigned: ${room.currentPlayers[0].username}`);
      }
      
      // Если комната пуста, удаляем её
      if (room.currentPlayers.length === 0) {
        console.log(`🗑️ [SERVER] Room ${roomId} is empty, removing...`);
        delete rooms[roomId];
      }
      
      // Отключаем сокет от комнаты
      socket.leave(roomId);
      
      // Сохраняем изменения
      persistRooms();
      
      // Обновляем список комнат для всех
      const roomsList = getSortedRoomsList();
      io.emit('roomsList', roomsList);
      
      // Уведомляем остальных игроков в комнате
      if (room.currentPlayers.length > 0) {
        io.to(roomId).emit('playersUpdate', room.currentPlayers);
        
        // Исправляем hostId после выхода игрока
        fixHostIdInRooms();
      }
    }
  });

  // Новые события для управления пользователями
  
  // Аутентификация пользователя (вход или регистрация)
  socket.on('authenticateUser', (username, email, password, callback) => {
    console.log(`🔐 [SERVER] authenticateUser event received!`);
    try {
      console.log(`🔐 [SERVER] authenticateUser event received from socket ${socket.id}!`);
      console.log(`🔐 [SERVER] Authentication attempt received:`, {
        username,
        email,
        password: password ? '***' : 'undefined',
        socketId: socket.id
      });
      
      if (!username || username.trim().length < 2) {
        callback({ success: false, error: 'Имя должно содержать минимум 2 символа' });
        return;
      }
      
      if (!email || !email.trim()) {
        callback({ success: false, error: 'Email обязателен' });
        return;
      }
      
      if (!password || password.trim().length < 6) {
        callback({ success: false, error: 'Пароль должен содержать минимум 6 символов' });
        return;
      }
      
      const trimmedUsername = username.trim();
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();
      
      // Ищем пользователя по email
      const existingUser = getUserByEmail(trimmedEmail);
      
      if (existingUser) {
        // Пользователь найден - проверяем пароль для входа
        if (checkUserPassword(existingUser, trimmedPassword)) {
          // Пароль верный - обновляем socketId
          console.log(`🔄 [SERVER] Updating socketId for existing user: ${existingUser.username} (${existingUser.id}) -> ${socket.id}`);
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
          
          console.log(`✅ [SERVER] User logged in: ${existingUser.username} (${existingUser.email}) (ID: ${existingUser.id})`);
        } else {
          // Пароль неверный
          callback({ success: false, error: 'Неверный пароль' });
        }
      } else {
        // Пользователь не найден - регистрируем нового
        
        // Проверяем уникальность username
        if (!isUsernameUnique(trimmedUsername)) {
          callback({ success: false, error: 'Пользователь с таким именем уже существует' });
          return;
        }
        
        // Регистрируем пользователя
        console.log(`🔄 [SERVER] Registering new user: ${trimmedUsername} (${trimmedEmail}) with socketId: ${socket.id}`);
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
        
        console.log(`✅ [SERVER] User registered successfully: ${trimmedUsername} (${trimmedEmail}) (ID: ${userData.id})`);
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

  // Получение данных пользователя по ID
  socket.on('getUserData', (userId, callback) => {
    const userData = getUserById(userId);
    if (userData) {
      callback({ success: true, userData });
    } else {
      callback({ success: false, error: 'Пользователь не найден' });
    }
  });
  
  // Обновление socketId для существующего пользователя
  socket.on('updateUserSocketId', (userId) => {
    updateUserSocketId(userId, socket.id);
    console.log(`🔄 [SERVER] Updated socketId for user ${userId}: ${socket.id}`);
  });

  // Обработчик отключения клиента
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
    
    // Находим все комнаты, где был этот игрок
    Object.keys(rooms).forEach(roomId => {
      const room = rooms[roomId];
      const player = room.currentPlayers.find(p => p.socketId === socket.id);
      
      if (player) {
        console.log(`Player ${player.username} disconnected from room ${roomId}`);
        
        // Если это был хост, назначаем нового хостом первого активного игрока
        if (room.hostId === socket.id) {
          const activePlayers = room.currentPlayers.filter(p => p.socketId !== socket.id && !p.offline);
          if (activePlayers.length > 0) {
            room.hostId = activePlayers[0].socketId;
            console.log(`👑 [SERVER] Host disconnected, new host assigned: ${activePlayers[0].username}`);
          } else {
            room.hostId = null;
            console.log(`👑 [SERVER] Host disconnected, no active players left`);
          }
        }
        
        player.offline = true;
        player.socketId = null;
        
        // ПОЛНАЯ ОЧИСТКА ГОСТЕВЫХ И ТЕСТОВЫХ ИГРОКОВ ПРИ ОТКЛЮЧЕНИИ
        cleanupGuestPlayers(room);
        
        // Сохраняем изменения
        persistRooms();
        
        // Обновляем список комнат для всех
        const roomsList = getSortedRoomsList();
        io.emit('roomsList', roomsList);
        
        // Уведомляем остальных игроков в комнате
        if (room.currentPlayers.length > 0) {
          io.to(roomId).emit('playersUpdate', room.currentPlayers);
          // Также отправляем обновленные данные комнаты
          io.to(roomId).emit('roomData', { 
            roomId: room.roomId, 
            maxPlayers: room.maxPlayers, 
            status: room.status, 
            hostId: room.hostId, 
            timer: room.timer, 
            currentTurn: room.currentTurn 
          });
          
          // Исправляем hostId после отключения игрока
          fixHostIdInRooms();
        }
      }
    });
  });
});

// Функция для запуска таймеров комнаты
function startRoomTimers(roomId) {
  // Запускаем таймер очистки неактивных комнат
  const cleanupTimer = setTimeout(() => {
    const room = rooms[roomId];
    if (room && room.currentPlayers.length === 0) {
      console.log(`🗑️ [SERVER] Cleaning up empty room: ${roomId}`);
      delete rooms[roomId];
      persistRooms();
      const roomsList = getSortedRoomsList();
      io.emit('roomsList', roomsList);
    }
  }, 30 * 60 * 1000); // 30 минут

  // Сохраняем таймер
  roomTimers.set(roomId, { cleanupTimer });
}

// Функция запуска таймера определения очередности
function startOrderDeterminationTimer(roomId) {
  const room = rooms[roomId];
  if (!room || !room.orderDetermination) return;
  
  console.log('⏰ [SERVER] Starting order determination timer for room:', roomId);
  
  // Запускаем таймер (3 минуты на бросок кубиков)
  room.orderDetermination.timerInterval = setInterval(() => {
    const r = rooms[roomId];
    if (!r || !r.orderDetermination) return;
    
    r.orderDetermination.timer -= 1;
    
    if (r.orderDetermination.timer <= 0) {
      clearInterval(r.orderDetermination.timerInterval);
      
      console.log('⏰ [SERVER] Order determination timer expired for room:', roomId);
      
      // Автоматически бросаем кубики для игроков, которые не бросили
      r.orderDetermination.players.forEach(p => {
        if (p.diceRoll === null) {
          p.diceRoll = Math.floor(Math.random() * 6) + 1;
          console.log('🎲 [SERVER] Auto roll for', p.username, ':', p.diceRoll);
        }
      });
      
      // Определяем финальный порядок
      determineFinalOrder(roomId);
    } else {
      // Отправляем обновление таймера
      io.to(roomId).emit('orderDeterminationTimerUpdate', {
        remainingTime: r.orderDetermination.timer,
        phase: 'initial_roll'
      });
    }
  }, 1000);
}

// Функция определения финального порядка игроков
function determineFinalOrder(roomId) {
  const room = rooms[roomId];
  if (!room || !room.orderDetermination) return;
  
  console.log('🎯 [SERVER] Determining final order for room:', roomId);
  
  // Сортируем игроков по результату броска (высший первый)
  const sortedPlayers = [...room.orderDetermination.players].sort((a, b) => {
    if (a.diceRoll === b.diceRoll) {
      // При одинаковых результатах сортируем по ID для стабильности
      return a.id.localeCompare(b.id);
    }
    return b.diceRoll - a.diceRoll; // По убыванию
  });
  
  // Проверяем, есть ли ничьи (одинаковые результаты)
  const hasTies = sortedPlayers.some((player, index) => {
    if (index === 0) return false;
    return player.diceRoll === sortedPlayers[index - 1].diceRoll;
  });
  
  if (hasTies) {
    console.log('🎯 [SERVER] Ties detected, starting tie break phase');
    
    // Переходим в фазу переигровки
    room.orderDetermination.phase = 'tie_break';
    room.orderDetermination.tieBreakPlayers = sortedPlayers.filter((player, index) => {
      if (index === 0) return false;
      return player.diceRoll === sortedPlayers[index - 1].diceRoll;
    });
    
    // Добавляем первого игрока с таким же результатом
    const firstTieValue = sortedPlayers[0].diceRoll;
    const firstTiePlayer = sortedPlayers.find(p => p.diceRoll === firstTieValue);
    if (firstTiePlayer && !room.orderDetermination.tieBreakPlayers.find(p => p.id === firstTiePlayer.id)) {
      room.orderDetermination.tieBreakPlayers.unshift(firstTiePlayer);
    }
    
    // Сбрасываем результаты переигровки
    room.orderDetermination.tieBreakPlayers.forEach(p => {
      p.tieBreakRoll = null;
    });
    
    // Запускаем таймер переигровки (30 секунд)
    room.orderDetermination.tieBreakTimer = 30;
    room.orderDetermination.tieBreakTimerInterval = setInterval(() => {
      const r = rooms[roomId];
      if (!r || !r.orderDetermination) return;
      
      r.orderDetermination.tieBreakTimer -= 1;
      
      if (r.orderDetermination.tieBreakTimer <= 0) {
        clearInterval(r.orderDetermination.tieBreakTimerInterval);
        
        // Автоматически бросаем кубики для игроков, которые не бросили
        r.orderDetermination.tieBreakPlayers.forEach(p => {
          if (p.tieBreakRoll === null) {
            p.tieBreakRoll = Math.floor(Math.random() * 6) + 1;
            console.log('🎲 [SERVER] Auto tie break roll for', p.username, ':', p.tieBreakRoll);
          }
        });
        
        // Определяем финальный порядок с переигровкой
        determineFinalOrderWithTieBreak(roomId);
      } else {
        // Отправляем обновление таймера
        io.to(roomId).emit('orderDeterminationTimerUpdate', {
          remainingTime: r.orderDetermination.tieBreakTimer,
          phase: 'tie_break'
        });
      }
    }, 1000);
    
    // Уведомляем клиентов о начале переигровки
    io.to(roomId).emit('orderDeterminationPhaseChanged', {
      phase: 'tie_break',
      tieBreakPlayers: room.orderDetermination.tieBreakPlayers
    });
    
  } else {
    console.log('🎯 [SERVER] No ties, finalizing order');
    
    // Ничьих нет, финализируем порядок
    finalizeOrder(roomId, sortedPlayers);
  }
}

// Функция определения финального порядка с переигровкой
function determineFinalOrderWithTieBreak(roomId) {
  const room = rooms[roomId];
  if (!room || !room.orderDetermination) return;
  
  console.log('🎯 [SERVER] Determining final order with tie break for room:', roomId);
  
  // Сортируем игроков по результату переигровки
  const tieBreakPlayers = room.orderDetermination.tieBreakPlayers || [];
  const sortedTieBreakPlayers = [...tieBreakPlayers].sort((a, b) => {
    if (a.tieBreakRoll === b.tieBreakRoll) {
      // При одинаковых результатах переигровки сортируем по основному броску
      if (a.diceRoll === b.diceRoll) {
        return a.id.localeCompare(b.id); // По ID для стабильности
      }
      return b.diceRoll - a.diceRoll;
    }
    return b.tieBreakRoll - a.tieBreakRoll; // По убыванию
  });
  
  // Обновляем позиции игроков с переигровкой
  sortedTieBreakPlayers.forEach((player, index) => {
    const orderPlayer = room.orderDetermination.players.find(p => p.id === player.id);
    if (orderPlayer) {
      orderPlayer.finalPosition = index;
    }
  });
  
  // Определяем позиции остальных игроков
  const nonTiePlayers = room.orderDetermination.players.filter(p => 
    !tieBreakPlayers.find(tp => tp.id === p.id)
  );
  
  // Сортируем по основному броску
  const sortedNonTiePlayers = nonTiePlayers.sort((a, b) => b.diceRoll - a.diceRoll);
  
  // Назначаем позиции (начиная с позиции после игроков с переигровкой)
  sortedNonTiePlayers.forEach((player, index) => {
    player.finalPosition = tieBreakPlayers.length + index;
  });
  
  // Собираем финальный порядок
  const finalOrder = [...room.orderDetermination.players].sort((a, b) => a.finalPosition - b.finalPosition);
  
  // Финазируем порядок
  finalizeOrder(roomId, finalOrder);
}

// Функция финализации порядка и начала игры
function finalizeOrder(roomId, finalOrder) {
  const room = rooms[roomId];
  if (!room || !room.orderDetermination) return;
  
  console.log('🎯 [SERVER] Finalizing order for room:', roomId);
  
  // Обновляем порядок игроков в комнате
  let newPlayerOrder = [];
  finalOrder.forEach((orderPlayer, index) => {
    // Сопоставляем игрока по нескольким ключам (id/ socketId/ username),
    // так как на разных этапах могли использоваться разные идентификаторы
    const actualPlayer = room.currentPlayers.find(p => 
      p.id === orderPlayer.id ||
      p.socketId === orderPlayer.id ||
      p.username === orderPlayer.username
    );
    if (actualPlayer) {
      actualPlayer.gameOrder = index;
      actualPlayer.position = 0; // Начинаем с позиции 0
      newPlayerOrder.push(actualPlayer);
    } else {
      console.warn('⚠️ [SERVER] finalizeOrder: player from finalOrder not found in currentPlayers', orderPlayer);
    }
  });

  // Если по каким-то причинам массив пуст (несовпадение ID), не падаем — используем текущий порядок
  if (!newPlayerOrder.length) {
    console.warn('⚠️ [SERVER] finalizeOrder: newPlayerOrder is empty, falling back to room.currentPlayers');
    newPlayerOrder = [...room.currentPlayers];
    // Проставим порядковые номера на всякий случай
    newPlayerOrder.forEach((p, idx) => { p.gameOrder = idx; if (p.position == null) p.position = 0; });
  }
  
  // Обновляем порядок игроков в комнате
  room.currentPlayers = newPlayerOrder;
  
  // Устанавливаем первого игрока как текущий ход (используем socketId для совместимости с событиями)
  room.currentTurn = newPlayerOrder[0] ? (newPlayerOrder[0].socketId || newPlayerOrder[0].id) : null;
  
  // Меняем статус комнаты на "игра началась"
  room.status = 'started';
  
  // Очищаем состояние определения очередности
  delete room.orderDetermination;
  
  // Уведомляем клиентов о завершении определения очередности
  io.to(roomId).emit('orderDeterminationCompleted', {
    roomId,
    finalOrder: newPlayerOrder.map(p => ({
      id: p.id || p.socketId,
      username: p.username,
      position: p.gameOrder,
      diceRoll: p.diceRoll || null
    })),
    currentTurn: room.currentTurn
  });
  
  // Отправляем обновленные данные комнаты (без поля timer, чтобы не сбрасывать клиентские таймеры)
  io.to(roomId).emit('roomData', {
    roomId: room.roomId,
    maxPlayers: room.maxPlayers,
    status: room.status,
    hostId: room.hostId,
    currentTurn: room.currentTurn
  });

  // Сигнализируем о старте игры для совместимости с клиентом
  io.to(roomId).emit('gameStarted', {
    roomId: room.roomId,
    currentTurn: room.currentTurn,
    players: room.currentPlayers.map(p => ({ id: p.id, username: p.username }))
  });
  
  // Отправляем обновленный список игроков
  io.to(roomId).emit('playersUpdate', room.currentPlayers);
  
  // Запускаем игровой таймер
  startGameTimer(roomId);
  
  console.log('🎯 [SERVER] Order determination completed for room:', roomId);
  console.log('🎯 [SERVER] Final order:', newPlayerOrder.map(p => `${p.username} (${p.gameOrder})`));
  console.log('🎯 [SERVER] Current turn:', room.currentTurn);
  
  // Сохраняем состояние
  persistRooms();
}

// Функция запуска игрового таймера
function startGameTimer(roomId) {
  const room = rooms[roomId];
  if (!room) return;
  
  // Запускаем таймер хода (2 минуты на ход)
  room.turnTimer = 120;
  room.turnTimerInterval = setInterval(() => {
    const r = rooms[roomId];
    if (!r) return;
    
    r.turnTimer -= 1;
    
    if (r.turnTimer <= 0) {
      // Время хода истекло, переходим к следующему игроку
      nextTurn(roomId);
    } else {
      // Отправляем обновление таймера
      io.to(roomId).emit('turnTimerUpdate', {
        remaining: r.turnTimer,
        currentTurn: r.currentTurn
      });
    }
  }, 1000);
}

// Функция перехода к следующему ходу
function nextTurn(roomId) {
  const room = rooms[roomId];
  if (!room || !room.currentPlayers.length) return;
  
  // Находим текущего игрока
  const currentPlayerIndex = room.currentPlayers.findIndex(p => p.socketId === room.currentTurn);
  if (currentPlayerIndex === -1) return;
  
  // Переходим к следующему игроку
  const nextPlayerIndex = (currentPlayerIndex + 1) % room.currentPlayers.length;
  const nextPlayer = room.currentPlayers[nextPlayerIndex];
  
  // Обновляем текущий ход
  room.currentTurn = nextPlayer.socketId;
  room.turnTimer = 120; // Сбрасываем таймер
  
  // Уведомляем клиентов о смене хода
  io.to(roomId).emit('turnChanged', {
    playerId: room.currentTurn,
    previousPlayerId: room.currentPlayers[currentPlayerIndex].socketId
  });
  
  console.log('🔄 [SERVER] Turn changed to:', nextPlayer.username);
  
  // Сохраняем состояние
  persistRooms();
}

// Serve static files from client build
app.use(express.static(path.join(__dirname, '../client/build')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Запускаем сервер
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌐 Client URL: http://localhost:3000`);
  console.log(`🔌 Socket.IO server ready`);
  console.log(`🗄️ Database initialized and ready`);
  
  // Запускаем периодическую очистку старых комнат каждый час
  setInterval(() => {
    console.log('⏰ [SERVER] Running scheduled cleanup of old rooms...');
    cleanupOldRooms();
  }, 60 * 60 * 1000); // Каждый час (60 минут * 60 секунд * 1000 миллисекунд)
  
  console.log('⏰ [SERVER] Scheduled cleanup of old rooms every hour');
});

// Обработка завершения работы сервера
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  db.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  db.close();
  process.exit(0);
});