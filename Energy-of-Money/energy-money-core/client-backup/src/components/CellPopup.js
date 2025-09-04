import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { motion } from 'framer-motion';

const CellPopup = ({ 
  open, 
  onClose, 
  cell, 
  isPlayerHere = false,
  playerName = null 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (!cell) return null;

  const getCellIcon = (type) => {
    const icons = {
      'opportunity': '🎯',
      'expenses': '🛍️',
      'charity': '❤️',
      'payday': '💰',
      'market': '🏪',
      'child': '👶',
      'dream': '🌟',
      'business': '🏢',
      'money': '💵',
      'loss': '⚠️'
    };
    return icons[type] || '📋';
  };

  const getCellColor = (type) => {
    const colors = {
      'opportunity': '#10B981',
      'expenses': '#EC4899',
      'charity': '#F97316',
      'payday': '#EAB308',
      'market': '#06B6D4',
      'child': '#A855F7',
      'dream': '#EC4899',
      'business': '#10B981',
      'money': '#EAB308',
      'loss': '#EF4444'
    };
    return colors[type] || '#3B82F6';
  };

  const cellColor = getCellColor(cell.type);
  const cellIcon = getCellIcon(cell.type);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(20px)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: `linear-gradient(90deg, ${cellColor}, ${cellColor}CC, ${cellColor})`,
            animation: 'shimmer 2s infinite'
          }
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center', 
          pb: 1,
          background: `linear-gradient(135deg, ${cellColor}20, ${cellColor}10)`,
          borderBottom: `1px solid ${cellColor}40`
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <Box sx={{ 
              fontSize: isMobile ? '2rem' : '3rem',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
            }}>
              {cellIcon}
            </Box>
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              sx={{ 
                color: '#FFFFFF',
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)'
              }}
            >
              {cell.name}
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#E2E8F0',
                lineHeight: 1.6,
                fontSize: isMobile ? '0.9rem' : '1rem'
              }}
            >
              {cell.description}
            </Typography>
          </Box>

          {/* Информация о стоимости и доходе */}
          {(cell.cost > 0 || cell.income > 0) && (
            <Box sx={{ 
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05))',
              borderRadius: '12px',
              p: 2,
              mb: 2,
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                {cell.cost > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#3B82F6',
                        fontWeight: 'bold',
                        fontSize: isMobile ? '0.8rem' : '0.9rem'
                      }}
                    >
                      💰 Стоимость:
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#FFFFFF',
                        fontWeight: 'bold',
                        fontSize: isMobile ? '0.9rem' : '1rem'
                      }}
                    >
                      ${cell.cost.toLocaleString()}
                    </Typography>
                  </Box>
                )}
                
                {cell.income > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#10B981',
                        fontWeight: 'bold',
                        fontSize: isMobile ? '0.8rem' : '0.9rem'
                      }}
                    >
                      📈 Доход:
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#FFFFFF',
                        fontWeight: 'bold',
                        fontSize: isMobile ? '0.9rem' : '1rem'
                      }}
                    >
                      ${cell.income.toLocaleString()}/мес
                    </Typography>
                  </Box>
                )}
              </Box>
              
              {cell.cost > 0 && cell.income > 0 && (
                <Box sx={{ 
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '8px',
                  p: 1.5,
                  mt: 1
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#10B981',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      fontSize: isMobile ? '0.8rem' : '0.9rem'
                    }}
                  >
                    💡 Окупаемость: {Math.ceil(cell.cost / cell.income)} месяцев
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {isPlayerHere && playerName && (
            <Box sx={{ 
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1))',
              borderRadius: '12px',
              p: 2,
              border: '1px solid rgba(16, 185, 129, 0.3)',
              textAlign: 'center'
            }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#10B981',
                  fontWeight: 'bold',
                  fontSize: isMobile ? '0.8rem' : '0.9rem'
                }}
              >
                👤 {playerName} находится на этой клетке
              </Typography>
            </Box>
          )}

          {cell.type === 'opportunity' && (
            <Box sx={{ 
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))',
              borderRadius: '12px',
              p: 2,
              mt: 2,
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#10B981',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  fontSize: isMobile ? '0.8rem' : '0.9rem'
                }}
              >
                💡 Выберите: Малая сделка или Большая сделка
              </Typography>
            </Box>
          )}

          {cell.type === 'charity' && (
            <Box sx={{ 
              background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(249, 115, 22, 0.05))',
              borderRadius: '12px',
              p: 2,
              mt: 2,
              border: '1px solid rgba(249, 115, 22, 0.2)'
            }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#F97316',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  fontSize: isMobile ? '0.8rem' : '0.9rem'
                }}
              >
                ❤️ Пожертвуйте 50% от дохода для получения бонуса на 3 хода
              </Typography>
            </Box>
          )}

          {cell.type === 'payday' && (
            <Box sx={{ 
              background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.1), rgba(234, 179, 8, 0.05))',
              borderRadius: '12px',
              p: 2,
              mt: 2,
              border: '1px solid rgba(234, 179, 8, 0.2)'
            }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#EAB308',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  fontSize: isMobile ? '0.8rem' : '0.9rem'
                }}
              >
                💰 Получите свою зарплату!
              </Typography>
            </Box>
          )}

          {cell.type === 'market' && (
            <Box sx={{ 
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(6, 182, 212, 0.05))',
              borderRadius: '12px',
              p: 2,
              mt: 2,
              border: '1px solid rgba(6, 182, 212, 0.2)'
            }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#06B6D4',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  fontSize: isMobile ? '0.8rem' : '0.9rem'
                }}
              >
                🏪 Появляются покупатели на ваши активы
              </Typography>
            </Box>
          )}

          {cell.type === 'loss' && (
            <Box sx={{ 
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))',
              borderRadius: '12px',
              p: 2,
              mt: 2,
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#EF4444',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  fontSize: isMobile ? '0.8rem' : '0.9rem'
                }}
              >
                ⚠️ Эта клетка может привести к потерям
              </Typography>
            </Box>
          )}

          {cell.type === 'money' && (
            <Box sx={{ 
              background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.1), rgba(234, 179, 8, 0.05))',
              borderRadius: '12px',
              p: 2,
              mt: 2,
              border: '1px solid rgba(234, 179, 8, 0.2)'
            }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#EAB308',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  fontSize: isMobile ? '0.8rem' : '0.9rem'
                }}
              >
                💵 Получите доход от ваших инвестиций
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={onClose}
            variant="contained"
            sx={{
              background: `linear-gradient(135deg, ${cellColor}, ${cellColor}CC)`,
              color: '#FFFFFF',
              borderRadius: '12px',
              px: 4,
              py: 1.5,
              fontWeight: 'bold',
              textTransform: 'none',
              fontSize: isMobile ? '0.9rem' : '1rem',
              boxShadow: `0 8px 25px ${cellColor}40`,
              '&:hover': {
                background: `linear-gradient(135deg, ${cellColor}CC, ${cellColor}99)`,
                boxShadow: `0 12px 35px ${cellColor}60`,
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Понятно
          </Button>
        </DialogActions>
      </motion.div>
    </Dialog>
  );
};

export default CellPopup;
