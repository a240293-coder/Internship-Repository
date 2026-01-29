const express = require('express');
const path = require('path');
const fs = require('fs');

const InterestForm = require('../models/InterestForm');
const Student = require('../models/Student');
const { verifyToken } = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

console.log('verifyToken:', typeof verifyToken);
console.log('requireAdmin:', typeof requireAdmin);

const router = express.Router();

// Student submits interest form
router.post('/submit', verifyToken, async (req, res) => {
  try {
    const role = (req.user && req.user.role) ? String(req.user.role).toLowerCase() : '';
    if (role !== 'student') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Access denied: Only students can submit interest forms. Please log in as a student.',
        details: {
          requiredRole: 'student',
          yourRole: role || 'none',
          tokenPresent: !!req.user
        }
      });
    }

    const { interests, desiredDomain, goals } = req.body;

    let parsedInterests = Array.isArray(interests) ? interests : [];
    if (typeof interests === 'string') {
      try {
        parsedInterests = JSON.parse(interests);
      } catch (parseErr) {
        parsedInterests = interests
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }
    
    // Get student info from JWT token
    const userId = req.user && (req.user.id || req.user.userId || req.user.fid || req.user.studentId);
    const studentName = req.user && (req.user.name || req.user.full_name || req.user.studentName);
    const studentEmail = req.user && (req.user.email || req.user.studentEmail);

    let resumeUrl = null;
    if (req.files && req.files.resume) {
      try {
        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const originalName = req.files.resume.name;
        const ext = path.extname(originalName);
        const filename = `resume_${userId}_${timestamp}${ext}`;
        const filepath = path.join(uploadsDir, filename);

        // Move file to uploads directory
        await req.files.resume.mv(filepath);
        // Use secure route so only authorized users can access the resume
        resumeUrl = `/secure-uploads/${filename}`;
        console.log(`✓ Resume saved: ${filename}`);
      } catch (fileErr) {
        console.error('File upload error:', fileErr.message);
        return res.status(500).json({ message: 'Failed to upload resume', error: fileErr.message });
      }
    }

    // Check if student already submitted a form for the same desiredDomain
    // Allow multiple submissions per student as long as the domain differs.
    let existingForm = null;
    const desiredNormalized = (desiredDomain || '').trim().toLowerCase();
    try {
      if (userId) {
        const forms = await InterestForm.findAll({ studentId: userId });
        existingForm = (forms || []).find(f => ((f.desired_domain || f.desiredDomain || '') + '').trim().toLowerCase() === desiredNormalized) || null;
      } else if (studentEmail) {
        const forms = await InterestForm.findAll({ studentEmail });
        existingForm = (forms || []).find(f => ((f.desired_domain || f.desiredDomain || '') + '').trim().toLowerCase() === desiredNormalized) || null;
      }
    } catch (checkErr) {
      console.warn('Could not check existing forms for duplicate domain:', checkErr && checkErr.message);
    }
    if (existingForm) {
      return res.status(409).json({
        success: false,
        message: 'Interest form already submitted for this student in the selected domain',
        data: { form: existingForm }
      });
    }

    const form = await InterestForm.create({
      studentId: userId,
      studentName,
      studentEmail,
      interests: parsedInterests,
      desiredDomain,
      goals,
      resumeUrl,
      status: 'pending'
    });

    // Normalized response for frontend
    res.status(201).json({
      success: true,
      message: 'Interest form submitted successfully',
      data: { form }
    });
  } catch (error) {
    console.error('Form submission error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get student's own form
router.get('/my-form', verifyToken, async (req, res) => {
  try {
    const role = (req.user && req.user.role) ? String(req.user.role).toLowerCase() : '';
    if (role !== 'student') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Access denied: Only students can view their interest forms. Please log in as a student.',
        details: {
          requiredRole: 'student',
          yourRole: role || 'none',
          tokenPresent: !!req.user
        }
      });
    }

    const userId = req.user && (req.user.id || req.user.userId || req.user.fid || req.user.studentId);
    const form = await InterestForm.findOne({ where: { studentId: userId } });

    if (!form) {
      return res.status(404).json({ message: 'No form found' });
    }

    res.json(form);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

// --- ADMIN ROUTES ---

// Admin: Get all interest forms
router.get('/all', verifyToken, requireAdmin, async (req, res) => {
  try {
    if (!req.user || String(req.user.role).toLowerCase() !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Access denied: Only admins can view all interest forms. Please log in as an admin.',
        details: {
          requiredRole: 'admin',
          yourRole: req.user?.role || 'none',
          tokenPresent: !!req.user
        }
      });
    }
    const forms = await InterestForm.findAll();
    res.json({ success: true, data: forms });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Update status of a form (approve/reject)
router.patch('/:formId/status', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { formId } = req.params;
    const { status } = req.body; // expected: 'approved' or 'rejected'
    const form = await InterestForm.findByPk(formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    // Update status directly in the database
    const db = require('../config/database');
    await db.query('UPDATE interest_forms SET status = ? WHERE id = ?', [status, formId]);
    form.status = status;
    res.json({ message: 'Form status updated', form });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
