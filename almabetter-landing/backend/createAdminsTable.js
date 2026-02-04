const mysql = require('mysql2/promise');
require('dotenv').config();

async function createAdminsTable() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'learnbetter_db'
    });

    console.log('Connected to database...');

    // Create admins table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ Admins table created successfully!');

    // Migrate existing admins if any
    const [existing] = await connection.execute(
      "SELECT COUNT(*) as count FROM super_admins WHERE role = 'admin'"
    );

    if (existing[0].count > 0) {
      await connection.execute(`
        INSERT INTO admins (full_name, email, password, created_at)
        SELECT sa.full_name, sa.email, sa.password, sa.created_at 
        FROM super_admins sa
        WHERE sa.role = 'admin'
        ON DUPLICATE KEY UPDATE admins.email=admins.email
      `);
      
      await connection.execute("DELETE FROM super_admins WHERE role = 'admin'");
      console.log(`✅ Migrated ${existing[0].count} admin(s) to new table`);
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

createAdminsTable();
