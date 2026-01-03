const mysql = require('mysql2/promise');
require('dotenv').config();

async function createDb() {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
// createDatabase.js removed — backend is deprecated.
console.log('createDatabase.js stub: local backend removed.');
}

createDb();
