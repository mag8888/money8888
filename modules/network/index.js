// 🌐 NETWORK MODULE - Сетевое взаимодействие CASHFLOW
// Этот модуль содержит WebSocket соединения и API вызовы

export { GameSocket } from './gameSocket.js';
export { GameAPI } from './gameAPI.js';
export { NetworkEvents } from './networkEvents.js';
export { ConnectionManager } from './connectionManager.js';

// Константы модуля
export const NETWORK_VERSION = '1.0.0';
export const NETWORK_MODULE_NAME = 'CASHFLOW Network';

console.log(`🌐 ${NETWORK_MODULE_NAME} v${NETWORK_VERSION} loaded`);
