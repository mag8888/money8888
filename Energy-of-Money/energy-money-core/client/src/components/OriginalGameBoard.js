import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton, LinearProgress, Avatar, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { 
  Casino, 
  Timer, 
  Settings, 
  Help, 
  ExitToApp,
  PlayArrow,
  Pause,
  Refresh,
  VolumeUp,
  Fullscreen,
  AccountBalance,
  Inventory,
  Group
} from '@mui/icons-material';

const OriginalGameBoard = ({ roomId, playerData, onExit }) => {
  const [originalBoard] = useState(() => {
    // Создаем 76 клеток: 24 внутренних + 52 внешних
    const cells = [];
    
    // 24 внутренние клетки с детальной раскладкой
    const innerCells = [
      { id: 1, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯', description: 'Малая / большая сделка (на выбор)' },
      { id: 2, type: 'expenses', name: 'Всякая всячина', color: '#EC4899', icon: '🛍️', description: 'Обязательные траты от 100 до 4000$ на разные нужды (чайник, кофе, машина, ТВ, прочее)' },
      { id: 3, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯', description: 'Малая / большая сделка (на выбор)' },
      { id: 4, type: 'charity', name: 'Благотворительность', color: '#F97316', icon: '❤️', description: 'Пожертвовать деньги для получения возможности бросать 2 кубика (10% от дохода игрока, можно отказаться)' },
      { id: 5, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯', description: 'Малая / большая сделка (на выбор)' },
      { id: 6, type: 'payday', name: 'PayDay', color: '#EAB308', icon: '💰', description: 'Получить зарплату' },
      { id: 7, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯', description: 'Малая / большая сделка (на выбор)' },
      { id: 8, type: 'market', name: 'Рынок', color: '#06B6D4', icon: '🏪', description: 'Появляются покупатели на разные активы' },
      { id: 9, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯', description: 'Малая / большая сделка (на выбор)' },
      { id: 10, type: 'expenses', name: 'Всякая всячина', color: '#EC4899', icon: '🛍️', description: 'Обязательные траты от 100 до 4000$ на разные нужды (чайник, кофе, машина, ТВ, прочее)' },
      { id: 11, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯', description: 'Малая / большая сделка (на выбор)' },
      { id: 12, type: 'child', name: 'Ребенок', color: '#A855F7', icon: '👶', description: 'Родился ребенок, увеличиваются ежемесячные расходы' },
      { id: 13, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯', description: 'Малая / большая сделка (на выбор)' },
      { id: 14, type: 'payday', name: 'PayDay', color: '#EAB308', icon: '💰', description: 'Получить зарплату' },
      { id: 15, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯', description: 'Малая / большая сделка (на выбор)' },
      { id: 16, type: 'market', name: 'Рынок', color: '#06B6D4', icon: '🏪', description: 'Появляются покупатели на разные активы' },
      { id: 17, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯', description: 'Малая / большая сделка (на выбор)' },
      { id: 18, type: 'expenses', name: 'Всякая всячина', color: '#EC4899', icon: '🛍️', description: 'Обязательные траты от 100 до 4000$ на разные нужды (чайник, кофе, машина, ТВ, прочее)' },
      { id: 19, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯', description: 'Малая / большая сделка (на выбор)' },
      { id: 20, type: 'loss', name: 'Потеря', color: '#18181B', icon: '💸', description: 'Потеря денег (увольнение) - оплатите один раз расходы и пропустите 2 хода или 3 раза расходы без пропуска хода' },
      { id: 21, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯', description: 'Малая / большая сделка (на выбор)' },
      { id: 22, type: 'payday', name: 'PayDay', color: '#EAB308', icon: '💰', description: 'Получить зарплату' },
      { id: 23, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯', description: 'Малая / большая сделка (на выбор)' },
      { id: 24, type: 'market', name: 'Рынок', color: '#06B6D4', icon: '🏪', description: 'Появляются покупатели на разные активы' }
    ];
    
    // Добавляем внутренние клетки
    cells.push(...innerCells);
    
    // 52 внешние клетки (голубые)
    for (let i = 1; i <= 52; i++) {
      cells.push({
        id: i + 24,
        type: 'outer',
        name: `Быстрый Путь ${i}`,
        color: '#06B6D4' // Современный голубой
      });
    }
    
    return cells;
  });

  const [diceValue, setDiceValue] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [timerProgress, setTimerProgress] = useState(75);
  
  // Состояние игроков и их фишек
  const [players, setPlayers] = useState([
    { id: 1, name: 'MAG', position: 1, color: '#EF4444', profession: 'Инженер' },
    { id: 2, name: 'Алексей', position: 1, color: '#3B82F6', profession: 'Менеджер' },
    { id: 3, name: 'Мария', position: 1, color: '#10B981', profession: 'Дизайнер' },
    { id: 4, name: 'Дмитрий', position: 1, color: '#F59E0B', profession: 'Программист' }
  ]);
  
  const [currentPlayer, setCurrentPlayer] = useState(0); // Индекс текущего игрока

  const totalCells = originalBoard.length;

  // Функция броска кубика
  const rollDice = () => {
    if (isRolling) return;
    
    setIsRolling(true);
    const rollInterval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
    }, 100);

    setTimeout(() => {
      clearInterval(rollInterval);
      const finalValue = Math.floor(Math.random() * 6) + 1;
      setDiceValue(finalValue);
      setIsRolling(false);
      
      // Двигаем фишку текущего игрока
      movePlayer(finalValue);
    }, 1000);
  };
  
  // Функция движения игрока
  const movePlayer = (steps) => {
    const updatedPlayers = [...players];
    const player = updatedPlayers[currentPlayer];
    
    // Вычисляем новую позицию (по кругу 1-24)
    let newPosition = player.position + steps;
    if (newPosition > 24) {
      newPosition = newPosition - 24; // Замыкаем круг
    }
    
    // Обновляем позицию игрока
    player.position = newPosition;
    
    // Переходим к следующему игроку
    const nextPlayer = (currentPlayer + 1) % players.length;
    setCurrentPlayer(nextPlayer);
    
    // Обновляем состояние игроков
    setPlayers(updatedPlayers);
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
      padding: '20px',
      display: 'flex',
      gap: '30px'
    }}>
      {/* Основное игровое поле */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Заголовок */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Typography variant="h3" sx={{ 
            color: 'white', 
            mb: 2, 
            fontWeight: 'bold',
            textAlign: 'center',
            background: 'linear-gradient(45deg, #8B5CF6, #06B6D4)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Энергия Денег
          </Typography>
        </motion.div>
        
        {/* Информация о текущем игроке и кубик */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          mb: 3,
          p: 2,
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '15px',
          backdropFilter: 'blur(10px)'
        }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <Avatar sx={{ 
              bgcolor: players[currentPlayer]?.color,
              width: 40,
              height: 40
            }}>
              {players[currentPlayer]?.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                {players[currentPlayer]?.name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                {players[currentPlayer]?.profession}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <Typography variant="h6" sx={{ color: 'white' }}>
              Кубик: {diceValue}
            </Typography>
            <Button
              variant="contained"
              onClick={rollDice}
              disabled={isRolling}
              sx={{
                background: 'linear-gradient(45deg, #8B5CF6, #06B6D4)',
                color: 'white',
                fontWeight: 'bold',
                px: 3,
                py: 1,
                borderRadius: '25px',
                '&:hover': {
                  background: 'linear-gradient(45deg, #7C3AED, #0891B2)'
                }
              }}
            >
              {isRolling ? 'Бросаю...' : 'Бросить кубик'}
            </Button>
          </Box>
        </Box>

        {/* Игровое поле */}
        <Box sx={{
          position: 'relative',
          width: '800px',
          height: '800px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '30px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden'
        }}>
          {/* Центральный круг */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '200px',
                height: '200px',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)',
                borderRadius: '50%',
                border: '3px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 50px rgba(139, 92, 246, 0.6)',
                zIndex: 2
              }}
            >
              <Typography variant="h5" sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                🎯 ЦЕНТР
              </Typography>
            </Box>
          </motion.div>

          {/* 24 внутренние клетки по кругу */}
          {originalBoard.slice(0, 24).map((cell, i) => {
            const angle = (i * 360) / 24;
            const radius = 172.5; // Увеличил на 15% с 150px до 172.5px
            const x = Math.cos((angle - 90) * Math.PI / 180) * radius;
            const y = Math.sin((angle - 90) * Math.PI / 180) * radius;
            
            return (
              <motion.div
                key={cell.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                    width: '46px', // Увеличил на 15% с 40px до 46px
                    height: '46px', // Увеличил на 15% с 40px до 46px
                    background: `linear-gradient(135deg, ${cell.color} 0%, ${cell.color}DD 100%)`,
                    borderRadius: '14px', // Увеличил радиус скругления для больших клеток
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px', // Увеличил размер шрифта для больших клеток
                    fontWeight: 'bold',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                    zIndex: 1,
                    '&:hover': {
                      transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(1.3)`,
                      boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
                      zIndex: 3
                    }
                  }}
                  title={cell.description}
                >
                  {/* Иконка клетки */}
                  <Typography variant="h6" sx={{ fontSize: '20px' }}>
                    {cell.icon}
                  </Typography>
                  
                  {/* Номер клетки в левом углу */}
                  <Typography
                    sx={{
                      position: 'absolute',
                      top: '2px',
                      left: '4px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      color: 'white',
                      textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                      zIndex: 2
                    }}
                  >
                    {cell.id}
                  </Typography>
                </Box>
              </motion.div>
            );
          })}

          {/* 4 угловые карточки между малым и большим кругом */}
          {/* Верхний левый угол - Большая сделка */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) translate(-200px, -200px)', // Позиция между кругами
                width: '100px',
                height: '120px',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                borderRadius: '20px',
                border: '3px solid #EF4444',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 12px 35px rgba(16, 185, 129, 0.4), 0 0 20px rgba(239, 68, 68, 0.3)',
                zIndex: 3,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translate(-50%, -50%) translate(-200px, -200px) scale(1.05)',
                  boxShadow: '0 20px 50px rgba(16, 185, 129, 0.5), 0 0 30px rgba(239, 68, 68, 0.4)'
                }
              }}
            >
              <Typography variant="h4" sx={{ 
                color: 'white', 
                mb: 1,
                fontSize: '24px'
              }}>
                💰
              </Typography>
              <Typography variant="caption" sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: '11px',
                lineHeight: 1.2,
                textShadow: '0 1px 2px rgba(0,0,0,0.5)'
              }}>
                Большая сделка
              </Typography>
            </Box>
          </motion.div>

          {/* Верхний правый угол - Малая сделка */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) translate(200px, -200px)', // Позиция между кругами
                width: '100px',
                height: '120px',
                background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                borderRadius: '20px',
                border: '3px solid #EF4444',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 12px 35px rgba(59, 130, 246, 0.4), 0 0 20px rgba(239, 68, 68, 0.3)',
                zIndex: 3,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translate(-50%, -50%) translate(200px, -200px) scale(1.05)',
                  boxShadow: '0 20px 50px rgba(59, 130, 246, 0.5), 0 0 30px rgba(239, 68, 68, 0.4)'
                }
              }}
            >
              <Typography variant="h4" sx={{ 
                color: 'white', 
                mb: 1,
                fontSize: '24px'
              }}>
                💼
              </Typography>
              <Typography variant="caption" sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: '11px',
                lineHeight: 1.2,
                textShadow: '0 1px 2px rgba(0,0,0,0.5)'
              }}>
                Малая сделка
              </Typography>
            </Box>
          </motion.div>

          {/* Нижний правый угол - Рынок */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) translate(200px, 200px)', // Позиция между кругами
                width: '100px',
                height: '120px',
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                borderRadius: '20px',
                border: '3px solid #EF4444',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 12px 35px rgba(245, 158, 11, 0.4), 0 0 20px rgba(239, 68, 68, 0.3)',
                zIndex: 3,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translate(-50%, -50%) translate(200px, 200px) scale(1.05)',
                  boxShadow: '0 20px 50px rgba(245, 158, 11, 0.5), 0 0 30px rgba(239, 68, 68, 0.4)'
                }
              }}
            >
              <Typography variant="h4" sx={{ 
                color: 'white', 
                mb: 1,
                fontSize: '24px'
              }}>
                📈
              </Typography>
              <Typography variant="caption" sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: '11px',
                lineHeight: 1.2,
                textShadow: '0 1px 2px rgba(0,0,0,0.5)'
              }}>
                Рынок
              </Typography>
            </Box>
          </motion.div>

          {/* Нижний левый угол - Расходы */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.1 }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) translate(-200px, 200px)', // Позиция между кругами
                width: '100px',
                height: '120px',
                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                borderRadius: '20px',
                border: '3px solid #EF4444',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 12px 35px rgba(239, 68, 68, 0.4), 0 0 20px rgba(239, 68, 68, 0.3)',
                zIndex: 3,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translate(-50%, -50%) translate(-200px, 200px) scale(1.05)',
                  boxShadow: '0 20px 50px rgba(239, 68, 68, 0.5), 0 0 30px rgba(239, 68, 68, 0.4)'
                }
              }}
            >
              <Typography variant="h4" sx={{ 
                color: 'white', 
                mb: 1,
                fontSize: '24px'
              }}>
                💸
              </Typography>
              <Typography variant="caption" sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: '11px',
                lineHeight: 1.2,
                textShadow: '0 1px 2px rgba(0,0,0,0.5)'
              }}>
                Расходы
              </Typography>
            </Box>
          </motion.div>

                    {/* Фишки игроков на внутреннем круге */}
          {(() => {
            // Группируем игроков по позициям
            const playersByPosition = {};
            players.forEach(player => {
              if (!playersByPosition[player.position]) {
                playersByPosition[player.position] = [];
              }
              playersByPosition[player.position].push(player);
            });
            
            // Рендерим фишки с учетом перекрытия
            const playerTokens = players.map((player, playerIndex) => {
              const cellIndex = player.position - 1; // Позиция 1-24, индекс 0-23
              const angle = (cellIndex * 360) / 24;
              const radius = 172.5; // Радиус внутреннего круга
              const x = Math.cos((angle - 90) * Math.PI / 180) * radius;
              const y = Math.sin((angle - 90) * Math.PI / 180) * radius;
              
              // Определяем смещение для фишки, если на клетке несколько игроков
              const playersOnSameCell = playersByPosition[player.position];
              const playerIndexInCell = playersOnSameCell.indexOf(player);
              const totalPlayersOnCell = playersOnSameCell.length;
              
              // Вычисляем смещение от центра клетки
              let offsetX = 0;
              let offsetY = 0;
              
              if (totalPlayersOnCell > 1) {
                // Если на клетке несколько игроков, размещаем их по кругу
                const offsetRadius = 8; // Радиус смещения от центра клетки
                const offsetAngle = (playerIndexInCell * 360) / totalPlayersOnCell;
                offsetX = Math.cos((offsetAngle - 90) * Math.PI / 180) * offsetRadius;
                offsetY = Math.sin((offsetAngle - 90) * Math.PI / 180) * offsetRadius;
              }
              
              return (
                <motion.div
                  key={player.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.2 + playerIndex * 0.1, duration: 0.6 }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: `translate(-50%, -50%) translate(${x + offsetX}px, ${y + offsetY}px)`,
                      width: '32px',
                      height: '32px',
                      background: `linear-gradient(135deg, ${player.color} 0%, ${player.color}DD 100%)`,
                      borderRadius: '50%',
                      border: '3px solid white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: 'white',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.4), 0 0 10px rgba(255,255,255,0.3)',
                      zIndex: 4,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: `translate(-50%, -50%) translate(${x + offsetX}px, ${y + offsetY}px) scale(1.2)`,
                        boxShadow: '0 8px 25px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.4)'
                      }
                    }}
                    title={`${player.name} - ${player.profession} (позиция: ${player.position})`}
                  >
                    {player.name.charAt(0)}
                  </Box>
                </motion.div>
              );
            });
            
            // Рендерим счетчики игроков на клетках
            const cellCounters = Object.entries(playersByPosition).map(([position, playersOnCell]) => {
              if (playersOnCell.length > 1) {
                const cellIndex = parseInt(position) - 1;
                const angle = (cellIndex * 360) / 24;
                const radius = 172.5;
                const x = Math.cos((angle - 90) * Math.PI / 180) * radius;
                const y = Math.sin((angle - 90) * Math.PI / 180) * radius;
                
                return (
                  <Box
                    key={`counter-${position}`}
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                      width: '20px',
                      height: '20px',
                      background: 'rgba(0, 0, 0, 0.8)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: 'white',
                      border: '2px solid white',
                      zIndex: 5,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
                    }}
                  >
                    {playersOnCell.length}
                  </Box>
                );
              }
              return null;
            });
            
            // Возвращаем и фишки, и счетчики
            return [...playerTokens, ...cellCounters];
          })()}

          {/* 52 внешние клетки внутри периметра 700x700 - исправленное распределение */}
          {(() => {
            const outerCells = originalBoard.slice(24);
            const cells = [];
            
            // Размер внешнего квадрата
            const outerSquareSize = 700;
            const cellSize = 40; // Увеличил на 15% с 35px до 40px
            
            // Верхний ряд (14 клеток) - равномерно распределяем по всей ширине
            for (let i = 0; i < 14; i++) {
              const cell = outerCells[i];
              const spacing = (outerSquareSize - (14 * cellSize)) / 13; // Равномерные промежутки
              const x = 50 + (i * (cellSize + spacing));
              cells.push(
                <motion.div
                  key={cell.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: (i + 24) * 0.02, duration: 0.4 }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50px',
                      left: `${x}px`,
                      width: `${cellSize}px`,
                      height: `${cellSize}px`,
                      background: `linear-gradient(135deg, ${cell.color} 0%, ${cell.color}DD 100%)`,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                      zIndex: 1,
                      '&:hover': {
                        transform: 'scale(1.2)',
                        boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
                        zIndex: 3
                      }
                    }}
                    title={cell.name}
                  >
                    {cell.id - 24}
                  </Box>
                </motion.div>
              );
            }
            
            // Правый столбец (12 клеток) - фиксированное расстояние 11px
            for (let i = 0; i < 12; i++) {
              const cell = outerCells[14 + i];
              const spacing = 11; // Фиксированное расстояние 11px
              const y = 50 + (i + 1) * (cellSize + spacing);
              cells.push(
                <motion.div
                  key={cell.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: (i + 38) * 0.02, duration: 0.4 }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: `${y}px`,
                      right: '50px',
                      width: `${cellSize}px`,
                      height: `${cellSize}px`,
                      background: `linear-gradient(135deg, ${cell.color} 0%, ${cell.color}DD 100%)`,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                      zIndex: 1,
                      '&:hover': {
                        transform: 'scale(1.2)',
                        boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
                        zIndex: 3
                      }
                    }}
                    title={cell.name}
                  >
                    {cell.id - 24}
                  </Box>
                </motion.div>
              );
            }
            
            // Нижний ряд (14 клеток) - равномерно распределяем по всей ширине
            for (let i = 0; i < 14; i++) {
              const cell = outerCells[26 + i];
              const spacing = (outerSquareSize - (14 * cellSize)) / 13; // Равномерные промежутки
              const x = 50 + (i * (cellSize + spacing));
              cells.push(
                <motion.div
                  key={cell.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: (i + 50) * 0.02, duration: 0.4 }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: '50px',
                      left: `${x}px`,
                      width: `${cellSize}px`,
                      height: `${cellSize}px`,
                      background: `linear-gradient(135deg, ${cell.color} 0%, ${cell.color}DD 100%)`,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                      zIndex: 1,
                      '&:hover': {
                        transform: 'scale(1.2)',
                        boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
                        zIndex: 3
                      }
                    }}
                    title={cell.name}
                  >
                    {cell.id - 24}
                  </Box>
                </motion.div>
              );
            }
            
            // Левый столбец (12 клеток) - фиксированное расстояние 11px
            for (let i = 0; i < 12; i++) {
              const cell = outerCells[40 + i];
              const spacing = 11; // Фиксированное расстояние 11px
              const y = 50 + (i + 1) * (cellSize + spacing);
              cells.push(
                <motion.div
                  key={cell.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: (i + 64) * 0.02, duration: 0.4 }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: `${y}px`,
                      left: '50px',
                      width: `${cellSize}px`,
                      height: `${cellSize}px`,
                      background: `linear-gradient(135deg, ${cell.color} 0%, ${cell.color}DD 100%)`,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                      zIndex: 1,
                      '&:hover': {
                        transform: 'scale(1.2)',
                        boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
                        zIndex: 3
                      }
                    }}
                    title={cell.name}
                  >
                    {cell.id - 24}
                  </Box>
                </motion.div>
              );
            }
            
            return cells;
          })()}

          {/* Визуальная рамка для внешнего квадрата 700x700 */}
          <Box
            sx={{
              position: 'absolute',
              top: '50px',
              left: '50px',
              width: '700px',
              height: '700px',
              border: '2px dashed rgba(139, 92, 246, 0.6)',
              borderRadius: '0',
              pointerEvents: 'none',
              zIndex: 0
            }}
          />
        </Box>
      </Box>

      {/* Правая панель управления - 6 элементов */}
      <Box sx={{
        width: '320px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: '20px'
      }}>
        {/* Заголовок панели */}
        <Typography variant="h5" sx={{ 
          color: 'white', 
          textAlign: 'center',
          mb: 2,
          fontWeight: 'bold'
        }}>
          🎮 Управление игрой
        </Typography>

        {/* 1. Очередность игроков */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <Box sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '15px',
            padding: '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Group /> Очередность игроков
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Chip label="1. MAG (Ход)" color="primary" sx={{ background: '#8B5CF6' }} />
              <Chip label="2. Игрок 2" variant="outlined" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }} />
              <Chip label="3. Игрок 3" variant="outlined" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }} />
            </Box>
          </Box>
        </motion.div>

        {/* 2. Имя и профессия игрока - БЕЗ надписи "Текущий игрок" */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Box sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '15px',
            padding: '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#8B5CF6', width: 50, height: 50 }}>
                M
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ color: 'white' }}>
                  {playerData?.username || 'MAG'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                  💼 Менеджер
                </Typography>
              </Box>
            </Box>
          </Box>
        </motion.div>

        {/* 3. Банк */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <Box sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '15px',
            padding: '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountBalance /> Банк
            </Typography>
            <Typography variant="h4" sx={{ color: '#10B981', fontWeight: 'bold' }}>
              $2,500
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8', mt: 1 }}>
              Доход: $1,200 | Расходы: $800
            </Typography>
          </Box>
        </motion.div>

        {/* 4. Активы */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Box sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '15px',
            padding: '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Inventory /> Активы
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Chip label="🏠 Дом: $150,000" size="small" sx={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10B981' }} />
              <Chip label="📈 Акции: $25,000" size="small" sx={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3B82F6' }} />
              <Chip label="💎 Бизнес: $80,000" size="small" sx={{ background: 'rgba(139, 92, 246, 0.2)', color: '#8B5CF6' }} />
            </Box>
          </Box>
        </motion.div>

        {/* 5. Бросить кубик с анимацией */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <Button
            variant="contained"
            onClick={rollDice}
            disabled={isRolling}
            sx={{
              width: '100%',
              height: '80px',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
              color: 'white',
              borderRadius: '15px',
              fontSize: '18px',
              fontWeight: 'bold',
              boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                boxShadow: '0 12px 35px rgba(139, 92, 246, 0.4)'
              },
              '&:disabled': {
                background: 'rgba(139, 92, 246, 0.5)'
              }
            }}
          >
            {isRolling ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
              >
                🎲
              </motion.div>
            ) : (
              <>
                🎲 БРОСИТЬ КУБИК
                <br />
                <Typography variant="h4" sx={{ mt: 1 }}>
                  {diceValue}
                </Typography>
              </>
            )}
          </Button>
        </motion.div>

        {/* 6. Шкала тайминга */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Box sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '15px',
            padding: '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Timer /> Время хода
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={timerProgress} 
              sx={{
                height: 10,
                borderRadius: 5,
                background: 'rgba(255, 255, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #10B981 0%, #F59E0B 50%, #EF4444 100%)',
                    borderRadius: 5
                }
              }}
            />
            <Typography variant="body2" sx={{ color: '#94A3B8', mt: 1, textAlign: 'center' }}>
              {timerProgress}% • 45 сек осталось
            </Typography>
          </Box>
        </motion.div>

        {/* Кнопка выхода */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <Button
            variant="contained"
            startIcon={<ExitToApp />}
            onClick={onExit}
            sx={{
              width: '100%',
              height: '50px',
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              color: 'white',
              borderRadius: '15px',
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: '0 8px 25px rgba(239, 68, 68, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                boxShadow: '0 12px 35px rgba(239, 68, 68, 0.4)'
              }
            }}
          >
            🚪 ВЫХОД
          </Button>
        </motion.div>
      </Box>
    </Box>
  );
};

export default OriginalGameBoard;
