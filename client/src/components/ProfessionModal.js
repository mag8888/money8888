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

const ProfessionModal = ({ open, onClose, onSelectProfession }) => {
  const handleSelect = (profession) => {
    onSelectProfession(profession);
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
      <DialogTitle>💼 Выберите профессию</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Выберите профессию для начала игры. Каждая профессия имеет свои особенности.
        </Typography>
        
        <Grid container spacing={2}>
          {PROFESSIONS.map((profession) => (
            <Grid item xs={12} sm={6} key={profession.id}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 3 }
                  }}
                  onClick={() => handleSelect(profession)}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {profession.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {profession.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Зарплата:</Typography>
                      <Typography variant="body2" color="success.main">
                        ${profession.salary}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Расходы:</Typography>
                      <Typography variant="body2" color="error.main">
                        ${profession.expenses}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Пассивный доход:</Typography>
                      <Typography variant="body2" color="info.main">
                        ${profession.passiveIncome}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfessionModal;
