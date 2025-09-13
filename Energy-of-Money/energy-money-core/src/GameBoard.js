import React, { useState, useEffect } from 'react';
import './App.css';

function GameBoard({ userData, onBack }) {
  const [currentPosition, setCurrentPosition] = useState(0);
  const [diceResult, setDiceResult] = useState(0);
  const [isRolling, setIsRolling] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [balance, setBalance] = useState(10); // Начальный баланс

  // Игровое поле - массив ячеек
  const gameCells = [
    { id: 0, type: 'start', name: 'СТАРТ', color: '#4CAF50', description: 'Начало игры' },
    { id: 1, type: 'opportunity', name: 'БИЗНЕС', color: '#2196F3', description: 'Бизнес-возможность' },
    { id: 2, type: 'expense', name: 'РАСХОДЫ', color: '#f44336', description: 'Неожиданные расходы' },
    { id: 3, type: 'investment', name: 'ИНВЕСТИЦИИ', color: '#9C27B0', description: 'Инвестиционная возможность' },
    { id: 4, type: 'charity', name: 'БЛАГОТВОРИТЕЛЬНОСТЬ', color: '#FF9800', description: 'Помощь другим' },
    { id: 5, type: 'market', name: 'РЫНОК', color: '#607D8B', description: 'Рыночные события' },
    { id: 6, type: 'dream', name: 'МЕЧТА', color: '#E91E63', description: 'Ваша мечта' },
    { id: 7, type: 'payday', name: 'ЗАРПЛАТА', color: '#4CAF50', description: 'Получение дохода' },
    { id: 8, type: 'expense', name: 'РАСХОДЫ', color: '#f44336', description: 'Ежемесячные расходы' },
    { id: 9, type: 'opportunity', name: 'БИЗНЕС', color: '#2196F3', description: 'Новая возможность' },
    { id: 10, type: 'investment', name: 'АКЦИИ', color: '#9C27B0', description: 'Фондовый рынок' },
    { id: 11, type: 'charity', name: 'БЛАГОТВОРИТЕЛЬНОСТЬ', color: '#FF9800', description: 'Помощь нуждающимся' }
  ];

  const rollDice = () => {
    if (isRolling || !gameStarted) return;
    
    setIsRolling(true);
    // Анимация броска кубика
    let rollCount = 0;
    const rollInterval = setInterval(() => {
      setDiceResult(Math.floor(Math.random() * 6) + 1);
      rollCount++;
      
      if (rollCount >= 10) {
        clearInterval(rollInterval);
        setIsRolling(false);
        
        // Финальный результат
        const finalResult = Math.floor(Math.random() * 6) + 1;
        setDiceResult(finalResult);
        
        // Перемещение по полю
        movePlayer(finalResult);
      }
    }, 100);
  };

  const movePlayer = (steps) => {
    setCurrentPosition(prev => {
      const newPosition = (prev + steps) % gameCells.length;
      handleCellAction(newPosition);
      return newPosition;
    });
  };

  const handleCellAction = (position) => {
    const cell = gameCells[position];
    console.log('🎯 Landed on:', cell.name, cell.type);
    
    switch (cell.type) {
      case 'start':
        setBalance(prev => prev + 10);
        break;
      case 'payday':
        setBalance(prev => prev + 20);
        break;
      case 'expense':
        setBalance(prev => Math.max(0, prev - 15));
        break;
      case 'opportunity':
        setBalance(prev => prev + 25);
        break;
      case 'investment':
        setBalance(prev => prev + 30);
        break;
      case 'charity':
        setBalance(prev => Math.max(0, prev - 10));
        break;
      case 'market':
        setBalance(prev => prev + Math.floor(Math.random() * 20) - 10);
        break;
      case 'dream':
        setBalance(prev => prev + 50);
        break;
      default:
        break;
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setCurrentPosition(0);
    setBalance(10);
    setDiceResult(0);
  };

  const resetGame = () => {
    setGameStarted(false);
    setCurrentPosition(0);
    setBalance(10);
    setDiceResult(0);
    setIsRolling(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '20px' }}>
          <h1>🎮 Игровое поле</h1>
          <button 
            onClick={onBack}
            style={{
              background: 'linear-gradient(45deg, #666, #888)',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            ← Назад
          </button>
        </div>

        {/* Информация о игроке */}
        {userData && (
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '20px',
            minWidth: '400px'
          }}>
            <h3>👤 {userData.username}</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              <div>💰 Баланс: <strong>${balance}</strong></div>
              <div>🎯 Позиция: <strong>{currentPosition + 1}</strong></div>
              <div>🎲 Последний бросок: <strong>{diceResult}</strong></div>
            </div>
          </div>
        )}

        {/* Игровое поле */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '10px',
          maxWidth: '800px',
          margin: '20px auto'
        }}>
          {gameCells.map((cell, index) => (
            <div
              key={cell.id}
              style={{
                background: currentPosition === index ? 
                  `linear-gradient(45deg, ${cell.color}, ${cell.color}dd)` : 
                  `linear-gradient(45deg, ${cell.color}aa, ${cell.color}66)`,
                padding: '20px',
                borderRadius: '10px',
                textAlign: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '14px',
                minHeight: '80px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                border: currentPosition === index ? '3px solid #FFD700' : '2px solid transparent',
                transform: currentPosition === index ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.3s ease',
                boxShadow: currentPosition === index ? '0 0 20px rgba(255, 215, 0, 0.5)' : '0 2px 10px rgba(0,0,0,0.2)'
              }}
            >
              <div style={{ fontSize: '12px', marginBottom: '5px' }}>
                {cell.id + 1}
              </div>
              <div style={{ fontSize: '16px', marginBottom: '5px' }}>
                {cell.name}
              </div>
              <div style={{ fontSize: '10px', opacity: 0.8 }}>
                {cell.description}
              </div>
            </div>
          ))}
        </div>

        {/* Управление игрой */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          padding: '20px',
          borderRadius: '10px',
          marginTop: '20px',
          minWidth: '400px'
        }}>
          {!gameStarted ? (
            <div style={{ textAlign: 'center' }}>
              <h3>🎯 Готовы начать игру?</h3>
              <p>Начальный баланс: $10</p>
              <button 
                onClick={startGame}
                className="start-button"
                style={{
                  background: 'linear-gradient(45deg, #4CAF50, #45a049)',
                  marginTop: '10px'
                }}
              >
                🚀 НАЧАТЬ ИГРУ
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <h3>🎲 Ваш ход!</h3>
              <div style={{ margin: '20px 0' }}>
                <div style={{ 
                  fontSize: '48px', 
                  fontWeight: 'bold',
                  color: isRolling ? '#FFD700' : '#fff',
                  margin: '10px 0'
                }}>
                  {isRolling ? '🎲' : diceResult}
                </div>
                {isRolling && <p>Бросаем кубик...</p>}
              </div>
              
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <button 
                  onClick={rollDice}
                  disabled={isRolling}
                  className="start-button"
                  style={{
                    background: isRolling ? 
                      'linear-gradient(45deg, #666, #888)' : 
                      'linear-gradient(45deg, #2196F3, #1976D2)',
                    opacity: isRolling ? 0.6 : 1
                  }}
                >
                  🎲 БРОСИТЬ КУБИК
                </button>
                
                <button 
                  onClick={resetGame}
                  className="start-button"
                  style={{
                    background: 'linear-gradient(45deg, #f44336, #d32f2f)'
                  }}
                >
                  🔄 НОВАЯ ИГРА
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Статистика */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          padding: '15px',
          borderRadius: '10px',
          marginTop: '20px',
          minWidth: '400px',
          fontSize: '14px'
        }}>
          <h4>📊 Статистика игры</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '10px' }}>
            <div>🎯 Ходы: {gameStarted ? Math.floor(currentPosition / gameCells.length) + 1 : 0}</div>
            <div>💰 Заработано: ${Math.max(0, balance - 10)}</div>
            <div>🏆 Статус: {balance > 50 ? 'Богач' : balance > 20 ? 'Успешный' : 'Начинающий'}</div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default GameBoard;
