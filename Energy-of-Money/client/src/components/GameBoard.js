import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, Button } from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import HomeIcon from '@mui/icons-material/Home';
import GavelIcon from '@mui/icons-material/Gavel';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import SpaIcon from '@mui/icons-material/Spa';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import CampaignIcon from '@mui/icons-material/Campaign';
import WarningIcon from '@mui/icons-material/Warning';
import HotelIcon from '@mui/icons-material/Hotel';
import LandscapeIcon from '@mui/icons-material/Landscape';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FlightIcon from '@mui/icons-material/Flight';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

// Конфигурация игрового поля
const BOARD_CONFIG = {
  cells: [
    {
      id: 1,
      type: 'money',
      name: 'Деньги',
      description: 'Вам выплачивается доход от ваших инвестиций',
      icon: <AttachMoneyIcon />,
      color: '#FFD700',
      action: 'income'
    },
    {
      id: 2,
      type: 'dream',
      name: 'Построить дом мечты',
      description: 'Собственный дом с садом и бассейном',
      cost: 100000,
      icon: <HomeIcon />,
      color: '#87CEEB',
      action: 'dream'
    },
    {
      id: 3,
      type: 'business',
      name: 'Кофейня в центре города',
      description: 'Кофейня с высоким трафиком',
      cost: 100000,
      income: 3000,
      icon: <LocalCafeIcon />,
      color: '#90EE90',
      action: 'business'
    },
    {
      id: 4,
      type: 'loss',
      name: 'Потеря аудит',
      description: 'Налоговая проверка',
      penalty: -0.5,
      icon: <GavelIcon />,
      color: '#FFB6C1',
      action: 'penalty'
    },
    {
      id: 5,
      type: 'business',
      name: 'Центр здоровья и спа',
      description: 'Премиум спа-центр',
      cost: 270000,
      income: 5000,
      icon: <SpaIcon />,
      color: '#90EE90',
      action: 'business'
    },
    {
      id: 6,
      type: 'dream',
      name: 'Посетить Антарктиду',
      description: 'Путешествие на край света',
      cost: 150000,
      icon: <FlightIcon />,
      color: '#87CEEB',
      action: 'dream'
    },
    {
      id: 7,
      type: 'business',
      name: 'Мобильное приложение (подписка)',
      description: 'Приложение с ежемесячной подпиской',
      cost: 420000,
      income: 10000,
      icon: <PhoneAndroidIcon />,
      color: '#90EE90',
      action: 'business'
    },
    {
      id: 8,
      type: 'charity',
      name: 'Благотворительность',
      description: 'Помощь нуждающимся',
      icon: <VolunteerActivismIcon />,
      color: '#FF69B4',
      action: 'charity'
    },
    {
      id: 9,
      type: 'business',
      name: 'Агентство цифрового маркетинга',
      description: 'Маркетинговые услуги',
      cost: 160000,
      income: 4000,
      icon: <CampaignIcon />,
      color: '#90EE90',
      action: 'business'
    },
    {
      id: 10,
      type: 'loss',
      name: 'Кража 100% наличных',
      description: 'Потеря всех наличных денег',
      penalty: -1,
      icon: <WarningIcon />,
      color: '#FFB6C1',
      action: 'penalty'
    },
    {
      id: 11,
      type: 'business',
      name: 'Мини-отель/бутик-гостиница',
      description: 'Элитная гостиница',
      cost: 200000,
      income: 5000,
      icon: <HotelIcon />,
      color: '#90EE90',
      action: 'business'
    },
    {
      id: 12,
      type: 'dream',
      name: 'Подняться на все высочайшие вершины мира',
      description: 'Альпинистское достижение',
      cost: 500000,
      icon: <LandscapeIcon />,
      color: '#87CEEB',
      action: 'dream'
    },
    {
      id: 13,
      type: 'business',
      name: 'Франшиза популярного ресторана',
      description: 'Ресторан известной сети',
      cost: 320000,
      income: 8000,
      icon: <RestaurantIcon />,
      color: '#90EE90',
      action: 'business'
    },
    {
      id: 14,
      type: 'money',
      name: 'Объехать 100 стран',
      description: 'Путешествие по всему миру',
      cost: 500000,
      icon: <FlightTakeoffIcon />,
      color: '#FFD700',
      action: 'money'
    }
  ]
};

const GameBoard = ({ roomId, socket, user, onExit }) => {
  const [players, setPlayers] = useState([]);
  const [currentTurn, setCurrentTurn] = useState(null);
  const [timer, setTimer] = useState(0);
  const [modal, setModal] = useState(null);
  const [turnBanner, setTurnBanner] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [displayDice, setDisplayDice] = useState(0);
  const [displayD1, setDisplayD1] = useState(0);
  const [displayD2, setDisplayD2] = useState(0);

  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [canEndTurn, setCanEndTurn] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (socket) {
      // Слушаем обновления игроков
      socket.on('game_started', ({ room }) => {
        setGameStarted(true);
        setPlayers(room.players || []);
        setCurrentTurn(room.players?.[0]?.id || null);
        showToast('🎮 Игра началась!', 'success');
      });

      socket.on('player_updated', ({ player, room }) => {
        setPlayers(room.players || []);
      });

      socket.on('turn_started', ({ playerId, duration }) => {
        setCurrentTurn(playerId);
        setTimer(duration || 120);
        if (playerId === user?.id) {
          setTurnBanner({ text: '🎯 Ваш ход!', color: 'success' });
        } else {
          const player = players.find(p => p.id === playerId);
          setTurnBanner({ text: `🎯 Ход игрока: ${player?.username || 'Неизвестно'}`, color: 'info' });
        }
      });

      socket.on('dice_rolled', ({ playerId, dice1, dice2, total }) => {
        if (playerId === user?.id) {
          setDisplayD1(dice1);
          setDisplayD2(dice2);
          setDisplayDice(total);
          setIsRolling(false);
          movePlayer(user.id, total);
        }
      });

      socket.on('cell_event', ({ playerId, cellId, event }) => {
        const cell = BOARD_CONFIG.cells.find(c => c.id === cellId);
        if (cell) {
          setModal({ cell, event, playerId });
        }
      });

      socket.on('turn_ended', ({ playerId }) => {
        if (playerId === user?.id) {
          setCanEndTurn(false);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('game_started');
        socket.off('player_updated');
        socket.off('turn_started');
        socket.off('dice_rolled');
        socket.off('cell_event');
        socket.off('turn_ended');
      }
    };
  }, [socket, user, players]);

  const showToast = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };

  const handleRollDice = () => {
    if (!isMyTurn() || isRolling) return;
    
    setIsRolling(true);
    socket.emit('roll_dice', { roomId, playerId: user.id });
  };

  const isMyTurn = () => {
    return currentTurn === user?.id;
  };

  const movePlayer = (playerId, steps) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    let currentPos = player.position || 0;
    
    const moveStep = () => {
      if (steps > 0) {
        currentPos = (currentPos + 1) % BOARD_CONFIG.cells.length;
        steps--;
        setTimeout(moveStep, 500);
      } else {
        // Отправляем событие о достижении клетки
        socket.emit('player_moved', { roomId, playerId, cellId: currentPos + 1 });
      }
    };

    moveStep();
  };

  const handleEndTurn = () => {
    if (!canEndTurn) return;
    
    socket.emit('end_turn', { roomId, playerId: user.id });
    setCanEndTurn(false);
  };

  const handleCellAction = (cell) => {
    switch (cell.action) {
      case 'business':
        if (cell.cost && cell.cost > (user?.balance || 0)) {
          showToast(`Недостаточно средств для покупки: $${cell.cost}`, 'error');
        } else {
          // Покупка бизнеса
          socket.emit('buy_business', { roomId, playerId: user.id, cellId: cell.id });
        }
        break;
      case 'dream':
        if (cell.cost && cell.cost > (user?.balance || 0)) {
          showToast(`Недостаточно средств для мечты: $${cell.cost}`, 'error');
        } else {
          // Покупка мечты
          socket.emit('buy_dream', { roomId, playerId: user.id, cellId: cell.id });
        }
        break;
      case 'penalty':
        // Применение штрафа
        socket.emit('apply_penalty', { roomId, playerId: user.id, cellId: cell.id, penalty: cell.penalty });
        break;
      case 'charity':
        // Благотворительность
        socket.emit('charity_action', { roomId, playerId: user.id, cellId: cell.id });
        break;
      default:
        break;
    }
    setModal(null);
  };

  const renderCell = (cell, index) => {
    const playerAtCell = players.find(p => (p.position || 0) === index);
    
    return (
      <Box
        key={cell.id}
        sx={{
          position: 'relative',
          width: 120,
          height: 120,
          border: '2px solid #333',
          borderRadius: '8px',
          backgroundColor: cell.color,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          '&:hover': { opacity: 0.8 },
          p: 1,
          textAlign: 'center'
        }}
        onClick={() => setModal({ cell, event: null, playerId: null })}
      >
        <Box sx={{ fontSize: '24px', mb: 1 }}>
          {cell.icon}
        </Box>
        <Typography variant="caption" sx={{ fontSize: '10px', fontWeight: 'bold' }}>
          {cell.name}
        </Typography>
        
        {/* Фишки игроков на клетке */}
        {playerAtCell && (
          <Box
            sx={{
              position: 'absolute',
              top: -10,
              right: -10,
              width: 20,
              height: 20,
              borderRadius: '50%',
              backgroundColor: '#FF6B6B',
              border: '2px solid white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
              color: 'white'
            }}
          >
            {playerAtCell.username?.charAt(0) || '?'}
          </Box>
        )}
      </Box>
    );
  };

  const renderGameControls = () => (
    <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        🎮 Управление игрой
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<CasinoIcon />}
          onClick={handleRollDice}
          disabled={!isMyTurn() || isRolling}
          color="primary"
        >
          {isRolling ? 'Бросаю...' : 'Бросать кубик'}
        </Button>
        
        <Button
          variant="outlined"
          onClick={handleEndTurn}
          disabled={!canEndTurn}
          color="secondary"
        >
          Завершить ход
        </Button>
      </Box>

      {/* Информация о кубиках */}
      {displayDice > 0 && (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Typography variant="body2">Кубики:</Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Box sx={{ width: 30, height: 30, bgcolor: 'white', border: '1px solid #ccc', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {displayD1}
            </Box>
            <Box sx={{ width: 30, height: 30, bgcolor: 'white', border: '1px solid #ccc', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {displayD2}
            </Box>
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            = {displayDice}
          </Typography>
        </Box>
      )}
    </Box>
  );

  const renderPlayers = () => (
    <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        👥 Игроки
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {players.map((player) => (
          <Box
            key={player.id}
            sx={{
              p: 2,
              border: '2px solid',
              borderColor: player.id === currentTurn ? '#4CAF50' : '#ddd',
              borderRadius: 2,
              bgcolor: player.id === currentTurn ? '#E8F5E8' : 'background.paper',
              minWidth: 150
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar sx={{ mr: 1, bgcolor: player.id === currentTurn ? '#4CAF50' : '#2196F3' }}>
                {player.username?.charAt(0) || '?'}
              </Avatar>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {player.username}
                {player.id === currentTurn && ' (Ход)'}
              </Typography>
            </Box>
            
            <Typography variant="caption" display="block">
              💰 Баланс: ${player.balance?.toLocaleString() || 0}
            </Typography>
            
            <Typography variant="caption" display="block">
              🎯 Позиция: {player.position || 0}
            </Typography>
            
            {player.profession && (
              <Typography variant="caption" display="block">
                💼 {player.profession.name}
              </Typography>
            )}
            
            {player.dream && (
              <Typography variant="caption" display="block">
                💭 {player.dream.name}
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );

  if (!gameStarted) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          ⏳ Ожидание начала игры...
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Хост должен запустить игру
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom align="center">
        🎮 Energy of Money - Игровое поле
      </Typography>

      {/* Баннер текущего хода */}
      {turnBanner && (
        <Box
          sx={{
            p: 2,
            bgcolor: `${turnBanner.color}.main`,
            color: 'white',
            borderRadius: 2,
            mb: 2,
            textAlign: 'center'
          }}
        >
          <Typography variant="h6">
            {turnBanner.text}
          </Typography>
          {timer > 0 && (
            <Typography variant="body2">
              ⏱️ Время: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
            </Typography>
          )}
        </Box>
      )}

      {/* Управление игрой */}
      {renderGameControls()}

      {/* Игровое поле */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          🎯 Игровое поле
        </Typography>
        
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 1,
            maxWidth: 'fit-content',
            mx: 'auto'
          }}
        >
          {BOARD_CONFIG.cells.map((cell, index) => renderCell(cell, index))}
        </Box>
      </Box>

      {/* Информация об игроках */}
      {renderPlayers()}

      {/* Модальное окно клетки */}
      {modal && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setModal(null)}
        >
          <Box
            sx={{
              bgcolor: 'background.paper',
              p: 3,
              borderRadius: 2,
              maxWidth: 400,
              textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Box sx={{ fontSize: '48px', mb: 2, color: modal.cell.color }}>
              {modal.cell.icon}
            </Box>
            
            <Typography variant="h6" gutterBottom>
              {modal.cell.name}
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 2 }}>
              {modal.cell.description}
            </Typography>
            
            {modal.cell.cost && (
              <Typography variant="body2" sx={{ mb: 1, color: 'error.main' }}>
                💰 Стоимость: ${modal.cell.cost.toLocaleString()}
              </Typography>
            )}
            
            {modal.cell.income && (
              <Typography variant="body2" sx={{ mb: 1, color: 'success.main' }}>
                💵 Доход: ${modal.cell.income.toLocaleString()}/мес
              </Typography>
            )}
            
            {modal.cell.penalty && (
              <Typography variant="body2" sx={{ mb: 1, color: 'error.main' }}>
                ❌ Штраф: {modal.cell.penalty > 0 ? '+' : ''}{modal.cell.penalty * 100}%
              </Typography>
            )}
            
            <Button
              variant="contained"
              onClick={() => handleCellAction(modal.cell)}
              sx={{ mt: 2 }}
            >
              {modal.cell.action === 'business' || modal.cell.action === 'dream' ? 'Купить' : 'OK'}
            </Button>
          </Box>
        </Box>
      )}

      {/* Toast уведомления */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
      >
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GameBoard;
