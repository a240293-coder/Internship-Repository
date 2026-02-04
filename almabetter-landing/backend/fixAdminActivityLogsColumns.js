const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixAdminActivityLogsColumns() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'learnbetter_db'
    });

    console.log('Connected to database...');

    // Add description column if missing
    const [descColumns] = await connection.execute(
      "SHOW COLUMNS FROM admin_activity_logs LIKE 'description'"
    );

    if (descColumns.length === 0) {
      await connection.execute(
        "ALTER TABLE admin_activity_logs ADD COLUMN description TEXT AFTER action_type"
      );
      console.log('✅ Added description column');
    } else {
      console.log('✅ Description column already exists');
    }

    console.log('✅ Setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

fixAdminActivityLogsColumns();
