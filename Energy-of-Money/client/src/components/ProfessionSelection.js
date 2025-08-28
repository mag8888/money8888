import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Avatar,
  Chip,
  Paper,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Work as WorkIcon,
  School as SchoolIcon,
  Business as BusinessIcon,
  LocalHospital as HealthIcon,
  Engineering as TechIcon,
  Restaurant as FoodIcon,
  LocalShipping as TransportIcon,
  Security as SecurityIcon,
  Check as CheckIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';

const professions = [
  {
    id: 'employee',
    name: 'Сотрудник',
    icon: WorkIcon,
    description: 'Стабильная зарплата, социальные гарантии',
    salary: '30,000 - 80,000 ₽',
    risk: 'Низкий',
    color: '#4caf50',
    benefits: ['Стабильность', 'Соцпакет', 'Карьерный рост'],
    drawbacks: ['Ограниченный доход', 'Зависимость от работодателя']
  },
  {
    id: 'entrepreneur',
    name: 'Предприниматель',
    icon: BusinessIcon,
    description: 'Собственный бизнес, неограниченные возможности',
    salary: '50,000 - 500,000+ ₽',
    risk: 'Высокий',
    color: '#ff9800',
    benefits: ['Неограниченный доход', 'Свобода', 'Масштабирование'],
    drawbacks: ['Высокие риски', 'Ответственность', 'Нестабильность']
  },
  {
    id: 'freelancer',
    name: 'Фрилансер',
    icon: SchoolIcon,
    description: 'Свободный график, работа на себя',
    salary: '40,000 - 200,000 ₽',
    risk: 'Средний',
    color: '#2196f3',
    benefits: ['Гибкость', 'Разнообразие проектов', 'Географическая свобода'],
    drawbacks: ['Нестабильность заказов', 'Отсутствие соцпакета']
  },
  {
    id: 'investor',
    name: 'Инвестор',
    icon: BusinessIcon,
    description: 'Пассивный доход от вложений',
    salary: '20,000 - 1,000,000+ ₽',
    risk: 'Высокий',
    color: '#9c27b0',
    benefits: ['Пассивный доход', 'Диверсификация', 'Налоговые льготы'],
    drawbacks: ['Высокие риски', 'Требует капитал', 'Волатильность']
  },
  {
    id: 'specialist',
    name: 'Специалист',
    icon: TechIcon,
    description: 'Эксперт в определенной области',
    salary: '60,000 - 300,000 ₽',
    risk: 'Средний',
    color: '#f44336',
    benefits: ['Высокий доход', 'Экспертность', 'Востребованность'],
    drawbacks: ['Узкая специализация', 'Необходимость развития']
  },
  {
    id: 'consultant',
    name: 'Консультант',
    icon: HealthIcon,
    description: 'Консультации и обучение других',
    salary: '50,000 - 400,000 ₽',
    risk: 'Средний',
    color: '#00bcd4',
    benefits: ['Высокий доход', 'Помощь людям', 'Гибкость'],
    drawbacks: ['Зависимость от клиентов', 'Необходимость репутации']
  }
];

const dreams = [
  {
    id: 'house',
    name: 'Собственный дом',
    icon: '🏠',
    description: 'Просторный дом с участком',
    cost: '5,000,000 - 50,000,000 ₽',
    color: '#4caf50'
  },
  {
    id: 'business',
    name: 'Собственный бизнес',
    icon: '🏢',
    description: 'Крупная компания с множеством сотрудников',
    cost: '10,000,000 - 100,000,000+ ₽',
    color: '#ff9800'
  },
  {
    id: 'travel',
    name: 'Путешествия по миру',
    icon: '✈️',
    description: 'Посетить все континенты',
    cost: '2,000,000 - 10,000,000 ₽',
    color: '#2196f3'
  },
  {
    id: 'education',
    name: 'Образование',
    icon: '🎓',
    description: 'Престижное образование за границей',
    cost: '3,000,000 - 15,000,000 ₽',
    color: '#9c27b0'
  },
  {
    id: 'charity',
    name: 'Благотворительность',
    icon: '❤️',
    description: 'Помогать нуждающимся',
    cost: '1,000,000 - 50,000,000+ ₽',
    color: '#f44336'
  },
  {
    id: 'retirement',
    name: 'Ранний выход на пенсию',
    icon: '🌅',
    description: 'Финансовая независимость в 40 лет',
    cost: '20,000,000 - 100,000,000 ₽',
    color: '#00bcd4'
  }
];

const ProfessionSelection = ({ onComplete }) => {
  const [selectedProfession, setSelectedProfession] = useState(null);
  const [selectedDream, setSelectedDream] = useState(null);
  const [step, setStep] = useState(1); // 1 - профессия, 2 - мечта

  const handleProfessionSelect = (profession) => {
    setSelectedProfession(profession);
  };

  const handleDreamSelect = (dream) => {
    setSelectedDream(dream);
  };

  const handleNext = () => {
    if (step === 1 && selectedProfession) {
      setStep(2);
    } else if (step === 2 && selectedDream) {
      onComplete({
        profession: selectedProfession,
        dream: selectedDream
      });
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const canProceed = (step === 1 && selectedProfession) || (step === 2 && selectedDream);

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%)',
      p: 3
    }}>
      {/* Прогресс бар */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <Box sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            bgcolor: step >= 1 ? '#4caf50' : '#e0e0e0',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            mr: 2
          }}>
            1
          </Box>
          <Box sx={{
            width: 60,
            height: 4,
            bgcolor: step >= 2 ? '#4caf50' : '#e0e0e0',
            borderRadius: 2
          }} />
          <Box sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            bgcolor: step >= 2 ? '#4caf50' : '#e0e0e0',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            ml: 2
          }}>
            2
          </Box>
        </Box>
        <Typography variant="h6" sx={{ textAlign: 'center', color: '#1565c0' }}>
          {step === 1 ? 'Выберите профессию' : 'Выберите мечту'}
        </Typography>
      </Box>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="professions"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 50, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Выбор профессии */}
            <Typography variant="h4" sx={{
              textAlign: 'center',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #1565c0 0%, #42a5f5 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 4
            }}>
              👔 Выберите свою профессию
            </Typography>

            <Grid container spacing={3}>
              {professions.map((profession, index) => (
                <Grid item xs={12} md={6} lg={4} key={profession.id}>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card
                      elevation={8}
                      sx={{
                        height: '100%',
                        borderRadius: 3,
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: selectedProfession?.id === profession.id 
                          ? `3px solid ${profession.color}` 
                          : '1px solid rgba(255, 255, 255, 0.2)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
                        }
                      }}
                      onClick={() => handleProfessionSelect(profession)}
                    >
                      <CardContent sx={{ p: 3 }}>
                        {/* Заголовок */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar
                            sx={{
                              bgcolor: profession.color,
                              width: 50,
                              height: 50,
                              mr: 2
                            }}
                          >
                            <profession.icon />
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1565c0' }}>
                              {profession.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {profession.description}
                            </Typography>
                          </Box>
                          {selectedProfession?.id === profession.id && (
                            <Box sx={{
                              width: 30,
                              height: 30,
                              borderRadius: '50%',
                              bgcolor: '#4caf50',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white'
                            }}>
                              <CheckIcon />
                            </Box>
                          )}
                        </Box>

                        {/* Информация */}
                        <Box sx={{ mb: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Зарплата:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#4caf50' }}>
                              {profession.salary}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Риск:
                            </Typography>
                            <Chip
                              label={profession.risk}
                              size="small"
                              sx={{
                                bgcolor: profession.risk === 'Низкий' ? '#4caf50' : 
                                         profession.risk === 'Средний' ? '#ff9800' : '#f44336',
                                color: 'white',
                                fontWeight: 600
                              }}
                            />
                          </Box>
                        </Box>

                        {/* Преимущества и недостатки */}
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#4caf50', mb: 1 }}>
                            ✅ Преимущества:
                          </Typography>
                          {profession.benefits.map((benefit, idx) => (
                            <Typography key={idx} variant="caption" sx={{ display: 'block', color: '#666' }}>
                              • {benefit}
                            </Typography>
                          ))}
                        </Box>

                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#f44336', mb: 1 }}>
                            ⚠️ Недостатки:
                          </Typography>
                          {profession.drawbacks.map((drawback, idx) => (
                            <Typography key={idx} variant="caption" sx={{ display: 'block', color: '#666' }}>
                              • {drawback}
                            </Typography>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        ) : (
          <motion.div
            key="dreams"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 50, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Выбор мечты */}
            <Typography variant="h4" sx={{
              textAlign: 'center',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #1565c0 0%, #42a5f5 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 4
            }}>
              💭 Выберите свою мечту
            </Typography>

            <Grid container spacing={3}>
              {dreams.map((dream, index) => (
                <Grid item xs={12} md={6} lg={4} key={dream.id}>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card
                      elevation={8}
                      sx={{
                        height: '100%',
                        borderRadius: 3,
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: selectedDream?.id === dream.id 
                          ? `3px solid ${dream.color}` 
                          : '1px solid rgba(255, 255, 255, 0.2)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
                        }
                      }}
                      onClick={() => handleDreamSelect(dream)}
                    >
                      <CardContent sx={{ p: 3, textAlign: 'center' }}>
                        {/* Иконка мечты */}
                        <Typography variant="h1" sx={{ mb: 2 }}>
                          {dream.icon}
                        </Typography>

                        {/* Название и описание */}
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1565c0', mb: 1 }}>
                          {dream.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {dream.description}
                        </Typography>

                        {/* Стоимость */}
                        <Box sx={{
                          bgcolor: dream.color,
                          color: 'white',
                          p: 2,
                          borderRadius: 2,
                          mb: 2
                        }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            💰 Стоимость: {dream.cost}
                          </Typography>
                        </Box>

                        {/* Индикатор выбора */}
                        {selectedDream?.id === dream.id && (
                          <Box sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            bgcolor: '#4caf50',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            mx: 'auto'
                          }}>
                            <CheckIcon />
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Кнопки навигации */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 6 }}>
        {step === 2 && (
          <Button
            variant="outlined"
            size="large"
            onClick={handleBack}
            startIcon={<ArrowIcon sx={{ transform: 'rotate(180deg)' }} />}
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              borderColor: '#1976d2',
              color: '#1976d2',
              '&:hover': {
                borderColor: '#1565c0',
                bgcolor: 'rgba(25, 118, 210, 0.08)'
              }
            }}
          >
            Назад
          </Button>
        )}

        <Button
          variant="contained"
          size="large"
          onClick={handleNext}
          disabled={!canProceed}
          endIcon={step === 1 ? <ArrowIcon /> : <CheckIcon />}
          sx={{
            borderRadius: 3,
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #45a049 0%, #4caf50 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(76, 175, 80, 0.3)'
            },
            '&:disabled': {
              background: '#ccc',
              transform: 'none',
              boxShadow: 'none'
            },
            transition: 'all 0.3s ease'
          }}
        >
          {step === 1 ? 'Продолжить' : 'Завершить выбор'}
        </Button>
      </Box>

      {/* Выбранные опции */}
      {(selectedProfession || selectedDream) && (
        <Paper elevation={8} sx={{
          p: 3,
          mt: 4,
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)'
        }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', textAlign: 'center' }}>
            🎯 Ваш выбор:
          </Typography>
          
          <Grid container spacing={3}>
            {selectedProfession && (
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: selectedProfession.color }}>
                    <selectedProfession.icon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Профессия: {selectedProfession.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedProfession.description}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )}
            
            {selectedDream && (
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h4">
                    {selectedDream.icon}
                  </Typography>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Мечта: {selectedDream.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedDream.description}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default ProfessionSelection;
