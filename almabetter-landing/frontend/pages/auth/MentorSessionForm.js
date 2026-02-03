import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../../lib/api';
import DashboardLayout from '../../components/DashboardLayout';
// Auth.css is imported globally from pages/_app.js

const MentorSessionForm = () => {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ studentId: '', agenda: '', description: '', timingDate: '', timingTime: '', meetingLink: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadAssigned = async () => {
      try {
        const res = await api.get('/mentor-dashboard/students');
        const list = Array.isArray(res?.data) ? res.data : [];
        setStudents(list.map((s, i) => ({
          uid: `${s.student_id || s.studentId || s.id || 'student'}-${i}`,
          id: s.student_id || s.studentId || s.id || null,
          name: s.student_name || s.studentName || s.name || `Student ${i + 1}`
        })));
      } catch (err) {
        // fallback to mentor/students
        try {
          const r2 = await api.get('/mentor/students');
          const list2 = Array.isArray(r2?.data) ? r2.data : [];
          setStudents(list2.map((s, i) => ({
            uid: `${s.student_id || s.studentId || s.id || 'student-fallback'}-${i}`,
            id: s.student_id || s.studentId || s.id || null,
            name: s.student_name || s.studentName || s.name || `Student ${i + 1}`
          })));
        } catch (e) {
          setStudents([]);
        }
      }
    };
    loadAssigned();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (!form.studentId) throw new Error('Select a student');
      if (!form.agenda) throw new Error('Provide an agenda');
      if (!form.timingDate || !form.timingTime) throw new Error('Provide date and time');
      if (!form.meetingLink) throw new Error('Provide meeting link');
      // Combine date and time into a single datetime string compatible with backend DATETIME
      // form.timingDate -> YYYY-MM-DD, form.timingTime -> HH:MM (24h)
      const timing = `${form.timingDate} ${form.timingTime}:00`;
      await api.post('/mentor/sessions', {
        studentId: form.studentId,
        agenda: form.agenda,
        description: form.description,
        timing,
        meetingLink: form.meetingLink
      });
      // show a popup message to mentor to confirm invitations were sent
      try {
        alert('Successfully sent to the student');
      } catch (e) {
        // fallback to inline success message if alerts are blocked
        setSuccess('Successfully sent to the student');
      }
      setTimeout(() => router.push('/mentor/students'), 1200);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to schedule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Schedule Session" role="mentor">
      <div className="mentor-session-card">
        <h2>Schedule a Session</h2>
        <p className="mentor-subtext">Pick an assigned student, set agenda, timing and a meeting link.</p>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <div className="form-group">
            <label>Student Name</label>
            <select name="studentId" value={form.studentId} onChange={handleChange} required>
              <option value="">Select assigned student</option>
              {students.map(s => (<option key={s.uid} value={s.id || ''}>{s.name || s.id || s.uid}</option>))}
            </select>
          </div>

          <div className="form-group">
            <label>Session Agenda</label>
            <input name="agenda" value={form.agenda} onChange={handleChange} placeholder="Brief agenda/title" required />
          </div>

          <div className="form-group">
            <label>Session Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe topics to cover" />
          </div>

          <div className="form-group">
            <label>Date</label>
            <input name="timingDate" type="date" value={form.timingDate} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Time</label>
            <input name="timingTime" type="time" value={form.timingTime} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Meeting Link (Google Meet/Zoom)</label>
            <input name="meetingLink" value={form.meetingLink} onChange={handleChange} placeholder="https://meet.google.com/..." required />
          </div>

          <div>
            <button className="submit-btn" type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send Invitation'}</button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default MentorSessionForm;
