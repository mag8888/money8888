import React, { useEffect, useState } from 'react';
import './App.css';
import socket, { connectSocket, isSocketConnected } from './socket';
import Game from './Game';
import TelegramAuth from './TelegramAuth';

function App() {
  const [health, setHealth] = useState(null);
  const [socketOk, setSocketOk] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        // Пробуем подключить сокет (same-origin)
        await connectSocket();
        setSocketOk(true);
      } catch (e) {
        setSocketOk(false);
      }
    })();

    const onConnect = () => setSocketOk(true);
    const onDisconnect = () => setSocketOk(false);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  const handleStart = async () => {
    try {
      console.log('🚀 Starting authentication process...');
      // Проверяем health endpoint
      const res = await fetch('/health');
      const json = await res.json();
      setHealth(json.status || 'OK');
      
      if (json.status === 'OK') {
        // Если сервер работает, переходим к авторизации
        console.log('✅ Server is healthy, showing auth screen');
        setShowAuth(true);
      }
    } catch (e) {
      setHealth('ERROR');
      alert('Не удалось связаться с сервером ❌');
      console.error('Health check failed:', e);
    }
  };

  const handleBackToMain = () => {
    setShowGame(false);
    setShowAuth(false);
    setHealth(null);
    setUserData(null);
  };

  const handleAuthSuccess = (authUserData) => {
    setUserData(authUserData);
    setShowAuth(false);
    setShowGame(true);
  };

  if (showAuth) {
    return <TelegramAuth onAuthSuccess={handleAuthSuccess} />;
  }

  if (showGame) {
    return <Game onBack={handleBackToMain} userData={userData} />;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Energy of Money</h1>
        <p>Добро пожаловать! Тестовая старт‑страница.</p>
        <p style={{color:'#fff', opacity:0.9, marginTop: '-10px'}}>
          Socket: {socketOk ? '✅ подключен' : '❌ нет подключения'}{health ? ` • Health: ${health}` : ''}
        </p>
        <button 
          className="start-button"
          onClick={handleStart}
          disabled={!socketOk}
        >
          {socketOk ? 'СТАРТ' : 'Ожидание подключения...'}
        </button>
      </header>
    </div>
  );
}

export default App;
