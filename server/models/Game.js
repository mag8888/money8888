const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  roomId: String,
  players: [{ userId: String, balance: Number, assets: Array, liabilities: Array }],
  deals: [{ from: String, to: String, details: Object, price: Number, status: String }]
});

module.exports = mongoose.model('Game', GameSchema);
