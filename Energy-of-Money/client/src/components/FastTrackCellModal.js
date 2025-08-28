import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  Business as BusinessIcon,
  Flight as DreamIcon,
  Warning as LossIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as OpportunityIcon,
  School as EducationIcon,
  Favorite as CharityIcon,
  ShowChart as MarketIcon,
  ShoppingCart as DoodadIcon,
  Payment as PaydayIcon
} from '@mui/icons-material';

const FastTrackCellModal = ({ open, onClose, cellData }) => {
  if (!cellData || !cellData.data) {
    return null;
  }

  const asset = cellData.data;
  
  // Функция для получения иконки по типу актива
  const getAssetIcon = (type) => {
    switch (type) {
      case 'business':
        return <BusinessIcon />;
      case 'dream':
        return <DreamIcon />;
      case 'loss':
        return <LossIcon />;
      case 'money':
        return <MoneyIcon />;
      case 'opportunity':
        return <OpportunityIcon />;
      case 'education':
        return <EducationIcon />;
      case 'charity':
        return <CharityIcon />;
      case 'market':
        return <MarketIcon />;
      case 'doodad':
        return <DoodadIcon />;
      case 'payday':
        return <PaydayIcon />;
      default:
        return <BusinessIcon />;
    }
  };

  // Функция для получения цвета по типу актива
  const getAssetColor = (type) => {
    switch (type) {
      case 'business':
        return 'success'; // Зеленый
      case 'dream':
        return 'secondary'; // Фиолетовый
      case 'loss':
        return 'error'; // Бордовый/Красный
      case 'money':
        return 'warning'; // Желтый
      case 'opportunity':
        return 'info'; // Синий
      case 'education':
        return 'warning'; // Оранжевый
      case 'charity':
        return 'error'; // Красный
      case 'market':
        return 'info'; // Голубой
      case 'doodad':
        return 'secondary'; // Розовый
      case 'payday':
        return 'warning'; // Золотой
      default:
        return 'primary';
    }
  };

  // Функция для форматирования цены
  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `$${(price / 1000).toFixed(1)}K`;
    } else {
      return `$${price}`;
    }
  };

  // Функция для форматирования месячного дохода
  const formatMonthlyIncome = (income) => {
    if (income === 0) {
      return 'Нет дохода';
    } else if (income < 0) {
      return `-${formatPrice(Math.abs(income))}/мес`;
    } else if (income >= 1000) {
      return `$${(income / 1000).toFixed(1)}K/мес`;
    } else {
      return `$${income}/мес`;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          {getAssetIcon(asset.type)}
          <Typography variant="h5" component="span">
            {asset.name}
          </Typography>
          <Chip 
            label={asset.type.replace('_', ' ').toUpperCase()} 
            color={getAssetColor(asset.type)}
            size="small"
          />
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body1" color="text.secondary" paragraph>
          {asset.description}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={3}>
          {/* Основная информация */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  💰 Инвестиционные параметры
                </Typography>
                
                {asset.cost > 0 && (
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Стоимость:</Typography>
                    <Typography variant="body2" fontWeight="bold" color="primary">
                      {formatPrice(asset.cost)}
                    </Typography>
                  </Box>
                )}
                
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Месячный доход:</Typography>
                  <Typography 
                    variant="body2" 
                    fontWeight="bold" 
                    color={asset.monthlyIncome >= 0 ? 'success.main' : 'error.main'}
                  >
                    {formatMonthlyIncome(asset.monthlyIncome)}
                  </Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Категория:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {asset.category?.replace('_', ' ').toUpperCase() || 'Н/Д'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Дополнительная информация */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📊 Детали актива
                </Typography>
                
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Тип:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {asset.type?.replace('_', ' ').toUpperCase() || 'Н/Д'}
                  </Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Цвет:</Typography>
                  <Box 
                    sx={{ 
                      width: 20, 
                      height: 20, 
                      backgroundColor: asset.color, 
                      borderRadius: '50%',
                      border: '1px solid #ccc'
                    }} 
                  />
                </Box>
                
                {/* Расчет ROI для бизнесов */}
                {asset.type === 'business' && asset.monthlyIncome > 0 && asset.cost > 0 && (
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Годовой ROI:</Typography>
                    <Typography variant="body2" fontWeight="bold" color="success.main">
                      {((asset.monthlyIncome * 12 / asset.cost) * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Дополнительные поля для мечты */}
        {asset.type === 'dream' && (
          <Box mt={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🌟 Особенности мечты
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Мечты не приносят ежемесячного дохода, но могут быть реализованы 
                  при достижении финансовой свободы. Это мотивирует игроков 
                  стремиться к большому кругу.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Дополнительные поля для потерь */}
        {asset.type === 'loss' && (
          <Box mt={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ⚠️ Особенности потерь
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Потери могут включать как разовые траты, так и ежемесячные расходы. 
                  Важно иметь финансовую подушку безопасности для покрытия 
                  непредвиденных расходов.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Дополнительные поля для денег */}
        {asset.type === 'money' && (
          <Box mt={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  💰 Особенности денежных событий
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Денежные события приносят дополнительный доход без необходимости 
                  инвестиций. Это может быть выигрыш, наследство, бонус или 
                  доход от продажи активов.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Дополнительные поля для возможностей */}
        {asset.type === 'opportunity' && (
          <Box mt={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🚀 Особенности возможностей
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Возможности требуют инвестиций, но могут принести значительный 
                  доход. Важно тщательно оценивать риски и потенциальную 
                  прибыльность каждого проекта.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Дополнительные поля для образования */}
        {asset.type === 'education' && (
          <Box mt={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📚 Особенности образования
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Образование требует инвестиций, но не приносит прямого дохода. 
                  Однако оно может увеличить потенциал заработка в будущем 
                  и открыть новые возможности.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Дополнительные поля для благотворительности */}
        {asset.type === 'charity' && (
          <Box mt={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ❤️ Особенности благотворительности
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Благотворительность не приносит финансового дохода, но может 
                  принести моральное удовлетворение и социальные связи. 
                  Некоторые пожертвования могут быть налоговыми вычетами.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Дополнительные поля для рынка */}
        {asset.type === 'market' && (
          <Box mt={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📈 Особенности рынка
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Рыночные возможности могут принести доход без начальных 
                  инвестиций, но требуют знаний и опыта. Рынки могут быть 
                  волатильными и рискованными.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Дополнительные поля для всякой всячины */}
        {asset.type === 'doodad' && (
          <Box mt={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🛍️ Особенности всякой всячины
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Всякая всячина - это расходы на личные нужды и развлечения. 
                  Они не приносят дохода, но могут улучшить качество жизни. 
                  Важно контролировать такие расходы.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Дополнительные поля для дня зарплаты */}
        {asset.type === 'payday' && (
          <Box mt={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  💵 Особенности дня зарплаты
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  День зарплаты - это регулярный доход, который является основой 
                  финансового планирования. Важно правильно распределять 
                  зарплату между расходами, сбережениями и инвестициями.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Закрыть
        </Button>
        {asset.cost > 0 && (
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              // Здесь можно добавить логику покупки актива
              console.log('Покупка актива:', asset);
              onClose();
            }}
          >
            Купить за {formatPrice(asset.cost)}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default FastTrackCellModal;
