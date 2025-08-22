import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import PlayerLogin from './components/PlayerLogin';
import RoomSelection from './components/RoomSelection';
import RoomSetup from './components/RoomSetup';
import GameBoardRefactored from './components/GameBoardRefactored';
import RatingsPage from './components/RatingsPage';
import { useLogout } from './hooks/useLogout';

// Создаем темную тему
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#9C27B0',
    },
    secondary: {
      main: '#FF9800',
    },
    background: {
      default: '#1a1a2e',
      paper: '#16213e',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

function App() {
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const { logout } = useLogout();

  const handlePlayerLogin = (playerData) => {
    console.log('🔄 [App] Player logged in:', playerData);
    setCurrentPlayer(playerData);
  };

  const handleRoomSetup = (roomData) => {
    console.log('🔄 [App] Room setup completed:', roomData);
    setCurrentRoom(roomData);
    // Перенаправляем на страницу настройки комнаты
    window.location.href = `/room/${roomData.roomId}`;
  };

  const handleExitGame = () => {
    console.log('🔄 [App] Exiting game');
    setCurrentRoom(null);
    setCurrentPlayer(null);
  };

  const handleExitToMenu = () => {
    console.log('🔄 [App] Exiting to menu');
    setCurrentRoom(null);
  };

  const handleLogout = () => {
    console.log('🔄 [App] Logging out');
    logout();
    setCurrentPlayer(null);
    setCurrentRoom(null);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Главная страница - вход игрока */}
          <Route 
            path="/" 
            element={
              currentPlayer ? (
                <Navigate to="/menu" replace />
              ) : (
                <PlayerLogin onLogin={handlePlayerLogin} />
              )
            } 
          />

          {/* Меню - выбор комнаты */}
          <Route 
            path="/menu" 
            element={
              currentPlayer ? (
                <RoomSelection 
                  playerData={currentPlayer}
                  onRoomSelect={handleRoomSetup}
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />

          {/* Настройка комнаты */}
          <Route 
            path="/room/:roomId" 
            element={
              currentPlayer && currentRoom ? (
                <RoomSetup 
                  user={currentPlayer}
                  roomId={currentRoom.roomId}
                  onSetupComplete={handleRoomSetup}
                  onBack={() => setCurrentRoom(null)}
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />

          {/* Игровая доска */}
          <Route 
            path="/game/:roomId" 
            element={
              currentPlayer && currentRoom ? (
                <GameBoardRefactored 
                  roomId={currentRoom.roomId}
                  onExit={handleExitToMenu}
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
              currentPlayer ? (
                <RatingsPage />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />

          {/* Редирект для несуществующих маршрутов */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
