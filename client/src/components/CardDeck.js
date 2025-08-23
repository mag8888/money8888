import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, IconButton, Tooltip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import StyleIcon from '@mui/icons-material/Style';

// Добавляем CSS анимации
const styles = `
  @keyframes pulse {
    0% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.1); }
    100% { opacity: 1; transform: scale(1); }
  }
`;

// Вставляем стили в head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

// Компонент стопки карточек
const CardDeck = ({ 
  deckType, 
  remainingCards, 
  totalCards, 
  onShuffle, 
  isShuffling = false,
  position = 'top' // 'top', 'bottom', 'left', 'right'
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Определяем позицию стопки
  const getPositionStyles = () => {
    switch (position) {
      case 'top':
        return { top: 20, left: '50%', transform: 'translateX(-50%)' };
      case 'bottom':
        return { bottom: 20, left: '50%', transform: 'translateX(-50%)' };
      case 'left':
        return { left: 20, top: '50%', transform: 'translateY(-50%)' };
      case 'right':
        return { right: 20, top: '50%', transform: 'translateY(-50%)' };
      default:
        return { top: 20, left: '50%', transform: 'translateX(-50%)' };
    }
  };

  // Определяем цвет стопки по типу
  const getDeckColor = () => {
    switch (deckType) {
      case 'smallDeal':
        return '#1B5E20'; // Очень темно-зеленый
      case 'bigDeal':
        return '#BF360C'; // Очень темно-оранжевый
      case 'market':
        return '#0D47A1'; // Очень темно-синий
      case 'doodad':
        return '#B71C1C'; // Очень темно-красный
      case 'charity':
        return '#880E4F'; // Очень темно-розовый
      default:
        return '#311B92'; // Очень темно-фиолетовый
    }
  };

  // Определяем название колоды
  const getDeckName = () => {
    switch (deckType) {
      case 'smallDeal':
        return 'Малые Сделки';
      case 'bigDeal':
        return 'Большие Сделки';
      case 'market':
        return 'Рынок';
      case 'doodad':
        return 'Расходы';
      case 'charity':
        return 'Благотворительность';
      default:
        return deckType;
    }
  };

  // Определяем иконку колоды
  const getDeckIcon = () => {
    switch (deckType) {
      case 'smallDeal':
        return '🏠';
      case 'bigDeal':
        return '🏢';
      case 'market':
        return '📈';
      case 'doodad':
        return '🛒';
      case 'charity':
        return '❤️';
      default:
        return '🎴';
    }
  };

  // Анимация карточек в стопке
  const cardVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 }
  };

  // Анимация перетасовки
  const shuffleVariants = {
    initial: { rotate: 0, scale: 1 },
    shuffle: { 
      rotate: [0, -10, 10, -5, 5, 0],
      scale: [1, 1.1, 1, 1.05, 1],
      transition: { duration: 0.6, ease: "easeInOut" }
    }
  };

  // Обработчик перетасовки
  const handleShuffle = () => {
    if (onShuffle && !isShuffling) {
      onShuffle(deckType);
    }
  };

  // Показываем предупреждение когда карт мало
  const isLowCards = remainingCards <= Math.ceil(totalCards * 0.2);
  const isEmpty = remainingCards === 0;

  return (
    <Box
      sx={{
        position: 'absolute',
        ...getPositionStyles(),
        zIndex: 10
      }}
    >
      {/* Основная стопка карточек */}
      <motion.div
        variants={shuffleVariants}
        initial="initial"
        animate={isShuffling ? "shuffle" : "initial"}
      >
        <Paper
          elevation={8}
          sx={{
            width: 100,
            height: 140,
            background: `linear-gradient(135deg, ${getDeckColor()} 0%, ${getDeckColor()} 60%, rgba(0,0,0,0.8) 100%)`,
            borderRadius: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: `4px solid ${isLowCards ? '#FFD700' : '#FFFFFF'}`,
            position: 'relative',
            boxShadow: '0 6px 24px rgba(0,0,0,0.8), inset 0 2px 8px rgba(255,255,255,0.1)',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 10px 35px rgba(0,0,0,0.9), inset 0 2px 8px rgba(255,255,255,0.2)',
              border: `4px solid ${isLowCards ? '#FFEB3B' : '#F0F0F0'}`
            },
            transition: 'all 0.3s ease'
          }}
          onClick={handleShuffle}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {/* Иконка колоды */}
          <Box
            sx={{
              backgroundColor: 'rgba(255,255,255,0.95)',
              borderRadius: '50%',
              width: 50,
              height: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 1,
              border: '3px solid #000000',
              boxShadow: '0 3px 10px rgba(0,0,0,0.8)'
            }}
          >
            <Typography variant="h4" sx={{ 
              color: getDeckColor(),
              fontWeight: 'bold',
              textShadow: 'none'
            }}>
              {getDeckIcon()}
            </Typography>
          </Box>
          
          {/* Название колоды */}
          <Box
            sx={{
              backgroundColor: 'rgba(255,255,255,0.95)',
              borderRadius: 1,
              px: 1,
              py: 0.5,
              mb: 1,
              border: '2px solid #000000'
            }}
          >
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#000000', 
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '0.8rem',
                lineHeight: 1.2,
                letterSpacing: '0.5px'
              }}
            >
              {getDeckName()}
            </Typography>
          </Box>
          
          {/* Количество карт */}
          <Box
            sx={{
              backgroundColor: 'rgba(255,255,255,0.95)',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '3px solid #000000',
              boxShadow: '0 2px 8px rgba(0,0,0,0.8)'
            }}
          >
            <Typography 
              variant="h5" 
              sx={{ 
                color: '#000000', 
                fontWeight: 'bold',
                textShadow: 'none'
              }}
            >
              {remainingCards}
            </Typography>
          </Box>
          
          {/* Индикатор низкого количества карт */}
          {isLowCards && !isEmpty && (
            <Box
              sx={{
                position: 'absolute',
                top: -5,
                right: -5,
                width: 20,
                height: 20,
                backgroundColor: '#FFD700',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'pulse 2s infinite',
                border: '2px solid #000000',
                boxShadow: '0 2px 8px rgba(0,0,0,0.6)'
              }}
            >
              <Typography variant="caption" sx={{ color: '#000000', fontWeight: 'bold', fontSize: '0.6rem' }}>
                ⚠️
              </Typography>
            </Box>
          )}
          
          {/* Индикатор пустой колоды */}
          {isEmpty && (
            <Box
              sx={{
                position: 'absolute',
                top: -5,
                right: -5,
                width: 20,
                height: 20,
                backgroundColor: '#F44336',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #000000',
                boxShadow: '0 2px 8px rgba(0,0,0,0.6)'
              }}
            >
              <Typography variant="caption" sx={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: '0.6rem' }}>
                ∅
              </Typography>
            </Box>
          )}
        </Paper>
      </motion.div>

      {/* Кнопка перетасовки */}
      {remainingCards === 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <IconButton
            onClick={handleShuffle}
            disabled={isShuffling}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'rgba(0,0,0,0.9)',
              color: '#FFFFFF',
              border: '2px solid #FFFFFF',
              boxShadow: '0 4px 12px rgba(0,0,0,0.8)',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,1)',
                transform: 'translate(-50%, -50%) scale(1.1)',
                boxShadow: '0 6px 16px rgba(0,0,0,0.9)'
              },
              '&:disabled': {
                opacity: 0.7
              }
            }}
          >
            <ShuffleIcon />
          </IconButton>
        </motion.div>
      )}

      {/* Визуализация нескольких карт в стопке */}
      <AnimatePresence>
        {remainingCards > 1 && (
          <>
            {/* Вторая карта */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                position: 'absolute',
                top: 2,
                left: 2,
                zIndex: 9
              }}
            >
              <Paper
                elevation={4}
                sx={{
                  width: 80,
                  height: 120,
                  backgroundColor: getDeckColor(),
                  borderRadius: 2,
                  opacity: 0.8
                }}
              />
            </motion.div>
            
            {/* Третья карта */}
            {remainingCards > 2 && (
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                style={{
                  position: 'absolute',
                  top: 4,
                  left: 4,
                  zIndex: 8
                }}
              >
                <Paper
                  elevation={2}
                  sx={{
                    width: 80,
                    height: 120,
                    backgroundColor: getDeckColor(),
                    borderRadius: 2,
                    opacity: 0.6
                  }}
                />
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>

      {/* Tooltip с информацией */}
      <Tooltip
        open={showTooltip}
        title={
          <Box>
            <Typography variant="body2">
              <strong>{getDeckName()}</strong>
            </Typography>
            <Typography variant="caption">
              Осталось карт: {remainingCards} из {totalCards}
            </Typography>
            {isLowCards && (
              <Typography variant="caption" sx={{ color: '#FFD700', display: 'block' }}>
                ⚠️ Карт мало! Скоро нужна перетасовка
              </Typography>
            )}
            {isEmpty && (
              <Typography variant="caption" sx={{ color: '#F44336', display: 'block' }}>
                🚫 Колода пуста! Нажмите для перетасовки
              </Typography>
            )}
          </Box>
        }
        placement="top"
        arrow
      >
        <Box />
      </Tooltip>
    </Box>
  );
};

export default CardDeck;
