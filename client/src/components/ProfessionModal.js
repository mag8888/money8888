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
  Grid
} from '@mui/material';
import { motion } from 'framer-motion';

const PROFESSIONS = [
  {
    id: 'engineer',
    name: 'Инженер',
    salary: 5000,
    expenses: 2000,
    passiveIncome: 0,
    description: 'Стабильная работа с хорошей зарплатой'
  },
  {
    id: 'doctor',
    name: 'Врач',
    salary: 8000,
    expenses: 3000,
    passiveIncome: 0,
    description: 'Высокооплачиваемая профессия с большими расходами'
  },
  {
    id: 'teacher',
    name: 'Учитель',
    salary: 3000,
    expenses: 1500,
    passiveIncome: 0,
    description: 'Скромная зарплата, но стабильный доход'
  },
  {
    id: 'businessman',
    name: 'Бизнесмен',
    salary: 12000,
    expenses: 5000,
    passiveIncome: 1000,
    description: 'Высокий риск, но большой потенциал'
  }
];

const ProfessionModal = ({ open, onClose, onSelectProfession, profession, playerBalance }) => {
  const handleSelect = (profession) => {
    if (onSelectProfession) {
      onSelectProfession(profession);
      onClose();
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
        {profession && profession.name ? `💼 ${profession.name}` : '💼 Выберите профессию'}
      </DialogTitle>
      <DialogContent>
        {profession ? (
          // Отображение деталей выбранной профессии
          <Box>
            <Typography variant="h6" gutterBottom color="primary">
              Детали профессии
            </Typography>
            
            <Box sx={{ 
              background: '#f5f5f5', 
              p: 3, 
              borderRadius: 2, 
              mb: 3 
            }}>
              <Typography variant="body1" sx={{ mb: 2, fontWeight: 'bold' }}>
                {profession.description}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Зарплата:</Typography>
                    <Typography variant="body2" color="success.main" fontWeight="bold">
                      ${profession.salary?.toLocaleString() || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Расходы:</Typography>
                    <Typography variant="body2" color="error.main" fontWeight="bold">
                      ${profession.expenses?.toLocaleString() || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Баланс:</Typography>
                    <Typography variant="body2" color="info.main" fontWeight="bold">
                      ${profession.balance?.toLocaleString() || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Пассивный доход:</Typography>
                    <Typography variant="body2" color="warning.main" fontWeight="bold">
                      ${profession.passiveIncome?.toLocaleString() || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              {playerBalance !== undefined && (
                <Box sx={{ 
                  mt: 3, 
                  p: 2, 
                  background: '#e8f5e8', 
                  borderRadius: 2,
                  border: '1px solid #4caf50'
                }}>
                  <Typography variant="h6" color="success.main" gutterBottom>
                    💰 Текущий баланс игрока
                  </Typography>
                  <Typography variant="h4" color="success.main" fontWeight="bold">
                    ${(playerBalance || 0).toLocaleString()}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        ) : (
          // Выбор профессии
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Выберите профессию для начала игры. Каждая профессия имеет свои особенности.
            </Typography>
            
            <Grid container spacing={2}>
              {PROFESSIONS.map((prof) => (
                <Grid item xs={12} sm={6} key={prof.id}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { boxShadow: 3 }
                      }}
                      onClick={() => handleSelect(prof)}
                    >
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {prof.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {prof.description}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Зарплата:</Typography>
                          <Typography variant="body2" color="success.main">
                            ${prof.salary}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Расходы:</Typography>
                          <Typography variant="body2" color="error.main">
                            ${prof.expenses}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Пассивный доход:</Typography>
                          <Typography variant="body2" color="info.main">
                            ${prof.passiveIncome}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfessionModal;
