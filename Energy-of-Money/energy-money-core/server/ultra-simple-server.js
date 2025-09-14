const http = require('http');

const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'OK',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      port: PORT
    }));
    return;
  }
  
  // Простой HTML ответ
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Energy of Money - Test</title>
      <meta charset="utf-8">
      <style>
        body { 
          font-family: Arial, sans-serif; 
          background: linear-gradient(135deg, #1a1a2e, #16213e); 
          color: white; 
          text-align: center; 
          padding: 50px; 
          margin: 0;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
        }
        h1 { color: #4CAF50; font-size: 3em; margin-bottom: 20px; }
        .status { 
          background: rgba(255,255,255,0.1); 
          padding: 30px; 
          border-radius: 15px; 
          margin: 20px 0; 
          border: 2px solid rgba(255,255,255,0.2);
        }
        .success { color: #4CAF50; font-size: 1.5em; }
        .info { color: #81C784; }
        a { color: #4CAF50; text-decoration: none; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🎮 Energy of Money</h1>
        
        <div class="status">
          <div class="success">✅ Сервер работает!</div>
          <div class="info">Время: ${new Date().toISOString()}</div>
          <div class="info">Порт: ${PORT}</div>
          <div class="info">Версия: 1.0.0</div>
        </div>
        
        <div class="status">
          <h3>🔧 Ультра-простой режим</h3>
          <p>Это максимально простой сервер для тестирования Railway</p>
          <p><a href="/health">Проверить Health Check</a></p>
        </div>
        
        <div class="status">
          <h3>🚀 Следующие шаги</h3>
          <p>Если вы видите эту страницу, значит Railway работает!</p>
          <p>Можно переходить к полной версии игры</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

server.listen(PORT, () => {
  console.log(`🚀 Ultra-simple server running on port ${PORT}`);
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
