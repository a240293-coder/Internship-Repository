const express = require('express');
const InterestForm = require('../models/InterestForm');
const Mentor = require('../models/Mentor');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

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
    if (req.user.role !== 'mentor') {
      return res.status(403).json({ message: 'Only mentors can access this' });
    }

    const forms = await InterestForm.findAll({ where: { mentorId: req.user.id } });
    res.json(forms);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mentor: Update student status
router.put('/students/:formId/status', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'mentor') {
      return res.status(403).json({ message: 'Only mentors can access this' });
    }

    const { status } = req.body;

    const form = await InterestForm.findByPk(req.params.formId);

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    await form.update({ status });

    res.json({
      message: 'Status updated successfully',
      form
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
