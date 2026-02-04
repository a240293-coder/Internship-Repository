// Mentor Controller
const db = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.getAssignedStudents = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const [rows] = await db.execute(
      `SELECT ma.*, s.full_name AS student_name, sp.status AS progress_status, sp.completion_date, sp.notes
       FROM mentor_assignments ma
       JOIN students s ON ma.student_id = s.id
       LEFT JOIN student_progress sp ON sp.assignment_id = ma.id
       WHERE ma.mentor_id = ?`,
      [mentorId]
    );
    res.json(rows);
  } catch (err) {
    console.error('MySQL error in getAssignedStudents:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
};

exports.updateStudentProgress = async (req, res) => {
  const { assignmentId, status, completionDate, notes } = req.body;
  await db.execute(
    `INSERT INTO student_progress (assignment_id, status, completion_date, notes)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE status = VALUES(status), completion_date = VALUES(completion_date), notes = VALUES(notes)`,
    [assignmentId, status, completionDate, notes]
  );
  res.json({ message: 'Progress updated' });
};
// (imports moved to top of file)

exports.register = async (req, res) => {
  console.log('Mentor registration endpoint hit:', req.body);
  try {
    const { full_name, email, password, expertise } = req.body;
    if (!full_name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const [existing] = await db.execute('SELECT * FROM mentors WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Accept expertise as array or comma-separated string. Store as CSV in DB.
    let expertiseValue = null;
    if (Array.isArray(expertise)) {
      expertiseValue = expertise.join(',');
    } else if (typeof expertise === 'string' && expertise.trim() !== '') {
      expertiseValue = expertise;
    }

    const [result] = await db.execute(
      'INSERT INTO mentors (full_name, email, password, expertise) VALUES (?, ?, ?, ?)',
      [full_name, email, hashedPassword, expertiseValue]
    );

    const id = result.insertId;
    console.log('[DB INSERT] mentor:', id);

    // jwt imported at top of file
    const token = jwt.sign(
      { id, role: 'MENTOR', email: email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    // Insert into jwt_sessions
    await db.execute(
      'INSERT INTO jwt_sessions (user_id, role, token) VALUES (?, ?, ?)',
      [id, 'mentor', token]
    );
    console.log('[DB INSERT] jwt_session for mentor:', id);

    res.status(201).json({
      message: 'Registration successful',
      token,
      mentor: { id, full_name, email, expertise: expertiseValue }
    });
  } catch (error) {
    console.error('Mentor registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const [rows] = await db.execute('SELECT * FROM mentors WHERE email = ?', [email]);
    console.log('Mentor lookup:', rows); // Debug log
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const mentor = rows[0];
    const match = await bcrypt.compare(password, mentor.password);
    console.log('Password match:', match); // Debug log
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: mentor.id, role: 'MENTOR', email: mentor.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
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

// Update mentor profile (expertise, bio, experience_years)
exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user && (req.user.id || req.user.userId);
    // Only allow mentors to update their own profile
    if (!userId || String(userId) !== String(id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { expertise, bio, experience_years } = req.body;
    let expertiseValue = null;
    if (Array.isArray(expertise)) expertiseValue = expertise.join(',');
    else if (typeof expertise === 'string') expertiseValue = expertise;

    await db.execute('UPDATE mentors SET expertise = ?, bio = COALESCE(?, bio), experience_years = COALESCE(?, experience_years) WHERE id = ?', [expertiseValue, bio || null, experience_years || null, id]);

    const [rows] = await db.execute('SELECT id, full_name, email, expertise, experience_years, bio, created_at FROM mentors WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Mentor not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAllMentors = async (req, res) => {
  try {
    const { expertise } = req.query;
    let query = 'SELECT id, full_name as name, email, expertise FROM mentors';
    let params = [];
    if (expertise) {
      query += ' WHERE expertise LIKE ?';
      params.push(`%${expertise}%`);
    }
    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a mentor session (meeting) for an assigned student
exports.createSession = async (req, res) => {
  try {
    const mentorId = req.user && (req.user.id || req.user.userId);
    const { studentId, agenda, description, timing, meetingLink } = req.body;
    if (!mentorId) return res.status(401).json({ message: 'Unauthenticated' });
    if (!studentId || !agenda || !timing || !meetingLink) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const [result] = await db.execute(
      'INSERT INTO mentor_sessions (mentor_id, student_id, agenda, description, timing, meeting_link) VALUES (?, ?, ?, ?, ?, ?)',
      [mentorId, studentId, agenda, description || null, timing, meetingLink]
    );
    console.log('[DB INSERT] mentor_sessions:', result.insertId);
    // Return created session id
    res.status(201).json({ message: 'Session created', id: result.insertId });
  } catch (err) {
    console.error('createSession error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get sessions created by the logged-in mentor
exports.getMentorSessions = async (req, res) => {
  try {
    const mentorId = req.user && (req.user.id || req.user.userId);
    if (!mentorId) return res.status(401).json({ message: 'Unauthenticated' });
    const [rows] = await db.execute(
      `SELECT ms.*, s.full_name AS student_name, m.full_name AS mentor_name
       FROM mentor_sessions ms
       LEFT JOIN students s ON s.id = ms.student_id
       LEFT JOIN mentors m ON m.id = ms.mentor_id
       WHERE ms.mentor_id = ?
       ORDER BY ms.timing DESC`,
      [mentorId]
    );
    res.json(rows);
  } catch (err) {
    console.error('getMentorSessions error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update session status
exports.updateSessionStatus = async (req, res) => {
  try {
    const mentorId = req.user && (req.user.id || req.user.userId);
    if (!mentorId) return res.status(401).json({ message: 'Unauthenticated' });
    const { id } = req.params;
    const { status } = req.body;
    console.log('[updateSessionStatus] Received status:', status, 'type:', typeof status);
    if (!id || !status) return res.status(400).json({ message: 'Missing id or status' });
    const allowed = ['scheduled', 'completed', 'cancelled'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });
    await db.execute(
      'UPDATE mentor_sessions SET status = ? WHERE id = ? AND mentor_id = ?',
      [status, id, mentorId]
    );
    res.json({ message: 'Status updated successfully' });
  } catch (err) {
    console.error('updateSessionStatus error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
