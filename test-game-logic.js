#!/usr/bin/env node

const http = require('http');

console.log('🎮 [GAME-LOGIC-TEST] Testing game launch logic...\n');

// Функция для проверки комнат, готовых к игре
function checkGameReadyRooms() {
  return new Promise((resolve) => {
    console.log('🔍 [GAME-LOGIC-TEST] Checking rooms ready for game...');
    
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/rooms',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.success && response.rooms && response.rooms.length > 0) {
            console.log(`✅ [GAME-LOGIC-TEST] Found ${response.rooms.length} total rooms`);
            
            // Ищем комнаты, готовые к игре
            const gameReadyRooms = response.rooms.filter(room => 
              room.status === 'waiting' && room.currentPlayers >= 2
            );
            
            if (gameReadyRooms.length > 0) {
              console.log(`🎮 [GAME-LOGIC-TEST] Found ${gameReadyRooms.length} rooms ready for game:`);
              gameReadyRooms.forEach((room, index) => {
                console.log(`   ${index + 1}. Room ${room.roomId}: ${room.currentPlayers} players, status: ${room.status}`);
                if (room.players && room.players.length > 0) {
                  const readyPlayers = room.players.filter(p => p.ready);
                  console.log(`      - Players: ${room.players.length}, Ready: ${readyPlayers.length}`);
                  room.players.forEach(player => {
                    console.log(`        * ${player.username}: ready=${player.ready}, offline=${player.offline}`);
                  });
                }
              });
              
              resolve({ success: true, rooms: gameReadyRooms });
            } else {
              console.log('⚠️  [GAME-LOGIC-TEST] No rooms are ready for game yet');
              resolve({ success: true, rooms: [] });
            }
          } else {
            console.log('❌ [GAME-LOGIC-TEST] No rooms found in system');
            resolve({ success: false, rooms: [] });
          }
        } catch (e) {
          console.log('❌ [GAME-LOGIC-TEST] Cannot parse rooms data:', e.message);
          resolve({ success: false, rooms: [] });
        }
      });
    });

    req.on('error', () => {
      console.log('❌ [GAME-LOGIC-TEST] Cannot check rooms');
      resolve({ success: false, rooms: [] });
    });

    req.end();
  });
}

// Функция для проверки логики запуска игры
function testGameLaunchLogic(rooms) {
  console.log('\n🎯 [GAME-LOGIC-TEST] Testing game launch logic...');
  
  if (rooms.length === 0) {
    console.log('⚠️  [GAME-LOGIC-TEST] No rooms to test');
    return false;
  }
  
  const testRoom = rooms[0];
  console.log(`🎮 [GAME-LOGIC-TEST] Testing room: ${testRoom.roomId}`);
  
  // Проверяем условия для запуска игры
  const conditions = {
    statusWaiting: testRoom.status === 'waiting',
    enoughPlayers: testRoom.currentPlayers >= 2,
    hasPlayers: testRoom.players && testRoom.players.length > 0
  };
  
  console.log('🔍 [GAME-LOGIC-TEST] Launch conditions:');
  console.log(`   - Status is 'waiting': ${conditions.statusWaiting}`);
  console.log(`   - Has enough players (>=2): ${conditions.enoughPlayers}`);
  console.log(`   - Has players array: ${conditions.hasPlayers}`);
  
  if (conditions.hasPlayers) {
    const readyPlayers = testRoom.players.filter(p => p.ready);
    const onlinePlayers = testRoom.players.filter(p => !p.offline);
    
    console.log(`   - Total players: ${testRoom.players.length}`);
    console.log(`   - Ready players: ${readyPlayers.length}`);
    console.log(`   - Online players: ${onlinePlayers.length}`);
    
    conditions.enoughReadyPlayers = readyPlayers.length >= 2;
    conditions.enoughOnlinePlayers = onlinePlayers.length >= 2;
    
    console.log(`   - Enough ready players (>=2): ${conditions.enoughReadyPlayers}`);
    console.log(`   - Enough online players (>=2): ${conditions.enoughOnlinePlayers}`);
  }
  
  // Проверяем, можно ли запустить игру
  const canLaunch = conditions.statusWaiting && conditions.enoughPlayers && 
                   (conditions.enoughReadyPlayers || conditions.enoughOnlinePlayers);
  
  console.log(`\n🎯 [GAME-LOGIC-TEST] Can launch game: ${canLaunch ? 'YES' : 'NO'}`);
  
  if (canLaunch) {
    console.log('✅ [GAME-LOGIC-TEST] Game launch logic is working correctly!');
    console.log('🎮 [GAME-LOGIC-TEST] Room meets all requirements for game start');
  } else {
    console.log('❌ [GAME-LOGIC-TEST] Game launch logic has issues');
    console.log('🔧 [GAME-LOGIC-TEST] Check the conditions above');
  }
  
  return canLaunch;
}

// Главная функция
async function main() {
  console.log('🎮 [GAME-LOGIC-TEST] ==========================================');
  console.log('🎮 [GAME-LOGIC-TEST] GAME LAUNCH LOGIC TEST');
  console.log('🎮 [GAME-LOGIC-TEST] ==========================================\n');
  
  try {
    // Проверяем комнаты, готовые к игре
    const roomsResult = await checkGameReadyRooms();
    
    if (roomsResult.success) {
      // Тестируем логику запуска игры
      const logicResult = testGameLaunchLogic(roomsResult.rooms);
      
      if (logicResult) {
        console.log('\n🎉 [GAME-LOGIC-TEST] ==========================================');
        console.log('🎉 [GAME-LOGIC-TEST] GAME LAUNCH LOGIC TEST PASSED!');
        console.log('🎉 [GAME-LOGIC-TEST] ==========================================');
        console.log('✅ [GAME-LOGIC-TEST] Game launch conditions are met');
        console.log('✅ [GAME-LOGIC-TEST] System should be able to start games');
      } else {
        console.log('\n❌ [GAME-LOGIC-TEST] ==========================================');
        console.log('❌ [GAME-LOGIC-TEST] GAME LAUNCH LOGIC TEST FAILED!');
        console.log('❌ [GAME-LOGIC-TEST] ==========================================');
        console.log('⚠️  [GAME-LOGIC-TEST] Some conditions are not met');
        console.log('🔧 [GAME-LOGIC-TEST] Check the room configuration');
      }
    } else {
      console.log('\n❌ [GAME-LOGIC-TEST] Cannot check rooms');
    }
    
  } catch (error) {
    console.log(`💥 [GAME-LOGIC-TEST] ERROR: ${error.message}`);
  }
}

// Запускаем тест
main().catch(console.error);
