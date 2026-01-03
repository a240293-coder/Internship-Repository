import Image from 'next/image';
import styles from '../styles/Auth.module.css';

const TestimonialCard = () => {
  return (
    <div className={styles.leftSection}>
      <div className={styles.testimonialCard}>
        <div className={styles.profileHeader}>
          <Image 
            src="/profile.jpg" 
            alt="Profile" 
            className={styles.profileImage} 
            width={64}
            height={64}
          />
          <div className={styles.profileInfo}>
            <h3>Priya Sharma</h3>
            <p>Non-Tech ➝ Data Analyst</p>
            <span className={styles.companyBadge}>Paisabazaar</span>
          </div>
        </div>
        <p className={styles.quote}>
          &quot;The structured curriculum and mentorship at LearnBetter helped me transition from a sales role to a Data Analyst position in just 6 months. Best decision of my career!&quot;
        </p>
      </div>

      <div className={styles.bottomSection}>
        <h2 className={styles.motivatingLine}>
          Take a moonshot at your tech career with LearnBetter
        </h2>
        <div className={styles.logoGrid}>
          <span className={styles.logoText}>Myntra</span>
          <span className={styles.logoText}>Swiggy</span>
          <span className={styles.logoText}>Zomato</span>
          <span className={styles.logoText}>Ola</span>
          <span className={styles.logoText}>HSBC</span>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
