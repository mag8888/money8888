import React, { useCallback, useEffect, useState } from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { motion } from 'framer-motion';
import { useLogout } from '../hooks/useLogout';
import { useGameState } from '../hooks/useGameState';
import { useSocketEvents } from '../hooks/useSocketEvents';
import { useGameLogic } from '../hooks/useGameLogic';
import socket from '../socket';
import GameField from './GameField';
import GameControls from './GameControls';
import Hud from './Hud';
import BankModal from './BankModal';
import ProfessionModal from './ProfessionModal';
import FreedomModal from './FreedomModal';
import DealModal from './DealModal';
import ExitConfirmModal from './ExitConfirmModal';

const GameBoardRefactored = ({ roomId, playerData, onExit }) => {
  // Используем централизованные хуки
  const {
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
    getTransferablePlayers
  } = useGameState(roomId);

  // Состояние фазы игры
  const [gamePhase, setGamePhase] = useState('waiting'); // waiting, diceRoll, playing, finished
  
  // Состояние анимации кубика
  const [diceAnimation, setDiceAnimation] = useState({
    isRolling: false,
    currentValue: null,
    showAnimation: false,
    rollingFrames: [],
    isAnimationComplete: false, // Флаг завершения анимации
    currentFrameIndex: 0 // Индекс текущего кадра анимации
  });

  // Состояние таймера очередности
  const [orderTimer, setOrderTimer] = useState({
    isActive: false,
    timeLeft: 300, // 5 минут = 300 секунд
    totalTime: 300
  });

  // Состояние очередности игроков
  const [playerOrder, setPlayerOrder] = useState([]);

  // Принудительно запрашиваем список игроков при загрузке компонента
  useEffect(() => {
    if (roomId && socket) {

      socket.emit('getPlayers', roomId);
      socket.emit('getRoom', roomId);
      
      // Повторно запрашиваем через небольшую задержку
      const timer = setTimeout(() => {
  
        socket.emit('getPlayers', roomId);
        socket.emit('getRoom', roomId);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [roomId]);

  // Запускаем таймер очередности сразу после входа в комнату
  useEffect(() => {
    if (roomId && socket) {
      // Запускаем таймер на 5 минут для определения очередности
      setOrderTimer(prev => ({
        ...prev,
        isActive: true,
        timeLeft: 300,
        totalTime: 300
      }));

      // Запускаем обратный отсчет
      const countdownInterval = setInterval(() => {
        setOrderTimer(prev => {
          if (prev.timeLeft <= 1) {
            // Время вышло - завершаем определение очередности
            clearInterval(countdownInterval);
            return {
              ...prev,
              isActive: false,
              timeLeft: 0
            };
          }
          return {
            ...prev,
            timeLeft: prev.timeLeft - 1
          };
        });
      }, 1000);

      return () => clearInterval(countdownInterval);
    }
  }, [roomId, socket]);

  // Периодически обновляем список игроков
  useEffect(() => {
    if (roomId && socket) {
      const interval = setInterval(() => {
        // Убираем лишний лог для уменьшения спама
        socket.emit('getPlayers', roomId);
      }, 10000); // Увеличиваем интервал до 10 секунд
      
      return () => clearInterval(interval);
    }
  }, [roomId, socket]);

  // Используем хук для Socket.IO событий
  useSocketEvents(
    roomId,
    updateGameState,
    updateBankState,
    updateProfessionState,
    updateFreedomState,
    updateExitState
  );

  // Слушаем события комнаты для обновления gamePhase
  useEffect(() => {
    if (!socket) return;

    const handleRoomData = (roomData) => {

      
      // Обновляем gamePhase в зависимости от статуса комнаты
      if (roomData.status === 'determining_order') {

        setGamePhase('diceRoll');
      } else if (roomData.status === 'started') {

        setGamePhase('playing');
      } else if (roomData.status === 'waiting') {

        setGamePhase('waiting');
      }
    };

    const handleOrderDeterminationStarted = (orderData) => {

      setGamePhase('diceRoll');
    };

    socket.on('roomData', handleRoomData);
    socket.on('orderDeterminationStarted', handleOrderDeterminationStarted);

    return () => {
      socket.off('roomData', handleRoomData);
      socket.off('orderDeterminationStarted', handleOrderDeterminationStarted);
    };
  }, [socket]);

  // Функция броска кубика
  const handleRollDice = () => {
    if (diceAnimation.isRolling) return;
    
    // Генерируем случайное число от 1 до 6
    const randomValue = Math.floor(Math.random() * 6) + 1;
    
    // Создаем массив случайных кадров для анимации (61 кадр для полной анимации)
    const frames = [];
    for (let i = 0; i < 61; i++) {
      frames.push(Math.floor(Math.random() * 6) + 1);
    }
    
    // Устанавливаем начальное состояние анимации
    setDiceAnimation(prev => ({
      ...prev,
      isRolling: true,
      showAnimation: true,
      rollingFrames: frames,
      currentValue: null,
      isAnimationComplete: false,
      currentFrameIndex: 0
    }));
    
    // Создаем интервал для анимации кадров
    let frameIndex = 0;
    const animationInterval = setInterval(() => {
      frameIndex++;
      
      // Обновляем текущий кадр в состоянии
      setDiceAnimation(prev => ({
        ...prev,
        currentFrameIndex: frameIndex
      }));
      
      // Останавливаем анимацию после 61 кадра (0-60)
      if (frameIndex >= 60) {
        // Очищаем интервал
        clearInterval(animationInterval);
        
        // Устанавливаем финальное состояние
        setDiceAnimation(prev => ({
          ...prev,
          isRolling: false,
          showAnimation: true,
          currentValue: randomValue,
          rollingFrames: [],
          isAnimationComplete: true,
          currentFrameIndex: 0
        }));
        
        // Вызываем функцию rollDice
        if (rollDice && typeof rollDice === 'function') {
          rollDice(randomValue);
        }
        
        return;
      }
    }, 100); // 100мс для более плавной анимации
    
    // Принудительная остановка через 6.1 секунды как страховка
    setTimeout(() => {
      // Очищаем интервал если он еще активен
      clearInterval(animationInterval);
      
      // Принудительно устанавливаем финальное состояние
      setDiceAnimation(prev => ({
        ...prev,
        isRolling: false,
        showAnimation: true,
        currentValue: randomValue,
        rollingFrames: [],
        isAnimationComplete: true,
        currentFrameIndex: 0
      }));
      
      // Вызываем функцию rollDice если еще не вызвали
      if (rollDice && typeof rollDice === 'function') {
        rollDice(randomValue);
      }
    }, 6100);
  };

  // Используем хук для игровой логики
  const {
    diceState,
    turnTimerState,
    rollDice,
    handleEndTurn,
    handleTransferMoney,
    handleBuyDeal,
    handleSkipDeal,
    getCurrentPlayer: getCurrentPlayerLogic,
    canAffordPurchase,
    calculateMaxLoan,
    calculateAvailableCredit,
    pauseTurnTimer,
    resumeTurnTimer
  } = useGameLogic(roomId, gameState, updateGameState);

  // Используем централизованный хук для выхода
  const { logout } = useLogout();

  // Обработчики событий
  const handleExitGame = useCallback(() => {
    
    updateExitState({ modalOpen: false });
    
    if (onExit) {
      onExit();
    } else {
      logout(roomId, 'game_exit');
    }
  }, [onExit, logout, roomId, updateExitState]);

  const handleBankClick = useCallback(() => {
    updateBankState({ modalOpen: true });
  }, [updateBankState]);

  const handleProfessionClick = useCallback(() => {
    updateProfessionState({ modalOpen: true });
  }, [updateProfessionState]);

  const handleFreedomClick = useCallback(() => {
    updateFreedomState({ modalOpen: true });
  }, [updateFreedomState]);

  const handleExitClick = useCallback(() => {
    updateExitState({ modalOpen: true });
  }, [updateExitState]);

  const handleCellClick = useCallback((position, cellType) => {
    
    
    if (gameState.isMyTurn) {
      // Здесь можно добавить логику для обработки клика по клетке
      // Например, показать модальное окно с выбором действия
    }
  }, [gameState.isMyTurn]);

  const handleBankTransfer = useCallback((toPlayerId, amount) => {
    if (toPlayerId && amount > 0) {
      handleTransferMoney(toPlayerId, amount);
      updateBankState({ modalOpen: false, transferTo: '', transferAmount: 0 });
    }
  }, [handleTransferMoney, updateBankState]);

  const handleDealAction = useCallback((action, card, useCredit = false) => {
    switch (action) {
      case 'buy':
        handleBuyDeal(card, useCredit);
        break;
      case 'skip':
        handleSkipDeal(card);
        break;
      default:
        console.warn('Unknown deal action:', action);
    }
    
    // Закрываем модальное окно
    updateGameState({ modal: null });
  }, [handleBuyDeal, handleSkipDeal, updateGameState]);

  // Получаем текущего игрока
  const currentPlayer = getCurrentPlayer();
  const transferablePlayers = getTransferablePlayers();

  // Обновляем активы игрока при изменении состояния
  useEffect(() => {
    // Убираем лишний лог для уменьшения спама
    // if (currentPlayer?.assets) {
    //   console.log('🔄 [GameBoard] Player assets updated:', currentPlayer.assets);
    // }
  }, [currentPlayer?.assets]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#1a1a2e',
        color: 'white',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Верхняя панель */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 2,
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        {/* Информация об игроке */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              backgroundColor: currentPlayer?.color || '#9C27B0',
              width: 40,
              height: 40
            }}
          >
            {playerData?.username?.charAt(0) || currentPlayer?.username?.charAt(0) || 'И'}
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {playerData?.username || currentPlayer?.username || 'Игрок'}
          </Typography>
        </Box>

        {/* Заголовок игры */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 2,
          padding: '8px 16px',
          backgroundColor: 'rgba(0,0,0,0.3)',
          borderRadius: 1,
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <img 
            src="/images/center-logo.svg" 
            alt="Поток Денег Logo" 
            style={{
              width: '40px',
              height: '40px',
              objectFit: 'contain'
            }}
          />
          <Typography variant="h4" sx={{ 
            color: '#FFD700', 
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
          }}>
            ПОТОК ДЕНЕГ
          </Typography>
          
          {/* Информация о комнате для отладки */}
          <Box sx={{ 
            backgroundColor: 'rgba(0,0,0,0.5)',
            color: 'white',
            padding: '4px 12px',
            borderRadius: 1,
            fontSize: '0.8rem'
          }}>
            🏠 Комната: {roomId || 'Неизвестно'}
          </Box>
        </Box>

        {/* Пустое место для баланса */}
        <Box sx={{ width: 120 }} />
      </Box>

      {/* Основной контент */}
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          gap: 2,
          padding: 2,
          overflow: 'hidden'
        }}
      >
        {/* Левая панель - Игровое поле */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2
          }}
        >

          <GameField
            players={gameState.players}
            currentTurn={gameState.currentTurn}
            onCellClick={handleCellClick}
            onRollDice={rollDice}
            isMyTurn={gameState.isMyTurn}
            diceValue={diceState.displayDice}
            isRolling={diceState.isRolling}
            gamePhase={gamePhase}
            diceAnimation={diceAnimation}
          />
          
          {/* Управление игрой под полем */}
          {/* <GameControls
            isMyTurn={gameState.isMyTurn}
            currentTurn={gameState.currentTurn}
            players={gameState.players}
            myId={gameState.myId}
            onEndTurn={handleEndTurn}
            onBankClick={handleBankClick}
            onProfessionClick={handleProfessionClick}
            onFreedomClick={handleFreedomClick}
            onExitClick={handleExitClick}
            timer={turnTimerState.timer}
            isTimerActive={turnTimerState.isActive}
            turnBanner={gameState.turnBanner}
          /> */}
        </Box>

        {/* Правая панель - Управление */}
        <Box sx={{ width: 300 }}>

          <GameControls
            isMyTurn={gameState.isMyTurn}
            currentTurn={gameState.currentTurn}
            players={gameState.players}
            myId={gameState.myId}
            onEndTurn={handleEndTurn}
            onBankClick={handleBankClick}
            onProfessionClick={handleProfessionClick}
            onFreedomClick={handleFreedomClick}
            onExitClick={handleExitClick}
            timer={turnTimerState.timer}
            isTimerActive={turnTimerState.isActive}
            turnBanner={gameState.turnBanner}
            currentPlayer={currentPlayer}
            diceValue={diceState.timerDice}
            playerProfession={currentPlayer?.profession ? {
              id: currentPlayer.profession.id,
              name: currentPlayer.profession.name,
              salary: currentPlayer.profession.salary,
              expenses: currentPlayer.profession.expenses,
              balance: currentPlayer.profession.balance,
              passiveIncome: currentPlayer.profession.passiveIncome,
              description: currentPlayer.profession.description,
              charity: currentPlayer.profession.charity
            } : null}
            playerBalance={currentPlayer?.profession?.balance || currentPlayer?.balance || 0}
            onPauseTimer={pauseTurnTimer}
            onResumeTimer={resumeTurnTimer}
            isHost={gameState.hostId === gameState.myId}
            timerPaused={turnTimerState.paused}
            onRollDice={handleRollDice}
            isRolling={diceAnimation.isRolling}
            hasCharity={currentPlayer?.charity || false}
            roomId={roomId}
            gamePhase={gamePhase}
            diceAnimation={diceAnimation}
          />
        </Box>
      </Box>

      {/* Модальные окна */}
      
      {/* Модальное окно банка */}
      <BankModal
        open={bankState.modalOpen}
        onClose={() => updateBankState({ modalOpen: false })}
        players={transferablePlayers}
        currentPlayer={currentPlayer}
        onTransfer={handleBankTransfer}
        transferTo={bankState.transferTo}
        transferAmount={bankState.transferAmount}
        onTransferToChange={(value) => updateBankState({ transferTo: value })}
        onTransferAmountChange={(value) => updateBankState({ transferAmount: value })}
      />

      {/* Модальное окно профессии */}
      <ProfessionModal
        open={professionState.modalOpen}
        onClose={() => updateProfessionState({ modalOpen: false })}
        roomId={roomId}
        currentPlayer={currentPlayer}
      />

      {/* Модальное окно финансовой свободы */}
      <FreedomModal
        open={freedomState.modalOpen}
        onClose={() => updateFreedomState({ modalOpen: false })}
        currentPlayer={currentPlayer}
      />

      {/* Модальное окно сделки */}
      <DealModal
        open={!!gameState.modal}
        onClose={() => updateGameState({ modal: null })}
        modal={gameState.modal}
        currentPlayer={currentPlayer}
        onAction={handleDealAction}
        canAffordPurchase={canAffordPurchase}
        calculateMaxLoan={calculateMaxLoan}
        calculateAvailableCredit={calculateAvailableCredit}
      />

      {/* Модальное окно подтверждения выхода */}
      <ExitConfirmModal
        open={exitState.modalOpen}
        onClose={() => updateExitState({ modalOpen: false })}
        onConfirm={handleExitGame}
      />
    </Box>
  );
};

export default GameBoardRefactored;
