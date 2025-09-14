const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;

console.log('🚀 STATIC SERVER STARTING...');

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(__dirname, 'public', filePath);
  
  // Проверяем существование файла
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    const contentType = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml'
    }[ext] || 'text/plain';
    
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    // Fallback HTML если файл не найден
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
<!DOCTYPE html>
<html>
<head>
    <title>🎮 TEST PAGE - Railway</title>
    <meta charset="utf-8">
    <style>
        body { 
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1);
            color: white; 
            font-family: Arial; 
            text-align: center; 
            padding: 50px;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }
        h1 { font-size: 4em; text-shadow: 3px 3px 6px rgba(0,0,0,0.8); }
        .status { 
            background: rgba(0,0,0,0.8); 
            padding: 40px; 
            border: 3px solid white; 
            border-radius: 20px;
            max-width: 600px;
        }
    </style>
</head>
<body>
    <h1>🎮 TEST PAGE 🎮</h1>
    <div class="status">
        <h2>✅ Railway работает!</h2>
        <p>Время: ${new Date().toLocaleString('ru-RU')}</p>
        <p>Порт: ${PORT}</p>
        <p>Статус: 🟢 ONLINE</p>
    </div>
</body>
</html>
    `);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ STATIC SERVER running on port ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});