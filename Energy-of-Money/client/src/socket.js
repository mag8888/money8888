import io from 'socket.io-client';

// Конфигурация для разработки и продакшена
const SERVER_PORT = process.env.NODE_ENV === 'production' ? 5000 : 5000;
const SERVER_HOST = process.env.NODE_ENV === 'production' ? window.location.hostname : 'localhost';

// Базовый URL для сервера
const baseUrl = process.env.NODE_ENV === 'production' 
  ? `${window.location.protocol}//${window.location.hostname}:${SERVER_PORT}`
  : `http://${SERVER_HOST}:${SERVER_PORT}?v=${Date.now()}&cache=${Math.random()}&force=${Math.random()}&version=${window.CACHE_VERSION || Date.now()}&reload=${Date.now()}`;

console.log('🔌 [Socket] Connecting to:', baseUrl);

const socket = io(baseUrl, {
  transports: ['websocket', 'polling'], // Добавляем fallback на polling
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
  reconnectionDelayMax: 10000,
  timeout: 30000,
  forceNew: false,
  upgrade: true,
  // Дополнительные настройки для стабильности
  autoConnect: true,
  query: {
    client: 'potok-deneg-game',
    version: '1.0.1',
    timestamp: Date.now()
  },
  // Улучшенные настройки для стабильности
  pingTimeout: 60000,
  pingInterval: 25000
});

// Диагностика подключения
socket.on('connect', () => {
  console.log('✅ [Socket] Connected successfully:', {
    id: socket.id,
    server: baseUrl,
    transport: socket.io.engine.transport.name
  });
});

socket.on('connect_error', (error) => {
  console.error('❌ [Socket] Connection error:', {
    message: error.message,
    description: error.description,
    context: error.context,
    server: baseUrl
  });
});

socket.on('disconnect', (reason) => {
  console.warn('⚠️ [Socket] Disconnected:', {
    reason,
    id: socket.id,
    server: baseUrl
  });
});

socket.on('reconnect_attempt', (attemptNumber) => {
  console.log('🔄 [Socket] Reconnection attempt:', attemptNumber);
});

socket.on('reconnect', (attemptNumber) => {
  console.log('✅ [Socket] Reconnected after', attemptNumber, 'attempts');
});

socket.on('reconnect_error', (error) => {
  console.error('❌ [Socket] Reconnection error:', error.message);
});

socket.on('reconnect_failed', () => {
  console.error('💥 [Socket] Reconnection failed - giving up');
});

// Обработка ошибок
socket.on('error', (error) => {
  console.error('💥 [Socket] General error:', error);
});

export default socket;

