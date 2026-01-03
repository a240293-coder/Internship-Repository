const express = require('express');
const jwt = require('jsonwebtoken');
const Mentor = require('../models/Mentor');

const router = express.Router();

// Mentor Registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if mentor already exists
    const existingMentor = await Mentor.findOne({ where: { email } });
    if (existingMentor) {
      return res.status(400).json({ message: 'Mentor already exists' });
    }

    // Create new mentor
    const mentor = await Mentor.create({
      name,
      email,
      password
    });

    // Create JWT token
    const token = jwt.sign(
      { id: mentor.id, email: mentor.email, role: 'mentor' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Mentor registered successfully',
      token,
      mentor: {
        id: mentor.id,
        name: mentor.name,
        email: mentor.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mentor Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if mentor exists
    const mentor = await Mentor.findOne({ where: { email } });
    if (!mentor) {
      return res.status(401).json({ message: 'Incorrect email or password' });
    }

    // Check password
    const isMatch = await mentor.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect email or password' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: mentor.id, email: mentor.email, role: 'mentor' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      mentor: {
        id: mentor.id,
        name: mentor.name,
        email: mentor.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
