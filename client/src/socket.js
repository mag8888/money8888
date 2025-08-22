import io from 'socket.io-client';

const SERVER_PORT = 5000;
const baseUrl = `${window.location.protocol}//${window.location.hostname}:${SERVER_PORT}`;

const socket = io(baseUrl, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  forceNew: true,
  upgrade: true
});

// Optional: basic diagnostics in dev
if (process.env.NODE_ENV !== 'production') {
  socket.on('connect_error', (e) => console.warn('socket connect_error', e?.message));
  socket.on('reconnect_attempt', (n) => console.log('socket reconnect_attempt', n));
  socket.on('connect', () => console.log('socket connected', socket.id, baseUrl));
  socket.on('disconnect', (r) => console.log('socket disconnected', r));
  socket.on('error', (e) => console.error('socket error', e));
}

export default socket;

