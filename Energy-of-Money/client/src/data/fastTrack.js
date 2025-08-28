import React from 'react';
import {
  AttachMoney as MoneyIcon,
  Home as DreamIcon,
  Business as BusinessIcon,
  Warning as LossIcon,
  VolunteerActivism as CharityIcon,
  LocalCafe as CoffeeIcon,
  Spa as SpaIcon,
  FlightTakeoff as TravelIcon,
  PhoneIphone as AppIcon,
  Campaign as MarketingIcon,
  Security as SecurityIcon,
  Hotel as HotelIcon,
  Terrain as MountainIcon,
  Restaurant as RestaurantIcon,
  SelfImprovement as YogaIcon,
  LocalCarWash as CarWashIcon,
  ContentCut as BeautyIcon,
  Book as BookIcon,
  ShoppingCart as ShopIcon,
  Festival as FestivalIcon,
  Park as EcoIcon,
  Casino as CasinoIcon,
  Flight as PlaneIcon,
  School as SchoolIcon,
  Movie as MovieIcon,
  AccountBalance as BankIcon,
  BakeryDining as BakeryIcon,
  FitnessCenter as GymIcon,
  Work as CoworkingIcon
} from '@mui/icons-material';

// Данные для Большого круга (Fast Track) - 51 клетка
// ВАЖНО: Расположение клеток НЕ ИЗМЕНЯТЬ!
export const FAST_TRACK_CELLS = [
  // Клетка 1 - ДЕНЬГИ (желтая)
  {
    id: 1,
    name: 'Вам выплачивается доход от ваших инвестиций',
    description: 'Получение дохода от ранее приобретенных активов.',
    type: 'money',
    cost: 0,
    monthlyIncome: 0,
    category: 'money',
    color: '#FFD700', // Желтый
    icon: <MoneyIcon />
  },
  // Клетка 2 - МЕЧТА (голубая)
  {
    id: 2,
    name: 'Построить дом мечты для семьи',
    description: 'Реализация мечты о собственном доме для семьи.',
    type: 'dream',
    cost: 100000,
    monthlyIncome: 0,
    category: 'dream',
    color: '#87CEEB', // Голубой
    icon: <DreamIcon />
  },
  // Клетка 3 - БИЗНЕС (зеленая)
  {
    id: 3,
    name: 'Кофейня в центре города',
    description: 'Прибыльный бизнес в центре города с высоким трафиком.',
    type: 'business',
    cost: 100000,
    monthlyIncome: 3000,
    category: 'business',
    color: '#4CAF50', // Зеленый
    icon: <CoffeeIcon />
  },
  // Клетка 4 - ПОТЕРЯ (бордовая)
  {
    id: 4,
    name: 'Аудит',
    description: 'Неожиданные расходы на аудит, которые могут повлиять на бизнес.',
    type: 'loss',
    cost: 0,
    monthlyIncome: -0.5, // -50% от текущих активов
    category: 'loss',
    color: '#8B0000', // Бордовый
    icon: <LossIcon />
  },
  // Клетка 5 - БИЗНЕС (зеленая)
  {
    id: 5,
    name: 'Центр здоровья и спа',
    description: 'Премиальный центр здоровья и спа-услуг.',
    type: 'business',
    cost: 270000,
    monthlyIncome: 5000,
    category: 'business',
    color: '#4CAF50', // Зеленый
    icon: <SpaIcon />
  },
  // Клетка 6 - МЕЧТА (голубая)
  {
    id: 6,
    name: 'Посетить Антарктиду',
    description: 'Экстремальное путешествие на самый южный континент.',
    type: 'dream',
    cost: 150000,
    monthlyIncome: 0,
    category: 'dream',
    color: '#87CEEB', // Голубой
    icon: <TravelIcon />
  },
  // Клетка 7 - БИЗНЕС (зеленая)
  {
    id: 7,
    name: 'Мобильное приложение (подписка)',
    description: 'Разработка и запуск мобильного приложения с подписочной моделью.',
    type: 'business',
    cost: 420000,
    monthlyIncome: 10000,
    category: 'business',
    color: '#4CAF50', // Зеленый
    icon: <AppIcon />
  },
  // Клетка 8 - БЛАГОТВОРИТЕЛЬНОСТЬ (розовая)
  {
    id: 8,
    name: 'Благотворительность',
    description: 'Возможность помочь нуждающимся и внести вклад в общество.',
    type: 'charity',
    cost: 0,
    monthlyIncome: 0,
    category: 'charity',
    color: '#FF69B4', // Розовый
    icon: <CharityIcon />
  },
  // Клетка 9 - БИЗНЕС (зеленая)
  {
    id: 9,
    name: 'Агентство цифрового маркетинга',
    description: 'Современное агентство по продвижению в цифровой среде.',
    type: 'business',
    cost: 160000,
    monthlyIncome: 4000,
    category: 'business',
    color: '#4CAF50', // Зеленый
    icon: <MarketingIcon />
  },
  // Клетка 10 - ПОТЕРЯ (бордовая)
  {
    id: 10,
    name: 'Кража 100% наличных',
    description: 'Полная потеря всех наличных средств.',
    type: 'loss',
    cost: 0,
    monthlyIncome: -1, // -100% от наличных
    category: 'loss',
    color: '#8B0000', // Бордовый
    icon: <SecurityIcon />
  },
  // Клетка 11 - БИЗНЕС (зеленая)
  {
    id: 11,
    name: 'Мини-отель/бутик-гостиница',
    description: 'Создание небольшого, но престижного отеля.',
    type: 'business',
    cost: 200000,
    monthlyIncome: 5000,
    category: 'business',
    color: '#4CAF50', // Зеленый
    icon: <HotelIcon />
  },
  // Клетка 12 - МЕЧТА (голубая)
  {
    id: 12,
    name: 'Подняться на все высочайшие вершины мира',
    description: 'Покорение семи высочайших вершин планеты (Seven Summits).',
    type: 'dream',
    cost: 500000,
    monthlyIncome: 0,
    category: 'dream',
    color: '#87CEEB', // Голубой
    icon: <MountainIcon />
  },
  // Клетка 13 - БИЗНЕС (зеленая)
  {
    id: 13,
    name: 'Франшиза популярного ресторана',
    description: 'Приобретение франшизы известной сети ресторанов.',
    type: 'business',
    cost: 320000,
    monthlyIncome: 8000,
    category: 'business',
    color: '#4CAF50', // Зеленый
    icon: <RestaurantIcon />
  },
  // Клетка 14 - ДЕНЬГИ (желтая)
  {
    id: 14,
    name: 'Объехать 100 стран',
    description: 'Выплата/бонус, связанный с большим турне — получаете 500 000$.',
    type: 'money',
    cost: 500000,
    monthlyIncome: 0,
    category: 'money',
    color: '#FFD700', // Желтый
    icon: <MoneyIcon />
  },
  // Клетка 15 - БИЗНЕС (зеленая)
  {
    id: 15,
    name: 'Йога- и медитационный центр',
    description: 'Центр для духовного развития и физического здоровья.',
    type: 'business',
    cost: 170000,
    monthlyIncome: 4500,
    category: 'business',
    color: '#4CAF50', // Зеленый
    icon: <YogaIcon />
  },
  // Клетка 16 - МЕЧТА (голубая)
  {
    id: 16,
    name: 'Жить год на яхте в Средиземном море',
    description: 'Годовая жизнь на роскошной яхте в прекрасном климате.',
    type: 'dream',
    cost: 300000,
    monthlyIncome: 0,
    category: 'dream',
    color: '#87CEEB', // Голубой
    icon: <TravelIcon />
  },
  // Клетка 17 - БИЗНЕС (зеленая)
  {
    id: 17,
    name: 'Салон красоты/барбершоп',
    description: 'Салон красоты для мужчин и женщин.',
    type: 'business',
    cost: 500000,
    monthlyIncome: 15000,
    category: 'business',
    color: '#4CAF50', // Зеленый
    icon: <BeautyIcon />
  },
  // Клетка 18 - МЕЧТА (голубая)
  {
    id: 18,
    name: 'Создать фонд поддержки талантов',
    description: 'Основание благотворительного фонда для помощи одаренным людям.',
    type: 'dream',
    cost: 300000,
    monthlyIncome: 0,
    category: 'dream',
    color: '#87CEEB', // Голубой
    icon: <CharityIcon />
  },
  // Клетка 19 - БИЗНЕС (зеленая)
  {
    id: 19,
    name: 'Сеть автомоек самообслуживания',
    description: 'Создание сети автоматических автомоек.',
    type: 'business',
    cost: 120000,
    monthlyIncome: 3000,
    category: 'business',
    color: '#4CAF50', // Зеленый
    icon: <CarWashIcon />
  },
  // Клетка 20 - МЕЧТА (голубая)
  {
    id: 20,
    name: 'Организовать мировой фестиваль',
    description: 'Проведение масштабного международного культурного события.',
    type: 'dream',
    cost: 200000,
    monthlyIncome: 0,
    category: 'dream',
    color: '#87CEEB', // Голубой
    icon: <FestivalIcon />
  },
  // Клетка 21 - БИЗНЕС (зеленая)
  {
    id: 21,
    name: 'Построить ретрит-центр',
    description: 'Создание места для духовного развития и медитаций.',
    type: 'business',
    cost: 500000,
    monthlyIncome: 0,
    category: 'business',
    color: '#4CAF50', // Зеленый
    icon: <YogaIcon />
  },
  // Клетка 22 - ПОТЕРЯ (бордовая)
  {
    id: 22,
    name: 'Развод',
    description: 'Неожиданные расходы на развод, которые могут повлиять на финансы.',
    type: 'loss',
    cost: 0,
    monthlyIncome: -0.5, // -50% от текущих активов
    category: 'loss',
    color: '#8B0000', // Бордовый
    icon: <LossIcon />
  },
  // Клетка 23 - БИЗНЕС (зеленая)
  {
    id: 23,
    name: 'Сеть автомоек самообслуживания',
    description: 'Создание сети автоматических автомоек.',
    type: 'business',
    cost: 120000,
    monthlyIncome: 3500,
    category: 'business',
    color: '#4CAF50', // Зеленый
    icon: <CarWashIcon />
  },
  // Клетка 24 - МЕЧТА (голубая)
  {
    id: 24,
    name: 'Туристический комплекс (эко-ранчо)',
    description: 'Создание экологического туристического комплекса.',
    type: 'dream',
    cost: 1000000,
    monthlyIncome: 0,
    category: 'dream',
    color: '#87CEEB', // Голубой
    icon: <EcoIcon />
  },
  // Клетка 25 - БИЗНЕС (зеленая)
  {
    id: 25,
    name: 'Кругосветное плавание на паруснике',
    description: 'Кругосветное путешествие на парусном судне.',
    type: 'business',
    cost: 300000,
    monthlyIncome: 0,
    category: 'business',
    color: '#4CAF50', // Зеленый
    icon: <TravelIcon />
  },
  // Клетка 26 - МЕЧТА (голубая)
  {
    id: 26,
    name: 'Биржа',
    description: 'Разово выплачивается 500 000$ если выпало 5 или 6 на кубике.',
    type: 'dream',
    cost: 50000,
    monthlyIncome: 500000,
    category: 'dream',
    color: '#87CEEB', // Голубой
    icon: <BankIcon />
  },
  // Клетка 27 - БИЗНЕС (зеленая)
  {
    id: 27,
    name: 'Купить частный самолёт',
    description: 'Приобретение собственного воздушного судна для путешествий.',
    type: 'business',
    cost: 1000000,
    monthlyIncome: 0,
    category: 'business',
    color: '#4CAF50', // Зеленый
    icon: <PlaneIcon />
  },
  // Клетка 28 - МЕЧТА (голубая)
  {
    id: 28,
    name: 'NFT-платформа',
    description: 'Создание платформы для торговли NFT.',
    type: 'dream',
    cost: 400000,
    monthlyIncome: 0,
    category: 'dream',
    color: '#87CEEB', // Голубой
    icon: <BusinessIcon />
  },
  // Клетка 29 - БИЗНЕС (зеленая)
  {
    id: 29,
    name: 'Стать мировым лидером мнений',
    description: 'Достижение статуса влиятельного человека в своей области.',
    type: 'business',
    cost: 1000000,
    monthlyIncome: 0,
    category: 'business',
    color: '#4CAF50', // Зеленый
    icon: <BusinessIcon />
  },
  // Клетка 30 - МЕЧТА (голубая)
  {
    id: 30,
    name: 'Школа иностранных языков',
    description: 'Создание школы для изучения иностранных языков.',
    type: 'dream',
    cost: 20000,
    monthlyIncome: 0,
    category: 'dream',
    color: '#87CEEB', // Голубой
    icon: <SchoolIcon />
  },
  // Клетка 31 - БИЗНЕС (зеленая)
  {
    id: 31,
    name: 'Купить коллекцию суперкаров',
    description: 'Собрание самых престижных и быстрых автомобилей в мире.',
    type: 'business',
    cost: 1000000,
    monthlyIncome: 0,
    category: 'business',
    color: '#4CAF50', // Зеленый
    icon: <CarWashIcon />
  },
  // Клетка 32 - МЕЧТА (голубая)
  {
    id: 32,
    name: 'Создать школу будущего для детей',
    description: 'Создание инновационной школы для детей.',
    type: 'dream',
    cost: 300000,
    monthlyIncome: 0,
    category: 'dream',
    color: '#87CEEB', // Голубой
    icon: <SchoolIcon />
  },
  // Клетка 33 - БИЗНЕС (зеленая)
  {
    id: 33,
    name: 'Снять полнометражный фильм',
    description: 'Создание художественного фильма для широкой аудитории.',
    type: 'business',
    cost: 500000,
    monthlyIncome: 0,
    category: 'business',
    color: '#4CAF50', // Зеленый
    icon: <MovieIcon />
  },
  // Клетка 34 - ПОТЕРЯ (бордовая)
  {
    id: 34,
    name: 'Рейдерский захват',
    description: 'Вы теряете бизнес с крупным доходом.',
    type: 'loss',
    cost: 0,
    monthlyIncome: -1, // -100% от бизнеса с крупным доходом
    category: 'loss',
    color: '#8B0000', // Бордовый
    icon: <LossIcon />
  },
  // Клетка 35 - МЕЧТА (голубая)
  {
    id: 35,
    name: 'Кругосветное плавание на паруснике',
    description: 'Кругосветное путешествие на парусном судне.',
    type: 'dream',
    cost: 200000,
    monthlyIncome: 0,
    category: 'dream',
    color: '#87CEEB', // Голубой
    icon: <TravelIcon />
  },
  // Клетка 36 - ДЕНЬГИ (желтая)
  {
    id: 36,
    name: '',
    description: '',
    type: 'money',
    cost: 0,
    monthlyIncome: 0,
    category: 'money',
    color: '#FFD700', // Желтый
    icon: <MoneyIcon />
  },
  // Клетка 37 - МЕЧТА (голубая)
  {
    id: 37,
    name: 'Белоснежная Яхта',
    description: 'Приобретение роскошной белоснежной яхты.',
    type: 'dream',
    cost: 300000,
    monthlyIncome: 0,
    category: 'dream',
    color: '#87CEEB', // Голубой
    icon: <TravelIcon />
  },
  // Клетка 38 - БИЗНЕС (зеленая)
  {
    id: 38,
    name: 'Франшиза "поток денег"',
    description: 'Приобретение франшизы игры "Поток денег".',
    type: 'business',
    cost: 100000,
    monthlyIncome: 10000,
    category: 'business',
    color: '#4CAF50', // Зеленый
    icon: <BusinessIcon />
  },
  // Клетка 39 - ПОТЕРЯ (бордовая)
  {
    id: 39,
    name: 'Санкции заблокировали все счета',
    description: 'Санкции приводят к блокировке всех банковских счетов.',
    type: 'loss',
    cost: 0,
    monthlyIncome: -1, // -100% от всех счетов
    category: 'loss',
    color: '#8B0000', // Бордовый
    icon: <BankIcon />
  },
  // Клетка 40 - ДЕНЬГИ (желтая)
  {
    id: 40,
    name: 'Кругосветное плавание на паруснике',
    description: 'Кругосветное путешествие на парусном судне.',
    type: 'money',
    cost: 200000,
    monthlyIncome: 0,
    category: 'money',
    color: '#FFD700', // Желтый
    icon: <MoneyIcon />
  },
  // Клетка 41 - ДЕНЬГИ (желтая)
  {
    id: 41,
    name: '',
    description: '',
    type: 'money',
    cost: 0,
    monthlyIncome: 0,
    category: 'money',
    color: '#FFD700', // Желтый
    icon: <MoneyIcon />
  },
  // Клетка 42 - МЕЧТА (голубая)
  {
    id: 42,
    name: 'Белоснежная Яхта',
    description: 'Приобретение роскошной белоснежной яхты.',
    type: 'dream',
    cost: 300000,
    monthlyIncome: 0,
    category: 'dream',
    color: '#87CEEB', // Голубой
    icon: <TravelIcon />
  },
  // Клетка 43 - БИЗНЕС (зеленая)
  {
    id: 43,
    name: 'Пекарня с доставкой',
    description: 'Создание пекарни с услугой доставки.',
    type: 'business',
    cost: 300000,
    monthlyIncome: 7000,
    category: 'business',
    color: '#4CAF50', // Зеленый
    icon: <BakeryIcon />
  },
  // Клетка 44 - МЕЧТА (голубая)
  {
    id: 44,
    name: 'Организовать благотворительный фонд',
    description: 'Создание благотворительного фонда.',
    type: 'dream',
    cost: 200000,
    monthlyIncome: 0,
    category: 'dream',
    color: '#87CEEB', // Голубой
    icon: <CharityIcon />
  },
  // Клетка 45 - БИЗНЕС (зеленая)
  {
    id: 45,
    name: 'Онлайн-образовательная платформа',
    description: 'Создание платформы для онлайн-образования.',
    type: 'business',
    cost: 200000,
    monthlyIncome: 5000,
    category: 'business',
    color: '#4CAF50', // Зеленый
    icon: <SchoolIcon />
  },
  // Клетка 46 - МЕЧТА (голубая)
  {
    id: 46,
    name: 'Полёт в космос',
    description: 'Реализация мечты о космическом путешествии.',
    type: 'dream',
    cost: 250000,
    monthlyIncome: 0,
    category: 'dream',
    color: '#87CEEB', // Голубой
    icon: <TravelIcon />
  },
  // Клетка 47 - БИЗНЕС (зеленая)
  {
    id: 47,
    name: 'Сеть фитнес-студий',
    description: 'Создание сети фитнес-студий.',
    type: 'business',
    cost: 750000,
    monthlyIncome: 20000,
    category: 'business',
    color: '#4CAF50', // Зеленый
    icon: <GymIcon />
  },
  // Клетка 48 - МЕЧТА (голубая)
  {
    id: 48,
    name: 'Кругосветное путешествие',
    description: 'Путешествие вокруг света для изучения разных стран.',
    type: 'dream',
    cost: 300000,
    monthlyIncome: 0,
    category: 'dream',
    color: '#87CEEB', // Голубой
    icon: <TravelIcon />
  },
  // Клетка 49 - БИЗНЕС (зеленая)
  {
    id: 49,
    name: 'Коворкинг-пространство',
    description: 'Создание современного рабочего пространства.',
    type: 'business',
    cost: 500000,
    monthlyIncome: 10000,
    category: 'business',
    color: '#4CAF50', // Зеленый
    icon: <CoworkingIcon />
  }
];

// Объединяем все активы в один массив
export const ALL_FAST_TRACK_ASSETS = [
  ...FAST_TRACK_CELLS
];

// Функция для получения актива по ID
export const getFastTrackAssetById = (id) => {
  return ALL_FAST_TRACK_ASSETS.find(asset => asset.id === id);
};

// Функция для получения активов по типу
export const getFastTrackAssetsByType = (type) => {
  return ALL_FAST_TRACK_ASSETS.filter(asset => asset.type === type);
};

// Функция для получения активов по категории
export const getFastTrackAssetsByCategory = (category) => {
  return ALL_FAST_TRACK_ASSETS.filter(asset => asset.category === category);
};

// Функция для получения активов по цвету
export const getFastTrackAssetsByColor = (color) => {
  return ALL_FAST_TRACK_ASSETS.filter(asset => asset.color === color);
};


