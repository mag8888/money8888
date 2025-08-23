import React, { useState, useEffect, useMemo } from 'react';
import { useGameNavigation } from '../hooks/useGameState';
import socket from '../socket';

const SimpleRoomSetup = ({ roomId, playerData }) => {
  const [players, setPlayers] = useState([]);
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Используем хук для автоматического перехода на игровое поле
  const { handleGameStarted } = useGameNavigation(socket, roomId, (gameData) => {
    console.log('🎮 [SimpleRoomSetup] Game started callback:', gameData);
    // Обновляем статус комнаты
    setRoomData(prev => ({ ...prev, status: 'started' }));
  });

  useEffect(() => {
    if (!roomId) return;

    setLoading(true);
    console.log('🔍 [SimpleRoomSetup] Component mounted with roomId:', roomId);

    // Подписываемся на обновления игроков
    socket.on('playersUpdate', (updatedPlayers) => {
      console.log('👥 [SimpleRoomSetup] Players updated:', updatedPlayers);
      setPlayers(updatedPlayers);
      setLoading(false);
    });

    // Подписываемся на обновления комнаты
    socket.on('roomUpdated', (updatedRoom) => {
      console.log('🏠 [SimpleRoomSetup] Room updated:', updatedRoom);
      setRoomData(updatedRoom);
    });

    // Подписываемся на возможность начала игры
    socket.on('canStartGame', (gameData) => {
      console.log('🎮 [SimpleRoomSetup] Can start game:', gameData);
      setMessage({ text: '🎉 Достаточно игроков! Можно начинать игру!', type: 'success' });
    });

    // Подписываемся на начало игры
    socket.on('gameStarted', (gameData) => {
      console.log('🎮 [SimpleRoomSetup] Game started event received:', gameData);
      console.log('🎮 [SimpleRoomSetup] Current roomId:', roomId);
      
      setMessage({ text: '🎉 Игра началась! Переходим к игровой доске...', type: 'success' });
      
      // Обновляем статус комнаты
      setRoomData(prev => ({ ...prev, status: 'started' }));
      
      // Навигация теперь происходит автоматически через хук useGameState
      console.log('🚀 [SimpleRoomSetup] Navigation will be handled by useGameState hook');
    });

    // Подписываемся на обновление данных комнаты
    socket.on('roomData', (roomData) => {
      console.log('🏠 [SimpleRoomSetup] Room data updated:', roomData);
      setRoomData(roomData);
    });

    // Подписываемся на обновление списка игроков
    socket.on('playersList', (playersList) => {
      console.log('👥 [SimpleRoomSetup] Players list updated:', playersList);
      setPlayers(playersList);
    });

    // Подписываемся на изменение хода
    socket.on('turnChanged', (currentTurn) => {
      console.log('🎯 [SimpleRoomSetup] Turn changed to:', currentTurn);
    });

    // Подписываемся на обновление таймера
    socket.on('timerUpdate', (remainingTime) => {
      console.log('⏰ [SimpleRoomSetup] Timer update:', remainingTime);
    });

    // Присоединяемся к комнате
    socket.emit('joinRoom', roomId, {
      id: playerData.id,
      username: playerData.username,
      email: playerData.email,
      displayId: playerData.displayId
    });

    return () => {
      socket.off('playersUpdate');
      socket.off('roomUpdated');
      socket.off('canStartGame');
      socket.off('gameStarted');
      socket.off('roomData');
      socket.off('playersList');
      socket.off('turnChanged');
      socket.off('timerUpdate');
    };
  }, [roomId, playerData]);

  // Определяем готовность текущего игрока
  const myReady = useMemo(() => {
    const currentPlayer = players.find(p => p.socketId === socket.id);
    return currentPlayer ? currentPlayer.ready : false;
  }, [players, socket.id]);

  // Определяем количество готовых игроков (только онлайн)
  const readyPlayers = useMemo(() => {
    const onlinePlayers = players.filter(p => !p.offline);
    return onlinePlayers.filter(p => p.ready);
  }, [players]);

  // Определяем, можно ли начинать игру
  const canStart = useMemo(() => {
    const onlinePlayers = players.filter(p => !p.offline);
    const readyOnlinePlayers = onlinePlayers.filter(p => p.ready);
    
    console.log('🔍 [SimpleRoomSetup] Game start conditions:');
    console.log('   - Total players:', players.length);
    console.log('   - Online players:', onlinePlayers.length);
    console.log('   - Ready players:', readyPlayers.length);
    console.log('   - Ready online players:', readyOnlinePlayers.length);
    
    // Нужно минимум 2 игрока, из них минимум 2 готовых и онлайн
    return readyOnlinePlayers.length >= 2 && onlinePlayers.length >= 2;
  }, [readyPlayers.length, players]);

  // Состояние запуска игры
  const [starting, setStarting] = useState(false);

  // Переключение готовности
  const toggleReady = () => {
    const newReadyState = !myReady;
    console.log(`🎯 [SimpleRoomSetup] Toggling ready state to: ${newReadyState}`);
    
    socket.emit('setReady', roomId, newReadyState);
    
    // Показываем сообщение
    setMessage({ 
      text: newReadyState ? '✅ Готовность отмечена!' : '❌ Готовность отменена!', 
      type: newReadyState ? 'success' : 'info' 
    });
  };

  // Выход из игры
  const exitGame = () => {
    console.log('🚪 [SimpleRoomSetup] Exiting game...');
    
    // Покидаем комнату
    socket.emit('leaveRoom', roomId);
    
    // Возвращаемся в предыдущее меню
    window.history.back();
  };

  // Запуск игры
  const startGame = () => {
    if (!canStart || starting) return;
    
    console.log('🚀 [SimpleRoomSetup] Starting game...');
    console.log('🔍 [SimpleRoomSetup] Debug info for game start:');
    console.log('   - roomId:', roomId);
    console.log('   - canStart:', canStart);
    console.log('   - starting:', starting);
    console.log('   - players:', players);
    console.log('   - readyPlayers:', readyPlayers);
    console.log('   - socket.id:', socket.id);
    
    setStarting(true);
    
    // Отправляем запрос на запуск игры
    console.log('📡 [SimpleRoomSetup] Emitting startGame event...');
    console.log('📡 [SimpleRoomSetup] Socket connected:', socket.connected);
    console.log('📡 [SimpleRoomSetup] Socket ID:', socket.id);
    
    // Отправляем запрос на запуск игры с callback
    socket.emit('startGame', roomId, (success, error) => {
      if (success) {
        console.log('✅ [SimpleRoomSetup] startGame acknowledged by server');
        setMessage({ 
          text: '✅ Сервер подтвердил запуск игры!', 
          type: 'success' 
        });
      } else {
        console.error('❌ [SimpleRoomSetup] startGame failed:', error);
        setMessage({ 
          text: '❌ Ошибка запуска игры: ' + (error || 'Неизвестная ошибка'), 
          type: 'error' 
        });
        setStarting(false);
      }
    });
    
    setMessage({ 
      text: '🚀 Запускаем игру...', 
      type: 'info' 
    });
  };

  // Отладочная информация
  console.log('🔍 [SimpleRoomSetup] Debug info:', {
    roomId,
    players,
    playerData,
    socketId: socket.id,
    loading,
    myReady
  });

  // Очищаем сообщения через 5 секунд
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: '', type: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (loading) {
    return (
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: '32px 20px',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
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
          <p style={{ marginTop: '16px', color: '#666' }}>Загрузка комнаты...</p>
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '32px 20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          marginBottom: '16px',
          gap: '16px'
        }}>
          <button
            style={{
              background: 'transparent',
              border: '1px solid #E0E0E0',
              color: '#666',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
            onMouseEnter={(e) => e.target.style.background = '#F5F5F5'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
            onClick={exitGame}
          >
            ⬅️ Назад
          </button>
          <h1 style={{ 
            fontSize: '2rem', 
            color: '#1976D2',
            margin: 0
          }}>
            �� Настройка комнаты
            {roomData && roomData.displayName && (
              <span style={{ fontSize: '1.2rem', color: '#666', display: 'block', marginTop: '8px' }}>
                "{roomData.displayName}"
              </span>
            )}
          </h1>
        </div>
        <p style={{ color: '#666', fontSize: '1.1rem', margin: 0 }}>
          {roomData && roomData.displayName ? `Название: ${roomData.displayName} | ` : ''}
          ID: {roomId} | Игроков: {players.filter(p => !p.offline).length} (онлайн) / {players.length} (всего)
        </p>
      </div>

      {/* Сообщения */}
      {message.text && (
        <div style={{
          background: message.type === 'success' ? '#E8F5E8' : 
                     message.type === 'warning' ? '#FFF3E0' : '#E3F2FD',
          color: message.type === 'success' ? '#2E7D32' : 
                 message.type === 'warning' ? '#E65100' : '#1976D2',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>
            {message.type === 'success' ? '✅' : message.type === 'warning' ? '⚠️' : 'ℹ️'}
          </span>
          {message.text}
        </div>
      )}

      {/* Статус готовности */}
      <div style={{ 
        background: 'white', 
        padding: '24px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '32px'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '1.2rem', color: '#1976D2', marginRight: '8px' }}>⚙️</span>
            <h2 style={{ 
              fontSize: '1.5rem', 
              color: '#1976D2',
              margin: 0
            }}>
              Статус игроков
            </h2>
          </div>

          <div style={{
            width: '100%',
            height: '24px',
            background: '#E0E0E0',
            borderRadius: '12px',
            overflow: 'hidden',
            marginBottom: '16px'
          }}>
            <div style={{
              width: `${(readyPlayers.length / Math.max(players.filter(p => !p.offline).length, 1)) * 100}%`,
              height: '100%',
              background: canStart ? '#4CAF50' : '#FF9800',
              borderRadius: '12px',
              transition: 'width 0.3s ease'
            }} />
          </div>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center'
          }}>
            <p style={{ color: '#666', margin: 0 }}>
              Готово: {readyPlayers.length} из {players.filter(p => !p.offline).length} (онлайн)
            </p>
            <span style={{
              background: canStart ? '#E8F5E8' : '#FFF3E0',
              color: canStart ? '#2E7D32' : '#E65100',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}>
              {canStart ? '🎉 Можно начинать!' : '⏳ Ожидание...'}
            </span>
          </div>
        </div>
      </div>

      {/* Список игроков */}
      <div style={{ 
        background: 'white', 
        padding: '24px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '32px'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ color: '#4CAF50', fontSize: '1.2rem', marginRight: '8px' }}>👥</span>
            <h2 style={{ 
              fontSize: '1.5rem', 
              color: '#4CAF50',
              margin: 0
            }}>
              Игроки в комнате
            </h2>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '16px'
          }}>
            {players.filter(p => !p.offline).map((player) => (
              <div
                key={player.id}
                style={{
                  background: 'white',
                  border: '2px solid',
                  borderColor: player.ready ? '#C8E6C9' : '#E0E0E0',
                  borderRadius: '8px',
                  padding: '16px',
                  background: player.ready ? '#F1F8E9' : 'white'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: player.ready ? '#4CAF50' : '#9E9E9E',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '1.2rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {player.username ? player.username.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div>
                      <p style={{ 
                        fontWeight: 'bold', 
                        fontSize: '1.1rem',
                        margin: '0 0 4px 0'
                      }}>
                        {player.username}
                      </p>
                      <p style={{ 
                        fontSize: '0.9rem', 
                        color: '#666',
                        margin: 0
                      }}>
                        ID: {player.displayId || player.id}
                      </p>
                    </div>
                  </div>
                  
                  <span style={{
                    background: player.ready ? '#4CAF50' : '#9E9E9E',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                  }}>
                    {player.ready ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '1rem' }}>✅</span>
                        Готов
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '1rem' }}>❌</span>
                        Не готов
                      </span>
                    )}
                  </span>
                </div>

                {/* Это вы - показываем кнопку готовности */}
                {player.socketId === socket.id && (
                  <div style={{ marginTop: '16px' }}>
                    <button
                      style={{
                        width: '100%',
                        background: myReady ? '#f44336' : '#4CAF50',
                        color: 'white',
                        border: 'none',
                        padding: '12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: 'bold'
                      }}
                      onClick={toggleReady}
                    >
                      {myReady ? 'Отменить готовность' : 'Готов'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Кнопка старта */}
      {canStart && (
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '32px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              color: '#4CAF50',
              margin: '0 0 16px 0'
            }}>
              🚀 Игра готова к старту!
            </h2>
            
            <p style={{ 
              textAlign: 'center', 
              color: '#666',
              margin: '0 0 24px 0'
            }}>
              {readyPlayers.length} из {players.filter(p => !p.offline).length} онлайн игроков готовы
            </p>

            <button
              style={{
                width: '100%',
                maxWidth: '400px',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '20px',
                borderRadius: '8px',
                fontSize: '1.3rem',
                fontWeight: 'bold',
                cursor: starting ? 'not-allowed' : 'pointer',
                opacity: starting ? 0.7 : 1
              }}
              onClick={startGame}
              disabled={starting}
            >
              {starting ? 'Запуск игры...' : '🎮 СТАРТ ИГРЫ!'}
            </button>

            <p style={{ 
              fontSize: '0.9rem', 
              color: '#999', 
              textAlign: 'center',
              margin: '16px 0 0 0'
            }}>
              💡 Другие игроки смогут присоединиться во время игры
            </p>
          </div>
        </div>
      )}

      {/* Отладочная информация */}
      <div style={{ 
        background: '#f5f5f5', 
        padding: '16px', 
        borderRadius: '8px', 
        marginBottom: '24px',
        fontSize: '0.9rem',
        color: '#666'
      }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#333' }}>🔍 Отладка:</h3>
        <p style={{ margin: '4px 0' }}>Готовых игроков: {readyPlayers.length}</p>
        <p style={{ margin: '4px 0' }}>Онлайн игроков: {players.filter(p => !p.offline).length}</p>
        <p style={{ margin: '4px 0' }}>Всего игроков: {players.length}</p>
        <p style={{ margin: '4px 0' }}>Можно начинать: {canStart ? 'Да' : 'Нет'}</p>
        <p style={{ margin: '4px 0' }}>Статус запуска: {starting ? 'Запускается...' : 'Готов'}</p>
        <p style={{ margin: '4px 0' }}>Статус комнаты: {roomData?.status || 'Неизвестно'}</p>
      </div>

      {/* Информация о комнате */}
      {roomData && (
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '1.2rem', color: '#9C27B0', marginRight: '8px' }}>⚙️</span>
              <h2 style={{ 
                fontSize: '1.5rem', 
                color: '#9C27B0',
                margin: 0
              }}>
                Информация о комнате
              </h2>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '16px'
            }}>
              <div>
                <p style={{ fontWeight: 'bold', color: '#666', margin: '0 0 8px 0' }}>Название:</p>
                <p style={{ fontSize: '1.1rem', margin: 0 }}>
                  {roomData.displayName || `Комната ${roomData.roomId}`}
                </p>
              </div>

              <div>
                <p style={{ fontWeight: 'bold', color: '#666', margin: '0 0 8px 0' }}>Максимум игроков:</p>
                <p style={{ fontSize: '1.1rem', margin: 0 }}>
                  {roomData.maxPlayers || 2}
                </p>
              </div>

              <div>
                <p style={{ fontWeight: 'bold', color: '#666', margin: '0 0 8px 0' }}>Статус:</p>
                <span style={{
                  background: roomData.status === 'waiting' ? '#FFF3E0' : '#E8F5E8',
                  color: roomData.status === 'waiting' ? '#E65100' : '#2E7D32',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: 'bold'
                }}>
                  {roomData.status === 'waiting' ? '⏳ Ожидание' : '🎮 Игра'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleRoomSetup;
