
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    console.log('[verifyToken] no authorization header:', !!authHeader, 'authHeader:', authHeader);
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('[verifyToken] token verify error:', err && err.message);
      return res.status(403).json({ message: 'Invalid token' });
    }
    console.log('[verifyToken] token valid, user:', user && (user.id || user.email || user.name));
    req.user = user;
    next();
  });
};

module.exports = { verifyToken };
