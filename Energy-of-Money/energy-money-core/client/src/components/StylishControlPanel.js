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
  Timer as TimerIcon,
  Star as StarIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { CASHFLOW_THEME, COMPONENT_STYLES } from '../styles/cashflow-theme';
import FullProfessionCard from './FullProfessionCard';

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
  const [showProfessionCard, setShowProfessionCard] = useState(false);
  const [selectedProfessionId, setSelectedProfessionId] = useState(null);

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
            {/* Отладочная информация - название файла */}
            <Typography variant="body2" sx={{ 
              color: '#ff4444',
              fontWeight: 'bold',
              mb: 1,
              fontFamily: 'monospace',
              fontSize: '0.7rem',
              position: 'relative',
              zIndex: 1
            }}>
              🐛 DEBUG: StylishControlPanel.js
            </Typography>
            
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
                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={() => {
                          console.log('👥 [StylishControlPanel] Кнопка игрока нажата:', player.username);
                          // Здесь можно добавить логику для открытия карточки игрока
                        }}
                        sx={{
                          p: 2,
                          background: isActive 
                            ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
                            : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                          color: 'white',
                          borderRadius: '12px',
                          textTransform: 'none',
                          fontSize: '1rem',
                          fontWeight: 'bold',
                          transition: 'all 0.3s ease',
                          border: `2px solid ${isActive ? '#6366f1' : '#3b82f6'}`,
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 6,
                            background: isActive 
                              ? 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)'
                              : 'linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)'
                          }
                        }}
                      >
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
                      </Button>
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
                  
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={() => {
                      console.log('🏦 [StylishControlPanel] Кнопка банка нажата');
                      // Здесь можно добавить логику для открытия модального окна банка
                    }}
                    sx={{
                      p: 3,
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      borderRadius: '16px',
                      textTransform: 'none',
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      transition: 'all 0.3s ease',
                      border: `2px solid #10b981`,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 6,
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                      }
                    }}
                  >
                    <Typography variant="h3" sx={{ 
                      color: 'white',
                      fontWeight: 'bold',
                      textShadow: '0 2px 10px rgba(255, 255, 255, 0.3)'
                    }}>
                      ${(playerData?.balance || 0).toLocaleString()}
                    </Typography>
                  </Button>
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
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Основная карточка - Бизнесы */}
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => {
                        console.log('💼 [StylishControlPanel] Кнопка бизнесов нажата');
                        setSelectedProfessionId('engineer'); // Показываем карточку инженера как пример
                        setShowProfessionCard(true);
                      }}
                      sx={{
                        p: 3,
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                        color: 'white',
                        borderRadius: '16px',
                        textTransform: 'none',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        transition: 'all 0.3s ease',
                        border: `2px solid #8b5cf6`,
                        minHeight: '120px',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: 8,
                          background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)'
                        }
                      }}
                    >
                      <BusinessIcon sx={{ 
                        color: 'white',
                        fontSize: '32px',
                        mb: 2
                      }} />
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                        Бизнесы: 0
                      </Typography>
                    </Button>
                    
                    {/* Кнопка "еще" */}
                    <Button
                      variant="outlined"
                      size="medium"
                      onClick={() => {
                        console.log('📋 [StylishControlPanel] Кнопка "еще" нажата');
                        // Показываем список доступных профессий
                        setSelectedProfessionId('teacher');
                        setShowProfessionCard(true);
                      }}
                      sx={{
                        p: 2,
                        color: '#8b5cf6',
                        borderColor: '#8b5cf6',
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: '500',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(139, 92, 246, 0.1)',
                          borderColor: '#7c3aed',
                          transform: 'translateY(-1px)'
                        }
                      }}
                    >
                      +4 еще...
                    </Button>
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
      
      {/* Полная карточка профессии */}
      <FullProfessionCard
        open={showProfessionCard}
        onClose={() => setShowProfessionCard(false)}
        professionId={selectedProfessionId}
      />
    </motion.div>
  );
};

export default StylishControlPanel;
