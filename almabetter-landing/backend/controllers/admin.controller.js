// Admin Controller
const db = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.assignMentor = async (req, res) => {
  const { studentId, mentorId, formId } = req.body;
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Fetch mentor name
    const [mentorRows] = await connection.execute(
      'SELECT full_name FROM mentors WHERE id = ?',
      [mentorId]
    );
    const mentorName = mentorRows[0]?.full_name || '';

    // Prevent duplicate assignment for same student-mentor pair
    const [existing] = await connection.execute(
      'SELECT id FROM mentor_assignments WHERE student_id = ? AND mentor_id = ? AND (status = ? OR status = ?)',
      [studentId, mentorId, 'assigned', 'completed']
    );
    if (existing && existing.length > 0) {
      await connection.rollback();
      return res.status(409).json({ message: 'This student is already assigned to this mentor' });
    }

    // Determine which interest form to update: prefer explicit formId, otherwise the most recent form for the student
    let targetFormId = formId || null;
    if (!targetFormId) {
      const [frows] = await connection.execute(
        'SELECT id FROM interest_forms WHERE student_id = ? ORDER BY created_at DESC LIMIT 1',
        [studentId]
      );
      targetFormId = frows && frows[0] && frows[0].id ? frows[0].id : null;
    }

    // Insert assignment (include form_id when available)
    if (targetFormId) {
      await connection.execute(
        'INSERT INTO mentor_assignments (student_id, mentor_id, form_id, status) VALUES (?, ?, ?, ?)',
        [studentId, mentorId, targetFormId, 'assigned']
      );
      // Update only the selected interest form row
      await connection.execute(
        'UPDATE interest_forms SET status = ?, mentor_id = ?, mentor_name = ? WHERE id = ?',
        ['assigned', mentorId, mentorName, targetFormId]
      );
    } else {
      // Fallback: insert assignment without form_id and do not bulk-update all forms
      await connection.execute(
        'INSERT INTO mentor_assignments (student_id, mentor_id, status) VALUES (?, ?, ?)',
        [studentId, mentorId, 'assigned']
      );
    }

    await connection.commit();
    res.status(200).json({ message: 'Mentor assigned successfully' });
  } catch (err) {
    if (connection) {
      try { await connection.rollback(); } catch (rollbackErr) { console.error('Rollback failed:', rollbackErr); }
    }
    console.error('Error in assignMentor:', err);
    res.status(500).json({ message: 'Assignment failed', error: err.message });
  } finally {
    if (connection) connection.release();
  }
};

exports.getAssignmentHistory = async (req, res) => {
  try {
    const { page = 1, pageSize = 20 } = req.query;
    const safePageSize = parseInt(pageSize) > 0 ? parseInt(pageSize) : 10;
    const safePage = parseInt(page) > 0 ? parseInt(page) : 1;
    const offset = (safePage - 1) * safePageSize;
    // Get both mentor assignments and completed live sessions for admin history
    const [assignmentRows] = await db.execute(
      `SELECT ma.id, 'assignment' AS type, ma.student_id, ma.mentor_id, ma.status, ma.assigned_at, ma.completed_at, s.full_name AS student_name, m.full_name AS mentor_name
       FROM mentor_assignments ma
       JOIN students s ON ma.student_id = s.id
       JOIN mentors m ON ma.mentor_id = m.id
       WHERE ma.status = 'assigned' OR ma.status = 'completed'
       ORDER BY ma.assigned_at DESC
       LIMIT ? OFFSET ?`,
      [safePageSize, offset]
    );
    const [sessionRows] = await db.execute(
      `SELECT ls.id, 'live_session' AS type, ls.student_id, ls.mentor_id, ls.status, ls.created_at AS assigned_at, ls.completed_at, s.full_name AS student_name, m.full_name AS mentor_name
       FROM live_sessions ls
       LEFT JOIN students s ON ls.student_id = s.id
       LEFT JOIN mentors m ON ls.mentor_id = m.id
       WHERE ls.status = 'COMPLETED'
       ORDER BY ls.completed_at DESC
       LIMIT ? OFFSET ?`,
      [safePageSize, offset]
    );
    // Merge and sort by completed_at/assigned_at DESC
    const allRows = [...assignmentRows, ...sessionRows].sort((a, b) => {
      const aTime = a.completed_at || a.assigned_at;
      const bTime = b.completed_at || b.assigned_at;
      return new Date(bTime) - new Date(aTime);
    });
    res.json({ data: allRows });
  } catch (error) {
    console.error('Error in getAssignmentHistory:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a single assignment history record (admin only)
exports.deleteAssignmentHistory = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ message: 'Missing id' });
    // Delete the assignment record
    await db.execute('DELETE FROM mentor_assignments WHERE id = ?', [id]);
    // Log admin action
    const adminId = req.user && req.user.id;
    await db.execute(
      'INSERT INTO admin_activity_logs (admin_id, action, details, created_at) VALUES (?, ?, ?, NOW())',
      [adminId || null, 'delete_assignment_history', `Deleted assignment history id=${id}`]
    );
    res.json({ success: true, message: 'History record deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Clear all assignment history (admin only) — deletes all rows in mentor_assignments
exports.clearAssignmentHistory = async (req, res) => {
  try {
    await db.execute('DELETE FROM mentor_assignments');
    const adminId = req.user && req.user.id;
    await db.execute(
      'INSERT INTO admin_activity_logs (admin_id, action, details, created_at) VALUES (?, ?, ?, NOW())',
      [adminId || null, 'clear_assignment_history', 'Cleared all assignment history']
    );
    res.json({ success: true, message: 'All history cleared' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// Get completed live sessions (with filtering, pagination, export)
exports.getCompletedSessions = async (req, res) => {
  try {
    const { search = '', page = 1, pageSize = 20, exportType } = req.query;
    const safePageSize = Number(pageSize) > 0 ? Number(pageSize) : 10;
    const safePage = Number(page) > 0 ? Number(page) : 1;
    const offset = (safePage - 1) * safePageSize;
    let where = "WHERE status = 'completed'";
    let params = [];
    if (search) {
      where += " AND (studentName LIKE ? OR studentEmail LIKE ? OR phone LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    // Use LIMIT and OFFSET as literals for MySQL compatibility
    const limitClause = `LIMIT ${Number(safePageSize)} OFFSET ${Number(offset)}`;
    const sql = `SELECT * FROM live_session_bookings ${where} ORDER BY completed_at DESC ${limitClause}`;
    const [rows] = await db.execute(sql, params);
    console.log('[getCompletedSessions] rows:', rows);
    if (exportType === 'csv') {
      const csv = [Object.keys(rows[0] || {}).join(',')].concat(rows.map(r => Object.values(r).join(','))).join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="completed_sessions.csv"');
      return res.send(csv);
    }
    res.json({ data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get mentor assignments (with filtering, pagination, export)
exports.getMentorAssignments = async (req, res) => {
  try {
    const { search = '', page = 1, pageSize = 20, exportType } = req.query;
    const safePageSize = parseInt(pageSize) > 0 ? parseInt(pageSize) : 10;
    const safePage = parseInt(page) > 0 ? parseInt(page) : 1;
    const offset = (safePage - 1) * safePageSize;
      const searchTerm = (search || '').trim();
      // Use LIMIT/OFFSET as literals for MySQL compatibility
      const limitClause = `LIMIT ${Number(safePageSize)} OFFSET ${Number(offset)}`;
      let sql = '';
      let params = [];
      if (searchTerm.length > 0) {
        sql = `SELECT ma.*,
             COALESCE(s.full_name,
               (SELECT student_name FROM interest_forms WHERE student_id = ma.student_id ORDER BY created_at DESC LIMIT 1),
               '') AS student_name,
             COALESCE(m.full_name,
               (SELECT mentor_name FROM interest_forms WHERE student_id = ma.student_id ORDER BY created_at DESC LIMIT 1),
               '') AS mentor_name,
             (SELECT id FROM interest_forms WHERE student_id = ma.student_id ORDER BY created_at DESC LIMIT 1) AS form_id,
             (SELECT student_name FROM interest_forms WHERE student_id = ma.student_id ORDER BY created_at DESC LIMIT 1) AS form_student_name,
             (SELECT mentor_name FROM interest_forms WHERE student_id = ma.student_id ORDER BY created_at DESC LIMIT 1) AS form_mentor_name
             FROM mentor_assignments ma
             LEFT JOIN students s ON ma.student_id = s.id
             LEFT JOIN mentors m ON ma.mentor_id = m.id
             WHERE ma.student_id IN (SELECT id FROM students WHERE full_name LIKE ? OR email LIKE ? OR phone LIKE ?)
             ORDER BY ma.assigned_at DESC ${limitClause}`;
        params = [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`];
      } else {
        sql = `SELECT ma.*,
             COALESCE(s.full_name,
               (SELECT student_name FROM interest_forms WHERE student_id = ma.student_id ORDER BY created_at DESC LIMIT 1),
               '') AS student_name,
             COALESCE(m.full_name,
               (SELECT mentor_name FROM interest_forms WHERE student_id = ma.student_id ORDER BY created_at DESC LIMIT 1),
               '') AS mentor_name,
             (SELECT id FROM interest_forms WHERE student_id = ma.student_id ORDER BY created_at DESC LIMIT 1) AS form_id,
             (SELECT student_name FROM interest_forms WHERE student_id = ma.student_id ORDER BY created_at DESC LIMIT 1) AS form_student_name,
             (SELECT mentor_name FROM interest_forms WHERE student_id = ma.student_id ORDER BY created_at DESC LIMIT 1) AS form_mentor_name
             FROM mentor_assignments ma
             LEFT JOIN students s ON ma.student_id = s.id
             LEFT JOIN mentors m ON ma.mentor_id = m.id
             ORDER BY ma.assigned_at DESC ${limitClause}`;
        params = [];
      }
      // Debug: log SQL and params
      console.log('[getMentorAssignments] SQL:', sql);
      console.log('[getMentorAssignments] Params:', params);
      try {
        const [rows] = await db.execute(sql, params);
        if (exportType === 'csv') {
          const csv = [Object.keys(rows[0] || {}).join(',')].concat(rows.map(r => Object.values(r).join(','))).join('\n');
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', 'attachment; filename="mentor_assignments.csv"');
          return res.send(csv);
        }
        return res.json({ data: rows });
      } catch (error) {
        console.error('Error in getMentorAssignments (SQL/params):', sql, params, error);
        return res.status(500).json({ message: 'Server error', error: error.message });
      }
    if (exportType === 'csv') {
      const csv = [Object.keys(rows[0] || {}).join(',')].concat(rows.map(r => Object.values(r).join(','))).join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="mentor_assignments.csv"');
      return res.send(csv);
    }
    res.json({ data: rows });
  } catch (error) {
    console.error('Error in getMentorAssignments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get admin audit logs (with filtering, pagination, export)
exports.getAdminAuditLogs = async (req, res) => {
  try {
    const { search = '', page = 1, pageSize = 20, exportType } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    let where = '';
    let params = [];
    if (search) {
      where = "WHERE description LIKE ?";
      params.push(`%${search}%`);
    }
    const [rows] = await db.execute(
      `SELECT * FROM admin_activity_logs ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(pageSize), offset]
    );
    if (exportType === 'csv') {
      const csv = [Object.keys(rows[0] || {}).join(',')].concat(rows.map(r => Object.values(r).join(','))).join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="admin_audit_logs.csv"');
      return res.send(csv);
    }
    res.json({ data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
// (imports moved to top of file)

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('[ADMIN LOGIN DEBUG] Email from request:', email);
    console.log('[ADMIN LOGIN DEBUG] Password from request:', password);
    // Extra debug: log query and columns
    console.log('[ADMIN LOGIN DEBUG] Executing query: SELECT * FROM super_admins WHERE email = ?', email);
    const [rows] = await db.execute('SELECT * FROM super_admins WHERE email = ?', [email]);
    if (rows.length > 0) {
      console.log('[ADMIN LOGIN DEBUG] DB row columns:', Object.keys(rows[0]));
      console.log('[ADMIN LOGIN DEBUG] DB row values:', rows[0]);
    }
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    // No duplicate declaration
    if (rows.length === 0) {
      console.log('[ADMIN LOGIN DEBUG] No admin found for email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const admin = rows[0];
    console.log('[ADMIN LOGIN DEBUG] Admin record from DB:', admin);
    const match = await bcrypt.compare(password, admin.password);
    console.log('[ADMIN LOGIN DEBUG] bcrypt.compare result:', match);
    if (!match) {
      console.log('[ADMIN LOGIN DEBUG] Password mismatch for email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // JWT imported at top of file
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'admin', name: admin.full_name },
      process.env.JWT_SECRET || 'changeme',
      { expiresIn: '7d' }
    );

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

// Regular admin login
exports.adminLogin = async (req, res) => {
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

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'admin', name: admin.full_name },
      process.env.JWT_SECRET || 'changeme',
      { expiresIn: '7d' }
    );

    await db.execute(
      'INSERT INTO jwt_sessions (user_id, role, token) VALUES (?, ?, ?)',
      [admin.id, 'admin', token]
    );

    res.json({
      message: 'Login successful',
      token,
      admin: { id: admin.id, name: admin.full_name, email: admin.email }
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
    const [sessionCount] = await db.execute('SELECT COUNT(*) as count FROM live_session_bookings');

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
    // Select all required fields for admin to contact student and conduct session
    const [rows] = await db.execute(
      `SELECT id, studentName, studentEmail, phone, preferredDate, preferredTime, sessionTopic, adminId, status, created_at
       FROM live_session_bookings
       ORDER BY created_at ASC`
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get mentor details by id (admin)
exports.getMentorById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Missing mentor id' });
    const [rows] = await db.execute(
      'SELECT id, full_name AS name, email, expertise, experience_years, bio, created_at FROM mentors WHERE id = ? LIMIT 1',
      [id]
    );
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Mentor not found' });
    res.json({ data: rows[0] });
  } catch (error) {
    console.error('Error in getMentorById:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get mentor sessions by mentor id (admin)
exports.getMentorSessionsAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Missing mentor id' });
    const [rows] = await db.execute(
      `SELECT ms.*, s.full_name AS student_name
       FROM mentor_sessions ms
       LEFT JOIN students s ON s.id = ms.student_id
       WHERE ms.mentor_id = ?
       ORDER BY ms.timing DESC`,
      [id]
    );
    res.json({ data: rows });
  } catch (error) {
    console.error('Error in getMentorSessionsAdmin:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get students assigned to a mentor (admin)
exports.getMentorStudentsAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Missing mentor id' });
    const [rows] = await db.execute(
      `SELECT DISTINCT s.id, s.full_name AS name, s.email
       FROM mentor_assignments ma
       JOIN students s ON s.id = ma.student_id
       WHERE ma.mentor_id = ?`,
      [id]
    );
    res.json({ data: rows });
  } catch (error) {
    console.error('Error in getMentorStudentsAdmin:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// Mark a live session as completed (admin action)
exports.markLiveSessionCompleted = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Missing session id' });
    // Update status to completed
    await db.execute(
      'UPDATE live_session_bookings SET status = ?, completed_at = NOW() WHERE id = ?',
      ['completed', id]
    );
    res.json({ message: 'Session marked as completed.' });
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
      'UPDATE live_session_bookings SET status = ? WHERE id = ?',
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
    // Return interest forms and resolve student name/email from students table when available
    // Try to resolve student by id OR by email so anonymous or duplicate submissions still show a name
    const sql = `SELECT f.*, COALESCE(f.student_name, s.full_name) AS resolved_student_name, COALESCE(f.student_email, s.email) AS resolved_student_email
           FROM interest_forms f
           LEFT JOIN students s ON (f.student_id = s.id OR (f.student_email IS NOT NULL AND f.student_email = s.email))
           ORDER BY f.created_at DESC`;
    const [rows] = await db.execute(sql);
    // Normalize and attach fallback fields expected by frontend
    const forms = (rows || []).map(row => ({
      ...row,
      student_name: row.student_name || row.resolved_student_name || null,
      studentEmail: row.student_email || row.resolved_student_email || null,
      studentName: row.student_name || row.resolved_student_name || null,
      student_email: row.student_email || row.resolved_student_email || null,
      interests: (typeof row.interests === 'string') ? (JSON.parse(row.interests || '[]') || []) : (Array.isArray(row.interests) ? row.interests : row.interests),
      desiredDomain: row.desired_domain || row.desiredDomain || null,
      created_at: row.created_at || row.createdAt || null,
    }));
    res.json(forms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.assignMentorToForm = async (req, res) => {
  try {
    const { id } = req.params;
    const { mentorId, mentorName } = req.body;

    // Validate inputs to avoid passing undefined to SQL bind params
    if (!id) return res.status(400).json({ message: 'Missing form id in params' });
    if (mentorId === undefined || mentorId === null) return res.status(400).json({ message: 'Missing mentorId in request body' });

    const safeMentorName = typeof mentorName === 'string' ? mentorName : '';
    // Debug log
    console.log('[assignMentorToForm] params:', { id, mentorId, mentorName: safeMentorName });

    // Prevent assigning multiple mentors to the same student/form.
    try {
      const [existing] = await db.execute('SELECT mentor_id, status FROM interest_forms WHERE id = ?', [id]);
      if (existing && existing[0]) {
        const existingMentorId = existing[0].mentor_id;
        const existingStatus = existing[0].status;
        if (existingMentorId || String(existingStatus).toLowerCase() === 'assigned') {
          return res.status(409).json({ message: 'This student already has a mentor assigned' });
        }
      }
    } catch (chkErr) {
      console.warn('[assignMentorToForm] existing assignment check failed:', chkErr.message);
      // proceed — failure to check should not silently allow duplicates, but we fallback to continuing
    }

    // If mentorName is empty, try to look it up from the mentors table
    let finalMentorName = safeMentorName;
    if (!finalMentorName) {
      try {
        const [mrows] = await db.execute('SELECT full_name FROM mentors WHERE id = ?', [mentorId]);
        finalMentorName = mrows && mrows[0] && mrows[0].full_name ? mrows[0].full_name : finalMentorName;
      } catch (lookupErr) {
        console.warn('[assignMentorToForm] mentor name lookup failed:', lookupErr.message);
      }
    }

    await db.execute(
      'UPDATE interest_forms SET mentor_id = ?, mentor_name = ?, status = ? WHERE id = ?',
      [mentorId, finalMentorName, 'assigned', id]
    );

    // Also insert into mentor_assignments table so assignment history reflects this action
    try {
      // Find student_id for this form
      const [formRows] = await db.execute('SELECT student_id FROM interest_forms WHERE id = ? LIMIT 1', [id]);
      const studentId = formRows && formRows[0] && formRows[0].student_id ? formRows[0].student_id : null;
      if (studentId) {
        // Prevent duplicate student-mentor assignment records
        const [existingAssign] = await db.execute('SELECT id FROM mentor_assignments WHERE student_id = ? AND mentor_id = ? LIMIT 1', [studentId, mentorId]);
        if (!existingAssign || !existingAssign.length) {
          await db.execute('INSERT INTO mentor_assignments (student_id, mentor_id, status) VALUES (?, ?, ?)', [studentId, mentorId, 'assigned']);
        }
      }
    } catch (insErr) {
      console.warn('[assignMentorToForm] failed to insert mentor_assignments record:', insErr && insErr.message);
    }

    res.json({ message: 'Mentor assigned successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new admin (super admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if email already exists in admins table
    const [existing] = await db.execute('SELECT id FROM admins WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Admin with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get count of existing admins to determine next sequential ID
    const [count] = await db.execute('SELECT COUNT(*) as total FROM admins');
    const nextId = count[0].total + 1;

    // Insert new admin with specific ID
    await db.execute(
      'INSERT INTO admins (id, full_name, email, password) VALUES (?, ?, ?, ?)',
      [nextId, full_name, email, hashedPassword]
    );

    res.status(201).json({ message: 'Admin created successfully' });
  } catch (error) {
    console.error('Error in createAdmin:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all admins (super admin only) - excludes super_admin from list
exports.getAllAdmins = async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT id, full_name, email, created_at FROM admins ORDER BY id ASC"
    );
    res.json({ admins: rows });
  } catch (error) {
    console.error('Error in getAllAdmins:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete admin (super admin only)
exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Admin ID is required' });
    }

    // Check if admin exists
    const [admin] = await db.execute('SELECT email FROM admins WHERE id = ?', [id]);
    if (admin.length === 0) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Delete admin
    await db.execute('DELETE FROM admins WHERE id = ?', [id]);

    // Get all remaining admins
    const [allAdmins] = await db.execute('SELECT id, full_name, email, password, created_at FROM admins ORDER BY id');
    
    // Delete all and reinsert with sequential IDs
    await db.execute('DELETE FROM admins');
    
    for (let i = 0; i < allAdmins.length; i++) {
      await db.execute(
        'INSERT INTO admins (id, full_name, email, password, created_at) VALUES (?, ?, ?, ?, ?)',
        [i + 1, allAdmins[i].full_name, allAdmins[i].email, allAdmins[i].password, allAdmins[i].created_at]
      );
    }

    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Error in deleteAdmin:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
