import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton, LinearProgress, Avatar, Chip, Snackbar, Alert, Modal, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, List, ListItem, ListItemText, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import { 
  Casino, 
  Timer, 
  Settings, 
  Help, 
  ExitToApp,
  PlayArrow,
  Pause,
  Refresh,
  VolumeUp,
  Fullscreen,
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
  const [timerProgress, setTimerProgress] = useState(75);
  
  // Состояние игроков и их фишек
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
    { id: 1, type: 'house', name: 'Дом', icon: '🏠', value: 150000, cost: 150000, income: 2000, color: '#10B981', description: 'Красивый дом в пригороде' },
    { id: 2, type: 'stocks', name: 'Акции', icon: '📈', value: 25000, cost: 25000, income: 500, color: '#3B82F6', description: 'Портфель акций крупных компаний' },
    { id: 3, type: 'business', name: 'Бизнес', icon: '💎', value: 80000, cost: 80000, income: 3000, color: '#8B5CF6', description: 'Собственный бизнес' },
    { id: 4, type: 'car', name: 'Автомобиль', icon: '🚗', value: 45000, cost: 45000, income: 0, color: '#F59E0B', description: 'Премиум автомобиль' },
    { id: 5, type: 'gold', name: 'Золото', icon: '🥇', value: 35000, cost: 35000, income: 200, color: '#EAB308', description: 'Инвестиции в золото' },
    { id: 6, type: 'crypto', name: 'Криптовалюта', icon: '₿', value: 18000, cost: 18000, income: 800, color: '#EF4444', description: 'Портфель криптовалют' },
    { id: 7, type: 'bonds', name: 'Облигации', icon: '📋', value: 12000, cost: 12000, income: 300, color: '#06B6D4', description: 'Государственные облигации' }
  ]);

  const totalCells = originalBoard.length;

  // Функция броска кубика
  const rollDice = () => {
    if (isRolling) return;
    
    setIsRolling(true);
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
  
  const closeModals = () => {
    setShowPlayerModal(false);
    setShowBankModal(false);
    setShowAssetsModal(false);
    setSelectedPlayer(null);
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
        if (currentPosition > 24) {
          currentPosition = 1; // Замыкаем круг
        }
        
        // Обновляем позицию игрока
        player.position = currentPosition;
        setPlayers([...updatedPlayers]);
        
        // Продолжаем движение
        setTimeout(moveStep, 200); // 200ms между шагами
      } else {
        // Движение завершено, переходим к следующему игроку
        const nextPlayer = (currentPlayer + 1) % players.length;
        setCurrentPlayer(nextPlayer);
        setIsMoving(false); // Снимаем флаг движения
        setMovingPlayerId(null); // Сбрасываем ID движущегося игрока
      }
    };
    
    // Начинаем движение
    moveStep();
  };

  // Функции для кнопок управления игрой
  const handlePlayerTurn = (playerIndex) => {
    if (playerIndex === currentPlayer) {
      console.log(`🎯 [OriginalGameBoard] Ход игрока ${players[playerIndex].name} уже активен`);
      return;
    }
    
    console.log(`🎯 [OriginalGameBoard] Переключение на игрока ${players[playerIndex].name}`);
    setCurrentPlayer(playerIndex);
    
    // Показываем уведомление
    setToast({
      open: true,
      message: `🎯 Ход передан игроку ${players[playerIndex].name}`,
      severity: 'info'
    });
  };

  const handlePlayerProfile = (playerIndex) => {
    const player = players[playerIndex];
    if (player) {
      console.log(`👤 [OriginalGameBoard] Открытие профиля игрока ${player.name}`);
      openPlayerModal(player);
    }
  };

    const handlePlayerStats = (playerIndex) => {
    const player = players[playerIndex];
    if (player) {
      console.log(`📊 [OriginalGameBoard] Просмотр статистики игрока ${player.name}`);
      // Здесь можно добавить логику для показа статистики
      setToast({
        open: true,
        message: `📊 Статистика игрока ${player.name}`,
        severity: 'info'
      });
    }
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
    return assets.reduce((total, asset) => total + asset.value, 0);
  };

  const getTotalAssetsIncome = () => {
    return assets.reduce((total, asset) => total + asset.income, 0);
  };

  return (
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
        
        {/* Заголовок */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Typography variant="h3" sx={{ 
            color: 'white', 
            mb: 2, 
            fontWeight: 'bold',
            textAlign: 'center',
            background: 'linear-gradient(45deg, #8B5CF6, #06B6D4)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Энергия Денег
          </Typography>
        </motion.div>
        
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
          





          {/* Центральное лого - новый дизайн с радужным градиентом */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '240px',
              height: '240px',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2
            }}
          >
            {/* Основной круг с радужным градиентом */}
            <Box
              sx={{
                width: '200px',
                height: '200px',
                background: 'conic-gradient(from 0deg, #3B82F6, #10B981, #F59E0B, #EF4444, #8B5CF6, #3B82F6)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 60px rgba(59, 130, 246, 0.6)',
                border: '4px solid rgba(255, 255, 255, 0.3)',
                position: 'relative',
                '&:hover': {
                  transform: 'scale(1.05)',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 0 80px rgba(59, 130, 246, 0.8)'
                }
              }}
            >
              
              {/* Центральная область с символами */}
              <Box
                sx={{
                  position: 'absolute',
                  width: '120px',
                  height: '120px',
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
                    fontSize: '2rem',
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
                    fontSize: '2rem',
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
                    fontSize: '2.5rem',
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
                    fontSize: '2rem',
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
            
            {/* Текст "ENERGY OF MONEY" с радужным градиентом */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #3B82F6, #10B981)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
                  lineHeight: 1.2
                }}
              >
                ENERGY OF
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #10B981, #EF4444)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 20px rgba(16, 185, 129, 0.5)',
                  lineHeight: 1.2
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
          🎮 Управление игрой
        </Typography>

        {/* 1. Очередность игроков */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <Box sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '15px',
            padding: '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
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
                2. Игрок 2 {currentPlayer === 1 ? '(Ход)' : ''}
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
                3. Игрок 3 {currentPlayer === 2 ? '(Ход)' : ''}
              </Button>
            </Box>
          </Box>
        </motion.div>

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
                  {/* Показываем только 3 самых дорогих актива */}
                  {assets
                    .sort((a, b) => b.value - a.value) // Сортируем по убыванию стоимости
                    .slice(0, 3) // Берем только первые 3
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
                  {assets.length > 3 && (
                    <Chip 
                      label={`+${assets.length - 3} еще...`}
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
            onClick={rollDice}
            disabled={isRolling}
            sx={{
              width: '100%',
              height: '80px',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
              color: 'white',
              borderRadius: '15px',
              fontSize: '18px',
              fontWeight: 'bold',
              boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                boxShadow: '0 12px 35px rgba(139, 92, 246, 0.4)'
              },
              '&:disabled': {
                background: 'rgba(139, 92, 246, 0.5)'
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
            ) : (
              <>
                🎲 БРОСИТЬ КУБИК
                <br />
                <Typography variant="h4" sx={{ mt: 1 }}>
                  {diceValue}
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
                height: 10,
                borderRadius: 5,
                background: 'rgba(255, 255, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #10B981 0%, #F59E0B 50%, #EF4444 100%)',
                    borderRadius: 5
                }
              }}
            />
            <Typography variant="body2" sx={{ color: '#94A3B8', mt: 1, textAlign: 'center' }}>
              {timerProgress}% • 45 сек осталось
            </Typography>
          </Box>
        </motion.div>

        {/* Кнопка выхода */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
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
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                          {asset.name}
                        </Typography>
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
    </Box>
  );
};

export default OriginalGameBoard;
