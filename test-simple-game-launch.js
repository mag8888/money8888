#!/usr/bin/env node

const io = require('socket.io-client');

console.log('🎮 [SIMPLE-TEST] Testing game launch with 2 players...\n');

// Функция для создания игрока
function createPlayer(playerName, playerId) {
  return {
    id: playerId,
    username: playerName,
    email: `${playerName}@test.com`,
    displayId: playerId.toUpperCase()
  };
}

// Функция для подключения игрока
function connectPlayer(playerName, playerId) {
  return new Promise((resolve) => {
    const socket = io('http://localhost:5000', {
      transports: ['websocket'],
      timeout: 10000
    });

    const playerData = createPlayer(playerName, playerId);
    let roomId = null;

    socket.on('connect', () => {
      console.log(`✅ [${playerName}] Connected to server`);
      resolve({ socket, playerData });
    });

    socket.on('error', (error) => {
      console.log(`❌ [${playerName}] Socket error:`, error);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 [${playerName}] Disconnected from server`);
    });
  });
}

// Главная функция тестирования
async function testTwoPlayerGameLaunch() {
  console.log('🔌 [SIMPLE-TEST] Connecting two players...');
  
  // Подключаем двух игроков
  const [player1, player2] = await Promise.all([
    connectPlayer('Player1', 'p1'),
    connectPlayer('Player2', 'p2')
  ]);

  console.log('✅ [SIMPLE-TEST] Both players connected');

  return new Promise((resolve) => {
    let testResults = {
      roomCreated: false,
      player1Joined: false,
      player2Joined: false,
      player1Ready: false,
      player2Ready: false,
      gameStarted: false,
      errors: []
    };

    let roomId = null;
    let playersInRoom = 0;

    // Создаем комнату первым игроком
    const roomName = `SimpleTest_${Date.now()}`;
    console.log(`🏠 [SIMPLE-TEST] Creating room: ${roomName}`);
    
    player1.socket.emit('createRoom', roomName, 2, null, 1, 'Simple Test Room');

    // Обработчик создания комнаты
    player1.socket.once('roomCreated', (roomData) => {
      console.log(`✅ [SIMPLE-TEST] Room created: ${roomData.roomId}`);
      roomId = roomData.roomId;
      testResults.roomCreated = true;

      // Присоединяем первого игрока
      console.log(`🎯 [SIMPLE-TEST] Player1 joining room: ${roomId}`);
      player1.socket.emit('joinRoom', roomId, player1.playerData);
    });

    // Обработчики для первого игрока
    player1.socket.on('playersUpdate', (players) => {
      console.log(`👥 [Player1] Players update: ${players.length} players`);
      playersInRoom = players.length;
      
      if (players.some(p => p.username === 'Player1')) {
        testResults.player1Joined = true;
        console.log(`✅ [SIMPLE-TEST] Player1 joined successfully`);
        
        // Если первый игрок присоединился, присоединяем второго
        if (!testResults.player2Joined && roomId) {
          console.log(`🎯 [SIMPLE-TEST] Player2 joining room: ${roomId}`);
          player2.socket.emit('joinRoom', roomId, player2.playerData);
        }
      }
      
      if (players.some(p => p.username === 'Player2')) {
        testResults.player2Joined = true;
        console.log(`✅ [SIMPLE-TEST] Player2 joined successfully`);
      }
      
      // Если оба игрока в комнате, отмечаем их готовыми
      if (testResults.player1Joined && testResults.player2Joined && playersInRoom >= 2) {
        if (!testResults.player1Ready) {
          console.log(`🎯 [SIMPLE-TEST] Marking Player1 as ready`);
          player1.socket.emit('setReady', roomId, true);
          testResults.player1Ready = true;
        }
        
        setTimeout(() => {
          if (!testResults.player2Ready) {
            console.log(`🎯 [SIMPLE-TEST] Marking Player2 as ready`);
            player2.socket.emit('setReady', roomId, true);
            testResults.player2Ready = true;
          }
        }, 1000);
      }
    });

    // Обработчики для второго игрока
    player2.socket.on('playersUpdate', (players) => {
      console.log(`👥 [Player2] Players update: ${players.length} players`);
    });

    // Обработчик готовности для запуска игры
    const checkGameStart = () => {
      if (testResults.player1Ready && testResults.player2Ready && !testResults.gameStarted) {
        console.log(`🚀 [SIMPLE-TEST] Both players ready, attempting to start game...`);
        player1.socket.emit('startGame', roomId, (success, error) => {
          if (success) {
            console.log(`✅ [SIMPLE-TEST] Game start acknowledged by server`);
            testResults.gameStarted = true;
          } else {
            console.log(`❌ [SIMPLE-TEST] Game start failed:`, error);
            testResults.errors.push(`Game start failed: ${error}`);
          }
          
          // Завершаем тест
          setTimeout(() => {
            player1.socket.disconnect();
            player2.socket.disconnect();
            resolve(testResults);
          }, 2000);
        });
      }
    };

    // Обработчики событий игры
    [player1.socket, player2.socket].forEach((socket, index) => {
      const playerName = index === 0 ? 'Player1' : 'Player2';
      
      socket.on('roomUpdated', (roomData) => {
        console.log(`🏠 [${playerName}] Room updated: ${roomData.status}`);
        if (roomData.status === 'started') {
          testResults.gameStarted = true;
        }
      });

      socket.on('gameStarted', (gameData) => {
        console.log(`🎮 [${playerName}] Game started event received`);
        testResults.gameStarted = true;
      });

      socket.on('canStartGame', (canStart) => {
        console.log(`🎯 [${playerName}] Can start game: ${canStart}`);
        if (canStart) {
          setTimeout(checkGameStart, 500);
        }
      });
    });

    // Таймаут для теста
    setTimeout(() => {
      console.log('⏰ [SIMPLE-TEST] Test timeout reached');
      player1.socket.disconnect();
      player2.socket.disconnect();
      resolve(testResults);
    }, 30000);
  });
}

// Главная функция
async function main() {
  console.log('🎮 [SIMPLE-TEST] ==========================================');
  console.log('🎮 [SIMPLE-TEST] SIMPLE TWO-PLAYER GAME LAUNCH TEST');
  console.log('🎮 [SIMPLE-TEST] ==========================================\n');
  
  try {
    const results = await testTwoPlayerGameLaunch();
    
    console.log('\n📊 [SIMPLE-TEST] Test Results:');
    console.log(`   - Room Created: ${results.roomCreated ? '✅ OK' : '❌ FAILED'}`);
    console.log(`   - Player1 Joined: ${results.player1Joined ? '✅ OK' : '❌ FAILED'}`);
    console.log(`   - Player2 Joined: ${results.player2Joined ? '✅ OK' : '❌ FAILED'}`);
    console.log(`   - Player1 Ready: ${results.player1Ready ? '✅ OK' : '❌ FAILED'}`);
    console.log(`   - Player2 Ready: ${results.player2Ready ? '✅ OK' : '❌ FAILED'}`);
    console.log(`   - Game Started: ${results.gameStarted ? '✅ OK' : '❌ FAILED'}`);
    
    if (results.errors.length > 0) {
      console.log('\n❌ [SIMPLE-TEST] Errors:');
      results.errors.forEach(error => console.log(`   - ${error}`));
    }
    
    if (results.gameStarted) {
      console.log('\n🎉 [SIMPLE-TEST] ==========================================');
      console.log('🎉 [SIMPLE-TEST] GAME LAUNCH TEST PASSED!');
      console.log('🎉 [SIMPLE-TEST] ==========================================');
      console.log('✅ [SIMPLE-TEST] Game can be started with 2 players!');
      console.log('✅ [SIMPLE-TEST] All systems are operational!');
    } else {
      console.log('\n❌ [SIMPLE-TEST] ==========================================');
      console.log('❌ [SIMPLE-TEST] GAME LAUNCH TEST FAILED!');
      console.log('❌ [SIMPLE-TEST] ==========================================');
      console.log('⚠️  [SIMPLE-TEST] Check the errors above');
    }
    
  } catch (error) {
    console.log(`💥 [SIMPLE-TEST] ERROR: ${error.message}`);
  }
}

// Запускаем тест
main().catch(console.error);
