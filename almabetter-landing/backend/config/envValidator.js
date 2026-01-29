// Environment Configuration Validator
const requiredEnvVars = [
  'JWT_SECRET',
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME'
];

const validateEnv = () => {
  const missing = [];
  
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  if (missing.length > 0) {
    console.error('[CONFIG ERROR] Missing required environment variables:', missing.join(', '));
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    } else {
      console.warn('[CONFIG WARNING] Using default values for development. DO NOT use in production!');
    }
  }

  // Validate JWT_SECRET strength
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('[CONFIG WARNING] JWT_SECRET should be at least 32 characters long');
  }

  if (process.env.JWT_SECRET === 'changeme') {
    console.error('[CONFIG ERROR] JWT_SECRET is set to default value. Change it immediately!');
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be changed from default value in production');
    }
  }
};

const getJWTSecret = () => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'changeme') {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET not configured properly');
    }
    console.warn('[SECURITY WARNING] Using weak JWT secret. Set JWT_SECRET in .env file');
    return 'dev-secret-key-change-in-production-' + Date.now();
  }
  return process.env.JWT_SECRET;
};

module.exports = { validateEnv, getJWTSecret };
