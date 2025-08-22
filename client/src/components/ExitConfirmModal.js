import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';

const ExitConfirmModal = ({ open, onClose, onConfirm, title = 'Выйти из игры?', message = 'Вы уверены, что хотите покинуть текущую игру?' }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, #2c3e50, #34495e)',
          borderRadius: 3,
          minWidth: 400,
          border: '2px solid rgba(255, 255, 255, 0.1)'
        }
      }}
    >
      <DialogTitle sx={{ 
        textAlign: 'center', 
        color: 'white', 
        fontSize: '1.5rem', 
        fontWeight: 'bold', 
        pb: 1,
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        🚪 {title}
      </DialogTitle>
      
      <DialogContent sx={{ textAlign: 'center', pb: 3, pt: 2 }}>
        <Typography sx={{ 
          color: 'white', 
          fontSize: '1.1rem', 
          mb: 3,
          lineHeight: 1.5
        }}>
          {message}
        </Typography>
        
        <Box sx={{ 
          bgcolor: 'rgba(255, 183, 77, 0.1)', 
          border: '1px solid #FFB74D', 
          borderRadius: 2, 
          p: 2, 
          mb: 2 
        }}>
          <Typography sx={{ 
            color: '#FFB74D', 
            fontSize: '0.9rem',
            fontWeight: 'bold'
          }}>
            ⚠️ Внимание
          </Typography>
          <Typography sx={{ 
            color: 'rgba(255, 255, 255, 0.8)', 
            fontSize: '0.85rem',
            mt: 1
          }}>
            Все ваши действия в этой игре будут потеряны
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ 
        justifyContent: 'center', 
        gap: 2, 
        pb: 3, 
        px: 3 
      }}>
        <Button 
          variant="outlined" 
          onClick={onClose}
          sx={{ 
            color: 'white', 
            borderColor: 'white',
            '&:hover': { 
              borderColor: '#FFB74D', 
              bgcolor: 'rgba(255, 183, 77, 0.1)' 
            },
            px: 3, 
            py: 1.5, 
            fontSize: '1rem',
            minWidth: 120
          }}
        >
          Отмена
        </Button>
        
        <Button 
          variant="contained" 
          onClick={onConfirm}
          sx={{ 
            bgcolor: '#f44336', 
            color: 'white',
            '&:hover': { bgcolor: '#d32f2f' },
            px: 3, 
            py: 1.5, 
            fontSize: '1rem',
            minWidth: 120
          }}
        >
          🚪 Выйти
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExitConfirmModal;
