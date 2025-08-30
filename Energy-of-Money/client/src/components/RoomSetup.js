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
  Divider,
  Card,
  CardContent,
  Avatar
} from '@mui/material';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import socket from '../socket';

const RoomSetup = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  
  // Основные настройки комнаты
  const [roomName, setRoomName] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [roomPassword, setRoomPassword] = useState('');
  const [professionType, setProfessionType] = useState('individual'); // 'individual' или 'shared'
  
  // Выбор профессии и мечты
  const [selectedProfession, setSelectedProfession] = useState(null);
  const [selectedDream, setSelectedDream] = useState(null);

  
  // Состояние игрока
  const [isReady, setIsReady] = useState(false);
  const [playerName, setPlayerName] = useState('');
  
  // Данные комнаты

  const [players, setPlayers] = useState([]);
  const [canStart, setCanStart] = useState(false);
  
  // Уведомления
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Загружаем сохраненное имя игрока или генерируем случайное
  useEffect(() => {
    // Пытаемся загрузить сохраненное имя игрока
    const savedPlayerName = localStorage.getItem('energy_of_money_player_name');
    if (savedPlayerName) {
      setPlayerName(savedPlayerName);
      console.log('💾 [RoomSetup] Загружено сохраненное имя игрока:', savedPlayerName);
    } else {
      // Если нет сохраненного имени, генерируем случайное
      const randomName = `Игрок ${Math.floor(Math.random() * 9000) + 1000}`;
      setPlayerName(randomName);
      console.log('🎲 [RoomSetup] Сгенерировано случайное имя:', randomName);
    }
    
    // Имя комнаты будет загружено с сервера через roomData
    console.log('🏠 [RoomSetup] Ожидаем загрузку имени комнаты с сервера...');
  }, []);

  // Обработчики Socket.IO событий
  useEffect(() => {
    if (!roomId) return;

    // Подключаемся к комнате
    socket.emit('joinRoom', roomId, playerName);

    // Обработка данных комнаты
    socket.on('roomData', (data) => {
      console.log('🏠 [RoomSetup] Получены данные комнаты:', data);
      if (data.displayName) {
        setRoomName(data.displayName);
        console.log('🏠 [RoomSetup] Установлено имя комнаты:', data.displayName);
      }
      setIsPublic(data.isPublic !== false);
      setRoomPassword(data.password || '');
      setProfessionType(data.professionType || 'individual');
      
      // Устанавливаем профессию хоста, если она есть
      if (data.hostProfession && data.hostProfession !== 'none') {
        setSelectedProfession(data.hostProfession);
        console.log('💼 [RoomSetup] Установлена профессия хоста из roomData:', data.hostProfession);
      }

      // Проверяем статус игры
      if (data.status === 'determining_order') {
        setSuccess('Игра запущена! Определение очередности...');
        // Переходим к игровому полю
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
      
      // Устанавливаем профессию хоста, если она есть
      if (data.hostProfession && data.hostProfession !== 'none') {
        setSelectedProfession(data.hostProfession);
        console.log('💼 [RoomSetup] Установлена профессия хоста:', data.hostProfession);
      }
    });

    // Обработка списка игроков
    socket.on('playersUpdate', (updatedPlayers) => {
      setPlayers(updatedPlayers);
      
      // Проверяем, может ли игра начаться
      const readyPlayers = updatedPlayers.filter(p => p.ready);
      setCanStart(readyPlayers.length >= 2);
      
      // Проверяем, готов ли текущий игрок
      const currentPlayer = updatedPlayers.find(p => p.socketId === socket.id);
      if (currentPlayer) {
        setIsReady(currentPlayer.ready || false);
        
        // Устанавливаем выбранную профессию из данных игрока
        if (currentPlayer.profession && currentPlayer.profession !== 'none') {
          setSelectedProfession(currentPlayer.profession);
          console.log('💼 [RoomSetup] Установлена профессия из данных игрока:', currentPlayer.profession);
        }
        
        // Устанавливаем выбранную мечту из данных игрока
        if (currentPlayer.dream && currentPlayer.dream !== 'none') {
          setSelectedDream(currentPlayer.dream);
          console.log('⭐ [RoomSetup] Установлена мечта из данных игрока:', currentPlayer.dream);
        }
      }
    });

    // Обработка ошибок
    socket.on('roomNotFound', () => {
      setError('Комната не найдена');
    });

    socket.on('error', (error) => {
      setError(`Ошибка: ${error.message || 'Неизвестная ошибка'}`);
    });

    // Обработка запуска игры
    socket.on('gameStarted', (data) => {
      console.log('🎮 [RoomSetup] Игра запущена:', data);
      setSuccess('Игра запущена! Переходим к игровому полю...');
      // Переходим к игровому полю
      setTimeout(() => {
        navigate(`/room/${roomId}/game`);
      }, 2000);
    });

    // Обработка начала определения очередности
    socket.on('orderDeterminationStarted', (data) => {
      console.log('🎲 [RoomSetup] Началось определение очередности:', data);
      setSuccess('Определение очередности! Переходим к игровому полю...');
      // Переходим к игровому полю
      setTimeout(() => {
        navigate(`/room/${roomId}/game`);
      }, 2000);
    });



    // Запрашиваем данные комнаты при входе
    if (roomId) {
      socket.emit('getRoomData', roomId);
      console.log('🏠 [RoomSetup] Запрошены данные комнаты:', roomId);
    }

    return () => {
      socket.off('roomData');
      socket.off('roomCreated');
      socket.off('playersUpdate');
      socket.off('roomNotFound');
      socket.off('error');
      socket.off('gameStarted');
      socket.off('orderDeterminationStarted');
    };
  }, [roomId, playerName, roomName, navigate]);

  // Обработчики действий
  const handleRoomNameChange = () => {
    if (roomName.trim()) {
      socket.emit('updateRoomName', roomId, roomName.trim());
      setSuccess('Название комнаты обновлено!');
    }
  };

  const handlePublicToggle = () => {
    const newPublicState = !isPublic;
    setIsPublic(newPublicState);
    
    // Если комната становится закрытой, очищаем пароль
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

  const handleProfessionTypeChange = (event) => {
    const newType = event.target.value;
    setProfessionType(newType);
    socket.emit('updateProfessionType', roomId, newType);
    setSuccess(`Тип профессий изменен на: ${newType === 'individual' ? 'индивидуальные' : 'общие'}!`);
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
    socket.emit('toggleReady', roomId);
    setSuccess(newReadyState ? 'Вы готовы!' : 'Готовность снята');
  };

  const handleStartGame = () => {
    socket.emit('startGame', roomId);
    setSuccess('Игра запускается...');
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
          py: 4
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
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
      {/* Заголовок */}
            <Typography
              variant="h3"
              component="h1"
              align="center"
              sx={{
        mb: 4, 
        fontWeight: 'bold', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              🎮 Настройка партии
      </Typography>

            <Grid container spacing={4} alignItems="flex-start">
              {/* Левая колонка - Настройки комнаты */}
              <Grid item xs={12} md={6}>
                <Typography variant="h5" sx={{ mb: 3, color: '#333', fontWeight: 'bold' }}>
                  ⚙️ Настройки комнаты
                </Typography>

                {/* Имя комнаты */}
                    <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                    🏠 Имя комнаты
                      </Typography>
                      <TextField
                        fullWidth
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="Введите имя комнаты"
                        variant="outlined"
                    sx={{ mb: 1 }}
                      />
                      <Button
                    variant="outlined"
                    onClick={handleRoomNameChange}
                        fullWidth
                    sx={{ borderRadius: 2 }}
                  >
                    💾 Сохранить имя
                      </Button>
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
                      </Box>
                  )}
                    </Box>

                {/* Тип профессий */}
                    <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                    👥 Тип профессий
                      </Typography>
                        <FormControl fullWidth>
                          <Select
                      value={professionType}
                      onChange={handleProfessionTypeChange}
                      variant="outlined"
                    >
                      <MenuItem value="individual">
                        🎯 У каждого своя профессия
                              </MenuItem>
                      <MenuItem value="shared">
                        🤝 Одна профессия на всех
                      </MenuItem>
          </Select>
        </FormControl>
                  <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                    {professionType === 'individual' 
                      ? 'Каждый игрок выбирает свою профессию' 
                      : 'Все игроки используют одну профессию'
                    }
                  </Typography>
                    </Box>

                {/* Имя игрока */}
        <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                        👤 Ваше имя
          </Typography>
                        <TextField
              fullWidth
                    value={playerName}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setPlayerName(newName);
                      
                      // Автоматически сохраняем имя в localStorage при изменении
                      if (newName.trim()) {
                        localStorage.setItem('energy_of_money_player_name', newName.trim());
                      }
                    }}
                    onBlur={() => {
                      // При потере фокуса отправляем имя на сервер
                      if (roomId && playerName.trim()) {
                        socket.emit('updatePlayerName', roomId, playerName.trim());
                        setSuccess('Имя игрока обновлено!');
                      }
                    }}
                    placeholder="Введите ваше имя"
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />

                </Box>
              </Grid>

              {/* Правая колонка - Выбор профессии и мечты */}
              <Grid item xs={12} md={6}>
                <Typography variant="h5" sx={{ mb: 3, color: '#333', fontWeight: 'bold' }}>
                  🎯 Выбор персонажа
                </Typography>

                {/* Выбор профессии */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                    💼 Профессия
                  </Typography>
                  {selectedProfession && (
                    <Typography variant="body2" sx={{ mb: 2, color: '#4caf50', fontWeight: 'bold' }}>
                      ✅ Выбрана: {selectedProfession.name}
                    </Typography>
                  )}
                  <Grid container spacing={2}>
                    {professions.map((profession) => (
                      <Grid item xs={12} sm={6} key={profession.id} sx={{ display: 'flex', mb: 2 }}>
                        <Card
                          onClick={() => handleProfessionSelect(profession)}
              sx={{
                            cursor: 'pointer',
                            border: selectedProfession?.id === profession.id ? '2px solid #667eea' : '1px solid #ddd',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            height: '180px', // Фиксированная высота для всех карточек
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: 3
                            }
                          }}
                        >
                          {/* Сердечко для выбранной профессии */}
                          {selectedProfession?.id === profession.id && (
                            <Box
              sx={{
                                position: 'absolute',
                                top: -8,
                                right: -8,
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                backgroundColor: '#ff6b6b',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 1,
                                boxShadow: '0 2px 8px rgba(255, 107, 107, 0.3)',
                                animation: 'pulse 2s infinite'
                              }}
                            >
                              <Typography sx={{ color: 'white', fontSize: '16px', fontWeight: 'bold' }}>
                                ❤️
                              </Typography>
                            </Box>
                          )}
                          <CardContent sx={{ p: 2, textAlign: 'center', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, fontSize: '1.1rem' }}>
                                {profession.name}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#666', mb: 1, lineHeight: 1.4, flexGrow: 1 }}>
                                {profession.description}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', mt: 'auto' }}>
                              <Chip label={`💰 ${profession.salary}`} size="small" color="success" />
                              <Chip label={`💸 ${profession.expenses}`} size="small" color="error" />
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Выбор мечты */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                    ⭐ Мечта
                  </Typography>
                  {selectedDream && (
                    <Typography variant="body2" sx={{ mb: 2, color: '#4caf50', fontWeight: 'bold' }}>
                      ✅ Выбрана: {selectedDream.name}
                    </Typography>
                  )}
                  <Grid container spacing={2}>
                    {dreams.map((dream) => (
                      <Grid item xs={12} sm={6} key={dream.id} sx={{ display: 'flex', mb: 2 }}>
                        <Card
                          onClick={() => handleDreamSelect(dream)}
                          sx={{
                            cursor: 'pointer',
                            border: selectedDream?.id === dream.id ? '2px solid #667eea' : '1px solid #ddd',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            height: '180px', // Фиксированная высота для всех карточек
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: 3
                            }
                          }}
                        >
                          {/* Сердечко для выбранной мечты */}
                          {selectedDream?.id === dream.id && (
                            <Box
              sx={{
                                position: 'absolute',
                                top: -8,
                                right: -8,
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                backgroundColor: '#ff6b6b',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 1,
                                boxShadow: '0 2px 8px rgba(255, 107, 107, 0.3)',
                                animation: 'pulse 2s infinite'
                              }}
                            >
                              <Typography sx={{ color: 'white', fontSize: '16px', fontWeight: 'bold' }}>
                                ❤️
                              </Typography>
          </Box>
                          )}
                          <CardContent sx={{ p: 2, textAlign: 'center', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, fontSize: '1.1rem' }}>
                                {dream.name}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#666', mb: 1, lineHeight: 1.4, flexGrow: 1 }}>
                                {dream.description}
                              </Typography>
        </Box>
                            <Chip label={`🎯 ${dream.cost.toLocaleString()}`} size="small" color="primary" sx={{ mt: 'auto' }} />
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                      </Box>
              </Grid>

              {/* Нижняя часть - Игроки и управление */}
              <Grid item xs={12}>
                <Divider sx={{ my: 3 }} />
                
                {/* Список игроков */}
        <Box sx={{ mb: 3 }}>
                  <Typography variant="h5" sx={{ mb: 2, color: '#333', fontWeight: 'bold' }}>
                    👥 Игроки в комнате ({players.length})
          </Typography>
                  <Grid container spacing={2}>
                    {players.map((player, index) => (
                      <Grid item xs={12} sm={6} md={4} key={player.id}>
                        <Card sx={{ 
                          border: player.ready ? '2px solid #4caf50' : '1px solid #ddd',
                          background: player.ready ? 'rgba(76, 175, 80, 0.1)' : 'white'
                        }}>
                          <CardContent sx={{ p: 2, textAlign: 'center' }}>
                <Avatar sx={{
                  mx: 'auto',
                  mb: 1,
                              bgcolor: player.ready ? '#4caf50' : '#666',
                  width: 40,
                  height: 40
                }}>
                              {player.username?.[0] || '?'}
                </Avatar>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                              {player.username}
                </Typography>
                            {player.profession && (
                              <Chip 
                                label={player.profession.name} 
                                size="small" 
                                color="primary" 
                                sx={{ mb: 1 }}
                              />
                            )}
                            {player.ready && (
                              <Chip 
                                label="✅ Готов" 
                                size="small" 
                                color="success"
                              />
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
        </Box>

                {/* Кнопки управления */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {/* Кнопка готовности */}
        <Button
                    variant={isReady ? "contained" : "outlined"}
                    onClick={handleToggleReady}
                    size="large"
          sx={{
                      py: 2,
                      px: 4,
                      borderRadius: 2,
            fontSize: '1.1rem',
                      fontWeight: 'bold',
                      bgcolor: isReady ? '#4caf50' : 'transparent',
                      color: isReady ? 'white' : '#4caf50',
                      borderColor: '#4caf50',
            '&:hover': {
                        bgcolor: isReady ? '#45a049' : 'rgba(76, 175, 80, 0.1)',
            }
          }}
        >
                    {isReady ? '✅ Готов' : '🎯 Готов'}
        </Button>

                  {/* Кнопка старта */}
                        <Button
                          variant="contained"
                    onClick={handleStartGame}
                    disabled={!canStart}
                    size="large"
                          sx={{
                            py: 2,
                      px: 4,
                      borderRadius: 2,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      background: canStart 
                        ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)'
                        : '#ccc',
                            '&:hover': {
                        background: canStart 
                          ? 'linear-gradient(135deg, #45a049 0%, #388e3c 100%)'
                          : '#ccc',
                      }
                    }}
                  >
                    🚀 СТАРТ ИГРЫ
                        </Button>
                        
                  {/* Информация о готовности */}
                  {!canStart && (
                        <Box sx={{
                          p: 2,
                          borderRadius: 2,
                      background: 'rgba(255, 193, 7, 0.1)',
                      border: '1px solid #ffc107'
                    }}>
                      <Typography variant="body2" sx={{ color: '#f57c00' }}>
                        ⏳ Для старта игры нужно минимум 2 готовых игрока
                          </Typography>
                        </Box>
                  )}
        </Box>
              </Grid>
            </Grid>
      </Paper>
        </motion.div>
      </Box>

      {/* Уведомления */}
      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError('')}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
      >
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>

      {/* CSS анимация для пульсации сердечка */}
      <Box sx={{
        '@keyframes pulse': {
          '0%': {
            transform: 'scale(1)',
            opacity: 1
          },
          '50%': {
            transform: 'scale(1.1)',
            opacity: 0.8
          },
          '100%': {
            transform: 'scale(1)',
            opacity: 1
          }
        }
      }} />
    </Container>
  );
};

export default RoomSetup;



