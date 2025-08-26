import React, { useState, useEffect } from 'react';
import { useGameNavigation } from '../hooks/useGameState';
import socket from '../socket';
import OrderDetermination from './OrderDetermination';
import { PROFESSIONS } from '../data/professions';

const SimpleRoomSetup = ({ roomId, playerData }) => {
  console.log('🔍 [SimpleRoomSetup] Component props:', { roomId, playerData });
  const [players, setPlayers] = useState([]);
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Состояние для определения очередности
  const [orderDetermination, setOrderDetermination] = useState(null);
  const [orderDeterminationTimer, setOrderDeterminationTimer] = useState(60);
  const [tieBreakTimer, setTieBreakTimer] = useState(30);
  
  // Состояние для готовности игрока
  const [playerReady, setPlayerReady] = useState(false);
  
  // Переменные для отслеживания выбора профессий игроками 1-10
  const [player1HasProfession, setPlayer1HasProfession] = useState(false);
  const [player2HasProfession, setPlayer2HasProfession] = useState(false);
  const [player3HasProfession, setPlayer3HasProfession] = useState(false);
  const [player4HasProfession, setPlayer4HasProfession] = useState(false);
  const [player5HasProfession, setPlayer5HasProfession] = useState(false);
  const [player6HasProfession, setPlayer6HasProfession] = useState(false);
  const [player7HasProfession, setPlayer7HasProfession] = useState(false);
  const [player8HasProfession, setPlayer8HasProfession] = useState(false);
  const [player9HasProfession, setPlayer9HasProfession] = useState(false);
  const [player10HasProfession, setPlayer10HasProfession] = useState(false);

  // Вспомогательные функции для единой логики
  const getCurrentPlayer = () => {
    console.log('🔍 [SimpleRoomSetup] getCurrentPlayer called with:', {
      playerData: playerData,
      players: players.map(p => ({ id: p.id, username: p.username, profession: p.profession }))
    });
    
    // Проверяем, что playerData соответствует текущему пользователю из localStorage
    const savedCurrentUser = localStorage.getItem('potok-deneg_currentUser');
    if (savedCurrentUser) {
      const parsedCurrentUser = JSON.parse(savedCurrentUser);
      console.log('🔍 [SimpleRoomSetup] Checking localStorage currentUser:', parsedCurrentUser);
      
      // Если playerData не соответствует currentUser из localStorage, очищаем localStorage
      if (playerData?.username !== parsedCurrentUser?.username || playerData?.id !== parsedCurrentUser?.id) {
        console.log('⚠️ [SimpleRoomSetup] playerData mismatch with localStorage currentUser:', {
          playerDataUsername: playerData?.username,
          playerDataId: playerData?.id,
          localStorageUsername: parsedCurrentUser?.username,
          localStorageId: parsedCurrentUser?.id
        });
        
        // Очищаем localStorage и перезагружаем страницу
        localStorage.clear();
        console.log('🧹 [SimpleRoomSetup] Cleared localStorage due to mismatch, reloading page');
        window.location.reload();
        return null;
      }
    }
    
    // Сначала ищем по точному совпадению ID
    const currentPlayer = players.find(player => player.id === playerData?.id);
    
    if (currentPlayer) {
      console.log('✅ [SimpleRoomSetup] Found player by ID:', currentPlayer);
      return currentPlayer;
    }
    
    // Если не найден по ID, пробуем найти по username
    const playerByUsername = players.find(player => player.username === playerData?.username);
    if (playerByUsername) {
      console.log('✅ [SimpleRoomSetup] Found player by username:', playerByUsername);
      return playerByUsername;
    }
    
    // Дополнительная проверка: ищем по username из localStorage
    const savedUsername = localStorage.getItem('potok-deneg_username');
    if (savedUsername && savedUsername !== playerData?.username) {
      console.log('⚠️ [SimpleRoomSetup] Username mismatch detected:', {
        playerDataUsername: playerData?.username,
        savedUsername: savedUsername
      });
      
      // Очищаем неправильный username из localStorage
      localStorage.removeItem('potok-deneg_username');
      console.log('🧹 [SimpleRoomSetup] Cleared mismatched username from localStorage');
    }
    
    // Если ничего не найдено, возвращаем null
    console.log('❌ [SimpleRoomSetup] No player found for:', {
      playerDataId: playerData?.id,
      playerDataUsername: playerData?.username,
      availablePlayers: players.map(p => ({ id: p.id, username: p.username }))
    });
    
    return null;
  };

  // Единая функция для получения готовности текущего игрока
  const getCurrentPlayerReady = () => {
    const currentPlayer = getCurrentPlayer();
    return currentPlayer?.ready || false;
  };

  // Единая функция для подсчета готовых игроков
  const getReadyPlayersCount = () => {
    return players.filter(p => p.ready).length;
  };

  // Единая функция для проверки, готовы ли все игроки
  const areAllPlayersReady = () => {
    return players.length > 0 && players.every(p => p.ready);
  };
  
  // Функция для проверки, что профессия действительно выбрана (не null, 'none' и не 'Без профессии')
  const isValidProfession = (profession) => {
    console.log('🔍 [SimpleRoomSetup] isValidProfession called with:', profession);
    
    if (!profession) {
      console.log('❌ [SimpleRoomSetup] No profession (null/undefined)');
      return false;
    }
    if (profession === 'none') {
      console.log('❌ [SimpleRoomSetup] Profession is "none"');
      return false;
    }
    if (typeof profession === 'string' && profession === 'Без профессии') {
      console.log('❌ [SimpleRoomSetup] Profession is "Без профессии" (string)');
      return false;
    }
    if (typeof profession === 'object' && profession.name === 'Без профессии') {
      console.log('❌ [SimpleRoomSetup] Profession is "Без профессии" (object)');
      return false;
    }
    
    console.log('✅ [SimpleRoomSetup] Valid profession:', profession);
    return true;
  };
  const hasProfession = () => {
    const currentPlayer = getCurrentPlayer();
    const result = isValidProfession(currentPlayer?.profession);
    
    console.log('🔍 [SimpleRoomSetup] hasProfession check:', {
      currentPlayer: currentPlayer,
      profession: currentPlayer?.profession,
      result: result,
      playerData: playerData,
      players: players
    });
    
    return result;
  };
  
  // Функция для получения профессии текущего игрока (для отображения)
  const getCurrentPlayerProfession = () => {
    const currentPlayer = getCurrentPlayer();
    if (!currentPlayer) {
      console.log('🔍 [SimpleRoomSetup] getCurrentPlayerProfession: No current player found');
      return null;
    }
    
    console.log('🔍 [SimpleRoomSetup] getCurrentPlayerProfession:', {
      currentPlayer: currentPlayer,
      profession: currentPlayer.profession,
      playerData: playerData
    });
    
    // Проверяем, что это действительно текущий игрок
    if (currentPlayer.username !== playerData?.username) {
      console.log('⚠️ [SimpleRoomSetup] WARNING: Current player username mismatch!', {
        currentPlayerUsername: currentPlayer.username,
        playerDataUsername: playerData?.username
      });
    }
    
    return currentPlayer.profession;
  };
  const getSelectedProfession = () => {
    const currentPlayer = getCurrentPlayer();
    if (!isValidProfession(currentPlayer?.profession)) return null;
    
    // Если profession - это строка, ищем объект профессии
    if (typeof currentPlayer.profession === 'string') {
      return PROFESSIONS.find(p => p.name === currentPlayer.profession) || null;
    }
    
    // Если profession - это объект, возвращаем его
    return currentPlayer.profession;
  };
  const isHost = () => {
    const hostId = roomData?.hostId;
    const playerId = playerData?.id;
    const currentPlayer = getCurrentPlayer();
    const socketId = socket.id;
    
    console.log('👑 [SimpleRoomSetup] isHost check:', { 
      hostId, 
      playerId, 
      currentPlayerId: currentPlayer?.id,
      socketId,
      isHostById: hostId === playerId,
      isHostBySocket: hostId === socketId,
      isHostByCurrentPlayer: hostId === currentPlayer?.id,
      roomData: roomData ? { hostId: roomData.hostId, status: roomData.status } : 'null'
    });
    
    // Проверяем разными способами
    return hostId === playerId || hostId === socketId || hostId === currentPlayer?.id;
  };
  const canStartGame = () => {
    if (!roomData || !players.length) {
      console.log('🎮 [SimpleRoomSetup] canStartGame: No roomData or players');
      return false;
    }
    
    const hostCheck = isHost();
    const allReady = areAllPlayersReady();
    const allHaveProfessions = players.every(player => isValidProfession(player.profession));
    const enoughPlayers = players.length >= 2;
    
    const result = hostCheck && allReady && allHaveProfessions && enoughPlayers;
    
    console.log('🎮 [SimpleRoomSetup] canStartGame check:', {
      roomData: !!roomData,
      playersLength: players.length,
      hostCheck,
      allReady,
      allHaveProfessions,
      enoughPlayers,
      result,
      players: players.map(p => ({ 
        id: p.id, 
        username: p.username,
        ready: p.ready, 
        profession: p.profession ? (typeof p.profession === 'string' ? p.profession : p.profession.name) : 'none'
      }))
    });
    
    return result;
  };

  // Функция для проверки занятости профессии
  const isProfessionTaken = (professionName) => {
    return players.some(player => {
      if (!isValidProfession(player.profession)) return false;
      
      return typeof player.profession === 'string' ? 
        player.profession === professionName : 
        player.profession?.name === professionName;
    });
  };
  
  // Функция для обновления переменных игроков 1-10
  const updatePlayerProfessionVariables = (playersList) => {
    console.log('🔍 [SimpleRoomSetup] Updating player profession variables for:', playersList);
    console.log('🔍 [SimpleRoomSetup] Players list details:', playersList.map(p => ({
      username: p.username,
      profession: p.profession,
      professionType: typeof p.profession,
      professionKeys: p.profession ? Object.keys(p.profession) : 'null'
    })));
    
    // Сбрасываем все переменные
    setPlayer1HasProfession(false);
    setPlayer2HasProfession(false);
    setPlayer3HasProfession(false);
    setPlayer4HasProfession(false);
    setPlayer5HasProfession(false);
    setPlayer6HasProfession(false);
    setPlayer7HasProfession(false);
    setPlayer8HasProfession(false);
    setPlayer9HasProfession(false);
    setPlayer10HasProfession(false);
    
    // Обновляем переменные для каждого игрока
    playersList.forEach((player, index) => {
      const hasProf = isValidProfession(player.profession);
      console.log(`🔍 [SimpleRoomSetup] Player ${index + 1} (${player.username}): hasProfession = ${hasProf}, profession = ${JSON.stringify(player.profession)}`);
      
      switch (index) {
        case 0:
          setPlayer1HasProfession(hasProf);
          console.log(`✅ [SimpleRoomSetup] Set player1HasProfession = ${hasProf}`);
          break;
        case 1:
          setPlayer2HasProfession(hasProf);
          console.log(`✅ [SimpleRoomSetup] Set player2HasProfession = ${hasProf}`);
          break;
        case 2:
          setPlayer3HasProfession(hasProf);
          console.log(`✅ [SimpleRoomSetup] Set player3HasProfession = ${hasProf}`);
          break;
        case 3:
          setPlayer4HasProfession(hasProf);
          console.log(`✅ [SimpleRoomSetup] Set player4HasProfession = ${hasProf}`);
          break;
        case 4:
          setPlayer5HasProfession(hasProf);
          console.log(`✅ [SimpleRoomSetup] Set player5HasProfession = ${hasProf}`);
          break;
        case 5:
          setPlayer6HasProfession(hasProf);
          console.log(`✅ [SimpleRoomSetup] Set player6HasProfession = ${hasProf}`);
          break;
        case 6:
          setPlayer7HasProfession(hasProf);
          console.log(`✅ [SimpleRoomSetup] Set player7HasProfession = ${hasProf}`);
          break;
        case 7:
          setPlayer8HasProfession(hasProf);
          console.log(`✅ [SimpleRoomSetup] Set player8HasProfession = ${hasProf}`);
          break;
        case 8:
          setPlayer9HasProfession(hasProf);
          console.log(`✅ [SimpleRoomSetup] Set player9HasProfession = ${hasProf}`);
          break;
        case 9:
          setPlayer10HasProfession(hasProf);
          console.log(`✅ [SimpleRoomSetup] Set player10HasProfession = ${hasProf}`);
          break;
        default:
          break;
      }
    });
    
    // Дополнительно проверяем текущего игрока
    const currentPlayer = getCurrentPlayer();
    if (currentPlayer) {
      const currentPlayerHasProf = isValidProfession(currentPlayer.profession);
      console.log(`🔍 [SimpleRoomSetup] Current player (${currentPlayer.username}) hasProfession = ${currentPlayerHasProf}`);
    }
  };

  // Используем хук для автоматического перехода на игровое поле
  const { handleGameStarted } = useGameNavigation(socket, roomId, (gameData) => {
    console.log('🎮 [SimpleRoomSetup] Game started callback:', gameData);
    // Обновляем статус комнаты
    setRoomData(prev => ({ ...prev, status: 'started' }));
  });

  // Функция для возврата к списку комнат
  const handleBackToRooms = () => {
    console.log('🚪 [SimpleRoomSetup] Back to rooms clicked');
    // Покидаем комнату
    socket.emit('leaveRoom', roomId);
    // Переходим на страницу выбора комнат
    window.location.href = '/rooms';
  };

  useEffect(() => {
    if (!roomId) return;

    setLoading(true);
    console.log('🔍 [SimpleRoomSetup] Component mounted with roomId:', roomId);

    // Настраиваем игрока при входе в комнату
    if (playerData) {
      console.log('👤 [SimpleRoomSetup] Setting up player:', playerData);
      
      // Очищаем старые данные игрока из localStorage перед настройкой
      localStorage.removeItem('potok-deneg_username');
      console.log('🧹 [SimpleRoomSetup] Cleared old username from localStorage');
      
      socket.emit('setupPlayer', roomId, playerData);
      console.log('👤 [SimpleRoomSetup] setupPlayer emitted');
    } else {
      // Если playerData нет, создаем базовые данные
      const defaultPlayerData = {
        id: Date.now().toString(),
        username: 'Player' + Math.floor(Math.random() * 1000),
        color: '#' + Math.floor(Math.random()*16777215).toString(16)
      };
      console.log('👤 [SimpleRoomSetup] Creating default player data:', defaultPlayerData);
      
      // Очищаем старые данные игрока из localStorage перед настройкой
      localStorage.removeItem('potok-deneg_username');
      console.log('🧹 [SimpleRoomSetup] Cleared old username from localStorage');
      
      socket.emit('setupPlayer', roomId, defaultPlayerData);
      console.log('👤 [SimpleRoomSetup] setupPlayer emitted with default data');
    }

    // Подписываемся на обновления игроков
    socket.on('playersUpdate', (updatedPlayers) => {
      console.log('👥 [SimpleRoomSetup] Players updated:', updatedPlayers);
      console.log('👥 [SimpleRoomSetup] Players update details:', updatedPlayers.map(p => ({
        username: p.username,
        ready: p.ready,
        profession: p.profession ? p.profession.name : 'none'
      })));
      
      setPlayers(updatedPlayers);
      setLoading(false);
      
      // Синхронизируем готовность игрока с серверными данными
      const currentPlayer = updatedPlayers.find(player => player.id === playerData?.id);
      if (currentPlayer) {
        console.log('👥 [SimpleRoomSetup] Current player ready state updated:', currentPlayer.ready);
        setPlayerReady(currentPlayer.ready || false);
      }
      
      // Обновляем переменные игроков 1-10
      updatePlayerProfessionVariables(updatedPlayers);
    });
    
    // Инициализируем переменные игроков при первом получении данных
    if (players.length > 0) {
      updatePlayerProfessionVariables(players);
    }

    // Подписываемся на обновления комнаты
    socket.on('roomUpdated', (updatedRoom) => {
      console.log('🏠 [SimpleRoomSetup] Room updated:', updatedRoom);
      setRoomData(updatedRoom);
    });

    // Подписываемся на возможность начала игры
    socket.on('canStartGame', (gameData) => {
      console.log('🎮 [SimpleRoomSetup] Can start game:', gameData);
      setMessage({ text: '🎉 Достаточно игроков! Можно начинать игру!', type: 'success' });
    });

    // Подписываемся на обновление профессии игрока
    socket.on('playerProfessionUpdated', (data) => {
      console.log('🎯 [SimpleRoomSetup] Player profession updated:', data);
      console.log('🎯 [SimpleRoomSetup] Data details:', {
        roomId: data.roomId,
        playerId: data.playerId,
        profession: data.profession,
        professionType: typeof data.profession,
        professionKeys: data.profession ? Object.keys(data.profession) : 'null'
      });
      if (data.roomId === roomId) {
        console.log('🎯 [SimpleRoomSetup] Requesting updated players list...');
        // Обновляем список игроков
        socket.emit('getPlayers', roomId);
        
        // Также обновляем локальное состояние игрока, если это текущий игрок
        if (data.playerId === playerData?.id || data.playerId === getCurrentPlayer()?.id) {
          console.log('🎯 [SimpleRoomSetup] Updating local player profession state');
          setPlayers(prevPlayers => 
            prevPlayers.map(player => 
              (player.id === data.playerId || player.username === playerData?.username) 
                ? { ...player, profession: data.profession }
                : player
            )
          );
        }
      }
    });

    // Подписываемся на обновление готовности игрока
    socket.on('playerReadyUpdated', (data) => {
      console.log('✅ [SimpleRoomSetup] Player ready updated:', data);
      console.log('✅ [SimpleRoomSetup] Ready update details:', {
        roomId: data.roomId,
        currentRoomId: roomId,
        playerId: data.playerId,
        ready: data.ready,
        currentPlayerId: playerData?.id
      });
      
      if (data.roomId === roomId) {
        console.log('✅ [SimpleRoomSetup] Updating players list after ready change');
        // Обновляем список игроков
        socket.emit('getPlayers', roomId);
        
        // Также обновляем локальное состояние игрока, если это текущий игрок
        if (data.playerId === playerData?.id || data.playerId === getCurrentPlayer()?.id) {
          console.log('✅ [SimpleRoomSetup] Updating local player ready state');
          setPlayers(prevPlayers => 
            prevPlayers.map(player => 
              (player.id === data.playerId || player.username === playerData?.username) 
                ? { ...player, ready: data.ready }
                : player
            )
          );
        }
      }
    });

    // Подписываемся на начало игры
    socket.on('gameStarted', (gameData) => {
      console.log('🎮 [SimpleRoomSetup] Game started event received:', gameData);
      console.log('🎮 [SimpleRoomSetup] Current roomId:', roomId);
      
      setMessage({ text: '🎉 Игра началась! Переходим к игровой доске...', type: 'success' });
      
      // Обновляем статус комнаты
      setRoomData(prev => ({ ...prev, status: 'started' }));
      
      // Навигация теперь происходит автоматически через хук useGameState
      console.log('🚀 [SimpleRoomSetup] Navigation will be handled by useGameState hook');
    });

    // Подписываемся на обновление данных комнаты
    socket.on('roomData', (roomData) => {
      console.log('🏠 [SimpleRoomSetup] Room data updated:', roomData);
      setRoomData(roomData);
    });

    // Подписываемся на обновление списка игроков
    socket.on('playersList', (playersList) => {
      console.log('👥 [SimpleRoomSetup] Players list updated:', playersList);
      setPlayers(playersList);
      
      // Обновляем переменные игроков 1-10
      updatePlayerProfessionVariables(playersList);
    });

    // Подписываемся на изменение хода
    socket.on('turnChanged', (currentTurn) => {
      console.log('🎯 [SimpleRoomSetup] Turn changed to:', currentTurn);
    });

    // Подписываемся на обновление таймера
    socket.on('timerUpdate', (remainingTime) => {
      console.log('⏰ [SimpleRoomSetup] Timer update:', remainingTime);
    });

    // Подписываемся на начало определения очередности
    socket.on('orderDeterminationStarted', (data) => {
      console.log('🎲 [SimpleRoomSetup] Order determination started:', data);
      console.log('🎲 [SimpleRoomSetup] Setting orderDetermination state...');
      setOrderDetermination(data);
      setOrderDeterminationTimer(data.timer);
      console.log('🎲 [SimpleRoomSetup] State updated, orderDetermination should be visible now');
    });

    // Подписываемся на обновление таймера определения очередности
    socket.on('orderDeterminationTimerUpdate', (data) => {
      console.log('⏰ [SimpleRoomSetup] Order determination timer update:', data);
      if (data.roomId === roomId) {
        setOrderDeterminationTimer(data.remainingTime);
      }
    });

    // Подписываемся на завершение определения очередности
    socket.on('orderDeterminationCompleted', (data) => {
      console.log('✅ [SimpleRoomSetup] Order determination completed:', data);
      if (data.roomId === roomId) {
        setOrderDetermination(null);
        setMessage({ text: '🎯 Очередность определена! Игра начинается...', type: 'success' });
      }
    });

    // Подписываемся на начало тай-брейка
    socket.on('tieBreakStarted', (data) => {
      console.log('🎲 [SimpleRoomSetup] Tie break started:', data);
      if (data.roomId === roomId) {
        setTieBreakTimer(data.timer);
        setMessage({ text: '🎲 Начинается тай-брейк для определения очередности!', type: 'info' });
      }
    });

    // Подписываемся на обновление таймера тай-брейка
    socket.on('tieBreakTimerUpdate', (data) => {
      console.log('⏰ [SimpleRoomSetup] Tie break timer update:', data);
      if (data.roomId === roomId) {
        setTieBreakTimer(data.remainingTime);
      }
    });

    // Подписываемся на завершение тай-брейка
    socket.on('tieBreakCompleted', (data) => {
      console.log('✅ [SimpleRoomSetup] Tie break completed:', data);
      if (data.roomId === roomId) {
        setTieBreakTimer(30);
        setMessage({ text: '🎯 Тай-брейк завершен! Очередность определена!', type: 'success' });
      }
    });

    // Запрашиваем текущие данные
    socket.emit('getPlayers', roomId);
    socket.emit('getRoom', roomId);

    return () => {
      socket.off('playersUpdate');
      socket.off('roomUpdated');
      socket.off('canStartGame');
      socket.off('playerProfessionUpdated');
      socket.off('playerReadyUpdated');
      socket.off('gameStarted');
      socket.off('roomData');
      socket.off('playersList');
      socket.off('turnChanged');
      socket.off('timerUpdate');
      socket.off('orderDeterminationStarted');
      socket.off('orderDeterminationTimerUpdate');
      socket.off('orderDeterminationCompleted');
      socket.off('tieBreakStarted');
      socket.off('tieBreakTimerUpdate');
      socket.off('tieBreakCompleted');
    };
  }, [roomId]);

  // Функция для начала игры
  const startGame = () => {
    if (!canStartGame()) {
      setMessage({ text: '❌ Нельзя начать игру. Проверьте условия.', type: 'error' });
      return;
    }
    
    console.log('🎮 [SimpleRoomSetup] Starting game for room:', roomId);
    socket.emit('startGame', roomId);
    setMessage({ text: '🚀 Запускаем игру...', type: 'info' });
  };

  // Функция для выбора профессии
  const handleProfessionSelect = (profession) => {
    console.log('🎯 [SimpleRoomSetup] handleProfessionSelect called with:', profession);
    
    // Отправляем выбор профессии на сервер
    console.log('🎯 [SimpleRoomSetup] Emitting setPlayerProfession:', roomId, profession.name);
    socket.emit('setPlayerProfession', roomId, profession.name);
    
    setMessage({ text: `✅ Профессия "${profession.name}" выбрана!`, type: 'success' });
    console.log('🎯 [SimpleRoomSetup] Success message set');
  };

  // Функция для установки готовности
  const handleSetReady = (ready) => {
    console.log('🎯 [SimpleRoomSetup] handleSetReady called with:', ready);
    console.log('🎯 [SimpleRoomSetup] Current state:', {
      roomId: roomId,
      hasProfession: hasProfession(),
      currentPlayerReady: getCurrentPlayerReady(),
      socket: socket?.connected
    });
    
    if (ready && !hasProfession()) {
      console.log('❌ [SimpleRoomSetup] Cannot set ready - no profession selected');
      setMessage({ 
        text: '❌ Сначала выберите профессию! Нельзя быть готовым без профессии.', 
        type: 'error' 
      });
      return;
    }
    
    console.log('🎯 [SimpleRoomSetup] Sending setReady to server:', { roomId, ready });
    
    // Отправляем готовность на сервер
    socket.emit('setReady', roomId, ready);
    
    if (ready) {
      console.log('✅ [SimpleRoomSetup] Ready message set');
      setMessage({ text: '✅ Вы готовы к игре! Теперь ждите других игроков.', type: 'success' });
    } else {
      console.log('⏸️ [SimpleRoomSetup] Not ready message set');
      setMessage({ text: '⏸️ Вы не готовы к игре. Выберите готовность когда будете готовы.', type: 'info' });
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(to bottom, #0f0c29, #302b63, #24243e)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>🔄 Загрузка...</div>
          <div>Подключение к комнате {roomId}</div>
        </div>
      </div>
    );
  }

  // Если идет определение очередности, показываем соответствующий компонент
  if (orderDetermination) {
    return (
      <OrderDetermination 
        roomId={roomId}
        players={players}
        timer={orderDeterminationTimer}
        socket={socket}
        phase={orderDetermination.phase}
        onRollDice={(roomId, playerId) => {
          console.log('🎲 [SimpleRoomSetup] Rolling dice for order determination:', { roomId, playerId });
          socket.emit('rollDiceForOrder', { roomId, playerId });
        }}
        onTieBreakRoll={(roomId, playerId) => {
          console.log('🎲 [SimpleRoomSetup] Rolling dice for tie break:', { roomId, playerId });
          socket.emit('rollDiceForTieBreak', { roomId, playerId });
        }}
        onComplete={() => setOrderDetermination(null)}
      />
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #0f0c29, #302b63, #24243e)',
      color: 'white',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Заголовок */}
        <div style={{ textAlign: 'center', marginBottom: '30px', position: 'relative' }}>
          {/* Кнопка "Назад" */}
          <button
            onClick={handleBackToRooms}
            style={{
              position: 'absolute',
              left: '0',
              top: '50%',
              transform: 'translateY(-50%)',
              padding: '12px 20px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '25px',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
              e.target.style.transform = 'translateY(-50%) scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              e.target.style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            ← Назад к комнатам
          </button>
          
          <h1 style={{ 
            fontSize: '2.5rem', 
            margin: '0 0 10px 0',
            background: 'linear-gradient(45deg, #FFD700, #FFA500)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            🎮 Настройка комнаты
          </h1>
          <div style={{ fontSize: '1.2rem', opacity: 0.8 }}>
            Комната: <strong>{roomId}</strong>
          </div>
        </div>

        {/* Сообщения */}
        {message.text && (
          <div style={{ 
            padding: '15px', 
            margin: '20px 0',
            borderRadius: '8px',
            backgroundColor: message.type === 'error' ? 'rgba(244, 67, 54, 0.2)' : 
                           message.type === 'success' ? 'rgba(76, 175, 80, 0.2)' : 
                           'rgba(33, 150, 243, 0.2)',
            border: `1px solid ${message.type === 'error' ? '#f44336' : 
                                message.type === 'success' ? '#4caf50' : '#2196f3'}`,
            textAlign: 'center'
          }}>
            {message.text}
          </div>
        )}

        {/* Информация о комнате */}
        {roomData && (
          <div style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.1)', 
            padding: '20px', 
            borderRadius: '12px',
            marginBottom: '30px'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#FFD700' }}>📊 Статус комнаты</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div>
                <strong>Статус:</strong> 
                <span style={{ 
                  color: roomData.status === 'waiting' ? '#FFD700' : 
                         roomData.status === 'started' ? '#4CAF50' : '#FF9800',
                  marginLeft: '8px'
                }}>
                  {roomData.status === 'waiting' ? '⏳ Ожидание' : 
                   roomData.status === 'started' ? '🎮 Игра идет' : '❓ Неизвестно'}
                </span>
              </div>
              <div>
                <strong>Игроков:</strong> {players.length}/{roomData.maxPlayers || 6}
              </div>
              <div>
                <strong>Хост:</strong> {roomData.hostId === playerData?.id ? 'Вы' : 'Другой игрок'}
              </div>
            </div>
          </div>
        )}

        {/* Список игроков */}
        <div style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.1)', 
          padding: '20px', 
          borderRadius: '12px',
          marginBottom: '30px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#FFD700' }}>👥 Игроки в комнате</h3>
          <div style={{ display: 'grid', gap: '10px' }}>
            {players.map((player, index) => (
              <div key={player.id} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '15px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                border: player.id === playerData?.id ? '2px solid #FFD700' : '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.2rem' }}>👤</span>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>
                      {player.username} {player.id === playerData?.id && '(Вы)'}
                    </div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                      {player.profession && player.profession !== 'none' ? 
                        `Профессия: ${typeof player.profession === 'string' ? player.profession : player.profession?.name || 'Неизвестно'}` : 
                        'Профессия не выбрана'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {player.ready ? (
                    <span style={{ color: '#4CAF50', fontSize: '1.2rem' }}>✅</span>
                  ) : (
                    <span style={{ color: '#FF9800', fontSize: '1.2rem' }}>⏸️</span>
                  )}
                  {player.id === roomData?.hostId && (
                    <span style={{ color: '#FFD700', fontSize: '1.2rem' }}>👑</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Действия игрока */}
        <div style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.1)', 
          padding: '20px', 
          borderRadius: '12px',
          marginBottom: '30px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#FFD700' }}>🎯 Ваши действия</h3>
          
          {/* Сообщение о выбранной профессии */}
          {hasProfession() && (
            <div style={{ 
              marginBottom: '20px',
              padding: '15px',
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              borderRadius: '12px',
              border: '2px solid rgba(76, 175, 80, 0.3)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#4CAF50', marginBottom: '10px' }}>
                ✅ Профессия выбрана: {getCurrentPlayerProfession()?.name || getSelectedProfession()?.name || 'Неизвестно'}
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                Теперь установите готовность к игре
              </div>
            </div>
          )}

          {/* Модуль готовности игрока */}
          {hasProfession() && (
            <div style={{ 
              marginBottom: '20px',
              padding: '15px',
              backgroundColor: getCurrentPlayerReady() ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0.1)',
              borderRadius: '12px',
              border: `2px solid ${getCurrentPlayerReady() ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 152, 0, 0.3)'}`,
              textAlign: 'center'
            }}>
              <div style={{ 
                fontSize: '1.1rem', 
                fontWeight: 'bold', 
                color: getCurrentPlayerReady() ? '#4CAF50' : '#FF9800', 
                marginBottom: '10px' 
              }}>
                {getCurrentPlayerReady() ? '✅ Вы готовы к игре!' : '⏸️ Вы не готовы к игре'}
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                {getCurrentPlayerReady() 
                  ? 'Отлично! Теперь ждите, когда другие игроки тоже будут готовы'
                  : 'Нажмите кнопку "Готов к игре" когда будете готовы начать'
                }
              </div>
                    {/* Отладочная информация */}
      <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '10px' }}>
        🔍 Отладка: {getCurrentPlayer()?.username} | Профессия: {getCurrentPlayer()?.profession?.name || 'Нет'}
        <br />
        🏠 RoomData: {roomData ? `hostId: ${roomData.hostId}, status: ${roomData.status}` : 'null'}
        <br />
        👑 Host Check: {isHost() ? '✅ Да' : '❌ Нет'} | Can Start: {canStartGame() ? '✅ Да' : '❌ Нет'}
        <br />
        🎯 Профессия детально: {JSON.stringify(getCurrentPlayer()?.profession)}
        <br />
        🔍 hasProfession(): {hasProfession() ? 'true' : 'false'}
        <br />
        <button 
          onClick={() => {
            localStorage.removeItem('potok-deneg_username');
            console.log('🧹 [SimpleRoomSetup] Manually cleared username from localStorage');
            window.location.reload();
          }}
          style={{ 
            fontSize: '0.7rem', 
            padding: '2px 6px', 
            marginLeft: '10px',
            backgroundColor: '#ff4444',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Очистить localStorage
        </button>
      </div>
            </div>
          )}
          
          {/* Кнопка отладки - показать все профессии */}
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <button
                              onClick={() => {
                  console.log('🔍 [SimpleRoomSetup] Debug: Showing all professions');
                  // Сбрасываем профессию для отладки через сервер
                  socket.emit('setPlayerProfession', roomId, 'none');
                }}
              style={{
                padding: '8px 16px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '20px',
                fontSize: '12px',
                cursor: 'pointer',
                opacity: 0.7
              }}
            >
              🔍 Сбросить профессию (отладка)
            </button>
          </div>





          {/* Установка готовности */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '10px' }}>
              <strong>2️⃣ Установите готовность:</strong>
            </div>
            
            {/* Предупреждение если нет профессии */}
            {!hasProfession() && (
              <div style={{ 
                padding: '15px',
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(244, 67, 54, 0.3)',
                textAlign: 'center',
                marginBottom: '15px'
              }}>
                <div style={{ 
                  fontSize: '1rem', 
                  color: '#f44336', 
                  fontWeight: 'bold',
                  marginBottom: '8px'
                }}>
                  ⚠️ Сначала выберите профессию!
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                  Нельзя установить готовность без выбранной профессии
                </div>
              </div>
            )}
            
            {/* Кнопки готовности всегда видны */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => handleSetReady(true)}
                disabled={!hasProfession()}
                style={{
                  padding: '12px 24px',
                  backgroundColor: !hasProfession() ? '#666' : (getCurrentPlayerReady() ? '#66BB6A' : '#4CAF50'),
                  color: 'white',
                  border: !hasProfession() ? 'none' : (getCurrentPlayerReady() ? '2px solid #4CAF50' : 'none'),
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: !hasProfession() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  transform: !hasProfession() ? 'scale(1)' : (getCurrentPlayerReady() ? 'scale(1.05)' : 'scale(1)'),
                  boxShadow: !hasProfession() ? 'none' : (getCurrentPlayerReady() ? '0 4px 15px rgba(76, 175, 80, 0.3)' : 'none'),
                  opacity: !hasProfession() ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!hasProfession()) return;
                  if (!getCurrentPlayerReady()) {
                    e.target.style.backgroundColor = '#66BB6A';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!hasProfession()) return;
                  if (!getCurrentPlayerReady()) {
                    e.target.style.backgroundColor = '#4CAF50';
                  }
                }}
              >
                {!hasProfession() ? '❌ Нет профессии' : (getCurrentPlayerReady() ? '✅ ГОТОВ!' : '✅ Готов к игре')}
              </button>
              <button 
                onClick={() => handleSetReady(false)}
                disabled={!hasProfession()}
                style={{
                  padding: '12px 24px',
                  backgroundColor: !hasProfession() ? '#666' : (!getCurrentPlayerReady() ? '#FFB74D' : '#FF9800'),
                  color: 'white',
                  border: !hasProfession() ? 'none' : (!getCurrentPlayerReady() ? '2px solid #FF9800' : 'none'),
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: !hasProfession() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  transform: !hasProfession() ? 'scale(1)' : (!getCurrentPlayerReady() ? 'scale(1.05)' : 'scale(1)'),
                  boxShadow: !hasProfession() ? 'none' : (!getCurrentPlayerReady() ? '0 4px 15px rgba(255, 152, 0, 0.3)' : 'none'),
                  opacity: !hasProfession() ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!hasProfession()) return;
                  if (getCurrentPlayerReady()) {
                    e.target.style.backgroundColor = '#FFB74D';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!hasProfession()) return;
                  if (getCurrentPlayerReady()) {
                    e.target.style.backgroundColor = '#FF9800';
                  }
                }}
              >
                {!hasProfession() ? '❌ Нет профессии' : (!getCurrentPlayerReady() ? '⏸️ НЕ ГОТОВ!' : '⏸️ Не готов')}
              </button>
            </div>
          </div>

          {/* Кнопка начала игры для всех игроков */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '10px' }}>
              <strong>3️⃣ Статус игры:</strong>
            </div>
            
            {/* Кнопка старта для хоста */}
            {(() => {
              const hostCheck = isHost();
              const canStart = canStartGame();
              console.log('🎮 [SimpleRoomSetup] Start button render check:', { 
                hostCheck, 
                canStart,
                roomData: roomData ? { hostId: roomData.hostId, status: roomData.status } : 'null', 
                playerData: playerData ? { id: playerData.id, username: playerData.username } : 'null',
                playersCount: players.length,
                readyCount: getReadyPlayersCount(),
                allHaveProfessions: players.every(p => isValidProfession(p.profession))
              });
              
              if (hostCheck) {
                console.log('✅ [SimpleRoomSetup] Showing start button for host');
                return true;
              } else {
                console.log('❌ [SimpleRoomSetup] Not showing start button - not host');
                console.log('🔍 [SimpleRoomSetup] Host check details:', {
                  roomDataHostId: roomData?.hostId,
                  playerDataId: playerData?.id,
                  playerDataUsername: playerData?.username,
                  socketId: socket?.id
                });
                
                // Проверяем, может ли игрок быть хостом по другим критериям
                console.log('🔧 [SimpleRoomSetup] Checking alternative host criteria');
                return false;
              }
            })() ? (
              <div>
                <button 
                  onClick={startGame}
                  disabled={!canStartGame()}
                  style={{
                    padding: '15px 30px',
                    backgroundColor: canStartGame() ? '#FFD700' : '#666',
                    color: canStartGame() ? 'black' : '#999',
                    border: canStartGame() ? '2px solid #FFA000' : 'none',
                    borderRadius: '8px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    cursor: canStartGame() ? 'pointer' : 'not-allowed',
                    transition: 'all 0.3s ease',
                    opacity: canStartGame() ? 1 : 0.6,
                    transform: canStartGame() ? 'scale(1)' : 'scale(0.98)'
                  }}
                  onMouseEnter={(e) => {
                    if (canStartGame()) {
                      e.target.style.backgroundColor = '#FFED4E';
                      e.target.style.transform = 'scale(1.05)';
                      e.target.style.boxShadow = '0 8px 25px rgba(255, 215, 0, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (canStartGame()) {
                      e.target.style.backgroundColor = '#FFD700';
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                >
                  {canStartGame() ? '🚀 СТАРТ ИГРЫ!' : '⏳ Ожидание готовности...'}
                </button>
                
                {/* Информация о требованиях для старта */}
                <div style={{ 
                  marginTop: '15px', 
                  padding: '15px',
                  backgroundColor: canStartGame() ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                  borderRadius: '8px',
                  border: `1px solid ${canStartGame() ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 152, 0, 0.3)'}`,
                  fontSize: '0.9rem'
                }}>
                  <div style={{ 
                    fontWeight: 'bold', 
                    color: canStartGame() ? '#4CAF50' : '#FF9800',
                    marginBottom: '8px'
                  }}>
                    {canStartGame() ? '✅ Все условия выполнены!' : '📋 Требования для старта:'}
                  </div>
                  
                  {canStartGame() ? (
                    <div style={{ color: '#4CAF50' }}>
                      🎉 Игра готова к запуску! Нажмите "СТАРТ ИГРЫ"
                    </div>
                  ) : (
                    <>
                      <div style={{ marginBottom: '10px', fontSize: '0.8rem', color: '#999' }}>
                        🔍 Отладка: {isHost() ? '✅ Вы хост' : '❌ Вы не хост'} | 
                        Игроков: {players.length} | 
                        Готовы: {getReadyPlayersCount()} | 
                        С профессиями: {players.filter(p => isValidProfession(p.profession)).length}
                      </div>
                      <div style={{ marginBottom: '10px', fontSize: '0.8rem', color: '#999' }}>
                        🔍 Ваша профессия: {getCurrentPlayer()?.profession ? 
                          (typeof getCurrentPlayer().profession === 'string' ? 
                            getCurrentPlayer().profession : 
                            getCurrentPlayer().profession?.name || 'Неизвестно'
                          ) : 'Нет профессии'} | 
                        hasProfession(): {hasProfession() ? 'true' : 'false'}
                      </div>
                      <div style={{ marginBottom: '10px', fontSize: '0.8rem', color: '#999' }}>
                        🔍 Переменные игроков: 
                        P1:{player1HasProfession ? '✅' : '❌'} 
                        P2:{player2HasProfession ? '✅' : '❌'} 
                        P3:{player3HasProfession ? '✅' : '❌'} 
                        P4:{player4HasProfession ? '✅' : '❌'} 
                        P5:{player5HasProfession ? '✅' : '❌'} 
                        P6:{player6HasProfession ? '✅' : '❌'} 
                        P7:{player7HasProfession ? '✅' : '❌'} 
                        P8:{player8HasProfession ? '✅' : '❌'} 
                        P9:{player9HasProfession ? '✅' : '❌'} 
                        P10:{player10HasProfession ? '✅' : '❌'}
                      </div>
                      <ul style={{ margin: '5px 0', paddingLeft: '20px', color: '#FF9800' }}>
                        <li style={{ marginBottom: '5px' }}>
                                                  <span style={{ 
                          color: players.every(p => isValidProfession(p.profession)) ? '#4CAF50' : '#FF9800' 
                        }}>
                          {players.every(p => isValidProfession(p.profession)) ? '✅' : '⏳'} 
                          Профессии выбраны: {players.filter(p => isValidProfession(p.profession)).length}/{players.length}
                        </span>
                        </li>
                        <li style={{ marginBottom: '5px' }}>
                          <span style={{ 
                            color: players.every(p => p.ready) ? '#4CAF50' : '#FF9800' 
                          }}>
                                            {areAllPlayersReady() ? '✅' : '⏳'}
                Игроки готовы: {getReadyPlayersCount()}/{players.length}
                          </span>
                        </li>
                        <li style={{ marginBottom: '5px' }}>
                          <span style={{ 
                            color: players.length >= 2 ? '#4CAF50' : '#FF9800' 
                          }}>
                            {players.length >= 2 ? '✅' : '⏳'} 
                            Минимум игроков: {players.length}/2
                          </span>
                        </li>
                      </ul>
                    </>
                  )}
                </div>
              </div>
            ) : (
              /* Информация для обычных игроков */
              <div style={{ 
                padding: '15px',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(33, 150, 243, 0.3)',
                textAlign: 'center'
              }}>
                <div style={{ 
                  fontSize: '1.1rem', 
                  color: '#2196F3', 
                  marginBottom: '10px',
                  fontWeight: 'bold'
                }}>
                  👑 Ожидание хоста
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                  Хост {players.find(p => p.id === roomData?.hostId)?.username || 'неизвестен'} запустит игру когда все будут готовы
                </div>
                
                {/* Прогресс готовности */}
                <div style={{ 
                  marginTop: '15px',
                  padding: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '6px'
                }}>
                  <div style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
                    📊 Прогресс готовности:
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-around',
                    fontSize: '0.8rem'
                  }}>
                    <div>
                      <span style={{ color: '#4CAF50' }}>✅</span> Готовы: {getReadyPlayersCount()}
                    </div>
                    <div>
                      <span style={{ color: '#FF9800' }}>⏳</span> Всего: {players.length}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Информация о профессии */}
        {getSelectedProfession() && (
          <div style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.1)', 
            padding: '20px', 
            borderRadius: '12px',
            marginBottom: '30px'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#FFD700' }}>💼 Ваша профессия</h3>
            <div style={{ 
              padding: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              border: '2px solid #FFD700'
            }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#FFD700' }}>{getSelectedProfession()?.name || 'Неизвестно'}</h4>
              <div style={{ marginBottom: '10px' }}>
                                  <strong>💰 Зарплата:</strong> ${getSelectedProfession()?.salary?.toLocaleString() || 0}
              </div>
              <div style={{ marginBottom: '10px' }}>
                                  <strong>💸 Расходы:</strong> ${getSelectedProfession()?.expenses?.toLocaleString() || 0}
              </div>
              <div style={{ marginBottom: '10px' }}>
                                  <strong>💳 Баланс:</strong> ${getSelectedProfession()?.balance?.toLocaleString() || 0}
              </div>
              <div style={{ marginBottom: '10px' }}>
                                  <strong>📈 Пассивный доход:</strong> ${getSelectedProfession()?.passiveIncome?.toLocaleString() || 0}
              </div>
              <div style={{ marginBottom: '10px' }}>
                                  <strong>📝 Описание:</strong> {getSelectedProfession()?.description || 'Описание отсутствует'}
              </div>
            </div>
          </div>
        )}

        {/* Выбор профессии - в самом низу */}
        <div style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.1)', 
          padding: '20px', 
          borderRadius: '12px',
          marginBottom: '30px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#FFD700' }}>🎯 Выбор профессии</h3>
          
          {/* Проверяем наличие профессии у текущего игрока */}
          {(() => {
            const currentPlayer = getCurrentPlayer();
            if (currentPlayer && currentPlayer.profession && currentPlayer.profession !== 'none') {
              return (
                <div style={{ 
                  padding: '15px',
                  backgroundColor: 'rgba(76, 175, 80, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(76, 175, 80, 0.3)',
                  textAlign: 'center',
                  marginBottom: '20px'
                }}>
                  <div style={{ 
                    fontSize: '1.1rem', 
                    color: '#4CAF50', 
                    fontWeight: 'bold',
                    marginBottom: '8px'
                  }}>
                    ✅ Профессия уже выбрана!
                  </div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                    Ваша профессия: <strong>{getSelectedProfession()?.name || 'Неизвестно'}</strong>
                  </div>
                </div>
              );
            }
            
            return (
              <div style={{ 
                marginBottom: '15px',
                fontSize: '0.9rem',
                opacity: 0.8,
                textAlign: 'center'
              }}>
                Выберите одну из доступных профессий для начала игры
              </div>
            );
          })()}
            
            {/* Плитки профессий */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '15px',
              maxHeight: '400px',
              overflowY: 'auto',
              padding: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px'
            }}>
              {PROFESSIONS.map((profession) => {
                // Используем вспомогательную функцию
                const isTaken = isProfessionTaken(profession.name);
                
                return (
                  <div
                    key={profession.id}
                    onClick={() => !isTaken && handleProfessionSelect(profession)}
                    style={{
                      padding: '20px',
                      backgroundColor: isTaken ? 'rgba(128, 128, 128, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      border: isTaken ? '2px solid rgba(128, 128, 128, 0.5)' : '2px solid rgba(255, 255, 255, 0.1)',
                      cursor: isTaken ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      opacity: isTaken ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!isTaken) {
                        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                        e.target.style.borderColor = 'rgba(255, 215, 0, 0.6)';
                        e.target.style.transform = 'translateY(-5px) scale(1.02)';
                        e.target.style.boxShadow = '0 10px 25px rgba(255, 215, 0, 0.2)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isTaken) {
                        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        e.target.style.transform = 'translateY(0) scale(1)';
                        e.target.style.boxShadow = 'none';
                      }
                    }}
                  >
                    {/* Индикатор занятости */}
                    {isTaken && (
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        padding: '4px 8px',
                        backgroundColor: 'rgba(244, 67, 54, 0.8)',
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        zIndex: 1
                      }}>
                        ❌ ЗАНЯТА
                      </div>
                    )}
                    
                    {/* Индикатор выбора */}
                    {!isTaken && (
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 215, 0, 0.3)',
                        border: '2px solid rgba(255, 215, 0, 0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        color: '#FFD700'
                      }}>
                        👆
                      </div>
                    )}
                    
                    {/* Заголовок профессии */}
                    <div style={{ 
                      textAlign: 'center', 
                      marginBottom: '15px',
                      padding: '10px',
                      backgroundColor: isTaken ? 'rgba(128, 128, 128, 0.2)' : 'rgba(255, 215, 0, 0.1)',
                      borderRadius: '8px',
                      border: `1px solid ${isTaken ? 'rgba(128, 128, 128, 0.4)' : 'rgba(255, 215, 0, 0.3)'}`
                    }}>
                      <h4 style={{ 
                        margin: '0', 
                        color: isTaken ? '#999' : '#FFD700', 
                        fontSize: '1.2rem',
                        fontWeight: 'bold'
                      }}>
                        {profession.name}
                      </h4>
                    </div>
                    
                    {/* Описание */}
                    <div style={{ 
                      marginBottom: '15px',
                      fontSize: '0.9rem',
                      opacity: isTaken ? 0.5 : 0.9,
                      lineHeight: '1.4'
                    }}>
                      {profession.description}
                    </div>
                    
                    {/* Финансовая информация */}
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '10px',
                      marginBottom: '15px'
                    }}>
                      <div style={{ 
                        textAlign: 'center',
                        padding: '8px',
                        backgroundColor: isTaken ? 'rgba(128, 128, 128, 0.2)' : 'rgba(76, 175, 80, 0.2)',
                        borderRadius: '6px',
                        border: `1px solid ${isTaken ? 'rgba(128, 128, 128, 0.4)' : 'rgba(76, 175, 80, 0.4)'}`
                      }}>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>💰 Зарплата</div>
                        <div style={{ 
                          fontSize: '1.1rem', 
                          fontWeight: 'bold', 
                          color: isTaken ? '#999' : '#4CAF50' 
                        }}>
                          ${profession.salary?.toLocaleString() || 0}
                        </div>
                      </div>
                      
                      <div style={{ 
                        textAlign: 'center',
                        padding: '8px',
                        backgroundColor: isTaken ? 'rgba(128, 128, 128, 0.2)' : 'rgba(255, 152, 0, 0.2)',
                        borderRadius: '6px',
                        border: `1px solid ${isTaken ? 'rgba(128, 128, 128, 0.4)' : 'rgba(255, 152, 0, 0.4)'}`
                      }}>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>💸 Расходы</div>
                        <div style={{ 
                          fontSize: '1.1rem', 
                          fontWeight: 'bold', 
                          color: isTaken ? '#999' : '#FF9800' 
                        }}>
                          ${profession.expenses?.toLocaleString() || 0}
                        </div>
                      </div>
                    </div>
                    
                    {/* Баланс */}
                    <div style={{ 
                      textAlign: 'center',
                      padding: '12px',
                      backgroundColor: isTaken ? 'rgba(128, 128, 128, 0.2)' : 'rgba(33, 150, 243, 0.2)',
                      borderRadius: '8px',
                      border: `2px solid ${isTaken ? 'rgba(128, 128, 128, 0.4)' : 'rgba(33, 150, 243, 0.4)'}`
                    }}>
                      <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>💳 Начальный баланс</div>
                      <div style={{ 
                        fontSize: '1.3rem', 
                        fontWeight: 'bold', 
                        color: isTaken ? '#999' : '#2196F3' 
                      }}>
                        ${profession.balance?.toLocaleString() || 0}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div style={{ 
              marginTop: '15px', 
              fontSize: '0.9rem', 
              opacity: 0.7,
              textAlign: 'center',
              fontStyle: 'italic'
            }}>
              💡 Нажмите на любую доступную профессию для выбора
            </div>
          </div>
        </div>

      {/* Кнопка выхода из игры */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: '40px',
        padding: '20px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <button
          onClick={handleBackToRooms}
          style={{
            padding: '15px 30px',
            backgroundColor: 'rgba(244, 67, 54, 0.8)',
            color: 'white',
            border: '2px solid rgba(244, 67, 54, 0.5)',
            borderRadius: '25px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(244, 67, 54, 1)';
            e.target.style.borderColor = 'rgba(244, 67, 54, 0.8)';
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = '0 8px 25px rgba(244, 67, 54, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'rgba(244, 67, 54, 0.8)';
            e.target.style.borderColor = 'rgba(244, 67, 54, 0.5)';
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = 'none';
          }}
        >
          🚪 Выйти из игры
        </button>
        <div style={{ 
          marginTop: '15px', 
          fontSize: '0.9rem', 
          opacity: 0.7,
          fontStyle: 'italic'
        }}>
          Нажмите, чтобы вернуться к списку комнат
        </div>
      </div>
    </div>
  );
};

export default SimpleRoomSetup;
