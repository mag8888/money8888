import React from 'react';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';

/**
 * Компонент для отображения текущего хода игрока
 */
const CurrentTurnDisplay = ({ currentTurn, turnTimeLeft, getPlayerNameById }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (!currentTurn) {
    return null;
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Box sx={{ 
      textAlign: 'center', 
      mb: isMobile ? 2 : 3,
      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
      borderRadius: '20px',
      padding: isMobile ? '15px' : '20px',
      border: '2px solid rgba(139, 92, 246, 0.5)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)'
    }}>
      <Typography variant="h4" sx={{ 
        color: '#FFFFFF',
        fontWeight: 'bold',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
        mb: 1,
        fontSize: isMobile ? '1.5rem' : '2rem'
      }}>
        🎯 ХОД ИГРОКА
      </Typography>
      <Typography variant="h3" sx={{ 
        color: '#FBBF24',
        fontWeight: 'bold',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
        fontSize: isMobile ? '1.8rem' : '2.5rem',
        background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        {getPlayerNameById(currentTurn)}
      </Typography>
      <Typography variant="body1" sx={{ 
        color: '#E5E7EB',
        mt: 1,
        fontSize: isMobile ? '0.9rem' : '1rem'
      }}>
        Время хода: {formatTime(turnTimeLeft)}
      </Typography>
    </Box>
  );
};

export default CurrentTurnDisplay;
