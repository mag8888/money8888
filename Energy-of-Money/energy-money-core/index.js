const http = require('http');

const PORT = process.env.PORT || 8080;

console.log('🚀 Starting Railway test server...');
console.log(`Port: ${PORT}`);

const server = http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello Railway! Server is working!');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});
