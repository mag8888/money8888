import React from 'react';
import './App.css';

function SceneNavigation({ currentScene, onSceneChange }) {
  const scenes = [
    { id: 'auth', name: '🔐 Авторизация', description: 'Вход в систему' },
    { id: 'lobby', name: '🏠 Лобби', description: 'Главное меню' },
    { id: 'game', name: '🎮 Игра', description: 'Игровой процесс' },
    { id: 'profile', name: '👤 Профиль', description: 'Настройки пользователя' },
    { id: 'shop', name: '🛒 Магазин', description: 'Покупки и товары' },
    { id: 'leaderboard', name: '🏆 Рейтинг', description: 'Таблица лидеров' },
    { id: 'settings', name: '⚙️ Настройки', description: 'Конфигурация' },
    { id: 'help', name: '❓ Помощь', description: 'Справка и FAQ' }
  ];

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.8)',
      padding: '15px',
      borderRadius: '10px',
      zIndex: 1000,
      maxWidth: '300px',
      maxHeight: '80vh',
      overflowY: 'auto'
    }}>
      <h4 style={{ 
        color: '#fff', 
        margin: '0 0 15px 0', 
        fontSize: '16px',
        textAlign: 'center'
      }}>
        🎭 Навигация по сценам
      </h4>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {scenes.map(scene => (
          <button
            key={scene.id}
            onClick={() => onSceneChange(scene.id)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: 'none',
              background: currentScene === scene.id 
                ? 'linear-gradient(45deg, #4CAF50, #45a049)' 
                : 'linear-gradient(45deg, #333, #555)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '12px',
              textAlign: 'left',
              transition: 'all 0.3s ease',
              opacity: currentScene === scene.id ? 1 : 0.7
            }}
            onMouseEnter={(e) => {
              if (currentScene !== scene.id) {
                e.target.style.background = 'linear-gradient(45deg, #555, #777)';
                e.target.style.opacity = '1';
              }
            }}
            onMouseLeave={(e) => {
              if (currentScene !== scene.id) {
                e.target.style.background = 'linear-gradient(45deg, #333, #555)';
                e.target.style.opacity = '0.7';
              }
            }}
          >
            <div style={{ fontWeight: 'bold' }}>{scene.name}</div>
            <div style={{ fontSize: '10px', opacity: 0.8 }}>{scene.description}</div>
          </button>
        ))}
      </div>
      
      <div style={{ 
        marginTop: '15px', 
        padding: '10px', 
        background: 'rgba(255,255,255,0.1)', 
        borderRadius: '6px',
        fontSize: '11px',
        color: '#ccc'
      }}>
        <div><strong>Текущая сцена:</strong> {currentScene}</div>
        <div style={{ marginTop: '5px' }}>
          <strong>Статус:</strong> {currentScene === 'auth' ? 'Авторизация' : 
                                   currentScene === 'lobby' ? 'В лобби' : 
                                   currentScene === 'game' ? 'В игре' : 'Активна'}
        </div>
      </div>
    </div>
  );
}

export default SceneNavigation;
