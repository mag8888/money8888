# 🚀 Быстрый старт с модулями CASHFLOW

## 📥 Импорт модулей

```javascript
// Импорт всех модулей
import * as CashflowModules from './modules/index.js';

// Или импорт конкретных модулей
import { GameEngine, GameBoard, processGameAction } from './modules/index.js';
```

## 🎯 Основные функции

### 1. Создание игрового движка
```javascript
const gameEngine = new GameEngine();
const gameBoard = new GameBoard('room_123');
```

### 2. Управление комнатами
```javascript
// Создание комнаты
const room = gameEngine.createRoom('room_123', 4);

// Добавление игрока
gameEngine.addPlayerToRoom('room_123', 'player_1', {
  username: 'Алексей',
  profession: 'Врач'
});
```

### 3. Игровые действия
```javascript
// Бросок кубика и перемещение
const result = processGameAction('room_123', 'player_1', 'roll_dice', { steps: 5 });

// Покупка актива
const buyResult = processGameAction('room_123', 'player_1', 'buy_asset', { asset: 'business' });
```

### 4. Информация о клетках
```javascript
// Получение информации о клетке
const cellInfo = getCellInfo('room_123', 10);

// Получение соседних клеток
const neighbors = getNeighborCells('room_123', 10, 3);
```

## 🔧 Интеграция с существующим проектом

```javascript
// Интеграция с существующими комнатами
const existingRooms = [
  { roomId: 'room_1', maxPlayers: 4 },
  { roomId: 'room_2', maxPlayers: 6 }
];

integrateWithExistingRooms(existingRooms);
```

## 📊 Статистика и мониторинг

```javascript
// Получение статистики игры
const stats = getGameStatistics();
console.log('Активных комнат:', stats.activeRooms);

// Получение информации о комнате
const roomInfo = globalGameEngine.getRoomInfo('room_123');
```

## 🧹 Очистка

```javascript
// Очистка комнаты при её удалении
cleanupRoom('room_123');
```

## ⚠️ Важные замечания

- Все модули используют ES6 модули
- Игровое поле содержит 40 клеток
- Поддерживается до 6 игроков в комнате
- Состояние управляется иммутабельно
- Модули готовы к использованию в текущем проекте
