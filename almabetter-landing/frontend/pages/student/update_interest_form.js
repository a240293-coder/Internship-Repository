import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../../lib/api';
import DashboardLayout from '../../components/DashboardLayout';
import styles from './interest_form_update.module.css';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

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
      setForms(data.sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at)));
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

  const fmt = (v) => { if (!v) return '--'; try { return new Date(v).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return '--'; } };

  return (
    <DashboardLayout title="Update Interest Form" role="student">
      <div className={styles.container}>
        {error && <div className="alert alert-error">{error}</div>}

        <section className={styles.studentSubmissions}>
          {loading ? (
            <div className={styles.loading}>Loading submissions...</div>
          ) : forms.length === 0 ? (
            <div className={styles.emptyState}>No submissions found yet.</div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.formsTable}>
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
                    <tr key={f.id || f.form_id}>
                      <td className={styles.domainCell} data-label="Domain">
                        {f.desiredDomain || f.desired_domain || '—'}
                      </td>
                      <td data-label="Interests">
                        {Array.isArray(f.interests) ? f.interests.join(', ') : (typeof f.interests === 'string' ? f.interests : '') || '—'}
                      </td>
                      <td data-label="Goals">
                        {f.goals || '—'}
                      </td>
                      <td data-label="Mentor">
                        {f.mentorName || f.mentor_name || 'Pending'}
                      </td>
                      <td data-label="Submitted">
                        {fmt(f.createdAt || f.created_at)}
                      </td>
                      <td data-label="Actions">
                        <div className={styles.actionsCell}>
                          <button
                            type="button"
                            className={styles.editBtn}
                            onClick={() => handleEdit(f.id || f.form_id)}
                          >
                            <FiEdit2 size={14} /> Edit
                          </button>
                          <button
                            type="button"
                            className={styles.deleteBtn}
                            onClick={() => handleDelete(f.id || f.form_id)}
                          >
                            <FiTrash2 size={14} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
