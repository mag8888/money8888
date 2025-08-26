import React from 'react';
import BusinessIcon from '@mui/icons-material/Business';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { ALL_FAST_TRACK_ASSETS } from '../data/fastTrack';

// Конфигурация клеток игрового поля
export const CELL_CONFIG = {
  // Малый круг - 24 клетки (0-23) - Крысиные Бега
  innerCircle: [
    { type: 'opportunity', icon: <BusinessIcon />, color: '#4CAF50', name: 'Возможность' }, // 0 🟢 Зеленая возможность малая/большая
    { type: 'doodad', icon: <WorkOutlineIcon />, color: '#E91E63', name: 'Всякая всячина' }, // 1 🟡 Розовая всякая всячина (траты 100-4000$)
    { type: 'opportunity', icon: <BusinessIcon />, color: '#4CAF50', name: 'Возможность' }, // 2 🟢 Зеленая возможность малая/большая
    { type: 'charity', icon: <WorkOutlineIcon />, color: '#FF9800', name: 'Благотворительность' }, // 3 🟠 Оранжевая Благотворительность ❤️
    { type: 'opportunity', icon: <BusinessIcon />, color: '#4CAF50', name: 'Возможность' }, // 4 🟢 Зеленая возможность малая/большая
    { type: 'payday', icon: <AttachMoneyIcon />, color: '#FFD700', name: 'PayDay' }, // 5 🟡 Желтая PayDay 💰
    { type: 'opportunity', icon: <BusinessIcon />, color: '#4CAF50', name: 'Возможность' }, // 6 🟢 Зеленая возможность малая/большая
    { type: 'market', icon: <WorkOutlineIcon />, color: '#00BCD4', name: 'Рынок' }, // 7 🔵 Голубая рынок
    { type: 'opportunity', icon: <BusinessIcon />, color: '#4CAF50', name: 'Возможность' }, // 8 🟢 Зеленая возможность малая/большая
    { type: 'doodad', icon: <WorkOutlineIcon />, color: '#E91E63', name: 'Всякая всячина' }, // 9 🟡 Розовая всякая всячина (траты 100-4000$)
    { type: 'opportunity', icon: <BusinessIcon />, color: '#4CAF50', name: 'Возможность' }, // 10 🟢 Зеленая возможность малая/большая
    { type: 'child', icon: <WorkOutlineIcon />, color: '#9C27B0', name: 'Ребенок' }, // 11 🟣 Фиолетовая Ребенок 👶
    { type: 'opportunity', icon: <BusinessIcon />, color: '#4CAF50', name: 'Возможность' }, // 12 🟢 Зеленая возможность малая/большая
    { type: 'payday', icon: <AttachMoneyIcon />, color: '#FFD700', name: 'PayDay' }, // 13 🟡 Желтая PayDay 💰
    { type: 'opportunity', icon: <BusinessIcon />, color: '#4CAF50', name: 'Возможность' }, // 14 🟢 Зеленая возможность малая/большая
    { type: 'market', icon: <WorkOutlineIcon />, color: '#00BCD4', name: 'Рынок' }, // 15 🔵 Рынок
    { type: 'opportunity', icon: <BusinessIcon />, color: '#4CAF50', name: 'Возможность' }, // 16 🟢 Зеленая возможность малая/большая
    { type: 'doodad', icon: <WorkOutlineIcon />, color: '#E91E63', name: 'Всякая всячина' }, // 17 🟡 Розовая всякая всячина (траты 100-4000$)
    { type: 'opportunity', icon: <BusinessIcon />, color: '#4CAF50', name: 'Возможность' }, // 18 🟢 Зеленая возможность малая/большая
    { type: 'downsized', icon: <WorkOutlineIcon />, color: '#000000', name: 'Потеря' }, // 19 ⚫ Черная Потеря 💸
    { type: 'opportunity', icon: <BusinessIcon />, color: '#4CAF50', name: 'Возможность' }, // 20 🟢 Зеленая возможность малая/большая
    { type: 'payday', icon: <AttachMoneyIcon />, color: '#FFD700', name: 'PayDay' }, // 21 🟡 Желтая PayDay 💰
    { type: 'opportunity', icon: <BusinessIcon />, color: '#4CAF50', name: 'Возможность' }, // 22 🟢 Зеленая возможность малая/большая
    { type: 'market', icon: <WorkOutlineIcon />, color: '#00BCD4', name: 'Рынок' } // 23 🔵 Рынок
  ],
  
  // Внешний квадрат - 56 клеток Быстрый Путь
  outerSquare: [
    // Верхний ряд (1-14)
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[0]?.name || 'Быстрый Путь 1', data: ALL_FAST_TRACK_ASSETS[0] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[1]?.name || 'Быстрый Путь 2', data: ALL_FAST_TRACK_ASSETS[1] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[2]?.name || 'Быстрый Путь 3', data: ALL_FAST_TRACK_ASSETS[2] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[3]?.name || 'Быстрый Путь 4', data: ALL_FAST_TRACK_ASSETS[3] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[4]?.name || 'Быстрый Путь 5', data: ALL_FAST_TRACK_ASSETS[4] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[5]?.name || 'Быстрый Путь 6', data: ALL_FAST_TRACK_ASSETS[5] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[6]?.name || 'Быстрый Путь 7', data: ALL_FAST_TRACK_ASSETS[6] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[7]?.name || 'Быстрый Путь 8', data: ALL_FAST_TRACK_ASSETS[7] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[8]?.name || 'Быстрый Путь 9', data: ALL_FAST_TRACK_ASSETS[8] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[9]?.name || 'Быстрый Путь 10', data: ALL_FAST_TRACK_ASSETS[9] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[10]?.name || 'Быстрый Путь 11', data: ALL_FAST_TRACK_ASSETS[10] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[11]?.name || 'Быстрый Путь 12', data: ALL_FAST_TRACK_ASSETS[11] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[12]?.name || 'Быстрый Путь 13', data: ALL_FAST_TRACK_ASSETS[12] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[13]?.name || 'Быстрый Путь 14', data: ALL_FAST_TRACK_ASSETS[13] },
    
    // Правый ряд (15-28)
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[14]?.name || 'Быстрый Путь 15', data: ALL_FAST_TRACK_ASSETS[14] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[15]?.name || 'Быстрый Путь 16', data: ALL_FAST_TRACK_ASSETS[15] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[16]?.name || 'Быстрый Путь 17', data: ALL_FAST_TRACK_ASSETS[16] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[17]?.name || 'Быстрый Путь 18', data: ALL_FAST_TRACK_ASSETS[17] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[18]?.name || 'Быстрый Путь 19', data: ALL_FAST_TRACK_ASSETS[18] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[19]?.name || 'Быстрый Путь 20', data: ALL_FAST_TRACK_ASSETS[19] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[20]?.name || 'Быстрый Путь 21', data: ALL_FAST_TRACK_ASSETS[20] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[21]?.name || 'Быстрый Путь 22', data: ALL_FAST_TRACK_ASSETS[21] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[22]?.name || 'Быстрый Путь 23', data: ALL_FAST_TRACK_ASSETS[22] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[23]?.name || 'Быстрый Путь 24', data: ALL_FAST_TRACK_ASSETS[23] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[24]?.name || 'Быстрый Путь 25', data: ALL_FAST_TRACK_ASSETS[24] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[25]?.name || 'Быстрый Путь 26', data: ALL_FAST_TRACK_ASSETS[25] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[26]?.name || 'Быстрый Путь 27', data: ALL_FAST_TRACK_ASSETS[26] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[27]?.name || 'Быстрый Путь 28', data: ALL_FAST_TRACK_ASSETS[27] },
    
    // Нижний ряд (29-42)
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[28]?.name || 'Быстрый Путь 29', data: ALL_FAST_TRACK_ASSETS[28] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[29]?.name || 'Быстрый Путь 30', data: ALL_FAST_TRACK_ASSETS[29] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[30]?.name || 'Быстрый Путь 31', data: ALL_FAST_TRACK_ASSETS[30] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[31]?.name || 'Быстрый Путь 32', data: ALL_FAST_TRACK_ASSETS[31] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[32]?.name || 'Быстрый Путь 33', data: ALL_FAST_TRACK_ASSETS[32] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[33]?.name || 'Быстрый Путь 34', data: ALL_FAST_TRACK_ASSETS[33] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[34]?.name || 'Быстрый Путь 35', data: ALL_FAST_TRACK_ASSETS[34] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[35]?.name || 'Быстрый Путь 36', data: ALL_FAST_TRACK_ASSETS[35] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[36]?.name || 'Быстрый Путь 37', data: ALL_FAST_TRACK_ASSETS[36] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[37]?.name || 'Быстрый Путь 38', data: ALL_FAST_TRACK_ASSETS[37] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[38]?.name || 'Быстрый Путь 39', data: ALL_FAST_TRACK_ASSETS[38] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[39]?.name || 'Быстрый Путь 40', data: ALL_FAST_TRACK_ASSETS[39] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[40]?.name || 'Быстрый Путь 41', data: ALL_FAST_TRACK_ASSETS[40] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[41]?.name || 'Быстрый Путь 42', data: ALL_FAST_TRACK_ASSETS[41] },
    
    // Левый ряд (43-56)
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[42]?.name || 'Быстрый Путь 43', data: ALL_FAST_TRACK_ASSETS[42] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[43]?.name || 'Быстрый Путь 44', data: ALL_FAST_TRACK_ASSETS[43] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[44]?.name || 'Быстрый Путь 45', data: ALL_FAST_TRACK_ASSETS[44] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[45]?.name || 'Быстрый Путь 46', data: ALL_FAST_TRACK_ASSETS[45] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[46]?.name || 'Быстрый Путь 47', data: ALL_FAST_TRACK_ASSETS[46] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[47]?.name || 'Быстрый Путь 48', data: ALL_FAST_TRACK_ASSETS[47] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[48]?.name || 'Быстрый Путь 49', data: ALL_FAST_TRACK_ASSETS[48] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[49]?.name || 'Быстрый Путь 50', data: ALL_FAST_TRACK_ASSETS[49] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[50]?.name || 'Быстрый Путь 51', data: ALL_FAST_TRACK_ASSETS[50] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[51]?.name || 'Быстрый Путь 52', data: ALL_FAST_TRACK_ASSETS[51] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[52]?.name || 'Быстрый Путь 53', data: ALL_FAST_TRACK_ASSETS[52] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[53]?.name || 'Быстрый Путь 54', data: ALL_FAST_TRACK_ASSETS[53] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[54]?.name || 'Быстрый Путь 55', data: ALL_FAST_TRACK_ASSETS[54] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: ALL_FAST_TRACK_ASSETS[55]?.name || 'Быстрый Путь 56', data: ALL_FAST_TRACK_ASSETS[55] }
  ]
};

// Конфигурация цветов для фишек игроков
export const PLAYER_COLORS = [
  '#FF6B6B', // Красный
  '#4ECDC4', // Бирюзовый
  '#45B7D1', // Синий
  '#96CEB4', // Зеленый
  '#FFEAA7', // Желтый
  '#DDA0DD', // Фиолетовый
  '#FF8C42', // Оранжевый
  '#98D8C8'  // Мятный
]; 