const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'learnbetter_DB',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

const promisePool = pool.promise();

// Test database connection and exit gracefully if it fails
pool.query("SELECT 1", (err) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
    console.error("Please check your database configuration in .env file");
    // In production, you might want to exit; in dev, continue with warning
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  } else {
    console.log("✅ MySQL Connected & Active");
  }
});

module.exports = promisePool;
