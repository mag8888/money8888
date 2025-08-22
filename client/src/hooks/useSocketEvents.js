import { useEffect, useCallback, useRef } from 'react';
import socket from '../socket';

export const useSocketEvents = (roomId, updateGameState, updateBankState, updateProfessionState, updateFreedomState, updateExitState) => {
  const eventHandlers = useRef(new Map());

  // Регистрация обработчика события
  const registerEventHandler = useCallback((event, handler) => {
    if (eventHandlers.current.has(event)) {
      socket.off(event, eventHandlers.current.get(event));
    }
    eventHandlers.current.set(event, handler);
    socket.on(event, handler);
  }, []);

  // Отмена регистрации обработчика события
  const unregisterEventHandler = useCallback((event) => {
    if (eventHandlers.current.has(event)) {
      socket.off(event, eventHandlers.current.get(event));
      eventHandlers.current.delete(event);
    }
  }, []);

  // Обработчик подключения
  const handleConnect = useCallback(() => {
    console.log('🔄 [Socket] Connected, syncing game state');
    socket.emit('getRoom', roomId);
    socket.emit('getPlayers', roomId);
  }, [roomId]);

  // Обработчик отключения
  const handleDisconnect = useCallback((reason) => {
    console.log('🔄 [Socket] Disconnected:', reason);
    updateGameState({ isMyTurn: false, currentTurn: null });
  }, [updateGameState]);

  // Обработчик ошибки подключения
  const handleConnectError = useCallback((error) => {
    console.error('🔄 [Socket] Connection error:', error);
  }, []);

  // Обработчик списка игроков
  const handlePlayersList = useCallback((playersList) => {
    console.log('[playersList] received:', playersList);
    
    // Синхронизируем myId с socket.id если они различаются
    const actualMyId = socket.id;
    let myId = actualMyId;
    
    // Ищем игрока по socket.id
    const currentPlayer = playersList.find(p => p.socketId === actualMyId);
    if (currentPlayer) {
      myId = currentPlayer.id;
      console.log('[playersList] Found current player:', currentPlayer.username);
    } else {
      console.log('[playersList] Current player not found in list');
    }
    
    updateGameState({
      players: playersList,
      myId: myId,
      isMyTurn: currentPlayer ? currentPlayer.id === updateGameState.currentTurn : false
    });
  }, [updateGameState]);

  // Обработчик обновления игроков
  const handlePlayersUpdate = useCallback((playersList) => {
    console.log('[playersUpdate] received:', playersList);
    
    // Добавляем цвета игрокам для визуального различия
    const playersWithColors = playersList.map((player, index) => {
      if (!player.color) {
        player.color = ['#FF7043', '#4CAF50', '#2196F3', '#9C27B0', '#FF9800', '#795548'][index % 6];
      }
      return player;
    });
    
    updateGameState({ players: playersWithColors });
  }, [updateGameState]);

  // Обработчик изменения хода
  const handleTurnChanged = useCallback((playerId) => {
    console.log('[turnChanged] received:', { playerId, myId: updateGameState.myId, socketId: socket.id });
    
    const isMyTurn = playerId === updateGameState.myId;
    updateGameState({
      currentTurn: playerId,
      isMyTurn: isMyTurn,
      turnBanner: isMyTurn ? 'Ваш ход' : `Ход: ${updateGameState.players.find(p => p.id === playerId)?.username || 'Игрок'}`
    });
    
    if (isMyTurn) {
      // Сбрасываем таймер хода
      updateGameState({ turnTimer: 120 });
    }
  }, [updateGameState]);

  // Обработчик данных комнаты
  const handleRoomData = useCallback((data) => {
    console.log('[roomData] received:', data);
    
    if (typeof data.currentTurn === 'string' && data.currentTurn) {
      const isMyTurn = data.currentTurn === updateGameState.myId;
      updateGameState({
        currentTurn: data.currentTurn,
        isMyTurn: isMyTurn,
        turnTimer: 120,
        turnBanner: isMyTurn ? 'Ваш ход' : `Ход: ${updateGameState.players.find(p => p.id === data.currentTurn)?.username || 'Игрок'}`
      });
    }
  }, [updateGameState]);

  // Обработчик начала игры
  const handleGameStarted = useCallback(() => {
    console.log('[gameStarted] received');
    
    // Перезапрашиваем данные через небольшую задержку
    setTimeout(() => {
      socket.emit('getRoom', roomId);
      socket.emit('getPlayers', roomId);
    }, 100);
  }, [roomId]);

  // Обработчик выбора сделки
  const handleDealChoice = useCallback(({ playerId, cellType, position, balance, monthlyCashflow }) => {
    console.log('dealChoice received:', { playerId, myId: updateGameState.myId });
    
    updateGameState({
      modal: {
        type: 'dealChoice',
        details: {
          cellType,
          position,
          balance,
          monthlyCashflow,
          maxLoan: monthlyCashflow * 10
        }
      }
    });
  }, [updateGameState]);

  // Обработчик карты сделки
  const handleDealCard = useCallback(({ card, type, playerId, balance, maxLoan, canAfford, needsLoan }) => {
    console.log('dealCard received:', { playerId, myId: updateGameState.myId });
    
    updateGameState({
      modal: {
        type: 'dealCard',
        details: {
          card,
          type,
          balance,
          maxLoan,
          canAfford,
          needsLoan
        }
      }
    });
  }, [updateGameState]);

  // Обработчик купленной сделки
  const handleDealBought = useCallback(({ playerId, card, newBalance, newPassiveIncome }) => {
    updateGameState({
      modal: {
        type: 'dealBought',
        details: {
          card,
          newBalance,
          newPassiveIncome
        }
      }
    });
  }, [updateGameState]);

  // Обработчик ошибки сделки
  const handleDealError = useCallback(({ message }) => {
    updateGameState({
      modal: {
        type: 'error',
        details: { message }
      }
    });
  }, [updateGameState]);

  // Обработчик события сделки
  const handleDealEvent = useCallback(({ card, type }) => {
    updateGameState({
      modal: {
        type: 'deal',
        details: { card, dealType: type }
      }
    });
  }, [updateGameState]);

  // Обработчик обновления игрока
  const handlePlayerUpdated = useCallback((player) => {
    console.log('[playerUpdated]', player.id);
    
    updateGameState(prev => {
      const exists = prev.players.some(p => p.id === player.id);
      const newPlayers = exists 
        ? prev.players.map(p => (p.id === player.id ? player : p))
        : [...prev.players, player];
      
      return { players: newPlayers };
    });
  }, [updateGameState]);

  // Обработчик обновления позиции игрока
  const handlePlayerPositionUpdated = useCallback(({ playerId, position, cellType }) => {
    console.log('[playerPositionUpdated]', { playerId, position, cellType });
    
    updateGameState(prev => ({
      players: prev.players.map(p => p.id === playerId ? { ...p, position } : p)
    }));
    
    if (playerId === updateGameState.myId) {
      // Определяем тип клетки на основе позиции для малого круга
      let cellType = 'small';
      if (position >= 0 && position <= 23) {
        cellType = 'outer';
      } else if (position >= 24 && position <= 47) {
        cellType = 'inner';
      }
      
      console.log('[playerPositionUpdated] Player moved to:', { position, cellType });
    }
  }, [updateGameState]);

  // Регистрация всех обработчиков событий
  useEffect(() => {
    registerEventHandler('connect', handleConnect);
    registerEventHandler('disconnect', handleDisconnect);
    registerEventHandler('connect_error', handleConnectError);
    registerEventHandler('playersList', handlePlayersList);
    registerEventHandler('playersUpdate', handlePlayersUpdate);
    registerEventHandler('turnChanged', handleTurnChanged);
    registerEventHandler('roomData', handleRoomData);
    registerEventHandler('gameStarted', handleGameStarted);
    registerEventHandler('dealChoice', handleDealChoice);
    registerEventHandler('dealCard', handleDealCard);
    registerEventHandler('dealBought', handleDealBought);
    registerEventHandler('dealError', handleDealError);
    registerEventHandler('dealEvent', handleDealEvent);
    registerEventHandler('playerUpdated', handlePlayerUpdated);
    registerEventHandler('playerPositionUpdated', handlePlayerPositionUpdated);

    // Очистка при размонтировании
    return () => {
      eventHandlers.current.forEach((handler, event) => {
        socket.off(event, handler);
      });
      eventHandlers.current.clear();
    };
  }, [
    roomId,
    registerEventHandler,
    handleConnect,
    handleDisconnect,
    handleConnectError,
    handlePlayersList,
    handlePlayersUpdate,
    handleTurnChanged,
    handleRoomData,
    handleGameStarted,
    handleDealChoice,
    handleDealCard,
    handleDealBought,
    handleDealError,
    handleDealEvent,
    handlePlayerUpdated,
    handlePlayerPositionUpdated
  ]);

  return {
    registerEventHandler,
    unregisterEventHandler
  };
};
