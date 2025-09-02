import io from 'socket.io-client';

// Конфигурация для разработки и продакшена
const SERVER_PORT = 5000;
const SERVER_HOST = window.location.hostname || 'localhost';

// Базовый URL для сервера
const baseUrl = process.env.NODE_ENV === 'production' 
  ? `${window.location.protocol}//${SERVER_HOST}:${SERVER_PORT}`
  : `${window.location.protocol}//${SERVER_HOST}:${SERVER_PORT}`;

console.log('🔌 [Socket] Configuration:', { baseUrl, env: process.env.NODE_ENV });

// Создаем Socket.IO экземпляр с оптимизированными настройками
const socket = io(baseUrl, {
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
  reconnectionDelayMax: 5000,
  timeout: 10000,
  autoConnect: false, // Отключаем автоматическое подключение
  forceNew: false,
  upgrade: true,
  rememberUpgrade: true,
  maxReconnectionAttempts: 5
});

// Состояние подключения
let isConnecting = false;
let connectionPromise = null;

// Функция для подключения с Promise
export const connectSocket = async () => {
  if (socket.connected) {
    console.log('🔌 [Socket] Already connected');
    return socket;
  }

  if (isConnecting && connectionPromise) {
    console.log('🔌 [Socket] Connection in progress, waiting...');
    return connectionPromise;
  }

  isConnecting = true;
  
  connectionPromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Connection timeout'));
    }, 10000);

    const onConnect = () => {
      clearTimeout(timeout);
      isConnecting = false;
      console.log('✅ [Socket] Connected successfully:', {
        id: socket.id,
        server: baseUrl,
        transport: socket.io.engine.transport.name
      });
      resolve(socket);
    };

    const onConnectError = (error) => {
      clearTimeout(timeout);
      isConnecting = false;
      console.error('❌ [Socket] Connection failed:', error);
      reject(error);
    };

    socket.once('connect', onConnect);
    socket.once('connect_error', onConnectError);

    console.log('🔌 [Socket] Attempting connection...');
    socket.connect();
  });

  return connectionPromise;
};

// Функция для отключения
export const disconnectSocket = () => {
  if (socket.connected) {
    console.log('🔌 [Socket] Disconnecting...');
    socket.disconnect();
  }
  isConnecting = false;
  connectionPromise = null;
};

// Функция для проверки состояния подключения
export const isSocketConnected = () => socket.connected;

// Обработчики событий
socket.on('connect', () => {
  console.log('✅ [Socket] Connected:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.warn('⚠️ [Socket] Disconnected:', { reason, id: socket.id });
  isConnecting = false;
  connectionPromise = null;
});

socket.on('connect_error', (error) => {
  console.error('❌ [Socket] Connection error:', {
    message: error.message,
    description: error.description,
    context: error.context
  });
  isConnecting = false;
  connectionPromise = null;
});

socket.on('reconnect_attempt', (attemptNumber) => {
  console.log('🔄 [Socket] Reconnection attempt:', attemptNumber);
});

socket.on('reconnect', (attemptNumber) => {
  console.log('✅ [Socket] Reconnected after', attemptNumber, 'attempts');
  
  // Автоматически восстанавливаем состояние после переподключения
  if (window.location.pathname.includes('/room/')) {
    const roomId = window.location.pathname.split('/room/')[1]?.split('/')[0];
    if (roomId) {
      console.log('🔄 [Socket] Restoring room state after reconnection:', roomId);
      // Эмитим событие для восстановления состояния комнаты
      socket.emit('restoreRoomState', roomId);
    }
  }
});

socket.on('reconnect_error', (error) => {
  console.error('❌ [Socket] Reconnection error:', error.message);
});

socket.on('reconnect_failed', () => {
  console.error('💥 [Socket] Reconnection failed - giving up');
  isConnecting = false;
  connectionPromise = null;
});

// Обработка ошибок
socket.on('error', (error) => {
  console.error('💥 [Socket] General error:', error);
});

// Экспортируем socket и функции
export default socket;

