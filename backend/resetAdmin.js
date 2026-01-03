const db = require('./database');
const bcrypt = require('bcrypt');

// --- CONFIGURATION ---
const NEW_EMAIL = 'abhijeetsoni100@gmail.com';
const NEW_PASSWORD = 'Abhijeet@1992';
const NEW_NAME = 'Abhijeet Soni';
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
      'INSERT INTO admins (full_name, email, password, role) VALUES (?, ?, ?, ?)',
      [NEW_NAME, NEW_EMAIL, hashedPassword, 'admin']
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
