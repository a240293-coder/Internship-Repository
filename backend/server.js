const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded files

const studentRoutes = require('./routes/student.routes');
const mentorRoutes = require('./routes/mentor.routes');
const adminRoutes = require('./routes/admin.routes');
const liveSessionRoutes = require('./routes/liveSession.routes');
const formRoutes = require('./routes/form.routes');

// Mount routes to match frontend calls
app.use('/student', studentRoutes);
app.use('/mentor', mentorRoutes);
app.use('/admin', adminRoutes);
app.use('/live-session', liveSessionRoutes);
app.use('/forms', formRoutes);

// Also mount at /api to satisfy prompt requirements if accessed that way
app.use('/api/student', studentRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/live-session', liveSessionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
