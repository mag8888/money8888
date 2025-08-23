#!/usr/bin/env node

const io = require('socket.io-client');

console.log('🎮 [CLEAN-GAME-LAUNCH] Testing game launch with clean room...');

let testStep = 0;
let testResults = [];

function logStep(message, status = 'INFO') {
  testStep++;
  const timestamp = new Date().toLocaleTimeString();
  const icon = status === 'SUCCESS' ? '✅' : status === 'ERROR' ? '❌' : status === 'WARNING' ? '⚠️' : '📋';
  console.log(`\n${icon} [STEP ${testStep}] ${timestamp} - ${message}`);
  
  testResults.push({
    step: testStep,
    message,
    status,
    timestamp
  });
}

function logResult(message, data = null) {
  console.log(`📊 ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

// Глобальные переменные
let player1Socket = null;
let player2Socket = null;
let testRoomId = null;
let testCompleted = false;

// Функция для подключения игрока
function connectPlayer(playerNumber) {
  return new Promise((resolve, reject) => {
    const socket = io('http://localhost:5000');
    
    socket.on('connect', () => {
      logStep(`Player ${playerNumber} connected`, 'SUCCESS');
      resolve(socket);
    });
    
    socket.on('connect_error', (error) => {
      logStep(`Player ${playerNumber} connection error: ${error.message}`, 'ERROR');
      reject(error);
    });
    
    setTimeout(() => {
      reject(new Error(`Player ${playerNumber} connection timeout`));
    }, 5000);
  });
}

// Функция для создания чистой тестовой комнаты
function createCleanRoom(socket) {
  return new Promise((resolve, reject) => {
    logStep('Creating clean test room...', 'INFO');
    
    const roomId = `clean_test_${Date.now()}`;
    socket.emit('createRoom', roomId, 2, null, 10, 'Clean Test Room');
    
    socket.on('roomCreated', (data) => {
      logStep(`Clean room created: ${data.roomId}`, 'SUCCESS');
      logResult('Room data:', data);
      testRoomId = data.roomId;
      resolve(data.roomId);
    });
    
    socket.on('roomCreationError', (error) => {
      logStep(`Room creation failed: ${error}`, 'ERROR');
      reject(new Error(`Room creation failed: ${error}`));
    });
    
    setTimeout(() => {
      reject(new Error('Room creation timeout'));
    }, 10000);
  });
}

// Функция для присоединения к комнате
function joinRoom(socket, roomId, playerNumber) {
  return new Promise((resolve, reject) => {
    logStep(`Player ${playerNumber} joining room ${roomId}...`, 'INFO');
    
    socket.emit('joinRoom', roomId);
    
    // Ждем события playersUpdate как подтверждение
    socket.on('playersUpdate', (players) => {
      if (players.length >= playerNumber) {
        logStep(`Player ${playerNumber} joined room successfully`, 'SUCCESS');
        logResult(`Room state:`, {
          roomId: roomId,
          players: players.length,
          status: 'waiting'
        });
        resolve(players);
      }
    });
    
    setTimeout(() => {
      reject(new Error(`Player ${playerNumber} join timeout`));
    }, 10000);
  });
}

// Функция для установки готовности
function setReady(socket, playerNumber) {
  return new Promise((resolve, reject) => {
    logStep(`Player ${playerNumber} setting ready...`, 'INFO');
    
    socket.emit('setReady', testRoomId, true);
    
    // Ждем события playersUpdate
    socket.on('playersUpdate', (players) => {
      const player = players.find(p => p.socketId === socket.id);
      if (player && player.ready) {
        logStep(`Player ${playerNumber} ready state confirmed`, 'SUCCESS');
        resolve(true);
      }
    });
    
    setTimeout(() => {
      reject(new Error(`Player ${playerNumber} ready timeout`));
    }, 10000);
  });
}

// Функция для запуска игры
function startGame(socket, roomId) {
  return new Promise((resolve, reject) => {
    logStep('Attempting to start game...', 'INFO');
    
    socket.emit('startGame', roomId);
    
    // Ждем события gameStarted
    socket.on('gameStarted', (data) => {
      logStep('Game started successfully!', 'SUCCESS');
      logResult('Game started data:', data);
      resolve(true);
    });
    
    // Альтернативно, ждем roomData со статусом started
    socket.on('roomData', (data) => {
      if (data.status === 'started') {
        logStep('Game started via roomData!', 'SUCCESS');
        logResult('Room data:', data);
        resolve(true);
      }
    });
    
    setTimeout(() => {
      reject(new Error('Game start timeout'));
    }, 15000);
  });
}

// Основная функция теста
async function runCleanGameTest() {
  try {
    logStep('🚀 Starting clean game launch test...', 'INFO');
    
    // Шаг 1: Подключаем первого игрока
    logStep('Connecting Player 1...', 'INFO');
    player1Socket = await connectPlayer(1);
    
    // Шаг 2: Подключаем второго игрока
    logStep('Connecting Player 2...', 'INFO');
    player2Socket = await connectPlayer(2);
    
    // Шаг 3: Создаем чистую тестовую комнату
    logStep('Creating clean test room...', 'INFO');
    await createCleanRoom(player1Socket);
    
    // Шаг 4: Первый игрок присоединяется к комнате
    logStep('Player 1 joining room...', 'INFO');
    await joinRoom(player1Socket, testRoomId, 1);
    
    // Шаг 5: Второй игрок присоединяется к комнате
    logStep('Player 2 joining room...', 'INFO');
    await joinRoom(player2Socket, testRoomId, 2);
    
    // Шаг 6: Первый игрок устанавливает готовность
    logStep('Player 1 setting ready...', 'INFO');
    await setReady(player1Socket, 1);
    
    // Шаг 7: Второй игрок устанавливает готовность
    logStep('Player 2 setting ready...', 'INFO');
    await setReady(player2Socket, 2);
    
    // Шаг 8: Запускаем игру
    logStep('Starting game...', 'INFO');
    await startGame(player1Socket, testRoomId);
    
    // Шаг 9: Тест завершен успешно
    logStep('🎉 CLEAN GAME LAUNCH TEST COMPLETED SUCCESSFULLY!', 'SUCCESS');
    testCompleted = true;
    
  } catch (error) {
    logStep(`❌ Test failed: ${error.message}`, 'ERROR');
    console.error('Full error:', error);
  } finally {
    // Очистка
    if (player1Socket) player1Socket.disconnect();
    if (player2Socket) player2Socket.disconnect();
    
    // Вывод результатов
    logStep('📊 Test Results Summary', 'INFO');
    const successCount = testResults.filter(r => r.status === 'SUCCESS').length;
    const errorCount = testResults.filter(r => r.status === 'ERROR').length;
    const totalSteps = testResults.length;
    
    console.log(`\n🎯 Test Summary:`);
    console.log(`✅ Successful steps: ${successCount}`);
    console.log(`❌ Failed steps: ${errorCount}`);
    console.log(`📋 Total steps: ${totalSteps}`);
    console.log(`🎮 Game launch: ${testCompleted ? 'SUCCESS' : 'FAILED'}`);
    
    if (testCompleted) {
      console.log('\n🎉 ALL TESTS PASSED! Game launch system is working perfectly!');
      process.exit(0);
    } else {
      console.log('\n❌ Some tests failed. Check the logs above for details.');
      process.exit(1);
    }
  }
}

// Запуск теста
console.log('🎮 [CLEAN-GAME-LAUNCH] Starting in 3 seconds...');
setTimeout(() => {
  runCleanGameTest();
}, 3000);
