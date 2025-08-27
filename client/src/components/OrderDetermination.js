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
import DiceRoller from './DiceRoller';
import useDiceRoll from '../hooks/useDiceRoll';

// Используем хук для броска кубика

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
  const [localPlayers, setLocalPlayers] = useState(players);

  // Получаем моего игрока (проверяем id и socketId на случай несовпадений)
  const myPlayer = players.find(p => p.id === socket.id || p.socketId === socket.id) 
    || players.find(p => p.username && p.username === (players.find(pp => pp.id === socket.id || pp.socketId === socket.id)?.username));

  // Обновляем локальный таймер
  useEffect(() => {
    setLocalTimer(timer);
  }, [timer]);

  // Обновляем локальное состояние игроков при изменении props
  useEffect(() => {
    setLocalPlayers(players);
  }, [players]);

  // Слушаем обновления списка игроков
  useEffect(() => {
    const handlePlayersUpdate = (updatedPlayers) => {
      console.log('👥 [OrderDetermination] Players updated:', updatedPlayers);
      // Мерджим, не теряя diceRoll/tieBreakRoll/finalPosition
      setLocalPlayers(prev => {
        const merged = updatedPlayers.map(up => {
          const old = prev.find(p => p.id === up.id || p.username === up.username);
          return {
            ...up,
            diceRoll: old?.diceRoll ?? up.diceRoll ?? null,
            tieBreakRoll: old?.tieBreakRoll ?? up.tieBreakRoll ?? null,
            finalPosition: old?.finalPosition ?? up.finalPosition ?? null
          };
        });
        return merged;
      });
    };

    socket.on('playersList', handlePlayersUpdate);

    return () => {
      socket.off('playersList', handlePlayersUpdate);
    };
  }, [socket]);

  // Определяем, мой ли сейчас ход
  useEffect(() => {
    if (!socket || !socket.id) {
      console.warn('⚠️ [OrderDetermination] Socket not available or no ID');
      return;
    }
    
    if (phase === 'tie_break') {
      // В фазе переигровки проверяем, участвую ли я
      const tieBreakPlayer = localPlayers.find(p => p.id === socket.id || p.socketId === socket.id || (myPlayer && p.username === myPlayer.username));
      setIsMyTurn(tieBreakPlayer && !tieBreakPlayer.tieBreakRoll);
    } else {
      // В основной фазе проверяем, бросал ли я кубик
      const me = localPlayers.find(p => p.id === socket.id || p.socketId === socket.id || (myPlayer && p.username === myPlayer.username));
      setIsMyTurn(me && !me.diceRoll);
    }
  }, [localPlayers, phase, socket, myPlayer]);

  // Используем хук для броска кубика
  const { 
    isRolling, 
    lastResult, 
    rollDice, 
    rollDiceForOrder: rollDiceForOrderHook, 
    rollDiceForTieBreak: rollDiceForTieBreakHook,
    resetDice 
  } = useDiceRoll(roomId, socket.id);

  // Показываем кнопку старта при событии "все бросили"
  useEffect(() => {
    const handleAllRolled = (data) => {
      if (data?.players) {
        setLocalPlayers(prev => prev.map(p => {
          const fromSrv = data.players.find(x => x.id === p.id || x.username === p.username);
          return fromSrv ? { ...p, diceRoll: fromSrv.diceRoll ?? p.diceRoll } : p;
        }));
      }
    };
    socket.on('orderDeterminationAllRolled', handleAllRolled);
    return () => socket.off('orderDeterminationAllRolled', handleAllRolled);
  }, [socket]);

  // Обработчик броска кубика
  const handleRollDice = async () => {
    if (phase === 'tie_break') {
      const result = await rollDiceForTieBreakHook();
      if (result) {
        setMyTieBreakRoll(result);
        // Обновляем локальное состояние игрока
        setLocalPlayers(prev => prev.map(p => 
          p.id === socket.id 
            ? { ...p, tieBreakRoll: result }
            : p
        ));
        console.log('🎲 [OrderDetermination] Tie break roll completed:', result);
      }
    } else {
      const result = await rollDiceForOrderHook();
      if (result) {
        setMyRoll(result);
        // Обновляем локальное состояние игрока
        setLocalPlayers(prev => prev.map(p => 
          p.id === socket.id 
            ? { ...p, diceRoll: result }
            : p
        ));
        console.log('🎲 [OrderDetermination] Main roll completed:', result);
      }
    }
  };

  // Слушаем начало определения очередности
  useEffect(() => {
    const handleOrderDeterminationStarted = (data) => {
      console.log('🎯 [OrderDetermination] Order determination started:', data);
      // Обновляем локальное состояние игроков с данными из orderDetermination
      if (data.players) {
        setLocalPlayers(prev => {
          const updated = [...prev];
          // Обновляем существующих и добавляем отсутствующих
          data.players.forEach(orderPlayer => {
            const idx = updated.findIndex(p => p.username === orderPlayer.username || p.id === orderPlayer.id);
            if (idx >= 0) {
              updated[idx] = {
                ...updated[idx],
                id: orderPlayer.id ?? updated[idx].id,
                username: orderPlayer.username ?? updated[idx].username,
                diceRoll: orderPlayer.diceRoll ?? updated[idx].diceRoll ?? null,
                finalPosition: orderPlayer.finalPosition ?? updated[idx].finalPosition ?? null,
                tieBreakRoll: orderPlayer.tieBreakRoll ?? updated[idx].tieBreakRoll ?? null
              };
            } else {
              updated.push({
                id: orderPlayer.id,
                username: orderPlayer.username,
                diceRoll: orderPlayer.diceRoll ?? null,
                finalPosition: orderPlayer.finalPosition ?? null,
                tieBreakRoll: orderPlayer.tieBreakRoll ?? null
              });
            }
          });
          console.log('🎯 [OrderDetermination] Updated localPlayers after start (merged):', updated);
          return updated;
        });
      }
      // Запрашиваем актуальный список игроков на всякий случай
      socket.emit('getPlayers', roomId);
    };

    // Таймер обновляется через проп timer из родителя (SimpleRoomSetup)

    // Слушаем результаты броска кубика от других игроков
    const handleOrderRoll = (data) => {
      console.log('🎲 [OrderDetermination] Player rolled:', data);
      console.log('🎲 [OrderDetermination] Current localPlayers before update:', localPlayers);
      // Обновляем локальное состояние игрока
      setLocalPlayers(prev => {
        const updated = prev.map(p => 
          p.id === data.playerId 
            ? { ...p, diceRoll: data.diceRoll }
            : p
        );
        console.log('🎲 [OrderDetermination] Updated localPlayers:', updated);
        return updated;
      });
    };

    const handleTieBreakRoll = (data) => {
      console.log('🎲 [OrderDetermination] Player tie break rolled:', data);
      // Обновляем локальное состояние игрока для переигровки
      setLocalPlayers(prev => prev.map(p => 
        p.id === data.playerId 
          ? { ...p, tieBreakRoll: data.diceRoll }
          : p
      ));
    };

    const handleOrderDeterminationCompleted = (data) => {
      console.log('🎯 [OrderDetermination] Order determination completed:', data);
      // Обновляем локальное состояние всех игроков с финальными результатами
      if (data.finalOrder) {
        setLocalPlayers(prev => prev.map(player => {
          const finalPlayer = data.finalOrder.find(fp => fp.username === player.username);
          if (finalPlayer) {
            return {
              ...player,
              diceRoll: finalPlayer.diceRoll || player.diceRoll,
              finalPosition: finalPlayer.position
            };
          }
          return player;
        }));
      }
    };

    socket.on('orderDeterminationStarted', handleOrderDeterminationStarted);
    socket.on('orderDeterminationRoll', handleOrderRoll);
    socket.on('orderDeterminationTieBreakRoll', handleTieBreakRoll);
    socket.on('orderDeterminationCompleted', handleOrderDeterminationCompleted);
    // Таймер обновляется через пропы, этот слушатель не нужен, чтобы не было «прыжков» времени

    return () => {
      socket.off('orderDeterminationStarted', handleOrderDeterminationStarted);
      socket.off('orderDeterminationRoll', handleOrderRoll);
      socket.off('orderDeterminationTieBreakRoll', handleTieBreakRoll);
      socket.off('orderDeterminationCompleted', handleOrderDeterminationCompleted);
      // Убираем отписку от неиспользуемого слушателя таймера
    };
  }, [socket.id]);


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
    if (localTimer > 90) return 'success';    // Зеленый для первых 1.5 минут
    if (localTimer > 30) return 'warning';    // Желтый для следующих 1 минуты
    return 'error';                           // Красный для последних 30 секунд
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
            value={(localTimer / (phase === 'tie_break' ? 30 : 180)) * 100}
            color={getTimerColor()}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        {/* Финальный порядок игроков */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid #e0e0e0' }}>
          <Typography variant="h6" gutterBottom align="center" color="primary">
            🏆 Финальный порядок игроков
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
            Отладочная информация: {localPlayers.map(p => `${p.username}: позиция=${p.finalPosition}, кубик=${p.diceRoll}`).join(', ')}
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
            Состояние: {JSON.stringify(localPlayers.map(p => ({ username: p.username, id: p.id, diceRoll: p.diceRoll, finalPosition: p.finalPosition })))}
          </Typography>
          {localPlayers.some(p => p.finalPosition !== null) ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              {localPlayers
                .filter(p => p.finalPosition !== null)
                .sort((a, b) => a.finalPosition - b.finalPosition)
                .map((player, index) => (
                  <Box 
                    key={player.id}
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      p: 1,
                      borderRadius: 1,
                      bgcolor: player.finalPosition === 0 ? 'rgba(76, 175, 80, 0.1)' : 
                               player.finalPosition === 1 ? 'rgba(255, 152, 0, 0.1)' : 
                               player.finalPosition === 2 ? 'rgba(33, 150, 243, 0.1)' : 'rgba(158, 158, 158, 0.1)',
                      border: `1px solid ${player.finalPosition === 0 ? '#4CAF50' : 
                                        player.finalPosition === 1 ? '#FF9800' : 
                                        player.finalPosition === 2 ? '#2196F3' : '#9E9E9E'}`
                    }}
                  >
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        backgroundColor: player.finalPosition === 0 ? '#4CAF50' : 
                                       player.finalPosition === 1 ? '#FF9800' : 
                                       player.finalPosition === 2 ? '#2196F3' : '#9E9E9E'
                      }}
                    >
                      {player.finalPosition !== null && player.finalPosition !== undefined ? player.finalPosition + 1 : '?'}
                    </Box>
                    <Typography variant="body2" fontWeight="bold">
                      {player.username}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      (🎲 {player.diceRoll !== null && player.diceRoll !== undefined ? player.diceRoll : '?'})
                    </Typography>
                  </Box>
                ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" align="center">
              Ожидаем результаты бросков...
            </Typography>
          )}
        </Box>

        {/* Модуль броска кубика */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          {isMyTurn ? (
            <DiceRoller
              onRoll={phase === 'tie_break' ? rollDiceForTieBreakHook : rollDiceForOrderHook}
              disabled={isButtonDisabled()}
              buttonText={phase === 'tie_break' ? '🎲 Бросить кубик (переигровка)' : '🎲 Бросить кубик'}
              size={100}
              showResult={false}
            />
          ) : (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {phase === 'tie_break' 
                  ? 'Ожидаем других игроков...' 
                  : 'Ожидаем других игроков...'
                }
              </Typography>
            </Box>
          )}
        </Box>

        {/* Список игроков (сортируем по текущему результату: tieBreakRoll > diceRoll, по убыв.) */}
        <Grid container spacing={2}>
          {localPlayers
            .slice()
            .sort((a, b) => {
              const aScore = (a.tieBreakRoll ?? a.diceRoll ?? -1);
              const bScore = (b.tieBreakRoll ?? b.diceRoll ?? -1);
              return bScore - aScore;
            })
            .map((player) => (
            <Grid item xs={12} sm={6} key={player.id}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Card 
                  sx={{ 
                    border: player.id === socket.id ? '2px solid #1976d2' : '1px solid #e0e0e0',
                    '&:hover': { boxShadow: 3 },
                    position: 'relative'
                  }}
                >
                  {/* Индикатор очередности в углу карточки */}
                  {player.finalPosition !== null && player.finalPosition !== undefined && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -10,
                        left: -10,
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                        backgroundColor: player.finalPosition === 0 ? '#4CAF50' : 
                                       player.finalPosition === 1 ? '#FF9800' : 
                                       player.finalPosition === 2 ? '#2196F3' : '#9E9E9E',
                        border: '2px solid white',
                        boxShadow: 2,
                        zIndex: 1
                      }}
                    >
                      {player.finalPosition !== null && player.finalPosition !== undefined ? player.finalPosition + 1 : '?'}
                    </Box>
                  )}
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6">
                          {player.username}
                        </Typography>
                        {/* Очередность игрока */}
                        {player.finalPosition !== null && player.finalPosition !== undefined ? (
                          <Chip 
                            label={`${player.finalPosition !== null && player.finalPosition !== undefined ? player.finalPosition + 1 : '?'} место`}
                            color="success"
                            size="small"
                            sx={{ 
                              fontWeight: 'bold',
                              backgroundColor: player.finalPosition === 0 ? '#4CAF50' : 
                                             player.finalPosition === 1 ? '#FF9800' : 
                                             player.finalPosition === 2 ? '#2196F3' : '#9E9E9E'
                            }}
                          />
                        ) : (
                          <Chip 
                            label="Ожидает"
                            color="default"
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                      {(myPlayer && player.username === myPlayer.username) && (
                        <Chip label="Вы" color="primary" size="small" />
                      )}
                    </Box>

                    {/* Основной бросок (показываем число) */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Основной бросок:
                      </Typography>
                      {player.diceRoll !== null && player.diceRoll !== undefined ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <img 
                            src={`/images/K${player.diceRoll}-61.tiff`}
                            alt={`Кубик ${player.diceRoll}`}
                            width={40}
                            height={40}
                            style={{ borderRadius: '4px' }}
                            onError={(e) => {
                              console.warn(`❌ [OrderDetermination] Failed to load dice TIFF: /images/K${player.diceRoll}-61.tiff, fallback to GIF`);
                              e.currentTarget.src = `/images/K${player.diceRoll}.gif`;
                            }}
                          />
                          <Typography variant="h5" color="success.main" fontWeight="bold">
                            {player.diceRoll}
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <img 
                            src="/images/K1-61.tiff"
                            alt="Ожидает бросок"
                            width={40}
                            height={40}
                            style={{ 
                              borderRadius: '4px',
                              opacity: 0.5,
                              filter: 'grayscale(100%)'
                            }}
                            onError={(e) => {
                              console.warn('❌ [OrderDetermination] Failed to load waiting dice TIFF: /images/K1-61.tiff, fallback to GIF');
                              e.currentTarget.src = '/images/K1.gif';
                            }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            🎲 Ожидает...
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Ожидает...
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Переигровка */}
                    {phase === 'tie_break' && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Переигровка:
                        </Typography>
                        {player.tieBreakRoll !== null ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <img 
                              src={`/images/K${player.tieBreakRoll}-61.tiff`}
                              alt={`Кубик ${player.tieBreakRoll}`}
                              width={40}
                              height={40}
                              style={{ borderRadius: '4px' }}
                              onError={(e) => {
                                console.warn(`❌ [OrderDetermination] Failed to load tie-break dice TIFF: /images/K${player.tieBreakRoll}-61.tiff, fallback to GIF`);
                                e.currentTarget.src = `/images/K${player.tieBreakRoll}.gif`;
                              }}
                            />
                            <Typography variant="h5" color="warning.main" fontWeight="bold">
                              {player.tieBreakRoll}
                            </Typography>
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <img 
                              src="/images/K1-61.tiff"
                              alt="Ожидает переигровку"
                              width={40}
                              height={40}
                              style={{ 
                                borderRadius: '4px',
                                opacity: 0.5,
                                filter: 'grayscale(100%)'
                              }}
                              onError={(e) => {
                                console.warn('❌ [OrderDetermination] Failed to load waiting tie-break dice TIFF: /images/K1-61.tiff, fallback to GIF');
                                e.currentTarget.src = '/images/K1.gif';
                              }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              Ожидает...
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    )}

                    {/* Статус + лидер */}
                    <Box sx={{ mt: 2 }}>
                      {player.diceRoll !== null && player.diceRoll !== undefined ? (
                        <Chip 
                          label="Бросил" 
                          color="success" 
                          size="small" 
                          sx={{ mr: 1 }}
                        />
                      ) : (
                        <Chip 
                          label="Ожидает" 
                          color="default" 
                          size="small" 
                          sx={{ mr: 1 }}
                        />
                      )}
                      {(() => {
                        const scores = localPlayers.map(p => (p.tieBreakRoll ?? p.diceRoll ?? -1));
                        const max = Math.max(...scores);
                        const isUniqueMax = scores.filter(s => s === max).length === 1;
                        const playerScore = (player.tieBreakRoll ?? player.diceRoll ?? -1);
                        if (isUniqueMax && playerScore === max && max >= 0) {
                          return <Chip label="Лидер" color="info" size="small" sx={{ mr: 1 }} />;
                        }
                        return null;
                      })()}
                      {phase === 'tie_break' && (
                        player.tieBreakRoll !== null && player.tieBreakRoll !== undefined ? (
                          <Chip 
                            label="Переигровка" 
                            color="warning" 
                            size="small" 
                          />
                        ) : (
                          <Chip 
                            label="Ожидает переигровку" 
                            color="default" 
                            size="small" 
                          />
                        )
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

        {/* Кнопка начала игры */}
        {phase === 'initial_roll' && localPlayers.every(p => p.diceRoll !== null) && (
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              color="success"
              onClick={() => {
                // Отправляем событие для начала игры
                socket.emit('startGameAfterOrder', roomId);
              }}
              sx={{
                fontSize: '1.2rem',
                padding: '15px 30px',
                borderRadius: '12px',
                boxShadow: 3,
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: 6
                }
              }}
            >
              🚀 Начать игру!
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Все игроки бросили кубики. Можно начинать игру!
            </Typography>
          </Box>
        )}
      </motion.div>
    </Box>
  );
};

export default OrderDetermination;
