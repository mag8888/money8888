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
import { CELL_CONFIG, PLAYER_COLORS } from '../data/gameCells';
import FastTrackCellModal from './FastTrackCellModal';

// Используем конфигурацию из отдельного файла

// Компонент фишки игрока
const PlayerToken = React.memo(({ 
  player, 
  position, 
  isMoving, 
  onMoveComplete,
  cellPositions 
}) => {
  const [currentPosition, setCurrentPosition] = useState(() => {
    // Инициализируем с координатами по умолчанию
    const defaultCoords = { x: 350, y: 350 }; // Центр поля
    if (cellPositions && Array.isArray(cellPositions) && position !== undefined) {
      const cell = cellPositions.find(c => c.position === position);
              if (cell) {
          // Позиционируем фишку в правом верхнем углу клетки
          return { x: cell.x + 30, y: cell.y + 8 };
        }
    }
    return defaultCoords;
  });
  
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Получаем координаты текущей позиции
  const getPositionCoordinates = (pos) => {
    if (!cellPositions || !Array.isArray(cellPositions)) {
      return { x: 350, y: 350 }; // Центр поля по умолчанию
    }
    
    const cell = cellPositions.find(c => c.position === pos);
    if (cell) {
      // Позиционируем фишку в правом верхнем углу клетки, чтобы не перекрывать содержимое
      return { x: cell.x + 30, y: cell.y + 8 };
    }
    return { x: 350, y: 350 }; // Центр поля по умолчанию
  };
  
  // Анимация движения фишки
  useEffect(() => {
    if (isMoving && !isAnimating && position !== undefined) {
      setIsAnimating(true);
      
      // Начинаем с позиции 0 (первая клетка)
      const startPos = getPositionCoordinates(0);
      const endPos = getPositionCoordinates(position);
      
      // Анимация движения по клеткам
      const moveStep = (currentStep, totalSteps) => {
        if (currentStep >= totalSteps) {
          setIsAnimating(false);
          onMoveComplete?.();
          return;
        }
        
        // Вычисляем позицию для текущего шага (двигаемся по клеткам)
        const currentPos = currentStep;
        const coords = getPositionCoordinates(currentPos);
        setCurrentPosition(coords);
        
        // Следующий шаг через 500мс (пол секунды)
        setTimeout(() => moveStep(currentStep + 1, totalSteps), 500);
      };
      
      // Запускаем анимацию
      moveStep(0, Math.max(1, position + 1));
    }
  }, [isMoving, position, isAnimating, cellPositions, onMoveComplete]);
  
  // Обновляем позицию при изменении
  useEffect(() => {
    if (!isMoving && !isAnimating && position !== undefined) {
      const coords = getPositionCoordinates(position);
      setCurrentPosition(coords);
    }
  }, [position, isMoving, isAnimating, cellPositions]);

  // Инициализируем позицию при монтировании компонента
  useEffect(() => {
    if (position !== undefined && cellPositions && Array.isArray(cellPositions)) {
      const coords = getPositionCoordinates(position);
      setCurrentPosition(coords);
    }
  }, [position, cellPositions]);
  
  return (
    <motion.div
      style={{
        position: 'absolute',
        left: currentPosition.x - 12,
        top: currentPosition.y - 12,
        zIndex: 200,
        width: 24,
        height: 24,
        borderRadius: '50%',
        backgroundColor: player.color || PLAYER_COLORS[0],
        border: '2px solid #FFFFFF',
        boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '12px',
        cursor: 'pointer'
      }}
      animate={{
        scale: isAnimating ? [1, 1.1, 1] : 1,
        rotate: isAnimating ? [0, 5, -5, 0] : 0
      }}
      transition={{
        duration: 0.5,
        repeat: isAnimating ? Infinity : 0
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      {player.username?.charAt(0)?.toUpperCase() || 'И'}
    </motion.div>
  );
});

PlayerToken.displayName = 'PlayerToken';

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
  isMyTurn,
  diceValue,
  isRolling,
  gamePhase,
  diceAnimation
}) => {
  // Убираем лишние логи для уменьшения спама
  // console.log('🎯 [GameField] Получены пропсы:', {
  //   players: players?.length || 0,
  //   currentTurn,
  //   isMyTurn,
  //   diceValue,
  //   isRolling,
  //   onRollDice: typeof onRollDice
  // });

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

  // Состояние модала "большого круга" (Fast Track)
  const [fastTrackModal, setFastTrackModal] = useState({
    open: false,
    cellData: null
  });

  // Состояние профессии и баланса игрока
  const [playerProfession, setPlayerProfession] = useState(null);
  const [playerBalance, setPlayerBalance] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  
  // Состояние системы ходов
  const [playerOrder, setPlayerOrder] = useState([]); // Порядок игроков
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0); // Индекс текущего игрока
  const [diceResults, setDiceResults] = useState({}); // Результаты бросков кубиков
  const [turnTimer, setTurnTimer] = useState(120); // 2 минуты в секундах
  
  // Состояние фишек игроков
  const [playerTokens, setPlayerTokens] = useState({});
  const [movingPlayers, setMovingPlayers] = useState(new Set());
  

  
  // Убираем localIsMyTurn, используем только isMyTurn из пропсов
  

  
  // Убираем лишние логи для уменьшения спама
  // console.log('🚀 [GameField] Компонент инициализирован с пропсами:', {
  //   players: players?.length || 0,
  //   currentTurn,
  //   isMyTurn,
  //   diceValue
  // });
  
  // console.log('📊 [GameField] Состояния компонента:', {
  //   playerProfession: playerProfession?.name || 'null',
  //   playerBalance,
  //   gameStarted,
  //   gamePhase,
  //   currentPlayerIndex,
  //   turnTimer,
  //   isMyTurn
  // });

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

  // Автоматическое назначение профессии при запуске игры
  // Профессия теперь назначается при входе в комнату, а не автоматически
  // useEffect(() => {
  //   console.log('🔍 [GameField] useEffect сработал:', { gameStarted, playerProfession });
  //   
  //   if (!gameStarted && !playerProfession) {
  //     console.log('✅ [GameField] Условия выполнены, назначаем профессию...');
  //     
  //     try {
  //       // Назначаем случайную профессию
  //       const randomProfession = getRandomProfession();
  //       console.log('🎯 [GameField] Получена профессия:', randomProfession);
  //       
  //       if (!randomProfession) {
  //         console.error('❌ [GameField] getRandomProfession вернул null/undefined');
  //         return;
  //       }
  //       
  //       setPlayerProfession(randomProfession);
  //       console.log('✅ [GameField] playerProfession установлен');
  //       
  //       // Рассчитываем баланс: зарплата + 15-20% сбережений
  //       const savingsPercentage = 15 + Math.random() * 5; // 15-20%
  //       const savings = Math.floor(randomProfession.salary * (savingsPercentage / 100));
  //       const totalBalance = randomProfession.balance + savings;
  //       
  //       console.log('💰 [GameField] Расчет баланса:', {
  //         salary: randomProfession.salary,
  //         balance: randomProfession.balance,
  //         savingsPercentage,
  //         savings,
  //         totalBalance
  //       });
  //       
  //       setPlayerBalance(totalBalance);
  //       setGameStarted(true);
  //       
  //       // После назначения профессии запускаем игру
  //       setGamePhase('diceRoll');
  //       
  //       // Запускаем первый ход
  //       // setLocalIsMyTurn(true); // Удалено
  //       setTurnTimer(120);
  //       
  //       console.log('🎯 [GameField] Профессия назначена:', randomProfession.name);
  //       console.log('💰 [GameField] Баланс игрока:', totalBalance, '(зарплата:', randomProfession.salary, '+ сбережения:', savings, ')');
  //       console.log('✅ [GameField] Состояние обновлено:', { playerProfession: randomProfession, playerBalance: totalBalance, gameStarted: true });
  //       console.log('🎮 [GameField] Игра запущена, фаза: diceRoll');
  //       console.log('⏰ [GameField] Первый ход запущен, таймер: 2:00');
  //       
  //     } catch (error) {
  //       console.error('❌ [GameField] Ошибка при назначении профессии:', error);
  //     }
  //   } else {
  //       console.log('⏭️ [GameField] Условия не выполнены:', { gameStarted, playerProfession });
  //   }
  // }, [gameStarted, playerProfession]);

  // Функции для системы ходов
  const rollDiceForOrder = useCallback(() => {
    const diceValue = Math.floor(Math.random() * 6) + 1;
    
    
    // Здесь должна быть логика отправки результата на сервер
    // Пока что просто логируем
    setDiceResults(prev => ({ ...prev, [Date.now()]: diceValue }));
    
    return diceValue;
  }, []);

  const startTurn = useCallback(() => {
    
    setTurnTimer(120); // Сброс таймера на 2 минуты
    // setLocalIsMyTurn(true); // Удалено
    
    // Сброс кубика при переходе хода
    // setLocalDiceValue(0); // Удалено
    
    // Переход к следующему игроку
    setCurrentPlayerIndex(prev => (prev + 1) % playerOrder.length);
  }, [currentPlayerIndex, playerOrder.length]);

  const endTurn = useCallback(() => {
    
    // setLocalIsMyTurn(false); // Удалено
    
    // Сброс кубика при переходе хода
    // setLocalDiceValue(0); // Удалено
    
    // Переход к следующему игроку
    const nextPlayerIndex = (currentPlayerIndex + 1) % playerOrder.length;
    setCurrentPlayerIndex(nextPlayerIndex);
    
    // Запуск хода следующего игрока
    setTimeout(() => startTurn(), 1000);
  }, [currentPlayerIndex, playerOrder.length, startTurn]);

  const skipTurn = useCallback(() => {
    
    endTurn();
  }, [currentPlayerIndex, endTurn]);

  // Функция для движения фишки игрока
  const movePlayerToken = useCallback((playerId, diceValue) => {
    // Убираем лишние логи для уменьшения спама
  // console.log(`🎯 [GameField] Движение фишки игрока ${playerId} на ${diceValue} клеток`);
    
    // Находим игрока
    const player = players?.find(p => p.id === playerId);
    if (!player) {
      console.error('❌ [GameField] Игрок не найден:', playerId);
      return;
    }
    
    // Вычисляем новую позицию
    const currentPos = player.position || 0;
    const newPos = Math.min(currentPos + diceValue, 23); // Максимум 23 клетки (внутренний круг)
    
    
    
    // Обновляем состояние фишек
    setPlayerTokens(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        position: newPos,
        isMoving: true
      }
    }));
    
    // Добавляем игрока в список движущихся
    setMovingPlayers(prev => new Set([...prev, playerId]));
    
    // Через некоторое время завершаем движение
    const moveDuration = (newPos - currentPos) * 500 + 1000; // Время движения + 1 секунда на завершение
    
    const moveTimer = setTimeout(() => {
      setMovingPlayers(prev => {
        const newSet = new Set(prev);
        newSet.delete(playerId);
        return newSet;
      });
      
      setPlayerTokens(prev => ({
        ...prev,
        [playerId]: {
          ...prev[playerId],
          isMoving: false
        }
      }));
      

    }, moveDuration);
    
    // Очищаем таймер при размонтировании компонента
    return () => clearTimeout(moveTimer);
  }, [players]);

  // Функция для броска кубика и движения
  const handleDiceRoll = useCallback(() => {
    if (!isMyTurn || !currentTurn) return;
    
    
    
    // Генерируем случайное значение кубика (1-6)
    const diceValue = Math.floor(Math.random() * 6) + 1;
    
    
    // Двигаем фишку игрока
    movePlayerToken(currentTurn, diceValue);
    
    // Вызываем callback для обновления состояния в родительском компоненте
    onRollDice?.(diceValue);
  }, [isMyTurn, currentTurn, movePlayerToken, onRollDice]);

  // Таймер хода
  useEffect(() => {
    let interval;
    
    if ((gamePhase === 'playing' || gamePhase === 'diceRoll') && isMyTurn && turnTimer > 0) {
      interval = setInterval(() => {
        setTurnTimer(prev => {
          if (prev <= 1) {
      
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
    // Если это клетка "большого круга" и у неё есть данные
    if (type === 'fastTrack' && CELL_CONFIG.outerSquare[position - 25]?.data) {
      setFastTrackModal({
        open: true,
        cellData: CELL_CONFIG.outerSquare[position - 25]
      });
    } else {
      // Обычная клетка
      setCellDialog({
        open: true,
        cellNumber: number,
        cellName: name,
        cellType: type
      });
    }
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
    
    // Добавляем проверку на undefined
    if (players && Array.isArray(players)) {
      players.forEach(player => {
        if (player.position !== undefined) {
          positions[player.position] = {
            color: player.color || '#9C27B0',
            initial: player.username?.charAt(0) || 'И',
            id: player.id
          };
        }
      });
    }
    
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
    // Размещаем равномерно по периметру фона 700x700
    const cellSpacing = cellSize + 2;
    
    // Вычисляем размеры внешнего квадрата (14x14 клеток)
    const outerSquareWidth = 14 * cellSpacing; // 14 клеток по ширине
    const outerSquareHeight = 14 * cellSpacing; // 14 клеток по высоте
    
    // Центрируем внешний квадрат в поле 700x700
    const marginX = (700 - outerSquareWidth) / 2;
    const marginY = (700 - outerSquareHeight) / 2;
    
    // Верхний ряд (1-14): 14 клеток слева направо (подняли вверх на 1 клетку, растянули на 15%, сдвинули влево на 17px)
    for (let i = 0; i < 14; i++) {
      positions.push({
        position: 24 + i,
        x: marginX + i * (cellSpacing * 1.15) - 42, // Растянули по ширине на 15% и сдвинули влево на 42px (17+15+10)
        y: marginY - cellSpacing, // Подняли вверх на 1 клеткупи
        ...CELL_CONFIG.outerSquare[i % CELL_CONFIG.outerSquare.length],
        number: i + 1, // Нумерация от 1 до 14
        isInner: false
      });
    }
    
    // Нижний ряд (15-28): 14 клеток слева направо (дублируем верхний ряд вниз на ~700px)
    for (let i = 0; i < 14; i++) {
      positions.push({
        position: 38 + i,
        x: marginX + i * (cellSpacing * 1.15) - 42, // Те же параметры что и у верхнего ряда
        y: marginY + 700 - (cellSpacing * 2), // Размещаем примерно на 700px ниже, но подняли вверх на 2 клетки (1.5 + 0.5)
        ...CELL_CONFIG.outerSquare[(14 + i) % CELL_CONFIG.outerSquare.length],
        number: 40 - i, // Нумерация от 40 до 27 (справа налево)
        isInner: false
      });
    }
    
    // Левый столбец (40-51): 12 клеток сверху вниз (копия правого столбца в левом краю)
    for (let i = 0; i < 12; i++) {
      positions.push({
        position: 52 + i,
        x: marginX - 42, // Прямо под клетку 1, сдвинули влево на 42px
        y: marginY + (i * (cellSpacing * 1.15)) + 5, // Равномерно распределяем по высоте, увеличили высоту на 15%, сдвинули вниз на 5px
        ...CELL_CONFIG.outerSquare[(14 + i) % CELL_CONFIG.outerSquare.length],
        number: 52 - i, // Нумерация от 52 до 41 (сверху вниз)
        isInner: false
      });
    }
    
    // Правый столбец (15-26): 12 клеток сверху вниз (в области красного прямоугольника)
    for (let i = 0; i < 12; i++) {
      positions.push({
        position: 66 + i,
        x: marginX + 14 * (cellSpacing * 1.15) - 42 - 42 - 5 - 3, // Справа от основного пути, сдвинули влево на 92px (42+42+5+3)
        y: marginY + (i * (cellSpacing * 1.15)) + 5, // Равномерно распределяем по высоте, увеличили высоту на 15%, сдвинули вниз на 5px (3+2)
        ...CELL_CONFIG.outerSquare[(14 + i) % CELL_CONFIG.outerSquare.length],
        number: i + 15, // Нумерация от 15 до 26
        isInner: false
      });
    }
    
    // Убрали правый столбец, нижний ряд и левый столбец
    // Оставили только верхний ряд

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
        overflow: 'visible',
        background: `
          radial-gradient(ellipse at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%),
          radial-gradient(ellipse at center, rgba(25,25,112,0.3) 0%, rgba(0,0,0,0.9) 100%),
          linear-gradient(45deg, #000428 0%, #004e92 25%, #000428 50%, #004e92 75%, #000428 100%)
        `,
        backgroundSize: '100% 100%, 100% 100%, 200% 200%',
        animation: 'starryNight 20s ease-in-out infinite',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(2px 2px at 20px 30px, #eee, transparent),
            radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 90px 40px, #fff, transparent),
            radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.6), transparent),
            radial-gradient(2px 2px at 160px 30px, #ddd, transparent),
            radial-gradient(2px 2px at 200px 70px, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 250px 40px, #fff, transparent),
            radial-gradient(1px 1px at 290px 80px, rgba(255,255,255,0.6), transparent),
            radial-gradient(2px 2px at 320px 30px, #ddd, transparent),
            radial-gradient(2px 2px at 360px 70px, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 410px 40px, #fff, transparent),
            radial-gradient(1px 1px at 450px 80px, rgba(255,255,255,0.6), transparent),
            radial-gradient(2px 2px at 480px 30px, #ddd, transparent),
            radial-gradient(2px 2px at 520px 70px, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 570px 40px, #fff, transparent),
            radial-gradient(1px 1px at 610px 80px, rgba(255,255,255,0.6), transparent),
            radial-gradient(2px 2px at 640px 30px, #ddd, transparent),
            radial-gradient(2px 2px at 680px 70px, rgba(255,255,255,0.8), transparent),
            radial-gradient(2px 2px at 20px 650px, #eee, transparent),
            radial-gradient(2px 2px at 60px 690px, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 100px 650px, #fff, transparent),
            radial-gradient(1px 1px at 140px 690px, rgba(255,255,255,0.6), transparent),
            radial-gradient(2px 2px at 180px 650px, #ddd, transparent),
            radial-gradient(2px 2px at 220px 690px, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 260px 650px, #fff, transparent),
            radial-gradient(1px 1px at 300px 690px, rgba(255,255,255,0.6), transparent),
            radial-gradient(2px 2px at 340px 650px, #ddd, transparent),
            radial-gradient(2px 2px at 380px 690px, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 420px 650px, #fff, transparent),
            radial-gradient(1px 1px at 460px 690px, rgba(255,255,255,0.6), transparent),
            radial-gradient(2px 2px at 500px 650px, #ddd, transparent),
            radial-gradient(2px 2px at 540px 690px, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 580px 650px, #fff, transparent),
            radial-gradient(1px 1px at 620px 690px, rgba(255,255,255,0.6), transparent),
            radial-gradient(2px 2px at 660px 650px, #ddd, transparent),
            radial-gradient(2px 2px at 700px 690px, rgba(255,255,255,0.6), transparent)
          `,
          backgroundRepeat: 'repeat',
                          backgroundSize: '700px 700px',
          animation: 'twinkle 4s ease-in-out infinite alternate',
          zIndex: 0
        },
        '@keyframes diceRoll': {
          '0%': { transform: 'translate(-50%, -50%) rotate(0deg) scale(1)' },
          '25%': { transform: 'translate(-50%, -50%) rotate(90deg) scale(1.1)' },
          '50%': { transform: 'translate(-50%, -50%) rotate(180deg) scale(0.9)' },
          '75%': { transform: 'translate(-50%, -50%) rotate(270deg) scale(1.1)' },
          '100%': { transform: 'translate(-50%, -50%) rotate(360deg) scale(1)' }
        },
        '@keyframes diceResult': {
          '0%': { transform: 'translate(-50%, -50%) scale(0.5) rotate(0deg)', opacity: 0 },
          '50%': { transform: 'translate(-50%, -50%) scale(1.2) rotate(180deg)', opacity: 0.8 },
          '100%': { transform: 'translate(-50%, -50%) scale(1) rotate(360deg)', opacity: 1 }
        },
        '@keyframes fadeIn': {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        '@keyframes logoGlow': {
          '0%': {
            opacity: 0.6,
            transform: 'translate(-50%, -50%) scale(1)'
          },
          '100%': {
            opacity: 1,
            transform: 'translate(-50%, -50%) scale(1.1)'
          }
        },
        '@keyframes starryNight': {
          '0%, 100%': { backgroundPosition: '0% 0%, 0% 0%, 0% 0%' },
          '25%': { backgroundPosition: '0% 0%, 0% 0%, 50% 50%' },
          '50%': { backgroundPosition: '0% 0%, 0% 0%, 100% 100%' },
          '75%': { backgroundPosition: '0% 0%, 0% 0%, 50% 50%' }
        },
        '@keyframes twinkle': {
          '0%': { opacity: 0.3 },
          '100%': { opacity: 1 }
        }
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
              color: turnTimer <= 30 ? '#f44336' : turnTimer <= 60 ? '#ff9800' : '#4caf50',
              fontWeight: 'bold',
              textAlign: 'center',
              textShadow: turnTimer <= 15 ? '0 0 10px rgba(244, 67, 54, 0.5)' : 'none',
              animation: turnTimer <= 15 ? 'pulse 1s infinite' : 'none'
            }}
          >
            {Math.floor(turnTimer / 60)}:{(turnTimer % 60).toString().padStart(2, '0')} || {diceValue > 0 ? diceValue : '🎲'}
          </Typography>
          {isMyTurn && (
            <Typography
              variant="body2"
              sx={{
                color: '#4caf50',
                textAlign: 'center',
                fontWeight: 'bold'
              }}
            >
              ⏰ Ваш ход
            </Typography>
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

              {/* Центральная область - лого по центру игрового поля */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 260,
            height: 260,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}
        >
        
        {/* Светлая подсветка под логотипом */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '120%',
            height: '120%',
            background: `
              radial-gradient(ellipse at center, 
                rgba(255, 215, 0, 0.3) 0%, 
                rgba(255, 215, 0, 0.2) 30%, 
                rgba(255, 215, 0, 0.1) 60%, 
                rgba(255, 215, 0, 0.05) 80%, 
                transparent 100%
              )
            `,
            borderRadius: '50%',
            zIndex: 50,
            filter: 'blur(8px)',
            animation: 'logoGlow 3s ease-in-out infinite alternate'
          }}
        />
        
        {/* Центральное лого - точно по центру */}
        <motion.div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            zIndex: 51,
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.01)'
          }}
          whileHover={{ 
            scale: 1.05,
            rotate: [0, -2, 2, 0]
          }}
          animate={{
            y: [0, -5, 0],
            filter: [
              'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
              'drop-shadow(0 6px 16px rgba(0,0,0,0.4))',
              'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
            ]
          }}
          transition={{
            scale: { duration: 0.3, ease: "easeInOut" },
            rotate: { duration: 0.6, ease: "easeInOut" },
            y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            filter: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <img 
            src="/images/center-logo.svg" 
            alt="Поток Денег Logo" 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              pointerEvents: 'none',
              display: 'block',
              maxWidth: '100%',
              maxHeight: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.01)'
            }}
            onError={(e) => {
              console.error('❌ [GameField] Ошибка загрузки лого:', e);
              e.target.style.display = 'none';
              // Показываем fallback текст
              const fallback = e.target.parentNode.querySelector('.logo-fallback');
              if (fallback) fallback.style.display = 'flex';
            }}
            onLoad={(e) => {
        
              // Скрываем fallback текст
              const fallback = e.target.parentNode.querySelector('.logo-fallback');
              if (fallback) fallback.style.display = 'none';
            }}
          />
          
          {/* Fallback текст если лого не загружается */}
          <Box
            className="logo-fallback"
            sx={{
              display: 'none',
              width: '100%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              color: '#6E4D92',
              textAlign: 'center',
              position: 'absolute',
              top: 0,
              left: 0
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 'bold',
                fontSize: '3rem',
                color: '#FFD700',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                mb: 1
              }}
            >
              $
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                color: '#6E4D92',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}
            >
              ПОТОК ДЕНЕГ
            </Typography>
          </Box>
        </motion.div>
        
        {/* Декоративный текст - убран, так как лого уже в центре */}
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
            isPlayerHere={false}
            playerColor={null}
            playerInitial={null}
            onClick={handleCellClick}
            isInner={isInner}
          />
        </Box>
      ))}

      {/* Пунктирные линии убраны */}

      {/* Кубик теперь отображается в правой панели GameControls */}



      {/* Стопки карточек - размещены по центру в сетке 2x2 */}
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 350,
        height: 350,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: 8,
        zIndex: 500,
        alignItems: 'center',
        justifyContent: 'center',
        placeItems: 'center'
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

      {/* Фишки игроков */}
      {players && Array.isArray(players) && players.length > 0 ? (
        players.map(player => (
          <PlayerToken
            key={player.id}
            player={player}
            position={player.position || 0}
            isMoving={player.isMoving || false}
            onMoveComplete={() => {
              // Логика после завершения движения фишки
              // Например, обновление позиции игрока в состоянии
              // setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, position: player.nextPosition } : p));
            }}
            cellPositions={cellPositions || []}
          />
        ))
      ) : (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 200,
            color: '#FFFFFF',
            fontSize: '1rem',
            opacity: 0.7
          }}
        >
          Ожидание игроков...
        </Box>
      )}


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

      {/* Модал "большого круга" (Fast Track) */}
      <FastTrackCellModal
        open={fastTrackModal.open}
        onClose={() => setFastTrackModal({ ...fastTrackModal, open: false })}
        cellData={fastTrackModal.cellData}
      />

      {/* Кнопка "Бросить кубик" теперь находится в правом меню GameControls */}

      {/* Анимация кубика теперь находится в правом меню GameControls */}

      {/* Убираем компонент выбора профессии - теперь она назначается при регистрации */}
    </Box>
  );
};

GameField.displayName = 'GameField';
GameCell.displayName = 'GameCell';

export default GameField;
