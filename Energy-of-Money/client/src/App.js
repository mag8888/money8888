import React, { useState, useEffect } from 'react';
import './styles/App.css';
import GameHeader from './components/GameHeader';
import GameBoard from './components/GameBoard';
import GameControls from './components/GameControls';
import GameStats from './components/GameStats';

function App() {
  const [gameState, setGameState] = useState({
    money: 1000,
    energy: 100,
    level: 1,
    score: 0,
    isPlaying: false
  });

  const [gameData, setGameData] = useState({
    transactions: [],
    categories: ['Доход', 'Расход', 'Инвестиции', 'Сбережения']
  });

  useEffect(() => {
    // Загрузка данных с сервера при запуске
    fetchGameData();
  }, []);

  const fetchGameData = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/transactions');
      if (response.ok) {
        const data = await response.json();
        setGameData(prev => ({ ...prev, transactions: data }));
      }
    } catch (error) {
      console.log('Сервер не запущен, используем локальные данные');
    }
  };

  const startGame = () => {
    setGameState(prev => ({ ...prev, isPlaying: true }));
  };

  const pauseGame = () => {
    setGameState(prev => ({ ...prev, isPlaying: false }));
  };

  const resetGame = () => {
    setGameState({
      money: 1000,
      energy: 100,
      level: 1,
      score: 0,
      isPlaying: false
    });
  };

  const updateMoney = (amount) => {
    setGameState(prev => ({
      ...prev,
      money: Math.max(0, prev.money + amount),
      score: prev.score + Math.abs(amount)
    }));
  };

  const updateEnergy = (amount) => {
    setGameState(prev => ({
      ...prev,
      energy: Math.max(0, Math.min(100, prev.energy + amount))
    }));
  };

  return (
    <div className="App">
      <GameHeader 
        level={gameState.level}
        score={gameState.score}
      />
      
      <main className="game-main">
        <GameBoard 
          gameState={gameState}
          gameData={gameData}
          onMoneyUpdate={updateMoney}
          onEnergyUpdate={updateEnergy}
        />
        
        <div className="game-sidebar">
          <GameStats 
            money={gameState.money}
            energy={gameState.energy}
            level={gameState.level}
          />
          
          <GameControls 
            isPlaying={gameState.isPlaying}
            onStart={startGame}
            onPause={pauseGame}
            onReset={resetGame}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
