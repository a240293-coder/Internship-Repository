const db = require('./config/database');
const bcrypt = require('bcrypt');

console.log('Starting createAdmin...');

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = {
      full_name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin'
    };

    const [result] = await db.execute(
      'INSERT INTO admins (full_name, email, password, role) VALUES (?, ?, ?, ?)',
      [admin.full_name, admin.email, admin.password, admin.role]
    );

    console.log('Admin user created successfully');
    console.log("[DB INSERT] admin:", result.insertId);
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    process.exit(0);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      console.log('Admin user already exists');
      process.exit(0);
    }
    console.error('Failed to create admin user:', err);
    process.exit(1);
  }
}

createAdmin();
