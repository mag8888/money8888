// 🎮 CORE MODULE - Основная логика игры CASHFLOW
// Этот модуль содержит всю игровую логику и управление состоянием

export { GameState } from './gameState.js';
export { Player } from './player.js';
export { Room } from './room.js';
export { GameEngine } from './gameEngine.js';

// Константы модуля
export const CORE_VERSION = '1.0.0';
export const CORE_MODULE_NAME = 'CASHFLOW Core';

console.log(`🚀 ${CORE_MODULE_NAME} v${CORE_VERSION} loaded`);
