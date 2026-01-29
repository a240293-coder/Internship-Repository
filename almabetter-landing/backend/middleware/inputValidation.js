// Input validation middleware to prevent SQL injection and XSS
const validator = require('validator');

const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return validator.escape(input.trim());
  }
  return input;
};

const validatePagination = (req, res, next) => {
  const { page, pageSize } = req.query;
  if (page && (!validator.isInt(String(page), { min: 1 }))) {
    return res.status(400).json({ message: 'Invalid page parameter' });
  }
  if (pageSize && (!validator.isInt(String(pageSize), { min: 1, max: 100 }))) {
    return res.status(400).json({ message: 'Invalid pageSize parameter' });
  }
  next();
};

const validateSearch = (req, res, next) => {
  if (req.query.search) {
    const search = String(req.query.search);
    if (search.length > 100) {
      return res.status(400).json({ message: 'Search query too long' });
    }
    req.query.search = sanitizeInput(search);
  }
  next();
};

const validateId = (req, res, next) => {
  const { id } = req.params;
  if (!validator.isInt(String(id), { min: 1 })) {
    return res.status(400).json({ message: 'Invalid ID parameter' });
  }
  next();
};

const validateAssignment = (req, res, next) => {
  const { studentId, mentorId } = req.body;
  if (!studentId || !mentorId) {
    return res.status(400).json({ message: 'studentId and mentorId are required' });
  }
  if (!validator.isInt(String(studentId), { min: 1 }) || !validator.isInt(String(mentorId), { min: 1 })) {
    return res.status(400).json({ message: 'Invalid studentId or mentorId' });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }
  if (password.length < 6 || password.length > 100) {
    return res.status(400).json({ message: 'Invalid password length' });
  }
  next();
};

module.exports = {
  validatePagination,
  validateSearch,
  validateId,
  validateAssignment,
  validateLogin,
  sanitizeInput
};
