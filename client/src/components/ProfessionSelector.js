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
  Work as WorkIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  Info as InfoIcon
} from '@mui/icons-material';

// Список профессий
const PROFESSIONS = [
  {
    id: 1,
    name: 'Дворник',
    salary: 2000,
    expenses: 200,
    balance: 2000,
    passiveIncome: 0,
    description: 'Уборка улиц и дворов',
    detailedDescription: 'Работа дворника включает в себя уборку улиц, дворов, парков и других общественных мест. Это стабильная работа с фиксированным графиком, но низким доходом.',
    pros: ['Стабильный график', 'Не требует образования', 'Физическая активность'],
    cons: ['Низкая зарплата', 'Тяжелая физическая работа', 'Работа на улице в любую погоду'],
    requirements: 'Минимальные требования, физическая выносливость',
    growth: 'Возможность стать бригадиром или перейти в ЖКХ'
  },
  {
    id: 2,
    name: 'Курьер',
    salary: 2500,
    expenses: 300,
    balance: 2500,
    passiveIncome: 0,
    description: 'Доставка товаров и документов',
    detailedDescription: 'Курьер доставляет товары, документы и посылки клиентам. Работа связана с постоянным движением и общением с людьми.',
    pros: ['Гибкий график', 'Общение с людьми', 'Возможность дополнительного заработка'],
    cons: ['Нерегулярный доход', 'Зависимость от погоды', 'Физическая нагрузка'],
    requirements: 'Хорошее знание города, коммуникабельность',
    growth: 'Возможность стать менеджером по логистике или открыть свое дело'
  },
  {
    id: 3,
    name: 'Водитель',
    salary: 3000,
    expenses: 400,
    balance: 3000,
    passiveIncome: 0,
    description: 'Перевозка пассажиров или грузов',
    detailedDescription: 'Водитель перевозит пассажиров на такси или грузы на грузовике. Требует водительских прав и хорошего знания ПДД.',
    pros: ['Достойная зарплата', 'Гибкий график', 'Возможность работать на себя'],
    cons: ['Ответственность за безопасность', 'Монотонная работа', 'Зависимость от состояния транспорта'],
    requirements: 'Водительские права, опыт вождения',
    growth: 'Возможность стать инструктором по вождению или открыть автосервис'
  },
  {
    id: 4,
    name: 'Продавец',
    salary: 2800,
    expenses: 350,
    balance: 2800,
    passiveIncome: 0,
    description: 'Продажа товаров в магазине',
    detailedDescription: 'Продавец консультирует покупателей, выкладывает товар, работает с кассой. Требует коммуникабельности и знания товара.',
    pros: ['Стабильный график', 'Развитие коммуникативных навыков', 'Возможность карьерного роста'],
    cons: ['Работа на ногах', 'Общение с разными людьми', 'Монотонность'],
    requirements: 'Коммуникабельность, знание товара, опыт работы с людьми',
    growth: 'Возможность стать менеджером по продажам или открыть свой магазин'
  },
  {
    id: 5,
    name: 'Официант',
    salary: 2200,
    expenses: 250,
    balance: 2200,
    passiveIncome: 0,
    description: 'Обслуживание посетителей в ресторане',
    detailedDescription: 'Официант принимает заказы, подает блюда, обеспечивает комфорт посетителей. Работа связана с общением и физической активностью.',
    pros: ['Чаевые', 'Развитие коммуникативных навыков', 'Гибкий график'],
    cons: ['Работа в выходные', 'Физическая нагрузка', 'Зависимость от сезона'],
    requirements: 'Коммуникабельность, физическая выносливость, знание меню',
    growth: 'Возможность стать менеджером ресторана или открыть свое заведение'
  },
  {
    id: 6,
    name: 'Учитель',
    salary: 3500,
    expenses: 500,
    balance: 3500,
    passiveIncome: 0,
    description: 'Преподавание в школе или университете',
    detailedDescription: 'Учитель передает знания ученикам, готовит уроки, проверяет работы. Требует педагогического образования и любви к детям.',
    pros: ['Высокая зарплата', 'Социальная значимость', 'Длинные каникулы'],
    cons: ['Высокая ответственность', 'Эмоциональная нагрузка', 'Много бумажной работы'],
    requirements: 'Педагогическое образование, любовь к детям, терпение',
    growth: 'Возможность стать завучем, директором или открыть частную школу'
  }
];

const ProfessionSelector = ({ onProfessionSelect, selectedProfession, isObligatory = false }) => {
  const [selectedProfessionDetail, setSelectedProfessionDetail] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const handleProfessionSelect = (profession) => {
    if (isObligatory) {
      // Если профессия обязательная для всех, показываем детали
      setSelectedProfessionDetail(profession);
      setDetailDialogOpen(true);
    } else {
      // Если каждый выбирает свою, сразу выбираем
      onProfessionSelect(profession);
    }
  };

  const handleConfirmProfession = () => {
    if (selectedProfessionDetail) {
      onProfessionSelect(selectedProfessionDetail);
      setDetailDialogOpen(false);
      setSelectedProfessionDetail(null);
    }
  };

  const formatMoney = (amount) => {
    return `$${amount.toLocaleString()}`;
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>
        {isObligatory ? '🏢 Выберите профессию для всех игроков' : '👤 Выберите свою профессию'}
      </Typography>
      
      {isObligatory && (
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Эта профессия будет назначена всем игрокам в комнате
        </Typography>
      )}

      <Grid container spacing={3}>
        {PROFESSIONS.map((profession) => (
          <Grid item xs={12} sm={6} md={4} key={profession.id}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                '&:hover': { boxShadow: 4 },
                border: selectedProfession?.id === profession.id ? '2px solid #1976d2' : '1px solid #e0e0e0'
              }}
              onClick={() => handleProfessionSelect(profession)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    <WorkIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                      {profession.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {profession.description}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Зарплата:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {formatMoney(profession.salary)}/мес
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Расходы:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    {formatMoney(profession.expenses)}/мес
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Начальный баланс:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {formatMoney(profession.balance)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    label={`+${formatMoney(profession.salary - profession.expenses)}/мес`}
                    color="success"
                    size="small"
                    icon={<TrendingUpIcon />}
                  />
                  {profession.passiveIncome > 0 && (
                    <Chip 
                      label={`Пассивный доход: ${formatMoney(profession.passiveIncome)}`}
                      color="info"
                      size="small"
                      icon={<MoneyIcon />}
                    />
                  )}
                </Box>
              </CardContent>

              <CardActions>
                <Button
                  size="small"
                  startIcon={<InfoIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProfessionDetail(profession);
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

      {/* Диалог с подробной информацией о профессии */}
      <Dialog 
        open={detailDialogOpen} 
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedProfessionDetail && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                  <WorkIcon />
                </Avatar>
                <Typography variant="h6">
                  {selectedProfessionDetail.name}
                </Typography>
              </Box>
            </DialogTitle>
            
            <DialogContent>
              <Typography variant="body1" paragraph>
                {selectedProfessionDetail.detailedDescription}
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom color="success.main">
                    ✅ Преимущества
                  </Typography>
                  <Box component="ul" sx={{ pl: 2 }}>
                    {selectedProfessionDetail.pros.map((pro, index) => (
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
                    {selectedProfessionDetail.cons.map((con, index) => (
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
                    {selectedProfessionDetail.requirements}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    🚀 Возможности роста
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {selectedProfessionDetail.growth}
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
                      Зарплата
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {formatMoney(selectedProfessionDetail.salary)}/мес
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Расходы
                    </Typography>
                    <Typography variant="h6" color="error.main">
                      {formatMoney(selectedProfessionDetail.expenses)}/мес
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Начальный баланс
                    </Typography>
                    <Typography variant="h6">
                      {formatMoney(selectedProfessionDetail.balance)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Чистый доход
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {formatMoney(selectedProfessionDetail.salary - selectedProfessionDetail.expenses)}/мес
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>

            <DialogActions>
              <Button onClick={() => setDetailDialogOpen(false)}>
                Закрыть
              </Button>
              {isObligatory && (
                <Button 
                  onClick={handleConfirmProfession}
                  variant="contained"
                  startIcon={<WorkIcon />}
                >
                  Выбрать эту профессию для всех
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ProfessionSelector;
