import React, { useEffect, useState } from 'react';
import {
  FiClock,
  FiFileText,
  FiLink,
  FiUser,
  FiSearch,
  FiCalendar
} from 'react-icons/fi';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../lib/api';
import styles from './sessions.module.css';

export default function StudentSessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/student/sessions');
        const data = Array.isArray(res?.data) ? res.data : (res?.data ? [res.data] : []);
        setSessions(data);
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Failed to load sessions');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const formatTiming = (t) => {
    if (!t) return '—';
    try {
      const d = new Date(t);
      if (isNaN(d.getTime())) return String(t);

      const dateOptions = { day: '2-digit', month: 'short', year: 'numeric' };
      const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };

      return `${d.toLocaleDateString('en-GB', dateOptions)} • ${d.toLocaleTimeString('en-US', timeOptions)}`;
    } catch (e) {
      return String(t);
    }
  };

  const filteredSessions = sessions.filter(s =>
    (s.mentor_name || s.mentorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.agenda || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="Upcoming Sessions" role="student">
      <div className={styles.container}>

        <div className={styles.searchHeader}>
          <div className={styles.searchWrapper}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by mentor or agenda..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className={styles.loadingWrapper}>
            <p>Loading sessions...</p>
          </div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : filteredSessions.length === 0 ? (
          <div className={styles.emptyState}>
            <FiCalendar size={64} opacity={0.3} />
            <p>{searchTerm ? 'No matching sessions found.' : 'You have no upcoming sessions scheduled.'}</p>
          </div>
        ) : (
          <div className={styles.sessionsGrid}>
            {filteredSessions.map((s, idx) => (
              <div key={s.id || idx} className={styles.sessionCard}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.agendaText}>{s.agenda || 'Regular Session'}</h3>
                  <span className={styles.mentorLabel}>
                    <FiUser size={12} style={{ marginRight: 6 }} />
                    Mentor: {s.mentor_name || s.mentorName || '—'}
                  </span>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.infoRow}>
                    <FiClock className={styles.infoIcon} />
                    <div className={styles.infoContent}>
                      <span className={styles.infoLabel}>Date & Time</span>
                      <span className={styles.infoValue}>{formatTiming(s.timing)}</span>
                    </div>
                  </div>

                  <div className={styles.infoRow}>
                    <FiFileText className={styles.infoIcon} />
                    <div className={styles.infoContent}>
                      <span className={styles.infoLabel}>Description</span>
                      <span className={styles.infoValue}>{s.description || '—'}</span>
                    </div>
                  </div>

                  <div className={styles.infoRow}>
                    <FiLink className={styles.infoIcon} />
                    <div className={styles.infoContent}>
                      <span className={styles.infoLabel}>Meeting Link</span>
                      <span className={styles.infoValue}>
                        {s.meeting_link || s.meetingLink ? (
                          <a
                            href={s.meeting_link || s.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className={styles.meetingLink}
                          >
                            Join Session <FiLink size={12} style={{ marginLeft: 4 }} />
                          </a>
                        ) : 'Not provided'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <span className={styles.statusLabel}>Current Status:</span>
                  <span className={`${styles.statusBadge} ${styles['status-' + (s.status || 'scheduled')]}`}>
                    {(s.status || 'scheduled').replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
