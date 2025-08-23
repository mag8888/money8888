const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const User = require('./models/User');
const fs = require('fs');
const path = require('path');

// Add pg for PostgreSQL
const { Pool } = require('pg');
const pool = new Pool({ /* config */ });

const Rating = require('./models/Rating');

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
          ready: p.ready,
          offline: p.offline
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
mongoose.connect('mongodb://localhost:27017/cashflow')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Load configurations
const configPath = path.join(__dirname, '../shared/seed_v1.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Simple persistence for rooms (to avoid rooms disappearing on restart)
const ROOMS_FILE = path.join(__dirname, '../shared/rooms.json');
function persistRooms() {
  try {
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
    }
  } catch (e) {
    console.error('Load rooms error:', e);
  }
}

// Убираем старый register route, теперь используем /api/auth/register

// Update rooms structure to include timer, players with full data, board state
const rooms = {}; // { roomId: { maxPlayers, currentPlayers: [...], status, password, timer, currentTurn, board, createdAt } }

// Timer management for rooms
const roomTimers = new Map(); // { roomId: { gameTimer, cleanupTimer } }

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
    createdAt: Date.now()
  };
  persistRooms();
}
function ensureDefaultRoom() {
  if (!Object.keys(rooms).length) {
    createDefaultRoom();
  }
}
// Initial default room load or create
loadRooms();
ensureDefaultRoom();

io.on('connection', (socket) => {
  console.log('New client connected', socket.id);
  ensureDefaultRoom();
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
    
    // Создаем объект игрока
    const player = {
      id: socket.id,
      username: playerData?.username || `Гость-${socket.id.slice(-4)}`,
      email: playerData?.email || '',
      displayId: playerData?.displayId || '',
      ready: false,
      offline: false,
      socketId: socket.id,
      joinedAt: Date.now()
    };
    
    // Проверяем, не добавлен ли уже игрок
    const existingPlayerIndex = rooms[roomId].currentPlayers.findIndex(p => p.socketId === socket.id);
    
    if (existingPlayerIndex === -1) {
      // Добавляем нового игрока
      rooms[roomId].currentPlayers.push(player);
      console.log(`👤 [SERVER] Player ${player.username} added to room ${roomId}`);
    } else {
      // Обновляем существующего игрока
      rooms[roomId].currentPlayers[existingPlayerIndex] = { ...player, offline: false };
      console.log(`👤 [SERVER] Player ${player.username} updated in room ${roomId}`);
    }
    
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
    const roomsList = getSortedRoomsList();
    socket.emit('roomsList', roomsList);
    console.log('🏠 [SERVER] Sent rooms list:', roomsList.length, 'rooms');
  });

  // On join, assign profession and initial finances (in a new 'setupPlayer' event or here)
  socket.on('setupPlayer', (roomId, playerData) => {
    console.log('🎮 [SERVER] setupPlayer called:', { roomId, socketId: socket.id, playerData });
    console.log('🎮 [SERVER] Available rooms:', Object.keys(rooms));
    
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
    
    // Создаем игрока с фиксированным ID
    const player = {
      id: playerData.id,
      fixedId: playerData.id,
      socketId: socket.id,
      username: playerData.username,
      color: playerData.color,
      ready: false,
      position: 0,
      balance: playerData.balance || 2000,
      passiveIncome: playerData.passiveIncome || 0,
      seat: null,
      offline: false,
      roomId: roomId,
      // Добавляем базовые характеристики если их нет
      salary: playerData.salary || 2000,
      childCost: playerData.childCost || 500,
      expenses: playerData.expenses || { taxes: 200, other: 0 },
      totalExpenses: playerData.totalExpenses || 200,
      monthlyCashflow: playerData.monthlyCashflow || 0,
      assets: playerData.assets || [],
      liabilities: playerData.liabilities || {},
      children: 0,
      charityTurns: 0,
      _lastRollOptions: null
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
    
    // If already started, just re-emit events so clients can sync state
    if (room.status === 'started') {
      console.log('startGame: game already started, re-emitting events');
      io.to(roomId).emit('gameStarted');
      io.to(roomId).emit('roomData', { roomId: room.roomId, maxPlayers: room.maxPlayers, status: room.status, hostId: room.hostId, timer: room.timer, currentTurn: room.currentTurn });
      io.to(roomId).emit('playersList', room.currentPlayers);
      if (typeof ack === 'function') ack(true);
      return;
    }
    
    if (room.status === 'waiting' && room.currentPlayers.length >= 2) {
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
        
        // Change status to started
        room.status = 'started';
        console.log('startGame: room status changed to started');
        
        // Start with first ready player's id
        const readyPlayer = room.currentPlayers.find(p => p.ready);
        const firstPlayer = room.currentPlayers[0];
        room.currentTurn = readyPlayer?.id || firstPlayer?.id || null;
        
        console.log('startGame: setting currentTurn', { 
          currentTurn: room.currentTurn, 
          readyPlayer: readyPlayer?.id, 
          firstPlayer: firstPlayer?.id,
          allPlayers: room.currentPlayers.map(p => ({ id: p.id, username: p.username, ready: p.ready }))
        });
        
        if (!room.currentTurn) {
          console.warn('No players to start turn');
          if (typeof ack === 'function') ack(false, 'NO_PLAYERS');
          return;
        }
        
        // Emit all necessary events
        console.log('startGame: emitting gameStarted event');
        io.to(roomId).emit('gameStarted');
        
        console.log('startGame: emitting roomData event with status started');
        io.to(roomId).emit('roomData', { 
          roomId: room.roomId, 
          maxPlayers: room.maxPlayers, 
          status: room.status, 
          hostId: room.hostId, 
          timer: room.timer, 
          currentTurn: room.currentTurn 
        });
        
        console.log('startGame: emitting turnChanged event');
        io.to(roomId).emit('turnChanged', room.currentTurn);
        
        // Send full players list so client can initialize board state
        console.log('startGame: emitting playersList event');
        io.to(roomId).emit('playersList', room.currentPlayers);
        
        console.log('startGame: events emitted for', roomId, 'status:', room.status);
        
        // Persist room state
        persistRooms();
        
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
    
    persistRooms();
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
    console.log(`🚪 [SERVER] leaveRoom: ${roomId} by socket: ${socket.id}`);
    
    const room = rooms[roomId];
    if (!room) {
      console.log(`❌ [SERVER] leaveRoom: Room ${roomId} not found`);
      return;
    }
    
    const playerIndex = room.currentPlayers.findIndex(p => p.socketId === socket.id);
    if (playerIndex !== -1) {
      const player = room.currentPlayers[playerIndex];
      console.log(`👤 [SERVER] Player ${player.username} leaving room ${roomId}`);
      
      // Удаляем игрока из комнаты
      room.currentPlayers.splice(playerIndex, 1);
      
      // Сохраняем изменения
      persistRooms();
      
      // Отправляем обновленный список игроков всем в комнате
      io.to(roomId).emit('playersUpdate', room.currentPlayers);
      
      // Обновляем список комнат для всех
      const roomsList = getSortedRoomsList();
      io.emit('roomsList', roomsList);
      
      // Покидаем комнату
      socket.leave(roomId);
    }
  });

  // Обработчик отключения игрока
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    // Находим все комнаты, где был этот игрок
    Object.keys(rooms).forEach(roomId => {
      const room = rooms[roomId];
      if (room && room.currentPlayers) {
        const playerIndex = room.currentPlayers.findIndex(p => p.socketId === socket.id);
        if (playerIndex !== -1) {
          const player = room.currentPlayers[playerIndex];
          console.log(`Player ${player.username} disconnected from room ${roomId}`);
          
          // Помечаем игрока как оффлайн, но не удаляем
          player.offline = true;
          player.socketId = null;
          
          // Если игрок был готов, сбрасываем готовность
          if (player.ready) {
            player.ready = false;
            player.seat = null;
            console.log(`Player ${player.username} marked as not ready due to disconnect`);
          }
          
          // Обновляем список игроков
          io.to(roomId).emit('playersUpdate', room.currentPlayers);
          persistRooms();
        }
      }
    });
  });
});

// Note: removed invalid io.on(...) listeners; all events handled per-socket above

// Add checkFastTrackTransition function
function checkFastTrackTransition(player) {
  if (player.passiveIncome >= player.expenses && !player.isFastTrack) {
    player.isFastTrack = true;
    player.position = 0; // Start of fast track
  }
}

// Function to clean up inactive rooms
function cleanupInactiveRooms() {
  const now = Date.now();
  const inactiveTimeout = 30 * 60 * 1000; // 30 minutes
  const gameEndTimeout = 10 * 60 * 1000; // 10 minutes after game ends
  
  Object.keys(rooms).forEach(roomId => {
    const room = rooms[roomId];
    
    // Skip lobby room
    if (roomId === 'lobby') return;
    
    // Remove rooms that have been inactive for too long
    if (room.lastActivity && (now - room.lastActivity) > inactiveTimeout) {
      console.log(`Removing inactive room: ${roomId} (inactive for ${Math.floor((now - room.lastActivity) / 1000 / 60)} minutes)`);
      delete rooms[roomId];
      return;
    }
    
    // Remove rooms that ended long ago
    if (room.gameEndTime && (now - room.gameEndTime) > gameEndTimeout) {
      console.log(`Removing ended game room: ${roomId} (ended ${Math.floor((now - room.gameEndTime) / 1000 / 60)} minutes ago)`);
      delete rooms[roomId];
      return;
    }
    
    // Remove empty rooms (no players)
    if (room.currentPlayers.length === 0) {
      console.log(`Removing empty room: ${roomId}`);
      delete rooms[roomId];
      return;
    }
    
    // Remove rooms with only offline players
    const hasOnlinePlayers = room.currentPlayers.some(p => !p.offline);
    if (!hasOnlinePlayers && room.currentPlayers.length > 0) {
      console.log(`Removing room with only offline players: ${roomId}`);
      delete rooms[roomId];
      return;
    }
  });
  
  // Persist changes
  persistRooms();
  
  // Emit updated room list to all clients
  const roomsList = getSortedRoomsList();
  io.emit('roomsList', roomsList);
}

// Update room activity timestamp
function updateRoomActivity(roomId) {
  if (rooms[roomId]) {
    rooms[roomId].lastActivity = Date.now();
  }
}

// Mark game as ended
function markGameEnded(roomId) {
  if (rooms[roomId]) {
    rooms[roomId].gameEndTime = Date.now();
    rooms[roomId].status = 'ended';
    console.log(`Game ended in room: ${roomId}`);
  }
}

// Start timers for a room
function startRoomTimers(roomId) {
  if (roomTimers.has(roomId)) {
    clearRoomTimers(roomId);
  }
  
  const room = rooms[roomId];
  if (!room) return;
  
  const gameTimer = setTimeout(() => {
    // Stop game after 3 hours
    if (rooms[roomId]) {
      rooms[roomId].status = 'timeout';
      rooms[roomId].gameEndTime = Date.now();
      console.log(`Game stopped due to timeout in room: ${roomId}`);
      
      // Notify all players
      io.to(roomId).emit('gameTimeout', { 
        message: 'Игра остановлена по истечении времени (3 часа)',
        roomId 
      });
      
      // Start cleanup timer
      const cleanupTimer = setTimeout(() => {
        // Delete room after 3.5 hours total
        if (rooms[roomId]) {
          console.log(`Deleting room due to timeout: ${roomId}`);
          delete rooms[roomId];
          clearRoomTimers(roomId);
          persistRooms();
          
          // Update rooms list
          const roomsList = getSortedRoomsList();
          io.emit('roomsList', roomsList);
        }
      }, 30 * 60 * 1000); // 30 minutes after game stops
      
      roomTimers.set(roomId, { gameTimer: null, cleanupTimer });
    }
  }, 3 * 60 * 60 * 1000); // 3 hours
  
  roomTimers.set(roomId, { gameTimer, cleanupTimer: null });
}

// Clear timers for a room
function clearRoomTimers(roomId) {
  const timers = roomTimers.get(roomId);
  if (timers) {
    if (timers.gameTimer) clearTimeout(timers.gameTimer);
    if (timers.cleanupTimer) clearTimeout(timers.cleanupTimer);
    roomTimers.delete(roomId);
  }
}

// Get sorted rooms list (newest first)
function getSortedRoomsList() {
  const roomsList = Object.values(rooms)
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .map(r => ({ 
      roomId: r.roomId,  // Уникальный ID (room1, room2, lobby...)
      displayName: r.displayName || r.roomName || `Комната ${r.roomId}`, // Отображаемое название с fallback
      originalRequestedId: r.originalRequestedId || r.roomId, // Запрошенный пользователем ID с fallback
      currentPlayers: r.currentPlayers.length, 
      maxPlayers: r.maxPlayers,
      createdAt: r.createdAt,
      status: r.status
    }));
  
  console.log('🏠 [SERVER] getSortedRoomsList result:', roomsList.map(r => ({
    roomId: r.roomId,
    displayName: r.displayName,
    originalRequestedId: r.originalRequestedId,
    players: r.currentPlayers
  })));
  
  return roomsList;
}

// API для получения рейтингов
app.get('/api/ratings/overall', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const ratings = await Rating.getTopPlayers(limit, 'overall');
    res.json(ratings);
  } catch (error) {
    console.error('Error fetching overall ratings:', error);
    res.status(500).json({ error: 'Failed to fetch ratings' });
  }
});

// Создание тестовых данных для рейтингов (если их нет)
app.post('/api/ratings/init-test-data', async (req, res) => {
  try {
    // Проверяем, есть ли уже данные
    const existingRatings = await Rating.countDocuments();
    
    if (existingRatings === 0) {
      // Создаем тестовые рейтинги
      const testRatings = [
        {
          playerId: 'romeoproo1',
          username: 'RomeoProo1',
          email: 'romeoproo1@gmail.com',
          overallScore: 2500,
          gamesPlayed: 15,
          gamesWon: 12,
          averageScore: 1800,
          netWorth: 50000,
          categories: {
            wealth: { score: 2800, rank: 1 },
            speed: { score: 2200, rank: 3 },
            strategy: { score: 2400, rank: 2 },
            consistency: { score: 2600, rank: 1 }
          }
        },
        {
          playerId: 'xqrmedia',
          username: 'XQRMedia',
          email: 'xqrmedia@gmail.com',
          overallScore: 2300,
          gamesPlayed: 12,
          gamesWon: 9,
          averageScore: 1600,
          netWorth: 45000,
          categories: {
            wealth: { score: 2500, rank: 2 },
            speed: { score: 2400, rank: 1 },
            strategy: { score: 2200, rank: 3 },
            consistency: { score: 2300, rank: 2 }
          }
        },
        {
          playerId: 'testplayer1',
          username: 'TestPlayer1',
          email: 'test1@example.com',
          overallScore: 2000,
          gamesPlayed: 8,
          gamesWon: 5,
          averageScore: 1400,
          netWorth: 30000,
          categories: {
            wealth: { score: 2200, rank: 3 },
            speed: { score: 2000, rank: 2 },
            strategy: { score: 2000, rank: 4 },
            consistency: { score: 2000, rank: 3 }
          }
        }
      ];

      for (const ratingData of testRatings) {
        const rating = new Rating(ratingData);
        await rating.save();
      }

      console.log('✅ Тестовые рейтинги созданы');
      res.json({ success: true, message: 'Test ratings created', count: testRatings.length });
    } else {
      res.json({ success: true, message: 'Ratings already exist', count: existingRatings });
    }
  } catch (error) {
    console.error('Error creating test ratings:', error);
    res.status(500).json({ error: 'Failed to create test ratings' });
  }
});

app.get('/api/ratings/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    
    if (!['wealth', 'speed', 'strategy', 'consistency'].includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }
    
    const ratings = await Rating.getTopPlayers(limit, category);
    res.json(ratings);
  } catch (error) {
    console.error('Error fetching category ratings:', error);
    res.status(500).json({ error: 'Failed to fetch ratings' });
  }
});

app.get('/api/ratings/room/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    
    const ratings = await Rating.getRoomRankings(roomId, limit);
    res.json(ratings);
  } catch (error) {
    console.error('Error fetching room ratings:', error);
    res.status(500).json({ error: 'Failed to fetch ratings' });
  }
});

app.get('/api/ratings/player/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;
    
    const rating = await Rating.findOne({ playerId });
    if (!rating) {
      return res.status(404).json({ error: 'Player rating not found' });
    }
    
    res.json(rating);
  } catch (error) {
    console.error('Error fetching player rating:', error);
    res.status(500).json({ error: 'Failed to fetch player rating' });
  }
});

// API для обновления рейтингов
app.post('/api/ratings/update', async (req, res) => {
  try {
    const { playerId, username, roomId, gameData } = req.body;
    
    if (!playerId || !username || !roomId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    let rating = await Rating.findOne({ playerId });
    
    if (!rating) {
      rating = new Rating({
        playerId,
        username,
        roomId
      });
    }
    
    // Обновляем рейтинг
    rating.addGameResult(gameData);
    await rating.save();
    
    // Обновляем ранги всех игроков
    await Rating.updateAllRanks();
    
    res.json({ success: true, rating });
  } catch (error) {
    console.error('Error updating rating:', error);
    res.status(500).json({ error: 'Failed to update rating' });
  }
});

// API для получения статистики
app.get('/api/ratings/stats', async (req, res) => {
  try {
    const totalPlayers = await Rating.countDocuments();
    const totalGames = await Rating.aggregate([
      { $group: { _id: null, total: { $sum: '$gamesPlayed' } } }
    ]);
    
    const averageScore = await Rating.aggregate([
      { $group: { _id: null, average: { $avg: '$averageScore' } } }
    ]);
    
    const topWealth = await Rating.findOne().sort({ 'categories.wealth.score': -1 });
    const topSpeed = await Rating.findOne().sort({ 'categories.speed.score': -1 });
    const topStrategy = await Rating.findOne().sort({ 'categories.strategy.score': -1 });
    const topConsistency = await Rating.findOne().sort({ 'categories.consistency.score': -1 });
    
    res.json({
      totalPlayers,
      totalGames: totalGames[0]?.total || 0,
      averageScore: Math.round(averageScore[0]?.average || 0),
      topWealth: topWealth?.username || 'N/A',
      topSpeed: topSpeed?.username || 'N/A',
      topStrategy: topStrategy?.username || 'N/A',
      topConsistency: topConsistency?.username || 'N/A'
    });
  } catch (error) {
    console.error('Error fetching rating stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    server: 'CASHFLOW Game Server',
    version: '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    platform: process.platform,
    nodeVersion: process.version
  });
});

// Serve client files (moved here after all API routes)
app.use(express.static(path.join(__dirname, '../client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

server.listen(5000, () => {
  console.log('Server running on port 5000');
});
