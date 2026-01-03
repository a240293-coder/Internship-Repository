import styles from './Stats.module.css';

export default function Stats() {
  const stats = [
    { value: '40 LPA', label: 'Highest Package', icon: '💰' },
    { value: '8 LPA', label: 'Average Salary', icon: '📊' },
    { value: '1200+', label: 'Hiring Partners', icon: '🤝' },
    { value: '95%', label: 'Placement Rate', icon: '🎯' },
  ];

  return (
    <section className={styles.stats} id="outcomes">
      <div className={styles.container}>
        <h2 className={styles.title}>
          Program <span className={styles.titleHighlight}>Statistics</span>
        </h2>
        <p className={styles.subtitle}>Real outcomes from our graduates</p>

        <div className={styles.grid}>
          {stats.map((stat, index) => (
            <div key={index} className={styles.statCard}>
              <div className={styles.statIcon}>{stat.icon}</div>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
