import React, { useState } from 'react';
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
  Grid,
  Chip,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Divider,
  IconButton
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AttachMoney, 
  TrendingUp, 
  CreditCard, 
  CheckCircle, 
  Warning,
  Work as WorkIcon,
  Star as StarIcon,
  EmojiEvents as TrophyIcon,
  Close as CloseIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';

const PROFESSIONS = [
  {
    id: 'engineer',
    name: 'Инженер',
    salary: 5000,
    expenses: 2000,
    passiveIncome: 0,
    description: 'Стабильная работа с хорошей зарплатой',
    icon: '⚙️',
    color: '#2196f3',
    difficulty: 'Средняя',
    growth: 'Стабильный'
  },
  {
    id: 'doctor',
    name: 'Врач',
    salary: 8000,
    expenses: 3000,
    passiveIncome: 0,
    description: 'Высокооплачиваемая профессия с большими расходами',
    icon: '👨‍⚕️',
    color: '#f44336',
    difficulty: 'Высокая',
    growth: 'Быстрый'
  },
  {
    id: 'teacher',
    name: 'Учитель',
    salary: 3000,
    expenses: 1500,
    passiveIncome: 0,
    description: 'Скромная зарплата, но стабильный доход',
    icon: '👩‍🏫',
    color: '#4caf50',
    difficulty: 'Низкая',
    growth: 'Медленный'
  },
  {
    id: 'businessman',
    name: 'Бизнесмен',
    salary: 12000,
    expenses: 5000,
    passiveIncome: 1000,
    description: 'Высокий риск, но большой потенциал',
    icon: '💼',
    color: '#ff9800',
    difficulty: 'Очень высокая',
    growth: 'Экспоненциальный'
  },
  {
    id: 'programmer',
    name: 'Программист',
    salary: 7000,
    expenses: 2500,
    passiveIncome: 500,
    description: 'Современная профессия с высоким потенциалом',
    icon: '💻',
    color: '#9c27b0',
    difficulty: 'Высокая',
    growth: 'Быстрый'
  },
  {
    id: 'artist',
    name: 'Художник',
    salary: 4000,
    expenses: 1800,
    passiveIncome: 200,
    description: 'Творческая профессия с нестабильным доходом',
    icon: '🎨',
    color: '#e91e63',
    difficulty: 'Средняя',
    growth: 'Переменный'
  }
];

const DREAMS = [
  {
    id: 'house',
    name: 'Дом мечты',
    cost: 500000,
    description: 'Собственный дом с садом и бассейном',
    icon: '🏠',
    color: '#4caf50',
    category: 'Недвижимость'
  },
  {
    id: 'business',
    name: 'Собственный бизнес',
    cost: 1000000,
    description: 'Крупная компания с множеством сотрудников',
    icon: '🏢',
    color: '#2196f3',
    category: 'Бизнес'
  },
  {
    id: 'travel',
    name: 'Путешествия по миру',
    cost: 200000,
    description: 'Посетить все континенты и страны',
    icon: '✈️',
    color: '#ff9800',
    category: 'Путешествия'
  },
  {
    id: 'charity',
    name: 'Благотворительность',
    cost: 300000,
    description: 'Помогать людям и делать мир лучше',
    icon: '❤️',
    color: '#f44336',
    category: 'Социальная ответственность'
  },
  {
    id: 'education',
    name: 'Образование',
    cost: 150000,
    description: 'Получить образование в лучших университетах',
    icon: '🎓',
    color: '#9c27b0',
    category: 'Саморазвитие'
  }
];

const ProfessionModal = ({ open, onClose, onSelectProfession, profession, playerBalance, onPayOffCredit }) => {
  const [showPayOffAlert, setShowPayOffAlert] = useState(false);
  const [creditToPayOff, setCreditToPayOff] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedProfession, setSelectedProfession] = useState(null);
  const [selectedDream, setSelectedDream] = useState(null);

  const handleSelectProfession = (prof) => {
    setSelectedProfession(prof);
    setActiveStep(1);
  };

  const handleSelectDream = (dream) => {
    setSelectedDream(dream);
    setActiveStep(2);
  };

  const handleConfirm = () => {
    if (onSelectProfession && selectedProfession && selectedDream) {
      onSelectProfession({
        ...selectedProfession,
        dream: selectedDream
      });
      onClose();
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setSelectedProfession(null);
    setSelectedDream(null);
    onClose();
  };

  const handlePayOffCredit = (creditType, amount) => {
    setCreditToPayOff({ type: creditType, amount });
    setShowPayOffAlert(true);
  };

  const confirmPayOffCredit = () => {
    if (onPayOffCredit && creditToPayOff) {
      onPayOffCredit(creditToPayOff.type, creditToPayOff.amount);
      setShowPayOffAlert(false);
      setCreditToPayOff(null);
    }
  };

  const canExitToBigCircle = (profession) => {
    return profession && profession.passiveIncome > profession.totalExpenses;
  };

  const formatCurrency = (amount) => {
    return `$${amount?.toLocaleString() || '0'}`;
  };

  const steps = [
    {
      label: 'Выбор профессии',
      description: 'Выберите свою профессию для начала игры'
    },
    {
      label: 'Выбор мечты',
      description: 'Определите свою финансовую цель'
    },
    {
      label: 'Подтверждение',
      description: 'Проверьте выбранные настройки'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ 
        background: 'rgba(255,255,255,0.95)', 
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.2)',
        position: 'relative'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🎯 Настройка персонажа
          </Typography>
          <IconButton onClick={handleClose} sx={{ color: '#667eea' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        {/* Stepper */}
        <Box sx={{ mt: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel 
                  sx={{ 
                    '& .MuiStepLabel-label': { 
                      color: index <= activeStep ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)',
                      fontWeight: index <= activeStep ? 600 : 400
                    }
                  }}
                >
                  {step.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)' }}>
        <Box sx={{ p: 4 }}>
          {/* Шаг 1: Выбор профессии */}
          {activeStep === 0 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <Typography variant="h5" sx={{ mb: 4, textAlign: 'center', color: '#667eea', fontWeight: 600 }}>
                💼 Выберите свою профессию
              </Typography>
              
              <Grid container spacing={3}>
                {PROFESSIONS.map((prof) => (
                  <Grid item xs={12} sm={6} md={4} key={prof.id}>
                    <motion.div variants={itemVariants}>
                      <Card 
                        elevation={8}
                        sx={{
                          borderRadius: 3,
                          cursor: 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          border: `2px solid ${prof.color}`,
                          '&:hover': {
                            transform: 'translateY(-8px) scale(1.02)',
                            boxShadow: `0 20px 40px ${prof.color}40`
                          }
                        }}
                        onClick={() => handleSelectProfession(prof)}
                      >
                        <CardContent sx={{ p: 3, textAlign: 'center' }}>
                          <Typography variant="h1" sx={{ mb: 2 }}>
                            {prof.icon}
                          </Typography>
                          
                          <Typography variant="h6" sx={{ 
                            fontWeight: 700, 
                            color: prof.color,
                            mb: 2
                          }}>
                            {prof.name}
                          </Typography>
                          
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            {prof.description}
                          </Typography>
                          
                          <Box sx={{ mb: 2 }}>
                            <Chip 
                              label={`Зарплата: ${formatCurrency(prof.salary)}`}
                              size="small"
                              sx={{ 
                                bgcolor: '#4caf50', 
                                color: 'white',
                                fontWeight: 600,
                                mb: 1
                              }}
                            />
                            <Chip 
                              label={`Расходы: ${formatCurrency(prof.expenses)}`}
                              size="small"
                              sx={{ 
                                bgcolor: '#f44336', 
                                color: 'white',
                                fontWeight: 600,
                                mb: 1
                              }}
                            />
                            {prof.passiveIncome > 0 && (
                              <Chip 
                                label={`Пассивный доход: ${formatCurrency(prof.passiveIncome)}`}
                                size="small"
                                sx={{ 
                                  bgcolor: '#ff9800', 
                                  color: 'white',
                                  fontWeight: 600
                                }}
                              />
                            )}
                          </Box>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                            <Typography variant="caption" color="text.secondary">
                              Сложность: {prof.difficulty}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Рост: {prof.growth}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          )}

          {/* Шаг 2: Выбор мечты */}
          {activeStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <Button
                  variant="outlined"
                  onClick={() => setActiveStep(0)}
                  startIcon={<ArrowForwardIcon sx={{ transform: 'rotate(180deg)' }} />}
                  sx={{ borderRadius: 3 }}
                >
                  Назад к профессиям
                </Button>
                
                <Typography variant="h5" sx={{ color: '#667eea', fontWeight: 600 }}>
                  ⭐ Выберите свою мечту
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                {DREAMS.map((dream) => (
                  <Grid item xs={12} sm={6} md={4} key={dream.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Card 
                        elevation={8}
                        sx={{
                          borderRadius: 3,
                          cursor: 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          border: `2px solid ${dream.color}`,
                          '&:hover': {
                            transform: 'translateY(-8px) scale(1.02)',
                            boxShadow: `0 20px 40px ${dream.color}40`
                          }
                        }}
                        onClick={() => handleSelectDream(dream)}
                      >
                        <CardContent sx={{ p: 3, textAlign: 'center' }}>
                          <Typography variant="h1" sx={{ mb: 2 }}>
                            {dream.icon}
                          </Typography>
                          
                          <Typography variant="h6" sx={{ 
                            fontWeight: 700, 
                            color: dream.color,
                            mb: 2
                          }}>
                            {dream.name}
                          </Typography>
                          
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            {dream.description}
                          </Typography>
                          
                          <Chip 
                            label={dream.category}
                            size="small"
                            sx={{ 
                              bgcolor: dream.color, 
                              color: 'white',
                              fontWeight: 600,
                              mb: 2
                            }}
                          />
                          
                          <Typography variant="h6" sx={{ 
                            fontWeight: 700,
                            color: '#667eea'
                          }}>
                            {formatCurrency(dream.cost)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          )}

          {/* Шаг 3: Подтверждение */}
          {activeStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <Button
                  variant="outlined"
                  onClick={() => setActiveStep(1)}
                  startIcon={<ArrowForwardIcon sx={{ transform: 'rotate(180deg)' }} />}
                  sx={{ borderRadius: 3 }}
                >
                  Назад к мечтам
                </Button>
                
                <Typography variant="h5" sx={{ color: '#667eea', fontWeight: 600 }}>
                  ✅ Подтвердите выбор
                </Typography>
              </Box>
              
              <Paper elevation={8} sx={{ p: 4, borderRadius: 3, background: 'rgba(102, 126, 234, 0.05)' }}>
                <Grid container spacing={4}>
                  {/* Выбранная профессия */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ mb: 2 }}>
                        {selectedProfession?.icon}
                      </Typography>
                      <Typography variant="h5" sx={{ 
                        fontWeight: 700, 
                        color: selectedProfession?.color,
                        mb: 2
                      }}>
                        {selectedProfession?.name}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        {selectedProfession?.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Chip 
                          label={`Зарплата: ${formatCurrency(selectedProfession?.salary)}`}
                          sx={{ bgcolor: '#4caf50', color: 'white', fontWeight: 600 }}
                        />
                        <Chip 
                          label={`Расходы: ${formatCurrency(selectedProfession?.expenses)}`}
                          sx={{ bgcolor: '#f44336', color: 'white', fontWeight: 600 }}
                        />
                        {selectedProfession?.passiveIncome > 0 && (
                          <Chip 
                            label={`Пассивный доход: ${formatCurrency(selectedProfession?.passiveIncome)}`}
                            sx={{ bgcolor: '#ff9800', color: 'white', fontWeight: 600 }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Grid>
                  
                  {/* Выбранная мечта */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ mb: 2 }}>
                        {selectedDream?.icon}
                      </Typography>
                      <Typography variant="h5" sx={{ 
                        fontWeight: 700, 
                        color: selectedDream?.color,
                        mb: 2
                      }}>
                        {selectedDream?.name}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        {selectedDream?.description}
                      </Typography>
                      
                      <Chip 
                        label={selectedDream?.category}
                        sx={{ 
                          bgcolor: selectedDream?.color, 
                          color: 'white',
                          fontWeight: 600,
                          mb: 2
                        }}
                      />
                      
                      <Typography variant="h4" sx={{ 
                        fontWeight: 700,
                        color: '#667eea'
                      }}>
                        {formatCurrency(selectedDream?.cost)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 4 }} />
                
                <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                  🎯 Ваша цель: накопить <strong>{formatCurrency(selectedDream?.cost)}</strong> 
                  работая <strong>{selectedProfession?.name}</strong>ом
                </Typography>
              </Paper>
            </motion.div>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        p: 3, 
        background: 'rgba(255,255,255,0.95)', 
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.2)'
      }}>
        <Button onClick={handleClose} sx={{ borderRadius: 3 }}>
          Отмена
        </Button>
        
        {activeStep === 2 && (
          <Button
            variant="contained"
            onClick={handleConfirm}
            disabled={!selectedProfession || !selectedDream}
            startIcon={<CheckCircle />}
            sx={{
              background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
              borderRadius: 3,
              px: 4,
              py: 1.5,
              fontWeight: 700,
              '&:hover': {
                background: 'linear-gradient(135deg, #45a049 0%, #4caf50 100%)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Подтвердить выбор
          </Button>
        )}
      </DialogActions>

      {/* Alert для погашения кредита */}
      {showPayOffAlert && (
        <Alert 
          severity="warning" 
          action={
            <Button color="inherit" size="small" onClick={confirmPayOffCredit}>
              Погасить
            </Button>
          }
          sx={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}
        >
          Погасить кредит {creditToPayOff?.type} на сумму {formatCurrency(creditToPayOff?.amount)}?
        </Alert>
      )}
    </Dialog>
  );
};

export default ProfessionModal;
