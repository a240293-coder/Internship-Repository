import styles from './HiringPartners.module.css';

export default function HiringPartners() {
  const companies = [
    'Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 
    'Netflix', 'Adobe', 'IBM', 'Oracle', 'Salesforce',
    'Walmart', 'Intel', 'Cisco', 'SAP', 'Accenture'
  ];

  return (
    <section className={styles.hiringPartners}>
      <div className={styles.container}>
        <h2 className={styles.title}>Our Hiring Partners</h2>
        <p className={styles.subtitle}>
          Join a network of 1200+ companies hiring our graduates
        </p>

        <div className={styles.logosGrid}>
          {companies.map((company, index) => (
            <div key={index} className={styles.logoCard}>
              <span className={styles.companyName}>{company}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
