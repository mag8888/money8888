// 🎯 GameBoardUI - Основной компонент игрового поля
import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { motion } from 'framer-motion';

export const GameBoardUI = ({ 
  gameBoard, 
  currentPlayer, 
  onCellClick, 
  playerPositions = {} 
}) => {
  const cells = gameBoard?.getAllCells() || [];

  const handleCellClick = (cellId) => {
    if (onCellClick) {
      onCellClick(cellId);
    }
  };

  const getPlayerOnCell = (cellId) => {
    return Object.entries(playerPositions).find(([_, pos]) => pos === cellId)?.[0];
  };

  const renderCell = (cell) => {
    const playerOnCell = getPlayerOnCell(cell.id);
    
    return (
      <motion.div
        key={cell.id}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleCellClick(cell.id)}
      >
        <Paper
          elevation={3}
          sx={{
            width: '100%',
            height: 80,
            bgcolor: cell.color,
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            border: '2px solid',
            borderColor: currentPlayer?.position === cell.id ? '#FFD700' : 'transparent'
          }}
        >
          <Typography variant="caption" sx={{ fontSize: '0.7rem', textAlign: 'center' }}>
            {cell.name}
          </Typography>
          
          {playerOnCell && (
            <Box
              sx={{
                position: 'absolute',
                top: 2,
                right: 2,
                width: 16,
                height: 16,
                borderRadius: '50%',
                bgcolor: '#FFD700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.6rem',
                fontWeight: 'bold'
              }}
            >
              👤
            </Box>
          )}
          
          {currentPlayer?.position === cell.id && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 2,
                left: 2,
                width: 16,
                height: 16,
                borderRadius: '50%',
                bgcolor: '#FFD700',
                border: '2px solid #FFA000'
              }}
            />
          )}
        </Paper>
      </motion.div>
    );
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>
        🎯 Игровое поле CASHFLOW
      </Typography>
      
      <Grid container spacing={1} sx={{ maxWidth: 800, mx: 'auto' }}>
        {cells.map((cell) => (
          <Grid item xs={3} sm={2} md={1.5} key={cell.id}>
            {renderCell(cell)}
          </Grid>
        ))}
      </Grid>
      
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Нажмите на клетку для получения информации
        </Typography>
      </Box>
    </Box>
  );
};
