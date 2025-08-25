import React, { useState } from 'react';
import { Box, Button, Typography, Chip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { motion } from 'framer-motion';
import ProfessionModal from './ProfessionModal';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import BuildIcon from '@mui/icons-material/Build';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import InventoryIcon from '@mui/icons-material/Inventory';
import { 
  Home as HomeIcon, 
  Business as BusinessIcon, 
  TrendingUp as TrendingUpIcon, 
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as AttachMoneyIcon 
} from '@mui/icons-material';

// Компонент таймера хода
const TurnTimer = React.memo(({ timer, isActive, isMyTurn, diceValue, onRollDice, isRolling, hasCharity }) => {
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timer <= 15) return '#f44336'; // Красный для критического времени (15 сек)
    if (timer <= 30) return '#f44336'; // Красный для предупреждения (30 сек)
    if (timer <= 60) return '#ffeb3b'; // Желтый для 1 минуты
    return '#4caf50'; // Зеленый для 2 минут
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography
          variant="h6"
          sx={{
            color: getTimerColor(),
            fontWeight: 'bold',
            textShadow: timer <= 15 ? '0 0 10px rgba(244, 67, 54, 0.5)' : 'none',
            animation: timer <= 15 ? 'pulse 1s infinite' : 'none'
          }}
        >
          {formatTime(timer)}
        </Typography>
        
        {/* Кликабельный кубик */}
        <Button
          variant="contained"
          onClick={() => {
            console.log('🎲 [TurnTimer] Кубик нажат!', {
              onRollDice: typeof onRollDice,
              isRolling,
              isMyTurn,
              diceValue
            });
            
            // Кубик нажат - логируем
            console.log('🎯 [TurnTimer] Кубик нажат!');
            
            if (onRollDice && typeof onRollDice === 'function') {
              console.log('✅ [TurnTimer] Вызываем onRollDice');
              onRollDice();
            } else {
              console.error('❌ [TurnTimer] onRollDice не работает:', onRollDice);
              // Создаем тестовое значение кубика
              const testValue = Math.floor(Math.random() * 6) + 1;
              console.log('🎲 [TurnTimer] Тестовое значение кубика:', testValue);
            }
          }}
          disabled={isRolling || !isMyTurn}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            backgroundColor: '#FFD700',
            color: '#333',
            padding: '8px 12px',
            borderRadius: '12px',
            border: `2px solid ${diceValue > 0 ? '#FFA000' : '#FFD700'}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            fontSize: '1.3rem',
            fontWeight: 'bold',
            minWidth: '80px',
            minHeight: '50px',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: diceValue > 0 ? '#FFA000' : '#FFD700',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
            },
            '&:active': {
              transform: 'translateY(0)'
            },
            '&:disabled': {
              backgroundColor: 'rgba(255, 215, 0, 0.3)',
              color: 'rgba(51, 51, 51, 0.5)',
              transform: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              cursor: 'not-allowed'
            }
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>🎲</span>
          {isRolling ? '...' : (diceValue > 0 ? diceValue : '?')}
        </Button>
      </Box>
      
      {/* Прогресс-бар таймера */}
      <Box
        sx={{
          width: '100%',
          height: 4,
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: `${(timer / 120) * 100}%` }}
          transition={{ duration: 0.5 }}
          style={{
            height: '100%',
            backgroundColor: getTimerColor(),
            borderRadius: 2
          }}
        />
      </Box>
    </Box>
  );
});

// Компонент кнопки следующего игрока
const NextPlayerButton = React.memo(({ 
  isMyTurn, 
  onEndTurn, 
  timer, 
  isActive,
  diceValue,
  onRollDice,
  isRolling
}) => {
  const [timeAfterRoll, setTimeAfterRoll] = React.useState(0);
  const [isRollCooldown, setIsRollCooldown] = React.useState(false);
  
  // Эффект для отслеживания времени после броска кубика
  React.useEffect(() => {
    let interval;
    
    if (diceValue > 0 && isMyTurn && !isRollCooldown) {
      // Начинаем отсчет 5 секунд после броска
      setIsRollCooldown(true);
      setTimeAfterRoll(5);
      
      interval = setInterval(() => {
        setTimeAfterRoll(prev => {
          if (prev <= 1) {
            setIsRollCooldown(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (diceValue === 0) {
      // Сбрасываем состояние при новом броске
      setIsRollCooldown(false);
      setTimeAfterRoll(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [diceValue, isMyTurn]);
  const getButtonColor = () => {
    if (!isMyTurn) return '#9E9E9E'; // Серый для неактивного состояния
    if (isRollCooldown) return '#FF9800'; // Оранжевый во время кулдауна
    if (timer <= 15) return '#f44336'; // Красный для критического времени (15 сек)
    if (timer <= 30) return '#f44336'; // Красный для предупреждения (30 сек)
    if (timer <= 60) return '#ff9800'; // Оранжевый для 1 минуты
    return '#4caf50'; // Зеленый для 2 минут
  };

  const getButtonText = () => {
    if (!isMyTurn) return 'ОЖИДАНИЕ';
    if (diceValue === 0) return 'БРОСИТЬ КУБИК';
    if (timer <= 10) return 'СРОЧНО!';
    if (timer <= 30) return 'ВНИМАНИЕ!';
    return 'ПЕРЕХОД ХОДА';
  };

  const handleButtonClick = () => {
    if (diceValue === 0 && onRollDice) {
      onRollDice();
    } else if (onEndTurn) {
      onEndTurn();
    }
  };

  return (
    <motion.div
      whileHover={isMyTurn ? { scale: 1.05 } : {}}
      whileTap={isMyTurn ? { scale: 0.95 } : {}}
    >
      <Button
        variant="contained"
        onClick={handleButtonClick}
        disabled={!isMyTurn || isRolling}
        startIcon={<AutorenewIcon />}
        sx={{
          backgroundColor: getButtonColor(),
          color: 'white',
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: 'bold',
          borderRadius: '12px',
          boxShadow: timer <= 10 ? '0 0 20px rgba(244, 67, 54, 0.5)' : '0 4px 8px rgba(0,0,0,0.2)',
          '&:hover': {
            backgroundColor: getButtonColor(),
            transform: isMyTurn ? 'translateY(-2px)' : 'none',
            boxShadow: timer <= 10 ? '0 0 30px rgba(244, 67, 54, 0.7)' : '0 6px 12px rgba(0,0,0,0.3)'
          },
          '&:disabled': {
            backgroundColor: '#9E9E9E',
            color: 'rgba(255,255,255,0.5)'
          }
        }}
      >
        {getButtonText()}
      </Button>
      
      {/* Подсказка */}
      {isMyTurn && (
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            textAlign: 'center',
            marginTop: 1,
            color: 'rgba(255,255,255,0.7)',
            fontSize: '12px'
          }}
        >
          Нажмите "ПЕРЕХОД ХОДА" или ждите окончания таймера
        </Typography>
      )}
    </motion.div>
  );
});

// Компонент панели управления
const GameControls = React.memo(({ 
  isMyTurn, 
  currentTurn, 
  players, 
  myId, 
  onEndTurn, 
  onBankClick, 
  onProfessionClick, 
  onFreedomClick, 
  onExitClick, 
  timer, 
  isTimerActive, 
  turnBanner,
  currentPlayer,
  playerProfession,
  playerBalance,
  diceValue,
  onPauseTimer,
  onResumeTimer,
  isHost,
  timerPaused,
  onRollDice,
  isRolling,
  hasCharity,
  roomId
}) => {
  const [assetsModalOpen, setAssetsModalOpen] = React.useState(false);
  const [professionModalOpen, setProfessionModalOpen] = useState(false);
  
  // Отладочная информация
  console.log('🎮 [GameControls] Получены пропсы:', {
    isMyTurn,
    currentTurn,
    playersCount: players?.length || 0,
    players: players,
    myId,
    currentPlayer,
    playerProfession,
    playerBalance,
    turnBanner,
    onRollDice: typeof onRollDice,
    isRolling,
    hasCharity
  });
  
  // Используем реальных игроков с проверками
  const realPlayers = players && Array.isArray(players) ? players : [];
  
  // Добавляем проверки на undefined
  const currentPlayerData = realPlayers.length > 0 ? realPlayers.find(p => p.id === currentTurn) : null;
  const myPlayer = realPlayers.length > 0 ? realPlayers.find(p => p.id === myId) : null;

  // Вспомогательные функции для активов
  const getAssetIcon = (type) => {
    switch (type) {
      case 'realEstate': return <HomeIcon />;
      case 'business': return <BusinessIcon />;
      case 'stock': return <TrendingUpIcon />;
      case 'doodad': return <ShoppingCartIcon />;
      default: return <AttachMoneyIcon />;
    }
  };

  const getAssetTypeName = (type) => {
    switch (type) {
      case 'realEstate': return 'Недвижимость';
      case 'business': return 'Бизнес';
      case 'stock': return 'Акции';
      case 'doodad': return 'Покупка';
      case 'charity': return 'Благотворительность';
      default: return type;
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        padding: 2,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 2,
        border: '1px solid rgba(255,255,255,0.1)',
        width: 'fit-content',
        minWidth: 280,
        alignSelf: 'center'
      }}
    >
      {/* Информация о комнате */}
      <Box
        sx={{
          backgroundColor: 'rgba(0,0,0,0.3)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: 1,
          textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.2)'
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 'bold', marginBottom: '4px' }}>
          🏠 Комната: {roomId || 'Неизвестно'}
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          ID: {roomId || 'N/A'}
        </Typography>
      </Box>

      {/* Баннер текущего хода */}
      {turnBanner && (
        <Box
          sx={{
            backgroundColor: isMyTurn ? '#4CAF50' : '#FF9800',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1
          }}
        >
          {isMyTurn && (
            <Box
              sx={{
                width: 8,
                height: 8,
                backgroundColor: 'white',
                borderRadius: '50%',
                animation: 'pulse 1s infinite'
              }}
            />
          )}
          {turnBanner}
        </Box>
      )}

      {/* Информация о текущем игроке */}
      {currentPlayer && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            padding: '8px 12px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: 1
          }}
        >
          <Chip
            label={currentPlayer?.profession?.name || 'Engineer'}
            size="small"
            sx={{
              backgroundColor: '#FFD700',
              color: '#333',
              fontWeight: 'bold'
            }}
          />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
          {currentPlayer?.username || 'Неизвестный игрок'}
        </Typography>
        </Box>
      )}

      {/* Очередность игроков */}
      <Box
        sx={{
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderRadius: 2,
          padding: 2,
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <Typography 
          variant="subtitle2" 
          sx={{ 
            color: 'rgba(255,255,255,0.8)', 
            mb: 1,
            textAlign: 'center',
            fontWeight: 'bold'
          }}
        >
          🎯 Очередность игроков
        </Typography>
        
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 1
          }}
        >
          
          {realPlayers && realPlayers.length > 0 ? (
            realPlayers.map((player, index) => {
              const isCurrentTurn = player.id === currentTurn;
              const isMyPlayer = player.id === myId;
              

              
              return (
                <Box
                  key={player.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    padding: '6px 10px',
                    backgroundColor: isCurrentTurn 
                      ? 'rgba(255, 215, 0, 0.4)' 
                      : isMyPlayer
                      ? 'rgba(76, 175, 80, 0.3)'
                      : 'rgba(255,255,255,0.05)',
                    borderRadius: 2,
                    border: isCurrentTurn 
                      ? '3px solid #FFD700' 
                      : isMyPlayer
                      ? '2px solid #4CAF50'
                      : '1px solid rgba(255,255,255,0.1)',
                    position: 'relative',
                    boxShadow: isCurrentTurn 
                      ? '0 0 15px rgba(255, 215, 0, 0.6), inset 0 0 10px rgba(255, 215, 0, 0.1)' 
                      : isMyPlayer
                      ? '0 0 10px rgba(76, 175, 80, 0.4)'
                      : 'none',
                    transform: isCurrentTurn ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: isCurrentTurn ? '#FFD700' : isMyPlayer ? '#4CAF50' : 'rgba(255,255,255,0.6)',
                      fontWeight: 'bold',
                      minWidth: '20px'
                    }}
                  >
                    {index + 1}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'rgba(255,255,255,0.8)',
                      fontSize: '0.7rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {player.username}
                  </Typography>
                  {isCurrentTurn && (
                    <Box
                      sx={{
                        position: 'absolute',
                        right: '6px',
                        width: 12,
                        height: 12,
                        backgroundColor: '#FFD700',
                        borderRadius: '50%',
                        animation: 'pulse 1s infinite',
                        boxShadow: '0 0 10px rgba(255, 215, 0, 0.8)',
                        border: '2px solid #FFF'
                      }}
                    />
                  )}
                  {isMyPlayer && !isCurrentTurn && (
                    <Box
                      sx={{
                        position: 'absolute',
                        right: '6px',
                        width: 8,
                        height: 8,
                        backgroundColor: '#4CAF50',
                        borderRadius: '50%',
                        border: '1px solid #FFF'
                      }}
                    />
                  )}
                </Box>
              );
            })
          ) : (
            <Box
              sx={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: 2,
                color: 'rgba(255,255,255,0.5)',
                fontSize: '0.8rem'
              }}
            >
              Нет игроков в комнате
            </Box>
          )}
        </Box>
      </Box>



      {/* Кнопка банка */}
      <Button
        variant="contained"
        onClick={onBankClick}
        startIcon={<AccountBalanceIcon />}
        sx={{
          backgroundColor: '#4CAF50',
          color: 'white',
          '&:hover': {
            backgroundColor: '#45a049'
          }
        }}
      >
        БАНК
      </Button>

      {/* Карточка профессии и баланса игрока */}
      <Box
        sx={{
          backgroundColor: '#FF9800',
          borderRadius: 2,
          p: 2,
          border: '2px solid #F57C00',
          textAlign: 'center'
        }}
      >
        {playerProfession && typeof playerProfession === 'object' && playerProfession.name && (
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'white', 
              fontWeight: 'bold',
              mb: 1,
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' }
            }}
            onClick={() => setProfessionModalOpen(true)}
          >
            💼 {playerProfession.name}
          </Typography>
        )}
        
        {/* Отладочная информация */}
        {process.env.NODE_ENV === 'development' && (
          <>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>
              Debug: {JSON.stringify(playerProfession, null, 2)}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>
              playerBalance: {playerBalance}
            </Typography>
          </>
        )}
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'rgba(255,255,255,0.9)', 
            mb: 0.5
          }}
        >
          💵 Зарплата: ${(playerProfession?.salary || 0).toLocaleString()}
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'rgba(255,255,255,0.9)', 
            mb: 0.5
          }}
        >
          📊 Расходы: ${(playerProfession?.expenses || 0).toLocaleString()}
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'rgba(255,255,255,0.9)', 
            mb: 0.5
          }}
        >
          💎 Пассивный доход: ${(playerProfession?.passiveIncome || 0).toLocaleString()}
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'white', 
            fontWeight: 'bold',
            mb: 1
          }}
        >
          💰 Баланс: ${(playerProfession?.balance || playerBalance || 0).toLocaleString()}
        </Typography>
      </Box>

      {/* Кнопка финансовой свободы */}
      <Button
        variant="contained"
        onClick={onFreedomClick}
        startIcon={<EmojiEventsIcon />}
        sx={{
          backgroundColor: '#9C27B0',
          color: 'white',
          '&:hover': {
            backgroundColor: '#7B1FA2'
          }
        }}
      >
        ФИНАНСОВАЯ СВОБОДА
      </Button>

      {/* Кнопка активов */}
      <Button
        variant="contained"
        onClick={() => setAssetsModalOpen(true)}
        startIcon={<InventoryIcon />}
        sx={{
          backgroundColor: '#00BCD4',
          color: 'white',
          '&:hover': {
            backgroundColor: '#0097A7'
          }
        }}
      >
        АКТИВЫ ({currentPlayer?.assets?.length || 0})
      </Button>

      {/* Кнопка выхода */}
      <Button
        variant="outlined"
        onClick={onExitClick}
        startIcon={<ExitToAppIcon />}
        sx={{
          borderColor: '#FF5722',
          color: '#FF5722',
          '&:hover': {
            borderColor: '#D84315',
            backgroundColor: 'rgba(255, 87, 34, 0.1)'
          }
        }}
      >
        ВЫЙТИ
      </Button>

      {/* Таймер хода */}
      <TurnTimer
        timer={timer}
        isActive={isTimerActive}
        isMyTurn={isMyTurn}
        diceValue={diceValue}
        onRollDice={onRollDice}
        isRolling={isRolling}
        hasCharity={hasCharity}
      />

      {/* Управление таймером для хоста */}
      {isHost && (
        <Box sx={{ 
          display: 'flex', 
          gap: 1, 
          justifyContent: 'center',
          mb: 1
        }}>
          {timerPaused ? (
            <Button
              variant="contained"
              size="small"
              onClick={onResumeTimer}
              sx={{
                backgroundColor: '#4CAF50',
                color: 'white',
                '&:hover': { backgroundColor: '#45a049' }
              }}
            >
              ▶️ Возобновить
            </Button>
          ) : (
            <Button
              variant="contained"
              size="small"
              onClick={onPauseTimer}
              sx={{
                backgroundColor: '#FF9800',
                color: 'white',
                '&:hover': { backgroundColor: '#F57C00' }
              }}
            >
              ⏸️ Пауза
            </Button>
          )}
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'rgba(255,255,255,0.6)',
              alignSelf: 'center',
              fontSize: '0.7rem'
            }}
          >
            Только хост
          </Typography>
        </Box>
      )}

      {/* Кнопка следующего игрока */}
      <NextPlayerButton
        isMyTurn={isMyTurn}
        onEndTurn={onEndTurn}
        timer={timer}
        isActive={isTimerActive}
        diceValue={diceValue}
        onRollDice={onRollDice}
        isRolling={isRolling}
      />

      {/* Модальное окно активов */}
      <Dialog
        open={assetsModalOpen}
        onClose={() => setAssetsModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InventoryIcon sx={{ color: '#00BCD4' }} />
            Мои Активы
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {!currentPlayer?.assets || currentPlayer.assets.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
                У вас пока нет активов
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Покупайте карточки на игровом поле, чтобы они появились здесь
              </Typography>
            </Box>
          ) : (
            <Box sx={{ py: 2 }}>
                      <Typography variant="h6" sx={{ mb: 3, color: 'primary.main' }}>
          Всего активов: {currentPlayer?.assets?.length || 0}
        </Typography>
              
              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                {currentPlayer?.assets?.map((asset, index) => (
                  <Box
                    key={asset.id || index}
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      backgroundColor: 'background.paper',
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '1.5rem'
                        }}
                      >
                        {getAssetIcon(asset.type)}
                      </Box>
                      
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {asset.name || `Актив ${index + 1}`}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {getAssetTypeName(asset.type)}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Стоимость: ${asset.cost?.toLocaleString() || 'N/A'}
                      </Typography>
                      {asset.cashflow && (
                        <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                          +${asset.cashflow}/мес
                        </Typography>
                      )}
                    </Box>
                    
                    {asset.description && (
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                        {asset.description}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setAssetsModalOpen(false)}>
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>

      {/* Модальное окно профессии */}
      <ProfessionModal
        open={professionModalOpen}
        onClose={() => setProfessionModalOpen(false)}
        profession={playerProfession}
        playerBalance={playerBalance}
      />
    </Box>
  );
});

// Добавляем CSS анимации
const styles = `
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

// Вставляем стили в head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

TurnTimer.displayName = 'TurnTimer';
NextPlayerButton.displayName = 'NextPlayerButton';
GameControls.displayName = 'GameControls';

export default GameControls;
