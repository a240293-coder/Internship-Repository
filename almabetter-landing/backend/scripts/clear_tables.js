const db = require('../config/database');

(async () => {
  const tables = ['mentor_assignments', 'student_progress', 'interest_forms'];
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Temporarily disable foreign key checks to allow deletes
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    for (const t of tables) {
      // Check table exists in current database
      const [exists] = await connection.execute(
        `SELECT COUNT(*) as c FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?`,
        [t]
      );
      if (exists[0].c === 0) {
        console.log(`Skipping, table not found: ${t}`);
        continue;
      }

      // Delete all rows
      await connection.execute(`DELETE FROM \`${t}\``);
      console.log(`Cleared table: ${t}`);
    }

    // Re-enable FK checks and commit
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    await connection.commit();
    console.log('All requested tables cleared successfully.');
  } catch (err) {
    await connection.rollback();
    console.error('Error clearing tables:', err.message || err);
    process.exitCode = 1;
  } finally {
    connection.release();
  }
})();
