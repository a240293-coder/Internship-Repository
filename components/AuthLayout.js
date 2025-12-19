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
        {/* Logo - Fixed Position */}
        <div className={styles.logoWrapper}>
          <span className={styles.logoTextMain}>Learn</span>
          <span className={styles.logoTextHighlight}>Better</span>
        </div>

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
