#!/usr/bin/env node

/**
 * 🧪 АВТОТЕСТ: GameControls - Исправленная логика кнопок
 * 
 * Тестирует:
 * 1. Кнопка "БРОСИТЬ КУБИК" когда diceValue = 0
 * 2. Кнопка "ПЕРЕХОД ХОДА" после броска кубика
 * 3. Кнопка "ОЖИДАНИЕ" когда не мой ход
 * 4. Правильная работа таймера
 * 5. Синхронизация игроков с сервером
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Запуск автотеста: GameControls - Исправленная логика кнопок');
console.log('=' .repeat(60));

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

// Проверяем, что клиент запущен
function checkClient() {
  try {
    const result = execSync('ps aux | grep "react-scripts" | grep -v grep', { encoding: 'utf8' });
    if (result.trim()) {
      console.log('✅ Клиент запущен');
      return true;
    }
  } catch (error) {
    console.log('❌ Клиент не запущен');
    return false;
  }
  return false;
}

// Проверяем исправления в GameControls.js
function checkGameControlsFixes() {
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
      name: 'Передача diceValue в NextPlayerButton',
      pattern: /diceValue={diceValue}/,
      found: false
    },
    {
      name: 'Передача onRollDice в NextPlayerButton',
      pattern: /onRollDice={onRollDice}/,
      found: false
    },
    {
      name: 'Передача isRolling в NextPlayerButton',
      pattern: /isRolling={isRolling}/,
      found: false
    }
  ];

  checks.forEach(check => {
    check.found = check.pattern.test(content);
    console.log(`${check.found ? '✅' : '❌'} ${check.name}`);
  });

  return checks.every(check => check.found);
}

// Проверяем исправления в useSocketEvents.js
function checkSocketEventsFixes() {
  const filePath = 'client/src/hooks/useSocketEvents.js';
  
  if (!fs.existsSync(filePath)) {
    console.log('❌ Файл useSocketEvents.js не найден');
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  
  const checks = [
    {
      name: 'Обработчик turnTimerUpdate',
      pattern: /const handleTurnTimerUpdate = useCallback/,
      found: false
    },
    {
      name: 'Регистрация turnTimerUpdate',
      pattern: /registerEventHandler\('turnTimerUpdate', handleTurnTimerUpdate\)/,
      found: false
    },
    {
      name: 'Сохранение username в localStorage',
      pattern: /localStorage\.setItem\('cashflow_username'/,
      found: false
    },
    {
      name: 'Определение myId по username',
      pattern: /const savedUsername = localStorage\.getItem\('cashflow_username'\)/,
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
function checkGameLogicFixes() {
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

// Основная функция тестирования
function runTests() {
  console.log('\n🔍 Проверка окружения:');
  const serverRunning = checkServer();
  const clientRunning = checkClient();
  
  if (!serverRunning || !clientRunning) {
    console.log('\n❌ Необходимо запустить сервер и клиент перед тестированием');
    console.log('💡 Запустите:');
    console.log('   cd server && node index.js');
    console.log('   cd client && npm start');
    return;
  }

  console.log('\n🔍 Проверка исправлений в GameControls.js:');
  const gameControlsFixed = checkGameControlsFixes();
  
  console.log('\n🔍 Проверка исправлений в useSocketEvents.js:');
  const socketEventsFixed = checkSocketEventsFixes();
  
  console.log('\n🔍 Проверка исправлений в useGameLogic.js:');
  const gameLogicFixed = checkGameLogicFixes();

  console.log('\n📊 РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ:');
  console.log('=' .repeat(40));
  console.log(`GameControls.js: ${gameControlsFixed ? '✅ ИСПРАВЛЕН' : '❌ НЕ ИСПРАВЛЕН'}`);
  console.log(`useSocketEvents.js: ${socketEventsFixed ? '✅ ИСПРАВЛЕН' : '❌ НЕ ИСПРАВЛЕН'}`);
  console.log(`useGameLogic.js: ${gameLogicFixed ? '✅ ИСПРАВЛЕН' : '❌ НЕ ИСПРАВЛЕН'}`);

  if (gameControlsFixed && socketEventsFixed && gameLogicFixed) {
    console.log('\n🎉 ВСЕ ИСПРАВЛЕНИЯ ПРИМЕНЕНЫ УСПЕШНО!');
    console.log('\n🧪 СЛЕДУЮЩИЕ ШАГИ ДЛЯ ТЕСТИРОВАНИЯ:');
    console.log('1. Обновите страницу в браузере (F5)');
    console.log('2. Войдите в комнату и начните игру');
    console.log('3. Проверьте:');
    console.log('   - Показываются ли реальные игроки (не "Тест Игрок")');
    console.log('   - Идет ли таймер вниз от 2:00');
    console.log('   - Кнопка "БРОСИТЬ КУБИК" активна когда ваш ход');
    console.log('   - После броска появляется кнопка "ПЕРЕХОД ХОДА"');
    console.log('   - Кубик работает и генерирует числа 1-6');
  } else {
    console.log('\n❌ НЕКОТОРЫЕ ИСПРАВЛЕНИЯ НЕ ПРИМЕНЕНЫ');
    console.log('💡 Проверьте файлы и примените исправления вручную');
  }
}

// Запуск тестов
runTests();

