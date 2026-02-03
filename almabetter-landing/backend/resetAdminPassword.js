#!/usr/bin/env node
const db = require('./config/database');
const bcrypt = require('bcrypt');

async function resetPassword(email, newPassword) {
  if (!email || !newPassword) {
    console.error('Usage: node resetAdminPassword.js <email> <newPassword>');
    process.exit(1);
  }
  try {
    const hash = await bcrypt.hash(newPassword, 10);
    const [result] = await db.execute('UPDATE super_admins SET password = ? WHERE email = ?', [hash, email]);
    if (result && result.affectedRows && result.affectedRows > 0) {
      console.log(`Password updated for ${email}`);
    } else {
      console.warn(`No admin user updated. Check that ${email} exists.`);
    }
    process.exit(0);
  } catch (err) {
    console.error('Error updating password:', err.message);
    process.exit(2);
  }
}

const [,, email, newPassword] = process.argv;
resetPassword(email, newPassword);
