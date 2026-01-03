import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../api';
import { API_HOST } from '../api';
import './Dashboard.css';
import DashboardLayout from '../../components/DashboardLayout';

const AdminDashboard = () => {
  const router = useRouter();
  const [forms, setForms] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [assignmentDrafts, setAssignmentDrafts] = useState({});
  const [expandedFormId, setExpandedFormId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [formsRes, mentorsRes] = await Promise.all([
        api.get('/admin/forms'),
        api.get('/mentor/all')
      ]);
      console.log('Forms fetched:', formsRes.data);
      console.log('Mentors fetched:', mentorsRes.data);
      setForms(formsRes.data);
      setMentors(mentorsRes.data);
      setError('');
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const getFormId = (form) => form._id || form.id;

  const handleSelectMentor = (formId, mentorId) => {
    setAssignmentDrafts((prev) => ({ ...prev, [formId]: mentorId }));
    setError('');
  };

  const handleAssignMentor = async (form) => {
    const formId = getFormId(form);
    const mentorId = assignmentDrafts[formId];

    if (!mentorId) {
      setError('Please choose a mentor before assigning');
      return;
    }

    const mentor = mentors.find((m) => String(m.id) === String(mentorId));
    if (!mentor) {
      setError('Selected mentor not found');
      return;
    }

    try {
      const targetId = form.id ?? form._id;
      await api.put(`/admin/forms/${targetId}/assign-mentor`, {
        mentorId: mentor.id,
        mentorName: mentor.name
      });

      setError('');
      setSuccess('Mentor assigned successfully');
      setTimeout(() => setSuccess(''), 3000);
      setAssignmentDrafts((prev) => ({ ...prev, [formId]: '' }));
      setExpandedFormId(formId);
      fetchData();
    } catch (err) {
      console.error('Error assigning mentor:', err);
      setError(err.response?.data?.message || 'Failed to assign mentor');
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

    // Use Next.js router to navigate to home
    router.replace('/');
  };

  const filteredForms = filterStatus === 'all'
    ? forms
    : forms.filter((f) => f.status === filterStatus);

  const toggleDetails = (formId) => {
    setExpandedFormId((prev) => (prev === formId ? null : formId));
  };

  const formatStatus = (status) => {
    if (!status) return '—';
    return status.replace(/_/g, ' ').replace(/^(\w)/, (c) => c.toUpperCase());
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString();
  };

  const stats = [
    { label: 'Total Forms', value: forms.length, helper: 'All student submissions' },
    { label: 'Pending Review', value: forms.filter((f) => f.status === 'pending').length, helper: 'Awaiting assignment' },
    { label: 'Assigned', value: forms.filter((f) => f.status === 'assigned').length, helper: 'Mentor allocated' },
    { label: 'Completed', value: forms.filter((f) => f.status === 'completed').length, helper: 'Journey finished' }
  ];

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <DashboardLayout title="Admin Dashboard" role="admin" onLogout={handleLogout}>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <section className="stats-grid">
        {stats.map((stat) => (
          <article key={stat.label} className="stat-card">
            <p className="stat-label">{stat.label}</p>
            <p className="stat-value">{stat.value}</p>
            <p className="stat-helper">{stat.helper}</p>
          </article>
        ))}
      </section>

      <section className="content-card">
        <header className="content-card-header">
          <div>
            <p className="eyebrow">Overview</p>
            <h2>Student Forms</h2>
          </div>
          <p className="card-subtitle">Manage submissions and assign mentors</p>
        </header>

        <div className="filters-row">
          <div className="filter-group">
            <label className="info-label">Status filter</label>
            <select
              className="select-control"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Forms</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="filter-group">
            <p className="info-label">Mentor pool</p>
            <p className="info-value">{mentors.length} available mentors</p>
          </div>
        </div>

        {filteredForms.length === 0 ? (
          <div className="content-card empty-state">
            <div className="empty-icon" aria-hidden="true">📄</div>
            <h3>No forms found</h3>
            <p>Try a different status filter to see more submissions.</p>
          </div>
        ) : (
          <div className="cards-grid forms-grid">
            {filteredForms.map((form) => {
              const formId = getFormId(form);
              const assignmentValue = assignmentDrafts[formId] || '';
              const resumeLink = form.resumeUrl ? `${API_HOST}${form.resumeUrl}` : null;

              return (
                <article key={formId} className="form-card admin-form-card">
                  <div className="card-header">
                    <div>
                      <h3>{form.studentName}</h3>
                      <p className="card-subtitle">{form.studentEmail}</p>
                    </div>
                    <span className={`status-badge status-${form.status}`}>
                      {formatStatus(form.status)}
                    </span>
                  </div>

                  <div className="info-grid">
                    <div className="info-row">
                      <p className="info-label">Domain</p>
                      <p className="info-value">{form.desiredDomain}</p>
                    </div>
                    <div className="info-row">
                      <p className="info-label">Interests</p>
                      <p className="info-value">{Array.isArray(form.interests) ? form.interests.join(', ') : form.interests}</p>
                    </div>
                    {form.mentorName && (
                      <div className="info-row">
                        <p className="info-label">Mentor</p>
                        <p className="info-value">{form.mentorName}</p>
                      </div>
                    )}
                  </div>

                  {form.status === 'pending' && (
                    <div className="assign-panel">
                      <label className="info-label">Assign mentor</label>
                      <div className="assign-controls">
                        <select
                          className="select-control"
                          value={assignmentValue}
                          onChange={(e) => handleSelectMentor(formId, e.target.value)}
                        >
                          <option value="">Select mentor</option>
                          {mentors.map((mentor) => (
                            <option key={mentor.id} value={mentor.id}>
                              {mentor.name} ({mentor.email})
                            </option>
                          ))}
                        </select>
                        <button className="btn btn-primary" onClick={() => handleAssignMentor(form)}>
                          Assign
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="action-buttons">
                    {resumeLink && (
                      <a
                        className="btn btn-ghost"
                        href={resumeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Resume
                      </a>
                    )}
                    <button className="btn btn-outline" onClick={() => toggleDetails(formId)}>
                      {expandedFormId === formId ? 'Hide Details' : 'View Details'}
                    </button>
                  </div>

                  {expandedFormId === formId && (
                    <div className="student-full-details">
                      <div className="info-grid">
                        <div className="info-row">
                          <p className="info-label">Experience</p>
                          <p className="info-value">{form.experience || '—'}</p>
                        </div>
                        <div className="info-row">
                          <p className="info-label">Goals</p>
                          <p className="info-value">{form.goals || '—'}</p>
                        </div>
                        <div className="info-row">
                          <p className="info-label">Submitted</p>
                          <p className="info-value">{formatDate(form.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
};

export default AdminDashboard;
