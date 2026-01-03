const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const router = express.Router();

// Admin Registration
router.post('/register', async (req, res) => {
  try {
    const { email, password, adminKey } = req.body;

    // Optional admin key protection
    const expectedKey = process.env.ADMIN_SECRET_KEY || 'SuperSecretAdminKey123!';
    if (expectedKey && adminKey !== expectedKey) {
      return res.status(401).json({ message: 'Invalid admin key' });
    }

    // Check if admin already exists
    const existing = await Admin.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const admin = await Admin.create({ email, password });

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ message: 'Admin registered successfully', token, admin: { id: admin.id, email: admin.email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin Login with email and password
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if admin exists
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
      return res.status(401).json({ message: 'Incorrect email or password' });
    }

    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect email or password' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Admin login successful',
      token,
      admin: {
        id: admin.id,
        email: admin.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

