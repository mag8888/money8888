
const io = require('socket.io-client');

test('WebSocket connection', done => {
  const socket = io('http://localhost:3000');
  socket.on('connect', () => {
    done();
  });
});


