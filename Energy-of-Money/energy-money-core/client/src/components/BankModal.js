import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  useMediaQuery,
  useTheme,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Grid,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  Close as CloseIcon, 
  AccountBalance, 
  Send, 
  History, 
  CheckCircle, 
  Error,
  TrendingUp,
  TrendingDown,
  AccountBalanceWallet,
  CreditCard,
  AttachMoney,
  Schedule
} from '@mui/icons-material';

const BankModal = ({ 
  isOpen, 
  onClose, 
  playerData, 
  gamePlayers = [], 
  socket, 
  roomId,
  bankBalance: externalBankBalance = 0,
  onBankBalanceChange
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Состояние банковских операций
  const [bankBalance, setBankBalance] = useState(0);
  const [transferAmount, setTransferAmount] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [transferHistory, setTransferHistory] = useState([]);
  const [isTransferring, setIsTransferring] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isConnected, setIsConnected] = useState(socket?.connected || false);

  // Добавление CSS анимации shimmer
  useEffect(() => {
    const shimmerStyle = `
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
    `;
    
    const style = document.createElement('style');
    style.textContent = shimmerStyle;
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // Получение текущего игрока по user ID (мемоизированное)
  const getCurrentPlayer = useCallback(() => {
    if (!gamePlayers || !Array.isArray(gamePlayers) || !playerData?.id) {
      return null;
    }
    
    // Ищем игрока по user ID (постоянный идентификатор)
    let player = gamePlayers.find(p => p.id === playerData.id || p.userId === playerData.id);
    
    // Fallback: если не найден по user ID, ищем по username (для совместимости со старыми данными)
    if (!player && playerData?.username) {
      player = gamePlayers.find(p => p.username === playerData.username);
    }
    
    return player;
  }, [gamePlayers, playerData?.id, playerData?.username]);

  // Получение начального баланса из профессии
  const getInitialBalance = useCallback(() => {
    const currentPlayer = getCurrentPlayer();
    const profession = currentPlayer?.profession || playerData?.profession;
    
    if (profession?.balance !== undefined) {
      return Number(profession.balance);
    }
    
    // Fallback для разных профессий
    const professionBalances = {
      'Предприниматель': 3000,
      'Учитель': 2000,
      'Врач': 5000,
      'Инженер': 4000,
      'Юрист': 6000
    };
    
    return professionBalances[profession?.name] || 3000;
  }, [getCurrentPlayer, playerData?.profession]);

  // Получение списка получателей (все игроки кроме текущего)
  const getRecipients = useCallback(() => {
    if (!gamePlayers || !Array.isArray(gamePlayers) || !playerData?.id) {
      return [];
    }
    return gamePlayers.filter(player => 
      (player.id !== playerData.id && player.userId !== playerData.id) && 
      player.username && 
      player.username.trim() !== ''
    );
  }, [gamePlayers, playerData?.id]);

  // Сохранение истории транзакций в localStorage
  const saveTransactionHistory = useCallback((history) => {
    try {
      if (playerData?.id && roomId) {
        localStorage.setItem(`bank_history_${playerData.id}_${roomId}`, JSON.stringify(history));
        console.log('💾 [BankModal] История сохранена:', history.length, 'записей для пользователя', playerData.id);
      }
    } catch (error) {
      console.error('❌ [BankModal] Ошибка сохранения истории:', error);
    }
  }, [playerData?.id, roomId]);

  // Сброс формы перевода
  const resetTransferForm = useCallback(() => {
    setTransferAmount('');
    setSelectedRecipient('');
    setError('');
  }, []);

  // Обработка перевода средств
  const handleTransfer = useCallback(async () => {
    if (!transferAmount || !selectedRecipient || isTransferring) return;
    
    // Проверяем соединение с сервером
    if (!socket || !socket.connected) {
      setError('Нет соединения с сервером. Попробуйте позже.');
      return;
    }
    
    const amount = parseFloat(transferAmount);
    if (amount <= 0) {
      setError('Сумма должна быть больше нуля');
      return;
    }
    
    // Проверяем баланс - используем реальный баланс игрока, если доступен
    const currentPlayer = getCurrentPlayer();
    const actualBalance = currentPlayer?.balance !== undefined ? currentPlayer.balance : (bankBalance || 0);
    
    // Временная отладка для исправления ошибки перевода
    console.log('🔍 [BankModal] Проверка баланса для перевода:', {
      amount: parseFloat(transferAmount),
      currentPlayerBalance: currentPlayer?.balance,
      bankBalance: bankBalance,
      actualBalance: actualBalance,
      hasEnoughFunds: parseFloat(transferAmount) <= actualBalance,
      playerData: currentPlayer ? {
        id: currentPlayer.id,
        userId: currentPlayer.userId,
        username: currentPlayer.username,
        balance: currentPlayer.balance
      } : null
    });
    
    if (amount > actualBalance) {
      setError(`Недостаточно средств на счету. Доступно: $${actualBalance.toLocaleString()}`);
      return;
    }

    const recipients = getRecipients();
    const recipient = recipients.find(p => p.username === selectedRecipient);
    if (!recipient) {
      setError('Получатель не найден');
      return;
    }

    setIsTransferring(true);
    setError('');

    try {
      // Перевод начат
      
      // Создаем транзакцию
      const transaction = {
        id: `transfer_${Date.now()}`,
        type: 'transfer',
        amount: amount,
        description: `Перевод игроку ${selectedRecipient}`,
        timestamp: new Date().toLocaleString('ru-RU'),
        from: getCurrentPlayer()?.username || playerData?.username || 'Игрок',
        to: selectedRecipient,
        status: 'pending',
        balanceAfter: (bankBalance || 0) - amount
      };

      // Добавляем транзакцию в историю
      const updatedHistory = [transaction, ...transferHistory];
      setTransferHistory(updatedHistory);
      saveTransactionHistory(updatedHistory);

      // Отправляем на сервер (если есть WebSocket)
      if (socket && roomId) {
        const currentPlayer = getCurrentPlayer();
        
        console.log('📤 [BankModal] Отправляем на сервер:', {
          amount: amount,
          currentBalance: actualBalance,
          calculation: `${actualBalance} - ${amount} = ${actualBalance - amount}`,
          recipient: selectedRecipient
        });
        
        // ПРОВЕРКА ФОРМУЛЫ НА КЛИЕНТЕ
        console.log('🧮 [BankModal] Формула баланса (клиент):', {
          формула: 'старый_баланс - сумма_перевода = новый_баланс',
          старый_баланс: actualBalance,
          сумма_перевода: amount,
          новый_баланс: actualBalance - amount,
          проверка: `${actualBalance} - ${amount} = ${actualBalance - amount}`,
          корректно: (actualBalance - amount) === (actualBalance - amount)
        });
        
        socket.emit('bankTransfer', {
          roomId,
          playerId: currentPlayer?.id || currentPlayer?.userId || playerData?.id, // Используем user ID
          socketId: socket.id, // Добавляем socket ID для совместимости
          username: currentPlayer?.username || playerData?.username, // Добавляем username
          recipient: selectedRecipient,
          amount: amount,
          currentBalance: actualBalance, // Отправляем текущий баланс для проверки
          transactionId: transaction.id
        });
      }

      // Очищаем форму
      setTransferAmount('');
      setSelectedRecipient('');

    } catch (error) {
      console.error('❌ [BankModal] Ошибка при переводе:', error);
      setError('Ошибка при переводе средств');
      
      // Удаляем pending транзакцию из истории
      setTransferHistory(prev => prev.filter(t => t.status !== 'pending'));
    } finally {
      setIsTransferring(false);
    }
  }, [transferAmount, selectedRecipient, isTransferring, bankBalance, getRecipients, getCurrentPlayer, playerData?.username, transferHistory, saveTransactionHistory, socket, roomId]);

  // Инициализация банковского баланса и истории транзакций
  useEffect(() => {
    if (!isOpen) return;

    // Приоритет источников данных:
    // 1. Реальный баланс игрока (если доступен)
    // 2. Внешний баланс (bankBalance prop)
    // 3. Начальный баланс из профессии
    const currentPlayer = getCurrentPlayer();
    let balanceToSet = 0;
    
    if (currentPlayer?.balance !== undefined && currentPlayer.balance !== null) {
      balanceToSet = Number(currentPlayer.balance);
    } else if (externalBankBalance !== undefined && externalBankBalance !== null && externalBankBalance > 0) {
      balanceToSet = Number(externalBankBalance);
    } else {
      balanceToSet = getInitialBalance();
    }
    
    // Устанавливаем баланс
    setBankBalance(balanceToSet);
    
    // Уведомляем родительский компонент только если баланс изменился
    if (onBankBalanceChange && balanceToSet !== bankBalance) {
      onBankBalanceChange(balanceToSet);
    }
    
    // Загружаем историю транзакций из localStorage
    let history = [];
    if (playerData?.id && roomId) {
      const savedHistory = localStorage.getItem(`bank_history_${playerData.id}_${roomId}`);
      
      if (savedHistory) {
        try {
          history = JSON.parse(savedHistory);
          console.log('📜 [BankModal] Загружена история транзакций:', history.length, 'записей для пользователя', playerData.id);
        } catch (error) {
          console.error('❌ [BankModal] Ошибка загрузки истории:', error);
          history = [];
        }
      }
    }
    
    // Если истории нет, создаем начальную транзакцию
    if (history.length === 0 && balanceToSet > 0) {
      const initialTransaction = {
        id: `initial_${Date.now()}`,
        type: 'initial',
        amount: balanceToSet,
        description: 'Начальный баланс профессии',
        timestamp: new Date().toLocaleString('ru-RU'),
        from: 'Банк',
        to: getCurrentPlayer()?.username || playerData?.username || 'Игрок',
        status: 'completed',
        balanceAfter: balanceToSet
      };
      
      history = [initialTransaction];
      console.log('🆕 [BankModal] Создана начальная транзакция:', initialTransaction);
    }
    
    setTransferHistory(history);
    
    // Сохраняем историю в localStorage
    if (playerData?.id && roomId) {
      localStorage.setItem(`bank_history_${playerData.id}_${roomId}`, JSON.stringify(history));
    }
    
  }, [isOpen, getInitialBalance, onBankBalanceChange, playerData?.id, roomId]);

  // Синхронизация с внешним балансом и реальным балансом игрока
  useEffect(() => {
    const currentPlayer = getCurrentPlayer();
    
    // Синхронизируем с реальным балансом игрока (приоритет)
    if (currentPlayer?.balance !== undefined && currentPlayer.balance !== bankBalance) {
      // Синхронизация с реальным балансом игрока
      setBankBalance(currentPlayer.balance);
      return; // Не проверяем внешний баланс, если есть реальный баланс игрока
    }
    
    // Только если нет реального баланса игрока, используем внешний баланс
    if (externalBankBalance !== undefined && externalBankBalance !== bankBalance && 
        (currentPlayer?.balance === undefined || currentPlayer.balance === null)) {
      // Синхронизация с внешним балансом
      setBankBalance(externalBankBalance);
    }
  }, [externalBankBalance, bankBalance, getCurrentPlayer]);

  // Обработчики socket событий для банковских операций
  useEffect(() => {
    if (!socket || !isOpen) return;
    
    // Обработка разрыва соединения
    const handleDisconnect = () => {
      console.log('🔌 [BankModal] WebSocket disconnected');
      setIsConnected(false);
      setError('Соединение с сервером потеряно. Попробуйте позже.');
    };
    
    const handleConnect = () => {
      console.log('🔌 [BankModal] WebSocket connected');
      setIsConnected(true);
      setError(''); // Очищаем ошибку при восстановлении соединения
    };

    // Обработка успешного перевода
    const handleBankTransferSuccess = (data) => {
      console.log('✅ [BankModal] Перевод успешен:', data);
      setSuccess(data.message);
      
      // Обновляем баланс если пришел новый
      if (data.newBalance !== undefined) {
        setBankBalance(data.newBalance);
        if (onBankBalanceChange) {
          onBankBalanceChange(data.newBalance);
        }
        
        // Обновляем последнюю транзакцию в истории
        setTransferHistory(prev => prev.map(t => 
          t.status === 'pending' ? { ...t, status: 'completed', balanceAfter: data.newBalance } : t
        ));
      }
    };

    // Обработка ошибки перевода
    const handleBankTransferError = (data) => {
      console.error('❌ [BankModal] Ошибка перевода:', data);
      setError(data.message);
      
      // Удаляем pending транзакцию из истории
      setTransferHistory(prev => prev.filter(t => t.status !== 'pending'));
    };

    // Обработка получения перевода от другого игрока
    const handleBankTransferReceived = (data) => {
      console.log('💰 [BankModal] Получен перевод:', data);
      
      // Добавляем транзакцию о получении
      const receivedTransaction = {
        id: `received_${Date.now()}`,
        type: 'received',
        amount: data.amount,
        description: `Перевод от ${data.fromPlayer}`,
        timestamp: new Date().toLocaleString('ru-RU'),
        from: data.fromPlayer,
        to: getCurrentPlayer()?.username || playerData?.username || 'Игрок',
        status: 'completed',
        balanceAfter: (bankBalance || 0) + data.amount
      };

      // Обновляем баланс
      const newBalance = (bankBalance || 0) + data.amount;
      setBankBalance(newBalance);
      
      if (onBankBalanceChange) {
        onBankBalanceChange(newBalance);
      }

      // Добавляем в историю
      const updatedHistory = [receivedTransaction, ...transferHistory];
      setTransferHistory(updatedHistory);
      saveTransactionHistory(updatedHistory);

      setSuccess(`Получен перевод $${data.amount.toLocaleString()} от ${data.fromPlayer}!`);
    };

    // Подписываемся на события
    socket.on('bankTransferSuccess', handleBankTransferSuccess);
    socket.on('bankTransferError', handleBankTransferError);
    socket.on('bankTransferReceived', handleBankTransferReceived);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect', handleConnect);

    // Очистка при размонтировании
    return () => {
      socket.off('bankTransferSuccess', handleBankTransferSuccess);
      socket.off('bankTransferError', handleBankTransferError);
      socket.off('bankTransferReceived', handleBankTransferReceived);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect', handleConnect);
    };
  }, [socket, isOpen, bankBalance, onBankBalanceChange, transferHistory, saveTransactionHistory, getCurrentPlayer, playerData?.username]);

  // Получение иконки для типа транзакции
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'initial': return <AccountBalanceWallet />;
      case 'transfer': return <Send />;
      case 'received': return <AttachMoney />;
      default: return <CreditCard />;
    }
  };

  // Получение цвета для типа транзакции
  const getTransactionColor = (type, amount) => {
    if (type === 'initial' || type === 'received') {
      return '#10B981'; // Зеленый для поступлений
    }
    return '#EF4444'; // Красный для расходов
  };

  // Получение знака для суммы
  const getAmountSign = (type) => {
    return type === 'initial' || type === 'received' ? '+' : '-';
  };

  // Статистика
  const totalTransfers = transferHistory.filter(t => t.type === 'transfer').length;
  const totalTransferAmount = transferHistory
    .filter(t => t.type === 'transfer')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalTransactions = transferHistory.length;

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile}
      hideBackdrop={true}
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          color: 'white',
          borderRadius: isMobile ? 0 : 3,
          minHeight: isMobile ? '100vh' : '80vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBalance sx={{ fontSize: 28, color: '#8B5CF6' }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Банковские операции
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Левая панель - Баланс и статистика */}
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: 'white',
              mb: 2
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Текущий баланс
                  </Typography>
                  <Chip 
                    label={isConnected ? "Подключен" : "Отключен"} 
                    size="small" 
                    sx={{ 
                      backgroundColor: isConnected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: isConnected ? '#10B981' : '#EF4444',
                      fontWeight: 'bold'
                    }} 
                  />
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  ${(() => {
                    const currentPlayer = getCurrentPlayer();
                    const actualBalance = currentPlayer?.balance !== undefined ? currentPlayer.balance : (bankBalance || 0);
                    return actualBalance.toLocaleString();
                  })()}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Доступно для операций
                </Typography>
              </CardContent>
            </Card>

            {/* Статистика */}
            <Card sx={{ 
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              mb: 2
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Статистика
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Всего переводов:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{totalTransfers}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Сумма переводов:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      ${totalTransferAmount.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Транзакций:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{totalTransactions}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Быстрые действия */}
            <Card sx={{ 
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)'
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Быстрые действия
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<Send />}
                    sx={{
                      background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                      color: 'white',
                      py: 1.5,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)'
                      }
                    }}
                  >
                    НОВЫЙ ПЕРЕВОД
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<History />}
                    sx={{
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      color: 'white',
                      py: 1.5,
                      '&:hover': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                  >
                    ИСТОРИЯ ОПЕРАЦИЙ
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Правая панель - Переводы и история */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              {/* Форма перевода */}
              <Grid item xs={12}>
                <Card sx={{ 
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                      Перевод средств
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            Получатель
                          </InputLabel>
                          <Select
                            value={selectedRecipient}
                            onChange={(e) => setSelectedRecipient(e.target.value)}
                            sx={{
                              color: 'white',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(255, 255, 255, 0.3)'
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(255, 255, 255, 0.5)'
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#8B5CF6'
                              }
                            }}
                          >
                            {getRecipients().map((player) => (
                              <MenuItem key={player.id || player.userId || player.socketId} value={player.username}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                                    {player.username.charAt(0).toUpperCase()}
                                  </Avatar>
                                  {player.username}
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Сумма ($)"
                          type="number"
                          value={transferAmount}
                          onChange={(e) => setTransferAmount(e.target.value)}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              color: 'white',
                              '& fieldset': {
                                borderColor: 'rgba(255, 255, 255, 0.3)'
                              },
                              '&:hover fieldset': {
                                borderColor: 'rgba(255, 255, 255, 0.5)'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#8B5CF6'
                              }
                            },
                            '& .MuiInputLabel-root': {
                              color: 'rgba(255, 255, 255, 0.7)'
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Button
                            variant="contained"
                            onClick={handleTransfer}
                            disabled={!transferAmount || !selectedRecipient || isTransferring || parseFloat(transferAmount) <= 0 || !isConnected}
                            startIcon={<Send />}
                            sx={{
                              flex: 1,
                              background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                              color: 'white',
                              py: 1.5,
                              '&:hover': {
                                background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)'
                              },
                              '&:disabled': {
                                background: 'rgba(255, 255, 255, 0.1)',
                                color: 'rgba(255, 255, 255, 0.3)'
                              }
                            }}
                          >
                            {isTransferring ? 'Выполняется...' : 'Выполнить перевод'}
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={resetTransferForm}
                            sx={{
                              borderColor: 'rgba(255, 255, 255, 0.3)',
                              color: 'white',
                              py: 1.5,
                              '&:hover': {
                                borderColor: 'rgba(255, 255, 255, 0.5)',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)'
                              }
                            }}
                          >
                            Сбросить
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* История операций */}
              <Grid item xs={12}>
                <Card sx={{ 
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <History sx={{ color: '#8B5CF6' }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        История операций
                      </Typography>
                      <Chip 
                        label={transferHistory.length} 
                        size="small" 
                        sx={{ 
                          backgroundColor: '#8B5CF6',
                          color: 'white',
                          fontWeight: 'bold'
                        }} 
                      />
                    </Box>
                    
                    {transferHistory.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1" sx={{ opacity: 0.7 }}>
                          История операций пуста
                        </Typography>
                      </Box>
                    ) : (
                      <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                        {transferHistory.map((transaction, index) => (
                          <React.Fragment key={transaction.id}>
                            <ListItem sx={{ 
                              py: 2,
                              backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.05)',
                              borderRadius: 1,
                              mb: 1
                            }}>
                              <ListItemIcon>
                                <Box sx={{ 
                                  p: 1, 
                                  borderRadius: '50%', 
                                  backgroundColor: getTransactionColor(transaction.type, transaction.amount) + '20',
                                  color: getTransactionColor(transaction.type, transaction.amount)
                                }}>
                                  {getTransactionIcon(transaction.type)}
                                </Box>
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                    <Box component="span" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                                      {transaction.description}
                                    </Box>
                                    <Box 
                                      component="span" 
                                      sx={{ 
                                        fontWeight: 'bold',
                                        fontSize: '1.25rem',
                                        color: getTransactionColor(transaction.type, transaction.amount)
                                      }}
                                    >
                                      {getAmountSign(transaction.type)}${transaction.amount.toLocaleString()}
                                    </Box>
                                  </Box>
                                }
                                secondary={
                                  <Box component="span" sx={{ display: 'block' }}>
                                    <Box component="span" sx={{ opacity: 0.7, fontSize: '0.875rem', display: 'block' }}>
                                      {transaction.from} → {transaction.to}
                                    </Box>
                                    <Box component="span" sx={{ opacity: 0.5, fontSize: '0.875rem', display: 'block' }}>
                                      {transaction.timestamp}
                                    </Box>
                                  </Box>
                                }
                              />
                              <ListItemSecondaryAction>
                                <Chip
                                  label={transaction.status === 'completed' ? 'Завершено' : 'В процессе'}
                                  size="small"
                                  sx={{
                                    backgroundColor: transaction.status === 'completed' ? '#10B981' : '#F59E0B',
                                    color: 'white',
                                    fontWeight: 'bold'
                                  }}
                                />
                              </ListItemSecondaryAction>
                            </ListItem>
                            {index < transferHistory.length - 1 && <Divider sx={{ opacity: 0.1 }} />}
                          </React.Fragment>
                        ))}
                      </List>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>

      {/* Уведомления */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setError('')} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSuccess('')} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {success}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default BankModal;