import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../socket';

export const useGameNavigation = (socket, roomId, onGameStarted) => {
  const navigate = useNavigate();

  // Обработчик запуска игры
  const handleGameStarted = useCallback((gameData) => {
    // Вызываем callback для обновления состояния
    if (onGameStarted) {
      onGameStarted(gameData);
    }
    
    // Переходим к игровой доске
    const gamePath = `/game/${roomId}`;
    
    // Используем navigate для программного перехода
    navigate(gamePath, { replace: true });
  }, [navigate, roomId, onGameStarted]);

  // Подписываемся на события игры
  useEffect(() => {
    if (!socket || !roomId) return;


    
    // Слушаем запуск игры
    socket.on('gameStarted', handleGameStarted);
    
    // Слушаем обновление данных комнаты
    socket.on('roomData', (roomData) => {
      // Если игра запущена, переходим к игровой доске
      if (roomData.status === 'started') {
        handleGameStarted(roomData);
      }
    });

    return () => {
      socket.off('gameStarted', handleGameStarted);
      socket.off('roomData');
    };
  }, [socket, roomId, handleGameStarted]);

  return {
    handleGameStarted
  };
};

// Оригинальный хук для управления игровым состоянием
export const useGameState = (roomId) => {
  const [gameState, setGameState] = useState({
    players: [],
    myId: null,
    currentTurn: null,
    isMyTurn: false,
    turnTimer: 120,
    turnBanner: null,
    dice: 0,
    timer: 0,
    modal: null
  });

  // Настройка слушателей событий игры
  useEffect(() => {
    if (!socket || !roomId) return;
    
    // Слушаем список игроков
    const handlePlayersList = (playersData) => {
      if (playersData && Array.isArray(playersData)) {
        updateGameState({ players: playersData });
      }
    };

    // Слушаем обновление данных комнаты
    const handleRoomData = (roomData) => {
      if (roomData.players && Array.isArray(roomData.players)) {
        updateGameState({ players: roomData.players });
      }
    };

    // Слушаем запуск игры
    const handleGameStarted = (gameData) => {
      if (gameData.players && Array.isArray(gameData.players)) {
        updateGameState({ players: gameData.players });
      }
    };

    // Слушаем начало определения очередности
    const handleOrderDeterminationStarted = (orderData) => {
      if (orderData.players && Array.isArray(orderData.players)) {
        // Преобразуем данные игроков в нужный формат
        const players = orderData.players.map(p => ({
          id: p.id,
          username: p.username,
          ready: true,
          roomId: roomId
        }));
        updateGameState({ players });
      }
    };

    socket.on('playersList', handlePlayersList);
    socket.on('roomData', handleRoomData);
    socket.on('gameStarted', handleGameStarted);
    socket.on('orderDeterminationStarted', handleOrderDeterminationStarted);

    return () => {
      socket.off('playersList', handlePlayersList);
      socket.off('roomData', handleRoomData);
      socket.off('gameStarted', handleGameStarted);
      socket.off('orderDeterminationStarted', handleOrderDeterminationStarted);
    };
  }, [socket, roomId]);

  const [bankState, setBankState] = useState({
    modalOpen: false,
    transferTo: '',
    transferAmount: 0
  });

  const [professionState, setProfessionState] = useState({
    modalOpen: false
  });

  const [freedomState, setFreedomState] = useState({
    modalOpen: false
  });

  const [exitState, setExitState] = useState({
    modalOpen: false
  });

  // Обновление состояния игры
  const updateGameState = useCallback((updates) => {
    // Убираем все логи для предотвращения перерендеров и спама
    setGameState(prev => {
      let newState;
      
      if (typeof updates === 'function') {
        // Если updates - это функция, вызываем её с предыдущим состоянием
        newState = updates(prev);
      } else {
        // Если updates - это объект, объединяем с предыдущим состоянием
        newState = { ...prev, ...updates };
      }
      
      return newState;
    });
  }, []);

  // Обновление состояния банка
  const updateBankState = useCallback((updates) => {
    setBankState(prev => ({ ...prev, ...updates }));
  }, []);

  // Обновление состояния профессии
  const updateProfessionState = useCallback((updates) => {
    setProfessionState(prev => ({ ...prev, ...updates }));
  }, []);

  // Обновление состояния свободы
  const updateFreedomState = useCallback((updates) => {
    setFreedomState(prev => ({ ...prev, ...updates }));
  }, []);

  // Обновление состояния выхода
  const updateExitState = useCallback((updates) => {
    setExitState(prev => ({ ...prev, ...updates }));
  }, []);

  // Получение текущего игрока
  const getCurrentPlayer = useCallback(() => {
    return gameState.players && Array.isArray(gameState.players) ? gameState.players.find(p => p.id === gameState.myId) : null;
  }, [gameState.players, gameState.myId]);

  // Получение игрока по ID
  const getPlayerById = useCallback((playerId) => {
    return gameState.players && Array.isArray(gameState.players) ? gameState.players.find(p => p.id === playerId) : null;
  }, [gameState.players]);

  // Проверка, является ли игрок текущим
  const isCurrentPlayer = useCallback((playerId) => {
    return gameState.currentTurn === playerId;
  }, [gameState.currentTurn]);

  // Проверка, является ли игрок хостом
  const isHost = useCallback((playerId) => {
    const player = getPlayerById(playerId);
    return player?.isHost || false;
  }, [getPlayerById]);

  // Получение количества игроков
  const getPlayersCount = useCallback(() => {
    return gameState.players && Array.isArray(gameState.players) ? gameState.players.length : 0;
  }, [gameState.players]);

  // Получение готовых игроков
  const getReadyPlayers = useCallback(() => {
    return gameState.players && Array.isArray(gameState.players) ? gameState.players.filter(p => p.ready) : [];
  }, [gameState.players]);

  // Получение игроков в комнате
  const getPlayersInRoom = useCallback((roomId) => {
    return gameState.players && Array.isArray(gameState.players) ? gameState.players.filter(p => p.roomId === roomId) : [];
  }, [gameState.players]);

  // Получение игроков для перевода денег
  const getTransferablePlayers = useCallback(() => {
    return gameState.players && Array.isArray(gameState.players) ? gameState.players.filter(p => p.id !== gameState.myId) : [];
  }, [gameState.players, gameState.myId]);

  return {
    gameState,
    bankState,
    professionState,
    freedomState,
    exitState,
    updateGameState,
    updateBankState,
    updateProfessionState,
    updateFreedomState,
    updateExitState,
    getCurrentPlayer,
    getPlayerById,
    isCurrentPlayer,
    isHost,
    getPlayersCount,
    getReadyPlayers,
    getPlayersInRoom,
    getTransferablePlayers
  };
};
