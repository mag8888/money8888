#!/usr/bin/env node

const http = require('http');

console.log('🧪 [CLIENT-TEST] Testing client room display...');

// Тест 1: Проверяем API
function testAPI() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:5000/api/admin/rooms', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log('✅ [API-TEST] API response:', {
            success: parsed.success,
            totalRooms: parsed.totalRooms,
            firstRoom: parsed.rooms[0]
          });
          resolve(parsed);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
  });
}

// Тест 2: Проверяем главную страницу
function testMainPage() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:5000/', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const hasReact = data.includes('react');
        const hasDiv = data.includes('<div id="root">');
        console.log('✅ [PAGE-TEST] Main page:', {
          status: res.statusCode,
          hasReact,
          hasDiv,
          length: data.length
        });
        resolve({ status: res.statusCode, hasReact, hasDiv });
      });
    });
    req.on('error', reject);
  });
}

async function runTests() {
  try {
    console.log('\n🔍 [CLIENT-TEST] Running tests...\n');
    
    await testAPI();
    await testMainPage();
    
    console.log('\n✅ [CLIENT-TEST] All tests completed!');
    console.log('\n📋 [CLIENT-TEST] Next steps:');
    console.log('1. Откройте http://localhost:5000 в браузере');
    console.log('2. Откройте консоль разработчика (F12)');
    console.log('3. Найдите логи "🏠 [SimpleRoomSelection] Valid rooms:"');
    console.log('4. Если массив пустой - проблема в фильтрации');
    console.log('5. Если массив не пустой - проблема в рендеринге');
    
  } catch (error) {
    console.error('❌ [CLIENT-TEST] Test failed:', error.message);
  }
}

runTests();
