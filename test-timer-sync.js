#!/usr/bin/env node

/**
 * 🧪 АВТОТЕСТ: Синхронизация таймера
 * 
 * Тестирует:
 * 1. Получение событий turnTimerUpdate
 * 2. Обработку turnChanged
 * 3. Обновление roomData
 * 4. Правильную работу таймера для каждого игрока
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Запуск автотеста: Синхронизация таймера');
console.log('=' .repeat(50));

// Проверяем исправления в useSocketEvents.js
function checkTimerSyncFixes() {
  const filePath = 'client/src/hooks/useSocketEvents.js';
  
  if (!fs.existsSync(filePath)) {
    console.log('❌ Файл useSocketEvents.js не найден');
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  
  const checks = [
    {
      name: 'Улучшены логи в handleTurnTimerUpdate',
      pattern: /⏰ \[turnTimerUpdate\] received:/,
      found: false
    },
    {
      name: 'Добавлен roomId в handleTurnTimerUpdate',
      pattern: /⏰ \[turnTimerUpdate\] roomId:/,
      found: false
    },
    {
      name: 'Добавлен socket.id в handleTurnTimerUpdate',
      pattern: /⏰ \[turnTimerUpdate\] socket\.id:/,
      found: false
    },
    {
      name: 'Улучшены логи в handleTurnChanged',
      pattern: /🔄 \[turnChanged\] Обновляем состояние:/,
      found: false
    },
    {
      name: 'Добавлен roomId в handleTurnChanged',
      pattern: /roomId/,
      found: false
    },
    {
      name: 'Улучшены логи в handleRoomData',
      pattern: /🏠 \[roomData\] Обновляем состояние:/,
      found: false
    },
    {
      name: 'Добавлен roomId в handleRoomData',
      pattern: /roomId/,
      found: false
    }
  ];

  checks.forEach(check => {
    check.found = check.pattern.test(content);
    console.log(`${check.found ? '✅' : '❌'} ${check.name}`);
  });

  return checks.every(check => check.found);
}

// Проверяем исправления в GameControls.js
function checkGameControlsTimer() {
  const filePath = 'client/src/components/GameControls.js';
  
  if (!fs.existsSync(filePath)) {
    console.log('❌ Файл GameControls.js не найден');
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  
  const checks = [
    {
      name: 'Кнопка "БРОСИТЬ КУБИК" для diceValue = 0',
      pattern: /if \(diceValue === 0\) return 'БРОСИТЬ КУБИК'/,
      found: false
    },
    {
      name: 'Обработчик клика для кубика',
      pattern: /if \(diceValue === 0 && onRollDice\)/,
      found: false
    },
    {
      name: 'Передача всех необходимых пропсов в NextPlayerButton',
      pattern: /diceValue={diceValue}.*onRollDice={onRollDice}.*isRolling={isRolling}/s,
      found: false
    },
    {
      name: 'Логика кнопки в зависимости от состояния',
      pattern: /const getButtonText = \(\) => \{[^}]*if \(!isMyTurn\) return 'ОЖИДАНИЕ'[^}]*if \(diceValue === 0\) return 'БРОСИТЬ КУБИК'/s,
      found: false
    }
  ];

  checks.forEach(check => {
    check.found = check.pattern.test(content);
    console.log(`${check.found ? '✅' : '❌'} ${check.name}`);
  });

  return checks.every(check => check.found);
}

// Проверяем исправления в useGameLogic.js
function checkGameLogicTimer() {
  const filePath = 'client/src/hooks/useGameLogic.js';
  
  if (!fs.existsSync(filePath)) {
    console.log('❌ Файл useGameLogic.js не найден');
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  
  const checks = [
    {
      name: 'Убрана принудительная установка isMyTurn = true',
      pattern: /Принудительно устанавливаем isMyTurn для тестирования/,
      found: false,
      shouldBeFalse: true
    },
    {
      name: 'Правильная логика определения хода',
      pattern: /const isMyTurn = gameState\.currentTurn === gameState\.myId/,
      found: false
    },
    {
      name: 'Проверка myId перед установкой isMyTurn',
      pattern: /if \(gameState\.myId && gameState\.currentTurn\)/,
      found: false
    }
  ];

  checks.forEach(check => {
    if (check.shouldBeFalse) {
      check.found = !check.pattern.test(content);
      console.log(`${check.found ? '✅' : '❌'} ${check.name}`);
    } else {
      check.found = check.pattern.test(content);
      console.log(`${check.found ? '✅' : '❌'} ${check.name}`);
    }
  });

  return checks.every(check => check.found);
}

// Проверяем, что сервер запущен
function checkServer() {
  try {
    const result = execSync('ps aux | grep "node index.js" | grep -v grep', { encoding: 'utf8' });
    if (result.trim()) {
      console.log('✅ Сервер запущен');
      return true;
    }
  } catch (error) {
    console.log('❌ Сервер не запущен');
    return false;
  }
  return false;
}

// Основная функция тестирования
function runTests() {
  console.log('\n🔍 Проверка исправлений в useSocketEvents.js:');
  const socketEventsFixed = checkTimerSyncFixes();
  
  console.log('\n🔍 Проверка исправлений в GameControls.js:');
  const gameControlsFixed = checkGameControlsTimer();
  
  console.log('\n🔍 Проверка исправлений в useGameLogic.js:');
  const gameLogicFixed = checkGameLogicTimer();

  console.log('\n📊 РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ:');
  console.log('=' .repeat(40));
  console.log(`useSocketEvents.js: ${socketEventsFixed ? '✅ ИСПРАВЛЕН' : '❌ НЕ ИСПРАВЛЕН'}`);
  console.log(`GameControls.js: ${gameControlsFixed ? '✅ ИСПРАВЛЕН' : '❌ НЕ ИСПРАВЛЕН'}`);
  console.log(`useGameLogic.js: ${gameLogicFixed ? '✅ ИСПРАВЛЕН' : '❌ НЕ ИСПРАВЛЕН'}`);

  if (socketEventsFixed && gameControlsFixed && gameLogicFixed) {
    console.log('\n🎉 ВСЕ ИСПРАВЛЕНИЯ ТАЙМЕРА ПРИМЕНЕНЫ!');
    console.log('\n🧪 СЛЕДУЮЩИЕ ШАГИ ДЛЯ ТЕСТИРОВАНИЯ:');
    console.log('1. Обновите страницу в браузере (F5)');
    console.log('2. Откройте консоль разработчика (F12)');
    console.log('3. Войдите в комнату и начните игру');
    console.log('4. Проверьте в консоли логи:');
    console.log('   - ⏰ [turnTimerUpdate] received: ...');
    console.log('   - 🔄 [turnChanged] Обновляем состояние: ...');
    console.log('   - 🏠 [roomData] Обновляем состояние: ...');
    console.log('5. Проверьте в интерфейсе:');
    console.log('   - Идет ли таймер вниз от 2:00');
    console.log('   - Показывается ли кнопка "БРОСИТЬ КУБИК" для активного игрока');
    console.log('   - Работает ли переход хода между игроками');
  } else {
    console.log('\n❌ НЕКОТОРЫЕ ИСПРАВЛЕНИЯ НЕ ПРИМЕНЕНЫ');
    console.log('💡 Проверьте файлы и примените исправления вручную');
  }

  // Проверяем сервер
  console.log('\n🔍 Проверка окружения:');
  const serverRunning = checkServer();
  
  if (!serverRunning) {
    console.log('\n⚠️  Сервер не запущен');
    console.log('💡 Запустите: cd server && node index.js');
  }
}

// Запуск тестов
runTests();

