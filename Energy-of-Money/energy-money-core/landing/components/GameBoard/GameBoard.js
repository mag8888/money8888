import React from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

/**
 * Компонент игровой доски
 */
const GameBoard = ({ 
  gamePlayers, 
  currentPlayer, 
  onCellClick, 
  children 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{
      position: 'relative',
      width: isMobile ? '100%' : '800px',
      height: isMobile ? '400px' : '800px',
      margin: '0 auto',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%)',
      borderRadius: '50%',
      border: '8px solid #fbbf24',
      boxShadow: '0 0 50px rgba(251, 191, 36, 0.5), inset 0 0 50px rgba(0, 0, 0, 0.3)',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Внутренний круг */}
      <Box sx={{
        position: 'absolute',
        width: isMobile ? '200px' : '400px',
        height: isMobile ? '200px' : '400px',
        background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #f87171 100%)',
        borderRadius: '50%',
        border: '4px solid #fbbf24',
        boxShadow: 'inset 0 0 30px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2
      }}>
        {/* Центральный контент */}
        <Box sx={{
          textAlign: 'center',
          color: '#ffffff',
          zIndex: 3
        }}>
          {children}
        </Box>
      </Box>

      {/* Клетки доски */}
      {Array.from({ length: 24 }, (_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          style={{
            position: 'absolute',
            width: isMobile ? '30px' : '60px',
            height: isMobile ? '30px' : '60px',
            background: getCellColor(index),
            border: '2px solid #fbbf24',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: isMobile ? '12px' : '16px',
            fontWeight: 'bold',
            color: '#ffffff',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
            ...getCellPosition(index, isMobile)
          }}
          onClick={() => onCellClick && onCellClick(index)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {index + 1}
        </motion.div>
      ))}

      {/* Игроки на доске */}
      {gamePlayers.map((player, index) => (
        <motion.div
          key={player.id || player.socketId}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            ...getPlayerPosition(player.position, isMobile)
          }}
          transition={{ delay: 0.5 + index * 0.1 }}
          style={{
            position: 'absolute',
            width: isMobile ? '20px' : '40px',
            height: isMobile ? '20px' : '40px',
            background: player.color || '#ffffff',
            borderRadius: '50%',
            border: '3px solid #000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isMobile ? '10px' : '16px',
            fontWeight: 'bold',
            color: '#000000',
            zIndex: 4,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
          }}
        >
          {player.username?.charAt(0).toUpperCase() || '?'}
        </motion.div>
      ))}
    </Box>
  );
};

// Функция для получения цвета клетки
const getCellColor = (index) => {
  const colors = {
    0: '#10b981', // Старт - зеленый
    6: '#f59e0b', // Благотворительность - желтый
    12: '#ef4444', // Ребенок - красный
    18: '#8b5cf6' // Мечта - фиолетовый
  };
  
  return colors[index] || '#3b82f6'; // Обычные клетки - синий
};

// Функция для получения позиции клетки
const getCellPosition = (index, isMobile) => {
  const radius = isMobile ? 150 : 300;
  const centerX = isMobile ? 200 : 400;
  const centerY = isMobile ? 200 : 400;
  
  const angle = (index * 15) - 90; // 15 градусов на клетку, начинаем с -90
  const radian = (angle * Math.PI) / 180;
  
  const x = centerX + radius * Math.cos(radian);
  const y = centerY + radius * Math.sin(radian);
  
  return {
    left: `${x - (isMobile ? 15 : 30)}px`,
    top: `${y - (isMobile ? 15 : 30)}px`
  };
};

// Функция для получения позиции игрока
const getPlayerPosition = (position, isMobile) => {
  const radius = isMobile ? 150 : 300;
  const centerX = isMobile ? 200 : 400;
  const centerY = isMobile ? 200 : 400;
  
  const angle = (position * 15) - 90;
  const radian = (angle * Math.PI) / 180;
  
  const x = centerX + radius * Math.cos(radian);
  const y = centerY + radius * Math.sin(radian);
  
  return {
    left: `${x - (isMobile ? 10 : 20)}px`,
    top: `${y - (isMobile ? 10 : 20)}px`
  };
};

export default GameBoard;
