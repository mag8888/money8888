// 🚨 ВНИМАНИЕ! ЭТОТ ФАЙЛ ОТРЕДАКТИРОВАН! 🚨
// 🎯 Тестовая кнопка добавлена в GameBoard.js
// 📅 Дата редактирования: СЕЙЧАС
// 👤 Редактор: AI Assistant
// 🔍 ФАЙЛ ОТКРЫТ В CURSOR - ПРОВЕРЬТЕ ЭТО!
// 📁 Путь: client/src/components/GameBoard.js

import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, Button } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import socket from '../socket';
import CasinoIcon from '@mui/icons-material/Casino';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import HomeIcon from '@mui/icons-material/Home';
import GavelIcon from '@mui/icons-material/Gavel';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import SpaIcon from '@mui/icons-material/Spa';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import CampaignIcon from '@mui/icons-material/Campaign';
import WarningIcon from '@mui/icons-material/Warning';
import HotelIcon from '@mui/icons-material/Hotel';
import LandscapeIcon from '@mui/icons-material/Landscape';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FlightIcon from '@mui/icons-material/Flight';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { CASHFLOW_THEME, COMPONENT_STYLES } from '../styles/cashflow-theme';
import AnimatedCell from './AnimatedCell';
import StylishControlPanel from './StylishControlPanel';

// 🎮 Интеграция модулей CASHFLOW
import { 
  getGameBoard, 
  processGameAction, 
  getCellInfo,
  getNeighborCells 
} from '../modules/index.js';

// Импортируем конфигурацию Cashflow
import { CELL_CONFIG, PLAYER_COLORS } from '../data/gameCells';

// Дополнительные иконки для Cashflow
import ChildCareIcon from '@mui/icons-material/ChildCare';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

// Конфигурация игрового поля Cashflow
const BOARD_CONFIG = {
  // Внутренний круг - 24 клетки (Крысиные Бега)
  innerCircle: CELL_CONFIG.innerCircle,
  
  // Внешний квадрат - 50 клеток (Быстрый Путь)
  outerSquare: CELL_CONFIG.outerSquare,
  
  // Объединяем все клетки для рендеринга
  getAllCells: function() {
    return [
      ...this.innerCircle.map((cell, index) => ({ ...cell, id: index, position: index })),
      ...this.outerSquare.map((cell, index) => ({ ...cell, id: index + 24, position: index + 24 }))
    ];
  },
  
  // Получаем общее количество клеток
  getTotalCells: function() {
    return this.innerCircle.length + this.outerSquare.length; // 24 + 50 = 74
  }
};

const GameBoard = ({ roomId, playerData, onExit }) => {
  console.log('🎮 [GameBoard] Компонент загружен:', { roomId, playerData });
  console.log('🎮 [GameBoard] Модули CASHFLOW импортированы:', { 
    getGameBoard: typeof getGameBoard, 
    processGameAction: typeof processGameAction,
    getCellInfo: typeof getCellInfo,
    getNeighborCells: typeof getNeighborCells 
  });
  console.log('🎮 [GameBoard] Компонент обновлен - все карточки заменены на Button в StylishControlPanel');
  
  // Проверяем BOARD_CONFIG
  console.log('🎮 [GameBoard] BOARD_CONFIG загружен:', BOARD_CONFIG);
  console.log('🎮 [GameBoard] CELL_CONFIG загружен:', CELL_CONFIG);
  console.log('🎮 [GameBoard] Внутренний круг клеток:', BOARD_CONFIG.innerCircle?.length);
  console.log('🎮 [GameBoard] Внешний квадрат клеток:', BOARD_CONFIG.outerSquare?.length);
  
  const [players, setPlayers] = useState([]);
  const [currentTurn, setCurrentTurn] = useState(null);
  const [timer, setTimer] = useState(0);
  const [modal, setModal] = useState(null);
  const [turnBanner, setTurnBanner] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [displayDice, setDisplayDice] = useState(0);
  const [displayD1, setDisplayD1] = useState(0);
  const [displayD2, setDisplayD2] = useState(0);

  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [canEndTurn, setCanEndTurn] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gamePhase, setGamePhase] = useState('waiting'); // 'waiting', 'determining_order', 'playing'
  
  // Логирование изменений состояния (опционально)
  useEffect(() => {
    console.log('🎮 [GameBoard] Состояние изменилось:', { gameStarted, gamePhase });
  }, [gameStarted, gamePhase]);
  
  // 🎮 Инициализация игрового поля CASHFLOW
  useEffect(() => {
    console.log('🎮 [GameBoard] Инициализируем игровое поле CASHFLOW для комнаты:', roomId);
    console.log('🎮 [GameBoard] Проверяем доступность модулей CASHFLOW...');
    
    try {
      // Проверяем, что модули доступны
      console.log('🎮 [GameBoard] getGameBoard доступен:', typeof getGameBoard);
      console.log('🎮 [GameBoard] getCellInfo доступен:', typeof getCellInfo);
      
      // Получаем или создаем игровое поле для комнаты
      const cashflowGameBoard = getGameBoard(roomId);
      console.log('✅ [GameBoard] Игровое поле CASHFLOW готово:', cashflowGameBoard);
      
      // Получаем информацию о клетках
      const cell0 = getCellInfo(roomId, 0);
      const cell10 = getCellInfo(roomId, 10);
      console.log('🎯 [GameBoard] Информация о клетках:', { cell0, cell10 });
      
      // Проверяем BOARD_CONFIG
      console.log('🎮 [GameBoard] BOARD_CONFIG:', BOARD_CONFIG);
      console.log('🎮 [GameBoard] Количество клеток:', BOARD_CONFIG.getTotalCells());
      console.log('🎮 [GameBoard] Внутренний круг:', BOARD_CONFIG.innerCircle?.length);
      console.log('🎮 [GameBoard] Внешний квадрат:', BOARD_CONFIG.outerSquare?.length);
      
    } catch (error) {
      console.error('❌ [GameBoard] Ошибка инициализации CASHFLOW:', error);
    }
  }, [roomId]);

  // Инициализация компонента при загрузке
  useEffect(() => {
    console.log('🎮 [GameBoard] Компонент загружен, инициализируем игровое поле');
    
    // Запрашиваем состояние игры у сервера
    if (socket && roomId) {
      console.log('🎮 [GameBoard] Запрашиваем состояние игры у сервера');
      socket.emit('getGameState', roomId);
    }
  }, [socket, roomId]);

  useEffect(() => {
    console.log('🎮 [GameBoard] useEffect выполняется, socket:', socket?.connected);
    if (socket) {
      // Слушаем обновления игроков
      socket.on('game_started', ({ room }) => {
        setGameStarted(true);
        setPlayers(room.players || []);
        setCurrentTurn(room.players?.[0]?.id || null);
        showToast('🎮 Игра началась!', 'success');
      });

      // Обработка события запуска игры от RoomSetup
      socket.on('gameStarted', (data) => {
        console.log('🎮 [GameBoard] Игра запущена:', data);
        setGameStarted(true);
        setGamePhase('playing');
        showToast('🎮 Игра началась!', 'success');
        
        // Если есть данные об игроках, обновляем их
        if (data.players && Array.isArray(data.players)) {
          setPlayers(data.players);
        }
      });
      
      // Обработка состояния игры от сервера
      socket.on('gameState', (data) => {
        console.log('🎮 [GameBoard] Получено состояние игры:', data);
        if (data.status === 'playing') {
          setGameStarted(true);
          setGamePhase('playing');
        }
        if (data.players && Array.isArray(data.players)) {
          setPlayers(data.players);
        }
      });

      // Обработка начала определения очередности
      socket.on('orderDeterminationStarted', (data) => {
        console.log('🎲 [GameBoard] Началось определение очередности:', data);
        setGamePhase('determining_order');
        showToast('🎲 Определение очередности!', 'info');
      });

      socket.on('player_updated', ({ player, room }) => {
        setPlayers(room.players || []);
      });

      socket.on('turn_started', ({ playerId, duration }) => {
        setCurrentTurn(playerId);
        setTimer(duration || 120);
        if (playerId === playerData?.id) {
          setTurnBanner({ text: '🎯 Ваш ход!', color: 'success' });
        } else {
          const player = players.find(p => p.id === playerId);
          setTurnBanner({ text: `🎯 Ход игрока: ${player?.username || 'Неизвестно'}`, color: 'info' });
        }
      });

      socket.on('dice_rolled', ({ playerId, dice1, dice2, total }) => {
        if (playerId === playerData?.id) {
          setDisplayD1(dice1);
          setDisplayD2(dice2);
          setDisplayDice(total);
          setIsRolling(false);
          movePlayer(playerData.id, total);
        }
      });

      socket.on('cell_event', ({ playerId, cellId, event }) => {
        const cell = BOARD_CONFIG.getAllCells().find(c => c.id === cellId);
        if (cell) {
          setModal({ cell, event, playerId });
        }
      });

      socket.on('turn_ended', ({ playerId }) => {
        if (playerId === playerData?.id) {
          setCanEndTurn(false);
        }
      });



      socket.on('playersList', (playersList) => {
        console.log('👥 [GameBoard] Получен список игроков:', playersList);
        setPlayers(playersList);
      });
    }

    return () => {
      if (socket) {
        socket.off('game_started');
        socket.off('player_updated');
        socket.off('turn_started');
        socket.off('dice_rolled');
        socket.off('cell_event');
        socket.off('turn_ended');
        socket.off('gameStarted');
        socket.off('orderDeterminationStarted');
        socket.off('playersList');
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerData, players]);

  const showToast = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };

  const handleRollDice = () => {
    if (!isMyTurn() || isRolling) return;
    
    setIsRolling(true);
    
    // 🎮 Обработка броска кубика через модули CASHFLOW
    try {
      const dice1 = Math.floor(Math.random() * 6) + 1;
      const dice2 = Math.floor(Math.random() * 6) + 1;
      const total = dice1 + dice2;
      
      console.log('🎲 [GameBoard] Бросок кубика:', { dice1, dice2, total });
      
      // Обрабатываем через модули CASHFLOW
      const result = processGameAction(roomId, playerData.id, 'roll_dice', { steps: total });
      
      if (result.success) {
        console.log('✅ [GameBoard] Бросок кубика обработан через CASHFLOW:', result);
        showToast(`🎲 Выпало: ${dice1} + ${dice2} = ${total}`, 'success');
        
        // Отправляем событие на сервер
        socket.emit('roll_dice', { roomId, playerId: playerData.id, steps: total });
      } else {
        console.error('❌ [GameBoard] Ошибка обработки броска:', result.error);
        showToast('❌ Ошибка обработки броска', 'error');
      }
    } catch (error) {
      console.error('❌ [GameBoard] Ошибка CASHFLOW модулей:', error);
      showToast('❌ Ошибка игровой логики', 'error');
    } finally {
      // Сбрасываем состояние через 2 секунды
      setTimeout(() => setIsRolling(false), 2000);
    }
  };

  const isMyTurn = () => {
    return currentTurn === playerData?.id;
  };

  const movePlayer = (playerId, steps) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    let currentPos = player.position || 0;
    
    const moveStep = () => {
      if (steps > 0) {
        currentPos = (currentPos + 1) % BOARD_CONFIG.getAllCells().length;
        steps--;
        setTimeout(moveStep, 500);
      } else {
        // Отправляем событие о достижении клетки
        socket.emit('player_moved', { roomId, playerId, cellId: currentPos + 1 });
      }
    };

    moveStep();
  };

  const handleEndTurn = () => {
    if (!canEndTurn) return;
    
    socket.emit('end_turn', { roomId, playerId: playerData.id });
    setCanEndTurn(false);
  };

  const handleCellAction = (cell) => {
    switch (cell.action) {
      case 'business':
        if (cell.cost && cell.cost > (playerData?.balance || 0)) {
          showToast(`Недостаточно средств для покупки: $${cell.cost}`, 'error');
        } else {
          // Покупка бизнеса
          socket.emit('buy_business', { roomId, playerId: playerData.id, cellId: cell.id });
        }
        break;
      case 'dream':
        if (cell.cost && cell.cost > (playerData?.balance || 0)) {
          showToast(`Недостаточно средств для мечты: $${cell.cost}`, 'error');
        } else {
          // Покупка мечты
          socket.emit('buy_dream', { roomId, playerId: playerData.id, cellId: cell.id });
        }
        break;
      case 'penalty':
        // Применение штрафа
        socket.emit('apply_penalty', { roomId, playerId: playerData.id, cellId: cell.id, penalty: cell.penalty });
        break;
      case 'charity':
        // Благотворительность
        socket.emit('charity_action', { roomId, playerId: playerData.id, cellId: cell.id });
        break;
      default:
        break;
    }
    setModal(null);
  };

  const renderCell = (cell, index) => {
    console.log('🎮 [GameBoard] renderCell вызван:', { cell, index });
    
    if (!cell) {
      console.error('❌ [GameBoard] renderCell: cell не определен');
      return <Box sx={{ width: 60, height: 60, bgcolor: 'red' }}>Error</Box>;
    }
    
    const playerAtCell = players.find(p => (p.position || 0) === index);
    const playerColor = playerAtCell ? PLAYER_COLORS[players.indexOf(playerAtCell) % PLAYER_COLORS.length] : '#FF6B6B';

    return (
      <AnimatedCell
        key={cell.id}
        cell={cell}
        index={index}
        isPlayerHere={!!playerAtCell}
        playerColor={playerColor}
        onClick={() => setModal({ cell, event: null, playerId: null })}
        size="medium"
        variant={index < 24 ? 'inner' : 'outer'}
      />
    );
  };

  const renderGameControls = () => (
    <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        🎮 Управление игрой
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<CasinoIcon />}
          onClick={handleRollDice}
          disabled={!isMyTurn() || isRolling}
          color="primary"
        >
          {isRolling ? 'Бросаю...' : 'Бросать кубик'}
        </Button>
        
        <Button
          variant="outlined"
          onClick={handleEndTurn}
          disabled={!canEndTurn}
          color="secondary"
        >
          Завершить ход
        </Button>
      </Box>

      {/* Информация о кубиках */}
      {displayDice > 0 && (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Typography variant="body2">Кубики:</Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Box sx={{ width: 30, height: 30, bgcolor: 'white', border: '1px solid #ccc', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {displayD1}
            </Box>
            <Box sx={{ width: 30, height: 30, bgcolor: 'white', border: '1px solid #ccc', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {displayD2}
            </Box>
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            = {displayDice}
          </Typography>
        </Box>
      )}
    </Box>
  );

  const renderPlayers = () => (
    <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        👥 Игроки
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {players.map((player) => (
          <Button
            key={player.id}
            variant="contained"
            size="large"
            onClick={() => {
              console.log('👥 [GameBoard] Кнопка игрока нажата:', player.username);
              // Здесь можно добавить логику для открытия карточки игрока
            }}
            sx={{
              p: 2,
              background: player.id === currentTurn 
                ? 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)'
                : 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              color: 'white',
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              border: `2px solid ${player.id === currentTurn ? '#4caf50' : '#1976d2'}`,
              minWidth: 150,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 6,
                background: player.id === currentTurn 
                  ? 'linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)'
                  : 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar sx={{ mr: 1, bgcolor: player.id === currentTurn ? '#4CAF50' : '#2196F3' }}>
                {player.username?.charAt(0) || '?'}
              </Avatar>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {player.username}
                {player.id === currentTurn && ' (Ход)'}
              </Typography>
            </Box>
            
            <Typography variant="caption" display="block">
              💰 Баланс: ${player.balance?.toLocaleString() || 0}
            </Typography>
            
            <Typography variant="caption" display="block">
              🎯 Позиция: {player.position || 0}
            </Typography>
            
            {player.profession && (
              <Typography variant="caption" display="block">
                💼 {player.profession.name}
              </Typography>
            )}
            
            {player.dream && (
              <Typography variant="caption" display="block">
                💭 {player.dream.name}
              </Typography>
            )}
          </Button>
        ))}
      </Box>
    </Box>
  );

  console.log('🎮 [GameBoard] Рендеринг, gameStarted:', gameStarted, 'gamePhase:', gamePhase);
  


  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: CASHFLOW_THEME.effects.gradients.board,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Анимированный фон */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.02"%3E%3Ccircle cx="50" cy="50" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.5,
          zIndex: 0
        }}
      />
      
      {/* Тестовая кнопка для проверки */}
      <Box sx={{ position: 'relative', zIndex: 1000, textAlign: 'center', py: 2 }}>
        <Button
          variant="contained"
          size="large"
          onClick={() => {
            console.log('🧪 [GameBoard] Тестовая кнопка нажата!');
            alert('Компонент GameBoard работает! Кнопки заменены на Button.');
          }}
          sx={{ 
            bgcolor: '#ff5722', 
            color: 'white',
            fontSize: '1.2rem',
            py: 2,
            px: 4,
            '&:hover': { bgcolor: '#d84315' }
          }}
        >
          🧪 ТЕСТ КНОПОК GAMEBOARD - НАЖМИТЕ МЕНЯ!
        </Button>
      </Box>
      
      {/* Заголовок */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <Box sx={{ 
          textAlign: 'center', 
          py: 4,
          background: 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${CASHFLOW_THEME.colors.board.border}`
        }}>
          {/* Отладочная информация - название файла */}
          <Typography variant="body2" sx={{ 
            color: '#ff4444',
            fontWeight: 'bold',
            mb: 1,
            fontFamily: 'monospace',
            fontSize: '0.8rem'
          }}>
            🐛 DEBUG: GameBoard.js (отредактирован)
          </Typography>
          
          <Typography variant="h2" sx={{ 
            color: '#FFFFFF',
            fontWeight: 'bold',
            textShadow: '0 4px 20px rgba(0,0,0,0.5)',
            mb: 2
          }}>
            🎮 Cashflow
          </Typography>
          <Typography variant="h5" sx={{ 
            color: 'rgba(255,255,255,0.8)',
            fontWeight: '300'
          }}>
            Игровое поле
          </Typography>
        </Box>
      </motion.div>
      
      {/* Основной контент */}
      <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto', position: 'relative', zIndex: 1 }}>

      {/* Баннер текущего хода */}
      {turnBanner && (
        <Box
          sx={{
            p: 2,
            bgcolor: `${turnBanner.color}.main`,
            color: 'white',
            borderRadius: 2,
            mb: 2,
            textAlign: 'center'
          }}
        >
          <Typography variant="h6">
            {turnBanner.text}
          </Typography>
          {timer > 0 && (
            <Typography variant="body2">
              ⏱️ Время: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
            </Typography>
          )}
        </Box>
      )}

      {/* Управление игрой */}
      {renderGameControls()}

      {/* Игровое поле Cashflow */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Box sx={{ 
          mb: 4,
          textAlign: 'center'
        }}>
          <Typography variant="h4" sx={{ 
            color: '#FFFFFF',
            fontWeight: 'bold',
            mb: 2,
            textShadow: '0 2px 10px rgba(0,0,0,0.5)'
          }}>
            🎯 Игровое поле Cashflow
          </Typography>
          <Typography variant="h6" sx={{ 
            color: 'rgba(255,255,255,0.8)',
            fontWeight: '300'
          }}>
            74 клетки • 24 по кругу + 50 по периметру
          </Typography>
        </Box>
      </motion.div>
        
        <Box sx={{ 
          position: 'relative', 
          width: 'fit-content', 
          mx: 'auto',
          background: 'rgba(15, 23, 42, 0.9)',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          border: `2px solid ${CASHFLOW_THEME.colors.board.border}`
        }}>
          {/* Внешний квадрат - 50 клеток */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(15, 1fr)',
              gap: 2,
              position: 'relative'
            }}
          >
            {/* Верхний ряд (1-15) */}
            {BOARD_CONFIG.outerSquare?.slice(0, 15).map((cell, index) => (
              <Box key={`top-${index}`} sx={{ width: 70, height: 70 }}>
                {renderCell(cell, index)}
              </Box>
            ))}
          </Box>
          
                      {/* Правый ряд (16-27) */}
            <Box
              sx={{
                position: 'absolute',
                right: 0,
                top: 70,
                display: 'flex',
                flexDirection: 'column',
                gap: 2
              }}
            >
              {BOARD_CONFIG.outerSquare?.slice(15, 27).map((cell, index) => (
                <Box key={`right-${index}`} sx={{ width: 70, height: 70 }}>
                  {renderCell(cell, index + 15)}
                </Box>
              ))}
            </Box>
            
            {/* Нижний ряд (28-39) */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                display: 'grid',
                gridTemplateColumns: 'repeat(12, 1fr)',
                gap: 2
              }}
            >
              {BOARD_CONFIG.outerSquare?.slice(27, 39).map((cell, index) => (
                <Box key={`bottom-${index}`} sx={{ width: 70, height: 70 }}>
                  {renderCell(cell, index + 27)}
                </Box>
              ))}
            </Box>
            
            {/* Левый ряд (40-52) */}
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                top: 70,
                display: 'flex',
                flexDirection: 'column',
                gap: 2
              }}
            >
              {BOARD_CONFIG.outerSquare?.slice(39, 50).map((cell, index) => (
                <Box key={`left-${index}`} sx={{ width: 70, height: 70 }}>
                  {renderCell(cell, index + 39)}
                </Box>
              ))}
            </Box>
          
          {/* Внутренний круг - 24 клетки */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 500,
              height: 500,
              borderRadius: '50%',
              background: CASHFLOW_THEME.effects.gradients.primary,
              border: '6px solid #A855F7',
              boxShadow: 'inset 0 0 60px rgba(124, 58, 237, 0.4), 0 0 80px rgba(124, 58, 237, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Box
              sx={{
                position: 'relative',
                width: 460,
                height: 460,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(124, 58, 237, 0.1) 0%, rgba(76, 29, 149, 0.2) 100%)'
              }}
            >
              {/* Размещаем 24 клетки по кругу */}
              {BOARD_CONFIG.innerCircle?.map((cell, index) => {
                const angle = (index * 15) - 90; // Начинаем сверху
                const radius = 180;
                const x = Math.cos((angle * Math.PI) / 180) * radius;
                const y = Math.sin((angle * Math.PI) / 180) * radius;
                
                return (
                  <motion.div
                    key={`circle-${index}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                                          transition={{ 
                        duration: 0.5, 
                        delay: index * 0.05,
                        ease: "easeOut"
                      }}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                      width: 60,
                      height: 60
                    }}
                  >
                    {renderCell(cell, index)}
                  </motion.div>
                );
              })}
            </Box>
          </Box>
                </Box>
      </Box>
      
      {/* Стильная панель управления */}
      <StylishControlPanel
        players={players}
        currentTurn={currentTurn}
        playerData={playerData}
        onRollDice={handleRollDice}
        isMyTurn={isMyTurn}
        isRolling={isRolling}
        timer={timer}
      />
      
      {/* Информация об игроках */}
      {renderPlayers()}

      {/* Модальное окно клетки */}
      {modal && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setModal(null)}
        >
          <Box
            sx={{
              bgcolor: 'background.paper',
              p: 3,
              borderRadius: 2,
              maxWidth: 400,
              textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Box sx={{ fontSize: '48px', mb: 2, color: modal.cell.color }}>
              {modal.cell.icon}
            </Box>
            
            <Typography variant="h6" gutterBottom>
              {modal.cell.name}
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 2 }}>
              {modal.cell.description}
            </Typography>
            
            {modal.cell.cost && (
              <Typography variant="body2" sx={{ mb: 1, color: 'error.main' }}>
                💰 Стоимость: ${modal.cell.cost.toLocaleString()}
              </Typography>
            )}
            
            {modal.cell.income && (
              <Typography variant="body2" sx={{ mb: 1, color: 'success.main' }}>
                💵 Доход: ${modal.cell.income.toLocaleString()}/мес
              </Typography>
            )}
            
            {modal.cell.penalty && (
              <Typography variant="body2" sx={{ mb: 1, color: 'error.main' }}>
                ❌ Штраф: {modal.cell.penalty > 0 ? '+' : ''}{modal.cell.penalty * 100}%
              </Typography>
            )}
            
            <Button
              variant="contained"
              onClick={() => handleCellAction(modal.cell)}
              sx={{ mt: 2 }}
            >
              {modal.cell.action === 'business' || modal.cell.action === 'dream' ? 'Купить' : 'OK'}
            </Button>
          </Box>
        </Box>
      )}

      {/* Toast уведомления */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
      >
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GameBoard;
