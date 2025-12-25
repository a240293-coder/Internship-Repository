import Head from 'next/head';
import styles from '../styles/Auth.module.css';
import TestimonialCard from './TestimonialCard';

const AuthLayout = ({ children, title }) => {
  return (
    <>
      <Head>
        <title>{title} | LearnBetter</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div className={styles.container}>
        {/* Logo - Fixed Position (click to reload) */}
        <button
          type="button"
          className={styles.logoWrapper}
          aria-label="Reload page"
          onClick={() => {
            if (typeof window !== 'undefined') {
              try {
                window.location.reload();
              } catch (e) {
                // fallback: navigate to same path
                window.location.href = window.location.href;
              }
            }
          }}
        >
          <span className={styles.logoTextMain}>Learn</span>
          <span className={styles.logoTextHighlight}>Better</span>
        </button>

        {/* Left Side - Testimonial */}
        <TestimonialCard />

        {/* Right Side - Form */}
        <div className={styles.rightSection}>
          <div className={styles.formContainer}>
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthLayout;
