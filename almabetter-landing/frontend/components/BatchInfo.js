import { useState } from 'react';
import styles from './BatchInfo.module.css';
import CareerExpertPanel from './CareerExpertPanel';

export default function BatchInfo() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const openPanel = () => {
    setIsPanelOpen(true);
  };

  const closePanel = () => {
    setIsPanelOpen(false);
  };

  return (
    <>
      <section className={styles.batchInfo}>
        <div className={styles.container}>
          <div className={styles.content}>
            <div className={styles.batchDates}>
              <span className={styles.label}>Next Batch Starts:</span>
              <div className={styles.dates}>
                <span className={styles.date}>January 15, 2025</span>
                <span className={styles.separator}>•</span>
                <span className={styles.date}>March 1, 2025</span>
                <span className={styles.separator}>•</span>
                <span className={styles.date}>May 10, 2025</span>
              </div>
            </div>
            <button className={styles.btnExpert} onClick={openPanel} aria-label="Open form to talk to a career expert">Talk to Career Expert</button>
          </div>
        </div>
      </section>
      <CareerExpertPanel isOpen={isPanelOpen} onClose={closePanel} />
    </>
  );
}
