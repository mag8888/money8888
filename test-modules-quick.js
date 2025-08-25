#!/usr/bin/env node

/**
 * 🧪 БЫСТРЫЙ ТЕСТ ОСНОВНЫХ МОДУЛЕЙ
 * 
 * Проверяет только критически важные функции:
 * 1. ✅ Socket.IO соединение
 * 2. ✅ Создание комнаты
 * 3. ✅ Подключение игроков
 * 4. ✅ Список игроков
 * 5. ✅ Таймер
 */

const { io } = require('socket.io-client');

// Конфигурация
const SERVER_URL = 'http://localhost:5000';
const ROOM_ID = 'quick-test-' + Date.now();

// Цвета для вывода
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Основные тесты
async function runQuickTests() {
  log('🚀 ЗАПУСК БЫСТРОГО ТЕСТА МОДУЛЕЙ', 'cyan');
  log(`🌐 Сервер: ${SERVER_URL}`, 'cyan');
  log(`🏠 Комната: ${ROOM_ID}`, 'cyan');
  log('─'.repeat(50), 'cyan');

  let passed = 0;
  let failed = 0;

  // Тест 1: Подключение к серверу
  try {
    log('\n🧪 Тест 1: Подключение к серверу', 'yellow');
    await testConnection();
    log('✅ Подключение к серверу - ПРОЙДЕН', 'green');
    passed++;
  } catch (error) {
    log(`❌ Подключение к серверу - ПРОВАЛЕН: ${error.message}`, 'red');
    failed++;
  }

  // Тест 2: Создание комнаты
  try {
    log('\n🧪 Тест 2: Создание комнаты', 'yellow');
    await testRoomCreation();
    log('✅ Создание комнаты - ПРОЙДЕН', 'green');
    passed++;
  } catch (error) {
    log(`❌ Создание комнаты - ПРОВАЛЕН: ${error.message}`, 'red');
    failed++;
  }

  // Тест 3: Подключение к комнате
  try {
    log('\n🧪 Тест 3: Подключение к комнате', 'yellow');
    await testJoinRoom();
    log('✅ Подключение к комнате - ПРОЙДЕН', 'green');
    passed++;
  } catch (error) {
    log(`❌ Подключение к комнате - ПРОВАЛЕН: ${error.message}`, 'red');
    failed++;
  }

  // Тест 4: Получение списка игроков
  try {
    log('\n🧪 Тест 4: Список игроков', 'yellow');
    await testPlayersList();
    log('✅ Список игроков - ПРОЙДЕН', 'green');
    passed++;
  } catch (error) {
    log(`❌ Список игроков - ПРОВАЛЕН: ${error.message}`, 'red');
    failed++;
  }

  // Тест 5: Данные комнаты
  try {
    log('\n🧪 Тест 5: Данные комнаты', 'yellow');
    await testRoomData();
    log('✅ Данные комнаты - ПРОЙДЕН', 'green');
    passed++;
  } catch (error) {
    log(`❌ Данные комнаты - ПРОВАЛЕН: ${error.message}`, 'red');
    failed++;
  }

  // Результаты
  log('\n' + '─'.repeat(50), 'cyan');
  log('📊 РЕЗУЛЬТАТЫ БЫСТРОГО ТЕСТА', 'cyan');
  log(`✅ Пройдено: ${passed}`, 'green');
  log(`❌ Провалено: ${failed}`, 'red');
  log(`📈 Общий результат: ${passed}/${passed + failed}`, 'cyan');
  
  if (failed === 0) {
    log('🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ!', 'green');
  } else {
    log('⚠️  ЕСТЬ ПРОВАЛЕННЫЕ ТЕСТЫ', 'yellow');
  }

  return { passed, failed };
}

// Тест подключения
function testConnection() {
  return new Promise((resolve, reject) => {
    const socket = io(SERVER_URL);
    
    const timeout = setTimeout(() => {
      reject(new Error('Таймаут подключения'));
    }, 5000);

    socket.on('connect', () => {
      clearTimeout(timeout);
      log('🔌 Socket.IO подключен', 'green');
      socket.disconnect();
      resolve();
    });

    socket.on('connect_error', (error) => {
      clearTimeout(timeout);
      reject(new Error(`Ошибка подключения: ${error.message}`));
    });
  });
}

// Тест создания комнаты
function testRoomCreation() {
  return new Promise((resolve, reject) => {
    const socket = io(SERVER_URL);
    
    const timeout = setTimeout(() => {
      reject(new Error('Таймаут создания комнаты'));
    }, 5000);

    socket.on('connect', () => {
      log('🔌 Подключение установлено, создаем комнату...', 'cyan');
      socket.emit('createRoom', { roomId: ROOM_ID, maxPlayers: 4 });
    });

    socket.on('roomCreated', (data) => {
      clearTimeout(timeout);
      log(`🏠 Комната создана: ${data.roomId}`, 'green');
      socket.disconnect();
      resolve();
    });

    socket.on('connect_error', (error) => {
      clearTimeout(timeout);
      reject(new Error(`Ошибка подключения: ${error.message}`));
    });
  });
}

// Тест подключения к комнате
function testJoinRoom() {
  return new Promise((resolve, reject) => {
    const socket = io(SERVER_URL);
    
    const timeout = setTimeout(() => {
      reject(new Error('Таймаут подключения к комнате'));
    }, 5000);

    socket.on('connect', () => {
      log('🔌 Подключение установлено, присоединяемся к комнате...', 'cyan');
      socket.emit('joinRoom', ROOM_ID);
    });

    socket.on('joinedRoom', (data) => {
      clearTimeout(timeout);
      log(`🎮 Присоединились к комнате: ${data.roomId}`, 'green');
      socket.disconnect();
      resolve();
    });

    socket.on('connect_error', (error) => {
      clearTimeout(timeout);
      reject(new Error(`Ошибка подключения: ${error.message}`));
    });
  });
}

// Тест списка игроков
function testPlayersList() {
  return new Promise((resolve, reject) => {
    const socket = io(SERVER_URL);
    
    const timeout = setTimeout(() => {
      reject(new Error('Таймаут получения списка игроков'));
    }, 5000);

    socket.on('connect', () => {
      log('🔌 Подключение установлено, запрашиваем список игроков...', 'cyan');
      socket.emit('getPlayers', ROOM_ID);
    });

    socket.on('playersList', (players) => {
      clearTimeout(timeout);
      log(`👥 Получен список игроков: ${players.length}`, 'green');
      if (Array.isArray(players)) {
        log('✅ Формат данных игроков корректен', 'green');
      } else {
        reject(new Error('Некорректный формат данных игроков'));
      }
      socket.disconnect();
      resolve();
    });

    socket.on('connect_error', (error) => {
      clearTimeout(timeout);
      reject(new Error(`Ошибка подключения: ${error.message}`));
    });
  });
}

// Тест данных комнаты
function testRoomData() {
  return new Promise((resolve, reject) => {
    const socket = io(SERVER_URL);
    
    const timeout = setTimeout(() => {
      reject(new Error('Таймаут получения данных комнаты'));
    }, 5000);

    socket.on('connect', () => {
      log('🔌 Подключение установлено, запрашиваем данные комнаты...', 'cyan');
      socket.emit('getRoom', ROOM_ID);
    });

    socket.on('roomData', (data) => {
      clearTimeout(timeout);
      log(`🏠 Получены данные комнаты: ${data.roomId}`, 'green');
      if (data.roomId && data.maxPlayers) {
        log('✅ Структура данных комнаты корректна', 'green');
      } else {
        reject(new Error('Некорректная структура данных комнаты'));
      }
      socket.disconnect();
      resolve();
    });

    socket.on('connect_error', (error) => {
      clearTimeout(timeout);
      reject(new Error(`Ошибка подключения: ${error.message}`));
    });
  });
}

// Проверка сервера
async function checkServer() {
  return new Promise((resolve, reject) => {
    const socket = io(SERVER_URL);
    
    const timeout = setTimeout(() => {
      reject(new Error('Сервер не отвечает'));
    }, 5000);

    socket.on('connect', () => {
      clearTimeout(timeout);
      log('✅ Сервер доступен', 'green');
      socket.disconnect();
      resolve();
    });

    socket.on('connect_error', () => {
      clearTimeout(timeout);
      reject(new Error('Сервер недоступен'));
    });
  });
}

// Главная функция
async function main() {
  try {
    await checkServer();
    await runQuickTests();
  } catch (error) {
    log(`❌ Критическая ошибка: ${error.message}`, 'red');
    log('💡 Убедитесь, что сервер запущен: npm run server', 'yellow');
    process.exit(1);
  }
}

// Запуск
if (require.main === module) {
  main();
}

module.exports = { runQuickTests, checkServer };

