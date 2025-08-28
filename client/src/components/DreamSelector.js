import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  Divider
} from '@mui/material';
import {
  Favorite as HeartIcon,
  Star as StarIcon,
  Info as InfoIcon,
  Home as HomeIcon,
  Flight as FlightIcon,
  Business as BusinessIcon,
  School as SchoolIcon,
  SportsEsports as GameIcon
} from '@mui/icons-material';

// Список мечт
const DREAMS = [
  {
    id: 1,
    name: 'Построить дом мечты',
    description: 'Собственный дом с садом и бассейном',
    detailedDescription: 'Мечта о собственном доме - это стремление к стабильности, комфорту и созданию семейного гнезда. Дом мечты может включать в себя все, что вы всегда хотели: просторные комнаты, современную кухню, уютную гостиную, личный кабинет, детские комнаты, сад с фруктовыми деревьями, бассейн, гараж на несколько машин.',
    category: 'Недвижимость',
    estimatedCost: 500000,
    monthlyIncome: 0,
    icon: <HomeIcon />,
    pros: ['Стабильность и безопасность', 'Возможность передать детям', 'Инвестиция в будущее', 'Личное пространство'],
    cons: ['Высокая стоимость', 'Обслуживание и налоги', 'Привязка к месту', 'Ответственность за содержание'],
    requirements: 'Значительный капитал, стабильный доход, хорошая кредитная история',
    timeline: '5-10 лет для накопления и строительства'
  },
  {
    id: 2,
    name: 'Посетить все континенты',
    description: 'Путешествие по всему миру',
    detailedDescription: 'Мечта о кругосветном путешествии - это стремление к познанию мира, новых культур, традиций и достопримечательностей. Путешествие по всем континентам позволит увидеть самые красивые места планеты, познакомиться с разными народами и расширить кругозор.',
    category: 'Путешествия',
    estimatedCost: 100000,
    monthlyIncome: 0,
    icon: <FlightIcon />,
    pros: ['Новые впечатления и эмоции', 'Расширение кругозора', 'Знакомство с культурами', 'Воспоминания на всю жизнь'],
    cons: ['Высокая стоимость', 'Временные затраты', 'Риски в путешествиях', 'Адаптация к новым условиям'],
    requirements: 'Финансовые средства, время, хорошее здоровье, знание языков',
    timeline: '1-2 года планирования и реализации'
  },
  {
    id: 3,
    name: 'Открыть свой бизнес',
    description: 'Собственное дело и независимость',
    detailedDescription: 'Мечта о собственном бизнесе - это стремление к финансовой независимости, самореализации и созданию чего-то значимого. Собственное дело дает возможность работать на себя, принимать важные решения и строить будущее по своим правилам.',
    category: 'Бизнес',
    estimatedCost: 200000,
    monthlyIncome: 5000,
    icon: <BusinessIcon />,
    pros: ['Финансовая независимость', 'Самореализация', 'Гибкий график', 'Возможность роста'],
    cons: ['Высокие риски', 'Ответственность', 'Нестабильный доход', 'Много работы'],
    requirements: 'Бизнес-план, стартовый капитал, знания в области, упорство',
    timeline: '3-5 лет для становления бизнеса'
  },
  {
    id: 4,
    name: 'Получить высшее образование',
    description: 'Развитие и карьерный рост',
    detailedDescription: 'Мечта о высшем образовании - это стремление к саморазвитию, получению новых знаний и навыков, которые помогут в карьере и личной жизни. Образование открывает новые возможности и повышает качество жизни.',
    category: 'Образование',
    estimatedCost: 50000,
    monthlyIncome: 1000,
    icon: <SchoolIcon />,
    pros: ['Новые знания и навыки', 'Карьерный рост', 'Повышение зарплаты', 'Саморазвитие'],
    cons: ['Временные затраты', 'Стоимость обучения', 'Сложность совмещения с работой', 'Не гарантирует успех'],
    requirements: 'Время, деньги, желание учиться, базовые знания',
    timeline: '3-6 лет обучения'
  },
  {
    id: 5,
    name: 'Стать профессиональным геймером',
    description: 'Игры как карьера и хобби',
    detailedDescription: 'Мечта о профессиональной карьере в игровой индустрии - это возможность превратить любимое хобби в источник дохода. Профессиональный гейминг включает участие в турнирах, стриминг, создание контента и развитие игровых навыков.',
    category: 'Развлечения',
    estimatedCost: 20000,
    monthlyIncome: 3000,
    icon: <GameIcon />,
    pros: ['Любимое дело как работа', 'Возможность путешествовать', 'Общение с единомышленниками', 'Творческая самореализация'],
    cons: ['Нестабильный доход', 'Высокая конкуренция', 'Зависимость от платформ', 'Короткая карьера'],
    requirements: 'Высокий уровень игры, харизма, технические навыки, упорство',
    timeline: '2-3 года для развития навыков'
  },
  {
    id: 6,
    name: 'Создать благотворительный фонд',
    description: 'Помощь людям и обществу',
    detailedDescription: 'Мечта о создании благотворительного фонда - это стремление помочь людям, внести вклад в развитие общества и оставить после себя что-то значимое. Благотворительность приносит не только моральное удовлетворение, но и может быть эффективным способом управления капиталом.',
    category: 'Благотворительность',
    estimatedCost: 1000000,
    monthlyIncome: 0,
    icon: <HeartIcon />,
    pros: ['Помощь людям', 'Моральное удовлетворение', 'Налоговые льготы', 'Социальная значимость'],
    cons: ['Высокая стоимость', 'Сложность управления', 'Юридические аспекты', 'Необходимость контроля'],
    requirements: 'Значительный капитал, юридические знания, опыт в благотворительности',
    timeline: '5-10 лет для создания и развития фонда'
  }
];

const DreamSelector = ({ onDreamSelect, selectedDream, isHost = false }) => {
  const [selectedDreamDetail, setSelectedDreamDetail] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const handleDreamSelect = (dream) => {
    if (isHost) {
      // Если это хост, показываем детали
      setSelectedDreamDetail(dream);
      setDetailDialogOpen(true);
    } else {
      // Если обычный игрок, сразу выбираем
      onDreamSelect(dream);
    }
  };

  const handleConfirmDream = () => {
    if (selectedDreamDetail) {
      onDreamSelect(selectedDreamDetail);
      setDetailDialogOpen(false);
      setSelectedDreamDetail(null);
    }
  };

  const formatMoney = (amount) => {
    return `$${amount.toLocaleString()}`;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Недвижимость': 'primary',
      'Путешествия': 'secondary',
      'Бизнес': 'success',
      'Образование': 'info',
      'Развлечения': 'warning',
      'Благотворительность': 'error'
    };
    return colors[category] || 'default';
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>
        {isHost ? '⭐ Выберите свою мечту' : '💭 Выберите свою мечту'}
      </Typography>
      
      {isHost && (
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Ваша мечта будет отображаться в игре и может вдохновить других игроков
        </Typography>
      )}

      <Grid container spacing={3}>
        {DREAMS.map((dream) => (
          <Grid item xs={12} sm={6} md={4} key={dream.id}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                '&:hover': { boxShadow: 4 },
                border: selectedDream?.id === dream.id ? '2px solid #1976d2' : '1px solid #e0e0e0'
              }}
              onClick={() => handleDreamSelect(dream)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ mr: 2, bgcolor: `${getCategoryColor(dream.category)}.main` }}>
                    {dream.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                      {dream.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {dream.description}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Категория:
                  </Typography>
                  <Chip 
                    label={dream.category} 
                    size="small" 
                    color={getCategoryColor(dream.category)}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Стоимость:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    {formatMoney(dream.estimatedCost)}
                  </Typography>
                </Box>

                {dream.monthlyIncome > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Доход:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      {formatMoney(dream.monthlyIncome)}/мес
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    label={dream.timeline}
                    size="small"
                    icon={<StarIcon />}
                    variant="outlined"
                  />
                </Box>
              </CardContent>

              <CardActions>
                <Button
                  size="small"
                  startIcon={<InfoIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDreamDetail(dream);
                    setDetailDialogOpen(true);
                  }}
                >
                  Подробнее
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Диалог с подробной информацией о мечте */}
      <Dialog 
        open={detailDialogOpen} 
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedDreamDetail && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ mr: 2, bgcolor: `${getCategoryColor(selectedDreamDetail.category)}.main` }}>
                  {selectedDreamDetail.icon}
                </Avatar>
                <Typography variant="h6">
                  {selectedDreamDetail.name}
                </Typography>
              </Box>
            </DialogTitle>
            
            <DialogContent>
              <Typography variant="body1" paragraph>
                {selectedDreamDetail.detailedDescription}
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom color="success.main">
                    ✅ Преимущества
                  </Typography>
                  <Box component="ul" sx={{ pl: 2 }}>
                    {selectedDreamDetail.pros.map((pro, index) => (
                      <Typography component="li" key={index} variant="body2" sx={{ mb: 1 }}>
                        {pro}
                      </Typography>
                    ))}
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom color="error.main">
                    ❌ Недостатки
                  </Typography>
                  <Box component="ul" sx={{ pl: 2 }}>
                    {selectedDreamDetail.cons.map((con, index) => (
                      <Typography component="li" key={index} variant="body2" sx={{ mb: 1 }}>
                        {con}
                      </Typography>
                    ))}
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    📋 Требования
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {selectedDreamDetail.requirements}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    ⏱️ Временные рамки
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {selectedDreamDetail.timeline}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>
                  💰 Финансовые показатели
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Стоимость
                    </Typography>
                    <Typography variant="h6" color="error.main">
                      {formatMoney(selectedDreamDetail.estimatedCost)}
                    </Typography>
                  </Grid>
                  {selectedDreamDetail.monthlyIncome > 0 && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Ежемесячный доход
                      </Typography>
                      <Typography variant="h6" color="success.main">
                        {formatMoney(selectedDreamDetail.monthlyIncome)}/мес
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </DialogContent>

            <DialogActions>
              <Button onClick={() => setDetailDialogOpen(false)}>
                Закрыть
              </Button>
              {isHost && (
                <Button 
                  onClick={handleConfirmDream}
                  variant="contained"
                  startIcon={<HeartIcon />}
                >
                  Выбрать эту мечту
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default DreamSelector;
