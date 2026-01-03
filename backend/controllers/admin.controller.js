const db = require('../database');
const bcrypt = require('bcrypt');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const [rows] = await db.execute('SELECT * FROM admins WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const admin = rows[0];
    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = 'mock-jwt-token';
    
    // Insert into jwt_sessions
    await db.execute(
      'INSERT INTO jwt_sessions (user_id, role, token) VALUES (?, ?, ?)',
      [admin.id, 'admin', token]
    );
    console.log("[DB INSERT] jwt_session for admin login:", admin.id);

    res.json({
      message: 'Login successful',
      token,
      admin: { id: admin.id, name: admin.full_name, email: admin.email, role: admin.role }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    // Return some stats
    const [studentCount] = await db.execute('SELECT COUNT(*) as count FROM students');
    const [mentorCount] = await db.execute('SELECT COUNT(*) as count FROM mentors');
    const [sessionCount] = await db.execute('SELECT COUNT(*) as count FROM live_sessions');

    res.json({
      students: studentCount[0].count,
      mentors: mentorCount[0].count,
      sessions: sessionCount[0].count
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getLiveSessions = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM live_sessions ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateLiveSessionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await db.execute(
      'UPDATE live_sessions SET status = ? WHERE id = ?',
      [status, id]
    );

    res.json({ message: 'Session status updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getForms = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM interest_forms ORDER BY created_at DESC');
    // Parse interests JSON
    const forms = rows.map(form => ({
      ...form,
      interests: JSON.parse(form.interests || '[]')
    }));
    res.json(forms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.assignMentor = async (req, res) => {
  try {
    const { id } = req.params;
    const { mentorId, mentorName } = req.body;

    await db.execute(
      'UPDATE interest_forms SET mentor_id = ?, mentor_name = ?, status = ? WHERE id = ?',
      [mentorId, mentorName, 'assigned', id]
    );

    res.json({ message: 'Mentor assigned successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
