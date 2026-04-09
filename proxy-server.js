const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3456;
const API_TARGET = 'rp-chat.qa.dailyhou.se';

const server = http.createServer((req, res) => {
  // CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, ohouse-user-id');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Serve prototype.html (query string 무시)
  const urlPath = req.url.split('?')[0];
  if (urlPath === '/' || urlPath === '/index.html') {
    const html = fs.readFileSync(path.join(__dirname, 'prototype.html'), 'utf8');
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(html);
    return;
  }

  // Serve /assets/ from ohouse-ai-prototype/assets folder
  if (urlPath.startsWith('/assets/')) {
    const filePath = path.join(__dirname, 'ohouse-ai-prototype', urlPath);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const mime = { '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg',
                     '.webp':'image/webp', '.svg':'image/svg+xml' }[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'public, max-age=3600' });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  // Proxy API requests (/api/...)
  if (req.url.startsWith('/api/')) {
    const apiPath = req.url.replace('/api', '');
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const options = {
        hostname: API_TARGET,
        path: apiPath,
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
          'ohouse-user-id': req.headers['ohouse-user-id'] || '1234',
        }
      };
      const proxy = https.request(options, proxyRes => {
        let data = '';
        proxyRes.on('data', chunk => data += chunk);
        proxyRes.on('end', () => {
          res.writeHead(proxyRes.statusCode, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(data);
        });
      });
      proxy.on('error', err => {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      });
      if (body) proxy.write(body);
      proxy.end();
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});
