const db = require('../database');

exports.submitForm = async (req, res) => {
  try {
    const { interests, desiredDomain, experience, goals, studentEmail, studentName, studentId } = req.body;
    const resumeUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Handle interests: if it's a string (from FormData), use it directly or parse/stringify to be safe.
    // If it came as JSON array (from raw JSON request), stringify it.
    let interestsStr = interests;
    if (typeof interests !== 'string') {
        interestsStr = JSON.stringify(interests);
    }

    const [result] = await db.execute(
      'INSERT INTO interest_forms (student_id, student_name, student_email, interests, desired_domain, experience, goals, resume_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        studentId || null,
        studentName || null,
        studentEmail || null,
        interestsStr,
        desiredDomain,
        experience,
        goals,
        resumeUrl
      ]
    );
    
    console.log("[DB INSERT] interest_form:", result.insertId);
    if (resumeUrl) {
        console.log("[FILE UPLOAD] resume:", resumeUrl);
    }

    res.status(201).json({ message: 'Form submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
