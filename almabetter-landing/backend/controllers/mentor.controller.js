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
    const { full_name, email, password, expertise, experience_years, bio } = req.body;
    if (!full_name || !email || !password) {
      return res.status(400).json({ message: 'full_name, email and password are required' });
    }

    const [existing] = await db.execute('SELECT * FROM mentors WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Accept expertise as array or comma-separated string. Store as CSV string.
    let expertiseCsv = null;
    if (Array.isArray(expertise)) expertiseCsv = expertise.join(',');
    else if (typeof expertise === 'string' && expertise.trim().length) expertiseCsv = expertise.trim();

    const [result] = await db.execute(
      'INSERT INTO mentors (full_name, email, password, expertise, experience_years, bio) VALUES (?, ?, ?, ?, ?, ?)',
      [full_name, email, hashedPassword, expertiseCsv, experience_years || null, bio || null]
    );

    const id = result.insertId;
    console.log("[DB INSERT] mentor:", id);

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
    console.log("[DB INSERT] jwt_session for mentor:", id);

    res.status(201).json({
      message: 'Registration successful',
      token,
      mentor: { id, full_name, email, expertise: expertiseCsv }
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

exports.getAllMentors = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id, full_name as name, email, expertise FROM mentors');
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
    // Validate student exists to avoid foreign key errors
    let sid = Number(studentId);
    if (Number.isNaN(sid) || sid <= 0) {
      return res.status(400).json({ message: 'Invalid studentId' });
    }
    let [studentRows] = await db.execute('SELECT id FROM students WHERE id = ?', [sid]);
    // If not found, try resolving as an interest form id or by student email (fallback)
    if (!studentRows || studentRows.length === 0) {
      let resolved = null;
      try {
        const [formRows] = await db.execute('SELECT * FROM interest_forms WHERE id = ?', [sid]);
        if (formRows && formRows.length > 0) {
          const form = formRows[0];
          const possibleStudentId = form.student_id || form.studentId || null;
          if (possibleStudentId) {
            const [s2] = await db.execute('SELECT id FROM students WHERE id = ?', [possibleStudentId]);
            if (s2 && s2.length > 0) resolved = s2[0].id;
          }
          if (!resolved && form.student_email) {
            const [s3] = await db.execute('SELECT id FROM students WHERE email = ?', [form.student_email]);
            if (s3 && s3.length > 0) resolved = s3[0].id;
          }
        }
      } catch (e) {
        // ignore and fallback to original behavior
      }
      if (!resolved) {
        return res.status(400).json({ message: 'Student not found' });
      }
      sid = resolved;
      [studentRows] = await db.execute('SELECT id FROM students WHERE id = ?', [sid]);
    }

    // Verify mentor is assigned to this student (optional enforcement)
    const [assignRows] = await db.execute(
      'SELECT id FROM mentor_assignments WHERE mentor_id = ? AND student_id = ?',
      [mentorId, sid]
    );
    if (!assignRows || assignRows.length === 0) {
      return res.status(403).json({ message: 'Mentor not assigned to this student' });
    }

    const [result] = await db.execute(
      'INSERT INTO mentor_sessions (mentor_id, student_id, agenda, description, timing, meeting_link) VALUES (?, ?, ?, ?, ?, ?)',
      [mentorId, sid, agenda, description || null, timing, meetingLink]
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

// Mark a mentor session as completed by the mentor who owns it
exports.markSessionComplete = async (req, res) => {
  try {
    const mentorId = req.user && (req.user.id || req.user.userId);
    if (!mentorId) return res.status(401).json({ message: 'Unauthenticated' });
    const sessionId = req.params.id;
    if (!sessionId) return res.status(400).json({ message: 'Missing session id' });
    const [result] = await db.execute(
      'UPDATE mentor_sessions SET status = ?, completed_at = NOW() WHERE id = ? AND mentor_id = ?',
      ['completed', sessionId, mentorId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Session not found or not owned by mentor' });
    }
    // Optionally update student progress table if relevant - keep minimal to avoid touching unrelated logic
    await db.execute(
      `INSERT INTO student_progress (assignment_id, status, completion_date)
       VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE status = VALUES(status), completion_date = VALUES(completion_date)`,
      [sessionId, 'completed']
    ).catch(() => {});

    res.json({ message: 'Session marked completed' });
  } catch (err) {
    console.error('markSessionComplete error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// General status update: completed or canceled
exports.updateSessionStatus = async (req, res) => {
  try {
    const mentorId = req.user && (req.user.id || req.user.userId);
    if (!mentorId) return res.status(401).json({ message: 'Unauthenticated' });
    const sessionId = req.params.id;
    if (!sessionId) return res.status(400).json({ message: 'Missing session id' });
    const { status } = req.body;
    const allowed = ['completed', 'canceled', 'cancelled'];
    if (!status || !allowed.includes(String(status).toLowerCase())) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const normalized = String(status).toLowerCase() === 'cancelled' ? 'canceled' : String(status).toLowerCase();

    const [result] = await db.execute(
      'UPDATE mentor_sessions SET status = ?, completed_at = CASE WHEN ? = ' +
      "'completed'" + ' THEN NOW() ELSE completed_at END, canceled_at = CASE WHEN ? = ' +
      "'canceled'" + ' THEN NOW() ELSE canceled_at END WHERE id = ? AND mentor_id = ?',
      [normalized, normalized, normalized, sessionId, mentorId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Session not found or not owned by mentor' });
    }

    if (normalized === 'completed') {
      await db.execute(
        `INSERT INTO student_progress (assignment_id, status, completion_date)
         VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE status = VALUES(status), completion_date = VALUES(completion_date)`,
        [sessionId, 'completed']
      ).catch(() => {});
    }

    res.json({ message: 'Session status updated', status: normalized });
  } catch (err) {
    console.error('updateSessionStatus error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
