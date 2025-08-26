import { useState, useCallback, useEffect, useRef } from 'react';
import socket from '../socket';

export const useGameLogic = (roomId, gameState, updateGameState) => {
  const [diceState, setDiceState] = useState({
    isRolling: false,
    displayDice: 0,
    displayD1: 0,
    displayD2: 0,
    lastRoll: 0,
    timerDice: 0 // Значение кубика для отображения в таймере (с задержкой)
  });

  const [turnTimerState, setTurnTimerState] = useState({
    timer: 120,
    isActive: false
  });

  const [gameStartTime, setGameStartTime] = useState(null);
  const [gameStats, setGameStats] = useState({
    dealsCompleted: 0,
    passiveIncome: 0,
    finalNetWorth: 0
  });

  const audioRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Инициализация аудио
  useEffect(() => {
    try {
      audioRef.current = new Audio();
      audioRef.current.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
    } catch (error) {
      console.warn('Audio not supported:', error);
    }
  }, []);

  // Запуск таймера игры
  useEffect(() => {
    if (gameState.isMyTurn && !gameStartTime) {
      setGameStartTime(Date.now());
    }
  }, [gameState.isMyTurn, gameStartTime]);

  // Слушаем серверные события таймера
  useEffect(() => {
    const handleTurnTimerUpdate = (data) => {

      setTurnTimerState({
        timer: data.remaining,
        isActive: data.isActive,
        paused: data.paused || false
      });
      
      // Звуковые уведомления
      if (data.remaining === 10 && audioRef.current && gameState.isMyTurn) {
        try {
          audioRef.current.play().catch(e => console.log('Не удалось воспроизвести звук:', e));
        } catch (error) {
          console.warn('Audio play failed:', error);
        }
      }
    };

    socket.on('turnTimerUpdate', handleTurnTimerUpdate);

    return () => {
      socket.off('turnTimerUpdate', handleTurnTimerUpdate);
    };
  }, [gameState.isMyTurn]);

  // Сброс таймера при изменении хода
  useEffect(() => {
    if (gameState.isMyTurn) {
      setTurnTimerState({ timer: 120, isActive: true });

    } else {
      setTurnTimerState({ timer: 120, isActive: false });

    }
  }, [gameState.isMyTurn, gameState.myId]);

  // Автоматический запуск таймера при инициализации игры
  useEffect(() => {
    if (gameState.players && gameState.players.length > 0) {
      // Убираем лишние логи для уменьшения спама
      // console.log('🎯 [useGameLogic] Проверяем игроков:', {
      //   playersCount: gameState.players.length,
      //   myId: gameState.myId,
      //   currentTurn: gameState.currentTurn,
      //   isMyTurn: gameState.isMyTurn
      // });
      
      // Проверяем, чей сейчас ход
      if (gameState.myId && gameState.currentTurn) {
        const isMyTurn = gameState.currentTurn === gameState.myId;
        // console.log('🎯 [useGameLogic] Проверяем ход:', { 
        //   myId: gameState.myId, 
        //   currentTurn: gameState.currentTurn, 
        //   isMyTurn 
        // });
        
        updateGameState({ 
          isMyTurn,
          turnBanner: isMyTurn ? 'Ваш ход' : 'Ожидание хода'
        });
      }
    }
  }, [gameState.players, gameState.myId, updateGameState]);

  // Бросок кубиков
  const rollDice = useCallback(() => {
    // Убираем лишние логи для уменьшения спама
    // console.log('🎲 [useGameLogic] rollDice вызвана!', {
    //   isRolling: diceState.isRolling,
    //   isMyTurn: gameState.isMyTurn,
    //   myId: gameState.myId,
    //   players: gameState.players?.length || 0,
    //   diceState: diceState,
    //   gameState: {
    //   players: gameState.players?.length || 0,
    //   isMyTurn: gameState.isMyTurn,
    //   currentTurn: gameState.currentTurn
    //   }
    // });

    if (diceState.isRolling) {
      // console.log('❌ [useGameLogic] Кубик уже бросается');
      return;
    }
    
    // Убираем проверку isMyTurn - кубик можно бросать всегда
    // console.log('✅ [useGameLogic] Начинаем бросок кубика...');
    setDiceState(prev => ({ ...prev, isRolling: true }));

    // Получаем текущего игрока для проверки благотворительности
    const currentPlayer = gameState.players?.find(p => p.id === gameState.myId);
    const hasCharity = currentPlayer?.charity || false;

    // Анимация броска
    const rollAnimation = setInterval(() => {
      if (hasCharity) {
        // Анимация для 2 кубиков
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        setDiceState(prev => ({
          ...prev,
          displayD1: d1,
          displayD2: d2,
          displayDice: d1 + d2
        }));
      } else {
        // Анимация для 1 кубика
        const dice = Math.floor(Math.random() * 6) + 1;
        setDiceState(prev => ({
          ...prev,
          displayD1: dice,
          displayD2: 0,
          displayDice: dice
        }));
      }
    }, 100);

    // Останавливаем анимацию через 1 секунду
    const stopAnimationTimer = setTimeout(() => {
      clearInterval(rollAnimation);
      
      // Получаем текущего игрока для проверки благотворительности
      const currentPlayer = gameState.players?.find(p => p.id === gameState.myId);
      const hasCharity = currentPlayer?.charity || false;
      
      // Финальный бросок - если есть благотворительность, то 2 кубика (2-12), иначе 1 кубик (1-6)
      let total;
      if (hasCharity) {
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        total = d1 + d2;
        // console.log('🎲 [useGameLogic] Бросок с благотворительностью (2 кубика):', { d1, d2, total });
      } else {
        total = Math.floor(Math.random() * 6) + 1;
        // console.log('🎲 [useGameLogic] Обычный бросок (1 кубик):', total);
      }
      
      setDiceState(prev => ({
        ...prev,
        isRolling: false,
        displayDice: total,
        displayD1: hasCharity ? Math.floor(total / 2) : total,
        displayD2: hasCharity ? Math.ceil(total / 2) : 0,
        lastRoll: total
      }));

      // Отправляем результат на сервер
      socket.emit('rollDice', roomId, gameState.myId, total);
      
      // Обновляем состояние игры
      updateGameState({ dice: total });

      // Переносим значение кубика в таймер через 2 секунды
      const transferTimer = setTimeout(() => {
        setDiceState(prev => ({
          ...prev,
          timerDice: total
        }));
        // console.log('🎲 [useGameLogic] Перенесли значение кубика в таймер:', total);
      }, 2000);
      
      // Очищаем таймер при размонтировании
      return () => clearTimeout(transferTimer);
    }, 1000);
    
    // Очищаем таймер при размонтировании
    return () => clearTimeout(stopAnimationTimer);
  }, [diceState.isRolling, gameState.isMyTurn, gameState.myId, roomId, updateGameState]);

  // Завершение хода
  const handleEndTurn = useCallback(() => {
    if (!gameState.isMyTurn) return;
    
    // console.log('🔄 [GameLogic] Ending turn for player:', gameState.myId);
    socket.emit('endTurn', roomId, gameState.myId);
    
    // Сбрасываем состояние хода
    updateGameState({ isMyTurn: false });
    setTurnTimerState({ timer: 120, isActive: false });
  }, [gameState.isMyTurn, gameState.myId, roomId, updateGameState]);

  // Передача денег
  const handleTransferMoney = useCallback((toPlayerId, amount) => {
    if (!toPlayerId || amount <= 0) return;
    
    // console.log('🔄 [GameLogic] Transferring money:', { toPlayerId, amount });
    socket.emit('transferMoney', roomId, gameState.myId, toPlayerId, amount);
  }, [roomId, gameState.myId]);

  // Покупка сделки
  const handleBuyDeal = useCallback((card, useCredit = false) => {
    if (!card) return;
    
    // console.log('🔄 [GameLogic] Buying deal:', { card, useCredit });
    socket.emit('buyDeal', roomId, gameState.myId, card, useCredit);
    
    // Обновляем статистику игры
    setGameStats(prev => ({
      ...prev,
      dealsCompleted: prev.dealsCompleted + 1
    }));
  }, [roomId, gameState.myId]);

  // Отказ от сделки
  const handleSkipDeal = useCallback((card) => {
    if (!card) return;
    
    // console.log('🔄 [GameLogic] Skipping deal:', card);
    socket.emit('skipDeal', roomId, gameState.myId, card);
  }, [roomId, gameState.myId]);

  // Завершение игры
  const handleGameEnd = useCallback(async (won = false) => {
    if (!gameStartTime) return;
    
    const gameTime = Math.round((Date.now() - gameStartTime) / 60000); // в минутах
    const currentPlayer = getCurrentPlayer();
    
    if (!currentPlayer) return;
    
    // Подготавливаем данные для обновления рейтинга
    const gameData = {
      roomId,
      playerId: gameState.myId,
      username: currentPlayer.username,
      finalScore: currentPlayer.balance + currentPlayer.passiveIncome,
      finalNetWorth: currentPlayer.balance,
      gameTime,
      dealsCompleted: gameStats.dealsCompleted,
      passiveIncome: currentPlayer.passiveIncome,
      won
    };
    
    // console.log('🔄 [GameLogic] Game ended, updating rating:', gameData);
    
    try {
      // Отправляем данные на сервер для обновления рейтинга
      const response = await fetch('http://localhost:5000/api/ratings/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gameData),
      });
      
      if (response.ok) {
        // console.log('✅ [GameLogic] Rating updated successfully');
      } else {
        // console.error('❌ [GameLogic] Failed to update rating');
      }
    } catch (error) {
      // console.error('❌ [GameLogic] Error updating rating:', error);
    }
    
    // Сбрасываем статистику игры
    setGameStats({
      dealsCompleted: 0,
      passiveIncome: 0,
      finalNetWorth: 0
    });
    setGameStartTime(null);
  }, [gameStartTime, gameState.myId, roomId, gameStats]);

  // Получение информации о текущем игроке
  const getCurrentPlayer = useCallback(() => {
    return gameState.players.find(p => p.id === gameState.myId);
  }, [gameState.players, gameState.myId]);

  // Проверка, может ли игрок позволить себе покупку
  const canAffordPurchase = useCallback((cost) => {
    const currentPlayer = getCurrentPlayer();
    if (!currentPlayer) return false;
    
    return currentPlayer.balance >= cost;
  }, [getCurrentPlayer]);

  // Расчет максимального кредита
  const calculateMaxLoan = useCallback(() => {
    const currentPlayer = getCurrentPlayer();
    if (!currentPlayer) return 0;
    
    return currentPlayer.monthlyCashflow * 10;
  }, [getCurrentPlayer]);

  // Расчет доступного кредита для покупки
  const calculateAvailableCredit = useCallback((cost) => {
    const currentPlayer = getCurrentPlayer();
    if (!currentPlayer) return { fromBalance: 0, fromCredit: 0 };
    
    const maxFromBalance = Math.floor(currentPlayer.balance / 1000) * 1000;
    const fromBalance = Math.min(maxFromBalance, cost);
    const fromCredit = cost - fromBalance;
    
    return { fromBalance, fromCredit };
  }, [getCurrentPlayer]);

  // Получение игроков для перевода (только из текущей комнаты)
  const getTransferablePlayers = useCallback(() => {
    return gameState.players.filter(p => 
      p.id !== gameState.myId && 
      p.roomId === roomId
    );
  }, [gameState.players, gameState.myId, roomId]);

  // Обновление пассивного дохода
  const updatePassiveIncome = useCallback((newPassiveIncome) => {
    setGameStats(prev => ({
      ...prev,
      passiveIncome: newPassiveIncome
    }));
  }, []);

  // Функции управления таймером для хоста
  const pauseTurnTimer = useCallback(() => {
    if (roomId) {

      socket.emit('pauseTurnTimer', roomId);
    }
  }, [roomId]);

  const resumeTurnTimer = useCallback(() => {
    if (roomId) {

      socket.emit('resumeTurnTimer', roomId);
    }
  }, [roomId]);

  return {
    // Состояние
    diceState,
    turnTimerState,
    gameStats,
    
    // Действия
    rollDice,
    handleEndTurn,
    handleTransferMoney,
    handleBuyDeal,
    handleSkipDeal,
    handleGameEnd,
    updatePassiveIncome,
    pauseTurnTimer,
    resumeTurnTimer,
    
    // Утилиты
    getCurrentPlayer,
    canAffordPurchase,
    calculateMaxLoan,
    calculateAvailableCredit,
    getTransferablePlayers
  };
};
