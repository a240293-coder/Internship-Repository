const db = require('../config/database');

exports.submitForm = async (req, res) => {
  try {
    const { interests, desiredDomain, goals, studentEmail, studentName, studentId } = req.body;
    const resumeUrl = req?.file?.filename ? `/secure-uploads/${req.file.filename}` : null;

    // Handle interests: if it's a string (from FormData), use it directly or parse/stringify to be safe.
    // If it came as JSON array (from raw JSON request), stringify it.
    let interestsStr = interests ?? null;
    if (interests !== undefined && interests !== null && typeof interests !== 'string') {
        interestsStr = JSON.stringify(interests);
    }

    // Determine student identifier: prefer verified JWT info, fall back to provided body fields
    const sidFromToken = req.user && (req.user.id || req.user.userId || req.user.fid || req.user.studentId);
    const semailFromToken = req.user && (req.user.email || req.user.studentEmail);
    const sid = sidFromToken ?? (studentId ?? null);
    const semail = semailFromToken ?? (studentEmail ?? null);
    console.log('[submitForm] identifiers (token/body):', { sidFromToken, semailFromToken, sid, semail });
    if (!sid && !semail) {
      return res.status(400).json({ message: 'Missing student identifier (studentId or studentEmail) in request' });
    }

    // Check for existing form by student_id or student_email for the SAME desired domain
    // Allow multiple submissions per student as long as the desiredDomain differs.
    let existing = [];
    const desiredNorm = (desiredDomain || '').trim().toLowerCase();
    if (desiredNorm) {
      // Use case-insensitive comparison in SQL using LOWER
      if (sid && semail) {
        const sql = 'SELECT * FROM interest_forms WHERE (student_id = ? OR student_email = ?) AND LOWER(COALESCE(desired_domain,\'\')) = ? LIMIT 1';
        const [rows] = await db.execute(sql, [sid, semail, desiredNorm]);
        existing = rows;
      } else if (sid) {
        const sql = 'SELECT * FROM interest_forms WHERE student_id = ? AND LOWER(COALESCE(desired_domain,\'\')) = ? LIMIT 1';
        const [rows] = await db.execute(sql, [sid, desiredNorm]);
        existing = rows;
      } else if (semail) {
        const sql = 'SELECT * FROM interest_forms WHERE student_email = ? AND LOWER(COALESCE(desired_domain,\'\')) = ? LIMIT 1';
        const [rows] = await db.execute(sql, [semail, desiredNorm]);
        existing = rows;
      }
    } else {
      // If no desiredDomain provided, fall back to prior behavior (check any existing form)
      if (sid && semail) {
        const [rows] = await db.execute('SELECT * FROM interest_forms WHERE student_id = ? OR student_email = ? LIMIT 1', [sid, semail]);
        existing = rows;
      } else if (sid) {
        const [rows] = await db.execute('SELECT * FROM interest_forms WHERE student_id = ? LIMIT 1', [sid]);
        existing = rows;
      } else if (semail) {
        const [rows] = await db.execute('SELECT * FROM interest_forms WHERE student_email = ? LIMIT 1', [semail]);
        existing = rows;
      }
    }
    console.log('[submitForm] existing check rows:', existing && existing.length);
    if (existing && existing.length) {
      return res.status(409).json({ message: 'Interest form already submitted for this student' });
    }

    // Insert new form
    // If studentName not provided, try to look it up from `students` table using student id or email
    let finalStudentName = studentName ?? null;
    try {
      if (!finalStudentName) {
        if (sid) {
          const [srows] = await db.execute('SELECT full_name FROM students WHERE id = ? LIMIT 1', [sid]);
          if (srows && srows[0] && srows[0].full_name) finalStudentName = srows[0].full_name;
        }
        if (!finalStudentName && semail) {
          const [srows2] = await db.execute('SELECT full_name FROM students WHERE email = ? LIMIT 1', [semail]);
          if (srows2 && srows2[0] && srows2[0].full_name) finalStudentName = srows2[0].full_name;
        }
      }
    } catch (lookupErr) {
      console.warn('[submitForm] student name lookup failed:', lookupErr && lookupErr.message);
    }

    const [result] = await db.execute(
      'INSERT INTO interest_forms (student_id, student_name, student_email, interests, desired_domain, goals, resume_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        sid,
        finalStudentName,
        semail,
        interestsStr ?? null,
        desiredDomain ?? null,
        goals ?? null,
        resumeUrl ?? null
      ]
    );
    
    console.log("[DB INSERT] interest_form:", result.insertId);
    if (resumeUrl) {
      console.log("[FILE UPLOAD] resume:", resumeUrl);
    }

    res.status(201).json({ message: 'Form submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getForm = async (req, res) => {
  try {
    const userId = req.query.userId;
    const email = req.query.email;
    console.log('[getForm] query:', req.query, 'headers Authorization present:', !!req.headers['authorization']);
    let query, params;
    if (userId) {
      // Frontend sends ?userId=<studentId>; match against student_id column
      query = 'SELECT * FROM interest_forms WHERE student_id = ? ORDER BY id DESC LIMIT 1';
      params = [userId];
    } else if (email) {
      query = 'SELECT * FROM interest_forms WHERE student_email = ? ORDER BY id DESC LIMIT 1';
      params = [email];
    } else {
      return res.status(400).json({ message: 'Missing userId or email' });
    }
    const [rows] = await db.execute(query, params);
    console.log('[getForm] rows:', rows && rows.length);
    if (!rows.length) {
      return res.status(404).json({ message: 'Form not found' });
    }
    const row = rows[0];
    // Normalize DB snake_case to camelCase for frontend
    const normalized = {
      ...row,
      id: row.id,
      studentId: row.student_id || row.studentId || null,
      studentName: row.student_name || row.studentName || null,
      studentEmail: row.student_email || row.studentEmail || null,
      interests: (typeof row.interests === 'string') ? (JSON.parse(row.interests || '[]') || []) : (Array.isArray(row.interests) ? row.interests : row.interests),
      desiredDomain: row.desired_domain || row.desiredDomain || null,
      goals: row.goals || null,
      resumeUrl: row.resume_url || row.resumeUrl || null,
      status: row.status || null,
      mentorId: row.mentor_id || row.mentorId || null,
      mentorName: row.mentor_name || row.mentorName || null,
      createdAt: row.created_at || row.createdAt || null,
      updatedAt: row.updated_at || row.updatedAt || null
    };
    res.json(normalized);
  } catch (error) {
    console.error(error);

    res.status(500).json({ message: 'Server error' });
  }
};

exports.getForms = async (req, res) => {
  try {
    const userId = req.query.userId;
    const email = req.query.email;
    console.log('[getForms] query:', req.query, 'headers Authorization present:', !!req.headers['authorization']);
    let query, params;
    if (userId) {
      // Return all forms for student_id ordered newest first
      query = 'SELECT * FROM interest_forms WHERE student_id = ? ORDER BY id DESC';
      params = [userId];
    } else if (email) {
      query = 'SELECT * FROM interest_forms WHERE student_email = ? ORDER BY id DESC';
      params = [email];
    } else {
      return res.status(400).json({ message: 'Missing userId or email' });
    }
    const [rows] = await db.execute(query, params);
    const normalized = (rows || []).map(row => ({
      ...row,
      id: row.id,
      studentId: row.student_id || row.studentId || null,
      studentName: row.student_name || row.studentName || null,
      studentEmail: row.student_email || row.studentEmail || null,
      interests: (typeof row.interests === 'string') ? (JSON.parse(row.interests || '[]') || []) : (Array.isArray(row.interests) ? row.interests : row.interests),
      desiredDomain: row.desired_domain || row.desiredDomain || null,
      goals: row.goals || null,
      resumeUrl: row.resume_url || row.resumeUrl || null,
      status: row.status || null,
      mentorId: row.mentor_id || row.mentorId || null,
      mentorName: row.mentor_name || row.mentorName || null,
      createdAt: row.created_at || row.createdAt || null,
      updatedAt: row.updated_at || row.updatedAt || null
    }));
    res.json(normalized);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateForm = async (req, res) => {
  try {
    console.log('[updateForm] headers Authorization present:', !!req.headers['authorization']);
    // Prefer explicit form id in body for updating a specific submission
    const formId = req.body.formId || req.body.id;
    const userId = req.user && (req.user.id || req.user.userId || req.user.fid || req.user.studentId) || req.body.studentId;
    const email = req.user && (req.user.email || req.user.studentEmail) || req.body.studentEmail;

    if (!userId && !email && !formId) {
      return res.status(400).json({ message: 'Missing student identifier (studentId or studentEmail) or formId in request' });
    }

    // Find existing form by id when provided, otherwise fallback to previous behavior
    let existing = null;
    if (formId) {
      const [rows] = await db.execute('SELECT * FROM interest_forms WHERE id = ? LIMIT 1', [formId]);
      existing = rows && rows[0];
      if (!existing) return res.status(404).json({ message: 'Form not found' });
      // authorize: student may only update their own forms
      const role = req.user && req.user.role ? String(req.user.role).toLowerCase() : '';
      if (role === 'student') {
        const ownerId = existing.student_id;
        const ownerEmail = existing.student_email;
        if (!(ownerId && String(ownerId) === String(userId)) && !(ownerEmail && ownerEmail === String(email))) {
          return res.status(403).json({ message: 'Not authorized to update this form' });
        }
      }
    } else {
      // fallback: find by student identifiers
      let query = '';
      let params = [];
      if (userId && email) {
        query = 'SELECT * FROM interest_forms WHERE student_id = ? OR student_email = ? LIMIT 1';
        params = [userId, email];
      } else if (userId) {
        query = 'SELECT * FROM interest_forms WHERE student_id = ? LIMIT 1';
        params = [userId];
      } else {
        query = 'SELECT * FROM interest_forms WHERE student_email = ? LIMIT 1';
        params = [email];
      }
      const [rows] = await db.execute(query, params);
      existing = rows && rows[0];
      if (!existing) {
        return res.status(404).json({ message: 'No existing form found to update' });
      }
    }

    // Handle resume upload if present
    let resumeUrl = existing.resume_url;
    if (req.file && req.file.filename) {
      resumeUrl = `/secure-uploads/${req.file.filename}`;
    } else if (req.files && req.files.resume) {
      // multer single handles req.file; but keep this for safety
      resumeUrl = `/secure-uploads/${req.files.resume.name}`;
    }

    // Prepare new values (use provided or keep existing)
    const { interests, desiredDomain, goals, studentName, studentEmail } = req.body;
    let interestsStr = interests ?? existing.interests;
    if (interests !== undefined && interests !== null && typeof interests !== 'string') {
      interestsStr = JSON.stringify(interests);
    }

    const updated = {
      student_name: studentName ?? existing.student_name,
      student_email: studentEmail ?? existing.student_email,
      interests: interestsStr,
      desired_domain: desiredDomain ?? existing.desired_domain,
      goals: goals ?? existing.goals,
      resume_url: resumeUrl
    };

    // Build SET clause and params
    const setParts = [];
    const setParams = [];
    Object.keys(updated).forEach((k) => {
      setParts.push(`${k} = ?`);
      setParams.push(updated[k]);
    });

    setParams.push(existing.id);
    const sql = `UPDATE interest_forms SET ${setParts.join(', ')} WHERE id = ?`;
    await db.execute(sql, setParams);

    // Return updated form
    const [newRows] = await db.execute('SELECT * FROM interest_forms WHERE id = ? LIMIT 1', [existing.id]);
    res.json({ success: true, message: 'Form updated', data: newRows[0] });
  } catch (error) {
    console.error('Update form error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteForm = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ message: 'Form id required' });
    const [rows] = await db.execute('SELECT * FROM interest_forms WHERE id = ? LIMIT 1', [id]);
    const existing = rows && rows[0];
    if (!existing) return res.status(404).json({ message: 'Form not found' });

    // Only allow students to delete their own forms; admins may delete any
    const role = req.user && req.user.role ? String(req.user.role).toLowerCase() : '';
    const userId = req.user && (req.user.id || req.user.userId || req.user.fid || req.user.studentId);
    const userEmail = req.user && (req.user.email || req.user.studentEmail);
    if (role === 'student') {
      const ownerId = existing.student_id;
      const ownerEmail = existing.student_email;
      if (!(ownerId && String(ownerId) === String(userId)) && !(ownerEmail && ownerEmail === String(userEmail))) {
        return res.status(403).json({ message: 'Not authorized to delete this form' });
      }
    }

    await db.execute('DELETE FROM interest_forms WHERE id = ?', [id]);
    res.json({ success: true, message: 'Form deleted' });
  } catch (error) {
    console.error('Delete form error:', error && error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
