import React, { useMemo, useState } from 'react';
import { Box, Typography, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
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
  name,
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
      onClick={() => {
        onClick?.(position, type, name, number);
      }}
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

  // Состояние всплывающего окна с информацией о клетке
  const [cellDialog, setCellDialog] = useState({
    open: false,
    cellNumber: '',
    cellName: '',
    cellType: ''
  });

  // Убираем состояние профессии - теперь она приходит из пропсов
  // const [professionDialogOpen, setProfessionDialogOpen] = useState(false);
  // const [playerProfession, setPlayerProfession] = useState(null);
  // const [gameStarted, setGameStarted] = useState(false);

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

  // Функция получения описания клетки
  const getCellDescription = (cellType) => {
    switch (cellType) {
      case 'opportunity':
        return '🟢 Возможность - Вы можете купить активы: недвижимость, бизнес, акции. Выберите между малой сделкой (до $5,000) или большой сделкой (от $5,000).';
      case 'doodad':
        return '🛒 Всякая всячина - Обязательные траты от $100 до $4,000 на бытовые нужды: чайник, кофе, машина, ТВ и прочее.';
      case 'charity':
        return '❤️ Благотворительность - Пожертвуйте 10% от дохода для получения возможности бросать 2 кубика в течение 3 ходов. Можно отказаться.';
      case 'payday':
        return '💰 PayDay - Получите зарплату! Ваш ежемесячный доход зачисляется на счет.';
      case 'market':
        return '📈 Рынок - Появляются покупатели на ваши активы. Можете продать недвижимость, бизнес или акции по рыночной цене.';
      case 'child':
        return '👶 Ребенок - Родился ребенок! Увеличиваются ежемесячные расходы.';
      case 'downsized':
        return '💸 Потеря - Увольнение! Оплатите один раз расходы и пропустите 2 хода ИЛИ 3 раза расходы без пропуска хода. При невозможности оплаты - кредит или банкротство.';
      case 'cashflowDay':
        return '💵 День Потока - Получите доход от всех ваших активов (недвижимость, бизнес, акции).';
      case 'fastTrack':
        return '🚀 Fast Track - Быстрый путь к финансовой свободе! Специальные возможности для продвинутых игроков.';
      default:
        return '🎯 Игровая клетка - взаимодействуйте с ней для продвижения в игре.';
    }
  };

  // Обработчик клика на клетку
  const handleCellClick = (position, type, name, number) => {
    setCellDialog({
      open: true,
      cellNumber: number,
      cellName: name,
      cellType: type
    });
    onCellClick?.(position, type);
  };

  // Убираем функции профессии - теперь она назначается при регистрации
  // const handleProfessionSelect = (profession) => {
  //   setPlayerProfession(profession);
  //   setGameStarted(true);
  //   console.log('Выбрана профессия:', profession);
  // };

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

    // Внутренний контур - 24 клетки по кругу, центр в 350px (700/2)
    const outerFieldSize = 700; // Размер внешнего поля
    const innerRadius = 150; // Радиус внутреннего круга
    const innerCenter = 350; // Центр внутреннего круга = центр внешнего поля (700/2)
    
    for (let i = 0; i < 24; i++) {
      // Начинаем с верха и идем по часовой стрелке
      const angle = (i * 15 - 90) * (Math.PI / 180); // -90 чтобы начать сверху
      const x = Math.cos(angle) * innerRadius;
      const y = Math.sin(angle) * innerRadius;
      
      positions.push({
        position: i,
        x: x + innerCenter - cellSize/2,
        y: y + innerCenter - cellSize/2,
        ...CELL_CONFIG.innerCircle[i % CELL_CONFIG.innerCircle.length],
        number: i + 1 // Нумерация от 1 до 24
      });
    }
    
    // Внешний контур - квадрат 12×12 клеток, сдвинутый вверх и влево
    const marginX = -90; // Еще 20px влево (-70 - 20)
    const marginY = -55; // Еще 5px вверх (-50 - 5)
    
    // Верхняя сторона (12 клеток) с отступом 2px между клетками
    for (let i = 0; i < 12; i++) {
      const x = marginX + i * (cellSize + 2);
      const y = marginY;
      positions.push({
        position: 24 + i,
        x: x,
        y: y,
        ...CELL_CONFIG.outerSquare[i % CELL_CONFIG.outerSquare.length],
        number: 25 + i // Нумерация от 25 до 36
      });
    }
    
    // Правая сторона (12 клеток)
    for (let i = 0; i < 12; i++) {
      const x = outerFieldSize - cellSize + marginX;
      const y = marginY + cellSize + i * (outerFieldSize - 3 * cellSize) / 11;
      positions.push({
        position: 36 + i,
        x: x,
        y: y,
        ...CELL_CONFIG.outerSquare[(12 + i) % CELL_CONFIG.outerSquare.length],
        number: 37 + i // Нумерация от 37 до 48
      });
    }
    
    // Нижняя сторона (12 клеток) - начинается напротив клеток 62 и 47
    for (let i = 0; i < 12; i++) {
      const x = marginX + (11 - i) * (cellSize + 2);
      const y = outerFieldSize - cellSize + marginY;
      positions.push({
        position: 48 + i,
        x: x,
        y: y,
        ...CELL_CONFIG.outerSquare[(24 + i) % CELL_CONFIG.outerSquare.length],
        number: 49 + i // Нумерация от 49 до 60
      });
    }
    
    // Левая сторона (12 клеток)
    for (let i = 0; i < 12; i++) {
      const x = marginX;
      const y = outerFieldSize - cellSize - cellSize + marginY - i * (outerFieldSize - 3 * cellSize) / 11;
      positions.push({
        position: 60 + i,
        x: x,
        y: y,
        ...CELL_CONFIG.outerSquare[(36 + i) % CELL_CONFIG.outerSquare.length],
        number: 61 + i // Нумерация от 61 до 72
      });
    }
    

    return positions;
  }, []);

  return (
    <Box
      sx={{
        position: 'relative',
        width: 700, // Размер для размещения внешнего квадрата
        height: 700, // Размер для размещения внешнего квадрата
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible'
      }}
    >
      {/* Внутренний круг - привязан к круглому полю */}
      <Box
        sx={{
          position: 'absolute',
          width: 495,
          height: 495,
          backgroundColor: '#2F1B40',
          borderRadius: '50%',
          border: '4px solid #6E4D92',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10
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

      {/* Убираем кнопку выбора профессии - теперь она назначается при регистрации */}

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

      {/* Убираем отображение профессии - теперь она показывается в другом месте */}



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
            name={name}
            number={number}
            isPlayerHere={!!playerPositions[position]}
            playerColor={playerPositions[position]?.color}
            playerInitial={playerPositions[position]?.initial}
            onClick={handleCellClick}
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

      {/* Всплывающее окно с информацией о клетке */}
      <Dialog
        open={cellDialog.open}
        onClose={() => setCellDialog({ ...cellDialog, open: false })}
        maxWidth="md"
        PaperProps={{
          sx: {
            backgroundColor: '#FFFFFF',
            borderRadius: 0,
            boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
            border: '3px solid #6E4D92',
            width: 500,
            height: 500,
            maxWidth: 500,
            maxHeight: 500,
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: '#6E4D92', 
          color: 'white', 
          textAlign: 'center',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          py: 2
        }}>
          🎯 Клетка {cellDialog.cellNumber}
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: '#FFFFFF', color: '#333333', py: 3 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#2F1B40' }}>
              {cellDialog.cellName}
            </Typography>
            <Typography variant="h6" sx={{ mb: 2, color: '#6E4D92', fontWeight: 'bold' }}>
              Тип: {cellDialog.cellType}
            </Typography>
            <Box sx={{ 
              backgroundColor: '#F5F5F5', 
              borderRadius: 2, 
              p: 2, 
              border: '2px solid #E0E0E0',
              mt: 2
            }}>
              <Typography variant="body1" sx={{ color: '#333333', lineHeight: 1.6, fontSize: '1.1rem' }}>
                {getCellDescription(cellDialog.cellType)}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: '#F5F5F5', justifyContent: 'center', pb: 3, px: 3 }}>
          <Button 
            onClick={() => setCellDialog({ ...cellDialog, open: false })}
            variant="contained"
            size="large"
            sx={{ 
              backgroundColor: '#6E4D92',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              px: 4,
              py: 1.5,
              borderRadius: 2,
              '&:hover': { 
                backgroundColor: '#8E6DB2',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(110,77,146,0.4)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            ЗАКРЫТЬ
          </Button>
        </DialogActions>
      </Dialog>

      {/* Убираем компонент выбора профессии - теперь она назначается при регистрации */}
    </Box>
  );
};

GameField.displayName = 'GameField';
GameCell.displayName = 'GameCell';

export default GameField;
