// 🎮 GAME MODULE - Игровая механика CASHFLOW
// Этот модуль содержит игровое поле, карточки и правила игры

export { GameBoard } from './gameBoard.js';
export { GameCards } from './gameCards.js';
export { GameRules } from './gameRules.js';
export { GameActions } from './gameActions.js';

// Константы модуля
export const GAME_VERSION = '1.0.0';
export const GAME_MODULE_NAME = 'CASHFLOW Game';

console.log(`🎮 ${GAME_MODULE_NAME} v${GAME_VERSION} loaded`);
