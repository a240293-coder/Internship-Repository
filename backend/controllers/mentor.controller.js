const db = require('../database');
const bcrypt = require('bcrypt');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const [existing] = await db.execute('SELECT * FROM mentors WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await db.execute(
      'INSERT INTO mentors (full_name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    
    const id = result.insertId;
    console.log("[DB INSERT] mentor:", id);

    const token = 'mock-jwt-token';
    
    // Insert into jwt_sessions
    await db.execute(
      'INSERT INTO jwt_sessions (user_id, role, token) VALUES (?, ?, ?)',
      [id, 'mentor', token]
    );
    console.log("[DB INSERT] jwt_session for mentor:", id);

    res.status(201).json({
      message: 'Registration successful',
      token,
      mentor: { id, name, email }
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

    const [rows] = await db.execute('SELECT * FROM mentors WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const mentor = rows[0];
    const match = await bcrypt.compare(password, mentor.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = 'mock-jwt-token';
    
    // Insert into jwt_sessions
    await db.execute(
      'INSERT INTO jwt_sessions (user_id, role, token) VALUES (?, ?, ?)',
      [mentor.id, 'mentor', token]
    );
    console.log("[DB INSERT] jwt_session for mentor login:", mentor.id);

    res.json({
      message: 'Login successful',
      token,
      mentor: { id: mentor.id, name: mentor.full_name, email: mentor.email }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute('SELECT id, full_name, email, expertise, experience_years, bio, created_at FROM mentors WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllMentors = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id, full_name as name, email, expertise FROM mentors');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
