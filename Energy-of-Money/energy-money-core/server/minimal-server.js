const http = require('http');

const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'OK',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }));
    return;
  }
  
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Energy of Money</title>
      <style>
        body { font-family: Arial, sans-serif; background: #1a1a2e; color: white; text-align: center; padding: 50px; }
        h1 { color: #4CAF50; }
        .status { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 20px; }
      </style>
    </head>
    <body>
      <h1>🎮 Energy of Money</h1>
      <div class="status">
        <h2>✅ Сервер работает!</h2>
        <p>Время: ${new Date().toISOString()}</p>
        <p>Порт: ${PORT}</p>
        <p>Версия: 1.0.0</p>
      </div>
      <div class="status">
        <h3>🔧 Тестовый режим</h3>
        <p>Это минимальный сервер для тестирования Railway деплоя</p>
        <p><a href="/health" style="color: #4CAF50;">Проверить Health Check</a></p>
      </div>
    </body>
    </html>
  `);
});

server.listen(PORT, () => {
  console.log(`🚀 Minimal server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});

server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('🛑 Server shutting down...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('🛑 Server shutting down...');
  server.close(() => process.exit(0));
});
