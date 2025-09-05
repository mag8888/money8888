import React from 'react';
import './App.css';

function App() {
  const handleStart = () => {
    alert('Игра запущена! 🎮');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Energy of Money</h1>
        <p>Добро пожаловать в игру!</p>
        <button 
          className="start-button"
          onClick={handleStart}
        >
          СТАРТ
        </button>
      </header>
    </div>
  );
}

export default App;
