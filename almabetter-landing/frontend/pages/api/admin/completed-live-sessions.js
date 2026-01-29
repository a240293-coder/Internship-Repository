// API route to proxy completed live sessions from backend
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
  let token = null;
  if (req.headers.authorization) {
    token = req.headers.authorization.replace('Bearer ', '');
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  console.log('[API DEBUG] Token received in API route:', token);
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    // Backend route: /admin/history/completed-sessions
    const backendRes = await fetch(`${apiUrl}/admin/history/completed-sessions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const text = await backendRes.text();
    console.log('[API DEBUG] Backend response:', text);
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    res.status(backendRes.status).json(data);
  } catch (error) {
    console.log('[API DEBUG] Proxy error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

