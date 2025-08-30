// 🎯 GameState - Управление состоянием игры
import { produce } from 'immer';

export class GameState {
  constructor() {
    this.state = {
      players: new Map(),
      currentTurn: null,
      gamePhase: 'waiting', // waiting, playing, finished
      turnTimer: 0,
      roomId: null,
      gameStarted: false
    };
  }

  // Получить текущее состояние
  getState() {
    return this.state;
  }

  // Обновить состояние (иммутабельно)
  updateState(updater) {
    this.state = produce(this.state, updater);
  }

  // Добавить игрока
  addPlayer(playerId, playerData) {
    this.updateState(draft => {
      draft.players.set(playerId, {
        id: playerId,
        username: playerData.username || `Player ${playerId}`,
        balance: 2000,
        position: 0,
        ready: false,
        ...playerData
      });
    });
  }

  // Удалить игрока
  removePlayer(playerId) {
    this.updateState(draft => {
      draft.players.delete(playerId);
    });
  }

  // Установить текущий ход
  setCurrentTurn(playerId) {
    this.updateState(draft => {
      draft.currentTurn = playerId;
    });
  }

  // Начать игру
  startGame() {
    this.updateState(draft => {
      draft.gamePhase = 'playing';
      draft.gameStarted = true;
    });
  }

  // Завершить игру
  finishGame() {
    this.updateState(draft => {
      draft.gamePhase = 'finished';
    });
  }
}
