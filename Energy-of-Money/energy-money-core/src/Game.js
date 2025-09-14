import React, { useState, useEffect } from 'react';
import './App.css';
import socket, { connectSocket, isSocketConnected } from './socket';
import GameBoard from './GameBoard';
import OriginalGameBoard from './OriginalGameBoard';
import NextJsGameBoard from './NextJsGameBoard';

function Game({ onBack, userData: initialUserData }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(!!initialUserData);
  const [userData, setUserData] = useState(initialUserData);
  const [socketOk, setSocketOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showGameBoard, setShowGameBoard] = useState(false);
  const [gameMode, setGameMode] = useState('original'); // 'original', 'modern', или 'nextjs'

  useEffect(() => {
    // Обрабатываем данные пользователя
    if (initialUserData) {
      console.log('🎮 Game loaded with user data:', initialUserData);
      setUsername(initialUserData.username || '');
      setEmail(initialUserData.email || '');
      setIsAuthenticated(true);
      setUserData(initialUserData);
      
      // Если это тестовый аккаунт, показываем дополнительную информацию
      if (initialUserData.id === 'test_user_123') {
        console.log('🧪 Test account detected - showing test user info');
      }
      
      // Не показываем игровое поле автоматически - пусть пользователь выберет режим
    }
  }, [initialUserData]);

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
    if (showGameBoard) {
      if (gameMode === 'original') {
        return <OriginalGameBoard userData={userData} onBack={handleBackToMain} />;
      } else if (gameMode === 'modern') {
        return <GameBoard userData={userData} onBack={handleBackToMain} />;
      } else if (gameMode === 'nextjs') {
        return <NextJsGameBoard userData={userData} onBack={handleBackToMain} />;
      }
    }
    
    // Показываем выбор игрового режима
    return (
      <div className="App">
        <header className="App-header">
          <h1>🎮 Выберите игровой режим</h1>
          
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '20px',
            borderRadius: '10px',
            margin: '20px 0',
            minWidth: '400px'
          }}>
            <h3>👤 Добро пожаловать, {userData.username}!</h3>
            <p>Email: {userData.email}</p>
            {userData.telegramData && (
              <p>Telegram: @{userData.telegramData.username || 'N/A'}</p>
            )}
            {userData.id === 'test_user_123' && (
              <p style={{ color: '#ff6b35', fontWeight: 'bold' }}>🧪 Тестовый аккаунт</p>
            )}
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '30px',
            borderRadius: '10px',
            margin: '20px 0',
            minWidth: '500px'
          }}>
            <h3>🎯 Выберите игровой режим</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
              <button 
                className="start-button"
                onClick={() => {
                  setGameMode('original');
                  setShowGameBoard(true);
                }}
                style={{
                  background: 'linear-gradient(45deg, #4CAF50, #45a049)',
                  width: '100%',
                  padding: '20px',
                  fontSize: '18px'
                }}
              >
                🏛️ ОРИГИНАЛЬНОЕ ИГРОВОЕ ПОЛЕ
                <div style={{ fontSize: '14px', opacity: 0.8, marginTop: '5px' }}>
                  Классическая версия с оригинальными правилами и балансом
                </div>
              </button>
              
              <button 
                className="start-button"
                onClick={() => {
                  setGameMode('modern');
                  setShowGameBoard(true);
                }}
                style={{
                  background: 'linear-gradient(45deg, #2196F3, #1976D2)',
                  width: '100%',
                  padding: '20px',
                  fontSize: '18px'
                }}
              >
                🚀 СОВРЕМЕННОЕ ИГРОВОЕ ПОЛЕ
                <div style={{ fontSize: '14px', opacity: 0.8, marginTop: '5px' }}>
                  Улучшенная версия с новыми функциями и балансом
                </div>
              </button>

              <button 
                className="start-button"
                onClick={() => {
                  setGameMode('nextjs');
                  setShowGameBoard(true);
                }}
                style={{
                  background: 'linear-gradient(45deg, #9C27B0, #7B1FA2)',
                  width: '100%',
                  padding: '20px',
                  fontSize: '18px'
                }}
              >
                🌟 ПОЛНАЯ ИГРОВАЯ ДОСКА
                <div style={{ fontSize: '14px', opacity: 0.8, marginTop: '5px' }}>
                  24 внутренних + 52 внешних клетки (Next.js версия)
                </div>
              </button>
            </div>
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
