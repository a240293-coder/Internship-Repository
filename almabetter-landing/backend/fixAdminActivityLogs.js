const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixAdminActivityLogs() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'learnbetter_db'
    });

    console.log('Connected to database...');

    // Check if column exists
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM admin_activity_logs LIKE 'action'"
    );

    if (columns.length > 0) {
      // Rename action to action_type
      await connection.execute(
        "ALTER TABLE admin_activity_logs CHANGE COLUMN action action_type VARCHAR(50) NOT NULL"
      );
      console.log('✅ Renamed column from action to action_type');
    } else {
      console.log('✅ Column action_type already exists');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

fixAdminActivityLogs();
