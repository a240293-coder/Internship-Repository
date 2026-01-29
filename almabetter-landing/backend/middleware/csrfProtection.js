// CSRF Protection Middleware
const csrf = require('csurf');

// CSRF protection for state-changing operations
const csrfProtection = csrf({ 
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// Skip CSRF for specific routes (like login)
const conditionalCSRF = (req, res, next) => {
  // Skip CSRF for login/register routes
  if (req.path.includes('/login') || req.path.includes('/register')) {
    return next();
  }
  return csrfProtection(req, res, next);
};

module.exports = { csrfProtection, conditionalCSRF };
