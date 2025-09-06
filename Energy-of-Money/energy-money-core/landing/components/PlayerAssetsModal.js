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
  IconButton,
  Paper
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';

const PlayerAssetsModal = ({ player, profession, isOpen, onClose }) => {
  if (!isOpen || !player) return null;

  // Демо-активы игрока (в реальном приложении это будет приходить с сервера)
  const playerAssets = [
    { 
      id: 1, 
      name: 'Акции McDonald\'s', 
      type: 'stock', 
      value: 5000, 
      description: 'Дивидендные акции', 
      icon: '📈',
      quantity: 100,
      dividendYield: 2.5,
      purchasePrice: 45,
      currentPrice: 50
    },
    { 
      id: 2, 
      name: 'Квартира в центре', 
      type: 'real_estate', 
      value: 15000, 
      description: 'Сдается в аренду', 
      icon: '🏠',
      monthlyRent: 800,
      location: 'Центр города',
      squareMeters: 45
    },
    { 
      id: 3, 
      name: 'Маленький магазин', 
      type: 'business', 
      value: 25000, 
      description: 'Продуктовый магазин', 
      icon: '🏪',
      monthlyProfit: 1200,
      employees: 3,
      businessType: 'Розничная торговля'
    },
    { 
      id: 4, 
      name: 'Государственные облигации', 
      type: 'bonds', 
      value: 8000, 
      description: 'Стабильный доход', 
      icon: '💼',
      interestRate: 4.2,
      maturityDate: '2025',
      issuer: 'Государство'
    },
    { 
      id: 5, 
      name: 'Золотые монеты', 
      type: 'precious_metals', 
      value: 3000, 
      description: 'Инвестиционное золото', 
      icon: '🪙',
      weight: '50 грамм',
      purity: '999.9',
      storage: 'Банковская ячейка'
    },
    { 
      id: 6, 
      name: 'Криптовалюта Bitcoin', 
      type: 'crypto', 
      value: 6000, 
      description: 'Цифровое золото', 
      icon: '₿',
      quantity: 0.15,
      purchasePrice: 40000,
      currentPrice: 40000
    }
  ];

  const getAssetTypeColor = (type) => {
    switch (type) {
      case 'stock': return '#1976d2';
      case 'real_estate': return '#2e7d32';
      case 'business': return '#ed6c02';
      case 'bonds': return '#9c27b0';
      case 'precious_metals': return '#ffd700';
      case 'crypto': return '#ff9800';
      default: return '#666';
    }
  };

  const getAssetTypeLabel = (type) => {
    switch (type) {
      case 'stock': return 'Акции';
      case 'real_estate': return 'Недвижимость';
      case 'business': return 'Бизнес';
      case 'bonds': return 'Облигации';
      case 'precious_metals': return 'Драгметаллы';
      case 'crypto': return 'Криптовалюта';
      default: return 'Другое';
    }
  };

  const getTotalAssetsValue = () => {
    return playerAssets.reduce((total, asset) => total + asset.value, 0);
  };

  const getMonthlyPassiveIncome = () => {
    return playerAssets.reduce((total, asset) => {
      if (asset.type === 'real_estate' && asset.monthlyRent) {
        return total + asset.monthlyRent;
      }
      if (asset.type === 'business' && asset.monthlyProfit) {
        return total + asset.monthlyProfit;
      }
      if (asset.type === 'bonds' && asset.interestRate) {
        return total + (asset.value * asset.interestRate / 100 / 12);
      }
      if (asset.type === 'stock' && asset.dividendYield) {
        return total + (asset.value * asset.dividendYield / 100 / 12);
      }
      return total;
    }, 0);
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
            style={{ maxWidth: '1200px', width: '100%', maxHeight: '90vh' }}
          >
            <Paper
              sx={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                color: 'white',
                borderRadius: 3,
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                overflow: 'auto',
                maxHeight: '90vh'
              }}
            >
              {/* Заголовок */}
              <Box sx={{ p: 4, borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        width: 60,
                        height: 60,
                        bgcolor: profession ? '#ff9800' : '#666',
                        fontSize: '24px',
                        fontWeight: 'bold'
                      }}
                    >
                      {player.username.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        💼 Активы игрока: {player.username}
                      </Typography>
                      {profession && (
                        <Typography variant="h6" sx={{ color: '#ff9800' }}>
                          Профессия: {profession.name}
                        </Typography>
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

                {/* Сводка по активам */}
                <Grid container spacing={3} sx={{ mt: 2 }}>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: 3, 
                      bgcolor: 'rgba(46, 125, 50, 0.2)', 
                      borderRadius: 2,
                      border: '2px solid #4caf50'
                    }}>
                      <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 'bold', mb: 1 }}>
                        ${getTotalAssetsValue().toLocaleString()}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#ccc' }}>
                        Общая стоимость активов
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: 3, 
                      bgcolor: 'rgba(255, 152, 0, 0.2)', 
                      borderRadius: 2,
                      border: '2px solid #ff9800'
                    }}>
                      <Typography variant="h4" sx={{ color: '#ff9800', fontWeight: 'bold', mb: 1 }}>
                        ${getMonthlyPassiveIncome().toFixed(0)}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#ccc' }}>
                        Пассивный доход в месяц
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: 3, 
                      bgcolor: 'rgba(156, 39, 176, 0.2)', 
                      borderRadius: 2,
                      border: '2px solid #9c27b0'
                    }}>
                      <Typography variant="h4" sx={{ color: '#9c27b0', fontWeight: 'bold', mb: 1 }}>
                        {playerAssets.length}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#ccc' }}>
                        Количество активов
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Список активов */}
              <Box sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ color: '#ff9800', mb: 3, textAlign: 'center' }}>
                  📋 Каталог активов
                </Typography>
                
                <Grid container spacing={3}>
                  {playerAssets.map((asset) => (
                    <Grid item xs={12} sm={6} md={4} key={asset.id}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card
                          sx={{
                            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                            color: '#333',
                            borderRadius: 3,
                            border: `3px solid ${getAssetTypeColor(asset.type)}`,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: 8
                            }
                          }}
                        >
                          <CardContent sx={{ p: 3 }}>
                            {/* Заголовок актива */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                              <Typography variant="h2" sx={{ color: getAssetTypeColor(asset.type) }}>
                                {asset.icon}
                              </Typography>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333', mb: 0.5 }}>
                                  {asset.name}
                                </Typography>
                                <Chip 
                                  label={getAssetTypeLabel(asset.type)}
                                  size="small"
                                  sx={{ 
                                    bgcolor: getAssetTypeColor(asset.type),
                                    color: 'white',
                                    fontWeight: 'bold'
                                  }}
                                />
                              </Box>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            {/* Основная информация */}
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                                {asset.description}
                              </Typography>
                              <Typography variant="h5" sx={{ color: '#2e7d32', fontWeight: 'bold', textAlign: 'center' }}>
                                ${asset.value.toLocaleString()}
                              </Typography>
                            </Box>

                            {/* Детали актива */}
                            <Box sx={{ mb: 2 }}>
                              {asset.type === 'stock' && (
                                <>
                                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                                    Количество: {asset.quantity} акций
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                                    Дивидендная доходность: {asset.dividendYield}%
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                                    Текущая цена: ${asset.currentPrice}
                                  </Typography>
                                </>
                              )}
                              
                              {asset.type === 'real_estate' && (
                                <>
                                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                                    Аренда: ${asset.monthlyRent}/мес
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                                    Площадь: {asset.squareMeters} м²
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                                    {asset.location}
                                  </Typography>
                                </>
                              )}
                              
                              {asset.type === 'business' && (
                                <>
                                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                                    Прибыль: ${asset.monthlyProfit}/мес
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                                    Сотрудники: {asset.employees}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                                    {asset.businessType}
                                  </Typography>
                                </>
                              )}
                              
                              {asset.type === 'bonds' && (
                                <>
                                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                                    Процентная ставка: {asset.interestRate}%
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                                    Погашение: {asset.maturityDate}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                                    Эмитент: {asset.issuer}
                                  </Typography>
                                </>
                              )}
                              
                              {asset.type === 'precious_metals' && (
                                <>
                                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                                    Вес: {asset.weight}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                                    Проба: {asset.purity}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                                    Хранение: {asset.storage}
                                  </Typography>
                                </>
                              )}
                              
                              {asset.type === 'crypto' && (
                                <>
                                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                                    Количество: {asset.quantity} BTC
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                                    Цена покупки: ${asset.purchasePrice.toLocaleString()}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                                    Текущая цена: ${asset.currentPrice.toLocaleString()}
                                  </Typography>
                                </>
                              )}
                            </Box>

                            {/* ID актива */}
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="caption" sx={{ color: '#999' }}>
                                ID: {asset.id}
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Кнопка закрытия */}
              <Box sx={{ p: 4, textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                <Button
                  variant="outlined"
                  onClick={onClose}
                  sx={{
                    borderColor: '#ff9800',
                    color: '#ff9800',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    '&:hover': {
                      borderColor: '#ff9800',
                      bgcolor: 'rgba(255, 152, 0, 0.1)'
                    }
                  }}
                >
                  Закрыть
                </Button>
              </Box>
            </Paper>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PlayerAssetsModal;
