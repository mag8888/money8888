// 🎮 GameEngine - Основной движок игры
import { GameState } from './gameState.js';
import { Player } from './player.js';
import { Room } from './room.js';

export class GameEngine {
  constructor() {
    this.gameState = new GameState();
    this.rooms = new Map();
    this.players = new Map();
  }

  // Создать новую комнату
  createRoom(roomId, maxPlayers = 6) {
    if (this.rooms.has(roomId)) {
      throw new Error('Room already exists');
    }

    const room = new Room(roomId, maxPlayers);
    this.rooms.set(roomId, room);
    
    console.log(`🏠 Room ${roomId} created`);
    return room;
  }

  // Удалить комнату
  deleteRoom(roomId) {
    if (!this.rooms.has(roomId)) {
      return false;
    }

    const room = this.rooms.get(roomId);
    
    // Удаляем всех игроков из комнаты
    for (const playerId of room.players.keys()) {
      this.removePlayerFromRoom(roomId, playerId);
    }

    this.rooms.delete(roomId);
    console.log(`🗑️ Room ${roomId} deleted`);
    
    return true;
  }

  // Добавить игрока в комнату
  addPlayerToRoom(roomId, playerId, playerData) {
    if (!this.rooms.has(roomId)) {
      throw new Error('Room not found');
    }

    const room = this.rooms.get(roomId);
    const success = room.addPlayer(playerId, playerData);

    if (success) {
      // Создаем или обновляем игрока в глобальном списке
      if (!this.players.has(playerId)) {
        const player = new Player(playerId, playerData.username);
        this.players.set(playerId, player);
      }

      console.log(`👤 Player ${playerId} added to room ${roomId}`);
    }

    return success;
  }

  // Удалить игрока из комнаты
  removePlayerFromRoom(roomId, playerId) {
    if (!this.rooms.has(roomId)) {
      return false;
    }

    const room = this.rooms.get(roomId);
    const success = room.removePlayer(playerId);

    if (success) {
      console.log(`👤 Player ${playerId} removed from room ${roomId}`);
    }

    return success;
  }

  // Установить готовность игрока
  setPlayerReady(roomId, playerId, ready) {
    if (!this.rooms.has(roomId)) {
      return false;
    }

    const room = this.rooms.get(roomId);
    return room.setPlayerReady(playerId, ready);
  }

  // Получить информацию о комнате
  getRoomInfo(roomId) {
    if (!this.rooms.has(roomId)) {
      return null;
    }

    return this.rooms.get(roomId).getInfo();
  }

  // Получить список всех комнат
  getAllRooms() {
    return Array.from(this.rooms.values()).map(room => room.getInfo());
  }

  // Получить информацию об игроке
  getPlayerInfo(playerId) {
    if (!this.players.has(playerId)) {
      return null;
    }

    return this.players.get(playerId).getInfo();
  }

  // Получить список всех игроков
  getAllPlayers() {
    return Array.from(this.players.values()).map(player => player.getInfo());
  }

  // Обработать ход игрока
  processPlayerTurn(roomId, playerId, action, data) {
    if (!this.rooms.has(roomId)) {
      throw new Error('Room not found');
    }

    const room = this.rooms.get(roomId);
    
    if (room.currentTurn !== playerId) {
      throw new Error('Not player turn');
    }

    // Здесь будет логика обработки действий игрока
    console.log(`🎲 Player ${playerId} in room ${roomId} performed action: ${action}`);

    // Передаем ход следующему игроку
    const nextPlayer = room.nextTurn();
    
    return {
      success: true,
      nextTurn: nextPlayer,
      action: action,
      data: data
    };
  }

  // Получить статистику игры
  getGameStats() {
    return {
      totalRooms: this.rooms.size,
      totalPlayers: this.players.size,
      activeRooms: Array.from(this.rooms.values()).filter(r => r.status === 'started').length,
      waitingRooms: Array.from(this.rooms.values()).filter(r => r.status === 'waiting').length
    };
  }
}
