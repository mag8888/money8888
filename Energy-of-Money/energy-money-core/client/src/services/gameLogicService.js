/**
 * Сервис для игровой логики
 * Содержит чистые функции для игровых операций
 */

// Константы для игровых операций
export const GAME_CONSTANTS = {
  TURN_TIME: 120, // 2 минуты на ход
  MAX_PLAYERS: 6,
  MIN_PLAYERS: 2,
  PROFESSION_BALANCES: {
    'Врач': 13000,
    'Инженер': 7500,
    'Учитель': 3000,
    'Полицейский': 3000,
    'Предприниматель': 2000,
    'Медсестра': 2000
  }
};

/**
 * Получает начальный баланс для профессии
 */
export const getInitialBalanceForProfession = (professionName) => {
  return GAME_CONSTANTS.PROFESSION_BALANCES[professionName] || 3000;
};

/**
 * Проверяет, может ли игрок выполнить действие
 */
export const canPlayerPerformAction = (player, action, gameState) => {
  if (!player || !action) return false;
  
  switch (action.type) {
    case 'roll_dice':
      return player.isConnected && gameState.currentTurn === player.username;
    case 'buy_asset':
      return player.balance >= action.cost;
    case 'sell_asset':
      return player.assets && player.assets.some(asset => asset.id === action.assetId);
    default:
      return true;
  }
};

/**
 * Вычисляет новый баланс после операции
 */
export const calculateNewBalance = (currentBalance, operation) => {
  const { type, amount } = operation;
  
  switch (type) {
    case 'add':
      return currentBalance + amount;
    case 'subtract':
      return Math.max(0, currentBalance - amount);
    case 'multiply':
      return currentBalance * amount;
    case 'divide':
      return Math.floor(currentBalance / amount);
    default:
      return currentBalance;
  }
};

/**
 * Проверяет условия победы
 */
export const checkVictoryConditions = (player, gameState) => {
  if (!player || !gameState) return false;
  
  // Условие 1: Пассивный доход >= 50000
  if (player.passiveIncome >= 50000) {
    return {
      won: true,
      reason: `Пассивный доход достиг $${player.passiveIncome.toLocaleString()}`
    };
  }
  
  // Условие 2: Куплена мечта
  if (player.dreams && player.dreams.length > 0) {
    return {
      won: true,
      reason: `Куплена мечта: ${player.dreams[0].name}`
    };
  }
  
  return { won: false };
};

/**
 * Вычисляет пассивный доход игрока
 */
export const calculatePassiveIncome = (player) => {
  if (!player || !player.assets) return 0;
  
  return player.assets.reduce((total, asset) => {
    return total + (asset.income || 0);
  }, 0);
};

/**
 * Вычисляет общую стоимость активов
 */
export const calculateTotalAssetsValue = (player) => {
  if (!player || !player.assets) return 0;
  
  return player.assets.reduce((total, asset) => {
    return total + (asset.value || 0);
  }, 0);
};

/**
 * Вычисляет общую сумму обязательств
 */
export const calculateTotalLiabilities = (player) => {
  if (!player || !player.liabilities) return 0;
  
  return player.liabilities.reduce((total, liability) => {
    return total + (liability.amount || 0);
  }, 0);
};

/**
 * Проверяет банкротство игрока
 */
export const checkBankruptcy = (player) => {
  if (!player) return false;
  
  const totalLiabilities = calculateTotalLiabilities(player);
  const totalAssets = calculateTotalAssetsValue(player);
  
  return totalLiabilities > totalAssets + player.balance;
};

/**
 * Обрабатывает банкротство игрока
 */
export const handleBankruptcy = (player) => {
  return {
    ...player,
    balance: 0,
    assets: [],
    liabilities: [],
    position: 0,
    passiveIncome: 0
  };
};

/**
 * Вычисляет позицию игрока на доске
 */
export const calculatePlayerPosition = (currentPosition, steps, boardSize = 24) => {
  return (currentPosition + steps) % boardSize;
};

/**
 * Проверяет, попал ли игрок на специальную клетку
 */
export const isSpecialCell = (position) => {
  const specialCells = [0, 6, 12, 18]; // Старт, благотворительность, ребенок, мечта
  return specialCells.includes(position);
};

/**
 * Получает тип клетки по позиции
 */
export const getCellType = (position) => {
  if (position === 0) return 'start';
  if (position === 6) return 'charity';
  if (position === 12) return 'child';
  if (position === 18) return 'dream';
  return 'regular';
};

/**
 * Валидирует данные игрока
 */
export const validatePlayerData = (player) => {
  const errors = [];
  
  if (!player.username) {
    errors.push('Имя игрока обязательно');
  }
  
  if (player.balance < 0) {
    errors.push('Баланс не может быть отрицательным');
  }
  
  if (player.position < 0 || player.position > 23) {
    errors.push('Позиция должна быть от 0 до 23');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Создает нового игрока с начальными данными
 */
export const createNewPlayer = (username, profession) => {
  return {
    id: `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    username,
    profession,
    balance: getInitialBalanceForProfession(profession?.name),
    position: 0,
    assets: [],
    liabilities: [],
    passiveIncome: 0,
    isConnected: true,
    color: null // Будет назначен позже
  };
};
