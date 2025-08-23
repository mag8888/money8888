#!/usr/bin/env node

const io = require('socket.io-client');

console.log('🔍 [PROBLEM-DETECTOR] Detecting game launch problems...\n');

// Функция для детального тестирования запуска игры
async function detectGameProblems() {
  console.log('🔌 [PROBLEM-DETECTOR] Connecting to WebSocket server...');
  
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
      gameEvents: [],
      errors: []
    };
    
    let currentRoomId = null; // Переменная для хранения roomId

    // Обработчик подключения
    socket.on('connect', () => {
      console.log('✅ [PROBLEM-DETECTOR] Connected to server');
      testResults.connection = true;
      
      // Создаем тестового игрока
      const testPlayer = {
        id: `detector_${Date.now()}`,
        username: 'ProblemDetector',
        email: 'detector@test.com',
        displayId: 'DET001'
      };
      
      console.log('🎯 [PROBLEM-DETECTOR] Creating new room for testing...');
      
      // Создаем новую комнату для тестирования
      const roomId = `test_room_${Date.now()}`;
      const maxPlayers = 2;
      const password = null;
      const timerHours = 1;
      const roomName = 'Test Room for Problem Detection';
      
      console.log('🎯 [PROBLEM-DETECTOR] Creating room with params:', { roomId, maxPlayers, roomName });
      
      socket.emit('createRoom', roomId, maxPlayers, password, timerHours, roomName);
      
      // Обработчик создания комнаты
      socket.once('roomCreated', (roomData) => {
        console.log('✅ [PROBLEM-DETECTOR] Room created:', roomData.roomId);
        
        // Сохраняем roomId для использования в других местах
        currentRoomId = roomData.roomId;
        
        // Присоединяемся к созданной комнате
        console.log('🎯 [PROBLEM-DETECTOR] Joining created room...');
        socket.emit('joinRoom', roomData.roomId, testPlayer);
      });
    });

    // Обработчик обновления игроков
    socket.on('playersUpdate', (players) => {
      console.log('👥 [PROBLEM-DETECTOR] Players update received:', players.length, 'players');
      testResults.gameEvents.push(`playersUpdate: ${players.length} players`);
      
      if (players.length >= 1) {
        console.log('✅ [PROBLEM-DETECTOR] Room joined successfully');
        testResults.roomJoin = true;
        
                 // Отмечаемся как готовый
         console.log('🎯 [PROBLEM-DETECTOR] Marking as ready...');
         socket.emit('setReady', currentRoomId, true);
      }
    });

    // Обработчик обновления комнаты
    socket.on('roomUpdated', (roomData) => {
      console.log('🏠 [PROBLEM-DETECTOR] Room updated:', roomData.status);
      testResults.gameEvents.push(`roomUpdated: ${roomData.status}`);
      
      if (roomData.status === 'waiting') {
        // Проверяем, готовы ли игроки
        const readyPlayers = roomData.currentPlayers.filter(p => p.ready);
        console.log(`🎯 [PROBLEM-DETECTOR] Ready players: ${readyPlayers.length}/${roomData.currentPlayers.length}`);
        
        if (readyPlayers.length >= 1) {
          console.log('✅ [PROBLEM-DETECTOR] Player is ready!');
          testResults.readyState = true;
          
          // Ждем второго игрока или пытаемся запустить игру
          console.log('⏳ [PROBLEM-DETECTOR] Waiting for second player or attempting solo start...');
          
          // Пытаемся запустить игру
          setTimeout(() => {
                         console.log('🚀 [PROBLEM-DETECTOR] Attempting to start game...');
             socket.emit('startGame', currentRoomId, (success, error) => {
              if (success) {
                console.log('✅ [PROBLEM-DETECTOR] Game start acknowledged by server');
                testResults.gameStart = true;
                testResults.gameEvents.push('startGame: success');
              } else {
                console.log('❌ [PROBLEM-DETECTOR] Game start failed:', error);
                testResults.errors.push(`Game start failed: ${error}`);
                testResults.gameEvents.push(`startGame: failed - ${error}`);
              }
              
              // Завершаем тест
              setTimeout(() => {
                socket.disconnect();
                resolve(testResults);
              }, 1000);
            });
          }, 3000);
        }
      } else if (roomData.status === 'started') {
        console.log('🎉 [PROBLEM-DETECTOR] Game started successfully!');
        testResults.gameStart = true;
        testResults.gameEvents.push('roomUpdated: started');
        
        // Завершаем тест
        setTimeout(() => {
          socket.disconnect();
          resolve(testResults);
        }, 1000);
      }
    });

    // Обработчик запуска игры
    socket.on('gameStarted', (gameData) => {
      console.log('🎮 [PROBLEM-DETECTOR] Game started event received:', gameData);
      testResults.gameEvents.push(`gameStarted: ${JSON.stringify(gameData)}`);
    });

    // Обработчик данных комнаты
    socket.on('roomData', (roomData) => {
      console.log('📊 [PROBLEM-DETECTOR] Room data received:', roomData);
      testResults.gameEvents.push(`roomData: ${roomData.status}`);
    });

    // Обработчик списка игроков
    socket.on('playersList', (players) => {
      console.log('👥 [PROBLEM-DETECTOR] Players list received:', players.length, 'players');
      testResults.gameEvents.push(`playersList: ${players.length} players`);
    });

    // Обработчик смены хода
    socket.on('turnChanged', (turnData) => {
      console.log('🔄 [PROBLEM-DETECTOR] Turn changed:', turnData);
      testResults.gameEvents.push(`turnChanged: ${JSON.stringify(turnData)}`);
    });

    // Обработчик ошибок
    socket.on('error', (error) => {
      console.log('❌ [PROBLEM-DETECTOR] Socket error:', error);
      testResults.errors.push(`Socket error: ${error}`);
    });

    // Обработчик отключения
    socket.on('disconnect', () => {
      console.log('🔌 [PROBLEM-DETECTOR] Disconnected from server');
    });

    // Таймаут для теста
    setTimeout(() => {
      console.log('⏰ [PROBLEM-DETECTOR] Test timeout reached');
      socket.disconnect();
      resolve(testResults);
    }, 20000);
  });
}

// Главная функция
async function main() {
  console.log('🔍 [PROBLEM-DETECTOR] ==========================================');
  console.log('🔍 [PROBLEM-DETECTOR] GAME PROBLEM DETECTION');
  console.log('🔍 [PROBLEM-DETECTOR] ==========================================\n');
  
  try {
    const results = await detectGameProblems();
    
    console.log('\n📊 [PROBLEM-DETECTOR] Test Results:');
    console.log(`   - Connection: ${results.connection ? '✅ OK' : '❌ FAILED'}`);
    console.log(`   - Room Join: ${results.roomJoin ? '✅ OK' : '❌ FAILED'}`);
    console.log(`   - Ready State: ${results.readyState ? '✅ OK' : '❌ FAILED'}`);
    console.log(`   - Game Start: ${results.gameStart ? '✅ OK' : '❌ FAILED'}`);
    
    console.log('\n📋 [PROBLEM-DETECTOR] Game Events:');
    results.gameEvents.forEach(event => console.log(`   - ${event}`));
    
    if (results.errors.length > 0) {
      console.log('\n❌ [PROBLEM-DETECTOR] Errors:');
      results.errors.forEach(error => console.log(`   - ${error}`));
    }
    
    if (results.gameStart) {
      console.log('\n🎉 [PROBLEM-DETECTOR] ==========================================');
      console.log('🎉 [PROBLEM-DETECTOR] GAME START TEST PASSED!');
      console.log('🎉 [PROBLEM-DETECTOR] ==========================================');
      console.log('✅ [PROBLEM-DETECTOR] Game can be started successfully!');
    } else {
      console.log('\n❌ [PROBLEM-DETECTOR] ==========================================');
      console.log('❌ [PROBLEM-DETECTOR] GAME START TEST FAILED!');
      console.log('❌ [PROBLEM-DETECTOR] ==========================================');
      console.log('⚠️  [PROBLEM-DETECTOR] Game start problems detected');
      console.log('🔍 [PROBLEM-DETECTOR] Check the errors and events above');
    }
    
  } catch (error) {
    console.log(`💥 [PROBLEM-DETECTOR] ERROR: ${error.message}`);
  }
}

// Запускаем тест
main().catch(console.error);
