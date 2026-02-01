const express = require('express');
const InterestForm = require('../models/InterestForm');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();

// Admin: Get all pending forms
router.get('/forms/pending', requireAdmin, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can access this' });
    }

    const forms = await InterestForm.findAll({ where: { status: 'pending' } });
    res.json({ success: true, message: '', data: forms });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Get all forms
router.get('/forms', requireAdmin, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can access this' });
    }

    const forms = await InterestForm.findAll();
    res.json({ success: true, message: '', data: forms });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


const db = require('../config/database');

// Admin: Assign mentor to student (with logging, history, no max limit)
router.put('/forms/:formId/assign-mentor', requireAdmin, async (req, res) => {
  try {
    const { mentorId, mentorName } = req.body;
    const formId = req.params.formId;
    const form = await InterestForm.findByPk(formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    // Ensure studentId is present
    let studentId = form.studentId || form.student_id;
    if (!studentId) {
      // Try to fetch from DB if missing
      const [row] = await db.query('SELECT student_id FROM interest_forms WHERE id = ?', [formId]);
      studentId = row?.student_id;
      if (!studentId) {
        return res.status(400).json({ message: "Assignment failed", error: "Column 'student_id' cannot be null" });
      }
    }
    // Update interest form
    await db.execute('UPDATE interest_forms SET mentor_id = ?, mentor_name = ?, status = ? WHERE id = ?', [mentorId, mentorName, 'assigned', formId]);
    // Log assignment in mentor_assignments and return created record
    const [insRes] = await db.execute(
      'INSERT INTO mentor_assignments (mentor_id, student_id, form_id, assigned_at) VALUES (?, ?, ?, NOW())',
      [mentorId, studentId, formId]
    );
    const insertedId = insRes && insRes.insertId ? insRes.insertId : null;
    let insertedAssignment = null;
    if (insertedId) {
      const [rows] = await db.execute(
        `SELECT ma.*, s.full_name AS student_name, m.full_name AS mentor_name
         FROM mentor_assignments ma
         LEFT JOIN students s ON ma.student_id = s.id
         LEFT JOIN mentors m ON ma.mentor_id = m.id
         WHERE ma.id = ? LIMIT 1`,
        [insertedId]
      );
      insertedAssignment = rows && rows[0] ? rows[0] : null;
    }

    // Log admin action
    await db.execute(
      'INSERT INTO admin_activity_logs (admin_id, action, details, created_at) VALUES (?, ?, ?, NOW())',
      [req.user.id, 'assign_mentor', `Assigned mentor ${mentorId} to student ${form.studentId} (form ${formId})`,]
    );

    res.json({
      success: true,
      message: 'Mentor assigned successfully',
      data: { form, assignment: insertedAssignment }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Unassign mentor from student (with logging, history)
router.put('/forms/:formId/unassign-mentor', requireAdmin, async (req, res) => {
  try {
    const formId = req.params.formId;
    const form = await InterestForm.findByPk(formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    await form.update({ mentorId: null, mentorName: null, status: 'pending' });
    await db.execute(
      'INSERT INTO mentor_assignments (mentor_id, student_id, form_id, assigned_at, unassigned_at) VALUES (?, ?, ?, NULL, NOW())',
      [form.mentorId, form.studentId, formId]
    );
    await db.execute(
      'INSERT INTO admin_activity_logs (admin_id, action, details, created_at) VALUES (?, ?, ?, NOW())',
      [req.user.id, 'unassign_mentor', `Unassigned mentor from student ${form.studentId} (form ${formId})`,]
    );
    res.json({ success: true, message: 'Mentor unassigned successfully', data: { form } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Get assignment history for a student
router.get('/students/:studentId/assignment-history', requireAdmin, async (req, res) => {
  try {
    const { studentId } = req.params;
    const [rows] = await db.execute(
      'SELECT * FROM mentor_assignments WHERE student_id = ? ORDER BY assigned_at DESC',
      [studentId]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Get all students and their assigned mentors
router.get('/students', requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT s.*, f.mentorId, f.mentorName FROM students s
        LEFT JOIN interest_forms f ON s.id = f.student_id`
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Get all mentors and their assigned students
router.get('/mentors', requireAdmin, async (req, res) => {
  try {
    const { expertise } = req.query;
    let sql = `SELECT m.*, f.student_id AS studentId, f.student_name AS studentName FROM mentors m LEFT JOIN interest_forms f ON m.id = f.mentor_id`;
    const params = [];
    if (expertise) {
      // simple match: find mentors whose expertise CSV contains the provided term
      sql += ' WHERE FIND_IN_SET(?, m.expertise) OR m.expertise LIKE ?';
      params.push(expertise, `%${expertise}%`);
    }
    const [rows] = await db.execute(sql, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Get all mentor assignments (history)
router.get('/mentor-assignments', requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM mentor_assignments ORDER BY assigned_at DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
