import { useState, useEffect, useCallback } from 'react';

/**
 * Кастомный хук для управления ходами игроков
 * Отвечает за очередность ходов, таймер и логику смены ходов
 */
export const useGameTurn = (gamePlayers, roomId, socket) => {
  const [currentTurn, setCurrentTurn] = useState(null);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [turnOrder, setTurnOrder] = useState([]);
  const [turnTimeLeft, setTurnTimeLeft] = useState(120); // 2 минуты на ход
  const [isMyTurn, setIsMyTurn] = useState(false);

  // Функция для получения имени игрока по ID
  const getPlayerNameById = useCallback((playerId) => {
    if (!playerId) return 'Неизвестный игрок';
    const player = gamePlayers.find(p => p.id === playerId || p.socketId === playerId);
    return player?.username || 'Неизвестный игрок';
  }, [gamePlayers]);

  // Функция для получения следующего игрока
  const getNextPlayer = useCallback(() => {
    if (gamePlayers.length === 0) return null;
    const nextIndex = (currentTurnIndex + 1) % gamePlayers.length;
    return gamePlayers[nextIndex];
  }, [gamePlayers, currentTurnIndex]);

  // Функция для смены хода
  const changeTurn = useCallback(() => {
    if (gamePlayers.length === 0) return;
    
    const nextIndex = (currentTurnIndex + 1) % gamePlayers.length;
    const nextPlayer = gamePlayers[nextIndex];
    
    setCurrentTurnIndex(nextIndex);
    setCurrentTurn(nextPlayer.username);
    setTurnTimeLeft(120); // Сбрасываем таймер
    
    // Синхронизируем с сервером
    if (socket.connected && roomId) {
      socket.emit('changeTurn', {
        roomId,
        currentTurn: nextPlayer.username,
        currentTurnIndex: nextIndex
      });
    }
  }, [gamePlayers, currentTurnIndex, roomId]);

  // Функция для проверки, может ли игрок бросать кубик
  const canRollDice = useCallback(() => {
    if (!socket?.id || gamePlayers.length === 0) return false;
    
    const currentPlayer = gamePlayers.find(p => p.socketId === socket.id);
    return currentPlayer && currentPlayer.username === currentTurn;
  }, [gamePlayers, currentTurn, socket?.id]);

  // Загрузка данных хода из localStorage
  useEffect(() => {
    const savedTurnOrder = localStorage.getItem('potok-deneg_turnOrder');
    const savedCurrentTurn = localStorage.getItem('potok-deneg_currentTurn');
    
    if (savedTurnOrder) {
      try {
        setTurnOrder(JSON.parse(savedTurnOrder));
      } catch (e) {
        console.error('❌ [useGameTurn] Ошибка парсинга turnOrder:', e);
      }
    }
    
    if (savedCurrentTurn) {
      setCurrentTurn(savedCurrentTurn);
    }
  }, []);

  // Обработчики Socket.IO событий
  useEffect(() => {
    if (!socket || !roomId) return;

    const handleTurnChanged = (data) => {
      console.log('🔄 [useGameTurn] Turn changed:', data);
      setCurrentTurn(data.currentTurn);
      setCurrentTurnIndex(data.currentTurnIndex);
      setTurnTimeLeft(120);
    };

    const handleTurnTimerSynced = (data) => {
      console.log('⏰ [useGameTurn] Turn timer synced:', data);
      setTurnTimeLeft(data.timeLeft);
    };

    // Подписываемся на события
    socket.on('playerTurnChanged', handleTurnChanged);
    socket.on('turnTimerSynced', handleTurnTimerSynced);

    return () => {
      socket.off('playerTurnChanged', handleTurnChanged);
      socket.off('turnTimerSynced', handleTurnTimerSynced);
    };
  }, [socket, roomId]);

  // Обновление isMyTurn при изменении currentTurn
  useEffect(() => {
    if (!socket?.id || gamePlayers.length === 0) {
      setIsMyTurn(false);
      return;
    }
    
    const currentPlayer = gamePlayers.find(p => p.socketId === socket.id);
    setIsMyTurn(currentPlayer && currentPlayer.username === currentTurn);
  }, [currentTurn, gamePlayers, socket?.id]);

  // Таймер хода
  useEffect(() => {
    if (!isMyTurn || turnTimeLeft <= 0) return;

    const timer = setInterval(() => {
      setTurnTimeLeft(prev => {
        if (prev <= 1) {
          // Время вышло, переходим к следующему игроку
          changeTurn();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isMyTurn, turnTimeLeft, changeTurn]);

  // Инициализация порядка ходов при загрузке игроков
  useEffect(() => {
    if (gamePlayers.length > 0 && turnOrder.length === 0) {
      const initialTurnOrder = gamePlayers.map(p => p.username);
      setTurnOrder(initialTurnOrder);
      localStorage.setItem('potok-deneg_turnOrder', JSON.stringify(initialTurnOrder));
      
      // Устанавливаем первого игрока как текущего
      if (!currentTurn) {
        setCurrentTurn(initialTurnOrder[0]);
        setCurrentTurnIndex(0);
      }
    }
  }, [gamePlayers, turnOrder.length, currentTurn]);

  return {
    currentTurn,
    currentTurnIndex,
    turnOrder,
    turnTimeLeft,
    isMyTurn,
    setCurrentTurn,
    setCurrentTurnIndex,
    setTurnOrder,
    setTurnTimeLeft,
    getPlayerNameById,
    getNextPlayer,
    changeTurn,
    canRollDice
  };
};
