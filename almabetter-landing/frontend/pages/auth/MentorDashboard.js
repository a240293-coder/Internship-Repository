



import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../lib/api';
import { FiUsers, FiZap, FiAward, FiCalendar, FiCheckCircle } from 'react-icons/fi';

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
  };

  const [overview, setOverview] = useState({ total: 0, in_progress: 0, completed: 0, need_attention: 0 });
  const [sessions, setSessions] = useState([]);
  const [profile, setProfile] = useState({ name: '', email: '', expertise: [] });

  useEffect(() => {
    let mounted = true;
    const fetchStudents = async () => {
      try {
        const res = await api.get('/mentor-dashboard/students');
        const list = res && res.data ? res.data : [];
        if (!mounted) return;

        const totals = { total: 0, in_progress: 0, completed: 0, need_attention: 0 };
        if (Array.isArray(list) && list.length > 0 && list[0] && list[0].assignments) {
          totals.total = list.length;
          list.forEach(g => {
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
        // ignore
      }
    };
    fetchStudents();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchProfile = async () => {
      try {
        const id = typeof window !== 'undefined' ? localStorage.getItem('userId_mentor') : null;
        if (!id) return;
        const res = await api.get(`/mentor/dashboard/${id}`);
        const data = res && res.data ? (res.data.data || res.data) : null;
        if (!mounted || !data) return;
        const expertise = data.expertise ? (Array.isArray(data.expertise) ? data.expertise : String(data.expertise).split(',').map(s => s.trim()).filter(Boolean)) : [];
        setProfile({
          name: data.full_name || data.name || data.fullName || localStorage.getItem('userName_mentor'),
          email: data.email || localStorage.getItem('userEmail_mentor'),
          expertise
        });
      } catch (e) {
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
      } catch (err) { }
    };
    fetchSessions();
    return () => { mounted = false; };
  }, []);

  const now = new Date();
  let scheduledCount = 0;
  let sessionsCompletedCount = 0;

  const parseTiming = (t) => {
    if (!t) return null;
    try {
      const normalized = String(t).replace(' ', 'T');
      const d = new Date(normalized);
      if (!isNaN(d)) return d;
      return new Date(t);
    } catch (e) { return null; }
  };

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

  return (
    <DashboardLayout title="Mentor Dashboard" role="mentor" onLogout={handleLogout}>
      <div className="dashboard-container">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="dashboard-layout">
          {/* Left Sidebar: Profile Card */}
          <aside className="profile-card glass-panel">
            <div className="profile-info-top">
              <h2 className="mentor-name">{profile.name || 'Mentor Name'}</h2>
            </div>

            <div className="avatar-container">
              <div className="avatar-circle">
                <img src="/default-avatar.png" alt="Profile" onError={(e) => {
                  e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(profile.name || 'Mentor') + "&background=B3E5FC";
                }} />
              </div>
            </div>

            <div className="profile-info-bottom">
              <p className="mentor-email">{profile.email || 'mentor@example.com'}</p>
            </div>

            <div className="expertise-section">
              <h3 className="section-title">Expertise</h3>
              <div className="expertise-tags">
                {profile.expertise.length > 0 ? (
                  profile.expertise.map((tag, i) => (
                    <span key={i} className="tag">{tag}</span>
                  ))
                ) : (
                  <span className="no-tags">No expertise listed</span>
                )}
              </div>
            </div>
          </aside>

          {/* Right Main: Stats & Activity */}
          <main className="overview-card glass-panel">
            <h2 className="overview-title">Mentor Overview & Activity</h2>

            <div className="stats-list">
              {/* Assigned Students */}
              <div className="stat-item">
                <div className="stat-icon-box blue">
                  <FiUsers />
                </div>
                <div className="stat-details">
                  <div className="stat-row">
                    <span className="stat-label">Assigned Students</span>
                    <span className="stat-value">{overview.total}</span>
                  </div>
                  <p className="stat-helper">Total assigned to you</p>
                </div>
              </div>

              {/* In Progress */}
              <div className="stat-item">
                <div className="stat-icon-box orange">
                  <FiZap />
                </div>
                <div className="stat-details">
                  <div className="stat-row">
                    <span className="stat-label">In Progress</span>
                    <span className="stat-value">{overview.in_progress}</span>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${overview.total > 0 ? (overview.in_progress / overview.total) * 100 : 0}%`, background: '#f59e0b' }}></div>
                  </div>
                  <p className="stat-helper">Actively being mentored</p>
                </div>
              </div>

              {/* Completed */}
              <div className="stat-item">
                <div className="stat-icon-box green">
                  <FiAward />
                </div>
                <div className="stat-details">
                  <div className="stat-row">
                    <span className="stat-label">Completed</span>
                    <div className="value-with-check">
                      <span className="stat-value">{overview.completed}</span>

                    </div>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${overview.total > 0 ? (overview.completed / overview.total) * 100 : 0}%`, background: '#10b981' }}></div>
                  </div>
                  <p className="stat-helper">Finished the journey</p>
                </div>
              </div>

              {/* Scheduled Sessions */}
              <div className="stat-item">
                <div className="stat-icon-box purple">
                  <FiCalendar />
                </div>
                <div className="stat-details">
                  <div className="stat-row">
                    <span className="stat-label">Scheduled Sessions</span>
                    <span className="stat-value">{scheduledCount}</span>
                  </div>
                  {scheduledCount > 0 && (
                    <div className="upcoming-tag">
                      <FiCalendar size={12} /> {scheduledCount} upcoming session{scheduledCount > 1 ? 's' : ''}
                    </div>
                  )}
                  <p className="stat-helper">Upcoming sessions assigned</p>
                </div>
              </div>

              {/* Sessions Completed */}
              <div className="stat-item full-width">
                <div className="stat-icon-box cyan">
                  <FiCheckCircle />
                </div>
                <div className="stat-details">
                  <div className="stat-row">
                    <span className="stat-label">Sessions Completed</span>
                    <span className="stat-value">{sessionsCompletedCount}</span>
                  </div>
                  <div className="step-dots">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`dot ${i <= (sessionsCompletedCount % 5) ? 'active' : ''}`}></div>
                    ))}
                  </div>
                  <p className="stat-helper">Sessions that already occurred</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <style jsx>{`
        .dashboard-container {
          padding: 1rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .dashboard-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 2rem;
          align-items: start;
        }

        .profile-card, .overview-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          border: 1px solid #f0f0f0;
        }

        .glass-panel {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.5);
        }

        /* Profile Card Styles */
        .profile-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .avatar-container {
          margin-bottom: 1.25rem;
        }

        .avatar-circle {
          width: 80px;
          height: 80px;
          margin-top: 15px;
          border-radius: 50%;
          overflow: hidden;
          background: #f3f4f6;
          border: 4px solid #f8fafc;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        .avatar-circle img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .mentor-name {
          font-size: 1.4rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }

        .mentor-email {
          color: #1e293b;
          font-size: 1rem;
          margin: -0.5rem 0 1rem 0;
          word-break: break-all;
        }

        .expertise-section {
          width: 100%;
          text-align: left;
        }

        .section-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.75rem;
        }

        .expertise-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .tag:hover{
          background-color: white;
        }

        .tag {
          padding: 0.3rem 0.6rem;
          background: #f1f5f9;
          color: #475569;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        /* Overview Card Styles */
        .overview-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 1.5rem;
        }

        .stats-list {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          border: 1px solid #bdd7f4ff;
          border-radius: 12px;
          overflow: hidden;
        }

        .stat-item {
          display: flex;
          gap: 1.25rem;
          padding: 1.5rem;
          border-bottom: 1px solid #bdd7f4ff;
          position: relative;
          align-items: center;
        }

        .stat-item:nth-child(odd):not(.full-width) {
          border-right: 1px solid #bdd7f4ff;
        }

        .stat-item.full-width {
          grid-column: 1 / -1;
          border-bottom: none;
          width: max-content;
          margin: 0 auto;
        }

        .stat-icon-box {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .stat-icon-box.blue { background: #eff6ff; color: #2563eb; }
        .stat-icon-box.orange { background: #fff7ed; color: #f59e0b; }
        .stat-icon-box.green { background: #ecfdf5; color: #10b981; }
        .stat-icon-box.purple { background: #faf5ff; color: #8b5cf6; }
        .stat-icon-box.cyan { background: #ecfeff; color: #0891b2; }

        .stat-details {
          flex: 1;
        }

        .stat-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.95rem;
          font-weight: 600;
          color: #1e293b;
        }

        .stat-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
        }

        .value-with-check {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .check-icon {
          color: #10b981;
          font-size: 1.1rem;
        }

        .stat-helper {
          font-size: 0.8rem;
          color: #64748b;
          margin: 0.25rem 0 0 0;
        }

        .progress-bar-container {
          width: 100%;
          height: 6px;
          background: #cbd5e1;
          border-radius: 3px;
          overflow: hidden;
          margin: 0.4rem 0;
        }

        .progress-bar {
          height: 100%;
          border-radius: 3px;
          transition: width 0.5s ease-out;
        }

        .upcoming-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          color: #475569;
          margin: 0.15rem 0;
        }

        .step-dots {
          display: flex;
          gap: 0.4rem;
          margin: 0.5rem 0;
          align-items: center;
        }

        .dot {
          width: 20px;
          height: 5px;
          background: #cbd5e1;
          border-radius: 3px;
        }

        .dot.active {
          background: #0891b2;
        }

        @media (max-width: 1024px) {
          .dashboard-layout {
            grid-template-columns: 1fr;
          }
          .profile-card {
            width: 100%;
          }
          .stats-list {
            grid-template-columns: 1fr;
          }
          .stat-item:nth-child(odd):not(.full-width) {
            border-right: none;
          }
        }

        @media (max-width: 640px) {
          .profile-card, .overview-card {
            padding: 1.25rem;
          }
          .avatar-circle {
            width: 60px;
            height: 6px;
          }
        }
      `}</style>

    </DashboardLayout>
  );
};

export default MentorDashboard;
