import React from 'react';
import styles from './AdminStats.module.css';

export default function AdminStats({ stats }) {
  // stats: { mentors, studentForms, students, ... }
  return (
    <div className={styles.statsGrid}>
      <div className={styles.card}>
        <div className={styles.value}>{stats.mentors}</div>
        <div className={styles.label}>Total Mentors</div>
      </div>
      <div className={styles.card}>
        <div className={styles.value}>{stats.studentForms}</div>
        <div className={styles.label}>Student Forms</div>
      </div>
      <div className={styles.card}>
        <div className={styles.value}>{stats.students}</div>
        <div className={styles.label}>Registered Students</div>
      </div>
      {/* Add more cards as needed */}
    </div>
  );
}
