// Enhanced Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  // Log error securely
  const errorLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  };
  
  console.error('[ERROR]', JSON.stringify(errorLog));

  // Handle specific error types
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ message: 'Invalid CSRF token' });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Validation failed', error: err.message });
  }

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'Duplicate entry' });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'Internal server error'
    : err.message || 'Server error';

  res.status(statusCode).json({ 
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { errorHandler, asyncHandler };
