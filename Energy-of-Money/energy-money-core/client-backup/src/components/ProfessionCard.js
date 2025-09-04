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

  const format = (n) => Number(n || 0).toLocaleString();

  const principalAuto = (profession.creditAuto || 0) * 20;
  const principalEducation = (profession.creditEducation || 0) * 20;
  const principalHousing = (profession.creditHousing || 0) * 200;
  const principalCards = (profession.creditCards || 0) * 20;
  const principalTotal = principalAuto + principalEducation + principalHousing + principalCards;

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
        <CardContent sx={{ p: 2 }}>
          {/* Заголовок с иконкой */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Typography variant="h4" sx={{ color: getCategoryColor(profession.category) }}>
              {profession.icon}
            </Typography>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333', mb: 0.5, fontSize: '1rem' }}>
                {profession.name}
              </Typography>
              <Typography variant="caption" sx={{ color: '#666', fontStyle: 'italic', fontSize: '0.75rem' }}>
                {profession.description}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 1.5 }} />

          {/* Финансовая информация */}
          <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center', p: 0.5, bgcolor: '#f0f8ff', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ color: '#2e7d32', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  ${profession.salary}
                </Typography>
                <Typography variant="caption" sx={{ color: '#666', fontSize: '0.7rem' }}>
                  Зарплата
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center', p: 0.5, bgcolor: '#fff3e0', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ color: '#f57c00', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  ${profession.totalExpenses}
                </Typography>
                <Typography variant="caption" sx={{ color: '#666', fontSize: '0.7rem' }}>
                  Расходы
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Денежный поток */}
          <Box sx={{ 
            textAlign: 'center', 
            p: 1.5, 
            bgcolor: profession.cashFlow >= 0 ? '#e8f5e8' : '#ffebee',
            borderRadius: 2,
            mb: 1.5,
            border: `2px solid ${profession.cashFlow >= 0 ? '#4caf50' : '#f44336'}`
          }}>
            <Typography variant="h5" sx={{ 
              color: profession.cashFlow >= 0 ? '#2e7d32' : '#d32f2f', 
              fontWeight: 'bold',
              fontSize: '1.1rem'
            }}>
              ${profession.cashFlow}
            </Typography>
            <Typography variant="caption" sx={{ 
              color: profession.cashFlow >= 0 ? '#2e7d32' : '#d32f2f',
              fontWeight: 'bold',
              fontSize: '0.8rem'
            }}>
              Денежный поток
            </Typography>
          </Box>

          {/* Детали расходов */}
          <Box sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#666', mb: 0.5 }}>
              <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                <strong>Налоги:</strong> ${format(profession.taxAmount)} ({Math.round((profession.taxRate || 0) * 100)}%)
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#666', mb: 0.5 }}>
              <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                <strong>Прочие расходы:</strong> ${format(profession.otherExpenses)}
              </Typography>
            </Box>
            {profession.creditAuto > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: '#666', fontSize: '0.7rem' }}>
                  <strong>Кредит на авто:</strong> ${format(profession.creditAuto)}
                </Typography>
                <Typography variant="caption" sx={{ color: '#9C27B0', fontSize: '0.7rem' }}>
                  ${format(principalAuto)} (тело)
                </Typography>
              </Box>
            )}
            {profession.creditEducation > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: '#666', fontSize: '0.7rem' }}>
                  <strong>Образовательный кредит:</strong> ${format(profession.creditEducation)}
                </Typography>
                <Typography variant="caption" sx={{ color: '#9C27B0', fontSize: '0.7rem' }}>
                  ${format(principalEducation)} (тело)
                </Typography>
              </Box>
            )}
            {profession.creditHousing > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: '#666', fontSize: '0.7rem' }}>
                  <strong>Ипотека:</strong> ${format(profession.creditHousing)}
                </Typography>
                <Typography variant="caption" sx={{ color: '#9C27B0', fontSize: '0.7rem' }}>
                  ${format(principalHousing)} (тело)
                </Typography>
              </Box>
            )}
            {profession.creditCards > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: '#666', fontSize: '0.7rem' }}>
                  <strong>Кредитные карты:</strong> ${format(profession.creditCards)}
                </Typography>
                <Typography variant="caption" sx={{ color: '#9C27B0', fontSize: '0.7rem' }}>
                  ${format(principalCards)} (тело)
                </Typography>
              </Box>
            )}

            {/* Итого по телу кредита */}
            {principalTotal > 0 && (
              <Box sx={{ mt: 1, p: 1, bgcolor: '#f5f5f5', borderRadius: 1, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ color: '#333', fontWeight: 'bold', fontSize: '0.75rem' }}>
                  Итого тело кредитов
                </Typography>
                <Typography variant="caption" sx={{ color: '#333', fontWeight: 'bold', fontSize: '0.75rem' }}>
                  ${format(principalTotal)}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Пассивный доход и дивиденды */}
          {(profession.passiveIncome > 0 || profession.dividends > 0) && (
            <Box sx={{ mb: 1.5, p: 1.5, bgcolor: '#e8f5e8', borderRadius: 2 }}>
              <Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: 'bold', mb: 0.5, fontSize: '0.8rem' }}>
                💰 Пассивный доход
              </Typography>
              {profession.passiveIncome > 0 && (
                <Typography variant="caption" sx={{ color: '#666', fontSize: '0.7rem' }}>
                  Бизнес: ${profession.passiveIncome}
                </Typography>
              )}
              {profession.dividends > 0 && (
                <Typography variant="caption" sx={{ color: '#666', fontSize: '0.7rem' }}>
                  Дивиденды: ${profession.dividends}
                </Typography>
              )}
            </Box>
          )}

          {/* Теги категории и сложности */}
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1.5 }}>
            <Chip
              label={profession.category}
              size="small"
              sx={{ 
                bgcolor: getCategoryColor(profession.category),
                color: 'white',
                fontWeight: 'bold',
                textTransform: 'capitalize',
                fontSize: '0.6rem',
                height: '20px'
              }}
            />
            <Chip
              label={profession.difficulty === 'easy' ? 'Легкий' : 
                     profession.difficulty === 'medium' ? 'Средний' : 'Сложный'}
              size="small"
              sx={{ 
                bgcolor: getDifficultyColor(profession.difficulty),
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.6rem',
                height: '20px'
              }}
            />
          </Box>



          {/* Статус выбора */}
          {isSelected && (
            <Box sx={{ 
              textAlign: 'center', 
              p: 0.5, 
              bgcolor: '#4caf50', 
              color: 'white',
              borderRadius: 2,
              fontWeight: 'bold',
              fontSize: '0.8rem',
              mt: 1
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