import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.headline}>
            MS in Computer Science: Cloud Computing & AI System Design
          </h1>
          <p className={styles.subheadline}>
            Master advanced cloud architecture, AI/ML system design, and become a leader in next-gen technology. 
            Get globally recognized credentials and secure high-paying roles at top tech companies.
          </p>
          
          <div className={styles.ctaSection}>
            <div className={styles.primaryActions}>
              <button className={styles.btnPrimary} aria-label="Apply for the MS in Computer Science program">Apply Now</button>
              <div className={styles.secondaryContent}>
                <div className={styles.batchInfo}>Batch starting on 26th Dec '25</div>
                <a href="#" className={styles.downloadLink} aria-label="Download program brochure">
                  <svg className={styles.downloadIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Download Brochure
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}