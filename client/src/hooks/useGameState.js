import { useState, useEffect, useCallback } from 'react';
import socket from '../socket';

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
    setGameState(prev => ({ ...prev, ...updates }));
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
    return gameState.players.find(p => p.id === gameState.myId);
  }, [gameState.players, gameState.myId]);

  // Получение игрока по ID
  const getPlayerById = useCallback((playerId) => {
    return gameState.players.find(p => p.id === playerId);
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
    return gameState.players.length;
  }, [gameState.players]);

  // Получение готовых игроков
  const getReadyPlayers = useCallback(() => {
    return gameState.players.filter(p => p.ready);
  }, [gameState.players]);

  // Получение игроков в комнате
  const getPlayersInRoom = useCallback((roomId) => {
    return gameState.players.filter(p => p.roomId === roomId);
  }, [gameState.players]);

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
    getPlayersInRoom
  };
};
