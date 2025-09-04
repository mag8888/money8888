export const PROFESSIONS = [
  // ЛЕГКИЕ ПРОФЕССИИ (4 карточки)
  {
    id: 1,
    name: "Уборщик",
    icon: "🧹",
    salary: 1800,
    passiveIncome: 0,
    dividends: 0,
    
    // Расходы (нельзя погатить)
    taxRate: 0.13,
    taxAmount: 234,
    otherExpenses: 270,
    
    // Кредиты (можно гасить)
    creditAuto: 0,
    creditEducation: 0,
    creditHousing: 0,
    creditCards: 0,
    
    // Расходы на ребенка (когда появится)
    childExpenses: 0,
    
    // Бонусы для маленьких профессий
    bonusCards: 2, // +2 карты возможности
    
    // Итоговые расчеты
    totalIncome: 1800,
    totalExpenses: 504,
    cashFlow: 1296,
    
    // Баланс
    balance: 1000,
    description: "Уборка помещений и территорий",
    difficulty: "easy",
    category: "service"
  },
  {
    id: 2,
    name: "Курьер",
    icon: "🚚",
    salary: 2200,
    passiveIncome: 0,
    dividends: 0,
    
    // Расходы (нельзя погасить)
    taxRate: 0.13,
    taxAmount: 286,
    otherExpenses: 330,
    
    // Кредиты (можно гасить)
    creditAuto: 154,
    creditEducation: 0,
    creditHousing: 0,
    creditCards: 0,
    
    // Расходы на ребенка (когда появится)
    childExpenses: 0,
    
    // Бонусы для маленьких профессий
    bonusCards: 1, // +1 карта возможности
    
    // Итоговые расчеты
    totalIncome: 2200,
    totalExpenses: 770,
    cashFlow: 1430,
    
    // Баланс
    balance: 1500,
    description: "Доставка товаров и документов",
    difficulty: "easy",
    category: "service"
  },
  {
    id: 3,
    name: "Продавец",
    icon: "🛍️",
    salary: 2800,
    passiveIncome: 0,
    dividends: 0,
    
    // Расходы (нельзя погасить)
    taxRate: 0.13,
    taxAmount: 364,
    otherExpenses: 420,
    
    // Кредиты (можно гасить)
    creditAuto: 196,
    creditEducation: 0,
    creditHousing: 0,
    creditCards: 0,
    
    // Расходы на ребенка (когда появится)
    childExpenses: 0,
    
    // Бонусы для маленьких профессий
    bonusCards: 1, // +1 карта возможности
    
    // Итоговые расчеты
    totalIncome: 2800,
    totalExpenses: 980,
    cashFlow: 1820,
    
    // Баланс
    balance: 2000,
    description: "Работа в торговле и розничных продажах",
    difficulty: "easy",
    category: "sales"
  },
  {
    id: 4,
    name: "Водитель",
    icon: "🚗",
    salary: 3200,
    passiveIncome: 0,
    dividends: 0,
    
    // Расходы (нельзя погасить)
    taxRate: 0.13,
    taxAmount: 416,
    otherExpenses: 480,
    
    // Кредиты (можно гасить)
    creditAuto: 224,
    creditEducation: 0,
    creditHousing: 0,
    creditCards: 0,
    
    // Расходы на ребенка (когда появится)
    childExpenses: 0,
    
    // Бонусы для маленьких профессий
    bonusCards: 1, // +1 карта возможности
    
    // Итоговые расчеты
    totalIncome: 3200,
    totalExpenses: 1120,
    cashFlow: 2080,
    
    // Баланс
    balance: 2500,
    description: "Управление транспортными средствами",
    difficulty: "easy",
    category: "transport"
  },

  // СРЕДНИЕ ПРОФЕССИИ (4 карточки)
  {
    id: 5,
    name: "Учитель",
    icon: "📚",
    salary: 3500,
    passiveIncome: 0,
    dividends: 0,
    
    // Расходы (нельзя погасить)
    taxRate: 0.13,
    taxAmount: 455,
    otherExpenses: 525,
    
    // Кредиты (можно гасить)
    creditAuto: 245,
    creditEducation: 175,
    creditHousing: 0,
    creditCards: 0,
    
    // Расходы на ребенка (когда появится)
    childExpenses: 200,
    
    // Итоговые расчеты
    totalIncome: 3500,
    totalExpenses: 1600,
    cashFlow: 1900,
    
    // Баланс
    balance: 3000,
    description: "Преподавание в школе",
    difficulty: "medium",
    category: "education"
  },
  {
    id: 6,
    name: "Медсестра",
    icon: "🏥",
    salary: 4200,
    passiveIncome: 0,
    dividends: 0,
    
    // Расходы (нельзя погасить)
    taxRate: 0.13,
    taxAmount: 546,
    otherExpenses: 630,
    
    // Кредиты (можно гасить)
    creditAuto: 294,
    creditEducation: 210,
    creditHousing: 0,
    creditCards: 0,
    
    // Расходы на ребенка (когда появится)
    childExpenses: 250,
    
    // Итоговые расчеты
    totalIncome: 4200,
    totalExpenses: 1930,
    cashFlow: 2270,
    
    // Баланс
    balance: 3500,
    description: "Медицинское обслуживание",
    difficulty: "medium",
    category: "healthcare"
  },
  {
    id: 7,
    name: "Инженер",
    icon: "⚙️",
    salary: 5500,
    passiveIncome: 0,
    dividends: 0,
    
    // Расходы (нельзя погатить)
    taxRate: 0.13,
    taxAmount: 715,
    otherExpenses: 825,
    
    // Кредиты (можно гасить)
    creditAuto: 385,
    creditEducation: 275,
    creditHousing: 0,
    creditCards: 0,
    
    // Расходы на ребенка (когда появится)
    childExpenses: 300,
    
    // Итоговые расчеты
    totalIncome: 5500,
    totalExpenses: 2500,
    cashFlow: 3000,
    
    // Баланс
    balance: 4500,
    description: "Техническое проектирование и разработка",
    difficulty: "medium",
    category: "engineering"
  },
  {
    id: 8,
    name: "IT-разработчик",
    icon: "💻",
    salary: 6000,
    passiveIncome: 0,
    dividends: 0,
    
    // Расходы (нельзя погатить)
    taxRate: 0.13,
    taxAmount: 780,
    otherExpenses: 900,
    
    // Кредиты (можно гасить)
    creditAuto: 420,
    creditEducation: 300,
    creditHousing: 0,
    creditCards: 0,
    
    // Расходы на ребенка (когда появится)
    childExpenses: 350,
    
    // Итоговые расчеты
    totalIncome: 6000,
    totalExpenses: 2750,
    cashFlow: 3250,
    
    // Баланс
    balance: 5000,
    description: "Разработка программного обеспечения",
    difficulty: "medium",
    category: "technology"
  },

  // СЛОЖНЫЕ ПРОФЕССИИ (4 карточки)
  {
    id: 9,
    name: "Врач",
    icon: "👨‍⚕️",
    salary: 7500,
    passiveIncome: 0,
    dividends: 0,
    
    // Расходы (нельзя погатить)
    taxRate: 0.13,
    taxAmount: 975,
    otherExpenses: 1125,
    
    // Кредиты (можно гасить)
    creditAuto: 525,
    creditEducation: 375,
    creditHousing: 0,
    creditCards: 0,
    
    // Расходы на ребенка (когда появится)
    childExpenses: 400,
    
    // Итоговые расчеты
    totalIncome: 7500,
    totalExpenses: 3400,
    cashFlow: 4100,
    
    // Баланс
    balance: 6000,
    description: "Медицинская практика",
    difficulty: "hard",
    category: "healthcare"
  },
  {
    id: 10,
    name: "Юрист",
    icon: "⚖️",
    salary: 6500,
    passiveIncome: 0,
    dividends: 0,
    
    // Расходы (нельзя погатить)
    taxRate: 0.13,
    taxAmount: 845,
    otherExpenses: 975,
    
    // Кредиты (можно гасить)
    creditAuto: 455,
    creditEducation: 325,
    creditHousing: 0,
    creditCards: 0,
    
    // Расходы на ребенка (когда появится)
    childExpenses: 400,
    
    // Итоговые расчеты
    totalIncome: 6500,
    totalExpenses: 3055,
    cashFlow: 3445,
    
    // Баланс
    balance: 5000,
    description: "Юридические услуги и консультации",
    difficulty: "hard",
    category: "legal"
  },
  {
    id: 11,
    name: "Бизнесмен",
    icon: "💼",
    salary: 8000,
    passiveIncome: 800,
    dividends: 400,
    
    // Расходы (нельзя погатить)
    taxRate: 0.13,
    taxAmount: 1040,
    otherExpenses: 1200,
    
    // Кредиты (можно гасить)
    creditAuto: 560,
    creditEducation: 400,
    creditHousing: 0,
    creditCards: 0,
    
    // Расходы на ребенка (когда появится)
    childExpenses: 400,
    
    // Итоговые расчеты
    totalIncome: 9200,
    totalExpenses: 3600,
    cashFlow: 5600,
    
    // Баланс
    balance: 7000,
    description: "Владелец малого бизнеса",
    difficulty: "hard",
    category: "business"
  },
  {
    id: 12,
    name: "Предприниматель",
    icon: "🚀",
    salary: 10000,
    passiveIncome: 0,
    dividends: 0,
    
    // Расходы (нельзя погатить)
    taxRate: 0.13,
    taxAmount: 1300,
    otherExpenses: 1500,
    
    // Кредиты (можно гасить)
    creditAuto: 700,
    creditEducation: 500,
    creditHousing: 1200,
    creditCards: 1000,
    
    // Расходы на ребенка (когда появится)
    childExpenses: 400,
    
    // Итоговые расчеты
    totalIncome: 10000,
    totalExpenses: 6200,
    cashFlow: 3800,
    
    // Баланс
    balance: 3000,
    description: "Владелец успешного бизнеса",
    difficulty: "hard",
    category: "business"
  }
];

// Функция для автоматического выбора случайной профессии
export const getRandomProfession = () => {
  const randomIndex = Math.floor(Math.random() * PROFESSIONS.length);
  return PROFESSIONS[randomIndex];
};

// Функция для получения профессии по ID
export const getProfessionById = (id) => {
  return PROFESSIONS.find(profession => profession.id === id);
};

// Функция для получения профессий по сложности
export const getProfessionsByDifficulty = (difficulty) => {
  return PROFESSIONS.filter(profession => profession.difficulty === difficulty);
};

// Функция для получения профессий по категории
export const getProfessionsByCategory = (category) => {
  return PROFESSIONS.filter(profession => profession.category === category);
};

// Функция для покупки благотворительности
export const buyCharity = (profession) => {
  if (profession && !profession.charity) {
    return {
      ...profession,
      charity: true
    };
  }
  return profession;
};

// Функция для расчета чистого дохода
export const calculateNetIncome = (profession) => {
  return profession.totalIncome - profession.totalExpenses;
};

// Функция для получения топ профессий по доходу
export const getTopProfessionsByIncome = (limit = 5) => {
  return PROFESSIONS
    .sort((a, b) => b.salary - a.salary)
    .slice(0, limit);
};

// Функция для получения топ профессий по денежному потоку
export const getTopProfessionsByCashFlow = (limit = 5) => {
  return PROFESSIONS
    .sort((a, b) => b.cashFlow - a.cashFlow)
    .slice(0, limit);
};