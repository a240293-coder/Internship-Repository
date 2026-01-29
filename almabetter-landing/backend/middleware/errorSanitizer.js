// Error sanitizer middleware - prevents sensitive data leakage
const sanitizeError = (err, req, res, next) => {
  // Remove sensitive debug logs in production
  if (process.env.NODE_ENV === 'production') {
    console.error('[ERROR]', err.message);
    
    // Don't expose internal error details
    const statusCode = err.statusCode || 500;
    const message = statusCode === 500 ? 'Internal server error' : err.message;
    
    return res.status(statusCode).json({ 
      message,
      ...(statusCode !== 500 && { error: err.message })
    });
  }
  
  // In development, show full error
  next(err);
};

module.exports = sanitizeError;
