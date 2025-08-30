// 🏠 Room - Класс игровой комнаты
export class Room {
  constructor(roomId, maxPlayers = 6) {
    this.roomId = roomId;
    this.maxPlayers = maxPlayers;
    this.players = new Map();
    this.status = 'waiting'; // waiting, started, finished
    this.createdAt = Date.now();
    this.gameStarted = false;
    this.currentTurn = null;
    this.turnTimer = 0;
  }

  // Получить информацию о комнате
  getInfo() {
    return {
      roomId: this.roomId,
      maxPlayers: this.maxPlayers,
      currentPlayers: this.players.size,
      status: this.status,
      createdAt: this.createdAt,
      gameStarted: this.gameStarted,
      currentTurn: this.currentTurn
    };
  }

  // Добавить игрока в комнату
  addPlayer(playerId, playerData) {
    if (this.players.size >= this.maxPlayers) {
      throw new Error('Room is full');
    }

    if (this.players.has(playerId)) {
      throw new Error('Player already in room');
    }

    this.players.set(playerId, {
      id: playerId,
      username: playerData.username || `Player ${playerId}`,
      ready: false,
      joinedAt: Date.now(),
      ...playerData
    });

    return true;
  }

  // Удалить игрока из комнаты
  removePlayer(playerId) {
    if (!this.players.has(playerId)) {
      return false;
    }

    this.players.delete(playerId);
    
    // Если игрок был текущим ходом, передаем ход следующему
    if (this.currentTurn === playerId) {
      this.nextTurn();
    }

    return true;
  }

  // Установить готовность игрока
  setPlayerReady(playerId, ready) {
    if (!this.players.has(playerId)) {
      return false;
    }

    const player = this.players.get(playerId);
    player.ready = ready;

    // Проверяем, можно ли начать игру
    this.checkGameStart();

    return true;
  }

  // Проверить, можно ли начать игру
  checkGameStart() {
    if (this.gameStarted) return false;

    const readyPlayers = Array.from(this.players.values()).filter(p => p.ready);
    
    if (readyPlayers.length >= 2 && readyPlayers.length === this.players.size) {
      this.startGame();
      return true;
    }

    return false;
  }

  // Начать игру
  startGame() {
    if (this.gameStarted) return false;

    this.status = 'started';
    this.gameStarted = true;
    this.currentTurn = Array.from(this.players.keys())[0];
    this.turnTimer = 30; // 30 секунд на ход

    return true;
  }

  // Следующий ход
  nextTurn() {
    if (!this.gameStarted) return false;

    const playerIds = Array.from(this.players.keys());
    const currentIndex = playerIds.indexOf(this.currentTurn);
    const nextIndex = (currentIndex + 1) % playerIds.length;
    
    this.currentTurn = playerIds[nextIndex];
    this.turnTimer = 30;

    return this.currentTurn;
  }

  // Завершить игру
  finishGame() {
    this.status = 'finished';
    this.gameStarted = false;
    this.currentTurn = null;
    this.turnTimer = 0;
  }
}
