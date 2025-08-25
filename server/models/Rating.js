const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  playerId: {
    type: String,
    required: true,
    index: true
  },
  username: {
    type: String,
    required: true
  },
  roomId: {
    type: String,
    required: true,
    index: true
  },
  
  // Общие показатели
  gamesPlayed: {
    type: Number,
    default: 0
  },
  gamesWon: {
    type: Number,
    default: 0
  },
  totalScore: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  // Новое поле для рейтинговых очков
  ratingPoints: {
    type: Number,
    default: 0
  },
  
  // Финансовые показатели
  totalEarnings: {
    type: Number,
    default: 0
  },
  totalExpenses: {
    type: String,
    default: 0
  },
  netWorth: {
    type: Number,
    default: 0
  },
  passiveIncome: {
    type: Number,
    default: 0
  },
  
  // Стратегические показатели
  dealsCompleted: {
    type: Number,
    default: 0
  },
  assetsAcquired: {
    type: Number,
    default: 0
  },
  financialFreedomAchieved: {
    type: Number,
    default: 0
  },
  
  // Временные показатели
  fastestWin: {
    type: Number, // в минутах
    default: null
  },
  averageGameTime: {
    type: Number, // в минутах
    default: 0
  },
  
  // Категории рейтинга
  categories: {
    wealth: {
      score: { type: Number, default: 0 },
      rank: { type: Number, default: 0 }
    },
    speed: {
      score: { type: Number, default: 0 },
      rank: { type: Number, default: 0 }
    },
    strategy: {
      score: { type: Number, default: 0 },
      rank: { type: Number, default: 0 }
    },
    consistency: {
      score: { type: Number, default: 0 },
      rank: { type: Number, default: 0 }
    }
  },
  
  // Общий рейтинг
  overallRank: {
    type: Number,
    default: 0
  },
  overallScore: {
    type: Number,
    default: 0
  },
  
  // Последнее обновление
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  
  // История игр
  gameHistory: [{
    roomId: String,
    gameDate: Date,
    finalScore: Number,
    finalNetWorth: Number,
    gameTime: Number, // в минутах
    dealsCompleted: Number,
    passiveIncome: Number,
    won: Boolean
  }]
}, {
  timestamps: true
});

// Индексы для быстрого поиска
ratingSchema.index({ overallScore: -1 });
ratingSchema.index({ 'categories.wealth.score': -1 });
ratingSchema.index({ 'categories.speed.score': -1 });
ratingSchema.index({ 'categories.strategy.score': -1 });
ratingSchema.index({ 'categories.consistency.score': -1 });
ratingSchema.index({ roomId: 1, totalScore: -1 });

// Методы для обновления рейтинга
ratingSchema.methods.updateOverallScore = function() {
  const wealthScore = this.categories.wealth.score || 0;
  const speedScore = this.categories.speed.score || 0;
  const strategyScore = this.categories.strategy.score || 0;
  const consistencyScore = this.categories.consistency.score || 0;
  
  // НОВАЯ ФОРМУЛА: рейтинговые очки имеют больший вес
  this.overallScore = Math.round(
    (this.ratingPoints * 0.4) + // 40% - рейтинговые очки
    (wealthScore * 0.2) +        // 20% - богатство
    (speedScore * 0.15) +        // 15% - скорость
    (strategyScore * 0.15) +     // 15% - стратегия
    (consistencyScore * 0.1)     // 10% - консистентность
  );
  
  return this.overallScore;
};

ratingSchema.methods.addGameResult = function(gameData) {
  // Добавляем игру в историю
  this.gameHistory.push({
    roomId: gameData.roomId,
    gameDate: new Date(),
    finalScore: gameData.finalScore || 0,
    finalNetWorth: gameData.finalNetWorth || 0,
    gameTime: gameData.gameTime || 0,
    dealsCompleted: gameData.dealsCompleted || 0,
    passiveIncome: gameData.passiveIncome || 0,
    won: gameData.won || false,
    position: gameData.position || 1, // Позиция в игре
    totalPlayers: gameData.totalPlayers || 1 // Общее количество игроков
  });
  
  // Обновляем общие показатели
  this.gamesPlayed += 1;
  if (gameData.won) this.gamesWon += 1;
  
  this.totalScore += gameData.finalScore || 0;
  this.averageScore = Math.round(this.totalScore / this.gamesPlayed);
  
  this.totalEarnings += gameData.finalNetWorth || 0;
  this.netWorth = gameData.finalNetWorth || 0;
  this.passiveIncome = gameData.passiveIncome || 0;
  
  this.dealsCompleted += gameData.dealsCompleted || 0;
  this.assetsAcquired += gameData.dealsCompleted || 0;
  
  // НОВАЯ ЛОГИКА РЕЙТИНГА: очки = количество игроков, которых обошел
  if (gameData.position && gameData.totalPlayers) {
    const ratingPointsEarned = gameData.totalPlayers - gameData.position;
    this.ratingPoints += ratingPointsEarned;
    
    console.log(`🏆 [Rating] Игрок ${this.username} получил ${ratingPointsEarned} очков за ${gameData.position}-е место из ${gameData.totalPlayers} игроков`);
  }
  
  if (gameData.won) {
    this.financialFreedomAchieved += 1;
    
    // Обновляем самое быстрое время победы
    if (!this.fastestWin || gameData.gameTime < this.fastestWin) {
      this.fastestWin = gameData.gameTime;
    }
  }
  
  // Обновляем среднее время игры
  const totalTime = this.gameHistory.reduce((sum, game) => sum + game.gameTime, 0);
  this.averageGameTime = Math.round(totalTime / this.gamesPlayed);
  
  // Обновляем категории
  this.updateCategoryScores();
  
  // Обновляем общий рейтинг
  this.updateOverallScore();
  
  this.lastUpdated = new Date();
};

ratingSchema.methods.updateCategoryScores = function() {
  // Рейтинг богатства (по чистому капиталу и пассивному доходу)
  this.categories.wealth.score = Math.round(
    (this.netWorth * 0.7) + (this.passiveIncome * 0.3)
  );
  
  // Рейтинг скорости (по времени игры и количеству побед)
  this.categories.speed.score = Math.round(
    (this.gamesWon * 1000) + (this.fastestWin ? (10000 / this.fastestWin) : 0)
  );
  
  // Рейтинг стратегии (по количеству сделок и активов)
  this.categories.strategy.score = Math.round(
    (this.dealsCompleted * 100) + (this.assetsAcquired * 50)
  );
  
  // Рейтинг консистентности (по среднему счету и регулярности игр)
  this.categories.consistency.score = Math.round(
    (this.averageScore * 0.5) + (this.gamesPlayed * 10)
  );
};

// Статические методы для работы с рейтингами
ratingSchema.statics.updateAllRanks = async function() {
  // Обновляем общий рейтинг по рейтинговым очкам
  const overallRankings = await this.find().sort({ ratingPoints: -1, overallScore: -1 });
  overallRankings.forEach((rating, index) => {
    rating.overallRank = index + 1;
    rating.save();
  });
  
  // Обновляем рейтинги по категориям
  const wealthRankings = await this.find().sort({ 'categories.wealth.score': -1 });
  wealthRankings.forEach((rating, index) => {
    rating.categories.wealth.rank = index + 1;
    rating.save();
  });
  
  const speedRankings = await this.find().sort({ 'categories.speed.score': -1 });
  speedRankings.forEach((rating, index) => {
    rating.categories.speed.rank = index + 1;
    rating.save();
  });
  
  const strategyRankings = await this.find().sort({ 'categories.strategy.score': -1 });
  strategyRankings.forEach((rating, index) => {
    rating.categories.strategy.rank = index + 1;
    rating.save();
  });
  
  const consistencyRankings = await this.find().sort({ 'categories.consistency.score': -1 });
  consistencyRankings.forEach((rating, index) => {
    rating.categories.consistency.rank = index + 1;
    rating.save();
  });
};

ratingSchema.statics.getTopPlayers = async function(limit = 10, category = 'overall') {
  let sortCriteria = {};
  
  switch (category) {
    case 'wealth':
      sortCriteria = { 'categories.wealth.score': -1 };
      break;
    case 'speed':
      sortCriteria = { 'categories.speed.score': -1 };
      break;
    case 'strategy':
      sortCriteria = { 'categories.strategy.score': -1 };
      break;
    case 'consistency':
      sortCriteria = { 'categories.consistency.score': -1 };
      break;
    case 'rating':
      sortCriteria = { ratingPoints: -1, overallScore: -1 };
      break;
    default:
      sortCriteria = { ratingPoints: -1, overallScore: -1 }; // По умолчанию по рейтинговым очкам
  }
  
  return await this.find().sort(sortCriteria).limit(limit);
};

ratingSchema.statics.getRoomRankings = async function(roomId, limit = 10) {
  return await this.find({ roomId }).sort({ totalScore: -1 }).limit(limit);
};

module.exports = mongoose.model('Rating', ratingSchema);
