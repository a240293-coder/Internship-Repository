import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './Hero.module.css';

export default function Hero() {
  const [isOpening, setIsOpening] = useState(false);
  const reopenTimerRef = useRef(null);

  const handleApplyClick = useCallback(() => {
    if (isOpening) return;
    setIsOpening(true);

    if (reopenTimerRef.current) {
      clearTimeout(reopenTimerRef.current);
    }

    if (typeof window !== 'undefined') {
      const { origin, search } = window.location;
      const applyUrl = new URL('/apply', origin);

      if (search) {
        const currentParams = new URLSearchParams(search);
        currentParams.forEach((value, key) => {
          applyUrl.searchParams.append(key, value);
        });
      }

      window.open(applyUrl.toString(), '_blank', 'noopener,noreferrer');
    }

    reopenTimerRef.current = setTimeout(() => {
      setIsOpening(false);
      reopenTimerRef.current = null;
    }, 1200);
  }, [isOpening]);

  useEffect(() => () => {
    if (reopenTimerRef.current) {
      clearTimeout(reopenTimerRef.current);
    }
  }, []);

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
              <button
                type="button"
                className={`${styles.btnPrimary} ${isOpening ? styles.btnPrimaryLoading : ''}`}
                aria-label="Apply for the MS in Computer Science program"
                aria-busy={isOpening ? 'true' : 'false'}
                onClick={handleApplyClick}
                disabled={isOpening}
              >
                {isOpening ? 'Opening…' : 'Apply Now'}
              </button>
              {/* batch info removed per request */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}