

import React, { useEffect, useState } from 'react';
import api, { API_HOST } from '../../lib/api';
import DashboardLayout from '../../components/DashboardLayout';

function MentorStudentsPage() {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    const fetchStudents = async () => {
      // Check token role first to avoid 403 responses when logged in as admin
      if (typeof window !== 'undefined') {
        const token = window.localStorage.getItem('token');
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const role = (payload && (payload.role || payload.roles || payload.userRole)) || '';
            if (String(role).toLowerCase() !== 'mentor') {
              setError('You are signed in as a different role. Please sign in as a mentor to view assigned students.');
              setLoading(false);
              return;
            }
          } catch (e) {
            // ignore decode errors and continue
          }
        }
      }
      try {
        // Call mentor-specific endpoint which returns forms assigned to the logged-in mentor
        const res = await api.get('/mentor-dashboard/students');
        const list = res && res.data ? res.data : [];
        // Normalize fields (DB may return snake_case)
        const normalized = list.map(f => ({
          id: f.id || f.form_id || f._id,
          student_name: f.student_name || f.studentName || f.student_name || f.student_name,
          student_email: f.student_email || f.studentEmail || f.student_email,
          desired_domain: f.desired_domain || f.desiredDomain || f.desired_domain,
          interests: (typeof f.interests === 'string') ? (JSON.parse(f.interests || '[]') || []) : (Array.isArray(f.interests) ? f.interests : []),
          goals: f.goals || f.description || f.goals,
          status: f.status,
          mentor_id: f.mentor_id || f.mentorId || f.mentor_id,
          resume_url: f.resume_url || f.resumeUrl || f.resume_url
        }));
        setStudents(normalized);
        setError('');
      } catch (err) {
        setError('Failed to fetch students.');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  return (
    <DashboardLayout title="Assigned Students" role="mentor">
      <div style={{ maxWidth: 1200, margin: '24px auto', padding: '12px 0' }}>
      {loading && <div style={{ color: '#555', marginBottom: 12 }}>Loading...</div>}
      {error && <div style={{ color: '#d32f2f', marginBottom: 12, fontWeight: 500 }}>{error}</div>}

      <div className="simple-table-wrapper mentor-table-scroll">
        <table className="mentor-students-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px', fontSize: 15 }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--muted)' }}>
              <th style={thStyle}>Sr.No</th>
              <th style={thStyle}>Assigned</th>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Domain</th>
              <th style={thStyle}>Interests</th>
              <th style={thStyle}>Goals</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Resume</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 && !loading ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', color: '#888', padding: '36px 0' }}>No assigned students found.</td>
              </tr>
            ) : (
              students.map((s, idx) => (
                <React.Fragment key={s.id}>
                  <tr style={{ background: 'var(--card)', border: '1px solid rgba(14,30,37,0.04)' }}>
                    <td style={tdStyle} data-label="Sr.No">{idx + 1}</td>
                    <td style={tdStyle} data-label="Assigned">{s.mentor_id ? <span style={{ background: 'rgba(37,99,235,0.08)', color: 'var(--primary)', padding: '6px 10px', borderRadius: 18, fontWeight: 700 }}>Assigned</span> : '—'}</td>
                    <td style={tdStyle} data-label="Name">{s.student_name || 'Unknown'}</td>
                    <td style={tdStyle} data-label="Email">{s.student_email || '—'}</td>
                    <td style={tdStyle} data-label="Domain">{s.desired_domain || '—'}</td>
                    <td style={tdStyle} data-label="Interests">{Array.isArray(s.interests) ? s.interests.join(', ') : (s.interests || '—')}</td>
                    <td style={tdStyle} data-label="Goals">{s.goals || '—'}</td>
                    <td style={tdStyle} data-label="Status">{s.status || '—'}</td>
                    <td style={tdStyle} data-label="Resume">{s.resume_url ? (
                      <button className="mentor-resume-link" style={{ color: 'var(--link-color)', fontWeight: 600, background:'none', border:'none', cursor:'pointer' }} onClick={async () => {
                        try {
                          const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                          const backend = API_HOST || 'http://localhost:5000';
                          const p = s.resume_url.startsWith('http') ? s.resume_url : `${backend}${s.resume_url}`;
                          const res = await fetch(p, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
                          if (!res.ok) return alert('Failed to download file');
                          const blob = await res.blob();
                          const u = URL.createObjectURL(blob);
                          window.open(u, '_blank');
                        } catch (e) { console.error(e); alert('Failed to download file'); }
                      }}>View</button>
                    ) : '—'}</td>
                    <td style={{ ...tdStyle, display: 'flex', gap: 8 }} data-label="Actions">
                      <select className="mentor-status-select" defaultValue={s.status || 'assigned'} onChange={async (e) => {
                        const newStatus = e.target.value;
                        try {
                          // Normalize status before sending (backend expects normalized keys)
                          const normalized = String(newStatus).trim().toLowerCase();
                          await api.put(`/mentor-dashboard/students/${s.id}/status`, { status: normalized });
                          setStudents(prev => prev.map(p => p.id === s.id ? { ...p, status: normalized } : p));
                          // Notify other parts of the app (admin UI) that status changed
                          if (typeof window !== 'undefined') {
                            window.dispatchEvent(new CustomEvent('statusUpdated', { detail: { formId: s.id, status: normalized } }));
                          }
                        } catch (err) {
                          console.error('Status update failed', err);
                          setError('Failed to update status');
                        }
                      }} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #e6edf8', background: '#fff', minWidth: 140 }}>
                        <option value="assigned">Assigned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                  
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
      <style jsx>{`
        @media (max-width: 768px) {
          .mentor-students-container {
            margin: 60px auto !important;
            padding: 1rem 0.5rem !important;
          }
          h1 {
            font-size: 1.5rem !important;
          }
          table {
            font-size: 0.85rem !important;
          }
          th, td {
            padding: 8px 6px !important;
            font-size: 0.85rem !important;
          }
          select {
            min-width: 120px !important;
            font-size: 0.85rem !important;
          }
        }
      `}</style>
      </div>
    </DashboardLayout>
  );
}

const thStyle = {
  padding: '10px 8px',
  fontWeight: 700,
  borderBottom: '2px solid rgba(14,30,37,0.06)',
  background: '#f3f4f6',
  textAlign: 'left',
  color: 'var(--muted)',
  fontSize: '13px'
};

const tdStyle = {
  padding: '8px 8px',
  borderBottom: '1px solid rgba(14,30,37,0.04)',
  background: 'transparent',
  verticalAlign: 'top',
  fontSize: 13,
  color: 'var(--body-color)'
};

export default MentorStudentsPage;
