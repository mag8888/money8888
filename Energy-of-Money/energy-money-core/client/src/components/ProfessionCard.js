import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent,
  Chip,
  Grid,
  Divider
} from '@mui/material';
import { motion } from 'framer-motion';

const ProfessionCard = ({ profession, isSelected, onClick }) => {
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

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        sx={{
          cursor: 'pointer',
          border: isSelected ? '3px solid #4caf50' : '1px solid #ddd',
          transition: 'all 0.3s ease',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 8,
            borderColor: getCategoryColor(profession.category)
          }
        }}
        onClick={onClick}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Заголовок с иконкой */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="h3" sx={{ color: getCategoryColor(profession.category) }}>
              {profession.icon}
            </Typography>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333', mb: 0.5 }}>
                {profession.name}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                {profession.description}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Финансовая информация */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#f0f8ff', borderRadius: 1 }}>
                <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                  ${profession.salary}
                </Typography>
                <Typography variant="caption" sx={{ color: '#666' }}>
                  Зарплата
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#fff3e0', borderRadius: 1 }}>
                <Typography variant="h6" sx={{ color: '#f57c00', fontWeight: 'bold' }}>
                  ${profession.totalExpenses}
                </Typography>
                <Typography variant="caption" sx={{ color: '#666' }}>
                  Расходы
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Денежный поток */}
          <Box sx={{ 
            textAlign: 'center', 
            p: 2, 
            bgcolor: profession.cashFlow >= 0 ? '#e8f5e8' : '#ffebee',
            borderRadius: 2,
            mb: 2,
            border: `2px solid ${profession.cashFlow >= 0 ? '#4caf50' : '#f44336'}`
          }}>
            <Typography variant="h4" sx={{ 
              color: profession.cashFlow >= 0 ? '#2e7d32' : '#d32f2f', 
              fontWeight: 'bold' 
            }}>
              ${profession.cashFlow}
            </Typography>
            <Typography variant="body2" sx={{ 
              color: profession.cashFlow >= 0 ? '#2e7d32' : '#d32f2f',
              fontWeight: 'bold'
            }}>
              Денежный поток
            </Typography>
          </Box>

          {/* Детали расходов */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
              <strong>Налоги:</strong> ${profession.taxAmount} ({Math.round(profession.taxRate * 100)}%)
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
              <strong>Прочие расходы:</strong> ${profession.otherExpenses}
            </Typography>
            {profession.creditAuto > 0 && (
              <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                <strong>Кредит на авто:</strong> ${profession.creditAuto}
              </Typography>
            )}
          </Box>

          {/* Пассивный доход и дивиденды */}
          {(profession.passiveIncome > 0 || profession.dividends > 0) && (
            <Box sx={{ mb: 2, p: 2, bgcolor: '#e8f5e8', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 'bold', mb: 1 }}>
                💰 Пассивный доход
              </Typography>
              {profession.passiveIncome > 0 && (
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Бизнес: ${profession.passiveIncome}
                </Typography>
              )}
              {profession.dividends > 0 && (
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Дивиденды: ${profession.dividends}
                </Typography>
              )}
            </Box>
          )}

          {/* Теги категории и сложности */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            <Chip
              label={profession.category}
              size="small"
              sx={{ 
                bgcolor: getCategoryColor(profession.category),
                color: 'white',
                fontWeight: 'bold',
                textTransform: 'capitalize'
              }}
            />
            <Chip
              label={profession.difficulty === 'easy' ? 'Легкий' : 
                     profession.difficulty === 'medium' ? 'Средний' : 'Сложный'}
              size="small"
              sx={{ 
                bgcolor: getDifficultyColor(profession.difficulty),
                color: 'white',
                fontWeight: 'bold'
              }}
            />
          </Box>

          {/* Статус выбора */}
          {isSelected && (
            <Box sx={{ 
              textAlign: 'center', 
              p: 1, 
              bgcolor: '#4caf50', 
              color: 'white',
              borderRadius: 2,
              fontWeight: 'bold'
            }}>
              ✅ ВЫБРАНО
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProfessionCard;
