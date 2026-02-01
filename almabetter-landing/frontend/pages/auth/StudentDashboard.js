import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import api from '../../lib/api';
import './Dashboard.css';
import DashboardLayout from '../../components/DashboardLayout';
import ProfileHeader from '../../components/shared/ProfileHeader';

const StudentDashboard = () => {
  const router = useRouter();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  

  useEffect(() => {
    fetchForms();
    const handler = () => fetchForms();
    window.addEventListener('assignmentChanged', handler);
    return () => {
      window.removeEventListener('assignmentChanged', handler);
    };
  }, []);

  const fetchForms = async () => {
    setLoading(true);
    try {
      const userId = typeof window !== 'undefined' ? (localStorage.getItem('userId_student') || localStorage.getItem('userId')) : null;
      const userEmail = typeof window !== 'undefined' ? (localStorage.getItem('userEmail_student') || localStorage.getItem('userEmail')) : null;
      const params = userId ? `?userId=${encodeURIComponent(userId)}` : userEmail ? `?email=${encodeURIComponent(userEmail)}` : '';

      // Try preferred endpoint first: /forms/my-forms (backend may implement this)
      try {
        const res = await api.get(`/forms/my-forms${params}`);
        const data = Array.isArray(res?.data) ? res.data : (res?.data ? [res.data] : []);
        setForms(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        setError('');
        return;
      } catch (e) {
        // ignore and try next
      }

      // Next try the single-item endpoint and wrap into array
      try {
        const res = await api.get(`/forms/my-form${params}`);
        const d = res?.data;
        const arr = d ? (Array.isArray(d) ? d : [d]) : [];
        setForms(arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        setError('');
        return;
      } catch (e) {
        // ignore and try fallback
      }

      // Fallback: some setups expose mentor endpoint returning all forms; filter locally
      try {
        const res = await api.get('/mentor/students');
        const all = Array.isArray(res?.data) ? res.data : [];
        const filtered = all.filter((f) => {
          if (userId && f.studentId) return String(f.studentId) === String(userId);
          if (userEmail && f.studentEmail) return String(f.studentEmail) === String(userEmail);
          return false;
        }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setForms(filtered);
        setError('');
        return;
      } catch (err) {
        // If backend doesn't support any of these endpoints, treat as no submissions yet
        const status = err?.response?.status;
        if (status && status !== 404) {
          setError(err?.response?.data?.message || 'Failed to fetch forms');
        } else {
          setError('');
          setForms([]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  

  const handleLogout = () => {
    try {
      const storedRole = localStorage.getItem('userRole');
      const storedRoleNorm = storedRole ? String(storedRole).toLowerCase() : null;
      if (storedRoleNorm) {
        localStorage.removeItem(`userName_${storedRoleNorm}`);
        localStorage.removeItem(`userEmail_${storedRoleNorm}`);
        localStorage.removeItem(`userId_${storedRoleNorm}`);
      }
    } catch (e) {}
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    
    // Trigger auth change event
    window.dispatchEvent(new Event('authChanged'));
    
    router.replace('/');
  };

  const formatStatus = (status) => {
    if (!status) return 'Not started';
    return status.replace(/_/g, ' ').replace(/^(\w)/, (c) => c.toUpperCase());
  };

  const formatDate = (value) => {
    if (!value) return '--';
    try {
      return new Date(value).toLocaleDateString();
    } catch (err) {
      return '--';
    }
  };


  // Student stats will show historical submissions (most recent first)

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <DashboardLayout title="Student Dashboard" role="student" onLogout={handleLogout}>
      {error && <div className="alert alert-error">{error}</div>}
      <ProfileHeader name={typeof window !== 'undefined' ? (localStorage.getItem('userName_student') || localStorage.getItem('userName')) : 'Student'} sub={typeof window !== 'undefined' ? (localStorage.getItem('userEmail_student') || localStorage.getItem('userEmail')) : ''} />

      <section className="student-stats-grid">
        {/* Preferred Domain Card (shows domains from all submissions) */}
        <article className="student-stat-card">
          <div className="student-stat-label">PREFERRED DOMAIN</div>
          <div className="student-stat-value">
            {forms.length === 0 ? 'Select a track' : (
              <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                {forms.map((f) => (
                  <li key={f.id}>{f.desiredDomain || '—'}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="student-stat-helper">Chosen focus area (most recent first)</div>
        </article>
        {/* Mentor Assigned Card (shows mentor assignments across submissions) */}
        <article className="student-stat-card">
          <div className="student-stat-label">MENTOR ASSIGNED</div>
          <div className="student-stat-value">
            {forms.length === 0 ? 'Pending' : (
              <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                {forms.map((f) => (
                  <li key={f.id}>{f.mentorName || 'Pending'}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="student-stat-helper">Mentor (if assigned) per submission</div>
        </article>
        {/* Last Updated Card (shows timestamps for all submissions) */}
        <article className="student-stat-card">
          <div className="student-stat-label">LAST UPDATED</div>
          <div className="student-stat-value">
            {forms.length === 0 ? '--' : (
              <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                {forms.map((f) => (
                  <li key={f.id}>{formatDate(f.createdAt || f.updatedAt)}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="student-stat-helper">Timestamps for each submission (most recent first)</div>
        </article>
      </section>

      {/* Submissions table removed: use /student/update_interest_form for editing/deleting submissions */}

      

      {/* dashboard-hero removed per request */}


    </DashboardLayout>
  );
};

export default StudentDashboard;
