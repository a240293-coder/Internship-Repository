// Next.js API route to proxy admin forms from backend
import cookie from 'cookie';

export default async function handler(req, res) {
  try {
    // Try to get token from header, cookie, or fallback to SSR/CSR safe method
    let token = req.headers.authorization?.replace('Bearer ', '');
    if (!token && req.headers.cookie) {
      const cookies = cookie.parse(req.headers.cookie);
      token = cookies.token;
    }
    // Fallback: try to get token from query (for client-side fetches)
    if (!token && req.query && req.query.token) {
      token = req.query.token;
    }
    // If still no token, try to get from localStorage (only works client-side)
    if (!token && typeof window !== 'undefined') {
      token = window.localStorage.getItem('token');
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'No admin token provided' });
    }
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const apiRes = await fetch(`${backendUrl}/adminDashboard/forms`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const text = await apiRes.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(502).json({ success: false, message: 'Backend did not return valid JSON', backendResponse: text });
    }
    res.status(apiRes.status).json(data);
  } catch (err) {
    res.status(500).json({ success: false, message: 'API proxy error', error: err.message });
  }
}
