const db = require('../database');

exports.bookSession = async (req, res) => {
  try {
    const { fullName, email, phone, preferredDate, preferredTime } = req.body;
    
    if (!fullName || !email || !preferredDate || !preferredTime) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const [result] = await db.execute(
      'INSERT INTO live_sessions (name, email, phone, preferred_date, preferred_time) VALUES (?, ?, ?, ?, ?)',
      [fullName, email, phone, preferredDate, preferredTime]
    );
    
    console.log("[DB INSERT] live_session:", result.insertId);

    res.status(201).json({ message: 'Session booked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
