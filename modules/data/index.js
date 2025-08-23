// 💾 DATA MODULE - Управление данными CASHFLOW
// Этот модуль содержит локальное хранение, кэширование и персистентность

export { GameStorage } from './gameStorage.js';
export { GameCache } from './gameCache.js';
export { DataPersistence } from './dataPersistence.js';
export { LocalStorageManager } from './localStorageManager.js';

// Константы модуля
export const DATA_VERSION = '1.0.0';
export const DATA_MODULE_NAME = 'CASHFLOW Data';

console.log(`💾 ${DATA_MODULE_NAME} v${DATA_VERSION} loaded`);
