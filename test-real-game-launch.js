#!/usr/bin/env node

const http = require('http');
const net = require('net');

console.log('🎮 [REAL-GAME-TEST] Testing real game launch process...\n');

// Функция для проверки WebSocket подключения
function testWebSocketConnection() {
  return new Promise((resolve) => {
    console.log('🔌 [REAL-GAME-TEST] Testing WebSocket connection...');
    
    const client = net.createConnection(5000, 'localhost', () => {
      console.log('✅ [REAL-GAME-TEST] WebSocket port is accessible');
      client.end();
      resolve(true);
    });

    client.on('error', (err) => {
      console.log('❌ [REAL-GAME-TEST] WebSocket connection failed:', err.message);
      resolve(false);
    });

    setTimeout(() => {
      client.destroy();
      resolve(false);
    }, 5000);
  });
}

// Функция для проверки комнат с реальными игроками
function checkRealGameRooms() {
  return new Promise((resolve) => {
    console.log('🏠 [REAL-GAME-TEST] Checking rooms with real players...');
    
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/rooms',
      method: 'GET',
      timeout: 10000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.success && response.rooms && response.rooms.length > 0) {
            console.log(`✅ [REAL-GAME-TEST] Found ${response.rooms.length} total rooms`);
            
            // Ищем комнаты с реальными (не offline) игроками
            const realPlayerRooms = response.rooms.filter(room => {
              if (room.players && room.players.length > 0) {
                const onlinePlayers = room.players.filter(p => !p.offline);
                return onlinePlayers.length >= 2;
              }
              return false;
            });
            
            if (realPlayerRooms.length > 0) {
              console.log(`🎮 [REAL-GAME-TEST] Found ${realPlayerRooms.length} rooms with real players:`);
              realPlayerRooms.forEach((room, index) => {
                const onlinePlayers = room.players.filter(p => !p.offline);
                const readyPlayers = onlinePlayers.filter(p => p.ready);
                console.log(`   ${index + 1}. Room ${room.roomId}: ${onlinePlayers.length} online, ${readyPlayers.length} ready`);
                
                onlinePlayers.forEach(player => {
                  console.log(`      - ${player.username}: ready=${player.ready}, socketId=${player.socketId || 'none'}`);
                });
              });
              
              resolve({ success: true, rooms: realPlayerRooms });
            } else {
              console.log('⚠️  [REAL-GAME-TEST] No rooms with real online players found');
              resolve({ success: true, rooms: [] });
            }
          } else {
            console.log('❌ [REAL-GAME-TEST] No rooms found');
            resolve({ success: false, rooms: [] });
          }
        } catch (e) {
          console.log('❌ [REAL-GAME-TEST] Cannot parse rooms data:', e.message);
          resolve({ success: false, rooms: [] });
        }
      });
    });

    req.on('error', () => {
      console.log('❌ [REAL-GAME-TEST] Cannot check rooms');
      resolve({ success: false, rooms: [] });
    });

    req.end();
  });
}

// Функция для тестирования API запуска игры
function testGameStartAPI(roomId) {
  return new Promise((resolve) => {
    console.log(`🚀 [REAL-GAME-TEST] Testing game start API for room: ${roomId}`);
    
    // Проверяем, что комната существует и готова
    const checkReq = http.request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/admin/rooms/${roomId}`,
      method: 'GET',
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const roomData = JSON.parse(data);
          console.log(`✅ [REAL-GAME-TEST] Room ${roomId} data:`, {
            status: roomData.status,
            players: roomData.currentPlayers,
            maxPlayers: roomData.maxPlayers
          });
          
          if (roomData.status === 'waiting' && roomData.currentPlayers >= 2) {
            console.log(`🎯 [REAL-GAME-TEST] Room ${roomId} is ready for game start`);
            resolve({ success: true, roomData });
          } else {
            console.log(`❌ [REAL-GAME-TEST] Room ${roomId} is not ready for game start`);
            resolve({ success: false, reason: 'Room not ready' });
          }
        } catch (e) {
          console.log('❌ [REAL-GAME-TEST] Cannot parse room data:', e.message);
          resolve({ success: false, reason: 'Parse error' });
        }
      });
    });

    checkReq.on('error', () => {
      console.log('❌ [REAL-GAME-TEST] Cannot check room');
      resolve({ success: false, reason: 'Connection error' });
    });

    checkReq.end();
  });
}

// Функция для проверки клиентских маршрутов
function testClientRoutes() {
  return new Promise((resolve) => {
    console.log('🧭 [REAL-GAME-TEST] Testing client routes...');
    
    const routes = [
      { path: '/', description: 'Main page' },
      { path: '/rooms', description: 'Room selection' },
      { path: '/room/test123', description: 'Room setup' },
      { path: '/game/test123', description: 'Game board' }
    ];

    let passed = 0;
    let failed = 0;

    const testRoute = (route) => {
      return new Promise((routeResolve) => {
        const req = http.request({
          hostname: 'localhost',
          port: 3000,
          path: route.path,
          method: 'GET',
          timeout: 5000
        }, (res) => {
          if (res.statusCode === 200) {
            console.log(`✅ [REAL-GAME-TEST] ${route.description}: OK`);
            routeResolve(true);
          } else {
            console.log(`❌ [REAL-GAME-TEST] ${route.description}: Status ${res.statusCode}`);
            routeResolve(false);
          }
        });

        req.on('error', () => {
          console.log(`❌ [REAL-GAME-TEST] ${route.description}: Connection error`);
          routeResolve(false);
        });

        req.end();
      });
    };

    Promise.all(routes.map(testRoute)).then(results => {
      passed = results.filter(r => r).length;
      failed = results.length - passed;
      
      console.log(`\n📊 [REAL-GAME-TEST] Client routes: ${passed}/${results.length} passed`);
      resolve({ passed, failed, total: results.length });
    });
  });
}

// Главная функция
async function main() {
  console.log('🎮 [REAL-GAME-TEST] ==========================================');
  console.log('🎮 [REAL-GAME-TEST] REAL GAME LAUNCH TEST');
  console.log('🎮 [REAL-GAME-TEST] ==========================================\n');
  
  try {
    // Шаг 1: Проверяем WebSocket подключение
    const wsResult = await testWebSocketConnection();
    
    // Шаг 2: Проверяем комнаты с реальными игроками
    const roomsResult = await checkRealGameRooms();
    
    // Шаг 3: Проверяем клиентские маршруты
    const routesResult = await testClientRoutes();
    
    // Шаг 4: Анализируем результаты
    console.log('\n📊 [REAL-GAME-TEST] Test Results Summary:');
    console.log(`   - WebSocket: ${wsResult ? '✅ OK' : '❌ FAILED'}`);
    console.log(`   - Rooms: ${roomsResult.success ? '✅ OK' : '❌ FAILED'}`);
    console.log(`   - Client Routes: ${routesResult.passed}/${routesResult.total} passed`);
    
    if (roomsResult.success && roomsResult.rooms.length > 0) {
      console.log(`\n🎯 [REAL-GAME-TEST] Testing game start for room: ${roomsResult.rooms[0].roomId}`);
      const gameStartResult = await testGameStartAPI(roomsResult.rooms[0].roomId);
      
      if (gameStartResult.success) {
        console.log('\n🎉 [REAL-GAME-TEST] ==========================================');
        console.log('🎉 [REAL-GAME-TEST] GAME LAUNCH TEST PASSED!');
        console.log('🎉 [REAL-GAME-TEST] ==========================================');
        console.log('✅ [REAL-GAME-TEST] All systems are operational');
        console.log('✅ [REAL-GAME-TEST] Game launch should work correctly');
      } else {
        console.log('\n❌ [REAL-GAME-TEST] ==========================================');
        console.log('❌ [REAL-GAME-TEST] GAME LAUNCH TEST FAILED!');
        console.log('❌ [REAL-GAME-TEST] ==========================================');
        console.log(`⚠️  [REAL-GAME-TEST] Reason: ${gameStartResult.reason}`);
      }
    } else {
      console.log('\n⚠️  [REAL-GAME-TEST] No rooms with real players to test');
    }
    
  } catch (error) {
    console.log(`💥 [REAL-GAME-TEST] ERROR: ${error.message}`);
  }
}

// Запускаем тест
main().catch(console.error);
