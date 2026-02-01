import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../lib/api';
import stylesLocal from './sessions.module.css';

export default function MentorSessionsPage() {
  const [sessions, setSessions] = useState([]);
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

  const markComplete = async (id, idx) => {
    if (!confirm('Mark this session as completed?')) return;
    try {
      setLoading(true);
      await api.post(`/mentor/sessions/${id}/complete`);
      // update UI
      setSessions((prev) => {
        const copy = [...prev];
        if (copy[idx]) copy[idx] = { ...copy[idx], status: 'completed' };
        return copy;
      });
      try { window.dispatchEvent(new Event('mentor-sessions-updated')); } catch (e) { /* ignore */ }
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to mark complete');
    } finally {
      setLoading(false);
    }
  };

  const formatTiming = (t) => {
    if (!t) return '—';
    try {
      const raw = String(t);
      // Try Date parsing first (handles ISO strings). Then format to YYYY-MM-DD HH:MM
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
      // Fallback: remove fractional seconds and trailing Z
      return raw.replace(/\.\d+Z?$/, '').replace(/Z$/, '');
    } catch (e) {
      return String(t).replace(/Z$/, '');
    }
  };

  return (
    <DashboardLayout title="Scheduled Sessions" role="mentor">
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h2>Scheduled Sessions</h2>
        {error && <div className="error-message">{error}</div>}
        {sessions.length === 0 && <p>No sessions found.</p>}

        <div style={{ overflowX: 'auto', background: 'transparent', padding: 6 }}>
          <table style={{ minWidth: 900, borderCollapse: 'collapse', background: 'transparent', borderRadius: 0, overflow: 'visible', fontSize: '14px' }}>
            <thead style={{ background: 'transparent' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #e6e6e6', width: 64, whiteSpace: 'nowrap' }}>Sr.No</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #e6e6e6', whiteSpace: 'nowrap' }}>Agenda</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #e6e6e6', whiteSpace: 'nowrap' }}>Description</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #e6e6e6', whiteSpace: 'nowrap' }}>Student</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #e6e6e6', whiteSpace: 'nowrap' }}>Timing</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #e6e6e6', whiteSpace: 'nowrap' }}>Link</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #e6e6e6', whiteSpace: 'nowrap' }}>Status</th>
                <th style={{ textAlign: 'center', padding: '8px 12px', borderBottom: '1px solid #e6e6e6', whiteSpace: 'nowrap' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s, i) => (
                <tr key={s.id || i} style={{ borderBottom: '1px solid #e6e6e6' }}>
                  <td style={{ padding: '8px 12px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>{i + 1}</td>
                  <td style={{ padding: '8px 12px', verticalAlign: 'top', fontWeight: 700, whiteSpace: 'nowrap' }}>{s.agenda || 'Session'}</td>
                  <td style={{ padding: '8px 12px', verticalAlign: 'top', color: '#556070', whiteSpace: 'nowrap' }}>{s.description || '—'}</td>
                  <td style={{ padding: '8px 12px', verticalAlign: 'top', color: '#0b74de', whiteSpace: 'nowrap' }}>{s.student_name || s.student_id || '—'}</td>
                  <td style={{ padding: '8px 12px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>{formatTiming(s.timing || s.timingDate || s.timing_time)}</td>
                  <td style={{ padding: '8px 12px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>{s.meeting_link ? (<a href={s.meeting_link} target="_blank" rel="noreferrer">Open</a>) : '—'}</td>
                  <td style={{ padding: '8px 12px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>{(s.status || 'scheduled').replace(/_/g, ' ')}</td>
                  <td style={{ padding: '8px 12px', verticalAlign: 'top', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <select
                      className={stylesLocal.actionSelect}
                      disabled={loading}
                      onChange={async (e) => {
                        const val = e.target.value;
                        if (!val) return;
                        if (!confirm(`Set session to '${val}'?`)) {
                          e.target.value = '';
                          return;
                        }
                        try {
                          setLoading(true);
                          await api.post(`/mentor/sessions/${s.id}/status`, { status: val });
                          setSessions((prev) => {
                            const copy = [...prev];
                            if (copy[i]) copy[i] = { ...copy[i], status: val };
                            return copy;
                          });
                          // notify other parts of the app (dashboard) to refresh their session stats
                          try { window.dispatchEvent(new Event('mentor-sessions-updated')); } catch (e) { /* ignore */ }
                        } catch (err) {
                          alert(err?.response?.data?.message || 'Failed to update status');
                        } finally {
                          setLoading(false);
                          e.target.value = '';
                        }
                      }}
                    >
                      <option value="">Actions</option>
                      <option value="completed">Completed</option>
                      <option value="canceled">Canceled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
