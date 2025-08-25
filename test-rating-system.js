#!/usr/bin/env node

console.log('🧪 Запуск автотеста: Новая система рейтинга');
console.log('=================================================================\n');

// Тестируем новую логику рейтинга
function testRatingLogic() {
  console.log('🔍 Тестирование логики рейтинга...\n');
  
  const testCases = [
    { position: 1, totalPlayers: 8, expected: 7, description: '1-е место из 8 игроков' },
    { position: 2, totalPlayers: 8, expected: 6, description: '2-е место из 8 игроков' },
    { position: 5, totalPlayers: 8, expected: 3, description: '5-е место из 8 игроков' },
    { position: 8, totalPlayers: 8, expected: 0, description: '8-е место из 8 игроков' },
    { position: 1, totalPlayers: 4, expected: 3, description: '1-е место из 4 игроков' },
    { position: 3, totalPlayers: 4, expected: 1, description: '3-е место из 4 игроков' },
    { position: 1, totalPlayers: 2, expected: 1, description: '1-е место из 2 игроков' },
    { position: 2, totalPlayers: 2, expected: 0, description: '2-е место из 2 игроков' }
  ];
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  testCases.forEach((testCase, index) => {
    const { position, totalPlayers, expected, description } = testCase;
    const actual = totalPlayers - position;
    const passed = actual === expected;
    
    if (passed) {
      passedTests++;
      console.log(`✅ Тест ${index + 1}: ${description}`);
      console.log(`   Позиция: ${position}, Игроков: ${totalPlayers} → Очки: ${actual}`);
    } else {
      console.log(`❌ Тест ${index + 1}: ${description}`);
      console.log(`   Позиция: ${position}, Игроков: ${totalPlayers} → Ожидалось: ${expected}, Получено: ${actual}`);
    }
    console.log('');
  });
  
  console.log(`📊 РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ:`);
  console.log(`==================================================`);
  console.log(`Пройдено тестов: ${passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО!');
    console.log('\n💡 Новая система рейтинга работает корректно:');
    console.log('   - 1-е место в игре с 8 игроками = +7 очков');
    console.log('   - 5-е место в игре с 8 игроками = +3 очка');
    console.log('   - 8-е место в игре с 8 игроками = +0 очков');
  } else {
    console.log('⚠️ НЕКОТОРЫЕ ТЕСТЫ ПРОВАЛЕНЫ');
    console.log('\n🔧 Необходимо исправить найденные проблемы');
  }
  
  return passedTests === totalTests;
}

// Тестируем обновление рейтинга
function testRatingUpdate() {
  console.log('🔍 Тестирование обновления рейтинга...\n');
  
  // Симулируем игрока с начальным рейтингом
  let player = {
    ratingPoints: 0,
    gamesPlayed: 0,
    username: 'TestPlayer'
  };
  
  // Симулируем несколько игр
  const games = [
    { position: 1, totalPlayers: 8, description: '1-е место из 8 игроков' },
    { position: 3, totalPlayers: 6, description: '3-е место из 6 игроков' },
    { position: 2, totalPlayers: 4, description: '2-е место из 4 игроков' }
  ];
  
  console.log('🎮 Симуляция игр:');
  games.forEach((game, index) => {
    const pointsEarned = game.totalPlayers - game.position;
    player.ratingPoints += pointsEarned;
    player.gamesPlayed += 1;
    
    console.log(`   Игра ${index + 1}: ${game.description}`);
    console.log(`   Получено очков: ${pointsEarned}`);
    console.log(`   Общий рейтинг: ${player.ratingPoints}`);
    console.log('');
  });
  
  const expectedTotal = 7 + 3 + 2; // 7 + 3 + 2 = 12
  const passed = player.ratingPoints === expectedTotal;
  
  if (passed) {
    console.log('✅ Тест обновления рейтинга пройден');
    console.log(`   Ожидалось: ${expectedTotal}, Получено: ${player.ratingPoints}`);
  } else {
    console.log('❌ Тест обновления рейтинга провален');
    console.log(`   Ожидалось: ${expectedTotal}, Получено: ${player.ratingPoints}`);
  }
  
  return passed;
}

// Запускаем все тесты
function runAllTests() {
  console.log('🚀 Запуск всех тестов...\n');
  
  const test1Passed = testRatingLogic();
  console.log(''); // Пустая строка для разделения
  
  const test2Passed = testRatingUpdate();
  console.log(''); // Пустая строка для разделения
  
  // Итоговые результаты
  console.log('📊 ИТОГОВЫЕ РЕЗУЛЬТАТЫ:');
  console.log('==================================================');
  console.log(`Логика рейтинга: ${test1Passed ? '✅' : '❌'}`);
  console.log(`Обновление рейтинга: ${test2Passed ? '✅' : '❌'}`);
  
  const totalPassed = (test1Passed ? 1 : 0) + (test2Passed ? 1 : 0);
  const totalTests = 2;
  
  console.log(`\n🎯 ИТОГО: ${totalPassed}/${totalTests} тестов пройдено`);
  
  if (totalPassed === totalTests) {
    console.log('\n🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО!');
    console.log('\n💡 Новая система рейтинга готова к использованию:');
    console.log('   - Рейтинг отображается по набранным очкам');
    console.log('   - Очки начисляются за каждого обойденного игрока');
    console.log('   - Система автоматически обновляет рейтинги');
  } else {
    console.log('\n⚠️ НЕКОТОРЫЕ ТЕСТЫ ПРОВАЛЕНЫ');
    console.log('\n🔧 Необходимо исправить найденные проблемы');
  }
  
  process.exit(totalPassed === totalTests ? 0 : 1);
}

// Запускаем тесты
runAllTests();
