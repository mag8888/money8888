import { useState, useEffect, useCallback } from 'react';

/**
 * Кастомный хук для управления игроками в игре
 * Отвечает за состояние игроков, их обновление и синхронизацию с сервером
 */
export const useGamePlayers = (roomId, playerData, socket) => {
  const [gamePlayers, setGamePlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Функция для инициализации данных игрока
  const initializePlayerData = useCallback((player, allPlayers = []) => {
    const existingPlayer = allPlayers.find(p => p.socketId === player.socketId);
    const playerWithColor = {
      ...player,
      color: existingPlayer?.color || assignPlayerColor(player, allPlayers),
      isConnected: player.isConnected !== false,
      assets: player.assets || [],
      liabilities: player.liabilities || [],
      balance: player.balance || 0,
      position: player.position || 0,
      profession: player.profession || null
    };
    return playerWithColor;
  }, []);

  // Функция для получения текущего игрока
  const getCurrentPlayer = useCallback(() => {
    if (gamePlayers.length === 0) return null;
    return gamePlayers[currentPlayer] || gamePlayers[0];
  }, [gamePlayers, currentPlayer]);

  // Функция для получения игрока по индексу
  const getPlayerByIndex = useCallback((index) => {
    if (gamePlayers.length === 0) return null;
    return gamePlayers[index] || gamePlayers[0];
  }, [gamePlayers]);

  // Функция для получения игрока по ID
  const getPlayerById = useCallback((playerId) => {
    return gamePlayers.find(p => p.id === playerId || p.socketId === playerId);
  }, [gamePlayers]);

  // Функция для обновления данных игрока
  const updatePlayer = useCallback((playerId, updatedData) => {
    setGamePlayers(prev => prev.map(player => 
      player.id === playerId || player.socketId === playerId
        ? { ...player, ...updatedData }
        : player
    ));
  }, []);

  // Функция для синхронизации данных с сервером
  const syncPlayerData = useCallback((playerId, updatedData) => {
    if (socket.connected && roomId) {
      socket.emit('playerDataUpdate', roomId, playerId, updatedData);
    }
  }, [roomId, socket]);

  // Загрузка данных игроков из localStorage
  useEffect(() => {
    const savedGamePlayers = localStorage.getItem('potok-deneg_gamePlayers');
    if (savedGamePlayers) {
      try {
        const savedPlayers = JSON.parse(savedGamePlayers);
        setGamePlayers(savedPlayers);
        
        // Находим текущего игрока
        const currentPlayer = savedPlayers.find(p => p.socketId === socket?.id);
        if (currentPlayer) {
          console.log('👤 [useGamePlayers] Текущий игрок:', currentPlayer);
        }
      } catch (e) {
        console.error('❌ [useGamePlayers] Ошибка парсинга gamePlayers:', e);
      }
    }
    setIsLoading(false);
  }, []);

  // Обработчик обновления списка игроков
  useEffect(() => {
    if (!playerData || !socket) return;

    const handlePlayersUpdate = (playersList) => {
      console.log('🔄 [useGamePlayers] handlePlayersUpdate received:', playersList.map(p => ({
        username: p.username,
        balance: p.balance,
        socketId: p.socketId,
        id: p.id,
        userId: p.userId
      })));
      
      // Инициализируем полную структуру для каждого игрока
      const initializedPlayers = playersList.map((player, index) => {
        return initializePlayerData(player, playersList);
      });

      setGamePlayers(prev => {
        // Проверяем, есть ли существенные изменения
        const hasChanges = initializedPlayers.some(newPlayer => {
          const oldPlayer = prev.find(p => p.socketId === newPlayer.socketId);
          if (!oldPlayer) return true; // Новый игрок
          
          return (
            oldPlayer.balance !== newPlayer.balance ||
            oldPlayer.position !== newPlayer.position ||
            oldPlayer.isConnected !== newPlayer.isConnected
          );
        });

        if (hasChanges) {
          console.log('🔄 [useGamePlayers] Обновляем список игроков');
          return initializedPlayers;
        }
        
        return prev;
      });

      // Сохраняем в localStorage
      localStorage.setItem('potok-deneg_gamePlayers', JSON.stringify(initializedPlayers));
    };

    // Подписываемся на события
    socket.on('playersUpdate', handlePlayersUpdate);

    // Запрашиваем данные игроков
    if (roomId) {
      socket.emit('getGamePlayersData', roomId);
    }

    return () => {
      socket.off('playersUpdate', handlePlayersUpdate);
    };
  }, [playerData, roomId, initializePlayerData]);

  return {
    gamePlayers,
    setGamePlayers,
    currentPlayer,
    setCurrentPlayer,
    isLoading,
    getCurrentPlayer,
    getPlayerByIndex,
    getPlayerById,
    updatePlayer,
    syncPlayerData
  };
};

// Функция для назначения цвета игроку (импортируем из существующего файла)
const assignPlayerColor = (player, allPlayers) => {
  // Простая логика назначения цвета
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
  const usedColors = allPlayers.map(p => p.color).filter(Boolean);
  const availableColors = colors.filter(color => !usedColors.includes(color));
  return availableColors[0] || colors[allPlayers.length % colors.length];
};
