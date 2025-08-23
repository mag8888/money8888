#!/usr/bin/env node

const io = require('socket.io-client');

console.log('🔍 [CLIENT-DETAILED-TEST] Detailed client testing...');

// Подключаемся к серверу
const socket = io('http://localhost:5000');

let testStep = 0;

function logStep(message, data = null) {
  testStep++;
  console.log(`\n📋 [STEP ${testStep}] ${message}`);
  if (data) {
    console.log('📊 Data:', JSON.stringify(data, null, 2));
  }
}

socket.on('connect', () => {
  logStep('✅ Connected to server');
  
  // Шаг 1: Запрашиваем список комнат
  logStep('🏠 Requesting rooms list...');
  socket.emit('getRoomsList');
});

socket.on('roomsList', (roomsList) => {
  logStep('🏠 Received rooms list from server', {
    totalRooms: roomsList.length,
    firstRoom: roomsList[0],
    secondRoom: roomsList[1],
    lastRoom: roomsList[roomsList.length - 1]
  });
  
  // Шаг 2: Проверяем структуру данных
  if (roomsList.length > 0) {
    const room = roomsList[0];
    logStep('🔍 Analyzing first room structure', {
      roomId: room.roomId,
      displayName: room.displayName,
      currentPlayers: room.currentPlayers,
      hasCurrentPlayers: room.hasOwnProperty('currentPlayers'),
      currentPlayersType: typeof room.currentPlayers,
      isArray: Array.isArray(room.currentPlayers),
      playersCount: Array.isArray(room.currentPlayers) ? room.currentPlayers.length : 'N/A',
      maxPlayers: room.maxPlayers,
      status: room.status
    });
    
    // Шаг 3: Проверяем игроков
    if (Array.isArray(room.currentPlayers) && room.currentPlayers.length > 0) {
      const player = room.currentPlayers[0];
      logStep('👤 Analyzing first player', {
        playerId: player.id,
        username: player.username,
        ready: player.ready,
        offline: player.offline,
        hasUsername: player.hasOwnProperty('username'),
        usernameType: typeof player.username
      });
    }
  }
  
  // Шаг 4: Проверяем все комнаты на валидность
  const validRooms = roomsList.filter(room => {
    return room && 
           room.roomId && 
           room.displayName && 
           Array.isArray(room.currentPlayers);
  });
  
  logStep('✅ Validation results', {
    totalRooms: roomsList.length,
    validRooms: validRooms.length,
    invalidRooms: roomsList.length - validRooms.length,
    validationSuccess: validRooms.length === roomsList.length
  });
  
  // Шаг 5: Проверяем проблемные комнаты
  const invalidRooms = roomsList.filter(room => {
    return !room || 
           !room.roomId || 
           !room.displayName || 
           !Array.isArray(room.currentPlayers);
  });
  
  if (invalidRooms.length > 0) {
    logStep('❌ Found invalid rooms', {
      count: invalidRooms.length,
      examples: invalidRooms.slice(0, 3)
    });
  }
  
  logStep('🎯 Test completed successfully');
});

socket.on('disconnect', () => {
  logStep('❌ Disconnected from server');
});

socket.on('connect_error', (error) => {
  logStep('❌ Connection error', { error: error.message });
});

// Таймаут для завершения теста
setTimeout(() => {
  logStep('⏰ Test timeout reached');
  socket.disconnect();
  process.exit(0);
}, 10000);
