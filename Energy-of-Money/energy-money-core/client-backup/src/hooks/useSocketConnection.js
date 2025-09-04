import { useState, useEffect, useCallback } from 'react';
import socket from '../socket';

/**
 * Кастомный хук для управления Socket.IO соединением
 * Отвечает за подключение, переподключение и обработку событий
 */
export const useSocketConnection = (roomId, playerData) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Функция для подключения к сокету
  const connect = useCallback(async () => {
    if (socket.connected) {
      setIsConnected(true);
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);

    try {
      await socket.connect();
      setIsConnected(true);
      console.log('✅ [useSocketConnection] Connected successfully');
    } catch (error) {
      setConnectionError(error.message);
      console.error('❌ [useSocketConnection] Connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Функция для отключения от сокета
  const disconnect = useCallback(() => {
    if (socket.connected) {
      socket.disconnect();
      setIsConnected(false);
      console.log('🔌 [useSocketConnection] Disconnected');
    }
  }, []);

  // Функция для отправки события
  const emit = useCallback((event, data) => {
    if (socket.connected) {
      socket.emit(event, data);
    } else {
      console.warn('⚠️ [useSocketConnection] Socket not connected, cannot emit:', event);
    }
  }, []);

  // Функция для подписки на событие
  const on = useCallback((event, callback) => {
    socket.on(event, callback);
    
    // Возвращаем функцию для отписки
    return () => socket.off(event, callback);
  }, []);

  // Функция для отписки от события
  const off = useCallback((event, callback) => {
    socket.off(event, callback);
  }, []);

  // Обработчики событий подключения
  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      setConnectionError(null);
      console.log('✅ [useSocketConnection] Connected:', socket.id);
    };

    const handleDisconnect = (reason) => {
      setIsConnected(false);
      console.warn('⚠️ [useSocketConnection] Disconnected:', reason);
    };

    const handleConnectError = (error) => {
      setConnectionError(error.message);
      setIsConnected(false);
      console.error('❌ [useSocketConnection] Connection error:', error);
    };

    const handleReconnect = (attemptNumber) => {
      console.log('🔄 [useSocketConnection] Reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
      setConnectionError(null);
    };

    const handleReconnectError = (error) => {
      console.error('❌ [useSocketConnection] Reconnection error:', error.message);
      setConnectionError(error.message);
    };

    const handleReconnectFailed = () => {
      console.error('💥 [useSocketConnection] Reconnection failed');
      setConnectionError('Reconnection failed');
    };

    // Подписываемся на события
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('reconnect', handleReconnect);
    socket.on('reconnect_error', handleReconnectError);
    socket.on('reconnect_failed', handleReconnectFailed);

    // Устанавливаем начальное состояние
    setIsConnected(socket.connected);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('reconnect', handleReconnect);
      socket.off('reconnect_error', handleReconnectError);
      socket.off('reconnect_failed', handleReconnectFailed);
    };
  }, []);

  // Автоматическое подключение при монтировании
  useEffect(() => {
    if (playerData && roomId && !socket.connected) {
      connect();
    }
  }, [playerData, roomId, connect]);

  // Восстановление состояния комнаты после переподключения
  useEffect(() => {
    if (isConnected && roomId && playerData) {
      console.log('🔄 [useSocketConnection] Restoring room state:', roomId);
      socket.emit('restoreRoomState', roomId);
    }
  }, [isConnected, roomId, playerData]);

  return {
    isConnected,
    connectionError,
    isConnecting,
    connect,
    disconnect,
    emit,
    on,
    off,
    socket
  };
};
