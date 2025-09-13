import React, { useState, useEffect } from 'react';
import './App.css';
import socket, { connectSocket, isSocketConnected } from './socket';

function Game({ onBack, userData: initialUserData }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(!!initialUserData);
  const [userData, setUserData] = useState(initialUserData);
  const [socketOk, setSocketOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Проверяем подключение к сокету
    const checkSocket = async () => {
      try {
        await connectSocket();
        setSocketOk(true);
      } catch (e) {
        setSocketOk(false);
        setError('Ошибка подключения к серверу');
      }
    };

    checkSocket();

    const onConnect = () => setSocketOk(true);
    const onDisconnect = () => setSocketOk(false);
    
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  const handleAuthentication = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Отправляем данные на сервер через socket
      socket.emit('authenticateUser', username, email, '', (response) => {
        setLoading(false);
        
        if (response.success) {
          setIsAuthenticated(true);
          setUserData(response.userData);
          
          if (response.isLogin) {
            alert(`Добро пожаловать обратно, ${response.userData.username}!`);
          } else {
            alert(`Добро пожаловать в игру, ${response.userData.username}!`);
          }
        } else {
          setError(response.error || 'Ошибка аутентификации');
        }
      });
    } catch (error) {
      setLoading(false);
      setError('Ошибка подключения к серверу');
      console.error('Authentication error:', error);
    }
  };

  const handleBackToMain = () => {
    if (onBack) {
      onBack();
    } else {
      setIsAuthenticated(false);
      setUserData(null);
      setUsername('');
      setEmail('');
      setError('');
    }
  };

  if (isAuthenticated && userData) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>🎮 Energy of Money - Игра</h1>
          <div style={{ 
            background: 'rgba(255,255,255,0.1)', 
            padding: '20px', 
            borderRadius: '10px',
            margin: '20px 0'
          }}>
            <h2>Добро пожаловать, {userData.username}!</h2>
            <p>Email: {userData.email}</p>
            <p>ID: {userData.id}</p>
            <p style={{color: socketOk ? '#4CAF50' : '#f44336'}}>
              Socket: {socketOk ? '✅ подключен' : '❌ нет подключения'}
            </p>
          </div>
          
          <div style={{ margin: '20px 0' }}>
            <button 
              className="start-button"
              onClick={() => alert('🎲 Игровая логика будет добавлена позже!')}
              style={{ margin: '10px' }}
            >
              🎲 Начать игру
            </button>
            <button 
              className="start-button"
              onClick={handleBackToMain}
              style={{ margin: '10px', background: '#666' }}
            >
              ← Назад
            </button>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎮 Energy of Money - Регистрация</h1>
        <p>Войдите в игру или зарегистрируйтесь</p>
        
        <div style={{ 
          background: 'rgba(255,255,255,0.1)', 
          padding: '30px', 
          borderRadius: '10px',
          margin: '20px 0',
          minWidth: '300px'
        }}>
          <form onSubmit={handleAuthentication}>
            <div style={{ margin: '15px 0' }}>
              <input
                type="text"
                placeholder="Имя пользователя"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #ccc',
                  fontSize: '16px'
                }}
              />
            </div>
            
            <div style={{ margin: '15px 0' }}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #ccc',
                  fontSize: '16px'
                }}
              />
            </div>

            {error && (
              <div style={{ 
                color: '#f44336', 
                margin: '10px 0',
                padding: '10px',
                background: 'rgba(244, 67, 54, 0.1)',
                borderRadius: '5px'
              }}>
                {error}
              </div>
            )}

            <button 
              type="submit"
              className="start-button"
              disabled={loading}
              style={{ width: '100%', marginTop: '10px' }}
            >
              {loading ? '⏳ Подключение...' : '🚀 Войти в игру'}
            </button>
          </form>
        </div>

        <div style={{ margin: '20px 0' }}>
          <p style={{color: socketOk ? '#4CAF50' : '#f44336'}}>
            Socket: {socketOk ? '✅ подключен' : '❌ нет подключения'}
          </p>
        </div>

        <button 
          className="start-button"
          onClick={handleBackToMain}
          style={{ background: '#666' }}
        >
          ← Назад к главной
        </button>
      </header>
    </div>
  );
}

export default Game;
