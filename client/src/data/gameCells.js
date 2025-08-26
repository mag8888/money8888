import React from 'react';
import BusinessIcon from '@mui/icons-material/Business';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { FAST_TRACK_BUSINESSES } from '../data/fastTrack';

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
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: FAST_TRACK_BUSINESSES[0]?.name || 'Быстрый Путь 1', data: FAST_TRACK_BUSINESSES[0] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: FAST_TRACK_BUSINESSES[1]?.name || 'Быстрый Путь 2', data: FAST_TRACK_BUSINESSES[1] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: FAST_TRACK_BUSINESSES[2]?.name || 'Быстрый Путь 3', data: FAST_TRACK_BUSINESSES[2] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: FAST_TRACK_BUSINESSES[3]?.name || 'Быстрый Путь 4', data: FAST_TRACK_BUSINESSES[3] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: FAST_TRACK_BUSINESSES[4]?.name || 'Быстрый Путь 5', data: FAST_TRACK_BUSINESSES[4] },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 6' },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 7' },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 8' },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 9' },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 10' },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 11' },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 12' },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 13' },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 14' },
    
    // Правый ряд (15-28)
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 15' },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 16' },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 17' },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 18' },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 19' },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 20' },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 21' },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 22' },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 23' },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 24' },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 25' },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 26' },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 27' },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 28' },
    
    // Нижний ряд (29-42)
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 29' },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 30' },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 31' },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 32' },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 33' },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 34' },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 35' },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 36' },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 37' },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 38' },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 39' },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 40' },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 41' },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 42' },
    
    // Левый ряд (43-56)
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 43' },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 44' },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 45' },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 46' },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 47' },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 48' },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 49' },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 50' },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 51' },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 52' },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 53' },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 54' },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 55' },
    { type: 'fastTrack', icon: <BusinessIcon />, color: '#4CAF50', name: 'Быстрый Путь 56' }
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