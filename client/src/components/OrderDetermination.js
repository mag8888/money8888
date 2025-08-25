import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Alert
} from '@mui/material';
import { motion } from 'framer-motion';

const OrderDetermination = ({ 
  roomId, 
  players, 
  timer, 
  phase, 
  onRollDice, 
  onTieBreakRoll,
  socket 
}) => {
  const [localTimer, setLocalTimer] = useState(timer);
  const [myRoll, setMyRoll] = useState(null);
  const [myTieBreakRoll, setMyTieBreakRoll] = useState(null);
  const [isMyTurn, setIsMyTurn] = useState(false);

  // Обновляем локальный таймер
  useEffect(() => {
    setLocalTimer(timer);
  }, [timer]);

  // Определяем, мой ли сейчас ход
  useEffect(() => {
    if (phase === 'tie_break') {
      // В фазе переигровки проверяем, участвую ли я
      const tieBreakPlayer = players.find(p => p.id === socket.id);
      setIsMyTurn(tieBreakPlayer && !tieBreakPlayer.tieBreakRoll);
    } else {
      // В основной фазе проверяем, бросал ли я кубик
      const me = players.find(p => p.id === socket.id);
      setIsMyTurn(me && !me.diceRoll);
    }
  }, [players, phase, socket.id]);

  // Обработчик броска кубика
  const handleRollDice = () => {
    if (phase === 'tie_break') {
      onTieBreakRoll(roomId, socket.id);
      setMyTieBreakRoll('rolling');
    } else {
      onRollDice(roomId, socket.id);
      setMyRoll('rolling');
    }
  };

  // Получаем моего игрока
  const myPlayer = players.find(p => p.id === socket.id);

  // Определяем, что показывать в кнопке
  const getButtonText = () => {
    if (phase === 'tie_break') {
      if (myTieBreakRoll === 'rolling') return '🎲 Бросаю...';
      if (myTieBreakRoll !== null) return '✅ Бросил';
      return '🎲 Бросить кубик (переигровка)';
    } else {
      if (myRoll === 'rolling') return '🎲 Бросаю...';
      if (myRoll !== null) return '✅ Бросил';
      return '🎲 Бросить кубик';
    }
  };

  // Определяем, заблокирована ли кнопка
  const isButtonDisabled = () => {
    if (phase === 'tie_break') {
      return myTieBreakRoll !== null;
    } else {
      return myRoll !== null;
    }
  };

  // Форматируем время
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Определяем цвет таймера
  const getTimerColor = () => {
    if (localTimer > 30) return 'success';
    if (localTimer > 15) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ p: 3, maxWidth: '800px', margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" gutterBottom align="center" color="primary">
          🎲 Определение очередности
        </Typography>

        {phase === 'tie_break' && (
          <Alert severity="info" sx={{ mb: 3 }}>
            🎯 У некоторых игроков одинаковые результаты! Нужна переигровка для определения точного порядка.
          </Alert>
        )}

        {/* Таймер */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6">
              ⏰ Время: {formatTime(localTimer)}
            </Typography>
            <Chip 
              label={phase === 'tie_break' ? 'Переигровка' : 'Основной бросок'} 
              color={phase === 'tie_break' ? 'warning' : 'primary'}
            />
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={(localTimer / (phase === 'tie_break' ? 30 : 60)) * 100}
            color={getTimerColor()}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        {/* Кнопка броска */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleRollDice}
            disabled={isButtonDisabled() || !isMyTurn}
            sx={{ 
              fontSize: '1.2rem', 
              py: 2, 
              px: 4,
              minWidth: '200px'
            }}
          >
            {getButtonText()}
          </Button>
          
          {!isMyTurn && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {phase === 'tie_break' 
                ? 'Ожидаем других игроков...' 
                : 'Ожидаем других игроков...'
              }
            </Typography>
          )}
        </Box>

        {/* Список игроков */}
        <Grid container spacing={2}>
          {players.map((player) => (
            <Grid item xs={12} sm={6} key={player.id}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Card 
                  sx={{ 
                    border: player.id === socket.id ? '2px solid #1976d2' : '1px solid #e0e0e0',
                    '&:hover': { boxShadow: 3 }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">
                        {player.username}
                      </Typography>
                      {player.id === socket.id && (
                        <Chip label="Вы" color="primary" size="small" />
                      )}
                    </Box>

                    {/* Основной бросок */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Основной бросок:
                      </Typography>
                      {player.diceRoll !== null ? (
                        <Typography variant="h5" color="success.main" fontWeight="bold">
                          🎲 {player.diceRoll}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Ожидает...
                        </Typography>
                      )}
                    </Box>

                    {/* Переигровка */}
                    {phase === 'tie_break' && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Переигровка:
                        </Typography>
                        {player.tieBreakRoll !== null ? (
                          <Typography variant="h5" color="warning.main" fontWeight="bold">
                            🎲 {player.tieBreakRoll}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Ожидает...
                          </Typography>
                        )}
                      </Box>
                    )}

                    {/* Статус */}
                    <Box sx={{ mt: 2 }}>
                      {player.diceRoll !== null && (
                        <Chip 
                          label="Бросил" 
                          color="success" 
                          size="small" 
                          sx={{ mr: 1 }}
                        />
                      )}
                      {phase === 'tie_break' && player.tieBreakRoll !== null && (
                        <Chip 
                          label="Переигровка" 
                          color="warning" 
                          size="small" 
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Инструкции */}
        <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            📋 Как это работает:
          </Typography>
          <Typography variant="body2" paragraph>
            1. <strong>Основной бросок:</strong> Каждый игрок бросает кубик один раз
          </Typography>
          <Typography variant="body2" paragraph>
            2. <strong>Сортировка:</strong> Игроки сортируются по результату (высший первый)
          </Typography>
          <Typography variant="body2" paragraph>
            3. <strong>Переигровка:</strong> При одинаковых результатах игроки перебрасывают кубик
          </Typography>
          <Typography variant="body2" paragraph>
            4. <strong>Финальный порядок:</strong> Определяется очередность ходов в игре
          </Typography>
          <Typography variant="body2" color="warning.main">
            ⚠️ Если игрок не бросит кубик за отведенное время, кубик бросится автоматически
          </Typography>
        </Box>
      </motion.div>
    </Box>
  );
};

export default OrderDetermination;
