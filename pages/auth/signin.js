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

      <button className={styles.googleButton}>
        <div className={styles.googleIconWrapper}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
        </div>
        <span className={styles.googleButtonText}>Continue with Gmail</span>
      </button>

      <div className={styles.divider}>or</div>

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
        <span><strong>Don't have an account?</strong></span>
        {/* Important: Sign Up should link back to the signup page, ideally in the same tab since we are already in a new tab */}
        <Link href="/auth/signup" className={styles.outlineButtonRedText}>
          Sign Up
        </Link>
      </div>
    </AuthLayout>
  );
}
