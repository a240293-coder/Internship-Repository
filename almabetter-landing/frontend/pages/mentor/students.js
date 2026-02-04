

import React, { useEffect, useState } from 'react';
import {
  FiUser,
  FiMail,
  FiBook,
  FiStar,
  FiTarget,
  FiDownload,
  FiSettings,
  FiSearch,
  FiChevronRight
} from 'react-icons/fi';
import api, { API_HOST } from '../../lib/api';
import DashboardLayout from '../../components/DashboardLayout';
import styles from './MentorStudents.module.css';

function MentorStudentsPage() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get('/mentor-dashboard/students');
        const list = res && res.data ? res.data : [];
        const normalized = [];

        if (Array.isArray(list) && list.length > 0 && list[0] && list[0].assignments) {
          list.forEach((g) => {
            const first = g.assignments && g.assignments[0] ? g.assignments[0] : {};
            normalized.push({
              id: first.id || null,
              student_name: g.student_name || 'Unknown',
              student_email: g.student_email || null,
              desired_domains: (g.assignments || []).map(a => a.desired_domain || a.desiredDomain).filter(Boolean),
              interests: (first && first.interests) || [],
              goals: first && (first.goals || first.description) || '',
              status: (g.assignments && g.assignments[0]?.status) || 'assigned',
              resume_url: first && first.resume_url,
              assignments: g.assignments || []
            });
          });
        } else {
          list.forEach(f => {
            normalized.push({
              id: f.id || f.form_id || f._id,
              student_name: f.student_name || 'Unknown',
              student_email: f.student_email || null,
              desired_domains: [f.desired_domain || f.desiredDomain].filter(Boolean),
              interests: (typeof f.interests === 'string') ? (JSON.parse(f.interests || '[]') || []) : (Array.isArray(f.interests) ? f.interests : []),
              goals: f.goals || f.description || '',
              status: f.status || 'assigned',
              resume_url: f.resume_url,
              assignments: [f]
            });
          });
        }

        setStudents(normalized);
        if (normalized.length > 0) setSelectedStudent(normalized[0]);
        setError('');
      } catch (err) {
        setError('Failed to fetch students.');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const handleStatusChange = async (newStatus) => {
    if (!selectedStudent) return;
    try {
      const normalizedStatus = String(newStatus).toLowerCase();
      await api.put(`/mentor-dashboard/students/${selectedStudent.id}/status`, { status: normalizedStatus });

      const updatedStudents = students.map(s =>
        s.id === selectedStudent.id ? { ...s, status: normalizedStatus } : s
      );
      setStudents(updatedStudents);
      setSelectedStudent({ ...selectedStudent, status: normalizedStatus });

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('statusUpdated', {
          detail: { formId: selectedStudent.id, status: normalizedStatus }
        }));
      }
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const downloadResume = async (resumeUrl) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const backend = API_HOST || 'http://localhost:5000';
      const path = String(resumeUrl).startsWith('http') ? resumeUrl : `${backend}${resumeUrl}`;
      const res = await fetch(path, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (e) {
      alert('Failed to download resume');
    }
  };

  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const filteredStudents = students.filter(s =>
    s.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.student_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="Assigned Students" role="mentor">
      {error && <div className={styles.errorAlert}>{error}</div>}

      <div className={styles.splitPaneContainer}>
        {/* Left Panel: Student List */}
        <div className={styles.leftPanel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Students ({students.length})</h2>
            <div className={styles.searchWrapper}>
              <FiSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search students..."
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.studentList}>
            {loading ? (
              <div className={styles.emptyState}>Loading students...</div>
            ) : filteredStudents.length === 0 ? (
              <div className={styles.emptyState}>No students found.</div>
            ) : (
              filteredStudents.map((s) => (
                <div
                  key={s.id}
                  className={`${styles.studentItem} ${selectedStudent?.id === s.id ? styles.studentItemActive : ''}`}
                  onClick={() => setSelectedStudent(s)}
                >
                  <div className={styles.studentAvatar}>{getInitials(s.student_name)}</div>
                  <div className={styles.studentMainInfo}>
                    <span className={styles.studentName}>{s.student_name}</span>
                    <span className={styles.studentDomain}>{s.desired_domains[0] || 'General'}</span>
                  </div>
                  <div className={`${styles.statusIndicator} ${styles['status-' + (s.status || 'assigned')]}`} />
                  <FiChevronRight className={styles.chevronIcon} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel: Detailed View */}
        <div className={styles.rightPanel}>
          {selectedStudent ? (
            <>
              <div className={styles.studentDetailHeader}>
                <div className={styles.detailProfile}>
                  <div className={`${styles.studentAvatar} ${styles.largeAvatar}`}>
                    {getInitials(selectedStudent.student_name)}
                  </div>
                  <div className={styles.detailInfo}>
                    <h2>{selectedStudent.student_name}</h2>
                    <div className={styles.detailEmail}>
                      <FiMail size={14} style={{ marginRight: 6 }} />
                      {selectedStudent.student_email || 'No email provided'}
                    </div>
                    <div className={styles.domainBadgeLarge}>
                      {selectedStudent.desired_domains.join(', ') || 'No domain selected'}
                    </div>
                  </div>
                </div>
                <div className={`${styles.statusBadge} ${styles['status-' + selectedStudent.status + '-badge']}`}>
                  {selectedStudent.status?.replace('_', ' ')}
                </div>
              </div>

              <div className={styles.detailContent}>
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}><FiStar /> Interests</h3>
                  <div className={styles.interestsList}>
                    {selectedStudent.interests.length > 0 ? (
                      selectedStudent.interests.map((it, i) => (
                        <span key={i} className={styles.interestTag}>{it}</span>
                      ))
                    ) : <p className={styles.sectionContent}>No interests listed.</p>}
                  </div>
                </div>

                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}><FiTarget /> Career Goals</h3>
                  <p className={styles.sectionContent}>
                    {selectedStudent.goals || 'No career goals specified.'}
                  </p>
                </div>

                <div className={styles.actionButtons}>
                  {selectedStudent.resume_url && (
                    <button
                      className={styles.downloadBtn}
                      onClick={() => downloadResume(selectedStudent.resume_url)}
                    >
                      <FiDownload /> View Resume
                    </button>
                  )}

                  <select
                    className={styles.statusSelect}
                    value={selectedStudent.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                  >
                    <option value="assigned">Status: Assigned</option>
                    <option value="in_progress">Status: In Progress</option>
                    <option value="completed">Status: Completed</option>
                    <option value="rejected">Status: Rejected</option>
                  </select>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              <FiUser className={styles.emptyIcon} />
              <p>Select a student from the list to view their details.</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .split-pane-wrapper {
          padding: 1rem 0;
        }
      `}</style>
    </DashboardLayout>
  );
}

export default MentorStudentsPage;

