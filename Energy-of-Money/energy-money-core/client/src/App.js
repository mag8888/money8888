import React, { useMemo, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import Registration from './components/Registration';
import RoomSelection from './components/RoomSelection';
import RoomSetup from './components/RoomSetup';
import OriginalGameBoard from './components/OriginalGameBoard';
import ErrorBoundary from './components/ErrorBoundary';
import socket from './socket';

// 🎮 Интеграция модулей CASHFLOW
import { 
  globalGameEngine, 
  integrateWithExistingRooms,
  getGameStatistics 
} from './modules/index.js';

function AppRouter() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);

  // Загружаем сохраненного пользователя и текущую комнату (если есть)
  useEffect(() => {
    const savedUser = localStorage.getItem('energy_of_money_user');
    const savedRoom = localStorage.getItem('energy_of_money_current_room');
    
    console.log('🔍 [App] Загружаем пользователя из localStorage:', savedUser);
    console.log('🔍 [App] Загружаем текущую комнату из localStorage:', savedRoom);
    
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        console.log('✅ [App] Пользователь загружен:', parsed);
        setUser(parsed);
      } catch (error) {
        console.error('❌ [App] Ошибка парсинга пользователя:', error);
      }
    } else {
      console.log('⚠️ [App] Пользователь не найден в localStorage');
    }
    
    if (savedRoom) {
      setCurrentRoom(savedRoom);
    }
  }, []);

  const playerData = useMemo(() => {
    console.log('🔄 [App] Обновляем playerData, user:', user);
    if (!user) {
      console.log('❌ [App] playerData: null (пользователь не зарегистрирован)');
      return null; // Возвращаем null если пользователь не зарегистрирован
    }
    const data = { id: user.id, username: user.username, email: user.email };
    console.log('✅ [App] playerData создан:', data);
    return data;
  }, [user]);

  const handleRoomSelect = ({ roomId }) => {
    if (!roomId) return;
    navigate(`/room/${roomId}/setup`);
  };

  const handleRegister = (playerData) => {
    setUser(playerData);
    navigate('/'); // Переходим на страницу выбора комнат
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('energy_of_money_user');
    localStorage.removeItem('energy_of_money_player_name');
    // НЕ удаляем current_room, чтобы можно было вернуться в игру
    // localStorage.removeItem('energy_of_money_current_room');
    navigate('/register'); // Переходим на страницу регистрации
  };

  const handleReturnToGame = () => {
    if (currentRoom) {
      console.log('🔄 [App] Возвращаемся в игру, комната:', currentRoom);
      navigate(`/room/${currentRoom}/original`);
    } else {
      console.log('⚠️ [App] Нет сохраненной комнаты для возврата');
    }
  };

  const handleClearCurrentRoom = () => {
    localStorage.removeItem('energy_of_money_current_room');
    setCurrentRoom(null);
    // Также очищаем другие данные игры
    localStorage.removeItem('potok-deneg_turnOrder');
    localStorage.removeItem('potok-deneg_currentTurn');
    localStorage.removeItem('potok-deneg_gamePlayers');
    console.log('🗑️ [App] Данные игры полностью очищены');
  };

  const handleSetupComplete = ({ roomId }) => {
    if (!roomId) return;
    // Сохраняем информацию о текущей комнате
    localStorage.setItem('energy_of_money_current_room', roomId);
    setCurrentRoom(roomId);
    navigate(`/room/${roomId}/original`);
  };

  const OriginalGamePage = () => {
    const { roomId } = useParams();
    return (
      <OriginalGameBoard 
        roomId={roomId}
        playerData={playerData}
        onExit={() => {
          // Не очищаем currentRoom при выходе, чтобы игрок мог вернуться
          navigate('/');
        }}
      />
    );
  };

  return (
    <Routes>
      <Route 
        path="/register" 
        element={<Registration onRegister={handleRegister} />} 
      />
      <Route 
        path="/" 
        element={
          playerData ? (
            <div>
              {/* Кнопки выбора поля */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '20px',
                padding: '20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '15px',
                margin: '20px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
              }}>
                <button
                  onClick={() => {
                    alert('Кнопка "Поле 1" нажата!');
                    console.log('🎯 [App] Нажата кнопка "Поле 1"');
                    navigate('/room/lobby/setup');
                  }}
                  style={{
                    padding: '15px 30px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    background: 'linear-gradient(45deg, #4CAF50, #45a049)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 7px 20px rgba(0,0,0,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
                  }}
                >
                  🎯 Поле 1
                </button>
                <button
                  onClick={() => navigate('/room/lobby/original')}
                  style={{
                    padding: '15px 30px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    background: 'linear-gradient(45deg, #2196F3, #1976D2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 7px 20px rgba(0,0,0,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
                  }}
                >
                  🎮 Поле 2 (Оригинал)
                </button>
                <button
                  onClick={() => navigate('/room/lobby/original')}
                  style={{
                    padding: '15px 30px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    background: 'linear-gradient(45deg, #FF6B6B, #E53E3E)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 7px 20px rgba(0,0,0,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
                  }}
                >
                  🔄 Поле 3 (Оригинал)
                </button>
              </div>
              
              {/* Кнопка возврата в игру */}
              {currentRoom && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '20px',
                  padding: '20px',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  borderRadius: '15px',
                  margin: '20px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                }}>
                  <button
                    onClick={handleReturnToGame}
                    style={{
                      padding: '15px 30px',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      background: 'linear-gradient(45deg, #10B981, #059669)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 7px 20px rgba(0,0,0,0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
                    }}
                  >
                    🔄 Вернуться в игру (Комната: {currentRoom})
                  </button>
                  <button
                    onClick={handleClearCurrentRoom}
                    style={{
                      padding: '15px 30px',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      background: 'linear-gradient(45deg, #EF4444, #DC2626)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 7px 20px rgba(0,0,0,0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
                    }}
                  >
                    ❌ Забыть комнату
                  </button>
                </div>
              )}

              {/* Существующий компонент RoomSelection */}
              <RoomSelection playerData={playerData} onRoomSelect={handleRoomSelect} onLogout={handleLogout} />
            </div>
          ) : (
            <Registration onRegister={handleRegister} />
          )
        } 
      />
      <Route 
        path="/room/:roomId/setup" 
        element={
          playerData ? (
            <RoomSetup playerData={playerData} onRoomSetup={handleSetupComplete} />
          ) : (
            <Registration onRegister={handleRegister} />
          )
        } 
      />
      <Route 
        path="/room/:roomId/original" 
        element={
          playerData ? (
            <OriginalGamePage />
          ) : (
            <Registration onRegister={handleRegister} />
          )
        } 
      />
    </Routes>
  );
}

function App() {
  // 🎮 Инициализация игрового движка CASHFLOW
  useEffect(() => {
    console.log('🎮 [App] Инициализируем игровой движок CASHFLOW...');
    
    // Инициализируем базовые комнаты в игровом движке
    const baseRooms = [
      { roomId: 'lobby', maxPlayers: 2 }
    ];
    
    try {
      integrateWithExistingRooms(baseRooms);
      console.log('✅ [App] Игровой движок CASHFLOW инициализирован');
      
      // Логируем статистику
      const stats = getGameStatistics();
      console.log('📊 [App] Статистика игры:', stats);
    } catch (error) {
      console.error('❌ [App] Ошибка инициализации игрового движка:', error);
    }
  }, []);

  // Инициализация сокета (для наглядности логируем подключение)
  useEffect(() => {
    if (!socket) return;
    const onConnect = () => console.log('🔌 [EoM] Socket connected:', socket.id);
    socket.on('connect', onConnect);
    return () => { socket.off('connect', onConnect); };
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
