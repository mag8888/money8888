
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Chip,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Fab,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Group as GroupIcon,
  PlayArrow as PlayIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  Star as StarIcon
} from '@mui/icons-material';
import socket from '../socket';

const RoomSelection = ({ playerData, onRoomSelect, 
  onLogout }) => {
  const [roomName, setRoomName] = useState('');
  const [roomPassword, setRoomPassword] = useState('');
  const [professionType, setProfessionType] = useState('individual'); // 'individual' или 'shared'
  const [selectedProfession, setSelectedProfession] = useState(null);
  const [selectedDream, setSelectedDream] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [createdRoomData, setCreatedRoomData] = useState(null);
  const [error, setError] = useState('');
  const [availableRooms, setAvailableRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Массив профессий для выбора
  const professions = [
    { id: 1, name: 'Дворник', salary: 2000, expenses: 200, balance: 2000, description: 'Уборка улиц и дворов', icon: '🧹' },
    { id: 2, name: 'Курьер', salary: 2500, expenses: 300, balance: 2500, description: 'Доставка товаров и документов', icon: '📦' },
    { id: 3, name: 'Водитель', salary: 3000, expenses: 400, balance: 3000, description: 'Управление транспортными средствами', icon: '🚗' },
    { id: 4, name: 'Продавец', salary: 3500, expenses: 500, balance: 3500, description: 'Продажа товаров и услуг', icon: '🛒' },
    { id: 5, name: 'Официант', salary: 4000, expenses: 600, balance: 4000, description: 'Обслуживание в ресторане', icon: '🍽️' }
  ];

  // Массив мечт для выбора
  const dreams = [
    { id: 1, name: 'Путешествие по миру', cost: 50000, description: 'Посетить все континенты', icon: '✈️' },
    { id: 2, name: 'Собственный дом', cost: 200000, description: 'Купить дом своей мечты', icon: '🏠' },
    { id: 3, name: 'Бизнес', cost: 100000, description: 'Открыть собственное дело', icon: '💼' },
    { id: 4, name: 'Образование', cost: 30000, description: 'Получить высшее образование', icon: '🎓' },
    { id: 5, name: 'Благотворительность', cost: 75000, description: 'Помогать другим людям', icon: '❤️' }
  ];

  // Функция для генерации уникального ID комнаты
  const generateRoomId = () => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `room_${timestamp}_${randomStr}`;
  };

  // Получаем список доступных комнат с сервера
  useEffect(() => {
    setRoomsLoading(true);

    socket.on('roomsList', (roomsList) => {
      console.log('🏠 [RoomSelection] Received rooms list:', roomsList);
      console.log('📊 [RoomSelection] Rooms count:', roomsList.length);
      console.log('📋 [RoomSelection] Rooms details:', roomsList.map(room => ({
        id: room.roomId,
        name: room.displayName,
        hostUsername: room.hostUsername
      })));
      setAvailableRooms(roomsList);
      setRoomsLoading(false);
    });

    socket.on('roomCreated', (createdRoom) => {
      console.log('✅ [RoomSelection] Room created:', createdRoom);
      
      // Если у нас есть данные о созданной комнате, отправляем профессию и отмечаем готовность
      if (createdRoomData && createdRoomData.roomId === createdRoom.roomId) {
        // Отправляем профессию хоста
        socket.emit('setHostProfession', createdRoom.roomId, createdRoomData.profession);
        
        // Отмечаем игрока как готового
        socket.emit('playerReady', createdRoom.roomId, createdRoomData.playerId);
        
        console.log('🎯 [RoomSelection] Sent profession and ready status for room:', createdRoom.roomId);
      }
      
      // Обновляем список комнат
      socket.emit('getRoomsList');
      
      // Принудительно запрашиваем обновленный список через небольшую задержку
      setTimeout(() => {
        socket.emit('getRoomsList');
        console.log('🔄 [RoomSelection] Forced rooms list refresh');
      }, 500);
      
      // Показываем сообщение об успешном создании комнаты
      setError('');
      console.log('🎉 [RoomSelection] Room successfully created and added to list');
    });

    socket.on('roomCreationError', (error) => {
      console.error('❌ [RoomSelection] Room creation error:', error);
      setError(`Ошибка создания комнаты: ${error.message || 'Неизвестная ошибка'}`);
      
      // Сбрасываем состояние готовности при ошибке
      setIsReady(false);
      setCreatedRoomData(null);
    });

    // Добавляем логирование для отладки
    console.log('🔌 [RoomSelection] Socket connected, requesting rooms list');
    
    socket.emit('getRoomsList');

    return () => {
      socket.off('roomsList');
      socket.off('roomCreated');
      socket.off('roomCreationError');
    };
  }, [createdRoomData]);

  // Обработка выбора комнаты
  const handleRoomSelect = (selectedRoomId) => {
    console.log('🔄 [RoomSelection] Selected room:', selectedRoomId);
    onRoomSelect({ roomId: selectedRoomId.trim() });
  };

  const handleDreamSelect = (dream) => {
    setSelectedDream(dream);
    setError('');
  };

  const handleToggleReady = () => {
    if (!roomName.trim()) {
      setError('Введите название комнаты!');
      return;
    }
    if (!selectedProfession) {
      setError('Сначала выберите профессию!');
      return;
    }

    if (!isReady) {
      // При нажатии "Готов" создаем комнату и сразу переходим в неё
      const roomId = generateRoomId();
      
      console.log('🚀 [RoomSelection] Creating room:', {
        roomId,
        name: roomName.trim(),
        password: roomPassword,
        professionType,
        profession: selectedProfession
      });
      
      // Создаем комнату на сервере (передаем выбранную профессию)
      socket.emit('createRoom', roomId, 2, roomPassword, 3, roomName.trim(), professionType, null, playerData.username, selectedProfession);
      
      // Сохраняем данные для последующей отправки
      setCreatedRoomData({
        roomId,
        profession: selectedProfession,
        playerId: playerData.id
      });
      
      setIsReady(true);
      setError('');
      console.log('✅ [RoomSelection] Room creation initiated, waiting for server confirmation...');
      
      // Сразу переходим в комнату после создания
      setTimeout(() => {
        if (createdRoomData) {
          onRoomSelect({ roomId: createdRoomData.roomId });
        }
      }, 1000);
    } else {
      // При отмене готовности
      setIsReady(false);
      setCreatedRoomData(null);
      console.log('❌ [RoomSelection] Ready status cancelled');
    }
  };

  const handleCreateRoom = () => {
    // Запускаем игру для созданной комнаты
    if (isReady) {
      // Находим созданную комнату по имени и ID пользователя
      const createdRoom = availableRooms.find(room => 
        room.displayName === roomName.trim() && 
        room.hostId === playerData.id
      );
      
      if (createdRoom) {
        socket.emit('startGame', createdRoom.roomId);
        console.log('🚀 [RoomSelection] Starting game for room:', createdRoom.roomId);
        
        // Очищаем форму после запуска игры
        setRoomName('');
        setRoomPassword('');
        setProfessionType('individual');
        setSelectedProfession(null);
        setSelectedDream(null);
        setIsReady(false);
        setCreatedRoomData(null);
        setError('');
        setShowCreateForm(false);
      } else {
        setError('Комната не найдена. Попробуйте еще раз.');
      }
    }
  };

  const filteredRooms = availableRooms.filter(room =>
    room.roomId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.hostId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoomStatusColor = (status) => {
    switch (status) {
      case 'waiting': return '#4caf50';
      case 'playing': return '#ff9800';
      case 'finished': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const getRoomStatusText = (status) => {
    switch (status) {
      case 'waiting': return 'Ожидание';
      case 'playing': return 'Игра';
      case 'finished': return 'Завершена';
      default: return 'Неизвестно';
    }
  };

  const getRoomStatusIcon = (status) => {
    switch (status) {
      case 'waiting': return '⏳';
      case 'playing': return '🎮';
      case 'finished': return '🏁';
      default: return '❓';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  // Проверяем, что playerData существует
  if (!playerData) {
    return null;
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)',
      p: { xs: 2, md: 4 },
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Стильные фоновые элементы */}
      <Box sx={{
        position: 'absolute',
        top: -100,
        right: -100,
        width: 400,
        height: 400,
        background: 'radial-gradient(circle, rgba(120, 119, 198, 0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        zIndex: 0,
        animation: 'float 6s ease-in-out infinite'
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: -150,
        left: -150,
        width: 500,
        height: 500,
        background: 'radial-gradient(circle, rgba(255, 119, 198, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        zIndex: 0,
        animation: 'float 8s ease-in-out infinite reverse'
      }} />
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600,
        height: 600,
        background: 'radial-gradient(circle, rgba(100, 200, 255, 0.05) 0%, transparent 70%)',
        borderRadius: '50%',
        zIndex: 0,
        animation: 'pulse 10s ease-in-out infinite'
      }} />
      
      {/* CSS анимации */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
            50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.1); }
          }
        `}
      </style>

      {/* Основной контент */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
      {/* Заголовок */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            {/* Логотип */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h1" sx={{
                fontSize: { xs: '3rem', md: '4rem' },
                fontWeight: 800,
                background: 'linear-gradient(135deg, #00d4ff 0%, #ff6b9d 50%, #c44569 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 8px 32px rgba(0, 212, 255, 0.3)',
                letterSpacing: '-0.02em',
                lineHeight: 1.1
              }}>
                💰
              </Typography>
            </Box>
            
            <Typography variant="h2" sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              letterSpacing: '-0.01em',
              lineHeight: 1.2
            }}>
              Energy of Money
            </Typography>
            
      <Typography variant="h4" sx={{
              color: 'rgba(255,255,255,0.85)', 
              mb: 3,
              fontWeight: 400,
              fontSize: { xs: '1.25rem', md: '1.5rem' },
              letterSpacing: '0.02em'
      }}>
        🏠 Выбор комнаты
      </Typography>

            <Typography variant="h6" sx={{
              color: 'rgba(255,255,255,0.7)', 
              fontWeight: 300,
              fontSize: { xs: '1rem', md: '1.125rem' },
              letterSpacing: '0.01em',
              maxWidth: 600,
              mx: 'auto',
              lineHeight: 1.6
            }}>
              Присоединитесь к существующей игре или создайте новую
            </Typography>
          </Box>
        </motion.div>

        {/* Информация об игроке и кнопка выхода */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
        >
          <Box sx={{ 
              display: 'flex',
            justifyContent: 'space-between', 
              alignItems: 'center',
            mb: 6,
            p: 4,
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Градиентная полоса */}
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, #00d4ff 0%, #ff6b9d 50%, #c44569 100%)'
            }} />
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Avatar sx={{ 
                  width: 56, 
                  height: 56, 
                  background: 'linear-gradient(135deg, #00d4ff 0%, #ff6b9d 100%)',
                  fontSize: '1.75rem',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 20px rgba(0, 212, 255, 0.4)',
                  border: '2px solid rgba(255,255,255,0.2)'
                }}>
                  {playerData?.username?.charAt(0)?.toUpperCase() || 'И'}
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ 
                    color: 'rgba(255,255,255,0.95)', 
                    fontWeight: 700,
                    mb: 1,
                    letterSpacing: '0.01em'
            }}>
              👤 {playerData?.username || 'Игрок'}
            </Typography>
                  <Typography variant="body1" sx={{ 
                    color: 'rgba(255,255,255,0.75)',
                    fontSize: '1rem',
                    fontWeight: 400,
                    letterSpacing: '0.01em'
                  }}>
                    Добро пожаловать в игру!
            </Typography>
                </Box>
              </Box>
            
                          <Button
                variant="outlined"
                onClick={onLogout}
                startIcon="🚪"
                sx={{
                  borderColor: 'rgba(255,255,255,0.25)',
                  color: 'rgba(255,255,255,0.9)',
                  borderRadius: 3,
                  px: 4,
                  py: 2,
                  fontWeight: 600,
                  fontSize: '1rem',
                  textTransform: 'none',
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    borderColor: 'rgba(255,255,255,0.5)',
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(255,255,255,0.3)'
                  },
                  '&:active': {
                    transform: 'translateY(0px)'
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                Выйти
              </Button>
          </Box>
        </motion.div>

        {/* Поиск и создание */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          <Paper elevation={0} sx={{
            p: 5,
            mb: 6,
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(25px)',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Градиентная полоса */}
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #00d4ff 0%, #ff6b9d 50%, #c44569 100%)'
            }} />
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', mb: 4, flexWrap: 'wrap' }}>
              <TextField
                fullWidth
                placeholder="🔍 Поиск комнат по названию, ID или создателю..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: '#00d4ff', mr: 1 }} />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    fontSize: '1.1rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'rgba(255, 255, 255, 0.9)',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.15)',
                      borderColor: 'rgba(255, 255, 255, 0.3)'
                    },
                    '&.Mui-focused': {
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderColor: '#00d4ff',
                      borderWidth: 2
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)'
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: 'rgba(255, 255, 255, 0.5)',
                    opacity: 1
                  }
                }}
              />
              <Button
                variant="outlined"
                onClick={() => socket.emit('getRoomsList')}
                startIcon={<RefreshIcon />}
                sx={{ 
                  borderRadius: 3,
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  color: 'rgba(255, 255, 255, 0.9)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  px: 3,
                  py: 1.5,
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    transform: 'translateY(-1px)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                Обновить
              </Button>
            </Box>

            <Divider sx={{ mb: 4 }} />

            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => setShowCreateForm(!showCreateForm)}
                startIcon={<AddIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #00d4ff 0%, #ff6b9d 100%)',
                  borderRadius: 4,
                  px: 8,
                  py: 2.5,
              fontSize: '1.2rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  boxShadow: '0 8px 32px rgba(0, 212, 255, 0.3)',
                  border: 'none',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #00b8e6 0%, #ff5a8a 100%)',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 40px rgba(0, 212, 255, 0.4)'
                  },
                  '&:active': {
                    transform: 'translateY(-1px)'
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {showCreateForm ? 'Отменить создание' : '✨ Создать новую комнату'}
              </Button>
            </Box>
          </Paper>
        </motion.div>

        {/* Простая форма создания комнаты */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ height: 0, opacity: 0, scale: 0.9 }}
              animate={{ height: 'auto', opacity: 1, scale: 1 }}
              exit={{ height: 0, opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <Paper elevation={24} sx={{
                p: 5,
                mb: 5,
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
              }}>
                <Typography variant="h4" sx={{ 
                  mb: 5, 
                  textAlign: 'center', 
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #00d4ff 0%, #ff6b9d 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '1.75rem', md: '2.125rem' },
                  letterSpacing: '-0.01em'
                }}>
                  ✨ Создание новой комнаты
          </Typography>

                {/* Название и пароль в одном ряду */}
                <Box sx={{ mb: 4 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            label="Название комнаты"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
                        placeholder="Например: Моя первая игра"
                        helperText="Введите описательное название для игроков"
                        type="text"
                        autoComplete="off"
            sx={{
              '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            fontSize: '1.1rem',
                '&.Mui-focused': {
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#667eea',
                                borderWidth: 2
                              }
                            }
              }
            }}
          />
                    </Grid>
                    <Grid item xs={12} md={4}>
          <TextField
            fullWidth
                        label="Пароль (необязательно)"
                        value={roomPassword}
                        onChange={(e) => setRoomPassword(e.target.value)}
                        placeholder="Оставьте пустым"
                        helperText="Для закрытой комнаты"
                        type="password"
                        autoComplete="new-password"
            sx={{
              '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            fontSize: '1.1rem',
                '&:hover': {
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#667eea'
                              }
                            },
                '&.Mui-focused': {
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#667eea',
                                borderWidth: 2
                }
              }
              }
            }}
          />
                    </Grid>
                  </Grid>
                </Box>

                {/* Тип профессий */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ mb: 3, color: '#333', fontWeight: 600, fontSize: '1.1rem' }}>
                    👥 Тип профессий
                  </Typography>
                  
                  {/* Список профессий как строки */}
                  <Box sx={{ 
                    border: '1px solid #e9ecef',
                    borderRadius: 0,
                    overflow: 'hidden'
                  }}>
                    {/* Строка 1: Индивидуальные профессии */}
                    <Box
                      onClick={() => setProfessionType('individual')}
            sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 3,
                        cursor: 'pointer',
                        background: professionType === 'individual' ? '#f8f9fa' : '#ffffff',
                        borderBottom: '1px solid #e9ecef',
                        transition: 'all 0.2s ease',
              '&:hover': {
                          background: professionType === 'individual' ? '#e9ecef' : '#f8f9fa'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h6" sx={{ color: '#212529', fontWeight: 500 }}>
                          🎯 У каждого своя профессия
                        </Typography>
        </Box>
        <Box sx={{
                        width: 20, 
                        height: 20, 
                        borderRadius: '50%',
                        border: '2px solid',
                        borderColor: professionType === 'individual' ? '#212529' : '#dee2e6',
                        background: professionType === 'individual' ? '#212529' : 'transparent',
                        position: 'relative',
                        '&::after': professionType === 'individual' ? {
                          content: '""',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: '#ffffff'
                        } : {}
                      }} />
                    </Box>

                    {/* Строка 2: Общие профессии */}
                    <Box
                      onClick={() => setProfessionType('shared')}
                      sx={{
            display: 'flex',
            alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 3,
                        cursor: 'pointer',
                        background: professionType === 'shared' ? '#f8f9fa' : '#ffffff',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          background: professionType === 'shared' ? '#e9ecef' : '#f8f9fa'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h6" sx={{ color: '#212529', fontWeight: 500 }}>
                          🤝 Одна профессия на всех
          </Typography>
                      </Box>
                      <Box sx={{ 
                        width: 20, 
                        height: 20, 
                        borderRadius: '50%',
                        border: '2px solid',
                        borderColor: professionType === 'shared' ? '#212529' : '#dee2e6',
                        background: professionType === 'shared' ? '#212529' : 'transparent',
                        position: 'relative',
                        '&::after': professionType === 'shared' ? {
                          content: '""',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: '#ffffff'
                        } : {}
                      }} />
                    </Box>
                  </Box>

                                     {/* Описание выбранного типа */}
                   <Box sx={{ mt: 2, p: 2, bgcolor: '#f8f9fa', borderLeft: '3px solid #212529' }}>
                     <Typography variant="body2" sx={{ color: '#495057', fontSize: '0.9rem', lineHeight: 1.5 }}>
                       {professionType === 'individual' 
                         ? 'Каждый игрок выбирает свою профессию индивидуально' 
                         : 'Все игроки используют одну общую профессию'
                       }
              </Typography>
            </Box>
                 </Box>

                 {/* Выбор профессии хоста */}
                 <Box sx={{ mb: 4 }}>
                   <Typography variant="h6" sx={{ mb: 3, color: '#333', fontWeight: 600, fontSize: '1.1rem' }}>
                     💼 {professionType === 'shared' ? 'Профессия для всех игроков' : 'Ваша профессия'}
                   </Typography>
                   
            <Grid container spacing={2}>
                     {professions.map((profession) => (
                       <Grid item xs={12} sm={6} key={profession.id}>
                         <Card
                           onClick={() => setSelectedProfession(profession)}
                           sx={{
                        cursor: 'pointer',
                             border: selectedProfession?.id === profession.id ? '3px solid #667eea' : '1px solid #ddd',
                             transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                               boxShadow: 3
                        }
                      }}
                      >
                        <CardContent sx={{ p: 2, textAlign: 'center' }}>
                             <Typography variant="h3" sx={{ mb: 1 }}>
                               {profession.icon}
                          </Typography>
                             <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                               {profession.name}
                            </Typography>
                             <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                               {profession.description}
                              </Typography>
                             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                               <Chip 
                                 label={`💰 $${profession.salary.toLocaleString()}`} 
                                 size="small" 
                                 color="success" 
                                 sx={{ fontWeight: 'bold' }}
                               />
                               <Chip 
                                 label={`💸 $${profession.expenses.toLocaleString()}`} 
                                 size="small" 
                                 color="error" 
                                 sx={{ fontWeight: 'bold' }}
                               />
                          </Box>
                           </CardContent>
                         </Card>
                       </Grid>
                     ))}
                   </Grid>
                   
                   {selectedProfession && (
                     <Box sx={{ mt: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 2, textAlign: 'center' }}>
                       <Typography variant="body1" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                         ✅ Выбрана профессия: {selectedProfession.name}
                              </Typography>
                            </Box>
                          )}
                 </Box>

                

                {/* Информация об автоматической генерации ID */}
            <Box sx={{
                  p: 4,
                  mb: 4,
                  background: 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)',
                  borderRadius: 4,
                  border: '2px solid #4caf50',
              textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <Box sx={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    background: 'radial-gradient(circle, rgba(76, 175, 80, 0.1) 0%, transparent 70%)',
                    borderRadius: '50%'
                  }} />
                  

            </Box>

                {error && (
                  <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }}>
                    {error}
                  </Alert>
                )}

                {/* Кнопки управления */}
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                  <Grid container spacing={2} justifyContent="center">
                    <Grid item>
          <Button
                        variant={isReady ? "contained" : "outlined"}
                        size="large"
                        onClick={handleToggleReady}
                        disabled={!selectedProfession}
                        startIcon={isReady ? "✅" : "⏳"}
            sx={{
                          borderRadius: 3,
                          px: 4,
              py: 1.5,
                          fontSize: '1.1rem',
              fontWeight: 'bold',
                          ...(isReady ? {
                            background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                            color: 'white',
              '&:hover': {
                              background: 'linear-gradient(135deg, #45a049 0%, #4caf50 100%)'
                            }
                          } : {
                            borderColor: '#667eea',
                            color: '#667eea',
                            '&:hover': {
                              borderColor: '#5a6fd8',
                              backgroundColor: 'rgba(102, 126, 234, 0.1)'
                            }
                          })
                        }}
                      >
                        {isReady ? 'Готов! В комнате' : 'Готов'}
          </Button>
                    </Grid>
                    <Grid item>
          <Button
                        variant="contained"
                        size="large"
                        onClick={handleCreateRoom}
                                                 disabled={!isReady}
                        startIcon="🚀"
            sx={{
                          background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                          color: 'white',
                          borderRadius: 3,
                          px: 4,
              py: 1.5,
                          fontSize: '1.1rem',
              fontWeight: 'bold',
              '&:hover': {
                            background: 'linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(255, 152, 0, 0.4)'
                          },
                          '&:disabled': {
                            background: '#ccc',
                            transform: 'none',
                            boxShadow: 'none'
                          }
                        }}
                      >
                        Старт
          </Button>
                    </Grid>
                  </Grid>
        </Box>


      </Paper>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Список комнат в виде карточек */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          <Typography variant="h4" sx={{ 
            mb: 4, 
            textAlign: 'center', 
            color: 'rgba(255,255,255,0.95)',
            fontWeight: 700,
            textShadow: '0 2px 10px rgba(0,0,0,0.3)'
          }}>
            🎮 Доступные комнаты ({filteredRooms.length})
          </Typography>

          {roomsLoading ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <CircularProgress size={80} sx={{ color: 'rgba(255,255,255,0.9)' }} />
              <Typography variant="h5" sx={{ mt: 3, color: 'rgba(255,255,255,0.9)' }}>
                Загрузка комнат...
              </Typography>
            </Box>
          ) : filteredRooms.length === 0 ? (
            <Paper elevation={24} sx={{
              p: 8,
              textAlign: 'center',
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <HomeIcon sx={{ fontSize: 100, color: '#ccc', mb: 3 }} />
              <Typography variant="h5" color="text.secondary" sx={{ mb: 3, fontWeight: 600 }}>
                Комнаты не найдены
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                {searchQuery ? 'Попробуйте изменить поисковый запрос' : 'Создайте первую комнату для игры!'}
              </Typography>
            </Paper>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <Grid container spacing={3}>
                {filteredRooms.map((room, index) => (
                  <Grid item xs={12} sm={6} md={4} key={room.roomId}>
                    <motion.div variants={itemVariants}>
                      <Card 
                        elevation={16}
                        sx={{
                          borderRadius: 4,
                          background: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          cursor: 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            transform: 'translateY(-8px) scale(1.02)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
                          }
                        }}
                        onClick={() => handleRoomSelect(room.roomId)}
                      >
                        <CardContent sx={{ p: 3 }}>
                          {/* Заголовок карточки */}
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6" sx={{ 
                              fontWeight: 700, 
                              color: '#667eea',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {room.displayName || room.name || 'Комната'}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              {/* Индикатор закрытой комнаты */}
                              {room.password && (
                                <Chip
                                  label="🔒"
                                  size="small"
                                  sx={{
                                    bgcolor: '#ff9800',
                                    color: 'white',
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                    borderRadius: 2
                                  }}
                                  title="Комната с паролем"
                                />
                              )}
                              <Chip
                                label={getRoomStatusText(room.status)}
                                size="small"
                                sx={{
                                  bgcolor: getRoomStatusColor(room.status),
                                  color: 'white',
                                  fontWeight: 700,
                                  fontSize: '0.75rem',
                                  borderRadius: 2
                                }}
                              />
                            </Box>
                          </Box>

                          {/* Название комнаты */}
                          <Typography variant="body2" sx={{ 
                            fontSize: '1rem',
                            color: '#333',
                            mb: 2,
                            p: 1,
                            bgcolor: '#f8f9fa',
                            borderRadius: 2,
                            textAlign: 'center',
                            fontWeight: 500
                          }}>
                            {room.displayName || room.name || 'Без названия'}
                          </Typography>

                          {/* Информация о комнате */}
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <GroupIcon sx={{ color: '#667eea', fontSize: 20 }} />
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {room.currentPlayers?.length || 0} / {room.maxPlayers || 2} игроков
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <StarIcon sx={{ color: '#ff9800', fontSize: 20 }} />
                              <Typography variant="body2" color="text.secondary">
                                {room.hostUsername ? `Создатель: ${room.hostUsername}` : 
                                 room.hostId === playerData?.id ? 'Создатель: Вы' : 
                                 'Создатель: Неизвестно'}
                              </Typography>
                            </Box>
                          </Box>

                          {/* Статус иконка */}
                          <Box sx={{ textAlign: 'center', mb: 2 }}>
                            <Typography variant="h3" sx={{ mb: 1 }}>
                              {getRoomStatusIcon(room.status)}
                            </Typography>
                          </Box>
                        </CardContent>

                        <CardActions sx={{ p: 3, pt: 0 }}>
                          <Button
                            fullWidth
                            variant="contained"
                            startIcon={<PlayIcon />}
                            sx={{
                              background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                              borderRadius: 3,
                              py: 1.5,
                              fontWeight: 700,
                              textTransform: 'none',
                              fontSize: '1rem',
                              boxShadow: '0 4px 20px rgba(76, 175, 80, 0.3)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #45a049 0%, #4caf50 100%)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 6px 25px rgba(76, 175, 80, 0.4)'
                              },
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                          >
                            Присоединиться
                          </Button>
                        </CardActions>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          )}
        </motion.div>
      </Box>

      {/* Плавающая кнопка настроек */}
      <Fab
        color="primary"
        aria-label="Настройки"
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: 64,
          height: 64,
          '&:hover': {
            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
            transform: 'scale(1.1) rotate(5deg)'
          },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <SettingsIcon sx={{ fontSize: 28 }} />
      </Fab>
    </Box>
  );
};

export default RoomSelection;
