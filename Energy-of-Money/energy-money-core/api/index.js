// Vercel API route для Socket.IO сервера
const { Server } = require('socket.io');
const { createServer } = require('http');

// Импортируем основную логику сервера
const serverLogic = require('../server/index');

module.exports = (req, res) => {
  // Создаем HTTP сервер
  const httpServer = createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Energy of Money Server is running!');
  });

  // Создаем Socket.IO сервер
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.SOCKET_IO_CORS_ORIGIN || "*",
      methods: ["GET", "POST"]
    }
  });

  // Инициализируем логику сервера
  serverLogic(io);

  // Запускаем сервер
  httpServer.listen(process.env.PORT || 5000, () => {
    console.log('Server running on Vercel');
  });

  res.status(200).json({ message: 'Server initialized' });
};
