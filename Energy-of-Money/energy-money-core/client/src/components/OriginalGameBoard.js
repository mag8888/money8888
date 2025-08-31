import React, { useState, useEffect, Fragment } from 'react';
import { Box, Typography, Button, LinearProgress, Avatar, Chip, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, List, ListItem, ListItemText, Divider, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import FullProfessionCard from './FullProfessionCard';
import { 
  Timer, 
  ExitToApp,
  AccountBalance,
  Inventory,
  Group
} from '@mui/icons-material';

const OriginalGameBoard = ({ roomId, playerData, onExit }) => {
  console.log('🎮 [OriginalGameBoard] Компонент загружен:', { roomId, playerData });
  console.log('🎮 [OriginalGameBoard] Компонент обновлен - добавляем отладочную информацию');
  
  // CSS стили для анимаций
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);


  
  const [originalBoard] = useState(() => {
    // Создаем 76 клеток: 24 внутренних + 52 внешних
    const cells = [];
    
    // 24 внутренние клетки с детальной раскладкой
    const innerCells = [
      { id: 1, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯', description: 'Малая / большая сделка (на выбор)' },
      { id: 2, type: 'expenses', name: 'Всякая всячина', color: '#EC4899', icon: '🛍️', description: 'Обязательные траты от 100 до 4000$ на разные нужды (чайник, кофе, машина, ТВ, прочее)' },
      { id: 3, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯', description: 'Малая / большая сделка (на выбор)' },
      { id: 4, type: 'charity', name: 'Благотворительность', color: '#F97316', icon: '❤️', description: 'Пожертвовать деньги для получения возможности бросать 2 кубика (10% от дохода игрока, можно отказаться)' },
      { id: 5, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯', description: 'Малая / большая сделка (на выбор)' },
      { id: 6, type: 'payday', name: 'PayDay', color: '#EAB308', icon: '💰', description: 'Получить зарплату' },
      { id: 7, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯', description: 'Малая / большая сделка (на выбор)' },
      { id: 8, type: 'market', name: 'Рынок', color: '#06B6D4', icon: '🏪', description: 'Появляются покупатели на разные активы' },
      { id: 9, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯', description: 'Малая / большая сделка (на выбор)' },
      { id: 10, type: 'expenses', name: 'Всякая всячина', color: '#EC4899', icon: '🛍️', description: 'Обязательные траты от 100 до 4000$ на разные нужды (чайник, кофе, машина, ТВ, прочее)' },
      { id: 11, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯', description: 'Малая / большая сделка (на выбор)' },
      { id: 12, type: 'child', name: 'Ребенок', color: '#A855F7', icon: '👶', description: 'Родился ребенок, увеличиваются ежемесячные расходы' },
      { id: 13, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯', description: 'Малая / большая сделка (на выбор)' },
      { id: 14, type: 'payday', name: 'PayDay', color: '#EAB308', icon: '💰', description: 'Получить зарплату' },
      { id: 15, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯', description: 'Малая / большая сделка (на выбор)' },
      { id: 16, type: 'market', name: 'Рынок', color: '#06B6D4', icon: '🏪', description: 'Появляются покупатели на разные активы' },
      { id: 17, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯', description: 'Малая / большая сделка (на выбор)' },
      { id: 18, type: 'expenses', name: 'Всякая всячина', color: '#EC4899', icon: '🛍️', description: 'Обязательные траты от 100 до 4000$ на разные нужды (чайник, кофе, машина, ТВ, прочее)' },
      { id: 19, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯', description: 'Малая / большая сделка (на выбор)' },
      { id: 20, type: 'loss', name: 'Потеря', color: '#18181B', icon: '💸', description: 'Потеря денег (увольнение) - оплатите один раз расходы и пропустите 2 хода или 3 раза расходы без пропуска хода' },
      { id: 21, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯', description: 'Малая / большая сделка (на выбор)' },
      { id: 22, type: 'payday', name: 'PayDay', color: '#EAB308', icon: '💰', description: 'Получить зарплату' },
      { id: 23, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯', description: 'Малая / большая сделка (на выбор)' },
      { id: 24, type: 'market', name: 'Рынок', color: '#06B6D4', icon: '🏪', description: 'Появляются покупатели на разные активы' }
    ];
    
    // Добавляем внутренние клетки
    cells.push(...innerCells);
    
    // 52 внешние клетки с детальной раскладкой
    const outerCells = [
      { id: 25, type: 'money', name: 'Доход от инвестиций', color: '#EAB308', icon: '$', description: 'Ваши инвестиции приносят доход', cost: 0, income: 0 },
      { id: 26, type: 'dream', name: 'Дом мечты', color: '#EC4899', icon: '🏠', description: 'Построить дом мечты для семьи', cost: 100000, income: 0 },
      { id: 27, type: 'business', name: 'Кофейня', color: '#10B981', icon: '☕', description: 'Кофейня в центре города', cost: 100000, income: 3000 },
      { id: 28, type: 'loss', name: 'Аудит', color: '#EF4444', icon: '📋', description: 'Аудит - потеря 50% активов', cost: 0, income: 0 },
      { id: 29, type: 'business', name: 'Центр здоровья', color: '#10B981', icon: '💆', description: 'Центр здоровья и спа', cost: 270000, income: 5000 },
      { id: 30, type: 'dream', name: 'Антарктида', color: '#EC4899', icon: '🧊', description: 'Посетить Антарктиду', cost: 150000, income: 0 },
      { id: 31, type: 'business', name: 'Мобильное приложение', color: '#10B981', icon: '📱', description: 'Мобильное приложение (подписка)', cost: 420000, income: 10000 },
      { id: 32, type: 'charity', name: 'Благотворительность', color: '#F97316', icon: '❤️', description: 'Благотворительность', cost: 0, income: 0 },
      { id: 33, type: 'business', name: 'Цифровой маркетинг', color: '#3B82F6', icon: '📊', description: 'Агентство цифрового маркетинга', cost: 160000, income: 4000 },
      { id: 34, type: 'loss', name: 'Кража', color: '#EF4444', icon: '🦹', description: 'Кража 100% наличных', cost: 0, income: 0 },
      { id: 35, type: 'business', name: 'Мини-отель', color: '#3B82F6', icon: '🏨', description: 'Мини-отель/бутик-гостиница', cost: 200000, income: 5000 },
      { id: 36, type: 'dream', name: 'Высочайшие вершины', color: '#EC4899', icon: '🏔️', description: 'Подняться на все высочайшие вершины мира', cost: 500000, income: 0 },
      { id: 37, type: 'business', name: 'Франшиза ресторана', color: '#3B82F6', icon: '🍽️', description: 'Франшиза популярного ресторана', cost: 320000, income: 8000 },
      { id: 38, type: 'money', name: 'Доход от инвестиций', color: '#EAB308', icon: '$', description: 'Ваши инвестиции приносят доход', cost: 0, income: 0 },
      { id: 39, type: 'business', name: 'Мини-отель', color: '#3B82F6', icon: '🏨', description: 'Мини-отель/бутик-гостиница', cost: 200000, income: 4000 },
      { id: 40, type: 'dream', name: 'Книга-бестселлер', color: '#EC4899', icon: '📚', description: 'Стать автором книги-бестселлера', cost: 300000, income: 0 },
      { id: 41, type: 'business', name: 'Йога-центр', color: '#3B82F6', icon: '🧘', description: 'Йога- и медитационный центр', cost: 170000, income: 4500 },
      { id: 42, type: 'loss', name: 'Развод', color: '#EF4444', icon: '💔', description: 'Развод - потеря 50% активов', cost: 0, income: 0 },
      { id: 43, type: 'business', name: 'Автомойки', color: '#3B82F6', icon: '🚗', description: 'Сеть автомоек самообслуживания', cost: 120000, income: 3000 },
      { id: 44, type: 'dream', name: 'Яхта в Средиземном море', color: '#F59E0B', icon: '⛵', description: 'Жить год на яхте в Средиземном море', cost: 300000, income: 0 },
      { id: 45, type: 'business', name: 'Салон красоты', color: '#3B82F6', icon: '💇', description: 'Салон красоты/барбершоп', cost: 500000, income: 15000 },
      { id: 46, type: 'dream', name: 'Фонд поддержки', color: '#F59E0B', icon: '🎭', description: 'Создать фонд поддержки талантов', cost: 300000, income: 0 },
      { id: 47, type: 'business', name: 'Онлайн-магазин', color: '#3B82F6', icon: '🛍️', description: 'Онлайн-магазин одежды', cost: 110000, income: 3000 },
      { id: 48, type: 'dream', name: 'Мировой фестиваль', color: '#F59E0B', icon: '🎪', description: 'Организовать мировой фестиваль', cost: 200000, income: 0 },
      { id: 49, type: 'loss', name: 'Пожар', color: '#EF4444', icon: '🔥', description: 'Пожар (вы теряете бизнес с мин доходом)', cost: 0, income: 0 },
      { id: 50, type: 'dream', name: 'Ретрит-центр', color: '#F59E0B', icon: '🏕️', description: 'Построить ретрит-центр', cost: 500000, income: 0 },
      { id: 51, type: 'money', name: 'Доход от инвестиций', color: '#EAB308', icon: '$', description: 'Ваши инвестиции приносят доход', cost: 0, income: 0 },
      { id: 52, type: 'dream', name: 'Кругосветное плавание', color: '#F59E0B', icon: '🌊', description: 'Кругосветное плавание на паруснике', cost: 200000, income: 0 },
      { id: 53, type: 'business', name: 'Эко-ранчо', color: '#3B82F6', icon: '🌿', description: 'Туристический комплекс (эко-ранчо)', cost: 1000000, income: 20000 },
      { id: 54, type: 'dream', name: 'Кругосветное плавание', color: '#F59E0B', icon: '🌊', description: 'Кругосветное плавание на паруснике', cost: 300000, income: 0 },
      { id: 55, type: 'business', name: 'Биржа', color: '#3B82F6', icon: '📈', description: 'Биржа (Разово выплачивается 500 000$ если выпало 5 или 6 на кубике)', cost: 50000, income: 500000 },
      { id: 56, type: 'dream', name: 'Частный самолёт', color: '#F59E0B', icon: '✈️', description: 'Купить частный самолёт', cost: 1000000, income: 0 },
      { id: 57, type: 'business', name: 'NFT-платформа', color: '#3B82F6', icon: '🎨', description: 'NFT-платформа', cost: 400000, income: 12000 },
      { id: 58, type: 'dream', name: 'Мировой лидер', color: '#F59E0B', icon: '👑', description: 'Стать мировым лидером мнений', cost: 1000000, income: 0 },
      { id: 59, type: 'business', name: 'Школа языков', color: '#3B82F6', icon: '🌍', description: 'Школа иностранных языков', cost: 20000, income: 3000 },
      { id: 60, type: 'dream', name: 'Коллекция суперкаров', color: '#F59E0B', icon: '🏎️', description: 'Купить коллекцию суперкаров', cost: 1000000, income: 0 },
      { id: 61, type: 'business', name: 'Школа будущего', color: '#3B82F6', icon: '🎓', description: 'Создать школу будущего для детей', cost: 300000, income: 10000 },
      { id: 62, type: 'dream', name: 'Фильм', color: '#F59E0B', icon: '🎬', description: 'Снять полнометражный фильм', cost: 500000, income: 0 },
      { id: 63, type: 'loss', name: 'Рейдерский захват', color: '#EF4444', icon: '🦈', description: 'Рейдерский захват (Вы теряете бизнес с крупным доходом)', cost: 0, income: 0 },
      { id: 64, type: 'dream', name: 'Кругосветное плавание', color: '#F59E0B', icon: '🌊', description: 'Кругосветное плавание на паруснике', cost: 200000, income: 0 },
      { id: 65, type: 'business', name: 'Автомойки', color: '#3B82F6', icon: '🚗', description: 'Сеть автомоек самообслуживания', cost: 120000, income: 3500 },
      { id: 66, type: 'dream', name: 'Белоснежная яхта', color: '#F59E0B', icon: '⛵', description: 'Белоснежная Яхта', cost: 300000, income: 0 },
      { id: 67, type: 'business', name: 'Франшиза "Поток денег"', color: '#3B82F6', icon: '💸', description: 'Франшиза "поток денег"', cost: 100000, income: 10000 },
      { id: 68, type: 'loss', name: 'Санкции', color: '#EF4444', icon: '🚫', description: 'Санкции заблокировали все счета', cost: 0, income: 0 },
      { id: 69, type: 'business', name: 'Пекарня', color: '#3B82F6', icon: '🥖', description: 'Пекарня с доставкой', cost: 300000, income: 7000 },
      { id: 70, type: 'dream', name: 'Благотворительный фонд', color: '#F59E0B', icon: '🤝', description: 'Организовать благотворительный фонд', cost: 200000, income: 0 },
      { id: 71, type: 'business', name: 'Онлайн-образование', color: '#3B82F6', icon: '💻', description: 'Онлайн-образовательная платформа', cost: 200000, income: 5000 },
      { id: 72, type: 'dream', name: 'Полёт в космос', color: '#F59E0B', icon: '🚀', description: 'Полёт в космос', cost: 250000, income: 0 },
      { id: 73, type: 'business', name: 'Фитнес-студии', color: '#3B82F6', icon: '💪', description: 'Сеть фитнес-студий', cost: 750000, income: 20000 },
      { id: 74, type: 'dream', name: 'Кругосветное путешествие', color: '#F59E0B', icon: '🌍', description: 'Кругосветное путешествие', cost: 300000, income: 0 },
      { id: 75, type: 'business', name: 'Коворкинг', color: '#3B82F6', icon: '🏢', description: 'Коворкинг-пространство', cost: 500000, income: 10000 },
      { id: 76, type: 'dream', name: 'Мечта', color: '#F59E0B', icon: '⭐', description: 'Придумай свою мечту', cost: 0, income: 0 }
    ];
    
    // Добавляем внешние клетки
    cells.push(...outerCells);
    
    return cells;
  });

  const [diceValue, setDiceValue] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [timerProgress, setTimerProgress] = useState(100);
  const [turnTimeLeft, setTurnTimeLeft] = useState(120); // 2 минуты = 120 секунд
  const [isTurnEnding, setIsTurnEnding] = useState(false);
  const [canRollDice, setCanRollDice] = useState(true);
  const [diceRolled, setDiceRolled] = useState(false);
  
  // Состояние игроков и их фишек - начинают с 1-й клетки
  const [players, setPlayers] = useState([
    { id: 1, name: 'MAG', position: 1, color: '#EF4444', profession: 'Инженер' },
    { id: 2, name: 'Алексей', position: 1, color: '#3B82F6', profession: 'Менеджер' },
    { id: 3, name: 'Мария', position: 1, color: '#10B981', profession: 'Дизайнер' },
    { id: 4, name: 'Дмитрий', position: 1, color: '#F59E0B', profession: 'Программист' }
  ]);
  
  const [currentPlayer, setCurrentPlayer] = useState(0); // Индекс текущего игрока
  const [isMoving, setIsMoving] = useState(false); // Флаг движения фишки
  const [movingPlayerId, setMovingPlayerId] = useState(null); // ID движущегося игрока
  
  // Состояние для модальных окон
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showAssetsModal, setShowAssetsModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // Состояние для toast уведомлений
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Состояние для банковских операций
  const [bankBalance, setBankBalance] = useState(2500);
  const [transferAmount, setTransferAmount] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [transferHistory, setTransferHistory] = useState([
    { id: 1, from: 'MAG', to: 'Алексей', amount: 100, date: '2024-01-15', time: '14:30' },
    { id: 2, from: 'Мария', to: 'MAG', amount: 50, date: '2024-01-15', time: '13:45' },
    { id: 3, from: 'Алексей', to: 'Дмитрий', amount: 200, date: '2024-01-15', time: '12:20' }
  ]);

  // Состояние для активов
  const [assets, setAssets] = useState([
    { id: 1, type: 'house', name: 'Дом', icon: '🏠', value: 150000, cost: 150000, income: 2000, color: '#10B981', description: 'Красивый дом в пригороде', quantity: 1 },
    { id: 2, type: 'stocks', name: 'Акции', icon: '📈', value: 25000, cost: 25000, income: 500, color: '#3B82F6', description: 'Портфель акций крупных компаний', quantity: 3 },
    { id: 3, type: 'business', name: 'Бизнес', icon: '💎', value: 80000, cost: 80000, income: 3000, color: '#8B5CF6', description: 'Собственный бизнес', quantity: 1 },
    { id: 4, type: 'car', name: 'Автомобиль', icon: '🚗', value: 45000, cost: 45000, income: 0, color: '#F59E0B', description: 'Премиум автомобиль', quantity: 1 },
    { id: 5, type: 'gold', name: 'Золото', icon: '🥇', value: 35000, cost: 35000, income: 200, color: '#EAB308', description: 'Инвестиции в золото', quantity: 2 },
    { id: 6, type: 'crypto', name: 'Криптовалюта', icon: '₿', value: 18000, cost: 18000, income: 800, color: '#EF4444', description: 'Портфель криптовалют', quantity: 1 },
    { id: 7, type: 'bonds', name: 'Облигации', icon: '📋', value: 12000, cost: 12000, income: 300, color: '#06B6D6', description: 'Государственные облигации', quantity: 5 }
  ]);

  // Состояние для FullProfessionCard
  const [showProfessionCard, setShowProfessionCard] = useState(false);
  const [selectedProfessionId, setSelectedProfessionId] = useState(null);

  // Состояние для игровой логики
  const [playerMoney, setPlayerMoney] = useState(2500); // Деньги игрока
  const [childrenCount, setChildrenCount] = useState(0); // Количество детей
  const [showChildModal, setShowChildModal] = useState(false); // Модал рождения ребенка
  const [showConfetti, setShowConfetti] = useState(false); // Анимация конфети

  // Состояние для системы сделок
  const [dealDeck, setDealDeck] = useState([]); // Основная колода сделок
  const [discardPile, setDiscardPile] = useState([]); // Отбой
  const [currentDealCard, setCurrentDealCard] = useState(null); // Текущая карточка сделки
  const [showDealModal, setShowDealModal] = useState(false); // Модал сделки
  const [showDealTypeModal, setShowDealTypeModal] = useState(false); // Модал выбора типа сделки
  const [showPlayerSelectionModal, setShowPlayerSelectionModal] = useState(false); // Модал выбора игрока для передачи карточки
  const [showCreditModal, setShowCreditModal] = useState(false); // Модал кредитов
  const [playerCredit, setPlayerCredit] = useState(0); // Текущий кредит игрока
  const [customCreditAmount, setCustomCreditAmount] = useState(''); // Произвольная сумма кредита
  const [customPayoffAmount, setCustomPayoffAmount] = useState(''); // Произвольная сумма погашения
  const [creditModalFromDeal, setCreditModalFromDeal] = useState(false); // Открыт ли модал кредитов из сделки
  const [showAssetTransferModal, setShowAssetTransferModal] = useState(false); // Модал передачи активов
  const [selectedAssetForTransfer, setSelectedAssetForTransfer] = useState(null); // Выбранный актив для передачи



  // Инициализация колоды сделок
  useEffect(() => {
    initializeDealDeck();
  }, []);

  // Функция инициализации колоды сделок
  const initializeDealDeck = () => {
    const smallDeals = [
      { id: 1, type: 'small', name: 'Кофейня', cost: 5000, income: 200, description: 'Небольшая кофейня в спальном районе' },
      { id: 2, type: 'small', name: 'Автомойка', cost: 8000, income: 400, description: 'Автомойка самообслуживания' },
      { id: 3, type: 'small', name: 'Пекарня', cost: 12000, income: 600, description: 'Домашняя пекарня' },
      { id: 4, type: 'small', name: 'Салон красоты', cost: 15000, income: 800, description: 'Салон красоты' },
      { id: 5, type: 'small', name: 'Магазин одежды', cost: 20000, income: 1000, description: 'Бутик одежды' },
      { id: 6, type: 'small', name: 'Спортзал', cost: 25000, income: 1200, description: 'Небольшой спортзал' },
      { id: 7, type: 'small', name: 'Стоматология', cost: 30000, income: 1500, description: 'Стоматологический кабинет' },
      { id: 8, type: 'small', name: 'Юридическая контора', cost: 35000, income: 1800, description: 'Юридические услуги' }
    ];

    const bigDeals = [
      { id: 9, type: 'big', name: 'Отель', cost: 100000, income: 8000, description: 'Небольшой отель в центре города' },
      { id: 10, type: 'big', name: 'Торговый центр', cost: 200000, income: 20000, description: 'Торговый центр' },
      { id: 11, type: 'big', name: 'Завод', cost: 300000, income: 35000, description: 'Производственное предприятие' },
      { id: 12, type: 'big', name: 'Университет', cost: 500000, income: 60000, description: 'Частный университет' },
      { id: 13, type: 'big', name: 'Больница', cost: 400000, income: 45000, description: 'Частная клиника' },
      { id: 14, type: 'big', name: 'Аэропорт', cost: 1000000, income: 150000, description: 'Региональный аэропорт' }
    ];

    // Перемешиваем карточки
    const shuffledDeck = [...smallDeals, ...bigDeals].sort(() => Math.random() - 0.5);
    setDealDeck(shuffledDeck);
  };

  // Функция броска кубика
  const rollDice = () => {
    if (isRolling || !canRollDice) return;
    
    setIsRolling(true);
    setDiceRolled(true);
    setCanRollDice(false);
    
    const rollInterval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
    }, 100);

    setTimeout(() => {
      clearInterval(rollInterval);
      const finalValue = Math.floor(Math.random() * 6) + 1;
      setDiceValue(finalValue);
      setIsRolling(false);
      
      // Двигаем фишку текущего игрока
      movePlayer(finalValue);
      
      // Через 10 секунд после броска кнопка превращается в "Переход хода"
      setTimeout(() => {
        if (diceRolled) {
          setCanRollDice(false);
        }
      }, 10000);
    }, 1000);
  };
  
  // Функции для модальных окон
  const openPlayerModal = (player) => {
    setSelectedPlayer(player);
    setShowPlayerModal(true);
  };
  
  const openBankModal = () => {
    setShowBankModal(true);
  };
  
  const openAssetsModal = () => {
    setShowAssetsModal(true);
  };

  const openProfessionCard = (professionId) => {
    setSelectedProfessionId(professionId);
    setShowProfessionCard(true);
  };

  const closeCreditModal = () => {
    setShowCreditModal(false);
    setCustomCreditAmount(''); // Очищаем поле ввода
    setCustomPayoffAmount(''); // Очищаем поле погашения
    setCreditModalFromDeal(false); // Сбрасываем флаг
  };

  // Функция для передачи актива
  const handleTransferAsset = (asset) => {
    setSelectedAssetForTransfer(asset);
    setShowAssetTransferModal(true);
  };

  // Функция передачи актива конкретному игроку
  const handleTransferAssetToPlayer = (playerIndex) => {
    if (!selectedAssetForTransfer) return;
    
    const currentPlayerData = players[currentPlayer];
    const targetPlayer = players[playerIndex];
    
    // Передаем одну акцию/актив
    if (selectedAssetForTransfer.quantity > 1) {
      // Если у игрока больше одной акции, уменьшаем количество
      setAssets(prev => prev.map(asset => 
        asset.id === selectedAssetForTransfer.id 
          ? { ...asset, quantity: asset.quantity - 1 }
          : asset
      ));
    } else {
      // Если у игрока только одна акция, удаляем актив полностью
      setAssets(prev => prev.filter(asset => asset.id !== selectedAssetForTransfer.id));
    }
    
    // Добавляем актив целевому игроку (здесь нужно обновить состояние активов целевого игрока)
    // Пока что просто показываем уведомление
    
    setToast({
      open: true,
      message: `🎁 ${currentPlayerData.name} передал 1 ${selectedAssetForTransfer.name} игроку ${targetPlayer.name}`,
      severity: 'success'
    });
    
    console.log(`🎁 [OriginalGameBoard] ${currentPlayerData.name} передал 1 ${selectedAssetForTransfer.name} игроку ${targetPlayer.name}`);
    
    // Закрываем модальные окна
    setShowAssetTransferModal(false);
    setSelectedAssetForTransfer(null);
  };
  
  const closeModals = () => {
    setShowPlayerModal(false);
    setShowBankModal(false);
    setShowAssetsModal(false);
    setShowProfessionCard(false);
    setShowCreditModal(false);
    setShowAssetTransferModal(false);
    setSelectedPlayer(null);
    setSelectedProfessionId(null);
    setSelectedAssetForTransfer(null);
    setCustomCreditAmount(''); // Очищаем поле ввода кредита
    setCustomPayoffAmount(''); // Очищаем поле погашения кредита
  };
  
  // Функция движения игрока
  const movePlayer = (steps) => {
    const updatedPlayers = [...players];
    const player = updatedPlayers[currentPlayer];
    
    // Устанавливаем флаг движения и ID движущегося игрока
    setIsMoving(true);
    setMovingPlayerId(player.id);
    
    // Создаем промежуточные позиции для плавного движения
    const startPosition = player.position;
    let currentPosition = startPosition;
    
    // Анимация движения пошагово
    const moveStep = () => {
      if (currentPosition < startPosition + steps) {
        currentPosition++;
        if (currentPosition > 76) {
          currentPosition = 1; // Замыкаем круг (76 клеток)
        }
        
        // Обновляем позицию игрока
        player.position = currentPosition;
        setPlayers([...updatedPlayers]);
        
        // Продолжаем движение
        setTimeout(moveStep, 200); // 200ms между шагами
      } else {
        // Движение завершено, НЕ переходим к следующему игроку
        // Игрок остается на своей позиции до истечения времени хода
        setIsMoving(false); // Снимаем флаг движения
        setMovingPlayerId(null); // Сбрасываем ID движущегося игрока
        
        // Движение завершено, обрабатываем клетку
        setIsMoving(false); // Снимаем флаг движения
        setMovingPlayerId(null); // Сбрасываем ID движущегося игрока
        
        // Обрабатываем логику клетки
        handleCellAction(player.position);
        
        console.log(`🎯 Игрок ${player.name} переместился на позицию ${player.position}`);
      }
    };
    
    // Начинаем движение
    moveStep();
  };

  // Функция обработки действий клетки
  const handleCellAction = (position) => {
    const player = players[currentPlayer];
    
    // Клетки зарплаты (6, 14, 22)
    if ([6, 14, 22].includes(position)) {
      const salary = getPlayerSalary(player.profession);
      setPlayerMoney(prev => prev + salary);
      
      setToast({
        open: true,
        message: `💰 PAYDAY! ${player.name} получил зарплату $${salary.toLocaleString()}`,
        severity: 'success'
      });
      
      console.log(`💰 [OriginalGameBoard] Игрок ${player.name} получил зарплату $${salary}`);
      
      // Автоматически предлагаем погасить кредит, если он есть
      if (playerCredit > 0) {
        setTimeout(() => {
          setToast({
            open: true,
            message: `💳 У вас есть кредит $${playerCredit.toLocaleString()}. Рекомендуется погасить!`,
            severity: 'warning'
          });
        }, 2000);
      }
    }
    
    // Клетка ребенка (12)
    if (position === 12) {
      setShowChildModal(true);
    }
    
    // Клетки сделок (1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23)
    if ([1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23].includes(position)) {
      setShowDealTypeModal(true);
    }
  };

  // Функция получения зарплаты по профессии
  const getPlayerSalary = (profession) => {
    switch (profession) {
      case 'Инженер':
        return 5000;
      case 'Менеджер':
        return 4500;
      case 'Дизайнер':
        return 4000;
      case 'Программист':
        return 6000;
      default:
        return 4000;
    }
  };

  // Функция рождения ребенка
  const handleChildBirth = () => {
    const player = players[currentPlayer];
    
    // Бросаем дополнительный кубик
    const childDice = Math.floor(Math.random() * 6) + 1;
    
    if (childDice <= 4) {
      // Ребенок родился!
      setChildrenCount(prev => prev + 1);
      setPlayerMoney(prev => prev + 5000); // Разовая выплата $5000
      
      // Показываем анимацию конфети
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      
      setToast({
        open: true,
        message: `👶 Поздравляем! У ${player.name} родился ребенок! +$5,000`,
        severity: 'success'
      });
      
      console.log(`👶 [OriginalGameBoard] У игрока ${player.name} родился ребенок! Кубик: ${childDice}`);
    } else {
      // Ребенок не родился
      setToast({
        open: true,
        message: `😔 ${player.name}, ребенок не родился. Кубик: ${childDice}`,
        severity: 'info'
      });
      
      console.log(`😔 [OriginalGameBoard] У игрока ${player.name} ребенок не родился. Кубик: ${childDice}`);
    }
    
    setShowChildModal(false);
  };

  // Функция выбора типа сделки
  const handleDealTypeSelection = (dealType) => {
    setShowDealTypeModal(false);
    
    // Фильтруем карточки по типу
    const availableCards = dealDeck.filter(card => card.type === dealType);
    
    if (availableCards.length === 0) {
      // Если карточки закончились, перемешиваем отбой
      if (discardPile.length > 0) {
        const shuffledDiscard = [...discardPile].sort(() => Math.random() - 0.5);
        setDealDeck(shuffledDiscard);
        setDiscardPile([]);
        
        setToast({
          open: true,
          message: `🔄 Колода закончилась! Отбой перемешан и возвращен в игру`,
          severity: 'info'
        });
        
        // Повторяем попытку
        handleDealTypeSelection(dealType);
        return;
      } else {
        setToast({
          open: true,
          message: `❌ Карточки ${dealType === 'small' ? 'малых' : 'больших'} сделок закончились`,
          severity: 'warning'
        });
        return;
      }
    }
    
    // Берем первую карточку из колоды
    const card = availableCards[0];
    setCurrentDealCard(card);
    setShowDealModal(true);
    
    // Убираем карточку из колоды
    setDealDeck(prev => prev.filter(c => c.id !== card.id));
  };

  // Функция покупки карточки сделки
  const handleBuyDeal = () => {
    if (!currentDealCard) return;
    
    const player = players[currentPlayer];
    
    if (playerMoney >= currentDealCard.cost) {
      // Покупаем карточку
      setPlayerMoney(prev => prev - currentDealCard.cost);
      
      // Проверяем, есть ли уже такой актив у игрока
      const existingAssetIndex = assets.findIndex(asset => 
        asset.name === currentDealCard.name && asset.type === 'deal'
      );
      
      if (existingAssetIndex !== -1) {
        // Если актив уже есть, увеличиваем количество
        setAssets(prev => prev.map((asset, index) => 
          index === existingAssetIndex 
            ? { ...asset, quantity: asset.quantity + 1 }
            : asset
        ));
      } else {
        // Если актива нет, создаем новый
        const newAsset = {
          id: Date.now(),
          type: 'deal',
          name: currentDealCard.name,
          icon: currentDealCard.type === 'small' ? '🏪' : '🏢',
          value: currentDealCard.cost,
          cost: currentDealCard.cost,
          income: currentDealCard.income,
          color: currentDealCard.type === 'small' ? '#10B981' : '#8B5CF6',
          description: currentDealCard.description,
          quantity: 1
        };
        
        setAssets(prev => [...prev, newAsset]);
      }
      
      setToast({
        open: true,
        message: `✅ ${player.name} купил ${currentDealCard.name} за $${currentDealCard.cost.toLocaleString()}`,
        severity: 'success'
      });
      
      console.log(`✅ [OriginalGameBoard] Игрок ${player.name} купил ${currentDealCard.name}`);
    } else {
      setToast({
        open: true,
        message: `❌ Недостаточно денег для покупки ${currentDealCard.name}`,
        severity: 'error'
      });
    }
    
    setShowDealModal(false);
    setCurrentDealCard(null);
  };

  // Функция отмены карточки сделки
  const handleCancelDeal = () => {
    if (!currentDealCard) return;
    
    // Карточка уходит в отбой
    setDiscardPile(prev => [...prev, currentDealCard]);
    
    setToast({
      open: true,
      message: `🔄 Карточка ${currentDealCard.name} ушла в отбой`,
      severity: 'info'
    });
    
    setShowDealModal(false);
    setCurrentDealCard(null);
  };



  // Функция передачи карточки другому игроку
  const handlePassCardToPlayer = () => {
    if (!currentDealCard) return;
    
    // Показываем модал выбора игрока
    setShowPlayerSelectionModal(true);
  };

  // Функция передачи карточки конкретному игроку
  const handlePassCardToSpecificPlayer = (playerIndex) => {
    if (!currentDealCard) return;
    
    const currentPlayerData = players[currentPlayer];
    const targetPlayer = players[playerIndex];
    
    // Проверяем, есть ли уже такой актив у целевого игрока
    const existingAssetIndex = assets.findIndex(asset => 
      asset.name === currentDealCard.name && asset.type === 'deal'
    );
    
    if (existingAssetIndex !== -1) {
      // Если актив уже есть, увеличиваем количество
      setAssets(prev => prev.map((asset, index) => 
        index === existingAssetIndex 
          ? { ...asset, quantity: asset.quantity + 1 }
          : asset
      ));
    } else {
      // Если актива нет, создаем новый
      const newAsset = {
        id: Date.now(),
        type: 'deal',
        name: currentDealCard.name,
        icon: currentDealCard.type === 'small' ? '🏪' : '🏢',
        value: currentDealCard.cost,
        cost: currentDealCard.cost,
        income: currentDealCard.income,
        color: currentDealCard.type === 'small' ? '#10B981' : '#8B5CF6',
        description: currentDealCard.description,
        receivedFrom: currentPlayerData.name, // От кого получена
        quantity: 1
      };
      
      setAssets(prev => [...prev, newAsset]);
    }
    
    setToast({
      open: true,
      message: `🎁 ${currentPlayerData.name} передал ${currentDealCard.name} игроку ${targetPlayer.name}`,
      severity: 'success'
    });
    
    console.log(`🎁 [OriginalGameBoard] ${currentPlayerData.name} передал ${currentDealCard.name} игроку ${targetPlayer.name}`);
    
    setShowPlayerSelectionModal(false);
    setShowDealModal(false);
    setCurrentDealCard(null);
  };

  // Функция для расчета денежного потока (PAYDAY)
  const getCashFlow = () => {
    const totalIncome = assets.reduce((sum, asset) => sum + (asset.income || 0), 0);
    // Здесь нужно вычесть ежемесячные расходы игрока
    // Пока что используем фиксированные расходы для примера
    const totalExpenses = 4500; // Пример: расходы $4,500
    
    // Вычитаем платежи по кредиту: за каждые $1,000 кредита - $100/мес
    const creditPayments = Math.floor(playerCredit / 1000) * 100;
    
    return totalIncome - totalExpenses - creditPayments;
  };

  // Функция для расчета максимального кредита
  const getMaxCredit = () => {
    const cashFlow = getCashFlow(); // PAYDAY (доходы - расходы)
    // Максимум кредита = PAYDAY * 10
    // Пример: если PAYDAY = $1,500, то макс. кредит = $15,000
    return Math.floor(cashFlow * 10);
  };

  // Функция для взятия кредита
  const handleTakeCredit = (amount) => {
    const maxCredit = getMaxCredit();
    
    if (amount > maxCredit) {
      setToast({
        open: true,
        message: `❌ Максимальный кредит: $${maxCredit.toLocaleString()}`,
        severity: 'error'
      });
      return;
    }
    
    if (amount % 1000 !== 0) {
      setToast({
        open: true,
        message: `❌ Кредит должен быть кратен $1,000`,
        severity: 'error'
      });
      return;
    }
    
    setPlayerCredit(prev => prev + amount);
    setPlayerMoney(prev => prev + amount);
    
    setToast({
      open: true,
      message: `💳 Кредит взят: $${amount.toLocaleString()}`,
      severity: 'success'
    });
    
    console.log(`💳 [OriginalGameBoard] Взят кредит: $${amount.toLocaleString()}`);
  };

  // Функция для взятия кредита из модального окна сделки
  const handleTakeCreditFromDeal = (amount) => {
    const maxCredit = getMaxCredit();
    
    if (amount > maxCredit) {
      setToast({
        open: true,
        message: `❌ Максимальный кредит: $${maxCredit.toLocaleString()}`,
        severity: 'error'
      });
      return;
    }
    
    if (amount % 1000 !== 0) {
      setToast({
        open: true,
        message: `❌ Кредит должен быть кратен $1,000`,
        severity: 'error'
      });
      return;
    }
    
    setPlayerCredit(prev => prev + amount);
    setPlayerMoney(prev => prev + amount);
    
    // Закрываем модальное окно кредитов и возвращаемся к сделке
    setShowCreditModal(false);
    
    setToast({
      open: true,
      message: `💳 Кредит взят: $${amount.toLocaleString()}. Теперь вы можете купить актив!`,
      severity: 'success'
    });
    
    console.log(`💳 [OriginalGameBoard] Взят кредит из сделки: $${amount.toLocaleString()}`);
  };

  // Функция для погашения кредита
  const handlePayOffCredit = (amount) => {
    // Валидация суммы
    if (!amount || amount <= 0) {
      setToast({
        open: true,
        message: '❌ Введите корректную сумму погашения',
        severity: 'error'
      });
      return;
    }
    
    if (amount > playerCredit) {
      setToast({
        open: true,
        message: `❌ У вас кредит только $${playerCredit.toLocaleString()}`,
        severity: 'error'
      });
      return;
    }
    
    if (amount > playerMoney) {
      setToast({
        open: true,
        message: `❌ Недостаточно денег для погашения`,
        severity: 'error'
      });
      return;
    }
    
    if (amount % 1000 !== 0) {
      setToast({
        open: true,
        message: `❌ Сумма погашения должна быть кратна $1,000`,
        severity: 'error'
      });
      return;
    }
    
    // Погашаем кредит
    setPlayerCredit(prev => prev - amount);
    setPlayerMoney(prev => prev - amount);
    
    // Очищаем поле ввода погашения
    setCustomPayoffAmount('');
    
    setToast({
      open: true,
      message: `✅ Кредит погашен: $${amount.toLocaleString()}. Денежный поток увеличен на $${Math.floor(amount / 1000) * 100}/мес`,
      severity: 'success'
    });
    
    console.log(`✅ [OriginalGameBoard] Погашен кредит: $${amount.toLocaleString()}`);
  };

  // Функция для быстрого погашения части кредита
  const handleQuickPayoff = (amount) => {
    handlePayOffCredit(amount);
  };







  // Функция для расчета оптимальной стратегии погашения












  // Функция для взятия кредита произвольной суммы
  const handleCustomCredit = () => {
    const amount = parseInt(customCreditAmount);
    
    if (isNaN(amount) || amount <= 0) {
      setToast({
        open: true,
        message: '❌ Введите корректную сумму',
        severity: 'error'
      });
      return;
    }
    
    if (amount % 1000 !== 0) {
      setToast({
        open: true,
        message: `❌ Кредит должен быть кратен $1,000`,
        severity: 'error'
      });
      return;
    }
    
    const maxCredit = getMaxCredit();
    if (amount > maxCredit) {
      setToast({
        open: true,
        message: `❌ Максимальный кредит: $${maxCredit.toLocaleString()}`,
        severity: 'error'
      });
      return;
    }
    
    if ((playerCredit + amount) > maxCredit) {
      setToast({
        open: true,
        message: `❌ Общий кредит превысит лимит`,
        severity: 'error'
      });
      return;
    }
    
    setPlayerCredit(prev => prev + amount);
    setPlayerMoney(prev => prev + amount);
    setCustomCreditAmount(''); // Очищаем поле ввода
    
    setToast({
      open: true,
      message: `💳 Кредит взят: $${amount.toLocaleString()}`,
      severity: 'success'
    });
    
    console.log(`💳 [OriginalGameBoard] Взят кредит произвольной суммы: $${amount.toLocaleString()}`);
  };

  // Функция для взятия кредита произвольной суммы из модального окна сделки
  const handleCustomCreditFromDeal = () => {
    const amount = parseInt(customCreditAmount);
    
    if (isNaN(amount) || amount <= 0) {
      setToast({
        open: true,
        message: '❌ Введите корректную сумму',
        severity: 'error'
      });
      return;
    }
    
    if (amount % 1000 !== 0) {
      setToast({
        open: true,
        message: `❌ Кредит должен быть кратен $1,000`,
        severity: 'error'
      });
      return;
    }
    
    const maxCredit = getMaxCredit();
    if (amount > maxCredit) {
      setToast({
        open: true,
        message: `❌ Максимальный кредит: $${maxCredit.toLocaleString()}`,
        severity: 'error'
      });
      return;
    }
    
    if ((playerCredit + amount) > maxCredit) {
      setToast({
        open: true,
        message: `❌ Общий кредит превысит лимит`,
        severity: 'error'
      });
      return;
    }
    
    setPlayerCredit(prev => prev + amount);
    setPlayerMoney(prev => prev + amount);
    setCustomCreditAmount(''); // Очищаем поле ввода
    
    // Закрываем модальное окно кредитов и возвращаемся к сделке
    setShowCreditModal(false);
    setCreditModalFromDeal(false);
    
    setToast({
      open: true,
      message: `💳 Кредит взят: $${amount.toLocaleString()}. Теперь вы можете купить актив!`,
      severity: 'success'
    });
    
    console.log(`💳 [OriginalGameBoard] Взят кредит произвольной суммы из сделки: $${amount.toLocaleString()}`);
  };

  // Функции для кнопок управления игрой
  const handlePlayerTurn = (playerIndex) => {
    if (playerIndex === currentPlayer) {
      console.log(`🎯 [OriginalGameBoard] Ход игрока ${players[playerIndex].name} уже активен`);
      return;
    }
    
    console.log(`🎯 [OriginalGameBoard] Переключение на игрока ${players[playerIndex].name}`);
    setCurrentPlayer(playerIndex);
    
    // Сбрасываем таймер для нового игрока
    setTurnTimeLeft(120);
    setTimerProgress(100);
    setIsTurnEnding(false);
    setCanRollDice(true);
    setDiceRolled(false);
    
    // Показываем уведомление
    setToast({
      open: true,
      message: `🎯 Ход передан игроку ${players[playerIndex].name}`,
      severity: 'info'
    });
  };



  // Функция для перехода хода
  const passTurn = () => {
    const nextPlayer = (currentPlayer + 1) % players.length;
    setCurrentPlayer(nextPlayer);
    
    // Сбрасываем таймер для нового игрока
    setTurnTimeLeft(120);
    setTimerProgress(100);
    setIsTurnEnding(false);
    setCanRollDice(true);
    setDiceRolled(false);
    
    // Показываем уведомление
    setToast({
      open: true,
      message: `⏭️ Ход передан игроку ${players[nextPlayer].name}`,
      severity: 'info'
    });
    
    console.log(`⏭️ [OriginalGameBoard] Ход передан игроку ${players[nextPlayer].name}`);
  };

  // Функции для банковских операций
  const handleTransfer = () => {
    if (!transferAmount || !selectedRecipient) {
      setToast({
        open: true,
        message: '❌ Заполните сумму и выберите получателя',
        severity: 'error'
      });
      return;
    }

    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      setToast({
        open: true,
        message: '❌ Введите корректную сумму',
        severity: 'error'
      });
      return;
    }

    if (amount > bankBalance) {
      setToast({
        open: true,
        message: '❌ Недостаточно средств на счете',
        severity: 'error'
      });
      return;
    }

    // Выполняем перевод
    const currentPlayerName = players[currentPlayer]?.name || 'Неизвестно';
    const newTransfer = {
      id: Date.now(),
      from: currentPlayerName,
      to: selectedRecipient,
      amount: amount,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    };

    // Обновляем историю переводов
    setTransferHistory(prev => [newTransfer, ...prev]);
    
    // Списываем средства
    setBankBalance(prev => prev - amount);
    
    // Сбрасываем форму
    setTransferAmount('');
    setSelectedRecipient('');

    // Показываем уведомление об успехе
    setToast({
      open: true,
      message: `✅ Перевод $${amount} игроку ${selectedRecipient} выполнен успешно`,
      severity: 'success'
    });

    console.log(`🏦 [OriginalGameBoard] Перевод выполнен: ${currentPlayerName} → ${selectedRecipient} $${amount}`);
  };

  const resetTransferForm = () => {
    setTransferAmount('');
    setSelectedRecipient('');
  };

  // Функции для работы с активами
  const getTotalAssetsValue = () => {
    return assets.reduce((total, asset) => total + (asset.value * (asset.quantity || 1)), 0);
  };

  const getTotalAssetsIncome = () => {
    return assets.reduce((total, asset) => total + (asset.income * (asset.quantity || 1)), 0);
  };

  // Таймер хода - 2 минуты на весь ход
  useEffect(() => {
    let interval;
    
    if (turnTimeLeft > 0) {
      interval = setInterval(() => {
        setTurnTimeLeft(prev => {
          const newTime = prev - 1;
          
          // Обновляем прогресс таймера
          const progress = Math.round((newTime / 120) * 100);
          setTimerProgress(progress);
          
          // Проверяем критические моменты
          if (newTime <= 20) {
            setIsTurnEnding(true);
            // Воспроизводим звуковой сигнал
            if (newTime <= 20 && newTime > 19) {
              // Здесь можно добавить звуковой сигнал
              console.log('🔴 ВНИМАНИЕ! Осталось 20 секунд!');
            }
          } else if (newTime <= 60) {
            setIsTurnEnding(false);
          }
          
          // Если время истекло
          if (newTime <= 0) {
            console.log('⏰ Время хода истекло!');
            // Автоматически переходим к следующему игроку
            setTimeout(() => {
              const nextPlayer = (currentPlayer + 1) % players.length;
              setCurrentPlayer(nextPlayer);
              setTurnTimeLeft(120);
              setTimerProgress(100);
              setIsTurnEnding(false);
              setCanRollDice(true);
              setDiceRolled(false);
              
              // Показываем уведомление
              setToast({
                open: true,
                message: `⏰ Ход передан игроку ${players[nextPlayer].name} (время истекло)`,
                severity: 'warning'
              });
            }, 1000);
          }
          
          return newTime;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [turnTimeLeft, currentPlayer, players]);

  return (
    <Fragment>
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
      padding: '20px',
      display: 'flex',
      gap: '30px'
    }}>
      {/* Основное игровое поле */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Отладочная информация */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant="body2" sx={{ 
            color: '#ff4444',
            fontWeight: 'bold',
            fontFamily: 'monospace',
            fontSize: '0.8rem',
            mb: 1
          }}>
            🐛 DEBUG: OriginalGameBoard.js (3 топ актива + упрощенный логотип + профили + банк)
          </Typography>
        </Box>
        
        {/* Заголовок убран - оставлено только центральное лого */}
        
        {/* Информация о текущем игроке и кубик */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          mb: 3,
          p: 2,
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '15px',
          backdropFilter: 'blur(10px)'
        }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <Avatar sx={{ 
              bgcolor: players[currentPlayer]?.color,
              width: 40,
              height: 40
            }}>
              {players[currentPlayer]?.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                {players[currentPlayer]?.name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                {players[currentPlayer]?.profession}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <Typography variant="h6" sx={{ color: 'white' }}>
              Кубик: {diceValue}
            </Typography>
            <Button
              variant="contained"
              onClick={rollDice}
              disabled={isRolling || isMoving}
              sx={{
                background: isRolling || isMoving 
                  ? 'linear-gradient(45deg, #9CA3AF, #6B7280)' 
                  : 'linear-gradient(45deg, #8B5CF6, #06B6D4)',
                color: 'white',
                fontWeight: 'bold',
                px: 3,
                py: 1,
                borderRadius: '25px',
                '&:hover': {
                  background: isRolling || isMoving 
                    ? 'linear-gradient(45deg, #9CA3AF, #6B7280)' 
                    : 'linear-gradient(45deg, #7C3AED, #0891B2)'
                }
              }}
            >
              {isRolling ? 'Бросаю...' : isMoving ? 'Фишка движется...' : 'Бросить кубик'}
            </Button>
          </Box>
        </Box>

        {/* Игровое поле */}
        <Box sx={{
          position: 'relative',
          width: '800px',
          height: '800px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '30px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden'
        }}>
          









          {/* Центральное лого "ENERGY OF MONEY" */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '200px',
              height: '200px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2
            }}
          >
            {/* Основной круг с радужным градиентом */}
            <Box
              sx={{
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                background: 'conic-gradient(from 0deg, #3B82F6, #10B981, #F59E0B, #EF4444, #8B5CF6, #3B82F6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                mb: 2
              }}
            >
              {/* Внутренний круг с темным фоном */}
              <Box
                sx={{
                  width: '140px',
                  height: '140px',
                  borderRadius: '50%',
                  background: '#1F2937',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                {/* Центральная область с символами */}
                <Box
                  sx={{
                    position: 'absolute',
                    width: '100px',
                    height: '100px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gridTemplateRows: '1fr 1fr',
                    gap: '8px',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {/* Молния (⚡) - верхний левый */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      background: 'linear-gradient(135deg, #3B82F6, #10B981)',
                      borderRadius: '8px',
                      width: '100%',
                      height: '100%',
                      color: 'white',
                      textShadow: '0 0 10px rgba(59, 130, 246, 0.8)'
                    }}
                  >
                    ⚡
                  </Box>
                  
                  {/* Атом (⚛️) - верхний правый */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      background: 'linear-gradient(135deg, #10B981, #F59E0B)',
                      borderRadius: '8px',
                      width: '100%',
                      height: '100%',
                      color: 'white',
                      textShadow: '0 0 10px rgba(16, 185, 129, 0.8)'
                    }}
                  >
                    ⚛️
                  </Box>
                  
                  {/* Доллар ($) - нижний левый */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
                      borderRadius: '8px',
                      width: '100%',
                      height: '100%',
                      color: 'white',
                      textShadow: '0 0 10px rgba(245, 158, 11, 0.8)'
                    }}
                  >
                    $
                  </Box>
                  
                  {/* Денежный мешок (💰) - нижний правый */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      background: 'linear-gradient(135deg, #EF4444, #8B5CF6)',
                      borderRadius: '8px',
                      width: '100%',
                      height: '100%',
                      color: 'white',
                      textShadow: '0 0 10px rgba(239, 68, 68, 0.8)'
                    }}
                  >
                    💰
                  </Box>
                </Box>
              </Box>
            </Box>
            
            {/* Текст "ENERGY OF MONEY" с радужным градиентом */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #3B82F6, #10B981)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
                  lineHeight: 1.2,
                  fontSize: '1.2rem'
                }}
              >
                ENERGY OF
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #10B981, #EF4444)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 20px rgba(16, 185, 129, 0.5)',
                  lineHeight: 1.2,
                  fontSize: '1.2rem'
                }}
              >
                MONEY
              </Typography>
            </Box>
          </Box>

          {/* 24 внутренние клетки по кругу */}
          {originalBoard.slice(0, 24).map((cell, i) => {
            const angle = (i * 360) / 24;
            const radius = 172.5; // Увеличил на 15% с 150px до 172.5px
            const x = Math.cos((angle - 90) * Math.PI / 180) * radius;
            const y = Math.sin((angle - 90) * Math.PI / 180) * radius;
            
            return (
              <motion.div
                key={cell.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                    width: '46px', // Увеличил на 15% с 40px до 46px
                    height: '46px', // Увеличил на 15% с 40px до 46px
                    background: `linear-gradient(135deg, ${cell.color} 0%, ${cell.color}DD 100%)`,
                    borderRadius: '14px', // Увеличил радиус скругления для больших клеток
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px', // Увеличил размер шрифта для больших клеток
                    fontWeight: 'bold',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                    zIndex: 1,
                    '&:hover': {
                      transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(1.3)`,
                      boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
                      zIndex: 3
                    }
                  }}
                  title={cell.description}
                >
                  {/* Иконка клетки */}
                  <Typography variant="h6" sx={{ fontSize: '20px' }}>
                    {cell.icon}
                  </Typography>
                  
                  {/* Номер клетки в левом углу */}
                  <Typography
                    sx={{
                      position: 'absolute',
                      top: '2px',
                      left: '4px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      color: 'white',
                      textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                      zIndex: 2
                    }}
                  >
                    {cell.id}
                  </Typography>
                </Box>
              </motion.div>
            );
          })}

          {/* 4 угловые карточки между малым и большим кругом */}
          {/* Верхний левый угол - Большая сделка */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) translate(-200px, -200px)', // Позиция между кругами
                width: '100px',
                height: '120px',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                borderRadius: '20px',
                border: '3px solid #EF4444',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 12px 35px rgba(16, 185, 129, 0.4), 0 0 20px rgba(239, 68, 68, 0.3)',
                zIndex: 3,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translate(-50%, -50%) translate(-200px, -200px) scale(1.05)',
                  boxShadow: '0 20px 50px rgba(16, 185, 129, 0.5), 0 0 30px rgba(239, 68, 68, 0.4)'
                }
              }}
            >
              <Typography variant="h4" sx={{ 
                color: 'white', 
                mb: 1,
                fontSize: '24px'
              }}>
                💰
              </Typography>
              <Typography variant="caption" sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: '11px',
                lineHeight: 1.2,
                textShadow: '0 1px 2px rgba(0,0,0,0.5)'
              }}>
                Большая сделка
              </Typography>
            </Box>
          </motion.div>

          {/* Верхний правый угол - Малая сделка */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) translate(200px, -200px)', // Позиция между кругами
                width: '100px',
                height: '120px',
                background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                borderRadius: '20px',
                border: '3px solid #EF4444',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 12px 35px rgba(59, 130, 246, 0.4), 0 0 20px rgba(239, 68, 68, 0.3)',
                zIndex: 3,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translate(-50%, -50%) translate(200px, -200px) scale(1.05)',
                  boxShadow: '0 20px 50px rgba(59, 130, 246, 0.5), 0 0 30px rgba(239, 68, 68, 0.4)'
                }
              }}
            >
              <Typography variant="h4" sx={{ 
                color: 'white', 
                mb: 1,
                fontSize: '24px'
              }}>
                💼
              </Typography>
              <Typography variant="caption" sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: '11px',
                lineHeight: 1.2,
                textShadow: '0 1px 2px rgba(0,0,0,0.5)'
              }}>
                Малая сделка
              </Typography>
            </Box>
          </motion.div>

          {/* Нижний правый угол - Рынок */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) translate(200px, 200px)', // Позиция между кругами
                width: '100px',
                height: '120px',
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                borderRadius: '20px',
                border: '3px solid #EF4444',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 12px 35px rgba(245, 158, 11, 0.4), 0 0 20px rgba(239, 68, 68, 0.3)',
                zIndex: 3,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translate(-50%, -50%) translate(200px, 200px) scale(1.05)',
                  boxShadow: '0 20px 50px rgba(245, 158, 11, 0.5), 0 0 30px rgba(239, 68, 68, 0.4)'
                }
              }}
            >
              <Typography variant="h4" sx={{ 
                color: 'white', 
                mb: 1,
                fontSize: '24px'
              }}>
                📈
              </Typography>
              <Typography variant="caption" sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: '11px',
                lineHeight: 1.2,
                textShadow: '0 1px 2px rgba(0,0,0,0.5)'
              }}>
                Рынок
              </Typography>
            </Box>
          </motion.div>

          {/* Нижний левый угол - Расходы */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.1 }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) translate(-200px, 200px)', // Позиция между кругами
                width: '100px',
                height: '120px',
                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                borderRadius: '20px',
                border: '3px solid #EF4444',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 12px 35px rgba(239, 68, 68, 0.4), 0 0 20px rgba(239, 68, 68, 0.3)',
                zIndex: 3,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translate(-50%, -50%) translate(-200px, 200px) scale(1.05)',
                  boxShadow: '0 20px 50px rgba(239, 68, 68, 0.5), 0 0 30px rgba(239, 68, 68, 0.4)'
                }
              }}
            >
              <Typography variant="h4" sx={{ 
                color: 'white', 
                mb: 1,
                fontSize: '24px'
              }}>
                💸
              </Typography>
              <Typography variant="caption" sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: '11px',
                lineHeight: 1.2,
                textShadow: '0 1px 2px rgba(0,0,0,0.5)'
              }}>
                Расходы
              </Typography>
            </Box>
          </motion.div>

                    {/* Фишки игроков на внутреннем круге */}
          {(() => {
            // Группируем игроков по позициям
            const playersByPosition = {};
            players.forEach(player => {
              if (!playersByPosition[player.position]) {
                playersByPosition[player.position] = [];
              }
              playersByPosition[player.position].push(player);
            });
            
            // Рендерим фишки с учетом перекрытия
            const playerTokens = players.map((player, playerIndex) => {
              const cellIndex = player.position - 1; // Позиция 1-24, индекс 0-23
              const angle = (cellIndex * 360) / 24;
              const radius = 172.5; // Радиус внутреннего круга
              const x = Math.cos((angle - 90) * Math.PI / 180) * radius;
              const y = Math.sin((angle - 90) * Math.PI / 180) * radius;
              
              // Определяем смещение для фишки, если на клетке несколько игроков
              const playersOnSameCell = playersByPosition[player.position];
              const playerIndexInCell = playersOnSameCell.indexOf(player);
              const totalPlayersOnCell = playersOnSameCell.length;
              
              // Вычисляем смещение от центра клетки
              let offsetX = 0;
              let offsetY = 0;
              
              if (totalPlayersOnCell > 1) {
                // Если на клетке несколько игроков, размещаем их по кругу
                const offsetRadius = 8; // Радиус смещения от центра клетки
                const offsetAngle = (playerIndexInCell * 360) / totalPlayersOnCell;
                offsetX = Math.cos((offsetAngle - 90) * Math.PI / 180) * offsetRadius;
                offsetY = Math.sin((offsetAngle - 90) * Math.PI / 180) * offsetRadius;
              }
              
              return (
                <motion.div
                  key={player.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: movingPlayerId === player.id ? 1.1 : 1, 
                    opacity: 1,
                    x: x + offsetX,
                    y: y + offsetY
                  }}
                  transition={{ 
                    delay: 1.2 + playerIndex * 0.1, 
                    duration: 0.6,
                    x: { duration: isMoving ? 0.2 : 0.6, ease: "easeInOut" },
                    y: { duration: isMoving ? 0.2 : 0.6, ease: "easeInOut" },
                    scale: { duration: 0.3, ease: "easeInOut" }
                  }}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '32px',
                    height: '32px',
                    zIndex: 4
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      background: `linear-gradient(135deg, ${player.color} 0%, ${player.color}DD 100%)`,
                      borderRadius: '50%',
                      border: movingPlayerId === player.id ? '4px solid #FFD700' : '3px solid white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: 'white',
                      boxShadow: movingPlayerId === player.id 
                        ? '0 0 20px rgba(255, 215, 0, 0.8), 0 4px 15px rgba(0,0,0,0.4)' 
                        : '0 4px 15px rgba(0,0,0,0.4), 0 0 10px rgba(255,255,255,0.3)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      animation: movingPlayerId === player.id ? 'pulse 1s infinite' : 'none',
                      '@keyframes pulse': {
                        '0%': { boxShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 4px 15px rgba(0,0,0,0.4)' },
                        '50%': { boxShadow: '0 0 30px rgba(255, 215, 0, 1), 0 4px 15px rgba(0,0,0,0.4)' },
                        '100%': { boxShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 4px 15px rgba(0,0,0,0.4)' }
                      },
                      '&:hover': {
                        transform: 'scale(1.2)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.4)'
                      }
                    }}
                    title={`${player.name} - ${player.profession} (позиция: ${player.position})`}
                  >
                    {player.name.charAt(0)}
                  </Box>
                </motion.div>
              );
            });
            
            // Рендерим счетчики игроков на клетках
            const cellCounters = Object.entries(playersByPosition).map(([position, playersOnCell]) => {
              if (playersOnCell.length > 1) {
                const cellIndex = parseInt(position) - 1;
                const angle = (cellIndex * 360) / 24;
                const radius = 172.5;
                const x = Math.cos((angle - 90) * Math.PI / 180) * radius;
                const y = Math.sin((angle - 90) * Math.PI / 180) * radius;
                
                return (
                  <Box
                    key={`counter-${position}`}
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                      width: '20px',
                      height: '20px',
                      background: 'rgba(0, 0, 0, 0.8)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: 'white',
                      border: '2px solid white',
                      zIndex: 5,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
                    }}
                  >
                    {playersOnCell.length}
                  </Box>
                );
              }
              return null;
            });
            
            // Возвращаем и фишки, и счетчики
            return [...playerTokens, ...cellCounters];
          })()}

          {/* 52 внешние клетки внутри периметра 700x700 - исправленное распределение */}
          {(() => {
            const outerCells = originalBoard.slice(24);
            const cells = [];
            
            // Размер внешнего квадрата
            const outerSquareSize = 700;
            const cellSize = 40; // Увеличил на 15% с 35px до 40px
            
            // Верхний ряд (14 клеток) - равномерно распределяем по всей ширине
            // Клетки 25-38 (индексы 0-13)
            for (let i = 0; i < 14; i++) {
              const cell = outerCells[i];
              const spacing = (outerSquareSize - (14 * cellSize)) / 13; // Равномерные промежутки
              const x = 50 + (i * (cellSize + spacing));
              cells.push(
                <motion.div
                  key={cell.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: (i + 24) * 0.02, duration: 0.4 }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50px',
                      left: `${x}px`,
                      width: `${cellSize}px`,
                      height: `${cellSize}px`,
                      background: `linear-gradient(135deg, ${cell.color} 0%, ${cell.color}DD 100%)`,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                      zIndex: 1,
                      '&:hover': {
                        transform: 'scale(1.2)',
                        boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
                        zIndex: 3
                      }
                    }}
                    title={cell.description}
                  >
                    {/* Иконка клетки */}
                    <Typography variant="h6" sx={{ fontSize: '16px', mb: 0.5 }}>
                      {cell.icon}
                    </Typography>
                    
                    {/* Номер клетки в левом углу */}
                    <Typography
                      sx={{
                        position: 'absolute',
                        top: '2px',
                        left: '4px',
                        fontSize: '8px',
                        fontWeight: 'bold',
                        color: 'white',
                        textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                        zIndex: 2
                      }}
                    >
                      {cell.id - 24}
                    </Typography>
                  </Box>
                </motion.div>
              );
            }
            
            // Правый столбец (12 клеток) - фиксированное расстояние 11px
            // Клетки 15-26 (индексы 14-25)
            for (let i = 0; i < 12; i++) {
              const cellIndex = 14 + i;
              const cell = outerCells[cellIndex];
              const spacing = 11; // Фиксированное расстояние 11px
              const y = 50 + (i + 1) * (cellSize + spacing);
              cells.push(
                <motion.div
                  key={cell.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: (i + 38) * 0.02, duration: 0.4 }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: `${y}px`,
                      right: '50px',
                      width: `${cellSize}px`,
                      height: `${cellSize}px`,
                      background: `linear-gradient(135deg, ${cell.color} 0%, ${cell.color}DD 100%)`,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                      zIndex: 1,
                      '&:hover': {
                        transform: 'scale(1.2)',
                        boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
                        zIndex: 3
                      }
                    }}
                    title={cell.description}
                  >
                    {/* Иконка клетки */}
                    <Typography variant="h6" sx={{ fontSize: '16px', mb: 0.5 }}>
                      {cell.icon}
                    </Typography>
                    
                    {/* Номер клетки в левом углу */}
                    <Typography
                      sx={{
                        position: 'absolute',
                        top: '2px',
                        left: '4px',
                        fontSize: '8px',
                        fontWeight: 'bold',
                        color: 'white',
                        textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                        zIndex: 2
                      }}
                    >
                      {cell.id - 24}
                    </Typography>
                  </Box>
                </motion.div>
              );
            }
            
            // Нижний ряд (14 клеток) - равномерно распределяем по всей ширине
            // Клетки 27-40 (индексы 26-39) - справа налево
            for (let i = 0; i < 14; i++) {
              const cellIndex = 39 - i; // Идем справа налево: 39, 38, 37, ..., 26
              const cell = outerCells[cellIndex];
              const spacing = (outerSquareSize - (14 * cellSize)) / 13; // Равномерные промежутки
              const x = 50 + (i * (cellSize + spacing));
              cells.push(
                <motion.div
                  key={cell.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: (i + 50) * 0.02, duration: 0.4 }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: '50px',
                      left: `${x}px`,
                      width: `${cellSize}px`,
                      height: `${cellSize}px`,
                      background: `linear-gradient(135deg, ${cell.color} 0%, ${cell.color}DD 100%)`,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                      zIndex: 1,
                      '&:hover': {
                        transform: 'scale(1.2)',
                        boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
                        zIndex: 3
                      }
                    }}
                    title={cell.description}
                  >
                    {/* Иконка клетки */}
                    <Typography variant="h6" sx={{ fontSize: '16px', mb: 0.5 }}>
                      {cell.icon}
                    </Typography>
                    
                    {/* Номер клетки в левом углу */}
                    <Typography
                      sx={{
                        position: 'absolute',
                        top: '2px',
                        left: '4px',
                        fontSize: '8px',
                        fontWeight: 'bold',
                        color: 'white',
                        textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                        zIndex: 2
                      }}
                    >
                      {cell.id - 24}
                    </Typography>
                  </Box>
                </motion.div>
              );
            }
            
            // Левый столбец (12 клеток) - фиксированное расстояние 11px
            // Клетки 41-52 (индексы 40-51) - снизу вверх
            for (let i = 0; i < 12; i++) {
              const cellIndex = 51 - i; // Идем снизу вверх: 51, 50, 49, ..., 40
              const cell = outerCells[cellIndex];
              const spacing = 11; // Фиксированное расстояние 11px
              const y = 50 + (i + 1) * (cellSize + spacing);
              cells.push(
                <motion.div
                  key={cell.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: (i + 64) * 0.02, duration: 0.4 }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: `${y}px`,
                      left: '50px',
                      width: `${cellSize}px`,
                      height: `${cellSize}px`,
                      background: `linear-gradient(135deg, ${cell.color} 0%, ${cell.color}DD 100%)`,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                      zIndex: 1,
                      '&:hover': {
                        transform: 'scale(1.2)',
                        boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
                        zIndex: 3
                      }
                    }}
                    title={cell.description}
                  >
                    {/* Иконка клетки */}
                    <Typography variant="h6" sx={{ fontSize: '16px', mb: 0.5 }}>
                      {cell.icon}
                    </Typography>
                    
                    {/* Номер клетки в левом углу */}
                    <Typography
                      sx={{
                        position: 'absolute',
                        top: '2px',
                        left: '4px',
                        fontSize: '8px',
                        fontWeight: 'bold',
                        color: 'white',
                        textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                        zIndex: 2
                      }}
                    >
                      {cell.id - 24}
                    </Typography>
                  </Box>
                </motion.div>
              );
            }
            
            return cells;
          })()}

          {/* Визуальная рамка для внешнего квадрата 700x700 */}
          <Box
            sx={{
              position: 'absolute',
              top: '50px',
              left: '50px',
              width: '700px',
              height: '700px',
              border: '2px dashed rgba(139, 92, 246, 0.6)',
              borderRadius: '0',
              pointerEvents: 'none',
              zIndex: 0
            }}
          />
        </Box>
      </Box>

      {/* Правая панель управления - 6 элементов */}
      <Box sx={{
        width: '320px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: '20px'
      }}>
        {/* Заголовок панели */}
        <Typography variant="h5" sx={{ 
          color: 'white', 
          textAlign: 'center',
          mb: 2,
          fontWeight: 'bold'
        }}>
          🎮 Управление
        </Typography>



        {/* 2. Имя и профессия игрока */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Box sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '15px',
            padding: '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Button
              variant="text"
              fullWidth
              onClick={() => {
                console.log('👤 [OriginalGameBoard] Кнопка профиля игрока нажата');
                openPlayerModal(players[currentPlayer]);
              }}
              sx={{
                p: 0,
                background: 'transparent',
                color: 'transparent',
                textTransform: 'none',
                '&:hover': {
                  background: 'rgba(255,255,255,0.05)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Avatar sx={{ bgcolor: '#8B5CF6', width: 50, height: 50 }}>
                  {playerData?.username?.charAt(0) || 'M'}
                </Avatar>
                <Box sx={{ flex: 1, textAlign: 'left' }}>
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {playerData?.username || 'MAG'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                    💼 Менеджер
                  </Typography>
                  
                  {/* Информация о детях */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: '0.8rem' }}>
                      👶 {childrenCount}
                    </Typography>
                  </Box>
                  
                  {/* Кнопка для быстрого открытия карточки профессии */}
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation(); // Предотвращаем открытие модального окна профиля
                      openProfessionCard('engineer'); // Менеджер = инженер
                    }}
                    sx={{
                      mt: 1,
                      color: '#8B5CF6',
                      borderColor: '#8B5CF6',
                      borderRadius: '6px',
                      textTransform: 'none',
                      fontSize: '0.7rem',
                      fontWeight: '500',
                      py: 0.5,
                      px: 1.5,
                      '&:hover': {
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        borderColor: '#7C3AED'
                      }
                    }}
                  >
                    📋 Карточка
                  </Button>
                </Box>
              </Box>
            </Button>
          </Box>
        </motion.div>



        {/* 3. Банк */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <Box sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '15px',
            padding: '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Button
              variant="text"
              fullWidth
              onClick={() => {
                console.log('🏦 [OriginalGameBoard] Кнопка банка нажата');
                openBankModal();
              }}
              sx={{
                p: 0,
                background: 'transparent',
                color: 'transparent',
                textTransform: 'none',
                '&:hover': {
                  background: 'rgba(255,255,255,0.05)'
                }
              }}
            >
              <Box sx={{ textAlign: 'center', width: '100%' }}>
                <Typography variant="h6" sx={{ color: 'white', mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <AccountBalance /> Банк
                </Typography>
                <Typography variant="h4" sx={{ color: '#10B981', fontWeight: 'bold' }}>
                  ${bankBalance.toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ color: '#94A3B8', mt: 1 }}>
                  Доход: $1,200 | Расходы: $800
                </Typography>
                
                                  {/* Информация о кредитах */}
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <Typography variant="body2" sx={{ color: '#94A3B8', mb: 1, fontSize: '0.8rem' }}>
                      💳 Кредит: ${playerCredit.toLocaleString()}
                    </Typography>
                    {playerCredit > 0 && (
                      <Typography variant="body2" sx={{ color: '#EF4444', mb: 1, fontSize: '0.7rem' }}>
                        💸 Платежи: ${Math.floor(playerCredit / 1000) * 100}/мес
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ color: '#94A3B8', mb: 1, fontSize: '0.8rem' }}>
                      Макс: ${getMaxCredit().toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#94A3B8', mb: 1, fontSize: '0.8rem' }}>
                      PAYDAY: ${getCashFlow().toLocaleString()}/мес
                    </Typography>
                    
                    {/* Простой статус кредита */}
                    <Box sx={{ 
                      background: 'rgba(255, 255, 255, 0.05)', 
                      borderRadius: '8px', 
                      p: 1, 
                      mb: 2,
                      border: `1px solid ${playerCredit > 0 ? '#EF4444' : '#10B981'}40`
                    }}>
                      <Typography variant="body2" sx={{ color: playerCredit > 0 ? '#EF4444' : '#10B981', fontSize: '0.7rem', textAlign: 'center', fontWeight: 'bold' }}>
                        {playerCredit > 0 ? '💳 Есть кредит' : '✅ Без кредитов'}
                      </Typography>
                    </Box>
                    

                  
                  {/* Кнопки управления кредитом */}
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <Button
                      variant="contained"
                      onClick={() => setShowCreditModal(true)}
                      sx={{
                        flex: 1,
                        background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                        color: 'white',
                        fontWeight: 'bold',
                        py: 1,
                        borderRadius: '8px',
                        fontSize: '0.7rem',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                          transform: 'scale(1.02)'
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      💳 Взять
                    </Button>
                    
                    {playerCredit > 0 && (
                      <Button
                        variant="contained"
                        onClick={() => {
                          setShowCreditModal(true);
                          // Фокус на погашении кредита
                          setTimeout(() => {
                            const payoffField = document.querySelector('input[placeholder="сумма погашения"]');
                            if (payoffField) {
                              payoffField.focus();
                            }
                          }, 100);
                        }}
                        sx={{
                          flex: 1,
                          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                          color: 'white',
                          fontWeight: 'bold',
                          py: 1,
                          borderRadius: '8px',
                          fontSize: '0.7rem',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                            transform: 'scale(1.02)'
                          },
                          transition: 'all 0.2s ease-in-out'
                        }}
                      >
                        💰 Погасить
                      </Button>
                    )}
                  </Box>
                </Box>
              </Box>
            </Button>
          </Box>
        </motion.div>

        {/* 4. Активы */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Box sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '15px',
            padding: '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Button
              variant="text"
              fullWidth
              onClick={() => {
                console.log('💼 [OriginalGameBoard] Кнопка активов нажата');
                openAssetsModal();
              }}
              sx={{
                p: 0,
                background: 'transparent',
                color: 'transparent',
                textTransform: 'none',
                '&:hover': {
                  background: 'rgba(255,255,255,0.05)'
                }
              }}
            >
              <Box sx={{ textAlign: 'center', width: '100%' }}>
                <Typography variant="h6" sx={{ color: 'white', mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <Inventory /> Активы
                </Typography>
                <Typography variant="h4" sx={{ color: '#10B981', fontWeight: 'bold', mb: 2 }}>
                  ${getTotalAssetsValue().toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2 }}>
                  Доход: ${getTotalAssetsIncome().toLocaleString()}/мес
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {/* Показываем только Дом */}
                  {assets
                    .filter(asset => asset.type === 'house') // Только дом
                    .map((asset) => (
                      <Chip 
                        key={asset.id}
                        label={`${asset.icon} ${asset.name}: $${asset.value.toLocaleString()}`} 
                        size="small" 
                        sx={{ 
                          background: `${asset.color}20`, 
                          color: asset.color,
                          border: `1px solid ${asset.color}40`,
                          '&:hover': {
                            background: `${asset.color}30`,
                            cursor: 'pointer'
                          }
                        }} 
                      />
                    ))}
                  
                  {/* Показываем количество скрытых активов */}
                  {assets.length > 1 && (
                    <Chip 
                      label={`+${assets.length - 1} еще...`}
                      size="small" 
                      sx={{ 
                        background: 'rgba(107, 114, 128, 0.2)', 
                        color: '#6B7280',
                        border: '1px solid rgba(107, 114, 128, 0.4)',
                        fontStyle: 'italic',
                        '&:hover': {
                          background: 'rgba(107, 114, 128, 0.3)',
                          cursor: 'pointer'
                        }
                      }} 
                    />
                  )}
                </Box>
              </Box>
            </Button>
          </Box>
        </motion.div>

        {/* 5. Бросить кубик с анимацией */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <Button
            variant="contained"
            onClick={canRollDice ? rollDice : passTurn}
            disabled={isRolling}
            sx={{
              width: '100%',
              height: '80px',
              background: canRollDice 
                ? 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)'
                : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: 'white',
              borderRadius: '15px',
              fontSize: '18px',
              fontWeight: 'bold',
              boxShadow: canRollDice 
                ? '0 8px 25px rgba(139, 92, 246, 0.3)'
                : '0 8px 25px rgba(16, 185, 129, 0.3)',
              '&:hover': {
                background: canRollDice 
                  ? 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)'
                  : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                boxShadow: canRollDice 
                  ? '0 12px 35px rgba(139, 92, 246, 0.4)'
                  : '0 12px 35px rgba(16, 185, 129, 0.4)'
              },
              '&:disabled': {
                background: canRollDice 
                  ? 'rgba(139, 92, 246, 0.5)'
                  : 'rgba(16, 185, 129, 0.5)'
              }
            }}
          >
            {isRolling ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
              >
                🎲
              </motion.div>
            ) : canRollDice ? (
              <>
                🎲 БРОСИТЬ КУБИК
                <br />
                <Typography variant="h4" sx={{ mt: 1 }}>
                  {diceValue}
                </Typography>
              </>
            ) : (
              <>
                ⏭️ ПЕРЕХОД ХОДА
                <br />
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Кубик уже брошен
                </Typography>
              </>
            )}
          </Button>
        </motion.div>

        {/* 6. Шкала тайминга */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Box sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '15px',
            padding: '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Timer /> Время хода
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={timerProgress} 
              sx={{
                height: 12,
                borderRadius: 6,
                background: 'rgba(255, 255, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  background: turnTimeLeft > 60 
                    ? 'linear-gradient(90deg, #10B981 0%, #10B981 100%)' // Зеленый для первой минуты
                    : turnTimeLeft > 20 
                    ? 'linear-gradient(90deg, #F59E0B 0%, #F59E0B 100%)' // Желтый для второй минуты
                    : 'linear-gradient(90deg, #EF4444 0%, #EF4444 100%)', // Красный для последних 20 секунд
                  borderRadius: 6,
                  transition: 'all 0.3s ease',
                  animation: isTurnEnding ? 'pulse 1s infinite' : 'none'
                }
              }}
            />
            <Typography variant="body2" sx={{ 
              color: turnTimeLeft > 60 ? '#10B981' : turnTimeLeft > 20 ? '#F59E0B' : '#EF4444', 
              mt: 1, 
              textAlign: 'center',
              fontWeight: 'bold',
              animation: isTurnEnding ? 'shake 0.5s infinite' : 'none'
            }}>
              {Math.floor(turnTimeLeft / 60)}:{(turnTimeLeft % 60).toString().padStart(2, '0')} • {turnTimeLeft > 60 ? '🟢' : turnTimeLeft > 20 ? '🟡' : '🔴'} {turnTimeLeft > 60 ? 'Первая минута' : turnTimeLeft > 20 ? 'Вторая минута' : 'КРИТИЧЕСКОЕ ВРЕМЯ!'}
            </Typography>
          </Box>
        </motion.div>

        {/* Очередность игроков - перенесено вниз */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <Box sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '15px',
            padding: '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            mb: 2
          }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Group /> Очередность игроков
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant="text"
                fullWidth
                onClick={() => handlePlayerTurn(0)}
                sx={{
                  p: 1,
                  background: currentPlayer === 0 ? '#8B5CF6' : 'transparent',
                  color: 'white',
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  border: currentPlayer === 0 ? 'none' : '1px solid rgba(255,255,255,0.3)',
                  '&:hover': {
                    background: currentPlayer === 0 ? '#7C3AED' : 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                1. MAG {currentPlayer === 0 ? '(Ход)' : ''}
              </Button>
              <Button
                variant="text"
                fullWidth
                onClick={() => handlePlayerTurn(1)}
                sx={{
                  p: 1,
                  background: currentPlayer === 1 ? '#8B5CF6' : 'transparent',
                  color: 'white',
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  border: currentPlayer === 1 ? 'none' : '1px solid rgba(255,255,255,0.3)',
                  '&:hover': {
                    background: currentPlayer === 1 ? '#7C3AED' : 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                2. Алексей {currentPlayer === 1 ? '(Ход)' : ''}
              </Button>
              <Button
                variant="text"
                fullWidth
                onClick={() => handlePlayerTurn(2)}
                sx={{
                  p: 1,
                  background: currentPlayer === 2 ? '#8B5CF6' : 'transparent',
                  color: 'white',
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  border: currentPlayer === 2 ? 'none' : '1px solid rgba(255,255,255,0.3)',
                  '&:hover': {
                    background: currentPlayer === 2 ? '#7C3AED' : 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                3. Мария {currentPlayer === 2 ? '(Ход)' : ''}
              </Button>
              <Button
                variant="text"
                fullWidth
                onClick={() => handlePlayerTurn(3)}
                sx={{
                  p: 1,
                  background: currentPlayer === 3 ? '#8B5CF6' : 'transparent',
                  color: 'white',
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  border: currentPlayer === 3 ? 'none' : '1px solid rgba(255,255,255,0.3)',
                  '&:hover': {
                    background: currentPlayer === 3 ? '#7C3AED' : 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                4. Дмитрий {currentPlayer === 3 ? '(Ход)' : ''}
              </Button>
            </Box>
          </Box>
        </motion.div>

        {/* Кнопка выхода */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Button
            variant="contained"
            startIcon={<ExitToApp />}
            onClick={onExit}
            sx={{
              width: '100%',
              height: '50px',
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              color: 'white',
              borderRadius: '15px',
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: '0 8px 25px rgba(239, 68, 68, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                boxShadow: '0 12px 35px rgba(239, 68, 68, 0.4)'
              }
            }}
          >
            🚪 ВЫХОД
          </Button>
        </motion.div>
      </Box>

      {/* Модальное окно профиля игрока */}
      <Dialog
        open={showPlayerModal}
        onClose={closeModals}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: 'white', 
          textAlign: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          pb: 2
        }}>
          👤 Профиль игрока
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          {selectedPlayer && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              
              {/* Аватар и основная информация */}
              <Box sx={{
                background: 'rgba(139, 92, 246, 0.1)',
                borderRadius: '15px',
                padding: '20px',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                textAlign: 'center'
              }}>
                <Avatar sx={{ 
                  bgcolor: '#8B5CF6', 
                  width: 80, 
                  height: 80, 
                  fontSize: '2rem',
                  mx: 'auto',
                  mb: 2
                }}>
                  {selectedPlayer.name?.charAt(0) || '?'}
                </Avatar>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                  {selectedPlayer.name}
                </Typography>
                <Typography variant="h6" sx={{ color: '#94A3B8', mb: 2 }}>
                  {selectedPlayer.profession}
                </Typography>
                
                {/* Кнопка для открытия карточки профессии */}
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    // Определяем ID профессии на основе названия
                    let professionId = 'engineer'; // по умолчанию
                    if (selectedPlayer.profession?.includes('Учитель')) professionId = 'teacher';
                    else if (selectedPlayer.profession?.includes('Полицейский')) professionId = 'police';
                    else if (selectedPlayer.profession?.includes('Дворник')) professionId = 'janitor';
                    else if (selectedPlayer.profession?.includes('Инженер')) professionId = 'engineer';
                    else if (selectedPlayer.profession?.includes('Врач')) professionId = 'doctor';
                    
                    openProfessionCard(professionId);
                  }}
                  sx={{
                    color: '#8B5CF6',
                    borderColor: '#8B5CF6',
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    '&:hover': {
                      backgroundColor: 'rgba(139, 92, 246, 0.1)',
                      borderColor: '#7C3AED'
                    }
                  }}
                >
                  📋 Открыть карточку профессии
                </Button>
                
                {/* Статус хода */}
                <Box sx={{
                  background: currentPlayer === players.findIndex(p => p.name === selectedPlayer.name) 
                    ? 'rgba(16, 185, 129, 0.2)' 
                    : 'rgba(107, 114, 128, 0.2)',
                  borderRadius: '10px',
                  padding: '8px 16px',
                  display: 'inline-block'
                }}>
                  <Typography variant="body2" sx={{ 
                    color: currentPlayer === players.findIndex(p => p.name === selectedPlayer.name) 
                      ? '#10B981' 
                      : '#6B7280',
                    fontWeight: 'bold'
                  }}>
                    {currentPlayer === players.findIndex(p => p.name === selectedPlayer.name) 
                      ? '🎯 Активный ход' 
                      : '⏳ Ожидание хода'}
                  </Typography>
                </Box>
              </Box>

              {/* Игровая статистика */}
              <Box sx={{
                background: 'rgba(16, 185, 129, 0.1)',
                borderRadius: '15px',
                padding: '20px',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                <Typography variant="h6" sx={{ color: '#10B981', mb: 2, textAlign: 'center' }}>
                  📊 Игровая статистика
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px'
                  }}>
                    <Typography sx={{ color: 'white' }}>Позиция на поле:</Typography>
                    <Typography sx={{ color: '#10B981', fontWeight: 'bold' }}>
                      Клетка {selectedPlayer.position}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px'
                  }}>
                    <Typography sx={{ color: 'white' }}>Цвет фишки:</Typography>
                    <Box sx={{ 
                      width: 20, 
                      height: 20, 
                      borderRadius: '50%', 
                      background: selectedPlayer.color,
                      border: '2px solid rgba(255, 255, 255, 0.3)'
                    }} />
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px'
                  }}>
                    <Typography sx={{ color: 'white' }}>ID игрока:</Typography>
                    <Typography sx={{ color: '#94A3B8', fontWeight: 'bold' }}>
                      #{selectedPlayer.id}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Дополнительная информация */}
              <Box sx={{
                background: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '15px',
                padding: '20px',
                border: '1px solid rgba(59, 130, 246, 0.3)'
              }}>
                <Typography variant="h6" sx={{ color: '#3B82F6', mb: 2, textAlign: 'center' }}>
                  ℹ️ Дополнительно
                </Typography>
                
                <Typography variant="body2" sx={{ color: '#94A3B8', textAlign: 'center', lineHeight: 1.6 }}>
                  Игрок {selectedPlayer.name} участвует в игре "Energy of Money". 
                  {selectedPlayer.profession && ` Профессия: ${selectedPlayer.profession}.`}
                  {currentPlayer === players.findIndex(p => p.name === selectedPlayer.name) 
                    ? ' Сейчас его ход!' 
                    : ' Ожидает своей очереди.'}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          justifyContent: 'center'
        }}>
          <Button
            onClick={closeModals}
            sx={{
              background: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: '10px',
              '&:hover': {
                background: 'linear-gradient(135deg, #4B5563 0%, #374151 100%)'
              }
            }}
          >
            ✋ Закрыть
          </Button>
        </DialogActions>
      </Dialog>

      {/* Модальное окно активов */}
      <Dialog
        open={showAssetsModal}
        onClose={closeModals}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: 'white', 
          textAlign: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          pb: 2
        }}>
          💼 Портфель активов
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* Общая статистика */}
            <Box sx={{
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '15px',
              padding: '20px',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              textAlign: 'center'
            }}>
              <Typography variant="h5" sx={{ color: '#10B981', mb: 2, fontWeight: 'bold' }}>
                💰 Общая стоимость активов
              </Typography>
              <Typography variant="h3" sx={{ color: '#10B981', fontWeight: 'bold', mb: 1 }}>
                ${getTotalAssetsValue().toLocaleString()}
              </Typography>
              <Typography variant="h6" sx={{ color: '#94A3B8' }}>
                📈 Пассивный доход: ${getTotalAssetsIncome().toLocaleString()}/мес
              </Typography>
            </Box>

            {/* Карточки активов */}
            <Box sx={{
              background: 'rgba(139, 92, 246, 0.1)',
              borderRadius: '15px',
              padding: '20px',
              border: '1px solid rgba(139, 92, 246, 0.3)'
            }}>
              <Typography variant="h6" sx={{ color: '#8B5CF6', mb: 3, textAlign: 'center' }}>
                🎯 Детали активов
              </Typography>
              
              <Box sx={{ display: 'grid', gap: 2 }}>
                {assets.map((asset) => (
                  <Box
                    key={asset.id}
                    sx={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '15px',
                      padding: '20px',
                      border: `1px solid ${asset.color}40`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.08)',
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 25px ${asset.color}30`
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box sx={{
                        fontSize: '2rem',
                        width: 50,
                        height: 50,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: `${asset.color}20`,
                        borderRadius: '12px',
                        border: `2px solid ${asset.color}40`
                      }}>
                        {asset.icon}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                            {asset.name}
                          </Typography>
                          {asset.quantity > 1 && (
                            <Chip 
                              label={`x${asset.quantity}`}
                              size="small"
                              sx={{
                                backgroundColor: asset.color,
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '0.8rem'
                              }}
                            />
                          )}
                        </Box>
                        <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                          {asset.description}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      <Box sx={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        borderRadius: '8px',
                        padding: '12px',
                        textAlign: 'center',
                        border: '1px solid rgba(16, 185, 129, 0.3)'
                      }}>
                        <Typography variant="body2" sx={{ color: '#94A3B8', mb: 1 }}>
                          💰 Стоимость
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#10B981', fontWeight: 'bold' }}>
                          ${asset.value.toLocaleString()}
                        </Typography>
                      </Box>
                      
                      <Box sx={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        borderRadius: '8px',
                        padding: '12px',
                        textAlign: 'center',
                        border: '1px solid rgba(59, 130, 246, 0.3)'
                      }}>
                        <Typography variant="body2" sx={{ color: '#94A3B8', mb: 1 }}>
                          📈 Доход/мес
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#3B82F6', fontWeight: 'bold' }}>
                          ${asset.income.toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{
                      background: 'rgba(139, 92, 246, 0.1)',
                      borderRadius: '8px',
                      padding: '12px',
                      mt: 2,
                      textAlign: 'center',
                      border: '1px solid rgba(139, 92, 246, 0.3)'
                    }}>
                      <Typography variant="body2" sx={{ color: '#94A3B8', mb: 1 }}>
                        🎯 Цена покупки
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#8B5CF6', fontWeight: 'bold' }}>
                        ${asset.cost.toLocaleString()}
                      </Typography>
                    </Box>
                    
                    {/* Кнопка передачи актива */}
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <Button
                        variant="outlined"
                        onClick={() => handleTransferAsset(asset)}
                        sx={{
                          borderColor: '#EF4444',
                          color: '#EF4444',
                          '&:hover': {
                            borderColor: '#DC2626',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)'
                          }
                        }}
                      >
                        🔄 передать
                      </Button>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          justifyContent: 'center'
        }}>
          <Button
            onClick={closeModals}
            sx={{
              background: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: '10px',
              '&:hover': {
                background: 'linear-gradient(135deg, #4B5563 0%, #374151 100%)'
              }
            }}
          >
            ✋ Закрыть
          </Button>
        </DialogActions>
      </Dialog>

      {/* Модальное окно передачи активов */}
      <Dialog
        open={showAssetTransferModal}
        onClose={() => setShowAssetTransferModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)',
            borderRadius: '20px',
            border: '2px solid #6B7280',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: 'white', 
          textAlign: 'center',
          borderBottom: '1px solid #6B7280',
          pb: 2
        }}>
          🎁 Передать актив
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, textAlign: 'center' }}>
          {selectedAssetForTransfer && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                {selectedAssetForTransfer.icon} {selectedAssetForTransfer.name}
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>
                Выберите игрока, которому хотите передать этот актив:
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {players.map((player, index) => (
                  index !== currentPlayer && (
                    <Button
                      key={player.id}
                      onClick={() => handleTransferAssetToPlayer(index)}
                      sx={{
                        background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                        color: 'white',
                        py: 2,
                        borderRadius: '15px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                          transform: 'scale(1.02)'
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      🎯 {player.name}
                    </Button>
                  )
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          borderTop: '1px solid #6B7280',
          justifyContent: 'center'
        }}>
          <Button
            onClick={() => setShowAssetTransferModal(false)}
            sx={{
              background: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(135deg, #4B5563 0%, #374151 100%)'
              }
            }}
          >
            ❌ Отмена
          </Button>
        </DialogActions>
      </Dialog>

      {/* Модальное окно банка */}
      <Dialog
        open={showBankModal}
        onClose={closeModals}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: 'white', 
          textAlign: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          pb: 2
        }}>
          🏦 Банковские операции
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* 1. Текущий баланс */}
            <Box sx={{
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '15px',
              padding: '20px',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              <Typography variant="h6" sx={{ color: '#10B981', mb: 1, textAlign: 'center' }}>
                💰 Текущий баланс
              </Typography>
              <Typography variant="h3" sx={{ color: '#10B981', fontWeight: 'bold', textAlign: 'center' }}>
                ${bankBalance.toLocaleString()}
              </Typography>
            </Box>

            {/* 2. Перевод средств */}
            <Box sx={{
              background: 'rgba(139, 92, 246, 0.1)',
              borderRadius: '15px',
              padding: '20px',
              border: '1px solid rgba(139, 92, 246, 0.3)'
            }}>
              <Typography variant="h6" sx={{ color: '#8B5CF6', mb: 2, textAlign: 'center' }}>
                💸 Перевод средств
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Выбор получателя */}
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Выберите получателя
                  </InputLabel>
                  <Select
                    value={selectedRecipient}
                    onChange={(e) => setSelectedRecipient(e.target.value)}
                    sx={{
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.3)'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.5)'
                      },
                      '& .MuiSvgIcon-root': {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }}
                  >
                    {players.map((player, index) => (
                      <MenuItem key={index} value={player.name} disabled={index === currentPlayer}>
                        {player.name} {index === currentPlayer ? '(Вы)' : ''}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Сумма перевода */}
                <TextField
                  fullWidth
                  label="Сумма перевода ($)"
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)'
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.5)'
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }
                  }}
                />

                {/* Кнопки действий */}
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  <Button
                    variant="contained"
                    onClick={handleTransfer}
                    disabled={!transferAmount || !selectedRecipient}
                    sx={{
                      flex: 1,
                      background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)'
                      },
                      '&:disabled': {
                        background: 'rgba(139, 92, 246, 0.5)'
                      }
                    }}
                  >
                    💸 Выполнить перевод
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={resetTransferForm}
                    sx={{
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      color: 'rgba(255, 255, 255, 0.7)',
                      '&:hover': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        background: 'rgba(255, 255, 255, 0.05)'
                      }
                    }}
                  >
                    🔄 Сбросить
                  </Button>
                </Box>
              </Box>
            </Box>

            {/* 3. История переводов */}
            <Box sx={{
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '15px',
              padding: '20px',
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}>
              <Typography variant="h6" sx={{ color: '#3B82F6', mb: 2, textAlign: 'center' }}>
                📋 История переводов
              </Typography>
              
              <List sx={{ maxHeight: '200px', overflow: 'auto' }}>
                {transferHistory.map((transfer, index) => (
                  <React.Fragment key={transfer.id}>
                    <ListItem sx={{ 
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px',
                      mb: 1
                    }}>
                      <ListItemText
                        primary={
                          <Typography sx={{ color: 'white', fontWeight: 'bold' }}>
                            {transfer.from} → {transfer.to}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography sx={{ color: '#10B981', fontWeight: 'bold' }}>
                              ${transfer.amount.toLocaleString()}
                            </Typography>
                            <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>
                              {transfer.date} {transfer.time}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < transferHistory.length - 1 && <Divider sx={{ background: 'rgba(255, 255, 255, 0.1)' }} />}
                  </React.Fragment>
                ))}
              </List>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          justifyContent: 'center'
        }}>
          <Button
            onClick={closeModals}
            sx={{
              background: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: '10px',
              '&:hover': {
                background: 'linear-gradient(135deg, #4B5563 0%, #374151 100%)'
              }
            }}
          >
            ✋ Закрыть
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast уведомления */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setToast({ ...toast, open: false })} 
          severity={toast.severity}
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>

      {/* Модальное окно рождения ребенка */}
      <Dialog
        open={showChildModal}
        onClose={() => setShowChildModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
            borderRadius: '20px',
            border: '2px solid #F59E0B',
            boxShadow: '0 25px 50px rgba(245, 158, 11, 0.3)'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: '#92400E', 
          textAlign: 'center',
          borderBottom: '1px solid #F59E0B',
          pb: 2
        }}>
          👶 Клетка "Ребенок"
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: '#92400E', mb: 2 }}>
            {players[currentPlayer]?.name}, вы попали на клетку "Ребенок"!
          </Typography>
          <Typography variant="body1" sx={{ color: '#92400E', mb: 3 }}>
            Бросьте дополнительный кубик, чтобы узнать, родился ли ребенок:
          </Typography>
          <Typography variant="body2" sx={{ color: '#92400E', mb: 3 }}>
            🎲 1-4: Ребенок родился! +$5,000 и увеличение ежемесячных расходов
            <br />
            🎲 5-6: Ребенок не родился
          </Typography>
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          borderTop: '1px solid #F59E0B',
          justifyContent: 'center'
        }}>
          <Button
            onClick={handleChildBirth}
            sx={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
              }
            }}
          >
            🎲 Бросить кубик
          </Button>
        </DialogActions>
      </Dialog>

      {/* Модальное окно выбора типа сделки */}
      <Dialog
        open={showDealTypeModal}
        onClose={() => setShowDealTypeModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)',
            borderRadius: '20px',
            border: '2px solid #6B7280',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: 'white', 
          textAlign: 'center',
          borderBottom: '1px solid #6B7280',
          pb: 2
        }}>
          🎯 Клетка "Сделка"
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: 'white', mb: 3 }}>
            {players[currentPlayer]?.name}, выберите тип сделки:
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              onClick={() => handleDealTypeSelection('small')}
              sx={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: 'white',
                px: 4,
                py: 2,
                borderRadius: '15px',
                fontSize: '16px',
                fontWeight: 'bold',
                minWidth: '150px',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                }
              }}
            >
              🏪 Малая сделка
            </Button>
            
            <Button
              onClick={() => handleDealTypeSelection('big')}
              sx={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                color: 'white',
                px: 4,
                py: 2,
                borderRadius: '15px',
                fontSize: '16px',
                fontWeight: 'bold',
                minWidth: '150px',
                '&:hover': {
                  background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)'
                }
              }}
            >
              🏢 Большая сделка
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Модальное окно сделки */}
      <Dialog
        open={showDealModal}
        onClose={() => handleCancelDeal()}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)',
            borderRadius: '20px',
            border: '2px solid #6B7280',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: 'white', 
          textAlign: 'center',
          borderBottom: '1px solid #6B7280',
          pb: 2
        }}>
          💼 Карточка сделки
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, textAlign: 'center' }}>
          {currentDealCard && (
            <Box>
              <Typography variant="h5" sx={{ color: 'white', mb: 2, fontWeight: 'bold' }}>
                {currentDealCard.name}
              </Typography>
              <Typography variant="body1" sx={{ color: '#94A3B8', mb: 3 }}>
                {currentDealCard.description}
              </Typography>
              
              <Box sx={{ 
                background: 'rgba(255, 255, 255, 0.1)', 
                borderRadius: '15px', 
                p: 3, 
                mb: 3 
              }}>
                <Typography variant="h6" sx={{ color: '#10B981', mb: 1 }}>
                  Стоимость: ${currentDealCard.cost.toLocaleString()}
                </Typography>
                <Typography variant="h6" sx={{ color: '#3B82F6' }}>
                  Доход: ${currentDealCard.income.toLocaleString()}/мес
                </Typography>
              </Box>
              
              <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>
                У вас: ${playerMoney.toLocaleString()}
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          borderTop: '1px solid #6B7280',
          justifyContent: 'center',
          gap: 2,
          flexWrap: 'wrap'
        }}>
          <Button
            onClick={handleCancelDeal}
            sx={{
              background: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
              color: 'white',
              px: 3,
              py: 1.5,
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(135deg, #4B5563 0%, #374151 100%)'
              }
            }}
          >
            ❌ Отмена
          </Button>
          
          <Button
            onClick={handleBuyDeal}
            disabled={!currentDealCard || playerMoney < currentDealCard.cost}
            sx={{
              background: playerMoney >= (currentDealCard?.cost || 0)
                ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
              color: 'white',
              px: 3,
              py: 1.5,
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 'bold',
              '&:hover': {
                background: playerMoney >= (currentDealCard?.cost || 0)
                  ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                  : 'linear-gradient(135deg, #4B5563 0%, #374151 100%)'
              }
            }}
          >
            💰 Купить
          </Button>

          <Button
            onClick={() => {
              setCreditModalFromDeal(true);
              setShowCreditModal(true);
            }}
            sx={{
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              color: 'white',
              px: 3,
              py: 1.5,
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)'
              }
            }}
          >
            💳 Взять кредит
          </Button>

          <Button
            onClick={handlePassCardToPlayer}
            sx={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
              color: 'white',
              px: 3,
              py: 1.5,
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)'
              }
            }}
          >
            🎁 Передать игроку
          </Button>
        </DialogActions>
      </Dialog>

      {/* Модальное окно выбора игрока для передачи карточки */}
      <Dialog
        open={showPlayerSelectionModal}
        onClose={() => setShowPlayerSelectionModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)',
            borderRadius: '20px',
            border: '2px solid #6B7280',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: 'white', 
          textAlign: 'center',
          borderBottom: '1px solid #6B7280',
          pb: 2
        }}>
          🎁 Передать карточку игроку
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: 'white', mb: 3 }}>
            Выберите игрока, которому хотите передать карточку "{currentDealCard?.name}":
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {players.map((player, index) => (
              index !== currentPlayer && (
                <Button
                  key={player.id}
                  onClick={() => handlePassCardToSpecificPlayer(index)}
                  sx={{
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                    color: 'white',
                    py: 2,
                    borderRadius: '15px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                      transform: 'scale(1.02)'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  🎯 {player.name}
                </Button>
              )
            ))}
          </Box>
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          borderTop: '1px solid #6B7280',
          justifyContent: 'center'
        }}>
          <Button
            onClick={() => setShowPlayerSelectionModal(false)}
            sx={{
              background: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(135deg, #4B5563 0%, #374151 100%)'
              }
            }}
          >
            ❌ Отмена
          </Button>
        </DialogActions>
      </Dialog>

      {/* Модальное окно кредитов */}
      <Dialog
        open={showCreditModal}
        onClose={closeCreditModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)',
            borderRadius: '20px',
            border: '2px solid #6B7280',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: 'white', 
          textAlign: 'center',
          borderBottom: '1px solid #6B7280',
          pb: 2
        }}>
          💳 Управление кредитами
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            {/* Левая колонка - Информация */}
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                background: 'rgba(255, 255, 255, 0.1)', 
                borderRadius: '15px', 
                p: 3, 
                mb: 3 
              }}>
                <Typography variant="h6" sx={{ color: 'white', mb: 2, textAlign: 'center' }}>
                  📊 Финансовая информация
                </Typography>
                <Typography variant="body1" sx={{ color: '#94A3B8', mb: 1 }}>
                  💰 Деньги: ${playerMoney.toLocaleString()}
                </Typography>
                <Typography variant="body1" sx={{ color: '#94A3B8', mb: 1 }}>
                  💳 Текущий кредит: ${playerCredit.toLocaleString()}
                </Typography>
                <Typography variant="body1" sx={{ color: '#94A3B8', mb: 1 }}>
                  📈 Денежный поток: ${getCashFlow().toLocaleString()}/мес
                </Typography>
                <Typography variant="body1" sx={{ color: '#10B981', fontWeight: 'bold' }}>
                  🎯 Максимальный кредит: ${getMaxCredit().toLocaleString()}
                </Typography>
              </Box>
            </Grid>

            {/* Правая колонка - Действия */}
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                background: 'rgba(255, 255, 255, 0.1)', 
                borderRadius: '15px', 
                p: 3 
              }}>
                <Typography variant="h6" sx={{ color: 'white', mb: 2, textAlign: 'center' }}>
                  🚀 Быстрые действия
                </Typography>
                
                {/* Быстрые суммы для взятия кредита */}
                <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2 }}>
                  Взять кредит:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  {[1000, 2000, 5000, 10000].map((amount) => {
                    const maxCredit = getMaxCredit();
                    const canTake = amount <= maxCredit && (playerCredit + amount) <= maxCredit;
                    return (
                      <Button
                        key={amount}
                        onClick={() => creditModalFromDeal ? handleTakeCreditFromDeal(amount) : handleTakeCredit(amount)}
                        disabled={!canTake}
                        size="small"
                        sx={{
                          background: canTake 
                            ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                            : 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
                          color: 'white',
                          px: 2,
                          py: 1,
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          '&:hover': {
                            background: canTake 
                              ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                              : 'linear-gradient(135deg, #4B5563 0%, #374151 100%)'
                          }
                        }}
                      >
                        ${amount.toLocaleString()}
                      </Button>
                    );
                  })}
                </Box>

                {/* Поле ввода произвольной суммы */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ color: '#94A3B8', mb: 1 }}>
                    Ввести сумму:
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="сумма"
                    type="number"
                    value={customCreditAmount}
                    onChange={(e) => setCustomCreditAmount(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255, 255, 255, 0.7)',
                        },
                        '& .MuiInputBase-input': {
                          '&::placeholder': {
                            color: '#EF4444',
                            opacity: 1,
                          },
                        },
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={() => creditModalFromDeal ? handleCustomCreditFromDeal() : handleCustomCredit()}
                    disabled={!customCreditAmount || customCreditAmount <= 0}
                    fullWidth
                    sx={{
                      mt: 1,
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      color: 'white',
                      py: 1,
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      },
                      '&:disabled': {
                        background: 'rgba(107, 114, 128, 0.5)',
                      },
                    }}
                  >
                    💳 Взять кредит
                  </Button>
                </Box>

                {/* Поле для погашения кредита */}
                {playerCredit > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ color: '#94A3B8', mb: 1 }}>
                      Погасить кредит:
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="сумма погашения"
                      type="number"
                      value={customPayoffAmount}
                      onChange={(e) => setCustomPayoffAmount(e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          color: 'white',
                          '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.5)',
                          },
                          '& .MuiInputLabel-root': {
                            color: 'rgba(255, 255, 255, 0.7)',
                          },
                          '& .MuiInputBase-input': {
                            '&::placeholder': {
                              color: '#10B981',
                              opacity: 1,
                            },
                          },
                        },
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={() => handlePayOffCredit(parseInt(customPayoffAmount) || 0)}
                      disabled={!customPayoffAmount || customPayoffAmount <= 0 || parseInt(customPayoffAmount) > playerCredit || parseInt(customPayoffAmount) > playerMoney}
                      fullWidth
                      sx={{
                        mt: 1,
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        color: 'white',
                        py: 1,
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        },
                        '&:disabled': {
                          background: 'rgba(107, 114, 128, 0.5)',
                        },
                      }}
                    >
                      💰 Погасить кредит
                    </Button>
                  </Box>
                )}

                                {/* Быстрые суммы для погашения кредита */}
                {playerCredit > 0 && (
                  <>
                    <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2 }}>
                      Погасить кредит:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                      {[1000, 2000, 5000, 10000].map((amount) => {
                        const canPay = amount <= playerCredit && amount <= playerMoney;
                        return (
                          <Button
                            key={amount}
                            onClick={() => handleQuickPayoff(amount)}
                            disabled={!canPay}
                            size="small"
                            sx={{
                              background: canPay 
                                ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                                : 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
                              color: 'white',
                              px: 2,
                              py: 1,
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              '&:hover': {
                                background: canPay 
                                  ? 'linear-gradient(135deg, #D97706 0%, #B45309 100%)'
                                  : 'linear-gradient(135deg, #4B5563 0%, #374151 100%)'
                              }
                            }}
                          >
                            ${amount.toLocaleString()}
                          </Button>
                        );
                      })}
                    </Box>
                    

                  </>
                )}

                {/* Простые кнопки погашения кредита */}
                {playerCredit > 0 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Погасить весь кредит */}
                    <Button
                      onClick={() => handlePayOffCredit(playerCredit)}
                      disabled={playerMoney < playerCredit}
                      fullWidth
                      sx={{
                        background: playerMoney >= playerCredit
                          ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
                          : 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
                        color: 'white',
                        py: 1.5,
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        '&:hover': {
                          background: playerMoney >= playerCredit
                            ? 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)'
                            : 'linear-gradient(135deg, #4B5563 0%, #374151 100%)'
                        }
                      }}
                    >
                      💰 Погасить весь кредит (${playerCredit.toLocaleString()})
                    </Button>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          borderTop: '1px solid #6B7280',
          justifyContent: 'center'
        }}>
          <Button
            onClick={closeCreditModal}
            sx={{
              background: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(135deg, #4B5563 0%, #374151 100%)'
              }
            }}
          >
            ❌ Закрыть
          </Button>
        </DialogActions>
      </Dialog>

      {/* Анимация конфети */}
      {showConfetti && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: 9999,
            overflow: 'hidden'
          }}
        >
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * window.innerWidth, 
                y: -20,
                rotate: 0
              }}
              animate={{ 
                y: window.innerHeight + 20,
                rotate: 360,
                x: Math.random() * window.innerWidth
              }}
              transition={{ 
                duration: 3 + Math.random() * 2,
                ease: "easeIn"
              }}
              style={{
                position: 'absolute',
                fontSize: '20px',
                color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'][Math.floor(Math.random() * 6)]
              }}
            >
              {['🎉', '🎊', '🎈', '✨', '💫', '🌟'][Math.floor(Math.random() * 6)]}
            </motion.div>
          ))}
        </Box>
      )}

      {/* Полная карточка профессии */}
      <FullProfessionCard
        open={showProfessionCard}
        onClose={() => setShowProfessionCard(false)}
        professionId={selectedProfessionId}
      />
    </Box>
    </Fragment>
  );
};

export default OriginalGameBoard;
