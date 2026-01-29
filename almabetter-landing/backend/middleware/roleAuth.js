module.exports = (role) => (req, res, next) => {
  if (!req.user || !req.user.role) {
    return res.status(403).json({ message: 'Forbidden: No user or role found' });
  }
  // Case-insensitive role comparison for consistency
  if (req.user.role.toUpperCase() !== role.toUpperCase()) {
    return res.status(403).json({ message: 'Forbidden: Incorrect role' });
  }
  next();
};
