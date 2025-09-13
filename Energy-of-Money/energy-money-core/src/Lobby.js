import React from 'react';
import './App.css';

function Lobby({ userData, onStartGame }) {
  return (
    <div className="App">
      <header className="App-header">
        <h1>🏠 Лобби</h1>
        
        {userData && (
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '20px',
            borderRadius: '10px',
            margin: '20px 0',
            minWidth: '300px'
          }}>
            <h2>👤 Добро пожаловать, {userData.username}!</h2>
            <p>Email: {userData.email}</p>
            {userData.telegramData && (
              <p>Telegram: @{userData.telegramData.username || 'N/A'}</p>
            )}
            {userData.id === 'test_user_123' && (
              <p style={{ color: '#ff6b35', fontWeight: 'bold' }}>🧪 Тестовый аккаунт</p>
            )}
          </div>
        )}

        <div style={{
          background: 'rgba(255,255,255,0.1)',
          padding: '30px',
          borderRadius: '10px',
          margin: '20px 0',
          minWidth: '400px'
        }}>
          <h3>🎮 Доступные действия</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
            <button 
              className="start-button"
              onClick={() => onStartGame && onStartGame()}
              style={{
                background: 'linear-gradient(45deg, #4CAF50, #45a049)',
                width: '100%'
              }}
            >
              🎯 Начать игру
            </button>
            
            <button 
              className="start-button"
              style={{
                background: 'linear-gradient(45deg, #2196F3, #1976D2)',
                width: '100%'
              }}
            >
              👥 Мультиплеер
            </button>
            
            <button 
              className="start-button"
              style={{
                background: 'linear-gradient(45deg, #FF9800, #F57C00)',
                width: '100%'
              }}
            >
              🏆 Рейтинг
            </button>
            
            <button 
              className="start-button"
              style={{
                background: 'linear-gradient(45deg, #9C27B0, #7B1FA2)',
                width: '100%'
              }}
            >
              🛒 Магазин
            </button>
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          padding: '20px',
          borderRadius: '10px',
          margin: '20px 0',
          minWidth: '400px'
        }}>
          <h4>📊 Статистика</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
            <div>💰 Баланс: 10$</div>
            <div>🎯 Игры: 0</div>
            <div>🏆 Победы: 0</div>
            <div>👥 Рефералы: 0</div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default Lobby;
