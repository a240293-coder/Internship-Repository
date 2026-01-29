
const express = require('express');
const InterestForm = require('../models/InterestForm');
const db = require('../config/database');
const Mentor = require('../models/Mentor');
const { verifyToken } = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();

// (Removed unprotected /students routes that conflicted with protected mentor endpoints)

// Get all mentors (for admin dropdown)
router.get('/all', async (req, res) => {
  try {
    const mentors = await Mentor.findAll({
      attributes: ['id', 'name', 'email']
    });
    res.json(mentors);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mentor: Get assigned students
router.get('/students', verifyToken, async (req, res) => {
  try {
    if (!req.user || !req.user.role || String(req.user.role).toLowerCase() !== 'mentor') {
      console.log('[mentor-dashboard/students] Forbidden: user role is', req.user && req.user.role);
      return res.status(403).json({ message: 'Only mentors can access this' });
    }

    // InterestForm.findAll expects a plain where object (e.g. { mentorId: 123 })
    const forms = await InterestForm.findAll({ mentorId: req.user.id });
    // Ensure returned rows have normalized keys (snake_case from DB)
    const normalized = forms.map(f => ({
      ...f,
      student_name: f.student_name || f.studentName,
      student_email: f.student_email || f.studentEmail,
      desired_domain: f.desired_domain || f.desiredDomain,
      interests: (typeof f.interests === 'string') ? (JSON.parse(f.interests || '[]') || []) : (Array.isArray(f.interests) ? f.interests : f.interests)
    }));
    res.json(normalized);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin helper: get assigned students for a specific mentor (admin-only)
router.get('/students/by-mentor/:mentorId', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { mentorId } = req.params;
    if (!mentorId) return res.status(400).json({ message: 'mentorId is required' });
    const forms = await InterestForm.findAll({ mentorId });
    const normalized = forms.map(f => ({
      ...f,
      student_name: f.student_name || f.studentName,
      student_email: f.student_email || f.studentEmail,
      desired_domain: f.desired_domain || f.desiredDomain,
      interests: (typeof f.interests === 'string') ? (JSON.parse(f.interests || '[]') || []) : (Array.isArray(f.interests) ? f.interests : f.interests)
    }));
    res.json(normalized);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mentor: Update student status
router.put('/students/:formId/status', verifyToken, async (req, res) => {
  try {
    if (!req.user || String(req.user.role).toLowerCase() !== 'mentor') {
      return res.status(403).json({ message: 'Only mentors can access this' });
    }

    const { status } = req.body;

    // Validate status value (allow common normalized values)
    const allowed = ['assigned', 'in_progress', 'completed', 'rejected'];
    const normalized = typeof status === 'string' ? String(status).trim().toLowerCase() : '';
    if (!allowed.includes(normalized)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const form = await InterestForm.findByPk(req.params.formId);

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Ensure mentor can only update their own assigned forms
    if (form.mentor_id && String(form.mentor_id) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Forbidden: not your assigned student' });
    }

    // Store normalized status using direct DB update (InterestForm returns plain objects)
    await db.execute('UPDATE interest_forms SET status = ? WHERE id = ?', [normalized, req.params.formId]);
    // Fetch updated form to return
    const [rows] = await db.query('SELECT * FROM interest_forms WHERE id = ? LIMIT 1', [req.params.formId]);
    const updated = rows && rows[0] ? rows[0] : null;
    return res.json({ message: 'Status updated successfully', form: updated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
