const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('joinRoom', (roomId, userId) => {
    socket.join(roomId);
    io.to(roomId).emit('userJoined', userId);
  });

  socket.on('offerDeal', (roomId, fromUser, toUser, dealDetails, price) => {
    io.to(roomId).emit('dealOffered', { from: fromUser, to: toUser, deal: dealDetails, price });
  });

  socket.on('acceptDeal', (roomId, dealId) => {
    // Логика принятия сделки, обновление балансов
    io.to(roomId).emit('dealAccepted', dealId);
  });

  socket.on('transferMoney', (roomId, fromUser, toUser, amount) => {
    // Логика перевода, проверка баланса
    io.to(roomId).emit('moneyTransferred', { from: fromUser, to: toUser, amount });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
