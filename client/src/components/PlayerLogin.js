import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper,
  Grid,
  Avatar,
  Chip
} from '@mui/material';
import { Person, Gamepad, EmojiEvents } from '@mui/icons-material';

const PlayerLogin = ({ onLogin }) => {
  const [playerId, setPlayerId] = useState('');
  const [error, setError] = useState('');

  // Предустановленные ID игроков
  const availablePlayers = [
    { id: 'PLAYER001', name: 'Игрок 001', color: '#FF7043', status: 'available' },
    { id: 'PLAYER002', name: 'Игрок 002', color: '#4CAF50', status: 'available' },
    { id: 'PLAYER003', name: 'Игрок 003', color: '#2196F3', status: 'available' },
    { id: 'PLAYER004', name: 'Игрок 004', color: '#9C27B0', status: 'available' },
    { id: 'PLAYER005', name: 'Игрок 005', color: '#FF9800', status: 'available' },
    { id: 'PLAYER006', name: 'Игрок 006', color: '#795548', status: 'available' },
    { id: 'PLAYER007', name: 'Игрок 007', color: '#607D8B', status: 'available' },
    { id: 'PLAYER008', name: 'Игрок 008', color: '#E91E63', status: 'available' }
  ];

  const handlePlayerSelect = (selectedId) => {
    setPlayerId(selectedId);
    setError('');
  };

  const handleLogin = () => {
    if (!playerId) {
      setError('Выберите ID игрока');
      return;
    }

    const player = availablePlayers.find(p => p.id === playerId);
    if (!player) {
      setError('Неверный ID игрока');
      return;
    }

    // Создаем объект игрока с фиксированным ID
    const playerData = {
      id: playerId,
      username: player.name,
      color: player.color,
      isFixedId: true, // Флаг что это фиксированный ID
      balance: 2000, // Начальный баланс
      passiveIncome: 0,
      position: 0,
      isFastTrack: false
    };

    onLogin(playerData);
  };

  const handleCustomId = () => {
    if (!playerId || playerId.length < 3) {
      setError('ID должен содержать минимум 3 символа');
      return;
    }

    // Проверяем что ID не занят предустановленными
    const isReserved = availablePlayers.some(p => p.id === playerId);
    if (isReserved) {
      setError('Этот ID уже занят предустановленным игроком');
      return;
    }

    // Создаем кастомного игрока
    const playerData = {
      id: playerId,
      username: `Игрок ${playerId}`,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`, // Случайный цвет
      isFixedId: false,
      balance: 2000,
      passiveIncome: 0,
      position: 0,
      isFastTrack: false
    };

    onLogin(playerData);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: 3,
      p: 4,
      maxWidth: 600,
      mx: 'auto'
    }}>
      <Paper elevation={8} sx={{ p: 4, width: '100%', background: 'linear-gradient(135deg, #2F1B40, #4A148C)' }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <EmojiEvents sx={{ fontSize: 60, color: '#FFD54F', mb: 2 }} />
          <Typography variant="h3" sx={{ 
            color: '#FFD54F', 
            fontWeight: 'bold',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            mb: 1
          }}>
            CASHFLOW 101
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            Выберите ID игрока для входа
          </Typography>
        </Box>

        {/* Предустановленные ID */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ color: 'white', mb: 2, textAlign: 'center' }}>
            🎯 Предустановленные ID
          </Typography>
          <Grid container spacing={2}>
            {availablePlayers.map((player) => (
              <Grid item xs={6} sm={4} md={3} key={player.id}>
                <Paper 
                  elevation={player.id === playerId ? 8 : 2}
                  sx={{ 
                    p: 2, 
                    textAlign: 'center', 
                    cursor: 'pointer',
                    background: player.id === playerId ? 'linear-gradient(135deg, #FFD54F, #FFB300)' : 'rgba(255,255,255,0.1)',
                    color: player.id === playerId ? '#2F1B40' : 'white',
                    border: player.id === playerId ? '3px solid #FFD54F' : '1px solid rgba(255,255,255,0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: 4
                    }
                  }}
                  onClick={() => handlePlayerSelect(player.id)}
                >
                  <Avatar sx={{ 
                    bgcolor: player.color, 
                    width: 40, 
                    height: 40, 
                    mx: 'auto', 
                    mb: 1,
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}>
                    {player.id.slice(-2)}
                  </Avatar>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {player.name}
                  </Typography>
                  <Chip 
                    label={player.status === 'available' ? 'Доступен' : 'Занят'} 
                    size="small" 
                    color={player.status === 'available' ? 'success' : 'error'}
                    sx={{ mt: 1 }}
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Кастомный ID */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ color: 'white', mb: 2, textAlign: 'center' }}>
            ✨ Свой ID
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              fullWidth
              label="Введите свой ID"
              value={playerId}
              onChange={(e) => setPlayerId(e.target.value)}
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255,255,255,0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255,255,255,0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#FFD54F',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255,255,255,0.7)',
                  '&.Mui-focused': {
                    color: '#FFD54F',
                  },
                },
              }}
            />
            <Button
              variant="contained"
              onClick={handleCustomId}
              sx={{
                bgcolor: '#FFD54F',
                color: '#2F1B40',
                fontWeight: 'bold',
                '&:hover': {
                  bgcolor: '#FFB300',
                },
                px: 3
              }}
            >
              Создать
            </Button>
          </Box>
        </Box>

        {/* Ошибки */}
        {error && (
          <Typography sx={{ color: '#FF5722', textAlign: 'center', mb: 2 }}>
            ⚠️ {error}
          </Typography>
        )}

        {/* Кнопка входа */}
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleLogin}
            disabled={!playerId}
            startIcon={<Gamepad />}
            sx={{
              bgcolor: '#4CAF50',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '18px',
              px: 6,
              py: 2,
              '&:hover': {
                bgcolor: '#45A049',
                transform: 'scale(1.05)',
              },
              '&:disabled': {
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.5)',
              }
            }}
          >
            Войти в игру
          </Button>
        </Box>

        {/* Инструкции */}
        <Box sx={{ mt: 4, p: 3, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center' }}>
            💡 <strong>Совет:</strong> Используйте предустановленные ID для быстрого входа или создайте свой уникальный ID
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default PlayerLogin;
