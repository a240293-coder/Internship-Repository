import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import Link from 'next/link';
import DashboardLayout from '../../components/DashboardLayout';
import '../auth/Dashboard.css';

const AdminMentorsList = () => {
  const [mentors, setMentors] = useState([]);
  const [filteredMentors, setFilteredMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expertiseFilter, setExpertiseFilter] = useState('');

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await api.get('/mentor/all', { headers });
        setMentors(res.data || []);
        setFilteredMentors(res.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load mentors');
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, []);

  useEffect(() => {
    if (!expertiseFilter) {
      setFilteredMentors(mentors);
    } else {
      setFilteredMentors(mentors.filter(m => 
        (m.expertise || '').toLowerCase().includes(expertiseFilter.toLowerCase())
      ));
    }
  }, [expertiseFilter, mentors]);

  return (
    <DashboardLayout title="Mentors" role="admin">
      <main className="dashboard-main" style={{
        paddingTop: '0.5rem',
        paddingBottom: '1.5rem',
        background: 'none',
        boxShadow: 'none',
        border: 'none',
      }}>
        {error && <div style={{padding:'12px',background:'#fee',color:'#c00',borderRadius:'8px',marginBottom:'1rem'}}>{error}</div>}
        {loading ? (
          <div style={{textAlign:'center',padding:'2rem',color:'#64748b'}}>Loading mentors...</div>
        ) : (
          <>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem',flexWrap:'wrap',gap:'1rem'}}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>All Mentors</h3>
              <div style={{position:'relative',flex:'1',maxWidth:'400px',minWidth:'250px'}}>
                <svg style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',width:'18px',height:'18px',color:'#94a3b8'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input
                  type="text"
                  placeholder="Filter by expertise..."
                  value={expertiseFilter}
                  onChange={(e) => setExpertiseFilter(e.target.value)}
                  style={{
                    padding: '10px 12px 10px 40px',
                    fontSize: '0.95rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    width: '100%',
                    outline:'none',
                    transition:'all 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                />
              </div>
            </div>
            {filteredMentors.length === 0 ? (
              <div style={{textAlign:'center',padding:'3rem',background:'#f8fafc',borderRadius:'12px',color:'#64748b'}}>No mentors found.</div>
            ) : (
              <div style={{overflowX:'auto',borderRadius:'12px',border:'1px solid #e2e8f0',background:'#fff'}}>
                <table
                  className="mentors-table"
                  style={{
                    borderCollapse: 'collapse',
                    width: '100%',
                    minWidth: '600px'
                  }}
                >
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ padding: '14px 16px', borderBottom: '2px solid #e2e8f0', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>#</th>
                      <th style={{ padding: '14px 16px', borderBottom: '2px solid #e2e8f0', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Name</th>
                      <th style={{ padding: '14px 16px', borderBottom: '2px solid #e2e8f0', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Email</th>
                      <th style={{ padding: '14px 16px', borderBottom: '2px solid #e2e8f0', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Expertise</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMentors.map((mentor, idx) => (
                      <tr key={mentor.id} style={{borderBottom:'1px solid #f1f5f9',transition:'background 0.15s'}} onMouseEnter={(e)=>e.currentTarget.style.background='#f8fafc'} onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>
                        <td style={{ padding: '14px 16px', fontSize: '0.9rem', color: '#64748b' }}>{idx + 1}</td>
                        <td style={{padding: '14px 16px',fontSize: '0.9rem'}}>
                          <Link href={`/admin/mentor/${mentor.id || mentor._id || mentor.email}`} style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>{mentor.name}</Link>
                        </td>
                        <td style={{padding: '14px 16px',fontSize: '0.9rem',color:'#475569'}}>{mentor.email}</td>
                        <td style={{padding: '14px 16px',fontSize: '0.9rem'}}>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                            {(mentor.expertise || '').toString().split(',').filter(Boolean).map((exp, i) => (
                              <span key={i} style={{ display: 'inline-block', background: '#eff6ff', color: '#2563eb', padding: '4px 10px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600 }}>
                                {exp.trim()}
                              </span>
                            ))}
                            {!mentor.expertise && <span style={{ color: '#cbd5e1' }}>—</span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
      <style jsx global>{`
        @media (max-width: 768px) {
          .mentors-table {
            font-size: 0.8rem !important;
            min-width: 500px !important;
          }
          .mentors-table th,
          .mentors-table td {
            padding: 10px 12px !important;
            font-size: 0.8rem !important;
          }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default AdminMentorsList;