import { useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:5000/api/ratings';

export const useRatings = () => {
  const [ratings, setRatings] = useState({
    overall: [],
    wealth: [],
    speed: [],
    strategy: [],
    consistency: []
  });
  
  const [roomRatings, setRoomRatings] = useState({});
  const [playerRating, setPlayerRating] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Получение топ игроков по категории
  const fetchTopPlayers = useCallback(async (category = 'overall', limit = 10) => {
    setLoading(true);
    setError(null);
    
    try {
      let url = `${API_BASE}/overall`;
      if (category !== 'overall') {
        url = `${API_BASE}/category/${category}`;
      }
      url += `?limit=${limit}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      setRatings(prev => ({
        ...prev,
        [category]: data
      }));
      
      return data;
    } catch (err) {
      console.error(`Error fetching ${category} ratings:`, err);
      setError(`Failed to fetch ${category} ratings: ${err.message}`);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Получение рейтингов комнаты
  const fetchRoomRatings = useCallback(async (roomId, limit = 10) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/room/${roomId}?limit=${limit}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      setRoomRatings(prev => ({
        ...prev,
        [roomId]: data
      }));
      
      return data;
    } catch (err) {
      console.error(`Error fetching room ratings:`, err);
      setError(`Failed to fetch room ratings: ${err.message}`);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Получение рейтинга конкретного игрока
  const fetchPlayerRating = useCallback(async (playerId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/player/${playerId}`);
      if (!response.ok) {
        if (response.status === 404) {
          setPlayerRating(null);
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setPlayerRating(data);
      return data;
    } catch (err) {
      console.error(`Error fetching player rating:`, err);
      setError(`Failed to fetch player rating: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Получение статистики
  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/stats`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setStats(data);
      return data;
    } catch (err) {
      console.error(`Error fetching stats:`, err);
      setError(`Failed to fetch stats: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Обновление рейтинга игрока
  const updatePlayerRating = useCallback(async (playerData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(playerData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Обновляем локальное состояние
      if (data.success) {
        setPlayerRating(data.rating);
        
        // Обновляем общие рейтинги
        await fetchTopPlayers('overall');
        await fetchTopPlayers('wealth');
        await fetchTopPlayers('speed');
        await fetchTopPlayers('strategy');
        await fetchTopPlayers('consistency');
      }
      
      return data;
    } catch (err) {
      console.error(`Error updating player rating:`, err);
      setError(`Failed to update player rating: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchTopPlayers]);

  // Загрузка всех рейтингов
  const loadAllRatings = useCallback(async (limit = 10) => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchTopPlayers('overall', limit),
        fetchTopPlayers('wealth', limit),
        fetchTopPlayers('speed', limit),
        fetchTopPlayers('strategy', limit),
        fetchTopPlayers('consistency', limit),
        fetchStats()
      ]);
    } catch (err) {
      console.error('Error loading all ratings:', err);
      setError('Failed to load ratings');
    } finally {
      setLoading(false);
    }
  }, [fetchTopPlayers, fetchStats]);

  // Получение позиции игрока в рейтинге
  const getPlayerRank = useCallback((playerId, category = 'overall') => {
    const categoryRatings = ratings[category] || [];
    const playerIndex = categoryRatings.findIndex(rating => rating.playerId === playerId);
    
    if (playerIndex === -1) return null;
    
    return {
      rank: playerIndex + 1,
      rating: categoryRatings[playerIndex]
    };
  }, [ratings]);

  // Получение топ-3 игроков по категории
  const getTop3 = useCallback((category = 'overall') => {
    return (ratings[category] || []).slice(0, 3);
  }, [ratings]);

  // Форматирование времени
  const formatTime = useCallback((minutes) => {
    if (!minutes) return 'N/A';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}ч ${mins}м`;
    }
    return `${mins}м`;
  }, []);

  // Форматирование числа с разделителями
  const formatNumber = useCallback((num) => {
    if (num === null || num === undefined) return 'N/A';
    return num.toLocaleString();
  }, []);

  // Форматирование процента побед
  const formatWinRate = useCallback((gamesPlayed, gamesWon) => {
    if (gamesPlayed === 0) return '0%';
    return `${Math.round((gamesWon / gamesPlayed) * 100)}%`;
  }, []);

  return {
    // Состояние
    ratings,
    roomRatings,
    playerRating,
    stats,
    loading,
    error,
    
    // Действия
    fetchTopPlayers,
    fetchRoomRatings,
    fetchPlayerRating,
    updatePlayerRating,
    loadAllRatings,
    
    // Утилиты
    getPlayerRank,
    getTop3,
    formatTime,
    formatNumber,
    formatWinRate
  };
};
