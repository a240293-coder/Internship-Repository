const express = require('express');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

const router = express.Router();

// Local backend removed — return 410 Gone for all routes
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if student already exists
    const existingStudent = await Student.findOne({ where: { email } });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student already exists' });
    }

    // Create new student
    const student = await Student.create({
      full_name: name,
      email,
      password
    });

    res.status(201).json({
      message: 'Student registered successfully. Please log in to continue.',
      student: {
        id: student.id,
        name: student.full_name,
        email: student.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Student Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if student exists
    const student = await Student.findOne({ where: { email } });
    if (!student) {
      return res.status(401).json({ message: 'Incorrect email or password' });
    }

    // Check password
    const isMatch = await student.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect email or password' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: student.id, email: student.email, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      student: {
        id: student.id,
        name: student.full_name,
        email: student.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.use((req, res) => {
  res.status(410).json({ message: 'Local backend removed. Use external API.' });
});

module.exports = router;
