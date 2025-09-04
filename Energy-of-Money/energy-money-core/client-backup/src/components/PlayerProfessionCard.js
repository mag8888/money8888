import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent,
  Chip,
  Grid,
  Divider,
  Avatar,
  Button,
  IconButton
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';

const PlayerProfessionCard = ({ player, profession, isOpen, onClose }) => {
  if (!isOpen || !player) return null;

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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '600px', width: '100%' }}
          >
            <Card
              sx={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                color: 'white',
                borderRadius: 3,
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                border: `2px solid ${profession ? getCategoryColor(profession.category) : '#666'}`
              }}
            >
              <CardContent sx={{ p: 4 }}>
                {/* Заголовок с кнопкой закрытия */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        width: 60,
                        height: 60,
                        bgcolor: profession ? getCategoryColor(profession.category) : '#666',
                        fontSize: '24px',
                        fontWeight: 'bold'
                      }}
                    >
                      {player.username.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {player.username}
                      </Typography>
                      {profession && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="h6" sx={{ color: '#ff9800' }}>
                            💼
                          </Typography>
                          <Typography variant="h6" sx={{ color: '#ff9800' }}>
                            {profession.name}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                  <IconButton
                    onClick={onClose}
                    sx={{ 
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>

                <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', my: 3 }} />

                {/* Статус готовности */}
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  bgcolor: player.ready ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 152, 0, 0.2)',
                  borderRadius: 2,
                  mb: 3,
                  border: `2px solid ${player.ready ? '#4caf50' : '#ff9800'}`
                }}>
                  <Typography variant="h6" sx={{ 
                    color: player.ready ? '#4caf50' : '#ff9800',
                    fontWeight: 'bold'
                  }}>
                    {player.ready ? '✅ ГОТОВ К ИГРЕ' : '⏳ НЕ ГОТОВ'}
                  </Typography>
                </Box>

                {/* Информация о профессии */}
                {profession ? (
                  <>
                    {/* Финансовая сводка */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ color: '#ff9800', mb: 2, textAlign: 'center' }}>
                        💰 ФИНАНСОВАЯ СВОДКА
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={4}>
                          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(46, 125, 50, 0.2)', borderRadius: 2 }}>
                            <Typography variant="h5" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                              ${profession.salary}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#ccc' }}>
                              Зарплата
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={4}>
                          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(245, 124, 0, 0.2)', borderRadius: 2 }}>
                            <Typography variant="h5" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                              ${profession.totalExpenses}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#ccc' }}>
                              Расходы
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={4}>
                          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(46, 125, 50, 0.2)', borderRadius: 2 }}>
                            <Typography variant="h5" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                              ${profession.cashFlow}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#ccc' }}>
                              Денежный поток
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Детали профессии */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ color: '#ff9800', mb: 2 }}>
                        📋 ДЕТАЛИ ПРОФЕССИИ
                      </Typography>
                      <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                        <Typography variant="body2" sx={{ color: '#ccc', mb: 1 }}>
                          <strong>Описание:</strong> {profession.description}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#ccc', mb: 1 }}>
                          <strong>Налоговая ставка:</strong> {Math.round(profession.taxRate * 100)}%
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#ccc', mb: 1 }}>
                          <strong>Категория:</strong> {profession.category}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#ccc' }}>
                          <strong>Сложность:</strong> {profession.difficulty === 'easy' ? 'Легкий' : 
                                                       profession.difficulty === 'medium' ? 'Средний' : 'Сложный'}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Пассивный доход */}
                    {(profession.passiveIncome > 0 || profession.dividends > 0) && (
                      <Box sx={{ mb: 3, p: 3, bgcolor: 'rgba(76, 175, 80, 0.2)', borderRadius: 2 }}>
                        <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
                          💰 ПАССИВНЫЙ ДОХОД
                        </Typography>
                        <Grid container spacing={2}>
                          {profession.passiveIncome > 0 && (
                            <Grid item xs={6}>
                              <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                                  ${profession.passiveIncome}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#ccc' }}>
                                  Бизнес
                                </Typography>
                              </Box>
                            </Grid>
                          )}
                          {profession.dividends > 0 && (
                            <Grid item xs={6}>
                              <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                                  ${profession.dividends}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#ccc' }}>
                                  Дивиденды
                                </Typography>
                              </Box>
                            </Grid>
                          )}
                        </Grid>
                      </Box>
                    )}

                    {/* Теги */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                      <Chip
                        label={profession.category}
                        size="medium"
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
                        size="medium"
                        sx={{ 
                          bgcolor: getDifficultyColor(profession.difficulty),
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>
                  </>
                ) : (
                  <Box sx={{ textAlign: 'center', p: 4 }}>
                    <Typography variant="h6" sx={{ color: '#ff9800', mb: 2 }}>
                      ⚠️ Профессия не выбрана
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#ccc' }}>
                      Игрок еще не выбрал профессию
                    </Typography>
                  </Box>
                )}

                {/* Кнопка закрытия */}
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={onClose}
                    sx={{
                      borderColor: '#ff9800',
                      color: '#ff9800',
                      '&:hover': {
                        borderColor: '#ff9800',
                        bgcolor: 'rgba(255, 152, 0, 0.1)'
                      }
                    }}
                  >
                    Закрыть
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PlayerProfessionCard;
