const db = require('./database');
const bcrypt = require('bcrypt');

// --- CONFIGURATION ---
const NEW_EMAIL = 'admin@example.com';
const NEW_PASSWORD = 'NewStrongPassword@2026';
const NEW_NAME = 'Admin User';
// ---------------------

async function resetAdmin() {
  try {
    console.log('Deleting old admins...');
    // 1. Delete all existing admins
    await db.execute("DELETE FROM admins");
    console.log("Old admin(s) deleted.");

    // 2. Create new admin
    console.log('Creating new admin...');
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);

    const [result] = await db.execute(
      'INSERT INTO admins (email, password) VALUES (?, ?)',
      [NEW_EMAIL, hashedPassword]
    );
    
    console.log("[DB INSERT] admin:", result.insertId);

    console.log('-----------------------------------');
    console.log('SUCCESS! New admin created.');
    console.log('Email:    ' + NEW_EMAIL);
    console.log('Password: ' + NEW_PASSWORD);
    console.log('-----------------------------------');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

resetAdmin();
