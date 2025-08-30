// 🎮 Пример использования модулей CASHFLOW
import { GameEngine, Player, Room } from './core/index.js';
import { GameBoard } from './game/index.js';

console.log('🎮 Загружаем модули CASHFLOW...');

// Создаем игровой движок
const gameEngine = new GameEngine();
console.log('✅ GameEngine создан');

// Создаем игровое поле
const gameBoard = new GameBoard('room_123');
console.log('✅ GameBoard создан');

// Создаем комнату
try {
  const room = gameEngine.createRoom('room_123', 4);
  console.log('✅ Комната создана:', room.getInfo());
} catch (error) {
  console.log('❌ Ошибка создания комнаты:', error.message);
}

// Добавляем игроков
const players = [
  { id: 'player_1', username: 'Алексей', profession: 'Врач' },
  { id: 'player_2', username: 'Мария', profession: 'Инженер' },
  { id: 'player_3', username: 'Дмитрий', profession: 'Учитель' }
];

players.forEach(player => {
  try {
    gameEngine.addPlayerToRoom('room_123', player.id, player);
    console.log(`✅ Игрок ${player.username} добавлен`);
  } catch (error) {
    console.log(`❌ Ошибка добавления игрока ${player.username}:`, error.message);
  }
});

// Устанавливаем готовность игроков
players.forEach(player => {
  gameEngine.setPlayerReady('room_123', player.id, true);
  console.log(`✅ Игрок ${player.username} готов`);
});

// Получаем информацию о комнате
const roomInfo = gameEngine.getRoomInfo('room_123');
console.log('📊 Информация о комнате:', roomInfo);

// Получаем статистику игры
const gameStats = gameEngine.getGameStats();
console.log('📈 Статистика игры:', gameStats);

// Демонстрируем игровое поле
console.log('🎯 Информация об игровом поле:');
console.log('- Всего клеток:', gameBoard.getAllCells().length);
console.log('- Клетка 0:', gameBoard.getCellInfo(0));
console.log('- Клетка 10:', gameBoard.getCellInfo(10));
console.log('- Клетка 20:', gameBoard.getCellInfo(20));

// Демонстрируем перемещение игрока
console.log('🎲 Демонстрация перемещения игрока:');
try {
  const moveResult = gameBoard.movePlayer('player_1', 5);
  console.log('✅ Результат перемещения:', moveResult);
} catch (error) {
  console.log('❌ Ошибка перемещения:', error.message);
}

console.log('🎉 Демонстрация модулей завершена!');
