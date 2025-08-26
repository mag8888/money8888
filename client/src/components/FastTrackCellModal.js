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
  Home as HomeIcon,
  TrendingUp as StockIcon,
  AccountBalance as BondIcon,
  CurrencyBitcoin as CryptoIcon,
  Diamond as PreciousMetalIcon,
  Collections as CollectibleIcon,
  Store as FranchiseIcon,
  Copyright as PatentIcon,
  Security as InsuranceIcon,
  School as EducationIcon
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
      case 'real_estate':
        return <HomeIcon />;
      case 'stock':
        return <StockIcon />;
      case 'bond':
        return <BondIcon />;
      case 'cryptocurrency':
        return <CryptoIcon />;
      case 'precious_metal':
        return <PreciousMetalIcon />;
      case 'collectible':
        return <CollectibleIcon />;
      case 'franchise':
        return <FranchiseIcon />;
      case 'patent':
        return <PatentIcon />;
      case 'insurance':
        return <InsuranceIcon />;
      case 'education':
        return <EducationIcon />;
      default:
        return <BusinessIcon />;
    }
  };

  // Функция для получения цвета по типу актива
  const getAssetColor = (type) => {
    switch (type) {
      case 'business':
        return 'primary';
      case 'real_estate':
        return 'success';
      case 'stock':
        return 'info';
      case 'bond':
        return 'secondary';
      case 'cryptocurrency':
        return 'warning';
      case 'precious_metal':
        return 'default';
      case 'collectible':
        return 'error';
      case 'franchise':
        return 'primary';
      case 'patent':
        return 'info';
      case 'insurance':
        return 'success';
      case 'education':
        return 'secondary';
      default:
        return 'primary';
    }
  };

  // Функция для получения цвета по уровню риска
  const getRiskColor = (risk) => {
    switch (risk) {
      case 'very_low':
        return 'success';
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      case 'very_high':
        return 'error';
      default:
        return 'default';
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
    if (income >= 1000) {
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
                
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Стоимость:</Typography>
                  <Typography variant="body2" fontWeight="bold" color="primary">
                    {formatPrice(asset.cost)}
                  </Typography>
                </Box>
                
                {asset.monthlyIncome > 0 && (
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Месячный доход:</Typography>
                    <Typography variant="body2" fontWeight="bold" color="success.main">
                      {formatMonthlyIncome(asset.monthlyIncome)}
                    </Typography>
                  </Box>
                )}
                
                {asset.downPayment && (
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Первый взнос:</Typography>
                    <Typography variant="body2" fontWeight="bold" color="warning.main">
                      {formatPrice(asset.downPayment)}
                    </Typography>
                  </Box>
                )}
                
                {asset.risk && (
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Уровень риска:</Typography>
                    <Chip 
                      label={asset.risk.replace('_', ' ').toUpperCase()} 
                      color={getRiskColor(asset.risk)}
                      size="small"
                    />
                  </Box>
                )}
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
                  <Typography variant="body2">Категория:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {asset.category?.replace('_', ' ').toUpperCase() || 'Н/Д'}
                  </Typography>
                </Box>
                
                {asset.maturity && (
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Срок погашения:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {asset.maturity.replace('_', ' ')}
                    </Typography>
                  </Box>
                )}
                
                {/* Расчет ROI */}
                {asset.monthlyIncome > 0 && asset.cost > 0 && (
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

        {/* Дополнительные поля для недвижимости */}
        {asset.type === 'real_estate' && (
          <Box mt={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🏠 Особенности недвижимости
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  При покупке недвижимости требуется внести первый взнос в размере {asset.downPayment ? formatPrice(asset.downPayment) : '20% от стоимости'}. 
                  Остальная сумма может быть профинансирована через ипотечный кредит.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Дополнительные поля для акций */}
        {asset.type === 'stock' && (
          <Box mt={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📈 Особенности акций
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Акции могут приносить как дивидендный доход, так и доход от роста стоимости. 
                  Цены на акции могут значительно колебаться в зависимости от рыночных условий.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Дополнительные поля для криптовалют */}
        {asset.type === 'cryptocurrency' && (
          <Box mt={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🪙 Особенности криптовалют
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Криптовалюты являются высокорискованными активами с высокой волатильностью. 
                  Цены могут изменяться на десятки процентов в течение одного дня.
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
      </DialogActions>
    </Dialog>
  );
};

export default FastTrackCellModal;
