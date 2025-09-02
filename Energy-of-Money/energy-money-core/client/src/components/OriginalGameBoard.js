import React, { useState, useEffect, Fragment, useRef } from 'react';
import socket from '../socket';
import { Box, Typography, Button, LinearProgress, Avatar, Chip, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, List, ListItem, ListItemText, Divider, Grid, useMediaQuery, useTheme, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import FullProfessionCard from './FullProfessionCard';
import MarketCardModal from './MarketCardModal';
import ExpenseCardModal from './ExpenseCardModal';
import BreakModal from './BreakModal';
import { MarketDeckManager, checkPlayerHasMatchingAsset } from '../data/marketCards';
import { ExpenseDeckManager } from '../data/expenseCards';
import { PLAYER_COLORS, assignPlayerColor } from '../styles/playerColors';
import { 
  Timer, 
  ExitToApp,
  AccountBalance,
  Inventory,
  Group,
  Menu,
  Close,
  VolunteerActivism as CharityIcon
} from '@mui/icons-material';

const OriginalGameBoard = ({ roomId, playerData, onExit }) => {
  console.log('🎮 [OriginalGameBoard] Компонент загружен:', { roomId, playerData });
  
  // Ref для хранения roomId
  const roomIdRef = useRef(roomId);
  roomIdRef.current = roomId;
  
  // Хуки для адаптивности
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Состояние мобильного меню
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Получаем данные об очередности хода
  const [turnOrder, setTurnOrder] = useState([]);
  const [currentTurn, setCurrentTurn] = useState(null);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  
  // Получаем данные игроков для игры
  const [gamePlayers, setGamePlayers] = useState([]);



  // Функция для инициализации полной структуры игрока
  const initializePlayerData = (player, allPlayers = []) => {
    return {
      id: player.id || player.socketId,
      username: player.username || 'Игрок',
      socketId: player.socketId,
      balance: player.balance || 2000,
      position: player.position || 0,
      ready: player.ready || false,
      profession: player.profession || null,
      assets: player.assets || [],
      liabilities: player.liabilities || [],
      isFinancialFree: player.isFinancialFree || false,
      isOnBigCircle: player.isOnBigCircle || false,
      hasWon: player.hasWon || false,
      color: player.color || assignPlayerColor(allPlayers, player),
      joinedAt: player.joinedAt || Date.now(),
      ...player // Сохраняем все остальные свойства
    };
  };

  // Функция для синхронизации данных игрока с сервером
  const syncPlayerData = (playerId, updatedData) => {
    if (socket.connected && roomIdRef.current) {
      console.log('🔄 [OriginalGameBoard] Синхронизируем данные игрока с сервером:', { playerId, updatedData });
      socket.emit('playerDataUpdate', roomIdRef.current, playerId, updatedData);
    }
  };

  // Функция для получения активов текущего игрока
  const getCurrentPlayerAssets = () => {
    const currentPlayerData = gamePlayers[currentPlayer];
    return currentPlayerData?.assets || [];
  };

  // Функция для обновления активов текущего игрока
  const updateCurrentPlayerAssets = (newAssets) => {
    const currentPlayerData = gamePlayers[currentPlayer];
    if (currentPlayerData) {
      syncPlayerData(currentPlayerData.socketId, { assets: newAssets });
      setGamePlayers(prev => prev.map(p => 
        p.socketId === currentPlayerData.socketId 
          ? { ...p, assets: newAssets }
          : p
      ));
    }
  };
  
  // CSS стили для анимаций
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Загружаем данные из localStorage при инициализации
  useEffect(() => {
    const savedTurnOrder = localStorage.getItem('potok-deneg_turnOrder');
    const savedCurrentTurn = localStorage.getItem('potok-deneg_currentTurn');
    const savedGamePlayers = localStorage.getItem('potok-deneg_gamePlayers');
    
    if (savedTurnOrder) {
      try {
        setTurnOrder(JSON.parse(savedTurnOrder));
      } catch (e) {
        console.error('❌ [OriginalGameBoard] Ошибка парсинга turnOrder:', e);
      }
    }
    
    if (savedCurrentTurn) {
      setCurrentTurn(savedCurrentTurn);
    }
    
    if (savedGamePlayers) {
      try {
        const savedPlayers = JSON.parse(savedGamePlayers);
        setGamePlayers(savedPlayers);
        
        // Находим текущего игрока
        const currentPlayer = savedPlayers.find(p => p.socketId === socket?.id);
        if (currentPlayer) {
          console.log('👤 [OriginalGameBoard] Текущий игрок:', currentPlayer);
          console.log('💰 [OriginalGameBoard] Баланс:', currentPlayer.balance);
          console.log('💼 [OriginalGameBoard] Профессия:', currentPlayer.profession);
          console.log('🏠 [OriginalGameBoard] Активы:', currentPlayer.assets);
          console.log('💳 [OriginalGameBoard] Обязательства:', currentPlayer.liabilities);
        }
      } catch (e) {
        console.error('❌ [OriginalGameBoard] Ошибка парсинга gamePlayers:', e);
      }
    }
  }, [socket?.id]);

  // Обработчики Socket.IO событий для обновления списка игроков
  useEffect(() => {
    console.log('🔌 [OriginalGameBoard] Настраиваем обработчики Socket.IO событий');

    // Обработчик обновления списка игроков
    const handlePlayersUpdate = (playersList) => {
      console.log('👥 [OriginalGameBoard] Получен обновленный список игроков:', playersList);
      
      // Инициализируем полную структуру для каждого игрока с учетом цветов
      const initializedPlayers = playersList.map((player, index) => {
        const existingPlayer = gamePlayers.find(p => p.socketId === player.socketId);
        // Сохраняем существующий цвет или назначаем новый
        const playerWithColor = {
          ...player,
          color: existingPlayer?.color || assignPlayerColor(playersList, player)
        };
        return initializePlayerData(playerWithColor, playersList);
      });
      
      // Обновляем только если данные действительно изменились
      setGamePlayers(prev => {
        // Проверяем, есть ли существенные изменения
        const hasChanges = initializedPlayers.some(newPlayer => {
          const oldPlayer = prev.find(p => p.socketId === newPlayer.socketId);
          if (!oldPlayer) return true; // Новый игрок
          
          // Проверяем ключевые поля
          return oldPlayer.balance !== newPlayer.balance ||
                 oldPlayer.position !== newPlayer.position ||
                 oldPlayer.profession !== newPlayer.profession ||
                 oldPlayer.color !== newPlayer.color ||
                 JSON.stringify(oldPlayer.assets) !== JSON.stringify(newPlayer.assets);
        });
        
        if (hasChanges) {
          console.log('🔄 [OriginalGameBoard] Обнаружены изменения в данных игроков, обновляем');
          return initializedPlayers;
        }
        
        return prev; // Нет изменений, оставляем как есть
      });
      
      // Сохраняем в localStorage
      localStorage.setItem('potok-deneg_gamePlayers', JSON.stringify(initializedPlayers));
    };

    // Обработчик получения данных комнаты
    const handleRoomData = (roomData) => {
      console.log('🏠 [OriginalGameBoard] Получены данные комнаты:', roomData);
      if (roomData.currentPlayers) {
        // Инициализируем полную структуру для каждого игрока с учетом цветов
        const initializedPlayers = roomData.currentPlayers.map((player, index) => {
          return initializePlayerData(player, roomData.currentPlayers);
        });
        setGamePlayers(initializedPlayers);
        localStorage.setItem('potok-deneg_gamePlayers', JSON.stringify(initializedPlayers));
      }
    };

    // Обработчик успешного присоединения к комнате
    const handleRoomJoined = (data) => {
      console.log('✅ [OriginalGameBoard] Успешно присоединились к комнате:', data);
      // Запрашиваем данные комнаты после успешного присоединения
      socket.emit('getRoomData', roomIdRef.current);
    };

    // Обработчик обновления позиции игрока
    const handlePlayerPositionUpdate = (data) => {
      console.log('🎯 [OriginalGameBoard] Получено обновление позиции игрока:', data);
      
      setGamePlayers(prev => prev.map(player => 
        player.socketId === data.playerId 
          ? { ...player, position: data.position }
          : player
      ));
    };

    // Обработчик смены хода игрока
    const handlePlayerTurnChanged = (data) => {
      console.log('🎯 [OriginalGameBoard] Получено обновление хода игрока:', data);
      
      setCurrentPlayer(data.currentPlayerIndex);
      
      // Сбрасываем таймер для нового игрока
      setTurnTimeLeft(120);
      setTimerProgress(0);
      setIsTurnEnding(false);
    };

    // Обработчик синхронизации таймера хода
    const handleTurnTimerSynced = (data) => {
      console.log('⏰ [OriginalGameBoard] Получена синхронизация таймера:', data);
      
      setTurnTimeLeft(data.timeLeft);
      setIsTurnEnding(data.isTurnEnding);
      
      // Обновляем прогресс таймера
      const progress = ((120 - data.timeLeft) / 120) * 100;
      setTimerProgress(progress);
    };

    // Подписываемся на события
    socket.on('playersUpdate', handlePlayersUpdate);
    socket.on('roomData', handleRoomData);
    socket.on('roomJoined', handleRoomJoined);
    socket.on('playerPositionUpdate', handlePlayerPositionUpdate);
    socket.on('playerTurnChanged', handlePlayerTurnChanged);
    socket.on('turnTimerSynced', handleTurnTimerSynced);

    // Запрашиваем актуальный список игроков при подключении
    if (socket.connected && roomIdRef.current) {
      console.log('📡 [OriginalGameBoard] Запрашиваем список игроков для комнаты:', roomIdRef.current);
      socket.emit('getRoomData', roomIdRef.current);
      
      // Также попробуем присоединиться к комнате, если еще не присоединены
      console.log('🚪 [OriginalGameBoard] Пытаемся присоединиться к комнате:', roomIdRef.current);
      socket.emit('joinRoom', roomIdRef.current, {
        username: playerData?.username || 'Игрок',
        socketId: socket.id
      });
    }

    // Очистка при размонтировании
    return () => {
      socket.off('playersUpdate', handlePlayersUpdate);
      socket.off('roomData', handleRoomData);
      socket.off('roomJoined', handleRoomJoined);
      socket.off('playerPositionUpdate', handlePlayerPositionUpdate);
      socket.off('playerTurnChanged', handlePlayerTurnChanged);
      socket.off('turnTimerSynced', handleTurnTimerSynced);
    };
  }, []); // Убираем roomId из зависимостей, чтобы избежать ререндеров

  
  const [originalBoard] = useState(() => {
    // Создаем 76 клеток: 24 внутренних + 52 внешних
    const cells = [];
    
    // 24 внутренние клетки с детальной раскладкой
    const innerCells = [
      { id: 1, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯', description: 'Малая / большая сделка (на выбор)' },
      { id: 2, type: 'expenses', name: 'Всякая всячина', color: '#EC4899', icon: '🛍️', description: 'Обязательные траты от 100 до 4000$ на разные нужды (чайник, кофе, машина, ТВ, прочее)' },
      { id: 3, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯', description: 'Малая / большая сделка (на выбор)' },
      { id: 4, type: 'charity', name: 'Благотворительность', color: '#F97316', icon: '❤️', description: 'Пожертвовать деньги для получения возможности бросать 2 кубика (10% от дохода игрока, можно отказаться)' },
      { id: 5, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯', description: 'Малая / большая сделка (на выбор)' },
      { id: 6, type: 'payday', name: 'PayDay', color: '#EAB308', icon: '💰', description: 'Получить зарплату' },
      { id: 7, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯', description: 'Малая / большая сделка (на выбор)' },
      { id: 8, type: 'market', name: 'Рынок', color: '#06B6D4', icon: '🏪', description: 'Появляются покупатели на разные активы' },
      { id: 9, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯', description: 'Малая / большая сделка (на выбор)' },
      { id: 10, type: 'expenses', name: 'Всякая всячина', color: '#EC4899', icon: '🛍️', description: 'Обязательные траты от 100 до 4000$ на разные нужды (чайник, кофе, машина, ТВ, прочее)' },
      { id: 11, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯', description: 'Малая / большая сделка (на выбор)' },
      { id: 12, type: 'child', name: 'Ребенок', color: '#A855F7', icon: '👶', description: 'Родился ребенок, увеличиваются ежемесячные расходы' },
      { id: 13, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯', description: 'Малая / большая сделка (на выбор)' },
      { id: 14, type: 'payday', name: 'PayDay', color: '#EAB308', icon: '💰', description: 'Получить зарплату' },
      { id: 15, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯', description: 'Малая / большая сделка (на выбор)' },
      { id: 16, type: 'market', name: 'Рынок', color: '#06B6D4', icon: '🏪', description: 'Появляются покупатели на разные активы' },
      { id: 17, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯', description: 'Малая / большая сделка (на выбор)' },
      { id: 18, type: 'expenses', name: 'Всякая всячина', color: '#EC4899', icon: '🛍️', description: 'Обязательные траты от 100 до 4000$ на разные нужды (чайник, кофе, машина, ТВ, прочее)' },
      { id: 19, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯', description: 'Малая / большая сделка (на выбор)' },
      { id: 20, type: 'loss', name: 'Потеря', color: '#18181B', icon: '💸', description: 'Потеря денег (увольнение) - оплатите один раз расходы и пропустите 2 хода или 3 раза расходы без пропуска хода' },
      { id: 21, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯', description: 'Малая / большая сделка (на выбор)' },
      { id: 22, type: 'payday', name: 'PayDay', color: '#EAB308', icon: '💰', description: 'Получить зарплату' },
      { id: 23, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯', description: 'Малая / большая сделка (на выбор)' },
      { id: 24, type: 'market', name: 'Рынок', color: '#06B6D4', icon: '🏪', description: 'Появляются покупатели на разные активы' }
    ];
    
    // Добавляем внутренние клетки
    cells.push(...innerCells);
    
    // 52 внешние клетки с детальной раскладкой (ID 25-76)
    const outerCells = [
      { id: 25, type: 'money', name: 'Доход от инвестиций', color: '#EAB308', icon: '$', description: 'Ваши инвестиции приносят доход', cost: 0, income: 0 },
      { id: 26, type: 'dream', name: 'Дом мечты', color: '#E91E63', icon: '🏠', description: 'Построить дом мечты для семьи', cost: 100000, income: 0 },
      { id: 27, type: 'business', name: 'Кофейня', color: '#4CAF50', icon: '☕', description: 'Кофейня в центре города', cost: 100000, income: 3000 },
      { id: 28, type: 'loss', name: 'Аудит', color: '#EF4444', icon: '📋', description: 'Аудит - потеря 50% активов', cost: 0, income: 0 },
      { id: 29, type: 'business', name: 'Центр здоровья', color: '#4CAF50', icon: '💆', description: 'Центр здоровья и спа', cost: 270000, income: 5000 },
      { id: 30, type: 'dream', name: 'Полет на Марс', color: '#E91E63', icon: '🚀', description: 'Реализация мечты о космическом путешествии на Красную планету', cost: 300000, income: 0 },
      { id: 31, type: 'business', name: 'Биржа', color: '#4CAF50', icon: '📈', description: 'Биржа (Разово выплачивается 500 000$ если выпало 5 или 6 на кубике) (стоимость 50 000$) можно купить или отказаться', cost: 50000, income: 0 },
      { id: 32, type: 'charity', name: 'Благотворительность', color: '#F97316', icon: '❤️', description: 'Благотворительность', cost: 0, income: 0 },
      { id: 33, type: 'business', name: 'Цифровой маркетинг', color: '#4CAF50', icon: '📊', description: 'Агентство цифрового маркетинга', cost: 160000, income: 4000 },
      { id: 34, type: 'loss', name: 'Кража', color: '#EF4444', icon: '🦹', description: 'Кража 100% наличных', cost: 0, income: 0 },
      { id: 35, type: 'business', name: 'Мини-отель', color: '#4CAF50', icon: '🏨', description: 'Мини-отель/бутик-гостиница', cost: 200000, income: 5000 },
      { id: 36, type: 'dream', name: 'Высочайшие вершины', color: '#E91E63', icon: '🏔️', description: 'Подняться на все высочайшие вершины мира', cost: 500000, income: 0 },
      { id: 37, type: 'business', name: 'Франшиза ресторана', color: '#4CAF50', icon: '🍽️', description: 'Франшиза популярного ресторана', cost: 320000, income: 8000 },
      { id: 38, type: 'money', name: 'Доход от инвестиций', color: '#EAB308', icon: '$', description: 'Ваши инвестиции приносят доход', cost: 0, income: 0 },
      { id: 39, type: 'dream', name: 'Ретрит-центр', color: '#E91E63', icon: '🏕️', description: 'Построить ретрит-центр', cost: 500000, income: 0 },
      { id: 40, type: 'business', name: 'Мини-отель', color: '#4CAF50', icon: '🏨', description: 'Мини-отель/бутик-гостиница', cost: 200000, income: 4000 },
      { id: 41, type: 'dream', name: 'Жить год на яхте в Средиземном море', color: '#E91E63', icon: '⛵', description: 'Годовая жизнь на роскошной яхте в прекрасном климате', cost: 300000, income: 0 },
      { id: 42, type: 'loss', name: 'Развод', color: '#EF4444', icon: '💔', description: 'Развод - потеря 50% активов', cost: 0, income: 0 },
      { id: 43, type: 'dream', name: 'Ретрит-центр', color: '#E91E63', icon: '🏕️', description: 'Построить ретрит-центр', cost: 500000, income: 0 },
      { id: 44, type: 'business', name: 'Автомойки', color: '#4CAF50', icon: '🚗', description: 'Сеть автомоек самообслуживания', cost: 120000, income: 3000 },
      { id: 45, type: 'dream', name: 'Яхта в Средиземном море', color: '#E91E63', icon: '⛵', description: 'Жить год на яхте в Средиземном море', cost: 300000, income: 0 },
      { id: 46, type: 'business', name: 'Салон красоты', color: '#4CAF50', icon: '💇', description: 'Салон красоты/барбершоп', cost: 500000, income: 15000 },
      { id: 47, type: 'dream', name: 'Фонд поддержки', color: '#E91E63', icon: '🎭', description: 'Создать фонд поддержки талантов', cost: 300000, income: 0 },
      { id: 48, type: 'business', name: 'Онлайн-магазин', color: '#4CAF50', icon: '🛍️', description: 'Онлайн-магазин одежды', cost: 110000, income: 3000 },
      { id: 49, type: 'dream', name: 'Мировой фестиваль', color: '#E91E63', icon: '🎪', description: 'Организовать мировой фестиваль', cost: 200000, income: 0 },
      { id: 50, type: 'loss', name: 'Пожар', color: '#EF4444', icon: '🔥', description: 'Пожар (вы теряете бизнес с мин доходом)', cost: 0, income: 0 },
      { id: 51, type: 'money', name: 'Доход от инвестиций', color: '#EAB308', icon: '$', description: 'Ваши инвестиции приносят доход', cost: 0, income: 0 },
      { id: 52, type: 'business', name: 'Йога-центр', color: '#4CAF50', icon: '🧘', description: 'Йога- и медитационный центр', cost: 170000, income: 4500 },
      { id: 53, type: 'dream', name: 'Кругосветное плавание', color: '#E91E63', icon: '🌊', description: 'Кругосветное плавание на паруснике', cost: 200000, income: 0 },
      { id: 54, type: 'business', name: 'Эко-ранчо', color: '#4CAF50', icon: '🌿', description: 'Туристический комплекс (эко-ранчо)', cost: 1000000, income: 20000 },
      { id: 55, type: 'dream', name: 'Кругосветное плавание', color: '#E91E63', icon: '🌊', description: 'Кругосветное плавание на паруснике', cost: 300000, income: 0 },
      { id: 56, type: 'business', name: 'Биржа', color: '#4CAF50', icon: '📈', description: 'Биржа (Разово выплачивается 500 000$ если выпало 5 или 6 на кубике)', cost: 50000, income: 500000 },
      { id: 57, type: 'dream', name: 'Частный самолёт', color: '#E91E63', icon: '✈️', description: 'Купить частный самолёт', cost: 1000000, income: 0 },
      { id: 58, type: 'business', name: 'NFT-платформа', color: '#4CAF50', icon: '🎨', description: 'NFT-платформа', cost: 400000, income: 12000 },
      { id: 59, type: 'dream', name: 'Мировой лидер', color: '#E91E63', icon: '👑', description: 'Стать мировым лидером мнений', cost: 1000000, income: 0 },
      { id: 60, type: 'business', name: 'Школа языков', color: '#4CAF50', icon: '🌍', description: 'Школа иностранных языков', cost: 20000, income: 3000 },
      { id: 61, type: 'dream', name: 'Коллекция суперкаров', color: '#E91E63', icon: '🏎️', description: 'Купить коллекцию суперкаров', cost: 1000000, income: 0 },
      { id: 62, type: 'business', name: 'Школа будущего', color: '#4CAF50', icon: '🎓', description: 'Создать школу будущего для детей', cost: 300000, income: 10000 },
      { id: 63, type: 'dream', name: 'Фильм', color: '#E91E63', icon: '🎬', description: 'Снять полнометражный фильм', cost: 500000, income: 0 },
      { id: 64, type: 'money', name: 'Вам выплачивается доход от ваших инвестиций', color: '#FFD700', icon: '$', description: 'Получение дохода от ранее приобретенных активов', cost: 0, income: 0 },
      { id: 65, type: 'dream', name: 'Кругосветное плавание', color: '#E91E63', icon: '🌊', description: 'Кругосветное плавание на паруснике', cost: 200000, income: 0 },
      { id: 66, type: 'loss', name: 'Рейдерский захват', color: '#EF4444', icon: '🦈', description: 'Рейдерский захват (Вы теряете бизнес с крупным доходом)', cost: 0, income: 0 },
      { id: 67, type: 'dream', name: 'Белоснежная яхта', color: '#E91E63', icon: '⛵', description: 'Белоснежная Яхта', cost: 300000, income: 0 },
      { id: 68, type: 'business', name: 'Франшиза "Поток денег"', color: '#4CAF50', icon: '💸', description: 'Франшиза "поток денег"', cost: 100000, income: 10000 },
      { id: 69, type: 'loss', name: 'Санкции', color: '#EF4444', icon: '🚫', description: 'Санкции заблокировали все счета', cost: 0, income: 0 },
      { id: 70, type: 'business', name: 'Пекарня', color: '#4CAF50', icon: '🥖', description: 'Пекарня с доставкой', cost: 300000, income: 7000 },
      { id: 71, type: 'dream', name: 'Благотворительный фонд', color: '#E91E63', icon: '🤝', description: 'Организовать благотворительный фонд', cost: 200000, income: 0 },
      { id: 72, type: 'business', name: 'Онлайн-образование', color: '#4CAF50', icon: '💻', description: 'Онлайн-образовательная платформа', cost: 200000, income: 5000 },
      { id: 73, type: 'dream', name: 'Полёт в космос', color: '#E91E63', icon: '🚀', description: 'Полёт в космос', cost: 250000, income: 0 },
      { id: 74, type: 'business', name: 'Фитнес-студии', color: '#4CAF50', icon: '💪', description: 'Сеть фитнес-студий', cost: 750000, income: 20000 },
      { id: 75, type: 'dream', name: 'Кругосветное путешествие', color: '#E91E63', icon: '🌍', description: 'Кругосветное путешествие', cost: 300000, income: 0 },
      { id: 76, type: 'business', name: 'Коворкинг', color: '#4CAF50', icon: '🏢', description: 'Коворкинг-пространство', cost: 500000, income: 10000 }
    ];
    
    // Добавляем внешние клетки
    cells.push(...outerCells);
    
    return cells;
  });

  const [diceValue, setDiceValue] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [timerProgress, setTimerProgress] = useState(100);
  const [turnTimeLeft, setTurnTimeLeft] = useState(120); // 2 минуты = 120 секунд
  const [isTurnEnding, setIsTurnEnding] = useState(false);
  const [canRollDice, setCanRollDice] = useState(true);
  const [diceRolled, setDiceRolled] = useState(false);
  
  // Состояние игроков и их фишек - начинают с 1-й клетки (малый круг)
  // Удалено: const [players, setPlayers] = useState([]); - используем gamePlayers
  
  const [currentPlayer, setCurrentPlayer] = useState(0); // Индекс текущего игрока
  const [isMoving, setIsMoving] = useState(false); // Флаг движения фишки
  const [movingPlayerId, setMovingPlayerId] = useState(null); // ID движущегося игрока
  
  // Функция для получения текущего игрока из gamePlayers
  const getCurrentPlayer = () => {
    if (gamePlayers.length === 0) return null;
    return gamePlayers[currentPlayer] || gamePlayers[0];
  };
  
  // Функция для получения игрока по индексу из gamePlayers
  const getPlayerByIndex = (index) => {
    if (gamePlayers.length === 0) return null;
    return gamePlayers[index] || gamePlayers[0];
  };
  
  // Состояние для модальных окон
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showAssetsModal, setShowAssetsModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // Состояние для toast уведомлений
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Состояние для банковских операций
  const [bankBalance, setBankBalance] = useState(2500);
  const [transferAmount, setTransferAmount] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [transferHistory, setTransferHistory] = useState([]);

  // Состояние для карточек рынка
  const [showMarketCardModal, setShowMarketCardModal] = useState(false);
  const [currentMarketCard, setCurrentMarketCard] = useState(null);
  const [currentPlayerAssets, setCurrentPlayerAssets] = useState([]);
  const [marketDeckManager] = useState(() => new MarketDeckManager());
  const [marketDeckCount, setMarketDeckCount] = useState(24);
  const [marketDiscardCount, setMarketDiscardCount] = useState(0);

  // Состояние для карточек расходов
  const [showExpenseCardModal, setShowExpenseCardModal] = useState(false);
  const [currentExpenseCard, setCurrentExpenseCard] = useState(null);
  const [expenseDeckManager] = useState(() => new ExpenseDeckManager());
  const [expenseDeckCount, setExpenseDeckCount] = useState(24);
  const [expenseDiscardCount, setExpenseDiscardCount] = useState(0);

  // Состояние для активов - теперь используем данные из gamePlayers
  // Удалено локальное состояние assets - используем gamePlayers[currentPlayer]?.assets

  // Состояние для FullProfessionCard
  const [showProfessionCard, setShowProfessionCard] = useState(false);
  const [selectedProfessionId, setSelectedProfessionId] = useState(null);

  // Состояние для игровой логики
  const [playerMoney, setPlayerMoney] = useState(2500); // Деньги игрока
  const [childrenCount, setChildrenCount] = useState(0); // Количество детей
  const [showChildModal, setShowChildModal] = useState(false); // Модал рождения ребенка
  const [showConfetti, setShowConfetti] = useState(false); // Анимация конфети

  // Состояние для большого круга
  const [isOnBigCircle, setIsOnBigCircle] = useState(true); // Всегда на большом круге
  const [bigCirclePassiveIncome, setBigCirclePassiveIncome] = useState(0); // Пассивный доход на большом круге
  const [bigCircleBalance, setBigCircleBalance] = useState(0); // Баланс на большом круге
  const [bigCircleBusinesses, setBigCircleBusinesses] = useState([]); // Купленные бизнесы на большом круге
  const [bigCircleCells, setBigCircleCells] = useState({}); // Владельцы клеток на большом круге
  const [bigCircleDreams, setBigCircleDreams] = useState([]); // Купленные мечты на большом круге
  const [showVictoryModal, setShowVictoryModal] = useState(false); // Модал победы
  const [victoryReason, setVictoryReason] = useState(''); // Причина победы
  
  // Состояние для рейтинга и времени игры
  const [gameStartTime, setGameStartTime] = useState(Date.now()); // Время начала игры
  const [gameDuration, setGameDuration] = useState(3 * 60 * 60 * 1000); // Длительность игры в миллисекундах (по умолчанию 3 часа)
  const [gameEndTime, setGameEndTime] = useState(Date.now() + (3 * 60 * 60 * 1000)); // Время окончания игры
  const [isGameFinished, setIsGameFinished] = useState(false); // Игра завершена
  const [playerRankings, setPlayerRankings] = useState([]); // Рейтинг игроков
  const [showRankingsModal, setShowRankingsModal] = useState(false); // Модал рейтинга

  // Состояние для системы перерывов
  const [isOnBreak, setIsOnBreak] = useState(false); // Игра на перерыве
  const [breakEndTime, setBreakEndTime] = useState(null); // Время окончания перерыва
  const [breakDuration, setBreakDuration] = useState(null); // Длительность перерыва
  const [nextBreakTime, setNextBreakTime] = useState(null); // Время следующего перерыва

  // Состояние для системы сделок
  const [dealDeck, setDealDeck] = useState([]); // Основная колода сделок
  const [discardPile, setDiscardPile] = useState([]); // Отбой
  const [currentDealCard, setCurrentDealCard] = useState(null); // Текущая карточка сделки
  const [showDealModal, setShowDealModal] = useState(false); // Модал сделки
  const [showDealTypeModal, setShowDealTypeModal] = useState(false); // Модал выбора типа сделки
  const [showPlayerSelectionModal, setShowPlayerSelectionModal] = useState(false); // Модал выбора игрока для передачи карточки
  const [showCreditModal, setShowCreditModal] = useState(false); // Модал кредитов
  const [playerCredit, setPlayerCredit] = useState(0); // Текущий кредит игрока
  const [customCreditAmount, setCustomCreditAmount] = useState(''); // Произвольная сумма кредита
  const [customPayoffAmount, setCustomPayoffAmount] = useState(''); // Произвольная сумма погашения
  const [creditModalFromDeal, setCreditModalFromDeal] = useState(false); // Открыт ли модал кредитов из сделки
  const [showAssetTransferModal, setShowAssetTransferModal] = useState(false); // Модал передачи активов
  const [selectedAssetForTransfer, setSelectedAssetForTransfer] = useState(null); // Выбранный актив для передачи

  
  // Состояние для карточек "другу нужны деньги"
  const [friendMoneyCardsUsed, setFriendMoneyCardsUsed] = useState(0); // Количество использованных карточек "другу нужны деньги"
  const [hasExtraTurn, setHasExtraTurn] = useState(false); // Возможность дополнительного хода
  const [hasFreeCards, setHasFreeCards] = useState(false); // Возможность бесплатных карточек
  const [showFreeCardsModal, setShowFreeCardsModal] = useState(false); // Модал бесплатных карточек
  
  // Состояние для благотворительности
  const [showCharityModal, setShowCharityModal] = useState(false);
  const [charityCost, setCharityCost] = useState(0);
  const [hasCharityBonus, setHasCharityBonus] = useState(false);
  const [showCharityDiceModal, setShowCharityDiceModal] = useState(false);
  const [charityDiceValues, setCharityDiceValues] = useState({ dice1: 0, dice2: 0, dice3: 0, sum: 0 });
  const [charityDiceCount, setCharityDiceCount] = useState(2); // Количество кубиков для благотворительности (2 для малого круга, 1-3 для большого)
  
  // Состояние для отображения количества карточек




  // Инициализация колоды сделок
  useEffect(() => {
    initializeDealDeck();
  }, []);
  
  // Автоматически сворачиваем мобильное меню, если не ход игрока
  useEffect(() => {
    if (isMobile && !canRollDice) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobile, canRollDice]);

  // Функция инициализации колоды сделок
  const initializeDealDeck = () => {
    const smallDeals = [
      // Tesla акции (обычные - продажа только в свой ход)
      { id: 15, type: 'small', name: 'Tesla акции ($10)', cost: 10, income: 0, description: 'Tesla акции (диапазон цены $10-$40) - стоимость: $10, доход: нет. Максимум: 100000. Продажа только в свой ход.', maxQuantity: 100000, isDividendStock: false },
      { id: 16, type: 'small', name: 'Tesla акции ($20)', cost: 20, income: 0, description: 'Tesla акции (диапазон цены $10-$40) - стоимость: $20, доход: нет. Максимум: 100000. Продажа только в свой ход.', maxQuantity: 100000, isDividendStock: false },
      { id: 17, type: 'small', name: 'Tesla акции ($30)', cost: 30, income: 0, description: 'Tesla акции (диапазон цены $10-$40) - стоимость: $30, доход: нет. Максимум: 100000. Продажа только в свой ход.', maxQuantity: 100000, isDividendStock: false },
      { id: 18, type: 'small', name: 'Tesla акции ($40)', cost: 40, income: 0, description: 'Tesla акции (диапазон цены $10-$40) - стоимость: $40, доход: нет. Максимум: 100000. Продажа только в свой ход.', maxQuantity: 100000, isDividendStock: false },
      { id: 19, type: 'small', name: 'Tesla акции ($50)', cost: 50, income: 0, description: 'Tesla акции (диапазон цены $10-$40) - стоимость: $50, доход: нет. Максимум: 100000. Продажа только в свой ход.', maxQuantity: 100000, isDividendStock: false },
      // Microsoft акции (обычные - продажа только в свой ход)
      { id: 20, type: 'small', name: 'Microsoft акции ($10)', cost: 10, income: 0, description: 'Microsoft акции (диапазон цены $10-$40) - стоимость: $10, доход: нет. Максимум: 100000. Продажа только в свой ход.', maxQuantity: 100000, isDividendStock: false },
      { id: 21, type: 'small', name: 'Microsoft акции ($20)', cost: 20, income: 0, description: 'Microsoft акции (диапазон цены $10-$40) - стоимость: $20, доход: нет. Максимум: 100000. Продажа только в свой ход.', maxQuantity: 100000, isDividendStock: false },
      { id: 22, type: 'small', name: 'Microsoft акции ($20)', cost: 20, income: 0, description: 'Microsoft акции (диапазон цены $10-$40) - стоимость: $20, доход: нет. Максимум: 100000. Продажа только в свой ход.', maxQuantity: 100000, isDividendStock: false },
      { id: 23, type: 'small', name: 'Microsoft акции ($30)', cost: 30, income: 0, description: 'Microsoft акции (диапазон цены $10-$40) - стоимость: $30, доход: нет. Максимум: 100000. Продажа только в свой ход.', maxQuantity: 100000, isDividendStock: false },
      { id: 24, type: 'small', name: 'Microsoft акции ($30)', cost: 30, income: 0, description: 'Microsoft акции (диапазон цены $10-$40) - стоимость: $30, доход: нет. Максимум: 100000. Продажа только в свой ход.', maxQuantity: 100000, isDividendStock: false },
      { id: 25, type: 'small', name: 'Microsoft акции ($40)', cost: 40, income: 0, description: 'Microsoft акции (диапазон цены $10-$40) - стоимость: $40, доход: нет. Максимум: 100000. Продажа только в свой ход.', maxQuantity: 100000, isDividendStock: false },
      { id: 26, type: 'small', name: 'Microsoft акции ($50)', cost: 50, income: 0, description: 'Microsoft акции (диапазон цены $10-$40) - стоимость: $50, доход: нет. Максимум: 100000. Продажа только в свой ход.', maxQuantity: 100000, isDividendStock: false },
      // Nvidia акции (обычные - продажа только в свой ход)
      { id: 27, type: 'small', name: 'Nvidia акции ($10)', cost: 10, income: 0, description: 'Nvidia акции (диапазон цены $10-$40) - стоимость: $10, доход: нет. Максимум: 100000. Продажа только в свой ход.', maxQuantity: 100000, isDividendStock: false },
      { id: 28, type: 'small', name: 'Nvidia акции ($20)', cost: 20, income: 0, description: 'Nvidia акции (диапазон цены $10-$40) - стоимость: $20, доход: нет. Максимум: 100000. Продажа только в свой ход.', maxQuantity: 100000, isDividendStock: false },
      { id: 29, type: 'small', name: 'Nvidia акции ($20)', cost: 20, income: 0, description: 'Nvidia акции (диапазон цены $10-$40) - стоимость: $20, доход: нет. Максимум: 100000. Продажа только в свой ход.', maxQuantity: 100000, isDividendStock: false },
      { id: 30, type: 'small', name: 'Nvidia акции ($30)', cost: 30, income: 0, description: 'Nvidia акции (диапазон цены $10-$40) - стоимость: $30, доход: нет. Максимум: 100000. Продажа только в свой ход.', maxQuantity: 100000, isDividendStock: false },
      { id: 31, type: 'small', name: 'Nvidia акции ($30)', cost: 30, income: 0, description: 'Nvidia акции (диапазон цены $10-$40) - стоимость: $30, доход: нет. Максимум: 100000. Продажа только в свой ход.', maxQuantity: 100000, isDividendStock: false },
      { id: 32, type: 'small', name: 'Nvidia акции ($40)', cost: 40, income: 0, description: 'Nvidia акции (диапазон цены $10-$40) - стоимость: $40, доход: нет. Максимум: 100000. Продажа только в свой ход.', maxQuantity: 100000, isDividendStock: false },
      { id: 33, type: 'small', name: 'Nvidia акции ($50)', cost: 50, income: 0, description: 'Nvidia акции (диапазон цены $10-$40) - стоимость: $50, доход: нет. Максимум: 100000. Продажа только в свой ход.', maxQuantity: 100000, isDividendStock: false },
      // Apple акции (обычные - продажа только в свой ход)
      { id: 34, type: 'small', name: 'Apple акции ($10)', cost: 10, income: 0, description: 'Apple акции (диапазон цены $10-$40) - стоимость: $10, доход: нет. Максимум: 100000. Продажа только в свой ход.', maxQuantity: 100000, isDividendStock: false },
      { id: 35, type: 'small', name: 'Apple акции ($20)', cost: 20, income: 0, description: 'Apple акции (диапазон цены $10-$40) - стоимость: $20, доход: нет. Максимум: 100000. Продажа только в свой ход.', maxQuantity: 100000, isDividendStock: false },
      { id: 36, type: 'small', name: 'Apple акции ($20)', cost: 20, income: 0, description: 'Apple акции (диапазон цены $10-$40) - стоимость: $20, доход: нет. Максимум: 100000. Продажа только в свой ход.', maxQuantity: 100000, isDividendStock: false },
      { id: 37, type: 'small', name: 'Apple акции ($30)', cost: 30, income: 0, description: 'Apple акции (диапазон цены $10-$40) - стоимость: $30, доход: нет. Максимум: 100000. Продажа только в свой ход.', maxQuantity: 100000, isDividendStock: false },
      { id: 38, type: 'small', name: 'Apple акции ($30)', cost: 30, income: 0, description: 'Apple акции (диапазон цены $10-$40) - стоимость: $30, доход: нет. Максимум: 100000. Продажа только в свой ход.', maxQuantity: 100000, isDividendStock: false },
      { id: 39, type: 'small', name: 'Apple акции ($40)', cost: 40, income: 0, description: 'Apple акции (диапазон цены $10-$40) - стоимость: $40, доход: нет. Максимум: 100000. Продажа только в свой ход.', maxQuantity: 100000, isDividendStock: false },
      { id: 40, type: 'small', name: 'Apple акции ($50)', cost: 50, income: 0, description: 'Apple акции (диапазон цены $10-$40) - стоимость: $50, доход: нет. Максимум: 100000. Продажа только в свой ход.', maxQuantity: 100000, isDividendStock: false },
      // BTC (биткоин - продажа только в свой ход)
      { id: 41, type: 'small', name: 'BTC ($1000)', cost: 1000, income: 100, description: 'Биткоин высокорисковый актив с колебанием цен 1000-100 000$. Максимум: 1000. Продажа только в свой ход.', maxQuantity: 1000, isDividendStock: false },
      { id: 42, type: 'small', name: 'BTC ($5000)', cost: 5000, income: 500, description: 'Биткоин высокорисковый актив с колебанием цен 1000-100 000$. Максимум: 1000. Продажа только в свой ход.', maxQuantity: 1000, isDividendStock: false },
      { id: 43, type: 'small', name: 'BTC ($10000)', cost: 10000, income: 1000, description: 'Биткоин высокорисковый актив с колебанием цен 1000-100 000$. Максимум: 1000. Продажа только в свой ход.', maxQuantity: 1000, isDividendStock: false },
      { id: 44, type: 'small', name: 'BTC ($20000)', cost: 20000, income: 2000, description: 'Биткоин высокорисковый актив с колебанием цен 1000-100 000$. Максимум: 1000. Продажа только в свой ход.', maxQuantity: 1000, isDividendStock: false },
      { id: 45, type: 'small', name: 'BTC ($1000)', cost: 1000, income: 100, description: 'Биткоин высокорисковый актив с колебанием цен 1000-100 000$. Максимум: 1000. Продажа только в ход, когда карточка выходит.', maxQuantity: 1000, isDividendStock: false },
      { id: 46, type: 'small', name: 'BTC ($5000)', cost: 5000, income: 500, description: 'Биткоин высокорисковый актив с колебанием цен 1000-100 000$. Максимум: 1000. Продажа только в ход, когда карточка выходит.', maxQuantity: 1000, isDividendStock: false },
      { id: 47, type: 'small', name: 'BTC ($10000)', cost: 10000, income: 1000, description: 'Биткоин высокорисковый актив с колебанием цен 1000-100 000$. Максимум: 1000. Продажа только в ход, когда карточка выходит.', maxQuantity: 1000, isDividendStock: false },
      { id: 48, type: 'small', name: 'BTC ($20000)', cost: 20000, income: 2000, description: 'Биткоин высокорисковый актив с колебанием цен 1000-100 000$. Максимум: 1000. Продажа только в ход, когда карточка выходит.', maxQuantity: 1000, isDividendStock: false },
      { id: 49, type: 'small', name: 'BTC ($50000)', cost: 50000, income: 5000, description: 'Биткоин высокорисковый актив с колебанием цен 1000-100 000$. Максимум: 1000. Продажа только в ход, когда карточка выходит.', maxQuantity: 1000, isDividendStock: false },
      { id: 50, type: 'small', name: 'BTC ($100000)', cost: 100000, income: 10000, description: 'Биткоин высокорисковый актив с колебанием цен 1000-100 000$. Максимум: 1000. Продажа только в ход, когда карточка выходит.', maxQuantity: 1000, isDividendStock: false },
      // Дивидендные акции (можно продавать в любое время) - по 2 карточки каждой
      { id: 39, type: 'small', name: 'AT&T привилегированные акции (T)', cost: 5000, income: 30, description: 'Привилегированные акции дают доход AT&T. Дивиденды: $30/мес. Продажа в любое время.', maxQuantity: 1000, isDividendStock: true, dividendYield: 30 },
      { id: 40, type: 'small', name: 'AT&T привилегированные акции (T)', cost: 5000, income: 30, description: 'Привилегированные акции дают доход AT&T. Дивиденды: $30/мес. Продажа в любое время.', maxQuantity: 1000, isDividendStock: true, dividendYield: 30 },
      { id: 41, type: 'small', name: 'Procter & Gamble привилегированные акции (PG)', cost: 2000, income: 10, description: 'Привилегированные акции дают доход Procter & Gamble. Дивиденды: $10/мес. Продажа в любое время.', maxQuantity: 1000, isDividendStock: true, dividendYield: 10 },
      { id: 42, type: 'small', name: 'Procter & Gamble привилегированные акции (PG)', cost: 2000, income: 10, description: 'Привилегированные акции дают доход Procter & Gamble. Дивиденды: $10/мес. Продажа в любое время.', maxQuantity: 1000, isDividendStock: true, dividendYield: 10 },
      // Новые карточки малых сделок
      { id: 51, type: 'small', name: 'Комната в пригороде', cost: 3000, income: 250, description: 'Комната в пригороде для сдачи в аренду' },
      { id: 52, type: 'small', name: 'Комната в пригороде', cost: 3000, income: 250, description: 'Комната в пригороде для сдачи в аренду' },
      { id: 53, type: 'small', name: 'Комната в пригороде', cost: 3000, income: 250, description: 'Комната в пригороде для сдачи в аренду' },
      { id: 54, type: 'small', name: 'Комната в пригороде', cost: 3000, income: 250, description: 'Комната в пригороде для сдачи в аренду' },
      { id: 55, type: 'small', name: 'Комната в пригороде', cost: 3000, income: 250, description: 'Комната в пригороде для сдачи в аренду' },
      { id: 56, type: 'small', name: 'Студия маникюра на 1 место', cost: 4900, income: 200, description: 'Студия маникюра на 1 рабочее место' },
      { id: 57, type: 'small', name: 'Студия маникюра на 1 место', cost: 4900, income: 200, description: 'Студия маникюра на 1 рабочее место' },
      { id: 58, type: 'small', name: 'Кофейня', cost: 4900, income: 100, description: 'Небольшая кофейня' },
      { id: 59, type: 'small', name: 'Кофейня', cost: 4900, income: 100, description: 'Небольшая кофейня' },
      { id: 60, type: 'small', name: 'Партнёрство в автомастерской', cost: 4500, income: 350, description: 'Партнёрство в автомастерской' },
      { id: 61, type: 'small', name: 'Партнёрство в автомастерской', cost: 4500, income: 350, description: 'Партнёрство в автомастерской' },
      { id: 62, type: 'small', name: 'Друг просит в займ', cost: 5000, income: 0, description: 'Друг просит в займ - благотворительность' },
      { id: 63, type: 'small', name: 'Приют для кошек', cost: 5000, income: 0, description: 'Пожертвование в приют для кошек' },
      { id: 64, type: 'small', name: 'Накормить бездомных', cost: 5000, income: 0, description: 'Благотворительность - накормить бездомных' },
      { id: 65, type: 'small', name: 'Участок земли 20га', cost: 5000, income: 0, description: 'Участок земли 20 га - инвестиция в недвижимость' },
      { id: 66, type: 'small', name: 'Крыша протекла', cost: 5000, income: 0, description: 'Крыша протекла — возможность обновить крышу (если у игрока есть недвижимость)', isExpense: true },
      { id: 67, type: 'small', name: 'Покупка дрона для съёмок', cost: 3000, income: 50, description: 'Покупка дрона для съёмок - дополнительный доход' },
      { id: 68, type: 'small', name: 'Флипинг студии', cost: 5000, income: 50, description: 'Флипинг студии - перепродажа недвижимости' },
      { id: 69, type: 'small', name: 'Прорыв канализации', cost: 2000, income: 0, description: 'Прорыв канализации (у вас есть возможность починить канализацию)', isExpense: true },
      // Карточки "другу нужны деньги"
      { id: 70, type: 'small', name: 'Другу нужны деньги', cost: 5000, income: 0, description: 'Другу нужны деньги, он вам будет благодарен', isFriendMoneyCard: true, friendCardNumber: 1 },
      { id: 71, type: 'small', name: 'Другу нужны деньги', cost: 5000, income: 0, description: 'Другу нужны деньги, он вам будет благодарен', isFriendMoneyCard: true, friendCardNumber: 2 },
      { id: 72, type: 'small', name: 'Другу нужны деньги', cost: 5000, income: 0, description: 'Другу нужны деньги, он вам будет благодарен', isFriendMoneyCard: true, friendCardNumber: 3 }
    ];

    const bigDeals = [
      { id: 9, type: 'big', name: 'Отель', cost: 100000, income: 8000, description: 'Небольшой отель в центре города' },
      { id: 10, type: 'big', name: 'Торговый центр', cost: 200000, income: 20000, description: 'Торговый центр' },
      { id: 11, type: 'big', name: 'Завод', cost: 300000, income: 35000, description: 'Производственное предприятие' },
      { id: 12, type: 'big', name: 'Университет', cost: 500000, income: 60000, description: 'Частный университет' },
      { id: 13, type: 'big', name: 'Больница', cost: 400000, income: 45000, description: 'Частная клиника' },
      { id: 14, type: 'big', name: 'Аэропорт', cost: 1000000, income: 150000, description: 'Региональный аэропорт' },
      // 10 карточек домов стоимостью 7000-10000$ и доходом 100-300$
      { id: 70, type: 'big', name: 'Дом в пригороде', cost: 7000, income: 100, description: 'Небольшой дом в пригороде для сдачи в аренду' },
      { id: 71, type: 'big', name: 'Дом в пригороде', cost: 7500, income: 120, description: 'Небольшой дом в пригороде для сдачи в аренду' },
      { id: 72, type: 'big', name: 'Дом в пригороде', cost: 8000, income: 140, description: 'Небольшой дом в пригороде для сдачи в аренду' },
      { id: 73, type: 'big', name: 'Дом в пригороде', cost: 8500, income: 160, description: 'Небольшой дом в пригороде для сдачи в аренду' },
      { id: 74, type: 'big', name: 'Дом в пригороде', cost: 9000, income: 180, description: 'Небольшой дом в пригороде для сдачи в аренду' },
      { id: 75, type: 'big', name: 'Дом в пригороде', cost: 9500, income: 200, description: 'Небольшой дом в пригороде для сдачи в аренду' },
      { id: 76, type: 'big', name: 'Дом в пригороде', cost: 10000, income: 220, description: 'Небольшой дом в пригороде для сдачи в аренду' },
      { id: 77, type: 'big', name: 'Дом в пригороде', cost: 8000, income: 150, description: 'Небольшой дом в пригороде для сдачи в аренду' },
      { id: 78, type: 'big', name: 'Дом в пригороде', cost: 8500, income: 170, description: 'Небольшой дом в пригороде для сдачи в аренду' },
      { id: 79, type: 'big', name: 'Дом в пригороде', cost: 9000, income: 190, description: 'Небольшой дом в пригороде для сдачи в аренду' },
      // Новые карточки бизнесов
      { id: 80, type: 'big', name: 'Мини-отель', cost: 80000, income: 3000, description: 'Бутик-отель на 10 номеров, стабильно приносит доход' },
      { id: 81, type: 'big', name: 'Сеть кафе быстрого питания', cost: 200000, income: 7000, description: 'Прибыльный бизнес, несколько точек в центре города' },
      { id: 82, type: 'big', name: 'Ферма органических овощей', cost: 120000, income: 4500, description: 'Экологичное хозяйство с контрактами на поставку' },
      { id: 83, type: 'big', name: 'Сеть автомоек', cost: 150000, income: 5000, description: 'Хорошее расположение, стабильный трафик клиентов' },
      { id: 84, type: 'big', name: 'Коворкинг-центр', cost: 250000, income: 8000, description: 'Большое пространство для аренды под стартапы и фрилансеров' },
      { id: 85, type: 'big', name: 'Мини-отель', cost: 80000, income: 3000, description: 'Бутик-отель на 10 номеров, стабильно приносит доход' },
      { id: 86, type: 'big', name: 'Сеть кафе быстрого питания', cost: 200000, income: 7000, description: 'Прибыльный бизнес, несколько точек в центре города' },
      { id: 87, type: 'big', name: 'Франшиза "Энергия денег"', cost: 100000, income: 10000, description: 'Франшиза на страну игры "Энергия денег" - прибыльный образовательный бизнес' }
    ];

    // Перемешиваем карточки
    const shuffledDeck = [...smallDeals, ...bigDeals].sort(() => Math.random() - 0.5);
    setDealDeck(shuffledDeck);
    

  };

  // Функция броска кубика
  const rollDice = () => {
    if (isRolling || !canRollDice) return;
    
    setIsRolling(true);
    setDiceRolled(true);
    setCanRollDice(false);
    
    if (hasCharityBonus) {
      // Бросаем кубики при наличии бонуса благотворительности
      const dice1 = Math.floor(Math.random() * 6) + 1;
      const dice2 = Math.floor(Math.random() * 6) + 1;
      const dice3 = Math.floor(Math.random() * 6) + 1;
      
      // Определяем количество кубиков в зависимости от круга
      const diceCount = isOnBigCircle ? charityDiceCount : 2;
      let sum = 0;
      
      if (diceCount === 1) {
        sum = dice1;
      } else if (diceCount === 2) {
        sum = dice1 + dice2;
      } else if (diceCount === 3) {
        sum = dice1 + dice2 + dice3;
      }
      
      // Показываем модал выбора хода
      setShowCharityDiceModal(true);
      setCharityDiceValues({ dice1, dice2, dice3, sum });
      
      setIsRolling(false);
      return;
    }
    
    // Обычный бросок одного кубика
    const rollInterval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
    }, 100);

    setTimeout(() => {
      clearInterval(rollInterval);
      const finalValue = Math.floor(Math.random() * 6) + 1;
      setDiceValue(finalValue);
      setIsRolling(false);
      
      // Двигаем фишку текущего игрока
      movePlayer(finalValue);
      
      // Через 10 секунд после броска кнопка превращается в "Переход хода"
      setTimeout(() => {
        if (diceRolled) {
          setCanRollDice(false);
        }
      }, 10000);
    }, 1000);
  };
  
  // Функции для модальных окон
  const openPlayerModal = (player) => {
    setSelectedPlayer(player);
    setShowPlayerModal(true);
  };
  
  const openBankModal = () => {
    setShowBankModal(true);
  };
  
  const openAssetsModal = () => {
    setShowAssetsModal(true);
  };

  const openProfessionCard = (professionId) => {
    setSelectedProfessionId(professionId);
    setShowProfessionCard(true);
  };

  const closeCreditModal = () => {
    setShowCreditModal(false);
    setCustomCreditAmount(''); // Очищаем поле ввода
    setCustomPayoffAmount(''); // Очищаем поле погашения
    setCreditModalFromDeal(false); // Сбрасываем флаг
  };

  // Функция для передачи актива
  const handleTransferAsset = (asset) => {
    setSelectedAssetForTransfer(asset);
    setShowAssetTransferModal(true);
  };

  // Функция передачи актива конкретному игроку
  const handleTransferAssetToPlayer = (playerIndex) => {
    if (!selectedAssetForTransfer) return;
    
    const currentPlayerData = getCurrentPlayer();
    const targetPlayer = getPlayerByIndex(playerIndex);
    
    // Передаем одну акцию/актив
    if (selectedAssetForTransfer.quantity > 1) {
      // Если у игрока больше одной акции, уменьшаем количество
      const currentAssets = getCurrentPlayerAssets();
      const updatedAssets = currentAssets.map(asset => 
        asset.id === selectedAssetForTransfer.id 
          ? { ...asset, quantity: asset.quantity - 1 }
          : asset
      );
      updateCurrentPlayerAssets(updatedAssets);
    } else {
      // Если у игрока только одна акция, удаляем актив полностью
      const currentAssets = getCurrentPlayerAssets();
      const updatedAssets = currentAssets.filter(asset => asset.id !== selectedAssetForTransfer.id);
      updateCurrentPlayerAssets(updatedAssets);
    }
    
    // Добавляем актив целевому игроку (здесь нужно обновить состояние активов целевого игрока)
    // Пока что просто показываем уведомление
    
    setToast({
      open: true,
      message: `🎁 ${currentPlayerData?.username || 'Игрок'} передал 1 ${selectedAssetForTransfer.name} игроку ${targetPlayer?.username || 'Игрок'}`,
      severity: 'success'
    });
    
    console.log(`🎁 [OriginalGameBoard] ${currentPlayerData?.username || 'Игрок'} передал 1 ${selectedAssetForTransfer.name} игроку ${targetPlayer?.username || 'Игрок'}`);
    
    // Закрываем модальные окна
    setShowAssetTransferModal(false);
    setSelectedAssetForTransfer(null);
  };
  
  const closeModals = () => {
    setShowPlayerModal(false);
    setShowBankModal(false);
    setShowAssetsModal(false);
    setShowProfessionCard(false);
    setShowCreditModal(false);
    setShowAssetTransferModal(false);
    setSelectedPlayer(null);
    setSelectedProfessionId(null);
    setSelectedAssetForTransfer(null);
    setCustomCreditAmount(''); // Очищаем поле ввода кредита
    setCustomPayoffAmount(''); // Очищаем поле погашения кредита
  };
  


  // Функция начисления дохода при прохождении денег на большом круге
  const handleBigCircleMoneyPass = () => {
    if (!isOnBigCircle) return;
    
    const player = getCurrentPlayer();
    const currentIncome = bigCirclePassiveIncome;
    
    setBigCircleBalance(prev => prev + currentIncome);
    
    setToast({
      open: true,
      message: `💰 ${player?.username || 'Игрок'} получил доход $${currentIncome.toLocaleString()} (большой круг)`,
      severity: 'success'
    });
    
    console.log(`💰 [OriginalGameBoard] Игрок ${player?.username || 'Игрок'} получил доход $${currentIncome} на большом круге`);
  };

  // Функция покупки бизнеса на большом круге
  const handleBigCircleBusinessPurchase = (cellId, businessData) => {
    if (!isOnBigCircle) return;
    
    const player = getCurrentPlayer();
    const currentBalance = bigCircleBalance;
    const businessCost = businessData.cost;
    const businessIncome = businessData.income;
    
    if (currentBalance >= businessCost) {
      // Покупаем бизнес
      setBigCircleBalance(prev => prev - businessCost);
      
      // Добавляем бизнес к списку
      const newBusiness = {
        id: Date.now(),
        cellId: cellId,
        name: businessData.name,
        cost: businessCost,
        income: businessIncome,
        owner: player.id,
        ownerName: player?.username || 'Игрок',
        ownerColor: player.color
      };
      
      setBigCircleBusinesses(prev => [...prev, newBusiness]);
      
      // Увеличиваем пассивный доход
      setBigCirclePassiveIncome(prev => prev + businessIncome);
      
      // Устанавливаем владельца клетки
      setBigCircleCells(prev => ({
        ...prev,
        [cellId]: {
          owner: player.id,
          ownerName: player?.username || 'Игрок',
          ownerColor: player.color,
          business: newBusiness
        }
      }));
      
      setToast({
        open: true,
        message: `✅ ${player?.username || 'Игрок'} купил ${businessData.name} за $${businessCost.toLocaleString()}. Доход увеличен на $${businessIncome}/ход`,
        severity: 'success'
      });
      
      console.log(`✅ [OriginalGameBoard] Игрок ${player?.username || 'Игрок'} купил бизнес ${businessData.name} на большом круге`);
      
      // Проверяем условия победы
      if (checkVictoryConditions(player.id)) {
        setShowVictoryModal(true);
        setIsGameFinished(true);
      }
    } else {
      setToast({
        open: true,
        message: `❌ Недостаточно денег для покупки ${businessData.name}. Нужно: $${businessCost.toLocaleString()}`,
        severity: 'error'
      });
    }
  };

  // Функция проверки условий победы
  const checkVictoryConditions = (playerId) => {
    const player = gamePlayers.find(p => p.socketId === playerId);
    if (!player || !isOnBigCircle) return false;
    
    // Условие 1: 2 бизнеса + мечта
    const businessCount = bigCircleBusinesses.filter(b => b.owner === playerId).length;
    const dreamCount = bigCircleDreams.filter(d => d.owner === playerId).length;
    
    if (businessCount >= 2 && dreamCount >= 1) {
      setVictoryReason(`🏆 ${player?.username || 'Игрок'} победил! Купил 2 бизнеса и мечту!`);
      return true;
    }
    
    // Условие 2: бизнес + пассивный доход +50,000$ к начальному
    const initialIncome = getTotalAssetsIncome() * 10; // Начальный доход на большом круге
    const currentIncome = bigCirclePassiveIncome;
    const incomeIncrease = currentIncome - initialIncome;
    
    if (businessCount >= 1 && incomeIncrease >= 50000) {
      setVictoryReason(`🏆 ${player?.username || 'Игрок'} победил! Купил бизнес и увеличил доход на $${incomeIncrease.toLocaleString()}!`);
      return true;
    }
    
    return false;
  };

  // Функция покупки мечты на большом круге
  const handleBigCircleDreamPurchase = (cellId, dreamData) => {
    if (!isOnBigCircle) return;
    
    const player = getCurrentPlayer();
    const currentBalance = bigCircleBalance;
    const dreamCost = dreamData.cost;
    
    if (currentBalance >= dreamCost) {
      // Покупаем мечту
      setBigCircleBalance(prev => prev - dreamCost);
      
      // Добавляем мечту к списку
      const newDream = {
        id: Date.now(),
        cellId: cellId,
        name: dreamData.name,
        cost: dreamCost,
        owner: player.id,
        ownerName: player?.username || 'Игрок',
        ownerColor: player.color
      };
      
      setBigCircleDreams(prev => [...prev, newDream]);
      
      setToast({
        open: true,
        message: `🌟 ${player?.username || 'Игрок'} купил мечту "${dreamData.name}" за $${dreamCost.toLocaleString()}!`,
        severity: 'success'
      });
      
      console.log(`🌟 [OriginalGameBoard] Игрок ${player?.username || 'Игрок'} купил мечту ${dreamData.name} на большом круге`);
      
      // Проверяем условия победы
      if (checkVictoryConditions(player.id)) {
        setShowVictoryModal(true);
        setIsGameFinished(true);
      }
    } else {
      setToast({
        open: true,
        message: `❌ Недостаточно денег для покупки мечты "${dreamData.name}". Нужно: $${dreamCost.toLocaleString()}`,
        severity: 'error'
      });
    }
  };

  // Функция расчета рейтинга
  const calculateRankings = () => {
    const rankings = gamePlayers.map(player => {
      const playerData = {
        id: player.socketId,
        name: player.username,
        color: player.color,
        position: player.position || 1,
        isOnBigCircle: true, // Всегда на большом круге
        passiveIncome: isOnBigCircle ? bigCirclePassiveIncome : getTotalAssetsIncome(),
        balance: isOnBigCircle ? bigCircleBalance : player.balance || 0,
        businessCount: bigCircleBusinesses.filter(b => b.owner === player.socketId).length,
        dreamCount: bigCircleDreams.filter(d => d.owner === player.socketId).length,
        hasWon: false,
        rank: 0,
        points: 0
      };
      
      // Проверяем, победил ли игрок
      if (checkVictoryConditions(player.socketId)) {
        playerData.hasWon = true;
      }
      
      return playerData;
    });
    
    // Сортируем по приоритету рейтинга
    rankings.sort((a, b) => {
      // 1. Победители (купили мечту)
      if (a.hasWon && !b.hasWon) return -1;
      if (!a.hasWon && b.hasWon) return 1;
      
      // 2. На большом круге с самым высоким пассивным доходом
      if (a.isOnBigCircle && b.isOnBigCircle) {
        return b.passiveIncome - a.passiveIncome;
      }
      if (a.isOnBigCircle && !b.isOnBigCircle) return -1;
      if (!a.isOnBigCircle && b.isOnBigCircle) return 1;
      
      // 3. На малом круге с самым большим пассивным доходом
      if (!a.isOnBigCircle && !b.isOnBigCircle) {
        if (a.passiveIncome !== b.passiveIncome) {
          return b.passiveIncome - a.passiveIncome;
        }
      }
      
      // 4. По количеству денег на балансе
      return b.balance - a.balance;
    });
    
    // Назначаем места и очки
    const totalPlayers = rankings.length;
    rankings.forEach((player, index) => {
      player.rank = index + 1;
      
      // Рассчитываем очки по системе рейтинга
      if (player.hasWon) {
        // Победитель получает очки равные количеству игроков
        player.points = totalPlayers;
      } else {
        // Остальные получают очки равные количеству обойденных игроков
        player.points = totalPlayers - player.rank;
      }
    });
    
    return rankings;
  };

  // Функция завершения игры
  const endGame = () => {
    const rankings = calculateRankings();
    setPlayerRankings(rankings);
    setShowRankingsModal(true);
    setIsGameFinished(true);
    
    console.log(`🏁 [OriginalGameBoard] Игра завершена! Рейтинг:`, rankings);
  };

  // Функция проверки времени игры
  const checkGameTime = () => {
    const currentTime = Date.now();
    if (currentTime >= gameEndTime && !isGameFinished) {
      endGame();
    }
  };

  // Таймер для проверки времени игры
  useEffect(() => {
    const interval = setInterval(checkGameTime, 60000); // Проверяем каждую минуту
    return () => clearInterval(interval);
  }, [gameEndTime, isGameFinished]);

  // Функция перекупки бизнеса на большом круге
  const handleBigCircleBusinessTakeover = (cellId, businessData) => {
    if (!isOnBigCircle) return;
    
    const player = gamePlayers[currentPlayer];
    const currentBalance = bigCircleBalance;
    const currentOwner = bigCircleCells[cellId];
    
    if (!currentOwner) return;
    
    // Цена перекупки = предыдущая цена * 2
    const takeoverCost = businessData.cost * 2;
    
    if (currentBalance >= takeoverCost) {
      // Перекупаем бизнес
      setBigCircleBalance(prev => prev - takeoverCost);
      
      // Возвращаем деньги предыдущему владельцу
      const previousOwnerIndex = gamePlayers.findIndex(p => p.id === currentOwner.owner);
      if (previousOwnerIndex !== -1) {
        // Здесь нужно обновить баланс предыдущего владельца
        // Пока что просто показываем уведомление
      }
      
      // Удаляем доход у предыдущего владельца
      setBigCirclePassiveIncome(prev => prev - businessData.income);
      
      // Обновляем владельца клетки
      setBigCircleCells(prev => ({
        ...prev,
        [cellId]: {
          owner: player.id,
          ownerName: player?.username || 'Игрок',
          ownerColor: player.color,
          business: {
            ...currentOwner.business,
            owner: player.id,
            ownerName: player?.username || 'Игрок',
            ownerColor: player.color
          }
        }
      }));
      
      // Обновляем бизнес в списке
      setBigCircleBusinesses(prev => prev.map(business => 
        business.cellId === cellId 
          ? { ...business, owner: player.id, ownerName: player.username, ownerColor: player.color }
          : business
      ));
      
      // Добавляем доход новому владельцу
      setBigCirclePassiveIncome(prev => prev + businessData.income);
      
      setToast({
        open: true,
        message: `🔄 ${player?.username || 'Игрок'} перекупил ${businessData.name} за $${takeoverCost.toLocaleString()} у ${currentOwner.ownerName}`,
        severity: 'success'
      });
      
      console.log(`🔄 [OriginalGameBoard] Игрок ${player?.username || 'Игрок'} перекупил бизнес ${businessData.name} у ${currentOwner.ownerName}`);
    } else {
      setToast({
        open: true,
        message: `❌ Недостаточно денег для перекупки ${businessData.name}. Нужно: $${takeoverCost.toLocaleString()}`,
        severity: 'error'
      });
    }
  };

  // Функция движения игрока
  const movePlayer = (steps) => {
    const updatedPlayers = [...gamePlayers];
    const player = updatedPlayers[currentPlayer];
    
    // Проверяем, что игрок существует
    if (!player) {
      console.error('❌ [OriginalGameBoard] Игрок не найден для хода:', currentPlayer);
      return;
    }
    
    // Устанавливаем флаг движения и ID движущегося игрока
    setIsMoving(true);
    setMovingPlayerId(player.id);
    
    // Создаем промежуточные позиции для плавного движения
    const startPosition = player.position;
    let currentPosition = startPosition;
    
    // Анимация движения пошагово
    const moveStep = () => {
      if (currentPosition < startPosition + steps) {
        currentPosition++;
        
        // Логика замыкания круга
        if (isOnBigCircle) {
          // На большом круге: 25-76 (52 клетки)
          if (currentPosition > 76) {
            currentPosition = 25; // Возвращаемся к началу большого круга
          }
        } else {
          // На малом круге: 1-24 (24 клетки)
          if (currentPosition > 24) {
            currentPosition = 1; // Возвращаемся к началу малого круга
          }
        }
        
        // Обновляем позицию игрока
        player.position = currentPosition;
        
        // Отправляем обновление позиции на сервер для синхронизации
        if (socket.connected && roomIdRef.current) {
          socket.emit('playerMove', roomIdRef.current, player.socketId, currentPosition);
        }
        
        // Обновляем позицию в gamePlayers локально (для плавности анимации)
        setGamePlayers(prev => prev.map(p => 
          p.socketId === player.socketId ? { ...p, position: currentPosition } : p
        ));
        
        // Продолжаем движение
        setTimeout(moveStep, 200); // 200ms между шагами
      } else {
        // Движение завершено
        setIsMoving(false);
        setMovingPlayerId(null);
        
        // Игроки всегда на большом круге
        
        // Обрабатываем логику клетки
        handleCellAction(player.position);
        
        console.log(`🎯 Игрок ${player?.username || 'Игрок'} переместился на позицию ${player.position} (большой круг)`);
      }
    };
    
    // Начинаем движение
    moveStep();
  };

  // Функция обработки действий клетки
  const handleCellAction = (position) => {
    const player = getCurrentPlayer();
    
    // Всегда логика большого круга
      handleBigCircleCellAction(position);
  };



  // Функция обработки действий клетки на большом круге
  const handleBigCircleCellAction = (position) => {
    const player = getCurrentPlayer();
    
    // Клетки дохода от инвестиций (25, 38, 51, 64)
    if ([25, 38, 51, 64].includes(position)) {
      handleBigCircleMoneyPass();
    }
    
    // Клетки бизнесов (27, 29, 33, 35, 37, 40, 44, 46, 48, 52, 54, 56, 58, 60, 62, 68, 70, 72, 74, 76)
    const businessCells = [27, 29, 33, 35, 37, 40, 44, 46, 48, 52, 54, 56, 58, 60, 62, 68, 70, 72, 74, 76];
    if (businessCells.includes(position)) {
      const cellData = originalBoard.find(cell => cell.id === position);
      if (cellData && cellData.type === 'business') {
        const currentOwner = bigCircleCells[position];
        
        if (currentOwner) {
          // Клетка уже куплена - предлагаем перекупку
          if (currentOwner.owner !== player.id) {
            const takeoverCost = cellData.cost * 2;
            setToast({
              open: true,
              message: `🔄 ${cellData.name} принадлежит ${currentOwner.ownerName}. Цена перекупки: $${takeoverCost.toLocaleString()}`,
              severity: 'info'
            });
            // Здесь можно добавить модал для подтверждения перекупки
          } else {
            setToast({
              open: true,
              message: `✅ ${cellData.name} уже принадлежит вам!`,
              severity: 'success'
            });
          }
        } else {
          // Клетка свободна - предлагаем покупку
          setToast({
            open: true,
            message: `💼 ${cellData.name} - стоимость: $${cellData.cost.toLocaleString()}, доход: $${cellData.income}/ход`,
            severity: 'info'
          });
          // Здесь можно добавить модал для подтверждения покупки
        }
      }
    }
    
    // Клетки мечты (26, 30, 36, 39, 41, 43, 45, 47, 49, 53, 55, 57, 59, 61, 63, 65, 67, 69, 71, 73, 75)
    const dreamCells = [26, 30, 36, 39, 41, 43, 45, 47, 49, 53, 55, 57, 59, 61, 63, 65, 67, 69, 71, 73, 75];
    if (dreamCells.includes(position)) {
      const cellData = originalBoard.find(cell => cell.id === position);
      if (cellData && cellData.type === 'dream') {
        const currentOwner = bigCircleCells[position];
        
        if (currentOwner) {
          // Мечта уже куплена
          if (currentOwner.owner === player.id) {
            setToast({
              open: true,
              message: `🌟 ${cellData.name} уже принадлежит вам!`,
              severity: 'success'
            });
          } else {
            setToast({
              open: true,
              message: `🌟 ${cellData.name} уже куплена игроком ${currentOwner.ownerName}`,
              severity: 'info'
            });
          }
        } else {
          // Мечта свободна - предлагаем покупку
          setToast({
            open: true,
            message: `🌟 ${cellData.name} - стоимость: $${cellData.cost.toLocaleString()}`,
            severity: 'info'
          });
          // Здесь можно добавить модал для подтверждения покупки мечты
        }
      }
    }
    
    // Клетки потерь (28, 34, 42, 50, 66)
    const lossCells = [28, 34, 42, 50, 66];
    if (lossCells.includes(position)) {
      const cellData = originalBoard.find(cell => cell.id === position);
      if (cellData && cellData.type === 'loss') {
        setToast({
          open: true,
          message: `💸 ${cellData.name} - ${cellData.description}`,
          severity: 'error'
        });
      }
    }
    
    // Клетки благотворительности (32)
    if (position === 32) {
      handleBigCircleCharityAction();
    }
  };

  // Функция обработки благотворительности на большом круге
  const handleBigCircleCharityAction = () => {
    const player = getCurrentPlayer();
    
    // На большом круге благотворительность стоит 100,000$
    const charityAmount = 100000;
    
    setCharityCost(charityAmount);
    setCharityDiceCount(3); // На большом круге можно выбрать 1, 2 или 3 кубика
    setShowCharityModal(true);
    
    console.log(`❤️ [OriginalGameBoard] Игрок ${player?.username || 'Игрок'} попал на клетку благотворительности (большой круг). Стоимость: $${charityAmount}`);
  };

  // Функция получения расходов игрока
  const getPlayerExpenses = (profession) => {
    switch (profession) {
      case 'Инженер':
        return 3000;
      case 'Менеджер':
        return 2800;
      case 'Дизайнер':
        return 2500;
      case 'Программист':
        return 3500;
      default:
        return 2500;
    }
  };

  // Функция получения зарплаты по профессии
  const getPlayerSalary = (profession) => {
    // Если профессия - объект, используем salary из объекта
    if (profession && typeof profession === 'object' && profession.salary) {
      return profession.salary;
    }
    
    // Если профессия - строка, используем старую логику
    if (typeof profession === 'string') {
      switch (profession) {
        case 'Инженер':
          return 5000;
        case 'Менеджер':
          return 4500;
        case 'Дизайнер':
          return 4000;
        case 'Программист':
          return 6000;
        default:
          return 4000;
      }
    }
    
    // По умолчанию
    return 4000;
  };

  // Функция рождения ребенка
  const handleChildBirth = () => {
    const player = getCurrentPlayer();
    
    // Бросаем дополнительный кубик
    const childDice = Math.floor(Math.random() * 6) + 1;
    
    if (childDice <= 4) {
      // Ребенок родился!
      setChildrenCount(prev => prev + 1);
      setPlayerMoney(prev => prev + 5000); // Разовая выплата $5000
      
      // Показываем анимацию конфети
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      
      setToast({
        open: true,
        message: `👶 Поздравляем! У ${player?.username || 'Игрок'} родился ребенок! +$5,000`,
        severity: 'success'
      });
      
      console.log(`👶 [OriginalGameBoard] У игрока ${player?.username || 'Игрок'} родился ребенок! Кубик: ${childDice}`);
    } else {
      // Ребенок не родился
      setToast({
        open: true,
        message: `😔 ${player?.username || 'Игрок'}, ребенок не родился. Кубик: ${childDice}`,
        severity: 'info'
      });
      
      console.log(`😔 [OriginalGameBoard] У игрока ${player?.username || 'Игрок'} ребенок не родился. Кубик: ${childDice}`);
    }
    
    setShowChildModal(false);
  };
  
  // Функция обработки благотворительности на малом круге
  const handleCharityAction = () => {
    const player = getCurrentPlayer();
    const assets = getCurrentPlayerAssets();
    
    // Рассчитываем стоимость благотворительности (50% от суммарного дохода)
    const totalIncome = getPlayerSalary(player.profession) + 
                       assets.reduce((sum, asset) => sum + (asset.income || 0), 0);
    const charityAmount = Math.floor(totalIncome * 0.5);
    
    setCharityCost(charityAmount);
    setCharityDiceCount(2); // На малом круге всегда 2 кубика
    setShowCharityModal(true);
    
    console.log(`❤️ [OriginalGameBoard] Игрок ${player?.username || 'Игрок'} попал на клетку благотворительности (малый круг). Стоимость: $${charityAmount}`);
  };

  // Функция обработки карточек рынка
  const handleMarketAction = () => {
    const player = getCurrentPlayer();
    
    // Вытаскиваем карточку из колоды
    const marketCard = marketDeckManager.drawCard();
    
    if (!marketCard) {
      setToast({
        open: true,
        message: '❌ Нет доступных карточек рынка',
        severity: 'error'
      });
      return;
    }
    
    // Получаем активы текущего игрока
    const playerAssets = getCurrentPlayerAssets();
    
    // Проверяем, есть ли у игрока подходящий актив
    const hasMatchingAsset = checkPlayerHasMatchingAsset(playerAssets, marketCard);
    
    // Устанавливаем состояние для модального окна
    setCurrentMarketCard(marketCard);
    setCurrentPlayerAssets(playerAssets);
    setShowMarketCardModal(true);
    
    // Обновляем счетчики колоды
    setMarketDeckCount(marketDeckManager.getDeckCount());
    setMarketDiscardCount(marketDeckManager.getDiscardCount());
    
    console.log(`🏪 [OriginalGameBoard] Игрок ${player?.username || 'Игрок'} попал на клетку рынка. Карточка: ${marketCard.name}`);
    console.log(`📊 [OriginalGameBoard] Колода: ${marketDeckManager.getDeckCount()}, Отбой: ${marketDeckManager.getDiscardCount()}`);
  };

  // Функция обработки карточек расходов
  const handleExpenseAction = () => {
    const player = getCurrentPlayer();
    
    // Вытаскиваем карточку из колоды
    const expenseCard = expenseDeckManager.drawCard();
    
    if (!expenseCard) {
      setToast({
        open: true,
        message: '❌ Нет доступных карточек расходов',
        severity: 'error'
      });
      return;
    }
    
    // Устанавливаем состояние для модального окна
    setCurrentExpenseCard(expenseCard);
    setShowExpenseCardModal(true);
    
    // Обновляем счетчики колоды
    setExpenseDeckCount(expenseDeckManager.getDeckCount());
    setExpenseDiscardCount(expenseDeckManager.getDiscardCount());
    
    console.log(`💸 [OriginalGameBoard] Игрок ${player?.username || 'Игрок'} попал на клетку расходов. Карточка: ${expenseCard.name}`);
    console.log(`📊 [OriginalGameBoard] Колода: ${expenseDeckManager.getDeckCount()}, Отбой: ${expenseDeckManager.getDiscardCount()}`);
  };

  // Функция принятия предложения рынка
  const handleMarketAccept = () => {
    const player = getCurrentPlayer();
    
    if (!currentMarketCard) return;
    
    if (currentMarketCard.type === 'market_crash') {
      // Обработка краха рынка (влияет на всех игроков)
      handleMarketCrash();
    } else {
      // Обработка обычного предложения
      handleMarketSale();
    }
    
    // Откладываем карточку в отбой
    marketDeckManager.discardCard(currentMarketCard);
    
    // Обновляем счетчики колоды
    setMarketDeckCount(marketDeckManager.getDeckCount());
    setMarketDiscardCount(marketDeckManager.getDiscardCount());
    
    setShowMarketCardModal(false);
    setCurrentMarketCard(null);
  };

  // Функция отказа от предложения рынка
  const handleMarketDecline = () => {
    const player = getCurrentPlayer();
    
    setToast({
      open: true,
      message: `${player?.username || 'Игрок'} отказался от предложения рынка`,
      severity: 'info'
    });
    
    // Откладываем карточку в отбой
    marketDeckManager.discardCard(currentMarketCard);
    
    // Обновляем счетчики колоды
    setMarketDeckCount(marketDeckManager.getDeckCount());
    setMarketDiscardCount(marketDeckManager.getDiscardCount());
    
    setShowMarketCardModal(false);
    setCurrentMarketCard(null);
    
    console.log(`😔 [OriginalGameBoard] Игрок ${player?.username || 'Игрок'} отказался от предложения рынка`);
  };

  // Функция обработки продажи актива через рынок
  const handleMarketSale = () => {
    const player = getCurrentPlayer();
    
    if (!currentMarketCard) return;
    
    // Находим актив для продажи
    let assetToSell = null;
    
    if (currentMarketCard.targetAsset === 'any_business') {
      // Продаем первый найденный бизнес
      assetToSell = currentPlayerAssets.find(asset => asset.type === 'business');
    } else {
      // Ищем точное совпадение
      assetToSell = currentPlayerAssets.find(asset => asset.id === currentMarketCard.targetAsset);
    }
    
    if (assetToSell) {
      // Удаляем актив из списка
      const currentAssets = getCurrentPlayerAssets();
      updateCurrentPlayerAssets(currentAssets.filter(asset => asset.id !== assetToSell.id));
      
      // Добавляем деньги от продажи
      setPlayerMoney(prev => prev + currentMarketCard.offerPrice);
      
      setToast({
        open: true,
        message: `💰 ${player?.username || 'Игрок'} продал ${assetToSell.name} за $${currentMarketCard.offerPrice.toLocaleString()}`,
        severity: 'success'
      });
      
      console.log(`💰 [OriginalGameBoard] Игрок ${player?.username || 'Игрок'} продал ${assetToSell.name} за $${currentMarketCard.offerPrice}`);
    }
  };

  // Функция обработки краха рынка
  const handleMarketCrash = () => {
    const player = getCurrentPlayer();
    
    // Удаляем все BTC активы у всех игроков
    const currentAssets = getCurrentPlayerAssets();
    updateCurrentPlayerAssets(currentAssets.filter(asset => asset.type !== 'bitcoin'));
    
    setToast({
      open: true,
      message: `📉 Крах рынка! Все игроки потеряли Bitcoin активы`,
      severity: 'error'
    });
    
    console.log(`📉 [OriginalGameBoard] Крах рынка! Все игроки потеряли Bitcoin активы`);
  };

  // Функция оплаты карточки расхода
  const handleExpensePay = () => {
    const player = getCurrentPlayer();
    
    if (!currentExpenseCard) return;
    
    // Списываем деньги с баланса игрока
    const newBalance = (player?.balance || 0) - currentExpenseCard.cost;
    
    // Синхронизируем с сервером
    syncPlayerData(player?.socketId, { balance: newBalance });
    
    // Обновляем локально для отзывчивости
    setGamePlayers(prev => prev.map(p => 
      p.socketId === player?.socketId 
        ? { ...p, balance: newBalance }
        : p
    ));
    
    // Откладываем карточку в отбой
    expenseDeckManager.discardCard(currentExpenseCard);
    
    // Обновляем счетчики колоды
    setExpenseDeckCount(expenseDeckManager.getDeckCount());
    setExpenseDiscardCount(expenseDeckManager.getDiscardCount());
    
    setToast({
      open: true,
              message: `💸 ${player?.username || 'Игрок'} заплатил $${currentExpenseCard.cost.toLocaleString()} за ${currentExpenseCard.name}`,
      severity: 'info'
    });
    
    setShowExpenseCardModal(false);
    setCurrentExpenseCard(null);
    
    console.log(`💸 [OriginalGameBoard] Игрок ${player?.username || 'Игрок'} заплатил $${currentExpenseCard.cost} за ${currentExpenseCard.name}`);
  };

  // Функция взятия кредита для оплаты расхода
  const handleExpenseTakeCredit = () => {
    const player = getCurrentPlayer();
    
    if (!currentExpenseCard) return;
    
    const shortfall = currentExpenseCard.cost - (player?.balance || 0);
    
    // Добавляем кредит игроку
    const newBalance = (player?.balance || 0) + shortfall - currentExpenseCard.cost;
    const newCredits = (player?.credits || 0) + shortfall;
    
    // Синхронизируем с сервером
    syncPlayerData(player?.socketId, { 
      balance: newBalance,
      credits: newCredits
    });
    
    // Обновляем локально для отзывчивости
    setGamePlayers(prev => prev.map(p => 
      p.socketId === player?.socketId 
        ? { 
            ...p, 
            balance: newBalance,
            credits: newCredits
          }
        : p
    ));
    
    // Откладываем карточку в отбой
    expenseDeckManager.discardCard(currentExpenseCard);
    
    // Обновляем счетчики колоды
    setExpenseDeckCount(expenseDeckManager.getDeckCount());
    setExpenseDiscardCount(expenseDeckManager.getDiscardCount());
    
    setToast({
      open: true,
              message: `💳 ${player?.username || 'Игрок'} взял кредит $${shortfall.toLocaleString()} для оплаты ${currentExpenseCard.name}`,
      severity: 'warning'
    });
    
    setShowExpenseCardModal(false);
    setCurrentExpenseCard(null);
    
    console.log(`💳 [OriginalGameBoard] Игрок ${player?.username || 'Игрок'} взял кредит $${shortfall} для оплаты ${currentExpenseCard.name}`);
  };
  
  // Функция принятия благотворительности
  const handleCharityAccept = () => {
    const player = getCurrentPlayer();
    
    // Проверяем баланс в зависимости от круга
    const currentBalance = isOnBigCircle ? bigCircleBalance : playerMoney;
    
    if (currentBalance >= charityCost) {
      // Списываем деньги
      if (isOnBigCircle) {
        setBigCircleBalance(prev => prev - charityCost);
      } else {
        setPlayerMoney(prev => prev - charityCost);
      }
      
      // Активируем бонус благотворительности
      setHasCharityBonus(true);
      
      // Формируем сообщение в зависимости от круга
      const diceMessage = isOnBigCircle 
        ? `Теперь можно бросать 1, 2 или 3 кубика на выбор!`
        : `Теперь можно бросать 2 кубика!`;
      
      setToast({
        open: true,
        message: `❤️ ${player?.username || 'Игрок'} пожертвовал $${charityCost.toLocaleString()} на благотворительность! ${diceMessage}`,
        severity: 'success'
      });
      
      console.log(`❤️ [OriginalGameBoard] Игрок ${player?.username || 'Игрок'} принял благотворительность за $${charityCost} (${isOnBigCircle ? 'большой круг' : 'малый круг'})`);
    } else {
      setToast({
        open: true,
        message: `❌ Недостаточно денег для благотворительности. Нужно: $${charityCost.toLocaleString()}`,
        severity: 'error'
      });
    }
    
    setShowCharityModal(false);
  };
  
  // Функция отказа от благотворительности
  const handleCharityDecline = () => {
    setShowCharityModal(false);
    
    setToast({
      open: true,
      message: `😔 Игрок отказался от благотворительности`,
      severity: 'info'
    });
    
    console.log(`😔 [OriginalGameBoard] Игрок отказался от благотворительности`);
  };
  
  // Функция выбора хода по кубикам благотворительности
  const handleCharityDiceChoice = (chosenValue) => {
    setShowCharityDiceModal(false);
    
    // Двигаем фишку на выбранное количество шагов
    movePlayer(chosenValue);
    
    // Сбрасываем бонус благотворительности только на малом круге
    // На большом круге бонус действует до конца игры
    if (!isOnBigCircle) {
      setHasCharityBonus(false);
    }
    
    const diceInfo = isOnBigCircle 
      ? `(кубики: ${charityDiceValues.dice1}, ${charityDiceValues.dice2}, ${charityDiceValues.dice3})`
      : `(кубики: ${charityDiceValues.dice1}, ${charityDiceValues.dice2})`;
    
    console.log(`🎲 [OriginalGameBoard] Игрок выбрал ход на ${chosenValue} шагов ${diceInfo} ${isOnBigCircle ? '(большой круг - бонус сохранен)' : '(малый круг - бонус сброшен)'}`);
  };

  // Функция выбора типа сделки
  const handleDealTypeSelection = (dealType) => {
    setShowDealTypeModal(false);
    
    // Проверяем, есть ли бесплатные карточки
    if (hasFreeCards && dealType === 'small') {
      // Показываем модал для выбора бесплатной карточки
      setShowFreeCardsModal(true);
      return;
    }
    
    // Фильтруем карточки по типу
    const availableCards = dealDeck.filter(card => card.type === dealType);
    
    if (availableCards.length === 0) {
      // Если карточки закончились, перемешиваем отбой
      if (discardPile.length > 0) {
        const shuffledDiscard = [...discardPile].sort(() => Math.random() - 0.5);
        setDealDeck(shuffledDiscard);
        setDiscardPile([]);
        

        
        setToast({
          open: true,
          message: `🔄 Колода закончилась! Отбой (${shuffledDiscard.length} карточек) перемешан и возвращен в игру`,
          severity: 'info'
        });
        
        // Повторяем попытку
        handleDealTypeSelection(dealType);
        return;
      } else {
        setToast({
          open: true,
          message: `❌ Карточки ${dealType === 'small' ? 'малых' : 'больших'} сделок закончились`,
          severity: 'warning'
        });
        return;
      }
    }
    
    // Берем первую карточку из колоды
    const card = availableCards[0];
    setCurrentDealCard(card);
    setShowDealModal(true);
    
    // Убираем карточку из колоды
    setDealDeck(prev => prev.filter(c => c.id !== card.id));
    

  };

  // Функция использования бесплатных карточек
  const handleUseFreeCards = () => {
    setHasFreeCards(false);
    
    // Выбираем случайную карточку малой сделки
    const smallCards = dealDeck.filter(card => card.type === 'small' && !card.isFriendMoneyCard);
    const bigCards = dealDeck.filter(card => card.type === 'big');
    
    if (smallCards.length > 0 && bigCards.length > 0) {
      const randomSmallCard = smallCards[Math.floor(Math.random() * smallCards.length)];
      const randomBigCard = bigCards[Math.floor(Math.random() * bigCards.length)];
      
      // Добавляем карточки игроку бесплатно
      const player = gamePlayers[currentPlayer];
      
      // Добавляем малую карточку
      const smallAsset = {
        id: Date.now(),
        type: 'deal',
        name: randomSmallCard.name,
        icon: '🏪',
        value: randomSmallCard.cost,
        cost: 0, // Бесплатно
        income: randomSmallCard.income,
        color: '#10B981',
        description: randomSmallCard.description + ' (бесплатно от друга)',
        quantity: 1,
        isDividendStock: randomSmallCard.isDividendStock || false,
        dividendYield: randomSmallCard.dividendYield || 0,
        maxQuantity: randomSmallCard.maxQuantity || 1
      };
      
      // Добавляем большую карточку
      const bigAsset = {
        id: Date.now() + 1,
        type: 'deal',
        name: randomBigCard.name,
        icon: '🏢',
        value: randomBigCard.cost,
        cost: 0, // Бесплатно
        income: randomBigCard.income,
        color: '#8B5CF6',
        description: randomBigCard.description + ' (бесплатно от друга)',
        quantity: 1,
        isDividendStock: randomBigCard.isDividendStock || false,
        dividendYield: randomBigCard.dividendYield || 0,
        maxQuantity: randomBigCard.maxQuantity || 1
      };
      
      const currentAssets = getCurrentPlayerAssets();
      updateCurrentPlayerAssets([...currentAssets, smallAsset, bigAsset]);
      
      // Убираем карточки из колоды
      setDealDeck(prev => prev.filter(c => c.id !== randomSmallCard.id && c.id !== randomBigCard.id));
      
      setToast({
        open: true,
        message: `🎁 ${player.username} получил бесплатно: ${randomSmallCard.name} и ${randomBigCard.name}!`,
        severity: 'success'
      });
      
      console.log(`🎁 [OriginalGameBoard] Игрок ${player.username} получил бесплатные карточки: ${randomSmallCard.name}, ${randomBigCard.name}`);
    } else {
      setToast({
        open: true,
        message: `❌ Недостаточно карточек для бесплатной раздачи`,
        severity: 'warning'
      });
    }
    
    setShowFreeCardsModal(false);
  };

  // Функция покупки карточки сделки
  const handleBuyDeal = () => {
    if (!currentDealCard) return;
    
    const player = getCurrentPlayer();
    
    if (playerMoney >= currentDealCard.cost) {
      // Покупаем карточку
      const newBalance = playerMoney - currentDealCard.cost;
      
      // Синхронизируем с сервером
      syncPlayerData(player?.socketId, { balance: newBalance });
      
      // Обновляем локально для отзывчивости
      setPlayerMoney(newBalance);
      setGamePlayers(prev => prev.map(p => 
        p.socketId === player?.socketId 
          ? { ...p, balance: newBalance }
          : p
      ));
      
      // Обработка карточек "другу нужны деньги"
      if (currentDealCard.isFriendMoneyCard) {
        setFriendMoneyCardsUsed(prev => prev + 1);
        
        // Применяем эффекты в зависимости от номера карточки
        if (currentDealCard.friendCardNumber === 1) {
          // Первая карточка - ничего не получает
          setToast({
            open: true,
            message: `💝 ${player.username} помог другу! Друг благодарен.`,
            severity: 'info'
          });
        } else if (currentDealCard.friendCardNumber === 2) {
          // Вторая карточка - дополнительный ход
          setHasExtraTurn(true);
          setToast({
            open: true,
            message: `🎯 ${player.username} помог другу! Друг передает свой ход - у вас дополнительный ход!`,
            severity: 'success'
          });
        } else if (currentDealCard.friendCardNumber === 3) {
          // Третья карточка - бесплатные карточки
          setHasFreeCards(true);
          setToast({
            open: true,
            message: `🎁 ${player.username} помог другу! Друг дарит карточку малой и большой возможности!`,
            severity: 'success'
          });
        }
        
        console.log(`💝 [OriginalGameBoard] Игрок ${player.username} купил карточку "другу нужны деньги" #${currentDealCard.friendCardNumber}`);
        setShowDealModal(false);
        setCurrentDealCard(null);
        return;
      }
      
      // Карточки с расходами не добавляются в активы
      if (currentDealCard.isExpense) {
        // Просто тратим деньги, актив не создается
      } else {
        // Проверяем, есть ли уже такой актив у игрока
        const existingAssetIndex = getCurrentPlayerAssets().findIndex(asset => 
          asset.name === currentDealCard.name && asset.type === 'deal'
        );
        
        if (existingAssetIndex !== -1) {
          // Если актив уже есть, увеличиваем количество
          const currentAssets = getCurrentPlayerAssets();
          const updatedAssets = currentAssets.map((asset, index) => 
            index === existingAssetIndex 
              ? { ...asset, quantity: asset.quantity + 1 }
              : asset
          );
          updateCurrentPlayerAssets(updatedAssets);
        } else {
          // Если актива нет, создаем новый
          const newAsset = {
            id: Date.now(),
            type: 'deal',
            name: currentDealCard.name,
            icon: currentDealCard.income === 0 ? '💝' : currentDealCard.type === 'small' ? '🏪' : '🏢',
            value: currentDealCard.cost,
            cost: currentDealCard.cost,
            income: currentDealCard.income,
            color: currentDealCard.income === 0 ? '#F59E0B' : currentDealCard.type === 'small' ? '#10B981' : '#8B5CF6',
            description: currentDealCard.description,
            quantity: 1,
            isDividendStock: currentDealCard.isDividendStock || false,
            dividendYield: currentDealCard.dividendYield || 0,
            maxQuantity: currentDealCard.maxQuantity || 1
          };
          
          const currentAssets = getCurrentPlayerAssets();
          updateCurrentPlayerAssets([...currentAssets, newAsset]);
        }
      }
      
      // Определяем тип сообщения в зависимости от типа карточки
      const isCharity = currentDealCard.income === 0 && !currentDealCard.isExpense && !currentDealCard.isFriendMoneyCard;
      const isExpense = currentDealCard.isExpense;
      
      let message;
      if (isExpense) {
        message = `🔧 ${player.username} потратил $${currentDealCard.cost.toLocaleString()} на ${currentDealCard.name}`;
      } else if (isCharity) {
        message = `💝 ${player.username} пожертвовал $${currentDealCard.cost.toLocaleString()} на ${currentDealCard.name}`;
      } else {
        message = `✅ ${player.username} купил ${currentDealCard.name} за $${currentDealCard.cost.toLocaleString()}`;
      }
      
      setToast({
        open: true,
        message: message,
        severity: isExpense ? 'warning' : isCharity ? 'info' : 'success'
      });
      
      console.log(`✅ [OriginalGameBoard] Игрок ${player.username} ${isExpense ? 'потратил на' : isCharity ? 'пожертвовал на' : 'купил'} ${currentDealCard.name}`);
    } else {
      setToast({
        open: true,
        message: `❌ Недостаточно денег для покупки ${currentDealCard.name}`,
        severity: 'error'
      });
    }
    
    setShowDealModal(false);
    setCurrentDealCard(null);
  };

  // Функция отмены карточки сделки
  const handleCancelDeal = () => {
    if (!currentDealCard) return;
    
    // Карточка уходит в отбой
    setDiscardPile(prev => [...prev, currentDealCard]);
    

    
    setToast({
      open: true,
      message: `🔄 Карточка ${currentDealCard.name} ушла в отбой (всего в отбое: ${discardPile.length + 1})`,
      severity: 'info'
    });
    
    setShowDealModal(false);
    setCurrentDealCard(null);
  };



  // Функция передачи карточки другому игроку
  const handlePassCardToPlayer = () => {
    if (!currentDealCard) return;
    
    // Показываем модал выбора игрока
    setShowPlayerSelectionModal(true);
  };

  // Функция передачи карточки конкретному игроку
  const handlePassCardToSpecificPlayer = (playerIndex) => {
    if (!currentDealCard) return;
    
    const currentPlayerData = getCurrentPlayer();
    const targetPlayer = getPlayerByIndex(playerIndex);
    const assets = getCurrentPlayerAssets();
    
    // Проверяем, есть ли уже такой актив у целевого игрока
    const existingAssetIndex = assets.findIndex(asset => 
      asset.name === currentDealCard.name && asset.type === 'deal'
    );
    
    if (existingAssetIndex !== -1) {
      // Если актив уже есть, увеличиваем количество
      const currentAssets = getCurrentPlayerAssets();
      const updatedAssets = currentAssets.map((asset, index) => 
        index === existingAssetIndex 
          ? { ...asset, quantity: asset.quantity + 1 }
          : asset
      );
      updateCurrentPlayerAssets(updatedAssets);
    } else {
      // Если актива нет, создаем новый
      const newAsset = {
        id: Date.now(),
        type: 'deal',
        name: currentDealCard.name,
        icon: currentDealCard.income === 0 ? '💝' : currentDealCard.type === 'small' ? '🏪' : '🏢',
        value: currentDealCard.cost,
        cost: currentDealCard.cost,
        income: currentDealCard.income,
        color: currentDealCard.income === 0 ? '#F59E0B' : currentDealCard.type === 'small' ? '#10B981' : '#8B5CF6',
        description: currentDealCard.description,
        receivedFrom: currentPlayerData.name, // От кого получена
        quantity: 1,
        isDividendStock: currentDealCard.isDividendStock || false,
        dividendYield: currentDealCard.dividendYield || 0,
        maxQuantity: currentDealCard.maxQuantity || 1
      };
      
      const currentAssets = getCurrentPlayerAssets();
      updateCurrentPlayerAssets([...currentAssets, newAsset]);
    }
    
    setToast({
      open: true,
      message: `🎁 ${currentPlayerData.name} передал ${currentDealCard.name} игроку ${targetPlayer.name}`,
      severity: 'success'
    });
    
    console.log(`🎁 [OriginalGameBoard] ${currentPlayerData.name} передал ${currentDealCard.name} игроку ${targetPlayer.name}`);
    
    setShowPlayerSelectionModal(false);
    setShowDealModal(false);
    setCurrentDealCard(null);
  };

  // Функция для расчета денежного потока (PAYDAY)
  const getCashFlow = () => {
    const totalIncome = getCurrentPlayerAssets().reduce((sum, asset) => sum + (asset.income || 0), 0);
    // Здесь нужно вычесть ежемесячные расходы игрока
    // Пока что используем фиксированные расходы для примера
    const totalExpenses = 4500; // Пример: расходы $4,500
    
    // Вычитаем платежи по кредиту: за каждые $1,000 кредита - $100/мес
    const creditPayments = Math.floor(playerCredit / 1000) * 100;
    
    return totalIncome - totalExpenses - creditPayments;
  };

  // Функция для расчета максимального кредита
  const getMaxCredit = () => {
    const cashFlow = getCashFlow(); // PAYDAY (доходы - расходы)
    // Максимум кредита = PAYDAY * 10
    // Пример: если PAYDAY = $1,500, то макс. кредит = $15,000
    return Math.floor(cashFlow * 10);
  };

  // Функция для взятия кредита
  const handleTakeCredit = (amount) => {
    const maxCredit = getMaxCredit();
    
    if (amount > maxCredit) {
      setToast({
        open: true,
        message: `❌ Максимальный кредит: $${maxCredit.toLocaleString()}`,
        severity: 'error'
      });
      return;
    }
    
    if (amount % 1000 !== 0) {
      setToast({
        open: true,
        message: `❌ Кредит должен быть кратен $1,000`,
        severity: 'error'
      });
      return;
    }
    
    setPlayerCredit(prev => prev + amount);
    setPlayerMoney(prev => prev + amount);
    
    setToast({
      open: true,
      message: `💳 Кредит взят: $${amount.toLocaleString()}`,
      severity: 'success'
    });
    
    console.log(`💳 [OriginalGameBoard] Взят кредит: $${amount.toLocaleString()}`);
  };

  // Функция для взятия кредита из модального окна сделки
  const handleTakeCreditFromDeal = (amount) => {
    const maxCredit = getMaxCredit();
    
    if (amount > maxCredit) {
      setToast({
        open: true,
        message: `❌ Максимальный кредит: $${maxCredit.toLocaleString()}`,
        severity: 'error'
      });
      return;
    }
    
    if (amount % 1000 !== 0) {
      setToast({
        open: true,
        message: `❌ Кредит должен быть кратен $1,000`,
        severity: 'error'
      });
      return;
    }
    
    setPlayerCredit(prev => prev + amount);
    setPlayerMoney(prev => prev + amount);
    
    // Закрываем модальное окно кредитов и возвращаемся к сделке
    setShowCreditModal(false);
    
    setToast({
      open: true,
      message: `💳 Кредит взят: $${amount.toLocaleString()}. Теперь вы можете купить актив!`,
      severity: 'success'
    });
    
    console.log(`💳 [OriginalGameBoard] Взят кредит из сделки: $${amount.toLocaleString()}`);
  };

  // Функция для погашения кредита
  const handlePayOffCredit = (amount) => {
    // Валидация суммы
    if (!amount || amount <= 0) {
      setToast({
        open: true,
        message: '❌ Введите корректную сумму погашения',
        severity: 'error'
      });
      return;
    }
    
    if (amount > playerCredit) {
      setToast({
        open: true,
        message: `❌ У вас кредит только $${playerCredit.toLocaleString()}`,
        severity: 'error'
      });
      return;
    }
    
    if (amount > playerMoney) {
      setToast({
        open: true,
        message: `❌ Недостаточно денег для погашения`,
        severity: 'error'
      });
      return;
    }
    
    if (amount % 1000 !== 0) {
      setToast({
        open: true,
        message: `❌ Сумма погашения должна быть кратна $1,000`,
        severity: 'error'
      });
      return;
    }
    
    // Погашаем кредит
    setPlayerCredit(prev => prev - amount);
    setPlayerMoney(prev => prev - amount);
    
    // Очищаем поле ввода погашения
    setCustomPayoffAmount('');
    
    setToast({
      open: true,
      message: `✅ Кредит погашен: $${amount.toLocaleString()}. Денежный поток увеличен на $${Math.floor(amount / 1000) * 100}/мес`,
      severity: 'success'
    });
    
    console.log(`✅ [OriginalGameBoard] Погашен кредит: $${amount.toLocaleString()}`);
  };

  // Функция для быстрого погашения части кредита
  const handleQuickPayoff = (amount) => {
    handlePayOffCredit(amount);
  };

  // Функция для продажи активов
  const handleSellAsset = (asset, isCurrentPlayerTurn = false) => {
    // Благотворительные карточки и карточки с расходами нельзя продать
    if (asset.income === 0 || asset.isExpense) {
      const reason = asset.isExpense ? 'карточка с расходами' : 'благотворительность';
      setToast({
        open: true,
        message: `❌ ${asset.name} нельзя продать - это ${reason}`,
        severity: 'error'
      });
      return;
    }
    
    // Проверяем ограничения продажи
    if (!asset.isDividendStock && !isCurrentPlayerTurn) {
      setToast({
        open: true,
        message: `❌ ${asset.name} можно продать только в свой ход`,
        severity: 'error'
      });
      return;
    }
    
    // Продаем одну единицу актива
    if (asset.quantity > 1) {
      // Если у игрока больше одной единицы, уменьшаем количество
      const currentAssets = getCurrentPlayerAssets();
      const updatedAssets = currentAssets.map(a => 
        a.id === asset.id 
          ? { ...a, quantity: a.quantity - 1 }
          : a
      );
      updateCurrentPlayerAssets(updatedAssets);
    } else {
      // Если это последняя единица, удаляем актив
      const currentAssets = getCurrentPlayerAssets();
      updateCurrentPlayerAssets(currentAssets.filter(a => a.id !== asset.id));
    }
    
    // Добавляем деньги игроку (продаем по текущей цене)
    setPlayerMoney(prev => prev + asset.cost);
    
    const stockType = asset.isDividendStock ? 'дивидендные акции' : 'обычные акции';
    
    setToast({
      open: true,
      message: `💰 Продано: ${asset.name} (${stockType}) за $${asset.cost.toLocaleString()}`,
      severity: 'success'
    });
    
    console.log(`💰 [OriginalGameBoard] Продан актив: ${asset.name} за $${asset.cost.toLocaleString()}`);
  };







  // Функция для расчета оптимальной стратегии погашения












  // Функция для взятия кредита произвольной суммы
  const handleCustomCredit = () => {
    const amount = parseInt(customCreditAmount);
    
    if (isNaN(amount) || amount <= 0) {
      setToast({
        open: true,
        message: '❌ Введите корректную сумму',
        severity: 'error'
      });
      return;
    }
    
    if (amount % 1000 !== 0) {
      setToast({
        open: true,
        message: `❌ Кредит должен быть кратен $1,000`,
        severity: 'error'
      });
      return;
    }
    
    const maxCredit = getMaxCredit();
    if (amount > maxCredit) {
      setToast({
        open: true,
        message: `❌ Максимальный кредит: $${maxCredit.toLocaleString()}`,
        severity: 'error'
      });
      return;
    }
    
    if ((playerCredit + amount) > maxCredit) {
      setToast({
        open: true,
        message: `❌ Общий кредит превысит лимит`,
        severity: 'error'
      });
      return;
    }
    
    setPlayerCredit(prev => prev + amount);
    setPlayerMoney(prev => prev + amount);
    setCustomCreditAmount(''); // Очищаем поле ввода
    
    setToast({
      open: true,
      message: `💳 Кредит взят: $${amount.toLocaleString()}`,
      severity: 'success'
    });
    
    console.log(`💳 [OriginalGameBoard] Взят кредит произвольной суммы: $${amount.toLocaleString()}`);
  };

  // Функция для взятия кредита произвольной суммы из модального окна сделки
  const handleCustomCreditFromDeal = () => {
    const amount = parseInt(customCreditAmount);
    
    if (isNaN(amount) || amount <= 0) {
      setToast({
        open: true,
        message: '❌ Введите корректную сумму',
        severity: 'error'
      });
      return;
    }
    
    if (amount % 1000 !== 0) {
      setToast({
        open: true,
        message: `❌ Кредит должен быть кратен $1,000`,
        severity: 'error'
      });
      return;
    }
    
    const maxCredit = getMaxCredit();
    if (amount > maxCredit) {
      setToast({
        open: true,
        message: `❌ Максимальный кредит: $${maxCredit.toLocaleString()}`,
        severity: 'error'
      });
      return;
    }
    
    if ((playerCredit + amount) > maxCredit) {
      setToast({
        open: true,
        message: `❌ Общий кредит превысит лимит`,
        severity: 'error'
      });
      return;
    }
    
    setPlayerCredit(prev => prev + amount);
    setPlayerMoney(prev => prev + amount);
    setCustomCreditAmount(''); // Очищаем поле ввода
    
    // Закрываем модальное окно кредитов и возвращаемся к сделке
    setShowCreditModal(false);
    setCreditModalFromDeal(false);
    
    setToast({
      open: true,
      message: `💳 Кредит взят: $${amount.toLocaleString()}. Теперь вы можете купить актив!`,
      severity: 'success'
    });
    
    console.log(`💳 [OriginalGameBoard] Взят кредит произвольной суммы из сделки: $${amount.toLocaleString()}`);
  };

  // Функции для кнопок управления игрой
  const handlePlayerTurn = (playerIndex) => {
    if (playerIndex === currentPlayer) {
      const player = getPlayerByIndex(playerIndex);
      console.log(`🎯 [OriginalGameBoard] Ход игрока ${player?.username || 'Игрок'} уже активен`);
      return;
    }
    
    const player = getPlayerByIndex(playerIndex);
    console.log(`🎯 [OriginalGameBoard] Переключение на игрока ${player?.username || 'Игрок'}`);
    
    // Синхронизируем с сервером
    if (socket.connected && roomIdRef.current) {
      socket.emit('changePlayerTurn', roomIdRef.current, playerIndex);
    }
    
    // Обновляем локально для отзывчивости
    setCurrentPlayer(playerIndex);
    setTurnTimeLeft(120);
    setTimerProgress(0);
    setIsTurnEnding(false);
    setCanRollDice(true);
    setDiceRolled(false);
    
    // Показываем уведомление
    setToast({
      open: true,
      message: `🎯 Ход передан игроку ${player?.username || 'Игрок'}`,
      severity: 'info'
    });
  };



  // Функция для перехода хода
  const passTurn = () => {
    // Проверяем, есть ли дополнительный ход
    if (hasExtraTurn) {
      setHasExtraTurn(false);
      const player = getCurrentPlayer();
      setToast({
        open: true,
        message: `🎯 Дополнительный ход! ${player?.username || 'Игрок'} ходит еще раз!`,
        severity: 'success'
      });
      
      // Сбрасываем таймер для того же игрока
      setTurnTimeLeft(120);
      setTimerProgress(100);
      setIsTurnEnding(false);
      setCanRollDice(true);
      setDiceRolled(false);
      
      console.log(`🎯 [OriginalGameBoard] Дополнительный ход для игрока ${player?.username || 'Игрок'}`);
      return;
    }
    
    const nextPlayer = (currentPlayer + 1) % gamePlayers.length;
    
    // Синхронизируем с сервером
    if (socket.connected && roomIdRef.current) {
      socket.emit('changePlayerTurn', roomIdRef.current, nextPlayer);
    }
    
    // Обновляем локально для отзывчивости
    setCurrentPlayer(nextPlayer);
    setTurnTimeLeft(120);
    setTimerProgress(0);
    setIsTurnEnding(false);
    setCanRollDice(true);
    setDiceRolled(false);
    
    // Показываем уведомление
    const nextPlayerData = getPlayerByIndex(nextPlayer);
    setToast({
      open: true,
      message: `⏭️ Ход передан игроку ${nextPlayerData?.username || 'Игрок'}`,
      severity: 'info'
    });
    
    console.log(`⏭️ [OriginalGameBoard] Ход передан игроку ${nextPlayerData?.username || 'Игрок'}`);
  };

  // Функции для банковских операций
  const handleTransfer = () => {
    if (!transferAmount || !selectedRecipient) {
      setToast({
        open: true,
        message: '❌ Заполните сумму и выберите получателя',
        severity: 'error'
      });
      return;
    }

    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      setToast({
        open: true,
        message: '❌ Введите корректную сумму',
        severity: 'error'
      });
      return;
    }

    if (amount > bankBalance) {
      setToast({
        open: true,
        message: '❌ Недостаточно средств на счете',
        severity: 'error'
      });
      return;
    }

    // Выполняем перевод
    const currentPlayerData = getCurrentPlayer();
    const currentPlayerName = currentPlayerData?.username || 'Неизвестно';
    const newTransfer = {
      id: Date.now(),
      from: currentPlayerName,
      to: selectedRecipient,
      amount: amount,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    };

    // Обновляем историю переводов
    setTransferHistory(prev => [newTransfer, ...prev]);
    
    // Списываем средства
    setBankBalance(prev => prev - amount);
    
    // Сбрасываем форму
    setTransferAmount('');
    setSelectedRecipient('');

    // Показываем уведомление об успехе
    setToast({
      open: true,
      message: `✅ Перевод $${amount} игроку ${selectedRecipient} выполнен успешно`,
      severity: 'success'
    });

    console.log(`🏦 [OriginalGameBoard] Перевод выполнен: ${currentPlayerName} → ${selectedRecipient} $${amount}`);
  };

  const resetTransferForm = () => {
    setTransferAmount('');
    setSelectedRecipient('');
  };

  // Функции для работы с активами
  const getTotalAssetsValue = () => {
    const assets = getCurrentPlayerAssets();
    return assets.reduce((total, asset) => total + (asset.value * (asset.quantity || 1)), 0);
  };

  const getTotalAssetsIncome = () => {
    const assets = getCurrentPlayerAssets();
    return assets.reduce((total, asset) => total + (asset.income * (asset.quantity || 1)), 0);
  };

  // Таймер хода - 2 минуты на весь ход
  useEffect(() => {
    let interval;
    
    if (turnTimeLeft > 0) {
      interval = setInterval(() => {
        setTurnTimeLeft(prev => {
          const newTime = prev - 1;
          
          // Обновляем прогресс таймера
          const progress = Math.round((newTime / 120) * 100);
          setTimerProgress(progress);
          
          // Проверяем критические моменты
          if (newTime <= 20) {
            setIsTurnEnding(true);
            // Воспроизводим звуковой сигнал
            if (newTime <= 20 && newTime > 19) {
              // Здесь можно добавить звуковой сигнал
              console.log('🔴 ВНИМАНИЕ! Осталось 20 секунд!');
            }
          } else if (newTime <= 60) {
            setIsTurnEnding(false);
          }
          
          // Синхронизируем таймер с сервером каждые 5 секунд
          if (newTime % 5 === 0 && socket.connected && roomIdRef.current) {
            socket.emit('syncTurnTimer', roomIdRef.current, newTime, newTime <= 10);
          }
          
          // Если время истекло
          if (newTime <= 0) {
            console.log('⏰ Время хода истекло!');
            // Автоматически переходим к следующему игроку
            setTimeout(() => {
              const nextPlayer = (currentPlayer + 1) % gamePlayers.length;
              
              // Синхронизируем с сервером
              if (socket.connected && roomIdRef.current) {
                socket.emit('changePlayerTurn', roomIdRef.current, nextPlayer);
              }
              
              setCurrentPlayer(nextPlayer);
              setTurnTimeLeft(120);
              setTimerProgress(0);
              setIsTurnEnding(false);
              setCanRollDice(true);
              setDiceRolled(false);
              
              // Показываем уведомление
              setToast({
                open: true,
                message: `⏰ Ход передан игроку ${gamePlayers[nextPlayer]?.username || 'Неизвестный игрок'} (время истекло)`,
                severity: 'warning'
              });
            }, 1000);
          }
          
          return newTime;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [turnTimeLeft, currentPlayer, gamePlayers]);

  return (
    <Fragment>
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
      padding: isMobile ? '10px' : '20px',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '15px' : '30px'
    }}>
      {/* Основное игровое поле */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: isMobile ? '100%' : 'auto',
        minHeight: isMobile ? 'auto' : '100vh'
      }}>
        {/* Отладочная информация */}
        <Box sx={{ textAlign: 'center', mb: isMobile ? 1 : 2 }}>
          <Typography variant="body2" sx={{ 
            color: '#ff4444',
            fontWeight: 'bold',
            fontFamily: 'monospace',
            fontSize: isMobile ? '0.7rem' : '0.8rem',
            mb: isMobile ? 0.5 : 1
          }}>
            🐛 DEBUG: OriginalGameBoard.js (3 топ актива + упрощенный логотип + профили + банк)
          </Typography>
        </Box>
        
        {/* Мобильная кнопка меню */}
        {isMobile && (
          <Box sx={{ 
            position: 'fixed', 
            top: '20px', 
            right: '20px', 
            zIndex: 1000 
          }}>
            <IconButton
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              sx={{
                background: 'rgba(139, 92, 246, 0.9)',
                color: 'white',
                '&:hover': {
                  background: 'rgba(139, 92, 246, 1)',
                }
              }}
            >
              {isMobileMenuOpen ? <Close /> : <Menu />}
            </IconButton>
          </Box>
        )}
        
        {/* Заголовок убран - оставлено только центральное лого */}
        
        {/* Информация о текущем игроке и кубик */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 2 : 3,
          mb: isMobile ? 2 : 3,
          p: isMobile ? 1.5 : 2,
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: isMobile ? '10px' : '15px',
          backdropFilter: 'blur(10px)'
        }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? 1 : 2
          }}>
            <Avatar sx={{ 
              bgcolor: getCurrentPlayer()?.color || '#8B5CF6',
              width: isMobile ? 35 : 40,
              height: isMobile ? 35 : 40
            }}>
              {getCurrentPlayer()?.username?.charAt(0) || '?'}
            </Avatar>
            <Box>
              <Typography variant={isMobile ? "body1" : "h6"} sx={{ color: 'white', fontWeight: 'bold' }}>
                {getCurrentPlayer()?.username || 'Игрок'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: isMobile ? '0.8rem' : 'inherit' }}>
                {getCurrentPlayer()?.profession?.name || getCurrentPlayer()?.profession || 'Без профессии'}
              </Typography>
              {isOnBigCircle && (
                <Typography variant="body2" sx={{ color: '#22C55E', fontSize: isMobile ? '0.7rem' : '0.8rem', fontWeight: 'bold' }}>
                  🎯 Большой круг
                </Typography>
              )}
              {hasExtraTurn && (
                <Typography variant="body2" sx={{ color: '#F59E0B', fontSize: isMobile ? '0.7rem' : '0.8rem', fontWeight: 'bold' }}>
                  🎯 Дополнительный ход
                </Typography>
              )}
              {hasFreeCards && (
                <Typography variant="body2" sx={{ color: '#8B5CF6', fontSize: isMobile ? '0.7rem' : '0.8rem', fontWeight: 'bold' }}>
                  🎁 Бесплатные карточки
                </Typography>
              )}
            </Box>
          </Box>
          
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? 1 : 2
          }}>
            <Typography variant={isMobile ? "body1" : "h6"} sx={{ color: 'white' }}>
              Кубик: {diceValue}
            </Typography>
            <Button
              variant="contained"
              onClick={rollDice}
              disabled={isRolling || isMoving}
              sx={{
                background: isRolling || isMoving 
                  ? 'linear-gradient(45deg, #9CA3AF, #6B7280)' 
                  : 'linear-gradient(45deg, #8B5CF6, #06B6D4)',
                color: 'white',
                fontWeight: 'bold',
                px: isMobile ? 2 : 3,
                py: isMobile ? 0.8 : 1,
                borderRadius: isMobile ? '20px' : '25px',
                fontSize: isMobile ? '0.9rem' : 'inherit',
                '&:hover': {
                  background: isRolling || isMoving 
                    ? 'linear-gradient(45deg, #9CA3AF, #6B7280)' 
                    : 'linear-gradient(45deg, #7C3AED, #0891B2)'
                }
              }}
            >
              {isRolling ? 'Бросаю...' : isMoving ? 'Фишка движется...' : 'Бросить кубик'}
            </Button>
          </Box>
        </Box>

        {/* Информация о большом круге */}
        {isOnBigCircle && (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: isMobile ? 2 : 3,
            mb: isMobile ? 2 : 3,
            p: isMobile ? 1.5 : 2,
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2))',
            borderRadius: isMobile ? '10px' : '15px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(34, 197, 94, 0.3)'
          }}>
            <Box>
              <Typography variant={isMobile ? "body1" : "h6"} sx={{ color: '#22C55E', fontWeight: 'bold' }}>
                💰 Баланс: ${bigCircleBalance.toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(34, 197, 94, 0.8)', fontSize: isMobile ? '0.8rem' : 'inherit' }}>
                📈 Пассивный доход: ${bigCirclePassiveIncome.toLocaleString()}/ход
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ color: 'rgba(34, 197, 94, 0.8)', fontSize: isMobile ? '0.7rem' : '0.8rem' }}>
                🏢 Бизнесов: {bigCircleBusinesses.length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(34, 197, 94, 0.8)', fontSize: isMobile ? '0.7rem' : '0.8rem' }}>
                🌟 Мечт: {bigCircleDreams.length}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Информация о времени игры */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: isMobile ? 2 : 3,
          mb: isMobile ? 2 : 3,
          p: isMobile ? 1.5 : 2,
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))',
          borderRadius: isMobile ? '10px' : '15px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(59, 130, 246, 0.3)'
        }}>
          <Box>
            <Typography variant={isMobile ? "body1" : "h6"} sx={{ color: '#3B82F6', fontWeight: 'bold' }}>
              ⏰ Время игры
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(59, 130, 246, 0.8)', fontSize: isMobile ? '0.8rem' : 'inherit' }}>
              {(() => {
                const currentTime = Date.now();
                const timeLeft = Math.max(0, gameEndTime - currentTime);
                const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                return `${hours}:${minutes.toString().padStart(2, '0')}`;
              })()}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: 'rgba(59, 130, 246, 0.8)', fontSize: isMobile ? '0.7rem' : '0.8rem' }}>
              {isGameFinished ? '🏁 Игра завершена' : '🎮 Игра активна'}
            </Typography>
          </Box>
        </Box>

        {/* Игровое поле */}
        <Box sx={{
          position: 'relative',
          width: isMobile ? '100%' : '800px',
          height: isMobile ? 'auto' : '800px',
          maxWidth: isMobile ? '100vw' : '800px',
          maxHeight: isMobile ? '70vh' : '800px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: isMobile ? '15px' : '30px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden'
        }}>
          















          {/* PNG логотип в центре */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '200px',
              height: '200px',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'radial-gradient(circle, rgba(255,215,0,0.1) 0%, rgba(255,165,0,0.05) 50%, transparent 100%)',
              borderRadius: '50%',
              padding: '20px'
            }}
          >
            <Box
              sx={{
                width: '160px',
                height: '160px',
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(255, 215, 0, 0.4), 0 0 0 4px rgba(255, 215, 0, 0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Внутренний круг с градиентом */}
              <Box
                sx={{
                  width: '140px',
                  height: '140px',
                  background: 'radial-gradient(circle, #000000 0%, #1a1a1a 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                {/* Центральный символ доллара */}
                <Typography
                  sx={{
                    fontSize: '48px',
                    fontWeight: 'bold',
                    color: '#FFD700',
                    textShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 165, 0, 0.6)',
                    zIndex: 3,
                    position: 'relative'
                  }}
                >
                  $
                </Typography>
                
                {/* Энергетические линии */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: '50%',
                    background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255, 215, 0, 0.3) 45deg, transparent 90deg, rgba(255, 165, 0, 0.3) 135deg, transparent 180deg, rgba(255, 140, 0, 0.3) 225deg, transparent 270deg, rgba(255, 215, 0, 0.3) 315deg, transparent 360deg)',
                    animation: 'rotate 4s linear infinite'
                  }}
                />
                
                {/* Дополнительные светящиеся точки */}
                <Box
                  sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%'
                  }}
                >
                  {[0, 60, 120, 180, 240, 300].map((angle, index) => (
                    <Box
                      key={index}
                      sx={{
                        position: 'absolute',
                        width: '6px',
                        height: '6px',
                        background: '#FFD700',
                        borderRadius: '50%',
                        top: '50%',
                        left: '50%',
                        transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-50px)`,
                        boxShadow: '0 0 10px rgba(255, 215, 0, 0.8)',
                        animation: `pulse ${2 + index * 0.3}s ease-in-out infinite`
                      }}
                    />
                  ))}
                </Box>
              </Box>
              
              {/* Внешние монеты */}
              <Box
                sx={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%'
                }}
              >
                {[45, 135, 225, 315].map((angle, index) => (
                  <Box
                    key={index}
                    sx={{
                      position: 'absolute',
                      width: '24px',
                      height: '24px',
                      background: 'radial-gradient(circle, #FFD700 0%, #FFA500 100%)',
                      borderRadius: '50%',
                      top: '50%',
                      left: '50%',
                      transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-70px)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(255, 215, 0, 0.6)',
                      border: '2px solid #FFD700'
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: '#000000'
                      }}
                    >
                      $
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {/* 24 внутренние клетки по кругу */}
          {originalBoard.slice(0, 24).map((cell, i) => {
            const angle = (i * 360) / 24;
            const radius = 172.5; // радиус малого круга
            const x = Math.cos((angle - 90) * Math.PI / 180) * radius;
            const y = Math.sin((angle - 90) * Math.PI / 180) * radius;
            
            return (
              <motion.div
                key={cell.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                    width: '46px',
                    height: '46px',
                    background: `linear-gradient(135deg, ${cell.color} 0%, ${cell.color}DD 100%)`,
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                    zIndex: 1,
                    '&:hover': {
                      transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(1.3)`,
                      boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
                      zIndex: 3
                    }
                  }}
                  title={cell.description}
                >
                  <Typography variant="h6" sx={{ fontSize: '20px' }}>
                    {cell.icon}
                  </Typography>
                  <Typography
                    sx={{
                      position: 'absolute', top: '2px', left: '4px',
                      fontSize: '10px', fontWeight: 'bold', color: 'white',
                      textShadow: '0 1px 2px rgba(0,0,0,0.8)', zIndex: 2
                    }}
                  >
                    {cell.id}
                  </Typography>
                </Box>
              </motion.div>
            );
          })}

          {/* 52 внешние клетки по периметру 700x700 */}
          {(() => {
            const outerCells = originalBoard.slice(24);
            const cells = [];
            const outerSquareSize = 700;
            const cellSize = 40;

            // Верхний ряд (14 клеток)
            for (let i = 0; i < 14; i++) {
              const cell = outerCells[i];
              const spacing = (outerSquareSize - (14 * cellSize)) / 13;
              const x = 50 + (i * (cellSize + spacing));
              cells.push(
                <Box key={`top-${cell.id}`}
                  sx={{ position: 'absolute', top: '50px', left: `${x}px`, width: `${cellSize}px`, height: `${cellSize}px`,
                    background: `linear-gradient(135deg, ${cell.color} 0%, ${cell.color}DD 100%)`,
                    borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: '14px', fontWeight: 'bold', border: '2px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.3)'
                  }}
                  title={`${cell.name} — ${cell.description}`}
                >
                  {cell.icon}
                  <Typography sx={{ position: 'absolute', top: '2px', left: '4px', fontSize: '10px', fontWeight: 'bold', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                    {cell.id}
                  </Typography>
                </Box>
              );
            }

            // Правый столбец (12 клеток)
            for (let i = 0; i < 12; i++) {
              const cell = outerCells[14 + i];
              const y = 50 + (i + 1) * (cellSize + 11);
              cells.push(
                <Box key={`right-${cell.id}`}
                  sx={{ position: 'absolute', top: `${y}px`, right: '50px', width: `${cellSize}px`, height: `${cellSize}px`,
                    background: `linear-gradient(135deg, ${cell.color} 0%, ${cell.color}DD 100%)`,
                    borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: '14px', fontWeight: 'bold', border: '2px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.3)'
                  }}
                  title={`${cell.name} — ${cell.description}`}
                >
                  {cell.icon}
                  <Typography sx={{ position: 'absolute', top: '2px', left: '4px', fontSize: '10px', fontWeight: 'bold', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                    {cell.id}
                  </Typography>
                </Box>
              );
            }

            // Нижний ряд (14 клеток) — справа налево
            for (let i = 0; i < 14; i++) {
              const cell = outerCells[39 - i];
              const spacing = (outerSquareSize - (14 * cellSize)) / 13;
              const x = 50 + (i * (cellSize + spacing));
              cells.push(
                <Box key={`bottom-${cell.id}`}
                  sx={{ position: 'absolute', bottom: '50px', left: `${x}px`, width: `${cellSize}px`, height: `${cellSize}px`,
                    background: `linear-gradient(135deg, ${cell.color} 0%, ${cell.color}DD 100%)`,
                    borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: '14px', fontWeight: 'bold', border: '2px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.3)'
                  }}
                  title={`${cell.name} — ${cell.description}`}
                >
                    {cell.icon}
                  <Typography sx={{ position: 'absolute', top: '2px', left: '4px', fontSize: '10px', fontWeight: 'bold', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                    {cell.id}
                  </Typography>
                </Box>
              );
            }

            // Левый столбец (12 клеток) — снизу вверх
            for (let i = 0; i < 12; i++) {
              const cell = outerCells[51 - i];
              const y = 50 + (i + 1) * (cellSize + 11);
              cells.push(
                <Box key={`left-${cell.id}`}
                  sx={{ position: 'absolute', top: `${y}px`, left: '50px', width: `${cellSize}px`, height: `${cellSize}px`,
                    background: `linear-gradient(135deg, ${cell.color} 0%, ${cell.color}DD 100%)`,
                    borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: '14px', fontWeight: 'bold', border: '2px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.3)'
                  }}
                  title={`${cell.name} — ${cell.description}`}
                >
                  {cell.icon}
                  <Typography sx={{ position: 'absolute', top: '2px', left: '4px', fontSize: '10px', fontWeight: 'bold', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                    {cell.id}
                  </Typography>
                </Box>
              );
            }

            return cells;
          })()}

          {/* Визуальная рамка квадрата */}
          <Box sx={{ position: 'absolute', top: '50px', left: '50px', width: '700px', height: '700px',
            border: '2px dashed rgba(139, 92, 246, 0.6)', borderRadius: 0, pointerEvents: 'none', zIndex: 0 }}
          />

          {/* 4 угловые карточки между малым и большим кругом */}
          {/* Верхний левый угол - Большая сделка */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) translate(-180px, -180px)', // Позиция между кругами
                width: '80px',
                height: '100px',
                background: 'linear-gradient(135deg, #00BCD4 0%, #0097A7 100%)',
                borderRadius: '16px',
                border: '2px solid #EF4444',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 25px rgba(0, 188, 212, 0.4), 0 0 15px rgba(239, 68, 68, 0.3)',
                zIndex: 3,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translate(-50%, -50%) translate(-180px, -180px) scale(1.05)',
                  boxShadow: '0 15px 40px rgba(0, 188, 212, 0.5), 0 0 25px rgba(239, 68, 68, 0.4)'
                }
              }}
            >
              <Typography variant="h4" sx={{ 
                color: 'white', 
                mb: 1,
                fontSize: '20px'
              }}>
                💰
              </Typography>
              <Typography variant="caption" sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: '10px',
                lineHeight: 1.2,
                textShadow: '0 1px 2px rgba(0,0,0,0.5)'
              }}>
                Большая сделка
              </Typography>
              <Typography variant="caption" sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: '8px',
                lineHeight: 1,
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                mt: 0.5
              }}>
                {dealDeck.filter(card => card.type === 'big').length} карт
              </Typography>
            </Box>
          </motion.div>

          {/* Верхний правый угол - Малая сделка */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) translate(180px, -180px)', // Позиция между кругами
                width: '80px',
                height: '100px',
                background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                borderRadius: '16px',
                border: '2px solid #EF4444',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4), 0 0 15px rgba(239, 68, 68, 0.3)',
                zIndex: 3,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translate(-50%, -50%) translate(180px, -180px) scale(1.05)',
                  boxShadow: '0 15px 40px rgba(59, 130, 246, 0.5), 0 0 25px rgba(239, 68, 68, 0.4)'
                }
              }}
            >
              <Typography variant="h4" sx={{ 
                color: 'white', 
                mb: 1,
                fontSize: '20px'
              }}>
                💼
              </Typography>
              <Typography variant="caption" sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: '10px',
                lineHeight: 1.2,
                textShadow: '0 1px 2px rgba(0,0,0,0.5)'
              }}>
                Малая сделка
              </Typography>
              <Typography variant="caption" sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: '8px',
                lineHeight: 1,
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                mt: 0.5
              }}>
                {dealDeck.filter(card => card.type === 'small').length} карт
              </Typography>
            </Box>
          </motion.div>

          {/* Нижний правый угол - Рынок */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) translate(180px, 180px)', // Позиция между кругами
                width: '80px',
                height: '100px',
                background: 'linear-gradient(135deg, #00BCD4 0%, #0097A7 100%)',
                borderRadius: '16px',
                border: '2px solid #EF4444',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 25px rgba(0, 188, 212, 0.4), 0 0 15px rgba(239, 68, 68, 0.3)',
                zIndex: 3,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translate(-50%, -50%) translate(180px, 180px) scale(1.05)',
                  boxShadow: '0 15px 40px rgba(0, 188, 212, 0.5), 0 0 25px rgba(239, 68, 68, 0.4)'
                }
              }}
            >
              <Typography variant="h4" sx={{ 
                color: 'white', 
                mb: 1,
                fontSize: '20px'
              }}>
                🏪
              </Typography>
              <Typography variant="caption" sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: '10px',
                lineHeight: 1.2,
                textShadow: '0 1px 2px rgba(0,0,0,0.5)'
              }}>
                Рынок
              </Typography>
              <Typography variant="caption" sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: '8px',
                lineHeight: 1,
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                mt: 0.5
              }}>
                {marketDeckCount} карт
              </Typography>
              <Typography variant="caption" sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: '7px',
                lineHeight: 1,
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                mt: 0.2
              }}>
                Отбой: {marketDiscardCount}
              </Typography>
            </Box>
          </motion.div>

          {/* Нижний левый угол - Расходы */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.1 }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) translate(-180px, 180px)', // Позиция между кругами
                width: '80px',
                height: '100px',
                background: 'linear-gradient(135deg, #E91E63 0%, #C2185B 100%)',
                borderRadius: '16px',
                border: '2px solid #E91E63',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 25px rgba(233, 30, 99, 0.4), 0 0 15px rgba(233, 30, 99, 0.3)',
                zIndex: 3,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translate(-50%, -50%) translate(-180px, 180px) scale(1.05)',
                  boxShadow: '0 15px 40px rgba(233, 30, 99, 0.5), 0 0 25px rgba(233, 30, 99, 0.4)'
                }
              }}
            >
              <Typography variant="h4" sx={{ 
                color: 'white', 
                mb: 1,
                fontSize: '20px'
              }}>
                <CharityIcon sx={{ fontSize: '20px' }} />
              </Typography>
              <Typography variant="caption" sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: '10px',
                lineHeight: 1.2,
                textShadow: '0 1px 2px rgba(0,0,0,0.5)'
              }}>
                Расходы
              </Typography>
              <Typography variant="caption" sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: '8px',
                lineHeight: 1,
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                mt: 0.5
              }}>
                {expenseDeckCount} карт
              </Typography>
              <Typography variant="caption" sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: '7px',
                lineHeight: 1,
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                mt: 0.2
              }}>
                Отбой: {expenseDiscardCount}
              </Typography>
            </Box>
          </motion.div>

                    {/* Фишки игроков */}
          {(() => {
            // Группируем игроков по позициям
            const playersByPosition = {};
            gamePlayers.forEach(player => {
              if (!playersByPosition[player.position]) {
                playersByPosition[player.position] = [];
              }
              playersByPosition[player.position].push(player);
            });
            
            // Рендерим фишки с учетом перекрытия
            const playerTokens = gamePlayers.map((player, playerIndex) => {
              let cellIndex, angle, radius, x, y;
              const isConnected = player.isConnected !== false; // По умолчанию считаем подключенным
              
              if (isOnBigCircle && player.position >= 25) {
                // Фишки на большом круге (позиции 25-76)
                cellIndex = player.position - 25; // Позиция 25-76, индекс 0-51
                angle = (cellIndex * 360) / 52;
                radius = 300; // Радиус большого круга
                x = Math.cos((angle - 90) * Math.PI / 180) * radius;
                y = Math.sin((angle - 90) * Math.PI / 180) * radius;
              } else {
                // Фишки на малом круге (позиции 1-24)
                cellIndex = player.position - 1; // Позиция 1-24, индекс 0-23
                angle = (cellIndex * 360) / 24;
                radius = 172.5; // Радиус внутреннего круга
                x = Math.cos((angle - 90) * Math.PI / 180) * radius;
                y = Math.sin((angle - 90) * Math.PI / 180) * radius;
              }
              
              // Определяем смещение для фишки, если на клетке несколько игроков
              const playersOnSameCell = playersByPosition[player.position];
              const playerIndexInCell = playersOnSameCell.indexOf(player);
              const totalPlayersOnCell = playersOnSameCell.length;
              
              // Вычисляем смещение от центра клетки
              let offsetX = 0;
              let offsetY = 0;
              
              if (totalPlayersOnCell > 1) {
                // Если на клетке несколько игроков, размещаем их по кругу ближе к центру
                let offsetRadius;
                
                // Адаптивный радиус в зависимости от количества игроков
                if (totalPlayersOnCell === 2) {
                  offsetRadius = 8; // Для 2 игроков - ближе к центру
                } else if (totalPlayersOnCell === 3) {
                  offsetRadius = 10; // Для 3 игроков
                } else {
                  offsetRadius = 12; // Для 4+ игроков
                }
                
                const offsetAngle = (playerIndexInCell * 360) / totalPlayersOnCell;
                offsetX = Math.cos((offsetAngle - 90) * Math.PI / 180) * offsetRadius;
                offsetY = Math.sin((offsetAngle - 90) * Math.PI / 180) * offsetRadius;
              } else {
                // Если игрок один на клетке, размещаем его точно в центре
                offsetX = 0;
                offsetY = 0;
              }
              
              return (
                <motion.div
                  key={player.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: movingPlayerId === player.id ? 1.1 : 1, 
                    opacity: 1,
                    x: x + offsetX,
                    y: y + offsetY
                  }}
                  transition={{ 
                    delay: 1.2 + playerIndex * 0.1, 
                    duration: 0.6,
                    x: { duration: isMoving ? 0.2 : 0.6, ease: "easeInOut" },
                    y: { duration: isMoving ? 0.2 : 0.6, ease: "easeInOut" },
                    scale: { duration: 0.3, ease: "easeInOut" }
                  }}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '28px',
                    height: '28px',
                    zIndex: 4
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      background: isConnected 
                        ? `linear-gradient(135deg, ${player.color} 0%, ${player.color}CC 50%, ${player.color}AA 100%)`
                        : `linear-gradient(135deg, #666 0%, #444 100%)`,
                      borderRadius: '50%',
                      border: movingPlayerId === player.id ? '4px solid #FFD700' : 
                              isConnected ? '3px solid rgba(255,255,255,0.9)' : '3px solid #999',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: 'white',
                      boxShadow: movingPlayerId === player.id 
                        ? '0 0 20px rgba(255, 215, 0, 0.8), 0 4px 15px rgba(0,0,0,0.4)' 
                        : isConnected 
                          ? `0 4px 15px rgba(0,0,0,0.4), 0 0 12px ${player.color}40, 0 0 6px ${player.color}60`
                          : '0 4px 15px rgba(0,0,0,0.4), 0 0 5px rgba(255,255,255,0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      animation: movingPlayerId === player.id ? 'pulse 1s infinite' : 'none',
                      opacity: isConnected ? 1 : 0.6,
                      '@keyframes pulse': {
                        '0%': { 
                          boxShadow: `0 0 20px rgba(255, 215, 0, 0.8), 0 4px 15px rgba(0,0,0,0.4), 0 0 12px ${player.color}40` 
                        },
                        '50%': { 
                          boxShadow: `0 0 30px rgba(255, 215, 0, 1), 0 4px 15px rgba(0,0,0,0.4), 0 0 18px ${player.color}60` 
                        },
                        '100%': { 
                          boxShadow: `0 0 20px rgba(255, 215, 0, 0.8), 0 4px 15px rgba(0,0,0,0.4), 0 0 12px ${player.color}40` 
                        }
                      },
                      '&:hover': {
                        transform: 'scale(1.2)',
                        boxShadow: `0 8px 25px rgba(0,0,0,0.5), 0 0 20px ${player.color}80, 0 0 10px ${player.color}60`
                      }
                    }}
                    title={`${player.username} - ${player.profession?.name || player.profession || 'Без профессии'} (позиция: ${player.position})`}
                  >
                    {player.username?.charAt(0) || '?'}
                  </Box>
                </motion.div>
              );
            });
            
            // Рендерим счетчики игроков на клетках
            const cellCounters = Object.entries(playersByPosition).map(([position, playersOnCell]) => {
              if (playersOnCell.length > 1) {
                const cellIndex = parseInt(position) - 1;
                const angle = (cellIndex * 360) / 24;
                const radius = 172.5;
                const x = Math.cos((angle - 90) * Math.PI / 180) * radius;
                const y = Math.sin((angle - 90) * Math.PI / 180) * radius;
                
                return (
                  <Box
                    key={`counter-${position}`}
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                      width: '20px',
                      height: '20px',
                      background: 'rgba(0, 0, 0, 0.8)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: 'white',
                      border: '2px solid white',
                      zIndex: 5,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
                    }}
                  >
                    {playersOnCell.length}
                  </Box>
                );
              }
              return null;
            });
            
            // Возвращаем и фишки, и счетчики
            return [...playerTokens, ...cellCounters];
          })()}

          {/* 52 внешние клетки внутри периметра 700x700 - исправленное распределение */}
          {/* Визуальная сетка квадрата удалена, оставляем только круг отрисовки */}
                  </Box>
      </Box>

      {/* Правая панель управления - 6 элементов */}
      <motion.div
        initial={isMobile ? { opacity: 0, x: 300 } : { opacity: 1, x: 0 }}
        animate={isMobile ? 
          (isMobileMenuOpen ? { opacity: 1, x: 0 } : { opacity: 0, x: 300 }) : 
          { opacity: 1, x: 0 }
        }
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <Box sx={{
          width: isMobile ? '100%' : '320px',
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '15px' : '20px',
          padding: isMobile ? '15px' : '20px',
          position: isMobile ? 'fixed' : 'static',
          top: isMobile ? '80px' : 'auto',
          right: isMobile ? '10px' : 'auto',
          left: isMobile ? '10px' : 'auto',
          bottom: isMobile ? '10px' : 'auto',
          zIndex: isMobile ? 999 : 'auto',
          background: isMobile ? 'rgba(15, 23, 42, 0.95)' : 'transparent',
          backdropFilter: isMobile ? 'blur(10px)' : 'none',
          borderRadius: isMobile ? '15px' : '0',
          border: isMobile ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
          maxHeight: isMobile ? 'calc(100vh - 100px)' : 'auto',
          overflowY: isMobile ? 'auto' : 'visible'
        }}>
        {/* Заголовок панели */}
        <Typography variant={isMobile ? "h6" : "h5"} sx={{ 
          color: 'white', 
          textAlign: 'center',
          mb: isMobile ? 1 : 2,
          fontWeight: 'bold'
        }}>
          🎮 Управление
        </Typography>



        {/* 2. Имя и профессия игрока */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Box sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: isMobile ? '10px' : '15px',
            padding: isMobile ? '15px' : '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Button
              variant="text"
              fullWidth
              onClick={() => {
                console.log('👤 [OriginalGameBoard] Кнопка профиля игрока нажата');
                openPlayerModal(getCurrentPlayer());
              }}
              sx={{
                p: 0,
                background: 'transparent',
                color: 'transparent',
                textTransform: 'none',
                '&:hover': {
                  background: 'rgba(255,255,255,0.05)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 1 : 2, width: '100%' }}>
                <Avatar sx={{ bgcolor: '#8B5CF6', width: isMobile ? 40 : 50, height: isMobile ? 40 : 50 }}>
                  {playerData?.username?.charAt(0) || 'M'}
                </Avatar>
                <Box sx={{ flex: 1, textAlign: 'left' }}>
                  <Typography variant={isMobile ? "body1" : "h6"} sx={{ color: 'white', fontWeight: 'bold' }}>
                    {playerData?.username || 'MAG'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: isMobile ? '0.8rem' : 'inherit' }}>
                    {(() => {
                      const currentPlayer = gamePlayers.find(p => p.socketId === socket?.id);
                      if (currentPlayer?.profession) {
                        return `💼 ${currentPlayer.profession?.name || currentPlayer.profession || 'Без профессии'}`;
                      }
                      return '💼 Без профессии';
                    })()}
                  </Typography>
                  
                  {/* Информация о детях */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: '0.8rem' }}>
                      👶 {childrenCount}
                    </Typography>
                  </Box>
                  
                  {/* Информация об очередности хода */}
                  {turnOrder.length > 0 && (
                    <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: '0.8rem', mb: 0.5 }}>
                        🎲 Очередность хода:
                      </Typography>
                      {turnOrder.map((player, index) => (
                        <Typography 
                          key={player.username}
                          variant="body2" 
                          sx={{ 
                            color: player.username === playerData?.username ? '#10B981' : '#94A3B8', 
                            fontSize: '0.7rem',
                            fontWeight: player.username === playerData?.username ? 'bold' : 'normal'
                          }}
                        >
                          {index + 1}. {player.username}
                          {player.username === playerData?.username && ' (Вы)'}
                        </Typography>
                      ))}
                    </Box>
                  )}
                  
                  {/* Информация об активах */}
                  {gamePlayers.length > 0 && (() => {
                    const currentPlayer = gamePlayers.find(p => p.socketId === socket?.id);
                    if (currentPlayer && (currentPlayer.assets?.length > 0 || currentPlayer.liabilities?.length > 0)) {
                      return (
                        <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                          <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: '0.8rem', mb: 0.5 }}>
                            🏠 Активы и обязательства:
                          </Typography>
                          {currentPlayer.assets?.map((asset, index) => (
                            <Typography key={asset.id} variant="body2" sx={{ color: '#10B981', fontSize: '0.7rem' }}>
                              🏠 {asset.name}: ${asset.value?.toLocaleString() || 'N/A'}
                            </Typography>
                          ))}
                          {currentPlayer.liabilities?.map((liability, index) => (
                            <Typography key={liability.id} variant="body2" sx={{ color: '#EF4444', fontSize: '0.7rem' }}>
                              💳 {liability.name}: ${liability.amount?.toLocaleString() || 'N/A'}
                            </Typography>
                          ))}
                        </Box>
                      );
                    }
                    return null;
                  })()}
                  
                  {/* Кнопка для быстрого открытия карточки профессии */}
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation(); // Предотвращаем открытие модального окна профиля
                      openProfessionCard('engineer'); // Менеджер = инженер
                    }}
                    sx={{
                      mt: 1,
                      color: '#8B5CF6',
                      borderColor: '#8B5CF6',
                      borderRadius: '6px',
                      textTransform: 'none',
                      fontSize: '0.7rem',
                      fontWeight: '500',
                      py: 0.5,
                      px: 1.5,
                      '&:hover': {
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        borderColor: '#7C3AED'
                      }
                    }}
                  >
                    📋 Карточка
                  </Button>
                </Box>
              </Box>
            </Button>
          </Box>
        </motion.div>



        {/* 3. Банк */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <Box sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: isMobile ? '10px' : '15px',
            padding: isMobile ? '15px' : '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Button
              variant="text"
              fullWidth
              onClick={() => {
                console.log('🏦 [OriginalGameBoard] Кнопка банка нажата');
                openBankModal();
              }}
              sx={{
                p: 0,
                background: 'transparent',
                color: 'transparent',
                textTransform: 'none',
                '&:hover': {
                  background: 'rgba(255,255,255,0.05)'
                }
              }}
            >
              <Box sx={{ textAlign: 'center', width: '100%' }}>
                <Typography variant={isMobile ? "body1" : "h6"} sx={{ color: 'white', mb: isMobile ? 1 : 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <AccountBalance /> Банк
                </Typography>
                <Typography variant={isMobile ? "h5" : "h4"} sx={{ color: '#10B981', fontWeight: 'bold' }}>
                  ${(() => {
                    const currentPlayer = gamePlayers.find(p => p.socketId === socket?.id);
                    return currentPlayer?.balance || bankBalance;
                  })().toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ color: '#94A3B8', mt: 1, fontSize: isMobile ? '0.8rem' : 'inherit' }}>
                  {(() => {
                    const currentPlayer = gamePlayers.find(p => p.socketId === socket?.id);
                    if (currentPlayer?.profession) {
                      return `Доход: $${currentPlayer.profession.salary?.toLocaleString() || '0'} | Расходы: $${currentPlayer.profession.totalExpenses?.toLocaleString() || '0'}`;
                    }
                    return 'Доход: $1,200 | Расходы: $800';
                  })()}
                </Typography>
                
                                  {/* Информация о кредитах */}
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <Typography variant="body2" sx={{ color: '#94A3B8', mb: 1, fontSize: '0.8rem' }}>
                      💳 Кредит: ${playerCredit.toLocaleString()}
                    </Typography>
                    {playerCredit > 0 && (
                      <Typography variant="body2" sx={{ color: '#EF4444', mb: 1, fontSize: '0.7rem' }}>
                        💸 Платежи: ${Math.floor(playerCredit / 1000) * 100}/мес
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ color: '#94A3B8', mb: 1, fontSize: '0.8rem' }}>
                      Макс: ${getMaxCredit().toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#94A3B8', mb: 1, fontSize: '0.8rem' }}>
                      PAYDAY: ${getCashFlow().toLocaleString()}/мес
                    </Typography>
                    
                    {/* Простой статус кредита */}
                    <Box sx={{ 
                      background: 'rgba(255, 255, 255, 0.05)', 
                      borderRadius: '8px', 
                      p: 1, 
                      mb: 2,
                      border: `1px solid ${playerCredit > 0 ? '#EF4444' : '#10B981'}40`
                    }}>
                      <Typography variant="body2" sx={{ color: playerCredit > 0 ? '#EF4444' : '#10B981', fontSize: '0.7rem', textAlign: 'center', fontWeight: 'bold' }}>
                        {playerCredit > 0 ? '💳 Есть кредит' : '✅ Без кредитов'}
                      </Typography>
                    </Box>
                    

                  
                  {/* Кнопки управления кредитом */}
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <Button
                      variant="contained"
                      onClick={() => setShowCreditModal(true)}
                      sx={{
                        flex: 1,
                        background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                        color: 'white',
                        fontWeight: 'bold',
                        py: 1,
                        borderRadius: '8px',
                        fontSize: '0.7rem',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                          transform: 'scale(1.02)'
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      💳 Взять
                    </Button>
                    
                    {playerCredit > 0 && (
                      <Button
                        variant="contained"
                        onClick={() => {
                          setShowCreditModal(true);
                          // Фокус на погашении кредита
                          setTimeout(() => {
                            const payoffField = document.querySelector('input[placeholder="сумма погашения"]');
                            if (payoffField) {
                              payoffField.focus();
                            }
                          }, 100);
                        }}
                        sx={{
                          flex: 1,
                          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                          color: 'white',
                          fontWeight: 'bold',
                          py: 1,
                          borderRadius: '8px',
                          fontSize: '0.7rem',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                            transform: 'scale(1.02)'
                          },
                          transition: 'all 0.2s ease-in-out'
                        }}
                      >
                        💰 Погасить
                      </Button>
                    )}
                  </Box>
                  

                </Box>
              </Box>
            </Button>
          </Box>
        </motion.div>

        {/* 4. Активы */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Box sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: isMobile ? '10px' : '15px',
            padding: isMobile ? '15px' : '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Button
              variant="text"
              fullWidth
              onClick={() => {
                console.log('💼 [OriginalGameBoard] Кнопка активов нажата');
                openAssetsModal();
              }}
              sx={{
                p: 0,
                background: 'transparent',
                color: 'transparent',
                textTransform: 'none',
                '&:hover': {
                  background: 'rgba(255,255,255,0.05)'
                }
              }}
            >
              <Box sx={{ textAlign: 'center', width: '100%' }}>
                <Typography variant={isMobile ? "body1" : "h6"} sx={{ color: 'white', mb: isMobile ? 1 : 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <Inventory /> Активы
                </Typography>
                <Typography variant={isMobile ? "h5" : "h4"} sx={{ color: '#10B981', fontWeight: 'bold', mb: isMobile ? 1 : 2 }}>
                  ${getTotalAssetsValue().toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ color: '#94A3B8', mb: isMobile ? 1 : 2, fontSize: isMobile ? '0.8rem' : 'inherit' }}>
                  Доход: ${getTotalAssetsIncome().toLocaleString()}/мес
                </Typography>
                

                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {/* Показываем только Дом */}
                  {getCurrentPlayerAssets()
                    .filter(asset => asset.type === 'house') // Только дом
                    .map((asset) => (
                      <Chip 
                        key={asset.id}
                        label={`${asset.icon} ${asset.name}: $${asset.value.toLocaleString()}`} 
                        size="small" 
                        sx={{ 
                          background: `${asset.color}20`, 
                          color: asset.color,
                          border: `1px solid ${asset.color}40`,
                          '&:hover': {
                            background: `${asset.color}30`,
                            cursor: 'pointer'
                          }
                        }} 
                      />
                    ))}
                  
                  {/* Показываем количество скрытых активов */}
                  {getCurrentPlayerAssets().length > 1 && (
                    <Chip 
                      label={`+${getCurrentPlayerAssets().length - 1} еще...`}
                      size="small" 
                      sx={{ 
                        background: 'rgba(107, 114, 128, 0.2)', 
                        color: '#6B7280',
                        border: '1px solid rgba(107, 114, 128, 0.4)',
                        fontStyle: 'italic',
                        '&:hover': {
                          background: 'rgba(107, 114, 128, 0.3)',
                          cursor: 'pointer'
                        }
                      }} 
                    />
                  )}
                </Box>
              </Box>
            </Button>
          </Box>
        </motion.div>

        {/* 5. Бросить кубик с анимацией */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <Button
            variant="contained"
            onClick={canRollDice ? rollDice : passTurn}
            disabled={isRolling}
            sx={{
              width: '100%',
              height: '80px',
              background: canRollDice 
                ? 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)'
                : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: 'white',
              borderRadius: '15px',
              fontSize: '18px',
              fontWeight: 'bold',
              boxShadow: canRollDice 
                ? '0 8px 25px rgba(139, 92, 246, 0.3)'
                : '0 8px 25px rgba(16, 185, 129, 0.3)',
              '&:hover': {
                background: canRollDice 
                  ? 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)'
                  : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                boxShadow: canRollDice 
                  ? '0 12px 35px rgba(139, 92, 246, 0.4)'
                  : '0 12px 35px rgba(16, 185, 129, 0.4)'
              },
              '&:disabled': {
                background: canRollDice 
                  ? 'rgba(139, 92, 246, 0.5)'
                  : 'rgba(16, 185, 129, 0.5)'
              }
            }}
          >
            {isRolling ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
              >
                🎲
              </motion.div>
            ) : canRollDice ? (
              <>
                🎲 БРОСИТЬ КУБИК
                <br />
                <Typography variant="h4" sx={{ mt: 1 }}>
                  {diceValue}
                </Typography>
              </>
            ) : (
              <>
                ⏭️ ПЕРЕХОД ХОДА
                <br />
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Кубик уже брошен
                </Typography>
              </>
            )}
          </Button>
        </motion.div>

        {/* 6. Шкала тайминга */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Box sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: isMobile ? '10px' : '15px',
            padding: isMobile ? '15px' : '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Typography variant={isMobile ? "body1" : "h6"} sx={{ color: 'white', mb: isMobile ? 1 : 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Timer /> Время хода
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={timerProgress} 
              sx={{
                height: 12,
                borderRadius: 6,
                background: 'rgba(255, 255, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  background: turnTimeLeft > 60 
                    ? 'linear-gradient(90deg, #10B981 0%, #10B981 100%)' // Зеленый для первой минуты
                    : turnTimeLeft > 20 
                    ? 'linear-gradient(90deg, #F59E0B 0%, #F59E0B 100%)' // Желтый для второй минуты
                    : 'linear-gradient(90deg, #EF4444 0%, #EF4444 100%)', // Красный для последних 20 секунд
                  borderRadius: 6,
                  transition: 'all 0.3s ease',
                  animation: isTurnEnding ? 'pulse 1s infinite' : 'none'
                }
              }}
            />
            <Typography variant="body2" sx={{ 
              color: turnTimeLeft > 60 ? '#10B981' : turnTimeLeft > 20 ? '#F59E0B' : '#EF4444', 
              mt: isMobile ? 0.5 : 1, 
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: isMobile ? '0.7rem' : 'inherit',
              animation: isTurnEnding ? 'shake 0.5s infinite' : 'none'
            }}>
              {Math.floor(turnTimeLeft / 60)}:{(turnTimeLeft % 60).toString().padStart(2, '0')} • {turnTimeLeft > 60 ? '🟢' : turnTimeLeft > 20 ? '🟡' : '🔴'} {turnTimeLeft > 60 ? 'Первая минута' : turnTimeLeft > 20 ? 'Вторая минута' : 'КРИТИЧЕСКОЕ ВРЕМЯ!'}
            </Typography>
          </Box>
        </motion.div>

        {/* Список всех игроков в комнате */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <Box sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: isMobile ? '10px' : '15px',
            padding: isMobile ? '15px' : '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            mb: isMobile ? 1 : 2
          }}>
            <Typography variant={isMobile ? "body1" : "h6"} sx={{ color: 'white', mb: isMobile ? 1 : 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Group /> Игроки в комнате
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {gamePlayers.length > 0 ? (
                gamePlayers.map((player, index) => {
                  const isCurrentPlayer = player.socketId === socket?.id;
                  const isCurrentTurn = currentTurn === player.username;
                  const isConnected = player.isConnected !== false; // По умолчанию считаем подключенным
                  
                  return (
                    <Box
                      key={player.socketId}
                      sx={{
                        p: isMobile ? 0.5 : 1,
                        background: isCurrentTurn ? '#8B5CF6' : isCurrentPlayer ? 'rgba(139, 92, 246, 0.3)' : 'transparent',
                        color: isConnected ? 'white' : 'rgba(255,255,255,0.5)',
                        borderRadius: isMobile ? '6px' : '8px',
                        border: isCurrentTurn ? 'none' : `1px solid ${isConnected ? 'rgba(255,255,255,0.3)' : 'rgba(255,0,0,0.3)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        cursor: 'pointer',
                        opacity: isConnected ? 1 : 0.6,
                        '&:hover': {
                          background: isCurrentTurn ? '#7C3AED' : 'rgba(255,255,255,0.1)'
                        }
                      }}
                    >
                      <Avatar sx={{ 
                        width: isMobile ? 24 : 32, 
                        height: isMobile ? 24 : 32,
                        bgcolor: isConnected ? (player.color || '#8B5CF6') : '#666',
                        fontSize: isMobile ? '0.7rem' : '0.8rem'
                      }}>
                        {player.username?.charAt(0) || '?'}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ 
                          fontWeight: isCurrentTurn ? 'bold' : 'normal',
                          fontSize: isMobile ? '0.8rem' : '0.9rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5
                        }}>
                          {player.username || 'Неизвестный игрок'}
                          {isCurrentPlayer && ' (Вы)'}
                          {isCurrentTurn && ' (Ход)'}
                          {!isConnected && ' 🔴'}
                        </Typography>
                        {player.profession && (
                          <Typography variant="caption" sx={{ 
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: isMobile ? '0.7rem' : '0.8rem'
                          }}>
                            💼 {player.profession?.name || player.profession || 'Без профессии'}
                          </Typography>
                        )}
                      </Box>
                      {player.balance !== undefined && (
                        <Typography variant="caption" sx={{ 
                          color: '#10B981',
                          fontSize: isMobile ? '0.7rem' : '0.8rem',
                          fontWeight: 'bold'
                        }}>
                          ${player.balance?.toLocaleString() || '0'}
                        </Typography>
                      )}
                    </Box>
                  );
                })
              ) : (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="body2" sx={{ 
                    color: 'rgba(255, 255, 255, 0.7)',
                    mb: 1
                  }}>
                    Игроки загружаются...
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '0.75rem',
                    display: 'block',
                    mb: 0.5
                  }}>
                    Подключение к комнате {roomId}
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: 'rgba(255, 255, 255, 0.4)',
                    fontSize: '0.7rem'
                  }}>
                    Socket: {socket?.connected ? '✅' : '❌'} | Игроков: {gamePlayers.length} | Room: {roomId}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </motion.div>

        {/* Кнопка выхода */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Button
            variant="contained"
            startIcon={<ExitToApp />}
            onClick={onExit}
            sx={{
              width: '100%',
              height: isMobile ? '45px' : '50px',
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              color: 'white',
              borderRadius: isMobile ? '10px' : '15px',
              fontSize: isMobile ? '14px' : '16px',
              fontWeight: 'bold',
              boxShadow: '0 8px 25px rgba(239, 68, 68, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                boxShadow: '0 12px 35px rgba(239, 68, 68, 0.4)'
              }
            }}
          >
            🚪 ВЫХОД
          </Button>
        </motion.div>
      </Box>
        </motion.div>

      {/* Модальное окно профиля игрока */}
      <Dialog
        open={showPlayerModal}
        onClose={closeModals}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: 'white', 
          textAlign: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          pb: 2
        }}>
          👤 Профиль игрока
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          {selectedPlayer && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              
              {/* Аватар и основная информация */}
              <Box sx={{
                background: 'rgba(139, 92, 246, 0.1)',
                borderRadius: '15px',
                padding: '20px',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                textAlign: 'center'
              }}>
                <Avatar sx={{ 
                  bgcolor: '#8B5CF6', 
                  width: 80, 
                  height: 80, 
                  fontSize: '2rem',
                  mx: 'auto',
                  mb: 2
                }}>
                  {selectedPlayer.username?.charAt(0) || '?'}
                </Avatar>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                  {selectedPlayer.username}
                </Typography>
                <Typography variant="h6" sx={{ color: '#94A3B8', mb: 2 }}>
                  {selectedPlayer.profession}
                </Typography>
                
                {/* Кнопка для открытия карточки профессии */}
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    // Определяем ID профессии на основе названия
                    let professionId = 'engineer'; // по умолчанию
                    if (selectedPlayer.profession?.includes('Учитель')) professionId = 'teacher';
                    else if (selectedPlayer.profession?.includes('Полицейский')) professionId = 'police';
                    else if (selectedPlayer.profession?.includes('Дворник')) professionId = 'janitor';
                    else if (selectedPlayer.profession?.includes('Инженер')) professionId = 'engineer';
                    else if (selectedPlayer.profession?.includes('Врач')) professionId = 'doctor';
                    
                    openProfessionCard(professionId);
                  }}
                  sx={{
                    color: '#8B5CF6',
                    borderColor: '#8B5CF6',
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    '&:hover': {
                      backgroundColor: 'rgba(139, 92, 246, 0.1)',
                      borderColor: '#7C3AED'
                    }
                  }}
                >
                  📋 Открыть карточку профессии
                </Button>
                
                {/* Статус хода */}
                <Box sx={{
                  background: currentPlayer === gamePlayers.findIndex(p => p.username === selectedPlayer.username) 
                    ? 'rgba(16, 185, 129, 0.2)' 
                    : 'rgba(107, 114, 128, 0.2)',
                  borderRadius: '10px',
                  padding: '8px 16px',
                  display: 'inline-block'
                }}>
                  <Typography variant="body2" sx={{ 
                    color: currentPlayer === gamePlayers.findIndex(p => p.username === selectedPlayer.username) 
                      ? '#10B981' 
                      : '#6B7280',
                    fontWeight: 'bold'
                  }}>
                    {currentPlayer === gamePlayers.findIndex(p => p.username === selectedPlayer.username) 
                      ? '🎯 Активный ход' 
                      : '⏳ Ожидание хода'}
                  </Typography>
                </Box>
              </Box>

              {/* Игровая статистика */}
              <Box sx={{
                background: 'rgba(16, 185, 129, 0.1)',
                borderRadius: '15px',
                padding: '20px',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                <Typography variant="h6" sx={{ color: '#10B981', mb: 2, textAlign: 'center' }}>
                  📊 Игровая статистика
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px'
                  }}>
                    <Typography sx={{ color: 'white' }}>Позиция на поле:</Typography>
                    <Typography sx={{ color: '#10B981', fontWeight: 'bold' }}>
                      Клетка {selectedPlayer.position}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px'
                  }}>
                    <Typography sx={{ color: 'white' }}>Цвет фишки:</Typography>
                    <Box sx={{ 
                      width: 20, 
                      height: 20, 
                      borderRadius: '50%', 
                      background: selectedPlayer.color,
                      border: '2px solid rgba(255, 255, 255, 0.3)'
                    }} />
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px'
                  }}>
                    <Typography sx={{ color: 'white' }}>ID игрока:</Typography>
                    <Typography sx={{ color: '#94A3B8', fontWeight: 'bold' }}>
                      #{selectedPlayer.id}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Дополнительная информация */}
              <Box sx={{
                background: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '15px',
                padding: '20px',
                border: '1px solid rgba(59, 130, 246, 0.3)'
              }}>
                <Typography variant="h6" sx={{ color: '#3B82F6', mb: 2, textAlign: 'center' }}>
                  ℹ️ Дополнительно
                </Typography>
                
                <Typography variant="body2" sx={{ color: '#94A3B8', textAlign: 'center', lineHeight: 1.6 }}>
                  Игрок {selectedPlayer.username} участвует в игре "Energy of Money". 
                  {selectedPlayer.profession && ` Профессия: ${selectedPlayer.profession}.`}
                  {currentPlayer === gamePlayers.findIndex(p => p.username === selectedPlayer.username) 
                    ? ' Сейчас его ход!' 
                    : ' Ожидает своей очереди.'}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          justifyContent: 'center'
        }}>
          <Button
            onClick={closeModals}
            sx={{
              background: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: '10px',
              '&:hover': {
                background: 'linear-gradient(135deg, #4B5563 0%, #374151 100%)'
              }
            }}
          >
            ✋ Закрыть
          </Button>
        </DialogActions>
      </Dialog>

      {/* Модальное окно активов */}
      <Dialog
        open={showAssetsModal}
        onClose={closeModals}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: 'white', 
          textAlign: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          pb: 2
        }}>
          💼 Портфель активов
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* Общая статистика */}
            <Box sx={{
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '15px',
              padding: '20px',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              textAlign: 'center'
            }}>
              <Typography variant="h5" sx={{ color: '#10B981', mb: 2, fontWeight: 'bold' }}>
                💰 Общая стоимость активов
              </Typography>
              <Typography variant="h3" sx={{ color: '#10B981', fontWeight: 'bold', mb: 1 }}>
                ${getTotalAssetsValue().toLocaleString()}
              </Typography>
              <Typography variant="h6" sx={{ color: '#94A3B8' }}>
                📈 Пассивный доход: ${getTotalAssetsIncome().toLocaleString()}/мес
              </Typography>
            </Box>

            {/* Карточки активов */}
            <Box sx={{
              background: 'rgba(139, 92, 246, 0.1)',
              borderRadius: '15px',
              padding: '20px',
              border: '1px solid rgba(139, 92, 246, 0.3)'
            }}>
              <Typography variant="h6" sx={{ color: '#8B5CF6', mb: 3, textAlign: 'center' }}>
                🎯 Детали активов
              </Typography>
              
              <Box sx={{ display: 'grid', gap: 2 }}>
                {getCurrentPlayerAssets().map((asset) => (
                  <Box
                    key={asset.id}
                    sx={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '15px',
                      padding: '20px',
                      border: `1px solid ${asset.color}40`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.08)',
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 25px ${asset.color}30`
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box sx={{
                        fontSize: '2rem',
                        width: 50,
                        height: 50,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: `${asset.color}20`,
                        borderRadius: '12px',
                        border: `2px solid ${asset.color}40`
                      }}>
                        {asset.icon}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                            {asset.name}
                          </Typography>
                          {asset.quantity > 1 && (
                            <Chip 
                              label={`x${asset.quantity}`}
                              size="small"
                              sx={{
                                backgroundColor: asset.color,
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '0.8rem'
                              }}
                            />
                          )}
                        </Box>
                        <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                          {asset.description}
                        </Typography>
                        {asset.isDividendStock && (
                          <Chip 
                            label="💎 Дивидендные"
                            size="small"
                            sx={{
                              backgroundColor: '#10B981',
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '0.7rem',
                              mt: 0.5
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      <Box sx={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        borderRadius: '8px',
                        padding: '12px',
                        textAlign: 'center',
                        border: '1px solid rgba(16, 185, 129, 0.3)'
                      }}>
                        <Typography variant="body2" sx={{ color: '#94A3B8', mb: 1 }}>
                          💰 Стоимость
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#10B981', fontWeight: 'bold' }}>
                          ${asset.value.toLocaleString()}
                        </Typography>
                      </Box>
                      
                      <Box sx={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        borderRadius: '8px',
                        padding: '12px',
                        textAlign: 'center',
                        border: '1px solid rgba(59, 130, 246, 0.3)'
                      }}>
                        <Typography variant="body2" sx={{ color: '#94A3B8', mb: 1 }}>
                          {asset.isExpense ? '🔧 Расходы' : asset.income === 0 ? '💝 Благотворительность' : asset.isDividendStock ? '💎 Дивиденды/мес' : '📈 Доход/мес'}
                        </Typography>
                        <Typography variant="h6" sx={{ color: asset.isExpense ? '#EF4444' : asset.income === 0 ? '#F59E0B' : '#3B82F6', fontWeight: 'bold' }}>
                          {asset.isExpense ? 'Только траты' : asset.income === 0 ? 'Без дохода' : `$${(asset.isDividendStock ? asset.dividendYield : asset.income).toLocaleString()}`}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{
                      background: 'rgba(139, 92, 246, 0.1)',
                      borderRadius: '8px',
                      padding: '12px',
                      mt: 2,
                      textAlign: 'center',
                      border: '1px solid rgba(139, 92, 246, 0.3)'
                    }}>
                      <Typography variant="body2" sx={{ color: '#94A3B8', mb: 1 }}>
                        🎯 Цена покупки
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#8B5CF6', fontWeight: 'bold' }}>
                        ${asset.cost.toLocaleString()}
                      </Typography>
                    </Box>
                    
                    {/* Кнопки действий с активом */}
                    <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Button
                        variant="outlined"
                        onClick={() => handleTransferAsset(asset)}
                        sx={{
                          borderColor: '#EF4444',
                          color: '#EF4444',
                          '&:hover': {
                            borderColor: '#DC2626',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)'
                          }
                        }}
                      >
                        🔄 передать
                      </Button>
                      
                      <Button
                        variant="outlined"
                        onClick={() => handleSellAsset(asset, true)}
                        disabled={asset.income === 0 || asset.isExpense || (!asset.isDividendStock && false)}
                        sx={{
                          borderColor: asset.isExpense ? '#EF4444' : asset.income === 0 ? '#6B7280' : asset.isDividendStock ? '#10B981' : '#F59E0B',
                          color: asset.isExpense ? '#EF4444' : asset.income === 0 ? '#6B7280' : asset.isDividendStock ? '#10B981' : '#F59E0B',
                          '&:hover': {
                            borderColor: asset.isExpense ? '#DC2626' : asset.income === 0 ? '#6B7280' : asset.isDividendStock ? '#059669' : '#D97706',
                            backgroundColor: asset.isExpense ? 'rgba(239, 68, 68, 0.1)' : asset.income === 0 ? 'rgba(107, 114, 128, 0.1)' : asset.isDividendStock ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)'
                          },
                          '&:disabled': {
                            borderColor: '#6B7280',
                            color: '#6B7280'
                          }
                        }}
                        title={asset.isExpense ? 'Карточка с расходами - нельзя продать' : asset.income === 0 ? 'Благотворительность - нельзя продать' : asset.isDividendStock ? 'Можно продать в любое время' : 'Можно продать только в свой ход'}
                      >
                        💰 продать
                      </Button>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          justifyContent: 'center'
        }}>
          <Button
            onClick={closeModals}
            sx={{
              background: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: '10px',
              '&:hover': {
                background: 'linear-gradient(135deg, #4B5563 0%, #374151 100%)'
              }
            }}
          >
            ✋ Закрыть
          </Button>
        </DialogActions>
      </Dialog>

      {/* Модальное окно передачи активов */}
      <Dialog
        open={showAssetTransferModal}
        onClose={() => setShowAssetTransferModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)',
            borderRadius: '20px',
            border: '2px solid #6B7280',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: 'white', 
          textAlign: 'center',
          borderBottom: '1px solid #6B7280',
          pb: 2
        }}>
          🎁 Передать актив
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, textAlign: 'center' }}>
          {selectedAssetForTransfer && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                {selectedAssetForTransfer.icon} {selectedAssetForTransfer.name}
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>
                Выберите игрока, которому хотите передать этот актив:
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {gamePlayers.map((player, index) => (
                  index !== currentPlayer && (
                    <Button
                      key={player.id}
                      onClick={() => handleTransferAssetToPlayer(index)}
                      sx={{
                        background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                        color: 'white',
                        py: 2,
                        borderRadius: '15px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                          transform: 'scale(1.02)'
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      🎯 {player.username}
                    </Button>
                  )
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          borderTop: '1px solid #6B7280',
          justifyContent: 'center'
        }}>
          <Button
            onClick={() => setShowAssetTransferModal(false)}
            sx={{
              background: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(135deg, #4B5563 0%, #374151 100%)'
              }
            }}
          >
            ❌ Отмена
          </Button>
        </DialogActions>
      </Dialog>

      {/* Модальное окно банка */}
      <Dialog
        open={showBankModal}
        onClose={closeModals}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: 'white', 
          textAlign: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          pb: 2
        }}>
          🏦 Банковские операции
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* 1. Текущий баланс */}
            <Box sx={{
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '15px',
              padding: '20px',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              <Typography variant="h6" sx={{ color: '#10B981', mb: 1, textAlign: 'center' }}>
                💰 Текущий баланс
              </Typography>
              <Typography variant="h3" sx={{ color: '#10B981', fontWeight: 'bold', textAlign: 'center' }}>
                ${bankBalance.toLocaleString()}
              </Typography>
            </Box>

            {/* 2. Перевод средств */}
            <Box sx={{
              background: 'rgba(139, 92, 246, 0.1)',
              borderRadius: '15px',
              padding: '20px',
              border: '1px solid rgba(139, 92, 246, 0.3)'
            }}>
              <Typography variant="h6" sx={{ color: '#8B5CF6', mb: 2, textAlign: 'center' }}>
                💸 Перевод средств
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Выбор получателя */}
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Выберите получателя
                  </InputLabel>
                  <Select
                    value={selectedRecipient}
                    onChange={(e) => setSelectedRecipient(e.target.value)}
                    sx={{
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.3)'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.5)'
                      },
                      '& .MuiSvgIcon-root': {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }}
                  >
                    {gamePlayers.map((player, index) => (
                      <MenuItem key={index} value={player.username} disabled={index === currentPlayer}>
                        {player.username} {index === currentPlayer ? '(Вы)' : ''}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Сумма перевода */}
                <TextField
                  fullWidth
                  label="Сумма перевода ($)"
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)'
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.5)'
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }
                  }}
                />

                {/* Кнопки действий */}
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  <Button
                    variant="contained"
                    onClick={handleTransfer}
                    disabled={!transferAmount || !selectedRecipient}
                    sx={{
                      flex: 1,
                      background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)'
                      },
                      '&:disabled': {
                        background: 'rgba(139, 92, 246, 0.5)'
                      }
                    }}
                  >
                    💸 Выполнить перевод
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={resetTransferForm}
                    sx={{
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      color: 'rgba(255, 255, 255, 0.7)',
                      '&:hover': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        background: 'rgba(255, 255, 255, 0.05)'
                      }
                    }}
                  >
                    🔄 Сбросить
                  </Button>
                </Box>
              </Box>
            </Box>

            {/* 3. История переводов */}
            <Box sx={{
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '15px',
              padding: '20px',
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}>
              <Typography variant="h6" sx={{ color: '#3B82F6', mb: 2, textAlign: 'center' }}>
                📋 История переводов
              </Typography>
              
              <List sx={{ maxHeight: '200px', overflow: 'auto' }}>
                {transferHistory.map((transfer, index) => (
                  <React.Fragment key={transfer.id}>
                    <ListItem sx={{ 
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px',
                      mb: 1
                    }}>
                      <ListItemText
                        primary={
                          <Typography sx={{ color: 'white', fontWeight: 'bold' }}>
                            {transfer.from} → {transfer.to}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography sx={{ color: '#10B981', fontWeight: 'bold' }}>
                              ${transfer.amount.toLocaleString()}
                            </Typography>
                            <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>
                              {transfer.date} {transfer.time}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < transferHistory.length - 1 && <Divider sx={{ background: 'rgba(255, 255, 255, 0.1)' }} />}
                  </React.Fragment>
                ))}
              </List>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          justifyContent: 'center'
        }}>
          <Button
            onClick={closeModals}
            sx={{
              background: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: '10px',
              '&:hover': {
                background: 'linear-gradient(135deg, #4B5563 0%, #374151 100%)'
              }
            }}
          >
            ✋ Закрыть
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast уведомления */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setToast({ ...toast, open: false })} 
          severity={toast.severity}
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>

      {/* Модальное окно рождения ребенка */}
      <Dialog
        open={showChildModal}
        onClose={() => setShowChildModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
            borderRadius: '20px',
            border: '2px solid #F59E0B',
            boxShadow: '0 25px 50px rgba(245, 158, 11, 0.3)'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: '#92400E', 
          textAlign: 'center',
          borderBottom: '1px solid #F59E0B',
          pb: 2
        }}>
          👶 Клетка "Ребенок"
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: '#92400E', mb: 2 }}>
            {gamePlayers[currentPlayer]?.name}, вы попали на клетку "Ребенок"!
          </Typography>
          <Typography variant="body1" sx={{ color: '#92400E', mb: 3 }}>
            Бросьте дополнительный кубик, чтобы узнать, родился ли ребенок:
          </Typography>
          <Typography variant="body2" sx={{ color: '#92400E', mb: 3 }}>
            🎲 1-4: Ребенок родился! +$5,000 и увеличение ежемесячных расходов
            <br />
            🎲 5-6: Ребенок не родился
          </Typography>
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          borderTop: '1px solid #F59E0B',
          justifyContent: 'center'
        }}>
          <Button
            onClick={handleChildBirth}
            sx={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
              }
            }}
          >
            🎲 Бросить кубик
          </Button>
        </DialogActions>
      </Dialog>

      {/* Модальное окно благотворительности */}
      <Dialog
        open={showCharityModal}
        onClose={() => setShowCharityModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
            borderRadius: '20px',
            border: '2px solid #F59E0B',
            boxShadow: '0 25px 50px rgba(245, 158, 11, 0.3)'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: '#92400E', 
          textAlign: 'center',
          borderBottom: '1px solid #F59E0B',
          pb: 2
        }}>
          ❤️ Клетка "Благотворительность"
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: '#92400E', mb: 2 }}>
            {gamePlayers[currentPlayer]?.name}, вы попали на клетку "Благотворительность"!
          </Typography>
          <Typography variant="body1" sx={{ color: '#92400E', mb: 3 }}>
            Стоимость благотворительности: <strong>${charityCost.toLocaleString()}</strong>
          </Typography>
          <Typography variant="body2" sx={{ color: '#92400E', mb: 3 }}>
            {isOnBigCircle ? (
              <>
                💝 Пожертвовав деньги, вы получите возможность бросать 1, 2 или 3 кубика на выбор!
                <br />
                🎲 Вы сможете ходить по одному кубику, по сумме двух кубиков или по сумме трех кубиков
                <br />
                <strong>Бонус действует до конца игры!</strong>
              </>
            ) : (
              <>
                💝 Пожертвовав деньги, вы получите возможность бросать 2 кубика и выбирать ход!
                <br />
                🎲 Вы сможете ходить по одному кубику или по сумме двух кубиков
              </>
            )}
          </Typography>
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          borderTop: '1px solid #F59E0B',
          justifyContent: 'center',
          gap: 2
        }}>
          <Button
            onClick={handleCharityAccept}
            disabled={(isOnBigCircle ? bigCircleBalance : playerMoney) < charityCost}
            sx={{
              background: (isOnBigCircle ? bigCircleBalance : playerMoney) >= charityCost 
                ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              '&:hover': {
                background: (isOnBigCircle ? bigCircleBalance : playerMoney) >= charityCost 
                  ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                  : 'linear-gradient(135deg, #4B5563 0%, #374151 100%)'
              }
            }}
          >
            ❤️ Принять (${charityCost.toLocaleString()})
          </Button>
          <Button
            onClick={handleCharityDecline}
            sx={{
              background: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(135deg, #4B5563 0%, #374151 100%)'
              }
            }}
          >
            😔 Отказаться
          </Button>
        </DialogActions>
      </Dialog>

      {/* Модальное окно выбора кубиков благотворительности */}
      <Dialog
        open={showCharityDiceModal}
        onClose={() => setShowCharityDiceModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
            borderRadius: '20px',
            border: '2px solid #3B82F6',
            boxShadow: '0 25px 50px rgba(59, 130, 246, 0.3)'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: 'white', 
          textAlign: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          pb: 2
        }}>
          🎲 Благотворительность - Выбор хода
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
            {isOnBigCircle ? (
              <>Выпало: <strong>{charityDiceValues.dice1}</strong>, <strong>{charityDiceValues.dice2}</strong> и <strong>{charityDiceValues.dice3}</strong></>
            ) : (
              <>Выпало: <strong>{charityDiceValues.dice1}</strong> и <strong>{charityDiceValues.dice2}</strong></>
            )}
          </Typography>
          <Typography variant="body1" sx={{ color: 'white', mb: 3 }}>
            Выберите, на сколько шагов хотите ходить:
          </Typography>
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          justifyContent: 'center',
          gap: 2,
          flexWrap: 'wrap'
        }}>
          <Button
            onClick={() => handleCharityDiceChoice(charityDiceValues.dice1)}
            sx={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
              }
            }}
          >
            🎲 Ходить на {charityDiceValues.dice1}
          </Button>
          <Button
            onClick={() => handleCharityDiceChoice(charityDiceValues.dice2)}
            sx={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
              }
            }}
          >
            🎲 Ходить на {charityDiceValues.dice2}
          </Button>
          {isOnBigCircle && (
            <Button
              onClick={() => handleCharityDiceChoice(charityDiceValues.dice3)}
              sx={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: 'white',
                px: 4,
                py: 1.5,
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: 'bold',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                }
              }}
            >
              🎲 Ходить на {charityDiceValues.dice3}
            </Button>
          )}
          <Button
            onClick={() => handleCharityDiceChoice(charityDiceValues.dice1 + charityDiceValues.dice2)}
            sx={{
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)'
              }
            }}
          >
            🎲 Ходить на {charityDiceValues.dice1 + charityDiceValues.dice2} (сумма 2)
          </Button>
          {isOnBigCircle && (
            <Button
              onClick={() => handleCharityDiceChoice(charityDiceValues.sum)}
              sx={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                color: 'white',
                px: 4,
                py: 1.5,
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: 'bold',
                '&:hover': {
                  background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)'
                }
              }}
            >
              🎲 Ходить на {charityDiceValues.sum} (сумма 3)
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Модальное окно выбора типа сделки */}
      <Dialog
        open={showDealTypeModal}
        onClose={() => setShowDealTypeModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)',
            borderRadius: '20px',
            border: '2px solid #6B7280',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: 'white', 
          textAlign: 'center',
          borderBottom: '1px solid #6B7280',
          pb: 2
        }}>
          🎯 Клетка "Сделка"
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: 'white', mb: 3 }}>
            {gamePlayers[currentPlayer]?.name}, выберите тип сделки:
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              onClick={() => handleDealTypeSelection('small')}
              sx={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: 'white',
                px: 4,
                py: 2,
                borderRadius: '15px',
                fontSize: '16px',
                fontWeight: 'bold',
                minWidth: '150px',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                }
              }}
            >
              🏪 Малая сделка
            </Button>
            
            <Button
              onClick={() => handleDealTypeSelection('big')}
              sx={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                color: 'white',
                px: 4,
                py: 2,
                borderRadius: '15px',
                fontSize: '16px',
                fontWeight: 'bold',
                minWidth: '150px',
                '&:hover': {
                  background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)'
                }
              }}
            >
              🏢 Большая сделка
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Модальное окно сделки */}
      <Dialog
        open={showDealModal}
        onClose={() => handleCancelDeal()}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)',
            borderRadius: '20px',
            border: '2px solid #6B7280',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: 'white', 
          textAlign: 'center',
          borderBottom: '1px solid #6B7280',
          pb: 2
        }}>
          💼 Карточка сделки
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, textAlign: 'center' }}>
          {currentDealCard && (
            <Box>
              <Typography variant="h5" sx={{ color: 'white', mb: 2, fontWeight: 'bold' }}>
                {currentDealCard.name}
              </Typography>
              <Typography variant="body1" sx={{ color: '#94A3B8', mb: 3 }}>
                {currentDealCard.description}
              </Typography>
              
              <Box sx={{ 
                background: 'rgba(255, 255, 255, 0.1)', 
                borderRadius: '15px', 
                p: 3, 
                mb: 3 
              }}>
                <Typography variant="h6" sx={{ color: '#10B981', mb: 1 }}>
                  Стоимость: ${currentDealCard.cost.toLocaleString()}
                </Typography>
                <Typography variant="h6" sx={{ color: '#3B82F6' }}>
                  Доход: ${currentDealCard.income.toLocaleString()}/мес
                </Typography>
              </Box>
              
              <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>
                У вас: ${playerMoney.toLocaleString()}
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          borderTop: '1px solid #6B7280',
          justifyContent: 'center',
          gap: 2,
          flexWrap: 'wrap'
        }}>
          <Button
            onClick={handleCancelDeal}
            sx={{
              background: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
              color: 'white',
              px: 3,
              py: 1.5,
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(135deg, #4B5563 0%, #374151 100%)'
              }
            }}
          >
            ❌ Отмена
          </Button>
          
          <Button
            onClick={handleBuyDeal}
            disabled={!currentDealCard || playerMoney < currentDealCard.cost}
            sx={{
              background: playerMoney >= (currentDealCard?.cost || 0)
                ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
              color: 'white',
              px: 3,
              py: 1.5,
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 'bold',
              '&:hover': {
                background: playerMoney >= (currentDealCard?.cost || 0)
                  ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                  : 'linear-gradient(135deg, #4B5563 0%, #374151 100%)'
              }
            }}
          >
            💰 Купить
          </Button>

          <Button
            onClick={() => {
              setCreditModalFromDeal(true);
              setShowCreditModal(true);
            }}
            sx={{
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              color: 'white',
              px: 3,
              py: 1.5,
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)'
              }
            }}
          >
            💳 Взять кредит
          </Button>

          <Button
            onClick={handlePassCardToPlayer}
            sx={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
              color: 'white',
              px: 3,
              py: 1.5,
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)'
              }
            }}
          >
            🎁 Передать игроку
          </Button>
        </DialogActions>
      </Dialog>

      {/* Модальное окно выбора игрока для передачи карточки */}
      <Dialog
        open={showPlayerSelectionModal}
        onClose={() => setShowPlayerSelectionModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)',
            borderRadius: '20px',
            border: '2px solid #6B7280',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: 'white', 
          textAlign: 'center',
          borderBottom: '1px solid #6B7280',
          pb: 2
        }}>
          🎁 Передать карточку игроку
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: 'white', mb: 3 }}>
            Выберите игрока, которому хотите передать карточку "{currentDealCard?.name}":
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {gamePlayers.map((player, index) => (
              index !== currentPlayer && (
                <Button
                  key={player.id}
                  onClick={() => handlePassCardToSpecificPlayer(index)}
                  sx={{
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                    color: 'white',
                    py: 2,
                    borderRadius: '15px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                      transform: 'scale(1.02)'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  🎯 {player.username}
                </Button>
              )
            ))}
          </Box>
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          borderTop: '1px solid #6B7280',
          justifyContent: 'center'
        }}>
          <Button
            onClick={() => setShowPlayerSelectionModal(false)}
            sx={{
              background: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(135deg, #4B5563 0%, #374151 100%)'
              }
            }}
          >
            ❌ Отмена
          </Button>
        </DialogActions>
      </Dialog>

      {/* Модальное окно кредитов */}
      <Dialog
        open={showCreditModal}
        onClose={closeCreditModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)',
            borderRadius: '20px',
            border: '2px solid #6B7280',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: 'white', 
          textAlign: 'center',
          borderBottom: '1px solid #6B7280',
          pb: 2
        }}>
          💳 Управление кредитами
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            {/* Левая колонка - Информация */}
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                background: 'rgba(255, 255, 255, 0.1)', 
                borderRadius: '15px', 
                p: 3, 
                mb: 3 
              }}>
                <Typography variant="h6" sx={{ color: 'white', mb: 2, textAlign: 'center' }}>
                  📊 Финансовая информация
                </Typography>
                <Typography variant="body1" sx={{ color: '#94A3B8', mb: 1 }}>
                  💰 Деньги: ${playerMoney.toLocaleString()}
                </Typography>
                <Typography variant="body1" sx={{ color: '#94A3B8', mb: 1 }}>
                  💳 Текущий кредит: ${playerCredit.toLocaleString()}
                </Typography>
                <Typography variant="body1" sx={{ color: '#94A3B8', mb: 1 }}>
                  📈 Денежный поток: ${getCashFlow().toLocaleString()}/мес
                </Typography>
                <Typography variant="body1" sx={{ color: '#10B981', fontWeight: 'bold' }}>
                  🎯 Максимальный кредит: ${getMaxCredit().toLocaleString()}
                </Typography>
              </Box>
            </Grid>

            {/* Правая колонка - Действия */}
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                background: 'rgba(255, 255, 255, 0.1)', 
                borderRadius: '15px', 
                p: 3 
              }}>
                <Typography variant="h6" sx={{ color: 'white', mb: 2, textAlign: 'center' }}>
                  🚀 Быстрые действия
                </Typography>
                
                {/* Быстрые суммы для взятия кредита */}
                <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2 }}>
                  Взять кредит:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  {[1000, 2000, 5000, 10000].map((amount) => {
                    const maxCredit = getMaxCredit();
                    const canTake = amount <= maxCredit && (playerCredit + amount) <= maxCredit;
                    return (
                      <Button
                        key={amount}
                        onClick={() => creditModalFromDeal ? handleTakeCreditFromDeal(amount) : handleTakeCredit(amount)}
                        disabled={!canTake}
                        size="small"
                        sx={{
                          background: canTake 
                            ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                            : 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
                          color: 'white',
                          px: 2,
                          py: 1,
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          '&:hover': {
                            background: canTake 
                              ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                              : 'linear-gradient(135deg, #4B5563 0%, #374151 100%)'
                          }
                        }}
                      >
                        ${amount.toLocaleString()}
                      </Button>
                    );
                  })}
                </Box>

                {/* Поле ввода произвольной суммы */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ color: '#94A3B8', mb: 1 }}>
                    Ввести сумму:
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="сумма"
                    type="number"
                    value={customCreditAmount}
                    onChange={(e) => setCustomCreditAmount(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255, 255, 255, 0.7)',
                        },
                        '& .MuiInputBase-input': {
                          '&::placeholder': {
                            color: '#EF4444',
                            opacity: 1,
                          },
                        },
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={() => creditModalFromDeal ? handleCustomCreditFromDeal() : handleCustomCredit()}
                    disabled={!customCreditAmount || customCreditAmount <= 0}
                    fullWidth
                    sx={{
                      mt: 1,
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      color: 'white',
                      py: 1,
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      },
                      '&:disabled': {
                        background: 'rgba(107, 114, 128, 0.5)',
                      },
                    }}
                  >
                    💳 Взять кредит
                  </Button>
                </Box>

                {/* Поле для погашения кредита */}
                {playerCredit > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ color: '#94A3B8', mb: 1 }}>
                      Погасить кредит:
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="сумма погашения"
                      type="number"
                      value={customPayoffAmount}
                      onChange={(e) => setCustomPayoffAmount(e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          color: 'white',
                          '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.5)',
                          },
                          '& .MuiInputLabel-root': {
                            color: 'rgba(255, 255, 255, 0.7)',
                          },
                          '& .MuiInputBase-input': {
                            '&::placeholder': {
                              color: '#10B981',
                              opacity: 1,
                            },
                          },
                        },
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={() => handlePayOffCredit(parseInt(customPayoffAmount) || 0)}
                      disabled={!customPayoffAmount || customPayoffAmount <= 0 || parseInt(customPayoffAmount) > playerCredit || parseInt(customPayoffAmount) > playerMoney}
                      fullWidth
                      sx={{
                        mt: 1,
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        color: 'white',
                        py: 1,
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        },
                        '&:disabled': {
                          background: 'rgba(107, 114, 128, 0.5)',
                        },
                      }}
                    >
                      💰 Погасить кредит
                    </Button>
                  </Box>
                )}

                                {/* Быстрые суммы для погашения кредита */}
                {playerCredit > 0 && (
                  <>
                    <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2 }}>
                      Погасить кредит:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                      {[1000, 2000, 5000, 10000].map((amount) => {
                        const canPay = amount <= playerCredit && amount <= playerMoney;
                        return (
                          <Button
                            key={amount}
                            onClick={() => handleQuickPayoff(amount)}
                            disabled={!canPay}
                            size="small"
                            sx={{
                              background: canPay 
                                ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                                : 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
                              color: 'white',
                              px: 2,
                              py: 1,
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              '&:hover': {
                                background: canPay 
                                  ? 'linear-gradient(135deg, #D97706 0%, #B45309 100%)'
                                  : 'linear-gradient(135deg, #4B5563 0%, #374151 100%)'
                              }
                            }}
                          >
                            ${amount.toLocaleString()}
                          </Button>
                        );
                      })}
                    </Box>
                    

                  </>
                )}

                {/* Простые кнопки погашения кредита */}
                {playerCredit > 0 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Погасить весь кредит */}
                    <Button
                      onClick={() => handlePayOffCredit(playerCredit)}
                      disabled={playerMoney < playerCredit}
                      fullWidth
                      sx={{
                        background: playerMoney >= playerCredit
                          ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
                          : 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
                        color: 'white',
                        py: 1.5,
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        '&:hover': {
                          background: playerMoney >= playerCredit
                            ? 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)'
                            : 'linear-gradient(135deg, #4B5563 0%, #374151 100%)'
                        }
                      }}
                    >
                      💰 Погасить весь кредит (${playerCredit.toLocaleString()})
                    </Button>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          borderTop: '1px solid #6B7280',
          justifyContent: 'center'
        }}>
          <Button
            onClick={closeCreditModal}
            sx={{
              background: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(135deg, #4B5563 0%, #374151 100%)'
              }
            }}
          >
            ❌ Закрыть
          </Button>
        </DialogActions>
      </Dialog>

      {/* Анимация конфети */}
      {showConfetti && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: 9999,
            overflow: 'hidden'
          }}
        >
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * window.innerWidth, 
                y: -20,
                rotate: 0
              }}
              animate={{ 
                y: window.innerHeight + 20,
                rotate: 360,
                x: Math.random() * window.innerWidth
              }}
              transition={{ 
                duration: 3 + Math.random() * 2,
                ease: "easeIn"
              }}
              style={{
                position: 'absolute',
                fontSize: '20px',
                color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'][Math.floor(Math.random() * 6)]
              }}
            >
              {['🎉', '🎊', '🎈', '✨', '💫', '🌟'][Math.floor(Math.random() * 6)]}
            </motion.div>
          ))}
        </Box>
      )}

      {/* Полная карточка профессии */}
      <FullProfessionCard
        open={showProfessionCard}
        onClose={() => setShowProfessionCard(false)}
        professionId={selectedProfessionId}
      />

      {/* Модальное окно карточки рынка */}
      <MarketCardModal
        open={showMarketCardModal}
        onClose={() => setShowMarketCardModal(false)}
        marketCard={currentMarketCard}
        playerAssets={currentPlayerAssets}
        onAccept={handleMarketAccept}
        onDecline={handleMarketDecline}
        currentPlayer={gamePlayers[currentPlayer]}
      />

      {/* Модальное окно карточки расходов */}
      <ExpenseCardModal
        open={showExpenseCardModal}
        onClose={() => setShowExpenseCardModal(false)}
        expenseCard={currentExpenseCard}
        currentPlayer={gamePlayers[currentPlayer]}
        onPay={handleExpensePay}
        onTakeCredit={handleExpenseTakeCredit}
      />



      {/* Модальное окно победы */}
      <Dialog
        open={showVictoryModal}
        onClose={() => setShowVictoryModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
            borderRadius: '20px',
            border: '2px solid #F59E0B',
            boxShadow: '0 25px 50px rgba(245, 158, 11, 0.3)'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: '#92400E', 
          textAlign: 'center',
          borderBottom: '1px solid #F59E0B',
          pb: 2
        }}>
          🏆 ПОБЕДА!
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ color: '#92400E', mb: 2, fontWeight: 'bold' }}>
            🎉 Поздравляем!
          </Typography>
          <Typography variant="h6" sx={{ color: '#92400E', mb: 3 }}>
            {victoryReason}
          </Typography>
          <Typography variant="body1" sx={{ color: '#92400E', mb: 3 }}>
            Вы выполнили условия победы и стали победителем игры!
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{
          p: 3,
          borderTop: '1px solid #F59E0B',
          justifyContent: 'center'
        }}>
          <Button
            onClick={() => {
              setShowVictoryModal(false);
              endGame();
            }}
            sx={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
              }
            }}
          >
            🏁 Завершить игру
          </Button>
        </DialogActions>
      </Dialog>

      {/* Модальное окно рейтинга */}
      <Dialog
        open={showRankingsModal}
        onClose={() => setShowRankingsModal(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
            borderRadius: '20px',
            border: '2px solid #374151'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: '#FFFFFF', 
          textAlign: 'center',
          borderBottom: '1px solid #374151',
          pb: 2
        }}>
          🏆 Итоговый рейтинг игры
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            {playerRankings.map((player, index) => (
              <Grid item xs={12} key={player.id}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2,
                  background: index === 0 
                    ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.2))'
                    : index === 1
                    ? 'linear-gradient(135deg, rgba(156, 163, 175, 0.2), rgba(107, 114, 128, 0.2))'
                    : index === 2
                    ? 'linear-gradient(135deg, rgba(180, 83, 9, 0.2), rgba(146, 64, 14, 0.2))'
                    : 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px',
                  border: index === 0 
                    ? '2px solid #F59E0B'
                    : index === 1
                    ? '2px solid #9CA3AF'
                    : index === 2
                    ? '2px solid #B45309'
                    : '1px solid #374151'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h4" sx={{ 
                      color: index === 0 ? '#F59E0B' : index === 1 ? '#9CA3AF' : index === 2 ? '#B45309' : '#6B7280',
                      fontWeight: 'bold',
                      minWidth: '40px'
                    }}>
                      #{player.rank}
                    </Typography>
                    <Avatar sx={{ 
                      bgcolor: player.color,
                      width: 40,
                      height: 40
                    }}>
                      {player.username?.charAt(0) || '?'}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                        {player.username}
                        {player.hasWon && <span style={{ color: '#F59E0B', marginLeft: '8px' }}>👑</span>}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                        {player.isOnBigCircle ? '🎯 Большой круг' : '🔄 Малый круг'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h6" sx={{ color: '#10B981', fontWeight: 'bold' }}>
                      +{player.points} очков
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                      Доход: ${player.passiveIncome.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                      Баланс: ${player.balance.toLocaleString()}
                    </Typography>
                    {player.isOnBigCircle && (
                      <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                        Бизнесов: {player.businessCount}, Мечт: {player.dreamCount}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{
          p: 3,
          borderTop: '1px solid #374151',
          justifyContent: 'center'
        }}>
          <Button
            onClick={() => setShowRankingsModal(false)}
            sx={{
              background: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(135deg, #4B5563 0%, #374151 100%)'
              }
            }}
          >
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>

      {/* Модальное окно бесплатных карточек */}
      <Dialog
        open={showFreeCardsModal}
        onClose={() => setShowFreeCardsModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
            borderRadius: '20px',
            border: '2px solid #F59E0B',
            boxShadow: '0 25px 50px rgba(245, 158, 11, 0.3)'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: '#92400E', 
          textAlign: 'center',
          borderBottom: '1px solid #F59E0B',
          pb: 2
        }}>
          🎁 Бесплатные карточки от друга
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: '#92400E', mb: 2 }}>
            Ваш друг настолько благодарен, что дарит вам:
          </Typography>
          <Typography variant="body1" sx={{ color: '#92400E', mb: 3 }}>
            • 1 карточку малой возможности
            <br />
            • 1 карточку большой возможности
          </Typography>
          <Typography variant="body2" sx={{ color: '#92400E', mb: 3 }}>
            Карточки будут выбраны случайным образом и добавлены к вашим активам бесплатно!
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{
          p: 3,
          borderTop: '1px solid #F59E0B',
          justifyContent: 'center',
          gap: 2
        }}>
          <Button
            onClick={handleUseFreeCards}
            sx={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
              }
            }}
          >
            🎁 Получить карточки
          </Button>
          
          <Button
            onClick={() => setShowFreeCardsModal(false)}
            sx={{
              background: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(135deg, #4B5563 0%, #374151 100%)'
              }
            }}
          >
            Отмена
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
    </Fragment>
  );
};

export default OriginalGameBoard;
