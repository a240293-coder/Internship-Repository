const db = require('./config/database');

(async () => {
  try {
    console.log('Checking mentor_sessions status column...');
    const [rows] = await db.query(`
      SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'mentor_sessions' 
      AND COLUMN_NAME = 'status'
    `);
    console.log('Current status column type:', rows[0]?.COLUMN_TYPE);
    
    console.log('Updating status column...');
    await db.execute(`
      ALTER TABLE mentor_sessions 
      MODIFY COLUMN status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled';
    `);
    console.log('✅ Status column updated successfully');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err.message);
    process.exit(1);
  }
})();
