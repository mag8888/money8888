export const PROFESSIONS = [
  {
    id: 1,
    name: "Дворник",
    // Доходы
    salary: 2000, // Зарплата (основной доход)
    passiveIncome: 0, // Пассивный доход
    dividends: 0, // Дивиденды от бизнеса/акций/недвижимости
    
    // Расходы (нельзя погасить)
    taxRate: 0.25, // Налоговая ставка 25%
    taxAmount: 500, // Налоги (25% от зарплаты)
    otherExpenses: 300, // Прочие расходы 10-15%
    
    // Кредиты (можно гасить)
    creditAuto: 150, // Кредит на авто (5-7% от зарплаты)
    creditEducation: 0, // Кредит на образование
    creditHousing: 0, // Кредит на жилье
    creditCards: 0, // Кредиты по картам
    
    // Итоговые расчеты
    totalIncome: 2000, // Общий доход (зарплата + пассивный + дивиденды)
    totalExpenses: 950, // Общие расходы (налоги + прочие + кредиты)
    cashFlow: 1050, // Денежный поток (доход - расходы)
    
    // Баланс
    balance: 1000,
    description: "Работа по уборке территории"
  },
  {
    id: 2,
    name: "Курьер",
    // Доходы
    salary: 2500,
    passiveIncome: 0,
    dividends: 0,
    
    // Расходы (нельзя погасить)
    taxRate: 0.25,
    taxAmount: 625,
    otherExpenses: 375,
    
    // Кредиты (можно гасить)
    creditAuto: 175,
    creditEducation: 0,
    creditHousing: 0,
    creditCards: 0,
    
    // Итоговые расчеты
    totalIncome: 2500,
    totalExpenses: 1175,
    cashFlow: 1325,
    
    // Баланс
    balance: 2500,
    description: "Доставка товаров и документов"
  },
  {
    id: 3,
    name: "Продавец",
    // Доходы
    salary: 3000,
    passiveIncome: 0,
    dividends: 0,
    
    // Расходы (нельзя погасить)
    taxRate: 0.25,
    taxAmount: 750,
    otherExpenses: 450,
    
    // Кредиты (можно гасить)
    creditAuto: 210,
    creditEducation: 0,
    creditHousing: 0,
    creditCards: 0,
    
    // Итоговые расчеты
    totalIncome: 3000,
    totalExpenses: 1410,
    cashFlow: 1590,
    
    // Баланс
    balance: 3000,
    description: "Работа в торговле"
  },
  {
    id: 4,
    name: "Водитель",
    // Доходы
    salary: 3500,
    passiveIncome: 0,
    dividends: 0,
    
    // Расходы (нельзя погасить)
    taxRate: 0.25,
    taxAmount: 875,
    otherExpenses: 525,
    
    // Кредиты (можно гасить)
    creditAuto: 245,
    creditEducation: 0,
    creditHousing: 0,
    creditCards: 0,
    
    // Итоговые расчеты
    totalIncome: 3500,
    totalExpenses: 1645,
    cashFlow: 1855,
    
    // Баланс
    balance: 3500,
    description: "Управление транспортными средствами"
  },
  {
    id: 5,
    name: "Официант",
    // Доходы
    salary: 4000,
    passiveIncome: 0,
    dividends: 0,
    
    // Расходы (нельзя погасить)
    taxRate: 0.25,
    taxAmount: 1000,
    otherExpenses: 600,
    
    // Кредиты (можно гасить)
    creditAuto: 280,
    creditEducation: 0,
    creditHousing: 0,
    creditCards: 0,
    
    // Итоговые расчеты
    totalIncome: 4000,
    totalExpenses: 1880,
    cashFlow: 2120,
    
    // Баланс
    balance: 4000,
    description: "Обслуживание в ресторане"
  },
  {
    id: 6,
    name: "Учитель",
    // Доходы
    salary: 5000,
    passiveIncome: 0,
    dividends: 0,
    
    // Расходы (нельзя погасить)
    taxRate: 0.25,
    taxAmount: 1250,
    otherExpenses: 750,
    
    // Кредиты (можно гасить)
    creditAuto: 350,
    creditEducation: 0,
    creditHousing: 0,
    creditCards: 0,
    
    // Итоговые расчеты
    totalIncome: 5000,
    totalExpenses: 2350,
    cashFlow: 2650,
    
    // Баланс
    balance: 5000,
    description: "Преподавание в школе"
  },
  {
    id: 7,
    name: "Медсестра",
    // Доходы
    salary: 6000,
    passiveIncome: 0,
    dividends: 0,
    
    // Расходы (нельзя погасить)
    taxRate: 0.25,
    taxAmount: 1500,
    otherExpenses: 900,
    
    // Кредиты (можно гасить)
    creditAuto: 420,
    creditEducation: 0,
    creditHousing: 0,
    creditCards: 0,
    
    // Итоговые расчеты
    totalIncome: 6000,
    totalExpenses: 2820,
    cashFlow: 3180,
    
    // Баланс
    balance: 6000,
    description: "Медицинское обслуживание"
  },
  {
    id: 8,
    name: "Инженер",
    // Доходы
    salary: 8000,
    passiveIncome: 0,
    dividends: 0,
    
    // Расходы (нельзя погасить)
    taxRate: 0.25,
    taxAmount: 2000,
    otherExpenses: 1200,
    
    // Кредиты (можно гасить)
    creditAuto: 560,
    creditEducation: 0,
    creditHousing: 0,
    creditCards: 0,
    
    // Итоговые расчеты
    totalIncome: 8000,
    totalExpenses: 3760,
    cashFlow: 4240,
    
    // Баланс
    balance: 8000,
    description: "Техническое проектирование"
  },
  {
    id: 9,
    name: "Врач",
    // Доходы
    salary: 10000,
    passiveIncome: 0,
    dividends: 0,
    
    // Расходы (нельзя погасить)
    taxRate: 0.25,
    taxAmount: 2500,
    otherExpenses: 1500,
    
    // Кредиты (можно гасить)
    creditAuto: 700,
    creditEducation: 0,
    creditHousing: 0,
    creditCards: 0,
    
    // Итоговые расчеты
    totalIncome: 10000,
    totalExpenses: 4700,
    cashFlow: 5300,
    
    // Баланс
    balance: 10000,
    description: "Медицинская практика"
  },
  {
    id: 10,
    name: "Бизнесмен",
    // Доходы
    salary: 12000,
    passiveIncome: 1000, // Пассивный доход от бизнеса
    dividends: 500, // Дивиденды от акций
    
    // Расходы (нельзя погасить)
    taxRate: 0.25,
    taxAmount: 3000,
    otherExpenses: 1800,
    
    // Кредиты (можно гасить)
    creditAuto: 840,
    creditEducation: 0,
    creditHousing: 0,
    creditCards: 0,
    
    // Итоговые расчеты
    totalIncome: 13500, // 12000 + 1000 + 500
    totalExpenses: 5640,
    cashFlow: 7860,
    
    // Баланс
    balance: 12000,
    description: "Владелец бизнеса"
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
