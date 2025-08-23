import React, { useMemo, useState } from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { motion } from 'framer-motion';
import HomeIcon from '@mui/icons-material/Home';
import BusinessIcon from '@mui/icons-material/Business';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import CasinoIcon from '@mui/icons-material/Casino';
import CardDeck from './CardDeck';

// Конфигурация клеток игрового поля согласно списку
const CELL_CONFIG = {
  // Малый круг - 24 клетки (0-23) - Крысиные Бега
  innerCircle: [
    { type: 'opportunity', icon: <HomeIcon />, color: '#4CAF50', name: 'Возможность' }, // 0 🟢 Зеленая возможность малая/большая
    { type: 'doodad', icon: <ShoppingCartIcon />, color: '#E91E63', name: 'Всякая всячина' }, // 1 🟡 Розовая всякая всячина (траты 100-4000$)
    { type: 'opportunity', icon: <HomeIcon />, color: '#4CAF50', name: 'Возможность' }, // 2 🟢 Зеленая возможность малая/большая
    { type: 'charity', icon: <VolunteerActivismIcon />, color: '#FF9800', name: 'Благотворительность' }, // 3 🟠 Оранжевая Благотворительность ❤️
    { type: 'opportunity', icon: <HomeIcon />, color: '#4CAF50', name: 'Возможность' }, // 4 🟢 Зеленая возможность малая/большая
    { type: 'payday', icon: <AttachMoneyIcon />, color: '#FFD700', name: 'PayDay' }, // 5 🟡 Желтая PayDay 💰
    { type: 'opportunity', icon: <HomeIcon />, color: '#4CAF50', name: 'Возможность' }, // 6 🟢 Зеленая возможность малая/большая
    { type: 'market', icon: <TrendingUpIcon />, color: '#00BCD4', name: 'Рынок' }, // 7 🔵 Голубая рынок
    { type: 'opportunity', icon: <HomeIcon />, color: '#4CAF50', name: 'Возможность' }, // 8 🟢 Зеленая возможность малая/большая
    { type: 'doodad', icon: <ShoppingCartIcon />, color: '#E91E63', name: 'Всякая всячина' }, // 9 🟡 Розовая всякая всячина (траты 100-4000$)
    { type: 'opportunity', icon: <HomeIcon />, color: '#4CAF50', name: 'Возможность' }, // 10 🟢 Зеленая возможность малая/большая
    { type: 'child', icon: <ChildCareIcon />, color: '#9C27B0', name: 'Ребенок' }, // 11 🟣 Фиолетовая Ребенок 👶
    { type: 'opportunity', icon: <HomeIcon />, color: '#4CAF50', name: 'Возможность' }, // 12 🟢 Зеленая возможность малая/большая
    { type: 'payday', icon: <AttachMoneyIcon />, color: '#FFD700', name: 'PayDay' }, // 13 🟡 Желтая PayDay 💰
    { type: 'opportunity', icon: <HomeIcon />, color: '#4CAF50', name: 'Возможность' }, // 14 🟢 Зеленая возможность малая/большая
    { type: 'market', icon: <TrendingUpIcon />, color: '#00BCD4', name: 'Рынок' }, // 15 🔵 Рынок
    { type: 'opportunity', icon: <HomeIcon />, color: '#4CAF50', name: 'Возможность' }, // 16 🟢 Зеленая возможность малая/большая
    { type: 'doodad', icon: <ShoppingCartIcon />, color: '#E91E63', name: 'Всякая всячина' }, // 17 🟡 Розовая всякая всячина (траты 100-4000$)
    { type: 'opportunity', icon: <HomeIcon />, color: '#4CAF50', name: 'Возможность' }, // 18 🟢 Зеленая возможность малая/большая
    { type: 'downsized', icon: <WorkOutlineIcon />, color: '#000000', name: 'Потеря' }, // 19 ⚫ Черная Потеря 💸
    { type: 'opportunity', icon: <HomeIcon />, color: '#4CAF50', name: 'Возможность' }, // 20 🟢 Зеленая возможность малая/большая
    { type: 'payday', icon: <AttachMoneyIcon />, color: '#FFD700', name: 'PayDay' }, // 21 🟡 Желтая PayDay 💰
    { type: 'opportunity', icon: <HomeIcon />, color: '#4CAF50', name: 'Возможность' }, // 22 🟢 Зеленая возможность малая/большая
    { type: 'market', icon: <TrendingUpIcon />, color: '#00BCD4', name: 'Рынок' } // 23 🔵 Рынок
  ],
  // Внешний квадрат - 50 клеток Быстрый Путь
  outerSquare: [
    { type: 'cashflowDay', icon: <AttachMoneyIcon />, color: '#4CAF50', name: 'День Потока' },
    { type: 'fastTrack', icon: <FlightTakeoffIcon />, color: '#9C27B0', name: 'Fast Track' },
    { type: 'fastTrack', icon: <FlightTakeoffIcon />, color: '#9C27B0', name: 'Fast Track' },
    { type: 'fastTrack', icon: <FlightTakeoffIcon />, color: '#9C27B0', name: 'Fast Track' },
    { type: 'fastTrack', icon: <FlightTakeoffIcon />, color: '#9C27B0', name: 'Fast Track' },
    { type: 'fastTrack', icon: <FlightTakeoffIcon />, color: '#9C27B0', name: 'Fast Track' },
    { type: 'fastTrack', icon: <FlightTakeoffIcon />, color: '#9C27B0', name: 'Fast Track' },
    { type: 'fastTrack', icon: <FlightTakeoffIcon />, color: '#9C27B0', name: 'Fast Track' },
    { type: 'fastTrack', icon: <FlightTakeoffIcon />, color: '#9C27B0', name: 'Fast Track' },
    { type: 'fastTrack', icon: <FlightTakeoffIcon />, color: '#9C27B0', name: 'Fast Track' },
    { type: 'fastTrack', icon: <FlightTakeoffIcon />, color: '#9C27B0', name: 'Fast Track' },
    { type: 'fastTrack', icon: <FlightTakeoffIcon />, color: '#9C27B0', name: 'Fast Track' },
    { type: 'fastTrack', icon: <FlightTakeoffIcon />, color: '#9C27B0', name: 'Fast Track' },
    { type: 'fastTrack', icon: <FlightTakeoffIcon />, color: '#9C27B0', name: 'Fast Track' },
    { type: 'fastTrack', icon: <FlightTakeoffIcon />, color: '#9C27B0', name: 'Fast Track' },
    { type: 'fastTrack', icon: <FlightTakeoffIcon />, color: '#9C27B0', name: 'Fast Track' },
    { type: 'fastTrack', icon: <FlightTakeoffIcon />, color: '#9C27B0', name: 'Fast Track' },
    { type: 'fastTrack', icon: <FlightTakeoffIcon />, color: '#9C27B0', name: 'Fast Track' },
    { type: 'fastTrack', icon: <FlightTakeoffIcon />, color: '#9C27B0', name: 'Fast Track' },
    { type: 'fastTrack', icon: <FlightTakeoffIcon />, color: '#9C27B0', name: 'Fast Track' },
    { type: 'fastTrack', icon: <FlightTakeoffIcon />, color: '#9C27B0', name: 'Fast Track' },
    { type: 'fastTrack', icon: <FlightTakeoffIcon />, color: '#9C27B0', name: 'Fast Track' },
    { type: 'fastTrack', icon: <FlightTakeoffIcon />, color: '#9C27B0', name: 'Fast Track' },
    { type: 'fastTrack', icon: <FlightTakeoffIcon />, color: '#9C27B0', name: 'Fast Track' },
    { type: 'fastTrack', icon: <FlightTakeoffIcon />, color: '#9C27B0', name: 'Fast Track' },
    { type: 'fastTrack', icon: <FlightTakeoffIcon />, color: '#9C27B0', name: 'Fast Track' },
    { type: 'fastTrack', icon: <FlightTakeoffIcon />, color: '#9C27B0', name: 'Fast Track' }
  ]
};

// Компонент клетки
const GameCell = React.memo(({ 
  position, 
  type, 
  icon, 
  color, 
  isPlayerHere, 
  playerColor, 
  playerInitial,
  onClick,
  number
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick?.(position, type)}
      style={{
        width: 42,
        height: 42,
        borderRadius: 7,
        backgroundColor: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        border: '3px solid #FFFFFF',
        boxShadow: '0 3px 8px rgba(0,0,0,0.4)'
      }}
    >
      {isPlayerHere ? (
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            backgroundColor: playerColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '14px'
          }}
        >
          {playerInitial}
        </Box>
      ) : (
        <Box sx={{ color: 'white', fontSize: '22px' }}>
          {icon}
        </Box>
      )}
      
      {/* Номер клетки */}
      {number && (
        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            top: -10,
            right: -10,
            backgroundColor: '#FFD700',
            color: '#000000',
            borderRadius: '50%',
            width: 22,
            height: 22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            fontWeight: 'bold',
            border: '1px solid #000000'
          }}
        >
          {number}
        </Typography>
      )}
    </motion.div>
  );
});

// Основной компонент игрового поля
const GameField = ({ 
  players, 
  currentTurn, 
  onCellClick, 
  onRollDice, 
  isMyTurn, 
  diceValue, 
  isRolling 
}) => {
  // Состояние стопок карточек
  const [cardDecks, setCardDecks] = useState({
    smallDeal: { remaining: 24, total: 24, isShuffling: false },
    bigDeal: { remaining: 24, total: 24, isShuffling: false },
    market: { remaining: 24, total: 24, isShuffling: false },
    doodad: { remaining: 24, total: 24, isShuffling: false },
    charity: { remaining: 24, total: 24, isShuffling: false }
  });

  // Функция перетасовки колоды
  const handleShuffleDeck = (deckType) => {
    setCardDecks(prev => ({
      ...prev,
      [deckType]: {
        ...prev[deckType],
        isShuffling: true,
        remaining: prev[deckType].total
      }
    }));

    // Имитация перетасовки
    setTimeout(() => {
      setCardDecks(prev => ({
        ...prev,
        [deckType]: {
          ...prev[deckType],
          isShuffling: false
        }
      }));
    }, 600);
  };

  // Функция взятия карты из колоды
  const drawCard = (deckType) => {
    setCardDecks(prev => ({
      ...prev,
      [deckType]: {
        ...prev[deckType],
        remaining: Math.max(0, prev[deckType].remaining - 1)
      }
    }));
  };

  // Вычисляем позиции игроков
  const playerPositions = useMemo(() => {
    const positions = {};
    players.forEach(player => {
      if (player.position !== undefined) {
        positions[player.position] = {
          color: player.color || '#9C27B0',
          initial: player.username?.charAt(0) || 'И',
          id: player.id
        };
      }
    });
    return positions;
  }, [players]);

  // Вычисляем позиции клеток
  const cellPositions = useMemo(() => {
    const positions = [];
    const fieldCenter = 495 / 2;
    const cellSize = 42;
    const cellHalf = cellSize / 2;

    // Внешний круг - клетки по кругу (0-23)
    for (let i = 0; i < 24; i++) {
      // Начинаем с верха и идем по часовой стрелке
      const angle = (i * 15 - 90) * (Math.PI / 180); // -90 чтобы начать сверху
      const radius = 240;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      positions.push({
        position: i,
        x: x + 247.5 - 21,
        y: y + 247.5 - 21,
        ...CELL_CONFIG.innerCircle[i % CELL_CONFIG.innerCircle.length],
        number: i + 1 // Нумерация от 1 до 24
      });
    }
    return positions;
  }, []);

  return (
    <Box
      sx={{
        position: 'relative',
        width: 495, // 550 * 0.9 = 495 - поле уменьшено на 10%
        height: 495, // 550 * 0.9 = 495 - поле уменьшено на 10%
        backgroundColor: '#2F1B40',
        borderRadius: '50%',
        border: '4px solid #6E4D92',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible'
      }}
    >
      {/* Кнопка броска кубиков */}
      {isMyTurn && (
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onRollDice}
          style={{ 
            position: 'absolute',
            top: -50,
            right: 20,
            cursor: 'pointer',
            zIndex: 30
          }}
        >
          <CasinoIcon sx={{ fontSize: 32, color: '#FFD700' }} />
        </motion.div>
      )}

      {/* Значение кубиков */}
      {diceValue > 0 && (
        <Typography 
          variant="h3" 
          sx={{ 
            position: 'absolute',
            top: -50,
            right: 60,
            color: '#FFD700', 
            fontWeight: 'bold',
            zIndex: 30,
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
          }}
        >
          {diceValue}
        </Typography>
      )}



      {/* Центральная область */}
      <Box
        sx={{
          position: 'absolute',
          width: 90,
          height: 90,
          backgroundColor: '#6E4D92',
          borderRadius: '50%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          zIndex: 20
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center', lineHeight: 1.1 }}>
          ПОТОК ДЕНЕГ
        </Typography>
      </Box>

      {/* Клетки игрового поля */}
      {cellPositions.map(({ position, x, y, type, icon, color, number }) => (
        <Box
          key={position}
          sx={{
            position: 'absolute',
            left: x,
            top: y,
            zIndex: 100
          }}
        >
          <GameCell
            position={position}
            type={type}
            icon={icon}
            color={color}
            number={number}
            isPlayerHere={!!playerPositions[position]}
            playerColor={playerPositions[position]?.color}
            playerInitial={playerPositions[position]?.initial}
            onClick={onCellClick}
          />
        </Box>
      ))}

      {/* Соединительные линии между кругами */}
      <svg
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          zIndex: 1
        }}
      >
        {/* Линии между внешним и внутренним кругом */}
        {[0, 6, 12, 18].map((startPos) => {
          const startCell = cellPositions[startPos];
          const endCell = cellPositions[startPos + 24];
          
          if (startCell && endCell) {
            return (
              <line
                key={`line-${startPos}`}
                x1={startCell.x + 20}
                y1={startCell.y + 20}
                x2={endCell.x + 20}
                y2={endCell.y + 20}
                stroke="#6E4D92"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            );
          }
          return null;
        })}
      </svg>

      {/* Стопки карточек */}
      <CardDeck
        deckType="smallDeal"
        remainingCards={cardDecks.smallDeal.remaining}
        totalCards={cardDecks.smallDeal.total}
        onShuffle={handleShuffleDeck}
        isShuffling={cardDecks.smallDeal.isShuffling}
        position="top"
      />
      
      <CardDeck
        deckType="bigDeal"
        remainingCards={cardDecks.bigDeal.remaining}
        totalCards={cardDecks.bigDeal.total}
        onShuffle={handleShuffleDeck}
        isShuffling={cardDecks.bigDeal.isShuffling}
        position="bottom"
      />
      
      <CardDeck
        deckType="market"
        remainingCards={cardDecks.market.remaining}
        totalCards={cardDecks.market.total}
        onShuffle={handleShuffleDeck}
        isShuffling={cardDecks.market.isShuffling}
        position="left"
      />
      
      <CardDeck
        deckType="doodad"
        remainingCards={cardDecks.doodad.remaining}
        totalCards={cardDecks.doodad.total}
        onShuffle={handleShuffleDeck}
        isShuffling={cardDecks.doodad.isShuffling}
        position="right"
      />
    </Box>
  );
};

GameField.displayName = 'GameField';
GameCell.displayName = 'GameCell';

export default GameField;
