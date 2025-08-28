import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const ProfessionCard = ({ profession, isSelected, onClick }) => {
  return (
    <Card 
      onClick={() => onClick(profession)}
      sx={{
        cursor: 'pointer',
        border: isSelected ? '2px solid #1976d2' : '1px solid #e0e0e0',
        backgroundColor: isSelected ? '#e3f2fd' : '#ffffff',
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-2px)',
          transition: 'all 0.2s ease-in-out'
        }
      }}
    >
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          {profession.name}
        </Typography>
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Зарплата: ${profession.salary}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Расходы: ${profession.expenses}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Баланс: ${profession.balance}
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
          {profession.description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ProfessionCard;
