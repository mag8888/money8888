import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Work as WorkIcon, AttachMoney as MoneyIcon, TrendingDown as ExpensesIcon } from '@mui/icons-material';
import { getRandomProfession, PROFESSIONS } from '../data/professions';

const ProfessionSelector = ({ onProfessionSelect, isOpen, onClose }) => {
  const [selectedProfession, setSelectedProfession] = useState(null);
  const [showProfession, setShowProfession] = useState(false);

  // Автоматически выбираем случайную профессию при открытии
  useEffect(() => {
    if (isOpen && !selectedProfession) {
      const randomProfession = getRandomProfession();
      setSelectedProfession(randomProfession);
    }
  }, [isOpen, selectedProfession]);

  const handleConfirmProfession = () => {
    if (selectedProfession) {
      onProfessionSelect(selectedProfession);
      setShowProfession(false);
      onClose();
    }
  };

  const handleNewProfession = () => {
    const newProfession = getRandomProfession();
    setSelectedProfession(newProfession);
  };

  if (!isOpen) return null;

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#2F1B40',
          borderRadius: 3,
          border: '3px solid #6E4D92'
        }
      }}
    >
      <DialogTitle sx={{ 
        backgroundColor: '#6E4D92', 
        color: 'white', 
        textAlign: 'center',
        fontSize: '1.5rem',
        fontWeight: 'bold'
      }}>
        🎯 ВЫБОР ПРОФЕССИИ
      </DialogTitle>
      
      <DialogContent sx={{ backgroundColor: '#2F1B40', color: 'white', py: 3 }}>
        {selectedProfession && (
          <Box sx={{ textAlign: 'center' }}>
            {/* Название профессии */}
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#FFD700' }}>
              {selectedProfession.name}
            </Typography>
            
            {/* Описание */}
            <Typography variant="body1" sx={{ mb: 4, color: '#E0E0E0', fontSize: '1.1rem' }}>
              {selectedProfession.description}
            </Typography>
            
            {/* Финансовая информация */}
            <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 4 }}>
              <Card sx={{ backgroundColor: '#4CAF50', color: 'white', minWidth: 120 }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <MoneyIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    ${selectedProfession.salary.toLocaleString()}
                  </Typography>
                  <Typography variant="body2">Зарплата</Typography>
                </CardContent>
              </Card>
              
              <Card sx={{ backgroundColor: '#FF9800', color: 'white', minWidth: 120 }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <ExpensesIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    ${selectedProfession.expenses.toLocaleString()}
                  </Typography>
                  <Typography variant="body2">Расходы</Typography>
                </CardContent>
              </Card>
              
              <Card sx={{ backgroundColor: '#2196F3', color: 'white', minWidth: 120 }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <WorkIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    ${selectedProfession.balance.toLocaleString()}
                  </Typography>
                  <Typography variant="body2">Баланс</Typography>
                </CardContent>
              </Card>
            </Box>
            
            {/* Кнопки действий */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleNewProfession}
                sx={{
                  backgroundColor: '#FF9800',
                  color: 'white',
                  fontWeight: 'bold',
                  px: 4,
                  py: 1.5,
                  '&:hover': { backgroundColor: '#F57C00' }
                }}
              >
                🔄 НОВАЯ ПРОФЕССИЯ
              </Button>
              
              <Button
                variant="contained"
                size="large"
                onClick={handleConfirmProfession}
                sx={{
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  fontWeight: 'bold',
                  px: 4,
                  py: 1.5,
                  '&:hover': { backgroundColor: '#388E3C' }
                }}
              >
                ✅ ПОДТВЕРДИТЬ
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ backgroundColor: '#2F1B40', justifyContent: 'center', pb: 3 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{ 
            color: '#6E4D92',
            borderColor: '#6E4D92',
            '&:hover': { 
              borderColor: '#8E6DB2',
              backgroundColor: 'rgba(110,77,146,0.1)'
            }
          }}
        >
          ЗАКРЫТЬ
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfessionSelector;
