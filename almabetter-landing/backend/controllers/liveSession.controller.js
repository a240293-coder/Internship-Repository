const db = require('../config/database');

exports.bookSession = async (req, res) => {
  try {
    const { studentName, studentEmail, sessionTopic, preferredTime, phone, preferredDate, adminId } = req.body;
    if (!studentName || !studentEmail || !sessionTopic || !preferredTime || !phone || !preferredDate || !adminId) {
      return res.status(400).json({ success: false, message: 'Required fields missing', data: null });
    }
    const [result] = await db.execute(
      'INSERT INTO live_session_bookings (studentName, studentEmail, phone, sessionTopic, preferredTime, preferredDate, adminId, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [studentName, studentEmail, phone, sessionTopic, preferredTime, preferredDate, adminId, 'pending']
    );
    console.log("[DB INSERT] live_session_bookings:", result.insertId);
    // Fetch and log the inserted row for debugging
    const [rows] = await db.execute('SELECT * FROM live_session_bookings WHERE id = ?', [result.insertId]);
    console.log('[DB DEBUG] Inserted live_session_bookings row:', rows[0]);
    res.status(201).json({ success: true, message: 'Session booked successfully', data: { id: result.insertId } });
  } catch (error) {
    console.error('BookSession Error:', error);
    if (error && error.stack) {
      console.error('Stack Trace:', error.stack);
    }
    console.error('Request Body:', req.body);
    res.status(500).json({ success: false, message: 'Server error', error: error.message, data: null });
  }
};
