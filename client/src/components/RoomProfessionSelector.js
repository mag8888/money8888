import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Card, CardContent, CardActions, Chip } from '@mui/material';
import { professions } from '../data/professions';

const RoomProfessionSelector = ({ 
  open, 
  onClose, 
  onConfirm, 
  existingProfessions = [] // Убираем пропс для назначенных профессий
}) => {
  const [selectedProfession, setSelectedProfession] = useState(null);
  const [availableProfessions, setAvailableProfessions] = useState([]);

  useEffect(() => {
    if (open) {
      // Фильтруем профессии, исключая уже выбранные другими игроками
      const usedProfessions = new Set(existingProfessions.map(p => p.name));
      const available = professions.filter(p => !usedProfessions.has(p.name));
      setAvailableProfessions(available);
      setSelectedProfession(null);
    }
  }, [open, existingProfessions]);

  const handleProfessionSelect = (profession) => {
    setSelectedProfession(profession);
  };

  const handleConfirm = () => {
    if (selectedProfession) {
      onConfirm(selectedProfession);
    }
  };

  const handleClose = () => {
    setSelectedProfession(null);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: {
          background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
          color: 'white',
          borderRadius: '16px'
        }
      }}
    >
      <DialogTitle style={{ textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
        <Typography variant="h4" style={{ color: '#FFD700', marginBottom: '8px' }}>
          🎯 Выбор профессии
        </Typography>
        <Typography variant="body1" style={{ opacity: 0.8 }}>
          Выберите профессию для начала игры
        </Typography>
      </DialogTitle>

      <DialogContent style={{ padding: '24px' }}>
        <Grid container spacing={3}>
          {availableProfessions.map((profession) => (
            <Grid item xs={12} sm={6} md={4} key={profession.name}>
              <Card 
                style={{ 
                  background: selectedProfession?.name === profession.name 
                    ? 'rgba(255, 215, 0, 0.2)' 
                    : 'rgba(255, 255, 255, 0.1)',
                  border: selectedProfession?.name === profession.name 
                    ? '2px solid #FFD700' 
                    : '1px solid rgba(255, 255, 255, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  transform: selectedProfession?.name === profession.name ? 'scale(1.02)' : 'scale(1)',
                  height: '100%'
                }}
                onClick={() => handleProfessionSelect(profession)}
                onMouseEnter={(e) => {
                  if (selectedProfession?.name !== profession.name) {
                    e.target.style.transform = 'scale(1.02)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedProfession?.name !== profession.name) {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
              >
                <CardContent style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" style={{ color: '#FFD700', marginBottom: '16px', textAlign: 'center' }}>
                    {profession.name}
                  </Typography>
                  
                  <Box style={{ flex: 1 }}>
                    <Box style={{ marginBottom: '12px' }}>
                      <Typography variant="body2" style={{ opacity: 0.8, marginBottom: '4px' }}>
                        💰 Зарплата
                      </Typography>
                      <Typography variant="h6" style={{ color: '#4CAF50' }}>
                        ${profession.salary?.toLocaleString() || 0}
                      </Typography>
                    </Box>
                    
                    <Box style={{ marginBottom: '12px' }}>
                      <Typography variant="body2" style={{ opacity: 0.8, marginBottom: '4px' }}>
                        💸 Расходы
                      </Typography>
                      <Typography variant="h6" style={{ color: '#FF9800' }}>
                        ${profession.expenses?.toLocaleString() || 0}
                      </Typography>
                    </Box>
                    
                    <Box style={{ marginBottom: '12px' }}>
                      <Typography variant="body2" style={{ opacity: 0.8, marginBottom: '4px' }}>
                        💳 Баланс
                      </Typography>
                      <Typography variant="h6" style={{ color: '#2196F3' }}>
                        ${profession.balance?.toLocaleString() || 0}
                      </Typography>
                    </Box>
                    
                    <Box style={{ marginBottom: '12px' }}>
                      <Typography variant="body2" style={{ opacity: 0.8, marginBottom: '4px' }}>
                        📈 Пассивный доход
                      </Typography>
                      <Typography variant="h6" style={{ color: '#9C27B0' }}>
                        ${profession.passiveIncome?.toLocaleString() || 0}
                      </Typography>
                    </Box>
                    
                    <Box style={{ marginBottom: '12px' }}>
                      <Typography variant="body2" style={{ opacity: 0.8, marginBottom: '4px' }}>
                        📝 Описание
                      </Typography>
                      <Typography variant="body2" style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
                        {profession.description || 'Описание отсутствует'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {selectedProfession?.name === profession.name && (
                    <Chip 
                      label="✅ Выбрано" 
                      style={{ 
                        backgroundColor: '#4CAF50', 
                        color: 'white',
                        marginTop: '12px',
                        alignSelf: 'center'
                      }} 
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        {availableProfessions.length === 0 && (
          <Box style={{ textAlign: 'center', padding: '40px 20px' }}>
            <Typography variant="h6" style={{ color: '#FF9800', marginBottom: '16px' }}>
              ⚠️ Нет доступных профессий
            </Typography>
            <Typography variant="body1" style={{ opacity: 0.8 }}>
              Все профессии уже выбраны другими игроками
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions style={{ padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
        <Button 
          onClick={handleClose}
          style={{
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
            padding: '10px 24px'
          }}
        >
          Отмена
        </Button>
        <Button 
          onClick={handleConfirm}
          disabled={!selectedProfession}
          style={{
            backgroundColor: selectedProfession ? '#4CAF50' : '#666',
            color: 'white',
            padding: '10px 24px',
            opacity: selectedProfession ? 1 : 0.6
          }}
        >
          Подтвердить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoomProfessionSelector;
