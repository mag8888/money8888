import React, { useState, useEffect } from 'react';
import socket from '../socket';
import { Box, Typography, TextField, Button, List, Avatar, AppBar, Toolbar, Divider, Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Fade from '@mui/material/Fade';
import Slide from '@mui/material/Slide';
import Grow from '@mui/material/Grow';
import { useLogout } from '../hooks/useLogout';
import ExitConfirmModal from './ExitConfirmModal';

const theme = createTheme({
  palette: { mode: 'dark', primary: { main: '#FFD700' }, secondary: { main: '#4169E1' }, background: { default: 'linear-gradient(to bottom, #0F0C29, #302B63, #24243E)' } },
});

const GameSelection = ({ onJoin }) => {
  const [rooms, setRooms] = useState([]);
  const [newRoomId, setNewRoomId] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [error, setError] = useState('');
  const [exitModalOpen, setExitModalOpen] = useState(false);

  // Используем централизованный хук для выхода
  const { logout } = useLogout();

  // Функция для выхода из игры
  const handleExitGame = () => {
    console.log('🔄 [GameSelection] Exit game confirmed');
    setExitModalOpen(false);
    
    // Используем централизованный хук без roomId
    logout(null, 'selection_exit');
  };

  useEffect(() => {
    const sync = (list) => setRooms(Array.isArray(list) ? list : []);
    socket.emit('getRooms');
    const onConnect = () => socket.emit('getRooms');
    socket.on('connect', onConnect);
    socket.on('roomsList', sync);
    return () => {
      socket.off('roomsList', sync);
      socket.off('connect', onConnect);
    };
  }, []);

  const createRoom = () => {
    if (!newRoomId.trim()) {
      setError('Обязательно укажите имя комнаты!');
      return;
    }
    setError('');
    
    console.log('🏠 [GameSelection] createRoom called for:', newRoomId);
    
    // Создаем комнату
    socket.emit('createRoom', newRoomId, maxPlayers, '', 3);
    console.log('🏠 [GameSelection] createRoom emitted');
    
    // Настраиваем игрока для созданной комнаты
    const playerData = {
      id: Date.now().toString(),
      username: 'Player' + Math.floor(Math.random() * 1000),
      color: '#' + Math.floor(Math.random()*16777215).toString(16)
    };
    
    console.log('👤 [GameSelection] Player data for new room:', playerData);
    
    // Ждем немного, чтобы комната создалась, затем настраиваем игрока
    setTimeout(() => {
      console.log('⏰ [GameSelection] Timeout finished, calling setupPlayer');
      socket.emit('setupPlayer', newRoomId, playerData);
      console.log('👤 [GameSelection] setupPlayer emitted for new room');
      onJoin(newRoomId);
      console.log('🚪 [GameSelection] onJoin called for new room');
    }, 500);
    
    socket.emit('getRooms');
  };

  const joinRoom = (roomId) => {
    console.log('🔗 [GameSelection] joinRoom called for:', roomId);
    
    // Сначала подключаемся к комнате
    socket.emit('joinRoom', roomId);
    console.log('🔗 [GameSelection] joinRoom emitted');
    
    // Затем настраиваем игрока (это добавляет его в комнату)
    const playerData = {
      id: Date.now().toString(),
      username: 'Player' + Math.floor(Math.random() * 1000),
      color: '#' + Math.floor(Math.random()*16777215).toString(16)
    };
    
    console.log('👤 [GameSelection] Player data:', playerData);
    socket.emit('setupPlayer', roomId, playerData);
    console.log('👤 [GameSelection] setupPlayer emitted');
    
    // Переходим к настройке комнаты
    onJoin(roomId);
    console.log('🚪 [GameSelection] onJoin called');
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(to bottom, #0f0c29, #302b63, #24243e)', p: 2 }}>
        <AppBar position="static" sx={{ mb: 2, width: '100%', maxWidth: 400 }}>
          <Toolbar>
            <Typography variant="h6">Выберите игру</Typography>
          </Toolbar>
        </AppBar>
        
        <Fade in timeout={800}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 2 }}>
            <img 
              src="/images/center-logo.svg" 
              alt="Поток Денег Logo" 
              style={{
                width: '50px',
                height: '50px',
                marginRight: '16px'
              }}
            />
            <Typography variant="h4" sx={{ color: 'white' }}>Поток Денег Web</Typography>
          </Box>
        </Fade>
        
        <Slide direction="up" in timeout={700}>
          <Box sx={{ width: '100%', maxWidth: 300, mb: 2 }}>
            <TextField 
              fullWidth 
              placeholder="ID комнаты" 
              value={newRoomId} 
              onChange={e => setNewRoomId(e.target.value)} 
              sx={{ mb: 2 }} 
            />
            {error && <Typography sx={{ color: 'red', mb: 1 }}>{error}</Typography>}
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Игроков</InputLabel>
              <Select value={maxPlayers} onChange={e => setMaxPlayers(e.target.value)}>
                {[2,3,4,5,6,7,8,9,10].map(num => (
                  <MenuItem key={num} value={num}>{num}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Button 
              fullWidth 
              variant="contained" 
              sx={{ bgcolor: '#FFD700', color: 'black', borderRadius: 2, py: 1.5, fontWeight: 'bold' }} 
              onClick={createRoom}
            >
              🎮 Создать комнату
            </Button>
          </Box>
        </Slide>
        
        <Typography variant="subtitle1" sx={{ mb: 1.5, color: 'white' }}>Доступные комнаты</Typography>
        <Slide direction="up" in timeout={900}>
          <List sx={{ width: '100%', maxWidth: 300, gap: 1.2, display: 'flex', flexDirection: 'column' }}>
            {rooms.map(room => (
              <Button 
                key={room.id} 
                fullWidth 
                variant="contained" 
                sx={{ 
                  mb: 1, 
                  bgcolor: '#4169E1', 
                  borderRadius: 2, 
                  py: 1.5, 
                  fontWeight: 'bold' 
                }} 
                onClick={() => joinRoom(room.id)}
              >
                🎮 Комната {room.id} ({room.currentPlayers}/{room.maxPlayers})
              </Button>
            ))}
          </List>
        </Slide>
        
        <Divider sx={{ width: '100%', maxWidth: 300, mt: 2 }} />
        
        {/* Кнопка выхода из игры */}
        <Slide direction="up" in timeout={1000}>
          <Button 
            variant="contained" 
            sx={{ 
              mt: 2,
              bgcolor: '#f44336', 
              color: 'white', 
              borderRadius: 2, 
              py: 1.5, 
              fontWeight: 'bold',
              '&:hover': {
                bgcolor: '#d32f2f',
              }
            }} 
            onClick={() => setExitModalOpen(true)}
          >
            🚪 Выйти из игры
          </Button>
        </Slide>

        {/* Exit Game Modal */}
        <ExitConfirmModal 
          open={exitModalOpen} 
          onClose={() => setExitModalOpen(false)}
          onConfirm={handleExitGame}
        />
      </Box>
    </ThemeProvider>
  );
};

export default GameSelection;
