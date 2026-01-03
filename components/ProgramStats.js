import styles from './ProgramStats.module.css';

export default function ProgramStats() {
  return (
    <div className={styles.infoBar}>
      <div className={styles.infoColumn}>
        <div className={styles.infoValue}>100%</div>
        <div className={styles.infoLabel}>Online</div>
        <div className={styles.infoSublabel}>Live Classes</div>
      </div>
      <div className={styles.infoDivider}></div>
      <div className={styles.infoColumn}>
        <div className={styles.infoValue}>12–15 Months</div>
        <div className={styles.infoLabel}>Course Duration</div>
      </div>
      <div className={styles.infoDivider}></div>
      <div className={styles.infoColumn}>
        <div className={styles.infoValue}>100%</div>
        <div className={styles.infoLabel}>Job Assurance</div>
        <div className={styles.infoSublabel}>Placement Services</div>
      </div>
      <div className={styles.infoDivider}></div>
      <div className={styles.infoColumn}>
        <div className={styles.infoLabel}><span className={styles.redText}>Degree</span> Eligibility</div>
        <div className={styles.infoSublabel}>Graduates & Professional</div>
      </div>
    </div>
  );
}