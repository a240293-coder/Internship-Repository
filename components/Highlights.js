import styles from './Highlights.module.css';

export default function Highlights() {
  const highlights = [
    { icon: '🎓', title: 'Hands-on Internship Projects', subtitle: 'Build real-world skills through practical projects and simulations.' },
    { icon: '🤝', title: 'Industry-Mentor Guidance', subtitle: 'Learn from experienced mentors in top companies.' },
    { icon: '🛠️', title: 'Real-World Tools & Tech Stack', subtitle: 'Master industry-standard tools and technologies.' },
    { icon: '📈', title: 'Placement & Internship Support', subtitle: 'Get personalized support for internships and job placements.' },
    { icon: '💼', title: 'Career Readiness Training', subtitle: 'Develop the skills and confidence for professional success.' },
    { icon: '🎯', title: 'Internship Opportunities', subtitle: 'Access exclusive internship programs and networking events.' },
  ];

  return (
    <section className={styles.highlights} id="programs">
      <div className={styles.container}>
        <h2 className={styles.title}>Key Program <span className={styles.highlightSpan}>Highlights</span></h2>
        <p className={styles.subtitle}>
          Designed to make you internship-ready with real-world skills
        </p>

        <div className={styles.grid}>
          {highlights.map((item, index) => (
            <div key={index} className={styles.card}>
              <div className={styles.icon}>{item.icon}</div>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardSubtitle}>{item.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
