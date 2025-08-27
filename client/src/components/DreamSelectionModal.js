import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip
} from '@mui/material';
import { Star as StarIcon, Favorite as FavoriteIcon } from '@mui/icons-material';

const DreamSelectionModal = ({ open, onClose, onDreamSelected, dreams, currentPlayer }) => {
  const [selectedDream, setSelectedDream] = useState(null);

  const handleDreamSelect = (dream) => {
    setSelectedDream(dream);
  };

  const handleConfirm = () => {
    if (selectedDream) {
      onDreamSelected(selectedDream);
      onClose();
    }
  };

  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `$${(price / 1000).toFixed(0)}K`;
    }
    return `$${price}`;
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <StarIcon color="primary" />
          <Typography variant="h6">
            Выберите свою мечту, {currentPlayer?.username || 'Игрок'}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Выберите мечту, к которой будете стремиться в игре. Эта мечта станет вашей целью!
        </Typography>
        
        <Grid container spacing={2}>
          {dreams.map((dream) => (
            <Grid item xs={12} sm={6} md={4} key={dream.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  border: selectedDream?.id === dream.id ? '2px solid #1976d2' : '1px solid #e0e0e0',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3
                  }
                }}
                onClick={() => handleDreamSelect(dream)}
              >
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <Box sx={{ mb: 1, fontSize: '2rem' }}>
                    {dream.icon}
                  </Box>
                  
                  <Typography variant="h6" component="div" sx={{ mb: 1, fontSize: '0.9rem' }}>
                    {dream.name}
                  </Typography>
                  
                  <Chip 
                    label={formatPrice(dream.cost)}
                    color="primary"
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    {dream.description}
                  </Typography>
                  
                  {selectedDream?.id === dream.id && (
                    <Box sx={{ mt: 1 }}>
                      <FavoriteIcon color="primary" />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleConfirm}
            disabled={!selectedDream}
            startIcon={<StarIcon />}
          >
            Выбрать мечту
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default DreamSelectionModal;
