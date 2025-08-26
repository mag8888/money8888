import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert
} from '@mui/material';
import { motion } from 'framer-motion';
import { AttachMoney, TrendingUp, CreditCard, CheckCircle, Warning } from '@mui/icons-material';

const PROFESSIONS = [
  {
    id: 'engineer',
    name: 'Инженер',
    salary: 5000,
    expenses: 2000,
    passiveIncome: 0,
    description: 'Стабильная работа с хорошей зарплатой'
  },
  {
    id: 'doctor',
    name: 'Врач',
    salary: 8000,
    expenses: 3000,
    passiveIncome: 0,
    description: 'Высокооплачиваемая профессия с большими расходами'
  },
  {
    id: 'teacher',
    name: 'Учитель',
    salary: 3000,
    expenses: 1500,
    passiveIncome: 0,
    description: 'Скромная зарплата, но стабильный доход'
  },
  {
    id: 'businessman',
    name: 'Бизнесмен',
    salary: 12000,
    expenses: 5000,
    passiveIncome: 1000,
    description: 'Высокий риск, но большой потенциал'
  }
];

const ProfessionModal = ({ open, onClose, onSelectProfession, profession, playerBalance, onPayOffCredit }) => {
  const [showPayOffAlert, setShowPayOffAlert] = useState(false);
  const [creditToPayOff, setCreditToPayOff] = useState(null);

  const handleSelect = (profession) => {
    if (onSelectProfession) {
      onSelectProfession(profession);
      onClose();
    }
  };

  const handlePayOffCredit = (creditType, amount) => {
    setCreditToPayOff({ type: creditType, amount });
    setShowPayOffAlert(true);
  };

  const confirmPayOffCredit = () => {
    if (onPayOffCredit && creditToPayOff) {
      onPayOffCredit(creditToPayOff.type, creditToPayOff.amount);
      setShowPayOffAlert(false);
      setCreditToPayOff(null);
    }
  };

  const canExitToBigCircle = (profession) => {
    return profession && profession.passiveIncome > profession.totalExpenses;
  };

  const formatCurrency = (amount) => {
    return `$${amount?.toLocaleString() || '0'}`;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      component={motion.div}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <DialogTitle>
        {profession && profession.name ? `💼 ${profession.name}` : '💼 Выберите профессию'}
      </DialogTitle>
      <DialogContent>
        {profession ? (
          // Отображение деталей выбранной профессии
          <Box>
            <Typography variant="h6" gutterBottom color="primary">
              Детали профессии
            </Typography>
            
            <Box sx={{ 
              background: '#f5f5f5', 
              p: 3, 
              borderRadius: 2, 
              mb: 3 
            }}>
              <Typography variant="body1" sx={{ mb: 2, fontWeight: 'bold' }}>
                {profession.description || 'Описание профессии'}
              </Typography>
              
              {/* Доходы */}
              <Typography variant="h6" gutterBottom color="success.main" sx={{ mt: 3, mb: 2 }}>
                💰 Доходы
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Зарплата:</Typography>
                    <Typography variant="body2" color="success.main" fontWeight="bold">
                      {formatCurrency(profession.salary)}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Пассивный доход:</Typography>
                    <Typography variant="body2" color="success.main" fontWeight="bold">
                      {formatCurrency(profession.passiveIncome)}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Дивиденды:</Typography>
                    <Typography variant="body2" color="success.main" fontWeight="bold">
                      {formatCurrency(profession.dividends)}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    mb: 1,
                    p: 1,
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    borderRadius: 1,
                    border: '1px solid #4caf50'
                  }}>
                    <Typography variant="body1" color="success.main" fontWeight="bold">
                      Общий доход:
                    </Typography>
                    <Typography variant="body1" color="success.main" fontWeight="bold">
                      {formatCurrency(profession.totalIncome)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Расходы (нельзя погасить) */}
              <Typography variant="h6" gutterBottom color="error.main" sx={{ mt: 3, mb: 2 }}>
                📉 Расходы (нельзя погасить)
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Налоги ({profession.taxRate * 100}%):</Typography>
                    <Typography variant="body2" color="error.main" fontWeight="bold">
                      {formatCurrency(profession.taxAmount)}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Прочие расходы:</Typography>
                    <Typography variant="body2" color="error.main" fontWeight="bold">
                      {formatCurrency(profession.otherExpenses)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Кредиты (можно гасить) */}
              <Typography variant="h6" gutterBottom color="warning.main" sx={{ mt: 3, mb: 2 }}>
                💳 Кредиты (можно гасить)
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {profession.creditAuto > 0 && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      mb: 1,
                      p: 1,
                      backgroundColor: 'rgba(255, 152, 0, 0.1)',
                      borderRadius: 1,
                      border: '1px solid #ff9800'
                    }}>
                      <Typography variant="body2" color="warning.main">
                        Авто кредит:
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="warning.main" fontWeight="bold">
                          {formatCurrency(profession.creditAuto)}
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          color="warning"
                          onClick={() => handlePayOffCredit('auto', profession.creditAuto)}
                          startIcon={<CheckCircle />}
                        >
                          Погасить
                        </Button>
                      </Box>
                    </Box>
                  </Grid>
                )}
                
                {profession.creditEducation > 0 && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      mb: 1,
                      p: 1,
                      backgroundColor: 'rgba(255, 152, 0, 0.1)',
                      borderRadius: 1,
                      border: '1px solid #ff9800'
                    }}>
                      <Typography variant="body2" color="warning.main">
                        Образование:
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="warning.main" fontWeight="bold">
                          {formatCurrency(profession.creditEducation)}
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          color="warning"
                          onClick={() => handlePayOffCredit('education', profession.creditEducation)}
                          startIcon={<CheckCircle />}
                        >
                          Погасить
                        </Button>
                      </Box>
                    </Box>
                  </Grid>
                )}
                
                {profession.creditHousing > 0 && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      mb: 1,
                      p: 1,
                      backgroundColor: 'rgba(255, 152, 0, 0.1)',
                      borderRadius: 1,
                      border: '1px solid #ff9800'
                    }}>
                      <Typography variant="body2" color="warning.main">
                        Жилье:
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="warning.main" fontWeight="bold">
                          {formatCurrency(profession.creditHousing)}
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          color="warning"
                          onClick={() => handlePayOffCredit('housing', profession.creditHousing)}
                          startIcon={<CheckCircle />}
                        >
                          Погасить
                        </Button>
                      </Box>
                    </Box>
                  </Grid>
                )}
                
                {profession.creditCards > 0 && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      mb: 1,
                      p: 1,
                      backgroundColor: 'rgba(255, 152, 0, 0.1)',
                      borderRadius: 1,
                      border: '1px solid #ff9800'
                    }}>
                      <Typography variant="body2" color="warning.main">
                        Кредитные карты:
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="warning.main" fontWeight="bold">
                          {formatCurrency(profession.creditCards)}
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          color="warning"
                          onClick={() => handlePayOffCredit('cards', profession.creditCards)}
                          startIcon={<CheckCircle />}
                        >
                          Погасить
                        </Button>
                      </Box>
                    </Box>
                  </Grid>
                )}
              </Grid>

              {/* Итоговые расчеты */}
              <Typography variant="h6" gutterBottom color="info.main" sx={{ mt: 3, mb: 2 }}>
                📊 Итоговые расчеты
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Общие расходы:</Typography>
                    <Typography variant="body2" color="error.main" fontWeight="bold">
                      {formatCurrency(profession.totalExpenses)}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    mb: 1,
                    p: 2,
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    borderRadius: 1,
                    border: '1px solid #2196f3'
                  }}>
                    <Typography variant="h6" color="info.main" fontWeight="bold">
                      💰 Денежный поток:
                    </Typography>
                    <Typography variant="h6" color="info.main" fontWeight="bold">
                      {formatCurrency(profession.cashFlow)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Кнопка "Выйти на большой круг" */}
              {canExitToBigCircle(profession) && (
                <Box sx={{ 
                  mt: 3, 
                  p: 2, 
                  background: 'linear-gradient(45deg, #4caf50, #8bc34a)', 
                  borderRadius: 2,
                  border: '2px solid #4caf50',
                  textAlign: 'center'
                }}>
                  <Typography variant="h6" color="white" gutterBottom>
                    🎯 Пассивный доход превышает расходы!
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      border: '2px solid white',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.3)'
                      }
                    }}
                    startIcon={<TrendingUp />}
                  >
                    🚀 Выйти на большой круг
                  </Button>
                </Box>
              )}
              
              {playerBalance !== undefined && (
                <Box sx={{ 
                  mt: 3, 
                  p: 2, 
                  background: '#e8f5e8', 
                  borderRadius: 2,
                  border: '1px solid #4caf50'
                }}>
                  <Typography variant="h6" color="success.main" gutterBottom>
                    💰 Текущий баланс игрока
                  </Typography>
                  <Typography variant="h4" color="success.main" fontWeight="bold">
                    {formatCurrency(playerBalance)}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        ) : (
          // Выбор профессии
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Выберите профессию для начала игры. Каждая профессия имеет свои особенности.
            </Typography>
            
            <Grid container spacing={2}>
              {PROFESSIONS.map((prof) => (
                <Grid item xs={12} sm={6} key={prof.id}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { boxShadow: 3 }
                      }}
                      onClick={() => handleSelect(prof)}
                    >
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {prof.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {prof.description}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Зарплата:</Typography>
                          <Typography variant="body2" color="success.main">
                            {formatCurrency(prof.salary)}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Денежный поток:</Typography>
                          <Typography variant="body2" color="info.main">
                            {formatCurrency(prof.cashFlow)}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Баланс:</Typography>
                          <Typography variant="body2" color="success.main">
                            {formatCurrency(prof.balance)}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
      </DialogActions>

      {/* Модальное окно подтверждения погашения кредита */}
      <Dialog
        open={showPayOffAlert}
        onClose={() => setShowPayOffAlert(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          💳 Погашение кредита
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Вы уверены, что хотите погасить кредит на сумму {formatCurrency(creditToPayOff?.amount)}?
          </Alert>
          <Typography variant="body2" color="text.secondary">
            После погашения кредита ваши ежемесячные расходы уменьшатся, а денежный поток увеличится.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPayOffAlert(false)}>Отмена</Button>
          <Button 
            onClick={confirmPayOffCredit} 
            variant="contained" 
            color="success"
            startIcon={<CheckCircle />}
          >
            Погасить кредит
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default ProfessionModal;
