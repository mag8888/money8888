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

// Конфигурация клеток игрового поля
const CELL_CONFIG = {
  // Малый круг - 24 клетки (0-23) - Крысиные Бега
  innerCircle: [
    { type: 'payday', icon: <AttachMoneyIcon />, color: '#4CAF50', name: 'Зарплата' },
    { type: 'market', icon: <TrendingUpIcon />, color: '#2196F3', name: 'Рынок' },
    { type: 'smallDeal', icon: <HomeIcon />, color: '#4CAF50', name: 'Малая Сделка' },
    { type: 'bigDeal', icon: <BusinessIcon />, color: '#FF9800', name: 'Большая Сделка' },
    { type: 'doodad', icon: <ShoppingCartIcon />, color: '#F44336', name: 'Покупка' },
    { type: 'charity', icon: <VolunteerActivismIcon />, color: '#E91E63', name: 'Благотворительность' },
    { type: 'child', icon: <ChildCareIcon />, color: '#9C27B0', name: 'Ребенок' },
    { type: 'downsized', icon: <WorkOutlineIcon />, color: '#795548', name: 'Сокращение' },
    { type: 'payday', icon: <AttachMoneyIcon />, color: '#4CAF50', name: 'Зарплата' },
    { type: 'market', icon: <TrendingUpIcon />, color: '#2196F3', name: 'Рынок' },
    { type: 'smallDeal', icon: <HomeIcon />, color: '#4CAF50', name: 'Малая Сделка' },
    { type: 'bigDeal', icon: <BusinessIcon />, color: '#FF9800', name: 'Большая Сделка' },
    { type: 'doodad', icon: <ShoppingCartIcon />, color: '#F44336', name: 'Покупка' },
    { type: 'charity', icon: <VolunteerActivismIcon />, color: '#E91E63', name: 'Благотворительность' },
    { type: 'child', icon: <ChildCareIcon />, color: '#9C27B0', name: 'Ребенок' },
    { type: 'downsized', icon: <WorkOutlineIcon />, color: '#795548', name: 'Сокращение' },
    { type: 'payday', icon: <AttachMoneyIcon />, color: '#4CAF50', name: 'Зарплата' },
    { type: 'market', icon: <TrendingUpIcon />, color: '#2196F3', name: 'Рынок' },
    { type: 'smallDeal', icon: <HomeIcon />, color: '#4CAF50', name: 'Малая Сделка' },
    { type: 'bigDeal', icon: <BusinessIcon />, color: '#FF9800', name: 'Большая Сделка' }
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
  onClick 
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick?.(position, type)}
      style={{
        position: 'absolute',
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        border: '2px solid #fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        zIndex: isPlayerHere ? 10 : 1
      }}
    >
      {isPlayerHere ? (
        <Box
          sx={{
            width: 32,
            height: 32,
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
        <Box sx={{ color: 'white', fontSize: '20px' }}>
          {icon}
        </Box>
      )}
      
      {/* Номер позиции */}
      <Typography
        variant="caption"
        sx={{
          position: 'absolute',
          top: -8,
          right: -8,
          backgroundColor: '#333',
          color: 'white',
          borderRadius: '50%',
          width: 16,
          height: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          fontWeight: 'bold'
        }}
      >
        {position}
      </Typography>
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
    
    // Малый круг - 24 клетки (0-23) - по кругу
    for (let i = 0; i < 24; i++) {
      const angle = (i * 15) * (Math.PI / 180); // 15 градусов между клетками (360/24)
      const radius = 120; // Радиус малого круга
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      positions.push({
        position: i,
        x: x + 200, // Центр поля
        y: y + 200,
        ...CELL_CONFIG.innerCircle[i]
      });
    }
    
    // Внешний квадрат - клетки по периметру (24+) - по квадрату
    const squareSize = 160; // Размер внешнего квадрата
    const cellsPerSide = 6; // 6 клеток на сторону (24 клетки всего)
    const cellSpacing = squareSize / cellsPerSide; // Расстояние между клетками
    
    // Верхняя сторона (24-29)
    for (let i = 0; i < 6; i++) {
      positions.push({
        position: i + 24,
        x: 120 + i * cellSpacing,
        y: 40,
        ...CELL_CONFIG.outerSquare[i]
      });
    }
    
    // Правая сторона (30-35)
    for (let i = 0; i < 6; i++) {
      positions.push({
        position: i + 30,
        x: 360,
        y: 120 + i * cellSpacing,
        ...CELL_CONFIG.outerSquare[i + 6]
      });
    }
    
    // Нижняя сторона (36-41)
    for (let i = 0; i < 6; i++) {
      positions.push({
        position: i + 36,
        x: 360 - i * cellSpacing,
        y: 360,
        ...CELL_CONFIG.outerSquare[i + 12]
      });
    }
    
    // Левая сторона (42-47)
    for (let i = 0; i < 6; i++) {
      positions.push({
        position: i + 42,
        x: 40,
        y: 360 - i * cellSpacing,
        ...CELL_CONFIG.outerSquare[i + 18]
      });
    }
    
    return positions;
  }, []);

  return (
    <Box
      sx={{
        position: 'relative',
        width: 400,
        height: 400,
        backgroundColor: '#2F1B40',
        borderRadius: '50%',
        border: '4px solid #6E4D92',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible'
      }}
    >
      {/* Центральная область */}
      <Box
        sx={{
          position: 'absolute',
          width: 80,
          height: 80,
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
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, fontSize: '0.9rem' }}>
          ПОТОК ДЕНЕГ
        </Typography>
        
        {/* Кнопка броска кубиков */}
        {isMyTurn && (
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onRollDice}
            style={{ cursor: 'pointer' }}
          >
            <CasinoIcon sx={{ fontSize: 24, color: '#FFD700' }} />
          </motion.div>
        )}
        
        {/* Значение кубиков */}
        {diceValue > 0 && (
          <Typography variant="h5" sx={{ color: '#FFD700', fontWeight: 'bold', fontSize: '1.2rem' }}>
            {diceValue}
          </Typography>
        )}
      </Box>

      {/* Клетки игрового поля */}
      {cellPositions.map(({ position, x, y, type, icon, color }) => (
        <GameCell
          key={position}
          position={position}
          type={type}
          icon={icon}
          color={color}
          isPlayerHere={!!playerPositions[position]}
          playerColor={playerPositions[position]?.color}
          playerInitial={playerPositions[position]?.initial}
          onClick={onCellClick}
          style={{
            left: x,
            top: y
          }}
        />
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
