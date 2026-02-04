const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Ensure uploads directory exists before any middleware that may write files
const fs = require('fs');
const path = require('path');
const uploadsDir = path.join(__dirname, 'uploads');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory at', uploadsDir);
  }
} catch (err) {
  console.error('Failed to ensure uploads directory exists:', err.message);
}

// Global request logger (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log('Incoming request:', req.method, req.url);
    next();
  });
}

// --- Configure CORS here ---
// Uses CORS_ORIGIN from environment or defaults to localhost:3000
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
// NOTE: Uploaded files are served via a protected route below (`/secure-uploads/:filename`).
// This prevents exposing resumes publicly. Do NOT serve `uploads` as a public static folder.

// Test route for Mentor Signup Page (must be after app and middleware are defined)
app.get('/auth/signup/mentor', (req, res) => {
  res.send('Mentor Signup Page Route is Active');
});

// Note: old admin-login path removed; do not redirect to preserve 404 behavior

const studentRoutes = require('./routes/student.routes');
const mentorRoutes = require('./routes/mentor.routes');
const mentorDashboardRoutes = require('./routes/mentorDashboard');
const adminRoutes = require('./routes/admin.routes');

const liveSessionRoutes = require('./routes/liveSession.routes');
const formRoutes = require('./routes/form.routes');
const interestFormRoutes = require('./routes/interestForm');
const adminDashboardRoutes = require('./routes/adminDashboard.index');

// Mount routes to match frontend calls
app.use('/student', studentRoutes);
app.use('/mentor', mentorRoutes);
app.use('/mentor-dashboard', mentorDashboardRoutes);
app.use('/admin', adminRoutes);
app.use('/live-session', liveSessionRoutes);

app.use('/forms', formRoutes);
app.use('/interestForm', interestFormRoutes);
app.use('/adminDashboard', adminDashboardRoutes);

// Also mount at /api to satisfy prompt requirements if accessed that way
app.use('/api/student', studentRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/live-session', liveSessionRoutes);
app.use('/api/interestForm', interestFormRoutes);
// Protected file access for uploaded resumes
const { verifyToken } = require('./middleware/auth');
// Backwards-compatible `/uploads` route: some existing DB records or links
// may still point to `/uploads/...`. In development we serve those files
// directly for convenience; in production we redirect to the protected
// `/secure-uploads/:filename` route so callers must authenticate.
app.get('/uploads/:filename', (req, res, next) => {
  try {
    const filename = req.params.filename ? String(req.params.filename) : '';
    const safeName = filename.replace(/\.{2,}|\//g, '');
    const filePath = path.join(uploadsDir, safeName);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File not found' });
    if (process.env.NODE_ENV !== 'production') {
      // In dev/test, serve file directly to preserve old links.
      return res.sendFile(filePath);
    }
    // In production, require authentication — delegate to protected route.
    // Use a 307 to preserve method semantics; client will call `/secure-uploads/...`.
    return res.redirect(307, `/secure-uploads/${safeName}`);
  } catch (err) {
    console.error('/uploads handler error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
});
app.get('/secure-uploads/:filename', verifyToken, (req, res) => {
  try {
    const filename = req.params.filename ? String(req.params.filename) : '';
    // Prevent directory traversal
    const safeName = filename.replace(/\.{2,}|\//g, '');
    const filePath = path.join(uploadsDir, safeName);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File not found' });
    const role = req.user && req.user.role ? String(req.user.role).toLowerCase() : '';
    if (role === 'admin' || role === 'mentor') {
      return res.sendFile(filePath);
    }
    if (role === 'student') {
      // Allow students to access only their own file. Filenames are in format: resume_<userId>_<timestamp>.<ext>
      const m = safeName.match(/^resume_(\d+)_/);
      const userId = req.user && (req.user.id || req.user.userId || req.user.fid || req.user.studentId);
      if (m && String(m[1]) === String(userId)) return res.sendFile(filePath);
      return res.status(403).json({ message: 'Forbidden' });
    }
    return res.status(403).json({ message: 'Forbidden' });
  } catch (err) {
    console.error('secure-uploads error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
});
const PORT = process.env.PORT || 5000;
// Health check route
app.get('/', (req, res) => {
  res.send('Server is active and running!');
});
// API endpoint health check
app.get('/api', (req, res) => {
  res.send('API endpoint is active!');
});
// Ensure interest_forms.status column accepts new normalized values
(async () => {
  try {
    const db = require('./config/database');
    const [rows] = await db.query("SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'interest_forms' AND COLUMN_NAME = 'status'");
    const colType = rows && rows[0] && rows[0].COLUMN_TYPE ? rows[0].COLUMN_TYPE : '';
    if (colType && (!colType.includes('in_progress') || !colType.includes('rejected'))) {
      console.log('Updating interest_forms.status enum to include in_progress and rejected');
      try {
        await db.execute("ALTER TABLE interest_forms MODIFY COLUMN status ENUM('pending','assigned','in_progress','completed','rejected') DEFAULT 'pending'");
        console.log('interest_forms.status column updated');
      } catch (alterErr) {
        console.warn('Failed to alter interest_forms.status:', alterErr.message);
      }
    }
  } catch (err) {
    console.warn('Schema check skipped:', err.message);
  }
})();
// Ensure mentor_sessions table exists (safe migration for new feature)
(async () => {
  try {
    const db = require('./config/database');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS mentor_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        mentor_id INT,
        student_id INT,
        agenda VARCHAR(255) NOT NULL,
        description TEXT,
        timing DATETIME NOT NULL,
        meeting_link VARCHAR(255) NOT NULL,
        status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (mentor_id) REFERENCES mentors(id) ON DELETE SET NULL,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('Ensured mentor_sessions table exists');
    // Add status column if it doesn't exist
    await db.execute(`
      ALTER TABLE mentor_sessions 
      ADD COLUMN IF NOT EXISTS status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled' AFTER meeting_link;
    `).catch(() => {});
  } catch (err) {
    console.warn('Failed to ensure mentor_sessions table:', err && err.message);
  }
})();
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
