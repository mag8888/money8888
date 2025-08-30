import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { CASHFLOW_THEME, COMPONENT_STYLES } from '../styles/cashflow-theme';

// 🎨 Анимированная клетка игрового поля
const AnimatedCell = ({ 
  cell, 
  index, 
  isPlayerHere, 
  playerColor, 
  onClick, 
  size = 'medium',
  variant = 'outer' // 'outer' | 'inner'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Определяем стили в зависимости от типа клетки
  const getCellStyles = () => {
    const baseStyles = COMPONENT_STYLES.cells.base;
    
    switch (cell.type) {
      case 'opportunity':
        return {
          ...baseStyles,
          background: CASHFLOW_THEME.colors.cells.opportunity.background,
          borderColor: CASHFLOW_THEME.colors.cells.opportunity.border,
          boxShadow: CASHFLOW_THEME.colors.cells.opportunity.shadow
        };
      case 'payday':
        return {
          ...baseStyles,
          background: CASHFLOW_THEME.colors.cells.payday.background,
          borderColor: CASHFLOW_THEME.colors.cells.payday.border,
          boxShadow: CASHFLOW_THEME.colors.cells.payday.shadow
        };
      case 'charity':
        return {
          ...baseStyles,
          background: CASHFLOW_THEME.colors.cells.charity.background,
          borderColor: CASHFLOW_THEME.colors.cells.charity.border,
          boxShadow: CASHFLOW_THEME.colors.cells.charity.shadow
        };
      case 'doodad':
        return {
          ...baseStyles,
          background: CASHFLOW_THEME.colors.cells.doodad.background,
          borderColor: CASHFLOW_THEME.colors.cells.doodad.border,
          boxShadow: CASHFLOW_THEME.colors.cells.doodad.shadow
        };
      case 'market':
        return {
          ...baseStyles,
          background: CASHFLOW_THEME.colors.cells.market.background,
          borderColor: CASHFLOW_THEME.colors.cells.market.border,
          boxShadow: CASHFLOW_THEME.colors.cells.market.shadow
        };
      case 'child':
        return {
          ...baseStyles,
          background: CASHFLOW_THEME.colors.cells.child.background,
          borderColor: CASHFLOW_THEME.colors.cells.child.border,
          boxShadow: CASHFLOW_THEME.colors.cells.child.shadow
        };
      case 'downsized':
        return {
          ...baseStyles,
          background: CASHFLOW_THEME.colors.cells.downsized.background,
          borderColor: CASHFLOW_THEME.colors.cells.downsized.border,
          boxShadow: CASHFLOW_THEME.colors.cells.downsized.shadow
        };
      default:
        return {
          ...baseStyles,
          background: variant === 'inner' 
            ? CASHFLOW_THEME.colors.cells.innerCircle.background
            : CASHFLOW_THEME.colors.cells.outerSquare.background,
          borderColor: variant === 'inner'
            ? CASHFLOW_THEME.colors.cells.innerCircle.border
            : CASHFLOW_THEME.colors.cells.outerSquare.border,
          boxShadow: variant === 'inner'
            ? CASHFLOW_THEME.colors.cells.innerCircle.shadow
            : CASHFLOW_THEME.colors.cells.outerSquare.shadow
        };
    }
  };

  // Определяем размеры
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { width: 40, height: 40, fontSize: '10px' };
      case 'medium':
        return { width: 60, height: 60, fontSize: '12px' };
      case 'large':
        return { width: 80, height: 80, fontSize: '14px' };
      default:
        return { width: 60, height: 60, fontSize: '12px' };
    }
  };

  const cellStyles = getCellStyles();
  const sizeStyles = getSizeStyles();

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        y: isPressed ? 0 : isHovered ? -8 : 0
      }}
      transition={{
        duration: 0.3,
        delay: index * 0.02,
        ease: "easeOutBounce"
      }}
      whileHover={{ 
        scale: 1.1,
        rotateY: 5,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.95 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onTapStart={() => setIsPressed(true)}
      onTapEnd={() => setIsPressed(false)}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <Box
        sx={{
          ...cellStyles,
          ...sizeStyles,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          color: '#FFFFFF',
          fontWeight: '600',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }
        }}
      >
        {/* Иконка клетки */}
        <motion.div
          animate={{ 
            rotate: isHovered ? 360 : 0,
            scale: isHovered ? 1.2 : 1
          }}
          transition={{ duration: 0.5, ease: "easeOutBounce" }}
          style={{ fontSize: sizeStyles.fontSize === '10px' ? '16px' : '20px', marginBottom: '4px' }}
        >
          {cell.icon}
        </motion.div>

        {/* Название клетки */}
        <Typography
          variant="caption"
          sx={{
            fontSize: sizeStyles.fontSize,
            fontWeight: 'bold',
            lineHeight: 1.2,
            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
            position: 'relative',
            zIndex: 1
          }}
        >
          {cell.name}
        </Typography>

        {/* Фишка игрока */}
        <AnimatePresence>
          {isPlayerHere && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOutBounce" }}
              style={{
                position: 'absolute',
                top: -8,
                right: -8,
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: playerColor,
                border: '3px solid #FFFFFF',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#FFFFFF',
                zIndex: 2
              }}
            >
              👤
            </motion.div>
          )}
        </AnimatePresence>

        {/* Эффект свечения при наведении */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 'inherit',
                boxShadow: `0 0 30px ${cellStyles.borderColor}`,
                pointerEvents: 'none'
              }}
            />
          )}
        </AnimatePresence>
      </Box>
    </motion.div>
  );
};

export default AnimatedCell;
