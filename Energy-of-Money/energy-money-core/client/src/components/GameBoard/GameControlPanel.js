import React from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  useMediaQuery, 
  useTheme,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Casino, 
  AccountBalance, 
  Inventory, 
  Group,
  Menu,
  Close
} from '@mui/icons-material';
import { motion } from 'framer-motion';

/**
 * Компонент панели управления игрой
 */
const GameControlPanel = ({
  canRollDice,
  onRollDice,
  onOpenBank,
  onOpenInventory,
  onOpenPlayers,
  isMobileMenuOpen,
  onToggleMobileMenu,
  isMobile
}) => {
  const theme = useTheme();

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  const mainButtonStyle = {
    minWidth: isMobile ? '120px' : '150px',
    height: isMobile ? '50px' : '60px',
    borderRadius: '15px',
    fontSize: isMobile ? '14px' : '16px',
    fontWeight: 'bold',
    textTransform: 'none',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
    '&:hover': {
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)'
    }
  };

  const secondaryButtonStyle = {
    minWidth: isMobile ? '100px' : '120px',
    height: isMobile ? '45px' : '50px',
    borderRadius: '12px',
    fontSize: isMobile ? '12px' : '14px',
    fontWeight: 'bold',
    textTransform: 'none',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)',
    '&:hover': {
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.25)'
    }
  };

  if (isMobile) {
    return (
      <Box sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.95) 0%, rgba(30, 64, 175, 0.95) 100%)',
        backdropFilter: 'blur(10px)',
        borderTop: '2px solid #fbbf24',
        padding: '10px',
        zIndex: 1000
      }}>
        {/* Мобильное меню */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              mb: 2
            }}>
              <Button
                variant="contained"
                startIcon={<AccountBalance />}
                onClick={onOpenBank}
                sx={{
                  ...secondaryButtonStyle,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                  }
                }}
              >
                Банк
              </Button>
              
              <Button
                variant="contained"
                startIcon={<Inventory />}
                onClick={onOpenInventory}
                sx={{
                  ...secondaryButtonStyle,
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)'
                  }
                }}
              >
                Инвентарь
              </Button>
              
              <Button
                variant="contained"
                startIcon={<Group />}
                onClick={onOpenPlayers}
                sx={{
                  ...secondaryButtonStyle,
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
                  }
                }}
              >
                Игроки
              </Button>
            </Box>
          </motion.div>
        )}

        {/* Основная кнопка и меню */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
            <Button
              variant="contained"
              startIcon={<Casino />}
              onClick={onRollDice}
              disabled={!canRollDice}
              sx={{
                ...mainButtonStyle,
                background: canRollDice 
                  ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                  : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                '&:hover': {
                  background: canRollDice 
                    ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                    : 'linear-gradient(135deg, #4b5563 0%, #374151 100%)'
                }
              }}
            >
              {canRollDice ? 'Бросить кубик' : 'Не ваш ход'}
            </Button>
          </motion.div>

          <IconButton
            onClick={onToggleMobileMenu}
            sx={{
              color: '#fbbf24',
              background: 'rgba(251, 191, 36, 0.1)',
              '&:hover': {
                background: 'rgba(251, 191, 36, 0.2)'
              }
            }}
          >
            {isMobileMenuOpen ? <Close /> : <Menu />}
          </IconButton>
        </Box>
      </Box>
    );
  }

  // Десктопная версия
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      p: 2,
      background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.9) 0%, rgba(30, 64, 175, 0.9) 100%)',
      borderRadius: '20px',
      border: '2px solid #fbbf24',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
    }}>
      <Typography variant="h6" sx={{
        color: '#ffffff',
        textAlign: 'center',
        mb: 2,
        fontWeight: 'bold',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)'
      }}>
        🎮 Управление
      </Typography>

      {/* Основная кнопка */}
      <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
        <Button
          variant="contained"
          startIcon={<Casino />}
          onClick={onRollDice}
          disabled={!canRollDice}
          fullWidth
          sx={{
            ...mainButtonStyle,
            background: canRollDice 
              ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
              : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
            '&:hover': {
              background: canRollDice 
                ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                : 'linear-gradient(135deg, #4b5563 0%, #374151 100%)'
            }
          }}
        >
          {canRollDice ? 'Бросить кубик' : 'Не ваш ход'}
        </Button>
      </motion.div>

      {/* Вторичные кнопки */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 1
      }}>
        <Tooltip title="Открыть банк">
          <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
            <Button
              variant="contained"
              startIcon={<AccountBalance />}
              onClick={onOpenBank}
              sx={{
                ...secondaryButtonStyle,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                }
              }}
            >
              Банк
            </Button>
          </motion.div>
        </Tooltip>

        <Tooltip title="Открыть инвентарь">
          <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
            <Button
              variant="contained"
              startIcon={<Inventory />}
              onClick={onOpenInventory}
              sx={{
                ...secondaryButtonStyle,
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)'
                }
              }}
            >
              Инвентарь
            </Button>
          </motion.div>
        </Tooltip>

        <Tooltip title="Список игроков">
          <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
            <Button
              variant="contained"
              startIcon={<Group />}
              onClick={onOpenPlayers}
              sx={{
                ...secondaryButtonStyle,
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
                }
              }}
            >
              Игроки
            </Button>
          </motion.div>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default GameControlPanel;
