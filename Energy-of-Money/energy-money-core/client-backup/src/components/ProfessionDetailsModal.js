import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Chip,
  Paper
} from '@mui/material';
import { motion } from 'framer-motion';

const ProfessionDetailsModal = ({ open, profession, onClose }) => {
  if (!profession) return null;

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'hard': return '#f44336';
      default: return '#666';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      service: '#2196f3',
      sales: '#9c27b0',
      transport: '#ff5722',
      education: '#3f51b5',
      healthcare: '#e91e63',
      engineering: '#607d8b',
      legal: '#795548',
      business: '#ff9800',
      technology: '#00bcd4',
      creative: '#8bc34a',
      finance: '#4caf50',
      aviation: '#9e9e9e',
      architecture: '#673ab7'
    };
    return colors[category] || '#666';
  };

  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'Легкий';
      case 'medium': return 'Средний';
      case 'hard': return 'Сложный';
      default: return 'Неизвестно';
    }
  };

  const getCategoryText = (category) => {
    const categories = {
      service: 'Сервис',
      sales: 'Продажи',
      transport: 'Транспорт',
      education: 'Образование',
      healthcare: 'Здравоохранение',
      engineering: 'Инженерия',
      legal: 'Юриспруденция',
      business: 'Бизнес',
      technology: 'Технологии',
      creative: 'Творчество',
      finance: 'Финансы',
      aviation: 'Авиация',
      architecture: 'Архитектура'
    };
    return categories[category] || category;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperComponent={motion.div}
      PaperProps={{
        initial: { opacity: 0, scale: 0.8, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.8, y: 20 },
        transition: { duration: 0.3 }
      }}
    >
      <DialogTitle sx={{ 
        background: `linear-gradient(135deg, ${getCategoryColor(profession.category)}20 0%, ${getCategoryColor(profession.category)}10 100%)`,
        borderBottom: `2px solid ${getCategoryColor(profession.category)}`,
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <Typography variant="h2" sx={{ color: getCategoryColor(profession.category) }}>
          {profession.icon}
        </Typography>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
            {profession.name}
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', fontStyle: 'italic' }}>
            {profession.description}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Теги категории и сложности */}
        <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
          <Chip
            label={getCategoryText(profession.category)}
            size="medium"
            sx={{ 
              bgcolor: getCategoryColor(profession.category),
              color: 'white',
              fontWeight: 'bold',
              textTransform: 'capitalize'
            }}
          />
          <Chip
            label={getDifficultyText(profession.difficulty)}
            size="medium"
            sx={{ 
              bgcolor: getDifficultyColor(profession.difficulty),
              color: 'white',
              fontWeight: 'bold'
            }}
          />
        </Box>

        {/* Основная финансовая информация */}
        <Paper elevation={2} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>
            💰 Финансовая сводка
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e8f5e8', borderRadius: 2, border: '2px solid #4caf50' }}>
                <Typography variant="h4" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                  ${profession.salary.toLocaleString()}
                </Typography>
                <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                  Зарплата
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                  Основной доход
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#fff3e0', borderRadius: 2, border: '2px solid #ff9800' }}>
                <Typography variant="h4" sx={{ color: '#f57c00', fontWeight: 'bold' }}>
                  ${profession.totalExpenses.toLocaleString()}
                </Typography>
                <Typography variant="h6" sx={{ color: '#f57c00', fontWeight: 'bold' }}>
                  Расходы
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                  Общие затраты
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ 
                textAlign: 'center', 
                p: 2, 
                bgcolor: profession.cashFlow >= 0 ? '#e8f5e8' : '#ffebee',
                borderRadius: 2,
                border: `2px solid ${profession.cashFlow >= 0 ? '#4caf50' : '#f44336'}`
              }}>
                <Typography variant="h4" sx={{ 
                  color: profession.cashFlow >= 0 ? '#2e7d32' : '#d32f2f', 
                  fontWeight: 'bold' 
                }}>
                  ${profession.cashFlow.toLocaleString()}
                </Typography>
                <Typography variant="h6" sx={{ 
                  color: profession.cashFlow >= 0 ? '#2e7d32' : '#d32f2f',
                  fontWeight: 'bold'
                }}>
                  Денежный поток
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                  {profession.cashFlow >= 0 ? 'Положительный' : 'Отрицательный'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Детальная информация о расходах */}
        <Paper elevation={2} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)' }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>
            💸 Детализация расходов
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, bgcolor: '#fff', borderRadius: 2, border: '1px solid #ddd' }}>
                <Typography variant="h6" sx={{ color: '#f57c00', fontWeight: 'bold', mb: 1 }}>
                  Налоги
                </Typography>
                <Typography variant="h4" sx={{ color: '#f57c00', fontWeight: 'bold' }}>
                  ${profession.taxAmount.toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  {Math.round(profession.taxRate * 100)}% от зарплаты
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, bgcolor: '#fff', borderRadius: 2, border: '1px solid #ddd' }}>
                <Typography variant="h6" sx={{ color: '#f57c00', fontWeight: 'bold', mb: 1 }}>
                  Прочие расходы
                </Typography>
                <Typography variant="h4" sx={{ color: '#f57c00', fontWeight: 'bold' }}>
                  ${profession.otherExpenses.toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Питание, транспорт, развлечения
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Кредиты */}
          {(profession.creditAuto > 0 || profession.creditEducation > 0 || profession.creditHousing > 0 || profession.creditCards > 0) && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ color: '#d32f2f', fontWeight: 'bold', mb: 1 }}>
                💳 Кредитные обязательства
              </Typography>
              <Grid container spacing={2}>
                {profession.creditAuto > 0 && (
                  <Grid item xs={12} md={6}>
                    <Box sx={{ p: 2, bgcolor: '#ffebee', borderRadius: 2, border: '1px solid #f44336' }}>
                      <Typography variant="body1" sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                        Автокредит: ${profession.creditAuto.toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {profession.creditEducation > 0 && (
                  <Grid item xs={12} md={6}>
                    <Box sx={{ p: 2, bgcolor: '#ffebee', borderRadius: 2, border: '1px solid #f44336' }}>
                      <Typography variant="body1" sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                        Образовательный кредит: ${profession.creditEducation.toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {profession.creditHousing > 0 && (
                  <Grid item xs={12} md={6}>
                    <Box sx={{ p: 2, bgcolor: '#ffebee', borderRadius: 2, border: '1px solid #f44336' }}>
                      <Typography variant="body1" sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                        Ипотека: ${profession.creditHousing.toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {profession.creditCards > 0 && (
                  <Grid item xs={12} md={6}>
                    <Box sx={{ p: 2, bgcolor: '#ffebee', borderRadius: 2, border: '1px solid #f44336' }}>
                      <Typography variant="body1" sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                        Кредитные карты: ${profession.creditCards.toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </Paper>

        {/* Пассивный доход */}
        {(profession.passiveIncome > 0 || profession.dividends > 0) && (
          <Paper elevation={2} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)' }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#2e7d32' }}>
              💰 Пассивный доход
            </Typography>
            
            <Grid container spacing={2}>
              {profession.passiveIncome > 0 && (
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, bgcolor: '#fff', borderRadius: 2, border: '2px solid #4caf50' }}>
                    <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 'bold', mb: 1 }}>
                      Бизнес
                    </Typography>
                    <Typography variant="h4" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                      ${profession.passiveIncome.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      Ежемесячный доход от бизнеса
                    </Typography>
                  </Box>
                </Grid>
              )}
              
              {profession.dividends > 0 && (
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, bgcolor: '#fff', borderRadius: 2, border: '2px solid #4caf50' }}>
                    <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 'bold', mb: 1 }}>
                      Дивиденды
                    </Typography>
                    <Typography variant="h4" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                      ${profession.dividends.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      Доход от акций
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>
        )}

        {/* Дополнительная информация */}
        <Paper elevation={2} sx={{ p: 3, background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)' }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>
            📊 Дополнительная информация
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, bgcolor: '#fff', borderRadius: 2, border: '1px solid #ddd' }}>
                <Typography variant="h6" sx={{ color: '#9c27b0', fontWeight: 'bold', mb: 1 }}>
                  Начальный баланс
                </Typography>
                <Typography variant="h4" sx={{ color: '#9c27b0', fontWeight: 'bold' }}>
                  ${profession.balance.toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Деньги на руках в начале игры
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, bgcolor: '#fff', borderRadius: 2, border: '1px solid #ddd' }}>
                <Typography variant="h6" sx={{ color: '#9c27b0', fontWeight: 'bold', mb: 1 }}>
                  Общий доход
                </Typography>
                <Typography variant="h4" sx={{ color: '#9c27b0', fontWeight: 'bold' }}>
                  ${profession.totalIncome.toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Зарплата + пассивный доход
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </DialogContent>

      <DialogActions sx={{ p: 3, background: '#f8f9fa' }}>
        <Button 
          onClick={onClose} 
          variant="contained" 
          size="large"
          sx={{ 
            borderRadius: 2, 
            px: 4,
            background: `linear-gradient(135deg, ${getCategoryColor(profession.category)} 0%, ${getCategoryColor(profession.category)}dd 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${getCategoryColor(profession.category)}dd 0%, ${getCategoryColor(profession.category)} 100%)`
            }
          }}
        >
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfessionDetailsModal;
