import { useState, useEffect, useCallback } from 'react';

/**
 * Кастомный хук для управления балансом игрока
 * Отвечает за банковский баланс, деньги игрока и синхронизацию между ними
 */
export const usePlayerBalance = (gamePlayers, playerData, socket) => {
  const [bankBalance, setBankBalance] = useState(0);
  const [playerMoney, setPlayerMoney] = useState(0);
  const [bigCircleBalance, setBigCircleBalance] = useState(0);

  // Функция для получения начального баланса
  const getInitialBalance = useCallback(() => {
    // Проверяем, что все необходимые переменные инициализированы
    if (!gamePlayers || !Array.isArray(gamePlayers) || !socket?.id) {
      return 3000; // Возвращаем значение по умолчанию
    }
    
    const currentPlayer = gamePlayers.find(p => p.socketId === socket.id);
    if (currentPlayer?.balance !== undefined && currentPlayer.balance !== null) {
      return Number(currentPlayer.balance);
    }
    
    if (playerData?.profession?.balance !== undefined && playerData.profession.balance !== null) {
      return Number(playerData.profession.balance);
    }
    
    // Начальный баланс из профессии
    const professionBalances = {
      'Врач': 13000,
      'Инженер': 7500,
      'Учитель': 3000,
      'Полицейский': 3000,
      'Предприниматель': 2000,
      'Медсестра': 2000
    };
    
    return professionBalances[playerData?.profession?.name] || 3000;
  }, [gamePlayers, playerData, socket]);

  // Синхронизация банковского баланса с данными игрока
  useEffect(() => {
    const currentPlayer = gamePlayers.find(p => p.socketId === socket?.id);
    let newBalance = 0;

    if (currentPlayer?.balance !== undefined && currentPlayer.balance !== null) {
      newBalance = Number(currentPlayer.balance);
    } else if (playerData?.profession?.balance !== undefined && playerData.profession.balance !== null) {
      newBalance = Number(playerData.profession.balance);
    } else {
      newBalance = getInitialBalance();
    }

    if (newBalance !== bankBalance) {
      console.log('🏦 [usePlayerBalance] Баланс изменен:', {
        previousBalance: bankBalance,
        newBalance: newBalance,
        source: currentPlayer?.balance !== undefined ? 'gamePlayers' : 'profession'
      });
      setBankBalance(newBalance);
    }
  }, [gamePlayers, playerData?.profession?.balance, playerData?.username, socket?.id, getInitialBalance, bankBalance]);

  // Синхронизация bigCircleBalance с bankBalance
  useEffect(() => {
    if (bankBalance !== bigCircleBalance) {
      setBigCircleBalance(bankBalance);
    }
  }, [bankBalance, bigCircleBalance]);

  // Синхронизация playerMoney с bankBalance
  useEffect(() => {
    if (bankBalance !== playerMoney) {
      setPlayerMoney(bankBalance);
    }
  }, [bankBalance, playerMoney]);

  // Функция для обновления баланса
  const updateBalance = useCallback((newBalance) => {
    setBankBalance(newBalance);
    setPlayerMoney(newBalance);
    setBigCircleBalance(newBalance);
  }, []);

  // Функция для добавления денег
  const addMoney = useCallback((amount) => {
    const newBalance = bankBalance + amount;
    updateBalance(newBalance);
    return newBalance;
  }, [bankBalance, updateBalance]);

  // Функция для вычитания денег
  const subtractMoney = useCallback((amount) => {
    const newBalance = Math.max(0, bankBalance - amount);
    updateBalance(newBalance);
    return newBalance;
  }, [bankBalance, updateBalance]);

  // Функция для проверки достаточности средств
  const hasEnoughMoney = useCallback((amount) => {
    return bankBalance >= amount;
  }, [bankBalance]);

  return {
    bankBalance,
    playerMoney,
    bigCircleBalance,
    setBankBalance,
    setPlayerMoney,
    setBigCircleBalance,
    updateBalance,
    addMoney,
    subtractMoney,
    hasEnoughMoney,
    getInitialBalance
  };
};
