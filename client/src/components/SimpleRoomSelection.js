import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../socket';

const SimpleRoomSelection = ({ playerData, onRoomSelect, onLogout }) => {
  const [roomId, setRoomId] = useState('');
  const [roomName, setRoomName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [availableRooms, setAvailableRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [roomCounter, setRoomCounter] = useState(1);
  const navigate = useNavigate();

  // Генерация уникального ID комнаты
  const generateRoomId = () => {
    const timestamp = Date.now().toString().slice(-6);
    const newId = `room${roomCounter}_${timestamp}`;
    setRoomId(newId);
    setRoomCounter(prev => prev + 1);
  };

  // Генерируем ID комнаты при загрузке компонента
  useEffect(() => {
    generateRoomId();
  }, []);

  // Получаем список доступных комнат с сервера
  useEffect(() => {
    setRoomsLoading(true);

    // Слушаем обновления списка комнат
    socket.on('roomsList', (roomsList) => {
      console.log('🏠 [SimpleRoomSelection] Received rooms list:', roomsList);
      
      // Проверяем и фильтруем данные комнат
      let validRooms = [];
      if (Array.isArray(roomsList)) {
        validRooms = roomsList.filter(room => {
          if (!room || typeof room !== 'object') {
            console.warn('🏠 [SimpleRoomSelection] Invalid room data:', room);
            return false;
          }
          // Упрощенная проверка: roomId должен существовать и не быть null/undefined
          if (room.roomId === null || room.roomId === undefined) {
            console.warn('🏠 [SimpleRoomSelection] Room missing roomId:', room);
            return false;
          }
          return true;
        });
      } else {
        console.error('🏠 [SimpleRoomSelection] roomsList is not an array:', roomsList);
        validRooms = [];
      }
      
      console.log('🏠 [SimpleRoomSelection] Valid rooms:', validRooms);
      setAvailableRooms(validRooms);
      setRoomsLoading(false);
    });

    // Слушаем событие создания комнаты
    socket.on('roomCreated', (createdRoom) => {
      console.log('✅ [SimpleRoomSelection] Room created:', createdRoom);
      setSuccess(`Комната создана! ID: ${createdRoom && createdRoom.roomId ? createdRoom.roomId : 'Unknown'}`);
      
      // Переходим к настройке созданной комнаты
      // Используем roomId от сервера, а не originalRequestedId
      if (createdRoom && createdRoom.roomId !== null && createdRoom.roomId !== undefined) {
        handleRoomSelect(createdRoom.roomId);
      } else {
        console.error('✅ [SimpleRoomSelection] Invalid createdRoom:', createdRoom);
      }
    });

    // Запрашиваем текущий список комнат
    socket.emit('getRoomsList');

    return () => {
      socket.off('roomsList');
      socket.off('roomCreated');
    };
  }, []);

  // Обработка выбора комнаты
  const handleRoomSelect = (selectedRoomId) => {
    console.log('🔄 [SimpleRoomSelection] Selected room:', selectedRoomId);
    
    // Проверяем, что selectedRoomId валиден
    if (selectedRoomId === null || selectedRoomId === undefined) {
      console.error('🔄 [SimpleRoomSelection] Invalid room ID:', selectedRoomId);
      return;
    }
    
    // Настраиваем игрока перед входом в комнату
    if (playerData) {
      console.log('👤 [SimpleRoomSelection] Setting up player:', playerData);
      socket.emit('setupPlayer', selectedRoomId, playerData);
      console.log('👤 [SimpleRoomSelection] setupPlayer emitted');
    } else {
      // Если playerData нет, создаем базовые данные
      const defaultPlayerData = {
        id: Date.now().toString(),
        username: 'Player' + Math.floor(Math.random() * 1000),
        color: '#' + Math.floor(Math.random()*16777215).toString(16)
      };
      console.log('👤 [SimpleRoomSelection] Creating default player data:', defaultPlayerData);
      socket.emit('setupPlayer', selectedRoomId, defaultPlayerData);
      console.log('👤 [SimpleRoomSelection] setupPlayer emitted with default data');
    }
    
    onRoomSelect({ roomId: selectedRoomId.toString() });
  };

  const handleCreateRoom = async () => {
    if (!roomId.trim()) {
      setError('Введите ID комнаты');
      return;
    }

    if (!roomName.trim()) {
      setError('Введите название комнаты');
      return;
    }

    setCreating(true);
    setError('');
    setSuccess('');

    try {
      // Создаем комнату на сервере
      // Сервер автоматически сгенерирует уникальный ID
      socket.emit('createRoom', roomId.trim(), 2, '', 3, roomName.trim());
      
      // Настраиваем игрока для созданной комнаты
      if (playerData) {
        console.log('👤 [SimpleRoomSelection] Setting up player for new room:', playerData);
        // Ждем немного, чтобы комната создалась
        setTimeout(() => {
          socket.emit('setupPlayer', roomId.trim(), playerData);
          console.log('👤 [SimpleRoomSelection] setupPlayer emitted for new room');
        }, 500);
      } else {
        // Если playerData нет, создаем базовые данные
        const defaultPlayerData = {
          id: Date.now().toString(),
          username: 'Player' + Math.floor(Math.random() * 1000),
          color: '#' + Math.floor(Math.random()*16777215).toString(16)
        };
        console.log('👤 [SimpleRoomSelection] Creating default player data for new room:', defaultPlayerData);
        setTimeout(() => {
          socket.emit('setupPlayer', roomId.trim(), defaultPlayerData);
          console.log('👤 [SimpleRoomSelection] setupPlayer emitted with default data for new room');
        }, 500);
      }
      
      setSuccess('Создание комнаты... Пожалуйста, подождите');
    } catch (error) {
      setError('Ошибка при создании комнаты');
    } finally {
      setCreating(false);
    }
  };

  const handleRatingsClick = () => {
    navigate('/ratings');
  };

  // Очищаем сообщения через 5 секунд
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '32px 20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '2rem', 
          color: '#1976D2', 
          marginBottom: '8px',
          margin: 0
        }}>
          🏠 Выбор комнаты
        </h1>
        <p style={{ color: '#666', fontSize: '1.1rem', margin: 0 }}>
          Создайте новую комнату или присоединитесь к существующей
        </p>
      </div>

      {/* Информация об игроке */}
      <div style={{ 
        background: 'white', 
        padding: '24px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '32px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ color: '#1976D2', fontSize: '1.2rem', marginRight: '8px' }}>👤</span>
              <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                {playerData?.username || 'Игрок'}
              </span>
            </div>
            <p style={{ color: '#666', fontSize: '0.9rem', margin: '4px 0' }}>
              ID: {playerData?.displayId || 'N/A'} | Email: {playerData?.email || 'N/A'}
            </p>

            {playerData?.gameStats && (
              <p style={{ color: '#666', fontSize: '0.9rem', margin: '4px 0' }}>
                🎮 Игр сыграно: {playerData.gameStats.gamesPlayed} | 🏆 Побед: {playerData.gameStats.gamesWon}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              style={{
                background: 'transparent',
                border: '1px solid #FF9800',
                color: '#FF9800',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
              onMouseEnter={(e) => e.target.style.background = '#FFF3E0'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
              onClick={handleRatingsClick}
            >
              ⭐ Рейтинги
            </button>
            <button
              style={{
                background: 'transparent',
                border: '1px solid #F44336',
                color: '#F44336',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
              onMouseEnter={(e) => e.target.style.background = '#FFEBEE'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
              onClick={onLogout}
            >
              🚪 Выйти
            </button>
          </div>
        </div>
      </div>

      {/* Сообщения об ошибках и успехе */}
      {error && (
        <div style={{
          background: '#FFEBEE',
          color: '#C62828',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>❌</span>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          background: '#E8F5E8',
          color: '#2E7D32',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>✅</span>
          {success}
        </div>
      )}

      {/* Создание новой комнаты */}
      <div style={{ 
        background: 'white', 
        padding: '24px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '32px'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '1.2rem', color: '#1976D2', marginRight: '8px' }}>➕</span>
            <h2 style={{ 
              fontSize: '1.5rem', 
              color: '#1976D2',
              margin: 0
            }}>
              🆕 Создать новую комнату
            </h2>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontWeight: 'bold', 
                marginBottom: '8px',
                color: '#333'
              }}>
                Название комнаты
              </label>
              <input
                type="text"
                placeholder="Например: Игра с друзьями"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                fontWeight: 'bold', 
                marginBottom: '8px',
                color: '#333'
              }}>
                ID комнаты (автогенерация)
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="ID будет сгенерирован автоматически"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateRoom();
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '1px solid #E0E0E0',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    background: '#F5F5F5'
                  }}
                  readOnly
                />
                <button
                  type="button"
                  onClick={generateRoomId}
                  style={{
                    padding: '12px 16px',
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    whiteSpace: 'nowrap'
                  }}
                  title="Сгенерировать новый ID"
                >
                  🔄 Новый ID
                </button>
              </div>
              <p style={{ 
                fontSize: '0.8rem', 
                color: '#666', 
                marginTop: '4px',
                fontStyle: 'italic'
              }}>
                💡 ID генерируется автоматически с порядковым номером
              </p>
            </div>
          </div>

          <button
            onClick={handleCreateRoom}
            disabled={creating}
            style={{
              width: '100%',
              maxWidth: '300px',
              background: '#1976D2',
              color: 'white',
              border: 'none',
              padding: '16px',
              borderRadius: '4px',
              fontSize: '1.1rem',
              cursor: creating ? 'not-allowed' : 'pointer',
              opacity: creating ? 0.7 : 1
            }}
          >
            {creating ? 'Создание...' : '🚀 Создать комнату'}
          </button>
        </div>
      </div>

      {/* Доступные комнаты */}
      <div style={{ 
        background: 'white', 
        padding: '24px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '1.2rem', color: '#4CAF50', marginRight: '8px' }}>⚙️</span>
            <h2 style={{ 
              fontSize: '1.5rem', 
              color: '#4CAF50',
              margin: 0
            }}>
              Доступные комнаты ({availableRooms.length})
            </h2>
          </div>

          {roomsLoading ? (
            <div style={{ textAlign: 'center', padding: '32px' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  border: '4px solid',
                  borderColor: '#E3F2FD',
                  borderTopColor: '#1976D2',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto'
                }}
              />
              <p style={{ marginTop: '16px', color: '#666' }}>Загрузка комнат...</p>
              <style>
                {`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}
              </style>
            </div>
          ) : availableRooms.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '16px'
            }}>
              {availableRooms
                .filter(room => {
                  if (!room || typeof room !== 'object') {
                    console.warn('🏠 [SimpleRoomSelection] Invalid room in render:', room);
                    return false;
                  }
                  // Упрощенная проверка: roomId должен существовать и не быть null/undefined
                  if (room.roomId === null || room.roomId === undefined) {
                    console.warn('🏠 [SimpleRoomSelection] Room missing roomId in render:', room);
                    return false;
                  }
                  return true;
                })
                .map((room) => (
                  <div
                    key={room.roomId || `room-${Math.random()}`}
                    style={{
                      background: 'white',
                      border: '2px solid #E0E0E0',
                      borderRadius: '12px',
                      padding: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (e.target && e.target.style) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                        e.target.style.borderColor = '#1976D2';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (e.target && e.target.style) {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                        e.target.style.borderColor = '#E0E0E0';
                      }
                    }}
                    onClick={() => {
                      if (room && room.roomId !== null && room.roomId !== undefined) {
                        handleRoomSelect(room.roomId);
                      } else {
                        console.error('🏠 [SimpleRoomSelection] Cannot select invalid room:', room);
                      }
                    }}
                  >
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h3 style={{
                          fontSize: '1.2rem',
                          fontWeight: 'bold',
                          color: '#1976D2',
                          margin: 0
                        }}>
                          🎯 {room.displayName || `Комната ${room.roomId}`}
                        </h3>
                        <span style={{
                          background: (room.status && room.status === 'waiting') ? '#FFF3E0' : '#E8F5E8',
                          color: (room.status && room.status === 'waiting') ? '#E65100' : '#2E7D32',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}>
                          {(room.status && room.status === 'waiting') ? '⏳ Ожидание' : '🎮 Игра'}
                        </span>
                      </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{
                          background: '#F5F5F5',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}>
                          🔢 ID: {room.roomId}
                        </span>
                        {room.originalRequestedId && room.roomId && room.originalRequestedId !== room.roomId.toString() && (
                          <span style={{
                            background: '#F5F5F5',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold'
                          }}>
                            🔄 Запрошен: {room.originalRequestedId}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ color: '#666', fontSize: '0.9rem', marginRight: '4px' }}>👥</span>
                        <span style={{ fontSize: '0.9rem', color: '#666' }}>
                          {Array.isArray(room.currentPlayers) ? room.currentPlayers.length : (room.currentPlayers || 0)}/{room.maxPlayers || 2} игроков
                        </span>
                      </div>
                      {room.createdAt && (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.9rem', color: '#666', marginRight: '4px' }}>🕒</span>
                          <span style={{ fontSize: '0.8rem', color: '#666' }}>
                            Создана: {new Date(room.createdAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {Array.isArray(room.currentPlayers) && room.currentPlayers.length > 0 && (
                      <div style={{ marginTop: '8px' }}>
                        <p style={{ fontSize: '0.8rem', color: '#666', margin: '4px 0' }}>
                          Игроки в комнате:
                        </p>
                        <p style={{ fontSize: '0.9rem', color: '#666', margin: '4px 0' }}>
                          {room.currentPlayers.map(p => (p && p.username) ? p.username : 'Гость').join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px' }}>
              <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '8px' }}>
                🚀 Комнаты не найдены
              </p>
              <p style={{ color: '#999' }}>
                Создайте первую комнату выше!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleRoomSelection;
