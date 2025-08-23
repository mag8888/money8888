export const PROFESSIONS = [
  {
    id: 1,
    name: "Дворник",
    salary: 2000,
    expenses: 800,
    balance: 1000,
    description: "Работа по уборке территории"
  },
  {
    id: 2,
    name: "Курьер",
    salary: 2500,
    expenses: 900,
    balance: 1200,
    description: "Доставка товаров и документов"
  },
  {
    id: 3,
    name: "Продавец",
    salary: 3000,
    expenses: 1000,
    balance: 1500,
    description: "Работа в магазине"
  },
  {
    id: 4,
    name: "Водитель",
    salary: 3500,
    expenses: 1100,
    balance: 1800,
    description: "Управление транспортным средством"
  },
  {
    id: 5,
    name: "Официант",
    salary: 4000,
    expenses: 1200,
    balance: 2000,
    description: "Обслуживание в ресторане"
  },
  {
    id: 6,
    name: "Секретарь",
    salary: 4500,
    expenses: 1300,
    balance: 2200,
    description: "Административная работа"
  },
  {
    id: 7,
    name: "Учитель",
    salary: 5000,
    expenses: 1400,
    balance: 2500,
    description: "Преподавание в школе"
  },
  {
    id: 8,
    name: "Медсестра",
    salary: 5500,
    expenses: 1500,
    balance: 2800,
    description: "Медицинский персонал"
  },
  {
    id: 9,
    name: "Бухгалтер",
    salary: 6000,
    expenses: 1600,
    balance: 3000,
    description: "Ведение финансовой отчетности"
  },
  {
    id: 10,
    name: "Инженер",
    salary: 7000,
    expenses: 1800,
    balance: 3500,
    description: "Техническое проектирование"
  },
  {
    id: 11,
    name: "Врач",
    salary: 8000,
    expenses: 2000,
    balance: 4000,
    description: "Медицинская практика"
  },
  {
    id: 12,
    name: "Юрист",
    salary: 9000,
    expenses: 2200,
    balance: 4500,
    description: "Правовая консультация"
  },
  {
    id: 13,
    name: "Менеджер",
    salary: 10000,
    expenses: 2500,
    balance: 5000,
    description: "Управление командой"
  },
  {
    id: 14,
    name: "Директор",
    salary: 12000,
    expenses: 3000,
    balance: 6000,
    description: "Руководство компанией"
  },
  {
    id: 15,
    name: "Предприниматель",
    salary: 15000,
    expenses: 4000,
    balance: 7500,
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
