import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Avatar, 
  Button, 
  LinearProgress,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Casino as CasinoIcon,
  Person as PersonIcon,
  AccountBalance as BankIcon,
  AttachMoney as MoneyIcon,
  Business as BusinessIcon,
  Home as HomeIcon,
  TrendingUp as StockIcon,
  Timer as TimerIcon,
  Star as StarIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { CASHFLOW_THEME, COMPONENT_STYLES } from '../styles/cashflow-theme';

// 🎨 Стильная панель управления Cashflow
const StylishControlPanel = ({
  players = [],
  currentTurn,
  playerData,
  onRollDice,
  isMyTurn,
  isRolling,
  timer = 120
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [activeSection, setActiveSection] = useState('players');

  // Анимация появления
  const containerVariants = {
    hidden: { x: 100, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
              transition: {
          duration: 0.6,
          ease: "easeOut",
          staggerChildren: 0.1
        }
    },
    exit: { x: 100, opacity: 0 }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  // Автоматическое скрытие панели
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Показать панель при наведении
  const handleMouseEnter = () => setIsVisible(true);
  const handleMouseLeave = () => {
    setTimeout(() => setIsVisible(false), 2000);
  };

  // Получить цвет игрока
  const getPlayerColor = (index) => {
    return CASHFLOW_THEME.colors.playerTokens[index % CASHFLOW_THEME.colors.playerTokens.length];
  };

  // Получить статус игрока
  const getPlayerStatus = (player) => {
    if (player.id === currentTurn) return 'active';
    if (player.isReady) return 'ready';
    return 'waiting';
  };

  // Получить цвет статуса
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return CASHFLOW_THEME.colors.success.main;
      case 'ready': return CASHFLOW_THEME.colors.warning.main;
      default: return CASHFLOW_THEME.colors.error.main;
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      exit="exit"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'fixed',
        right: 20,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 1000
      }}
    >
      <Box
        sx={{
          ...COMPONENT_STYLES.controlPanel.container,
          width: 320,
          maxHeight: '80vh',
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px'
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '4px'
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255,255,255,0.3)',
            borderRadius: '4px',
            '&:hover': {
              background: 'rgba(255,255,255,0.5)'
            }
          }
        }}
      >
        {/* Заголовок панели */}
        <motion.div variants={itemVariants}>
          <Box sx={{ 
            textAlign: 'center', 
            mb: 3, 
            p: 2,
            background: CASHFLOW_THEME.effects.gradients.primary,
            borderRadius: '16px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                opacity: 0.3
              }}
            />
            <Typography variant="h5" sx={{ 
              color: '#FFFFFF', 
              fontWeight: 'bold',
              position: 'relative',
              zIndex: 1
            }}>
              🎮 Cashflow
            </Typography>
            <Typography variant="body2" sx={{ 
              color: 'rgba(255,255,255,0.8)',
              position: 'relative',
              zIndex: 1
            }}>
              Панель управления
            </Typography>
          </Box>
        </motion.div>

        {/* Навигация по секциям */}
        <motion.div variants={itemVariants}>
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            mb: 3,
            justifyContent: 'center'
          }}>
            {[
              { key: 'players', label: 'Игроки', icon: '👥' },
              { key: 'player', label: 'Профиль', icon: '👤' },
              { key: 'game', label: 'Игра', icon: '🎲' }
            ].map((section) => (
              <Tooltip key={section.key} title={section.label}>
                <IconButton
                  onClick={() => setActiveSection(section.key)}
                  sx={{
                    bgcolor: activeSection === section.key 
                      ? CASHFLOW_THEME.colors.primary.main 
                      : 'rgba(255,255,255,0.1)',
                    color: activeSection === section.key ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                    '&:hover': {
                      bgcolor: activeSection === section.key 
                        ? CASHFLOW_THEME.colors.primary.dark 
                        : 'rgba(255,255,255,0.2)'
                    }
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{section.icon}</span>
                </IconButton>
              </Tooltip>
            ))}
          </Box>
        </motion.div>

        {/* Секция игроков */}
        <AnimatePresence mode="wait">
          {activeSection === 'players' && (
            <motion.div
              key="players"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ ...COMPONENT_STYLES.controlPanel.section }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <StarIcon sx={{ color: CASHFLOW_THEME.colors.warning.main }} />
                  Очередность игроков
                </Typography>
                
                {players.map((player, index) => {
                  const status = getPlayerStatus(player);
                  const isActive = player.id === currentTurn;
                  
                  return (
                    <motion.div
                      key={player.id}
                      variants={itemVariants}
                      whileHover={{ scale: 1.02 }}
                      style={{ marginBottom: '12px' }}
                    >
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 2,
                        bgcolor: isActive 
                          ? 'rgba(99, 102, 241, 0.2)' 
                          : 'rgba(255,255,255,0.05)',
                        borderRadius: '12px',
                        border: `2px solid ${isActive ? CASHFLOW_THEME.colors.primary.main : 'transparent'}`,
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        {/* Номер игрока */}
                        <Box sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: getPlayerColor(index),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2,
                          fontWeight: 'bold',
                          color: '#FFFFFF',
                          fontSize: '14px'
                        }}>
                          {index + 1}
                        </Box>

                        {/* Аватар и имя */}
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" sx={{ 
                            color: '#FFFFFF', 
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}>
                            {player.username}
                            {isActive && (
                              <Chip 
                                label="ХОД" 
                                size="small" 
                                sx={{ 
                                  bgcolor: CASHFLOW_THEME.colors.primary.main,
                                  color: '#FFFFFF',
                                  fontSize: '10px',
                                  height: '20px'
                                }} 
                              />
                            )}
                          </Typography>
                          
                          {/* Статус */}
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1,
                            mt: 0.5
                          }}>
                            <Box sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: getStatusColor(status)
                            }} />
                            <Typography variant="caption" sx={{ 
                              color: 'rgba(255,255,255,0.7)',
                              textTransform: 'capitalize'
                            }}>
                              {status === 'active' ? 'Активен' : 
                               status === 'ready' ? 'Готов' : 'Ожидает'}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Трофей для активного игрока */}
                        {isActive && (
                          <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <TrophyIcon sx={{ 
                              color: CASHFLOW_THEME.colors.warning.main,
                              fontSize: '24px'
                            }} />
                          </motion.div>
                        )}
                      </Box>
                    </motion.div>
                  );
                })}
              </Box>
            </motion.div>
          )}

          {/* Секция профиля игрока */}
          {activeSection === 'player' && (
            <motion.div
              key="player"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ ...COMPONENT_STYLES.controlPanel.section }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <PersonIcon sx={{ color: CASHFLOW_THEME.colors.secondary.main }} />
                  Текущий игрок
                </Typography>
                
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Avatar sx={{ 
                    width: 80, 
                    height: 80, 
                    mx: 'auto', 
                    mb: 2,
                    background: CASHFLOW_THEME.effects.gradients.secondary,
                    fontSize: '32px',
                    fontWeight: 'bold'
                  }}>
                    {playerData?.username?.charAt(0) || '?'}
                  </Avatar>
                  
                  <Typography variant="h6" sx={{ 
                    color: '#FFFFFF', 
                    fontWeight: 'bold',
                    mb: 1
                  }}>
                    {playerData?.username || 'Неизвестно'}
                  </Typography>
                  
                  <Chip 
                    label={playerData?.profession || 'Профессия не выбрана'} 
                    sx={{ 
                      bgcolor: CASHFLOW_THEME.colors.secondary.main,
                      color: '#FFFFFF'
                    }} 
                  />
                </Box>

                {/* Банк */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ 
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <BankIcon sx={{ color: CASHFLOW_THEME.colors.success.main }} />
                    Банк
                  </Typography>
                  
                  <Box sx={{
                    p: 3,
                    bgcolor: 'rgba(16, 185, 129, 0.2)',
                    borderRadius: '16px',
                    border: `2px solid ${CASHFLOW_THEME.colors.success.main}`,
                    textAlign: 'center'
                  }}>
                    <Typography variant="h3" sx={{ 
                      color: CASHFLOW_THEME.colors.success.main,
                      fontWeight: 'bold',
                      textShadow: '0 2px 10px rgba(16, 185, 129, 0.5)'
                    }}>
                      ${(playerData?.balance || 0).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>

                {/* Активы */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ 
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <MoneyIcon sx={{ color: CASHFLOW_THEME.colors.warning.main }} />
                    Активы
                  </Typography>
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box sx={{
                      p: 2,
                      bgcolor: 'rgba(139, 92, 246, 0.2)',
                      borderRadius: '12px',
                      border: `1px solid ${CASHFLOW_THEME.colors.cells.doodad.border}`,
                      textAlign: 'center'
                    }}>
                      <BusinessIcon sx={{ 
                        color: CASHFLOW_THEME.colors.cells.doodad.main,
                        fontSize: '24px',
                        mb: 1
                      }} />
                      <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                        Бизнесы: 0
                      </Typography>
                    </Box>
                    
                    <Box sx={{
                      p: 2,
                      bgcolor: 'rgba(6, 182, 212, 0.2)',
                      borderRadius: '12px',
                      border: `1px solid ${CASHFLOW_THEME.colors.cells.market.border}`,
                      textAlign: 'center'
                    }}>
                      <HomeIcon sx={{ 
                        color: CASHFLOW_THEME.colors.cells.market.main,
                        fontSize: '24px',
                        mb: 1
                      }} />
                      <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                        Недвижимость: 0
                      </Typography>
                    </Box>
                    
                    <Box sx={{
                      p: 2,
                      bgcolor: 'rgba(16, 185, 129, 0.2)',
                      borderRadius: '12px',
                      border: `1px solid ${CASHFLOW_THEME.colors.cells.opportunity.border}`,
                      textAlign: 'center'
                    }}>
                      <StockIcon sx={{ 
                        color: CASHFLOW_THEME.colors.cells.opportunity.main,
                        fontSize: '24px',
                        mb: 1
                      }} />
                      <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                        Акции: 0
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </motion.div>
          )}

          {/* Секция игры */}
          {activeSection === 'game' && (
            <motion.div
              key="game"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ ...COMPONENT_STYLES.controlPanel.section }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <CasinoIcon sx={{ color: CASHFLOW_THEME.colors.primary.main }} />
                  Бросок кубика
                </Typography>
                
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<CasinoIcon />}
                  onClick={onRollDice}
                  disabled={!isMyTurn() || isRolling}
                  sx={{
                    ...COMPONENT_STYLES.buttons.primary,
                    height: '56px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    mb: 3,
                    '&:hover': {
                      ...COMPONENT_STYLES.buttons.hover
                    }
                  }}
                >
                  {isRolling ? '⏳ Ожидание...' : '🎲 Бросить кубик'}
                </Button>

                {/* Таймер хода */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ 
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <TimerIcon sx={{ color: CASHFLOW_THEME.colors.warning.main }} />
                    Таймер хода
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={Math.max(0, (timer / 120) * 100)}
                      sx={{
                        height: 12,
                        borderRadius: 6,
                        bgcolor: 'rgba(255,255,255,0.1)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 6,
                          background: timer > 60 
                            ? CASHFLOW_THEME.colors.success.main
                            : timer > 30 
                            ? CASHFLOW_THEME.colors.warning.main 
                            : CASHFLOW_THEME.colors.error.main,
                          boxShadow: `0 0 20px ${timer > 60 
                            ? CASHFLOW_THEME.colors.success.main
                            : timer > 30 
                            ? CASHFLOW_THEME.colors.warning.main 
                            : CASHFLOW_THEME.colors.error.main}`
                        }
                      }}
                    />
                  </Box>
                  
                  <Typography variant="h4" sx={{ 
                    textAlign: 'center',
                    color: timer > 60 
                      ? CASHFLOW_THEME.colors.success.main
                      : timer > 30 
                      ? CASHFLOW_THEME.colors.warning.main 
                      : CASHFLOW_THEME.colors.error.main,
                    fontWeight: 'bold',
                    textShadow: `0 0 20px ${timer > 60 
                      ? CASHFLOW_THEME.colors.success.main
                      : timer > 30 
                      ? CASHFLOW_THEME.colors.warning.main 
                      : CASHFLOW_THEME.colors.error.main}`,
                    fontFamily: 'monospace'
                  }}>
                    {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </motion.div>
  );
};

export default StylishControlPanel;
