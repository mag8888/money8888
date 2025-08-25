const io = require('socket.io-client');

// Конфигурация
const SERVER_URL = 'http://localhost:5000';
const TEST_ROOM_ID = 'test-order-determination-' + Date.now();

// Тестовые данные
const testPlayers = [
  { username: 'Player1', email: 'player1@test.com', displayId: 'P1' },
  { username: 'Player2', email: 'player2@test.com', displayId: 'P2' },
  { username: 'Player3', email: 'player3@test.com', displayId: 'P3' }
];

let sockets = [];
let roomId = null;

// Функция для ожидания
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Основная функция тестирования
async function testOrderDetermination() {
  console.log('🎲 Тестирование системы определения очередности...\n');

  try {
    // 1. Подключаем игроков
    console.log('1️⃣ Подключение игроков...');
    for (let i = 0; i < testPlayers.length; i++) {
      const socket = io(SERVER_URL);
      
      socket.on('connect', () => {
        console.log(`   ✅ Игрок ${i + 1} подключен: ${socket.id}`);
      });
      
      socket.on('error', (error) => {
        console.error(`   ❌ Ошибка игрока ${i + 1}:`, error);
      });
      
      sockets.push(socket);
      await wait(100); // Небольшая задержка между подключениями
    }

    // 2. Создаем комнату
    console.log('\n2️⃣ Создание комнаты...');
    const hostSocket = sockets[0];
    
    hostSocket.emit('createRoom', TEST_ROOM_ID, 4, '', 3, 'Тестовая комната для очередности');
    
    await new Promise((resolve) => {
      hostSocket.once('roomCreated', (room) => {
        roomId = room.roomId;
        console.log(`   ✅ Комната создана: ${roomId}`);
        resolve();
      });
    });

    // 3. Подключаем игроков к комнате
    console.log('\n3️⃣ Подключение игроков к комнате...');
    for (let i = 0; i < sockets.length; i++) {
      const socket = sockets[i];
      const player = testPlayers[i];
      
      socket.emit('joinRoom', roomId, {
        id: socket.id,
        username: player.username,
        email: player.email,
        displayId: player.displayId
      });
      
      await wait(100);
    }

    // 4. Ждем синхронизации игроков
    console.log('\n4️⃣ Ожидание синхронизации игроков...');
    await wait(1000);

    // 5. Отмечаем готовность игроков
    console.log('\n5️⃣ Отметка готовности игроков...');
    for (let i = 0; i < sockets.length; i++) {
      const socket = sockets[i];
      socket.emit('setReady', roomId, true);
      await wait(100);
    }

    // 6. Запускаем игру
    console.log('\n6️⃣ Запуск игры...');
    hostSocket.emit('startGame', roomId);
    
    await new Promise((resolve) => {
      hostSocket.once('orderDeterminationStarted', (data) => {
        console.log('   ✅ Определение очередности началось:', {
          players: data.players.length,
          timer: data.timer,
          phase: data.phase
        });
        resolve();
      });
    });

    // 7. Проверяем, что все игроки получили событие
    console.log('\n7️⃣ Проверка получения события всеми игроками...');
    let playersReceivedEvent = 0;
    
    for (let i = 0; i < sockets.length; i++) {
      const socket = sockets[i];
      
      socket.once('orderDeterminationStarted', (data) => {
        playersReceivedEvent++;
        console.log(`   ✅ Игрок ${i + 1} получил событие:`, {
          players: data.players.length,
          timer: data.timer,
          phase: data.phase
        });
      });
    }
    
    await wait(1000);
    console.log(`   📊 Событие получили: ${playersReceivedEvent}/${sockets.length} игроков`);

    // 8. Игроки бросают кубики
    console.log('\n8️⃣ Игроки бросают кубики...');
    for (let i = 0; i < sockets.length; i++) {
      const socket = sockets[i];
      
      socket.emit('rollDiceForOrder', roomId, socket.id);
      console.log(`   🎲 Игрок ${i + 1} бросает кубик...`);
      
      await wait(500); // Задержка между бросками
    }

    // 9. Ждем завершения определения очередности
    console.log('\n9️⃣ Ожидание завершения определения очередности...');
    let orderDeterminationComplete = false;
    
    hostSocket.once('orderDeterminationComplete', (data) => {
      orderDeterminationComplete = true;
      console.log('   ✅ Очередность определена:', {
        players: data.players.length,
        positions: data.players.map(p => `${p.username}: ${p.position}`)
      });
    });
    
    // Ждем максимум 2 минуты
    for (let i = 0; i < 120; i++) {
      if (orderDeterminationComplete) break;
      await wait(1000);
      if (i % 10 === 0) {
        console.log(`   ⏳ Ожидание... ${i}s`);
      }
    }

    if (!orderDeterminationComplete) {
      console.log('   ⚠️ Определение очередности не завершилось за отведенное время');
    }

    // 10. Проверяем, что игра началась
    console.log('\n🔟 Проверка начала игры...');
    let gameStarted = false;
    
    hostSocket.once('roomData', (data) => {
      if (data.status === 'started') {
        gameStarted = true;
        console.log('   ✅ Игра началась:', {
          status: data.status,
          currentTurn: data.currentTurn
        });
      }
    });
    
    await wait(2000);

    if (!gameStarted) {
      console.log('   ⚠️ Игра не началась после определения очередности');
    }

    // Результаты теста
    console.log('\n📊 РЕЗУЛЬТАТЫ ТЕСТА:');
    console.log(`   ✅ Комната создана: ${roomId ? 'Да' : 'Нет'}`);
    console.log(`   ✅ Игроки подключены: ${sockets.length}/${testPlayers.length}`);
    console.log(`   ✅ Определение очередности началось: ${orderDeterminationComplete ? 'Да' : 'Нет'}`);
    console.log(`   ✅ Игра началась: ${gameStarted ? 'Да' : 'Нет'}`);

    if (roomId && sockets.length === testPlayers.length && orderDeterminationComplete && gameStarted) {
      console.log('\n🎉 ТЕСТ ПРОЙДЕН УСПЕШНО!');
    } else {
      console.log('\n❌ ТЕСТ НЕ ПРОЙДЕН!');
    }

  } catch (error) {
    console.error('\n💥 Ошибка в тесте:', error);
  } finally {
    // Очистка
    console.log('\n🧹 Очистка...');
    for (const socket of sockets) {
      if (socket.connected) {
        socket.disconnect();
      }
    }
    
    // Выход
    process.exit(0);
  }
}

// Запуск теста
console.log('🚀 Запуск теста системы определения очередности...');
testOrderDetermination();
