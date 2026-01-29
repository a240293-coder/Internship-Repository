const db = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const [existing] = await db.execute('SELECT * FROM students WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      'INSERT INTO students (full_name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    const id = result.insertId;
    console.log("[DB INSERT] student:", id);

    // Generate proper JWT token
    const token = jwt.sign(
      { id, role: 'STUDENT', email: email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Insert into jwt_sessions
    await db.execute(
      'INSERT INTO jwt_sessions (user_id, role, token) VALUES (?, ?, ?)',
      [id, 'STUDENT', token]
    );
    console.log("[DB INSERT] jwt_session for student:", id);

    res.status(201).json({
      message: 'Registration successful',
      token,
      student: { id, name, email }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const [rows] = await db.execute('SELECT * FROM students WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const student = rows[0];
    const match = await bcrypt.compare(password, student.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate proper JWT token
    const token = jwt.sign(
      { id: student.id, role: 'STUDENT', email: student.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Insert into jwt_sessions
    await db.execute(
      'INSERT INTO jwt_sessions (user_id, role, token) VALUES (?, ?, ?)',
      [student.id, 'STUDENT', token]
    );
    console.log("[DB INSERT] jwt_session for student login:", student.id);

    res.json({
      message: 'Login successful',
      token,
      student: { id: student.id, name: student.full_name, email: student.email }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute('SELECT id, full_name, email, interests, domain, career_goals, created_at FROM students WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get mentor sessions for the logged-in student
exports.getSessions = async (req, res) => {
  try {
    const studentId = req.user && (req.user.id || req.user.userId);
    if (!studentId) return res.status(401).json({ message: 'Unauthenticated' });
    const [rows] = await db.execute(
      `SELECT ms.*, m.full_name AS mentor_name
       FROM mentor_sessions ms
       LEFT JOIN mentors m ON m.id = ms.mentor_id
       WHERE ms.student_id = ?
       ORDER BY ms.timing DESC`,
      [studentId]
    );
    res.json(rows);
  } catch (err) {
    console.error('student getSessions error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.submitInterest = async (req, res) => {
  try {
    const { interests, desiredDomain, goals, studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    const interestsStr = Array.isArray(interests) ? interests.join(', ') : interests;

    await db.execute(
      'UPDATE students SET interests = ?, domain = ?, career_goals = ? WHERE id = ?',
      [interestsStr, desiredDomain, goals, studentId]
    );

    res.json({ message: 'Interest form submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
