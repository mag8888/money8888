import React from 'react';
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
  Chip
} from '@mui/material';
import { motion } from 'framer-motion';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const FreedomModal = ({ open, onClose, currentPlayer, onAchieveFreedom }) => {
  const passiveIncome = currentPlayer?.passiveIncome || 0;
  const expenses = currentPlayer?.expenses || 0;
  const isFreedomAchieved = passiveIncome >= expenses;

  const handleAchieveFreedom = () => {
    onAchieveFreedom();
    onClose();
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
        🎯 Финансовая свобода
        {isFreedomAchieved && (
          <Chip
            icon={<EmojiEventsIcon />}
            label="ДОСТИГНУТА!"
            color="success"
            sx={{ ml: 2 }}
          />
        )}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" gutterBottom>
            Финансовая свобода достигается, когда ваш пассивный доход превышает ежемесячные расходы.
          </Typography>
        </Box>

        <Card sx={{ mb: 3, bgcolor: 'background.paper' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📊 Ваши показатели
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body1">Пассивный доход:</Typography>
              <Typography 
                variant="body1" 
                color={passiveIncome >= expenses ? "success.main" : "text.primary"}
                sx={{ fontWeight: 'bold' }}
              >
                ${passiveIncome}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body1">Ежемесячные расходы:</Typography>
              <Typography variant="body1" color="error.main" sx={{ fontWeight: 'bold' }}>
                ${expenses}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body1">Разница:</Typography>
              <Typography 
                variant="body1" 
                color={passiveIncome >= expenses ? "success.main" : "error.main"}
                sx={{ fontWeight: 'bold' }}
              >
                ${passiveIncome - expenses}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {isFreedomAchieved ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            🎉 Поздравляем! Вы достигли финансовой свободы! 
            Ваш пассивный доход покрывает все расходы.
          </Alert>
        ) : (
          <Alert severity="info" sx={{ mb: 2 }}>
            💡 Для достижения финансовой свободы вам нужно увеличить пассивный доход 
            до ${expenses} или больше.
          </Alert>
        )}

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Советы для достижения финансовой свободы:</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            • Инвестируйте в недвижимость и бизнес
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Покупайте акции и облигации
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Создавайте источники пассивного дохода
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Уменьшайте ежемесячные расходы
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Закрыть</Button>
        {isFreedomAchieved && (
          <Button 
            onClick={handleAchieveFreedom} 
            variant="contained" 
            color="success"
            startIcon={<EmojiEventsIcon />}
          >
            Отпраздновать победу!
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default FreedomModal;
