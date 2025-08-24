import React, { useCallback, useEffect } from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { motion } from 'framer-motion';
import { useLogout } from '../hooks/useLogout';
import { useGameState } from '../hooks/useGameState';
import { useSocketEvents } from '../hooks/useSocketEvents';
import { useGameLogic } from '../hooks/useGameLogic';
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

  // Используем хук для Socket.IO событий
  useSocketEvents(
    roomId,
    updateGameState,
    updateBankState,
    updateProfessionState,
    updateFreedomState,
    updateExitState
  );

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
    calculateAvailableCredit
  } = useGameLogic(roomId, gameState, updateGameState);

  // Используем централизованный хук для выхода
  const { logout } = useLogout();

  // Обработчики событий
  const handleExitGame = useCallback(() => {
    console.log('🔄 [GameBoard] Exit game confirmed');
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
    console.log('🔄 [GameBoard] Cell clicked:', { position, cellType });
    
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
    if (currentPlayer?.assets) {
      console.log('🔄 [GameBoard] Player assets updated:', currentPlayer.assets);
    }
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
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #FFD700, #FFA500)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
                      ПОТОК ДЕНЕГ
        </Typography>

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
            diceValue={diceState.displayDice}
            playerProfession={currentPlayer?.profession}
            playerBalance={currentPlayer?.balance}
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
