import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import Link from 'next/link';
import DashboardLayout from '../../components/DashboardLayout';
import '../auth/Dashboard.css';

const AdminMentorsList = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await api.get('/mentor/all', { headers });
        setMentors(res.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load mentors');
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, []);

  return (
    <DashboardLayout title="Mentors" role="admin">
      <main className="dashboard-main" style={{
        paddingTop: '0.5rem',
        paddingBottom: '1.5rem',
        background: 'none',
        boxShadow: 'none',
        border: 'none',
      }}>
        {error && <div className="error-message">{error}</div>}
        {loading ? (
          <div>Loading mentors...</div>
        ) : (
          <>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0', marginTop: '0.5rem', paddingBottom: '0' }}>All Mentors</h3>
            {mentors.length === 0 ? (
              <div>No mentors found.</div>
            ) : (
              <table
                className="mentors-table"
                style={{
                  borderCollapse: 'collapse',
                  background: '#fff',
                  fontSize: '0.97rem',
                  marginBottom: '1rem',
                  width: '700px',
                  minWidth: '350px',
                  maxWidth: '100%',
                  height: 'auto',
                  tableLayout: 'fixed',
                }}
              >
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    <th style={{ padding: '8px 4px', border: '1px solid #e2e8f0', textAlign: 'left', fontSize: '0.97rem', width: '8%' }}>#</th>
                    <th style={{ padding: '8px 4px', border: '1px solid #e2e8f0', textAlign: 'left', fontSize: '0.97rem', width: '46%' }}>Name</th>
                    <th style={{ padding: '8px 4px', border: '1px solid #e2e8f0', textAlign: 'left', fontSize: '0.97rem', width: '46%' }}>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {mentors.map((mentor, idx) => (
                    <tr key={mentor.id} style={{borderBottom:'1px solid #e2e8f0'}}>
                      <td style={{ padding: '10px 8px', border: '1px solid #e2e8f0', fontSize: '0.9rem', width: '8%' }}>{idx + 1}</td>
                      <td style={{
                        padding: '10px 8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '0.9rem',
                        width: '46%',
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word',
                      }}>
                        <Link href={`/admin/mentor/${mentor.id || mentor._id || mentor.email}`} style={{ color: '#0b63e6', fontWeight: 700, textDecoration: 'none' }}>{mentor.name}</Link>
                      </td>
                      <td style={{
                        padding: '10px 8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '0.9rem',
                        width: '46%',
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word',
                      }}>{mentor.email}</td>
                      {/* Mobile-specific styles for table size and text size */}
                      <style jsx global>{`
                        @media (max-width: 768px) {
                          .mentors-table {
                            font-size: 0.85rem !important;
                            min-width: 0 !important;
                          }
                          th, td {
                            padding: 8px 6px !important;
                            font-size: 0.85rem !important;
                          }
                        }
                      `}</style>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </main>
    </DashboardLayout>
  );
};

export default AdminMentorsList;