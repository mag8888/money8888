// 🔧 ИСПРАВЛЕНИЕ КОНФЛИКТОВ WEBSOCKET
// Этот файл предотвращает создание лишних WebSocket подключений

// Перехватываем создание WebSocket подключений к неправильным портам
const originalWebSocket = window.WebSocket;

window.WebSocket = function(url, protocols) {
  // Проверяем, не пытается ли кто-то подключиться к порту 3000
  if (url && url.includes('localhost:3000/ws')) {
    console.warn('⚠️ [WebSocket Fix] Blocked connection to localhost:3000/ws - using Socket.IO instead');
    console.warn('⚠️ [WebSocket Fix] Socket.IO already connected to localhost:5000');
    
    // Возвращаем заглушку вместо реального WebSocket
    return {
      readyState: 3, // CLOSED
      send: () => console.warn('⚠️ [WebSocket Fix] Send blocked - use Socket.IO'),
      close: () => console.warn('⚠️ [WebSocket Fix] Close blocked - use Socket.IO'),
      addEventListener: () => {},
      removeEventListener: () => {},
      onopen: null,
      onclose: null,
      onmessage: null,
      onerror: null
    };
  }
  
  // Для всех остальных URL используем оригинальный WebSocket
  return new originalWebSocket(url, protocols);
};

// Сохраняем оригинальный WebSocket для возможного использования
window.OriginalWebSocket = originalWebSocket;

console.log('🔧 [WebSocket Fix] WebSocket conflicts prevention enabled');
console.log('🔧 [WebSocket Fix] Socket.IO should be used for game communication');

