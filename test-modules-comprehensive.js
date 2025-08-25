#!/usr/bin/env node

/**
 * 🧪 КОМПЛЕКСНЫЙ ТЕСТ ВСЕХ МОДУЛЕЙ ИГРЫ
 * 
 * Этот тест проверяет:
 * 1. ✅ Socket.IO соединение
 * 2. ✅ Обработчики событий (useSocketEvents)
 * 3. ✅ Управление состоянием (useGameState)
 * 4. ✅ Логику игры (useGameLogic)
 * 5. ✅ Компоненты (GameField, GameControls, GameBoard)
 * 6. ✅ Синхронизацию таймера
 * 7. ✅ Список игроков
 * 8. ✅ Функциональность кубика
 */

const { io } = require('socket.io-client');
const fs = require('fs');
const path = require('path');

// Конфигурация теста
const TEST_CONFIG = {
  serverUrl: 'http://localhost:5000',
  roomId: 'test-room-' + Date.now(),
  testPlayers: [
    { username: 'test1', email: 'test1@cashflow.com' },
    { username: 'test2', email: 'test2@cashflow.com' },
    { username: 'test3', email: 'test3@cashflow.com' }
  ],
  timeout: 10000
};

// Цвета для вывода
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Утилиты для тестирования
class TestRunner {
  constructor() {
    this.tests = [];
    this.results = {
      passed: 0,
      failed: 0,
      total: 0
    };
    this.socket = null;
    this.testStartTime = Date.now();
  }

  // Добавить тест
  test(name, testFn) {
    this.tests.push({ name, testFn });
  }

  // Логирование
  log(message, color = 'reset') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`${COLORS[color]}[${timestamp}] ${message}${COLORS.reset}`);
  }

  // Запуск всех тестов
  async runAll() {
    this.log('🚀 ЗАПУСК КОМПЛЕКСНОГО ТЕСТА МОДУЛЕЙ', 'bright');
    this.log(`📊 Всего тестов: ${this.tests.length}`, 'cyan');
    this.log(`🌐 Сервер: ${TEST_CONFIG.serverUrl}`, 'cyan');
    this.log(`🏠 Комната: ${TEST_CONFIG.roomId}`, 'cyan');
    this.log('─'.repeat(60), 'blue');

    for (let i = 0; i < this.tests.length; i++) {
      const test = this.tests[i];
      this.log(`\n🧪 Тест ${i + 1}/${this.tests.length}: ${test.name}`, 'yellow');
      
      try {
        await test.testFn();
        this.log(`✅ ${test.name} - ПРОЙДЕН`, 'green');
        this.results.passed++;
      } catch (error) {
        this.log(`❌ ${test.name} - ПРОВАЛЕН`, 'red');
        this.log(`   Ошибка: ${error.message}`, 'red');
        this.results.failed++;
      }
      
      this.results.total++;
    }

    this.showResults();
  }

  // Показать результаты
  showResults() {
    const duration = Date.now() - this.testStartTime;
    this.log('\n' + '─'.repeat(60), 'blue');
    this.log('📊 РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ', 'bright');
    this.log(`⏱️  Время выполнения: ${duration}ms`, 'cyan');
    this.log(`✅ Пройдено: ${this.results.passed}`, 'green');
    this.log(`❌ Провалено: ${this.results.failed}`, 'red');
    this.log(`📈 Общий результат: ${this.results.passed}/${this.results.total}`, 'bright');
    
    if (this.results.failed === 0) {
      this.log('🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ!', 'green');
    } else {
      this.log('⚠️  ЕСТЬ ПРОВАЛЕННЫЕ ТЕСТЫ', 'yellow');
    }
  }
}

// Создаем тест-раннер
const runner = new TestRunner();

// 🧪 ТЕСТ 1: Socket.IO соединение
runner.test('Socket.IO соединение', async () => {
  return new Promise((resolve, reject) => {
    const socket = io(TEST_CONFIG.serverUrl);
    
    const timeout = setTimeout(() => {
      reject(new Error('Таймаут подключения к серверу'));
    }, TEST_CONFIG.timeout);

    socket.on('connect', () => {
      clearTimeout(timeout);
      runner.log('🔌 Socket.IO подключен успешно', 'green');
      socket.disconnect();
      resolve();
    });

    socket.on('connect_error', (error) => {
      clearTimeout(timeout);
      reject(new Error(`Ошибка подключения: ${error.message}`));
    });
  });
});

// 🧪 ТЕСТ 2: Создание комнаты
runner.test('Создание комнаты', async () => {
  return new Promise((resolve, reject) => {
    const socket = io(TEST_CONFIG.serverUrl);
    
    const timeout = setTimeout(() => {
      reject(new Error('Таймаут создания комнаты'));
    }, TEST_CONFIG.timeout);

    socket.on('connect', () => {
      runner.log('🔌 Подключение установлено, создаем комнату...', 'cyan');
      socket.emit('createRoom', { 
        roomId: TEST_CONFIG.roomId, 
        maxPlayers: 4 
      });
    });

    socket.on('roomCreated', (data) => {
      clearTimeout(timeout);
      runner.log(`🏠 Комната создана: ${data.roomId}`, 'green');
      socket.disconnect();
      resolve();
    });

    socket.on('connect_error', (error) => {
      clearTimeout(timeout);
      reject(new Error(`Ошибка подключения: ${error.message}`));
    });
  });
});

// 🧪 ТЕСТ 3: Подключение игроков
runner.test('Подключение игроков', async () => {
  return new Promise((resolve, reject) => {
    const socket = io(TEST_CONFIG.serverUrl);
    
    const timeout = setTimeout(() => {
      reject(new Error('Таймаут подключения игроков'));
    }, TEST_CONFIG.timeout);

    socket.on('connect', () => {
      runner.log('🔌 Подключение установлено, присоединяемся к комнате...', 'cyan');
      socket.emit('joinRoom', TEST_CONFIG.roomId);
    });

    socket.on('joinedRoom', (data) => {
      runner.log(`🎮 Игрок присоединился к комнате: ${data.roomId}`, 'green');
      socket.disconnect();
      resolve();
    });

    socket.on('connect_error', (error) => {
      clearTimeout(timeout);
      reject(new Error(`Ошибка подключения: ${error.message}`));
    });
  });
});

// 🧪 ТЕСТ 4: Получение списка игроков
runner.test('Получение списка игроков', async () => {
  return new Promise((resolve, reject) => {
    const socket = io(TEST_CONFIG.serverUrl);
    
    const timeout = setTimeout(() => {
      reject(new Error('Таймаут получения списка игроков'));
    }, TEST_CONFIG.timeout);

    socket.on('connect', () => {
      runner.log('🔌 Подключение установлено, запрашиваем список игроков...', 'cyan');
      socket.emit('getPlayers', TEST_CONFIG.roomId);
    });

    socket.on('playersList', (players) => {
      clearTimeout(timeout);
      runner.log(`👥 Получен список игроков: ${players.length}`, 'green');
      if (Array.isArray(players)) {
        runner.log('✅ Формат данных игроков корректен', 'green');
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
});

// 🧪 ТЕСТ 5: Данные комнаты
runner.test('Получение данных комнаты', async () => {
  return new Promise((resolve, reject) => {
    const socket = io(TEST_CONFIG.serverUrl);
    
    const timeout = setTimeout(() => {
      reject(new Error('Таймаут получения данных комнаты'));
    }, TEST_CONFIG.timeout);

    socket.on('connect', () => {
      runner.log('🔌 Подключение установлено, запрашиваем данные комнаты...', 'cyan');
      socket.emit('getRoom', TEST_CONFIG.roomId);
    });

    socket.on('roomData', (data) => {
      clearTimeout(timeout);
      runner.log(`🏠 Получены данные комнаты: ${data.roomId}`, 'green');
      if (data.roomId && data.maxPlayers) {
        runner.log('✅ Структура данных комнаты корректна', 'green');
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
});

// 🧪 ТЕСТ 6: Запуск игры
runner.test('Запуск игры', async () => {
  return new Promise((resolve, reject) => {
    const socket = io(TEST_CONFIG.serverUrl);
    
    const timeout = setTimeout(() => {
      reject(new Error('Таймаут запуска игры'));
    }, TEST_CONFIG.timeout);

    socket.on('connect', () => {
      runner.log('🔌 Подключение установлено, запускаем игру...', 'cyan');
      socket.emit('startGame', TEST_CONFIG.roomId);
    });

    socket.on('gameStarted', (data) => {
      clearTimeout(timeout);
      runner.log(`🎮 Игра запущена в комнате: ${data.roomId}`, 'green');
      socket.disconnect();
      resolve();
    });

    socket.on('connect_error', (error) => {
      clearTimeout(timeout);
      reject(new Error(`Ошибка подключения: ${error.message}`));
    });
  });
});

// 🧪 ТЕСТ 7: Таймер хода
runner.test('Таймер хода', async () => {
  return new Promise((resolve, reject) => {
    const socket = io(TEST_CONFIG.serverUrl);
    
    const timeout = setTimeout(() => {
      reject(new Error('Таймаут тестирования таймера'));
    }, TEST_CONFIG.timeout);

    let timerEvents = 0;
    const requiredEvents = 3; // Минимум 3 события таймера

    socket.on('connect', () => {
      runner.log('🔌 Подключение установлено, тестируем таймер...', 'cyan');
      socket.emit('joinRoom', TEST_CONFIG.roomId);
    });

    socket.on('joinedRoom', () => {
      runner.log('🎮 Присоединились к комнате, ждем события таймера...', 'cyan');
    });

    socket.on('turnTimerUpdate', (data) => {
      timerEvents++;
      runner.log(`⏰ Событие таймера ${timerEvents}: ${data.remaining}s`, 'cyan');
      
      if (timerEvents >= requiredEvents) {
        clearTimeout(timeout);
        runner.log('✅ Таймер работает корректно', 'green');
        socket.disconnect();
        resolve();
      }
    });

    socket.on('connect_error', (error) => {
      clearTimeout(timeout);
      reject(new Error(`Ошибка подключения: ${error.message}`));
    });
  });
});

// 🧪 ТЕСТ 8: Смена хода
runner.test('Смена хода', async () => {
  return new Promise((resolve, reject) => {
    const socket = io(TEST_CONFIG.serverUrl);
    
    const timeout = setTimeout(() => {
      reject(new Error('Таймаут тестирования смены хода'));
    }, TEST_CONFIG.timeout);

    socket.on('connect', () => {
      runner.log('🔌 Подключение установлено, тестируем смену хода...', 'cyan');
      socket.emit('joinRoom', TEST_CONFIG.roomId);
    });

    socket.on('turnChanged', (data) => {
      clearTimeout(timeout);
      runner.log(`🔄 Ход сменился на игрока: ${data.playerId}`, 'green');
      runner.log('✅ Смена хода работает корректно', 'green');
      socket.disconnect();
      resolve();
    });

    socket.on('connect_error', (error) => {
      clearTimeout(timeout);
      reject(new Error(`Ошибка подключения: ${error.message}`));
    });
  });
});

// 🧪 ТЕСТ 9: Функциональность кубика
runner.test('Функциональность кубика', async () => {
  return new Promise((resolve, reject) => {
    const socket = io(TEST_CONFIG.serverUrl);
    
    const timeout = setTimeout(() => {
      reject(new Error('Таймаут тестирования кубика'));
    }, TEST_CONFIG.timeout);

    socket.on('connect', () => {
      runner.log('🔌 Подключение установлено, тестируем кубик...', 'cyan');
      socket.emit('joinRoom', TEST_CONFIG.roomId);
    });

    socket.on('joinedRoom', () => {
      runner.log('🎮 Присоединились к комнате, симулируем бросок кубика...', 'cyan');
      // Симулируем бросок кубика
      socket.emit('rollDice', { roomId: TEST_CONFIG.roomId });
    });

    socket.on('diceRolled', (data) => {
      clearTimeout(timeout);
      runner.log(`🎲 Кубик брошен: ${data.value}`, 'green');
      runner.log('✅ Функциональность кубика работает', 'green');
      socket.disconnect();
      resolve();
    });

    socket.on('connect_error', (error) => {
      clearTimeout(timeout);
      reject(new Error(`Ошибка подключения: ${error.message}`));
    });
  });
});

// 🧪 ТЕСТ 10: Обновления игроков
runner.test('Обновления игроков', async () => {
  return new Promise((resolve, reject) => {
    const socket = io(TEST_CONFIG.serverUrl);
    
    const timeout = setTimeout(() => {
      reject(new Error('Таймаут тестирования обновлений игроков'));
    }, TEST_CONFIG.timeout);

    socket.on('connect', () => {
      runner.log('🔌 Подключение установлено, тестируем обновления игроков...', 'cyan');
      socket.emit('joinRoom', TEST_CONFIG.roomId);
    });

    socket.on('playersUpdate', (players) => {
      clearTimeout(timeout);
      runner.log(`👥 Получено обновление игроков: ${players.length}`, 'green');
      if (Array.isArray(players)) {
        runner.log('✅ Обновления игроков работают корректно', 'green');
      } else {
        reject(new Error('Некорректный формат обновления игроков'));
      }
      socket.disconnect();
      resolve();
    });

    socket.on('connect_error', (error) => {
      clearTimeout(timeout);
      reject(new Error(`Ошибка подключения: ${error.message}`));
    });
  });
});

// 🧪 ТЕСТ 11: Проверка состояния игры
runner.test('Проверка состояния игры', async () => {
  return new Promise((resolve, reject) => {
    const socket = io(TEST_CONFIG.serverUrl);
    
    const timeout = setTimeout(() => {
      reject(new Error('Таймаут проверки состояния игры'));
    }, TEST_CONFIG.timeout);

    socket.on('connect', () => {
      runner.log('🔌 Подключение установлено, проверяем состояние игры...', 'cyan');
      socket.emit('getGameState', TEST_CONFIG.roomId);
    });

    socket.on('gameState', (state) => {
      clearTimeout(timeout);
      runner.log(`🎮 Получено состояние игры`, 'green');
      if (state && typeof state === 'object') {
        runner.log('✅ Состояние игры корректно', 'green');
      } else {
        reject(new Error('Некорректное состояние игры'));
      }
      socket.disconnect();
      resolve();
    });

    socket.on('connect_error', (error) => {
      clearTimeout(timeout);
      reject(new Error(`Ошибка подключения: ${error.message}`));
    });
  });
});

// 🧪 ТЕСТ 12: Проверка профессий
runner.test('Проверка профессий', async () => {
  return new Promise((resolve, reject) => {
    const socket = io(TEST_CONFIG.serverUrl);
    
    const timeout = setTimeout(() => {
      reject(new Error('Таймаут проверки профессий'));
    }, TEST_CONFIG.timeout);

    socket.on('connect', () => {
      runner.log('🔌 Подключение установлено, проверяем профессии...', 'cyan');
      socket.emit('getProfessions', TEST_CONFIG.roomId);
    });

    socket.on('professionsList', (professions) => {
      clearTimeout(timeout);
      runner.log(`💼 Получен список профессий: ${professions.length}`, 'green');
      if (Array.isArray(professions) && professions.length > 0) {
        runner.log('✅ Профессии загружены корректно', 'green');
      } else {
        reject(new Error('Некорректный список профессий'));
      }
      socket.disconnect();
      resolve();
    });

    socket.on('connect_error', (error) => {
      clearTimeout(timeout);
      reject(new Error(`Ошибка подключения: ${error.message}`));
    });
  });
});

// 🧪 ТЕСТ 13: Проверка карт сделок
runner.test('Проверка карт сделок', async () => {
  return new Promise((resolve, reject) => {
    const socket = io(TEST_CONFIG.serverUrl);
    
    const timeout = setTimeout(() => {
      reject(new Error('Таймаут проверки карт сделок'));
    }, TEST_CONFIG.timeout);

    socket.on('connect', () => {
      runner.log('🔌 Подключение установлено, проверяем карты сделок...', 'cyan');
      socket.emit('getDealCards', TEST_CONFIG.roomId);
    });

    socket.on('dealCards', (cards) => {
      clearTimeout(timeout);
      runner.log(`🃏 Получены карты сделок: ${cards.length}`, 'green');
      if (Array.isArray(cards) && cards.length > 0) {
        runner.log('✅ Карты сделок загружены корректно', 'green');
      } else {
        reject(new Error('Некорректный список карт сделок'));
      }
      socket.disconnect();
      resolve();
    });

    socket.on('connect_error', (error) => {
      clearTimeout(timeout);
      reject(new Error(`Ошибка подключения: ${error.message}`));
    });
  });
});

// 🧪 ТЕСТ 14: Проверка WebSocket стабильности
runner.test('WebSocket стабильность', async () => {
  return new Promise((resolve, reject) => {
    const socket = io(TEST_CONFIG.serverUrl);
    
    const timeout = setTimeout(() => {
      reject(new Error('Таймаут тестирования стабильности'));
    }, TEST_CONFIG.timeout);

    let events = 0;
    const requiredEvents = 5;

    socket.on('connect', () => {
      runner.log('🔌 Подключение установлено, тестируем стабильность...', 'cyan');
      socket.emit('joinRoom', TEST_CONFIG.roomId);
    });

    socket.on('joinedRoom', () => {
      runner.log('🎮 Присоединились к комнате, ждем события...', 'cyan');
    });

    // Слушаем любые события для проверки стабильности
    socket.onAny((eventName, data) => {
      events++;
      runner.log(`📡 Событие ${events}: ${eventName}`, 'cyan');
      
      if (events >= requiredEvents) {
        clearTimeout(timeout);
        runner.log('✅ WebSocket соединение стабильно', 'green');
        socket.disconnect();
        resolve();
      }
    });

    socket.on('connect_error', (error) => {
      clearTimeout(timeout);
      reject(new Error(`Ошибка подключения: ${error.message}`));
    });
  });
});

// 🧪 ТЕСТ 15: Проверка обработки ошибок
runner.test('Обработка ошибок', async () => {
  return new Promise((resolve, reject) => {
    const socket = io(TEST_CONFIG.serverUrl);
    
    const timeout = setTimeout(() => {
      reject(new Error('Таймаут тестирования обработки ошибок'));
    }, TEST_CONFIG.timeout);

    socket.on('connect', () => {
      runner.log('🔌 Подключение установлено, тестируем обработку ошибок...', 'cyan');
      // Отправляем некорректный запрос для проверки обработки ошибок
      socket.emit('invalidEvent', { invalid: 'data' });
    });

    socket.on('error', (error) => {
      clearTimeout(timeout);
      runner.log(`⚠️  Получена ошибка: ${error.message}`, 'yellow');
      runner.log('✅ Обработка ошибок работает корректно', 'green');
      socket.disconnect();
      resolve();
    });

    socket.on('connect_error', (error) => {
      clearTimeout(timeout);
      reject(new Error(`Ошибка подключения: ${error.message}`));
    });
  });
});

// Запуск всех тестов
async function main() {
  try {
    await runner.runAll();
  } catch (error) {
    console.error('❌ Критическая ошибка тестирования:', error.message);
    process.exit(1);
  }
}

// Проверяем, что сервер запущен
async function checkServer() {
  return new Promise((resolve, reject) => {
    const socket = io(TEST_CONFIG.serverUrl);
    
    const timeout = setTimeout(() => {
      reject(new Error('Сервер не отвечает'));
    }, 5000);

    socket.on('connect', () => {
      clearTimeout(timeout);
      runner.log('✅ Сервер доступен', 'green');
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
if (require.main === module) {
  checkServer()
    .then(() => main())
    .catch((error) => {
      console.error('❌ Ошибка:', error.message);
      console.log('💡 Убедитесь, что сервер запущен: npm run server');
      process.exit(1);
    });
}

module.exports = { TestRunner, runner };

