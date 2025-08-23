#!/usr/bin/env node

const http = require('http');

console.log('🧭 [NAVIGATION-TEST] Testing navigation between components...\n');

// Функция для проверки доступности маршрутов
function testRoute(port, path, description) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: port,
      path: path,
      method: 'GET',
      timeout: 5000
    }, (res) => {
      if (res.statusCode === 200) {
        resolve({ success: true, message: `✅ ${description}: PASSED - Status: ${res.statusCode}` });
      } else {
        resolve({ success: false, message: `❌ ${description}: FAILED - Status: ${res.statusCode}` });
      }
    });

    req.on('error', () => {
      resolve({ success: false, message: `❌ ${description}: FAILED - Connection error` });
    });

    req.on('timeout', () => {
      resolve({ success: false, message: `❌ ${description}: FAILED - Timeout` });
    });

    req.end();
  });
}

// Функция для проверки всех маршрутов
async function testAllRoutes() {
  console.log('🔍 [NAVIGATION-TEST] Testing all application routes...\n');

  const routes = [
    { path: '/', description: 'Main page (auth)' },
    { path: '/rooms', description: 'Room selection page' },
    { path: '/room/test123', description: 'Room setup page' },
    { path: '/game/test123', description: 'Game board page' },
    { path: '/ratings', description: 'Ratings page' }
  ];

  let passed = 0;
  let failed = 0;

  for (const route of routes) {
    console.log(`⏳ [NAVIGATION-TEST] Testing: ${route.description}...`);
    const result = await testRoute(3000, route.path, route.description);
    console.log(result.message);
    
    if (result.success) {
      passed++;
    } else {
      failed++;
    }
    console.log('');
  }

  // Выводим итоговые результаты
  console.log('📊 [NAVIGATION-TEST] Route Test Results:');
  console.log(`✅ Passed: ${passed}/${routes.length}`);
  console.log(`❌ Failed: ${failed}/${routes.length}`);
  
  if (failed === 0) {
    console.log('🎉 [NAVIGATION-TEST] ALL ROUTES ARE ACCESSIBLE!');
    console.log('🧭 [NAVIGATION-TEST] Navigation should work correctly.');
  } else {
    console.log('⚠️  [NAVIGATION-TEST] Some routes are not accessible.');
    console.log('🔧 [NAVIGATION-TEST] This may cause navigation issues.');
  }
}

// Функция для проверки API endpoints
async function testAPIEndpoints() {
  console.log('\n🔍 [NAVIGATION-TEST] Testing API endpoints...\n');

  const endpoints = [
    { path: '/api/health', description: 'Server health check' },
    { path: '/api/admin/rooms', description: 'Rooms list' }
  ];

  let passed = 0;
  let failed = 0;

  for (const endpoint of endpoints) {
    console.log(`⏳ [NAVIGATION-TEST] Testing: ${endpoint.description}...`);
    const result = await testRoute(5000, endpoint.path, endpoint.description);
    console.log(result.message);
    
    if (result.success) {
      passed++;
    } else {
      failed++;
    }
    console.log('');
  }

  console.log('📊 [NAVIGATION-TEST] API Test Results:');
  console.log(`✅ Passed: ${passed}/${endpoints.length}`);
  console.log(`❌ Failed: ${failed}/${endpoints.length}`);
}

// Главная функция
async function main() {
  console.log('🧭 [NAVIGATION-TEST] ==========================================');
  console.log('🧭 [NAVIGATION-TEST] NAVIGATION TESTING');
  console.log('🧭 [NAVIGATION-TEST] ==========================================\n');
  
  // Проверяем маршруты
  await testAllRoutes();
  
  // Проверяем API
  await testAPIEndpoints();
  
  console.log('\n🧭 [NAVIGATION-TEST] ==========================================');
  console.log('🧭 [NAVIGATION-TEST] NAVIGATION TEST COMPLETED');
  console.log('🧭 [NAVIGATION-TEST] ==========================================');
}

// Запускаем тест
main().catch(console.error);
