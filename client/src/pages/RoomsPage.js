import React, { useState, useEffect } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import RoomManager from '../components/RoomManager';

const RoomsPage = ({ socket, user, onGameStart }) => {
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    console.log('🔌 [RoomsPage] Socket received:', socket);
    if (socket && socket.connected) {
      console.log('✅ [RoomsPage] Socket is connected');
      setSocketConnected(true);
    } else if (socket) {
      console.log('⚠️ [RoomsPage] Socket exists but not connected');
      // Подписываемся на события подключения
      socket.on('connect', () => {
        console.log('✅ [RoomsPage] Socket connected event received');
        setSocketConnected(true);
      });
      
      socket.on('disconnect', () => {
        console.log('❌ [RoomsPage] Socket disconnected event received');
        setSocketConnected(false);
      });
      
      // Если socket уже подключен, устанавливаем состояние
      if (socket.connected) {
        setSocketConnected(true);
      }
    }
  }, [socket]);

  if (!socketConnected) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="warning">
          Подключение к серверу не установлено. Пожалуйста, подождите...
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 3 }}>
        🏠 Управление комнатами
      </Typography>
      
      <RoomManager 
        socket={socket} 
        user={user} 
        onGameStart={onGameStart}
      />
    </Box>
  );
};

export default RoomsPage;
