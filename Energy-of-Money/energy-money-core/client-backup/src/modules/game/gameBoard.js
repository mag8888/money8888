// 🎯 GameBoard - Игровое поле CASHFLOW
// Убираем импорт GameEngine, так как он не нужен в этом классе

export class GameBoard {
  constructor(roomId) {
    this.roomId = roomId;
    this.cells = this.createBoard();
    this.currentPlayer = null;
  }

  // Создать игровое поле
  createBoard() {
    const cells = [];
    
    // Создаем 74 клетки (24 внутренний круг + 50 внешний квадрат)
    for (let i = 0; i < 74; i++) {
      cells.push({
        id: i,
        type: this.getCellType(i),
        name: this.getCellName(i),
        description: this.getCellDescription(i),
        action: this.getCellAction(i),
        color: this.getCellColor(i)
      });
    }
    
    return cells;
  }

  // Определить тип клетки
  getCellType(position) {
    if (position === 0) return 'start';
    if (position % 10 === 0) return 'payday';
    if (position % 7 === 0) return 'deal';
    if (position % 5 === 0) return 'market';
    if (position % 3 === 0) return 'charity';
    if (position % 2 === 0) return 'expense';
    return 'opportunity';
  }

  // Получить название клетки
  getCellName(position) {
    const names = {
      0: 'Старт',
      10: 'Зарплата',
      20: 'Зарплата',
      30: 'Зарплата',
      7: 'Сделка',
      14: 'Сделка',
      21: 'Сделка',
      28: 'Сделка',
      35: 'Сделка', // Приоритет: сделка
      5: 'Рынок',
      15: 'Рынок',
      25: 'Рынок',
      3: 'Благотворительность',
      6: 'Благотворительность',
      9: 'Благотворительность',
      12: 'Благотворительность',
      18: 'Благотворительность',
      24: 'Благотворительность',
      27: 'Благотворительность',
      33: 'Благотворительность',
      36: 'Благотворительность',
      39: 'Благотворительность'
    };
    
    return names[position] || `Клетка ${position}`;
  }

  // Получить описание клетки
  getCellDescription(position) {
    const descriptions = {
      0: 'Начальная позиция. Получите $2000',
      10: 'Получите зарплату $2000',
      20: 'Получите зарплату $2000',
      30: 'Получите зарплату $2000',
      7: 'Возможность для сделки',
      14: 'Возможность для сделки',
      21: 'Возможность для сделки',
      28: 'Возможность для сделки',
      35: 'Возможность для сделки'
    };
    
    return descriptions[position] || 'Стандартная клетка';
  }

  // Получить действие клетки
  getCellAction(position) {
    const actions = {
      0: 'start_game',
      10: 'receive_salary',
      20: 'receive_salary',
      30: 'receive_salary',
      7: 'deal_opportunity',
      14: 'deal_opportunity',
      21: 'deal_opportunity',
      28: 'deal_opportunity',
      35: 'deal_opportunity'
    };
    
    return actions[position] || 'move';
  }

  // Получить цвет клетки
  getCellColor(position) {
    const colors = {
      0: '#4CAF50',    // Зеленый - старт
      10: '#2196F3',   // Синий - зарплата
      20: '#2196F3',
      30: '#2196F3',
      7: '#FF9800',    // Оранжевый - сделки
      14: '#FF9800',
      21: '#FF9800',
      28: '#FF9800',
      35: '#FF9800',   // Приоритет: сделка
      5: '#9C27B0',    // Фиолетовый - рынок
      15: '#9C27B0',
      25: '#9C27B0'
    };
    
    return colors[position] || '#E0E0E0'; // Серый по умолчанию
  }

  // Получить информацию о клетке
  getCellInfo(position) {
    if (position < 0 || position >= this.cells.length) {
      return null;
    }
    return this.cells[position];
  }

  // Получить все клетки
  getAllCells() {
    return this.cells;
  }

  // Переместить игрока
  movePlayer(playerId, steps) {
    // Упрощенная версия без зависимости от GameEngine
    const newPosition = steps % 74; // 74 клетки на поле
    
    // Получаем информацию о новой клетке
    const cellInfo = this.getCellInfo(newPosition);
    
    return {
      playerId,
      oldPosition: 0,
      newPosition,
      cellInfo,
      action: cellInfo.action
    };
  }

  // Получить соседние клетки
  getNeighborCells(position, range = 3) {
    const neighbors = [];
    
    for (let i = -range; i <= range; i++) {
      if (i === 0) continue; // Пропускаем текущую позицию
      
      const neighborPos = (position + i + 74) % 74; // 74 клетки на поле
      neighbors.push({
        position: neighborPos,
        ...this.getCellInfo(neighborPos)
      });
    }
    
    return neighbors;
  }
}
