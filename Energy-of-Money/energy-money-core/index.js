const http = require('http');

const PORT = process.env.PORT || 8080;

console.log('🚀 TEST PAGE STARTING...');

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
<!DOCTYPE html>
<html>
<head>
    <title>TEST PAGE - Railway</title>
    <meta charset="utf-8">
    <style>
        body { 
            background: linear-gradient(45deg, #ff0000, #00ff00, #0000ff);
            color: white; 
            font-family: Arial; 
            text-align: center; 
            padding: 50px;
            margin: 0;
        }
        h1 { 
            font-size: 5em; 
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        .status { 
            background: rgba(0,0,0,0.7); 
            padding: 30px; 
            border: 3px solid white; 
            margin: 30px auto;
            max-width: 600px;
            border-radius: 15px;
        }
        .time { font-size: 1.5em; color: #ffff00; }
    </style>
</head>
<body>
    <h1>🎮 TEST PAGE 🎮</h1>
    <div class="status">
        <h2>✅ Railway работает!</h2>
        <p class="time">Время: ${new Date().toLocaleString('ru-RU')}</p>
        <p>Порт: ${PORT}</p>
        <p>Сервер: Node.js</p>
        <p>Статус: 🟢 ONLINE</p>
    </div>
</body>
</html>
  `);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ TEST PAGE running on port ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});