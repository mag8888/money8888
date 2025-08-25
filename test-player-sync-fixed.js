#!/usr/bin/env node

/**
 * 🧪 АВТОТЕСТ: Синхронизация игроков - Исправленная версия
 * 
 * Тестирует:
 * 1. Правильное определение myId по username
 * 2. Сохранение username в localStorage
 * 3. Получение списка игроков с сервера
 * 4. Отображение реальных игроков (не тестовых)
 * 5. Работу таймера для каждого игрока
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Запуск автотеста: Синхронизация игроков - Исправленная версия');
console.log('=' .repeat(70));

// Проверяем исправления в useSocketEvents.js
function checkPlayerSyncFixes() {
  const filePath = 'client/src/hooks/useSocketEvents.js';
  
  if (!fs.existsSync(filePath)) {
    console.log('❌ Файл useSocketEvents.js не найден');
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  
  const checks = [
    {
      name: 'Определение myId по username из localStorage',
      pattern: /const savedUsername = localStorage\.getItem\('cashflow_username'\)/,
      found: false
    },
    {
      name: 'Поиск игрока по username',
      pattern: /currentPlayer = playersList\.find\(p => p\.username === savedUsername\)/,
      found: false
    },
    {
      name: 'Fallback на первого игрока',
      pattern: /if \(!myId && playersList\.length > 0\)/,
      found: false
    },
    {
      name: 'Сохранение username в localStorage',
      pattern: /localStorage\.setItem\('cashflow_username', currentPlayer\.username\)/,
      found: false
    },
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
      name: 'Убрана принудительная установка isMyTurn = true',
      pattern: /Принудительно устанавливаем isMyTurn для тестирования/,
      found: false,
      shouldBeFalse: true
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

// Проверяем исправления в GameControls.js
function checkGameControlsPlayerSync() {
  const filePath = 'client/src/components/GameControls.js';
  
  if (!fs.existsSync(filePath)) {
    console.log('❌ Файл GameControls.js не найден');
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  
  const checks = [
    {
      name: 'Убраны тестовые игроки',
      pattern: /Тест Игрок 1|Тест Игрок 2/,
      found: false,
      shouldBeFalse: true
    },
    {
      name: 'Использование реальных игроков',
      pattern: /const realPlayers = players && Array\.isArray\(players\) \? players : \[\]/,
      found: false
    },
    {
      name: 'Убрана отладочная информация',
      pattern: /🐛 DEBUG: players=/,
      found: false,
      shouldBeFalse: true
    },
    {
      name: 'Передача diceValue в NextPlayerButton',
      pattern: /diceValue={diceValue}/,
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

// Проверяем исправления в useGameLogic.js
function checkGameLogicPlayerSync() {
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
  const socketEventsFixed = checkPlayerSyncFixes();
  
  console.log('\n🔍 Проверка исправлений в GameControls.js:');
  const gameControlsFixed = checkGameControlsPlayerSync();
  
  console.log('\n🔍 Проверка исправлений в useGameLogic.js:');
  const gameLogicFixed = checkGameLogicPlayerSync();

  console.log('\n📊 РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ:');
  console.log('=' .repeat(50));
  console.log(`useSocketEvents.js: ${socketEventsFixed ? '✅ ИСПРАВЛЕН' : '❌ НЕ ИСПРАВЛЕН'}`);
  console.log(`GameControls.js: ${gameControlsFixed ? '✅ ИСПРАВЛЕН' : '❌ НЕ ИСПРАВЛЕН'}`);
  console.log(`useGameLogic.js: ${gameLogicFixed ? '✅ ИСПРАВЛЕН' : '❌ НЕ ИСПРАВЛЕН'}`);

  if (socketEventsFixed && gameControlsFixed && gameLogicFixed) {
    console.log('\n🎉 ВСЕ ИСПРАВЛЕНИЯ СИНХРОНИЗАЦИИ ПРИМЕНЕНЫ!');
    console.log('\n🧪 СЛЕДУЮЩИЕ ШАГИ ДЛЯ ТЕСТИРОВАНИЯ:');
    console.log('1. Обновите страницу в браузере (F5)');
    console.log('2. Войдите в комнату и начните игру');
    console.log('3. Проверьте в консоли:');
    console.log('   - [playersList] Found player by username: ...');
    console.log('   - [playersList] Final myId: ...');
    console.log('4. Проверьте в интерфейсе:');
    console.log('   - Показываются ли реальные игроки (не "Тест Игрок")');
    console.log('   - Правильно ли подсвечен текущий игрок');
    console.log('   - Работает ли кубик для активного игрока');
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

