import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../lib/api';

export default function ScheduledSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);

  const fetchSessions = async () => {
    try {
      const res = await api.get('/mentor/sessions');
      setSessions(res.data || []);
    } catch (err) {
      setError('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleStatusChange = async (sessionId, newStatus) => {
    setUpdating(sessionId);
    try {
      await api.put(`/mentor/sessions/${sessionId}/status`, { status: newStatus });
      await fetchSessions();
    } catch (err) {
      alert('Failed to update session status');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <DashboardLayout title="Scheduled Sessions" role="mentor">
      <div style={{maxWidth:'1000px',margin:'0 auto',padding:'2rem 1rem'}}>
        <h2 style={{fontSize:'1.5rem',fontWeight:700,marginBottom:'1.5rem',color:'#1e293b'}}>Scheduled Sessions</h2>
        {loading && <p>Loading sessions...</p>}
        {error && <p style={{color:'#dc2626',padding:'12px',background:'#fee',borderRadius:'8px'}}>{error}</p>}
        {!loading && !error && sessions.length === 0 && (
          <div style={{textAlign:'center',padding:'3rem',background:'#f8fafc',borderRadius:'12px',color:'#64748b'}}>
            No scheduled sessions yet.
          </div>
        )}
        {!loading && !error && sessions.length > 0 && (
          <div style={{overflowX:'auto',borderRadius:'12px',border:'1px solid #e2e8f0',background:'#fff'}}>
            <table style={{width:'100%',borderCollapse:'collapse',minWidth:'700px'}}>
              <thead>
                <tr style={{background:'#f8fafc'}}>
                  <th style={{padding:'14px 16px',borderBottom:'2px solid #e2e8f0',textAlign:'left',fontSize:'0.875rem',fontWeight:600,color:'#475569'}}>Student</th>
                  <th style={{padding:'14px 16px',borderBottom:'2px solid #e2e8f0',textAlign:'left',fontSize:'0.875rem',fontWeight:600,color:'#475569'}}>Agenda</th>
                  <th style={{padding:'14px 16px',borderBottom:'2px solid #e2e8f0',textAlign:'left',fontSize:'0.875rem',fontWeight:600,color:'#475569'}}>Date & Time</th>
                  <th style={{padding:'14px 16px',borderBottom:'2px solid #e2e8f0',textAlign:'left',fontSize:'0.875rem',fontWeight:600,color:'#475569'}}>Meeting Link</th>
                  <th style={{padding:'14px 16px',borderBottom:'2px solid #e2e8f0',textAlign:'left',fontSize:'0.875rem',fontWeight:600,color:'#475569'}}>Status</th>
                  <th style={{padding:'14px 16px',borderBottom:'2px solid #e2e8f0',textAlign:'left',fontSize:'0.875rem',fontWeight:600,color:'#475569'}}>Action</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id} style={{borderBottom:'1px solid #f1f5f9'}}>
                    <td style={{padding:'14px 16px',fontSize:'0.9rem',color:'#1e293b'}}>{session.student_name || 'N/A'}</td>
                    <td style={{padding:'14px 16px',fontSize:'0.9rem',color:'#475569'}}>{session.agenda}</td>
                    <td style={{padding:'14px 16px',fontSize:'0.9rem',color:'#475569'}}>
                      {session.timing ? new Date(session.timing).toLocaleString() : 'N/A'}
                    </td>
                    <td style={{padding:'14px 16px',fontSize:'0.9rem'}}>
                      {session.meeting_link ? (
                        <a href={session.meeting_link} target="_blank" rel="noopener noreferrer" style={{color:'#2563eb',textDecoration:'none',fontWeight:600}}>
                          Join Meeting
                        </a>
                      ) : 'N/A'}
                    </td>
                    <td style={{padding:'14px 16px',fontSize:'0.9rem'}}>
                      <span style={{padding:'4px 10px',borderRadius:'6px',fontSize:'0.85rem',fontWeight:600,background:session.status==='completed'?'#dcfce7':session.status==='cancelled'?'#fee2e2':'#dbeafe',color:session.status==='completed'?'#16a34a':session.status==='cancelled'?'#dc2626':'#2563eb'}}>
                        {session.status || 'scheduled'}
                      </span>
                    </td>
                    <td style={{padding:'14px 16px',fontSize:'0.9rem'}}>
                      <select
                        value={session.status || 'scheduled'}
                        onChange={(e) => handleStatusChange(session.id, e.target.value)}
                        disabled={updating === session.id}
                        style={{padding:'6px 10px',border:'1px solid #cbd5e1',borderRadius:'6px',fontSize:'0.875rem',cursor:'pointer',background:'#fff'}}
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
