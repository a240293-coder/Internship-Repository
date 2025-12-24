import Link from 'next/link';
import styles from '../../styles/Auth.module.css';
import AuthLayout from '../../components/AuthLayout';

export default function SignIn() {
  return (
    <AuthLayout title="Sign In">
      <h1 className={styles.title}>Welcome back 👋</h1>
      <p className={styles.subtitle}>
        Sign in to continue your journey
      </p>

      <div className={styles.inputGroup}>
        <input 
          type="email" 
          placeholder="Email Address" 
          className={styles.input} 
        />
      </div>

      <div className={styles.inputGroup}>
        <input 
          type="password" 
          placeholder="Password" 
          className={styles.input} 
        />
      </div>

      <Link href="#" className={styles.forgotPassword}>
        Forgot Password?
      </Link>

      <button className={styles.primaryButton}>
        Sign In
      </button>

      <div className={styles.bottomText}>
        <span><strong>Don&#39;t have an account?</strong></span>
        {/* Important: Sign Up should link back to the signup page, ideally in the same tab since we are already in a new tab */}
        <Link href="/auth/signup" className={styles.outlineButtonRedText}>
          Sign Up
        </Link>
      </div>
    </AuthLayout>
  );
}
