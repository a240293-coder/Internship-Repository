



import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import layoutStyles from '../../components/DashboardLayout.module.css';
import api from '../../lib/api';

const MentorDashboard = () => {
  const [success, setSuccess] = useState('');
  const [error, setError] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    window.dispatchEvent(new Event('authChanged'));
    // Use Next.js router to navigate to home
    // router.replace('/');
  };

  const formatStatus = (status) => {
    if (!status) return '—';
    return status.replace(/_/g, ' ').replace(/^([a-zA-Z])/, (c) => c.toUpperCase());
  };

  const [overview, setOverview] = useState({ total: 0, in_progress: 0, completed: 0, need_attention: 0 });
  const [sessions, setSessions] = useState([]);
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editExpertise, setEditExpertise] = useState([]);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchStudents = async () => {
      try {
        const res = await api.get('/mentor-dashboard/students');
        const list = res && res.data ? res.data : [];
        if (!mounted) return;
        const totals = { total: list.length, in_progress: 0, completed: 0, need_attention: 0 };
        list.forEach(s => {
          const st = (s.status || '').toString().toLowerCase();
          if (st === 'in_progress' || st === 'in progress') totals.in_progress += 1;
          else if (st === 'completed') totals.completed += 1;
          else if (st === 'need_attention' || st === 'need attention' || st === 'rejected') totals.need_attention += 1;
        });
        setOverview(totals);
      } catch (err) {
        // ignore — keep zeros
      }
    };
    fetchStudents();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchSessions = async () => {
      try {
        const res = await api.get('/mentor/sessions');
        const list = res && res.data ? res.data : [];
        if (!mounted) return;
        setSessions(list);
      } catch (err) {
        // ignore failures — sessions remain empty
      }
    };
    fetchSessions();
    return () => { mounted = false; };
  }, []);

  // Fetch mentor profile (to show selected expertise)
  useEffect(() => {
    let mounted = true;
    const fetchProfile = async () => {
      try {
        const userId = typeof window !== 'undefined' ? window.localStorage.getItem('userId') : null;
        if (!userId) return;
        const res = await api.get(`/mentor/dashboard/${userId}`);
        const p = res && res.data ? res.data : null;
        if (!mounted) return;
        setProfile(p);
      } catch (err) {
        // ignore — profile not critical
      }
    };
    fetchProfile();
    return () => { mounted = false; };
  }, []);

  // compute session counts: scheduled (future) and completed (past)
  const parseTiming = (t) => {
    if (!t) return null;
    try {
      // support formats like 'YYYY-MM-DD HH:MM:SS' by converting space to 'T'
      const normalized = String(t).replace(' ', 'T');
      const d = new Date(normalized);
      if (!isNaN(d)) return d;
      return new Date(t);
    } catch (e) {
      return null;
    }
  };

  const now = new Date();
  const scheduledCount = sessions.filter(s => {
    const dt = parseTiming(s.timing || s.timingDate || s.timing_time);
    return dt && dt > now;
  }).length;
  const sessionsCompletedCount = sessions.filter(s => {
    const dt = parseTiming(s.timing || s.timingDate || s.timing_time);
    return dt && dt <= now;
  }).length;

  const stats = [
    { label: 'Assigned Students', value: overview.total, helper: 'Total assigned to you' },
    { label: 'In Progress', value: overview.in_progress, helper: 'Actively being mentored' },
    { label: 'Completed', value: overview.completed, helper: 'Finished the journey' },
    { label: 'Scheduled Sessions', value: scheduledCount, helper: 'Upcoming sessions assigned' },
    { label: 'Sessions Completed', value: sessionsCompletedCount, helper: 'Sessions that already occurred' }
  ];

  return (
    <>
      {/* modal removed — students managed on dedicated Students page */}
      <DashboardLayout title="Mentor Dashboard" role="mentor" onLogout={handleLogout}>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div>
          {profile && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <h3 style={{ margin: '0 0 8px 0' }}>Your expertise</h3>
                {!editing ? (
                  <button className="btn" onClick={() => { setEditExpertise((profile.expertise||'').toString().split(',').map(s=>s.trim()).filter(Boolean)); setEditing(true); }}>
                    Edit
                  </button>
                ) : (
                  <div>
                    <button className="btn btn-ghost" onClick={() => { setEditing(false); setEditExpertise([]); }} style={{ marginRight: 8 }}>Cancel</button>
                    <button className="btn btn-primary" onClick={async () => {
                      try {
                        setSavingProfile(true);
                        const userId = typeof window !== 'undefined' ? window.localStorage.getItem('userId') : null;
                        if (!userId) throw new Error('Not authenticated');
                        const res = await api.put(`/mentor/dashboard/${userId}`, { expertise: editExpertise });
                        setProfile(res.data);
                        setEditing(false);
                        setSuccess('Profile updated');
                        setTimeout(() => setSuccess(''), 3000);
                      } catch (err) {
                        setError(err.response?.data?.message || err.message || 'Failed to save');
                      } finally {
                        setSavingProfile(false);
                      }
                    }}>{savingProfile ? 'Saving...' : 'Save'}</button>
                  </div>
                )}
              </div>

              {!editing ? (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(profile.expertise || '').toString().split(',').filter(Boolean).map((e, idx) => (
                    <span key={idx} style={{ background:'#eef6ff', color:'#0b5eea', padding: '6px 10px', borderRadius: 999, fontWeight:600, fontSize:13 }}>{e.trim()}</span>
                  ))}
                </div>
              ) : (
                <div>
                  <select
                    multiple
                    className="multi-select"
                    value={editExpertise}
                    onChange={(e) => {
                      const opts = Array.from(e.target.options).filter(o=>o.selected).map(o=>o.value);
                      setEditExpertise(opts);
                    }}
                    style={{ minHeight: 120, width: '100%' }}
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="Mobile Development">Mobile Development</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Machine Learning">Machine Learning</option>
                    <option value="Cloud Computing">Cloud Computing</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Blockchain">Blockchain</option>
                    <option value="Other">Other</option>
                  </select>
                  <small style={{ display: 'block', marginTop: 6 }}>Hold Ctrl (Windows) / Cmd (Mac) to select multiple domains.</small>
                </div>
              )}
            </div>
          )}
          <section className="student-stats-grid">
            {stats.map((stat) => (
              <article key={stat.label} className="student-stat-card">
                <div className="student-stat-label">{stat.label}</div>
                <div className="student-stat-value">{stat.value}</div>
                <div className="student-stat-helper">{stat.helper}</div>
              </article>
            ))}
          </section>
        </div>

        
      </DashboardLayout>
    </>
  );
};


export default MentorDashboard;


