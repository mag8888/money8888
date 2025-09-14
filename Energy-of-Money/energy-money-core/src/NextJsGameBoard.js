import React, { useState, useEffect } from 'react';
import './App.css';

function NextJsGameBoard({ userData, onBack }) {
  const [isLoading, setIsLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [rooms, setRooms] = useState(0);
  const [currentRoom, setCurrentRoom] = useState('none');

  useEffect(() => {
    // Симуляция загрузки
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Подключение к Socket.IO
    const socket = require('./socket').default;
    
    if (socket.connected) {
      setConnected(true);
    }

    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('rooms', (roomData) => {
      setRooms(roomData.length || 0);
    });

    socket.on('currentRoom', (room) => {
      setCurrentRoom(room || 'none');
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('rooms');
      socket.off('currentRoom');
    };
  }, []);

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(15px)',
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{ color: 'white', fontSize: '1.5rem', marginBottom: '20px' }}>
            🔄 Загрузка полной игровой доски...
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1rem' }}>
            Подготавливаем 24 внутренних + 52 внешних клетки
          </div>
        </div>
        
        {/* DEBUG PANEL */}
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
          background: connected ? 'green' : 'red',
          padding: '10px',
          borderRadius: '5px',
          color: 'white',
          fontSize: '12px'
        }}>
          <div>🔧 DEBUG PANEL</div>
          <div>Connected: {connected ? '✅' : '❌'}</div>
          <div>Rooms: {rooms}</div>
          <div>Current: {currentRoom}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(15px)',
        borderRadius: '20px',
        padding: '40px',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
      }}>
        <h1 style={{ color: 'white', textAlign: 'center', marginBottom: '30px' }}>
          🎮 Полная игровая доска
        </h1>
        
        <div style={{ color: 'white', marginBottom: '20px' }}>
          <h3>👤 Игрок: {userData?.username || 'Гость'}</h3>
          <p>📊 Статус подключения: {connected ? 'Подключен' : 'Отключен'}</p>
          <p>🏠 Комнат: {rooms}</p>
          <p>📍 Текущая комната: {currentRoom}</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '15px',
          marginBottom: '30px'
        }}>
          {/* Здесь будет игровая доска */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            padding: '20px',
            textAlign: 'center',
            color: 'white'
          }}>
            🎯 Игровая доска будет здесь
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button 
            onClick={onBack}
            style={{
              background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '25px',
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
            }}
          >
            ← Назад
          </button>
        </div>
      </div>

      {/* DEBUG PANEL */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
        background: connected ? 'green' : 'red',
        padding: '10px',
        borderRadius: '5px',
        color: 'white',
        fontSize: '12px'
      }}>
        <div>🔧 DEBUG PANEL</div>
        <div>Connected: {connected ? '✅' : '❌'}</div>
        <div>Rooms: {rooms}</div>
        <div>Current: {currentRoom}</div>
      </div>
    </div>
  );
}

export default NextJsGameBoard;
