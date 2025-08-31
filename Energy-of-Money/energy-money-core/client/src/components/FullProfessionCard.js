import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Paper,
  Divider,
  IconButton,
  Chip,
  LinearProgress
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  Close as CloseIcon,
  AttachMoney,
  TrendingUp,
  CreditCard,
  Home,
  Business,
  School,
  CarRental,
  ShoppingCart,
  Warning,
  CheckCircle
} from '@mui/icons-material';

// Полные данные профессий в стиле Cashflow
// Структура расходов: общие расходы = 70% от зарплаты, PAYDAY = 30% от зарплаты
// Распределение расходов:
// - Налоги: 15% от зарплаты
// - Ипотека: 15% от зарплаты (кредит $100k+, платеж $500+)
// - Автокредит: 5% от зарплаты (кредит $20k+, платеж $200+)
// - Образование: 10% от зарплаты (кредит $50k+, платеж $400+)
// - Кредитная карта: 3% от зарплаты
// - Покупки: 2% от зарплаты
// - Другое: 20% от зарплаты
const FULL_PROFESSIONS = {
  teacher: {
    name: 'Учитель (K-12)',
    icon: '👩‍🏫',
    color: '#4caf50',
    income: {
      salary: 3300,
      interest: 0,
      realEstate: 0,
      business: 0,
      other: 0
    },
    expenses: {
      taxes: 495,      // 15% от зарплаты
      homeMortgage: 495,  // 15% от зарплаты
      carLoan: 165,    // 5% от зарплаты
      education: 330,   // 10% от зарплаты
      creditCard: 99,   // 3% от зарплаты
      retail: 66,       // 2% от зарплаты
      other: 660,       // 20% от зарплаты
      child: 0
    },
    assets: {
      stocks: 0,
      realEstate: 0,
      business: 0,
      other: 0
    },
    liabilities: {
      homeMortgage: 120000, // $120k кредит
      carLoans: 25000,      // $25k кредит
      education: 60000,     // $60k кредит
      creditCards: 2970,    // $3k кредит
      retail: 1980,         // $2k кредит
      loan: 0,
      realEstate: 0,
      other: 0
    },
    cash: 3300,         // 1 месяц зарплаты
    passiveIncome: 0
  },
  police: {
    name: 'Полицейский',
    icon: '👮‍♂️',
    color: '#2196f3',
    income: {
      salary: 3000,
      interest: 0,
      realEstate: 0,
      business: 0,
      other: 0
    },
    expenses: {
      taxes: 450,       // 15% от зарплаты
      homeMortgage: 450,   // 15% от зарплаты
      carLoan: 150,     // 5% от зарплаты
      education: 300,   // 10% от зарплаты
      creditCard: 90,    // 3% от зарплаты
      retail: 60,        // 2% от зарплаты
      other: 600,        // 20% от зарплаты
      loan: 0,
      child: 0
    },
    assets: {
      stocks: 0,
      realEstate: 0,
      business: 0,
      other: 0
    },
    liabilities: {
      homeMortgage: 110000, // $110k кредит
      carLoans: 22000,      // $22k кредит
      education: 55000,     // $55k кредит
      creditCards: 2700,    // $3k кредит
      retail: 1800,         // $2k кредит
      loan: 0,
      realEstate: 0,
      other: 0
    },
    cash: 3000,         // 1 месяц зарплаты
    passiveIncome: 0
  },
  janitor: {
    name: 'Уборщик',
    icon: '🧹',
    color: '#ff9800',
    income: {
      salary: 1600,
      interest: 0,
      realEstate: 0,
      business: 0,
      other: 0
    },
    expenses: {
      taxes: 240,       // 15% от зарплаты
      homeMortgage: 240,   // 15% от зарплаты
      carLoan: 80,      // 5% от зарплаты
      education: 160,   // 10% от зарплаты
      creditCard: 48,    // 3% от зарплаты
      retail: 32,        // 2% от зарплаты
      other: 320,        // 20% от зарплаты
      loan: 0,
      child: 0
    },
    assets: {
      stocks: 0,
      realEstate: 0,
      business: 0,
      other: 0
    },
    liabilities: {
      homeMortgage: 60000,  // $60k кредит
      carLoans: 15000,      // $15k кредит
      education: 35000,     // $35k кредит
      creditCards: 1440,    // $1.4k кредит
      retail: 960,          // $1k кредит
      loan: 0,
      realEstate: 0,
      other: 0
    },
    cash: 1600,         // 1 месяц зарплаты
    passiveIncome: 0
  },
  engineer: {
    name: 'Инженер',
    icon: '⚙️',
    color: '#9c27b0',
    income: {
      salary: 5000,
      interest: 0,
      realEstate: 0,
      business: 0,
      other: 0
    },
    expenses: {
      taxes: 750,       // 15% от зарплаты
      homeMortgage: 750,   // 15% от зарплаты
      carLoan: 250,     // 5% от зарплаты
      education: 500,   // 10% от зарплаты
      creditCard: 150,   // 3% от зарплаты
      retail: 100,       // 2% от зарплаты
      other: 1000,       // 20% от зарплаты
      loan: 0,
      child: 0
    },
    assets: {
      stocks: 0,
      realEstate: 0,
      business: 0,
      other: 0
    },
    liabilities: {
      homeMortgage: 150000, // $150k кредит
      carLoans: 30000,      // $30k кредит
      education: 75000,     // $75k кредит
      creditCards: 4500,    // $4.5k кредит
      retail: 3000,         // $3k кредит
      loan: 0,
      realEstate: 0,
      other: 0
    },
    cash: 5000,         // 1 месяц зарплаты
    passiveIncome: 0
  },
  doctor: {
    name: 'Врач',
    icon: '👨‍⚕️',
    color: '#f44336',
    income: {
      salary: 8000,
      interest: 0,
      realEstate: 0,
      business: 0,
      other: 0
    },
    expenses: {
      taxes: 1200,      // 15% от зарплаты
      homeMortgage: 1200,  // 15% от зарплаты
      carLoan: 400,     // 5% от зарплаты
      education: 800,   // 10% от зарплаты
      creditCard: 240,   // 3% от зарплаты
      retail: 160,       // 2% от зарплаты
      other: 1600,       // 20% от зарплаты
      loan: 0,
      child: 0
    },
    assets: {
      stocks: 0,
      realEstate: 0,
      business: 0,
      other: 0
    },
    liabilities: {
      homeMortgage: 200000, // $200k кредит
      carLoans: 40000,      // $40k кредит
      education: 100000,    // $100k кредит
      creditCards: 7200,    // $7.2k кредит
      retail: 4800,         // $4.8k кредит
      loan: 0,
      realEstate: 0,
      other: 0
    },
    cash: 8000,         // 1 месяц зарплаты
    passiveIncome: 0
  }
};

const FullProfessionCard = ({ open, onClose, professionId }) => {
  const [selectedProfession, setSelectedProfession] = useState(null);
  const [paidLiabilities, setPaidLiabilities] = useState({
    homeMortgage: 0,
    carLoans: 0,
    education: 0,
    creditCards: 0,
    retail: 0,
    loan: 0,
    realEstate: 0,
    other: 0
  });

  React.useEffect(() => {
    if (professionId && FULL_PROFESSIONS[professionId]) {
      setSelectedProfession(FULL_PROFESSIONS[professionId]);
      // Сбрасываем погашенные обязательства при смене профессии
      setPaidLiabilities({
        homeMortgage: 0,
        carLoans: 0,
        education: 0,
        creditCards: 0,
        retail: 0,
        loan: 0,
        realEstate: 0,
        other: 0
      });
    }
  }, [professionId]);

  if (!selectedProfession) return null;

  const prof = selectedProfession;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Функция для погашения обязательств
  const payOffLiability = (liabilityType, amount) => {
    if (amount <= 0) return; // Нельзя погасить то, чего нет
    
    setPaidLiabilities(prev => ({
      ...prev,
      [liabilityType]: Math.min(prev[liabilityType] + amount, prof.liabilities[liabilityType])
    }));
  };

  // Функция для погашения всех обязательств
  const payOffAllLiabilities = () => {
    setPaidLiabilities({
      homeMortgage: prof.liabilities.homeMortgage,
      carLoans: prof.liabilities.carLoans,
      education: prof.liabilities.education,
      creditCards: prof.liabilities.creditCards,
      retail: prof.liabilities.retail
    });
  };

  // Функция для полной оплаты всех обязательств
  const payAllLiabilities = () => {
    // Устанавливаем максимальные значения для всех обязательств
    const maxPayments = {
      homeMortgage: prof.liabilities.homeMortgage,
      carLoans: prof.liabilities.carLoans,
      education: prof.liabilities.education,
      creditCards: prof.liabilities.creditCards,
      retail: prof.liabilities.retail
    };
    
    setPaidLiabilities(maxPayments);
    
    // Показываем уведомление
    console.log('💰 [FullProfessionCard] Все обязательства полностью оплачены!');
  };

  // Функция для получения оставшейся суммы обязательства
  const getRemainingLiability = (liabilityType) => {
    const original = prof.liabilities[liabilityType];
    const paid = paidLiabilities[liabilityType];
    return Math.max(0, original - paid);
  };

  // Функция для получения оставшегося ежемесячного платежа
  const getRemainingPayment = (liabilityType) => {
    const remaining = getRemainingLiability(liabilityType);
    const original = prof.liabilities[liabilityType];
    
    // Если обязательство полностью погашено, платеж = 0
    if (remaining <= 0) return 0;
    
    // Иначе пропорционально уменьшаем платеж
    const paymentRatio = remaining / original;
    
    switch (liabilityType) {
      case 'homeMortgage':
        return Math.round(prof.expenses.homeMortgage * paymentRatio);
      case 'carLoans':
        return Math.round(prof.expenses.carLoan * paymentRatio);
      case 'education':
        return Math.round(prof.expenses.education * paymentRatio);
      case 'creditCards':
        return Math.round(prof.expenses.creditCard * paymentRatio);
      case 'retail':
        return Math.round(prof.expenses.retail * paymentRatio);
      default:
        return 0;
    }
  };
  
  // Расчеты с учетом погашенных обязательств
  const totalIncome = prof.income.salary + prof.income.interest + prof.income.realEstate + prof.income.business + prof.income.other;
  
  // Ежемесячные расходы с учетом погашенных обязательств
  const actualHomeMortgagePayment = getRemainingPayment('homeMortgage');
  const actualCarLoanPayment = getRemainingPayment('carLoans');
  const actualEducationPayment = getRemainingPayment('education');
  const actualCreditCardPayment = getRemainingPayment('creditCards');
  const actualRetailPayment = getRemainingPayment('retail');
  
  const totalExpenses = prof.expenses.taxes + actualHomeMortgagePayment + actualCarLoanPayment + 
                       actualEducationPayment + actualCreditCardPayment + actualRetailPayment + prof.expenses.other + 
                       prof.expenses.loan + prof.expenses.child;
  
  const payday = totalIncome - totalExpenses; // Должен составлять ~30% от зарплаты
  
  const totalAssets = prof.assets.stocks + prof.assets.realEstate + prof.assets.business + prof.assets.other;
  
  // Обязательства с учетом погашенных сумм
  const totalLiabilities = getRemainingLiability('homeMortgage') + getRemainingLiability('carLoans') + 
                          getRemainingLiability('creditCards') + getRemainingLiability('retail') + 
                          getRemainingLiability('loan') + getRemainingLiability('realEstate') + getRemainingLiability('other');

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
          position: 'relative'
        }
      }}
    >
      {/* Заголовок */}
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        textAlign: 'center',
        position: 'relative'
      }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          {prof.icon} {prof.name}
        </Typography>
        <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
          Финансовая карточка профессии
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'white'
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {/* Левая колонка */}
              <Grid item xs={12} md={8}>
                <Grid container spacing={2}>
                  {/* INCOME */}
                  <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                      <Box sx={{ 
                        background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                        color: 'white',
                        p: 1,
                        borderRadius: 1,
                        mb: 2,
                        textAlign: 'center'
                      }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          INCOME
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                          Cash Flow
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Зарплата:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(prof.income.salary)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Проценты/Дивиденды:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(prof.income.interest)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Недвижимость/Бизнес:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(prof.income.realEstate)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Другое:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(prof.income.other)}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>

                  {/* EXPENSES */}
                  <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                      <Box sx={{ 
                        background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                        color: 'white',
                        p: 1,
                        borderRadius: 1,
                        mb: 2,
                        textAlign: 'center'
                      }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          EXPENSES
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                          Платежи
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Налоги:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(prof.expenses.taxes)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Ипотека:</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: actualHomeMortgagePayment < prof.expenses.homeMortgage ? '#4caf50' : '#f44336' }}>
                            {formatCurrency(actualHomeMortgagePayment)}
                          </Typography>
                          {actualHomeMortgagePayment < prof.expenses.homeMortgage && (
                            <Typography variant="caption" sx={{ color: '#4caf50', fontSize: '0.7rem' }}>
                              было {formatCurrency(prof.expenses.homeMortgage)}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Автокредит:</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: actualCarLoanPayment < prof.expenses.carLoan ? '#4caf50' : '#f44336' }}>
                            {formatCurrency(actualCarLoanPayment)}
                          </Typography>
                          {actualCarLoanPayment < prof.expenses.carLoan && (
                            <Typography variant="caption" sx={{ color: '#4caf50', fontSize: '0.7rem' }}>
                              было {formatCurrency(prof.expenses.carLoan)}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Образование:</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: actualEducationPayment < prof.expenses.education ? '#4caf50' : '#f44336' }}>
                            {formatCurrency(actualEducationPayment)}
                          </Typography>
                          {actualEducationPayment < prof.expenses.education && (
                            <Typography variant="caption" sx={{ color: '#4caf50', fontSize: '0.7rem' }}>
                              было {formatCurrency(prof.expenses.education)}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Кредитная карта:</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: actualCreditCardPayment < prof.expenses.creditCard ? '#4caf50' : '#f44336' }}>
                            {formatCurrency(actualCreditCardPayment)}
                          </Typography>
                          {actualCreditCardPayment < prof.expenses.creditCard && (
                            <Typography variant="caption" sx={{ color: '#4caf50', fontSize: '0.7rem' }}>
                              было {formatCurrency(prof.expenses.creditCard)}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Покупки:</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: actualRetailPayment < prof.expenses.retail ? '#4caf50' : '#f44336' }}>
                            {formatCurrency(actualRetailPayment)}
                          </Typography>
                          {actualRetailPayment < prof.expenses.retail && (
                            <Typography variant="caption" sx={{ color: '#4caf50', fontSize: '0.7rem' }}>
                              было {formatCurrency(prof.expenses.retail)}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Другое:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(prof.expenses.other)}
                        </Typography>
                      </Box>
                      
                      {prof.expenses.loan > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Кредит:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {formatCurrency(prof.expenses.loan)}
                          </Typography>
                        </Box>
                      )}
                      
                      {prof.expenses.child > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Дети:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {formatCurrency(prof.expenses.child)}
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Grid>

                  {/* ASSETS */}
                  <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                      <Box sx={{ 
                        background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                        color: 'white',
                        p: 1,
                        borderRadius: 1,
                        mb: 2,
                        textAlign: 'center'
                      }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          ASSETS
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                          Стоимость/Доля
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                          Акции/Фонды/Депозиты:
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Стоимость:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {formatCurrency(prof.assets.stocks)}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                          Недвижимость/Бизнес:
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Стоимость:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {formatCurrency(prof.assets.realEstate)}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Другое:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(prof.assets.other)}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>

                  {/* LIABILITIES */}
                  <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                      <Box sx={{ 
                        background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                        color: 'white',
                        p: 1,
                        borderRadius: 1,
                        mb: 2,
                        textAlign: 'center'
                      }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          LIABILITIES
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                          Обязательства
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                        <Typography variant="body2">Ипотека:</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                            {formatCurrency(getRemainingLiability('homeMortgage'))}
                          </Typography>
                          {getRemainingLiability('homeMortgage') > 0 && (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => payOffLiability('homeMortgage', 10000)}
                              sx={{
                                color: '#ff9800',
                                borderColor: '#ff9800',
                                fontSize: '0.7rem',
                                py: 0.2,
                                px: 1,
                                minWidth: 'auto',
                                '&:hover': {
                                  backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                  borderColor: '#f57c00'
                                }
                              }}
                            >
                              погасить $10k
                            </Button>
                          )}
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                        <Typography variant="body2">Автокредиты:</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                            {formatCurrency(getRemainingLiability('carLoans'))}
                          </Typography>
                          {getRemainingLiability('carLoans') > 0 && (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => payOffLiability('carLoans', 5000)}
                              sx={{
                                color: '#ff9800',
                                borderColor: '#ff9800',
                                fontSize: '0.7rem',
                                py: 0.2,
                                px: 1,
                                minWidth: 'auto',
                                '&:hover': {
                                  backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                  borderColor: '#f57c00'
                                }
                              }}
                            >
                              погасить $5k
                            </Button>
                          )}
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                        <Typography variant="body2">Образование:</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                            {formatCurrency(getRemainingLiability('education'))}
                          </Typography>
                          {getRemainingLiability('education') > 0 && (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => payOffLiability('education', 10000)}
                              sx={{
                                color: '#ff9800',
                                borderColor: '#ff9800',
                                fontSize: '0.7rem',
                                py: 0.2,
                                px: 1,
                                minWidth: 'auto',
                                '&:hover': {
                                  backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                  borderColor: '#f57c00'
                                }
                              }}
                            >
                              погасить $10k
                            </Button>
                          )}
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                        <Typography variant="body2">Кредитные карты:</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                            {formatCurrency(getRemainingLiability('creditCards'))}
                          </Typography>
                          {getRemainingLiability('creditCards') > 0 && (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => payOffLiability('creditCards', 1000)}
                              sx={{
                                color: '#ff9800',
                                borderColor: '#ff9800',
                                fontSize: '0.7rem',
                                py: 0.2,
                                px: 1,
                                minWidth: 'auto',
                                '&:hover': {
                                  backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                  borderColor: '#f57c00'
                                }
                              }}
                            >
                              погасить $1k
                            </Button>
                          )}
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                        <Typography variant="body2">Покупки:</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                            {formatCurrency(getRemainingLiability('retail'))}
                          </Typography>
                          {getRemainingLiability('retail') > 0 && (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => payOffLiability('retail', 1000)}
                              sx={{
                                color: '#ff9800',
                                borderColor: '#ff9800',
                                fontSize: '0.7rem',
                                py: 0.2,
                                px: 1,
                                minWidth: 'auto',
                                '&:hover': {
                                  backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                  borderColor: '#f57c00'
                                }
                              }}
                            >
                              погасить $1k
                            </Button>
                          )}
                        </Box>
                      </Box>
                      
                      {prof.liabilities.loan > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Кредит:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {formatCurrency(prof.liabilities.loan)}
                          </Typography>
                        </Box>
                      )}
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Недвижимость/Бизнес:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(prof.liabilities.realEstate)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Другое:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(prof.liabilities.other)}
                        </Typography>
                      </Box>

                      {/* Кнопки управления обязательствами */}
                      <Box sx={{ 
                        mt: 2, 
                        pt: 2, 
                        borderTop: '1px solid rgba(255, 152, 0, 0.2)',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2
                      }}>
                        {/* Кнопка "погасить все" */}
                        {Object.values(paidLiabilities).some(amount => amount > 0) && (
                          <Button
                            variant="outlined"
                            size="medium"
                            onClick={payOffAllLiabilities}
                            sx={{
                              color: '#ff9800',
                              borderColor: '#ff9800',
                              borderWidth: 2,
                              fontWeight: 'bold',
                              '&:hover': {
                                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                borderColor: '#f57c00',
                                transform: 'scale(1.05)'
                              },
                              transition: 'all 0.2s ease-in-out'
                            }}
                          >
                            💰 ПОГАСИТЬ ВСЕ ОБЯЗАТЕЛЬСТВА
                          </Button>
                        )}
                        
                        {/* Кнопка "оплатить все" */}
                        <Button
                          variant="contained"
                          size="medium"
                          onClick={payAllLiabilities}
                          sx={{
                            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                            color: 'white',
                            fontWeight: 'bold',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                              transform: 'scale(1.05)'
                            },
                            transition: 'all 0.2s ease-in-out'
                          }}
                        >
                          💳 ОПЛАТИТЬ ВСЕ ОБЯЗАТЕЛЬСТВА
                        </Button>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>

              {/* Правая колонка - Сводка */}
              <Grid item xs={12} md={4}>
                <Paper elevation={3} sx={{ 
                  p: 3, 
                  borderRadius: 2, 
                  height: '100%',
                  background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Фоновый водяной знак */}
                  <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '120px',
                    opacity: 0.05,
                    color: 'white',
                    fontWeight: 'bold',
                    zIndex: 0
                  }}>
                    CASHFLO
                  </Box>
                  
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography variant="h6" sx={{ 
                      textAlign: 'center', 
                      mb: 3, 
                      fontWeight: 'bold',
                      color: '#ecf0f1'
                    }}>
                      INCREASE PASSIVE INCOME TO ESCAPE THE RAT RACE.
                    </Typography>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body1" sx={{ mb: 1, fontWeight: 'bold' }}>
                        TOTAL EXPENSES: {formatCurrency(totalExpenses)}
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min((totalExpenses / 15000) * 100, 100)}
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: '#e74c3c'
                          }
                        }}
                      />
                    </Box>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body1" sx={{ mb: 1, fontWeight: 'bold' }}>
                        PASSIVE INCOME: {formatCurrency(prof.passiveIncome)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ 
                      background: 'rgba(255,255,255,0.1)', 
                      p: 2, 
                      borderRadius: 2,
                      mb: 3
                    }}>
                      <Typography variant="h3" sx={{ 
                        fontWeight: 'bold', 
                        color: '#2ecc71',
                        textAlign: 'center',
                        mb: 2
                      }}>
                        CASH: {formatCurrency(prof.cash)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        TOTAL INCOME: {formatCurrency(totalIncome)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        TOTAL EXPENSES: {formatCurrency(-totalExpenses)}
                      </Typography>
                    </Box>
                    
                    {/* Информация о погашенных обязательствах */}
                    {Object.values(paidLiabilities).some(amount => amount > 0) && (
                      <Box sx={{ 
                        background: 'rgba(255, 152, 0, 0.1)',
                        p: 2,
                        borderRadius: 2,
                        border: '2px solid #ff9800',
                        mb: 2
                      }}>
                        <Typography variant="body2" sx={{ 
                          color: '#ff9800',
                          textAlign: 'center',
                          fontWeight: 'bold',
                          mb: 1
                        }}>
                          💰 Погашено обязательств: {formatCurrency(Object.values(paidLiabilities).reduce((sum, amount) => sum + amount, 0))}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                          color: '#ff9800',
                          textAlign: 'center',
                          display: 'block',
                          opacity: 0.8
                        }}>
                          Ежемесячные платежи уменьшены на {formatCurrency(
                            (prof.expenses.homeMortgage + prof.expenses.carLoan + prof.expenses.education + 
                             prof.expenses.creditCard + prof.expenses.retail) - 
                            (actualHomeMortgagePayment + actualCarLoanPayment + actualEducationPayment + 
                             actualCreditCardPayment + actualRetailPayment)
                          )}
                        </Typography>
                      </Box>
                    )}
                    
                    <Box sx={{ 
                      background: payday >= 0 ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)',
                      p: 2,
                      borderRadius: 2,
                      border: `2px solid ${payday >= 0 ? '#2ecc71' : '#e74c3c'}`
                    }}>
                      <Typography variant="h5" sx={{ 
                        fontWeight: 'bold', 
                        color: payday >= 0 ? '#2ecc71' : '#e74c3c',
                        textAlign: 'center',
                        mb: 1
                      }}>
                        PAYDAY: {formatCurrency(payday)}
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        color: payday >= 0 ? '#2ecc71' : '#e74c3c',
                        textAlign: 'center',
                        display: 'block',
                        opacity: 0.8
                      }}>
                        {Math.round((payday / prof.income.salary) * 100)}% от зарплаты
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </motion.div>
      </DialogContent>

      <DialogActions sx={{ 
        p: 2, 
        background: 'rgba(255,255,255,0.95)',
        borderTop: '1px solid rgba(0,0,0,0.1)'
      }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          Закрыть
        </Button>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          {Object.keys(FULL_PROFESSIONS).map((profId) => (
            <Button
              key={profId}
              variant={professionId === profId ? "contained" : "outlined"}
              size="small"
              onClick={() => setSelectedProfession(FULL_PROFESSIONS[profId])}
              sx={{
                borderRadius: 2,
                minWidth: 'auto',
                px: 2,
                background: professionId === profId 
                  ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)'
                  : 'transparent',
                color: professionId === profId ? 'white' : '#4caf50',
                borderColor: '#4caf50',
                '&:hover': {
                  background: professionId === profId 
                    ? 'linear-gradient(135deg, #45a049 0%, #388e3c 100%)'
                    : 'rgba(76, 175, 80, 0.1)'
                }
              }}
            >
              {FULL_PROFESSIONS[profId].icon}
            </Button>
          ))}
        </Box>
        
        <Button 
          variant="contained"
          startIcon={<CheckCircle />}
          sx={{
            background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
            borderRadius: 2,
            px: 3
          }}
        >
          Выбрать профессию
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FullProfessionCard;
