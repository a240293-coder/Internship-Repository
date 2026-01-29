// API route for admin to mark a live session as completed

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const { id } = req.query;
  if (!id) return res.status(400).json({ message: 'Missing session id' });

  // Only use Authorization header for token
  let token = null;
  if (req.headers.authorization) {
    token = req.headers.authorization.replace('Bearer ', '');
  }
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    // Call backend endpoint directly with id as route param
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
    const backendRes = await fetch(`${apiUrl}/admin/live-sessions/${id}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}
