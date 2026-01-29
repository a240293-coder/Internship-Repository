// RBAC Middleware for Admin JWT Protection
const jwt = require('jsonwebtoken');

module.exports = function adminAuth(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  console.log('[ADMIN AUTH] JWT_SECRET in middleware:', process.env.JWT_SECRET);
  console.log('[ADMIN AUTH] Token received:', token);
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'changeme');
    // Accept any case for the role claim (e.g. 'admin' or 'ADMIN')
    if (!decoded || typeof decoded.role !== 'string' || decoded.role.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    console.log('[ADMIN AUTH] JWT verification error:', err.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
}
