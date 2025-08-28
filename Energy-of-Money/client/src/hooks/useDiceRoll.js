import { useState, useCallback } from 'react';
import socket from '../socket';

// Хук для управления броском кубика
export const useDiceRoll = (roomId, playerId) => {
  const [isRolling, setIsRolling] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [rollType, setRollType] = useState(null); // 'order', 'tieBreak', 'game'

  // Бросок кубика для определения очередности
  const rollDiceForOrder = useCallback(async () => {
    if (isRolling) return null;
    
    setIsRolling(true);
    setRollType('order');
    
    return new Promise((resolve) => {
      // Слушаем результат от сервера
      const handleOrderRoll = (data) => {
        if (data.playerId === playerId) {
          socket.off('orderDeterminationRoll', handleOrderRoll);
          setLastResult(data.diceRoll);
          setIsRolling(false);
          resolve(data.diceRoll);
        }
      };
      
      socket.on('orderDeterminationRoll', handleOrderRoll);
      
      // Отправляем запрос на бросок
      socket.emit('rollDiceForOrder', roomId, playerId);
      
      // Таймаут на случай, если сервер не ответит
      setTimeout(() => {
        socket.off('orderDeterminationRoll', handleOrderRoll);
        setIsRolling(false);
        resolve(null);
      }, 10000);
    });
  }, [roomId, playerId, isRolling]);

  // Бросок кубика для переигровки
  const rollDiceForTieBreak = useCallback(async () => {
    if (isRolling) return null;
    
    setIsRolling(true);
    setRollType('tieBreak');
    
    return new Promise((resolve) => {
      // Слушаем результат от сервера
      const handleTieBreakRoll = (data) => {
        if (data.playerId === playerId) {
          socket.off('orderDeterminationTieBreakRoll', handleTieBreakRoll);
          setLastResult(data.diceRoll);
          setIsRolling(false);
          resolve(data.diceRoll);
        }
      };
      
      socket.on('orderDeterminationTieBreakRoll', handleTieBreakRoll);
      
      // Отправляем запрос на бросок
      socket.emit('rollDiceForTieBreak', roomId, playerId);
      
      // Таймаут на случай, если сервер не ответит
      setTimeout(() => {
        socket.off('orderDeterminationTieBreakRoll', handleTieBreakRoll);
        setIsRolling(false);
        resolve(null);
      }, 10000);
    });
  }, [roomId, playerId, isRolling]);

  // Бросок кубика во время игры
  const rollDiceForGame = useCallback(async () => {
    if (isRolling) return null;
    
    setIsRolling(true);
    setRollType('game');
    
    return new Promise((resolve) => {
      // Слушаем результат от сервера
      const handleGameRoll = (data) => {
        if (data.playerId === playerId) {
          socket.off('gameDiceRoll', handleGameRoll);
          setLastResult(data.diceRoll);
          setIsRolling(false);
          resolve(data.diceRoll);
        }
      };
      
      socket.on('gameDiceRoll', handleGameRoll);
      
      // Отправляем запрос на бросок
      socket.emit('rollDice', roomId, playerId);
      
      // Таймаут на случай, если сервер не ответит
      setTimeout(() => {
        socket.off('gameDiceRoll', handleGameRoll);
        setIsRolling(false);
        resolve(null);
      }, 10000);
    });
  }, [roomId, playerId, isRolling]);

  // Универсальный бросок кубика
  const rollDice = useCallback(async (type = 'game') => {
    switch (type) {
      case 'order':
        return rollDiceForOrder();
      case 'tieBreak':
        return rollDiceForTieBreak();
      case 'game':
      default:
        return rollDiceForGame();
    }
  }, [rollDiceForOrder, rollDiceForTieBreak, rollDiceForGame]);

  // Сброс состояния
  const resetDice = useCallback(() => {
    setIsRolling(false);
    setLastResult(null);
    setRollType(null);
  }, []);

  return {
    isRolling,
    lastResult,
    rollType,
    rollDice,
    rollDiceForOrder,
    rollDiceForTieBreak,
    rollDiceForGame,
    resetDice
  };
};

export default useDiceRoll;

