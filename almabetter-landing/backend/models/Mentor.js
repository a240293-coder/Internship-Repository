
const db = require('../config/database');

const Mentor = {
  async findAll() {
    const [rows] = await db.query('SELECT id, full_name AS name, email FROM mentors');
    return rows;
  },
  // Add more helper functions as needed (findById, create, etc.)
};

module.exports = Mentor;
