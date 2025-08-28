import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  Fab
} from '@mui/material';
import {
  Group as GroupIcon,
  PlayArrow as PlayIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  EmojiEvents as TrophyIcon,
  Work as WorkIcon,
  Star as StarIcon,
  CheckCircle as CheckIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import socket from '../socket';
import ProfessionModal from './ProfessionModal';

const GameLobby = ({ roomId, onStartGame, onExitGame }) => {
  const [roomData, setRoomData] = useState(null);
  const [players, setPlayers] = useState([]);
  const [username, setUsername] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [showProfessionModal, setShowProfessionModal] = useState(false);
  const [selectedProfession, setSelectedProfession] = useState(null);
  const [gameReady, setGameReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (roomId && socket.connected) {
      loadRoomData();
      loadPlayers();
      
      // Слушаем обновления
      socket.on('roomUpdate', handleRoomUpdate);
      socket.on('playersUpdate', handlePlayersUpdate);
      socket.on('gameStarting', handleGameStarting);
      
      return () => {
        socket.off('roomUpdate');
        socket.off('playersUpdate');
        socket.off('gameStarting');
      };
    }
  }, [roomId, socket.connected]);

  const loadRoomData = async () => {
    try {
      setLoading(true);
      socket.emit('getRoom', roomId);
    } catch (err) {
      setError('Ошибка загрузки данных комнаты');
    }
  };

  const loadPlayers = async () => {
    try {
      socket.emit('getPlayers', roomId);
    } catch (err) {
      setError('Ошибка загрузки списка игроков');
    }
  };

  const handleRoomUpdate = (room) => {
    console.log('🏠 [GameLobby] Room update:', room);
    setRoomData(room);
    setIsHost(room.hostId === socket.id);
    setLoading(false);
  };

  const handlePlayersUpdate = (updatedPlayers) => {
    console.log('👥 [GameLobby] Players update:', updatedPlayers);
    setPlayers(updatedPlayers);
    
    // Проверяем, готовы ли все игроки к игре
    const allReady = updatedPlayers.length >= 2 && 
                    updatedPlayers.every(p => p.profession && p.dream);
    setGameReady(allReady);
  };

  const handleGameStarting = () => {
    console.log('🚀 [GameLobby] Game starting!');
    if (onStartGame) {
      onStartGame();
    }
  };

  const handleJoinRoom = async () => {
    if (!username.trim()) {
      setError('Введите имя пользователя');
      return;
    }

    try {
      setIsJoining(true);
      setError('');
      
      // Присоединяемся к комнате
      socket.emit('joinRoom', roomId, username.trim());
      
      // Показываем модальное окно выбора профессии
      setShowProfessionModal(true);
      
    } catch (err) {
      setError('Ошибка присоединения к комнате');
    } finally {
      setIsJoining(false);
    }
  };

  const handleProfessionSelect = (professionData) => {
    console.log('💼 [GameLobby] Profession selected:', professionData);
    setSelectedProfession(professionData);
    
    // Отправляем данные профессии на сервер
    socket.emit('setPlayerProfession', roomId, professionData);
    
    setShowProfessionModal(false);
  };

  const handleStartGame = async () => {
    if (!gameReady) {
      setError('Не все игроки готовы к игре');
      return;
    }

    try {
      socket.emit('startGame', roomId);
    } catch (err) {
      setError('Ошибка запуска игры');
    }
  };

  const handleExitRoom = () => {
    socket.emit('leaveRoom', roomId);
    if (onExitGame) {
      onExitGame();
    }
  };

  const getPlayerStatusColor = (player) => {
    if (player.profession && player.dream) return '#4caf50';
    if (player.profession) return '#ff9800';
    return '#9e9e9e';
  };

  const getPlayerStatusText = (player) => {
    if (player.profession && player.dream) return 'Готов';
    if (player.profession) return 'Выбрал профессию';
    return 'Не готов';
  };

  const getPlayerStatusIcon = (player) => {
    if (player.profession && player.dream) return '✅';
    if (player.profession) return '⏳';
    return '❌';
  };

  if (loading) {
    return (
      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={80} sx={{ color: 'rgba(255,255,255,0.9)', mb: 3 }} />
          <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.9)' }}>
            Загрузка лобби...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      p: 3,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Фоновые элементы */}
      <Box sx={{
        position: 'absolute',
        top: -50,
        right: -50,
        width: 200,
        height: 200,
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        zIndex: 0
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: -100,
        left: -100,
        width: 300,
        height: 300,
        background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
        borderRadius: '50%',
        zIndex: 0
      }} />

      {/* Основной контент */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* Заголовок */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h2" sx={{
              fontWeight: 900,
              background: 'linear-gradient(135deg, #ffffff 0%, #f0f8ff 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
              textShadow: '0 4px 20px rgba(0,0,0,0.3)',
              fontSize: { xs: '2.5rem', md: '3.5rem' }
            }}>
              🎮 Лобби игры
            </Typography>
            <Typography variant="h5" sx={{ 
              color: 'rgba(255,255,255,0.9)', 
              mb: 3,
              fontWeight: 300,
              textShadow: '0 2px 10px rgba(0,0,0,0.3)'
            }}>
              Комната: {roomData?.name || roomId}
            </Typography>
          </Box>
        </motion.div>

        {/* Информация о комнате */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          <Paper elevation={24} sx={{
            p: 4,
            mb: 4,
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ color: '#667eea', fontWeight: 600, mb: 2 }}>
                  📊 Статус комнаты
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <GroupIcon sx={{ color: '#667eea' }} />
                    <Typography variant="body1">
                      Игроков: {players.length} / {roomData?.maxPlayers || 2}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TrophyIcon sx={{ color: '#ff9800' }} />
                    <Typography variant="body1">
                      Статус: {roomData?.status || 'Ожидание'}
                    </Typography>
                  </Box>
                  {isHost && (
                    <Chip 
                      label="👑 Вы хост" 
                      sx={{ 
                        bgcolor: '#ff9800', 
                        color: 'white',
                        fontWeight: 600,
                        alignSelf: 'flex-start'
                      }}
                    />
                  )}
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ textAlign: 'center' }}>
                  {!username ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                      <TextField
                        label="Имя пользователя"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Введите ваше имя"
                        sx={{
                          minWidth: 300,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            '&.Mui-focused': {
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#4caf50',
                                borderWidth: 2
                              }
                            }
                          }
                        }}
                      />
                      <Button
                        variant="contained"
                        size="large"
                        onClick={handleJoinRoom}
                        disabled={isJoining || !username.trim()}
                        startIcon={<PersonAddIcon />}
                        sx={{
                          background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                          borderRadius: 4,
                          px: 6,
                          py: 2,
                          fontSize: '1.2rem',
                          fontWeight: 700,
                          textTransform: 'none',
                          boxShadow: '0 8px 32px rgba(76, 175, 80, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #45a049 0%, #4caf50 100%)',
                            transform: 'translateY(-3px)',
                            boxShadow: '0 12px 40px rgba(76, 175, 80, 0.4)'
                          },
                          '&:disabled': {
                            background: '#ccc',
                            transform: 'none',
                            boxShadow: 'none'
                          },
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      >
                        {isJoining ? 'Присоединяемся...' : 'Присоединиться к игре'}
                      </Button>
                    </Box>
                  ) : (
                    <Box>
                      <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 600, mb: 2 }}>
                        ✅ Вы присоединились как {username}
                      </Typography>
                      {!selectedProfession && (
                        <Button
                          variant="outlined"
                          onClick={() => setShowProfessionModal(true)}
                          startIcon={<WorkIcon />}
                          sx={{
                            borderColor: '#667eea',
                            color: '#667eea',
                            borderRadius: 3,
                            px: 4,
                            py: 1.5,
                            fontWeight: 600,
                            '&:hover': {
                              borderColor: '#5a6fd8',
                              backgroundColor: 'rgba(102, 126, 234, 0.04)'
                            }
                          }}
                        >
                          Выбрать профессию и мечту
                        </Button>
                      )}
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>

            {error && (
              <Alert severity="error" sx={{ mt: 3, borderRadius: 3 }}>
                {error}
              </Alert>
            )}
          </Paper>
        </motion.div>

        {/* Список игроков */}
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
            👥 Игроки в комнате ({players.length})
          </Typography>

          {players.length === 0 ? (
            <Paper elevation={24} sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <GroupIcon sx={{ fontSize: 80, color: '#ccc', mb: 3 }} />
              <Typography variant="h5" color="text.secondary" sx={{ mb: 3, fontWeight: 600 }}>
                Комната пуста
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                Присоединитесь первым и пригласите друзей!
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {players.map((player, index) => (
                <Grid item xs={12} sm={6} md={4} key={player.socketId}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card 
                      elevation={16}
                      sx={{
                        borderRadius: 4,
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3, textAlign: 'center' }}>
                        {/* Аватар игрока */}
                        <Avatar 
                          sx={{ 
                            width: 80, 
                            height: 80, 
                            mx: 'auto', 
                            mb: 2,
                            bgcolor: getPlayerStatusColor(player),
                            fontSize: '2rem'
                          }}
                        >
                          {player.username?.charAt(0)?.toUpperCase() || '?'}
                        </Avatar>
                        
                        {/* Имя игрока */}
                        <Typography variant="h6" sx={{ 
                          fontWeight: 700, 
                          color: '#667eea',
                          mb: 2
                        }}>
                          {player.username || 'Неизвестно'}
                        </Typography>
                        
                        {/* Статус готовности */}
                        <Box sx={{ mb: 3 }}>
                          <Chip
                            label={getPlayerStatusText(player)}
                            size="small"
                            sx={{
                              bgcolor: getPlayerStatusColor(player),
                              color: 'white',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              borderRadius: 2
                            }}
                          />
                        </Box>
                        
                        {/* Информация о профессии */}
                        {player.profession && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#4caf50' }}>
                              💼 {player.profession.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Зарплата: ${player.profession.salary?.toLocaleString()}
                            </Typography>
                          </Box>
                        )}
                        
                        {/* Информация о мечте */}
                        {player.dream && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#ff9800' }}>
                              ⭐ {player.dream.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Цель: ${player.dream.cost?.toLocaleString()}
                            </Typography>
                          </Box>
                        )}
                        
                        {/* Статус иконка */}
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" sx={{ mb: 1 }}>
                            {getPlayerStatusIcon(player)}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          )}
        </motion.div>

        {/* Кнопка старта игры */}
        {isHost && gameReady && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Box sx={{ textAlign: 'center', mt: 6 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleStartGame}
                startIcon={<PlayIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                  borderRadius: 4,
                  px: 8,
                  py: 3,
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  boxShadow: '0 12px 40px rgba(76, 175, 80, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #45a049 0%, #4caf50 100%)',
                    transform: 'translateY(-4px) scale(1.05)',
                    boxShadow: '0 20px 50px rgba(76, 175, 80, 0.5)'
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                🚀 Начать игру!
              </Button>
              <Typography variant="body1" sx={{ mt: 2, color: 'rgba(255,255,255,0.8)' }}>
                Все игроки готовы к игре
              </Typography>
            </Box>
          </motion.div>
        )}

        {/* Информация о готовности */}
        {!gameReady && players.length >= 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Paper elevation={16} sx={{
              p: 4,
              mt: 4,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              textAlign: 'center'
            }}>
              <Typography variant="h6" sx={{ color: '#ff9800', fontWeight: 600, mb: 2 }}>
                ⏳ Ожидание готовности игроков
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Все игроки должны выбрать профессию и мечту для начала игры
              </Typography>
            </Paper>
          </motion.div>
        )}
      </Box>

      {/* Плавающие кнопки */}
      <Box sx={{ position: 'fixed', bottom: 32, right: 32, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Кнопка настроек */}
        <Fab
          color="primary"
          aria-label="Настройки"
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            width: 56,
            height: 56,
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              transform: 'scale(1.1) rotate(5deg)'
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <SettingsIcon />
        </Fab>
        
        {/* Кнопка выхода */}
        <Fab
          color="secondary"
          aria-label="Выйти"
          onClick={handleExitRoom}
          sx={{
            background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
            width: 56,
            height: 56,
            '&:hover': {
              background: 'linear-gradient(135deg, #d32f2f 0%, #c62828 100%)',
              transform: 'scale(1.1) rotate(-5deg)'
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <CloseIcon />
        </Fab>
      </Box>

      {/* Модальное окно выбора профессии */}
      <ProfessionModal
        open={showProfessionModal}
        onClose={() => setShowProfessionModal(false)}
        onSelectProfession={handleProfessionSelect}
      />
    </Box>
  );
};

export default GameLobby;
