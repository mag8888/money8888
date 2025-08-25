const io = require('socket.io-client');

// Конфигурация
const SERVER_URL = 'http://localhost:5000';
const TEST_ROOM_ID = 'test-profession-system-' + Date.now();

// Тестовые данные
const testPlayers = [
  { username: 'Player1', email: 'player1@test.com', displayId: 'P1' },
  { username: 'Player2', email: 'player2@test.com', displayId: 'P2' }
];

let sockets = [];
let roomId = null;

// Функция для ожидания
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Основная функция тестирования
async function testProfessionSystem() {
  console.log('💼 Тестирование системы профессий...\n');

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
      await wait(100);
    }

    // 2. Создаем комнату
    console.log('\n2️⃣ Создание комнаты...');
    const hostSocket = sockets[0];
    
    hostSocket.emit('createRoom', TEST_ROOM_ID, 4, '', 3, 'Тестовая комната для профессий');
    
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

    // 6. Пытаемся запустить игру без профессий (должно не получиться)
    console.log('\n6️⃣ Попытка запуска игры без профессий...');
    let gameStartFailed = false;
    
    hostSocket.emit('startGame', roomId, (success, error) => {
      if (!success && error === 'NEED_PROFESSIONS') {
        gameStartFailed = true;
        console.log('   ✅ Игра не запустилась (ожидаемо): не все игроки выбрали профессию');
      } else if (success) {
        console.log('   ❌ Игра запустилась (неожиданно)');
      } else {
        console.log('   ❌ Неожиданная ошибка:', error);
      }
    });
    
    await wait(2000);
    
    if (!gameStartFailed) {
      console.log('   ⚠️ Не удалось проверить блокировку запуска без профессий');
    }

    // 7. Устанавливаем профессии игрокам
    console.log('\n7️⃣ Установка профессий игрокам...');
    const testProfessions = [
      {
        id: 'engineer',
        name: 'Инженер',
        salary: 5000,
        expenses: 2000,
        balance: 3000,
        passiveIncome: 0,
        description: 'Стабильная работа с хорошей зарплатой'
      },
      {
        id: 'doctor',
        name: 'Врач',
        salary: 8000,
        expenses: 3000,
        balance: 5000,
        passiveIncome: 0,
        description: 'Высокооплачиваемая профессия с большими расходами'
      }
    ];

    for (let i = 0; i < sockets.length; i++) {
      const socket = sockets[i];
      const profession = testProfessions[i];
      
      socket.emit('setPlayerProfession', roomId, socket.id, profession);
      console.log(`   💼 Игрок ${i + 1} получил профессию: ${profession.name}`);
      
      await wait(500);
    }

    // 8. Ждем обновления данных
    console.log('\n8️⃣ Ожидание обновления данных...');
    await wait(1000);

    // 9. Теперь пытаемся запустить игру с профессиями
    console.log('\n9️⃣ Попытка запуска игры с профессиями...');
    let gameStartSuccess = false;
    
    hostSocket.emit('startGame', roomId, (success, error) => {
      if (success) {
        gameStartSuccess = true;
        console.log('   ✅ Игра успешно запущена с профессиями!');
      } else {
        console.log('   ❌ Игра не запустилась:', error);
      }
    });
    
    await wait(3000);

    // 10. Проверяем, что определение очередности началось
    console.log('\n🔟 Проверка начала определения очередности...');
    let orderDeterminationStarted = false;
    
    hostSocket.once('orderDeterminationStarted', (data) => {
      orderDeterminationStarted = true;
      console.log('   ✅ Определение очередности началось:', {
        players: data.players.length,
        timer: data.timer,
        phase: data.phase
      });
    });
    
    await wait(2000);

    // Результаты теста
    console.log('\n📊 РЕЗУЛЬТАТЫ ТЕСТА:');
    console.log(`   ✅ Комната создана: ${roomId ? 'Да' : 'Нет'}`);
    console.log(`   ✅ Игроки подключены: ${sockets.length}/${testPlayers.length}`);
    console.log(`   ✅ Запуск без профессий заблокирован: ${gameStartFailed ? 'Да' : 'Нет'}`);
    console.log(`   ✅ Профессии установлены: ${testProfessions.length}/${testPlayers.length}`);
    console.log(`   ✅ Игра запустилась с профессиями: ${gameStartSuccess ? 'Да' : 'Нет'}`);
    console.log(`   ✅ Определение очередности началось: ${orderDeterminationStarted ? 'Да' : 'Нет'}`);

    if (roomId && sockets.length === testPlayers.length && gameStartFailed && gameStartSuccess && orderDeterminationStarted) {
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
console.log('🚀 Запуск теста системы профессий...');
testProfessionSystem();
