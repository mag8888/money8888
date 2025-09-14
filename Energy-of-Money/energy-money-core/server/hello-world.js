console.log('🚀 Starting Hello World server...');

const http = require('http');
const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Hello World - Railway Test</title>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial; background: #000; color: #0f0; text-align: center; padding: 50px; }
        h1 { color: #0f0; font-size: 4em; }
        .status { background: #111; padding: 20px; border: 2px solid #0f0; margin: 20px; }
      </style>
    </head>
    <body>
      <h1>HELLO WORLD</h1>
      <div class="status">
        <h2>✅ Railway работает!</h2>
        <p>Время: ${new Date().toISOString()}</p>
        <p>Порт: ${PORT}</p>
      </div>
    </body>
    </html>
  `);
});

server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});
