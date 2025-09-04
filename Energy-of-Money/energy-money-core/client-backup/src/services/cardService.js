/**
 * Сервис для работы с карточками
 * Содержит логику для карточек сделок, расходов и рынка
 */

/**
 * Инициализирует колоду карточек
 */
export const initializeDeck = (cards) => {
  return [...cards].sort(() => Math.random() - 0.5);
};

/**
 * Тянет карточку из колоды
 */
export const drawCard = (deck) => {
  if (deck.length === 0) {
    throw new Error('Колода пуста');
  }
  
  const [drawnCard, ...remainingDeck] = deck;
  return {
    card: drawnCard,
    remainingDeck
  };
};

/**
 * Возвращает карточку в колоду
 */
export const returnCardToDeck = (card, deck) => {
  return [card, ...deck];
};

/**
 * Перемешивает колоду
 */
export const shuffleDeck = (deck) => {
  return [...deck].sort(() => Math.random() - 0.5);
};

/**
 * Проверяет, может ли игрок купить карточку
 */
export const canPlayerBuyCard = (player, card) => {
  if (!player || !card) return false;
  
  // Проверяем баланс
  if (player.balance < card.cost) {
    return {
      canBuy: false,
      reason: 'Недостаточно средств'
    };
  }
  
  // Проверяем специальные условия
  if (card.conditions) {
    for (const condition of card.conditions) {
      if (!checkCondition(player, condition)) {
        return {
          canBuy: false,
          reason: condition.message || 'Не выполнены условия карточки'
        };
      }
    }
  }
  
  return { canBuy: true };
};

/**
 * Проверяет условие карточки
 */
const checkCondition = (player, condition) => {
  switch (condition.type) {
    case 'min_balance':
      return player.balance >= condition.value;
    case 'max_liabilities':
      return (player.liabilities?.length || 0) <= condition.value;
    case 'has_asset':
      return player.assets?.some(asset => asset.type === condition.assetType);
    case 'profession':
      return player.profession?.name === condition.profession;
    default:
      return true;
  }
};

/**
 * Обрабатывает покупку карточки
 */
export const processCardPurchase = (player, card) => {
  if (!player || !card) {
    throw new Error('Неверные данные для покупки карточки');
  }
  
  const canBuy = canPlayerBuyCard(player, card);
  if (!canBuy.canBuy) {
    throw new Error(canBuy.reason);
  }
  
  const updatedPlayer = {
    ...player,
    balance: player.balance - card.cost
  };
  
  // Добавляем актив, если это карточка актива
  if (card.type === 'asset') {
    updatedPlayer.assets = [...(player.assets || []), {
      id: `asset_${Date.now()}`,
      name: card.name,
      value: card.value,
      income: card.income,
      type: card.assetType
    }];
    updatedPlayer.passiveIncome = calculatePassiveIncome(updatedPlayer);
  }
  
  // Добавляем обязательство, если это карточка обязательства
  if (card.type === 'liability') {
    updatedPlayer.liabilities = [...(player.liabilities || []), {
      id: `liability_${Date.now()}`,
      name: card.name,
      amount: card.amount,
      type: card.liabilityType
    }];
  }
  
  return updatedPlayer;
};

/**
 * Вычисляет пассивный доход (дублирует функцию из gameLogicService для независимости)
 */
const calculatePassiveIncome = (player) => {
  if (!player || !player.assets) return 0;
  
  return player.assets.reduce((total, asset) => {
    return total + (asset.income || 0);
  }, 0);
};

/**
 * Обрабатывает карточку расхода
 */
export const processExpenseCard = (player, card) => {
  if (!player || !card) {
    throw new Error('Неверные данные для карточки расхода');
  }
  
  const updatedPlayer = { ...player };
  
  // Вычитаем стоимость расхода
  if (player.balance >= card.cost) {
    updatedPlayer.balance = player.balance - card.cost;
  } else {
    // Недостаточно средств - добавляем кредит
    const shortfall = card.cost - player.balance;
    updatedPlayer.balance = 0;
    updatedPlayer.liabilities = [...(player.liabilities || []), {
      id: `credit_${Date.now()}`,
      name: `Кредит для ${card.name}`,
      amount: shortfall,
      type: 'credit'
    }];
  }
  
  return updatedPlayer;
};

/**
 * Обрабатывает карточку благотворительности
 */
export const processCharityCard = (player, card) => {
  if (!player || !card) {
    throw new Error('Неверные данные для карточки благотворительности');
  }
  
  const updatedPlayer = { ...player };
  
  if (player.balance >= card.cost) {
    updatedPlayer.balance = player.balance - card.cost;
    updatedPlayer.charityBonus = {
      diceCount: card.diceCount || 2,
      turnsLeft: card.turnsLeft || 3
    };
  } else {
    // Недостаточно средств - добавляем кредит
    const shortfall = card.cost - player.balance;
    updatedPlayer.balance = 0;
    updatedPlayer.liabilities = [...(player.liabilities || []), {
      id: `charity_credit_${Date.now()}`,
      name: `Кредит для благотворительности`,
      amount: shortfall,
      type: 'credit'
    }];
    updatedPlayer.charityBonus = {
      diceCount: card.diceCount || 2,
      turnsLeft: card.turnsLeft || 3
    };
  }
  
  return updatedPlayer;
};

/**
 * Получает случайную карточку из колоды
 */
export const getRandomCard = (deck) => {
  if (deck.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * deck.length);
  return deck[randomIndex];
};

/**
 * Фильтрует карточки по типу
 */
export const filterCardsByType = (deck, type) => {
  return deck.filter(card => card.type === type);
};

/**
 * Создает колоду из массива карточек
 */
export const createDeck = (cards) => {
  return initializeDeck(cards);
};

/**
 * Проверяет, пуста ли колода
 */
export const isDeckEmpty = (deck) => {
  return deck.length === 0;
};

/**
 * Получает количество карточек в колоде
 */
export const getDeckSize = (deck) => {
  return deck.length;
};
