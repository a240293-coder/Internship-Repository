import React, { useState, useEffect } from 'react';
import api, { API_HOST } from '../../lib/api';
import DashboardLayout from '../../components/DashboardLayout';
import '../auth/Dashboard.css';
import ConfirmModal from '../../components/ConfirmModal';
import { getFormId, getStudentName, getStudentEmail, getDomain, getSubmittedDate } from '../../lib/formHelpers';
import { assignMentor } from '../../lib/assignHelper';

const MentorAssignSystem = () => {
  const [forms, setForms] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [assignmentDrafts, setAssignmentDrafts] = useState({});
  const [modal, setModal] = useState({ open: false });

  useEffect(() => {
    fetchData();
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
      const [formsRes, mentorsRes] = await Promise.all([
        api.get('/admin/forms', { headers }),
        api.get('/mentor/all', { headers }),
      ]);
      setForms(formsRes.data);
      setMentors(mentorsRes.data);
      setError('');
    } catch (err) {
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
    if (!mentorId) {
      setError('Please choose a mentor before assigning');
      return;
    }
    try {
      await assignMentor(form, mentorId);
      // Optimistically remove the assigned form row from the UI
      setForms(prev => prev.filter(f => getFormId(f) !== formId));
      setAssignmentDrafts(prev => { const copy = { ...prev }; delete copy[formId]; return copy; });
      setSuccess('Mentor assigned successfully');
      setError('');
      // Notify other admin views (history) to refresh
      try { window.dispatchEvent(new CustomEvent('assignmentUpdated', { detail: { formId, mentorId } })); } catch (e) {}
      // refresh in background
      fetchData();
    } catch (err) {
      const status = err.response?.status || err.status;
      const msg = err.response?.data?.message || err.message || 'Failed to assign mentor';
      if (status === 409) {
        setModal({ open: true, title: 'Already Assigned', message: msg, onConfirm: () => setModal({ open: false }) });
      } else {
        setError(msg);
      }
      setSuccess('');
    }
  };

  return (
    <DashboardLayout title="Mentor Assignment" role="admin">
      <main className="dashboard-main simple-dashboard" style={{paddingTop: '1.5rem', paddingBottom: '1.5rem'}}>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            {/* Mentors list removed from this view to declutter the assignment table */}
            {forms.length === 0 ? (
              <div>No student forms found. Please add students or forms.</div>
            ) : (
              <div className="simple-table-wrapper" style={{overflowX: 'auto'}}>
                <table className="forms-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Email</th>
                        <th>Domain</th>
                        <th>Interests</th>
                        <th>Goal</th>
                        <th>Resume</th>
                        <th>Submitted</th>
                        <th>Status</th>
                        <th style={{minWidth: '220px'}}>Assign</th>
                      </tr>
                    </thead>
                    <tbody>
                      {forms
                        .filter((form) => !form.mentorName)
                        .map((form) => {
                          const formId = getFormId(form);
                          const assignmentValue = assignmentDrafts[formId] || '';
                          return (
                            <tr key={formId} className="forms-table-row">
                              <td className="td-name">{getStudentName(form)}</td>
                              <td className="td-email">{getStudentEmail(form)}</td>
                              <td className="td-domain">{getDomain(form)}</td>
                              <td className="td-interests">{Array.isArray(form.interests) ? form.interests.join(', ') : form.interests || '--'}</td>
                              <td className="td-goal">{form.goals || form.goal || form.description || form.summary || '--'}</td>
                              <td className="td-resume">{(form.resume_url || form.resumeUrl || form.resume || (form.student && (form.student.resume_url || form.student.resumeUrl))) ? (
                                <button className="mentor-resume-link" style={{ color: 'var(--link-color)', fontWeight: 600, background:'none', border:'none', cursor:'pointer' }} onClick={async () => {
                                  try {
                                    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                                    const backend = API_HOST || 'http://localhost:5000';
                                    const raw = form.resume_url || form.resumeUrl || form.resume || (form.student && (form.student.resume_url || form.student.resumeUrl));
                                    const p = String(raw).startsWith('http') ? raw : `${backend}${raw}`;
                                    const res = await fetch(p, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
                                    if (!res.ok) return alert('Failed to download file');
                                    const blob = await res.blob();
                                    const u = URL.createObjectURL(blob);
                                    window.open(u, '_blank');
                                  } catch (e) { console.error(e); alert('Failed to download file'); }
                                }}>View</button>
                              ) : '--'}</td>
                              <td className="td-submitted">{getSubmittedDate(form)}</td>
                              <td className="td-status"><span className={`status-badge status-${form.status}`}>{form.status || '--'}</span></td>
                              <td className="td-assign">
                                <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                                  <select
                                    className="forms-table-select"
                                    value={assignmentValue}
                                    onChange={(e) => handleSelectMentor(formId, e.target.value)}
                                    disabled={mentors.length === 0}
                                  >
                                    <option value="">Select mentor</option>
                                    {mentors.map((mentor) => (
                                      <option key={mentor.id} value={mentor.id}>{mentor.name} ({mentor.email}) — {mentor.expertise ? String(mentor.expertise).split(',').slice(0,2).join(', ') : '—'}</option>
                                    ))}
                                  </select>
                                  <button
                                    className="assign-btn forms-table-assign-btn"
                                    onClick={() => handleAssignMentor(form)}
                                    disabled={!assignmentValue}
                                  >
                                    Confirm
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
              </div>
            )}
            {/* Assignment History moved to /admin/history - kept Mentor Assignment UI only */}
            <ConfirmModal open={modal.open} title={modal.title} message={modal.message} onConfirm={modal.onConfirm} onCancel={() => setModal({ open: false })} confirmText="OK" cancelText="" />
          </>
        )}
      </main>
    </DashboardLayout>
  );
};

export default MentorAssignSystem;
