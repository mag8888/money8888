import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  Avatar,
  Collapse,
  Stepper,
  Step,
  StepLabel,
  Alert
} from '@mui/material';
import { 
  Add as AddIcon, 
  Group as GroupIcon, 
  Settings as SettingsIcon,
  Person as PersonIcon,
  Create as CreateIcon,
  Work as WorkIcon,
  PlayArrow as PlayIcon,
  Favorite as HeartIcon
} from '@mui/icons-material';
import ProfessionSelector from './ProfessionSelector';
import DreamSelector from './DreamSelector';

const RoomManager = ({ socket, user, onGameStart }) => {
  const [rooms, setRooms] = useState([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedProfession, setSelectedProfession] = useState(null);
  const [selectedDream, setSelectedDream] = useState(null);
  
  // Диалог выбора мечты для обычных игроков
  const [dreamSelectionDialogOpen, setDreamSelectionDialogOpen] = useState(false);
  const [pendingRoomJoin, setPendingRoomJoin] = useState(null);
  const [playerDream, setPlayerDream] = useState(null);
  
  // Состояние игровой комнаты
  const [gameRoom, setGameRoom] = useState(null);
  const [inGame, setInGame] = useState(false);
  
  // Форма создания комнаты
  const [createForm, setCreateForm] = useState({
    roomName: '',
    maxPlayers: 4,
    isPrivate: false,
    password: '',
    obligatoryProfession: false
  });
  
  // Форма присоединения
  const [joinForm, setJoinForm] = useState({
    roomId: '',
    password: ''
  });

  const steps = ['Настройки комнаты', 'Выбор профессии', 'Выбор мечты', 'Готово'];

  useEffect(() => {
    if (socket) {
      // Получаем список комнат при загрузке
      socket.emit('get_rooms');
      
      // Слушаем обновления списка комнат
      socket.on('rooms_list', ({ rooms }) => {
        setRooms(rooms);
      });
      
      // Слушаем создание комнаты
      socket.on('room_created', ({ room, roomId }) => {
        console.log('🏠 Комната создана:', room);
        setCreateDialogOpen(false);
        setCurrentStep(0);
        setSelectedProfession(null);
        setSelectedDream(null);
        setCreateForm({ roomName: '', maxPlayers: 4, isPrivate: false, password: '', obligatoryProfession: false });
        // Обновляем список комнат
        socket.emit('get_rooms');
      });
      
      // Слушаем присоединение к комнате
      socket.on('room_joined', ({ room, roomId }) => {
        console.log('👤 Присоединился к комнате:', room);
        setJoinDialogOpen(false);
        setDreamSelectionDialogOpen(false);
        setJoinForm({ roomId: '', password: '' });
        // Можно перейти к настройке игрока
      });
      
      // Слушаем старт игры
      socket.on('game_started', ({ room }) => {
        console.log('🎮 Игра началась:', room);
        setGameRoom(room);
        setInGame(true);
        // Уведомляем родительский компонент о начале игры
        if (onGameStart) {
          onGameStart(room);
        }
      });
      
      // Слушаем ошибки
      socket.on('room_error', ({ message }) => {
        alert(`Ошибка: ${message}`);
      });
      
      // Слушаем обновления комнаты
      socket.on('player_joined', ({ player, room }) => {
        console.log('👤 Новый игрок присоединился:', player);
        socket.emit('get_rooms');
      });
      
      socket.on('player_left', ({ userId, room }) => {
        console.log('👤 Игрок вышел:', userId);
        socket.emit('get_rooms');
      });
      
      // Слушаем обновления данных комнаты
      socket.on('roomData', ({ room }) => {
        console.log('🏠 Обновленные данные комнаты:', room);
        // Обновляем список комнат
        socket.emit('get_rooms');
      });
    }
    
    return () => {
      if (socket) {
        socket.off('rooms_list');
        socket.off('room_created');
        socket.off('room_joined');
        socket.off('game_started');
        socket.off('room_error');
        socket.off('player_joined');
        socket.off('player_left');
      }
    };
  }, [socket, onGameStart]);

  const handleCreateRoom = () => {
    if (!createForm.roomName.trim()) {
      alert('Введите название комнаты');
      return;
    }
    
    if (createForm.isPrivate && !createForm.password.trim()) {
      alert('Для приватной комнаты необходимо указать пароль');
      return;
    }
    
    if (createForm.obligatoryProfession && !selectedProfession) {
      alert('Выберите профессию для всех игроков');
      return;
    }
    
    if (!selectedDream) {
      alert('Выберите свою мечту');
      return;
    }
    
    if (!user || !user.id || !user.username) {
      alert('Пользователь не авторизован');
      return;
    }
    
    socket.emit('create_room', {
      roomName: createForm.roomName,
      maxPlayers: createForm.maxPlayers,
      isPrivate: createForm.isPrivate,
      password: createForm.isPrivate ? createForm.password : '',
      obligatoryProfession: createForm.obligatoryProfession,
      selectedProfession: createForm.obligatoryProfession ? selectedProfession : null,
      hostDream: selectedDream,
      userId: user.id,
      username: user.username
    });
  };

  const handleJoinRoom = () => {
    if (!joinForm.roomId.trim()) {
      alert('Введите ID комнаты');
      return;
    }
    
    if (!user || !user.id || !user.username) {
      alert('Пользователь не авторизован');
      return;
    }
    
    // Сохраняем данные для присоединения и открываем диалог выбора мечты
    setPendingRoomJoin({
      roomId: joinForm.roomId,
      password: joinForm.password
    });
    setDreamSelectionDialogOpen(true);
    setJoinDialogOpen(false);
  };

  const handleJoinRoomById = (roomId) => {
    if (!user || !user.id || !user.username) {
      alert('Пользователь не авторизован');
      return;
    }
    
    // Если комната приватная, нужно ввести пароль
    const room = rooms.find(r => r.id === roomId);
    if (room && room.isPrivate) {
      const password = prompt('Введите пароль для входа в приватную комнату:');
      if (!password) return;
      
      setPendingRoomJoin({
        roomId,
        password
      });
      setDreamSelectionDialogOpen(true);
    } else {
      setPendingRoomJoin({
        roomId,
        password: ''
      });
      setDreamSelectionDialogOpen(true);
    }
  };

  const handlePlayerDreamSelect = (dream) => {
    setPlayerDream(dream);
  };

  const handleConfirmDreamAndJoin = () => {
    if (!playerDream) {
      alert('Выберите свою мечту');
      return;
    }
    
    if (!pendingRoomJoin) {
      alert('Ошибка: данные для присоединения не найдены');
      return;
    }
    
    // Присоединяемся к комнате с выбранной мечтой
    socket.emit('join_room', {
      roomId: pendingRoomJoin.roomId,
      password: pendingRoomJoin.password,
      userId: user.id,
      username: user.username,
      dream: playerDream
    });
    
    // Закрываем диалоги и сбрасываем состояние
    setDreamSelectionDialogOpen(false);
    setPendingRoomJoin(null);
    setPlayerDream(null);
  };

  const handleStartGame = (roomId) => {
    if (!user || !user.id) {
      alert('Пользователь не авторизован');
      return;
    }
    
    socket.emit('start_game', {
      roomId,
      userId: user.id
    });
  };

  const handlePlayerReady = (roomId) => {
    if (!user || !user.id) {
      alert('Пользователь не авторизован');
      return;
    }
    
    socket.emit('player_ready', {
      roomId,
      userId: user.id
    });
  };

  const refreshRooms = () => {
    socket.emit('get_rooms');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  const handleNextStep = () => {
    if (currentStep === 0) {
      // Проверяем, что заполнены обязательные поля
      if (!createForm.roomName.trim()) {
        alert('Введите название комнаты');
        return;
      }
      setCurrentStep(1);
    } else if (currentStep === 1) {
      if (createForm.obligatoryProfession && !selectedProfession) {
        alert('Выберите профессию для всех игроков');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!selectedDream) {
        alert('Выберите свою мечту');
        return;
      }
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleProfessionSelect = (profession) => {
    setSelectedProfession(profession);
  };

  const handleDreamSelect = (dream) => {
    setSelectedDream(dream);
  };

  const renderCreateRoomStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <TextField
              autoFocus
              margin="dense"
              label="Название комнаты"
              fullWidth
              variant="outlined"
              value={createForm.roomName}
              onChange={(e) => setCreateForm({ ...createForm, roomName: e.target.value })}
              sx={{ mb: 2 }}
            />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Максимум игроков</InputLabel>
              <Select
                value={createForm.maxPlayers}
                label="Максимум игроков"
                onChange={(e) => setCreateForm({ ...createForm, maxPlayers: e.target.value })}
              >
                <MenuItem value={2}>2 игрока</MenuItem>
                <MenuItem value={3}>3 игрока</MenuItem>
                <MenuItem value={4}>4 игрока</MenuItem>
                <MenuItem value={6}>6 игроков</MenuItem>
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Switch
                  checked={createForm.isPrivate}
                  onChange={(e) => setCreateForm({ ...createForm, isPrivate: e.target.checked, password: '' })}
                />
              }
              label="Приватная комната"
              sx={{ mb: 2 }}
            />
            
            {/* Поле пароля - появляется только для приватных комнат */}
            <Collapse in={createForm.isPrivate}>
              <TextField
                margin="dense"
                label="Пароль"
                type="password"
                fullWidth
                variant="outlined"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                sx={{ mb: 2 }}
                required={createForm.isPrivate}
                error={createForm.isPrivate && !createForm.password.trim()}
                helperText={createForm.isPrivate && !createForm.password.trim() ? 'Пароль обязателен для приватной комнаты' : ''}
              />
            </Collapse>
            
            <FormControlLabel
              control={
                <Switch
                  checked={createForm.obligatoryProfession}
                  onChange={(e) => setCreateForm({ ...createForm, obligatoryProfession: e.target.checked })}
                />
              }
              label="Одинаковая профессия для всех игроков"
            />
          </>
        );
      
      case 1:
        return (
          <ProfessionSelector
            onProfessionSelect={handleProfessionSelect}
            selectedProfession={selectedProfession}
            isObligatory={createForm.obligatoryProfession}
          />
        );
      
      case 2:
        return (
          <DreamSelector
            onDreamSelect={handleDreamSelect}
            selectedDream={selectedDream}
            isHost={true}
          />
        );
      
      case 3:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h5" gutterBottom color="success.main">
              ✅ Комната готова к созданию!
            </Typography>
            
            <Box sx={{ mt: 3, textAlign: 'left' }}>
              <Typography variant="h6" gutterBottom>Настройки комнаты:</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Название:</strong> {createForm.roomName}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Максимум игроков:</strong> {createForm.maxPlayers}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Приватная:</strong> {createForm.isPrivate ? 'Да' : 'Нет'}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Одинаковая профессия:</strong> {createForm.obligatoryProfession ? 'Да' : 'Нет'}
              </Typography>
              
              {createForm.obligatoryProfession && selectedProfession && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Выбранная профессия:</strong> {selectedProfession.name}
                </Typography>
              )}
              
              {selectedDream && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Ваша мечта:</strong> {selectedDream.name}
                </Typography>
              )}
            </Box>
          </Box>
        );
      
      default:
        return null;
    }
  };

  // Если игра началась, показываем сообщение о переходе
  if (inGame && gameRoom) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom color="success.main">
          🎮 Игра началась!
        </Typography>
        <Typography variant="h6" gutterBottom>
          Комната: {gameRoom.name}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Переходим к игровому полю...
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            setInGame(false);
            setGameRoom(null);
          }}
        >
          Вернуться к комнатам
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
        🏠 Управление комнатами
      </Typography>
      
      {/* Кнопки действий */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, justifyContent: 'center' }}>
        <Button
          variant="contained"
          startIcon={<CreateIcon />}
          onClick={() => setCreateDialogOpen(true)}
          size="large"
        >
          Создать комнату
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<GroupIcon />}
          onClick={() => setJoinDialogOpen(true)}
          size="large"
        >
          Присоединиться по ID
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<SettingsIcon />}
          onClick={refreshRooms}
          size="large"
        >
          Обновить список
        </Button>
      </Box>
      
      {/* Список комнат */}
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Доступные комнаты ({rooms.length})
      </Typography>
      
      {rooms.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 4 }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary">
              🏠 Комнат пока нет
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Создайте первую комнату или подождите, пока кто-то создаст
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {rooms.map((room) => {
            // Безопасная проверка массива игроков
            const players = Array.isArray(room.players) ? room.players : [];
            const isHost = players.some(p => p.id === user?.id && p.isHost);
            const isPlayer = players.some(p => p.id === user?.id);
            const isReady = players.find(p => p.id === user?.id)?.ready || false;
            const allPlayersReady = players.length >= 2 && players.every(p => p.ready);
            const canStartGame = isHost && allPlayersReady; // Хост может стартовать только когда все готовы
            
            return (
              <Grid item xs={12} md={6} lg={4} key={room.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 4 },
                    border: room.status === 'playing' ? '2px solid #4caf50' : '1px solid #e0e0e0'
                  }}
                  onClick={() => setSelectedRoom(room)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                        {room.name}
                      </Typography>
                      <Chip 
                        label={room.status === 'playing' ? '🎮 Игра' : '⏳ Ожидание'} 
                        color={room.status === 'playing' ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <GroupIcon sx={{ mr: 1, fontSize: 20 }} />
                      <Typography variant="body2">
                        {Array.isArray(players) ? players.length : 0}/{room.maxPlayers} игроков
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PersonIcon sx={{ mr: 1, fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary">
                        ID: {room.id}
                      </Typography>
                    </Box>
                    
                    <Typography variant="caption" color="text.secondary" display="block">
                      Создана: {formatDate(room.createdAt)}
                    </Typography>
                    
                    {room.isPrivate && (
                      <Chip label="🔒 Приватная" size="small" sx={{ mt: 1 }} />
                    )}
                    
                    {/* Показываем мечту хоста если есть */}
                    {room.hostDream && (
                      <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Мечта хоста: {room.hostDream.name}
                        </Typography>
                      </Box>
                    )}
                    
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      {/* Кнопка присоединения для новых игроков */}
                      {!isPlayer && (
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJoinRoomById(room.id);
                          }}
                          disabled={Array.isArray(room.players) && room.players.length >= room.maxPlayers}
                        >
                          {Array.isArray(room.players) && room.players.length >= room.maxPlayers ? 'Комната заполнена' : 'Присоединиться'}
                        </Button>
                      )}
                      
                      {/* Кнопка готовности для игроков в комнате */}
                      {isPlayer && !isHost && (
                        <Button
                          variant={isReady ? "outlined" : "contained"}
                          color={isReady ? "success" : "primary"}
                          fullWidth
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isReady) {
                              handlePlayerReady(room.id);
                            }
                          }}
                          disabled={isReady}
                        >
                          {isReady ? 'Готов ✓' : 'Готов'}
                        </Button>
                      )}
                      
                      {/* Кнопка старта для хоста */}
                      {isHost && (
                        <Button
                          variant="outlined"
                          startIcon={<PlayIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartGame(room.id);
                          }}
                          disabled={!canStartGame}
                          sx={{ minWidth: 'auto' }}
                        >
                          Старт
                        </Button>
                      )}
                    </Box>
                    
                    {/* Уведомление о готовности игроков */}
                    {isPlayer && (
                      <Alert severity="info" sx={{ mt: 2, fontSize: '0.75rem' }}>
                        {allPlayersReady ? 'Все игроки готовы! Хост может запустить игру.' : `${players.filter(p => p.ready).length}/${players.length} игроков готово`}
                      </Alert>
                    )}
                    
                    {/* Уведомление о возможности старта */}
                    {isHost && (
                      <Alert severity="info" sx={{ mt: 2, fontSize: '0.75rem' }}>
                        Хост может запустить игру в любое время
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
      
      {/* Диалог создания комнаты */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CreateIcon sx={{ mr: 1 }} />
            Создать новую комнату
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {/* Stepper */}
          <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {/* Содержимое шага */}
          {renderCreateRoomStep()}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => {
            setCreateDialogOpen(false);
            setCurrentStep(0);
            setSelectedProfession(null);
            setSelectedDream(null);
          }}>
            Отмена
          </Button>
          
          {currentStep > 0 && (
            <Button onClick={handlePrevStep}>
              Назад
            </Button>
          )}
          
          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNextStep} variant="contained">
              Далее
            </Button>
          ) : (
            <Button onClick={handleCreateRoom} variant="contained">
              Создать комнату
            </Button>
          )}
        </DialogActions>
      </Dialog>
      
      {/* Диалог присоединения по ID */}
      <Dialog open={joinDialogOpen} onClose={() => setJoinDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>👤 Присоединиться к комнате</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="ID комнаты"
            fullWidth
            variant="outlined"
            value={joinForm.roomId}
            onChange={(e) => setJoinForm({ ...joinForm, roomId: e.target.value })}
            placeholder="Введите ID комнаты"
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Пароль (если комната приватная)"
            type="password"
            fullWidth
            variant="outlined"
            value={joinForm.password}
            onChange={(e) => setJoinForm({ ...joinForm, password: e.target.value })}
            placeholder="Введите пароль, если комната приватная"
            sx={{ mb: 2 }}
          />
          
          <Typography variant="body2" color="text.secondary">
            ID комнаты можно получить у создателя комнаты или из списка выше
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJoinDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleJoinRoom} variant="contained">
            Присоединиться
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Диалог выбора мечты для игрока */}
      <Dialog open={dreamSelectionDialogOpen} onClose={() => setDreamSelectionDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <HeartIcon sx={{ mr: 1 }} />
            Выберите свою мечту
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Каждый игрок должен выбрать свою мечту перед началом игры. 
            Ваша мечта будет отображаться в игре и может повлиять на игровой процесс.
          </Typography>
          
          <DreamSelector
            onDreamSelect={handlePlayerDreamSelect}
            selectedDream={playerDream}
            isHost={false}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDreamSelectionDialogOpen(false)}>
            Отмена
          </Button>
          <Button 
            onClick={handleConfirmDreamAndJoin}
            variant="contained"
            disabled={!playerDream}
            startIcon={<HeartIcon />}
          >
            Подтвердить и присоединиться
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Диалог информации о комнате */}
      <Dialog open={!!selectedRoom} onClose={() => setSelectedRoom(null)} maxWidth="md" fullWidth>
        {selectedRoom && (
          <>
            <DialogTitle>🏠 {selectedRoom.name}</DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Информация о комнате</Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>ID:</strong> {selectedRoom.id}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Статус:</strong> {selectedRoom.status === 'playing' ? '🎮 Игра' : '⏳ Ожидание'}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Игроков:</strong> {(() => {
                      const players = Array.isArray(selectedRoom.players) ? selectedRoom.players : [];
                      return players.length;
                    })()}/{selectedRoom.maxPlayers}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Создана:</strong> {formatDate(selectedRoom.createdAt)}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Приватная:</strong> {selectedRoom.isPrivate ? 'Да' : 'Нет'}
                  </Typography>
                  
                  {/* Показываем мечту хоста */}
                  {selectedRoom.hostDream && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Мечта хоста:</strong> {selectedRoom.hostDream.name}
                    </Typography>
                  )}
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Игроки</Typography>
                  {(() => {
                    const players = Array.isArray(selectedRoom.players) ? selectedRoom.players : [];
                    return players.length > 0 ? (
                      players.map((player, index) => (
                        <Box key={player.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar sx={{ mr: 1, bgcolor: player.isHost ? '#ff9800' : '#2196f3' }}>
                            {player.isHost ? '👑' : '👤'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {player.username}
                              {player.isHost && ' (Хост)'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {player.profession || 'Профессия не выбрана'}
                            </Typography>
                            {player.dream && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                Мечта: {player.dream.name}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Игроков пока нет
                      </Typography>
                    );
                  })()}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedRoom(null)}>Закрыть</Button>
              <Button 
                onClick={() => {
                  handleJoinRoomById(selectedRoom.id);
                  setSelectedRoom(null);
                }}
                variant="contained"
                disabled={(() => {
                  const players = Array.isArray(selectedRoom.players) ? selectedRoom.players : [];
                  return players.length >= selectedRoom.maxPlayers;
                })()}
              >
                {(() => {
                  const players = Array.isArray(selectedRoom.players) ? selectedRoom.players : [];
                  return players.length >= selectedRoom.maxPlayers ? 'Комната заполнена' : 'Присоединиться';
                })()}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default RoomManager;
