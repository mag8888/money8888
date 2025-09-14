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
  const [showGame, setShowGame] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [showLobby, setShowLobby] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [userData, setUserData] = useState({
    id: 'test_user_123',
    username: 'TestPlayer',
    email: 'test@example.com',
    telegramData: { username: 'testuser' }
  });
  const [currentScene, setCurrentScene] = useState('game');

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
    setShowLobby(false);
    setShowProfile(false);
    setShowShop(false);
    setShowLeaderboard(false);
    setShowSettings(false);
    setShowHelp(false);
    setHealth(null);
    setUserData(null);
    setCurrentScene('lobby');
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
    
    // Сброс всех состояний
    setShowAuth(false);
    setShowGame(false);
    setShowLobby(false);
    setShowProfile(false);
    setShowShop(false);
    setShowLeaderboard(false);
    setShowSettings(false);
    setShowHelp(false);
    
    switch(sceneId) {
      case 'auth':
        setShowAuth(true);
        break;
      case 'lobby':
        setShowLobby(true);
        break;
      case 'game':
        setShowGame(true);
        break;
      case 'profile':
        setShowProfile(true);
        break;
      case 'shop':
        setShowShop(true);
        break;
      case 'leaderboard':
        setShowLeaderboard(true);
        break;
      case 'settings':
        setShowSettings(true);
        break;
      case 'help':
        setShowHelp(true);
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

  if (showProfile) {
    return (
      <>
        <SceneNavigation currentScene={currentScene} onSceneChange={handleSceneChange} />
        <div className="App">
          <header className="App-header">
            <h1>👤 Профиль пользователя</h1>
            {userData && (
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                padding: '20px',
                borderRadius: '10px',
                margin: '20px 0',
                minWidth: '400px'
              }}>
                <h3>Информация о пользователе</h3>
                <p><strong>Имя:</strong> {userData.username}</p>
                <p><strong>Email:</strong> {userData.email}</p>
                {userData.telegramData && (
                  <p><strong>Telegram:</strong> @{userData.telegramData.username || 'N/A'}</p>
                )}
                <p><strong>ID:</strong> {userData.id}</p>
              </div>
            )}
            <button className="start-button" onClick={() => handleSceneChange('lobby')}>
              ← Назад в лобби
            </button>
          </header>
        </div>
      </>
    );
  }

  if (showShop) {
    return (
      <>
        <SceneNavigation currentScene={currentScene} onSceneChange={handleSceneChange} />
        <div className="App">
          <header className="App-header">
            <h1>🛒 Магазин</h1>
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '20px',
              borderRadius: '10px',
              margin: '20px 0',
              minWidth: '400px'
            }}>
              <h3>Товары и услуги</h3>
              <p>🛍️ Магазин пока в разработке...</p>
              <p>Здесь будут доступны покупки и улучшения для игры</p>
            </div>
            <button className="start-button" onClick={() => handleSceneChange('lobby')}>
              ← Назад в лобби
            </button>
          </header>
        </div>
      </>
    );
  }

  if (showLeaderboard) {
    return (
      <>
        <SceneNavigation currentScene={currentScene} onSceneChange={handleSceneChange} />
        <div className="App">
          <header className="App-header">
            <h1>🏆 Рейтинг игроков</h1>
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '20px',
              borderRadius: '10px',
              margin: '20px 0',
              minWidth: '400px'
            }}>
              <h3>Таблица лидеров</h3>
              <p>🏅 Рейтинг пока в разработке...</p>
              <p>Здесь будет отображаться рейтинг лучших игроков</p>
            </div>
            <button className="start-button" onClick={() => handleSceneChange('lobby')}>
              ← Назад в лобби
            </button>
          </header>
        </div>
      </>
    );
  }

  if (showSettings) {
    return (
      <>
        <SceneNavigation currentScene={currentScene} onSceneChange={handleSceneChange} />
        <div className="App">
          <header className="App-header">
            <h1>⚙️ Настройки</h1>
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '20px',
              borderRadius: '10px',
              margin: '20px 0',
              minWidth: '400px'
            }}>
              <h3>Конфигурация игры</h3>
              <p>🔧 Настройки пока в разработке...</p>
              <p>Здесь будут доступны настройки звука, графики и других параметров</p>
            </div>
            <button className="start-button" onClick={() => handleSceneChange('lobby')}>
              ← Назад в лобби
            </button>
          </header>
        </div>
      </>
    );
  }

  if (showHelp) {
    return (
      <>
        <SceneNavigation currentScene={currentScene} onSceneChange={handleSceneChange} />
        <div className="App">
          <header className="App-header">
            <h1>❓ Помощь и FAQ</h1>
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '20px',
              borderRadius: '10px',
              margin: '20px 0',
              minWidth: '400px',
              textAlign: 'left'
            }}>
              <h3>🎮 Как играть</h3>
              <ul style={{ textAlign: 'left', paddingLeft: '20px' }}>
                <li>🎲 Бросайте кубик и перемещайтесь по игровому полю</li>
                <li>💰 Зарабатывайте деньги на ячейках дохода</li>
                <li>💸 Тратьте деньги на ячейках расходов</li>
                <li>🏆 Старайтесь достичь финансовой свободы</li>
              </ul>
              
              <h3>⌨️ Горячие клавиши</h3>
              <ul style={{ textAlign: 'left', paddingLeft: '20px' }}>
                <li><strong>A</strong> - Авторизация</li>
                <li><strong>L</strong> - Лобби</li>
                <li><strong>G</strong> - Игра</li>
                <li><strong>P</strong> - Профиль</li>
                <li><strong>S</strong> - Магазин</li>
                <li><strong>R</strong> - Рейтинг</li>
                <li><strong>C</strong> - Настройки</li>
                <li><strong>H</strong> - Помощь</li>
              </ul>
            </div>
            <button className="start-button" onClick={() => handleSceneChange('lobby')}>
              ← Назад в лобби
            </button>
          </header>
        </div>
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
