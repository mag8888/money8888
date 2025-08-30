import React, { useState, useEffect } from 'react';
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

const RoomSetup = ({ playerData, onRoomSetup }) => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  
  // Все хуки должны быть в начале компонента, до любых условных проверок
  
  // Основные настройки комнаты
  const [roomName, setRoomName] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [roomPassword, setRoomPassword] = useState('');
  const [professionType, setProfessionType] = useState('individual');
  
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
  
  // Отладочное логирование состояния players
  useEffect(() => {
    console.log('👥 [RoomSetup] Состояние players обновлено:', players);
    console.log('👥 [RoomSetup] Количество игроков в UI:', players.length);
  }, [players]);
  
  // Уведомления
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Инициализируем имя игрока из playerData или localStorage
  useEffect(() => {
    if (playerData?.username) {
      setPlayerName(playerData.username);
      console.log('👤 [RoomSetup] Установлено имя игрока из playerData:', playerData.username);
    } else {
      const savedPlayerName = localStorage.getItem('energy_of_money_player_name');
      if (savedPlayerName) {
        setPlayerName(savedPlayerName);
        console.log('💾 [RoomSetup] Загружено сохраненное имя игрока:', savedPlayerName);
      } else {
        const randomName = `Игрок ${Math.floor(Math.random() * 9000) + 1000}`;
        setPlayerName(randomName);
        console.log('🎲 [RoomSetup] Сгенерировано случайное имя:', randomName);
      }
    }
    
    console.log('🏠 [RoomSetup] Ожидаем загрузку имени комнаты с сервера...');
  }, [playerData]);

  // Обработчики Socket.IO событий
  useEffect(() => {
    if (!roomId || !playerName || !playerData) {
      console.log('⏳ [RoomSetup] Ожидаем roomId, playerName или playerData:', { roomId, playerName, playerData });
      return;
    }

    console.log('🔗 [RoomSetup] Подключаемся к комнате с именем:', playerName);
    console.log('🔗 [RoomSetup] playerData:', playerData);
    
    // Подключаемся к комнате
    socket.emit('joinRoom', roomId, {
      username: playerName,
      roomId: roomId
    });

    // Обработка успешного присоединения к комнате
    socket.on('roomJoined', (data) => {
      console.log('✅ [RoomSetup] Успешно присоединились к комнате:', data);
      if (data.success) {
        console.log('🏠 [RoomSetup] Запрашиваем данные комнаты после присоединения');
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
      console.log('🏠 [RoomSetup] Получены данные комнаты:', data);
      console.log('🏠 [RoomSetup] data.displayName:', data.displayName);
      console.log('🏠 [RoomSetup] data.roomId:', data.roomId);
      console.log('🏠 [RoomSetup] data.hostId:', data.hostId);
      console.log('👥 [RoomSetup] data.currentPlayers:', data.currentPlayers);
      
      if (data.displayName) {
        setRoomName(data.displayName);
        console.log('🏠 [RoomSetup] Установлено имя комнаты:', data.displayName);
      } else {
        console.log('⚠️ [RoomSetup] displayName отсутствует в данных комнаты');
      }
      
      setIsPublic(data.isPublic !== false);
      setRoomPassword(data.password || '');
      setProfessionType(data.professionType || 'individual');
      
      // Если в roomData есть информация об игроках, обновляем состояние
      if (data.currentPlayers && Array.isArray(data.currentPlayers)) {
        console.log('👥 [RoomSetup] Обновляем игроков из roomData:', data.currentPlayers.length);
        setPlayers(data.currentPlayers);
        
        const readyPlayers = data.currentPlayers.filter(p => p.ready);
        console.log('✅ [RoomSetup] Готовых игроков из roomData:', readyPlayers.length);
        setCanStart(readyPlayers.length >= 2);
        
        const currentPlayer = data.currentPlayers.find(p => p.socketId === socket.id);
        if (currentPlayer) {
          console.log('👤 [RoomSetup] Текущий игрок найден в roomData:', currentPlayer);
          setIsReady(currentPlayer.ready || false);
        }
      }
      
      if (data.hostProfession && data.hostProfession !== 'none') {
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
          navigate(`/room/${roomId}/game`);
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
      
      if (data.hostProfession && data.hostProfession !== 'none') {
        setSelectedProfession(data.hostProfession);
        console.log('💼 [RoomSetup] Установлена профессия хоста:', data.hostProfession);
      }
    });

    // Обработка списка игроков
    socket.on('playersUpdate', (updatedPlayers) => {
      console.log('👥 [RoomSetup] Получен playersUpdate:', updatedPlayers);
      console.log('👥 [RoomSetup] Количество игроков:', updatedPlayers.length);
      
      setPlayers(updatedPlayers);
      
      const readyPlayers = updatedPlayers.filter(p => p.ready);
      console.log('✅ [RoomSetup] Готовых игроков:', readyPlayers.length);
      setCanStart(readyPlayers.length >= 2);
      
      const currentPlayer = updatedPlayers.find(p => p.socketId === socket.id);
      if (currentPlayer) {
        console.log('👤 [RoomSetup] Текущий игрок найден:', currentPlayer);
        setIsReady(currentPlayer.ready || false);
        
        if (currentPlayer.profession && currentPlayer.profession !== 'none') {
          setSelectedProfession(currentPlayer.profession);
          console.log('💼 [RoomSetup] Установлена профессия из данных игрока:', currentPlayer.profession);
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
      setError('Комната не найдена');
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
      setSuccess('Игра запущена! Переходим к игровому полю...');
      setTimeout(() => {
        navigate(`/room/${roomId}/game`);
      }, 2000);
    });

    // Обработка начала определения очередности
    socket.on('orderDeterminationStarted', (data) => {
      console.log('🎲 [RoomSetup] Началось определение очередности:', data);
      setSuccess('Определение очередности! Переходим к игровому полю...');
      setTimeout(() => {
        navigate(`/room/${roomId}/game`);
      }, 2000);
    });

    console.log('🏠 [RoomSetup] Ожидаем присоединения к комнате для получения данных');

    return () => {
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
  }, [roomId, playerName, roomName, navigate, playerData, isConnected]);

  // Проверяем, что playerData передан (после всех хуков)
  if (!playerData) {
    console.error('❌ [RoomSetup] playerData не передан');
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          Ошибка: данные игрока не загружены. Пожалуйста, перезагрузите страницу.
        </Alert>
      </Container>
    );
  }

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

  const handleProfessionSelect = (profession) => {
    setSelectedProfession(profession);
    socket.emit('updateProfession', roomId, profession);
    setSuccess(`Профессия выбрана: ${profession.name}!`);
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
      navigate(`/room/${roomId}/game`);
    }, 1000); // Задержка 1 секунда для показа сообщения
  };

  // Данные для профессий и мечт
  const professions = [
    { id: 1, name: 'Дворник', salary: 2000, expenses: 200, description: 'Уборка улиц и дворов' },
    { id: 2, name: 'Курьер', salary: 2500, expenses: 300, description: 'Доставка товаров и документов' },
    { id: 3, name: 'Водитель', salary: 3000, expenses: 400, description: 'Перевозка пассажиров' },
    { id: 4, name: 'Продавец', salary: 3500, expenses: 500, description: 'Продажа товаров' },
    { id: 5, name: 'Офисный работник', salary: 4000, expenses: 600, description: 'Работа в офисе' }
  ];

  const dreams = [
    { id: 1, name: 'Путешествие по миру', cost: 50000, description: 'Посетить все континенты' },
    { id: 2, name: 'Собственный дом', cost: 200000, description: 'Купить дом своей мечты' },
    { id: 3, name: 'Бизнес', cost: 100000, description: 'Открыть собственное дело' },
    { id: 4, name: 'Образование', cost: 30000, description: 'Получить высшее образование' },
    { id: 5, name: 'Благотворительность', cost: 75000, description: 'Помогать другим людям' }
  ];

  return (
    <Container maxWidth="lg">
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
                💼 Профессия (можно изменять)
              </Typography>
              <Grid container spacing={2}>
                {professions.map((profession) => (
                  <Grid item xs={12} sm={6} md={4} key={profession.id}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        border: selectedProfession?.id === profession.id ? '2px solid #4caf50' : '1px solid #ddd',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 3
                        }
                      }}
                      onClick={() => handleProfessionSelect(profession)}
                    >
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 1, color: '#333' }}>
                          {profession.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                          💰 Зарплата: {profession.salary}₽
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                          💸 Расходы: {profession.expenses}₽
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666', fontSize: '0.9rem' }}>
                          {profession.description}
                        </Typography>
                        {selectedProfession?.id === profession.id && (
                          <Chip
                            label="Выбрано"
                            color="success"
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

            {/* Список игроков */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                👥 Игроки в комнате ({players.length})
                {players.length === 0 && (
                  <Typography variant="body2" sx={{ color: '#ff9800', ml: 2, fontSize: '0.9rem' }}>
                    ⚠️ Загрузка списка игроков...
                  </Typography>
                )}
              </Typography>
              <Grid container spacing={2}>
                {players.map((player) => (
                  <Grid item xs={12} sm={6} md={4} key={player.socketId}>
                    <Card sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: player.ready ? '#4caf50' : '#ff9800' }}>
                          {player.username.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {player.username}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666' }}>
                            {player.ready ? '✅ Готов' : '⏳ Не готов'}
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

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
    </Container>
  );
};

export default RoomSetup;
