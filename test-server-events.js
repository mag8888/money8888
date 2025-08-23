#!/usr/bin/env node

const io = require('socket.io-client');

console.log('🔍 [SERVER-EVENTS-TEST] Testing server event support...');

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
  
  // Тест 1: Проверяем базовые события
  logStep('🏠 Testing basic events...');
  
  // Запрашиваем список комнат
  socket.emit('getRoomsList');
  
  // Создаем тестовую комнату
  const testRoomId = `test_events_${Date.now()}`;
  logStep(`Creating test room: ${testRoomId}`);
  socket.emit('createRoom', testRoomId, 2, null, 10, 'Test Events Room');
  
  // Присоединяемся к комнате
  setTimeout(() => {
    logStep(`Joining test room: ${testRoomId}`);
    socket.emit('joinRoom', testRoomId);
  }, 2000);
  
  // Устанавливаем готовность
  setTimeout(() => {
    logStep('Setting ready state...');
    socket.emit('setReady', testRoomId, true);
  }, 4000);
  
  // Пытаемся запустить игру
  setTimeout(() => {
    logStep('Attempting to start game...');
    socket.emit('startGame', testRoomId);
  }, 6000);
});

// Слушаем все возможные события
socket.on('roomsList', (data) => {
  logStep('✅ Received roomsList event', { count: data.length });
});

socket.on('roomCreated', (data) => {
  logStep('✅ Received roomCreated event', data);
});

socket.on('roomCreationError', (error) => {
  logStep('❌ Received roomCreationError event', { error });
});

socket.on('roomJoined', (data) => {
  logStep('✅ Received roomJoined event', data);
});

socket.on('roomJoinError', (error) => {
  logStep('❌ Received roomJoinError event', { error });
});

socket.on('readyStateUpdated', (data) => {
  logStep('✅ Received readyStateUpdated event', data);
});

socket.on('gameStarted', (data) => {
  logStep('✅ Received gameStarted event', data);
});

socket.on('roomData', (data) => {
  logStep('✅ Received roomData event', data);
});

socket.on('playersList', (data) => {
  logStep('✅ Received playersList event', { count: data.length });
});

socket.on('turnChanged', (data) => {
  logStep('✅ Received turnChanged event', data);
});

socket.on('timerUpdate', (data) => {
  logStep('✅ Received timerUpdate event', data);
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
}, 15000);
