import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import api from '../../lib/api';
import './Dashboard.css';
import DashboardLayout from '../../components/DashboardLayout';

const StudentDashboard = () => {
  const router = useRouter();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchForm();
  }, []);

  const fetchForm = async () => {
    try {
      const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
      const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
      const q = userId ? `?userId=${encodeURIComponent(userId)}` : userEmail ? `?email=${encodeURIComponent(userEmail)}` : '';
      const response = await api.get(`/forms/my-form${q}`);
      setForm(response.data);
    } catch (err) {
      if (err.response?.status !== 404) {
        setError(err.response?.data?.message || 'Failed to fetch form');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
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

  const stats = [
    {
      label: 'Preferred Domain',
      value: form?.desiredDomain || 'Select a track',
      helper: form ? 'Chosen focus area' : 'Update anytime from your form'
    },
    {
      label: 'Mentor Assigned',
      value: form?.mentorName || 'Pending',
      helper: form?.mentorEmail || 'We will notify you once assigned'
    },
    {
      label: 'Last Updated',
      value: form ? formatDate(form.updatedAt || form.createdAt) : '--',
      helper: 'Based on your latest submission'
    }
  ];

  const heroStatus = form ? formatStatus(form.status) : 'Not started';
  const heroNote = form
    ? `Mentor: ${form.mentorName || 'Pending assignment'}`
    : 'Complete the interest form to unlock mentoring conversations';
  const heroActionLabel = form ? 'Update interest form' : 'Start interest form';

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <DashboardLayout title="Student Dashboard" role="student" onLogout={handleLogout}>
      {error && <div className="alert alert-error">{error}</div>}

      <section className="stats-grid">
        {stats.map((stat) => (
          <article key={stat.label} className="stat-card">
            <p className="stat-label">{stat.label}</p>
            <p className="stat-value">{stat.value}</p>
            <p className="stat-helper">{stat.helper}</p>
          </article>
        ))}
      </section>

      <section className="dashboard-hero">
        <div className="hero-copy">
          <p className="hero-eyebrow">Student workspace</p>
          <h2 className="hero-title">Focus on the next milestone</h2>
          <p className="hero-subtitle">
            Keep your interests updated so we can match you with the right mentor and
            opportunities.
          </p>
          <p className="hero-note">{heroNote}</p>
        </div>
        <div className="hero-cta-card">
          <p className="hero-cta-label">Interest form status</p>
          <p className="hero-cta-value">{heroStatus}</p>
          <p className="hero-cta-helper">
            {form ? `Updated ${formatDate(form.updatedAt || form.createdAt)}` : 'No submission yet'}
          </p>
          <Link href="/student/form" className="btn btn-primary hero-cta-button">
            {heroActionLabel}
          </Link>
        </div>
      </section>


    </DashboardLayout>
  );
};

export default StudentDashboard;
