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
    <title>🎮 TEST PAGE - Railway</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body { 
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57);
            background-size: 400% 400%;
            animation: gradientShift 8s ease infinite;
            color: white; 
            font-family: 'Arial', sans-serif; 
            text-align: center; 
            padding: 20px;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }
        
        @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        
        h1 { 
            font-size: 4em; 
            text-shadow: 3px 3px 6px rgba(0,0,0,0.8);
            animation: pulse 2s infinite;
            margin-bottom: 30px;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        .status { 
            background: rgba(0,0,0,0.8); 
            padding: 40px; 
            border: 3px solid white; 
            border-radius: 20px;
            max-width: 600px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            backdrop-filter: blur(10px);
        }
        
        .time { 
            font-size: 1.5em; 
            color: #ffff00; 
            margin: 15px 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        }
        
        .info {
            font-size: 1.2em;
            margin: 10px 0;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
        }
        
        .emoji {
            font-size: 2em;
            margin: 0 10px;
        }
        
        .online-indicator {
            display: inline-block;
            width: 20px;
            height: 20px;
            background: #00ff00;
            border-radius: 50%;
            animation: blink 1s infinite;
            margin-right: 10px;
        }
        
        @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0.3; }
        }
        
        .footer {
            margin-top: 30px;
            font-size: 0.9em;
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <h1>🎮 TEST PAGE 🎮</h1>
    
    <div class="status">
        <h2>
            <span class="online-indicator"></span>
            ✅ Railway работает!
        </h2>
        
        <div class="time">
            🕐 ${new Date().toLocaleString('ru-RU')}
        </div>
        
        <div class="info">
            <span class="emoji">⚙️</span> Порт: ${PORT}
        </div>
        
        <div class="info">
            <span class="emoji">🚀</span> Сервер: Node.js
        </div>
        
        <div class="info">
            <span class="online-indicator"></span>
            Статус: 🟢 ONLINE
        </div>
        
        <div class="info">
            <span class="emoji">🌐</span> URL: ${req.headers.host || 'localhost'}
        </div>
    </div>
    
    <div class="footer">
        <p>🎯 Тест страница успешно загружена!</p>
        <p>💫 Railway + Node.js + Docker</p>
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