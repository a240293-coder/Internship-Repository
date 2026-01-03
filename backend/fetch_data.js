const db = require('./database');

async function fetchData() {
  try {
    console.log('--- Students ---');
    const [students] = await db.execute('SELECT * FROM students');
    console.table(students);

    console.log('\n--- Mentors ---');
    const [mentors] = await db.execute('SELECT * FROM mentors');
    console.table(mentors);

    console.log('\n--- Interest Forms ---');
    const [forms] = await db.execute('SELECT * FROM interest_forms');
    console.table(forms);

    console.log('\n--- Live Sessions ---');
    const [sessions] = await db.execute('SELECT * FROM live_sessions');
    console.table(sessions);

    console.log('\n--- Admins ---');
    const [admins] = await db.execute('SELECT * FROM admins');
    console.table(admins);

  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    process.exit();
  }
}

fetchData();
