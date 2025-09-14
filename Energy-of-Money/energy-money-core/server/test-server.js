const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Health check
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
  
  // Serve React app
  if (req.url === '/' || req.url === '/index.html') {
    try {
      const indexPath = path.join(__dirname, '../build/index.html');
      const content = fs.readFileSync(indexPath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    } catch (error) {
      console.error('Error reading index.html:', error);
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('React app not found');
    }
    return;
  }
  
  // Serve static files
  if (req.url.startsWith('/static/')) {
    try {
      const filePath = path.join(__dirname, '../build', req.url);
      const content = fs.readFileSync(filePath);
      const ext = path.extname(filePath);
      const contentType = ext === '.js' ? 'application/javascript' : 
                         ext === '.css' ? 'text/css' : 'text/plain';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    } catch (error) {
      console.error('Error reading static file:', error);
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
    }
    return;
  }
  
  // Default response
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});

server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('🛑 Server shutting down...');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Server shutting down...');
  server.close(() => {
    process.exit(0);
  });
});
