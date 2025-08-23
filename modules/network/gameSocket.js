// 🔌 GameSocket - WebSocket соединение для игры
import { io } from 'socket.io-client';

export class GameSocket {
  constructor(serverUrl = 'http://localhost:5000') {
    this.serverUrl = serverUrl;
    this.socket = null;
    this.connected = false;
    this.eventHandlers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  // Подключиться к серверу
  connect() {
    try {
      this.socket = io(this.serverUrl, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        maxReconnectionAttempts: this.maxReconnectAttempts
      });

      this.setupEventHandlers();
      this.setupReconnection();
      
      console.log('🔌 Connecting to game server...');
      
      return new Promise((resolve, reject) => {
        this.socket.on('connect', () => {
          this.connected = true;
          this.reconnectAttempts = 0;
          console.log('✅ Connected to game server');
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          console.error('❌ Connection error:', error);
          reject(error);
        });
      });
    } catch (error) {
      console.error('❌ Failed to create socket connection:', error);
      throw error;
    }
  }

  // Настроить обработчики событий
  setupEventHandlers() {
    this.socket.on('disconnect', () => {
      this.connected = false;
      console.log('🔌 Disconnected from game server');
    });

    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });
  }

  // Настроить переподключение
  setupReconnection() {
    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
      this.connected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      this.reconnectAttempts = attemptNumber;
      console.log(`🔄 Reconnection attempt ${attemptNumber}`);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Failed to reconnect after all attempts');
    });
  }

  // Отправить событие
  emit(event, data) {
    if (!this.connected) {
      throw new Error('Socket not connected');
    }

    console.log(`📤 Emitting event: ${event}`, data);
    this.socket.emit(event, data);
  }

  // Подписаться на событие
  on(event, handler) {
    if (!this.socket) {
      throw new Error('Socket not initialized');
    }

    this.eventHandlers.set(event, handler);
    this.socket.on(event, handler);
  }

  // Отписаться от события
  off(event) {
    if (!this.socket) return;

    const handler = this.eventHandlers.get(event);
    if (handler) {
      this.socket.off(event, handler);
      this.eventHandlers.delete(event);
    }
  }

  // Подписаться на игровые события
  subscribeToGameEvents(roomId, playerId) {
    // Подписываемся на обновления комнаты
    this.on('roomUpdate', (data) => {
      console.log('🏠 Room update received:', data);
    });

    // Подписываемся на обновления игроков
    this.on('playersUpdate', (data) => {
      console.log('👥 Players update received:', data);
    });

    // Подписываемся на обновления игры
    this.on('gameUpdate', (data) => {
      console.log('🎮 Game update received:', data);
    });

    // Подписываемся на уведомления
    this.on('notification', (data) => {
      console.log('🔔 Notification received:', data);
    });
  }

  // Присоединиться к комнате
  joinRoom(roomId, playerData) {
    this.emit('joinRoom', { roomId, playerData });
  }

  // Покинуть комнату
  leaveRoom(roomId) {
    this.emit('leaveRoom', { roomId });
  }

  // Установить готовность
  setReady(roomId, ready) {
    this.emit('setReady', { roomId, ready });
  }

  // Выполнить игровое действие
  performAction(roomId, action, data) {
    this.emit('gameAction', { roomId, action, data });
  }

  // Получить статус соединения
  getConnectionStatus() {
    return {
      connected: this.connected,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts
    };
  }

  // Отключиться от сервера
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.connected = false;
      console.log('🔌 Disconnected from game server');
    }
  }

  // Очистить все обработчики
  cleanup() {
    if (this.socket) {
      this.eventHandlers.forEach((handler, event) => {
        this.socket.off(event, handler);
      });
      this.eventHandlers.clear();
    }
  }
}
