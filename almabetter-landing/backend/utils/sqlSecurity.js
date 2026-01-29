// SQL Injection Prevention Helper
const validator = require('validator');

const sanitizeSQLInput = (input) => {
  if (typeof input === 'number') return input;
  if (typeof input === 'string') {
    const dangerous = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)/gi;
    if (dangerous.test(input)) throw new Error('Invalid input detected');
    return input.trim();
  }
  return input;
};

const validateOrderBy = (orderBy, allowedColumns) => {
  if (!orderBy) return allowedColumns[0];
  const sanitized = orderBy.toLowerCase().trim();
  if (!allowedColumns.includes(sanitized)) throw new Error('Invalid sort column');
  return sanitized;
};

const validatePaginationParams = (limit, offset) => {
  const safeLimit = parseInt(limit, 10);
  const safeOffset = parseInt(offset, 10);
  if (isNaN(safeLimit) || safeLimit < 1 || safeLimit > 100) throw new Error('Invalid limit parameter');
  if (isNaN(safeOffset) || safeOffset < 0) throw new Error('Invalid offset parameter');
  return { limit: safeLimit, offset: safeOffset };
};

const buildSafeSearchClause = (searchTerm, searchColumns) => {
  if (!searchTerm || !searchColumns || searchColumns.length === 0) return { clause: '', params: [] };
  const sanitized = sanitizeSQLInput(searchTerm);
  const conditions = searchColumns.map(col => `${col} LIKE ?`).join(' OR ');
  const params = searchColumns.map(() => `%${sanitized}%`);
  return { clause: `(${conditions})`, params };
};

module.exports = { sanitizeSQLInput, validateOrderBy, validatePaginationParams, buildSafeSearchClause };
