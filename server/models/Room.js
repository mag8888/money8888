const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  // Уникальный ID комнаты (автоинкремент)
  roomId: {
    type: Number,
    required: true,
    unique: true
  },
  
  // Название комнаты (пользовательское)
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  // Описание комнаты
  description: {
    type: String,
    trim: true,
    default: ''
  },
  
  // Статус комнаты
  status: {
    type: String,
    enum: ['waiting', 'active', 'finished', 'deleted'],
    default: 'waiting'
  },
  
  // Максимальное количество игроков
  maxPlayers: {
    type: Number,
    required: true,
    min: 2,
    max: 10,
    default: 4
  },
  
  // Текущие игроки
  players: [{
    userId: {
      type: Number,
      required: true
    },
    username: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    ready: {
      type: Boolean,
      default: false
    },
    position: {
      type: Number,
      default: 0
    },
    balance: {
      type: Number,
      default: 2000
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isHost: {
      type: Boolean,
      default: false
    }
  }],
  
  // Создатель комнаты
  creator: {
    userId: {
      type: Number,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    username: {
      type: String,
      required: true
    }
  },
  
  // Настройки игры
  gameSettings: {
    startingBalance: {
      type: Number,
      default: 2000
    },
    gameSpeed: {
      type: String,
      enum: ['slow', 'normal', 'fast'],
      default: 'normal'
    },
    enableChat: {
      type: Boolean,
      default: true
    },
    privateRoom: {
      type: Boolean,
      default: false
    },
    password: {
      type: String,
      default: null
    }
  },
  
  // Статистика комнаты
  stats: {
    gamesPlayed: {
      type: Number,
      default: 0
    },
    totalPlayTime: {
      type: Number,
      default: 0
    },
    averageGameTime: {
      type: Number,
      default: 0
    }
  },
  
  // История игр
  gameHistory: [{
    gameId: String,
    startedAt: Date,
    finishedAt: Date,
    players: [{
      userId: Number,
      username: String,
      finalBalance: Number,
      position: Number
    }],
    winner: {
      userId: Number,
      username: String
    },
    duration: Number
  }],
  
  // Метаданные
  tags: [String],
  category: {
    type: String,
    enum: ['casual', 'competitive', 'training', 'tournament'],
    default: 'casual'
  }
}, {
  timestamps: true
});

// Индексы для быстрого поиска (убираем дублирующиеся)
roomSchema.index({ roomId: 1 });
roomSchema.index({ status: 1 });
roomSchema.index({ creator: 1 });
roomSchema.index({ 'players.userId': 1 });
roomSchema.index({ category: 1 });
roomSchema.index({ createdAt: -1 });

// Виртуальное поле для отображения ID
roomSchema.virtual('displayId').get(function() {
  return `ROOM${this.roomId.toString().padStart(6, '0')}`;
});

// Виртуальное поле для количества игроков
roomSchema.virtual('playerCount').get(function() {
  return this.players.length;
});

// Виртуальное поле для готовых игроков
roomSchema.virtual('readyPlayers').get(function() {
  return this.players.filter(p => p.ready).length;
});

// Виртуальное поле для проверки готовности к старту
roomSchema.virtual('canStart').get(function() {
  return this.status === 'waiting' && 
         this.readyPlayers >= 2 && 
         this.readyPlayers === this.playerCount;
});

// Метод для добавления игрока
roomSchema.methods.addPlayer = function(userData) {
  // Проверяем, не превышено ли максимальное количество игроков
  if (this.players.length >= this.maxPlayers) {
    throw new Error('Room is full');
  }
  
  // Проверяем, не находится ли игрок уже в комнате
  const existingPlayer = this.players.find(p => p.userId === userData.userId);
  if (existingPlayer) {
    throw new Error('Player already in room');
  }
  
  // Добавляем игрока
  const newPlayer = {
    userId: userData.userId,
    username: userData.username,
    email: userData.email,
    ready: false,
    position: 0,
    balance: this.gameSettings.startingBalance,
    joinedAt: new Date(),
    isHost: this.players.length === 0 // Первый игрок становится хостом
  };
  
  this.players.push(newPlayer);
  return this.save();
};

// Метод для удаления игрока
roomSchema.methods.removePlayer = function(userId) {
  const playerIndex = this.players.findIndex(p => p.userId === userId);
  if (playerIndex === -1) {
    throw new Error('Player not found in room');
  }
  
  const removedPlayer = this.players[playerIndex];
  this.players.splice(playerIndex, 1);
  
  // Если удаленный игрок был хостом, назначаем нового
  if (removedPlayer.isHost && this.players.length > 0) {
    this.players[0].isHost = true;
  }
  
  return this.save();
};

// Метод для изменения статуса готовности игрока
roomSchema.methods.togglePlayerReady = function(userId) {
  const player = this.players.find(p => p.userId === userId);
  if (!player) {
    throw new Error('Player not found in room');
  }
  
  player.ready = !player.ready;
  return this.save();
};

// Метод для начала игры
roomSchema.methods.startGame = function() {
  if (!this.canStart) {
    throw new Error('Cannot start game - not all players are ready');
  }
  
  this.status = 'active';
  return this.save();
};

// Метод для завершения игры
roomSchema.methods.finishGame = function(gameData) {
  this.status = 'finished';
  
  // Добавляем игру в историю
  this.gameHistory.push({
    gameId: gameData.gameId,
    startedAt: gameData.startedAt,
    finishedAt: new Date(),
    players: gameData.players,
    winner: gameData.winner,
    duration: Date.now() - gameData.startedAt.getTime()
  });
  
  // Обновляем статистику
  this.stats.gamesPlayed += 1;
  this.stats.totalPlayTime += gameData.duration || 0;
  this.stats.averageGameTime = Math.round(this.stats.totalPlayTime / this.stats.gamesPlayed);
  
  return this.save();
};

// Статический метод для поиска по ID
roomSchema.statics.findByRoomId = function(roomId) {
  return this.findOne({ roomId: roomId });
};

// Статический метод для поиска активных комнат
roomSchema.statics.findActive = function() {
  return this.find({ status: { $in: ['waiting', 'active'] } });
};

// Статический метод для получения следующего ID
roomSchema.statics.getNextRoomId = async function() {
  const lastRoom = await this.findOne().sort({ roomId: -1 });
  return lastRoom ? lastRoom.roomId + 1 : 1;
};

// Статический метод для поиска комнат пользователя
roomSchema.statics.findByPlayer = function(userId) {
  return this.find({ 'players.userId': userId });
};

module.exports = mongoose.model('Room', roomSchema);
