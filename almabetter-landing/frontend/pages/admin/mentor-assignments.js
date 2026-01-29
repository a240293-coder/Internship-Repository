import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../lib/api';
import ConfirmModal from '../../components/ConfirmModal';

export default function MentorAssignmentsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [modal, setModal] = useState({ open:false });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRows = async (p = page) => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/history/mentor-assignments?page=${p}&pageSize=${pageSize}`);
      const data = res.data?.data || res.data || [];
      setRows(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load assignments');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchRows(); }, []);

  const handleUnassign = (r) => {
    if (!r || !r.form_id) return;
    setModal({ open:true, title:'Unassign Mentor', message:`Unassign mentor from ${r.student_name || r.studentName}?`, onConfirm: async () => {
      setActionLoading(true);
      try {
        await api.put(`/admin/forms/${r.form_id}/unassign-mentor`, {});
        setModal({ open:false });
        await fetchRows();
      } catch (err) { setError(err.message || 'Failed'); } finally { setActionLoading(false); }
    }, danger:false });
  };

  const handleDelete = (r) => {
    const id = r.id || r.assignment_id;
    if (!id) return;
    setModal({ open:true, title:'Delete Assignment Record', message:`Delete assignment record for ${r.student_name || r.studentName}?`, onConfirm: async () => {
      setActionLoading(true);
      try { await api.delete(`/admin/history/${id}`); setModal({ open:false }); await fetchRows(); }
      catch (err) { setError(err.message || 'Failed'); } finally { setActionLoading(false); }
    }, danger:true });
  };

  const goPrev = () => { if (page>1) { setPage(page-1); fetchRows(page-1); } };
  const goNext = () => { if (rows.length === pageSize) { setPage(page+1); fetchRows(page+1); } };

  return (
    <DashboardLayout title="Mentor Assignments" role="admin">
      <div style={{maxWidth:1100, margin:'0 auto', padding:'2rem 0'}}>
        <h2 style={{fontWeight:700}}>Mentor Assignments</h2>
        {error && <div className="error-message">{error}</div>}
        {loading ? <div>Loading…</div> : (
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%', borderCollapse:'collapse'}}>
              <thead>
                <tr style={{borderBottom:'1px solid #e6eef8'}}>
                  <th style={th}>Sr.No</th>
                  <th style={th}>Student</th>
                  <th style={th}>Mentor</th>
                  <th style={th}>Assigned At</th>
                  <th style={th}>Completed At</th>
                  <th style={th}>Status</th>
                  <th style={th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id || `${r.form_id}-${i}`} style={{borderBottom:'1px solid #f1f5f9'}}>
                    <td style={td}>{(page-1)*pageSize + i + 1}</td>
                    <td style={td}>{r.student_name || r.studentName || r.form_student_name || '--'}</td>
                    <td style={td}>{r.mentor_name || r.mentorName || r.form_mentor_name || '--'}</td>
                    <td style={td}>{r.assigned_at ? new Date(r.assigned_at).toLocaleString() : '--'}</td>
                    <td style={td}>{r.completed_at ? new Date(r.completed_at).toLocaleString() : '--'}</td>
                    <td style={td}>{r.status || (r.unassigned_at ? 'unassigned' : 'assigned')}</td>
                    <td style={td}>
                      <div style={{display:'flex', gap:8}}>
                        {!r.unassigned_at && <button className="assign-btn" onClick={() => handleUnassign(r)}>Unassign</button>}
                        <button className="danger-btn" onClick={() => handleDelete(r)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{display:'flex', justifyContent:'center', gap:8, marginTop:12}}>
              <button className="btn" onClick={goPrev} disabled={page===1}>Prev</button>
              <div style={{alignSelf:'center'}}>Page {page}</div>
              <button className="btn" onClick={goNext} disabled={rows.length < pageSize}>Next</button>
            </div>
          </div>
        )}
        <ConfirmModal {...modal} onCancel={() => setModal({ open:false })} />
      </div>
    </DashboardLayout>
  );
}

const th = { textAlign:'left', padding:'0.5rem', color:'#475569' };
const td = { padding:'0.5rem', color:'#0f172a' };
