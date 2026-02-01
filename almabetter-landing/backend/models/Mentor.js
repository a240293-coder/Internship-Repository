
const db = require('../config/database');

const Mentor = {
  async findAll() {
    const [rows] = await db.query('SELECT id, full_name AS name, email, expertise FROM mentors');
    return rows;
  },
  async findById(id) {
    const [rows] = await db.query('SELECT id, full_name AS name, email, expertise, experience_years, bio, created_at FROM mentors WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },
  async create(data) {
    const { full_name, email, password, expertise, experience_years, bio } = data;
    const expertiseCsv = Array.isArray(expertise) ? expertise.join(',') : (expertise || null);
    const [result] = await db.execute('INSERT INTO mentors (full_name, email, password, expertise, experience_years, bio) VALUES (?, ?, ?, ?, ?, ?)',
      [full_name, email, password, expertiseCsv, experience_years || null, bio || null]
    );
    const id = result.insertId;
    return this.findById(id);
  }
};

module.exports = Mentor;
