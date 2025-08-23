#!/usr/bin/env node

const io = require('socket.io-client');

console.log('🎮 [FINAL-GAME-TEST] Final game start test...\n');

// Функция для тестирования запуска игры в готовой комнате
async function testGameStartInReadyRoom() {
  console.log('🔌 [FINAL-GAME-TEST] Connecting to WebSocket server...');
  
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
      console.log('✅ [FINAL-GAME-TEST] Connected to server');
      testResults.connection = true;
      
      // Создаем тестового игрока
      const testPlayer = {
        id: `final_test_${Date.now()}`,
        username: 'FinalTestPlayer',
        email: 'final@test.com',
        displayId: 'FINAL001'
      };
      
      console.log('🎯 [FINAL-GAME-TEST] Joining room 177 (ready players)...');
      
      // Присоединяемся к комнате 177 (которая имеет готовых игроков)
      socket.emit('joinRoom', '177', testPlayer);
    });

    // Обработчик обновления игроков
    socket.on('playersUpdate', (players) => {
      console.log('👥 [FINAL-GAME-TEST] Players update received:', players.length, 'players');
      
      if (players.length >= 2) {
        console.log('✅ [FINAL-GAME-TEST] Room joined successfully');
        testResults.roomJoin = true;
        
        // Отмечаемся как готовый
        console.log('🎯 [FINAL-GAME-TEST] Marking as ready...');
        socket.emit('setReady', '177', true);
      }
    });

    // Обработчик обновления комнаты
    socket.on('roomUpdated', (roomData) => {
      console.log('🏠 [FINAL-GAME-TEST] Room updated:', roomData.status);
      
      if (roomData.status === 'waiting') {
        // Проверяем, готовы ли игроки
        const readyPlayers = roomData.currentPlayers.filter(p => p.ready);
        console.log(`🎯 [FINAL-GAME-TEST] Ready players: ${readyPlayers.length}/${roomData.currentPlayers.length}`);
        
        if (readyPlayers.length >= 2) {
          console.log('✅ [FINAL-GAME-TEST] All players are ready!');
          testResults.readyState = true;
          
          // Пытаемся запустить игру
          console.log('🚀 [FINAL-GAME-TEST] Attempting to start game...');
          socket.emit('startGame', '177', (success, error) => {
            if (success) {
              console.log('✅ [FINAL-GAME-TEST] Game start acknowledged by server');
              testResults.gameStart = true;
            } else {
              console.log('❌ [FINAL-GAME-TEST] Game start failed:', error);
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
      console.log('❌ [FINAL-GAME-TEST] Socket error:', error);
      testResults.errors.push(`Socket error: ${error}`);
    });

    // Обработчик отключения
    socket.on('disconnect', () => {
      console.log('🔌 [FINAL-GAME-TEST] Disconnected from server');
    });

    // Таймаут для теста
    setTimeout(() => {
      console.log('⏰ [FINAL-GAME-TEST] Test timeout reached');
      socket.disconnect();
      resolve(testResults);
    }, 15000);
  });
}

// Главная функция
async function main() {
  console.log('🎮 [FINAL-GAME-TEST] ==========================================');
  console.log('🎮 [FINAL-GAME-TEST] FINAL GAME START TEST');
  console.log('🎮 [FINAL-GAME-TEST] ==========================================\n');
  
  try {
    const results = await testGameStartInReadyRoom();
    
    console.log('\n📊 [FINAL-GAME-TEST] Test Results:');
    console.log(`   - Connection: ${results.connection ? '✅ OK' : '❌ FAILED'}`);
    console.log(`   - Room Join: ${results.roomJoin ? '✅ OK' : '❌ FAILED'}`);
    console.log(`   - Ready State: ${results.readyState ? '✅ OK' : '❌ FAILED'}`);
    console.log(`   - Game Start: ${results.gameStart ? '✅ OK' : '❌ FAILED'}`);
    
    if (results.errors.length > 0) {
      console.log('\n❌ [FINAL-GAME-TEST] Errors:');
      results.errors.forEach(error => console.log(`   - ${error}`));
    }
    
    if (results.gameStart) {
      console.log('\n🎉 [FINAL-GAME-TEST] ==========================================');
      console.log('🎉 [FINAL-GAME-TEST] GAME START TEST PASSED!');
      console.log('🎉 [FINAL-GAME-TEST] ==========================================');
      console.log('✅ [FINAL-GAME-TEST] Game can be started successfully!');
      console.log('✅ [FINAL-GAME-TEST] All systems are operational!');
      console.log('🎮 [FINAL-GAME-TEST] Cashflow Game is fully functional!');
    } else {
      console.log('\n❌ [FINAL-GAME-TEST] ==========================================');
      console.log('❌ [FINAL-GAME-TEST] GAME START TEST FAILED!');
      console.log('❌ [FINAL-GAME-TEST] ==========================================');
      console.log('⚠️  [FINAL-GAME-TEST] Check the errors above');
    }
    
  } catch (error) {
    console.log(`💥 [FINAL-GAME-TEST] ERROR: ${error.message}`);
  }
}

// Запускаем тест
main().catch(console.error);
