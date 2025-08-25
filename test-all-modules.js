#!/usr/bin/env node

/**
 * 🧪 ГЛАВНЫЙ ТЕСТ-РАННЕР ВСЕХ МОДУЛЕЙ
 * 
 * Запускает все тесты:
 * 1. ✅ Быстрый тест основных модулей
 * 2. ✅ Тест React компонентов
 * 3. ✅ Комплексный тест всех модулей
 */

const { runQuickTests } = require('./test-modules-quick');
const { testReactComponents } = require('./test-react-components');
const { TestRunner } = require('./test-modules-comprehensive');

// Цвета для вывода
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  bright: '\x1b[1m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Главная функция тестирования
async function runAllTests() {
  const startTime = Date.now();
  
  log('🚀 ЗАПУСК ВСЕХ ТЕСТОВ МОДУЛЕЙ ИГРЫ', 'bright');
  log('─'.repeat(70), 'cyan');
  
  const results = {
    quick: { passed: 0, failed: 0 },
    react: { passed: 0, total: 0 },
    comprehensive: { passed: 0, failed: 0 }
  };

  // Тест 1: Быстрый тест основных модулей
  log('\n🧪 ТЕСТ 1: Быстрый тест основных модулей', 'yellow');
  try {
    const quickResult = await runQuickTests();
    results.quick = quickResult;
    log(`✅ Быстрый тест завершен: ${quickResult.passed}/${quickResult.passed + quickResult.failed}`, 'green');
  } catch (error) {
    log(`❌ Быстрый тест провален: ${error.message}`, 'red');
    results.quick.failed = 1;
  }

  // Тест 2: Тест React компонентов
  log('\n🧪 ТЕСТ 2: Тест React компонентов', 'yellow');
  try {
    const reactResult = await testReactComponents();
    results.react = reactResult;
    log(`✅ Тест React компонентов завершен: ${reactResult.passed}/${reactResult.total}`, 'green');
  } catch (error) {
    log(`❌ Тест React компонентов провален: ${error.message}`, 'red');
    results.react.total = 1;
  }

  // Тест 3: Комплексный тест всех модулей
  log('\n🧪 ТЕСТ 3: Комплексный тест всех модулей', 'yellow');
  try {
    const runner = new TestRunner();
    await runner.runAll();
    results.comprehensive = {
      passed: runner.results.passed,
      failed: runner.results.failed
    };
    log(`✅ Комплексный тест завершен: ${runner.results.passed}/${runner.results.total}`, 'green');
  } catch (error) {
    log(`❌ Комплексный тест провален: ${error.message}`, 'red');
    results.comprehensive.failed = 1;
  }

  // Итоговые результаты
  const duration = Date.now() - startTime;
  const totalPassed = results.quick.passed + results.react.passed + results.comprehensive.passed;
  const totalFailed = results.quick.failed + (results.react.total - results.react.passed) + results.comprehensive.failed;
  const totalTests = totalPassed + totalFailed;

  log('\n' + '─'.repeat(70), 'cyan');
  log('📊 ИТОГОВЫЕ РЕЗУЛЬТАТЫ ВСЕХ ТЕСТОВ', 'bright');
  log(`⏱️  Общее время выполнения: ${duration}ms`, 'cyan');
  log('─'.repeat(70), 'cyan');
  
  // Детальные результаты
  log('📋 Детальные результаты:', 'cyan');
  log(`  🚀 Быстрый тест: ${results.quick.passed}/${results.quick.passed + results.quick.failed}`, 
      results.quick.failed === 0 ? 'green' : 'red');
  log(`  ⚛️  React компоненты: ${results.react.passed}/${results.react.total}`, 
      results.react.passed === results.react.total ? 'green' : 'yellow');
  log(`  🔍 Комплексный тест: ${results.comprehensive.passed}/${results.comprehensive.passed + results.comprehensive.failed}`, 
      results.comprehensive.failed === 0 ? 'green' : 'red');
  
  log('─'.repeat(70), 'cyan');
  log(`✅ Общий результат: ${totalPassed}/${totalTests}`, 'bright');
  
  if (totalFailed === 0) {
    log('🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО!', 'green');
    log('🚀 Все модули игры работают корректно!', 'green');
  } else {
    log(`⚠️  ЕСТЬ ПРОВАЛЕННЫЕ ТЕСТЫ: ${totalFailed}`, 'yellow');
    log('🔧 Рекомендуется исправить проваленные тесты', 'yellow');
  }

  // Рекомендации
  log('\n💡 РЕКОМЕНДАЦИИ:', 'cyan');
  if (results.quick.failed > 0) {
    log('  🔌 Проверьте подключение к серверу и WebSocket соединение', 'yellow');
  }
  if (results.react.passed < results.react.total) {
    log('  ⚛️  Проверьте React компоненты и хуки', 'yellow');
  }
  if (results.comprehensive.failed > 0) {
    log('  🔍 Проверьте интеграцию между модулями', 'yellow');
  }
  if (totalFailed === 0) {
    log('  🎮 Игра готова к использованию!', 'green');
  }

  return {
    totalPassed,
    totalFailed,
    totalTests,
    duration,
    details: results
  };
}

// Проверка зависимостей
function checkTestDependencies() {
  log('🔍 Проверка зависимостей для тестирования', 'cyan');
  
  const requiredFiles = [
    './test-modules-quick.js',
    './test-react-components.js',
    './test-modules-comprehensive.js'
  ];

  let missingFiles = 0;
  requiredFiles.forEach(file => {
    if (require('fs').existsSync(file)) {
      log(`  ✅ ${file}`, 'green');
    } else {
      log(`  ❌ ${file} - ФАЙЛ НЕ НАЙДЕН`, 'red');
      missingFiles++;
    }
  });

  if (missingFiles > 0) {
    log(`\n⚠️  Отсутствует ${missingFiles} файлов тестов`, 'yellow');
    log('💡 Убедитесь, что все тестовые файлы созданы', 'yellow');
    return false;
  }

  log('✅ Все тестовые файлы найдены', 'green');
  return true;
}

// Главная функция
async function main() {
  try {
    log('🧪 ГЛАВНЫЙ ТЕСТ-РАННЕР МОДУЛЕЙ ИГРЫ', 'bright');
    log('─'.repeat(70), 'cyan');
    
    // Проверяем зависимости
    if (!checkTestDependencies()) {
      log('❌ Невозможно запустить тесты из-за отсутствующих файлов', 'red');
      process.exit(1);
    }

    // Запускаем все тесты
    const results = await runAllTests();
    
    // Завершаем с соответствующим кодом
    if (results.totalFailed === 0) {
      process.exit(0); // Успех
    } else {
      process.exit(1); // Есть ошибки
    }
    
  } catch (error) {
    log(`❌ Критическая ошибка тестирования: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Запуск
if (require.main === module) {
  main();
}

module.exports = { runAllTests, checkTestDependencies };

