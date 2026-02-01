import React, { useEffect, useState, useMemo } from 'react';
import api from '../lib/api';
import styles from './MentorActivityDetails.module.css';

function formatMonth(date) {
  const d = new Date(date);
  if (isNaN(d)) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getLastNMonths(n = 6) {
  const months = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return months;
}

export default function MentorActivityDetails({ mentorId }) {
  const [mentor, setMentor] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        const mentorRes = await api.get(`/admin/mentors/${mentorId}`);
        const mentorData = mentorRes.data && mentorRes.data.data ? mentorRes.data.data : mentorRes.data;
        if (!mounted) return;
        setMentor(mentorData);
        const sessionsRes = await api.get(`/admin/mentors/${mentorId}/sessions`);
        const sessionsData = Array.isArray(sessionsRes.data) ? sessionsRes.data : (sessionsRes.data && sessionsRes.data.data) ? sessionsRes.data.data : [];
        if (!mounted) return;
        setSessions(sessionsData || []);
        const studentsRes = await api.get(`/admin/mentors/${mentorId}/students`);
        const studentsData = Array.isArray(studentsRes.data) ? studentsRes.data : (studentsRes.data && studentsRes.data.data) ? studentsRes.data.data : [];
        if (!mounted) return;
        setStudents(studentsData || []);
      } catch (e) {
        console.error('Failed fetching mentor activity', e);
        setError('Failed to load mentor activity.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (mentorId) fetchData();
    return () => { mounted = false; };
  }, [mentorId]);

  const months = useMemo(() => getLastNMonths(6), []);

  const sessionsByMonth = useMemo(() => {
    const map = {};
    months.forEach(m => { map[m] = 0; });
    sessions.forEach(s => {
      const key = formatMonth(s.timing || s.created_at || s.createdAt || s.date || Date.now());
      if (!key) return;
      if (!(key in map)) map[key] = 0;
      map[key]++;
    });
    return months.map(m => ({ month: m, count: map[m] || 0 }));
  }, [sessions, months]);

  const sessionsPerStudent = useMemo(() => {
    const map = {};
    sessions.forEach(s => {
      const sid = s.student_id || s.studentId || s.studentId || s.student_id || s.studentId || 'unknown';
      map[sid] = (map[sid] || 0) + 1;
    });
    return map;
  }, [sessions]);

  const studentsWithSessions = useMemo(() => {
    const set = new Set(Object.keys(sessionsPerStudent));
    return students.map(st => ({ ...st, sessions: sessionsPerStudent[st.id] || sessionsPerStudent[st.studentId] || 0, hasSession: set.has(String(st.id)) || set.has(String(st.studentId)) }));
  }, [students, sessionsPerStudent]);

  if (loading) return <div>Loading mentor activity...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!mentor) return <div>No mentor found.</div>;

  // Simple chart dimensions
  const chartWidth = 520;
  const chartHeight = 140;
  const maxCount = Math.max(...sessionsByMonth.map(d => d.count), 1);

  return (
    <div className={styles.container}>
      <div className={styles.headerCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className={styles.headerTitle}>{mentor.name || mentor.full_name || mentor.email}</h2>
            <div className={styles.headerEmail}>{mentor.email}</div>
            {mentor.expertise && (
              <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {(Array.isArray(mentor.expertise) ? mentor.expertise : String(mentor.expertise || '').split(',')).filter(Boolean).map((e, i) => (
                  <span key={i} style={{ display: 'inline-block', background: '#eef2ff', color: '#07204a', padding: '6px 10px', borderRadius: 14, marginRight: 6, fontSize: 13 }}>{e.trim()}</span>
                ))}
              </div>
            )}
          </div>
          <div style={{ textAlign: 'right', color: '#777' }}>
            <div style={{ fontSize: 12 }}>Joined</div>
            <div>{mentor.created_at ? new Date(mentor.created_at).toLocaleDateString() : ''}</div>
          </div>
        </div>
      </div>

      <div className={styles.cardsGrid}>
        <div className={styles.card}>
          <div style={{ color: '#888', fontSize: 13 }}>Total Sessions</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}><span className={styles.number}>{sessions.length}</span></div>
          <div style={{ color: '#999', fontSize: 12 }}>{sessions.length > 0 ? <><span className={styles.number}>{Math.max(...sessions.map(s=> (s.duration||0)))}</span> min longest</> : ''}</div>
        </div>
        <div className={styles.card}>
          <div style={{ color: '#888', fontSize: 13 }}>Students Mentored</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}><span className={styles.number}>{students.length}</span></div>
          <div style={{ color: '#999', fontSize: 12 }}><span className={styles.number}>{studentsWithSessions.filter(s=>s.hasSession).length}</span> active with sessions</div>
        </div>
        <div className={styles.card}>
          <div style={{ color: '#888', fontSize: 13 }}>Avg Sessions / Student</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}><span className={styles.number}>{(sessions.length / Math.max(students.length,1)).toFixed(2)}</span></div>
          <div style={{ color: '#999', fontSize: 12 }}>Last 6 months</div>
        </div>
      </div>

      <div className={styles.chartsRow}>
        <div className={styles.chartCard}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
            {(() => {
              const rawCompleted = sessions.filter(s => {
                const st = String(s.status || s.state || '').toLowerCase();
                return st === 'completed' || st === 'done' || st === 'finished';
              }).length;
              const hasStatusField = sessions.some(s => s.status !== undefined && s.status !== null);
              const completedSessions = hasStatusField ? rawCompleted : sessions.length;
              const studentsCompleted = studentsWithSessions.filter(s => s.hasSession).length;
              const completionRate = Math.round((completedSessions / Math.max(sessions.length, 1)) * 100);

              return (
                <>
                  <div className={styles.card} style={{ flex: 1 }}>
                    <div style={{ color: '#888', fontSize: 13 }}>Completed Sessions</div>
                    <div style={{ fontSize: 24, fontWeight: 700 }}><span className={styles.number}>{completedSessions}</span></div>
                    <div style={{ color: '#999', fontSize: 12 }}>{hasStatusField ? 'Based on session status' : 'No status field — showing total'}</div>
                  </div>

                  <div className={styles.card} style={{ flex: 1 }}>
                    <div style={{ color: '#888', fontSize: 13 }}>Students Completed</div>
                    <div style={{ fontSize: 24, fontWeight: 700 }}><span className={styles.number}>{studentsCompleted}</span></div>
                    <div style={{ color: '#999', fontSize: 12 }}>{studentsWithSessions.length} students assigned</div>
                  </div>

                  <div className={styles.card} style={{ flex: 1 }}>
                    <div style={{ color: '#888', fontSize: 13 }}>Completion Rate</div>
                    <div style={{ fontSize: 24, fontWeight: 700 }}><span className={styles.number}>{isNaN(completionRate) ? 0 : completionRate}%</span></div>
                    <div style={{ color: '#999', fontSize: 12 }}>Of all sessions</div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        <div className={styles.donutCard}>
          <div style={{ fontSize: 14, color: '#444', marginBottom: 8 }}>Students: With vs Without Sessions</div>
          <svg width="240" height="140" viewBox="0 0 240 140">
            {(() => {
              const withCount = studentsWithSessions.filter(s=>s.hasSession).length;
              const withoutCount = students.length - withCount;
              const total = Math.max(withCount + withoutCount, 1);
              const cx = 120, cy = 70, r = 40;
              const withAngle = (withCount/total) * Math.PI * 2;
              const x1 = cx + r * Math.cos(-Math.PI/2);
              const y1 = cy + r * Math.sin(-Math.PI/2);
              const x2 = cx + r * Math.cos(-Math.PI/2 + withAngle);
              const y2 = cy + r * Math.sin(-Math.PI/2 + withAngle);
              const large = withAngle > Math.PI ? 1 : 0;
              const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
              return (
                <g>
                  <path d={path} fill="#10b981" />
                  <circle cx={cx} cy={cy} r={r} fill="none" stroke="#eef2ff" strokeWidth={12} />
                  <text x={120} y={70} textAnchor="middle" fontSize={12} fill="#1e40af">{`${withCount}/${total}`}</text>
                </g>
              );
            })()}
          </svg>
          <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
            <div><span style={{ color: '#10b981' }}>●</span> With sessions: <span className={styles.number}>{studentsWithSessions.filter(s=>s.hasSession).length}</span></div>
            <div><span style={{ color: '#ddd' }}>●</span> Without: <span className={styles.number}>{students.length - studentsWithSessions.filter(s=>s.hasSession).length}</span></div>
          </div>
        </div>
      </div>

      <div className={styles.bottomGrid}>
        <div className={styles.tableCard}>
          <div style={{ fontSize: 14, color: '#444', marginBottom: 10 }}>Recent Sessions</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#666', fontSize: 12 }}>
                <th style={{ padding: '8px 6px' }}>When</th>
                <th style={{ padding: '8px 6px' }}>Agenda</th>
                <th style={{ padding: '8px 6px' }}>Student</th>
              </tr>
            </thead>
            <tbody>
              {(sessions.slice(0,10) || []).map(s => (
                <tr key={s.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 6px', fontSize: 13 }}>{s.timing ? new Date(s.timing).toLocaleString() : ''}</td>
                  <td style={{ padding: '8px 6px', fontSize: 13 }}>{s.agenda}</td>
                  <td style={{ padding: '8px 6px', fontSize: 13 }}>{s.student_name || s.studentName || s.student_id || s.studentId}</td>
                </tr>
              ))}
              {sessions.length === 0 && <tr><td colSpan={3} style={{ padding: 12 }}>No sessions found.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className={styles.tableCard}>
          <div style={{ fontSize: 14, color: '#444', marginBottom: 10 }}>Students</div>
          <div className={styles.tableWrapper}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#666', fontSize: 12 }}>
                  <th style={{ padding: '8px 6px' }}>Name</th>
                  <th style={{ padding: '8px 6px' }}>Email</th>
                  <th style={{ padding: '8px 6px' }}>#Sessions</th>
                </tr>
              </thead>
              <tbody>
                {studentsWithSessions.map(st => (
                  <tr key={st.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px 6px', fontSize: 13 }}>{st.name || st.studentName || st.id}</td>
                    <td style={{ padding: '8px 6px', fontSize: 13 }}>{st.email || ''}</td>
                    <td style={{ padding: '8px 6px', fontSize: 13 }}><span className={styles.number}>{st.sessions || 0}</span></td>
                  </tr>
                ))}
                {studentsWithSessions.length === 0 && <tr><td colSpan={3} style={{ padding: 12 }}>No students found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
