// 🎨 UI MODULE - Пользовательский интерфейс CASHFLOW
// Этот модуль содержит React компоненты, стили и анимации

export { GameBoardUI } from './components/GameBoardUI.js';
export { PlayerPanel } from './components/PlayerPanel.js';
export { GameControls } from './components/GameControls.js';
export { CardModal } from './components/CardModal.js';

export { useGameUI } from './hooks/useGameUI.js';
export { usePlayerActions } from './hooks/usePlayerActions.js';

export { gameTheme } from './theme/gameTheme.js';
export { animations } from './theme/animations.js';

// Константы модуля
export const UI_VERSION = '1.0.0';
export const UI_MODULE_NAME = 'CASHFLOW UI';

console.log(`🎨 ${UI_MODULE_NAME} v${UI_VERSION} loaded`);
