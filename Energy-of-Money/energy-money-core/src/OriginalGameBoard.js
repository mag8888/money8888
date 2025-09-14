import React, { useState, useEffect } from 'react';
import './App.css';

function OriginalGameBoard({ userData, onBack }) {
  const [currentPosition, setCurrentPosition] = useState(0);
  const [diceResult, setDiceResult] = useState(0);
  const [isRolling, setIsRolling] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [balance, setBalance] = useState(2000); // Начальный баланс как в оригинале
  const [salary, setSalary] = useState(2000); // Зарплата
  const [expenses, setExpenses] = useState(200); // Расходы
  const [passiveIncome, setPassiveIncome] = useState(0); // Пассивный доход

  // Оригинальные игровые ячейки на основе seed_v1.json
  const originalGameCells = [
    { 
      id: 1, 
      type: 'income', 
      name: 'ЗАРПЛАТА', 
      color: '#4CAF50', 
      description: 'Получите зарплату',
      amount: 2000
    },
    { 
      id: 2, 
      type: 'expense', 
      name: 'НАЛОГИ', 
      color: '#f44336', 
      description: 'Заплатите налоги',
      amount: 200
    },
    { 
      id: 3, 
      type: 'opportunity', 
      name: 'БИЗНЕС', 
      color: '#2196F3', 
      description: 'Бизнес-возможность',
      amount: 1500
    },
    { 
      id: 4, 
      type: 'investment', 
      name: 'ИНВЕСТИЦИИ', 
      color: '#9C27B0', 
      description: 'Инвестиционная возможность',
      amount: 1000
    },
    { 
      id: 5, 
      type: 'charity', 
      name: 'БЛАГОТВОРИТЕЛЬНОСТЬ', 
      color: '#FF9800', 
      description: 'Помощь другим',
      amount: 100
    },
    { 
      id: 6, 
      type: 'market', 
      name: 'РЫНОК', 
      color: '#607D8B', 
      description: 'Рыночные события',
      amount: 500
    },
    { 
      id: 7, 
      type: 'dream', 
      name: 'МЕЧТА', 
      color: '#E91E63', 
      description: 'Ваша мечта',
      amount: 2000
    },
    { 
      id: 8, 
      type: 'payday', 
      name: 'ПАССИВНЫЙ ДОХОД', 
      color: '#4CAF50', 
      description: 'Получение пассивного дохода',
      amount: 300
    },
    { 
      id: 9, 
      type: 'expense', 
      type: 'expense', 
      name: 'РАСХОДЫ', 
      color: '#f44336', 
      description: 'Ежемесячные расходы',
      amount: 150
    },
    { 
      id: 10, 
      type: 'opportunity', 
      name: 'ДОХОДЫ', 
      color: '#2196F3', 
      description: 'Новые доходы',
      amount: 800
    },
    { 
      id: 11, 
      type: 'investment', 
      name: 'АКЦИИ', 
      color: '#9C27B0', 
      description: 'Фондовый рынок',
      amount: 1200
    },
    { 
      id: 12, 
      type: 'charity', 
      name: 'ПОМОЩЬ', 
      color: '#FF9800', 
      description: 'Помощь нуждающимся',
      amount: 80
    }
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
      const newPosition = (prev + steps) % originalGameCells.length;
      handleCellAction(newPosition);
      return newPosition;
    });
  };

  const handleCellAction = (position) => {
    const cell = originalGameCells[position];
    console.log('🎯 Landed on:', cell.name, cell.type);
    
    switch (cell.type) {
      case 'income':
        setBalance(prev => prev + cell.amount);
        break;
      case 'payday':
        setBalance(prev => prev + cell.amount);
        setPassiveIncome(prev => prev + cell.amount);
        break;
      case 'expense':
        setBalance(prev => Math.max(0, prev - cell.amount));
        break;
      case 'opportunity':
        setBalance(prev => prev + cell.amount);
        break;
      case 'investment':
        setBalance(prev => prev + cell.amount);
        setPassiveIncome(prev => prev + Math.floor(cell.amount * 0.1));
        break;
      case 'charity':
        setBalance(prev => Math.max(0, prev - cell.amount));
        break;
      case 'market':
        const marketChange = Math.floor(Math.random() * cell.amount * 2) - cell.amount;
        setBalance(prev => Math.max(0, prev + marketChange));
        break;
      case 'dream':
        setBalance(prev => prev + cell.amount);
        break;
      default:
        break;
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setCurrentPosition(0);
    setBalance(2000); // Начальный баланс как в оригинале
    setSalary(2000);
    setExpenses(200);
    setPassiveIncome(0);
    setDiceResult(0);
  };

  const resetGame = () => {
    setGameStarted(false);
    setCurrentPosition(0);
    setBalance(2000);
    setSalary(2000);
    setExpenses(200);
    setPassiveIncome(0);
    setDiceResult(0);
    setIsRolling(false);
  };

  const getPlayerStatus = () => {
    if (balance >= 5000) return { status: 'Богач', color: '#FFD700' };
    if (balance >= 3000) return { status: 'Успешный', color: '#4CAF50' };
    if (balance >= 1000) return { status: 'Стабильный', color: '#2196F3' };
    return { status: 'Начинающий', color: '#f44336' };
  };

  const playerStatus = getPlayerStatus();

  return (
    <div className="App">
      <header className="App-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '20px' }}>
          <h1>🎮 Оригинальное игровое поле</h1>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '10px' }}>
              <div>💰 Баланс: <strong>${balance}</strong></div>
              <div>💼 Зарплата: <strong>${salary}</strong></div>
              <div>📈 Пассивный доход: <strong>${passiveIncome}</strong></div>
              <div>🎯 Позиция: <strong>{currentPosition + 1}</strong></div>
              <div>🎲 Последний бросок: <strong>{diceResult}</strong></div>
              <div style={{ color: playerStatus.color }}>
                🏆 Статус: <strong>{playerStatus.status}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Оригинальное игровое поле */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '10px',
          maxWidth: '900px',
          margin: '20px auto'
        }}>
          {originalGameCells.map((cell, index) => (
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
                minHeight: '100px',
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
                {cell.id}
              </div>
              <div style={{ fontSize: '16px', marginBottom: '5px' }}>
                {cell.name}
              </div>
              <div style={{ fontSize: '10px', opacity: 0.8, marginBottom: '5px' }}>
                {cell.description}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#FFD700' }}>
                ${cell.amount}
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
              <h3>🎯 Готовы начать оригинальную игру?</h3>
              <p>Начальный баланс: $2000 (как в оригинале)</p>
              <p>Зарплата: $2000 | Расходы: $200</p>
              <button 
                onClick={startGame}
                className="start-button"
                style={{
                  background: 'linear-gradient(45deg, #4CAF50, #45a049)',
                  marginTop: '10px'
                }}
              >
                🚀 НАЧАТЬ ОРИГИНАЛЬНУЮ ИГРУ
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

        {/* Расширенная статистика */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          padding: '15px',
          borderRadius: '10px',
          marginTop: '20px',
          minWidth: '400px',
          fontSize: '14px'
        }}>
          <h4>📊 Оригинальная статистика игры</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', marginTop: '10px' }}>
            <div>🎯 Ходы: {gameStarted ? Math.floor(currentPosition / originalGameCells.length) + 1 : 0}</div>
            <div>💰 Заработано: ${Math.max(0, balance - 2000)}</div>
            <div>📈 Пассивный доход: ${passiveIncome}</div>
            <div style={{ color: playerStatus.color }}>
              🏆 Статус: {playerStatus.status}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default OriginalGameBoard;

