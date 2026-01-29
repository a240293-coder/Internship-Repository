// File Upload Security Middleware
const path = require('path');

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const validateFileUpload = (req, res, next) => {
  if (!req.file && !req.files) {
    return next();
  }

  const files = req.files ? Object.values(req.files).flat() : [req.file];

  for (const file of files) {
    if (!file) continue;

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return res.status(400).json({ 
        message: 'File too large. Maximum size is 5MB' 
      });
    }

    // Check file extension
    const ext = path.extname(file.originalname || file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return res.status(400).json({ 
        message: `File type not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}` 
      });
    }

    // Check MIME type
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png'
    ];

    if (!allowedMimes.includes(file.mimetype)) {
      return res.status(400).json({ 
        message: 'Invalid file type' 
      });
    }
  }

  next();
};

module.exports = { validateFileUpload };
