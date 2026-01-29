import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../lib/api';
import '../auth/Dashboard.css';

export default function StudentSessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await api.get('/student/sessions');
        const data = Array.isArray(res?.data) ? res.data : (res?.data ? [res.data] : []);
        setSessions(data);
        setError('');
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Failed to load sessions');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <DashboardLayout title="Upcoming Sessions" role="student">
      <div style={{ maxWidth: 1100, margin: '20px auto', padding: 12 }}>
        
        {loading && <div style={{ color: '#555' }}>Loading...</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {!loading && sessions.length === 0 && <div style={{ color: '#666' }}>No upcoming sessions.</div>}

        {sessions.length > 0 && (
          <div className="sessions-wrapper">
            <table className="sessions-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--muted)' }}>
                  <th style={thStyle}>Sr.No</th>
                  <th style={thStyle}>Agenda</th>
                  <th style={thStyle}>Description</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Time</th>
                  <th style={thStyle}>Mentor</th>
                  <th style={thStyle}>Meeting Link</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s, idx) => (
                  <tr key={s.id || idx} style={{ background: 'var(--card)', border: '1px solid rgba(14,30,37,0.04)' }}>
                    <td style={tdStyle}>{idx + 1}</td>
                    <td style={tdStyle}>{s.agenda || '—'}</td>
                    <td style={tdStyle}>{s.description || '—'}</td>
                    {
                      (() => {
                        const dt = s.timing ? new Date(s.timing) : null;
                        if (!dt) return (<><td style={tdStyle}>—</td><td style={tdStyle}>—</td></>);
                        const dd = String(dt.getDate()).padStart(2, '0');
                        const mm = String(dt.getMonth() + 1).padStart(2, '0');
                        const yyyy = dt.getFullYear();
                        const dateStr = `${dd}/${mm}/${yyyy}`; // DD/MM/YYYY
                        const hh = String(dt.getHours()).padStart(2, '0');
                        const min = String(dt.getMinutes()).padStart(2, '0');
                        const timeStr = `${hh}:${min}`; // 24-hour HH:MM
                        return (
                          <>
                            <td style={tdStyle}>{dateStr}</td>
                            <td style={tdStyle}>{timeStr}</td>
                          </>
                        );
                      })()
                    }
                    <td style={tdStyle}>{s.mentor_name || s.mentorName || '—'}</td>
                    <td style={{ ...tdStyle }}>
                      {s.meeting_link || s.meetingLink ? (
                        <a href={s.meeting_link || s.meetingLink} target="_blank" rel="noreferrer" style={{ color: 'var(--link-color)', fontWeight: 700 }}>Join</a>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <style jsx>{`
        @media (max-width: 768px) {
          .sessions-wrapper { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .sessions-table { display: table !important; width: 100%; table-layout: auto; }
          .sessions-table thead { display: table-header-group !important; }
          .sessions-table th, .sessions-table td { display: table-cell !important; white-space: nowrap; }
          .sessions-table { font-size: 0.9rem; }
          .sessions-table th, .sessions-table td { padding: 10px 8px; }
        }
      `}</style>
    </DashboardLayout>
  );
}

const thStyle = {
  padding: '14px 12px',
  fontWeight: 700,
  borderBottom: '2px solid rgba(14,30,37,0.06)',
  background: '#f3f4f6',
  textAlign: 'left',
  color: 'var(--muted)'
};

const tdStyle = {
  padding: '12px 10px',
  borderBottom: '1px solid rgba(14,30,37,0.04)',
  background: 'transparent',
  verticalAlign: 'top',
  fontSize: 15,
  color: 'var(--body-color)'
};
