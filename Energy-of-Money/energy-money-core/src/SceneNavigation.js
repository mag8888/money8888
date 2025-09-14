import React, { useState } from 'react';
import './App.css';

function SceneNavigation({ currentScene, onSceneChange }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const scenes = [
    { id: 'auth', name: '🔐 Авторизация', description: 'Вход в систему', color: '#f44336', shortcut: 'A' },
    { id: 'lobby', name: '🏠 Лобби', description: 'Главное меню', color: '#4CAF50', shortcut: 'L' },
    { id: 'game', name: '🎮 Игра', description: 'Игровой процесс', color: '#2196F3', shortcut: 'G' },
    { id: 'profile', name: '👤 Профиль', description: 'Настройки пользователя', color: '#9C27B0', shortcut: 'P' },
    { id: 'shop', name: '🛒 Магазин', description: 'Покупки и товары', color: '#FF9800', shortcut: 'S' },
    { id: 'leaderboard', name: '🏆 Рейтинг', description: 'Таблица лидеров', color: '#FFD700', shortcut: 'R' },
    { id: 'settings', name: '⚙️ Настройки', description: 'Конфигурация', color: '#607D8B', shortcut: 'C' },
    { id: 'help', name: '❓ Помощь', description: 'Справка и FAQ', color: '#E91E63', shortcut: 'H' }
  ];

  // Быстрые действия для главных сцен
  const quickActions = [
    { id: 'auth', name: '🔐', tooltip: 'Авторизация (A)', color: '#f44336' },
    { id: 'lobby', name: '🏠', tooltip: 'Лобби (L)', color: '#4CAF50' },
    { id: 'game', name: '🎮', tooltip: 'Игра (G)', color: '#2196F3' },
    { id: 'profile', name: '👤', tooltip: 'Профиль (P)', color: '#9C27B0' }
  ];

  // Обработка горячих клавиш
  React.useEffect(() => {
    const handleKeyPress = (e) => {
      const key = e.key.toUpperCase();
      const scene = scenes.find(s => s.shortcut === key);
      if (scene && !e.ctrlKey && !e.altKey && !e.metaKey) {
        onSceneChange(scene.id);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [scenes, onSceneChange]);

  return (
    <>
      {/* Кнопки быстрого вызова */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.9)',
        padding: '10px',
        borderRadius: '10px',
        zIndex: 1001,
        display: 'flex',
        gap: '8px',
        alignItems: 'center'
      }}>
        {quickActions.map(action => (
          <button
            key={action.id}
            onClick={() => onSceneChange(action.id)}
            title={action.tooltip}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: 'none',
              background: currentScene === action.id 
                ? `linear-gradient(45deg, ${action.color}, ${action.color}dd)` 
                : `linear-gradient(45deg, ${action.color}66, ${action.color}33)`,
              color: '#fff',
              cursor: 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              boxShadow: currentScene === action.id ? `0 0 15px ${action.color}66` : 'none',
              transform: currentScene === action.id ? 'scale(1.1)' : 'scale(1)'
            }}
            onMouseEnter={(e) => {
              if (currentScene !== action.id) {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = `0 0 10px ${action.color}44`;
              }
            }}
            onMouseLeave={(e) => {
              if (currentScene !== action.id) {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = 'none';
              }
            }}
          >
            {action.name}
          </button>
        ))}
        
        {/* Кнопка развернуть/свернуть полное меню */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            border: 'none',
            background: 'linear-gradient(45deg, #666, #888)',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: '5px',
            transition: 'all 0.3s ease'
          }}
          title={isExpanded ? 'Свернуть меню' : 'Развернуть меню'}
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      {/* Полное меню навигации */}
      {isExpanded && (
        <div style={{
          position: 'fixed',
          top: '70px',
          right: '10px',
          background: 'rgba(0, 0, 0, 0.9)',
          padding: '15px',
          borderRadius: '10px',
          zIndex: 1000,
          maxWidth: '320px',
          maxHeight: '70vh',
          overflowY: 'auto',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <h4 style={{ 
            color: '#fff', 
            margin: '0 0 15px 0', 
            fontSize: '16px',
            textAlign: 'center'
          }}>
            🎭 Полная навигация
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {scenes.map(scene => (
              <button
                key={scene.id}
                onClick={() => {
                  onSceneChange(scene.id);
                  setIsExpanded(false);
                }}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: currentScene === scene.id 
                    ? `linear-gradient(45deg, ${scene.color}, ${scene.color}dd)` 
                    : 'linear-gradient(45deg, #333, #555)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '13px',
                  textAlign: 'left',
                  transition: 'all 0.3s ease',
                  opacity: currentScene === scene.id ? 1 : 0.8,
                  borderLeft: `4px solid ${scene.color}`,
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (currentScene !== scene.id) {
                    e.target.style.background = `linear-gradient(45deg, ${scene.color}44, ${scene.color}22)`;
                    e.target.style.opacity = '1';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentScene !== scene.id) {
                    e.target.style.background = 'linear-gradient(45deg, #333, #555)';
                    e.target.style.opacity = '0.8';
                  }
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{scene.name}</div>
                    <div style={{ fontSize: '11px', opacity: 0.8 }}>{scene.description}</div>
                  </div>
                  <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '4px',
                    padding: '2px 6px',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }}>
                    {scene.shortcut}
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          <div style={{ 
            marginTop: '15px', 
            padding: '12px', 
            background: 'rgba(255,255,255,0.1)', 
            borderRadius: '8px',
            fontSize: '11px',
            color: '#ccc'
          }}>
            <div><strong>Текущая сцена:</strong> {currentScene}</div>
            <div style={{ marginTop: '5px' }}>
              <strong>Статус:</strong> {currentScene === 'auth' ? 'Авторизация' : 
                                       currentScene === 'lobby' ? 'В лобби' : 
                                       currentScene === 'game' ? 'В игре' : 'Активна'}
            </div>
            <div style={{ marginTop: '8px', fontSize: '10px', opacity: 0.7 }}>
              💡 Используйте горячие клавиши для быстрого перехода
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SceneNavigation;
