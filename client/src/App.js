import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import SimpleAuth from './components/SimpleAuth';
import SimpleRoomSelection from './components/SimpleRoomSelection';
import RoomSetupWrapper from './components/RoomSetupWrapper';
import GameBoardWrapper from './components/GameBoardWrapper';
import RatingsPage from './components/RatingsPage';
import { useLogout } from './hooks/useLogout';
import './styles/global-fixes.css';
// import './websocket-fix.js'; // Временно отключено для отладки

// Компонент-обертка для использования useNavigate
function AppContent() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => {
    // Восстанавливаем пользователя из localStorage
    const savedUser = localStorage.getItem('potok-deneg_currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [currentRoom, setCurrentRoom] = useState(() => {
    // Восстанавливаем комнату из localStorage
          const savedRoom = localStorage.getItem('potok-deneg_currentRoom');
    return savedRoom ? JSON.parse(savedRoom) : null;
  });
  const { logout } = useLogout();

  // Сохраняем состояние в localStorage при изменении
  useEffect(() => {
    if (currentUser) {
              localStorage.setItem('potok-deneg_currentUser', JSON.stringify(currentUser));
    } else {
              localStorage.removeItem('potok-deneg_currentUser');
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentRoom) {
              localStorage.setItem('potok-deneg_currentRoom', JSON.stringify(currentRoom));
    } else {
              localStorage.removeItem('potok-deneg_currentRoom');
    }
  }, [currentRoom]);

  // Обработка регистрации нового пользователя
  const handleUserRegister = (userData) => {
    console.log('🔄 [App] User registered:', userData);
    
    // Устанавливаем пользователя без автоматического назначения профессии
    setCurrentUser(userData);
    navigate('/rooms');
  };

  // Обработка входа пользователя
  const handleUserLogin = (userData) => {
    console.log('🔄 [App] User logged in:', userData);
    
    // Устанавливаем пользователя без автоматического назначения профессии
    setCurrentUser(userData);
    navigate('/rooms');
  };

  const handleRoomSetup = (roomData) => {
    console.log('🔄 [App] Room setup completed:', roomData);
    // Устанавливаем currentRoom с правильной структурой
    const roomInfo = {
      roomId: roomData.roomId || roomData.id,
      displayName: roomData.displayName,
      maxPlayers: roomData.maxPlayers || 2,
      status: roomData.status || 'waiting'
    };
    console.log('🔄 [App] Setting currentRoom from setup:', roomInfo);
    setCurrentRoom(roomInfo);
    navigate(`/room/${roomInfo.roomId}`);
  };

  const handleRoomSelect = (roomData) => {
    console.log('🔄 [App] Room selected:', roomData);
    // Устанавливаем currentRoom с правильной структурой
    const roomInfo = {
      roomId: roomData.roomId || roomData.id,
      displayName: roomData.displayName,
      maxPlayers: roomData.maxPlayers || 2,
      status: roomData.status || 'waiting'
    };
    console.log('🔄 [App] Setting currentRoom:', roomInfo);
    setCurrentRoom(roomInfo);
    navigate(`/room/${roomInfo.roomId}`);
  };

  const handleExitGame = () => {
    console.log('🔄 [App] Exiting game');
    setCurrentRoom(null);
    navigate('/rooms');
  };

  const handleLogout = () => {
    console.log('🔄 [App] Logging out');
    setCurrentUser(null);
    setCurrentRoom(null);
    logout();
    navigate('/');
  };

  return (
    <div className="App">
      <Routes>
        {/* Главная страница - регистрация/вход */}
        <Route 
          path="/" 
          element={
            currentUser ? (
              <Navigate to="/rooms" replace />
            ) : (
              <SimpleAuth 
                onRegister={handleUserRegister}
                onLogin={handleUserLogin}
              />
            )
          } 
        />

        {/* Страница выбора комнат */}
        <Route 
          path="/rooms" 
          element={
            currentUser ? (
              <SimpleRoomSelection 
                playerData={currentUser}
                onRoomSelect={handleRoomSelect}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />

        {/* Страница настройки комнаты */}
        <Route 
          path="/room/:roomId" 
          element={
            currentUser ? (
              <RoomSetupWrapper 
                playerData={currentUser}
                onExitGame={handleExitGame}
              />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />

        {/* Страница игровой доски */}
        <Route 
          path="/game/:roomId" 
          element={
            currentUser ? (
              <GameBoardWrapper 
                playerData={currentUser}
                currentRoom={currentRoom}
                onExitGame={handleExitGame}
              />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />

        {/* Страница рейтингов */}
        <Route 
          path="/ratings" 
          element={
            currentUser ? (
              <RatingsPage 
                playerData={currentUser}
                onBack={() => navigate('/rooms')}
              />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />

        {/* Перенаправление для неизвестных маршрутов */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

// Главный компонент приложения
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
