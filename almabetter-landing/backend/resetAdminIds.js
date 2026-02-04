const mysql = require('mysql2/promise');
require('dotenv').config();

async function resetAdminIds() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'learnbetter_db'
    });

    console.log('Connected to database...');

    // Get all admins
    const [admins] = await connection.execute('SELECT * FROM admins ORDER BY id');
    
    // Delete all admins
    await connection.execute('DELETE FROM admins');
    
    // Reset auto increment
    await connection.execute('ALTER TABLE admins AUTO_INCREMENT = 1');
    
    // Reinsert with sequential IDs
    for (let i = 0; i < admins.length; i++) {
      await connection.execute(
        'INSERT INTO admins (id, full_name, email, password, created_at) VALUES (?, ?, ?, ?, ?)',
        [i + 1, admins[i].full_name, admins[i].email, admins[i].password, admins[i].created_at]
      );
    }
    
    console.log(`✅ Reset ${admins.length} admin(s) with sequential IDs starting from 1`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

resetAdminIds();
