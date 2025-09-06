import React, { useEffect, useState } from 'react';
import './App.css';
import socket, { connectSocket, isSocketConnected } from './socket';

function App() {
  const [health, setHealth] = useState(null);
  const [socketOk, setSocketOk] = useState(false);

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
      const res = await fetch('/health');
      const json = await res.json();
      setHealth(json.status || 'OK');
      alert(`Сервер доступен: ${json.status || 'OK'} ✅`);
    } catch (e) {
      setHealth('ERROR');
      alert('Не удалось связаться с сервером ❌');
    }
  };

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
        >
          СТАРТ
        </button>
      </header>
    </div>
  );
}

export default App;
