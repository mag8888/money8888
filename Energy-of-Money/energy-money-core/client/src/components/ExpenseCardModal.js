import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Chip, Alert, Divider
} from '@mui/material';
import {
  Warning as WarningIcon, CreditCard as CreditIcon, Payment as PaymentIcon
} from '@mui/icons-material';

const ExpenseCardModal = ({ open, onClose, expenseCard, currentPlayer, onPay, onTakeCredit }) => {
  if (!expenseCard) return null;

  const canAfford = currentPlayer?.balance >= expenseCard.cost;
  const shortfall = canAfford ? 0 : expenseCard.cost - currentPlayer?.balance;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
          color: 'white'
        }
      }}
    >
      <DialogTitle sx={{ 
        textAlign: 'center', 
        color: 'white',
        borderBottom: '1px solid rgba(255,255,255,0.2)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <WarningIcon sx={{ fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Обязательный расход
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {/* Карточка расхода */}
        <Box sx={{ 
          background: 'rgba(255,255,255,0.1)', 
          borderRadius: '12px', 
          p: 3, 
          mb: 3,
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{ 
              background: 'rgba(255,255,255,0.2)', 
              borderRadius: '50%', 
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {expenseCard.icon}
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
                {expenseCard.name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                {expenseCard.description}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.2)' }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body1" sx={{ color: 'white' }}>
              Стоимость:
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white' }}>
              ${expenseCard.cost.toLocaleString()}
            </Typography>
          </Box>

          <Chip 
            label={expenseCard.category} 
            size="small" 
            sx={{ 
              mt: 1,
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)'
            }} 
          />
        </Box>

        {/* Информация о балансе */}
        <Box sx={{ 
          background: 'rgba(255,255,255,0.1)', 
          borderRadius: '8px', 
          p: 2, 
          mb: 3 
        }}>
          <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
            Баланс игрока <strong>{currentPlayer?.name}</strong>:
          </Typography>
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
            ${currentPlayer?.balance?.toLocaleString() || 0}
          </Typography>
        </Box>

        {/* Предупреждение о недостатке средств */}
        {!canAfford && (
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 3,
              background: 'rgba(255, 152, 0, 0.2)',
              border: '1px solid rgba(255, 152, 0, 0.3)',
              '& .MuiAlert-icon': { color: '#FF9800' }
            }}
          >
            <Typography variant="body2" sx={{ color: 'white' }}>
              Недостаточно средств! Не хватает: <strong>${shortfall.toLocaleString()}</strong>
            </Typography>
          </Alert>
        )}

        {/* Информация о том, что это обязательный расход */}
        <Alert 
          severity="info" 
          sx={{ 
            background: 'rgba(0, 188, 212, 0.2)',
            border: '1px solid rgba(0, 188, 212, 0.3)',
            '& .MuiAlert-icon': { color: '#00BCD4' }
          }}
        >
          <Typography variant="body2" sx={{ color: 'white' }}>
            Это обязательный расход! Вы должны заплатить эту сумму.
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        {canAfford ? (
          <Button
            onClick={onPay}
            variant="contained"
            startIcon={<PaymentIcon />}
            sx={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              '&:hover': {
                background: 'rgba(255,255,255,0.3)'
              }
            }}
          >
            Заплатить ${expenseCard.cost.toLocaleString()}
          </Button>
        ) : (
          <Button
            onClick={onTakeCredit}
            variant="contained"
            startIcon={<CreditIcon />}
            sx={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              '&:hover': {
                background: 'rgba(255,255,255,0.3)'
              }
            }}
          >
            Взять кредит ${shortfall.toLocaleString()}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ExpenseCardModal;

