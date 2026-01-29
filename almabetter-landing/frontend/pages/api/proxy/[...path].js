// import fetch from 'node-fetch';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const { path = [] } = req.query;
  const pathStr = Array.isArray(path) ? path.join('/') : path;
  let targetBase = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  // If someone configured the API URL to include the proxy path, strip it to avoid double /api/proxy
  targetBase = String(targetBase).replace(/\/api\/proxy\/?$/i, '');
  const targetUrl = `${targetBase.replace(/\/$/, '')}/${pathStr}`;

  try {
    const headers = { ...req.headers };
    delete headers.host;

    // Forward the raw request stream so multipart/form-data works
    const fetchOptions = {
      method: req.method,
      headers,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : req
    };

    const proxied = await fetch(targetUrl + (req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''), fetchOptions);
    // pipe status and headers
    res.status(proxied.status);
    proxied.headers.forEach((value, key) => res.setHeader(key, value));
    const stream = await proxied.buffer();
    // attempt JSON parse, otherwise send buffer
    const text = stream.toString('utf8');
    try {
      const json = JSON.parse(text);
      res.send(json);
    } catch (e) {
      res.send(text);
    }
  } catch (err) {
    console.error('Proxy error:', err.message || err);
    res.status(502).json({ error: 'Bad gateway', detail: err.message });
  }
}
