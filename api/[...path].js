// Vercel Serverless Function: /api/* 를 오늘의집 RP-Chat API로 프록시
// CORS 우회 + ohouse-user-id 헤더 자동 주입
export default async function handler(req, res) {
  const segments = req.query.path;
  const apiPath = Array.isArray(segments) ? segments.join('/') : (segments || '');
  const queryString = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
  const targetUrl = `https://rp-chat.qa.dailyhou.se/${apiPath}${queryString}`;

  // CORS 헤더 (same-origin이지만 안전하게)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, ohouse-user-id');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    const fetchOptions = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'ohouse-user-id': req.headers['ohouse-user-id'] || '1234',
      },
    };

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, fetchOptions);
    const text = await response.text();

    res.status(response.status);
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
    res.send(text);
  } catch (err) {
    res.status(502).json({ error: 'Proxy error: ' + err.message });
  }
}
