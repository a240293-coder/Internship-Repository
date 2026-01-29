import DashboardLayout from '../../components/DashboardLayout';
import { useEffect, useState } from 'react';

export default function AdminLiveSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [completingId, setCompletingId] = useState(null);

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch('/api/admin/live-sessions', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Failed to fetch sessions');
      const data = await res.json();
      setSessions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleMarkCompleted = async (id) => {
    setCompletingId(id);
    setSuccessMsg('');
    setError(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`/api/admin/mark-session-completed?id=${id}`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to mark as completed');
      setSuccessMsg('Session marked as completed!');
      fetchSessions();
    } catch (err) {
      setError(err.message);
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <DashboardLayout title="Live Sessions" role="admin">
      <div style={{maxWidth:'900px',margin:'0 auto',padding:'2rem 0',fontSize:'1.2rem',color:'#1e293b'}}>
        <h2 style={{fontWeight:'700',fontSize:'1.5rem',marginBottom:'1rem'}}>Live Sessions</h2>
        {loading && <p>Loading sessions...</p>}
        {error && <p style={{color:'red'}}>Error: {error}</p>}
        {successMsg && <p style={{color:'green'}}>{successMsg}</p>}
        {!loading && !error && sessions.length === 0 && <p>No live sessions found.</p>}
        {!loading && !error && sessions.length > 0 && (
          <div style={{overflowX:'auto',WebkitOverflowScrolling:'touch'}}>
            <table style={{width:'100%',borderCollapse:'collapse',marginTop:'1.5rem',fontSize:'0.95rem',minWidth:'900px'}}>
              <thead>
                <tr style={{background:'#f1f5f9'}}>
                  <th style={{padding:'12px 8px',border:'1px solid #e2e8f0',textAlign:'left',fontSize:'0.9rem'}}>ID</th>
                  <th style={{padding:'12px 8px',border:'1px solid #e2e8f0',textAlign:'left',fontSize:'0.9rem'}}>Student Name</th>
                  <th style={{padding:'12px 8px',border:'1px solid #e2e8f0',textAlign:'left',fontSize:'0.9rem'}}>Email</th>
                  <th style={{padding:'12px 8px',border:'1px solid #e2e8f0',textAlign:'left',fontSize:'0.9rem'}}>Phone</th>
                  <th style={{padding:'12px 8px',border:'1px solid #e2e8f0',textAlign:'left',fontSize:'0.9rem'}}>Preferred Date</th>
                  <th style={{padding:'12px 8px',border:'1px solid #e2e8f0',textAlign:'left',fontSize:'0.9rem'}}>Preferred Time</th>
                  <th style={{padding:'12px 8px',border:'1px solid #e2e8f0',textAlign:'left',fontSize:'0.9rem'}}>Session Topic</th>
                  <th style={{padding:'12px 8px',border:'1px solid #e2e8f0',textAlign:'left',fontSize:'0.9rem'}}>Status</th>
                  <th style={{padding:'12px 8px',border:'1px solid #e2e8f0',textAlign:'left',fontSize:'0.9rem'}}>Created At</th>
                  <th style={{padding:'12px 8px',border:'1px solid #e2e8f0',textAlign:'left',fontSize:'0.9rem'}}>Action</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(session => (
                  <tr key={session.id}>
                    <td style={{padding:'10px 8px',border:'1px solid #e2e8f0',fontSize:'0.9rem'}}>{session.id}</td>
                    <td style={{padding:'10px 8px',border:'1px solid #e2e8f0',whiteSpace:'nowrap',textOverflow:'ellipsis',overflow:'hidden',maxWidth:'180px',fontSize:'0.9rem'}}>{session.studentName || '-'}</td>
                    <td style={{padding:'10px 8px',border:'1px solid #e2e8f0',fontSize:'0.9rem'}}>{session.studentEmail || '-'}</td>
                    <td style={{padding:'10px 8px',border:'1px solid #e2e8f0',fontSize:'0.9rem'}}>{session.phone || '-'}</td>
                    <td style={{padding:'10px 8px',border:'1px solid #e2e8f0',fontSize:'0.9rem'}}>{session.preferredDate || '-'}</td>
                    <td style={{padding:'10px 8px',border:'1px solid #e2e8f0',fontSize:'0.9rem'}}>{session.preferredTime || '-'}</td>
                    <td style={{padding:'10px 8px',border:'1px solid #e2e8f0',fontSize:'0.9rem'}}>{session.sessionTopic || '-'}</td>
                    <td style={{padding:'10px 8px',border:'1px solid #e2e8f0',fontSize:'0.9rem'}}>{session.status}</td>
                    <td style={{padding:'10px 8px',border:'1px solid #e2e8f0',fontSize:'0.9rem'}}>{session.created_at ? new Date(session.created_at).toLocaleString() : '-'}</td>
                    <td style={{padding:'10px 8px',border:'1px solid #e2e8f0',fontSize:'0.9rem'}}>
                      {session.status !== 'completed' ? (
                        <button
                          onClick={() => handleMarkCompleted(session.id)}
                          disabled={completingId === session.id}
                          style={{padding:'8px 12px',background:'#2563eb',color:'#fff',border:'none',borderRadius:'6px',cursor:'pointer',fontSize:'0.85rem',fontWeight:'600'}}
                        >
                          {completingId === session.id ? 'Marking...' : 'Mark as Completed'}
                        </button>
                      ) : (
                        <span style={{color:'green',fontWeight:'600'}}>Completed</span>
                      )}
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
          div[style*="maxWidth"] {
            padding: 1rem 0.5rem !important;
          }
          h2 {
            font-size: 1.25rem !important;
          }
          table {
            font-size: 0.85rem !important;
          }
          th, td {
            padding: 8px 6px !important;
            font-size: 0.85rem !important;
          }
          button {
            padding: 6px 10px !important;
            font-size: 0.8rem !important;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
