// 🎨 Цвета для игроков - 10 ярких и контрастных цветов
export const PLAYER_COLORS = [
  '#3B82F6', // Синий
  '#EF4444', // Красный
  '#10B981', // Зеленый
  '#F59E0B', // Желтый
  '#8B5CF6', // Фиолетовый
  '#06B6D4', // Голубой
  '#84CC16', // Лайм
  '#F97316', // Оранжевый
  '#EC4899', // Розовый
  '#14B8A6'  // Бирюзовый
];

// Функция для назначения уникального цвета игроку
export const assignPlayerColor = (players, newPlayer) => {
  // Если у игрока уже есть цвет, возвращаем его
  if (newPlayer.color) {
    return newPlayer.color;
  }
  
  const usedColors = players.map(p => p.color).filter(Boolean);
  const availableColors = PLAYER_COLORS.filter(color => !usedColors.includes(color));
  
  if (availableColors.length > 0) {
    return availableColors[0];
  }
  
  // Если все цвета заняты, назначаем цвет по индексу игрока
  const playerIndex = players.length;
  return PLAYER_COLORS[playerIndex % PLAYER_COLORS.length];
};

// Функция для получения цвета по индексу
export const getColorByIndex = (index) => {
  return PLAYER_COLORS[index % PLAYER_COLORS.length];
};

// Функция для получения контрастного цвета текста (белый или черный)
export const getContrastTextColor = (backgroundColor) => {
  // Конвертируем hex в RGB
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Вычисляем яркость
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  // Возвращаем белый для темных цветов, черный для светлых
  return brightness > 128 ? '#000000' : '#FFFFFF';
};
