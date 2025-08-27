import React, { useState, useEffect } from 'react';
import { Box, Button } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CasinoIcon from '@mui/icons-material/Casino';

// Компонент анимированного кубика с реальными изображениями (без GIF, чтобы исключить бесконечные циклы)
const AnimatedDice = ({ isRolling, result, size = 80 }) => {
  const diceVariants = {
    idle: { 
      scale: 1,
      transition: { duration: 0.3 }
    },
    rolling: { 
      scale: [1, 1.05, 1],
      transition: { 
        duration: 0.6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    result: { 
      scale: 1,
      transition: { duration: 0.5, type: "spring", stiffness: 200 }
    }
  };

  // Определяем поддержку TIFF
  const [supportsTiff, setSupportsTiff] = useState(true);
  useEffect(() => {
    const img = new Image();
    img.onload = () => setSupportsTiff(true);
    img.onerror = () => setSupportsTiff(false);
    img.src = '/images/K1-61.tiff';
  }, []);

  // Пути к изображениям
  const getDiceImage = (number, isAnimated = false) => {
    if (supportsTiff && !isAnimated) return `/images/K${number}-61.tiff`;
    return `/images/K${number}.gif`;
  };

  // Кадровая "анимация" с переключением граней TIFF (без GIF)
  const [currentFace, setCurrentFace] = useState(result || 1);

  useEffect(() => {
    // Если результат известен и не крутится — показать результат
    if (!isRolling && result) {
      setCurrentFace(result);
      return;
    }

    if (isRolling) {
      let face = currentFace || 1;
      const interval = setInterval(() => {
        face = face % 6 + 1;
        setCurrentFace(face);
      }, 120);
      return () => clearInterval(interval);
    }
  }, [isRolling, result]);

  // Векторный (SVG) кубик как статичная альтернатива для браузеров без TIFF
  const renderStaticSvg = (face) => (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ borderRadius: 8, boxShadow: '0 4px 8px rgba(0,0,0,0.3)', background: '#fff' }}>
      <rect x="5" y="5" width="90" height="90" rx="12" ry="12" fill="#ffffff" stroke="#e0e0e0" strokeWidth="3" />
      {
        // Расположение точек для граней 1-6
        (() => {
          const dot = (cx, cy) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="6" fill="#333" />;
          const positions = {
            1: [[50,50]],
            2: [[30,30],[70,70]],
            3: [[30,30],[50,50],[70,70]],
            4: [[30,30],[70,30],[30,70],[70,70]],
            5: [[30,30],[70,30],[50,50],[30,70],[70,70]],
            6: [[30,28],[70,28],[30,50],[70,50],[30,72],[70,72]]
          };
          return (positions[face] || []).map(([x,y]) => dot(x,y));
        })()
      }
    </svg>
  );

  return (
    <motion.div
      variants={diceVariants}
      animate={isRolling ? "rolling" : result ? "result" : "idle"}
      style={{ cursor: isRolling ? "wait" : "default" }}
    >
      {(!supportsTiff && result && !isRolling)
        ? renderStaticSvg(result)
        : (
          <img
            src={getDiceImage(currentFace, isRolling)}
            alt={`Кубик ${currentFace}`}
            width={size}
            height={size}
            style={{
              borderRadius: '8px',
              boxShadow: isRolling ? '0 0 20px rgba(74, 144, 226, 0.6)' : '0 4px 8px rgba(0,0,0,0.3)',
              transition: 'box-shadow 0.3s ease'
            }}
            onError={(e) => {
              const src = e.currentTarget.getAttribute('src') || '';
              // Если tiff не поддерживается, подменяем на gif
              if (src.endsWith('-61.tiff')) {
                e.currentTarget.src = `/images/K${currentFace}.gif`;
              }
            }}
          />
        )}
    </motion.div>
  );
};

// Основной компонент DiceRoller
const DiceRoller = ({ 
  onRoll, 
  disabled = false, 
  buttonText = "🎲 Бросить кубик",
  size = 80,
  showResult = true,
  autoRoll = false // Автоматический бросок при монтировании
}) => {
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState(null);
  const [hasRolled, setHasRolled] = useState(false);

  // Автоматический бросок при монтировании
  useEffect(() => {
    if (autoRoll && !hasRolled) {
      handleRoll();
    }
  }, [autoRoll, hasRolled]);

  const handleRoll = async () => {
    if (isRolling || disabled) return;

    setIsRolling(true);
    setResult(null);

    // Запускаем анимацию
    await new Promise(resolve => setTimeout(resolve, 500));

    // Вызываем callback для получения результата от сервера
    if (onRoll && typeof onRoll === 'function') {
      const diceResult = await onRoll();
      
      // Показываем результат
      setResult(diceResult);
      setHasRolled(true);
      // МГНОВЕННО останавливаем анимацию на выпавшей грани
      setIsRolling(false);
    } else {
      // Если нет callback, генерируем случайный результат для демонстрации
      const randomResult = Math.floor(Math.random() * 6) + 1;
      setResult(randomResult);
      setHasRolled(true);
      // МГНОВЕННО останавливаем анимацию
      setIsRolling(false);
    }
  };

  const resetDice = () => {
    setResult(null);
    setHasRolled(false);
    setIsRolling(false);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: 2 
    }}>
      {/* Анимированный кубик с реальными изображениями */}
      <AnimatePresence mode="wait">
        <AnimatedDice 
          key={`dice-${isRolling}-${result}`}
          isRolling={isRolling} 
          result={result} 
          size={size} 
        />
      </AnimatePresence>

      {/* Кнопка броска */}
      {!hasRolled && (
        <Button
          variant="contained"
          size="large"
          onClick={handleRoll}
          disabled={disabled || isRolling}
          startIcon={<CasinoIcon />}
          sx={{ 
            fontSize: '1.1rem', 
            py: 1.5, 
            px: 3,
            minWidth: '180px',
            background: 'linear-gradient(45deg, #4A90E2, #357ABD)',
            '&:hover': {
              background: 'linear-gradient(45deg, #357ABD, #2E5BBA)',
            }
          }}
        >
          {isRolling ? '🎲 Бросаю...' : buttonText}
        </Button>
      )}

      {/* Результат */}
      {showResult && result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <Box sx={{ 
            textAlign: 'center',
            p: 2,
            borderRadius: 2,
            background: 'rgba(74, 144, 226, 0.1)',
            border: '2px solid #4A90E2'
          }}>
            <Box sx={{ 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              color: '#4A90E2',
              mb: 1
            }}>
              🎯 Результат: {result}
            </Box>
            <Button
              variant="outlined"
              size="small"
              onClick={resetDice}
              sx={{ 
                borderColor: '#4A90E2',
                color: '#4A90E2',
                '&:hover': {
                  borderColor: '#357ABD',
                  backgroundColor: 'rgba(74, 144, 226, 0.1)'
                }
              }}
            >
              Бросить снова
            </Button>
          </Box>
        </motion.div>
      )}
    </Box>
  );
};

export default DiceRoller;
