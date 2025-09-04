import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, useMediaQuery, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

// Импортируем наши кастомные хуки
import { useGamePlayers } from '../../hooks/useGamePlayers';
import { usePlayerBalance } from '../../hooks/usePlayerBalance';
import { useGameTurn } from '../../hooks/useGameTurn';
import { useSocketConnection } from '../../hooks/useSocketConnection';

// Импортируем компоненты
import CurrentTurnDisplay from './CurrentTurnDisplay';
import GameBoard from './GameBoard';
import GameControlPanel from './GameControlPanel';

// Импорты сервисов (пока не используются)
// import { GAME_CONSTANTS } from '../../services/gameLogicService';
// import { processCardPurchase, processExpenseCard } from '../../services/cardService';

/**
 * Рефакторенный компонент игровой доски
 * Использует кастомные хуки и сервисы для лучшей организации кода
 */
const RefactoredGameBoard = ({ roomId, playerData, onExit }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Состояние мобильного меню
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Используем кастомные хуки
  const {
    isConnected: _isConnected,
    connectionError,
    isConnecting,
    connect,
    disconnect: _disconnect,
    emit,
    on,
    off,
    socket
  } = useSocketConnection(roomId, playerData);

  const {
    gamePlayers,
    setGamePlayers: _setGamePlayers,
    currentPlayer,
    setCurrentPlayer: _setCurrentPlayer,
    isLoading: playersLoading,
    getCurrentPlayer,
    getPlayerByIndex: _getPlayerByIndex,
    getPlayerById: _getPlayerById,
    updatePlayer,
    syncPlayerData
  } = useGamePlayers(roomId, playerData, socket);

  const {
    bankBalance: _bankBalance,
    playerMoney: _playerMoney,
    bigCircleBalance: _bigCircleBalance,
    updateBalance: _updateBalance,
    addMoney: _addMoney,
    subtractMoney: _subtractMoney,
    hasEnoughMoney: _hasEnoughMoney
  } = usePlayerBalance(gamePlayers, playerData, socket);

  const {
    currentTurn,
    currentTurnIndex: _currentTurnIndex,
    turnOrder: _turnOrder,
    turnTimeLeft,
    isMyTurn: _isMyTurn,
    getPlayerNameById,
    getNextPlayer: _getNextPlayer,
    changeTurn: _changeTurn,
    canRollDice
  } = useGameTurn(gamePlayers, roomId, socket);

  // Обработчики событий
  const handleRollDice = useCallback(() => {
    if (!canRollDice() || !socket.connected) return;

    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    const total = dice1 + dice2;

    console.log(`🎲 [RefactoredGameBoard] Брошены кубики: ${dice1} + ${dice2} = ${total}`);

    // Отправляем результат на сервер
    emit('diceRolled', {
      roomId,
      playerId: socket.id,
      dice1,
      dice2,
      total
    });

    // Обновляем позицию игрока локально
    const currentPlayer = getCurrentPlayer();
    if (currentPlayer) {
      const newPosition = (currentPlayer.position + total) % 24;
      updatePlayer(currentPlayer.id, { position: newPosition });
      syncPlayerData(currentPlayer.id, { position: newPosition });
    }
  }, [canRollDice, socket, emit, roomId, getCurrentPlayer, updatePlayer, syncPlayerData]);

  const handleCellClick = useCallback((cellIndex) => {
    console.log(`🎯 [RefactoredGameBoard] Клик по клетке: ${cellIndex}`);
    
    // Здесь можно добавить логику для взаимодействия с клетками
    // Например, показ модального окна с карточкой
  }, []);

  const handleOpenBank = useCallback(() => {
    console.log('🏦 [RefactoredGameBoard] Открытие банка');
    // Здесь можно добавить логику для открытия банковского модуля
  }, []);

  const handleOpenInventory = useCallback(() => {
    console.log('🎒 [RefactoredGameBoard] Открытие инвентаря');
    // Здесь можно добавить логику для открытия инвентаря
  }, []);

  const handleOpenPlayers = useCallback(() => {
    console.log('👥 [RefactoredGameBoard] Открытие списка игроков');
    // Здесь можно добавить логику для открытия списка игроков
  }, []);

  const handleToggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  // Обработчики Socket.IO событий
  useEffect(() => {
    if (!socket || !roomId) return;

    const handleDiceRolled = (data) => {
      console.log('🎲 [RefactoredGameBoard] Получен результат броска:', data);
      // Здесь можно добавить анимацию броска кубиков
    };

    const handlePlayerPositionUpdate = (data) => {
      console.log('📍 [RefactoredGameBoard] Обновление позиции игрока:', data);
      updatePlayer(data.playerId, { position: data.position });
    };

    const handleTurnChanged = (data) => {
      console.log('🔄 [RefactoredGameBoard] Смена хода:', data);
      // Логика смены хода уже обрабатывается в useGameTurn
    };

    // Подписываемся на события
    on('diceRolled', handleDiceRolled);
    on('playerPositionUpdate', handlePlayerPositionUpdate);
    on('playerTurnChanged', handleTurnChanged);

    return () => {
      off('diceRolled', handleDiceRolled);
      off('playerPositionUpdate', handlePlayerPositionUpdate);
      off('playerTurnChanged', handleTurnChanged);
    };
  }, [socket, roomId, on, off, updatePlayer]);

  // Показываем загрузку, если данные еще не готовы
  if (playersLoading || isConnecting) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h4" sx={{
            color: '#ffffff',
            textAlign: 'center',
            mb: 2
          }}>
            🎮 Загрузка игры...
          </Typography>
          <Typography variant="body1" sx={{
            color: '#e5e7eb',
            textAlign: 'center'
          }}>
            Подключение к серверу и загрузка данных игроков
          </Typography>
        </motion.div>
      </Box>
    );
  }

  // Показываем ошибку подключения
  if (connectionError) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
        p: 3
      }}>
        <Typography variant="h4" sx={{
          color: '#ffffff',
          textAlign: 'center',
          mb: 2
        }}>
          ❌ Ошибка подключения
        </Typography>
        <Typography variant="body1" sx={{
          color: '#fecaca',
          textAlign: 'center',
          mb: 3
        }}>
          {connectionError}
        </Typography>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="contained"
            onClick={connect}
            sx={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
              }
            }}
          >
            Попробовать снова
          </Button>
        </motion.div>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%)',
      p: isMobile ? 1 : 2
    }}>
      {/* Отображение текущего хода */}
      <CurrentTurnDisplay
        currentTurn={currentTurn}
        turnTimeLeft={turnTimeLeft}
        getPlayerNameById={getPlayerNameById}
      />

      {/* Основной контент */}
      <Box sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: 3,
        alignItems: 'flex-start',
        justifyContent: 'center',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Игровая доска */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GameBoard
            gamePlayers={gamePlayers}
            currentPlayer={currentPlayer}
            onCellClick={handleCellClick}
          >
            <Typography variant="h5" sx={{
              color: '#ffffff',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)'
            }}>
              🎯 CASHFLOW
            </Typography>
            <Typography variant="body2" sx={{
              color: '#e5e7eb',
              mt: 1
            }}>
              Игра денежного потока
            </Typography>
          </GameBoard>
        </motion.div>

        {/* Панель управления */}
        {!isMobile && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <GameControlPanel
              canRollDice={canRollDice()}
              onRollDice={handleRollDice}
              onOpenBank={handleOpenBank}
              onOpenInventory={handleOpenInventory}
              onOpenPlayers={handleOpenPlayers}
              isMobileMenuOpen={isMobileMenuOpen}
              onToggleMobileMenu={handleToggleMobileMenu}
              isMobile={isMobile}
            />
          </motion.div>
        )}
      </Box>

      {/* Мобильная панель управления */}
      {isMobile && (
        <GameControlPanel
          canRollDice={canRollDice()}
          onRollDice={handleRollDice}
          onOpenBank={handleOpenBank}
          onOpenInventory={handleOpenInventory}
          onOpenPlayers={handleOpenPlayers}
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleMobileMenu={handleToggleMobileMenu}
          isMobile={isMobile}
        />
      )}
    </Box>
  );
};

export default RefactoredGameBoard;
