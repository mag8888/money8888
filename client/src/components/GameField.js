import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Box, Typography, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip } from '@mui/material';
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
import { getRandomProfession } from '../data/professions';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import DiceAnimation from './DiceAnimation';

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
  number,
  isInner
}) => {
  // Используем цвета по таблице типов клеток
  let cellColor = color;
  
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
        backgroundColor: cellColor,
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

  // Состояние профессии и баланса игрока
  const [playerProfession, setPlayerProfession] = useState(null);
  const [playerBalance, setPlayerBalance] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  
  // Состояние системы ходов
  const [gamePhase, setGamePhase] = useState('waiting'); // waiting, diceRoll, playing, finished
  const [playerOrder, setPlayerOrder] = useState([]); // Порядок игроков
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0); // Индекс текущего игрока
  const [diceResults, setDiceResults] = useState({}); // Результаты бросков кубиков
  const [turnTimer, setTurnTimer] = useState(120); // 2 минуты в секундах
  const [isMyTurn, setIsMyTurn] = useState(false); // Мой ли сейчас ход
  
  // Состояние кубика
  const [diceValue, setDiceValue] = useState(0); // Значение кубика (0 = не брошен)
  const [isDiceRolling, setIsDiceRolling] = useState(false); // Анимация броска кубика
  
  console.log('🚀 [GameField] Компонент инициализирован с пропсами:', {
    players: players?.length || 0,
    currentTurn,
    isMyTurn,
    diceValue
  });
  
  console.log('📊 [GameField] Состояния компонента:', {
    playerProfession: playerProfession?.name || 'null',
    playerBalance,
    gameStarted,
    gamePhase,
    currentPlayerIndex,
    turnTimer,
    isMyTurn
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

  // Функция броска кубика с анимацией
  const rollDice = () => {
    if (isDiceRolling) return; // Предотвращаем повторные клики во время анимации
    
    setIsDiceRolling(true);
    console.log('🎲 [GameField] Начинаем анимацию броска кубика...');
    
    // Генерируем случайное число (в будущем будет приходить с сервера)
    const randomNumber = Math.floor(Math.random() * 6) + 1;
    
    // Устанавливаем значение для анимации
    setDiceValue(randomNumber);
    console.log('🎲 [GameField] Кубик выброшен:', randomNumber);
  };

  // Обработчик завершения анимации кубика
  const handleDiceAnimationComplete = () => {
    setIsDiceRolling(false);
    console.log('✅ [GameField] Анимация кубика завершена');
  };

  // Автоматическое назначение профессии при запуске игры
  useEffect(() => {
    console.log('🔍 [GameField] useEffect сработал:', { gameStarted, playerProfession });
    
    if (!gameStarted && !playerProfession) {
      console.log('✅ [GameField] Условия выполнены, назначаем профессию...');
      
      try {
        // Назначаем случайную профессию
        const randomProfession = getRandomProfession();
        console.log('🎯 [GameField] Получена профессия:', randomProfession);
        
        if (!randomProfession) {
          console.error('❌ [GameField] getRandomProfession вернул null/undefined');
          return;
        }
        
        setPlayerProfession(randomProfession);
        console.log('✅ [GameField] playerProfession установлен');
        
        // Рассчитываем баланс: зарплата + 15-20% сбережений
        const savingsPercentage = 15 + Math.random() * 5; // 15-20%
        const savings = Math.floor(randomProfession.salary * (savingsPercentage / 100));
        const totalBalance = randomProfession.balance + savings;
        
        console.log('💰 [GameField] Расчет баланса:', {
          salary: randomProfession.salary,
          balance: randomProfession.balance,
          savingsPercentage,
          savings,
          totalBalance
        });
        
        setPlayerBalance(totalBalance);
        setGameStarted(true);
        
        // После назначения профессии запускаем игру
        setGamePhase('diceRoll');
        
        console.log('🎯 [GameField] Профессия назначена:', randomProfession.name);
        console.log('💰 [GameField] Баланс игрока:', totalBalance, '(зарплата:', randomProfession.salary, '+ сбережения:', savings, ')');
        console.log('✅ [GameField] Состояние обновлено:', { playerProfession: randomProfession, playerBalance: totalBalance, gameStarted: true });
        console.log('🎮 [GameField] Игра запущена, фаза: diceRoll');
        
      } catch (error) {
        console.error('❌ [GameField] Ошибка при назначении профессии:', error);
      }
    } else {
      console.log('⏭️ [GameField] Условия не выполнены:', { gameStarted, playerProfession });
    }
  }, [gameStarted, playerProfession]);

  // Функции для системы ходов
  const rollDiceForOrder = useCallback(() => {
    const diceValue = Math.floor(Math.random() * 6) + 1;
    console.log('🎲 [GameField] Бросок кубика для очередности:', diceValue);
    
    // Здесь должна быть логика отправки результата на сервер
    // Пока что просто логируем
    setDiceResults(prev => ({ ...prev, [Date.now()]: diceValue }));
    
    return diceValue;
  }, []);

  const startTurn = useCallback(() => {
    console.log('🔄 [GameField] Начинается ход игрока:', currentPlayerIndex);
    setTurnTimer(120); // Сброс таймера на 2 минуты
    setIsMyTurn(true);
    
    // Уведомляем о начале хода
    console.log(`⏰ [GameField] Таймер запущен: 2:00 для игрока ${currentPlayerIndex}`);
  }, [currentPlayerIndex]);

  const endTurn = useCallback(() => {
    console.log('⏭️ [GameField] Завершается ход игрока:', currentPlayerIndex);
    setIsMyTurn(false);
    
    // Сброс кубика при переходе хода
    setDiceValue(0);
    
    // Переход к следующему игроку
    const nextPlayerIndex = (currentPlayerIndex + 1) % playerOrder.length;
    setCurrentPlayerIndex(nextPlayerIndex);
    
    // Запуск хода следующего игрока
    setTimeout(() => startTurn(), 1000);
  }, [currentPlayerIndex, playerOrder.length, startTurn]);

  const skipTurn = useCallback(() => {
    console.log('⏭️ [GameField] Ход пропущен игроком:', currentPlayerIndex);
    endTurn();
  }, [currentPlayerIndex, endTurn]);

  // Таймер хода
  useEffect(() => {
    let interval;
    
    if (gamePhase === 'playing' && isMyTurn && turnTimer > 0) {
      interval = setInterval(() => {
        setTurnTimer(prev => {
          if (prev <= 1) {
            console.log('⏰ [GameField] Время хода истекло! Автоматический переход хода');
            endTurn();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gamePhase, isMyTurn, turnTimer, endTurn]);

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

  // Вычисляем позиции клеток для дизайна как на изображении
  const cellPositions = useMemo(() => {
    const positions = [];
    const cellSize = 42;

    // Внутренний круг: 24 клетки (1-24) по кругу, строго вписанные в большой квадрат
    // Фиксированный размер: радиус = половина стороны квадрата минус размер клетки, уменьшенный на 10%
    const squareSize = 13 * (cellSize + 2); // Размер стороны квадрата (13×13 клеток)
    const innerRadius = ((squareSize / 2) - (cellSize / 2)) * 0.9; // Радиус вписанного круга, уменьшенный на 10%
    const innerCenter = 350; // Центр игрового поля
    
    for (let i = 0; i < 24; i++) {
      // Начинаем с верхнего левого угла и идем по часовой стрелке
      const angle = (i * 15 - 90) * (Math.PI / 180); // -90 чтобы начать сверху
      const x = Math.cos(angle) * innerRadius;
      const y = Math.sin(angle) * innerRadius;
      
      positions.push({
        position: i,
        x: x + innerCenter - cellSize/2,
        y: y + innerCenter - cellSize/2,
        ...CELL_CONFIG.innerCircle[i % CELL_CONFIG.innerCircle.length],
        number: i + 1, // Нумерация от 1 до 24
        isInner: true
      });
    }
    
    // Внешний квадрат: 56 клеток по периметру (14 + 14 + 14 + 14)
    // Позиционируем так чтобы малый круг был строго по центру большого
    const outerFieldSize = 700;
    const innerCircleRadius = 150; // Радиус малого круга
    const outerSquareSize = 14 * (cellSize + 2); // Размер стороны квадрата (14×14)
    
    // Вычисляем отступы так чтобы большой квадрат описывал малый круг
    const marginX = 350 - (outerSquareSize / 2); // Центрируем по X
    const marginY = 350 - (outerSquareSize / 2) - 20; // Поднимаем на 20px вверх
    
    // Верхний ряд (1-14): 14 клеток
    for (let i = 0; i < 14; i++) {
      positions.push({
        position: 24 + i,
        x: marginX + i * (cellSize + 2),
        y: marginY,
        ...CELL_CONFIG.outerSquare[i % CELL_CONFIG.outerSquare.length],
        number: i + 1, // Нумерация от 1 до 14
        isInner: false
      });
    }
    
    // Правый столбец (15-28): 14 клеток - строго под 14
    for (let i = 0; i < 14; i++) {
      positions.push({
        position: 38 + i,
        x: marginX + (13 * (cellSize + 2)), // x координата клетки 14
        y: marginY + (i + 1) * (cellSize + 2),
        ...CELL_CONFIG.outerSquare[(14 + i) % CELL_CONFIG.outerSquare.length],
        number: i + 15, // Нумерация от 15 до 28
        isInner: false
      });
    }
    
    // Нижний ряд (29-42): 14 клеток - в самом низу квадрата
    for (let i = 0; i < 14; i++) {
      positions.push({
        position: 52 + i,
        x: marginX + (13 - i) * (cellSize + 2),
        y: marginY + (14 * (cellSize + 2)), // y координата клетки 28
        ...CELL_CONFIG.outerSquare[(28 + i) % CELL_CONFIG.outerSquare.length],
        number: i + 29, // Нумерация от 29 до 42
        isInner: false
      });
    }
    
    // Левый столбец (43-56): 14 клеток - строго под 1
    for (let i = 0; i < 14; i++) {
      positions.push({
        position: 66 + i,
        x: marginX, // x координата клетки 1
        y: marginY + (i + 1) * (cellSize + 2),
        ...CELL_CONFIG.outerSquare[(42 + i) % CELL_CONFIG.outerSquare.length],
        number: i + 43, // Нумерация от 43 до 56
        isInner: false
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

      {/* Система ходов и таймер */}
      {gamePhase === 'diceRoll' && (
        <Box
          sx={{
            position: 'absolute',
            top: -80,
            right: 20,
            backgroundColor: '#6E4D92',
            borderRadius: 2,
            px: 2,
            py: 1,
            border: '2px solid #FFD700',
            zIndex: 30
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#FFD700',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              mb: 1
            }}
          >
            🎲 Определение очередности
          </Typography>
          <Button
            variant="contained"
            size="small"
            onClick={rollDiceForOrder}
            sx={{
              backgroundColor: '#FFD700',
              color: '#000',
              fontWeight: 'bold',
              '&:hover': { backgroundColor: '#FFC107' }
            }}
          >
            Бросить кубик
          </Button>
        </Box>
      )}

      {/* Таймер хода */}
      {gamePhase === 'playing' && (
        <Box
          sx={{
            position: 'absolute',
            top: -80,
            right: 20,
            backgroundColor: '#6E4D92',
            borderRadius: 2,
            px: 2,
            py: 1,
            border: '2px solid #FFD700',
            zIndex: 30
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#FFD700',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              mb: 1
            }}
          >
            ⏰ Ход игрока {currentPlayerIndex + 1}
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: turnTimer <= 30 ? '#FF5722' : '#4CAF50',
              fontWeight: 'bold',
              textAlign: 'center'
            }}
          >
            {Math.floor(turnTimer / 60)}:{(turnTimer % 60).toString().padStart(2, '0')} || {diceValue > 0 ? diceValue : '🎲'}
          </Typography>
          {isMyTurn && (
            <Button
              variant="contained"
              size="small"
              onClick={skipTurn}
              sx={{
                backgroundColor: '#FF9800',
                color: '#fff',
                fontWeight: 'bold',
                mt: 1,
                '&:hover': { backgroundColor: '#F57C00' }
              }}
            >
              <SkipNextIcon sx={{ mr: 0.5 }} />
              Переход хода
            </Button>
          )}
          

        </Box>
      )}

      {/* Статус ожидания */}
      {gamePhase === 'waiting' && (
        <Box
          sx={{
            position: 'absolute',
            top: -80,
            right: 20,
            backgroundColor: '#6E4D92',
            borderRadius: 2,
            px: 2,
            py: 1,
            border: '2px solid #FFD700',
            zIndex: 30
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#FFD700',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              mb: 1
            }}
          >
            ⏳ Ожидание || {diceValue > 0 ? diceValue : '🎲'}
          </Typography>
          

        </Box>
      )}

      {/* Кнопка броска кубиков для хода */}
      {gamePhase === 'playing' && isMyTurn && (
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



      {/* Убираем отображение профессии - теперь она показывается в правой панели */}

      {/* Центральная область - кубики и колоды карт */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 280,
          height: 280,
          backgroundColor: '#E1BEE7',
          borderRadius: '50%',
          border: '4px solid #9C27B0',
          zIndex: 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1
        }}
      >

        
        {/* 3D Анимированный кубик */}
        <Box onClick={rollDice}>
          <DiceAnimation 
            value={diceValue}
            isRolling={isDiceRolling}
            onAnimationComplete={handleDiceAnimationComplete}
          />
        </Box>
        

      </Box>

      {/* Клетки игрового поля */}
      {cellPositions.map(({ position, x, y, type, icon, color, number, isInner }) => (
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
            name={type}
            number={number}
            isPlayerHere={!!playerPositions[position]}
            playerColor={playerPositions[position]?.color}
            playerInitial={playerPositions[position]?.initial}
            onClick={handleCellClick}
            isInner={isInner}
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

      {/* Стопки карточек - размещены по квадрату */}
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        height: 400,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: 2,
        zIndex: 15
      }}>
        {/* Верхний левый - Small Deal */}
        <CardDeck
          deckType="smallDeal"
          remainingCards={cardDecks.smallDeal.remaining}
          totalCards={cardDecks.smallDeal.total}
          onShuffle={handleShuffleDeck}
          isShuffling={cardDecks.smallDeal.isShuffling}
          position="top-left"
        />
        
        {/* Верхний правый - Big Deal */}
        <CardDeck
          deckType="bigDeal"
          remainingCards={cardDecks.bigDeal.remaining}
          totalCards={cardDecks.bigDeal.total}
          onShuffle={handleShuffleDeck}
          isShuffling={cardDecks.bigDeal.isShuffling}
          position="top-right"
        />
        
        {/* Нижний левый - Market */}
        <CardDeck
          deckType="market"
          remainingCards={cardDecks.market.remaining}
          totalCards={cardDecks.market.total}
          onShuffle={handleShuffleDeck}
          isShuffling={cardDecks.market.isShuffling}
          position="bottom-left"
        />
        
        {/* Нижний правый - Doodad */}
        <CardDeck
          deckType="doodad"
          remainingCards={cardDecks.doodad.remaining}
          totalCards={cardDecks.doodad.total}
          onShuffle={handleShuffleDeck}
          isShuffling={cardDecks.doodad.isShuffling}
          position="bottom-right"
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
