import Image from 'next/image';
import styles from './ProgramValue.module.css';

export default function ProgramValue() {
  return (
    <section className={styles.programValue}>
      <div className={styles.container}>
        <h2 className={styles.title}>
          Unlock Global Internship & Career Opportunities with Woolf + LearnBetter
        </h2>

        <div className={styles.content}>
          <div className={styles.visual}>
            <div className={styles.visualPlaceholder}>
              <Image
                src="/img.jpg"
                alt="Global recognition illustration"
                className={styles.visualImage}
                width={840}
                height={560}
                sizes="(max-width: 768px) 100vw, 40vw"
                priority
              />
            </div>
          </div>

          <div className={styles.description}>
            <h3 className={styles.descTitle}>
              Globally Recognized Degree with Internship Advantage
            </h3>
            <p className={styles.descText}>
              Our Computer Science program is globally accredited through Woolf University and tailored for students seeking
              internship-ready skills. You build practical experience through hands-on projects, mentor guidance, and real-world
              practice that prepares you for entry-level roles.
            </p>
            <p className={styles.descText}>
              The curriculum focuses on project-based learning, resume-ready outcomes, and global exposure — ideal for early-career
              students launching their careers with meaningful internship placements.
            </p>
            <ul className={styles.benefitsList}>
              <li><span className={styles.check}>✓</span> Recognized by employers for internships and entry-level roles</li>
              <li><span className={styles.check}>✓</span> Equivalent to traditional degrees with practical exposure</li>
              <li><span className={styles.check}>✓</span> Access to global internship opportunities</li>
              <li><span className={styles.check}>✓</span> Strong foundation for early career growth</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
