#!/usr/bin/env node

const { io } = require('socket.io-client');

console.log('🧪 Запуск автотеста: Создание комнат');
console.log('=================================================================\n');

// Конфигурация
const SERVER_URL = 'http://localhost:5000';
const TEST_TIMEOUT = 10000; // 10 секунд

let testResults = {
  serverConnection: false,
  roomCreation: false,
  roomJoining: false,
  playersSync: false,
  errors: []
};

// Функция для логирования
const log = (message, type = 'info') => {
  const timestamp = new Date().toLocaleTimeString();
  const emoji = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '🔍';
  console.log(`${emoji} [${timestamp}] ${message}`);
};

// Функция для добавления ошибки
const addError = (message) => {
  testResults.errors.push(message);
  log(message, 'error');
};

// Основная функция тестирования
async function testRoomCreation() {
  log('Начинаем тестирование создания комнат...');
  
  try {
    // 1. Подключение к серверу
    log('1️⃣ Подключение к серверу...');
    const socket = io(SERVER_URL, {
      transports: ['websocket'],
      timeout: 5000
    });

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Таймаут подключения к серверу'));
      }, 5000);

      socket.on('connect', () => {
        clearTimeout(timeout);
        testResults.serverConnection = true;
        log('✅ Подключение к серверу успешно', 'success');
        resolve();
      });

      socket.on('connect_error', (error) => {
        clearTimeout(timeout);
        addError(`Ошибка подключения: ${error.message}`);
        reject(error);
      });
    });

    // 2. Создание комнаты
    log('2️⃣ Создание комнаты...');
    const roomData = {
      roomId: 'test-room-' + Date.now(),
      maxPlayers: 4,
      password: '',
      roomName: 'Тестовая комната'
    };

    let createdRoom = null;

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Таймаут создания комнаты'));
      }, 5000);

      // Обработчик для roomCreated
      const handleRoomCreated = (room) => {
        clearTimeout(timeout);
        socket.off('roomCreated', handleRoomCreated);
        testResults.roomCreation = true;
        createdRoom = room; // Сохраняем созданную комнату
        log(`✅ Комната создана: ${room.roomId}`, 'success');
        resolve(room);
      };

      // Обработчик для ошибок
      const handleError = (error) => {
        clearTimeout(timeout);
        socket.off('error', handleError);
        addError(`Ошибка создания комнаты: ${error.message}`);
        reject(error);
      };

      socket.on('roomCreated', handleRoomCreated);
      socket.on('error', handleError);

      // Отправляем запрос на создание комнаты
      socket.emit('createRoom', roomData.roomId, roomData.maxPlayers, roomData.password, 2, roomData.roomName);
    });

    // 3. Получение списка комнат
    log('3️⃣ Получение списка комнат...');
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Таймаут получения списка комнат'));
      }, 5000);

      // Обработчик для roomsList
      const handleRoomsList = (rooms) => {
        clearTimeout(timeout);
        socket.off('roomsList', handleRoomsList);
        log(`✅ Получен список комнат: ${rooms.length} комнат`, 'success');
        
        // Ищем комнату по displayName или originalRequestedId
        const testRoom = rooms.find(r => 
          r.displayName === roomData.roomName || 
          r.originalRequestedId === roomData.roomId ||
          r.roomId === createdRoom?.roomId
        );
        
        if (testRoom) {
          log(`✅ Наша тестовая комната найдена в списке: ${testRoom.roomId}`, 'success');
        } else {
          addError('Тестовая комната не найдена в списке');
          log(`🔍 Искали по: displayName="${roomData.roomName}", originalRequestedId="${roomData.roomId}", roomId="${createdRoom?.roomId}"`);
          log(`🔍 Доступные комнаты: ${rooms.map(r => r.roomId).join(', ')}`);
        }
        resolve(rooms);
      };

      socket.on('roomsList', handleRoomsList);
      
      // Также запрашиваем список комнат явно
      socket.emit('getRoomsList');
    });

    // 4. Подключение к комнате
    log('4️⃣ Подключение к комнате...');
    const playerData = {
      username: 'test-player',
      email: 'test@example.com',
      displayId: 'TEST001'
    };

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Таймаут подключения к комнате'));
      }, 5000);

      // Обработчик для roomUpdated
      const handleRoomUpdated = (room) => {
        clearTimeout(timeout);
        socket.off('roomUpdated', handleRoomUpdated);
        testResults.roomJoining = true;
        log(`✅ Подключение к комнате успешно`, 'success');
        log(`📊 Статус комнаты: ${room.status}`, 'info');
        log(`👥 Игроков в комнате: ${room.currentPlayers.length}`, 'info');
        resolve(room);
      };

      // Обработчик для ошибок
      const handleError = (error) => {
        clearTimeout(timeout);
        socket.off('error', handleError);
        addError(`Ошибка подключения к комнате: ${error.message}`);
        reject(error);
      };

      socket.on('roomUpdated', handleRoomUpdated);
      socket.on('error', handleError);

      // Подключаемся к комнате (используем созданный ID)
      const roomIdToJoin = createdRoom?.roomId || roomData.roomId;
      log(`🔗 Подключаемся к комнате: ${roomIdToJoin}`);
      socket.emit('joinRoom', roomIdToJoin, playerData);
    });

    // 5. Проверка синхронизации игроков
    log('5️⃣ Проверка синхронизации игроков...');
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Таймаут синхронизации игроков'));
      }, 5000);

      // Обработчик для playersUpdate
      const handlePlayersUpdate = (players) => {
        clearTimeout(timeout);
        socket.off('playersUpdate', handlePlayersUpdate);
        testResults.playersSync = true;
        log(`✅ Синхронизация игроков успешна`, 'success');
        log(`👥 Обновленный список игроков: ${players.length}`, 'info');
        
        const ourPlayer = players.find(p => p.username === playerData.username);
        if (ourPlayer) {
          log(`✅ Наш игрок найден в списке: ${ourPlayer.username}`, 'success');
        } else {
          addError('Наш игрок не найден в списке игроков');
        }
        
        resolve(players);
      };

      socket.on('playersUpdate', handlePlayersUpdate);
    });

    // 6. Проверка API комнат
    log('6️⃣ Проверка API комнат...');
    try {
      const response = await fetch(`${SERVER_URL}/api/admin/rooms`);
      if (response.ok) {
        const roomsData = await response.json();
        log(`✅ API комнат работает: ${roomsData.totalRooms} комнат`, 'success');
        
        const testRoom = roomsData.rooms.find(r => r.roomId === roomData.roomId);
        if (testRoom) {
          log(`✅ Тестовая комната найдена в API: ${testRoom.status}`, 'success');
        } else {
          addError('Тестовая комната не найдена в API');
        }
      } else {
        addError(`API комнат вернул ошибку: ${response.status}`);
      }
    } catch (error) {
      addError(`Ошибка API комнат: ${error.message}`);
    }

    // Закрываем соединение
    socket.disconnect();
    log('🔌 Соединение закрыто', 'info');

  } catch (error) {
    addError(`Критическая ошибка теста: ${error.message}`);
  }

  // Выводим результаты
  console.log('\n📊 РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ:');
  console.log('==================================================');
  console.log(`Подключение к серверу: ${testResults.serverConnection ? '✅' : '❌'}`);
  console.log(`Создание комнаты: ${testResults.roomCreation ? '✅' : '❌'}`);
  console.log(`Подключение к комнате: ${testResults.roomJoining ? '✅' : '❌'}`);
  console.log(`Синхронизация игроков: ${testResults.playersSync ? '✅' : '❌'}`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ ОШИБКИ:');
    testResults.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }

  const successCount = Object.values(testResults).filter(v => v === true).length;
  const totalTests = 4;
  
  console.log(`\n🎯 ИТОГО: ${successCount}/${totalTests} тестов пройдено`);
  
  if (successCount === totalTests) {
    console.log('🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО!');
    console.log('\n💡 Комнаты должны создаваться корректно');
  } else {
    console.log('⚠️ НЕКОТОРЫЕ ТЕСТЫ ПРОВАЛЕНЫ');
    console.log('\n🔧 Необходимо исправить найденные проблемы');
  }

  process.exit(successCount === totalTests ? 0 : 1);
}

// Запускаем тест
testRoomCreation().catch(error => {
  console.error('💥 Критическая ошибка:', error);
  process.exit(1);
});
