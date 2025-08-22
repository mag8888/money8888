import React, { useState, useEffect } from 'react';
import socket from '../socket'; // Правильный путь из components/
import { Box, Typography, Avatar, Button } from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EuroIcon from '@mui/icons-material/Euro';
import HomeIcon from '@mui/icons-material/Home';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import BalanceIcon from '@mui/icons-material/Balance';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import StoreIcon from '@mui/icons-material/Store';
import BusinessIcon from '@mui/icons-material/Business';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import GavelIcon from '@mui/icons-material/Gavel';
import BuildIcon from '@mui/icons-material/Build';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import SchoolIcon from '@mui/icons-material/School';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import ProfessionCard from './ProfessionCard';
import { motion } from 'framer-motion'; // Assume framer-motion is installed; if not, add to package.json
import { Dialog, DialogTitle, DialogContent, TextField, Select, MenuItem } from '@mui/material';
import { useLogout } from '../hooks/useLogout';
import ExitConfirmModal from './ExitConfirmModal';

const GameBoard = ({ roomId, onExit }) => {
  const [players, setPlayers] = useState([]);
  const [myId, setMyId] = useState(socket.id);
  
  // Логируем изменения myId и players
  useEffect(() => {
    console.log('myId changed to:', myId);
    console.log('players array:', players);
    console.log('current player:', players.find(p => p.id === myId));
  }, [myId, players]);
  const [dice, setDice] = useState(0);
  const [currentTurn, setCurrentTurn] = useState(null); // Now playerId
  const [timer, setTimer] = useState(0);
  const [modal, setModal] = useState(null); // For cell events
  const [turnBanner, setTurnBanner] = useState(null); // {text}
  // Add states
  const [isRolling, setIsRolling] = useState(false);
  const [displayDice, setDisplayDice] = useState(0);
  // Add state for dice values
  const [displayD1, setDisplayD1] = useState(0);
  const [displayD2, setDisplayD2] = useState(0);
  // States for bank modal
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState(0);
  // Add state for profession modal
  const [profModalOpen, setProfModalOpen] = useState(false);
  // Add state
  const [freedomModalOpen, setFreedomModalOpen] = useState(false);
  // Add turn timer state
  const [turnTimer, setTurnTimer] = useState(120); // 2 minutes in seconds
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [loanAmount, setLoanAmount] = useState(0);
  const [exitModalOpen, setExitModalOpen] = useState(false);
  
  // Используем централизованный хук для выхода
  const { logout } = useLogout();
  
  // Функция для выхода из игры
  const handleExitGame = () => {
    console.log('🔄 [GameBoard] Exit game confirmed');
    setExitModalOpen(false);
    
    // Используем централизованный хук
    if (onExit) {
      onExit();
    } else {
      logout(roomId, 'game_exit');
    }
  };
  
  const renderProfessionIcon = (professionName) => {
    const name = String(professionName || '').toLowerCase();
    if (name.includes('doctor') || name.includes('врач')) return <LocalHospitalIcon fontSize="small" sx={{ mr: 1 }} />;
    if (name.includes('lawyer') || name.includes('юрист')) return <GavelIcon fontSize="small" sx={{ mr: 1 }} />;
    if (name.includes('engineer') || name.includes('инжен')) return <BuildIcon fontSize="small" sx={{ mr: 1 }} />;
    if (name.includes('pilot') || name.includes('пилот')) return <FlightTakeoffIcon fontSize="small" sx={{ mr: 1 }} />;
    if (name.includes('teacher') || name.includes('учител')) return <SchoolIcon fontSize="small" sx={{ mr: 1 }} />;
    if (name.includes('police') || name.includes('полиц')) return <LocalPoliceIcon fontSize="small" sx={{ mr: 1 }} />;
    if (name.includes('manager') || name.includes('менедж')) return <BusinessCenterIcon fontSize="small" sx={{ mr: 1 }} />;
    if (name.includes('janitor') || name.includes('убор')) return <CleaningServicesIcon fontSize="small" sx={{ mr: 1 }} />;
    return <WorkOutlineIcon fontSize="small" sx={{ mr: 1 }} />;
  };

  useEffect(() => {
    // обновляем myId при реконнекте сокета, иначе сервер отклоняет ходы
    const onConnect = () => {
      const newId = socket.id;
      setMyId(newId);
      // всегда подтянуть актуальный список игроков при входе/переподключении
      socket.emit('getPlayers', roomId);
      console.log('[socket] connected', newId, 'room', roomId, 'myId updated to:', newId);
      console.log('[socket] emitting getPlayers for roomId:', roomId);
      
      // Запрашиваем текущий ход при подключении
      socket.emit('getRoom', roomId);
      console.log('[socket] emitting getRoom for roomId:', roomId);
    };
    socket.on('connect', onConnect);
    // запросим список сразу при монтировании на случай, если мы вошли после старта
    socket.emit('getPlayers', roomId);
    
    // Дополнительная проверка при монтировании
    setTimeout(() => {
      console.log('[GameBoard] Mount check - requesting fresh data...');
      socket.emit('getRoom', roomId);
      socket.emit('getPlayers', roomId);
    }, 1000);

    socket.on('playerUpdated', (player) => {
      console.log('[playerUpdated]', player.id);
      setPlayers(prev => {
        const exists = prev.some(p => p.id === player.id);
        return exists ? prev.map(p => (p.id === player.id ? player : p)) : [...prev, player];
      });
    });
    socket.on('turnChanged', (playerId) => {
      console.log('[turnChanged] received:', { playerId, myId, socketId: socket.id, isEqual: playerId === myId });
      console.log('[turnChanged] players array:', players.map(p => ({ id: p.id, username: p.username })));
      
      setCurrentTurn(playerId);
      const isMyTurnNow = playerId === myId;
      setIsMyTurn(isMyTurnNow);
      console.log('[turnChanged] isMyTurn set to:', isMyTurnNow);
      
      if (isMyTurnNow) {
        setTurnTimer(120); // Reset timer for new turn
        setTurnBanner({ text: 'Ваш ход' });
        setTimeout(() => setTurnBanner(null), 1600);
      } else {
        const playerName = players.find(p => p.id === playerId)?.username || `Игрок (${playerId?.slice(-4) || 'N/A'})`;
        setTurnBanner({ text: `Ход: ${playerName}` });
        setTimeout(() => setTurnBanner(null), 1600);
      }
    });
    socket.on('timerUpdate', setTimer);
    socket.on('diceRolled', ({ playerId, dice, d1, d2, options }) => {
      console.log('[diceRolled]', { playerId, dice, d1, d2, options });
      if (playerId === myId) {
        setIsRolling(false);
        setDisplayD1(d1);
        setDisplayD2(d2 || 0);
        setDice(dice);
        if (options && options.length > 1) {
          setTimeout(() => setModal({ type: 'diceChoice', details: { d1, d2, options } }), 1000); // Delay modal
        } else {
          setTimeout(() => {
            socket.emit('movePlayer', roomId, myId, dice);
            setDisplayDice(0); // Clear after move
          }, 1500); // Show result for 1.5s then move
        }
      }
    });
    socket.on('playerMoved', ({ playerId, position, cellType }) => {
      console.log('[playerMoved]', { playerId, position, cellType });
      setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, position } : p));
              if (playerId === myId) {
          // Определяем тип клетки на основе позиции для малого круга
          if (!players.find(p => p.id === playerId)?.isFastTrack) {
            // Малый круг - определяем тип клетки по позиции
            const cellIndex = position % INNER_COUNT;
            let actualCellType = cellType;
            let modalDetails = {};
            
            if ([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22].includes(cellIndex)) {
              actualCellType = 'opportunity'; // Зеленые клетки - возможность
            } else if ([1, 9, 17].includes(cellIndex)) {
              actualCellType = 'doodad'; // Розовые клетки - всякая всячина
              // Генерируем случайную карточку doodad
              const doodadCards = [
                { name: "Блендер премиум-класса", cost: 150, description: "Мощный блендер для смузи и коктейлей с множеством функций" },
                { name: "Умные часы", cost: 250, description: "Модные умные часы с фитнес-трекером и уведомлениями" },
                { name: "Робот-пылесос", cost: 400, description: "Автоматический робот-пылесос с Wi-Fi управлением" },
                { name: "Кофемашина эспрессо", cost: 600, description: "Профессиональная кофемашина для домашнего баристы" },
                { name: "Массажное кресло", cost: 800, description: "Электрическое массажное кресло с подогревом" },
                { name: "Игровая приставка", cost: 500, description: "Новейшая игровая консоль с VR-поддержкой" },
                { name: "Домашний кинотеатр", cost: 1200, description: "Система объемного звука 7.1 для домашнего кинотеатра" },
                { name: "Электросамокат", cost: 700, description: "Складной электросамокат для городских поездок" },
                { name: "Тренажер для дома", cost: 900, description: "Многофункциональный тренажер для домашних тренировок" },
                { name: "Умный холодильник", cost: 1800, description: "Холодильник с сенсорным экраном и интернет-подключением" },
                { name: "Дрон с камерой", cost: 350, description: "Квадрокоптер с 4K камерой для аэросъемки" },
                { name: "Электрогриль", cost: 200, description: "Бесдымный электрогриль для приготовления мяса дома" },
                { name: "VR-очки", cost: 450, description: "Очки виртуальной реальности для игр и фильмов" },
                { name: "Электровелосипед", cost: 1500, description: "Складной электровелосипед с аккумулятором на 50 км" },
                { name: "Умная колонка", cost: 120, description: "Голосовой помощник с премиум звуком и умным домом" },
                { name: "Проектор 4K", cost: 800, description: "Портативный проектор для домашнего кинотеатра" },
                { name: "Электрогитара", cost: 650, description: "Профессиональная электрогитара с усилителем" },
                { name: "3D принтер", cost: 1100, description: "Настольный 3D принтер для творчества и прототипирования" },
                { name: "Спа-ванна джакузи", cost: 3500, description: "Портативная гидромассажная ванна для релаксации" },
                { name: "Профессиональная камера", cost: 2200, description: "Зеркальная камера с набором объективов для фотографии" }
              ];
              const randomCard = doodadCards[Math.floor(Math.random() * doodadCards.length)];
              modalDetails = { card: randomCard };
            } else if (cellIndex === 3) {
              actualCellType = 'charity'; // Оранжевая клетка - благотворительность
            } else if ([5, 13, 21].includes(cellIndex)) {
              actualCellType = 'payday'; // Желтые клетки - PayDay
            } else if ([7, 15, 23].includes(cellIndex)) {
              actualCellType = 'market'; // Голубые клетки - рынок
            } else if (cellIndex === 11) {
              actualCellType = 'child'; // Фиолетовая клетка - ребенок
            } else if (cellIndex === 19) {
              actualCellType = 'downsized'; // Черная клетка - увольнение
            }
            
            setModal({ type: actualCellType, details: modalDetails });
          } else {
            // Большой круг - используем переданный тип
            setModal({ type: cellType, details: {} });
          }
        }
    });
    socket.on('gameStarted', () => {
      console.log('[gameStarted] Game started, requesting fresh data...');
      socket.emit('getPlayers', roomId);
      socket.emit('getRoom', roomId);
      
      // Принудительно запрашиваем текущий ход
      setTimeout(() => {
        console.log('[gameStarted] Requesting turn info after delay...');
        socket.emit('getRoom', roomId);
      }, 500);
    });
    socket.on('roomData', (data) => {
      console.log('[roomData] received:', data);
      console.log('[roomData] current myId:', myId, 'socket.id:', socket.id);
      
      if (typeof data.currentTurn === 'string' && data.currentTurn) {
        console.log('[roomData] setting currentTurn to:', data.currentTurn);
        setCurrentTurn(data.currentTurn);
        // Обновляем isMyTurn на основе полученного currentTurn
        const isMyTurnNow = data.currentTurn === myId;
        setIsMyTurn(isMyTurnNow);
        console.log('[roomData] isMyTurn set to:', isMyTurnNow, 'myId:', myId, 'currentTurn:', data.currentTurn);
        
        // Если это наш ход, запускаем таймер
        if (isMyTurnNow) {
          setTurnTimer(120);
          setTurnBanner({ text: 'Ваш ход' });
          setTimeout(() => setTurnBanner(null), 1600);
        } else {
          // Показываем чей ход
          const playerName = players.find(p => p.id === data.currentTurn)?.username || `Игрок (${data.currentTurn?.slice(-4) || 'N/A'})`;
          setTurnBanner({ text: `Ход: ${playerName}` });
          setTimeout(() => setTurnBanner(null), 1600);
        }
      } else {
        console.log('[roomData] currentTurn is not a string or empty:', typeof data.currentTurn, data.currentTurn);
      }
      
      if (data.status === 'started') {
        console.log('[roomData] Game started, requesting players...');
        socket.emit('getPlayers', roomId);
      }
    });
    socket.on('playersList', (playersList) => {
      console.log('[playersList] received:', playersList);
      console.log('[playersList] current myId:', myId, 'socket.id:', socket.id);
      
      // Обновляем список игроков
      setPlayers(playersList);
      
      // Синхронизируем myId с socket.id если они различаются
      const actualMyId = socket.id;
      if (myId !== actualMyId) {
        console.log('[playersList] FORCE updating myId from', myId, 'to', actualMyId);
        setMyId(actualMyId);
        
        // После обновления myId, проверяем текущий ход
        if (currentTurn) {
          const isMyTurnNow = currentTurn === actualMyId;
          setIsMyTurn(isMyTurnNow);
          console.log('[playersList] Updated isMyTurn to:', isMyTurnNow, 'after myId sync');
        }
      }
      
      // Находим текущего игрока и обновляем его данные
      const currentPlayer = playersList.find(p => p.id === actualMyId);
      if (currentPlayer) {
        console.log('[playersList] Found current player:', currentPlayer.username);
        // Обновляем myId если он не совпадает
        if (myId !== currentPlayer.id) {
          setMyId(currentPlayer.id);
        }
      } else {
        console.log('[playersList] Current player not found in list');
      }
      
      console.log('[playersList] Final state - myId:', myId, 'players count:', playersList.length);
    });
    socket.on('playersUpdate', (playersList) => {
      console.log('[playersUpdate] received:', playersList);
      console.log('[playersUpdate] myId:', myId);
      console.log('[playersUpdate] current player:', playersList.find(p => p.id === myId));
      // Add colors to players for visual distinction
      const playersWithColors = playersList.map((player, index) => {
        if (!player.color) {
          player.color = ['#FF7043', '#4CAF50', '#2196F3', '#9C27B0', '#FF9800', '#795548'][index % 6];
        }
        return player;
      });
      setPlayers(playersWithColors);
    }); // Receive full list updates
    socket.on('dealChoice', ({ playerId, cellType, position, balance, monthlyCashflow }) => {
      console.log('dealChoice received:', { playerId, myId });
      setModal({ 
        type: 'dealChoice', 
        details: { 
          cellType, 
          position, 
          balance, 
          monthlyCashflow,
          maxLoan: monthlyCashflow * 10
        } 
      });
    });

    socket.on('dealCard', ({ card, type, playerId, balance, maxLoan, canAfford, needsLoan }) => {
      console.log('dealCard received:', { playerId, myId });
      setModal({ 
        type: 'dealCard', 
        details: { 
          card, 
          type, 
          balance, 
          maxLoan, 
          canAfford, 
          needsLoan 
        } 
      });
    });

    socket.on('dealBought', ({ playerId, card, newBalance, newPassiveIncome }) => {
      setModal({ 
        type: 'dealBought', 
        details: { 
          card, 
          newBalance, 
          newPassiveIncome 
        } 
      });
    });

    socket.on('dealError', ({ message }) => {
      setModal({ 
        type: 'error', 
        details: { message } 
      });
    });

    socket.on('dealEvent', ({ card, type }) => {
      setModal({ type: 'deal', details: { card, dealType: type } });
    });
    return () => {
      socket.off('connect', onConnect);
      socket.off('playerUpdated');
      socket.off('turnChanged');
      socket.off('timerUpdate');
      socket.off('diceRolled');
      socket.off('playerMoved');
      socket.off('gameStarted');
      socket.off('roomData');
      socket.off('playersList');
      socket.off('playersUpdate');
      socket.off('dealEvent');
    };
  }, [roomId]);

  useEffect(() => {
    socket.on('marketEvent', ({ card, proceeds }) => setModal({ type: 'market', details: { card, proceeds } }));
    socket.on('paydayEvent', ({ amount }) => setModal({ type: 'payday', details: { amount } }));
    socket.on('childEvent', () => setModal({ type: 'child', details: {} }));
    socket.on('doodadEvent', ({ card }) => setModal({ type: 'doodad', details: { card } }));
    socket.on('charityOffer', ({ cost }) => setModal({ type: 'charity', details: { cost } }));
    socket.on('downsizedEvent', () => setModal({ type: 'downsized', details: {} }));
    socket.on('opportunityEvent', () => setModal({ type: 'opportunity', details: {} }));
    
    // Обработчик успешного выхода из комнаты - теперь управляется централизованно в App.js
    
    return () => {
      socket.off('marketEvent');
      socket.off('paydayEvent');
      socket.off('childEvent');
      socket.off('doodadEvent');
      socket.off('charityOffer');
      socket.off('downsizedEvent');
      socket.off('opportunityEvent');
      // leftRoom теперь обрабатывается централизованно в App.js
    };
  }, []);

  // Turn timer effect
  useEffect(() => {
    if (isMyTurn && turnTimer > 0) {
      const interval = setInterval(() => {
        setTurnTimer(prev => {
          // Предупреждающий звук за 10 секунд
          if (prev === 10) {
            console.log('⚠️ [GameBoard] 10 seconds remaining! Playing warning sound');
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
          }
          
          if (prev <= 1) {
            // Time's up, automatically end turn
            console.log('⏰ [GameBoard] Time is up! Automatically ending turn');
            
            // Добавляем звуковое уведомление
            if (turnTimer <= 1) {
              // Создаем звук для уведомления
              const audioContext = new (window.AudioContext || window.webkitAudioContext)();
              const oscillator = audioContext.createOscillator();
              const gainNode = audioContext.createGain();
              
              oscillator.connect(gainNode);
              gainNode.connect(audioContext.destination);
              
              oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
              oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
              oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.2);
              
              gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
              gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
              
              oscillator.start(audioContext.currentTime);
              oscillator.stop(audioContext.currentTime + 0.3);
            }
            
            socket.emit('endTurn', roomId, myId);
            return 120; // Reset timer
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isMyTurn, turnTimer, roomId, myId]);

  const roll = () => {
    console.log('🎲 roll() called with:', { 
      roomId, 
      myId, 
      socketId: socket.id, 
      currentTurn, 
      isMyTurn,
      playersCount: players.length,
      players: players.map(p => ({ id: p.id, username: p.username }))
    });
    
    // Проверяем, может ли игрок ходить
    if (!currentTurn) {
      console.log('❌ Нет текущего хода (currentTurn is null/undefined)');
      return;
    }
    
    if (currentTurn !== myId) {
      console.log('❌ Не ваш ход. Текущий ход:', currentTurn, 'Ваш ID:', myId);
      return;
    }
    
    if (!isMyTurn) {
      console.log('❌ isMyTurn = false');
      return;
    }
    
    console.log('✅ Можете ходить! Отправляем rollDice...');
    setIsRolling(true);
    setDisplayDice(0);
    setDisplayD1(0);
    setDisplayD2(0);
    socket.emit('rollDice', roomId, myId);
  };

  const move = () => socket.emit('movePlayer', roomId, myId, dice);

  const endTurn = () => {
    socket.emit('game.endTurn', roomId, myId);
    setModal(null);
  };

  // Render board: simple text representation for MVP
  if (modal?.type === 'deal') {
    const { card, dealType } = modal.details;
    return (
      <div className="modal">
        <h3>{dealType === 'smallDeal' ? 'Малая сделка' : 'Большая сделка'}</h3>
        <p>{card.description} (Стоимость: {card.cost}, CF: {card.cashflow})</p>
        <button onClick={() => {
          socket.emit('buyDeal', roomId, card);
          setModal(null);
        }} disabled={players.find(p => p.id === myId)?.balance < card.cost}>Купить</button>
        <button onClick={() => setModal(null)}>Отказаться</button>
      </div>
    );
  }

  if (modal?.type === 'diceChoice') {
    const { d1, d2, options } = modal.details;
    return (
      <div className="modal">
        <h3>Выберите результат броска</h3>
        <p>Кубики: {d1} и {d2}</p>
        {options.map((s) => (
          <button key={s} onClick={() => { setModal(null); socket.emit('movePlayer', roomId, myId, s); }}>Идти на {s}</button>
        ))}
      </div>
    );
  }

  // Generate rings with desired counts
  const OUTER_COUNT = 50;
  const INNER_COUNT = 24; // Увеличили до 24 клеток

  const outerPalette = ['#7CB342','#9575CD','#FFCA28','#BA68C8','#8BC34A','#AED581','#81C784','#B39DDB','#C5E1A5','#FFD54F'];
  const innerPalette = ['#4CAF50','#E91E63','#4CAF50','#FF9800','#4CAF50','#FFC107','#4CAF50','#2196F3','#4CAF50','#E91E63','#4CAF50','#9C27B0','#4CAF50','#FFC107','#4CAF50','#2196F3','#4CAF50','#E91E63','#4CAF50','#000000','#4CAF50','#FFC107','#4CAF50','#2196F3'];
  // Наборы иконок по кольцам: на большом круге нет "дети"
  const iconSetOuter = [
    <TrendingUpIcon />, <ShoppingCartIcon />, <AttachMoneyIcon />, <BusinessIcon />,
    <EuroIcon />, <HomeIcon />, <StoreIcon />, <AccountBalanceIcon />, <BalanceIcon />
  ];
  const iconSetInner = [
    <TrendingUpIcon />, <ShoppingCartIcon />, <TrendingUpIcon />, <VolunteerActivismIcon />, <TrendingUpIcon />, <MonetizationOnIcon />, <TrendingUpIcon />, <StoreIcon />, <TrendingUpIcon />, <ShoppingCartIcon />, <TrendingUpIcon />, <ChildCareIcon />, <TrendingUpIcon />, <MonetizationOnIcon />, <TrendingUpIcon />, <StoreIcon />, <TrendingUpIcon />, <ShoppingCartIcon />, <TrendingUpIcon />, <MoneyOffIcon />, <TrendingUpIcon />, <MonetizationOnIcon />, <TrendingUpIcon />, <StoreIcon />
  ];

  const isGreen = (hex) => ['7CB342','8BC34A','AED581','81C784','C5E1A5','66BB6A','9CCC65'].some(g => hex.toUpperCase().includes(g));

  const buildAlternatingCells = (count, palette, icons) => {
    const greens = palette.filter(c => isGreen(c.replace('#','')));
    const others = palette.filter(c => !isGreen(c.replace('#','')));
    let gi = 0, oi = 0; const res = [];
    for (let i = 0; i < count; i++) {
      const useGreen = i % 2 === 0; // true → green, false → other
      let color;
      if (useGreen && greens.length) {
        color = greens[gi++ % greens.length];
      } else if (!useGreen && others.length) {
        color = others[oi++ % others.length];
      } else {
        // fallback if one bucket empty
        color = palette[i % palette.length];
      }
      res.push({ icon: icons[i % icons.length], color });
    }
    return res;
  };

  const outerCells = buildAlternatingCells(OUTER_COUNT, outerPalette, iconSetOuter);
  const innerCells = buildAlternatingCells(INNER_COUNT, innerPalette, iconSetInner);

  // Mark loss cells: grey color and money-off icon
  const lossColor = '#9E9E9E';
  const markLoss = (cells, indices) => {
    indices.forEach((i) => {
      const idx = ((i % cells.length) + cells.length) % cells.length;
      cells[idx] = { icon: <MoneyOffIcon />, color: lossColor };
    });
  };
  // 3 на большом (равномерно распределим)
  markLoss(outerCells, [Math.floor(OUTER_COUNT * 0.1), Math.floor(OUTER_COUNT * 0.45), Math.floor(OUTER_COUNT * 0.8)]);

  // Спец. клетки малого круга согласно новой раскладке:
  const setCell = (cells, idx, icon, color) => {
    const i = ((idx % cells.length) + cells.length) % cells.length;
    cells[i] = { icon, color };
  };
  
  // Новая раскладка внутреннего кольца (24 клетки):
  // 0: Зеленая - возможность малая/большая
  // 1: Розовая - всякая всячина (обязательные траты)
  // 2: Зеленая - возможность малая/большая
  // 3: Оранжевая - Благотворительность
  // 4: Зеленая - возможность малая/большая
  // 5: Желтая - PayDay
  // 6: Зеленая - возможность малая/большая
  // 7: Голубая - Рынок
  // 8: Зеленая - возможность малая/большая
  // 9: Розовая - всякая всячина
  // 10: Зеленая - возможность малая/большая
  // 11: Фиолетовая - Ребенок
  // 12: Зеленая - возможность малая/большая
  // 13: Желтая - PayDay
  // 14: Зеленая - возможность малая/большая
  // 15: Голубая - Рынок
  // 16: Зеленая - возможность малая/большая
  // 17: Розовая - всякая всячина
  // 18: Зеленая - возможность малая/большая
  // 19: Черная - Потеря/Увольнение
  // 20: Зеленая - возможность малая/большая
  // 21: Желтая - PayDay
  // 22: Зеленая - возможность малая/большая
  // 23: Голубая - Рынок
  
  // Устанавливаем специальные клетки:
  // Благотворительность (клетка 3)
  setCell(innerCells, 3, <VolunteerActivismIcon />, '#FF9800');
  // PayDay (клетки 5, 13, 21)
  [5, 13, 21].forEach(i => setCell(innerCells, i, <MonetizationOnIcon />, '#FFC107'));
  // Рынок (клетки 7, 15, 23)
  [7, 15, 23].forEach(i => setCell(innerCells, i, <StoreIcon />, '#2196F3'));
  // Ребенок (клетка 11)
  setCell(innerCells, 11, <ChildCareIcon />, '#9C27B0');
  // Потеря/Увольнение (клетка 19)
  setCell(innerCells, 19, <MoneyOffIcon />, '#000000');

  return (
    <Box sx={{ 
      position: 'relative', 
      width: 640, 
      height: 640, 
      borderRadius: '24px', 
      background: '#2F1B40', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      boxShadow: '0 24px 60px rgba(0,0,0,0.4), inset 0 0 0 2px rgba(255,255,255,0.06)'
    }}>

      
      {/* Player name in top left corner */}
      <Box sx={{ 
        position: 'absolute', 
        top: 16, 
        left: 16, 
        color: 'white', 
        fontSize: 18, 
        fontWeight: 'bold', 
        textAlign: 'center', 
        bgcolor: 'rgba(0,0,0,0.7)', 
        px: 3, 
        py: 1, 
        borderRadius: 2,
        border: '2px solid rgba(255,255,255,0.2)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        minWidth: '120px',
        zIndex: 10
      }}>
        {(() => {
          // Сначала ищем по socket.id
          let player = players.find(p => p.id === socket.id);
          if (player?.username) {
            return player.username;
          }
          
          // Затем по myId
          player = players.find(p => p.id === myId);
          if (player?.username) {
            return player.username;
          }
          
          // Если не нашли, показываем последние 4 символа ID
          const displayId = socket.id?.slice(-4) || myId?.slice(-4) || 'N/A';
          return `Игрок (${displayId})`;
        })()}
      </Box>
      
      {/* Exit button in top right corner */}
      <Button
        variant="contained"
        size="small"
        onClick={() => setExitModalOpen(true)}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          bgcolor: '#f44336',
          color: 'white',
          fontWeight: 'bold',
          '&:hover': {
            bgcolor: '#d32f2f',
          },
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
          minWidth: 'auto',
          px: 1.5,
          py: 0.5,
          fontSize: '12px',
          zIndex: 10
        }}
      >
        Выйти
      </Button>
      {/* Corner panels */}
      <Box 
        sx={{ position: 'absolute', top: 80, left: 16, background: 'linear-gradient(180deg,#F4B336,#E1960D)', borderRadius: 2, px: 1.5, py: 1, minWidth: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, color: '#2e1a3a', fontWeight: 'bold', boxShadow: '0 6px 18px rgba(0,0,0,0.35), inset 0 0 0 2px rgba(255,255,255,0.3)', cursor: 'pointer' }}
        onClick={() => {
          console.log('Profession button clicked, current profModalOpen:', profModalOpen);
          setProfModalOpen(true);
          console.log('Profession modal should now be open');
        }}
      >
        {renderProfessionIcon(players.find(p => p.id === myId)?.profession)}
        {players.find(p => p.id === myId)?.profession || 'Профессия'}
      </Box>
      <Box 
        sx={{ position: 'absolute', top: 80, right: 16, background: 'linear-gradient(180deg,#3CAD57,#2E7D32)', borderRadius: 2, p: 1.5, width: 132, textAlign: 'center', color: 'white', fontWeight: 'bold', boxShadow: '0 6px 18px rgba(0,0,0,0.35), inset 0 0 0 2px rgba(255,255,255,0.2)', cursor: 'pointer' }} 
        onClick={() => setBankModalOpen(true)}
      >БАНК</Box>
      <Box 
        sx={{ 
          position: 'absolute', 
          bottom: 16, 
          left: 16, 
          background: isMyTurn 
            ? 'linear-gradient(180deg,#9C27B0,#7B1FA2)' 
            : 'linear-gradient(180deg,#7C4DAB,#5E3694)', 
          borderRadius: 2, 
          p: 1.5, 
          width: 132, 
          textAlign: 'center', 
          color: 'white', 
          fontWeight: 'bold', 
          boxShadow: isMyTurn 
            ? turnTimer <= 30 
              ? '0 8px 24px rgba(255, 87, 34, 0.8), inset 0 0 0 2px rgba(255,87,34,0.6)' 
              : '0 8px 24px rgba(156, 39, 176, 0.6), inset 0 0 0 2px rgba(255,255,255,0.4)'
            : '0 6px 18px rgba(0,0,0,0.35), inset 0 0 0 2px rgba(255,255,255,0.2)',
          cursor: isMyTurn ? 'pointer' : 'default',
          transition: 'all 0.3s ease',
          animation: isMyTurn && turnTimer <= 10 ? 'criticalPulse 0.5s infinite' : 'none',
          '@keyframes criticalPulse': {
            '0%': { 
              transform: 'scale(1)', 
              boxShadow: '0 8px 24px rgba(255, 87, 34, 0.8), inset 0 0 0 2px rgba(255,87,34,0.6)' 
            },
            '50%': { 
              transform: 'scale(1.05)', 
              boxShadow: '0 12px 32px rgba(255, 87, 34, 1), inset 0 0 0 3px rgba(255,87,34,0.8)' 
            },
            '100%': { 
              transform: 'scale(1)', 
              boxShadow: '0 8px 24px rgba(255, 87, 34, 0.8), inset 0 0 0 2px rgba(255,87,34,0.6)' 
            }
          },
          '&:hover': isMyTurn ? {
            transform: 'scale(1.05)',
            boxShadow: turnTimer <= 30 
              ? '0 12px 32px rgba(255, 87, 34, 1), inset 0 0 0 3px rgba(255,87,34,0.8)'
              : '0 10px 30px rgba(156, 39, 176, 0.8), inset 0 0 0 2px rgba(255,255,255,0.5)'
          } : {},
          opacity: isMyTurn ? 1 : 0.7
        }}
        onClick={() => {
          if (isMyTurn) {
            console.log('🎯 [GameBoard] Next player button clicked, ending turn');
            socket.emit('endTurn', roomId, myId);
            setTurnTimer(120); // Сбрасываем таймер
          } else {
            console.log('🎯 [GameBoard] Next player button clicked, but not my turn');
          }
        }}
      >
        {/* Стрелочка сверху */}
        {isMyTurn && (
          <Box sx={{ 
            position: 'absolute', 
            top: -25, 
            left: '50%', 
            transform: 'translateX(-50%)',
            fontSize: '24px',
            color: '#FFD54F',
            textShadow: '0 0 10px rgba(255, 213, 79, 0.8)',
            animation: 'bounce 1s infinite',
            '@keyframes bounce': {
              '0%, 20%, 50%, 80%, 100%': { transform: 'translateX(-50%) translateY(0)' },
              '40%': { transform: 'translateX(-50%) translateY(-8px)' },
              '60%': { transform: 'translateX(-50%) translateY(-4px)' }
            }
          }}>
            ⬇️
          </Box>
        )}
        
        {/* Таймер в центре */}
        {isMyTurn && (
          <Box sx={{ 
            fontSize: '16px', 
            fontWeight: 'bold',
            color: turnTimer <= 30 ? '#FF5722' : turnTimer <= 60 ? '#FF9800' : '#4CAF50',
            textShadow: '0 0 8px rgba(0,0,0,0.5)',
            mb: 0.5,
            animation: turnTimer <= 10 ? 'pulse 0.5s infinite' : 'none',
            '@keyframes pulse': {
              '0%': { opacity: 1, transform: 'scale(1)' },
              '50%': { opacity: 0.7, transform: 'scale(1.1)' },
              '100%': { opacity: 1, transform: 'scale(1)' }
            }
          }}>
            ⏱️ {Math.floor(turnTimer / 60)}:{(turnTimer % 60).toString().padStart(2, '0')}
          </Box>
        )}
        
        {/* Индикатор прогресса времени */}
        {isMyTurn && (
          <Box sx={{ 
            width: '100%', 
            height: 4, 
            bgcolor: 'rgba(255,255,255,0.2)', 
            borderRadius: 2, 
            mb: 1,
            overflow: 'hidden'
          }}>
            <Box sx={{ 
              height: '100%', 
              bgcolor: turnTimer <= 30 ? '#FF5722' : turnTimer <= 60 ? '#FF9800' : '#4CAF50',
              width: `${(turnTimer / 120) * 100}%`,
              transition: 'width 1s linear, background-color 0.3s ease',
              borderRadius: 2,
              boxShadow: turnTimer <= 10 ? '0 0 8px rgba(255, 87, 34, 0.8)' : 'none'
            }} />
          </Box>
        )}
        
        <AutorenewIcon sx={{ 
          fontSize: 20, 
          mb: 0.5,
          animation: isMyTurn ? 'spin 2s linear infinite' : 'none',
          '@keyframes spin': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' }
          }
        }} />
        
        <Box sx={{ fontSize: '12px', lineHeight: 1.2 }}>
          {isMyTurn ? 'СЛЕДУЮЩИЙ ИГРОК' : 'ОЖИДАНИЕ'}
        </Box>
        
        {isMyTurn && (
          <Box sx={{ 
            fontSize: '10px', 
            color: 'rgba(255,255,255,0.8)', 
            mt: 0.5,
            fontStyle: 'italic'
          }}>
            Нажмите или ждите
          </Box>
        )}
      </Box>
      <Box 
        sx={{ position: 'absolute', bottom: 16, right: 16, background: 'linear-gradient(180deg,#2E7D32,#1F5D23)', borderRadius: 2, p: 1.5, width: 132, textAlign: 'center', color: 'white', fontWeight: 'bold', boxShadow: '0 6px 18px rgba(0,0,0,0.35), inset 0 0 0 2px rgba(255,255,255,0.2)', cursor: 'pointer' }}
        onClick={() => setFreedomModalOpen(true)}
      >ФИНАНСОВАЯ СВОБОДА</Box>

      {/* Track bands */}
      <Box sx={{ position: 'absolute', width: 560, height: 560, borderRadius: '50%', border: '28px solid #3F6E35', opacity: 0.9, boxShadow: 'inset 0 0 0 4px rgba(0,0,0,0.15)' }} />
      <Box sx={{ position: 'absolute', width: 420, height: 420, borderRadius: '50%', border: '24px solid #7A3A91', opacity: 0.9, boxShadow: 'inset 0 0 0 4px rgba(0,0,0,0.15)' }} />

      {/* Outer ring */}
      {outerCells.map((cell, index) => (
        <Box key={`outer-${index}`} sx={{ position: 'absolute', transform: `rotate(${index * (360 / outerCells.length)}deg) translate(260px) rotate(-${index * (360 / outerCells.length)}deg)`, background: `linear-gradient(180deg, ${cell.color}, ${cell.color}CC)`, borderRadius: '10px', width: 44, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 12px rgba(0,0,0,0.35)', border: '2px solid rgba(255,255,255,0.18)' }}>
          <Box sx={{ color: '#FFFDE7', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '10px' }}>
            <Box sx={{ fontSize: '8px', color: '#FFF', fontWeight: 'bold', mb: '2px' }}>{index}</Box>
            {cell.icon}
          </Box>
        </Box>
      ))}

      {/* Inner ring */}
      {innerCells.map((cell, index) => (
        <Box key={`inner-${index}`} sx={{ position: 'absolute', transform: `rotate(${index * (360 / innerCells.length)}deg) translate(190px) rotate(${-index * (360 / innerCells.length)}deg)`, background: `linear-gradient(180deg, ${cell.color}, ${cell.color}CC)`, borderRadius: '10px', width: 46, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 12px rgba(0,0,0,0.35)', border: '2px solid rgba(255,255,255,0.18)' }}>
          <Box sx={{ color: '#FFFDE7', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '10px' }}>
            <Box sx={{ fontSize: '8px', color: '#FFF', fontWeight: 'bold', mb: '2px' }}>{index}</Box>
            {cell.icon}
          </Box>
        </Box>
      ))}

      <Typography variant="h3" sx={{ color: '#FFD54F', fontWeight: '900', zIndex: 1, letterSpacing: 2, textShadow: '0 3px 0 #A06B00, 0 14px 22px rgba(0,0,0,0.45)' }}>CASHFLOW</Typography>
      
      {/* Debug info - временно для отладки */}
      <Box sx={{ 
        position: 'absolute', 
        top: 80, 
        left: '50%', 
        transform: 'translateX(-50%)', 
        bgcolor: 'rgba(255,0,0,0.8)', 
        color: 'white', 
        px: 2, 
        py: 1, 
        borderRadius: 1, 
        fontSize: '14px',
        zIndex: 10
      }}>
        DEBUG: myId={myId?.slice(-4) || 'N/A'}, 
        socket.id={socket.id?.slice(-4) || 'N/A'}, 
        players={players.length}, 
        username={players.find(p => p.id === socket.id)?.username || players.find(p => p.id === myId)?.username || 'N/A'}
      </Box>

      {/* Persistent current turn indicator for all */}
      <Box sx={{ 
        position: 'absolute', 
        top: 45, 
        left: '50%', 
        transform: 'translateX(-50%)', 
        bgcolor: 'rgba(0,0,0,0.7)', 
        px: 3, 
        py: 1, 
        borderRadius: 2, 
        color: 'white', 
        fontSize: 16, 
        zIndex: 9,
        border: '2px solid rgba(255,255,255,0.2)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        minWidth: '150px',
        textAlign: 'center'
      }}>
        {currentTurn ? (
          currentTurn === myId ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
              <Box sx={{ 
                width: 10, 
                height: 10, 
                borderRadius: '50%', 
                bgcolor: '#4CAF50',
                boxShadow: '0 0 12px #4CAF50'
              }} />
              <Typography sx={{ fontWeight: 'bold', color: '#4CAF50', fontSize: '16px' }}>Ваш ход</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
              <Box sx={{ 
                width: 10, 
                height: 10, 
                borderRadius: '50%', 
                bgcolor: '#FF9800',
                boxShadow: '0 0 8px #FF9800'
              }} />
              <Typography sx={{ fontSize: '16px' }}>
                Ход: {(() => {
                  const player = players.find(p => p.id === currentTurn);
                  if (player?.username) {
                    return player.username;
                  }
                  return `Игрок (${currentTurn?.slice(-4) || 'N/A'})`;
                })()}
              </Typography>
            </Box>
          )
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
            <Box sx={{ 
              width: 10, 
              height: 10, 
              borderRadius: '50%', 
              bgcolor: '#9E9E9E',
              boxShadow: '0 0 8px #9E9E9E'
            }} />
            <Typography sx={{ fontSize: '16px' }}>Ожидание</Typography>
          </Box>
        )}
      </Box>

      {/* Players tokens on inner ring (Rat Race - show all; stack neatly when same cell) */}
      {Object.entries(
        players.filter(p => !p.isFastTrack).reduce((acc, pl) => {
          const key = ((pl.position % INNER_COUNT) + INNER_COUNT) % INNER_COUNT;
          (acc[key] ||= []).push(pl);
          return acc;
        }, {})
      ).flatMap(([cellIndex, group]) => {
        const baseAngle = Number(cellIndex) * (360 / INNER_COUNT);  // Positive for clockwise (down from top)
        const centerR = 215;
        const spacing = 18;
        return group.map((pl, idx) => {
          const offset = (idx - (group.length - 1) / 2) * spacing;
          const r = centerR + offset;
          return (
            <Box key={pl.id} sx={{ position: 'absolute', transform: `rotate(${baseAngle}deg) translate(${r}px) rotate(${-baseAngle}deg)`, transition: 'transform 0.5s ease-in-out' }}>
              <Avatar sx={{ bgcolor: pl.color || '#FF7043', width: 34, height: 34, boxShadow: '0 4px 10px rgba(0,0,0,0.5)', border: '2px solid rgba(255,255,255,0.7)' }}>{pl.username?.[0] || '?'}</Avatar>
            </Box>
          );
        });
      })}

      {/* Players tokens on outer ring (Fast Track - show all; stack neatly when same cell) */}
      {Object.entries(
        players.filter(p => p.isFastTrack).reduce((acc, pl) => {
          const key = ((pl.position % OUTER_COUNT) + OUTER_COUNT) % OUTER_COUNT;
          (acc[key] ||= []).push(pl);
          return acc;
        }, {})
      ).flatMap(([cellIndex, group]) => {
        const baseAngle = Number(cellIndex) * (360 / OUTER_COUNT);  // Positive for counter-clockwise (against clock)
        const centerR = 280;
        const spacing = 18;
        return group.map((pl, idx) => {
          const offset = (idx - (group.length - 1) / 2) * spacing;
          const r = centerR + offset;
          return (
            <Box key={pl.id} sx={{ position: 'absolute', transform: `rotate(${baseAngle}deg) translate(${r}px) rotate(${-baseAngle}deg)`, transition: 'transform 0.5s ease-in-out' }}>
              <Avatar sx={{ bgcolor: pl.color || '#FF9800', width: 36, height: 36, boxShadow: '0 4px 10px rgba(0,0,0,0.5)', border: '3px solid rgba(255,255,255,0.8)' }}>{pl.username?.[0] || '?'}</Avatar>
            </Box>
          );
        });
      })}
      {/* Transparent central roll area */}
      <Box
        role="button"
        aria-label="Бросить кубик"
        onClick={roll}
        sx={{ 
          position: 'absolute', 
          width: 300, 
          height: 300, 
          borderRadius: '50%', 
          cursor: 'pointer', 
          zIndex: 3, 
          border: '3px dashed rgba(255,255,255,0.3)',
          transition: 'all 0.3s ease',
          '&:hover': { 
            boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.4)',
            border: '3px dashed rgba(255,255,255,0.6)',
            transform: 'scale(1.02)'
          }, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      >
        {isRolling ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            gap: 2
          }}>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <motion.div 
                animate={{ 
                  rotate: [0, 360, 720, 1080],
                  scale: [1, 1.2, 0.8, 1.1, 1],
                  x: [0, -10, 10, -5, 0],
                  y: [0, -15, 5, -10, 0]
                }} 
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  ease: 'easeInOut'
                }} 
                style={{ 
                  fontSize: 48, 
                  color: '#FFD54F',
                  filter: 'drop-shadow(0 0 10px rgba(255, 213, 79, 0.6))'
                }}
              >
                <CasinoIcon fontSize="inherit" />
              </motion.div>
              
              {displayD2 > 0 && (
                <motion.div 
                  animate={{ 
                    rotate: [0, -360, -720, -1080],
                    scale: [1, 0.8, 1.3, 0.9, 1],
                    x: [0, 15, -8, 12, 0],
                    y: [0, -10, 8, -12, 0]
                  }} 
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    ease: 'easeInOut',
                    delay: 0.2
                  }} 
                  style={{ 
                    fontSize: 48, 
                    color: '#FFD54F',
                    filter: 'drop-shadow(0 0 10px rgba(255, 213, 79, 0.6))'
                  }}
                >
                  <CasinoIcon fontSize="inherit" />
                </motion.div>
              )}
            </Box>
            
            <motion.div
              animate={{
                opacity: [0.5, 1, 0.5],
                scale: [0.9, 1.1, 0.9]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <Typography variant="h6" sx={{ 
                color: '#FFD54F', 
                fontWeight: 'bold',
                textShadow: '0 0 10px rgba(255, 213, 79, 0.8)'
              }}>
                Бросаем кубики...
              </Typography>
            </motion.div>
          </Box>
        ) : (displayD1 > 0 || displayD2 > 0) ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: 2
          }}>
            <motion.div
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 260, 
                damping: 20,
                duration: 0.8
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                gap: 3,
                alignItems: 'center'
              }}>
                <motion.div
                  animate={{
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  style={{
                    background: 'linear-gradient(45deg, #FFD54F, #FFC107)',
                    borderRadius: '8px',
                    padding: '16px 20px',
                    boxShadow: '0 8px 20px rgba(255, 213, 79, 0.4)',
                    border: '2px solid rgba(255,255,255,0.3)'
                  }}
                >
                  <Typography variant="h3" sx={{ 
                    color: '#2E1B40', 
                    fontWeight: 'bold',
                    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                    lineHeight: 1
                  }}>
                    {displayD1}
                  </Typography>
                </motion.div>
                
                {displayD2 > 0 && (
                  <motion.div
                    animate={{
                      rotate: [0, -5, 5, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 0.5
                    }}
                    style={{
                      background: 'linear-gradient(45deg, #FFD54F, #FFC107)',
                      borderRadius: '8px',
                      padding: '16px 20px',
                      boxShadow: '0 8px 20px rgba(255, 213, 79, 0.4)',
                      border: '2px solid rgba(255,255,255,0.3)'
                    }}
                  >
                    <Typography variant="h3" sx={{ 
                      color: '#2E1B40', 
                      fontWeight: 'bold',
                      textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                      lineHeight: 1
                    }}>
                      {displayD2}
                    </Typography>
                  </motion.div>
                )}
              </Box>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Typography variant="h5" sx={{ 
                color: '#FFD54F', 
                fontWeight: 'bold',
                textShadow: '0 0 10px rgba(255, 213, 79, 0.8)',
                background: 'rgba(0,0,0,0.3)',
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                Сумма: {dice}
              </Typography>
            </motion.div>
          </Box>
        ) : (
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            <Typography variant="h6" sx={{ 
              color: 'rgba(255, 213, 79, 0.8)', 
              fontWeight: 'bold',
              textAlign: 'center',
              textShadow: '0 0 10px rgba(255, 213, 79, 0.5)'
            }}>
              Нажмите для броска кубиков
            </Typography>
          </motion.div>
        )}
        
        {/* Turn Controls and Timer */}
        {isMyTurn && (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: 2,
            mt: 3
          }}>
            {/* Подсказка о фиолетовой кнопке */}
            <Typography variant="body2" sx={{ 
              color: 'rgba(255,255,255,0.7)', 
              textAlign: 'center',
              fontSize: '12px',
              bgcolor: 'rgba(0,0,0,0.3)',
              px: 2,
              py: 1,
              borderRadius: 2,
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              💜 Нажмите фиолетовую кнопку слева для перехода хода
            </Typography>
          </Box>
        )}
      </Box>

      {/* Turn popup */}
      {turnBanner && (
        <Box sx={{ position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'rgba(0,0,0,0.65)', color: 'white', px: 3, py: 1.2, borderRadius: 2, fontSize: 18, zIndex: 5 }}>
          {turnBanner.text}
        </Box>
      )}

      {/* Bank Modal */}
      <Dialog open={bankModalOpen} onClose={() => setBankModalOpen(false)}>
        <DialogTitle>Банк: {players.find(p => p.id === myId)?.balance || 0} $</DialogTitle>
        <DialogContent>
          <Select value={transferTo} onChange={e => setTransferTo(e.target.value)} fullWidth sx={{ mb: 2 }}>
            <MenuItem value="">Выберите игрока</MenuItem>
            {players
              .filter(p => p.id !== myId && p.roomId === roomId) // Фильтруем только игроков из текущей комнаты
              .map(p => (
                <MenuItem key={p.id} value={p.id}>
                  {p.username || p.id.slice(-4)} {p.roomId === roomId ? '(в комнате)' : ''}
                </MenuItem>
              ))}
          </Select>
          <TextField label="Сумма" type="number" value={transferAmount} onChange={e => setTransferAmount(Number(e.target.value))} fullWidth sx={{ mb: 2 }} />
          <Button variant="contained" onClick={() => {
            if (transferTo && transferAmount > 0) {
              socket.emit('transferMoney', roomId, myId, transferTo, transferAmount);
              setTransferTo('');
              setTransferAmount(0);
              setBankModalOpen(false);
            }
          }}>Передать</Button>
        </DialogContent>
      </Dialog>

      {/* Profession Modal */}
      <Dialog 
        open={profModalOpen} 
        onClose={() => {
          console.log('Closing profession modal');
          setProfModalOpen(false);
        }}
        maxWidth="md"
        fullWidth
        sx={{
          zIndex: 9999,
          '& .MuiDialog-paper': {
            margin: '32px',
            maxHeight: 'calc(100% - 64px)',
            maxWidth: 'calc(100% - 64px)',
            zIndex: 9999
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: '#6E4D92', 
          color: 'white',
          fontWeight: 'bold',
          fontSize: '1.2rem'
        }}>
          🎯 {players.find(p => p.id === myId)?.profession || 'Профессия'}
        </DialogTitle>
        <DialogContent sx={{ 
          p: 3,
          bgcolor: '#f8f9fa'
        }}>
          <ProfessionCard roomId={roomId} />
        </DialogContent>
      </Dialog>

      {/* Freedom Modal */}
      <Dialog open={freedomModalOpen} onClose={() => setFreedomModalOpen(false)}>
        <DialogTitle>Финансовая Свобода</DialogTitle>
        <DialogContent>
          {(() => {
            const me = players.find(p => p.id === myId);
            if (!me) return <Typography>Данные недоступны.</Typography>;
            
            // Debug information
            console.log('Freedom Modal - me:', me);
            console.log('Freedom Modal - totalExpenses:', me.totalExpenses);
            console.log('Freedom Modal - expenses:', me.expenses);
            
            // Calculate total expenses from individual expenses if totalExpenses is not available
            const calculatedTotalExpenses = me.totalExpenses || 
              (me.expenses && typeof me.expenses === 'object' ? 
                Object.values(me.expenses).reduce((sum, value) => sum + (Number(value) || 0), 0) : 0);
            
            const diff = me.passiveIncome - calculatedTotalExpenses;
            return (
              <>
                <Typography>Пассивный доход: {me.passiveIncome} $</Typography>
                <Typography>Общие расходы: {calculatedTotalExpenses} $</Typography>
                <Typography sx={{ color: diff >= 0 ? 'green' : 'red' }}>
                  {diff >= 0 ? 'Вы в финансовой свободе!' : `Нужно ещё ${-diff} $ пассивного дохода.`}
                </Typography>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Deal Choice Modal */}
      <Dialog open={modal?.type === 'dealChoice'} onClose={() => setModal(null)}>
        <DialogTitle>Выберите тип сделки</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Баланс: {modal?.details?.balance || 0} $<br/>
            Денежный поток: {modal?.details?.monthlyCashflow || 0} $<br/>
            Максимальный кредит: {modal?.details?.maxLoan || 0} $
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
            <Button 
              variant="contained" 
              onClick={() => {
                socket.emit('selectDealType', roomId, 'smallDeal');
                setModal(null);
              }}
              sx={{ bgcolor: '#4CAF50', '&:hover': { bgcolor: '#45a049' } }}
            >
              🏠 Малые сделки
            </Button>
            <Button 
              variant="contained" 
              onClick={() => {
                socket.emit('selectDealType', roomId, 'bigDeal');
                setModal(null);
              }}
              sx={{ bgcolor: '#2196F3', '&:hover': { bgcolor: '#1976D2' } }}
            >
              🏢 Большие сделки
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Deal Card Modal */}
      <Dialog open={modal?.type === 'dealCard'} onClose={() => setModal(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {modal?.details?.type === 'smallDeal' ? '🏠 Малая сделка' : '🏢 Большая сделка'}
        </DialogTitle>
        <DialogContent>
          {modal?.details?.card && (
            <>
              <Typography variant="h6" sx={{ mb: 1 }}>{modal.details.card.name}</Typography>
              <Typography sx={{ mb: 1 }}>Стоимость: {modal.details.card.cost} $</Typography>
              {modal.details.card.cashflow && (
                <Typography sx={{ mb: 1 }}>Денежный поток: {modal.details.card.cashflow} $</Typography>
              )}
              {modal.details.card.downPayment && (
                <Typography sx={{ mb: 1 }}>Первоначальный взнос: {modal.details.card.downPayment} $</Typography>
              )}
              {modal.details.card.mortgage && (
                <Typography sx={{ mb: 1 }}>Ипотека: {modal.details.card.mortgage} $</Typography>
              )}
              
              <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Ваши финансы:</Typography>
                <Typography>Баланс: {modal.details.balance} $</Typography>
                <Typography>Максимальный кредит: {modal.details.maxLoan} $</Typography>
              </Box>

              {modal.details.canAfford ? (
                <Button 
                  variant="contained" 
                  onClick={() => {
                    socket.emit('buyDeal', roomId, modal.details.card, false, 0);
                    setModal(null);
                  }}
                  sx={{ mt: 2, bgcolor: '#4CAF50', '&:hover': { bgcolor: '#45a049' } }}
                  fullWidth
                >
                  💰 Купить за {modal.details.card.cost} $
                </Button>
              ) : modal.details.needsLoan ? (
                <Box sx={{ mt: 2 }}>
                  <Typography sx={{ mb: 1, color: '#FF9800', fontWeight: 'bold' }}>
                    ⚠️ Недостаточно средств. Доступны варианты:
                  </Typography>
                  
                  {/* Автоматический расчет кредита */}
                  <Box sx={{ mt: 2, p: 2, bgcolor: '#FFF3E0', borderRadius: 1, border: '1px solid #FFB74D' }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: '#E65100' }}>
                      💳 Автоматический кредит:
                    </Typography>
                    <Typography sx={{ fontSize: '14px', color: '#E65100' }}>
                      • С баланса: {Math.floor(modal.details.balance / 1000) * 1000} $ (кратно 1000)
                    </Typography>
                    <Typography sx={{ fontSize: '14px', color: '#E65100' }}>
                      • В кредит: {modal.details.card.cost - Math.floor(modal.details.balance / 1000) * 1000} $
                    </Typography>
                  </Box>

                  {/* Кнопка автоматического кредита */}
                  <Button 
                    variant="contained" 
                    onClick={() => {
                      const fromBalance = Math.floor(modal.details.balance / 1000) * 1000;
                      const creditAmount = modal.details.card.cost - fromBalance;
                      
                      if (creditAmount <= modal.details.maxLoan) {
                        socket.emit('buyDeal', roomId, modal.details.card, true, creditAmount);
                        setModal(null);
                      }
                    }}
                    sx={{ 
                      mt: 2, 
                      bgcolor: '#FF9800', 
                      '&:hover': { bgcolor: '#F57C00' },
                      mb: 2
                    }}
                    fullWidth
                  >
                    💳 Оплатить в кредит
                  </Button>

                  {/* Ручной ввод кредита */}
                  <Typography sx={{ mb: 1, color: '#666' }}>
                    Или укажите сумму кредита вручную:
                  </Typography>
                  <TextField 
                    label="Сумма кредита" 
                    type="number" 
                    value={loanAmount} 
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    fullWidth 
                    sx={{ mb: 2 }}
                    helperText={`Максимум: ${modal.details.maxLoan} $`}
                  />
                  <Button 
                    variant="outlined" 
                    onClick={() => {
                      if (loanAmount > 0 && loanAmount <= modal.details.maxLoan) {
                        socket.emit('buyDeal', roomId, modal.details.card, true, loanAmount);
                        setLoanAmount(0);
                        setModal(null);
                      }
                    }}
                    sx={{ 
                      borderColor: '#FF9800', 
                      color: '#FF9800',
                      '&:hover': { 
                        borderColor: '#F57C00',
                        bgcolor: 'rgba(255, 152, 0, 0.1)'
                      } 
                    }}
                    fullWidth
                  >
                    💳 Взять кредит и купить
                  </Button>
                </Box>
              ) : (
                <Typography sx={{ mt: 2, color: 'red' }}>
                  ❌ Недостаточно средств и кредит слишком большой
                </Typography>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Deal Bought Modal */}
      <Dialog open={modal?.type === 'dealBought'} onClose={() => setModal(null)}>
        <DialogTitle>Сделка совершена! 🎉</DialogTitle>
        <DialogContent>
          <Typography variant="h6" sx={{ mb: 1 }}>{modal?.details?.card?.name}</Typography>
          <Typography sx={{ mb: 1 }}>Покупка: {modal?.details?.card?.cost} $</Typography>
          <Typography sx={{ mb: 1 }}>Новый баланс: {modal?.details?.newBalance} $</Typography>
          <Typography sx={{ mb: 1 }}>Новый пассивный доход: {modal?.details?.newPassiveIncome} $</Typography>
        </DialogContent>
      </Dialog>

      {/* Error Modal */}
      <Dialog open={modal?.type === 'error'} onClose={() => setModal(null)}>
        <DialogTitle sx={{ color: 'red' }}>Ошибка</DialogTitle>
        <DialogContent>
          <Typography>{modal?.details?.message}</Typography>
        </DialogContent>
      </Dialog>

      {/* Market Event Modal */}
      <Dialog open={modal?.type === 'market'} onClose={() => setModal(null)}>
        <DialogTitle>📈 Рыночное событие</DialogTitle>
        <DialogContent>
          <Typography variant="h6" sx={{ mb: 1 }}>{modal?.details?.card?.name}</Typography>
          <Typography sx={{ mb: 1 }}>Цена: {modal?.details?.card?.price} $</Typography>
          <Typography sx={{ mb: 2 }}>Вы получили: {modal?.details?.proceeds} $</Typography>
          <Typography>Ваши активы с символом "{modal?.details?.card?.symbol}" были проданы.</Typography>
        </DialogContent>
      </Dialog>

      {/* Payday Event Modal */}
      <Dialog open={modal?.type === 'payday'} onClose={() => setModal(null)}>
        <DialogTitle>💰 День зарплаты</DialogTitle>
        <DialogContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Поздравляем!</Typography>
          <Typography>Вы получили: {modal?.details?.amount} $</Typography>
        </DialogContent>
      </Dialog>

      {/* Child Event Modal */}
      <Dialog open={modal?.type === 'child'} onClose={() => setModal(null)}>
        <DialogTitle>👶 У вас родился ребенок!</DialogTitle>
        <DialogContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Поздравляем!</Typography>
          <Typography>У вас появился еще один ребенок.</Typography>
          <Typography>Ваши ежемесячные расходы увеличились.</Typography>
        </DialogContent>
      </Dialog>

      {/* Doodad Event Modal */}
      <Dialog open={modal?.type === 'doodad'} onClose={() => {}} disableEscapeKeyDown maxWidth="sm" fullWidth>
        <DialogTitle>🛍️ Всякая всячина</DialogTitle>
        <DialogContent>
          {modal?.details?.card ? (
            <>
              <Typography variant="h6" sx={{ mb: 1 }}>{modal.details.card.name}</Typography>
              <Typography sx={{ mb: 2 }}>Стоимость: {modal.details.card.cost} $</Typography>
              <Typography sx={{ mb: 2 }}>{modal.details.card.description}</Typography>
              <Typography sx={{ mb: 2, color: 'red', fontWeight: 'bold' }}>
                ⚠️ Это обязательная трата! Отказаться нельзя!
              </Typography>
              
              {(() => {
                const me = players.find(p => p.id === myId);
                const cardCost = modal.details.card.cost;
                const myBalance = me?.balance || 0;
                const maxLoan = (me?.monthlyCashflow || 0) * 10;
                const canAfford = myBalance >= cardCost;
                const needsLoan = !canAfford && (cardCost <= myBalance + maxLoan);
                const cantAfford = !canAfford && !needsLoan;
                
                return (
                  <>
                    <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Ваши финансы:</Typography>
                      <Typography>Баланс: {myBalance} $</Typography>
                      <Typography>Денежный поток: {me?.monthlyCashflow || 0} $</Typography>
                      <Typography>Максимальный кредит: {maxLoan} $</Typography>
                    </Box>

                    {canAfford ? (
                      <Button 
                        variant="contained" 
                        onClick={() => {
                          socket.emit('payDoodad', roomId, modal.details.card, false, 0);
                          setModal(null);
                        }}
                        sx={{ mt: 2, bgcolor: '#4CAF50', '&:hover': { bgcolor: '#45a049' } }}
                        fullWidth
                      >
                        💰 Оплатить {cardCost} $
                      </Button>
                    ) : needsLoan ? (
                      <Box sx={{ mt: 2 }}>
                        <Typography sx={{ mb: 1, color: 'orange', fontWeight: 'bold' }}>
                          Недостаточно средств. Нужен кредит:
                        </Typography>
                        <Typography sx={{ mb: 1, fontSize: '0.9rem', color: 'gray' }}>
                          ⚠️ Кредит можно брать только кратно 1000$
                        </Typography>
                        {(() => {
                          const minNeeded = cardCost - myBalance;
                          const minLoanStep = Math.ceil(minNeeded / 1000) * 1000; // Округляем вверх до кратного 1000
                          const maxLoanSteps = Math.floor(maxLoan / 1000);
                          const loanOptions = [];
                          
                          for (let i = Math.ceil(minLoanStep / 1000); i <= maxLoanSteps; i++) {
                            loanOptions.push(i * 1000);
                          }
                          
                          return (
                            <>
                              <Box sx={{ mb: 2 }}>
                                <Typography sx={{ mb: 1, fontSize: '0.9rem' }}>
                                  Минимум нужно: {minNeeded} $ → {minLoanStep} $ (кратно 1000)
                                </Typography>
                                <Typography sx={{ mb: 1, fontSize: '0.9rem' }}>
                                  Доступные варианты кредита:
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                  {loanOptions.map(amount => (
                                    <Button
                                      key={amount}
                                      variant={loanAmount === amount ? "contained" : "outlined"}
                                      size="small"
                                      onClick={() => setLoanAmount(amount)}
                                      sx={{ 
                                        minWidth: '80px',
                                        bgcolor: loanAmount === amount ? '#FF9800' : 'transparent',
                                        borderColor: '#FF9800',
                                        color: loanAmount === amount ? 'white' : '#FF9800',
                                        '&:hover': { 
                                          bgcolor: loanAmount === amount ? '#F57C00' : 'rgba(255, 152, 0, 0.1)' 
                                        }
                                      }}
                                    >
                                      {amount}$
                                    </Button>
                                  ))}
                                </Box>
                              </Box>
                              <Button 
                                variant="contained" 
                                onClick={() => {
                                  const finalLoanAmount = loanAmount || minLoanStep;
                                  if (finalLoanAmount > 0 && finalLoanAmount <= maxLoan && finalLoanAmount >= minLoanStep && finalLoanAmount % 1000 === 0) {
                                    socket.emit('payDoodad', roomId, modal.details.card, true, finalLoanAmount);
                                    setLoanAmount(0);
                                    setModal(null);
                                  }
                                }}
                                sx={{ bgcolor: '#FF9800', '&:hover': { bgcolor: '#F57C00' } }}
                                fullWidth
                                disabled={!loanAmount || loanAmount % 1000 !== 0}
                              >
                                💳 Взять кредит {loanAmount || minLoanStep}$ и оплатить
                              </Button>
                            </>
                          );
                        })()}
                      </Box>
                    ) : (
                      <Box sx={{ mt: 2 }}>
                        <Typography sx={{ mb: 2, color: 'red', fontWeight: 'bold' }}>
                          💸 Недостаточно средств даже с максимальным кредитом!
                        </Typography>
                        <Typography sx={{ mb: 1, color: 'red' }}>
                          Нужно: {cardCost} $
                        </Typography>
                        <Typography sx={{ mb: 1, color: 'red' }}>
                          Доступно: {myBalance + maxLoan} $ (баланс + макс. кредит)
                        </Typography>
                        <Typography sx={{ mb: 2, color: 'red' }}>
                          Не хватает: {cardCost - (myBalance + maxLoan)} $
                        </Typography>
                        <Button 
                          variant="contained" 
                          onClick={() => {
                            socket.emit('declareBankruptcy', roomId);
                            setModal(null);
                          }}
                          sx={{ bgcolor: '#D32F2F', '&:hover': { bgcolor: '#B71C1C' } }}
                          fullWidth
                        >
                          💥 Объявить банкротство
                        </Button>
                      </Box>
                    )}
                  </>
                );
              })()}
            </>
          ) : (
            <Typography>Нет доступных карт Doodad.</Typography>
          )}
        </DialogContent>
      </Dialog>

      {/* Charity Offer Modal */}
      <Dialog open={modal?.type === 'charity'} onClose={() => setModal(null)}>
        <DialogTitle>❤️ Благотворительность</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Хотите пожертвовать {modal?.details?.cost} $ (10% от вашего дохода) на благотворительность?
          </Typography>
          <Typography sx={{ mb: 2 }}>
            За это вы получите возможность бросать два кубика на следующем ходу.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button 
              variant="contained" 
              onClick={() => {
                socket.emit('charityDonate', roomId);
                setModal(null);
              }}
              sx={{ bgcolor: '#4CAF50', '&:hover': { bgcolor: '#45a049' } }}
            >
              💝 Пожертвовать {modal?.details?.cost} $
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => setModal(null)}
            >
              Отказаться
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Downsized Event Modal */}
      <Dialog open={modal?.type === 'downsized'} onClose={() => setModal(null)}>
        <DialogTitle>😞 Увольнение</DialogTitle>
        <DialogContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Вас уволили!</Typography>
          <Typography sx={{ mb: 2 }}>У вас есть два варианта:</Typography>
          <Typography sx={{ mb: 1 }}>1️⃣ Оплатить один раз расходы и пропустить 2 хода</Typography>
          <Typography sx={{ mb: 2 }}>2️⃣ Оплатить 3 раза расходы без пропуска хода</Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button 
              variant="contained" 
              onClick={() => {
                socket.emit('downsizedChoice', roomId, 'skip');
                setModal(null);
              }}
              sx={{ bgcolor: '#FF9800', '&:hover': { bgcolor: '#F57C00' } }}
            >
              💰 Оплатить 1x и пропустить 2 хода
            </Button>
            <Button 
              variant="contained" 
              onClick={() => {
                socket.emit('downsizedChoice', roomId, 'pay');
                setModal(null);
              }}
              sx={{ bgcolor: '#4CAF50', '&:hover': { bgcolor: '#45a049' } }}
            >
              💰 Оплатить 3x без пропуска
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Generic Cell Event Modals */}
      <Dialog open={modal?.type === 'opportunity' && !modal?.details?.card} onClose={() => setModal(null)}>
        <DialogTitle>🎯 Возможность</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>Вы попали на клетку "Возможность"</Typography>
          <Typography sx={{ mb: 2 }}>Выберите тип сделки:</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
            <Button 
              variant="contained" 
              onClick={() => {
                socket.emit('selectDealType', roomId, 'smallDeal');
                setModal(null);
              }}
              sx={{ bgcolor: '#4CAF50', '&:hover': { bgcolor: '#45a049' } }}
            >
              🏠 Малые сделки
            </Button>
            <Button 
              variant="contained" 
              onClick={() => {
                socket.emit('selectDealType', roomId, 'bigDeal');
                setModal(null);
              }}
              sx={{ bgcolor: '#2196F3', '&:hover': { bgcolor: '#1976D2' } }}
            >
              🏢 Большие сделки
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Exit Game Modal */}
      <ExitConfirmModal
        open={exitModalOpen}
        onClose={() => setExitModalOpen(false)}
        onConfirm={handleExitGame}
      />
    </Box>
  );
};

export default GameBoard;
