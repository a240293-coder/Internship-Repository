
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../../lib/api';
import { API_HOST } from '../../lib/api';
import './Dashboard.css';
import DashboardLayout from '../../components/DashboardLayout';
import ConfirmModal from '../../components/ConfirmModal';
import { getFormId } from '../../lib/formHelpers';
import { assignMentor } from '../../lib/assignHelper';

// Utility for CSV export
function downloadCSV(filename, csv) {
  const blob = new Blob([csv], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Utility to format ISO date string to YYYY-MM-DD
function formatDateOnly(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d)) return dateString;
  return d.toISOString().slice(0, 10);
}

const AdminDashboard = () => {
  // Tab state must be declared first
  const [activeTab, setActiveTab] = useState('forms');
  // History state (must be inside component)
  const [completedSessions, setCompletedSessions] = useState([]);
  const [mentorAssignments, setMentorAssignments] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [historyTab, setHistoryTab] = useState('completed');
  const [historySearch, setHistorySearch] = useState('');
  const [historyLoading, setHistoryLoading] = useState(false);

  // Fetch history data
  const fetchHistory = async (tab = 'completed', search = '') => {
    setHistoryLoading(true);
    try {
      if (tab === 'completed') {
        const res = await api.get(`/api/admin/history/completed-sessions?search=${encodeURIComponent(search)}`);
        setCompletedSessions(res.data.data || []);
      } else if (tab === 'assignments') {
        const res = await api.get(`/api/admin/history/mentor-assignments?search=${encodeURIComponent(search)}`);
        setMentorAssignments(res.data.data || []);
      } else if (tab === 'audit') {
        const res = await api.get(`/api/admin/history/audit-logs?search=${encodeURIComponent(search)}`);
        setAuditLogs(res.data.data || []);
      }
    } catch (err) {
      setError('Failed to fetch history');
    } finally {
      setHistoryLoading(false);
    }
  };

  // Fetch history on tab/search change
  useEffect(() => {
    if (activeTab === 'history') fetchHistory(historyTab, historySearch);
  }, [activeTab, historyTab, historySearch]);

  // Export CSV for current history tab
  const handleExportCSV = async () => {
    let url = '';
    if (historyTab === 'completed') url = '/api/admin/history/completed-sessions?exportType=csv&search=' + encodeURIComponent(historySearch);
    if (historyTab === 'assignments') url = '/api/admin/history/mentor-assignments?exportType=csv&search=' + encodeURIComponent(historySearch);
    if (historyTab === 'audit') url = '/api/admin/history/audit-logs?exportType=csv&search=' + encodeURIComponent(historySearch);
    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      const csv = await res.text();
      downloadCSV(`${historyTab}.csv`, csv);
    } catch (err) {
      setError('Export failed');
    }
  };
  const router = useRouter();
  const [forms, setForms] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [liveSessions, setLiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [assignmentDrafts, setAssignmentDrafts] = useState({});
  const [expandedFormId, setExpandedFormId] = useState(null);
  const [modal, setModal] = useState({ open: false });
  // (activeTab already declared at the top of the component)


  // Minimal auth guard: check token and role before fetching data
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');

    if (!token || role !== 'admin') {
      setError('Authentication error. Please log in again.');
      return;
    }

    fetchData();
    // Listen for status updates made by mentors and refresh admin data
    const onStatusUpdated = () => fetchData();
    window.addEventListener('statusUpdated', onStatusUpdated);
    return () => window.removeEventListener('statusUpdated', onStatusUpdated);
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found. Please log in again.');
        setLoading(false);
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };
      const [formsRes, mentorsRes, sessionsRes] = await Promise.all([
        api.get('/admin/forms', { headers }),
        api.get('/mentor/all', { headers }),
        api.get('/admin/live-sessions', { headers })
      ]);
      console.log('Forms fetched:', formsRes.data);
      console.log('Mentors fetched:', mentorsRes.data);
      console.log('Sessions fetched:', sessionsRes.data);
      setForms(formsRes.data);
      setMentors(mentorsRes.data);
      setLiveSessions(sessionsRes.data);
      setError('');
    } catch (err) {
      if (err?.isAuthError) {
        localStorage.clear();
        setError('Authentication error. Please log in again.');
        return;
      }
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  

  const handleSelectMentor = (formId, mentorId) => {
    setAssignmentDrafts((prev) => ({ ...prev, [formId]: mentorId }));
    setError('');
  };

  const handleAssignMentor = async (form) => {
    const formId = getFormId(form);
    const mentorId = assignmentDrafts[formId];

    if (!formId) {
      setError('Form ID is missing or invalid. Cannot assign mentor.');
      return;
    }
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
      await assignMentor(form, mentor);
      setError('');
      setSuccess('Mentor assigned successfully');
      setTimeout(() => setSuccess(''), 3000);
      setAssignmentDrafts((prev) => ({ ...prev, [formId]: '' }));
      setExpandedFormId(formId);
      fetchData();
    } catch (err) {
      console.error('Error assigning mentor:', err);
      const status = err.response?.status || err.status;
      const msg = err.response?.data?.message || err.message || 'Failed to assign mentor';
      if (status === 409) {
        setModal({ open: true, title: 'Already Assigned', message: msg, onConfirm: () => setModal({ open: false }) });
      } else {
        setError(msg);
      }
    }
  };

  const handleUpdateSessionStatus = async (sessionId, newStatus) => {
    try {
      await api.put(`/api/admin/live-sessions/${sessionId}/status`, { status: newStatus.toUpperCase() });

      // Optimistic UI update: remove session card instantly if completed
      if (newStatus.toUpperCase() === 'COMPLETED') {
        setLiveSessions(prev => prev.filter(s => s.id !== sessionId));
        setSuccess('Session marked as completed');
      } else {
        // For other status changes, refetch to update UI
        fetchData();
        setSuccess('Session status updated');
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating session:', err);
      setError('Failed to update session status');
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
    { label: 'Live Sessions', value: liveSessions.length, helper: 'Booked slots' },
    { label: 'Pending Sessions', value: liveSessions.filter((s) => s.status === 'pending').length, helper: 'Need confirmation' }
  ];





  if (loading) return <div className="loading">Loading...</div>;
  if (error) {
    return (
      <div className="dashboard-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => { setError(''); setLoading(true); fetchData(); }}>Retry</button>
      </div>
    );
  }

  return (
    <DashboardLayout title="Admin Dashboard" role="admin" onLogout={handleLogout}>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <ConfirmModal open={modal.open} title={modal.title} message={modal.message} onConfirm={modal.onConfirm} onCancel={() => setModal({ open: false })} confirmText="OK" cancelText="" />

      {/* Stats Section - Responsive Card Grid */}
      <section className="stats-grid" aria-label="Admin quick stats">
        {stats.map((stat) => (
          <article key={stat.label} className="stat-card" tabIndex={0} aria-label={stat.label}>
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-helper">{stat.helper}</div>
          </article>
        ))}
      </section>

      {/* Dashboard Tabs - Modern, Mobile-First */}
      <nav className="tabs-nav" aria-label="Admin dashboard tabs" style={{ marginBottom: '20px', borderBottom: '1px solid #eee' }}>
        <button className={`btn ${activeTab === 'forms' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('forms')} style={{ marginRight: '10px' }}>Student Forms</button>
        <button className={`btn ${activeTab === 'sessions' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('sessions')} style={{ marginRight: '10px' }}>Live Sessions</button>
        <button className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('history')}>Admin History</button>
      </nav>

      {/* History Tab */}
      {activeTab === 'history' && (
        <section className="content-card">
          <header className="content-card-header">
            <div>
              <span className="eyebrow">Admin History</span>
              <h2>History & Audit Trail</h2>
            </div>
            <span className="card-subtitle">Completed sessions, mentor assignments, and audit logs</span>
          </header>
          <nav className="tabs-nav" aria-label="History tabs" style={{ marginBottom: '10px' }}>
            <button className={`btn ${historyTab === 'completed' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setHistoryTab('completed')} style={{ marginRight: '10px' }}>Completed Sessions</button>
            <button className={`btn ${historyTab === 'assignments' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setHistoryTab('assignments')} style={{ marginRight: '10px' }}>Mentor Assignments</button>
            <button className={`btn ${historyTab === 'audit' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setHistoryTab('audit')}>Audit Trail</button>
          </nav>
          <div className="filters-row">
            <input className="input-control" placeholder="Search..." value={historySearch} onChange={e => setHistorySearch(e.target.value)} style={{ marginRight: '10px' }} />
            <button className="btn btn-outline" onClick={handleExportCSV}>Export CSV</button>
          </div>
          {historyLoading ? <div className="loading">Loading...</div> : null}
          {historyTab === 'completed' && (
            <div className="cards-grid forms-grid">
              {completedSessions.length === 0 ? <div className="empty-state">No completed sessions found.</div> : completedSessions.map(session => (
                <article key={session.id} className="form-card admin-form-card">
                  <div className="card-header">
                    <div>
                      <h3>{session.student_id}</h3>
                      <span className="card-subtitle">Mentor: {session.mentor_id}</span>
                    </div>
                    <span className={`status-badge status-${session.status}`}>{formatStatus(session.status)}</span>
                  </div>
                  <div className="info-grid">
                    <div className="info-row"><span className="info-label">Topic</span><span className="info-value">{session.topic}</span></div>
                    <div className="info-row"><span className="info-label">Scheduled</span><span className="info-value">{formatDate(session.scheduled_at)}</span></div>
                    <div className="info-row"><span className="info-label">Completed</span><span className="info-value">{formatDate(session.completed_at)}</span></div>
                  </div>
                </article>
              ))}
            </div>
          )}
          {historyTab === 'assignments' && (
            <div className="cards-grid forms-grid">
              {mentorAssignments.length === 0 ? <div className="empty-state">No mentor assignments found.</div> : mentorAssignments.map(a => (
                <article key={a.id} className="form-card admin-form-card">
                  <div className="card-header">
                    <div>
                      <h3>Mentor: {a.mentor_id}</h3>
                      <span className="card-subtitle">Student: {a.student_id}</span>
                    </div>
                    <span className="status-badge">Assigned</span>
                  </div>
                  <div className="info-grid">
                    <div className="info-row"><span className="info-label">Assigned By</span><span className="info-value">{a.assigned_by_admin}</span></div>
                    <div className="info-row"><span className="info-label">Assigned At</span><span className="info-value">{formatDate(a.assigned_at)}</span></div>
                  </div>
                </article>
              ))}
            </div>
          )}
          {historyTab === 'audit' && (
            <div className="cards-grid forms-grid">
              {auditLogs.length === 0 ? <div className="empty-state">No audit logs found.</div> : auditLogs.map(log => (
                <article key={log.id} className="form-card admin-form-card">
                  <div className="card-header">
                    <div>
                      <h3>Admin: {log.admin_id}</h3>
                      <span className="card-subtitle">{log.action_type}</span>
                    </div>
                  </div>
                  <div className="info-grid">
                    <div className="info-row"><span className="info-label">Description</span><span className="info-value">{log.description}</span></div>
                    <div className="info-row"><span className="info-label">Timestamp</span><span className="info-value">{formatDate(log.created_at)}</span></div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Forms Tab */}
      {activeTab === 'forms' && (
        <section className="content-card">
          <header className="content-card-header">
            <div>
              <span className="eyebrow">Overview</span>
              <h2>Student Forms</h2>
            </div>
            <span className="card-subtitle">Manage submissions and assign mentors</span>
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
                // Format date and time
                const submittedDate = form.createdAt ? new Date(form.createdAt) : null;
                const dateStr = submittedDate ? submittedDate.toLocaleDateString() : '--';
                const timeStr = submittedDate ? submittedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--';

                return (
                  <article key={formId} className="form-card admin-form-card compact-form-card">
                    <div className="card-header">
                      <div>
                        <h3>{form.studentName || '—'}</h3>
                        <p className="card-subtitle">{form.studentEmail || '—'}</p>
                        <p className="card-meta"><b>ID:</b> {form.studentId || form.student_id || '—'}</p>
                      </div>
                      <span className={`status-badge status-${form.status}`}>
                        {formatStatus(form.status)}
                      </span>
                    </div>

                    <div className="info-grid">
                      <div className="info-row">
                        <p className="info-label">Domain</p>
                        <p className="info-value">{form.desiredDomain || form.desired_domain || '—'}</p>
                      </div>
                      <div className="info-row">
                        <p className="info-label">Interests</p>
                        <p className="info-value">{Array.isArray(form.interests) ? form.interests.join(', ') : form.interests || '—'}</p>
                      </div>
                      <div className="info-row">
                        <p className="info-label">Submitted</p>
                        <p className="info-value">{dateStr} {timeStr}</p>
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
                            <p className="info-label">Goals</p>
                            <p className="info-value">{form.goals || '—'}</p>
                          </div>
                          <div className="info-row">
                            <p className="info-label">Submitted</p>
                            <p className="info-value">{dateStr} {timeStr}</p>
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
      )}

      {activeTab === 'sessions' && (
        <section className="content-card">
          <header className="content-card-header">
            <div>
              <p className="eyebrow">Requests</p>
              <h2>Live Sessions</h2>
            </div>
            <p className="card-subtitle">Manage booking requests</p>
          </header>

          {liveSessions.filter(s => !['COMPLETED'].includes(s.status?.toUpperCase())).length === 0 ? (
            <div className="content-card empty-state">
              <div className="empty-icon" aria-hidden="true">📅</div>
              <h3>No active sessions</h3>
              <p>Wait for students to book live sessions.</p>
            </div>
          ) : (
            <div className="cards-grid forms-grid">
              {liveSessions.filter(s => !['COMPLETED'].includes(s.status?.toUpperCase())).map((session) => (
                <article key={session.id} className="form-card admin-form-card">
                  <div className="card-header">
                    <div>
                      <h3>{session.studentName}</h3>
                      <p className="card-subtitle">{session.studentEmail}</p>
                    </div>
                    <span className={`status-badge status-${session.status}`}>
                      {formatStatus(session.status)}
                    </span>
                  </div>

                  <div className="info-grid">
                    <div className="info-row">
                      <p className="info-label">Phone</p>
                      <p className="info-value">{session.phone || '—'}</p>
                    </div>
                    <div className="info-row">
                      <p className="info-label">Preferred Date</p>
                      <p className="info-value">{formatDateOnly(session.preferredDate || session.preferred_date) || '—'}</p>
                    </div>
                    <div className="info-row">
                      <p className="info-label">Preferred Time</p>
                      <p className="info-value">{session.preferredTime || session.preferred_time || '—'}</p>
                    </div>
                  </div>

                  <div className="action-buttons" style={{ marginTop: '15px' }}>
                    <a 
                      href={`mailto:${session.email}?subject=Live Session Confirmation&body=Hi ${session.name},%0D%0A%0D%0AWe received your request for a live session on ${formatDate(session.preferred_date)} at ${session.preferred_time}.%0D%0A%0D%0AWe are happy to confirm this slot.`}
                      className="btn btn-primary"
                    >
                      Connect (Email)
                    </a>
                    {session.status?.toUpperCase() === 'PENDING' && (
                      <button 
                        className="btn btn-outline"
                        onClick={() => handleUpdateSessionStatus(session.id, 'CONFIRMED')}
                      >
                        Mark Confirmed
                      </button>
                    )}
                    {session.status?.toUpperCase() === 'CONFIRMED' && (
                      <button 
                        className="btn btn-outline"
                        onClick={() => handleUpdateSessionStatus(session.id, 'COMPLETED')}
                      >
                        Mark Completed
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;
