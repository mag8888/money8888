#!/usr/bin/env node

const io = require('socket.io-client');
const http = require('http');

console.log('🎮 [FULL-GAME-LAUNCH-TEST] Testing complete game launch process...');

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

// Глобальные переменные для теста
let player1Socket = null;
let player2Socket = null;
let createdRoomId = null;
let testCompleted = false;

// Функция для создания игрока
function createPlayer(playerNumber) {
  return new Promise((resolve, reject) => {
    const socket = io('http://localhost:5000');
    
    socket.on('connect', () => {
      logStep(`Player ${playerNumber} connected`, 'SUCCESS');
      
      // Регистрируем игрока
      const playerData = {
        username: `test${playerNumber}`,
        email: `test${playerNumber}@cashflow.com`,
        password: 'password123'
      };
      
      socket.emit('register', playerData);
    });
    
    socket.on('registerSuccess', (data) => {
      logStep(`Player ${playerNumber} registered successfully`, 'SUCCESS');
      logResult(`Player ${playerNumber} data:`, { id: data.id, username: data.username });
      resolve(socket);
    });
    
    socket.on('registerError', (error) => {
      logStep(`Player ${playerNumber} registration failed: ${error}`, 'ERROR');
      reject(new Error(`Registration failed: ${error}`));
    });
    
    socket.on('connect_error', (error) => {
      logStep(`Player ${playerNumber} connection error: ${error.message}`, 'ERROR');
      reject(error);
    });
    
    // Таймаут для регистрации
    setTimeout(() => {
      reject(new Error(`Player ${playerNumber} registration timeout`));
    }, 10000);
  });
}

// Функция для создания комнаты
function createRoom(socket) {
  return new Promise((resolve, reject) => {
    logStep('Creating room...', 'INFO');
    
    const roomData = {
      roomId: `test_room_${Date.now()}`,
      maxPlayers: 2,
      displayName: 'Test Room for Game Launch'
    };
    
    socket.emit('createRoom', roomData.roomId, roomData.maxPlayers, null, 10, roomData.displayName);
    
    socket.on('roomCreated', (data) => {
      logStep('Room created successfully', 'SUCCESS');
      logResult('Room data:', data);
      createdRoomId = data.roomId;
      resolve(data.roomId);
    });
    
    socket.on('roomCreationError', (error) => {
      logStep(`Room creation failed: ${error}`, 'ERROR');
      reject(new Error(`Room creation failed: ${error}`));
    });
    
    // Таймаут для создания комнаты
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
    
    socket.on('roomJoined', (data) => {
      logStep(`Player ${playerNumber} joined room successfully`, 'SUCCESS');
      logResult(`Player ${playerNumber} room data:`, data);
      resolve(data);
    });
    
    socket.on('roomJoinError', (error) => {
      logStep(`Player ${playerNumber} failed to join room: ${error}`, 'ERROR');
      reject(new Error(`Room join failed: ${error}`));
    });
    
    // Таймаут для присоединения
    setTimeout(() => {
      reject(new Error(`Player ${playerNumber} join timeout`));
    }, 10000);
  });
}

// Функция для установки готовности
function setReady(socket, playerNumber) {
  return new Promise((resolve, reject) => {
    logStep(`Player ${playerNumber} setting ready...`, 'INFO');
    
    socket.emit('setReady', createdRoomId, true);
    
    socket.on('playersUpdate', (players) => {
      const player = players.find(p => p.socketId === socket.id);
      if (player && player.ready) {
        logStep(`Player ${playerNumber} ready state updated`, 'SUCCESS');
        logResult(`Player ${playerNumber} ready data:`, player);
        resolve(player);
      }
    });
    
    // Таймаут для готовности
    setTimeout(() => {
      reject(new Error(`Player ${playerNumber} ready timeout`));
    }, 10000);
  });
}

// Функция для запуска игры
function startGame(socket, roomId) {
  return new Promise((resolve, reject) => {
    logStep('Attempting to start game...', 'INFO');
    
    socket.emit('startGame', roomId, (success, error) => {
      if (success) {
        logStep('Game start request successful', 'SUCCESS');
        resolve(true);
      } else {
        logStep(`Game start request failed: ${error}`, 'ERROR');
        reject(new Error(`Game start failed: ${error}`));
      }
    });
    
    // Таймаут для запуска игры
    setTimeout(() => {
      reject(new Error('Game start timeout'));
    }, 10000);
  });
}

// Функция для ожидания запуска игры
function waitForGameStart(socket, playerNumber) {
  return new Promise((resolve, reject) => {
    logStep(`Player ${playerNumber} waiting for game start...`, 'INFO');
    
    socket.on('gameStarted', (data) => {
      logStep(`Player ${playerNumber} received gameStarted event`, 'SUCCESS');
      logResult(`Game started data:`, data);
      resolve(data);
    });
    
    socket.on('roomData', (data) => {
      if (data.status === 'started') {
        logStep(`Player ${playerNumber} received roomData with started status`, 'SUCCESS');
        logResult(`Room data:`, data);
        resolve(data);
      }
    });
    
    // Таймаут для ожидания запуска
    setTimeout(() => {
      reject(new Error(`Player ${playerNumber} game start wait timeout`));
    }, 15000);
  });
}

// Основная функция теста
async function runFullGameTest() {
  try {
    logStep('🚀 Starting full game launch test...', 'INFO');
    
    // Шаг 1: Создаем первого игрока
    logStep('Creating Player 1...', 'INFO');
    player1Socket = await createPlayer(1);
    
    // Шаг 2: Создаем второго игрока
    logStep('Creating Player 2...', 'INFO');
    player2Socket = await createPlayer(2);
    
    // Шаг 3: Первый игрок создает комнату
    logStep('Player 1 creating room...', 'INFO');
    await createRoom(player1Socket);
    
    // Шаг 4: Второй игрок присоединяется к комнате
    logStep('Player 2 joining room...', 'INFO');
    await joinRoom(player2Socket, createdRoomId, 2);
    
    // Шаг 5: Первый игрок присоединяется к комнате
    logStep('Player 1 joining room...', 'INFO');
    await joinRoom(player1Socket, createdRoomId, 1);
    
    // Шаг 6: Первый игрок устанавливает готовность
    logStep('Player 1 setting ready...', 'INFO');
    await setReady(player1Socket, 1);
    
    // Шаг 7: Второй игрок устанавливает готовность
    logStep('Player 2 setting ready...', 'INFO');
    await setReady(player2Socket, 2);
    
    // Шаг 8: Запускаем игру
    logStep('Starting game...', 'INFO');
    await startGame(player1Socket, createdRoomId);
    
    // Шаг 9: Ожидаем запуска игры для обоих игроков
    logStep('Waiting for game to start...', 'INFO');
    await Promise.all([
      waitForGameStart(player1Socket, 1),
      waitForGameStart(player2Socket, 2)
    ]);
    
    // Шаг 10: Тест завершен успешно
    logStep('🎉 FULL GAME LAUNCH TEST COMPLETED SUCCESSFULLY!', 'SUCCESS');
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
console.log('🎮 [FULL-GAME-LAUNCH-TEST] Starting in 3 seconds...');
setTimeout(() => {
  runFullGameTest();
}, 3000);
