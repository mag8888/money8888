import React, { useEffect, useState } from 'react';
import './App.css';
import socket, { connectSocket, isSocketConnected } from './socket';
import Game from './Game';
import TelegramAuth from './TelegramAuth';
import SceneNavigation from './SceneNavigation';
import Lobby from './Lobby';

function App() {
  const [health, setHealth] = useState(null);
  const [socketOk, setSocketOk] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showLobby, setShowLobby] = useState(false);
  const [userData, setUserData] = useState(null);
  const [currentScene, setCurrentScene] = useState('lobby');

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
        setCurrentScene('auth');
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
    setShowGame(false);
    setShowLobby(true);
    setCurrentScene('lobby');
  };

  const handleSceneChange = (sceneId) => {
    console.log('🎭 Changing scene to:', sceneId);
    setCurrentScene(sceneId);
    
    switch(sceneId) {
      case 'auth':
        setShowAuth(true);
        setShowGame(false);
        setShowLobby(false);
        break;
      case 'lobby':
        setShowAuth(false);
        setShowGame(false);
        setShowLobby(true);
        break;
      case 'game':
        setShowAuth(false);
        setShowGame(true);
        setShowLobby(false);
        break;
      default:
        console.log('🎭 Scene not implemented yet:', sceneId);
        break;
    }
  };

  if (showAuth) {
    return (
      <>
        <SceneNavigation currentScene={currentScene} onSceneChange={handleSceneChange} />
        <TelegramAuth onAuthSuccess={handleAuthSuccess} />
      </>
    );
  }

  if (showLobby) {
    return (
      <>
        <SceneNavigation currentScene={currentScene} onSceneChange={handleSceneChange} />
        <Lobby userData={userData} onStartGame={() => handleSceneChange('game')} />
      </>
    );
  }

  if (showGame) {
    return (
      <>
        <SceneNavigation currentScene={currentScene} onSceneChange={handleSceneChange} />
        <Game onBack={handleBackToMain} userData={userData} />
      </>
    );
  }

  return (
    <>
      <SceneNavigation currentScene={currentScene} onSceneChange={handleSceneChange} />
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
    </>
  );
}

export default App;
