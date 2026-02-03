const db = require('./config/database');
const bcrypt = require('bcrypt');

// --- CONFIGURATION ---
const NEW_EMAIL = 'superadmin@example.com';
const NEW_PASSWORD = 'SuperAdmin@2026';
const NEW_NAME = 'Super Admin';
const NEW_ROLE = 'super_admin';
// ---------------------

async function resetAdmin() {
  try {
    console.log('Deleting old super_admins...');
    // 1. Delete all existing super_admins
    await db.execute("DELETE FROM super_admins");
    console.log("Old admin(s) deleted.");

    // 2. Create new admin
    console.log('Creating new super_admin...');
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);
    const [result] = await db.execute(
      'INSERT INTO super_admins (full_name, email, password, role) VALUES (?, ?, ?, ?)',
      [NEW_NAME, NEW_EMAIL, hashedPassword, NEW_ROLE]
    );
    
    console.log("[DB INSERT] super_admin:", result.insertId);

    console.log('-----------------------------------');
    console.log('SUCCESS! New super_admin created.');
    console.log('Name:     ' + NEW_NAME);
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
