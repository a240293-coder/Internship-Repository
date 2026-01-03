const express = require('express');
const InterestForm = require('../models/InterestForm');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Admin: Get all pending forms
router.get('/forms/pending', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can access this' });
    }

    const forms = await InterestForm.findAll({ where: { status: 'pending' } });
    res.json(forms);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Get all forms
router.get('/forms', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can access this' });
    }

    const forms = await InterestForm.findAll();
    res.json(forms);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Assign mentor to student
router.put('/forms/:formId/assign-mentor', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can assign mentors' });
    }

    const { mentorId, mentorName } = req.body;

    const form = await InterestForm.findByPk(req.params.formId);

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    await form.update({
      mentorId,
      mentorName,
      status: 'assigned'
    });

    res.json({
      message: 'Mentor assigned successfully',
      form
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
