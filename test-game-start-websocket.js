#!/usr/bin/env node

const io = require('socket.io-client');

console.log('🎮 [WEBSOCKET-GAME-TEST] Testing game start via WebSocket...\n');

// Функция для тестирования запуска игры через WebSocket
async function testGameStartViaWebSocket() {
  console.log('🔌 [WEBSOCKET-GAME-TEST] Connecting to WebSocket server...');
  
  const socket = io('http://localhost:5000', {
    transports: ['websocket'],
    timeout: 10000
  });

  return new Promise((resolve) => {
    let testResults = {
      connection: false,
      roomJoin: false,
      readyState: false,
      gameStart: false,
      errors: []
    };

    // Обработчик подключения
    socket.on('connect', () => {
      console.log('✅ [WEBSOCKET-GAME-TEST] Connected to server');
      testResults.connection = true;
      
      // Создаем тестового игрока
      const testPlayer = {
        id: `test_${Date.now()}`,
        username: 'TestPlayer',
        email: 'test@test.com',
        displayId: 'TEST001'
      };
      
      console.log('🎯 [WEBSOCKET-GAME-TEST] Joining test room...');
      
      // Присоединяемся к комнате 155 (которая в статусе waiting)
      socket.emit('joinRoom', '155', testPlayer);
    });

    // Обработчик обновления игроков
    socket.on('playersUpdate', (players) => {
      console.log('👥 [WEBSOCKET-GAME-TEST] Players update received:', players.length, 'players');
      
      if (players.length >= 2) {
        console.log('✅ [WEBSOCKET-GAME-TEST] Room joined successfully');
        testResults.roomJoin = true;
        
        // Отмечаемся как готовый
        console.log('🎯 [WEBSOCKET-GAME-TEST] Marking as ready...');
        socket.emit('setReady', '155', true);
      }
    });

    // Обработчик обновления комнаты
    socket.on('roomUpdated', (roomData) => {
      console.log('🏠 [WEBSOCKET-GAME-TEST] Room updated:', roomData.status);
      
      if (roomData.status === 'waiting') {
        // Проверяем, готовы ли игроки
        const readyPlayers = roomData.currentPlayers.filter(p => p.ready);
        console.log(`🎯 [WEBSOCKET-GAME-TEST] Ready players: ${readyPlayers.length}/${roomData.currentPlayers.length}`);
        
        if (readyPlayers.length >= 2) {
          console.log('✅ [WEBSOCKET-GAME-TEST] All players are ready!');
          testResults.readyState = true;
          
          // Пытаемся запустить игру
          console.log('🚀 [WEBSOCKET-GAME-TEST] Attempting to start game...');
          socket.emit('startGame', '155', (success, error) => {
            if (success) {
              console.log('✅ [WEBSOCKET-GAME-TEST] Game start acknowledged by server');
              testResults.gameStart = true;
            } else {
              console.log('❌ [WEBSOCKET-GAME-TEST] Game start failed:', error);
              testResults.errors.push(`Game start failed: ${error}`);
            }
            
            // Завершаем тест
            setTimeout(() => {
              socket.disconnect();
              resolve(testResults);
            }, 1000);
          });
        }
      }
    });

    // Обработчик ошибок
    socket.on('error', (error) => {
      console.log('❌ [WEBSOCKET-GAME-TEST] Socket error:', error);
      testResults.errors.push(`Socket error: ${error}`);
    });

    // Обработчик отключения
    socket.on('disconnect', () => {
      console.log('🔌 [WEBSOCKET-GAME-TEST] Disconnected from server');
    });

    // Таймаут для теста
    setTimeout(() => {
      console.log('⏰ [WEBSOCKET-GAME-TEST] Test timeout reached');
      socket.disconnect();
      resolve(testResults);
    }, 15000);
  });
}

// Главная функция
async function main() {
  console.log('🎮 [WEBSOCKET-GAME-TEST] ==========================================');
  console.log('🎮 [WEBSOCKET-GAME-TEST] WEBSOCKET GAME START TEST');
  console.log('🎮 [WEBSOCKET-GAME-TEST] ==========================================\n');
  
  try {
    const results = await testGameStartViaWebSocket();
    
    console.log('\n📊 [WEBSOCKET-GAME-TEST] Test Results:');
    console.log(`   - Connection: ${results.connection ? '✅ OK' : '❌ FAILED'}`);
    console.log(`   - Room Join: ${results.roomJoin ? '✅ OK' : '❌ FAILED'}`);
    console.log(`   - Ready State: ${results.readyState ? '✅ OK' : '❌ FAILED'}`);
    console.log(`   - Game Start: ${results.gameStart ? '✅ OK' : '❌ FAILED'}`);
    
    if (results.errors.length > 0) {
      console.log('\n❌ [WEBSOCKET-GAME-TEST] Errors:');
      results.errors.forEach(error => console.log(`   - ${error}`));
    }
    
    if (results.gameStart) {
      console.log('\n🎉 [WEBSOCKET-GAME-TEST] ==========================================');
      console.log('🎉 [WEBSOCKET-GAME-TEST] GAME START TEST PASSED!');
      console.log('🎉 [WEBSOCKET-GAME-TEST] ==========================================');
      console.log('✅ [WEBSOCKET-GAME-TEST] Game can be started via WebSocket');
      console.log('✅ [WEBSOCKET-GAME-TEST] All systems are operational');
    } else {
      console.log('\n❌ [WEBSOCKET-GAME-TEST] ==========================================');
      console.log('❌ [WEBSOCKET-GAME-TEST] GAME START TEST FAILED!');
      console.log('❌ [WEBSOCKET-GAME-TEST] ==========================================');
      console.log('⚠️  [WEBSOCKET-GAME-TEST] Check the errors above');
    }
    
  } catch (error) {
    console.log(`💥 [WEBSOCKET-GAME-TEST] ERROR: ${error.message}`);
  }
}

// Запускаем тест
main().catch(console.error);
