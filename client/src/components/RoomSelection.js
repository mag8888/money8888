import React, { useState } from 'react';
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
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

const RoomSelection = ({ playerData, onRoomSelect, onLogout }) => {
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Только одна тестовая комната
  const presetRooms = ['test'];

  // Единая цветовая схема
  const colors = {
    primary: '#1976d2',
    primaryDark: '#1565c0',
    primaryLight: '#e3f2fd',
    secondary: '#ff9800',
    secondaryDark: '#f57c00',
    secondaryLight: '#fff3e0',
    background: '#f8f9fa',
    surface: '#ffffff',
    text: '#212121',
    textSecondary: '#757575',
    border: '#e0e0e0',
    error: '#f44336',
    success: '#4caf50'
  };

  const handleRoomSelect = (selectedRoomId) => {
    if (selectedRoomId.trim()) {
      console.log('🔄 [RoomSelection] Selected room:', selectedRoomId);
      console.log('🔄 [RoomSelection] Calling onRoomSelect with:', { roomId: selectedRoomId.trim() });
      onRoomSelect({ roomId: selectedRoomId.trim() });
    }
  };

  const handleCreateRoom = () => {
    console.log('🔄 [RoomSelection] Create room clicked, roomId:', roomId);
    if (roomId.trim()) {
      console.log('🔄 [RoomSelection] Creating room with ID:', roomId.trim());
      handleRoomSelect(roomId);
    } else {
      console.log('🔄 [RoomSelection] Error: empty room ID');
      setError('Введите ID комнаты');
    }
  };

  const handleRatingsClick = () => {
    navigate('/ratings');
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      p: 4,
      pt: 6
    }}>
      {/* Заголовок */}
      <Typography variant="h4" sx={{ 
        color: colors.surface, 
        mb: 4, 
        fontWeight: 'bold', 
        textAlign: 'center',
        textShadow: '0 2px 4px rgba(0,0,0,0.5)'
      }}>
        🏠 Выбор комнаты
      </Typography>

      {/* Основная форма */}
      <Paper elevation={6} sx={{
        p: 3,
        width: '100%',
        maxWidth: 500,
        background: colors.surface,
        borderRadius: 3,
        mb: 4,
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        {/* Информация об игроке */}
        <Card sx={{ 
          mb: 4, 
          bgcolor: colors.primaryLight, 
          borderRadius: 3, 
          border: `2px solid ${colors.primary}`,
          boxShadow: 2
        }}>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ 
              color: colors.primaryDark, 
              fontWeight: 'bold',
              mb: 1
            }}>
              👤 {playerData?.username || 'Игрок'}
            </Typography>
            <Typography variant="body2" sx={{ 
              color: colors.textSecondary, 
              fontWeight: '500'
            }}>
              ID: {playerData?.id || 'N/A'}
            </Typography>
          </CardContent>
        </Card>

        {/* Создание новой комнаты */}
        <Box sx={{ 
          mb: 3, 
          p: 2, 
          bgcolor: colors.primaryLight, 
          borderRadius: 2,
          border: `1px solid ${colors.primary}`,
          boxShadow: 1
        }}>
          <Typography variant="h6" sx={{ 
            color: colors.primary, 
            fontWeight: 'bold',
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            justifyContent: 'center'
          }}>
            <Box component="span" sx={{
              bgcolor: colors.primary,
              color: colors.surface,
              px: 1,
              py: 0.5,
              borderRadius: 1,
              fontSize: '0.75rem',
              fontWeight: 'bold'
            }}>
              NEW
            </Box>
            🏠 Создать новую комнату
          </Typography>
          
          <TextField
            fullWidth
            variant="outlined"
            value={roomId}
            onChange={(e) => {
              setRoomId(e.target.value);
              setError('');
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && roomId.trim()) {
                handleCreateRoom();
              }
            }}
            placeholder="Введите ID комнаты (например: myroom123)"
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                bgcolor: colors.surface,
                border: `2px solid ${colors.border}`,
                borderRadius: 2,
                fontSize: '1rem',
                '&:hover': {
                  borderColor: colors.primary,
                  borderWidth: '2px'
                },
                '&.Mui-focused': {
                  borderColor: colors.primary,
                  borderWidth: '2px',
                  boxShadow: `0 0 0 3px ${colors.primaryLight}`
                }
              },
              '& .MuiInputLabel-root': {
                color: colors.textSecondary,
                fontWeight: '500'
              },
              '& .MuiInputBase-input': {
                color: colors.text,
                fontWeight: '500',
                '&::placeholder': {
                  color: colors.textSecondary,
                  opacity: 0.8
                }
              }
            }}
          />
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Button
            fullWidth
            variant="contained"
            onClick={handleCreateRoom}
            disabled={!roomId.trim()}
            sx={{
              bgcolor: colors.primary,
              color: colors.surface,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 'bold',
              fontSize: '1rem',
              border: `2px solid ${colors.primary}`,
              '&:hover': {
                bgcolor: colors.primaryDark,
                borderColor: colors.primaryDark,
                transform: 'translateY(-1px)',
                boxShadow: 4
              },
              '&:disabled': {
                bgcolor: colors.border,
                borderColor: colors.border,
                color: colors.textSecondary
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            🚀 Создать комнату
          </Button>
        </Box>

        <Box sx={{ 
          mb: 3, 
          p: 2, 
          bgcolor: colors.secondaryLight, 
          borderRadius: 2,
          border: `1px solid ${colors.secondary}`,
          boxShadow: 1
        }}>
          <Typography variant="h6" sx={{ 
            color: colors.secondaryDark, 
            fontWeight: 'bold',
            mb: 2,
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1
          }}>
            🧪 Тестовая комната
          </Typography>
          
          <Grid container spacing={2} justifyContent="center">
            {presetRooms.map((presetRoom) => (
              <Grid item xs={12} sm={6} md={4} key={presetRoom}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      bgcolor: colors.primaryLight,
                      border: `2px solid ${colors.primary}`,
                      borderRadius: 3,
                      boxShadow: 2,
                      '&:hover': {
                        bgcolor: colors.surface,
                        borderColor: colors.primaryDark,
                        boxShadow: 6,
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s ease-in-out'
                    }}
                    onClick={() => handleRoomSelect(presetRoom)}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="h5" sx={{ 
                        color: colors.primaryDark, 
                        fontWeight: 'bold',
                        mb: 1
                      }}>
                        {presetRoom}
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        color: colors.textSecondary, 
                        fontWeight: '500'
                      }}>
                        Тестовая комната
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Дополнительные действия */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            fullWidth
            sx={{ 
              flex: 1, 
              minWidth: 200,
              borderColor: colors.secondary,
              color: colors.secondary,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 'bold',
              '&:hover': {
                borderColor: colors.secondaryDark,
                bgcolor: colors.secondaryLight,
                transform: 'translateY(-1px)',
                boxShadow: 3
              },
              transition: 'all 0.2s ease-in-out'
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
              borderColor: colors.error,
              color: colors.error,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 'bold',
              '&:hover': {
                borderColor: colors.error,
                bgcolor: '#ffebee',
                transform: 'translateY(-1px)',
                boxShadow: 3
              },
              transition: 'all 0.2s ease-in-out'
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
