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

// API route example
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const newUser = new User({ username, email, password }); // Add hashing in production
  await newUser.save();
  res.status(201).send('User registered');
});

// Update rooms structure to include timer, players with full data, board state
const rooms = {}; // { roomId: { maxPlayers, currentPlayers: [...], status, password, timer, currentTurn, board, createdAt } }

// Timer management for rooms
const roomTimers = new Map(); // { roomId: { gameTimer, cleanupTimer } }

// Helper to create a default room when none exist
function createDefaultRoom() {
  const id = 'lobby';
  rooms[id] = {
    roomId: id,
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

  // Join a room namespace
  socket.on('joinRoom', (roomId) => {
    if (rooms[roomId]) {
      socket.join(roomId);
    }
  });

  socket.on('createRoom', (roomId, maxPlayers, password, timerHours = config.rules.defaultTimer) => {
    if (!rooms[roomId]) {
      console.log(`Creating room ${roomId} by ${socket.id}`);
      rooms[roomId] = {
        roomId,
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
      startRoomTimers(roomId);
      
      persistRooms();
      const roomsList = getSortedRoomsList();
      io.emit('roomsList', roomsList);
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

  // On join, assign profession and initial finances (in a new 'setupPlayer' event or here)
  socket.on('setupPlayer', (roomId, playerData) => {
    console.log('setupPlayer called:', { roomId, socketId: socket.id, playerData });
    console.log('Available rooms:', Object.keys(rooms));
    
    const room = rooms[roomId];
    if (!room) {
      console.log('❌ setupPlayer: Room not found:', roomId);
      console.log('Available rooms:', Object.keys(rooms));
      return;
    }
    
    console.log('✅ setupPlayer: Room found:', { roomId, status: room.status, currentPlayers: room.currentPlayers.length });
    
    // Проверяем, есть ли уже игрок с таким фиксированным ID
    const existingById = room.currentPlayers.find(p => p.fixedId === playerData.id);
    if (existingById) {
      console.log('[setupPlayer] Player with ID already exists:', playerData.id);
      // Если игрок с таким ID уже есть, подключаем к нему
      existingById.socketId = socket.id;
      existingById.offline = false;
      existingById.roomId = roomId; // Обновляем roomId
      socket.join(roomId);
      io.to(roomId).emit('playersUpdate', room.currentPlayers);
      return;
    }
    
    // Разрешаем переподключение по socket.id
    const existingBySocket = room.currentPlayers.find(p => p.socketId === socket.id);
    if (existingBySocket) {
      console.log('[setupPlayer] Reconnecting player by socket:', existingBySocket.username, 'old socketId:', existingBySocket.socketId, 'new socketId:', socket.id);
      existingBySocket.socketId = socket.id;
      existingBySocket.offline = false;
      existingBySocket.roomId = roomId; // Обновляем roomId
      socket.join(roomId);
      io.to(roomId).emit('playersUpdate', room.currentPlayers);
      return;
    }
    
    // Новый игрок только если статус ожидания
    if (room.status !== 'waiting') return;
    
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
      roomId: roomId, // Добавляем roomId для фильтрации на клиенте
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
    io.to(roomId).emit('playersUpdate', room.currentPlayers);
    persistRooms();
    const roomsList = getSortedRoomsList();
    io.emit('roomsList', roomsList);
  });

  // New event: toggle ready
  socket.on('toggleReady', (roomId) => {
    console.log('Toggle ready received for room', roomId, 'from', socket.id);
    
    // Ищем игрока по socketId (для переподключений) или по фиксированному ID
    let player = rooms[roomId].currentPlayers.find(p => p.socketId === socket.id);
    
    if (!player) {
      console.log('Player not found by socketId, trying to find by fixedId...');
      // Если не нашли по socketId, ищем по фиксированному ID
      player = rooms[roomId].currentPlayers.find(p => p.id && p.id !== socket.id);
    }
    
    if (player) {
      console.log('Found player:', player.username, 'ID:', player.id, 'SocketID:', player.socketId);
      
      // Flip ready and manage seat assignment
      const nextReady = !player.ready;
      if (nextReady) {
        // Assign lowest free seat
        const usedSeats = new Set(
          rooms[roomId].currentPlayers.filter(p => p.ready && p.seat !== null).map(p => p.seat)
        );
        let seat = null;
        for (let i = 0; i < rooms[roomId].maxPlayers; i += 1) {
          if (!usedSeats.has(i)) { seat = i; break; }
        }
        if (seat === null) {
          console.log('No free seats');
          io.to(socket.id).emit('noSeat');
          return;
        }
        player.seat = seat;
        player.ready = true;
        console.log('Player marked as ready, assigned seat:', seat);
      } else {
        player.ready = false;
        player.seat = null;
        console.log('Player marked as not ready, seat cleared');
      }
      
      console.log('Player ready status:', player.ready);
      io.to(roomId).emit('playersUpdate', rooms[roomId].currentPlayers);
      persistRooms();
      // Note: game will start only when host presses Start
    } else {
      console.log('❌ Player not found in room:', roomId, 'socketId:', socket.id);
      console.log('Available players:', rooms[roomId].currentPlayers.map(p => ({ id: p.id, socketId: p.socketId, username: p.username })));
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
    const room = rooms[roomId];
    if (room) {
      console.log('getRoom response:', {
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
      console.log('getRoom: room not found', roomId);
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
    if (rooms[roomId]) {
      console.log('[getPlayers] Room:', roomId, 'Socket ID:', socket.id);
      console.log('[getPlayers] Current players:', rooms[roomId].currentPlayers.map(p => ({ id: p.id, username: p.username })));
      
      // Проверяем, есть ли текущий игрок в списке
      const currentPlayer = rooms[roomId].currentPlayers.find(p => p.id === socket.id);
      if (!currentPlayer) {
        console.log('[getPlayers] Player not found by socket.id, checking by username...');
        // Ищем по username (для переподключений)
        const playerByUsername = rooms[roomId].currentPlayers.find(p => p.username && !p.offline);
        if (playerByUsername) {
          console.log('[getPlayers] Found player by username, updating ID from', playerByUsername.id, 'to', socket.id);
          playerByUsername.id = socket.id;
          playerByUsername.offline = false;
        }
      }
      
      socket.emit('playersList', rooms[roomId].currentPlayers);
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

  // Обработчик выхода из комнаты
  socket.on('leaveRoom', (roomId) => {
    console.log('🔄 [Server] Player leaving room:', { roomId, socketId: socket.id });
    
    // Проверяем, что roomId передан
    if (!roomId) {
      console.log('❌ [Server] No roomId provided, sending error');
      socket.emit('leftRoom', { success: false, reason: 'no_room_id', error: 'Room ID is required' });
      return;
    }
    
    const room = rooms[roomId];
    if (!room) {
      console.log('❌ [Server] Room not found:', roomId);
      socket.emit('leftRoom', { roomId, success: true, reason: 'room_not_found' });
      return;
    }
    
    // Удаляем игрока из комнаты
    const playerIndex = room.currentPlayers.findIndex(p => p.id === socket.id);
    if (playerIndex !== -1) {
      const [removedPlayer] = room.currentPlayers.splice(playerIndex, 1);
      console.log('✅ [Server] Player removed from room:', removedPlayer.username);
      
      // Если это был хост, назначаем нового
      if (room.hostId === socket.id) {
        room.hostId = room.currentPlayers[0]?.id || null;
        console.log('👑 [Server] New host assigned:', room.hostId);
      }
      
      // Если игра началась и это был текущий ход, передаем ход следующему
      if (room.status === 'started' && room.currentTurn === socket.id) {
        if (room.currentPlayers.length > 0) {
          const nextPlayerIndex = 0; // Берем первого доступного игрока
          room.currentTurn = room.currentPlayers[nextPlayerIndex].id;
          console.log('🎯 [Server] Turn passed to next player:', room.currentPlayers[nextPlayerIndex].username);
          io.to(roomId).emit('turnChanged', room.currentTurn);
        }
      }
      
      // Покидаем комнату
      socket.leave(roomId);
      
      // Обновляем данные для всех игроков
      io.to(roomId).emit('playersUpdate', room.currentPlayers);
      io.to(roomId).emit('roomData', { 
        roomId: room.roomId, 
        maxPlayers: room.maxPlayers, 
        status: room.status, 
        hostId: room.hostId, 
        timer: room.timer,
        currentTurn: room.currentTurn
      });
      
      // Если игроков меньше 2, останавливаем игру
      if (room.currentPlayers.length < 2 && room.status === 'started') {
        room.status = 'waiting';
        room.currentTurn = null;
        io.to(roomId).emit('gameEnded', 'Недостаточно игроков');
        console.log('🛑 [Server] Game stopped due to insufficient players');
      }
      
      // Обновляем список комнат
      persistRooms();
      const roomsList = getSortedRoomsList();
      io.emit('roomsList', roomsList);
      
      // Уведомляем игрока об успешном выходе
      socket.emit('leftRoom', { roomId, success: true, reason: 'player_removed', playerCount: room.currentPlayers.length });
      console.log('✅ [Server] leftRoom event sent to player');
    } else {
      console.log('⚠️ [Server] Player not found in room, but allowing exit anyway');
      // Игрок не найден в комнате, но разрешаем выход
      socket.leave(roomId);
      socket.emit('leftRoom', { roomId, success: true, reason: 'player_not_found' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    // Remove from any room and free seat
    Object.values(rooms).forEach(room => {
      const player = room.currentPlayers.find(p => p.id === socket.id);
      if (player) {
        player.offline = true; // не удаляем, чтобы сохранить позицию
        if (room.hostId === socket.id) {
          room.hostId = room.currentPlayers.find(p => !p.offline)?.id || null;
        }
        io.to(room.roomId).emit('playersUpdate', room.currentPlayers);
        io.to(room.roomId).emit('roomData', { roomId: room.roomId, maxPlayers: room.maxPlayers, status: room.status, hostId: room.hostId, timer: room.timer });
        const roomsList = getSortedRoomsList();
        io.emit('roomsList', roomsList);
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
  return Object.values(rooms)
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .map(r => ({ 
      id: r.roomId, 
      currentPlayers: r.currentPlayers.length, 
      maxPlayers: r.maxPlayers,
      createdAt: r.createdAt,
      status: r.status
    }));
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

// Serve client files (moved here after all API routes)
app.use(express.static(path.join(__dirname, '../client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

server.listen(5000, () => {
  console.log('Server running on port 5000');
});
