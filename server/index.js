const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const User = require('./models/User');
const fs = require('fs');
const path = require('path');

// Определяем порт
const PORT = process.env.PORT || 5000;

// Add pg for PostgreSQL
const { Pool } = require('pg');
const pool = new Pool({ /* config */ });

const Rating = require('./models/Rating');

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

// Подключаем auth routes
const authRoutes = require('./routes/auth');

// Функция генерации уникального порядкового ID для комнат
let lastRoomId = 0;
const generateSequentialRoomId = () => {
  lastRoomId++;
  return `room${lastRoomId}`;
};

const app = express();
const server = http.createServer(app);
// Allow JSON bodies and CORS for local dev
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
  pingInterval: 25000
});

// Подключаем auth routes
app.use('/api/auth', authRoutes);

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



// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/potok-deneg')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Load configurations
const configPath = path.join(__dirname, '../shared/seed_v1.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Simple persistence for rooms (to avoid rooms disappearing on restart)
const ROOMS_FILE = path.join(__dirname, '../shared/rooms.json');
function persistRooms() {
  try {
    // ПОЛНАЯ ОЧИСТКА ГОСТЕВЫХ И ТЕСТОВЫХ ИГРОКОВ ПЕРЕД СОХРАНЕНИЕМ
    Object.values(rooms).forEach(room => {
      if (room && room.currentPlayers) {
        cleanupGuestPlayers(room);
      }
    });
    
    fs.writeFileSync(ROOMS_FILE, JSON.stringify(rooms, null, 2));
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
  return Object.keys(rooms).map(roomId => ({
    id: roomId,
    roomId,
    displayName: rooms[roomId].displayName,
    originalRequestedId: rooms[roomId].originalRequestedId,
    maxPlayers: rooms[roomId].maxPlayers,
    currentPlayers: rooms[roomId].currentPlayers,
    status: rooms[roomId].status,

  })).sort((a, b) => {
    // Сначала комнаты с игроками, затем пустые
    if (a.currentPlayers.length > 0 && b.currentPlayers.length === 0) return -1;
    if (a.currentPlayers.length === 0 && b.currentPlayers.length > 0) return 1;
    // Затем по времени создания (новые сначала)
    return rooms[b.roomId].createdAt - rooms[a.roomId].createdAt;
  });
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
  
  // ПОЛНАЯ ОЧИСТКА ГОСТЕВЫХ И ТЕСТОВЫХ ИГРОКОВ ВО ВСЕХ КОМНАТАХ
  Object.values(rooms).forEach(room => {
    if (room && room.currentPlayers) {
      cleanupGuestPlayers(room);
    }
  });
}
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
  ensureDefaultRoom();
  
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
    
    // ПОЛНОСТЬЮ ОТКЛЮЧАЕМ СОЗДАНИЕ ГОСТЕВЫХ ИГРОКОВ
    // Проверяем, есть ли данные игрока для присоединения
    if (!playerData || !playerData.username || playerData.username.trim() === '') {
      console.log(`❌ [SERVER] Player data missing or invalid for socket ${socket.id}`);
      socket.emit('error', { message: 'Необходимо указать корректное имя игрока для присоединения к комнате' });
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
      console.log(`❌ [SERVER] Guest/test usernames are not allowed: ${playerData.username}`);
      socket.emit('error', { message: 'Гостевые и тестовые имена не разрешены. Укажите реальное имя игрока.' });
      return;
    }
    
    // Определяем фиксированный ID игрока (только из переданных данных)
    const fixedPlayerId = playerData.id || playerData.username;
    
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
        username: playerData.username,
        email: playerData.email || '',
        displayId: playerData.displayId || '',
        ready: false,
        socketId: socket.id,
        joinedAt: Date.now()
      };
      
      rooms[roomId].currentPlayers.push(player);
      console.log(`👤 [SERVER] New player ${player.username} (ID: ${player.id}) added to room ${roomId}`);
    } else {
      // Переподключаем существующего игрока - обновляем только socketId
      const existingPlayer = rooms[roomId].currentPlayers[existingPlayerIndex];
      existingPlayer.socketId = socket.id;
      existingPlayer.offline = false;
      existingPlayer.joinedAt = Date.now();
      
      console.log(`🔄 [SERVER] Player ${existingPlayer.username} (ID: ${existingPlayer.id}) reconnected with new socket: ${socket.id}`);
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

  socket.on('createRoom', (roomId, maxPlayers, password, timerHours = config.rules.defaultTimer, roomName) => {
    // Генерируем уникальный порядковый ID для комнаты
    const sequentialId = generateSequentialRoomId();
    
    // Создаем комнату с автоматически сгенерированным ID
    const actualRoomId = sequentialId;
    
    if (!rooms[actualRoomId]) {
      console.log(`Creating room ${actualRoomId} (requested: ${roomId}) by ${socket.id} with name: ${roomName || 'Unnamed'}`);
      rooms[actualRoomId] = {
        roomId: actualRoomId,
        displayName: roomName || `Комната ${roomId}`,
        originalRequestedId: roomId, // Сохраняем запрошенный ID для отображения
        maxPlayers,
        currentPlayers: [], // Will add players with details on join/setup
        status: 'waiting',
        password,
        hostId: socket.id,
        timer: { hours: timerHours, remaining: timerHours * 3600 },
        currentTurn: null, // Now playerId
        board: config.board,
        createdAt: Date.now() // Add creation timestamp
      };
      
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
      rooms[newId] = {
        roomId: newId,
        displayName: roomName || `Комната ${roomId}`,
        originalRequestedId: roomId,
        maxPlayers,
        currentPlayers: [],
        status: 'waiting',
        password,
        hostId: socket.id,
        timer: { hours: timerHours, remaining: timerHours * 3600 },
        currentTurn: null,
        board: config.board,
        createdAt: Date.now()
      };
      
      startRoomTimers(newId);
      persistRooms();
      const roomsList = getSortedRoomsList();
      io.emit('roomsList', roomsList);
      
      socket.emit('roomCreated', rooms[newId]);
      console.log(`✅ Room ${newId} created with name: ${rooms[newId].displayName}`);
    }
  });



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
    
    // ПОЛНАЯ ОЧИСТКА ГОСТЕВЫХ И ТЕСТОВЫХ ИГРОКОВ ВО ВСЕХ КОМНАТАХ
    Object.values(rooms).forEach(room => {
      cleanupGuestPlayers(room);
    });
    
    const roomsList = getSortedRoomsList();
    socket.emit('roomsList', roomsList);
    console.log('🏠 [SERVER] Sent rooms list:', roomsList.length, 'rooms');
  });

  // On join, assign profession and initial finances (in a new 'setupPlayer' event or here)
  socket.on('setupPlayer', (roomId, playerData) => {
    console.log('🎮 [SERVER] setupPlayer called:', { roomId, socketId: socket.id, playerData });
    console.log('🎮 [SERVER] Available rooms:', Object.keys(rooms));
    
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
      
      socket.join(roomId);
      console.log('✅ [SERVER] Existing player reconnected:', {
        id: existingById.id,
        username: existingById.username,
        socketId: existingById.socketId
      });
      
      io.to(roomId).emit('playersUpdate', room.currentPlayers);
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
      return;
    }
    
    // Новый игрок только если статус ожидания
    if (room.status !== 'waiting') {
      console.log('❌ [SERVER] Room not in waiting status, cannot add new player');
      return;
    }
    
    // Проверяем лимит игроков
    if (room.currentPlayers.length >= room.maxPlayers) {
      console.log(`❌ [SERVER] Room ${roomId} is full (${room.currentPlayers.length}/${room.maxPlayers})`);
      socket.emit('error', { message: 'Комната заполнена' });
      return;
    }
    
    // Создаем игрока без профессии (должен выбрать сам)
    const player = {
      id: playerData.id,
      fixedId: playerData.id,
      socketId: socket.id,
      username: playerData.username,
      color: playerData.color,
      ready: false,
      position: 0,
      // Игрок должен выбрать профессию сам
      profession: null,
      balance: 2000, // Базовый баланс
      passiveIncome: 0,
      salary: 0, // Будет установлено при выборе профессии
      expenses: 0, // Будет установлено при выборе профессии
      childCost: 500,
      totalExpenses: 0,
      monthlyCashflow: 0,
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
    persistRooms();
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
        console.log('✅ [SERVER] Player marked as ready, assigned seat:', seat);
      } else {
        player.ready = false;
        player.seat = null;
        console.log('✅ [SERVER] Player marked as not ready, seat cleared');
      }
      
      console.log('✅ [SERVER] Player ready status updated:', player.ready);
      
      // Очищаем дубли перед отправкой обновления
      cleanupDuplicatePlayers(room);
      
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

  // Start game: start timer
  socket.on('startGame', (roomId, ack) => {
    const room = rooms[roomId];
    if (!room) {
      console.log('startGame: no room', roomId);
      if (typeof ack === 'function') ack(false, 'NO_ROOM');
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
            id: p.id,
            username: p.username,
            diceRoll: null,
            finalPosition: null
          })),
          timer: 60, // 1 минута на бросок кубиков
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
          timer: room.timer, 
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
        const timerInterval = setInterval(() => {
          const r = rooms[roomId];
          if (!r) return clearInterval(timerInterval);
          r.timer.remaining -= 1;
          if (r.timer.remaining <= 0) {
            clearInterval(timerInterval);
            io.to(roomId).emit('gameEnded', 'Timer expired');
          } else {
            io.to(roomId).emit('timerUpdate', r.timer.remaining);
          }
        }, 1000);
        
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
      io.to(roomId).emit('diceRolled', { playerId, dice: d1 + d2, d1, d2, options });
    } else {
      const dice = Math.floor(Math.random() * 6) + 1;
      if (player) player._lastRollOptions = { d1: dice, d2: 0, options: [dice] };
      console.log('rollDice: normal roll', { playerId, dice });
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
      playerId: playerId,
      username: orderPlayer.username,
      diceRoll,
      isAutoRoll: false
    });
    
    // Проверяем, все ли игроки бросили кубики
    const allRolled = room.orderDetermination.players.every(p => p.diceRoll !== null);
    
    if (allRolled) {
      console.log('🎲 [SERVER] All players rolled, determining final order');
      
      // Останавливаем таймер определения очередности
      if (room.orderDetermination.timerInterval) {
        clearInterval(room.orderDetermination.timerInterval);
      }
      
      // Определяем финальный порядок
      determineFinalOrder(roomId);
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
    io.to(roomId).emit('tieBreakRoll', {
      playerId: playerId,
      username: orderPlayer.username,
      tieBreakRoll,
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
        playersCount: room.currentPlayers.length
      });
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
      
      // Проверяем, есть ли текущий игрок в списке
      const currentPlayer = rooms[roomId].currentPlayers.find(p => p.id === socket.id);
      if (!currentPlayer) {
        console.log(`⚠️ [SERVER] getPlayers: Player not found by socket.id, checking by username...`);
        // Ищем по username (для переподключений)
        const playerByUsername = rooms[roomId].currentPlayers.find(p => p.username && !p.offline);
        if (playerByUsername) {
          console.log(`🔄 [SERVER] getPlayers: Found player by username, updating ID from ${playerByUsername.id} to ${socket.id}`);
          playerByUsername.id = socket.id;
          playerByUsername.offline = false;
        }
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
      }
    }
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

// Запускаем сервер
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});