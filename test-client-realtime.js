#!/usr/bin/env node

const io = require('socket.io-client');

console.log('🧪 [CLIENT-REALTIME-TEST] Testing client in real-time...');

// Подключаемся к серверу
const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('✅ [CLIENT-REALTIME-TEST] Connected to server');
  
  // Запрашиваем список комнат
  console.log('🏠 [CLIENT-REALTIME-TEST] Requesting rooms list...');
  socket.emit('getRoomsList');
});

socket.on('roomsList', (roomsList) => {
  console.log('🏠 [CLIENT-REALTIME-TEST] Received rooms list:', {
    totalRooms: roomsList.length,
    firstRoom: roomsList[0],
    sampleRooms: roomsList.slice(0, 3)
  });
  
  // Проверяем структуру данных
  if (roomsList.length > 0) {
    const room = roomsList[0];
    console.log('🔍 [CLIENT-REALTIME-TEST] Room structure:', {
      roomId: room.roomId,
      displayName: room.displayName,
      currentPlayers: room.currentPlayers,
      hasPlayers: Array.isArray(room.currentPlayers),
      playersCount: Array.isArray(room.currentPlayers) ? room.currentPlayers.length : 'N/A'
    });
  }
  
  console.log('✅ [CLIENT-REALTIME-TEST] Rooms data received successfully');
});

socket.on('disconnect', () => {
  console.log('❌ [CLIENT-REALTIME-TEST] Disconnected from server');
});

socket.on('connect_error', (error) => {
  console.error('❌ [CLIENT-REALTIME-TEST] Connection error:', error.message);
});

// Таймаут для завершения теста
setTimeout(() => {
  console.log('⏰ [CLIENT-REALTIME-TEST] Test timeout reached');
  socket.disconnect();
  process.exit(0);
}, 5000);
