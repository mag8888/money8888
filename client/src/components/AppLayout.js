import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import socket from '../socket';
import Hud from './Hud';

const AppLayout = ({ board }) => {
  const [username, setUsername] = useState('Игрок');

  useEffect(() => {
    const syncMe = (list) => {
      const me = Array.isArray(list) ? list.find(p => p.id === socket.id) : null;
      if (me?.username) setUsername(me.username);
    };
    const onPlayerUpdated = (player) => {
      if (player?.id === socket.id && player.username) setUsername(player.username);
    };
    socket.emit('getPlayers');
    socket.on('playersList', syncMe);
    socket.on('playerUpdated', onPlayerUpdated);
    return () => {
      socket.off('playersList', syncMe);
      socket.off('playerUpdated', onPlayerUpdated);
    };
  }, []);

  return (
    <Box sx={{ position: 'relative', display: 'flex', height: '100vh', bgcolor: '#331F47' }}>
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {board}
      </Box>
      <Hud />
    </Box>
  );
};

export default AppLayout;




