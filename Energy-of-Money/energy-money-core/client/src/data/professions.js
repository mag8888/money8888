export const PROFESSIONS = [
  {
    id: 1,
    name: "Уборщик",
    icon: "🧹",
    salary: 1800,
    passiveIncome: 0,
    dividends: 0,
    
    // Расходы (нельзя погасить)
    taxRate: 0.13,
    taxAmount: 234,
    otherExpenses: 270,
    
    // Кредиты (можно гасить)
    creditAuto: 0,
    creditEducation: 0,
    creditHousing: 0,
    creditCards: 0,
    
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
    
    // Расходы (нельзя погатить)
    taxRate: 0.13,
    taxAmount: 286,
    otherExpenses: 330,
    
    // Кредиты (можно гасить)
    creditAuto: 154,
    creditEducation: 0,
    creditHousing: 0,
    creditCards: 0,
    
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
    
    // Расходы (нельзя погатить)
    taxRate: 0.13,
    taxAmount: 364,
    otherExpenses: 420,
    
    // Кредиты (можно гасить)
    creditAuto: 196,
    creditEducation: 0,
    creditHousing: 0,
    creditCards: 0,
    
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
    
    // Расходы (нельзя погатить)
    taxRate: 0.13,
    taxAmount: 416,
    otherExpenses: 480,
    
    // Кредиты (можно гасить)
    creditAuto: 224,
    creditEducation: 0,
    creditHousing: 0,
    creditCards: 0,
    
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
  {
    id: 5,
    name: "Официант",
    icon: "🍽️",
    salary: 2500,
    passiveIncome: 0,
    dividends: 0,
    
    // Расходы (нельзя погатить)
    taxRate: 0.13,
    taxAmount: 325,
    otherExpenses: 375,
    
    // Кредиты (можно гасить)
    creditAuto: 175,
    creditEducation: 0,
    creditHousing: 0,
    creditCards: 0,
    
    // Итоговые расчеты
    totalIncome: 2500,
    totalExpenses: 875,
    cashFlow: 1625,
    
    // Баланс
    balance: 1800,
    description: "Обслуживание в ресторанах и кафе",
    difficulty: "easy",
    category: "service"
  },
  {
    id: 6,
    name: "Учитель",
    icon: "📚",
    salary: 3500,
    passiveIncome: 0,
    dividends: 0,
    
    // Расходы (нельзя погатить)
    taxRate: 0.13,
    taxAmount: 455,
    otherExpenses: 525,
    
    // Кредиты (можно гасить)
    creditAuto: 245,
    creditEducation: 0,
    creditHousing: 0,
    creditCards: 0,
    
    // Итоговые расчеты
    totalIncome: 3500,
    totalExpenses: 1225,
    cashFlow: 2275,
    
    // Баланс
    balance: 3000,
    description: "Преподавание в школе",
    difficulty: "medium",
    category: "education"
  },
  {
    id: 7,
    name: "Медсестра",
    icon: "🏥",
    salary: 4200,
    passiveIncome: 0,
    dividends: 0,
    
    // Расходы (нельзя погатить)
    taxRate: 0.13,
    taxAmount: 546,
    otherExpenses: 630,
    
    // Кредиты (можно гасить)
    creditAuto: 294,
    creditEducation: 0,
    creditHousing: 0,
    creditCards: 0,
    
    // Итоговые расчеты
    totalIncome: 4200,
    totalExpenses: 1470,
    cashFlow: 2730,
    
    // Баланс
    balance: 3500,
    description: "Медицинское обслуживание",
    difficulty: "medium",
    category: "healthcare"
  },
  {
    id: 8,
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
    creditEducation: 0,
    creditHousing: 0,
    creditCards: 0,
    
    // Итоговые расчеты
    totalIncome: 5500,
    totalExpenses: 1925,
    cashFlow: 3575,
    
    // Баланс
    balance: 4500,
    description: "Техническое проектирование и разработка",
    difficulty: "medium",
    category: "engineering"
  },
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
    creditEducation: 0,
    creditHousing: 0,
    creditCards: 0,
    
    // Итоговые расчеты
    totalIncome: 7500,
    totalExpenses: 2625,
    cashFlow: 4875,
    
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
    creditEducation: 0,
    creditHousing: 0,
    creditCards: 0,
    
    // Итоговые расчеты
    totalIncome: 6500,
    totalExpenses: 2275,
    cashFlow: 4225,
    
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
    creditEducation: 0,
    creditHousing: 0,
    creditCards: 0,
    
    // Итоговые расчеты
    totalIncome: 9200,
    totalExpenses: 2800,
    cashFlow: 6400,
    
    // Баланс
    balance: 7000,
    description: "Владелец малого бизнеса",
    difficulty: "hard",
    category: "business"
  },
  {
    id: 12,
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
    creditEducation: 0,
    creditHousing: 0,
    creditCards: 0,
    
    // Итоговые расчеты
    totalIncome: 6000,
    totalExpenses: 2100,
    cashFlow: 3900,
    
    // Баланс
    balance: 5000,
    description: "Разработка программного обеспечения",
    difficulty: "medium",
    category: "technology"
  },
  {
    id: 13,
    name: "Дизайнер",
    icon: "🎨",
    salary: 3800,
    passiveIncome: 0,
    dividends: 0,
    
    // Расходы (нельзя погатить)
    taxRate: 0.13,
    taxAmount: 494,
    otherExpenses: 570,
    
    // Кредиты (можно гасить)
    creditAuto: 266,
    creditEducation: 0,
    creditHousing: 0,
    creditCards: 0,
    
    // Итоговые расчеты
    totalIncome: 3800,
    totalExpenses: 1330,
    cashFlow: 2470,
    
    // Баланс
    balance: 3000,
    description: "Графический и веб-дизайн",
    difficulty: "medium",
    category: "creative"
  },
  {
    id: 14,
    name: "Маркетолог",
    icon: "📊",
    salary: 4500,
    passiveIncome: 0,
    dividends: 0,
    
    // Расходы (нельзя погатить)
    taxRate: 0.13,
    taxAmount: 585,
    otherExpenses: 675,
    
    // Кредиты (можно гасить)
    creditAuto: 315,
    creditEducation: 0,
    creditHousing: 0,
    creditCards: 0,
    
    // Итоговые расчеты
    totalIncome: 4500,
    totalExpenses: 1575,
    cashFlow: 2925,
    
    // Баланс
    balance: 4000,
    description: "Маркетинговые стратегии и реклама",
    difficulty: "medium",
    category: "marketing"
  },
  {
    id: 15,
    name: "Бухгалтер",
    icon: "📋",
    salary: 4000,
    passiveIncome: 0,
    dividends: 0,
    
    // Расходы (нельзя погатить)
    taxRate: 0.13,
    taxAmount: 520,
    otherExpenses: 600,
    
    // Кредиты (можно гасить)
    creditAuto: 280,
    creditEducation: 0,
    creditHousing: 0,
    creditCards: 0,
    
    // Итоговые расчеты
    totalIncome: 4000,
    totalExpenses: 1400,
    cashFlow: 2600,
    
    // Баланс
    balance: 3500,
    description: "Ведение бухгалтерского учета",
    difficulty: "medium",
    category: "finance"
  },
  {
    id: 16,
    name: "Пилот",
    icon: "✈️",
    salary: 9000,
    passiveIncome: 0,
    dividends: 0,
    
    // Расходы (нельзя погатить)
    taxRate: 0.13,
    taxAmount: 1170,
    otherExpenses: 1350,
    
    // Кредиты (можно гасить)
    creditAuto: 630,
    creditEducation: 0,
    creditHousing: 0,
    creditCards: 0,
    
    // Итоговые расчеты
    totalIncome: 9000,
    totalExpenses: 3150,
    cashFlow: 5850,
    
    // Баланс
    balance: 8000,
    description: "Управление воздушными судами",
    difficulty: "hard",
    category: "aviation"
  },
  {
    id: 17,
    name: "Архитектор",
    icon: "🏗️",
    salary: 5200,
    passiveIncome: 0,
    dividends: 0,
    
    // Расходы (нельзя погатить)
    taxRate: 0.13,
    taxAmount: 676,
    otherExpenses: 780,
    
    // Кредиты (можно гасить)
    creditAuto: 364,
    creditEducation: 0,
    creditHousing: 0,
    creditCards: 0,
    
    // Итоговые расчеты
    totalIncome: 5200,
    totalExpenses: 1820,
    cashFlow: 3380,
    
    // Баланс
    balance: 4500,
    description: "Проектирование зданий и сооружений",
    difficulty: "hard",
    category: "architecture"
  },
  {
    id: 18,
    name: "Психолог",
    icon: "🧠",
    salary: 4800,
    passiveIncome: 0,
    dividends: 0,
    
    // Расходы (нельзя погатить)
    taxRate: 0.13,
    taxAmount: 624,
    otherExpenses: 720,
    
    // Кредиты (можно гасить)
    creditAuto: 336,
    creditEducation: 0,
    creditHousing: 0,
    creditCards: 0,
    
    // Итоговые расчеты
    totalIncome: 4800,
    totalExpenses: 1680,
    cashFlow: 3120,
    
    // Баланс
    balance: 4000,
    description: "Психологическое консультирование",
    difficulty: "medium",
    category: "healthcare"
  },
  {
    id: 19,
    name: "Фотограф",
    icon: "📸",
    salary: 3200,
    passiveIncome: 0,
    dividends: 0,
    
    // Расходы (нельзя погатить)
    taxRate: 0.13,
    taxAmount: 416,
    otherExpenses: 480,
    
    // Кредиты (можно гасить)
    creditAuto: 224,
    creditEducation: 0,
    creditHousing: 0,
    creditCards: 0,
    
    // Итоговые расчеты
    totalIncome: 3200,
    totalExpenses: 1120,
    cashFlow: 2080,
    
    // Баланс
    balance: 2500,
    description: "Профессиональная фотография",
    difficulty: "medium",
    category: "creative"
  },
  {
    id: 20,
    name: "Предприниматель",
    icon: "🚀",
    salary: 10000,
    passiveIncome: 1200,
    dividends: 600,
    
    // Расходы (нельзя погатить)
    taxRate: 0.13,
    taxAmount: 1300,
    otherExpenses: 1500,
    
    // Кредиты (можно гасить)
    creditAuto: 700,
    creditEducation: 0,
    creditHousing: 0,
    creditCards: 0,
    
    // Итоговые расчеты
    totalIncome: 11800,
    totalExpenses: 3500,
    cashFlow: 8300,
    
    // Баланс
    balance: 10000,
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
