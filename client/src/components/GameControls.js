import React from 'react';
import { Box, Button, Typography, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import BuildIcon from '@mui/icons-material/Build';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

// Компонент таймера хода
const TurnTimer = React.memo(({ timer, isActive, isMyTurn }) => {
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timer <= 10) return '#f44336'; // Красный для критического времени
    if (timer <= 30) return '#ff9800'; // Оранжевый для предупреждения
    return '#4caf50'; // Зеленый для нормального времени
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
      <Typography
        variant="h6"
        sx={{
          color: getTimerColor(),
          fontWeight: 'bold',
          textShadow: timer <= 10 ? '0 0 10px rgba(244, 67, 54, 0.5)' : 'none'
        }}
      >
        {formatTime(timer)}
      </Typography>
      
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
  isActive 
}) => {
  const getButtonColor = () => {
    if (!isMyTurn) return '#9E9E9E'; // Серый для неактивного состояния
    if (timer <= 10) return '#f44336'; // Красный для критического времени
    if (timer <= 30) return '#ff9800'; // Оранжевый для предупреждения
    return '#9C27B0'; // Фиолетовый для нормального состояния
  };

  const getButtonText = () => {
    if (!isMyTurn) return 'ОЖИДАНИЕ';
    if (timer <= 10) return 'СРОЧНО!';
    if (timer <= 30) return 'ВНИМАНИЕ!';
    return 'СЛЕДУЮЩИЙ ИГРОК';
  };

  return (
    <motion.div
      whileHover={isMyTurn ? { scale: 1.05 } : {}}
      whileTap={isMyTurn ? { scale: 0.95 } : {}}
    >
      <Button
        variant="contained"
        onClick={onEndTurn}
        disabled={!isMyTurn}
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
          Нажмите или ждите
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
  turnBanner
}) => {
  const currentPlayer = players.find(p => p.id === currentTurn);
  const myPlayer = players.find(p => p.id === myId);

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
            label={currentPlayer.profession || 'Engineer'}
            size="small"
            sx={{
              backgroundColor: '#FFD700',
              color: '#333',
              fontWeight: 'bold'
            }}
          />
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            {currentPlayer.username}
          </Typography>
        </Box>
      )}

      {/* Отладочная информация */}
      <Box
        sx={{
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
          border: '1px solid rgba(244, 67, 54, 0.3)',
          borderRadius: 1,
          padding: '8px 12px',
          fontSize: '12px',
          color: 'rgba(255,255,255,0.8)'
        }}
      >
        <div>DEBUG: myId={myId?.slice(-4)}, socket.id={myId?.slice(-4)},</div>
        <div>players={players.length}, username={myPlayer?.username || 'N/A'}</div>
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

      {/* Кнопка профессии */}
      <Button
        variant="contained"
        onClick={onProfessionClick}
        startIcon={<BuildIcon />}
        sx={{
          backgroundColor: '#FF9800',
          color: 'white',
          '&:hover': {
            backgroundColor: '#F57C00'
          }
        }}
      >
        Профессия
      </Button>

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
      />

      {/* Кнопка следующего игрока */}
      <NextPlayerButton
        isMyTurn={isMyTurn}
        onEndTurn={onEndTurn}
        timer={timer}
        isActive={isTimerActive}
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
