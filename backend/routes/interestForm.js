const express = require('express');
const path = require('path');
const fs = require('fs');
const InterestForm = require('../models/InterestForm');
const Student = require('../models/Student');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Student submits interest form
router.post('/submit', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can submit forms' });
    }

    const { interests, desiredDomain, experience, goals } = req.body;

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
    
    // Get student details
    const student = await Student.findByPk(req.user.id);

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
        const filename = `resume_${req.user.id}_${timestamp}${ext}`;
        const filepath = path.join(uploadsDir, filename);

        // Move file to uploads directory
        await req.files.resume.mv(filepath);
        resumeUrl = `/uploads/${filename}`;
        console.log(`✓ Resume saved: ${filename}`);
      } catch (fileErr) {
        console.error('File upload error:', fileErr.message);
        return res.status(500).json({ message: 'Failed to upload resume', error: fileErr.message });
      }
    }

    const form = await InterestForm.create({
      studentId: req.user.id,
      studentName: student.name,
      studentEmail: student.email,
      interests: parsedInterests,
      desiredDomain,
      experience,
      goals,
      resumeUrl,
      status: 'pending'
    });

    res.status(201).json({
      message: 'Interest form submitted successfully',
      form
    });
  } catch (error) {
    console.error('Form submission error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get student's own form
router.get('/my-form', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can view their forms' });
    }

    const form = await InterestForm.findOne({ where: { studentId: req.user.id } });

    if (!form) {
      return res.status(404).json({ message: 'No form found' });
    }

    res.json(form);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
