const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const Database = require('./database');
const TelegramBot = require('./telegram-bot');

// Определяем порт
const PORT = process.env.PORT || 8080;

// Создаем Express приложение
const app = express();
const server = http.createServer(app);

// Настройка CORS
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../build')));

// Создаем Socket.IO сервер
const io = socketIo(server, {
  cors: {
    origin: (origin, callback) => {
      callback(null, true);
    },
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Инициализируем базу данных
const db = new Database();

// Инициализируем Telegram бота
let telegramBot = null;
const BOT_TOKEN = process.env.BOT_TOKEN;
const GAME_URL = process.env.GAME_URL || `https://${process.env.RAILWAY_PUBLIC_DOMAIN || process.env.RAILWAY_STATIC_URL || 'localhost:8080'}`;

// Глобальное хранилище пользователей (в памяти)
const users = new Map();
const usernameToUserId = new Map();
const rooms = new Map();

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

// Функция для обновления socketId пользователя
const updateUserSocketId = (userId, socketId) => {
  console.log(`🔄 [SERVER] updateUserSocketId called: userId=${userId}, socketId=${socketId}`);
  const user = users.get(userId);
  if (user) {
    user.socketId = socketId;
    user.lastSeen = Date.now();
  }
};

// Создаем дефолтную комнату
const createDefaultRoom = () => {
  const roomId = 'lobby';
  rooms.set(roomId, {
    roomId: roomId,
    displayName: 'Лобби',
    maxPlayers: 1,
    gameDuration: 180,
    currentPlayers: [],
    status: 'waiting',
    password: '',
    hostId: null,
    createdAt: Date.now()
  });
  console.log(`🏠 [SERVER] Default room created: ${roomId}`);
};

// Создаем дефолтную комнату при запуске
createDefaultRoom();

// API маршруты
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    bot: telegramBot ? 'active' : 'inactive',
    game_url: GAME_URL,
    version: '1.0.0'
  });
});

app.get('/api/telegram/info', (req, res) => {
  res.json({
    bot: 'https://t.me/anreal_money_bot',
    game: GAME_URL,
    status: telegramBot ? 'active' : 'inactive',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/telegram/images', (req, res) => {
  if (telegramBot) {
    res.json(telegramBot.getImageApiResponse());
  } else {
    res.status(503).json({ error: 'Telegram bot not available' });
  }
});

// API для авторизации через Telegram
app.post('/api/telegram/auth', async (req, res) => {
  try {
    const { telegram_id, first_name, last_name, username, language_code, is_premium } = req.body;
    
    if (!telegram_id) {
      return res.status(400).json({ success: false, error: 'Telegram ID обязателен' });
    }

    // Получаем или создаем пользователя
    let telegramUser = await db.getTelegramUser(telegram_id);
    
    if (!telegramUser) {
      // Создаем нового пользователя
      const newUser = {
        telegram_id: telegram_id,
        balance: 10, // 10$ за регистрацию
        referrals: 0,
        ref_code: `ref_${telegram_id}`,
        created_at: new Date().toISOString()
      };
      
      await db.createTelegramUser(newUser);
      telegramUser = newUser;
    }

    res.json({ 
      success: true, 
      user: telegramUser,
      message: 'Авторизация через Telegram успешна'
    });
    
  } catch (error) {
    console.error('Telegram auth error:', error);
    res.status(500).json({ success: false, error: 'Внутренняя ошибка сервера' });
  }
});

// Главная страница - отдаем React приложение
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

// Socket.IO обработчики
io.on('connection', (socket) => {
  console.log(`🔌 [SERVER] New client connected: ${socket.id}`);
  
  // Отправляем начальный список комнат
  socket.emit('roomsList', []);
  
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

  // Обработчик отключения клиента
  socket.on('disconnect', () => {
    console.log(`🔌 [SERVER] Client disconnected: ${socket.id}`);
  });
});

// Запускаем сервер
server.listen(PORT, async () => {
  console.log(`🚀 Energy of Money Server запущен!`);
  console.log(`🌐 HTTP: http://localhost:${PORT}`);
  console.log(`📡 WebSocket: ws://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🤖 API Telegram бота: http://localhost:${PORT}/api/telegram/info`);
  console.log(`🎮 Game URL: ${GAME_URL}`);
  
  // Запускаем Telegram бота
  if (BOT_TOKEN) {
    try {
      telegramBot = new TelegramBot(BOT_TOKEN, GAME_URL, db);
      const botStarted = await telegramBot.start();
      if (botStarted) {
        console.log('✅ Telegram бот успешно интегрирован с сервером!');
      } else {
        console.log('⚠️ Telegram бот не удалось запустить, но сервер работает');
      }
    } catch (error) {
      console.error('❌ Ошибка запуска Telegram бота:', error);
      console.log('⚠️ Сервер работает без Telegram бота');
    }
  } else {
    console.log('⚠️ BOT_TOKEN не установлен, Telegram бот не запущен');
  }
});

// Обработка завершения работы сервера
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  if (telegramBot) {
    await telegramBot.stop();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server...');
  if (telegramBot) {
    await telegramBot.stop();
  }
  process.exit(0);
});
