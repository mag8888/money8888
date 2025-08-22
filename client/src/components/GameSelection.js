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
    // периодический опрос как подстраховка
    const t = setInterval(() => socket.emit('getRooms'), 3000);
    return () => {
      clearInterval(t);
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
    socket.emit('createRoom', newRoomId, maxPlayers, '', 3);
    socket.emit('getRooms');
    onJoin(newRoomId);
  };

  const joinRoom = (roomId) => {
    socket.emit('joinRoom', roomId);
    onJoin(roomId);
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
            <Avatar sx={{ bgcolor: 'primary.main', mr: 1, fontSize: 40 }}>$</Avatar>
            <Typography variant="h4" sx={{ color: 'white' }}>CashFlow Web</Typography>
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
            
            <Grow in timeout={900}>
              <Button 
                fullWidth 
                variant="contained" 
                sx={{ bgcolor: '#FFD700', color: 'black', borderRadius: 2, py: 1.5, fontWeight: 'bold' }} 
                onClick={createRoom}
              >
                Создать
              </Button>
            </Grow>
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
                sx={{ mb: 1, bgcolor: '#4169E1', borderRadius: 2, py: 1.5, fontWeight: 'bold' }} 
                onClick={() => joinRoom(room.id)}
              >
                Комната {room.id} ({room.currentPlayers}/{room.maxPlayers})
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
