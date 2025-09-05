import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>🎮 Energy of Money</h1>
        <p>Добро пожаловать в игру!</p>
        <button 
          className="App-button"
          onClick={() => alert('Кнопка нажата! Игра работает!')}
        >
          Начать игру
        </button>
      </header>
    </div>
  );
}

export default App;