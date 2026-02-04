import React, { useEffect, useState } from 'react';
import {
  FiClock,
  FiFileText,
  FiLink,
  FiLayers,
  FiChevronDown,
  FiSearch,
  FiMoreHorizontal
} from 'react-icons/fi';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../lib/api';
import styles from './sessions.module.css';

export default function MentorSessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    try {
      const res = await api.get('/mentor/sessions');
      setSessions(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load sessions');
    }
  };

  useEffect(() => { load(); }, []);

  const formatTiming = (t) => {
    if (!t) return '—';
    try {
      const raw = String(t);
      const normalized = raw.replace(' ', 'T');
      const d = new Date(normalized);
      if (!isNaN(d.getTime())) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const hh = String(d.getHours()).padStart(2, '0');
        const mins = String(d.getMinutes()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd} ${hh}:${mins}`;
      }
      return raw.replace(/\.\d+Z?$/, '').replace(/Z$/, '');
    } catch (e) {
      return String(t).replace(/Z$/, '');
    }
  };

  const handleStatusChange = async (s, i, newStatus) => {
    if (!newStatus) return;
    if (!confirm(`Set session to '${newStatus}'?`)) return;

    try {
      setLoading(true);
      await api.post(`/mentor/sessions/${s.id}/status`, { status: newStatus });
      setSessions((prev) => {
        const copy = [...prev];
        if (copy[i]) copy[i] = { ...copy[i], status: newStatus };
        return copy;
      });
      try { window.dispatchEvent(new Event('mentor-sessions-updated')); } catch (e) { /* ignore */ }
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };
  const filteredSessions = sessions.filter(s =>
    (s.student_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.agenda || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="Scheduled Sessions" role="mentor">
      <div className={styles.container}>
        <div className={styles.searchHeader}>
          <div className={styles.searchWrapper}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by student..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}

        {filteredSessions.length === 0 && !loading ? (
          <div className={styles.emptyState}>
            <FiClock size={48} opacity={0.3} />
            <p>{searchTerm ? 'No results found.' : 'No scheduled sessions found.'}</p>
          </div>
        ) : (
          <div className={styles.sessionsGrid}>
            {filteredSessions.map((s, i) => (
              <div key={s.id || i} className={styles.sessionCard}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.agendaText}>{s.agenda || 'Regular Session'}</h3>
                  <span className={styles.studentLabel}>Student: {s.student_name || 'Guest'}</span>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.infoRow}>
                    <FiClock className={styles.infoIcon} />
                    <div className={styles.infoContent}>
                      <span className={styles.infoLabel}>Timing</span>
                      <span className={styles.infoValue}>{formatTiming(s.timing || s.timingDate || s.timing_time)}</span>
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
                      <span className={styles.infoLabel}>Link</span>
                      <span className={styles.infoValue}>
                        {s.meeting_link ? (
                          <a href={s.meeting_link} target="_blank" rel="noreferrer" className={styles.meetingLink}>
                            Open Link
                          </a>
                        ) : 'No link'}
                      </span>
                    </div>
                  </div>

                  <div className={styles.infoRow}>
                    <FiLayers className={styles.infoIcon} />
                    <div className={styles.infoContent}>
                      <span className={styles.infoLabel}>Status</span>
                      <span className={`${styles.statusBadge} ${styles['status-' + (s.status || 'scheduled')]}`}>
                        {(s.status || 'scheduled').replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.actionArea}>
                  <select
                    className={styles.actionSelect}
                    onChange={(e) => handleStatusChange(s, i, e.target.value)}
                    disabled={loading}
                    value=""
                  >
                    <option value="" disabled>Change Status</option>
                    <option value="completed">Completed</option>
                    <option value="canceled">Canceled</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .meetingLink {
          color: #2563eb;
          font-weight: 600;
          text-decoration: none;
        }
        .meetingLink:hover {
          text-decoration: underline;
        }
        .errorAlert {
          padding: 1rem;
          background: #fef2f2;
          color: #b91c1c;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          border: 1px solid #fee2e2;
        }
        .emptyState {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem;
          color: #94a3b8;
          text-align: center;
          gap: 1rem;
        }
      `}</style>
    </DashboardLayout>
  );
}

