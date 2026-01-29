const db = require('./config/database');
const fs = require('fs');
const path = require('path');

async function initDb() {
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    const statements = schema.split(';').filter(s => s.trim());

    const connection = await db.getConnection();
    try {
      await connection.query('SET FOREIGN_KEY_CHECKS = 0');

      for (const statement of statements) {
        if (statement.trim()) {
          await connection.query(statement);
        }
      }

      await connection.query('SET FOREIGN_KEY_CHECKS = 1');
      console.log('Database initialized successfully');
    } finally {
      connection.release();
    }

    process.exit(0);
  } catch (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  }
}

initDb();
