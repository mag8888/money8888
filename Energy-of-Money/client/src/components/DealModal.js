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
  Alert,
  Chip,
  Grid,
  Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CreditCardIcon from '@mui/icons-material/CreditCard';

const DealModal = ({ 
  open, 
  onClose, 
  deal, 
  currentPlayer, 
  onBuyDeal, 
  onSkipDeal 
}) => {
  const [useCredit, setUseCredit] = useState(false);
  
  if (!deal) return null;

  const canAfford = currentPlayer?.balance >= deal.cost;
  const needsLoan = deal.cost > (currentPlayer?.balance || 0);
  const maxFromBalance = Math.floor((currentPlayer?.balance || 0) / 1000) * 1000;
  const creditNeeded = deal.cost - maxFromBalance;

  const handleBuy = () => {
    onBuyDeal(deal, useCredit);
    onClose();
  };

  const handleSkip = () => {
    onSkipDeal(deal);
    onClose();
  };

  const getDealTypeColor = (type) => {
    switch (type) {
      case 'deal': return 'primary';
      case 'market': return 'secondary';
      case 'charity': return 'warning';
      case 'doodad': return 'error';
      default: return 'default';
    }
  };

  const getDealTypeLabel = (type) => {
    switch (type) {
      case 'deal': return 'Сделка';
      case 'market': return 'Рынок';
      case 'charity': return 'Благотворительность';
      case 'doodad': return 'Расходы';
      default: return type;
    }
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          💼 {deal.title}
          <Chip 
            label={getDealTypeLabel(deal.type)} 
            color={getDealTypeColor(deal.type)}
            size="small"
          />
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Card sx={{ mb: 3, bgcolor: 'background.paper' }}>
          <CardContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {deal.description}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="error.main" gutterBottom>
                    💰 Стоимость
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    ${deal.cost}
                  </Typography>
                </Box>
              </Grid>
              
              {deal.downPayment && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="warning.main" gutterBottom>
                      💳 Первоначальный взнос
                    </Typography>
                    <Typography variant="h4" color="warning.main">
                      ${deal.downPayment}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>

            {deal.cashflow && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="h6" color="success.main" gutterBottom>
                  📈 Ежемесячный доход
                </Typography>
                <Typography variant="h4" color="success.main">
                  ${deal.cashflow}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        <Card sx={{ mb: 3, bgcolor: 'background.paper' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              💳 Ваши финансы
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1">Баланс:</Typography>
              <Typography variant="body1" color="success.main">
                ${currentPlayer?.balance || 0}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1">Пассивный доход:</Typography>
              <Typography variant="body1" color="info.main">
                ${currentPlayer?.passiveIncome || 0}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body1">Максимум с баланса:</Typography>
              <Typography variant="body1" color="warning.main">
                ${maxFromBalance}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {needsLoan && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            ⚠️ У вас недостаточно средств для покупки. 
            Вы можете использовать кредит для покрытия разницы.
          </Alert>
        )}

        {needsLoan && (
          <Card sx={{ mb: 3, bgcolor: 'warning.light' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                💳 Кредитное предложение
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">С баланса:</Typography>
                <Typography variant="body1" color="success.main">
                  ${maxFromBalance}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1">В кредит:</Typography>
                <Typography variant="body1" color="error.main">
                  ${creditNeeded}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Отмена
        </Button>
        
        <Button 
          onClick={handleSkip} 
          variant="outlined" 
          color="secondary"
        >
          Пропустить
        </Button>
        
        {canAfford ? (
          <Button 
            onClick={handleBuy} 
            variant="contained" 
            color="primary"
            startIcon={<AttachMoneyIcon />}
          >
            Купить за ${deal.cost}
          </Button>
        ) : needsLoan ? (
          <Button 
            onClick={handleBuy} 
            variant="contained" 
            color="warning"
            startIcon={<CreditCardIcon />}
          >
            Купить в кредит
          </Button>
        ) : (
          <Button 
            disabled 
            variant="contained" 
            color="error"
          >
            Недостаточно средств
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DealModal;
