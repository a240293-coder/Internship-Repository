import React from 'react';
import styles from './ProfileHeader.module.css';

export default function ProfileHeader({ name, sub }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.meta}>
        <div className={styles.name}>{name || 'Member'}</div>
        {sub && <div className={styles.sub}>{sub}</div>}
      </div>
    </div>
  );
}
