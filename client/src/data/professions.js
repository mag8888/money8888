export const PROFESSIONS = [
  {
    id: 1,
    name: "Дворник",
    salary: 2000,
    expenses: 800,
    balance: 1000,
    passiveIncome: 0,
    description: "Работа по уборке территории",
    charity: false
  },
  {
    id: 2,
    name: "Курьер",
    salary: 2500,
    expenses: 900,
    balance: 1200,
    passiveIncome: 0,
    description: "Доставка товаров и документов",
    charity: false
  },
  {
    id: 3,
    name: "Продавец",
    salary: 3000,
    expenses: 1000,
    balance: 1500,
    passiveIncome: 0,
    description: "Работа в магазине",
    charity: false
  },
  {
    id: 4,
    name: "Водитель",
    salary: 3500,
    expenses: 1100,
    balance: 1800,
    passiveIncome: 0,
    description: "Управление транспортным средством",
    charity: false
  },
  {
    id: 5,
    name: "Официант",
    salary: 4000,
    expenses: 1200,
    balance: 2000,
    passiveIncome: 0,
    description: "Обслуживание в ресторане",
    charity: false
  },
  {
    id: 6,
    name: "Секретарь",
    salary: 4500,
    expenses: 1300,
    balance: 2200,
    passiveIncome: 0,
    description: "Административная работа",
    charity: false
  },
  {
    id: 7,
    name: "Учитель",
    salary: 5000,
    expenses: 1400,
    balance: 2500,
    passiveIncome: 0,
    description: "Преподавание в школе",
    charity: false
  },
  {
    id: 8,
    name: "Медсестра",
    salary: 5500,
    expenses: 1500,
    balance: 2800,
    passiveIncome: 0,
    description: "Медицинский персонал",
    charity: false
  },
  {
    id: 9,
    name: "Бухгалтер",
    salary: 6000,
    expenses: 1600,
    balance: 3000,
    passiveIncome: 0,
    description: "Ведение финансовой отчетности",
    charity: false
  },
  {
    id: 10,
    name: "Инженер",
    salary: 7000,
    expenses: 1800,
    balance: 3500,
    passiveIncome: 0,
    description: "Техническое проектирование",
    charity: false
  },
  {
    id: 11,
    name: "Врач",
    salary: 8000,
    expenses: 2000,
    balance: 4000,
    passiveIncome: 0,
    description: "Медицинская практика",
    charity: false
  },
  {
    id: 12,
    name: "Юрист",
    salary: 9000,
    expenses: 2200,
    balance: 4500,
    passiveIncome: 0,
    description: "Правовая консультация",
    charity: false
  },
  {
    id: 13,
    name: "Менеджер",
    salary: 10000,
    expenses: 2500,
    balance: 5000,
    passiveIncome: 0,
    description: "Управление командой",
    charity: false
  },
  {
    id: 14,
    name: "Директор",
    salary: 12000,
    expenses: 3000,
    balance: 6000,
    passiveIncome: 0,
    description: "Руководство компанией",
    charity: false
  },
  {
    id: 15,
    name: "Предприниматель",
    salary: 15000,
    expenses: 4000,
    balance: 7500,
    passiveIncome: 0,
    description: "Владелец бизнеса",
    charity: false
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
