import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

const DiceAnimation = ({ value, isRolling, onAnimationComplete, onClick }) => {
  const [currentFace, setCurrentFace] = useState(1);
  const [animationPhase, setAnimationPhase] = useState('idle'); // idle, rolling, showing

  // Анимация броска кубика
  useEffect(() => {
    if (isRolling && value) {
      setAnimationPhase('rolling');
      
      // Быстрая смена граней во время броска
      const rollInterval = setInterval(() => {
        setCurrentFace(Math.floor(Math.random() * 6) + 1);
      }, 100);

      // Через 2 секунды показываем финальное значение
      setTimeout(() => {
        clearInterval(rollInterval);
        setCurrentFace(value);
        setAnimationPhase('showing');
        
        // Через 1 секунду завершаем анимацию
        setTimeout(() => {
          setAnimationPhase('idle');
          onAnimationComplete && onAnimationComplete();
        }, 1000);
      }, 2000);

      return () => clearInterval(rollInterval);
    }
  }, [isRolling, value, onAnimationComplete]);

  // Получаем точки для каждой грани кубика
  const getDiceDots = (number) => {
    const dotPositions = {
      1: [[50, 50]], // центр
      2: [[25, 25], [75, 75]], // диагональ
      3: [[25, 25], [50, 50], [75, 75]], // диагональ + центр
      4: [[25, 25], [75, 25], [25, 75], [75, 75]], // углы
      5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]], // углы + центр
      6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]] // 2 колонки
    };
    return dotPositions[number] || [];
  };

  // Анимационные варианты для кубика
  const diceVariants = {
    idle: {
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      scale: 1,
      transition: { duration: 0.3 }
    },
    rolling: {
      rotateX: [0, 360, 720, 1080],
      rotateY: [0, 180, 360, 540],
      rotateZ: [0, 90, 180, 270],
      scale: [1, 1.2, 1.1, 1],
      transition: {
        duration: 2,
        ease: "easeInOut",
        times: [0, 0.3, 0.7, 1]
      }
    },
    showing: {
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      scale: [1.2, 1],
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  // Анимация для точек
  const dotVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      mb: 2,
      cursor: onClick && animationPhase === 'idle' ? 'pointer' : 'default',
      zIndex: 1,
      position: 'relative'
    }}>
      <motion.div
        variants={diceVariants}
        animate={animationPhase}
        style={{
          perspective: '1000px',
          transformStyle: 'preserve-3d'
        }}
        onClick={onClick && animationPhase === 'idle' ? onClick : undefined}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            background: 'linear-gradient(145deg, #ffffff 0%, #f0f0f0 25%, #e0e0e0 50%, #d0d0d0 75%, #c0c0c0 100%)',
            borderRadius: '12px',
            border: '2px solid #999999',
            boxShadow: animationPhase === 'rolling' 
              ? '0 20px 40px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.8), inset 0 -2px 4px rgba(0,0,0,0.2)' 
              : '0 10px 20px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.8), inset 0 -2px 4px rgba(0,0,0,0.2)',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '8px',
              left: '8px',
              right: '8px',
              bottom: '8px',
              background: 'linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.1) 100%)',
              borderRadius: '8px',
              pointerEvents: 'none'
            }
          }}
        >
          {/* Точки кубика */}
          <AnimatePresence mode="wait">
            {getDiceDots(currentFace).map((dot, index) => (
              <motion.div
                key={`${currentFace}-${index}`}
                variants={dotVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                style={{
                  position: 'absolute',
                  left: `${dot[0]}%`,
                  top: `${dot[1]}%`,
                  width: '12px',
                  height: '12px',
                  background: 'radial-gradient(circle at 30% 30%, #666666, #000000)',
                  borderRadius: '50%',
                  transform: 'translate(-50%, -50%)',
                  boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.8), 0 1px 2px rgba(0,0,0,0.3)',
                  zIndex: 2
                }}
              />
            ))}
          </AnimatePresence>

          {/* Дополнительный блик */}
          <Box
            sx={{
              position: 'absolute',
              top: '15%',
              left: '15%',
              width: '25%',
              height: '25%',
              background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
              borderRadius: '50%',
              pointerEvents: 'none',
              zIndex: 3
            }}
          />
        </Box>
      </motion.div>

      {/* Текст под кубиком */}
      <Typography 
        variant="caption" 
        sx={{ 
          color: '#6E4D92', 
          fontSize: '0.7rem',
          mt: 0.5,
          textAlign: 'center',
          opacity: animationPhase === 'rolling' ? 0.5 : 1,
          transition: 'opacity 0.3s ease'
        }}
      >
        {animationPhase === 'rolling' ? 'Бросаем...' : 'Нажмите для броска'}
      </Typography>

      {/* Эффект частиц при броске */}
      {animationPhase === 'rolling' && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none'
          }}
        >
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                scale: 0, 
                x: 0, 
                y: 0, 
                opacity: 1 
              }}
              animate={{ 
                scale: [0, 1, 0],
                x: Math.cos(i * 45 * Math.PI / 180) * 40,
                y: Math.sin(i * 45 * Math.PI / 180) * 40,
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 1,
                delay: i * 0.1,
                repeat: Infinity,
                repeatDelay: 0.5
              }}
              style={{
                position: 'absolute',
                width: '4px',
                height: '4px',
                backgroundColor: '#FFD700',
                borderRadius: '50%'
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default DiceAnimation;
