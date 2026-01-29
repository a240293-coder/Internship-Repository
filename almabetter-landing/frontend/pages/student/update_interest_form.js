import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../../lib/api';
import '../auth/Dashboard.css';
import DashboardLayout from '../../components/DashboardLayout';

export default function UpdateInterestFormPage() {
  const router = useRouter();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchForms(); }, []);

  async function fetchForms() {
    setLoading(true);
    try {
      const userId = typeof window !== 'undefined' ? (localStorage.getItem('userId_student') || localStorage.getItem('userId')) : null;
      const userEmail = typeof window !== 'undefined' ? (localStorage.getItem('userEmail_student') || localStorage.getItem('userEmail')) : null;
      const params = userId ? `?userId=${encodeURIComponent(userId)}` : userEmail ? `?email=${encodeURIComponent(userEmail)}` : '';
      const res = await api.get(`/forms/my-forms${params}`).catch(() => null) || await api.get(`/forms/my-form${params}`).catch(() => null);
      const data = res && res.data ? (Array.isArray(res.data) ? res.data : [res.data]) : [];
      setForms(data.sort((a,b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at)));
      setError('');
    } catch (e) {
      setError('Failed to load submissions');
      setForms([]);
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (id) => {
    if (!id) return;
    router.push(`/student/form?mode=update&formId=${encodeURIComponent(id)}`);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this submission?')) return;
    try {
      await api.delete(`/forms/${id}`);
      await fetchForms();
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('statusUpdated'));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete submission');
    }
  };

  const fmt = (v) => { if (!v) return '--'; try { return new Date(v).toLocaleDateString(); } catch { return '--'; } };

  return (
    <DashboardLayout title="Update Interest Form" role="student">
      {error && <div className="alert alert-error">{error}</div>}
      <section className="student-submissions">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : forms.length === 0 ? (
          <div>No submissions yet.</div>
        ) : (
          <div className="simple-table-wrapper" style={{ overflowX: 'auto' }}>
            <table className="forms-table" role="table">
              <thead>
                <tr>
                  <th>Domain</th>
                  <th>Interests</th>
                  <th>Goals</th>
                  <th>Mentor</th>
                  <th>Submitted</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {forms.map((f) => (
                  <tr key={f.id || f.form_id || Math.random()}>
                    <td className="td-domain" data-label="Domain">
                      <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>{f.desiredDomain || f.desired_domain || '—'}</div>
                    </td>
                    <td className="td-interests" data-label="Interests">
                      <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>{Array.isArray(f.interests) ? f.interests.join(', ') : (typeof f.interests === 'string' ? f.interests : '')}</div>
                    </td>
                    <td className="td-goals" data-label="Goals">
                      <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>{f.goals || '—'}</div>
                    </td>
                    <td className="td-mentor" data-label="Mentor">
                      <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>{f.mentorName || f.mentor_name || 'Pending'}</div>
                    </td>
                    <td className="td-submitted" data-label="Submitted">
                      {fmt(f.createdAt || f.created_at)}
                    </td>
                    <td className="td-actions" data-label="Actions" style={{ textAlign: 'center' }}>
                      <button type="button" className="assign-btn" onClick={() => handleEdit(f.id || f.form_id)} style={{ marginRight: 8 }}>Edit</button>
                      <button type="button" className="danger-btn" onClick={() => handleDelete(f.id || f.form_id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}
