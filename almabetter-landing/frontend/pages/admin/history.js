import React, { useEffect, useState, useRef } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../lib/api';
import ConfirmModal from '../../components/ConfirmModal';

export default function AdminHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [modal, setModal] = useState({ open: false });
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('assignments'); // assignments | students | completedSessions
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [completedSessions, setCompletedSessions] = useState([]);
  const [completedSessionsLoading, setCompletedSessionsLoading] = useState(false);

  const fetchHistory = async (p = page) => {
    try {
      setLoading(true);
      // Use paginated mentor-assignments endpoint which supports page/pageSize
      const res = await api.get(`/api/admin/history/mentor-assignments?page=${p}&pageSize=${pageSize}`);
      const rows = res.data?.data || res.data || [];
      setHistory(rows);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    // Listen for assignment events so this table can refresh live
    const handler = (e) => {
      // Switch to assignments tab and reload history
      setActiveTab('assignments');
      setPage(1);
      fetchHistory(1);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('assignmentUpdated', handler);
    }
    return () => { if (typeof window !== 'undefined') window.removeEventListener('assignmentUpdated', handler); };
  }, []);

  useEffect(() => {
    // fetch data for the active tab when it changes
    if (activeTab === 'students') fetchStudents();
    if (activeTab === 'completedSessions') fetchCompletedSessions();
  }, [activeTab]);

  const fetchCompletedSessions = async () => {
    try {
      setCompletedSessionsLoading(true);
      const res = await api.get('/api/admin/completed-live-sessions');
      setCompletedSessions(res.data?.data || res.data || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load completed live sessions');
    } finally {
      setCompletedSessionsLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setStudentsLoading(true);
      const res = await api.get('/admin/forms');
      const rows = res.data?.data || res.data || [];
      setStudents(rows.map(r => ({ ...r })));
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load student forms');
    } finally { setStudentsLoading(false); }
  };

  // Small wrapper component that provides a visible horizontal scrollbar
  // and left/right chevrons to scroll the table on narrow viewports.
  const TableScroll = ({ children }) => {
    const sc = useRef(null);
    const trackRef = useRef(null);
    const thumbRef = useRef(null);
    const [thumbStyle, setThumbStyle] = useState({ width: '0%', left: '0%' });

    const updateThumb = () => {
      const el = sc.current;
      const track = trackRef.current;
      if (!el || !track) return;
      const cw = el.clientWidth;
      const sw = el.scrollWidth;
      const sl = el.scrollLeft;
      const ratio = cw / sw;
      const thumbW = Math.max(ratio * 100, 6); // percent
      const maxScroll = Math.max(sw - cw, 1);
      const leftPct = (sl / maxScroll) * (100 - thumbW);
      setThumbStyle({ width: `${thumbW}%`, left: `${leftPct}%` });
    };

    useEffect(() => {
      updateThumb();
      const el = sc.current;
      if (!el) return;
      const onScroll = () => updateThumb();
      const onResize = () => updateThumb();
      el.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onResize);
      return () => {
        el.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onResize);
      };
    }, []);

    const scrollBy = (dir = 1) => {
      if (!sc.current) return;
      const amount = Math.max(sc.current.clientWidth - 80, 240);
      sc.current.scrollBy({ left: dir * amount, behavior: 'smooth' });
    };

    const onTrackClick = (e) => {
      const el = sc.current;
      const track = trackRef.current;
      if (!el || !track) return;
      const rect = track.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const trackW = rect.width;
      const targetPct = clickX / trackW;
      const sw = el.scrollWidth;
      const cw = el.clientWidth;
      const maxScroll = Math.max(sw - cw, 0);
      el.scrollTo({ left: Math.round(targetPct * maxScroll), behavior: 'smooth' });
    };

    return (
      <div className="simple-table-wrapper table-scroll" ref={sc}>
        {children}
        
      </div>
    );
  };

  const handleUnassign = (record) => {
    if (!record || !record.form_id) return;
    setModal({ open: true, title: 'Unassign Mentor', message: `Unassign mentor for ${record.student_name || 'this student'}?`, onConfirm: async () => {
      setActionLoading(true);
      try {
        await api.put(`/admin/forms/${record.form_id}/unassign-mentor`, {});
        setModal({ open: false });
        await fetchHistory();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to unassign');
      } finally { setActionLoading(false); }
    }, danger: false });
  };

  const handleDelete = (record) => {
    const id = record.id || record.assignment_id;
    if (!id) return;
    setModal({ open: true, title: 'Delete History', message: `Permanently delete history record for ${record.student_name || 'this student'}? This cannot be undone.`, onConfirm: async () => {
      setActionLoading(true);
      try {
        await api.delete(`/admin/history/${id}`);
            setModal({ open: false });
            if (activeTab === 'students') await fetchStudents();
            else await fetchHistory();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete history');
      } finally { setActionLoading(false); }
    }, danger: true });
  };

  const handleClearAll = () => {
    setModal({ open: true, title: 'Clear All History', message: 'Clear all assignment history? This will permanently remove all history.', onConfirm: async () => {
      setActionLoading(true);
      try {
        await api.delete('/admin/history');
        setModal({ open: false });
        if (activeTab === 'students') await fetchStudents();
        else await fetchHistory(1);
        setPage(1);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to clear history');
      } finally { setActionLoading(false); }
    }, danger: true });
  };

  const handleExport = async () => {
    try {
      setActionLoading(true);
      const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
      const url = `/api/admin/history/mentor-assignments?exportType=csv&page=${page}&pageSize=${pageSize}`;
      const base = (typeof window !== 'undefined' && window.location.origin) || '';
      const res = await fetch(base + url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error('Export failed');
      const text = await res.text();
      const blob = new Blob([text], { type: 'text/csv' });
      const href = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = href;
      a.download = `mentor_assignments_page${page}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
    } catch (err) {
      setError(err.message || 'Export failed');
    } finally { setActionLoading(false); }
  };

  const goPrev = () => { if (page > 1) { setPage(page-1); fetchHistory(page-1); } };
  const goNext = () => { if (history.length === pageSize) { setPage(page+1); fetchHistory(page+1); } };
  const thStyle = {padding:'0.75rem 0.5rem', color:'#475569', fontSize:'0.9rem'};
  const tdStyle = {padding:'0.75rem 0.5rem', color:'#0f172a', fontSize:'0.95rem', verticalAlign:'middle'};

  return (
    <DashboardLayout title="Admin History" role="admin">
      <div className="dashboard-main simple-dashboard">
      <div style={{maxWidth:'1100px',margin:'0 auto',padding:'2rem 0',color:'#1e293b'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem', flexWrap:'wrap', gap:'1rem'}}>
          <h2 style={{fontWeight:'700',fontSize:'1.5rem',marginBottom:0}}>Assignment History</h2>
          <div />
        </div>
        {error && <div className="error-message">{error}</div>}

        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem', flexWrap:'wrap', gap:'0.75rem'}}>
          <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap'}}>
            <button className={activeTab==='assignments' ? 'tab-active' : 'tab-btn'} onClick={() => setActiveTab('assignments')} style={{padding:'0.5rem 0.75rem',fontSize:'0.9rem'}}>Assignment History</button>
            <button className={activeTab==='students' ? 'tab-active' : 'tab-btn'} onClick={() => setActiveTab('students')} style={{padding:'0.5rem 0.75rem',fontSize:'0.9rem'}}>Student Forms</button>
            <button className={activeTab==='completedSessions' ? 'tab-active' : 'tab-btn'} onClick={() => setActiveTab('completedSessions')} style={{padding:'0.5rem 0.75rem',fontSize:'0.9rem'}}>Completed Live Sessions</button>
          </div>
          <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap'}}>
            {activeTab === 'assignments' && <button className="assign-btn" onClick={handleExport} disabled={actionLoading} style={{padding:'0.5rem 0.75rem',fontSize:'0.9rem'}}>{actionLoading ? 'Working…' : 'Export CSV'}</button>}
            <button className="assign-btn" onClick={handleClearAll} disabled={actionLoading} style={{padding:'0.5rem 0.75rem',fontSize:'0.9rem'}}>Clear All</button>
          </div>
        </div>
        {activeTab === 'completedSessions' && (
          <>
            {completedSessionsLoading ? <div>Loading completed live sessions...</div> : (
              <TableScroll>
                <table className="forms-table">
                  <thead>
                    <tr style={{textAlign:'left',borderBottom:'1px solid #e6eef8'}}>
                      <th style={thStyle}>Sr.No</th>
                      <th style={thStyle}>Student Name</th>
                      <th style={thStyle}>Email</th>
                      <th style={thStyle}>Phone</th>
                      <th style={thStyle}>Preferred Date</th>
                      <th style={thStyle}>Preferred Time</th>
                      <th style={thStyle}>Session Topic</th>
                      <th style={thStyle}>Status</th>
                      <th style={thStyle}>Created At</th>
                      <th style={thStyle}>Completed At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedSessions.map((s, i) => (
                      <tr key={s.id}>
                        <td style={tdStyle}>{i+1}</td>
                        <td style={tdStyle}>{s.studentName}</td>
                        <td style={tdStyle}>{s.studentEmail}</td>
                        <td style={tdStyle}>{s.phone}</td>
                        <td style={tdStyle}>{s.preferredDate}</td>
                        <td style={tdStyle}>{s.preferredTime}</td>
                        <td style={tdStyle}>{s.sessionTopic}</td>
                        <td style={tdStyle}>{s.status}</td>
                        <td style={tdStyle}>{s.created_at ? new Date(s.created_at).toLocaleString() : '--'}</td>
                        <td style={tdStyle}>{s.completed_at ? new Date(s.completed_at).toLocaleString() : '--'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableScroll>
            )}
          </>
        )}

        {activeTab === 'assignments' && (
          <>
            {loading ? (
              <div>Loading assignment history...</div>
            ) : (
              <>
                {history.length === 0 ? (
                  <p>No assignment history found.</p>
                ) : (
                    <TableScroll>
                      <table className="forms-table">
                      <thead>
                        <tr style={{textAlign:'left',borderBottom:'1px solid #e6eef8'}}>
                          <th style={thStyle}>Sr.No</th>
                          <th style={thStyle}>Student</th>
                          <th style={thStyle}>Mentor</th>
                          <th style={thStyle}>Assigned At</th>
                          <th style={thStyle}>Completed At</th>
                          <th style={thStyle}>Notes</th>
                          <th style={thStyle}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((record, idx) => {
                          const sr = (page - 1) * pageSize + idx + 1;
                          return (
                            <tr key={record.id || record.assignment_id || `${record.form_id}-${record.assigned_at}`} style={{borderBottom:'1px solid #f1f5f9'}}>
                              <td style={tdStyle}>{sr}</td>
                              <td style={tdStyle}>{record.student_name || record.studentName || ''}</td>
                              <td style={tdStyle}>{record.mentor_name || record.mentorName || ''}</td>
                              <td style={tdStyle}>{record.assigned_at ? new Date(record.assigned_at).toLocaleString() : '--'}</td>
                              <td style={tdStyle}>{record.completed_at ? new Date(record.completed_at).toLocaleString() : '--'}</td>
                              <td style={tdStyle}>{record.notes || ''}</td>
                              <td style={tdStyle}>
                                <div className="action-buttons">
                                  {!record.unassigned_at && (
                                    <button className="assign-btn" onClick={() => handleUnassign(record)} style={{padding:'0.5rem 0.75rem',fontSize:'0.85rem'}}>Unassign</button>
                                  )}
                                  <button className="danger-btn" onClick={() => handleDelete(record)} style={{padding:'0.5rem 0.75rem',fontSize:'0.85rem'}}>Delete</button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </TableScroll>
                )}
                <div style={{display:'flex', justifyContent:'center', gap:'0.5rem', marginTop:'1rem'}}>
                  <button className="btn" onClick={goPrev} disabled={page===1 || loading}>Prev</button>
                  <div style={{alignSelf:'center'}}>Page {page}</div>
                  <button className="btn" onClick={goNext} disabled={loading || history.length < pageSize}>Next</button>
                </div>
              </>
            )}
          </>
        )}

        {activeTab === 'students' && (
          <>
            {studentsLoading ? <div>Loading student forms...</div> : (
              <TableScroll>
                <table className="forms-table">
                  <thead>
                    <tr style={{textAlign:'left',borderBottom:'1px solid #e6eef8'}}>
                      <th style={thStyle}>Sr.No</th>
                      <th style={thStyle}>Student Name</th>
                      <th style={thStyle}>Email</th>
                      <th style={thStyle}>Assigned Mentor</th>
                      <th style={thStyle}>Submitted At</th>
                      <th style={thStyle}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, i) => (
                      <tr key={s.id || s.form_id} style={{borderBottom:'1px solid #f1f5f9'}}>
                        <td style={tdStyle}>{i+1}</td>
                        <td style={tdStyle}>{s.student_name || s.studentName || ''}</td>
                        <td style={tdStyle}>{s.email || s.student_email || ''}</td>
                        <td style={tdStyle}>{s.mentor_name || s.mentorName || ''}</td>
                        <td style={tdStyle}>{s.created_at ? new Date(s.created_at).toLocaleString() : '--'}</td>
                        <td style={tdStyle}><button className="assign-btn" onClick={() => window.location.href = `/admin/mentor-assign?formId=${s.form_id || s.id}`} style={{padding:'0.5rem 0.75rem',fontSize:'0.85rem'}}>Assign</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableScroll>
            )}
          </>
        )}

        {/* 'mentors' tab removed — assignments and student forms remain */}
      </div>
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
          /* Organize action buttons in a row and center them on mobile */
          td > div[style*='display:flex'][style*='gap'] {
            flex-direction: row !important;
            justify-content: center !important;
            align-items: center !important;
            gap: 0.5rem !important;
          }
        }
      `}</style>
      {/* Confirmation modal for unassign/delete/clear actions */}
      <ConfirmModal
        open={modal.open}
        title={modal.title}
        message={modal.message}
        onConfirm={modal.onConfirm}
        onCancel={() => setModal({ open: false })}
        danger={modal.danger}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
      />
    </DashboardLayout>
  );
}
