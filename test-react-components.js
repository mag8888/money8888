#!/usr/bin/env node

/**
 * 🧪 ТЕСТ REACT КОМПОНЕНТОВ ИГРЫ
 * 
 * Проверяет:
 * 1. ✅ GameField компонент
 * 2. ✅ GameControls компонент  
 * 3. ✅ GameBoard компонент
 * 4. ✅ useSocketEvents хук
 * 5. ✅ useGameState хук
 * 6. ✅ useGameLogic хук
 */

const fs = require('fs');
const path = require('path');

// Конфигурация
const CLIENT_SRC = './client/src';
const COMPONENTS_DIR = `${CLIENT_SRC}/components`;
const HOOKS_DIR = `${CLIENT_SRC}/hooks`;

// Цвета для вывода
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Проверка файлов
function checkFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`✅ ${description}: ${filePath}`, 'green');
    return true;
  } else {
    log(`❌ ${description}: ${filePath} - ФАЙЛ НЕ НАЙДЕН`, 'red');
    return false;
  }
}

// Проверка содержимого файла
function checkFileContent(filePath, checks) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let passed = 0;
    let total = checks.length;

    log(`\n🔍 Проверяем файл: ${filePath}`, 'cyan');

    checks.forEach((check, index) => {
      if (check.test(content)) {
        log(`  ✅ ${check.description}`, 'green');
        passed++;
      } else {
        log(`  ❌ ${check.description}`, 'red');
      }
    });

    log(`📊 Результат: ${passed}/${total} проверок пройдено`, passed === total ? 'green' : 'yellow');
    return { passed, total };
  } catch (error) {
    log(`❌ Ошибка чтения файла ${filePath}: ${error.message}`, 'red');
    return { passed: 0, total: 0 };
  }
}

// Основные тесты компонентов
async function testReactComponents() {
  log('🚀 ЗАПУСК ТЕСТА REACT КОМПОНЕНТОВ', 'cyan');
  log('─'.repeat(60), 'cyan');

  let totalPassed = 0;
  let totalChecks = 0;

  // Тест 1: GameField компонент
  log('\n🧪 Тест 1: GameField компонент', 'yellow');
  const gameFieldPath = `${COMPONENTS_DIR}/GameField.js`;
  if (checkFileExists(gameFieldPath, 'GameField компонент')) {
    const gameFieldChecks = [
      {
        description: 'Импорт React',
        test: (content) => content.includes('import React') || content.includes('from "react"')
      },
      {
        description: 'useState хук',
        test: (content) => content.includes('useState')
      },
      {
        description: 'useEffect хук',
        test: (content) => content.includes('useEffect')
      },
      {
        description: 'useMemo хук',
        test: (content) => content.includes('useMemo')
      },
      {
        description: 'Обработка игроков',
        test: (content) => content.includes('players') && content.includes('forEach')
      },
      {
        description: 'Проверка на undefined',
        test: (content) => content.includes('Array.isArray') || content.includes('players &&')
      },
      {
        description: 'Рендер игрового поля',
        test: (content) => content.includes('return') && content.includes('Box')
      }
    ];

    const result = checkFileContent(gameFieldPath, gameFieldChecks);
    totalPassed += result.passed;
    totalChecks += result.total;
  }

  // Тест 2: GameControls компонент
  log('\n🧪 Тест 2: GameControls компонент', 'yellow');
  const gameControlsPath = `${COMPONENTS_DIR}/GameControls.js`;
  if (checkFileExists(gameControlsPath, 'GameControls компонент')) {
    const gameControlsChecks = [
      {
        description: 'Импорт React',
        test: (content) => content.includes('import React') || content.includes('from "react"')
      },
      {
        description: 'Пропсы компонента',
        test: (content) => content.includes('isMyTurn') && content.includes('currentTurn')
      },
      {
        description: 'Таймер',
        test: (content) => content.includes('turnTimer') || content.includes('timer')
      },
      {
        description: 'Список игроков',
        test: (content) => content.includes('players') && content.includes('map')
      },
      {
        description: 'Кнопки управления',
        test: (content) => content.includes('Button') || content.includes('onClick')
      }
    ];

    const result = checkFileContent(gameControlsPath, gameControlsChecks);
    totalPassed += result.passed;
    totalChecks += result.total;
  }

  // Тест 3: GameBoard компонент
  log('\n🧪 Тест 3: GameBoard компонент', 'yellow');
  const gameBoardPath = `${COMPONENTS_DIR}/GameBoardRefactored.js`;
  if (checkFileExists(gameBoardPath, 'GameBoard компонент')) {
    const gameBoardChecks = [
      {
        description: 'Импорт React',
        test: (content) => content.includes('import React') || content.includes('from "react"')
      },
      {
        description: 'GameField компонент',
        test: (content) => content.includes('GameField')
      },
      {
        description: 'GameControls компонент',
        test: (content) => content.includes('GameControls')
      },
      {
        description: 'Передача пропсов',
        test: (content) => content.includes('isMyTurn') && content.includes('players')
      },
      {
        description: 'Отображение roomId',
        test: (content) => content.includes('roomId') && content.includes('Комната')
      }
    ];

    const result = checkFileContent(gameBoardPath, gameBoardChecks);
    totalPassed += result.passed;
    totalChecks += result.total;
  }

  // Тест 4: useSocketEvents хук
  log('\n🧪 Тест 4: useSocketEvents хук', 'yellow');
  const useSocketEventsPath = `${HOOKS_DIR}/useSocketEvents.js`;
  if (checkFileExists(useSocketEventsPath, 'useSocketEvents хук')) {
    const useSocketEventsChecks = [
      {
        description: 'Импорт React',
        test: (content) => content.includes('import React') || content.includes('from "react"')
      },
      {
        description: 'useCallback хук',
        test: (content) => content.includes('useCallback')
      },
      {
        description: 'useEffect хук',
        test: (content) => content.includes('useEffect')
      },
      {
        description: 'Socket.IO события',
        test: (content) => content.includes('socket.on') || content.includes('socket.emit')
      },
      {
        description: 'Обработчик playersList',
        test: (content) => content.includes('handlePlayersList')
      },
      {
        description: 'Обработчик turnTimerUpdate',
        test: (content) => content.includes('handleTurnTimerUpdate')
      },
      {
        description: 'Сохранение состояния',
        test: (content) => content.includes('...prev') || content.includes('...prevState')
      }
    ];

    const result = checkFileContent(useSocketEventsPath, useSocketEventsChecks);
    totalPassed += result.passed;
    totalChecks += result.total;
  }

  // Тест 5: useGameState хук
  log('\n🧪 Тест 5: useGameState хук', 'yellow');
  const useGameStatePath = `${HOOKS_DIR}/useGameState.js`;
  if (checkFileExists(useGameStatePath, 'useGameState хук')) {
    const useGameStateChecks = [
      {
        description: 'Импорт React',
        test: (content) => content.includes('import React') || content.includes('from "react"')
      },
      {
        description: 'useState хук',
        test: (content) => content.includes('useState')
      },
      {
        description: 'useCallback хук',
        test: (content) => content.includes('useCallback')
      },
      {
        description: 'updateGameState функция',
        test: (content) => content.includes('updateGameState')
      },
      {
        description: 'Обработка функций обновления',
        test: (content) => content.includes('typeof updates === "function"')
      },
      {
        description: 'Проверка массива игроков',
        test: (content) => content.includes('Array.isArray') || content.includes('players &&')
      }
    ];

    const result = checkFileContent(useGameStatePath, useGameStateChecks);
    totalPassed += result.passed;
    totalChecks += result.total;
  }

  // Тест 6: useGameLogic хук
  log('\n🧪 Тест 6: useGameLogic хук', 'yellow');
  const useGameLogicPath = `${HOOKS_DIR}/useGameLogic.js`;
  if (checkFileExists(useGameLogicPath, 'useGameLogic хук')) {
    const useGameLogicChecks = [
      {
        description: 'Импорт React',
        test: (content) => content.includes('import React') || content.includes('from "react"')
      },
      {
        description: 'useEffect хук',
        test: (content) => content.includes('useEffect')
      },
      {
        description: 'useCallback хук',
        test: (content) => content.includes('useCallback')
      },
      {
        description: 'Таймер игры',
        test: (content) => content.includes('turnTimer') || content.includes('timer')
      },
      {
        description: 'Логика хода',
        test: (content) => content.includes('isMyTurn') || content.includes('currentTurn')
      }
    ];

    const result = checkFileContent(useGameLogicPath, useGameLogicChecks);
    totalPassed += result.passed;
    totalChecks += result.total;
  }

  // Тест 7: Проверка структуры проекта
  log('\n🧪 Тест 7: Структура проекта', 'yellow');
  const structureChecks = [
    {
      description: 'Папка components',
      test: () => fs.existsSync(COMPONENTS_DIR)
    },
    {
      description: 'Папка hooks',
      test: () => fs.existsSync(HOOKS_DIR)
    },
    {
      description: 'Основной App.js',
      test: () => fs.existsSync(`${CLIENT_SRC}/App.js`)
    },
    {
      description: 'Socket.js конфигурация',
      test: () => fs.existsSync(`${CLIENT_SRC}/socket.js`)
    },
    {
      description: 'WebSocket fix',
      test: () => fs.existsSync(`${CLIENT_SRC}/websocket-fix.js`)
    }
  ];

  structureChecks.forEach(check => {
    if (check.test()) {
      log(`  ✅ ${check.description}`, 'green');
      totalPassed++;
    } else {
      log(`  ❌ ${check.description}`, 'red');
    }
    totalChecks++;
  });

  // Результаты
  log('\n' + '─'.repeat(60), 'cyan');
  log('📊 РЕЗУЛЬТАТЫ ТЕСТА REACT КОМПОНЕНТОВ', 'cyan');
  log(`✅ Пройдено: ${totalPassed}`, 'green');
  log(`❌ Провалено: ${totalChecks - totalPassed}`, 'red');
  log(`📈 Общий результат: ${totalPassed}/${totalChecks}`, 'cyan');
  
  if (totalPassed === totalChecks) {
    log('🎉 ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ!', 'green');
  } else {
    log('⚠️  ЕСТЬ ПРОВАЛЕННЫЕ ПРОВЕРКИ', 'yellow');
  }

  return { passed: totalPassed, total: totalChecks };
}

// Проверка зависимостей
function checkDependencies() {
  log('\n🔍 Проверка зависимостей', 'cyan');
  
  const packageJsonPath = './package.json';
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      log(`📦 Версия проекта: ${packageJson.version || 'не указана'}`, 'cyan');
      
      if (packageJson.dependencies) {
        log('📋 Основные зависимости:', 'cyan');
        Object.keys(packageJson.dependencies).forEach(dep => {
          log(`  📌 ${dep}`, 'magenta');
        });
      }
    } catch (error) {
      log(`❌ Ошибка чтения package.json: ${error.message}`, 'red');
    }
  } else {
    log('❌ package.json не найден', 'red');
  }
}

// Главная функция
async function main() {
  try {
    log('🧪 ТЕСТИРОВАНИЕ REACT КОМПОНЕНТОВ ИГРЫ', 'bright');
    log('─'.repeat(60), 'cyan');
    
    checkDependencies();
    await testReactComponents();
    
  } catch (error) {
    log(`❌ Критическая ошибка: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Запуск
if (require.main === module) {
  main();
}

module.exports = { testReactComponents, checkDependencies };

