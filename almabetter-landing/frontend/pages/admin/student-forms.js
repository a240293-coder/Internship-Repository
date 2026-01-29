import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../lib/api';
import { useRouter } from 'next/router';

export default function StudentForms() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const fetchForms = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/forms');
      const rows = res.data?.data || res.data || [];
      setForms(rows.map((f, idx) => ({ ...f, idx })));
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load forms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchForms(); }, []);

  return (
    <DashboardLayout title="Student Forms" role="admin">
      <div style={{maxWidth:1200, margin:'0 auto', padding:'2rem 0'}}>
        <h2 style={{fontWeight:700, marginBottom: '1rem'}}>Student Interest Forms</h2>
        {error && <div className="error-message">{error}</div>}
        {loading ? (
          <div>Loading forms…</div>
        ) : (
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%', borderCollapse:'collapse'}}>
              <thead>
                <tr style={{borderBottom:'1px solid #e6eef8'}}>
                  <th style={th}>Sr.No</th>
                  <th style={th}>Student</th>
                  <th style={th}>Email</th>
                  <th style={th}>Interests</th>
                  <th style={th}>Desired Domain</th>
                  <th style={th}>Submitted At</th>
                  <th style={th}>Assigned Mentor</th>
                  <th style={th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {forms.map((f, i) => (
                  <tr key={f.id || f.form_id || i} style={{borderBottom:'1px solid #f1f5f9'}}>
                    <td style={td}>{i+1}</td>
                    <td style={td}>{f.student_name || f.studentName || f.studentName}</td>
                    <td style={td}>{f.student_email || f.studentEmail || f.studentEmail}</td>
                    <td style={td}>{Array.isArray(f.interests) ? f.interests.join(', ') : f.interests}</td>
                    <td style={td}>{f.desired_domain || f.desiredDomain || f.desiredDomain}</td>
                    <td style={td}>{f.created_at ? new Date(f.created_at).toLocaleString() : (f.createdAt ? new Date(f.createdAt).toLocaleString() : '--')}</td>
                    <td style={td}>{f.mentor_name || f.mentorName || '--'}</td>
                    <td style={td}>
                      <div style={{display:'flex', gap:8}}>
                        <button className="btn" onClick={() => router.push(`/admin/mentor-assign?formId=${f.id || f.form_id || ''}`)}>Assign</button>
                        <button className="btn" onClick={() => alert(JSON.stringify(f, null, 2))}>View</button>
                      </div>
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

const th = { textAlign: 'left', padding: '0.75rem 0.5rem', color:'#475569' };
const td = { padding: '0.5rem 0.5rem', color:'#0f172a' };
