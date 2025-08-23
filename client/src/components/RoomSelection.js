import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import { useLogout } from '../hooks/useLogout';
import { useNavigate } from 'react-router-dom';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import socket from '../socket';

// Импортируем новую цветовую систему
import { colors, textColors, buttonStyles, inputStyles, containerStyles, cardStyles, typographyStyles } from '../styles/component-styles.js';

const RoomSelection = ({ playerData, onRoomSelect, onLogout }) => {
  const [roomId, setRoomId] = useState('');
  const [roomName, setRoomName] = useState('');
  const [error, setError] = useState('');
  const [availableRooms, setAvailableRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const navigate = useNavigate();

  // Получаем список доступных комнат с сервера
  useEffect(() => {
    setRoomsLoading(true);

    // Слушаем обновления списка комнат
    socket.on('roomsList', (roomsList) => {
      console.log('🏠 [RoomSelection] Received rooms list:', roomsList);
      setAvailableRooms(roomsList);
      setRoomsLoading(false);
    });

    // Слушаем событие создания комнаты
    socket.on('roomCreated', (createdRoom) => {
      console.log('✅ [RoomSelection] Room created:', createdRoom);
      // Переходим к настройке созданной комнаты
      handleRoomSelect(createdRoom.roomId);
    });

    // Запрашиваем текущий список комнат
    socket.emit('getRoomsList');

    return () => {
      socket.off('roomsList');
      socket.off('roomCreated');
    };
  }, []);

  // Обработка выбора комнаты
  const handleRoomSelect = (selectedRoomId) => {
    console.log('🔄 [RoomSelection] Selected room:', selectedRoomId);
    onRoomSelect({ roomId: selectedRoomId.trim() });
  };

  const handleCreateRoom = () => {
    if (!roomId.trim()) {
      setError('Введите ID комнаты');
      return;
    }

    if (!roomName.trim()) {
      setError('Введите название комнаты');
      return;
    }

    // Сначала создаем комнату на сервере
    socket.emit('createRoom', roomId.trim(), 2, '', 3, roomName.trim());

    // Очищаем ошибки
    setError('');

    // Ждем ответа от сервера о создании комнаты
    // Переход к настройке комнаты будет происходить через событие roomCreated
  };

  const handleRatingsClick = () => {
    navigate('/ratings');
  };

  return (
    <Box sx={containerStyles.pageContainer}>
      {/* Заголовок */}
      <Typography variant="h4" sx={{
        ...typographyStyles.pageTitle,
        color: '#ffffff',
        textShadow: '0 2px 8px rgba(0,0,0,0.8)',
        fontSize: '2.5rem',
        fontWeight: 'bold'
      }}>
        🏠 Выбор комнаты
      </Typography>

      {/* Основная форма */}
      <Paper elevation={6} sx={containerStyles.formContainer}>
        {/* Информация об игроке */}
        <Card sx={{
          ...cardStyles.primary,
          bgcolor: '#ffffff',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
        }}>
          <CardContent>
            <Typography variant="h6" sx={{
              color: '#1976d2',
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontWeight: 'bold'
            }}>
              👤 {playerData?.username || 'Игрок'}
            </Typography>
            <Typography variant="body2" sx={{ 
              color: '#424242',
              fontWeight: 500
            }}>
              ID: {playerData?.displayId || 'N/A'} | Email: {playerData?.email || 'N/A'}
            </Typography>
            {playerData?.gameStats && (
              <Typography variant="body2" sx={{ 
                color: '#666666',
                mt: 1,
                fontWeight: 500
              }}>
                Игр сыграно: {playerData.gameStats.gamesPlayed} | Побед: {playerData.gameStats.gamesWon}
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Создание новой комнаты */}
        <Box sx={containerStyles.sectionContainer}>
          <Typography variant="h6" sx={{
            ...typographyStyles.sectionTitle,
            color: '#ffffff',
            textShadow: '0 1px 4px rgba(0,0,0,0.7)',
            fontSize: '1.3rem',
            fontWeight: 'bold'
          }}>
            🆕 NEW
            <Box component="span" sx={{
              fontSize: '1.2rem',
              color: '#ffffff',
              textShadow: '0 1px 4px rgba(0,0,0,0.7)'
            }}>
              🏠 Создать новую комнату
            </Box>
          </Typography>

          {/* Название комнаты */}
          <TextField
            fullWidth
            variant="outlined"
            label="Название комнаты"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Введите название комнаты (например: Игра с друзьями)"
            sx={{
              ...inputStyles.primary,
              '& .MuiOutlinedInput-root': {
                border: '2px solid #1976d2',
                backgroundColor: '#ffffff',
                '&:hover': {
                  borderColor: '#1565c0',
                  borderWidth: '2px'
                },
                '&.Mui-focused': {
                  borderColor: '#1565c0',
                  boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.2)'
                }
              },
              '& .MuiInputLabel-root': {
                color: '#666666',
                fontWeight: 500,
                '&.Mui-focused': {
                  color: '#1976d2'
                }
              },
              '& .MuiInputBase-input': {
                color: '#212121',
                fontSize: '1rem',
                fontWeight: 500
              }
            }}
          />

          {/* ID комнаты */}
          <TextField
            fullWidth
            variant="outlined"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Введите ID комнаты (например: myroom123)"
            sx={{
              ...inputStyles.primary,
              mb: 2,
              '& .MuiOutlinedInput-root': {
                border: '2px solid #1976d2',
                backgroundColor: '#ffffff',
                '&:hover': {
                  borderColor: '#1565c0',
                  borderWidth: '2px'
                },
                '&.Mui-focused': {
                  borderColor: '#1565c0',
                  boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.2)'
                }
              },
              '& .MuiInputLabel-root': {
                color: '#666666',
                fontWeight: 500,
                '&.Mui-focused': {
                  color: '#1976d2'
                }
              },
              '& .MuiInputBase-input': {
                color: '#212121',
                fontSize: '1rem',
                fontWeight: 500
              }
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCreateRoom();
              }
            }}
          />

          <Button
            fullWidth
            variant="contained"
            onClick={handleCreateRoom}
            sx={{
              ...buttonStyles.primary,
              bgcolor: '#1976d2',
              color: '#ffffff',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              py: 2,
              boxShadow: '0 4px 15px rgba(25, 118, 210, 0.4)',
              '&:hover': {
                bgcolor: '#1565c0',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(25, 118, 210, 0.6)'
              }
            }}
          >
            🚀 Создать комнату
          </Button>

          {/* Отображение ошибок */}
          {error && (
            <Alert severity="error" sx={{ 
              mt: 2,
              '& .MuiAlert-message': {
                color: '#d32f2f',
                fontWeight: 500
              }
            }}>
              {error}
            </Alert>
          )}
        </Box>

        {/* Динамический список созданных комнат */}
        <Box sx={{
          mb: 3,
          p: 2,
          bgcolor: colors.secondary.light,
          borderRadius: 2,
          border: `1px solid ${colors.secondary.main}`,
          boxShadow: 1
        }}>
          <Typography variant="h6" sx={{
            color: colors.secondary.main,
            fontWeight: 'bold',
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            justifyContent: 'center'
          }}>
            🏠 Доступные комнаты
            {!roomsLoading && (
              <Box component="span" sx={{
                fontSize: '0.8rem',
                color: textColors.secondary,
                bgcolor: colors.primary.light,
                px: 1,
                py: 0.5,
                borderRadius: 1,
                ml: 1
              }}>
                {availableRooms.length}
              </Box>
            )}
          </Typography>

          {roomsLoading ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="body1" sx={{
                color: '#666666',
                fontWeight: 500
              }}>
                Загрузка комнат...
              </Typography>
            </Box>
          ) : availableRooms.length > 0 ? (
            <Grid container spacing={2}>
              {availableRooms
                .filter(room => room && room.roomId)
                .map((room) => (
                  <Grid item xs={12} key={room.roomId}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card sx={{
                        bgcolor: '#ffffff',
                        cursor: 'pointer',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        border: '2px solid #e0e0e0',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                          borderColor: '#1976d2'
                        }
                      }}
                        onClick={() => handleRoomSelect(room.roomId)}
                      >
                        <CardContent sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h6" sx={{
                            color: '#1976d2',
                            fontWeight: 'bold',
                            mb: 1,
                            fontSize: '1.2rem'
                          }}>
                            🎯 {room.displayName || room.roomName || `Комната ${room.originalRequestedId || 'Unknown'}`}
                          </Typography>

                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                            <Typography variant="body2" sx={{ 
                              color: '#ffffff', 
                              fontWeight: 'bold',
                              bgcolor: '#1976d2',
                              px: 1,
                              borderRadius: 1
                            }}>
                              🔢 ID: {room.roomId}
                            </Typography>
                            {room.originalRequestedId && room.originalRequestedId !== room.roomId.toString() && (
                              <Typography variant="body2" sx={{ 
                                color: '#666666',
                                bgcolor: '#f5f5f5',
                                px: 1,
                                borderRadius: 1
                              }}>
                                📝 Запрошено: {room.originalRequestedId}
                              </Typography>
                            )}
                          </Box>

                          <Typography variant="body2" sx={{ 
                            color: '#424242', 
                            mb: 1,
                            fontWeight: 500
                          }}>
                            👥 Игроков: {room.currentPlayers || 0}/{room.maxPlayers || 2}
                          </Typography>

                          {room.currentPlayers && room.currentPlayers.length > 0 && (
                            <Box sx={{ mb: 1 }}>
                              <Typography variant="caption" sx={{ 
                                color: '#666666',
                                fontWeight: 500
                              }}>
                                Игроки: {room.currentPlayers.map(p => p.username || 'Гость').join(', ')}
                              </Typography>
                            </Box>
                          )}

                          <Typography variant="caption" sx={{ 
                            color: '#666666', 
                            mb: 1,
                            fontWeight: 500
                          }}>
                            Статус: {room.status === 'waiting' ? '⏳ Ожидание' : '🎮 Игра'}
                          </Typography>

                          {room.createdAt && (
                            <Typography variant="caption" sx={{ 
                              color: '#666666', 
                              display: 'block',
                              fontWeight: 500
                            }}>
                              Создана: {new Date(room.createdAt).toLocaleString('ru-RU')}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
            </Grid>
          ) : (
            <Box sx={{
              textAlign: 'center',
              py: 3
            }}>
              <Typography variant="body1" sx={{ 
                mb: 1,
                color: '#666666',
                fontWeight: 500
              }}>
                🚀 Комнаты не найдены
              </Typography>
              <Typography variant="body2" sx={{
                color: '#666666',
                fontWeight: 500
              }}>
                Создайте первую комнату выше!
              </Typography>
            </Box>
          )}
        </Box>

        {/* Кнопки навигации */}
        <Box sx={{ display: 'flex', gap: 2, mt: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button
            variant="outlined"
            fullWidth
            sx={{
              flex: 1,
              minWidth: 200,
              borderColor: '#ff9800',
              color: '#ff9800',
              borderRadius: 2,
              py: 1.5,
              fontWeight: 'bold',
              borderWidth: '2px',
              '&:hover': {
                borderColor: '#f57c00',
                bgcolor: '#fff3e0',
                color: '#e65100'
              }
            }}
            onClick={handleRatingsClick}
          >
            <EmojiEventsIcon sx={{ mr: 1 }} /> Рейтинги
          </Button>

          <Button
            variant="outlined"
            fullWidth
            sx={{
              flex: 1,
              minWidth: 200,
              borderColor: '#f44336',
              color: '#f44336',
              borderRadius: 2,
              py: 1.5,
              fontWeight: 'bold',
              borderWidth: '2px',
              '&:hover': {
                borderColor: '#d32f2f',
                bgcolor: '#ffebee',
                color: '#c62828'
              }
            }}
            onClick={onLogout}
          >
            <ExitToAppIcon sx={{ mr: 1 }} /> Выйти
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default RoomSelection;
