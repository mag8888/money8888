import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Container,
  Paper, 
  Grid,
  Alert,
  Snackbar,
  FormControlLabel,
  Switch,
  FormControl,
  Select, 
  MenuItem, 
  Chip,
  Card,
  CardContent,
  Avatar
} from '@mui/material';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import socket from '../socket';
import { PROFESSIONS } from '../data/professions';
import ProfessionDetails from './ProfessionDetails';
import ProfessionCard from './ProfessionCard';
import PlayerAssetsModal from './PlayerAssetsModal';
import { getColorByIndex, getContrastTextColor } from '../styles/playerColors';


const RoomSetup = ({ playerData, onRoomSetup }) => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  
  // Компонент инициализирован
  
  // Все хуки должны быть в начале компонента, до любых условных проверок
  
  // Основные настройки комнаты
  const [roomName, setRoomName] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [roomPassword, setRoomPassword] = useState('');
  const [professionType, setProfessionType] = useState('shared');
  const [sharedProfession, setSharedProfession] = useState(null); // Общая профессия для всех игроков
  
  // Фильтры для профессий
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  
  // Состояние для карточки игрока
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showPlayerCard, setShowPlayerCard] = useState(false);
  
  // Состояние для модального окна активов игрока
  const [showPlayerAssets, setShowPlayerAssets] = useState(false);
  
  // Модальное окно с подробной информацией о профессии
  const [showProfessionDetails, setShowProfessionDetails] = useState(false);
  const [selectedProfessionForDetails, setSelectedProfessionForDetails] = useState(null);
  
  // Выбор профессии и мечты
  const [selectedProfession, setSelectedProfession] = useState(null);
  const [selectedDream, setSelectedDream] = useState(null);

  // Состояние игрока
  const [isReady, setIsReady] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [isHost, setIsHost] = useState(false);
  
  // Данные комнаты
  const [players, setPlayers] = useState([]);
  const [canStart, setCanStart] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  // Банковские операции
  const [bankBalance, setBankBalance] = useState(3000); // Текущий баланс
  const [transferAmount, setTransferAmount] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [transferHistory, setTransferHistory] = useState([]); // История переводов
  const [showBankModal, setShowBankModal] = useState(false); // Показать/скрыть модальное окно банка
  
  // Активы (купленные карточки)
  const [assets, setAssets] = useState([
    { id: 1, name: 'Акции McDonald\'s', type: 'stock', value: 5000, description: 'Дивидендные акции', icon: '📈' },
    { id: 2, name: 'Недвижимость', type: 'real_estate', value: 15000, description: 'Квартира в центре', icon: '🏠' },
    { id: 3, name: 'Бизнес', type: 'business', value: 25000, description: 'Маленький магазин', icon: '🏪' },
    { id: 4, name: 'Облигации', type: 'bonds', value: 8000, description: 'Государственные облигации', icon: '💼' }
  ]); // Купленные активы
  const [showAssetsModal, setShowAssetsModal] = useState(false); // Показать/скрыть модальное окно активов
  
  // Отладочное логирование состояния players
  // Отслеживание изменений состояния игроков (только для отладки)
  useEffect(() => {
    if (players.length > 0) {
      console.log('👥 [RoomSetup] Игроков в комнате:', players.length);
    }
  }, [players.length]);
  
  // Уведомления
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Функции банковских операций
  const handleBankClick = () => {
    setShowBankModal(true);
  };
  
  const handleTransfer = () => {
    if (!transferAmount || !selectedRecipient) {
      setError('Пожалуйста, заполните все поля');
      return;
    }
    
    const amount = parseInt(transferAmount);
    if (amount <= 0 || amount > bankBalance) {
      setError('Недостаточно средств или неверная сумма');
      return;
    }
    
    // Выполняем перевод
    const newBalance = bankBalance - amount;
    setBankBalance(newBalance);
    
    // Добавляем в историю
    const transfer = {
      id: Date.now(),
      from: playerName,
      to: selectedRecipient,
      amount: amount,
      date: new Date().toLocaleString(),
      type: 'outgoing'
    };
    
    setTransferHistory(prev => [transfer, ...prev]);
    
    // Сбрасываем форму
    setTransferAmount('');
    setSelectedRecipient('');
    setSuccess(`Переведено $${amount} игроку ${selectedRecipient}`);
    
    // Скрываем модальное окно через 2 секунды
    setTimeout(() => {
      setShowBankModal(false);
    }, 2000);
  };
  
  const closeBankModal = () => {
    setShowBankModal(false);
    setTransferAmount('');
    setSelectedRecipient('');
    setError('');
    setSuccess('');
  };
  
  // Функции для работы с активами
  const handleAssetsClick = () => {
    setShowAssetsModal(true);
  };
  
  const closeAssetsModal = () => {
    setShowAssetsModal(false);
  };
  
  const getTotalAssetsValue = () => {
    return assets.reduce((total, asset) => total + asset.value, 0);
  };
  
  const getAssetTypeColor = (type) => {
    switch (type) {
      case 'stock': return '#1976d2';
      case 'real_estate': return '#2e7d32';
      case 'business': return '#ed6c02';
      case 'bonds': return '#9c27b0';
      default: return '#666';
    }
  };
  
  const getAssetTypeLabel = (type) => {
    switch (type) {
      case 'stock': return 'Акции';
      case 'real_estate': return 'Недвижимость';
      case 'business': return 'Бизнес';
      case 'bonds': return 'Облигации';
      default: return 'Другое';
    }
  };
  
  // Инициализируем имя игрока из playerData или localStorage
  useEffect(() => {
    if (playerData?.username) {
      setPlayerName(playerData.username);
    } else {
      const savedPlayerName = localStorage.getItem('energy_of_money_player_name');
      if (savedPlayerName) {
        setPlayerName(savedPlayerName);
      } else {
        const randomName = `Игрок ${Math.floor(Math.random() * 9000) + 1000}`;
        setPlayerName(randomName);
      }
    }
  }, [playerData]);

  // Рефы, чтобы не дублировать подключения и обработчики
  const listenersAttachedRef = useRef(false);
  const hasJoinedRef = useRef(false);

  // Подключение к комнате (однократно на roomId)
  useEffect(() => {
    if (!roomId || !playerName || !playerData) return;
    if (hasJoinedRef.current) return;

    hasJoinedRef.current = true;

    socket.emit('joinRoom', roomId, {
      username: playerName,
      roomId: roomId,
      profession: selectedProfession
    });
  }, [roomId, playerName, playerData, selectedProfession]);

  // Обработчики Socket.IO событий (навешиваем один раз)
  useEffect(() => {
    if (listenersAttachedRef.current) return;
    listenersAttachedRef.current = true;

    // На всякий случай снимаем возможные предыдущие обработчики
    socket.off('roomJoined');
    socket.off('joinRoomError');
    socket.off('roomData');
    socket.off('roomCreated');
    socket.off('playersUpdate');
    socket.off('roomNotFound');
    socket.off('error');
    socket.off('gameStarted');
    socket.off('orderDeterminationStarted');
    socket.off('connect');
    socket.off('disconnect');

    // Обработка успешного присоединения к комнате
    socket.on('roomJoined', (data) => {
      if (data.success && roomId) {
        socket.emit('getRoomData', roomId);
      }
    });

    // Обработка ошибки присоединения к комнате
    socket.on('joinRoomError', (data) => {
      console.error('❌ [RoomSetup] Ошибка присоединения к комнате:', data);
      setError(data.error || 'Ошибка присоединения к комнате');
    });

    // Обработка данных комнаты
    socket.on('roomData', (data) => {
      // Получены данные комнаты
      
      if (data.displayName) {
        setRoomName(data.displayName);
      }
      
      setIsPublic(data.isPublic !== false);
      setRoomPassword(data.password || '');
      setProfessionType(data.professionType || 'shared');
      setSharedProfession(data.sharedProfession || null);
      
      // Если в roomData есть информация об игроках, обновляем состояние
      if (data.currentPlayers && Array.isArray(data.currentPlayers)) {
        setPlayers(data.currentPlayers);
        
        const readyPlayers = data.currentPlayers.filter(p => p.ready);
        setCanStart(readyPlayers.length >= 2);
        
        const currentPlayer = data.currentPlayers.find(p => p.socketId === socket.id);
        if (currentPlayer) {
          setIsReady(currentPlayer.ready || false);
        }
      }
      
      // Устанавливаем профессию в зависимости от типа
      if (data.professionType === 'shared' && data.sharedProfession) {
        setSelectedProfession(data.sharedProfession);
        console.log('💼 [RoomSetup] Установлена общая профессия из roomData:', data.sharedProfession);
      } else if (data.hostProfession && data.hostProfession !== 'none') {
        setSelectedProfession(data.hostProfession);
        console.log('💼 [RoomSetup] Установлена профессия хоста из roomData:', data.hostProfession);
      }

      if (data.hostId === socket.id) {
        setIsHost(true);
        console.log('👑 [RoomSetup] Текущий игрок является хостом');
      } else {
        setIsHost(false);
      }

      if (data.status === 'determining_order') {
        setSuccess('Игра запущена! Определение очередности...');
        setTimeout(() => {
          navigate(`/room/${roomId}/original`);
        }, 2000);
      }
    });

    // Обработка создания комнаты
    socket.on('roomCreated', (data) => {
      console.log('🏠 [RoomSetup] Комната создана:', data);
      if (data.displayName) {
        setRoomName(data.displayName);
        console.log('🏠 [RoomSetup] Установлено имя созданной комнаты:', data.displayName);
      }
      
      // Устанавливаем профессию в зависимости от типа
      if (data.professionType === 'shared' && data.sharedProfession) {
        setSelectedProfession(data.sharedProfession);
        console.log('💼 [RoomSetup] Установлена общая профессия:', data.sharedProfession);
      } else if (data.hostProfession && data.hostProfession !== 'none') {
        setSelectedProfession(data.hostProfession);
        console.log('💼 [RoomSetup] Установлена профессия хоста:', data.hostProfession);
      }
    });

    // Обработка списка игроков
    socket.on('playersUpdate', (updatedPlayers) => {

      
      setPlayers(updatedPlayers);
      
      const readyPlayers = updatedPlayers.filter(p => p.ready);

      setCanStart(readyPlayers.length >= 2);
      
      const currentPlayer = updatedPlayers.find(p => p.socketId === socket.id);
      if (currentPlayer) {

        setIsReady(currentPlayer.ready || false);
        
        // Устанавливаем профессию в зависимости от типа
        if (professionType === 'shared' && sharedProfession) {
          setSelectedProfession(sharedProfession);

        } else if (currentPlayer.profession && currentPlayer.profession !== 'none') {
          setSelectedProfession(currentPlayer.profession);

        }
        
        if (currentPlayer.dream && currentPlayer.dream !== 'none') {
          setSelectedDream(currentPlayer.dream);
          console.log('⭐ [RoomSetup] Установлена мечта из данных игрока:', currentPlayer.dream);
        }
      } else {
        console.log('⚠️ [RoomSetup] Текущий игрок не найден в списке игроков');
      }
    });

    // Обработка ошибок
    socket.on('roomNotFound', () => {
      console.log('❌ [RoomSetup] Room not found, redirecting to room selection...');
      setError('Комната не найдена. Перенаправляем к выбору комнат...');
      
      // Очищаем localStorage от несуществующей комнаты
      localStorage.removeItem('energy_of_money_current_room');
      
      // Перенаправляем к выбору комнат через 2 секунды
      setTimeout(() => {
        navigate('/');
      }, 2000);
    });

    socket.on('error', (error) => {
      console.error('❌ [RoomSetup] Socket error:', error);
      setError(`Ошибка: ${error.message || 'Неизвестная ошибка'}`);
      setTimeout(() => setError(''), 5000);
    });

    // Обработка переподключения
    socket.on('connect', () => {
      console.log('✅ [RoomSetup] Socket reconnected, restoring room state...');
      setIsConnected(true);
      setError('');
      // Автоматически восстанавливаем состояние комнаты
      if (roomId) {
        socket.emit('restoreRoomState', roomId);
      }
    });

    socket.on('disconnect', (reason) => {
      console.warn('⚠️ [RoomSetup] Socket disconnected:', reason);
      setIsConnected(false);
      if (reason === 'io server disconnect') {
        // Сервер разорвал соединение, пытаемся переподключиться
        console.log('🔄 [RoomSetup] Server disconnected, attempting to reconnect...');
        setTimeout(() => {
          socket.connect();
        }, 1000); // Задержка 1 секунда перед переподключением
      }
    });

    // Обработка запуска игры
    socket.on('gameStarted', (data) => {
      console.log('🎮 [RoomSetup] Игра запущена:', data);
      
      // Сохраняем данные о очередности хода
      if (data.turnOrder) {
        console.log('🎲 [RoomSetup] Очередность хода:', data.turnOrder);
        localStorage.setItem('potok-deneg_turnOrder', JSON.stringify(data.turnOrder));
      }
      
      // Сохраняем данные о текущем ходе
      if (data.currentTurn) {
        console.log('🎯 [RoomSetup] Текущий ход:', data.currentTurn);
        localStorage.setItem('potok-deneg_currentTurn', data.currentTurn);
      }
      
      // Сохраняем данные игроков
      if (data.players) {
        console.log('👥 [RoomSetup] Данные игроков для игры:', data.players);
        localStorage.setItem('potok-deneg_gamePlayers', JSON.stringify(data.players));
      }
      
      setSuccess('Игра запущена! Переходим к игровому полю...');
      setTimeout(() => {
        navigate(`/room/${roomId}/original`);
      }, 2000);
    });

    // Обработка начала определения очередности
    socket.on('orderDeterminationStarted', (data) => {
      console.log('🎲 [RoomSetup] Началось определение очередности:', data);
      setSuccess('Определение очередности! Переходим к игровому полю...');
      setTimeout(() => {
        navigate(`/room/${roomId}/original`);
      }, 2000);
    });

    console.log('🏠 [RoomSetup] Ожидаем присоединения к комнате для получения данных');

    return () => {
      listenersAttachedRef.current = false;
      hasJoinedRef.current = false;
      socket.off('roomData');
      socket.off('roomCreated');
      socket.off('playersUpdate');
      socket.off('roomNotFound');
      socket.off('error');
      socket.off('gameStarted');
      socket.off('orderDeterminationStarted');
      socket.off('roomJoined');
      socket.off('joinRoomError');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  // Проверяем, что playerData передан (после всех хуков)
  const isPlayerDataMissing = !playerData;

  // Обработчики действий
  const handlePublicToggle = () => {
    const newPublicState = !isPublic;
    setIsPublic(newPublicState);
    
    if (!newPublicState) {
      setRoomPassword('');
    }
    
    socket.emit('updateRoomPublic', roomId, newPublicState);
    setSuccess(`Комната ${newPublicState ? 'открыта' : 'закрыта'}!`);
  };

  const handlePasswordChange = () => {
    if (roomPassword.trim()) {
      socket.emit('updateRoomPassword', roomId, roomPassword.trim());
      setSuccess('Пароль комнаты обновлен!');
    }
  };

  // Обработчик нажатия клавиши Enter для поля пароля
  const handlePasswordKeyPress = (event) => {
    if (event.key === 'Enter') {
      handlePasswordChange();
    }
  };

  // Обработчик нажатия клавиши Enter для поля суммы перевода
  const handleTransferKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleTransfer();
    }
  };

  const handleProfessionSelect = (profession) => {
    // Не позволяем менять профессию при общем типе
    if (professionType === 'shared') {
      setError('Нельзя изменить профессию при выборе "одна профессия на всех"');
      return;
    }
    
    setSelectedProfession(profession);
    socket.emit('updateProfession', roomId, profession);
    setSuccess(`Профессия выбрана: ${profession.name}! 💰 Зарплата: $${profession.salary}`);
    if (profession && typeof profession.balance === 'number') {
      setBankBalance(profession.balance);
    }
  };

  // Обработчик для открытия модального окна с подробной информацией о профессии
  const handleProfessionDetails = (profession) => {
    setSelectedProfessionForDetails(profession);
    setShowProfessionDetails(true);
  };

  // Обработчик для закрытия модального окна
  const handleCloseProfessionDetails = () => {
    setShowProfessionDetails(false);
    setSelectedProfessionForDetails(null);
  };
  
  // Функции для работы с карточкой игрока
  const handlePlayerClick = (player) => {
    setSelectedPlayer(player);
    setShowPlayerCard(true);
  };
  
  const closePlayerCard = () => {
    setShowPlayerCard(false);
    setSelectedPlayer(null);
  };
  
  // Функция для получения профессии игрока
  const getPlayerProfession = (player) => {
    if (player.profession && player.profession !== 'none') {
      // Если профессия уже объект, возвращаем её
      if (typeof player.profession === 'object') {
        return player.profession;
      }
      // Если профессия строка, ищем в массиве
      const profession = PROFESSIONS.find(p => p.name === player.profession);
      return profession;
    }
    return null;
  };
  
  // Функции для работы с активами игрока
  const handlePlayerAssetsClick = (player) => {
    setSelectedPlayer(player);
    setShowPlayerAssets(true);
  };
  
  const closePlayerAssets = () => {
    setShowPlayerAssets(false);
    setSelectedPlayer(null);
  };

  const handleDreamSelect = (dream) => {
    setSelectedDream(dream);
    socket.emit('updateDream', roomId, dream);
    setSuccess(`Мечта выбрана: ${dream.name}!`);
  };

  const handleToggleReady = () => {
    const newReadyState = !isReady;
    setIsReady(newReadyState);
    
    if (newReadyState) {
      socket.emit('playerReady', roomId, socket.id);
      setSuccess('Вы готовы!');
    } else {
      setSuccess('Готовность снята');
    }
  };

  const handleStartGame = () => {
    console.log('🚀 [RoomSetup] Запускаем игру в комнате:', roomId);
    
    // Сразу переходим к игровому полю
    setSuccess('Игра запускается! Переходим к игровому полю...');
    
    // Отправляем событие на сервер
    socket.emit('startGame', roomId);
    
    // Немедленно переходим к игровому полю
    setTimeout(() => {
      navigate(`/room/${roomId}/original`);
    }, 1000); // Задержка 1 секунда для показа сообщения
  };

  // Данные для профессий и мечт
  const professions = PROFESSIONS;

  const dreams = [
    { id: 1, name: 'Путешествие по миру', cost: 50000, description: 'Посетить все континенты' },
    { id: 2, name: 'Собственный дом', cost: 200000, description: 'Купить дом своей мечты' },
    { id: 3, name: 'Бизнес', cost: 100000, description: 'Открыть собственное дело' },
    { id: 4, name: 'Образование', cost: 30000, description: 'Получить высшее образование' },
    { id: 5, name: 'Благотворительность', cost: 75000, description: 'Помогать другим людям' }
  ];

  // Отладочные логи удалены для предотвращения спама
  
  // После присоединения к комнате или выбора профессии — синхронизировать профессию на сервере
  const lastSentProfessionRef = useRef(null);
  useEffect(() => {
    if (!roomId) return;
    if (!selectedProfession) return;
    
    // Проверяем, не отправляли ли мы уже эту профессию
    const professionKey = selectedProfession.id || selectedProfession.name;
    if (lastSentProfessionRef.current === professionKey) {
      return; // Не отправляем повторно
    }
    
    lastSentProfessionRef.current = professionKey;
    socket.emit('updateProfession', roomId, selectedProfession);
  }, [roomId, selectedProfession]);

  // Обновлять баланс банка из выбранной профессии (сбережения)
  useEffect(() => {
    if (selectedProfession && typeof selectedProfession.balance === 'number') {
      setBankBalance(selectedProfession.balance);
    }
  }, [selectedProfession]);
  
  return (
    <Container maxWidth="lg">
      {!isPlayerDataMissing ? null : (
        <Box sx={{ mt: 2, mb: 2 }}>
          <Alert severity="error">
            Ошибка: данные игрока не загружены. Пожалуйста, перезагрузите страницу.
          </Alert>
        </Box>
      )}
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          py: 4,
          '@keyframes pulse': {
            '0%': { opacity: 1 },
            '50%': { opacity: 0.5 },
            '100%': { opacity: 1 }
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={8}
            sx={{
              p: 4,
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
              {/* Отладочная информация - название файла */}
              <Typography variant="body2" sx={{ 
                color: '#ff4444',
                fontWeight: 'bold',
                mb: 1,
                fontFamily: 'monospace',
                fontSize: '0.8rem'
              }}>
                🐛 DEBUG: RoomSetup.js (кнопки заменены)
              </Typography>
              
              <Typography variant="h4" sx={{ color: '#333', fontWeight: 'bold' }}>
                🏠 Настройки комнаты
              </Typography>
              
              {/* Индикатор состояния соединения */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: isConnected ? '#4caf50' : '#ff9800',
                    animation: isConnected ? 'none' : 'pulse 2s infinite'
                  }}
                />
                <Typography variant="body2" sx={{ color: isConnected ? '#4caf50' : '#ff9800' }}>
                  {isConnected ? 'Подключено' : 'Переподключение...'}
                </Typography>
              </Box>
            </Box>
            
            {/* В продакшене скрываем отладочные подсказки и тестовые кнопки */}

            {/* Карточка текущего игрока */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                👤 Текущий игрок
              </Typography>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={() => {
                  console.log('👤 [RoomSetup] Кнопка карточки игрока нажата');
                  handlePlayerClick({
                    username: playerName,
                    profession: selectedProfession || 'none',
                    ready: isReady,
                    socketId: 'current'
                  });
                }}
                sx={{
                  p: 3,
                  background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                  color: 'white',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: 6
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: '#4caf50',
                      fontSize: '32px',
                      fontWeight: 'bold',
                      border: '3px solid #2e7d32'
                    }}
                  >
                    {playerName.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2e7d32', mb: 1 }}>
                      {playerName}
                    </Typography>
                    {selectedProfession ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="h6" sx={{ color: '#ff9800' }}>
                          💼
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                          {selectedProfession.name}
                        </Typography>
                      </Box>
                    ) : null}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip 
                        label={isReady ? '✅ Готов к игре' : '⏳ Не готов'} 
                        size="medium" 
                        sx={{ 
                          bgcolor: isReady ? '#4caf50' : '#ff9800', 
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                      <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                        Нажмите для просмотра карточки
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h3" sx={{ color: '#4caf50' }}>
                      👆
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666', textAlign: 'center' }}>
                      Кликните
                    </Typography>
                  </Box>
                </Box>
              </Button>
            </Box>

            {/* Имя комнаты */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                🏠 Имя комнаты (только для просмотра)
              </Typography>
              <TextField
                fullWidth
                value={roomName}
                disabled={true}
                placeholder="Имя комнаты"
                variant="outlined"
                sx={{ 
                  mb: 1,
                  '& .MuiInputBase-input.Mui-disabled': {
                    WebkitTextFillColor: '#666',
                    color: '#666'
                  }
                }}
              />
              <Typography variant="body2" sx={{ color: '#666', mt: 1, fontSize: '0.9rem', fontStyle: 'italic' }}>
                ⚠️ Имя комнаты нельзя изменить после создания
              </Typography>
            </Box>

            {/* Флажок открытая/закрытая комната */}
            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isPublic}
                    onChange={handlePublicToggle}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="h6" sx={{ color: '#333' }}>
                    {isPublic ? '🌍 Открытая комната' : '🔒 Закрытая комната'}
                  </Typography>
                }
              />
              <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                {isPublic 
                  ? 'Любой может присоединиться к комнате' 
                  : 'Только по приглашению или паролю'
                }
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', mt: 1, fontSize: '0.9rem', fontStyle: 'italic' }}>
                ✅ Этот параметр можно изменять в любое время
              </Typography>
              
              {/* Поле для пароля (показывается только для закрытых комнат) */}
              {!isPublic && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                    🔐 Пароль комнаты
                  </Typography>
                  <TextField
                    fullWidth
                    value={roomPassword}
                    onChange={(e) => setRoomPassword(e.target.value)}
                    onKeyPress={handlePasswordKeyPress}
                    placeholder="Введите пароль для комнаты"
                    variant="outlined"
                    type="password"
                    sx={{ mb: 1 }}
                  />
                  <Button
                    variant="outlined"
                    onClick={handlePasswordChange}
                    fullWidth
                    sx={{ borderRadius: 2 }}
                    disabled={!roomPassword.trim()}
                  >
                    💾 Сохранить пароль
                  </Button>
                  <Typography variant="body2" sx={{ color: '#666', mt: 1, fontSize: '0.8rem' }}>
                    💡 Поделитесь этим паролем с друзьями, чтобы они могли присоединиться
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', mt: 1, fontSize: '0.9rem', fontStyle: 'italic' }}>
                    ✅ Пароль можно изменять в любое время
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Тип профессий */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                👥 Тип профессий (только для просмотра)
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={professionType}
                  disabled={true}
                  variant="outlined"
                  sx={{
                    '& .MuiInputBase-input.Mui-disabled': {
                      WebkitTextFillColor: '#666',
                      color: '#666'
                    }
                  }}
                >
                  <MenuItem value="individual">Индивидуальные профессии</MenuItem>
                  <MenuItem value="shared">Общие профессии</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="body2" sx={{ color: '#666', mt: 1, fontSize: '0.9rem', fontStyle: 'italic' }}>
                ⚠️ Тип профессий нельзя изменить после создания комнаты
              </Typography>
            </Box>

            {/* Выбор профессии */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                💼 Профессия {professionType === 'shared' ? '(общая для всех)' : '(можно изменять)'}
              </Typography>
              
              {professionType === 'shared' && sharedProfession ? (
                // Показываем только общую профессию
                <Box sx={{ 
                  p: 3, 
                  bgcolor: '#e8f5e8', 
                  borderRadius: 2, 
                  border: '2px solid #4caf50',
                  textAlign: 'center'
                }}>
                  <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 'bold', mb: 2 }}>
                    🎯 Общая профессия для всех игроков
                  </Typography>
                  <Grid container justifyContent="center">
                    <Grid item xs={12} sm={6} md={4}>
                      <ProfessionCard
                        profession={sharedProfession}
                        isSelected={true}
                        onClick={() => {}} // Нельзя изменить
                        onDetailsClick={handleProfessionDetails}
                      />
                    </Grid>
                  </Grid>
                  <Typography variant="body2" sx={{ color: '#666', mt: 2, fontStyle: 'italic' }}>
                    ⚠️ При выборе "одна профессия на всех" все игроки используют эту профессию
                  </Typography>
                </Box>
              ) : (
                // Показываем все профессии для выбора
                <>
                  {/* Фильтры */}
                  <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        displayEmpty
                      >
                        <MenuItem value="all">Все категории</MenuItem>
                        <MenuItem value="service">Сервис</MenuItem>
                        <MenuItem value="sales">Продажи</MenuItem>
                        <MenuItem value="transport">Транспорт</MenuItem>
                        <MenuItem value="education">Образование</MenuItem>
                        <MenuItem value="healthcare">Здравоохранение</MenuItem>
                        <MenuItem value="engineering">Инженерия</MenuItem>
                        <MenuItem value="legal">Юриспруденция</MenuItem>
                        <MenuItem value="business">Бизнес</MenuItem>
                        <MenuItem value="technology">Технологии</MenuItem>
                        <MenuItem value="creative">Творчество</MenuItem>
                        <MenuItem value="finance">Финансы</MenuItem>
                        <MenuItem value="aviation">Авиация</MenuItem>
                        <MenuItem value="architecture">Архитектура</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={difficultyFilter}
                        onChange={(e) => setDifficultyFilter(e.target.value)}
                        displayEmpty
                      >
                        <MenuItem value="all">Все уровни</MenuItem>
                        <MenuItem value="easy">Легкий</MenuItem>
                        <MenuItem value="medium">Средний</MenuItem>
                        <MenuItem value="hard">Сложный</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  <Grid container spacing={2}>
                    {professions
                      .filter(profession => 
                        (categoryFilter === 'all' || profession.category === categoryFilter) &&
                        (difficultyFilter === 'all' || profession.difficulty === difficultyFilter)
                      )
                      .map((profession) => (
                        <Grid item xs={12} sm={6} md={4} key={profession.id}>
                          <ProfessionCard
                            profession={profession}
                            isSelected={selectedProfession?.id === profession.id}
                            onClick={() => handleProfessionSelect(profession)}
                          />
                        </Grid>
                      ))}
                  </Grid>
                </>
              )}
            </Box>

            {/* Выбор мечты */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                ⭐ Мечта (можно изменять)
              </Typography>
              <Grid container spacing={2}>
                {dreams.map((dream) => (
                  <Grid item xs={12} sm={6} md={4} key={dream.id}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        border: selectedDream?.id === dream.id ? '2px solid #ff9800' : '1px solid #ddd',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 3
                        }
                      }}
                      onClick={() => handleDreamSelect(dream)}
                    >
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 1, color: '#333' }}>
                          {dream.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                          💰 Стоимость: {dream.cost}₽
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666', fontSize: '0.9rem' }}>
                          {dream.description}
                        </Typography>
                        {selectedDream?.id === dream.id && (
                          <Chip
                            label="Выбрано"
                            color="warning"
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Готовность игрока */}
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                🎯 Готовность к игре
              </Typography>
              <Button
                variant={isReady ? "contained" : "outlined"}
                color={isReady ? "success" : "primary"}
                onClick={handleToggleReady}
                size="large"
                sx={{ borderRadius: 2, px: 4 }}
              >
                {isReady ? '✅ Готов к игре' : '⏳ Не готов'}
              </Button>
            </Box>

            {/* Очередность игроков */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                🎯 Очередность игроков ({players.length})
                {players.length === 0 && (
                  <Typography variant="body2" sx={{ color: '#ff9800', ml: 2, fontSize: '0.9rem' }}>
                    ⚠️ Загрузка списка игроков...
                  </Typography>
                )}
              </Typography>
              <Grid container spacing={2}>
                {players.map((player, index) => {
                  // Получаем уникальный цвет для каждого игрока
                  const playerColor = player.color || getColorByIndex(index);
                  const textColor = getContrastTextColor(playerColor);
                  
                  return (
                    <Grid item xs={12} sm={6} md={4} key={player.socketId}>
                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={() => {
                          console.log('👥 [RoomSetup] Кнопка игрока нажата:', player.username);
                          handlePlayerClick(player);
                        }}
                        sx={{
                          p: 2,
                          background: `linear-gradient(135deg, ${playerColor} 0%, ${playerColor}dd 100%)`,
                          color: textColor,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontSize: '1rem',
                          fontWeight: 'bold',
                          transition: 'all 0.3s ease',
                          border: `2px solid ${playerColor}`,
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 6,
                            background: `linear-gradient(135deg, ${playerColor}dd 0%, ${playerColor}bb 100%)`
                          }
                        }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                          <Typography variant="h6" sx={{ 
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1.2rem'
                          }}>
                            {index + 1}.
                          </Typography>
                          <Avatar sx={{ 
                            bgcolor: playerColor,
                            width: 48,
                            height: 48,
                            fontSize: '18px',
                            fontWeight: 'bold',
                            border: `2px solid ${playerColor}`,
                            color: textColor
                          }}>
                            {player.username.charAt(0).toUpperCase()}
                          </Avatar>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
                              {player.username}
                            </Typography>
                            {index === 0 && (
                              <Chip 
                                label="ХОД" 
                                size="small" 
                                sx={{ 
                                  bgcolor: 'rgba(255, 255, 255, 0.2)', 
                                  color: 'white',
                                  fontWeight: 'bold',
                                  fontSize: '0.7rem',
                                  border: '1px solid rgba(255, 255, 255, 0.3)'
                                }}
                              />
                            )}
                          </Box>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 1 }}>
                            {player.ready ? '✅ Готов к игре' : '⏳ Не готов'}
                          </Typography>
                          {player.profession && player.profession !== 'none' ? (
                            <Chip 
                              label={typeof player.profession === 'object' ? player.profession.name : player.profession} 
                              size="small" 
                              sx={{ 
                                bgcolor: 'rgba(255, 255, 255, 0.2)', 
                                color: 'white',
                                fontWeight: 'bold',
                                border: '1px solid rgba(255, 255, 255, 0.3)'
                              }}
                            />
                          ) : null}
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography variant="h4" sx={{ color: 'rgba(255, 255, 255, 0.8)' }} title="Нажмите для просмотра карточки">
                            👆
                          </Typography>
                          <Box
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePlayerAssetsClick(player);
                              }}
                              sx={{
                                cursor: 'pointer',
                                p: 0.5,
                                border: '1px solid #4caf50',
                                borderRadius: 1,
                                color: '#4caf50',
                                fontSize: '0.7rem',
                                textAlign: 'center',
                                '&:hover': {
                                  bgcolor: 'rgba(76, 175, 80, 0.1)'
                                }
                              }}
                              title="Просмотреть активы"
                            >
                              💼
                            </Box>
                          </Box>
                        </Box>
                      </Button>
                    </Grid>
                  );
                })}
                </Grid>
            </Box>

            {/* Банк скрыт на экране настроек комнаты */}

            {/* Активы скрыты на экране настроек комнаты */}

            {/* Кнопка запуска игры */}
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              {isHost ? (
                <Button
                  variant="contained"
                  color="success"
                  size="large"
                  onClick={handleStartGame}
                  disabled={!canStart}
                  sx={{
                    borderRadius: 2,
                    px: 6,
                    py: 2,
                    fontSize: '1.2rem',
                    background: !canStart ? '#ccc' : 'linear-gradient(45deg, #4caf50 30%, #45a049 90%)',
                    '&:hover': {
                      background: !canStart ? '#ccc' : 'linear-gradient(45deg, #45a049 30%, #4caf50 90%)'
                    }
                  }}
                >
                  🚀 СТАРТ ИГРЫ
                </Button>
              ) : (
                <Box sx={{ p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ color: '#666', textAlign: 'center' }}>
                    👑 Только хост комнаты может запустить игру
                  </Typography>
                </Box>
              )}
              
              {!canStart && (
                <Typography variant="body2" sx={{ color: '#666', mt: 2, textAlign: 'center' }}>
                  ⚠️ Для запуска игры нужно минимум 2 готовых игрока
                </Typography>
              )}
            </Box>

            {/* Уведомления */}
            {error && (
              <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
                <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
                  {error}
                </Alert>
              </Snackbar>
            )}

            {success && (
              <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess('')}>
                <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>
                  {success}
                </Alert>
              </Snackbar>
            )}
          </Paper>
        </motion.div>
      </Box>

      {/* Модальное окно карточки игрока */}
      <ProfessionDetails
        profession={selectedPlayer ? getPlayerProfession(selectedPlayer) : null}
        isOpen={showPlayerCard}
        onClose={closePlayerCard}
      />

      {/* Модальное окно активов игрока */}
      <PlayerAssetsModal
        player={selectedPlayer}
        profession={selectedPlayer ? getPlayerProfession(selectedPlayer) : null}
        isOpen={showPlayerAssets}
        onClose={closePlayerAssets}
      />

      {/* Модальное окно банка */}
      {showBankModal && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={closeBankModal}
        >
          <Paper
            elevation={24}
            sx={{
              p: 4,
              maxWidth: 600,
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto',
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Заголовок */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                🏦 Банковские операции
              </Typography>
              <Button
                onClick={closeBankModal}
                sx={{ minWidth: 'auto', p: 1 }}
              >
                ✕
              </Button>
            </Box>

            {/* Текущий баланс */}
            <Box sx={{ mb: 3, p: 2, bgcolor: '#f0f8ff', borderRadius: 2, border: '1px solid #e3f2fd' }}>
              <Typography variant="h5" sx={{ color: '#2e7d32', fontWeight: 'bold', textAlign: 'center' }}>
                💰 Текущий баланс: ${bankBalance}
              </Typography>
            </Box>

            {/* Форма перевода */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                💸 Перевод средств
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>
                      Получатель
                    </Typography>
                    <Select
                      value={selectedRecipient}
                      onChange={(e) => setSelectedRecipient(e.target.value)}
                      displayEmpty
                      sx={{ minHeight: 56 }}
                    >
                      <MenuItem value="" disabled>
                        Выберите игрока
                      </MenuItem>
                      {players
                        .filter(player => player.username !== playerName)
                        .map((player) => (
                          <MenuItem key={player.socketId} value={player.username}>
                            {player.username}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Сумма перевода"
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    onKeyPress={handleTransferKeyPress}
                    placeholder="Введите сумму"
                    sx={{ minHeight: 56 }}
                  />
                </Grid>
              </Grid>
              <Button
                fullWidth
                variant="contained"
                onClick={handleTransfer}
                disabled={!transferAmount || !selectedRecipient}
                sx={{
                  mt: 2,
                  background: 'linear-gradient(45deg, #2e7d32 30%, #1b5e20 90%)',
                  borderRadius: 2,
                  py: 1.5,
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1b5e20 30%, #2e7d32 90%)'
                  },
                  '&:disabled': {
                    background: '#ccc'
                  }
                }}
              >
                💸 Выполнить перевод
              </Button>
            </Box>

            {/* История переводов */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                📋 История переводов
              </Typography>
              {transferHistory.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center', color: '#666', bgcolor: '#f5f5f5', borderRadius: 2 }}>
                  <Typography variant="body2">
                    История переводов пуста
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                  {transferHistory.map((transfer) => (
                    <Card key={transfer.id} sx={{ mb: 1, p: 2, bgcolor: '#f8f9fa' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {transfer.from} → {transfer.to}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#666' }}>
                            {transfer.date}
                          </Typography>
                        </Box>
                        <Typography variant="h6" sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                          -${transfer.amount}
                        </Typography>
                      </Box>
                    </Card>
                  ))}
                </Box>
              )}
            </Box>

            {/* Уведомления */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}
          </Paper>
        </Box>
      )}

      {/* Модальное окно активов */}
      {showAssetsModal && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={closeAssetsModal}
        >
          <Paper
            elevation={24}
            sx={{
              p: 4,
              maxWidth: 800,
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto',
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Заголовок */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h4" sx={{ color: '#f57c00', fontWeight: 'bold' }}>
                💼 Каталог активов
              </Typography>
              <Button
                onClick={closeAssetsModal}
                sx={{ minWidth: 'auto', p: 1 }}
              >
                ✕
              </Button>
            </Box>

            {/* Общая информация */}
            <Box sx={{ mb: 3, p: 3, bgcolor: '#fff3e0', borderRadius: 2, border: '1px solid #ffcc02' }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#f57c00', fontWeight: 'bold' }}>
                      💰 Общая стоимость
                    </Typography>
                    <Typography variant="h4" sx={{ color: '#e65100', fontWeight: 'bold' }}>
                      ${getTotalAssetsValue()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#f57c00', fontWeight: 'bold' }}>
                      📊 Количество
                    </Typography>
                    <Typography variant="h4" sx={{ color: '#e65100', fontWeight: 'bold' }}>
                      {assets.length}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#f57c00', fontWeight: 'bold' }}>
                      🏦 Чистый капитал
                    </Typography>
                    <Typography variant="h4" sx={{ color: '#e65100', fontWeight: 'bold' }}>
                      ${bankBalance + getTotalAssetsValue()}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Список активов */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                📋 Купленные карточки
              </Typography>
              <Grid container spacing={2}>
                {assets.map((asset) => (
                  <Grid item xs={12} sm={6} md={4} key={asset.id}>
                    <Card 
                      sx={{ 
                        p: 2, 
                        border: `2px solid ${getAssetTypeColor(asset.type)}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 4
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Typography variant="h4">
                          {asset.icon}
                        </Typography>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                            {asset.name}
                          </Typography>
                          <Chip 
                            label={getAssetTypeLabel(asset.type)}
                            size="small"
                            sx={{ 
                              bgcolor: getAssetTypeColor(asset.type),
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          />
                        </Box>
                      </Box>
                      <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                        {asset.description}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                          ${asset.value}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666' }}>
                          ID: {asset.id}
                        </Typography>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Кнопка закрытия */}
            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="outlined"
                onClick={closeAssetsModal}
                sx={{
                  borderColor: '#f57c00',
                  color: '#f57c00',
                  borderRadius: 2,
                  px: 4,
                  '&:hover': {
                    borderColor: '#e65100',
                    color: '#e65100',
                    bgcolor: '#fff3e0'
                  }
                }}
              >
                Закрыть
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Модальное окно банка */}
      {showBankModal && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={(e) => {
            console.log('🏦 [RoomSetup] Клик по фону модального окна');
            closeBankModal();
          }}
        >
          <Paper
            elevation={24}
            sx={{
              p: 4,
              maxWidth: 600,
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto',
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Заголовок */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                🏦 Банковские операции
              </Typography>
              <Button
                onClick={() => {
                  console.log('🏦 [RoomSetup] Нажата кнопка закрытия');
                  closeBankModal();
                }}
                sx={{ minWidth: 'auto', p: 1 }}
              >
                ✕
              </Button>
            </Box>

            {/* Текущий баланс */}
            <Box sx={{ mb: 3, p: 2, bgcolor: '#f0f8ff', borderRadius: 2, border: '1px solid #e3f2fd' }}>
              <Typography variant="h5" sx={{ color: '#2e7d32', fontWeight: 'bold', textAlign: 'center' }}>
                💰 Текущий баланс: ${bankBalance}
              </Typography>
            </Box>

            {/* Форма перевода */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                💸 Перевод средств
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>
                      Получатель
                    </Typography>
                    <Select
                      value={selectedRecipient}
                      onChange={(e) => {
                        console.log('🏦 [RoomSetup] Выбран получатель:', e.target.value);
                        setSelectedRecipient(e.target.value);
                      }}
                      displayEmpty
                      sx={{ minHeight: 56 }}
                    >
                      <MenuItem value="" disabled>
                        Выберите игрока
                      </MenuItem>
                      {players
                        .filter(player => player.username !== playerName)
                        .map((player) => {
                          console.log('🏦 [RoomSetup] Игрок для выбора:', player);
                          return (
                            <MenuItem key={player.socketId || player.id} value={player.username}>
                              {player.username}
                            </MenuItem>
                          );
                        })}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Сумма перевода"
                    type="number"
                    value={transferAmount}
                    onChange={(e) => {
                      console.log('🏦 [RoomSetup] Введена сумма:', e.target.value);
                      setTransferAmount(e.target.value);
                    }}
                    placeholder="Введите сумму"
                    sx={{ minHeight: 56 }}
                  />
                </Grid>
              </Grid>
              <Button
                fullWidth
                variant="contained"
                onClick={() => {
                  console.log('🏦 [RoomSetup] Нажата кнопка "Выполнить перевод"');
                  handleTransfer();
                }}
                disabled={!transferAmount || !selectedRecipient}
                sx={{
                  mt: 2,
                  background: 'linear-gradient(45deg, #2e7d32 30%, #1b5e20 90%)',
                  borderRadius: 2,
                  py: 1.5,
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1b5e20 30%, #2e7d32 90%)'
                  },
                  '&:disabled': {
                    background: '#ccc'
                  }
                }}
              >
                💸 Выполнить перевод
              </Button>
            </Box>

            {/* История переводов */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                📋 История переводов
              </Typography>
              {transferHistory.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center', color: '#666', bgcolor: '#f5f5f5', borderRadius: 2 }}>
                  <Typography variant="body2">
                    История переводов пуста
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                  {transferHistory.map((transfer) => (
                    <Card key={transfer.id} sx={{ mb: 1, p: 2, bgcolor: '#f8f9fa' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {transfer.from} → {transfer.to}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#666' }}>
                            {transfer.date}
                          </Typography>
                        </Box>
                        <Typography variant="h6" sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                          -${transfer.amount}
                        </Typography>
                      </Box>
                    </Card>
                  ))}
                </Box>
              )}
            </Box>

            {/* Уведомления */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}
          </Paper>
        </Box>
      )}

      {/* Модальное окно с подробной информацией о профессии */}
      <ProfessionDetails
        isOpen={showProfessionDetails}
        profession={selectedProfessionForDetails}
        onClose={handleCloseProfessionDetails}
      />
    </Container>
  );
};

export default RoomSetup;

