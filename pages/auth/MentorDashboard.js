import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../../lib/api';
import './Dashboard.css';
import DashboardLayout from '../../components/DashboardLayout';

const MentorDashboard = () => {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmTargetForm, setConfirmTargetForm] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const mentorId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
      const url = mentorId ? `/mentor/students?mentorId=${mentorId}` : '/mentor/students';
      const response = await api.get(url);
      console.log('Students fetched:', response.data);
      setStudents(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err.response?.data?.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (formId, newStatus) => {
    try {
      const mentorId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
      const url = mentorId
        ? `/mentor/students/${formId}/status?mentorId=${mentorId}`
        : `/mentor/students/${formId}/status`;
      await api.put(url, { status: newStatus });
      setSuccess('Status updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleReportDoubt = async (formId) => {
    try {
      const mentorId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
      const url = mentorId ? `/mentor/students/${formId}/status?mentorId=${mentorId}` : `/mentor/students/${formId}/status`;
      await api.put(url, { status: 'doubt' });
      setSuccess('Doubt reported — student flagged for review');
      setTimeout(() => setSuccess(''), 3000);
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to report doubt');
    } finally {
      setConfirmModalOpen(false);
      setConfirmTargetForm(null);
    }
  };

  const openConfirmModal = (formId) => {
    setConfirmTargetForm(formId);
    setConfirmModalOpen(true);
  };

  const cancelConfirm = () => {
    setConfirmModalOpen(false);
    setConfirmTargetForm(null);
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

  const formatStatus = (status) => {
    if (!status) return '—';
    return status.replace(/_/g, ' ').replace(/^(\w)/, (c) => c.toUpperCase());
  };

  const stats = [
    { label: 'Students', value: students.length, helper: 'Total assigned to you' },
    { label: 'In Progress', value: students.filter((s) => s.status === 'in_progress').length, helper: 'Actively being mentored' },
    { label: 'Completed', value: students.filter((s) => s.status === 'completed').length, helper: 'Finished the journey' },
    { label: 'Need Attention', value: students.filter((s) => s.status === 'doubt').length, helper: 'Flagged for review' }
  ];

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <>
      {confirmModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Report a doubt?</h3>
            <p>We will notify the admin team to review this student profile.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={cancelConfirm}>Cancel</button>
              <button className="btn btn-primary" onClick={() => handleReportDoubt(confirmTargetForm)}>Confirm</button>
            </div>
          </div>
        </div>
      )}
      <DashboardLayout title="Mentor Dashboard" role="mentor" onLogout={handleLogout}>
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

        {students.length === 0 ? (
          <section className="content-card empty-state">
            <div className="empty-icon" aria-hidden="true">👥</div>
            <h3>No students yet</h3>
            <p>Once admins assign students to you, their progress will appear here.</p>
          </section>
        ) : (
          <section className="content-card">
            <header className="content-card-header">
              <div>
                <p className="eyebrow">Assignments</p>
                <h2>Students ({students.length})</h2>
              </div>
            </header>
            <div className="cards-grid students-grid">
              {students.map((form) => (
                <article key={form.id} className="student-card">
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
                  </div>

                  <div className="status-actions">
                    <label className="info-label">Update status</label>
                    <select
                      value={form.status}
                      onChange={(e) => handleStatusChange(form.id, e.target.value)}
                      className="select-control"
                    >
                      <option value="assigned">Assigned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="doubt">Doubt</option>
                    </select>
                  </div>

                  <div className="action-buttons">
                    <button className="btn btn-outline" onClick={() => openConfirmModal(form.id)}>
                      Report Doubt
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => setSelectedStudent(form.id === selectedStudent ? null : form.id)}
                    >
                      {selectedStudent === form.id ? 'Hide Details' : 'View Details'}
                    </button>
                  </div>

                  {selectedStudent === form.id && (
                    <div className="student-full-details">
                      <div className="info-grid">
                        <div className="info-row">
                          <p className="info-label">Experience</p>
                          <p className="info-value">{form.experience}</p>
                        </div>
                        <div className="info-row">
                          <p className="info-label">Goals</p>
                          <p className="info-value">{form.goals}</p>
                        </div>
                        <div className="info-row">
                          <p className="info-label">Submitted</p>
                          <p className="info-value">{new Date(form.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}
      </DashboardLayout>
    </>
  );
};

export default MentorDashboard;
