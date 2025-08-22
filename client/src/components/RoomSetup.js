import React, { useState, useEffect } from 'react';
import socket from '../socket';
import { motion } from 'framer-motion';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  Paper, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent
} from '@mui/material';
import Check from '@mui/icons-material/Check';
import { useLogout } from '../hooks/useLogout';
import ExitConfirmModal from './ExitConfirmModal';
import { useNavigate } from 'react-router-dom';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

const RoomSetup = ({ user, roomId, onSetupComplete, onBack, onGameStarted, onExit }) => {
  const [inputRoomId, setInputRoomId] = useState(roomId || '');
  const [username, setUsername] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [players, setPlayers] = useState([]);
  const [myReady, setMyReady] = useState(false);
  const [hostId, setHostId] = useState(null);
  const [starting, setStarting] = useState(false);
  const [readySound] = useState(new Audio('/ready-sound.mp3'));
  const [allReady, setAllReady] = useState(false);
  const [exitModalOpen, setExitModalOpen] = useState(false);
  const navigate = useNavigate();

  // Используем централизованный хук для выхода
  const { logout } = useLogout();

  // Функция для выхода из комнаты
  const handleExitRoom = () => {
    console.log('🔄 [RoomSetup] Exit room confirmed');
    setExitModalOpen(false);
    
    // Используем централизованный хук
    if (onExit) {
      onExit();
    } else {
      logout(roomId, 'setup_exit');
    }
  };

  useEffect(() => {
    // Получаем данные игроков
    socket.on('playersUpdate', setPlayers);
    socket.on('playersList', setPlayers);
    
    // Получаем данные комнаты
    socket.on('roomData', (data) => {
      setHostId(data.hostId);
      setMaxPlayers(data.maxPlayers || 2);
    });
    
    // Обработка кика
    socket.on('kicked', ({ roomId: kickedRoom }) => {
      if (kickedRoom === roomId) {
        onBack();
      }
    });
    
    // Обработка старта игры
    socket.on('gameStarted', () => {
      setStarting(false);
      if (onSetupComplete) onSetupComplete();
      if (onGameStarted) onGameStarted();
    });
    
    // Обработчик успешного выхода из комнаты - теперь управляется централизованно в App.js

    return () => {
      socket.off('playersUpdate');
      socket.off('playersList');
      socket.off('roomData');
      socket.off('kicked');
      socket.off('gameStarted');
      // leftRoom теперь обрабатывается централизованно в App.js
    };
  }, [roomId, onBack, onSetupComplete, onGameStarted]);

    // Регистрируем текущего пользователя в комнате при монтировании
  useEffect(() => {
    if (!roomId) return; // Не регистрируемся, если нет ID комнаты
    
    console.log('🔄 [RoomSetup] Connecting to room:', roomId);
    
    // Используем простой уникальный ID для каждого браузера
    let playerId = localStorage.getItem('cashflow_playerId');
    if (!playerId) {
      // Генерируем простой ID на основе времени
      playerId = `P${Date.now().toString().slice(-6)}`;
      localStorage.setItem('cashflow_playerId', playerId);
    }
    
    // Создаем объект игрока с простым ID
    const playerData = {
      id: playerId,
      username: `Игрок ${playerId.slice(-4)}`,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      isFixedId: true,
      balance: 2000,
      passiveIncome: 0,
      position: 0,
      isFastTrack: false
    };
    
    setUsername(playerData.username);
    
    // Подключаемся к комнате
    socket.emit('setupPlayer', roomId, playerData);
    socket.emit('getPlayers', roomId);
    socket.emit('getRoom', roomId);
    
    // Воспроизводим звук входа в комнату
    setTimeout(() => {
      try {
        readySound.currentTime = 0;
        readySound.volume = 0.3;
        readySound.play().catch(err => {
          console.log('Не удалось воспроизвести звук входа:', err);
        });
      } catch (err) {
        console.log('Ошибка воспроизведения звука входа:', err);
      }
    }, 500);
  }, [roomId]);

  // Обновляем статус готовности и воспроизводим звук
  useEffect(() => {
    const me = players.find(p => p.id === socket.id);
    if (me) {
      setMyReady(me.ready);
    }
    
    // Проверяем, все ли игроки готовы
    const readyPlayers = players.filter(p => p.ready);
    const wasAllReady = allReady;
    const isAllReady = readyPlayers.length >= 2 && readyPlayers.length === players.length;
    
    // Если все стали готовы и раньше не были - воспроизводим звук
    if (isAllReady && !wasAllReady && players.length >= 2) {
      setAllReady(true);
      playReadySound();
    } else if (!isAllReady) {
      setAllReady(false);
    }
  }, [players, allReady]);

  // Синхронизируем выбранное количество игроков с сервером
  useEffect(() => {
    if (roomId && maxPlayers) {
      socket.emit('setMaxPlayers', roomId, maxPlayers);
    }
  }, [roomId, maxPlayers]);

  const handleToggleReady = () => {
    socket.emit('toggleReady', roomId);
    setMyReady(!myReady);
    
    // Воспроизводим звук при изменении статуса готовности
    try {
      readySound.currentTime = 0;
      readySound.volume = 0.5;
      readySound.play().catch(err => {
        console.log('Не удалось воспроизвести звук готовности:', err);
      });
    } catch (err) {
      console.log('Ошибка воспроизведения звука готовности:', err);
    }
  };

  const handleStartGame = () => {
    setStarting(true);
    
    // Воспроизводим звук старта игры
    try {
      readySound.currentTime = 0;
      readySound.volume = 0.8;
      readySound.play().catch(err => {
        console.log('Не удалось воспроизвести звук старта:', err);
      });
    } catch (err) {
      console.log('Ошибка воспроизведения звука старта:', err);
    }
    
    socket.emit('startGame', roomId, (ok, reason) => {
      if (ok) {
        onSetupComplete && onSetupComplete();
        onGameStarted && onGameStarted();
      } else {
        setStarting(false);
        console.warn('startGame rejected', reason);
      }
    });
  };

  const handleUsernameChange = (e) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    socket.emit('updateUsername', roomId, newUsername);
  };

  // Функция воспроизведения звука готовности
  const playReadySound = () => {
    try {
      readySound.currentTime = 0; // Сбрасываем время воспроизведения
      readySound.volume = 0.7; // Устанавливаем громкость
      readySound.play().catch(err => {
        console.log('Не удалось воспроизвести звук:', err);
      });
    } catch (err) {
      console.log('Ошибка воспроизведения звука:', err);
    }
  };

  const handleRatingsClick = () => {
    navigate('/ratings');
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      p: 4,
      pt: 6
    }}>
      {/* Заголовок */}
      <Typography variant="h4" sx={{ 
        color: 'white', 
        mb: 4, 
        fontWeight: 'bold', 
        textAlign: 'center',
        textShadow: '0 2px 4px rgba(0,0,0,0.5)'
      }}>
        ⚙️ Настройка партии
      </Typography>

      {/* Основная форма */}
      <Paper elevation={6} sx={{
        p: 3,
        width: '100%',
        maxWidth: 400,
        background: 'rgba(255,255,255,0.95)',
        borderRadius: 3,
        mb: 4
      }}>
                    {/* ID комнаты */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ 
                        color: '#1976d2', 
                        fontWeight: 'bold',
                        mb: 1,
                        textAlign: 'center'
                      }}>
                        🎯 ID комнаты
                      </Typography>
                      <TextField
                        fullWidth
                        variant="outlined"
                        value={inputRoomId}
                        onChange={(e) => setInputRoomId(e.target.value)}
                        placeholder="Введите ID комнаты"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            border: '3px solid #2196f3',
                            borderRadius: 3,
                            bgcolor: '#e3f2fd',
                            '&:hover': {
                              borderColor: '#1976d2',
                              boxShadow: '0 4px 12px rgba(33, 150, 243, 0.4)'
                            },
                            '&.Mui-focused': {
                              borderColor: '#1565c0',
                              boxShadow: '0 4px 12px rgba(33, 150, 243, 0.5)'
                            }
                          },
                          '& .MuiOutlinedInput-input': {
                            textAlign: 'center',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            color: '#1565c0'
                          }
                        }}
                      />
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => {
                          if (inputRoomId.trim()) {
                            const newRoomId = inputRoomId.trim();
                            console.log('🔄 [RoomSetup] Connecting to room:', newRoomId);
                            if (onSetupComplete) {
                              onSetupComplete({ roomId: newRoomId });
                            }
                          }
                        }}
                        disabled={!inputRoomId.trim()}
                        sx={{
                          mt: 2,
                          bgcolor: '#2196f3',
                          '&:hover': {
                            bgcolor: '#1976d2'
                          },
                          '&:disabled': {
                            bgcolor: '#ccc'
                          }
                        }}
                      >
                        🚀 Подключиться к комнате
                      </Button>
                    </Box>

                            {/* Имя пользователя */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ 
                        color: '#4CAF50', 
                        fontWeight: 'bold',
                        mb: 1,
                        textAlign: 'center'
                      }}>
                        👤 Ваше имя
                      </Typography>
                      <Box sx={{
                        bgcolor: '#e8f5e8',
                        border: '3px solid #4CAF50',
                        borderRadius: 3,
                        p: 1,
                        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: -2,
                          left: -2,
                          right: -2,
                          bottom: -2,
                          background: 'linear-gradient(45deg, #4CAF50, #81C784, #4CAF50)',
                          borderRadius: 3,
                          zIndex: -1,
                          opacity: 0.3
                        }
                      }}>
                        <TextField
                          fullWidth
                          value={username}
                          onChange={handleUsernameChange}
                          variant="standard"
                          sx={{
                            '& .MuiInput-underline:before': { borderBottom: 'none' },
                            '& .MuiInput-underline:after': { borderBottom: 'none' },
                            '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottom: 'none' }
                          }}
                          InputProps={{
                            sx: { 
                              color: '#2E7D32', 
                              fontWeight: 'bold',
                              fontSize: '1.1rem',
                              textAlign: 'center'
                            }
                          }}
                        />
                      </Box>
                    </Box>

                            {/* Количество игроков */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ 
                        color: '#FF9800', 
                        fontWeight: 'bold',
                        mb: 1,
                        textAlign: 'center'
                      }}>
                        👥 Количество игроков
                      </Typography>
                      <Box sx={{
                        bgcolor: '#fff3e0',
                        border: '3px solid #FF9800',
                        borderRadius: 3,
                        p: 1,
                        boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)',
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: -2,
                          left: -2,
                          right: -2,
                          bottom: -2,
                          background: 'linear-gradient(45deg, #FF9800, #FFB74D, #FF9800)',
                          borderRadius: 3,
                          zIndex: -1,
                          opacity: 0.3
                        }
                      }}>
                        <FormControl fullWidth>
                          <Select
                            value={maxPlayers}
                            onChange={(e) => setMaxPlayers(e.target.value)}
                            variant="standard"
                            sx={{ 
                              color: '#E65100', 
                              fontWeight: 'bold',
                              fontSize: '1.1rem',
                              textAlign: 'center',
                              '& .MuiSelect-standard:before': { borderBottom: 'none' },
                              '& .MuiSelect-standard:after': { borderBottom: 'none' },
                              '& .MuiSelect-standard:hover:not(.Mui-disabled):before': { borderBottom: 'none' }
                            }}
                          >
                            {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                              <MenuItem key={num} value={num} sx={{ 
                                color: '#E65100',
                                fontWeight: 'bold',
                                justifyContent: 'center'
                              }}>
                                {num} {num === 1 ? 'игрок' : num < 5 ? 'игрока' : 'игроков'}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                    </Box>

        {/* Слоты игроков */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
          gap: 2,
          mb: 3
        }}>
          {Array.from({ length: maxPlayers }).map((_, idx) => {
            const player = players.find(p => p.seat === idx);
            const occupied = Boolean(player);
            return (
              <Paper key={idx} sx={{
                p: 1.5,
                textAlign: 'center',
                bgcolor: occupied ? 'primary.main' : 'grey.100',
                borderRadius: 2,
                border: occupied ? '2px solid #4CAF50' : '2px solid transparent',
                transition: 'all 0.3s ease'
              }}>
                <Avatar sx={{
                  mx: 'auto',
                  mb: 1,
                  bgcolor: occupied ? 'white' : 'grey.400',
                  color: occupied ? 'primary.main' : 'grey.600',
                  width: 40,
                  height: 40
                }}>
                  {occupied ? (player.username?.[0] || '?') : idx + 1}
                </Avatar>
                <Typography variant="caption" sx={{
                  color: occupied ? 'white' : '#333',
                  fontWeight: occupied ? 'bold' : 'bold',
                  fontSize: '0.75rem'
                }}>
                  {occupied ? player.username : `Свободно`}
                </Typography>
                {occupied && (
                  <Box sx={{ mt: 1 }}>
                    <Check sx={{ color: 'white', fontSize: 16 }} />
                  </Box>
                )}
              </Paper>
            );
          })}
        </Box>

        {/* Кнопка готовности */}
        <Button
          variant="contained"
          fullWidth
          sx={{
            mb: 2,
            bgcolor: myReady ? '#4CAF50' : '#FFD700',
            color: myReady ? 'white' : 'black',
            borderRadius: 3,
            py: 1.5,
            fontWeight: 'bold',
            fontSize: '1.1rem',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 4
            }
          }}
          onClick={handleToggleReady}
        >
          {myReady ? '✓ Готов' : '🎯 Готов'}
        </Button>

                            {/* Индикация "Все готовы" */}
                    {allReady && players.length >= 2 && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                      >
                        <Box sx={{
                          mb: 2,
                          p: 2,
                          bgcolor: 'rgba(76, 175, 80, 0.1)',
                          border: '2px solid #4CAF50',
                          borderRadius: 3,
                          textAlign: 'center'
                        }}>
                          <Typography variant="h6" sx={{
                            color: '#4CAF50',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1
                          }}>
                            🎉 Все игроки готовы! 🎉
                          </Typography>
                        </Box>
                      </motion.div>
                    )}

                    {/* Кнопка старта игры */}
                    {(user?.isAdmin || hostId === socket.id) && players.filter(p => p.ready).length >= 2 && (
                      <Button
                        disabled={starting}
                        variant="contained"
                        fullWidth
                        sx={{
                          mb: 2,
                          bgcolor: '#4CAF50',
                          color: 'white',
                          borderRadius: 3,
                          py: 1.5,
                          fontWeight: 'bold',
                          fontSize: '1.1rem',
                          opacity: starting ? 0.7 : 1,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 4
                          }
                        }}
                        onClick={handleStartGame}
                      >
                        {starting ? '🚀 Запуск...' : `🚀 Старт игры (${players.filter(p => p.ready).length}/${players.length} готовы)`}
                      </Button>
                    )}

        {/* Кнопки управления */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          {/* Кнопка выхода из игры */}
          <Button
            variant="contained"
            sx={{
              flex: 1,
              bgcolor: '#f44336',
              color: 'white',
              borderRadius: 3,
              py: 1.5,
              fontWeight: 'bold',
              '&:hover': {
                bgcolor: '#d32f2f',
              }
            }}
            onClick={() => setExitModalOpen(true)}
          >
            🚪 Выйти
          </Button>
          
          {/* Кнопка назад */}
          <Button
            variant="outlined"
            sx={{
              flex: 1,
              color: 'primary.main',
              borderRadius: 3,
              py: 1.5,
              fontWeight: 'bold',
              borderColor: 'primary.main',
              '&:hover': {
                borderColor: 'primary.dark',
                bgcolor: 'rgba(25, 118, 210, 0.04)'
              }
            }}
            onClick={onBack}
          >
            ← Назад
          </Button>
        </Box>
      </Paper>

      {/* Список игроков в комнате */}
      <Box sx={{ width: '100%', maxWidth: 400 }}>
        <Typography variant="h6" sx={{
          color: 'white',
          mb: 2,
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          👥 Игроки в комнате
        </Typography>
        <List sx={{
          bgcolor: 'rgba(255,255,255,0.1)',
          borderRadius: 2,
          p: 1
        }}>
          {players.map((player, index) => (
            <ListItem key={player.id} sx={{
              mb: 1,
              bgcolor: 'rgba(255,255,255,0.05)',
              borderRadius: 1,
              border: player.ready ? '2px solid #4CAF50' : '2px solid transparent'
            }}>
              <ListItemIcon>
                <Avatar sx={{
                  bgcolor: player.ready ? '#4CAF50' : '#FF5722',
                  width: 32,
                  height: 32
                }}>
                  {player.username?.[0] || '?'}
                </Avatar>
              </ListItemIcon>
              <ListItemText
                primary={player.username}
                secondary={player.ready ? 'Готов' : 'Не готов'}
                sx={{
                  '& .MuiListItemText-primary': { color: 'white', fontWeight: 'bold' },
                  '& .MuiListItemText-secondary': { color: player.ready ? '#4CAF50' : '#FF5722' }
                }}
              />
              {player.ready && <Check sx={{ color: '#4CAF50' }} />}
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Кнопка рейтингов */}
      <Button
        variant="outlined"
        fullWidth
        sx={{
          mb: 2,
          bgcolor: '#FFD700',
          color: '#FFD700',
          borderRadius: 3,
          py: 1.5,
          fontWeight: 'bold',
          fontSize: '1.1rem',
          transition: 'all 0.3s ease',
          '&:hover': {
            bgcolor: '#FFA500',
            backgroundColor: 'rgba(255, 215, 0, 0.1)'
          }
        }}
        onClick={handleRatingsClick}
      >
        <EmojiEventsIcon sx={{ mr: 1 }} /> Рейтинги
      </Button>

      {/* Exit Game Modal */}
      <ExitConfirmModal
        open={exitModalOpen}
        onClose={() => setExitModalOpen(false)}
        onConfirm={handleExitRoom}
      />
    </Box>
  );
};

export default RoomSetup;

