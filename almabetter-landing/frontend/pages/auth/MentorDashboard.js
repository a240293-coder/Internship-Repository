



import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import ProfileHeader from '../../components/shared/ProfileHeader';
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
  const [profile, setProfile] = useState({});

  useEffect(() => {
    let mounted = true;
    const fetchStudents = async () => {
      try {
            const res = await api.get('/mentor-dashboard/students');
            const list = res && res.data ? res.data : [];
            if (!mounted) return;
            // Backend may return grouped entries (one per unique email) with `assignments` array.
            const totals = { total: 0, in_progress: 0, completed: 0, need_attention: 0 };
            if (Array.isArray(list) && list.length > 0 && list[0] && list[0].assignments) {
              totals.total = list.length;
              list.forEach(g => {
                // determine aggregated status for this grouped student
                const statuses = (g.assignments || []).map(a => (a.status || '').toString().toLowerCase());
                if (statuses.includes('in_progress') || statuses.includes('in progress')) totals.in_progress += 1;
                else if (statuses.includes('completed')) totals.completed += 1;
                else if (statuses.includes('need_attention') || statuses.includes('need attention') || statuses.includes('rejected')) totals.need_attention += 1;
              });
            } else {
              totals.total = list.length;
              list.forEach(s => {
                const st = (s.status || '').toString().toLowerCase();
                if (st === 'in_progress' || st === 'in progress') totals.in_progress += 1;
                else if (st === 'completed') totals.completed += 1;
                else if (st === 'need_attention' || st === 'need attention' || st === 'rejected') totals.need_attention += 1;
              });
            }
            setOverview(totals);
      } catch (err) {
        // ignore — keep zeros
      }
    };
    fetchStudents();
    return () => { mounted = false; };
  }, []);

  // fetch mentor profile (name, expertise)
  useEffect(() => {
    let mounted = true;
    const fetchProfile = async () => {
      try {
        const id = typeof window !== 'undefined' ? localStorage.getItem('userId_mentor') : null;
        if (!id) return;
        const res = await api.get(`/mentor/dashboard/${id}`);
        const data = res && res.data ? (res.data.data || res.data) : null;
        if (!mounted || !data) return;
        // normalize expertise to array
        const expertise = data.expertise ? (Array.isArray(data.expertise) ? data.expertise : String(data.expertise).split(',').map(s=>s.trim()).filter(Boolean)) : [];
        setProfile({ name: data.full_name || data.name || data.fullName || localStorage.getItem('userName_mentor'), email: data.email || localStorage.getItem('userEmail_mentor'), expertise });
      } catch (e) {
        // fallback to localStorage
        const name = typeof window !== 'undefined' ? (localStorage.getItem('userName_mentor') || localStorage.getItem('userName')) : 'Mentor';
        const email = typeof window !== 'undefined' ? (localStorage.getItem('userEmail_mentor') || '') : '';
        setProfile({ name, email, expertise: [] });
      }
    };
    fetchProfile();
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

  // listen for session updates (dispatched from sessions page) and refresh
  useEffect(() => {
    const handler = async () => {
      try {
        const res = await api.get('/mentor/sessions');
        setSessions(res && res.data ? res.data : []);
      } catch (e) {
        // ignore
      }
    };
    window.addEventListener('mentor-sessions-updated', handler);
    return () => window.removeEventListener('mentor-sessions-updated', handler);
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
  let scheduledCount = 0;
  let sessionsCompletedCount = 0;
  // if the backend provides explicit status on sessions, prefer status-based counts
  if (sessions.some(s => s.status !== undefined && s.status !== null)) {
    const lower = (v) => (v || '').toString().toLowerCase();
    scheduledCount = sessions.filter(s => {
      const st = lower(s.status);
      return st !== 'completed' && st !== 'canceled';
    }).length;
    sessionsCompletedCount = sessions.filter(s => lower(s.status) === 'completed').length;
  } else {
    scheduledCount = sessions.filter(s => {
      const dt = parseTiming(s.timing || s.timingDate || s.timing_time);
      return dt && dt > now;
    }).length;
    sessionsCompletedCount = sessions.filter(s => {
      const dt = parseTiming(s.timing || s.timingDate || s.timing_time);
      return dt && dt <= now;
    }).length;
  }

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
          <ProfileHeader name={profile.name} sub={profile.email} expertise={profile.expertise} />
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


