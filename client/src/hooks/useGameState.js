import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../socket';

export const useGameNavigation = (socket, roomId, onGameStarted) => {
  const navigate = useNavigate();

  // Обработчик запуска игры
  const handleGameStarted = useCallback((gameData) => {
    console.log('🎮 [useGameNavigation] Game started event received:', gameData);
    console.log('🎮 [useGameNavigation] Current roomId:', roomId);
    
    // Вызываем callback для обновления состояния
    if (onGameStarted) {
      onGameStarted(gameData);
    }
    
    // Переходим к игровой доске
    const gamePath = `/game/${roomId}`;
    console.log('🚀 [useGameNavigation] Navigating to game board:', gamePath);
    
    // Используем navigate для программного перехода
    navigate(gamePath, { replace: true });
  }, [navigate, roomId, onGameStarted]);

  // Подписываемся на события игры
  useEffect(() => {
    if (!socket || !roomId) return;

    console.log('🎮 [useGameNavigation] Setting up game event listeners for room:', roomId);
    
    // Слушаем запуск игры
    socket.on('gameStarted', handleGameStarted);
    
    // Слушаем обновление данных комнаты
    socket.on('roomData', (roomData) => {
      console.log('🏠 [useGameNavigation] Room data updated:', roomData);
      
      // Если игра запущена, переходим к игровой доске
      if (roomData.status === 'started') {
        console.log('🚀 [useGameNavigation] Room status is started, navigating to game board');
        handleGameStarted(roomData);
      }
    });

    return () => {
      console.log('🎮 [useGameNavigation] Cleaning up game event listeners');
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

  // Подписываемся на события игры для обновления списка игроков
  useEffect(() => {
    if (!socket || !roomId) return;

    console.log('🎮 [useGameState] Setting up game event listeners for room:', roomId);
    
    // Слушаем список игроков
    const handlePlayersList = (playersData) => {
      console.log('👥 [useGameState] Players list received:', playersData);
      if (playersData && Array.isArray(playersData)) {
        updateGameState({ players: playersData });
      }
    };

    // Слушаем обновление данных комнаты
    const handleRoomData = (roomData) => {
      console.log('🏠 [useGameState] Room data updated:', roomData);
      if (roomData.players && Array.isArray(roomData.players)) {
        updateGameState({ players: roomData.players });
      }
    };

    // Слушаем запуск игры
    const handleGameStarted = (gameData) => {
      console.log('🚀 [useGameState] Game started event received:', gameData);
      if (gameData.players && Array.isArray(gameData.players)) {
        updateGameState({ players: gameData.players });
      }
    };

    // Слушаем начало определения очередности
    const handleOrderDeterminationStarted = (orderData) => {
      console.log('🎯 [useGameState] Order determination started:', orderData);
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
      console.log('🎮 [useGameState] Cleaning up game event listeners');
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
    console.log('🔄 [useGameState] Обновляем состояние игры:', updates);
    console.log('🔄 [useGameState] Тип updates:', typeof updates);
    
    setGameState(prev => {
      let newState;
      
      if (typeof updates === 'function') {
        // Если updates - это функция, вызываем её с предыдущим состоянием
        newState = updates(prev);
        console.log('🔄 [useGameState] Функция updates выполнена, новое состояние:', newState);
      } else {
        // Если updates - это объект, объединяем с предыдущим состоянием
        newState = { ...prev, ...updates };
        console.log('🔄 [useGameState] Объект updates применен, новое состояние:', newState);
      }
      
      // Проверяем тип players в новом состоянии
      console.log('🔄 [useGameState] Новое состояние.players type:', typeof newState.players);
      console.log('🔄 [useGameState] Новое состояние.players isArray:', Array.isArray(newState.players));
      console.log('🔄 [useGameState] Новое состояние.players length:', newState.players?.length);
      
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
