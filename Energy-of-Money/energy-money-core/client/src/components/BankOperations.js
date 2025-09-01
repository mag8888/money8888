import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Divider,
  Grid,
  Card,
  CardContent,
  Alert,
  Snackbar
} from '@mui/material';
import {
  AccountBalance,
  Payment,
  History,
  Close,
  Refresh,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Home,
  School,
  DirectionsCar
} from '@mui/icons-material';

const BankOperations = ({ open, onClose, playerData, onTransaction, socket, roomId }) => {
  const [transferAmount, setTransferAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // История транзакций (в реальном приложении это будет приходить с сервера)
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      from: 'MAG',
      to: 'Алексей',
      amount: 100,
      type: 'transfer',
      timestamp: '2024-01-15 14:30',
      status: 'completed'
    },
    {
      id: 2,
      from: 'Мария',
      to: 'MAG',
      amount: 50,
      type: 'transfer',
      timestamp: '2024-01-15 13:45',
      status: 'completed'
    }
  ]);

  // Кредиты игрока (из данных профессии)
  const [credits, setCredits] = useState({
    creditAuto: playerData?.profession?.creditAuto || 0,
    creditEducation: playerData?.profession?.creditEducation || 0,
    creditHousing: playerData?.profession?.creditHousing || 0,
    creditCards: playerData?.profession?.creditCards || 0
  });

  // Обработчики сокет событий
  useEffect(() => {
    if (!socket) return;

    const handleBankTransferSuccess = (data) => {
      setSnackbar({
        open: true,
        message: data.message,
        severity: 'success'
      });
      
      // Обновляем баланс игрока
      if (onTransaction) {
        onTransaction({
          type: 'transfer',
          amount: -parseFloat(transferAmount),
          recipient: recipient
        });
      }
    };

    const handleBankTransferError = (data) => {
      setSnackbar({
        open: true,
        message: data.message,
        severity: 'error'
      });
    };

    const handleCreditPaymentSuccess = (data) => {
      setSnackbar({
        open: true,
        message: data.message,
        severity: 'success'
      });
      
      // Обновляем кредиты
      if (data.remainingCredits) {
        setCredits(data.remainingCredits);
      }
      
      // Обновляем баланс игрока
      if (onTransaction) {
        onTransaction({
          type: 'credit_payment',
          amount: -parseFloat(transferAmount),
          creditType: 'creditType'
        });
      }
    };

    const handleCreditPaymentError = (data) => {
      setSnackbar({
        open: true,
        message: data.message,
        severity: 'error'
      });
    };

    const handleTransactionHistory = (data) => {
      setTransactions(data);
    };

    // Подписываемся на события
    socket.on('bankTransferSuccess', handleBankTransferSuccess);
    socket.on('bankTransferError', handleBankTransferError);
    socket.on('creditPaymentSuccess', handleCreditPaymentSuccess);
    socket.on('creditPaymentError', handleCreditPaymentError);
    socket.on('transactionHistory', handleTransactionHistory);

    // Запрашиваем историю транзакций при открытии
    if (open && socket && roomId && playerData?.id) {
      socket.emit('getTransactionHistory', {
        roomId,
        playerId: playerData.id
      });
    }

    return () => {
      socket.off('bankTransferSuccess', handleBankTransferSuccess);
      socket.off('bankTransferError', handleBankTransferError);
      socket.off('creditPaymentSuccess', handleCreditPaymentSuccess);
      socket.off('creditPaymentError', handleCreditPaymentError);
      socket.off('transactionHistory', handleTransactionHistory);
    };
  }, [socket, open, roomId, playerData?.id, transferAmount, recipient, onTransaction]);

  const handleTransfer = () => {
    if (!transferAmount || !recipient) {
      setSnackbar({
        open: true,
        message: 'Заполните все поля',
        severity: 'error'
      });
      return;
    }

    const amount = parseFloat(transferAmount);
    if (amount <= 0) {
      setSnackbar({
        open: true,
        message: 'Сумма должна быть больше 0',
        severity: 'error'
      });
      return;
    }

    if (amount > (playerData?.balance || 0)) {
      setSnackbar({
        open: true,
        message: 'Недостаточно средств',
        severity: 'error'
      });
      return;
    }

    // Отправляем запрос на сервер через сокет
    if (socket && roomId && playerData?.id) {
      socket.emit('bankTransfer', {
        roomId,
        playerId: playerData.id,
        recipient,
        amount
      });
    } else {
      // Fallback для локального режима
      const newTransaction = {
        id: Date.now(),
        from: playerData?.username || 'Игрок',
        to: recipient,
        amount: amount,
        type: 'transfer',
        timestamp: new Date().toLocaleString('ru-RU'),
        status: 'completed'
      };

      setTransactions(prev => [newTransaction, ...prev]);

      if (onTransaction) {
        onTransaction({
          type: 'transfer',
          amount: -amount,
          recipient: recipient
        });
      }

      setSnackbar({
        open: true,
        message: `Перевод $${amount} выполнен успешно`,
        severity: 'success'
      });
    }

    // Очищаем поля
    setTransferAmount('');
    setRecipient('');
  };

  const handleCreditPayment = (creditType, amount) => {
    if (amount <= 0) {
      setSnackbar({
        open: true,
        message: 'Сумма должна быть больше 0',
        severity: 'error'
      });
      return;
    }

    if (amount > (playerData?.balance || 0)) {
      setSnackbar({
        open: true,
        message: 'Недостаточно средств',
        severity: 'error'
      });
      return;
    }

    if (amount > credits[creditType]) {
      setSnackbar({
        open: true,
        message: 'Сумма превышает размер кредита',
        severity: 'error'
      });
      return;
    }

    // Отправляем запрос на сервер через сокет
    if (socket && roomId && playerData?.id) {
      socket.emit('creditPayment', {
        roomId,
        playerId: playerData.id,
        creditType,
        amount
      });
    } else {
      // Fallback для локального режима
      setCredits(prev => ({
        ...prev,
        [creditType]: prev[creditType] - amount
      }));

      const newTransaction = {
        id: Date.now(),
        from: playerData?.username || 'Игрок',
        to: 'Банк',
        amount: amount,
        type: 'credit_payment',
        creditType: creditType,
        timestamp: new Date().toLocaleString('ru-RU'),
        status: 'completed'
      };

      setTransactions(prev => [newTransaction, ...prev]);

      if (onTransaction) {
        onTransaction({
          type: 'credit_payment',
          amount: -amount,
          creditType: creditType
        });
      }

      setSnackbar({
        open: true,
        message: `Погашение кредита $${amount} выполнено`,
        severity: 'success'
      });
    }
  };

  const resetForm = () => {
    setTransferAmount('');
    setRecipient('');
  };

  // Обработчик нажатия клавиши Enter
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleTransfer();
    }
  };

  const getCreditIcon = (creditType) => {
    switch (creditType) {
      case 'creditAuto': return <DirectionsCar />;
      case 'creditHousing': return <Home />;
      case 'creditEducation': return <School />;
      case 'creditCards': return <CreditCard />;
      default: return <CreditCard />;
    }
  };

  const getCreditName = (creditType) => {
    switch (creditType) {
      case 'creditAuto': return 'Автокредит';
      case 'creditHousing': return 'Ипотека';
      case 'creditEducation': return 'Образовательный кредит';
      case 'creditCards': return 'Кредитные карты';
      default: return 'Кредит';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          color: '#ffffff',
          borderRadius: 3,
          border: '2px solid #4a90e2'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: '2px solid #4a90e2',
        pb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AccountBalance sx={{ color: '#4a90e2', fontSize: 32 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Банковские операции
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip 
            label={transactions.length} 
            size="small" 
            sx={{ 
              bgcolor: '#e91e63', 
              color: '#ffffff',
              fontWeight: 'bold'
            }} 
          />
          <IconButton onClick={onClose} sx={{ color: '#ffffff' }}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Форма перевода */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 2
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  mb: 3
                }}>
                  <Payment sx={{ color: '#4a90e2' }} />
                  Перевод средств
                </Typography>

                <TextField
                  fullWidth
                  label="Получатель"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  onKeyPress={handleKeyPress}
                  sx={{ mb: 2 }}
                  InputProps={{
                    sx: { color: '#ffffff' }
                  }}
                  InputLabelProps={{
                    sx: { color: 'rgba(255,255,255,0.7)' }
                  }}
                />

                <TextField
                  fullWidth
                  label="Сумма перевода ($)"
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  onKeyPress={handleKeyPress}
                  sx={{ mb: 3 }}
                  InputProps={{
                    sx: { color: '#ffffff' }
                  }}
                  InputLabelProps={{
                    sx: { color: 'rgba(255,255,255,0.7)' }
                  }}
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<Payment />}
                    onClick={handleTransfer}
                    sx={{
                      background: 'linear-gradient(45deg, #4a90e2, #7b68ee)',
                      color: '#ffffff',
                      fontWeight: 'bold',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #357abd, #6a5acd)'
                      }
                    }}
                  >
                    ВЫПОЛНИТЬ ПЕРЕВОД
                  </Button>
                  <IconButton 
                    onClick={resetForm}
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.1)',
                      color: '#ffffff',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.2)'
                      }
                    }}
                  >
                    <Refresh />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Кредиты */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 2
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  mb: 3
                }}>
                  <CreditCard sx={{ color: '#ff6b6b' }} />
                  Погашение кредитов
                </Typography>

                {Object.entries(credits).map(([creditType, amount]) => (
                  amount > 0 && (
                    <Box key={creditType} sx={{ mb: 2 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        mb: 1
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getCreditIcon(creditType)}
                          <Typography variant="body2">
                            {getCreditName(creditType)}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: '#ff6b6b', fontWeight: 'bold' }}>
                          ${amount}
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        onClick={() => handleCreditPayment(creditType, amount)}
                        sx={{
                          borderColor: '#ff6b6b',
                          color: '#ff6b6b',
                          '&:hover': {
                            borderColor: '#ff5252',
                            bgcolor: 'rgba(255,107,107,0.1)'
                          }
                        }}
                      >
                        Погасить полностью
                      </Button>
                    </Box>
                  )
                ))}

                {Object.values(credits).every(amount => amount === 0) && (
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
                    У вас нет активных кредитов
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* История транзакций */}
          <Grid item xs={12}>
            <Card sx={{ 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 2
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  mb: 2
                }}>
                  <History sx={{ color: '#4caf50' }} />
                  История переводов
                </Typography>

                <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {transactions.map((transaction, index) => (
                    <React.Fragment key={transaction.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          {transaction.type === 'transfer' ? (
                            <TrendingUp sx={{ color: '#4caf50' }} />
                          ) : (
                            <TrendingDown sx={{ color: '#ff6b6b' }} />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                {transaction.from} → {transaction.to}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                {transaction.timestamp}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Typography variant="h6" sx={{ 
                              color: transaction.type === 'transfer' ? '#4caf50' : '#ff6b6b',
                              fontWeight: 'bold'
                            }}>
                              ${transaction.amount}
                            </Typography>
                          }
                        />
                      </ListItem>
                      {index < transactions.length - 1 && <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />}
                    </React.Fragment>
                  ))}
                </List>

                {transactions.length === 0 && (
                  <Typography variant="body2" sx={{ 
                    color: 'rgba(255,255,255,0.7)', 
                    textAlign: 'center',
                    py: 2
                  }}>
                    История транзакций пуста
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default BankOperations;
