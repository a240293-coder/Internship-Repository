import React, { useEffect, useState, useMemo } from 'react';
import api from '../lib/api';
import styles from './AdminKPIDashboard.module.css';

export default function AdminKPIDashboard() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function safeGet(url) {
      try {
        const res = await api.get(url);
        return res && res.data ? res.data : null;
      } catch (err) {
        console.warn(`Failed to fetch ${url}:`, err && err.message ? err.message : err);
        return null;
      }
    }

    async function fetchAll() {
      setLoading(true);
      let localError = false;
      try {
        const dashboardData = await safeGet('/admin/dashboard');
        const formsData = await safeGet('/admin/forms');
        const completedSessions = await safeGet('/admin/history/completed-sessions');

        // Try live-sessions with small retry if rate-limited
        let liveSessions = null;
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            const ls = await api.get('/admin/live-sessions');
            liveSessions = ls && ls.data ? ls.data : null;
            break;
          } catch (err) {
            const msg = (err && err.message) || '';
            if (msg.toLowerCase().includes('too many requests') || (err && err.response && err.response.status === 429)) {
              // wait and retry
              await new Promise(r => setTimeout(r, 300 * (attempt + 1)));
              continue;
            }
            console.warn('live-sessions fetch failed:', err);
            break;
          }
        }

        const mentorsData = await safeGet('/mentor/all');

        if (!mounted) return;

        setStats({
          mentors: dashboardData?.mentors || 0,
          students: dashboardData?.students || 0,
          studentForms: Array.isArray(formsData) ? formsData.length : 0,
          sessions: dashboardData?.sessions || 0,
          completedSessions: Array.isArray(completedSessions?.data) ? completedSessions.data.length : 0,
        });

        setSessions(Array.isArray(liveSessions) ? liveSessions : (liveSessions && liveSessions.data) ? liveSessions.data : []);
        setMentors(Array.isArray(mentorsData) ? mentorsData : (mentorsData && mentorsData.data) ? mentorsData.data : []);

        // mark an error if any of the main calls failed
        if (!dashboardData || formsData === null || completedSessions === null || mentorsData === null) localError = true;
      } catch (e) {
        console.error('Failed to fetch admin KPI data', e);
        localError = true;
      } finally {
        if (mounted) {
          setLoading(false);
          if (localError) setFetchError('Some data failed to load (rate limit or network).');
        }
      }
    }

    fetchAll();
    return () => { mounted = false; };
  }, []);

  const months = useMemo(() => {
    const arr = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      arr.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`);
    }
    return arr;
  }, []);

  const sessionsByMonth = useMemo(() => {
    const map = {};
    months.forEach(m => map[m]=0);
    sessions.forEach(s => {
      const d = new Date(s.created_at || s.timing || s.createdAt || Date.now());
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      if (!(key in map)) map[key]=0;
      map[key]++;
    });
    return months.map(m => ({ month: m, count: map[m] || 0 }));
  }, [sessions, months]);

  const topMentors = useMemo(() => {
    const counts = {};
    sessions.forEach(s => { const id = s.mentor_id || s.mentorId || s.mentor_id || 'unknown'; counts[id] = (counts[id] || 0) + 1; });
    return mentors.slice(0,10).map(m => ({ id: m.id, name: m.name || m.full_name || m.email, sessions: counts[m.id] || 0 }));
  }, [mentors, sessions]);

  if (loading) return <div>Loading admin dashboard...</div>;

  return (
    <div>
      {fetchError && <div style={{color:'#b91c1c', padding:'8px 12px', margin:'0 0 12px 0', background:'#fff5f5', borderRadius:6}}>{fetchError}</div>}
      <div className={styles.container}>
      {/* Header removed as requested */}

      <div className={styles.kpis}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Total Mentors</div>
          <div className={styles.kpiValue}>{stats.mentors}</div>
          <div className={styles.kpiDesc}>All mentors registered</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Registered Students</div>
          <div className={styles.kpiValue}>{stats.students}</div>
          <div className={styles.kpiDesc}>Active student accounts</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Student Forms</div>
          <div className={styles.kpiValue}>{stats.studentForms}</div>
          <div className={styles.kpiDesc}>Interest forms submitted</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Sessions Booked</div>
          <div className={styles.kpiValue}>{stats.sessions}</div>
          <div className={styles.kpiDesc}>Live sessions booked</div>
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.left}>
          <div className={styles.card}>
            <div style={{fontSize:14,fontWeight:700,color:'#334155',marginBottom:8}}>Sessions Trend (last 6 months)</div>
            <svg viewBox="0 0 600 180" width="100%" height="180">
              {(() => {
                const w = 560; const h = 120; const padX = 20; const padY = 20;
                const max = Math.max(...sessionsByMonth.map(d=>d.count),1);
                return (
                  <g>
                    {sessionsByMonth.map((d,i)=>{
                      const x = padX + (i*(w/(sessionsByMonth.length-1)));
                      const y = padY + (h - (d.count/max)*h);
                      return (<circle key={d.month} cx={x} cy={y} r={4} fill="#3b82f6" />);
                    })}
                    {/* polyline */}
                    <polyline fill="none" stroke="#3b82f6" strokeWidth={2} points={sessionsByMonth.map((d,i)=>{ const x = padX + (i*(w/(sessionsByMonth.length-1))); const y = padY + (h - (d.count/max)*h); return `${x},${y}`; }).join(' ')} />
                    {/* x labels */}
                    {sessionsByMonth.map((d,i)=>{ const x = padX + (i*(w/(sessionsByMonth.length-1))); return <text key={d.month} x={x} y={h+padY+14} fontSize={11} fill="#666" textAnchor="middle">{d.month.split('-')[1]}</text>; })}
                  </g>
                );
              })()}
            </svg>
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.card}>
            <div style={{fontSize:14,fontWeight:700,color:'#334155',marginBottom:8}}>Top Mentors (by sessions)</div>
            <table className={styles.table}>
              <thead>
                <tr><th>Mentor</th><th>Sessions</th></tr>
              </thead>
              <tbody>
                {topMentors.map(m=> (
                  <tr key={m.id}><td>{m.name}</td><td>{m.sessions}</td></tr>
                ))}
                {topMentors.length===0 && <tr><td colSpan={2}>No mentors data</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
