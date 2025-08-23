const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Уникальный ID пользователя (автоинкремент)
  userId: {
    type: Number,
    required: true
  },
  
  // Email как основной идентификатор
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  
  // Имя пользователя
  username: {
    type: String,
    required: true,
    trim: true
  },
  
  // Хеш пароля
  passwordHash: {
    type: String,
    required: true
  },
  
  // Дата регистрации
  registeredAt: {
    type: Date,
    default: Date.now
  },
  
  // Последний вход
  lastLogin: {
    type: Date,
    default: Date.now
  },
  
  // Статус аккаунта
  status: {
    type: String,
    enum: ['active', 'suspended', 'deleted'],
    default: 'active'
  },
  
  // Роль пользователя
  role: {
    type: String,
    enum: ['player', 'moderator', 'admin'],
    default: 'player'
  },
  
  // Игровая статистика
  gameStats: {
    gamesPlayed: { type: Number, default: 0 },
    gamesWon: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    bestScore: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 }
  },
  
  // Настройки пользователя
  preferences: {
    theme: { type: String, default: 'dark' },
    language: { type: String, default: 'ru' },
    notifications: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

// Индексы для быстрого поиска (убираем дублирующиеся)
userSchema.index({ email: 1 });
userSchema.index({ userId: 1 });
userSchema.index({ status: 1 });

// Виртуальное поле для отображения ID
userSchema.virtual('displayId').get(function() {
  return `USER${this.userId.toString().padStart(6, '0')}`;
});

// Метод для обновления статистики
userSchema.methods.updateGameStats = function(gameResult) {
  this.gameStats.gamesPlayed += 1;
  if (gameResult.won) {
    this.gameStats.gamesWon += 1;
  }
  this.gameStats.totalEarnings += gameResult.earnings || 0;
  
  if (gameResult.score > this.gameStats.bestScore) {
    this.gameStats.bestScore = gameResult.score;
  }
  
  // Обновляем средний счет
  const totalScore = (this.gameStats.averageScore * (this.gameStats.gamesPlayed - 1)) + gameResult.score;
  this.gameStats.averageScore = Math.round(totalScore / this.gameStats.gamesPlayed);
  
  return this.save();
};

// Метод для обновления времени последнего входа
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Статический метод для поиска по email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Статический метод для поиска по ID
userSchema.statics.findByUserId = function(userId) {
  return this.findOne({ userId: userId });
};

// Статический метод для получения следующего ID
userSchema.statics.getNextUserId = async function() {
  const lastUser = await this.findOne().sort({ userId: -1 });
  return lastUser ? lastUser.userId + 1 : 1;
};

module.exports = mongoose.model('User', userSchema);
